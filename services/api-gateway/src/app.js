const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'API Gateway is running' });
});

/* =========================
   Route: Doctor Service
   (mapped to your existing service)
========================= */
app.use('/api/doctors', createProxyMiddleware({
  target: process.env.DOCTOR_SERVICE_URL || 'http://localhost:5002',
  changeOrigin: true,
}));

/* =========================
   Route: Telemedicine Service
   (replacing appointment/patient for now)
========================= */
app.use('/api/sessions', createProxyMiddleware({
  target: process.env.TELEMEDICINE_SERVICE_URL || 'http://localhost:5003',
  changeOrigin: true,
}));

/* =========================
   KEEP ORIGINAL STRUCTURE (fallbacks)
   (so your code doesn't break if others exist)
========================= */

app.use('/api/auth', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL || 'http://localhost:5001',
  changeOrigin: true,
}));

app.use('/api/patient', createProxyMiddleware({
  target: process.env.PATIENT_SERVICE_URL || 'http://localhost:5004',
  changeOrigin: true,
}));

app.use('/api/appointment', createProxyMiddleware({
  target: process.env.APPOINTMENT_SERVICE_URL || 'http://localhost:5005',
  changeOrigin: true,
}));

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});