import { useEffect, useState } from "react";
import api from "../services/api";
import "./AdminAnalytics.css";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        console.log("Calling analytics API...");

        const res = await api.get("/admin/analytics");

        console.log("Analytics Response:", res.data);

        setData(res.data);
      } catch (error) {
        console.log("Analytics Error:", error);
        console.log("Status:", error.response?.status);
        console.log("Response:", error.response?.data);

        setError(
          error.response?.data?.message ||
            `Analytics API Error (${error.response?.status || "Network Error"})`
        );
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          Loading analytics...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <h3>Unable to load analytics</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          No analytics data available.
        </div>
      </div>
    );
  }

  const monthlyRevenue = data.monthlyRevenue || [];
  const topMovies = data.topMovies || [];

  const maxRevenue = Math.max(...monthlyRevenue, 1);

  return (
    <div className="admin-page">

      {/* HEADER */}
      <div className="admin-page-header">
        <div>
          <span>PERFORMANCE</span>

          <h1>Analytics</h1>

          <p>
            Revenue and booking trends across CineBook.
          </p>
        </div>
      </div>

      {/* STATS */}
      <div className="admin-analytics-grid">

        <div className="admin-analytics-card">
          <span>TOTAL REVENUE</span>

          <h3>
            ₹{Number(data.totalRevenue || 0).toLocaleString("en-IN")}
          </h3>
        </div>

        <div className="admin-analytics-card">
          <span>TOTAL BOOKINGS</span>

          <h3>
            {data.totalBookings || 0}
          </h3>
        </div>

        <div className="admin-analytics-card">
          <span>AVG. BOOKING VALUE</span>

          <h3>
            ₹{Number(data.averageBookingValue || 0).toLocaleString("en-IN")}
          </h3>
        </div>

      </div>

      {/* MONTHLY REVENUE */}
      <div className="admin-chart-panel">

        <h3>Monthly Revenue</h3>

        <div className="admin-bar-chart">

          {monthlyRevenue.map((value, index) => (
            <div className="bar-col" key={index}>

              <div
                className="bar"
                style={{
                  height: `${Math.max(
                    (Number(value || 0) / maxRevenue) * 100,
                    2
                  )}%`,
                }}
                title={`₹${Number(value || 0).toLocaleString("en-IN")}`}
              />

              <span className="bar-label">
                {MONTHS[index]}
              </span>

            </div>
          ))}

        </div>

      </div>

      {/* TOP MOVIES */}
      <div className="admin-chart-panel">

        <h3>Top Movies by Bookings</h3>

        {topMovies.length === 0 ? (
          <p className="admin-cell-muted">
            No booking data yet.
          </p>
        ) : (
          <div className="admin-top-list">

            {topMovies.map((movie, index) => (
              <div
                className="admin-top-list-item"
                key={movie.title}
              >

                <div className="admin-top-list-rank">
                  {index + 1}
                </div>

                <div className="admin-top-list-title">
                  {movie.title}
                </div>

                <div className="admin-top-list-count">
                  {movie.count} booking
                  {movie.count !== 1 ? "s" : ""}
                </div>

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
};

export default AdminAnalytics;