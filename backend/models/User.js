const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { 
    type: String, 
    default: 'https://api.dicebear.com/9.x/bottts/svg?seed=Felix&backgroundColor=0f172a' 
  },
  streak: { type: Number, default: 0 },
  lastActive: { type: Date }
}, { timestamps: true });

/**
 * ✅ FIXED PRE-SAVE HOOK (NO next, pure async)
 */
UserSchema.pre('save', async function () {
  // Only hash if password is changed
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * ✅ SAFE PASSWORD MATCH (handles old + new users)
 */
UserSchema.methods.matchPassword = async function (enteredPassword) {
  try {
    // If password is hashed (bcrypt format)
    if (this.password.startsWith('$2a') || this.password.startsWith('$2b')) {
      return await bcrypt.compare(enteredPassword, this.password);
    }

    // Fallback for old plain-text passwords
    return enteredPassword === this.password;

  } catch (err) {
    console.error("Password compare error:", err);
    return false;
  }
};

module.exports = mongoose.model('User', UserSchema);