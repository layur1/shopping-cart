const Product = require("../models/Product");

const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET single product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST create product (admin)
const createProduct = async (req, res) => {
  const { name, category, price, stock, description, rating, icon, imageKey, image } = req.body;

  if (!name || !category || price === undefined) {
    return res.status(400).json({ message: "Name, category, and price are required." });
  }

  try {
    const product = await Product.create({
      name,
      category,
      price,
      stock: stock || 0,
      description,
      rating: rating || 0,
      icon: icon || "📦",
      imageKey,
      image,
      outOfStock: stock <= 0,
      updatedAt: Date.now(),
    });

    res.status(201).json({ message: "Product created successfully.", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT update product (admin)
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, category, price, stock, description, rating, icon, imageKey, image } = req.body;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    product.name = name || product.name;
    product.category = category || product.category;
    product.price = price !== undefined ? price : product.price;
    product.stock = stock !== undefined ? stock : product.stock;
    product.description = description || product.description;
    product.rating = rating !== undefined ? rating : product.rating;
    product.icon = icon || product.icon;
    product.imageKey = imageKey || product.imageKey;
    product.image = image || product.image;
    product.outOfStock = product.stock <= 0;
    product.updatedAt = Date.now();

    const updated = await product.save();
    res.json({ message: "Product updated successfully.", product: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE product (admin)
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }
    res.json({ message: "Product deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT update stock (admin)
const updateStock = async (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;

  if (stock === undefined || typeof stock !== "number" || stock < 0) {
    return res.status(400).json({ message: "Stock must be a non-negative number." });
  }

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    product.stock = stock;
    product.outOfStock = stock <= 0;
    product.updatedAt = Date.now();

    const updated = await product.save();
    res.json({ message: "Stock updated successfully.", product: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
};