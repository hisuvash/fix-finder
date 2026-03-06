require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const handymanRoutes = require("./routes/handyManInfoRoutes");

const app = express();
const corsOptions = {
  origin: [
    "http://localhost:5000",   // Web frontend
    "http://localhost:8081",   // Expo/React Native
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => res.send("FixFinder API running ✅"));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/handyman-info", handymanRoutes);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err.message);
    process.exit(1);
  });