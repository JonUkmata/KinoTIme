import { useEffect } from "react";

const stats = [
  {
    label: "Total Movies",
    value: "128",
    change: "+6.2%",
    trend: "up",
    icon: "bi-film",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    label: "Active Halls",
    value: "12",
    change: "+1",
    trend: "up",
    icon: "bi-door-open",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    label: "Tickets Sold",
    value: "24.3k",
    change: "+12.4%",
    trend: "up",
    icon: "bi-ticket-perforated",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    label: "Revenue",
    value: "$18.7k",
    change: "-1.8%",
    trend: "down",
    icon: "bi-cash-coin",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
  },
];

const weeklyBookings = [
  { day: "Mon", value: 42 },
  { day: "Tue", value: 58 },
  { day: "Wed", value: 36 },
  { day: "Thu", value: 64 },
  { day: "Fri", value: 78 },
  { day: "Sat", value: 91 },
  { day: "Sun", value: 69 },
];

const hallUtilization = [
  { name: "Hall A", value: 86 },
  { name: "Hall B", value: 72 },
  { name: "Hall C", value: 64 },
  { name: "Hall D", value: 58 },
];

const recentBookings = [
  { movie: "Cosmic Odyssey", hall: "Hall A", time: "14:30", status: "Confirmed" },
  { movie: "Shadow's Edge", hall: "Hall C", time: "16:10", status: "Pending" },
  { movie: "Laugh Out Loud", hall: "Hall B", time: "18:45", status: "Confirmed" },
  { movie: "Thunder Strike", hall: "Hall D", time: "21:00", status: "Canceled" },
];

const statusStyles = {
  Confirmed:
    "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  Pending:
    "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
  Canceled:
    "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
};

export default function Home() {
  useEffect(() => {
    document.title = "Admin Dashboard | KinoTime";
  }, []);

  const maxWeekly = Math.max(
    ...weeklyBookings.map((item) => item.value),
    1
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="col-span-12 rounded-xl border border-gray-200 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] sm:col-span-6 xl:col-span-3 dark:border-white/[0.05] dark:bg-white/[0.03]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {stat.label}
                </p>
                <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white/90">
                  {stat.value}
                </p>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.iconBg} dark:bg-white/[0.06]`}
              >
                <i
                  className={`bi ${stat.icon} text-xl ${stat.iconColor} dark:text-white/80`}
                  aria-hidden="true"
                ></i>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span
                className={
                  stat.trend === "up" ? "text-emerald-600" : "text-rose-600"
                }
              >
                {stat.change}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                since last week
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 rounded-xl border border-gray-200 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] xl:col-span-7 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white/90">
              Weekly Bookings
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Last 7 days
            </span>
          </div>
          <div className="mt-6 flex h-48 items-end gap-3">
            {weeklyBookings.map((item) => {
              const height = Math.round((item.value / maxWeekly) * 100);
              return (
                <div key={item.day} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex w-full flex-1 items-end rounded-md bg-blue-50 dark:bg-blue-500/10">
                    <div
                      className="w-full rounded-md bg-blue-600"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="col-span-12 rounded-xl border border-gray-200 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] xl:col-span-5 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white/90">
              Hall Utilization
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Today
            </span>
          </div>
          <div className="mt-6 space-y-4">
            {hallUtilization.map((hall) => (
              <div key={hall.name}>
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>{hall.name}</span>
                  <span>{hall.value}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-gray-100 dark:bg-white/[0.06]">
                  <div
                    className="h-2 rounded-full bg-emerald-500"
                    style={{ width: `${hall.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 rounded-xl border border-gray-200 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white/90">
              Recent Bookings
            </h3>
            <button className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700">
              View all
            </button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500 dark:border-white/[0.05] dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Movie</th>
                  <th className="px-4 py-3 font-medium">Hall</th>
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {recentBookings.map((row) => (
                  <tr key={`${row.movie}-${row.time}`}>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white/90">
                      {row.movie}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {row.hall}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {row.time}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[row.status] || "border-gray-200 bg-gray-50 text-gray-600"}`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
