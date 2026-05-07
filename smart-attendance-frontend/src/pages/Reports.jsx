import { useState, useEffect } from "react";
import { generateUserReport, generateAdminReport } from "../api/reportApi";
import { getEmployees } from "../api/employeeApi";

function Reports() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportType, setReportType] = useState("individual"); // individual or all

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handleGenerateIndividualReport = async () => {
    if (!selectedEmployee) {
      alert("Please select an employee");
      return;
    }

    setLoading(true);
    try {
      await generateUserReport(selectedEmployee, startDate, endDate);
      alert("Report downloaded successfully!");
    } catch (error) {
      alert("Failed to generate report. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAllReport = async () => {
    setLoading(true);
    try {
      await generateAdminReport(startDate, endDate);
      alert("Company report downloaded successfully!");
    } catch (error) {
      alert("Failed to generate report. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = () => {
    if (reportType === "individual") {
      handleGenerateIndividualReport();
    } else {
      handleGenerateAllReport();
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">📊 Generate Reports</h1>

      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
        {/* Report Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Report Type
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="reportType"
                value="individual"
                checked={reportType === "individual"}
                onChange={(e) => setReportType(e.target.value)}
                className="mr-2"
              />
              Individual Employee
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="reportType"
                value="all"
                checked={reportType === "all"}
                onChange={(e) => setReportType(e.target.value)}
                className="mr-2"
              />
              All Employees
            </label>
          </div>
        </div>

        {/* Employee Selection (only for individual reports) */}
        {reportType === "individual" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Employee *
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Employee --</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} ({emp.employeeId}) - {emp.department}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Date Range */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range (Optional)
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
            Leave empty to include all records
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
            `📥 Download ${reportType === "individual" ? "Employee" : "Company"} Report (PDF)`
          )}
        </button>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="font-semibold text-blue-900 mb-2">📋 Report Contents:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            {reportType === "individual" ? (
              <>
                <li>✓ Employee information and details</li>
                <li>✓ Attendance summary (present, absent, half-day)</li>
                <li>✓ Working hours statistics</li>
                <li>✓ Detailed attendance records with check-in/out times</li>
                <li>✓ Approved leave records</li>
                <li>✓ Late check-in count</li>
              </>
            ) : (
              <>
                <li>✓ Company-wide attendance overview</li>
                <li>✓ Employee-wise attendance summary</li>
                <li>✓ Department-wise statistics</li>
                <li>✓ Total working hours per employee</li>
                <li>✓ Leave and absence tracking</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Reports;
