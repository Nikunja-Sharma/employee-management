# PDF Report System - Frontend

## Overview
Implemented user-friendly interfaces for both admins and employees to generate and download attendance reports in PDF format.

## New Files Created

### 1. `src/api/reportApi.js`
API functions for report generation:
- `generateUserReport(userId, startDate, endDate)` - Download individual employee report
- `generateAdminReport(startDate, endDate)` - Download company-wide report

**Key Features**:
- Uses `responseType: "blob"` for PDF download
- Automatically creates download link and triggers download
- Cleans up blob URLs after download
- Generates unique filenames with timestamps

### 2. `src/pages/Reports.jsx` (Admin)
Admin interface for generating reports with:
- **Report Type Selection**: Individual employee or all employees
- **Employee Dropdown**: Select specific employee (for individual reports)
- **Date Range Picker**: Optional start and end date filters
- **Quick Actions**: Generate and download PDF
- **Loading States**: Visual feedback during PDF generation
- **Info Box**: Shows what will be included in the report

### 3. `src/pages/MyReport.jsx` (Employee)
Employee interface for generating personal reports with:
- **User Information Display**: Shows current user details
- **Date Range Picker**: Optional date filters
- **Quick Presets**: This Month, Last Month, Last 3 Months, All Time
- **Download Button**: Generate and download personal report
- **Loading States**: Visual feedback during generation
- **Info Box**: Lists report contents

## Routes Added

### App.jsx Updates
```javascript
// Admin Routes
<Route path="reports" element={<Reports />} />

// Employee Routes
<Route path="report" element={<MyReport />} />
```

## Navigation Updates

### Admin Sidebar (`Sidebar.jsx`)
Added new navigation link:
```javascript
<Link to="/admin/reports" className={linkClass("reports")}>
  Reports
</Link>
```

### Employee Sidebar (`EmployeeSidebar.jsx`)
Added new navigation link:
```javascript
<Link to="/employee/report" className={linkClass("report")}>
  My Report
</Link>
```

## Features

### Admin Reports Page (`/admin/reports`)

#### Report Types
1. **Individual Employee Report**
   - Select employee from dropdown
   - Shows: Name, Employee ID, Department
   - Optional date range filter
   - Downloads single employee's detailed report

2. **All Employees Report**
   - No employee selection needed
   - Optional date range filter
   - Downloads company-wide summary report

#### UI Components
- Radio buttons for report type selection
- Searchable employee dropdown
- Date range inputs (start and end)
- Generate button with loading spinner
- Information box showing report contents

#### Report Contents (Individual)
- ✓ Employee information and details
- ✓ Attendance summary (present, absent, half-day)
- ✓ Working hours statistics
- ✓ Detailed attendance records with check-in/out times
- ✓ Approved leave records
- ✓ Late check-in count

#### Report Contents (All Employees)
- ✓ Company-wide attendance overview
- ✓ Employee-wise attendance summary
- ✓ Department-wise statistics
- ✓ Total working hours per employee
- ✓ Leave and absence tracking

### Employee Report Page (`/employee/report`)

#### Features
- **User Info Display**: Shows logged-in employee's details
- **Date Range Selection**: Optional filters
- **Quick Presets**: One-click date range selection
  - This Month
  - Last Month
  - Last 3 Months
  - All Time
- **Download Button**: Generate personal report
- **Loading States**: Spinner during PDF generation

#### Report Contents
- ✓ Complete attendance summary
- ✓ Total present, absent, and half-day records
- ✓ Total working hours and daily average
- ✓ Detailed check-in and check-out times
- ✓ All approved leave records
- ✓ Late check-in statistics
- ✓ Photo capture status for each attendance

## User Experience

### Loading States
Both pages show:
- Disabled button during generation
- Animated spinner icon
- "Generating PDF..." text
- Gray background to indicate disabled state

### Success Feedback
- Browser automatically downloads PDF
- Alert message: "Report downloaded successfully!"
- Unique filename with timestamp

### Error Handling
- Try-catch blocks for API calls
- User-friendly error alerts
- Console logging for debugging

### Date Range Handling
- Optional filters (leave empty for all records)
- Start date and end date inputs
- Quick preset buttons (employee page)
- Clear instructions for users

## API Integration

### Request Format
```javascript
// Individual Report
GET /api/report/user/:userId?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD

// Admin Report
GET /api/report/admin/all?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```

### Response Handling
```javascript
{
  responseType: "blob", // Important for PDF
  headers: {
    Authorization: `Bearer ${token}`
  }
}
```

### Download Implementation
```javascript
const url = window.URL.createObjectURL(new Blob([response.data]));
const link = document.createElement("a");
link.href = url;
link.setAttribute("download", filename);
document.body.appendChild(link);
link.click();
link.remove();
window.URL.revokeObjectURL(url);
```

## Styling

### Design System
- **Colors**: Blue primary (#2563eb), Gray backgrounds
- **Layout**: Max-width containers, responsive grid
- **Typography**: Clear hierarchy with font sizes
- **Spacing**: Consistent padding and margins
- **Shadows**: Subtle elevation for cards

### Components
- Form inputs with focus states
- Radio buttons for selection
- Dropdown with full employee details
- Buttons with hover effects
- Info boxes with blue theme
- Loading spinners

## Security

### Authentication
- All API calls include JWT token
- Uses existing `api` instance from `config/api.js`
- Automatic token handling via axios interceptors

### Authorization
- Admin pages: Only accessible to admin role
- Employee pages: Only accessible to employee role
- Protected routes via `ProtectedRoute` component
- User context for current user data

## User Flows

### Admin Flow
1. Navigate to "Reports" from sidebar
2. Choose report type (individual or all)
3. If individual: Select employee from dropdown
4. Optionally set date range
5. Click "Download Report"
6. PDF automatically downloads

### Employee Flow
1. Navigate to "My Report" from sidebar
2. View personal information
3. Optionally select date range or use preset
4. Click "Download My Report"
5. PDF automatically downloads

## Responsive Design
- Works on desktop and tablet
- Mobile-friendly form layouts
- Responsive grid for date inputs
- Flexible button sizing

## Future Enhancements
- Email report delivery
- Scheduled report generation
- Custom report templates
- Export to Excel/CSV
- Report history/archive
- Batch report generation
- Department-wise filtering
- Custom date range presets
