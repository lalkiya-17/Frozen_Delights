const User = require('../models/User');

const getUserData = async (req, res) => {
  try {
    const userId  = req.user.id;

    const user = await User.findById(userId).select("name email phone isAccountVerified role addresses");

    if (!user) {
      return res.json({ success: false, message: "User Not Found" });
    }

    res.json({
      success: true,
      userData: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isAccountVerified: user.isAccountVerified,
        addresses: user.addresses || []
      },
    });


  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone } = req.body;

    if (!name) {
      return res.json({ success: false, message: "Name is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    user.name = name;
    if (phone) user.phone = phone;
    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      userData: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isAccountVerified: user.isAccountVerified,
        addresses: user.addresses || []
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const applyForVendor = async (req, res) => {
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

    if (user.vendorRequestStatus === "pending") {
      return res.json({ success: false, message: "Request already pending" });
    }

    if (user.vendorRequestStatus === "approved") {
      return res.json({ success: false, message: "You are already a vendor" });
    }

    // Check for Auto-Approve Setting
    const Settings = require('../models/Settings');
    const settings = await Settings.findOne();
    const autoApprove = settings?.autoApproveVendors || false;

    if (autoApprove) {
        user.vendorRequestStatus = "approved";
        user.role = "vendor";
        
        // Generate Magic Link (reusing logic should be cleaner, but inlining for now to ensure it works properly in this scope)
        const magicToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
        user.magicLoginToken = magicToken;
        user.magicLoginExpiresAt = Date.now() + 100 * 365 * 24 * 60 * 60 * 1000;

        // Vendor Details
        user.vendorDetails = {
            shopName,
            gstNumber,
            address,
        };
        
        // Handle file uploads
        const files = req.files || {};
        user.vendorDocuments = {
            idProof: files['idProof'] ? `/uploads/${files['idProof'][0].filename}` : "",
            gstCertificate: files['gstCertificate'] ? `/uploads/${files['gstCertificate'][0].filename}` : "",
            shopLicense: files['shopLicense'] ? `/uploads/${files['shopLicense'][0].filename}` : ""
        };

        await user.save();

        // Send Approval Email
        const transporter = require("../config/nodemailer");
        const magicLink = `http://localhost:5173/vendor/magic-login?token=${magicToken}`;

        try {
             await transporter.sendMail({
                from: process.env.SENDER_EMAIL,
                to: user.email,
                subject: "🎉 Vendor Request Auto-Approved | FrozenDelights",
                html: `
                  <div style="font-family: Arial, Helvetica, sans-serif; background-color: #f4f7fb; padding: 30px;">
                    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 6px 18px rgba(0,0,0,0.08);">
                      <div style="text-align: center;">
                        <h1 style="color: #2a9d8f; margin-bottom: 10px;">🎉 Congratulations!</h1>
                        <p style="font-size: 16px; color: #555;">Your Vendor Request Has Been Auto-Approved</p>
                      </div>
                      <p style="font-size: 16px; color: #333;">Hello <strong>${user.name}</strong>,</p>
                      <p style="font-size: 15px; color: #555;">Welcome to <strong>FrozenDelights</strong>! Your account is now active.</p>
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${magicLink}" style="background: #2a9d8f; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 15px;">Access Vendor Dashboard</a>
                      </div>
                    </div>
                  </div>
                `,
            });
        } catch (mailError) {
            console.error("Auto-approval mail failed:", mailError);
        }

        return res.json({
            success: true,
            message: "Vendor request submitted and auto-approved!",
            autoApproved: true
        });

    } else {
        // Normal Pending Process
        user.vendorRequestStatus = "pending";
        user.vendorDetails = {
            shopName,
            gstNumber,
            address,
        };
        
        // Handle file uploads
        const files = req.files || {};
        user.vendorDocuments = {
            idProof: files['idProof'] ? `/uploads/${files['idProof'][0].filename}` : "",
            gstCertificate: files['gstCertificate'] ? `/uploads/${files['gstCertificate'][0].filename}` : "",
            shopLicense: files['shopLicense'] ? `/uploads/${files['shopLicense'][0].filename}` : ""
        };

        await user.save();

        res.json({
            success: true,
            message: "Vendor request submitted successfully",
        });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


const addAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { street, city, state, zipCode, mobile } = req.body;

        if (!street || !city || !state || !zipCode || !mobile) {
            return res.json({ success: false, message: "All fields are required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Ensure addresses array exists
        if (!user.addresses) {
            user.addresses = [];
        }

        const newAddress = { street, city, state, zipCode, mobile };
        
        user.addresses.push(newAddress);
        
        // Critical: Mark as modified to help Mongoose detection
        user.markModified('addresses'); 

        try {
            await user.save();
        } catch (saveError) {
            return res.json({ success: false, message: "Database Save Failed: " + saveError.message });
        }
        
        res.json({ success: true, message: "Address added successfully", addresses: user.addresses });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

const verifyCoupon = async (req, res) => {
    try {
        const { code, cartTotal, vendorId, cartItems } = req.body; // Expect cartItems from frontend
        const Coupon = require('../models/Coupon');

        const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

        if (!coupon) {
            return res.json({ success: false, message: "Invalid coupon code" });
        }

        if (coupon.expiryDate < new Date()) {
            return res.json({ success: false, message: "Coupon has expired" });
        }

        if (cartTotal < coupon.minOrderValue) {
            return res.json({ success: false, message: `Minimum order value of ₹${coupon.minOrderValue} required` });
        }

        // Vendor Validation
        // If the coupon is specific to a vendor, ensure at least one item from that vendor is in cart 
        // OR enforce that the coupon only applies if the *cart context* matches.
        // For now, let's keep the existing check but be flexible if needed.
        if (vendorId && coupon.vendor.toString() !== vendorId) {
             // For product specific coupons, identifying "vendorId" of the cart might be tricky if mixed.
             // But assuming single-vendor carts or primary vendor check:
             return res.json({ success: false, message: "This coupon is not valid for this vendor's products" });
        }

        let discountAmount = 0;

        // Check for Product Specific Coupon
        if (coupon.product) {
            if (!cartItems || cartItems.length === 0) {
                 return res.json({ success: false, message: "Cart is empty" });
            }

            const targetItem = cartItems.find(item => 
                (item.id === coupon.product.toString() || item._id === coupon.product.toString())
            );

            if (!targetItem) {
                return res.json({ success: false, message: "This coupon is only valid for specific products not in your cart." });
            }

            // Calculate discount only on the target item(s)
            const itemTotal = targetItem.price * targetItem.quantity;
            
            if (coupon.discountType === 'percentage') {
                discountAmount = (itemTotal * coupon.discountValue) / 100;
            } else {
                discountAmount = coupon.discountValue * targetItem.quantity; // Fixed off per item? Or total? usually total fixed off. Let's assume fixed off total for now or capped.
                // Actually, if it's fixed amount off on a product, is it per unit? 
                // Let's assume discountValue is total discount allowed.
                // But for percentage it scales.
                discountAmount = Math.min(coupon.discountValue, itemTotal); 
            }
        
        } else {
            // General Cart Coupon
            if (coupon.discountType === 'percentage') {
                discountAmount = (cartTotal * coupon.discountValue) / 100;
            } else {
                discountAmount = coupon.discountValue;
            }
        }

        discountAmount = Math.min(discountAmount, cartTotal);

        res.json({
            success: true,
            coupon: {
                code: coupon.code,
                discountAmount: discountAmount,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                product: coupon.product 
            },
            message: "Coupon applied successfully"
        });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

const removeAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { addressId } = req.params;

        const user = await User.findById(userId);
        if (!user) return res.json({ success: false, message: "User not found" });

        user.addresses = user.addresses.filter(addr => addr._id.toString() !== addressId);
        await user.save();

        res.json({ success: true, message: "Address removed successfully", addresses: user.addresses });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

module.exports = { getUserData, updateUserProfile, applyForVendor, addAddress, removeAddress, verifyCoupon };
