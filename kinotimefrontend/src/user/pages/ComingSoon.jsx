import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../../services/api";

const normalizeMovie = (movie) => ({
  id: movie?.id ?? movie?.Id,
  title: movie?.title ?? movie?.Title ?? "Untitled",
  description: movie?.description ?? movie?.Description ?? "",
  genre: movie?.genre ?? movie?.Genre ?? "",
  posterUrl: movie?.posterUrl ?? movie?.PosterUrl ?? movie?.poster ?? "",
  releaseDate: movie?.releaseDate ?? movie?.ReleaseDate ?? null,
});

const parseReleaseDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const formatReleaseDate = (value) => {
  const parsed = parseReleaseDate(value);
  if (!parsed) return "--";
  return parsed.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const daysUntilRelease = (value) => {
  const parsed = parseReleaseDate(value);
  if (!parsed) return null;

  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const target = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  const diffMs = target.getTime() - startToday.getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return days < 0 ? 0 : days;
};

export default function ComingSoon() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const loadMovies = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet("/api/Movies");
      setMovies(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Failed to load coming soon movies.");
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovies();
  }, []);

  const comingSoonMovies = useMemo(() => {
    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return movies
      .map((movie) => normalizeMovie(movie))
      .filter((movie) => {
        const releaseDate = parseReleaseDate(movie.releaseDate);
        return releaseDate ? releaseDate >= startToday : false;
      })
      .sort((a, b) => {
        const aTime = parseReleaseDate(a.releaseDate)?.getTime() ?? Number.MAX_SAFE_INTEGER;
        const bTime = parseReleaseDate(b.releaseDate)?.getTime() ?? Number.MAX_SAFE_INTEGER;
        return aTime - bTime;
      });
  }, [movies]);

  useEffect(() => {
    if (comingSoonMovies.length === 0) {
      setActiveIndex(0);
      return;
    }
    if (activeIndex >= comingSoonMovies.length) {
      setActiveIndex(0);
    }
  }, [comingSoonMovies, activeIndex]);

  useEffect(() => {
    if (comingSoonMovies.length <= 1) return undefined;

    const intervalId = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % comingSoonMovies.length);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [comingSoonMovies.length]);

  const activeMovie = comingSoonMovies[activeIndex] ?? null;

  const handlePrev = () => {
    if (comingSoonMovies.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + comingSoonMovies.length) % comingSoonMovies.length);
  };

  const handleNext = () => {
    if (comingSoonMovies.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % comingSoonMovies.length);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black px-6 py-10 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-16 h-64 w-64 rounded-full bg-red-600/20 blur-3xl" />
        <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-red-300">User Preview</p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Coming Soon</h1>
          </div>
          <button
            type="button"
            onClick={loadMovies}
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:border-white/40 hover:bg-white/10"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 px-5 py-6 text-sm text-zinc-300">
            Loading upcoming movies...
          </div>
        ) : comingSoonMovies.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 px-5 py-8 text-center">
            <p className="text-lg font-semibold">No coming soon movies right now.</p>
            <p className="mt-2 text-sm text-zinc-400">When new releases are added, they will appear here.</p>
          </div>
        ) : (
          <>
            {activeMovie && (
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/75">
                <div className="grid gap-0 lg:grid-cols-[380px_1fr]">
                  <div className="relative h-[420px] bg-zinc-900 lg:h-full">
                    <img
                      src={
                        activeMovie.posterUrl?.trim()
                          ? activeMovie.posterUrl
                          : `https://picsum.photos/seed/${activeMovie.id ?? activeMovie.title}/800/1200`
                      }
                      alt={activeMovie.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-black/20" />
                  </div>

                  <div className="flex flex-col justify-between p-6 sm:p-8">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
                          Coming Soon
                        </span>
                        {activeMovie.genre && (
                          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-zinc-100">
                            {activeMovie.genre}
                          </span>
                        )}
                      </div>

                      <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
                        {activeMovie.title}
                      </h2>

                      <div className="mt-4 flex flex-wrap gap-4 text-sm">
                        <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-2">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-400">Release Date</p>
                          <p className="mt-1 font-semibold text-white">{formatReleaseDate(activeMovie.releaseDate)}</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-2">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-400">Countdown</p>
                          <p className="mt-1 font-semibold text-red-300">
                            {daysUntilRelease(activeMovie.releaseDate)} days left
                          </p>
                        </div>
                      </div>

                      <p className="mt-5 max-w-2xl text-sm leading-relaxed text-zinc-300">
                        {activeMovie.description || "A new experience is on the way. Stay tuned for its release."}
                      </p>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={handlePrev}
                        className="rounded-full border border-white/20 px-4 py-2 text-sm transition hover:bg-white/10"
                      >
                        Prev
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        className="rounded-full border border-white/20 px-4 py-2 text-sm transition hover:bg-white/10"
                      >
                        Next
                      </button>
                      {activeMovie.id ? (
                        <Link
                          to={`/movies/${activeMovie.id}`}
                          className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                        >
                          View Details
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-2">
              {comingSoonMovies.map((movie, index) => (
                <button
                  key={movie.id ?? `${movie.title}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === activeIndex ? "w-10 bg-red-500" : "w-6 bg-white/25 hover:bg-white/40"
                  }`}
                  aria-label={`Go to movie ${index + 1}`}
                />
              ))}
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold">Upcoming Lineup</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {comingSoonMovies.map((movie, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <button
                      key={movie.id ?? `${movie.title}-${index}`}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={`group overflow-hidden rounded-2xl border text-left transition ${
                        isActive
                          ? "border-red-500/70 bg-red-500/10"
                          : "border-white/10 bg-zinc-900/60 hover:border-white/30"
                      }`}
                    >
                      <div className="relative aspect-[3/4] w-full overflow-hidden">
                        <img
                          src={
                            movie.posterUrl?.trim()
                              ? movie.posterUrl
                              : `https://picsum.photos/seed/${movie.id ?? movie.title}/600/900`
                          }
                          alt={movie.title}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                          <p className="text-[11px] uppercase tracking-[0.15em] text-zinc-300">
                            {daysUntilRelease(movie.releaseDate)} days left
                          </p>
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="line-clamp-2 text-sm font-semibold text-white">{movie.title}</p>
                        <p className="mt-1 text-xs text-zinc-400">{formatReleaseDate(movie.releaseDate)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
