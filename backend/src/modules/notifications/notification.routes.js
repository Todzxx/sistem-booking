const express = require('express');
const authMiddleware = require('../../middleware/auth.middleware');
const { notificationService } = require('../../services/notificationService');
const { db } = require('../../config/db');
const { notifications } = require('../../db/schema');
const { eq, desc } = require('drizzle-orm');

const router = express.Router();

router.use(authMiddleware);

/**
 * @swagger
 * /notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get user's notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 */
router.get('/', async (req, res, next) => {
  try {
    const userNotifications = await db.query.notifications.findMany({
      where: eq(notifications.userId, req.user.id),
      orderBy: [desc(notifications.createdAt)],
      limit: 50,
    });
    res.json({
      status: 'success',
      data: userNotifications,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /notifications/stream:
 *   get:
 *     tags: [Notifications]
 *     summary: SSE endpoint for real-time notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: SSE stream
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *               example: "data: {\"type\":\"CONNECTED\"}\n\n"
 */
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
  } catch (error) {
    next(error);
  }
});

module.exports = router;
