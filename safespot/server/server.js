const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// =====================================================
// CONFIG (tuning knobs)
// =====================================================
const TICK_RATE = 50; // server simulation step
const SNAPSHOT_RATE = 50;

// =====================================================
// STATE
// =====================================================
const players = {};
const socketToPlayer = {};
const playerToSocket = {};

// =====================================================
// SOCKET LIFECYCLE
// =====================================================
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // ---------------- AUTH ----------------
  const token = socket.handshake.auth?.token;
  if (!token) return socket.disconnect(true);

  let user;
  try {
    user = jwt.verify(token, "secret_key_change_later");
  } catch {
    return socket.disconnect(true);
  }

  const playerId = user.id || user.displayName;
  if (!playerId) return socket.disconnect(true);

  // =====================================================
  // HARD SINGLE-SESSION ENFORCEMENT
  // =====================================================
  const oldSocketId = playerToSocket[playerId];

  if (oldSocketId) {
    const oldSocket = io.sockets.sockets.get(oldSocketId);
    if (oldSocket) oldSocket.disconnect(true);

    delete socketToPlayer[oldSocketId];
  }

  playerToSocket[playerId] = socket.id;
  socketToPlayer[socket.id] = playerId;

  // =====================================================
  // PLAYER INIT
  // =====================================================
  if (!players[playerId]) {
    players[playerId] = {
      id: playerId,
      x: 0,
      y: 0,
      z: 0,
      vx: 0,
      vz: 0,
      lastMoveTime: Date.now(),
    };
  }

  socket.emit("init", { playerId });

  // send initial world
  socket.emit("snapshot", players);

  // broadcast new connection state
  socket.broadcast.emit("snapshot", players);

  // =====================================================
  // INPUT (velocity only — no positions from client)
  // =====================================================
  socket.on("move", (input) => {
    const id = socketToPlayer[socket.id];
    if (!id) return;

    const p = players[id];
    if (!p) return;

    // basic sanity / anti-speedhack
    const now = Date.now();
    const delta = now - p.lastMoveTime;

    if (delta < 10) return; // spam protection

    p.lastMoveTime = now;

    // apply velocity
    p.vx = Math.max(-1, Math.min(1, input.vx || 0));
    p.vz = Math.max(-1, Math.min(1, input.vz || 0));
  });

  // =====================================================
  // DISCONNECT
  // =====================================================
  socket.on("disconnect", () => {
    const id = socketToPlayer[socket.id];
    if (!id) return;

    delete socketToPlayer[socket.id];
    delete playerToSocket[id];
    delete players[id];

    io.emit("snapshot", players);

    console.log("Player removed:", id);
  });
});

// =====================================================
// PHYSICS TICK (authoritative simulation)
// =====================================================
setInterval(() => {
  for (const id in players) {
    const p = players[id];

    // integrate velocity
    p.x += p.vx;
    p.z += p.vz;

    // friction
    p.vx *= 0.85;
    p.vz *= 0.85;

    // clamp to prevent runaway values
    p.vx = Math.max(-2, Math.min(2, p.vx));
    p.vz = Math.max(-2, Math.min(2, p.vz));
  }
}, TICK_RATE);

// =====================================================
// SNAPSHOT BROADCAST (world replication)
// =====================================================
setInterval(() => {
  io.emit("snapshot", players);
}, SNAPSHOT_RATE);

// =====================================================
// DB
// =====================================================
mongoose
  .connect(
    "mongodb+srv://MallBuiltIt:3285716@cluster0.hohv5je.mongodb.net/safespot"
  )
  .then(() => console.log("MongoDB connected"))
  .catch(console.error);

// =====================================================
// START
// =====================================================
const PORT = 5000;

server.listen(PORT, () => {
  console.log("Server running on", PORT);
});