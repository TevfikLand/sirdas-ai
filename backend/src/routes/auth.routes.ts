import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { requireRole } from "../middleware/auth.js";
import { adminAuthLimiter, authLimiter } from "../middleware/rateLimit.js";
import { clearAuthCookies, hashPassword, issueSession, rotateSession, verifyPassword } from "../services/auth.service.js";
import type { AuthenticatedRequest } from "../types/auth.js";

export const authRouter = Router();
const password = z.string().min(10).max(128).regex(/[A-ZÇĞİÖŞÜ]/, "Bir büyük harf gerekli").regex(/[0-9]/, "Bir rakam gerekli");

authRouter.post("/register", authLimiter, async (req, res) => {
  const input = z.object({ email: z.string().email().transform(v => v.toLowerCase()), password, kvkkAccepted: z.literal(true), kvkkVersion: z.literal("2026-01") }).parse(req.body);
  if (await prisma.user.findUnique({ where: { email: input.email } })) return res.status(409).json({ error: "Bu e-posta zaten kayıtlı." });
  const user = await prisma.user.create({ data: { email: input.email, passwordHash: await hashPassword(input.password), kvkkVersion: input.kvkkVersion, kvkkAcceptedAt: new Date() } });
  await issueSession(res, user.id, "user");
  res.status(201).json({ role: "user", email: user.email });
});

authRouter.post("/login", authLimiter, async (req, res) => {
  const input = z.object({ identifier: z.string().min(3).max(254), password: z.string().min(1).max(128) }).parse(req.body);
  if (input.identifier === env.ADMIN_USERNAME) {
    return adminAuthLimiter(req, res, async () => {
      if (!(await verifyPassword(input.password, env.ADMIN_PASSWORD_HASH))) return res.status(401).json({ error: "Bilgiler eşleşmedi." });
      await issueSession(res, env.ADMIN_USERNAME, "admin");
      res.json({ role: "admin", identifier: env.ADMIN_USERNAME });
    });
  }
  const user = await prisma.user.findUnique({ where: { email: input.identifier.toLowerCase() } });
  if (!user || !(await verifyPassword(input.password, user.passwordHash))) return res.status(401).json({ error: "Bilgiler eşleşmedi." });
  await issueSession(res, user.id, "user");
  res.json({ role: "user", email: user.email });
});

authRouter.post("/refresh", async (req, res) => {
  try { res.json(await rotateSession(res, req.cookies?.sirdas_refresh)); }
  catch { clearAuthCookies(res); res.status(401).json({ error: "Oturum yenilenemedi." }); }
});
authRouter.post("/logout", async (req, res) => {
  const token = req.cookies?.sirdas_refresh;
  if (token) await prisma.refreshSession.updateMany({ where: { tokenHash: (await import("../lib/crypto.js")).hashToken(token) }, data: { revokedAt: new Date() } });
  clearAuthCookies(res); res.status(204).end();
});
authRouter.get("/session", async (req, res) => {
  const token = req.cookies?.sirdas_access as string | undefined;
  if (!token) return res.status(401).json({ error: "Oturum gerekli." });
  try {
    const decoded = jwt.decode(token);
    if (!decoded || typeof decoded === "string" || (decoded.role !== "user" && decoded.role !== "admin")) throw new Error("INVALID_ROLE");
    const claims = jwt.verify(token, decoded.role === "admin" ? env.ADMIN_JWT_SECRET : env.JWT_SECRET) as { role: "user" | "admin"; sub: string };
    if (claims.role === "admin") return res.json({ role: "admin", identifier: claims.sub });
    const user = await prisma.user.findUnique({ where: { id: claims.sub }, select: { email: true, kvkkAcceptedAt: true } });
    if (!user) return res.status(401).json({ error: "Oturum geçersiz." });
    return res.json({ role: "user", ...user });
  } catch {
    return res.status(401).json({ error: "Oturum geçersiz veya süresi dolmuş." });
  }
});
authRouter.get("/me", requireRole("user"), async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: (req as AuthenticatedRequest).auth.sub }, select: { email: true, kvkkAcceptedAt: true } });
  res.json({ role: "user", ...user });
});
authRouter.get("/admin-me", requireRole("admin"), (req, res) => res.json({ role: "admin", identifier: (req as AuthenticatedRequest).auth.sub }));
