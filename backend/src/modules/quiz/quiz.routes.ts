import { Router } from "express";
import { generalRateLimit, submitRateLimit } from "../../middleware/rateLimit.js";
import { userIdentity } from "../../middleware/userIdentity.js";
import { quizController } from "./quiz.controller.js";

export const quizRouter = Router();

quizRouter.use(userIdentity);
quizRouter.get("/today", generalRateLimit, quizController.getToday);
quizRouter.post("/submit", submitRateLimit, quizController.submit);
quizRouter.get("/attempt/:quizId", generalRateLimit, quizController.getAttempt);
