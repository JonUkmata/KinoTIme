import { useEffect, useMemo, useState } from "react";
import { apiGetAdminDashboard } from "../../../services/api";

const formatNumber = (value) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return "--";
  return new Intl.NumberFormat().format(parsed);
};

const formatPercent = (value) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return "--";
  return `${parsed.toFixed(2)}%`;
};

const formatCurrency = (value) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return "--";
  return `EUR ${parsed.toFixed(2)}`;
};

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

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Admin Dashboard | KinoTime";
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await apiGetAdminDashboard();
      setData(result);
    } catch (err) {
      setError(err?.message || "Failed to load dashboard stats.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const summaryCards = useMemo(() => {
    if (!data) return [];
    return [
      {
        label: "Total Movies",
        value: formatNumber(data?.totals?.movies),
        icon: "bi-film",
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
      },
      {
        label: "Total Halls",
        value: formatNumber(data?.totals?.halls),
        icon: "bi-door-open",
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-600",
      },
      {
        label: "Total Showtimes",
        value: formatNumber(data?.totals?.showtimes),
        icon: "bi-calendar-event",
        iconBg: "bg-amber-50",
        iconColor: "text-amber-600",
      },
      {
        label: "Total Reservations",
        value: formatNumber(data?.totals?.reservations),
        icon: "bi-ticket-perforated",
        iconBg: "bg-rose-50",
        iconColor: "text-rose-600",
      },
    ];
  }, [data]);

  const secondaryCards = useMemo(() => {
    if (!data) return [];
    return [
      {
        label: "Active Reservations",
        value: `${formatNumber(data?.reservations?.active)} (${formatPercent(
          data?.reservations?.activePercent
        )})`,
      },
      {
        label: "Cancelled Reservations",
        value: `${formatNumber(data?.reservations?.cancelled)} (${formatPercent(
          data?.reservations?.cancelledPercent
        )})`,
      },
      {
        label: "Showtimes Today",
        value: formatNumber(data?.showtimes?.today),
      },
      {
        label: "Showtimes This Week",
        value: formatNumber(data?.showtimes?.thisWeek),
      },
      {
        label: "Reservations Today",
        value: formatNumber(data?.reservations?.today),
      },
      {
        label: "Reservations This Week",
        value: formatNumber(data?.reservations?.thisWeek),
      },
    ];
  }, [data]);

  const revenueCards = useMemo(() => {
    if (!data) return [];
    return [
      {
        label: "Revenue Total",
        value: formatCurrency(data?.revenue?.total),
      },
      {
        label: "Revenue Today",
        value: formatCurrency(data?.revenue?.today),
      },
      {
        label: "Revenue This Week",
        value: formatCurrency(data?.revenue?.thisWeek),
      },
    ];
  }, [data]);

  return (
    <div className="space-y-6 text-black">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-gray-600">Loading dashboard...</div>
      ) : (
        <>
          <div className="grid grid-cols-12 gap-4 md:gap-6">
            {summaryCards.map((stat) => (
              <div
                key={stat.label}
                className="col-span-12 rounded-xl border border-gray-200 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] sm:col-span-6 xl:col-span-3 dark:border-white/[0.05] dark:bg-white/[0.03]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-black">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.iconBg} dark:bg-white/[0.06]`}
                  >
                    <i
                      className={`bi ${stat.icon} text-xl ${stat.iconColor}`}
                      aria-hidden="true"
                    ></i>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-12 gap-4 md:gap-6">
            {secondaryCards.map((stat) => (
              <div
                key={stat.label}
                className="col-span-12 rounded-xl border border-gray-200 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] sm:col-span-6 xl:col-span-4 dark:border-white/[0.05] dark:bg-white/[0.03]"
              >
                <p className="text-sm text-gray-600">
                  {stat.label}
                </p>
                <p className="mt-2 text-2xl font-semibold text-black">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-12 gap-4 md:gap-6">
            {revenueCards.map((stat) => (
              <div
                key={stat.label}
                className="col-span-12 rounded-xl border border-gray-200 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] sm:col-span-6 xl:col-span-4 dark:border-white/[0.05] dark:bg-white/[0.03]"
              >
                <p className="text-sm text-gray-600">
                  {stat.label}
                </p>
                <p className="mt-2 text-2xl font-semibold text-black">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12 rounded-xl border border-gray-200 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] xl:col-span-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
              <h3 className="text-base font-semibold text-black">
                Top Movies (by reservations)
              </h3>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-700">
                    <tr>
                      <th className="px-4 py-3 font-medium">Movie</th>
                      <th className="px-4 py-3 font-medium">Reservations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {data?.topMovies?.length ? (
                      data.topMovies.map((row) => (
                        <tr key={row.movieId ?? row.title}>
                          <td className="px-4 py-3 font-medium text-black">
                            {row.title || "Untitled"}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {formatNumber(row.reservationsCount)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-600" colSpan="2">
                          No data available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="col-span-12 rounded-xl border border-gray-200 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] xl:col-span-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
              <h3 className="text-base font-semibold text-black">
                Top Showtimes (by reserved seats)
              </h3>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-700">
                    <tr>
                      <th className="px-4 py-3 font-medium">Movie</th>
                      <th className="px-4 py-3 font-medium">Hall</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Seats</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {data?.topShowtimes?.length ? (
                      data.topShowtimes.map((row) => (
                        <tr key={row.showtimeId}>
                          <td className="px-4 py-3 font-medium text-black">
                            {row.movieTitle || "Untitled"}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {row.hallName || "--"}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {formatDate(row.startTime)} {formatTime(row.startTime)}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {formatNumber(row.reservedSeats)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-600" colSpan="4">
                          No data available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="col-span-12 rounded-xl border border-gray-200 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] xl:col-span-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
              <h3 className="text-base font-semibold text-black">
                Occupancy by Showtime
              </h3>
              <div className="mt-4 space-y-4">
                {data?.occupancyByShowtime?.length ? (
                  data.occupancyByShowtime.map((row) => (
                    <div key={row.showtimeId}>
                      <div className="flex items-center justify-between text-sm text-gray-700">
                        <span>
                          {row.movieTitle || "Untitled"} - {row.hallName || "--"}
                        </span>
                        <span>{formatPercent(row.occupancyPercent)}</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-gray-100 dark:bg-white/[0.06]">
                        <div
                          className="h-2 rounded-full bg-emerald-500"
                          style={{ width: `${row.occupancyPercent}%` }}
                        />
                      </div>
                      <div className="mt-1 text-xs text-gray-600">
                        {formatNumber(row.reservedSeats)} / {formatNumber(row.totalSeats)} seats
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-600">No data available.</div>
                )}
              </div>
            </div>

            <div className="col-span-12 rounded-xl border border-gray-200 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] xl:col-span-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
              <h3 className="text-base font-semibold text-black">
                Avg Occupancy by Movie
              </h3>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-700">
                    <tr>
                      <th className="px-4 py-3 font-medium">Movie</th>
                      <th className="px-4 py-3 font-medium">Avg Occupancy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {data?.avgOccupancyByMovie?.length ? (
                      data.avgOccupancyByMovie.map((row) => (
                        <tr key={row.movieId ?? row.title}>
                          <td className="px-4 py-3 font-medium text-black">
                            {row.title || "Untitled"}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {formatPercent(row.avgOccupancyPercent)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-600" colSpan="2">
                          No data available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
