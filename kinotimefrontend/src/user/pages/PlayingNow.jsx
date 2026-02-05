import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../../services/api";

export default function PlayingNow() {
  const [filter, setFilter] = useState("today");
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
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
    movie: showtime?.movie ?? showtime?.Movie ?? null,
    hall: showtime?.hall ?? showtime?.Hall ?? null,
    movieTitle: showtime?.movie?.title ?? showtime?.Movie?.Title ?? "",
  });

  const normalizeMovie = (movie) => ({
    id: movie?.id ?? movie?.Id,
    title: movie?.title ?? movie?.Title ?? "",
    posterUrl: movie?.posterUrl ?? movie?.PosterUrl ?? movie?.poster ?? "",
  });

  const loadShowtimes = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet("/api/Showtimes");
      setShowtimes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Failed to load showtimes.");
      setShowtimes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShowtimes();
  }, []);

  const normalizedShowtimes = useMemo(
    () => showtimes.map((showtime) => normalizeShowtime(showtime)),
    [showtimes]
  );

  const filteredShowtimes = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(startOfToday);
    if (filter === "today") {
      end.setDate(end.getDate() + 1);
    } else {
      end.setDate(end.getDate() + 7);
    }

    return normalizedShowtimes.filter((showtime) => {
      const start = new Date(showtime.startTime);
      if (Number.isNaN(start.getTime())) return false;
      return start >= startOfToday && start < end;
    });
  }, [normalizedShowtimes, filter]);

  const playingMovies = useMemo(() => {
    const map = new Map();
    filteredShowtimes.forEach((showtime) => {
      const movieData = showtime.movie || showtime.Movie;
      const normalized = movieData
        ? normalizeMovie(movieData)
        : {
            id: showtime.movieId,
            title: showtime.movieTitle || `Movie #${showtime.movieId || "--"}`,
            posterUrl: "",
          };
      const key = normalized.id || normalized.title;
      if (!key) return;
      if (!map.has(key)) {
        map.set(key, normalized);
      }
    });
    return Array.from(map.values());
  }, [filteredShowtimes]);

  return (
    <div className="min-h-screen bg-black text-white px-10 py-8">
      <h1 className="text-3xl font-semibold mb-6">Playing Now</h1>

      {error && (
        <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Filter buttons */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setFilter("today")}
          className={`px-5 py-2 rounded-full text-sm transition ${
            filter === "today"
              ? "bg-red-600 text-white"
              : "bg-zinc-800 text-gray-300 hover:bg-zinc-700"
          }`}
        >
          Today
        </button>

        <button
          onClick={() => setFilter("week")}
          className={`px-5 py-2 rounded-full text-sm transition ${
            filter === "week"
              ? "bg-red-600 text-white"
              : "bg-zinc-800 text-gray-300 hover:bg-zinc-700"
          }`}
        >
          This Week
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-gray-400">Loading showtimes...</div>
      ) : playingMovies.length === 0 ? (
        <div className="text-sm text-gray-400">No movies found for this filter.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {playingMovies.map((movie) => {
            const poster = movie.posterUrl?.trim()
              ? movie.posterUrl
              : `https://picsum.photos/seed/${movie.id ?? movie.title}/600/900`;
            return (
              <div key={movie.id ?? movie.title} className="group">
                <div className="overflow-hidden rounded-xl bg-zinc-900 transition-transform group-hover:scale-[1.02]">
                  <div className="aspect-[2/3] w-full">
                    <img
                      src={poster}
                      alt={movie.title || "Movie"}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                <p className="mt-3 text-sm font-semibold text-white line-clamp-2">
                  {movie.title || "Untitled"}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
