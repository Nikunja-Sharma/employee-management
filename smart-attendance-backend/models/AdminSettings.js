const mongoose = require("mongoose");

const adminSettingsSchema = new mongoose.Schema(
  {
    settingKey: {
      type: String,
      required: true,
      unique: true,
      enum: ["geofence_config"]
    },

    officeLat: {
      type: Number,
      required: true,
      default: 26.133402482129057
    },

    officeLng: {
      type: Number,
      required: true,
      default: 91.62278628045627
    },

    allowedRadius: {
      type: Number,
      required: true,
      default: 100 // in meters
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
