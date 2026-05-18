// ============================================================
// FILE: modules/payments/payment.service.js
// Service pembayaran — logika bayar deposit, refund, ringkasan
// Deposit diambil dari kolom depositAmount di tabel facilities
// ============================================================

const { db } = require('../../config/db');
const { bookings } = require('../../db/schema');
const { eq, sql } = require('drizzle-orm');
const { BOOKING_STATUS, PAYMENT_STATUS } = require('../../constants');
const AppError = require('../../utils/AppError');

const paymentService = {
  // Bayar deposit — validasi: booking harus APPROVED, milik user, belum dibayar, deposit > 0
  payDeposit: async (bookingId, userId, paymentMethod) => {
    const booking = await db.query.bookings.findFirst({ where: eq(bookings.id, bookingId) });
    if (!booking) throw new AppError('Booking not found', 404);
    if (booking.userId !== userId) throw new AppError('You can only pay for your own bookings', 403);
    if (booking.status !== BOOKING_STATUS.APPROVED) throw new AppError('Only approved bookings can be paid', 400);
    if (booking.paymentStatus === PAYMENT_STATUS.PAID) throw new AppError('Deposit already paid', 400);
    if (parseFloat(booking.depositAmount) === 0) throw new AppError('No deposit required for this booking', 400);

    await db.update(bookings)
      .set({ paymentStatus: PAYMENT_STATUS.PAID, paymentMethod, paidAt: new Date(), updatedAt: new Date() })
      .where(eq(bookings.id, bookingId));

    return db.query.bookings.findFirst({ where: eq(bookings.id, bookingId), with: { facility: true } });
  },

  // Refund — hanya untuk booking yang sudah PAID
  refundDeposit: async (bookingId) => {
    const booking = await db.query.bookings.findFirst({ where: eq(bookings.id, bookingId) });
    if (!booking) throw new AppError('Booking not found', 404);
    if (booking.paymentStatus !== PAYMENT_STATUS.PAID) throw new AppError('Booking deposit is not paid', 400);

    await db.update(bookings)
      .set({ paymentStatus: PAYMENT_STATUS.REFUNDED, updatedAt: new Date() })
      .where(eq(bookings.id, bookingId));

    return db.query.bookings.findFirst({ where: eq(bookings.id, bookingId), with: { facility: true } });
  },

  // Ringkasan pembayaran (total PAID, PENDING, REFUNDED)
  getPaymentSummary: async () => {
    const result = await db.execute(sql`
      SELECT
        COALESCE(SUM(CASE WHEN payment_status = 'PAID' THEN CAST(deposit_amount AS DECIMAL(12,2)) ELSE 0 END), 0) as totalPaid,
        COALESCE(SUM(CASE WHEN payment_status = 'UNPAID' THEN CAST(deposit_amount AS DECIMAL(12,2)) ELSE 0 END), 0) as totalPending,
        COALESCE(SUM(CASE WHEN payment_status = 'REFUNDED' THEN CAST(deposit_amount AS DECIMAL(12,2)) ELSE 0 END), 0) as totalRefunded,
        COUNT(CASE WHEN payment_status = 'PAID' THEN 1 END) as paidCount,
        COUNT(CASE WHEN payment_status = 'UNPAID' THEN 1 END) as unpaidCount,
        COUNT(CASE WHEN payment_status = 'REFUNDED' THEN 1 END) as refundedCount
      FROM bookings WHERE status IN ('APPROVED', 'CANCELLED')
    `);
    return result[0] || result.rows?.[0] || result;
  },
};

module.exports = paymentService;
