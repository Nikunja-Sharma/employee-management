const PDFDocument = require("pdfkit");
const Attendance = require("../models/Attendance");
const User = require("../models/User");
const Leave = require("../models/Leave");

// ================= GENERATE USER ATTENDANCE REPORT =================
exports.generateUserReport = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    // Validate user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.$lte = end;
    }

    // Fetch attendance records
    const attendanceRecords = await Attendance.find({
      employee: userId,
      ...(Object.keys(dateFilter).length > 0 && { date: dateFilter })
    }).sort({ date: -1 });

    // Fetch leave records
    const leaveRecords = await Leave.find({
      employee: userId,
      status: "approved",
      ...(Object.keys(dateFilter).length > 0 && {
        $or: [
          { startDate: dateFilter },
          { endDate: dateFilter }
        ]
      })
    }).sort({ startDate: -1 });

    // Calculate statistics
    const stats = calculateStats(attendanceRecords, leaveRecords);

    // Generate PDF
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=attendance-report-${user.employeeId}-${Date.now()}.pdf`
    );

    // Pipe PDF to response
    doc.pipe(res);

    // Generate PDF content
    generatePDFContent(doc, user, attendanceRecords, leaveRecords, stats, startDate, endDate);

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error("Report generation error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= GENERATE ADMIN REPORT (ALL USERS) =================
exports.generateAdminReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.$lte = end;
    }

    // Fetch all employees
    const employees = await User.find({ role: "employee" }).sort({ employeeId: 1 });

    // Fetch all attendance records
    const attendanceRecords = await Attendance.find({
      ...(Object.keys(dateFilter).length > 0 && { date: dateFilter })
    }).populate("employee", "name employeeId department");

    // Fetch all leave records
    const leaveRecords = await Leave.find({
      status: "approved",
      ...(Object.keys(dateFilter).length > 0 && {
        $or: [
          { startDate: dateFilter },
          { endDate: dateFilter }
        ]
      })
    }).populate("employee", "name employeeId department");

    // Generate PDF
    const doc = new PDFDocument({ margin: 50, size: "A4" });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=attendance-report-all-employees-${Date.now()}.pdf`
    );

    // Pipe PDF to response
    doc.pipe(res);

    // Generate PDF content
    generateAdminPDFContent(doc, employees, attendanceRecords, leaveRecords, startDate, endDate);

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error("Admin report generation error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= HELPER: CALCULATE STATISTICS =================
function calculateStats(attendanceRecords, leaveRecords) {
  const totalDays = attendanceRecords.length;
  const presentDays = attendanceRecords.filter(r => r.status === "present").length;
  const absentDays = attendanceRecords.filter(r => r.status === "absent").length;
  const halfDays = attendanceRecords.filter(r => r.status === "half-day").length;
  const leaveDays = leaveRecords.reduce((sum, leave) => {
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return sum + days;
  }, 0);

  // Calculate total working hours
  const totalHours = attendanceRecords.reduce((sum, record) => {
    if (record.checkIn && record.checkOut) {
      const hours = (new Date(record.checkOut) - new Date(record.checkIn)) / (1000 * 60 * 60);
      return sum + hours;
    }
    return sum;
  }, 0);

  // Calculate average working hours
  const avgHours = totalDays > 0 ? (totalHours / totalDays).toFixed(2) : 0;

  // Calculate late check-ins (after 9:30 AM)
  const lateCheckIns = attendanceRecords.filter(r => {
    if (r.checkIn) {
      const checkInTime = new Date(r.checkIn);
      const hours = checkInTime.getHours();
      const minutes = checkInTime.getMinutes();
      return hours > 9 || (hours === 9 && minutes > 30);
    }
    return false;
  }).length;

  return {
    totalDays,
    presentDays,
    absentDays,
    halfDays,
    leaveDays,
    totalHours: totalHours.toFixed(2),
    avgHours,
    lateCheckIns
  };
}

// ================= HELPER: GENERATE PDF CONTENT =================
function generatePDFContent(doc, user, attendanceRecords, leaveRecords, stats, startDate, endDate) {
  // Header
  doc.fontSize(20).font("Helvetica-Bold").text("ATTENDANCE REPORT", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(10).font("Helvetica").text(`Generated on: ${new Date().toLocaleDateString()}`, { align: "center" });
  doc.moveDown(1);

  // Employee Information
  doc.fontSize(14).font("Helvetica-Bold").text("Employee Information");
  doc.moveDown(0.5);
  doc.fontSize(10).font("Helvetica");
  doc.text(`Name: ${user.name}`);
  doc.text(`Employee ID: ${user.employeeId}`);
  doc.text(`Email: ${user.email}`);
  doc.text(`Department: ${user.department}`);
  doc.text(`Phone: ${user.phone}`);
  
  if (startDate || endDate) {
    doc.moveDown(0.5);
    doc.text(`Report Period: ${startDate ? new Date(startDate).toLocaleDateString() : "Start"} to ${endDate ? new Date(endDate).toLocaleDateString() : "End"}`);
  }
  
  doc.moveDown(1);

  // Statistics Summary
  doc.fontSize(14).font("Helvetica-Bold").text("Attendance Summary");
  doc.moveDown(0.5);
  doc.fontSize(10).font("Helvetica");
  
  const summaryData = [
    ["Total Days Recorded:", stats.totalDays],
    ["Present Days:", stats.presentDays],
    ["Absent Days:", stats.absentDays],
    ["Half Days:", stats.halfDays],
    ["Approved Leaves:", stats.leaveDays],
    ["Total Working Hours:", `${stats.totalHours} hrs`],
    ["Average Hours/Day:", `${stats.avgHours} hrs`],
    ["Late Check-ins:", stats.lateCheckIns]
  ];

  summaryData.forEach(([label, value]) => {
    doc.text(`${label} ${value}`);
  });

  doc.moveDown(1);

  // Attendance Records Table
  if (attendanceRecords.length > 0) {
    doc.fontSize(14).font("Helvetica-Bold").text("Attendance Records");
    doc.moveDown(0.5);

    // Table headers
    const tableTop = doc.y;
    const colWidths = [80, 80, 80, 80, 60, 80];
    const headers = ["Date", "Check In", "Check Out", "Hours", "Status", "Photo"];

    doc.fontSize(9).font("Helvetica-Bold");
    headers.forEach((header, i) => {
      const x = 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
      doc.text(header, x, tableTop, { width: colWidths[i], align: "left" });
    });

    doc.moveDown(0.5);
    doc.strokeColor("#cccccc").lineWidth(0.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.3);

    // Table rows
    doc.fontSize(8).font("Helvetica");
    attendanceRecords.forEach((record, index) => {
      const rowY = doc.y;

      // Check if we need a new page
      if (rowY > 700) {
        doc.addPage();
        doc.fontSize(9).font("Helvetica-Bold");
        headers.forEach((header, i) => {
          const x = 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
          doc.text(header, x, doc.y, { width: colWidths[i], align: "left" });
        });
        doc.moveDown(0.5);
        doc.strokeColor("#cccccc").lineWidth(0.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.3);
        doc.fontSize(8).font("Helvetica");
      }

      const rowData = [
        new Date(record.date).toLocaleDateString(),
        record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-",
        record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-",
        record.checkIn && record.checkOut ? `${((new Date(record.checkOut) - new Date(record.checkIn)) / (1000 * 60 * 60)).toFixed(1)}h` : "-",
        record.status || "-",
        record.photo ? "Yes" : "No"
      ];

      rowData.forEach((data, i) => {
        const x = 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
        doc.text(data, x, rowY, { width: colWidths[i], align: "left" });
      });

      doc.moveDown(0.8);
    });
  }

  // Leave Records
  if (leaveRecords.length > 0) {
    doc.addPage();
    doc.fontSize(14).font("Helvetica-Bold").text("Approved Leave Records");
    doc.moveDown(0.5);

    doc.fontSize(10).font("Helvetica");
    leaveRecords.forEach((leave, index) => {
      const start = new Date(leave.startDate).toLocaleDateString();
      const end = new Date(leave.endDate).toLocaleDateString();
      const days = Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1;
      
      doc.text(`${index + 1}. ${leave.leaveType} (${days} day${days > 1 ? "s" : ""})`);
      doc.fontSize(9);
      doc.text(`   Period: ${start} to ${end}`, { indent: 20 });
      doc.text(`   Reason: ${leave.reason}`, { indent: 20 });
      doc.moveDown(0.5);
      doc.fontSize(10);
    });
  }

  // Footer
  doc.fontSize(8).font("Helvetica").text(
    "This is a computer-generated report. No signature required.",
    50,
    doc.page.height - 50,
    { align: "center" }
  );
}

// ================= HELPER: GENERATE ADMIN PDF CONTENT =================
function generateAdminPDFContent(doc, employees, attendanceRecords, leaveRecords, startDate, endDate) {
  // Header
  doc.fontSize(20).font("Helvetica-Bold").text("COMPANY ATTENDANCE REPORT", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(10).font("Helvetica").text(`Generated on: ${new Date().toLocaleDateString()}`, { align: "center" });
  
  if (startDate || endDate) {
    doc.text(`Report Period: ${startDate ? new Date(startDate).toLocaleDateString() : "Start"} to ${endDate ? new Date(endDate).toLocaleDateString() : "End"}`, { align: "center" });
  }
  
  doc.moveDown(1);

  // Overall Statistics
  doc.fontSize(14).font("Helvetica-Bold").text("Overall Statistics");
  doc.moveDown(0.5);
  doc.fontSize(10).font("Helvetica");
  doc.text(`Total Employees: ${employees.length}`);
  doc.text(`Total Attendance Records: ${attendanceRecords.length}`);
  doc.text(`Total Approved Leaves: ${leaveRecords.length}`);
  doc.moveDown(1);

  // Employee-wise Summary
  doc.fontSize(14).font("Helvetica-Bold").text("Employee-wise Summary");
  doc.moveDown(0.5);

  employees.forEach((employee, index) => {
    // Check if we need a new page
    if (doc.y > 650) {
      doc.addPage();
    }

    const empAttendance = attendanceRecords.filter(r => 
      r.employee && r.employee._id.toString() === employee._id.toString()
    );
    
    const empLeaves = leaveRecords.filter(l => 
      l.employee && l.employee._id.toString() === employee._id.toString()
    );

    const empStats = calculateStats(empAttendance, empLeaves);

    doc.fontSize(11).font("Helvetica-Bold").text(`${index + 1}. ${employee.name} (${employee.employeeId})`);
    doc.fontSize(9).font("Helvetica");
    doc.text(`   Department: ${employee.department}`);
    doc.text(`   Present: ${empStats.presentDays} | Absent: ${empStats.absentDays} | Half-day: ${empStats.halfDays} | Leaves: ${empStats.leaveDays}`);
    doc.text(`   Total Hours: ${empStats.totalHours} hrs | Avg: ${empStats.avgHours} hrs/day | Late: ${empStats.lateCheckIns}`);
    doc.moveDown(0.8);
  });

  // Footer
  doc.fontSize(8).font("Helvetica").text(
    "This is a computer-generated report. No signature required.",
    50,
    doc.page.height - 50,
    { align: "center" }
  );
}
