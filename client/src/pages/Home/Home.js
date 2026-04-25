import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedProducts, getProducts, getTopRated, getNewArrivals, getBrands } from '../../services/api';
import ProductCard from '../../components/ProductCard/ProductCard';
import './Home.css';

const CATEGORIES = [
  { name: 'Electronics', icon: '📱' },
  { name: 'Fashion', icon: '👕' },
  { name: 'Home & Kitchen', icon: '🏠' },
  { name: 'Sports', icon: '⚽' },
  { name: 'Books', icon: '📚' },
];

const TAB_CATS = ['All', 'Electronics', 'Fashion', 'Home & Kitchen', 'Sports', 'Books'];

// IntersectionObserver hook for scroll animations
const useScrollReveal = () => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(el); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, isVisible];
};

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [deals, setDeals] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState({ hours: 5, minutes: 30, seconds: 0 });
  const [activeTab, setActiveTab] = useState('All');
  const [tabLoading, setTabLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featRes, dealsRes, topRes, newRes, brandsRes] = await Promise.all([
          getFeaturedProducts(),
          getProducts({ sort: 'popular', limit: 8 }),
          getTopRated('All'),
          getNewArrivals(),
          getBrands(),
        ]);
        setFeatured(featRes.data);
        setDeals(dealsRes.data.products || []);
        setTopRated(topRes.data);
        setNewArrivals(newRes.data);
        setBrands(brandsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) { seconds--; }
        else if (minutes > 0) { minutes--; seconds = 59; }
        else if (hours > 0) { hours--; minutes = 59; seconds = 59; }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Tab filter for top rated
  const handleTabChange = useCallback(async (cat) => {
    setActiveTab(cat);
    setTabLoading(true);
    try {
      const { data } = await getTopRated(cat);
      setTopRated(data);
    } catch {} finally { setTabLoading(false); }
  }, []);

  // Recently viewed
  const [recentlyViewed, setRecentlyViewed] = useState(
    JSON.parse(localStorage.getItem('recentlyViewed') || '[]')
  );
  const clearRecent = () => {
    localStorage.removeItem('recentlyViewed');
    setRecentlyViewed([]);
  };

  // Scroll reveal refs
  const [flashRef, flashVisible] = useScrollReveal();
  const [featuredRef, featuredVisible] = useScrollReveal();
  const [bannerRef, bannerVisible] = useScrollReveal();
  const [topRef, topVisible] = useScrollReveal();
  const [newRef, newVisible] = useScrollReveal();
  const [brandsRef, brandsVisible] = useScrollReveal();
  const [recentRef, recentVisible] = useScrollReveal();

  const SkeletonCards = () => (
    <div className="home-products-scroll">
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ minWidth: 230, maxWidth: 230, flexShrink: 0 }}>
          <div className="skeleton" style={{ height: 230, borderRadius: 14 }} />
          <div className="skeleton" style={{ height: 14, marginTop: 14, width: '70%', borderRadius: 6 }} />
          <div className="skeleton" style={{ height: 12, marginTop: 8, width: '50%', borderRadius: 6 }} />
          <div className="skeleton" style={{ height: 18, marginTop: 10, width: '35%', borderRadius: 6 }} />
        </div>
      ))}
    </div>
  );

  return (
    <div className="home-page" id="home-page">
      {/* ═══ HERO ═══ */}
      <section className="home-hero">
        <div className="home-hero-inner animate-fadeIn">
          <div className="home-hero-content">
            <h1>India's <span>Biggest</span><br />Online Store</h1>
            <p>Discover millions of products at amazing prices. Free delivery on orders above ₹500!</p>
            <Link to="/products" className="btn btn-accent btn-lg">Shop Now →</Link>
          </div>
          <div className="home-hero-img">🛒</div>
        </div>
      </section>

      {/* ═══ CATEGORIES ═══ */}
      <div className="home-categories animate-slideUp">
        <div className="home-categories-grid">
          {CATEGORIES.map(cat => (
            <Link to={`/products?category=${encodeURIComponent(cat.name)}`} className="home-category-card" key={cat.name}>
              <div className="home-category-icon">{cat.icon}</div>
              <div className="home-category-name">{cat.name}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* ═══ FLASH SALE ═══ */}
      <section className="home-section" ref={flashRef} style={{ opacity: flashVisible ? 1 : 0, transform: flashVisible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.6s ease' }}>
        <div className="home-flash-sale">
          <div className="home-flash-header">
            <h2>⚡ Flash Sale</h2>
            <div className="home-timer">
              <div className="home-timer-box">{String(timer.hours).padStart(2, '0')}</div>
              <span style={{ color: '#e53935', fontWeight: 700, fontSize: '1.2rem' }}>:</span>
              <div className="home-timer-box">{String(timer.minutes).padStart(2, '0')}</div>
              <span style={{ color: '#e53935', fontWeight: 700, fontSize: '1.2rem' }}>:</span>
              <div className="home-timer-box">{String(timer.seconds).padStart(2, '0')}</div>
            </div>
          </div>
          {loading ? <SkeletonCards /> : (
            <div className="home-products-scroll">
              {deals.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ═══ A) SUMMER SALE BANNER ═══ */}
      <section className="home-section" ref={bannerRef} style={{ opacity: bannerVisible ? 1 : 0, transform: bannerVisible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.6s ease' }}>
        <div className="summer-banner">
          <div className="summer-banner-content">
            <h2>☀️ Summer Sale</h2>
            <p>Up to 70% off — Limited time only</p>
            <Link to="/products" className="summer-banner-btn">Shop Sale →</Link>
            <div className="summer-banner-timer">
              Ends in: {String(timer.hours).padStart(2,'0')}:{String(timer.minutes).padStart(2,'0')}:{String(timer.seconds).padStart(2,'0')}
            </div>
          </div>
          <div className="summer-banner-cards">
            <div className="summer-float-card" style={{ animationDelay: '0s' }}>
              <span>📱</span><div><small>Electronics</small><strong>₹999</strong></div>
            </div>
            <div className="summer-float-card" style={{ animationDelay: '0.5s' }}>
              <span>👕</span><div><small>Fashion</small><strong>₹499</strong></div>
            </div>
            <div className="summer-float-card" style={{ animationDelay: '1s' }}>
              <span>📚</span><div><small>Books</small><strong>₹199</strong></div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FEATURED ═══ */}
      <section className="home-section" ref={featuredRef} style={{ opacity: featuredVisible ? 1 : 0, transform: featuredVisible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.6s ease' }}>
        <div className="home-section-header">
          <h2 className="section-heading">🌟 Featured Products</h2>
          <Link to="/products">View All →</Link>
        </div>
        {loading ? <SkeletonCards /> : (
          <div className="home-products-scroll">
            {featured.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>

      {/* ═══ B) TOP RATED ═══ */}
      <section className="home-section" ref={topRef} style={{ opacity: topVisible ? 1 : 0, transform: topVisible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.6s ease' }}>
        <div className="home-section-header">
          <h2 className="section-heading">⭐ Customer Favourites</h2>
          <Link to="/products?sort=popular">View All →</Link>
        </div>
        <div className="home-filter-tabs">
          {TAB_CATS.map(cat => (
            <button key={cat} className={`home-tab ${activeTab === cat ? 'active' : ''}`} onClick={() => handleTabChange(cat)}>
              {cat}
            </button>
          ))}
        </div>
        {tabLoading ? <SkeletonCards /> : (
          <div className="home-products-scroll" style={{ transition: 'opacity 0.3s', opacity: tabLoading ? 0.5 : 1 }}>
            {topRated.map(p => <ProductCard key={p._id} product={p} />)}
            {topRated.length === 0 && <p style={{ color: 'var(--text-hint)', padding: 20 }}>No products found in this category</p>}
          </div>
        )}
      </section>

      {/* ═══ C) NEW ARRIVALS ═══ */}
      <section className="home-section" ref={newRef} style={{ opacity: newVisible ? 1 : 0, transform: newVisible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.6s ease' }}>
        <div className="home-section-header">
          <h2 className="section-heading">🆕 Just Arrived</h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Fresh products this week</span>
        </div>
        {loading ? <SkeletonCards /> : (
          <div className="home-grid-new">
            {newArrivals.map(p => (
              <div key={p._id} className="new-arrival-wrap">
                <div className="new-badge">NEW</div>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/products?sort=newest" className="btn btn-outline">View All New Arrivals →</Link>
        </div>
      </section>

      {/* ═══ D) SHOP BY BRAND ═══ */}
      <section className="home-section" ref={brandsRef} style={{ opacity: brandsVisible ? 1 : 0, transform: brandsVisible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.6s ease' }}>
        <div className="home-section-header">
          <h2 className="section-heading">🏷️ Top Brands</h2>
        </div>
        <div className="home-brands-scroll">
          {brands.map(brand => (
            <Link to={`/products?brand=${encodeURIComponent(brand)}`} className="brand-pill" key={brand}>
              {brand}
            </Link>
          ))}
        </div>
      </section>

      {/* ═══ E) RECENTLY VIEWED ═══ */}
      {recentlyViewed.length > 0 && (
        <section className="home-section" ref={recentRef} style={{ opacity: recentVisible ? 1 : 0, transform: recentVisible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.6s ease' }}>
          <div className="home-section-header">
            <h2 className="section-heading">👀 Continue Where You Left Off</h2>
            <button className="home-clear-btn" onClick={clearRecent}>Clear</button>
          </div>
          <div className="home-recent-scroll">
            {recentlyViewed.slice(0, 6).map(p => (
              <Link to={`/product/${p._id}`} className="recent-card" key={p._id}>
                <img src={p.images?.[0] || 'https://picsum.photos/120/120'} alt={p.title} />
                <div className="recent-info">
                  <p className="recent-title">{p.title}</p>
                  <strong>₹{p.price?.toLocaleString('en-IN')}</strong>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
      {/* ═══ F) SUBSCRIPTION ═══ */}
      <section className="home-subscribe-section">
        <div className="home-subscribe-card">
          <div className="home-subscribe-content">
            <span className="home-subscribe-badge">✨ PLUS MEMBERSHIP</span>
            <h2>Get Early Access to Sales</h2>
            <p>Subscribe to ShopEasy Plus and get exclusive early access to flash sales, new arrivals, and special member-only discounts. Be the first to shop the best deals!</p>
            <div className="home-subscribe-perks">
              <div className="home-subscribe-perk">🚀 <span>Early Sale Access</span></div>
              <div className="home-subscribe-perk">🎟️ <span>Exclusive Coupons</span></div>
              <div className="home-subscribe-perk">🚚 <span>Free Delivery</span></div>
              <div className="home-subscribe-perk">⭐ <span>Priority Support</span></div>
            </div>
            <SubscribeForm />
          </div>
          <div className="home-subscribe-visual">
            <div className="home-subscribe-price">
              <small>Starting at</small>
              <strong>₹99<span>/mo</span></strong>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Subscription form sub-component
const SubscribeForm = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(localStorage.getItem('subscribed') === 'true');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    localStorage.setItem('subscribed', 'true');
    localStorage.setItem('subscribedEmail', email);
    setSubscribed(true);
  };

  if (subscribed) {
    return (
      <div className="home-subscribe-success">
        <span>🎉</span>
        <div>
          <strong>You're subscribed!</strong>
          <p>You'll get early access to all upcoming sales.</p>
        </div>
      </div>
    );
  }

  return (
    <form className="home-subscribe-form" onSubmit={handleSubscribe}>
      <input
        type="email"
        placeholder="Enter your email for early access"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <button type="submit" className="btn btn-accent">Subscribe Free →</button>
    </form>
  );
};

export default Home;
