# PDF Report System - Usage Examples

## 🔧 Backend API Examples

### 1. Generate User Report (cURL)

#### Get All-Time Report
```bash
curl -X GET "http://localhost:5001/api/report/user/64abc123def456789" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  --output report.pdf
```

#### Get Report for Specific Date Range
```bash
curl -X GET "http://localhost:5001/api/report/user/64abc123def456789?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  --output report.pdf
```

#### Get This Month's Report
```bash
curl -X GET "http://localhost:5001/api/report/user/64abc123def456789?startDate=2024-05-01&endDate=2024-05-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  --output report.pdf
```

### 2. Generate Admin Report (All Employees)

#### Get All-Time Company Report
```bash
curl -X GET "http://localhost:5001/api/report/admin/all" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  --output company-report.pdf
```

#### Get Company Report for Date Range
```bash
curl -X GET "http://localhost:5001/api/report/admin/all?startDate=2024-01-01&endDate=2024-03-31" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  --output company-report-q1.pdf
```

---

## 🎨 Frontend Usage Examples

### Admin Component Example

```jsx
import { generateUserReport, generateAdminReport } from "../api/reportApi";

// Generate individual employee report
const handleDownloadEmployeeReport = async () => {
  const employeeId = "64abc123def456789";
  const startDate = "2024-01-01";
  const endDate = "2024-12-31";
  
  try {
    await generateUserReport(employeeId, startDate, endDate);
    alert("Report downloaded successfully!");
  } catch (error) {
    alert("Failed to generate report");
  }
};

// Generate company-wide report
const handleDownloadCompanyReport = async () => {
  const startDate = "2024-01-01";
  const endDate = "2024-12-31";
  
  try {
    await generateAdminReport(startDate, endDate);
    alert("Company report downloaded successfully!");
  } catch (error) {
    alert("Failed to generate report");
  }
};
```

### Employee Component Example

```jsx
import { useContext } from "react";
import { generateUserReport } from "../api/reportApi";
import { AuthContext } from "../context/AuthContext";

function MyReportComponent() {
  const { user } = useContext(AuthContext);
  
  const handleDownloadMyReport = async () => {
    try {
      // Download all-time report
      await generateUserReport(user._id, "", "");
      alert("Your report has been downloaded!");
    } catch (error) {
      alert("Failed to generate report");
    }
  };
  
  const handleDownloadThisMonth = async () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const startDate = firstDay.toISOString().split("T")[0];
    const endDate = today.toISOString().split("T")[0];
    
    try {
      await generateUserReport(user._id, startDate, endDate);
      alert("This month's report downloaded!");
    } catch (error) {
      alert("Failed to generate report");
    }
  };
  
  return (
    <div>
      <button onClick={handleDownloadMyReport}>
        Download All-Time Report
      </button>
      <button onClick={handleDownloadThisMonth}>
        Download This Month
      </button>
    </div>
  );
}
```

---

## 📊 Sample Report Data

### Individual Employee Report Output

```
ATTENDANCE REPORT
Generated on: 05/07/2026

Employee Information
Name: John Doe
Employee ID: EMP001
Email: john.doe@company.com
Department: Engineering
Phone: 1234567890
Report Period: 01/01/2024 to 12/31/2024

Attendance Summary
Total Days Recorded: 240
Present Days: 220
Absent Days: 5
Half Days: 15
Approved Leaves: 10
Total Working Hours: 1980.5 hrs
Average Hours/Day: 8.25 hrs
Late Check-ins: 12

Attendance Records
Date          Check In    Check Out   Hours   Status      Photo
01/01/2024    09:00 AM    06:00 PM    9.0h    present     Yes
01/02/2024    09:15 AM    06:30 PM    9.3h    present     Yes
01/03/2024    10:00 AM    02:00 PM    4.0h    half-day    Yes
...

Approved Leave Records
1. Sick Leave (2 days)
   Period: 01/15/2024 to 01/16/2024
   Reason: Medical appointment

2. Casual Leave (3 days)
   Period: 02/20/2024 to 02/22/2024
   Reason: Personal work
...
```

### Company Report Output

```
COMPANY ATTENDANCE REPORT
Generated on: 05/07/2026
Report Period: 01/01/2024 to 12/31/2024

Overall Statistics
Total Employees: 50
Total Attendance Records: 12000
Total Approved Leaves: 250

Employee-wise Summary

1. John Doe (EMP001)
   Department: Engineering
   Present: 220 | Absent: 5 | Half-day: 15 | Leaves: 10
   Total Hours: 1980.5 hrs | Avg: 8.25 hrs/day | Late: 12

2. Jane Smith (EMP002)
   Department: Marketing
   Present: 230 | Absent: 3 | Half-day: 7 | Leaves: 8
   Total Hours: 2070.0 hrs | Avg: 8.63 hrs/day | Late: 5

...
```

