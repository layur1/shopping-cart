import { useState, useEffect, useMemo } from "react";
import { productsAPI } from "./api";
import "./ProductManagementStyles.css";

export default function ProductManagement({ user, onLogout, onNavigate }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState(null);

  const CATEGORIES = ["All", "Vegetables", "Fruits", "Cakes", "Biscuits"];

  const [formData, setFormData] = useState({
    name: "",
    category: "Vegetables",
    price: "",
    stock: "",
    description: "",
    rating: "0",
    icon: "📦",
    imageKey: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await productsAPI.getAll();
      setProducts(res.data);
      setError("");
    } catch (err) {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return products.filter((p) => {
      const matchesSearch = !q || p.name.toLowerCase().includes(q);
      const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [products, searchTerm, selectedCategory]);

  function handleFormChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const data = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      rating: parseFloat(formData.rating),
    };

    try {
      if (editingId) {
        await productsAPI.update(editingId, data);
        showToast("success", "Product updated successfully!");
      } else {
        await productsAPI.create(data);
        showToast("success", "Product added successfully!");
      }
      setFormData({
        name: "",
        category: "Vegetables",
        price: "",
        stock: "",
        description: "",
        rating: "0",
        icon: "📦",
        imageKey: "",
      });
      setShowForm(false);
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure? This action cannot be undone.")) return;

    setLoading(true);
    try {
      await productsAPI.delete(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      showToast("success", "Product deleted successfully!");
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to delete");
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(product) {
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
      description: product.description,
      rating: product.rating.toString(),
      icon: product.icon,
      imageKey: product.imageKey,
    });
    setEditingId(product._id);
    setShowForm(true);
  }

  function showToast(type, text) {
    setToast({ type, text });
  }

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
            className="admin-menu-item active"
            onClick={() => onNavigate("products")}
          >
            <span className="menu-icon">📦</span>
            <span className="menu-label">Products</span>
          </button>
          <button
            className="admin-menu-item"
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
            <h1 className="admin-page-title">Product Management</h1>
            <p className="admin-page-description">
              Manage your product catalog, inventory, and pricing
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({
                name: "",
                category: "Vegetables",
                price: "",
                stock: "",
                description: "",
                rating: "0",
                icon: "📦",
                imageKey: "",
              });
            }}
          >
            {showForm ? "Cancel" : "➕ Add Product"}
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="product-form-container">
            <h2 className="form-title">
              {editingId ? "Edit Product" : "Add New Product"}
            </h2>
            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    placeholder="e.g., Fresh Tomatoes"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    name="category"
                    className="form-input"
                    value={formData.category}
                    onChange={handleFormChange}
                  >
                    {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Price (Rs.) *</label>
                  <input
                    type="number"
                    name="price"
                    className="form-input"
                    placeholder="0"
                    value={formData.price}
                    onChange={handleFormChange}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Quantity *</label>
                  <input
                    type="number"
                    name="stock"
                    className="form-input"
                    placeholder="0"
                    value={formData.stock}
                    onChange={handleFormChange}
                    required
                    min="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Rating (0-5)</label>
                  <input
                    type="number"
                    name="rating"
                    className="form-input"
                    placeholder="0"
                    value={formData.rating}
                    onChange={handleFormChange}
                    min="0"
                    max="5"
                    step="0.1"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Icon/Emoji</label>
                  <input
                    type="text"
                    name="icon"
                    className="form-input"
                    placeholder="📦"
                    value={formData.icon}
                    onChange={handleFormChange}
                    maxLength="2"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-input form-textarea"
                  placeholder="Product description..."
                  value={formData.description}
                  onChange={handleFormChange}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Image Key</label>
                <input
                  type="text"
                  name="imageKey"
                  className="form-input"
                  placeholder="tomato, spinach, etc."
                  value={formData.imageKey}
                  onChange={handleFormChange}
                />
                <p className="form-hint">
                  Use image keys from assets folder or leave empty
                </p>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading
                    ? "Saving…"
                    : editingId
                      ? "Update Product"
                      : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products List */}
        <section className="products-section">
          <div className="section-controls">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="search-clear"
                  onClick={() => setSearchTerm("")}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="category-filter">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`filter-pill ${selectedCategory === cat ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading && !showForm ? (
            <div className="loading-state">
              <p>Loading products...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">
              <p>No products found</p>
            </div>
          ) : (
            <div className="products-table-container">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product._id}>
                      <td>
                        <div className="product-thumbnail">
                          {product.icon && (
                            <span className="thumbnail-icon">{product.icon}</span>
                          )}
                        </div>
                      </td>
                      <td className="product-name-cell">
                        <p className="product-name">{product.name}</p>
                      </td>
                      <td>
                        <span className="category-badge">{product.category}</span>
                      </td>
                      <td className="price-cell">
                        Rs. {Number(product.price).toLocaleString("en-IN")}
                      </td>
                      <td className="stock-cell">
                        <span
                          className={`stock-badge ${
                            product.outOfStock ? "out-of-stock" : "in-stock"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="rating-cell">
                        <span className="rating">⭐ {product.rating}</span>
                      </td>
                      <td className="actions-cell">
                        <button
                          className="btn-action btn-edit"
                          onClick={() => handleEdit(product)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() => handleDelete(product._id)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

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
