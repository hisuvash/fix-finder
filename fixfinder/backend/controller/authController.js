const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { sendEmail } = require("../utils/email");
const jwt = require("jsonwebtoken");
// const User = require("../models/User");


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    // 1) find user by email
    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // 2) verify password
    const ok = await user.comparePassword(password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // 3) create token (optional but recommended)
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 4) return user data (don’t return passwordHash)
    return res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  console.log("FORGOT PASSWORD REQUEST:", req.body);
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    if (!email) return res.status(400).json({ message: "Email is required." });

    const user = await User.findOne({ email });

    // ✅ Always return generic success (prevents people from checking which emails exist)
    if (!user) {
      return res.json({ message: "If that email exists, a reset link has been sent." });
    }

    // generate raw token to email, store only HASH in DB
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordTokenHash = tokenHash;
    user.resetPasswordExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await user.save();

    const resetUrl = `${process.env.FRONTEND_BASE_URL}/reset-password?token=${rawToken}`;

    await sendEmail({
      to: user.email,
      subject: "Reset your FixFinder password",
      text: `Reset your password using this link (expires in 30 minutes): ${resetUrl}`,
      html: `
        <p>You requested a password reset for FixFinder.</p>
        <p>This link expires in <b>30 minutes</b>.</p>
        <p><a href="${resetUrl}">Reset Password</a></p>
        <p>If you didn’t request this, ignore this email.</p>
      `,
    });

    return res.json({ message: "If that email exists, a reset link has been sent." });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const token = String(req.body.token || "").trim();
    const newPassword = String(req.body.newPassword || "");
    const confirmPassword = String(req.body.confirmPassword || "");

    if (!token) return res.status(400).json({ message: "Token is required." });
    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ message: "New password and confirm password are required." });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset link." });
    }

    // ✅ update passwordHash (your system uses passwordHash)
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);

    // clear reset fields
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    // ✅ confirmation email
    await sendEmail({
      to: user.email,
      subject: "Your FixFinder password was changed",
      text: "Your FixFinder password was changed successfully. If this wasn’t you, contact support.",
      html: `
        <p>Your FixFinder password was changed successfully.</p>
        <p>If this wasn’t you, please contact support immediately.</p>
      `,
    });

    return res.json({ message: "Password reset successful." });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};