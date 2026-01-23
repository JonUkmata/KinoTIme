import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import AdminMovies from './admin/pages/AdminMovies.jsx';
import AdminHalls from './admin/pages/AdminHalls.jsx';
import AdminDashboard from './admin/pages/AdminDashboard.jsx';
import AppLayout from './admin/layout/AppLayout.jsx';
import Login from './auth/Login';
import Register from './auth/Register';
import Navbar from './components/Navbar';
import PlayingNow from './user/pages/PlayingNow.jsx';
import AllMovies from './user/pages/AllMovies.jsx';
import AboutUs from './user/pages/AboutUs.jsx';
import ComingSoon from './user/pages/ComingSoon.jsx';

const decodeJwtPayload = (token) => {
  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return null;
    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
};

const getRoleFromToken = (token) => {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  return (
    payload.role ||
    payload.Role ||
    payload.roles?.[0] ||
    payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
    null
  );
};

const isTokenValid = (token) => {
  const payload = decodeJwtPayload(token);
  if (!payload || !payload.exp) return true;
  return Date.now() < payload.exp * 1000;
};

function App() {
    // Home page komponenti
    function Home() {
      return (
        <div style={{padding:'60px 0', textAlign:'center', color:'#fff'}}>
          <h1>Welcome to KinoTime!</h1>
          <p>This is your main dashboard.</p>
        </div>
      );
    }

  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const handleStorage = () => {
      setToken(localStorage.getItem('token'));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Përditëso token-in kur ndodh login/logout në të njëjtin tab
  useEffect(() => {
    const interval = setInterval(() => {
      setToken(localStorage.getItem('token'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Protected layout për të gjitha faqet pas login
  // Protected layout për të gjitha faqet pas login
  const ProtectedLayout = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token || !isTokenValid(token)) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      return <Navigate to="/auth/login" replace />;
    }
    return (
      <>
        <Navbar />
        {children}
      </>
    );
  };

  const AdminLayout = () => {
    const token = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    if (!token || !isTokenValid(token)) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      return <Navigate to="/auth/login" replace />;
    }
    const roleFromToken = getRoleFromToken(token);
    const role = roleFromToken || storedRole;
    if (roleFromToken && storedRole !== roleFromToken) {
      localStorage.setItem('role', roleFromToken);
    }
    if (!role || role.toLowerCase() !== 'admin') return <Navigate to="/about" replace />;
    return <AppLayout />;
  };

  return (
    <Router>
      <Routes>
        {/* Default: çdo path pa token shkon te login */}
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/" element={<Navigate to="/auth/login" replace />} />
        <Route path="/playing" element={<ProtectedLayout><PlayingNow /></ProtectedLayout>} />
        <Route path="/about" element={<ProtectedLayout><AboutUs /></ProtectedLayout>} />
        <Route path="/coming-soon" element={<ProtectedLayout><ComingSoon /></ProtectedLayout>} />
        <Route path="/movies" element={<ProtectedLayout><AllMovies /></ProtectedLayout>} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="movies" element={<AdminMovies />} />
          <Route path="halls" element={<AdminHalls />} />
        </Route>
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
