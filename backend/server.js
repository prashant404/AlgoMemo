const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

dotenv.config();

const app = express();

// ⚡ PRODUCTION CORS: Matches your specific Vercel URL
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'https://algo-memo-kappa.vercel.app', // Your actual frontend
    process.env.FRONTEND_URL               // Flexible backup
  ],
  credentials: true
}));

app.use(express.json());

// ⚡ HEALTH CHECK: Required for Render to stay green
app.get('/', (req, res) => {
  res.status(200).send('AlgoMemo API is flying! 🚀');
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Connection Error:', err.message));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// ⚡ BIND TO 0.0.0.0: Essential for Render's internal networking
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server flying on port ${PORT}`);
});