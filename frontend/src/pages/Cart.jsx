import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const { items, removeFromCart, updateQuantity, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div>
        <h1>Your Cart</h1>
        <p>Your cart is empty. <Link to="/products">Browse products</Link></p>
      </div>
    );
  }

  return (
    <div>
      <h1>Your Cart</h1>
      <table>
        <thead>
          <tr><th>Product</th><th>Price</th><th>Qty</th><th>Subtotal</th><th></th></tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.product}>
              <td>{i.name}</td>
              <td>Rs. {i.price}</td>
              <td>
                <input
                  type="number"
                  min="1"
                  value={i.quantity}
                  onChange={(e) => updateQuantity(i.product, Number(e.target.value))}
                  style={{ width: 55 }}
                />
              </td>
              <td>Rs. {i.price * i.quantity}</td>
              <td><a onClick={() => removeFromCart(i.product)} style={{ cursor: 'pointer', color: 'crimson' }}>Remove</a></td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3 style={{ marginTop: '1rem' }}>Total: Rs. {total}</h3>
      <button
        className="btn"
        onClick={() => (user ? navigate('/checkout') : navigate('/login'))}
      >
        Proceed to Checkout
      </button>
    </div>
  );
}
