const User = require("../models/User");
const Product = require("../models/Products");
const Order = require("../models/Order");
const transporter = require("../config/nodemailer");

/* APPLY FOR VENDOR */
const vendorApply = async (req, res) => {
	try {
		const userId = req.user.id;
		const { shopName, gstNumber, address } = req.body;

		if (!shopName || !gstNumber || !address) {
			return res.json({ success: false, message: "All fields are required" });
		}

		const user = await User.findById(userId);
		if (!user) {
			return res.json({ success: false, message: "User not found" });
		}

		if (user.role !== "user") {
			return res.json({
				success: false,
				message: "Only users can apply for vendor role",
			});
		}

		if (user.vendorRequestStatus === "pending") {
			return res.json({
				success: false,
				message: "Vendor request already pending",
			});
		}

		user.vendorDetails = { shopName, gstNumber, address };
		user.vendorRequestStatus = "pending";
		await user.save();

		await transporter.sendMail({
			from: process.env.SENDER_EMAIL,
			to: user.email,
			subject: "Vendor Request Submitted 📝",
			text: `Hello ${user.name} 👋,

Thank you for your interest in becoming a vendor at **FrozenDelights 🍦**!

We’ve successfully received your vendor request and it is currently **under review**.

📌 **Request Status:** Pending Approval  
Our admin team is carefully reviewing your details. Once the verification is complete, you’ll be notified via email.

If everything goes well, you’ll soon be able to start adding products and managing orders on FrozenDelights 🚀

Thank you for your patience and trust.

Warm regards,  
**FrozenDelights Team 🍨**`,
		});

		res.json({
			success: true,
			message: "Vendor request submitted for approval",
		});
	} catch (error) {
		res.json({ success: false, message: error.message });
	}
};

/* GET VENDOR STATUS */
const getVendorStatus = async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select(
			"vendorRequestStatus role vendorDetails",
		);

		if (!user) {
			return res.json({ success: false, message: "User not found" });
		}

		res.json({
			success: true,
			status: user.vendorRequestStatus,
			role: user.role,
			vendorDetails: user.vendorDetails,
		});
	} catch (error) {
		res.json({ success: false, message: error.message });
	}
};

/* GET VENDOR ORDERS */
const getVendorOrders = async (req, res) => {
	try {
		const vendorId = req.user.id;

		// 1. Find all products belonging to this vendor
		const vendorProducts = await Product.find({ vendor: vendorId }).select('_id');
		const vendorProductIds = vendorProducts.map(p => p._id);
        
        console.log("Vendor Orders Debug - VendorID:", vendorId);
        console.log("Vendor Orders Debug - Product IDs:", vendorProductIds);

		// 2. Find orders that contain ANY of these products
        console.log("Searching for orders with products in:", vendorProductIds);
		const orders = await Order.find({
			"items.product": { $in: vendorProductIds }
		})
        .populate("user", "name email")
        .populate("items.product", "name price image vendor")
        .sort({ createdAt: -1 });

        console.log("Vendor Orders Debug - Orders Found:", orders.length);
        if (orders.length > 0) {
             console.log("Sample Order Items:", JSON.stringify(orders[0].items, null, 2));
        }

        // 3. Format orders for the vendor
        const formattedOrders = orders.map(order => {
             // Filter items that belong to this vendor
             const myItems = order.items.filter(item => 
                 item.product && item.product.vendor && item.product.vendor.toString() === vendorId
             );

             return {
                 _id: order._id,
                 _id: order._id,
                 user: order.user,
                 userInfo: order.userInfo,
                 items: myItems,
                 totalAmount: order.totalAmount, 
                 vendorTotal: myItems.reduce((acc, item) => acc + (item.price * item.quantity), 0),
                 subTotal: order.subTotal,
                 taxAmount: order.taxAmount,
                 discountAmount: order.discountAmount,
                 couponCode: order.couponCode,
                 status: order.deliveryStatus,
                 paymentStatus: order.paymentStatus,
                 paymentMethod: order.paymentMethod,
                 paymentId: order.paymentId,
                 createdAt: order.createdAt,
                 shippingAddress: order.shippingAddress
             };
        });

		res.json({
			success: true,
			orders: formattedOrders,
		});
	} catch (error) {
		console.error("Get Vendor Orders Error:", error);
		res.json({ success: false, message: error.message });
	}
};


