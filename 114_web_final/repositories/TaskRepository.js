const logger = require('../utils/logger');
const Task = require('../models/Task');

class TaskRepository {
    async findAllTasks() {
        try {
            const tasks = await Task.find().sort({ order: 1 });
            logger.debug('TaskRepository.findAllTasks - found', tasks.length, 'tasks from MongoDB');

            // Transform to include 'id' field for frontend compatibility
            return tasks.map(task => ({
                id: task._id.toString(),
                chapterId: task.chapterId.toString(),
                title: task.title,
                concept: task.concept,
                instructions: task.instructions,
                difficulty: task.difficulty,
                order: task.order,
                duration: 20, // default duration
                tags: task.tags || [],
                tutorialLink: task.tutorialLink || '',
                refLink: task.refLink || '',
                resources: task.resources || []
            }));
        } catch (error) {
            logger.error('TaskRepository.findAllTasks error:', error);
            throw error;
        }
    }

    async findTasksByChapter(chapterId) {
        try {
            const tasks = await Task.find({ chapterId }).sort({ order: 1 });
            logger.debug(`TaskRepository.findTasksByChapter(${chapterId}) - found ${tasks.length} tasks from MongoDB`);

            // Transform to include 'id' field for frontend compatibility
            return tasks.map(task => ({
                id: task._id.toString(),
                chapterId: task.chapterId.toString(),
                title: task.title,
                concept: task.concept,
                instructions: task.instructions,
                difficulty: task.difficulty,
                order: task.order,
                duration: 20, // default duration
                tags: task.tags || [],
                tutorialLink: task.tutorialLink || '',
                refLink: task.refLink || '',
                resources: task.resources || []
            }));
        } catch (error) {
            logger.error('TaskRepository.findTasksByChapter error:', error);
            throw error;
        }
    }

    async findTaskById(taskId) {
        try {
            const task = await Task.findById(taskId);
            if (!task) {
                logger.debug(`TaskRepository.findTaskById(${taskId}) - not found`);
                return null;
            }

            logger.debug(`TaskRepository.findTaskById(${taskId}) - found`);
            return {
                id: task._id.toString(),
                chapterId: task.chapterId.toString(),
                title: task.title,
                concept: task.concept,
                instructions: task.instructions,
                difficulty: task.difficulty,
                order: task.order,
                duration: 20,
                tags: task.tags || [],
                tutorialLink: task.tutorialLink || '',
                refLink: task.refLink || '',
                resources: task.resources || []
            };
        } catch (error) {
            logger.error('TaskRepository.findTaskById error:', error);
            throw error;
        }
    }
}

module.exports = new TaskRepository();
