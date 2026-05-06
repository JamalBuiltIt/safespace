const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  displayName: String,
  age: Number,
  gender: String,

  avatarUrl: {
    type: String,
    default: "https://i.pravatar.cc/150"
  }
}, { timestamps: true });

// ✅ THIS IS THE FIX
module.exports = mongoose.model("User", UserSchema);