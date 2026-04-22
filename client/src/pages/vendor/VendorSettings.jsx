import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Save, Store, MapPin, Clock, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import '../Dashboard.css';

const VendorSettings = () => {
    const { theme, toggleTheme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [shopData, setShopData] = useState({
        shopName: '',
        address: '',
        description: '',
        openingTime: '',
        closingTime: '',
        isOpen: true
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const token = localStorage.getItem('vendorToken');
            const res = await axios.get('/api/vendor/profile', { 
                headers: { token },
                withCredentials: true 
            });
            if (res.data.success) {
                const { shopName, address, description, openingTime, closingTime, isOpen } = res.data.vendorDetails;
                setShopData({ 
                    shopName: shopName || '', 
                    address: address || '', 
                    description: description || '', 
                    openingTime: openingTime || '09:00', 
                    closingTime: closingTime || '21:00', 
                    isOpen: isOpen !== undefined ? isOpen : true 
                });
            }
        } catch (error) {
            console.error("Failed to fetch settings", error);
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setShopData({ 
            ...shopData, 
            [name]: type === 'checkbox' ? checked : value 
        });
    };

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('vendorToken');
            const res = await axios.put('/api/vendor/profile', shopData, { 
                headers: { token },
                withCredentials: true 
            });
            if (res.data.success) {
                toast.success(res.data.message);
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error("Failed to update settings");
        }
    };

    if (loading) return <div style={{padding: '2rem', textAlign: 'center'}}>Loading settings...</div>;

    return (
        <div>
           <div className="dashboard-header">
                <div className="dashboard-title">
                    <h1>Shop Settings</h1>
                    <p>Manage your store profile and preferences</p>
                </div>
                <div style={{display: 'flex', gap: '1rem', marginTop: '0.5rem'}}>
                    <button className="btn btn-primary" onClick={handleSubmit}>
                        <Save size={18} style={{marginRight: '0.5rem'}} /> Save Changes
                    </button>
                    <button className="btn btn-outline" onClick={toggleTheme} style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem'}}>
                        {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                        {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                    </button>
                </div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr', gap: '2rem'}}>
                
                {/* Shop Details */}
                <div className="stat-card" style={{display: 'block'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem'}}>
                        <Store size={22} color="var(--primary)" />
                        <h3 style={{fontSize: '1.25rem', fontWeight: 600}}>Shop Details</h3>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Shop Name</label>
                            <input 
                                type="text" 
                                name="shopName"
                                value={shopData.shopName} 
                                onChange={handleChange}
                                className="form-input" 
                            />
                        </div>
                        <div className="form-group">
                             <label>Shop Status</label>
                             <select 
                                className="form-input"
                                name="isOpen"
                                value={shopData.isOpen ? 'open' : 'closed'}
                                onChange={(e) => setShopData({...shopData, isOpen: e.target.value === 'open'})}
                             >
                                 <option value="open">Open for Orders</option>
                                 <option value="closed">Temporarily Closed</option>
                             </select>
                        </div>
                    </div>

                    <div className="form-group" style={{marginTop: '1.5rem'}}>
                        <label>Description</label>
                        <textarea 
                            name="description"
                            value={shopData.description} 
                            onChange={handleChange}
                            className="form-input"
                            rows="3"
                        ></textarea>
                    </div>

                     <div className="form-group" style={{marginTop: '1.5rem'}}>
                        <label>Address</label>
                        <textarea 
                            name="address"
                            value={shopData.address} 
                            onChange={handleChange}
                            className="form-input"
                            rows="2"
                        ></textarea>
                    </div>
                </div>

                {/* Operating Hours */}
                <div className="stat-card" style={{display: 'block'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem'}}>
                        <Clock size={22} color="var(--primary)" />
                        <h3 style={{fontSize: '1.25rem', fontWeight: 600}}>Operating Hours</h3>
                    </div>
                    
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Opening Time</label>
                            <input 
                                type="time" 
                                name="openingTime"
                                value={shopData.openingTime} 
                                onChange={handleChange}
                                className="form-input" 
                            />
                        </div>
                        <div className="form-group">
                            <label>Closing Time</label>
                            <input 
                                type="time" 
                                name="closingTime"
                                value={shopData.closingTime} 
                                onChange={handleChange}
                                className="form-input" 
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default VendorSettings;
