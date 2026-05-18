// ============================================================
// FILE: modules/users/user.controller.js
// Controller untuk autentikasi & manajemen user
// Menerima request → validasi → panggil service → kirim response
// ============================================================

const userService = require('./user.service');
const { success } = require('../../utils/responseHandler');
const userValidation = require('../../validations/user.validation');
const AppError = require('../../utils/AppError');
const { verifyRefreshToken, generateAccessToken, generateRefreshToken, revokeTokenByJti } = require('../../utils/token');
const { isRevoked } = require('../../utils/revocationStore');

// Opsi cookie untuk refresh token (httpOnly, secure di production)
const getRefreshCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,       // Tidak bisa diakses JavaScript (anti-XSS)
    secure: isProduction, // Hanya via HTTPS di production
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
    path: '/api/v1/auth', // Hanya dikirim ke route auth
  };
};

// Opsi untuk clear cookie (tanpa maxAge)
const getRefreshCookieClearOptions = () => {
  const { maxAge: _, ...clearOptions } = getRefreshCookieOptions();
  return clearOptions;
};

// Helper untuk ambil refresh token dari cookie atau body
const extractRefreshToken = (req) => req.cookies?.refreshToken || req.body?.refreshToken;

const userController = {
  // POST /register — daftar user baru
  register: async (req, res, next) => {
    try {
      const { error, value } = userValidation.register.validate(req.body);
      if (error) throw new AppError(error.details[0].message, 400);

      const user = await userService.registerUser(value);
      return success(res, 'User registered successfully', user, 201);
    } catch (error) { next(error); }
  },

  // POST /login — login, dapatkan access + refresh token
  login: async (req, res, next) => {
    try {
      const { error, value } = userValidation.login.validate(req.body);
      if (error) throw new AppError(error.details[0].message, 400);

      const { email, password } = value;
      const result = await userService.loginUser(email, password);

      // Set refresh token sebagai httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, getRefreshCookieOptions());

      const { refreshToken: _, ...safeResult } = result;
      return success(res, 'Logged in successfully', safeResult);
    } catch (error) { next(error); }
  },

  // POST /refresh — rotasi refresh token (dapatkan access token baru)
  refreshToken: async (req, res, next) => {
    try {
      const refreshToken = extractRefreshToken(req);
      if (!refreshToken) {
        res.clearCookie('refreshToken', getRefreshCookieClearOptions());
        return res.status(204).end();
      }

      const decoded = verifyRefreshToken(refreshToken);
      if (!decoded) {
        res.clearCookie('refreshToken', getRefreshCookieClearOptions());
        return res.status(204).end();
      }

      // Cek apakah token sudah dicabut (misal sudah dipakai untuk rotasi sebelumnya)
      const revoked = await isRevoked(decoded.jti);
      if (revoked) {
        // Sudah dipakai — jangan hapus cookie, biarkan cookie baru tetap ada
        return res.status(204).end();
      }

      // Cabut token lama. Jika duplicate JTI (sudah di-revoke request lain), skip.
      const revokedNow = await revokeTokenByJti(decoded.jti, decoded.exp);
      if (!revokedNow) {
        // Duplicate — berarti sudah dirotasi oleh request parallel lainnya
        return res.status(204).end();
      }

      // Rotasi token: access token baru + refresh token baru
      const access = generateAccessToken({ id: decoded.id, role: decoded.role });
      const newRefresh = generateRefreshToken({ id: decoded.id, role: decoded.role });

      res.cookie('refreshToken', newRefresh.token, getRefreshCookieOptions());

      return success(res, 'Access token refreshed', { token: access.token });
    } catch (error) { next(error); }
  },

  // POST /logout — hapus cookie dan revoke refresh token
  logout: async (req, res, next) => {
    try {
      const refreshToken = extractRefreshToken(req);
      if (!refreshToken) throw new AppError('refreshToken is required', 400);

      const decoded = verifyRefreshToken(refreshToken);
      if (!decoded) throw new AppError('Invalid or expired refresh token', 401);

      await revokeTokenByJti(decoded.jti, decoded.exp);
      res.clearCookie('refreshToken', getRefreshCookieClearOptions());

      return success(res, 'Logged out successfully', null, 200);
    } catch (error) { next(error); }
  },

  // GET /me — ambil profil user yang sedang login
  getMe: async (req, res, next) => {
    try {
      const user = await userService.getUserById(req.user.id);
      return success(res, 'User profile retrieved successfully', user);
    } catch (error) { next(error); }
  },

  // PATCH /me — update profil (nama/password)
  updateProfile: async (req, res, next) => {
    try {
      const { error, value } = userValidation.updateProfile.validate(req.body);
      if (error) throw new AppError(error.details[0].message, 400);

      const user = await userService.updateProfile(req.user.id, value);
      return success(res, 'Profile updated successfully', user);
    } catch (error) { next(error); }
  },

  // GET /admin/users — (Admin) lihat semua user
  getAllUsers: async (req, res, next) => {
    try {
      const users = await userService.getAllUsers();
      return success(res, 'Users retrieved successfully', users);
    } catch (error) { next(error); }
  },

  // PATCH /admin/users/:id/role — (Admin) ubah role user
  updateUserRole: async (req, res, next) => {
    try {
      const { error: paramError, value: paramValue } = userValidation.idParam.validate(req.params);
      if (paramError) throw new AppError(paramError.details[0].message, 400);

      const { error, value } = userValidation.updateRole.validate(req.body);
      if (error) throw new AppError(error.details[0].message, 400);

      const user = await userService.updateUserRole(paramValue.id, value.role);
      return success(res, 'User role updated successfully', user);
    } catch (error) { next(error); }
  },
};

module.exports = userController;
