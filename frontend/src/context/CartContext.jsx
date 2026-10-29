import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

const readCart = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem("cart") || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const add = (product, qty = 1) => {
    setItems((prev) => {
      const found = prev.find((i) => i.product === product._id);
      const limit = product.stock;
      if (found) {
        return prev.map((i) =>
          i.product === product._id ? { ...i, stock: limit, qty: Math.min(limit, i.qty + qty) } : i
        );
      }
      return [
        ...prev,
        {
          product: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          stock: limit,
          qty: Math.min(limit, qty),
        },
      ];
    });
  };

  const setQty = (id, qty) =>
    setItems((prev) =>
      prev.map((i) => (i.product === id ? { ...i, qty: Math.max(1, Math.min(i.stock, qty)) } : i))
    );

  const remove = (id) => setItems((prev) => prev.filter((i) => i.product !== id));
  const clear = () => setItems([]);

  const value = useMemo(
    () => ({
      items,
      add,
      setQty,
      remove,
      clear,
      count: items.reduce((n, i) => n + i.qty, 0),
      total: items.reduce((n, i) => n + i.price * i.qty, 0),
    }),
    [items]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
