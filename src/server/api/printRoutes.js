const express = require("express");
const router = express.Router();
const { parseInstructions } = require("../services/nlpService");

// Simple test route
router.get("/", (req, res) => {
  res.json({ message: "Print API working" });
});

// AI route: parse natural language into printer settings
router.post("/parse-instructions", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: 'Field "text" is required.' });
    }

    const settings = await parseInstructions(text);

    // If nlpService returned an error object
    if (settings && settings.error) {
      return res.status(500).json({ error: settings.error });
    }

    return res.json({
      text,
      settings,
      message: "Settings generated from instructions.",
    });
  } catch (err) {
    console.error("Error in /api/parse-instructions:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
