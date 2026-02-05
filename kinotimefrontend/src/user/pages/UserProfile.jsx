import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGetMe } from "../../services/api";

const normalizeProfile = (profile) => ({
  username: profile?.username ?? profile?.Username ?? "",
  email: profile?.email ?? profile?.Email ?? "",
  role: profile?.role ?? profile?.Role ?? "",
});

export default function UserProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGetMe();
      setProfile(data);
    } catch (err) {
      if (err?.status === 401 || err?.status === 403) {
        navigate("/auth/login", { replace: true });
        return;
      }
      setError(err?.message || "Failed to load profile.");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const normalized = normalizeProfile(profile);

  return (
    <div className="min-h-screen bg-black px-6 py-8 text-white">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-semibold">My Profile</h1>
          <button
            type="button"
            onClick={loadProfile}
            className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-gray-200 transition hover:border-zinc-500 hover:text-white"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-6 text-sm text-gray-400">Loading profile...</div>
        ) : !profile ? (
          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-sm text-gray-400">
            Profile data not available.
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
            <div className="flex flex-col items-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#e50914] text-4xl text-white shadow-[0_10px_30px_rgba(229,9,20,0.35)]">
                <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="8" r="4" stroke="#fff" strokeWidth="2" />
                  <path
                    d="M5 19c1.7-3 4.4-4.5 7-4.5S17.3 16 19 19"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            <div className="mt-8 space-y-6">
              <div className="flex items-center gap-4 border-b border-zinc-800 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800/80 text-[#e50914]">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
                    <path
                      d="M5 19c1.7-3 4.4-4.5 7-4.5S17.3 16 19 19"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    Name
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {normalized.username || "--"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 border-b border-zinc-800 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800/80 text-[#e50914]">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                    <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    Email
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {normalized.email || "--"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800/80 text-[#e50914]">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M5 19h14a2 2 0 0 0 2-2v-4.5a4.5 4.5 0 0 0-4.5-4.5h-9A4.5 4.5 0 0 0 3 12.5V17a2 2 0 0 0 2 2Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 3a3 3 0 0 1 3 3v1H9V6a3 3 0 0 1 3-3Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    Account Type
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {normalized.role || "--"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
