// api.js - Simple API utility for KinoTime frontend
// This file provides basic functions to interact with the KinoTimeBackEnd API.
// Update BASE_URL if your backend runs on a different address/port.

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5296";

async function parseResponse(response) {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function handleResponse(response) {
  if (!response.ok) {
    const errorBody = await parseResponse(response);
    const message =
      typeof errorBody === "string"
        ? errorBody
        : errorBody?.message || "Network response was not ok";
    const error = new Error(message);
    error.status = response.status;
    error.body = errorBody;
    throw error;
  }
  return parseResponse(response);
}

// Helper for GET requests
export async function apiGet(endpoint) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    credentials: "include",
  });
  return handleResponse(response);
}

// Helper for POST requests
export async function apiPost(endpoint, data) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  return handleResponse(response);
}

// Helper for PUT requests
export async function apiPut(endpoint, data) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  return handleResponse(response);
}

// Helper for DELETE requests
export async function apiDelete(endpoint) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "DELETE",
    credentials: "include",
  });
  return handleResponse(response);
}

// Helper for showtimes by movie id
export async function apiGetShowtimesByMovieId(movieId) {
  if (!movieId) return [];
  const encodedId = encodeURIComponent(movieId);
  return apiGet(`/api/Showtimes?movieId=${encodedId}`);
}

// Helper for seat map by showtime id
export async function apiGetSeatMap(showtimeId) {
  if (!showtimeId) return null;
  const encodedId = encodeURIComponent(showtimeId);
  return apiGet(`/api/Reservations/seatmap/${encodedId}`);
}

// Helper for showtime by id
export async function apiGetShowtime(showtimeId) {
  if (!showtimeId) return null;
  const encodedId = encodeURIComponent(showtimeId);
  return apiGet(`/api/Showtimes/${encodedId}`);
}

// Helper for current user profile
export async function apiGetMe() {
  return apiGet("/api/Auth/me");
}

// Helper to cancel reservation by id
export async function apiCancelReservation(reservationId) {
  if (!reservationId) return null;
  const encodedId = encodeURIComponent(reservationId);
  return apiPost(`/api/Reservations/${encodedId}/cancel`);
}

// Helper for admin dashboard stats
export async function apiGetAdminDashboard() {
  return apiGet("/api/admin/dashboard");
}

