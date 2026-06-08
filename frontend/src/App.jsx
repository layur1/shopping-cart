import { useEffect, useMemo, useState, useCallback } from "react";
import "./AppStyles.css";
import "./AuthStyles.css";
import { productsAPI, ordersAPI, paymentAPI, authAPI } from "./api";
import OrderSummary from "./OrderSummary";
import AdminLogin from "./AdminLogin";
import AdminPanel from "./AdminPanel";

// ─── Asset imports ────────────────────────────────────────────────────────────
import tomatoImg        from "./assets/tomato.jpeg";
import spinachImg       from "./assets/spinach.jpeg";
import onionImg         from "./assets/onion.jpeg";
import carrotImg        from "./assets/carrot.jpeg";
import mangoImg         from "./assets/mango.jpeg";
import strawberryImg    from "./assets/strawberry.jpeg";
import bananaImg        from "./assets/banana.jpeg";
import appleImg         from "./assets/apple.jpeg";
import chocolateCakeImg from "./assets/chocolate_cake.jpeg";
import vanillaCakeImg   from "./assets/vanilla_cake.jpeg";
import redVelvetImg     from "./assets/red_velvet.jpeg";
import shortbreadImg    from "./assets/shortbread.jpeg";
import chocChipImg      from "./assets/choc_chip.jpeg";
import oatRaisinImg     from "./assets/oat_raisin.jpeg";

// ─── Local image map ──────────────────────────────────────────────────────────
const LOCAL_IMAGES = {
  tomato:         tomatoImg,
  spinach:        spinachImg,
  onion:          onionImg,
  carrot:         carrotImg,
  mango:          mangoImg,
  strawberry:     strawberryImg,
  banana:         bananaImg,
  apple:          appleImg,
  chocolate_cake: chocolateCakeImg,
  vanilla_cake:   vanillaCakeImg,
  red_velvet:     redVelvetImg,
  shortbread:     shortbreadImg,
  choc_chip:      chocChipImg,
  oat_raisin:     oatRaisinImg,
};

