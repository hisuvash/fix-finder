/**
 * Validate phone for signup / profile update.
 * Requires 10–15 digits (allows spaces, dashes, +, parens in input).
 */
function validatePhoneInput(phone) {
  const trimmed = String(phone || "").trim();
  if (!trimmed) {
    return { ok: false, message: "Phone number is required." };
  }
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) {
    return { ok: false, message: "Enter a valid phone number (10–15 digits)." };
  }
  return { ok: true, value: trimmed };
}

module.exports = { validatePhoneInput };
