const User = require("../models/User");
const Order = require("../models/Order");
const Settings = require("../models/Settings");
const Product = require("../models/Products");
const transporter = require("../config/nodemailer");

//GET ALL VENDOR PENDING REQUESTS

const getPendingVendors = async (req, res) => {
  try {
    const vendors = await User.find({
      vendorRequestStatus: "pending",
    }).select("name email vendorDetails vendorRequestStatus vendorDocuments");

    res.json({
      success: true,
      count: vendors.length,
      vendors,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//APPROVE VENDOR

const approveVendor = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      res.json({ success: false, message: "User not found" });
    }

    user.role = "vendor";
    user.vendorRequestStatus = "approved";

    const magicToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    user.magicLoginToken = magicToken;
    user.magicLoginExpiresAt = Date.now() + 100 * 365 * 24 * 60 * 60 * 1000; // 100 years (Permanent until revoked)

    console.log(`Generated Magic Token for ${user.email}: ${magicToken}`);
    await user.save();
    console.log("User saved with new token.");

    const magicLink = `http://localhost:5173/vendor/magic-login?token=${magicToken}`;

    try {
      await transporter.sendMail({
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: "🎉 Vendor Request Approved | FrozenDelights",
        html: `
      <div style="font-family: Arial, Helvetica, sans-serif; background-color: #f4f7fb; padding: 30px;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 6px 18px rgba(0,0,0,0.08);">

          <div style="text-align: center;">
            <h1 style="color: #2a9d8f; margin-bottom: 10px;">🎉 Congratulations!</h1>
            <p style="font-size: 16px; color: #555;">
              Your Vendor Request Has Been Approved
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />

          <p style="font-size: 16px; color: #333;">
            Hello <strong>${user.name}</strong>,
          </p>

          <p style="font-size: 15px; color: #555; line-height: 1.6;">
            We’re excited to inform you that your request to become a vendor on 
            <strong>FrozenDelights 🍦</strong> has been 
            <span style="color:#2a9d8f; font-weight:bold;">approved</span>.
          </p>

          <div style="background: #e8f7f4; border-left: 5px solid #2a9d8f; padding: 15px; margin: 20px 0; border-radius: 6px;">
            <p style="margin: 0; font-size: 15px; color: #333;">
              🚀 You can now:
            </p>
            <ul style="margin-top: 10px; padding-left: 20px; color: #444;">
              <li>Add and manage your products</li>
              <li>View and process orders</li>
              <li>Track sales and grow your business</li>
            </ul>
          </div>

          <p style="font-size: 15px; color: #555;">
            Click the button below to log in directly to your
            <strong>Vendor Dashboard</strong>. This link is valid for 24 hours.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${magicLink}" 
               style="background: #2a9d8f; color: #ffffff; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; font-size: 15px;">
              Access Vendor Dashboard
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />

          <p style="font-size: 14px; color: #777;">
            If you have any questions or need support, our team is always here to help.
          </p>

          <p style="font-size: 14px; color: #777;">
            Warm regards,<br />
            <strong>FrozenDelights Team 🍨</strong>
          </p>

        </div>
      </div>
    `,
      });
    } catch (err) {
      console.log("Approval mail failed:", err.message);
    }

    res.json({
      success: true,
      message: "Vendor approved successfully",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//VENDOR REJECT

const vendorReject = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    user.vendorRequestStatus = "rejected";
    user.vendorDetails = {};

    await user.save();

    try {
      await transporter.sendMail({
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: "Vendor Request Update ❌ | FrozenDelights",
        html: `
      <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; padding: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <h2 style="color: #e63946; text-align: center;">
            Vendor Request Rejected ❌
          </h2>

          <p style="font-size: 16px; color: #333;">
            Hello <strong>${user.name}</strong>,
          </p>

          <p style="font-size: 15px; color: #555; line-height: 1.6;">
            Thank you for your interest in becoming a vendor on 
            <strong>FrozenDelights 🍦</strong>.
          </p>

          <p style="font-size: 15px; color: #555; line-height: 1.6;">
            After carefully reviewing your application, we regret to inform you that 
            your vendor request has been <strong style="color:#e63946;">rejected</strong> at this time.
          </p>

          <div style="background:#fff3f3; border-left: 4px solid #e63946; padding: 12px; margin: 20px 0;">
            <p style="margin:0; font-size:14px; color:#444;">
              This decision may be based on incomplete information or unmet requirements.
            </p>
          </div>

          <p style="font-size: 15px; color: #555;">
            👉 You are welcome to re-apply after updating your details or documents.
          </p>

          <p style="font-size: 15px; color: #555;">
            If you have any questions, feel free to contact our support team.
          </p>

          <hr style="border:none; border-top:1px solid #eee; margin:25px 0;" />

          <p style="font-size: 14px; color: #777;">
            Regards,<br/>
            <strong>FrozenDelights Team 🍨</strong>
          </p>

        </div>
      </div>
    `,
      });
    } catch (err) {
      console.log("Rejection mail failed:", err.message);
    }

    res.json({ success: true, message: "Vendor request rejected" });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalVendors = await User.countDocuments({ role: 'vendor' });
        const totalOrders = await Order.countDocuments();
        
        // Calculate Total Revenue (sum of totalAmount of all orders)
        // Using aggregate for efficiency
        // Calculate Total Revenue (sum of totalAmount of all orders)
        const revenueData = await Order.aggregate([
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);
        const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

        // Chart Data: Monthly Revenue (Last 6 Months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const monthlyRevenue = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo }
                    // Removed paymentStatus check for dev visibility if needed, or ensure it matches
                }
            },
            {
                $group: {
                    _id: { 
                        month: { $month: "$createdAt" },
                        year: { $year: "$createdAt" }
                    },
                    total: { $sum: "$totalAmount" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // Map month numbers to names
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        // Create a map for easy lookup
        const revenueMap = {};
        monthlyRevenue.forEach(item => {
            const key = `${monthNames[item._id.month - 1]} ${item._id.year}`; // e.g., "Feb 2024"
            revenueMap[key] = item.total;
        });

        // Generate last 6 months labels ensures X-axis is correct even with 0 data
        const formattedRevenue = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthName = monthNames[d.getMonth()];
            const year = d.getFullYear();
            const key = `${monthName} ${year}`;
            
            formattedRevenue.push({
                name: monthName, // Render just month name on axis for cleaner look, or key for full date
                fullName: key,
                revenue: revenueMap[key] || 0
            });
        }

        // Chart Data: Order Status Distribution
        const orderStatusDist = await Order.aggregate([
            {
                $group: {
                    _id: "$deliveryStatus",
                    count: { $sum: 1 }
                }
            }
        ]);

        const formattedStatusDist = orderStatusDist.map(item => ({
            name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
            value: item.count
        }));

        // Fetch Recent 5 Orders
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name email');


        res.json({
            success: true,
            stats: {
                totalUsers,
                totalVendors,
                totalOrders,
                totalRevenue,
                revenueData: formattedRevenue,
                orderStatusData: formattedStatusDist,
                recentOrders
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

const bcrypt = require('bcryptjs');

// GET ALL VENDORS (APPROVED)
const getAllVendors = async (req, res) => {
    try {
        const vendors = await User.find({ role: 'vendor' }).select('-password');
        res.json({ success: true, count: vendors.length, vendors });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ADD VENDOR MANUALLY
const addVendor = async (req, res) => {
    try {
        const { name, email, password, shopName, mobile } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const magicToken = Math.random().toString(36).substring(2) + Date.now().toString(36);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: 'vendor',
            vendorRequestStatus: 'approved',
            isAccountVerified: true, 
            magicLoginToken: magicToken,
            magicLoginExpiresAt: Date.now() + 100 * 365 * 24 * 60 * 60 * 1000,
            
            vendorDetails: {
                shopName: shopName || 'My Shop',
                address: 'Added by Admin',
            },
            addresses: [{ 
                street: 'N/A',
                city: 'N/A',
                state: 'N/A',
                zipCode: '000000',
                mobile: mobile || '0000000000',
                country: 'India'
            }]
        });

        await user.save();

        res.json({ success: true, message: "Vendor added successfully"});
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// DELETE VENDOR
const deleteVendor = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        
        // Allow deleting pending too just in case
        if (user.role !== 'vendor' && user.vendorRequestStatus !== 'pending') {
            return res.json({ success: false, message: "User is not a vendor or pending vendor" });
        }

        await User.findByIdAndDelete(id);
        res.json({ success: true, message: "Vendor deleted successfully" });
    } catch (error) {
         res.json({ success: false, message: error.message });
    }
};

// GET ALL USERS
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }).select('-password');
        res.json({ success: true, count: users.length, users });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// DELETE USER
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        if (user.role !== 'user') {
            return res.json({ success: false, message: "Target is not a regular user" });
        }

        await User.findByIdAndDelete(id);
        res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
         res.json({ success: false, message: error.message });
    }
};

// GET SETTINGS
const getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings();
            await settings.save();
        }
        res.json({ success: true, settings });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// UPDATE SETTINGS
const updateSettings = async (req, res) => {
    try {
        const { siteName, maintenanceMode, emailNotifications, autoApproveVendors } = req.body;
        
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings();
        }

        // settings.siteName = siteName; // Prevent site name change
        settings.maintenanceMode = maintenanceMode;
        settings.emailNotifications = emailNotifications;
        settings.autoApproveVendors = autoApproveVendors;

        await settings.save();
        res.json({ success: true, message: "Settings updated successfully", settings });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// CREATE COUPON
const createCoupon = async (req, res) => {
    try {
        const { code, discountType, discountValue, expiryDate, minOrderValue, productId } = req.body;
        const vendorId = req.user.id; // Assuming vendor creates coupons for themselves

        const Coupon = require('../models/Coupon');

        const newCoupon = new Coupon({
            code,
            discountType,
            discountValue,
            expiryDate,
            minOrderValue,
            vendor: vendorId,
            product: productId || null
        });

        await newCoupon.save();
        res.json({ success: true, message: "Coupon created successfully", coupon: newCoupon });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// GET VENDOR COUPONS
const getVendorCoupons = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const Coupon = require('../models/Coupon');
        const coupons = await Coupon.find({ vendor: vendorId });
        res.json({ success: true, coupons });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// GET ALL ORDERS
const getAllOrders = async (req, res) => {
    try {
        console.log("Admin: Fetching All Orders...");
        const orders = await Order.find()
            .populate('user', 'name email mobile')
            .populate('items.product', 'name price image')
            .sort({ createdAt: -1 });

        console.log(`Admin: Found ${orders.length} orders`);

        res.json({ success: true, count: orders.length, orders });
    } catch (error) {
        console.error("Admin Fetch Orders Error:", error);
        res.json({ success: false, message: error.message });
    }
};

// UPDATE PAYMENT STATUS
const updatePaymentStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        if (status !== 'paid') {
            return res.json({ success: false, message: "Invalid status. Only 'paid' is allowed." });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }

        if (order.paymentMethod !== 'cod') {
            return res.json({ success: false, message: "Only COD orders can be updated manually" });
        }

        order.paymentStatus = status;
        await order.save();

        res.json({ success: true, message: "Payment status updated to Paid", paymentStatus: order.paymentStatus });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// GET ALL PRODUCTS (ADMIN)
const getAllProductsAdmin = async (req, res) => {
    try {
        const products = await Product.find()
            .populate('vendor', 'name email vendorDetails.shopName')
            .sort({ createdAt: -1 });
        res.json({ success: true, count: products.length, products });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// DELETE PRODUCT (ADMIN)
const deleteProductAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) {
            return res.json({ success: false, message: "Product not found" });
        }

        await Product.findByIdAndDelete(id);
        res.json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

module.exports = {
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
};
