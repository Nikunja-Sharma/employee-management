const router = require("express").Router();

const auth = require("../middleware/auth.middleware");
const { requireAdmin } = require("../middleware/role.middleware");

const {
  getGeofenceConfig,
  updateGeofenceConfig,
  getAttendanceTimes,
  updateAttendanceTimes,
  getLeaveDefaults,
  updateLeaveDefaults
} = require("../controllers/adminSettings.controller");

// Get geofence configuration (accessible to all authenticated users)
router.get("/geofence", auth, getGeofenceConfig);

// Update geofence configuration (admin only)
router.put("/geofence", auth, requireAdmin, updateGeofenceConfig);

// Get attendance times configuration (accessible to all authenticated users)
router.get("/attendance-times", auth, getAttendanceTimes);

// Update attendance times configuration (admin only)
router.put("/attendance-times", auth, requireAdmin, updateAttendanceTimes);

// Get leave defaults configuration (accessible to all authenticated users)
router.get("/leave-defaults", auth, getLeaveDefaults);

// Update leave defaults configuration (admin only)
router.put("/leave-defaults", auth, requireAdmin, updateLeaveDefaults);

module.exports = router;
