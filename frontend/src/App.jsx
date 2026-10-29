import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Orders from "./pages/Orders.jsx";
import Login from "./pages/Login.jsx";
import AdminProducts from "./pages/admin/AdminProducts.jsx";
import AdminOrders from "./pages/admin/AdminOrders.jsx";

function RequireAuth({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function RequireAdmin({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return user.role === "admin" ? children : <Navigate to="/" replace />;
}

export default function App() {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <main className="page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
          <Route path="/orders" element={<RequireAuth><Orders /></RequireAuth>} />
          <Route path="/admin" element={<RequireAdmin><AdminProducts /></RequireAdmin>} />
          <Route path="/admin/orders" element={<RequireAdmin><AdminOrders /></RequireAdmin>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
