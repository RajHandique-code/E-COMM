import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function protect(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Sign in to continue" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select("name email role");
    if (!user) return res.status(401).json({ error: "Account no longer exists" });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Session expired, sign in again" });
  }
}

export function adminOnly(req, res, next) {
  if (req.user?.role !== "admin") return res.status(403).json({ error: "Admins only" });
  next();
}
