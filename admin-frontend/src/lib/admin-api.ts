const API_BASE = import.meta.env.VITE_API_BASE ?? "/api/admin";

async function parseJsonSafe(response: Response): Promise<Record<string, unknown>> {
  try {
    return await response.json();
  } catch {
    return {};
  }
}


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
    const body = await parseJsonSafe(res);
    const message =
      (typeof body.message === "string" && body.message) ||
      (typeof body.error === "string" && body.error) ||
      (res.status === 429 ? "Too many requests. Please try again shortly." : "") ||
      `Request failed (${res.status})`;
    throw new Error(message);
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

export interface LeaderboardEntry {
  userId: string;
  clientId: string;
  name: string | null;
  school: string | null;
  schoolEmail: string | null;
  attemptsCount: number;
  totalScore: number;
  totalPossible: number;
  lastSubmittedAt: string;
}

export interface AdminMetrics {
  quizzesCount: number;
  questionsCount: number;
  usersCount: number;
  attemptsCount: number;
  todayAttemptsCount: number;
  todayDate: string;
}

export interface AuditLogEntry {
  id: string;
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: string | null;
  createdAt: string;
}

export const adminApi = {
  login: (password: string) =>
    request<{ token: string }>("/login", {
      method: "POST",
      body: JSON.stringify({ password }),
    }),

  getQuizzes: () => request<Quiz[]>("/quizzes"),

  getQuiz: (id: string) => request<QuizDetail>(`/quizzes/${id}`),

  getLeaderboard: (params?: { quizId?: string; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.quizId) query.set("quizId", params.quizId);
    if (params?.limit) query.set("limit", String(params.limit));
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return request<LeaderboardEntry[]>(`/leaderboard${suffix}`);
  },

  getMetrics: () => request<AdminMetrics>("/metrics"),

  getAuditLogs: (limit = 20) => request<AuditLogEntry[]>(`/audit-logs?limit=${limit}`),

  createQuiz: (data: { date: string; type: string; title?: string }) =>
    request<{ id: string }>("/quizzes", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  deleteQuiz: (id: string) =>
    request<{ success: boolean }>(`/quizzes/${id}`, { method: "DELETE" }),

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
