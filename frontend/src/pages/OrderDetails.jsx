import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then((res) => setOrder(res.data));
  }, [id]);

  if (!order) return <p>Loading...</p>;

  return (
    <div>
      <h1>Order #{order._id.slice(-8)}</h1>
      <p>Status: <b>{order.orderStatus}</b> • Payment: {order.paymentMethod} ({order.paymentStatus})</p>
      <h3>Shipping Address</h3>
      <p>{order.shippingAddress.fullName}, {order.shippingAddress.address}, {order.shippingAddress.city}<br />{order.shippingAddress.phone}</p>
      <h3>Items</h3>
      <table>
        <thead><tr><th>Product</th><th>Price</th><th>Qty</th><th>Subtotal</th></tr></thead>
        <tbody>
          {order.items.map((i) => (
            <tr key={i.product}>
              <td>{i.name}</td>
              <td>Rs. {i.price}</td>
              <td>{i.quantity}</td>
              <td>Rs. {i.price * i.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>Total: Rs. {order.totalPrice}</h3>
    </div>
  );
}
