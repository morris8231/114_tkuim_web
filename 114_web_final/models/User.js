const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    nickname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    deviceType: { type: String, enum: ['phone', 'camera'], default: 'phone' },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationExpires: { type: Date },
    createdAt: { type: Date, default: Date.now },
    lastLogin: { type: Date },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    badges: [String],
    completedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }]
});

module.exports = mongoose.model('User', UserSchema);
