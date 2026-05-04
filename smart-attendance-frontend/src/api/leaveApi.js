import axios from "axios";
import { API_ENDPOINTS } from "../config/api";

axios.defaults.withCredentials = true;

// ================= EMPLOYEE LEAVE APIs =================

/* Apply for leave */
export const applyLeave = async (leaveData) => {
  const res = await axios.post(API_ENDPOINTS.LEAVE_APPLY, leaveData);
  return res.data;
};

/* Get my leave applications */
export const getMyLeaves = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const res = await axios.get(`${API_ENDPOINTS.LEAVE_MY_LEAVES}?${queryString}`);
  return res.data;
};

/* Get leave details by ID */
export const getLeaveById = async (leaveId) => {
  const res = await axios.get(`${API_ENDPOINTS.LEAVE_DETAILS}/${leaveId}`);
  return res.data;
};

/* Cancel leave application */
export const cancelLeave = async (leaveId) => {
  const res = await axios.delete(`${API_ENDPOINTS.LEAVE_CANCEL}/${leaveId}`);
  return res.data;
};

// ================= ADMIN LEAVE APIs =================

/* Get all leave applications (Admin) */
export const getAllLeaves = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const res = await axios.get(`${API_ENDPOINTS.ADMIN_LEAVES}?${queryString}`);
  return res.data;
};

/* Review leave application (Admin) */
export const reviewLeave = async (leaveId, reviewData) => {
  const res = await axios.put(`${API_ENDPOINTS.ADMIN_LEAVES}/${leaveId}`, reviewData);
  return res.data;
};

/* Get leave statistics (Admin) */
export const getLeaveStats = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const res = await axios.get(`${API_ENDPOINTS.ADMIN_LEAVE_STATS}?${queryString}`);
  return res.data;
};