import { useState, useEffect } from 'react';
import { getAllEmployeesLeaveBalance, getLeaveBalanceStats, updateEmployeeLeaveBalance, resetLeaveBalanceForYear } from '../api/leaveBalanceApi';
import { Search, RefreshCw, Edit2, Calendar, TrendingUp, Users, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

const LeaveBalance = () => {
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editLeaveType, setEditLeaveType] = useState('');
  const [editTotal, setEditTotal] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetYear, setResetYear] = useState(new Date().getFullYear() + 1);
  const [expandedEmployee, setExpandedEmployee] = useState(null);

  useEffect(() => {
    fetchData();
  }, [searchTerm, selectedDepartment]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [employeesData, statsData] = await Promise.all([
        getAllEmployeesLeaveBalance({ search: searchTerm, department: selectedDepartment }),
        getLeaveBalanceStats()
      ]);
      setEmployees(employeesData.data.employees || []);
      setStats(statsData.data || null);
    } catch (error) {
      console.error('Error fetching leave balance data:', error);
      
      // Check if it's an authentication error
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        window.location.href = '/login';
      } else {
        alert('Failed to fetch leave balance data. Please try again.');
        setEmployees([]);
        setStats(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditLeaveBalance = (employee) => {
    setEditingEmployee(employee);
    setEditLeaveType('');
    setEditTotal('');
  };

  const handleUpdateLeaveBalance = async () => {
    if (!editLeaveType || !editTotal) {
      alert('Please select leave type and enter total days');
      return;
    }

    try {
      await updateEmployeeLeaveBalance(editingEmployee.id, {
        leaveType: editLeaveType,
        total: parseInt(editTotal)
      });
      alert('Leave balance updated successfully');
      setEditingEmployee(null);
      fetchData();
    } catch (error) {
      console.error('Error updating leave balance:', error);
      alert(error.response?.data?.message || 'Failed to update leave balance');
    }
  };

  const handleResetLeaveBalance = async () => {
    if (!window.confirm(`Are you sure you want to reset leave balance for all employees for year ${resetYear}? This will reset all used leaves to 0.`)) {
      return;
    }

    try {
      const response = await resetLeaveBalanceForYear({ year: resetYear });
      alert(response.message);
      setShowResetModal(false);
      fetchData();
    } catch (error) {
      console.error('Error resetting leave balance:', error);
      alert(error.response?.data?.message || 'Failed to reset leave balance');
    }
  };

  const getLeaveTypeColorForModal = (leaveType) => {
    const colors = {
      casual: 'bg-blue-100 text-blue-800',
      sick: 'bg-red-100 text-red-800',
      annual: 'bg-green-100 text-green-800',
      emergency: 'bg-orange-100 text-orange-800',
      maternity: 'bg-pink-100 text-pink-800',
      paternity: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[leaveType] || colors.other;
  };

  const getUsagePercentage = (used, total) => {
    return total > 0 ? Math.round((used / total) * 100) : 0;
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-orange-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getLeaveTypeColor = (leaveType) => {
    const colors = {
      casual: 'bg-blue-50 border-blue-200',
      sick: 'bg-red-50 border-red-200',
      annual: 'bg-green-50 border-green-200',
      emergency: 'bg-orange-50 border-orange-200',
      maternity: 'bg-pink-50 border-pink-200',
      paternity: 'bg-purple-50 border-purple-200',
      other: 'bg-gray-50 border-gray-200'
    };
    return colors[leaveType] || colors.other;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Leave Balance Management</h1>
          <p className="text-gray-600 mt-1">Track and manage employee leave allocations</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
          <button
            onClick={() => setShowResetModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            <Calendar size={18} />
            Reset for New Year
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Employees</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalEmployees}</p>
              </div>
              <Users className="text-blue-500" size={40} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Allocated</p>
                <p className="text-3xl font-bold text-gray-800">{stats.overall.totalAllocated}</p>
              </div>
              <TrendingUp className="text-green-500" size={40} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Used</p>
                <p className="text-3xl font-bold text-gray-800">{stats.overall.totalUsed}</p>
              </div>
              <Calendar className="text-orange-500" size={40} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Remaining</p>
                <p className="text-3xl font-bold text-gray-800">{stats.overall.totalRemaining}</p>
              </div>
              <AlertCircle className="text-purple-500" size={40} />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, employee ID, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Departments</option>
            <option value="IT">IT</option>
            <option value="HR">HR</option>
            <option value="Finance">Finance</option>
            <option value="Marketing">Marketing</option>
            <option value="Operations">Operations</option>
          </select>
        </div>
      </div>

      {/* Employee Leave Balance Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Allocated
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Used
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Remaining
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage %
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((employee) => {
                const usagePercentage = getUsagePercentage(
                  employee.summary.totalUsed,
                  employee.summary.totalAllocated
                );
                const isExpanded = expandedEmployee === employee.id;

                return (
                  <>
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setExpandedEmployee(isExpanded ? null : employee.id)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </button>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                            <div className="text-sm text-gray-500">{employee.employeeId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                          {employee.department}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {employee.summary.totalAllocated}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {employee.summary.totalUsed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-green-600">
                        {employee.summary.totalRemaining}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`text-sm font-bold ${getUsageColor(usagePercentage)}`}>
                          {usagePercentage}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleEditLeaveBalance(employee)}
                          className="p-2 bg-white border border-gray-300 rounded-lg text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition"
                        >
                          <Edit2 size={18} />
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded Row - Leave Details */}
                    {isExpanded && (
                      <tr key={`${employee.id}-details`}>
                        <td colSpan="7" className="px-6 py-4 bg-gray-50">
                          <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">
                              📊 Detailed Leave Breakdown for {employee.name}
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {Object.entries(employee.leaveBalance).map(([type, balance]) => {
                                const typeUsagePercentage = getUsagePercentage(balance.used, balance.total);
                                const typeColor = getLeaveTypeColor(type);
                                
                                return (
                                  <div key={type} className={`p-3 rounded-lg border-2 ${typeColor}`}>
                                    <div className="flex items-center justify-between mb-2">
                                      <p className="text-xs font-semibold uppercase text-gray-700">{type}</p>
                                      <span className={`text-xs font-bold ${getUsageColor(typeUsagePercentage)}`}>
                                        {typeUsagePercentage}%
                                      </span>
                                    </div>
                                    <div className="space-y-1">
                                      <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Total:</span>
                                        <span className="font-semibold text-gray-900">{balance.total} days</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Used:</span>
                                        <span className="font-semibold text-red-600">🔥 {balance.used} days</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Remaining:</span>
                                        <span className="font-semibold text-green-600">✓ {balance.remaining} days</span>
                                      </div>
                                    </div>
                                    {/* Progress Bar */}
                                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                      <div 
                                        className={`h-2 rounded-full ${
                                          typeUsagePercentage >= 90 ? 'bg-red-500' :
                                          typeUsagePercentage >= 70 ? 'bg-orange-500' :
                                          typeUsagePercentage >= 50 ? 'bg-yellow-500' :
                                          'bg-green-500'
                                        }`}
                                        style={{ width: `${typeUsagePercentage}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            
                            {/* Summary */}
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-semibold text-blue-900">Total Leaves Burned:</span>
                                <span className="text-lg font-bold text-red-600">🔥 {employee.summary.totalUsed} days</span>
                              </div>
                              <div className="flex items-center justify-between text-sm mt-1">
                                <span className="font-semibold text-blue-900">Total Remaining:</span>
                                <span className="text-lg font-bold text-green-600">✓ {employee.summary.totalRemaining} days</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

        {employees.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No employees found</p>
          </div>
        )}
      </div>

      {/* Edit Leave Balance Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              Edit Leave Balance - {editingEmployee.name}
            </h2>

            {/* Current Leave Balance */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Current Leave Balance</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(editingEmployee.leaveBalance).map(([type, balance]) => (
                  <div key={type} className={`p-3 rounded-lg ${getLeaveTypeColorForModal(type)}`}>
                    <p className="text-xs font-medium uppercase">{type}</p>
                    <p className="text-lg font-bold">{balance.remaining}/{balance.total}</p>
                    <p className="text-xs">Used: {balance.used}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Edit Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Leave Type
                </label>
                <select
                  value={editLeaveType}
                  onChange={(e) => setEditLeaveType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Leave Type</option>
                  <option value="casual">Casual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="annual">Annual Leave</option>
                  <option value="emergency">Emergency Leave</option>
                  <option value="maternity">Maternity Leave</option>
                  <option value="paternity">Paternity Leave</option>
                  <option value="other">Other Leave</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Total Days
                </label>
                <input
                  type="number"
                  min="0"
                  value={editTotal}
                  onChange={(e) => setEditTotal(e.target.value)}
                  placeholder="Enter new total days"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => setEditingEmployee(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateLeaveBalance}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Balance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Leave Balance Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Reset Leave Balance</h2>
            <p className="text-gray-600 mb-4">
              This will reset all employees' leave balance for the new year. All used leaves will be set to 0 and remaining leaves will be restored to default values.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <input
                type="number"
                min="2020"
                max="2100"
                value={resetYear}
                onChange={(e) => setResetYear(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> This action will reset leave balance for all employees. This cannot be undone.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResetLeaveBalance}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Reset Balance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveBalance;
