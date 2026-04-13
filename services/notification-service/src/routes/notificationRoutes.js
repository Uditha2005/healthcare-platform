const express = require('express');
const router = express.Router();

const {
  sendNotification,
  sendAppointmentBookedNotification,
  sendConsultationCompletedNotification
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/send', sendNotification);
router.post('/appointment-booked', sendAppointmentBookedNotification);
router.post('/consultation-completed', sendConsultationCompletedNotification);

module.exports = router;
