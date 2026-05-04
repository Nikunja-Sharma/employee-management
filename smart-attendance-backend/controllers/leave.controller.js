const Leave = require("../models/Leave");
const User = require("../models/User");
const Attendance = require("../models/Attendance");
const mongoose = require("mongoose");

// Helper function to create attendance records for approved leave
const createLeaveAttendanceRecords = async (leave) => {
  try {
    const startDate = new Date(leave.startDate);
    const endDate = new Date(leave.endDate);
    
    const records = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split('T')[0];
      
      // Skip weekends (Saturday = 6, Sunday = 0)
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        
        // Check if attendance record already exists
        const existingRecord = await Attendance.findOne({
          employee: leave.employee,
          dateString: dateString
        });
        
        if (!existingRecord) {
          // Create new leave attendance record
          records.push({
            employee: leave.employee,
            employeeId: leave.employeeId,
            date: new Date(currentDate),
            dateString: dateString,
            checkIn: null,
            checkOut: null,
            status: "on-leave",
            isLeave: true,
            leaveId: leave._id,
            reason: `${leave.leaveType} leave`
          });
        } else if (!existingRecord.checkIn && !existingRecord.isLeave) {
          // Update existing absent record to leave
          existingRecord.status = "on-leave";
          existingRecord.isLeave = true;
          existingRecord.leaveId = leave._id;
          existingRecord.reason = `${leave.leaveType} leave`;
          await existingRecord.save();
        }
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Bulk insert new records
    if (records.length > 0) {
      await Attendance.insertMany(records);
    }
    
    return records.length;
  } catch (error) {
    console.error("Error creating leave attendance records:", error);
    throw error;
  }
};

// Helper function to remove leave attendance records when leave is rejected
const removeLeaveAttendanceRecords = async (leave) => {
  try {
    // Only remove records that were created by this leave and have no check-in
    const result = await Attendance.deleteMany({
      leaveId: leave._id,
      isLeave: true,
      checkIn: null
    });
    
    return result.deletedCount;
  } catch (error) {
    console.error("Error removing leave attendance records:", error);
    throw error;
  }
};

