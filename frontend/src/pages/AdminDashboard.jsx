import { Link, Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const location = useLocation();
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h3>Admin Panel</h3>
        <Link to="/admin/products">Products</Link>
        <Link to="/admin/categories">Categories</Link>
        <Link to="/admin/orders">Orders</Link>
      </aside>
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}
