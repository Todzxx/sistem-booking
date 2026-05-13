// ============================================================
// FILE: middleware/auth.middleware.js
// Middleware autentikasi JWT — memvalidasi token Bearer, cek revoked,
// lalu melampirkan data user (id + role) ke req.user
// ============================================================

const AppError = require('../utils/AppError');
const { verifyAccessToken } = require('../utils/token');
const { isRevoked } = require('../utils/revocationStore');

const authMiddleware = async (req, res, next) => {
  try {
    // Ambil token dari header Authorization: Bearer <token>
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) throw new AppError('Token not provided', 401);

    // Verifikasi JWT (cek signature, issuer, audience, expired)
    const decoded = verifyAccessToken(token);
    if (!decoded) throw new AppError('Invalid or expired token', 401);

    // Cek apakah token sudah dicabut (revoked) — misal setelah logout
    const revoked = await isRevoked(decoded.jti);
    if (revoked) throw new AppError('Token has been revoked', 401);

    // Simpan data user ke req agar bisa dipakai controller selanjutnya
    req.user = { id: decoded.id, role: decoded.role };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware;
