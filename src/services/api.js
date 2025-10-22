import axios from 'axios';

// Create axios instance with base configuration
// Smart detection: Use Vercel backend in production, localhost in development
const getBaseURL = () => {
  // If we're on Vercel (production), use Vercel backend
  if (window.location.hostname.includes('vercel.app')) {
    return 'https://backendsystem-gamma.vercel.app/api';
  }
  // If we're on localhost (development), use local backend
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  // Fallback to environment variable or Vercel backend
  return import.meta.env.VITE_API_URL || 'https://backendsystem-gamma.vercel.app/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
