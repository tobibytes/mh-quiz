import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "../modules/shared/api-error.js";

function isSqliteUniqueConstraint(err: unknown): err is { code: string; message: string } {
  if (!err || typeof err !== "object") {
    return false;
  }

  const maybe = err as { code?: unknown; message?: unknown };
  return maybe.code === "SQLITE_CONSTRAINT_UNIQUE" && typeof maybe.message === "string";
}

function isSqliteForeignKeyConstraint(err: unknown): err is { code: string; message: string } {
  if (!err || typeof err !== "object") {
    return false;
  }

  const maybe = err as { code?: unknown; message?: unknown };
  return maybe.code === "SQLITE_CONSTRAINT_FOREIGNKEY" && typeof maybe.message === "string";
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ message: "Route not found" });
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ message: err.message, details: err.details, requestId: req.requestId });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({ message: "Validation failed", issues: err.issues, requestId: req.requestId });
    return;
  }

  if (isSqliteUniqueConstraint(err)) {
    if (err.message.includes("quizzes.date") && err.message.includes("quizzes.type")) {
      res.status(409).json({
        message: "A quiz already exists for this date and type.",
        requestId: req.requestId,
      });
      return;
    }

    res.status(409).json({ message: "Duplicate record.", requestId: req.requestId });
    return;
  }

  if (isSqliteForeignKeyConstraint(err)) {
    res.status(409).json({
      message: "Operation blocked due to related records. Remove dependent records first.",
      requestId: req.requestId,
    });
    return;
  }

  console.error("Unhandled error", {
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined
  });
  res.status(500).json({ message: "Internal server error", requestId: req.requestId });
}
