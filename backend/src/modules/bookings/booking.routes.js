// ============================================================
// FILE: modules/bookings/booking.routes.js
// Route booking — semuanya butuh auth, beberapa khusus ADMIN
// Dipasang di /api/v1/bookings oleh app.js
// ============================================================

const express = require('express');
const bookingController = require('./booking.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');

const router = express.Router();

router.use(authMiddleware); // Semua route booking butuh login

// === Route User ===
router.get('/check', bookingController.checkAvailability);                // Cek ketersediaan
router.get('/facility/:facilityId', bookingController.getBookingsByFacility); // Booking per fasilitas
router.post('/', bookingController.createBooking);                        // Buat booking baru
router.get('/my', bookingController.getMyBookings);                       // Booking saya
router.patch('/:id/cancel', bookingController.cancelBooking);             // Batalkan booking

// === Route Admin ===
router.get('/', roleMiddleware('ADMIN'), bookingController.getAllBookings);      // Semua booking
router.patch('/:id/status', roleMiddleware('ADMIN'), bookingController.updateStatus); // Approve/reject

module.exports = router;
