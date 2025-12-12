require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');
const signupRouter = require('./routes/signup');
const authRouter = require('./routes/auth');
const { authMiddleware } = require('./middleware/auth');
const { seedDefaultUsers } = require('./seed');

const app = express();

// Configure CORS
const allowed = process.env.ALLOWED_ORIGIN || '*';
const origins = allowed.includes(',')
  ? allowed.split(',').map((s) => s.trim())
  : allowed;
app.use(cors({ origin: origins }));
app.use(express.json());

// Public auth routes
app.use('/auth', authRouter);

// Protected routes
app.use('/api/signup', authMiddleware, signupRouter);

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
  .then(async () => {
    await seedDefaultUsers();
    app.listen(PORT, () => {
      console.log(`Server ready on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to DB', err);
    process.exit(1);
  });
