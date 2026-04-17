const Session = require("../models/session.model");

// CREATE SESSION + JITSI LINK (linked to an appointment)
exports.createSession = async (req, res) => {
  try {
    const { doctorId, patientId, appointmentId } = req.body;

    if (!doctorId || !patientId || !appointmentId) {
      return res.status(400).json({ message: "doctorId, patientId, and appointmentId are required" });
    }

    // Check if session already exists for this appointment
    const existing = await Session.findOne({ appointmentId });
    if (existing) {
      return res.status(200).json(existing);
    }

    // Generate Jitsi meeting room
    const roomName = `healthcare-${appointmentId}-${Date.now()}`;
    const meetingLink = `https://meet.jit.si/${roomName}`;

    const session = await Session.create({
      doctorId,
      patientId,
      appointmentId,
      meetingLink,
      status: "active",
    });

    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET all sessions
exports.getSessions = async (req, res) => {
  try {
    const sessions = await Session.find();
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET session by appointment ID
exports.getSessionByAppointment = async (req, res) => {
  try {
    const session = await Session.findOne({ appointmentId: req.params.appointmentId });
    if (!session) {
      return res.status(404).json({ message: "No session found for this appointment" });
    }
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// END session by ID
exports.endSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    session.status = "ended";
    await session.save();
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// END session by appointment ID
exports.endSessionByAppointment = async (req, res) => {
  try {
    const session = await Session.findOne({ appointmentId: req.params.appointmentId });
    if (!session) {
      return res.status(404).json({ message: "No session found for this appointment" });
    }
    session.status = "ended";
    await session.save();
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};