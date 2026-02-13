import axios from "axios";

const API = axios.create({
  baseURL: "https://cms-backend.jassalarjansingh.workers.dev/api", // Production backend
});

// Add JWT to headers if available
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// Add response interceptor to handle common errors
API.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response;
  },
  (error) => {
    // Handle errors globally
    if (error.response) {
      const status = error.response.status;
      
      // Only logout on 401 if it's an authentication endpoint or token is truly invalid
      // Don't logout on other errors (400, 500, etc.)
      if (status === 401) {
        const url = error.config?.url || '';
        // Only clear auth on actual authentication failures, not permission issues
        if (url.includes('/auth/') || error.response.data?.message?.includes('token')) {
          console.warn('Authentication failed, clearing token');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Redirect to login only if not already there
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
      }
    }
    
    // Always reject to allow component-level error handling
    return Promise.reject(error);
  }
);

export default API;
