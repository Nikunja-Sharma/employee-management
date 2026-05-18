import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Menu, X } from "lucide-react";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  const linkClass = (path) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg ${
      location.pathname.includes(path)
        ? "bg-blue-600"
        : "hover:bg-blue-800"
    }`;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleLinkClick = () => {
    setIsOpen(false); // Close sidebar on mobile after clicking a link
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-[#0f172a] text-white p-2 rounded-lg shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#0f172a] text-white flex flex-col justify-between h-screen transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* TOP SECTION */}
        <div>
          {/* LOGO */}
          <div className="text-2xl font-bold p-6 border-b border-gray-700">
            Attendify
          </div>

          {/* NAV */}
          <nav className="p-4 space-y-2">
            <Link to="/admin/dashboard" className={linkClass("dashboard")} onClick={handleLinkClick}>
              Dashboard
            </Link>

            <Link to="/admin/employees" className={linkClass("employees")} onClick={handleLinkClick}>
              Employees
            </Link>

            <Link to="/admin/attendance" className={linkClass("attendance")} onClick={handleLinkClick}>
              Attendance
            </Link>

            <Link to="/admin/leaves" className={linkClass("leaves")} onClick={handleLinkClick}>
              Leave Management
            </Link>

            <Link to="/admin/leave-balance" className={linkClass("leave-balance")} onClick={handleLinkClick}>
              Leave Balance
            </Link>

            <Link to="/admin/settings" className={linkClass("settings")} onClick={handleLinkClick}>
              Settings
            </Link>

            <Link to="/admin/reports" className={linkClass("reports")} onClick={handleLinkClick}>
              Reports
            </Link>
          </nav>
        </div>

        {/* BOTTOM SECTION */}
        <div className="p-4 border-t border-gray-700">
          {/* USER INFO */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold">
              {user?.name ? user.name.charAt(0) : "A"}
            </div>

            <div>
              <p className="text-sm font-semibold">
                {user?.name || "Admin User"}
              </p>
              <p className="text-xs text-gray-400 capitalize">
                {user?.role || "admin"}
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
    </>
  );
}