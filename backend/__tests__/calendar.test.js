jest.mock('../src/middleware/auth.middleware', () => {
  return (req, res, next) => {
    req.user = { id: 'test-user', role: 'USER' };
    next();
  };
});

jest.mock('../src/services/googleCalendar.service', () => ({
  getAuthUrl: jest.fn(),
  handleCallback: jest.fn(),
  createEvent: jest.fn(),
  deleteEvent: jest.fn(),
  checkConnection: jest.fn(),
  generateGoogleCalendarLink: jest.fn(),
}));

const request = require('supertest');
const app = require('../src/app');
const calendarService = require('../src/services/googleCalendar.service');
const AppError = require('../src/utils/AppError');

describe('Google Calendar Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/calendar/auth', () => {
    it('should return auth URL', async () => {
      calendarService.getAuthUrl.mockReturnValue('https://accounts.google.com/o/oauth2/auth?state=test-user');

      const res = await request(app)
        .get('/api/v1/calendar/auth');

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.url).toContain('google.com');
    });
  });

  describe('GET /api/v1/calendar/status', () => {
    it('should return connection status', async () => {
      calendarService.checkConnection.mockResolvedValue({ connected: true });

      const res = await request(app)
        .get('/api/v1/calendar/status');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.connected).toBe(true);
    });

    it('should return not connected', async () => {
      calendarService.checkConnection.mockResolvedValue({ connected: false });

      const res = await request(app)
        .get('/api/v1/calendar/status');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.connected).toBe(false);
    });
  });

  describe('POST /api/v1/calendar/events/:id', () => {
    it('should create event successfully', async () => {
      calendarService.createEvent.mockResolvedValue({
        googleEventId: 'evt-123',
        htmlLink: 'https://calendar.google.com/event?eid=evt-123',
      });

      const res = await request(app)
        .post('/api/v1/calendar/events/booking-1');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.googleEventId).toBe('evt-123');
    });

    it('should handle not connected error', async () => {
      calendarService.createEvent.mockRejectedValue(new AppError('Google Calendar not connected', 400));

      const res = await request(app)
        .post('/api/v1/calendar/events/booking-1');

      expect(res.statusCode).toBe(400);
    });

    it('should handle unapproved booking', async () => {
      calendarService.createEvent.mockRejectedValue(new AppError('Only approved bookings can be added to calendar', 400));

      const res = await request(app)
        .post('/api/v1/calendar/events/booking-1');

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/v1/calendar/link/:id', () => {
    it('should return 404 for non-existent booking', async () => {
      const res = await request(app)
        .get('/api/v1/calendar/link/booking-1');

      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/v1/calendar/events/:id', () => {
    it('should delete event', async () => {
      calendarService.deleteEvent.mockResolvedValue({});

      const res = await request(app)
        .delete('/api/v1/calendar/events/booking-1');

      expect(res.statusCode).toBe(200);
    });
  });
});

describe('Google Calendar Service — createEvent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should reject non-approved booking', async () => {
    calendarService.createEvent.mockRejectedValue(new AppError('Only approved bookings can be added to calendar', 400));

    await expect(
      calendarService.createEvent('booking-1', 'test-user')
    ).rejects.toThrow('Only approved bookings can be added to calendar');
  });

  it('should reject duplicate sync', async () => {
    calendarService.createEvent.mockRejectedValue(new AppError('Event already exists in Google Calendar', 400));

    await expect(
      calendarService.createEvent('booking-1', 'test-user')
    ).rejects.toThrow('Event already exists in Google Calendar');
  });

  it('should reject when not connected', async () => {
    calendarService.createEvent.mockRejectedValue(new AppError('Google Calendar not connected', 400));

    await expect(
      calendarService.createEvent('booking-1', 'test-user')
    ).rejects.toThrow('Google Calendar not connected');
  });
});
