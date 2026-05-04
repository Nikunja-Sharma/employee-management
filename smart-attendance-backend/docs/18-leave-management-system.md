# Leave Management System - Backend Implementation

## Overview
Complete leave management system allowing employees to apply for leave and admins to review, approve, or reject applications with comprehensive tracking and analytics.

## Database Schema

### Leave Model (`models/Leave.js`)
```javascript
{
  employee: ObjectId (ref: User),
  employeeId: String,
  leaveType: String (enum: sick, casual, annual, maternity, paternity, emergency, other),
  startDate: Date,
  endDate: Date,
  totalDays: Number,
  reason: String (max 500 chars),
  status: String (enum: pending, approved, rejected),
  appliedDate: Date,
  reviewedBy: ObjectId (ref: User),
  reviewedDate: Date,
  adminComments: String (max 500 chars),
  attachments: [{ filename, path, uploadDate }]
}
```

## API Endpoints

### Employee Endpoints (via `/api/leave/`)

#### 1. Apply for Leave
```
POST /api/leave/apply
Authorization: Bearer Token (Employee/Admin)

Body:
{
  "leaveType": "sick",
  "startDate": "2024-05-01",
  "endDate": "2024-05-03",
  "reason": "Medical treatment required"
}

Response:
{
  "success": true,
  "message": "Leave application submitted successfully",
  "data": {
    "_id": "leave_id",
    "employee": { "name": "John Doe", "employeeId": "EMP001" },
    "leaveType": "sick",
    "startDate": "2024-05-01T00:00:00.000Z",
    "endDate": "2024-05-03T00:00:00.000Z",
    "totalDays": 3,
    "reason": "Medical treatment required",
    "status": "pending",
    "appliedDate": "2024-04-25T10:30:00.000Z"
  }
}
```

#### 2. Get My Leave Applications
```
GET /api/leave/my-leaves?status=pending&page=1&limit=10
Authorization: Bearer Token (Employee/Admin)

Query Parameters:
- status: pending|approved|rejected (optional)
- page: number (default: 1)
- limit: number (default: 10)

Response:
{
  "success": true,
  "data": {
    "leaves": [...],
    "pagination": {
      "current": 1,
      "total": 5,
      "count": 10,
      "totalRecords": 45
    }
  }
}
```

#### 3. Get Leave Details
```
GET /api/leave/details/:leaveId
Authorization: Bearer Token (Employee/Admin)

Response:
{
  "success": true,
  "data": {
    "_id": "leave_id",
    "employee": {
      "name": "John Doe",
      "employeeId": "EMP001",
      "email": "john@company.com",
      "department": "IT"
    },
    "leaveType": "sick",
    "startDate": "2024-05-01T00:00:00.000Z",
    "endDate": "2024-05-03T00:00:00.000Z",
    "totalDays": 3,
    "reason": "Medical treatment required",
    "status": "approved",
    "reviewedBy": {
      "name": "Admin User",
      "employeeId": "ADMIN001"
    },
    "reviewedDate": "2024-04-26T09:15:00.000Z",
    "adminComments": "Approved. Get well soon."
  }
}
```

#### 4. Cancel Leave Application
```
DELETE /api/leave/cancel/:leaveId
Authorization: Bearer Token (Employee)

Response:
{
  "success": true,
  "message": "Leave application cancelled successfully"
}
```

### Admin Endpoints (via `/api/admin/`)

#### 1. Get All Leave Applications
```
GET /api/admin/leaves?status=pending&employeeId=EMP001&page=1&limit=10
Authorization: Bearer Token (Admin)

Query Parameters:
- status: pending|approved|rejected (optional)
- employeeId: string (optional, partial match)
- leaveType: string (optional)
- startDate: YYYY-MM-DD (optional)
- endDate: YYYY-MM-DD (optional)
- page: number (default: 1)
- limit: number (default: 10)

Response:
{
  "success": true,
  "data": {
    "leaves": [...],
    "summary": {
      "total": 150,
      "pending": 25,
      "approved": 100,
      "rejected": 25
    },
    "pagination": {
      "current": 1,
      "total": 15,
      "count": 10,
      "totalRecords": 150
    }
  }
}
```

#### 2. Review Leave Application
```
PUT /api/admin/leaves/:leaveId
Authorization: Bearer Token (Admin)

Body:
{
  "status": "approved",
  "adminComments": "Approved. Please ensure handover is complete."
}

Response:
{
  "success": true,
  "message": "Leave application approved successfully",
  "data": {
    "_id": "leave_id",
    "employee": { "name": "John Doe", "employeeId": "EMP001" },
    "status": "approved",
    "reviewedBy": { "name": "Admin User", "employeeId": "ADMIN001" },
    "reviewedDate": "2024-04-26T09:15:00.000Z",
    "adminComments": "Approved. Please ensure handover is complete."
  }
}
```

