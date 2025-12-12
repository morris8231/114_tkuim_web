const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { createParticipant, listParticipants, deleteParticipant } = require('../repositories/participants');
const { getDB } = require('../db');

// POST /api/signup - create a new signup
router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone } = req.body || {};
    if (!name || !email || !phone) {
      return res.status(400).json({ message: '姓名、email、手機必填' });
    }
    const ownerId = req.user.id;
    const id = await createParticipant({ name, email, phone, ownerId });
    res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
});

// GET /api/signup - list signups (own or all)
router.get('/', async (req, res, next) => {
  try {
    const { role, id } = req.user;
    let filter = {};
    if (role !== 'admin') {
      filter = { ownerId: id };
    }
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const items = await listParticipants(filter, page, limit);
    res.json({ count: items.length, participants: items });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/signup/:id - delete a signup
router.delete('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const participant = await getDB().collection('participants').findOne({ _id: new ObjectId(id) });
    if (!participant) {
      return res.status(404).json({ message: '找不到資料' });
    }
    // Only owner or admin can delete
    if (req.user.role !== 'admin' && participant.ownerId !== req.user.id) {
      return res.status(403).json({ message: '權限不足' });
    }
    await deleteParticipant(id);
    res.json({ message: '刪除成功' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
