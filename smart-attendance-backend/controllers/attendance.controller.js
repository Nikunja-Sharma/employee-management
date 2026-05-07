const Attendance = require("../models/Attendance");
const User = require("../models/User");
const AdminSettings = require("../models/AdminSettings");
const moment = require("moment-timezone");

const fs = require("fs");
const path = require("path");

// =======================
// Haversine Distance Function
// =======================
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth radius in meters
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// =======================
// SCAN QR + PHOTO CAPTURE
// =======================
exports.scanQR = async (req, res) => {
  try {

    let { latitude, longitude, qr, photo } = req.body;

    latitude = parseFloat(latitude);
    longitude = parseFloat(longitude);

    if (!latitude || !longitude || !qr) {
      return res.status(400).json({ message: "Missing required data" });
    }

    let qrData;
    try {
      qrData = JSON.parse(qr);
    } catch {
      return res.status(400).json({ message: "Invalid QR format" });
    }

    if (qrData.type !== "attendance") {
      return res.status(400).json({ message: "Invalid QR" });
    }

    const mode = qrData.mode;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ FETCH GEOFENCE SETTINGS FROM DATABASE
    let geofenceConfig = await AdminSettings.findOne({ settingKey: "geofence_config" });
    
    // If no config exists, create default from environment variables
    if (!geofenceConfig) {
      geofenceConfig = await AdminSettings.create({
        settingKey: "geofence_config",
        officeLat: parseFloat(process.env.OFFICE_LAT) || 26.133402482129057,
        officeLng: parseFloat(process.env.OFFICE_LNG) || 91.62278628045627,
        allowedRadius: parseInt(process.env.DEFAULT_RADIUS) || 100
      });
    }

    // ✅ CALCULATE DISTANCE USING HAVERSINE FORMULA
    const distance = haversine(
      latitude,
      longitude,
      geofenceConfig.officeLat,
      geofenceConfig.officeLng
    );

    // ✅ GEOFENCE VALIDATION
    if (distance > geofenceConfig.allowedRadius) {
      return res.status(403).json({
        success: false,
        reason: "OUTSIDE_ZONE",
        message: `You are ${Math.round(distance)}m away from the office (limit: ${geofenceConfig.allowedRadius}m)`,
        distance: Math.round(distance),
        allowedRadius: geofenceConfig.allowedRadius
      });
    }

    let now = moment().tz("Asia/Kolkata");

    if (process.env.TEST_TIME) {
      const [hour, minute] = process.env.TEST_TIME.split(":").map(Number);
      now = now.clone().set({ hour, minute });
    }

    const todayStr = now.format("YYYY-MM-DD");
    const minutesNow = now.hours() * 60 + now.minutes();

    if (process.env.TEST_MODE !== "true" && now.isoWeekday() > 5) {
      return res.status(400).json({
        message: "Weekends not allowed",
      });
    }

    const CHECKIN_START = 8 * 60 + 45;
    const CHECKIN_END = 9 * 60 + 30;

    const CHECKOUT_START = 16 * 60 + 45;
    const CHECKOUT_END = 17 * 60 + 30;

    let attendance = await Attendance.findOne({
      employee: user.id,
      dateString: todayStr
    });

    // ✅ CHECK IF USER IS ON APPROVED LEAVE
    const Leave = require("../models/Leave");
    const approvedLeave = await Leave.findOne({
      employee: user.id,
      status: "approved",
      startDate: { $lte: now.toDate() },
      endDate: { $gte: now.toDate() }
    });

    if (approvedLeave) {
      // User is on approved leave
      if (attendance && attendance.isLeave) {
        // Leave attendance exists - allow override with warning
        console.log(`User ${user.employeeId} scanning QR while on approved leave`);
        // Continue with normal flow but mark that leave is being overridden
      } else {
        return res.status(400).json({
          message: "You are on approved leave today. Contact admin if you need to work.",
          leaveType: approvedLeave.leaveType,
          leaveDates: `${approvedLeave.startDate.toISOString().split('T')[0]} to ${approvedLeave.endDate.toISOString().split('T')[0]}`
        });
      }
    }

    // ================= PHOTO SAVE =================
    let photoPath = null;

    if (photo) {
      try {
        const base64Data = photo.replace(/^data:image\/jpeg;base64,/, "");

        const fileName = `${Date.now()}_${user.employeeId}.jpg`;

        const uploadDir = path.join(__dirname, "../uploads");

        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir);
        }

        const filePath = path.join(uploadDir, fileName);

        fs.writeFileSync(filePath, base64Data, "base64");

        photoPath = `/uploads/${fileName}`;

      } catch (err) {
        console.error("Photo save error:", err);
      }
    }

    // ================= CHECK-IN =================
    if (mode === "checkin") {

      if (minutesNow < CHECKIN_START || minutesNow > CHECKIN_END) {
        return res.status(400).json({ message: "Check-in QR not active" });
      }

      if (attendance && attendance.checkIn) {
        return res.status(400).json({ message: "Already checked in" });
      }

      let status = "present";
      if (minutesNow >= (9 * 60 + 16)) {
        status = "late";
      }

      if (!attendance) {
        attendance = await Attendance.create({
          employee: user.id,
          employeeId: user.employeeId,
          date: now.toDate(),
          dateString: todayStr,
          checkIn: now.format("HH:mm"),
          status,
          photo: photoPath,
          isLeave: false,
          leaveId: null,
          // ✅ GEOLOCATION DATA
          scanLat: latitude,
          scanLng: longitude,
          distanceM: Math.round(distance),
          geoStatus: "APPROVED",
          denialReason: null
        });
      } else {
        // Override leave attendance if exists
        if (attendance.isLeave) {
          attendance.reason = `Leave overridden - worked on ${attendance.reason}`;
        }
        attendance.checkIn = now.format("HH:mm");
        attendance.status = status;
        attendance.isLeave = false;
        attendance.leaveId = null;
        if (photoPath) attendance.photo = photoPath;
        // ✅ GEOLOCATION DATA
        attendance.scanLat = latitude;
        attendance.scanLng = longitude;
        attendance.distanceM = Math.round(distance);
        attendance.geoStatus = "APPROVED";
        attendance.denialReason = null;
        await attendance.save();
      }

      return res.json({
        success: true,
        type: "checkin",
        message: "Check-in successful",
        distance: Math.round(distance),
        time: now.format("HH:mm"),
        status,
      });
    }

    // ================= CHECK-OUT =================
    if (mode === "checkout") {

      if (minutesNow < CHECKOUT_START || minutesNow > CHECKOUT_END) {
        return res.status(400).json({ message: "Check-out QR not active" });
      }

      if (!attendance || !attendance.checkIn) {
        return res.status(400).json({
          message: "Check-in required first",
        });
      }

      if (attendance.checkOut) {
        return res.status(400).json({
          message: "Already checked out",
        });
      }

      attendance.checkOut = now.format("HH:mm");

      if (photoPath) {
        attendance.photo = photoPath;
      }

      await attendance.save();

      return res.json({
        type: "checkout",
        message: "Check-out successful",
        time: now.format("HH:mm"),
        status: attendance.status,
      });
    }

  } catch (err) {
    console.error("ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// =======================
// GET HISTORY
// =======================
exports.getHistory = async (req, res) => {
  try {
    const records = await Attendance.find({ employee: req.user.id })
      .sort({ date: -1 });

    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch history" });
  }
};

// =======================
// GET TODAY
// =======================
exports.getTodayAttendance = async (req, res) => {
  try {
    const now = moment().tz("Asia/Kolkata");
    const todayStr = now.format("YYYY-MM-DD");

    const record = await Attendance.findOne({
      employee: req.user.id,
      dateString: todayStr
    });

    res.json(record || {});
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch today attendance" });
  }
};

// =======================
// ADMIN UPDATE CHECKOUT (UPDATED WITH REASON)
// =======================
exports.updateCheckout = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkOut, reason } = req.body;

    if (!checkOut) {
      return res.status(400).json({ message: "Check-out required" });
    }

    const record = await Attendance.findById(id);

    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    // 🔒 Strict validation
    if (!record.checkIn || record.checkOut || record.status === "absent") {
      return res.status(400).json({ message: "Not allowed to edit" });
    }

    record.checkOut = checkOut;
    record.reason = reason || null;

    await record.save();

    res.json({ message: "Checkout updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};