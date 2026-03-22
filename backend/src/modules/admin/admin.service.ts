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

  createQuiz(input: { date: string; type: string; title?: string; status?: string }) {
    return adminRepo.createQuiz(input);
  },

  updateQuiz(id: string, input: { date?: string; type?: string; title?: string; status?: string }) {
    const updated = adminRepo.updateQuiz(id, input);
    if (!updated) {
      throw new ApiError(404, "Quiz not found");
    }
    return { success: true };
  },

  deleteQuiz(id: string) {
    const deleted = adminRepo.deleteQuiz(id);
    if (!deleted) {
      throw new ApiError(404, "Quiz not found");
    }
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
  }) {
    const question = adminRepo.createQuestion(input);
    if (!question) {
      throw new ApiError(404, "Quiz not found");
    }
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
    }
  ) {
    const updated = adminRepo.updateQuestion(id, input);
    if (!updated) {
      throw new ApiError(404, "Question not found");
    }
    return { success: true };
  },

  deleteQuestion(id: string) {
    const deleted = adminRepo.deleteQuestion(id);
    if (!deleted) {
      throw new ApiError(404, "Question not found");
    }
    return { success: true };
  }
};
