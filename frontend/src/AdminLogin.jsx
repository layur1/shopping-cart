import { useState } from "react";
import { authAPI } from "./api";
import "./AdminAuthStyles.css";

export default function AdminLogin({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await authAPI.adminLogin(email, password);
      console.log("LOGIN RESPONSE:", res.data);
      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("adminUser", JSON.stringify(res.data.user));
      onSuccess(res.data);
    } catch (err) {
      const message = err.response?.data?.message || "Login failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-auth-container">
      <div className="admin-login-box">
        <div className="admin-login-header">
          <span className="admin-icon">⚙️</span>
          <h1>Admin Panel</h1>
          <p className="admin-subtitle">Store Management System</p>
        </div>

        <form onSubmit={handleLogin} className="admin-login-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="admin@shopease.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="admin-error">{error}</p>}

          <button
            className="btn btn-primary admin-login-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div className="admin-login-footer">
          <p className="admin-info">
            <strong>Demo Credentials:</strong><br />
            Email: admin@shopease.com<br />
            Password: admin123
          </p>
        </div>
      </div>

      <div className="admin-auth-decoration">
        <div className="decoration-item">📦</div>
        <div className="decoration-item">📊</div>
        <div className="decoration-item">🛒</div>
        <div className="decoration-item">💳</div>
      </div>
    </div>
  );
}
