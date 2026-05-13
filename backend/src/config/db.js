// ============================================================
// FILE: config/db.js
// Konfigurasi database MySQL + Drizzle ORM
// Mode "test" menggunakan mock DB agar test tidak perlu koneksi nyata
// ============================================================

require('dotenv').config();
const schema = require('../db/schema');

// === Mode TEST ===
// Gunakan objek tiruan (stub) agar pengujian berjalan tanpa MySQL
if (process.env.NODE_ENV === 'test') {
  const db = {
    query: {
      users: {
        findFirst: async ({ where }) => {
          // Mock user untuk testing autentikasi (password: "password123")
          if (where && where.value === 'test@example.com') {
             return { id: 'test-id', email: 'test@example.com', password: '$2b$12$8URWvfDo8Io4rdM5VZWX1.NAHPfuyfnMSe8SYVdtLoXGlyuuJgPEq', role: 'USER' };
          }
          return null;
        },
      },
      bookings: { findFirst: async () => null, findMany: async () => [] },
      facilities: { findFirst: async () => null, findMany: async () => [] },
    },
    insert: async () => ({}),
    update: async () => ({}),
    execute: async () => ({}),
    // Transaksi palsu — wrapper yang mengembalikan db itu sendiri
    transaction: async (cb) => {
      const tx = { query: db.query, insert: db.insert, update: db.update, execute: db.execute };
      return cb(tx);
    },
  };

  module.exports = { db, connection: null };
} else {
  // === Mode Development / Production ===
  // Koneksi MySQL via connection pool, lalu inisialisasi Drizzle ORM
  const { drizzle } = require('drizzle-orm/mysql2');
  const mysql = require('mysql2/promise');

  const poolMax = parseInt(process.env.DB_POOL_MAX) || 10;

  const connection = mysql.createPool({
    uri: process.env.DB_URL,
    connectionLimit: poolMax,
    waitForConnections: true,
    queueLimit: 0,
  });

  const db = drizzle(connection, { schema, mode: 'default' });

  module.exports = { db, connection };
}
