const request = require('supertest');
const app = require('../src/app');

jest.mock('../src/middleware/auth.middleware', () => {
  return (req, res, next) => {
    req.user = { id: 'test-user', role: 'USER' };
    next();
  };
});

jest.mock('../src/modules/bookings/booking.service', () => ({
  getUserBookings: jest.fn().mockResolvedValue({
    items: [{ id: 'b1', facility: { name: 'Lab A' }, startTime: new Date().toISOString(), endTime: new Date().toISOString(), purpose: 'Test', status: 'PENDING' }],
    pagination: { page: 1, limit: 10, total: 1, totalPages: 1, hasMore: false },
  }),
  getAllBookings: jest.fn().mockResolvedValue({
    items: [],
    pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasMore: false },
  }),
  getBookingsByFacility: jest.fn().mockResolvedValue({
    items: [],
    pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasMore: false },
  }),
  checkAvailability: jest.fn().mockResolvedValue(true),
  createBooking: jest.fn(),
  cancelBooking: jest.fn(),
  updateStatus: jest.fn(),
}));

jest.mock('../src/modules/facilities/facility.service', () => ({
  getAllFacilities: jest.fn().mockResolvedValue({
    items: [{ id: 'f1', name: 'Lab A', isActive: true }],
    pagination: { page: 1, limit: 10, total: 1, totalPages: 1, hasMore: false },
  }),
}));

describe('Pagination Metadata', () => {
  it('should return pagination in facilities response', async () => {
    const res = await request(app).get('/api/v1/facilities');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
      hasMore: false,
    });
  });

  it('should return pagination in my bookings response', async () => {
    const res = await request(app).get('/api/v1/bookings/my');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.pagination).toBeDefined();
    expect(res.body.data.pagination.page).toBe(1);
  });

  it('should return items array instead of old format', async () => {
    const res = await request(app).get('/api/v1/facilities');
    expect(Array.isArray(res.body.data.items)).toBe(true);
    expect(res.body.data.facilities).toBeUndefined();
  });
});
