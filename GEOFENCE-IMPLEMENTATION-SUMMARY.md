# 🌍 Geofence-Based QR Attendance Validation - Implementation Complete!

## 📋 Overview

Implemented a comprehensive geofence validation system that ensures employees can only mark attendance when physically present at the office location. The system uses GPS coordinates and the Haversine formula to calculate distance and validate attendance requests.

---

## ✨ Features Implemented

### 1. **Admin Configuration**
- ✅ Admin can set office location (latitude, longitude)
- ✅ Admin can set allowed radius (10-10000 meters)
- ✅ Settings stored in database (MongoDB)
- ✅ Changes take effect immediately
- ✅ Default values from environment variables

### 2. **Geofence Validation**
- ✅ GPS location captured during QR scan
- ✅ Distance calculated using Haversine formula
- ✅ Attendance approved if within radius
- ✅ Attendance denied if outside radius
- ✅ Detailed error messages with distance info

### 3. **Data Tracking**
- ✅ Employee scan location saved (lat/lng)
- ✅ Distance from office saved
- ✅ Geo status tracked (APPROVED/DENIED)
- ✅ Denial reason logged

---

## 🏗️ Architecture

### Backend Changes

#### **New Models**
1. **AdminSettings.js**
   - Stores geofence configuration
   - Fields: `officeLat`, `officeLng`, `allowedRadius`
   - Default values from environment variables

#### **Updated Models**
2. **Attendance.js**
   - Added `scanLat` - Employee latitude at scan time
   - Added `scanLng` - Employee longitude at scan time
   - Added `distanceM` - Calculated distance in meters
   - Added `geoStatus` - APPROVED/DENIED
   - Added `denialReason` - Reason if denied

#### **New Controllers**
3. **adminSettings.controller.js**
   - `getGeofenceConfig()` - Get current configuration
   - `updateGeofenceConfig()` - Update configuration (Admin only)

#### **Updated Controllers**
4. **attendance.controller.js**
   - Updated `scanQR()` function:
     - Fetches geofence config from database
     - Calculates distance using Haversine formula
     - Validates location before marking attendance
     - Saves geolocation data with attendance record

#### **New Routes**
5. **adminSettings.routes.js**
   - `GET /api/settings/geofence` - Get configuration
   - `PUT /api/settings/geofence` - Update configuration (Admin)

---

### Frontend Changes

#### **New API Integration**
1. **geofenceApi.js**
   - `getGeofenceConfig()` - Fetch configuration
   - `updateGeofenceConfig()` - Update configuration

#### **New Pages**
2. **GeofenceSettings.jsx**
   - Admin page to configure geofence
   - Input fields for lat/lng/radius
   - Real-time configuration display
   - Instructions for finding coordinates
   - Save functionality with validation

#### **Updated Components**
3. **App.jsx** - Added geofence settings route
4. **Sidebar.jsx** - Added "Geofence Settings" link

---

## 🔢 Haversine Formula Implementation

```javascript
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth radius in meters
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
```

This formula calculates the great-circle distance between two points on Earth's surface, providing accurate distance measurements in meters.

---

## 📊 Database Schema

### AdminSettings Collection
```javascript
{
  settingKey: "geofence_config",
  officeLat: 26.133402482129057,
  officeLng: 91.62278628045627,
  allowedRadius: 100,
  updatedBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Attendance Collection (New Fields)
```javascript
{
  // ... existing fields ...
  scanLat: 26.133500,
  scanLng: 91.622800,
  distanceM: 45,
  geoStatus: "APPROVED",
  denialReason: null
}
```

---

## 🔄 Employee QR Scan Flow

1. **Employee opens attendance app** and scans QR code
2. **Browser requests GPS location** using `navigator.geolocation.getCurrentPosition`
3. **Employee's lat/lng sent to backend** along with QR token
4. **Backend fetches geofence config** from database
5. **Distance calculated** using Haversine formula
6. **Validation**:
   - If `distance <= allowedRadius` → ✅ Attendance APPROVED
   - If `distance > allowedRadius` → ❌ Attendance DENIED
7. **Response sent** with success/failure and distance info
8. **Geolocation data saved** in attendance record

---

## 🎯 API Endpoints

### Get Geofence Configuration
```
GET /api/settings/geofence
Authorization: Bearer Token

