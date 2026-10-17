require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/candidates', require('./routes/candidates'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Serve the built React app in production (client/dist exists after `npm run build`)
const path = require('path');
const fs = require('fs');
const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) =>
    req.path.startsWith('/api') ? next() : res.sendFile(path.join(clientDist, 'index.html'))
  );
}

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Central error handler: turns Mongoose errors into readable API responses
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join('. ') });
  }
  if (err.code === 11000) return res.status(409).json({ message: 'A candidate with this email already exists.' });
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid candidate id.' });
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server.' });
});

const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mini-ats')
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });