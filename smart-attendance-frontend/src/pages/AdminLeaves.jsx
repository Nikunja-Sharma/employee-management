import { useState, useEffect } from "react";
import { getAllLeaves, reviewLeave, getLeaveStats } from "../api/leaveApi";
import { getEmployeeLeaveBalance } from "../api/leaveBalanceApi";

export default function AdminLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [employeeBalance, setEmployeeBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    status: "approved",
    adminComments: ""
  });

  // Filters
  const [filters, setFilters] = useState({
    status: "all",
    employeeId: "",
    leaveType: "all",
    page: 1
  });

  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    totalRecords: 0
  });

  const leaveTypes = [
    { value: "all", label: "All Types" },
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

      if (filters.status !== "all") params.status = filters.status;
      if (filters.employeeId) params.employeeId = filters.employeeId;
      if (filters.leaveType !== "all") params.leaveType = filters.leaveType;

      const response = await getAllLeaves(params);
      if (response.success) {
        setLeaves(response.data.leaves);
        setPagination(response.data.pagination);
        
        // Update stats from summary
        if (response.data.summary) {
          setStats(response.data.summary);
        }
      }
    } catch (error) {
      console.error("Error fetching leaves:", error);
      alert("Failed to fetch leave applications");
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await getLeaveStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [filters.status, filters.leaveType]);

  useEffect(() => {
    fetchStats();
  }, []);

  // Handle search
  const handleSearch = () => {
    setFilters({ ...filters, page: 1 });
    fetchLeaves(1);
  };

  // Handle review
  const handleReview = async () => {
    if (!selectedLeave || !reviewData.status) {
      alert("Please select status");
      return;
    }

    // Check if approving and insufficient balance
    if (reviewData.status === "approved" && employeeBalance) {
      const leaveType = selectedLeave.leaveType;
      const requestedDays = selectedLeave.totalDays;
      const availableDays = employeeBalance.leaveBalance[leaveType]?.remaining || 0;
      
      if (availableDays < requestedDays) {
        if (!confirm(`⚠️ Warning: Employee has only ${availableDays} ${leaveType} leave(s) remaining, but requested ${requestedDays} day(s).\n\nDo you still want to approve this leave?`)) {
          return;
        }
      }
    }

    try {
      setLoading(true);
      const response = await reviewLeave(selectedLeave._id, reviewData);
      
      if (response.success) {
        // Show success message with attendance record info
        const message = response.message || `Leave application ${reviewData.status} successfully!`;
        alert(`✅ ${message}`);
        
        setShowReviewModal(false);
        setSelectedLeave(null);
        setEmployeeBalance(null);
        setReviewData({ status: "approved", adminComments: "" });
        fetchLeaves(filters.page); // Refresh current page
        fetchStats(); // Refresh stats
      }
    } catch (error) {
      console.error("Error reviewing leave:", error);
      alert(error.response?.data?.message || "Failed to review leave application");
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

  // Open review modal
  const openReviewModal = async (leave) => {
    setSelectedLeave(leave);
    setReviewData({ status: "approved", adminComments: "" });
    setShowReviewModal(true);
    
    // Fetch employee's leave balance
    if (leave.employee?._id) {
      try {
        setLoadingBalance(true);
        const response = await getEmployeeLeaveBalance(leave.employee._id);
        if (response.success) {
          setEmployeeBalance(response.data);
        }
      } catch (error) {
        console.error("Error fetching employee balance:", error);
        setEmployeeBalance(null);
      } finally {
        setLoadingBalance(false);
      }
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
        <p className="text-gray-600">Review and manage employee leave applications</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-900">{stats.total || 0}</div>
            <div className="text-sm text-gray-600">Total Applications</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</div>
            <div className="text-sm text-gray-600">Pending Review</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{stats.approved || 0}</div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-red-600">{stats.rejected || 0}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Leave Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
            <select
              value={filters.leaveType}
              onChange={(e) => setFilters({ ...filters, leaveType: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {leaveTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Employee ID Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
            <input
              type="text"
              value={filters.employeeId}
              onChange={(e) => setFilters({ ...filters, employeeId: e.target.value })}
              placeholder="Search by Employee ID"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedLeave && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Review Leave Application</h2>
            
            {/* Leave Details */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm space-y-2">
                <div><strong>Employee:</strong> {selectedLeave.employee?.name} ({selectedLeave.employee?.employeeId})</div>
                <div><strong>Department:</strong> {selectedLeave.employee?.department}</div>
                <div><strong>Type:</strong> <span className="capitalize">{selectedLeave.leaveType}</span></div>
                <div><strong>Dates:</strong> {formatDate(selectedLeave.startDate)} - {formatDate(selectedLeave.endDate)}</div>
                <div><strong>Days:</strong> {selectedLeave.totalDays}</div>
                <div><strong>Reason:</strong> {selectedLeave.reason}</div>
              </div>
            </div>

            {/* Employee Leave Balance */}
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-900 mb-3">📊 Employee Leave Balance</h3>
              
              {loadingBalance ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-xs text-gray-600 mt-2">Loading balance...</p>
                </div>
              ) : employeeBalance ? (
                <div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                    {Object.entries(employeeBalance.leaveBalance).map(([type, balance]) => {
                      const isRequestedType = type === selectedLeave.leaveType;
                      const willExceed = isRequestedType && balance.remaining < selectedLeave.totalDays;
                      
                      return (
                        <div 
                          key={type} 
                          className={`p-2 rounded text-xs ${
                            isRequestedType 
                              ? willExceed 
                                ? 'bg-red-100 border-2 border-red-400' 
                                : 'bg-green-100 border-2 border-green-400'
                              : 'bg-white border border-gray-200'
                          }`}
                        >
                          <p className="font-medium capitalize text-gray-700">{type}</p>
                          <p className="text-lg font-bold text-gray-900">
                            {balance.remaining}/{balance.total}
                          </p>
                          <p className="text-gray-600">Used: {balance.used}</p>
                          {isRequestedType && (
                            <p className={`mt-1 font-semibold ${willExceed ? 'text-red-600' : 'text-green-600'}`}>
                              {willExceed ? '⚠️ Insufficient!' : '✓ Available'}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Warning if insufficient balance */}
                  {employeeBalance.leaveBalance[selectedLeave.leaveType]?.remaining < selectedLeave.totalDays && (
                    <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-800">
                      <strong>⚠️ Warning:</strong> Employee has only{' '}
                      <strong>{employeeBalance.leaveBalance[selectedLeave.leaveType]?.remaining}</strong>{' '}
                      {selectedLeave.leaveType} leave(s) remaining, but requested{' '}
                      <strong>{selectedLeave.totalDays}</strong> day(s).
                      {reviewData.status === "approved" && (
                        <span className="block mt-1">
                          Approving will result in negative balance.
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Summary */}
                  <div className="mt-3 pt-3 border-t border-blue-200 text-xs text-gray-600">
                    <strong>Total:</strong> {employeeBalance.summary.totalRemaining}/{employeeBalance.summary.totalAllocated} days remaining
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600">Unable to load leave balance</p>
              )}
            </div>

            {/* Review Form */}
            <div className="space-y-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Decision *
                </label>
                <select
                  value={reviewData.status}
                  onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="approved">Approve</option>
                  <option value="rejected">Reject</option>
                </select>
              </div>

              {/* Admin Comments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comments (Optional)
                </label>
                <textarea
                  value={reviewData.adminComments}
                  onChange={(e) => setReviewData({ ...reviewData, adminComments: e.target.value })}
                  placeholder="Add comments for the employee..."
                  rows={3}
                  maxLength={500}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {reviewData.adminComments.length}/500 characters
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewModal(false);
                    setEmployeeBalance(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReview}
                  disabled={loading}
                  className={`flex-1 py-2 rounded-lg transition disabled:opacity-50 ${
                    reviewData.status === "approved"
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  {loading ? "Processing..." : `${reviewData.status === "approved" ? "Approve" : "Reject"} Leave`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leave Applications Table */}
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
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Leave Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied
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
                      <div className="text-sm font-medium text-gray-900">
                        {leave.employee?.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {leave.employee?.employeeId}
                      </div>
                      <div className="text-xs text-gray-500">
                        {leave.employee?.department}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 capitalize">
                        {leave.leaveType} ({leave.totalDays} days)
                      </div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {leave.reason}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{formatDate(leave.startDate)}</div>
                      <div className="text-gray-500">to {formatDate(leave.endDate)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${statusColors[leave.status]}`}>
                        {leave.status}
                      </span>
                      {leave.reviewedBy && (
                        <div className="text-xs text-gray-500 mt-1">
                          by {leave.reviewedBy.name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(leave.appliedDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {leave.status === "pending" ? (
                        <button
                          onClick={() => openReviewModal(leave)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition"
                        >
                          Review
                        </button>
                      ) : (
                        <div className="text-xs text-gray-500">
                          {leave.adminComments && (
                            <div>Comments: {leave.adminComments}</div>
                          )}
                          {leave.reviewedDate && (
                            <div>Reviewed: {formatDate(leave.reviewedDate)}</div>
                          )}
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