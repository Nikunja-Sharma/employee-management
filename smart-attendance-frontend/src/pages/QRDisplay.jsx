import QRCode from "react-qr-code";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";

export default function QRDisplay() {

  const [qrValue, setQrValue] = useState(null);
  const [message, setMessage] = useState("Loading...");

  const fetchQR = async () => {
    try {

      const res = await axios.get(
        API_ENDPOINTS.QR_CURRENT
      );

      const data = res.data;

      // ✅ IMPORTANT: Always reset first
      if (!data.active) {
        setQrValue(null);
        setMessage("QR is not active now");
        return;
      }

      // ✅ Update QR
      setQrValue(JSON.stringify(data.qr));
      setMessage("");

    } catch (err) {
      console.error("QR fetch error:", err);
      setQrValue(null);
      setMessage("Unable to load QR");
    }
  };

  useEffect(() => {

    fetchQR();

    // 🔥 FIX: Faster refresh (every 5 seconds)
    const interval = setInterval(fetchQR, 5000);

    return () => clearInterval(interval);

  }, []);

  return (

    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">

      <h1 className="text-3xl font-bold mb-6">
        Employee Attendance QR
      </h1>

      <div className="bg-white p-10 rounded-xl shadow min-w-[300px] min-h-[300px] flex items-center justify-center">

        {qrValue ? (
          <QRCode value={qrValue} size={260} />
        ) : (
          <p className="text-gray-500 text-lg text-center">
            {message}
          </p>
        )}

      </div>

      <p className="mt-6 text-gray-600">
        Scan this QR to mark attendance
      </p>

    </div>
  );
}