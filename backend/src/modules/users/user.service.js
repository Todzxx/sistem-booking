const bcrypt = require('bcryptjs');
const { db } = require('../../config/db');
const { users } = require('../../db/schema');
const { eq, asc } = require('drizzle-orm');
const { generateAccessToken, generateRefreshToken } = require('../../utils/token');
const AppError = require('../../utils/AppError');
const { v4: uuidv4 } = require('uuid');

const publicUserColumns = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

const authUserColumns = {
  ...publicUserColumns,
  password: true,
};

/**
 * Service untuk mengelola logika terkait Pengguna (Autentikasi, Profil, dll)
 */
const userService = {
  /**
   * Mendaftarkan pengguna baru
   * @param {Object} userData - Data pengguna (nama, email, password, role)
   */
  registerUser: async (userData) => {
    const { name, email, password } = userData;

    // Cek apakah pengguna sudah ada menggunakan Drizzle
    const existingUser = await db.query.users.findFirst({
      columns: {
        id: true,
      },
      where: eq(users.email, email),
    });

    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Buat pengguna menggunakan helper Drizzle
    const userDataToInsert = {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      role: 'USER', // Selalu paksakan role USER untuk pendaftaran publik
    };

    await db.insert(users).values(userDataToInsert);

    return userService.getUserById(userDataToInsert.id);
  },

  /**
   * Login pengguna dan kembalikan token
   * @param {string} email 
   * @param {string} password 
   */
  loginUser: async (email, password) => {
    // Cari pengguna menggunakan Drizzle
    const user = await db.query.users.findFirst({
      columns: authUserColumns,
      where: eq(users.email, email),
    });
    
    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      throw new AppError('Invalid email or password', 401);
    }

    // Hasilkan token (access + refresh)
    const access = generateAccessToken({ id: user.id, role: user.role });
    const refresh = generateRefreshToken({ id: user.id, role: user.role });

    // Hapus password dari objek yang dikembalikan
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword,
      token: access.token, // kompatibilitas ke belakang
      refreshToken: refresh.token,
    };
  },

  /**
   * Dapatkan pengguna berdasarkan ID
   * @param {string} id
   */
  getUserById: async (id) => {
    const user = await db.query.users.findFirst({
      columns: publicUserColumns,
      where: eq(users.id, id),
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  },

  /**
   * Perbarui profil pengguna (nama dan/atau password)
   * @param {string} id 
   * @param {Object} data 
   */
  updateProfile: async (id, data) => {
    const { name, password } = data;
    const updateData = {};

    if (name) updateData.name = name;
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    if (Object.keys(updateData).length === 0) return userService.getUserById(id);

    await db.update(users)
      .set(updateData)
      .where(eq(users.id, id));

    return userService.getUserById(id);
  },

  getAllUsers: async () => {
    const users = await db.query.users.findMany({
      columns: publicUserColumns,
      orderBy: [asc(users.name)],
    });
    return users;
  },

  updateUserRole: async (id, role) => {
    const user = await db.query.users.findFirst({
      columns: {
        id: true,
        role: true,
      },
      where: eq(users.id, id),
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role === role) {
      throw new AppError(`User already has ${role} role`, 400);
    }

    await db.update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id));

    return userService.getUserById(id);
  },
};

module.exports = userService;
