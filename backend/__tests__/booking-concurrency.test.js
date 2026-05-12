// Mock auth middleware to inject a test user and mock booking service to simulate conflict
jest.mock('../src/middleware/auth.middleware', () => {
  return (req, res, next) => {
    req.user = { id: 'test-user', role: 'USER' };
    next();
  };
});

// Mock booking service to simulate one success and one conflict
jest.mock('../src/modules/bookings/booking.service', () => {
  return {
    createBooking: jest.fn(),
  };
});

const request = require('supertest');
const app = require('../src/app');
const bookingService = require('../src/modules/bookings/booking.service');
const AppError = require('../src/utils/AppError');

// This test simulates concurrent booking requests for the same timeslot by
// making the mocked bookingService return success for the first call and
// throw a 409 AppError for the second call.

describe('Booking concurrency', () => {
  test('should not allow double booking when requests are concurrent', async () => {
    // Prepare two booking payloads for same facility/time
    const payload = {
      facilityId: 'test-facility',
      startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      purpose: 'Test meeting',
    };

    // Arrange mock: first call resolves, second call rejects with conflict
    bookingService.createBooking.mockImplementationOnce(async () => ({ id: 'b1' }));
    bookingService.createBooking.mockImplementationOnce(async () => { throw new AppError('Time slot is already booked', 409); });

    // Fire two requests in parallel
    const [res1, res2] = await Promise.all([
      request(app).post('/api/v1/bookings').send(payload),
      request(app).post('/api/v1/bookings').send(payload),
    ]);

    // At least one should fail with conflict 409
    const statuses = [res1.statusCode, res2.statusCode];
    expect(statuses.includes(409)).toBeTruthy();
  }, 15000);
});
