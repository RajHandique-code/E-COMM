import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: "", trim: true, maxlength: 2000 },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    image: { type: String, default: "" },
    stock: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ category: 1, price: 1 });

export default mongoose.model("Product", productSchema);
