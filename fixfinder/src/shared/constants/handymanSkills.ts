/**
 * Canonical list for signup multiselect + search.
 * Keep in sync with `backend/constants/handymanSkills.js` for server-side filtering.
 */
export const HANDYMAN_SKILL_OPTIONS = [
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
] as const;

export type HandymanSkill = (typeof HANDYMAN_SKILL_OPTIONS)[number];
