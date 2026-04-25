import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { FiGrid, FiPackage, FiShoppingBag, FiUsers, FiBarChart2, FiSettings, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import '../../pages/Admin/Admin.css';

const AdminLayout = () => {
  const { user } = useAuth();

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>🛡️ Admin Panel</h2>
          <p>ShopEasy Management</p>
        </div>

        <nav className="admin-sidebar-nav">
          <div className="admin-sidebar-section">
            <div className="admin-sidebar-section-title">Main</div>
            <NavLink to="/admin" end className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
              <FiGrid className="admin-nav-icon" />
              Dashboard
            </NavLink>
            <NavLink to="/admin/orders" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
              <FiPackage className="admin-nav-icon" />
              Orders
              <span className="admin-nav-badge">Live</span>
            </NavLink>
            <NavLink to="/admin/products" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
              <FiShoppingBag className="admin-nav-icon" />
              Products
            </NavLink>
            <NavLink to="/admin/users" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
              <FiUsers className="admin-nav-icon" />
              Customers
            </NavLink>
          </div>

          <div className="admin-sidebar-section">
            <div className="admin-sidebar-section-title">Analytics</div>
            <NavLink to="/admin" end className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
              <FiBarChart2 className="admin-nav-icon" />
              Revenue
            </NavLink>
            <NavLink to="/admin" end className="admin-nav-item">
              <FiSettings className="admin-nav-icon" />
              Settings
            </NavLink>
          </div>
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/">
            <FiArrowLeft /> Back to Store
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        <div className="admin-topbar">
          <h1>{getPageTitle(window.location.pathname)}</h1>
          <div className="admin-topbar-actions">
            <div className="admin-topbar-info">
              <div className="admin-topbar-dot" />
              Logged in as {user?.name || 'Admin'}
            </div>
          </div>
        </div>
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const getPageTitle = (path) => {
  if (path === '/admin') return '📊 Dashboard Overview';
  if (path.includes('/admin/orders')) return '📦 Order Management';
  if (path.includes('/admin/products')) return '🛍️ Product Management';
  if (path.includes('/admin/users')) return '👥 Customer Management';
  return '📊 Dashboard';
};

export default AdminLayout;
