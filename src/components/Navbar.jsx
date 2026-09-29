import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar">

      <Link to="/" className="logo">
        <span>🎬</span> Cine<span>Book</span>
      </Link>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/movies">Movies</Link>
        <Link to="/bookings">My Bookings</Link>
      </div>

      <div className="nav-actions">
        {token ? (
          <>
            <Link to="/profile" className="profile-btn">
              👤 Profile
            </Link>

            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="login-btn">
              Login
            </Link>

            <Link to="/signup" className="signup-btn">
              Sign Up
            </Link>
          </>
        )}
      </div>

    </nav>
  );
};

export default Navbar;
