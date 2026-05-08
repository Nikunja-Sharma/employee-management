const mongoose = require("mongoose");

const adminSettingsSchema = new mongoose.Schema(
  {
    settingKey: {
      type: String,
      required: true,
      unique: true,
      enum: ["geofence_config", "attendance_times"]
    },

    // Geofence settings
    officeLat: {
      type: Number,
      default: 26.133402482129057
    },

    officeLng: {
      type: Number,
      default: 91.62278628045627
    },

    allowedRadius: {
      type: Number,
      default: 100 // in meters
    },

    // Attendance time settings (in minutes from midnight)
    checkinStart: {
      type: Number,
      default: 525 // 8:45 AM (8*60 + 45)
    },

    checkinEnd: {
      type: Number,
      default: 570 // 9:30 AM (9*60 + 30)
    },

    checkoutStart: {
      type: Number,
      default: 1005 // 4:45 PM (16*60 + 45)
    },

    checkoutEnd: {
      type: Number,
      default: 1050 // 5:30 PM (17*60 + 30)
    },

    lateThreshold: {
      type: Number,
      default: 556 // 9:16 AM (9*60 + 16)
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminSettings", adminSettingsSchema);