// Apply for leave (Employee)
const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    const employeeId = req.user.id;

    // Validation
    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Validate dates
    if (start < today) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be in the past"
      });
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date"
      });
    }

    // Calculate total days (including weekends)
    const timeDiff = end.getTime() - start.getTime();
    const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

    // Check for overlapping leave applications
    const overlappingLeave = await Leave.findOne({
      employee: employeeId,
      status: { $in: ["pending", "approved"] },
      $or: [
        {
          startDate: { $lte: end },
          endDate: { $gte: start }
        }
      ]
    });

    if (overlappingLeave) {
      return res.status(400).json({
        success: false,
        message: "You already have a leave application for overlapping dates"
      });
    }

    // ✅ CHECK FOR EXISTING ATTENDANCE RECORDS WITH CHECK-IN
    const existingAttendance = await Attendance.findOne({
      employee: employeeId,
      dateString: {
        $gte: start.toISOString().split('T')[0],
        $lte: end.toISOString().split('T')[0]
      },
      checkIn: { $ne: null }
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: `Cannot apply leave - you have already marked attendance on ${existingAttendance.dateString}`
      });
    }

    // Get employee details
    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    // Create leave application
    const leave = new Leave({
      employee: employeeId,
      employeeId: employee.employeeId,
      leaveType,
      startDate: start,
      endDate: end,
      totalDays,
      reason: reason.trim()
    });

    await leave.save();

    // Populate employee details for response
    await leave.populate('employee', 'name employeeId email department');

    res.status(201).json({
      success: true,
      message: "Leave application submitted successfully",
      data: leave
    });

  } catch (error) {
    console.error("Apply leave error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get employee's leave applications
const getMyLeaves = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const query = { employee: employeeId };
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const leaves = await Leave.find(query)
      .populate('employee', 'name employeeId email department')
      .populate('reviewedBy', 'name employeeId')
      .sort({ appliedDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Leave.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        leaves,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: leaves.length,
          totalRecords: total
        }
      }
    });

  } catch (error) {
    console.error("Get my leaves error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get all leave applications (Admin)
const getAllLeaves = async (req, res) => {
  try {
    const { status, employeeId, leaveType, page = 1, limit = 10, startDate, endDate } = req.query;

    const query = {};
    
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      query.status = status;
    }

    if (employeeId) {
      query.employeeId = { $regex: employeeId, $options: 'i' };
    }

    if (leaveType) {
      query.leaveType = leaveType;
    }

    if (startDate && endDate) {
      query.startDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const skip = (page - 1) * limit;

    const leaves = await Leave.find(query)
      .populate('employee', 'name employeeId email department')
      .populate('reviewedBy', 'name employeeId')
      .sort({ appliedDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Leave.countDocuments(query);

    // Get summary statistics
    const stats = await Leave.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const summary = {
      total: total,
      pending: stats.find(s => s._id === "pending")?.count || 0,
      approved: stats.find(s => s._id === "approved")?.count || 0,
      rejected: stats.find(s => s._id === "rejected")?.count || 0
    };

    res.status(200).json({
      success: true,
      data: {
        leaves,
        summary,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: leaves.length,
          totalRecords: total
        }
      }
    });

  } catch (error) {
    console.error("Get all leaves error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Review leave application (Admin)
const reviewLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status, adminComments } = req.body;
    const adminId = req.user.id;

    // Validation
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'approved' or 'rejected'"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(leaveId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave ID"
      });
    }

    // Find leave application
    const leave = await Leave.findById(leaveId)
      .populate('employee', 'name employeeId email department');

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave application not found"
      });
    }

    // Check if already reviewed
    if (leave.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Leave application is already ${leave.status}`
      });
    }

    // Update leave application
    leave.status = status;
    leave.reviewedBy = adminId;
    leave.reviewedDate = new Date();
    if (adminComments) {
      leave.adminComments = adminComments.trim();
    }

    await leave.save();

    // Populate admin details for response
    await leave.populate('reviewedBy', 'name employeeId');

    // ✅ CREATE OR REMOVE ATTENDANCE RECORDS BASED ON STATUS
    let attendanceMessage = "";
    
    if (status === "approved") {
      try {
        const recordsCreated = await createLeaveAttendanceRecords(leave);
        attendanceMessage = ` (${recordsCreated} attendance records created)`;
      } catch (error) {
        console.error("Failed to create attendance records:", error);
        attendanceMessage = " (Warning: Failed to create attendance records)";
      }
    } else if (status === "rejected") {
      try {
        const recordsRemoved = await removeLeaveAttendanceRecords(leave);
        if (recordsRemoved > 0) {
          attendanceMessage = ` (${recordsRemoved} attendance records removed)`;
        }
      } catch (error) {
        console.error("Failed to remove attendance records:", error);
      }
    }

    res.status(200).json({
      success: true,
      message: `Leave application ${status} successfully${attendanceMessage}`,
      data: leave
    });

  } catch (error) {
    console.error("Review leave error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get leave details by ID
const getLeaveById = async (req, res) => {
  try {
    const { leaveId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(leaveId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave ID"
      });
    }

    const leave = await Leave.findById(leaveId)
      .populate('employee', 'name employeeId email department phone')
      .populate('reviewedBy', 'name employeeId');

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave application not found"
      });
    }

    // Check if user has permission to view this leave
    if (req.user.role !== "admin" && leave.employee._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    res.status(200).json({
      success: true,
      data: leave
    });

  } catch (error) {
    console.error("Get leave by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Cancel leave application (Employee - only pending leaves)
const cancelLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const employeeId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(leaveId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave ID"
      });
    }

    const leave = await Leave.findOne({
      _id: leaveId,
      employee: employeeId
    });

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave application not found"
      });
    }

    if (leave.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending leave applications can be cancelled"
      });
    }

    // ✅ CHECK IF ATTENDANCE RECORDS EXIST FOR THIS LEAVE
    const leaveAttendance = await Attendance.findOne({
      leaveId: leaveId,
      isLeave: true
    });

    if (leaveAttendance) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel - leave has been approved and attendance records created. Contact admin."
      });
    }

    await Leave.findByIdAndDelete(leaveId);

    res.status(200).json({
      success: true,
      message: "Leave application cancelled successfully"
    });

  } catch (error) {
    console.error("Cancel leave error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get leave statistics (Admin)
const getLeaveStats = async (req, res) => {
  try {
    const { year = new Date().getFullYear(), month } = req.query;

    const matchStage = {
      $expr: {
        $eq: [{ $year: "$startDate" }, parseInt(year)]
      }
    };

    if (month) {
      matchStage.$expr = {
        $and: [
          { $eq: [{ $year: "$startDate" }, parseInt(year)] },
          { $eq: [{ $month: "$startDate" }, parseInt(month)] }
        ]
      };
    }

    const stats = await Leave.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            status: "$status",
            leaveType: "$leaveType"
          },
          count: { $sum: 1 },
          totalDays: { $sum: "$totalDays" }
        }
      },
      {
        $group: {
          _id: "$_id.status",
          types: {
            $push: {
              type: "$_id.leaveType",
              count: "$count",
              totalDays: "$totalDays"
            }
          },
          totalCount: { $sum: "$count" },
          totalDays: { $sum: "$totalDays" }
        }
      }
    ]);

    // Get monthly breakdown
    const monthlyStats = await Leave.aggregate([
      { $match: { $expr: { $eq: [{ $year: "$startDate" }, parseInt(year)] } } },
      {
        $group: {
          _id: {
            month: { $month: "$startDate" },
            status: "$status"
          },
          count: { $sum: 1 },
          totalDays: { $sum: "$totalDays" }
        }
      },
      {
        $group: {
          _id: "$_id.month",
          statuses: {
            $push: {
              status: "$_id.status",
              count: "$count",
              totalDays: "$totalDays"
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: stats,
        monthly: monthlyStats,
        year: parseInt(year),
        month: month ? parseInt(month) : null
      }
    });

  } catch (error) {
    console.error("Get leave stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  reviewLeave,
  getLeaveById,
  cancelLeave,
  getLeaveStats
};