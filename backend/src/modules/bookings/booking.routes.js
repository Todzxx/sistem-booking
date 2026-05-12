const express = require('express');
const bookingController = require('./booking.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');

const router = express.Router();

router.use(authMiddleware);

/**
 * @swagger
 * /bookings/check:
 *   get:
 *     tags: [Bookings]
 *     summary: Check facility availability
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: facilityId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: startTime
 *         required: true
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: endTime
 *         required: true
 *         schema: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Availability result
 */
router.get('/check', bookingController.checkAvailability);

/**
 * @swagger
 * /bookings/facility/{facilityId}:
 *   get:
 *     tags: [Bookings]
 *     summary: Get bookings for a facility
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Facility bookings
 */
router.get('/facility/:facilityId', bookingController.getBookingsByFacility);

/**
 * @swagger
 * /bookings:
 *   post:
 *     tags: [Bookings]
 *     summary: Create a new booking
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [facilityId, startTime, endTime, purpose]
 *             properties:
 *               facilityId: { type: string, format: uuid }
 *               startTime: { type: string, format: date-time }
 *               endTime: { type: string, format: date-time }
 *               purpose: { type: string }
 *               isRecurring: { type: boolean }
 *               recurrenceType: { type: string, enum: [DAILY, WEEKLY, MONTHLY] }
 *               recurrenceCount: { type: integer, maximum: 12 }
 *     responses:
 *       201:
 *         description: Booking created
 */
router.post('/', bookingController.createBooking);

/**
 * @swagger
 * /bookings/my:
 *   get:
 *     tags: [Bookings]
 *     summary: Get current user's bookings
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: User's bookings with pagination
 */
router.get('/my', bookingController.getMyBookings);

/**
 * @swagger
 * /bookings/{id}/cancel:
 *   patch:
 *     tags: [Bookings]
 *     summary: Cancel own booking
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: cancelAll
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Booking cancelled
 */
router.patch('/:id/cancel', bookingController.cancelBooking);

/**
 * @swagger
 * /bookings:
 *   get:
 *     tags: [Admin - Bookings]
 *     summary: Get all bookings (Admin only)
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10, maximum: 100 }
 *     responses:
 *       200:
 *         description: All bookings with pagination
 */
router.get('/', roleMiddleware('ADMIN'), bookingController.getAllBookings);

/**
 * @swagger
 * /bookings/{id}/status:
 *   patch:
 *     tags: [Admin - Bookings]
 *     summary: Approve or reject a booking (Admin only)
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [APPROVED, REJECTED] }
 *               notes: { type: string }
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch('/:id/status', roleMiddleware('ADMIN'), bookingController.updateStatus);

module.exports = router;
