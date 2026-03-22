const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const Review = require("../models/Review");
const ConnectionRequest = require("../models/ConnectionRequest");

async function hasAcceptedConnection(clientId, handymanId) {
  const r = await ConnectionRequest.findOne({
    fromUserId: clientId,
    toUserId: handymanId,
    status: "accepted",
  })
    .select("_id")
    .lean();
  return !!r;
}

const router = express.Router();

function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Missing token" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

async function getReviewStatsForUser(userId) {
  const agg = await Review.aggregate([
    { $match: { revieweeId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);
  if (!agg.length) return { avgRating: null, count: 0 };
  return {
    avgRating: Math.round(agg[0].avgRating * 10) / 10,
    count: agg[0].count,
  };
}

/**
 * GET /api/reviews/for/:userId
 * Reviews written ABOUT this user (they are the reviewee).
 */
router.get("/for/:userId", requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const reviews = await Review.find({ revieweeId: userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("reviewerId", "firstName lastName profileImageUrl userType")
      .lean();

    const list = reviews.map((r) => {
      const rev = r.reviewerId;
      const name = rev
        ? [rev.firstName, rev.lastName].filter(Boolean).join(" ") || "User"
        : "User";
      return {
        id: r._id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        reviewer: {
          id: rev?._id,
          fullName: name,
          profileImageUrl: rev?.profileImageUrl || null,
          userType: rev?.userType,
        },
      };
    });

    const stats = await getReviewStatsForUser(userId);
    return res.status(200).json({ reviews: list, ...stats });
  } catch (err) {
    console.error("REVIEWS FOR USER ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/reviews/eligibility/:userId
 * Can the current user leave a review for userId?
 */
router.get("/eligibility/:userId", requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const meId = String(req.user.userId);
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }
    if (String(userId) === meId) {
      return res.status(200).json({ canReview: false, reason: "You cannot review yourself." });
    }

    const [me, them] = await Promise.all([
      User.findById(meId).select("userType workedWithHandymen workedWithClients"),
      User.findById(userId).select("userType"),
    ]);
    if (!me || !them) {
      return res.status(404).json({ message: "User not found" });
    }

    const existing = await Review.findOne({ reviewerId: meId, revieweeId: userId });
    if (existing) {
      return res.status(200).json({ canReview: false, reason: "You already reviewed this person." });
    }

    if (me.userType === "Normal" && them.userType === "Handyman") {
      const ok = await hasAcceptedConnection(meId, userId);
      if (!ok) {
        return res.status(200).json({
          canReview: false,
          reason: "You can only review handymen who accepted your connection request.",
        });
      }
      return res.status(200).json({ canReview: true, reason: null });
    }

    if (me.userType === "Handyman" && them.userType === "Normal") {
      const ok = await hasAcceptedConnection(userId, meId);
      if (!ok) {
        return res.status(200).json({
          canReview: false,
          reason: "You can only review clients whose connection request you accepted.",
        });
      }
      return res.status(200).json({ canReview: true, reason: null });
    }

    return res.status(200).json({
      canReview: false,
      reason: "Reviews are only between clients and handymen.",
    });
  } catch (err) {
    console.error("REVIEW ELIGIBILITY ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/reviews
 * Body: { revieweeId, rating (1-5), comment (optional string) }
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const meId = String(req.user.userId);
    const { revieweeId, rating, comment } = req.body;

    if (!revieweeId || typeof revieweeId !== "string") {
      return res.status(400).json({ message: "revieweeId is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(revieweeId)) {
      return res.status(400).json({ message: "Invalid revieweeId" });
    }
    if (revieweeId === meId) {
      return res.status(400).json({ message: "You cannot review yourself" });
    }

    const r = Number(rating);
    if (!Number.isInteger(r) || r < 1 || r > 5) {
      return res.status(400).json({ message: "rating must be an integer from 1 to 5" });
    }

    const text = typeof comment === "string" ? comment.trim().slice(0, 2000) : "";

    const [me, them] = await Promise.all([
      User.findById(meId).select("userType workedWithHandymen workedWithClients"),
      User.findById(revieweeId).select("userType"),
    ]);
    if (!me || !them) return res.status(404).json({ message: "User not found" });

    if (me.userType === "Normal" && them.userType === "Handyman") {
      const ok = await hasAcceptedConnection(meId, revieweeId);
      if (!ok) {
        return res.status(403).json({
          message: "You can only review handymen who accepted your connection request.",
        });
      }
    } else if (me.userType === "Handyman" && them.userType === "Normal") {
      const ok = await hasAcceptedConnection(revieweeId, meId);
      if (!ok) {
        return res.status(403).json({
          message: "You can only review clients whose connection request you accepted.",
        });
      }
    } else {
      return res.status(400).json({ message: "Invalid reviewer/reviewee combination." });
    }

    const review = await Review.create({
      reviewerId: meId,
      revieweeId,
      rating: r,
      comment: text,
    });

    const populated = await Review.findById(review._id)
      .populate("reviewerId", "firstName lastName profileImageUrl userType")
      .lean();

    const rev = populated.reviewerId;
    const name = rev
      ? [rev.firstName, rev.lastName].filter(Boolean).join(" ") || "User"
      : "User";

    return res.status(201).json({
      message: "Review submitted",
      review: {
        id: populated._id,
        rating: populated.rating,
        comment: populated.comment,
        createdAt: populated.createdAt,
        reviewer: {
          id: rev?._id,
          fullName: name,
          profileImageUrl: rev?.profileImageUrl || null,
          userType: rev?.userType,
        },
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "You already reviewed this person." });
    }
    console.error("CREATE REVIEW ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = { router, getReviewStatsForUser };
