import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";

const EmployeeModal = ({ isOpen, onClose, onSubmit, editingEmployee }) => {
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    password: ""
  });

  useEffect(() => {
    if (editingEmployee) {
      setForm({
        name: editingEmployee.name,
        email: editingEmployee.email,
        phone: editingEmployee.phone || "",
        department: editingEmployee.department,
        password: ""
      });
    } else {
      setForm({
        name: "",
        email: "",
        phone: "",
        department: "",
        password: ""
      });
    }
  }, [editingEmployee]);

  if (!isOpen) return null;

  // ✅ UPDATED HANDLE CHANGE (PHONE FIX)
  const handleChange = (e) => {

    const { name, value } = e.target;

    // ✅ Allow only digits for phone
    if (name === "phone") {
      const numericValue = value.replace(/\D/g, ""); // remove letters
      if (numericValue.length <= 10) {
        setForm({
          ...form,
          phone: numericValue
        });
      }
      return;
    }

    setForm({
      ...form,
      [name]: value
    });
  };

  // ✅ UPDATED SUBMIT (VALIDATION)
  const handleSubmit = (e) => {
    e.preventDefault();

    // STRICT PHONE VALIDATION
    if (!/^[0-9]{10}$/.test(form.phone)) {
      alert("Phone number must be exactly 10 digits");
      return;
    }

    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">

      <div className="bg-white width:400px rounded-xl shadow-lg p-6">

        <h2 className="text-lg font-semibold mb-4">
          {editingEmployee ? "Edit Employee" : "Add Employee"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">

          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            required
          />

          <input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            required
          />

          {/* ✅ UPDATED PHONE FIELD */}
          <input
            name="phone"
            placeholder="Phone (10 digits)"
            value={form.phone}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            maxLength={10}
            inputMode="numeric"
            required
          />

          <select
            name="department"
            value={form.department}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            required
          >
            <option value="">Select Department</option>
            <option value="Engineering">Engineering</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
            <option value="HR">HR</option>
          </select>

          {!editingEmployee && (
            <div className="relative">

              <input
                name="password"
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 pr-10"
                required
              />

              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>

              <p className="text-xs text-gray-500 mt-1">
                Temporary password for employee login. Change later.
              </p>

            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              {editingEmployee ? "Update" : "Create"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default EmployeeModal;