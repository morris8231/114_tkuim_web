const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: '未登入' });
  }
  try {
    // Restrict algorithms to HMAC SHA-256 to avoid accepting tokens signed with other methods
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256']
    });
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role
    };
    next();
  } catch (err) {
    // differentiate between token expiration and other verification failures
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: '登入已過期，請重新登入' });
    }
    return res.status(401).json({ message: 'Token 無效或簽名不正確' });
  }
}

function requireRole(...roles) {
  return function (req, res, next) {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: '權限不足' });
    }
    next();
  };
}

module.exports = {
  authMiddleware,
  requireRole
};
