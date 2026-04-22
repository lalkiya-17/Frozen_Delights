const express = require("express");
const router = express.Router();

const userAuth = require("../middleware/userAuth");
const vendorAuth = require("../middleware/vendorAuth");

const {
  vendorApply,
  getVendorStatus,
  getVendorOrders,
  getVendorStats,
  updateOrderStatus,
  updatePaymentStatus,
  getVendorProfile,
  updateVendorProfile
} = require("../controllers/vendorController");

// User applies for vendor
router.post("/apply", userAuth, vendorApply);

// User checks vendor status
router.get("/status", userAuth, getVendorStatus);

// Get Vendor Orders
// Get Vendor Orders
router.get("/orders", vendorAuth, getVendorOrders);

// Get Vendor Stats
router.get("/stats", vendorAuth, getVendorStats);

// Update Vendor Order Status
router.put("/order/status", vendorAuth, updateOrderStatus);

// Update Vendor Payment Status (COD only)
router.put("/order/payment-status", vendorAuth, updatePaymentStatus);

// Vendor dashboard (vendor/admin only)
router.get("/dashboard", vendorAuth, (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Vendor Dashboard",
  });
});

// Vendor Profile Settings
router.get("/profile", vendorAuth, getVendorProfile);
router.put("/profile", vendorAuth, updateVendorProfile);

module.exports = router;
