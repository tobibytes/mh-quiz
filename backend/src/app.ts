import cors from "cors";
import express from "express";
import * as helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { db } from "./db/client.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { generalRateLimit } from "./middleware/rateLimit.js";
import { requestIdMiddleware } from "./middleware/requestId.js";
import { adminRouter } from "./modules/admin/admin.routes.js";
import { quizRouter } from "./modules/quiz/quiz.routes.js";

export const app = express();

app.use(helmet.default());
app.use(requestIdMiddleware);
app.use(morgan(":method :url :status :response-time ms reqId=:req[x-request-id]"));
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }
      callback(null, env.CORS_ORIGINS.includes(origin));
    }
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(generalRateLimit);

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "mh-quiz-backend",
    version: "1.0.0",
    env: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime())
  });
});

app.get("/health/ready", (_req, res) => {
  try {
    db.prepare("SELECT 1").get();
    res.json({ status: "ready", timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: "not_ready", timestamp: new Date().toISOString() });
  }
});

app.use("/api/quiz", quizRouter);
app.use("/api/admin", adminRouter);

app.use(notFoundHandler);
app.use(errorHandler);
