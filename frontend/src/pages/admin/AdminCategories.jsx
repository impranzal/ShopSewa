import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load categories.');
    }
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/categories', form);
      setForm({ name: '', description: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to add category.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/categories/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete category.');
    }
  };

  return (
    <div>
      <h1>Manage Categories</h1>
      {error && <p className="notice error">{error}</p>}
      <form className="auth-form" onSubmit={handleSubmit}>
        <input placeholder="Category name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button className="btn" type="submit">Add Category</button>
      </form>

      <table>
        <thead><tr><th>Name</th><th></th></tr></thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c._id}>
              <td>{c.name}</td>
              <td><a onClick={() => handleDelete(c._id)} style={{ cursor: 'pointer', color: 'crimson' }}>Delete</a></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
