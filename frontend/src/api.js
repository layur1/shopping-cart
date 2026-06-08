import axios from "axios";

// ─── Base client ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://16.171.17.133:5000/api",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token automatically if present in localStorage
api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem("adminToken");
  const token = localStorage.getItem("token");
  const authToken = adminToken || token;
  if (authToken) config.headers.Authorization = `Bearer ${authToken}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || "";
    if (
      error.response?.status === 401 &&
      /token invalid|expired|no token|not authorised/i.test(message)
    ) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (name, email, password) =>
    api.post("/auth/register", { name, email, password }),

  login: (email, password) =>
    api.post("/auth/login", { email, password }),

  adminLogin: (email, password) =>
    api.post("/auth/admin/login", { email, password }),

  getMe: () =>
    api.get("/auth/me"),
};

// ─── Products ────────────────────────────────────────────────────────────────
export const productsAPI = {
  getAll: () => api.get("/products"),

  getById: (id) =>
    api.get(`/products/${id}`),

  create: (productData) =>
    api.post("/products", productData),

  update: (id, productData) =>
    api.put(`/products/${id}`, productData),

  delete: (id) =>
    api.delete(`/products/${id}`),

  updateStock: (id, stock) =>
    api.put(`/products/${id}/stock`, { stock }),
};

// ─── Orders ──────────────────────────────────────────────────────────────────
export const ordersAPI = {
  create: (items, totalAmount, customerInfo, deliveryDetails) =>
    api.post("/orders", { items, totalAmount, customerInfo, deliveryDetails }),

  getAll: () =>
    api.get("/orders"),

  getById: (id) =>
    api.get(`/orders/${id}`),

  updateStatus: (id, status) =>
    api.put(`/orders/${id}/status`, { status }),

  getDashboardStats: () =>
    api.get("/orders/stats/dashboard"),
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