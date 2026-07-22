import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  FRONTEND_ORIGIN: z.string().url(),
  JWT_SECRET: z.string().min(32),
  ADMIN_JWT_SECRET: z.string().min(32),
  ENCRYPTION_KEY: z.string().min(40),
  ADMIN_USERNAME: z.string().min(3),
  ADMIN_PASSWORD_HASH: z.string().min(20),
  PRIVACY_CONTACT_EMAIL: z.string().email(),
  AI_PROVIDER: z.string().default("disabled"),
  AI_API_KEY: z.string().optional(),
  AI_MODEL: z.string().optional()
});

export const env = schema.parse(process.env);
export const isProduction = env.NODE_ENV === "production";
