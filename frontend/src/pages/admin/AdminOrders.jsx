import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const STATUSES = ['processing', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders/all');
      setOrders(res.data || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load orders.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const updateOrder = async (id, changes) => {
    try {
      await api.put(`/orders/${id}/status`, changes);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update order.');
    }
  };

  const visibleOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesFilter = filter === 'all' || order.orderStatus === filter;
      const matchesSearch = !query
        || order._id.toLowerCase().includes(query)
        || order.user?.name?.toLowerCase().includes(query)
        || order.user?.email?.toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [orders, filter, search]);

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Manage Orders</h1>
          <p>{orders.length} total orders • {visibleOrders.length} shown</p>
        </div>
        <button className="btn" type="button" onClick={load} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      {error && <p className="notice error">{error}</p>}
      <div className="admin-filters">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search order, customer, or email"
          aria-label="Search orders"
        />
        <select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter orders">
          <option value="all">All statuses</option>
          {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
      </div>
      <table>
        <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Payment</th><th>Order status</th><th>Actions</th></tr></thead>
        <tbody>
          {visibleOrders.map((o) => (
            <tr key={o._id}>
              <td><Link to={`/orders/${o._id}`}>#{o._id.slice(-8)}</Link><br /><small>{new Date(o.createdAt).toLocaleDateString()}</small></td>
              <td>{o.user?.name || 'Unknown'}<br /><small>{o.user?.email}</small></td>
              <td>Rs. {o.totalPrice}</td>
              <td>
                {o.paymentMethod}
                <select value={o.paymentStatus} onChange={(e) => updateOrder(o._id, { paymentStatus: e.target.value })}>
                  {PAYMENT_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </td>
              <td>
                <select value={o.orderStatus} onChange={(e) => updateOrder(o._id, { orderStatus: e.target.value })}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
              <td><Link to={`/orders/${o._id}`}>View details</Link></td>
            </tr>
          ))}
          {!loading && visibleOrders.length === 0 && <tr><td colSpan="6">No matching orders.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
