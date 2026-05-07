# PDF Report System - Backend

## Overview
Implemented a comprehensive PDF report generation system that allows both admins and employees to export attendance reports in PDF format.

## Dependencies Added
```bash
npm install pdfkit
```

## New Files Created

### 1. `controllers/report.controller.js`
Contains two main functions:
- `generateUserReport`: Generates individual employee attendance report
- `generateAdminReport`: Generates company-wide attendance report for all employees

### 2. `routes/report.routes.js`
Defines API endpoints for report generation:
- `GET /api/report/user/:userId` - Generate individual user report
- `GET /api/report/admin/all` - Generate all employees report (admin only)

## Features

### Individual User Report
**Endpoint**: `GET /api/report/user/:userId?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

**Query Parameters**:
- `startDate` (optional): Filter records from this date
- `endDate` (optional): Filter records until this date

**Report Contents**:
1. **Employee Information**
   - Name, Employee ID, Email, Department, Phone
   - Report period (if date range specified)

2. **Attendance Summary**
   - Total days recorded
   - Present days
   - Absent days
   - Half days
   - Approved leaves
   - Total working hours
   - Average hours per day
   - Late check-ins count

3. **Detailed Attendance Records Table**
   - Date
   - Check-in time
   - Check-out time
   - Working hours
   - Status (present/absent/half-day)
   - Photo capture status

4. **Approved Leave Records**
   - Leave type
   - Duration (start date to end date)
   - Number of days
   - Reason

### Admin Report (All Employees)
**Endpoint**: `GET /api/report/admin/all?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

**Query Parameters**:
- `startDate` (optional): Filter records from this date
- `endDate` (optional): Filter records until this date

**Report Contents**:
1. **Company Header**
   - Report title
   - Generation date
   - Report period

2. **Overall Statistics**
   - Total employees
   - Total attendance records
   - Total approved leaves

3. **Employee-wise Summary**
   For each employee:
   - Name and Employee ID
   - Department
   - Present/Absent/Half-day/Leave counts
   - Total working hours and average
   - Late check-ins count

## PDF Generation Logic

### Statistics Calculation
The `calculateStats()` helper function computes:
- Total attendance days
- Present/absent/half-day counts
- Total leave days (calculated from leave date ranges)
- Total working hours (from check-in to check-out)
- Average working hours per day
- Late check-ins (after 9:30 AM)

### PDF Layout
- **Page Size**: A4
- **Margins**: 50 points
- **Fonts**: Helvetica (regular and bold)
- **Sections**: Header, Employee Info, Summary, Tables, Footer
- **Auto-pagination**: Automatically adds new pages when content exceeds page height

### Response Headers
```javascript
Content-Type: application/pdf
Content-Disposition: attachment; filename=attendance-report-{id}-{timestamp}.pdf
```

## Security & Access Control

### Authentication
All report endpoints require authentication via JWT token (auth middleware).

### Authorization
- **User Report**: 
  - Employees can generate their own reports
  - Admins can generate any employee's report
  - No additional role check needed (handled by auth middleware)

- **Admin Report**:
  - Only admins can access (requireAdmin middleware)
  - Generates reports for all employees

## Usage Examples

### Generate User Report (All Time)
```bash
GET /api/report/user/64abc123def456789
Authorization: Bearer <token>
```

### Generate User Report (Date Range)
```bash
GET /api/report/user/64abc123def456789?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

### Generate Admin Report (This Month)
```bash
GET /api/report/admin/all?startDate=2024-05-01&endDate=2024-05-31
Authorization: Bearer <token>
```

## Error Handling
- Returns 404 if user not found
- Returns 500 for PDF generation errors
- Logs errors to console for debugging

## Integration with Existing System
- Uses existing `Attendance` model
- Uses existing `Leave` model
- Uses existing `User` model
- Integrated with existing auth middleware
- Added to `server.js` route registration

## Server Configuration
Updated `server.js`:
```javascript
app.use("/api/report", require("./routes/report.routes"));
```

## Notes
- PDF is streamed directly to response (no file storage)
- Automatic cleanup via stream piping
- Supports large datasets with pagination
- Responsive to date filters for flexible reporting
- Computer-generated footer (no signature required)
