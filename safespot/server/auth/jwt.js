const jwt = require("jsonwebtoken");

const SECRET = "super_secret_key";

function signToken(user) {
  return jwt.sign(
    {
      userId: user._id,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl
    },
    SECRET,
    { expiresIn: "7d" }
  );
}

function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

module.exports = { signToken, verifyToken };