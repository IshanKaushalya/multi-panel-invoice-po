const jwt = require("jsonwebtoken");
const User = require("../models/User");

const requireAdmin = async (req, res, next) => {
  try {
    // 1. Extract token from Authorization header or custom header
    let token = req.headers.authorization;
    if (token && token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trimLeft();
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token provided. Authorization denied." });
    }

    // 2. Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret_key",
    );

    // 3. Attach user info to request
    req.user = decoded;

    // 4. Case-insensitive admin check (supports "admin", "Admin", "ADMIN")
    if (!req.user.role || req.user.role.toLowerCase() !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Admin rights required." });
    }

    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid or expired token.", error: error.message });
  }
};

module.exports = { requireAdmin };
