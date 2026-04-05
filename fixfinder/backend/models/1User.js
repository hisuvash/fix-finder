const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },

    userType: {
      type: String,
      enum: ["Normal", "Handyman"],
      default: "Normal",
      required: true,
    },

    passwordHash: { type: String, required: true },

    country: { type: String, required: true, trim: true },
    stateProvince: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

// Hide passwordHash when converting to JSON
userSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.passwordHash;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);