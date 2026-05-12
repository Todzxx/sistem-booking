const request = require('supertest');
const app = require('../src/app');

jest.mock('../src/middleware/auth.middleware', () => {
  return (req, res, next) => {
    req.user = { id: 'admin-id', role: 'ADMIN' };
    next();
  };
});

jest.mock('../src/modules/users/user.service', () => ({
  registerUser: jest.fn(),
  loginUser: jest.fn(),
  getUserById: jest.fn(),
  updateProfile: jest.fn(),
  getAllUsers: jest.fn().mockResolvedValue([
    { id: 'u1', name: 'Alice', email: 'alice@test.com', role: 'USER' },
    { id: 'u2', name: 'Bob', email: 'bob@test.com', role: 'ADMIN' },
  ]),
  updateUserRole: jest.fn().mockResolvedValue({ id: '550e8400-e29b-41d4-a716-446655440000', name: 'Alice', email: 'alice@test.com', role: 'ADMIN' }),
}));

describe('Role Management', () => {
  describe('GET /api/v1/auth/admin/users', () => {
    it('should return list of users', async () => {
      const res = await request(app).get('/api/v1/auth/admin/users');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(2);
    });
  });

  describe('PATCH /api/v1/auth/admin/users/:id/role', () => {
    it('should update user role', async () => {
      const res = await request(app)
        .patch('/api/v1/auth/admin/users/550e8400-e29b-41d4-a716-446655440000/role')
        .send({ role: 'ADMIN' });
      expect(res.statusCode).toBe(200);
      expect(res.body.data.role).toBe('ADMIN');
    });

    it('should reject invalid role', async () => {
      const res = await request(app)
        .patch('/api/v1/auth/admin/users/550e8400-e29b-41d4-a716-446655440000/role')
        .send({ role: 'INVALID' });
      expect(res.statusCode).toBe(400);
    });
  });
});
