import React from "react";

export default function AdminHalls() {
  // Te dhena statike te perkohshme (do te zëvendësohen me te dhena nga API)
  const halls = [
    { name: "Hall A", seats: 120 },
    { name: "Hall B", seats: 90 },
    { name: "Hall C", seats: 150 },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white/90">Halls Management</h4>
          <button className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
            <i className="bi bi-plus-lg mr-2" aria-hidden="true"></i>
            Add Hall
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500 dark:border-white/[0.05] dark:text-gray-400">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Total Seats</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {halls.map((h, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-white/[0.04]">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white/90">{h.name}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{h.seats}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button className="inline-flex items-center text-blue-600 transition-colors hover:text-blue-700" aria-label="Edit hall">
                      <i className="bi bi-pencil-square"></i>
                    </button>
                    <button className="ml-3 inline-flex items-center text-red-600 transition-colors hover:text-red-700" aria-label="Delete hall">
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
