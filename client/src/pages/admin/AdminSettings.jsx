import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Bell, Shield, Globe, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import '../Dashboard.css';

import { toast } from 'react-toastify';

const AdminSettings = () => {
    const { theme, toggleTheme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({
        siteName: 'FrozenDelights',
        maintenanceMode: false,
        emailNotifications: true,
        autoApproveVendors: false
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                const res = await axios.get('/api/admin/settings', { 
                    headers: { token },
                    withCredentials: true 
                });
                if (res.data.success && res.data.settings) {
                    setSettings(res.data.settings);
                }
            } catch (error) {
                console.error("Failed to load settings", error);
                toast.error("Failed to load settings");
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        const { name, type, checked, value } = e.target;
        setSettings({
            ...settings,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.put('/api/admin/settings', settings, { 
                headers: { token },
                withCredentials: true 
            });
            if (res.data.success) {
                toast.success(res.data.message || "Settings saved successfully");
            } else {
                toast.error(res.data.message || "Failed to save settings");
            }
        } catch (error) {
            toast.error('Error saving settings: ' + (error.response?.data?.message || error.message));
        }
    };

    if (loading) return <div className="p-4">Loading settings...</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
                <div className="dashboard-title">
                    <h1>Platform Settings</h1>
                    <p>Configure global application preferences and security controls</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                     <button 
                        className="btn btn-primary" 
                        onClick={handleSave}
                        disabled={loading}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem' }}
                    >
                        <Save size={18} /> {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button 
                        className="btn btn-outline" 
                        onClick={toggleTheme} 
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', background: 'var(--bg-card)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }}
                    >
                        {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                        {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                
                {/* Security Section */}
                <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', background: 'var(--bg-card)', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
                        <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(230, 57, 70, 0.1)', color: '#e63946' }}>
                            <Shield size={24} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>Security Controls</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Manage access and restrictions</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="setting-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                            <div>
                                <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>Maintenance Mode</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Temporarily disable public access</div>
                            </div>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    name="maintenanceMode"
                                    checked={settings.maintenanceMode} 
                                    onChange={handleChange}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>

                         <div className="setting-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                            <div>
                                <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>Auto-Approve Vendors</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Skip manual review for new vendors</div>
                            </div>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    name="autoApproveVendors"
                                    checked={settings.autoApproveVendors} 
                                    onChange={handleChange}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Notifications Section */}
                <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', background: 'var(--bg-card)', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
                         <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(67, 97, 238, 0.1)', color: '#4361ee' }}>
                            <Bell size={24} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>System Notifications</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Configure alert preferences</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="setting-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                            <div>
                                <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>Email Notifications</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Receive updates for new registrations</div>
                            </div>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    name="emailNotifications"
                                    checked={settings.emailNotifications} 
                                    onChange={handleChange}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>
                     <div style={{ marginTop: 'auto', padding: '1rem', background: 'linear-gradient(135deg, rgba(67, 97, 238, 0.05) 0%, rgba(67, 97, 238, 0.1) 100%)', borderRadius: '12px', border: '1px dashed var(--primary)' }}>
                        <div style={{ display: 'flex', gap: '0.8rem' }}>
                            <Globe size={18} color="var(--primary)" />
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                <span style={{ fontWeight: '600' }}>Active Domain:</span> {settings.siteName}
                            </div>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem', marginLeft: '2rem' }}>
                            Site name is managed via environment configuration.
                        </p>
                    </div>
                </div>

            </div>
            
            <style jsx>{`
                .switch {
                    position: relative;
                    display: inline-block;
                    width: 48px;
                    height: 24px;
                }
                .switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(128, 128, 128, 0.3);
                    border: 1px solid var(--glass-border);
                    transition: .4s;
                    border-radius: 34px;
                }
                .slider:before {
                    position: absolute;
                    content: "";
                    height: 18px;
                    width: 18px;
                    left: 3px;
                    bottom: 2px;
                    background-color: white;
                    transition: .4s;
                    border-radius: 50%;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                input:checked + .slider {
                    background-color: var(--primary);
                }
                input:checked + .slider:before {
                    transform: translateX(24px);
                }
            `}</style>
        </div>
    );
};

export default AdminSettings;
