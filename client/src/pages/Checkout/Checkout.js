import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { placeOrder, addAddress } from '../../services/api';
import toast from 'react-hot-toast';
import './Checkout.css';

const PAYMENT_METHODS = [
  { value: 'UPI', label: '📱 UPI', desc: 'Pay using UPI ID' },
  { value: 'Card', label: '💳 Credit/Debit Card', desc: 'Visa, Mastercard, Rupay' },
  { value: 'NetBanking', label: '🏦 Net Banking', desc: 'All major banks' },
  { value: 'Wallet', label: '👛 Wallet', desc: 'Paytm, PhonePe, etc.' },
  { value: 'COD', label: '💵 Cash on Delivery', desc: 'Pay when delivered' },
];

const Checkout = () => {
  const navigate = useNavigate();
  const { user, checkAuth } = useAuth();
  const { cart, fetchCart } = useCart();
  const [step, setStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState(user?.addresses?.[0] || null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [placing, setPlacing] = useState(false);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({ name: '', phone: '', pincode: '', street: '', city: '', state: '' });

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, item) => sum + (item.product?.price || item.price) * item.quantity, 0);
  const deliveryCharge = subtotal >= 500 ? 0 : 40;
  const discountAmount = cart?.discount ? Math.round(subtotal * cart.discount / 100) : 0;
  const total = subtotal + deliveryCharge - discountAmount;

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await addAddress(newAddr);
      await checkAuth();
      setShowNewAddress(false);
      setNewAddr({ name: '', phone: '', pincode: '', street: '', city: '', state: '' });
      toast.success('Address added!');
    } catch {
      toast.error('Failed to add address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { toast.error('Please select a delivery address'); return; }
    setPlacing(true);
    try {
      const { data } = await placeOrder({
        deliveryAddress: selectedAddress,
        paymentMethod,
      });
      await fetchCart();
      toast.success('Order placed successfully!');
      navigate(`/order-success/${data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  const stepClass = (s) => s < step ? 'completed' : s === step ? 'active' : '';

  return (
    <div className="checkout-page page" id="checkout-page">
      <div className="checkout-steps">
        <div className={`checkout-step ${stepClass(1)}`}><div className="checkout-step-num">1</div> Address</div>
        <div className={`checkout-step-line ${step > 1 ? 'active' : ''}`} />
        <div className={`checkout-step ${stepClass(2)}`}><div className="checkout-step-num">2</div> Payment</div>
        <div className={`checkout-step-line ${step > 2 ? 'active' : ''}`} />
        <div className={`checkout-step ${stepClass(3)}`}><div className="checkout-step-num">3</div> Review</div>
      </div>

      {/* Step 1 - Address */}
      {step === 1 && (
        <div className="checkout-card">
          <h3>Delivery Address</h3>
          {user?.addresses?.length > 0 && (
            <div className="checkout-addresses">
              {user.addresses.map(addr => (
                <div key={addr._id} className={`checkout-address ${selectedAddress?._id === addr._id ? 'selected' : ''}`}
                  onClick={() => setSelectedAddress(addr)}>
                  <h4>{addr.name}</h4>
                  <p>{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                  <p>📞 {addr.phone}</p>
                </div>
              ))}
            </div>
          )}

          <button className="btn btn-outline btn-sm" onClick={() => setShowNewAddress(!showNewAddress)} style={{ marginBottom: 16 }}>
            + Add New Address
          </button>

          {showNewAddress && (
            <form className="checkout-form" onSubmit={handleAddAddress}>
              <div><label>Full Name</label><input required value={newAddr.name} onChange={e => setNewAddr({ ...newAddr, name: e.target.value })} /></div>
              <div><label>Phone</label><input required value={newAddr.phone} onChange={e => setNewAddr({ ...newAddr, phone: e.target.value })} /></div>
              <div><label>Pincode</label><input required value={newAddr.pincode} onChange={e => setNewAddr({ ...newAddr, pincode: e.target.value })} /></div>
              <div><label>City</label><input required value={newAddr.city} onChange={e => setNewAddr({ ...newAddr, city: e.target.value })} /></div>
              <div className="full-width"><label>Street Address</label><input required value={newAddr.street} onChange={e => setNewAddr({ ...newAddr, street: e.target.value })} /></div>
              <div><label>State</label><input required value={newAddr.state} onChange={e => setNewAddr({ ...newAddr, state: e.target.value })} /></div>
              <div><button type="submit" className="btn btn-primary btn-sm">Save Address</button></div>
            </form>
          )}

          <div className="checkout-nav">
            <span />
            <button className="btn btn-primary" onClick={() => { if (!selectedAddress) { toast.error('Select an address'); return; } setStep(2); }}>
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Step 2 - Payment */}
      {step === 2 && (
        <div className="checkout-card">
          <h3>Payment Method</h3>
          <div className="checkout-payments">
            {PAYMENT_METHODS.map(pm => (
              <label key={pm.value} className={`checkout-payment ${paymentMethod === pm.value ? 'selected' : ''}`}>
                <input type="radio" name="payment" value={pm.value} checked={paymentMethod === pm.value} onChange={() => setPaymentMethod(pm.value)} />
                <div>
                  <strong>{pm.label}</strong>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>{pm.desc}</p>
                </div>
              </label>
            ))}
          </div>
          <div className="checkout-nav">
            <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
            <button className="btn btn-primary" onClick={() => setStep(3)}>Continue →</button>
          </div>
        </div>
      )}

      {/* Step 3 - Review */}
      {step === 3 && (
        <div className="checkout-card">
          <h3>Order Review</h3>
          <div className="checkout-review-items">
            {items.map(item => (
              <div className="checkout-review-item" key={item.product?._id || item._id}>
                <img src={item.product?.images?.[0] || 'https://picsum.photos/100/100'} alt="" />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 500 }}>{item.product?.title || 'Product'}</p>
                  <p style={{ color: 'var(--text-secondary)' }}>Qty: {item.quantity} × ₹{(item.product?.price || item.price)?.toLocaleString('en-IN')}</p>
                </div>
                <strong>₹{((item.product?.price || item.price) * item.quantity).toLocaleString('en-IN')}</strong>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--bg)', padding: 16, borderRadius: 8, marginBottom: 16 }}>
            <p style={{ fontSize: '0.85rem', marginBottom: 6 }}><strong>📍 Delivering to:</strong> {selectedAddress?.name}, {selectedAddress?.street}, {selectedAddress?.city} - {selectedAddress?.pincode}</p>
            <p style={{ fontSize: '0.85rem' }}><strong>💰 Payment:</strong> {paymentMethod}</p>
          </div>

          <div style={{ borderTop: '2px dashed var(--border-light)', paddingTop: 12 }}>
            <div className="cart-summary-row"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
            {discountAmount > 0 && <div className="cart-summary-row" style={{ color: 'var(--success)' }}><span>Discount</span><span>−₹{discountAmount.toLocaleString('en-IN')}</span></div>}
            <div className="cart-summary-row"><span>Delivery</span><span>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}</span></div>
            <div className="cart-summary-total"><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div>
          </div>

          <div className="checkout-nav">
            <button className="btn btn-outline" onClick={() => setStep(2)}>← Back</button>
            <button className="btn btn-accent btn-lg" onClick={handlePlaceOrder} disabled={placing} id="place-order-btn">
              {placing ? 'Placing Order...' : '🛍️ Place Order'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
