// ============================================================
// FILE: modules/users/user.routes.js
// Route definitions untuk auth & admin user
// Semua route dipasang di /api/v1/auth oleh app.js
// ============================================================

const express = require('express');
const userController = require('./user.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');

const router = express.Router();

// === Route Publik (tanpa auth) ===
router.post('/register', userController.register);   // Daftar akun baru
router.post('/login', userController.login);         // Login
router.post('/refresh', userController.refreshToken); // Rotasi refresh token
router.post('/logout', userController.logout);       // Logout

// === Route User (perlu login) ===
router.get('/me', authMiddleware, userController.getMe);          // Lihat profil sendiri
router.patch('/me', authMiddleware, userController.updateProfile); // Update profil sendiri

// === Route Admin (perlu login + role ADMIN) ===
router.get('/admin/users', authMiddleware, roleMiddleware('ADMIN'), userController.getAllUsers);            // Lihat semua user
router.patch('/admin/users/:id/role', authMiddleware, roleMiddleware('ADMIN'), userController.updateUserRole); // Ubah role user

module.exports = router;
