import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingBag, Clock, CheckCircle, Truck, XCircle, Package, X, FileText, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './VendorOrders.css'; // Import custom styles

import Pagination from '../../components/Pagination';
import { toast } from 'react-toastify';
import ConfirmToast from '../../components/ConfirmToast';

const VendorOrders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [statusToUpdate, setStatusToUpdate] = useState('');

    const [selectedAddressOrder, setSelectedAddressOrder] = useState(null);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const openAddressModal = (order) => {
        setSelectedAddressOrder(order);
        setIsAddressModalOpen(true);
    };

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('vendorToken');
            const res = await axios.get('/api/vendor/orders', { 
                headers: { token },
                withCredentials: true 
            });
            if (res.data.success) {
                setOrders(res.data.orders);
            }
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const getStatusBadge = (status) => {
        switch(status) {
            case 'Pending': 
            case 'placed': return <span className="status-badge status-pending"><Clock size={14}/> Placed</span>;
            case 'Processing': 
            case 'processing': return <span className="status-badge status-approved"><Clock size={14}/> Processing</span>; 
            case 'Delivered': 
            case 'delivered': return <span className="status-badge status-approved"><CheckCircle size={14}/> Delivered</span>;
            case 'Cancelled': 
            case 'cancelled': return <span className="status-badge status-rejected"><XCircle size={14}/> Cancelled</span>;
            default: return <span>{status}</span>;
        }
    };

    const openUpdateModal = (order) => {
        setSelectedOrder(order);
        setStatusToUpdate(order.status || 'placed');
        setIsModalOpen(true);
    };

    const handleUpdateSubmit = async () => {
        if (!selectedOrder) return;

        try {
            const token = localStorage.getItem('vendorToken');
            const res = await axios.put('/api/vendor/order/status', {
                orderId: selectedOrder._id,
                status: statusToUpdate
            }, { 
                headers: { token },
                withCredentials: true 
            });

            if (res.data.success) {
                toast.success("Status updated successfully");
                setIsModalOpen(false);
                fetchOrders(); // Refresh list
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.error("Update failed", error);
            toast.error("Failed to update status");
        }
    };

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="vendor-orders-page">
            <div className="page-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
                <div>
                    <h1>Orders</h1>
                    <p className="text-secondary">Track and manage customer orders</p>
                </div>
                <div className="stats-mini" style={{display: 'flex', gap: '1rem'}}>
                     <div className="glass-panel" style={{padding: '0.5rem 1rem', fontSize: '0.9rem'}}>
                        Pending: <strong>{orders.filter(o => o.status === 'placed' || o.status === 'pending').length}</strong>
                     </div>
                     <div className="glass-panel" style={{padding: '0.5rem 1rem', fontSize: '0.9rem'}}>
                        Total Revenue: <strong>₹{orders.reduce((acc, order) => acc + (order.vendorTotal || 0), 0)}</strong>
                     </div>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">Loading orders...</div>
            ) : orders.length === 0 ? (
                 <div className="empty-state glass-panel">
                    <Package size={48} className="text-secondary" />
                    <h3>No orders yet</h3>
                    <p className="text-secondary">Your products haven't been ordered yet.</p>
                 </div>
            ) : (
                <div className="table-container">
                    <table className="dashboard-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Date</th>
                                <th>Total</th>
                                <th>Method</th>
                                <th>Payment</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentOrders.map(order => (
                                <tr key={order._id}>
                                    <td style={{fontFamily: 'monospace', color: 'var(--primary)'}}>#{order._id.slice(-6).toUpperCase()}</td>
                                    <td>
                                        <div>{order.userInfo?.name || order.user?.name || 'Guest'}</div>
                                        <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>{order.userInfo?.email || order.user?.email}</div>
                                    </td>
                                    <td>
                                        {order.items.map((item, idx) => (
                                            <div key={idx} style={{fontSize: '0.9rem'}}>
                                                <span 
                                                    onClick={() => item.product?._id && window.open(`/shop/${item.product._id}`, '_blank')}
                                                    style={{cursor: item.product?._id ? 'pointer' : 'default', textDecoration: item.product?._id ? 'underline' : 'none', color: item.product?._id ? 'var(--primary)' : 'inherit'}}
                                                    title="View Product"
                                                >
                                                    {item.product?.name || 'Unknown Item'}
                                                </span> (x{item.quantity})
                                            </div>
                                        ))}
                                    </td>
                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td style={{fontWeight: 'bold'}}>₹{order.vendorTotal}</td>
                                    <td>
                                            <span className={`status-badge ${order.paymentMethod === 'cod' ? 'status-pending' : 'status-success'}`}>
                                                {order.paymentMethod === 'cod' ? 'COD' : 'Online'}
                                            </span>
                                    </td>
                                    <td>
                                            {order.paymentStatus === 'paid' ? 
                                                <span className="status-badge status-success">Successful</span> : 
                                                <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start'}}>
                                                    <span className="status-badge status-pending">Pending</span>
                                                    {order.paymentMethod === 'cod' && (
                                                        <button 
                                                            onClick={() => {
                                                                toast(<ConfirmToast 
                                                                    message="Mark this COD order as Paid?" 
                                                                    onConfirm={async () => {
                                                                        try {
                                                                            const token = localStorage.getItem('vendorToken');
                                                                            const res = await axios.put('/api/vendor/order/payment-status', {
                                                                                orderId: order._id,
                                                                                status: 'paid'
                                                                            }, { 
                                                                                headers: { token },
                                                                                withCredentials: true 
                                                                            });
                                                                            if(res.data.success) {
                                                                                toast.success("Payment marked as successful");
                                                                                fetchOrders();
                                                                            } else {
                                                                                toast.error(res.data.message);
                                                                            }
                                                                        } catch (err) {
                                                                            toast.error("Failed to update status");
                                                                        }
                                                                    }}
                                                                />, { autoClose: false, closeButton: false });
                                                            }}
                                                            style={{
                                                                fontSize: '0.7rem', padding: '0.3rem 0.6rem', 
                                                                background: 'var(--primary)', color: 'white', 
                                                                borderRadius: '4px', border: 'none', cursor: 'pointer'
                                                            }}
                                                        >
                                                            Mark Paid
                                                        </button>
                                                    )}
                                                </div>
                                            }
                                    </td>
                                    <td>{getStatusBadge(order.status)}</td>
                                    <td>
                                        <div style={{display: 'flex', gap: '0.5rem'}}>
                                            <button 
                                                className="action-btn btn-approve" 
                                                style={{fontSize: '0.8rem'}}
                                                onClick={() => openUpdateModal(order)}
                                            >
                                                Update
                                            </button>
                                            <button 
                                                className="action-btn"
                                                onClick={() => window.open(`/invoice/${order._id}`, '_blank')}
                                                title="View Invoice"
                                                style={{padding: '0.4rem', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', cursor: 'pointer'}}
                                            >
                                                <FileText size={16} />
                                            </button>
                                            <button 
                                                className="action-btn"
                                                onClick={() => openAddressModal(order)}
                                                title="View Details"
                                                style={{padding: '0.4rem', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', cursor: 'pointer'}}
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     <Pagination 
                        inputs={{ currentPage, totalItems: orders.length, itemsPerPage }}
                        onPageChange={paginate}
                    />
                </div>
            )}

            {/* ADDRESS MODAL */}
            {isAddressModalOpen && selectedAddressOrder && (
                 <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="glass-panel" style={{
                        width: '90%', maxWidth: '400px', padding: '2rem', 
                        position: 'relative', borderRadius: '16px',
                        background: 'var(--surface-color)', color: 'var(--text-primary)'
                    }}>
                        <button 
                            onClick={() => setIsAddressModalOpen(false)}
                            style={{
                                position: 'absolute', top: '1rem', right: '1rem', 
                                background: 'transparent', border: 'none', 
                                color: 'var(--text-secondary)', cursor: 'pointer'
                            }}
                        >
                            <XCircle size={24} />
                        </button>
                        
                        <h3 style={{marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem'}}>Order Details</h3>
                        
                        {selectedAddressOrder.shippingAddress ? (
                            <div style={{lineHeight: '1.6'}}>
                                <p><strong>Name:</strong> {selectedAddressOrder.userInfo?.name || selectedAddressOrder.user?.name || 'Guest'}</p>
                                <p><strong>Street:</strong> {selectedAddressOrder.shippingAddress.street}</p>
                                <p><strong>City:</strong> {selectedAddressOrder.shippingAddress.city}</p>
                                <p><strong>State:</strong> {selectedAddressOrder.shippingAddress.state} - {selectedAddressOrder.shippingAddress.zipCode}</p>
                                <p><strong>Country:</strong> {selectedAddressOrder.shippingAddress.country}</p>
                                <p style={{marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed var(--glass-border)'}}>
                                    <strong>Mobile:</strong> {selectedAddressOrder.shippingAddress.mobile}
                                </p>
                            </div>
                        ) : (
                             <p className="text-secondary">No shipping address provided</p>
                        )}

                        <div style={{marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)'}}>
                            <h4 style={{fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-secondary)'}}>Payment Breakdown</h4>
                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.9rem'}}>
                                <span>Subtotal:</span>
                                <span>₹{selectedAddressOrder.subTotal || selectedAddressOrder.vendorTotal || selectedAddressOrder.totalAmount}</span>
                            </div>
                            {/* Vendor view might only show their share, but if coupon is applied to whole order? 
                                For now showing Order totals as stored. */}
                             {(selectedAddressOrder.taxAmount > 0) && (
                                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.9rem'}}>
                                    <span>Tax:</span>
                                    <span>+₹{selectedAddressOrder.taxAmount}</span>
                                </div>
                            )}
                            {(selectedAddressOrder.discountAmount > 0) && (
                                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.9rem', color: '#4caf50'}}>
                                    <span>Discount {selectedAddressOrder.couponCode ? `(${selectedAddressOrder.couponCode})` : ''}:</span>
                                    <span>-₹{selectedAddressOrder.discountAmount}</span>
                                </div>
                            )}
                            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--glass-border)', fontWeight: 'bold'}}>
                                <span>Total:</span>
                                <span>₹{selectedAddressOrder.totalAmount}</span>
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => setIsAddressModalOpen(false)}
                            className="btn btn-primary"
                            style={{width: '100%', marginTop: '2rem'}}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* UPDATE STATUS MODAL */}
            {isModalOpen && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    <div className="glass-panel no-scrollbar" style={{
                        width: '90%', maxWidth: '450px', padding: '2.5rem', 
                        position: 'relative', borderRadius: '24px',
                        border: '1px solid var(--glass-border)',
                        boxShadow: 'var(--glass-shadow)',
                        background: 'var(--surface-color)',
                        color: 'var(--text-primary)'
                    }}>
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            style={{
                                position: 'absolute', top: '1.5rem', right: '1.5rem', 
                                background: 'var(--bg-color)', border: 'none', 
                                color: 'var(--text-secondary)', cursor: 'pointer',
                                width: '36px', height: '36px', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {e.currentTarget.style.color = 'var(--primary)'}}
                            onMouseOut={(e) => {e.currentTarget.style.color = 'var(--text-secondary)'}}
                        >
                            <X size={20} />
                        </button>
                        
                        <div style={{textAlign: 'center', marginBottom: '2rem'}}>
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '50%', 
                                background: 'rgba(255, 77, 109, 0.1)', margin: '0 auto 1rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--primary)'
                            }}>
                                <Truck size={32} />
                            </div>
                            <h2 style={{fontSize: '1.75rem', marginBottom: '0.5rem'}}>Update Order Status</h2>
                            <p style={{color: 'var(--text-secondary)'}}>Change the delivery status for Order <span style={{color: 'var(--primary)', fontFamily: 'monospace'}}>#{selectedOrder?._id.slice(-6).toUpperCase()}</span></p>
                        </div>

                        <div style={{marginBottom: '2rem'}}>
                            <label style={{display: 'block', marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500', marginLeft: '0.5rem'}}>Select New Status</label>
                            <div style={{position: 'relative'}}>
                                <select 
                                    value={statusToUpdate} 
                                    onChange={(e) => setStatusToUpdate(e.target.value)}
                                    style={{
                                        width: '100%', padding: '1rem', borderRadius: '16px', 
                                        background: 'var(--bg-color)', border: '1px solid var(--glass-border)',
                                        color: 'var(--text-primary)', outline: 'none',
                                        fontSize: '1rem', appearance: 'none', cursor: 'pointer'
                                    }}
                                >
                                    <option value="placed" style={{background: 'var(--bg-color)', color: 'var(--text-primary)'}}>Placed</option>
                                    <option value="processing" style={{background: 'var(--bg-color)', color: 'var(--text-primary)'}}>Processing</option>
                                    <option value="shipped" style={{background: 'var(--bg-color)', color: 'var(--text-primary)'}}>Shipped</option>
                                    <option value="delivered" style={{background: 'var(--bg-color)', color: 'var(--text-primary)'}}>Delivered</option>
                                    <option value="cancelled" style={{background: 'var(--bg-color)', color: 'var(--text-primary)'}}>Cancelled</option>
                                </select>
                                <div style={{position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)'}}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                                </div>
                            </div>
                        </div>

                        <div style={{display: 'flex', gap: '1rem'}}>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="btn" 
                                style={{
                                    flex: 1, background: 'transparent', border: '1px solid var(--glass-border)', 
                                    color: 'var(--text-primary)',
                                    padding: '1rem', borderRadius: '12px', fontWeight: '600'
                                }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleUpdateSubmit}
                                className="btn btn-primary"
                                style={{
                                    flex: 2, padding: '1rem', borderRadius: '12px', fontWeight: '600',
                                    boxShadow: '0 4px 12px rgba(255, 77, 109, 0.3)'
                                }}
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorOrders;
