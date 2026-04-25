import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompare } from '../../context/CompareContext';
import './CompareBar.css';

const CompareBar = () => {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const navigate = useNavigate();

  if (compareList.length < 2) return null;

  return (
    <div className="compare-bar">
      <div className="compare-bar-items">
        <span style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600 }}>COMPARE ({compareList.length})</span>
        {compareList.map(p => (
          <div className="compare-bar-item" key={p._id}>
            <img src={p.images?.[0] || 'https://picsum.photos/50/50'} alt="" />
            <span>{p.title?.substring(0, 20)}</span>
            <button onClick={() => removeFromCompare(p._id)}>✕</button>
          </div>
        ))}
      </div>
      <div className="compare-bar-actions">
        <button className="compare-bar-clear" onClick={clearCompare}>Clear All</button>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/compare')}>Compare Now →</button>
      </div>
    </div>
  );
};

export default CompareBar;
