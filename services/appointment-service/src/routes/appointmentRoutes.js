const express = require('express');
const router = express.Router();
const { getAppointments, createAppointment, updateAppointment, deleteAppointment, getDoctors } = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All routes require authentication

router.get('/', getAppointments);
router.post('/', createAppointment);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

// Additional for search
router.get('/doctors', getDoctors);

module.exports = router;