import React, { useState, useEffect } from 'react';
import { ShoppingCart, Filter } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import './Shop.css';

import axios from 'axios';

const Shop = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  // Data States
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState(null); // 'low', 'mid', 'high'
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const fetchProducts = async () => {
      try {
        const res = await axios.get('/api/products', { withCredentials: true });
        if (res.data.success) {
           // Backend returns { success: true, product: [...] } - Note 'product' key singular
           // We map it to ensure consistent structure if needed, or just use as is.
           // Assuming backend 'image' field is a full URL or needs path adjustment.
           // Backend model (Step 671) has name, price, stock, description, image, vendor.
           // It does NOT have rating, reviews, category, delivery, isBestSeller by default unless added.
           // Let's assume basic fields for now and default others.
            const mappedProducts = res.data.product.map(p => ({
                id: p._id,
                name: p.name,
                price: p.price,
                description: p.description,
                image: p.image || "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=800&q=80", // Fallback
                category: p.category || "Ice Creams",
                rating: p.rating || 0,
                reviews: p.numReviews || 0,
                isBestSeller: false,
                delivery: "Standard Delivery",
                stock: p.stock
            }));
            setProducts(mappedProducts);
        } else {
            setError("Failed to load products");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Error loading products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user, navigate]);

  // Handle Category Toggle
  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Filter Logic
  const filteredProducts = products.filter(product => {
     // 1. Search
     if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
     
     // 2. Category
     if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) return false;

     // 3. Rating
     if (product.rating < minRating) return false;

     // 4. Price (Simple Ranges)
     if (priceRange === 'under200' && product.price >= 200) return false;
     if (priceRange === '200to400' && (product.price < 200 || product.price > 400)) return false;
     if (priceRange === 'over400' && product.price <= 400) return false;

     return true;
  });

  const handleAddToCart = (product) => {
    console.log("Adding to cart:", product);
    try {
        if (addToCart) {
            addToCart(product);
            toast.success(`Added ${product.name} to cart!`);
        } else {
            console.error("addToCart function is missing from context");
            toast.error("Error: capabilities missing. Please refresh.");
        }
    } catch (error) {
        console.error("Error adding to cart:", error);
        toast.error("Failed to add to cart.");
    }
  };

  if (!user) return null;
  
  if (loading) {
      return (
          <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div className="loader"></div>
              <p style={{marginLeft: '1rem'}}>Loading flavors...</p>
          </div>
      );
  }

  if (error) {
       return (
          <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
              <h3>Oops! Something went wrong.</h3>
              <p>{error}</p>
              <button onClick={() => window.location.reload()} className="btn btn-primary" style={{marginTop: '1rem'}}>Retry</button>
          </div>
      );
  }

  return (
    <div className="shop-page">
      <div className="shop-container">
        {/* Mobile Filter Backdrop */}
        {showMobileFilters && (
            <div 
                className="shop-sidebar-backdrop" 
                onClick={() => setShowMobileFilters(false)}
            />
        )}

        {/* Sidebar Filters */}
        <aside className={`shop-sidebar ${showMobileFilters ? 'show-mobile' : ''}`}>
            <div className="sidebar-header-mobile">
                <h3>Filters</h3>
                <button onClick={() => setShowMobileFilters(false)} className="close-filters-btn">✕</button>
            </div>
            <h3 className="sidebar-title">Departments</h3>
            <ul className="sidebar-list">
                {["Cone", "Cup", "Stick", "Cake", "Tub", "Family Pack"].map(cat => (
                    <li key={cat} onClick={() => toggleCategory(cat)}>
                        <div className={`custom-checkbox ${selectedCategories.includes(cat) ? 'checked' : ''}`}>
                            {selectedCategories.includes(cat) && "✓"}
                        </div>
                        <label style={{cursor: 'pointer'}}>{cat}</label>
                    </li>
                ))}
            </ul>

            <h3 className="sidebar-title">Customer Reviews</h3>
            <ul className="sidebar-list">
                {[4, 3, 2].map(star => (
                    <li key={star} onClick={() => setMinRating(star === minRating ? 0 : star)} className={minRating === star ? 'active-filter' : ''}>
                        <div className={`radio-dot ${minRating === star ? 'selected' : ''}`}></div>
                        <span className="stars">{'⭐'.repeat(star)}</span> & Up
                    </li>
                ))}
            </ul>

            <h3 className="sidebar-title">Price</h3>
            <ul className="sidebar-list">
                <li onClick={() => setPriceRange(priceRange === 'under200' ? null : 'under200')}>
                    <div className={`radio-dot ${priceRange === 'under200' ? 'selected' : ''}`}></div> Under ₹200
                </li>
                <li onClick={() => setPriceRange(priceRange === '200to400' ? null : '200to400')}>
                     <div className={`radio-dot ${priceRange === '200to400' ? 'selected' : ''}`}></div> ₹200 - ₹400
                </li>
                <li onClick={() => setPriceRange(priceRange === 'over400' ? null : 'over400')}>
                     <div className={`radio-dot ${priceRange === 'over400' ? 'selected' : ''}`}></div> Over ₹400
                </li>
            </ul>
        </aside>

        {/* Main Content */}
        <main className="shop-content">
             {/* Shop Header / Search */}
            <header className="shop-main-header glass-panel">
                <div className="header-greeting">
                    <span className="text-secondary">Deliver to</span>
                    <h3>{user.name}</h3>
                </div>
                <div className="shop-search-bar">
                     <input 
                        type="text" 
                        placeholder="Search for flavors..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                     />
                     <button className="search-btn mobile-filter-toggle" onClick={() => setShowMobileFilters(!showMobileFilters)}><Filter size={18} /></button>
                </div>
            </header>

            <h2 className="results-info">
                {filteredProducts.length > 0 
                  ? `Results for "${searchTerm || 'All Flavors'}"` 
                  : `No results found for "${searchTerm}"`}
            </h2>

            <div className="products-list-view">
            {filteredProducts.map(product => (
                <div key={product.id} className="shop-product-card glass-panel">
                    <div className="shop-card-image" onClick={() => navigate(`/shop/${product.id}`)} style={{cursor: 'pointer'}}>
                        <img src={product.image} alt={product.name} />
                         {product.isBestSeller && <span className="best-seller-badge">Best Seller</span>}
                    </div>
                    <div className="shop-card-details">
                        <h2 className="shop-product-title" onClick={() => navigate(`/shop/${product.id}`)} style={{cursor: 'pointer'}}>{product.name}</h2>
                        <div className="shop-product-rating">
                            <span className="stars">{'⭐'.repeat(Math.round(product.rating))}</span>
                            <span className="count">({product.reviews})</span>
                        </div>
                        <p className="shop-product-delivery">FREE delivery <strong>{product.delivery}</strong> on your first order</p>
                        <p className="shop-product-desc">{product.description}</p>
                    </div>
                    <div className="shop-card-actions">
                        <div className="price-tag">
                            <span className="currency">₹</span>
                            <span className="amount">{product.price}</span>
                        </div>
                        <div className="action-buttons">
                            <button className="btn btn-outline btn-shop-action" onClick={() => handleAddToCart(product)}>Add to Cart</button>
                            {/* <button className="btn btn-primary btn-shop-action" onClick={() => { handleAddToCart(product); navigate('/cart'); }}>Buy Now</button> */}
                        </div>
                    </div>
                </div>
            ))}
            </div>
        </main>
      </div>
    </div>
  );
};

export default Shop;
