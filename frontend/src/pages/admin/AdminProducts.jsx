import { useEffect, useState } from 'react';
import api from '../../services/api';
import { getProductImage } from '../../utils/productImage';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const emptyForm = { name: '', description: '', price: '', discountPrice: '', stock: '', category: '', brand: '', images: '', isFeatured: false };
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingImage, setEditingImage] = useState('');

  const load = () => {
    api.get('/products?limit=100').then((res) => setProducts(res.data.products));
    api.get('/categories').then((res) => setCategories(res.data));
  };

  useEffect(load, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : 0,
        stock: Number(form.stock),
        images: form.images ? form.images.split(',').map((s) => s.trim()) : [],
      };
      if (payload.discountPrice > 0 && payload.discountPrice >= payload.price) {
        setError('Discounted price must be lower than the regular price.');
        return;
      }
      await api.post('/products', payload);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create product');
    }
  };

  const startEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice || '',
      stock: product.stock,
      category: product.category?._id || product.category || '',
      brand: product.brand || '',
      images: product.images?.join(', ') || '',
      isFeatured: Boolean(product.isFeatured),
    });
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    setError('');
    const payload = {
      ...form,
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : 0,
      stock: Number(form.stock),
      images: form.images ? form.images.split(',').map((s) => s.trim()) : [],
    };
    if (payload.discountPrice > 0 && payload.discountPrice >= payload.price) {
      setError('Discounted price must be lower than the regular price.');
      return;
    }
    try {
      await api.put(`/products/${editingId}`, payload);
      cancelEdit();
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const startImageEdit = (product) => {
    setEditingId(product._id);
    setEditingImage(getProductImage(product, 800));
    setError('');
  };

  const saveImage = async (id) => {
    const image = editingImage.trim();
    if (!image) {
      setError('Enter an image URL before saving.');
      return;
    }
    try {
      await api.put(`/products/${id}`, { images: [image] });
      setEditingId(null);
      setEditingImage('');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product image');
    }
  };

  return (
    <div>
      <h1>Manage Products</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input name="name" placeholder="Product name" value={form.name} onChange={handleChange} required />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required />
        <input name="price" type="number" min="0" step="0.01" placeholder="Regular price" value={form.price} onChange={handleChange} required />
        <input name="discountPrice" type="number" min="0" step="0.01" placeholder="Discounted price (optional)" value={form.discountPrice} onChange={handleChange} />
        <input name="stock" type="number" placeholder="Stock" value={form.stock} onChange={handleChange} required />
        <select name="category" value={form.category} onChange={handleChange} required>
          <option value="">Select category</option>
          {categories.map((c) => <option value={c._id} key={c._id}>{c.name}</option>)}
        </select>
        <input name="brand" placeholder="Brand" value={form.brand} onChange={handleChange} />
        <input name="images" placeholder="Image URL(s), comma-separated" value={form.images} onChange={handleChange} />
        <label><input name="isFeatured" type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> Show as featured product</label>
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
        {editingId ? (
          <div className="form-actions">
            <button className="btn" type="button" onClick={saveEdit}>Save product changes</button>
            <button className="text-button" type="button" onClick={cancelEdit}>Cancel</button>
          </div>
        ) : (
          <button className="btn" type="submit">Add Product</button>
        )}
      </form>

      <h2>Existing Products</h2>
      <table>
        <thead><tr><th>Image</th><th>Name</th><th>Price</th><th>Stock</th><th>Featured</th><th>Actions</th></tr></thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td><img className="admin-product-image" src={getProductImage(p, 160)} alt={p.name} /></td>
              <td>
                {p.name}
                {editingId === p._id && (
                  <div className="image-editor">
                    <input
                      value={editingImage}
                      onChange={(event) => setEditingImage(event.target.value)}
                      placeholder="Paste image URL"
                      aria-label={`Image URL for ${p.name}`}
                    />
                    <button className="btn" type="button" onClick={() => saveImage(p._id)}>Save image</button>
                    <button className="text-button" type="button" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                )}
              </td>
              <td>
                <span className="price">Rs. {p.discountPrice > 0 ? p.discountPrice : p.price}</span>
                {p.discountPrice > 0 && <><br /><small className="old-price">Rs. {p.price}</small></>}
              </td>
              <td>{p.stock}</td>
              <td>{p.isFeatured ? 'Yes' : 'No'}</td>
              <td>
                <button className="text-button" type="button" onClick={() => startEdit(p)}>Edit product</button>
                <button className="text-button" type="button" onClick={() => startImageEdit(p)}>Edit image</button>
                <button className="text-button danger" type="button" onClick={() => handleDelete(p._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
