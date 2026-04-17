const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/notification', notificationRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Notification service is running' });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(process.env.PORT, () => {
      console.log(`Notification service running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
