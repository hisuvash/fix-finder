/** Allowed skill labels (match frontend `src/shared/constants/handymanSkills.ts`) */
const ALLOWED_SKILLS = [
  "Plumbing",
  "Electrical",
  "Carpentry",
  "Drywall & painting",
  "HVAC",
  "Flooring",
  "Roofing",
  "Landscaping",
  "General repairs",
  "Appliance repair",
  "Tiling",
  "Windows & doors",
  "Deck & fence",
  "Smart home / low-voltage",
];

function normalizeSkills(input) {
  if (!Array.isArray(input)) return [];
  const allowed = new Set(ALLOWED_SKILLS);
  return input
    .map((s) => String(s || "").trim())
    .filter((s) => allowed.has(s))
    .slice(0, 30);
}

module.exports = { ALLOWED_SKILLS, normalizeSkills };
