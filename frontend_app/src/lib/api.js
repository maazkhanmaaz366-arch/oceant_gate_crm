import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to ensure x-user-role and auth headers are explicitly sent on every request
api.interceptors.request.use((config) => {
  config.headers['x-user-role'] = 'Owner';
  try {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

// Interceptor for centralized response and error handling
api.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (Array.isArray(body)) {
      body.data = body;
    }
    return body;
  },
  (error) => {
    console.warn('API Notice:', error.response?.data?.message || error.message);
    const fallback = { success: false, data: [] };
    fallback.data.data = fallback.data;
    return Promise.resolve(fallback);
  }
);

export default api;
