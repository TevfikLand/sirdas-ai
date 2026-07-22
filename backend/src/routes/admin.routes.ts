import { Router } from "express";
import { z } from "zod";
import { requireCsrf, requireRole } from "../middleware/auth.js";
import { encryptJson, decryptJson } from "../lib/crypto.js";
import { prisma } from "../lib/prisma.js";
import { getAnonymousStats } from "../services/admin/stats.service.js";
import type { AuthenticatedRequest } from "../types/auth.js";

export const adminRouter = Router();
adminRouter.use(requireRole("admin"), requireCsrf);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const content = z.object({ version: z.literal(1), pages: z.array(z.string().max(3000)).min(1).max(24) });

adminRouter.get("/stats", async (req, res) => {
  const auth = (req as unknown as AuthenticatedRequest).auth;
  res.json(await getAnonymousStats(auth.sub, auth.sid));
});
adminRouter.get("/diary/:date", async (req, res) => {
  const auth = (req as unknown as AuthenticatedRequest).auth;
  const entryDate = date.parse(req.params.date);
  const row = await prisma.adminDiaryEntry.findUnique({ where: { adminSubject_entryDate: { adminSubject: auth.sub, entryDate } } });
  if (!row) return res.json(null);
  const diary = decryptJson({ ciphertext: row.encryptedContent, iv: row.contentIv, tag: row.contentTag });
  res.json({ entryDate, content: diary, updatedAt: row.updatedAt, version: row.version });
});
adminRouter.put("/diary/:date", async (req, res) => {
  const auth = (req as unknown as AuthenticatedRequest).auth;
  const entryDate = date.parse(req.params.date);
  const input = content.parse(req.body.content);
  const encrypted = encryptJson(input);
  const row = await prisma.adminDiaryEntry.upsert({
    where: { adminSubject_entryDate: { adminSubject: auth.sub, entryDate } },
    create: { adminSubject: auth.sub, entryDate, encryptedContent: encrypted.ciphertext, contentIv: encrypted.iv, contentTag: encrypted.tag, contentLength: input.pages.join("").length },
    update: { encryptedContent: encrypted.ciphertext, contentIv: encrypted.iv, contentTag: encrypted.tag, contentLength: input.pages.join("").length, version: { increment: 1 } }
  });
  res.json({ entryDate, content: input, updatedAt: row.updatedAt, version: row.version });
});
