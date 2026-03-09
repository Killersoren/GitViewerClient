import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// Attach access token from localStorage before requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}
,
(error) => Promise.reject(error)
);

// Add a dedicated instance for the logging API (falls back to the default baseURL)
export const loggingApi = axios.create({
  baseURL: import.meta.env.VITE_LOGGING_API_URL || import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// Attach same token interceptor to loggingApi
loggingApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export default api;
