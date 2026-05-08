const User = require("../models/User");
const Leave = require("../models/Leave");
const AdminSettings = require("../models/AdminSettings");

// Helper function to get leave defaults from settings
const getLeaveDefaultsFromSettings = async () => {
  try {
    const config = await AdminSettings.findOne({ settingKey: "leave_defaults" });
    
    if (config && config.leaveDefaults) {
      return config.leaveDefaults;
    }
    
    // Return hardcoded defaults if no config exists
    return {
      casual: 12,
      sick: 12,
      annual: 15,
      emergency: 5,
      maternity: 180,
      paternity: 15,
      other: 5
    };
  } catch (error) {
    console.error("Error fetching leave defaults:", error);
    // Return hardcoded defaults on error
    return {
      casual: 12,
      sick: 12,
      annual: 15,
      emergency: 5,
      maternity: 180,
      paternity: 15,
      other: 5
    };
  }
};

// Get leave balance for a specific employee
const getEmployeeLeaveBalance = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('name employeeId email department leaveBalance leaveBalanceYear');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    // Check if user is accessing their own data or is admin
    if (req.user.role !== "admin" && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    // ✅ Initialize leave balance if it doesn't exist (for existing users)
    if (!user.leaveBalance) {
      const defaults = await getLeaveDefaultsFromSettings();
      
      user.leaveBalance = {
        casual: { total: defaults.casual, used: 0, remaining: defaults.casual },
        sick: { total: defaults.sick, used: 0, remaining: defaults.sick },
        annual: { total: defaults.annual, used: 0, remaining: defaults.annual },
        emergency: { total: defaults.emergency, used: 0, remaining: defaults.emergency },
        maternity: { total: defaults.maternity, used: 0, remaining: defaults.maternity },
        paternity: { total: defaults.paternity, used: 0, remaining: defaults.paternity },
        other: { total: defaults.other, used: 0, remaining: defaults.other }
      };
      user.leaveBalanceYear = new Date().getFullYear();
      await user.save();
    }

    // Calculate total leaves
    const totalAllocated = Object.values(user.leaveBalance).reduce((sum, leave) => sum + leave.total, 0);
    const totalUsed = Object.values(user.leaveBalance).reduce((sum, leave) => sum + leave.used, 0);
    const totalRemaining = Object.values(user.leaveBalance).reduce((sum, leave) => sum + leave.remaining, 0);

    res.status(200).json({
      success: true,
      data: {
        employee: {
          id: user._id,
          name: user.name,
          employeeId: user.employeeId,
          email: user.email,
          department: user.department
        },
        year: user.leaveBalanceYear,
        leaveBalance: user.leaveBalance,
        summary: {
          totalAllocated,
          totalUsed,
          totalRemaining
        }
      }
    });

  } catch (error) {
    console.error("Get employee leave balance error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get all employees leave balance (Admin only)
const getAllEmployeesLeaveBalance = async (req, res) => {
  try {
    const { department, search, page = 1, limit = 20 } = req.query;

    const query = { role: "employee" };
    
    if (department) {
      query.department = department;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const employees = await User.find(query)
      .select('name employeeId email department leaveBalance leaveBalanceYear')
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    // Calculate summary for each employee
    const employeesWithSummary = employees.map(emp => {
      // ✅ Initialize leave balance if it doesn't exist
      if (!emp.leaveBalance) {
        // Use async initialization with defaults
        (async () => {
          const defaults = await getLeaveDefaultsFromSettings();
          emp.leaveBalance = {
            casual: { total: defaults.casual, used: 0, remaining: defaults.casual },
            sick: { total: defaults.sick, used: 0, remaining: defaults.sick },
            annual: { total: defaults.annual, used: 0, remaining: defaults.annual },
            emergency: { total: defaults.emergency, used: 0, remaining: defaults.emergency },
            maternity: { total: defaults.maternity, used: 0, remaining: defaults.maternity },
            paternity: { total: defaults.paternity, used: 0, remaining: defaults.paternity },
            other: { total: defaults.other, used: 0, remaining: defaults.other }
          };
          emp.leaveBalanceYear = new Date().getFullYear();
          emp.save().catch(err => console.error('Error saving leave balance:', err));
        })();
        
        // Set temporary defaults for immediate response
        emp.leaveBalance = {
          casual: { total: 12, used: 0, remaining: 12 },
          sick: { total: 12, used: 0, remaining: 12 },
          annual: { total: 15, used: 0, remaining: 15 },
          emergency: { total: 5, used: 0, remaining: 5 },
          maternity: { total: 180, used: 0, remaining: 180 },
          paternity: { total: 15, used: 0, remaining: 15 },
          other: { total: 5, used: 0, remaining: 5 }
        };
        emp.leaveBalanceYear = new Date().getFullYear();
      }

      const totalAllocated = Object.values(emp.leaveBalance).reduce((sum, leave) => sum + leave.total, 0);
      const totalUsed = Object.values(emp.leaveBalance).reduce((sum, leave) => sum + leave.used, 0);
      const totalRemaining = Object.values(emp.leaveBalance).reduce((sum, leave) => sum + leave.remaining, 0);

      return {
        id: emp._id,
        name: emp.name,
        employeeId: emp.employeeId,
        email: emp.email,
        department: emp.department,
        year: emp.leaveBalanceYear,
        leaveBalance: emp.leaveBalance,
        summary: {
          totalAllocated,
          totalUsed,
          totalRemaining
        }
      };
    });

    res.status(200).json({
      success: true,
      data: {
        employees: employeesWithSummary,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: employees.length,
          totalRecords: total
        }
      }
    });

  } catch (error) {
    console.error("Get all employees leave balance error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Update employee leave balance (Admin only)
const updateEmployeeLeaveBalance = async (req, res) => {
  try {
    const { userId } = req.params;
    const { leaveType, total } = req.body;

    // Validation
    const validLeaveTypes = ['casual', 'sick', 'annual', 'emergency', 'maternity', 'paternity', 'other'];
    
    if (!leaveType || !validLeaveTypes.includes(leaveType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave type"
      });
    }

    if (total === undefined || total < 0) {
      return res.status(400).json({
        success: false,
        message: "Total must be a positive number"
      });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    // Update leave balance
    const used = user.leaveBalance[leaveType].used;
    user.leaveBalance[leaveType].total = total;
    user.leaveBalance[leaveType].remaining = Math.max(0, total - used);

    await user.save();

    res.status(200).json({
      success: true,
      message: "Leave balance updated successfully",
      data: {
        employeeId: user.employeeId,
        name: user.name,
        leaveType,
        leaveBalance: user.leaveBalance[leaveType]
      }
    });

  } catch (error) {
    console.error("Update employee leave balance error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Reset leave balance for new year (Admin only)
const resetLeaveBalanceForYear = async (req, res) => {
  try {
    const { userId, year } = req.body;

    if (!year || year < 2020 || year > 2100) {
      return res.status(400).json({
        success: false,
        message: "Invalid year"
      });
    }

    // Get current leave defaults
    const defaults = await getLeaveDefaultsFromSettings();

    const query = userId ? { _id: userId, role: "employee" } : { role: "employee" };
    
    const result = await User.updateMany(
      query,
      {
        $set: {
          'leaveBalance.casual.used': 0,
          'leaveBalance.casual.remaining': defaults.casual,
          'leaveBalance.casual.total': defaults.casual,
          'leaveBalance.sick.used': 0,
          'leaveBalance.sick.remaining': defaults.sick,
          'leaveBalance.sick.total': defaults.sick,
          'leaveBalance.annual.used': 0,
          'leaveBalance.annual.remaining': defaults.annual,
          'leaveBalance.annual.total': defaults.annual,
          'leaveBalance.emergency.used': 0,
          'leaveBalance.emergency.remaining': defaults.emergency,
          'leaveBalance.emergency.total': defaults.emergency,
          'leaveBalance.maternity.used': 0,
          'leaveBalance.maternity.remaining': defaults.maternity,
          'leaveBalance.maternity.total': defaults.maternity,
          'leaveBalance.paternity.used': 0,
          'leaveBalance.paternity.remaining': defaults.paternity,
          'leaveBalance.paternity.total': defaults.paternity,
          'leaveBalance.other.used': 0,
          'leaveBalance.other.remaining': defaults.other,
          'leaveBalance.other.total': defaults.other,
          'leaveBalanceYear': year
        }
      }
    );

    res.status(200).json({
      success: true,
      message: `Leave balance reset for ${result.modifiedCount} employee(s) for year ${year}`,
      data: {
        employeesUpdated: result.modifiedCount,
        year,
        defaults
      }
    });

  } catch (error) {
    console.error("Reset leave balance error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get leave balance statistics (Admin only)
const getLeaveBalanceStats = async (req, res) => {
  try {
    const employees = await User.find({ role: "employee" })
      .select('leaveBalance leaveBalanceYear');

    const stats = {
      totalEmployees: employees.length,
      year: employees[0]?.leaveBalanceYear || new Date().getFullYear(),
      byLeaveType: {
        casual: { totalAllocated: 0, totalUsed: 0, totalRemaining: 0 },
        sick: { totalAllocated: 0, totalUsed: 0, totalRemaining: 0 },
        annual: { totalAllocated: 0, totalUsed: 0, totalRemaining: 0 },
        emergency: { totalAllocated: 0, totalUsed: 0, totalRemaining: 0 },
        maternity: { totalAllocated: 0, totalUsed: 0, totalRemaining: 0 },
        paternity: { totalAllocated: 0, totalUsed: 0, totalRemaining: 0 },
        other: { totalAllocated: 0, totalUsed: 0, totalRemaining: 0 }
      },
      overall: {
        totalAllocated: 0,
        totalUsed: 0,
        totalRemaining: 0
      }
    };

    employees.forEach(emp => {
      Object.keys(emp.leaveBalance).forEach(leaveType => {
        const balance = emp.leaveBalance[leaveType];
        stats.byLeaveType[leaveType].totalAllocated += balance.total;
        stats.byLeaveType[leaveType].totalUsed += balance.used;
        stats.byLeaveType[leaveType].totalRemaining += balance.remaining;
        
        stats.overall.totalAllocated += balance.total;
        stats.overall.totalUsed += balance.used;
        stats.overall.totalRemaining += balance.remaining;
      });
    });

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error("Get leave balance stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Helper function to update leave balance when leave is approved
const updateLeaveBalanceOnApproval = async (leave) => {
  try {
    const user = await User.findById(leave.employee);
    
    if (!user) {
      throw new Error("Employee not found");
    }

    const leaveType = leave.leaveType;
    const leaveDays = leave.totalDays;

    // Update used and remaining
    user.leaveBalance[leaveType].used += leaveDays;
    user.leaveBalance[leaveType].remaining = Math.max(
      0,
      user.leaveBalance[leaveType].total - user.leaveBalance[leaveType].used
    );

    await user.save();

    return user.leaveBalance[leaveType];
  } catch (error) {
    console.error("Error updating leave balance:", error);
    throw error;
  }
};

// Helper function to restore leave balance when leave is rejected or cancelled
const restoreLeaveBalanceOnRejection = async (leave) => {
  try {
    // Only restore if leave was previously approved
    if (leave.status !== "approved") {
      return null;
    }

    const user = await User.findById(leave.employee);
    
    if (!user) {
      throw new Error("Employee not found");
    }

    const leaveType = leave.leaveType;
    const leaveDays = leave.totalDays;

    // Restore used and remaining
    user.leaveBalance[leaveType].used = Math.max(0, user.leaveBalance[leaveType].used - leaveDays);
    user.leaveBalance[leaveType].remaining = Math.min(
      user.leaveBalance[leaveType].total,
      user.leaveBalance[leaveType].remaining + leaveDays
    );

    await user.save();

    return user.leaveBalance[leaveType];
  } catch (error) {
    console.error("Error restoring leave balance:", error);
    throw error;
  }
};

module.exports = {
  getEmployeeLeaveBalance,
  getAllEmployeesLeaveBalance,
  updateEmployeeLeaveBalance,
  resetLeaveBalanceForYear,
  getLeaveBalanceStats,
  updateLeaveBalanceOnApproval,
  restoreLeaveBalanceOnRejection
};
