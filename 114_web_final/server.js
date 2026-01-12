require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

// Singleton instances
require('./config/db'); // Initialize database connection
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/api'));

// Error Handling
app.use((err, req, res, next) => {
    logger.error('Unhandled error:', err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    logger.success(`Server running on http://localhost:${PORT}`);
});
