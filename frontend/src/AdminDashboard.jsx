import { useState, useEffect } from "react";
import { ordersAPI } from "./api";
import "./AdminDashboardStyles.css";

export default function AdminDashboard({
  user,
  onLogout,
  onNavigate,
  currentPage,
}) {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalSales: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  async function fetchDashboardStats() {
    try {
      const res = await ordersAPI.getDashboardStats();
      setStats(res.data);
      setError("");
    } catch (err) {
      setError("Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  }

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "products", label: "Products", icon: "📦" },
    { id: "orders", label: "Orders", icon: "🛒" },
  ];

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <span className="admin-logo-icon">⚙️</span>
          <h2 className="admin-logo-text">ShopEase Admin</h2>
        </div>

        <nav className="admin-menu">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`admin-menu-item ${currentPage === item.id ? "active" : ""}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="user-avatar">👤</div>
            <div className="user-details">
              <p className="user-name">{user?.name}</p>
              <p className="user-role">Administrator</p>
            </div>
          </div>
          <button className="btn btn-ghost btn-logout" onClick={onLogout}>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-content">
        <div className="admin-header">
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-description">
            Welcome, {user?.name.split(" ")[0]}! Here's an overview of your store.
          </p>
        </div>

        {loading ? (
          <div className="loading-state">
            <p>Loading dashboard data...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchDashboardStats}>
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📦</div>
                <div className="stat-content">
                  <p className="stat-label">Total Products</p>
                  <p className="stat-value">{stats.totalProducts}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🛒</div>
                <div className="stat-content">
                  <p className="stat-label">Total Orders</p>
                  <p className="stat-value">{stats.totalOrders}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <p className="stat-label">Total Sales</p>
                  <p className="stat-value">
                    Rs. {Number(stats.totalSales).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">⚡</div>
                <div className="stat-content">
                  <p className="stat-label">Recent Orders</p>
                  <p className="stat-value">{stats.recentOrders.length}</p>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <section className="dashboard-section">
              <div className="section-header">
                <h2 className="section-title">Recent Orders</h2>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => onNavigate("orders")}
                >
                  View All →
                </button>
              </div>

              {stats.recentOrders.length === 0 ? (
                <div className="empty-state">
                  <p>No orders yet</p>
                </div>
              ) : (
                <div className="orders-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentOrders.map((order) => (
                        <tr key={order._id}>
                          <td className="order-id">
                            {order._id.slice(-6).toUpperCase()}
                          </td>
                          <td>
                            <div className="customer-info">
                              <p className="customer-name">
                                {order.customerInfo?.name || "Guest"}
                              </p>
                              <p className="customer-email">
                                {order.customerInfo?.email || "N/A"}
                              </p>
                            </div>
                          </td>
                          <td>
                            {new Date(order.createdAt).toLocaleDateString("en-IN")}
                          </td>
                          <td className="order-amount">
                            Rs. {Number(order.totalAmount).toLocaleString("en-IN")}
                          </td>
                          <td>
                            <span className={`status-badge status-${order.status.toLowerCase()}`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Quick Actions */}
            <section className="dashboard-section">
              <h2 className="section-title">Quick Actions</h2>
              <div className="quick-actions">
                <button
                  className="action-button"
                  onClick={() => onNavigate("products")}
                >
                  <span className="action-icon">➕</span>
                  <span className="action-label">Add New Product</span>
                </button>
                <button
                  className="action-button"
                  onClick={() => onNavigate("orders")}
                >
                  <span className="action-icon">📋</span>
                  <span className="action-label">View All Orders</span>
                </button>
                <button
                  className="action-button"
                  onClick={() => onNavigate("products")}
                >
                  <span className="action-icon">🔄</span>
                  <span className="action-label">Manage Inventory</span>
                </button>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
