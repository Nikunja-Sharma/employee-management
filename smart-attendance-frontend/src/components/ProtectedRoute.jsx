import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children, role }) {

  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Role mismatch
  if (role && user.role !== role) {

    if (user.role === "admin") {
      return <Navigate to="/admin/dashboard" />;
    }

    if (user.role === "employee") {
      return <Navigate to="/employee/dashboard" />;
    }

  }

  return children;
}