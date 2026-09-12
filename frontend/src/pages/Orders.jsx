import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get('/orders/mine').then((res) => setOrders(res.data));
  }, []);

  return (
    <div>
      <h1>My Orders</h1>
      {orders.length === 0 && <p>No orders yet.</p>}
      <table>
        <thead>
          <tr><th>Order ID</th><th>Total</th><th>Payment</th><th>Status</th><th>Placed</th></tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id}>
              <td><Link to={`/orders/${o._id}`}>{o._id.slice(-8)}</Link></td>
              <td>Rs. {o.totalPrice}</td>
              <td>{o.paymentMethod} ({o.paymentStatus})</td>
              <td>{o.orderStatus}</td>
              <td>{new Date(o.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
