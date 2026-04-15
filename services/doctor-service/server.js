const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const doctorRoutes = require("./routes/doctor.routes");

const app = express();

app.use(cors());
app.use(express.json());

// connect DB
connectDB();

// routes
app.use("/api/doctors", doctorRoutes);

app.get("/", (req, res) => {
  res.send("Doctor Service Running");
});

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`Doctor Service running on port ${PORT}`);
});