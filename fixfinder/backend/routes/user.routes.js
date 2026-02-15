const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// ✅ Reuse auth middleware (same logic as your auth.routes.js)
function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Missing token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, email, userType, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

/**
 * ✅ GET /api/users/by-email?email=someone@gmail.com
 * Returns the user data from MongoDB by email
 */
router.get("/by-email", requireAuth, async (req, res) => {
  try {
    const email = String(req.query.email || "").trim().toLowerCase();
    if (!email || !email.includes("@")) {
      return res.status(400).json({ message: "Valid email query param is required" });
    }

    // If you want to allow ONLY the logged-in user to fetch their own email:
    if (email !== req.user.email) {
      return res.status(403).json({ message: "Not allowed to fetch other users" });
    }

    const user = await User.findOne({ email }).select("-passwordHash -__v");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ user });
  } catch (err) {
    console.error("BY-EMAIL ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;