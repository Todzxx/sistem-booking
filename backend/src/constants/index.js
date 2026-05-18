// ============================================================
// FILE: constants/index.js
// Konstanta global — role user, status booking, status pembayaran
// Dipakai bersama oleh banyak modul agar konsisten
// ============================================================

const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
};

const BOOKING_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
};

const PAYMENT_STATUS = {
  UNPAID: 'UNPAID',
  PAID: 'PAID',
  REFUNDED: 'REFUNDED',
};

module.exports = {
  ROLES,
  BOOKING_STATUS,
  PAYMENT_STATUS,
};
