import { Link, useNavigate } from "react-router-dom";
import { money } from "../api.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import ProductImage from "../components/ProductImage.jsx";

export default function Cart() {
  const { items, setQty, remove, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="empty">
        <h3>Your cart is empty</h3>
        <p className="muted">Add something from the shop to get started.</p>
        <Link to="/" className="primary-link">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="cart">
      <h1>Your cart</h1>
      <div className="cart-layout">
        <ul className="cart-list">
          {items.map((i) => (
            <li key={i.product}>
              <div className="thumb"><ProductImage product={i} /></div>
              <div className="cart-info">
                <Link to={`/product/${i.product}`}>{i.name}</Link>
                <span className="muted">{money(i.price)} each</span>
                <button className="link danger" onClick={() => remove(i.product)}>Remove</button>
              </div>
              <div className="stepper">
                <button onClick={() => setQty(i.product, i.qty - 1)} aria-label="Decrease">−</button>
                <span>{i.qty}</span>
                <button onClick={() => setQty(i.product, i.qty + 1)} disabled={i.qty >= i.stock} aria-label="Increase">+</button>
              </div>
              <strong>{money(i.price * i.qty)}</strong>
            </li>
          ))}
        </ul>
        <aside className="summary">
          <h2>Order summary</h2>
          <div className="line"><span>Subtotal</span><strong>{money(total)}</strong></div>
          <div className="line muted"><span>Shipping</span><span>Free</span></div>
          <div className="line total"><span>Total</span><strong>{money(total)}</strong></div>
          <button className="primary wide" onClick={() => navigate(user ? "/checkout" : "/login")}>
            {user ? "Proceed to checkout" : "Sign in to checkout"}
          </button>
        </aside>
      </div>
    </div>
  );
}
