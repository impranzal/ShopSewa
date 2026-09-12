import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { getProductImage, heroImages } from '../utils/productImage';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    Promise.all([api.get('/products?limit=8&sort=newest'), api.get('/categories')])
      .then(([productsResponse, categoriesResponse]) => {
        if (!active) return;
        setProducts(productsResponse.data.products || []);
        setCategories(categoriesResponse.data || []);
      })
      .catch(() => {
        if (active) setError('We could not load the catalogue. Please check that the ShopSewa API is running.');
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    navigate(search.trim() ? `/products?search=${encodeURIComponent(search.trim())}` : '/products');
  };

  return (
    <div>
      <section className="hero">
        <div>
          <p className="eyebrow">Everything you need, one marketplace</p>
          <h1>Shop smarter with ShopSewa</h1>
          <p>Electronics, fashion, groceries, and books. Carefully selected for everyday life and delivered across Nepal.</p>
          <div className="hero-actions">
            <Link to="/products" className="btn">Start Shopping</Link>
            <Link to="/products?sort=rating" className="btn secondary">Top rated</Link>
          </div>
        </div>
        <div className="hero-collage">
          {heroImages.map((image, index) => (
            <img key={image} src={image} alt={['A modern watch', 'Curated clothing', 'Fresh groceries', 'Books and stationery'][index]} />
          ))}
        </div>
      </section>

      <form className="home-search" onSubmit={handleSearch}>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="What are you looking for?" aria-label="Search products" />
        <button className="btn" type="submit">Search</button>
      </form>

      <div className="category-strip">
        <Link to="/products" className="category-pill">All products</Link>
        {categories.map((c) => (
          <Link to={`/products?category=${c._id}`} key={c._id} className="category-pill">{c.name}</Link>
        ))}
      </div>

      <h2>New Arrivals</h2>
      {error && <p className="notice error">{error}</p>}
      {loading && <p className="notice">Loading the latest products...</p>}
      {!loading && !error && products.length === 0 && <p className="notice">Our shelves are being stocked. Check back soon.</p>}
      <div className="product-grid" aria-busy={loading}>
        {products.map((p) => (
          <Link to={`/products/${p.slug}`} key={p._id} className="card product-card">
            {p.discountPrice > 0 && <span className="badge">SALE</span>}
            <img src={getProductImage(p, 600)} alt={p.name} />
            <h3>{p.name}</h3>
            <span className="price">Rs. {p.discountPrice > 0 ? p.discountPrice : p.price}</span>
            {p.discountPrice > 0 && <span className="old-price">Rs. {p.price}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}
