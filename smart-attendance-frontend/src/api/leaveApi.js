import axios from "axios";

const LEAVE_API = "http://localhost:5001/api/leave";
const ADMIN_API = "http://localhost:5001/api/admin";

axios.defaults.withCredentials = true;

// ================= EMPLOYEE LEAVE APIs =================

/* Apply for leave */
export const applyLeave = async (leaveData) => {
  const res = await axios.post(`${LEAVE_API}/apply`, leaveData);
  return res.data;
};

/* Get my leave applications */
export const getMyLeaves = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const res = await axios.get(`${LEAVE_API}/my-leaves?${queryString}`);
  return res.data;
};

/* Get leave details by ID */
export const getLeaveById = async (leaveId) => {
  const res = await axios.get(`${LEAVE_API}/details/${leaveId}`);
  return res.data;
};

/* Cancel leave application */
export const cancelLeave = async (leaveId) => {
  const res = await axios.delete(`${LEAVE_API}/cancel/${leaveId}`);
  return res.data;
};

// ================= ADMIN LEAVE APIs =================

/* Get all leave applications (Admin) */
export const getAllLeaves = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const res = await axios.get(`${ADMIN_API}/leaves?${queryString}`);
  return res.data;
};

/* Review leave application (Admin) */
export const reviewLeave = async (leaveId, reviewData) => {
  const res = await axios.put(`${ADMIN_API}/leaves/${leaveId}`, reviewData);
  return res.data;
};

/* Get leave statistics (Admin) */
export const getLeaveStats = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const res = await axios.get(`${ADMIN_API}/leave-stats?${queryString}`);
  return res.data;
};