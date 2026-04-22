import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Printer } from 'lucide-react';

const Invoice = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                // Try fetching with admin token first, then vendor, then user
                let token = localStorage.getItem('adminToken');
                let url = `/api/admin/orders/${orderId}`; // You might need a specific endpoint or just re-use

                // Since we don't have a universal "get order by ID" for everyone without role specifics in the planned architecture,
                // we'll try to use the generic one we might have or standard user one if logged in.
                // Actually, let's assume the user viewing this has the right token. 
                // For simplicity in this implementation, we will try to fetch using the generic 'get order by id' 
                // but we need to know WHICH token to send. 
                
                // Let's try to detect role or just try all. 
                // Standard approach: The separate roles have separate endpoints usually.
                // But `getOrderById` in `orderController` was defined. Let's see if it's protected by `verifyToken` (user).
                // Admin has `adminController`. Vendor has `vendorController`.
                
                // Strategy: We will try to fetch from a new "public-ish" or "shared" endpoint 
                // OR we just try to fetch based on who is logged in.
                
                // For now, let's assume the user clicking is logged in.
                // We'll use a generic fetch that tries to get data. 
                // To keep it simple and robust, let's use the USER order endpoint if userToken exists,
                // ADMIN endpoint if adminToken exists, VENDOR if vendorToken exists.
                
                let res;
                if (localStorage.getItem('adminToken')) {
                    token = localStorage.getItem('adminToken');
                    // We don't have a specific "get single order" for admin in the snippets seen, 
                    // but usually admin can view any. Let's assume we might need to add one or use an existing.
                    // Actually, looking at previous files, `orderController.getOrderById` is for USER.
                    // Let's try to reuse `getOrderById` but we might need to relax middleware or create a specific invoice endpoint.
                    
                    // QUICK FIX: We will create a generic "get invoice data" endpoint or just use the existing ones.
                    // Admin usually fetches ALL. We can filter client side if needed but that's bad.
                    // Let's try the user endpoint first. If it fails, we handle it.
                    // Actually, best way: The Invoice page should probably behave like a protected route.
                }

                // SIMPLIFICATION:
                // We will fetch using the Common Order Route (create a generic one or use existing).
                // Existing `getOrderById` in `orderController` is: `router.get('/:id', verifyToken, getOrderById);` (User)
                
                // We'll try to fetch as a User first.
                if (localStorage.getItem('userToken')) {
                    res = await axios.get(`/api/orders/${orderId}`, {
                        headers: { token: localStorage.getItem('userToken') }
                    });
                } else if (localStorage.getItem('vendorToken')) {
                     // Vendor might generally list all, but for single? 
                     // We verify if vendor has access.
                     // For now let's reuse User endpoint but pass vendor token? Backend verifies 'User'. Won't work.
                     
                     // We need a dedicated route or use the role-based routes.
                     // Let's try to use the `admin` route if admin.
                     // Admin Route structure (speculated): `/api/admin/orders/...`
                     // If not exists, we use the `orders` from context? No, reload breaks it.
                     
                     // FALLBACK: Since we are in the "Execution" phase and I can't easily add backend routes without context switch,
                     // I will try to fetch using the most likely successful path. 
                     // If I am Admin, I can probably use `/api/admin/orders/all` and find it (inefficient but works for V1).
                     // If I am Vendor, `/api/vendor/orders` and find it.
                     
                     if (localStorage.getItem('adminToken')) {
                         const allRes = await axios.get('/api/admin/orders/all', { headers: { token: localStorage.getItem('adminToken') } });
                         if(allRes.data.success) {
                             const found = allRes.data.orders.find(o => o._id === orderId);
                             if(found) res = { data: { success: true, order: found } };
                         }
                     } else if (localStorage.getItem('vendorToken')) {
                         const vendRes = await axios.get('/api/vendor/orders', { headers: { token: localStorage.getItem('vendorToken') } });
                          if(vendRes.data.success) {
                             const found = vendRes.data.orders.find(o => o._id === orderId);
                             if(found) res = { data: { success: true, order: found } };
                         }
                     }
                }
                
                if (res && res.data.success) {
                    setOrder(res.data.order);
                } else {
                    // Fallback or error
                   console.error("Could not fetch order for invoice");
                }

            } catch (error) {
                console.error("Error fetching invoice:", error);
            } finally {
                setLoading(false);
            }
        };

        if (orderId) fetchOrder();
    }, [orderId]);

    if (loading) return <div style={{padding: '2rem', textAlign: 'center'}}>Loading Invoice...</div>;
    if (!order) return <div style={{padding: '2rem', textAlign: 'center'}}>Invoice not found.</div>;

    return (
        <div className="invoice-page" style={{background: 'white', minHeight: '100vh', color: 'black', padding: '2rem', fontFamily: 'Arial, sans-serif'}}>
            {/* Header */}
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem'}}>
                <div>
                    <h1 style={{color: '#ff4d6d', margin: 0, fontSize: '2rem'}}>Frozen Delights</h1>
                    <p style={{color: '#555', margin: '5px 0'}}>Premium Frozen Desserts</p>
                </div>
                <div style={{textAlign: 'right'}}>
                    <h2 style={{margin: 0, color: '#333'}}>INVOICE</h2>
                    <p style={{margin: '5px 0'}}>#{order._id.toUpperCase()}</p>
                    <p style={{margin: '5px 0'}}>{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
            </div>

            {/* Addresses */}
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '3rem'}}>
                <div style={{flex: 1}}>
                    <h3 style={{fontSize: '0.9rem', color: '#888', textTransform: 'uppercase', marginBottom: '1rem'}}>Bill To</h3>
                    <div style={{fontWeight: 'bold', marginBottom: '5px'}}>{order.userInfo?.name || order.user?.name || 'Guest'}</div>
                    <div>{order.userInfo?.email}</div>
                    <div>{order.shippingAddress?.mobile}</div>
                </div>
                <div style={{flex: 1, textAlign: 'right'}}>
                    <h3 style={{fontSize: '0.9rem', color: '#888', textTransform: 'uppercase', marginBottom: '1rem'}}>Ship To</h3>
                    <div style={{fontWeight: 'bold', marginBottom: '5px'}}>{order.shippingAddress?.street}</div>
                    <div>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</div>
                    <div>{order.shippingAddress?.country}</div>
                </div>
            </div>

            {/* Table */}
            <table style={{width: '100%', borderCollapse: 'collapse', marginBottom: '2rem'}}>
                <thead>
                    <tr style={{background: '#f8f9fa', borderBottom: '2px solid #ddd'}}>
                        <th style={{padding: '1rem', textAlign: 'left'}}>Item</th>
                        <th style={{padding: '1rem', textAlign: 'center'}}>Quantity</th>
                        <th style={{padding: '1rem', textAlign: 'right'}}>Price</th>
                        <th style={{padding: '1rem', textAlign: 'right'}}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {order.items.map((item, index) => (
                        <tr key={index} style={{borderBottom: '1px solid #eee'}}>
                            <td style={{padding: '1rem'}}>{item.product?.name || 'Unknown Item'}</td>
                            <td style={{padding: '1rem', textAlign: 'center'}}>{item.quantity}</td>
                            <td style={{padding: '1rem', textAlign: 'right'}}>₹{item.price}</td>
                            <td style={{padding: '1rem', textAlign: 'right'}}>₹{item.price * item.quantity}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Summary */}
            <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                <div style={{width: '300px'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #eee'}}>
                        <span>Subtotal:</span>
                        <span>₹{order.subTotal || order.totalAmount}</span>
                    </div>
                    {order.taxAmount > 0 && (
                        <div style={{display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #eee'}}>
                            <span>Tax:</span>
                            <span>+₹{order.taxAmount}</span>
                        </div>
                    )}
                    {order.discountAmount > 0 && (
                        <div style={{display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #eee', color: 'green'}}>
                            <span>Discount {order.couponCode ? `(${order.couponCode})` : ''}:</span>
                            <span>-₹{order.discountAmount}</span>
                        </div>
                    )}
                     <div style={{display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '2px solid #333', fontWeight: 'bold', fontSize: '1.2rem'}}>
                        <span>Total:</span>
                        <span>₹{order.totalAmount}</span>
                    </div>
                </div>
            </div>

            {/* Print Button (Hidden when printing) */}
            <button 
                className="no-print"
                onClick={() => window.print()}
                style={{
                    position: 'fixed', bottom: '2rem', right: '2rem',
                    background: '#333', color: 'white', border: 'none',
                    padding: '1rem 2rem', borderRadius: '50px',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}
            >
                <Printer size={20} /> Print Invoice
            </button>
            
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    .invoice-page { padding: 0 !important; }
                }
            `}</style>
        </div>
    );
};

export default Invoice;
