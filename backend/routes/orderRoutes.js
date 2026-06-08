const express   = require("express");
const router    = express.Router();
const { createOrder, getAllOrders, getOrderById, updateOrderStatus, getDashboardStats } = require("../controllers/orderController");
const { protectAdmin } = require("../middleware/authMiddleware");

// Optional auth middleware — attaches req.user if token present, but doesn't block guests
const optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return next();  // guest — skip

  const jwt  = require("jsonwebtoken");
  const User = require("../models/User");
  try {
    const token   = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user      = await User.findById(decoded.id).select("-password");
  } catch {
    // invalid token — treat as guest
  }
  next();
};

// Public route (guests can create orders)
router.post("/", optionalAuth, createOrder);

// Admin routes
router.get("/", protectAdmin, getAllOrders);
router.get("/stats/dashboard", protectAdmin, getDashboardStats);
router.get("/:id", protectAdmin, getOrderById);
router.put("/:id/status", protectAdmin, updateOrderStatus);

module.exports = router;