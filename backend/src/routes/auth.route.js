import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

const sign = (user) => jwt.sign({ id: String(user._id) }, process.env.JWT_SECRET, { expiresIn: "7d" });

const publicUser = (user) => ({ id: String(user._id), name: user.name, email: user.email, role: user.role });

router.post("/register", async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  if (!name) return res.status(400).json({ error: "Name is required" });
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: "Enter a valid email" });
  if (password.length < 6) return res.status(400).json({ error: "Password needs at least 6 characters" });
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });
    res.status(201).json({ token: sign(user), user: publicUser(user) });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: "An account with that email already exists" });
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.post("/login", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: "Wrong email or password" });
  }
  res.json({ token: sign(user), user: publicUser(user) });
});

router.get("/me", protect, (req, res) => {
  res.json(publicUser(req.user));
});

export default router;
