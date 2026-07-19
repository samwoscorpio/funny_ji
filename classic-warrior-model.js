/* Global Three.js model factory shared by the world map and tactical board. */
(function registerClassicWarriorModel(global) {
  function createMaterialSet(THREE, options) {
    const teamTint = options.teamColor || 0x4aaed1;
    return {
      skin: new THREE.MeshStandardMaterial({ color: 0xc58a63, roughness: 0.88 }),
      hair: new THREE.MeshStandardMaterial({ color: 0x1b1716, roughness: 1 }),
      cloth: new THREE.MeshStandardMaterial({ color: 0x514238, roughness: 0.95 }),
      clothLight: new THREE.MeshStandardMaterial({ color: 0xa58b6b, roughness: 0.94 }),
      belt: new THREE.MeshStandardMaterial({ color: 0x2b211d, roughness: 0.82, metalness: 0.12 }),
      wood: new THREE.MeshStandardMaterial({ color: 0x714a2c, roughness: 0.9 }),
      guard: new THREE.MeshStandardMaterial({ color: teamTint, emissive: teamTint, emissiveIntensity: 0.22, roughness: 0.58, metalness: 0.18 }),
    };
  }

  function makeMesh(THREE, geometry, material, x, y, z) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  function createClassicWarrior(THREE, options = {}) {
    const materials = createMaterialSet(THREE, options);
    const group = new THREE.Group();
    group.name = "classic-warrior";

    // Four-head silhouette: low legs and tunic, then a prominent young face.
    const leftLeg = makeMesh(THREE, new THREE.BoxGeometry(0.2, 0.48, 0.22), materials.cloth, -0.13, 0.27, 0);
    const rightLeg = makeMesh(THREE, new THREE.BoxGeometry(0.2, 0.48, 0.22), materials.cloth, 0.13, 0.27, 0);
    const leftBoot = makeMesh(THREE, new THREE.BoxGeometry(0.24, 0.16, 0.34), materials.belt, -0.13, 0.08, 0.06);
    const rightBoot = makeMesh(THREE, new THREE.BoxGeometry(0.24, 0.16, 0.34), materials.belt, 0.13, 0.08, 0.06);
    const tunic = makeMesh(THREE, new THREE.CylinderGeometry(0.31, 0.39, 0.76, 6), materials.cloth, 0, 0.85, 0);
    const hem = makeMesh(THREE, new THREE.ConeGeometry(0.43, 0.42, 6), materials.clothLight, 0, 0.5, 0);
    hem.rotation.x = Math.PI;
    const belt = makeMesh(THREE, new THREE.TorusGeometry(0.325, 0.045, 5, 12), materials.belt, 0, 0.68, 0);
    belt.rotation.x = Math.PI / 2;

    const leftArm = makeMesh(THREE, new THREE.CylinderGeometry(0.1, 0.12, 0.58, 6), materials.clothLight, -0.39, 0.93, 0);
    leftArm.rotation.z = 0.28;
    const rightArm = makeMesh(THREE, new THREE.CylinderGeometry(0.1, 0.12, 0.58, 6), materials.clothLight, 0.39, 0.93, 0);
    rightArm.rotation.z = -0.28;
    const leftHand = makeMesh(THREE, new THREE.SphereGeometry(0.11, 7, 5), materials.skin, -0.47, 0.68, 0);
    const rightHand = makeMesh(THREE, new THREE.SphereGeometry(0.11, 7, 5), materials.skin, 0.47, 0.68, 0);

    const neck = makeMesh(THREE, new THREE.CylinderGeometry(0.12, 0.14, 0.18, 7), materials.skin, 0, 1.32, 0);
    const head = makeMesh(THREE, new THREE.SphereGeometry(0.34, 8, 6), materials.skin, 0, 1.6, 0);
    head.scale.set(0.94, 1.04, 0.92);
    const hairCap = makeMesh(THREE, new THREE.SphereGeometry(0.355, 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.54), materials.hair, 0, 1.72, 0.01);
    const fringeLeft = makeMesh(THREE, new THREE.BoxGeometry(0.15, 0.19, 0.07), materials.hair, -0.12, 1.67, 0.29);
    fringeLeft.rotation.z = -0.35;
    const fringeRight = makeMesh(THREE, new THREE.BoxGeometry(0.13, 0.16, 0.07), materials.hair, 0.1, 1.69, 0.3);
    fringeRight.rotation.z = 0.25;

    // A wooden practice sword makes the hero legible from an isometric view.
    const sword = makeMesh(THREE, new THREE.BoxGeometry(0.09, 0.95, 0.12), materials.wood, 0.27, 1.08, 0.17);
    sword.rotation.z = -0.48;
    sword.rotation.x = 0.18;
    const hilt = makeMesh(THREE, new THREE.BoxGeometry(0.34, 0.07, 0.1), materials.belt, 0.03, 1.47, 0.23);
    hilt.rotation.z = -0.48;
    const shoulderMark = makeMesh(THREE, new THREE.OctahedronGeometry(0.075, 0), materials.guard, -0.3, 1.08, 0.16);

    group.add(
      leftLeg, rightLeg, leftBoot, rightBoot, tunic, hem, belt,
      leftArm, rightArm, leftHand, rightHand, neck, head, hairCap,
      fringeLeft, fringeRight, sword, hilt, shoulderMark,
    );
    group.scale.setScalar(options.scale || 1);
    group.userData.animateClassicWarrior = (elapsed, intensity = 1) => {
      const sway = Math.sin(elapsed * 2.1) * 0.025 * intensity;
      group.rotation.z = sway;
      head.position.y = 1.6 + Math.sin(elapsed * 2.1) * 0.018 * intensity;
      leftArm.rotation.z = 0.28 + Math.sin(elapsed * 2.1) * 0.045 * intensity;
      rightArm.rotation.z = -0.28 - Math.sin(elapsed * 2.1) * 0.045 * intensity;
    };
    return group;
  }

  global.JiCharacterModels = Object.assign(global.JiCharacterModels || {}, { createClassicWarrior });
}(window));
