const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    doctorId: {
      type: String,
      required: true,
    },
    patientId: {
      type: String,
      required: true,
    },
    meetingLink: {
      type: String,
    },
    status: {
      type: String,
      default: "scheduled",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Session", sessionSchema);