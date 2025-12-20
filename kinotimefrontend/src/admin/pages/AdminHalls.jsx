import React from "react";
import "../admin.css";

export default function AdminHalls() {
  // Te dhena statike te perkohshme (do te zëvendësohen me te dhena nga API)
  const halls = [
    { name: "Hall A", seats: 120 },
    { name: "Hall B", seats: 90 },
    { name: "Hall C", seats: 150 },
  ];

  return (
    <div className="card card-soft">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">Halls Management</h4>
          <button className="btn btn-primary btn-lg"><i className="bi bi-plus-lg me-2"></i>Add Hall</button>
        </div>
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Name</th>
                <th>Total Seats</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {halls.map((h, idx) => (
                <tr key={idx}>
                  <td className="fw-medium">{h.name}</td>
                  <td className="text-muted">{h.seats}</td>
                  <td className="text-nowrap">
                    <button className="btn btn-link text-primary p-0 me-3"><i className="bi bi-pencil-square"></i></button>
                    <button className="btn btn-link text-danger p-0"><i className="bi bi-trash"></i></button>
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
