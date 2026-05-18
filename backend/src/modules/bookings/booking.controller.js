const bookingService = require('./booking.service');
const { success, paginated } = require('../../utils/responseHandler');
const bookingValidation = require('../../validations/booking.validation');
const AppError = require('../../utils/AppError');

const bookingController = {
  // Mengecek apakah suatu fasilitas tersedia pada rentang waktu tertentu
  checkAvailability: async (req, res, next) => {
    try {
      const { error, value } = bookingValidation.checkAvailability.validate(req.query);
      if (error) throw new AppError(error.details[0].message, 400);

      const isAvailable = await bookingService.checkAvailability(value.facilityId, value.startTime, value.endTime);
      return success(res, 'Availability checked', { isAvailable });
    } catch (error) { next(error); }
  },

  // Membuat pemesanan baru
  createBooking: async (req, res, next) => {
    try {
      const { error, value } = bookingValidation.createBooking.validate(req.body);
      if (error) throw new AppError(error.details[0].message, 400);

      const booking = await bookingService.createBooking(value, req.user.id);
      return success(res, 'Booking created successfully', booking, 201);
    } catch (error) {
      next(error);
    }
  },

  // Mendapatkan daftar pemesanan milik pengguna yang sedang login
  getMyBookings: async (req, res, next) => {
    try {
      const { error, value } = bookingValidation.pagination.validate(req.query);
      if (error) throw new AppError(error.details[0].message, 400);

      const { page, limit } = value;
      const result = await bookingService.getUserBookings(req.user.id, page, limit);
      return paginated(res, 'Bookings retrieved', result);
    } catch (error) {
      next(error);
    }
  },

  // Mendapatkan semua pemesanan di sistem (Hanya untuk Admin)
  getAllBookings: async (req, res, next) => {
    try {
      const { error, value } = bookingValidation.pagination.validate(req.query);
      if (error) throw new AppError(error.details[0].message, 400);

      const { page, limit } = value;
      const result = await bookingService.getAllBookings(page, limit);
      return paginated(res, 'Bookings retrieved', result);
    } catch (error) {
      next(error);
    }
  },

  // Memperbarui status pemesanan (Hanya untuk Admin, misal: APPROVED/REJECTED)
  updateStatus: async (req, res, next) => {
    try {
      const { error: paramError, value: paramValue } = bookingValidation.idParam.validate(req.params);
      if (paramError) throw new AppError(paramError.details[0].message, 400);

      const { id } = paramValue;
      const { error, value } = bookingValidation.updateStatus.validate(req.body);
      if (error) throw new AppError(error.details[0].message, 400);

      const { status, notes } = value;
      const data = await bookingService.updateStatus(id, status, notes);
      return success(res, `Booking has been ${status.toLowerCase()}`, data);
    } catch (error) {
      next(error);
    }
  },

  // Membatalkan pemesanan yang masih berstatus PENDING (Hanya oleh pembuatnya)
  cancelBooking: async (req, res, next) => {
    try {
      const { error: paramError, value: paramValue } = bookingValidation.idParam.validate(req.params);
      if (paramError) throw new AppError(paramError.details[0].message, 400);

      const { id } = paramValue;
      const { cancelAll } = req.query;
      const data = await bookingService.cancelBooking(id, req.user.id, cancelAll === 'true');
      return success(res, 'Booking cancelled successfully', data);
    } catch (error) {
      next(error);
    }
  },

  // Mendapatkan semua pemesanan berdasarkan ID fasilitas
  getBookingsByFacility: async (req, res, next) => {
    try {
      const { error: paramError, value: paramValue } = bookingValidation.facilityIdParam.validate(req.params);
      if (paramError) throw new AppError(paramError.details[0].message, 400);

      const { facilityId } = paramValue;
      const { error, value } = bookingValidation.pagination.validate(req.query);
      if (error) throw new AppError(error.details[0].message, 400);

      const { page, limit } = value;
      const result = await bookingService.getBookingsByFacility(facilityId, page, limit);
      return paginated(res, 'Facility bookings fetched successfully', result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = bookingController;
