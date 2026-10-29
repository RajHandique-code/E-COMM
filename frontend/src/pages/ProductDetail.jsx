import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { errorMessage, money } from "../api.js";
import { useCart } from "../context/CartContext.jsx";
import ProductImage from "../components/ProductImage.jsx";

export default function ProductDetail() {
  const { id } = useParams();
  const { add } = useCart();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    setProduct(null);
    setError("");
    api
      .get(`/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch((err) => setError(errorMessage(err)));
  }, [id]);

  if (error) {
    return (
      <div className="empty">
        <h3>{error}</h3>
        <Link to="/" className="primary-link">Back to shop</Link>
      </div>
    );
  }
  if (!product) return <p className="muted">Loading product</p>;

  const out = product.stock === 0;

  return (
    <div className="detail">
      <div className="detail-media"><ProductImage product={product} /></div>
      <div className="detail-info">
        <span className="muted">{product.category}</span>
        <h1>{product.name}</h1>
        <p className="price">{money(product.price)}</p>
        <p>{product.description || "No description provided."}</p>
        <p className={out ? "error" : "muted"}>{out ? "Out of stock" : `${product.stock} in stock`}</p>
        {!out && (
          <div className="row">
            <label className="qty">
              Quantity
              <input
                type="number"
                min="1"
                max={product.stock}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Math.min(product.stock, Number(e.target.value) || 1)))}
              />
            </label>
          </div>
        )}
        <div className="row">
          <button className="primary" disabled={out} onClick={() => add(product, qty)}>Add to cart</button>
          <button
            className="ghost"
            disabled={out}
            onClick={() => {
              add(product, qty);
              navigate("/cart");
            }}
          >
            Buy now
          </button>
        </div>
      </div>
    </div>
  );
}
