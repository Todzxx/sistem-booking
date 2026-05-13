// ============================================================
// FILE: utils/revocationStore.js
// Penyimpanan token yang dicabut (revoked) di database MySQL
// Digunakan untuk logout dan rotasi refresh token (cegah replay attack)
// ============================================================

const { db } = require('../config/db');
const { revokedTokens } = require('../db/schema');
const { eq, lte } = require('drizzle-orm');

// Cek apakah suatu jti sudah pernah dicabut
// Fail-closed: jika DB error, anggap revoked (lebih aman)
const isRevoked = async (jti) => {
  if (!jti) return false;
  try {
    const result = await db.select().from(revokedTokens).where(eq(revokedTokens.jti, jti)).limit(1);
    return result.length > 0;
  } catch (error) {
    console.error('Error checking revoked token (failing closed):', error);
    return true;
  }
};

// Deteksi error duplicate entry dari MySQL (errno 1062)
const isDuplicateJtiError = (error) => {
  const code = error?.code || error?.cause?.code;
  const errno = error?.errno || error?.cause?.errno;
  return code === 'ER_DUP_ENTRY' || errno === 1062;
};

// Revoke token: simpan jti ke tabel revoked_tokens
// Jika jti sudah ada (duplicate), berarti token sudah pernah dicabut — return false
const revoke = async (jti, exp) => {
  if (!jti) return false;
  try {
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = exp && exp > now ? exp : now + (7 * 24 * 60 * 60); // default 7 hari

    try {
      await db.insert(revokedTokens).values({ jti, expiresAt });
    } catch (insertError) {
      if (isDuplicateJtiError(insertError)) return false;
      throw insertError;
    }

    // Bersihkan token expired untuk efisiensi storage
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

module.exports = { isRevoked, revoke };
