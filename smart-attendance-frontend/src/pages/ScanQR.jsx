import { useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";

export default function ScanQR() {

  const scannerRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [scannerStarted, setScannerStarted] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const startScanner = async () => {
    if (scannerStarted) return;

    const cameras = await Html5Qrcode.getCameras();
    const cameraId = cameras[0].id;

    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    await scanner.start(cameraId, { fps: 10, qrbox: 250 },

      async (decodedText) => {

        await scanner.stop();
        await scanner.clear();
        setScannerStarted(false);

        // 👉 OPEN CAMERA
        setShowCamera(true);

        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;

        // Save QR for later
        window.scannedQR = decodedText;
      }
    );

    setScannerStarted(true);
  };

  // ================= CAPTURE PHOTO =================
  const capturePhoto = async () => {

    setLoading(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const photo = canvas.toDataURL("image/jpeg");

    // stop camera
    video.srcObject.getTracks().forEach(track => track.stop());

    navigator.geolocation.getCurrentPosition(async (pos) => {

      try {

        const res = await axios.post(
          API_ENDPOINTS.ATTENDANCE_SCAN,
          {
            qr: window.scannedQR,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            photo   // ✅ send photo
          },
          { withCredentials: true }
        );

        setMessage(`✅ ${res.data.message}`);

      } catch (err) {
        const errorData = err?.response?.data;
        
        // Check if it's a leave day error
        if (errorData?.leaveType && errorData?.leaveDates) {
          setMessage(`⚠️ ${errorData.message}\nLeave Type: ${errorData.leaveType}\nDates: ${errorData.leaveDates}`);
        } else {
          setMessage(errorData?.message || "Failed");
        }
      }

      setLoading(false);
      setShowCamera(false);

    });
  };

  return (

    <div className="flex flex-col items-center justify-center h-full">

      <h1 className="text-2xl font-bold mb-6">
        Scan QR to Mark Attendance
      </h1>

      {!scannerStarted && !showCamera && (
        <button onClick={startScanner} className="bg-blue-600 text-white px-6 py-3 rounded-lg">
          Start Scanner
        </button>
      )}

      <div id="reader" style={{ width: "350px", marginTop: "20px" }} />

      {showCamera && (
        <div className="mt-6 flex flex-col items-center">

          <video ref={videoRef} autoPlay className="w-72 rounded" />
          <canvas ref={canvasRef} style={{ display: "none" }} />

          <button
            onClick={capturePhoto}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
          >
            Capture & Submit
          </button>

        </div>
      )}

      {loading && <p className="mt-4">Processing...</p>}

      {message && (
        <div className={`mt-4 p-4 rounded shadow max-w-md ${
          message.includes('✅') ? 'bg-green-50 text-green-800' : 
          message.includes('⚠️') ? 'bg-yellow-50 text-yellow-800' : 
          'bg-red-50 text-red-800'
        }`}>
          <div className="whitespace-pre-line">{message}</div>
        </div>
      )}

    </div>
  );
}