import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

axios.defaults.withCredentials = true;

// Get geofence configuration
export const getGeofenceConfig = async () => {
  const response = await axios.get(`${API_BASE_URL}/settings/geofence`);
  return response.data;
};

// Update geofence configuration (Admin only)
export const updateGeofenceConfig = async (data) => {
  const response = await axios.put(`${API_BASE_URL}/settings/geofence`, data);
  return response.data;
};
