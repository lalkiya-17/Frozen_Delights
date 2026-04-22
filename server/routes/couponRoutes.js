const express = require('express');
const couponRouter = express.Router();
const userAuth = require('../middleware/userAuth');
const vendorAuth = require('../middleware/vendorAuth');
const adminAuth = require('../middleware/adminAuth');
const { 
    createCoupon, 
    getVendorCoupons, 
    getAllCoupons, 
    deleteCoupon, 
    toggleCouponStatus 
} = require('../controllers/couponController');

// Vendor Routes
couponRouter.post('/add', userAuth, vendorAuth, createCoupon);
couponRouter.get('/vendor/my', userAuth, vendorAuth, getVendorCoupons);

// Admin Routes
couponRouter.get('/admin/all', adminAuth, getAllCoupons);

// Shared/Common (with internal role checks in controller or specific middleware for route)
// Delete: ID param. Controller specific: checks ownership or admin role.
// Ideally should separate or use verifyOwnerOrAdmin middleware, but controller check is fine for now.
// However, our auth middlewares populate req.user differently or restrict access.
// Let's make separate routes to be safe with existing middlewares.

couponRouter.delete('/vendor/:id', userAuth, vendorAuth, deleteCoupon);
couponRouter.put('/vendor/status/:id', userAuth, vendorAuth, toggleCouponStatus);

couponRouter.delete('/admin/:id', adminAuth, deleteCoupon);
couponRouter.put('/admin/status/:id', adminAuth, toggleCouponStatus);

module.exports = couponRouter;
