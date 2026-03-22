import type { Request, Response } from "express";
import { submitQuizSchema } from "../shared/validators.js";
import { quizService } from "./quiz.service.js";

function asParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] : (value ?? "");
}

export const quizController = {
  getToday(req: Request, res: Response) {
    const identity = req.userIdentity!;
    const data = quizService.getTodayQuizForUser(identity.clientId, identity.fingerprintHash);
    res.json(data);
  },

  submit(req: Request, res: Response) {
    const identity = req.userIdentity!;
    const payload = submitQuizSchema.parse(req.body);

    const result = quizService.submitQuizAttempt({
      userClientId: identity.clientId,
      fingerprintHash: identity.fingerprintHash,
      quizId: payload.quizId,
      answers: payload.answers
    });

    res.status(201).json(result);
  },

  getAttempt(req: Request, res: Response) {
    const identity = req.userIdentity!;
    const result = quizService.getAttempt(asParam(req.params.quizId), identity.clientId, identity.fingerprintHash);
    res.json(result);
  }
};
