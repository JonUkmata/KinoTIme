import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Loading from './components/Loading.jsx';
import Navbar from './components/Navbar';
import ProtectedRoute from './routes/ProtectedRoute';

const AdminMovies = lazy(() => import('./admin/pages/AdminMovies.jsx'));
const AdminHalls = lazy(() => import('./admin/pages/AdminHalls.jsx'));
const AdminShowtimes = lazy(() => import('./admin/pages/AdminShowtimes.jsx'));
const AdminDashboard = lazy(() => import('./admin/pages/AdminDashboard.jsx'));

const AdminShkollat = lazy(() => import('./admin/pages/AdminShkollat.jsx'));
const AdminNxenesit = lazy(() => import('./admin/pages/AdminNxenesit.jsx'));

const AppLayout = lazy(() => import('./admin/layout/AppLayout.jsx'));
const Login = lazy(() => import('./auth/Login'));
const Register = lazy(() => import('./auth/Register'));
const PlayingNow = lazy(() => import('./user/pages/PlayingNow.jsx'));
const AllMovies = lazy(() => import('./user/pages/AllMovies.jsx'));
const AboutUs = lazy(() => import('./user/pages/AboutUs.jsx'));
const ComingSoon = lazy(() => import('./user/pages/ComingSoon.jsx'));
const MovieDetails = lazy(() => import('./user/pages/MovieDetails.jsx'));
const SeatSelection = lazy(() => import('./user/pages/SeatSelection.jsx'));
const MyReservations = lazy(() => import('./user/pages/MyReservations.jsx'));
const UserProfile = lazy(() => import('./user/pages/UserProfile.jsx'));
const Unauthorized = lazy(() => import('./pages/Unauthorized.jsx'));

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
      <Suspense fallback={<Loading />}>
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
              <Route path="/movies/:id" element={<MovieDetails />} />
              <Route path="/reserve/:showtimeId" element={<SeatSelection />} />
              <Route path="/my-reservations" element={<MyReservations />} />
              <Route path="/profile" element={<UserProfile />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AppLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="movies" element={<AdminMovies />} />
                <Route path="halls" element={<AdminHalls />} />
                <Route path="showtimes" element={<AdminShowtimes />} />
                <Route path="shkollat" element={<AdminShkollat />} />
                <Route path="nxenesit" element={<AdminNxenesit />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
