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
    console.error('Error checking revoked token (failing closed):', error);
    return true; // Fail closed: reject token jika DB error, lebih aman daripada false positive
  }
};

const isDuplicateJtiError = (error) => {
  const code = error?.code || error?.cause?.code;
  const errno = error?.errno || error?.cause?.errno;
  return code === 'ER_DUP_ENTRY' || errno === 1062;
};

const revoke = async (jti, exp) => {
  if (!jti) return false;
  try {
    // exp adalah masa kedaluwarsa token dalam format UNIX timestamp (detik)
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = exp && exp > now ? exp : now + (7 * 24 * 60 * 60);

    // Insert bersifat atomic: jika jti sudah ada, token sudah pernah dicabut/dipakai.
    try {
      await db.insert(revokedTokens).values({
        jti,
        expiresAt,
      });
    } catch (insertError) {
      if (isDuplicateJtiError(insertError)) {
        return false;
      }

      throw insertError;
    }

    // Bersihkan token yang sudah lewat masa kedaluwarsanya untuk menghemat kapasitas db
    try {
      await db.delete(revokedTokens).where(lte(revokedTokens.expiresAt, now));
    } catch (cleanupError) {
      console.error('Error cleaning expired revoked tokens:', cleanupError);
    }

    return true;
  } catch (error) {
    console.error('Error revoking token:', error);
    return false;
  }
};

module.exports = {
  isRevoked,
  revoke,
};
