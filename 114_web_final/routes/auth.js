const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const AuthService = require('../services/AuthService');
const logger = require('../utils/logger');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
    const { nickname, email, password } = req.body;

    try {
        const result = await AuthService.registerUser(nickname, email, password);
        res.json(result);
    } catch (err) {
        logger.error('Register route error:', err.message);
        if (err.message === 'User already exists') {
            return res.status(400).json({ msg: err.message });
        }
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await AuthService.loginUser(email, password);
        res.json(result);
    } catch (err) {
        logger.error('Login route error:', err.message);
        if (err.message === 'Invalid credentials') {
            return res.status(400).json({ msg: err.message });
        }
        if (err.message === 'Email not verified') {
            return res.status(403).json({ msg: 'Email not verified' });
        }
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const user = await AuthService.getUserProfile(req.user.id);
        res.json(user);
    } catch (err) {
        logger.error('Get user profile error:', err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   GET api/auth/verify/:token
// @desc    Verify email address
// @access  Public
router.get('/verify/:token', async (req, res) => {
    try {
        const result = await AuthService.verifyEmail(req.params.token);

        // Redirect to frontend with success message
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>驗證成功</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                    .success { color: #4CAF50; font-size: 24px; margin-bottom: 20px; }
                    .message { font-size: 18px; margin-bottom: 30px; }
                    .btn { background: #000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; }
                </style>
            </head>
            <body>
                <div class="success">✅ ${result.msg}</div>
                <div class="message">Email: ${result.email}</div>
                <a href="/" class="btn">前往登入</a>
            </body>
            </html>
        `);
    } catch (err) {
        logger.error('Verify email error:', err.message);
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>驗證失敗</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                    .error { color: #f44336; font-size: 24px; margin-bottom: 20px; }
                    .message { font-size: 18px; margin-bottom: 30px; }
                    .btn { background: #000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; }
                </style>
            </head>
            <body>
                <div class="error">❌ 驗證失敗</div>
                <div class="message">${err.message}</div>
                <a href="/" class="btn">返回首頁</a>
            </body>
            </html>
        `);
    }
});

module.exports = router;
