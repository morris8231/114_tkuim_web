// This script runs inside the MongoDB container on first startup.
// It creates an application user with read/write permissions on the 'week12' database
// and ensures required collections exist.
db.createUser({
  user: 'week12-user',
  pwd: 'week12-pass',
  roles: [{ role: 'readWrite', db: 'week12' }]
});
// Create collections and indexes
db.createCollection('participants');
db.createCollection('users');
db.users.createIndex({ email: 1 }, { unique: true });