---

## 🎯 Common Use Cases

### Use Case 1: Monthly Performance Review
```javascript
// Admin generates report for specific employee for last month
const lastMonth = new Date();
lastMonth.setMonth(lastMonth.getMonth() - 1);
const startDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1)
  .toISOString().split("T")[0];
const endDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0)
  .toISOString().split("T")[0];

await generateUserReport(employeeId, startDate, endDate);
```

### Use Case 2: Quarterly Company Report
```javascript
// Admin generates Q1 report (Jan-Mar)
const startDate = "2024-01-01";
const endDate = "2024-03-31";

await generateAdminReport(startDate, endDate);
```

### Use Case 3: Employee Self-Service
```javascript
// Employee downloads their last 3 months report
const today = new Date();
const threeMonthsAgo = new Date(today);
threeMonthsAgo.setMonth(today.getMonth() - 3);

const startDate = threeMonthsAgo.toISOString().split("T")[0];
const endDate = today.toISOString().split("T")[0];

await generateUserReport(user._id, startDate, endDate);
```

### Use Case 4: Year-End Report
```javascript
// Generate full year report
const year = 2024;
const startDate = `${year}-01-01`;
const endDate = `${year}-12-31`;

await generateUserReport(employeeId, startDate, endDate);
```

---

## 🔍 Testing Scenarios

### Scenario 1: New Employee (No Records)
**Input**: Employee with no attendance records
**Expected**: PDF with employee info and zero statistics

### Scenario 2: Employee with Leaves Only
**Input**: Employee with approved leaves but no attendance
**Expected**: PDF showing leave records and zero attendance

### Scenario 3: Date Range with No Data
**Input**: Date range where employee has no records
**Expected**: PDF with employee info and empty tables

### Scenario 4: Large Dataset
**Input**: Employee with 365 days of attendance
**Expected**: Multi-page PDF with proper pagination

### Scenario 5: Special Characters in Name
**Input**: Employee name with special characters (é, ñ, etc.)
**Expected**: PDF with properly rendered characters

---

## 🐛 Debugging Tips

### Check API Response
```javascript
// In browser console
const response = await fetch('/api/report/user/USER_ID', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

console.log('Response type:', response.headers.get('content-type'));
console.log('Response status:', response.status);
```

### Verify Blob Creation
```javascript
// In reportApi.js
const blob = new Blob([response.data]);
console.log('Blob size:', blob.size);
console.log('Blob type:', blob.type);
```

### Check Download Trigger
```javascript
// Verify link creation
const link = document.createElement("a");
console.log('Link created:', link);
console.log('Download attribute:', link.download);
```

---

## 📱 Mobile Considerations

### iOS Safari
- PDFs open in new tab instead of downloading
- User needs to tap "Share" → "Save to Files"

### Android Chrome
- PDFs download to Downloads folder
- Notification shows download progress

### Desktop Browsers
- Chrome: Downloads to default folder
- Firefox: Shows download dialog
- Safari: Opens in new tab or downloads based on settings

---

## 🎨 Customization Examples

### Custom Filename Format
```javascript
// In reportApi.js
const filename = `${user.employeeId}_${user.name}_${startDate}_to_${endDate}.pdf`;
link.setAttribute("download", filename);
```

### Add Loading Progress
```javascript
const [progress, setProgress] = useState(0);

const handleDownload = async () => {
  setProgress(25);
  await generateUserReport(userId, startDate, endDate);
  setProgress(100);
  setTimeout(() => setProgress(0), 1000);
};
```

### Batch Download Multiple Reports
```javascript
const downloadMultipleReports = async (employeeIds) => {
  for (const id of employeeIds) {
    await generateUserReport(id, startDate, endDate);
    // Add delay to avoid overwhelming server
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
};
```

---

## 📊 Analytics Integration

### Track Report Downloads
```javascript
// Add analytics tracking
const handleDownloadReport = async () => {
  // Track event
  analytics.track('Report Downloaded', {
    reportType: 'individual',
    userId: user._id,
    dateRange: { startDate, endDate }
  });
  
  await generateUserReport(user._id, startDate, endDate);
};
```

---

**Happy Reporting! 📊✨**
