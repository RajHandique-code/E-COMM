import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { errorMessage, money } from "../api.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Checkout() {
  const { items, total, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: user?.name || "", phone: "", address: "", city: "", postalCode: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [placed, setPlaced] = useState(null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  if (placed) {
    return (
      <div className="empty">
        <h3>Order placed</h3>
        <p className="muted">Order {placed._id.slice(-8).toUpperCase()} for {money(placed.total)} is confirmed. Payment is cash on delivery.</p>
        <div className="row center">
          <button className="primary" onClick={() => navigate("/orders")}>View my orders</button>
          <Link to="/" className="ghost-link">Keep shopping</Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="empty">
        <h3>Your cart is empty</h3>
        <Link to="/" className="primary-link">Browse products</Link>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await api.post("/orders", {
        items: items.map((i) => ({ product: i.product, qty: i.qty })),
        shippingAddress: form,
      });
      clear();
      setPlaced(res.data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="cart">
      <h1>Checkout</h1>
      <div className="cart-layout">
        <form className="form" onSubmit={submit}>
          <h2>Shipping address</h2>
          <label>Full name<input value={form.fullName} onChange={set("fullName")} required /></label>
          <label>Phone<input value={form.phone} onChange={set("phone")} inputMode="tel" required /></label>
          <label>Address<input value={form.address} onChange={set("address")} required /></label>
          <div className="row">
            <label>City<input value={form.city} onChange={set("city")} required /></label>
            <label>Postal code<input value={form.postalCode} onChange={set("postalCode")} required /></label>
          </div>
          <p className="muted">Payment: cash on delivery</p>
          {error && <p className="error">{error}</p>}
          <button className="primary" disabled={busy}>{busy ? "Placing order" : `Place order · ${money(total)}`}</button>
        </form>
        <aside className="summary">
          <h2>Items</h2>
          {items.map((i) => (
            <div className="line" key={i.product}>
              <span>{i.name} × {i.qty}</span>
              <span>{money(i.price * i.qty)}</span>
            </div>
          ))}
          <div className="line total"><span>Total</span><strong>{money(total)}</strong></div>
        </aside>
      </div>
    </div>
  );
}
