require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function verifyExistingUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🔌 Connected to MongoDB');

        // Find all unverified users
        const unverifiedUsers = await User.find({ isVerified: false });

        console.log(`\n📊 Found ${unverifiedUsers.length} unverified users`);

        if (unverifiedUsers.length === 0) {
            console.log('✅ All users are already verified!');
            process.exit(0);
        }

        // Mark all as verified
        const result = await User.updateMany(
            { isVerified: false },
            {
                $set: {
                    isVerified: true,
                    verificationToken: null,
                    verificationExpires: null
                }
            }
        );

        console.log(`\n✅ Successfully verified ${result.modifiedCount} users`);
        console.log('\n📝 Users verified:');
        unverifiedUsers.forEach(user => {
            console.log(`  - ${user.email} (${user.nickname})`);
        });

        console.log('\n🎉 Migration complete! All existing users are now verified.');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}

verifyExistingUsers();