Response:
{
  "success": true,
  "data": {
    "officeLat": 26.133402482129057,
    "officeLng": 91.62278628045627,
    "allowedRadius": 100,
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Update Geofence Configuration (Admin Only)
```
PUT /api/settings/geofence
Authorization: Bearer Token (Admin)

Body:
{
  "officeLat": 26.133402482129057,
  "officeLng": 91.62278628045627,
  "allowedRadius": 150
}

Response:
{
  "success": true,
  "message": "Geofence configuration updated successfully",
  "data": {
    "officeLat": 26.133402482129057,
    "officeLng": 91.62278628045627,
    "allowedRadius": 150,
    "updatedAt": "2024-01-15T10:35:00.000Z"
  }
}
```

### QR Scan with Geofence Validation
```
POST /api/attendance/scan
Authorization: Bearer Token

Body:
{
  "qr": "{\"type\":\"attendance\",\"mode\":\"checkin\"}",
  "latitude": 26.133500,
  "longitude": 91.622800,
  "photo": "base64_image_data"
}

Success Response (Within Radius):
{
  "success": true,
  "type": "checkin",
  "message": "Check-in successful",
  "distance": 45
}

Error Response (Outside Radius):
{
  "success": false,
  "reason": "OUTSIDE_ZONE",
  "message": "You are 250m away from the office (limit: 100m)",
  "distance": 250,
  "allowedRadius": 100
}
```

---

## 🎨 Admin UI Features

### Geofence Settings Page
- **Office Latitude Input** - Decimal input with 6 decimal places
- **Office Longitude Input** - Decimal input with 6 decimal places
- **Allowed Radius Input** - Integer input (10-10000 meters)
- **Current Configuration Display** - Shows active settings
- **Instructions** - How to find coordinates using Google Maps
- **Save Button** - Updates configuration in database
- **Validation** - Client and server-side validation

---

## 🔐 Security Features

1. **Authentication Required** - All endpoints require JWT token
2. **Admin-Only Updates** - Only admins can modify geofence settings
3. **Input Validation**:
   - Latitude: -90 to 90
   - Longitude: -180 to 180
   - Radius: 10 to 10000 meters
4. **Database Validation** - Mongoose schema validation
5. **Real-time Updates** - Changes apply immediately

---

## ⚙️ Environment Variables

```env
# Geofence Configuration (Default Values)
OFFICE_LAT=26.133402482129057
OFFICE_LNG=91.62278628045627
DEFAULT_RADIUS=100
```

These are used as defaults when no configuration exists in the database.

---

## 🚨 Edge Cases Handled

### 1. **Location Permission Denied**
- Frontend shows error: "Location access is required to mark attendance"
- QR scan blocked until permission granted

### 2. **Low GPS Accuracy**
- System processes request even with low accuracy
- Logs accuracy level for admin review

### 3. **No Geofence Config in Database**
- Automatically creates default config from environment variables
- Ensures system works out of the box

### 4. **Admin Changes Radius During Scan**
- Always uses latest database value
- No caching issues

### 5. **Valid QR but Outside Zone**
- Attendance denied with HTTP 403
- Logs denial with distance and reason
- Clear error message to employee

---

## 📱 Employee Experience

### Success Flow
1. Open attendance app
2. Allow location access
3. Scan QR code
4. See: ✅ "Attendance marked successfully (45m from office)"

### Failure Flow
1. Open attendance app
2. Allow location access
3. Scan QR code
4. See: ❌ "Attendance denied — you are 250m away from the office (limit: 100m)"

---

## 🧪 Testing Checklist

### Backend
- [ ] Create default geofence config on first run
- [ ] Get geofence config API works
- [ ] Update geofence config API works (Admin only)
- [ ] QR scan validates distance correctly
- [ ] Attendance approved when within radius
- [ ] Attendance denied when outside radius
- [ ] Geolocation data saved in attendance record
- [ ] Distance calculation accurate (Haversine formula)

### Frontend
- [ ] Geofence settings page loads
- [ ] Admin can view current configuration
- [ ] Admin can update configuration
- [ ] Validation works (lat/lng/radius ranges)
- [ ] Save button updates database
- [ ] Success/error messages display correctly
- [ ] Instructions are clear and helpful

### Integration
- [ ] Employee QR scan requests location permission
- [ ] Location sent to backend with QR scan
- [ ] Success message shows distance
- [ ] Error message shows distance and limit
- [ ] Admin changes apply immediately to scans

---

## 📈 Benefits

1. **Prevents Remote Attendance** - Employees must be physically present
2. **Flexible Configuration** - Admin can adjust radius as needed
3. **Audit Trail** - All scan locations logged
4. **Real-time Validation** - Instant feedback to employees
5. **Accurate Distance** - Haversine formula provides precise measurements
6. **Easy Setup** - Default values from environment variables
7. **No Code Changes** - Admin updates via UI

---

## 🔮 Future Enhancements

- [ ] Multiple office locations support
- [ ] Department-specific geofences
- [ ] Time-based radius (stricter during peak hours)
- [ ] GPS accuracy threshold enforcement
- [ ] Map visualization with geofence circle
- [ ] Historical location tracking
- [ ] Geofence violation reports
- [ ] Mobile app with better GPS accuracy

---

## 📚 Files Created/Modified

### Backend (5 files)
1. ✨ **NEW**: `models/AdminSettings.js`
2. ✨ **NEW**: `controllers/adminSettings.controller.js`
3. ✨ **NEW**: `routes/adminSettings.routes.js`
4. ✅ **UPDATED**: `models/Attendance.js`
5. ✅ **UPDATED**: `controllers/attendance.controller.js`
6. ✅ **UPDATED**: `server.js`
7. ✅ **UPDATED**: `.env`

### Frontend (5 files)
1. ✨ **NEW**: `src/api/geofenceApi.js`
2. ✨ **NEW**: `src/pages/GeofenceSettings.jsx`
3. ✅ **UPDATED**: `src/App.jsx`
4. ✅ **UPDATED**: `src/components/Sidebar.jsx`

### Documentation (1 file)
1. ✨ **NEW**: `GEOFENCE-IMPLEMENTATION-SUMMARY.md`

---

## ✅ Implementation Status

**Backend**: ✅ Complete  
**Frontend**: ✅ Complete  
**Documentation**: ✅ Complete  
**Testing**: ⏳ Ready for testing  

---

## 🎉 Summary

The geofence-based QR attendance validation system is **fully implemented** and ready for use! 

**Key Features**:
- ✅ GPS-based location validation
- ✅ Configurable office location and radius
- ✅ Haversine formula for accurate distance calculation
- ✅ Admin UI for easy configuration
- ✅ Detailed logging and audit trail
- ✅ Real-time validation
- ✅ Clear error messages

**Admin can now**:
- Set office location coordinates
- Configure allowed radius
- View current configuration
- Update settings anytime

**Employees must**:
- Be within the allowed radius
- Have location permission enabled
- Scan QR code from office premises

**System ensures**:
- No remote attendance marking
- Accurate location tracking
- Immediate validation feedback
- Complete audit trail

---

**Implementation Complete! 🚀**
