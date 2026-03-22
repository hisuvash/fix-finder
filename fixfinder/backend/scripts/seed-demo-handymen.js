/**
 * Seed demo Handyman users with varied skills + locations for search demos.
 * Password for all: DemoHandy1!  (change after first login in production)
 *
 * Run from backend folder:
 *   node scripts/seed-demo-handymen.js
 *
 * Requires MONGO_URI in .env. Skips emails that already exist.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const { ALLOWED_SKILLS } = require("../constants/handymanSkills");

const DEMO_PASSWORD = "DemoHandy1!";

const DEMO_HANDYMEN = [
  {
    email: "demo-handyman-toronto-plumber@test.local",
    firstName: "Alex",
    lastName: "Chen",
    phone: "+1 416-555-0101",
    country: "Canada",
    stateProvince: "Ontario",
    city: "Toronto",
    skills: ["Plumbing", "General repairs"],
  },
  {
    email: "demo-handyman-vancouver-electric@test.local",
    firstName: "Jordan",
    lastName: "Singh",
    phone: "+1 604-555-0102",
    country: "Canada",
    stateProvince: "British Columbia",
    city: "Vancouver",
    skills: ["Electrical", "Smart home / low-voltage", "Appliance repair"],
  },
  {
    email: "demo-handyman-calgary-build@test.local",
    firstName: "Sam",
    lastName: "Okafor",
    phone: "+1 403-555-0103",
    country: "Canada",
    stateProvince: "Alberta",
    city: "Calgary",
    skills: ["Carpentry", "Drywall & painting", "Flooring", "Windows & doors"],
  },
  {
    email: "demo-handyman-nyc-hvac@test.local",
    firstName: "Maria",
    lastName: "Garcia",
    phone: "+1 212-555-0104",
    country: "USA",
    stateProvince: "New York",
    city: "New York",
    skills: ["HVAC", "Appliance repair", "General repairs"],
  },
  {
    email: "demo-handyman-texas-outdoor@test.local",
    firstName: "Chris",
    lastName: "Williams",
    phone: "+1 512-555-0105",
    country: "USA",
    stateProvince: "Texas",
    city: "Austin",
    skills: ["Landscaping", "Deck & fence", "Roofing", "General repairs"],
  },
  {
    email: "demo-handyman-kathmandu-mixed@test.local",
    firstName: "Ravi",
    lastName: "Thapa",
    phone: "+977 1-555-0106",
    country: "Nepal",
    stateProvince: "Bagmati",
    city: "Kathmandu",
    skills: ["Tiling", "Plumbing", "Electrical", "General repairs"],
  },
];

function validSkills(arr) {
  const allowed = new Set(ALLOWED_SKILLS);
  return arr.filter((s) => allowed.has(s));
}

async function seed() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI missing in .env");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 12);
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, saltRounds);

  let created = 0;
  let skipped = 0;

  for (const row of DEMO_HANDYMEN) {
    const exists = await User.findOne({ email: row.email.toLowerCase() });
    if (exists) {
      console.log("Skip (exists):", row.email);
      skipped += 1;
      continue;
    }

    const skills = validSkills(row.skills);
    await User.create({
      email: row.email.toLowerCase(),
      firstName: row.firstName,
      lastName: row.lastName,
      userType: "Handyman",
      passwordHash,
      phone: row.phone,
      country: row.country,
      stateProvince: row.stateProvince,
      city: row.city,
      skills,
    });
    console.log("Created:", row.email, "|", row.city, "|", skills.join(", "));
    created += 1;
  }

  console.log("\nDone. Created:", created, "Skipped:", skipped);
  console.log("Login password for new accounts:", DEMO_PASSWORD);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
