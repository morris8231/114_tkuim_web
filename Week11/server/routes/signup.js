const express = require('express');
const {
  createParticipant,
  listParticipants,
  updateParticipant,
  deleteParticipant
} = require('../repositories/participants');

const router = express.Router();

// POST /api/signup - create participant
router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone } = req.body || {};
    if (!name || !email || !phone) {
      return res.status(400).json({ message: '姓名、Email、手機為必填' });
    }
    // rudimentary email and phone validation
    const emailRegex = /\S+@\S+\.\S+/;
    const phoneRegex = /^09\d{8}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Email 格式錯誤' });
    }
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: '手機號碼需為 09 開頭 10 碼' });
    }
    const id = await createParticipant({ name, email, phone });
    res.status(201).json({ id });
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate email index violation
      return res.status(400).json({ message: 'Email 已存在，請勿重複報名' });
    }
    next(err);
  }
});

// GET /api/signup - list participants with optional pagination
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const { total, items } = await listParticipants(page, limit);
    res.json({ total, items });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/signup/:id - update participant
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body || {};
    // Build patch object and validate as necessary
    const patch = {};
    if (name) patch.name = name;
    if (email) {
      const emailRegex = /\S+@\S+\.\S+/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Email 格式錯誤' });
      }
      patch.email = email;
    }
    if (phone) {
      const phoneRegex = /^09\d{8}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ message: '手機號碼需為 09 開頭 10 碼' });
      }
      patch.phone = phone;
    }
    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ message: '沒有任何可更新的欄位' });
    }
    const result = await updateParticipant(id, patch);
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: '找不到資料' });
    }
    res.json({ updated: result.modifiedCount });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email 已存在，請勿重複報名' });
    }
    next(err);
  }
});

// DELETE /api/signup/:id - remove participant
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await deleteParticipant(id);
    if (!result.deletedCount) {
      return res.status(404).json({ message: '找不到資料' });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
