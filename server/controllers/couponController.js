const Coupon = require('../models/Coupon');
const Product = require('../models/Products');

const createCoupon = async (req, res) => {
    try {
        const { code, discountType, discountValue, minOrderValue, expiryDate, productId } = req.body;
        
        const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
        if (couponExists) {
            return res.json({ success: false, message: "Coupon code already exists" });
        }

        const couponData = {
            code,
            discountType,
            discountValue: Number(discountValue),
            minOrderValue: Number(minOrderValue) || 0,
            expiryDate: new Date(expiryDate),
            vendor: req.user.id
        };

        if (productId) {
            couponData.product = productId;
        }

        const coupon = await Coupon.create(couponData);

        res.json({ success: true, message: "Coupon created successfully", coupon });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

const getVendorCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({ vendor: req.user.id }).populate('product', 'name');
        res.json({ success: true, coupons });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

const getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().populate('vendor', 'name').populate('product', 'name');
        res.json({ success: true, coupons });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

const deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return res.json({ success: false, message: "Coupon not found" });
        }

        // Allow deletion if admin OR if vendor owns the coupon
        if (req.user.role !== 'admin' && coupon.vendor.toString() !== req.user.id) {
             return res.status(403).json({ success: false, message: "Not authorized to delete this coupon" });
        }

        await Coupon.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Coupon deleted successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

const toggleCouponStatus = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return res.json({ success: false, message: "Coupon not found" });
        }

        if (req.user.role !== 'admin' && coupon.vendor.toString() !== req.user.id) {
             return res.status(403).json({ success: false, message: "Not authorized" });
        }

        coupon.isActive = !coupon.isActive;
        await coupon.save();

        res.json({ success: true, message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'}`, coupon });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

module.exports = {
    createCoupon,
    getVendorCoupons,
    getAllCoupons,
    deleteCoupon,
    toggleCouponStatus
};
