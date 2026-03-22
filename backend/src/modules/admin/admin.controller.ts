import type { Request, Response } from "express";
import { adminService } from "./admin.service.js";
import { adminLoginSchema, createQuestionSchema, createQuizSchema, updateQuestionSchema, updateQuizSchema } from "../shared/validators.js";

function asParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] : (value ?? "");
}

export const adminController = {
  login(req: Request, res: Response) {
    const payload = adminLoginSchema.parse(req.body);
    const data = adminService.login(payload.password);
    res.json(data);
  },

  listQuizzes(_req: Request, res: Response) {
    res.json(adminService.listQuizzes());
  },

  getQuiz(req: Request, res: Response) {
    res.json(adminService.getQuiz(asParam(req.params.id)));
  },

  createQuiz(req: Request, res: Response) {
    const payload = createQuizSchema.parse(req.body);
    const data = adminService.createQuiz(payload);
    res.status(201).json(data);
  },

  updateQuiz(req: Request, res: Response) {
    const payload = updateQuizSchema.parse(req.body);
    const data = adminService.updateQuiz(asParam(req.params.id), payload);
    res.json(data);
  },

  deleteQuiz(req: Request, res: Response) {
    const data = adminService.deleteQuiz(asParam(req.params.id));
    res.json(data);
  },

  createQuestion(req: Request, res: Response) {
    const payload = createQuestionSchema.parse(req.body);
    const data = adminService.createQuestion(payload);
    res.status(201).json(data);
  },

  updateQuestion(req: Request, res: Response) {
    const payload = updateQuestionSchema.parse(req.body);
    const data = adminService.updateQuestion(asParam(req.params.id), payload);
    res.json(data);
  },

  deleteQuestion(req: Request, res: Response) {
    const data = adminService.deleteQuestion(asParam(req.params.id));
    res.json(data);
  }
};
