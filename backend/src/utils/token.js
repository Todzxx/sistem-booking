// ============================================================
// FILE: utils/token.js
// Utilitas JWT — generate, verify, dan revoke access/refresh token
// Setiap token punya jti (unique ID) untuk revocation tracking
// ============================================================

const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { revoke, isRevoked } = require('./revocationStore');

// Issuer dan Audience default — mencegah token dipakai di luar konteks
const DEFAULT_ISS = process.env.JWT_ISS || 'room-booking-api';
const DEFAULT_AUD = process.env.JWT_AUD || 'room-booking-clients';

// Bangun claims standar: jti unik, iat (issued at), iss, aud
function buildClaims(payload) {
  const now = Math.floor(Date.now() / 1000);
  return { ...payload, jti: uuidv4(), iat: now, iss: DEFAULT_ISS, aud: DEFAULT_AUD };
}

// Generate access token (short-lived, default 1 hari)
const generateAccessToken = (payload) => {
  const tokenPayload = buildClaims(payload);
  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
  return { token, jti: tokenPayload.jti };
};

// Generate refresh token (longer-lived, default 7 hari)
const generateRefreshToken = (payload) => {
  const tokenPayload = buildClaims(payload);
  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: process.env.REFRESH_EXPIRES_IN || '7d',
  });
  return { token, jti: tokenPayload.jti };
};

// Verifikasi access token — return decoded payload atau null
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, { issuer: DEFAULT_ISS, audience: DEFAULT_AUD });
  } catch (error) {
    return null;
  }
};

// Verifikasi refresh token — sama seperti access token
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, { issuer: DEFAULT_ISS, audience: DEFAULT_AUD });
  } catch (error) {
    return null;
  }
};

// Revoke token berdasarkan jti (misal saat logout atau refresh)
const revokeTokenByJti = async (jti, exp) => {
  if (!jti) return false;
  return revoke(jti, exp);
};

module.exports = {
  generateAccessToken, generateRefreshToken,
  verifyAccessToken, verifyRefreshToken,
  revokeTokenByJti, isRevoked,
};
