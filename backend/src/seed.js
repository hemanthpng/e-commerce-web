import "dotenv/config";
import mongoose from "mongoose";
import Product from "./models/Product.js";

const products = [
  { name: "Velocity Low 'Volt'", slug: "velocity-low", category: "Sneakers", price: 8499, compareAtPrice: 9999, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85", rating: 4.9, reviewCount: 186, stock: 18, badge: "Drop", featured: true, description: "A low-profile runner with high-impact color and all-day cushioning." },
  { name: "Cloud Runner 91", slug: "cloud-91", category: "Sneakers", price: 6899, compareAtPrice: 7499, image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=85", rating: 4.8, reviewCount: 94, stock: 12, badge: "Best seller", featured: true, description: "Retro running lines reworked with a lightweight street sole." },
  { name: "Courtside Track Jacket", slug: "courtside-jacket", category: "Apparel", price: 4799, compareAtPrice: 5999, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=85", rating: 4.7, reviewCount: 58, stock: 21, badge: "New", featured: true, description: "An easy track jacket with contrast piping and a relaxed cut." },
  { name: "Parallel Five-Panel Cap", slug: "parallel-cap", category: "Accessories", price: 1699, compareAtPrice: 2199, image: "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=900&q=85", rating: 4.8, reviewCount: 73, stock: 30, badge: "", featured: true, description: "Clean five-panel construction with an adjustable back strap." },
  { name: "Afterdark High", slug: "afterdark-high", category: "Sneakers", price: 9299, compareAtPrice: 10999, image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=85", rating: 4.9, reviewCount: 143, stock: 9, badge: "Limited", featured: true, description: "A dark high-top made for late nights and standout fits." },
  { name: "Studio Utility Overshirt", slug: "studio-overshirt", category: "Apparel", price: 5299, compareAtPrice: 6499, image: "https://images.unsplash.com/photo-1598032895397-b9472444bf93?auto=format&fit=crop&w=900&q=85", rating: 4.6, reviewCount: 42, stock: 16, badge: "Exclusive", featured: true, description: "A structured utility overshirt with workwear details." },
  { name: "Block Graphic Crew", slug: "block-crew", category: "Apparel", price: 2999, compareAtPrice: 3499, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85", rating: 4.8, reviewCount: 121, stock: 24, badge: "", featured: true, description: "Heavyweight cotton with a bold front graphic." },
  { name: "Metro Crossbody Sling", slug: "metro-sling", category: "Accessories", price: 2499, compareAtPrice: 2999, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85", rating: 4.7, reviewCount: 67, stock: 20, badge: "Restocked", featured: true, description: "Compact hands-free storage for daily essentials." }
];

try {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required.");
  await mongoose.connect(process.env.MONGODB_URI);
  await Promise.all(products.map(({ slug, ...product }) => Product.updateOne({ slug }, { $set: { slug, ...product } }, { upsert: true })));
  console.log(`Seeded ${products.length} products.`);
} catch (error) {
  console.error("Could not seed products:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
