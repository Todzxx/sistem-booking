// ============================================================
// FILE: utils/dbHelper.js
// Helper untuk operasi database umum
// createAndFetch: insert data lalu SELECT kembali — return record lengkap
// ============================================================

const { eq } = require('drizzle-orm');

const createAndFetch = async (table, data, tx = null) => {
  const db = tx || require('../config/db').db;

  await db.insert(table).values(data);
  const insertedId = data.id;

  const records = await db.select().from(table).where(eq(table.id, insertedId)).limit(1);
  return records[0] || null;
};

module.exports = { createAndFetch };
