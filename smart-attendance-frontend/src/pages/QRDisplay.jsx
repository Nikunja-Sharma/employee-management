import QRCode from "react-qr-code";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Download } from "lucide-react";

export default function QRDisplay() {

  const [qrValue, setQrValue] = useState(null);
  const [message, setMessage] = useState("Loading...");
  const [isDownloading, setIsDownloading] = useState(false);
  const qrRef = useRef(null);

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

  const downloadQRAsPDF = async () => {
    if (!qrRef.current || !qrValue) return;

    setIsDownloading(true);

    try {
      // Capture the QR code container as canvas
      const canvas = await html2canvas(qrRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      });

      // Create PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Calculate dimensions to center QR code
      const imgWidth = 150;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const x = (pdf.internal.pageSize.getWidth() - imgWidth) / 2;
      const y = 30;

      // Add title
      pdf.setFontSize(20);
      pdf.text("Employee Attendance QR Code", pdf.internal.pageSize.getWidth() / 2, 20, {
        align: "center",
      });

      // Add QR code image
      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);

      // Add footer text
      pdf.setFontSize(12);
      pdf.text(
        "Scan this QR code to mark your attendance",
        pdf.internal.pageSize.getWidth() / 2,
        y + imgHeight + 15,
        { align: "center" }
      );

      // Add timestamp
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      pdf.text(
        `Generated on: ${new Date().toLocaleString()}`,
        pdf.internal.pageSize.getWidth() / 2,
        y + imgHeight + 25,
        { align: "center" }
      );

      // Save PDF
      pdf.save(`attendance-qr-${new Date().toISOString().split("T")[0]}.pdf`);

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {

    fetchQR();

    // 🔥 FIX: Faster refresh (every 5 seconds)
    const interval = setInterval(fetchQR, 5000);

    return () => clearInterval(interval);

  }, []);

  return (

    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 py-8">

      <h1 className="text-3xl font-bold mb-6">
        Employee Attendance QR
      </h1>

      <div 
        ref={qrRef}
        className="bg-white p-10 rounded-xl shadow min-w-[300px] min-h-[300px] flex flex-col items-center justify-center"
      >

        {qrValue ? (
          <>
            <QRCode value={qrValue} size={260} />
            <p className="mt-4 text-gray-600 text-center">
              Scan this QR to mark attendance
            </p>
          </>
        ) : (
          <p className="text-gray-500 text-lg text-center">
            {message}
          </p>
        )}

      </div>

      {qrValue && (
        <button
          onClick={downloadQRAsPDF}
          disabled={isDownloading}
          className="mt-6 flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          <Download size={20} />
          {isDownloading ? "Generating PDF..." : "Download QR as PDF"}
        </button>
      )}

    </div>
  );
}