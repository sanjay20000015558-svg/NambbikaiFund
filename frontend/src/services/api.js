import axios from 'axios';

// API Base URL
const API_URL =
  process.env.REACT_APP_API_URL ||
  'http://localhost:5000/api';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Handle FormData uploads
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    // Unauthorized
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest?._retry
    ) {
      localStorage.removeItem('token');
    }

    // Network Error / CORS / Backend down
    if (!error.response) {
      const requestedUrl = `${error.config?.baseURL || ''}${error.config?.url || ''}`;
      return Promise.reject(
        new Error(
          `CORS or Network Error: Cannot reach backend. Check REACT_APP_API_URL and Vercel backend deployment. Requested: ${requestedUrl}`
        )
      );
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;