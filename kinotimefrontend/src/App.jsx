import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserProfile from "./pages/user/UserProfile";

function App() {
  return (
    <Routes>

      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* USER */}
      <Route element={<ProtectedRoute allowedRoles={["User", "Admin"]} />}>
        <Route path="/profile" element={<UserProfile />} />
      </Route>

      {/* ADMIN */}
      <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

    </Routes>
  );
}

export default App;
