const express = require('express');
const path = require('path');
const cors = require('cors');

const printRoutes = require('./api/printRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files from /public
app.use(express.static(path.join(__dirname, '..', '..', 'public')));

// API routes
app.use('/api', printRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
