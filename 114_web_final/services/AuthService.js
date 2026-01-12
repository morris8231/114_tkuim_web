const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const UserRepository = require('../repositories/UserRepository');
const EmailService = require('./EmailService');
const logger = require('../utils/logger');

class AuthService {
    async registerUser(nickname, email, password) {
        try {
            // Check if user already exists
            const existingUser = await UserRepository.findUserByEmail(email);
            if (existingUser) {
                throw new Error('User already exists');
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create user (verified by default)
            const user = await UserRepository.createUser({
                nickname,
                email,
                password: hashedPassword,
                isVerified: true, // Auto-verify
                // verificationToken, // No longer needed
                // verificationExpires // No longer needed
            });

            logger.success(`User registered (auto-verified): ${email}`);

            return {
                msg: '註冊成功！',
                email: user.email
            };
        } catch (error) {
            logger.error('AuthService.registerUser error:', error.message);
            throw error;
        }
    }

    async loginUser(email, password) {
        try {
            // Find user
            const user = await UserRepository.findUserByEmail(email);
            if (!user) {
                throw new Error('Invalid credentials');
            }

            // Check if email is verified (Disabled)
            // if (!user.isVerified) {
            //     throw new Error('Email not verified');
            // }

            // Verify password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                throw new Error('Invalid credentials');
            }

            // Generate JWT token
            const token = this.generateToken(user._id);

            logger.success(`User logged in: ${email}`);

            return {
                token,
                user: {
                    id: user._id,
                    nickname: user.nickname,
                    level: user.level,
                    xp: user.xp
                }
            };
        } catch (error) {
            logger.error('AuthService.loginUser error:', error.message);
            throw error;
        }
    }

    async getUserProfile(userId) {
        try {
            const user = await UserRepository.findUserById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (error) {
            logger.error('AuthService.getUserProfile error:', error.message);
            throw error;
        }
    }

    async verifyEmail(token) {
        try {
            // Find user by verification token
            const user = await UserRepository.findUserByVerificationToken(token);

            if (!user) {
                throw new Error('Invalid or expired verification token');
            }

            // Check if token expired
            if (user.verificationExpires < new Date()) {
                throw new Error('Verification token has expired');
            }

            // Update user as verified
            user.isVerified = true;
            user.verificationToken = undefined;
            user.verificationExpires = undefined;
            await user.save();

            logger.success(`Email verified: ${user.email}`);

            return {
                msg: '電子郵件驗證成功！您現在可以登入了。',
                email: user.email
            };
        } catch (error) {
            logger.error('AuthService.verifyEmail error:', error.message);
            throw error;
        }
    }

    generateToken(userId) {
        const payload = {
            user: {
                id: userId
            }
        };

        return jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret',
            { expiresIn: 36000 } // 10 hours
        );
    }

    verifyToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET || 'secret');
        } catch (error) {
            logger.error('AuthService.verifyToken error:', error.message);
            throw new Error('Invalid token');
        }
    }
}

module.exports = new AuthService();
