const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const ConnectionRequest = require("../models/ConnectionRequest");

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

function meId(req) {
  return String(req.user.userId);
}

/**
 * POST /api/connections/request
 * Normal user requests to connect with a handyman.
 */
router.post("/request", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(meId(req)).select("userType");
    if (!user || user.userType !== "Normal") {
      return res.status(403).json({ message: "Only clients can send connection requests." });
    }

    const { handymanId } = req.body;
    if (!handymanId || !mongoose.Types.ObjectId.isValid(handymanId)) {
      return res.status(400).json({ message: "Valid handymanId is required" });
    }
    if (String(handymanId) === meId(req)) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const handyman = await User.findById(handymanId).select("userType");
    if (!handyman || handyman.userType !== "Handyman") {
      return res.status(404).json({ message: "Handyman not found" });
    }

    let doc = await ConnectionRequest.findOne({
      fromUserId: meId(req),
      toUserId: handymanId,
    });

    if (doc) {
      if (doc.status === "accepted") {
        return res.status(409).json({ message: "You are already connected with this handyman." });
      }
      if (doc.status === "pending") {
        return res.status(409).json({ message: "A request is already pending." });
      }
      doc.status = "pending";
      await doc.save();
      return res.status(200).json({ message: "Request sent again.", request: formatRequest(doc) });
    }

    doc = await ConnectionRequest.create({
      fromUserId: meId(req),
      toUserId: handymanId,
      status: "pending",
    });

    return res.status(201).json({ message: "Request sent.", request: formatRequest(doc) });
  } catch (err) {
    console.error("CONNECTION REQUEST ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

function formatRequest(doc) {
  return {
    id: doc._id,
    fromUserId: doc.fromUserId,
    toUserId: doc.toUserId,
    status: doc.status,
    createdAt: doc.createdAt,
  };
}

/**
 * GET /api/connections/incoming
 * Handyman: pending requests to me.
 */
router.get("/incoming", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(meId(req)).select("userType");
    if (!user || user.userType !== "Handyman") {
      return res.status(403).json({ message: "Only handymen can view incoming requests." });
    }

    const pending = await ConnectionRequest.find({ toUserId: meId(req), status: "pending" })
      .sort({ createdAt: -1 })
      .populate("fromUserId", "firstName lastName email phone city stateProvince country profileImageUrl")
      .lean();

    const list = pending.map((r) => {
      const c = r.fromUserId;
      return {
        id: r._id,
        status: r.status,
        createdAt: r.createdAt,
        client: c
          ? {
              id: c._id,
              fullName: [c.firstName, c.lastName].filter(Boolean).join(" ") || "Client",
              email: c.email,
              phone: c.phone || "",
              city: c.city,
              stateProvince: c.stateProvince,
              country: c.country,
              profileImageUrl: c.profileImageUrl || null,
            }
          : null,
      };
    });

    return res.status(200).json({ requests: list });
  } catch (err) {
    console.error("INCOMING CONNECTIONS ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/connections/sent
 * Normal: my outgoing requests (pending / accepted / rejected).
 */
router.get("/sent", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(meId(req)).select("userType");
    if (!user || user.userType !== "Normal") {
      return res.status(403).json({ message: "Only clients can view sent requests." });
    }

    const rows = await ConnectionRequest.find({ fromUserId: meId(req) })
      .sort({ updatedAt: -1 })
      .populate("toUserId", "firstName lastName phone city stateProvince country profileImageUrl skills")
      .lean();

    const list = rows.map((r) => {
      const h = r.toUserId;
      const handyman = h
        ? {
            id: h._id,
            fullName: [h.firstName, h.lastName].filter(Boolean).join(" ") || "Handyman",
            city: h.city,
            stateProvince: h.stateProvince,
            country: h.country,
            profileImageUrl: h.profileImageUrl || null,
            skills: h.skills || [],
          }
        : null;
      if (handyman && r.status === "accepted") {
        handyman.phone = h.phone || "";
      }
      return {
        id: r._id,
        status: r.status,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        handyman,
      };
    });

    return res.status(200).json({ requests: list });
  } catch (err) {
    console.error("SENT CONNECTIONS ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/connections/:requestId/accept
 */
router.post("/:requestId/accept", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(meId(req)).select("userType");
    if (!user || user.userType !== "Handyman") {
      return res.status(403).json({ message: "Only handymen can accept requests." });
    }

    const { requestId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: "Invalid request id" });
    }

    const doc = await ConnectionRequest.findById(requestId);
    if (!doc) return res.status(404).json({ message: "Request not found" });
    if (String(doc.toUserId) !== meId(req)) {
      return res.status(403).json({ message: "Not your request to accept" });
    }
    if (doc.status !== "pending") {
      return res.status(400).json({ message: "Request is not pending." });
    }

    doc.status = "accepted";
    await doc.save();

    const clientId = String(doc.fromUserId);
    const handymanId = String(doc.toUserId);

    await User.findByIdAndUpdate(clientId, { $addToSet: { workedWithHandymen: handymanId } });
    await User.findByIdAndUpdate(handymanId, { $addToSet: { workedWithClients: clientId } });

    return res.status(200).json({ message: "Connection accepted.", request: formatRequest(doc) });
  } catch (err) {
    console.error("ACCEPT CONNECTION ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/connections/:requestId/reject
 */
router.post("/:requestId/reject", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(meId(req)).select("userType");
    if (!user || user.userType !== "Handyman") {
      return res.status(403).json({ message: "Only handymen can reject requests." });
    }

    const { requestId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: "Invalid request id" });
    }

    const doc = await ConnectionRequest.findById(requestId);
    if (!doc) return res.status(404).json({ message: "Request not found" });
    if (String(doc.toUserId) !== meId(req)) {
      return res.status(403).json({ message: "Not your request to reject" });
    }
    if (doc.status !== "pending") {
      return res.status(400).json({ message: "Request is not pending." });
    }

    doc.status = "rejected";
    await doc.save();

    return res.status(200).json({ message: "Request declined.", request: formatRequest(doc) });
  } catch (err) {
    console.error("REJECT CONNECTION ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
