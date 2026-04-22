import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { checkAuth, googleLogin } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            const res = await axios.post('/api/auth/register', { name, email, password, phone });
            if (res.data.success) {
                if (res.data.needsVerification) {
                    localStorage.setItem('userToken', res.data.token);
                    navigate('/verify-email', { state: { email } });
                } else {
                    await checkAuth(); // Update auth context
                    navigate('/shop');
                }
            } else {
                setError(res.data.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div style={{ 
            minHeight: '80vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'var(--bg-primary)',
            marginTop: '8rem',
            marginBottom: '5rem',
        }}>
            <div className="glass-panel" style={{ 
                padding: '2rem', 
                width: '100%', 
                maxWidth: '400px',
                borderRadius: '16px'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Create Account</h2>
                    <p className="text-secondary">Join us for some frozen delights</p>
                </div>

                {error && (
                    <div style={{ 
                        background: 'rgba(255, 77, 109, 0.1)', 
                        color: '#ff4d6d', 
                        padding: '0.75rem', 
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                <div style={{ margin: '1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <GoogleLogin
                        onSuccess={async (credentialResponse) => {
                             // Google Login handles both login and registration on backend
                            const res = await googleLogin(credentialResponse.credential);
                            if (res.success) {
                                navigate('/shop');
                            } else {
                                setError(res.message);
                            }
                        }}
                        onError={() => {
                            setError('Google Signup Failed');
                        }}
                        theme="filled_black"
                        shape="pill"
                        text="signup_with"
                    />
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Full Name</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
                        <input 
                            type="email" 
                            className="form-input" 
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Phone Number</label>
                        <input 
                            type="tel" 
                            className="form-input" 
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            placeholder="Enter 10 digit number"
                        />
                    </div>
                    
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
                        <input 
                            type="password" 
                            className="form-input" 
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '0.75rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <UserPlus size={18} /> Register
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
                    <p className="text-secondary">
                        Already have an account? <Link to="/login" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
