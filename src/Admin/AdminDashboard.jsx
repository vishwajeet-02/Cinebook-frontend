import { useEffect, useState } from "react";
import api from "../services/api";

import "./Admin.css";

const AdminDashboard = () => {

  const [stats, setStats] = useState({
    users: 0,
    movies: 0,
    theatres: 0,
    shows: 0,
    bookings: 0,
    revenue: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const loadDashboard = async () => {

      try {

        const [
          moviesRes,
          theatresRes,
          showsRes,
          bookingsRes,
        ] = await Promise.all([
          api.get("/movies"),
          api.get("/theatres"),
          api.get("/shows"),
          api.get("/bookings/my"),
        ]);

        const bookings = bookingsRes.data || [];

        const revenue = bookings
          .filter(
            (booking) =>
              booking.paymentStatus === "Paid"
          )
          .reduce(
            (total, booking) =>
              total + Number(booking.totalAmount || 0),
            0
          );

        setStats({
          users: 0,
          movies: moviesRes.data?.length || 0,
          theatres: theatresRes.data?.length || 0,
          shows: showsRes.data?.length || 0,
          bookings: bookings.length,
          revenue,
        });

      } catch (error) {

        console.log(
          "Admin Dashboard Error:",
          error
        );

      } finally {

        setLoading(false);

      }

    };

    loadDashboard();

  }, []);

  const statCards = [
    {
      title: "Total Movies",
      value: stats.movies,
      icon: "🎬",
      className: "red",
    },
    {
      title: "Total Theatres",
      value: stats.theatres,
      icon: "🎦",
      className: "purple",
    },
    {
      title: "Total Shows",
      value: stats.shows,
      icon: "🕐",
      className: "blue",
    },
    {
      title: "Total Bookings",
      value: stats.bookings,
      icon: "🎟️",
      className: "green",
    },
    {
      title: "Total Revenue",
      value: `₹${stats.revenue.toLocaleString("en-IN")}`,
      icon: "💰",
      className: "gold",
    },
    {
      title: "Registered Users",
      value: stats.users,
      icon: "👥",
      className: "pink",
    },
  ];

  // CHANGED: this used to wrap everything in its own
  // <div className="admin-layout"> with its own <AdminSidebar /> and
  // <AdminNavbar />. But AdminLayout.jsx (the parent route element)
  // already renders those and puts this component inside <Outlet />
  // -- so the sidebar and navbar were being rendered twice.
  // This now returns just the actual dashboard content.
  return (
    <>

      {/* Welcome */}

      <section className="admin-welcome">

        <div>

          <span>
            CINEBOOK ADMIN
          </span>

          <h2>
            Welcome back, Admin 👋
          </h2>

          <p>
            Here's what's happening with
            your movie booking platform.
          </p>

        </div>

        <div className="admin-date">
          📅{" "}
          {new Date().toLocaleDateString(
            "en-IN",
            {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }
          )}
        </div>

      </section>


      {/* Stats */}

      <section className="admin-stats-grid">

        {statCards.map((card) => (

          <div
            className="admin-stat-card"
            key={card.title}
          >

            <div className="admin-stat-top">

              <div
                className={`admin-stat-icon ${card.className}`}
              >
                {card.icon}
              </div>

              <span className="admin-stat-arrow">
                ↗
              </span>

            </div>

            <div className="admin-stat-info">

              <span>
                {card.title}
              </span>

              <h3>
                {loading
                  ? "..."
                  : card.value}
              </h3>

            </div>

          </div>

        ))}

      </section>


      {/* Main Dashboard */}

      <section className="admin-dashboard-grid">

        {/* Revenue */}

        <div className="admin-panel revenue-panel">

          <div className="admin-panel-header">

            <div>
              <span>
                PERFORMANCE
              </span>

              <h3>
                Revenue Overview
              </h3>
            </div>

            <select>
              <option>
                This Year
              </option>

              <option>
                This Month
              </option>

              <option>
                This Week
              </option>
            </select>

          </div>

          <div className="revenue-placeholder">

            <div className="fake-chart">

              <div style={{ height: "35%" }} />
              <div style={{ height: "50%" }} />
              <div style={{ height: "42%" }} />
              <div style={{ height: "70%" }} />
              <div style={{ height: "55%" }} />
              <div style={{ height: "80%" }} />
              <div style={{ height: "65%" }} />
              <div style={{ height: "90%" }} />

            </div>

            <div className="chart-labels">

              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Aug</span>

            </div>

          </div>

        </div>


        {/* Quick Actions */}

        <div className="admin-panel quick-panel">

          <div className="admin-panel-header">

            <div>
              <span>
                QUICK ACTIONS
              </span>

              <h3>
                Manage CineBook
              </h3>
            </div>

          </div>

          <div className="quick-actions">

            <button>
              <span>🎬</span>
              <div>
                <strong>Add Movie</strong>
                <small>
                  Create a new movie
                </small>
              </div>
              <b>→</b>
            </button>

            <button>
              <span>🎦</span>
              <div>
                <strong>Add Theatre</strong>
                <small>
                  Register theatre
                </small>
              </div>
              <b>→</b>
            </button>

            <button>
              <span>🕐</span>
              <div>
                <strong>Create Show</strong>
                <small>
                  Schedule a show
                </small>
              </div>
              <b>→</b>
            </button>

            <button>
              <span>📊</span>
              <div>
                <strong>View Analytics</strong>
                <small>
                  Check performance
                </small>
              </div>
              <b>→</b>
            </button>

          </div>

        </div>

      </section>


      {/* System Status */}

      <section className="admin-panel system-panel">

        <div className="admin-panel-header">

          <div>

            <span>
              SYSTEM
            </span>

            <h3>
              CineBook System Status
            </h3>

          </div>

          <div className="system-online">
            ● All Systems Operational
          </div>

        </div>

        <div className="system-status-grid">

          <div>
            <span>Backend API</span>
            <strong>● Online</strong>
          </div>

          <div>
            <span>MongoDB</span>
            <strong>● Connected</strong>
          </div>

          <div>
            <span>Payment Gateway</span>
            <strong>● Ready</strong>
          </div>

          <div>
            <span>Ticket Service</span>
            <strong>● Active</strong>
          </div>

        </div>

      </section>

    </>
  );
};

export default AdminDashboard;
