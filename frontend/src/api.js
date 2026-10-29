import axios from "axios";

const api = axios.create({ baseURL: `${import.meta.env.VITE_API_URL}/api` });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const errorMessage = (err) => err.response?.data?.error || "Cannot reach the server. Try again.";

export const money = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

export default api;
