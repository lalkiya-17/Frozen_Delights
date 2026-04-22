const express = require('express');
const userAuth = require('../middleware/userAuth');
const {
  getPendingVendors,
  approveVendor,
  vendorReject,
  getAdminStats,
  getAllVendors,
  addVendor,
  deleteVendor,
  getAllUsers,
  deleteUser,
  getSettings,
  updateSettings,
  createCoupon,
  getVendorCoupons,
  getAllOrders,
  updatePaymentStatus,
  getAllProductsAdmin,
  deleteProductAdmin
} = require("../controllers/adminController");
const adminAuth = require('../middleware/adminAuth');
const adminRoutes = express.Router();

// Order Management
// Order Management
adminRoutes.get('/orders/all', adminAuth, getAllOrders);
adminRoutes.put('/orders/payment-status', adminAuth, updatePaymentStatus);


adminRoutes.get('/vendors/pending', adminAuth, getPendingVendors);
adminRoutes.post('/vendors/approve/:id', adminAuth, approveVendor);
adminRoutes.post('/vendors/reject/:id', adminAuth, vendorReject);

// Vendor Management
adminRoutes.get('/vendors/all', adminAuth, getAllVendors);
adminRoutes.post('/vendors/add', adminAuth, addVendor);
adminRoutes.delete('/vendors/delete/:id', adminAuth, deleteVendor);

// Admin Stats
adminRoutes.get("/stats", adminAuth, getAdminStats);

// User Management
adminRoutes.get('/users/all', adminAuth, getAllUsers);
adminRoutes.delete('/users/delete/:id', adminAuth, deleteUser);

// Platform Settings
adminRoutes.get('/settings', adminAuth, getSettings);
adminRoutes.put('/settings', adminAuth, updateSettings);

// Coupons
adminRoutes.post('/coupons/create', adminAuth, createCoupon);
adminRoutes.get('/coupons/vendor', adminAuth, getVendorCoupons);

// Product Management
adminRoutes.get('/products/all', adminAuth, getAllProductsAdmin);
adminRoutes.delete('/products/delete/:id', adminAuth, deleteProductAdmin);

module.exports = adminRoutes;