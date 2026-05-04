# Leave and Attendance Integration

## Overview
Comprehensive integration between leave management and attendance system with automatic attendance record creation for approved leaves and proper validations.

## Key Features

### 1. Automatic Attendance Record Creation
When admin approves a leave:
- ✅ Automatically creates attendance records for all leave days
- ✅ Status set to "on-leave"
- ✅ Skips weekends (Saturday & Sunday)
- ✅ Links attendance to leave application
- ✅ Updates existing absent records to leave status

### 2. Leave Override Protection
When employee tries to scan QR on leave day:
- ✅ Checks for approved leave
- ✅ Shows warning message with leave details
- ✅ Prevents scanning unless admin intervention
- ✅ Allows override if employee needs to work
- ✅ Tracks override in attendance reason

### 3. Comprehensive Validations

#### Leave Application Validations:
- ❌ Cannot apply leave for past dates
- ❌ Cannot apply leave for dates with existing attendance
- ❌ Cannot apply leave for overlapping periods
- ❌ End date must be >= start date
- ✅ Automatic day calculation (excluding weekends)

#### Leave Cancellation Validations:
- ❌ Cannot cancel approved leaves with attendance records
- ❌ Cannot cancel rejected leaves
- ✅ Can only cancel pending leaves
- ✅ Must contact admin for approved leave cancellation

#### QR Scanning Validations:
- ❌ Cannot scan if on approved leave (shows warning)
- ✅ Override possible if employee works on leave day
- ✅ Tracks override with reason in attendance

## Database Schema Updates

### Attendance Model
```javascript
{
  status: {
    type: String,
    enum: ["present", "late", "absent", "on-leave"], // Added "on-leave"
    default: "present"
  },
  
  isLeave: {
    type: Boolean,
    default: false
  },
  
  leaveId: {
    type: ObjectId,
    ref: "Leave",
    default: null
  },
  
  reason: {
    type: String,
    default: null
  }
}
```

## Business Logic

### Leave Approval Flow
```
1. Admin approves leave
   ↓
2. System calculates leave days (excluding weekends)
   ↓
3. For each leave day:
   - Check if attendance exists
   - If no attendance: Create new record with status "on-leave"
   - If absent record exists: Update to "on-leave"
   - If attendance with check-in exists: Skip (employee already worked)
   ↓
4. Link all records to leave application
   ↓
5. Return success with count of records created
```

### Leave Rejection Flow
```
1. Admin rejects leave
   ↓
2. System finds all attendance records linked to this leave
   ↓
3. Delete records where:
   - isLeave = true
   - leaveId matches
   - checkIn is null (no actual attendance)
   ↓
4. Return success with count of records removed
```

### QR Scan on Leave Day Flow
```
1. Employee scans QR
   ↓
2. System checks for approved leave on this date
   ↓
3. If leave found:
   - Check if attendance record exists
   - If leave attendance exists: Show warning, prevent scan
   - Employee must contact admin
   ↓
4. If admin allows override:
   - Update attendance record
   - Change status from "on-leave" to "present"/"late"
   - Add reason: "Leave overridden - worked on [leave type] leave"
   - Clear isLeave and leaveId flags
```

## API Response Examples

### Leave Approval Success
```json
{
  "success": true,
  "message": "Leave application approved successfully (3 attendance records created)",
  "data": {
    "_id": "leave_id",
    "status": "approved",
    "reviewedBy": { "name": "Admin", "employeeId": "ADMIN001" },
    "reviewedDate": "2024-05-04T10:30:00.000Z"
  }
}
```

### QR Scan on Leave Day
```json
{
  "message": "You are on approved leave today. Contact admin if you need to work.",
  "leaveType": "sick",
  "leaveDates": "2024-05-01 to 2024-05-03"
}
```

### Leave Application with Existing Attendance
```json
{
  "success": false,
  "message": "Cannot apply leave - you have already marked attendance on 2024-05-02"
}
```

## Controller Functions

### createLeaveAttendanceRecords(leave)
**Purpose:** Create attendance records for approved leave

**Logic:**
1. Iterate through date range (startDate to endDate)
2. Skip weekends
3. Check for existing attendance
4. Create new records or update existing absent records
5. Return count of records created

**Parameters:**
- `leave`: Leave document object

**Returns:** Number of records created

### removeLeaveAttendanceRecords(leave)
**Purpose:** Remove attendance records when leave is rejected

**Logic:**
1. Find all attendance records linked to this leave
2. Delete only records with no check-in (no actual work done)
3. Return count of records deleted

**Parameters:**
- `leave`: Leave document object

**Returns:** Number of records deleted

