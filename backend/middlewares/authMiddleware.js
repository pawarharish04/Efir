const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyJWT = async (req, res, next) => {
    console.log("Cookies received:", req.cookies); // DEBUG LOG
    try {
        let token = null;

        // 1. Check Authorization header (Most reliable for cross-origin)
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // 2. Fallback to cookie
        if (!token && req.cookies && req.cookies.access_token) {
            token = req.cookies.access_token;
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized: User no longer exists' });
        }

        next();
    } catch (error) {
        console.error('JWT Verification Error:', error.message);
        return res.status(401).json({ success: false, message: 'Unauthorized: Invalid or expired token' });
    }
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: `Role ${req.user.role} is not allowed to access this resource` });
        }
        next();
    }
}

module.exports = { verifyJWT, authorizeRoles };
