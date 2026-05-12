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
};

module.exports = userValidation;
