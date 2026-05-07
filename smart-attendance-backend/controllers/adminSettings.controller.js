const AdminSettings = require("../models/AdminSettings");

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
        allowedRadius: parseInt(process.env.DEFAULT_RADIUS) || 100
      });
    }

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

module.exports = {
  getGeofenceConfig,
  updateGeofenceConfig
};
