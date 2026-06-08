const Order = require("../models/Order");
const Product = require("../models/Product");

const createOrder = async (req, res) => {
  const { items, totalAmount, customerInfo, deliveryDetails } = req.body;

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
    // Decrease product stock for each item in the order
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
        product.outOfStock = product.stock <= 0;
        product.updatedAt = Date.now();
        await product.save();
      }
    }

    const orderData = {
      items,
      totalAmount,
      customerInfo: customerInfo || {},
      deliveryDetails: deliveryDetails || {},
      paymentStatus: "Paid",
    };

    if (req.user) orderData.userId = req.user._id;

    const order = new Order(orderData);
    const savedOrder = await order.save();
    res.status(201).json({ message: "Order saved successfully.", order: savedOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET all orders (admin)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate("userId", "name email");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET single order
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("userId", "name email");
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT update order status (admin)
const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ["Pending", "Processing", "Shipped", "Delivered"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(", ")}` });
  }

  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    order.status = status;
    order.updatedAt = Date.now();

    const updated = await order.save();
    res.json({ message: "Order status updated successfully.", order: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET dashboard stats (admin)
const getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalSales = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "name email");

    res.json({
      totalProducts,
      totalOrders,
      totalSales: totalSales[0]?.total || 0,
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getDashboardStats,
};