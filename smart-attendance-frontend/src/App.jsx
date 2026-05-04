import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import QRDisplay from "./pages/QRDisplay";
import ScanQR from "./pages/ScanQR";
import History from "./pages/History";
import Attendance from "./pages/Attendance";
import ForgotPassword from "./pages/ForgotPassword";
import EmployeeLeaves from "./pages/EmployeeLeaves";
import AdminLeaves from "./pages/AdminLeaves";

// Layouts
import AdminLayout from "./layouts/AdminLayout";
import EmployeeLayout from "./layouts/EmployeeLayout";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* 🌐 LANDING PAGE (NEW DEFAULT) */}
          <Route path="/" element={<LandingPage />} />

          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* QR Display */}
          <Route path="/qr-display" element={<QRDisplay />} />

          {/* ================= ADMIN ROUTES ================= */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="employees" element={<Employees />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="leaves" element={<AdminLeaves />} />
          </Route>

          {/* ================= EMPLOYEE ROUTES ================= */}
          <Route
            path="/employee"
            element={
              <ProtectedRoute role="employee">
                <EmployeeLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="scan" element={<ScanQR />} />
            <Route path="history" element={<History />} />
            <Route path="leaves" element={<EmployeeLeaves />} />
          </Route>

          {/* OPTIONAL: fallback (if wrong URL entered) */}
          <Route path="*" element={<LandingPage />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;