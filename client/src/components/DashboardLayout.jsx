import React, { useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingBag, Settings, LogOut, Store, Package, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../pages/Dashboard.css';

const DashboardLayout = ({ role }) => { // role = 'admin' | 'vendor'
    const { admin, vendor, logoutAdmin, logoutVendor, loading } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const currentUser = role === 'admin' ? admin : vendor;
    const logout = role === 'admin' ? logoutAdmin : logoutVendor;

    useEffect(() => {
        if (!loading && !currentUser) {
            console.log("Redirecting because no user...", role);
            if (role === 'admin') navigate('/admin/login');
            else if (role === 'vendor') navigate('/'); 
        }
    }, [currentUser, loading, role, navigate]);

    if (loading) return <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', color: 'var(--text-primary)'}}>Loading Dashboard...</div>;
    if (!currentUser) return null; // Wait for redirect

    // Define links based on role
    const links = role === 'admin' ? [
        { name: 'Overview', path: '/admin', icon: LayoutDashboard },
        { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
        { name: 'Products', path: '/admin/products', icon: Package },
        { name: 'Coupons', path: '/admin/coupons', icon: Tag }, // Added Coupon Link
        { name: 'Vendors', path: '/admin/vendors', icon: Store },
        { name: 'Users', path: '/admin/users', icon: Users },
        { name: 'Settings', path: '/admin/settings', icon: Settings },
    ] : [
        { name: 'Overview', path: '/vendor', icon: LayoutDashboard },
        { name: 'My Products', path: '/vendor/products', icon: Package },
        { name: 'Coupons', path: '/vendor/coupons', icon: Tag }, // Added Coupon Link
        { name: 'Orders', path: '/vendor/orders', icon: ShoppingBag },
        { name: 'Shop Settings', path: '/vendor/settings', icon: Settings },
    ];

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <aside className="dashboard-sidebar">
                <a href="/" className="dashboard-logo">
                    Frozen<span className="text-gradient">Delights</span>
                </a>

                <nav className="dashboard-nav">
                    {links.map((link) => (
                        <NavLink 
                            key={link.path} 
                            to={link.path}
                            end={link.path === '/admin' || link.path === '/vendor'}
                            className={({ isActive }) => `dashboard-nav-item ${isActive ? 'active' : ''}`}
                        >
                            <link.icon size={20} />
                            {link.name}
                        </NavLink>
                    ))}
                </nav>

                <div className="dashboard-user">
                    <div className="nav-avatar" style={{width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>
                        {currentUser?.name?.charAt(0) || 'U'}
                    </div>
                    <div style={{flex: 1}}>
                        <div style={{fontSize: '0.9rem', fontWeight: '600'}}>{currentUser?.name || 'User'}</div>
                        <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'capitalize'}}>{role}</div>
                    </div>
                    <button onClick={logout} style={{background: 'none', border: 'none', color: '#ff4d6d', cursor: 'pointer'}}>
                        <LogOut size={20} />
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="dashboard-content">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
