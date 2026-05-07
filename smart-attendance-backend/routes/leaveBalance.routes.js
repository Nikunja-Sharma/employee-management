const express = require("express");
const router = express.Router();
const {
  getEmployeeLeaveBalance,
  getAllEmployeesLeaveBalance,
  updateEmployeeLeaveBalance,
  resetLeaveBalanceForYear,
  getLeaveBalanceStats
} = require("../controllers/leaveBalance.controller");

const auth = require("../middleware/auth.middleware");
const { requireAdmin } = require("../middleware/role.middleware");

// Employee can get their own balance, admin can get any employee's balance
router.get("/employee/:userId", auth, getEmployeeLeaveBalance);

// Admin only routes
router.get("/all", auth, requireAdmin, getAllEmployeesLeaveBalance);
router.get("/stats", auth, requireAdmin, getLeaveBalanceStats);
router.put("/employee/:userId", auth, requireAdmin, updateEmployeeLeaveBalance);
router.post("/reset", auth, requireAdmin, resetLeaveBalanceForYear);

module.exports = router;
