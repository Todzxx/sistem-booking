const express = require('express');
const authMiddleware = require('../../middleware/auth.middleware');
const { verifyAccessToken } = require('../../utils/token');
const { isRevoked } = require('../../utils/revocationStore');
const { notificationService } = require('../../services/notificationService');
const AppError = require('../../utils/AppError');

const router = express.Router();

/**
 * @swagger
 * /notifications/stream:
 *   get:
 *     tags: [Notifications]
 *     summary: SSE endpoint for real-time notifications
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema: { type: string }
 *         description: JWT access token
 *     responses:
 *       200:
 *         description: SSE stream
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *               example: "data: {\"type\":\"CONNECTED\"}\n\n"
 */
router.get('/stream', async (req, res, next) => {
  const token = req.query.token;

  if (!token) {
    return next(new AppError('Token query parameter is required', 401));
  }

  try {
    const decoded = verifyAccessToken(token);
    if (!decoded) throw new AppError('Invalid or expired token', 401);

    const revoked = await isRevoked(decoded.jti);
    if (revoked) throw new AppError('Token has been revoked', 401);

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    res.write(`data: ${JSON.stringify({ type: 'CONNECTED' })}\n\n`);

    notificationService.subscribe(decoded.id, res);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
