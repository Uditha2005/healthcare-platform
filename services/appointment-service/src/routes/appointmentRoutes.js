const express = require('express');
const router = express.Router();
const {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  deleteAppointment,
  searchDoctors,
  getDoctorById,
  getDoctorAvailability
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All routes require authentication

// Doctor search & availability (must be before /:id routes)
router.get('/doctors/search', searchDoctors);
router.get('/doctors/:id', getDoctorById);
router.get('/doctors/:id/availability', getDoctorAvailability);

// Appointment CRUD
router.get('/', getAppointments);
router.post('/', createAppointment);
router.get('/:id', getAppointmentById);
router.put('/:id', updateAppointment);
router.patch('/:id/status', updateAppointmentStatus);
router.delete('/:id', deleteAppointment);

module.exports = router;