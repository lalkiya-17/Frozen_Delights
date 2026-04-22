import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Trash2, X, Eye, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import ConfirmToast from '../../components/ConfirmToast';
import DocumentReviewModal from '../../components/admin/DocumentReviewModal';
import '../../pages/Dashboard.css';

import Pagination from '../../components/Pagination';

const AdminVendors = () => {
    const [activeTab, setActiveTab] = useState('all'); // 'all' or 'requests'
    const [vendors, setVendors] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [processing, setProcessing] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    
    // Document Viewer State
    const [showDocModal, setShowDocModal] = useState(false);
    const [selectedDocs, setSelectedDocs] = useState(null);
    const [selectedVendorName, setSelectedVendorName] = useState('');
    const [selectedVendorId, setSelectedVendorId] = useState(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Form State for Add Vendor
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        shopName: '',
        mobile: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            // Fetch All Vendors
            const vendorsRes = await axios.get('/api/admin/vendors/all', { 
                headers: { token },
                withCredentials: true 
            });
            if (vendorsRes.data.success) {
                setVendors(vendorsRes.data.vendors);
            }

            // Fetch Pending Requests
            const requestsRes = await axios.get('/api/admin/vendors/pending', { 
                headers: { token },
                withCredentials: true 
            });
            if (requestsRes.data.success || requestsRes.data.sucess) { 
                setRequests(requestsRes.data.vendors);
            }
        } catch (error) {
            console.error("Failed to fetch vendor data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Reset pagination when tab or search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchTerm]);

    const handleAction = async (id, action) => {
        const actionVerb = action === 'Approved' ? 'approve' : action === 'Rejected' ? 'reject' : 'delete';
        
        toast(<ConfirmToast 
            message={`Are you sure you want to ${actionVerb} this vendor?`}
            onConfirm={async () => {
                setProcessing(id);
                try {
                    let endpoint = '';
                    if (action === 'Approved') endpoint = `/api/admin/vendors/approve/${id}`;
                    else if (action === 'Rejected') endpoint = `/api/admin/vendors/reject/${id}`;
                    else if (action === 'Delete') endpoint = `/api/admin/vendors/delete/${id}`;
                    
                    const token = localStorage.getItem('adminToken');
                    const config = { headers: { token }, withCredentials: true };
        
                    let res;
                    if (action === 'Delete') {
                        res = await axios.delete(endpoint, config);
                    } else {
                        res = await axios.post(endpoint, {}, config);
                    }
                    
                    if (res.data.success) {
                        toast.success(res.data.message);
                        fetchData(); // Refresh data
                    } else {
                        toast.error(res.data.message || "Action failed");
                    }
                } catch (error) {
                    toast.error("Action failed: " + (error.response?.data?.message || error.message));
                } finally {
                    setProcessing(null);
                }
            }}
        />, { autoClose: false, closeButton: false });
    };

    const handleAddVendor = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.post('/api/admin/vendors/add', formData, { 
                headers: { token },
                withCredentials: true 
            });
             if (res.data.success) {
                toast.success(res.data.message);
                setShowAddModal(false);
                setFormData({ name: '', email: '', password: '', shopName: '', mobile: '' });
                fetchData();
            } else {
                toast.error(res.data.message || "Failed to add vendor");
            }
        } catch (error) {
            toast.error("Failed to add vendor: " + (error.response?.data?.message || error.message));
        }
    };

    const handleViewDocs = (vendor) => {
        setSelectedDocs(vendor.vendorDocuments || {});
        setSelectedVendorName(vendor.name);
        setSelectedVendorId(vendor._id);
        setShowDocModal(true);
    };

    const filteredData = (activeTab === 'all' ? vendors : requests).filter(req => 
        req.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.vendorDetails?.shopName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div>
            <div className="dashboard-header">
                <div className="dashboard-title">
                    <h1>Vendor Management</h1>
                    <p>Manage list of vendors and requests</p>
                </div>
                <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                    <div className="search-bar" style={{background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--glass-border)'}}>
                        <Search size={18} color="var(--text-secondary)" />
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '200px'}} 
                        />
                    </div>
                    <button 
                        className="btn-primary" 
                        onClick={() => setShowAddModal(true)}
                        style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', border: 'none', background: 'var(--primary)', color: 'white'}}
                    >
                        <Plus size={18} /> Add Vendor
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{display: 'flex', gap: '1rem', marginTop: '1rem', borderBottom: '1px solid var(--glass-border)'}}>
                <button 
                    onClick={() => setActiveTab('all')}
                    style={{
                        padding: '0.5rem 1rem', 
                        background: 'none', 
                        border: 'none', 
                        borderBottom: activeTab === 'all' ? '2px solid var(--primary)' : '2px solid transparent',
                        color: activeTab === 'all' ? 'var(--primary)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontWeight: '600'
                    }}
                >
                    All Vendors ({vendors.length})
                </button>
                <button 
                    onClick={() => setActiveTab('requests')}
                    style={{
                        padding: '0.5rem 1rem', 
                        background: 'none', 
                        border: 'none', 
                        borderBottom: activeTab === 'requests' ? '2px solid var(--primary)' : '2px solid transparent',
                        color: activeTab === 'requests' ? 'var(--primary)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontWeight: '600',
                        position: 'relative'
                    }}
                >
                    Requests 
                    {requests.length > 0 && <span style={{marginLeft: '5px', background: '#ff4d6d', color: 'white', padding: '2px 6px', borderRadius: '10px', fontSize: '0.7rem'}}>{requests.length}</span>}
                </button>
            </div>

            <div className="table-container" style={{marginTop: '1rem'}}>
                <table className="dashboard-table">
                    <thead>
                        <tr>
                            <th>Shop Name</th>
                            <th>Owner</th>
                            <th>Email</th>
                            <th>Mobile</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>Loading...</td></tr>
                        ) : currentData.length === 0 ? (
                            <tr><td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>No vendors found</td></tr>
                        ) : (
                            currentData.map(vendor => (
                                <tr key={vendor._id}>
                                    <td>{vendor.vendorDetails?.shopName || 'N/A'}</td>
                                    <td>{vendor.name}</td>
                                    <td>{vendor.email}</td>
                                    <td>{vendor.addresses?.[0]?.mobile || vendor.mobile || 'N/A'}</td>
                                    <td>
                                        <span className={`status-badge status-${vendor.vendorRequestStatus?.toLowerCase()}`}>
                                            {vendor.vendorRequestStatus}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{display: 'flex', gap: '0.5rem', width: '100%'}}>
                                            {activeTab === 'requests' ? (
                                                <button 
                                                    className="action-btn" 
                                                    onClick={() => handleViewDocs(vendor)}
                                                    title="View Documents"
                                                    style={{background: 'var(--primary)', color: 'white', width: '100%', justifyContent: 'center'}}
                                                >
                                                    <FileText size={16} /> View Documents
                                                </button>
                                            ) : (
                                                <>
                                                    <button 
                                                        className="action-btn" 
                                                        onClick={() => handleViewDocs(vendor)}
                                                        title="View Documents"
                                                        style={{background: 'var(--primary)', color: 'white', justifyContent: 'center'}}
                                                    >
                                                        <FileText size={16} />
                                                    </button>
                                                    <button 
                                                        className="action-btn btn-reject" 
                                                        onClick={() => handleAction(vendor._id, 'Delete')}
                                                        disabled={processing === vendor._id}
                                                        title="Delete Vendor"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                <Pagination 
                    inputs={{ currentPage, totalItems: filteredData.length, itemsPerPage }}
                    onPageChange={paginate}
                />
            </div>

            {/* Add Vendor Modal ... (Skipped lines handled by original code if not replaced entirely, 
               but wait, I am replacing a chunk. I need to be careful not to delete Add Vendor Modal) 
               Actually, I should target specific chunks. The actions column and the modal footer are separate.
               Let's splitting this into multi_replace for safety.
            */}

            {showAddModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                    backdropFilter: 'blur(3px)'
                }}>
                    <div style={{
                        background: 'var(--surface-color)', padding: '1.5rem', borderRadius: '12px', width: '350px',
                        border: '1px solid var(--glass-border)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                    }}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                            <h3 style={{margin: 0, color: 'var(--text-primary)'}}>Add New Vendor</h3>
                            <button onClick={() => setShowAddModal(false)} style={{background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)'}}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleAddVendor} style={{display: 'flex', flexDirection: 'column', gap: '0.8rem'}}>
                            <input 
                                type="text" placeholder="Owner Name" required 
                                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                                style={{padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: '0.9rem'}}
                            />
                            <input 
                                type="email" placeholder="Email Address" required 
                                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                                style={{padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: '0.9rem'}}
                            />
                            <input 
                                type="password" placeholder="Password" required 
                                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                                style={{padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: '0.9rem'}}
                            />
                            <input 
                                type="text" placeholder="Shop Name" required 
                                value={formData.shopName} onChange={e => setFormData({...formData, shopName: e.target.value})}
                                style={{padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: '0.9rem'}}
                            />
                            <input 
                                type="tel" placeholder="Mobile Number" required 
                                value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})}
                                style={{padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: '0.9rem'}}
                            />
                            
                            <button type="submit" className="btn-primary" style={{marginTop: '0.5rem', padding: '0.6rem', borderRadius: '6px', border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem'}}>
                                Create Vendor
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* View Documents Modal */}
            <DocumentReviewModal 
                isOpen={showDocModal}
                onClose={() => setShowDocModal(false)}
                vendor={vendors.find(v => v._id === selectedVendorId) || requests.find(r => r._id === selectedVendorId) || {
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
                readOnly={activeTab !== 'requests'}
            />
        </div>
    );
};

export default AdminVendors;
