export type Role = "user" | "admin";
export type UserSession = { role: Role; email?: string; identifier?: string };
export type DiaryContent = { version: 1; pages: string[] };
export type Analysis = { analysis: string; suggestions: string[]; riskLevel: "yok" | "düşük" | "yüksek"; moodScore: number };
export type DiaryEntry = { id?: string; entryDate: string; content: DiaryContent; contentLength?: number; version: number; finalizedAt?: string | null; analysisStatus?: string; analysis?: Analysis | null; updatedAt?: string };
