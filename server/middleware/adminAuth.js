const jwt = require("jsonwebtoken");
const User = require("../models/User");

const adminAuth = async (req, res, next) => {
  try {
    // 1️⃣ Get token from cookies (adminToken)
    // 1️⃣ Get token from cookies (adminToken) or headers
    let token = req.cookies?.adminToken || req.cookies?.token;

    if (req.headers.token) {
        token = req.headers.token;
    }
    
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Admin login required.",
      });
    }

    // 2️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id) {
        return res.status(401).json({ success: false, message: "Invalid token" });
    }

    // 3️⃣ Fetch User
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access only",
      });
    }

    // 4️⃣ Attach user
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = adminAuth;
