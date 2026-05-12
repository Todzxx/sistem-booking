const express = require('express');
const paymentController = require('./payment.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/:id/pay', paymentController.payDeposit);
router.post('/:id/refund', roleMiddleware('ADMIN'), paymentController.refundDeposit);
router.get('/summary', roleMiddleware('ADMIN'), paymentController.getPaymentSummary);

module.exports = router;
