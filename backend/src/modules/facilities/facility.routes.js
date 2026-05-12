const express = require('express');
const facilityController = require('./facility.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');

const router = express.Router();

/**
 * Rute untuk Manajemen Fasilitas
 * Semua rute dilindungi oleh authMiddleware (membutuhkan login)
 */
router.use(authMiddleware);

// Dapat dibaca oleh semua pengguna yang sudah login
router.get('/', facilityController.getAllFacilities);
router.get('/:id', facilityController.getFacilityById);

const upload = require('../../middleware/upload.middleware');
const validateImageMagicBytes = require('../../middleware/imageMagicBytes');

// ... rute lainnya ...

// Operasi khusus Admin untuk mengelola fasilitas
router.post(
  '/',
  roleMiddleware('ADMIN'),
  upload.single('image'),
  validateImageMagicBytes,
  facilityController.createFacility
);

router.patch(
  '/:id',
  roleMiddleware('ADMIN'),
  upload.single('image'),
  validateImageMagicBytes,
  facilityController.updateFacility
);

router.delete(
  '/:id',
  roleMiddleware('ADMIN'),
  facilityController.deleteFacility
);

module.exports = router;
