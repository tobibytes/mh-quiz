import { Router } from "express";
import { adminAuth } from "../../middleware/adminAuth.js";
import { loginRateLimit } from "../../middleware/rateLimit.js";
import { adminController } from "./admin.controller.js";

export const adminRouter = Router();

adminRouter.post("/login", loginRateLimit, adminController.login);

adminRouter.use(adminAuth);
adminRouter.get("/quizzes", adminController.listQuizzes);
adminRouter.get("/metrics", adminController.getMetrics);
adminRouter.get("/audit-logs", adminController.getAuditLogs);
adminRouter.get("/leaderboard", adminController.getLeaderboard);
adminRouter.get("/quizzes/:id", adminController.getQuiz);
adminRouter.post("/quizzes", adminController.createQuiz);
adminRouter.patch("/quizzes/:id", adminController.updateQuiz);
adminRouter.delete("/quizzes/:id", adminController.deleteQuiz);

adminRouter.post("/questions", adminController.createQuestion);
adminRouter.patch("/questions/:id", adminController.updateQuestion);
adminRouter.delete("/questions/:id", adminController.deleteQuestion);
