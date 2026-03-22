import { getUserId } from "./user";

export interface QuizOption {
  id: string;
  label: string;
}

export interface Question {
  id: string;
  prompt: string;
  responseType: "multiple_choice" | "short_answer";
  options: QuizOption[];
  autoGrade: boolean;
}

export interface QuizResponse {
  quizId: string | null;
  questions: Question[];
  hasAttempted: boolean;
}

export interface SubmitResponse {
  score: number;
  total: number;
  results: {
    questionId: string;
    correct: boolean;
    correctAnswer: string;
    userAnswer: string;
  }[];
}

const API_BASE = import.meta.env.VITE_API_BASE ?? "/api/quiz";

function headers(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-user-id": getUserId(),
  };
}

export async function fetchTodayQuiz(): Promise<QuizResponse> {
  const res = await fetch(`${API_BASE}/today`, { headers: headers() });
  if (!res.ok) throw new Error("Failed to fetch quiz");
  const data = await res.json();
  return {
    quizId: data.quiz?.id ?? null,
    questions: data.questions ?? [],
    hasAttempted: Boolean(data.hasAttempted),
  };
}

export async function submitQuiz(
  quizId: string,
  answers: Record<string, string>
): Promise<SubmitResponse> {
  const body = {
    quizId,
    answers: Object.entries(answers).map(([questionId, userAnswer]) => ({
      questionId,
      userAnswer,
    })),
  };
  const res = await fetch(`${API_BASE}/submit`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to submit quiz");
  const data = await res.json();
  return {
    score: data.score,
    total: data.total,
    results: (data.answers ?? []).map((a: { questionId: string; userAnswer: string | null; isCorrect: boolean | null; correctAnswer: string | null }) => ({
      questionId: a.questionId,
      correct: Boolean(a.isCorrect),
      correctAnswer: a.correctAnswer ?? "",
      userAnswer: a.userAnswer ?? "",
    })),
  };
}
