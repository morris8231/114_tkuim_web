const Analytics = require('../models/Analytics');

// In-memory counter for batching
let viewCounter = 0;
const BATCH_SIZE = 10; // Update DB every 10 views

module.exports = async function (req, res, next) {
    // Skip tracking for API calls and static files
    if (req.path.startsWith('/api') ||
        req.path.startsWith('/uploads') ||
        req.path.includes('.')) {
        return next();
    }

    // Increment in-memory counter
    viewCounter++;

    // Batch update to database
    if (viewCounter >= BATCH_SIZE) {
        try {
            await Analytics.getAnalytics().then(analytics => {
                analytics.totalViews += viewCounter;
                analytics.lastUpdated = Date.now();
                return analytics.save();
            });
            viewCounter = 0; // Reset counter
        } catch (err) {
            console.error('Page view tracking error:', err);
            // Don't block the request if tracking fails
        }
    }

    next();
};
