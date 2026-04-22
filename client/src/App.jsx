import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetails from './pages/ProductDetails';
import AdminLogin from './pages/admin/AdminLogin';
import MagicLogin from './pages/vendor/MagicLogin';
import About from './pages/About';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';

import Footer from './components/Footer';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import DashboardLayout from './components/DashboardLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorProducts from './pages/vendor/VendorProducts';
import VendorOrders from './pages/vendor/VendorOrders';
import AdminSettings from './pages/admin/AdminSettings';
import AdminVendors from './pages/admin/AdminVendors';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCoupons from './pages/admin/AdminCoupons';
import VendorSettings from './pages/vendor/VendorSettings';
import VendorCoupons from './pages/vendor/VendorCoupons';
import Invoice from './pages/Invoice';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout for public pages (includes Navbar and Footer)
const PublicLayout = () => {
  return (
    <>
      <Navbar />
      <div className="content">
        <Outlet />
      </div>
      <Footer />
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="App">
              <ToastContainer position="top-right" autoClose={3000} />
              <Routes>
                {/* Public Routes with Navbar & Footer */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/shop/:id" element={<ProductDetails />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                </Route>
                
                {/* Standalone Auth Routes (No Navbar/Footer) */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/vendor/magic-login" element={<MagicLogin />} />
                <Route path="/invoice/:orderId" element={<Invoice />} />
                
                {/* Admin Routes (No Navbar/Footer) */}
                <Route path="/admin" element={<DashboardLayout role="admin" />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="coupons" element={<AdminCoupons />} />
                  <Route path="vendors" element={<AdminVendors />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                {/* Vendor Routes (No Navbar/Footer) */}
                <Route path="/vendor" element={<DashboardLayout role="vendor" />}>
                  <Route index element={<VendorDashboard />} />
                  <Route path="products" element={<VendorProducts />} />
                  <Route path="coupons" element={<VendorCoupons />} />
                  <Route path="orders" element={<VendorOrders />} />
                  <Route path="settings" element={<VendorSettings />} />
                </Route>

              </Routes>
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
