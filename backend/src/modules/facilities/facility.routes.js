const express = require('express');
const facilityController = require('./facility.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');

const router = express.Router();

router.use(authMiddleware);

/**
 * @swagger
 * /facilities:
 *   get:
 *     tags: [Facilities]
 *     summary: Get paginated list of active facilities
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10, maximum: 100 }
 *     responses:
 *       200:
 *         description: Paginated facilities
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/Facility' }
 *                     pagination: { $ref: '#/components/schemas/Pagination' }
 */
router.get('/', facilityController.getAllFacilities);

/**
 * @swagger
 * /facilities/{id}:
 *   get:
 *     tags: [Facilities]
 *     summary: Get facility by ID
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Facility details
 */
router.get('/:id', facilityController.getFacilityById);

const upload = require('../../middleware/upload.middleware');
const validateImageMagicBytes = require('../../middleware/imageMagicBytes');

/**
 * @swagger
 * /facilities:
 *   post:
 *     tags: [Facilities]
 *     summary: Create a new facility (Admin only)
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, capacity]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               capacity: { type: integer }
 *               image: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Facility created
 */
router.post(
  '/',
  roleMiddleware('ADMIN'),
  upload.single('image'),
  validateImageMagicBytes,
  facilityController.createFacility
);

/**
 * @swagger
 * /facilities/{id}:
 *   patch:
 *     tags: [Facilities]
 *     summary: Update a facility (Admin only)
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               capacity: { type: integer }
 *               image: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Facility updated
 */
router.patch(
  '/:id',
  roleMiddleware('ADMIN'),
  upload.single('image'),
  validateImageMagicBytes,
  facilityController.updateFacility
);

/**
 * @swagger
 * /facilities/{id}:
 *   delete:
 *     tags: [Facilities]
 *     summary: Soft-delete (deactivate) a facility (Admin only)
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Facility deactivated
 */
router.delete(
  '/:id',
  roleMiddleware('ADMIN'),
  facilityController.deleteFacility
);

/**
 * @swagger
 * /facilities/admin/all:
 *   get:
 *     tags: [Facilities]
 *     summary: List all facilities including inactive (Admin only)
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: All facilities
 */
router.get(
  '/admin/all',
  roleMiddleware('ADMIN'),
  facilityController.getAllFacilitiesAdmin
);

/**
 * @swagger
 * /facilities/{id}/reactivate:
 *   patch:
 *     tags: [Facilities]
 *     summary: Reactivate a deactivated facility (Admin only)
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Facility reactivated
 */
router.patch(
  '/:id/reactivate',
  roleMiddleware('ADMIN'),
  facilityController.reactivateFacility
);

module.exports = router;
