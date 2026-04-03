// backend/routes/noteRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth'); 
const { 
  saveNote, 
  getNotesByTopic, 
  getAllNotes, 
  deleteNote 
} = require('../controllers/noteController');

// --- ROUTES ---

// 1. Get ALL notes (Moved this ABOVE the /:topic route)
router.get('/', protect, getAllNotes);

// 2. Save or Update a note
router.post('/', protect, saveNote);

// 3. Get notes for a specific topic (e.g., /api/notes/arrays)
router.get('/:topic', protect, getNotesByTopic);

// 4. Delete a note
router.delete('/:questionId', protect, deleteNote);

module.exports = router;