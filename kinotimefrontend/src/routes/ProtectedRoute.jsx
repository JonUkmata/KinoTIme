import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // ❌ Jo i loguar
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ❌ I loguar por s’ka rol të lejuar
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // ✅ I autorizuar
  return <Outlet />;
};

export default ProtectedRoute;
