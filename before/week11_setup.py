#!/usr/bin/env python3
"""
This script bootstraps a Week11 full‑stack project for the user's web programming
course. Running this script will generate a `Week11` directory in the current
working directory containing everything required to complete Week11 of the
course: a MongoDB container setup, a Node.js server with CRUD API
functionality, and a simple client that can create, list, update and delete
participants. The script is idempotent — running it multiple times will
overwrite the generated files.

Usage:
    python week11_setup.py

After running, open the generated `Week11` folder in VS Code. To start the
backend database, run `docker compose up` from within the `Week11/docker`
directory. Then install server dependencies with `npm install` inside
`Week11/server` and start the server (`npm run dev` for development). Finally,
open the `Week11/client/index.html` file in your browser via Live Server or a
similar extension. The client application will connect to the API and store
participants in MongoDB.
"""

import json
import os
from pathlib import Path


BASE_DIR = Path.cwd() / "Week11"


def write_file(relative_path: str, content: str) -> None:
    """Helper to write file content to the Week11 project structure.

    Creates any intermediate directories as needed.

    Args:
        relative_path: Path within Week11 to write to, e.g. "server/app.js".
        content: The file contents.
    """
    target_path = BASE_DIR / relative_path
    target_path.parent.mkdir(parents=True, exist_ok=True)
    with target_path.open("w", encoding="utf-8") as f:
        f.write(content)


def generate_docker_files() -> None:
    """Generate Docker configuration for MongoDB."""
    docker_compose = """version: '3.8'
services:
  mongo:
    image: mongo:7
    container_name: week11-mongo
    restart: unless-stopped
    ports:
      - '27017:27017'
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: example
      MONGO_INITDB_DATABASE: participantsdb
    volumes:
      - ./mongo-data:/data/db
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
"""

    mongo_init_js = """// Initialisation script for MongoDB
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
"""

    write_file("docker/docker-compose.yml", docker_compose)
    write_file("docker/mongo-init.js", mongo_init_js)


def generate_server_files() -> None:
    """Generate Node.js server code and configuration."""
    package_json = {
        "name": "week11-server",
        "version": "1.0.0",
        "description": "Week11 Express server with MongoDB CRUD",
        "main": "app.js",
        "scripts": {
            "start": "node app.js",
            "dev": "nodemon app.js"
        },
        "dependencies": {
            "cors": "^2.8.5",
            "dotenv": "^16.3.1",
            "express": "^4.18.2",
            "mongodb": "^6.5.0"
        },
        "devDependencies": {
            "nodemon": "^3.0.1"
        }
    }
    write_file("server/package.json", json.dumps(package_json, indent=2, ensure_ascii=False))

    # .env configuration
    env_file = """PORT=3001
ALLOWED_ORIGIN=http://127.0.0.1:5500
MONGODB_URI=mongodb://week11-user:week11-pass@localhost:27017/participantsdb?authSource=participantsdb
"""
    write_file("server/.env", env_file)

    # Database connection helper
    db_js = """const { MongoClient } = require('mongodb');

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
  console.log('\n[DB] Connection closed');
  process.exit(0);
});

module.exports = { connectDB, getDB };
"""
    write_file("server/db.js", db_js)

    # Repository implementing CRUD operations
    participants_repo = """const { ObjectId } = require('mongodb');
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
"""
    write_file("server/repositories/participants.js", participants_repo)

    # Express router for /api/signup
    signup_route = """const express = require('express');
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
"""
    write_file("server/routes/signup.js", signup_route)

    # Express application entrypoint
    app_js = """require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');
const signupRouter = require('./routes/signup');

const app = express();

// CORS configuration: allow multiple origins separated by comma
const allowed = process.env.ALLOWED_ORIGIN || '*';
const origins = allowed.includes(',')
  ? allowed.split(',').map((s) => s.trim())
  : allowed;

app.use(cors({ origin: origins }));
app.use(express.json());

// Routes
app.use('/api/signup', signupRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Server Error' });
});

const PORT = process.env.PORT || 3001;
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server ready on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to DB', err);
    process.exit(1);
  });
"""
    write_file("server/app.js", app_js)


