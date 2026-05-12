const { eq } = require('drizzle-orm');

/**
 * Fungsi pembantu (helper) untuk memasukkan data dan mengambil kembali datanya menggunakan ID
 * Berguna untuk menghilangkan penulisan kode insert-dan-fetch yang berulang
 */
const createAndFetch = async (table, data, tx = null) => {
  const db = tx || require('../config/db').db;

  await db.insert(table).values(data);
  const insertedId = data.id;

  const records = await db.select().from(table).where(eq(table.id, insertedId)).limit(1);
  return records[0] || null;
};

module.exports = { createAndFetch };
