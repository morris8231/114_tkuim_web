const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: false },
    photos: [String], // Array of file paths
    subject: { type: String, enum: ['portrait', 'landscape', 'still', 'street', 'other'] },
    ratings: {
        sharpness: Number,
        exposure: Number,
        composition: Number,
        lighting: Number
    },
    reflection: String,
    likes: { type: Number, default: 0 },
    isPublic: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Submission', SubmissionSchema);
