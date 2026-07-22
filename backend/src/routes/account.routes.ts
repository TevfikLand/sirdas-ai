import { Router } from "express";
import PDFDocument from "pdfkit";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { requireCsrf, requireRole } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";
import { serializeEntry } from "../services/entry.service.js";
import { verifyPassword } from "../services/auth.service.js";
import type { AuthenticatedRequest } from "../types/auth.js";

export const accountRouter = Router();
accountRouter.use(requireRole("user"), requireCsrf);
accountRouter.get("/export.json", async (req, res) => {
  const userId = (req as AuthenticatedRequest).auth.sub;
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { email: true, kvkkAcceptedAt: true, createdAt: true } });
  const entries = (await prisma.diaryEntry.findMany({ where: { userId }, orderBy: { entryDate: "asc" } })).map(serializeEntry);
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Disposition", "attachment; filename=sirdas-ai-verilerim.json");
  res.json({ exportedAt: new Date(), user, entries });
});
accountRouter.get("/export.pdf", async (req, res) => {
  const userId = (req as AuthenticatedRequest).auth.sub;
  const entries = (await prisma.diaryEntry.findMany({ where: { userId }, orderBy: { entryDate: "asc" } })).map(serializeEntry);
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=sirdas-ai-gunluklerim.pdf");
  const doc = new PDFDocument({ margin: 54, info: { Title: "Sırdaş AI Günlüklerim" } });
  doc.registerFont("Vera", fileURLToPath(new URL("../../assets/Vera.ttf", import.meta.url)));
  doc.registerFont("VeraBold", fileURLToPath(new URL("../../assets/VeraBd.ttf", import.meta.url)));
  doc.pipe(res); doc.font("VeraBold").fontSize(22).text("Sırdaş AI - Günlüklerim"); doc.moveDown();
  for (const entry of entries) { doc.font("VeraBold").fontSize(15).text(entry.entryDate); doc.font("Vera").fontSize(11).text(entry.content.pages.join("\n\n")); if (entry.analysis) { doc.moveDown(.5).font("VeraBold").fontSize(12).text("Sırdaş AI yorumu"); doc.font("Vera").fontSize(10).text(entry.analysis.analysis); } doc.moveDown(1.5); }
  doc.end();
});
accountRouter.delete("/", async (req, res) => {
  const input = z.object({ password: z.string().min(1), confirmation: z.literal("HESABIMI SİL") }).parse(req.body);
  const userId = (req as AuthenticatedRequest).auth.sub;
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!(await verifyPassword(input.password, user.passwordHash))) return res.status(401).json({ error: "Şifre doğrulanamadı." });
  await prisma.user.delete({ where: { id: userId } });
  res.status(204).end();
});