def generate_client_files() -> None:
    """Generate the front‑end HTML and JavaScript to interact with the API."""
    html = """<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8" />
  <title>Week11 參與者管理</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: sans-serif; max-width: 720px; margin: 0 auto; padding: 1rem; }
    h1 { text-align: center; }
    form { margin-bottom: 1rem; }
    label { display: block; margin-top: 0.5rem; }
    input { width: 100%; padding: 0.5rem; margin-top: 0.25rem; }
    button { margin-top: 0.75rem; padding: 0.5rem 1rem; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { border: 1px solid #ccc; padding: 0.5rem; text-align: left; }
    th { background: #f5f5f5; }
    .actions { white-space: nowrap; }
    .error { color: #d63031; }
  </style>
</head>
<body>
  <h1>參與者管理系統</h1>
  <form id="participantForm" novalidate>
    <input type="hidden" id="editingId">
    <label for="name">姓名</label>
    <input type="text" id="name" name="name" required>
    <div class="error" id="nameError"></div>

    <label for="email">Email</label>
    <input type="email" id="email" name="email" required>
    <div class="error" id="emailError"></div>

    <label for="phone">手機（09 開頭 10 碼）</label>
    <input type="tel" id="phone" name="phone" pattern="^09\d{8}$" required>
    <div class="error" id="phoneError"></div>

    <button type="submit" id="submitBtn">新增</button>
    <button type="button" id="cancelBtn" style="display:none">取消編輯</button>
  </form>
  <div id="globalError" class="error"></div>
  <table id="participantsTable">
    <thead>
      <tr><th>姓名</th><th>Email</th><th>手機</th><th class="actions">操作</th></tr>
    </thead>
    <tbody></tbody>
  </table>

  <script src="main.js"></script>
</body>
</html>
"""
    write_file("client/index.html", html)

    js = """// Client logic for Week11 CRUD operations
const apiBase = 'http://localhost:3001/api/signup';
const form = document.getElementById('participantForm');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const editingIdInput = document.getElementById('editingId');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const globalError = document.getElementById('globalError');
const tableBody = document.querySelector('#participantsTable tbody');

function clearErrors() {
  document.getElementById('nameError').textContent = '';
  document.getElementById('emailError').textContent = '';
  document.getElementById('phoneError').textContent = '';
  globalError.textContent = '';
}

function validateField(input, errorEl) {
  errorEl.textContent = '';
  if (!input.checkValidity()) {
    if (input.validity.valueMissing) {
      errorEl.textContent = '此欄位必填';
    } else if (input.validity.typeMismatch) {
      errorEl.textContent = '格式錯誤';
    } else if (input.validity.patternMismatch) {
      errorEl.textContent = '格式錯誤';
    } else if (input.validity.tooShort) {
      errorEl.textContent = `至少 ${input.minLength} 字`;
    }
    return false;
  }
  return true;
}

async function fetchParticipants() {
  try {
    const res = await fetch(`${apiBase}?page=1&limit=100`);
    const data = await res.json();
    renderTable(data.items || []);
  } catch (err) {
    globalError.textContent = '無法取得資料';
  }
}

function renderTable(participants) {
  tableBody.innerHTML = '';
  participants.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.name}</td>
      <td>${p.email}</td>
      <td>${p.phone}</td>
      <td class="actions">
        <button data-id="${p._id}" class="edit-btn">編輯</button>
        <button data-id="${p._id}" class="delete-btn">刪除</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors();
  const nameValid = validateField(nameInput, document.getElementById('nameError'));
  const emailValid = validateField(emailInput, document.getElementById('emailError'));
  const phoneValid = validateField(phoneInput, document.getElementById('phoneError'));
  if (!nameValid || !emailValid || !phoneValid) {
    return;
  }
  const payload = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    phone: phoneInput.value.trim()
  };
  try {
    if (editingIdInput.value) {
      // update existing
      const res = await fetch(`${apiBase}/${editingIdInput.value}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        globalError.textContent = data.message || '更新失敗';
        return;
      }
    } else {
      // create new
      const res = await fetch(apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        globalError.textContent = data.message || '建立失敗';
        return;
      }
    }
    // reset form and reload data
    form.reset();
    editingIdInput.value = '';
    submitBtn.textContent = '新增';
    cancelBtn.style.display = 'none';
    await fetchParticipants();
  } catch (err) {
    globalError.textContent = '無法連線到伺服器';
  }
});

// Cancel editing
cancelBtn.addEventListener('click', () => {
  form.reset();
  editingIdInput.value = '';
  submitBtn.textContent = '新增';
  cancelBtn.style.display = 'none';
  clearErrors();
});

// Delegate table clicks for edit/delete
tableBody.addEventListener('click', async (e) => {
  const target = e.target;
  if (target.classList.contains('edit-btn')) {
    const id = target.dataset.id;
    // fetch single participant from the list (already loaded)
    const row = target.closest('tr');
    nameInput.value = row.children[0].textContent;
    emailInput.value = row.children[1].textContent;
    phoneInput.value = row.children[2].textContent;
    editingIdInput.value = id;
    submitBtn.textContent = '更新';
    cancelBtn.style.display = 'inline';
  } else if (target.classList.contains('delete-btn')) {
    const id = target.dataset.id;
    if (!confirm('確認要刪除這筆資料嗎？')) return;
    try {
      const res = await fetch(`${apiBase}/${id}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        globalError.textContent = data.message || '刪除失敗';
        return;
      }
      await fetchParticipants();
    } catch (err) {
      globalError.textContent = '無法連線到伺服器';
    }
  }
});

// Load initial data
fetchParticipants();
"""
    write_file("client/main.js", js)


def main() -> None:
    # Create base directory
    BASE_DIR.mkdir(parents=True, exist_ok=True)
    generate_docker_files()
    generate_server_files()
    generate_client_files()
    print(f"Week11 project created at: {BASE_DIR.resolve()}")


if __name__ == '__main__':
    main()