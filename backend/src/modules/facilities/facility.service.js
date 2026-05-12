const { db } = require('../../config/db');
const { facilities } = require('../../db/schema');
const { eq, and, asc, desc, sql } = require('drizzle-orm');
const AppError = require('../../utils/AppError');
const { createAndFetch } = require('../../utils/dbHelper');
const { v4: uuidv4 } = require('uuid');

/**
 * Service untuk mengelola logika terkait Fasilitas
 */
const facilityService = {
  /**
   * Mengambil semua fasilitas yang terdaftar
   */
  getAllFacilities: async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    const items = await db.query.facilities.findMany({
      where: eq(facilities.isActive, true),
      orderBy: [asc(facilities.name)],
      limit,
      offset,
    });
    const [{ count: total }] = await db.select({ count: sql`count(*)` }).from(facilities)
      .where(eq(facilities.isActive, true));
    const totalPages = Math.ceil(total / limit);
    return {
      items,
      pagination: { page, limit, total, totalPages, hasMore: page < totalPages },
    };
  },

  /**
   * Mengambil satu fasilitas berdasarkan ID
   * @param {string} id 
   */
  getFacilityById: async (id) => {
    const facility = await db.query.facilities.findFirst({
      where: and(eq(facilities.id, id), eq(facilities.isActive, true)),
    });

    if (!facility) {
      throw new AppError('Facility not found or inactive', 404);
    }

    return facility;
  },

  /**
   * Membuat fasilitas baru
   * @param {Object} facilityData 
   */
  createFacility: async (facilityData) => {
    const dataToInsert = {
      id: uuidv4(),
      ...facilityData,
    };
    return await createAndFetch(facilities, dataToInsert);
  },

  /**
   * Memperbarui fasilitas yang ada
   * @param {string} id 
   * @param {Object} updateData 
   */
  updateFacility: async (id, updateData) => {
    // Cek apakah ada
    const existingFacility = await db.query.facilities.findFirst({
      where: and(eq(facilities.id, id), eq(facilities.isActive, true)),
    });

    if (!existingFacility) {
      throw new AppError('Facility not found', 404);
    }

    await db.update(facilities)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(facilities.id, id));

    return await db.query.facilities.findFirst({
      where: eq(facilities.id, id),
    });
  },

  /**
   * Menghapus fasilitas (Penghapusan Lunak / Soft Delete)
   * @param {string} id 
   */
  deleteFacility: async (id) => {
    // Cek apakah ada
    const existingFacility = await db.query.facilities.findFirst({
      where: eq(facilities.id, id),
    });

    if (!existingFacility) {
      throw new AppError('Facility not found', 404);
    }

    // Penghapusan lunak: set isActive menjadi false
    await db.update(facilities)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(facilities.id, id));

    return { message: 'Facility deactivated successfully' };
  },
};

module.exports = facilityService;
