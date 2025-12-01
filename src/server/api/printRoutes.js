const express = require("express");
const router = express.Router();

// Test route 
router.get("/", (req, res) => {
  res.json({ message: "Print API working 🚀" });
});

// Example endpoint for triggering a print (placeholder)
router.post("/start", (req, res) => {
  res.json({ status: "Print job received (placeholder)" });
});

module.exports = router;
