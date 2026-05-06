import * as THREE from "three";
import { io } from "socket.io-client";

export class GameEngine {
  constructor(container) {
    this.container = container;

    // ---------------- STATE ----------------
    this.socket = null;
    this.playerId = null;

    this.otherPlayers = {};
    this.keys = {};
    this.animationId = null;

    // ---------------- SCENE ----------------
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.camera.position.set(0, 5, 10);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    container.appendChild(this.renderer.domElement);

    // ---------------- PLAYER ----------------
    this.player = this.createPlayer();

    this.initWorld();
    this.initSocket();
    this.animate();
  }

  // =====================================================
  // SOCKET
  // =====================================================
  initSocket() {
    this.socket = io("http://localhost:5000", {
      auth: {
        token: localStorage.getItem("token"),
      },
      forceNew: true, // 🔥 CRITICAL FIX: prevents duplicate ghost sockets
      reconnection: true,
    });

    // identity handshake from server
    this.socket.on("init", ({ playerId }) => {
      this.playerId = playerId;
    });

    this.socket.on("snapshot", (players) => {
  const ids = new Set(Object.keys(players));

  // remove missing players
  Object.keys(this.otherPlayers).forEach((id) => {
    if (!ids.has(id)) {
      this.scene.remove(this.otherPlayers[id].mesh);
      delete this.otherPlayers[id];
    }
  });

  // create or update players
  Object.keys(players).forEach((id) => {
    if (id === this.playerId) return;

    const data = players[id];

    if (!this.otherPlayers[id]) {
      this.otherPlayers[id] = this.createOtherPlayer(data);
    }

    this.otherPlayers[id].target = data;
  });
});
  }

  // =====================================================
  // WORLD
  // =====================================================
  initWorld() {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 5);
    this.scene.add(light);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(50, 50),
      new THREE.MeshStandardMaterial({ color: 0x222222 })
    );

    floor.rotation.x = -Math.PI / 2;
    this.scene.add(floor);

    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("resize", this.onResize);
  }

  // =====================================================
  // PLAYER
  // =====================================================
  createPlayer() {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshStandardMaterial({ color: "green" })
    );

    this.scene.add(mesh);

    return {
      mesh,
      speed: 0.1,
    };
  }

  createOtherPlayer(data) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshStandardMaterial({ color: "blue" })
    );

    mesh.position.set(data.x, data.y, data.z);
    this.scene.add(mesh);

    return {
      mesh,
      target: { x: data.x, y: data.y, z: data.z },
    };
  }

  // =====================================================
  // INPUT
  // =====================================================
  onKeyDown = (e) => (this.keys[e.key.toLowerCase()] = true);
  onKeyUp = (e) => (this.keys[e.key.toLowerCase()] = false);

  updatePlayer() {
    if (!this.playerId || !this.socket?.connected) return;

    const speed = this.player.speed;
    let moved = false;

    if (this.keys["w"]) {
      this.player.mesh.position.z -= speed;
      moved = true;
    }
    if (this.keys["s"]) {
      this.player.mesh.position.z += speed;
      moved = true;
    }
    if (this.keys["a"]) {
      this.player.mesh.position.x -= speed;
      moved = true;
    }
    if (this.keys["d"]) {
      this.player.mesh.position.x += speed;
      moved = true;
    }

    this.camera.position.x = this.player.mesh.position.x;
    this.camera.position.z = this.player.mesh.position.z + 5;
    this.camera.lookAt(this.player.mesh.position);

    if (moved) {
      this.socket.emit("move", {
        x: this.player.mesh.position.x,
        y: this.player.mesh.position.y,
        z: this.player.mesh.position.z,
      });
    }
  }

  // =====================================================
  // LOOP
  // =====================================================
  animate = () => {
    this.animationId = requestAnimationFrame(this.animate);

    Object.values(this.otherPlayers).forEach((p) => {
      if (!p.target) return;

      p.mesh.position.x += (p.target.x - p.mesh.position.x) * 0.12;
      p.mesh.position.y += (p.target.y - p.mesh.position.y) * 0.12;
      p.mesh.position.z += (p.target.z - p.mesh.position.z) * 0.12;
    });

    this.updatePlayer();

    this.renderer.render(this.scene, this.camera);
  };

  // =====================================================
  // CLEAN PLAYER RESET (IMPORTANT FIX)
  // =====================================================
  clearOtherPlayers() {
    Object.values(this.otherPlayers).forEach((p) => {
      this.scene.remove(p.mesh);
    });

    this.otherPlayers = {};
  }

  // =====================================================
  // RESIZE
  // =====================================================
  onResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  // =====================================================
  // DESTROY
  // =====================================================
  destroy() {
    cancelAnimationFrame(this.animationId);

    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("resize", this.onResize);

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.clearOtherPlayers();

    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }

    this.renderer.dispose();
  }
}