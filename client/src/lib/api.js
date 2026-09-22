import axios from 'axios';

const rawBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim().replace(/\/+$/, '');

const api = axios.create({
  baseURL: rawBaseUrl,
  withCredentials: true, // Crucial for sending & receiving HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Bearer token from localStorage for reliable cross-domain requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;