## Validation Rules

### Leave Application
```javascript
// Date validations
startDate >= today
endDate >= startDate

// Attendance check
No existing attendance with checkIn for date range

// Overlap check
No pending/approved leave for overlapping dates

// Required fields
leaveType, startDate, endDate, reason
```

### Leave Cancellation
```javascript
// Status check
status === "pending"

// Attendance check
No attendance records with isLeave=true and leaveId=this._id

// Permission
Only employee who applied can cancel
```

### QR Scanning
```javascript
// Leave check
Check for approved leave on scan date

// Override conditions
- Leave attendance exists
- Admin approval required
- Track override in reason field

// Normal validations
- Location check
- Time window check
- Duplicate check
```

## Edge Cases Handled

### 1. Employee Works on Leave Day
**Scenario:** Employee has approved leave but comes to office
**Solution:** 
- Show warning message
- Prevent automatic scanning
- Require admin intervention
- If allowed, override leave attendance with actual attendance

### 2. Leave Approved After Absent Marked
**Scenario:** Employee was marked absent, then leave is approved
**Solution:**
- Update existing absent record to "on-leave"
- Link to leave application
- Preserve record history

### 3. Partial Leave Period Worked
**Scenario:** Employee works on some days of approved leave
**Solution:**
- Leave attendance created for all days
- Days worked override leave status
- Reason tracks: "Leave overridden - worked on sick leave"

### 4. Leave Rejected After Records Created
**Scenario:** Leave approved (records created), then admin changes to rejected
**Solution:**
- Delete only leave attendance records with no check-in
- Preserve records where employee actually worked
- Return count of records removed

### 5. Weekend Handling
**Scenario:** Leave period includes weekends
**Solution:**
- Skip Saturday and Sunday when creating records
- Only create records for working days
- Total days calculation includes weekends for leave balance

## Testing Scenarios

### Test 1: Normal Leave Approval
```
1. Employee applies for leave (May 1-3)
2. Admin approves
3. Verify: 3 attendance records created with status "on-leave"
4. Verify: Records linked to leave application
```

### Test 2: Leave with Weekend
```
1. Employee applies for leave (May 3-5, includes Saturday-Sunday)
2. Admin approves
3. Verify: Only 3 records created (Fri, Mon, Tue)
4. Verify: Weekend days skipped
```

### Test 3: QR Scan on Leave Day
```
1. Employee has approved leave for today
2. Employee tries to scan QR
3. Verify: Error message shown
4. Verify: Leave details displayed
5. Verify: Scan prevented
```

### Test 4: Leave Override
```
1. Employee has approved leave
2. Admin allows employee to work
3. Employee scans QR
4. Verify: Attendance updated from "on-leave" to "present"
5. Verify: Reason shows override message
```

### Test 5: Leave Application with Existing Attendance
```
1. Employee marks attendance on May 1
2. Employee tries to apply leave for May 1-3
3. Verify: Error message shown
4. Verify: Leave application rejected
```

### Test 6: Cancel Approved Leave
```
1. Employee has approved leave with attendance records
2. Employee tries to cancel
3. Verify: Error message shown
4. Verify: Cancellation prevented
```

## Security Considerations

1. **Authorization:** Only admins can approve/reject leaves
2. **Data Integrity:** Attendance records linked to leave for audit trail
3. **Validation:** Multiple layers of validation prevent data inconsistency
4. **Override Tracking:** All leave overrides tracked with reasons
5. **Immutability:** Approved leaves with attendance cannot be cancelled by employee

## Performance Optimization

1. **Bulk Insert:** Use `insertMany()` for creating multiple attendance records
2. **Indexed Queries:** Queries use indexed fields (employee, dateString, leaveId)
3. **Conditional Updates:** Only update records that need changes
4. **Efficient Date Range:** Single query to check attendance in date range

## Future Enhancements

1. **Email Notifications:** Notify employee when leave creates attendance records
2. **Leave Balance:** Track remaining leave days per employee
3. **Partial Day Leave:** Support half-day leave applications
4. **Leave Calendar:** Visual calendar showing team leaves
5. **Approval Workflow:** Multi-level approval for certain leave types
6. **Leave Reports:** Analytics on leave patterns and trends

## Implementation Status
✅ Attendance model updated with leave fields  
✅ Leave approval creates attendance records  
✅ Leave rejection removes attendance records  
✅ QR scan checks for approved leave  
✅ Leave override functionality  
✅ Comprehensive validations  
✅ Weekend handling  
✅ Edge cases covered  
✅ Error messages and feedback  
✅ Documentation complete  

The leave and attendance integration is fully implemented and production-ready!