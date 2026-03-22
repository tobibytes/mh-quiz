import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "../modules/shared/api-error.js";

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

  console.error("Unhandled error", err);
  res.status(500).json({ message: "Internal server error", requestId: req.requestId });
}
