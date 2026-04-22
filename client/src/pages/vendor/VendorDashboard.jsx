import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, ShoppingBag, DollarSign, Plus, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../Dashboard.css';

const VendorDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        totalProducts: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('vendorToken'); // Use vendorToken for vendor dashboard
                const res = await axios.get('/api/vendor/stats', { 
                    headers: { token },
                    withCredentials: true 
                });
                if (res.data.success) {
                    setStats(res.data.stats);
                    setRecentOrders(res.data.recentOrders);
                }
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOrders = recentOrders.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const statCards = [
        { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, trend: 'Lifetime' },
        { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, trend: 'Lifetime' },
        { label: 'Products', value: stats.totalProducts, icon: Package, trend: 'Active' },
    ];

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

    return (
        <div>
            <div className="dashboard-header">
                <div className="dashboard-title">
                    <h1>Vendor Dashboard</h1>
                    <p>Manage your shop and products</p>
                </div>
                <button 
                    className="btn btn-primary" 
                    style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}
                    onClick={() => navigate('/vendor/products')}
                >
                    <Plus size={18} /> Manage Products
                </button>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                {statCards.map((stat, index) => (
                    <div className="stat-card" key={index}>
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                             <span className="stat-label">{stat.label}</span>
                             <stat.icon size={20} color="var(--primary)" />
                        </div>
                        <div className="stat-value">{loading ? '...' : stat.value}</div>
                        <div className="stat-trend">{stat.trend}</div>
                    </div>
                ))}
            </div>

            {/* Recent Orders List */}
            <h3>Recent Orders</h3>
            <div className="table-container" style={{marginTop: '1rem'}}>
                <table className="dashboard-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" style={{textAlign: 'center', padding: '2rem'}}>Loading...</td></tr>
                        ) : recentOrders.length === 0 ? (
                            <tr><td colSpan="5" style={{textAlign: 'center', padding: '2rem'}}>No orders yet</td></tr>
                        ) : (
                            currentOrders.map(order => (
                                <tr key={order._id}>
                                    <td style={{fontFamily: 'monospace', color: 'var(--primary)'}}>#{order._id.slice(-6).toUpperCase()}</td>
                                    <td>{order.user?.name || 'Guest'}</td>
                                    <td>
                                        {order.items.map((item, idx) => (
                                            <div key={idx} style={{fontSize: '0.85rem'}}>
                                                {item.product?.name} x{item.quantity}
                                            </div>
                                        ))}
                                    </td>
                                    <td>₹{order.totalAmount}</td>
                                    <td>{getStatusBadge(order.status)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                {recentOrders.length > itemsPerPage && (
                    <div style={{display: 'flex', justifyContent: 'center', marginTop: '1rem'}}>
                         <div className="pagination">
                            <button 
                                onClick={() => paginate(currentPage - 1)} 
                                disabled={currentPage === 1}
                                style={{padding: '0.5rem', border: '1px solid var(--glass-border)', background: currentPage === 1 ? 'rgba(255,255,255,0.05)' : 'var(--surface-color)', color: currentPage === 1 ? 'var(--text-secondary)' : 'var(--text-primary)', borderRadius: '6px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer'}}
                            >
                                Previous
                            </button>
                            <span style={{padding: '0.5rem 1rem', display: 'flex', alignItems: 'center'}}>
                                Page {currentPage} of {Math.ceil(recentOrders.length / itemsPerPage)}
                            </span>
                            <button 
                                onClick={() => paginate(currentPage + 1)} 
                                disabled={currentPage === Math.ceil(recentOrders.length / itemsPerPage)}
                                style={{padding: '0.5rem', border: '1px solid var(--glass-border)', background: currentPage === Math.ceil(recentOrders.length / itemsPerPage) ? 'rgba(255,255,255,0.05)' : 'var(--surface-color)', color: currentPage === Math.ceil(recentOrders.length / itemsPerPage) ? 'var(--text-secondary)' : 'var(--text-primary)', borderRadius: '6px', cursor: currentPage === Math.ceil(recentOrders.length / itemsPerPage) ? 'not-allowed' : 'pointer'}}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorDashboard;
