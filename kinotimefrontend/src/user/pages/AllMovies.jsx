import { useState } from "react";

const genres = [
  "All",
  "Action",
  "Comedy",
  "Horror",
  "Sci-Fi",
  "Fantasy",
  "Romance",
  "Thriller",
];

const moviesData = [
  {
    id: 1,
    title: "Movie 1",
    genre: "Action",
    posterUrl: "/Filmi1.jpg",
  },
  {
    id: 2,
    title: "Movie 2",
    genre: "Horror",
    posterUrl: "/Filmi2.jpg",
  },
  {
    id: 3,
    title: "Movie 3",
    genre: "Comedy",
    posterUrl: "/Filmi3.jpeg",
  },
  {
    id: 4,
    title: "Movie 4",
    genre: "Thriller",
    posterUrl: "/Filmi3.jpeg",
  },
];

export default function AllMovies() {
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [search, setSearch] = useState("");

  const filteredMovies = moviesData.filter((movie) => {
    const matchesGenre =
      selectedGenre === "All" || movie.genre === selectedGenre;
    const matchesSearch = movie.title
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesGenre && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-black text-white px-10 py-8">
      <h1 className="text-3xl font-semibold mb-6">All Movies</h1>

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
        {genres.map((genre) => (
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

      {/* Movies grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {filteredMovies.map((movie) => (
          <div
            key={movie.id}
            className="rounded-xl overflow-hidden bg-zinc-900 hover:scale-105 transition"
          >
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-full h-96 object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

