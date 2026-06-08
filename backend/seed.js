const mongoose = require("mongoose");
require("dotenv").config();

const Product = require("./models/Product");

const products = [
  {
    name:     "Classic Leather Bag",
    category: "Accessories",
    price:    2499,
    image:    "https://picsum.photos/seed/bag/600/400",
    imageKey: null,
    rating:   4.5,
    icon:     "👜",
  },
  {
    name:     "Running Sneakers",
    category: "Footwear",
    price:    3499,
    image:    "https://picsum.photos/seed/shoes/600/400",
    imageKey: null,
    rating:   4.2,
    icon:     "👟",
  },
  {
    name:     "Wireless Headphones",
    category: "Electronics",
    price:    4999,
    image:    "https://picsum.photos/seed/headphones/600/400",
    imageKey: null,
    rating:   4.7,
    icon:     "🎧",
  },
  {
    name:     "Ceramic Mug Set",
    category: "Home",
    price:    799,
    image:    "https://picsum.photos/seed/mug/600/400",
    imageKey: null,
    rating:   4.1,
    icon:     "☕",
  },
  {
    name:     "Minimalist Watch",
    category: "Accessories",
    price:    5599,
    image:    "https://picsum.photos/seed/watch/600/400",
    imageKey: null,
    rating:   4.6,
    icon:     "🕒",
  },
  {
    name:     "Organic Cotton Tee",
    category: "Clothing",
    price:    699,
    image:    "https://picsum.photos/seed/tshirt/600/400",
    imageKey: null,
    rating:   4.0,
    icon:     "👕",
  },
  {
    name:     "Desk Lamp",
    category: "Home",
    price:    1299,
    image:    "https://picsum.photos/seed/lamp/600/400",
    imageKey: null,
    rating:   4.3,
    icon:     "💡",
  },
  {
    name:     "Travel Backpack",
    category: "Accessories",
    price:    3799,
    image:    "https://picsum.photos/seed/backpack/600/400",
    imageKey: null,
    rating:   4.4,
    icon:     "🎒",
  },
  {
    name:     "Bluetooth Speaker",
    category: "Electronics",
    price:    2999,
    image:    "https://picsum.photos/seed/speaker/600/400",
    imageKey: null,
    rating:   4.3,
    icon:     "🔊",
  },
  {
    name:     "Yoga Mat",
    category: "Clothing",
    price:    1199,
    image:    "https://picsum.photos/seed/yoga/600/400",
    imageKey: null,
    rating:   4.5,
    icon:     "🧘",
  },
  {
    name:     "Laptop",
    category: "Electronics",
    price:    89999,
    image:    null,
    imageKey: "laptop",   // maps to laptopImg import in frontend
    rating:   4.8,
    icon:     "💻",
  },
  {
    name:     "Wireless Mouse",
    category: "Electronics",
    price:    2499,
    image:    null,
    imageKey: "mouse",    // maps to mouseImg import in frontend
    rating:   4.4,
    icon:     "🖱️",
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB:", mongoose.connection.name);

    // Wipe existing products so re-running doesn't duplicate
    await Product.deleteMany({});
    console.log("🗑️  Cleared existing products");

    const inserted = await Product.insertMany(products);
    console.log(`🌱 Seeded ${inserted.length} products:`);
    inserted.forEach((p) => console.log(`   • ${p.icon}  ${p.name}  (Rs. ${p.price})`));

  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected");
  }
}

seed();