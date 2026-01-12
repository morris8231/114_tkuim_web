const mongoose = require('mongoose');
const User = require('./models/User');
const Submission = require('./models/Submission');
const Task = require('./models/Task');
const Chapter = require('./models/Chapter');
require('dotenv').config();

const checkProgress = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const email = 'test@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`User ${email} not found.`);
            process.exit(1);
        }

        console.log(`User Found: ${user.nickname} (${user._id})`);

        const submissions = await Submission.find({ userId: user._id });
        console.log(`Found ${submissions.length} submissions.`);

        const completedTaskIds = submissions
            .filter(s => s.taskId) // Filter out personal works (null taskId)
            .map(s => s.taskId);

        console.log('Completed Task IDs:', completedTaskIds);

        // Find tasks details
        const tasks = await Task.find({ id: { $in: completedTaskIds } });

        const chapterProgress = {};

        tasks.forEach(t => {
            if (!chapterProgress[t.chapterId]) {
                chapterProgress[t.chapterId] = [];
            }
            chapterProgress[t.chapterId].push(t.title);
        });

        console.log('\n--- Completed Chapters ---');
        for (const [chId, taskTitles] of Object.entries(chapterProgress)) {
            const ch = await Chapter.findOne({ id: chId });
            console.log(`Chapter ${chId} (${ch ? ch.title : 'Unknown'}):`);
            taskTitles.forEach(title => console.log(`  - ${title}`));
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

checkProgress();
