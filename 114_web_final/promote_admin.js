const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const email = process.argv[2];

if (!email) {
    console.log('請提供 Email。用法: node promote_admin.js <email>');
    process.exit(1);
}

const promoteUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🔌 Connected to MongoDB...');

        const user = await User.findOne({ email });

        if (!user) {
            console.log(`❌ 找不到用戶: ${email}`);
            process.exit(1);
        }

        user.role = 'admin';
        await user.save();

        console.log(`✅ 用戶 ${user.nickname} (${email}) 已升級為管理員 (Admin)！`);
        console.log('權限已更新。');

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

promoteUser();
