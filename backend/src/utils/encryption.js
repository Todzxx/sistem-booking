// ============================================================
// FILE: utils/encryption.js
// Enkripsi/dekripsi AES-256-GCM untuk data sensitif
// (misal: refresh token Google Calendar yang disimpan di DB)
// Format output: iv:authTag:ciphertext (hex)
// ============================================================

const crypto = require("crypto");

const ALGORITHM = "aes-256-gcm";
// Turunkan key 256-bit dari ENCRYPTION_KEY via SHA-256
const KEY = crypto
  .createHash("sha256")
  .update(process.env.ENCRYPTION_KEY || process.env.JWT_SECRET)
  .digest();

// Enkripsi — return string format "iv:authTag:ciphertext"
function encrypt(text) {
  const iv = crypto.randomBytes(16); // Initialization Vector acak
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex"); // Authentication tag untuk verifikasi integritas

  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

// Dekripsi — kebalikan dari encrypt
function decrypt(encryptedText) {
  const parts = encryptedText.split(":");
  if (parts.length !== 3) throw new Error("Invalid encrypted text format");

  const iv = Buffer.from(parts[0], "hex");
  const authTag = Buffer.from(parts[1], "hex");
  const encrypted = parts[2];

  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

module.exports = { encrypt, decrypt };
