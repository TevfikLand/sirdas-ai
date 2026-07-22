import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({ windowMs: 15 * 60_000, limit: 10, standardHeaders: true, legacyHeaders: false });
export const adminAuthLimiter = rateLimit({ windowMs: 30 * 60_000, limit: 5, standardHeaders: true, legacyHeaders: false });
export const analysisLimiter = rateLimit({ windowMs: 60 * 60_000, limit: 12, standardHeaders: true, legacyHeaders: false });
