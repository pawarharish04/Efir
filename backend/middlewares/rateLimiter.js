// In-memory sliding window rate limiter
const rateLimit = (options = {}) => {
    const windowMs = options.windowMs || 15 * 60 * 1000; // default 15 minutes
    const max = options.max || 10; // default max requests per window
    const message = options.message || { success: false, message: 'Too many requests, please try again later.' };
    const hits = new Map();

    // Periodically clean up expired entries every 5 minutes
    const interval = setInterval(() => {
        const now = Date.now();
        for (const [ip, data] of hits.entries()) {
            if (now - data.startTime > windowMs) {
                hits.delete(ip);
            }
        }
    }, 5 * 60 * 1000);

    if (interval.unref) {
        interval.unref();
    }

    return (req, res, next) => {
        const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
        const now = Date.now();

        let client = hits.get(ip);
        if (!client || (now - client.startTime > windowMs)) {
            client = { count: 1, startTime: now };
            hits.set(ip, client);
            return next();
        }

        client.count += 1;
        if (client.count > max) {
            return res.status(429).json(message);
        }

        next();
    };
};

module.exports = rateLimit;
