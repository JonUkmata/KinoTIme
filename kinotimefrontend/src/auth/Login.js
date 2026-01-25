import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
    <div className="flex min-h-screen bg-[#111] max-[700px]:flex-col">
      <div
        className="flex-1 bg-[#111] opacity-70 max-[700px]:hidden"
        style={{
          background: "url('/Clogin.jpg') no-repeat center center/cover, #111",
        }}
      />

      <div className="flex flex-1 flex-col items-start justify-center bg-[#18181b] px-[120px] text-white max-[900px]:px-8 max-[700px]:min-h-screen max-[700px]:w-full max-[700px]:items-center max-[700px]:px-3">
        <div className="mb-8 flex items-center">
          <span className="mr-3 rounded-[12px] bg-[#e50914] px-3 py-2 text-[2.2rem] text-white">🎬</span>
          <span className="text-[2rem] font-bold tracking-[1px]">KinoTime</span>
        </div>

        <h1 className="mb-2 text-[2.5rem] font-semibold">Welcome Back</h1>
        <p className="mb-8 text-[#b3b3b3]">Sign in to continue your cinema experience</p>

        {error && <div className="mb-3 text-[#ff1a1a]">{error}</div>}

        <form className="flex w-full flex-col" onSubmit={handleSubmit}>
          <label className="mb-[6px] text-base font-medium">Username</label>
          <input
            className="mb-[18px] rounded-lg bg-[#232323] px-4 py-3 text-base text-white outline-none focus:ring-2 focus:ring-[#e50914]"
            type="text"
            placeholder="your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />

          <label className="mb-[6px] text-base font-medium">Password</label>
          <input
            className="mb-[18px] rounded-lg bg-[#232323] px-4 py-3 text-base text-white outline-none focus:ring-2 focus:ring-[#e50914]"
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <button
            type="submit"
            className="mb-[18px] mt-2 rounded-lg bg-[#ff1a1a] py-3.5 text-[1.1rem] font-semibold text-white transition-colors hover:bg-[#c40000] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-base text-[#b3b3b3]">
          Don't have an account?
          <Link className="ml-1 font-medium text-[#e50914] hover:underline" to="/auth/register">Create Account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
