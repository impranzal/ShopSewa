import { Link, useParams } from 'react-router-dom';

export default function OrderSuccess() {
  const { id } = useParams();
  return (
    <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
      <h1>Order Placed!</h1>
      <p>Your order has been placed successfully.</p>
      <Link to={`/orders/${id}`} className="btn">View Order</Link>
    </div>
  );
}
