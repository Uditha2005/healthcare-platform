const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const aiRoutes = require('./routes/aiRoutes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/ai', aiRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'AI symptom service is running' });
});

const port = Number(process.env.PORT || 3006);
app.listen(port, () => {
  console.log(`AI symptom service running on port ${port}`);
});
