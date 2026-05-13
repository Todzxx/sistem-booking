const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const userRoutes = require('./modules/users/user.routes');
const facilityRoutes = require('./modules/facilities/facility.routes');
const bookingRoutes = require('./modules/bookings/booking.routes');
const notificationRoutes = require('./modules/notifications/notification.routes');
const paymentRoutes = require('./modules/payments/payment.routes');
const calendarRoutes = require('./modules/calendar/calendar.routes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const AppError = require('./utils/AppError');

dotenv.config();

// Validasi secret saat startup
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('CHANGE_ME')) {
  console.error('ERROR: JWT_SECRET is not properly configured!');
  process.exit(1);
}
if (!process.env.ENCRYPTION_KEY) {
  console.error('ERROR: ENCRYPTION_KEY is not configured!');
  process.exit(1);
}

const { db } = require('./config/db');
const { sql } = require('drizzle-orm');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

// Pembatasan laju (Rate limiting)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // batasi setiap IP hingga 100 request per windowMs
  message: 'Too many requests from this IP, please try again later',
  skip: () => !isProduction || isTest,
});
// === Auth Rate Limiter ===
// Lebih ketat (5x per window) khusus endpoint login/register
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 5,
  message: 'Too many authentication attempts, please try again later',
  skip: () => !isProduction || isTest,
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cookieParser());

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : isProduction
    ? [process.env.FRONTEND_URL || 'http://localhost:5173']
    : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(limiter); // Mengaktifkan pembatasan laju global untuk keamanan rute umum
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter); // Pembatasan lebih ketat untuk login/register
app.use('/api/v1/auth/refresh', authLimiter);

// === Upload Rate Limiter ===
// Batasi upload file — 10x per 15 menit per IP
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many upload attempts, please try again later',
  skip: () => !isProduction || isTest,
});
app.use('/api/v1/facilities', uploadLimiter);

// Rute Dasar
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Room & Facility Booking API',
    status: 'Server is running'
  });
});

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [System]
 *     summary: Health check
 *     responses:
 *       200:
 *         description: Server is healthy
 */
app.get('/health', async (req, res) => {
  try {
    await db.execute(sql`SELECT 1`);
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'error', message: 'Database connection failed' });
  }
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'RoomSync API Docs',
}));

// Rute-rute
app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/facilities', facilityRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/calendar', calendarRoutes);

// Penangan router 404
app.use((req, res, next) => {
  const error = new AppError(`Route not found - ${req.originalUrl}`, 404);
  next(error);
});

// Middleware penanganan error
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || (statusCode >= 400 && statusCode < 500 ? 'fail' : 'error');

  res.status(statusCode).json({
    status,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

module.exports = app;
