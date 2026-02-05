import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiPost } from '../api';

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    try {
      await apiPost('/api/Auth/logout');
    } catch (err) {
      console.log('Logout error:', err);
    }
    navigate('/auth/login');
  };

  return (
    <nav className="relative z-10 flex h-[70px] w-full items-center justify-between bg-[#18181b] px-[70px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] max-[900px]:px-[10px] max-[600px]:h-auto max-[600px]:flex-col max-[600px]:py-[10px]">
      <div className="ml-[18px] flex items-center max-[600px]:ml-0">
        <span className="mr-[7px] rounded-[12px] bg-[#e50914] px-[7px] py-[4px] text-[1.3rem] text-white">
          {"\u{1F3AC}"}
        </span>
        <span className="text-[1.55rem] font-normal tracking-[1px] text-white">KinoTime</span>
      </div>
      <div className="flex flex-1 justify-center">
        <ul className="m-0 flex list-none gap-[36px] p-0 max-[900px]:gap-[18px] max-[600px]:mt-[10px] max-[600px]:flex-col max-[600px]:gap-[10px]">
          <li><Link className="text-[1.18rem] font-normal text-white transition-colors hover:text-[#e50914]" to="/about">About Us</Link></li>
          <li><Link className="text-[1.18rem] font-normal text-white transition-colors hover:text-[#e50914]" to="/playing">Playing Now</Link></li>
          <li><Link className="text-[1.18rem] font-normal text-white transition-colors hover:text-[#e50914]" to="/movies">All Movies</Link></li>
          <li><Link className="text-[1.18rem] font-normal text-white transition-colors hover:text-[#e50914]" to="/coming-soon">Coming Soon</Link></li>
        </ul>
      </div>
      <div className="relative ml-[18px] mr-[24px] flex items-center" ref={menuRef}>
        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="flex items-center gap-2 text-[1.7rem] text-white"
          aria-expanded={isMenuOpen}
          aria-haspopup="true"
        >
          <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#e50914] p-[3px] text-[1.25rem] text-white">
            <svg className="h-[22px] w-[22px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="8" r="4" fill="#fff" />
              <rect x="5" y="15" width="14" height="6" rx="3" fill="#fff" />
            </svg>
          </span>
          <span className="mt-[1px] text-[0.85rem] text-white">&#9660;</span>
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 top-full z-20 mt-3 w-48 rounded-xl border border-white/10 bg-[#1f1f23] p-2 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
            <Link
              to="/profile"
              onClick={() => setIsMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-white transition-colors hover:bg-white/5"
            >
              My Profile
            </Link>
            <Link
              to="/my-reservations"
              onClick={() => setIsMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-white transition-colors hover:bg-white/5"
            >
              My Reservations
            </Link>
            <button
              type="button"
              onClick={async () => {
                setIsMenuOpen(false);
                await handleLogout();
              }}
              className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm text-[#e50914] transition-colors hover:bg-white/5"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
