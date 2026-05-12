/**
 * Abstraksi penyimpanan token yang dicabut (revocation store).
 * Menggunakan database MySQL (via Drizzle ORM) untuk penyimpanan yang persisten.
 */

const { db } = require('../config/db');
const { revokedTokens } = require('../db/schema');
const { eq, lte } = require('drizzle-orm');

const isRevoked = async (jti) => {
  if (!jti) return false;
  try {
    const result = await db.select().from(revokedTokens).where(eq(revokedTokens.jti, jti)).limit(1);
    return result.length > 0;
  } catch (error) {
    console.error('Error checking revoked token:', error);
    return false; // Anggap token valid jika terjadi error (hindari false positive lockout)
  }
};

const revoke = async (jti, exp) => {
  if (!jti) return;
  try {
    // exp adalah masa kedaluwarsa token dalam format UNIX timestamp (detik)
    const expiresAt = exp || Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);

    // Coba masukkan token ke database, abaikan jika sudah ada
    try {
      await db.insert(revokedTokens).values({
        jti,
        expiresAt,
      });
    } catch (insertError) {
      // Abaikan error duplikat
      if (insertError.code !== 'ER_DUP_ENTRY') {
        throw insertError;
      }
    }

    // Bersihkan token yang sudah lewat masa kedaluwarsanya untuk menghemat kapasitas db
    await db.delete(revokedTokens).where(lte(revokedTokens.expiresAt, Math.floor(Date.now() / 1000)));
  } catch (error) {
    console.error('Error revoking token:', error);
  }
};

module.exports = {
  isRevoked,
  revoke,
};