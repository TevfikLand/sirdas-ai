import { describe, expect, it } from "vitest";
import { getAiProvider } from "./provider.js";
import { SYSTEM_PROMPT } from "./promptTemplates.js";

describe("AI safety boundary", () => {
  it("is disabled until a provider is configured", async () => {
    await expect(getAiProvider().analyzeEntry("test")).rejects.toThrow("AI_NOT_CONFIGURED");
  });

  it("never advertises 182 as a crisis line", () => {
    expect(SYSTEM_PROMPT).not.toContain("182");
    expect(SYSTEM_PROMPT).toContain("klinik teşhis");
  });
});
