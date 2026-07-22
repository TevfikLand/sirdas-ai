import { describe, expect, it } from "vitest";
import { decryptJson, encryptJson } from "./crypto.js";

describe("encrypted content", () => {
  it("does not expose plaintext and uses a fresh IV", () => {
    const value = { pages: ["yalnızca bana ait bir metin"] };
    const first = encryptJson(value); const second = encryptJson(value);
    expect(first.ciphertext).not.toContain("yalnızca");
    expect(first.iv).not.toBe(second.iv);
    expect(decryptJson(first)).toEqual(value);
  });

  it("rejects tampered ciphertext", () => {
    const value = encryptJson({ pages: ["güvenli"] });
    expect(() => decryptJson({ ...value, tag: Buffer.alloc(16).toString("base64") })).toThrow();
  });
});
