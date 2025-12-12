const { ObjectId } = require('mongodb');
const { getDB } = require('../db');

const collection = () => getDB().collection('participants');

async function createParticipant(data) {
  const result = await collection().insertOne({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return result.insertedId;
}

function listParticipants(filter = {}, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  return collection()
    .find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();
}

async function deleteParticipant(id) {
  return collection().deleteOne({ _id: new ObjectId(id) });
}

module.exports = {
  createParticipant,
  listParticipants,
  deleteParticipant
};
