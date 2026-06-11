import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://student-finance-portal.onrender.com',
  // baseURL: 'https://student-finance-portal.onrender.com',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (window.location.pathname !== '/login') {
        // ✅ Key ke saath redirect karo
        const key = import.meta.env.VITE_ACCESS_KEY;
        window.location.href = `/login?key=${key}`;
      }
    }
    return Promise.reject(error);
  }
);

export default api;