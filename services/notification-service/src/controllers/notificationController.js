const nodemailer = require('nodemailer');
const NotificationLog = require('../models/NotificationLog');

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const buildPaymentConfirmedEmail = ({ recipient = {}, booking = {} }) => {
  const appointmentId = booking.appointmentId || 'N/A';
  const date = booking.date || 'N/A';
  const time = booking.time || 'N/A';
  const specialty = booking.specialty || 'General';
  const status = booking.status || 'confirmed';
  const patientName = recipient.name || 'Patient';

  const text = [
    `Hi ${patientName},`,
    '',
    'Your payment has been confirmed and your appointment is now booked.',
    '',
    `Appointment ID: ${appointmentId}`,
    `Date: ${date}`,
    `Time: ${time}`,
    `Specialty: ${specialty}`,
    `Status: ${status}`,
    '',
    'Thank you for using Healthcare Platform.'
  ].join('\n');

  const html = `
    <div style="margin:0;padding:24px;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 12px 30px rgba(15,23,42,0.10);">
        <div style="padding:24px 28px;background:linear-gradient(120deg,#0ea5e9,#2563eb);color:#ffffff;">
          <div style="font-size:13px;letter-spacing:0.4px;opacity:0.95;">Healthcare Platform</div>
          <h2 style="margin:10px 0 0 0;font-size:24px;line-height:1.25;">Payment Confirmed</h2>
          <p style="margin:8px 0 0 0;font-size:14px;opacity:0.95;">Your booking is now confirmed.</p>
        </div>
        <div style="padding:24px 28px;">
          <p style="margin:0 0 16px 0;font-size:15px;">Hi ${escapeHtml(patientName)},</p>
          <p style="margin:0 0 18px 0;font-size:14px;line-height:1.6;color:#4b5563;">
            We received your payment successfully. Here are your appointment details:
          </p>
          <div style="border:1px solid #e5e7eb;border-radius:12px;padding:14px 16px;background:#f8fafc;">
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr>
                <td style="padding:8px 0;color:#6b7280;width:42%;">Appointment ID</td>
                <td style="padding:8px 0;color:#111827;font-weight:600;">${escapeHtml(appointmentId)}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#6b7280;">Date</td>
                <td style="padding:8px 0;color:#111827;font-weight:600;">${escapeHtml(date)}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#6b7280;">Time</td>
                <td style="padding:8px 0;color:#111827;font-weight:600;">${escapeHtml(time)}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#6b7280;">Specialty</td>
                <td style="padding:8px 0;color:#111827;font-weight:600;">${escapeHtml(specialty)}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#6b7280;">Status</td>
                <td style="padding:8px 0;"><span style="display:inline-block;padding:4px 10px;background:#dcfce7;color:#166534;border-radius:999px;font-size:12px;font-weight:700;text-transform:uppercase;">${escapeHtml(status)}</span></td>
              </tr>
            </table>
          </div>
          <p style="margin:18px 0 0 0;font-size:13px;color:#6b7280;line-height:1.6;">
            Need help? Reply to this email and our support team will assist you.
          </p>
        </div>
      </div>
    </div>
  `;

  return {
    subject: 'Payment Confirmed - Appointment Booked',
    message: text,
    html
  };
};

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

const sendThroughChannels = async ({ recipient, subject, message, html }) => {
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
        text: message,
        html
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
    const {
      eventType = 'custom',
      recipient,
      subject = 'Healthcare Notification',
      message,
      html,
      booking
    } = req.body;

    let finalSubject = subject;
    let finalMessage = message;
    let finalHtml = html;

    if (eventType === 'payment_confirmed') {
      const templatedEmail = buildPaymentConfirmedEmail({ recipient, booking });
      finalSubject = templatedEmail.subject;
      finalMessage = templatedEmail.message;
      finalHtml = templatedEmail.html;
    }

    if (!recipient || !finalMessage) {
      return res.status(400).json({ message: 'recipient and message are required' });
    }

    const channelResult = await sendThroughChannels({
      recipient,
      subject: finalSubject,
      message: finalMessage,
      html: finalHtml
    });

    const log = await NotificationLog.create({
      eventType,
      recipient,
      subject: finalSubject,
      message: finalMessage,
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
