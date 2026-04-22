const jwt = require("jsonwebtoken");
const User = require("../models/User");

const vendorAuth = async (req, res, next) => {
  try {
    // 1️⃣ Get token from cookies (vendorToken)
    // Also allow adminToken if an admin wants to access vendor routes (optional, but existing logic allowed admin)
    // But generally, vendor routes are for vendor workflow.
    let token = req.cookies?.vendorToken || req.cookies?.adminToken || req.cookies?.token;

    if (req.headers.token) {
        token = req.headers.token;
    }

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Vendor login required.",
      });
    }

    // 2️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
     if (!decoded?.id) {
        return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const user = await User.findById(decoded.id);

    // 3️⃣ User exists?
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // 4️⃣ Allow only vendor or admin
    if (user.role !== "vendor" && user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Vendor access only",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = vendorAuth;
