import React, { useState, useEffect } from 'react';
import { getAdminStats } from '../../services/api';

const STATUS_COLORS = {
  Placed: '#3b82f6',
  Confirmed: '#8b5cf6',
  Shipped: '#f59e0b',
  OutForDelivery: '#f97316',
  Delivered: '#10b981',
  Cancelled: '#ef4444',
};

const CAT_COLORS = {
  Electronics: '#3b82f6',
  Fashion: '#8b5cf6',
  'Home & Kitchen': '#f59e0b',
  Sports: '#10b981',
  Books: '#ec4899',
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await getAdminStats();
        setStats(data);
      } catch {} finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const maxRevenue = stats?.revenueChart ? Math.max(...stats.revenueChart.map(d => d.revenue), 1) : 1;

  if (loading) return (
    <>
      <div className="admin-stats">
        {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 130, borderRadius: 14 }} />)}
      </div>
      <div className="skeleton" style={{ height: 280, borderRadius: 14, marginTop: 20 }} />
    </>
  );

  const totalStatusOrders = Object.values(stats?.statusCounts || {}).reduce((a, b) => a + b, 0) || 1;
  const maxCatRevenue = Math.max(...Object.values(stats?.categoryRevenue || { a: 1 }), 1);

  return (
    <>
      {/* ═══ STATS CARDS ═══ */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-header"><div className="admin-stat-icon">📦</div></div>
          <div className="admin-stat-value">{stats?.totalOrders || 0}</div>
          <div className="admin-stat-label">Total Orders</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header"><div className="admin-stat-icon">💰</div></div>
          <div className="admin-stat-value">₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}</div>
          <div className="admin-stat-label">Total Revenue</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header"><div className="admin-stat-icon">🛍️</div></div>
          <div className="admin-stat-value">{stats?.totalProducts || 0}</div>
          <div className="admin-stat-label">Total Products</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header"><div className="admin-stat-icon">🧾</div></div>
          <div className="admin-stat-value">₹{(stats?.avgOrderValue || 0).toLocaleString('en-IN')}</div>
          <div className="admin-stat-label">Avg Order Value</div>
        </div>
      </div>

      {/* ═══ CHARTS ROW ═══ */}
      <div className="analytics-row">
        {/* Revenue Bar Chart */}
        <div className="admin-chart">
          <h3>📊 Revenue — Last 7 Days</h3>
          <div className="admin-chart-bars">
            {stats?.revenueChart?.map((day, i) => (
              <div className="admin-chart-bar" key={i}>
                <div className="admin-chart-bar-value">
                  {day.revenue > 0 ? `₹${(day.revenue / 1000).toFixed(1)}K` : '—'}
                </div>
                <div className="admin-chart-bar-fill" style={{ height: `${Math.max((day.revenue / maxRevenue) * 160, 4)}px` }} />
                <div className="admin-chart-bar-label">{day.date}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Status Donut */}
        <div className="admin-chart analytics-status-chart">
          <h3>📈 Order Status Distribution</h3>
          <div className="status-donut-wrap">
            <div className="status-bars">
              {Object.entries(stats?.statusCounts || {}).map(([status, count]) => (
                <div className="status-bar-row" key={status}>
                  <div className="status-bar-label">
                    <span className="status-dot" style={{ background: STATUS_COLORS[status] || '#94a3b8' }}></span>
                    {status}
                  </div>
                  <div className="status-bar-track">
                    <div className="status-bar-fill" style={{
                      width: `${(count / totalStatusOrders) * 100}%`,
                      background: STATUS_COLORS[status] || '#94a3b8'
                    }}></div>
                  </div>
                  <span className="status-bar-count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ SECOND ROW ═══ */}
      <div className="analytics-row">
        {/* Category Revenue */}
        <div className="admin-chart">
          <h3>🗂️ Revenue by Category</h3>
          <div className="cat-revenue-bars">
            {Object.entries(stats?.categoryRevenue || {}).map(([cat, revenue]) => (
              <div className="cat-bar-row" key={cat}>
                <div className="cat-bar-label">{cat}</div>
                <div className="cat-bar-track">
                  <div className="cat-bar-fill" style={{
                    width: `${(revenue / maxCatRevenue) * 100}%`,
                    background: CAT_COLORS[cat] || '#6366f1'
                  }}></div>
                </div>
                <span className="cat-bar-amount">₹{revenue.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="admin-chart">
          <h3>🏆 Top Selling Products</h3>
          <div className="top-products-list">
            {stats?.topProducts?.length > 0 ? stats.topProducts.map((p, i) => (
              <div className="top-product-item" key={i}>
                <span className="top-product-rank">#{i + 1}</span>
                <img src={p.image || 'https://picsum.photos/40/40'} alt="" className="top-product-img" />
                <div className="top-product-info">
                  <strong>{p.title?.substring(0, 30)}</strong>
                  <small>{p.qty} sold · ₹{p.revenue.toLocaleString('en-IN')}</small>
                </div>
              </div>
            )) : <p style={{ color: '#94a3b8', textAlign: 'center', padding: 20 }}>No sales data yet</p>}
          </div>
        </div>
      </div>

      {/* ═══ RECENT ORDERS ═══ */}
      <div className="admin-chart" style={{ marginTop: 20 }}>
        <h3>🕐 Recent Orders</h3>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentOrders?.length > 0 ? stats.recentOrders.map(order => (
                <tr key={order._id}>
                  <td>
                    <strong>{order.user?.name || 'Unknown'}</strong>
                    <br /><small style={{ color: '#94a3b8' }}>{order.user?.email}</small>
                  </td>
                  <td>{order.items?.length || 0} items</td>
                  <td><strong>₹{order.totalAmount?.toLocaleString('en-IN')}</strong></td>
                  <td>
                    <span className="admin-status-badge" style={{
                      background: `${STATUS_COLORS[order.status] || '#94a3b8'}18`,
                      color: STATUS_COLORS[order.status] || '#94a3b8',
                      border: `1px solid ${STATUS_COLORS[order.status] || '#94a3b8'}30`,
                    }}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5" style={{ textAlign: 'center', color: '#94a3b8', padding: 30 }}>No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
