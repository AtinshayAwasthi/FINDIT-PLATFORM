
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

// Items API
export const itemsApi = {
  getAll: (params?: any) => api.get('/api/items', { params }),
  getRecent: () => api.get('/api/items/recent'),
  getById: (id: string) => api.get(`/api/items/${id}`),
  getUserItems: (type: 'lost' | 'found') => api.get(`/api/items/user/${type}`),
  create: (formData: FormData) => api.post('/api/items', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  update: (id: string, formData: FormData) => api.put(`/api/items/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  delete: (id: string) => api.delete(`/api/items/${id}`),
};

// Requests API (claim an item)
export const requestsApi = {
  create: (data: { itemId: string; name: string; email: string; proof: string }) => 
    api.post('/api/requests', data),
  getByItem: (itemId: string) => 
    api.get(`/api/requests/item/${itemId}`),
  updateStatus: (requestId: string, status: 'approved' | 'rejected') => 
    api.put(`/api/requests/${requestId}`, { status }),
};

// Reports API (report incorrect information)
export const reportsApi = {
  create: (data: { itemId: string; reason: string; email?: string }) => 
    api.post('/api/reports', data),
};

// Contact API
export const contactApi = {
  getItemContact: (itemId: string) => 
    api.get(`/api/contact/${itemId}`),
};

// Auth API
export const authApi = {
  register: (data: { name: string; email: string; password: string }) => 
    api.post('/api/auth/register', data),
  login: (data: { email: string; password: string }) => 
    api.post('/api/auth/login', data),
  getMe: () => api.get('/api/auth/me'),
};
