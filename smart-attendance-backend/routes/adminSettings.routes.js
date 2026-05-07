const router = require("express").Router();

const auth = require("../middleware/auth.middleware");
const { requireAdmin } = require("../middleware/role.middleware");

const {
  getGeofenceConfig,
  updateGeofenceConfig
} = require("../controllers/adminSettings.controller");

// Get geofence configuration (accessible to all authenticated users)
router.get("/geofence", auth, getGeofenceConfig);

// Update geofence configuration (admin only)
router.put("/geofence", auth, requireAdmin, updateGeofenceConfig);

module.exports = router;
