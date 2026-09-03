const AuditLog = require('../models/AuditLog');

/**
 * Extracts normalized client IP address from express request
 */
const getClientIp = (req) => {
    let ip = req.headers['x-forwarded-for'] ||
             req.socket?.remoteAddress ||
             req.connection?.remoteAddress ||
             req.ip ||
             '127.0.0.1';

    if (ip && ip.includes(',')) {
        ip = ip.split(',')[0].trim();
    }
    // Normalize IPv6 localhost
    if (ip === '::1' || ip === '::ffff:127.0.0.1') {
        ip = '127.0.0.1';
    }
    return ip;
};

/**
 * Creates an immutable audit log entry in the database
 */
const recordAuditLog = async ({
    req,
    firId,
    action,
    resourceType = 'FIR_RECORD',
    resourceTarget = '',
    metadata = {}
}) => {
    try {
        if (!firId || !action) return null;

        const user = req.user || {};
        const ipAddress = getClientIp(req);
        const userAgent = req.headers['user-agent'] || 'Unknown Agent';

        const logEntry = new AuditLog({
            firId,
            action,
            resourceType,
            resourceTarget,
            metadata,
            userId: user._id || '000000000000000000000000',
            userName: user.name || 'System / Unidentified',
            userRole: user.role || 'system',
            badgeId: user.badgeId || (user.role === 'admin' ? 'ADMIN-HQ' : 'N/A'),
            ipAddress,
            userAgent,
            timestamp: new Date()
        });

        await logEntry.save();
        return logEntry;
    } catch (err) {
        console.error('CRITICAL: Failed to write immutable audit log:', err.message);
        return null;
    }
};

module.exports = {
    recordAuditLog,
    getClientIp
};