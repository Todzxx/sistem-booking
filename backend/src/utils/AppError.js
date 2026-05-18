// ============================================================
// FILE: utils/AppError.js
// Custom error class — membedakan error operasional (4xx/5xx) dari programming bug
// Digunakan di seluruh aplikasi agar error handling konsisten
// ============================================================

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    // "fail" untuk 4xx (kesalahan client), "error" untuk 5xx (kesalahan server)
    this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
    this.isOperational = true; // Tandai sebagai error yang diperkirakan

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
