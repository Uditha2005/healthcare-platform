const express = require("express");
const router = express.Router();

const {
  createSession,
  getSessions,
  getSessionByAppointment,
  endSession,
  endSessionByAppointment,
} = require("../controllers/session.controller");

router.post("/", createSession);
router.get("/", getSessions);
router.get("/appointment/:appointmentId", getSessionByAppointment);
router.patch("/:id/end", endSession);
router.patch("/appointment/:appointmentId/end", endSessionByAppointment);

module.exports = router;