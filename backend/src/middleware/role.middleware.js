// ============================================================
// FILE: middleware/role.middleware.js
// Middleware authorisasi — membatasi akses berdasarkan role user
// Contoh: roleMiddleware('ADMIN') hanya untuk admin
// ============================================================

const AppError = require('../utils/AppError');

const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    // Cek apakah role user termasuk dalam daftar yang diizinkan
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

module.exports = roleMiddleware;
