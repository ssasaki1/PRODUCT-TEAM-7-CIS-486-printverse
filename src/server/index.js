require("dotenv").config();


const express = require('express');
const path = require('path');
const cors = require('cors');
const printRoutes = require('./api/printRoutes');
const printSettingsRoutes = require("./routes/printSettingsRoutes");
const authRoutes = require("./routes/authRoutes");
const connectDB = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Serve static frontend files from /public
app.use(express.static(path.join(__dirname, '..', '..', 'public')));

// API routes
app.use('/api', printRoutes);
app.use("/print-settings", printSettingsRoutes);
app.use("/auth", authRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
