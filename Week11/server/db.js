const { MongoClient } = require('mongodb');

let db;
const client = new MongoClient(process.env.MONGODB_URI);

async function connectDB() {
  if (db) return db;
  await client.connect();
  db = client.db();
  console.log('[DB] Connected to MongoDB');
  return db;
}

function getDB() {
  if (!db) throw new Error('Database not initialized');
  return db;
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await client.close();
  console.log('[DB] Connection closed');
  process.exit(0);
});

module.exports = { connectDB, getDB };
