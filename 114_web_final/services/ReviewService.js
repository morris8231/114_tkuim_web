const SubmissionRepository = require('../repositories/SubmissionRepository');
const logger = require('../utils/logger');

class ReviewService {
    /**
     * Generate monthly review report
     * @param {string} userId - User ID
     * @param {number} year - Year
     * @param {number} month - Month (0-11)
     * @returns {Object} - Monthly report data
     */
    async generateMonthlyReport(userId, year, month) {
        try {
            // Get all submissions for this user
            const allSubmissions = await SubmissionRepository.findSubmissionsByUser(userId);

            // Filter for the specified month
            const monthlySubmissions = allSubmissions.filter(sub => {
                const date = new Date(sub.createdAt);
                return date.getFullYear() === year && date.getMonth() === month;
            });

            // Calculate statistics
            const totalPhotos = monthlySubmissions.reduce((acc, sub) => {
                return acc + (sub.photos ? sub.photos.length : 0);
            }, 0);

            const uniqueTasks = new Set(monthlySubmissions.map(sub => sub.taskId));
            const tasksCompleted = uniqueTasks.size;

            // Calculate average ratings
            let totalRatings = {
                sharpness: 0,
                exposure: 0,
                composition: 0,
                lighting: 0
            };
            let ratingCount = 0;

            monthlySubmissions.forEach(sub => {
                if (sub.ratings) {
                    totalRatings.sharpness += sub.ratings.sharpness || 0;
                    totalRatings.exposure += sub.ratings.exposure || 0;
                    totalRatings.composition += sub.ratings.composition || 0;
                    totalRatings.lighting += sub.ratings.lighting || 0;
                    ratingCount++;
                }
            });

            const averageRatings = ratingCount > 0 ? {
                sharpness: (totalRatings.sharpness / ratingCount).toFixed(1),
                exposure: (totalRatings.exposure / ratingCount).toFixed(1),
                composition: (totalRatings.composition / ratingCount).toFixed(1),
                lighting: (totalRatings.lighting / ratingCount).toFixed(1)
            } : null;

            logger.info(`Generated monthly report for user ${userId}: ${year}-${month + 1}`);

            return {
                year,
                month,
                totalPhotos,
                tasksCompleted,
                averageRatings,
                submissions: monthlySubmissions
            };
        } catch (error) {
            logger.error('ReviewService.generateMonthlyReport error:', error.message);
            throw error;
        }
    }

    /**
     * Get recent activity for a user
     * @param {string} userId - User ID
     * @param {number} limit - Number of recent activities to return
     * @returns {Array} - Recent submissions
     */
    async getRecentActivity(userId, limit = 5) {
        try {
            const submissions = await SubmissionRepository.findSubmissionsByUser(userId);
            return submissions.slice(0, limit);
        } catch (error) {
            logger.error('ReviewService.getRecentActivity error:', error.message);
            throw error;
        }
    }
}

module.exports = new ReviewService();
