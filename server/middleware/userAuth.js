const jwt = require("jsonwebtoken");

const userAuth = (req, res, next) => {
  try {
    // 1️⃣ Get token from cookies OR headers
    console.log("Cookies received in userAuth:", req.cookies);
    let token = req.cookies?.userToken || req.cookies?.adminToken || req.cookies?.vendorToken || req.cookies?.token;
    
    // Check header if cookie missing (or prioritize header if sent explicitly?)
    // Usually header is more specific for the current request context
    if (req.headers.token) {
        token = req.headers.token;
    }

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }
    
    // For AuthContext's fetchData which sends token in custom header 'token'
    if (req.headers.token) {
        token = req.headers.token;
    }

    // 2️⃣ No token → not logged in
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please login again",
      });
    }

    // 3️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4️⃣ Validate decoded payload
    if (!decoded?.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    // 5️⃣ Attach user info to request
    req.user = {
      id: decoded.id,
    };

    // 6️⃣ Allow request to continue
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token expired or invalid",
    });
  }
};

module.exports = userAuth;
