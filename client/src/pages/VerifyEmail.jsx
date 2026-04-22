import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ShieldCheck, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const VerifyEmail = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const { checkAuth } = useAuth();

    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
        } else {
            // If no email in state, try to get from user data if logged in
            // But usually this is for unverified users
            toast.error("Email context missing. Please login again.");
            navigate('/login');
        }
    }, [location, navigate]);

    const handleChange = (index, value) => {
        if (isNaN(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Move to next input
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`).focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`).focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const otpValue = otp.join('');
        
        try {
            const token = localStorage.getItem('userToken');
            const res = await axios.post('/api/auth/verify-account', { otp: otpValue }, {
                headers: { token },
                withCredentials: true
            });

            if (res.data.success) {
                toast.success("Email verified successfully!");
                await checkAuth(); // Refresh auth state
                navigate('/shop');
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Verification failed");
        } finally {
            setLoading(false);
        }
    };

    const resendOtp = async () => {
        try {
            const token = localStorage.getItem('userToken');
            const res = await axios.post('/api/auth/send-verify-otp', {}, {
                headers: { token },
                withCredentials: true
            });
            if (res.data.success) {
                toast.success("New OTP sent to your email!");
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error("Failed to resend OTP");
        }
    };

    return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '4rem' }}>
            <div className="glass-panel" style={{ padding: '2.5rem', width: '100%', maxWidth: '450px', borderRadius: '16px', textAlign: 'center' }}>
                <div style={{ 
                    width: '64px', height: '64px', background: 'rgba(255, 77, 109, 0.1)', 
                    color: '#ff4d6d', borderRadius: '50%', display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', margin: '0 auto 1.5rem auto' 
                }}>
                    <Mail size={32} />
                </div>
                
                <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Verify Your Email</h2>
                <p className="text-secondary" style={{ marginBottom: '2rem' }}>
                    We've sent a 6-digit verification code to <br />
                    <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{email}</span>
                </p>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', marginBottom: '2rem' }}>
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                id={`otp-${index}`}
                                type="text"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                style={{
                                    width: '45px',
                                    height: '50px',
                                    textAlign: 'center',
                                    fontSize: '1.2rem',
                                    fontWeight: 'bold',
                                    borderRadius: '10px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'var(--text-primary)',
                                    outline: 'none',
                                    transition: 'all 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                            />
                        ))}
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        disabled={loading}
                    >
                        {loading ? 'Verifying...' : (
                            <>
                                <ShieldCheck size={20} /> Verify Account
                            </>
                        )}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', fontSize: '0.9rem' }}>
                    <p className="text-secondary">
                        Didn't receive the code?{' '}
                        <button 
                            onClick={resendOtp}
                            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                        >
                            Resend OTP
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
