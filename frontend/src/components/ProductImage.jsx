import { useState } from "react";

export default function ProductImage({ product }) {
  const [failed, setFailed] = useState(false);
  if (product.image && !failed) {
    return <img src={product.image} alt={product.name} onError={() => setFailed(true)} loading="lazy" />;
  }
  return <div className="placeholder-img">{product.name.charAt(0).toUpperCase()}</div>;
}
