import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { KeyRound, ArrowLeft } from 'lucide-react';

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Note: Route is case-sensitive if backend uses it that way, fixing typo in next step
            const res = await axios.post('/api/auth/reset-password', { email, otp, newPassword });
            if (res.data.sucess) {
                toast.success("Password reset successfully! Please login.");
                navigate('/login');
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '4rem' }}>
            <div className="glass-panel" style={{ padding: '2.5rem', width: '100%', maxWidth: '450px', borderRadius: '16px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ 
                        width: '60px', height: '60px', background: 'rgba(42, 157, 143, 0.1)', 
                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1rem auto', color: '#2a9d8f'
                    }}>
                        <KeyRound size={28} />
                    </div>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Set New Password</h2>
                    <p className="text-secondary">Enter the OTP sent to {email}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email</label>
                        <input 
                            type="email" 
                            className="form-input" 
                            style={{ 
                                width: '100%', padding: '0.8rem', borderRadius: '8px', 
                                border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', 
                                color: 'var(--text-primary)', outline: 'none'
                            }}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Confirm your email"
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>OTP</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            style={{ 
                                width: '100%', padding: '0.8rem', borderRadius: '8px', 
                                border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', 
                                color: 'var(--text-primary)', outline: 'none', letterSpacing: '2px', textAlign: 'center', fontSize: '1.1rem'
                            }}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            placeholder="------"
                            maxLength="6"
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>New Password</label>
                        <input 
                            type="password" 
                            className="form-input" 
                            style={{ 
                                width: '100%', padding: '0.8rem', borderRadius: '8px', 
                                border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', 
                                color: 'var(--text-primary)', outline: 'none'
                            }}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            placeholder="Enter new password"
                            minLength="6"
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '0.9rem', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1rem' }}
                        disabled={loading}
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
                
                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <Link to="/login" style={{ 
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem',
                        transition: 'color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                    onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                    >
                        <ArrowLeft size={16} /> Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
