const User = require('../models/User');

/**
 * Middleware to check if user's email is verified
 * Must be used AFTER auth middleware
 */
module.exports = async function (req, res, next) {
    try {
        // Ensure user is authenticated (req.user should be set by auth middleware)
        if (!req.user) {
            return res.status(401).json({ msg: '請先登入' });
        }

        // Fetch full user object from DB to check verification status
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(401).json({ msg: '用戶不存在' });
        }

        // Check if email is verified
        if (!user.isVerified) {
            return res.status(403).json({
                msg: '請先驗證您的電子郵件',
                code: 'EMAIL_NOT_VERIFIED'
            });
        }

        // Grant access
        next();
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error (Verified Only Middleware)');
    }
};