const getVendorStats = async (req, res) => {
    try {
        const vendorId = req.user.id;

        // 1. Get all products of vendor
        const vendorProducts = await Product.find({ vendor: vendorId }).select('_id');
        const vendorProductIds = vendorProducts.map(p => p._id);
        
        // 2. Get Orders containing these products
        // We find orders that have ANY item with a product ID from this vendor
        const orders = await Order.find({
            "items.product": { $in: vendorProductIds }
        }).populate("items.product");
        
        // 3. Calculate Stats
        let totalRevenue = 0;
        const totalOrders = orders.length;

        orders.forEach(order => {
            order.items.forEach(item => {
                // Safety check: item.product might be null if product was deleted
                if (item.product && item.product.vendor && item.product.vendor.toString() === vendorId) {
                    totalRevenue += item.price * item.quantity;
                }
            });
        });

        const totalProducts = await Product.countDocuments({ vendor: vendorId });

        // 4. Get recent 5 orders
        const recentOrdersRaw = await Order.find({
            "items.product": { $in: vendorProductIds }
        })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "name email")
        .populate("items.product", "name price image vendor");

        const recentOrders = recentOrdersRaw.map(order => {
             // Filter items that belong to this vendor
             const myItems = order.items.filter(item => 
                 item.product && item.product.vendor && item.product.vendor.toString() === vendorId
             );
             
             // Calculate total for only this vendor's items
             const vendorOrderTotal = myItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

             return {
                 _id: order._id,
                 user: order.user,
                 items: myItems,
                 totalAmount: vendorOrderTotal, // Show vendor specific total
                 subTotal: order.subTotal,
                 taxAmount: order.taxAmount,
                 discountAmount: order.discountAmount,
                 couponCode: order.couponCode,
                 status: order.deliveryStatus,
                 createdAt: order.createdAt
             };
        });


        res.json({
            success: true,
            stats: {
                totalRevenue,
                totalOrders,
                totalProducts
            },
            recentOrders
        });

    } catch (error) {
        console.error("Vendor Stats Error:", error);
        res.json({ success: false, message: error.message });
    }
};

/* UPDATE ORDER STATUS */
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        const vendorId = req.user.id;

        const order = await Order.findById(orderId).populate('items.product');

        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }

        // Check if vendor has access to this order (owns at least one product in it)
        const hasAccess = order.items.some(item => 
            item.product && item.product.vendor && item.product.vendor.toString() === vendorId
        );

        if (!hasAccess) {
            return res.json({ success: false, message: "You are not authorized to update this order" });
        }

        // Update status
        order.deliveryStatus = status;
        await order.save();

        res.json({ success: true, message: "Order status updated", status: order.deliveryStatus });

    } catch (error) {
        console.error("Update Order Status Error:", error);
        res.json({ success: false, message: error.message });
    }
};


/* UPDATE PAYMENT STATUS (COD ONLY) */
const updatePaymentStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        const vendorId = req.user.id;

        if (status !== 'paid') {
            return res.json({ success: false, message: "Invalid status. Only 'paid' is allowed." });
        }

        const order = await Order.findById(orderId).populate('items.product');

        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }

        // Check if vendor has access to this order (owns at least one product in it)
        const hasAccess = order.items.some(item => 
            item.product && item.product.vendor && item.product.vendor.toString() === vendorId
        );

        if (!hasAccess) {
            return res.json({ success: false, message: "You are not authorized to update this order" });
        }

        if (order.paymentMethod !== 'cod') {
            return res.json({ success: false, message: "Only COD orders can be updated manually" });
        }

        order.paymentStatus = status;
        await order.save();

        res.json({ success: true, message: "Payment status updated to Paid", paymentStatus: order.paymentStatus });

    } catch (error) {
        console.error("Update Payment Status Error:", error);
        res.json({ success: false, message: error.message });
    }
};

/* GET VENDOR PROFILE SETTINGS */
const getVendorProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('vendorDetails name email');
        if (!user) return res.json({ success: false, message: "User not found" });
        
        res.json({ success: true, vendorDetails: user.vendorDetails });
    } catch (error) {
        console.error("Get Vendor Profile Error:", error);
        res.json({ success: false, message: error.message });
    }
};

/* UPDATE VENDOR PROFILE SETTINGS */
const updateVendorProfile = async (req, res) => {
    try {
        const { shopName, address, description, openingTime, closingTime, isOpen } = req.body;
        const user = await User.findById(req.user.id);
        
        if (!user) return res.json({ success: false, message: "User not found" });

        // Update fields
        if (shopName) user.vendorDetails.shopName = shopName;
        if (address) user.vendorDetails.address = address;
        if (description !== undefined) user.vendorDetails.description = description;
        if (openingTime) user.vendorDetails.openingTime = openingTime;
        if (closingTime) user.vendorDetails.closingTime = closingTime;
        if (isOpen !== undefined) user.vendorDetails.isOpen = isOpen;

        await user.save();

        res.json({ success: true, message: "Shop settings updated successfully", vendorDetails: user.vendorDetails });

    } catch (error) {
        console.error("Update Vendor Profile Error:", error);
        res.json({ success: false, message: error.message });
    }
};

module.exports = {
	vendorApply,
	getVendorStatus,
    getVendorOrders,
    getVendorStats,
    updateOrderStatus,
    updatePaymentStatus,
    getVendorProfile,
    updateVendorProfile
};
