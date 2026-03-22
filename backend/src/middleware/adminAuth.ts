import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "../modules/shared/api-error.js";

type AdminToken = {
  sub: string;
  role: "admin";
};

export function adminAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.header("authorization");
  if (!header || !header.startsWith("Bearer ")) {
    throw new ApiError(401, "Missing admin token");
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AdminToken;
    if (payload.role !== "admin") {
      throw new ApiError(403, "Invalid admin role");
    }
    req.admin = { id: payload.sub };
    next();
  } catch {
    throw new ApiError(401, "Invalid or expired token");
  }
}
