const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
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

    leaveType: {
      type: String,
      enum: ["sick", "casual", "annual", "maternity", "paternity", "emergency", "other"],
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    totalDays: {
      type: Number,
      required: true,
    },

    reason: {
      type: String,
      required: true,
      maxlength: 500,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    appliedDate: {
      type: Date,
      default: Date.now,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedDate: {
      type: Date,
      default: null,
    },

    adminComments: {
      type: String,
      default: null,
      maxlength: 500,
    },

    attachments: [{
      filename: String,
      path: String,
      uploadDate: {
        type: Date,
        default: Date.now,
      }
    }],

  },
  { timestamps: true }
);

// Index for efficient queries
leaveSchema.index({ employee: 1, appliedDate: -1 });
leaveSchema.index({ status: 1, appliedDate: -1 });
leaveSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model("Leave", leaveSchema);