import axios from 'axios';

// Global API configuration
export const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3001';

// Global axios configuration
export const axiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for global error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);