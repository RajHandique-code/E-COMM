import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const signOut = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" className="brand">Shopfront</Link>
        <nav>
          <NavLink to="/" end>Shop</NavLink>
          {user?.role === "admin" && (
            <>
              <NavLink to="/admin" end>Products</NavLink>
              <NavLink to="/admin/orders">All orders</NavLink>
            </>
          )}
          {user && user.role !== "admin" && <NavLink to="/orders">My orders</NavLink>}
          <NavLink to="/cart">Cart{count > 0 && <span className="badge">{count}</span>}</NavLink>
          {user ? (
            <button className="link" onClick={signOut}>Sign out ({user.name.split(" ")[0]})</button>
          ) : (
            <NavLink to="/login">Sign in</NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
