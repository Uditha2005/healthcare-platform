const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createProxyMiddleware, fixRequestBody } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'API Gateway is running' });
});

/* =========================
   Doctor Service Route
========================= */
app.use('/api/doctors', createProxyMiddleware({
  target: process.env.DOCTOR_SERVICE_URL || 'http://localhost:5002',
  changeOrigin: true,
  on: { proxyReq: fixRequestBody }
}));

/* =========================
   Telemedicine / Sessions Route
========================= */
app.use('/api/sessions', createProxyMiddleware({
  target: process.env.TELEMEDICINE_SERVICE_URL || 'http://localhost:5003',
  changeOrigin: true,
  on: { proxyReq: fixRequestBody }
}));

/* =========================
   Core Services
========================= */
app.use('/api/auth', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  changeOrigin: true,
  on: {
    proxyReq: fixRequestBody,
    error: (err, req, res) => {
      res.status(502).json({ message: 'Auth service unavailable' });
    }
  }
}));

app.use('/api/patient', createProxyMiddleware({
  target: process.env.PATIENT_SERVICE_URL || 'http://localhost:3002',
  changeOrigin: true,
  on: { proxyReq: fixRequestBody }
}));

app.use('/patient', createProxyMiddleware({
  target: process.env.PATIENT_SERVICE_URL || 'http://localhost:3002',
  changeOrigin: true,
  on: { proxyReq: fixRequestBody }
}));

app.use('/api/appointments', createProxyMiddleware({
  target: process.env.APPOINTMENT_SERVICE_URL || 'http://localhost:3003',
  changeOrigin: true,
  on: { proxyReq: fixRequestBody }
}));

app.use('/api/appointment', createProxyMiddleware({
  target: process.env.APPOINTMENT_SERVICE_URL || 'http://localhost:3003',
  changeOrigin: true,
  on: { proxyReq: fixRequestBody }
}));

app.use('/appointments', createProxyMiddleware({
  target: process.env.APPOINTMENT_SERVICE_URL || 'http://localhost:3003',
  changeOrigin: true,
  on: { proxyReq: fixRequestBody }
}));

app.use('/appointment', createProxyMiddleware({
  target: process.env.APPOINTMENT_SERVICE_URL || 'http://localhost:3003',
  changeOrigin: true,
  on: { proxyReq: fixRequestBody }
}));

app.use('/api/payment', createProxyMiddleware({
  target: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3004',
  changeOrigin: true,
}));

app.use('/api/ai', createProxyMiddleware({
  target: process.env.AI_SERVICE_URL || 'http://localhost:3006',
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
