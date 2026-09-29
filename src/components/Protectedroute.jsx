import { Navigate, useLocation } from "react-router-dom";

// Wrap any route that needs a logged-in user with this component.
// If there's no token, it redirects to /login immediately -- before
// the page ever mounts and tries an API call that would fail with
// "token required" (which was showing up as a raw alert()).
//
// It also remembers where the user was trying to go (via location
// state), so Login.jsx can send them back there after a successful
// login instead of always landing on Home.

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
