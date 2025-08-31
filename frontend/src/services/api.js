import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 45000, // 45 seconds timeout for AI operations
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (import.meta.env.DEV) {
      console.log(`[API] Response from ${response.config.url}:`, response.data);
    }
    return response;
  },
  (error) => {
    console.error('[API] Response error:', {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });

    // Handle specific error cases with user-friendly messages
    if (error.response?.status === 429) {
      error.message = 'Too many requests. Please wait a moment and try again.';
    } else if (error.response?.status === 503) {
      error.message = 'Service temporarily unavailable. Please try again later.';
    } else if (error.response?.status === 401) {
      error.message = 'Authentication failed. Please check API configuration.';
    } else if (error.response?.status === 400) {
      error.message = error.response.data?.error || 'Invalid request. Please check your input.';
    } else if (error.code === 'ECONNABORTED') {
      error.message = 'Request timed out. Please try again with shorter text.';
    } else if (!error.response) {
      error.message = 'Network error. Please check your internet connection.';
    }

    return Promise.reject(error);
  }
);

export default api;