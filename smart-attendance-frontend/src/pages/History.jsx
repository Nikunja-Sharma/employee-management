import { useEffect, useState } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { API_ENDPOINTS } from "../config/api";

export default function History() {

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);

  // =======================
  // FETCH DATA
  // =======================
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(
          API_ENDPOINTS.ATTENDANCE_HISTORY,
          { withCredentials: true }
        );
        setRecords(res.data);
      } catch (err) {
        console.error("Error fetching history", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // =======================
  // HOURS
  // =======================
  const calculateHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "-";

    const [inH, inM] = checkIn.split(":").map(Number);
    const [outH, outM] = checkOut.split(":").map(Number);

    const diff = (outH * 60 + outM) - (inH * 60 + inM);
    return (diff / 60).toFixed(2) + "h";
  };

  // =======================
  // STATUS BADGE
  // =======================
  const getStatusBadge = (status) => {
    if (status === "present") return "bg-green-100 text-green-600";
    if (status === "late") return "bg-yellow-100 text-yellow-600";
    if (status === "absent") return "bg-red-100 text-red-600";
    if (status === "on-leave") return "bg-blue-100 text-blue-600";
    return "bg-gray-100 text-gray-600";
  };

  // =======================
  // FILTER
  // =======================
  const filteredRecords = records.filter((item) => {
    if (!selectedDate) return true;

    return (
      new Date(item.date).toISOString().slice(0, 10) === selectedDate
    );
  });

  // =======================
  // CALENDAR COLORS
  // =======================
  const getTileClass = ({ date, view }) => {
    if (view !== "month") return "";

    const record = records.find((r) => {
      const d = new Date(r.date);
      return (
        d.getFullYear() === date.getFullYear() &&
        d.getMonth() === date.getMonth() &&
        d.getDate() === date.getDate()
      );
    });

    if (!record) return "";

    if (record.status === "present") return "present-day";
    if (record.status === "absent") return "absent-day";
    if (record.status === "late") return "late-day";
    if (record.status === "on-leave") return "leave-day";

    return "";
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">

        <div>
          <h1 className="text-2xl font-bold">Attendance History</h1>
          <p className="text-gray-500 text-sm">
            {filteredRecords.length} records
          </p>
        </div>

        <div className="flex gap-3">

          {/* DATE FILTER */}
          <input
            type="date"
            className="border px-4 py-2 rounded-lg"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />

          {/* TOGGLE */}
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            {showCalendar ? "Table View" : "Calendar View"}
          </button>

        </div>

      </div>

      {/* ================= CALENDAR VIEW ================= */}
      {showCalendar && (
        <div className="bg-white/40 backdrop-blur-lg rounded-2xl shadow-xl p-10 flex flex-col items-center">

          {/* LEGEND */}
          <div className="flex justify-center gap-8 mb-6 text-sm font-medium">

            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              Present
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              Absent
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
              Late
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              On Leave
            </div>

          </div>

          {/* CALENDAR */}
          <Calendar tileClassName={getTileClass} />

        </div>
      )}

      {/* ================= TABLE VIEW ================= */}
      {!showCalendar && (
        <div className="bg-white rounded-xl shadow overflow-hidden">

          {loading ? (
            <p className="p-4 text-gray-500">Loading...</p>
          ) : filteredRecords.length === 0 ? (
            <p className="p-4 text-gray-500">No attendance found</p>
          ) : (

            <table className="w-full text-sm">

              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="text-left p-4">Date</th>
                  <th className="text-left p-4">Check In</th>
                  <th className="text-left p-4">Check Out</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Hours</th>
                </tr>
              </thead>

              <tbody>

                {filteredRecords.map((item, index) => (
                  <tr key={index} className="border-t">

                    <td className="p-4">
                      {new Date(item.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      })}
                    </td>

                    <td className="p-4">{item.checkIn || "-"}</td>
                    <td className="p-4">{item.checkOut || "-"}</td>

                    <td className="p-4">
                      <span
                        className={`text-xs px-3 py-1 rounded-full ${getStatusBadge(item.status)}`}
                      >
                        {item.status === "on-leave" ? "On Leave" : item.status}
                      </span>
                      {item.reason && (
                        <div className="text-xs text-gray-500 mt-1">
                          {item.reason}
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      {calculateHours(item.checkIn, item.checkOut)}
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          )}

        </div>
      )}

    </div>
  );
}