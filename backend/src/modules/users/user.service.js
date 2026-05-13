// ============================================================
// FILE: modules/users/user.service.js
// Service layer untuk user — registrasi, login, profil, admin
// Berisi logika bisnis (hash password, generate token, validasi)
// ============================================================

const bcrypt = require('bcryptjs');
const { db } = require('../../config/db');
const { users } = require('../../db/schema');
const { eq, asc } = require('drizzle-orm');
const { generateAccessToken, generateRefreshToken } = require('../../utils/token');
const AppError = require('../../utils/AppError');
const { v4: uuidv4 } = require('uuid');

// Kolom user yang aman untuk publik (tanpa password)
const publicUserColumns = { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true };

// Kolom untuk internal auth (termasuk password)
const authUserColumns = { ...publicUserColumns, password: true };

const userService = {

  // Daftarkan user baru — hash password, set role = USER, simpan ke DB
  registerUser: async (userData) => {
    const { name, email, password } = userData;

    // Cek email duplikat
    const existingUser = await db.query.users.findFirst({ columns: { id: true }, where: eq(users.email, email) });
    if (existingUser) throw new AppError('Email already registered', 400);

    const hashedPassword = await bcrypt.hash(password, 12);
    const userDataToInsert = { id: uuidv4(), name, email, password: hashedPassword, role: 'USER' };

    await db.insert(users).values(userDataToInsert);
    return userService.getUserById(userDataToInsert.id);
  },

  // Login — verifikasi email + password, return access & refresh token
  loginUser: async (email, password) => {
    const user = await db.query.users.findFirst({ columns: authUserColumns, where: eq(users.email, email) });
    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      throw new AppError('Invalid email or password', 401);
    }

    const access = generateAccessToken({ id: user.id, role: user.role });
    const refresh = generateRefreshToken({ id: user.id, role: user.role });

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token: access.token, refreshToken: refresh.token };
  },

  // Ambil user by ID (tanpa password)
  getUserById: async (id) => {
    const user = await db.query.users.findFirst({ columns: publicUserColumns, where: eq(users.id, id) });
    if (!user) throw new AppError('User not found', 404);
    return user;
  },

  // Update profil — hanya field yang dikirim (name/password)
  updateProfile: async (id, data) => {
    const { name, password } = data;
    const updateData = {};
    if (name) updateData.name = name;
    if (password) updateData.password = await bcrypt.hash(password, 12);

    if (Object.keys(updateData).length === 0) return userService.getUserById(id);

    await db.update(users).set(updateData).where(eq(users.id, id));
    return userService.getUserById(id);
  },

  // (Admin) ambil semua user
  getAllUsers: async () => {
    return db.query.users.findMany({ columns: publicUserColumns, orderBy: [asc(users.name)] });
  },

  // (Admin) update role user — cek dulu apakah role berbeda
  updateUserRole: async (id, role) => {
    const user = await db.query.users.findFirst({ columns: { id: true, role: true }, where: eq(users.id, id) });
    if (!user) throw new AppError('User not found', 404);
    if (user.role === role) throw new AppError(`User already has ${role} role`, 400);

    await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, id));
    return userService.getUserById(id);
  },
};

module.exports = userService;
