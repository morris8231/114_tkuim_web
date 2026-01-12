const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const verifiedOnly = require('../middleware/verifiedOnly');

// Services
const TaskService = require('../services/TaskService');
const ProgressService = require('../services/ProgressService');

// Repositories
const SubmissionRepository = require('../repositories/SubmissionRepository');

// Models (for direct operations)
const Submission = require('../models/Submission');

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
// POST: Create a new submission (Free upload or Task-based)
router.post('/submissions', [auth, verifiedOnly, upload.array('photos', 5)], async (req, res) => {
    try {
        logger.info('Received submission from user:', req.user.id);

        const filePaths = req.files.map(file => '/uploads/' + file.filename);

        // Construct submission object
        // Handle taskId: convert empty string or 'null' to null
        let tid = req.body.taskId;
        if (!tid || tid === 'null' || tid === 'undefined') {
            tid = null;
        }

        const submissionData = {
            userId: req.user.id,
            taskId: tid,
            photos: filePaths,
            subject: req.body.subject || 'other',
            reflection: req.body.reflection,
            isPublic: req.body.isPublic === 'true', // Handle boolean from form-data
            ratings: {
                sharpness: req.body.sharpness || 0,
                exposure: req.body.exposure || 0,
                composition: req.body.composition || 0,
                lighting: req.body.lighting || 0
            }
        };

        const newSubmission = await SubmissionRepository.createSubmission(submissionData);

        // Award XP only if associated with a task
        let progressResult = { xpEarned: 0, currentLevel: 0 };
        if (submissionData.taskId) {
            progressResult = await ProgressService.awardXP(req.user.id, 100);
        }

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

// ... GET endpoints ...

// PUT: Update a submission
router.put('/submissions/:id', [auth, verifiedOnly, upload.array('photos', 5)], async (req, res) => {
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
        if (req.body.reflection) updateData.reflection = req.body.reflection;
        if (req.body.subject) updateData.subject = req.body.subject;
        if (req.body.isPublic !== undefined) updateData.isPublic = req.body.isPublic === 'true'; // Handle form-data

        // Handle Photo Replacement
        if (req.files && req.files.length > 0) {
            const newFilePaths = req.files.map(file => '/uploads/' + file.filename);
            updateData.photos = newFilePaths;
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

// GET /submissions/my - Get user's submissions
router.get('/submissions/my', auth, async (req, res) => {
    try {
        const submissions = await SubmissionRepository.getSubmissionsByUser(req.user.id);
        res.json(submissions);
    } catch (err) {
        logger.error('Get my submissions error:', err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

// GET /submissions/public - Get all public submissions
router.get('/submissions/public', async (req, res) => {
    try {
        const submissions = await SubmissionRepository.getPublicSubmissions();
        res.json(submissions);
    } catch (err) {
        logger.error('Get public submissions error:', err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

// DELETE /submissions/:id - Delete a submission
router.delete('/submissions/:id', [auth, verifiedOnly], async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id);
        if (!submission) return res.status(404).json({ error: "Submission not found" });

        // Check ownership
        if (submission.userId.toString() !== req.user.id) {
            return res.status(403).json({ error: "Not authorized" });
        }

        await Submission.deleteOne({ _id: req.params.id });
        res.json({ message: "Submission deleted" });
    } catch (err) {
        logger.error('Delete submission error:', err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

// POST /submissions/:id/like - Like a submission
router.post('/submissions/:id/like', auth, async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id);
        if (!submission) return res.status(404).json({ error: "Submission not found" });

        submission.likes = (submission.likes || 0) + 1;
        await submission.save();

        res.json({ likes: submission.likes });
    } catch (err) {
        logger.error('Like submission error:', err.message);
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

// Contact Form Submission
router.post('/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ error: '所有欄位都是必填的' });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: '請提供有效的電子郵件地址' });
        }

        // Import EmailService
        const EmailService = require('../services/EmailService');

        // Prepare email content
        const emailContent = `
            <h2>新的聯絡表單訊息</h2>
            <p><strong>姓名：</strong> ${name}</p>
            <p><strong>電子郵件：</strong> ${email}</p>
            <p><strong>主旨：</strong> ${subject}</p>
            <p><strong>訊息內容：</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
            <hr>
            <p style="color: #666; font-size: 0.9em;">此郵件來自 PhotoMission 聯絡表單</p>
        `;

        // Send email to admin
        await EmailService.sendEmail(
            'photomorris1004@gmail.com',
            `[PhotoMission 聯絡表單] ${subject}`,
            emailContent
        );

        logger.info(`Contact form submitted by ${name} (${email})`);
        res.json({ msg: '訊息已成功送出！我們會盡快回覆您。' });

    } catch (err) {
        logger.error('Contact form error:', err.message);
        res.status(500).json({ error: '訊息傳送失敗，請稍後再試' });
    }
});

module.exports = router;
