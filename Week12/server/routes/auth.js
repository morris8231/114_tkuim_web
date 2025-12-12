const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { createUser, findUserByEmail } = require('../repositories/users');

const JWT_SECRET = process.env.JWT_SECRET;

// POST /auth/signup - create a new user account
router.post('/signup', async (req, res, next) => {
  try {
    const { email, password, role } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email 及密碼必填' });
    }
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'Email 已被註冊' });
    }
    const id = await createUser({ email, password, role: role || 'student' });
    res.status(201).json({ id, email, role: role || 'student' });
  } catch (err) {
    next(err);
  }
});

// POST /auth/login - authenticate and return a token
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email 及密碼必填' });
    }
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: '帳號或密碼錯誤' });
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: '帳號或密碼錯誤' });
    }
    const token = jwt.sign(
      { sub: user._id.toString(), email: user.email, role: user.role },
      JWT_SECRET,
      {
        expiresIn: '1h',
        algorithm: 'HS256'
      }
    );
    res.json({
      token,
      user: { id: user._id.toString(), email: user.email, role: user.role }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
