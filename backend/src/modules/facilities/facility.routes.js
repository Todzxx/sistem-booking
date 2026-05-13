// ============================================================
// FILE: modules/facilities/facility.routes.js
// Route fasilitas — publik (aktif) vs admin (semua + CRUD)
// Route admin dilengkapi upload gambar + validasi magic bytes
// Dipasang di /api/v1/facilities oleh app.js
// ============================================================

const express = require('express');
const facilityController = require('./facility.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');
const upload = require('../../middleware/upload.middleware');
const validateImageMagicBytes = require('../../middleware/imageMagicBytes');

const router = express.Router();

router.use(authMiddleware); // Semua route butuh login

// === Route Publik (user biasa) ===
router.get('/', facilityController.getAllFacilities);         // Daftar fasilitas aktif
router.get('/:id', facilityController.getFacilityById);       // Detail fasilitas

// === Route Admin ===
router.post('/', roleMiddleware('ADMIN'), upload.single('image'), validateImageMagicBytes, facilityController.createFacility);       // Tambah fasilitas
router.patch('/:id', roleMiddleware('ADMIN'), upload.single('image'), validateImageMagicBytes, facilityController.updateFacility);   // Update fasilitas
router.delete('/:id', roleMiddleware('ADMIN'), facilityController.deleteFacility);            // Soft-delete
router.get('/admin/all', roleMiddleware('ADMIN'), facilityController.getAllFacilitiesAdmin);  // Semua fasilitas (termasuk nonaktif)
router.patch('/:id/reactivate', roleMiddleware('ADMIN'), facilityController.reactivateFacility); // Aktifkan kembali

module.exports = router;
