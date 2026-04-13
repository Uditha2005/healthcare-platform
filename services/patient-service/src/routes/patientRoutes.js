const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, uploadReport, getHistory } = require('../controllers/patientController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect); // All routes require authentication
router.use(restrictTo('patient')); // Only patients can access

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/upload-report', uploadReport);
router.get('/history', getHistory);

module.exports = router;