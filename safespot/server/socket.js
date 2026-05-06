const { verifyToken } = require("./auth/jwt.js");
const {
  addPlayer,
  removePlayer,
  updatePlayer,
  getPlayers
} = require("./game/worldState.js");

module.exports = function socketHandler(io) {

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const user = verifyToken(token);
      socket.user = user;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const id = socket.user.displayName;

    addPlayer(id, {
      id,
      x: 0,
      y: 0,
      z: 0,
      avatarUrl: socket.user.avatarUrl || ""
    });

    socket.emit("currentPlayers", getPlayers());
    socket.broadcast.emit("newPlayer", getPlayers()[id]);

    socket.on("move", (data) => {
      updatePlayer(id, data);
    });

    socket.on("disconnect", () => {
      removePlayer(id);
      io.emit("removePlayer", id);
    });
  });

  setInterval(() => {
    io.emit("updatePlayers", getPlayers());
  }, 50);
};