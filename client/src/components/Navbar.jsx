import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Search, Sun, Moon, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css'; // We will create this specific CSS

const Navbar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, logoutUser } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleScroll = (id) => {
    setIsMobileOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="navbar glass-panel">
      <div className="container navbar-container">
        <Link to={user ? "/shop" : "/"} className="logo" onClick={() => !user && handleScroll('hero')}>
          Frozen<span className="text-gradient">Delights</span>
        </Link>

        {/* Desktop Menu */}
        <ul className="nav-links">
          {!user && (
            <>
              <li><button onClick={() => handleScroll('hero')} className="nav-link-btn">Home</button></li>
              <li><button onClick={() => handleScroll('about')} className="nav-link-btn">About Us</button></li>
              <li><button onClick={() => handleScroll('menu')} className="nav-link-btn">Menu</button></li>
              <li><button onClick={() => handleScroll('signup')} className="nav-link-btn">Create Account</button></li>
            </>
          )}
        </ul>

        {/* Icons */}
        <div className="nav-icons">
          <button className="icon-btn desktop-only" onClick={toggleTheme} aria-label="Toggle Theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          {user && (
            <Link to="/cart" className="icon-btn" aria-label="Cart">
              <ShoppingCart size={20} />
              <span className="cart-badge">{getCartCount()}</span>
            </Link>
          )}
          {user ? (
            <div 
              className="user-dropdown-container"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <button 
                className="user-btn"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="nav-avatar">
                   {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="user-name">Hi, {user.name.split(' ')[0]}</span>
              </button>
              
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <Link to="/profile" className="dropdown-item">
                    <User size={16} /> Profile
                  </Link>
                  <button onClick={() => { logoutUser(); navigate('/'); }} className="dropdown-item logout-item">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm desktop-only">
              Login
            </Link>
          )}
          <button className="menu-btn" onClick={() => setIsMobileOpen(!isMobileOpen)}>
            {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className="mobile-menu glass-panel">
          {!user && (
            <>
              <button onClick={() => handleScroll('hero')} className="mobile-menu-btn">Home</button>
              <button onClick={() => handleScroll('about')} className="mobile-menu-btn">About Us</button>
              <button onClick={() => handleScroll('menu')} className="mobile-menu-btn">Menu</button>
            </>
          )}
          
          {!user && (
             <Link to="/login" onClick={() => setIsMobileOpen(false)} className="mobile-menu-btn" style={{border: 'none', textDecoration: 'none'}}>Login / Sigup</Link>
          )}

          {user && (
             <>
               <Link to="/profile" onClick={() => setIsMobileOpen(false)} className="mobile-menu-btn" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: 'none', textDecoration: 'none'}}>
                  <User size={18} /> Profile
               </Link>
               <button onClick={() => { logoutUser(); setIsMobileOpen(false); }} className="mobile-menu-btn" style={{borderBottom:'1px solid var(--glass-border)', color: '#ff4d6d'}}>Logout</button>
             </>
          )}

          <div className="mobile-menu-item" onClick={() => { toggleTheme(); setIsMobileOpen(false); }}>
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </div>

        </div>
      )}
    </nav>
  );
};

export default Navbar;
