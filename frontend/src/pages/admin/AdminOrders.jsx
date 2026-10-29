import { useEffect, useState } from "react";
import api, { errorMessage, money } from "../../api.js";

const STATUSES = ["placed", "shipped", "delivered", "cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/orders")
      .then((res) => setOrders(res.data))
      .catch((err) => setError(errorMessage(err)));
  }, []);

  const update = async (id, status) => {
    setError("");
    try {
      const res = await api.patch(`/orders/${id}/status`, { status });
      setOrders((prev) => prev.map((o) => (o._id === id ? res.data : o)));
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  if (!orders) return error ? <p className="error">{error}</p> : <p className="muted">Loading orders</p>;

  return (
    <div>
      <h1>All orders</h1>
      {error && <p className="error">{error}</p>}
      {orders.length === 0 && <p className="muted">No orders have been placed yet.</p>}
      <div className="order-list">
        {orders.map((o) => (
          <article className="order" key={o._id}>
            <header>
              <div>
                <strong>Order {o._id.slice(-8).toUpperCase()}</strong>
                <span className="muted small">
                  {o.user?.name || "Deleted user"} · {new Date(o.createdAt).toLocaleString()}
                </span>
              </div>
              <select
                value={o.status}
                disabled={o.status === "cancelled"}
                onChange={(e) => update(o._id, e.target.value)}
                className={`status-select ${o.status}`}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </header>
            <ul>
              {o.items.map((i) => (
                <li key={i.product}>
                  <span>{i.name} × {i.qty}</span>
                  <span>{money(i.price * i.qty)}</span>
                </li>
              ))}
            </ul>
            <footer>
              <span className="muted small">
                {o.shippingAddress.fullName}, {o.shippingAddress.address}, {o.shippingAddress.city} {o.shippingAddress.postalCode} · {o.shippingAddress.phone}
              </span>
              <strong>{money(o.total)}</strong>
            </footer>
          </article>
        ))}
      </div>
    </div>
  );
}
