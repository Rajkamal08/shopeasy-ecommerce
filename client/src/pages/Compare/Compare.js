import React from 'react';
import { Link } from 'react-router-dom';
import { useCompare } from '../../context/CompareContext';
import { useCart } from '../../context/CartContext';
import StarRating from '../../components/StarRating';
import '../../components/CompareBar/CompareBar.css';

const Compare = () => {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const { addItem } = useCart();

  if (compareList.length < 2) {
    return (
      <div className="compare-page page">
        <div className="compare-empty">
          <div className="compare-empty-icon">⚖️</div>
          <h2>Not enough products to compare</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '8px 0 24px' }}>
            Select at least 2 products from the Products page using the compare checkbox.
          </p>
          <Link to="/products" className="btn btn-primary">Browse Products</Link>
        </div>
      </div>
    );
  }

  const prices = compareList.map(p => p.price);
  const ratings = compareList.map(p => p.averageRating || 0);
  const discounts = compareList.map(p => p.discount || 0);
  const bestPrice = Math.min(...prices);
  const bestRating = Math.max(...ratings);
  const bestDiscount = Math.max(...discounts);

  const isBest = (val, best) => val === best ? 'best' : '';

  return (
    <div className="compare-page page" id="compare-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 className="page-title" style={{ marginBottom: 0 }}>⚖️ Product Comparison</h2>
        <button className="btn btn-outline btn-sm" onClick={clearCompare}>Clear All</button>
      </div>

      <div className="compare-table-wrap">
        <table className="compare-table">
          <tbody>
            <tr>
              <th>Product</th>
              {compareList.map(p => (
                <td key={p._id} style={{ textAlign: 'center' }}>
                  <Link to={`/product/${p._id}`}>
                    <img src={p.images?.[0] || 'https://picsum.photos/200/200'} alt={p.title} />
                  </Link>
                  <button className="compare-remove" onClick={() => removeFromCompare(p._id)}>Remove</button>
                </td>
              ))}
            </tr>
            <tr>
              <th>Title</th>
              {compareList.map(p => <td key={p._id} style={{ fontWeight: 600 }}>{p.title}</td>)}
            </tr>
            <tr>
              <th>Brand</th>
              {compareList.map(p => <td key={p._id}>{p.brand}</td>)}
            </tr>
            <tr>
              <th>Category</th>
              {compareList.map(p => <td key={p._id}><span className="badge badge-info">{p.category}</span></td>)}
            </tr>
            <tr>
              <th>Final Price</th>
              {compareList.map(p => (
                <td key={p._id} className={isBest(p.price, bestPrice)}>
                  <strong style={{ fontSize: '1.1rem' }}>₹{p.price?.toLocaleString('en-IN')}</strong>
                </td>
              ))}
            </tr>
            <tr>
              <th>Original Price</th>
              {compareList.map(p => (
                <td key={p._id} style={{ color: 'var(--text-hint)', textDecoration: 'line-through' }}>
                  ₹{p.originalPrice?.toLocaleString('en-IN')}
                </td>
              ))}
            </tr>
            <tr>
              <th>Discount</th>
              {compareList.map(p => (
                <td key={p._id} className={isBest(p.discount, bestDiscount)}>
                  <span style={{ color: 'var(--success)', fontWeight: 600 }}>{p.discount}% off</span>
                </td>
              ))}
            </tr>
            <tr>
              <th>Rating</th>
              {compareList.map(p => (
                <td key={p._id} className={isBest(p.averageRating, bestRating)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <StarRating rating={p.averageRating} size={14} />
                    <span>{p.averageRating?.toFixed(1)} ({p.numReviews})</span>
                  </div>
                </td>
              ))}
            </tr>
            <tr>
              <th>Stock</th>
              {compareList.map(p => (
                <td key={p._id}>
                  <span className={`badge ${p.stock === 0 ? 'badge-danger' : p.stock <= 5 ? 'badge-warning' : 'badge-success'}`}>
                    {p.stock === 0 ? 'Out of Stock' : `${p.stock} in stock`}
                  </span>
                </td>
              ))}
            </tr>
            <tr>
              <th>Description</th>
              {compareList.map(p => (
                <td key={p._id} style={{ fontSize: '0.82rem', lineHeight: 1.5, maxWidth: 300 }}>
                  {p.description?.substring(0, 200)}...
                </td>
              ))}
            </tr>
            <tr>
              <th>Action</th>
              {compareList.map(p => (
                <td key={p._id}>
                  <button className="btn btn-primary btn-sm" onClick={() => addItem(p._id, 1)} disabled={p.stock === 0}>
                    Add to Cart
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Compare;
