require('dotenv').config();
const { db } = require('../config/db');
const { users } = require('./schema');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

async function seedUsers() {
  console.log('Seeding users...');
  
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const hashedUserPassword = await bcrypt.hash('user123', 12);
  
  const data = [
    {
      id: uuidv4(),
      name: 'System Administrator',
      email: 'admin@roomsync.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
    {
      id: uuidv4(),
      name: 'Regular User',
      email: 'user@roomsync.com',
      password: hashedUserPassword,
      role: 'USER',
    }
  ];

  try {
    for (const item of data) {
      // Check if user already exists
      const existing = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, item.email)
      });
      
      if (!existing) {
        await db.insert(users).values(item);
        console.log(`Added user: ${item.name} (${item.role})`);
      } else {
        console.log(`User ${item.email} already exists, skipping...`);
      }
    }
    console.log('User seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
}

seedUsers();
