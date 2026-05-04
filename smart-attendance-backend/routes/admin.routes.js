const router = require("express").Router();

const auth = require("../middleware/auth.middleware");
const { requireAdmin } = require("../middleware/role.middleware");

const {
  getAllUsers,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getAllAttendance
} = require("../controllers/admin.controller");

// ✅ IMPORT THIS (NEW)
const { updateCheckout } = require("../controllers/attendance.controller");

// ✅ IMPORT LEAVE CONTROLLERS
const {
  getAllLeaves,
  reviewLeave,
  getLeaveStats
} = require("../controllers/leave.controller");

/* ================= USERS ================= */

/* Get all employees */
router.get("/users", auth, requireAdmin, getAllUsers);

/* Create employee */
router.post("/users", auth, requireAdmin, createEmployee);

/* Update employee */
router.put("/users/:id", auth, requireAdmin, updateEmployee);

/* Delete employee */
router.delete("/users/:id", auth, requireAdmin, deleteEmployee);


/* ================= ATTENDANCE ================= */

/* Get all attendance */
router.get("/attendance", auth, requireAdmin, getAllAttendance);

/* ✅ NEW: Update checkout manually (ADMIN) */
router.put("/attendance/:id", auth, requireAdmin, updateCheckout);


/* ================= LEAVE MANAGEMENT ================= */

/* Get all leave applications */
router.get("/leaves", auth, requireAdmin, getAllLeaves);

/* Review leave application (approve/reject) */
router.put("/leaves/:leaveId", auth, requireAdmin, reviewLeave);

/* Get leave statistics */
router.get("/leave-stats", auth, requireAdmin, getLeaveStats);


module.exports = router;