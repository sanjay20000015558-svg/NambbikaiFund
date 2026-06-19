import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '';

export const getAxiosRequestUrl = (error) => {
  const baseURL = error.config?.baseURL || '';
  return `${baseURL}${error.config?.url || ''}`;
};

export const getAxiosErrorMessage = (fallbackMessage = 'Unable to complete request.') => {
  return fallbackMessage;
};

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    if (originalRequest && error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default axiosInstance;