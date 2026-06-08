const Order = require("../models/Order");

const createOrder = async (req, res) => {
  const { items, totalAmount } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Order must include at least one item." });
  }

  if (typeof totalAmount !== "number" || totalAmount <= 0) {
    return res.status(400).json({ message: "Total amount must be a positive number." });
  }

  for (const item of items) {
    if (!item.productId || !item.name) {
      return res.status(400).json({ message: "Each item must include a productId and name." });
    }
    if (typeof item.price !== "number" || item.price < 0) {
      return res.status(400).json({ message: "Each item must include a valid price." });
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      return res.status(400).json({ message: "Each item must include a positive quantity." });
    }
  }

  try {
    // Attach the logged-in user's id if the request came through the auth middleware
    const orderData = { items, totalAmount };
    if (req.user) orderData.userId = req.user._id;

    const order = new Order(orderData);
    const savedOrder = await order.save();
    res.status(201).json({ message: "Order saved successfully.", order: savedOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder };