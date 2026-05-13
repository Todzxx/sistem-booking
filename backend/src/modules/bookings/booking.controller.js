// ============================================================
// FILE: modules/bookings/booking.controller.js
// Controller untuk booking — CRUD + cek ketersediaan + cancel
// Semua endpoint butuh autentikasi (kecuali internal)
// ============================================================

const bookingService = require('./booking.service');
const { success, paginated } = require('../../utils/responseHandler');
const bookingValidation = require('../../validations/booking.validation');
const AppError = require('../../utils/AppError');

const bookingController = {
  // GET /bookings/check?facilityId=&startTime=&endTime=
  checkAvailability: async (req, res, next) => {
    try {
      const { error, value } = bookingValidation.checkAvailability.validate(req.query);
      if (error) throw new AppError(error.details[0].message, 400);

      const isAvailable = await bookingService.checkAvailability(value.facilityId, value.startTime, value.endTime);
      return success(res, 'Availability checked', { isAvailable });
    } catch (error) { next(error); }
  },

  // POST /bookings — buat booking baru (bisa recurring)
  createBooking: async (req, res, next) => {
    try {
      const { error, value } = bookingValidation.createBooking.validate(req.body);
      if (error) throw new AppError(error.details[0].message, 400);

      const booking = await bookingService.createBooking(value, req.user.id);
      return success(res, 'Booking created successfully', booking, 201);
    } catch (error) { next(error); }
  },

  // GET /bookings/my — booking milik user yang login (dengan pagination)
  getMyBookings: async (req, res, next) => {
    try {
      const { error, value } = bookingValidation.pagination.validate(req.query);
      if (error) throw new AppError(error.details[0].message, 400);

      const { page, limit } = value;
      const result = await bookingService.getUserBookings(req.user.id, page, limit);
      return paginated(res, 'Bookings retrieved', result);
    } catch (error) { next(error); }
  },

  // GET /bookings — (Admin) semua booking di sistem
  getAllBookings: async (req, res, next) => {
    try {
      const { error, value } = bookingValidation.pagination.validate(req.query);
      if (error) throw new AppError(error.details[0].message, 400);

      const { page, limit } = value;
      const result = await bookingService.getAllBookings(page, limit);
      return paginated(res, 'Bookings retrieved', result);
    } catch (error) { next(error); }
  },

  // PATCH /bookings/:id/status — (Admin) approve/reject booking
  updateStatus: async (req, res, next) => {
    try {
      const { error: paramError, value: paramValue } = bookingValidation.idParam.validate(req.params);
      if (paramError) throw new AppError(paramError.details[0].message, 400);

      const { error, value } = bookingValidation.updateStatus.validate(req.body);
      if (error) throw new AppError(error.details[0].message, 400);

      const data = await bookingService.updateStatus(paramValue.id, value.status, value.notes);
      return success(res, `Booking has been ${value.status.toLowerCase()}`, data);
    } catch (error) { next(error); }
  },

  // PATCH /bookings/:id/cancel?cancelAll=true — batalkan booking (hanya pemilik)
  cancelBooking: async (req, res, next) => {
    try {
      const { error: paramError, value: paramValue } = bookingValidation.idParam.validate(req.params);
      if (paramError) throw new AppError(paramError.details[0].message, 400);

      const data = await bookingService.cancelBooking(paramValue.id, req.user.id, req.query.cancelAll === 'true');
      return success(res, 'Booking cancelled successfully', data);
    } catch (error) { next(error); }
  },

  // GET /bookings/facility/:facilityId — booking per fasilitas
  getBookingsByFacility: async (req, res, next) => {
    try {
      const { error: paramError, value: paramValue } = bookingValidation.facilityIdParam.validate(req.params);
      if (paramError) throw new AppError(paramError.details[0].message, 400);

      const { error, value } = bookingValidation.pagination.validate(req.query);
      if (error) throw new AppError(error.details[0].message, 400);

      const result = await bookingService.getBookingsByFacility(paramValue.facilityId, value.page, value.limit);
      return paginated(res, 'Facility bookings fetched successfully', result);
    } catch (error) { next(error); }
  },
};

module.exports = bookingController;
