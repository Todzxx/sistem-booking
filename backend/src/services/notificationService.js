const { EventEmitter } = require('events');

const notificationEmitter = new EventEmitter();
const userConnections = new Map();

const notificationService = {
  subscribe: (userId, res) => {
    if (!userConnections.has(userId)) {
      userConnections.set(userId, new Set());
    }
    userConnections.get(userId).add(res);

    res.on('close', () => {
      const connections = userConnections.get(userId);
      if (connections) {
        connections.delete(res);
        if (connections.size === 0) {
          userConnections.delete(userId);
        }
      }
    });
  },

  sendToUser: (userId, notification) => {
    const connections = userConnections.get(userId);
    if (connections) {
      const data = JSON.stringify(notification);
      for (const res of connections) {
        res.write(`data: ${data}\n\n`);
      }
    }
  },

  emitBookingEvent: (eventType, booking, userId) => {
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

    notificationService.sendToUser(userId, notification);
    notificationEmitter.emit('notification', notification);
  },
};

module.exports = { notificationService, notificationEmitter };
