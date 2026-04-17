const express = require("express");
const router = express.Router();

const {
  createDoctor,
  getDoctors,
  getDoctor,
  getDoctorByUserId,
  getDoctorByEmail,
  updateDoctor,
  deleteDoctor,
  updateAvailability,
  getAvailability,
} = require("../controllers/doctor.controller");

router.post("/", createDoctor);
router.get("/", getDoctors);
router.get("/user/:userId", getDoctorByUserId);
router.get("/email/:email", getDoctorByEmail);
router.put("/user/:userId/availability", updateAvailability);
router.get("/:id/availability", getAvailability);
router.get("/:id", getDoctor);
router.put("/:id", updateDoctor);
router.delete("/:id", deleteDoctor);

module.exports = router;