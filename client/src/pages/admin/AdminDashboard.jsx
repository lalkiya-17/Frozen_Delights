import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Users, Store, DollarSign, ShoppingBag, X, FileText } from 'lucide-react';
import DocumentReviewModal from '../../components/admin/DocumentReviewModal';
import DashboardCharts from '../../components/admin/DashboardCharts';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalVendors: 0,
        totalRevenue: 0,
        totalOrders: 0,
        revenueData: [],
        orderStatusData: []
    });

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [processing, setProcessing] = useState(null); // ID of vendor being processed

    // Pagination State for Requests
    const [requestsPage, setRequestsPage] = useState(1);
    const [requestsPerPage] = useState(5);

    // Pagination State for Recent Orders
    const [ordersPage, setOrdersPage] = useState(1);
    const [ordersPerPage] = useState(5);

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.get('/api/admin/vendors/pending', { 
                headers: { token },
                withCredentials: true 
            });
            if (res.data.sucess || res.data.success) { 
                setRequests(res.data.vendors);
            }
        } catch (error) {
            console.error("Failed to fetch requests", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
         try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.get('/api/admin/stats', { 
                headers: { token },
                withCredentials: true 
            });
            if (res.data.success) {
                setStats(res.data.stats);
            }
        } catch (error) {
            console.error("Failed to fetch stats", error);
        } finally {
            setStatsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
        fetchStats();
    }, []);

    const handleAction = async (id, action) => {
        if (!confirm(`Are you sure you want to ${action} this vendor?`)) return;

        setProcessing(id);
        try {
            const endpoint = action === 'Approved' 
                ? `/api/admin/vendors/approve/${id}` 
                : `/api/admin/vendors/reject/${id}`;
            
            const token = localStorage.getItem('adminToken');
            const res = await axios.post(endpoint, {}, { 
                headers: { token },
                withCredentials: true 
            });
            
            if (res.data.success) {
                alert(res.data.message);
                fetchRequests(); // Refresh list
                fetchStats(); // Refresh stats (e.g. active vendors count might change)
            } else {
                alert(res.data.message || "Action failed");
            }
        } catch (error) {
            alert("Action failed: " + (error.response?.data?.message || error.message));
        } finally {
            setProcessing(null);
        }
    };

    // Pagination Logic for Requests
    const indexOfLastRequest = requestsPage * requestsPerPage;
    const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
    const currentRequests = requests.slice(indexOfFirstRequest, indexOfLastRequest);
    const paginateRequests = (pageNumber) => setRequestsPage(pageNumber);

    // Pagination Logic for Recent Orders
    const indexOfLastOrder = ordersPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentRecentOrders = stats.recentOrders ? stats.recentOrders.slice(indexOfFirstOrder, indexOfLastOrder) : [];
    const paginateOrders = (pageNumber) => setOrdersPage(pageNumber);

    // Document Viewer State
    const [showDocModal, setShowDocModal] = useState(false);
    const [selectedDocs, setSelectedDocs] = useState(null);
    const [selectedVendorName, setSelectedVendorName] = useState('');
    const [selectedVendorId, setSelectedVendorId] = useState(null);
    
    const handleViewDocs = (vendor) => {
        setSelectedDocs(vendor.vendorDocuments || {});
        setSelectedVendorName(vendor.name);
        setSelectedVendorId(vendor._id);
        setShowDocModal(true);
    };

    const statCards = [
        { label: 'Total Users', value: stats.totalUsers, icon: Users, trend: 'Registered' },
        { label: 'Active Vendors', value: stats.totalVendors, icon: Store, trend: 'Approved' },
        { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, trend: 'Lifetime' },
        { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, trend: 'Lifetime' }, 
    ];

    return (
        <div>
            <div className="dashboard-header">
                <div className="dashboard-title">
                    <h1>Admin Overview</h1>
                    <p>Welcome back, Admin</p>
                </div>
                <div className="search-bar" style={{background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--glass-border)'}}>
                    <Search size={18} color="var(--text-secondary)" />
                    <input type="text" placeholder="Search..." style={{background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none'}} />
                </div>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                {statCards.map((stat, index) => (
                    <div className="stat-card" key={index}>
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                             <span className="stat-label">{stat.label}</span>
                             <stat.icon size={20} color="var(--primary)" />
                        </div>
                        <div className="stat-value">{statsLoading ? '...' : stat.value}</div>
                        <div className="stat-trend">{stat.trend}</div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <DashboardCharts 
                revenueData={stats.revenueData} 
                orderStatusData={stats.orderStatusData} 
                loading={statsLoading} 
            />

            {/* Recent Orders Section */}
            <h3>Recent Orders</h3>
            <div className="table-container" style={{marginTop: '1rem', marginBottom: '2rem'}}>
                <table className="dashboard-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Amount</th>
                            <th>Payment</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentRecentOrders && currentRecentOrders.length > 0 ? (
                            currentRecentOrders.map(order => (
                                <tr key={order._id}>
                                    <td style={{fontFamily: 'monospace', color: 'var(--primary)'}}>#{order._id.slice(-6).toUpperCase()}</td>
                                    <td>{order.user?.name || 'Guest'}</td>
                                    <td style={{fontWeight: 'bold'}}>₹{order.totalAmount}</td>
                                    <td>
                                            {order.paymentStatus === 'paid' ? 
                                                <span className="status-badge status-success">Successful</span> : 
                                                <span className="status-badge status-pending">Pending</span>
                                            }
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${order.deliveryStatus?.toLowerCase() || 'pending'}`}>
                                            {order.deliveryStatus}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" style={{textAlign: 'center', padding: '2rem'}}>No recent orders</td></tr>
                        )}
                    </tbody>
                </table>
                {stats.recentOrders && stats.recentOrders.length > ordersPerPage && (
                    <div style={{display: 'flex', justifyContent: 'center', marginTop: '1rem'}}>
                         <div className="pagination">
                            <button 
                                onClick={() => paginateOrders(ordersPage - 1)} 
                                disabled={ordersPage === 1}
                                style={{padding: '0.5rem', border: '1px solid var(--glass-border)', background: ordersPage === 1 ? 'rgba(255,255,255,0.05)' : 'var(--surface-color)', color: ordersPage === 1 ? 'var(--text-secondary)' : 'var(--text-primary)', borderRadius: '6px', cursor: ordersPage === 1 ? 'not-allowed' : 'pointer'}}
                            >
                                Previous
                            </button>
                            <span style={{padding: '0.5rem 1rem', display: 'flex', alignItems: 'center'}}>
                                Page {ordersPage} of {Math.ceil(stats.recentOrders.length / ordersPerPage)}
                            </span>
                            <button 
                                onClick={() => paginateOrders(ordersPage + 1)} 
                                disabled={ordersPage === Math.ceil(stats.recentOrders.length / ordersPerPage)}
                                style={{padding: '0.5rem', border: '1px solid var(--glass-border)', background: ordersPage === Math.ceil(stats.recentOrders.length / ordersPerPage) ? 'rgba(255,255,255,0.05)' : 'var(--surface-color)', color: ordersPage === Math.ceil(stats.recentOrders.length / ordersPerPage) ? 'var(--text-secondary)' : 'var(--text-primary)', borderRadius: '6px', cursor: ordersPage === Math.ceil(stats.recentOrders.length / ordersPerPage) ? 'not-allowed' : 'pointer'}}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Recent Vendor Requests */}
            <h3>Recent Vendor Requests</h3>
            <div className="table-container" style={{marginTop: '1rem'}}>
                <table className="dashboard-table">
                    <thead>
                        <tr>
                            <th>Shop Name</th>
                            <th>Owner</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" style={{textAlign: 'center', padding: '2rem'}}>Loading requests...</td></tr>
                        ) : requests.length === 0 ? (
                            <tr><td colSpan="5" style={{textAlign: 'center', padding: '2rem'}}>No pending requests</td></tr>
                        ) : (
                            currentRequests.map(req => (
                                <tr key={req._id}>
                                    <td>{req.vendorDetails?.shopName || 'N/A'}</td>
                                    <td>{req.name}</td>
                                    <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`status-badge status-${req.vendorRequestStatus?.toLowerCase()}`}>
                                            {req.vendorRequestStatus}
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            className="action-btn" 
                                            onClick={() => handleViewDocs(req)}
                                            title="View Documents"
                                            style={{background: 'var(--primary)', color: 'white', width: '100%', justifyContent: 'center'}}
                                        >
                                            <FileText size={16} /> View Documents
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                 {requests.length > requestsPerPage && (
                    <div style={{display: 'flex', justifyContent: 'center', marginTop: '1rem'}}>
                         <div className="pagination">
                            <button 
                                onClick={() => paginateRequests(requestsPage - 1)} 
                                disabled={requestsPage === 1}
                                style={{padding: '0.5rem', border: '1px solid var(--glass-border)', background: requestsPage === 1 ? 'rgba(255,255,255,0.05)' : 'var(--surface-color)', color: requestsPage === 1 ? 'var(--text-secondary)' : 'var(--text-primary)', borderRadius: '6px', cursor: requestsPage === 1 ? 'not-allowed' : 'pointer'}}
                            >
                                Previous
                            </button>
                            <span style={{padding: '0.5rem 1rem', display: 'flex', alignItems: 'center'}}>
                                Page {requestsPage} of {Math.ceil(requests.length / requestsPerPage)}
                            </span>
                            <button 
                                onClick={() => paginateRequests(requestsPage + 1)} 
                                disabled={requestsPage === Math.ceil(requests.length / requestsPerPage)}
                                style={{padding: '0.5rem', border: '1px solid var(--glass-border)', background: requestsPage === Math.ceil(requests.length / requestsPerPage) ? 'rgba(255,255,255,0.05)' : 'var(--surface-color)', color: requestsPage === Math.ceil(requests.length / requestsPerPage) ? 'var(--text-secondary)' : 'var(--text-primary)', borderRadius: '6px', cursor: requestsPage === Math.ceil(requests.length / requestsPerPage) ? 'not-allowed' : 'pointer'}}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* View Documents Modal */}
            <DocumentReviewModal 
                isOpen={showDocModal}
                onClose={() => setShowDocModal(false)}
                vendor={requests.find(r => r._id === selectedVendorId) || {
                    name: selectedVendorName, 
                    _id: selectedVendorId, 
                    vendorDocuments: selectedDocs
                }}
                onApprove={(id) => {
                    handleAction(id, 'Approved');
                    setShowDocModal(false);
                }}
                onReject={(id) => {
                    handleAction(id, 'Rejected');
                    setShowDocModal(false);
                }}
                processing={processing}
            />
        </div>

    );
};

export default AdminDashboard;
