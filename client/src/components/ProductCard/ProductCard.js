import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useCompare } from '../../context/CompareContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { toggleWishlist, isInWishlist } = useAuth();
  const { addItem } = useCart();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const wishlisted = isInWishlist(product._id);
  const compared = isInCompare(product._id);

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product._id);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product._id);
  };

  const handleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (compared) {
      removeFromCompare(product._id);
    } else {
      addToCompare(product);
    }
  };

  return (
    <Link to={`/product/${product._id}`} className="product-card" id={`product-${product._id}`}>
      <div className="product-card-image">
        <img src={product.images?.[0] || 'https://picsum.photos/400/400?random=0'} alt={product.title} loading="lazy" />
        {product.discount > 0 && (
          <span className="product-card-discount">{product.discount}% OFF</span>
        )}
        <button className={`product-card-wishlist ${wishlisted ? 'active' : ''}`} onClick={handleWishlist} aria-label="Toggle wishlist">
          <FiHeart />
        </button>
        {product.stock === 0 && <div className="product-card-oos">Out of Stock</div>}
      </div>

      <div className="product-card-info">
        <p className="product-card-brand">{product.brand}</p>
        <h3 className="product-card-title">{product.title}</h3>

        <div className="product-card-rating">
          <span className="product-card-rating-badge">
            {product.averageRating?.toFixed(1)} <FaStar size={10} />
          </span>
          <span className="product-card-reviews">({product.numReviews || 0})</span>
        </div>

        <div className="product-card-price">
          <span className="price-current">₹{product.price?.toLocaleString('en-IN')}</span>
          {product.originalPrice > product.price && (
            <>
              <span className="price-original">₹{product.originalPrice?.toLocaleString('en-IN')}</span>
              <span className="price-discount">{product.discount}% off</span>
            </>
          )}
        </div>

        <div className="product-card-actions">
          <label className="product-card-compare" onClick={handleCompare}>
            <input type="checkbox" checked={compared} readOnly />
            <span>Compare</span>
          </label>
          <button className="product-card-add-btn" onClick={handleAddToCart} disabled={product.stock === 0}>
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
