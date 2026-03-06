const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
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

/**
 * GET /api/users/past-handymen
 * Returns handymen the current user has worked with (for profile "Past Handymen" section)
 */
router.get("/past-handymen", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("workedWithHandymen")
      .populate("workedWithHandymen", "firstName lastName profileImageUrl");
    if (!user) return res.status(404).json({ message: "User not found" });

    const handymen = (user.workedWithHandymen || []).map((h) => ({
      id: h._id,
      firstName: h.firstName,
      lastName: h.lastName,
      fullName: [h.firstName, h.lastName].filter(Boolean).join(" ") || "Handyman",
      profileImageUrl: h.profileImageUrl || null,
    }));

    return res.status(200).json({ handymen });
  } catch (err) {
    console.error("PAST-HANDYMEN ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/users/past-handymen
 * Add a handyman to the current user's "worked with" list.
 * Body: { handymanId: "mongodb-object-id" }
 */
router.post("/past-handymen", requireAuth, async (req, res) => {
  try {
    const { handymanId } = req.body;
    if (!handymanId || typeof handymanId !== "string") {
      return res.status(400).json({ message: "handymanId is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(handymanId)) {
      return res.status(400).json({ message: "Invalid handymanId" });
    }

    const handyman = await User.findById(handymanId).select("userType");
    if (!handyman) return res.status(404).json({ message: "User not found" });
    if (handyman.userType !== "Handyman") {
      return res.status(400).json({ message: "User is not a handyman" });
    }

    if (handymanId === req.user.userId) {
      return res.status(400).json({ message: "Cannot add yourself" });
    }

    await User.findByIdAndUpdate(req.user.userId, {
      $addToSet: { workedWithHandymen: handymanId },
    });

    return res.status(200).json({ message: "Handyman added to your list" });
  } catch (err) {
    console.error("ADD PAST-HANDYMAN ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/users/:id
 * Public profile of a user by id (for viewing handyman profile when clicking a tile)
 */
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select(
      "firstName lastName userType country stateProvince city profileImageUrl createdAt"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: [user.firstName, user.lastName].filter(Boolean).join(" ") || "User",
        userType: user.userType,
        country: user.country,
        stateProvince: user.stateProvince,
        city: user.city,
        profileImageUrl: user.profileImageUrl || null,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("USER BY ID ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;