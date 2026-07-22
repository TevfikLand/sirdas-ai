import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

describe("admin stats privacy", () => {
  it("never selects diary content or analysis columns", () => {
    const source = readFileSync(fileURLToPath(new URL("./stats.service.ts", import.meta.url)), "utf8");
    expect(source).not.toMatch(/encryptedContent|encryptedAnalysis|contentIv|analysisIv|email:\s*true/);
    expect(source).toContain("COUNT(DISTINCT");
  });
});
