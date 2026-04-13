const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const paymentRoutes = require('./routes/paymentRoutes');
const { handleStripeWebhook } = require('./controllers/paymentController');

const app = express();

app.use(helmet());
app.use(cors());

app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);
app.use(express.json());
app.use('/api/payment', paymentRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Payment service is running' });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(process.env.PORT, () => {
      console.log(`Payment service running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
