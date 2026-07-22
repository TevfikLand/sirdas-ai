import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { AccessClaims, AuthenticatedRequest, Role } from "../types/auth.js";

export function requireRole(role: Role) {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.sirdas_access as string | undefined;
    if (!token) return res.status(401).json({ error: "Oturum gerekli." });
    try {
      const secret = role === "admin" ? env.ADMIN_JWT_SECRET : env.JWT_SECRET;
      const claims = jwt.verify(token, secret) as AccessClaims;
      if (claims.role !== role) return res.status(403).json({ error: "Bu alana erişemezsiniz." });
      (req as AuthenticatedRequest).auth = claims;
      next();
    } catch {
      return res.status(401).json({ error: "Oturum geçersiz veya süresi dolmuş." });
    }
  };
}

export function requireCsrf(req: Request, res: Response, next: NextFunction) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const cookie = req.cookies?.sirdas_csrf as string | undefined;
  const header = req.header("x-csrf-token");
  if (!cookie || !header || cookie !== header) return res.status(403).json({ error: "Güvenlik doğrulaması başarısız." });
  next();
}
