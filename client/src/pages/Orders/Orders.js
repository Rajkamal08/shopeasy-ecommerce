import React, { useState, useEffect } from 'react';
import { getMyOrders, cancelOrder } from '../../services/api';
import toast from 'react-hot-toast';
import './Orders.css';

const STATUS_FLOW = ['Placed', 'Confirmed', 'Shipped', 'OutForDelivery', 'Delivered'];
const STATUS_CLASS = { Placed: 'badge-placed', Confirmed: 'badge-confirmed', Shipped: 'badge-shipped', OutForDelivery: 'badge-shipped', Delivered: 'badge-delivered', Cancelled: 'badge-cancelled' };

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getMyOrders();
        setOrders(data);
      } catch {} finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleCancel = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await cancelOrder(orderId);
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: 'Cancelled' } : o));
      toast.success('Order cancelled');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cannot cancel');
    }
  };

  if (loading) return (
    <div className="orders-page page">
      <h2 className="page-title">My Orders</h2>
      {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 120, marginBottom: 12, borderRadius: 8 }} />)}
    </div>
  );

  return (
    <div className="orders-page page" id="orders-page">
      <h2 className="page-title">My Orders ({orders.length})</h2>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h3>No orders yet</h3>
          <p>Start shopping to see your orders here</p>
        </div>
      ) : orders.map(order => {
        const statusIdx = STATUS_FLOW.indexOf(order.status);
        return (
          <div className="order-card" key={order._id}>
            <div className="order-card-header">
              <div>
                <span>Order ID: </span>
                <strong>{order._id.slice(-8).toUpperCase()}</strong>
              </div>
              <div>
                <span>Placed: </span>
                <strong>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
              </div>
              <span className={`badge ${STATUS_CLASS[order.status] || 'badge-info'}`}>{order.status}</span>
            </div>

            <div className="order-card-body">
              <div className="order-items-preview">
                {order.items?.slice(0, 3).map((item, i) => (
                  <div className="order-item-mini" key={i}>
                    <img src={item.image || 'https://picsum.photos/50/50'} alt="" />
                    <span>{item.title?.substring(0, 25)}...</span>
                    <span style={{ color: 'var(--text-secondary)' }}>×{item.quantity}</span>
                  </div>
                ))}
                {order.items?.length > 3 && <span className="order-item-mini">+{order.items.length - 3} more</span>}
              </div>

              {expanded === order._id && order.status !== 'Cancelled' && (
                <div className="order-timeline">
                  {STATUS_FLOW.map((s, i) => (
                    <div className="order-tl-step" key={s}>
                      <div className={`order-tl-dot ${i < statusIdx ? 'active' : ''} ${i === statusIdx ? 'current' : ''}`}>
                        {i <= statusIdx ? '✓' : ''}
                      </div>
                      <div className={`order-tl-line ${i < statusIdx ? 'active' : ''}`} />
                      <span className="order-tl-label">{s === 'OutForDelivery' ? 'Out for Delivery' : s}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="order-footer">
                <strong style={{ fontSize: '1rem' }}>₹{order.totalAmount?.toLocaleString('en-IN')}</strong>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-outline btn-sm" onClick={() => setExpanded(expanded === order._id ? null : order._id)}>
                    {expanded === order._id ? 'Hide Details' : 'View Details'}
                  </button>
                  {['Placed', 'Confirmed'].includes(order.status) && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleCancel(order._id)}>Cancel</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Orders;
