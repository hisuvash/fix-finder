/**
 * Seed script: add past handymen to a Normal user (for testing the profile "Past Handymen" section).
 * Run from backend folder: node scripts/seed-past-handymen.js
 *
 * Prerequisites (create these accounts first via the app's Register page):
 * - At least one user with userType "Normal" (the user who will get the "past handymen" list)
 * - One or more users with userType "Handyman" (each will appear as one tile)
 * This script does NOT create users — it only links existing Handyman accounts to a Normal user.
 * To get 3 tiles, register 3 different Handyman accounts, then run this script again.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

async function seed() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI missing in .env");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const handymen = await User.find({ userType: "Handyman" })
    .select("_id firstName lastName")
    .limit(3)
    .lean();
  if (handymen.length === 0) {
    console.log("No Handyman users found. Register at least one user with userType 'Handyman' via the app first.");
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log("Found", handymen.length, "Handyman user(s) in the database. (Register more with userType 'Handyman' to get up to 3.)");
  const handymanIds = handymen.map((h) => h._id);
  console.log("Adding:", handymen.map((h) => `${h.firstName} ${h.lastName}`).join(", "));

  const normalUserQuery = process.env.SEED_USER_EMAIL
    ? { email: process.env.SEED_USER_EMAIL.trim().toLowerCase(), userType: "Normal" }
    : { userType: "Normal" };
  const normalUser = await User.findOne(normalUserQuery);
  if (!normalUser) {
    console.log("No Normal user found. Register at least one user with userType 'Normal' first.");
    await mongoose.disconnect();
    process.exit(1);
  }

  await User.findByIdAndUpdate(normalUser._id, {
    $addToSet: { workedWithHandymen: { $each: handymanIds } },
  });
  console.log("Updated user", normalUser.email, "with", handymanIds.length, "past handymen.");

  await mongoose.disconnect();
  console.log("Done.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
