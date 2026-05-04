import { useEffect, useState } from "react";
import {
  getAttendanceHistory,
  getTodayAttendance
} from "../api/attendanceApi";

export default function EmployeeDashboard({ user }) {

  const [data, setData] = useState(null);     // today's data
  const [recent, setRecent] = useState(null); // latest record
  const [loading, setLoading] = useState(true);

  // ================= FETCH DATA =================
  useEffect(() => {
    const fetchData = async () => {
      try {

        // ✅ 1. Get today's attendance (FAST)
        const todayData = await getTodayAttendance();
        setData(todayData);

        // ✅ 2. Get recent (for right panel)
        const records = await getAttendanceHistory();
        if (records.length > 0) {
          setRecent(records[0]);
        }

      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ================= CALCULATE HOURS =================
  const calculateHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "-";

    const [h1, m1] = checkIn.split(":").map(Number);
    const [h2, m2] = checkOut.split(":").map(Number);

    const totalMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);

    return (totalMinutes / 60).toFixed(2) + "h";
  };

  if (loading) {
    return <div className="p-10">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">
          Hello, {user.name} 👋
        </h1>

        <p className="text-gray-500 text-sm">
          Here's your attendance summary for today
        </p>
      </div>

      {/* TOP CARDS */}
      <div className="grid grid-cols-4 gap-6">

        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-gray-500 text-sm">Today's Status</p>

          <h2 className={`text-xl font-semibold ${
            data?.status === "present" ? "text-green-600" :
            data?.status === "late" ? "text-yellow-600" :
            data?.status === "absent" ? "text-red-600" :
            "text-gray-400"
          }`}>
            {data?.status || "-"}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-gray-500 text-sm">Check In</p>

          <h2 className="text-xl font-semibold">
            {data?.checkIn || "-"}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-gray-500 text-sm">Check Out</p>

          <h2 className="text-xl font-semibold">
            {data?.checkOut || "-"}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-gray-500 text-sm">Working Hours</p>

          <h2 className="text-xl font-semibold">
            {calculateHours(data?.checkIn, data?.checkOut)}
          </h2>
        </div>

      </div>

      {/* MAIN SECTION */}
      <div className="grid grid-cols-2 gap-6">

        {/* LEFT PANEL */}
        <div className="bg-white rounded-xl shadow p-10 flex flex-col items-center justify-center">

          <div className="bg-blue-200 w-16 h-16 flex items-center justify-center rounded-lg mb-4 text-xl">
            ⏰
          </div>

          <h2 className="text-lg font-semibold">
            {data?.checkOut
              ? "You're Done for Today"
              : data?.checkIn
              ? "Don't forget to check out"
              : "You haven't checked in"}
          </h2>

          <p className="text-gray-500 text-sm">
            {data?.checkOut
              ? "See you tomorrow!"
              : data?.checkIn
              ? "Complete your day properly"
              : "Please scan QR to check in"}
          </p>

        </div>

        {/* RIGHT PANEL */}
        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="font-semibold mb-4">
            Recent Attendance
          </h2>

          {recent ? (
            <div className="flex justify-between items-center border-b pb-3 text-sm">

              <div>
                <p>
                  {new Date(recent.date).toLocaleDateString()}
                </p>

                <p className="text-gray-500">
                  {recent.checkIn || "-"} – {recent.checkOut || "-"}
                </p>
              </div>

              <span className={`text-xs px-3 py-1 rounded-full ${
                recent.status === "present"
                  ? "bg-green-100 text-green-600"
                  : recent.status === "late"
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-red-100 text-red-600"
              }`}>
                {recent.status}
              </span>

            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              No recent attendance
            </p>
          )}

        </div>

      </div>

    </div>
  );
}