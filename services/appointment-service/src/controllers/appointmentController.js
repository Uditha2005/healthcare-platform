const Appointment = require('../models/Appointment');
const axios = require('axios');

const DOCTOR_SERVICE_URL = process.env.DOCTOR_SERVICE_URL || 'http://localhost:5002';

// Helper: resolve auth userId to doctor-service _id
async function getDoctorIdFromUserId(userId, email) {
  try {
    const res = await axios.get(`${DOCTOR_SERVICE_URL}/api/doctors/user/${userId}`);
    return res.data._id;
  } catch {
    // Fallback: try email lookup for doctors registered before userId was added
    if (email) {
      try {
        const res = await axios.get(`${DOCTOR_SERVICE_URL}/api/doctors/email/${encodeURIComponent(email)}`);
        return res.data._id;
      } catch {
        return null;
      }
    }
    return null;
  }
}

// GET /appointments
exports.getAppointments = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'patient') {
      query.patientId = req.user.id;
    } else if (req.user.role === 'doctor') {
      // Resolve auth userId to doctor-service _id
      const doctorId = await getDoctorIdFromUserId(req.user.id, req.user.email);
      if (!doctorId) {
        console.error('Could not resolve doctor ID for user:', req.user.id);
        return res.json([]);
      }
      query.doctorId = doctorId;
    }
    // Admin can see all

    const appointments = await Appointment.find(query).sort({ date: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /appointments/:id - Get single appointment with status tracking
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check permissions
    if (
      req.user.role === 'patient' && appointment.patientId.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (req.user.role === 'doctor') {
      const doctorId = await getDoctorIdFromUserId(req.user.id, req.user.email);
      if (!doctorId || appointment.doctorId.toString() !== doctorId.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json(appointment);
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

    if (!doctorId || !specialty || !date || !time) {
      return res.status(400).json({ message: 'doctorId, specialty, date, and time are required' });
    }

    // Verify doctor exists and check availability via doctor-service
    try {
      const doctorRes = await axios.get(`${DOCTOR_SERVICE_URL}/api/doctors/${doctorId}`);
      const doctor = doctorRes.data;

      // Check if doctor has the requested time slot available
      if (doctor.availability && doctor.availability.length > 0) {
        const requestedDate = new Date(date);
        const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        const requestedDay = days[requestedDate.getDay()];

        const daySlots = doctor.availability.filter(a => a.day === requestedDay);

        if (daySlots.length === 0) {
          return res.status(400).json({ message: 'Doctor is not available on the selected date' });
        }

        // Check if the requested time falls within any of the doctor's slots for that day
        const isWithinSlot = daySlots.some(slot => {
          return time >= slot.startTime && time < slot.endTime;
        });

        if (!isWithinSlot) {
          return res.status(400).json({
            message: 'Doctor is not available at the selected time',
            availableSlots: daySlots.map(s => `${s.startTime} - ${s.endTime}`)
          });
        }
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        return res.status(404).json({ message: 'Doctor not found' });
      }
      console.error('Doctor service unavailable:', err.message);
      // Continue even if doctor-service is down (graceful degradation)
    }

    // Check if slot is already booked
    const existing = await Appointment.findOne({
      doctorId,
      date,
      time,
      status: { $ne: 'cancelled' }
    });
    if (existing) {
      return res.status(400).json({ message: 'Time slot already booked' });
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

// PUT /appointments/:id - Update/reschedule appointment
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
    if (req.user.role === 'doctor') {
      const resolvedDoctorId = await getDoctorIdFromUserId(req.user.id, req.user.email);
      if (!resolvedDoctorId || appointment.doctorId.toString() !== resolvedDoctorId.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    // Prevent modifying cancelled/completed appointments
    if (['cancelled', 'completed'].includes(appointment.status)) {
      return res.status(400).json({ message: `Cannot modify a ${appointment.status} appointment` });
    }

    // If rescheduling, check availability
    if (updates.date || updates.time) {
      const newDate = updates.date || appointment.date;
      const newTime = updates.time || appointment.time;

      // Check doctor availability via doctor-service
      try {
        const doctorRes = await axios.get(`${DOCTOR_SERVICE_URL}/api/doctors/${appointment.doctorId}`);
        const doctor = doctorRes.data;

        if (doctor.availability && doctor.availability.length > 0) {
          const rescheduledDate = new Date(newDate);
          const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
          const rescheduledDay = days[rescheduledDate.getDay()];

          const daySlots = doctor.availability.filter(a => a.day === rescheduledDay);

          if (daySlots.length === 0) {
            return res.status(400).json({ message: 'Doctor is not available on the new date' });
          }

          const isWithinSlot = daySlots.some(slot => {
            return newTime >= slot.startTime && newTime < slot.endTime;
          });

          if (!isWithinSlot) {
            return res.status(400).json({
              message: 'Doctor is not available at the new time',
              availableSlots: daySlots.map(s => `${s.startTime} - ${s.endTime}`)
            });
          }
        }
      } catch (err) {
        console.error('Doctor service unavailable:', err.message);
      }

      // Check for conflicts with other bookings
      const existing = await Appointment.findOne({
        doctorId: appointment.doctorId,
        date: newDate,
        time: newTime,
        status: { $ne: 'cancelled' },
        _id: { $ne: id }
      });
      if (existing) {
        return res.status(400).json({ message: 'New time slot already booked' });
      }
    }

    // Only allow specific fields to be updated
    const allowedUpdates = ['date', 'time', 'notes', 'status'];
    const sanitizedUpdates = {};
    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        sanitizedUpdates[key] = updates[key];
      }
    }

    // Doctors can confirm/complete, patients can only cancel
    if (sanitizedUpdates.status) {
      if (req.user.role === 'patient' && sanitizedUpdates.status !== 'cancelled') {
        return res.status(403).json({ message: 'Patients can only cancel appointments' });
      }
      if (req.user.role === 'doctor' && !['confirmed', 'completed', 'cancelled'].includes(sanitizedUpdates.status)) {
        return res.status(400).json({ message: 'Invalid status transition' });
      }
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(id, sanitizedUpdates, { new: true });
    res.json({ message: 'Appointment updated successfully', appointment: updatedAppointment });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PATCH /appointments/:id/status - Update appointment status (for tracking)
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Valid status required: pending, confirmed, cancelled, completed' });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check permissions
    if (req.user.role === 'patient' && appointment.patientId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (req.user.role === 'doctor') {
      const resolvedDoctorId = await getDoctorIdFromUserId(req.user.id, req.user.email);
      if (!resolvedDoctorId || appointment.doctorId.toString() !== resolvedDoctorId.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    // Status transition rules
    if (appointment.status === 'cancelled' || appointment.status === 'completed') {
      return res.status(400).json({ message: `Cannot change status of a ${appointment.status} appointment` });
    }
    if (req.user.role === 'patient' && status !== 'cancelled') {
      return res.status(403).json({ message: 'Patients can only cancel appointments' });
    }

    appointment.status = status;
    await appointment.save();

    res.json({ message: `Appointment ${status}`, appointment });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /appointments/:id - Cancel appointment
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
    if (req.user.role === 'doctor') {
      const resolvedDoctorId = await getDoctorIdFromUserId(req.user.id, req.user.email);
      if (!resolvedDoctorId || appointment.doctorId.toString() !== resolvedDoctorId.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    // Soft delete - set status to cancelled instead of removing
    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ message: 'Appointment cancelled successfully', appointment });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /doctors/search?specialty=... - Search doctors by specialty
exports.searchDoctors = async (req, res) => {
  try {
    const { specialty, name } = req.query;

    let url = `${DOCTOR_SERVICE_URL}/api/doctors`;

    // Fetch all doctors from doctor-service
    const response = await axios.get(url);
    let doctors = response.data;

    // Filter by specialty (case-insensitive partial match)
    if (specialty) {
      doctors = doctors.filter(d =>
        d.specialization && d.specialization.toLowerCase().includes(specialty.toLowerCase())
      );
    }

    // Filter by name (case-insensitive partial match)
    if (name) {
      doctors = doctors.filter(d =>
        d.name && d.name.toLowerCase().includes(name.toLowerCase())
      );
    }

    res.json({
      count: doctors.length,
      doctors
    });
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({ message: 'Doctor service is currently unavailable' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /doctors/:id - Get single doctor details with availability
exports.getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`${DOCTOR_SERVICE_URL}/api/doctors/${id}`);
    res.json(response.data);
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({ message: 'Doctor service is currently unavailable' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /doctors/:id/availability - Get doctor's available slots
exports.getDoctorAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    // Get doctor info from doctor-service
    const doctorRes = await axios.get(`${DOCTOR_SERVICE_URL}/api/doctors/${id}`);
    const doctor = doctorRes.data;

    if (!doctor.availability || doctor.availability.length === 0) {
      return res.json({ doctorId: id, doctorName: doctor.name, availability: [] });
    }

    // Get existing appointments for this doctor (non-cancelled)
    const bookedAppointments = await Appointment.find({
      doctorId: id,
      status: { $ne: 'cancelled' }
    });

    // Filter out already booked slots
    const availableSlots = doctor.availability.map(day => {
      const bookedForDay = bookedAppointments
        .filter(a => {
          const appointmentDate = new Date(a.date).toISOString().split('T')[0];
          return appointmentDate === day.date;
        })
        .map(a => a.time);

      return {
        date: day.date,
        timeSlots: day.timeSlots.filter(slot => !bookedForDay.includes(slot))
      };
    }).filter(day => day.timeSlots.length > 0);

    res.json({
      doctorId: id,
      doctorName: doctor.name,
      specialization: doctor.specialization,
      availability: availableSlots
    });
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({ message: 'Doctor service is currently unavailable' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};