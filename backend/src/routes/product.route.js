import { Router } from "express";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = Router();

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const sorts = {
  newest: { createdAt: -1 },
  priceAsc: { price: 1, _id: 1 },
  priceDesc: { price: -1, _id: 1 },
  name: { name: 1, _id: 1 },
};

const readBody = (body) => {
  const name = String(body.name || "").trim();
  const category = String(body.category || "").trim();
  const price = Number(body.price);
  const stock = Number(body.stock);
  if (!name) return { error: "Product name is required" };
  if (!category) return { error: "Category is required" };
  if (!Number.isFinite(price) || price < 0) return { error: "Enter a valid price" };
  if (!Number.isInteger(stock) || stock < 0) return { error: "Stock must be a whole number" };
  return {
    data: {
      name,
      category,
      price,
      stock,
      description: String(body.description || "").trim(),
      image: String(body.image || "").trim(),
    },
  };
};

router.get("/", async (req, res) => {
  const { q, category, minPrice, maxPrice, sort } = req.query;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(48, Math.max(1, parseInt(req.query.limit) || 12));
  const filter = {};
  if (q && String(q).trim()) {
    const rx = new RegExp(escapeRegex(String(q).trim()), "i");
    filter.$or = [{ name: rx }, { description: rx }, { category: rx }];
  }
  if (category) filter.category = String(category);
  const price = {};
  if (minPrice !== undefined && minPrice !== "" && Number.isFinite(Number(minPrice))) price.$gte = Number(minPrice);
  if (maxPrice !== undefined && maxPrice !== "" && Number.isFinite(Number(maxPrice))) price.$lte = Number(maxPrice);
  if (Object.keys(price).length) filter.price = price;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sorts[sort] || sorts.newest)
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
  ]);
  res.json({ products, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});

router.get("/categories", async (_req, res) => {
  const categories = await Product.distinct("category");
  res.json(categories.sort());
});

router.get("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: "Product not found" });
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

router.post("/", protect, adminOnly, async (req, res) => {
  const { data, error } = readBody(req.body);
  if (error) return res.status(400).json({ error });
  const product = await Product.create(data);
  res.status(201).json(product);
});

router.put("/:id", protect, adminOnly, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: "Product not found" });
  const { data, error } = readBody(req.body);
  if (error) return res.status(400).json({ error });
  const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true });
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

router.delete("/:id", protect, adminOnly, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: "Product not found" });
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json({ ok: true });
});

export default router;
