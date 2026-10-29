import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import connectDB from "./db.js";
import User from "./models/User.js";
import Product from "./models/Product.js";

const products = [
  { name: "Wireless Earbuds", category: "Electronics", price: 1999, stock: 40, description: "Bluetooth 5.3 earbuds with a charging case and up to 24 hours of playback." },
  { name: "Mechanical Keyboard", category: "Electronics", price: 3499, stock: 25, description: "Compact tenkeyless keyboard with tactile switches and a detachable cable." },
  { name: "Power Bank 20000mAh", category: "Electronics", price: 1799, stock: 60, description: "Dual USB output power bank with fast charging support." },
  { name: "Smart Watch", category: "Electronics", price: 2999, stock: 18, description: "Fitness tracking, heart rate monitor and notifications on a bright display." },
  { name: "Clean Code", category: "Books", price: 599, stock: 35, description: "A handbook of agile software craftsmanship by Robert C. Martin." },
  { name: "Eloquent JavaScript", category: "Books", price: 549, stock: 30, description: "A modern introduction to programming with JavaScript." },
  { name: "Introduction to Algorithms", category: "Books", price: 1299, stock: 12, description: "The standard reference for algorithms and data structures." },
  { name: "Cotton T-Shirt", category: "Clothing", price: 499, stock: 100, description: "Soft everyday t-shirt in a regular fit." },
  { name: "Denim Jacket", category: "Clothing", price: 1899, stock: 22, description: "Classic denim jacket with button front and two chest pockets." },
  { name: "Running Shoes", category: "Clothing", price: 2499, stock: 28, description: "Lightweight running shoes with a cushioned sole." },
  { name: "Desk Lamp", category: "Home", price: 899, stock: 45, description: "Adjustable LED desk lamp with three brightness levels." },
  { name: "Steel Water Bottle", category: "Home", price: 449, stock: 80, description: "Insulated 750ml bottle that keeps drinks cold for 24 hours." },
];

await connectDB();

const email = (process.env.ADMIN_EMAIL || "admin@shop.com").toLowerCase();
const password = process.env.ADMIN_PASSWORD || "admin123";
const passwordHash = await bcrypt.hash(password, 10);
await User.findOneAndUpdate(
  { email },
  { name: "Store Admin", email, passwordHash, role: "admin" },
  { upsert: true, new: true }
);
console.log(`admin ready: ${email}`);

if ((await Product.countDocuments()) === 0) {
  await Product.insertMany(products);
  console.log(`${products.length} products added`);
} else {
  console.log("products already exist, skipped");
}

await mongoose.disconnect();
