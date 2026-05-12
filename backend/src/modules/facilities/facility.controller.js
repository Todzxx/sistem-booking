
const facilityService = require('./facility.service');
const { success } = require('../../utils/responseHandler');
const facilityValidation = require('../../validations/facility.validation');
const AppError = require('../../utils/AppError');

const facilityController = {
  getAllFacilities: async (req, res, next) => {
    try {
      const { error, value } = facilityValidation.pagination.validate(req.query);
      if (error) throw new AppError(error.details[0].message, 400);

      const { page, limit } = value;
      const facilities = await facilityService.getAllFacilities(page, limit);
      return success(res, 'Facilities retrieved', { facilities, page, limit });
    } catch (error) {
      next(error);
    }
  },

  getFacilityById: async (req, res, next) => {
    try {
      const { error, value } = facilityValidation.idParam.validate(req.params);
      if (error) throw new AppError(error.details[0].message, 400);

      const { id } = value;
      const data = await facilityService.getFacilityById(id);
      return success(res, 'Facility fetched successfully', data);
    } catch (error) {
      next(error);
    }
  },

  createFacility: async (req, res, next) => {
    try {
      const { error, value } = facilityValidation.create.validate(req.body);
      if (error) {
        throw new AppError(error.details[0].message, 400);
      }

      if (req.file) {
        value.imageUrl = `/uploads/${req.file.filename}`;
      }

      const data = await facilityService.createFacility(value);
      return success(res, 'Facility created successfully', data, 201);
    } catch (error) {
      next(error);
    }
  },

  updateFacility: async (req, res, next) => {
    try {
      const { error: paramError, value: paramValue } = facilityValidation.idParam.validate(req.params);
      if (paramError) throw new AppError(paramError.details[0].message, 400);

      const { id } = paramValue;
      const { error, value } = facilityValidation.update.validate(req.body);
      if (error) {
        throw new AppError(error.details[0].message, 400);
      }

      if (req.file) {
        value.imageUrl = `/uploads/${req.file.filename}`;
      }

      const data = await facilityService.updateFacility(id, value);
      return success(res, 'Facility updated successfully', data);
    } catch (error) {
      next(error);
    }
  },

  deleteFacility: async (req, res, next) => {
    try {
      const { error, value } = facilityValidation.idParam.validate(req.params);
      if (error) throw new AppError(error.details[0].message, 400);

      const { id } = value;
      await facilityService.deleteFacility(id);
      return success(res, 'Facility deleted successfully', null, 200);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = facilityController;
