const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  medicalHistory: [{
    date: Date,
    condition: String,
    notes: String,
    doctor: String
  }],
  prescriptions: [{
    date: Date,
    medication: String,
    dosage: String,
    instructions: String,
    doctor: String
  }],
  reports: [{
    filename: String,
    originalName: String,
    uploadDate: {
      type: Date,
      default: Date.now
    },
    path: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);