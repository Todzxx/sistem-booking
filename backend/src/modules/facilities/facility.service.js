// ============================================================
// FILE: modules/facilities/facility.service.js
// Service untuk fasilitas — CRUD dengan soft-delete
// Versi publik hanya menampilkan isActive = true
// ============================================================

const { db } = require('../../config/db');
const { facilities } = require('../../db/schema');
const { eq, and, asc, sql } = require('drizzle-orm');
const AppError = require('../../utils/AppError');
const { createAndFetch } = require('../../utils/dbHelper');
const { v4: uuidv4 } = require('uuid');

const facilityService = {
  // (Publik) ambil fasilitas yang aktif saja
  getAllFacilities: async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    const [items, [{ count: total }]] = await Promise.all([
      db.query.facilities.findMany({ where: eq(facilities.isActive, true), orderBy: [asc(facilities.name)], limit, offset }),
      db.select({ count: sql`count(*)` }).from(facilities).where(eq(facilities.isActive, true)),
    ]);
    const totalPages = Math.ceil(total / limit);
    return { items, pagination: { page, limit, total, totalPages, hasMore: page < totalPages } };
  },

  // (Admin) lihat semua fasilitas, termasuk yang nonaktif
  getAllFacilitiesAdmin: async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    const [items, [{ count: total }]] = await Promise.all([
      db.query.facilities.findMany({ orderBy: [asc(facilities.name)], limit, offset }),
      db.select({ count: sql`count(*)` }).from(facilities),
    ]);
    const totalPages = Math.ceil(total / limit);
    return { items, pagination: { page, limit, total, totalPages, hasMore: page < totalPages } };
  },

  // Ambil satu fasilitas (hanya yang aktif)
  getFacilityById: async (id) => {
    const facility = await db.query.facilities.findFirst({ where: and(eq(facilities.id, id), eq(facilities.isActive, true)) });
    if (!facility) throw new AppError('Facility not found or inactive', 404);
    return facility;
  },

  // Buat fasilitas baru
  createFacility: async (facilityData) => {
    return await createAndFetch(facilities, { id: uuidv4(), ...facilityData });
  },

  // Update fasilitas
  updateFacility: async (id, updateData) => {
    const existing = await db.query.facilities.findFirst({ where: eq(facilities.id, id) });
    if (!existing) throw new AppError('Facility not found', 404);
    await db.update(facilities).set({ ...updateData, updatedAt: new Date() }).where(eq(facilities.id, id));
    return db.query.facilities.findFirst({ where: eq(facilities.id, id) });
  },

  // Soft-delete: set isActive = false
  deleteFacility: async (id) => {
    const existing = await db.query.facilities.findFirst({ where: eq(facilities.id, id) });
    if (!existing) throw new AppError('Facility not found', 404);
    await db.update(facilities).set({ isActive: false, updatedAt: new Date() }).where(eq(facilities.id, id));
    return { message: 'Facility deactivated successfully' };
  },

  // Aktifkan kembali fasilitas yang di-soft-delete
  reactivateFacility: async (id) => {
    const existing = await db.query.facilities.findFirst({ where: eq(facilities.id, id) });
    if (!existing) throw new AppError('Facility not found', 404);
    if (existing.isActive) throw new AppError('Facility is already active', 400);
    await db.update(facilities).set({ isActive: true, updatedAt: new Date() }).where(eq(facilities.id, id));
    return db.query.facilities.findFirst({ where: eq(facilities.id, id) });
  },
};

module.exports = facilityService;
