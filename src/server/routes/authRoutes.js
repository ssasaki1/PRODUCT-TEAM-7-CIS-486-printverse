const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ error: "Username and password required." });

    const exists = await User.findOne({ username });
    if (exists)
      return res.status(409).json({ error: "Username already taken." });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, passwordHash: hash });

    res.json({
      message: "Registered successfully",
      user: { id: user._id, username: user.username }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while registering." });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user)
      return res.status(401).json({ error: "Invalid credentials." });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid)
      return res.status(401).json({ error: "Invalid credentials." });

    res.json({
      message: "Login successful",
      user: { id: user._id, username: user.username }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while logging in." });
  }
});

module.exports = router;
