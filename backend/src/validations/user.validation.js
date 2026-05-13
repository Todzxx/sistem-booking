const Joi = require('joi');

const userValidation = {
  register: Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    // role is removed to prevent escalation during registration
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  updateProfile: Joi.object({
    name: Joi.string().min(3).optional(),
    password: Joi.string().min(6).optional(),
  }),

  updateRole: Joi.object({
    role: Joi.string().valid('USER', 'ADMIN').required(),
  }),

  idParam: Joi.object({
    id: Joi.string().guid({ version: 'uuidv4' }).required(),
  }),
};

module.exports = userValidation;
