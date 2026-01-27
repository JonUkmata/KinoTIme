import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../api";

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
      setError("Username nuk mund tÃ« jetÃ« bosh!");
      return;
    }
    if (!form.email.trim()) {
      setError("Email nuk mund tÃ« jetÃ« bosh!");
      return;
    }
    if (!form.password.trim()) {
      setError("Password nuk mund tÃ« jetÃ« bosh!");
      return;
    }
    try {
      await apiPost("/api/Auth/register", {
        username: form.username,
        email: form.email,
        password: form.password,
      });
      try {
        await new Promise((res) => setTimeout(res, 500));
        await apiPost("/api/Auth/login", {
          username: form.username,
          password: form.password,
        });

        const me = await apiGet("/api/Auth/me");
        const role = me?.role || "User";

        if (role === "Admin") {
          navigate("/admin/movies", { replace: true });
        } else {
          navigate("/playing", { replace: true });
        }
      } catch (err) {
        setError("Login automatik pas regjistrimit dÃ«shtoi.");
        console.log("Gabim nÃ« login pas regjistrimit:", err);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        console.log("Gabim register:", err.response.data);
        setError(err.response.data.message || "DÃ«shtoi regjistrimi.");
      } else {
        console.log("Gabim register:", err);
        setError("DÃ«shtoi regjistrimi.");
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
        <h1 className="mb-2 text-[32px] font-semibold">MirÃ« se vini nÃ« KinoTime</h1>
        <p className="mb-6 text-[#555]">
          Bashkohuni pÃ«r njÃ« pÃ«rvojÃ« tÃ« paharrueshme
        </p>
        {error && <div className="mb-3 text-[#ff1a1a]">{error}</div>}
        <form className="flex w-full flex-col" onSubmit={handleSubmit}>
          <label className="mb-[6px] text-base font-medium">Username</label>
          <input
            className="mb-[18px] rounded-lg bg-[#232323] px-4 py-3 text-base text-white outline-none focus:ring-2 focus:ring-[#e50914]"
            type="text"
            name="username"
            placeholder="Zgjidhni njÃ« username"
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
          <label className="mb-[6px] text-base font-medium">FjalÃ«kalimi</label>
          <input
            className="mb-[18px] rounded-lg bg-[#232323] px-4 py-3 text-base text-white outline-none focus:ring-2 focus:ring-[#e50914]"
            type="password"
            name="password"
            placeholder="Krijoni njÃ« fjalÃ«kalim tÃ« fortÃ«"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button
            type="submit"
            className="mb-[18px] mt-4 rounded-lg bg-[#ff1a1a] py-3.5 text-[1.1rem] font-semibold text-white transition-colors hover:bg-[#c40000]"
          >
            Krijo LlogarinÃ«
          </button>
        </form>
        <p className="mt-[18px] text-base text-[#b3b3b3]">
          Jeni tashmÃ« njÃ« llogari? <a className="ml-1 font-medium text-[#e50914] hover:underline" href="/auth/login">Hyni kÃ«tu</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
