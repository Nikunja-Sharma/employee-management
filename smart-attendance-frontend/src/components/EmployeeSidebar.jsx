import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function EmployeeSidebar() {

  const location = useLocation();
  const navigate = useNavigate();

  const { user, logout } = useContext(AuthContext);

  const linkClass = (path) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg ${
      location.pathname.includes(path)
        ? "bg-blue-600"
        : "hover:bg-blue-800"
    }`;

  const handleLogout = async () => {
    await logout();
    navigate("/login"); // redirect after logout
  };

  return (
    <div className="w-64 bg-[#0f172a] text-white flex flex-col justify-between h-screen">

      {/* TOP SECTION */}
      <div>

        {/* LOGO */}
        <div className="text-2xl font-bold p-6 border-b border-gray-700">
          Attendify
        </div>

        {/* NAV */}
        <nav className="p-4 space-y-2">

          <Link to="/employee/dashboard" className={linkClass("dashboard")}>
            Dashboard
          </Link>

          <Link to="/employee/scan" className={linkClass("scan")}>
            Scan QR
          </Link>

          <Link to="/employee/history" className={linkClass("history")}>
            History
          </Link>

          <Link to="/employee/leaves" className={linkClass("leaves")}>
            My Leaves
          </Link>

          <Link to="/employee/report" className={linkClass("report")}>
            My Report
          </Link>

        </nav>

      </div>

      {/* BOTTOM SECTION */}
      <div className="p-4 border-t border-gray-700">

        {/* USER INFO */}
        <div className="flex items-center gap-3 mb-4">

          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold">
            {user?.name ? user.name.charAt(0) : "U"}
          </div>

          <div>
            <p className="text-sm font-semibold">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-gray-400 capitalize">
              {user?.role || "employee"}
            </p>
          </div>

        </div>

        {/* SIGN OUT */}
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 transition"
        >
          Sign Out
        </button>

      </div>

    </div>
  );
}