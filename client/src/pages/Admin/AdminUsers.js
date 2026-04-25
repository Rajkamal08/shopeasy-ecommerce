import React from 'react';

const AdminUsers = () => {
  return (
    <div className="admin-table-card">
      <div className="admin-table-header">
        <h3>Customer Management</h3>
      </div>
      <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>👥</div>
        <h3 style={{ color: '#334155', marginBottom: 8 }}>Coming Soon</h3>
        <p>Customer management features will be available in the next update.</p>
        <p style={{ fontSize: '0.8rem', marginTop: 12, color: '#cbd5e1' }}>
          You can view users directly in your MongoDB Atlas dashboard → Browse Collections → users
        </p>
      </div>
    </div>
  );
};

export default AdminUsers;
