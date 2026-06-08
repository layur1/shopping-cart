import { useEffect, useMemo, useState, useCallback } from "react";
import "./AppStyles.css";
import "./AuthStyles.css";
import laptopImg from "./assets/laptop.jpg";
import mouseImg  from "./assets/mouse.jpg";
import { productsAPI, ordersAPI, paymentAPI, authAPI } from "./api";

// ─── Local image map ──────────────────────────────────────────────────────────
// Add a new entry here whenever you add a local asset to src/assets/
const LOCAL_IMAGES = {
  laptop: laptopImg,
  mouse:  mouseImg,
};

// Resolve a product's image: prefer local asset via imageKey, then remote URL, then picsum fallback
function resolveImage(product) {
  if (product.imageKey && LOCAL_IMAGES[product.imageKey]) return LOCAL_IMAGES[product.imageKey];
  if (product.image) return product.image;
  return `https://picsum.photos/seed/${product._id}/600/400`;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = ["All", "Accessories", "Footwear", "Electronics", "Home", "Clothing"];

const SAMPLE_PRODUCTS = [
  { _id: "s1",  name: "Classic Leather Bag",  category: "Accessories", price: 2499,  image: "https://picsum.photos/seed/bag/600/400",        rating: 4.5, icon: "👜" },
  { _id: "s2",  name: "Running Sneakers",      category: "Footwear",    price: 3499,  image: "https://picsum.photos/seed/shoes/600/400",      rating: 4.2, icon: "👟" },
  { _id: "s3",  name: "Wireless Headphones",   category: "Electronics", price: 4999,  image: "https://picsum.photos/seed/headphones/600/400", rating: 4.7, icon: "🎧" },
  { _id: "s4",  name: "Ceramic Mug Set",       category: "Home",        price: 799,   image: "https://picsum.photos/seed/mug/600/400",        rating: 4.1, icon: "☕" },
  { _id: "s5",  name: "Minimalist Watch",      category: "Accessories", price: 5599,  image: "https://picsum.photos/seed/watch/600/400",      rating: 4.6, icon: "🕒" },
  { _id: "s6",  name: "Organic Cotton Tee",    category: "Clothing",    price: 699,   image: "https://picsum.photos/seed/tshirt/600/400",     rating: 4.0, icon: "👕" },
  { _id: "s7",  name: "Desk Lamp",             category: "Home",        price: 1299,  image: "https://picsum.photos/seed/lamp/600/400",       rating: 4.3, icon: "💡" },
  { _id: "s8",  name: "Travel Backpack",       category: "Accessories", price: 3799,  image: "https://picsum.photos/seed/backpack/600/400",   rating: 4.4, icon: "🎒" },
  { _id: "s9",  name: "Bluetooth Speaker",     category: "Electronics", price: 2999,  image: "https://picsum.photos/seed/speaker/600/400",   rating: 4.3, icon: "🔊" },
  { _id: "s10", name: "Yoga Mat",              category: "Clothing",    price: 1199,  image: "https://picsum.photos/seed/yoga/600/400",       rating: 4.5, icon: "🧘" },
  { _id: "s11", name: "Laptop",                category: "Electronics", price: 89999, imageKey: "laptop",                                     rating: 4.8, icon: "💻" },
  { _id: "s12", name: "Wireless Mouse",        category: "Electronics", price: 2499,  imageKey: "mouse",                                      rating: 4.4, icon: "🖱️" },
];

function StarRating({ rating }) {
  return (
    <div className="star-rating" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`star ${rating >= i + 1 ? "full" : rating > i ? "half" : "empty"}`}>★</span>
      ))}
      <span className="rating-value">{rating?.toFixed(1)}</span>
    </div>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`toast toast--${toast.type}`} role="status">
      <span className="toast-icon">{toast.type === "success" ? "✓" : "✕"}</span>
      {toast.text}
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="empty-cart">
      <div className="empty-cart-icon">🛒</div>
      <p className="empty-cart-title">Your cart is empty</p>
      <p className="empty-cart-sub">Add some products to get started.</p>
    </div>
  );
}

