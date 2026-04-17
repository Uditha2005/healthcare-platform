const Patient = require('../models/Patient');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');

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

    // Resolve doctor name from auth User
    let doctorName = 'Doctor';
    try {
      const doctorUser = await User.findById(req.user.id).select('name');
      if (doctorUser && doctorUser.name) doctorName = doctorUser.name;
    } catch (_) {}

    // Resolve patient name from auth User
    let patientName = 'Patient';
    try {
      const patientUser = await User.findById(patientId).select('name');
      if (patientUser && patientUser.name) patientName = patientUser.name;
    } catch (_) {}

    const prescription = {
      date: new Date(),
      medication,
      dosage,
      instructions: instructions || '',
      doctor: req.user.id,
      doctorName,
      patientName
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

// GET /reports/:reportId/download - Download a report file
exports.downloadReport = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    const report = patient.reports.id(req.params.reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const filePath = report.path || path.join(__dirname, '..', '..', 'uploads', report.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Report file not found on server' });
    }

    res.download(filePath, report.originalName || report.filename);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /prescriptions/download - Download all prescriptions as PDF
exports.downloadPrescriptions = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    if (!patient.prescriptions || patient.prescriptions.length === 0) {
      return res.status(404).json({ message: 'No prescriptions found' });
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=prescriptions.pdf');
    doc.pipe(res);

    // Header
    doc.fontSize(22).font('Helvetica-Bold').text('Medical Prescriptions', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').fillColor('#666')
      .text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#ccc').stroke();
    doc.moveDown(1);

    // Each prescription
    patient.prescriptions.forEach((rx, i) => {
      if (doc.y > 680) doc.addPage();

      doc.fontSize(14).font('Helvetica-Bold').fillColor('#000')
        .text(`${i + 1}. ${rx.medication}`);
      doc.moveDown(0.3);
      doc.fontSize(11).font('Helvetica').fillColor('#333');
      doc.text(`Dosage: ${rx.dosage}`);
      if (rx.instructions) {
        doc.text(`Instructions: ${rx.instructions}`);
      }
      if (rx.doctorName) {
        doc.text(`Prescribed by: Dr. ${rx.doctorName}`);
      }
      doc.text(`Date: ${rx.date ? new Date(rx.date).toLocaleDateString() : 'N/A'}`);
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e0e0e0').stroke();
      doc.moveDown(0.8);
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
