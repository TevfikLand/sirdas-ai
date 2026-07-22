CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "kvkkVersion" TEXT NOT NULL,
    "kvkkAcceptedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "RefreshSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tokenHash" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "userId" TEXT,
    "expiresAt" DATETIME NOT NULL,
    "revokedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RefreshSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "DiaryEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "entryDate" TEXT NOT NULL,
    "encryptedContent" TEXT NOT NULL,
    "contentIv" TEXT NOT NULL,
    "contentTag" TEXT NOT NULL,
    "contentLength" INTEGER NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "finalizedAt" DATETIME,
    "encryptedAnalysis" TEXT,
    "analysisIv" TEXT,
    "analysisTag" TEXT,
    "analysisStatus" TEXT NOT NULL DEFAULT 'idle',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DiaryEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "AdminDiaryEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adminSubject" TEXT NOT NULL,
    "entryDate" TEXT NOT NULL,
    "encryptedContent" TEXT NOT NULL,
    "contentIv" TEXT NOT NULL,
    "contentTag" TEXT NOT NULL,
    "contentLength" INTEGER NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "AiMetric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "AdminAuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adminSubject" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "RefreshSession_tokenHash_key" ON "RefreshSession"("tokenHash");
CREATE INDEX "RefreshSession_familyId_idx" ON "RefreshSession"("familyId");
CREATE INDEX "RefreshSession_userId_idx" ON "RefreshSession"("userId");
CREATE INDEX "DiaryEntry_entryDate_idx" ON "DiaryEntry"("entryDate");
CREATE UNIQUE INDEX "DiaryEntry_userId_entryDate_key" ON "DiaryEntry"("userId", "entryDate");
CREATE UNIQUE INDEX "AdminDiaryEntry_adminSubject_entryDate_key" ON "AdminDiaryEntry"("adminSubject", "entryDate");
CREATE INDEX "AiMetric_createdAt_idx" ON "AiMetric"("createdAt");
CREATE INDEX "AdminAuditLog_createdAt_idx" ON "AdminAuditLog"("createdAt");
