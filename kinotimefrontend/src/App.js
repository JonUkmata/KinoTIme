import React from 'react';
import './App.css';
import AdminMovies from './admin/pages/AdminMovies.jsx';
import AdminHalls from './admin/pages/AdminHalls.jsx';

function App() { //Halls dhe Movies i vendosem ketu vetem per demostrim te kardes 12 ne te ardhmen do te kemi nje strukture normale.
  return (
    <div className="container py-4">
      <h2 className="fw-semibold mb-3">Movies</h2>
      <AdminMovies />

      <h2 className="fw-semibold mt-5 mb-3">Halls</h2>
      <AdminHalls />
    </div>
  );
}

export default App;
