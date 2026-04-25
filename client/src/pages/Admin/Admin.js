import React, { useState, useEffect } from 'react';
import { getAdminStats, getAdminOrders, updateOrderStatus } from '../../services/api';
import toast from 'react-hot-toast';
import './Admin.css';

const STATUS_OPTIONS = ['Placed', 'Confirmed', 'Shipped', 'OutForDelivery', 'Delivered', 'Cancelled'];
const STATUS_CLASS = { Placed: 'badge-placed', Confirmed: 'badge-confirmed', Shipped: 'badge-shipped', OutForDelivery: 'badge-shipped', Delivered: 'badge-delivered', Cancelled: 'badge-cancelled' };

const Admin = () => {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([getAdminStats(), getAdminOrders()]);
        setStats(statsRes.data);
        setOrders(ordersRes.data.orders || []);
      } catch {} finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleStatusChange = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, { status });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
      toast.success(`Order updated to ${status}`);
    } catch { toast.error('Failed to update'); }
  };

  const maxRevenue = stats?.revenueChart ? Math.max(...stats.revenueChart.map(d => d.revenue), 1) : 1;

  if (loading) return (
    <div className="admin-page page">
      <h2 className="page-title">Admin Dashboard</h2>
      <div className="admin-stats">
        {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 12 }} />)}
      </div>
    </div>
  );

  return (
    <div className="admin-page page" id="admin-page">
      <h2 className="page-title">📊 Admin Dashboard</h2>

      {/* Stats */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">📦</div>
          <div className="admin-stat-value">{stats?.totalOrders || 0}</div>
          <div className="admin-stat-label">Total Orders</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon">💰</div>
          <div className="admin-stat-value">₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}</div>
          <div className="admin-stat-label">Total Revenue</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon">🛍️</div>
          <div className="admin-stat-value">{stats?.totalProducts || 0}</div>
          <div className="admin-stat-label">Total Products</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon">📈</div>
          <div className="admin-stat-value">{stats?.revenueChart?.reduce((s, d) => s + d.orders, 0) || 0}</div>
          <div className="admin-stat-label">Orders This Week</div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="admin-chart">
        <h3>Revenue — Last 7 Days</h3>
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

      {/* Recent Orders */}
      <div className="admin-orders">
        <h3>Recent Orders ({orders.length})</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 20).map(order => (
                <tr key={order._id}>
                  <td><strong>{order._id.slice(-8).toUpperCase()}</strong></td>
                  <td>{order.user?.name || 'N/A'}</td>
                  <td>{order.items?.length || 0}</td>
                  <td>₹{order.totalAmount?.toLocaleString('en-IN')}</td>
                  <td><span className={`badge ${STATUS_CLASS[order.status]}`}>{order.status}</span></td>
                  <td>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    <select value={order.status} onChange={e => handleStatusChange(order._id, e.target.value)}>
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders.length === 0 && <p style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)' }}>No orders yet</p>}
      </div>
    </div>
  );
};

export default Admin;
