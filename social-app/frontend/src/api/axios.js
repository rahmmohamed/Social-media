/**
 * Axios API Client Configuration
 * Role: Setup centralized HTTP client for all API calls
 * - Base URL points to backend server (localhost:5000)
 * - Interceptors automatically attach JWT token to all requests
 * - Automatically handles 401 (Unauthorized) by clearing token and redirecting to login
 * - Provides consistent error handling across entire app
 */
import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000' });

/**
 * Request Interceptor
 * Role: Automatically attach JWT token to every API request
 * - Retrieves token from localStorage
 * - Adds token to Authorization header in Bearer format
 * - Runs before EVERY request to backend
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Response Interceptor
 * Role: Handle authentication errors globally
 * - If 401 response received, token has expired or is invalid
 * - Clears token from localStorage
 * - Redirects user to login page
 * - Prevents further requests with invalid token
 */
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;