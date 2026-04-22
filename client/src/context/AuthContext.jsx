import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Customer
  const [admin, setAdmin] = useState(null); // Admin
  const [vendor, setVendor] = useState(null); // Vendor
  const [loading, setLoading] = useState(true);

  // Axios instance
  const api = axios.create({
    baseURL: '/api/auth',
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
  });

  // Helper to fetch data with a specific token
  const fetchData = async (token) => {
      try {
          const res = await axios.get('/api/user/data', { 
              headers: { token, 'Content-Type': 'application/json' },
              withCredentials: true
          });
          return res.data.success ? res.data.userData : null;
      } catch (error) {
          return null;
      }
  };

  const checkAuth = async () => {
    setLoading(true);
    try {
        // 1. Check User Token
        const userToken = localStorage.getItem('userToken');
        if (userToken) {
            const userData = await fetchData(userToken);
            if (userData) setUser(userData);
            else { localStorage.removeItem('userToken'); setUser(null); }
        }

        // 2. Check Admin Token
        const adminToken = localStorage.getItem('adminToken');
        if (adminToken) {
            const adminData = await fetchData(adminToken);
            if (adminData && adminData.role === 'admin') setAdmin(adminData);
            else { localStorage.removeItem('adminToken'); setAdmin(null); }
        }
        
        // 3. Check Vendor Token (if distinct from Admin)
        const vendorToken = localStorage.getItem('vendorToken');
        if (vendorToken) {
            const vendorData = await fetchData(vendorToken);
            if (vendorData && vendorData.role === 'vendor') setVendor(vendorData);
            else { localStorage.removeItem('vendorToken'); setVendor(null); }
        }

    } catch (error) {
        console.error("Auth check failed", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // --- Login Functions ---

  const loginUser = async (email, password) => {
    try {
      const res = await api.post('/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('userToken', res.data.token);
        // We can either set state directly or refetch. 
        // Refetching ensures consistency but we have user data in response usually?
        // Let's just refetch to be safe or use what we have if we returned.
        // Assuming /login returns token.
        const userData = await fetchData(res.data.token);
        setUser(userData);
        return { success: true, user: userData };
      }
      return { 
          success: false, 
          message: res.data.message, 
          needsVerification: res.data.needsVerification,
          email: res.data.email,
          token: res.data.token
      };
    } catch (error) {
      return { 
          success: false, 
          message: error.response?.data?.message || 'Login failed',
          needsVerification: error.response?.data?.needsVerification,
          email: error.response?.data?.email,
          token: error.response?.data?.token
      };
    }
  };

  const loginAdmin = async (email, password) => {
    try {
        const res = await api.post('/login', { email, password });
        if (res.data.success) {
            // Fix: Check role from res.data.user.role, not res.data.role
            const userRole = res.data.user?.role || res.data.role; // Fallback just in case
            if (userRole !== 'admin') {
                return { success: false, message: 'Not authorized as Admin' };
            }
            localStorage.setItem('adminToken', res.data.token);
            // We can use the user data from response directly to avoid extra call if we want, 
            // but fetchData ensures token works.
            const adminData = await fetchData(res.data.token);
            setAdmin(adminData || res.data.user); // Fallback to login response data
            return { success: true, user: adminData || res.data.user };
        }
        return { success: false, message: res.data.message };
    } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const loginVendor = async (email, password) => { 
     // Similar logic
     try {
        const res = await api.post('/login', { email, password });
        if (res.data.success) {
             const userRole = res.data.user?.role || res.data.role;
             if (userRole !== 'vendor') {
                return { success: false, message: 'Not authorized as Vendor' };
            }
            localStorage.setItem('vendorToken', res.data.token);
            const vendorData = await fetchData(res.data.token);
            setVendor(vendorData || res.data.user);
            return { success: true, user: vendorData || res.data.user };
        }
        return { success: false, message: res.data.message };
     } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Login failed' };
     }
  };

  const googleLogin = async (token) => {
    try {
        const res = await api.post('/google', { token });
        if (res.data.success) {
            localStorage.setItem('userToken', res.data.token);
            const userData = await fetchData(res.data.token);
            setUser(userData || res.data.user);
            return { success: true, user: userData || res.data.user };
        }
        return { success: false, message: res.data.message };
    } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Google Login failed' };
    }
  };

  // --- Logout Functions ---

  const logoutUser = async () => {
    try {
        await api.post('/logout'); // Clear backend cookies
    } catch (e) { console.error("Logout error", e); }
    localStorage.removeItem('userToken');
    setUser(null);
    window.location.href = '/'; // Hard refresh to clear all states
  };

  const logoutAdmin = async () => {
    try {
        await api.post('/logout');
    } catch (e) { console.error("Logout error", e); }
    localStorage.removeItem('adminToken');
    setAdmin(null);
  };
  
  const logoutVendor = async () => {
    try {
        await api.post('/logout');
    } catch (e) { console.error("Logout error", e); }
    localStorage.removeItem('vendorToken');
    setVendor(null);
  };

  const magicLogin = async (token) => {
    try {
        const res = await api.post('/magic-login', { token });
        if (res.data.success) {
            localStorage.setItem('vendorToken', res.data.token); // Use token from response, not link token
            // We can set vendor data directly
            setVendor(res.data.user);
            return { success: true, user: res.data.user };
        }
        return { success: false, message: res.data.message };
    } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Magic login failed' };
    }
  };
  
  // Keep legacy prop names for compatibility where possible, or migrate all
  // Navbar uses: user, logout
  // We'll map 'user' to 'user' state. 
  // 'logout' -> logoutUser (default)

  // --- Profile & Vendor Functions ---

  const updateProfile = async (name, phone) => {
      try {
          const token = localStorage.getItem('userToken');
          const res = await axios.put('/api/user/update', { name, phone }, {
              headers: { token },
              withCredentials: true
          });
          if (res.data.success) {
              setUser(res.data.userData);
              return { success: true, message: res.data.message };
          }
          return { success: false, message: res.data.message };
      } catch (error) {
          return { success: false, message: error.response?.data?.message || 'Update failed' };
      }
  };

  const applyForVendor = async (formData) => {
      try {
          const token = localStorage.getItem('userToken');
          const res = await axios.post('/api/user/apply-vendor', formData, {
              headers: { 
                  token,
                  'Content-Type': 'multipart/form-data' 
              },
              withCredentials: true
          });
          if (res.data.success) {
              // If auto-approved, update user state
              if (res.data.autoApproved) {
                 await checkAuth(); // Refresh entire auth state to get new role
              }
              return { success: true, message: res.data.message };
          }
          return { success: false, message: res.data.message };
      } catch (error) {
          return { success: false, message: error.response?.data?.message || 'Application failed' };
      }
  };

  return (
    <AuthContext.Provider value={{ 
        user, admin, vendor, loading, 
        loginUser, loginAdmin, loginVendor, magicLogin, googleLogin,
        logoutUser, logoutAdmin, logoutVendor, logout: logoutUser,
        updateProfile, applyForVendor,
        checkAuth 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
