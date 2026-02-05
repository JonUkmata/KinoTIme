import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../../services/api";

const normalizeReservation = (reservation) => ({
  id: reservation?.reservationId ?? reservation?.ReservationId,
  status: reservation?.status ?? reservation?.Status ?? "",
  createdAt: reservation?.createdAt ?? reservation?.CreatedAt ?? "",
  movieTitle: reservation?.movieTitle ?? reservation?.MovieTitle ?? "",
  showtimeStartTime:
    reservation?.showtimeStartTime ?? reservation?.ShowtimeStartTime ?? "",
  hallName: reservation?.hallName ?? reservation?.HallName ?? "",
  seatLabels: reservation?.seatLabels ?? reservation?.SeatLabels ?? [],
});

const formatDateTime = (value) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

export default function MyReservations() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReservations = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet("/api/Reservations/my");
      setReservations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Failed to load reservations.");
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const normalizedReservations = useMemo(
    () => reservations.map((reservation) => normalizeReservation(reservation)),
    [reservations]
  );

  return (
    <div className="min-h-screen bg-black px-6 py-8 text-white">
      <div className="mx-auto w-full max-w-5xl">
        <button
          type="button"
          onClick={() => navigate("/movies")}
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-300 transition hover:text-white"
        >
          <span className="text-lg">&lt;</span>
          Back to Movies
        </button>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">My Reservations</h1>
            <p className="mt-1 text-sm text-gray-400">
              Your recent bookings and seat details.
            </p>
          </div>
          <button
            type="button"
            onClick={loadReservations}
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
          <div className="mt-6 text-sm text-gray-400">Loading reservations...</div>
        ) : normalizedReservations.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-sm text-gray-400">
            You do not have any reservations yet.
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {normalizedReservations.map((reservation) => {
              const seatLabels = Array.isArray(reservation.seatLabels)
                ? reservation.seatLabels.join(", ")
                : "";
              return (
                <div
                  key={reservation.id ?? reservation.createdAt}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                        Movie
                      </p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {reservation.movieTitle || "Untitled"}
                      </p>
                      <p className="mt-1 text-sm text-gray-400">
                        {reservation.hallName || "Hall"} •{" "}
                        {formatDateTime(reservation.showtimeStartTime)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex rounded-full bg-zinc-800 px-3 py-1 text-xs font-semibold text-zinc-200">
                        {reservation.status || "Unknown"}
                      </span>
                      <p className="mt-2 text-xs text-zinc-500">
                        Reserved {formatDateTime(reservation.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                      Seats
                    </p>
                    <p className="mt-2 text-sm text-white">
                      {seatLabels || "--"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
