const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const sessionRoutes = require("./routes/session.routes");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/sessions", sessionRoutes);

app.get("/", (req, res) => {
  res.send("Telemedicine Service Running");
});

const PORT = process.env.PORT || 5003;

app.listen(PORT, () => {
  console.log(`Telemedicine running on port ${PORT}`);
});