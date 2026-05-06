const express = require("express");
const User = require("../models/users.js");

const router = express.Router();

router.get("/:displayName", async (req, res) => {
  const user = await User.findOne({
    displayName: req.params.displayName,
  }).select("-password");

  if (!user)
    return res.status(404).json({ error: "User not found" });

  res.json(user);
});

module.exports = router;