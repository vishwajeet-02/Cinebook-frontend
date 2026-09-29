import { useEffect, useState } from "react";
import api from "../services/api";
import "./Admin.css";

const FLAG_ICONS = {
  rapid_bookings: "⚡",
  stale_pending: "⏳",
  high_cancellation: "🔁"
};

const AdminFraud = () => {
  const [alerts, setAlerts] = useState([]);
  const [scannedCount, setScannedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/fraud-alerts");
      setAlerts(res.data.alerts || []);
      setScannedCount(res.data.scannedBookings || 0);
    } catch (error) {
      console.log("Fraud Alerts Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleGenerateSummary = async () => {
    setSummaryLoading(true);
    setSummary("");

    try {
      const res = await api.post("/admin/fraud-summary", { alerts });
      setSummary(res.data.summary);
    } catch (error) {
      console.log("Fraud Summary Error:", error);
      setSummary(
        error.response?.data?.message ||
          "Unable to generate summary right now."
      );
    } finally {
      setSummaryLoading(false);
    }
  };

  const riskLabel = (score) => {
    if (score >= 3) return { text: "High Risk", className: "danger" };
    if (score === 2) return { text: "Medium Risk", className: "gold" };
    return { text: "Low Risk", className: "success" };
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <span>SECURITY</span>
          <h1>Fraud & Anomaly Detection</h1>
          <p>
            Rule-based scan of the last 30 days of bookings ({scannedCount}{" "}
            bookings scanned) -- flags rapid booking bursts, abandoned
            payments, and high cancellation rates.
          </p>
        </div>

        <div className="admin-page-actions">
          <button className="admin-btn outline" onClick={loadAlerts}>
            ↻ Rescan
          </button>

          <button
            className="admin-btn gold"
            onClick={handleGenerateSummary}
            disabled={summaryLoading || alerts.length === 0}
          >
            {summaryLoading ? "✨ Analyzing..." : "✨ Generate AI Summary"}
          </button>
        </div>
      </div>

      {summary && (
        <div className="admin-chart-panel" style={{ marginBottom: "20px" }}>
          <h3>AI Risk Summary</h3>
          <p style={{ color: "#e8eaf5", lineHeight: 1.7, margin: 0 }}>
            {summary}
          </p>
        </div>
      )}

      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-loading">Scanning bookings...</div>
        ) : alerts.length === 0 ? (
          <div className="admin-table-empty">
            ✅ No suspicious activity detected in the last 30 days.
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Risk Level</th>
                <th>Flags</th>
                <th>Total Bookings</th>
                <th>Last Activity</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => {
                const risk = riskLabel(alert.riskScore);
                return (
                  <tr key={alert.user._id}>
                    <td>
                      <div className="admin-row-user">
                        <div className="admin-avatar">
                          {alert.user.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <div className="admin-cell-primary">
                            {alert.user.name}
                          </div>
                          <div className="admin-cell-muted">
                            {alert.user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`admin-badge ${risk.className}`}>
                        {risk.text}
                      </span>
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px"
                        }}
                      >
                        {alert.flags.map((flag, i) => (
                          <span key={i} className="admin-cell-muted">
                            {FLAG_ICONS[flag.type] || "⚠️"} {flag.label} —{" "}
                            {flag.detail}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>{alert.totalBookings}</td>
                    <td className="admin-cell-muted">
                      {new Date(alert.lastActivity).toLocaleDateString(
                        "en-IN",
                        { day: "2-digit", month: "short", year: "numeric" }
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminFraud;