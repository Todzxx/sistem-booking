const { google } = require('googleapis');
const { db } = require('../config/db');
const { users, bookings } = require('../db/schema');
const { eq, and } = require('drizzle-orm');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const { encrypt, decrypt } = require('../utils/encryption');

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/v1/calendar/oauth/callback'
  );
}

const googleCalendarService = {
  getAuthUrl: (userId) => {
    const oauth2Client = getOAuth2Client();
    const state = jwt.sign(
      { userId, type: 'google-oauth' },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      state,
      prompt: 'consent',
    });
  },

  verifyState: (state) => {
    try {
      const decoded = jwt.verify(state, process.env.JWT_SECRET);
      if (decoded.type !== 'google-oauth') {
        throw new Error('Invalid state type');
      }
      return decoded.userId;
    } catch (error) {
      throw new AppError('Invalid or expired OAuth state. Please try connecting again.', 400);
    }
  },

  handleCallback: async (code, userId) => {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      throw new AppError('No refresh token received. Please revoke app access and try again.', 400);
    }

    const encryptedToken = encrypt(tokens.refresh_token);

    await db.update(users)
      .set({
        googleRefreshToken: encryptedToken,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return { message: 'Google Calendar connected successfully' };
  },

  createEvent: async (bookingId, userId) => {
    const booking = await db.query.bookings.findFirst({
      where: and(eq(bookings.id, bookingId), eq(bookings.userId, userId)),
      with: { facility: true },
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }
    if (booking.status !== 'APPROVED') {
      throw new AppError('Only approved bookings can be added to calendar', 400);
    }
    if (booking.googleEventId) {
      throw new AppError('Event already exists in Google Calendar', 400);
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    if (!user.googleRefreshToken) {
      throw new AppError('Google Calendar not connected. Please connect first.', 400);
    }

    let refreshToken;
    try {
      refreshToken = decrypt(user.googleRefreshToken);
    } catch {
      throw new AppError('Failed to decrypt Google token. Please reconnect.', 400);
    }

    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const event = {
      summary: booking.purpose,
      description: `Booking at ${booking.facility.name}\nPurpose: ${booking.purpose}`,
      start: {
        dateTime: new Date(booking.startTime).toISOString(),
        timeZone: 'Asia/Jakarta',
      },
      end: {
        dateTime: new Date(booking.endTime).toISOString(),
        timeZone: 'Asia/Jakarta',
      },
    };

    try {
      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
      });

      const googleEventId = response.data.id;
      await db.update(bookings)
        .set({ googleEventId, updatedAt: new Date() })
        .where(eq(bookings.id, bookingId));

      return { googleEventId, htmlLink: response.data.htmlLink };
    } catch (error) {
      if (error.code === 401) {
        await db.update(users)
          .set({ googleRefreshToken: null, updatedAt: new Date() })
          .where(eq(users.id, userId));
        throw new AppError('Google Calendar token expired. Please reconnect.', 401);
      }
      throw new AppError('Failed to create Google Calendar event: ' + error.message, 500);
    }
  },

  deleteEvent: async (bookingId, userId, userRole = 'USER') => {
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }
    if (booking.userId !== userId && userRole !== 'ADMIN') {
      throw new AppError('Not authorized to delete this event', 403);
    }
    if (!booking.googleEventId) {
      return;
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, booking.userId),
    });
    if (!user.googleRefreshToken) {
      return;
    }

    let refreshToken;
    try {
      refreshToken = decrypt(user.googleRefreshToken);
    } catch {
      return;
    }

    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    try {
      await calendar.events.delete({
        calendarId: 'primary',
        eventId: booking.googleEventId,
      });
    } catch (error) {
      if (error.code !== 404) {
        console.error('Failed to delete Google Calendar event:', error.message);
      }
    }

    await db.update(bookings)
      .set({ googleEventId: null, updatedAt: new Date() })
      .where(eq(bookings.id, bookingId));
  },

  generateGoogleCalendarLink: (summary, description, startTime, endTime) => {
    const toICS = (iso) => iso.replace(/[-:]/g, '').split('.')[0];
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: summary,
      details: description,
      dates: `${toICS(startTime)}/${toICS(endTime)}`,
      ctz: 'Asia/Jakarta',
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  },

  checkConnection: async (userId) => {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    return { connected: !!user.googleRefreshToken };
  },
};

module.exports = googleCalendarService;
