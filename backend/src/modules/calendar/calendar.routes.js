const express = require('express');
const calendarController = require('./calendar.controller');
const authMiddleware = require('../../middleware/auth.middleware');

const router = express.Router();

router.get('/auth', authMiddleware, calendarController.getAuthUrl);
router.get('/oauth/callback', calendarController.handleCallback);
router.get('/status', authMiddleware, calendarController.checkConnection);
router.post('/events/:id', authMiddleware, calendarController.createEvent);
router.delete('/events/:id', authMiddleware, calendarController.deleteEvent);
router.get('/link/:id', authMiddleware, calendarController.generateLink);

module.exports = router;
