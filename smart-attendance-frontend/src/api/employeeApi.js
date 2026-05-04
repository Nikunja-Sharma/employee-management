import axios from "axios";
import { API_ENDPOINTS } from "../config/api";

axios.defaults.withCredentials = true;

/* Get all employees */
export const getEmployees = async () => {
  const res = await axios.get(API_ENDPOINTS.ADMIN_USERS);
  return res.data;
};

/* Create employee */
export const createEmployee = async (data) => {
  const res = await axios.post(API_ENDPOINTS.ADMIN_USERS, data);
  return res.data;
};

/* Update employee */
export const updateEmployee = async (id, data) => {
  const res = await axios.put(`${API_ENDPOINTS.ADMIN_USERS}/${id}`, data);
  return res.data;
};

/* Delete employee */
export const deleteEmployee = async (id) => {
  const res = await axios.delete(`${API_ENDPOINTS.ADMIN_USERS}/${id}`);
  return res.data;
};