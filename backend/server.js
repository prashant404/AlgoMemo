const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Optimized Connection for Direct Node Strings (Bypasses SRV Blocks)
mongoose.connect(process.env.MONGO_URI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10000, // Bumped to 10s for the longer direct string
  socketTimeoutMS: 45000,
})
.then(() => console.log('✅ MongoDB Connected (Direct Node Access)'))
.catch(err => console.error('❌ MongoDB Connection Error:', err.message));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server flying on port ${PORT}`));