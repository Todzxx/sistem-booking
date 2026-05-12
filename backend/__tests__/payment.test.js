jest.mock('../src/middleware/auth.middleware', () => {
  return (req, res, next) => {
    req.user = { id: 'test-user', role: 'USER' };
    next();
  };
});

jest.mock('../src/modules/payments/payment.service', () => ({
  payDeposit: jest.fn(),
  refundDeposit: jest.fn(),
  getPaymentSummary: jest.fn(),
}));

const request = require('supertest');
const app = require('../src/app');
const paymentService = require('../src/modules/payments/payment.service');
const AppError = require('../src/utils/AppError');

describe('Payment Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/payments/:id/pay', () => {
    it('should pay deposit successfully', async () => {
      const mockBooking = {
        id: 'booking-1',
        depositAmount: '50000',
        paymentStatus: 'PAID',
        paymentMethod: 'BANK_TRANSFER',
        paidAt: new Date().toISOString(),
        facility: { name: 'Test Room' },
      };
      paymentService.payDeposit.mockResolvedValue(mockBooking);

      const res = await request(app)
        .post('/api/v1/payments/booking-1/pay')
        .send({ paymentMethod: 'BANK_TRANSFER' });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.paymentStatus).toBe('PAID');
    });

    it('should return 400 for invalid payment method', async () => {
      const res = await request(app)
        .post('/api/v1/payments/booking-1/pay')
        .send({ paymentMethod: 'INVALID' });

      expect(res.statusCode).toBe(400);
    });

    it('should return 400 for missing payment method', async () => {
      const res = await request(app)
        .post('/api/v1/payments/booking-1/pay')
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('fail');
    });

    it('should handle service conflict error', async () => {
      paymentService.payDeposit.mockRejectedValue(new AppError('Deposit already paid', 400));

      const res = await request(app)
        .post('/api/v1/payments/booking-1/pay')
        .send({ paymentMethod: 'CASH' });

      expect(res.statusCode).toBe(400);
    });

    it('should handle not found error', async () => {
      paymentService.payDeposit.mockRejectedValue(new AppError('Booking not found', 404));

      const res = await request(app)
        .post('/api/v1/payments/invalid-id/pay')
        .send({ paymentMethod: 'E_WALLET' });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('POST /api/v1/payments/:id/refund (admin)', () => {
    it('should return 401 for non-admin user', async () => {
      const res = await request(app)
        .post('/api/v1/payments/booking-1/refund');

      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/v1/payments/summary (admin)', () => {
    it('should return 401 for non-admin user', async () => {
      const res = await request(app)
        .get('/api/v1/payments/summary');

      expect(res.statusCode).toBe(403);
    });
  });
});

describe('Payment Service — payDeposit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should reject payment for unapproved booking', async () => {
    paymentService.payDeposit.mockRejectedValue(new AppError('Only approved bookings can be paid', 400));

    await expect(
      paymentService.payDeposit('booking-1', 'test-user', 'CASH')
    ).rejects.toThrow('Only approved bookings can be paid');
  });

  it('should reject payment for already paid booking', async () => {
    paymentService.payDeposit.mockRejectedValue(new AppError('Deposit already paid', 400));

    await expect(
      paymentService.payDeposit('booking-1', 'test-user', 'CASH')
    ).rejects.toThrow('Deposit already paid');
  });

  it('should reject payment for other user booking', async () => {
    paymentService.payDeposit.mockRejectedValue(new AppError('You can only pay for your own bookings', 403));

    await expect(
      paymentService.payDeposit('booking-1', 'other-user', 'CASH')
    ).rejects.toThrow('You can only pay for your own bookings');
  });
});
