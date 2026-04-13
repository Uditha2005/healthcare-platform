const nodemailer = require('nodemailer');
const twilio = require('twilio');
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

const createTwilioClient = () => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    return null;
  }

  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
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

  const twilioClient = createTwilioClient();
  if (recipient.phone && twilioClient) {
    try {
      await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: recipient.phone
      });
      smsStatus = 'sent';
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
