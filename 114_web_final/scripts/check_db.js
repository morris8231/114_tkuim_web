const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/photo_learning';
console.log("Connecting to:", uri);

mongoose.connect(uri)
    .then(async () => {
        console.log("Connected.");
        const admin = mongoose.connection.db.admin();
        const result = await admin.listDatabases();
        console.log("Databases List:", result.databases.map(d => d.name));

        // Check collections in current DB
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("Collections in current DB:", collections.map(c => c.name));

        // Check user count
        const userCount = await mongoose.connection.db.collection('users').countDocuments();
        console.log("User count:", userCount);

        process.exit(0);
    })
    .catch(err => {
        console.error("Connection Error:", err);
        process.exit(1);
    });
