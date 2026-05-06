import * as THREE from "three";

export function createPlayer(scene) {
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

  const player = new THREE.Mesh(geometry, material);
  player.position.y = 0.5;

  scene.add(player);

  return player;
}