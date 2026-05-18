// ============================================================
// FILE: modules/calendar/calendar.routes.js
// Route Google Calendar — OAuth, event management, link generator
// Callback OAuth bersifat publik (tanpa auth)
// Dipasang di /api/v1/calendar oleh app.js
// ============================================================

const express = require('express');
const calendarController = require('./calendar.controller');
const authMiddleware = require('../../middleware/auth.middleware');

const router = express.Router();

router.get('/auth', authMiddleware, calendarController.getAuthUrl);         // Dapatkan URL OAuth
router.get('/oauth/callback', calendarController.handleCallback);           // Callback OAuth (publik)
router.get('/status', authMiddleware, calendarController.checkConnection);   // Cek koneksi
router.post('/events/:id', authMiddleware, calendarController.createEvent);  // Buat event
router.delete('/events/:id', authMiddleware, calendarController.deleteEvent); // Hapus event
router.get('/link/:id', authMiddleware, calendarController.generateLink);    // Generate link

module.exports = router;
