import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Mail, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('/api/auth/send-reset-otp', { email });
            if (res.data.sucess) { 
                toast.success(res.data.message);
                // Pass email to reset page so user doesn't have to re-type it
                navigate('/reset-password', { state: { email } });
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '4rem' }}>
            <div className="glass-panel" style={{ padding: '2.5rem', width: '100%', maxWidth: '450px', borderRadius: '16px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ 
                        width: '60px', height: '60px', background: 'rgba(56, 189, 248, 0.1)', 
                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1rem auto', color: 'var(--primary)'
                    }}>
                        <Mail size={28} />
                    </div>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Forgot Password?</h2>
                    <p className="text-secondary">No worries, we'll send you reset instructions.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email</label>
                        <input 
                            type="email" 
                            className="form-input" 
                            style={{ 
                                width: '100%', padding: '0.8rem', borderRadius: '8px', 
                                border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', 
                                color: 'var(--text-primary)', outline: 'none'
                            }}
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '0.9rem', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1rem' }}
                        disabled={loading}
                    >
                        {loading ? 'Sending OTP...' : 'Send Reset OTP'}
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

export default ForgotPassword;
