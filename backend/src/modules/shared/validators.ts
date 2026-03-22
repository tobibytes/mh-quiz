import { z } from "zod";
import { QUIZ_STATUSES, QUIZ_TYPES, RESPONSE_TYPES } from "./constants.js";

export const createQuizSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: z.enum(QUIZ_TYPES),
  title: z.string().trim().min(1).max(255).optional(),
  status: z.enum(QUIZ_STATUSES).optional()
});

export const updateQuizSchema = createQuizSchema.partial().refine((v) => Object.keys(v).length > 0, {
  message: "At least one field is required"
});

export const questionOptionSchema = z.object({
  label: z.string().trim().min(1)
});

const baseQuestionSchema = z.object({
  quizId: z.string().trim().min(1),
  prompt: z.string().trim().min(1),
  responseType: z.enum(RESPONSE_TYPES),
  autoGrade: z.boolean().default(true),
  correctAnswer: z.string().trim().min(1).optional(),
  position: z.number().int().min(0).optional(),
  options: z.array(questionOptionSchema).optional()
});

export const createQuestionSchema = baseQuestionSchema.superRefine((value, ctx) => {
  if (value.responseType === "multiple_choice") {
    if (!value.options || value.options.length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Multiple choice requires at least 2 options" });
    }
    if (value.autoGrade && !value.correctAnswer) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "correctAnswer is required when autoGrade is true" });
    }
    if (value.correctAnswer && value.options && !value.options.some((o) => o.label === value.correctAnswer)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "correctAnswer must match one of the options" });
    }
  }
});

export const updateQuestionSchema = baseQuestionSchema.omit({ quizId: true }).partial().refine((v) => Object.keys(v).length > 0, {
  message: "At least one field is required"
});

export const submitQuizSchema = z.object({
  quizId: z.string().trim().min(1),
  answers: z.array(
    z.object({
      questionId: z.string().trim().min(1),
      userAnswer: z.string().trim().optional()
    })
  ).min(1)
});

export const adminLoginSchema = z.object({
  password: z.string().min(1)
});
