import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../api";
import "./Login.css";

const Register = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.username.trim()) {
      setError("Username nuk mund të jetë bosh!");
      return;
    }
    if (!form.email.trim()) {
      setError("Email nuk mund të jetë bosh!");
      return;
    }
    if (!form.password.trim()) {
      setError("Password nuk mund të jetë bosh!");
      return;
    }
    try {
      const regRes = await apiPost("/api/Auth/register", {
        username: form.username,
        email: form.email,
        password: form.password,
      });
      try {
        await new Promise(res => setTimeout(res, 500)); 
        const loginRes = await apiPost("/api/Auth/login", {
          username: form.username,
          password: form.password,
        });
       
        if (loginRes.token) {
          localStorage.setItem("token", loginRes.token);
          localStorage.setItem("role", "User");
          navigate("/about");
        } else {
          setError("Regjistrimi u krye, por login dështoi.");
        }
      } catch (err) {
        setError("Login automatik pas regjistrimit dështoi.");
        console.log('Gabim në login pas regjistrimit:', err);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        console.log("Gabim register:", err.response.data);
        setError(err.response.data.message || "Dështoi regjistrimi.");
      } else {
        console.log("Gabim register:", err);
        setError("Dështoi regjistrimi.");
      }
    }
  };

  return (
    <div className="login-container">
      <div
        className="login-left"
        style={{
          background: "url('/Clogin.jpg') no-repeat center center/cover, #111",
          opacity: 0.7,
        }}
      />
      <div className="login-right">
        <h1 style={{ fontWeight: 600, fontSize: 32, marginBottom: 8 }}>Mirë se vini në KinoTime</h1>
        <p style={{ color: '#555', marginBottom: 24 }}>
          Bashkohuni për një përvojë të paharrueshme
        </p>
        {error && <div style={{color:'#ff1a1a', marginBottom:12}}>{error}</div>}
        <form className="login-form" onSubmit={handleSubmit}>
          <label>Username</label>
          <input
            type="text"
            name="username"
            placeholder="Zgjidhni një username"
            value={form.username}
            onChange={handleChange}
            required
          />
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="email@shembull.com"
            value={form.email}
            onChange={handleChange}
            required
          />
          <label>Fjalëkalimi</label>
          <input
            type="password"
            name="password"
            placeholder="Krijoni një fjalëkalim të fortë"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button type="submit" className="login-btn" style={{ marginTop: 16 }}>
            Krijo Llogarinë
          </button>
        </form>
        <p className="login-register" style={{ marginTop: 18 }}>
          Keni tashmë një llogari? <a href="/auth/login">Hyni këtu</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
