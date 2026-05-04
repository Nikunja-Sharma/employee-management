import axios from "axios";

const API = "http://localhost:5001/api/attendance";

axios.defaults.withCredentials = true;

// ================= GET HISTORY =================
export const getAttendanceHistory = async () => {
  const res = await axios.get(`${API}/history`);
  return res.data;
};

// ================= GET TODAY (NEW) =================
export const getTodayAttendance = async () => {
  const res = await axios.get(`${API}/today`);
  return res.data;
};