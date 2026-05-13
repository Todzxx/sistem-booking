const userService = require('./user.service');
const { success } = require('../../utils/responseHandler');
const userValidation = require('../../validations/user.validation');
const AppError = require('../../utils/AppError');
const { verifyRefreshToken, generateAccessToken, generateRefreshToken, revokeTokenByJti } = require('../../utils/token');
const { isRevoked } = require('../../utils/revocationStore');

const getRefreshCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/v1/auth',
  };
};

const getRefreshCookieClearOptions = () => {
  const { maxAge: _, ...clearOptions } = getRefreshCookieOptions();
  return clearOptions;
};

const extractRefreshToken = (req) => req.cookies?.refreshToken || req.body?.refreshToken;

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

      res.cookie('refreshToken', result.refreshToken, getRefreshCookieOptions());

      const { refreshToken: _, ...safeResult } = result;

      return success(res, 'Logged in successfully', safeResult);
    } catch (error) {
      next(error);
    }
  },

  // Memperbarui token akses (access token) menggunakan refresh token
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

      // Pastikan refresh token belum dicabut (revoked)
      const revoked = await isRevoked(decoded.jti);
      if (revoked) {
        // Token sudah dipakai — jangan hapus cookie, biarkan cookie baru
        // dari rotasi sebelumnya tetap ada (cegah race condition StrictMode).
        return res.status(204).end();
      }

      // Cabut refresh token lama (rotation). Jika insert duplicate, token sudah dipakai.
      const revokedNow = await revokeTokenByJti(decoded.jti, decoded.exp);
      if (!revokedNow) {
        // Duplicate JTI — rotasi sudah berhasil oleh request lain.
        // Jangan hapus cookie, biarkan cookie baru tetap ada.
        return res.status(204).end();
      }

      // Rotasi: buat access token DAN refresh token baru
      const access = generateAccessToken({ id: decoded.id, role: decoded.role });
      const newRefresh = generateRefreshToken({ id: decoded.id, role: decoded.role });

      res.cookie('refreshToken', newRefresh.token, getRefreshCookieOptions());

      return success(res, 'Access token refreshed', {
        token: access.token,
      });
    } catch (error) {
      next(error);
    }
  },

  // Logout dan cabut refresh token
  logout: async (req, res, next) => {
    try {
      const refreshToken = extractRefreshToken(req);
      if (!refreshToken) throw new AppError('refreshToken is required', 400);

      const decoded = verifyRefreshToken(refreshToken);
      if (!decoded) throw new AppError('Invalid or expired refresh token', 401);

      // Cabut refresh token berdasarkan jti-nya sampai masa berlakunya habis
      await revokeTokenByJti(decoded.jti, decoded.exp);

      res.clearCookie('refreshToken', getRefreshCookieClearOptions());

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
