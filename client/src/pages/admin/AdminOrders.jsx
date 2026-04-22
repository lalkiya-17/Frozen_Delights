import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingBag, Search, Eye, CheckCircle, XCircle, Clock, Filter, FileText } from 'lucide-react';

import Pagination from '../../components/Pagination';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        fetchOrders();
    }, []);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedStatus]);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.get('/api/admin/orders/all', { 
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

    const getStatusBadge = (status) => {
        switch(status?.toLowerCase()) {
            case 'pending': 
            case 'placed': return <span className="status-badge status-pending"><Clock size={14}/> Placed</span>;
            case 'processing': return <span className="status-badge status-approved"><Clock size={14}/> Processing</span>; 
            case 'delivered': return <span className="status-badge status-approved"><CheckCircle size={14}/> Delivered</span>;
            case 'cancelled': return <span className="status-badge status-rejected"><XCircle size={14}/> Cancelled</span>;
            default: return <span>{status}</span>;
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = 
            order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = selectedStatus === 'all' || order.deliveryStatus === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const [selectedAddressOrder, setSelectedAddressOrder] = useState(null);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

    const openAddressModal = (order) => {
        setSelectedAddressOrder(order);
        setIsAddressModalOpen(true);
    };

    return (
        <div className="admin-orders-page">
             <div className="page-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
                <div>
                    <h1>All Orders</h1>
                    <p className="text-secondary">Manage and track all customer orders</p>
                </div>
                <div className="stats-mini" style={{display: 'flex', gap: '1rem'}}>
                     <div className="glass-panel" style={{padding: '0.5rem 1rem', fontSize: '0.9rem'}}>
                        Total Orders: <strong>{orders.length}</strong>
                     </div>
                     <div className="glass-panel" style={{padding: '0.5rem 1rem', fontSize: '0.9rem'}}>
                        Revenue: <strong>₹{orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0).toLocaleString()}</strong>
                     </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-bar glass-panel" style={{padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center'}}>
                <div className="search-box" style={{position: 'relative', flex: 1, maxWidth: '300px'}}>
                    <Search size={18} style={{position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)'}} />
                    <input 
                        type="text" 
                        placeholder="Search by ID, Name or Email" 
                        style={{width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.2rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)'}}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="status-filter" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <Filter size={18} color="var(--text-secondary)" />
                    <select 
                        value={selectedStatus} 
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        style={{padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--surface-color)', color: 'var(--text-primary)'}}
                    >
                        <option value="all">All Status</option>
                        <option value="placed">Placed</option>
                        <option value="processing">Processing</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div style={{textAlign: 'center', padding: '3rem'}}>Loading orders...</div>
            ) : (
                <div className="table-container">
                    <table className="dashboard-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Method</th>
                                <th>Payment</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentOrders.length > 0 ? (
                                currentOrders.map(order => (
                                    <tr key={order._id}>
                                        <td style={{fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 'bold'}}>#{order._id.slice(-6).toUpperCase()}</td>
                                        <td>
                                            <div>{order.userInfo?.name || order.user?.name || 'Guest'}</div>
                                            <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>{order.userInfo?.email || order.user?.email}</div>
                                        </td>
                                        <td>
                                            {order.items.map((item, idx) => (
                                                <div key={idx} style={{fontSize: '0.9rem', marginBottom: '0.2rem'}}>
                                                    <span style={{color: 'var(--text-primary)'}}>
                                                        {item.product?.name || 'Unknown Item'}
                                                    </span> 
                                                    <span style={{color: 'var(--text-secondary)', fontSize: '0.85rem'}}> (x{item.quantity})</span>
                                                </div>
                                            ))}
                                        </td>
                                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td style={{fontWeight: 'bold'}}>₹{order.totalAmount}</td>
                                        <td>
                                            <span className={`status-badge ${order.paymentMethod === 'cod' ? 'status-pending' : 'status-success'}`}>
                                                {order.paymentMethod === 'cod' ? 'COD' : 'Online'}
                                            </span>
                                        </td>
                                        <td>
                                            {order.paymentStatus === 'paid' ? 
                                                <span className="status-badge status-success">Paid</span> : 
                                                <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start'}}>
                                                    <span className="status-badge status-pending">Pending</span>
                                                    {order.paymentMethod === 'cod' && (
                                                        <button 
                                                            onClick={async () => {
                                                                if(confirm('Mark this COD order as Paid?')) {
                                                                    try {
                                                                        const token = localStorage.getItem('adminToken');
                                                                        const res = await axios.put('/api/admin/orders/payment-status', {
                                                                            orderId: order._id,
                                                                            status: 'paid'
                                                                        }, { 
                                                                            headers: { token },
                                                                            withCredentials: true 
                                                                        });
                                                                        if(res.data.success) {
                                                                            fetchOrders();
                                                                        } else {
                                                                            alert(res.data.message);
                                                                        }
                                                                    } catch (err) {
                                                                        alert("Failed to update status");
                                                                    }
                                                                }
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
                                        <td>{getStatusBadge(order.deliveryStatus)}</td>
                                        <td>
                                            <div style={{display: 'flex', gap: '0.5rem'}}>
                                                <button 
                                                    className="action-btn" 
                                                    onClick={() => window.open(`/invoice/${order._id}`, '_blank')}
                                                    style={{
                                                        width: '32px', height: '32px', padding: 0, 
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        background: 'rgba(255, 77, 109, 0.1)', border: '1px solid var(--primary)', 
                                                        color: 'var(--primary)', borderRadius: '6px', cursor: 'pointer'
                                                    }}
                                                    title="View Invoice"
                                                >
                                                    <FileText size={16} />
                                                </button>
                                                <button 
                                                    className="action-btn" 
                                                    onClick={() => openAddressModal(order)}
                                                    style={{
                                                        width: '32px', height: '32px', padding: 0,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--glass-border)', 
                                                        color: 'var(--text-primary)', borderRadius: '6px', cursor: 'pointer'
                                                    }}
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" style={{textAlign: 'center', padding: '2rem'}}>No orders found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                     <Pagination 
                        inputs={{ currentPage, totalItems: filteredOrders.length, itemsPerPage }}
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
                             <p className="text-secondary">No shipping address provided (Digital/Pick-up?)</p>
                        )}

                        <div style={{marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)'}}>
                            <h4 style={{fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-secondary)'}}>Payment Breakdown</h4>
                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.9rem'}}>
                                <span>Subtotal:</span>
                                <span>₹{selectedAddressOrder.subTotal || selectedAddressOrder.totalAmount}</span>
                            </div>
                            {selectedAddressOrder.taxAmount > 0 && (
                                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.9rem'}}>
                                    <span>Tax:</span>
                                    <span>+₹{selectedAddressOrder.taxAmount}</span>
                                </div>
                            )}
                            {selectedAddressOrder.discountAmount > 0 && (
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
        </div>
    );
};

export default AdminOrders;
