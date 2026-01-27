import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { apiGet } from "../api";

const ProtectedRoute = ({ allowedRoles }) => {
  const [authState, setAuthState] = useState({
    loading: true,
    user: null,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchMe = async () => {
      try {
        const me = await apiGet("/api/Auth/me");
        if (isMounted) {
          setAuthState({ loading: false, user: me });
        }
      } catch {
        if (isMounted) {
          setAuthState({ loading: false, user: null });
        }
      }
    };

    fetchMe();

    return () => {
      isMounted = false;
    };
  }, []);

  if (authState.loading) {
    return null;
  }

  if (!authState.user) {
    return <Navigate to="/auth/login" replace />;
  }

  const normalizedRoles = Array.isArray(allowedRoles)
    ? allowedRoles.map((allowedRole) => allowedRole.toLowerCase())
    : null;

  if (normalizedRoles && normalizedRoles.length > 0) {
    const role = authState.user.role ? authState.user.role.toLowerCase() : null;
    if (!role || !normalizedRoles.includes(role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
