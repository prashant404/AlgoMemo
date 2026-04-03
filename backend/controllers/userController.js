const User = require('../models/User');
const Note = require('../models/Note');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '30d' });
};

// 1. Register User
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ username, email, password });
    res.status(201).json({
      _id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      streak: user.streak,
      token: generateToken(user._id)
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 2. Login User
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      streak: user.streak,
      token: generateToken(user._id)
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({
      message: "Server error during login",
      error: err.message
    });
  }
};

// 3. Get Profile Stats
exports.getProfileStats = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const [user, allNotes] = await Promise.all([
      User.findById(userId).lean(),
      Note.find({ userId }).lean()
    ]);

    if (!user) return res.status(404).json({ message: "User not found" });

    const solvedCount = allNotes.length;
    let level = Math.min(Math.floor(solvedCount / 5) + 1, 10);

    let title = "Pattern Solver";
    if (level >= 10) title = "DSA Guru";
    else if (level >= 7) title = "Pattern Grandmaster";
    else if (level >= 4) title = "Pattern Architect";

    const badges = [];
    if (user.streak >= 7) badges.push({ id: 'streak_7', name: 'Consistency Hero', icon: 'Flame', description: '7-day streak.' });
    if (allNotes.some(n => n.confidence === 'Hard')) badges.push({ id: 'hard_target', name: 'Hard Target', icon: 'ShieldAlert', description: 'Crushed a Hard problem.' });

    const topicCounts = {};
    allNotes.forEach(n => { topicCounts[n.topic] = (topicCounts[n.topic] || 0) + 1; });
    if (Object.values(topicCounts).some(count => count >= 10)) {
      badges.push({ id: 'topic_master', name: 'Topic Master', icon: 'Target', description: 'Mastered a single DSA category.' });
    }

    res.json({ level, title, badges, solvedCount, streak: user.streak || 0 });
  } catch (err) {
    console.error("Stats Error:", err);
    res.status(500).json({ message: "Error fetching stats" });
  }
};

// 4. Update Profile — Split into two safe paths
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { username, avatar, currentPassword, newPassword } = req.body;

    /**
     * 🔐 PASSWORD UPDATE
     */
    if (currentPassword && newPassword) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: "Incorrect current password" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      user.password = newPassword;
      await user.save(); // ✅ triggers pre('save') hook

      return res.json({ message: "Password updated successfully" });
    }

    /**
     * 👤 PROFILE UPDATE
     */
    const updateFields = {};

    if (username) updateFields.username = username;

    if (avatar !== undefined) {
      updateFields.avatar =
        avatar.trim() !== ""
          ? avatar
          : `https://api.dicebear.com/9.x/bottts/svg?seed=${username}&backgroundColor=0f172a`;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    ).lean();

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      streak: updatedUser.streak,
      token: generateToken(updatedUser._id)
    });

  } catch (err) {
    console.error("🔥 FULL PROFILE UPDATE ERROR:", err);
    res.status(500).json({
      message: "Error updating profile",
      error: err.message
    });
  }
};