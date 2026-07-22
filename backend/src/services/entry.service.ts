import { encryptJson, decryptJson } from "../lib/crypto.js";
import { prisma } from "../lib/prisma.js";
import { AiUnavailableError, getAiProvider } from "./ai/provider.js";
import type { AnalysisResult } from "./ai/types.js";

export type DiaryContent = { version: 1; pages: string[] };

export function serializeEntry(row: any) {
  const content = decryptJson<DiaryContent>({ ciphertext: row.encryptedContent, iv: row.contentIv, tag: row.contentTag });
  const analysis = row.encryptedAnalysis && row.analysisIv && row.analysisTag
    ? decryptJson<AnalysisResult>({ ciphertext: row.encryptedAnalysis, iv: row.analysisIv, tag: row.analysisTag })
    : null;
  return { id: row.id, entryDate: row.entryDate, content, contentLength: row.contentLength, version: row.version, finalizedAt: row.finalizedAt, analysisStatus: row.analysisStatus, analysis, updatedAt: row.updatedAt };
}

export async function saveUserEntry(userId: string, entryDate: string, content: DiaryContent, expectedUpdatedAt?: string) {
  const existing = await prisma.diaryEntry.findUnique({ where: { userId_entryDate: { userId, entryDate } } });
  if (existing && expectedUpdatedAt && existing.updatedAt.toISOString() !== expectedUpdatedAt) throw new Error("STALE_ENTRY");
  const encrypted = encryptJson(content);
  const contentLength = content.pages.reduce((sum, page) => sum + page.length, 0);
  const row = await prisma.diaryEntry.upsert({
    where: { userId_entryDate: { userId, entryDate } },
    create: { userId, entryDate, encryptedContent: encrypted.ciphertext, contentIv: encrypted.iv, contentTag: encrypted.tag, contentLength },
    update: { encryptedContent: encrypted.ciphertext, contentIv: encrypted.iv, contentTag: encrypted.tag, contentLength, version: { increment: 1 }, finalizedAt: null, encryptedAnalysis: null, analysisIv: null, analysisTag: null, analysisStatus: "idle" }
  });
  return serializeEntry(row);
}

export async function finishEntry(userId: string, entryDate: string) {
  const row = await prisma.diaryEntry.findUnique({ where: { userId_entryDate: { userId, entryDate } } });
  if (!row) throw new Error("ENTRY_NOT_FOUND");
  await prisma.diaryEntry.update({ where: { id: row.id }, data: { finalizedAt: new Date(), analysisStatus: "pending" } });
  const content = decryptJson<DiaryContent>({ ciphertext: row.encryptedContent, iv: row.contentIv, tag: row.contentTag });
  const provider = getAiProvider();
  const started = Date.now();
  try {
    const analysis = await provider.analyzeEntry(content.pages.join("\n\n"));
    const encrypted = encryptJson(analysis);
    const ready = await prisma.diaryEntry.update({ where: { id: row.id }, data: { encryptedAnalysis: encrypted.ciphertext, analysisIv: encrypted.iv, analysisTag: encrypted.tag, analysisStatus: "ready" } });
    await prisma.aiMetric.create({ data: { status: "success", provider: provider.name, durationMs: Date.now() - started } });
    return { entry: serializeEntry(ready), ai: { status: "ready" } };
  } catch (error) {
    const disabled = error instanceof AiUnavailableError;
    const failed = await prisma.diaryEntry.update({ where: { id: row.id }, data: { analysisStatus: disabled ? "disabled" : "failed" } });
    await prisma.aiMetric.create({ data: { status: disabled ? "disabled" : "error", provider: provider.name, durationMs: Date.now() - started } });
    return { entry: serializeEntry(failed), ai: { status: disabled ? "disabled" : "failed" } };
  }
}
