const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
    totalViews: {
        type: Number,
        default: 0
    },
    lastReset: {
        type: Date,
        default: Date.now
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

// Singleton pattern - only one analytics document
AnalyticsSchema.statics.getAnalytics = async function () {
    let analytics = await this.findOne();
    if (!analytics) {
        analytics = await this.create({});
    }
    return analytics;
};

AnalyticsSchema.statics.incrementViews = async function () {
    const analytics = await this.getAnalytics();
    analytics.totalViews += 1;
    analytics.lastUpdated = Date.now();
    await analytics.save();
    return analytics.totalViews;
};

module.exports = mongoose.model('Analytics', AnalyticsSchema);
