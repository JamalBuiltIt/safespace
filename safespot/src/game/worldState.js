const players = {};

function addPlayer(id, data) {
  players[id] = data;
}

function removePlayer(id) {
  delete players[id];
}

function updatePlayer(id, data) {
  if (!players[id]) return;
  players[id] = { ...players[id], ...data };
}

function getPlayers() {
  return players;
}

module.exports = {
  addPlayer,
  removePlayer,
  updatePlayer,
  getPlayers
};