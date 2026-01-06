import { useState } from "react";

const playingNowMovies = [
  {
    id: 1,
    title: "Movie 1",
    posterUrl: "/Filmi1.jpg",
    status: "today",
  },
  {
    id: 2,
    title: "Movie 2",
    posterUrl: "/Filmi2.jpg",
    status: "today",
  },
  {
    id: 3,
    title: "Movie 3",
    posterUrl: "/Filmi3.jpeg",
    status: "week",
  },
];

export default function PlayingNow() {
  const [filter, setFilter] = useState("today");

  const filteredMovies = playingNowMovies.filter(
    (movie) => movie.status === filter
  );

  return (
    <div className="min-h-screen bg-black text-white px-10 py-8">
      <h1 className="text-3xl font-semibold mb-6">Playing Now</h1>

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

