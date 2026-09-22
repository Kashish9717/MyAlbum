import axios from 'axios';

const rawBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim().replace(/\/+$/, '');

const api = axios.create({
  baseURL: rawBaseUrl,
  withCredentials: true, // Crucial for sending & receiving HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;


