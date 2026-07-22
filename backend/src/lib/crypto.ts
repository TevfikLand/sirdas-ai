import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { env } from "../config/env.js";

export type CipherEnvelope = { ciphertext: string; iv: string; tag: string };

function key(): Buffer {
  const decoded = Buffer.from(env.ENCRYPTION_KEY, "base64");
  if (decoded.length !== 32) throw new Error("ENCRYPTION_KEY must decode to exactly 32 bytes");
  return decoded;
}

export function encryptJson(value: unknown): CipherEnvelope {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  return {
    ciphertext: ciphertext.toString("base64"),
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64")
  };
}

export function decryptJson<T>(envelope: CipherEnvelope): T {
  const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(envelope.iv, "base64"));
  decipher.setAuthTag(Buffer.from(envelope.tag, "base64"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(envelope.ciphertext, "base64")),
    decipher.final()
  ]);
  return JSON.parse(plaintext.toString("utf8")) as T;
}

export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