#### 3. Get Leave Statistics
```
GET /api/admin/leave-stats?year=2024&month=4
Authorization: Bearer Token (Admin)

Query Parameters:
- year: number (default: current year)
- month: number (optional, 1-12)

Response:
{
  "success": true,
  "data": {
    "overview": [
      {
        "_id": "approved",
        "types": [
          { "type": "sick", "count": 15, "totalDays": 45 },
          { "type": "casual", "count": 20, "totalDays": 60 }
        ],
        "totalCount": 35,
        "totalDays": 105
      }
    ],
    "monthly": [
      {
        "_id": 1,
        "statuses": [
          { "status": "approved", "count": 10, "totalDays": 30 },
          { "status": "pending", "count": 5, "totalDays": 15 }
        ]
      }
    ],
    "year": 2024,
    "month": 4
  }
}
```

## Business Logic

### Leave Application Rules
1. **Date Validation:**
   - Start date cannot be in the past
   - End date must be >= start date
   - Automatic calculation of total days

2. **Overlap Prevention:**
   - Check for existing pending/approved leaves
   - Prevent overlapping date ranges
   - Allow multiple applications for different periods

3. **Status Management:**
   - Default status: "pending"
   - Only admins can change status to "approved" or "rejected"
   - Employees can only cancel "pending" applications

### Leave Types Supported
- **sick**: Medical leave
- **casual**: Personal/casual leave
- **annual**: Annual vacation
- **maternity**: Maternity leave
- **paternity**: Paternity leave
- **emergency**: Emergency leave
- **other**: Other types of leave

## Controller Functions

### Employee Functions
- `applyLeave`: Submit new leave application with validation
- `getMyLeaves`: Retrieve employee's leave history with pagination
- `getLeaveById`: Get detailed leave information
- `cancelLeave`: Cancel pending leave applications

### Admin Functions
- `getAllLeaves`: Retrieve all leave applications with filters
- `reviewLeave`: Approve or reject leave applications
- `getLeaveStats`: Generate leave analytics and statistics

## Error Handling

### Common Error Responses
```javascript
// Validation Error
{
  "success": false,
  "message": "All fields are required"
}

// Date Validation Error
{
  "success": false,
  "message": "Start date cannot be in the past"
}

// Overlap Error
{
  "success": false,
  "message": "You already have a leave application for overlapping dates"
}

// Permission Error
{
  "success": false,
  "message": "Access denied"
}

// Not Found Error
{
  "success": false,
  "message": "Leave application not found"
}
```

## Database Indexes
```javascript
// Efficient querying
{ employee: 1, appliedDate: -1 }
{ status: 1, appliedDate: -1 }
{ startDate: 1, endDate: 1 }
```

## Security Features
1. **Authentication Required:** All endpoints require valid JWT token
2. **Role-Based Access:** Admin-only endpoints protected by role middleware
3. **Data Isolation:** Employees can only access their own leave data
4. **Input Validation:** Comprehensive validation on all inputs
5. **SQL Injection Prevention:** Using Mongoose ODM with parameterized queries

## Integration Points
- **User Model:** References employee and admin users
- **Authentication:** Uses existing JWT authentication system
- **Role Management:** Integrates with existing role-based access control
- **File Uploads:** Ready for attachment support (future enhancement)

## Future Enhancements
1. **File Attachments:** Medical certificates, documents
2. **Email Notifications:** Automatic notifications for status changes
3. **Leave Balance:** Track remaining leave days per employee
4. **Approval Workflow:** Multi-level approval process
5. **Calendar Integration:** Visual calendar view of leaves
6. **Reporting:** Advanced analytics and reporting features

## Testing Endpoints

### Test Leave Application Flow
1. **Employee applies for leave:**
   ```bash
   curl -X POST http://localhost:5000/api/leave/apply \
   -H "Authorization: Bearer <employee_token>" \
   -H "Content-Type: application/json" \
   -d '{
     "leaveType": "sick",
     "startDate": "2024-05-01",
     "endDate": "2024-05-03",
     "reason": "Medical treatment"
   }'
   ```

2. **Admin reviews applications:**
   ```bash
   curl -X GET http://localhost:5000/api/admin/leaves?status=pending \
   -H "Authorization: Bearer <admin_token>"
   ```

3. **Admin approves leave:**
   ```bash
   curl -X PUT http://localhost:5000/api/admin/leaves/<leave_id> \
   -H "Authorization: Bearer <admin_token>" \
   -H "Content-Type: application/json" \
   -d '{
     "status": "approved",
     "adminComments": "Approved"
   }'
   ```

## Implementation Status
✅ Leave Model Created  
✅ Leave Controller Implemented  
✅ Leave Routes Configured  
✅ Server Integration Complete  
✅ Authentication & Authorization  
✅ Input Validation  
✅ Error Handling  
✅ Database Indexing  
✅ API Documentation  

The leave management system is fully implemented and ready for frontend integration.