const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { requireAdmin } = require("../middleware/auth");

// CREATE a new user
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, telephone, role } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "Username, email, and password are required." });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check for existing user by username or email
    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: username.trim() }],
    });
    if (existingUser) {
      return res.status(400).json({
        error: "A user with that username or email already exists.",
      });
    }

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      username: username.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      telephone: telephone || "",
      role: role || "Staff",
      isActive: true,
    });

    await user.save();

    // Automatically issue a token so new admins/users can immediately authenticate
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "fallback_secret_key",
      { expiresIn: "1d" },
    );

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET all users (Admin only)
router.get("/", requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE a user (Admin only)
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const updates = { ...req.body };

    // If password is being updated, hash it properly
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    if (updates.email) {
      updates.email = updates.email.trim().toLowerCase();
    }

    Object.keys(updates).forEach((key) => {
      user[key] = updates[key];
    });

    await user.save();
    res.json({
      message: "User updated successfully",
      user: { username: user.username, role: user.role, email: user.email },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// TOGGLE Block / Unblock user status (Admin only)
router.patch("/:id/toggle-block", requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${user.isActive ? "unblocked" : "blocked"} successfully`,
      isActive: user.isActive,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE a user (Admin only)
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LOGIN user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide both email and password." });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if the user exists
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Check if user account is blocked
    if (user.isActive === false) {
      return res.status(403).json({
        message:
          "Your account has been blocked. Please contact the administrator.",
      });
    }

    // Compare plain password against hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Sign JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "fallback_secret_key",
      { expiresIn: "1d" },
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
