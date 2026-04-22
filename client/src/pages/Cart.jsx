import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, MapPin, Tag } from 'lucide-react';
import axios from 'axios';
import './Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  // Use addresses from AuthContext directly
  useEffect(() => {
    if (user && user.addresses) {
        setAddresses(user.addresses);
        if (user.addresses.length > 0 && !selectedAddress) {
            setSelectedAddress(user.addresses[0]);
        }
    }
  }, [user]); // Removed axios call

  const subTotal = getCartTotal();
  const SOURCE_STATE = 'Gujarat'; // Vendor/Platform State
  
  // Tax Calculations
  // If no address selected, default to Intra-state (CGST+SGST) for display
  // If address selected: Check if State matches Source State
  const isInterState = selectedAddress?.state && selectedAddress.state.toLowerCase() !== SOURCE_STATE.toLowerCase();
  
  const taxRate = 0.05;
  const taxAmount = subTotal * taxRate;
  
  // For display components (mathematically total tax is same 5%, just split differs)
  const cgst = subTotal * 0.025; 
  const sgst = subTotal * 0.025;
  
  const totalAmount = subTotal + taxAmount - discount;

  const handleApplyCoupon = async () => {
      if (!couponCode.trim()) return;

      try {
          // Assuming single vendor cart for now, or taking vendor from first item
          const vendorId = cartItems.length > 0 ? cartItems[0].vendor : null;
          const token = localStorage.getItem('userToken');

          const res = await axios.post('/api/user/verify-coupon', {
              code: couponCode,
              cartTotal: subTotal,
              vendorId,
              cartItems 
          }, { 
              headers: { token },
              withCredentials: true 
          });

          if (res.data.success) {
              setDiscount(res.data.coupon.discountAmount);
              setAppliedCoupon(res.data.coupon);
              setIsCouponApplied(true);
              setCouponMessage("Coupon applied successfully!");
          } else {
              setCouponMessage(res.data.message);
              setDiscount(0);
              setIsCouponApplied(false);
              setAppliedCoupon(null);
          }
      } catch (error) {
          console.error("Coupon error:", error);
          setCouponMessage("Error applying coupon");
      }
  };

  const removeCoupon = () => {
      setCouponCode('');
      setDiscount(0);
      setIsCouponApplied(false);
      setAppliedCoupon(null);
      setCouponMessage('');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="container cart-container">
          <div className="glass-panel empty-cart-message">
            <h2>Your Cart is Empty</h2>
            <p>Looks like you haven't added any frozen delights yet.</p>
            <Link to="/shop" className="btn btn-primary" style={{marginTop: '1rem', display: 'inline-block'}}>
              Browse Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container cart-container">
        <h1 className="cart-title">Your <span className="text-gradient">Cart</span></h1>
        
        <div className="cart-grid">
          {/* Left Column: Cart Items */}
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.id} className="cart-item-card glass-panel">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="cart-item-image" 
                  onClick={() => navigate(`/shop/${item.id}`)}
                  style={{cursor: 'pointer'}}
                />
                
                <div className="cart-item-details">
                  <h3 onClick={() => navigate(`/shop/${item.id}`)} style={{cursor: 'pointer'}}>{item.name}</h3>
                  <p className="cart-item-price">₹{item.price}</p>
                </div>

                <div className="cart-item-actions">
                  <button 
                    className="qty-btn" 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <span style={{fontWeight: 'bold', width: '20px', textAlign: 'center'}}>{item.quantity}</span>
                  <button 
                    className="qty-btn" 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus size={16} />
                  </button>

                  <button 
                    className="remove-btn"
                    onClick={() => removeFromCart(item.id)}
                    aria-label="Remove item"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
            
            <Link to="/shop" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginTop: '1rem'}}>
                <ArrowLeft size={16} /> Continue Shopping
            </Link>
          </div>

          {/* Right Column: Order Summary */}
          <div className="cart-summary glass-panel">
            <h2>Order Summary</h2>
            
            {/* Address Selection - Auto-selected if available */}
            <div className="summary-section">
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)'}}>
                    <MapPin size={18} /> <strong>Delivery Address</strong>
                </div>
                {addresses.length > 0 && selectedAddress ? (
                    <div className="address-selector">
                        <select 
                            value={selectedAddress._id} 
                            onChange={(e) => setSelectedAddress(addresses.find(a => a._id === e.target.value))}
                            className="address-dropdown"
                        >
                            {addresses.map(addr => (
                                <option key={addr._id} value={addr._id}>
                                    {addr.street}, {addr.city}
                                </option>
                            ))}
                        </select>
                        <p className="selected-address-details" style={{marginTop: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '4px'}}>
                            <strong>{user.name}</strong><br/>
                            {selectedAddress.street}, {selectedAddress.city}<br/>
                            {selectedAddress.state} - {selectedAddress.zipCode}<br/>
                            Phone: {selectedAddress.mobile}
                        </p>
                    </div>
                ) : (
                    <div className="no-address-warning" style={{color: '#ff6b6b', fontSize: '0.9rem'}}>
                        No address found. Please add an address to proceed.
                        <Link to="/profile" style={{display: 'block', marginTop: '0.5rem', textDecoration: 'underline'}}>Add New Address</Link>
                    </div>
                )}
            </div>
            
            <hr className="summary-divider"/>

            {/* Product List in Summary */}
            <div className="summary-items-list" style={{marginBottom: '1rem', maxHeight: '150px', overflowY: 'auto'}}>
                {cartItems.map(item => (
                    <div key={item.id} className="summary-item-row" style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-secondary)'}}>
                         <span>{item.name} <span style={{fontSize: '0.8rem'}}>x{item.quantity}</span></span>
                         <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                ))}
            </div>
            
            <hr className="summary-divider"/>

            {/* Price Details */}
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{subTotal.toFixed(2)}</span>
            </div>
            
            {/* Tax Logic: Intra-state (CGST+SGST) vs Inter-state (IGST) */}
            {selectedAddress?.state?.toLowerCase() === 'gujarat' || !selectedAddress ? (
                <>
                    <div className="summary-row">
                      <span>CGST (2.5%)</span>
                      <span>₹{cgst.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                      <span>SGST (2.5%)</span>
                      <span>₹{sgst.toFixed(2)}</span>
                    </div>
                </>
            ) : (
                <div className="summary-row">
                  <span>IGST (5%)</span>
                  <span>₹{taxAmount.toFixed(2)}</span>
                </div>
            )}
            
            <div className="summary-row">
              <span>Delivery Fee</span>
              <span className="text-success">Free</span>
            </div>

            {/* Coupon Section */}
            <div className="coupon-section">
                <div className="coupon-input-group">
                    <Tag size={16} className="coupon-icon"/>
                    <input 
                        type="text" 
                        placeholder="Promo Code" 
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        disabled={isCouponApplied}
                    />
                    {isCouponApplied ? (
                        <button onClick={removeCoupon} className="btn-remove-coupon">✕</button>
                    ) : (
                        <button onClick={handleApplyCoupon} className="btn-apply-coupon">Apply</button>
                    )}
                </div>
                {couponMessage && (
                    <p className={`coupon-message ${isCouponApplied ? 'success' : 'error'}`}>{couponMessage}</p>
                )}
            </div>

            {isCouponApplied && (
                 <div className="summary-row discount-row">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-₹{discount.toFixed(2)}</span>
                </div>
            )}

            <hr className="summary-divider"/>

            <div className="summary-row summary-total">
              <span>Total Amount</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
            
            <button 
              className="btn btn-primary btn-block" 
              style={{marginTop: '1.5rem'}}
              onClick={() => {
                  if(!selectedAddress) {
                      alert("Please select or add a delivery address.");
                      return;
                  }
                  navigate('/checkout', { 
                      state: { 
                        subTotal, 
                        totalAmount, 
                        discount, 
                        taxAmount, 
                        selectedAddress,
                        couponCode: isCouponApplied && appliedCoupon ? appliedCoupon.code : null
                      } 
                  })
              }}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
