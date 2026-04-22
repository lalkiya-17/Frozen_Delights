import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../Auth.css';

const AdminLogin = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const { loginAdmin } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { success, user, message } = await loginAdmin(formData.email, formData.password);

        if (success) {
            if (user.role === 'admin') {
                navigate('/admin');
            } else {
                alert("Access Denied: You do not have admin privileges.");
            }
        } else {
            alert(message || "Login failed");
        }
    };

    return (
        <div className="auth-page">
            <div className="glow glow-1" style={{ background: 'radial-gradient(circle, rgba(255, 77, 109, 0.15) 0%, rgba(255, 77, 109, 0) 70%)' }}></div>
            <div className="glow glow-2" style={{ background: 'radial-gradient(circle, rgba(255, 77, 109, 0.15) 0%, rgba(255, 77, 109, 0) 70%)' }}></div>

            <div className="auth-container" style={{
                border: '1px solid rgba(255, 77, 109, 0.3)',
                boxShadow: '0 20px 40px rgba(255, 77, 109, 0.1)'
            }}>
                <div className="auth-header">
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: '1rem'
                    }}>
                        <div style={{
                            padding: '1rem',
                            borderRadius: '50%',
                            background: 'rgba(255, 77, 109, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <ShieldCheck size={32} color="var(--primary)" />
                        </div>
                    </div>
                    <h2 className="auth-title">Admin <span className="text-gradient">Portal</span></h2>
                    <p className="auth-subtitle">Secure Access Management</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <div className="input-icon-wrapper">
                            <Mail size={18} className="input-icon" />
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="admin@frozendelights.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-icon-wrapper">
                            <Lock size={18} className="input-icon" />
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-block">
                        Access Dashboard
                    </button>
                </form>

                <div className="auth-footer">
                    Back to <span className="link" onClick={() => navigate('/shop')} style={{cursor: 'pointer'}}>Shop</span>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
