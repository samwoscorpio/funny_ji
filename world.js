const canvas = document.querySelector("#worldCanvas");
const loading = document.querySelector("#worldLoading");
const prompt = document.querySelector("#worldPrompt");
const promptText = document.querySelector("#worldPromptText");
const locationLabel = document.querySelector("#worldLocation");
const coordinatesLabel = document.querySelector("#worldCoordinates");
const stateLabel = document.querySelector("#worldState");
const cameraAngleSlider = document.querySelector("#cameraAngleSlider");
const cameraAngleValue = document.querySelector("#cameraAngleValue");
const questTitle = document.querySelector("#questTitle");
const questDescription = document.querySelector("#questDescription");
const questProgress = document.querySelector("#questProgress");
const modal = document.querySelector("#worldModal");
const modalTitle = document.querySelector("#worldModalTitle");
const modalBody = document.querySelector("#worldModalBody");
const modalKicker = document.querySelector("#worldModalKicker");

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x102126);
scene.fog = new THREE.FogExp2(0x102126, 0.022);

const camera = new THREE.PerspectiveCamera(56, 1, 0.1, 120);
const clock = new THREE.Clock();
const player = new THREE.Group();
const playerFacing = new THREE.Vector3(0, 0, 1);
const input = new Set();
const colliders = [];
const interactables = [];
let yaw = Math.PI;
let cameraAngle = Number(cameraAngleSlider.value);
let isDragging = false;
let lastPointer = { x: 0, y: 0 };
let questStage = Number(localStorage.getItem("ji-world-quest-stage") || 0);
let currentInteraction = null;

const materials = {
  stone: new THREE.MeshStandardMaterial({ color: 0x536366, roughness: 0.92, metalness: 0.05 }),
  stoneDark: new THREE.MeshStandardMaterial({ color: 0x263537, roughness: 1 }),
  gold: new THREE.MeshStandardMaterial({ color: 0xdca84d, emissive: 0x5c3408, emissiveIntensity: 0.45, roughness: 0.36, metalness: 0.65 }),
  cyan: new THREE.MeshStandardMaterial({ color: 0x72e0e8, emissive: 0x176c73, emissiveIntensity: 2.2, roughness: 0.25 }),
  moss: new THREE.MeshStandardMaterial({ color: 0x4d7b49, roughness: 1 }),
  red: new THREE.MeshStandardMaterial({ color: 0x8b3131, emissive: 0x260708, emissiveIntensity: 0.4, roughness: 0.55 }),
  cloth: new THREE.MeshStandardMaterial({ color: 0x264b57, roughness: 0.8 }),
  skin: new THREE.MeshStandardMaterial({ color: 0xcf9b73, roughness: 0.9 }),
};

function addBox({ x, z, width, depth, height, material = materials.stone, collider = true }) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.position.set(x, height / 2, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  if (collider) colliders.push({ minX: x - width / 2, maxX: x + width / 2, minZ: z - depth / 2, maxZ: z + depth / 2 });
  return mesh;
}

function addRock(x, z, scale = 1) {
  const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(scale, 0), materials.stone);
  rock.position.set(x, scale * .55, z);
  rock.scale.set(1.2, .82, .95);
  rock.rotation.set(Math.random(), Math.random(), Math.random());
  rock.castShadow = true;
  rock.receiveShadow = true;
  scene.add(rock);
  colliders.push({ minX: x - scale, maxX: x + scale, minZ: z - scale, maxZ: z + scale });
}

function addCrystal(x, z, color = materials.cyan) {
  const group = new THREE.Group();
  const core = new THREE.Mesh(new THREE.OctahedronGeometry(.48, 0), color);
  core.position.y = .72;
  core.castShadow = true;
  group.add(core);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.72, .055, 8, 36), materials.gold);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = .15;
  group.add(ring);
  group.position.set(x, 0, z);
  group.userData.animate = (time) => { core.position.y = .72 + Math.sin(time * 2 + x) * .12; ring.rotation.z = time * .7; };
  scene.add(group);
  return group;
}

