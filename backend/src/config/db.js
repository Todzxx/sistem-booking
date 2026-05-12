require('dotenv').config();
const schema = require('../db/schema');

// Di lingkungan pengujian (test), sediakan stub DB ringan untuk menghindari pembuatan koneksi nyata
if (process.env.NODE_ENV === 'test') {
  const db = {
    query: {
      users: {
        findFirst: async ({ where }) => {
          // Pengguna tiruan (mock) sederhana untuk pengujian autentikasi
          if (where && where.value === 'test@example.com') {
             return { id: 'test-id', email: 'test@example.com', password: '$2b$12$8URWvfDo8Io4rdM5VZWX1.NAHPfuyfnMSe8SYVdtLoXGlyuuJgPEq', role: 'USER' };
          }
          return null;
        },
      },
      bookings: {
        findFirst: async () => null,
        findMany: async () => [],
      },
      facilities: {
        findFirst: async () => null,
        findMany: async () => [],
      },
    },
    insert: async () => ({}),
    update: async () => ({}),
    execute: async () => ({}),
    // Pembungkus transaksi sederhana yang menyediakan objek mirip-tx
    transaction: async (cb) => {
      const tx = {
        query: db.query,
        insert: db.insert,
        update: db.update,
        execute: db.execute,
      };
      return cb(tx);
    },
  };

  module.exports = { db, connection: null };
} else {
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
