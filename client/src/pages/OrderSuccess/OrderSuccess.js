import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById } from '../../services/api';
import './OrderSuccess.css';

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getOrderById(id);
        setOrder(data);
      } catch {}
    };
    fetch();
  }, [id]);

  return (
    <div className="os-page page" id="order-success-page">
      <div className="os-check">✓</div>
      <h1>Order Placed Successfully!</h1>
      <p>Thank you for your purchase 🎉</p>

      {order && (
        <div className="os-details">
          <div className="os-details-row"><span>Order ID</span><strong>{order._id}</strong></div>
          <div className="os-details-row"><span>Items</span><strong>{order.items?.length}</strong></div>
          <div className="os-details-row"><span>Total</span><strong>₹{order.totalAmount?.toLocaleString('en-IN')}</strong></div>
          <div className="os-details-row"><span>Payment</span><strong>{order.paymentMethod}</strong></div>
          <div className="os-details-row">
            <span>Estimated Delivery</span>
            <strong>{order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }) : 'N/A'}</strong>
          </div>
        </div>
      )}

      <div className="os-actions">
        <Link to="/orders" className="btn btn-primary">Track Order</Link>
        <Link to="/products" className="btn btn-outline">Continue Shopping</Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
