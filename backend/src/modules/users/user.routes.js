const express = require('express');
const userController = require('./user.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, minLength: 3 }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 6 }
 *     responses:
 *       201:
 *         description: User registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string }
 *                 data: { $ref: '#/components/schemas/User' }
 */
router.post('/register', userController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', userController.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     responses:
 *       200:
 *         description: Token refreshed
 */
router.post('/refresh', userController.refreshToken);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout and revoke refresh token
 *     responses:
 *       200:
 *         description: Logged out
 */
router.post('/logout', userController.logout);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user profile
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { $ref: '#/components/schemas/User' }
 *   patch:
 *     tags: [Auth]
 *     summary: Update current user profile
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.get('/me', authMiddleware, userController.getMe);
router.patch('/me', authMiddleware, userController.updateProfile);

/**
 * @swagger
 * /auth/admin/users:
 *   get:
 *     tags: [Admin - Users]
 *     summary: List all users (Admin only)
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/admin/users', authMiddleware, roleMiddleware('ADMIN'), userController.getAllUsers);

/**
 * @swagger
 * /auth/admin/users/{id}/role:
 *   patch:
 *     tags: [Admin - Users]
 *     summary: Update user role (Admin only)
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
 *             required: [role]
 *             properties:
 *               role: { type: string, enum: [USER, ADMIN] }
 *     responses:
 *       200:
 *         description: Role updated
 */
router.patch('/admin/users/:id/role', authMiddleware, roleMiddleware('ADMIN'), userController.updateUserRole);

module.exports = router;
