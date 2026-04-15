const Session = require("../models/session.model");

// CREATE SESSION + JITSI LINK
exports.createSession = async (req, res) => {
  try {
    const { doctorId, patientId } = req.body;

    // generate simple Jitsi meeting room
    const roomName = `doc-${doctorId}-pat-${patientId}-${Date.now()}`;
    const meetingLink = `https://meet.jit.si/${roomName}`;

    const session = await Session.create({
      doctorId,
      patientId,
      meetingLink,
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