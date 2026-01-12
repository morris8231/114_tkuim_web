require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User'); // 確保路徑正確

async function verifyUser() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected');

        const email = 'lolmorris259@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`❌ User not found: ${email}`);
            return;
        }

        console.log(`Found user: ${user.nickname} (${user.email})`);
        console.log(`Current status: isVerified = ${user.isVerified}`);

        if (user.isVerified) {
            console.log('⚠️ User is already verified.');
        } else {
            user.isVerified = true;
            user.verificationToken = undefined;
            user.verificationExpires = undefined;
            await user.save();
            console.log('✅ User successfully verified manually!');
        }

        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

verifyUser();
