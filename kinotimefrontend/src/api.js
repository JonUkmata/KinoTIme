// api.js - Simple API utility for KinoTime frontend
// This file provides basic functions to interact with the KinoTimeBackEnd API.
// Update BASE_URL if your backend runs on a different address/port.

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5296'; 

// Helper for GET requests
export async function apiGet(endpoint) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
}

// Helper for POST requests
export async function apiPost(endpoint, data) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
}

// Helper for PUT requests
export async function apiPut(endpoint, data) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
}

// Helper for DELETE requests
export async function apiDelete(endpoint) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
}

// Example usage:
// const movies = await apiGet('/api/movies');
// const newMovie = await apiPost('/api/movies', { title: 'New Movie' });
