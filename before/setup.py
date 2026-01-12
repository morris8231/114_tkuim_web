import os

# 定義專案結構與檔案內容
project_structure = {
    "Week11/docker/docker-compose.yml": """version: '3.8'
services:
  mongodb:
    image: mongo:7
    container_name: week11-mongo
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: password123
      MONGO_INITDB_DATABASE: week11
    volumes:
      - ./mongo-data:/data/db
      - ./mongo-init.js:/docker-entrypoint-initdb.d/init.js:ro
""",

    "Week11/docker/mongo-init.js": """db.createUser({
  user: 'week11-user',
  pwd: 'week11-pass',
  roles: [{ role: 'readWrite', db: 'week11' }]
});

db.createCollection('participants');
db.participants.createIndex({ "email": 1 }, { unique: true });
db.participants.insertOne({
  name: '示範學員',
  email: 'demo@example.com',
  phone: '0912345678',
  createdAt: new Date()
});
""",

    "Week11/server/package.json": """{
  "name": "week11-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "nodemon app.js",
    "start": "node app.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "mongodb": "^6.3.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
""",

    "Week11/server/.env": """PORT=3001
MONGODB_URI=mongodb://week11-user:week11-pass@localhost:27017/week11?authSource=week11
ALLOWED_ORIGIN=http://127.0.0.1:5500,http://localhost:5173
""",

    "Week11/server/db.js": """import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);
let db;

export async function connectDB() {
  if (db) return db;
  try {
    await client.connect();
    db = client.db();
    console.log('[DB] Connected to MongoDB');
    // 雙重保險：程式啟動時再次確認索引
    await db.collection('participants').createIndex({ email: 1 }, { unique: true });
    return db;
  } catch (err) {
    console.error('[DB Error]', err);
    throw err;
  }
}

export function getDB() {
  if (!db) throw new Error('Database not initialized');
  return db;
}

process.on('SIGINT', async () => {
  await client.close();
  console.log('\\n[DB] Connection closed');
  process.exit(0);
});
""",

    "Week11/server/repositories/participants.js": """import { ObjectId } from 'mongodb';
import { getDB } from '../db.js';

const collection = () => getDB().collection('participants');

export async function createParticipant(data) {
  const result = await collection().insertOne({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return result.insertedId;
}

export async function listParticipants(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const total = await collection().countDocuments();
  const data = await collection().find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();
  return { data, total, page, limit };
}

export async function updateParticipant(id, patch) {
  return collection().updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...patch, updatedAt: new Date() } }
  );
}

export function deleteParticipant(id) {
  return collection().deleteOne({ _id: new ObjectId(id) });
}
""",

    "Week11/server/routes/signup.js": """import express from 'express';
import {
  createParticipant,
  listParticipants,
  updateParticipant,
  deleteParticipant
} from '../repositories/participants.js';

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    if (!name || !email || !phone) {
      return res.status(400).json({ error: '缺少必要欄位 (name, email, phone)' });
    }
    const id = await createParticipant({ name, email, phone });
    res.status(201).json({ message: '報名成功', id });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: '此 Email 已經報名過了' });
    }
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await listParticipants(page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const result = await updateParticipant(req.params.id, req.body);
    if (!result.matchedCount) {
      return res.status(404).json({ error: '找不到該筆資料' });
    }
    res.json({ message: '更新成功', modified: result.modifiedCount });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await deleteParticipant(req.params.id);
    if (!result.deletedCount) {
      return res.status(404).json({ error: '找不到該筆資料' });
    }
    res.status(200).json({ message: '刪除成功' });
  } catch (error) {
    next(error);
  }
});

export default router;
""",

    "Week11/server/app.js": """import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './db.js';
import signupRouter from './routes/signup.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.ALLOWED_ORIGIN?.split(',') ?? '*' }));
app.use(express.json());

app.use('/api/signup', signupRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', db: 'connected' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  });
""",

    "Week11/client/index.html": """<!DOCTYPE html>
<html lang="zh-Hant">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Week11 報名系統</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="p-4">
    <div class="container" style="max-width: 600px;">
        <h2 class="mb-4">活動報名 (MongoDB版)</h2>
        <form id="signup-form" novalidate class="mb-5 border p-4 rounded shadow-sm">
            <div class="mb-3">
                <label for="name" class="form-label">姓名</label>
                <input type="text" class="form-control" id="name" name="name" required>
                <div class="invalid-feedback">請輸入姓名</div>
            </div>
            <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input type="email" class="form-control" id="email" name="email" required>
                <div class="invalid-feedback">請輸入有效的 Email</div>
            </div>
            <div class="mb-3">
                <label for="phone" class="form-label">手機號碼</label>
                <input type="tel" class="form-control" id="phone" name="phone" 
                       pattern="^09\d{8}$" title="09開頭的10碼數字" required>
                <div class="invalid-feedback">格式錯誤，需為 09 開頭的 10 碼數字</div>
            </div>
            <button type="submit" class="btn btn-primary w-100" id="submit-btn">送出報名</button>
        </form>
        <hr>
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h4>報名名單 (From DB)</h4>
            <button id="refresh-btn" class="btn btn-outline-secondary btn-sm">重新整理</button>
        </div>
        <ul id="participant-list" class="list-group"></ul>
        <div class="mt-3 d-flex justify-content-center gap-2" id="pagination">
            <button class="btn btn-sm btn-light" id="prev-page" disabled>上一頁</button>
            <span id="page-info" class="align-self-center">Page 1</span>
            <button class="btn btn-sm btn-light" id="next-page">下一頁</button>
        </div>
    </div>
    <script src="script.js"></script>
</body>
</html>
""",

    "Week11/client/script.js": """const form = document.getElementById('signup-form');
const submitBtn = document.getElementById('submit-btn');
const listEl = document.getElementById('participant-list');
const refreshBtn = document.getElementById('refresh-btn');
let currentPage = 1;
const limit = 5;
const API_URL = 'http://localhost:3001/api/signup';

function validateForm() {
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return false;
    }
    return true;
}

async function submitSignup(data) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || '報名失敗');
    return result;
}

async function fetchParticipants(page = 1) {
    try {
        const res = await fetch(`${API_URL}?page=${page}&limit=${limit}`);
        const { data, total, page: currPage } = await res.json();
        renderList(data);
        updatePagination(total, currPage);
    } catch (err) {
        console.error(err);
        listEl.innerHTML = `<li class="list-group-item text-danger">無法讀取資料</li>`;
    }
}

function renderList(participants) {
    listEl.innerHTML = '';
    if (participants.length === 0) {
        listEl.innerHTML = '<li class="list-group-item text-muted">目前沒有資料</li>';
        return;
    }
    participants.forEach(p => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `
            <div>
                <strong>${p.name}</strong> <small class="text-muted">(${p.email})</small>
                <br><span class="badge bg-light text-dark border">${p.phone}</span>
            </div>
            <button class="btn btn-sm btn-danger delete-btn" data-id="${p._id}">刪除</button>
        `;
        listEl.appendChild(li);
    });
}

function updatePagination(total, page) {
    currentPage = parseInt(page);
    document.getElementById('page-info').textContent = `Page ${currentPage}`;
    const totalPages = Math.ceil(total / limit);
    document.getElementById('prev-page').disabled = currentPage <= 1;
    document.getElementById('next-page').disabled = currentPage >= totalPages;
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    try {
        submitBtn.disabled = true;
        submitBtn.textContent = '處理中...';
        await submitSignup(payload);
        alert('✅ 報名成功！資料已寫入 MongoDB');
        form.reset();
        form.classList.remove('was-validated');
        fetchParticipants(1);
    } catch (error) {
        alert(`❌ 錯誤：${error.message}`);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '送出報名';
    }
});

listEl.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-btn')) {
        const id = e.target.getAttribute('data-id');
        if (!confirm('確定要刪除這筆資料嗎？')) return;
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            fetchParticipants(currentPage);
        } catch (err) { alert('刪除失敗'); }
    }
});

refreshBtn.addEventListener('click', () => fetchParticipants(currentPage));
document.getElementById('prev-page').addEventListener('click', () => fetchParticipants(currentPage - 1));
document.getElementById('next-page').addEventListener('click', () => fetchParticipants(currentPage + 1));
fetchParticipants();
""",

    "Week11/tests/api.http": """@baseUrl = http://localhost:3001/api/signup

### 1. 檢查伺服器健康狀態
GET http://localhost:3001/health

### 2. 建立新報名 (Create)
# @name createReq
POST {{baseUrl}}
Content-Type: application/json

{
    "name": "測試人員",
    "email": "test01@example.com",
    "phone": "0912345678"
}

### 3. 測試 Email 唯一性 (重複建立應回傳 409)
POST {{baseUrl}}
Content-Type: application/json

{
    "name": "重複人員",
    "email": "test01@example.com",
    "phone": "0987654321"
}

### 4. 取得列表 (Read + Pagination)
GET {{baseUrl}}?page=1&limit=5

### 5. 更新資料 (Update)
@id = {{createReq.response.body.id}}
PATCH {{baseUrl}}/{{id}}
Content-Type: application/json

{
    "phone": "0900000000"
}

### 6. 刪除資料 (Delete)
DELETE {{baseUrl}}/{{id}}
"""
}

def create_project():
    for path, content in project_structure.items():
        # 確保資料夾存在
        os.makedirs(os.path.dirname(path), exist_ok=True)
        # 寫入檔案
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Created: {path}")
    print("\\n✅ 專案建立完成！請依照後續步驟啟動服務。")

if __name__ == "__main__":
    create_project()