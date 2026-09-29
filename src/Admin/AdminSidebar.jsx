import { NavLink } from "react-router-dom";

const AdminSidebar = ({ open, setOpen }) => {
  const menu = [
    {
      title: "MAIN",
      items: [
        { name: "Dashboard", icon: "📊", path: "/admin" },
      ],
    },
    {
      title: "MANAGEMENT",
      items: [
        { name: "Movies", icon: "🎬", path: "/admin/movies" },
        { name: "Theatres", icon: "🎦", path: "/admin/theatres" },
        { name: "Screens", icon: "🖥️", path: "/admin/screens" },
        { name: "Shows", icon: "🕐", path: "/admin/shows" },
        { name: "Seats", icon: "💺", path: "/admin/seats" },
      ],
    },
    {
      title: "TRANSACTIONS",
      items: [
        { name: "Bookings", icon: "🎟️", path: "/admin/bookings" },
        { name: "Payments", icon: "💳", path: "/admin/payments" },
        { name: "Tickets", icon: "🎫", path: "/admin/tickets" },
      ],
    },
    {
      title: "SYSTEM",
      items: [
        { name: "Users", icon: "👥", path: "/admin/users" },
        { name: "Analytics", icon: "📈", path: "/admin/analytics" },
        // NEW: fraud & anomaly detection page
        { name: "Fraud & Security", icon: "🛡️", path: "/admin/fraud" },
        { name: "Settings", icon: "⚙️", path: "/admin/settings" },
      ],
    },
  ];

  return (
    <>
      {open && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setOpen(false)}
        />
      )}

      <aside className={`admin-sidebar ${open ? "open" : ""}`}>

        <div className="admin-logo">
          <div className="admin-logo-icon">🎬</div>

          <div>
            <h2>
              Cine<span>Book</span>
            </h2>
            <small>ADMIN PANEL</small>
          </div>
        </div>

        <div className="admin-menu">

          {menu.map((section) => (
            <div className="admin-menu-section" key={section.title}>

              <p className="admin-menu-title">
                {section.title}
              </p>

              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/admin"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `admin-menu-item ${
                      isActive ? "active" : ""
                    }`
                  }
                >
                  <span className="admin-menu-icon">
                    {item.icon}
                  </span>

                  <span>{item.name}</span>
                </NavLink>
              ))}

            </div>
          ))}

        </div>

        <div className="admin-sidebar-bottom">

          <div className="admin-user-mini">
            <div className="admin-avatar">
              A
            </div>

            <div>
              <strong>System Admin</strong>
              <span>Administrator</span>
            </div>
          </div>

        </div>

      </aside>
    </>
  );
};

export default AdminSidebar;