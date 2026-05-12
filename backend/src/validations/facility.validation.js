const Joi = require('joi');

const facilityValidation = {
  create: Joi.object({
    name: Joi.string().min(3).required(),
    description: Joi.string().allow('', null),
    capacity: Joi.number().integer().min(1).required(),
  }),

  update: Joi.object({
    name: Joi.string().min(3),
    description: Joi.string().allow('', null),
    capacity: Joi.number().integer().min(1),
  }),

  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  idParam: Joi.object({
    id: Joi.string().guid({ version: 'uuidv4' }).required(),
  }),
};

module.exports = facilityValidation;
