// ============================================================
// FILE: modules/facilities/facility.controller.js
// Controller untuk fasilitas — CRUD + soft-delete + reactivate
// Endpoint publik hanya menampilkan fasilitas aktif
// ============================================================

const facilityService = require('./facility.service');
const { success, paginated } = require('../../utils/responseHandler');
const facilityValidation = require('../../validations/facility.validation');
const AppError = require('../../utils/AppError');

const facilityController = {
  // GET /facilities — (publik) daftar fasilitas aktif
  getAllFacilities: async (req, res, next) => {
    try {
      const { error, value } = facilityValidation.pagination.validate(req.query);
      if (error) throw new AppError(error.details[0].message, 400);
      const result = await facilityService.getAllFacilities(value.page, value.limit);
      return paginated(res, 'Facilities retrieved', result);
    } catch (error) { next(error); }
  },

  // GET /facilities/:id — (publik) detail satu fasilitas aktif
  getFacilityById: async (req, res, next) => {
    try {
      const { error, value } = facilityValidation.idParam.validate(req.params);
      if (error) throw new AppError(error.details[0].message, 400);
      const data = await facilityService.getFacilityById(value.id);
      return success(res, 'Facility fetched successfully', data);
    } catch (error) { next(error); }
  },

  // POST /facilities — (Admin) buat fasilitas baru (dengan upload gambar)
  createFacility: async (req, res, next) => {
    try {
      const { error, value } = facilityValidation.create.validate(req.body);
      if (error) throw new AppError(error.details[0].message, 400);
      if (req.file) value.imageUrl = `/uploads/${req.file.filename}`;
      const data = await facilityService.createFacility(value);
      return success(res, 'Facility created successfully', data, 201);
    } catch (error) { next(error); }
  },

  // PUT /facilities/:id — (Admin) update fasilitas
  updateFacility: async (req, res, next) => {
    try {
      const { error: paramError, value: paramValue } = facilityValidation.idParam.validate(req.params);
      if (paramError) throw new AppError(paramError.details[0].message, 400);
      const { error, value } = facilityValidation.update.validate(req.body);
      if (error) throw new AppError(error.details[0].message, 400);
      if (req.file) value.imageUrl = `/uploads/${req.file.filename}`;
      const data = await facilityService.updateFacility(paramValue.id, value);
      return success(res, 'Facility updated successfully', data);
    } catch (error) { next(error); }
  },

  // DELETE /facilities/:id — (Admin) soft-delete (set isActive = false)
  deleteFacility: async (req, res, next) => {
    try {
      const { error, value } = facilityValidation.idParam.validate(req.params);
      if (error) throw new AppError(error.details[0].message, 400);
      await facilityService.deleteFacility(value.id);
      return success(res, 'Facility deleted successfully', null, 200);
    } catch (error) { next(error); }
  },

  // GET /facilities/admin — (Admin) lihat semua fasilitas (termasuk nonaktif)
  getAllFacilitiesAdmin: async (req, res, next) => {
    try {
      const { error, value } = facilityValidation.pagination.validate(req.query);
      if (error) throw new AppError(error.details[0].message, 400);
      const result = await facilityService.getAllFacilitiesAdmin(value.page, value.limit);
      return paginated(res, 'All facilities retrieved', result);
    } catch (error) { next(error); }
  },

  // PATCH /facilities/:id/reactivate — (Admin) aktifkan kembali fasilitas
  reactivateFacility: async (req, res, next) => {
    try {
      const { error, value } = facilityValidation.idParam.validate(req.params);
      if (error) throw new AppError(error.details[0].message, 400);
      const data = await facilityService.reactivateFacility(value.id);
      return success(res, 'Facility reactivated successfully', data);
    } catch (error) { next(error); }
  },
};

module.exports = facilityController;
