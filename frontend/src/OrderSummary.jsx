import { useState, useEffect, useMemo } from "react";
import "./OrderSummaryStyles.css";

// Helper to resolve product images
function resolveImage(product, LOCAL_IMAGES) {
  if (product.imageKey && LOCAL_IMAGES[product.imageKey]) return LOCAL_IMAGES[product.imageKey];
  if (product.image) return product.image;
  return `https://picsum.photos/seed/${product._id}/600/400`;
}

export default function OrderSummary({ cart, user, onClose, onProceedToPayment, LOCAL_IMAGES }) {
  // Customer Info
  const [customerName, setCustomerName] = useState(user?.name || "");
  const [customerEmail, setCustomerEmail] = useState(user?.email || "");

  // Delivery Details
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  // Cart modifications
  const [localCart, setLocalCart] = useState(cart);

  // Calculate pricing
  const subtotal = useMemo(() => localCart.reduce((sum, item) => sum + item.price * item.quantity, 0), [localCart]);
  const deliveryFee = subtotal >= 5000 ? 0 : 300;
  const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5% tax
  const total = subtotal + deliveryFee + tax;

  // Form validation
  const isFormValid = useMemo(() => {
    return (
      (customerName || fullName) &&
      (customerEmail || user?.email) &&
      fullName &&
      phone &&
      address &&
      city &&
      postalCode &&
      localCart.length > 0
    );
  }, [customerName, customerEmail, fullName, phone, address, city, postalCode, user, localCart]);

  function updateQuantity(id, delta) {
    setLocalCart((prev) =>
      prev
        .map((i) => (i._id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i))
        .filter((i) => i.quantity > 0)
    );
  }

  function removeFromCart(id) {
    setLocalCart((prev) => prev.filter((i) => i._id !== id));
  }

  function handleProceedToPayment() {
    if (!isFormValid) return;

    const orderData = {
      customerInfo: {
        name: customerName || user?.name,
        email: customerEmail || user?.email,
      },
      deliveryDetails: {
        fullName,
        phone,
        address,
        city,
        postalCode,
        notes: deliveryNotes,
      },
      items: localCart.map(({ _id, name, price, quantity }) => ({
        productId: _id,
        name,
        price,
        quantity,
      })),
      subtotal,
      deliveryFee,
      tax,
      total,
    };

    onProceedToPayment(orderData);
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="order-summary">
        <button className="order-close" onClick={onClose} aria-label="Close">✕</button>
        <div className="empty-cart-state">
          <span className="empty-icon">🛒</span>
          <h2>Your cart is empty</h2>
          <p>Add products to proceed with checkout.</p>
          <button className="btn btn-primary" onClick={onClose}>Back to Shopping</button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-summary">
      <button className="order-close" onClick={onClose} aria-label="Close">✕</button>

      <div className="order-summary-content">
        <h1 className="order-title">Order Summary</h1>

        {/* ─── Product List ─────────────────────────────────── */}
        <section className="order-section">
          <h2 className="section-heading">Products</h2>
          <div className="products-list">
            {localCart.map((item) => (
              <div className="order-product-card" key={item._id}>
                <img
                  src={resolveImage(item, LOCAL_IMAGES)}
                  alt={item.name}
                  className="order-product-img"
                />
                <div className="order-product-info">
                  <h3 className="order-product-name">{item.name}</h3>
                  <p className="order-product-price">
                    Rs. {Number(item.price).toLocaleString("en-IN")} each
                  </p>
                </div>
                <div className="order-product-controls">
                  <div className="qty-control-inline">
                    <button onClick={() => updateQuantity(item._id, -1)} aria-label="Decrease">−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, +1)} aria-label="Increase">+</button>
                  </div>
                  <div className="order-product-total">
                    <p className="product-total-label">Total</p>
                    <p className="product-total-value">
                      Rs. {Number(item.price * item.quantity).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <button
                    className="btn-remove"
                    onClick={() => removeFromCart(item._id)}
                    aria-label={`Remove ${item.name}`}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Pricing Summary ──────────────────────────────── */}
        <section className="order-section">
          <h2 className="section-heading">Pricing Summary</h2>
          <div className="pricing-table">
            <div className="pricing-row">
              <span className="pricing-label">Subtotal</span>
              <span className="pricing-value">Rs. {Number(subtotal).toLocaleString("en-IN")}</span>
            </div>
            {deliveryFee > 0 && (
              <div className="pricing-row">
                <span className="pricing-label">Delivery Fee</span>
                <span className="pricing-value">Rs. {Number(deliveryFee).toLocaleString("en-IN")}</span>
              </div>
            )}
            {deliveryFee === 0 && (
              <div className="pricing-row pricing-row-success">
                <span className="pricing-label">Delivery Fee</span>
                <span className="pricing-value">FREE 🎉</span>
              </div>
            )}
            <div className="pricing-row">
              <span className="pricing-label">Tax (5%)</span>
              <span className="pricing-value">Rs. {Number(tax).toLocaleString("en-IN")}</span>
            </div>
            <div className="pricing-row pricing-row-total">
              <span className="pricing-label">Total Amount Payable</span>
              <span className="pricing-value">Rs. {Number(total).toLocaleString("en-IN")}</span>
            </div>
          </div>
        </section>

        {/* ─── Customer Information ─────────────────────────── */}
        <section className="order-section">
          <h2 className="section-heading">Customer Information</h2>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name {user ? "(Pre-filled)" : ""}</label>
              <input
                type="text"
                className="form-input"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Your full name"
                disabled={!!user}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email {user ? "(Pre-filled)" : ""}</label>
              <input
                type="email"
                className="form-input"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={!!user}
              />
            </div>
          </div>
        </section>

        {/* ─── Delivery Details ───────────────────────────────── */}
        <section className="order-section">
          <h2 className="section-heading">Delivery Details</h2>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Name as per ID"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="tel"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10-digit mobile number"
                required
                inputMode="numeric"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Street Address *</label>
            <input
              type="text"
              className="form-input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House number, street name"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">City *</label>
              <input
                type="text"
                className="form-input"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g., Colombo"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Postal Code *</label>
              <input
                type="text"
                className="form-input"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="e.g., 00100"
                required
                inputMode="numeric"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Delivery Notes (Optional)</label>
            <textarea
              className="form-input form-textarea"
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="e.g., Please knock loudly, buzzer doesn't work"
              rows="3"
            />
          </div>
        </section>

        {/* ─── Payment Method ────────────────────────────────── */}
        <section className="order-section">
          <h2 className="section-heading">Payment Method</h2>
          <div className="payment-method-box">
            <span className="payment-icon">💳</span>
            <div className="payment-details">
              <p className="payment-method-name">Credit / Debit Card</p>
              <p className="payment-method-provider">Secured by Stripe</p>
            </div>
            <span className="payment-badge">✓</span>
          </div>
        </section>

        {/* ─── Order Review ──────────────────────────────────── */}
        <section className="order-section order-review-section">
          <h2 className="section-heading">Order Review</h2>
          <div className="review-grid">
            <div className="review-item">
              <span className="review-label">Items</span>
              <span className="review-value">{localCart.length}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Subtotal</span>
              <span className="review-value">Rs. {Number(subtotal).toLocaleString("en-IN")}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Delivery</span>
              <span className="review-value">{deliveryFee === 0 ? "FREE" : `Rs. ${deliveryFee}`}</span>
            </div>
            <div className="review-item review-item-total">
              <span className="review-label">Total</span>
              <span className="review-value">Rs. {Number(total).toLocaleString("en-IN")}</span>
            </div>
          </div>
        </section>

        {/* ─── Action Buttons ────────────────────────────────── */}
        <div className="order-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            ← Continue Shopping
          </button>
          <button
            className="btn btn-primary btn-large"
            onClick={handleProceedToPayment}
            disabled={!isFormValid}
            title={!isFormValid ? "Please fill all required fields" : ""}
          >
            {isFormValid ? "Confirm Order & Pay →" : "Please fill all required fields"}
          </button>
        </div>
      </div>
    </div>
  );
}
