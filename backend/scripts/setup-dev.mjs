import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import bcrypt from "bcrypt";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const target = join(root, ".env");
if (existsSync(target)) {
  console.log("backend/.env zaten var; mevcut dosya değiştirilmedi.");
  process.exit(0);
}

const adminPassword = `Sirdas-${randomBytes(12).toString("base64url")}!9A`;
const replacements = {
  "replace-with-at-least-32-random-characters": randomBytes(48).toString("base64url"),
  "replace-with-a-different-32-character-secret": randomBytes(48).toString("base64url"),
  "replace-with-base64-encoded-32-byte-key": randomBytes(32).toString("base64"),
  "replace-with-a-bcrypt-hash": await bcrypt.hash(adminPassword, 12)
};
let content = readFileSync(join(root, ".env.example"), "utf8");
for (const [from, to] of Object.entries(replacements)) content = content.replace(from, to);
writeFileSync(target, content, { encoding: "utf8", flag: "wx" });
console.log("Yerel ayarlar oluşturuldu.");
console.log("Geliştirme yöneticisi: yonetici");
console.log(`Geliştirme yönetici şifresi: ${adminPassword}`);
console.log("Bu bilgiler production ortamında mutlaka değiştirilmelidir.");
