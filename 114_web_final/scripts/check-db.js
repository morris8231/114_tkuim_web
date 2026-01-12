require('dotenv').config();
const mongoose = require('mongoose');
const Chapter = require('../models/Chapter');
const Task = require('../models/Task');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/photo_learning';

const checkDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('🔌 Connected to MongoDB...\n');

        // Get all chapters
        const chapters = await Chapter.find().sort({ order: 1 });
        console.log(`📚 Total Chapters: ${chapters.length}\n`);

        for (const ch of chapters) {
            const tasks = await Task.find({ chapterId: ch._id }).sort({ order: 1 });
            console.log(`Chapter ${ch.order}: "${ch.title}"`);
            console.log(`  _id: ${ch._id}`);
            console.log(`  youtubeLink: ${ch.youtubeLink || '(empty)'}`);
            console.log(`  Tasks count: ${tasks.length}`);
            if (tasks.length > 0) {
                tasks.forEach(t => {
                    console.log(`    - ${t.title}`);
                    if (t.tutorialLink) console.log(`      tutorialLink: ${t.tutorialLink}`);
                    if (t.refLink) console.log(`      refLink: ${t.refLink}`);
                });
            }
            console.log('');
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
};

checkDB();
