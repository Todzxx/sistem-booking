// ============================================================
// FILE: modules/notifications/notification.routes.js
// Route notifikasi — GET daftar notifikasi + SSE streaming real-time
// Dipasang di /api/v1/notifications oleh app.js
// ============================================================

const express = require('express');
const authMiddleware = require('../../middleware/auth.middleware');
const { notificationService } = require('../../services/notificationService');
const { db } = require('../../config/db');
const { notifications } = require('../../db/schema');
const { eq, desc } = require('drizzle-orm');

const router = express.Router();

router.use(authMiddleware); // Semua route notifikasi butuh login

// GET /notifications — ambil 50 notifikasi terbaru milik user
router.get('/', async (req, res, next) => {
  try {
    const userNotifications = await db.query.notifications.findMany({
      where: eq(notifications.userId, req.user.id),
      orderBy: [desc(notifications.createdAt)],
      limit: 50,
    });
    res.json({ status: 'success', data: userNotifications });
  } catch (error) { next(error); }
});

// GET /notifications/stream — SSE endpoint untuk notifikasi real-time
router.get('/stream', authMiddleware, async (req, res, next) => {
  try {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    res.write(`data: ${JSON.stringify({ type: 'CONNECTED' })}\n\n`);

    notificationService.subscribe(req.user.id, res);
  } catch (error) { next(error); }
});

module.exports = router;
