// ============================================================
// FILE: modules/payments/payment.routes.js
// Route pembayaran — bayar deposit (user), refund & summary (admin)
// Dipasang di /api/v1/payments oleh app.js
// ============================================================

const express = require('express');
const paymentController = require('./payment.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');

const router = express.Router();

router.use(authMiddleware); // Semua route butuh login

router.post('/:id/pay', paymentController.payDeposit);              // Bayar deposit (user)
router.post('/:id/refund', roleMiddleware('ADMIN'), paymentController.refundDeposit); // Refund (admin)
router.get('/summary', roleMiddleware('ADMIN'), paymentController.getPaymentSummary);  // Ringkasan (admin)

module.exports = router;
