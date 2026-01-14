import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import './App.css';
import AdminMovies from './admin/pages/AdminMovies.jsx';
import AdminHalls from './admin/pages/AdminHalls.jsx';
import Login from './auth/Login';
import Register from './auth/Register';
import Navbar from './components/Navbar';
import PlayingNow from './user/pages/PlayingNow.jsx';
import AllMovies from './user/pages/AllMovies.jsx';
import AboutUs from './user/pages/AboutUs.jsx';
import ComingSoon from './user/pages/ComingSoon.jsx';

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
    if (!token) return <Navigate to="/auth/login" replace />;
    return (
      <>
        <Navbar />
        {children}
      </>
    );
  };

  return (
    <Router>
      <Routes>
        {/* Default: çdo path pa token shkon te login */}
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/" element={<ProtectedLayout><Home /></ProtectedLayout>} />
        <Route path="/playing" element={<ProtectedLayout><PlayingNow /></ProtectedLayout>} />
        <Route path="/about" element={<ProtectedLayout><AboutUs /></ProtectedLayout>} />
        <Route path="/coming-soon" element={<ProtectedLayout><ComingSoon /></ProtectedLayout>} />
        <Route path="/movies" element={<ProtectedLayout><AllMovies /></ProtectedLayout>} />
        <Route path="/admin/movies" element={<ProtectedLayout><AdminMovies /></ProtectedLayout>} />
        <Route path="/admin/halls" element={<ProtectedLayout><AdminHalls /></ProtectedLayout>} />
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
