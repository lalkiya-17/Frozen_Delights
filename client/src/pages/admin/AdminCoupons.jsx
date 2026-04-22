import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Tag, Power } from 'lucide-react';
import { toast } from 'react-toastify';
import ConfirmToast from '../../components/ConfirmToast';

const AdminCoupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCoupons = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.get('/api/coupons/admin/all', {
                headers: { token },
                withCredentials: true
            });
            if (res.data.success) {
                setCoupons(res.data.coupons);
            }
        } catch (error) {
            console.error("Error fetching coupons:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleDelete = async (id) => {
        toast(<ConfirmToast 
            message="Are you sure you want to delete this coupon?"
            onConfirm={async () => {
                try {
                    const token = localStorage.getItem('adminToken');
                    const res = await axios.delete(`/api/coupons/admin/${id}`, {
                        headers: { token },
                        withCredentials: true
                    });
                    if (res.data.success) {
                        toast.success("Coupon deleted successfully");
                        fetchCoupons();
                    } else {
                        toast.error(res.data.message);
                    }
                } catch (error) {
                    toast.error("Failed to delete coupon");
                }
            }}
        />, { autoClose: false, closeButton: false });
    };

    const toggleStatus = async (id) => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.put(`/api/coupons/admin/status/${id}`, {}, {
                headers: { token },
                withCredentials: true
            });
            if (res.data.success) {
                toast.success("Status updated");
                fetchCoupons();
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{padding: '2rem'}}>
            <h2 style={{marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px'}}>
                <Tag /> All Coupons Used On Platform
            </h2>

            <div className="table-container glass-panel" style={{overflowX: 'auto'}}>
                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                    <thead>
                        <tr style={{textAlign: 'left', borderBottom: '1px solid var(--border-color)'}}>
                            <th style={{padding: '1rem'}}>Code</th>
                            <th style={{padding: '1rem'}}>Discount</th>
                            <th style={{padding: '1rem'}}>Min Order</th>
                            <th style={{padding: '1rem'}}>Vendor</th>
                            <th style={{padding: '1rem'}}>Product</th>
                            <th style={{padding: '1rem'}}>Expiry</th>
                            <th style={{padding: '1rem'}}>Status</th>
                            <th style={{padding: '1rem'}}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coupons.length === 0 ? (
                            <tr><td colSpan="8" style={{padding: '2rem', textAlign: 'center'}}>No coupons found.</td></tr>
                        ) : (
                            coupons.map(coupon => (
                                <tr key={coupon._id} style={{borderBottom: '1px solid var(--border-color)'}}>
                                    <td style={{padding: '1rem', fontWeight: 'bold'}}>{coupon.code}</td>
                                    <td style={{padding: '1rem'}}>
                                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                                    </td>
                                    <td style={{padding: '1rem'}}>₹{coupon.minOrderValue}</td>
                                    <td style={{padding: '1rem'}}>{coupon.vendor?.name || 'Unknown'}</td>
                                    <td style={{padding: '1rem'}}>{coupon.product?.name || 'All Products'}</td>
                                    <td style={{padding: '1rem'}}>{new Date(coupon.expiryDate).toLocaleDateString()}</td>
                                    <td style={{padding: '1rem'}}>
                                        <span style={{
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                                            background: coupon.isActive ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                                            color: coupon.isActive ? '#4caf50' : '#f44336'
                                        }}>
                                            {coupon.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td style={{padding: '1rem', display: 'flex', gap: '10px'}}>
                                        <button onClick={() => toggleStatus(coupon._id)} title="Toggle Status" style={{background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)'}}>
                                            <Power size={18} color={coupon.isActive ? '#4caf50' : '#f44336'} />
                                        </button>
                                        <button onClick={() => handleDelete(coupon._id)} title="Delete" style={{background: 'none', border: 'none', cursor: 'pointer', color: '#f44336'}}>
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminCoupons;
