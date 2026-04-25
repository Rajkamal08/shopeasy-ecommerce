import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../../services/api';
import ProductCard from '../../components/ProductCard/ProductCard';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './Products.css';

const CATEGORIES = ['Electronics', 'Fashion', 'Home & Kitchen', 'Sports', 'Books'];
const RATINGS = [4, 3, 2, 1];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  // Filters from URL
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') || '0';
  const maxPrice = searchParams.get('maxPrice') || '100000';
  const rating = searchParams.get('rating') || '';
  const brand = searchParams.get('brand') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1');

  const [priceRange, setPriceRange] = useState(parseInt(maxPrice));

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 12, sort };
        if (search) params.search = search;
        if (category) params.category = category;
        if (minPrice !== '0') params.minPrice = minPrice;
        if (priceRange < 100000) params.maxPrice = priceRange;
        if (rating) params.rating = rating;
        if (brand) params.brand = brand;

        const { data } = await getProducts(params);
        setProducts(data.products);
        setBrands(data.brands || []);
        setTotal(data.total);
        setPages(data.pages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [search, category, minPrice, priceRange, rating, brand, sort, page]);

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== 'page') params.set('page', '1');
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
    setPriceRange(100000);
  };

  const SkeletonGrid = () => (
    <div className="products-grid">
      {[...Array(6)].map((_, i) => (
        <div key={i}>
          <div className="skeleton" style={{ height: 220, borderRadius: 8 }} />
          <div className="skeleton" style={{ height: 16, marginTop: 12, width: '80%' }} />
          <div className="skeleton" style={{ height: 14, marginTop: 8, width: '50%' }} />
          <div className="skeleton" style={{ height: 20, marginTop: 8, width: '35%' }} />
        </div>
      ))}
    </div>
  );

  return (
    <div className="products-page page" id="products-page">
      {/* Sidebar */}
      <aside className="products-sidebar">
        <div className="products-sidebar-card">
          <h3>Filters</h3>

          {/* Category */}
          <div className="filter-section">
            <h4>Category</h4>
            {CATEGORIES.map(cat => (
              <label key={cat}>
                <input type="checkbox" checked={category === cat} onChange={() => updateFilter('category', category === cat ? '' : cat)} />
                {cat}
              </label>
            ))}
          </div>

          {/* Price */}
          <div className="filter-section">
            <h4>Price Range</h4>
            <input type="range" min="0" max="100000" step="500" value={priceRange}
              onChange={e => setPriceRange(parseInt(e.target.value))}
              onMouseUp={() => updateFilter('maxPrice', priceRange < 100000 ? String(priceRange) : '')}
            />
            <div className="price-range-display">
              <span>₹0</span>
              <span>₹{priceRange.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Rating */}
          <div className="filter-section">
            <h4>Customer Rating</h4>
            {RATINGS.map(r => (
              <label key={r}>
                <input type="checkbox" checked={rating === String(r)} onChange={() => updateFilter('rating', rating === String(r) ? '' : String(r))} />
                {r}★ & above
              </label>
            ))}
          </div>

          {/* Brand */}
          <div className="filter-section">
            <h4>Brand</h4>
            {brands.slice(0, 10).map(b => (
              <label key={b}>
                <input type="checkbox" checked={brand.split(',').includes(b)}
                  onChange={() => {
                    const current = brand ? brand.split(',') : [];
                    const updated = current.includes(b) ? current.filter(x => x !== b) : [...current, b];
                    updateFilter('brand', updated.join(','));
                  }}
                />
                {b}
              </label>
            ))}
          </div>

          <button className="filter-clear" onClick={clearFilters}>Clear All Filters</button>
        </div>
      </aside>

      {/* Main */}
      <div className="products-main">
        <div className="products-topbar">
          <span className="products-count">
            {search && <>Results for "<strong>{search}</strong>" — </>}
            Showing {products.length} of {total} products
          </span>
          <div className="products-sort">
            <select value={sort} onChange={e => updateFilter('sort', e.target.value)}>
              <option value="newest">Sort by: Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Popularity</option>
            </select>
          </div>
        </div>

        {loading ? <SkeletonGrid /> : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No products found</h3>
            <p>Try adjusting your filters or search query</p>
            <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
          </div>
        ) : (
          <div className="products-grid">
            {products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="products-pagination">
            <button disabled={page <= 1} onClick={() => updateFilter('page', String(page - 1))}>
              <FiChevronLeft />
            </button>
            {[...Array(pages)].map((_, i) => (
              <button key={i + 1} className={page === i + 1 ? 'active' : ''} onClick={() => updateFilter('page', String(i + 1))}>
                {i + 1}
              </button>
            ))}
            <button disabled={page >= pages} onClick={() => updateFilter('page', String(page + 1))}>
              <FiChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
