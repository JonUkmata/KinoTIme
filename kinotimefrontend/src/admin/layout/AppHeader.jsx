import { useNavigate } from "react-router-dom";
import { apiPost } from "../../api";

const AppHeader = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await apiPost("/api/Auth/logout");
    } catch (err) {
      console.log("Logout error:", err);
    }
    navigate("/auth/login");
  };

  return (
    <header className="sticky top-0 z-[9999] flex w-full border-b border-black bg-black">
      <div className="flex w-full items-center justify-end px-4 py-3 lg:px-6">
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default AppHeader;
