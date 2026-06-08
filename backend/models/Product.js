const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Product name is required"],
    trim: true,
  },
  category: {
    type: String,
    required: [true, "Category is required"],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: 0,
  },
  image: {
    type: String,
    default: null,
  },
  imageKey: {
    type: String,
    default: null,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  icon: {
    type: String,
    default: "📦",
  },
  description: {
    type: String,
    default: "",
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", productSchema);