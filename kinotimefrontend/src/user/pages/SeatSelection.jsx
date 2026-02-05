import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiGetSeatMap, apiGetShowtime, apiPost } from "../../services/api";

const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const SEATS_PER_ROW = 12;

const normalizeSeat = (seat) => {
  const rawId = seat?.id ?? seat?.Id;
  const rawNumber = seat?.number ?? seat?.Number;
  return {
    id: rawId === null || rawId === undefined ? null : Number(rawId),
    row: seat?.row ?? seat?.Row ?? "",
    number: rawNumber === null || rawNumber === undefined ? 0 : Number(rawNumber),
  };
};

const normalizeSeatMap = (data) => {
  const rawSeats = data?.seats ?? data?.Seats ?? [];
  const seats = Array.isArray(rawSeats)
    ? rawSeats.map((seat) => normalizeSeat(seat))
    : [];
  const reservedSeatIds = data?.reservedSeatIds ?? data?.ReservedSeatIds ?? [];
  return {
    seats,
    reservedSeatIds: Array.isArray(reservedSeatIds)
      ? reservedSeatIds
          .map((id) => Number(id))
          .filter((id) => !Number.isNaN(id))
      : [],
  };
};

const normalizeShowtime = (showtime) => ({
  id: showtime?.id ?? showtime?.Id,
  price: showtime?.price ?? showtime?.Price ?? 0,
});

