import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiHeart, FiUser, FiPackage, FiLogOut, FiShield, FiGrid, FiTag } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { getSuggestions } from '../../services/api';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false);
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (val.trim().length > 1) {
      debounceRef.current = setTimeout(async () => {
        try {
          const { data } = await getSuggestions(val);
          setSuggestions(data);
          setShowSuggestions(true);
        } catch { setSuggestions([]); }
      }, 500);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (title) => {
    setSearchQuery(title);
    setShowSuggestions(false);
    navigate(`/products?search=${encodeURIComponent(title)}`);
  };

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-text">ShopEasy</span>
          <span className="navbar-logo-sub">Explore <em>Plus</em> ✨</span>
        </Link>

        <form className="navbar-search" ref={searchRef} onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Search for products, brands and more"
            value={searchQuery}
            onChange={handleSearch}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            id="search-input"
          />
          <FiSearch className="navbar-search-icon" />

          {showSuggestions && suggestions.length > 0 && (
            <div className="navbar-suggestions">
              {suggestions.map((s) => (
                <div key={s._id} className="navbar-suggestion-item" onClick={() => handleSuggestionClick(s.title)}>
                  <FiSearch size={14} />
                  {s.title}
                  <span>{s.category}</span>
                </div>
              ))}
            </div>
          )}
        </form>

        <div className="navbar-actions">
          {/* Categories Link */}
          <Link to="/products" className="navbar-action navbar-action-hide-mobile" id="categories-btn">
            <FiGrid className="navbar-action-icon" />
            <span>Categories</span>
          </Link>

          {/* Offers Link */}
          <Link to="/products?sort=price_asc" className="navbar-action navbar-action-hide-mobile" id="offers-btn">
            <FiTag className="navbar-action-icon" />
            <span>Offers</span>
          </Link>

          {user ? (
            <div className="navbar-user-menu" ref={dropdownRef}>
              <button className="navbar-action" onClick={() => setShowDropdown(!showDropdown)} id="user-menu-btn">
                <FiUser className="navbar-action-icon" />
                <span>{user.name?.split(' ')[0]}</span>
              </button>

              {showDropdown && (
                <div className="navbar-dropdown">
                  <div className="navbar-dropdown-header">
                    <strong>{user.name}</strong>
                    <small>{user.email}</small>
                  </div>
                  <hr />
                  <Link to="/profile" onClick={() => setShowDropdown(false)}>
                    <FiUser size={16} /> My Profile
                  </Link>
                  <Link to="/orders" onClick={() => setShowDropdown(false)}>
                    <FiPackage size={16} /> My Orders
                  </Link>
                  <Link to="/profile" onClick={() => setShowDropdown(false)}>
                    <FiHeart size={16} /> Wishlist
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setShowDropdown(false)}>
                      <FiShield size={16} /> Admin Panel
                    </Link>
                  )}
                  <hr />
                  <button onClick={() => { logout(); setShowDropdown(false); }}>
                    <FiLogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="navbar-action" id="login-btn">
              <FiUser className="navbar-action-icon" />
              <span>Login</span>
            </Link>
          )}

          <Link to="/cart" className="navbar-action" id="cart-btn">
            <FiShoppingCart className="navbar-action-icon" />
            <span>Cart</span>
            {cartCount > 0 && <span className="navbar-cart-badge">{cartCount}</span>}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
