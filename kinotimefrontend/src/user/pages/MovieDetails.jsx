import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet, apiGetShowtimesByMovieId } from "../../services/api";

const formatDate = (value) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const formatTime = (value) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const normalizeMovie = (movie) => ({
  id: movie?.id ?? movie?.Id,
  title: movie?.title ?? movie?.Title ?? "",
  description: movie?.description ?? movie?.Description ?? "",
  genre: movie?.genre ?? movie?.Genre ?? "",
  posterUrl: movie?.posterUrl ?? movie?.PosterUrl ?? movie?.poster ?? "",
  releaseYear: movie?.releaseYear ?? movie?.ReleaseYear ?? "",
  duration: movie?.duration ?? movie?.Duration ?? "",
});

const normalizeShowtime = (showtime) => ({
  id: showtime?.id ?? showtime?.Id,
  movieId:
    showtime?.movieId ??
    showtime?.MovieId ??
    showtime?.movie?.id ??
    showtime?.Movie?.Id ??
    0,
  hallName: showtime?.hall?.name ?? showtime?.Hall?.Name ?? "",
  startTime: showtime?.startTime ?? showtime?.StartTime ?? "",
  endTime: showtime?.endTime ?? showtime?.EndTime ?? "",
});

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Missing movie id.");
      setLoading(false);
      return;
    }

    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [movieData, showtimeData] = await Promise.all([
          apiGet(`/api/Movies/${id}`),
          apiGetShowtimesByMovieId(id),
        ]);
        if (!isMounted) return;
        setMovie(movieData);
        setShowtimes(Array.isArray(showtimeData) ? showtimeData : []);
      } catch (err) {
        if (!isMounted) return;
        setError(err?.message || "Failed to load movie details.");
        setMovie(null);
        setShowtimes([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const normalizedMovie = useMemo(() => normalizeMovie(movie), [movie]);
  const movieId = Number(id);

  const filteredShowtimes = useMemo(() => {
    const normalized = showtimes.map((showtime) => normalizeShowtime(showtime));
    const scoped = Number.isNaN(movieId)
      ? []
      : normalized.filter((showtime) => showtime.movieId === movieId);
    return scoped.sort((a, b) => {
      const aTime = new Date(a.startTime).getTime();
      const bTime = new Date(b.startTime).getTime();
      return aTime - bTime;
    });
  }, [showtimes, movieId]);

  const handleReserve = (showtimeId) => {
    if (!showtimeId) return;
    navigate(`/reserve/${showtimeId}`);
  };

  const poster = normalizedMovie.posterUrl?.trim()
    ? normalizedMovie.posterUrl
    : `https://picsum.photos/seed/${normalizedMovie.id ?? "movie"}/700/1000`;

  return (
    <div className="min-h-screen bg-black px-6 py-8 text-white">
      <div className="mx-auto w-full max-w-6xl">
        <button
          type="button"
          onClick={() => navigate("/movies")}
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-300 transition hover:text-white"
        >
          <span className="text-lg">&lt;</span>
          Back to Movies
        </button>

        {error && (
          <div className="mb-6 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-sm text-gray-400">Loading movie...</div>
        ) : !movie ? (
          <div className="text-sm text-gray-400">Movie not found.</div>
        ) : (
          <>
            <div className="grid gap-8 md:grid-cols-[260px_1fr]">
              <div className="overflow-hidden rounded-2xl bg-zinc-900">
                <div className="aspect-[2/3] w-full">
                  <img
                    src={poster}
                    alt={normalizedMovie.title || "Movie"}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-semibold text-white">
                  {normalizedMovie.title || "Untitled"}
                </h1>
                <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-300">
                  {normalizedMovie.genre && (
                    <span className="rounded-full bg-zinc-800 px-3 py-1">
                      {normalizedMovie.genre}
                    </span>
                  )}
                  {normalizedMovie.releaseYear && (
                    <span className="rounded-full bg-zinc-800 px-3 py-1">
                      {normalizedMovie.releaseYear}
                    </span>
                  )}
                  {normalizedMovie.duration && (
                    <span className="rounded-full bg-zinc-800 px-3 py-1">
                      {normalizedMovie.duration} min
                    </span>
                  )}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-gray-300">
                  {normalizedMovie.description || "No description available."}
                </p>
              </div>
            </div>

            <div className="mt-10">
              <h2 className="text-xl font-semibold">Showtimes</h2>
              <p className="mt-1 text-sm text-gray-400">
                Select a showtime to reserve your seats.
              </p>

              {filteredShowtimes.length === 0 ? (
                <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-6 text-sm text-gray-400">
                  No showtimes available for this movie.
                </div>
              ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredShowtimes.map((showtime) => {
                    const hallLabel = showtime.hallName || "Hall";
                    return (
                      <div
                        key={showtime.id}
                        className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-widest text-zinc-500">
                              Date
                            </p>
                            <p className="text-lg font-semibold text-white">
                              {formatDate(showtime.startTime)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs uppercase tracking-widest text-zinc-500">
                              Hall
                            </p>
                            <p className="text-sm font-medium text-white">
                              {hallLabel}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-sm text-gray-300">
                          <span>Start: {formatTime(showtime.startTime)}</span>
                          <span>End: {formatTime(showtime.endTime)}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleReserve(showtime.id)}
                          className="mt-4 w-full rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                        >
                          Reserve
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
