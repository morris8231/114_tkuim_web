const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for all origins.  The backend should have its own CORS config
// but enabling it here avoids common development issues when running
// frontend and backend on different ports.
app.use(cors());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Fallback: serve index.html for any unknown routes (for client‑side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Frontend server listening at http://localhost:${port}`);
});