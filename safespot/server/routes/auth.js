const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/users.js");

const router = express.Router();

// ---------------- SIGNUP ----------------
router.post("/signup", async (req, res) => {
  const { username, email, password, displayName, age, gender, avatar } = req.body;

  try {
    if (!username || !email || !password || !displayName || !age || !gender) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const exists = await User.findOne({
      $or: [
        { username: username.trim() },
        { email: email.toLowerCase().trim() },
        { displayName: displayName.trim() }
      ]
    });

    if (exists) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      displayName: displayName.trim(),
      age: Number(age),
      gender,
      avatar: avatar || "default.png"
    });

    const token = jwt.sign(
      {
        userId: user._id,
        displayName: user.displayName
      },
      "secret_key_change_later",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        displayName: user.displayName,
        avatar: user.avatar
      }
    });

  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Signup failed" });
  }
});

// ---------------- LOGIN ----------------
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log("LOGIN ATTEMPT:", username);

    if (!username || !password) {
      return res.status(400).json({ error: "Missing credentials" });
    }

    const user = await User.findOne({ username });

    if (!user) {
      console.log("User not found");
      return res.status(400).json({ error: "User not found" });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      console.log("Wrong password");
      return res.status(400).json({ error: "Wrong password" });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        displayName: user.displayName,
      },
      "secret_key_change_later",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        displayName: user.displayName,
        avatar: user.avatar,
      },
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err); // 🔥 THIS IS WHAT YOU NEED
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;