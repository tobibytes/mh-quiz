import dotenv from "dotenv";
import path from "node:path";
import { z } from "zod";

dotenv.config();

const DEV_DEFAULT_SECRET = "dev-only-secret-replace-in-production!";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DB_PATH: z.string().default("./data/mh-quiz.db"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters").default(DEV_DEFAULT_SECRET),
  JWT_EXPIRES_IN: z.string().default("2h"),
  ADMIN_PASSWORD: z.string().min(1).default("admin123"),
  CORS_ORIGINS: z.string().default("http://localhost:5173,http://localhost:5174")
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
  throw new Error(`Invalid environment: ${issues}`);
}

if (parsed.data.NODE_ENV === "production" && parsed.data.JWT_SECRET === DEV_DEFAULT_SECRET) {
  throw new Error("JWT_SECRET must be changed from the default value in production");
}

export const env = {
  ...parsed.data,
  DB_PATH: path.resolve(process.cwd(), parsed.data.DB_PATH),
  CORS_ORIGINS: parsed.data.CORS_ORIGINS.split(",").map((v) => v.trim()).filter(Boolean)
};
