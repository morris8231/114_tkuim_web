const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    /**
     * 發送驗證郵件
     * @param {string} email - 收件人 email
     * @param {string} token - 驗證 token
     * @param {string} nickname - 用戶暱稱
     */
    async sendVerificationEmail(email, token, nickname) {
        try {
            // Use hash fragment for better email client compatibility
            const verificationUrl = `${process.env.BASE_URL}/#verify-email?token=${token}`;

            const mailOptions = {
                from: process.env.EMAIL_FROM || 'PhotoMission <noreply@photomission.com>',
                to: email,
                subject: '📧 PhotoMission - 驗證您的電子郵件',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333;">歡迎加入 PhotoMission！ 🎉</h2>
                        <p>Hi <strong>${nickname}</strong>，</p>
                        <p>感謝您註冊 PhotoMission 攝影學習平台！</p>
                        <p>請點擊下方按鈕驗證您的電子郵件地址：</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${verificationUrl}" 
                               style="background-color: #000; 
                                      color: white; 
                                      padding: 12px 30px; 
                                      text-decoration: none; 
                                      border-radius: 4px;
                                      display: inline-block;">
                                驗證我的信箱
                            </a>
                        </div>
                        
                        <p style="color: #666; font-size: 14px;">
                            或複製以下連結到瀏覽器：<br>
                            <a href="${verificationUrl}">${verificationUrl}</a>
                        </p>
                        
                        <p style="color: #666; font-size: 14px;">
                            ⏰ 此連結將在 24 小時後失效。
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                        
                        <p style="color: #999; font-size: 12px;">
                            如果您沒有註冊 PhotoMission，請忽略此信件。
                        </p>
                    </div>
                `
            };

            await this.transporter.sendMail(mailOptions);
            logger.success(`Verification email sent to ${email}`);
            return true;
        } catch (error) {
            logger.error('EmailService.sendVerificationEmail error:', error);
            throw new Error('Failed to send verification email');
        }
    }

    /**
     * 發送通用郵件
     * @param {string} to - 收件人 email
     * @param {string} subject - 郵件主旨
     * @param {string} htmlContent - HTML 內容
     */
    async sendEmail(to, subject, htmlContent) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_FROM || 'PhotoMission <noreply@photomission.com>',
                to: to,
                subject: subject,
                html: htmlContent
            };

            await this.transporter.sendMail(mailOptions);
            logger.success(`Email sent to ${to}: ${subject}`);
            return true;
        } catch (error) {
            logger.error('EmailService.sendEmail error:', error);
            throw new Error('Failed to send email');
        }
    }

    /**
     * 發送密碼重設郵件（未來擴充）
     * @param {string} email - 收件人 email
     * @param {string} token - 重設 token
     */
    async sendPasswordResetEmail(email, token) {
        // TODO: 實作密碼重設功能
        logger.info('Password reset email (not implemented yet)');
    }
}

module.exports = new EmailService();