function makeHero() {
  const factory = window.JiCharacterModels?.createClassicWarrior;
  if (factory) return factory(THREE, { teamColor: 0x72e0e8, scale: 1.08 });

  const group = new THREE.Group();
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(.28, .36, .88, 8), materials.cloth);
  torso.position.y = .76;
  const head = new THREE.Mesh(new THREE.SphereGeometry(.28, 16, 12), materials.skin);
  head.position.y = 1.45;
  group.add(torso, head);
  return group;
}

function addWatcher() {
  const npc = new THREE.Group();
  const robe = new THREE.Mesh(new THREE.ConeGeometry(.5, 1.2, 7), materials.moss);
  robe.position.y = .6;
  const head = new THREE.Mesh(new THREE.SphereGeometry(.27, 14, 10), materials.skin);
  head.position.y = 1.32;
  const staff = new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, 1.55, 7), materials.gold);
  staff.position.set(.4, .72, 0);
  staff.rotation.z = -.18;
  npc.add(robe, head, staff);
  npc.position.set(-3.2, 0, -1.2);
  npc.userData = {
    type: "npc",
    label: "与守望者交谈",
    interact: () => {
      if (questStage === 0) {
        questStage = 1;
        saveQuest();
        updateQuestUi();
        showModal("守望者", "遗迹的回声", `<p>“据点并不在地图上，它藏在每一次选择之间。”守望者把一枚潮汐徽记交给了你。</p><p>北方的蓝色裂隙已经稳定。靠近它后，按 <strong>E</strong> 进入战术关卡。</p>`);
      } else {
        showModal("守望者", "前路", `<p>蓝色裂隙通向一场小规模战术演练。你可以随时进入，检验英雄和地形的组合。</p>`);
      }
    },
  };
  scene.add(npc);
  interactables.push(npc);
}

function addGateSign(gate, label, tone) {
  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(1.72, .42, .08),
    new THREE.MeshStandardMaterial({ color: tone, emissive: tone, emissiveIntensity: .34, roughness: .42 }),
  );
  sign.position.set(0, 2.18, .04);
  gate.add(sign);
  gate.userData.signLabel = label;
}

function addBattleGate() {
  const gate = new THREE.Group();
  const arch = new THREE.Mesh(new THREE.TorusGeometry(1.15, .14, 10, 28, Math.PI), materials.gold);
  arch.rotation.z = Math.PI / 2;
  arch.position.y = 1.12;
  const portalMaterial = new THREE.MeshBasicMaterial({ color: 0x3bcedb, transparent: true, opacity: .76, side: THREE.DoubleSide });
  const portal = new THREE.Mesh(new THREE.CircleGeometry(.95, 24), portalMaterial);
  portal.position.set(0, 1.08, .03);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.35, .22, 10), materials.stone);
  base.position.y = .11;
  gate.add(arch, portal, base);
  gate.position.set(2.45, 0, -5.4);
  addGateSign(gate, "完整对局", 0x3bcedb);
  gate.userData = {
    type: "gate",
    label: questStage > 0 ? "进入遗迹战术关卡" : "守望者尚未确认裂隙",
    interact: () => {
      if (questStage === 0) {
        showModal("潮汐裂隙", "尚未稳定", "<p>裂隙在低鸣。先去寻找守望者，确认这条道路的来处。</p>");
        return;
      }
      localStorage.setItem("ji-world-last-scene", "tide-frontier");
      window.location.href = "./index.html";
    },
    animate: (time) => { portalMaterial.opacity = .58 + Math.sin(time * 2) * .17; portal.scale.setScalar(1 + Math.sin(time * 2.2) * .04); },
  };
  scene.add(gate);
  interactables.push(gate);
}

function addPracticeGate() {
  const gate = new THREE.Group();
  const arch = new THREE.Mesh(new THREE.TorusGeometry(1.15, .14, 10, 28, Math.PI), materials.gold);
  arch.rotation.z = Math.PI / 2;
  arch.position.y = 1.12;
  const portalMaterial = new THREE.MeshBasicMaterial({ color: 0xe3a84d, transparent: true, opacity: .74, side: THREE.DoubleSide });
  const portal = new THREE.Mesh(new THREE.CircleGeometry(.95, 24), portalMaterial);
  portal.position.set(0, 1.08, .03);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.35, .22, 10), materials.stone);
  base.position.y = .11;
  gate.add(arch, portal, base);
  gate.position.set(-2.25, 0, -5.4);
  addGateSign(gate, "新手练习", 0xe3a84d);
  gate.userData = {
    type: "practice-gate",
    label: "进入经典武者练习地图",
    interact: () => {
      localStorage.setItem("ji-world-last-scene", "tide-frontier");
      window.location.href = "./index.html?tutorial=classic";
    },
    animate: (time) => { portalMaterial.opacity = .55 + Math.sin(time * 2.3 + 1) * .2; portal.scale.setScalar(1 + Math.sin(time * 2.6) * .04); },
  };
  scene.add(gate);
  interactables.push(gate);
}

