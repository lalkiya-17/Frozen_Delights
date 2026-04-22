const mongoose = require('mongoose');
const Coupon = require('./models/Coupon');
const User = require('./models/User'); // Need a vendor
require('dotenv').config();

const seedCoupons = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/FrozenDelights");
        console.log("MongoDB Connected");

        // Find a vendor (or create one if needed, or just pick the first user for simplicity in dev)
        // Ideally, we should find a user with role 'vendor'
        let vendor = await User.findOne({ role: 'vendor' });
        if (!vendor) {
            console.log("No vendor found, using first user as vendor owner for coupons");
            vendor = await User.findOne();
        }

        if (!vendor) {
            console.log("No users found. Please create a user first.");
            process.exit(1);
        }

        const coupons = [
            {
                code: "WELCOME50",
                discountType: "percentage",
                discountValue: 50,
                minOrderValue: 500,
                expiryDate: new Date("2026-12-31"),
                vendor: vendor._id,
                isActive: true
            },
            {
                code: "SAVE100",
                discountType: "fixed",
                discountValue: 100,
                minOrderValue: 1000,
                expiryDate: new Date("2026-12-31"),
                vendor: vendor._id,
                isActive: true
            }
        ];

        // Clear existing coupons with these codes to avoid duplicates
        await Coupon.deleteMany({ code: { $in: coupons.map(c => c.code) } });

        await Coupon.insertMany(coupons);
        console.log("Coupons Seeded Successfully");
        process.exit();
    } catch (error) {
        console.error("Error seeding coupons:", error);
        process.exit(1);
    }
};

seedCoupons();
