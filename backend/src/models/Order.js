import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, default: "" },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: { type: [itemSchema], required: true },
    shippingAddress: {
      fullName: String,
      phone: String,
      address: String,
      city: String,
      postalCode: String,
    },
    paymentMethod: { type: String, default: "Cash on delivery" },
    total: { type: Number, required: true },
    status: { type: String, enum: ["placed", "shipped", "delivered", "cancelled"], default: "placed" },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
