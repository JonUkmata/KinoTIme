import React, { useEffect, useState } from "react";
import { apiDelete, apiGet, apiPost, apiPut } from "../../services/api";

export default function AdminShkolla() {
  const [shkollat, setShkollat] = useState([]);
  const [emriShkolles, setEmriShkolles] = useState("");
  const [qyteti, setQyteti] = useState("");
  const [editId, setEditId] = useState(null);

  const merrShkollat = async () => {
    const data = await apiGet("/api/Shkollat");
    setShkollat(data);
  };

  useEffect(() => {
    merrShkollat();
  }, []);

  const ruajShkollen = async (e) => {
    e.preventDefault();

    const shkolla = { emriShkolles, qyteti };

    if (editId) {
      await apiPut(`/api/Shkollat/${editId}`, { id: editId, ...shkolla });
    } else {
      await apiPost("/api/Shkollat", shkolla);
    }

    setEmriShkolles("");
    setQyteti("");
    setEditId(null);
    merrShkollat();
  };

  const edito = (shkolla) => {
    setEditId(shkolla.id);
    setEmriShkolles(shkolla.emriShkolles);
    setQyteti(shkolla.qyteti);
  };

  const fshij = async (id) => {
    await apiDelete(`/api/Shkollat/${id}`);
    merrShkollat();
  };

  return (
    <div className="bg-white p-6 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Admin shkolla</h2>

      <form onSubmit={ruajShkollen} className="mb-6 flex gap-3">
        <input
          className="border p-2 rounded"
          placeholder="Emri i shkolles"
          value={emriShkolles}
          onChange={(e) => setEmriShkolles(e.target.value)}
        />
        <input
          className="border p-2 rounded"
          placeholder="qyteti"
          value={qyteti}
          onChange={(e) => setQyteti(e.target.value)}
        />
        <button className="bg-blue-600 text-white px-4 rounded">
          {editId ? "Perditeso" : "Shto"}
        </button>
      </form>

      <table className="w-full border">
        <thead>
          <tr className="border">
            <th className="p-2">ID</th>
            <th className="p-2">EmriShkolles</th>
            <th className="p-2">Qyteteti</th>
            <th className="p-2">Veprime</th>
          </tr>
        </thead>
        <tbody>
          {shkollat.map((shkolla) => (
            <tr key={shkolla.id} className="border text-center">
              <td className="p-2">{shkolla.id}</td>
              <td className="p-2">{shkolla.emriShkolles}</td>
              <td className="p-2">{shkolla.qyteti}</td>
              <td className="p-2">
                <button onClick={() => edito(shkolla)} className="text-blue-600 mr-3">
                  Edit
                </button>
                <button onClick={() => fshij(shkolla.id)} className="text-red-600">
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
