const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { requireAdmin } = require("../middleware/auth");

// CREATE a new user (Admin only or registration)
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, telephone, role } = req.body;
    const user = new User({ username, email, password, telephone, role });
    await user.save();
    res.status(201).json({
      message: "User created successfully",
      user: { username, email, role },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET all users (Admin only)
router.get("/", requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Exclude passwords from response
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

    const updates = req.body;
    Object.keys(updates).forEach((key) => {
      user[key] = updates[key];
    });

    await user.save();
    res.json({
      message: "User updated successfully",
      user: { username: user.username, role: user.role },
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

// LOGIN user (Checks if active/not blocked)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Verify email and password are provided
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide both email and password." });
    }

    // 2. Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // 3. Check if user account is blocked
    if (user.isActive === false) {
      return res.status(403).json({
        message:
          "Your account has been blocked. Please contact the administrator.",
      });
    }

    // 4. Compare the provided password with the hashed database password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // 5. Generate the JWT payload containing user ID and Role
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }, // Token expires in 24 hours
    );

    // 6. Send the token and user data to the frontend
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
