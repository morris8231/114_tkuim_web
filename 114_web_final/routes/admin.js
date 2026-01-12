const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Analytics = require('../models/Analytics');
const User = require('../models/User');

// @route   GET /api/admin/analytics
// @desc    Get analytics data (admin only)
// @access  Private (Admin)
router.get('/analytics', [auth, admin], async (req, res) => {
    try {
        // Get page views
        const analytics = await Analytics.getAnalytics();

        // Get user statistics
        const totalUsers = await User.countDocuments();
        const verifiedUsers = await User.countDocuments({ isVerified: true });

        // Active users = verified users who logged in within last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const activeUsers = await User.countDocuments({
            isVerified: true,
            lastLogin: { $gte: thirtyDaysAgo }
        });

        res.json({
            pageViews: analytics.totalViews,
            activeUsers,
            totalUsers,
            verifiedUsers,
            lastUpdated: analytics.lastUpdated
        });
    } catch (err) {
        console.error('Admin analytics error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   POST /api/analytics/click
// @desc    Track click events (public)
// @access  Public
router.post('/click', async (req, res) => {
    try {
        const analytics = await Analytics.getAnalytics();
        analytics.totalViews += 1;
        analytics.lastUpdated = Date.now();
        await analytics.save();
        res.status(200).end();
    } catch (err) {
        // Silently fail - don't block user experience
        res.status(200).end();
    }
});

module.exports = router;
