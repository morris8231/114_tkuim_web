const mongoose = require('mongoose');

class Database {
    constructor() {
        this._connect();
    }

    _connect() {
        if (this.db) {
            return;
        }

        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/photo_learning';

        mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
            .then(() => {
                console.log('✅ MongoDB Connected (Singleton)');
                this.db = mongoose.connection;
            })
            .catch(err => {
                console.error('❌ MongoDB Connection Error:', err);
                process.exit(1);
            });

        // Handle connection events
        mongoose.connection.on('disconnected', () => {
            console.log('⚠️  MongoDB Disconnected');
        });

        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB Error:', err);
        });
    }

    getConnection() {
        return mongoose.connection;
    }
}

// Export singleton instance
module.exports = new Database();
