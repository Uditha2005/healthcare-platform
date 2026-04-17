const mongoose = require('mongoose');

const notificationLogSchema = new mongoose.Schema({
  eventType: {
    type: String,
    enum: ['appointment_booked', 'consultation_completed', 'payment_confirmed', 'custom'],
    default: 'custom'
  },
  recipient: {
    userId: mongoose.Schema.Types.ObjectId,
    role: String,
    name: String,
    email: String,
    phone: String
  },
  subject: String,
  message: {
    type: String,
    required: true
  },
  emailStatus: {
    type: String,
    enum: ['sent', 'failed', 'skipped'],
    default: 'skipped'
  },
  smsStatus: {
    type: String,
    enum: ['sent', 'failed', 'skipped'],
    default: 'skipped'
  },
  emailError: String,
  smsError: String
}, { timestamps: true });

module.exports = mongoose.model('NotificationLog', notificationLogSchema);
