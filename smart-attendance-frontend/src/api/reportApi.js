import axios from "axios";

// Report API - Updated to use axios directly
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

axios.defaults.withCredentials = true;

// ================= GENERATE USER REPORT =================
export const generateUserReport = async (userId, startDate, endDate) => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    console.log("Generating report for userId:", userId);
    console.log("Date range:", { startDate, endDate });
    console.log("API URL:", `${API_BASE_URL}/report/user/${userId}?${params.toString()}`);

    const response = await axios.get(`${API_BASE_URL}/report/user/${userId}?${params.toString()}`, {
      responseType: "blob", // Important for PDF download
      withCredentials: true,
    });

    console.log("Response received:", response);
    console.log("Response type:", response.headers['content-type']);

    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `attendance-report-${userId}-${Date.now()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error("Error generating user report:", error);
    console.error("Error response:", error.response);
    console.error("Error message:", error.message);
    throw error;
  }
};

// ================= GENERATE ADMIN REPORT (ALL EMPLOYEES) =================
export const generateAdminReport = async (startDate, endDate) => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    console.log("Generating admin report");
    console.log("Date range:", { startDate, endDate });
    console.log("API URL:", `${API_BASE_URL}/report/admin/all?${params.toString()}`);

    const response = await axios.get(`${API_BASE_URL}/report/admin/all?${params.toString()}`, {
      responseType: "blob", // Important for PDF download
      withCredentials: true,
    });

    console.log("Response received:", response);
    console.log("Response type:", response.headers['content-type']);

    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `attendance-report-all-employees-${Date.now()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error("Error generating admin report:", error);
    console.error("Error response:", error.response);
    console.error("Error message:", error.message);
    throw error;
  }
};
