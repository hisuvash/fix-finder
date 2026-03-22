const mongoose = require("mongoose");

/**
 * Dual-sided reviews (Airbnb-style):
 * - Normal user → reviews a Handyman (after working together)
 * - Handyman → reviews a Normal client (after working together)
 * One review per (reviewerId, revieweeId) pair.
 */
const reviewSchema = new mongoose.Schema(
  {
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    revieweeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
  },
  { timestamps: true }
);

reviewSchema.index({ reviewerId: 1, revieweeId: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
