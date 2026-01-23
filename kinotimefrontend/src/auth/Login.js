import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { apiPost } from '../api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempted');
    setError('');
    apiPost('/api/Auth/login', {
      username,
      password
    })
      .then(res => {
        console.log('API response:', res);
        if (res.token) {
          localStorage.setItem('token', res.token);
          const roleFromToken = getRoleFromToken(res.token);
          if (roleFromToken) {
            localStorage.setItem('role', roleFromToken);
          } else {
            localStorage.removeItem('role');
          }
          if (roleFromToken && roleFromToken.toLowerCase() === 'admin') {
            navigate('/admin');
            return;
          }
          navigate('/about');
        } else {
          setError('Login failed.');
        }
      })
      .catch((err) => {
        console.log('API error:', err);
        setError('Invalid credentials.');
      });
  };

  return (
    <div className="login-container">
      {error && <div style={{color:'#ff1a1a', marginBottom:12}}>{error}</div>}
      <div
        className="login-left"
        style={{
          background: "url('/Clogin.jpg') no-repeat center center/cover, #111",
          opacity: 0.7
        }}
      />
      <div className="login-right">
        <div className="login-logo">
          <span className="logo-icon">🎬</span>
          <span className="logo-text">KinoTime</span>
        </div>
        <h1>Welcome Back</h1>
        <p className="login-subtitle">Sign in to continue your cinema experience</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <label>Username</label>
          <input
            type="text"
            placeholder="your username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <label>Password</label>
          <input
            type="password"
            placeholder="********"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {/* Hequr zgjedhjen e rolit */}
          <button type="submit" className="login-btn">Login</button>
        </form>
        <p className="login-register">
          Don't have an account? <a href="/auth/register">Create Account</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