function setupWorld() {
  const hemi = new THREE.HemisphereLight(0x9de5e9, 0x1e2d22, 3.1);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xf4d5a2, 3.4);
  sun.position.set(-8, 12, 5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -16;
  sun.shadow.camera.right = 16;
  sun.shadow.camera.top = 16;
  sun.shadow.camera.bottom = -16;
  scene.add(sun);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(42, 42), new THREE.MeshStandardMaterial({ color: 0x2a3a38, roughness: 1, metalness: 0 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const grid = new THREE.GridHelper(38, 38, 0x4e888b, 0x274b4f);
  grid.position.y = .012;
  scene.add(grid);

  [-9, 9].forEach((x) => addBox({ x, z: 0, width: 1, depth: 20, height: 2.6, material: materials.stoneDark }));
  [-9, 9].forEach((z) => addBox({ x: 0, z, width: 19, depth: 1, height: 2.6, material: materials.stoneDark }));
  addBox({ x: -5.8, z: 3.1, width: 4.2, depth: .65, height: 1.4 });
  addBox({ x: 5.2, z: 2.6, width: 3.5, depth: .65, height: 1.1 });
  addBox({ x: 5.6, z: -2.6, width: 2.4, depth: .65, height: 1.9 });
  addRock(-5.8, -5.3, .85);
  addRock(5.9, -5.5, 1.1);
  addRock(-1.6, -6.5, .65);
  addCrystal(-5.4, 5.4);
  addCrystal(5.6, 5.1, materials.red);
  addWatcher();
  addBattleGate();
  addPracticeGate();
}

function isBlocked(position) {
  const margin = .42;
  return colliders.some((box) => position.x > box.minX - margin && position.x < box.maxX + margin && position.z > box.minZ - margin && position.z < box.maxZ + margin);
}

function updateCamera() {
  const distance = 6.1;
  const targetHeight = 1.05;
  const height = targetHeight + distance * Math.tan(THREE.MathUtils.degToRad(cameraAngle));
  const offset = new THREE.Vector3(0, height, distance).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
  camera.position.copy(player.position).add(offset);
  camera.lookAt(player.position.x, player.position.y + targetHeight, player.position.z);
}

function nearestInteraction() {
  let closest = null;
  for (const object of interactables) {
    const distance = object.position.distanceTo(player.position);
    if (distance < 2.15 && (!closest || distance < closest.distance)) closest = { object, distance };
  }
  return closest;
}

function updateInteraction() {
  currentInteraction = nearestInteraction();
  if (!currentInteraction) {
    prompt.hidden = true;
    return;
  }
  prompt.hidden = false;
  promptText.textContent = currentInteraction.object.userData.label;
}

function updateQuestUi() {
  if (questStage === 0) {
    questTitle.textContent = "第一章：遗迹的回声";
    questDescription.textContent = "与守望者交谈，确认失落据点的位置。";
    questProgress.style.width = "28%";
  } else {
    questTitle.textContent = "第一章：跨越潮汐";
    questDescription.textContent = "进入蓝色裂隙，完成第一场据点战术演练。";
    questProgress.style.width = "62%";
  }
}

function saveQuest() { localStorage.setItem("ji-world-quest-stage", String(questStage)); }

function showModal(kicker, title, html) {
  modalKicker.textContent = kicker;
  modalTitle.textContent = title;
  modalBody.innerHTML = html;
  modal.hidden = false;
  input.clear();
}

function closeModal() { modal.hidden = true; }

function performInteraction() {
  if (modal.hidden === false) return;
  currentInteraction?.object.userData.interact?.();
}

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function update(delta, elapsed) {
  for (const object of scene.children) object.userData.animate?.(elapsed);
  player.children.forEach((child) => child.userData.animateClassicWarrior?.(elapsed));
  if (!modal.hidden) return;
  const direction = new THREE.Vector3();
  if (input.has("KeyW")) direction.z -= 1;
  if (input.has("KeyS")) direction.z += 1;
  if (input.has("KeyA")) direction.x -= 1;
  if (input.has("KeyD")) direction.x += 1;
  if (direction.lengthSq() > 0) {
    direction.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    const next = player.position.clone().addScaledVector(direction, delta * 3.6);
    if (!isBlocked(next)) player.position.copy(next);
    playerFacing.lerp(direction, Math.min(1, delta * 11));
    player.rotation.y = Math.atan2(playerFacing.x, playerFacing.z);
    stateLabel.textContent = "探索中";
  } else {
    stateLabel.textContent = currentInteraction ? "可交互" : "探索中";
  }
  const x = Math.round(player.position.x * 10) / 10;
  const z = Math.round(player.position.z * 10) / 10;
  coordinatesLabel.textContent = `${x}, ${z}`;
  locationLabel.textContent = player.position.z < -3 ? "潮汐裂隙" : player.position.x < -1 ? "守望者营地" : "起航营地";
  updateInteraction();
}

function render() {
  requestAnimationFrame(render);
  const delta = Math.min(clock.getDelta(), .05);
  const elapsed = clock.elapsedTime;
  update(delta, elapsed);
  updateCamera();
  renderer.render(scene, camera);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") { closeModal(); return; }
  if (event.key.toLowerCase() === "e") { event.preventDefault(); performInteraction(); return; }
  if (["KeyW", "KeyA", "KeyS", "KeyD"].includes(event.code) && modal.hidden) input.add(event.code);
});
document.addEventListener("keyup", (event) => input.delete(event.code));
canvas.addEventListener("pointerdown", (event) => { isDragging = true; lastPointer = { x: event.clientX, y: event.clientY }; canvas.setPointerCapture(event.pointerId); });
canvas.addEventListener("pointermove", (event) => {
  if (!isDragging) return;
  yaw -= (event.clientX - lastPointer.x) * .006;
  lastPointer = { x: event.clientX, y: event.clientY };
});
canvas.addEventListener("pointerup", () => { isDragging = false; });
document.querySelector("#worldHelpBtn").addEventListener("click", () => showModal("潮汐边境", "探索指引", "<p>这是世界地图的第一块可玩区域。使用 <strong>WASD</strong> 移动，拖动鼠标调整第三人称视角；靠近守望者或裂隙后按 <strong>E</strong> 交互。</p><p>蓝色裂隙进入完整的 8×8 对局；金色裂隙进入新手练习，依次学习经典武者与刺客。</p>"));
document.querySelector("#worldBattleBtn").addEventListener("click", () => { window.location.href = "./index.html"; });
document.querySelector("#worldPracticeBtn").addEventListener("click", () => { window.location.href = "./index.html?tutorial=classic"; });
document.querySelector("#worldModalClose").addEventListener("click", closeModal);
modal.addEventListener("click", (event) => { if (event.target === modal) closeModal(); });
cameraAngleSlider.addEventListener("input", () => {
  cameraAngle = Number(cameraAngleSlider.value);
  cameraAngleValue.textContent = `${cameraAngle}°`;
  localStorage.setItem("ji-world-camera-angle", String(cameraAngle));
});
window.addEventListener("resize", resize);

setupWorld();
const savedCameraAngle = Number(localStorage.getItem("ji-world-camera-angle"));
if (savedCameraAngle >= 30 && savedCameraAngle <= 60) {
  cameraAngle = savedCameraAngle;
  cameraAngleSlider.value = String(savedCameraAngle);
  cameraAngleValue.textContent = `${savedCameraAngle}°`;
}
player.add(makeHero());
player.position.set(0, 0, 4.5);
scene.add(player);
resize();
updateQuestUi();
updateCamera();
setTimeout(() => loading.classList.add("is-hidden"), 250);
render();
window.__JI_WORLD_READY__ = true;
