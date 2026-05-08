const AdminSettings = require("../models/AdminSettings");

// Helper function to convert HH:MM to minutes
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Helper function to convert minutes to HH:MM
const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

// Get geofence configuration
const getGeofenceConfig = async (req, res) => {
  try {
    let config = await AdminSettings.findOne({ settingKey: "geofence_config" });

    // If no config exists, create default from environment variables
    if (!config) {
      config = await AdminSettings.create({
        settingKey: "geofence_config",
        officeLat: parseFloat(process.env.OFFICE_LAT) || 26.133402482129057,
        officeLng: parseFloat(process.env.OFFICE_LNG) || 91.62278628045627,
        allowedRadius: parseInt(process.env.ALLOWED_RADIUS) || 100
      });
    }

    console.log(`📍 Geofence Config Retrieved: Lat=${config.officeLat}, Lng=${config.officeLng}, Radius=${config.allowedRadius}m`);

    res.status(200).json({
      success: true,
      data: {
        officeLat: config.officeLat,
        officeLng: config.officeLng,
        allowedRadius: config.allowedRadius,
        updatedAt: config.updatedAt
      }
    });

  } catch (error) {
    console.error("Get geofence config error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Update geofence configuration (Admin only)
const updateGeofenceConfig = async (req, res) => {
  try {
    const { officeLat, officeLng, allowedRadius } = req.body;
    const adminId = req.user.id;

    // Validation
    if (officeLat === undefined || officeLng === undefined || allowedRadius === undefined) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: officeLat, officeLng, allowedRadius"
      });
    }

    // Validate latitude range
    if (officeLat < -90 || officeLat > 90) {
      return res.status(400).json({
        success: false,
        message: "Latitude must be between -90 and 90"
      });
    }

    // Validate longitude range
    if (officeLng < -180 || officeLng > 180) {
      return res.status(400).json({
        success: false,
        message: "Longitude must be between -180 and 180"
      });
    }

    // Validate radius
    if (allowedRadius < 10 || allowedRadius > 10000) {
      return res.status(400).json({
        success: false,
        message: "Allowed radius must be between 10 and 10000 meters"
      });
    }

    // Update or create config
    let config = await AdminSettings.findOne({ settingKey: "geofence_config" });

    if (config) {
      config.officeLat = parseFloat(officeLat);
      config.officeLng = parseFloat(officeLng);
      config.allowedRadius = parseInt(allowedRadius);
      config.updatedBy = adminId;
      await config.save();
    } else {
      config = await AdminSettings.create({
        settingKey: "geofence_config",
        officeLat: parseFloat(officeLat),
        officeLng: parseFloat(officeLng),
        allowedRadius: parseInt(allowedRadius),
        updatedBy: adminId
      });
    }

    console.log(`✅ Geofence Config Updated: Lat=${config.officeLat}, Lng=${config.officeLng}, Radius=${config.allowedRadius}m by Admin ID=${adminId}`);

    res.status(200).json({
      success: true,
      message: "Geofence configuration updated successfully",
      data: {
        officeLat: config.officeLat,
        officeLng: config.officeLng,
        allowedRadius: config.allowedRadius,
        updatedAt: config.updatedAt
      }
    });

  } catch (error) {
    console.error("Update geofence config error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get attendance times configuration
const getAttendanceTimes = async (req, res) => {
  try {
    let config = await AdminSettings.findOne({ settingKey: "attendance_times" });

    // If no config exists, create default
    if (!config) {
      config = await AdminSettings.create({
        settingKey: "attendance_times",
        checkinStart: 525,    // 8:45 AM
        checkinEnd: 570,      // 9:30 AM
        checkoutStart: 1005,  // 4:45 PM
        checkoutEnd: 1050,    // 5:30 PM
        lateThreshold: 556    // 9:16 AM
      });
    }

    console.log(`⏰ Attendance Times Retrieved: Check-in ${minutesToTime(config.checkinStart)}-${minutesToTime(config.checkinEnd)}, Check-out ${minutesToTime(config.checkoutStart)}-${minutesToTime(config.checkoutEnd)}`);

    res.status(200).json({
      success: true,
      data: {
        checkinStart: minutesToTime(config.checkinStart),
        checkinEnd: minutesToTime(config.checkinEnd),
        checkoutStart: minutesToTime(config.checkoutStart),
        checkoutEnd: minutesToTime(config.checkoutEnd),
        lateThreshold: minutesToTime(config.lateThreshold),
        updatedAt: config.updatedAt
      }
    });

  } catch (error) {
    console.error("Get attendance times error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Update attendance times configuration (Admin only)
const updateAttendanceTimes = async (req, res) => {
  try {
    const { checkinStart, checkinEnd, checkoutStart, checkoutEnd, lateThreshold } = req.body;
    const adminId = req.user.id;

    // Validation
    if (!checkinStart || !checkinEnd || !checkoutStart || !checkoutEnd || !lateThreshold) {
      return res.status(400).json({
        success: false,
        message: "All time fields are required"
      });
    }

    // Convert times to minutes
    const checkinStartMin = timeToMinutes(checkinStart);
    const checkinEndMin = timeToMinutes(checkinEnd);
    const checkoutStartMin = timeToMinutes(checkoutStart);
    const checkoutEndMin = timeToMinutes(checkoutEnd);
    const lateThresholdMin = timeToMinutes(lateThreshold);

    // Validate time ranges
    if (checkinStartMin >= checkinEndMin) {
      return res.status(400).json({
        success: false,
        message: "Check-in start time must be before end time"
      });
    }

    if (checkoutStartMin >= checkoutEndMin) {
      return res.status(400).json({
        success: false,
        message: "Check-out start time must be before end time"
      });
    }

    if (lateThresholdMin < checkinStartMin || lateThresholdMin > checkinEndMin) {
      return res.status(400).json({
        success: false,
        message: "Late threshold must be between check-in start and end times"
      });
    }

    // Update or create config
    let config = await AdminSettings.findOne({ settingKey: "attendance_times" });

    if (config) {
      config.checkinStart = checkinStartMin;
      config.checkinEnd = checkinEndMin;
      config.checkoutStart = checkoutStartMin;
      config.checkoutEnd = checkoutEndMin;
      config.lateThreshold = lateThresholdMin;
      config.updatedBy = adminId;
      await config.save();
    } else {
      config = await AdminSettings.create({
        settingKey: "attendance_times",
        checkinStart: checkinStartMin,
        checkinEnd: checkinEndMin,
        checkoutStart: checkoutStartMin,
        checkoutEnd: checkoutEndMin,
        lateThreshold: lateThresholdMin,
        updatedBy: adminId
      });
    }

    console.log(`✅ Attendance Times Updated: Check-in ${checkinStart}-${checkinEnd}, Check-out ${checkoutStart}-${checkoutEnd}, Late threshold ${lateThreshold} by Admin ID=${adminId}`);

    res.status(200).json({
      success: true,
      message: "Attendance times updated successfully",
      data: {
        checkinStart: minutesToTime(config.checkinStart),
        checkinEnd: minutesToTime(config.checkinEnd),
        checkoutStart: minutesToTime(config.checkoutStart),
        checkoutEnd: minutesToTime(config.checkoutEnd),
        lateThreshold: minutesToTime(config.lateThreshold),
        updatedAt: config.updatedAt
      }
    });

  } catch (error) {
    console.error("Update attendance times error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get leave defaults configuration
const getLeaveDefaults = async (req, res) => {
  try {
    let config = await AdminSettings.findOne({ settingKey: "leave_defaults" });

    // If no config exists, create default
    if (!config) {
      config = await AdminSettings.create({
        settingKey: "leave_defaults",
        leaveDefaults: {
          casual: 12,
          sick: 12,
          annual: 15,
          emergency: 5,
          maternity: 180,
          paternity: 15,
          other: 5
        }
      });
    }

    console.log(`📋 Leave Defaults Retrieved:`, config.leaveDefaults);

    res.status(200).json({
      success: true,
      data: config.leaveDefaults,
      updatedAt: config.updatedAt
    });

  } catch (error) {
    console.error("Get leave defaults error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Update leave defaults configuration (Admin only)
const updateLeaveDefaults = async (req, res) => {
  try {
    const { casual, sick, annual, emergency, maternity, paternity, other } = req.body;
    const adminId = req.user.id;

    // Validation
    const leaveTypes = { casual, sick, annual, emergency, maternity, paternity, other };
    
    for (const [type, value] of Object.entries(leaveTypes)) {
      if (value === undefined || value < 0 || value > 365) {
        return res.status(400).json({
          success: false,
          message: `${type} leave must be between 0 and 365 days`
        });
      }
    }

    // Update or create config
    let config = await AdminSettings.findOne({ settingKey: "leave_defaults" });

    if (config) {
      config.leaveDefaults = {
        casual: parseInt(casual),
        sick: parseInt(sick),
        annual: parseInt(annual),
        emergency: parseInt(emergency),
        maternity: parseInt(maternity),
        paternity: parseInt(paternity),
        other: parseInt(other)
      };
      config.updatedBy = adminId;
      await config.save();
    } else {
      config = await AdminSettings.create({
        settingKey: "leave_defaults",
        leaveDefaults: {
          casual: parseInt(casual),
          sick: parseInt(sick),
          annual: parseInt(annual),
          emergency: parseInt(emergency),
          maternity: parseInt(maternity),
          paternity: parseInt(paternity),
          other: parseInt(other)
        },
        updatedBy: adminId
      });
    }

    console.log(`✅ Leave Defaults Updated by Admin ID=${adminId}:`, config.leaveDefaults);

    res.status(200).json({
      success: true,
      message: "Leave defaults updated successfully",
      data: config.leaveDefaults,
      updatedAt: config.updatedAt
    });

  } catch (error) {
    console.error("Update leave defaults error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = {
  getGeofenceConfig,
  updateGeofenceConfig,
  getAttendanceTimes,
  updateAttendanceTimes,
  getLeaveDefaults,
  updateLeaveDefaults
};