// Resolve a product's image: prefer local asset, then remote URL, then picsum fallback
function resolveImage(product) {
  if (product.imageKey && LOCAL_IMAGES[product.imageKey]) return LOCAL_IMAGES[product.imageKey];
  if (product.image) return product.image;
  return `https://picsum.photos/seed/${product._id}/600/400`;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = ["All", "Vegetables", "Fruits", "Cakes", "Biscuits"];

const SAMPLE_PRODUCTS = [
  { _id:"s1",  name:"Roma Tomatoes",         category:"Vegetables", price:120,  imageKey:"tomato",         rating:4.5, icon:"🍅", description:"Firm, flavourful Roma tomatoes. Perfect for curries, salads and sauces." },
  { _id:"s2",  name:"Fresh Spinach",          category:"Vegetables", price:85,   imageKey:"spinach",        rating:4.3, icon:"🥬", description:"Tender baby spinach leaves, washed and ready to use." },
  { _id:"s3",  name:"Red Onions",             category:"Vegetables", price:65,   imageKey:"onion",          rating:4.1, icon:"🧅", description:"Mild, slightly sweet red onions. Great raw or caramelised." },
  { _id:"s4",  name:"Carrots",                category:"Vegetables", price:95,   imageKey:"carrot",         rating:4.4, icon:"🥕", description:"Crunchy, naturally sweet carrots. Ideal for stews and snacking." },
  { _id:"s5",  name:"Alphonso Mangoes",       category:"Fruits",     price:450,  imageKey:"mango",          rating:4.9, icon:"🥭", description:"The king of mangoes — rich, creamy and intensely fragrant." },
  { _id:"s6",  name:"Strawberries",           category:"Fruits",     price:320,  imageKey:"strawberry",     rating:4.7, icon:"🍓", description:"Plump, sun-ripened strawberries. Sweet with a hint of tartness." },
  { _id:"s7",  name:"Bananas",                category:"Fruits",     price:80,   imageKey:"banana",         rating:4.2, icon:"🍌", description:"Perfectly ripe yellow bananas, great for eating or baking." },
  { _id:"s8",  name:"Green Apples",           category:"Fruits",     price:210,  imageKey:"apple",          rating:4.5, icon:"🍏", description:"Crisp Granny Smith apples — tangy, refreshing and great for juicing." },
  { _id:"s9",  name:"Chocolate Fudge Cake",   category:"Cakes",      price:1800, imageKey:"chocolate_cake", rating:4.9, icon:"🎂", description:"Dense, moist chocolate cake smothered in rich fudge ganache." },
  { _id:"s10", name:"Vanilla Sponge Cake",    category:"Cakes",      price:1400, imageKey:"vanilla_cake",   rating:4.6, icon:"🍰", description:"Light, airy vanilla sponge layered with fresh cream and jam." },
  { _id:"s11", name:"Red Velvet Cake",        category:"Cakes",      price:1950, imageKey:"red_velvet",     rating:4.8, icon:"🎂", description:"Classic red velvet with velvety crumb and tangy cream cheese frosting." },
  { _id:"s12", name:"Butter Shortbread",      category:"Biscuits",   price:350,  imageKey:"shortbread",     rating:4.6, icon:"🍪", description:"Melt-in-your-mouth Scottish-style shortbread made with pure butter." },
  { _id:"s13", name:"Chocolate Chip Cookies", category:"Biscuits",   price:299,  imageKey:"choc_chip",      rating:4.7, icon:"🍪", description:"Chewy, golden cookies loaded with dark chocolate chips." },
  { _id:"s14", name:"Oat & Raisin Biscuits",  category:"Biscuits",   price:249,  imageKey:"oat_raisin",     rating:4.3, icon:"🍪", description:"Hearty oat biscuits with plump raisins. A wholesome treat." },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
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

function PaymentModal({ orderData, onSuccess, onClose }) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry]         = useState("");
  const [cvc, setCvc]               = useState("");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  const total = orderData?.total || 0;

  async function handlePay(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await paymentAPI.createIntent(total);
      await new Promise((r) => setTimeout(r, 1000));
      onSuccess(orderData);
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

// ─── Main App ─────────────────────────────────────────────────────────────────
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
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [showPayModal, setShowPayModal]         = useState(false);
  const [orderData, setOrderData]               = useState(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn]   = useState(false);
  const [adminUser, setAdminUser]               = useState(null);
  const [showAdminLogin, setShowAdminLogin]     = useState(false);

  // Fetch products from API; fall back to SAMPLE_PRODUCTS if unavailable
  useEffect(() => {
    productsAPI.getAll()
      .then((res) => { if (res.data?.length) setProducts(res.data); })
      .catch(() => {});
  }, []);

  // Restore session from stored token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    authAPI.getMe()
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem("token"));
  }, []);

  // Restore admin session from stored adminToken
  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) return;
    authAPI.getMe()
      .then((res) => {
        if (res.data.user.role === "admin") {
          setAdminUser(res.data.user);
          setIsAdminLoggedIn(true);
        } else {
          localStorage.removeItem("adminToken");
        }
      })
      .catch(() => localStorage.removeItem("adminToken"));
  }, []);

  // Auto-dismiss toast after 3 s
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

  function handleAdminLogout() {
    localStorage.removeItem("adminToken");
    setIsAdminLoggedIn(false);
    setAdminUser(null);
    setShowAdminLogin(false);
    showToast("success", "Admin signed out.");
  }

  function handleCheckout() {
    if (!cart.length) return;
    setCartOpen(false);
    setShowOrderSummary(true);
  }

  function handleProceedToPayment(data) {
    setOrderData(data);
    setShowOrderSummary(false);
    setShowPayModal(true);
  }

  async function handlePaymentSuccess(data) {
    setShowPayModal(false);
    setCheckingOut(true);
    try {
      await ordersAPI.create(
        data.items,
        data.total,
        data.customerInfo,
        data.deliveryDetails
      );
      clearCart();
      setCartOpen(false);
      setOrderData(null);
      showToast("success", "Order placed! Thank you for your purchase 🎉");
    } catch (err) {
      showToast("error", err.response?.data?.message || "Could not save order. Please contact support.");
    } finally {
      setCheckingOut(false);
    }
  }

  return (
    <>
      {isAdminLoggedIn && adminUser ? (
        <AdminPanel
          user={adminUser}
          onLogout={handleAdminLogout}
        />
      ) : showAdminLogin ? (
        <AdminLogin
          onSuccess={(data) => {
            setAdminUser(data.user);
            setIsAdminLoggedIn(true);
            setShowAdminLogin(false);
            localStorage.setItem("adminToken", data.token);
            showToast(
              "success",
              `Welcome Admin, ${data.user.name.split(" ")[0]}! 👮‍♂️`
            );
          }}
        />
      ) : (
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
          <button className="btn btn-ghost btn-sm" onClick={() => setShowAdminLogin(true)}>🔐 Admin</button>
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
          <h1 className="hero-title">Fresh groceries &amp;<br />handmade treats.</h1>
          <p className="hero-subtitle">Vegetables, fruits, cakes and biscuits — delivered to your door.</p>
        </div>
        <div className="hero-decoration" aria-hidden>
          <span>🥦</span><span>🍓</span><span>🎂</span><span>🍪</span>
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
                    {product.description && (
                      <p className="product-description">{product.description}</p>
                    )}
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

      {showOrderSummary && cart.length > 0 && (
        <OrderSummary
          cart={cart}
          user={user}
          onClose={() => setShowOrderSummary(false)}
          onProceedToPayment={handleProceedToPayment}
          LOCAL_IMAGES={LOCAL_IMAGES}
        />
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={(u) => { setUser(u); setShowAuthModal(false); showToast("success", `Welcome, ${u.name.split(" ")[0]}! 👋`); }}
        />
      )}

      {showPayModal && orderData && (
        <PaymentModal
          orderData={orderData}
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
      )}
    </>
  );
}