const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const UserRepository = require('../repositories/UserRepository');
const EmailService = require('./EmailService');
const logger = require('../utils/logger');

class AuthService {
    async registerUser(nickname, email, password, adminSecret) {
        try {
            // Check if user already exists
            const existingUser = await UserRepository.findUserByEmail(email);
            if (existingUser) {
                throw new Error('User already exists');
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Determine Role (Admin Verification)
            let role = 'user';
            if (adminSecret && process.env.ADMIN_SECRET_KEY && adminSecret === process.env.ADMIN_SECRET_KEY) {
                role = 'admin';
                logger.warn(`Creating ADMIN user: ${email}`);
            }

            // Generate verification token
            const verificationToken = crypto.randomBytes(32).toString('hex');
            const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

            // Create user (NOT verified by default)
            const user = await UserRepository.createUser({
                nickname,
                email,
                password: hashedPassword,
                role,
                isVerified: false, // Require email verification
                verificationToken,
                verificationExpires
            });

            // Send verification email (with fallback)
            try {
                await EmailService.sendVerificationEmail(email, verificationToken, nickname);
                logger.success(`User registered (verification email sent): ${email}`);
            } catch (emailError) {
                logger.error(`Failed to send verification email: ${emailError.message}`);
                logger.warn(`VERIFICATION TOKEN FOR ${email}: ${verificationToken}`);
                logger.warn(`Verification URL: ${process.env.BASE_URL}/?verify-email&token=${verificationToken}`);
                // Don't throw - allow registration to complete
            }

            return {
                msg: '註冊成功！請檢查您的電子郵件以完成驗證。',
                email: user.email,
                requiresVerification: true
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

            // Verify password first
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                throw new Error('Invalid credentials');
            }

            // Check if email is verified
            if (!user.isVerified) {
                throw new Error('Email not verified');
            }

            // Update last login timestamp
            user.lastLogin = new Date();
            await user.save();

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

    async resendVerificationEmail(email) {
        try {
            // Find user
            const user = await UserRepository.findUserByEmail(email);
            if (!user) {
                throw new Error('User not found');
            }

            // Check if already verified
            if (user.isVerified) {
                throw new Error('Email already verified');
            }

            // Rate limiting: check if last token was created less than 5 minutes ago
            if (user.verificationExpires) {
                const tokenAge = Date.now() - (user.verificationExpires.getTime() - 24 * 60 * 60 * 1000);
                if (tokenAge < 5 * 60 * 1000) { // 5 minutes
                    throw new Error('Please wait before requesting another verification email');
                }
            }

            // Generate new verification token
            const verificationToken = crypto.randomBytes(32).toString('hex');
            const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

            // Update user
            user.verificationToken = verificationToken;
            user.verificationExpires = verificationExpires;
            await user.save();

            // Send verification email
            await EmailService.sendVerificationEmail(email, verificationToken, user.nickname);

            logger.success(`Verification email resent: ${email}`);

            return {
                msg: '驗證郵件已重新發送，請檢查您的信箱。'
            };
        } catch (error) {
            logger.error('AuthService.resendVerificationEmail error:', error.message);
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
