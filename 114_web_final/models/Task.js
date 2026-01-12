const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', required: true },
    title: { type: String, required: true },
    concept: String,
    instructions: String,
    constraints: [String],
    difficulty: { type: Number, min: 1, max: 5 },
    duration: Number, // in minutes
    tags: [String],
    order: { type: Number, required: true },
    tutorialLink: { type: String, default: '' },
    refLink: { type: String, default: '' },
    resources: [{
        type: { type: String, enum: ['video', 'article'] },
        title: String,
        link: String,
        summary: String
    }]
});

module.exports = mongoose.model('Task', TaskSchema);
