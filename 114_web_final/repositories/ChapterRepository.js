const logger = require('../utils/logger');
const Chapter = require('../models/Chapter');

class ChapterRepository {
    async findAllChapters() {
        try {
            const chapters = await Chapter.find().sort({ order: 1 });
            logger.debug('ChapterRepository.findAllChapters - found', chapters.length, 'chapters from MongoDB');

            // Transform for frontend compatibility
            return chapters.map(chapter => ({
                id: chapter._id.toString(), // MongoDB _id as string
                title: chapter.title,
                description: chapter.description,
                order: chapter.order,
                unlocked: true, // For now, all chapters unlocked
                youtubeLink: chapter.youtubeLink || ''
            }));
        } catch (error) {
            logger.error('ChapterRepository.findAllChapters error:', error);
            throw error;
        }
    }

    async findChapterById(chapterId) {
        try {
            const chapter = await Chapter.findById(chapterId);
            if (!chapter) {
                logger.debug(`ChapterRepository.findChapterById(${chapterId}) - not found`);
                return null;
            }

            logger.debug(`ChapterRepository.findChapterById(${chapterId}) - found`);
            return {
                id: chapter._id.toString(),
                title: chapter.title,
                description: chapter.description,
                order: chapter.order,
                unlocked: true,
                youtubeLink: chapter.youtubeLink || ''
            };
        } catch (error) {
            logger.error('ChapterRepository.findChapterById error:', error);
            throw error;
        }
    }
}

module.exports = new ChapterRepository();

