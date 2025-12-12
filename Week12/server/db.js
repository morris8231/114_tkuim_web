    const { MongoClient } = require('mongodb');

    const uri = process.env.MONGODB_URI || 'mongodb://week12-user:week12-pass@localhost:27017/week12?authSource=week12';
    const client = new MongoClient(uri);
    let db = null;

    async function connectDB() {
      if (db) {
        return db;
      }
      await client.connect();
      db = client.db();
      console.log('[DB] Connected to MongoDB');
      return db;
    }

    function getDB() {
      if (!db) {
        throw new Error('Database not initialized. Call connectDB() first.');
      }
      return db;
    }

    process.on('SIGINT', async () => {
      try {
        await client.close();
        console.log('
[DB] Connection closed');
      } finally {
        process.exit(0);
      }
    });

    module.exports = { connectDB, getDB };
