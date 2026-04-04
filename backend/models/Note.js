const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true 
  },
  questionId: { type: String, required: true },
  topic: { 
    type: String, 
    required: true,
    index: true 
  },
  content: { type: String },
  confidence: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Hard' },
  timeComplexity: { type: String },
  spaceComplexity: { type: String },
  theTrick: { type: String },
  nextRevisionDate: { type: Date, default: Date.now }
}, { timestamps: true }); // ⚡ CRITICAL: Records the 'createdAt' date for Heatmap

// Compound Index for fast topic lookups
NoteSchema.index({ userId: 1, topic: 1 });

module.exports = mongoose.model('Note', NoteSchema);