import { randomBytes, randomUUID } from "node:crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Response } from "express";
import { env, isProduction } from "../config/env.js";
import { hashToken } from "../lib/crypto.js";
import { prisma } from "../lib/prisma.js";
import type { Role } from "../types/auth.js";

const ACCESS_SECONDS = 15 * 60;
const REFRESH_DAYS = 30;
const cookieBase = { httpOnly: true, secure: isProduction, sameSite: "strict" as const, path: "/" };

export function clearAuthCookies(res: Response) {
  res.clearCookie("sirdas_access", cookieBase);
  res.clearCookie("sirdas_refresh", cookieBase);
  res.clearCookie("sirdas_csrf", { secure: isProduction, sameSite: "strict", path: "/" });
}

export async function issueSession(res: Response, subject: string, role: Role, familyId: string = randomUUID()) {
  const refresh = randomBytes(48).toString("base64url");
  const sid = randomUUID();
  await prisma.refreshSession.create({ data: {
    id: sid,
    tokenHash: hashToken(refresh),
    familyId,
    role,
    userId: role === "user" ? subject : null,
    expiresAt: new Date(Date.now() + REFRESH_DAYS * 86_400_000)
  }});
  const secret = role === "admin" ? env.ADMIN_JWT_SECRET : env.JWT_SECRET;
  const access = jwt.sign({ role, sid }, secret, { subject, expiresIn: ACCESS_SECONDS });
  const csrf = randomBytes(24).toString("base64url");
  res.cookie("sirdas_access", access, { ...cookieBase, maxAge: ACCESS_SECONDS * 1000 });
  res.cookie("sirdas_refresh", refresh, { ...cookieBase, maxAge: REFRESH_DAYS * 86_400_000 });
  res.cookie("sirdas_csrf", csrf, { secure: isProduction, sameSite: "strict", path: "/", maxAge: REFRESH_DAYS * 86_400_000 });
  return { role, subject };
}

export async function rotateSession(res: Response, refresh: string) {
  const session = await prisma.refreshSession.findUnique({ where: { tokenHash: hashToken(refresh) } });
  if (!session) throw new Error("INVALID_REFRESH");
  if (session.revokedAt) {
    await prisma.refreshSession.updateMany({ where: { familyId: session.familyId, revokedAt: null }, data: { revokedAt: new Date() } });
    throw new Error("REUSED_REFRESH");
  }
  if (session.expiresAt < new Date()) throw new Error("EXPIRED_REFRESH");
  await prisma.refreshSession.update({ where: { id: session.id }, data: { revokedAt: new Date() } });
  const subject = session.role === "admin" ? env.ADMIN_USERNAME : session.userId!;
  return issueSession(res, subject, session.role as Role, session.familyId);
}

export const verifyPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);
export const hashPassword = (plain: string) => bcrypt.hash(plain, 12);
