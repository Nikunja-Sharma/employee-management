const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    employeeId: {
      type: String,
      required: true,
      unique: true
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    phone: {
      type: String,
      required: true
    },

    department: {
      type: String,
      required: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["admin", "employee"],
      default: "employee"
    },

    // ✅ NEW FIELDS
    otp: {
      type: String,
      default: null
    },

    otpExpiry: {
      type: Date,
      default: null
    },

    // ✅ LEAVE BALANCE TRACKING
    leaveBalance: {
      casual: {
        total: { type: Number, default: 12 },
        used: { type: Number, default: 0 },
        remaining: { type: Number, default: 12 }
      },
      sick: {
        total: { type: Number, default: 12 },
        used: { type: Number, default: 0 },
        remaining: { type: Number, default: 12 }
      },
      annual: {
        total: { type: Number, default: 15 },
        used: { type: Number, default: 0 },
        remaining: { type: Number, default: 15 }
      },
      emergency: {
        total: { type: Number, default: 5 },
        used: { type: Number, default: 0 },
        remaining: { type: Number, default: 5 }
      },
      maternity: {
        total: { type: Number, default: 180 },
        used: { type: Number, default: 0 },
        remaining: { type: Number, default: 180 }
      },
      paternity: {
        total: { type: Number, default: 15 },
        used: { type: Number, default: 0 },
        remaining: { type: Number, default: 15 }
      },
      other: {
        total: { type: Number, default: 5 },
        used: { type: Number, default: 0 },
        remaining: { type: Number, default: 5 }
      }
    },

    leaveBalanceYear: {
      type: Number,
      default: () => new Date().getFullYear()
    }

  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);