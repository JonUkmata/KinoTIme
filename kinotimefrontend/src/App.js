import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import AdminMovies from './admin/pages/AdminMovies.jsx';
import AdminHalls from './admin/pages/AdminHalls.jsx';
import AdminShowtimes from './admin/pages/AdminShowtimes.jsx';
import AdminDashboard from './admin/pages/AdminDashboard.jsx';
import AppLayout from './admin/layout/AppLayout.jsx';
import Login from './auth/Login';
import Register from './auth/Register';
import Navbar from './components/Navbar';
import PlayingNow from './user/pages/PlayingNow.jsx';
import AllMovies from './user/pages/AllMovies.jsx';
import AboutUs from './user/pages/AboutUs.jsx';
import ComingSoon from './user/pages/ComingSoon.jsx';
import Unauthorized from './pages/Unauthorized.jsx';
import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  // Home page component
  function Home() {
    return (
      <div className="py-[60px] text-center text-white">
        <h1>Welcome to KinoTime!</h1>
        <p>This is your main dashboard.</p>
      </div>
    );
  }

  const UserLayout = () => (
    <>
      <Navbar />
      <Outlet />
    </>
  );

  return (
    <Router>
      <Routes>
        {/* Default: landing goes to login */}
        <Route path="/" element={<Navigate to="/auth/login" replace />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<UserLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/playing" element={<PlayingNow />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/coming-soon" element={<ComingSoon />} />
            <Route path="/movies" element={<AllMovies />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AppLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="movies" element={<AdminMovies />} />
              <Route path="halls" element={<AdminHalls />} />
              <Route path="showtimes" element={<AdminShowtimes />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
