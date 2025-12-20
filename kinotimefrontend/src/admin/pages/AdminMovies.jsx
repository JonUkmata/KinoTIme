import React from "react";
import "../admin.css";

export default function AdminMovies() {
  // Te dhena statike te perkohshme (do te zëvendësohen me te dhena nga API)
  const movies = [
    { poster: "https://picsum.photos/seed/1/64/64", title: "Cosmic Odyssey", genre: "Sci-Fi", duration: "148 min", status: "Playing Now" },
    { poster: "https://picsum.photos/seed/2/64/64", title: "Shadow's Edge", genre: "Horror", duration: "112 min", status: "Playing Now" },
    { poster: "https://picsum.photos/seed/3/64/64", title: "Thunder Strike", genre: "Action", duration: "125 min", status: "Playing Now" },
    { poster: "https://picsum.photos/seed/4/64/64", title: "Laugh Out Loud", genre: "Comedy", duration: "98 min", status: "Playing Now" },
  ];

  return (
    <div className="card card-soft">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">Movies Management</h4>
          <button className="btn btn-primary btn-lg"><i className="bi bi-plus-lg me-2"></i>Add Movie</button>
        </div>
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Poster</th>
                <th>Title</th>
                <th>Genre</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {movies.map((m, idx) => (
                <tr key={idx}>
                  <td><img src={m.poster} alt="poster" className="rounded" width="48" height="48" /></td>
                  <td className="fw-medium">{m.title}</td>
                  <td className="text-muted">{m.genre}</td>
                  <td className="text-muted">{m.duration}</td>
                  <td>
                    <span className="badge badge-soft-success rounded-pill">{m.status}</span>
                  </td>
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
