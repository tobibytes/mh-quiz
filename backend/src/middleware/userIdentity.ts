import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../modules/shared/api-error.js";

export function userIdentity(req: Request, _res: Response, next: NextFunction): void {
  const clientId = req.header("x-user-id")?.trim();
  const fingerprintHash = req.header("x-user-fingerprint")?.trim();
  const name = req.header("x-user-name")?.trim();
  const school = req.header("x-user-school")?.trim();
  const schoolEmail = req.header("x-user-school-email")?.trim().toLowerCase();

  if (!clientId) {
    throw new ApiError(400, "x-user-id header is required");
  }

  if (schoolEmail && !/^[^\s@]+@[^\s@]+\.edu$/i.test(schoolEmail)) {
    throw new ApiError(400, "x-user-school-email must be a valid .edu email");
  }

  req.userIdentity = { clientId, fingerprintHash, name, school, schoolEmail };
  next();
}
