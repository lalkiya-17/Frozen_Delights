import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { LogIn } from 'lucide-react';
import './Home.css'; // Reusing Home.css for basic styles or I can add inline/new css. 
// Actually, I'll use inline styles or standard classes to be safe.

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { loginUser, googleLogin } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await loginUser(email, password);
        if (res.success) {
            navigate('/shop');
        } else {
            if (res.needsVerification) {
                localStorage.setItem('userToken', res.token);
                navigate('/verify-email', { state: { email } });
            } else {
                setError(res.message);
            }
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
                    <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome Back</h2>
                    <p className="text-secondary">Login to continue to your account</p>
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
                            const res = await googleLogin(credentialResponse.credential);
                            if (res.success) {
                                navigate('/shop');
                            } else {
                                setError(res.message);
                            }
                        }}
                        onError={() => {
                            setError('Google Login Failed');
                        }}
                        theme="filled_black"
                        shape="pill"
                        text="signin_with"
                    />
                </div>

                <form onSubmit={handleSubmit}>
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

                    <div style={{ textAlign: 'right', marginBottom: '1.5rem', marginTop: '-1rem' }}>
                        <Link to="/forgot-password" style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', textDecoration: 'none' }}>
                            Forgot Password?
                        </Link>
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '0.75rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <LogIn size={18} /> Login
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
                    <p className="text-secondary">
                        Don't have an account? <Link to="/register" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>Register</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
