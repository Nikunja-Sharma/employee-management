const router = require("express").Router();

const auth = require("../middleware/auth.middleware");
const { requireAdmin } = require("../middleware/role.middleware");

const {
  generateUserReport,
  generateAdminReport
} = require("../controllers/report.controller");

// ================= USER REPORT =================
// Employee can generate their own report
// Admin can generate any user's report
router.get("/user/:userId", auth, generateUserReport);

// ================= ADMIN REPORT (ALL EMPLOYEES) =================
// Only admin can generate company-wide report
router.get("/admin/all", auth, requireAdmin, generateAdminReport);

module.exports = router;
