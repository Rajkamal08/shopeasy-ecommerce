import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import { getProductById, getProducts, addReview } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import StarRating from '../../components/StarRating';
import ProductCard from '../../components/ProductCard/ProductCard';
import toast from 'react-hot-toast';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user, toggleWishlist, isInWishlist } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [related, setRelated] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await getProductById(id);
        setProduct(data);
        setSelectedImage(0);
        setQuantity(1);

        // Save to recently viewed
        const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        const filtered = recent.filter(p => p._id !== data._id);
        filtered.unshift({ _id: data._id, title: data.title, price: data.price, originalPrice: data.originalPrice, discount: data.discount, images: data.images, brand: data.brand, averageRating: data.averageRating, numReviews: data.numReviews, stock: data.stock });
        localStorage.setItem('recentlyViewed', JSON.stringify(filtered.slice(0, 10)));

        // Fetch related
        const { data: relData } = await getProducts({ category: data.category, limit: 6 });
        setRelated(relData.products.filter(p => p._id !== data._id));
      } catch {
        toast.error('Product not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    const success = await addItem(product._id, quantity);
    if (success) setQuantity(1);
  };

  const handleBuyNow = async () => {
    const success = await addItem(product._id, quantity);
    if (success) navigate('/cart');
  };

  const handleReview = async (e) => {
    e.preventDefault();
    try {
      await addReview(id, { rating: reviewRating, review: reviewText });
      toast.success('Review submitted!');
      setReviewText('');
      const { data } = await getProductById(id);
      setProduct(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) return (
    <div className="pd-page page">
      <div className="pd-main">
        <div className="skeleton" style={{ width: 420, height: 400, borderRadius: 12 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 20, width: '60%', marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 28, width: '80%', marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 40, width: '40%', marginBottom: 20 }} />
          <div className="skeleton" style={{ height: 48, width: '100%' }} />
        </div>
      </div>
    </div>
  );

  if (!product) return <div className="page empty-state"><h3>Product not found</h3></div>;

  const stockStatus = product.stock === 0 ? 'out-of-stock' : product.stock <= 5 ? 'low-stock' : 'in-stock';
  const stockText = product.stock === 0 ? 'Out of Stock' : product.stock <= 5 ? `Only ${product.stock} left!` : 'In Stock';

  // Rating breakdown
  const ratingCounts = [0, 0, 0, 0, 0];
  product.ratings?.forEach(r => { if (r.rating >= 1 && r.rating <= 5) ratingCounts[r.rating - 1]++; });
  const totalRatings = product.ratings?.length || 0;

  return (
    <div className="pd-page page" id="product-detail-page">
      <div className="pd-main">
        {/* Gallery */}
        <div className="pd-gallery">
          <div className="pd-gallery-main">
            <img src={product.images?.[selectedImage] || 'https://picsum.photos/400/400?random=0'} alt={product.title} />
          </div>
          {product.images?.length > 1 && (
            <div className="pd-thumbnails">
              {product.images.map((img, i) => (
                <div key={i} className={`pd-thumbnail ${i === selectedImage ? 'active' : ''}`} onClick={() => setSelectedImage(i)}>
                  <img src={img} alt={`Thumbnail ${i + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="pd-info">
          <p className="pd-brand">{product.brand}</p>
          <h1 className="pd-title">{product.title}</h1>

          <div className="pd-rating-row">
            <span className="pd-rating-badge">{product.averageRating?.toFixed(1)} <FaStar size={11} /></span>
            <span className="pd-rating-count">{product.numReviews || 0} Ratings & Reviews</span>
          </div>

          <div className="pd-price-section">
            <div className="pd-price-row">
              <span className="pd-price-current">₹{product.price?.toLocaleString('en-IN')}</span>
              {product.originalPrice > product.price && (
                <>
                  <span className="pd-price-original">₹{product.originalPrice?.toLocaleString('en-IN')}</span>
                  <span className="pd-price-discount">{product.discount}% off</span>
                </>
              )}
            </div>
            <div className="pd-stock">
              <span className={`pd-stock-badge ${stockStatus}`}>{stockText}</span>
            </div>
          </div>

          {product.stock > 0 && (
            <div className="pd-quantity">
              <span>Quantity:</span>
              <div className="pd-qty-controls">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}>+</button>
              </div>
            </div>
          )}

          <div className="pd-actions">
            <button className="btn btn-primary btn-lg" onClick={handleAddToCart} disabled={product.stock === 0} id="add-to-cart-btn">
              <FiShoppingCart /> ADD TO CART
            </button>
            <button className="btn btn-accent btn-lg" onClick={handleBuyNow} disabled={product.stock === 0} id="buy-now-btn">
              ⚡ BUY NOW
            </button>
          </div>

          <button className={`pd-wishlist-btn ${isInWishlist(product._id) ? 'active' : ''}`} onClick={() => toggleWishlist(product._id)}>
            <FiHeart /> {isInWishlist(product._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
          </button>

          <div className="pd-seller">
            <h4>Seller</h4>
            <p>{product.seller}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="pd-tabs">
        <div className="pd-tabs-header">
          <button className={activeTab === 'description' ? 'active' : ''} onClick={() => setActiveTab('description')}>Description</button>
          <button className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}>Reviews ({totalRatings})</button>
        </div>
        <div className="pd-tab-content">
          {activeTab === 'description' && <p className="pd-description">{product.description}</p>}
          {activeTab === 'reviews' && (
            <>
              <div className="pd-reviews-summary">
                <div className="pd-reviews-avg">
                  <div className="big-rating">{product.averageRating?.toFixed(1)}</div>
                  <StarRating rating={product.averageRating} size={18} />
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>{totalRatings} reviews</p>
                </div>
                <div className="pd-reviews-bars">
                  {[5, 4, 3, 2, 1].map(star => (
                    <div className="pd-rating-bar" key={star}>
                      <span>{star}★</span>
                      <div className="pd-rating-bar-fill">
                        <div style={{ width: `${totalRatings ? (ratingCounts[star - 1] / totalRatings) * 100 : 0}%` }} />
                      </div>
                      <span>{ratingCounts[star - 1]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {product.ratings?.map((r, i) => (
                <div className="pd-review-item" key={i}>
                  <div className="pd-review-header">
                    <span className="pd-rating-badge" style={{ fontSize: '0.72rem' }}>{r.rating} <FaStar size={9} /></span>
                    <span className="pd-review-name">{r.name}</span>
                    <span className="pd-review-date">{new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                  <p className="pd-review-text">{r.review}</p>
                </div>
              ))}

              {user && (
                <form className="pd-review-form" onSubmit={handleReview}>
                  <h4>Write a Review</h4>
                  <select value={reviewRating} onChange={e => setReviewRating(Number(e.target.value))}>
                    <option value={5}>5 - Excellent</option>
                    <option value={4}>4 - Good</option>
                    <option value={3}>3 - Average</option>
                    <option value={2}>2 - Poor</option>
                    <option value={1}>1 - Terrible</option>
                  </select>
                  <textarea placeholder="Write your review..." value={reviewText} onChange={e => setReviewText(e.target.value)} />
                  <button type="submit" className="btn btn-primary btn-sm">Submit Review</button>
                </form>
              )}
            </>
          )}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="pd-related">
          <h3>You May Also Like</h3>
          <div className="pd-related-scroll">
            {related.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
