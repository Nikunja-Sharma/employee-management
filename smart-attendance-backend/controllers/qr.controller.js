const QR = require("../models/QR");
const moment = require("moment-timezone");

// =======================
// GET CURRENT QR
// =======================
exports.getCurrentQR = async (req, res) => {
  try {

    const now = moment().tz("Asia/Kolkata");
    const day = now.isoWeekday();

    // ✅ FIX: Allow QR in TEST MODE even on weekends
    if (process.env.TEST_MODE !== "true" && day > 5) {
      return res.json({ active: false });
    }

    // ✅ Get time settings from AdminSettings
    const AdminSettings = require("../models/AdminSettings");
    const settings = await AdminSettings.findOne({ settingKey: "attendance_times" });

    if (!settings) {
      return res.json({ active: false });
    }

    let currentMinutes = now.hours() * 60 + now.minutes();

    // Override time for TEST MODE if TEST_TIME is provided
    if (process.env.TEST_MODE === "true" && process.env.TEST_TIME) {
      const [hour, minute] = process.env.TEST_TIME.split(":").map(Number);
      currentMinutes = hour * 60 + minute;
    }

    let mode = null;

    if (currentMinutes >= settings.checkinStart && currentMinutes <= settings.checkinEnd) {
      mode = "checkin";
    } else if (currentMinutes >= settings.checkoutStart && currentMinutes <= settings.checkoutEnd) {
      mode = "checkout";
    }

    if (!mode) {
      return res.json({ active: false });
    }

    return res.json({
      active: true,
      qr: {
        type: "attendance",
        mode: mode,
        date: now.format("YYYY-MM-DD")
      }
    });

  } catch (err) {
    console.error("QR FETCH ERROR:", err.message);
    return res.status(500).json({ message: "Error fetching QR" });
  }
};


// =======================
// SET QR
// =======================
exports.setQR = async (qrData) => {
  try {

    await QR.findOneAndUpdate(
      {},
      {
        ...qrData,
        active: true
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    );

    console.log("✅ QR stored in DB");

  } catch (err) {
    console.error("QR SET ERROR:", err.message);
  }
};


// =======================
// CLEAR QR
// =======================
exports.clearQR = async () => {
  try {

    await QR.findOneAndUpdate({}, { active: false });

    console.log("⛔ QR deactivated");

  } catch (err) {
    console.error("QR CLEAR ERROR:", err.message);
  }
};