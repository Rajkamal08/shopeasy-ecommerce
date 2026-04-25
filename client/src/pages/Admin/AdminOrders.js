import React, { useState, useEffect } from 'react';
import { getAdminOrders, updateOrderStatus } from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['Placed', 'Confirmed', 'Shipped', 'OutForDelivery', 'Delivered', 'Cancelled'];
const STATUS_CLASS = { Placed: 'badge-placed', Confirmed: 'badge-confirmed', Shipped: 'badge-shipped', OutForDelivery: 'badge-shipped', Delivered: 'badge-delivered', Cancelled: 'badge-cancelled' };

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await getAdminOrders();
        setOrders(data.orders || []);
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

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  if (loading) return (
    <div className="admin-table-card">
      {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 50, margin: 8, borderRadius: 8 }} />)}
    </div>
  );

  return (
    <>
      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all', ...STATUS_OPTIONS].map(s => (
          <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter(s)} style={{ textTransform: 'capitalize' }}>
            {s === 'all' ? `All (${orders.length})` : `${s} (${orders.filter(o => o.status === s).length})`}
          </button>
        ))}
      </div>

      <div className="admin-table-card">
        <div className="admin-table-header">
          <h3>Order List — {filteredOrders.length} orders</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Email</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order._id}>
                  <td><strong style={{ color: '#0f172a' }}>{order._id.slice(-8).toUpperCase()}</strong></td>
                  <td>{order.user?.name || 'N/A'}</td>
                  <td style={{ color: '#64748b', fontSize: '0.78rem' }}>{order.user?.email || 'N/A'}</td>
                  <td>{order.items?.length || 0}</td>
                  <td><strong>₹{order.totalAmount?.toLocaleString('en-IN')}</strong></td>
                  <td>
                    <span className={`badge ${order.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td><span className={`badge ${STATUS_CLASS[order.status]}`}>{order.status}</span></td>
                  <td style={{ color: '#64748b', fontSize: '0.78rem' }}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
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
        {filteredOrders.length === 0 && <div className="admin-table-empty">No orders found</div>}
      </div>
    </>
  );
};

export default AdminOrders;
