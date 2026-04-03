// backend/models/Note.js
const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // ⚡ CLAUDE FIX #1: Index on userId
  },
  questionId: { type: String, required: true },
  topic: { 
    type: String, 
    required: true,
    index: true // ⚡ CLAUDE FIX #1: Index on topic
  },
  content: { type: String },
  confidence: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Hard' },
  timeComplexity: { type: String },
  spaceComplexity: { type: String },
  theTrick: { type: String },
  nextRevisionDate: { type: Date, default: Date.now }
}, { timestamps: true });

// ⚡ CLAUDE FIX #1: Compound Index for ultra-fast topic lookups
NoteSchema.index({ userId: 1, topic: 1 });

module.exports = mongoose.model('Note', NoteSchema);