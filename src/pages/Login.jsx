import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await api.post("/auth/login", {
        email,
        password,
      });

      const token = res.data.token;
      const user = res.data.user;

      // Save JWT token
      localStorage.setItem("token", token);

      // Save logged-in user
      localStorage.setItem("user", JSON.stringify(user));

      alert("Login successful 🎉");

      // Admin → Admin Dashboard
      if (user?.role === "admin") {
        navigate("/admin");
      } else {
        // Normal user → Home
        navigate("/");
      }

    } catch (error) {
      console.log("Login Error:", error);

      alert(
        error.response?.data?.message ||
          "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">

      <div className="auth-card">

        <div className="auth-logo">
          🎬 Cine<span>Book</span>
        </div>

        <h1>Welcome Back</h1>

        <p className="auth-subtitle">
          Login to continue your movie journey
        </p>

        <form onSubmit={handleLogin}>

          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />

          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>

        <p className="auth-bottom">
          Don't have an account?{" "}
          <Link to="/signup">
            Create Account
          </Link>
        </p>

      </div>

    </main>
  );
};

export default Login;