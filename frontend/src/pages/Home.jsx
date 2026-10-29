import { useEffect, useState } from "react";
import api, { errorMessage } from "../api.js";
import ProductCard from "../components/ProductCard.jsx";

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "priceAsc", label: "Price: low to high" },
  { value: "priceDesc", label: "Price: high to low" },
  { value: "name", label: "Name" },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/products/categories").then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setQ(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api
      .get("/products", { params: { q, category, minPrice, maxPrice, sort, page, limit: 12 } })
      .then((res) => {
        if (!active) return;
        setProducts(res.data.products);
        setMeta({ total: res.data.total, pages: res.data.pages });
      })
      .catch((err) => active && setError(errorMessage(err)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [q, category, minPrice, maxPrice, sort, page]);

  const reset = () => {
    setSearch("");
    setQ("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    setPage(1);
  };

  const change = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  return (
    <div className="shop">
      <aside className="filters">
        <h2>Filters</h2>
        <label>
          Search
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products" />
        </label>
        <label>
          Category
          <select value={category} onChange={change(setCategory)}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <div className="row">
          <label>
            Min price
            <input type="number" min="0" value={minPrice} onChange={change(setMinPrice)} />
          </label>
          <label>
            Max price
            <input type="number" min="0" value={maxPrice} onChange={change(setMaxPrice)} />
          </label>
        </div>
        <label>
          Sort by
          <select value={sort} onChange={change(setSort)}>
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </label>
        <button className="ghost" onClick={reset}>Clear filters</button>
      </aside>

      <section>
        <p className="muted result-count">{loading ? "Loading products" : `${meta.total} products`}</p>
        {error && <p className="error">{error}</p>}
        {!loading && !error && products.length === 0 && (
          <div className="empty">
            <h3>No products match</h3>
            <p className="muted">Try a different search or clear the filters.</p>
            <button className="primary" onClick={reset}>Clear filters</button>
          </div>
        )}
        <div className="grid">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
        {meta.pages > 1 && (
          <div className="pager">
            <button className="ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
            <span className="muted">Page {page} of {meta.pages}</span>
            <button className="ghost" disabled={page >= meta.pages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        )}
      </section>
    </div>
  );
}
