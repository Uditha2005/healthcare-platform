const Patient = require('../models/Patient');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
}).single('report');

// GET /profile
exports.getProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.id }).populate('userId', 'name email');
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /profile
exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const patient = await Patient.findOneAndUpdate(
      { userId: req.user.id },
      updates,
      { new: true, runValidators: true }
    );
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    res.json({ message: 'Profile updated successfully', patient });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /upload-report
exports.uploadReport = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
      const patient = await Patient.findOne({ userId: req.user.id });
      if (!patient) {
        return res.status(404).json({ message: 'Patient profile not found' });
      }

      patient.reports.push({
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path
      });

      await patient.save();
      res.json({ message: 'Report uploaded successfully', report: patient.reports[patient.reports.length - 1] });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });
};

// GET /history
exports.getHistory = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    res.json({
      medicalHistory: patient.medicalHistory,
      prescriptions: patient.prescriptions,
      reports: patient.reports
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};