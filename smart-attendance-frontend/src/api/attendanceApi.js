import axios from "axios";
import { API_ENDPOINTS } from "../config/api";

axios.defaults.withCredentials = true;

// ================= GET HISTORY =================
export const getAttendanceHistory = async () => {
  const res = await axios.get(API_ENDPOINTS.ATTENDANCE_HISTORY);
  return res.data;
};

// ================= GET TODAY (NEW) =================
export const getTodayAttendance = async () => {
  const res = await axios.get(API_ENDPOINTS.ATTENDANCE_TODAY);
  return res.data;
};