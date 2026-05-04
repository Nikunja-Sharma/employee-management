import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import AdminDashboard from "./AdminDashboard";
import EmployeeDashboard from "./EmployeeDashboard";

export default function Dashboard() {
  const { user, logout, loading } = useContext(AuthContext);

  if (loading) return <div className="p-10">Loading...</div>;

  if (!user) return <div className="p-10">Unauthorized</div>;

  return user.role === "admin"
    ? <AdminDashboard user={user} logout={logout} />
    : <EmployeeDashboard user={user} logout={logout} />;
}