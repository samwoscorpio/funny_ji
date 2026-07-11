/*
 * Tactical presentation layer.  The legacy HEROES, BALANCE and resolveRound
 * functions remain the single source of truth for combat numbers and skills.
 */
(() => {
  const TACTICAL_SETUP_KEY = "ji-tactical-setup-v2";
  const DEFAULT_SPAWNS = {
    duel: { player: { row: 6, col: 1 }, enemy: { row: 1, col: 6 }, enemyB: { row: 6, col: 6 } },
    trio: { player: { row: 6, col: 3 }, enemy: { row: 1, col: 1 }, enemyB: { row: 1, col: 6 } },
    online: { player: { row: 6, col: 1 }, enemy: { row: 1, col: 6 }, enemyB: { row: 6, col: 6 } },
  };
  const INITIAL_ENERGY_TILES = [{ row: 1, col: 3 }, { row: 6, col: 4 }];
  const TACTICAL_MAP = {
    rows: 8,
    cols: 8,
    objective: { row: 3, col: 3 },
    energyTiles: INITIAL_ENERGY_TILES.map((tile) => ({ ...tile })),
    walls: [
      { row: 2, col: 2 }, { row: 2, col: 5 },
      { row: 4, col: 2 }, { row: 4, col: 5 },
    ],
    bushes: [
      { row: 1, col: 4 }, { row: 6, col: 3 },
      { row: 2, col: 0 }, { row: 5, col: 7 },
    ],
  };
  const MOVE_POINTS = 1;
  const OBJECTIVE_TO_WIN = 3;
  const OBJECTIVE_SCORE_COST = 2;
  const OBJECTIVE_RESPAWNS = [
    { row: 1, col: 2 }, { row: 1, col: 3 }, { row: 1, col: 4 }, { row: 1, col: 5 },
    { row: 6, col: 2 }, { row: 6, col: 3 }, { row: 6, col: 4 }, { row: 6, col: 5 },
    { row: 3, col: 1 }, { row: 4, col: 6 },
  ];
  const ROW_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const tacticalUi = {
    round: document.querySelector("#tacticalRound"), phase: document.querySelector("#tacticalPhase"), score: document.querySelector("#tacticalScore"), modeLabel: document.querySelector("#tacticalModeLabel"),
    shell: document.querySelector("#tacticalShell"),
    map: document.querySelector("#tacticalMap"), mapHint: document.querySelector("#mapHint"),
    playerCard: document.querySelector("#playerTacticalCard"), enemyCard: document.querySelector("#enemyTacticalCard"), enemyBCard: document.querySelector("#enemyBTacticalCard"),
    enemyOverview: document.querySelector("#enemyTeamOverview"),
    cards: document.querySelector("#tacticalCards"), filters: document.querySelector("#actionFilters"), preview: document.querySelector("#tacticalPreview"),
    lock: document.querySelector("#tacticalLockBtn"), cancel: document.querySelector("#tacticalCancelBtn"), reset: document.querySelector("#tacticalResetBtn"),
    applyHeroes: document.querySelector("#tacticalApplyHeroes"), playerHero: document.querySelector("#tacticalPlayerHero"), enemyHero: document.querySelector("#tacticalEnemyHero"), enemyBHero: document.querySelector("#tacticalEnemyBHero"), playerName: document.querySelector("#tacticalPlayerName"),
    duelMode: document.querySelector("#tacticalDuelMode"), trioMode: document.querySelector("#tacticalTrioMode"), onlineMode: document.querySelector("#tacticalOnlineMode"), enemyBSettings: document.querySelectorAll(".enemy-b-setting"),
    playerSpawn: document.querySelector("#tacticalPlayerSpawn"), enemySpawn: document.querySelector("#tacticalEnemySpawn"), enemyBSpawn: document.querySelector("#tacticalEnemyBSpawn"), defaultSpawns: document.querySelector("#tacticalDefaultSpawns"),
    spawnSettings: document.querySelector("#tacticalSpawnSettings"), roomSettings: document.querySelector("#tacticalRoomSettings"), createRoom: document.querySelector("#tacticalCreateRoom"), joinRoom: document.querySelector("#tacticalJoinRoom"), roomCode: document.querySelector("#tacticalRoomCode"), roomStatus: document.querySelector("#tacticalRoomStatus"),
    log: document.querySelector("#tacticalLog"), clearLog: document.querySelector("#tacticalClearLog"),
    manual: document.querySelector("#tacticalManualBtn"), history: document.querySelector("#tacticalHistoryBtn"),
    modal: document.querySelector("#tacticalModal"), modalTitle: document.querySelector("#tacticalModalTitle"), modalBody: document.querySelector("#tacticalModalBody"), modalClose: document.querySelector("#tacticalModalClose"),
  };
  let tileTooltipTimer = null;
  let tileTooltip = null;
  let setupBattleMode = "duel";

  state.tactical = {
    phase: "movement",
    selection: "move",
    path: [],
    selectedCardId: null,
    selectedTarget: null,
    selectedTargetId: null,
    selectedTargets: [],
    filter: "available",
    playerScore: 0,
    enemyScore: 0,
    flames: [],
    winReason: "",
    resolving: false,
    battleMode: "duel",
    online: null,
  };

  // resolveRound only needs these card references for its legacy impact flash.
  ui.playerCard = tacticalUi.playerCard;
  ui.enemyCard = tacticalUi.enemyCard;

  function keyOf(position) { return `${position.row},${position.col}`; }
  function sameTile(a, b) { return Boolean(a && b && a.row === b.row && a.col === b.col); }
  function cloneTile(position) { return { row: position.row, col: position.col }; }
  function coordName(position) { return position ? `${ROW_LABELS[position.row]}${position.col + 1}` : "未选择"; }
  function toCube(position) {
    const x = position.col - (position.row - (position.row & 1)) / 2;
    const z = position.row;
    return { x, y: -x - z, z };
  }
  function hexDistance(a, b) {
    const first = toCube(a); const second = toCube(b);
    return Math.max(Math.abs(first.x - second.x), Math.abs(first.y - second.y), Math.abs(first.z - second.z));
  }
  function inBounds(position) { return position.row >= 0 && position.row < TACTICAL_MAP.rows && position.col >= 0 && position.col < TACTICAL_MAP.cols; }
  function containsTile(tiles, position) { return tiles.some((tile) => sameTile(tile, position)); }
  function getEnemyFighters() { return [state.enemy, state.enemyB].filter(Boolean); }
  function getAllTacticalFighters() { return [state.player, ...getEnemyFighters()].filter(Boolean); }
  function getAliveEnemies() { return getEnemyFighters().filter((fighter) => !isFighterDefeated(fighter)); }
  function getFighterById(id) { return getAllTacticalFighters().find((fighter) => fighter.id === id) || null; }
  function getFighterAt(position) { return getAllTacticalFighters().find((fighter) => sameTile(fighter.position, position)) || null; }
  function getOccupiedTiles(exceptFighter = null) { return getAllTacticalFighters().filter((fighter) => fighter !== exceptFighter && !isFighterDefeated(fighter)).map((fighter) => fighter.position); }
  function isWall(position) { return containsTile(TACTICAL_MAP.walls, position); }
  function tileType(position) {
    if (isWall(position)) return "wall";
    if (sameTile(position, TACTICAL_MAP.objective)) return "objective";
    if (containsTile(TACTICAL_MAP.energyTiles, position)) return "energy";
    if (containsTile(TACTICAL_MAP.bushes, position)) return "bush";
    return "floor";
  }
  function directionalNeighbors(position) {
    const diagonalCol = position.row & 1 ? position.col + 1 : position.col - 1;
    return [
      { row: position.row, col: position.col - 1 }, { row: position.row, col: position.col + 1 },
      { row: position.row - 1, col: position.col }, { row: position.row - 1, col: diagonalCol },
      { row: position.row + 1, col: position.col }, { row: position.row + 1, col: diagonalCol },
    ];
  }
  function neighbors(position) {
    return directionalNeighbors(position).filter((tile) => inBounds(tile) && !isWall(tile));
  }
  function getPathEnd(fighter, path = state.tactical.path) { return path.length ? path[path.length - 1] : fighter.position; }
  function isStandable(position, blockedPositions = []) {
    const blocked = Array.isArray(blockedPositions) ? blockedPositions : blockedPositions ? [blockedPositions] : [];
    return inBounds(position) && !isWall(position) && !blocked.some((entry) => sameTile(position, entry));
  }

  function initializeHeroSelects() {
    for (const hero of Object.values(HEROES)) {
      tacticalUi.playerHero.add(new Option(getHeroDisplayName(hero), hero.id));
      tacticalUi.enemyHero.add(new Option(getHeroDisplayName(hero), hero.id));
      tacticalUi.enemyBHero.add(new Option(getHeroDisplayName(hero), hero.id));
    }
    const saved = readHeroSelection();
    tacticalUi.playerHero.value = HEROES[saved.playerHero] ? saved.playerHero : "classic";
    tacticalUi.enemyHero.value = HEROES[saved.enemyHero] ? saved.enemyHero : "guard";
    tacticalUi.enemyBHero.value = HEROES[saved.enemyBHero] ? saved.enemyBHero : "balancedBot";
    tacticalUi.playerName.value = normalizePlayerName(readStorage(STORAGE_KEYS.playerName) || DEFAULT_PLAYER_NAME);
    initializeTacticalSetup();
  }

  function initializeTacticalSetup() {
    for (const select of [tacticalUi.playerSpawn, tacticalUi.enemySpawn, tacticalUi.enemyBSpawn]) {
      select.textContent = "";
      for (let row = 0; row < TACTICAL_MAP.rows; row += 1) {
        for (let col = 0; col < TACTICAL_MAP.cols; col += 1) {
          const position = { row, col };
          if (isWall(position) || sameTile(position, TACTICAL_MAP.objective) || containsTile(TACTICAL_MAP.energyTiles, position)) continue;
          const terrain = containsTile(TACTICAL_MAP.bushes, position) ? " · 草丛" : "";
          select.add(new Option(`${coordName(position)}${terrain}`, `${row},${col}`));
        }
      }
    }
    let saved = {};
    try { saved = JSON.parse(readStorage(TACTICAL_SETUP_KEY) || "{}"); } catch (_) { saved = {}; }
    setupBattleMode = saved.mode === "trio" ? "trio" : saved.mode === "online" ? "online" : "duel";
    setSpawnSelectValue(tacticalUi.playerSpawn, saved.playerSpawn, DEFAULT_SPAWNS[setupBattleMode].player);
    setSpawnSelectValue(tacticalUi.enemySpawn, saved.enemySpawn, DEFAULT_SPAWNS[setupBattleMode].enemy);
    setSpawnSelectValue(tacticalUi.enemyBSpawn, saved.enemyBSpawn, DEFAULT_SPAWNS[setupBattleMode].enemyB);
    syncBattleModeControls();
  }

  function setSpawnSelectValue(select, savedValue, fallback) {
    const fallbackValue = `${fallback.row},${fallback.col}`;
    select.value = [...select.options].some((option) => option.value === savedValue) ? savedValue : fallbackValue;
  }

  function readSpawnSelect(select, fallback) {
    const [row, col] = String(select.value).split(",").map(Number);
    const position = { row, col };
    return inBounds(position) && !isWall(position) && !sameTile(position, TACTICAL_MAP.objective) ? position : cloneTile(fallback);
  }

  function applyDefaultSpawns() {
    const defaults = DEFAULT_SPAWNS[setupBattleMode];
    tacticalUi.playerSpawn.value = `${defaults.player.row},${defaults.player.col}`;
    tacticalUi.enemySpawn.value = `${defaults.enemy.row},${defaults.enemy.col}`;
    tacticalUi.enemyBSpawn.value = `${defaults.enemyB.row},${defaults.enemyB.col}`;
  }

  function syncBattleModeControls() {
    tacticalUi.duelMode.setAttribute("aria-pressed", String(setupBattleMode === "duel"));
    tacticalUi.trioMode.setAttribute("aria-pressed", String(setupBattleMode === "trio"));
    tacticalUi.onlineMode.setAttribute("aria-pressed", String(setupBattleMode === "online"));
    for (const field of tacticalUi.enemyBSettings) field.hidden = setupBattleMode !== "trio";
    tacticalUi.spawnSettings.hidden = setupBattleMode === "online";
    tacticalUi.roomSettings.hidden = setupBattleMode !== "online";
    tacticalUi.applyHeroes.hidden = setupBattleMode === "online";
  }

  function resetTacticalGame() {
    stopTacticalOnlinePolling();
    TACTICAL_MAP.energyTiles = INITIAL_ENERGY_TILES.map(cloneTile);
    state.round = 1;
    const battleMode = setupBattleMode === "online" ? "duel" : setupBattleMode;
    state.mode = battleMode === "trio" ? "tactical-trio" : "cpu";
    state.over = false;
    state.matchRecorded = false;
    state.pendingEndChoice = null;
    state.tactical = { phase: "movement", selection: "move", path: [], selectedCardId: null, selectedTarget: null, selectedTargetId: null, selectedTargets: [], filter: state.tactical?.filter || "available", playerScore: 0, enemyScore: 0, objectiveHeld: { player: false, "ai-a": false, "ai-b": false }, flames: [], winReason: "", resolving: false, battleMode, online: null };
    const playerName = normalizePlayerName(tacticalUi.playerName.value);
    tacticalUi.playerName.value = playerName;
    writeStorage(STORAGE_KEYS.playerName, playerName);
    state.player = makeFighter(playerName, tacticalUi.playerHero.value, { pharmacistLoadout: getPlayerPharmacistLoadout() });
    state.enemy = makeFighter(battleMode === "trio" ? "电脑 A" : "电脑", tacticalUi.enemyHero.value);
    state.enemyB = battleMode === "trio" ? makeFighter("电脑 B", tacticalUi.enemyBHero.value) : null;
    state.player.id = "p1";
    state.enemy.id = "ai-a";
    if (state.enemyB) state.enemyB.id = "ai-b";
    const defaults = DEFAULT_SPAWNS[battleMode];
    const spawns = {
      player: readSpawnSelect(tacticalUi.playerSpawn, defaults.player),
      enemy: readSpawnSelect(tacticalUi.enemySpawn, defaults.enemy),
      enemyB: readSpawnSelect(tacticalUi.enemyBSpawn, defaults.enemyB),
    };
    const spawnList = battleMode === "trio" ? [spawns.player, spawns.enemy, spawns.enemyB] : [spawns.player, spawns.enemy];
    if (new Set(spawnList.map(keyOf)).size !== spawnList.length) {
      Object.assign(spawns, {
        player: cloneTile(defaults.player), enemy: cloneTile(defaults.enemy), enemyB: cloneTile(defaults.enemyB),
      });
      applyDefaultSpawns();
    }
    placeFighter(state.player, spawns.player);
    placeFighter(state.enemy, spawns.enemy);
    if (state.enemyB) placeFighter(state.enemyB, spawns.enemyB);
    state.melee.fighters = getAllTacticalFighters();
    tacticalUi.log.textContent = "";
    const enemyNames = getEnemyFighters().map((fighter) => `${fighter.label}·${getHeroDisplayName(fighter.hero)}`).join("、");
    addTacticalLog(`战局开始：${getHeroDisplayName(state.player.hero)} 对阵 ${enemyNames}。`, "move");
    writeStorage(TACTICAL_SETUP_KEY, JSON.stringify({
      mode: battleMode,
      playerSpawn: tacticalUi.playerSpawn.value,
      enemySpawn: tacticalUi.enemySpawn.value,
      enemyBSpawn: tacticalUi.enemyBSpawn.value,
    }));
    renderTactical();
  }

  function placeFighter(fighter, position) {
    fighter.position = cloneTile(position);
    fighter.maxMovePoints = MOVE_POINTS;
    fighter.movePoints = MOVE_POINTS;
    fighter.plannedPath = [];
    fighter.plannedActionId = null;
    fighter.plannedTarget = null;
    fighter.objectiveProgress = 0;
  }

  function getAvailableTacticalActions(fighter) {
    return [...ACTIONS, ...getHeroActions(fighter)];
  }

  function getActionTargetingMode(action) {
    if (!action) return "none";
    if (action.tacticalEffect === "firebomb") return "tile-pair";
    if (action.kind === "attack") return "adjacent-tile";
    if (action.id === "astrologer-predict") return "enemy-range";
    // In this 1v1 prototype, self-support skills retain their legacy default
    // target.  Priest's ally targeting remains available to the retained melee
    // rules, while the map shell only asks for enemy tiles when required.
    if (["astrologer-drain", "pharmacist-poison", "pharmacist-revive", "dancer-spin", "dancer-grand-spin"].includes(action.id)) return "enemy";
    return "none";
  }

  function getActionRange(action) {
    return action?.range || (action?.kind === "attack" ? 1 : 0);
  }

  function getActionCategory(action) {
    if (action?.kind !== "attack") return action?.kind || "other";
    return action.category || (getActionRange(action) > 1 ? "range-2" : "range-1");
  }

  function getActionCategoryLabel(action) {
    return ({
      charge: "蓄气",
      defense: "防御",
      "range-1": "短攻",
      "range-2": "长攻",
      special: "锦囊",
      skill: "英雄技能",
    })[getActionCategory(action)] || "行动";
  }

  function getSelectedTargets() {
    const selected = state.tactical.selectedTargets || [];
    if (selected.length) return selected.map(cloneTile);
    return state.tactical.selectedTarget ? [cloneTile(state.tactical.selectedTarget)] : [];
  }

  function clearActionTargets() {
    state.tactical.selectedTarget = null;
    state.tactical.selectedTargetId = null;
    state.tactical.selectedTargets = [];
  }

  function getActiveFlame(position) {
    return state.tactical.flames?.find((flame) => flame.activeRound === state.round && sameTile(flame.position, position)) || null;
  }

  function getFirebombTargetableTiles(source = state.player.position) {
    const action = getSelectedAction();
    const selected = getSelectedTargets();
    const candidates = neighbors(source);
    if (!action || action.tacticalEffect !== "firebomb" || selected.length >= action.targetCount) return [];
    if (!selected.length) return candidates;
    return candidates.filter((candidate) => !sameTile(candidate, selected[0]) && hexDistance(candidate, selected[0]) === 1);
  }

  function isValidFirebombTargetPair(source, targets) {
    return targets.length === 2
      && targets.every((target) => hexDistance(source, target) === 1)
      && hexDistance(targets[0], targets[1]) === 1;
  }

  function toggleFirebombTarget(position) {
    const selected = getSelectedTargets();
    const existingIndex = selected.findIndex((target) => sameTile(target, position));
    if (existingIndex >= 0) selected.splice(existingIndex, 1);
    else if (selected.length < 2 && getFirebombTargetableTiles().some((target) => sameTile(target, position))) selected.push(cloneTile(position));
    state.tactical.selectedTargets = selected;
    state.tactical.selectedTarget = selected[0] || null;
  }

  function isWithinAttackRange(source, target, action) {
    const distance = getActionRange(action);
    const steps = hexDistance(source, target);
    if (steps < 1 || steps > distance) return false;
    // A long blade cannot cut through a wall in the intervening grid.
    if (steps === 2) {
      return neighbors(source).some((middle) => hexDistance(middle, target) === 1);
    }
    return true;
  }

  function getReachableTiles(start, maxSteps, blocked) {
    const blockedTiles = Array.isArray(blocked) ? blocked : blocked ? [blocked] : [];
    const seen = new Map([[keyOf(start), { tile: start, steps: 0 }]]);
    const queue = [{ tile: start, steps: 0 }];
    while (queue.length) {
      const current = queue.shift();
      if (current.steps >= maxSteps) continue;
      for (const next of neighbors(current.tile)) {
        if (blockedTiles.some((tile) => sameTile(next, tile)) || seen.has(keyOf(next))) continue;
        const entry = { tile: next, steps: current.steps + 1 };
        seen.set(keyOf(next), entry);
        queue.push(entry);
      }
    }
    return seen;
  }

  function renderTactical() {
    const tactical = state.tactical;
    const visualPhase = state.over ? "finished" : tactical.phase;
    tacticalUi.shell.dataset.phase = visualPhase;
    tacticalUi.shell.classList.toggle("is-targeting", tactical.selection === "target");
    tacticalUi.round.textContent = `第 ${state.round} 回合`;
    tacticalUi.modeLabel.textContent = tactical.battleMode === "online" ? "在线 1v1" : tactical.battleMode === "trio" ? "1v2 围攻" : "1v1 战术";
    tacticalUi.phase.textContent = tactical.phase === "resolving" ? "结算阶段" : state.over ? "对局结束" : tactical.phase === "movement" ? "移动阶段" : "出招阶段";
    tacticalUi.phase.dataset.phase = visualPhase;
    tacticalUi.score.textContent = `据点分 ${tactical.playerScore} : ${tactical.enemyScore}`;
    tacticalUi.score.classList.toggle("score-flash", Boolean(tactical.lastScore));
    const onlineLocked = isTacticalOnline();
    tacticalUi.playerHero.disabled = onlineLocked;
    tacticalUi.enemyHero.disabled = onlineLocked;
    tacticalUi.enemyBHero.disabled = onlineLocked;
    tacticalUi.playerName.disabled = onlineLocked;
    tacticalUi.createRoom.disabled = onlineLocked;
    tacticalUi.joinRoom.disabled = onlineLocked;
    tacticalUi.roomCode.disabled = onlineLocked;
    tacticalUi.mapHint.textContent = getMapHint();
    renderCombatant(tacticalUi.playerCard, state.player, "玩家", "player");
    renderCombatant(tacticalUi.enemyCard, state.enemy, state.enemyB ? "电脑 A" : "敌方", "enemy");
    tacticalUi.enemyBCard.hidden = !state.enemyB;
    if (state.enemyB) renderCombatant(tacticalUi.enemyBCard, state.enemyB, "电脑 B", "enemy");
    renderEnemyTeamOverview();
    renderMap();
    renderCards();
    renderPreview();
  }

  function renderEnemyTeamOverview() {
    const overview = tacticalUi.enemyOverview;
    overview.textContent = "";
    overview.hidden = !state.enemyB;
    if (!state.enemyB) return;

    const heading = document.createElement("div"); heading.className = "enemy-team-heading";
    const title = document.createElement("strong"); title.textContent = "敌方小队";
    const count = document.createElement("span"); count.textContent = `${getAliveEnemies().length}/2`;
    heading.append(title, count);
    const members = document.createElement("div"); members.className = "enemy-team-members";
    const targetable = getTargetableTiles();

    for (const fighter of getEnemyFighters()) {
      const member = document.createElement("button");
      member.type = "button";
      member.className = "enemy-team-member";
      member.dataset.fighterId = fighter.id;
      const isSelected = state.tactical.selectedTargetId === fighter.id;
      const canTarget = state.tactical.phase === "action"
        && state.tactical.selection === "target"
        && targetable.some((tile) => sameTile(tile, fighter.position));
      member.classList.toggle("is-selected", isSelected);
      member.classList.toggle("is-out", isFighterDefeated(fighter));
      member.disabled = !canTarget;
      member.setAttribute("aria-pressed", String(isSelected));

      const avatar = document.createElement("span"); avatar.className = "enemy-team-avatar";
      const source = fighter.heroId === "werewolf" && fighter.flags?.berserk ? HERO_AVATARS.werewolfBerserk : HERO_AVATARS[fighter.heroId];
      if (source) {
        const image = document.createElement("img"); image.src = source; image.alt = "";
        image.addEventListener("error", () => { image.remove(); avatar.textContent = "?"; }, { once: true });
        avatar.append(image);
      } else avatar.textContent = "?";

      const identity = document.createElement("span"); identity.className = "enemy-team-identity";
      const name = document.createElement("strong"); name.textContent = fighter.label;
      const stats = document.createElement("span"); stats.textContent = `${formatTacticalHearts(fighter)} · ${fighter.xp} XP`;
      identity.append(name, stats);
      const stateText = document.createElement("span"); stateText.className = "enemy-team-state";
      stateText.textContent = isFighterDefeated(fighter) ? "出局" : isSelected ? "已选目标" : `位置 ${coordName(fighter.position)}`;
      member.append(avatar, identity, stateText);
      members.append(member);
    }
    overview.append(heading, members);
  }

  function getMapHint() {
    if (state.over) return state.tactical.winReason || "对局结束。点击重开开始新战局。";
    if (isTacticalOnline() && !getTacticalOnline()?.initialized) return "房间已创建，等待另一位玩家加入。";
    if (state.tactical.phase === "resolving") return "双方计划已揭示，正在同时结算。";
    if (state.tactical.phase === "movement") return "先选择至多 1 格移动路径，锁定后双方同时移动。";
    const action = getSelectedAction();
    if (state.tactical.selection === "target" && action?.tacticalEffect === "firebomb") {
      return getSelectedTargets().length ? "继续选择与第一格连续的相邻格。" : "先选择燃烧弹覆盖的第一格。";
    }
    if (state.tactical.selection === "target") {
      return ["adjacent-tile", "enemy-range"].includes(getActionTargetingMode(action))
        ? `选择目标：敌方必须在距离 ${getActionRange(action)} 内。`
        : "选择敌方当前格作为技能目标。";
    }
    if (action) return "行动已选择。确认目标后锁定出招。";
    return "移动已结算。选择一张行动卡开始出招。";
  }

  function renderCombatant(container, fighter, role, side) {
    container.textContent = "";
    const canChangeHero = !isTacticalOnline();
    container.classList.toggle("combatant-selectable", canChangeHero);
    container.tabIndex = canChangeHero ? 0 : -1;
    container.title = canChangeHero ? "点击角色框选择英雄；点击头像查看英雄详情" : "点击头像查看英雄详情";
    container.setAttribute("aria-label", canChangeHero
      ? `${role}${getHeroDisplayName(fighter.hero)}。点击选择英雄，点击头像查看详情`
      : `${role}${getHeroDisplayName(fighter.hero)}。点击头像查看英雄详情`);
    const top = document.createElement("div"); top.className = "combatant-top";
    const copy = document.createElement("div");
    const roleLine = document.createElement("div"); roleLine.className = "combatant-role"; roleLine.textContent = role;
    const name = document.createElement("h2"); name.className = "combatant-name"; name.textContent = getHeroDisplayName(fighter.hero);
    const location = document.createElement("div"); location.className = "combatant-role"; location.textContent = `位置 ${coordName(fighter.position)} · 移动 ${fighter.movePoints}/${fighter.maxMovePoints}`;
    copy.append(roleLine, name, location);
    top.append(copy, makeAvatar(fighter));
    const stats = document.createElement("div"); stats.className = "combatant-stats";
    stats.append(makeStatLine("HP", formatTacticalHearts(fighter), "hp-value"), makeStatLine("XP", String(fighter.xp), "xp-value"));
    const statuses = document.createElement("div"); statuses.className = "status-list";
    const entries = getFighterStatusEntries(fighter);
    if (!entries.length) {
      const pill = document.createElement("span"); pill.className = "status-pill"; pill.textContent = "无状态"; statuses.append(pill);
    } else {
      for (const entry of entries.slice(0, 4)) {
        const pill = document.createElement("span");
        pill.className = `status-pill ${entry.name === "中毒" || entry.name === "致盲" || entry.name === "仇恨" ? "negative" : "positive"}`;
        pill.textContent = entry.text ? `${entry.name} ${entry.text}` : entry.name;
        statuses.append(pill);
      }
    }
    container.append(top, stats, statuses);
    container.classList.toggle("card-shake", false);
    container.classList.toggle("is-targeted", state.tactical.selectedTargetId === fighter.id);
    container.dataset.side = side;
  }

  function makeStatLine(label, value, className) {
    const line = document.createElement("div"); line.className = "stat-line";
    const key = document.createElement("strong"); key.textContent = label;
    const data = document.createElement("span"); data.className = `stat-value ${className}`; data.textContent = value;
    line.append(key, data); return line;
  }

  function formatTacticalHearts(fighter) {
    const trueHearts = fighter.hp > 0 ? formatHearts(fighter.hp) : "";
    const reserveHp = fighter.heroId === "puppet" && fighter.flags?.puppetStandby ? fighter.flags.puppetStandbyHp || 0 : 0;
    const reserveHearts = reserveHp > 0 ? "💙".repeat(reserveHp) : "";
    return [trueHearts, reserveHearts].filter(Boolean).join("") || "0";
  }

  function makeAvatar(fighter) {
    const avatar = document.createElement("div"); avatar.className = "combatant-avatar"; avatar.tabIndex = 0; avatar.title = "查看英雄详情"; avatar.dataset.heroDetails = "true";
    const source = fighter.heroId === "werewolf" && fighter.flags?.berserk ? HERO_AVATARS.werewolfBerserk : HERO_AVATARS[fighter.heroId];
    if (!source) { avatar.textContent = "?"; return avatar; }
    const image = document.createElement("img"); image.src = source; image.alt = getHeroDisplayName(fighter.hero);
    image.addEventListener("error", () => { avatar.textContent = "?"; image.remove(); }, { once: true });
    avatar.append(image); return avatar;
  }

  function renderMap() {
    hideTileTooltip();
    const tactical = state.tactical;
    const pathKeys = new Map(tactical.path.map((tile, index) => [keyOf(tile), index + 1]));
    const reachable = tactical.phase === "movement"
      ? getReachableTiles(state.player.position, MOVE_POINTS, getOccupiedTiles(state.player)) : new Map();
    const targetable = getTargetableTiles();
    tacticalUi.map.textContent = "";
    const columnLabels = document.createElement("div"); columnLabels.className = "hex-column-labels";
    const columnSpacer = document.createElement("span"); columnSpacer.className = "hex-column-spacer"; columnLabels.append(columnSpacer);
    for (let col = 0; col < TACTICAL_MAP.cols; col += 1) {
      const label = document.createElement("span"); label.className = "hex-column-label"; label.textContent = String(col + 1); columnLabels.append(label);
    }
    tacticalUi.map.append(columnLabels);
    for (let row = 0; row < TACTICAL_MAP.rows; row += 1) {
      const hexRow = document.createElement("div"); hexRow.className = `hex-row ${row & 1 ? "is-offset" : ""}`;
      const rowLabel = document.createElement("span"); rowLabel.className = "hex-row-label"; rowLabel.textContent = ROW_LABELS[row]; hexRow.append(rowLabel);
      const tiles = document.createElement("div"); tiles.className = "hex-row-tiles";
      for (let col = 0; col < TACTICAL_MAP.cols; col += 1) {
        const position = { row, col };
        const terrainType = tileType(position);
        const tile = document.createElement("button"); tile.type = "button"; tile.className = `map-tile hex-tile ${terrainType}`;
        tile.dataset.row = String(row); tile.dataset.col = String(col); tile.setAttribute("role", "gridcell"); tile.setAttribute("aria-label", `${coordName(position)} ${describeTerrain(position)}`);
        const tooltipText = getTileTooltipText(position);
        if (tooltipText) {
          tile.classList.add("has-tile-tooltip");
          tile.addEventListener("mouseenter", () => scheduleTileTooltip(tile, tooltipText));
          tile.addEventListener("mouseleave", hideTileTooltip);
          tile.addEventListener("focus", () => scheduleTileTooltip(tile, tooltipText));
          tile.addEventListener("blur", hideTileTooltip);
        }
        if (reachable.has(keyOf(position)) && !sameTile(position, state.player.position)) tile.classList.add("reachable");
        if (pathKeys.has(keyOf(position))) { tile.classList.add("path"); tile.dataset.step = String(pathKeys.get(keyOf(position))); }
        if (targetable.some((candidate) => sameTile(candidate, position))) tile.classList.add("targetable");
        if (getSelectedTargets().some((candidate) => sameTile(candidate, position))) tile.classList.add("target-selected");
        if (terrainType === "energy" || terrainType === "objective") tile.append(makeMapTargetMarker(terrainType));
        if (getActiveFlame(position)) { tile.classList.add("flame"); tile.append(makeFlameToken()); }
        if (sameTile(position, state.player.position)) tile.append(makeUnitToken(state.player, "player"));
        if (sameTile(position, state.enemy.position)) tile.append(makeUnitToken(state.enemy, "enemy"));
        if (state.enemyB && sameTile(position, state.enemyB.position)) tile.append(makeUnitToken(state.enemyB, "enemy-b"));
        if (isWall(position)) tile.setAttribute("aria-disabled", "true");
        tile.disabled = state.over || tactical.phase === "resolving" || tactical.phase === "finished" || (tactical.phase === "action" && tactical.selection !== "target");
        tiles.append(tile);
      }
      hexRow.append(tiles);
      tacticalUi.map.append(hexRow);
    }
  }

  function describeTerrain(position) {
    const terrain = ({ floor: "地面", wall: "墙", bush: "草丛", energy: "能量点", objective: "中央据点" })[tileType(position)];
    return getActiveFlame(position) ? `${terrain}，火焰` : terrain;
  }
  function getTileTooltipText(position) {
    if (getActiveFlame(position)) return "火焰：本回合防御低于 1 时会失去 1 HP。";
    return ({
      wall: "墙壁：无法进入，并会阻挡长攻。",
      bush: "草丛：可以进入，目前不提供额外效果。",
      energy: "能量点：回合结束获得 1 XP，随后随机刷新。",
      objective: "据点：连续占据并支付 2 XP 可获得 1 分。",
    })[tileType(position)] || "";
  }

  function scheduleTileTooltip(tile, text) {
    hideTileTooltip();
    tileTooltipTimer = window.setTimeout(() => {
      if (!tile.isConnected) return;
      const tooltip = document.createElement("div"); tooltip.className = "tile-property-tooltip"; tooltip.textContent = text;
      document.body.append(tooltip);
      const rect = tile.getBoundingClientRect();
      const width = tooltip.offsetWidth;
      let left = rect.right + 8;
      if (left + width > window.innerWidth - 8) left = rect.left - width - 8;
      tooltip.style.left = `${Math.max(8, left)}px`;
      tooltip.style.top = `${Math.max(8, rect.top + rect.height / 2 - tooltip.offsetHeight / 2)}px`;
      tileTooltip = tooltip;
    }, 1000);
  }

  function hideTileTooltip() {
    if (tileTooltipTimer) window.clearTimeout(tileTooltipTimer);
    tileTooltipTimer = null;
    if (tileTooltip) tileTooltip.remove();
    tileTooltip = null;
  }
  function makeMapTargetMarker(type) {
    const marker = document.createElement("span");
    marker.className = `map-target-marker ${type}`;
    marker.setAttribute("aria-hidden", "true");
    return marker;
  }
  function makeFlameToken() { const flame = document.createElement("span"); flame.className = "flame-token"; flame.setAttribute("aria-hidden", "true"); return flame; }
  function makeUnitToken(fighter, side) {
    const unit = document.createElement("span"); unit.className = `unit-token ${side}`; unit.title = `${getHeroDisplayName(fighter.hero)} ${formatHearts(Math.max(0, fighter.hp))}`;
    if (isFighterDefeated(fighter)) { unit.classList.add("is-out"); unit.textContent = "OUT"; return unit; }
    const source = fighter.heroId === "werewolf" && fighter.flags?.berserk ? HERO_AVATARS.werewolfBerserk : HERO_AVATARS[fighter.heroId];
    if (!source) { unit.textContent = side === "player" ? "你" : side === "enemy-b" ? "B" : "A"; return unit; }
    const image = document.createElement("img"); image.src = source; image.alt = ""; image.addEventListener("error", () => { image.remove(); unit.textContent = side === "player" ? "你" : side === "enemy-b" ? "B" : "A"; }, { once: true }); unit.append(image); return unit;
  }

  function getTargetableTiles() {
    if (state.tactical.phase !== "action" || state.tactical.selection !== "target") return [];
    const action = getSelectedAction(); const mode = getActionTargetingMode(action);
    if (mode === "tile-pair") return getFirebombTargetableTiles();
    const candidates = getAliveEnemies().filter((fighter) => {
      if (!canActionTargetFighter(action, fighter, state.player)) return false;
      if (["adjacent-tile", "enemy-range"].includes(mode)) return isWithinAttackRange(state.player.position, fighter.position, action);
      return mode === "enemy";
    });
    if (action?.effects?.revive) return getEnemyFighters().filter((fighter) => isFighterDefeated(fighter) && canActionTargetFighter(action, fighter, state.player)).map((fighter) => cloneTile(fighter.position));
    if (["adjacent-tile", "enemy-range", "enemy"].includes(mode)) return candidates.map((fighter) => cloneTile(fighter.position));
    return [];
  }

  function renderCards() {
    tacticalUi.cards.textContent = "";
    const selected = state.tactical.selectedCardId;
    const allActions = getAvailableTacticalActions(state.player).filter((action) => actionMatchesFilter(action, state.tactical.filter));
    tacticalUi.cards.classList.toggle("has-many-actions", allActions.length > 6);
    for (const action of allActions) {
      const available = canUseAction(state.player, action) && !state.over && state.tactical.phase === "action" && (!isTacticalOnline() || getTacticalOnline()?.initialized) && !state.tactical.resolving;
      const category = getActionCategory(action);
      const card = document.createElement("button"); card.type = "button"; card.className = `tactical-card ${action.kind} ${category}`; card.dataset.actionId = action.id;
      card.disabled = !available; card.classList.toggle("selected", selected === action.id); card.setAttribute("aria-pressed", String(selected === action.id));
      const top = document.createElement("div"); top.className = "card-top";
      const title = document.createElement("strong"); title.className = "card-title"; title.textContent = action.name;
      const cost = document.createElement("span"); cost.className = "card-cost"; cost.textContent = String(getCost(state.player, action));
      top.append(title, cost);
      const group = document.createElement("span"); group.className = "card-group"; group.textContent = getActionCategoryLabel(action);
      const specs = document.createElement("div"); specs.className = "card-specs";
      for (const [label, value] of getCardSpecEntries(action, state.player)) {
        const spec = document.createElement("span");
        const specLabel = document.createElement("b"); specLabel.textContent = label;
        const specValue = document.createElement("strong"); specValue.textContent = value;
        spec.append(specLabel, specValue); specs.append(spec);
      }
      const text = document.createElement("span"); text.className = "card-text"; text.textContent = getCardEffectText(action, state.player);
      const target = document.createElement("span"); target.className = "card-target"; target.textContent = targetModeLabel(action);
      card.append(top, group, specs, text, target); tacticalUi.cards.append(card);
    }
  }

  function getCardSpecEntries(action, fighter) {
    if (action.kind === "charge") return [["获得", `+${getXpGain(fighter, action)} XP`], ["防御", formatDefense(getDefense(fighter, action))]];
    if (action.kind === "defense") return [["防御", formatDefense(getDefense(fighter, action))], ["范围", "全局"]];
    if (action.kind === "attack") return [["强度", String(getAttack(fighter, action))], ["距离", String(getActionRange(action))]];
    const entries = [["类型", "技能"]];
    if (getActionRange(action)) entries.push(["距离", String(getActionRange(action))]);
    else if (getDefense(fighter, action) > 0) entries.push(["防御", formatDefense(getDefense(fighter, action))]);
    return entries;
  }

  function getCardEffectText(action, fighter) {
    if (action.kind === "charge") return `本回合获得 ${getXpGain(fighter, action)} XP。`;
    if (action.kind === "defense") return "本回合获得全局防御。";
    if (action.kind === "attack") return action.tacticalEffect === "firebomb" ? "覆盖两个连续相邻格，并留下火焰。" : "命中时造成伤害。";
    return action.text || describeAction(action, fighter);
  }

  function actionMatchesFilter(action, filter) {
    if (filter === "available") return canUseAction(state.player, action);
    return filter === "all" || getActionCategory(action) === filter;
  }

  function cycleAvailableAction() {
    if (state.over || state.tactical.phase !== "action") return;
    const actions = getAvailableTacticalActions(state.player)
      .filter((action) => actionMatchesFilter(action, state.tactical.filter) && canUseAction(state.player, action));
    if (!actions.length) return;
    const currentIndex = actions.findIndex((action) => action.id === state.tactical.selectedCardId);
    const nextAction = actions[(currentIndex + 1) % actions.length];
    state.tactical.selectedCardId = nextAction.id;
    clearActionTargets();
    state.tactical.selection = getActionTargetingMode(nextAction) === "none" ? "action" : "target";
    renderTactical();
  }

  function targetModeLabel(action) {
    const mode = getActionTargetingMode(action);
    if (mode === "tile-pair") return "选择两个连续的相邻格";
    return ["adjacent-tile", "enemy-range"].includes(mode) ? `需要选择 ${getActionRange(action)} 格内目标` : mode === "enemy" ? "需要选择敌方目标格" : "不需要目标";
  }

  function renderPreview() {
    const action = getSelectedAction(); const targetMode = getActionTargetingMode(action);
    const moving = state.tactical.phase === "movement";
    const validation = moving ? validateMovementPlan() : validateActionPlan();
    const entries = [
      ["起点", coordName(state.player.position)],
      ["移动", state.tactical.path.length ? [state.player.position, ...state.tactical.path].map(coordName).join(" → ") : "原地不动"],
      ["终点", coordName(getPathEnd(state.player))],
      ["行动", moving ? "移动结算后选择" : action ? action.name : "尚未选择"],
      ["费用", action ? `${getCost(state.player, action)} XP` : "-"],
      ["目标", targetMode === "none" ? "无需目标" : state.tactical.selectedTargetId ? getFighterById(state.tactical.selectedTargetId)?.label || "未选择" : getSelectedTargets().length ? getSelectedTargets().map(coordName).join(" + ") : "未选择"],
      ["状态", validation.ok ? "可以锁定" : validation.reason],
    ];
    tacticalUi.preview.textContent = "";
    for (const [term, description] of entries) {
      const wrap = document.createElement("div"); const dt = document.createElement("dt"); const dd = document.createElement("dd");
      dt.textContent = term; dd.textContent = description; if (term === "状态") dd.className = validation.ok ? "plan-ok" : "plan-error"; wrap.append(dt, dd); tacticalUi.preview.append(wrap);
    }
    tacticalUi.lock.textContent = moving ? "锁定移动" : "锁定行动";
    tacticalUi.lock.disabled = !validation.ok || !["movement", "action"].includes(state.tactical.phase) || state.over;
    tacticalUi.cancel.disabled = !["movement", "action"].includes(state.tactical.phase) || (!state.tactical.path.length && !action && !getSelectedTargets().length);
  }

  function getSelectedAction() { return state.tactical.selectedCardId ? getActionById(state.tactical.selectedCardId, state.player) : null; }
  function validateMovementPlan() {
    if (state.over) return { ok: false, reason: "对局已结束" };
    if (isTacticalOnline() && !getTacticalOnline()?.initialized) return { ok: false, reason: "等待对手加入" };
    if (state.tactical.resolving) return { ok: false, reason: "正在等待同步结算" };
    if (state.tactical.path.length > MOVE_POINTS) return { ok: false, reason: "移动超过 1 格" };
    return { ok: true, reason: "可以锁定移动" };
  }

  function validateActionPlan() {
    const action = getSelectedAction();
    if (state.over) return { ok: false, reason: "对局已结束" };
    if (isTacticalOnline() && !getTacticalOnline()?.initialized) return { ok: false, reason: "等待对手加入" };
    if (state.tactical.resolving) return { ok: false, reason: "正在等待同步结算" };
    if (!action) return { ok: false, reason: "请选择一张行动卡" };
    if (!canUseAction(state.player, action)) return { ok: false, reason: "此行动当前不可用" };
    const mode = getActionTargetingMode(action);
    if (mode === "tile-pair" && !isValidFirebombTargetPair(state.player.position, getSelectedTargets())) return { ok: false, reason: "请选择两个连续的相邻格" };
    if (["adjacent-tile", "enemy-range", "enemy"].includes(mode) && !state.tactical.selectedTargetId) return { ok: false, reason: "请选择一个敌方目标" };
    const selectedFighter = getFighterById(state.tactical.selectedTargetId);
    if (selectedFighter && !canActionTargetFighter(action, selectedFighter, state.player)) return { ok: false, reason: "当前状态无法选择该目标" };
    if (["adjacent-tile", "enemy-range"].includes(mode) && (!selectedFighter || !isWithinAttackRange(state.player.position, selectedFighter.position, action))) return { ok: false, reason: `敌方不在 ${getActionRange(action)} 格目标范围` };
    if (mode !== "none" && !getSelectedTargets().length) return { ok: false, reason: "请选择目标格" };
    return { ok: true, reason: "可以锁定" };
  }

  function handleMapClick(event) {
    const tile = event.target.closest(".map-tile"); if (!tile || !["movement", "action"].includes(state.tactical.phase) || state.over) return;
    const position = { row: Number(tile.dataset.row), col: Number(tile.dataset.col) };
    if (state.tactical.phase === "action" && state.tactical.selection === "target") {
      const action = getSelectedAction();
      if (action?.tacticalEffect === "firebomb") toggleFirebombTarget(position);
      else if (getTargetableTiles().some((candidate) => sameTile(candidate, position))) {
        state.tactical.selectedTarget = position;
        state.tactical.selectedTargets = [cloneTile(position)];
        state.tactical.selectedTargetId = getFighterAt(position)?.id || null;
      }
      renderTactical(); return;
    }
    if (state.tactical.phase === "movement") editPlayerPath(position);
    renderTactical();
  }

  function handleEnemyOverviewClick(event) {
    const member = event.target.closest("[data-fighter-id]");
    if (!member || member.disabled || state.tactical.phase !== "action" || state.tactical.selection !== "target") return;
    const fighter = getFighterById(member.dataset.fighterId);
    const action = getSelectedAction();
    if (!fighter || !action || !getTargetableTiles().some((tile) => sameTile(tile, fighter.position))) return;
    state.tactical.selectedTarget = cloneTile(fighter.position);
    state.tactical.selectedTargetId = fighter.id;
    state.tactical.selectedTargets = [cloneTile(fighter.position)];
    renderTactical();
  }

  function editPlayerPath(position) {
    const path = state.tactical.path; const player = state.player;
    if (sameTile(position, player.position)) { state.tactical.path = []; return; }
    const existingIndex = path.findIndex((tile) => sameTile(tile, position));
    if (existingIndex >= 0) { state.tactical.path = path.slice(0, existingIndex + 1); return; }
    if (path.length >= MOVE_POINTS || !isStandable(position, getOccupiedTiles(player))) return;
    const previous = path.length ? path[path.length - 1] : player.position;
    if (hexDistance(previous, position) !== 1) return;
    state.tactical.path = [...path, position];
  }

  function handleCardClick(event) {
    const card = event.target.closest("[data-action-id]"); if (!card || card.disabled || state.tactical.phase !== "action") return;
    const actionId = card.dataset.actionId;
    if (state.tactical.selectedCardId === actionId) { state.tactical.selectedCardId = null; clearActionTargets(); state.tactical.selection = "action"; }
    else { state.tactical.selectedCardId = actionId; clearActionTargets(); state.tactical.selection = getActionTargetingMode(getSelectedAction()) === "none" ? "action" : "target"; }
    renderTactical();
  }

  function cancelPlan() {
    if (state.tactical.phase === "movement") state.tactical.path = [];
    if (state.tactical.phase === "action") { state.tactical.selectedCardId = null; clearActionTargets(); state.tactical.selection = "action"; }
    renderTactical();
  }
  function setFilter(event) { const button = event.target.closest("[data-filter]"); if (!button) return; state.tactical.filter = button.dataset.filter; for (const item of tacticalUi.filters.querySelectorAll("button")) item.setAttribute("aria-pressed", String(item === button)); renderCards(); }

  function bfsPath(start, goals, blocked = []) {
    const blockedTiles = Array.isArray(blocked) ? blocked : blocked ? [blocked] : [];
    const goalSet = new Set(goals.map(keyOf)); const queue = [cloneTile(start)]; const routes = new Map([[keyOf(start), []]]);
    while (queue.length) {
      const current = queue.shift(); const route = routes.get(keyOf(current));
      if (goalSet.has(keyOf(current))) return route;
      for (const next of neighbors(current)) {
        if (blockedTiles.some((tile) => sameTile(next, tile)) || routes.has(keyOf(next))) continue;
        routes.set(keyOf(next), [...route, next]); queue.push(next);
      }
    }
    return [];
  }

  function planEnemyMove(enemy) {
    const player = state.player;
    const occupied = getOccupiedTiles(enemy);
    const playerAdjacent = neighbors(player.position).filter((tile) => !occupied.some((entry) => sameTile(tile, entry)));
    let route = bfsPath(enemy.position, playerAdjacent, occupied);
    if (!route.length) route = bfsPath(enemy.position, [TACTICAL_MAP.objective], occupied);
    if (!route.length) route = bfsPath(enemy.position, TACTICAL_MAP.energyTiles, occupied);
    return route.slice(0, MOVE_POINTS);
  }

  function buildEnemyMovementPlan(enemy) {
    return { fighter: enemy, path: planEnemyMove(enemy) };
  }

  function chooseActionForTacticalEnemy(enemy) {
    const originalEnemy = state.enemy;
    state.enemy = enemy;
    let action;
    try { action = chooseEnemyAction(); } finally { state.enemy = originalEnemy; }
    return action || ACTION_BY_ID.ji;
  }

  function buildEnemyActionPlan(enemy) {
    let action = chooseActionForTacticalEnemy(enemy);
    // Once movement is public, the computer should not waste XP on a knife
    // when the player is outside melee range.
    if ((action.kind === "attack" || getActionTargetingMode(action) === "enemy-range") && !isWithinAttackRange(enemy.position, state.player.position, action)) {
      action = ACTION_BY_ID.ji;
    }
    const mode = getActionTargetingMode(action);
    if (mode === "tile-pair") {
      const targets = getEnemyFirebombTargets(enemy);
      if (!targets.length) action = ACTION_BY_ID.ji;
      return { fighter: enemy, actionId: action.id, target: targets };
    }
    return { fighter: enemy, actionId: action.id, targetId: mode === "none" ? null : state.player.id, target: mode === "none" ? null : cloneTile(state.player.position) };
  }

  function getEnemyFirebombTargets(enemy) {
    if (hexDistance(enemy.position, state.player.position) !== 1) return [];
    const candidates = neighbors(enemy.position);
    const playerTile = candidates.find((tile) => sameTile(tile, state.player.position));
    const companion = candidates.find((tile) => playerTile && !sameTile(tile, playerTile) && hexDistance(tile, playerTile) === 1);
    return playerTile && companion ? [cloneTile(playerTile), cloneTile(companion)] : [];
  }

  function resolveSimultaneousMovement(playerPlan, enemyPlan) {
    const playerStart = cloneTile(state.player.position); const enemyStart = cloneTile(state.enemy.position);
    let playerEnd = getPlanEnd(playerStart, playerPlan.path); let enemyEnd = getPlanEnd(enemyStart, enemyPlan.path);
    const swapped = sameTile(playerEnd, enemyStart) && sameTile(enemyEnd, playerStart);
    if (!swapped && sameTile(playerEnd, enemyEnd)) {
      const maxBack = Math.max(playerPlan.path.length, enemyPlan.path.length);
      for (let back = 1; back <= maxBack; back += 1) {
        const p = getPlanEnd(playerStart, playerPlan.path.slice(0, Math.max(0, playerPlan.path.length - back)));
        const e = getPlanEnd(enemyStart, enemyPlan.path.slice(0, Math.max(0, enemyPlan.path.length - back)));
        if (!sameTile(p, e)) { playerEnd = p; enemyEnd = e; return { playerEnd, enemyEnd, conflict: true, swapped: false }; }
      }
      playerEnd = playerStart; enemyEnd = enemyStart;
      return { playerEnd, enemyEnd, conflict: true, swapped: false };
    }
    return { playerEnd, enemyEnd, conflict: false, swapped };
  }
  function resolveGroupMovement(plans) {
    const entries = plans.map((plan) => ({
      fighter: plan.fighter,
      start: cloneTile(plan.fighter.position),
      end: cloneTile(getPlanEnd(plan.fighter.position, plan.path)),
      conflict: false,
    }));
    const destinationGroups = new Map();
    for (const entry of entries) {
      const key = keyOf(entry.end);
      if (!destinationGroups.has(key)) destinationGroups.set(key, []);
      destinationGroups.get(key).push(entry);
    }
    for (const group of destinationGroups.values()) {
      if (group.length < 2) continue;
      for (const entry of group) { entry.end = cloneTile(entry.start); entry.conflict = true; }
    }
    let changed = true;
    while (changed) {
      changed = false;
      for (const entry of entries) {
        if (sameTile(entry.start, entry.end)) continue;
        const occupant = entries.find((candidate) => candidate !== entry && sameTile(candidate.start, entry.end));
        const isSwap = occupant && sameTile(occupant.end, entry.start);
        if (occupant && sameTile(occupant.start, occupant.end) && !isSwap) {
          entry.end = cloneTile(entry.start);
          entry.conflict = true;
          changed = true;
        }
      }
    }
    return entries;
  }
  function getPlanEnd(start, path) { return path.length ? path[path.length - 1] : start; }

  function buildResolvedAction(fighter, opponent, plan, finalPosition, opponentFinalPosition) {
    const base = getActionById(plan.actionId, fighter) || ACTION_BY_ID.ji;
    const action = { ...base };
    const mode = getActionTargetingMode(base);
    if (mode === "tile-pair") {
      const targets = Array.isArray(plan.target) ? plan.target.map(cloneTile) : [];
      action.tacticalFirebomb = true;
      action.tacticalTargets = targets;
      action.tacticalSkipLegacyAttack = true;
      return action;
    }
    if (mode === "adjacent-tile") {
      const hit = sameTile(plan.target, opponentFinalPosition) && isWithinAttackRange(finalPosition, plan.target, base);
      if (!hit) { action.power = 0; action.tacticalMiss = true; }
    }
    if (mode === "enemy-range") {
      const hit = sameTile(plan.target, opponentFinalPosition) && isWithinAttackRange(finalPosition, plan.target, base);
      if (hit) action.tacticalTarget = opponent;
      else action.tacticalMiss = true;
    }
    if (mode === "enemy") action.tacticalTarget = opponent;
    return action;
  }

  function isTacticalOnline() {
    return state.tactical?.battleMode === "online" && Boolean(state.tactical.online?.roomCode);
  }

  function getTacticalOnline() { return state.tactical?.online || null; }
  function getOnlineOpponentSlot(slot) { return slot === "p1" ? "p2" : "p1"; }
  function normalizeTacticalRoomCode(value) { return String(value || "").trim().toUpperCase(); }
  function setTacticalRoomStatus(text) { tacticalUi.roomStatus.textContent = text; }

  function stopTacticalOnlinePolling() {
    const online = getTacticalOnline();
    if (online?.pollTimer) window.clearInterval(online.pollTimer);
    if (online) online.pollTimer = null;
  }

  function startTacticalOnlinePolling() {
    const online = getTacticalOnline();
    if (!online) return;
    stopTacticalOnlinePolling();
    online.pollTimer = window.setInterval(() => { pollTacticalOnlineRoom(); }, 900);
  }

  function makeOnlineFighter(player, fallbackLabel) {
    return makeFighter(player?.name || fallbackLabel, player?.heroId || "classic", {
      pharmacistLoadout: player?.pharmacistLoadout,
    });
  }

  function prepareTacticalOnlineWaitingRoom(online) {
    const playerName = normalizePlayerName(tacticalUi.playerName.value);
    writeStorage(STORAGE_KEYS.playerName, playerName);
    writeStorage(STORAGE_KEYS.heroSelection, JSON.stringify({ playerHero: tacticalUi.playerHero.value, enemyHero: tacticalUi.enemyHero.value, enemyBHero: tacticalUi.enemyBHero.value }));
    state.mode = "tactical-online";
    state.round = 1;
    state.over = false;
    state.matchRecorded = false;
    state.pendingEndChoice = null;
    state.player = makeFighter(playerName, tacticalUi.playerHero.value, { pharmacistLoadout: getPlayerPharmacistLoadout() });
    state.enemy = makeFighter("等待对手", "classic");
    state.player.id = online.slot;
    state.enemy.id = getOnlineOpponentSlot(online.slot);
    placeFighter(state.player, online.slot === "p1" ? DEFAULT_SPAWNS.online.player : DEFAULT_SPAWNS.online.enemy);
    placeFighter(state.enemy, online.slot === "p1" ? DEFAULT_SPAWNS.online.enemy : DEFAULT_SPAWNS.online.player);
    state.enemyB = null;
    state.melee.fighters = [state.player, state.enemy];
    state.tactical = {
      phase: "movement", selection: "move", path: [], selectedCardId: null, selectedTarget: null, selectedTargetId: null, selectedTargets: [],
      filter: state.tactical?.filter || "available", playerScore: 0, enemyScore: 0, objectiveHeld: { p1: false, p2: false }, flames: [], winReason: "", resolving: false, battleMode: "online", online,
    };
    tacticalUi.log.textContent = "";
    addTacticalLog(`房间 ${online.roomCode} 已创建，等待另一位玩家加入。`, "move");
    renderTactical();
  }

  function startTacticalOnlineMatch(room) {
    const online = getTacticalOnline();
    if (!online || !room.players?.p1 || !room.players?.p2) return;
    const opponentSlot = getOnlineOpponentSlot(online.slot);
    state.player = makeOnlineFighter(room.players[online.slot], "玩家");
    state.enemy = makeOnlineFighter(room.players[opponentSlot], "对手");
    state.player.id = online.slot;
    state.enemy.id = opponentSlot;
    state.enemyB = null;
    placeFighter(state.player, online.slot === "p1" ? DEFAULT_SPAWNS.online.player : DEFAULT_SPAWNS.online.enemy);
    placeFighter(state.enemy, online.slot === "p1" ? DEFAULT_SPAWNS.online.enemy : DEFAULT_SPAWNS.online.player);
    state.round = room.round;
    state.over = false;
    state.matchRecorded = false;
    state.pendingEndChoice = null;
    state.melee.fighters = [state.player, state.enemy];
    state.tactical.phase = room.phase || "movement";
    state.tactical.selection = state.tactical.phase === "movement" ? "move" : "action";
    state.tactical.path = [];
    state.tactical.selectedCardId = null;
    clearActionTargets();
    state.tactical.resolving = false;
    online.initialized = true;
    tacticalUi.playerHero.value = state.player.heroId;
    tacticalUi.enemyHero.value = state.enemy.heroId;
    tacticalUi.playerName.value = state.player.label;
    tacticalUi.log.textContent = "";
    addTacticalLog(`在线开局：${getHeroDisplayName(state.player.hero)} 对阵 ${state.enemy.label}·${getHeroDisplayName(state.enemy.hero)}。`, "move");
    setTacticalRoomStatus(`房间 ${room.code}：${state.tactical.phase === "movement" ? "选择移动后锁定" : "选择行动后锁定"}。`);
    renderTactical();
  }

  async function createTacticalOnlineRoom() {
    if (setupBattleMode !== "online") changeBattleMode("online");
    const playerName = normalizePlayerName(tacticalUi.playerName.value);
    tacticalUi.playerName.value = playerName;
    try {
      const data = await apiRequest("/api/rooms", {
        mode: "tactical",
        heroId: tacticalUi.playerHero.value,
        playerName,
        pharmacistLoadout: getPlayerPharmacistLoadout(),
      });
      const online = { roomCode: data.code, playerId: data.playerId, slot: data.slot, initialized: false, pendingPlan: false, polling: false, appliedResults: new Set(), acknowledgedResults: new Set(), pollTimer: null, lastPhaseKey: "" };
      prepareTacticalOnlineWaitingRoom(online);
      tacticalUi.roomCode.value = data.code;
      setTacticalRoomStatus(`房间 ${data.code}：等待对手加入。把房间代码发给对方。`);
      startTacticalOnlinePolling();
    } catch (error) {
      setTacticalRoomStatus(`创建失败：${error.message}`);
    }
  }

  async function joinTacticalOnlineRoom() {
    if (setupBattleMode !== "online") changeBattleMode("online");
    const code = normalizeTacticalRoomCode(tacticalUi.roomCode.value);
    if (!code) { setTacticalRoomStatus("请输入房间代码。"); return; }
    const playerName = normalizePlayerName(tacticalUi.playerName.value);
    tacticalUi.playerName.value = playerName;
    try {
      const data = await apiRequest(`/api/rooms/${code}/join`, {
        heroId: tacticalUi.playerHero.value,
        playerName,
        pharmacistLoadout: getPlayerPharmacistLoadout(),
      });
      const online = { roomCode: data.code, playerId: data.playerId, slot: data.slot, initialized: false, pendingPlan: false, polling: false, appliedResults: new Set(), acknowledgedResults: new Set(), pollTimer: null, lastPhaseKey: "" };
      prepareTacticalOnlineWaitingRoom(online);
      tacticalUi.roomCode.value = data.code;
      setTacticalRoomStatus(`已加入房间 ${data.code}，正在同步战场。`);
      startTacticalOnlinePolling();
      await pollTacticalOnlineRoom();
    } catch (error) {
      setTacticalRoomStatus(`加入失败：${error.message}`);
    }
  }

  function validateOnlinePath(fighter, rawPath) {
    if (!Array.isArray(rawPath)) return [];
    const path = [];
    let previous = fighter.position;
    for (const rawTile of rawPath.slice(0, MOVE_POINTS)) {
      if (!rawTile || !Number.isInteger(rawTile.row) || !Number.isInteger(rawTile.col)) break;
      const tile = { row: rawTile.row, col: rawTile.col };
      if (!isStandable(tile, getOccupiedTiles(fighter)) || hexDistance(previous, tile) !== 1) break;
      path.push(tile);
      previous = tile;
    }
    return path;
  }

  function getOnlineActionPlan(plan) {
    return {
      actionId: plan?.actionId || "ji",
      targetId: null,
      target: Array.isArray(plan?.target) ? plan.target.map(cloneTile) : plan?.target ? cloneTile(plan.target) : null,
    };
  }

  async function lockOnlineTacticalPlan() {
    const online = getTacticalOnline();
    if (!online || !online.initialized || online.pendingPlan || state.tactical.resolving) return;
    const moving = state.tactical.phase === "movement";
    const validation = moving ? validateMovementPlan() : validateActionPlan();
    if (!validation.ok) return;
    const action = getSelectedAction();
    const plan = moving
      ? { phase: "movement", path: state.tactical.path.map(cloneTile) }
      : {
        phase: "action",
        actionId: state.tactical.selectedCardId,
        target: action?.tacticalEffect === "firebomb" ? getSelectedTargets().map(cloneTile) : state.tactical.selectedTarget && cloneTile(state.tactical.selectedTarget),
      };
    online.pendingPlan = true;
    state.tactical.resolving = true;
    renderTactical();
    try {
      await apiRequest(`/api/rooms/${online.roomCode}/action`, { playerId: online.playerId, round: state.round, plan });
      setTacticalRoomStatus(`房间 ${online.roomCode}：已锁定${moving ? "移动" : "行动"}，等待对手。`);
      await pollTacticalOnlineRoom();
    } catch (error) {
      online.pendingPlan = false;
      state.tactical.resolving = false;
      setTacticalRoomStatus(`提交失败：${error.message}`);
      renderTactical();
    }
  }

  async function pollTacticalOnlineRoom() {
    const online = getTacticalOnline();
    if (!online || online.polling || !online.roomCode || !online.playerId) return;
    online.polling = true;
    try {
      const room = await apiGet(`/api/rooms/${online.roomCode}?playerId=${online.playerId}`);
      await syncTacticalOnlineRoom(room);
    } catch (error) {
      setTacticalRoomStatus(`同步失败：${error.message}`);
    } finally {
      online.polling = false;
    }
  }

  async function syncTacticalOnlineRoom(room) {
    const online = getTacticalOnline();
    if (!online || room.mode !== "tactical") return;
    if (!room.players?.p2) {
      setTacticalRoomStatus(`房间 ${room.code}：等待对手加入。`);
      return;
    }
    if (!online.initialized) startTacticalOnlineMatch(room);
    const opponentSlot = getOnlineOpponentSlot(online.slot);
    if (room.result) {
      const resultKey = `${room.result.round}:${room.result.phase}`;
      if (!online.appliedResults.has(resultKey)) {
        online.appliedResults.add(resultKey);
        await applyTacticalOnlineResult(room.result);
      }
      return;
    }
    if (state.over) return;
    const phaseKey = `${room.round}:${room.phase}`;
    if (online.lastPhaseKey !== phaseKey) {
      online.lastPhaseKey = phaseKey;
      state.round = room.round;
      state.tactical.phase = room.phase;
      state.tactical.selection = room.phase === "movement" ? "move" : "action";
      state.tactical.path = [];
      state.tactical.selectedCardId = null;
      clearActionTargets();
      state.tactical.resolving = false;
      online.pendingPlan = false;
      for (const fighter of getAllTacticalFighters()) fighter.movePoints = room.phase === "movement" ? MOVE_POINTS : 0;
      addTacticalLog(room.phase === "movement" ? `第 ${room.round} 回合开始。` : "移动结算完成，开始选择行动。", "move");
      renderTactical();
    }
    const selfSubmitted = room.submitted?.[online.slot];
    const opponentSubmitted = room.submitted?.[opponentSlot];
    if (selfSubmitted && !opponentSubmitted) setTacticalRoomStatus(`房间 ${room.code}：已锁定，等待对手。`);
    else if (!selfSubmitted && opponentSubmitted) setTacticalRoomStatus(`房间 ${room.code}：对手已锁定，请选择${room.phase === "movement" ? "移动" : "行动"}。`);
    else setTacticalRoomStatus(`房间 ${room.code}：请选择${room.phase === "movement" ? "移动" : "行动"}。`);
  }

  async function applyTacticalOnlineResult(result) {
    const online = getTacticalOnline();
    if (!online) return;
    const opponentSlot = getOnlineOpponentSlot(online.slot);
    state.tactical.phase = "resolving";
    state.tactical.resolving = true;
    renderTactical();
    if (result.phase === "movement") {
      const movement = resolveGroupMovement([
        { fighter: state.player, path: validateOnlinePath(state.player, result.plans?.[online.slot]?.path) },
        { fighter: state.enemy, path: validateOnlinePath(state.enemy, result.plans?.[opponentSlot]?.path) },
      ]);
      for (const entry of movement) {
        entry.fighter.position = entry.end;
        entry.fighter.movePoints = 0;
      }
      addTacticalLog(movement.map((entry) => `${entry.fighter.label}→${coordName(entry.end)}`).join("；"), "move");
      if (movement.some((entry) => entry.conflict)) addTacticalLog("移动发生冲突，相关单位留在原位。", "move");
      await pause(150);
    } else {
      const playerPlan = getOnlineActionPlan(result.plans?.[online.slot]);
      const enemyPlan = getOnlineActionPlan(result.plans?.[opponentSlot]);
      playerPlan.targetId = state.enemy.id;
      enemyPlan.targetId = state.player.id;
      const playerAction = buildResolvedAction(state.player, state.enemy, playerPlan, state.player.position, state.enemy.position);
      const enemyAction = buildResolvedAction(state.enemy, state.player, enemyPlan, state.enemy.position, state.player.position);
      if (playerAction.tacticalMiss) addTacticalLog(`${state.player.label}攻击落空，目标不在武器距离内。`, "impact");
      if (enemyAction.tacticalMiss) addTacticalLog(`${state.enemy.label}攻击落空，目标不在武器距离内。`, "impact");
      const report = resolveRound(playerAction, enemyAction);
      applyTacticalFirebombs([{ fighter: state.player, action: playerAction }, { fighter: state.enemy, action: enemyAction }], report);
      applyTacticalFlames([{ fighter: state.player, action: playerAction }, { fighter: state.enemy, action: enemyAction }], report);
      reconcileTacticalOutcome(report);
      for (const item of report.logs) addTacticalLog(item.text, item.kind || "");
      await animateCombat();
      if (!state.over) {
        applyMapResources();
        updateObjective();
      }
      for (const choice of report.endChoices || []) {
        for (const item of applyEndPhaseChoice(choice, chooseAutomaticEndPhaseOption(choice))) addTacticalLog(item.text, item.kind || "");
      }
      if (state.over) finishTacticalMatch();
    }
    online.pendingPlan = false;
    state.tactical.resolving = false;
    renderTactical();
    const resultKey = `${result.round}:${result.phase}`;
    if (online.acknowledgedResults.has(resultKey)) return;
    online.acknowledgedResults.add(resultKey);
    try {
      await apiRequest(`/api/rooms/${online.roomCode}/advance`, { playerId: online.playerId, round: result.round });
      if (state.over) stopTacticalOnlinePolling();
      else setTacticalRoomStatus(`房间 ${online.roomCode}：等待对手确认结算。`);
    } catch (error) {
      setTacticalRoomStatus(`确认结算失败：${error.message}`);
    }
  }

  async function lockPlan() {
    if (isTacticalOnline()) {
      await lockOnlineTacticalPlan();
      return;
    }
    const isMovementPhase = state.tactical.phase === "movement";
    const validation = isMovementPhase ? validateMovementPlan() : validateActionPlan();
    if (!validation.ok || state.tactical.resolving) return;

    if (isMovementPhase) {
      const playerPlan = { fighter: state.player, path: state.tactical.path.map(cloneTile) };
      const enemyPlans = getAliveEnemies().map(buildEnemyMovementPlan);
      state.tactical.phase = "resolving"; state.tactical.resolving = true; renderTactical();
      addTacticalLog("移动锁定：所有单位正在同时移动。", "move");
      await pause(180);
      const movement = resolveGroupMovement([playerPlan, ...enemyPlans]);
      for (const entry of movement) {
        entry.fighter.position = entry.end;
        entry.fighter.movePoints = 0;
      }
      if (movement.some((entry) => entry.conflict)) addTacticalLog("有单位争夺同一格或撞上未移动单位，已留在原位。", "move");
      addTacticalLog(movement.map((entry) => `${entry.fighter.label}→${coordName(entry.end)}`).join("；"), "move");
      state.tactical.phase = "action"; state.tactical.selection = "action"; state.tactical.path = []; state.tactical.resolving = false;
      renderTactical();
      return;
    }

    const selectedAction = getSelectedAction();
    const playerPlan = {
      actionId: state.tactical.selectedCardId,
      targetId: state.tactical.selectedTargetId,
      target: selectedAction?.tacticalEffect === "firebomb"
        ? getSelectedTargets().map(cloneTile)
        : state.tactical.selectedTarget && cloneTile(state.tactical.selectedTarget),
    };
    const enemyPlans = getAliveEnemies().map(buildEnemyActionPlan);
    state.tactical.phase = "resolving"; state.tactical.resolving = true; renderTactical();
    addTacticalLog(`出招锁定：你准备${getActionById(playerPlan.actionId, state.player).name}；敌方小队也已锁定行动。`, "move");
    await pause(220);
    const target = getFighterById(playerPlan.targetId) || state.enemy;
    const playerAction = buildResolvedAction(state.player, target, playerPlan, state.player.position, target.position);
    const resolvedEnemyActions = enemyPlans.map((plan) => ({
      fighter: plan.fighter,
      action: buildResolvedAction(plan.fighter, state.player, plan, plan.fighter.position, state.player.position),
      plan,
    }));
    if (playerAction.tacticalMiss) addTacticalLog(`${state.player.label}攻击目标不在武器距离内，攻击落空。`, "impact");
    for (const entry of resolvedEnemyActions) if (entry.action.tacticalMiss) addTacticalLog(`${entry.fighter.label}攻击目标不在武器距离内，攻击落空。`, "impact");
    const report = state.tactical.battleMode === "trio"
      ? resolveTacticalTrioRound(playerAction, playerPlan, resolvedEnemyActions)
      : resolveRound(playerAction, resolvedEnemyActions[0].action);
    const actionEntries = [{ fighter: state.player, action: playerAction }, ...resolvedEnemyActions];
    applyTacticalFirebombs(actionEntries, report);
    applyTacticalFlames(actionEntries, report);
    reconcileTacticalOutcome(report);
    for (const item of report.logs) addTacticalLog(item.text, item.kind || "");
    await animateCombat();
    if (!state.over) {
      applyMapResources();
      updateObjective();
    }
    if (state.over) { finishTacticalMatch(); return; }
    const manualChoice = report.endChoices?.find((choice) => choice.actor === state.player);
    if (manualChoice) { openEndPhaseChoice(manualChoice); return; }
    for (const choice of report.endChoices || []) {
      for (const item of applyEndPhaseChoice(choice, chooseAutomaticEndPhaseOption(choice))) addTacticalLog(item.text);
    }
    completeTacticalRound();
  }

  function resolveTacticalTrioRound(playerAction, playerPlan, enemyEntries) {
    state.melee.fighters = getAllTacticalFighters();
    const plans = new Map();
    plans.set(state.player.id, {
      fighter: state.player,
      action: buildTacticalMeleeAction(state.player, playerAction, playerPlan.targetId),
      summaryAction: playerAction,
    });
    for (const entry of enemyEntries) {
      plans.set(entry.fighter.id, {
        fighter: entry.fighter,
        action: buildTacticalMeleeAction(entry.fighter, entry.action, entry.plan.targetId),
        summaryAction: entry.action,
      });
    }
    return resolveMeleeRound(plans, { deferCompletion: true });
  }

  function buildTacticalMeleeAction(fighter, action, targetId) {
    const mode = getActionTargetingMode(action);
    if (mode !== "none" && mode !== "tile-pair" && action.kind === "skill" && targetId) {
      return {
        id: `tactical-skill-${fighter.id}`,
        kind: "multitarget-skill",
        name: action.name,
        cost: getCost(fighter, action),
        defense: getDefense(fighter, action),
        xpGain: 0,
        entries: [{ targetId, action }],
      };
    }
    if (action.kind === "attack" && targetId) return { ...action, targetId };
    return action;
  }

  function getCombatantCard(fighter) {
    if (fighter === state.player) return tacticalUi.playerCard;
    if (fighter === state.enemyB) return tacticalUi.enemyBCard;
    return tacticalUi.enemyCard;
  }

  function applyTacticalFirebombs(actionEntries, report) {
    let dealtDamage = false;
    const actionsByFighter = new Map(actionEntries.map((entry) => [entry.fighter.id, entry.action]));
    for (const { fighter: source, action } of actionEntries) {
      if (!action.tacticalFirebomb || !action.tacticalTargets?.length) continue;
      const targets = action.tacticalTargets.map(cloneTile);
      const targetNames = targets.map(coordName).join("、");
      report.logs.push({ kind: "impact", text: `${source.label}投出燃烧弹，向 ${targetNames} 各发射一把小刀。` });

      for (const target of getAllTacticalFighters()) {
        if (!isFighterTargetable(target) || !targets.some((tile) => sameTile(tile, target.position))) continue;
        const targetAction = actionsByFighter.get(target.id) || ACTION_BY_ID.ji;
        const defense = target === source ? getDefense(target, targetAction) : getIncomingDefense(target, targetAction, source);
        const knife = { ...ACTION_BY_ID["atk-1"], id: "firebomb-dagger", name: "燃烧弹·小刀" };
        const attack = getAttack(source, knife, target);
        if (attack > defense) {
          const damageNotes = [];
          const targetCard = getCombatantCard(target);
          const damage = dealDamage(source, target, knife, `${source.label}的燃烧弹小刀击穿${target.label}防御 ${formatDefense(defense)}，${target.label} HP -1。`, report.logs, damageNotes, targetCard);
          dealtDamage ||= damage > 0;
          for (const note of damageNotes) report.logs.push({ text: note });
        } else {
          report.logs.push({ text: `${source.label}的燃烧弹小刀强度 ${attack} 未超过${target.label}防御 ${formatDefense(defense)}。` });
        }
      }

      for (const target of targets) {
        const existing = state.tactical.flames.find((flame) => sameTile(flame.position, target));
        if (existing) existing.activeRound = state.round + 1;
        else state.tactical.flames.push({ position: cloneTile(target), activeRound: state.round + 1 });
      }
      report.logs.push({ kind: "impact", text: `${targetNames} 将在下回合燃起火焰。` });
    }
    if (dealtDamage) report.logs = report.logs.filter((item) => item.text !== "双方都没有造成伤害。");
  }

  function applyTacticalFlames(actionEntries, report) {
    const activeFlames = state.tactical.flames.filter((flame) => flame.activeRound === state.round);
    if (!activeFlames.length) return;

    let dealtDamage = false;
    for (const flame of activeFlames) {
      for (const { fighter, action } of actionEntries) {
        if (!isFighterTargetable(fighter) || !sameTile(fighter.position, flame.position)) continue;
        const defense = getDefense(fighter, action);
        if (defense >= 1) {
          report.logs.push({ text: `${fighter.label}站在 ${coordName(flame.position)} 的火焰中，但防御 ${formatDefense(defense)} 未低于 1。` });
          continue;
        }
        const notes = [];
        const context = { action: { id: "firebomb-flame", kind: "hazard", name: "火焰" }, notes, damage: 1 };
        const damage = Math.max(0, runBeforeTakeDamage(fighter, null, context));
        context.damage = damage;
        if (damage > 0) {
          fighter.hp -= damage;
          runHook(fighter, "afterTakeDamage", fighter, null, context);
          report.logs.push({ kind: "impact", text: `${fighter.label}踩在 ${coordName(flame.position)} 的火焰上，HP -${damage}。` });
          dealtDamage = true;
        } else {
          report.logs.push({ kind: "impact", text: `${fighter.label}踩在 ${coordName(flame.position)} 的火焰上，但未伤及真血。` });
        }
        for (const note of notes) report.logs.push({ text: note });
      }
    }
    state.tactical.flames = state.tactical.flames.filter((flame) => flame.activeRound > state.round);
    if (dealtDamage) report.logs = report.logs.filter((item) => item.text !== "双方都没有造成伤害。");
  }

  function reconcileTacticalOutcome(report) {
    report.logs = report.logs.filter((item) => item.kind !== "win");
    const playerDefeated = isFighterDefeated(state.player);
    const enemiesDefeated = getEnemyFighters().every(isFighterDefeated);
    state.over = playerDefeated || enemiesDefeated;
    if (!state.over) return;

    if (playerDefeated && enemiesDefeated) state.tactical.winReason = "双方阵营同时被击倒，平局。";
    else if (enemiesDefeated) state.tactical.winReason = "敌方小队全部出局，你获得击倒胜利。";
    else state.tactical.winReason = "你的 HP 归零，电脑小队获得击倒胜利。";
    report.logs.push({ kind: "win", text: state.tactical.winReason });
  }

  function applyMapResources() {
    const energySnapshot = TACTICAL_MAP.energyTiles.map(cloneTile);
    const triggeredEnergyTiles = new Set();

    for (const fighter of getAllTacticalFighters()) {
      if (isFighterDefeated(fighter)) continue;
      const energyIndex = energySnapshot.findIndex((tile) => sameTile(tile, fighter.position));
      if (energyIndex < 0) continue;

      fighter.xp += 1;
      triggeredEnergyTiles.add(energyIndex);
      addTacticalLog(`${fighter.label}占据能量点，获得 1 XP。`, "score");
    }

    for (const energyIndex of triggeredEnergyTiles) {
      const nextTile = getRandomEnergyTile(energyIndex);
      TACTICAL_MAP.energyTiles[energyIndex] = nextTile;
      addTacticalLog(`能量点刷新至 ${coordName(nextTile)}。`, "score");
    }
  }

  function getRandomEnergyTile(refreshIndex) {
    const blockedTiles = [
      TACTICAL_MAP.objective,
      ...TACTICAL_MAP.walls,
      ...getAllTacticalFighters().map((fighter) => fighter.position),
      ...TACTICAL_MAP.energyTiles.filter((_, index) => index !== refreshIndex),
      TACTICAL_MAP.energyTiles[refreshIndex],
    ];
    const candidates = [];

    for (let row = 0; row < TACTICAL_MAP.rows; row += 1) {
      for (let col = 0; col < TACTICAL_MAP.cols; col += 1) {
        const tile = { row, col };
        if (!blockedTiles.some((blocked) => sameTile(blocked, tile))) candidates.push(tile);
      }
    }

    const fallback = INITIAL_ENERGY_TILES[refreshIndex] || INITIAL_ENERGY_TILES[0];
    return cloneTile(candidates[getTacticalRandomIndex(candidates.length, `energy-${refreshIndex}`)] || fallback);
  }

  function updateObjective() {
    state.tactical.lastScore = false;
    if (state.over) return;
    resolveObjectiveControl(state.player, "player", "玩家");
    for (const enemy of getEnemyFighters()) resolveObjectiveControl(enemy, enemy.id, enemy.label);
    if (state.tactical.playerScore >= OBJECTIVE_TO_WIN || state.tactical.enemyScore >= OBJECTIVE_TO_WIN) {
      state.over = true;
      const playerWon = state.tactical.playerScore >= OBJECTIVE_TO_WIN;
      state.tactical.winReason = playerWon ? `你率先取得 ${OBJECTIVE_TO_WIN} 分，据点胜利。` : `敌方率先取得 ${OBJECTIVE_TO_WIN} 分，据点胜利。`;
      addTacticalLog(state.tactical.winReason, "score");
    }
  }

  function resolveObjectiveControl(fighter, side, sideLabel) {
    const heldLastRound = Boolean(state.tactical.objectiveHeld[side]);
    const standingOnObjective = !isFighterDefeated(fighter) && sameTile(fighter.position, TACTICAL_MAP.objective);
    fighter.objectiveProgress = standingOnObjective ? 1 : 0;

    if (!standingOnObjective) {
      state.tactical.objectiveHeld[side] = false;
      return;
    }

    if (!heldLastRound) {
      state.tactical.objectiveHeld[side] = true;
      addTacticalLog(`${sideLabel}${fighter.label === "电脑" ? "" : " " + fighter.label}占据中央据点，下一回合守住并支付 ${OBJECTIVE_SCORE_COST} XP 后得分。`, "score");
      return;
    }

    if (fighter.xp < OBJECTIVE_SCORE_COST) {
      state.tactical.objectiveHeld[side] = true;
      addTacticalLog(`${sideLabel}${fighter.label === "电脑" ? "" : " " + fighter.label}守住据点，但 XP 不足 ${OBJECTIVE_SCORE_COST}，暂不计分。`, "score");
      return;
    }

    fighter.xp -= OBJECTIVE_SCORE_COST;
    if (side === "player") state.tactical.playerScore += 1;
    else state.tactical.enemyScore += 1;
    state.tactical.lastScore = true;
    state.tactical.objectiveHeld[side] = false;
    fighter.objectiveProgress = 0;
    fighter.position = getObjectiveRespawn(fighter);
    addTacticalLog(`${sideLabel}${fighter.label === "电脑" ? "" : " " + fighter.label}守住据点并支付 ${OBJECTIVE_SCORE_COST} XP，获得 1 分，刷新至 ${coordName(fighter.position)}。`, "score");
  }

  function getObjectiveRespawn(fighter) {
    const occupied = getOccupiedTiles(fighter);
    const candidates = OBJECTIVE_RESPAWNS.filter((position) => !occupied.some((tile) => sameTile(position, tile)) && !containsTile(TACTICAL_MAP.energyTiles, position));
    return cloneTile(candidates[getTacticalRandomIndex(candidates.length, `objective-${fighter.id || fighter.heroId}`)] || OBJECTIVE_RESPAWNS[0]);
  }

  function getTacticalRandomIndex(length, salt) {
    if (!length) return 0;
    const online = state.tactical?.online;
    if (!online) return Math.floor(Math.random() * length);
    const seed = `${online.roomCode}:${state.round}:${salt}`;
    let hash = 2166136261;
    for (let index = 0; index < seed.length; index += 1) {
      hash ^= seed.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0) % length;
  }

  async function animateCombat() {
    const cards = [tacticalUi.playerCard, tacticalUi.enemyCard, ...(state.enemyB ? [tacticalUi.enemyBCard] : [])];
    for (const card of cards) card.classList.add("card-shake");
    await pause(240);
    for (const card of cards) card.classList.remove("card-shake");
  }
  function pause(ms) { return new Promise((resolve) => window.setTimeout(resolve, ms)); }

  function openEndPhaseChoice(choice) {
    showModal("追索", (body) => {
      const text = document.createElement("p"); text.textContent = `${choice.actor.label}触发追索，请选择结束阶段效果。`; body.append(text);
      const choices = document.createElement("div"); choices.className = "plan-controls";
      const drain = document.createElement("button"); drain.type = "button"; drain.textContent = `令 ${choice.target.label} -1 XP`;
      const gain = document.createElement("button"); gain.type = "button"; gain.textContent = "自己 +1 XP";
      drain.addEventListener("click", () => resolveTacticalEndChoice(choice, "drain")); gain.addEventListener("click", () => resolveTacticalEndChoice(choice, "gain")); choices.append(drain, gain); body.append(choices);
    });
  }
  function resolveTacticalEndChoice(choice, option) { hideModal(); for (const item of applyEndPhaseChoice(choice, option)) addTacticalLog(item.text); completeTacticalRound(); }

  function completeTacticalRound() {
    state.round += 1;
    state.tactical.phase = "movement"; state.tactical.selection = "move"; state.tactical.path = []; state.tactical.selectedCardId = null; clearActionTargets(); state.tactical.resolving = false; state.tactical.lastScore = false;
    for (const fighter of getAllTacticalFighters()) fighter.movePoints = MOVE_POINTS;
    addTacticalLog(`第 ${state.round} 回合开始。`, "move"); renderTactical();
  }

  function finishTacticalMatch() {
    state.tactical.phase = "finished"; state.tactical.resolving = false;
    if (!state.tactical.winReason) {
      const enemiesDefeated = getEnemyFighters().every(isFighterDefeated);
      if (isFighterDefeated(state.player) && enemiesDefeated) state.tactical.winReason = "双方阵营同时被击倒，平局。";
      else if (enemiesDefeated) state.tactical.winReason = "敌方小队全部出局，你获得击倒胜利。";
      else state.tactical.winReason = "你的 HP 归零，电脑小队获得击倒胜利。";
      addTacticalLog(state.tactical.winReason, "impact");
    }
    recordTacticalMatch(); renderTactical();
  }

  function recordTacticalMatch() {
    if (state.matchRecorded) return;
    const enemiesDefeated = getEnemyFighters().every(isFighterDefeated);
    const result = isFighterDefeated(state.player) && enemiesDefeated ? "draw" : enemiesDefeated || state.tactical.playerScore >= OBJECTIVE_TO_WIN ? "win" : "loss";
    const mode = state.tactical.battleMode === "online" ? "tactical-online" : state.tactical.battleMode === "trio" ? "tactical-1v2" : "tactical-cpu";
    const modeLabel = state.tactical.battleMode === "online" ? "在线地图 1v1" : state.tactical.battleMode === "trio" ? "地图 1v2" : "地图 1v1";
    const record = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, playerName: state.player.label, finishedAt: new Date().toISOString(), rounds: state.round, mode, modeLabel, playerHero: getHeroDisplayName(state.player.hero), opponentHeroes: getEnemyFighters().map((fighter) => `${fighter.label}：${getHeroDisplayName(fighter.hero)}`), result, winReason: state.tactical.playerScore >= OBJECTIVE_TO_WIN || state.tactical.enemyScore >= OBJECTIVE_TO_WIN ? "objective" : "knockout" };
    writeMatchHistory([record, ...readMatchHistory()].slice(0, MAX_HISTORY_RECORDS)); state.matchRecorded = true;
  }

  function addTacticalLog(text, kind = "") { const item = document.createElement("li"); if (kind) item.className = `log-${kind}`; item.textContent = `R${state.round} | ${text}`; tacticalUi.log.prepend(item); }

  function showManual() {
    showModal("战术原型说明", (body) => {
      appendSection(body, "基本流程", "每回合先锁定 1 格移动并同时结算；位置稳定后再选择行动卡，同时结算出招。普通攻击只能攻击武器距离内的敌方。移动阶段可用 WASD + Q/E 选择六个方向，Enter 锁定当前阶段。");
      appendSection(body, "地图资源", `能量点在回合结束时提供 1 XP。中央据点需要先占据一回合；下一回合仍守住且拥有 ${OBJECTIVE_SCORE_COST} XP 时，支付 ${OBJECTIVE_SCORE_COST} XP 获得 1 分并被刷新到外围位置。率先获得 ${OBJECTIVE_TO_WIN} 分获胜；HP 归零仍会立即决定击倒胜负。`);
      appendSection(body, "行动卡", "攻击分为短攻（距离 1）、长攻（距离 2）与锦囊。燃烧弹需要选择两个连续相邻格，各格立即受到小刀攻击，并在下回合留下火焰；站在火焰上且本回合防御低于 1 的角色会失去 1 HP，不分敌我。当前没有随机抽牌、牌库或卡组。技能会标注其目标要求；具体效果继续走旧版英雄规则。");
      appendSection(body, "对战模式", "地图为 8×8 六边形战场。1v1 为单人对单个人机；1v2 中两个人机组成同一阵营，你需要击倒两者。在线 1v1 可创建或加入房间，双方先同步移动，再同步行动。开局前可以分别设置英雄与出生点，重复或非法出生点会自动恢复默认布局。");
      appendSection(body, "原型边界", "草丛目前只有地形表现，不提供隐身；在线房间为内存房间，服务重启后房间会失效。");
    });
  }
  function appendSection(parent, title, text) { const heading = document.createElement("h3"); heading.textContent = title; const paragraph = document.createElement("p"); paragraph.textContent = text; parent.append(heading, paragraph); }

  function showHistory() {
    showModal("历史对局", (body) => {
      const records = readMatchHistory().filter((record) => record.playerName === normalizePlayerName(tacticalUi.playerName.value));
      const summary = document.createElement("p"); const wins = records.filter((record) => record.result === "win").length; summary.textContent = `共 ${records.length} 局，胜利 ${wins} 局。`; body.append(summary);
      if (!records.length) { const empty = document.createElement("p"); empty.textContent = "当前昵称还没有完成的对局。"; body.append(empty); return; }
      const list = document.createElement("ul");
      for (const record of records.slice(0, 12)) { const item = document.createElement("li"); item.textContent = `${record.result === "win" ? "胜" : record.result === "loss" ? "负" : "平"} | ${record.playerHero} vs ${record.opponentHeroes.join("，")} | ${record.rounds} 回合${record.winReason ? ` | ${record.winReason === "objective" ? "据点" : "击倒"}胜负` : ""}`; list.append(item); }
      body.append(list);
    });
  }

  function openTacticalHeroPicker(side) {
    const select = side === "player" ? tacticalUi.playerHero : side === "enemy-b" ? tacticalUi.enemyBHero : tacticalUi.enemyHero;
    const title = side === "player" ? "选择你的英雄" : side === "enemy-b" ? "选择电脑 B 英雄" : "选择电脑 A 英雄";
    showModal(title, (body) => {
      const note = document.createElement("p"); note.textContent = "点击英雄即可立即开始一局新对战。头像可在战场角色卡上查看详情。"; body.append(note);
      const grid = document.createElement("div"); grid.className = "tactical-hero-picker";
      for (const hero of Object.values(HEROES)) {
        const choice = document.createElement("button"); choice.type = "button"; choice.className = "tactical-hero-choice";
        choice.classList.toggle("selected", select.value === hero.id);
        const avatar = document.createElement("div"); avatar.className = "tactical-hero-choice-avatar";
        const source = hero.id === "werewolf" ? HERO_AVATARS.werewolf : HERO_AVATARS[hero.id];
        if (source) {
          const image = document.createElement("img"); image.src = source; image.alt = "";
          image.addEventListener("error", () => { image.remove(); avatar.textContent = "?"; }, { once: true }); avatar.append(image);
        } else avatar.textContent = "?";
        const name = document.createElement("strong"); name.textContent = getHeroDisplayName(hero);
        const meta = document.createElement("span"); meta.textContent = `${hero.maxHp} 血，开局 ${hero.startingXp} XP`;
        choice.append(avatar, name, meta);
        choice.addEventListener("click", () => {
          select.value = hero.id;
          hideModal();
          applyHeroChoices();
        });
        grid.append(choice);
      }
      body.append(grid);
    });
  }

  function showTacticalHeroDetail(fighter) {
    const hero = fighter.hero;
    showModal(getHeroDisplayName(hero), (body) => {
      const summary = document.createElement("p"); summary.textContent = `${fighter.startingHp} 血，开局 ${hero.startingXp} XP。${hero.description || ""}`; body.append(summary);
      const lore = document.createElement("p"); lore.className = "tactical-hero-lore"; lore.textContent = HERO_LORE[hero.id] || "此英雄的背景故事仍在雾中。"; body.append(lore);
      appendTacticalHeroSection(body, "被动", hero.passives || [], "无被动");
      appendTacticalHeroSection(body, "主动技能", hero.activeSkills || [], "无主动技能");
    });
  }

  function appendTacticalHeroSection(body, title, entries, emptyText) {
    const heading = document.createElement("h3"); heading.textContent = title; body.append(heading);
    const list = document.createElement("ul"); list.className = "tactical-hero-detail-list";
    if (!entries.length) {
      const item = document.createElement("li"); item.textContent = emptyText; list.append(item);
    }
    for (const entry of entries) {
      const item = document.createElement("li");
      const name = document.createElement("strong"); name.textContent = entry.name;
      const text = document.createElement("span"); text.textContent = entry.text || "";
      item.append(name);
      if (text.textContent) item.append(text);
      list.append(item);
    }
    body.append(list);
  }

  function handleCombatantCardClick(event) {
    const side = event.currentTarget === tacticalUi.playerCard ? "player" : event.currentTarget === tacticalUi.enemyBCard ? "enemy-b" : "enemy";
    const fighter = side === "player" ? state.player : side === "enemy-b" ? state.enemyB : state.enemy;
    if (!fighter) return;
    if (event.target.closest(".combatant-avatar")) {
      showTacticalHeroDetail(fighter);
      return;
    }
    if (isTacticalOnline()) return;
    openTacticalHeroPicker(side);
  }

  function handleCombatantCardKeydown(event) {
    if (!['Enter', ' '].includes(event.key)) return;
    event.preventDefault();
    handleCombatantCardClick(event);
  }

  function showModal(title, fill) { tacticalUi.modalTitle.textContent = title; tacticalUi.modalBody.textContent = ""; fill(tacticalUi.modalBody); tacticalUi.modal.hidden = false; }
  function hideModal() { tacticalUi.modal.hidden = true; }

  function applyHeroChoices() {
    const name = normalizePlayerName(tacticalUi.playerName.value); tacticalUi.playerName.value = name;
    writeStorage(STORAGE_KEYS.playerName, name);
    writeStorage(STORAGE_KEYS.heroSelection, JSON.stringify({ playerHero: tacticalUi.playerHero.value, enemyHero: tacticalUi.enemyHero.value, enemyBHero: tacticalUi.enemyBHero.value }));
    resetTacticalGame();
  }

  function changeBattleMode(mode) {
    const wasOnline = isTacticalOnline();
    if (wasOnline) stopTacticalOnlinePolling();
    setupBattleMode = mode === "trio" ? "trio" : mode === "online" ? "online" : "duel";
    syncBattleModeControls();
    if (setupBattleMode !== "online") applyDefaultSpawns();
    if (wasOnline) resetTacticalGame();
  }

  function handleTacticalKeyboard(event) {
    const tag = event.target?.tagName;
    if (["INPUT", "SELECT", "TEXTAREA"].includes(tag) || !tacticalUi.modal.hidden || state.over) return;
    if (event.key === "Enter") {
      if (!tacticalUi.lock.disabled) {
        event.preventDefault();
        lockPlan();
      }
      return;
    }
    if (event.code === "Space" || event.key === " ") {
      if (state.tactical.phase === "action") {
        event.preventDefault();
        cycleAvailableAction();
      }
      return;
    }
    if (state.tactical.phase !== "movement" || event.repeat) return;
    const directionIndex = { a: 0, d: 1, w: 2, q: 3, s: 4, e: 5 }[event.key.toLowerCase()];
    if (directionIndex === undefined) return;
    const destination = directionalNeighbors(state.player.position)[directionIndex];
    if (!destination) return;
    event.preventDefault();
    state.tactical.path = [];
    editPlayerPath(destination);
    renderTactical();
  }

  tacticalUi.map.addEventListener("click", handleMapClick);
  tacticalUi.enemyOverview.addEventListener("click", handleEnemyOverviewClick);
  tacticalUi.cards.addEventListener("click", handleCardClick);
  tacticalUi.filters.addEventListener("click", setFilter);
  tacticalUi.cancel.addEventListener("click", cancelPlan);
  tacticalUi.lock.addEventListener("click", lockPlan);
  tacticalUi.reset.addEventListener("click", () => {
    resetTacticalGame();
    if (setupBattleMode === "online") setTacticalRoomStatus("已离开房间。可以创建新房间或输入代码加入。");
  });
  tacticalUi.applyHeroes.addEventListener("click", applyHeroChoices);
  tacticalUi.clearLog.addEventListener("click", () => { tacticalUi.log.textContent = ""; });
  tacticalUi.manual.addEventListener("click", showManual);
  tacticalUi.history.addEventListener("click", showHistory);
  tacticalUi.playerCard.addEventListener("click", handleCombatantCardClick);
  tacticalUi.enemyCard.addEventListener("click", handleCombatantCardClick);
  tacticalUi.enemyBCard.addEventListener("click", handleCombatantCardClick);
  tacticalUi.playerCard.addEventListener("keydown", handleCombatantCardKeydown);
  tacticalUi.enemyCard.addEventListener("keydown", handleCombatantCardKeydown);
  tacticalUi.enemyBCard.addEventListener("keydown", handleCombatantCardKeydown);
  tacticalUi.duelMode.addEventListener("click", () => changeBattleMode("duel"));
  tacticalUi.trioMode.addEventListener("click", () => changeBattleMode("trio"));
  tacticalUi.onlineMode.addEventListener("click", () => changeBattleMode("online"));
  tacticalUi.createRoom.addEventListener("click", createTacticalOnlineRoom);
  tacticalUi.joinRoom.addEventListener("click", joinTacticalOnlineRoom);
  tacticalUi.defaultSpawns.addEventListener("click", applyDefaultSpawns);
  tacticalUi.modalClose.addEventListener("click", hideModal);
  tacticalUi.modal.addEventListener("click", (event) => { if (event.target === tacticalUi.modal) hideModal(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") hideModal(); });
  document.addEventListener("keydown", handleTacticalKeyboard);

  window.__JI_DEBUG__ = {
    getState: () => state,
    resetGame: resetTacticalGame,
    setPlayerXp: (value) => { state.player.xp = value; renderTactical(); },
    setEnemyXp: (value) => { state.enemy.xp = value; renderTactical(); },
    setEnemyBXp: (value) => { if (state.enemyB) state.enemyB.xp = value; renderTactical(); },
    setBattleMode: (mode) => { changeBattleMode(mode); resetTacticalGame(); },
    setPositions: (player, enemy, enemyB = null) => { placeFighter(state.player, player); placeFighter(state.enemy, enemy); if (state.enemyB && enemyB) placeFighter(state.enemyB, enemyB); renderTactical(); },
    forceRound: lockPlan,
    resolveSimultaneousMovement,
    resolveGroupMovement,
    applyMapResources,
    getEnergyTiles: () => TACTICAL_MAP.energyTiles.map(cloneTile),
    getMap: () => ({ rows: TACTICAL_MAP.rows, cols: TACTICAL_MAP.cols, objective: cloneTile(TACTICAL_MAP.objective), walls: TACTICAL_MAP.walls.map(cloneTile) }),
    getRules: () => ({ objectiveToWin: OBJECTIVE_TO_WIN, objectiveScoreCost: OBJECTIVE_SCORE_COST, movePoints: MOVE_POINTS }),
  };

  initializeHeroSelects();
  resetTacticalGame();
})();
