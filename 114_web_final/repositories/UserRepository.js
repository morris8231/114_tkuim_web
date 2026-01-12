const User = require('../models/User');
const logger = require('../utils/logger');

class UserRepository {
    async findUserByEmail(email) {
        try {
            return await User.findOne({ email });
        } catch (error) {
            logger.error('UserRepository.findUserByEmail error:', error);
            throw error;
        }
    }

    async findUserById(id) {
        try {
            return await User.findById(id).select('-password');
        } catch (error) {
            logger.error('UserRepository.findUserById error:', error);
            throw error;
        }
    }

    async createUser(userData) {
        try {
            const user = new User(userData);
            return await user.save();
        } catch (error) {
            logger.error('UserRepository.createUser error:', error);
            throw error;
        }
    }

    async updateUserXP(userId, xp, level) {
        try {
            return await User.findByIdAndUpdate(
                userId,
                { xp, level },
                { new: true }
            ).select('-password');
        } catch (error) {
            logger.error('UserRepository.updateUserXP error:', error);
            throw error;
        }
    }

    async updateUser(userId, updateData) {
        try {
            return await User.findByIdAndUpdate(
                userId,
                updateData,
                { new: true }
            ).select('-password');
        } catch (error) {
            logger.error('UserRepository.updateUser error:', error);
            throw error;
        }
    }

    async findUserByVerificationToken(token) {
        try {
            return await User.findOne({ verificationToken: token });
        } catch (error) {
            logger.error('UserRepository.findUserByVerificationToken error:', error);
            throw error;
        }
    }
}

module.exports = new UserRepository();
