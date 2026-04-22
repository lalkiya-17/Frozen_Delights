import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../Auth.css';

const MagicLogin = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { magicLogin } = useAuth();
    const token = searchParams.get('token');
    const hasVerified = React.useRef(false); // Ref to prevent double execution

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                navigate('/');
                return;
            }

            if (hasVerified.current) return;
            hasVerified.current = true; // Mark as verified

            try {
                console.log("Calling magicLogin...");
                const { success, message, user } = await magicLogin(token);
                console.log("MagicLogin Result:", { success, message, user });
                
                if (success) {
                    console.log("Navigating to /vendor");
                    navigate('/vendor'); // Redirect to dashboard
                } else {
                    alert(message || "Invalid Magic Link");
                    navigate('/');
                }
            } catch (error) {
                console.error("Magic Login Error:", error);
                navigate('/');
            }
        };

        verifyToken();
    }, [token, magicLogin, navigate]);

    return (
        <div className="auth-page" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
            <div className="glow glow-1"></div>
            <h2 className="auth-title" style={{zIndex: 5}}>Verifying Access...</h2>
            <p className="auth-subtitle" style={{zIndex: 5}}>Please wait while we log you in safely.</p>
        </div>
    );
};

export default MagicLogin;
