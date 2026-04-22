import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { MapPin, CreditCard, CheckCircle } from 'lucide-react';
import axios from 'axios';
import './Checkout.css';
import { toast } from 'react-toastify';

const Checkout = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { cartItems, getCartTotal, clearCart } = useCart();
    const { user } = useAuth();
    
    // Safely access state defaults in case user navigates directly
    const [orderData, setOrderData] = useState({
        subTotal: state?.subTotal || getCartTotal(),
        taxAmount: state?.taxAmount || getCartTotal() * 0.05,
        discount: state?.discount || 0,
        totalAmount: state?.totalAmount || (getCartTotal() * 1.05),
        selectedAddress: state?.selectedAddress || null,
        couponCode: state?.couponCode || null
    });

    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [loading, setLoading] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);

    useEffect(() => {
        if (!state && cartItems.length > 0) {
            // Recalculate if state missing (direct navigation)
            const sub = getCartTotal();
            const tax = sub * 0.05;
            setOrderData({
                subTotal: sub,
                taxAmount: tax,
                discount: 0,
                totalAmount: sub + tax,
                selectedAddress: null // Force user to go back if critical
            });
        }
        
        if (cartItems.length === 0 && !orderPlaced) {
            navigate('/cart');
        }
    }, [state, cartItems, navigate, getCartTotal, orderPlaced]);

    if (!orderData.selectedAddress) {
        return (
            <div className="checkout-page container">
                <div className="glass-panel" style={{textAlign: 'center', padding: '3rem'}}>
                    <h2>Missing Shipping Information</h2>
                    <p>Please select an address from your cart.</p>
                    <button onClick={() => navigate('/cart')} className="btn btn-primary" style={{marginTop: '1rem'}}>
                        Back to Cart
                    </button>
                </div>
            </div>
        );
    }

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePlaceOrder = async () => {
        setLoading(true);
        try {
            const orderPayload = {
                userData: orderData.selectedAddress, 
                items: cartItems.map(item => ({
                    product: item.id,
                    quantity: item.quantity,
                    price: item.price
                })),
                amount: orderData.totalAmount, // Keeps legacy support if needed
                totalAmount: orderData.totalAmount,
                subTotal: orderData.subTotal,
                taxAmount: orderData.taxAmount,
                discountAmount: orderData.discount,
                couponCode: orderData.couponCode,
                paymentMethod: paymentMethod,
                paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid' 
            };

            if (paymentMethod === 'online') {
                const isLoaded = await loadRazorpay();
                if (!isLoaded) {
                    toast.error('Razorpay SDK failed to load. Are you online?');
                    setLoading(false);
                    return;
                }

                // Get token from localStorage to ensure we use the correct user identity
                const token = localStorage.getItem('userToken');
                const config = { 
                    headers: { token },
                    withCredentials: true 
                };

                // 1. Create Order on Server
                const { data: orderResponse } = await axios.post('/api/payment/create-order', {
                    amount: orderData.totalAmount
                }, config);

                if (!orderResponse.success) {
                    toast.error('Failed to create payment order');
                    setLoading(false);
                    return;
                }

                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_YOUR_KEY_HERE",
                    amount: orderResponse.order.amount,
                    currency: orderResponse.order.currency,
                    name: "Frozen Delights",
                    description: "Payment for your order",
                    order_id: orderResponse.order.id,
                    handler: async function (response) {
                        // 2. Verified Payment on Server
                        try {
                             const { data: verifyResponse } = await axios.post('/api/payment/verify', response, config);
                             
                             if (verifyResponse.success) {
                                 // 3. Place Actual Order
                                 orderPayload.paymentStatus = 'paid';
                                 // Add Razorpay details to payload so backend can save them
                                 orderPayload.razorpayOrderId = response.razorpay_order_id;
                                 orderPayload.paymentId = response.razorpay_payment_id;
                                 orderPayload.paymentSignature = response.razorpay_signature;

                                 if (!orderPayload.userData.country) {
                                     orderPayload.userData.country = 'India';
                                 }

                                 const { data } = await axios.post('/api/orders/create', orderPayload, config);
                                 
                                 if (data.success) {
                                     setOrderPlaced(true);
                                     clearCart();
                                     toast.success("Order Placed Successfully!");
                                     navigate('/profile'); 
                                 } else {
                                     console.error("Order Creation Failed:", data.message);
                                     toast.error(data.message || "Failed to place order.");
                                 }
                             } else {
                                 console.error("Payment Verification Failed:", verifyResponse);
                                 toast.error("Payment verification failed");
                             }
                        } catch (err) {
                            console.error("Payment Handler Error:", err);
                            toast.error("Payment verification failed");
                        }
                    },
                    prefill: {
                        name: orderData.selectedAddress.name || "Customer", 
                        email: user?.email || "customer@example.com",
                        contact: orderData.selectedAddress.mobile || "9999999999"
                    },
                    theme: {
                        color: "#3399cc"
                    }
                };
                
                const rzp1 = new window.Razorpay(options);
                
                rzp1.on('payment.failed', function (response){
                    console.error("Razorpay Payment Failed:", response.error);
                    toast.error("Payment Failed. Please try again.");
                    setLoading(false);
                });

                rzp1.open();
                setLoading(false); 
                return;
            }
            
            // COD FLOW
            const token = localStorage.getItem('userToken');
            const { data } = await axios.post('/api/orders/create', orderPayload, { 
                headers: { token },
                withCredentials: true 
            });
            
            if (data.success) {
                setOrderPlaced(true);
                clearCart();
                toast.success("Order Placed Successfully!");
                navigate('/profile'); 
            } else {
                 toast.error(data.message || "Failed to place order.");
            }

        } catch (error) {
            console.error("Order placement failed:", error);
            toast.error("Failed to place order. Please try again.");
        } finally {
             if (paymentMethod !== 'online') setLoading(false);
        }
    };

    return (
        <div className="checkout-page">
            <div className="container checkout-container">
                <h1 className="checkout-title">Checkout</h1>
                
                <div className="checkout-grid">
                    {/* Left Column: Details */}
                    <div className="checkout-details">
                        {/* 1. Shipping Details */}
                        <div className="checkout-section glass-panel">
                            <h2 className="section-title">
                                <MapPin size={20} className="icon" /> Shipping Details
                            </h2>
                            <div className="address-card">
                                <h3>Sending to:</h3>
                                <p>{orderData.selectedAddress.street}</p>
                                <p>{orderData.selectedAddress.city}, {orderData.selectedAddress.state} - {orderData.selectedAddress.zipCode}</p>
                                <p><strong>Mobile:</strong> {orderData.selectedAddress.mobile}</p>
                            </div>
                        </div>

                        {/* 2. Payment Method */}
                        <div className="checkout-section glass-panel">
                             <h2 className="section-title">
                                <CreditCard size={20} className="icon" /> Payment Method
                            </h2>
                            <div className="payment-options">
                                <label className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                                    <input 
                                        type="radio" 
                                        name="payment" 
                                        value="cod" 
                                        checked={paymentMethod === 'cod'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <span className="radio-custom"></span>
                                    <div>
                                        <h4>Cash on Delivery</h4>
                                        <p className="text-secondary">Pay when you receive</p>
                                    </div>
                                </label>
                                <label className={`payment-option ${paymentMethod === 'online' ? 'selected' : ''}`}>
                                     <input 
                                        type="radio" 
                                        name="payment" 
                                        value="online" 
                                        checked={paymentMethod === 'online'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <span className="radio-custom"></span>
                                    <div>
                                        <h4>Online Payment (Razorpay)</h4>
                                        <p className="text-secondary">UPI, Cards, NetBanking</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Summary (Again) */}
                    <div className="checkout-summary glass-panel">
                        <h2>Order Summary</h2>
                         <div className="summary-items-preview">
                            {cartItems.map(item => (
                                <div key={item.id} className="summary-item-row">
                                    <span>{item.name} x {item.quantity}</span>
                                    <span>₹{item.price * item.quantity}</span>
                                </div>
                            ))}
                        </div>
                        <hr className="summary-divider" />
                        
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>₹{orderData.subTotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Tax (5%)</span>
                            <span>₹{orderData.taxAmount.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Delivery</span>
                            <span className="text-success">Free</span>
                        </div>
                        {orderData.discount > 0 && (
                             <div className="summary-row discount-row">
                                <span>Discount {orderData.couponCode ? `(${orderData.couponCode})` : ''}</span>
                                <span>-₹{orderData.discount.toFixed(2)}</span>
                            </div>
                        )}
                        <hr className="summary-divider" />
                        <div className="summary-row summary-total">
                            <span>Total to Pay</span>
                            <span>₹{orderData.totalAmount.toFixed(2)}</span>
                        </div>

                        <button 
                            className="btn btn-primary btn-block" 
                            onClick={handlePlaceOrder}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Place Order'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
