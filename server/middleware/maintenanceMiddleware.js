const Settings = require('../models/Settings');

const maintenanceMiddleware = async (req, res, next) => {
    try {
        // Skip for Admin routes, Auth routes, and static files if necessary
        // allowed paths
        if (req.path.startsWith('/api/admin') || 
            req.path.startsWith('/api/auth') || 
            req.path.startsWith('/uploads')) {
            return next();
        }

        const settings = await Settings.findOne();
        
        if (settings && settings.maintenanceMode) {
            // Check if user is admin (this might need token parsing if not already done by previous middleware)
            // Ideally maintenance middleware runs early.
            // If we want to allow admins, we need to parse token here or rely on specific admin routes being excluded above.
            // For now, simple logic: public API routes are blocked. Admin API routes are allowed.
            
            return res.status(503).json({
                success: false,
                message: "Site is currently under maintenance. Please try again later.",
                maintenance: true
            });
        }

        next();
    } catch (error) {
        console.error("Maintenance Check Error:", error);
        next(); // Fail open to avoid blocking site on DB error, or fail closed? Fail open usually better for UX unless critical.
    }
};

module.exports = maintenanceMiddleware;
