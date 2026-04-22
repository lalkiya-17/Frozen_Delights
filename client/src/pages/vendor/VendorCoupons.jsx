import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Tag, Power, Plus, X } from 'lucide-react';
import { toast } from 'react-toastify';
import ConfirmToast from '../../components/ConfirmToast';

const VendorCoupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        minOrderValue: 0,
        expiryDate: '',
        productId: '' // Optional
    });

    const [products, setProducts] = useState([]);

    const fetchInitialData = async () => {
        try {
            const token = localStorage.getItem('vendorToken');
            const config = { headers: { token }, withCredentials: true };
            
            const [couponRes, productRes] = await Promise.all([
                 axios.get('/api/coupons/vendor/my', config),
                 axios.get('/api/products/my', config)
            ]);

            if (couponRes.data.success) setCoupons(couponRes.data.coupons);
            if (productRes.data.success) setProducts(productRes.data.products);
            
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('vendorToken');
            const res = await axios.post('/api/coupons/add', formData, {
                headers: { token },
                withCredentials: true
            });

            if (res.data.success) {
                toast.success("Coupon Created!");
                setShowModal(false);
                setFormData({ code: '', discountType: 'percentage', discountValue: '', minOrderValue: 0, expiryDate: '', productId: '' });
                fetchInitialData(); // Refresh list
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error("Failed to create coupon");
        }
    };

    const handleDelete = async (id) => {
        toast(<ConfirmToast 
            message="Delete this coupon?"
            onConfirm={async () => {
                try {
                    const token = localStorage.getItem('vendorToken');
                    const res = await axios.delete(`/api/coupons/vendor/${id}`, { headers: { token }, withCredentials: true });
                    if (res.data.success) {
                        toast.success("Coupon deleted");
                        fetchInitialData();
                    }
                } catch (error) {
                    toast.error("Failed to delete");
                }
            }}
        />, { autoClose: false, closeButton: false });
    };

    const toggleStatus = async (id) => {
        try {
            const token = localStorage.getItem('vendorToken');
            const res = await axios.put(`/api/coupons/vendor/status/${id}`, {}, { headers: { token }, withCredentials: true });
            if (res.data.success) {
                toast.success("Status updated");
                fetchInitialData();
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{padding: '2rem'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
                <h2 style={{display: 'flex', alignItems: 'center', gap: '10px'}}><Tag /> My Coupons</h2>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} /> Create Coupon
                </button>
            </div>

            <div className="table-container glass-panel">
                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                    <thead>
                         <tr style={{textAlign: 'left', borderBottom: '1px solid var(--border-color)'}}>
                            <th style={{padding: '1rem'}}>Code</th>
                            <th style={{padding: '1rem'}}>Discount</th>
                            <th style={{padding: '1rem'}}>Product</th>
                            <th style={{padding: '1rem'}}>Expiry</th>
                            <th style={{padding: '1rem'}}>Status</th>
                            <th style={{padding: '1rem'}}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                         {coupons.length === 0 ? (
                            <tr><td colSpan="6" style={{padding: '2rem', textAlign: 'center'}}>No coupons yet. Create one!</td></tr>
                        ) : (
                            coupons.map(coupon => (
                                <tr key={coupon._id} style={{borderBottom: '1px solid var(--border-color)'}}>
                                    <td style={{padding: '1rem', fontWeight: 'bold'}}>{coupon.code}</td>
                                    <td style={{padding: '1rem'}}>
                                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                                        {coupon.minOrderValue > 0 && <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block'}}>Min: ₹{coupon.minOrderValue}</span>}
                                    </td>
                                    <td style={{padding: '1rem'}}>{coupon.product?.name || 'Store-wide'}</td>
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
                                        <button onClick={() => toggleStatus(coupon._id)} style={{background: 'none', border: 'none', cursor: 'pointer'}}>
                                            <Power size={18} color={coupon.isActive ? '#4caf50' : '#f44336'} />
                                        </button>
                                        <button onClick={() => handleDelete(coupon._id)} style={{background: 'none', border: 'none', cursor: 'pointer', color: '#f44336'}}>
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(5px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="modal-content glass-panel" style={{
                        width: '500px', maxWidth: '95%', 
                        background: 'var(--surface-color)', 
                        border: '1px solid var(--border-color)',
                        borderRadius: '24px', 
                        padding: '2rem',
                        position: 'relative',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}>
                        <button 
                            onClick={() => setShowModal(false)} 
                            style={{
                                position: 'absolute', top: '1.5rem', right: '1.5rem',
                                background: 'rgba(255,255,255,0.1)', border: 'none', 
                                borderRadius: '50%', width: '36px', height: '36px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', color: 'var(--text-primary)', transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 77, 109, 0.2)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        >
                            <X size={20} />
                        </button>

                        <div className="modal-header" style={{textAlign: 'center', marginBottom: '2rem'}}>
                            <div style={{
                                width: '60px', height: '60px', borderRadius: '50%', 
                                background: 'linear-gradient(135deg, #FF4D6D 0%, #FF8FA3 100%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 1rem', boxShadow: '0 10px 20px rgba(255, 77, 109, 0.3)'
                            }}>
                                <Tag size={28} color="white" />
                            </div>
                            <h3 style={{fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem'}}>Create New Coupon</h3>
                            <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Offer discounts to boost your sales</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group" style={{marginBottom: '1.25rem'}}>
                                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Coupon Code</label>
                                <div style={{position: 'relative'}}>
                                    <input 
                                        name="code" 
                                        value={formData.code} 
                                        onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} 
                                        placeholder="e.g. SUMMER2024" 
                                        required 
                                        style={{
                                            width: '100%', padding: '1rem', paddingLeft: '1rem',
                                            borderRadius: '12px', border: '1px solid var(--border-color)', 
                                            background: 'rgba(255,255,255,0.03)', color: 'var(--text-primary)',
                                            fontSize: '1rem', outline: 'none', letterSpacing: '1px', fontWeight: 'bold'
                                        }} 
                                    />
                                    <div style={{position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '0.8rem', pointerEvents: 'none'}}>
                                        Preview: {formData.code || 'CODE'}
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem', marginBottom: '1.25rem'}}>
                                <div className="form-group">
                                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Discount Type</label>
                                    <select 
                                        name="discountType" 
                                        value={formData.discountType} 
                                        onChange={handleChange} 
                                        style={{
                                            width: '100%', padding: '1rem', borderRadius: '12px', 
                                            border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.03)', 
                                            color: 'var(--text-primary)', outline: 'none', cursor: 'pointer'
                                        }}
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount (₹)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Value</label>
                                    <input 
                                        type="number" 
                                        name="discountValue" 
                                        value={formData.discountValue} 
                                        onChange={handleChange} 
                                        placeholder="0" 
                                        required 
                                        style={{
                                            width: '100%', padding: '1rem', borderRadius: '12px', 
                                            border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.03)', 
                                            color: 'var(--text-primary)', outline: 'none', textAlign: 'center', fontWeight: 'bold'
                                        }} 
                                    />
                                </div>
                            </div>

                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem'}}>
                                <div className="form-group">
                                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Min Order (₹)</label>
                                    <input 
                                        type="number" 
                                        name="minOrderValue" 
                                        value={formData.minOrderValue} 
                                        onChange={handleChange} 
                                        style={{
                                            width: '100%', padding: '1rem', borderRadius: '12px', 
                                            border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.03)', 
                                            color: 'var(--text-primary)', outline: 'none'
                                        }} 
                                    />
                                </div>

                                <div className="form-group">
                                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Expiry Date</label>
                                    <input 
                                        type="date" 
                                        name="expiryDate" 
                                        value={formData.expiryDate} 
                                        onChange={handleChange} 
                                        required 
                                        style={{
                                            width: '100%', padding: '1rem', borderRadius: '12px', 
                                            border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.03)', 
                                            color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit'
                                        }} 
                                    />
                                </div>
                            </div>

                            <div className="form-group" style={{marginBottom: '2rem'}}>
                                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Specific Product (Optional)</label>
                                <select 
                                    name="productId" 
                                    value={formData.productId} 
                                    onChange={handleChange} 
                                    style={{
                                        width: '100%', padding: '1rem', borderRadius: '12px', 
                                        border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.03)', 
                                        color: 'var(--text-primary)', outline: 'none', cursor: 'pointer'
                                    }}
                                >
                                    <option value="">-- Apply to All My Products --</option>
                                    {products.map(p => (
                                        <option key={p._id} value={p._id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <button 
                                type="submit" 
                                className="btn btn-primary" 
                                style={{
                                    width: '100%', padding: '1rem', borderRadius: '12px', 
                                    fontSize: '1rem', fontWeight: 'bold', letterSpacing: '0.5px',
                                    background: 'linear-gradient(135deg, #FF4D6D 0%, #FF8FA3 100%)',
                                    boxShadow: '0 8px 16px rgba(255, 77, 109, 0.3)', border: 'none'
                                }}
                            >
                                <Plus size={18} style={{marginRight: '8px', verticalAlign: 'text-bottom'}} />
                                Create Coupon
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorCoupons;
