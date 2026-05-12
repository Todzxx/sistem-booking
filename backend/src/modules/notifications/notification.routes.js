const express = require('express');
const authMiddleware = require('../../middleware/auth.middleware');
const { notificationService } = require('../../services/notificationService');

const router = express.Router();

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
