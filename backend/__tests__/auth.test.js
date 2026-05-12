const request = require('supertest');
const app = require('../src/app');

describe('Auth Endpoints', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should return 400 for missing fields', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({});
      
      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('fail');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should return 401 for invalid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' });
      
      expect(res.statusCode).toBe(401);
      expect(res.body.status).toBe('fail');
    });
  });

  describe('Protected Routes', () => {
    it('should return 401 without token', async () => {
      const res = await request(app)
        .get('/api/v1/bookings');
      
      expect(res.statusCode).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/v1/bookings')
        .set('Authorization', 'Bearer invalidtoken');
      
      expect(res.statusCode).toBe(401);
    });
  });
});
