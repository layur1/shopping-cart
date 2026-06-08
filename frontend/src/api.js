import axios from "axios";

// ─── Base client ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token automatically if present in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (name, email, password) =>
    api.post("/auth/register", { name, email, password }),

  login: (email, password) =>
    api.post("/auth/login", { email, password }),

  getMe: () =>
    api.get("/auth/me"),
};

// ─── Products ────────────────────────────────────────────────────────────────
export const productsAPI = {
  getAll: () => api.get("/products"),
};

// ─── Orders ──────────────────────────────────────────────────────────────────
export const ordersAPI = {
  create: (items, totalAmount) =>
    api.post("/orders", { items, totalAmount }),
};

// ─── Payments ────────────────────────────────────────────────────────────────
export const paymentAPI = {
  // amount must be in smallest currency unit: Rs. 1499 → 149900 paise
  createIntent: (amountInRupees) =>
    api.post("/payment/create-intent", {
      amount: Math.round(amountInRupees * 100),  // convert to paise
      currency: "lkr",
    }),
};

export default api;