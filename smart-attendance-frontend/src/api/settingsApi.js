import axios from "axios";
import { API_ENDPOINTS } from "../config/api";

axios.defaults.withCredentials = true;

// Geofence Settings
export const getGeofenceConfig = async () => {
  const response = await axios.get(API_ENDPOINTS.SETTINGS_GEOFENCE);
  return response.data;
};

export const updateGeofenceConfig = async (data) => {
  const response = await axios.put(API_ENDPOINTS.SETTINGS_GEOFENCE, data);
  return response.data;
};

// Attendance Times Settings
export const getAttendanceTimes = async () => {
  const response = await axios.get(API_ENDPOINTS.SETTINGS_ATTENDANCE_TIMES);
  return response.data;
};

export const updateAttendanceTimes = async (data) => {
  const response = await axios.put(API_ENDPOINTS.SETTINGS_ATTENDANCE_TIMES, data);
  return response.data;
};

// Leave Defaults Settings
export const getLeaveDefaults = async () => {
  const response = await axios.get(API_ENDPOINTS.SETTINGS_LEAVE_DEFAULTS);
  return response.data;
};

export const updateLeaveDefaults = async (data) => {
  const response = await axios.put(API_ENDPOINTS.SETTINGS_LEAVE_DEFAULTS, data);
  return response.data;
};
