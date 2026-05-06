import * as THREE from "three";

export function createWorld(scene) {
  const geometry = new THREE.PlaneGeometry(100, 100);
  const material = new THREE.MeshBasicMaterial({
    color: 0x228b22,
    side: THREE.DoubleSide,
  });

  const plane = new THREE.Mesh(geometry, material);
  plane.rotation.x = Math.PI / 2;

  scene.add(plane);
}