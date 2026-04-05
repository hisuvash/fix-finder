const mongoose = require("mongoose");

/**
 * Normal user requests to connect with a Handyman.
 * On accept: both users get workedWithHandymen / workedWithClients updated.
 * Reviews require status === "accepted" for that pair.
 */
const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    toUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

module.exports = mongoose.model("ConnectionRequest", connectionRequestSchema);
