import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../config/api";

export default function ForgotPassword() {

  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ================= SEND OTP =================
  const sendOtp = async () => {

    setMsg("");
    setError("");

    if (!email) {
      setError("Enter email");
      return;
    }

    // ✅ DOMAIN CHECK (same as login)
    if (
      !email.endsWith("*") &&
      !email.endsWith("@attendify.com")
    ) {
      setError("Use company email only");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        API_ENDPOINTS.AUTH_SEND_OTP,
        { email }
      );

      setMsg(res.data.message);
      setStep(2);

    } catch (err) {
      setError(err.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  // ================= RESET PASSWORD =================
  const resetPassword = async () => {

    setMsg("");
    setError("");

    if (!otp || !newPassword) {
      setError("All fields required");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        API_ENDPOINTS.AUTH_RESET_PASSWORD,
        {
          email,
          otp,
          newPassword
        }
      );

      setMsg(res.data.message);

      // ✅ Redirect after success
      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-6 rounded-xl shadow w-96 space-y-4">

        <h2 className="text-xl font-bold text-center">
          Forgot Password
        </h2>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <input
              type="email"
              placeholder="Enter company email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-2 rounded"
            />

            <button
              onClick={sendOtp}
              disabled={loading}
              className="w-full bg-blue-600 text-white p-2 rounded"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border p-2 rounded"
            />

            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border p-2 rounded"
            />

            <button
              onClick={resetPassword}
              disabled={loading}
              className="w-full bg-green-600 text-white p-2 rounded"
            >
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </>
        )}

        {/* SUCCESS */}
        {msg && (
          <p className="text-sm text-green-600 text-center">
            {msg}
          </p>
        )}

        {/* ERROR */}
        {error && (
          <p className="text-sm text-red-500 text-center">
            {error}
          </p>
        )}

      </div>

    </div>
  );
}