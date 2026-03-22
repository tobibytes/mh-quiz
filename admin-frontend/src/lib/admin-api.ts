const API_BASE = import.meta.env.VITE_API_BASE ?? "/api/admin";


async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("admin_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem("admin_token");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || body.error || `Request failed (${res.status})`);
  }

  return res.json();
}

export interface Quiz {
  id: string;
  date: string;
  type: "know_morganhacks" | "throwback";
  title?: string;
  questionCount?: number;
  status?: string;
}

export interface QuizOption {
  id: string;
  label: string;
}

export interface Question {
  id: string;
  quizId: string;
  prompt: string;
  responseType: "multiple_choice" | "short_answer";
  options: QuizOption[];
  correctAnswer: string | null;
  autoGrade: boolean;
}

export interface QuizDetail extends Quiz {
  questions: Question[];
}

export const adminApi = {
  login: (password: string) =>
    request<{ token: string }>("/login", {
      method: "POST",
      body: JSON.stringify({ password }),
    }),

  getQuizzes: () => request<Quiz[]>("/quizzes"),

  getQuiz: (id: string) => request<QuizDetail>(`/quizzes/${id}`),

  createQuiz: (data: { date: string; type: string; title?: string }) =>
    request<{ id: string }>("/quizzes", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  createQuestion: (data: {
    quizId: string;
    prompt: string;
    responseType: "multiple_choice" | "short_answer";
    options: string[];
    correctAnswer: string | null;
    autoGrade: boolean;
  }) =>
    request<{ id: string }>("/questions", {
      method: "POST",
      body: JSON.stringify({
        quizId: data.quizId,
        prompt: data.prompt,
        responseType: data.responseType,
        autoGrade: data.autoGrade,
        correctAnswer: data.correctAnswer || undefined,
        options: data.options.filter((o) => o.trim()).map((label) => ({ label })),
      }),
    }),

  updateQuestion: (
    id: string,
    data: {
      prompt?: string;
      responseType?: "multiple_choice" | "short_answer";
      options?: string[];
      correctAnswer?: string | null;
      autoGrade?: boolean;
    }
  ) =>
    request<{ success: boolean }>(`/questions/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        ...data,
        correctAnswer: data.correctAnswer || undefined,
        options: data.options !== undefined
          ? data.options.filter((o) => o.trim()).map((label) => ({ label }))
          : undefined,
      }),
    }),

  deleteQuestion: (id: string) =>
    request<{ success: boolean }>(`/questions/${id}`, { method: "DELETE" }),
};
