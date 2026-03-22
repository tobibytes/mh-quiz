import { getUserId } from "./user";

export interface Question {
  id: string;
  type: "mcq" | "short_answer";
  question: string;
  options?: string[];
  correctAnswer?: string;
}

export interface QuizResponse {
  quizId: string | null;
  questions?: Question[];
  hasAttempted?: boolean;
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

const API_BASE = "/api";

function headers(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-user-id": getUserId(),
  };
}

export async function fetchTodayQuiz(): Promise<QuizResponse> {
  const res = await fetch(`${API_BASE}/quiz/today`, { headers: headers() });
  if (!res.ok) throw new Error("Failed to fetch quiz");
  return res.json();
}

export async function submitQuiz(
  quizId: string,
  answers: Record<string, string>
): Promise<SubmitResponse> {
  const res = await fetch(`${API_BASE}/quiz/submit`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ quizId, answers }),
  });
  if (!res.ok) throw new Error("Failed to submit quiz");
  return res.json();
}
