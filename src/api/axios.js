import axios from "axios";

const API = axios.create({
  baseURL: "https://cms-backend.jassalarjansingh.workers.dev/api", // Local development
});

// Add JWT to headers if available
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default API;
