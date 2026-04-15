const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'API Gateway is running' });
});

/* =========================
   Doctor Service Route
========================= */
app.use('/api/doctors', createProxyMiddleware({
  target: process.env.DOCTOR_SERVICE_URL || 'http://localhost:5002',
  changeOrigin: true,
}));

/* =========================
   Telemedicine / Sessions Route
========================= */
app.use('/api/sessions', createProxyMiddleware({
  target: process.env.TELEMEDICINE_SERVICE_URL || 'http://localhost:5003',
  changeOrigin: true,
}));

/* =========================
   Core Services
========================= */
app.use('/api/auth', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL || 'http://localhost:5001',
  changeOrigin: true,
  on: {
    error: (err, req, res) => {
      res.status(502).json({ message: 'Auth service unavailable' });
    }
  }
}));

app.use('/api/patient', createProxyMiddleware({
  target: process.env.PATIENT_SERVICE_URL || 'http://localhost:5004',
  changeOrigin: true,
}));

app.use('/api/appointment', createProxyMiddleware({
  target: process.env.APPOINTMENT_SERVICE_URL || 'http://localhost:5005',
  changeOrigin: true,
}));

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});