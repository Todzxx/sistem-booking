// ============================================================
// FILE: db/seed.js
// Seeder fasilitas — mengisi tabel facilities dengan data awal
// Jalankan: node src/db/seed.js
// ============================================================

require('dotenv').config();
const { db } = require('../config/db');
const { facilities } = require('./schema');
const { v4: uuidv4 } = require('uuid');

async function seed() {
  console.log('Seeding facilities...');

  const data = [
    {
      id: uuidv4(),
      name: 'Grand Auditorium',
      description: 'Ruang auditorium besar dengan kapasitas 200 orang, cocok untuk seminar, wisuda, dan konferensi besar.',
      capacity: 200,
      imageUrl: '/Grand_Auditorium.png',
      depositAmount: '500000.00',
      isActive: true,
    },
    {
      id: uuidv4(),
      name: 'Executive Meeting Room',
      description: 'Ruang rapat mewah untuk dewan direksi atau pertemuan VIP. Dilengkapi dengan layar 4K dan sound system premium.',
      capacity: 12,
      imageUrl: '/Executive_Meeting_Room.png',
      depositAmount: '200000.00',
      isActive: true,
    },
    {
      id: uuidv4(),
      name: 'Creative Design Studio',
      description: 'Ruang kerja kolaboratif yang menginspirasi, dilengkapi dengan peralatan desain dan suasana santai.',
      capacity: 15,
      imageUrl: '/Creative_Design_Studio.png',
      depositAmount: '100000.00',
      isActive: true,
    },
    {
      id: uuidv4(),
      name: 'Professional Podcast Room',
      description: 'Studio kedap suara dengan peralatan rekaman profesional untuk produksi podcast berkualitas tinggi.',
      capacity: 4,
      imageUrl: '/Professional_Podcast_Room.png',
      depositAmount: '50000.00',
      isActive: true,
    },
    {
      id: uuidv4(),
      name: 'Collaboration Zone B',
      description: 'Area terbuka untuk kerja kelompok atau diskusi santai antar tim.',
      capacity: 25,
      imageUrl: '/Collaboration_Zone_B.png',
      depositAmount: '0.00',
      isActive: true,
    }
  ];

  try {
    for (const item of data) {
      await db.insert(facilities).values(item);
      console.log(`Added facility: ${item.name}`);
    }
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
