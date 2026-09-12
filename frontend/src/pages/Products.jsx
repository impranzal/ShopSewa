import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { getProductImage } from '../utils/productImage';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data || [])).catch(() => setError('Unable to load categories.'));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (sort) params.set('sort', sort);
    setLoading(true);
    api.get(`/products?${params.toString()}`)
      .then((res) => { setProducts(res.data.products || []); setError(''); })
      .catch(() => setError('Unable to load products. Please try again.'))
      .finally(() => setLoading(false));
  }, [search, category, sort]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          placeholder="Search products..."
          defaultValue={search}
          onKeyDown={(e) => e.key === 'Enter' && updateParam('search', e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: '0.6rem', borderRadius: 6, border: '1px solid #ccc' }}
        />
        <select value={category} onChange={(e) => updateParam('category', e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option value={c._id} key={c._id}>{c.name}</option>
          ))}
        </select>
        <select value={sort} onChange={(e) => updateParam('sort', e.target.value)}>
          <option value="newest">Newest</option>
          <option value="priceAsc">Price: Low to High</option>
          <option value="priceDesc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      <div className="product-grid">
        {products.map((p) => (
          <Link to={`/products/${p.slug}`} key={p._id} className="card product-card">
            {p.discountPrice > 0 && <span className="badge">SALE</span>}
            <img src={getProductImage(p, 600)} alt={p.name} />
            <h3>{p.name}</h3>
            <span className="price">Rs. {p.discountPrice > 0 ? p.discountPrice : p.price}</span>
            {p.discountPrice > 0 && <span className="old-price">Rs. {p.price}</span>}
          </Link>
        ))}
        {loading && <p className="notice">Loading products...</p>}
        {!loading && error && <p className="notice error">{error}</p>}
        {!loading && !error && products.length === 0 && <p className="notice">No products found.</p>}
      </div>
    </div>
  );
}
