import { nanoid } from "nanoid";
import { db } from "../../db/client.js";

type DbQuiz = {
  id: string;
  date: string;
  type: string;
  title: string | null;
};

type DbQuestion = {
  id: string;
  prompt: string;
  response_type: "multiple_choice" | "short_answer";
  auto_grade: number;
  correct_answer: string | null;
};

type DbOption = {
  id: string;
  question_id: string;
  label: string;
};

type DbAttempt = {
  id: string;
  score: number;
  total: number;
  submitted_at: string;
};

export const quizRepo = {
  getQuizForDate(date: string): DbQuiz | undefined {
    return db.prepare("SELECT id, date, type, title FROM quizzes WHERE date = ? AND status IN ('active', 'scheduled') LIMIT 1").get(date) as DbQuiz | undefined;
  },

  upsertUser(input: { clientId: string; fingerprintHash?: string; name?: string; school?: string; schoolEmail?: string }): { id: string } {
    const now = new Date().toISOString();
    const existing = db.prepare("SELECT id FROM users WHERE client_id = ?").get(input.clientId) as { id: string } | undefined;

    if (existing) {
      db.prepare(
        "UPDATE users SET fingerprint_hash = COALESCE(?, fingerprint_hash), name = COALESCE(?, name), school = COALESCE(?, school), school_email = COALESCE(?, school_email), last_seen_at = ? WHERE id = ?"
      ).run(input.fingerprintHash ?? null, input.name ?? null, input.school ?? null, input.schoolEmail ?? null, now, existing.id);
      return existing;
    }

    const id = `user_${nanoid()}`;
    db.prepare(
      "INSERT INTO users (id, client_id, fingerprint_hash, name, school, school_email, first_seen_at, last_seen_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(id, input.clientId, input.fingerprintHash ?? null, input.name ?? null, input.school ?? null, input.schoolEmail ?? null, now, now);
    return { id };
  },

  getQuestionsByQuizId(quizId: string): DbQuestion[] {
    return db.prepare("SELECT id, prompt, response_type, auto_grade, correct_answer FROM questions WHERE quiz_id = ? ORDER BY position ASC").all(quizId) as DbQuestion[];
  },

  getOptionsByQuizId(quizId: string): DbOption[] {
    return db.prepare(
      "SELECT o.id, o.question_id, o.label FROM question_options o INNER JOIN questions q ON q.id = o.question_id WHERE q.quiz_id = ? ORDER BY o.position ASC"
    ).all(quizId) as DbOption[];
  },

  getAttemptForQuiz(quizId: string, userId: string): DbAttempt | undefined {
    return db.prepare("SELECT id, score, total, submitted_at FROM attempts WHERE quiz_id = ? AND user_id = ? LIMIT 1").get(quizId, userId) as DbAttempt | undefined;
  },

  getAttemptWithAnswers(attemptId: string) {
    const attempt = db.prepare("SELECT id, score, total, submitted_at FROM attempts WHERE id = ?").get(attemptId) as DbAttempt | undefined;
    if (!attempt) {
      return undefined;
    }

    const answers = db.prepare(
      "SELECT question_id AS questionId, user_answer AS userAnswer, is_correct AS isCorrect, correct_answer_snapshot AS correctAnswer FROM attempt_answers WHERE attempt_id = ?"
    ).all(attemptId) as Array<{ questionId: string; userAnswer: string | null; isCorrect: number | null; correctAnswer: string | null }>;

    return {
      ...attempt,
      answers
    };
  },

  createAttemptWithAnswers(input: {
    quizId: string;
    userId: string;
    score: number;
    total: number;
    answers: Array<{ questionId: string; userAnswer?: string; isCorrect: boolean | null; gradedImmediately: boolean; correctAnswer?: string | null }>;
  }): { attemptId: string } {
    const now = new Date().toISOString();
    const attemptId = `attempt_${nanoid()}`;

    const transaction = db.transaction(() => {
      db.prepare("INSERT INTO attempts (id, quiz_id, user_id, score, total, submitted_at) VALUES (?, ?, ?, ?, ?, ?)").run(
        attemptId,
        input.quizId,
        input.userId,
        input.score,
        input.total,
        now
      );

      const insertAnswer = db.prepare(
        "INSERT INTO attempt_answers (id, attempt_id, question_id, user_answer, is_correct, graded_immediately, correct_answer_snapshot) VALUES (?, ?, ?, ?, ?, ?, ?)"
      );

      for (const answer of input.answers) {
        insertAnswer.run(
          `ans_${nanoid()}`,
          attemptId,
          answer.questionId,
          answer.userAnswer ?? null,
          answer.isCorrect === null ? null : Number(answer.isCorrect),
          Number(answer.gradedImmediately),
          answer.correctAnswer ?? null
        );
      }
    });

    transaction();
    return { attemptId };
  }
};
