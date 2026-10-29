import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./db.js";
import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import orderRoutes from "./routes/order.route.js";

await connectDB();

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.get("/health", (_req, res) => res.send("ok"));
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
