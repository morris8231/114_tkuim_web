const Submission = require('../models/Submission');
const logger = require('../utils/logger');

class SubmissionRepository {
    async createSubmission(submissionData) {
        try {
            const submission = new Submission(submissionData);
            return await submission.save();
        } catch (error) {
            logger.error('SubmissionRepository.createSubmission error:', error);
            throw error;
        }
    }

    async findAllSubmissions(filters = {}) {
        try {
            return await Submission.find(filters).sort({ createdAt: -1 });
        } catch (error) {
            logger.error('SubmissionRepository.findAllSubmissions error:', error);
            throw error;
        }
    }

    async findSubmissionById(id) {
        try {
            return await Submission.findById(id);
        } catch (error) {
            logger.error('SubmissionRepository.findSubmissionById error:', error);
            throw error;
        }
    }

    async updateSubmission(id, updateData) {
        try {
            return await Submission.findByIdAndUpdate(
                id,
                updateData,
                { new: true }
            );
        } catch (error) {
            logger.error('SubmissionRepository.updateSubmission error:', error);
            throw error;
        }
    }

    async deleteSubmission(id) {
        try {
            const submission = await Submission.findById(id);
            if (!submission) {
                return null;
            }
            await submission.deleteOne();
            return submission;
        } catch (error) {
            logger.error('SubmissionRepository.deleteSubmission error:', error);
            throw error;
        }
    }

    async incrementLikes(id) {
        try {
            return await Submission.findByIdAndUpdate(
                id,
                { $inc: { likes: 1 } },
                { new: true }
            );
        } catch (error) {
            logger.error('SubmissionRepository.incrementLikes error:', error);
            throw error;
        }
    }

    async findSubmissionsByUser(userId) {
        try {
            return await Submission.find({ userId }).sort({ createdAt: -1 });
        } catch (error) {
            logger.error('SubmissionRepository.findSubmissionsByUser error:', error);
            throw error;
        }
    }
}

module.exports = new SubmissionRepository();
