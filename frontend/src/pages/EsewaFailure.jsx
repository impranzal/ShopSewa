import { Link } from 'react-router-dom';

export default function EsewaFailure() {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
      <h1>Payment Cancelled or Failed</h1>
      <p>Your eSewa payment was not completed. You can try again from your orders page.</p>
      <Link to="/orders" className="btn">My Orders</Link>
    </div>
  );
}
