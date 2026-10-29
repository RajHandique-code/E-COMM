import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { errorMessage, money } from "../api.js";

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/orders/mine")
      .then((res) => setOrders(res.data))
      .catch((err) => setError(errorMessage(err)));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!orders) return <p className="muted">Loading orders</p>;
  if (orders.length === 0) {
    return (
      <div className="empty">
        <h3>No orders yet</h3>
        <Link to="/" className="primary-link">Start shopping</Link>
      </div>
    );
  }

  return (
    <div>
      <h1>My orders</h1>
      <div className="order-list">
        {orders.map((o) => (
          <article className="order" key={o._id}>
            <header>
              <div>
                <strong>Order {o._id.slice(-8).toUpperCase()}</strong>
                <span className="muted small">{new Date(o.createdAt).toLocaleString()}</span>
              </div>
              <span className={`status ${o.status}`}>{o.status}</span>
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
              <span className="muted small">{o.shippingAddress.address}, {o.shippingAddress.city}</span>
              <strong>{money(o.total)}</strong>
            </footer>
          </article>
        ))}
      </div>
    </div>
  );
}
