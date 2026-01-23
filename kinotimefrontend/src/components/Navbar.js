import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiPost } from '../api';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await apiPost('/api/Auth/logout');
    } catch (err) {
      console.log('Logout error:', err);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/auth/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <span className="logo-icon">🎬</span>
        <span className="logo-text">KinoTime</span>
      </div>
      <div className="navbar-center">
        <ul className="navbar-links">
          <li><Link to="/about">About Us</Link></li>
          <li><Link to="/playing">Playing Now</Link></li>
          <li><Link to="/movies">All Movies</Link></li>
          <li><Link to="/coming-soon">Coming Soon</Link></li>
        </ul>
      </div>
      <div className="navbar-profile">
        <span className="profile-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="8" r="4" fill="#fff"/>
            <rect x="5" y="15" width="14" height="6" rx="3" fill="#fff"/>
          </svg>
        </span>
        <span className="profile-arrow">&#9660;</span>
        <button onClick={handleLogout} style={{marginLeft: '18px', background: '#e50914', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 16px', cursor: 'pointer'}}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
