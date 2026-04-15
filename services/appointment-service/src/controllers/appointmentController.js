const Appointment = require('../models/Appointment');
const User = require('../models/User');

// GET /appointments
exports.getAppointments = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'patient') {
      query.patientId = req.user.id;
    } else if (req.user.role === 'doctor') {
      query.doctorId = req.user.id;
    }
    // Admin can see all

    const appointments = await Appointment.find(query);
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /appointments
exports.createAppointment = async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ message: 'Only patients can book appointments' });
    }

    const { doctorId, specialty, date, time, notes } = req.body;

    // Check if slot is available (simple check, no overlapping)
    const existing = await Appointment.findOne({
      doctorId,
      date,
      time,
      status: { $ne: 'cancelled' }
    });
    if (existing) {
      return res.status(400).json({ message: 'Time slot not available' });
    }

    const appointment = await Appointment.create({
      patientId: req.user.id,
      doctorId,
      specialty,
      date,
      time,
      notes
    });

    res.status(201).json({ message: 'Appointment booked successfully', appointment });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /appointments/:id
exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check permissions
    if (req.user.role === 'patient' && appointment.patientId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (req.user.role === 'doctor' && appointment.doctorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // If rescheduling, check availability
    if (updates.date || updates.time) {
      const existing = await Appointment.findOne({
        doctorId: appointment.doctorId,
        date: updates.date || appointment.date,
        time: updates.time || appointment.time,
        status: { $ne: 'cancelled' },
        _id: { $ne: id }
      });
      if (existing) {
        return res.status(400).json({ message: 'New time slot not available' });
      }
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(id, updates, { new: true });
    res.json({ message: 'Appointment updated successfully', appointment: updatedAppointment });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /appointments/:id
exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check permissions
    if (req.user.role === 'patient' && appointment.patientId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (req.user.role === 'doctor' && appointment.doctorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Appointment.findByIdAndDelete(id);
    res.json({ message: 'Appointment cancelled successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /doctors?specialty=...
exports.getDoctors = async (req, res) => {
  try {
    const { specialty } = req.query;
    // In real microservices, this should call doctor-service
    // For now, assume doctors are in User collection with role 'doctor'
    // But since separate service, perhaps hardcode or assume.

    // Since we don't have doctor-service yet, return mock data or assume.
    // For assignment, perhaps skip or add later.

    // To implement, perhaps store doctor specialty in User or separate.
    // For simplicity, return empty or mock.

    res.json({ message: 'Doctor search not implemented yet, integrate with doctor-service' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};