// Week09/server/app.js
import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { router as signupRouter } from './routes/signup.js';

config();

const app = express();
const PORT = process.env.PORT || 3001;

// --- CORS 設定（完整修正） ---
let allowed = process.env.ALLOWED_ORIGIN || '*';

// 如果有逗號就 split，否則給單一字串
if (allowed.includes(',')) {
  allowed = allowed.split(',').map(o => o.trim());
}

app.use(cors({
  origin: allowed,       // 可以是字串或 array，皆可
  credentials: false
}));

// --- JSON body parser ---
app.use(express.json());

// --- Routes ---
app.use('/api/signup', signupRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// --- 404 ---
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// --- 500 ---
app.use((error, req, res, next) => {
  console.error('[Server Error]', error.message);
  res.status(500).json({ error: 'Server Error' });
});

// --- Listen ---
app.listen(PORT, () => {
  console.log(`Server ready on http://localhost:${PORT}`);
});
