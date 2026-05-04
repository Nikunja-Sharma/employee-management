import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("All fields are required");
      return;
    }

    // ✅ UPDATED DOMAIN VALIDATION
    if (
      !email.endsWith("@webcraft.com") &&
      !email.endsWith("@attendify.com")
    ) {
      setError("Use company email (@webcraft.com or @attendify.com)");
      return;
    }

    setLoading(true);

    const result = await login(email, password);

    if (!result.success) {
      setError(result.message);
      setLoading(false);
      return;
    }

    if (result.user.role === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/employee/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex">

      <div className="w-1/2 flex items-center justify-center bg-white p-10">

        <div className="w-full max-w-md">

          <h1 className="text-4xl font-bold text-[#0B1F3A] mb-2">
            Login
          </h1>

          <p className="text-gray-600 mb-6">
            Welcome Back
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              type="email"
              placeholder="Company Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
            />

            {/* ✅ ADDED FORGOT PASSWORD LINK (ONLY ADDITION) */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {error && (
              <p className="text-red-500 text-sm">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

          </form>

        </div>
      </div>

      <div className="w-1/2 bg-linear-to-br from-[#0B1F3A] via-[#102A4C] to-[#1C3D72] text-white flex items-center justify-center">

        <div className="text-center px-10">

          <h2 className="text-5xl font-bold mb-4">
            ATTENDIFY
          </h2>

          <p className="text-lg opacity-80">
            "Attendance is the first step to success,
            <br />
            be present to win."
          </p>

        </div>

      </div>

    </div>
  );
}