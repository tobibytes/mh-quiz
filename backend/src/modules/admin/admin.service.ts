import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../../config/env.js";
import { ApiError } from "../shared/api-error.js";
import { adminRepo } from "./admin.repo.js";

export const adminService = {
  login(password: string) {
    if (password !== env.ADMIN_PASSWORD) {
      throw new ApiError(401, "Invalid credentials");
    }

    const token = jwt.sign({ role: "admin" }, env.JWT_SECRET, {
      subject: "admin",
      expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"]
    });

    return { token };
  },

  listQuizzes() {
    return adminRepo.listQuizzes();
  },

  getQuiz(id: string) {
    const quiz = adminRepo.getQuizById(id);
    if (!quiz) {
      throw new ApiError(404, "Quiz not found");
    }
    return quiz;
  },

  createQuiz(input: { date: string; type: string; title?: string; status?: string }, actorId?: string) {
    const created = adminRepo.createQuiz(input);
    adminRepo.logAdminAction({
      action: "create_quiz",
      entityType: "quiz",
      entityId: created.id,
      actorId,
      metadata: { date: input.date, type: input.type }
    });
    return created;
  },

  updateQuiz(id: string, input: { date?: string; type?: string; title?: string; status?: string }, actorId?: string) {
    const updated = adminRepo.updateQuiz(id, input);
    if (!updated) {
      throw new ApiError(404, "Quiz not found");
    }
    adminRepo.logAdminAction({ action: "update_quiz", entityType: "quiz", entityId: id, actorId, metadata: input });
    return { success: true };
  },

  deleteQuiz(id: string, actorId?: string) {
    const deleted = adminRepo.deleteQuiz(id);
    if (!deleted) {
      throw new ApiError(404, "Quiz not found");
    }
    adminRepo.logAdminAction({ action: "delete_quiz", entityType: "quiz", entityId: id, actorId });
    return { success: true };
  },

  createQuestion(input: {
    quizId: string;
    prompt: string;
    responseType: "multiple_choice" | "short_answer";
    autoGrade: boolean;
    correctAnswer?: string;
    position?: number;
    options?: Array<{ label: string }>;
  }, actorId?: string) {
    const question = adminRepo.createQuestion(input);
    if (question === "duplicate") {
      throw new ApiError(409, "Duplicate question found for this quiz.");
    }
    if (!question) {
      throw new ApiError(404, "Quiz not found");
    }
    adminRepo.logAdminAction({
      action: "create_question",
      entityType: "question",
      entityId: question.id,
      actorId,
      metadata: { quizId: input.quizId, responseType: input.responseType }
    });
    return question;
  },

  updateQuestion(
    id: string,
    input: {
      prompt?: string;
      responseType?: "multiple_choice" | "short_answer";
      autoGrade?: boolean;
      correctAnswer?: string;
      position?: number;
      options?: Array<{ label: string }>;
    },
    actorId?: string
  ) {
    const updated = adminRepo.updateQuestion(id, input);
    if (updated === "duplicate") {
      throw new ApiError(409, "Duplicate question found for this quiz.");
    }
    if (!updated) {
      throw new ApiError(404, "Question not found");
    }
    adminRepo.logAdminAction({ action: "update_question", entityType: "question", entityId: id, actorId, metadata: input });
    return { success: true };
  },

  deleteQuestion(id: string, actorId?: string) {
    const deleted = adminRepo.deleteQuestion(id);
    if (!deleted) {
      throw new ApiError(404, "Question not found");
    }
    adminRepo.logAdminAction({ action: "delete_question", entityType: "question", entityId: id, actorId });
    return { success: true };
  },

  getLeaderboard(input: { limit?: number; quizId?: string }) {
    const safeLimit = Math.min(Math.max(input.limit ?? 100, 1), 500);
    return adminRepo.getLeaderboard({ limit: safeLimit, quizId: input.quizId });
  },

  getMetrics() {
    return adminRepo.getMetrics();
  },

  getRecentAuditLogs(limit?: number) {
    const safeLimit = Math.min(Math.max(limit ?? 50, 1), 200);
    return adminRepo.listRecentAuditLogs(safeLimit);
  }
};
