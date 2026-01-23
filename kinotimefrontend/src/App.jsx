import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";

import Login from "./auth/Login";
import Register from "./auth/Register";

import PlayingNow from "./user/pages/PlayingNow";
import AllMovies from "./user/pages/AllMovies";
import AboutUs from "./user/pages/AboutUs";
import ComingSoon from "./user/pages/ComingSoon";

import AdminLayout from "./admin/layout/AppLayout";

import AdminMovies from "./admin/pages/AdminMovies";
import AdminHalls from "./admin/pages/AdminHalls";

import Unauthorized from "./pages/Unauthorized";

function ProtectedRoute({ allowedRoles, children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/auth/login" replace />;

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));

  // Sync token across tabs
  useEffect(() => {
    const sync = () => setToken(localStorage.getItem("token"));
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  // Update token in same tab (login/logout)
  useEffect(() => {
    const interval = setInterval(() => {
      setToken(localStorage.getItem("token"));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Update role whenever token changes
  useEffect(() => {
    if (token) {
      try {
        const payloadBase64 = token.split(".")[1];
        const payloadJson = atob(payloadBase64);
        const payload = JSON.parse(payloadJson);
        const roleFromToken =
          payload.role ||
          payload.Role ||
          payload.roles?.[0] ||
          payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
          "User";
        setRole(roleFromToken);
        localStorage.setItem("role", roleFromToken);
      } catch {
        setRole(null);
        localStorage.removeItem("role");
      }
    } else {
      setRole(null);
      localStorage.removeItem("role");
    }
  }, [token]);

  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />

        {/* USER + ADMIN */}
        <Route
          path="/playing"
          element={
            <ProtectedRoute allowedRoles={["User"]}>
              <PlayingNow />
            </ProtectedRoute>
          }
        />
        <Route
          path="/movies"
          element={
            <ProtectedRoute allowedRoles={["User"]}>
              <AllMovies />
            </ProtectedRoute>
          }
        />
        <Route
          path="/about"
          element={
            <ProtectedRoute allowedRoles={["User"]}>
              <AboutUs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coming-soon"
          element={
            <ProtectedRoute allowedRoles={["User"]}>
              <ComingSoon />
            </ProtectedRoute>
          }
        />

        {/* ADMIN ONLY */}
        <Route
          path="/admin/movies"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminLayout>
                <AdminMovies />
              </AdminLayout>
            </ProtectedRoute>
  }
/>

        <Route
          path="/admin/halls"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminLayout>
                <AdminHalls />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* UNAUTHORIZED */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/auth/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
