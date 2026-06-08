import { useState, useEffect } from "react";
import { ordersAPI } from "./api";
import "./OrderManagementStyles.css";

export default function OrderManagement({ user, onLogout, onNavigate }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await ordersAPI.getAll();
      setOrders(res.data);
      setError("");
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Session expired. Please sign in again.");
        onLogout();
        return;
      }
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(orderId, newStatus) {
    setUpdatingStatus(true);
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder?._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      showToast("success", "Order status updated!");
    } catch (err) {
      if (err.response?.status === 401) {
        onLogout();
        return;
      }
      showToast("error", err.response?.data?.message || "Failed to update");
    } finally {
      setUpdatingStatus(false);
    }
  }

  function showToast(type, text) {
    setToast({ type, text });
  }

  const statuses = ["Pending", "Processing", "Shipped", "Delivered"];

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <span className="admin-logo-icon">⚙️</span>
          <h2 className="admin-logo-text">ShopEase Admin</h2>
        </div>

        <nav className="admin-menu">
          <button
            className="admin-menu-item"
            onClick={() => onNavigate("dashboard")}
          >
            <span className="menu-icon">📊</span>
            <span className="menu-label">Dashboard</span>
          </button>
          <button
            className="admin-menu-item"
            onClick={() => onNavigate("products")}
          >
            <span className="menu-icon">📦</span>
            <span className="menu-label">Products</span>
          </button>
          <button
            className="admin-menu-item active"
            onClick={() => onNavigate("orders")}
          >
            <span className="menu-icon">🛒</span>
            <span className="menu-label">Orders</span>
          </button>
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

      <main className="admin-content">
        <div className="admin-header">
          <div>
            <h1 className="admin-page-title">Order Management</h1>
            <p className="admin-page-description">
              View and manage customer orders
            </p>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <p>Loading orders...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchOrders}>
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <p>No orders found</p>
          </div>
        ) : (
          <div className="orders-layout">
            {/* Orders List */}
            <div className="orders-list-section">
              <div className="orders-table-container">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Items</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order._id}
                        className={`order-row ${
                          selectedOrder?._id === order._id ? "selected" : ""
                        }`}
                        onClick={() => setSelectedOrder(order)}
                      >
                        <td className="order-id">
                          {order._id.slice(-6).toUpperCase()}
                        </td>
                        <td>
                          <div className="customer-col">
                            <p className="name">
                              {order.customerInfo?.name || "Guest"}
                            </p>
                            <p className="email">
                              {order.customerInfo?.email || "N/A"}
                            </p>
                          </div>
                        </td>
                        <td>
                          {new Date(order.createdAt).toLocaleDateString("en-IN")}
                        </td>
                        <td className="items-count">
                          {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                        </td>
                        <td className="amount">
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
            </div>

            {/* Order Details */}
            {selectedOrder && (
              <div className="order-details-section">
                <div className="details-card">
                  <h2 className="details-title">Order Details</h2>

                  {/* Order Info */}
                  <div className="details-group">
                    <h3 className="group-title">Order Information</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">Order ID</span>
                        <span className="info-value">
                          {selectedOrder._id.slice(-6).toUpperCase()}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Date</span>
                        <span className="info-value">
                          {new Date(selectedOrder.createdAt).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Payment Status</span>
                        <span className="info-value payment-status">
                          {selectedOrder.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="details-group">
                    <h3 className="group-title">Customer Information</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">Name</span>
                        <span className="info-value">
                          {selectedOrder.customerInfo?.name || "N/A"}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Email</span>
                        <span className="info-value">
                          {selectedOrder.customerInfo?.email || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Details */}
                  {selectedOrder.deliveryDetails && (
                    <div className="details-group">
                      <h3 className="group-title">Delivery Address</h3>
                      <div className="delivery-info">
                        <p>
                          <strong>{selectedOrder.deliveryDetails.fullName}</strong>
                        </p>
                        <p>{selectedOrder.deliveryDetails.address}</p>
                        <p>
                          {selectedOrder.deliveryDetails.city},{" "}
                          {selectedOrder.deliveryDetails.postalCode}
                        </p>
                        <p>📞 {selectedOrder.deliveryDetails.phone}</p>
                        {selectedOrder.deliveryDetails.notes && (
                          <p className="delivery-notes">
                            <strong>Notes:</strong> {selectedOrder.deliveryDetails.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Items */}
                  <div className="details-group">
                    <h3 className="group-title">Items</h3>
                    <div className="items-list">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="item-row">
                          <div className="item-name">
                            <p className="name">{item.name}</p>
                            <p className="qty">Qty: {item.quantity}</p>
                          </div>
                          <div className="item-price">
                            <p>Rs. {Number(item.price).toLocaleString("en-IN")} each</p>
                            <p className="total">
                              = Rs.{" "}
                              {Number(item.price * item.quantity).toLocaleString(
                                "en-IN"
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="details-group">
                    <h3 className="group-title">Pricing</h3>
                    <div className="pricing-summary">
                      <div className="pricing-row">
                        <span>Subtotal</span>
                        <span>
                          Rs.{" "}
                          {Number(
                            selectedOrder.items.reduce(
                              (sum, item) => sum + item.price * item.quantity,
                              0
                            )
                          ).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="pricing-row">
                        <span>Tax & Fees</span>
                        <span>
                          Rs.{" "}
                          {Number(
                            selectedOrder.totalAmount -
                              selectedOrder.items.reduce(
                                (sum, item) => sum + item.price * item.quantity,
                                0
                              )
                          ).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="pricing-row total-row">
                        <span>Total</span>
                        <span>
                          Rs. {Number(selectedOrder.totalAmount).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Update */}
                  <div className="details-group">
                    <h3 className="group-title">Update Status</h3>
                    <div className="status-update">
                      <select
                        className="form-input"
                        value={selectedOrder.status}
                        onChange={(e) =>
                          handleStatusChange(selectedOrder._id, e.target.value)
                        }
                        disabled={updatingStatus}
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      {updatingStatus && <p className="updating-text">Updating...</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!selectedOrder && (
              <div className="order-details-section">
                <div className="details-card empty">
                  <p>Select an order to view details</p>
                </div>
              </div>
            )}
          </div>
        )}

        {toast && (
          <div className={`toast toast--${toast.type}`}>
            <span className="toast-icon">
              {toast.type === "success" ? "✓" : "✕"}
            </span>
            {toast.text}
          </div>
        )}
      </main>
    </div>
  );
}
