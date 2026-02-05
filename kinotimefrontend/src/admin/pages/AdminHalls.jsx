import React, { useEffect, useState } from "react";
import { apiDelete, apiGet, apiPost, apiPut } from "../../services/api";

export default function AdminHalls() {
  const STANDARD_CAPACITY = 120;
  const emptyForm = {
    name: "",
  };

  const [halls, setHalls] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const normalizeHall = (hall) => ({
    id: hall?.id ?? hall?.Id,
    name: hall?.name ?? hall?.Name ?? "",
    capacity: hall?.capacity ?? hall?.Capacity ?? 0,
  });

  const loadHalls = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet("/api/Halls");
      setHalls(Array.isArray(data) ? data : []);
      return true;
    } catch (err) {
      setError(err?.message || "Failed to load halls.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHalls();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    setIsFormOpen(true);
    setIsEditing(false);
    setEditingId(null);
    setFormData(emptyForm);
    setError("");
  };

  const handleEdit = (hall) => {
    const normalized = normalizeHall(hall);
    if (!normalized.id) {
      setError("Missing hall id. Refresh and try again.");
      return;
    }
    setIsFormOpen(true);
    setIsEditing(true);
    setEditingId(normalized.id);
    setFormData({
      name: normalized.name,
    });
    setError("");
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setIsEditing(false);
    setEditingId(null);
    setFormData(emptyForm);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const payload = {
      name: formData.name.trim(),
      capacity: STANDARD_CAPACITY,
    };

    if (!payload.name) {
      setError("Name is required.");
      return;
    }

    setSaving(true);
    try {
      if (isEditing && editingId !== null) {
        await apiPut(`/api/Halls/${editingId}`, { id: editingId, ...payload });
      } else {
        await apiPost("/api/Halls", payload);
      }
      const refreshed = await loadHalls();
      if (refreshed) {
        handleCancel();
      }
    } catch (err) {
      setError(err?.message || "Failed to save hall.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (hall) => {
    const normalized = normalizeHall(hall);
    if (!normalized.id) {
      setError("Missing hall id. Refresh and try again.");
      return;
    }
    const confirmText = normalized.name
      ? `Delete "${normalized.name}"?`
      : "Delete this hall?";
    if (!window.confirm(confirmText)) return;

    setError("");
    try {
      await apiDelete(`/api/Halls/${normalized.id}`);
      await loadHalls();
    } catch (err) {
      setError(err?.message || "Failed to delete hall.");
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white/90">Halls Management</h4>
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <i className="bi bi-plus-lg mr-2" aria-hidden="true"></i>
            Add Hall
          </button>
        </div>
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        {isFormOpen && (
          <form
            onSubmit={handleSubmit}
            className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-white/[0.08] dark:bg-white/[0.03]"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Name
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                  placeholder="Hall name"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Capacity (fixed)
                </label>
                <div className="flex h-[38px] items-center rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900">
                  {STANDARD_CAPACITY}
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : isEditing ? "Update Hall" : "Create Hall"}
              </button>
            </div>
          </form>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-900 dark:border-white/[0.05]">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Total Seats</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-center text-sm text-gray-500" colSpan="3">
                    Loading halls...
                  </td>
                </tr>
              ) : halls.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-sm text-gray-500" colSpan="3">
                    No halls found.
                  </td>
                </tr>
              ) : (
                halls.map((hall, idx) => {
                  const normalized = normalizeHall(hall);
                  const capacityLabel = normalized.capacity ? normalized.capacity : "--";
                  return (
                    <tr key={normalized.id ?? idx} className="hover:bg-gray-50 dark:hover:bg-white/[0.04]">
                      <td className="px-4 py-3 font-medium text-gray-900">{normalized.name || "--"}</td>
                      <td className="px-4 py-3 text-gray-900">{capacityLabel}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleEdit(hall)}
                          className="inline-flex items-center text-blue-600 transition-colors hover:text-blue-700"
                          aria-label="Edit hall"
                        >
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(hall)}
                          className="ml-3 inline-flex items-center text-red-600 transition-colors hover:text-red-700"
                          aria-label="Delete hall"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
