// Initialisation script for MongoDB
// Creates an application user with read/write access and a sample collection
db.createUser({
  user: 'week11-user',
  pwd: 'week11-pass',
  roles: [ { role: 'readWrite', db: 'participantsdb' } ]
});

db.createCollection('participants');
// Create a unique index on the email field to prevent duplicates
db.participants.createIndex({ email: 1 }, { unique: true });

// Insert an example participant
db.participants.insertOne({
  name: '示範學員',
  email: 'demo@example.com',
  phone: '0912345678',
  createdAt: new Date(),
  updatedAt: new Date()
});
