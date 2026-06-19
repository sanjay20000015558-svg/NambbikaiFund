import axios from 'axios';

// API Base URL
const RAW_API_URL =
  process.env.REACT_APP_API_URL ||
  'https://nambbikai-fund-5pzfflwra-sanjay-kumars-projects-6d1d4c33.vercel.app/api';

const API_URL = RAW_API_URL.replace(/\/$/, '');

export const getAxiosRequestUrl = (error) => {
  const baseURL = error.config?.baseURL ? error.config.baseURL.replace(/\/$/, '') : '';
  return `${baseURL}${error.config?.url || ''}`;
};

export const getAxiosErrorMessage = (error, fallbackMessage) => {
  const requestedUrl = getAxiosRequestUrl(error);

  if (!error.response) {
    return `Cannot connect to backend. Check backend URL/CORS. Requested: ${requestedUrl}`;
  }

  const status = error.response.status;
  const data = error.response.data || {};
  const backendMessage = data.message || data.error || '';

  if (status === 401) {
    return `HTTP 401 Unauthorized. Vercel or backend rejected the request before the API handled it. Check Vercel Deployment Protection/password protection. Requested: ${requestedUrl}`;
  }

  return `HTTP ${status}: ${backendMessage || fallbackMessage || 'Backend rejected the request.'} Requested: ${requestedUrl}`;
};

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