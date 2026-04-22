const express = require('express');
const { createRazorpayOrder, verifyPayment } = require('../controllers/paymentController');
const userAuth = require('../middleware/userAuth');

const paymentRoutes = express.Router();

paymentRoutes.post('/create-order', userAuth, createRazorpayOrder);
paymentRoutes.post('/verify', verifyPayment); // Removed userAuth for debugging/fixes

module.exports = paymentRoutes;
