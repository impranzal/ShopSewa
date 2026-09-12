import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';

export default function EsewaSuccess() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    const data = searchParams.get('data');
    if (!data) {
      setStatus('error');
      return;
    }
    api
      .get(`/payments/esewa/verify?data=${encodeURIComponent(data)}`)
      .then((res) => {
        setStatus('success');
        setOrderId(res.data.order._id);
      })
      .catch(() => setStatus('error'));
  }, [searchParams]);

  if (status === 'verifying') return <p>Verifying your payment...</p>;
  if (status === 'error') {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h1>Payment Verification Failed</h1>
        <p>We couldn't confirm your payment. Please check your orders or contact support.</p>
        <Link to="/orders" className="btn">My Orders</Link>
      </div>
    );
  }

  return (
    <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
      <h1>Payment Successful!</h1>
      <p>Your order has been confirmed.</p>
      <Link to={`/orders/${orderId}`} className="btn">View Order</Link>
    </div>
  );
}
