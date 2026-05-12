const express = require('express');
const userController = require('./user.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');

const router = express.Router();

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/refresh', userController.refreshToken);
router.post('/logout', userController.logout);

router.get('/me', authMiddleware, userController.getMe);
router.patch('/me', authMiddleware, userController.updateProfile);

router.get('/admin/users', authMiddleware, roleMiddleware('ADMIN'), userController.getAllUsers);
router.patch('/admin/users/:id/role', authMiddleware, roleMiddleware('ADMIN'), userController.updateUserRole);

module.exports = router;
