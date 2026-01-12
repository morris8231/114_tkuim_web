const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');

// Services
const TaskService = require('../services/TaskService');
const ProgressService = require('../services/ProgressService');

// Repositories
const SubmissionRepository = require('../repositories/SubmissionRepository');

const logger = require('../utils/logger');

// Multer Setup for Image Uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// --- API Endpoints ---

// 1. Chapters Endpoint
router.get('/chapters', async (req, res) => {
    try {
        const chapters = await TaskService.getAllChapters();
        res.json(chapters);
    } catch (error) {
        logger.error('Get chapters error:', error.message);
        res.status(500).json({ error: 'Failed to fetch chapters' });
    }
});

// 2. Tasks Endpoints
// Get All Tasks (Optional filter by chapterId)
router.get('/tasks', async (req, res) => {
    try {
        const { chapterId } = req.query;
        const tasks = await TaskService.getAllTasks(chapterId);
        res.json(tasks);
    } catch (error) {
        logger.error('Get tasks error:', error.message);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// Get Single Task
router.get('/tasks/:id', async (req, res) => {
    try {
        const task = await TaskService.getTaskById(req.params.id);
        res.json(task);
    } catch (error) {
        logger.error('Get task error:', error.message);
        if (error.message === 'Task not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to fetch task' });
    }
});

// 3. Submissions
// POST: Create a new submission
router.post('/submissions', [auth, upload.array('photos', 5)], async (req, res) => {
    try {
        logger.info('Received submission from user:', req.user.id);

        const filePaths = req.files.map(file => '/uploads/' + file.filename);

        // Construct submission object
        const submissionData = {
            userId: req.user.id,
            taskId: req.body.taskId,
            photos: filePaths,
            subject: req.body.subject || 'other',
            reflection: req.body.reflection,
            ratings: {
                sharpness: req.body.sharpness || 0,
                exposure: req.body.exposure || 0,
                composition: req.body.composition || 0,
                lighting: req.body.lighting || 0
            }
        };

        const newSubmission = await SubmissionRepository.createSubmission(submissionData);

        // Award XP using ProgressService
        const progressResult = await ProgressService.awardXP(req.user.id, 100);

        res.json({
            message: "Submission Saved Successfully",
            submission: newSubmission,
            xpEarned: progressResult.xpEarned,
            currentLevel: progressResult.currentLevel
        });

    } catch (err) {
        logger.error('Submission Error:', err.message);
        res.status(500).json({ error: "Failed to save submission", details: err.message });
    }
});

// GET: Retrieve current user's all submissions (public + private)
router.get('/submissions/my', auth, async (req, res) => {
    try {
        const submissions = await SubmissionRepository.findSubmissionsByUser(req.user.id);
        res.json(submissions);
    } catch (err) {
        logger.error('Fetch My Submissions Error:', err.message);
        res.status(500).json({ error: "Failed to fetch submissions" });
    }
});

// GET: Retrieve all public submissions (from all users)
router.get('/submissions/public', async (req, res) => {
    try {
        const submissions = await SubmissionRepository.findAllSubmissions({ isPublic: true });
        res.json(submissions);
    } catch (err) {
        logger.error('Fetch Public Submissions Error:', err.message);
        res.status(500).json({ error: "Failed to fetch public submissions" });
    }
});

// Like a Submission
router.post('/submissions/:id/like', auth, async (req, res) => {
    try {
        const submission = await SubmissionRepository.incrementLikes(req.params.id);
        if (!submission) {
            return res.status(404).json({ error: "Submission not found" });
        }
        res.json({ likes: submission.likes });
    } catch (err) {
        logger.error('Like submission error:', err.message);
        res.status(500).json({ error: "Failed to like submission" });
    }
});

// DELETE: Delete a submission
router.delete('/submissions/:id', auth, async (req, res) => {
    try {
        const submission = await SubmissionRepository.findSubmissionById(req.params.id);
        if (!submission) {
            return res.status(404).json({ error: "Submission not found" });
        }

        // Check user ownership
        if (submission.userId.toString() !== req.user.id) {
            return res.status(401).json({ error: "User not authorized" });
        }

        await SubmissionRepository.deleteSubmission(req.params.id);
        res.json({ message: "Submission removed" });
    } catch (err) {
        logger.error('Delete submission error:', err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

// PUT: Update a submission (Reflection only for now)
router.put('/submissions/:id', auth, async (req, res) => {
    try {
        const submission = await SubmissionRepository.findSubmissionById(req.params.id);
        if (!submission) {
            return res.status(404).json({ error: "Submission not found" });
        }

        // Check user ownership
        if (submission.userId.toString() !== req.user.id) {
            return res.status(401).json({ error: "User not authorized" });
        }

        // Update fields
        const updateData = {};
        if (req.body.reflection) {
            updateData.reflection = req.body.reflection;
        }

        const updatedSubmission = await SubmissionRepository.updateSubmission(
            req.params.id,
            updateData
        );

        res.json(updatedSubmission);
    } catch (err) {
        logger.error('Update submission error:', err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

// Get User Profile (Protected)
router.get('/user/profile', auth, async (req, res) => {
    try {
        const user = await require('../services/AuthService').getUserProfile(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    } catch (err) {
        logger.error("User Fetch Error", err.message);
        res.status(500).json({ error: "Failed to fetch profile" });
    }
});

// Monthly Review Endpoint
router.get('/reviews/:year/:month', auth, async (req, res) => {
    try {
        const { year, month } = req.params;
        const ReviewService = require('../services/ReviewService');

        const report = await ReviewService.generateMonthlyReport(
            req.user.id,
            parseInt(year),
            parseInt(month) - 1 // month is 0-indexed in JS Date
        );

        res.json(report);
    } catch (err) {
        logger.error('Get review error:', err.message);
        res.status(500).json({ error: "Failed to fetch review" });
    }
});

module.exports = router;
