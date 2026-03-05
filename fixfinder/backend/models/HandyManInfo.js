const mongoose = require("mongoose");

const handyManInfoSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },

    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },

    skill: { type: String, required: true, trim: true }, // e.g., Plumbing, Electrical
    ratePerHour: { type: Number, required: true, min: 0 },
    distanceKm: { type: Number, required: true, min: 0 }, // distance willing to work

    experienceYears: { type: Number, required: true, min: 0 },
    license: { type: String, default: "", trim: true },
    certifications: { type: String, default: "", trim: true }, // can be comma-separated
  },
  { timestamps: true }
);

module.exports = mongoose.model("HandyManInfo", handyManInfoSchema);