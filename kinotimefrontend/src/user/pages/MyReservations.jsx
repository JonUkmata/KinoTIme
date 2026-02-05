import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiCancelReservation, apiGet } from "../../services/api";

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

const formatDate = (value) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
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

const formatStatus = (value) => {
  if (!value) return "--";
  return value.toLowerCase();
};

const getStatusClasses = (status) => {
  const normalized = formatStatus(status);
  if (normalized === "cancelled" || normalized === "canceled") {
    return "bg-red-600/20 text-red-300";
  }
  if (normalized === "active" || normalized === "confirmed") {
    return "bg-emerald-600/20 text-emerald-300";
  }
  return "bg-zinc-700/40 text-zinc-300";
};

export default function MyReservations() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [error, setError] = useState("");

  const isCancelable = (status) => {
    if (!status) return false;
    const normalized = status.toLowerCase();
    return normalized === "active" || normalized === "confirmed";
  };

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

  const handleCancel = async (reservation) => {
    if (!reservation?.id) return;
    setError("");
    setCancellingId(reservation.id);
    try {
      await apiCancelReservation(reservation.id);
      await loadReservations();
    } catch (err) {
      setError(err?.message || "Failed to cancel reservation.");
    } finally {
      setCancellingId(null);
    }
  };

  const openConfirm = (reservation) => {
    if (!reservation?.id) return;
    setConfirmTarget(reservation);
  };

  const closeConfirm = () => {
    setConfirmTarget(null);
  };

  const normalizedReservations = useMemo(
    () => reservations.map((reservation) => normalizeReservation(reservation)),
    [reservations]
  );

  return (
    <div className="min-h-screen bg-black px-6 py-8 text-white">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-semibold">My Reservations</h1>
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
          <div className="mt-6 overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/40">
            <table className="min-w-full text-left text-sm text-gray-200">
              <thead className="border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="px-4 py-3">Reservation ID</th>
                  <th className="px-4 py-3">Movie</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Hall</th>
                  <th className="px-4 py-3">Seats</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {normalizedReservations.map((reservation, index) => {
                  const seatLabels = Array.isArray(reservation.seatLabels)
                    ? reservation.seatLabels.join(", ")
                    : "";
                  return (
                    <tr key={reservation.id ?? reservation.createdAt ?? index}>
                      <td className="px-4 py-3 text-[#e50914]">
                        {reservation.id ?? `r${index + 1}`}
                      </td>
                      <td className="px-4 py-3">
                        {reservation.movieTitle || "Untitled"}
                      </td>
                      <td className="px-4 py-3">
                        {formatDate(reservation.showtimeStartTime)}
                      </td>
                      <td className="px-4 py-3">
                        {formatTime(reservation.showtimeStartTime)}
                      </td>
                      <td className="px-4 py-3">
                        {reservation.hallName || "--"}
                      </td>
                      <td className="px-4 py-3">{seatLabels || "--"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                            reservation.status
                          )}`}
                        >
                          {formatStatus(reservation.status) || "unknown"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isCancelable(reservation.status) ? (
                          <button
                            type="button"
                            onClick={() => openConfirm(reservation)}
                            disabled={cancellingId === reservation.id}
                            className="rounded-full border border-red-500/50 px-3 py-1 text-xs font-semibold text-red-300 transition hover:border-red-400 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {cancellingId === reservation.id ? "Cancelling..." : "Cancel"}
                          </button>
                        ) : (
                          <span className="text-xs text-zinc-500">--</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-700 bg-[#1f1f23] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <h2 className="text-lg font-semibold text-white">Cancel reservation</h2>
            <p className="mt-2 text-sm text-gray-300">
              Are you sure you want to cancel this reservation?
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeConfirm}
                className="rounded-full border border-zinc-600 px-4 py-2 text-sm text-gray-200 transition hover:border-zinc-500 hover:text-white"
              >
                Keep
              </button>
              <button
                type="button"
                onClick={async () => {
                  const target = confirmTarget;
                  closeConfirm();
                  await handleCancel(target);
                }}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Cancel Reservation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
