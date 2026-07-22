import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";

async function distinctWriters(from: string, to?: string) {
  const rows = await prisma.$queryRaw<Array<{ count: bigint | number }>>(to
    ? Prisma.sql`SELECT COUNT(DISTINCT "userId") AS count FROM "DiaryEntry" WHERE "entryDate" >= ${from} AND "entryDate" <= ${to}`
    : Prisma.sql`SELECT COUNT(DISTINCT "userId") AS count FROM "DiaryEntry" WHERE "entryDate" >= ${from}`);
  return Number(rows[0]?.count ?? 0);
}

export async function getAnonymousStats(adminSubject: string, sessionId: string) {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const week = new Date(now.getTime() - 6 * 86_400_000).toISOString().slice(0, 10);
  const month = new Date(now.getTime() - 29 * 86_400_000).toISOString().slice(0, 10);
  const [users, todayWriters, weekWriters, monthWriters, entries, newToday, newWeek, aiTotal, aiErrors] = await Promise.all([
    prisma.user.count(),
    distinctWriters(today, today),
    distinctWriters(week),
    distinctWriters(month),
    prisma.diaryEntry.count(),
    prisma.user.count({ where: { createdAt: { gte: new Date(`${today}T00:00:00.000Z`) } } }),
    prisma.user.count({ where: { createdAt: { gte: new Date(`${week}T00:00:00.000Z`) } } }),
    prisma.aiMetric.count(),
    prisma.aiMetric.count({ where: { status: "error" } })
  ]);
  const average = monthWriters >= 5
    ? await prisma.diaryEntry.aggregate({ where: { entryDate: { gte: month } }, _avg: { contentLength: true } })
    : null;
  await prisma.adminAuditLog.create({ data: { adminSubject, sessionId, action: "stats.view" } });
  return {
    users,
    writers: { today: todayWriters, week: weekWriters, month: monthWriters },
    entries,
    registrations: { today: newToday, week: newWeek },
    averageLength: average?._avg.contentLength ?? null,
    suppressed: monthWriters < 5,
    ai: { calls: aiTotal, errorRate: aiTotal ? aiErrors / aiTotal : 0 }
  };
}
