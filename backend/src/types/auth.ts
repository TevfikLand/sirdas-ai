import type { Request } from "express";

export type Role = "user" | "admin";
export type AccessClaims = { sub: string; role: Role; sid: string };
export type AuthenticatedRequest = Request & { auth: AccessClaims };
