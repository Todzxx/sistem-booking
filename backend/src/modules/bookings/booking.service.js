const { db } = require('../../config/db');
const { bookings, facilities, users } = require('../../db/schema');
const { eq, ne, and, or, lt, gt, lte, gte, inArray, desc, asc, sql } = require('drizzle-orm');
const { v4: uuidv4 } = require('uuid');
const { BOOKING_STATUS } = require('../../constants');
const AppError = require('../../utils/AppError');
const { createAndFetch } = require('../../utils/dbHelper');

/**
 * Service untuk mengelola Pemesanan (Booking) dengan deteksi jadwal bentrok, alur status, dan logika pengulangan (recurrence).
 */
const bookingService = {
  /**
   * Fungsi pembantu internal untuk mengecek pemesanan yang bentrok (overlapping)
   */
  isOverlapping: async (facilityId, startTime, endTime, tx = db, excludeBookingId = null) => {
    const overlapping = await tx.query.bookings.findFirst({
      where: and(
        eq(bookings.facilityId, facilityId),
        excludeBookingId ? ne(bookings.id, excludeBookingId) : undefined,
        inArray(bookings.status, [BOOKING_STATUS.PENDING, BOOKING_STATUS.APPROVED]),
        or(
          and(lt(bookings.startTime, endTime), gte(bookings.startTime, startTime)),
          and(gt(bookings.endTime, startTime), lte(bookings.endTime, endTime)),
          and(lte(bookings.startTime, startTime), gte(bookings.endTime, endTime))
        )
      ),
    });

    return !!overlapping;
  },

  /**
   * Pembantu untuk menghasilkan daftar tanggal berulang (tidak merubah nilai asli/non-mutating)
   */
  generateRecurringDates: (start, end, type, count) => {
    const dates = [];
    const startDate = new Date(start);
    const endDate = new Date(end);

    for (let i = 0; i < count; i++) {
      const nextStart = new Date(startDate);
      const nextEnd = new Date(endDate);
      
      if (type === 'DAILY') {
        nextStart.setDate(startDate.getDate() + i);
        nextEnd.setDate(endDate.getDate() + i);
      } else if (type === 'WEEKLY') {
        nextStart.setDate(startDate.getDate() + i * 7);
        nextEnd.setDate(endDate.getDate() + i * 7);
      } else if (type === 'MONTHLY') {
        // Kalkulasi bulanan yang lebih stabil untuk menghindari overflow (misal: 31 Jan -> 28/29 Feb)
        const targetMonth = startDate.getMonth() + i;
        nextStart.setMonth(targetMonth);
        if (nextStart.getMonth() > targetMonth % 12) {
          nextStart.setDate(0); // Set ke hari terakhir bulan sebelumnya
        }
        
        const monthDiff = nextStart.getTime() - startDate.getTime();
        nextEnd.setTime(endDate.getTime() + monthDiff);
      }
      
      dates.push({ startTime: nextStart, endTime: nextEnd });
    }
    return dates;
  },

  /**
   * Mengecek ketersediaan fasilitas
   */
  checkAvailability: async (facilityId, startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new AppError('Invalid date format', 400);
    }

    const hasOverlap = await bookingService.isOverlapping(facilityId, start, end);
    return !hasOverlap;
  },

  /**
   * Membuat pemesanan baru (Mendukung Pengulangan/Recurrence)
   * Menggunakan transaksi dengan penguncian yang tepat untuk mencegah kondisi balapan (race conditions)
   */
  createBooking: async (bookingData, userId) => {
    const { facilityId, startTime, endTime, purpose, isRecurring, recurrenceType, recurrenceCount } = bookingData;

    return await db.transaction(async (tx) => {
      // 1. Kunci baris fasilitas untuk mencegah pemesanan bersamaan untuk fasilitas yang sama
      await tx.execute(sql`SELECT id FROM facilities WHERE id = ${facilityId} FOR UPDATE`);

      // 2. Cek apakah fasilitas ada dan aktif
      const facility = await tx.query.facilities.findFirst({ 
        where: and(eq(facilities.id, facilityId), eq(facilities.isActive, true))
      });
      
      if (!facility) {
        throw new AppError('Facility not found or currently unavailable', 404);
      }

      // 3. Siapkan tanggal-tanggal
      const bookingDates = isRecurring
        ? bookingService.generateRecurringDates(startTime, endTime, recurrenceType, recurrenceCount)
        : [{ startTime: new Date(startTime), endTime: new Date(endTime) }];

      // 4. Buat ID grup pengulangan jika diperlukan
      const recurrenceGroupId = isRecurring ? uuidv4() : null;

      // 5. Cek bentrok dan buat pemesanan untuk setiap tanggal
      const createdBookings = [];
      for (const date of bookingDates) {
        const hasOverlap = await bookingService.isOverlapping(facilityId, date.startTime, date.endTime, tx);

        if (hasOverlap) {
          throw new AppError(`Time slot is already booked or pending at ${date.startTime.toLocaleString()}`, 409);
        }

        const id = uuidv4();
        await tx.insert(bookings).values({
          id,
          userId,
          facilityId,
          startTime: date.startTime,
          endTime: date.endTime,
          purpose,
          status: BOOKING_STATUS.PENDING,
          recurrenceGroupId,
        });

        const newBooking = await tx.query.bookings.findFirst({
          where: eq(bookings.id, id),
          with: { facility: true }
        });
        createdBookings.push(newBooking);
      }

      return isRecurring ? createdBookings : createdBookings[0];
    });
  },

  /**
   * Mengambil pemesanan untuk pengguna dengan fitur paginasi
   */
  getUserBookings: async (userId, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    const items = await db.query.bookings.findMany({
      where: eq(bookings.userId, userId),
      with: { facility: true },
      orderBy: [desc(bookings.startTime)],
      limit,
      offset,
    });
    const [{ count: total }] = await db.select({ count: sql`count(*)` }).from(bookings)
      .where(eq(bookings.userId, userId));
    const totalPages = Math.ceil(total / limit);
    return {
      items,
      pagination: { page, limit, total, totalPages, hasMore: page < totalPages },
    };
  },

  /**
   * Mengambil semua pemesanan (Admin) dengan fitur paginasi
   */
  getAllBookings: async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    const items = await db.query.bookings.findMany({
      with: {
        facility: true,
        user: {
          columns: {
            name: true,
            email: true,
          }
        },
      },
      orderBy: [desc(bookings.createdAt)],
      limit,
      offset,
    });
    const [{ count: total }] = await db.select({ count: sql`count(*)` }).from(bookings);
    const totalPages = Math.ceil(total / limit);
    return {
      items,
      pagination: { page, limit, total, totalPages, hasMore: page < totalPages },
    };
  },

  /**
   * Memperbarui status pemesanan
   */
  updateStatus: async (id, status, notes) => {
    if (![BOOKING_STATUS.APPROVED, BOOKING_STATUS.REJECTED].includes(status)) {
      throw new AppError('Invalid status update', 400);
    }

    const booking = await db.query.bookings.findFirst({ where: eq(bookings.id, id) });
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if ([BOOKING_STATUS.CANCELLED, BOOKING_STATUS.REJECTED].includes(booking.status)) {
      throw new AppError(`Cannot update status of a ${booking.status.toLowerCase()} booking`, 400);
    }

    return await db.transaction(async (tx) => {
      await tx.execute(sql`SELECT id FROM facilities WHERE id = ${booking.facilityId} FOR UPDATE`);

      if (status === BOOKING_STATUS.APPROVED) {
        const hasOverlap = await bookingService.isOverlapping(
          booking.facilityId,
          booking.startTime,
          booking.endTime,
          tx,
          id
        );

        if (hasOverlap) {
          throw new AppError('Cannot approve booking because the room already has a pending or approved booking in this time slot', 409);
        }
      }

      await tx.update(bookings)
        .set({ status, notes, updatedAt: new Date() })
        .where(eq(bookings.id, id));

      return await tx.query.bookings.findFirst({
        where: eq(bookings.id, id),
        with: { facility: true }
      });
    });
  },

  /**
   * Membatalkan pemesanan
   */
  cancelBooking: async (id, userId, cancelAll = false) => {
    const booking = await db.query.bookings.findFirst({ where: eq(bookings.id, id) });
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (booking.userId !== userId) {
      throw new AppError('You can only cancel your own bookings', 403);
    }

    if (booking.status !== BOOKING_STATUS.PENDING) {
      throw new AppError('Only pending bookings can be cancelled', 400);
    }

    if (cancelAll === true && booking.recurrenceGroupId) {
      await db.update(bookings)
        .set({ status: BOOKING_STATUS.CANCELLED, updatedAt: new Date() })
        .where(
          and(
            eq(bookings.recurrenceGroupId, booking.recurrenceGroupId),
            eq(bookings.userId, userId),
            eq(bookings.status, BOOKING_STATUS.PENDING)
          )
        );
      return { message: 'All recurring bookings cancelled' };
    }

    await db.update(bookings)
      .set({ status: BOOKING_STATUS.CANCELLED, updatedAt: new Date() })
      .where(eq(bookings.id, id));

    return { message: 'Booking cancelled successfully' };
  },

  /**
   * Mengambil pemesanan berdasarkan fasilitas dengan fitur paginasi
   */
  getBookingsByFacility: async (facilityId, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    const items = await db.query.bookings.findMany({
      where: and(
        eq(bookings.facilityId, facilityId),
        inArray(bookings.status, [BOOKING_STATUS.PENDING, BOOKING_STATUS.APPROVED])
      ),
      with: {
        user: {
          columns: { name: true }
        },
      },
      orderBy: [asc(bookings.startTime)],
      limit,
      offset,
    });
    const [{ count: total }] = await db.select({ count: sql`count(*)` }).from(bookings)
      .where(and(
        eq(bookings.facilityId, facilityId),
        inArray(bookings.status, [BOOKING_STATUS.PENDING, BOOKING_STATUS.APPROVED])
      ));
    const totalPages = Math.ceil(total / limit);
    return {
      items,
      pagination: { page, limit, total, totalPages, hasMore: page < totalPages },
    };
  },
};

module.exports = bookingService;
