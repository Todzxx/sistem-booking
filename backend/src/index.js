const { migrate } = require('drizzle-orm/mysql2/migrator');
const { db, connection } = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 5000;

async function main() {
  if (connection) {
    try {
      await migrate(db, { migrationsFolder: './drizzle' });
      console.log('Migrations executed successfully');
    } catch (err) {
      console.error('Migration failed:', err.message);
    }
  }

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

main();
