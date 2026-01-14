import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { apiPost } from '../api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
          navigate('/about'); // redirect te faqja AboutUs pas login
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
