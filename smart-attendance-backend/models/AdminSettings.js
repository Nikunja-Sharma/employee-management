const mongoose = require("mongoose");

const adminSettingsSchema = new mongoose.Schema(
  {
    settingKey: {
      type: String,
      required: true,
      unique: true,
      enum: ["geofence_config", "attendance_times", "leave_defaults"]
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

    // Leave allocation defaults
    leaveDefaults: {
      type: {
        casual: { type: Number, default: 12 },
        sick: { type: Number, default: 12 },
        annual: { type: Number, default: 15 },
        emergency: { type: Number, default: 5 },
        maternity: { type: Number, default: 180 },
        paternity: { type: Number, default: 15 },
        other: { type: Number, default: 5 }
      },
      default: {
        casual: 12,
        sick: 12,
        annual: 15,
        emergency: 5,
        maternity: 180,
        paternity: 15,
        other: 5
      }
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
