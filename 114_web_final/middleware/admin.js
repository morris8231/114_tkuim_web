const User = require('../models/User');

module.exports = async function (req, res, next) {
    try {
        // 1. Ensure user is authenticated (req.user should be set by auth middleware)
        if (!req.user) {
            return res.status(401).json({ msg: '尚未登入，無法驗證管理員身份' });
        }

        // 2. Fetch full user object from DB to check role
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(401).json({ msg: '用戶不存在' });
        }

        // 3. Check Role
        if (user.role !== 'admin') {
            return res.status(403).json({ msg: '權限不足：僅限網站管理者訪問' });
        }

        // 4. Grant Access
        next();
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error (Admin Middleware)');
    }
};
