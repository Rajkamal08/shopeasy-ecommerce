import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, addAddress, deleteAddress } from '../../services/api';
import ProductCard from '../../components/ProductCard/ProductCard';
import toast from 'react-hot-toast';
import './Profile.css';

const Profile = () => {
  const { user, checkAuth } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [name, setName] = useState(user?.name || '');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddr, setNewAddr] = useState({ name: '', phone: '', pincode: '', street: '', city: '', state: '' });
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ name });
      await checkAuth();
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update'); }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await addAddress(newAddr);
      await checkAuth();
      setShowAddressForm(false);
      setNewAddr({ name: '', phone: '', pincode: '', street: '', city: '', state: '' });
      toast.success('Address added!');
    } catch { toast.error('Failed to add address'); }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await deleteAddress(id);
      await checkAuth();
      toast.success('Address removed');
    } catch { toast.error('Failed to remove'); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPw.length < 6) { toast.error('Min 6 characters'); return; }
    try {
      await updateProfile({ password: newPw });
      toast.success('Password changed!');
      setOldPw(''); setNewPw('');
    } catch { toast.error('Failed to change password'); }
  };

  const wishlistProducts = user?.wishlist?.filter(w => w && w._id) || [];

  return (
    <div className="profile-page page" id="profile-page">
      <h2 className="page-title">My Account</h2>

      <div className="profile-tabs">
        {['profile', 'addresses', 'wishlist', 'password'].map(tab => (
          <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="profile-content">
        {activeTab === 'profile' && (
          <form className="profile-form" onSubmit={handleUpdateProfile}>
            <div>
              <label>Full Name</label>
              <input value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <label>Email (cannot change)</label>
              <input value={user?.email || ''} disabled />
            </div>
            <div>
              <label>Role</label>
              <input value={user?.role || 'user'} disabled />
            </div>
            <div>
              <label>Member since</label>
              <input value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : ''} disabled />
            </div>
            <div>
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </div>
          </form>
        )}

        {activeTab === 'addresses' && (
          <>
            <button className="btn btn-outline btn-sm" onClick={() => setShowAddressForm(!showAddressForm)} style={{ marginBottom: 16 }}>
              + Add New Address
            </button>
            {showAddressForm && (
              <form className="profile-form" onSubmit={handleAddAddress} style={{ marginBottom: 20 }}>
                <div><label>Name</label><input required value={newAddr.name} onChange={e => setNewAddr({ ...newAddr, name: e.target.value })} /></div>
                <div><label>Phone</label><input required value={newAddr.phone} onChange={e => setNewAddr({ ...newAddr, phone: e.target.value })} /></div>
                <div><label>Pincode</label><input required value={newAddr.pincode} onChange={e => setNewAddr({ ...newAddr, pincode: e.target.value })} /></div>
                <div><label>City</label><input required value={newAddr.city} onChange={e => setNewAddr({ ...newAddr, city: e.target.value })} /></div>
                <div style={{ gridColumn: '1 / -1' }}><label>Street</label><input required value={newAddr.street} onChange={e => setNewAddr({ ...newAddr, street: e.target.value })} /></div>
                <div><label>State</label><input required value={newAddr.state} onChange={e => setNewAddr({ ...newAddr, state: e.target.value })} /></div>
                <div><button type="submit" className="btn btn-primary btn-sm">Save</button></div>
              </form>
            )}
            <div className="profile-addresses">
              {user?.addresses?.map(addr => (
                <div className="profile-address" key={addr._id}>
                  <div className="profile-address-actions">
                    <button onClick={() => handleDeleteAddress(addr._id)}>✕</button>
                  </div>
                  <h4>{addr.name}</h4>
                  <p>{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                  <p>📞 {addr.phone}</p>
                </div>
              ))}
              {(!user?.addresses || user.addresses.length === 0) && <p style={{ color: 'var(--text-secondary)' }}>No saved addresses</p>}
            </div>
          </>
        )}

        {activeTab === 'wishlist' && (
          wishlistProducts.length > 0 ? (
            <div className="profile-wishlist-grid">
              {wishlistProducts.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">❤️</div>
              <h3>Your wishlist is empty</h3>
              <p>Save products you love for later</p>
            </div>
          )
        )}

        {activeTab === 'password' && (
          <form className="profile-form" onSubmit={handleChangePassword}>
            <div><label>Current Password</label><input type="password" value={oldPw} onChange={e => setOldPw(e.target.value)} required /></div>
            <div><label>New Password</label><input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} required minLength={6} /></div>
            <div><button type="submit" className="btn btn-primary">Change Password</button></div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
