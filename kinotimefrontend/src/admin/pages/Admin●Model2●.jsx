import React, { useEffect, useState } from "react";
import { apiDelete, apiGet, apiPost, apiPut } from "../../services/api";

export default function AdminModel2() {
  const emptyForm = {
    fusha1: "", // ← fusha 1
    fusha2: "", // ← fusha 2 (nëse ka)
    model1ID: "", // ← FK dropdown
  };

  const [model2t, setModel2t] = useState([]);
  const [model1t, setModel1t] = useState([]); // ← për dropdown
  const [formData, setFormData] = useState(emptyForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const normalizeModel2 = (item) => ({
    id: item?.id ?? item?.Id,
    fusha1: item?.fusha1 ?? item?.Fusha1 ?? "",
    fusha2: item?.fusha2 ?? item?.Fusha2 ?? "",
    model1ID: item?.model1ID ?? item?.Model1ID ?? "",
    emriModel1: item?.model1?.fusha1 ?? item?.Model1?.Fusha1 ?? "--", // ← navigation
  });

  const loadModel2t = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet("/api/Model2t"); // ← endpoint
      setModel2t(Array.isArray(data) ? data : []);
      return true;
    } catch (err) {
      setError(err?.message || "Gabim gjatë ngarkimit.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loadModel1t = async () => {
    try {
      const data = await apiGet("/api/Model1t"); // ← endpoint për dropdown
      setModel1t(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Gabim gjatë ngarkimit.");
    }
  };

  useEffect(() => {
    loadModel2t();
    loadModel1t();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    setIsFormOpen(true);
    setIsEditing(false);
    setEditingId(null);
    setFormData(emptyForm);
    setError("");
  };

  const handleEdit = (item) => {
    const n = normalizeModel2(item);
    if (!n.id) { setError("Missing id."); return; }
    setIsFormOpen(true);
    setIsEditing(true);
    setEditingId(n.id);
    setFormData({
      fusha1: n.fusha1,
      fusha2: n.fusha2,
      model1ID: String(n.model1ID),
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const payload = {
      fusha1: formData.fusha1.trim(),
      fusha2: formData.fusha2.trim(),
      model1ID: parseInt(formData.model1ID), // ← FK
    };
    if (!payload.fusha1) { setError("Fusha1 është e detyrueshme."); return; }
    if (!payload.model1ID) { setError("Zgjedh Model1."); return; }
    setSaving(true);
    try {
      if (isEditing && editingId !== null) {
        await apiPut(`/api/Model2t/${editingId}`, { id: editingId, ...payload });
      } else {
        await apiPost("/api/Model2t", payload);
      }
      const refreshed = await loadModel2t();
      if (refreshed) handleCancel();
    } catch (err) {
      setError(err?.message || "Gabim gjatë ruajtjes.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const n = normalizeModel2(item);
    if (!n.id) { setError("Missing id."); return; }
    if (!window.confirm(`Fshi "${n.fusha1}"?`)) return;
    setError("");
    try {
      await apiDelete(`/api/Model2t/${n.id}`);
      await loadModel2t();
    } catch (err) {
      setError(err?.message || "Gabim gjatë fshirjes.");
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white/90">
            Menaxhimi i ●Model2●ve {/* ← ndrysho titullin */}
          </h4>
          <button type="button" onClick={handleAdd}
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
            <i className="bi bi-plus-lg mr-2"></i>
            Shto ●Model2● {/* ← ndrysho */}
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
        )}

        {isFormOpen && (
          <form onSubmit={handleSubmit}
            className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-white/[0.08] dark:bg-white/[0.03]">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Fusha1 {/* ← ndrysho */}
                </label>
                <input name="fusha1" type="text" required
                  value={formData.fusha1} onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                  placeholder="Fusha1" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Fusha2 {/* ← ndrysho */}
                </label>
                <input name="fusha2" type="text" required
                  value={formData.fusha2} onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                  placeholder="Fusha2" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Model1 {/* ← ndrysho - dropdown label */}
                </label>
                {/* DROPDOWN */}
                <select name="model1ID" required
                  value={formData.model1ID} onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none">
                  <option value="">-- Zgjedh Model1 --</option>
                  {model1t.map((item) => (
                    <option key={item.id ?? item.Id} value={item.id ?? item.Id}>
                      {item.fusha1 ?? item.Fusha1} {/* ← fusha që shfaqet */}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
              <button type="button" onClick={handleCancel}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50">
                Anulo
              </button>
              <button type="submit" disabled={saving}
                className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60">
                {saving ? "Duke ruajtur..." : isEditing ? "Përditëso ●Model2●" : "Krijo ●Model2●"}
              </button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-900 dark:border-white/[0.05]">
              <tr>
                <th className="px-4 py-3 font-medium">●Fusha1●</th>
                <th className="px-4 py-3 font-medium">●Fusha2●</th>
                <th className="px-4 py-3 font-medium">●Model1●</th>
                <th className="px-4 py-3 font-medium">Veprimet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <tr><td className="px-4 py-6 text-center text-sm text-gray-500" colSpan="4">Duke ngarkuar...</td></tr>
              ) : model2t.length === 0 ? (
                <tr><td className="px-4 py-6 text-center text-sm text-gray-500" colSpan="4">Nuk ka të dhëna.</td></tr>
              ) : (
                model2t.map((item, idx) => {
                  const n = normalizeModel2(item);
                  return (
                    <tr key={n.id ?? idx} className="hover:bg-gray-50 dark:hover:bg-white/[0.04]">
                      <td className="px-4 py-3 font-medium text-gray-900">{n.fusha1}</td>
                      <td className="px-4 py-3 text-gray-900">{n.fusha2}</td>
                      <td className="px-4 py-3 text-gray-900">{n.emriModel1 }</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button type="button" onClick={() => handleEdit(item)}
                          className="inline-flex items-center text-blue-600 transition-colors hover:text-blue-700">
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button type="button" onClick={() => handleDelete(item)}
                          className="ml-3 inline-flex items-center text-red-600 transition-colors hover:text-red-700">
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