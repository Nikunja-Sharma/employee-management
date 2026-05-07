import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

axios.defaults.withCredentials = true;

// Get employee leave balance
export const getEmployeeLeaveBalance = async (userId) => {
  const response = await axios.get(`${API_BASE_URL}/leave-balance/employee/${userId}`);
  return response.data;
};

// Get all employees leave balance (Admin)
export const getAllEmployeesLeaveBalance = async (params = {}) => {
  const response = await axios.get(`${API_BASE_URL}/leave-balance/all`, { params });
  return response.data;
};

// Get leave balance statistics (Admin)
export const getLeaveBalanceStats = async () => {
  const response = await axios.get(`${API_BASE_URL}/leave-balance/stats`);
  return response.data;
};

// Update employee leave balance (Admin)
export const updateEmployeeLeaveBalance = async (userId, data) => {
  const response = await axios.put(`${API_BASE_URL}/leave-balance/employee/${userId}`, data);
  return response.data;
};

// Reset leave balance for new year (Admin)
export const resetLeaveBalanceForYear = async (data) => {
  const response = await axios.post(`${API_BASE_URL}/leave-balance/reset`, data);
  return response.data;
};