export default function SeatSelection() {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const [seatMap, setSeatMap] = useState({ seats: [], reservedSeatIds: [] });
  const [showtime, setShowtime] = useState(null);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const seatByLabel = useMemo(() => {
    const map = new Map();
    seatMap.seats.forEach((seat) => {
      if (!seat.row || !seat.number) return;
      map.set(`${seat.row}${seat.number}`, seat);
    });
    return map;
  }, [seatMap.seats]);

  const seatById = useMemo(() => {
    const map = new Map();
    seatMap.seats.forEach((seat) => {
      if (seat.id === null || seat.id === undefined) return;
      map.set(seat.id, seat);
    });
    return map;
  }, [seatMap.seats]);

  const reservedSeatIdSet = useMemo(
    () => new Set(seatMap.reservedSeatIds),
    [seatMap.reservedSeatIds]
  );

  const selectedSeatIdSet = useMemo(
    () => new Set(selectedSeatIds),
    [selectedSeatIds]
  );

  const loadSeatMap = async () => {
    if (!showtimeId) {
      setError("Missing showtime id.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    setNotice("");
    try {
      const [seatMapData, showtimeData] = await Promise.all([
        apiGetSeatMap(showtimeId),
        apiGetShowtime(showtimeId),
      ]);
      const normalized = normalizeSeatMap(seatMapData);
      setSeatMap(normalized);
      setShowtime(showtimeData);
      setSelectedSeatIds([]);
    } catch (err) {
      setError(err?.message || "Failed to load seat map.");
      setSeatMap({ seats: [], reservedSeatIds: [] });
      setShowtime(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeatMap();
  }, [showtimeId]);

  const toggleSeat = (row, number) => {
    const seat = seatByLabel.get(`${row}${number}`);
    if (seat?.id === null || seat?.id === undefined) return;
    if (reservedSeatIdSet.has(seat.id)) return;

    setSelectedSeatIds((prev) => {
      if (prev.includes(seat.id)) {
        return prev.filter((id) => id !== seat.id);
      }
      return [...prev, seat.id];
    });
  };

  const selectedSeats = useMemo(() => {
    const list = selectedSeatIds
      .map((id) => seatById.get(id))
      .filter(Boolean);
    return list.sort((a, b) => {
      if (a.row === b.row) return a.number - b.number;
      return a.row.localeCompare(b.row);
    });
  }, [selectedSeatIds, seatById]);

  const selectedLabels =
    selectedSeats.length === 0
      ? "None"
      : selectedSeats.map((seat) => `${seat.row}${seat.number}`).join(", ");

  const pricePerSeat = useMemo(() => {
    const normalized = normalizeShowtime(showtime);
    const parsed = Number(normalized.price);
    return Number.isNaN(parsed) ? 0 : parsed;
  }, [showtime]);

  const totalPrice = pricePerSeat * selectedSeatIds.length;

  const formatPrice = (value) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return "--";
    return parsed.toFixed(2);
  };

  const handleConfirm = async () => {
    if (selectedSeatIds.length === 0) {
      setError("Please select at least one seat.");
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await apiPost("/api/Reservations", {
        showtimeId: Number(showtimeId),
        seatIds: selectedSeatIds,
      });
      navigate("/my-reservations");
    } catch (err) {
      setError(err?.message || "Failed to confirm reservation.");
      if (err?.status === 409) {
        await loadSeatMap();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black px-6 py-8 text-white">
      <div className="mx-auto w-full max-w-5xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-300 transition hover:text-white"
        >
          <span className="text-lg">&lt;</span>
          Back
        </button>

        <h1 className="text-2xl font-semibold">Seat Selection</h1>
        <p className="mt-1 text-sm text-gray-400">
          Choose your seats for showtime #{showtimeId}
        </p>

        {error && (
          <div className="mt-4 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">
            {error}
          </div>
        )}

        {notice && (
          <div className="mt-4 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
            {notice}
          </div>
        )}

        {loading ? (
          <div className="mt-6 text-sm text-gray-400">Loading seat map...</div>
        ) : (
          <div className="mt-8 flex flex-col items-center">
            <div className="mb-4 h-1 w-48 rounded-full bg-zinc-700"></div>
            <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">
              Screen
            </div>

            <div className="mt-8 w-full max-w-3xl space-y-2">
              {ROWS.map((row) => (
                <div key={row} className="flex items-center gap-3">
                  <span className="w-4 text-xs font-semibold text-zinc-500">
                    {row}
                  </span>
                  <div className="grid flex-1 grid-cols-12 gap-2">
                    {Array.from({ length: SEATS_PER_ROW }, (_, index) => {
                      const number = index + 1;
                      const seat = seatByLabel.get(`${row}${number}`);
                      const seatId =
                        seat?.id === null || seat?.id === undefined
                          ? null
                          : seat.id;
                      const isReserved =
                        seatId !== null ? reservedSeatIdSet.has(seatId) : false;
                      const isSelected =
                        seatId !== null ? selectedSeatIdSet.has(seatId) : false;

                      const baseClasses =
                        "h-8 w-8 rounded-md text-[10px] font-semibold transition-colors sm:h-9 sm:w-9";
                      const stateClasses = isReserved
                        ? "cursor-not-allowed bg-red-600 text-white/80"
                        : isSelected
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "bg-zinc-700 text-zinc-200 hover:bg-zinc-600";

                      return (
                        <button
                          key={`${row}-${number}`}
                          type="button"
                          disabled={isReserved || seatId === null}
                          onClick={() => toggleSeat(row, number)}
                          className={`${baseClasses} ${stateClasses}`}
                          aria-label={`Seat ${row}${number}`}
                        >
                          {number}
                        </button>
                      );
                    })}
                  </div>
                  <span className="w-4 text-right text-xs font-semibold text-zinc-500">
                    {row}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-300">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-zinc-700"></span>
                Available
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-blue-500"></span>
                Selected
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-red-600"></span>
                Reserved
              </div>
            </div>
          </div>
        )}

        <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Selected Seats
              </p>
              <p className="mt-2 text-sm text-white">{selectedLabels}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Price / Seat
              </p>
              <p className="mt-2 text-sm text-white">
                {pricePerSeat ? `EUR ${formatPrice(pricePerSeat)}` : "--"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Total Seats
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {selectedSeatIds.length}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Total Price
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {pricePerSeat ? `EUR ${formatPrice(totalPrice)}` : "--"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={saving || selectedSeatIds.length === 0 || loading}
            className="mt-4 w-full rounded-full bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Confirming..." : "Confirm Reservation"}
          </button>
        </div>
      </div>
    </div>
  );
}
