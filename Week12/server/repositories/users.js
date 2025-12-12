const { getDB } = require('../db');
const bcrypt = require('bcrypt');

const collection = () => getDB().collection('users');

async function createUser({ email, password, role = 'student' }) {
  const passwordHash = await bcrypt.hash(password, 10);
  const result = await collection().insertOne({
    email,
    passwordHash,
    role,
    createdAt: new Date()
  });
  return result.insertedId;
}

async function findUserByEmail(email) {
  return collection().findOne({ email });
}

module.exports = {
  createUser,
  findUserByEmail
};
