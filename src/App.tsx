import { useState, useMemo, useCallback } from 'react';
import type { CartItem, SortOption } from './types';
import { CATEGORIES, SORT_OPTIONS } from './types';
import { products } from './data';
import './index.css';

/* ---- SVG Icons ---- */
const Icon = {
  search: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  cart: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  heart: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  heartFill: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  star: <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  plus: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  minus: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  x: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  grid: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  list: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  bag: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  store: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
};

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, i) => (
    <span key={i} style={{ opacity: i < Math.round(rating) ? 1 : 0.2 }}>{Icon.star}</span>
  ));
}

export default function App() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState<SortOption>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (category !== 'All') {
      result = result.filter(p => p.category === category);
    }

    switch (sort) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'newest': result.sort((a, b) => parseInt(b.id) - parseInt(a.id)); break;
      case 'featured': result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)); break;
    }

    return result;
  }, [search, category, sort]);

  const addToCart = useCallback((productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product || !product.inStock) return;

    setCart(prev => {
      const existing = prev.find(item => item.product.id === productId);
      if (existing) {
        return prev.map(item =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, selectedColor: product.colors[0] || '' }];
    });

    setAddedIds(prev => new Set(prev).add(productId));
    setTimeout(() => setAddedIds(prev => { const n = new Set(prev); n.delete(productId); return n; }), 1500);
    showToast(`${product.name} added to cart`);
  }, [showToast]);

  const updateQty = useCallback((productId: string, delta: number) => {
    setCart(prev => prev
      .map(item => item.product.id === productId ? { ...item, quantity: item.quantity + delta } : item)
      .filter(item => item.quantity > 0)
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  }, []);

  const toggleWishlist = useCallback((id: string) => {
    setWishlist(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* ---- HEADER ---- */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <div className="logo-icon">{Icon.store}</div>
            <span>NovaBuy</span>
          </div>

          <div className="search-bar">
            {Icon.search}
            <input
              type="text"
              placeholder="Search products, brands, tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button className="cart-btn" onClick={() => setCartOpen(true)}>
            {Icon.cart}
            <span>Cart</span>
            {cartCount > 0 && <div className="cart-count">{cartCount}</div>}
          </button>
        </div>
      </header>

      {/* ---- MAIN ---- */}
      <main className="main">
        {/* Hero */}
        <div className="hero">
          <div className="hero-badge">🔥 Summer Sale — Up to 30% Off</div>
          <h2>Premium Tech, Unbeatable Prices</h2>
          <p>Discover curated electronics, audio gear, and accessories — all with free shipping.</p>
        </div>

        {/* Categories */}
        <div className="categories">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`category-pill ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="toolbar-info">
            <h3>{category === 'All' ? 'All Products' : category}</h3>
            <span className="result-count">{filteredProducts.length} items</span>
          </div>
          <div className="toolbar-actions">
            <select
              className="sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div className="view-toggle">
              <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}>{Icon.grid}</button>
              <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>{Icon.list}</button>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '48px', opacity: 0.3 }}>🔍</div>
            <h3>No products found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className={`product-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
            {filteredProducts.map(product => {
              const discount = product.originalPrice
                ? Math.round((1 - product.price / product.originalPrice) * 100)
                : 0;
              const isAdded = addedIds.has(product.id);

              return (
                <div key={product.id} className="product-card">
                  <div className="product-image">
                    <img src={product.image} alt={product.name} loading="lazy" />
                    <div className="product-badges">
                      {discount > 0 && <span className="badge badge-sale">-{discount}%</span>}
                      {product.featured && <span className="badge badge-featured">Featured</span>}
                      {!product.inStock && <span className="badge badge-oos">Out of Stock</span>}
                    </div>
                    <button
                      className={`wishlist-btn ${wishlist.has(product.id) ? 'active' : ''}`}
                      onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                    >
                      {wishlist.has(product.id) ? Icon.heartFill : Icon.heart}
                    </button>
                  </div>

                  <div className="product-info">
                    <div className="product-brand">{product.brand}</div>
                    <div className="product-name">{product.name}</div>

                    <div className="product-rating">
                      <div className="stars">{renderStars(product.rating)}</div>
                      <span className="rating-text">{product.rating} ({product.reviews.toLocaleString()})</span>
                    </div>

                    <div className="product-tags">
                      {product.tags.map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>

                    <div className="product-colors">
                      {product.colors.map(color => (
                        <div key={color} className="color-dot" style={{ background: color }} />
                      ))}
                    </div>

                    <div className="product-footer">
                      <div className="product-price">
                        <span className="price-current">${product.price.toFixed(2)}</span>
                        {product.originalPrice && (
                          <span className="price-original">${product.originalPrice.toFixed(2)}</span>
                        )}
                        {discount > 0 && <span className="price-discount">Save {discount}%</span>}
                      </div>

                      <button
                        className={`add-to-cart-btn ${isAdded ? 'added' : ''}`}
                        disabled={!product.inStock}
                        onClick={(e) => { e.stopPropagation(); addToCart(product.id); }}
                      >
                        {isAdded ? Icon.check : Icon.plus}
                        <span>{isAdded ? 'Added' : product.inStock ? 'Add' : 'Sold Out'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ---- CART DRAWER ---- */}
      {cartOpen && (
        <>
          <div className="cart-overlay" onClick={() => setCartOpen(false)} />
          <div className="cart-drawer">
            <div className="cart-header">
              <h3>Shopping Cart ({cartCount})</h3>
              <button className="cart-close" onClick={() => setCartOpen(false)}>{Icon.x}</button>
            </div>

            <div className="cart-items">
              {cart.length === 0 ? (
                <div className="cart-empty">
                  {Icon.bag}
                  <p>Your cart is empty</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.product.id} className="cart-item">
                    <div className="cart-item-img">
                      <img src={item.product.image} alt={item.product.name} />
                    </div>
                    <div className="cart-item-info">
                      <h4>{item.product.name}</h4>
                      <p>{item.product.brand}</p>
                      <div className="cart-item-controls">
                        <button className="qty-btn" onClick={() => updateQty(item.product.id, -1)}>{Icon.minus}</button>
                        <span className="qty-value">{item.quantity}</span>
                        <button className="qty-btn" onClick={() => updateQty(item.product.id, 1)}>{Icon.plus}</button>
                        <button className="cart-remove" onClick={() => removeFromCart(item.product.id)}>Remove</button>
                      </div>
                    </div>
                    <div className="cart-item-price">${(item.product.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="cart-subtotal">
                  <span className="label">Subtotal</span>
                  <span className="value">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="cart-subtotal">
                  <span className="label">Shipping</span>
                  <span className="value" style={{ color: 'var(--success)' }}>Free</span>
                </div>
                <div className="cart-total">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <button className="checkout-btn">Proceed to Checkout</button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ---- TOAST ---- */}
      {toast && (
        <div className="toast">
          <span className="toast-icon">{Icon.check}</span>
          {toast}
        </div>
      )}
    </>
  );
}
