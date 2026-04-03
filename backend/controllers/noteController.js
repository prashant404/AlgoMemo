// backend/controllers/noteController.js
const Note = require('../models/Note');
const User = require('../models/User');

// backend/controllers/noteController.js

exports.saveNote = async (req, res) => {
  try {
    const { questionId, topic, content, confidence, timeComplexity, spaceComplexity, theTrick } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const currentUserId = req.user._id || req.user.id;

    // Force enum compliance
    const formattedConfidence = confidence 
      ? confidence.charAt(0).toUpperCase() + confidence.slice(1).toLowerCase() 
      : 'Hard';

    let daysToAdd = formattedConfidence === 'Easy' ? 21 : formattedConfidence === 'Medium' ? 7 : 1;
    const nextRevisionDate = new Date();
    nextRevisionDate.setDate(nextRevisionDate.getDate() + daysToAdd);

    // 🏆 PRIMARY ACTION: Save the Note
    const note = await Note.findOneAndUpdate(
      { userId: currentUserId, questionId: String(questionId) },
      { 
        content: content || "", 
        confidence: formattedConfidence, 
        topic: String(topic), 
        timeComplexity: timeComplexity || "", 
        spaceComplexity: spaceComplexity || "", 
        theTrick: theTrick || "", 
        nextRevisionDate, 
        userId: currentUserId 
      },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    );

    // ⚙️ SECONDARY ACTION: Streak & Game Stats (Isolated so it can't crash the note!)
    let streak = 0;
    let gameStats = { level: 1, solvedCount: 0 };

    try {
      const userDoc = await User.findById(currentUserId);
      if (userDoc) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); 

        if (userDoc.lastActive) {
          const lastActive = new Date(userDoc.lastActive);
          lastActive.setHours(0, 0, 0, 0); 
          const diffDays = Math.ceil(Math.abs(today - lastActive) / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) userDoc.streak = (userDoc.streak || 0) + 1;
          else if (diffDays > 1) userDoc.streak = 1;
          else if (diffDays === 0 && !userDoc.streak) userDoc.streak = 1;
        } else { 
          userDoc.streak = 1; 
        }

        userDoc.lastActive = new Date();
        await userDoc.save();
        streak = userDoc.streak;
      }

      const allUserNotes = await Note.find({ userId: currentUserId }).lean();
      gameStats.solvedCount = allUserNotes.length;
      gameStats.level = Math.min(Math.floor(allUserNotes.length / 5) + 1, 10);

    } catch (secondaryErr) {
      // If the streak fails, we log it to the backend terminal, but DO NOT crash the frontend!
      console.error("⚠️ Note saved successfully, but Streak Engine failed:", secondaryErr.message);
    }

    // 🚀 SUCCESS: Return the successful note data to the UI!
    res.json({ 
      note, 
      streak, 
      gameStats 
    });

  } catch (err) {
    // This will only trigger if the NOTE itself fails to save
    console.error("🔥 FATAL Save Note Error:", err.message);
    res.status(500).json({ message: "Error saving note", error: err.message });
  }
};

exports.getNotesByTopic = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authorized" });
    const currentUserId = req.user.id || req.user._id;
    
    // ⚡ CLAUDE FIX #3: Added .lean()
    const notes = await Note.find({ userId: currentUserId, topic: req.params.topic }).lean();
    res.json(notes);
  } catch (err) {
    console.error("Get Notes Error:", err.message);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.getAllNotes = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authorized" });
    // ⚡ CLAUDE FIX #3: Added .lean()
    const notes = await Note.find({ userId: req.user.id || req.user._id }).lean();
    res.json(notes);
  } catch (err) { res.status(500).json({ message: "Server Error", error: err.message }); }
};

exports.deleteNote = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authorized" });
    await Note.findOneAndDelete({ userId: req.user.id || req.user._id, questionId: req.params.questionId });
    res.json({ msg: 'Note deleted' });
  } catch (err) { res.status(500).send("Server Error"); }
};