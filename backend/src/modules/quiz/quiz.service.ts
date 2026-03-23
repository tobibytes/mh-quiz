import { ApiError } from "../shared/api-error.js";
import { quizRepo } from "./quiz.repo.js";

function dateInTimeZone(timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());

  const map = Object.fromEntries(parts.filter((p) => p.type !== "literal").map((p) => [p.type, p.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

export const quizService = {
  getTodayQuizForUser(userClientId: string, fingerprintHash?: string, name?: string, school?: string, schoolEmail?: string, timezone = "America/New_York") {
    const today = dateInTimeZone(timezone);
    const quiz = quizRepo.getQuizForDate(today);
    const user = quizRepo.upsertUser({ clientId: userClientId, fingerprintHash, name, school, schoolEmail });

    if (!quiz) {
      return { quiz: null, questions: [], hasAttempted: false };
    }

    const attempt = quizRepo.getAttemptForQuiz(quiz.id, user.id);
    const questions = quizRepo.getQuestionsByQuizId(quiz.id);
    const options = quizRepo.getOptionsByQuizId(quiz.id);

    return {
      quiz,
      questions: questions.map((q) => ({
        id: q.id,
        prompt: q.prompt,
        responseType: q.response_type,
        autoGrade: Boolean(q.auto_grade),
        options: options.filter((o) => o.question_id === q.id).map((o) => ({ id: o.id, label: o.label }))
      })),
      hasAttempted: Boolean(attempt)
    };
  },

  submitQuizAttempt(input: {
    userClientId: string;
    fingerprintHash?: string;
    name?: string;
    school?: string;
    schoolEmail?: string;
    quizId: string;
    answers: Array<{ questionId: string; userAnswer?: string }>;
  }) {
    const todayQuiz = quizRepo.getQuizForDate(dateInTimeZone("America/New_York"));
    if (!todayQuiz || todayQuiz.id !== input.quizId) {
      throw new ApiError(400, "Quiz is not currently active for today");
    }

    const user = quizRepo.upsertUser({
      clientId: input.userClientId,
      fingerprintHash: input.fingerprintHash,
      name: input.name,
      school: input.school,
      schoolEmail: input.schoolEmail
    });
    const existing = quizRepo.getAttemptForQuiz(input.quizId, user.id);
    if (existing) {
      throw new ApiError(409, "User has already attempted this quiz");
    }

    const questions = quizRepo.getQuestionsByQuizId(input.quizId);
    if (questions.length === 0) {
      throw new ApiError(400, "Quiz has no questions");
    }

    const byId = new Map(questions.map((q) => [q.id, q]));
    const gradedAnswers = input.answers.map((ans) => {
      const official = byId.get(ans.questionId);
      if (!official) {
        throw new ApiError(400, `Invalid questionId: ${ans.questionId}`);
      }

      const gradedImmediately = Boolean(official.auto_grade);
      const normalizedUser = ans.userAnswer?.trim();
      const normalizedCorrect = official.correct_answer?.trim();

      const isCorrect = gradedImmediately
        ? normalizedCorrect !== undefined && normalizedCorrect !== null && normalizedUser?.toLowerCase() === normalizedCorrect.toLowerCase()
        : null;

      return {
        questionId: ans.questionId,
        userAnswer: normalizedUser,
        isCorrect,
        gradedImmediately,
        correctAnswer: official.correct_answer
      };
    });

    const score = gradedAnswers.filter((a) => a.isCorrect === true).length;
    const total = questions.filter((q) => Boolean(q.auto_grade)).length;

    const { attemptId } = quizRepo.createAttemptWithAnswers({
      quizId: input.quizId,
      userId: user.id,
      score,
      total,
      answers: gradedAnswers
    });

    return {
      attemptId,
      score,
      total,
      answers: gradedAnswers.map((a) => ({
        questionId: a.questionId,
        userAnswer: a.userAnswer ?? null,
        isCorrect: a.isCorrect,
        correctAnswer: a.correctAnswer ?? null
      }))
    };
  },

  getAttempt(quizId: string, userClientId: string, fingerprintHash?: string, name?: string, school?: string, schoolEmail?: string) {
    const user = quizRepo.upsertUser({ clientId: userClientId, fingerprintHash, name, school, schoolEmail });
    const attempt = quizRepo.getAttemptForQuiz(quizId, user.id);

    if (!attempt) {
      throw new ApiError(404, "Attempt not found");
    }

    const withAnswers = quizRepo.getAttemptWithAnswers(attempt.id);
    if (!withAnswers) {
      throw new ApiError(404, "Attempt not found");
    }

    return {
      attemptId: withAnswers.id,
      score: withAnswers.score,
      total: withAnswers.total,
      submittedAt: withAnswers.submitted_at,
      answers: withAnswers.answers.map((a) => ({
        questionId: a.questionId,
        userAnswer: a.userAnswer,
        isCorrect: a.isCorrect === null ? null : Boolean(a.isCorrect),
        correctAnswer: a.correctAnswer
      }))
    };
  }
};
