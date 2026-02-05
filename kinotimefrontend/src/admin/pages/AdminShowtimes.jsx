import React, { useEffect, useState } from "react";
import { apiDelete, apiGet, apiPost, apiPut } from "../../services/api";

export default function AdminShowtimes() {
  const emptyForm = {
    movieId: "",
    hallId: "",
    startTime: "",
    endTime: "",
    price: "",
  };

  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [halls, setHalls] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const normalizeShowtime = (showtime) => ({
    id: showtime?.id ?? showtime?.Id,
    movieId:
      showtime?.movieId ??
      showtime?.MovieId ??
      showtime?.movie?.id ??
      showtime?.Movie?.Id ??
      0,
    hallId:
      showtime?.hallId ??
      showtime?.HallId ??
      showtime?.hall?.id ??
      showtime?.Hall?.Id ??
      0,
    startTime: showtime?.startTime ?? showtime?.StartTime ?? "",
    endTime: showtime?.endTime ?? showtime?.EndTime ?? "",
    price: showtime?.price ?? showtime?.Price ?? 0,
    movieTitle: showtime?.movie?.title ?? showtime?.Movie?.Title ?? "",
    hallName: showtime?.hall?.name ?? showtime?.Hall?.Name ?? "",
  });

  const toNumber = (value) => {
    if (value === "" || value === null || value === undefined) return 0;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const toInputDateTime = (value) => {
    if (!value) return "";
    if (typeof value === "string" && value.includes("T")) {
      return value.slice(0, 16);
    }
    return value;
  };

  const formatPrice = (value) => {
    if (value === null || value === undefined || value === "") return "--";
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return value;
    return parsed.toFixed(2);
  };

  const formatDateTime = (value) => {
    if (!value) return "--";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  };

  const loadShowtimes = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet("/api/Showtimes");
      setShowtimes(Array.isArray(data) ? data : []);
      return true;
    } catch (err) {
      setError(err?.message || "Failed to load showtimes.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loadLookups = async () => {
    try {
      const [moviesData, hallsData] = await Promise.all([
        apiGet("/api/Movies"),
        apiGet("/api/Halls"),
      ]);
      setMovies(Array.isArray(moviesData) ? moviesData : []);
      setHalls(Array.isArray(hallsData) ? hallsData : []);
    } catch (err) {
      setError(err?.message || "Failed to load movies or halls.");
    }
  };

  useEffect(() => {
    loadShowtimes();
    loadLookups();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    setIsFormOpen(true);
    setIsEditing(false);
    setEditingId(null);
    setFormData(emptyForm);
    setError("");
  };

  const handleEdit = (showtime) => {
    const normalized = normalizeShowtime(showtime);
    if (!normalized.id) {
      setError("Missing showtime id. Refresh and try again.");
      return;
    }
    setIsFormOpen(true);
    setIsEditing(true);
    setEditingId(normalized.id);
    setFormData({
      movieId: String(normalized.movieId || ""),
      hallId: String(normalized.hallId || ""),
      startTime: toInputDateTime(normalized.startTime),
      endTime: toInputDateTime(normalized.endTime),
      price: normalized.price ? String(normalized.price) : "",
    });
    setError("");
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setIsEditing(false);
    setEditingId(null);
    setFormData(emptyForm);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const payload = {
      movieId: toNumber(formData.movieId),
      hallId: toNumber(formData.hallId),
      startTime: formData.startTime,
      endTime: formData.endTime,
      price: toNumber(formData.price),
    };

    if (!payload.movieId || !payload.hallId) {
      setError("Movie and hall are required.");
      return;
    }

    if (!payload.startTime || !payload.endTime) {
      setError("Start time and end time are required.");
      return;
    }

    const start = new Date(payload.startTime);
    const end = new Date(payload.endTime);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      setError("Invalid start or end time.");
      return;
    }

    if (end <= start) {
      setError("End time must be after start time.");
      return;
    }

    if (payload.price <= 0) {
      setError("Price must be greater than 0.");
      return;
    }

    setSaving(true);
    try {
      if (isEditing && editingId !== null) {
        await apiPut(`/api/Showtimes/${editingId}`, {
          id: editingId,
          ...payload,
        });
      } else {
        await apiPost("/api/Showtimes", payload);
      }
      const refreshed = await loadShowtimes();
      if (refreshed) {
        handleCancel();
      }
    } catch (err) {
      setError(err?.message || "Failed to save showtime.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (showtime) => {
    const normalized = normalizeShowtime(showtime);
    if (!normalized.id) {
      setError("Missing showtime id. Refresh and try again.");
      return;
    }
    const confirmText = "Delete this showtime?";
    if (!window.confirm(confirmText)) return;

    setError("");
    try {
      await apiDelete(`/api/Showtimes/${normalized.id}`);
      await loadShowtimes();
    } catch (err) {
      setError(err?.message || "Failed to delete showtime.");
    }
  };

  const renderMovieOptions = () => {
    if (movies.length === 0) {
      return (
        <option value="" disabled>
          No movies available
        </option>
      );
    }
    return movies.map((movie) => {
      const id = movie?.id ?? movie?.Id;
      const title = movie?.title ?? movie?.Title ?? "Untitled";
      return (
        <option key={id ?? title} value={id ?? ""}>
          {title}
        </option>
      );
    });
  };

  const renderHallOptions = () => {
    if (halls.length === 0) {
      return (
        <option value="" disabled>
          No halls available
        </option>
      );
    }
    return halls.map((hall) => {
      const id = hall?.id ?? hall?.Id;
      const name = hall?.name ?? hall?.Name ?? "Unnamed";
      return (
        <option key={id ?? name} value={id ?? ""}>
          {name}
        </option>
      );
    });
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white/90">Showtimes Management</h4>
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <i className="bi bi-plus-lg mr-2" aria-hidden="true"></i>
            Add Showtime
          </button>
        </div>
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        {isFormOpen && (
          <form
            onSubmit={handleSubmit}
            className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-white/[0.08] dark:bg-white/[0.03]"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Movie
                </label>
                <select
                  name="movieId"
                  value={formData.movieId}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option value="">Select movie</option>
                  {renderMovieOptions()}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Hall
                </label>
                <select
                  name="hallId"
                  value={formData.hallId}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option value="">Select hall</option>
                  {renderHallOptions()}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Start Time
                </label>
                <input
                  name="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                  End Time
                </label>
                <input
                  name="endTime"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Price
                </label>
                <input
                  name="price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : isEditing ? "Update Showtime" : "Create Showtime"}
              </button>
            </div>
          </form>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-900 dark:border-white/[0.05]">
              <tr>
                <th className="px-4 py-3 font-medium">Movie</th>
                <th className="px-4 py-3 font-medium">Hall</th>
                <th className="px-4 py-3 font-medium">Start</th>
                <th className="px-4 py-3 font-medium">End</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-center text-sm text-gray-500" colSpan="6">
                    Loading showtimes...
                  </td>
                </tr>
              ) : showtimes.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-sm text-gray-500" colSpan="6">
                    No showtimes found.
                  </td>
                </tr>
              ) : (
                showtimes.map((showtime, idx) => {
                  const normalized = normalizeShowtime(showtime);
                  const movieLabel = normalized.movieTitle || `Movie #${normalized.movieId || "--"}`;
                  const hallLabel = normalized.hallName || `Hall #${normalized.hallId || "--"}`;
                  return (
                    <tr key={normalized.id ?? idx} className="hover:bg-gray-50 dark:hover:bg-white/[0.04]">
                      <td className="px-4 py-3 font-medium text-gray-900">{movieLabel}</td>
                      <td className="px-4 py-3 text-gray-900">{hallLabel}</td>
                      <td className="px-4 py-3 text-gray-900">{formatDateTime(normalized.startTime)}</td>
                      <td className="px-4 py-3 text-gray-900">{formatDateTime(normalized.endTime)}</td>
                      <td className="px-4 py-3 text-gray-900">{formatPrice(normalized.price)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleEdit(showtime)}
                          className="inline-flex items-center text-blue-600 transition-colors hover:text-blue-700"
                          aria-label="Edit showtime"
                        >
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(showtime)}
                          className="ml-3 inline-flex items-center text-red-600 transition-colors hover:text-red-700"
                          aria-label="Delete showtime"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
