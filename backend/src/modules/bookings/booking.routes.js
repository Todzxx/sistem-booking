const express = require('express');
const bookingController = require('./booking.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');

const router = express.Router();

/**
 * Rute untuk Sistem Pemesanan (Booking System)
 * Semua rute memerlukan autentikasi
 */
router.use(authMiddleware);

// Mengecek ketersediaan (Parameter query: facilityId, startTime, endTime)
router.get('/check', bookingController.checkAvailability);

// Mengambil semua pemesanan untuk fasilitas tertentu (bagian dari Sistem Kalender)
router.get('/facility/:facilityId', bookingController.getBookingsByFacility);

// Operasi Pengguna
router.post('/', bookingController.createBooking);
router.get('/my', bookingController.getMyBookings);
router.patch('/:id/cancel', bookingController.cancelBooking);

// Operasi Admin
router.get('/', roleMiddleware('ADMIN'), bookingController.getAllBookings);
router.patch('/:id/status', roleMiddleware('ADMIN'), bookingController.updateStatus);

module.exports = router;
