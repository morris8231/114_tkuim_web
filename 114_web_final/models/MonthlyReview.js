const mongoose = require('mongoose');

const MonthlyReviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    yearMonth: { type: String, required: true }, // Format "YYYY-MM"
    taskCount: Number,
    photoCount: Number,
    newSkills: [String],
    avgRatings: {
        sharpness: Number,
        exposure: Number,
        composition: Number,
        lighting: Number
    },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Submission' }],
    summary: String,
    nextGoals: [String],
    generatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MonthlyReview', MonthlyReviewSchema);
