import { Router } from "express";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = Router();
router.use(protect);

const ADDRESS_FIELDS = ["fullName", "phone", "address", "city", "postalCode"];

const restoreStock = (reserved) =>
  Promise.all(reserved.map(([id, qty]) => Product.updateOne({ _id: id }, { $inc: { stock: qty } })));

router.post("/", async (req, res) => {
  const { items, shippingAddress } = req.body;
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: "Your cart is empty" });

  const address = {};
  for (const field of ADDRESS_FIELDS) {
    const value = String(shippingAddress?.[field] || "").trim();
    if (!value) return res.status(400).json({ error: "Complete the shipping address" });
    address[field] = value;
  }

  const wanted = new Map();
  for (const item of items) {
    const qty = Number(item.qty);
    if (!mongoose.isValidObjectId(item.product) || !Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({ error: "Invalid cart item" });
    }
    const key = String(item.product);
    wanted.set(key, (wanted.get(key) || 0) + qty);
  }

  const products = await Product.find({ _id: { $in: [...wanted.keys()] } });
  if (products.length !== wanted.size) {
    return res.status(409).json({ error: "Some items in your cart are no longer available" });
  }

  const reserved = [];
  try {
    for (const product of products) {
      const qty = wanted.get(String(product._id));
      const result = await Product.updateOne({ _id: product._id, stock: { $gte: qty } }, { $inc: { stock: -qty } });
      if (result.modifiedCount !== 1) {
        const err = new Error(`${product.name} does not have enough stock`);
        err.expected = true;
        throw err;
      }
      reserved.push([product._id, qty]);
    }
    const orderItems = products.map((p) => ({
      product: p._id,
      name: p.name,
      price: p.price,
      image: p.image,
      qty: wanted.get(String(p._id)),
    }));
    const total = orderItems.reduce((sum, i) => sum + i.price * i.qty, 0);
    const order = await Order.create({ user: req.user._id, items: orderItems, shippingAddress: address, total });
    res.status(201).json(order);
  } catch (e) {
    await restoreStock(reserved);
    if (e.expected) return res.status(409).json({ error: e.message });
    res.status(500).json({ error: "Could not place the order" });
  }
});

router.get("/mine", async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

router.get("/", adminOnly, async (_req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 }).populate("user", "name email");
  res.json(orders);
});

router.patch("/:id/status", adminOnly, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: "Order not found" });
  const status = req.body.status;
  if (!["placed", "shipped", "delivered", "cancelled"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (order.status === "cancelled") return res.status(400).json({ error: "Cancelled orders cannot be changed" });
  if (status === "cancelled") await restoreStock(order.items.map((i) => [i.product, i.qty]));
  order.status = status;
  await order.save();
  const populated = await order.populate("user", "name email");
  res.json(populated);
});

export default router;
