import { useEffect, useState } from "react";
import { MapPin, Clock, Save, AlertCircle, Navigation, ExternalLink, Calendar } from "lucide-react";
import {
  getGeofenceConfig,
  updateGeofenceConfig,
  getAttendanceTimes,
  updateAttendanceTimes,
  getLeaveDefaults,
  updateLeaveDefaults
} from "../api/settingsApi";

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Geofence state
  const [geofence, setGeofence] = useState({
    officeLat: "",
    officeLng: "",
    allowedRadius: ""
  });

  // Attendance times state
  const [times, setTimes] = useState({
    checkinStart: "",
    checkinEnd: "",
    checkoutStart: "",
    checkoutEnd: "",
    lateThreshold: ""
  });

  // Leave defaults state
  const [leaveDefaults, setLeaveDefaults] = useState({
    casual: "",
    sick: "",
    annual: "",
    emergency: "",
    maternity: "",
    paternity: "",
    other: ""
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      // Fetch geofence config
      const geofenceRes = await getGeofenceConfig();
      if (geofenceRes.success) {
        setGeofence(geofenceRes.data);
      }

      // Fetch attendance times
      const timesRes = await getAttendanceTimes();
      if (timesRes.success) {
        setTimes(timesRes.data);
      }

      // Fetch leave defaults
      const leaveRes = await getLeaveDefaults();
      if (leaveRes.success) {
        setLeaveDefaults(leaveRes.data);
      }

    } catch (error) {
      console.error("Error fetching settings:", error);
      setMessage({
        type: "error",
        text: "Failed to load settings"
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage({
        type: "error",
        text: "Geolocation is not supported by your browser"
      });
      return;
    }

    setGettingLocation(true);
    setMessage({ type: "", text: "" });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setGeofence({
          ...geofence,
          officeLat: latitude.toString(),
          officeLng: longitude.toString()
        });
        setMessage({
          type: "success",
          text: `Location captured: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        });
        setGettingLocation(false);
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      },
      (error) => {
        let errorMessage = "Failed to get location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please enable location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        setMessage({
          type: "error",
          text: errorMessage
        });
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const openLocationOnMap = () => {
    const lat = parseFloat(geofence.officeLat);
    const lng = parseFloat(geofence.officeLng);

    if (isNaN(lat) || isNaN(lng)) {
      setMessage({
        type: "error",
        text: "Please enter valid latitude and longitude first"
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      return;
    }

    // Open Google Maps with the coordinates
    const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}&z=17`;
    window.open(mapsUrl, "_blank");
  };

  const handleLeaveDefaultsSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await updateLeaveDefaults(leaveDefaults);

      if (response.success) {
        setMessage({
          type: "success",
          text: "Leave defaults updated successfully!"
        });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update leave defaults"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleGeofenceSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await updateGeofenceConfig({
        officeLat: parseFloat(geofence.officeLat),
        officeLng: parseFloat(geofence.officeLng),
        allowedRadius: parseInt(geofence.allowedRadius)
      });

      if (response.success) {
        setMessage({
          type: "success",
          text: "Geofence settings updated successfully!"
        });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update geofence settings"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTimesSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await updateAttendanceTimes(times);

      if (response.success) {
        setMessage({
          type: "success",
          text: "Attendance times updated successfully!"
        });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update attendance times"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">System Settings</h2>
        <p className="text-sm text-gray-500">
          Configure geofence and attendance time settings
        </p>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div
          className={`flex items-center gap-2 p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <AlertCircle className="w-5 h-5" />
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Geofence Settings */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-semibold">Geofence Settings</h3>
          </div>

          <form onSubmit={handleGeofenceSubmit} className="space-y-4">
            {/* Action Buttons Row */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={gettingLocation}
                className="flex items-center justify-center gap-2 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <Navigation className="w-4 h-4" />
                {gettingLocation ? "Getting..." : "Use Current"}
              </button>

              <button
                type="button"
                onClick={openLocationOnMap}
                className="flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Check on Map
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or enter manually</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Office Latitude
              </label>
              <input
                type="number"
                step="any"
                value={geofence.officeLat}
                onChange={(e) =>
                  setGeofence({ ...geofence, officeLat: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="26.133402482129057"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Valid range: -90 to 90
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Office Longitude
              </label>
              <input
                type="number"
                step="any"
                value={geofence.officeLng}
                onChange={(e) =>
                  setGeofence({ ...geofence, officeLng: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="91.62278628045627"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Valid range: -180 to 180
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allowed Radius (meters)
              </label>
              <input
                type="number"
                value={geofence.allowedRadius}
                onChange={(e) =>
                  setGeofence({ ...geofence, allowedRadius: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="100"
                min="10"
                max="10000"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Valid range: 10 to 10,000 meters
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Geofence Settings"}
            </button>
          </form>
        </div>

        {/* Attendance Times Settings */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-semibold">Attendance Times</h3>
          </div>

          <form onSubmit={handleTimesSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in Start
                </label>
                <input
                  type="time"
                  value={times.checkinStart}
                  onChange={(e) =>
                    setTimes({ ...times, checkinStart: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in End
                </label>
                <input
                  type="time"
                  value={times.checkinEnd}
                  onChange={(e) =>
                    setTimes({ ...times, checkinEnd: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Late Threshold
              </label>
              <input
                type="time"
                value={times.lateThreshold}
                onChange={(e) =>
                  setTimes({ ...times, lateThreshold: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Employees checking in after this time will be marked as late
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-out Start
                </label>
                <input
                  type="time"
                  value={times.checkoutStart}
                  onChange={(e) =>
                    setTimes({ ...times, checkoutStart: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-out End
                </label>
                <input
                  type="time"
                  value={times.checkoutEnd}
                  onChange={(e) =>
                    setTimes({ ...times, checkoutEnd: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Attendance Times"}
            </button>
          </form>
        </div>
      </div>

      {/* Leave Defaults Settings */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-semibold">Leave Allocation Defaults</h3>
        </div>

        <form onSubmit={handleLeaveDefaultsSubmit} className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Set default leave allocations for new employees (days per year)
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Casual Leave
              </label>
              <input
                type="number"
                min="0"
                max="365"
                value={leaveDefaults.casual}
                onChange={(e) =>
                  setLeaveDefaults({ ...leaveDefaults, casual: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sick Leave
              </label>
              <input
                type="number"
                min="0"
                max="365"
                value={leaveDefaults.sick}
                onChange={(e) =>
                  setLeaveDefaults({ ...leaveDefaults, sick: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Annual Leave
              </label>
              <input
                type="number"
                min="0"
                max="365"
                value={leaveDefaults.annual}
                onChange={(e) =>
                  setLeaveDefaults({ ...leaveDefaults, annual: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Leave
              </label>
              <input
                type="number"
                min="0"
                max="365"
                value={leaveDefaults.emergency}
                onChange={(e) =>
                  setLeaveDefaults({ ...leaveDefaults, emergency: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maternity Leave
              </label>
              <input
                type="number"
                min="0"
                max="365"
                value={leaveDefaults.maternity}
                onChange={(e) =>
                  setLeaveDefaults({ ...leaveDefaults, maternity: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paternity Leave
              </label>
              <input
                type="number"
                min="0"
                max="365"
                value={leaveDefaults.paternity}
                onChange={(e) =>
                  setLeaveDefaults({ ...leaveDefaults, paternity: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Other Leave
              </label>
              <input
                type="number"
                min="0"
                max="365"
                value={leaveDefaults.other}
                onChange={(e) =>
                  setLeaveDefaults({ ...leaveDefaults, other: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Leave Defaults"}
          </button>
        </form>
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Important Information</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Use Current:</strong> Automatically set office location to your current GPS position</li>
          <li>• <strong>Check on Map:</strong> Opens Google Maps to verify the configured location</li>
          <li>• <strong>Leave Defaults:</strong> Set default leave allocations that will be applied to new employees</li>
          <li>• Geofence settings control the allowed location radius for attendance</li>
          <li>• Attendance times define when employees can check-in and check-out</li>
          <li>• All location data (latitude, longitude, distance) is logged in the database</li>
          <li>• Changes take effect immediately for all employees</li>
        </ul>
      </div>
    </div>
  );
};

export default Settings;
