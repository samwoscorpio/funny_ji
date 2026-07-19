const stage = document.querySelector("#tactical3dStage");
const canvas = document.querySelector("#tactical3dCanvas");

if (stage && canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#060b0e");
  scene.fog = new THREE.Fog("#060b0e", 10, 27);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const board = new THREE.Group();
  const tileTargets = [];
  const textureCache = new Map();
  const palette = {
    floor: 0x1a2527, wall: 0x485058, bush: 0x23562d, energy: 0x2eaeea,
    objective: 0xd59b42, path: 0xf0bd44, reachable: 0x329bc7, target: 0xc34f43,
    player: 0x43c2f3, enemy: 0xef6552, flame: 0xe06524,
  };
  let snapshot = null;
  let yaw = -0.44;
  let pitch = 0.73;
  let distance = 15.2;
  let dragging = false;
  let draggedSinceDown = false;
  let pointerStart = { x: 0, y: 0 };

  scene.add(board);
  scene.add(new THREE.HemisphereLight(0x89b9cd, 0x11110d, 1.65));
  const keyLight = new THREE.DirectionalLight(0xffe0ae, 1.8);
  keyLight.position.set(-6, 11, 6);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  scene.add(keyLight);
  const rim = new THREE.PointLight(0x3cbdff, 4, 12, 2);
  rim.position.set(0, 4, -2);
  scene.add(rim);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(36, 30),
    new THREE.MeshStandardMaterial({ color: 0x071014, roughness: 0.93, metalness: 0.05 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.24;
  ground.receiveShadow = true;
  scene.add(ground);

  const hexGeometry = new THREE.CylinderGeometry(1, 1, 0.16, 6, 1, false, Math.PI / 6);
  const hexTopGeometry = new THREE.CylinderGeometry(0.91, 0.91, 0.035, 6, 1, false, Math.PI / 6);
  const ringGeometry = new THREE.TorusGeometry(0.66, 0.075, 8, 36);

  function posFor(tile, map) {
    const x = (tile.col + (tile.row & 1 ? 0.5 : 0)) * Math.sqrt(3);
    const z = tile.row * 1.5;
    const centerX = ((map.cols - 1) * Math.sqrt(3) + 0.5) / 2;
    const centerZ = ((map.rows - 1) * 1.5) / 2;
    return new THREE.Vector3(x - centerX, 0, z - centerZ);
  }

  function key(tile) { return `${tile.row},${tile.col}`; }
  function hasTile(list, tile) { return list.some((entry) => entry.row === tile.row && entry.col === tile.col); }

  function makeMaterial(color, options = {}) {
    return new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.16, ...options });
  }

  function addMarker(position, color, type) {
    const group = new THREE.Group();
    group.position.copy(position);
    if (type === "energy") {
      const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 0), makeMaterial(color, { emissive: color, emissiveIntensity: 1.15, roughness: 0.28 }));
      crystal.position.y = 0.54;
      crystal.rotation.y = Math.PI / 4;
      group.add(crystal);
      const glow = new THREE.PointLight(color, 2.5, 3.2, 2);
      glow.position.y = 0.75;
      group.add(glow);
      group.userData.pulse = true;
    } else if (type === "objective") {
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.78, 0.11, 32), makeMaterial(0x41220e, { emissive: color, emissiveIntensity: 0.33, metalness: 0.38 }));
      disc.position.y = 0.15;
      group.add(disc);
      const ring = new THREE.Mesh(ringGeometry, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.96 }));
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.25;
      group.add(ring);
      const beacon = new THREE.PointLight(color, 3.2, 4.8, 2);
      beacon.position.y = 1.25;
      group.add(beacon);
      group.userData.pulse = true;
    } else if (type === "flame") {
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.7, 6), makeMaterial(color, { emissive: color, emissiveIntensity: 1.4, roughness: 0.3 }));
      flame.position.y = 0.45;
      group.add(flame);
      const glow = new THREE.PointLight(color, 1.5, 2.6, 2);
      glow.position.y = 0.45;
      group.add(glow);
      group.userData.pulse = true;
    }
    board.add(group);
  }

  function addThinWall(a, b, map) {
    const from = posFor(a, map);
    const to = posFor(b, map);
    const center = from.clone().add(to).multiplyScalar(0.5);
    const direction = to.clone().sub(from);
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.72, 1.05), makeMaterial(0x987d50, { metalness: 0.45, roughness: 0.5 }));
    wall.position.copy(center);
    wall.position.y = 0.34;
    wall.rotation.y = Math.atan2(direction.x, direction.z);
    wall.castShadow = true;
    board.add(wall);
  }

  function addHero(fighter, map) {
    if (!fighter.visible) return;
    const position = posFor(fighter.position, map);
    const teamColor = fighter.team === "player" ? palette.player : palette.enemy;
    const group = new THREE.Group();
    group.position.copy(position);
    group.position.y = 0.16;
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.53, 0.64, 0.2, 6, 1, false, Math.PI / 6), makeMaterial(0x162b36, { metalness: 0.5, roughness: 0.37 }));
    base.castShadow = true;
    group.add(base);
    const ring = new THREE.Mesh(ringGeometry, new THREE.MeshBasicMaterial({ color: fighter.active ? 0xffd75c : teamColor, transparent: true, opacity: 0.98 }));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.13;
    group.add(ring);

    if (fighter.heroId === "classic" && window.JiCharacterModels?.createClassicWarrior) {
      const warrior = window.JiCharacterModels.createClassicWarrior(THREE, { teamColor, scale: 0.58 });
      warrior.position.y = 0.13;
      warrior.rotation.y = fighter.team === "player" ? -0.25 : Math.PI + 0.25;
      group.add(warrior);
      group.userData.animateClassicWarrior = warrior.userData.animateClassicWarrior;
      group.userData.warriorModel = warrior;
    } else {

      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xffffff, transparent: true, depthWrite: false }));
      sprite.position.y = 0.85;
      sprite.scale.set(1.13, 1.13, 1);
      if (fighter.avatar) {
        let texture = textureCache.get(fighter.avatar);
        if (!texture) {
          texture = new THREE.TextureLoader().load(fighter.avatar, () => render());
          texture.colorSpace = THREE.SRGBColorSpace;
          textureCache.set(fighter.avatar, texture);
        }
        sprite.material.map = texture;
        sprite.material.needsUpdate = true;
      } else {
        sprite.material.color.set(teamColor);
      }
      group.add(sprite);
    }
    group.userData.bob = fighter.active ? 0.16 : 0.07;
    group.userData.hero = true;
    board.add(group);
  }

  function rebuild(next) {
    snapshot = next;
    tileTargets.splice(0, tileTargets.length);
    while (board.children.length) {
      const child = board.children.pop();
      child.traverse((node) => {
        if (node.geometry && ![hexGeometry, hexTopGeometry, ringGeometry].includes(node.geometry)) node.geometry.dispose?.();
        if (node.material && !node.material.map) node.material.dispose?.();
      });
    }
    if (!snapshot?.rows) return;
    const thinWalls = new Set(snapshot.thinWalls || []);
    for (let row = 0; row < snapshot.rows; row += 1) {
      for (let col = 0; col < snapshot.cols; col += 1) {
        const tile = { row, col };
        const position = posFor(tile, snapshot);
        const isWall = hasTile(snapshot.walls, tile);
        const reachable = hasTile(snapshot.reachable, tile);
        const isPath = hasTile(snapshot.path, tile);
        const targetable = hasTile(snapshot.targetable, tile);
        const selected = hasTile(snapshot.selectedTargets, tile);
        const baseColor = isWall ? palette.wall : selected ? 0xf5c359 : targetable ? palette.target : isPath ? palette.path : reachable ? palette.reachable : palette.floor;
        const tileMesh = new THREE.Mesh(hexGeometry, makeMaterial(baseColor, { emissive: selected ? 0x7e5910 : targetable ? 0x3b1110 : isPath ? 0x553a09 : 0x000000, emissiveIntensity: selected || targetable || isPath ? 0.62 : 0 }));
        tileMesh.position.copy(position);
        tileMesh.receiveShadow = true;
        tileMesh.userData.tile = tile;
        board.add(tileMesh);
        tileTargets.push(tileMesh);
        if (isWall) {
          const stone = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.84, 0.68, 6, 1, false, Math.PI / 6), makeMaterial(0x4f5356, { roughness: 0.9, metalness: 0.11 }));
          stone.position.copy(position); stone.position.y = 0.43; stone.castShadow = true; stone.receiveShadow = true; board.add(stone);
        } else {
          const top = new THREE.Mesh(hexTopGeometry, makeMaterial(reachable ? 0x1d5369 : 0x253032, { emissive: reachable ? 0x083c54 : 0, emissiveIntensity: reachable ? 0.5 : 0 }));
          top.position.copy(position); top.position.y = 0.095; top.receiveShadow = true; board.add(top);
          if (hasTile(snapshot.bushes, tile)) {
            const bush = new THREE.Mesh(new THREE.ConeGeometry(0.68, 0.64, 6), makeMaterial(palette.bush, { roughness: 0.95 }));
            bush.position.copy(position); bush.position.y = 0.4; bush.castShadow = true; board.add(bush);
          }
        }
        if (snapshot.objective && key(snapshot.objective) === key(tile)) addMarker(position, palette.objective, "objective");
        if (hasTile(snapshot.energyTiles, tile)) addMarker(position, palette.energy, "energy");
        if (hasTile(snapshot.flames, tile)) addMarker(position, palette.flame, "flame");
      }
    }
    for (const edge of thinWalls) {
      const [left, right] = edge.split("|").map((part) => {
        const [row, col] = part.split(",").map(Number);
        return { row, col };
      });
      if (Number.isInteger(left?.row) && Number.isInteger(right?.row)) addThinWall(left, right, snapshot);
    }
    snapshot.fighters.forEach((fighter) => addHero(fighter, snapshot));
    render();
  }

  function updateCamera() {
    const target = new THREE.Vector3(0, 0, 0);
    camera.position.set(
      Math.sin(yaw) * Math.cos(pitch) * distance,
      Math.sin(pitch) * distance + 2.25,
      Math.cos(yaw) * Math.cos(pitch) * distance,
    );
    camera.lookAt(target);
  }

  function resize() {
    const rect = stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
    render();
  }

  function render() {
    if (stage.hidden) return;
    updateCamera();
    renderer.render(scene, camera);
  }

  function animate(time) {
    const tick = time * 0.001;
    board.children.forEach((child) => {
      if (child.userData.pulse) child.rotation.y = tick * 0.55;
      if (child.userData.hero) child.position.y = 0.16 + Math.sin(tick * 2.2 + child.position.x) * child.userData.bob;
      if (child.userData.warriorModel) child.userData.animateClassicWarrior?.(tick, child.userData.bob / 0.16);
    });
    render();
    requestAnimationFrame(animate);
  }

  function handleCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(tileTargets, false)[0];
    const tile = hit?.object?.userData?.tile;
    if (!tile) return;
    document.querySelector(`#tacticalMap [data-row="${tile.row}"][data-col="${tile.col}"]`)?.click();
  }

  canvas.addEventListener("pointerdown", (event) => {
    dragging = true;
    draggedSinceDown = false;
    pointerStart = { x: event.clientX, y: event.clientY };
    canvas.setPointerCapture?.(event.pointerId);
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const dx = event.clientX - pointerStart.x;
    const dy = event.clientY - pointerStart.y;
    if (Math.abs(dx) + Math.abs(dy) < 3) return;
    draggedSinceDown = true;
    yaw -= dx * 0.008;
    pitch = THREE.MathUtils.clamp(pitch + dy * 0.006, 0.42, 1.05);
    pointerStart = { x: event.clientX, y: event.clientY };
    render();
  });
  canvas.addEventListener("pointerup", (event) => {
    dragging = false;
    canvas.releasePointerCapture?.(event.pointerId);
    if (!draggedSinceDown) handleCanvasClick(event);
  });
  canvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    distance = THREE.MathUtils.clamp(distance + event.deltaY * 0.012, 10.5, 22);
    render();
  }, { passive: false });

  new ResizeObserver(resize).observe(stage);
  window.renderJiTactical3d = rebuild;
  if (window.__JI_TACTICAL_3D_SNAPSHOT__) rebuild(window.__JI_TACTICAL_3D_SNAPSHOT__);
  resize();
  requestAnimationFrame(animate);
}