function AuthModal({ onClose, onSuccess }) {
  const [mode, setMode]         = useState("login");
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = mode === "login"
        ? await authAPI.login(email, password)
        : await authAPI.register(name, email, password);
      localStorage.setItem("token", res.data.token);
      onSuccess(res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2 className="modal-title">{mode === "login" ? "Sign In" : "Create Account"}</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "register" && (
            <input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
          )}
          <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          {error && <p className="auth-error">{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Register"}
          </button>
        </form>
        <p className="auth-switch">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button className="link-btn" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
            {mode === "login" ? "Register" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}

function PaymentModal({ total, onSuccess, onClose }) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry]         = useState("");
  const [cvc, setCvc]               = useState("");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  async function handlePay(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await paymentAPI.createIntent(total);
      await new Promise((r) => setTimeout(r, 1000));
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const formatCard   = (v) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const formatExpiry = (v) => { const c = v.replace(/\D/g, "").slice(0, 4); return c.length > 2 ? `${c.slice(0, 2)}/${c.slice(2)}` : c; };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal payment-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2 className="modal-title">💳 Payment</h2>
        <p className="payment-amount">Total: <strong>Rs. {Number(total).toLocaleString("en-IN")}</strong></p>
        <form onSubmit={handlePay} className="auth-form">
          <label className="field-label">Card Number</label>
          <input type="text" placeholder="1234 5678 9012 3456" value={cardNumber} onChange={(e) => setCardNumber(formatCard(e.target.value))} required inputMode="numeric" />
          <div className="card-row">
            <div>
              <label className="field-label">Expiry</label>
              <input type="text" placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(formatExpiry(e.target.value))} required />
            </div>
            <div>
              <label className="field-label">CVC</label>
              <input type="text" placeholder="123" value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 3))} required inputMode="numeric" />
            </div>
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Processing…" : `Pay Rs. ${Number(total).toLocaleString("en-IN")}`}
          </button>
        </form>
        <p className="stripe-note">🔒 Secured by Stripe</p>
      </div>
    </div>
  );
}

