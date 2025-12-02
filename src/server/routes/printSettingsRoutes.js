const express = require("express");
const PrintSetting = require("../models/PrintSetting");

const router = express.Router();

// POST → Create or upsert a setting (max 3 per user)
router.post("/", async (req, res) => {
  const { userId, name, ...settings } = req.body;

  if (!userId || !name) {
    return res.status(400).json({ error: "userId and name are required" });
  }

  try {
    // If this user already has a preset with this name, update it instead of duplicating
    let existingWithName = await PrintSetting.findOne({ userId, name });

    if (existingWithName) {
      const updated = await PrintSetting.findByIdAndUpdate(
        existingWithName._id,
        { userId, name, ...settings },
        { new: true }
      );
      return res.json(updated);
    }

    // Enforce max 3 presets per user
    const existing = await PrintSetting.find({ userId }).sort({ createdAt: -1 });
    if (existing.length >= 3) {
      await PrintSetting.findByIdAndDelete(existing[existing.length - 1]._id);
    }

    const saved = await PrintSetting.create({ userId, name, ...settings });
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET → All settings for a user
router.get("/:userId", async (req, res) => {
  try {
    const settings = await PrintSetting.find({ userId: req.params.userId }).sort({
      createdAt: -1,
    });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET → Single setting by ID
router.get("/item/:id", async (req, res) => {
  try {
    const setting = await PrintSetting.findById(req.params.id);

    if (!setting) {
      return res.status(404).json({ error: "Setting not found" });
    }

    res.json(setting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT → Update saved setting by ID
router.put("/:id", async (req, res) => {
  try {
    const updated = await PrintSetting.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Setting not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE → Remove saved setting by ID
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await PrintSetting.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Setting not found" });
    }

    res.json({ message: "Setting deleted successfully", deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
