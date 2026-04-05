const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const auth = require("../controller/authController");
const { normalizeSkills } = require("../constants/handymanSkills");
const { validatePhoneInput } = require("../utils/phone");
const router = express.Router();
const uploadsDir = path.join(__dirname, "..", "uploads", "profile-images");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = ext || ".jpg";
    cb(null, `user-${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    return cb(new Error("Only JPG, PNG, or WEBP images are allowed."));
  },
});

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
    skills: user.skills || [],
    phone: user.phone || "",
    profileImageUrl: user.profileImageUrl || "",
    createdAt: user.createdAt,
  };
}

// ✅ REGISTER
router.post("/register", async (req, res) => {
  try {
    const { email, firstName, lastName, userType, password, country, stateProvince, city, skills, phone } =
      req.body;

    if (!email || !email.includes("@")) return res.status(400).json({ message: "Valid email is required" });
    if (!firstName || !lastName) return res.status(400).json({ message: "Firstname and lastname are required" });
    if (!password || password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });
    if (!country || !stateProvince || !city) return res.status(400).json({ message: "Country, state/province, and city are required" });
    const phoneCheck = validatePhoneInput(phone);
    if (!phoneCheck.ok) return res.status(400).json({ message: phoneCheck.message });

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(409).json({ message: "Email already registered" });

    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 12);
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const nextType = userType === "Handyman" ? "Handyman" : "Normal";
    let skillsArr = [];
    if (nextType === "Handyman") {
      if (Array.isArray(skills)) {
        skillsArr = normalizeSkills(skills);
      } else if (typeof skills === "string" && skills.trim()) {
        skillsArr = normalizeSkills(skills.split(","));
      }
      if (skillsArr.length === 0) {
        return res.status(400).json({ message: "Handymen must select at least one skill from the list." });
      }
    }

    const user = await User.create({
      email: normalizedEmail,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      userType: nextType,
      passwordHash,
      phone: phoneCheck.value,
      country: country.trim(),
      stateProvince: stateProvince.trim(),
      city: city.trim(),
      skills: nextType === "Handyman" ? skillsArr : [],
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
    const user = await User.findById(String(req.user.userId));
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
    const { firstName, lastName, userType, country, stateProvince, city, skills, phone } = req.body;

    // Basic validation (you can adjust)
    if (!firstName || !lastName) {
      return res.status(400).json({ message: "Firstname and lastname are required" });
    }
    if (!country || !stateProvince || !city) {
      return res.status(400).json({ message: "Country, state/province, and city are required" });
    }
    const phoneCheck = validatePhoneInput(phone);
    if (!phoneCheck.ok) return res.status(400).json({ message: phoneCheck.message });

    const nextType = userType === "Handyman" ? "Handyman" : "Normal";
    const skillsProvided = skills !== undefined && skills !== null;
    let skillsArr = [];
    if (skillsProvided) {
      if (Array.isArray(skills)) {
        skillsArr = normalizeSkills(skills);
      } else if (typeof skills === "string" && skills.trim()) {
        skillsArr = normalizeSkills(skills.split(","));
      }
    }

    const update = {
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      userType: nextType,
      phone: phoneCheck.value,
      country: String(country).trim(),
      stateProvince: String(stateProvince).trim(),
      city: String(city).trim(),
    };
    if (nextType === "Handyman") {
      if (skillsProvided) {
        if (skillsArr.length === 0) {
          return res.status(400).json({ message: "Handymen must keep at least one skill from the list." });
        }
        update.skills = skillsArr;
      }
    } else {
      update.skills = [];
    }

    // ✅ important: do NOT allow email update
    // (ignore req.body.email even if frontend sends it)

    const user = await User.findByIdAndUpdate(String(req.user.userId), update, {
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

router.post("/me/profile-image", requireAuth, (req, res) => {
  upload.single("profileImage")(req, res, async (err) => {
    try {
      if (err) {
        return res.status(400).json({ message: err.message || "Image upload failed." });
      }
      if (!req.file) {
        return res.status(400).json({ message: "Profile image file is required." });
      }

      const relativePath = `/uploads/profile-images/${req.file.filename}`;

      const user = await User.findById(String(req.user.userId));
      if (!user) return res.status(404).json({ message: "User not found" });
      user.profileImageUrl = relativePath;
      await user.save();

      return res.status(200).json({
        message: "Profile image updated successfully",
        user: safeUser(user),
      });
    } catch (uploadErr) {
      console.error("UPLOAD PROFILE IMAGE ERROR:", uploadErr);
      return res.status(500).json({ message: "Server error" });
    }
  });
});

router.post("/forgot-password", auth.forgotPassword);
router.post("/reset-password", auth.resetPassword);

module.exports = router;