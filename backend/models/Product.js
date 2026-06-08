const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String, // URL (for remote images / fallback)
  },
  imageKey: {
    type: String, // key that maps to a local import in the frontend (e.g. "laptop", "mouse")
  },
  category: {
    type: String,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  icon: {
    type: String, // emoji, e.g. "💻"
  },
});

module.exports = mongoose.model("Product", productSchema);