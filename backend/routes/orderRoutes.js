const express   = require("express");
const router    = express.Router();
const { createOrder } = require("../controllers/orderController");

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

router.post("/", optionalAuth, createOrder);

module.exports = router;