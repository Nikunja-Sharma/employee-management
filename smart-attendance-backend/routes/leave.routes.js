const express = require("express");
const router = express.Router();
const {
  applyLeave,
  getMyLeaves,
  getLeaveById,
  cancelLeave
} = require("../controllers/leave.controller");
const auth = require("../middleware/auth.middleware");

// Employee routes only
router.post("/apply", auth, applyLeave);
router.get("/my-leaves", auth, getMyLeaves);
router.get("/details/:leaveId", auth, getLeaveById);
router.delete("/cancel/:leaveId", auth, cancelLeave);

module.exports = router;