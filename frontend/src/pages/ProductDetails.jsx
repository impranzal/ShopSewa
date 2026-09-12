import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { getProductImage } from '../utils/productImage';

export default function ProductDetails() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setProduct(null);
    setError('');
    api.get(`/products/${slug}`).then((res) => {
      setProduct(res.data);
      return api.get(`/products/related/${res.data._id}`)
        .then((relatedResponse) => setRelated(relatedResponse.data || []))
        .catch(() => setRelated([]));
    }).catch(() => setError('This product is unavailable right now.'));
  }, [slug]);

  if (error) return <p className="notice error">{error} <Link to="/products">Browse all products</Link>.</p>;
  if (!product) return <p>Loading...</p>;

  return (
    <div>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <img
          src={getProductImage(product, 800)}
          alt={product.name}
          style={{ width: 350, height: 280, objectFit: 'cover', borderRadius: 10 }}
        />
        <div style={{ flex: 1, minWidth: 260 }}>
          <h1>{product.name}</h1>
          <p style={{ color: '#666' }}>{product.category?.name} • {product.brand}</p>
          <p>
            <span className="price" style={{ fontSize: '1.3rem' }}>
              Rs. {product.discountPrice > 0 ? product.discountPrice : product.price}
            </span>
            {product.discountPrice > 0 && <span className="old-price">Rs. {product.price}</span>}
          </p>
          <p>{product.description}</p>
          <p className={`stock-note ${product.stock === 0 ? 'out' : ''}`}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </p>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <input
              type="number"
              min="1"
              max={product.stock}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              style={{ width: 60, padding: '0.5rem' }}
            />
            <button
              className="btn"
              disabled={product.stock === 0}
              onClick={() => {
                addToCart(product, qty);
                setAdded(true);
                setTimeout(() => setAdded(false), 1500);
              }}
            >
              {added ? 'Added!' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <>
          <h2 style={{ marginTop: '2rem' }}>You may also like</h2>
          <div className="product-grid">
            {related.map((p) => (
              <Link to={`/products/${p.slug}`} key={p._id} className="card product-card">
                <img src={getProductImage(p, 600)} alt={p.name} />
                <h3>{p.name}</h3>
                <span className="price">Rs. {p.discountPrice > 0 ? p.discountPrice : p.price}</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
