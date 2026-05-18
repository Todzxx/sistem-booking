// ============================================================
// FILE: utils/responseHandler.js
// Helper untuk membuat response JSON standar
// Semua response mengikuti format: { status, message, data }
// ============================================================

// Response sukses biasa
const success = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({ status: 'success', message, data });
};

// Response dengan pagination (untuk daftar/list)
const paginated = (res, message, { items, pagination: { page, limit, total, totalPages, hasMore } }, statusCode = 200) => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data: { items, pagination: { page, limit, total, totalPages, hasMore } },
  });
};

module.exports = { success, paginated };
