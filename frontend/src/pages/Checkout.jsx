import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', phone: '', address: '', city: '' });
  const [paymentMethod, setPaymentMethod] = useState('esewa');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data: order } = await api.post('/orders', {
        items,
        shippingAddress: form,
        paymentMethod,
      });

      if (paymentMethod === 'esewa') {
        const { data: payment } = await api.post(`/payments/esewa/initiate/${order._id}`);
        clearCart();

        // Build and auto-submit a form to eSewa's payment URL
        const esewaForm = document.createElement('form');
        esewaForm.method = 'POST';
        esewaForm.action = payment.paymentUrl;
        Object.entries(payment.formData).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value;
          esewaForm.appendChild(input);
        });
        document.body.appendChild(esewaForm);
        esewaForm.submit();
      } else {
        clearCart();
        navigate(`/order-success/${order._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Checkout</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input name="fullName" placeholder="Full Name" onChange={handleChange} required />
        <input name="phone" placeholder="Phone Number" onChange={handleChange} required />
        <input name="address" placeholder="Street Address" onChange={handleChange} required />
        <input name="city" placeholder="City" onChange={handleChange} required />

        <label>
          <input type="radio" name="pm" checked={paymentMethod === 'esewa'} onChange={() => setPaymentMethod('esewa')} /> Pay with eSewa
        </label>
        <label>
          <input type="radio" name="pm" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} /> Cash on Delivery
        </label>

        <h3>Total: Rs. {total}</h3>
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
}
