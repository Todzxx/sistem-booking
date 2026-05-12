const AppError = require('../utils/AppError');
const { verifyAccessToken } = require('../utils/token');
const { isRevoked } = require('../utils/revocationStore');

/**
 * Middleware untuk melindungi rute dan memverifikasi token JWT
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError('Token not provided', 401);
    }

    // Verifikasi token menggunakan utilitas terpusat (juga mengecek iss/aud)
    const decoded = verifyAccessToken(token);
    if (!decoded) throw new AppError('Invalid or expired token', 401);

    // Cek penyimpanan token yang dicabut berdasarkan jti
    const revoked = await isRevoked(decoded.jti);
    if (revoked) throw new AppError('Token has been revoked', 401);

    // Lampirkan data pengguna ke objek request (payload JWT sudah berisi id dan role)
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware;
