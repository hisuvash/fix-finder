const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { userId: user._id, email: user.email, userType: user.userType },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

// ✅ Auth middleware (checks JWT)
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

// ✅ REGISTER
router.post("/register", async (req, res) => {
  try {
    const {
      email,
      firstName,
      lastName,
      userType,
      password,
      country,
      stateProvince,
      city,
    } = req.body;

    if (!email || !email.includes("@")) return res.status(400).json({ message: "Valid email is required" });
    if (!firstName || !lastName) return res.status(400).json({ message: "Firstname and lastname are required" });
    if (!password || password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });
    if (!country || !stateProvince || !city) return res.status(400).json({ message: "Country, state/province, and city are required" });

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(409).json({ message: "Email already registered" });

    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 12);
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await User.create({
      email: normalizedEmail,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      userType: userType === "Handyman" ? "Handyman" : "Normal",
      passwordHash,
      country: country.trim(),
      stateProvince: stateProvince.trim(),
      city: city.trim(),
    });

    const token = signToken(user);

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ✅ LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid email or password" });

    const token = signToken(user);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ✅ PROFILE (current user)
router.get("/me", requireAuth, async (req, res) => {
  console.log("PROFILE /me called by user:", req.user);
  try {
    const user = await User.findById(req.user.userId);
    console.log("PROFILE /me found user:", user);
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ user: user.toJSON() });
  } catch (err) {
    console.error("ME ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;