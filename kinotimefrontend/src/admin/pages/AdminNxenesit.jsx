import React, { useEffect, useState } from "react";
import { apiDelete, apiGet, apiPost, apiPut } from "../../services/api";

export default function AdminNxenesit() {
  const [nxenesit, setNxenesit] = useState([]);
  const [shkollat, setShkollat] = useState([]);
  const [emriNxenesit, setEmri] = useState("");
  const [klasa, setKlasa] = useState("");
  const [shkollaId, setShkollaId] = useState("");
  const [editId, setEditId] = useState(null);
  const [filterShkollaId, setFilterShkollaId] = useState("");

  const merrTeDhenat = async () => {
    setNxenesit(await apiGet("/api/nxenesit"));
    setShkollat(await apiGet("/api/Shkollat"));
  };

  useEffect(() => {
    merrTeDhenat();
  }, []);

  const ruajNxenesit = async (e) => {
    e.preventDefault();

    const nxenesi = {
      emriNxenesit,
      klasa,
      shkollaId: Number(shkollaId),
    };

    if (editId) {
      await apiPut(`/api/nxenesit/${editId}`, { id: editId, ...nxenesi });
    } else {
      await apiPost("/api/nxenesit", nxenesi);
    }

    setEmri("");
    setKlasa("");
    setShkollaId("");
    setEditId(null);
    merrTeDhenat();
  };

  const edito = (nxenesi) => {
    setEditId(nxenesi.id);
    setEmri(nxenesi.emriNxenesit);
    setKlasa(nxenesi.klasa);
    setShkollaId(nxenesi.shkollaId);
  };

  const fshij = async (id) => {
    await apiDelete(`/api/nxenesit/${id}`);
    merrTeDhenat();
  };

  const nxenesitEFiltuar = filterShkollaId
    ? nxenesit.filter((p) => p.shkollaId === Number(filterShkollaId))
    : nxenesit;

  return (
    <div className="bg-white p-6 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Admin nxenesi</h2>

      <form onSubmit={ruajNxenesit} className="mb-6 flex gap-3 flex-wrap">
        <input className="border p-2 rounded" placeholder="emriNxenesit" value={emriNxenesit} onChange={(e) => setEmri(e.target.value)} />
        <input className="border p-2 rounded" placeholder="klasa" value={klasa} onChange={(e) => setKlasa(e.target.value)} />

        <select className="border p-2 rounded" value={shkollaId} onChange={(e) => setShkollaId(e.target.value)}>
          <option value="">Zgjedh shkollen</option>
          {shkollat.map((shkolla) => (
            <option key={shkolla.id} value={shkolla.id}>
              {shkolla.emriShkolles}
            </option>
          ))}
        </select>

        <button className="bg-blue-600 text-white px-4 rounded">
          {editId ? "Perditeso" : "Shto"}
        </button>
      </form>

      <div className="mb-4">
        <select
          className="border p-2 rounded"
          value={filterShkollaId}
          onChange={(e) => setFilterShkollaId(e.target.value)}
        >
          <option value="">Te gjitha shkollat</option>
          {shkollat.map((shkolla) => (
            <option key={shkolla.id} value={shkolla.id}>
              {shkolla.emriShkolles}
            </option>
          ))}
        </select>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="border">
            <th className="p-2">ID</th>
            <th className="p-2">emriNxenesit</th>
            <th className="p-2">klasa</th>
            <th className="p-2">shkolla</th>
            <th className="p-2">Veprime</th>
          </tr>
        </thead>
        <tbody>
          {nxenesitEFiltuar.map((nxenesi) => (
            <tr key={nxenesi.id} className="border text-center">
              <td className="p-2">{nxenesi.id}</td>
              <td className="p-2">{nxenesi.emriNxenesit}</td>
              <td className="p-2">{nxenesi.klasa}</td>
              <td className="p-2">{nxenesi.shkolla?.emriShkolles}</td>
              <td className="p-2">
                <button onClick={() => edito(nxenesi)} className="text-blue-600 mr-3">
                  Edit
                </button>
                <button onClick={() => fshij(nxenesi.id)} className="text-red-600">
                  Fshi
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
