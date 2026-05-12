const request = require('supertest');
const app = require('../src/app');
const { verifyAccessToken } = require('../src/utils/token');

jest.mock('../src/utils/token', () => ({
  verifyAccessToken: jest.fn(),
}));

jest.mock('../src/utils/revocationStore', () => ({
  isRevoked: jest.fn().mockResolvedValue(false),
}));

describe('SSE Notifications', () => {
  describe('GET /api/v1/notifications/stream', () => {
    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/v1/notifications/stream');
      expect(res.statusCode).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      verifyAccessToken.mockReturnValueOnce(null);
      const res = await request(app).get('/api/v1/notifications/stream?token=invalid');
      expect(res.statusCode).toBe(401);
    });
  });
});
