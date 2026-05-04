import axios from "axios";

const API = "http://localhost:5001/api/admin";

axios.defaults.withCredentials = true;

/* Get all employees */
export const getEmployees = async () => {
  const res = await axios.get(`${API}/users`);
  return res.data;
};

/* Create employee */
export const createEmployee = async (data) => {
  const res = await axios.post(`${API}/users`, data);
  return res.data;
};

/* Update employee */
export const updateEmployee = async (id, data) => {
  const res = await axios.put(`${API}/users/${id}`, data);
  return res.data;
};

/* Delete employee */
export const deleteEmployee = async (id) => {
  const res = await axios.delete(`${API}/users/${id}`);
  return res.data;
};