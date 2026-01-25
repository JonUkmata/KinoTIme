import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../api";

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
    <div className="flex min-h-screen bg-[#111] max-[700px]:flex-col">
      <div
        className="flex-1 bg-[#111] opacity-70 max-[700px]:hidden"
        style={{
          background: "url('/Clogin.jpg') no-repeat center center/cover, #111",
        }}
      />
      <div className="flex flex-1 flex-col items-start justify-center bg-[#18181b] px-[120px] text-white max-[900px]:px-8 max-[700px]:min-h-screen max-[700px]:w-full max-[700px]:items-center max-[700px]:px-3">
        <h1 className="mb-2 text-[32px] font-semibold">Mirë se vini në KinoTime</h1>
        <p className="mb-6 text-[#555]">
          Bashkohuni për një përvojë të paharrueshme
        </p>
        {error && <div className="mb-3 text-[#ff1a1a]">{error}</div>}
        <form className="flex w-full flex-col" onSubmit={handleSubmit}>
          <label className="mb-[6px] text-base font-medium">Username</label>
          <input
            className="mb-[18px] rounded-lg bg-[#232323] px-4 py-3 text-base text-white outline-none focus:ring-2 focus:ring-[#e50914]"
            type="text"
            name="username"
            placeholder="Zgjidhni një username"
            value={form.username}
            onChange={handleChange}
            required
          />
          <label className="mb-[6px] text-base font-medium">Email</label>
          <input
            className="mb-[18px] rounded-lg bg-[#232323] px-4 py-3 text-base text-white outline-none focus:ring-2 focus:ring-[#e50914]"
            type="email"
            name="email"
            placeholder="email@shembull.com"
            value={form.email}
            onChange={handleChange}
            required
          />
          <label className="mb-[6px] text-base font-medium">Fjalëkalimi</label>
          <input
            className="mb-[18px] rounded-lg bg-[#232323] px-4 py-3 text-base text-white outline-none focus:ring-2 focus:ring-[#e50914]"
            type="password"
            name="password"
            placeholder="Krijoni një fjalëkalim të fortë"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button
            type="submit"
            className="mb-[18px] mt-4 rounded-lg bg-[#ff1a1a] py-3.5 text-[1.1rem] font-semibold text-white transition-colors hover:bg-[#c40000]"
          >
            Krijo Llogarinë
          </button>
        </form>
        <p className="mt-[18px] text-base text-[#b3b3b3]">
          Jeni tashmë një llogari? <a className="ml-1 font-medium text-[#e50914] hover:underline" href="/auth/login">Hyni këtu</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
