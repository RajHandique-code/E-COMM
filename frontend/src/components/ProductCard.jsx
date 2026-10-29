import { Link } from "react-router-dom";
import { money } from "../api.js";
import { useCart } from "../context/CartContext.jsx";
import ProductImage from "./ProductImage.jsx";

export default function ProductCard({ product }) {
  const { add } = useCart();
  const out = product.stock === 0;

  return (
    <article className="card">
      <Link to={`/product/${product._id}`} className="card-media">
        <ProductImage product={product} />
      </Link>
      <div className="card-body">
        <span className="muted small">{product.category}</span>
        <Link to={`/product/${product._id}`} className="card-title">{product.name}</Link>
        <div className="card-foot">
          <strong>{money(product.price)}</strong>
          <button className="primary small-btn" disabled={out} onClick={() => add(product)}>
            {out ? "Out of stock" : "Add to cart"}
          </button>
        </div>
      </div>
    </article>
  );
}
