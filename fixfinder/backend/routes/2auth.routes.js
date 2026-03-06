const express = require("express");
const auth = require("../controllers/authController");

const router = express.Router();

router.post("/login", auth.login); // your existing login
router.post("/forgot-password", auth.forgotPassword);
router.post("/reset-password", auth.resetPassword);

module.exports = router;