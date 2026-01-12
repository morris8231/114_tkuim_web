const TaskRepository = require('../repositories/TaskRepository');
const ChapterRepository = require('../repositories/ChapterRepository');
const logger = require('../utils/logger');

class TaskService {
    async getAllTasks(chapterId = null) {
        try {
            if (chapterId) {
                return await TaskRepository.findTasksByChapter(chapterId);
            }
            return await TaskRepository.findAllTasks();
        } catch (error) {
            logger.error('TaskService.getAllTasks error:', error.message);
            throw error;
        }
    }

    async getTaskById(taskId) {
        try {
            const task = await TaskRepository.findTaskById(taskId);
            if (!task) {
                throw new Error('Task not found');
            }
            return task;
        } catch (error) {
            logger.error('TaskService.getTaskById error:', error.message);
            throw error;
        }
    }

    async getAllChapters() {
        try {
            return await ChapterRepository.findAllChapters();
        } catch (error) {
            logger.error('TaskService.getAllChapters error:', error.message);
            throw error;
        }
    }

    async getChapterById(chapterId) {
        try {
            const chapter = await ChapterRepository.findChapterById(chapterId);
            if (!chapter) {
                throw new Error('Chapter not found');
            }
            return chapter;
        } catch (error) {
            logger.error('TaskService.getChapterById error:', error.message);
            throw error;
        }
    }
}

module.exports = new TaskService();
