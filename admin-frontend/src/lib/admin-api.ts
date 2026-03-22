const API_BASE = process.env.API_BASE;
 

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
  questionCount?: number;
  status?: string;
}

export interface Question {
  id: string;
  quizId: string;
  prompt: string;
  responseType: "multiple_choice" | "typed";
  options: string[];
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

  getQuiz: (id: string) => request<QuizDetail>(`/quiz/${id}`),

  createQuiz: (data: { date: string; type: string }) =>
    request<Quiz>("/quiz", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  createQuestion: (data: Omit<Question, "id">) =>
    request<Question>("/question", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateQuestion: (id: string, data: Partial<Omit<Question, "id">>) =>
    request<Question>(`/question/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteQuestion: (id: string) =>
    request<void>(`/question/${id}`, { method: "DELETE" }),
};
