const { ObjectId } = require('mongodb');
const { getDB } = require('../db');

function collection() {
  return getDB().collection('participants');
}

async function createParticipant(data) {
  const result = await collection().insertOne({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return result.insertedId;
}

async function listParticipants(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const items = await collection()
    .find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();
  const total = await collection().countDocuments();
  return { total, items };
}

async function updateParticipant(id, patch) {
  const result = await collection().updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...patch, updatedAt: new Date() } }
  );
  return result;
}

async function deleteParticipant(id) {
  const result = await collection().deleteOne({ _id: new ObjectId(id) });
  return result;
}

module.exports = {
  createParticipant,
  listParticipants,
  updateParticipant,
  deleteParticipant
};
