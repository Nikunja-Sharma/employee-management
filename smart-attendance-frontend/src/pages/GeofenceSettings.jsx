import { useState, useEffect } from 'react';
import { getGeofenceConfig, updateGeofenceConfig } from '../api/geofenceApi';
import { MapPin, Save, RefreshCw, AlertCircle } from 'lucide-react';

const GeofenceSettings = () => {
  const [config, setConfig] = useState({
    officeLat: 26.133402482129057,
    officeLng: 91.62278628045627,
    allowedRadius: 100
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await getGeofenceConfig();
      if (response.success) {
        setConfig(response.data);
      }
    } catch (error) {
      console.error('Error fetching geofence config:', error);
      setMessage({ type: 'error', text: 'Failed to load configuration' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const response = await updateGeofenceConfig(config);
      
      if (response.success) {
        setMessage({ type: 'success', text: 'Geofence configuration updated successfully!' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error('Error updating geofence config:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update configuration' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Geofence Settings</h1>
          <p className="text-gray-600 mt-1">Configure office location and attendance radius</p>
        </div>
        <button
          onClick={fetchConfig}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 
          'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            <AlertCircle size={20} />
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {/* Configuration Form */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="space-y-6">
          {/* Office Latitude */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Office Latitude
            </label>
            <input
              type="number"
              step="0.000001"
              value={config.officeLat}
              onChange={(e) => handleInputChange('officeLat', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="26.133402482129057"
            />
            <p className="text-xs text-gray-500 mt-1">Valid range: -90 to 90</p>
          </div>

          {/* Office Longitude */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Office Longitude
            </label>
            <input
              type="number"
              step="0.000001"
              value={config.officeLng}
              onChange={(e) => handleInputChange('officeLng', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="91.62278628045627"
            />
            <p className="text-xs text-gray-500 mt-1">Valid range: -180 to 180</p>
          </div>

          {/* Allowed Radius */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Allowed Radius (meters)
            </label>
            <input
              type="number"
              step="10"
              value={config.allowedRadius}
              onChange={(e) => handleInputChange('allowedRadius', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="100"
            />
            <p className="text-xs text-gray-500 mt-1">Valid range: 10 to 10000 meters</p>
          </div>

          {/* Current Location Display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <MapPin className="text-blue-600 mt-1" size={20} />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">Current Configuration</h3>
                <div className="space-y-1 text-sm text-blue-800">
                  <p><strong>Location:</strong> {config.officeLat.toFixed(6)}, {config.officeLng.toFixed(6)}</p>
                  <p><strong>Radius:</strong> {config.allowedRadius} meters ({(config.allowedRadius / 1000).toFixed(2)} km)</p>
                  <p className="text-xs text-blue-600 mt-2">
                    Employees must be within this radius to mark attendance
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Map Preview Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-yellow-600 mt-1" size={20} />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-yellow-900 mb-1">How to find coordinates</h3>
                <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                  <li>Open Google Maps and find your office location</li>
                  <li>Right-click on the exact location</li>
                  <li>Click on the coordinates to copy them</li>
                  <li>Paste the latitude and longitude values here</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">📍 About Geofence Validation</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <strong>What is geofencing?</strong> Geofencing ensures employees can only mark attendance when they are physically present at the office location.
          </p>
          <p>
            <strong>How it works:</strong> When an employee scans the QR code, their GPS location is captured and compared with the office location. If they are outside the allowed radius, attendance is denied.
          </p>
          <p>
            <strong>Security:</strong> This prevents employees from marking attendance remotely or from unauthorized locations.
          </p>
          <p className="text-red-600 font-medium mt-3">
            ⚠️ Important: Changes take effect immediately for all employees.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GeofenceSettings;
