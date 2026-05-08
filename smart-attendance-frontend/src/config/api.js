// Centralized API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: `${API_BASE_URL}/auth`,
  AUTH_LOGIN: `${API_BASE_URL}/auth/login`,
  AUTH_LOGOUT: `${API_BASE_URL}/auth/logout`,
  AUTH_ME: `${API_BASE_URL}/auth/me`,
  AUTH_SEND_OTP: `${API_BASE_URL}/auth/send-otp`,
  AUTH_RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,

  // Admin endpoints
  ADMIN: `${API_BASE_URL}/admin`,
  ADMIN_USERS: `${API_BASE_URL}/admin/users`,
  ADMIN_ATTENDANCE: `${API_BASE_URL}/admin/attendance`,
  ADMIN_LEAVES: `${API_BASE_URL}/admin/leaves`,
  ADMIN_LEAVE_STATS: `${API_BASE_URL}/admin/leave-stats`,

  // Attendance endpoints
  ATTENDANCE: `${API_BASE_URL}/attendance`,
  ATTENDANCE_HISTORY: `${API_BASE_URL}/attendance/history`,
  ATTENDANCE_TODAY: `${API_BASE_URL}/attendance/today`,
  ATTENDANCE_SCAN: `${API_BASE_URL}/attendance/scan`,
  ATTENDANCE_PREDICTIONS: `${API_BASE_URL}/attendance/predictions`,

  // Leave endpoints
  LEAVE: `${API_BASE_URL}/leave`,
  LEAVE_APPLY: `${API_BASE_URL}/leave/apply`,
  LEAVE_MY_LEAVES: `${API_BASE_URL}/leave/my-leaves`,
  LEAVE_DETAILS: `${API_BASE_URL}/leave/details`,
  LEAVE_CANCEL: `${API_BASE_URL}/leave/cancel`,

  // QR endpoints
  QR_CURRENT: `${API_BASE_URL}/qr/current`,

  // Settings endpoints
  SETTINGS_GEOFENCE: `${API_BASE_URL}/settings/geofence`,
  SETTINGS_ATTENDANCE_TIMES: `${API_BASE_URL}/settings/attendance-times`,
  SETTINGS_LEAVE_DEFAULTS: `${API_BASE_URL}/settings/leave-defaults`,
};

export default API_BASE_URL;
