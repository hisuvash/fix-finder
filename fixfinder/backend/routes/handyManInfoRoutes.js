const express = require("express");
const auth = require("../middleware/auth");
const User = require("../models/User");
const HandyManInfo = require("../models/HandyManInfo");

const router = express.Router();

async function requireHandyman(req, res, next) {
  const user = await User.findById(req.user.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.userType !== "Handyman") {
    return res.status(403).json({ message: "Only Handyman users can access this feature." });
  }
  req.dbUser = user;
  next();
}

// GET /api/handyman-info (fetch existing info if any)
router.get("/", auth, requireHandyman, async (req, res) => {
  console.log("GET /api/handyman-info called for ", req.dbUser.email);
  try {
    const info = await HandyManInfo.findOne({ email: req.dbUser.email });
    return res.json({ info: info || null });
  } catch (err) {
    console.error("GET handyman-info error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /api/handyman-info (create)
router.post("/", auth, requireHandyman, async (req, res) => {
    console.log("POST /api/handyman-info called with body:", req.dbUser.email);
  try {
    const email = req.dbUser.email;
    const exists = await HandyManInfo.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "Handyman info already exists. Use edit instead." });
    }

    const {
      name,
      phone,
      skill,
      ratePerHour,
      distanceKm,
      experienceYears,
      license,
      certifications,
    } = req.body;

    if (!name || !phone || !skill) {
      return res.status(400).json({ message: "name, phone, and skill are required." });
    }

    const doc = await HandyManInfo.create({
      email,
      name: String(name).trim(),
      phone: String(phone).trim(),
      skill: String(skill).trim(),
      ratePerHour: Number(ratePerHour),
      distanceKm: Number(distanceKm),
      experienceYears: Number(experienceYears),
      license: license ? String(license).trim() : "",
      certifications: certifications ? String(certifications).trim() : "",
    });

    return res.status(201).json({ message: "Saved", info: doc });
  } catch (err) {
    console.error("POST handyman-info error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/handyman-info (update)
// Email + phone cannot be changed as per your requirement
router.put("/", auth, requireHandyman, async (req, res) => {
  try {
    const email = req.dbUser.email;

    const existing = await HandyManInfo.findOne({ email });
    if (!existing) {
      return res.status(404).json({ message: "No handyman info found to update." });
    }

    // ignore email + phone updates even if sent
    const {
      name,
      skill,
      ratePerHour,
      distanceKm,
      experienceYears,
      license,
      certifications,
    } = req.body;

    if (!name || !skill) {
      return res.status(400).json({ message: "name and skill are required." });
    }

    existing.name = String(name).trim();
    existing.skill = String(skill).trim();
    existing.ratePerHour = Number(ratePerHour);
    existing.distanceKm = Number(distanceKm);
    existing.experienceYears = Number(experienceYears);
    existing.license = license ? String(license).trim() : "";
    existing.certifications = certifications ? String(certifications).trim() : "";

    await existing.save();

    return res.json({ message: "Updated", info: existing });
  } catch (err) {
    console.error("PUT handyman-info error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});
// router.get("/me-with-handyman", requireAuth, async (req, res) => {
//     console.log("I came to check skills table for ", req.user.email);
//   try {
//     const user = await User.findById(req.user.userId);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     let handyManInfoExists = false;
//     if (user.userType === "Handyman") {
//       const hm = await HandyManInfo.findOne({ email: user.email });
//       handyManInfoExists = !!hm;
//     }

//     return res.status(200).json({
//       user: safeUser(user),
//       handyManInfoExists,
//     });
//   } catch (err) {
//     console.error("ME WITH HANDYMAN ERROR:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// });

// GET /api/handyman-info/all (list all handymen, excluding phone and email)
router.get("/all", auth, async (req, res) => {
  try {
    const handymen = await HandyManInfo.find({}, '-phone -email');
    return res.json({ handymen });
  } catch (err) {
    console.error("GET handyman-info/all error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;