export default function App() {
  const [products, setProducts]                 = useState([]);
  const [cart, setCart]                         = useState([]);
  const [searchTerm, setSearchTerm]             = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [toast, setToast]                       = useState(null);
  const [checkingOut, setCheckingOut]           = useState(false);
  const [cartOpen, setCartOpen]                 = useState(false);
  const [user, setUser]                         = useState(null);
  const [showAuthModal, setShowAuthModal]       = useState(false);
  const [showPayModal, setShowPayModal]         = useState(false);

  useEffect(() => {
    productsAPI.getAll()
      .then((res) => { if (res.data?.length) setProducts(res.data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    authAPI.getMe()
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem("token"));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  const baseList = products.length ? products : SAMPLE_PRODUCTS;

  const filteredProducts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return baseList.filter((p) => {
      const matchesSearch = !q || p.name.toLowerCase().includes(q) || (p.category || "").toLowerCase().includes(q);
      const matchesCat    = selectedCategory === "All" || (p.category || "").toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCat;
    });
  }, [baseList, searchTerm, selectedCategory]);

  const cartCount = useMemo(() => cart.reduce((n, i) => n + i.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((t, i) => t + i.price * i.quantity, 0), [cart]);

  const showToast = useCallback((type, text) => setToast({ type, text }), []);

  function addToCart(product) {
    setCart((prev) => {
      const exists = prev.find((i) => i._id === product._id);
      return exists
        ? prev.map((i) => i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, { ...product, quantity: 1 }];
    });
    showToast("success", `${product.name} added to cart`);
    setCartOpen(true);
  }

  function updateQuantity(id, delta) {
    setCart((prev) =>
      prev.map((i) => i._id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i)
          .filter((i) => i.quantity > 0)
    );
  }

  function removeFromCart(id) {
    const item = cart.find((i) => i._id === id);
    setCart((prev) => prev.filter((i) => i._id !== id));
    if (item) showToast("success", `${item.name} removed`);
  }

  function clearCart() { setCart([]); }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
    showToast("success", "Signed out.");
  }

  function handleCheckout() {
    if (!cart.length) return;
    setShowPayModal(true);
  }

  async function handlePaymentSuccess() {
    setShowPayModal(false);
    setCheckingOut(true);
    const payload = {
      items: cart.map(({ _id, name, price, quantity }) => ({ productId: _id, name, price, quantity })),
      totalAmount: cartTotal,
    };
    try {
      await ordersAPI.create(payload.items, payload.totalAmount);
      clearCart();
      setCartOpen(false);
      showToast("success", "Order placed! Thank you for your purchase 🎉");
    } catch (err) {
      showToast("error", err.response?.data?.message || "Could not save order. Please contact support.");
    } finally {
      setCheckingOut(false);
    }
  }

  return (
    <div className="app-shell">
      <nav className="navbar">
        <div className="navbar-brand">
          <span className="navbar-logo">🛍️</span>
          <span className="navbar-name">ShopEase</span>
        </div>
        <div className="navbar-search">
          <span className="search-icon">🔍</span>
          <input
            type="search"
            placeholder="Search products…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && <button className="search-clear" onClick={() => setSearchTerm("")}>✕</button>}
        </div>
        <div className="navbar-right">
          {user ? (
            <div className="user-menu">
              <span className="user-greeting">👋 {user.name.split(" ")[0]}</span>
              <button className="btn btn-ghost btn-sm" onClick={logout}>Sign out</button>
            </div>
          ) : (
            <button className="btn btn-ghost btn-sm" onClick={() => setShowAuthModal(true)}>Sign in</button>
          )}
          <button className="cart-toggle" onClick={() => setCartOpen((o) => !o)} aria-label="Toggle cart">
            <span>🛒</span>
            <span className="cart-toggle-label">Cart</span>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>
      </nav>

      <header className="hero-banner">
        <div className="hero-content">
          <span className="hero-eyebrow">✨ Free delivery on orders over Rs. 5,000</span>
          <h1 className="hero-title">Shop everything<br />you love.</h1>
          <p className="hero-subtitle">Curated products, great prices, hassle-free checkout.</p>
        </div>
        <div className="hero-decoration" aria-hidden>
          <span>🛍️</span><span>👟</span><span>🎧</span><span>⌚</span>
        </div>
      </header>

      <div className="category-bar" id="categories">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`cat-pill ${selectedCategory === cat ? "active" : ""}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className={`app-layout ${cartOpen ? "cart-visible" : ""}`}>
        <main className="product-section" id="products">
          <div className="product-section-header">
            <h2 className="section-title">Products</h2>
            <p className="section-meta">
              {filteredProducts.length} item{filteredProducts.length !== 1 ? "s" : ""}
              {selectedCategory !== "All" ? ` in ${selectedCategory}` : ""}
              {searchTerm ? ` matching "${searchTerm}"` : ""}
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="empty-results">
              <span className="empty-icon">🔎</span>
              <p>No products found. Try a different search or category.</p>
            </div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <article className="product-card" key={product._id}>
                  <div className="product-img-wrap">
                    <img
                      src={resolveImage(product)}
                      alt={product.name}
                      className="product-img"
                      loading="lazy"
                    />
                    <span className="product-cat-badge">{product.category || "General"}</span>
                  </div>
                  <div className="product-info">
                    <div className="product-icon-name">
                      <span className="product-icon">{product.icon || "📦"}</span>
                      <h3 className="product-name">{product.name}</h3>
                    </div>
                    <StarRating rating={product.rating || 0} />
                    <div className="product-footer">
                      <span className="product-price">
                        Rs. {Number(product.price).toLocaleString("en-IN")}
                      </span>
                      <button className="btn btn-primary add-btn" onClick={() => addToCart(product)}>
                        + Add
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>

        <aside className={`cart-sidebar ${cartOpen ? "open" : ""}`}>
          <div className="cart-sidebar-header">
            <div>
              <h2 className="cart-title">Your Cart</h2>
              {cartCount > 0 && (
                <p className="cart-meta">{cartCount} item{cartCount !== 1 ? "s" : ""} · Rs. {Number(cartTotal).toLocaleString("en-IN")}</p>
              )}
            </div>
            <div className="cart-header-actions">
              {cart.length > 0 && <button className="btn btn-ghost" onClick={clearCart}>Clear all</button>}
              <button className="cart-close" onClick={() => setCartOpen(false)} aria-label="Close cart">✕</button>
            </div>
          </div>

          {cart.length === 0 ? <EmptyCart /> : (
            <>
              <div className="cart-items">
                {cart.map((item) => (
                  <div className="cart-item" key={item._id}>
                    <img src={resolveImage(item)} alt={item.name} className="cart-item-img" />
                    <div className="cart-item-details">
                      <p className="cart-item-name">{item.name}</p>
                      <p className="cart-item-unit">Rs. {Number(item.price).toLocaleString("en-IN")} each</p>
                      <div className="cart-item-row">
                        <div className="qty-control">
                          <button onClick={() => updateQuantity(item._id, -1)}>−</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item._id, +1)}>+</button>
                        </div>
                        <span className="cart-item-subtotal">
                          Rs. {Number(item.price * item.quantity).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                    <button className="cart-item-remove" onClick={() => removeFromCart(item._id)} aria-label={`Remove ${item.name}`}>✕</button>
                  </div>
                ))}
              </div>
              <div className="cart-footer">
                <div className="cart-total-row">
                  <span>Subtotal</span>
                  <strong>Rs. {Number(cartTotal).toLocaleString("en-IN")}</strong>
                </div>
                {cartTotal >= 5000 && <p className="free-delivery-note">🎉 You qualify for free delivery!</p>}
                <button className="btn btn-primary checkout-btn" onClick={handleCheckout} disabled={checkingOut}>
                  {checkingOut ? "Placing order…" : "Checkout →"}
                </button>
              </div>
            </>
          )}
        </aside>
      </div>

      {cartOpen && <div className="cart-overlay" onClick={() => setCartOpen(false)} aria-hidden />}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={(u) => { setUser(u); setShowAuthModal(false); showToast("success", `Welcome, ${u.name.split(" ")[0]}! 👋`); }}
        />
      )}

      {showPayModal && (
        <PaymentModal
          total={cartTotal}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPayModal(false)}
        />
      )}

      <Toast toast={toast} />

      <footer className="app-footer" id="contact">
        <div className="footer-inner">
          <span className="footer-brand">🛍️ ShopEase</span>
          <div className="footer-links">
            <a href="#products">Products</a>
            <a href="#categories">Categories</a>
            <a href="#contact">Contact</a>
          </div>
          <p className="footer-copy">© 2025 ShopEase. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}