const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const AuthService = require('../services/AuthService');
const logger = require('../utils/logger');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
    const { nickname, email, password, adminSecret } = req.body;

    try {
        const result = await AuthService.registerUser(nickname, email, password, adminSecret);
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

// @route   POST api/auth/resend-verification
// @desc    Resend verification email
// @access  Public
router.post('/resend-verification', async (req, res) => {
    const { email } = req.body;

    try {
        const result = await AuthService.resendVerificationEmail(email);
        res.json(result);
    } catch (err) {
        logger.error('Resend verification route error:', err.message);
        if (err.message === 'User not found') {
            return res.status(404).json({ msg: 'User not found' });
        }
        if (err.message === 'Email already verified') {
            return res.status(400).json({ msg: 'Email already verified' });
        }
        if (err.message === 'Please wait before requesting another verification email') {
            return res.status(429).json({ msg: err.message });
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
        // Return JSON for frontend JavaScript
        res.json(result);
    } catch (err) {
        logger.error('Verify email error:', err.message);
        res.status(400).json({ msg: err.message });
    }
});

module.exports = router;
