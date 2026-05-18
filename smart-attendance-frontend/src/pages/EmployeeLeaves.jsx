import { useState, useEffect, useContext } from "react";
import { applyLeave, getMyLeaves, cancelLeave, getEmployeeLeaveBalance } from "../api/leaveApi";
import { AuthContext } from "../context/AuthContext";

export default function EmployeeLeaves() {
  const { user } = useContext(AuthContext);
  const [leaves, setLeaves] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    totalRecords: 0
  });

  // Form state
  const [formData, setFormData] = useState({
    leaveType: "sick",
    startDate: "",
    endDate: "",
    reason: ""
  });

  const leaveTypes = [
    { value: "sick", label: "Sick Leave" },
    { value: "casual", label: "Casual Leave" },
    { value: "annual", label: "Annual Leave" },
    { value: "maternity", label: "Maternity Leave" },
    { value: "paternity", label: "Paternity Leave" },
    { value: "emergency", label: "Emergency Leave" },
    { value: "other", label: "Other" }
  ];

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800"
  };

  // Fetch leaves
  const fetchLeaves = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10
      };
      
      if (filter !== "all") {
        params.status = filter;
      }

      const response = await getMyLeaves(params);
      if (response.success) {
        setLeaves(response.data.leaves);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching leaves:", error);
      alert("Failed to fetch leave applications");
    } finally {
      setLoading(false);
    }
  };

  // Fetch leave balance
  const fetchLeaveBalance = async () => {
    if (!user?._id) return;
    
    try {
      setBalanceLoading(true);
      const response = await getEmployeeLeaveBalance(user._id);
      if (response.success) {
        setLeaveBalance(response.data);
      }
    } catch (error) {
      console.error("Error fetching leave balance:", error);
    } finally {
      setBalanceLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
    fetchLeaveBalance();
  }, [filter, user]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.startDate || !formData.endDate || !formData.reason.trim()) {
      alert("Please fill all required fields");
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      alert("End date cannot be before start date");
      return;
    }

    try {
      setLoading(true);
      const response = await applyLeave(formData);
      
      if (response.success) {
        alert("Leave application submitted successfully!");
        setShowApplyForm(false);
        setFormData({
          leaveType: "sick",
          startDate: "",
          endDate: "",
          reason: ""
        });
        fetchLeaves(); // Refresh the list
        fetchLeaveBalance(); // Refresh leave balance
      }
    } catch (error) {
      console.error("Error applying leave:", error);
      const errorMessage = error.response?.data?.message || "Failed to submit leave application";
      
      // Show detailed error message
      if (errorMessage.includes("already marked attendance")) {
        alert(`❌ ${errorMessage}\n\nYou cannot apply for leave on dates where you have already marked attendance.`);
      } else if (errorMessage.includes("overlapping")) {
        alert(`❌ ${errorMessage}\n\nPlease check your existing leave applications.`);
      } else {
        alert(`❌ ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel leave
  const handleCancelLeave = async (leaveId) => {
    if (!confirm("Are you sure you want to cancel this leave application?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await cancelLeave(leaveId);
      
      if (response.success) {
        alert("Leave application cancelled successfully!");
        fetchLeaves(); // Refresh the list
      }
    } catch (error) {
      console.error("Error cancelling leave:", error);
      const errorMessage = error.response?.data?.message || "Failed to cancel leave application";
      
      // Show detailed error message
      if (errorMessage.includes("attendance records created")) {
        alert(`❌ ${errorMessage}\n\nYour leave has been approved and attendance records have been created. Please contact admin to cancel.`);
      } else {
        alert(`❌ ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  // Calculate days between dates
  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  };

  return (
    <div className="p-6">
      {/* Leave Balance Dashboard */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">My Leave Balance</h2>
        
        {balanceLoading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading leave balance...</p>
          </div>
        ) : leaveBalance ? (
          <>
            {/* Detailed Leave Balance - Only Remaining */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Available Leaves - Year {leaveBalance.year}</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 p-6">
                {Object.entries(leaveBalance.leaveBalance).map(([type, balance]) => {
                  const getColorClass = () => {
                    if (balance.remaining === 0) return 'text-red-600 bg-red-50 border-red-200';
                    if (balance.remaining <= 3) return 'text-orange-600 bg-orange-50 border-orange-200';
                    return 'text-green-600 bg-green-50 border-green-200';
                  };

                  return (
                    <div key={type} className={`border-2 rounded-lg p-4 text-center ${getColorClass()}`}>
                      <h4 className="font-semibold capitalize text-sm mb-2">{type}</h4>
                      <div className="text-3xl font-bold mb-1">{balance.remaining}</div>
                      <div className="text-xs font-medium">days left</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No leave balance data available
          </div>
        )}
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Leave Applications</h1>
          <p className="text-gray-600">Manage your leave requests</p>
        </div>
        <button
          onClick={() => setShowApplyForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Apply for Leave
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex gap-2">
          {["all", "pending", "approved", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg capitalize transition ${
                filter === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {status === "all" ? "All Leaves" : status}
            </button>
          ))}
        </div>
      </div>

      {/* Apply Leave Modal */}
      {showApplyForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Apply for Leave</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Leave Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Leave Type *
                </label>
                <select
                  value={formData.leaveType}
                  onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {leaveTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {leaveBalance && leaveBalance.leaveBalance[formData.leaveType] && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                    <span className="font-medium text-blue-900">Available: </span>
                    <span className="text-blue-700">
                      {leaveBalance.leaveBalance[formData.leaveType].remaining} days remaining
                    </span>
                  </div>
                )}
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Days Calculation */}
              {formData.startDate && formData.endDate && (
                <div className="text-sm text-gray-600">
                  Total Days: {calculateDays(formData.startDate, formData.endDate)}
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason *
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Please provide reason for leave..."
                  rows={3}
                  maxLength={500}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <div className="text-xs text-gray-500 mt-1">
                  {formData.reason.length}/500 characters
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowApplyForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leave Applications List */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        ) : leaves.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No leave applications found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Leave Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 capitalize">
                        {leave.leaveType}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {leave.reason}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {leave.totalDays}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${statusColors[leave.status]}`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(leave.appliedDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {leave.status === "pending" && (
                        <button
                          onClick={() => handleCancelLeave(leave._id)}
                          className="text-red-600 hover:text-red-900 transition"
                        >
                          Cancel
                        </button>
                      )}
                      {leave.status !== "pending" && leave.adminComments && (
                        <div className="text-xs text-gray-500">
                          Admin: {leave.adminComments}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.total > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {leaves.length} of {pagination.totalRecords} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchLeaves(pagination.current - 1)}
                disabled={pagination.current === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm">
                Page {pagination.current} of {pagination.total}
              </span>
              <button
                onClick={() => fetchLeaves(pagination.current + 1)}
                disabled={pagination.current === pagination.total}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}