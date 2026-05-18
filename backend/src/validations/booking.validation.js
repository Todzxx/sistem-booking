// ============================================================
// FILE: validations/booking.validation.js
// Validasi input untuk booking — cek availability, create, update, pagination
// Support recurring booking dengan conditional validation
// ============================================================

const Joi = require('joi');

const bookingValidation = {
  // Validasi query params untuk cek ketersediaan
  checkAvailability: Joi.object({
    facilityId: Joi.string().guid({ version: 'uuidv4' }).required(),
    startTime: Joi.date().required(),
    endTime: Joi.date().greater(Joi.ref('startTime')).required(),
  }),

  // Validasi body untuk membuat booking baru (bisa recurring)
  createBooking: Joi.object({
    facilityId: Joi.string().guid({ version: 'uuidv4' }).required(),
    startTime: Joi.date().greater('now').required(),
    endTime: Joi.date().greater(Joi.ref('startTime')).required(),
    purpose: Joi.string().min(5).required(),
    isRecurring: Joi.boolean().default(false),
    recurrenceType: Joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY').default('WEEKLY')
      .when('isRecurring', { is: true, then: Joi.required(), otherwise: Joi.optional() }),
    recurrenceCount: Joi.number().integer().min(1).max(12)
      .when('isRecurring', { is: true, then: Joi.required(), otherwise: Joi.optional() }),
  }),

  // Validasi untuk update status (approve/reject) — notes wajib jika reject
  updateStatus: Joi.object({
    status: Joi.string().valid('APPROVED', 'REJECTED').required(),
    notes: Joi.string().when('status', {
      is: 'REJECTED',
      then: Joi.string().min(1).required().messages({
        'string.min': 'Admin note is required when rejecting a booking',
        'any.required': 'Admin note is required when rejecting a booking',
      }),
      otherwise: Joi.string().allow('', null),
    }),
  }),

  // Pagination standar
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  idParam: Joi.object({ id: Joi.string().guid({ version: 'uuidv4' }).required() }),
  facilityIdParam: Joi.object({ facilityId: Joi.string().guid({ version: 'uuidv4' }).required() }),
};

module.exports = bookingValidation;
