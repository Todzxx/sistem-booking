// ============================================================
// FILE: services/notificationService.js
// Layanan notifikasi real-time via Server-Sent Events (SSE)
// + penyimpanan notifikasi ke database
// ============================================================

const { EventEmitter } = require('events');
const { db } = require('../config/db');
const { notifications } = require('../db/schema');

const notificationEmitter = new EventEmitter();
// Map userId → Set<Response> untuk SSE connections
const userConnections = new Map();

const notificationService = {
  // Daftarkan koneksi SSE untuk user — otomatis cleanup saat koneksi ditutup
  subscribe: (userId, res) => {
    if (!userConnections.has(userId)) userConnections.set(userId, new Set());
    userConnections.get(userId).add(res);

    res.on('close', () => {
      const connections = userConnections.get(userId);
      if (connections) {
        connections.delete(res);
        if (connections.size === 0) userConnections.delete(userId);
      }
    });
  },

  // Kirim notifikasi real-time ke user via SSE
  sendToUser: (userId, notification) => {
    const connections = userConnections.get(userId);
    if (connections) {
      const data = JSON.stringify(notification);
      for (const res of connections) {
        res.write(`data: ${data}\n\n`);
      }
    }
  },

  // Simpan notifikasi ke database
  saveNotification: async (data) => {
    try {
      await db.insert(notifications).values({
        userId: data.userId, title: data.title, message: data.message,
        type: data.type, bookingId: data.bookingId,
      });
    } catch (error) {
      console.error('Failed to save notification:', error);
    }
  },

  // Event handler untuk booking — buat notifikasi, simpan, kirim real-time
  emitBookingEvent: async (eventType, booking, userId) => {
    const notification = {
      type: eventType,
      bookingId: booking.id,
      facilityName: booking.facility?.name || 'Unknown',
      status: booking.status,
      startTime: booking.startTime,
      endTime: booking.endTime,
      purpose: booking.purpose,
      timestamp: new Date().toISOString(),
    };

    switch (eventType) {
      case 'BOOKING_CREATED':
        notification.title = 'Booking Submitted';
        notification.message = `Your booking for ${notification.facilityName} is pending approval.`;
        break;
      case 'BOOKING_APPROVED':
        notification.title = 'Booking Approved';
        notification.message = `Your booking for ${notification.facilityName} has been approved.`;
        break;
      case 'BOOKING_REJECTED':
        notification.title = 'Booking Rejected';
        notification.message = `Your booking for ${notification.facilityName} was rejected.`;
        break;
      case 'BOOKING_CANCELLED':
        notification.title = 'Booking Cancelled';
        notification.message = `Your booking for ${notification.facilityName} has been cancelled.`;
        break;
    }

    // Simpan ke DB
    await notificationService.saveNotification({
      userId, title: notification.title, message: notification.message,
      type: eventType, bookingId: booking.id,
    });

    // Kirim real-time + emit event
    notificationService.sendToUser(userId, notification);
    notificationEmitter.emit('notification', notification);
  },
};

module.exports = { notificationService, notificationEmitter };
