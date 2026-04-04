const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

dotenv.config();

const app = express();

// ⚡ REFINED CORS: Handles trailing slashes and multiple environments
const allowedOrigins = [
  'http://localhost:5173',
  'https://algo-memo-kappa.vercel.app',
  'https://algo-memo-kappa.vercel.app/' // Added trailing slash version
];

// Add the environment variable if it exists
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, "")); // Remove trailing slash if present
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("CORS Blocked for origin:", origin); // Check Render logs for this!
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

app.use(express.json());

// ⚡ PRO-TIP: Add a middleware to lowercase all emails automatically
app.use((req, res, next) => {
  if (req.body && req.body.email) {
    req.body.email = req.body.email.toLowerCase().trim();
  }
  next();
});

// Health Check
app.get('/', (req, res) => {
  res.status(200).send('AlgoMemo API is flying! 🚀');
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Connection Error:', err.message));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server flying on port ${PORT}`);
});