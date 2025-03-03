
import axios from 'axios';

// Set the base URL for all API requests
const isProduction = import.meta.env.MODE === 'production';
const baseURL = isProduction 
  ? import.meta.env.VITE_API_URL 
  : 'http://localhost:5000';

// Create axios instance
export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add withCredentials to allow cookies to be sent and received across domains
  withCredentials: true,
});

// Add a request interceptor to include the auth token in all requests
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

// Add a response interceptor to handle common error scenarios
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle session expiration
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
