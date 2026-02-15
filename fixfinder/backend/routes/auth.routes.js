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

function requireAuth(req, res, next) {
    console.log("AUTH MIDDLEWARE called. Authorization header:");
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Missing token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

function safeUser(user) {
  return {
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    userType: user.userType,
    country: user.country,
    stateProvince: user.stateProvince,
    city: user.city,
    createdAt: user.createdAt,
  };
}

// ✅ REGISTER
router.post("/register", async (req, res) => {
  try {
    const { email, firstName, lastName, userType, password, country, stateProvince, city } = req.body;

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
      user: safeUser(user),
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ✅ LOGIN (THIS is already your login endpoint)
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
      user: safeUser(user),
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ✅ PROFILE (current user)
router.get("/me", requireAuth, async (req, res) => {
    console.log("PROFILE /me called by user:");
  try {
    console.log("PROFILE /me called by user:", req.user);
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ user: safeUser(user) });
  } catch (err) {
    console.error("ME ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});
// ✅ UPDATE PROFILE (current user) - email NOT editable
router.put("/me", requireAuth, async (req, res) => {
  try {
    const { firstName, lastName, userType, country, stateProvince, city } = req.body;

    // Basic validation (you can adjust)
    if (!firstName || !lastName) {
      return res.status(400).json({ message: "Firstname and lastname are required" });
    }
    if (!country || !stateProvince || !city) {
      return res.status(400).json({ message: "Country, state/province, and city are required" });
    }

    const update = {
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      userType: userType === "Handyman" ? "Handyman" : "Normal",
      country: String(country).trim(),
      stateProvince: String(stateProvince).trim(),
      city: String(city).trim(),
    };

    // ✅ important: do NOT allow email update
    // (ignore req.body.email even if frontend sends it)

    const user = await User.findByIdAndUpdate(req.user.userId, update, {
      new: true,
      runValidators: true,
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      message: "Profile updated successfully",
      user: user.toJSON(),
    });
  } catch (err) {
    console.error("UPDATE ME ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;