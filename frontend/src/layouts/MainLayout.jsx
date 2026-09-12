import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function MainLayout() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div>
      <header className="navbar">
        <Link to="/" className="brand">
          <span className="mark">S</span>
          ShopSewa
        </Link>
        <nav>
          <Link to="/products">Products</Link>
          <Link to="/cart">Cart <span className="cart-pill">{items.length}</span></Link>
          {user ? (
            <>
              <Link to="/orders">My Orders</Link>
              {user.role === 'admin' && <Link to="/admin">Admin</Link>}
              <a onClick={handleLogout} style={{ cursor: 'pointer' }}>Logout</a>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </header>

      <main className="container" style={{ minHeight: '75vh', paddingTop: '1.5rem' }}>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="footer-grid">
          <div>
            <h4>ShopSewa</h4>
            <p style={{ color: '#b7bcd4', fontSize: '0.85rem' }}>
              An e-commerce platform with electronics, fashion, groceries, books, and more.
            </p>
          </div>
          <div>
            <h4>Shop</h4>
            <Link to="/products">All Products</Link>
            <Link to="/cart">Cart</Link>
          </div>
          <div>
            <h4>Account</h4>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            <Link to="/orders">My Orders</Link>
          </div>
        </div>
        <p className="footer-bottom">&copy; {new Date().getFullYear()} ShopSewa. Built for academic purposes.</p>
      </footer>
    </div>
  );
}
