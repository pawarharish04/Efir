const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyJWT = async (req, res, next) => {
    try {
        let token = req.cookies.access_token;
        // Also check Authorization header
        if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
        }

        next();
    } catch (error) {
        console.error('JWT Verification Error:', error);
        return res.status(403).json({ success: false, message: 'Forbidden: Invalid token' });
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
