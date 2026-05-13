// ============================================================
// FILE: modules/payments/payment.controller.js
// Controller pembayaran deposit — bayar, refund, ringkasan
// Hanya booking APPROVED yang bisa dibayar
// ============================================================

const Joi = require('joi');
const paymentService = require('./payment.service');
const { success } = require('../../utils/responseHandler');
const AppError = require('../../utils/AppError');

const PAYMENT_METHODS = ['BANK_TRANSFER', 'CASH', 'E_WALLET'];

const paymentController = {
  // POST /payments/:id/pay — bayar deposit untuk booking yang sudah APPROVED
  payDeposit: async (req, res, next) => {
    try {
      const { error: paramError, value: paramValue } = Joi.object({
        id: Joi.string().guid({ version: 'uuidv4' }).required(),
      }).validate(req.params);
      if (paramError) throw new AppError(paramError.details[0].message, 400);

      const { paymentMethod } = req.body;
      if (!paymentMethod || !PAYMENT_METHODS.includes(paymentMethod)) {
        throw new AppError('Invalid payment method. Choose: ' + PAYMENT_METHODS.join(', '), 400);
      }

      const data = await paymentService.payDeposit(paramValue.id, req.user.id, paymentMethod);
      return success(res, 'Deposit paid successfully', data);
    } catch (error) { next(error); }
  },

  // POST /payments/:id/refund — (Admin) refund deposit
  refundDeposit: async (req, res, next) => {
    try {
      const { error: paramError, value: paramValue } = Joi.object({
        id: Joi.string().guid({ version: 'uuidv4' }).required(),
      }).validate(req.params);
      if (paramError) throw new AppError(paramError.details[0].message, 400);

      const data = await paymentService.refundDeposit(paramValue.id);
      return success(res, 'Deposit refunded successfully', data);
    } catch (error) { next(error); }
  },

  // GET /payments/summary — (Admin) ringkasan statistik pembayaran
  getPaymentSummary: async (req, res, next) => {
    try {
      const data = await paymentService.getPaymentSummary();
      return success(res, 'Payment summary retrieved', data);
    } catch (error) { next(error); }
  },
};

module.exports = paymentController;
