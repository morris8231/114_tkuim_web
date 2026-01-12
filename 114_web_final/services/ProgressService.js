const UserRepository = require('../repositories/UserRepository');
const logger = require('../utils/logger');

class ProgressService {
    /**
     * Award XP to user and handle level-up logic
     * @param {string} userId - User ID
     * @param {number} xpAmount - Amount of XP to award
     * @returns {Object} - Updated user with level info
     */
    async awardXP(userId, xpAmount) {
        try {
            // Get current user
            const user = await UserRepository.findUserById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Calculate new XP
            const newXP = (user.xp || 0) + xpAmount;

            // Calculate new level (Simple: Level = 1 + floor(XP / 500))
            const newLevel = 1 + Math.floor(newXP / 500);
            const leveledUp = newLevel > user.level;

            // Update user
            const updatedUser = await UserRepository.updateUserXP(userId, newXP, newLevel);

            if (leveledUp) {
                logger.success(`🎉 User ${userId} leveled up! ${user.level} -> ${newLevel}`);
            }

            return {
                user: updatedUser,
                xpEarned: xpAmount,
                leveledUp,
                currentLevel: newLevel
            };
        } catch (error) {
            logger.error('ProgressService.awardXP error:', error.message);
            throw error;
        }
    }

    /**
     * Check if user should unlock a new chapter based on completed tasks
     * @param {string} userId - User ID
     * @returns {Object} - Chapter unlock status
     */
    async checkChapterUnlock(userId) {
        try {
            // TODO: Implement chapter unlock logic based on completed tasks
            // For now, all chapters are unlocked by default
            logger.debug(`ProgressService.checkChapterUnlock called for user ${userId}`);

            return {
                unlockedChapters: [1, 2, 3, 4, 5, 6, 7, 8]
            };
        } catch (error) {
            logger.error('ProgressService.checkChapterUnlock error:', error.message);
            throw error;
        }
    }

    /**
     * Calculate current level progress percentage
     * @param {number} xp - Current XP
     * @returns {Object} - Progress info
     */
    calculateLevelProgress(xp) {
        const currentLevelXP = xp % 500;
        const progress = (currentLevelXP / 500) * 100;
        const xpToNextLevel = 500 - currentLevelXP;

        return {
            currentLevelXP,
            progress,
            xpToNextLevel
        };
    }
}

module.exports = new ProgressService();
