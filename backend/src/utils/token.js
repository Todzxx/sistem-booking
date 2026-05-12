const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { revoke, isRevoked } = require('./revocationStore');

const DEFAULT_ISS = process.env.JWT_ISS || 'room-booking-api';
const DEFAULT_AUD = process.env.JWT_AUD || 'room-booking-clients';

function buildClaims(payload) {
  const now = Math.floor(Date.now() / 1000);
  return {
    ...payload,
    jti: uuidv4(),
    iat: now,
    iss: DEFAULT_ISS,
    aud: DEFAULT_AUD,
  };
}

const generateAccessToken = (payload) => {
  const tokenPayload = buildClaims(payload);
  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
  return { token, jti: tokenPayload.jti };
};

const generateRefreshToken = (payload) => {
  const tokenPayload = buildClaims(payload);
  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: process.env.REFRESH_EXPIRES_IN || '7d',
  });
  return { token, jti: tokenPayload.jti };
};

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      issuer: DEFAULT_ISS,
      audience: DEFAULT_AUD,
    });
  } catch (error) {
    return null;
  }
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      issuer: DEFAULT_ISS,
      audience: DEFAULT_AUD,
    });
  } catch (error) {
    return null;
  }
};

/**
 * Pembantu untuk merotasi atau mencabut (revoke) token
 */
const revokeTokenByJti = async (jti, exp) => {
  if (!jti) return;
  const now = Math.floor(Date.now() / 1000);
  const ttl = exp && exp > now ? exp - now : 0;
  await revoke(jti, ttl);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  revokeTokenByJti,
  isRevoked,
};
