import { useNavigate } from "react-router-dom";

const AdminNavbar = ({ setOpen }) => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <header className="admin-navbar">

      <div className="admin-nav-left">

        <button
          className="admin-menu-toggle"
          onClick={() => setOpen(true)}
        >
          ☰
        </button>

        <div>
          <p className="admin-nav-label">
            SYSTEM ADMINISTRATION
          </p>

          <h1>
            Dashboard
          </h1>
        </div>

      </div>

      <div className="admin-nav-right">

        <button className="admin-icon-btn">
          🔔
          <span className="notification-dot"></span>
        </button>

        <div className="admin-nav-profile">

          <div className="admin-avatar">
            A
          </div>

          <div>
            <strong>Admin</strong>
            <span>System Administrator</span>
          </div>

        </div>

        <button
          className="admin-logout"
          onClick={logout}
        >
          🚪 Logout
        </button>

      </div>

    </header>
  );
};

export default AdminNavbar;