// backend/routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const { explainPattern } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/explain', protect, explainPattern);

module.exports = router;