const Patient = require('../models/Patient');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
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
    const patient = await Patient.findOne({ userId: req.user.id });
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
    const updates = { ...req.body, userId: req.user.id };
    const patient = await Patient.findOneAndUpdate(
      { userId: req.user.id },
      updates,
      { new: true, runValidators: true, upsert: true }
    );
    res.json({ message: 'Profile saved successfully', patient });
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
        description: req.body.description || '',
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

// POST /prescriptions - Add a prescription (doctor only)
exports.addPrescription = async (req, res) => {
  try {
    const { patientId, medication, dosage, instructions } = req.body;

    if (!patientId || !medication || !dosage) {
      return res.status(400).json({ message: 'patientId, medication, and dosage are required' });
    }

    const patient = await Patient.findOne({ userId: patientId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const prescription = {
      date: new Date(),
      medication,
      dosage,
      instructions: instructions || '',
      doctor: req.user.id
    };

    patient.prescriptions.push(prescription);
    await patient.save();

    res.status(201).json({
      message: 'Prescription added successfully',
      prescription: patient.prescriptions[patient.prescriptions.length - 1]
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /prescriptions - Get prescriptions for a patient
exports.getPrescriptions = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    res.json({ prescriptions: patient.prescriptions });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /medical-history - Add a medical history entry (doctor only)
exports.addMedicalHistory = async (req, res) => {
  try {
    const { patientId, condition, notes } = req.body;

    if (!patientId || !condition) {
      return res.status(400).json({ message: 'patientId and condition are required' });
    }

    const patient = await Patient.findOne({ userId: patientId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const entry = {
      date: new Date(),
      condition,
      notes: notes || '',
      doctor: req.user.id
    };

    patient.medicalHistory.push(entry);
    await patient.save();

    res.status(201).json({
      message: 'Medical history entry added',
      entry: patient.medicalHistory[patient.medicalHistory.length - 1]
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /reports - Get all uploaded reports for a patient
exports.getReports = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    res.json({ reports: patient.reports });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /reports/:reportId - Delete a report
exports.deleteReport = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    const report = patient.reports.id(req.params.reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (report.path && fs.existsSync(report.path)) {
      fs.unlinkSync(report.path);
    }

    report.deleteOne();
    await patient.save();

    res.json({ message: 'Report deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
