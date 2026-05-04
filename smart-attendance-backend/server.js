require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const connectDB = require("./config/db");
const User = require("./models/User");

const app = express();

/* =========================
   Middleware
========================= */

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://192.168.1.2:5173",
      "http://192.168.1.8:5173",
      "http://localhost:5173",
      "http://localhost:4173",
      "http://127.0.0.1:5173",
      "https://employee-management-six-mu.vercel.app"
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`⚠️ Blocked origin: ${origin}`);
      callback(null, true); // Allow anyway for development
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  exposedHeaders: ["Set-Cookie"],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Request logger for debugging
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'}`);
  next();
});

// ✅ NEW: Serve uploaded images
app.use("/uploads", express.static("uploads"));

/* =========================
   Routes
========================= */

// Test endpoint for CORS
app.get("/api/test", (req, res) => {
  res.json({ message: "CORS is working!", timestamp: new Date() });
});

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/attendance", require("./routes/attendance.routes"));
app.use("/api/qr", require("./routes/qr.routes"));
app.use("/api/leave", require("./routes/leave.routes"));

/* =========================
   Admin Seeder Logic
========================= */

const createFirstAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: "admin" });

    if (!adminExists) {

      if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
        throw new Error("ADMIN_EMAIL or ADMIN_PASSWORD missing in .env");
      }

      const hashedPassword = await bcrypt.hash(
        process.env.ADMIN_PASSWORD,
        10
      );

      await User.create({
        name: process.env.ADMIN_NAME,
        employeeId: "ADMIN001",
        email: process.env.ADMIN_EMAIL,
        phone: "0000000000",
        department: "Administration",
        password: hashedPassword,
        role: "admin",
      });

      console.log("✅ First admin created");

    } else {
      console.log("ℹ️ Admin already exists");
    }

  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
  }
};

/* =========================
   START SERVER + CRON
========================= */

connectDB().then(async () => {

  await createFirstAdmin();

  // ✅ START CRON ONLY AFTER DB CONNECTS
  require("./jobs/attendance.job");

  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });

}).catch((err) => {
  console.error("❌ DB Connection Failed:", err.message);
});