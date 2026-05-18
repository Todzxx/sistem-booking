// ============================================================
// FILE: validations/facility.validation.js
// Validasi input untuk fasilitas — create, update, pagination
// depositAmount opsional, default 0
// ============================================================

const Joi = require('joi');

const facilityValidation = {
  create: Joi.object({
    name: Joi.string().min(3).required(),
    description: Joi.string().allow('', null),
    capacity: Joi.number().integer().min(1).required(),
    depositAmount: Joi.number().min(0).precision(2).default(0),
  }),

  update: Joi.object({
    name: Joi.string().min(3),
    description: Joi.string().allow('', null),
    capacity: Joi.number().integer().min(1),
    depositAmount: Joi.number().min(0).precision(2),
  }),

  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  idParam: Joi.object({ id: Joi.string().guid({ version: 'uuidv4' }).required() }),
};

module.exports = facilityValidation;
