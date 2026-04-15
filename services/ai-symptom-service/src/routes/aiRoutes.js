const express = require('express');
const router = express.Router();

const { checkSymptoms } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/check-symptoms', protect, checkSymptoms);

module.exports = router;
