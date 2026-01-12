const mongoose = require('mongoose');

const ChapterSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    order: { type: Number, required: true },
    unlockRule: {
        requiredTasks: { type: Number, default: 0 }
    },
    youtubeLink: { type: String, default: '' }, // Keep for backward compatibility if needed, but preferable to use resources.videos
    resources: {
        videos: [{
            title: String,
            link: String,
            description: String
        }],
        articles: [{
            title: String,
            link: String,
            description: String
        }]
    }
});

module.exports = mongoose.model('Chapter', ChapterSchema);
