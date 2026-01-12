require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
    console.log('🔍 Diagnostics for Email Configuration...');

    // Read raw values
    const rawUser = process.env.EMAIL_USER;
    const rawPass = process.env.EMAIL_PASS;

    if (!rawUser || !rawPass) {
        console.error('❌ Missing EMAIL_USER or EMAIL_PASS in .env');
        return;
    }

    // Trim values
    const user = rawUser.trim();
    const pass = rawPass.trim();

    console.log(`📧 User: '${user}' (Length: ${user.length})`);
    console.log(`🔑 Pass: '${pass.substring(0, 3)}...${pass.substring(pass.length - 3)}' (Total Length: ${pass.length})`);

    if (user !== rawUser) console.warn('⚠️ Warning: EMAIL_USER had leading/trailing spaces (Auto-trimmed)');
    if (pass !== rawPass) console.warn('⚠️ Warning: EMAIL_PASS had leading/trailing spaces (Auto-trimmed)');

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: user,
            pass: pass
        }
    });

    try {
        console.log('📡 Connecting to smtp.gmail.com...');
        await transporter.verify();
        console.log('✅ Connection SUCCESS! Your credentials are working.');
        console.log('🚀 You can now restart your server with: npm run dev');
    } catch (error) {
        console.error('❌ Connection FAILED!');
        console.error(`Error: ${error.message}`);

        if (error.code === 'EAUTH') {
            console.log('\n==========================================');
            console.log('🛑 AUTHENTICATION FAILED');
            console.log('==========================================');
            console.log('Common reasons:');
            console.log('1. The Email Address is incorrect.');
            console.log('   (Double check spelling: photomorris1004@gmail.com)');
            console.log('2. The App Password is for a DIFFERENT Google Account.');
            console.log('   (You must be logged into photomorris1004@gmail.com when generating the password)');
            console.log('3. You revoked the App Password.');
            console.log('\nSuggested Fix:');
            console.log('1. Go to https://myaccount.google.com/apppasswords');
            console.log('2. Delete the old password.');
            console.log('3. Generate a NEW one.');
            console.log('4. Copy it, paste it into .env, and try again.');
        }
    }
}

testEmail();
