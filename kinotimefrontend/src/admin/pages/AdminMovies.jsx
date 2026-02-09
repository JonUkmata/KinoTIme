import React, { useEffect, useMemo, useState } from "react";
import { apiDelete, apiGet, apiPost, apiPut } from "../../services/api";

export default function AdminMovies() {
  const emptyForm = {
    title: "",
    genre: "",
    description: "",
    releaseYear: "",
    duration: "",
    posterUrl: "",
    comingSoon: false,
    releaseDate: "",
  };

  const [movies, setMovies] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [tableFilter, setTableFilter] = useState("all");

  const normalizeMovie = (movie) => ({
    id: movie?.id ?? movie?.Id,
    title: movie?.title ?? movie?.Title ?? "",
    genre: movie?.genre ?? movie?.Genre ?? "",
    description: movie?.description ?? movie?.Description ?? "",
    releaseYear: movie?.releaseYear ?? movie?.ReleaseYear ?? "",
    duration: movie?.duration ?? movie?.Duration ?? "",
    posterUrl: movie?.posterUrl ?? movie?.PosterUrl ?? movie?.poster ?? "",
    releaseDate: movie?.releaseDate ?? movie?.ReleaseDate ?? null,
  });

  const toNumber = (value) => {
    if (value === "" || value === null || value === undefined) return 0;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const toStringValue = (value) => {
    if (value === null || value === undefined || value === 0) return "";
    return String(value);
  };

  const toDateInputValue = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return typeof value === "string" ? value.slice(0, 10) : "";
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const isComingSoonByDate = (releaseDate) => {
    if (!releaseDate) return false;
    const parsed = new Date(releaseDate);
    if (Number.isNaN(parsed.getTime())) return false;
    return parsed.getTime() > Date.now();
  };

  const getStartOfToday = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  };

  const parseReleaseDate = (releaseDate) => {
    if (!releaseDate) return null;
    const parsed = new Date(releaseDate);
    if (Number.isNaN(parsed.getTime())) return null;
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  };

  const getComingSoonMeta = (releaseDate) => {
    const parsedDate = parseReleaseDate(releaseDate);
    if (!parsedDate) {
      return {
        isComingSoon: false,
        isActive: null,
        state: "--",
        filterKey: "standard",
      };
    }

    const isActive = parsedDate >= getStartOfToday();
    return {
      isComingSoon: true,
      isActive,
      state: isActive ? "Active" : "Not Active",
      filterKey: isActive ? "coming_active" : "coming_inactive",
    };
  };

  const loadMovies = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet("/api/Movies");
      setMovies(Array.isArray(data) ? data : []);
      return true;
    } catch (err) {
      setError(err?.message || "Failed to load movies.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovies();
  }, []);

  const normalizedMovies = useMemo(() => {
    return movies.map((movie) => normalizeMovie(movie));
  }, [movies]);

  const filteredMovies = normalizedMovies.filter((movie) => {
    if (tableFilter === "all") return true;

    const meta = getComingSoonMeta(movie.releaseDate);

    if (tableFilter === "coming_all") return meta.isComingSoon;
    if (tableFilter === "coming_active") return meta.filterKey === "coming_active";
    if (tableFilter === "coming_inactive") return meta.filterKey === "coming_inactive";
    if (tableFilter === "standard") return !meta.isComingSoon;

    return true;
  });

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    if (type === "checkbox" && name === "comingSoon") {
      setFormData((prev) => {
        if (checked) {
          return { ...prev, comingSoon: true };
        }

        const parsedReleaseDate = prev.releaseDate
          ? new Date(`${prev.releaseDate}T00:00:00`)
          : null;
        const hasPastReleaseDate =
          parsedReleaseDate &&
          !Number.isNaN(parsedReleaseDate.getTime()) &&
          parsedReleaseDate.getTime() <= Date.now();

        return {
          ...prev,
          comingSoon: false,
          releaseDate: hasPastReleaseDate ? prev.releaseDate : "",
        };
      });
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleAdd = () => {
    setIsFormOpen(true);
    setIsEditing(false);
    setEditingId(null);
    setFormData(emptyForm);
    setError("");
  };

  const handleEdit = (movie) => {
    const normalized = normalizeMovie(movie);
    if (!normalized.id) {
      setError("Missing movie id. Refresh and try again.");
      return;
    }

    const comingSoon = isComingSoonByDate(normalized.releaseDate);

    setIsFormOpen(true);
    setIsEditing(true);
    setEditingId(normalized.id);
    setFormData({
      title: normalized.title,
      genre: normalized.genre,
      description: normalized.description,
      releaseYear: toStringValue(normalized.releaseYear),
      duration: toStringValue(normalized.duration),
      posterUrl: normalized.posterUrl || "",
      comingSoon,
      releaseDate: toDateInputValue(normalized.releaseDate),
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

    const title = formData.title.trim();
    if (!title) {
      setError("Title is required.");
      return;
    }

    if (formData.comingSoon && !formData.releaseDate) {
      setError("Release Date is required when Coming Soon is enabled.");
      return;
    }

    if (formData.comingSoon && formData.releaseDate) {
      const releaseDate = new Date(`${formData.releaseDate}T00:00:00`);
      if (Number.isNaN(releaseDate.getTime())) {
        setError("Invalid Release Date.");
        return;
      }
      if (releaseDate.getTime() <= Date.now()) {
        setError("For Coming Soon movie, Release Date must be in the future.");
        return;
      }
    }

    const releaseYearFromDate = formData.releaseDate
      ? new Date(`${formData.releaseDate}T00:00:00`).getFullYear()
      : 0;

    const resolvedReleaseYear =
      formData.comingSoon || (!formData.releaseYear && formData.releaseDate)
        ? releaseYearFromDate
        : toNumber(formData.releaseYear);

    const releaseDatePayload = formData.releaseDate
      ? `${formData.releaseDate}T00:00:00`
      : null;

    const payload = {
      title,
      genre: formData.genre.trim(),
      description: formData.description.trim(),
      releaseYear: resolvedReleaseYear,
      duration: formData.comingSoon ? 0 : toNumber(formData.duration),
      posterUrl: formData.posterUrl.trim(),
      releaseDate: releaseDatePayload,
    };

    setSaving(true);
    try {
      if (isEditing && editingId !== null) {
        await apiPut(`/api/Movies/${editingId}`, {
          id: editingId,
          ...payload,
        });
      } else {
        await apiPost("/api/Movies", payload);
      }
      const refreshed = await loadMovies();
      if (refreshed) {
        handleCancel();
      }
    } catch (err) {
      setError(err?.message || "Failed to save movie.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (movie) => {
    const normalized = normalizeMovie(movie);
    if (!normalized.id) {
      setError("Missing movie id. Refresh and try again.");
      return;
    }
    const confirmText = normalized.title
      ? `Delete "${normalized.title}"?`
      : "Delete this movie?";
    if (!window.confirm(confirmText)) return;

    setError("");
    try {
      await apiDelete(`/api/Movies/${normalized.id}`);
      await loadMovies();
    } catch (err) {
      setError(err?.message || "Failed to delete movie.");
    }
  };

  const formatDate = (value) => {
    if (!value) return "--";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "--";
    return date.toLocaleDateString();
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white/90">Movies Management</h4>
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <i className="bi bi-plus-lg mr-2" aria-hidden="true"></i>
            Add Movie
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
                  Title
                </label>
                <input
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                  placeholder="Movie title"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Genre
                </label>
                <input
                  name="genre"
                  type="text"
                  value={formData.genre}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                  placeholder="Action, Comedy..."
                />
              </div>

              <div className="md:col-span-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                <label className="inline-flex cursor-pointer items-center gap-2 font-semibold">
                  <input
                    name="comingSoon"
                    type="checkbox"
                    checked={formData.comingSoon}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  This movie is Coming Soon
                </label>
                <p className="mt-1 text-xs">
                  If enabled, Release Date is required and Duration will be hidden.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Release Year
                </label>
                <input
                  name="releaseYear"
                  type="number"
                  min="0"
                  value={formData.comingSoon && formData.releaseDate ? new Date(`${formData.releaseDate}T00:00:00`).getFullYear() : formData.releaseYear}
                  onChange={handleChange}
                  disabled={formData.comingSoon}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
                  placeholder="2025"
                />
              </div>

              {formData.comingSoon ? (
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Release Date
                  </label>
                  <input
                    name="releaseDate"
                    type="date"
                    required
                    value={formData.releaseDate}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Duration (min)
                  </label>
                  <input
                    name="duration"
                    type="number"
                    min="0"
                    value={formData.duration}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                    placeholder="120"
                  />
                </div>
              )}

              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Description
                </label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                  placeholder="Short description"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Poster URL
                </label>
                <input
                  name="posterUrl"
                  type="url"
                  value={formData.posterUrl}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                  placeholder="https://example.com/poster.jpg"
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
                {saving ? "Saving..." : isEditing ? "Update Movie" : "Create Movie"}
              </button>
            </div>
          </form>
        )}

        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-medium text-gray-700">
            Showing: {filteredMovies.length} / {normalizedMovies.length} movies
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="movie-filter" className="text-sm font-semibold text-gray-700">
              Filter:
            </label>
            <select
              id="movie-filter"
              value={tableFilter}
              onChange={(event) => setTableFilter(event.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Movies</option>
              <option value="coming_all">Coming Soon (All)</option>
              <option value="coming_active">Coming Soon (Active)</option>
              <option value="coming_inactive">Coming Soon (Not Active)</option>
              <option value="standard">Standard (No Release Date)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-900 dark:border-white/[0.05]">
              <tr>
                <th className="px-4 py-3 font-medium">Poster</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Genre</th>
                <th className="px-4 py-3 font-medium">Duration</th>
                <th className="px-4 py-3 font-medium">Release Year</th>
                <th className="px-4 py-3 font-medium">Release Date</th>
                <th className="px-4 py-3 font-medium">Coming Soon</th>
                <th className="px-4 py-3 font-medium">State</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-center text-sm text-gray-500" colSpan="9">
                    Loading movies...
                  </td>
                </tr>
              ) : filteredMovies.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-sm text-gray-500" colSpan="9">
                    No movies found for this filter.
                  </td>
                </tr>
              ) : (
                filteredMovies.map((normalized, idx) => {
                  const posterSeed = normalized.id ?? idx;
                  const posterSrc = normalized.posterUrl?.trim()
                    ? normalized.posterUrl
                    : `https://picsum.photos/seed/${posterSeed}/64/64`;
                  const durationLabel = normalized.duration ? `${normalized.duration} min` : "--";
                  const yearLabel = normalized.releaseYear ? normalized.releaseYear : "--";
                  const releaseDateLabel = formatDate(normalized.releaseDate);
                  const comingSoonMeta = getComingSoonMeta(normalized.releaseDate);
                  const isComingSoon = comingSoonMeta.isComingSoon;
                  const isActive = comingSoonMeta.isActive;

                  return (
                    <tr key={normalized.id ?? idx} className="hover:bg-gray-50 dark:hover:bg-white/[0.04]">
                      <td className="px-4 py-3">
                        <img
                          src={posterSrc}
                          alt="poster"
                          className="h-12 w-12 rounded object-cover"
                          width="48"
                          height="48"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{normalized.title || "--"}</td>
                      <td className="px-4 py-3 text-gray-900">{normalized.genre || "--"}</td>
                      <td className="px-4 py-3 text-gray-900">{durationLabel}</td>
                      <td className="px-4 py-3 text-gray-900">{yearLabel}</td>
                      <td className="px-4 py-3 text-gray-900">{releaseDateLabel}</td>
                      <td className="px-4 py-3 text-gray-900">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            isComingSoon
                              ? "bg-amber-100 text-amber-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {isComingSoon ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            isActive === true
                              ? "bg-green-100 text-green-700"
                              : isActive === false
                              ? "bg-zinc-200 text-zinc-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {comingSoonMeta.state}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleEdit(normalized)}
                          className="inline-flex items-center text-blue-600 transition-colors hover:text-blue-700"
                          aria-label="Edit movie"
                        >
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(normalized)}
                          className="ml-3 inline-flex items-center text-red-600 transition-colors hover:text-red-700"
                          aria-label="Delete movie"
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
