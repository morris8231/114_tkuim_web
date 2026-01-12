require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
    console.log('Testing email configuration...');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***configured***' : 'NOT SET');

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || 'PhotoMission <noreply@photomission.com>',
            to: 'photomorris1004@gmail.com',
            subject: '[TEST] PhotoMission Email Test',
            html: '<h2>測試郵件</h2><p>如果您收到這封郵件，表示郵件系統運作正常！</p>'
        });

        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('❌ Email sending failed:');
        console.error('Error:', error.message);
        console.error('Full error:', error);
    }

    process.exit(0);
}

testEmail();
