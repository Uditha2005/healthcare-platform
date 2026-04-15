const nodemailer = require('nodemailer');
const NotificationLog = require('../models/NotificationLog');

const createTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const normalizeSriLankanPhone = (phone) => {
  const normalized = String(phone || '').replace(/\D/g, '');

  if (normalized.startsWith('94')) return normalized;
  if (normalized.startsWith('0')) return `94${normalized.slice(1)}`;
  if (normalized.startsWith('7') && normalized.length === 9) return `94${normalized}`;

  return normalized;
};

const sendSmsWithNotifyLk = async ({ phone, message }) => {
  const userId = process.env.NOTIFYLK_USER_ID;
  const apiKey = process.env.NOTIFYLK_API_KEY;
  const senderId = process.env.NOTIFYLK_SENDER_ID || 'NotifyDEMO';

  if (!userId || !apiKey || !senderId) {
    return {
      status: 'skipped',
      error: 'Notify.lk credentials are not configured'
    };
  }

  const to = normalizeSriLankanPhone(phone);
  const params = new URLSearchParams({
    user_id: userId,
    api_key: apiKey,
    sender_id: senderId,
    to,
    message
  });

  const baseUrl = process.env.NOTIFYLK_API_BASE_URL || 'https://app.notify.lk/api/v1';
  const response = await fetch(`${baseUrl}/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  let result = null;
  try {
    result = await response.json();
  } catch (err) {
    result = null;
  }

  if (!response.ok) {
    throw new Error(
      (result && (result.message || result.data)) || `Notify.lk API request failed with status ${response.status}`
    );
  }

  if (!result || result.status !== 'success') {
    throw new Error(
      (result && (result.message || result.data)) || 'Notify.lk API returned a non-success status'
    );
  }

  return { status: 'sent' };
};

const sendThroughChannels = async ({ recipient, subject, message }) => {
  let emailStatus = 'skipped';
  let smsStatus = 'skipped';
  let emailError;
  let smsError;

  const transporter = createTransporter();
  if (recipient.email && transporter) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: recipient.email,
        subject,
        text: message
      });
      emailStatus = 'sent';
    } catch (err) {
      emailStatus = 'failed';
      emailError = err.message;
    }
  }

  if (recipient.phone) {
    try {
      const smsResult = await sendSmsWithNotifyLk({
        phone: recipient.phone,
        message
      });

      smsStatus = smsResult.status;
      smsError = smsResult.error;
    } catch (err) {
      smsStatus = 'failed';
      smsError = err.message;
    }
  }

  return { emailStatus, smsStatus, emailError, smsError };
};

exports.sendNotification = async (req, res) => {
  try {
    const { eventType = 'custom', recipient, subject = 'Healthcare Notification', message } = req.body;

    if (!recipient || !message) {
      return res.status(400).json({ message: 'recipient and message are required' });
    }

    const channelResult = await sendThroughChannels({ recipient, subject, message });

    const log = await NotificationLog.create({
      eventType,
      recipient,
      subject,
      message,
      ...channelResult
    });

    return res.status(201).json({
      message: 'Notification processed',
      notification: log
    });
  } catch (err) {
    return res.status(500).json({ message: 'Unable to send notification', error: err.message });
  }
};

exports.sendAppointmentBookedNotification = async (req, res) => {
  const { recipient, appointmentId, doctorName, appointmentTime } = req.body;

  if (!recipient || !appointmentId || !doctorName || !appointmentTime) {
    return res.status(400).json({
      message: 'recipient, appointmentId, doctorName and appointmentTime are required'
    });
  }

  req.body = {
    eventType: 'appointment_booked',
    recipient,
    subject: 'Appointment Confirmed',
    message: `Your appointment (${appointmentId}) with Dr. ${doctorName} is booked for ${appointmentTime}.`
  };

  return exports.sendNotification(req, res);
};

exports.sendConsultationCompletedNotification = async (req, res) => {
  const { recipient, consultationId, doctorName } = req.body;

  if (!recipient || !consultationId || !doctorName) {
    return res.status(400).json({
      message: 'recipient, consultationId and doctorName are required'
    });
  }

  req.body = {
    eventType: 'consultation_completed',
    recipient,
    subject: 'Consultation Completed',
    message: `Consultation ${consultationId} with Dr. ${doctorName} has been marked as completed.`
  };

  return exports.sendNotification(req, res);
};
