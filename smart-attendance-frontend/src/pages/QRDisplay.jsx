import QRCode from "react-qr-code";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";
import jsPDF from "jspdf";
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
      // Get the SVG element from the QR code
      const svgElement = qrRef.current.querySelector("svg");
      if (!svgElement) {
        throw new Error("QR code SVG not found");
      }

      // Convert SVG to canvas
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const svgData = new XMLSerializer().serializeToString(svgElement);
      
      // Create an image from SVG
      const img = new Image();
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        // Set canvas size
        canvas.width = 800;
        canvas.height = 800;
        
        // Draw white background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw QR code
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Create PDF
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

        // Calculate dimensions to center QR code
        const imgWidth = 120;
        const imgHeight = 120;
        const pageWidth = pdf.internal.pageSize.getWidth();
        const x = (pageWidth - imgWidth) / 2;
        const y = 50;

        // Add title
        pdf.setFontSize(22);
        pdf.setFont(undefined, "bold");
        pdf.text("Employee Attendance QR Code", pageWidth / 2, 30, {
          align: "center",
        });

        // Add QR code image
        const imgData = canvas.toDataURL("image/png");
        pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);

        // Add instruction text
        pdf.setFontSize(14);
        pdf.setFont(undefined, "normal");
        pdf.text(
          "Scan this QR code to mark your attendance",
          pageWidth / 2,
          y + imgHeight + 20,
          { align: "center" }
        );

        // Add timestamp
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text(
          `Generated on: ${new Date().toLocaleString()}`,
          pageWidth / 2,
          y + imgHeight + 30,
          { align: "center" }
        );

        // Save PDF
        pdf.save(`attendance-qr-${new Date().toISOString().split("T")[0]}.pdf`);
        
        // Cleanup
        URL.revokeObjectURL(url);
        setIsDownloading(false);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        throw new Error("Failed to load QR code image");
      };

      img.src = url;

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
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

      <div className="bg-white p-10 rounded-xl shadow min-w-[300px] min-h-[300px] flex flex-col items-center justify-center">

        {qrValue ? (
          <div ref={qrRef}>
            <QRCode value={qrValue} size={260} />
          </div>
        ) : (
          <p className="text-gray-500 text-lg text-center">
            {message}
          </p>
        )}

      </div>

      <p className="mt-6 text-gray-600">
        Scan this QR to mark attendance
      </p>

      {qrValue && (
        <button
          onClick={downloadQRAsPDF}
          disabled={isDownloading}
          className="mt-4 flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          <Download size={20} />
          {isDownloading ? "Generating PDF..." : "Download QR as PDF"}
        </button>
      )}

    </div>
  );
}