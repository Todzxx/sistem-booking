const { mysqlTable, varchar, text, timestamp, boolean, int, mysqlEnum, index, bigint, decimal } = require('drizzle-orm/mysql-core');
const { sql, relations } = require('drizzle-orm');

// Nilai-nilai Enum
const ROLE = ['USER', 'ADMIN'];
const STATUS = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];
const PAYMENT_STATUS = ['UNPAID', 'PAID', 'REFUNDED'];

const users = mysqlTable('users', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`(uuid())`),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  role: mysqlEnum('role', ROLE).default('USER').notNull(),
  googleRefreshToken: text('google_refresh_token'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
}));

const facilities = mysqlTable('facilities', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`(uuid())`),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  capacity: int('capacity'),
  isActive: boolean('is_active').default(true).notNull(),
  imageUrl: varchar('image_url', { length: 255 }),
  depositAmount: decimal('deposit_amount', { precision: 12, scale: 2 }).default('0.00').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
}, (table) => ({
  activeIdx: index('facilities_active_idx').on(table.isActive),
}));

const bookings = mysqlTable('bookings', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`(uuid())`),
  userId: varchar('user_id', { length: 36 }).notNull(),
  facilityId: varchar('facility_id', { length: 36 }).notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  purpose: text('purpose').notNull(),
  status: mysqlEnum('status', STATUS).default('PENDING').notNull(),
  notes: text('notes'),
  recurrenceGroupId: varchar('recurrence_group_id', { length: 36 }),
  // Payment columns
  paymentStatus: mysqlEnum('payment_status', PAYMENT_STATUS).default('UNPAID').notNull(),
  depositAmount: decimal('deposit_amount', { precision: 12, scale: 2 }).default('0.00').notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }),
  paidAt: timestamp('paid_at'),
  // Google Calendar integration
  googleEventId: varchar('google_event_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
}, (table) => ({
  facilityIdx: index('bookings_facility_idx').on(table.facilityId),
  userIdx: index('bookings_user_idx').on(table.userId),
  statusIdx: index('bookings_status_idx').on(table.status),
  timeIdx: index('bookings_time_idx').on(table.startTime, table.endTime),
  recurrenceIdx: index('bookings_recurrence_idx').on(table.recurrenceGroupId),
  paymentStatusIdx: index('bookings_payment_status_idx').on(table.paymentStatus),
}));

const notifications = mysqlTable('notifications', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`(uuid())`),
  userId: varchar('user_id', { length: 36 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  type: varchar('type', { length: 50 }).notNull(), // BOOKING_CREATED, etc.
  bookingId: varchar('booking_id', { length: 36 }),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('notifications_user_idx').on(table.userId),
  readIdx: index('notifications_read_idx').on(table.isRead),
}));

const revokedTokens = mysqlTable('revoked_tokens', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`(uuid())`),
  jti: varchar('jti', { length: 255 }).unique().notNull(),
  expiresAt: bigint('expires_at', { mode: 'number' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  jtiIdx: index('revoked_tokens_jti_idx').on(table.jti),
  expiresAtIdx: index('revoked_tokens_expires_at_idx').on(table.expiresAt),
}));

// Relasi-relasi
const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  notifications: many(notifications),
}));

const facilitiesRelations = relations(facilities, ({ many }) => ({
  bookings: many(bookings),
}));

const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  booking: one(bookings, {
    fields: [notifications.bookingId],
    references: [bookings.id],
  }),
}));

const bookingsRelations = relations(bookings , ({ one }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  facility: one(facilities, {
    fields: [bookings.facilityId],
    references: [facilities.id],
  }),
}));

module.exports = {
  users,
  facilities,
  bookings,
  notifications,
  usersRelations,
  facilitiesRelations,
  notificationsRelations,
  bookingsRelations,
  revokedTokens,
};
