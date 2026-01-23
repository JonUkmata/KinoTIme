import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
import { apiPost } from "../api";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const getRoleFromToken = (token) => {
    try {
      if (!token || token.split(".").length < 2) return null;

      // JWT payload is base64url ( - _ ) not standard base64 ( + / )
      const payloadBase64Url = token.split(".")[1];
      const payloadBase64 = payloadBase64Url.replace(/-/g, "+").replace(/_/g, "/");
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);

      return (
        payload.role ||
        payload.Role ||
        payload.roles?.[0] ||
        payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
        null
      );
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const u = username.trim();
    const p = password.trim();

    if (!u || !p) {
      setError("Please enter username and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiPost("/api/Auth/login", { username: u, password: p });
      console.log("API response:", res);

      if (!res?.token) {
        setError("Login failed.");
        return;
      }

      // 1) Ruaj token
      localStorage.setItem("token", res.token);

      // 2) Merr rolin nga API ose nga JWT, dhe vendos fallback
      const roleFromApiOrJwt = res.role || getRoleFromToken(res.token);
      const finalRole = roleFromApiOrJwt || "User";

      localStorage.setItem("role", finalRole);

      // 3) Redirect sipas rolit
      if (finalRole === "Admin") {
        navigate("/admin/movies", { replace: true });
      } else {
        navigate("/playing", { replace: true }); // ose "/about" nëse e do ashtu
      }
    } catch (err) {
      console.log("API error:", err);
      setError("Invalid credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      {error && (
        <div style={{ color: "#ff1a1a", marginBottom: 12 }}>
          {error}
        </div>
      )}

      <div
        className="login-left"
        style={{
          background: "url('/Clogin.jpg') no-repeat center center/cover, #111",
          opacity: 0.7,
        }}
      />

      <div className="login-right">
        <div className="login-logo">
          <span className="logo-icon">🎬</span>
          <span className="logo-text">KinoTime</span>
        </div>

        <h1>Welcome Back</h1>
        <p className="login-subtitle">Sign in to continue your cinema experience</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>Username</label>
          <input
            type="text"
            placeholder="your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <button type="submit" className="login-btn" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="login-register">
          Don't have an account? <Link to="/auth/register">Create Account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
