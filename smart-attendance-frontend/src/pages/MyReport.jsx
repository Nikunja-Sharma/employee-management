import { useState, useContext } from "react";
import { generateUserReport } from "../api/reportApi";
import { AuthContext } from "../context/AuthContext";

function MyReport() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleGenerateReport = async () => {
    if (!user?._id) {
      alert("User information not found. Please login again.");
      return;
    }

    setLoading(true);
    try {
      await generateUserReport(user._id, startDate, endDate);
      alert("Your attendance report has been downloaded successfully!");
    } catch (error) {
      alert("Failed to generate report. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">📊 My Attendance Report</h1>

      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
        {/* User Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-md">
          <h2 className="font-semibold text-gray-700 mb-2">Your Information</h2>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Employee ID:</strong> {user?.employeeId}</p>
            <p><strong>Department:</strong> {user?.department}</p>
            <p><strong>Email:</strong> {user?.email}</p>
          </div>
        </div>

        {/* Date Range */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Date Range (Optional)
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Leave empty to download your complete attendance history
          </p>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerateReport}
          disabled={loading}
          className={`w-full py-3 rounded-md text-white font-medium transition-colors ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin h-5 w-5 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Generating PDF...
            </span>
          ) : (
            "📥 Download My Report (PDF)"
          )}
        </button>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="font-semibold text-blue-900 mb-2">📋 Your Report Will Include:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ Your complete attendance summary</li>
            <li>✓ Total present, absent, and half-day records</li>
            <li>✓ Total working hours and daily average</li>
            <li>✓ Detailed check-in and check-out times</li>
            <li>✓ All approved leave records</li>
            <li>✓ Late check-in statistics</li>
            <li>✓ Photo capture status for each attendance</li>
          </ul>
        </div>

        {/* Quick Date Presets */}
        <div className="mt-6">
          <p className="text-sm font-medium text-gray-700 mb-2">Quick Presets:</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                const today = new Date();
                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                setStartDate(firstDay.toISOString().split("T")[0]);
                setEndDate(today.toISOString().split("T")[0]);
              }}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
            >
              This Month
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
                setStartDate(lastMonth.toISOString().split("T")[0]);
                setEndDate(lastMonthEnd.toISOString().split("T")[0]);
              }}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
            >
              Last Month
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, 1);
                setStartDate(threeMonthsAgo.toISOString().split("T")[0]);
                setEndDate(today.toISOString().split("T")[0]);
              }}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
            >
              Last 3 Months
            </button>
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
            >
              All Time
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyReport;
