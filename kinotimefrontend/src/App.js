import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const [weather, setWeather] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5296/weatherforecast") // kontrollo portin e backend
      .then(response => response.json())
      .then(data => setWeather(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>hello from kinotimefrontend!</p>

        <ul>
          {weather.map((w, index) => (
            <li key={index}>
              {w.date} - {w.temperatureC}°C - {w.summary}
            </li>
          ))}
        </ul>

        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
