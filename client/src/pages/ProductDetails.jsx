
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Truck, ShieldCheck, ArrowRight, Heart } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import './ProductDetails.css';


const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToCart } = useCart();
    
    // State
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [suggestedProducts, setSuggestedProducts] = useState([]);
    
    // Review State
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);

    const fetchProductDetails = async () => {
        try {
            setLoading(true);
            // Fetch Single Product
            const { data } = await axios.get(`/api/products/${id}`);
            if (data.success) {
                setProduct(data.product);
                // Fetch Suggestions (simulated for now, or fetch all and filter)
                // specific suggestions endpoint would be better, but we can reuse get all for now
                 const allRes = await axios.get('/api/products');
                 if(allRes.data.success) {
                     const others = allRes.data.product.filter(p => p._id !== id);
                     setSuggestedProducts(others.sort(() => 0.5 - Math.random()).slice(0, 3));
                 }

            } else {
                setError("Product not found");
            }
        } catch (err) {
            console.error("Error details:", err);
            setError("Could not fetch product details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        if (id) fetchProductDetails();
    }, [id]);

    const handleAddToCart = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (product) {
            addToCart({
                id: product._id,
                name: product.name,
                price: product.price,
                image: product.image,
                stock: product.stock
            });
            toast.success(`Added ${product.name} to cart!`);
        }
    };

    const submitReviewHandler = async (e) => {
        e.preventDefault();
        if (!user) {
            alert("Please login to write a review");
            navigate('/login');
            return;
        }
        setSubmittingReview(true);
        try {
            const token = localStorage.getItem('userToken');
            const config = {
                headers: { token },
                withCredentials: true
            };
            
            const { data } = await axios.put(`/api/products/review/${id}`, { rating, comment }, config);
            
            if (data.success) {
                alert("Review Submitted!");
                setComment("");
                setRating(5);
                fetchProductDetails(); // Refresh to show new review
            } else {
                alert(data.message);
            }

        } catch (error) {
             alert(error.response?.data?.message || "Failed to submit review");
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) return (
        <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div className="loader"></div>
        </div>
    );

    if (error || !product) return (
         <div style={{height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
            <h3>Product not found</h3>
            <button onClick={() => navigate('/shop')} className="btn btn-primary" style={{marginTop: '1rem'}}>Back to Shop</button>
        </div>
    );

    return (
        <div className="product-details-page">
            <div className="container">
                <div className="product-details-container">
                    {/* Left: Image */}
                    <div className="product-gallery">
                        <div className="main-image-container">
                            <img src={product.image || "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=800&q=80"} alt={product.name} className="main-image" />
                        </div>
                    </div>

                    {/* Right: Info */}
                    <div className="product-info-section glass-panel" style={{padding: '2.5rem', borderRadius: '16px'}}>
                        <div className="product-header">
                            <span className="product-category-crumb">Frozen Delights / {product.category}</span>
                            <h1 className="product-title-large">{product.name}</h1>
                            <div className="product-meta">
                                <div className="rating-badge">
                                    <Star fill="#ffd700" size={16} /> 
                                    <span>{product.rating?.toFixed(1) || 0}</span>
                                </div>
                                <span className="review-count">{product.numReviews} Reviews</span>
                                <span className={`stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                    {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                </span>
                            </div>
                        </div>

                        <div className="product-price-large">
                            <span className="currency-symbol">₹</span>
                            {product.price}
                        </div>

                        <p className="product-description-full">
                            {product.description}
                        </p>

                        <div className="product-highlights">
                            <div className="highlight-item">
                                <Truck size={18} className="highlight-icon" />
                                <span style={{color: 'var(--text-primary)'}}>Free Delivery</span>
                            </div>
                            <div className="highlight-item">
                                <ShieldCheck size={18} className="highlight-icon" />
                                <span style={{color: 'var(--text-primary)'}}>Quality Guarantee</span>
                            </div>
                        </div>

                        <div className="product-actions">
                            <button 
                                className="btn-add-cart" 
                                onClick={handleAddToCart} 
                                style={{width: '100%'}}
                                disabled={product.stock <= 0}
                            >
                                <ShoppingCart size={20} />
                                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="reviews-container glass-panel" style={{marginTop: '2rem', padding: '2rem', borderRadius: '16px'}}>
                    <h2 style={{marginBottom: '1.5rem'}}>Reviews ({product.numReviews})</h2>
                    
                    {product.reviews.length === 0 && (
                        <div className="no-reviews">No reviews yet. Be the first to review!</div>
                    )}

                    <div className="reviews-list">
                        {product.reviews.map((review, idx) => (
                            <div key={idx} className="review-item" style={{marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem'}}>
                                <div className="review-header" style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                                    <strong style={{fontSize: '1.1rem'}}>{review.name}</strong>
                                    <div className="rating-stars" style={{display: 'flex', color: '#ffd700'}}>
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={16} fill={i < review.rating ? "#ffd700" : "none"} stroke="#ffd700" />
                                        ))}
                                    </div>
                                </div>
                                <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem'}}>
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </div>
                                <p>{review.comment}</p>
                            </div>
                        ))}
                    </div>

                    <div className="write-review-section" style={{marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)'}}>
                        <h3>Write a Review</h3>
                        {user ? (
                            <form onSubmit={submitReviewHandler} style={{marginTop: '1rem', maxWidth: '600px'}}>
                                <div className="form-group" style={{marginBottom: '1rem'}}>
                                    <label style={{display: 'block', marginBottom: '0.5rem'}}>Rating</label>
                                    <select 
                                        value={rating} 
                                        onChange={(e) => setRating(e.target.value)} 
                                        className="form-input"
                                        style={{padding: '0.5rem', borderRadius: '8px', background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)'}}
                                    >
                                        <option value="5">5 - Excellent</option>
                                        <option value="4">4 - Very Good</option>
                                        <option value="3">3 - Good</option>
                                        <option value="2">2 - Fair</option>
                                        <option value="1">1 - Poor</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{marginBottom: '1rem'}}>
                                    <label style={{display: 'block', marginBottom: '0.5rem'}}>Comment</label>
                                    <textarea 
                                        className="form-input" 
                                        rows="3" 
                                        value={comment} 
                                        onChange={(e) => setComment(e.target.value)}
                                        required
                                        style={{width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)'}}
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </form>
                        ) : (
                            <div className="login-to-review" style={{marginTop: '1rem'}}>
                                <p>Please <span style={{color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold'}} onClick={() => navigate('/login')}>login</span> to write a review.</p>
                            </div>
                        )}
                    </div>
                </div>


                {/* Suggestions */}
                <div className="suggestions-section" style={{marginTop: '3rem'}}>
                    <div className="section-header">
                        <h3>You Might Also Like</h3>
                        <p className="text-secondary">Discover more flavors to love</p>
                    </div>
                    
                    <div className="suggestions-grid">
                        {suggestedProducts.map(p => (
                            <div key={p._id} className="suggestion-card" onClick={() => navigate(`/shop/${p._id}`)}>
                                <div className="suggestion-image">
                                    <img src={p.image || "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=800&q=80"} alt={p.name} />
                                </div>
                                <div className="suggestion-details">
                                    <h4 className="suggestion-title">{p.name}</h4>
                                    <div className="suggestion-footer">
                                         <div className="suggestion-price">
                                            <span className="currency">₹</span>
                                            <span className="amount">{p.price}</span>
                                        </div>
                                        <div className="suggestion-actions">
                                            <button 
                                                className="btn-view-suggestion"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/shop/${p._id}`);
                                                }}
                                                style={{width: '100%'}}
                                            >
                                                View
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
