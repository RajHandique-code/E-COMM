import { useCallback, useEffect, useState } from "react";
import api, { errorMessage, money } from "../../api.js";

const EMPTY = { name: "", category: "", price: "", stock: "", image: "", description: "" };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await api.get("/products", { params: { limit: 48, sort: "newest" } });
      setProducts(res.data.products);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const edit = (p) => {
    setEditingId(p._id);
    setForm({
      name: p.name,
      category: p.category,
      price: String(p.price),
      stock: String(p.stock),
      image: p.image || "",
      description: p.description || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancel = () => {
    setEditingId(null);
    setForm(EMPTY);
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (editingId) await api.put(`/products/${editingId}`, form);
      else await api.post("/products", form);
      cancel();
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete ${p.name}?`)) return;
    try {
      await api.delete(`/products/${p._id}`);
      if (editingId === p._id) cancel();
      await load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <div>
      <h1>Manage products</h1>
      <form className="form admin-form" onSubmit={submit}>
        <h2>{editingId ? "Edit product" : "Add product"}</h2>
        <div className="row">
          <label>Name<input value={form.name} onChange={set("name")} required /></label>
          <label>Category<input value={form.category} onChange={set("category")} required /></label>
        </div>
        <div className="row">
          <label>Price (₹)<input type="number" min="0" step="0.01" value={form.price} onChange={set("price")} required /></label>
          <label>Stock<input type="number" min="0" step="1" value={form.stock} onChange={set("stock")} required /></label>
        </div>
        <label>Image URL<input value={form.image} onChange={set("image")} placeholder="https://..." /></label>
        <label>Description<textarea rows="3" value={form.description} onChange={set("description")} /></label>
        {error && <p className="error">{error}</p>}
        <div className="row">
          <button className="primary" disabled={busy}>{busy ? "Saving" : editingId ? "Save changes" : "Add product"}</button>
          {editingId && <button type="button" className="ghost" onClick={cancel}>Cancel</button>}
        </div>
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan="5" className="muted">Loading products</td></tr>}
            {!loading && products.length === 0 && <tr><td colSpan="5" className="muted">No products yet. Add the first one above.</td></tr>}
            {products.map((p) => (
              <tr key={p._id}>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>{money(p.price)}</td>
                <td className={p.stock === 0 ? "error" : ""}>{p.stock}</td>
                <td className="actions">
                  <button className="link" onClick={() => edit(p)}>Edit</button>
                  <button className="link danger" onClick={() => remove(p)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
