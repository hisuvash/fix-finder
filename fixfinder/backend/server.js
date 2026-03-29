require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const { router: reviewRoutes } = require("./routes/review.routes");
const connectionRoutes = require("./routes/connection.routes");

const app = express();
const corsOptions = {
  origin: [
    "http://localhost:5001",
    "http://localhost:8081",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json());

const uploadsRoot = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsRoot)) {
  fs.mkdirSync(uploadsRoot, { recursive: true });
}
app.use("/uploads", express.static(uploadsRoot));

app.get("/", (req, res) => res.send("FixFinder API running ✅"));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/connections", connectionRoutes);

const PORT = process.env.PORT || 5001;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err.message);
    process.exit(1);
  });