import { useEffect, useState } from "react";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";

import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../api/employeeApi";

import EmployeeModal from "../components/EmployeeModal";

const Employees = () => {

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [search, setSearch] = useState("");

  const fetchEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (err) {
      console.error("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSubmit = async (formData) => {
    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee._id, formData);
      } else {
        await createEmployee(formData);
      }

      setModalOpen(false);
      setEditingEmployee(null);
      fetchEmployees();

    } catch (err) {
      console.error("Save failed");
    }
  };

  const handleDelete = async (id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (!confirmDelete) return;

    try {
      await deleteEmployee(id);
      fetchEmployees();
    } catch (err) {
      console.error("Delete failed");
    }
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">

        <div>
          <h2 className="text-2xl font-bold">Employees</h2>
          <p className="text-gray-500 text-sm">
            {employees.length} total employees
          </p>
        </div>

        <button
          onClick={() => {
            setEditingEmployee(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={16} />
          Add Employee
        </button>

      </div>

      <div className="flex gap-4">

        <div className="relative flex-1">

          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

        </div>

      </div>

      <div className="bg-white shadow rounded-xl overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="text-left px-6 py-3">Employee</th>
              <th className="text-left px-6 py-3">ID</th>
              <th className="text-left px-6 py-3">Department</th>
              <th className="text-left px-6 py-3">Email</th>

              {/* ✅ NEW COLUMN */}
              <th className="text-left px-6 py-3">Phone</th>

              <th className="text-right px-6 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>

            {filteredEmployees.map((emp) => (

              <tr
                key={emp._id}
                className="border-t hover:bg-gray-50"
              >

                <td className="px-6 py-4 font-medium">
                  {emp.name}
                </td>

                <td className="px-6 py-4">
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {emp.employeeId}
                  </span>
                </td>

                <td className="px-6 py-4">
                  {emp.department}
                </td>

                <td className="px-6 py-4 text-gray-600">
                  {emp.email}
                </td>

                {/* ✅ SHOW PHONE */}
                <td className="px-6 py-4 text-gray-600">
                  {emp.phone}
                </td>

                <td className="px-6 py-4 flex justify-end gap-3">

                  <button
                    onClick={() => {
                      setEditingEmployee(emp);
                      setModalOpen(true);
                    }}
                    className="text-gray-500 hover:text-black"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={() => handleDelete(emp._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      <EmployeeModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingEmployee(null);
        }}
        onSubmit={handleSubmit}
        editingEmployee={editingEmployee}
      />

    </div>
  );
};

export default Employees;