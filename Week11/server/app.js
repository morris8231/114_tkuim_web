// Week11/server/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');
const signupRouter = require('./routes/signup');

const app = express();

// CORS 設定：可支援多個 origin，以逗號分隔
const allowed = process.env.ALLOWED_ORIGIN || '*';
const origins = allowed.includes(',')
  ? allowed.split(',').map((s) => s.trim())
  : allowed;

app.use(cors({ origin: origins }));
app.use(express.json());

// API 路由
app.use('/api/signup', signupRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

// 錯誤處理
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Server Error' });
});

const PORT = process.env.PORT || 3001;

// 先連線 MongoDB 再啟動 Server
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
