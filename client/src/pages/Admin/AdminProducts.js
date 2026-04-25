import React, { useState, useEffect } from 'react';
import { getProducts } from '../../services/api';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await getProducts({ limit: 50 });
        setProducts(data.products || []);
        setTotal(data.total || 0);
      } catch {} finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="admin-table-card">
      {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 50, margin: 8, borderRadius: 8 }} />)}
    </div>
  );

  return (
    <div className="admin-table-card">
      <div className="admin-table-header">
        <h3>All Products — {total} total</h3>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Category</th>
              <th>Brand</th>
              <th>Price</th>
              <th>Original</th>
              <th>Discount</th>
              <th>Stock</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id}>
                <td>
                  <img src={p.images?.[0] || 'https://picsum.photos/50/50'} alt="" 
                    style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 6, background: '#f8fafc' }} />
                </td>
                <td><strong style={{ color: '#0f172a' }}>{p.title?.substring(0, 35)}{p.title?.length > 35 ? '...' : ''}</strong></td>
                <td><span className="badge badge-info">{p.category}</span></td>
                <td style={{ color: '#64748b' }}>{p.brand}</td>
                <td><strong>₹{p.price?.toLocaleString('en-IN')}</strong></td>
                <td style={{ color: '#94a3b8', textDecoration: 'line-through' }}>₹{p.originalPrice?.toLocaleString('en-IN')}</td>
                <td><span className="badge badge-success">{p.discount}%</span></td>
                <td>
                  <span className={`badge ${p.stock === 0 ? 'badge-danger' : p.stock <= 10 ? 'badge-warning' : 'badge-success'}`}>
                    {p.stock}
                  </span>
                </td>
                <td>⭐ {p.averageRating?.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {products.length === 0 && <div className="admin-table-empty">No products found</div>}
    </div>
  );
};

export default AdminProducts;
