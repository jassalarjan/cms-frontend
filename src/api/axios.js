import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // 🔧 Fixed to include /api prefix
});

// Add JWT to headers if available
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default API;
