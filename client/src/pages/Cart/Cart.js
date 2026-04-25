import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiShoppingBag, FiCheck, FiX } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { getAvailableCoupons } from '../../services/api';
import toast from 'react-hot-toast';
import './Cart.css';

const Cart = () => {
  const { cart, cartLoading, updateItem, removeItem, applyCouponCode } = useCart();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState('');
  const [applying, setApplying] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(cart?.couponCode || '');
  const [coupons, setCoupons] = useState([]);

  const COUPON_COLORS = ['#3b82f6', '#8b5cf6', '#ef4444', '#10b981', '#f59e0b', '#ec4899'];

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const { data } = await getAvailableCoupons();
        setCoupons(data);
      } catch {}
    };
    fetchCoupons();
  }, []);

  useEffect(() => {
    if (cart?.couponCode) setAppliedCoupon(cart.couponCode);
  }, [cart]);

  if (cartLoading) return (
    <div className="cart-page page">
      <h2 className="page-title">Shopping Cart</h2>
      {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 120, marginBottom: 12, borderRadius: 8 }} />)}
    </div>
  );

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, item) => sum + (item.product?.price || item.price) * item.quantity, 0);
  const deliveryCharge = subtotal >= 500 ? 0 : 40;
  const discountAmount = cart?.discount ? Math.round(subtotal * cart.discount / 100) : 0;
  const total = subtotal + deliveryCharge - discountAmount;

  const handleApplyCoupon = async (code) => {
    if (!code) return;
    setApplying(true);
    try {
      await applyCouponCode(code);
      setAppliedCoupon(code);
      setCoupon('');
    } catch {} finally { setApplying(false); }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon('');
    toast.success('Coupon removed');
  };

  const formatCouponDesc = (c) => {
    let desc = c.type === 'percentage' ? `${c.value}% off` : `Flat ₹${c.value} off`;
    if (c.minOrderAmount > 0) desc += ` on orders above ₹${c.minOrderAmount.toLocaleString('en-IN')}`;
    if (c.applicableCategory) desc += ` (${c.applicableCategory} only)`;
    if (c.newUsersOnly) desc += ' — New users';
    return desc;
  };

  if (items.length === 0) {
    return (
      <div className="cart-page page">
        <div className="empty-state">
          <div className="empty-state-icon">🛒</div>
          <h3>Your cart is empty!</h3>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <Link to="/products" className="btn btn-primary"><FiShoppingBag /> Shop Now</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page page" id="cart-page">
      <h2 className="page-title">Shopping Cart ({items.length} items)</h2>

      <div className="cart-layout">
        <div className="cart-items">
          {items.map(item => {
            const product = item.product || {};
            return (
              <div className="cart-item" key={product._id || item._id}>
                <Link to={`/product/${product._id}`} className="cart-item-img">
                  <img src={product.images?.[0] || 'https://picsum.photos/200/200?random=0'} alt={product.title} />
                </Link>
                <div className="cart-item-info">
                  <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h4 className="cart-item-title">{product.title || 'Product'}</h4>
                  </Link>
                  <div className="cart-item-price">
                    <span className="price-current">₹{(product.price || item.price)?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="cart-item-actions">
                    <div className="cart-qty">
                      <button onClick={() => updateItem(product._id, item.quantity - 1)}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateItem(product._id, item.quantity + 1)}>+</button>
                    </div>
                    <button className="cart-remove" onClick={() => removeItem(product._id)}>
                      <FiTrash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="cart-summary">
          <div className="cart-summary-card">
            <h3>Price Details</h3>
            <div className="cart-summary-row">
              <span>Subtotal ({items.length} items)</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            {discountAmount > 0 && (
              <div className="cart-summary-row" style={{ color: 'var(--success)' }}>
                <span>Coupon Discount ({cart.discount}%)</span>
                <span>−₹{discountAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="cart-summary-row">
              <span>Delivery</span>
              <span style={{ color: deliveryCharge === 0 ? 'var(--success)' : 'inherit' }}>
                {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
              </span>
            </div>
            <div className="cart-summary-total">
              <span>Total</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>

            {appliedCoupon && (
              <div className="cart-coupon-applied">
                <FiCheck size={16} />
                <span>🎉 <strong>{appliedCoupon}</strong> applied! You saved ₹{discountAmount.toLocaleString('en-IN')}</span>
                <button onClick={handleRemoveCoupon}><FiX size={14} /></button>
              </div>
            )}

            <div className="cart-coupon">
              <input type="text" placeholder="Enter coupon code" value={coupon}
                onChange={e => setCoupon(e.target.value.toUpperCase())} />
              <button className="btn btn-outline btn-sm" onClick={() => handleApplyCoupon(coupon)} disabled={!coupon || applying}>
                {applying ? '...' : 'Apply'}
              </button>
            </div>

            <div className="cart-coupons-list">
              <p className="cart-coupons-title">🎟️ Available Coupons</p>
              {coupons.map((c, i) => (
                <div className="cart-coupon-pill" key={c._id || c.code} onClick={() => handleApplyCoupon(c.code)}>
                  <div className="cart-coupon-pill-left">
                    <strong style={{ color: COUPON_COLORS[i % COUPON_COLORS.length] }}>{c.code}</strong>
                    <small>{formatCouponDesc(c)}</small>
                  </div>
                  <button className="cart-coupon-pill-btn" style={{ background: COUPON_COLORS[i % COUPON_COLORS.length] }}>TAP</button>
                </div>
              ))}
            </div>

            <button className="btn btn-accent btn-lg cart-checkout-btn" onClick={() => navigate('/checkout')} id="checkout-btn">
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
