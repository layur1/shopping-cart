const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const productRoutes = require("./routes/productRoutes");
const orderRoutes   = require("./routes/orderRoutes");
const authRoutes    = require("./routes/authRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

// ── Stripe webhook needs raw body, must come BEFORE express.json() ──
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
app.post("/api/payment/webhook", express.raw({ type: "application/json" }), (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  // Handle payment_intent.succeeded if needed
  if (event.type === "payment_intent.succeeded") {
    console.log("💳 Payment succeeded:", event.data.object.id);
  }
  res.json({ received: true });
});

// ── Standard middleware ──
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// ── Routes ──
app.use("/api/products", productRoutes);
app.use("/api/orders",   orderRoutes);
app.use("/api/auth",     authRoutes);
app.use("/api/payment",  paymentRoutes);

app.get("/", (req, res) => res.send("Shopping Cart Backend Running"));

// ── DB + Server ──
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected:", mongoose.connection.name);
  })
  .catch((err) => console.error("MongoDB Error:", err.message));

app.listen(process.env.PORT || 5000, () => {
  console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
});