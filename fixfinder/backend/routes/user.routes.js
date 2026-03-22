const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const ConnectionRequest = require("../models/ConnectionRequest");
const { getReviewStatsForUser } = require("./review.routes");

const router = express.Router();

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function authUserId(req) {
  return String(req.user.userId);
}

/**
 * Phone visibility on GET /users/:id
 * - Always for own profile
 * - Normal → Handyman: only after connection accepted
 * - Handyman → Normal: when client sent a request to this handyman (pending or accepted)
 */
async function shouldExposePhone(viewerId, viewerUserType, profileUser) {
  const profileId = String(profileUser._id);
  if (viewerId === profileId) return true;

  const profileType = profileUser.userType;

  if (viewerUserType === "Normal" && profileType === "Handyman") {
    const doc = await ConnectionRequest.findOne({
      fromUserId: viewerId,
      toUserId: profileId,
      status: "accepted",
    })
      .select("_id")
      .lean();
    return !!doc;
  }

  if (viewerUserType === "Handyman" && profileType === "Normal") {
    const doc = await ConnectionRequest.findOne({
      fromUserId: profileId,
      toUserId: viewerId,
      status: { $in: ["pending", "accepted"] },
    })
      .select("_id")
      .lean();
    return !!doc;
  }

  return false;
}

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
    const user = await User.findById(authUserId(req))
      .select("workedWithHandymen")
      .populate("workedWithHandymen", "firstName lastName profileImageUrl");
    if (!user) return res.status(404).json({ message: "User not found" });

    const handymen = (user.workedWithHandymen || []).map((h) => ({
      id: String(h._id),
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
 * GET /api/users/past-clients
 * Clients this handyman has worked with (for profile + handyman→client reviews)
 */
router.get("/past-clients", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(authUserId(req))
      .select("workedWithClients userType")
      .populate("workedWithClients", "firstName lastName profileImageUrl");
    if (!user) return res.status(404).json({ message: "User not found" });

    const clients = (user.workedWithClients || []).map((c) => ({
      id: String(c._id),
      firstName: c.firstName,
      lastName: c.lastName,
      fullName: [c.firstName, c.lastName].filter(Boolean).join(" ") || "Client",
      profileImageUrl: c.profileImageUrl || null,
    }));

    return res.status(200).json({ clients });
  } catch (err) {
    console.error("PAST-CLIENTS ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/users/search/handymen
 * Normal users search handymen by location + skill (query params).
 */
router.get("/search/handymen", requireAuth, async (req, res) => {
  try {
    const me = await User.findById(authUserId(req)).select("userType");
    if (!me || me.userType !== "Normal") {
      return res.status(403).json({ message: "Only clients can search handymen." });
    }

    const city = String(req.query.city || "").trim();
    const stateProvince = String(req.query.stateProvince || "").trim();
    const country = String(req.query.country || "").trim();
    const skill = String(req.query.skill || "").trim();

    const q = { userType: "Handyman" };
    if (city) q.city = new RegExp(escapeRegex(city), "i");
    if (stateProvince) q.stateProvince = new RegExp(escapeRegex(stateProvince), "i");
    if (country) q.country = new RegExp(escapeRegex(country), "i");
    if (skill) {
      q.skills = { $elemMatch: { $regex: escapeRegex(skill), $options: "i" } };
    }

    const handymen = await User.find(q)
      .select("firstName lastName city stateProvince country profileImageUrl skills")
      .limit(50)
      .lean();

    const myId = authUserId(req);
    const list = handymen
      .filter((h) => String(h._id) !== myId)
      .map((h) => ({
        id: String(h._id),
        fullName: [h.firstName, h.lastName].filter(Boolean).join(" ") || "Handyman",
        city: h.city,
        stateProvince: h.stateProvince,
        country: h.country,
        profileImageUrl: h.profileImageUrl || null,
        skills: h.skills || [],
      }));

    return res.status(200).json({ handymen: list });
  } catch (err) {
    console.error("SEARCH HANDYMEN ERROR:", err);
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
      "firstName lastName userType country stateProvince city profileImageUrl createdAt skills phone"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    const reviewSummary = await getReviewStatsForUser(user._id);
    const viewerId = authUserId(req);
    const viewerType = req.user.userType;
    const showPhone = await shouldExposePhone(viewerId, viewerType, user);

    const payload = {
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
      skills: user.skills || [],
      reviewSummary,
    };
    if (showPhone && user.phone) {
      payload.phone = user.phone;
    }

    return res.status(200).json({ user: payload });
  } catch (err) {
    console.error("USER BY ID ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;