import { Navigate, Outlet } from "react-router-dom";

const decodeJwtPayload = (token) => {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;
    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
};

const isJwtLike = (token) => token.split(".").length === 3;

const isTokenValid = (token) => {
  if (!token) return false;
  if (!isJwtLike(token)) return true;
  const payload = decodeJwtPayload(token);
  if (!payload) return false;
  if (!payload.exp) return true;
  return Date.now() < payload.exp * 1000;
};

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  const storedRole = localStorage.getItem("role");
  const role = storedRole ? storedRole.toLowerCase() : null;

  if (!token || !isTokenValid(token)) {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    return <Navigate to="/auth/login" replace />;
  }

  const normalizedRoles = Array.isArray(allowedRoles)
    ? allowedRoles.map((allowedRole) => allowedRole.toLowerCase())
    : null;

  if (normalizedRoles && normalizedRoles.length > 0) {
    if (!role || !normalizedRoles.includes(role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
