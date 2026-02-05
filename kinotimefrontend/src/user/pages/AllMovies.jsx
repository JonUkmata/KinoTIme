import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../../services/api";

export default function AllMovies() {
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [search, setSearch] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const normalizeMovie = (movie) => ({
    id: movie?.id ?? movie?.Id,
    title: movie?.title ?? movie?.Title ?? "",
    genre: movie?.genre ?? movie?.Genre ?? "",
    posterUrl: movie?.posterUrl ?? movie?.PosterUrl ?? movie?.poster ?? "",
  });

  const loadMovies = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet("/api/Movies");
      setMovies(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Failed to load movies.");
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovies();
  }, []);

  const normalizedMovies = useMemo(
    () => movies.map((movie) => normalizeMovie(movie)),
    [movies]
  );

  const genreOptions = useMemo(() => {
    const uniqueGenres = new Set();
    normalizedMovies.forEach((movie) => {
      const genre = (movie.genre || "").trim();
      if (genre) {
        uniqueGenres.add(genre);
      }
    });
    return ["All", ...Array.from(uniqueGenres)];
  }, [normalizedMovies]);

  useEffect(() => {
    if (!genreOptions.includes(selectedGenre)) {
      setSelectedGenre("All");
    }
  }, [genreOptions, selectedGenre]);

  const filteredMovies = useMemo(() => {
    const term = search.trim().toLowerCase();
    return normalizedMovies.filter((movie) => {
      const genre = (movie.genre || "").trim();
      const matchesGenre = selectedGenre === "All" || genre === selectedGenre;
      const matchesSearch =
        term.length === 0 || movie.title.toLowerCase().includes(term);
      return matchesGenre && matchesSearch;
    });
  }, [normalizedMovies, selectedGenre, search]);

  return (
    <div className="min-h-screen bg-black text-white px-10 py-8">
      <h1 className="text-3xl font-semibold mb-6">All Movies</h1>

      {error && (
        <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Search */}
      <input
        type="text"
        placeholder="Search movies..."
        className="w-full max-w-md mb-6 px-4 py-2 rounded-md bg-zinc-900 border border-zinc-700 focus:outline-none"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Genre filter */}
      <div className="flex gap-3 mb-8 flex-wrap">
        {genreOptions.map((genre) => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(genre)}
            className={`px-4 py-2 rounded-full text-sm transition ${
              selectedGenre === genre
                ? "bg-red-600 text-white"
                : "bg-zinc-800 text-gray-300 hover:bg-zinc-700"
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-sm text-gray-400">Loading movies...</div>
      ) : filteredMovies.length === 0 ? (
        <div className="text-sm text-gray-400">No movies found.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredMovies.map((movie) => {
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
