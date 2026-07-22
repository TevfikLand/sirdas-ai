import { Router } from "express";
import { z } from "zod";
import { requireCsrf, requireRole } from "../middleware/auth.js";
import { analysisLimiter } from "../middleware/rateLimit.js";
import { prisma } from "../lib/prisma.js";
import { finishEntry, saveUserEntry, serializeEntry } from "../services/entry.service.js";
import type { AuthenticatedRequest } from "../types/auth.js";

export const entriesRouter = Router();
entriesRouter.use(requireRole("user"), requireCsrf);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const content = z.object({ version: z.literal(1), pages: z.array(z.string().max(3000)).min(1).max(24) });

entriesRouter.get("/", async (req, res) => {
  const q = z.object({ from: date.optional(), to: date.optional() }).parse(req.query);
  const userId = (req as unknown as AuthenticatedRequest).auth.sub;
  const rows = await prisma.diaryEntry.findMany({ where: { userId, entryDate: { gte: q.from, lte: q.to } }, select: { entryDate: true, contentLength: true, analysisStatus: true, finalizedAt: true, updatedAt: true }, orderBy: { entryDate: "desc" } });
  res.json(rows);
});
entriesRouter.get("/mood-history", async (req, res) => {
  const userId = (req as unknown as AuthenticatedRequest).auth.sub;
  const rows = await prisma.diaryEntry.findMany({ where: { userId, analysisStatus: "ready" }, orderBy: { entryDate: "asc" } });
  res.json(rows.map(serializeEntry).filter(e => e.analysis).map(e => ({ date: e.entryDate, score: e.analysis!.moodScore })));
});
entriesRouter.get("/:date", async (req, res) => {
  const entryDate = date.parse(req.params.date);
  const userId = (req as unknown as AuthenticatedRequest).auth.sub;
  const row = await prisma.diaryEntry.findUnique({ where: { userId_entryDate: { userId, entryDate } } });
  res.json(row ? serializeEntry(row) : null);
});
entriesRouter.put("/:date", async (req, res) => {
  const entryDate = date.parse(req.params.date);
  const input = z.object({ content, expectedUpdatedAt: z.string().datetime().optional() }).parse(req.body);
  try { res.json(await saveUserEntry((req as unknown as AuthenticatedRequest).auth.sub, entryDate, input.content, input.expectedUpdatedAt)); }
  catch (error) { if ((error as Error).message === "STALE_ENTRY") return res.status(409).json({ error: "Bu günlük başka bir oturumda güncellendi." }); throw error; }
});
entriesRouter.post("/:date/finish", analysisLimiter, async (req, res) => {
  res.json(await finishEntry((req as AuthenticatedRequest).auth.sub, date.parse(req.params.date)));
});
