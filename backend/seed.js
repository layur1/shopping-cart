const mongoose = require("mongoose");
require("dotenv").config();
const Product = require("./models/Product");

const products = [
  // ── Vegetables ──
  {
    name: "Roma Tomatoes", category: "Vegetables", price: 120,
    image: null, imageKey: "tomato", rating: 4.5, icon: "🍅",
    description: "Firm, flavourful Roma tomatoes. Perfect for curries, salads and sauces.",
  },
  {
    name: "Fresh Spinach", category: "Vegetables", price: 85,
    image: null, imageKey: "spinach", rating: 4.3, icon: "🥬",
    description: "Tender baby spinach leaves, washed and ready to use.",
  },
  {
    name: "Red Onions", category: "Vegetables", price: 65,
    image: null, imageKey: "onion", rating: 4.1, icon: "🧅",
    description: "Mild, slightly sweet red onions. Great raw or caramelised.",
  },
  {
    name: "Carrots", category: "Vegetables", price: 95,
    image: null, imageKey: "carrot", rating: 4.4, icon: "🥕",
    description: "Crunchy, naturally sweet carrots. Ideal for stews and snacking.",
  },

  // ── Fruits ──
  {
    name: "Alphonso Mangoes", category: "Fruits", price: 450,
    image: null, imageKey: "mango", rating: 4.9, icon: "🥭",
    description: "The king of mangoes — rich, creamy and intensely fragrant.",
  },
  {
    name: "Strawberries", category: "Fruits", price: 320,
    image: null, imageKey: "strawberry", rating: 4.7, icon: "🍓",
    description: "Plump, sun-ripened strawberries. Sweet with a hint of tartness.",
  },
  {
    name: "Bananas", category: "Fruits", price: 80,
    image: null, imageKey: "banana", rating: 4.2, icon: "🍌",
    description: "Perfectly ripe yellow bananas, great for eating or baking.",
  },
  {
    name: "Green Apples", category: "Fruits", price: 210,
    image: null, imageKey: "apple", rating: 4.5, icon: "🍏",
    description: "Crisp Granny Smith apples — tangy, refreshing and great for juicing.",
  },

  // ── Cakes ──
  {
    name: "Chocolate Fudge Cake", category: "Cakes", price: 1800,
    image: null, imageKey: "chocolate_cake", rating: 4.9, icon: "🎂",
    description: "Dense, moist chocolate cake smothered in rich fudge ganache.",
  },
  {
    name: "Vanilla Sponge Cake", category: "Cakes", price: 1400,
    image: null, imageKey: "vanilla_cake", rating: 4.6, icon: "🍰",
    description: "Light, airy vanilla sponge layered with fresh cream and jam.",
  },
  {
    name: "Red Velvet Cake", category: "Cakes", price: 1950,
    image: null, imageKey: "red_velvet", rating: 4.8, icon: "🎂",
    description: "Classic red velvet with velvety crumb and tangy cream cheese frosting.",
  },

  // ── Biscuits ──
  {
    name: "Butter Shortbread", category: "Biscuits", price: 350,
    image: null, imageKey: "shortbread", rating: 4.6, icon: "🍪",
    description: "Melt-in-your-mouth Scottish-style shortbread made with pure butter.",
  },
  {
    name: "Chocolate Chip Cookies", category: "Biscuits", price: 299,
    image: null, imageKey: "choc_chip", rating: 4.7, icon: "🍪",
    description: "Chewy, golden cookies loaded with dark chocolate chips.",
  },
  {
    name: "Oat & Raisin Biscuits", category: "Biscuits", price: 249,
    image: null, imageKey: "oat_raisin", rating: 4.3, icon: "🍪",
    description: "Hearty oat biscuits with plump raisins. A wholesome treat.",
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected:", mongoose.connection.name);
    await Product.deleteMany({});
    console.log("🗑️  Cleared existing products");
    const inserted = await Product.insertMany(products);
    console.log(`🌱 Seeded ${inserted.length} products:`);
    inserted.forEach((p) => console.log(`   ${p.icon}  ${p.name}  (Rs. ${p.price})`));
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected");
  }
}

seed();