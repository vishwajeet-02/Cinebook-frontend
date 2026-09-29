import { useEffect, useState } from "react";
import "./AdminSettings.css";

// NOTE: these settings are stored in the browser (localStorage) since
// there's no dedicated Settings model/endpoint on the backend yet.
// If you want these to apply platform-wide (not just on this admin's
// browser), we'd need a Settings collection + GET/PUT /api/admin/settings
// endpoints -- happy to add that if needed.

const DEFAULT_SETTINGS = {
  siteName: "CineBook",
  supportEmail: "support@cinebook.com",
  currency: "INR",
  bookingWindowMinutes: 15,
  maintenanceMode: false,
  allowNewSignups: true,
  emailNotifications: true
};

const AdminSettings = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("cinebook_admin_settings");
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch {
        // ignore malformed stored value
      }
    }
  }, []);

  const updateField = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem("cinebook_admin_settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem("cinebook_admin_settings");
    setSaved(false);
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <span>SYSTEM</span>
          <h1>Settings</h1>
          <p>General configuration for the CineBook platform.</p>
        </div>
      </div>

      <div className="admin-settings-grid">
        <div className="admin-settings-card">
          <h3>General</h3>
          <p>Basic site identity and contact information.</p>

          <div className="admin-field">
            <label>Site Name</label>
            <input
              value={settings.siteName}
              onChange={(e) => updateField("siteName", e.target.value)}
            />
          </div>

          <div className="admin-field">
            <label>Support Email</label>
            <input
              type="email"
              value={settings.supportEmail}
              onChange={(e) => updateField("supportEmail", e.target.value)}
            />
          </div>

          <div className="admin-field">
            <label>Currency</label>
            <select
              value={settings.currency}
              onChange={(e) => updateField("currency", e.target.value)}
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>
        </div>

        <div className="admin-settings-card">
          <h3>Booking Rules</h3>
          <p>How bookings and seat locks behave.</p>

          <div className="admin-field">
            <label>Seat Lock Window (minutes)</label>
            <input
              type="number"
              min="1"
              value={settings.bookingWindowMinutes}
              onChange={(e) =>
                updateField(
                  "bookingWindowMinutes",
                  Number(e.target.value)
                )
              }
            />
          </div>

          <div className="admin-toggle-row">
            <div>
              <strong>Allow New Signups</strong>
              <small>Turn off to temporarily pause registrations</small>
            </div>
            <div
              className={`admin-switch ${settings.allowNewSignups ? "on" : ""}`}
              onClick={() =>
                updateField("allowNewSignups", !settings.allowNewSignups)
              }
            />
          </div>

          <div className="admin-toggle-row">
            <div>
              <strong>Maintenance Mode</strong>
              <small>Show a maintenance banner to all users</small>
            </div>
            <div
              className={`admin-switch ${settings.maintenanceMode ? "on" : ""}`}
              onClick={() =>
                updateField("maintenanceMode", !settings.maintenanceMode)
              }
            />
          </div>
        </div>

        <div className="admin-settings-card">
          <h3>Notifications</h3>
          <p>Control automated emails sent to users.</p>

          <div className="admin-toggle-row">
            <div>
              <strong>Email Notifications</strong>
              <small>Booking confirmations, payment receipts, etc.</small>
            </div>
            <div
              className={`admin-switch ${settings.emailNotifications ? "on" : ""}`}
              onClick={() =>
                updateField(
                  "emailNotifications",
                  !settings.emailNotifications
                )
              }
            />
          </div>
        </div>
      </div>

      <div className="admin-settings-save-bar">
        <button className="admin-btn outline" onClick={handleReset}>
          Reset to Defaults
        </button>
        <button className="admin-btn gold" onClick={handleSave}>
          {saved ? "✓ Saved" : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;
