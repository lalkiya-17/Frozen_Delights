const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

// Initialize Razorpay
// NOTE: Using environment variables for keys is best practice
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// 1. Create Razorpay Order
const createRazorpayOrder = async (req, res) => {
    try {
        const { amount } = req.body;
        console.log("Creating Razorpay Order for amount:", amount);

        if (!amount) {
            console.error("Amount is missing");
            return res.status(400).json({ success: false, message: "Amount is required" });
        }

        const options = {
            amount: Math.round(amount * 100), 
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            order
        });
    } catch (error) {
        console.error("Razorpay Order Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Verify Payment
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        console.log("Verify Payment Request Body:", req.body);

        if(!process.env.RAZORPAY_KEY_SECRET) {
            console.error("RAZORPAY_KEY_SECRET is missing in .env");
            return res.status(500).json({ success: false, message: "Server configuration error" });
        }

        const secret = process.env.RAZORPAY_KEY_SECRET.trim(); // Trim to avoid whitespace issues

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body.toString())
            .digest('hex');

        console.log("Expected Signature:", expectedSignature);
        console.log("Received Signature:", razorpay_signature);

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            res.json({
                success: true,
                message: "Payment verified successfully"
            });
        } else {
            console.error("Signature Mismatch!");
            res.status(400).json({
                success: false,
                message: "Invalid signature"
            });
        }
    } catch (error) {
        console.error("Payment Verification Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createRazorpayOrder,
    verifyPayment
};
