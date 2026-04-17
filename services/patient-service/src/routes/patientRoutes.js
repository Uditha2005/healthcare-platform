const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  uploadReport,
  getHistory,
  addPrescription,
  getPrescriptions,
  downloadPrescriptions,
  addMedicalHistory,
  getReports,
  deleteReport,
  downloadReport
} = require('../controllers/patientController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect); // All routes require authentication

// Patient-only routes
router.get('/profile', restrictTo('patient'), getProfile);
router.put('/profile', restrictTo('patient'), updateProfile);
router.post('/upload-report', restrictTo('patient'), uploadReport);
router.get('/history', restrictTo('patient'), getHistory);
router.get('/prescriptions/download', restrictTo('patient'), downloadPrescriptions);
router.get('/prescriptions', restrictTo('patient'), getPrescriptions);
router.get('/reports', restrictTo('patient'), getReports);
router.get('/reports/:reportId/download', restrictTo('patient'), downloadReport);
router.delete('/reports/:reportId', restrictTo('patient'), deleteReport);

// Doctor-only routes (doctors add prescriptions and medical history for patients)
router.post('/prescriptions', restrictTo('doctor'), addPrescription);
router.post('/medical-history', restrictTo('doctor'), addMedicalHistory);

module.exports = router;