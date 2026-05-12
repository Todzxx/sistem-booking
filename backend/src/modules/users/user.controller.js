const userService = require('./user.service');
const { success } = require('../../utils/responseHandler');
const userValidation = require('../../validations/user.validation');
const AppError = require('../../utils/AppError');
const { verifyRefreshToken, generateAccessToken, generateRefreshToken, revokeTokenByJti } = require('../../utils/token');
const { isRevoked } = require('../../utils/revocationStore');

const userController = {
  // Mendaftarkan pengguna baru
  register: async (req, res, next) => {
    try {
      const { error, value } = userValidation.register.validate(req.body);
      if (error) {
        throw new AppError(error.details[0].message, 400);
      }

      const user = await userService.registerUser(value);
      
      return success(res, 'User registered successfully', user, 201);
    } catch (error) {
      next(error);
    }
  },

  // Login pengguna
  login: async (req, res, next) => {
    try {
      const { error, value } = userValidation.login.validate(req.body);
      if (error) {
        throw new AppError(error.details[0].message, 400);
      }

      const { email, password } = value;
      const result = await userService.loginUser(email, password);

      const isSecure = process.env.NODE_ENV === 'production';
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/api/v1/auth',
      });

      return success(res, 'Logged in successfully', result);
    } catch (error) {
      next(error);
    }
  },

  // Memperbarui token akses (access token) menggunakan refresh token
  refreshToken: async (req, res, next) => {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      if (!refreshToken) throw new AppError('refreshToken is required', 400);

      const decoded = verifyRefreshToken(refreshToken);
      if (!decoded) throw new AppError('Invalid or expired refresh token', 401);

      // Pastikan refresh token belum dicabut (revoked)
      const revoked = await isRevoked(decoded.jti);
      if (revoked) throw new AppError('Refresh token revoked', 401);

      // Cabut refresh token lama (rotation)
      await revokeTokenByJti(decoded.jti, decoded.exp);

      // Rotasi: buat access token DAN refresh token baru
      const access = generateAccessToken({ id: decoded.id, role: decoded.role });
      const newRefresh = generateRefreshToken({ id: decoded.id, role: decoded.role });

      const isSecure = process.env.NODE_ENV === 'production';
      res.cookie('refreshToken', newRefresh.token, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/api/v1/auth',
      });

      return success(res, 'Access token refreshed', {
        token: access.token,
        refreshToken: newRefresh.token,
      });
    } catch (error) {
      next(error);
    }
  },

  // Logout dan cabut refresh token
  logout: async (req, res, next) => {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      if (!refreshToken) throw new AppError('refreshToken is required', 400);

      const decoded = verifyRefreshToken(refreshToken);
      if (!decoded) throw new AppError('Invalid or expired refresh token', 401);

      // Cabut refresh token berdasarkan jti-nya dengan batas waktu (TTL) sampai masa berlakunya habis
      await revokeTokenByJti(decoded.jti, decoded.exp);

      res.clearCookie('refreshToken', { path: '/api/v1/auth' });

      return success(res, 'Logged out successfully', null, 200);
    } catch (error) {
      next(error);
    }
  },

  // Mendapatkan profil pengguna saat ini
  getMe: async (req, res, next) => {
    try {
      // req.user diatur oleh authMiddleware
      const user = await userService.getUserById(req.user.id);
      return success(res, 'User profile retrieved successfully', user);
    } catch (error) {
      next(error);
    }
  },

  // Memperbarui profil pengguna
  updateProfile: async (req, res, next) => {
    try {
      const { error, value } = userValidation.updateProfile.validate(req.body);
      if (error) {
        throw new AppError(error.details[0].message, 400);
      }

      const user = await userService.updateProfile(req.user.id, value);
      return success(res, 'Profile updated successfully', user);
    } catch (error) {
      next(error);
    }
  },

  // Admin: Mendapatkan semua pengguna
  getAllUsers: async (req, res, next) => {
    try {
      const users = await userService.getAllUsers();
      return success(res, 'Users retrieved successfully', users);
    } catch (error) {
      next(error);
    }
  },

  // Admin: Memperbarui role pengguna
  updateUserRole: async (req, res, next) => {
    try {
      const { error: paramError, value: paramValue } = userValidation.idParam.validate(req.params);
      if (paramError) throw new AppError(paramError.details[0].message, 400);

      const { error, value } = userValidation.updateRole.validate(req.body);
      if (error) throw new AppError(error.details[0].message, 400);

      const user = await userService.updateUserRole(paramValue.id, value.role);
      return success(res, 'User role updated successfully', user);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = userController;
