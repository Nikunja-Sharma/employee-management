const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    employeeId: {
      type: String,
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    dateString: {
      type: String,
      required: true,
    },

    checkIn: {
      type: String,
      default: null,
    },

    checkOut: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["present", "late", "absent", "on-leave"],
      default: "present",
    },

    isAutoAbsent: {
      type: Boolean,
      default: false,
    },

    // ✅ NEW FIELD (already existing)
    photo: {
      type: String,
      default: null
    },

    // ✅ NEW FEATURE FIELD (ADDED SAFELY)
    reason: {
      type: String,
      default: null
    },

    // ✅ LEAVE TRACKING
    isLeave: {
      type: Boolean,
      default: false
    },

    leaveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Leave",
      default: null
    }

  },
  { timestamps: true }
);

attendanceSchema.index(
  { employee: 1, dateString: 1 },
  { unique: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);