/*
 * Tactical presentation layer.  The legacy HEROES, BALANCE and resolveRound
 * functions remain the single source of truth for combat numbers and skills.
 */
(() => {
  const tacticalCore = window.JiTacticalCore;
  const TACTICAL_SETUP_KEY = "ji-tactical-setup-v2";
  const TACTICAL_MAP_KEY = "ji-tactical-map-v1";
  const TACTICAL_MAP_LIBRARY_KEY = "ji-tactical-map-library-v1";
  const TACTICAL_ACTIVE_MAP_ID_KEY = "ji-tactical-active-map-id-v1";
  const TACTICAL_SCORING_KEY = "ji-tactical-scoring-v1";
  const TUTORIAL_MAP_NAME = "练习地图1";
  const tutorialRequest = new URLSearchParams(window.location.search).get("tutorial");
  const DEFAULT_SPAWNS = {
    duel: { player: { row: 6, col: 1 }, enemy: { row: 1, col: 6 }, enemyB: { row: 6, col: 6 } },
    trio: { player: { row: 6, col: 3 }, enemy: { row: 1, col: 1 }, enemyB: { row: 1, col: 6 } },
    team: { player: { row: 6, col: 1 }, playerB: { row: 6, col: 6 }, enemy: { row: 1, col: 1 }, enemyB: { row: 1, col: 6 } },
    online: { player: { row: 6, col: 1 }, enemy: { row: 1, col: 6 }, enemyB: { row: 6, col: 6 } },
    "online-team": { player: { row: 6, col: 1 }, playerB: { row: 6, col: 6 }, enemy: { row: 1, col: 1 }, enemyB: { row: 1, col: 6 } },
  };
  const DEFAULT_TACTICAL_MAP = {
    rows: 8,
    cols: 8,
    objective: { row: 3, col: 3 },
    energyTiles: [{ row: 1, col: 3 }, { row: 6, col: 4 }],
    walls: [
      { row: 2, col: 2 }, { row: 2, col: 5 },
      { row: 4, col: 2 }, { row: 4, col: 5 },
    ],
    bushes: [
      { row: 1, col: 4 }, { row: 6, col: 3 },
      { row: 2, col: 0 }, { row: 5, col: 7 },
    ],
    thinWalls: [],
  };
  const INITIAL_ENERGY_TILES = DEFAULT_TACTICAL_MAP.energyTiles.map((tile) => ({ ...tile }));
  const TACTICAL_MAP = {
    rows: DEFAULT_TACTICAL_MAP.rows,
    cols: DEFAULT_TACTICAL_MAP.cols,
    objective: { ...DEFAULT_TACTICAL_MAP.objective },
    energyTiles: DEFAULT_TACTICAL_MAP.energyTiles.map((tile) => ({ ...tile })),
    walls: DEFAULT_TACTICAL_MAP.walls.map((tile) => ({ ...tile })),
    bushes: DEFAULT_TACTICAL_MAP.bushes.map((tile) => ({ ...tile })),
    thinWalls: [],
  };
  const MOVE_POINTS = 1;
  const PREP_MOVE_POINTS = 1;
  const OBJECTIVE_SCORE_COST = 2;
  const TACTICAL_LOG_PREVIEW_LIMIT = 3;
  const TACTICAL_LOG_MAX_ENTRIES = 300;
  const DEFAULT_SCORING_RULES = Object.freeze({ killScore: 1, objectiveScore: 1, victoryScore: 3 });
  const MIN_MOVEMENT_CONTEST_TOLL = 1;
  const MAX_MOVEMENT_CONTEST_TOLL = 3;
  const ACTION_FILTERS = new Set(["recommended", "available", "all", "charge", "defense", "range-1", "range-2", "special", "skill"]);
  const RECOMMENDED_ACTION_LIMIT = 5;
  const OBJECTIVE_RESPAWNS = [
    { row: 1, col: 2 }, { row: 1, col: 3 }, { row: 1, col: 4 }, { row: 1, col: 5 },
    { row: 6, col: 2 }, { row: 6, col: 3 }, { row: 6, col: 4 }, { row: 6, col: 5 },
    { row: 3, col: 1 }, { row: 4, col: 6 },
  ];
  const ROW_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"];
  // Standee art is deliberately opt-in. Heroes without a finished battlefield sprite
  // retain their established hex portrait token until their art is ready.
  const TACTICAL_STANDEES = {
    classic: {
      idle: "./assets/iso-arena/units/classic-warrior-standee-v1.png",
      walk: {
        right: [1, 2, 3, 4].map((frame) => `./assets/iso-arena/units/animated/classic-warrior-walk-${frame}.png`),
        upRight: [1, 2, 3, 4].map((frame) => `./assets/iso-arena/units/animated/classic-warrior-walk-up-right-${frame}.png`),
        downRight: [1, 2, 3, 4].map((frame) => `./assets/iso-arena/units/animated/classic-warrior-walk-down-right-${frame}.png`),
      },
      attack: {
        right: [1, 2, 3, 4].map((frame) => `./assets/iso-arena/units/animated/classic-warrior-attack-${frame}.png`),
        upRight: [1, 2, 3, 4].map((frame) => `./assets/iso-arena/units/animated/classic-warrior-attack-up-right-${frame}.png`),
        downRight: [1, 2, 3, 4].map((frame) => `./assets/iso-arena/units/animated/classic-warrior-attack-down-right-${frame}.png`),
      },
      guard: [1, 2, 3, 4].map((frame) => `./assets/iso-arena/units/animated/classic-warrior-guard-${frame}.png`),
      hit: [1, 2, 3, 4].map((frame) => `./assets/iso-arena/units/animated/classic-warrior-hit-${frame}.png`),
    },
    assassin: {
      idle: "./assets/iso-arena/units/assassin-standee-v2.png",
      walk: {
        right: [1, 2, 3, 4].map((frame) => `./assets/iso-arena/units/animated/assassin-walk-${frame}.png`),
        upRight: [1, 2, 3, 4].map((frame) => `./assets/iso-arena/units/animated/assassin-walk-up-right-${frame}.png`),
        downRight: [1, 2, 3, 4].map((frame) => `./assets/iso-arena/units/animated/assassin-walk-down-right-${frame}.png`),
      },
      attack: {
        right: [1, 2, 3, 4].map((frame) => `./assets/iso-arena/units/animated/assassin-attack-${frame}.png`),
        upRight: [1, 2, 3, 4].map((frame) => `./assets/iso-arena/units/animated/assassin-attack-up-right-${frame}.png`),
        downRight: [1, 2, 3, 4].map((frame) => `./assets/iso-arena/units/animated/assassin-attack-down-right-${frame}.png`),
      },
      guard: [1, 2, 1, 4].map((frame) => `./assets/iso-arena/units/animated/assassin-guard-${frame}.png`),
      hit: [3, 3, 4, 1].map((frame) => `./assets/iso-arena/units/animated/assassin-guard-${frame}.png`),
      sneak: [1, 2, 3, 4].map((frame) => `./assets/iso-arena/units/animated/assassin-sneak-${frame}.png`),
    },
    vampire: {
      idle: "./assets/iso-arena/units/vampire-standee-v1.png",
      walk: {
        right: [1, 2, 3, 4].map((frame) => `./assets/iso-arena/units/animated/vampire-walk-${frame}.png`),
      },
      attack: {
        right: [1, 2, 3, 4].map((frame) => `./assets/iso-arena/units/animated/vampire-attack-${frame}.png`),
      },
      guard: [1, 2, 3, 4].map((frame) => `./assets/iso-arena/units/animated/vampire-guard-${frame}.png`),
      hit: [1, 2, 3, 4].map((frame) => `./assets/iso-arena/units/animated/vampire-hit-${frame}.png`),
    },
    iceSorcerer: {
      idle: [1, 2, 3, 4].map((frame) => `./assets/iso-arena/units/generated/ice-sorcerer/animated/ice-sorcerer-idle-${frame}.png`),
      walk: {
        right: [1, 2, 3, 4].map((frame) => `./assets/iso-arena/units/generated/ice-sorcerer/animated/ice-sorcerer-walk-${frame}.png`),
        upRight: [1, 2, 3, 4].map((frame) => `./assets/iso-arena/units/generated/ice-sorcerer/animated/ice-sorcerer-walk-${frame}.png`),
        downRight: [1, 2, 3, 4].map((frame) => `./assets/iso-arena/units/generated/ice-sorcerer/animated/ice-sorcerer-walk-${frame}.png`),
      },
      attack: {
        right: [1, 2, 3, 4].map((frame) => `./assets/iso-arena/units/generated/ice-sorcerer/animated/ice-sorcerer-ice-blade-cast-${frame}.png`),
        upRight: [1, 2, 3, 4].map((frame) => `./assets/iso-arena/units/generated/ice-sorcerer/animated/ice-sorcerer-ice-blade-cast-${frame}.png`),
        downRight: [1, 2, 3, 4].map((frame) => `./assets/iso-arena/units/generated/ice-sorcerer/animated/ice-sorcerer-ice-blade-cast-${frame}.png`),
      },
      guard: [1, 2, 3, 4].map((frame) => `./assets/iso-arena/units/generated/ice-sorcerer/animated/ice-sorcerer-guard-${frame}.png`),
      hit: [3, 2, 4, 1].map((frame) => `./assets/iso-arena/units/generated/ice-sorcerer/animated/ice-sorcerer-guard-${frame}.png`),
    },
    astrologer: {
      idle: [1, 2, 3, 4].map((frame) => `./assets/iso-arena/units/generated/astrologer/animated/astrologer-idle-${frame}.png`),
      walk: {
        right: [1, 2, 3, 4].map((frame) => `./assets/iso-arena/units/generated/astrologer/animated/astrologer-walk-${frame}.png`),
        upRight: [1, 2, 3, 4].map((frame) => `./assets/iso-arena/units/generated/astrologer/animated/astrologer-walk-${frame}.png`),
        downRight: [1, 2, 3, 4].map((frame) => `./assets/iso-arena/units/generated/astrologer/animated/astrologer-walk-${frame}.png`),
      },
      attack: {
        right: [1, 2, 3, 4].map((frame) => `./assets/iso-arena/units/generated/astrologer/animated/astrologer-drain-${frame}.png`),
        upRight: [1, 2, 3, 4].map((frame) => `./assets/iso-arena/units/generated/astrologer/animated/astrologer-drain-${frame}.png`),
        downRight: [1, 2, 3, 4].map((frame) => `./assets/iso-arena/units/generated/astrologer/animated/astrologer-drain-${frame}.png`),
      },
      drain: [1, 2, 3, 4].map((frame) => `./assets/iso-arena/units/generated/astrologer/animated/astrologer-drain-${frame}.png`),
      predict: [1, 2, 3, 4].map((frame) => `./assets/iso-arena/units/generated/astrologer/animated/astrologer-predict-${frame}.png`),
      guard: [1, 2, 3, 4].map((frame) => `./assets/iso-arena/units/generated/astrologer/animated/astrologer-guard-${frame}.png`),
      hit: [3, 2, 4, 1].map((frame) => `./assets/iso-arena/units/generated/astrologer/animated/astrologer-guard-${frame}.png`),
    },
  };
  const tacticalUi = {
    round: document.querySelector("#tacticalRound"), phase: document.querySelector("#tacticalPhase"), score: document.querySelector("#tacticalScore"), modeLabel: document.querySelector("#tacticalModeLabel"),
    shell: document.querySelector("#tacticalShell"), mapSelect: document.querySelector("#tacticalMapSelectBtn"), menuButton: document.querySelector("#tacticalMenuBtn"), menuClose: document.querySelector("#tacticalMenuClose"), menuBackdrop: document.querySelector("#tacticalMenuBackdrop"),
    map: document.querySelector("#tacticalMap"), mapName: document.querySelector("#tacticalMapName"), mapHint: document.querySelector("#mapHint"), view3dToggle: document.querySelector("#tactical3dToggle"), stage3d: document.querySelector("#tactical3dStage"),
    playerCard: document.querySelector("#playerTacticalCard"), playerOverview: document.querySelector("#playerTeamOverview"), enemyCard: document.querySelector("#enemyTacticalCard"), enemyBCard: document.querySelector("#enemyBTacticalCard"),
    enemyOverview: document.querySelector("#enemyTeamOverview"),
    cards: document.querySelector("#tacticalCards"), filters: document.querySelector("#actionFilters"), preview: document.querySelector("#tacticalPreview"),
    battleMageImprint: document.querySelector("#battleMageImprintBtn"),
    lock: document.querySelector("#tacticalLockBtn"), cancel: document.querySelector("#tacticalCancelBtn"), reset: document.querySelector("#tacticalResetBtn"),
    applyHeroes: document.querySelector("#tacticalApplyHeroes"), playerHero: document.querySelector("#tacticalPlayerHero"), playerBHero: document.querySelector("#tacticalPlayerBHero"), enemyHero: document.querySelector("#tacticalEnemyHero"), enemyBHero: document.querySelector("#tacticalEnemyBHero"), playerName: document.querySelector("#tacticalPlayerName"),
    duelMode: document.querySelector("#tacticalDuelMode"), trioMode: document.querySelector("#tacticalTrioMode"), teamMode: document.querySelector("#tacticalTeamMode"), onlineMode: document.querySelector("#tacticalOnlineMode"), onlineTeamMode: document.querySelector("#tacticalOnlineTeamMode"), playerBSettings: document.querySelectorAll(".player-b-setting"), enemyBSettings: document.querySelectorAll(".enemy-b-setting"),
    playerSpawn: document.querySelector("#tacticalPlayerSpawn"), playerBSpawn: document.querySelector("#tacticalPlayerBSpawn"), enemySpawn: document.querySelector("#tacticalEnemySpawn"), enemyBSpawn: document.querySelector("#tacticalEnemyBSpawn"),
    playerSpawnInput: document.querySelector("#tacticalPlayerSpawnInput"), playerBSpawnInput: document.querySelector("#tacticalPlayerBSpawnInput"), enemySpawnInput: document.querySelector("#tacticalEnemySpawnInput"), enemyBSpawnInput: document.querySelector("#tacticalEnemyBSpawnInput"), defaultSpawns: document.querySelector("#tacticalDefaultSpawns"),
    spawnSettings: document.querySelector("#tacticalSpawnSettings"), roomSettings: document.querySelector("#tacticalRoomSettings"), createRoom: document.querySelector("#tacticalCreateRoom"), joinRoom: document.querySelector("#tacticalJoinRoom"), roomCode: document.querySelector("#tacticalRoomCode"), roomStatus: document.querySelector("#tacticalRoomStatus"),
    mapEditorToggle: document.querySelector("#tacticalMapEditorBtn"), mapEditorPanel: document.querySelector("#tacticalMapEditor"), mapEditorTools: document.querySelector("#mapEditorTools"), mapEditorHint: document.querySelector("#mapEditorHint"),
    mapEditorName: document.querySelector("#mapEditorName"), mapEditorLibrary: document.querySelector("#mapEditorLibrary"), mapEditorLoad: document.querySelector("#mapEditorLoad"), mapEditorDelete: document.querySelector("#mapEditorDelete"),
    mapEditorSave: document.querySelector("#mapEditorSave"), mapEditorReset: document.querySelector("#mapEditorReset"), mapEditorCancel: document.querySelector("#mapEditorCancel"), mapEditorSpawnStatus: document.querySelector("#mapEditorSpawnStatus"),
    log: document.querySelector("#tacticalLog"), expandLog: document.querySelector("#tacticalExpandLog"), clearLog: document.querySelector("#tacticalClearLog"),
    actionTitle: document.querySelector(".action-dock h2"),
    scoring: document.querySelector("#tacticalScoringBtn"), manual: document.querySelector("#tacticalManualBtn"), history: document.querySelector("#tacticalHistoryBtn"),
    modal: document.querySelector("#tacticalModal"), modalTitle: document.querySelector("#tacticalModalTitle"), modalBody: document.querySelector("#tacticalModalBody"), modalClose: document.querySelector("#tacticalModalClose"),
    tutorialGuide: document.querySelector("#tutorialGuide"), tutorialKicker: document.querySelector("#tutorialKicker"), tutorialTitle: document.querySelector("#tutorialTitle"), tutorialText: document.querySelector("#tutorialText"), tutorialProgress: document.querySelector("#tutorialProgress"), tutorialNext: document.querySelector("#tutorialNextBtn"), tutorialSkip: document.querySelector("#tutorialSkipBtn"),
  };
  let tileTooltipTimer = null;
  let tileTooltip = null;
  let setupBattleMode = "duel";
  let scoringRules = loadScoringRules();
  let pharmacistLoadoutDraft = getPlayerPharmacistLoadout();
  let elfLoadoutDraft = getPlayerElfLoadout();
  let activeMapConfig = cloneMapConfig(DEFAULT_TACTICAL_MAP);
  let tacticalLogEntries = [];
  let tacticalMenuOpen = true;
  let lastMapRenderSignature = "";
  let tutorial = createTutorialState(tutorialRequest);
  const mapEditor = {
    active: false,
    tool: "objective",
    anchor: null,
    draft: null,
    spawns: null,
    mapId: null,
    libraryId: null,
    notice: "",
    lastPointerKey: "",
    lastPointerAt: 0,
  };

  function createTutorialState(request) {
    if (!['classic', 'assassin'].includes(request)) return null;
    return { id: request, step: 0, mapFound: false };
  }

  function getTutorialSteps() {
    if (!tutorial) return [];
    if (tutorial.id === 'assassin') {
      return [
        ['英雄选择', '第二课：刺客', '点击左下角的己方角色卡可打开英雄选择页。这里已为你预选刺客：他用潜行换取下一回合的额外移动。', '开始移动'],
        ['预备移动', '走近战场', '预备回合只能移动 1 格。点击相邻蓝框，或使用 WASD 与 Q/E 选择六个方向，然后锁定移动。', '等待移动'],
        ['行动选择', '先积蓄 1 XP', '潜行需要 1 XP。选择 Ji 并锁定行动，先为下一回合准备资源。', '等待 Ji'],
        ['回合结算', '资源已经到位', '现在你拥有 1 XP。下一回合进入行动阶段后，尝试使用刺客技能“潜行”。', '继续'],
        ['刺客技能', '潜行', '潜行花费 1 XP，自带中防；下回合开始前可额外移动一次。选择它并锁定行动。', '等待潜行'],
        ['完成', '你已经掌握刺客', '潜行的价值不只是防御，更是把下一回合的移动优势转换为距离优势。之后可尝试用小刀抢节奏，或绕向据点。', '完成训练'],
      ];
    }
    return [
      ['新手引导', '第一课：经典武者', '这是一场固定的经典武者 1v1。你会依次学习预备移动、Ji、防御、攻击距离与据点得分。', '开始训练'],
      ['预备移动', '先迈出第一步', '开局先进入预备回合，双方只能移动 1 格且不能出招。选择相邻蓝框，或使用 WASD 与 Q/E，再锁定移动。', '等待移动'],
      ['正式回合', '移动后才能出招', '位置会先同时结算。第 1 回合仍先移动，再进入行动阶段。注意六边形相邻关系决定攻击距离。', '等待出招'],
      ['蓄气', '选择 Ji', 'Ji 不消耗 XP，并让你获得 1 XP。选中 Ji 后锁定行动，观察双方同时结算。', '等待 Ji'],
      ['回合结算', 'Ji 已锁定', '双方会同时出招。观察 XP 的变化；结算完成后再进入下一回合移动。', '等待结算'],
      ['防御', '选择小防', '小防不花费 XP，防御值为 4。面对低强度攻击时，防御比盲目出刀更稳妥。选择小防并锁定。', '等待小防'],
      ['回合结算', '护盾生效', '小防只保护本回合。每回合都要重新判断距离、XP 与对方可能的攻击。完成结算后再学习攻击。', '等待结算'],
      ['攻击', '选择小刀', '小刀花费 1 XP，距离为 1。先让敌人进入相邻格，再选择小刀并点选目标；攻击强度高于对方防御才会造成伤害。', '等待小刀'],
      ['回合结算', '小刀已锁定', '攻击、命中与防御都会在双方锁定后同时结算。若目标离开距离、或防御足够高，攻击就不会造成伤害。', '等待结算'],
      ['据点', '理解胜利条件', '中央据点需要先占据一回合；下一回合仍站在据点上且支付 2 XP，才获得据点分。击倒敌人也会得分。', '进入刺客教学'],
    ];
  }

  function syncTutorialProgress() {
    if (!tutorial) return;
    const selected = state.tactical?.selectedCardId;
    if (tutorial.step === 1 && !isPreparationRound() && state.round >= 1 && state.tactical.phase === 'movement') tutorial.step = 2;
    else if (tutorial.step === 2 && state.tactical.phase === 'action') tutorial.step = 3;
    else if (tutorial.id === 'classic' && tutorial.step === 3 && selected === 'ji') tutorial.step = 4;
    else if (tutorial.id === 'classic' && tutorial.step === 4 && state.round >= 2 && state.tactical.phase === 'movement') tutorial.step = 5;
    else if (tutorial.id === 'classic' && tutorial.step === 5 && selected === 'def-small') tutorial.step = 6;
    else if (tutorial.id === 'classic' && tutorial.step === 6 && state.round >= 3 && state.tactical.phase === 'movement') tutorial.step = 7;
    else if (tutorial.id === 'classic' && tutorial.step === 7 && selected === 'atk-1') tutorial.step = 8;
    else if (tutorial.id === 'classic' && tutorial.step === 8 && state.round >= 4 && state.tactical.phase === 'movement') tutorial.step = 9;
    else if (tutorial.id === 'assassin' && tutorial.step === 2 && selected === 'ji') tutorial.step = 3;
    else if (tutorial.id === 'assassin' && tutorial.step === 3 && state.round >= 2 && state.tactical.phase === 'action') tutorial.step = 4;
    else if (tutorial.id === 'assassin' && tutorial.step === 4 && selected === 'assassin-sneak') tutorial.step = 5;
    else if (tutorial.id === 'assassin' && tutorial.step === 5 && state.round >= 3 && state.tactical.phase === 'movement') tutorial.step = 6;
  }

  function renderTutorialGuide() {
    const guide = tacticalUi.tutorialGuide;
    if (!guide) return;
    guide.hidden = !tutorial;
    if (!tutorial) return;
    const steps = getTutorialSteps();
    const index = Math.min(tutorial.step, steps.length - 1);
    const [kicker, title, text, action] = steps[index];
    tacticalUi.tutorialKicker.textContent = kicker;
    tacticalUi.tutorialTitle.textContent = title;
    tacticalUi.tutorialText.textContent = text;
    tacticalUi.tutorialProgress.textContent = `${index + 1} / ${steps.length}${tutorial.mapFound ? '' : ' · 使用默认练习场'}`;
    tacticalUi.tutorialNext.textContent = action;
    tacticalUi.tutorialNext.hidden = !(index === 0 || index === steps.length - 1);
  }

  function advanceTutorial() {
    if (!tutorial) return;
    const lastStep = getTutorialSteps().length - 1;
    if (tutorial.step === 0) tutorial.step = 1;
    else if (tutorial.step >= lastStep) {
      if (tutorial.id === 'classic') {
        window.location.href = './index.html?tutorial=assassin';
        return;
      }
      window.location.href = './world.html';
      return;
    }
    renderTactical();
  }

  function exitTutorial() { window.location.href = './world.html'; }

  function setupTutorialFromRequest() {
    if (!tutorial) return;
    const practiceEntry = readMapLibrary().find((entry) => String(entry.name || '').trim() === TUTORIAL_MAP_NAME);
    if (practiceEntry) {
      applyMapConfig(sanitizeMapConfig(practiceEntry.map));
      setActiveMapId(practiceEntry.id);
      writeStorage(TACTICAL_MAP_KEY, JSON.stringify(TACTICAL_MAP));
      initializeTacticalSetup();
      tutorial.mapFound = true;
    }
    setupBattleMode = 'duel';
    syncBattleModeControls();
    tacticalUi.playerHero.value = tutorial.id === 'assassin' ? 'assassin' : 'classic';
    tacticalUi.enemyHero.value = 'classic';
    const spawns = practiceEntry?.spawns
      ? sanitizeSpawnDraft(practiceEntry.spawns, TACTICAL_MAP)
      : getDefaultSpawnDraft();
    applySpawnDraftToControls(spawns);
    tacticalMenuOpen = false;
  }

  state.tactical = {
    phase: "movement",
    selection: "move",
    path: [],
    selectedCardId: null,
    selectedTarget: null,
    selectedTargetId: null,
    selectedTargets: [],
    filter: "recommended",
    playerScore: 0,
    enemyScore: 0,
    flames: [],
    winReason: "",
    resolving: false,
    loadoutPending: false,
    standbyAutoPassScheduled: false,
    battleMageImprint: false,
    prepRound: false,
    pendingEndChoice: null,
    battleMode: "duel",
    online: null,
  };

  // resolveRound only needs these card references for its legacy impact flash.
  ui.playerCard = tacticalUi.playerCard;
  ui.enemyCard = tacticalUi.enemyCard;

  function keyOf(position) { return tacticalCore.keyOf(position); }
  function sameTile(a, b) { return tacticalCore.sameTile(a, b); }
  function cloneTile(position) { return tacticalCore.cloneTile(position); }
  function coordName(position) { return position ? `${ROW_LABELS[position.row]}${position.col + 1}` : "未选择"; }
  function clampRuleValue(value, fallback, min = 0) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? Math.min(99, Math.max(min, parsed)) : fallback;
  }
  function loadScoringRules() {
    try {
      const saved = JSON.parse(readStorage(TACTICAL_SCORING_KEY) || "{}");
      return {
        killScore: clampRuleValue(saved.killScore, DEFAULT_SCORING_RULES.killScore, 0),
        objectiveScore: clampRuleValue(saved.objectiveScore, DEFAULT_SCORING_RULES.objectiveScore, 0),
        victoryScore: clampRuleValue(saved.victoryScore, DEFAULT_SCORING_RULES.victoryScore, 1),
      };
    } catch (_) {
      return { ...DEFAULT_SCORING_RULES };
    }
  }
  function isTeamBattle() { return ["team", "online-team"].includes(state.tactical?.battleMode); }
  function isOnlineSetupMode(mode = setupBattleMode) { return ["online", "online-team"].includes(mode); }
  function isOnlineTeamBattle() { return state.tactical?.battleMode === "online-team"; }
  function getPlayerFighters() { return [state.player, state.playerB].filter(Boolean); }
  function getAlivePlayers() { return getPlayerFighters().filter((fighter) => !isFighterDefeated(fighter) && !fighter.flags?.tacticalRespawnRound); }
  function getActivePlayer() {
    return getPlayerFighters().find((fighter) => fighter.id === state.tactical?.activePlayerId) || state.player;
  }
  function getOpposingFighters(fighter) {
    return getPlayerFighters().includes(fighter) ? getAliveEnemies() : getAlivePlayers();
  }
  function getFighterTeam(fighter) { return getPlayerFighters().includes(fighter) ? "player" : "enemy"; }
  function getFighterSpawn(fighter) { return state.tactical?.spawnPoints?.[fighter.id] || fighter.position; }
  function isPreparationRound() { return Boolean(state.tactical?.prepRound); }
  function hasAssassinSneakMove(fighter) {
    return Boolean(fighter?.statuses?.some((status) => status.id === "assassin-sneak"));
  }
  function getMoveLimitForFighter(fighter) {
    return (isPreparationRound() ? PREP_MOVE_POINTS : MOVE_POINTS) + (isPreparationRound() ? 0 : (hasAssassinSneakMove(fighter) ? (BALANCE.heroes.assassin.sneakMoveBonus || 1) : 0));
  }
  function getCurrentMoveLimit() { return getMoveLimitForFighter(getActivePlayer()); }
  function consumeAssassinSneakMove(fighter, logs = []) {
    if (!hasAssassinSneakMove(fighter)) return;
    fighter.statuses = (fighter.statuses || []).filter((status) => status.id !== "assassin-sneak");
    logs.push(`${fighter.label}完成潜行移动，潜行状态结束。`);
  }
  function refreshMovePointsForPhase(phase = state.tactical?.phase) {
    for (const fighter of getAllTacticalFighters()) {
      fighter.maxMovePoints = getMoveLimitForFighter(fighter);
      fighter.movePoints = phase === "movement" ? fighter.maxMovePoints : 0;
    }
  }
  function uniqueTiles(tiles) {
    return tacticalCore.uniqueTiles(tiles);
  }
  function edgeKey(first, second) { return tacticalCore.edgeKey(first, second); }
  function parseEdgeKey(key) { return tacticalCore.parseEdgeKey(key); }
  function normalizeEdgeKey(key) { return tacticalCore.normalizeEdgeKey(key); }
  function cloneMapConfig(map) {
    return {
      rows: map?.rows || DEFAULT_TACTICAL_MAP.rows,
      cols: map?.cols || DEFAULT_TACTICAL_MAP.cols,
      objective: map?.objective ? { ...map.objective } : { ...DEFAULT_TACTICAL_MAP.objective },
      energyTiles: uniqueTiles(map?.energyTiles || DEFAULT_TACTICAL_MAP.energyTiles),
      walls: uniqueTiles(map?.walls || DEFAULT_TACTICAL_MAP.walls),
      bushes: uniqueTiles(map?.bushes || DEFAULT_TACTICAL_MAP.bushes),
      thinWalls: Array.from(new Set((map?.thinWalls || []).map(normalizeEdgeKey).filter(Boolean))),
    };
  }
  function inBoundsForMap(position, map = TACTICAL_MAP) {
    return tacticalCore.inBounds(position, map);
  }
  function areRawAdjacent(first, second, map = TACTICAL_MAP) {
    return inBoundsForMap(first, map)
      && inBoundsForMap(second, map)
      && directionalNeighbors(first).some((tile) => sameTile(tile, second));
  }
  function hasThinWallBetween(first, second, map = TACTICAL_MAP) {
    if (!first || !second) return false;
    const key = edgeKey(first, second);
    return Boolean((map.thinWalls || []).includes(key)
      || (map === TACTICAL_MAP && getActiveTemporaryThinWalls().includes(key)));
  }

  function getActiveTemporaryThinWalls(round = state.round) {
    return (state.tactical?.temporaryThinWalls || [])
      .filter((wall) => wall.activeRound <= round && wall.expireRound > round)
      .map((wall) => wall.key);
  }

  function pruneTemporaryThinWalls(round = state.round) {
    if (!state.tactical?.temporaryThinWalls) return;
    state.tactical.temporaryThinWalls = state.tactical.temporaryThinWalls.filter((wall) => wall.expireRound > round);
  }
  function sanitizeMapConfig(raw) {
    const base = cloneMapConfig(raw || DEFAULT_TACTICAL_MAP);
    base.rows = DEFAULT_TACTICAL_MAP.rows;
    base.cols = DEFAULT_TACTICAL_MAP.cols;
    base.objective = inBoundsForMap(base.objective, base) ? cloneTile(base.objective) : cloneTile(DEFAULT_TACTICAL_MAP.objective);
    base.walls = uniqueTiles(base.walls).filter((tile) => inBoundsForMap(tile, base) && !sameTile(tile, base.objective));
    base.energyTiles = uniqueTiles(base.energyTiles).filter((tile) => inBoundsForMap(tile, base) && !sameTile(tile, base.objective) && !containsTile(base.walls, tile));
    base.bushes = uniqueTiles(base.bushes).filter((tile) => inBoundsForMap(tile, base) && !sameTile(tile, base.objective) && !containsTile(base.walls, tile) && !containsTile(base.energyTiles, tile));
    base.thinWalls = Array.from(new Set((base.thinWalls || [])
      .map(normalizeEdgeKey)
      .filter((key) => {
        const [first, second] = parseEdgeKey(key);
        return areRawAdjacent(first, second, base);
      })));
    return base;
  }
  function loadSavedMapConfig() {
    const active = getActiveMapEntry();
    if (active?.map) return active.map;
    try {
      return sanitizeMapConfig(JSON.parse(readStorage(TACTICAL_MAP_KEY) || "null"));
    } catch (_) {
      return cloneMapConfig(DEFAULT_TACTICAL_MAP);
    }
  }
  function makeMapLibraryId() {
    return `map-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  }
  function normalizeMapName(value) {
    const name = String(value || "").trim().slice(0, 20);
    return name || "未命名地图";
  }
  function readMapLibrary() {
    try {
      const saved = JSON.parse(readStorage(TACTICAL_MAP_LIBRARY_KEY) || "[]");
      if (!Array.isArray(saved)) return [];
      return saved
        .filter((entry) => entry && entry.id && entry.map)
        .map((entry) => {
          const map = sanitizeMapConfig(entry.map);
          return {
            id: String(entry.id),
            name: normalizeMapName(entry.name),
            map,
            spawns: entry.spawns ? sanitizeSpawnDraft(entry.spawns, map) : null,
            updatedAt: entry.updatedAt || "",
          };
        });
    } catch (_) {
      return [];
    }
  }
  function writeMapLibrary(entries) {
    writeStorage(TACTICAL_MAP_LIBRARY_KEY, JSON.stringify(entries.slice(0, 24)));
  }
  function getActiveMapId() {
    return readStorage(TACTICAL_ACTIVE_MAP_ID_KEY) || "";
  }
  function setActiveMapId(id) {
    if (id) writeStorage(TACTICAL_ACTIVE_MAP_ID_KEY, id);
    else localStorage.removeItem(TACTICAL_ACTIVE_MAP_ID_KEY);
  }
  function getActiveMapEntry() {
    const activeId = getActiveMapId();
    if (!activeId) return null;
    return readMapLibrary().find((entry) => entry.id === activeId) || null;
  }
  function getCurrentMapName() {
    if (mapEditor.active) {
      return normalizeMapName(tacticalUi.mapEditorName?.value || getActiveMapEntry()?.name || "默认潮汐遗迹");
    }
    return getActiveMapEntry()?.name || "默认潮汐遗迹";
  }
  function saveMapLibraryEntry(name, map, spawns, existingId = "") {
    const library = readMapLibrary();
    const id = existingId || makeMapLibraryId();
    const entry = {
      id,
      name: normalizeMapName(name),
      map: sanitizeMapConfig(map),
      spawns,
      updatedAt: new Date().toISOString(),
    };
    const index = library.findIndex((item) => item.id === id);
    if (index >= 0) library[index] = entry;
    else library.unshift(entry);
    writeMapLibrary(library);
    setActiveMapId(id);
    return entry;
  }
  function getSelectedMapLibraryEntry() {
    const id = tacticalUi.mapEditorLibrary?.value || "";
    return readMapLibrary().find((entry) => entry.id === id) || null;
  }
  function renderMapLibraryControls() {
    if (!tacticalUi.mapEditorLibrary || !tacticalUi.mapEditorName) return;
    const library = readMapLibrary();
    const selectedId = mapEditor.libraryId || mapEditor.mapId || getActiveMapId();
    tacticalUi.mapEditorLibrary.textContent = "";
    tacticalUi.mapEditorLibrary.add(new Option("新地图", ""));
    for (const entry of library) {
      const option = new Option(entry.name, entry.id);
      option.textContent = `${entry.name}${entry.id === getActiveMapId() ? " · 当前" : ""}`;
      tacticalUi.mapEditorLibrary.add(option);
    }
    tacticalUi.mapEditorLibrary.value = library.some((entry) => entry.id === selectedId) ? selectedId : "";
    tacticalUi.mapEditorName.value = mapEditor.active
      ? tacticalUi.mapEditorName.value || (library.find((entry) => entry.id === tacticalUi.mapEditorLibrary.value)?.name || "")
      : "";
    if (tacticalUi.mapEditorDelete) tacticalUi.mapEditorDelete.disabled = !tacticalUi.mapEditorLibrary.value;
    if (tacticalUi.mapEditorLoad) tacticalUi.mapEditorLoad.disabled = !tacticalUi.mapEditorLibrary.value;
  }
  function applyMapConfig(config) {
    const next = sanitizeMapConfig(config);
    TACTICAL_MAP.rows = next.rows;
    TACTICAL_MAP.cols = next.cols;
    TACTICAL_MAP.objective = cloneTile(next.objective);
    TACTICAL_MAP.energyTiles = next.energyTiles.map(cloneTile);
    TACTICAL_MAP.walls = next.walls.map(cloneTile);
    TACTICAL_MAP.bushes = next.bushes.map(cloneTile);
    TACTICAL_MAP.thinWalls = next.thinWalls.slice();
    activeMapConfig = cloneMapConfig(next);
  }
  function getInitialEnergyTiles() {
    return (Array.isArray(activeMapConfig?.energyTiles) ? activeMapConfig.energyTiles : INITIAL_ENERGY_TILES).map(cloneTile);
  }
  function getRenderedMapConfig() {
    return mapEditor.active && mapEditor.draft ? mapEditor.draft : TACTICAL_MAP;
  }
  function toCube(position) {
    const x = position.col - (position.row - (position.row & 1)) / 2;
    const z = position.row;
    return { x, y: -x - z, z };
  }
  function hexDistance(a, b) {
    const first = toCube(a); const second = toCube(b);
    return Math.max(Math.abs(first.x - second.x), Math.abs(first.y - second.y), Math.abs(first.z - second.z));
  }
  function inBounds(position, map = TACTICAL_MAP) { return inBoundsForMap(position, map); }
  function containsTile(tiles, position) { return tiles.some((tile) => sameTile(tile, position)); }
  function getEnemyFighters() { return [state.enemy, state.enemyB].filter(Boolean); }
  function getAllTacticalFighters() { return [...getPlayerFighters(), ...getEnemyFighters()].filter(Boolean); }
  function getAliveEnemies() { return getEnemyFighters().filter((fighter) => !isFighterDefeated(fighter)); }
  function getFighterById(id) { return getAllTacticalFighters().find((fighter) => fighter.id === id) || null; }
  function getFighterAt(position) { return getAllTacticalFighters().find((fighter) => !fighter.flags?.tacticalRespawnRound && sameTile(fighter.position, position)) || null; }
  function getOccupiedTiles(exceptFighter = null) { return getAllTacticalFighters().filter((fighter) => fighter !== exceptFighter && !isFighterDefeated(fighter) && !fighter.flags?.tacticalRespawnRound).map((fighter) => fighter.position); }
  function isWall(position, map = TACTICAL_MAP) { return containsTile(map.walls || [], position); }
  function tileType(position, map = TACTICAL_MAP) {
    if (isWall(position, map)) return "wall";
    if (sameTile(position, map.objective)) return "objective";
    if (containsTile(map.energyTiles || [], position)) return "energy";
    if (containsTile(map.bushes || [], position)) return "bush";
    return "floor";
  }
  function isBushTile(position, map = TACTICAL_MAP) {
    return Boolean(position) && containsTile(map.bushes || [], position);
  }
  function hasNinjaStealth(fighter) {
    return fighter?.heroId === "ninja" && fighter.statuses?.some((status) => status.id === "ninja-stealth");
  }
  function canFighterSee(viewer, target) {
    if (!viewer || !target || !viewer.position || !target.position) return false;
    if (viewer === target || getFighterTeam(viewer) === getFighterTeam(target)) return true;
    if (isFighterDefeated(target) || target.flags?.tacticalRespawnRound) return true;

    const adjacent = getRouteDistance(viewer.position, target.position, 1) === 1;
    if (hasNinjaStealth(target) && !adjacent) return false;
    if (!isBushTile(target.position)) return true;
    return isBushTile(viewer.position) && adjacent;
  }
  function isFighterVisibleToTeam(target, team) {
    if (state.over) return true;
    if (!target || getFighterTeam(target) === team) return true;
    const observers = team === "player" ? getAlivePlayers() : getAliveEnemies();
    return observers.some((viewer) => canFighterSee(viewer, target));
  }
  function getVisibleOccupiedTiles(fighter) {
    const team = getFighterTeam(fighter);
    return getAllTacticalFighters()
      .filter((other) => other !== fighter && !isFighterDefeated(other) && !other.flags?.tacticalRespawnRound)
      .filter((other) => getFighterTeam(other) === team || isFighterVisibleToTeam(other, team))
      .map((other) => other.position);
  }
  function isNinjaRevealAction(action) {
    if (!action) return false;
    if (action.id === "ninja-shuriken") return true;
    if (action.kind !== "attack") return false;
    return ["range-1", "range-2", "special"].includes(getActionCategory(action));
  }
  function appendMechanicLog(logs, text, kind = "") {
    if (Array.isArray(logs)) logs.push({ text, kind });
    else addTacticalLog(text, kind);
  }
  function exposeNinja(fighter, reason, logs = null, delayGuard = true) {
    const stealth = fighter?.statuses?.find((status) => status.id === "ninja-stealth");
    if (!stealth) return false;
    fighter.statuses = fighter.statuses.filter((status) => status !== stealth);
    const guardTurns = Math.max(0, (stealth.turns || 0) - 1);
    if (guardTurns > 0) {
      setStatus(fighter, {
        id: "ninja-stealth-guard",
        type: "positive",
        name: "隐身补偿",
        text: `${guardTurns} 回合小防`,
        turns: guardTurns,
        delayed: delayGuard,
        fresh: delayGuard,
      });
    }
    appendMechanicLog(logs, `${fighter.label}${reason}而暴露${guardTurns > 0 ? `，剩余 ${guardTurns} 回合转为小防` : ""}。`, "impact");
    return true;
  }
  function exposeNearbyNinjas(logs = null, delayGuard = true) {
    for (const fighter of getAllTacticalFighters()) {
      if (!hasNinjaStealth(fighter) || isFighterDefeated(fighter)) continue;
      const adjacentEnemy = getOpposingFighters(fighter).some((enemy) => getRouteDistance(fighter.position, enemy.position, 1) === 1);
      if (adjacentEnemy) exposeNinja(fighter, "被敌人贴近", logs, delayGuard);
    }
  }
  function exposeAttackingNinjas(actionEntries, logs) {
    for (const entry of actionEntries) {
      if (hasNinjaStealth(entry.fighter) && isNinjaRevealAction(entry.action)) {
        exposeNinja(entry.fighter, `主动使用${entry.action.name}`, logs, true);
      }
    }
  }
  function directionalNeighbors(position) { return tacticalCore.directionalNeighbors(position); }
  function neighbors(position, map = TACTICAL_MAP) {
    return directionalNeighbors(position)
      .filter((tile) => inBounds(tile, map) && !isWall(tile, map) && !hasThinWallBetween(position, tile, map));
  }
  function getPathEnd(fighter, path = state.tactical.path) { return path.length ? path[path.length - 1] : fighter.position; }
  function isStandable(position, blockedPositions = []) {
    const blocked = Array.isArray(blockedPositions) ? blockedPositions : blockedPositions ? [blockedPositions] : [];
    return inBounds(position) && !isWall(position) && !blocked.some((entry) => sameTile(position, entry));
  }

  function getMovementTollEntry(fighter, path = []) {
    if (!fighter?.flags) return null;
    const destination = getPlanEnd(fighter.position, path);
    const tolls = fighter.flags.movementTolls || [];
    return tolls.find((entry) => entry.round === state.round && sameTile(entry.position, destination)) || null;
  }

  function getMovementTollCost(fighter, path = []) {
    return getMovementTollEntry(fighter, path)?.cost || 0;
  }

  function getNextMovementContestCost(fighter, contestedTile) {
    const active = (fighter.flags?.movementTolls || [])
      .find((entry) => entry.round === state.round && sameTile(entry.position, contestedTile));
    const currentCost = active?.cost || 0;
    return Math.min(MAX_MOVEMENT_CONTEST_TOLL, Math.max(MIN_MOVEMENT_CONTEST_TOLL, currentCost + 1));
  }

  function applyMovementTollCosts(plans) {
    for (const plan of plans) {
      const toll = getMovementTollCost(plan.fighter, plan.path);
      if (!toll) continue;
      if (plan.fighter.xp < toll) {
        plan.path = [];
        addTacticalLog(`${plan.fighter.label}XP 不足，无法支付争夺格费用，留在原位。`, "move");
        continue;
      }
      plan.fighter.xp -= toll;
      addTacticalLog(`${plan.fighter.label}支付 ${toll} XP 再次争夺 ${coordName(getPlanEnd(plan.fighter.position, plan.path))}。`, "move");
    }
  }

  function applyContestedMovementTolls(movement) {
    const contestedEntries = movement.filter((entry) => entry.contestedTile);
    if (!contestedEntries.length) return;
    for (const entry of contestedEntries) {
      if (!entry.fighter.flags) entry.fighter.flags = {};
      entry.fighter.flags.movementTolls = [{
        round: state.round + 1,
        position: cloneTile(entry.contestedTile),
        cost: getNextMovementContestCost(entry.fighter, entry.contestedTile),
      }];
    }
  }

  function pruneMovementTolls() {
    for (const fighter of getAllTacticalFighters()) {
      if (!fighter.flags?.movementTolls) continue;
      fighter.flags.movementTolls = fighter.flags.movementTolls.filter((entry) => entry.round >= state.round);
    }
  }

  function initializeHeroSelects() {
    for (const hero of Object.values(HEROES)) {
      tacticalUi.playerHero.add(new Option(getHeroDisplayName(hero), hero.id));
      tacticalUi.playerBHero.add(new Option(getHeroDisplayName(hero), hero.id));
      tacticalUi.enemyHero.add(new Option(getHeroDisplayName(hero), hero.id));
      tacticalUi.enemyBHero.add(new Option(getHeroDisplayName(hero), hero.id));
    }
    const saved = readHeroSelection();
    tacticalUi.playerHero.value = HEROES[saved.playerHero] ? saved.playerHero : "classic";
    tacticalUi.playerBHero.value = HEROES[saved.playerBHero] ? saved.playerBHero : "priest";
    tacticalUi.enemyHero.value = HEROES[saved.enemyHero] ? saved.enemyHero : "guard";
    tacticalUi.enemyBHero.value = HEROES[saved.enemyBHero] ? saved.enemyBHero : "balancedBot";
    tacticalUi.playerName.value = normalizePlayerName(readStorage(STORAGE_KEYS.playerName) || DEFAULT_PLAYER_NAME);
    pharmacistLoadoutDraft = getPlayerPharmacistLoadout();
    elfLoadoutDraft = getPlayerElfLoadout();
    initializeTacticalSetup();
  }

  function initializeTacticalSetup() {
    for (const select of [tacticalUi.playerSpawn, tacticalUi.playerBSpawn, tacticalUi.enemySpawn, tacticalUi.enemyBSpawn]) {
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
    setupBattleMode = saved.mode === "online-team" ? "online-team" : saved.mode === "team" ? "team" : saved.mode === "trio" ? "trio" : saved.mode === "online" ? "online" : "duel";
    const activeEntry = getActiveMapEntry();
    if (activeEntry?.spawns) {
      saved.playerSpawn = keyOf(activeEntry.spawns.player || DEFAULT_SPAWNS[setupBattleMode].player);
      saved.playerBSpawn = keyOf(activeEntry.spawns.playerB || DEFAULT_SPAWNS.team.playerB);
      saved.enemySpawn = keyOf(activeEntry.spawns.enemy || DEFAULT_SPAWNS[setupBattleMode].enemy);
      saved.enemyBSpawn = keyOf(activeEntry.spawns.enemyB || DEFAULT_SPAWNS[setupBattleMode].enemyB);
    }
    setSpawnSelectValue(tacticalUi.playerSpawn, saved.playerSpawn, DEFAULT_SPAWNS[setupBattleMode].player);
    setSpawnSelectValue(tacticalUi.playerBSpawn, saved.playerBSpawn, DEFAULT_SPAWNS[setupBattleMode].playerB || DEFAULT_SPAWNS.team.playerB);
    setSpawnSelectValue(tacticalUi.enemySpawn, saved.enemySpawn, DEFAULT_SPAWNS[setupBattleMode].enemy);
    setSpawnSelectValue(tacticalUi.enemyBSpawn, saved.enemyBSpawn, DEFAULT_SPAWNS[setupBattleMode].enemyB);
    applySpawnDraftToControls(sanitizeSpawnDraft(getSpawnDraftFromControls(), TACTICAL_MAP));
    syncBattleModeControls();
  }

  function setSpawnSelectValue(select, savedValue, fallback) {
    const values = [...select.options].map((option) => option.value);
    const fallbackValue = `${fallback.row},${fallback.col}`;
    if (values.includes(savedValue)) select.value = savedValue;
    else if (values.includes(fallbackValue)) select.value = fallbackValue;
    else select.value = values[0] || "";
  }

  function readSpawnSelect(select, fallback) {
    const [row, col] = String(select.value).split(",").map(Number);
    const position = { row, col };
    if (inBounds(position) && !isWall(position) && !sameTile(position, TACTICAL_MAP.objective) && !containsTile(TACTICAL_MAP.energyTiles, position)) return position;
    const first = select.options[0]?.value;
    if (first) {
      const [fallbackRow, fallbackCol] = first.split(",").map(Number);
      return { row: fallbackRow, col: fallbackCol };
    }
    return cloneTile(fallback);
  }

  function applyDefaultSpawns() {
    applySpawnDraftToControls(getDefaultSpawnDraft());
  }

  function getSpawnDraftFromControls() {
    const defaults = DEFAULT_SPAWNS[setupBattleMode];
    return {
      player: readSpawnSelect(tacticalUi.playerSpawn, defaults.player),
      playerB: readSpawnSelect(tacticalUi.playerBSpawn, defaults.playerB || DEFAULT_SPAWNS.team.playerB),
      enemy: readSpawnSelect(tacticalUi.enemySpawn, defaults.enemy),
      enemyB: readSpawnSelect(tacticalUi.enemyBSpawn, defaults.enemyB),
    };
  }

  function getDefaultSpawnDraft() {
    const defaults = DEFAULT_SPAWNS[setupBattleMode];
    return {
      player: cloneTile(defaults.player),
      playerB: cloneTile(defaults.playerB || DEFAULT_SPAWNS.team.playerB),
      enemy: cloneTile(defaults.enemy),
      enemyB: cloneTile(defaults.enemyB),
    };
  }

  function getActiveSpawnKeys() {
    if (["team", "online-team"].includes(setupBattleMode)) return ["player", "playerB", "enemy", "enemyB"];
    if (setupBattleMode === "trio") return ["player", "enemy", "enemyB"];
    return ["player", "enemy"];
  }

  function getSpawnToolConfig(tool = mapEditor.tool) {
    return ({
      "spawn-player": { key: "player", label: "我方 A", shortLabel: "我A", tone: "player-a" },
      "spawn-player-b": { key: "playerB", label: "我方 B", shortLabel: "我B", tone: "player-b" },
      "spawn-enemy": { key: "enemy", label: "敌方 A", shortLabel: "敌A", tone: "enemy-a" },
      "spawn-enemy-b": { key: "enemyB", label: "敌方 B", shortLabel: "敌B", tone: "enemy-b" },
    })[tool] || null;
  }

  function isSpawnTool(tool = mapEditor.tool) { return Boolean(getSpawnToolConfig(tool)); }

  function applySpawnDraftToControls(spawns) {
    if (!spawns) return;
    setSpawnControlPosition(tacticalUi.playerSpawn, spawns.player);
    setSpawnControlPosition(tacticalUi.playerBSpawn, spawns.playerB);
    setSpawnControlPosition(tacticalUi.enemySpawn, spawns.enemy);
    setSpawnControlPosition(tacticalUi.enemyBSpawn, spawns.enemyB);
    syncManualSpawnInputs(spawns);
  }

  function setSpawnControlPosition(select, position) {
    if (!select || !position) return;
    const value = keyOf(position);
    if (![...select.options].some((option) => option.value === value)) {
      select.add(new Option(`${coordName(position)} · 自定义出生点`, value));
    }
    select.value = value;
  }

  function getSpawnInputConfig(input) {
    return [
      [tacticalUi.playerSpawnInput, "player", "玩家 A"],
      [tacticalUi.playerBSpawnInput, "playerB", "玩家 B"],
      [tacticalUi.enemySpawnInput, "enemy", "电脑 A"],
      [tacticalUi.enemyBSpawnInput, "enemyB", "电脑 B"],
    ].find(([element]) => element === input) || null;
  }

  function getSpawnInputForKey(key) {
    return ({ player: tacticalUi.playerSpawnInput, playerB: tacticalUi.playerBSpawnInput, enemy: tacticalUi.enemySpawnInput, enemyB: tacticalUi.enemyBSpawnInput })[key] || null;
  }

  function syncManualSpawnInputs(spawns) {
    for (const key of ["player", "playerB", "enemy", "enemyB"]) {
      const input = getSpawnInputForKey(key);
      if (!input || !spawns?.[key]) continue;
      input.value = coordName(spawns[key]);
      input.setCustomValidity("");
      input.classList.remove("is-invalid");
    }
  }

  function parseSpawnCoordinate(value, map = TACTICAL_MAP) {
    const match = String(value || "").trim().toUpperCase().match(/^([A-H])\s*([1-8])$/);
    if (!match) return null;
    const position = { row: ROW_LABELS.indexOf(match[1]), col: Number(match[2]) - 1 };
    return inBounds(position, map) ? position : null;
  }

  function updateManualSpawnInput(input) {
    const config = getSpawnInputConfig(input);
    if (!config) return;
    const [_, key, label] = config;
    const map = mapEditor.active && mapEditor.draft ? mapEditor.draft : TACTICAL_MAP;
    const position = parseSpawnCoordinate(input.value, map);
    const current = mapEditor.active && mapEditor.spawns ? mapEditor.spawns : getSpawnDraftFromControls();
    const invalid = !position || isWall(position, map) || sameTile(position, map.objective) || containsTile(map.energyTiles, position);
    const occupied = !invalid && getActiveSpawnKeys().some((otherKey) => otherKey !== key && sameTile(current[otherKey], position));
    if (invalid || occupied) {
      const reason = invalid ? "请输入可站立的格子，例如 C4；不能使用巨石、据点或能量点。" : "该格已有另一名角色的出生点。";
      input.setCustomValidity(reason);
      input.classList.add("is-invalid");
      if (mapEditor.active) {
        mapEditor.notice = `${label}出生点未修改：${reason}`;
        renderTactical();
      }
      return;
    }
    current[key] = cloneTile(position);
    input.value = coordName(position);
    input.setCustomValidity("");
    input.classList.remove("is-invalid");
    if (mapEditor.active) {
      mapEditor.spawns = current;
      mapEditor.notice = `${label}出生点已设置在 ${coordName(position)}。`;
      renderTactical();
      return;
    }
    applySpawnDraftToControls(current);
    persistSpawnDraft(sanitizeSpawnDraft(current, map));
  }

  function handleManualSpawnInput(event) {
    if (event.type === "keydown" && event.key !== "Enter") return;
    if (event.type === "keydown") event.preventDefault();
    updateManualSpawnInput(event.currentTarget);
  }

  function persistSpawnDraft(spawns) {
    writeStorage(TACTICAL_SETUP_KEY, JSON.stringify({
      mode: setupBattleMode,
      playerSpawn: keyOf(spawns.player),
      playerBSpawn: keyOf(spawns.playerB),
      enemySpawn: keyOf(spawns.enemy),
      enemyBSpawn: keyOf(spawns.enemyB),
    }));
  }

  function syncBattleModeControls() {
    tacticalUi.duelMode.setAttribute("aria-pressed", String(setupBattleMode === "duel"));
    tacticalUi.trioMode.setAttribute("aria-pressed", String(setupBattleMode === "trio"));
    tacticalUi.teamMode.setAttribute("aria-pressed", String(setupBattleMode === "team"));
    tacticalUi.onlineMode.setAttribute("aria-pressed", String(setupBattleMode === "online"));
    tacticalUi.onlineTeamMode?.setAttribute("aria-pressed", String(setupBattleMode === "online-team"));
    for (const field of tacticalUi.playerBSettings) field.hidden = !["team", "online-team"].includes(setupBattleMode);
    for (const field of tacticalUi.enemyBSettings) field.hidden = !["trio", "team"].includes(setupBattleMode);
    tacticalUi.spawnSettings.hidden = false;
    tacticalUi.roomSettings.hidden = !isOnlineSetupMode();
    tacticalUi.applyHeroes.hidden = isOnlineSetupMode();
  }

  function renderMapEditor() {
    if (!tacticalUi.mapEditorPanel || !tacticalUi.mapEditorToggle) return;
    tacticalUi.mapEditorPanel.hidden = !mapEditor.active;
    tacticalUi.mapEditorToggle.setAttribute("aria-pressed", String(mapEditor.active));
    if (!mapEditor.active) return;
    renderMapLibraryControls();
    for (const button of tacticalUi.mapEditorTools.querySelectorAll("[data-map-tool]")) {
      const spawn = getSpawnToolConfig(button.dataset.mapTool);
      button.hidden = Boolean(spawn && !getActiveSpawnKeys().includes(spawn.key));
      button.setAttribute("aria-pressed", String(button.dataset.mapTool === mapEditor.tool));
    }
    tacticalUi.mapEditorHint.textContent = mapEditor.notice || getMapEditorInstruction();
    renderMapEditorSpawnStatus();
  }

  function renderMapEditorSpawnStatus() {
    if (!tacticalUi.mapEditorSpawnStatus) return;
    tacticalUi.mapEditorSpawnStatus.textContent = "";
    const labels = { player: "我方 A", playerB: "我方 B", enemy: "敌方 A", enemyB: "敌方 B" };
    for (const key of getActiveSpawnKeys()) {
      const tool = ({ player: "spawn-player", playerB: "spawn-player-b", enemy: "spawn-enemy", enemyB: "spawn-enemy-b" })[key];
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = `map-editor-spawn-chip ${getSpawnToolConfig(tool).tone}`;
      chip.dataset.mapSpawnTool = tool;
      chip.setAttribute("aria-pressed", String(mapEditor.tool === tool));
      chip.textContent = `${labels[key]}：${coordName(mapEditor.spawns?.[key])}`;
      tacticalUi.mapEditorSpawnStatus.append(chip);
    }
  }

  function getMapEditorInstruction() {
    if (mapEditor.tool === "thin-wall") {
      return mapEditor.anchor
        ? `薄墙：再点一个与 ${coordName(mapEditor.anchor)} 相邻的格子，切换这条边。`
        : "薄墙：先点一个格子，再点相邻格子，切换两格之间的边。";
    }
    const spawn = getSpawnToolConfig(mapEditor.tool);
    if (spawn) return `${spawn.label}出生点：点击可站立格放置，四个出生点不能重合。`;
    return ({
      objective: "据点：点击一个格子设置中央据点。",
      energy: "能量点：点击格子切换初始能量点。",
      bush: "草丛：点击格子切换草丛。",
      wall: "巨石：点击格子切换不可进入的巨石。",
      erase: "擦除：点击格子清除草丛、能量点、巨石和相连薄墙。",
    })[mapEditor.tool] || "选择工具后点击地图。";
  }

  function openMapEditor() {
    if (isTacticalOnline()) {
      setTacticalRoomStatus("房间已开始后暂不编辑地图；请先退出或重开。");
      return;
    }
    tacticalMenuOpen = true;
    mapEditor.active = true;
    mapEditor.tool = mapEditor.tool || "objective";
    mapEditor.anchor = null;
    mapEditor.lastPointerKey = "";
    mapEditor.lastPointerAt = 0;
    mapEditor.draft = cloneMapConfig(activeMapConfig);
    mapEditor.spawns = sanitizeSpawnDraft(getSpawnDraftFromControls(), mapEditor.draft);
    applySpawnDraftToControls(mapEditor.spawns);
    const activeEntry = getActiveMapEntry();
    mapEditor.mapId = activeEntry?.id || "";
    mapEditor.libraryId = activeEntry?.id || "";
    if (tacticalUi.mapEditorName) tacticalUi.mapEditorName.value = activeEntry?.name || "";
    mapEditor.notice = "";
    hideTileTooltip();
    renderTactical();
  }

  function cancelMapEditor() {
    mapEditor.active = false;
    mapEditor.anchor = null;
    mapEditor.draft = null;
    mapEditor.spawns = null;
    mapEditor.mapId = null;
    mapEditor.libraryId = null;
    mapEditor.notice = "";
    mapEditor.lastPointerKey = "";
    mapEditor.lastPointerAt = 0;
    hideTileTooltip();
    renderTactical();
  }

  function resetMapEditorDraft() {
    if (!mapEditor.active) return;
    mapEditor.draft = cloneMapConfig(DEFAULT_TACTICAL_MAP);
    mapEditor.spawns = getDefaultSpawnDraft();
    mapEditor.mapId = "";
    mapEditor.libraryId = "";
    if (tacticalUi.mapEditorName) tacticalUi.mapEditorName.value = "默认地图副本";
    mapEditor.anchor = null;
    mapEditor.notice = "已恢复默认地图与当前模式出生点，点击保存后生效。";
    renderTactical();
  }

  function saveMapEditorDraft() {
    if (!mapEditor.active || !mapEditor.draft || !mapEditor.spawns) return;
    const next = sanitizeMapConfig(mapEditor.draft);
    const spawns = sanitizeSpawnDraft(mapEditor.spawns, next);
    const name = normalizeMapName(tacticalUi.mapEditorName?.value);
    const sourceEntry = readMapLibrary().find((item) => item.id === mapEditor.mapId) || null;
    const updatesSource = Boolean(sourceEntry && sourceEntry.name === name);
    const entry = saveMapLibraryEntry(name, next, spawns, updatesSource ? sourceEntry.id : "");
    const savedAsCopy = Boolean(sourceEntry && !updatesSource);
    writeStorage(TACTICAL_MAP_KEY, JSON.stringify(next));
    persistSpawnDraft(spawns);
    applyMapConfig(next);
    applySpawnDraftToControls(spawns);
    mapEditor.active = false;
    mapEditor.anchor = null;
    mapEditor.draft = null;
    mapEditor.spawns = null;
    mapEditor.mapId = entry.id;
    mapEditor.libraryId = entry.id;
    mapEditor.notice = "";
    initializeTacticalSetup();
    applySpawnDraftToControls(spawns);
    resetTacticalGame();
    addTacticalLog(savedAsCopy ? `地图已另存为「${entry.name}」；原地图「${sourceEntry.name}」已保留。` : `地图「${entry.name}」已保存并启用。`, "score");
    renderTactical();
  }

  function loadSelectedMapFromLibrary() {
    if (!mapEditor.active) return;
    const entry = getSelectedMapLibraryEntry();
    if (!entry) return;
    mapEditor.draft = cloneMapConfig(entry.map);
    mapEditor.spawns = sanitizeSpawnDraft(entry.spawns || getDefaultSpawnDraft(), entry.map);
    mapEditor.mapId = entry.id;
    mapEditor.libraryId = entry.id;
    if (tacticalUi.mapEditorName) tacticalUi.mapEditorName.value = entry.name;
    mapEditor.anchor = null;
    mapEditor.notice = `已载入「${entry.name}」，可继续编辑或保存启用。`;
    renderTactical();
  }

  function deleteSelectedMapFromLibrary() {
    if (!mapEditor.active) return;
    const entry = getSelectedMapLibraryEntry();
    if (!entry) return;
    const next = readMapLibrary().filter((item) => item.id !== entry.id);
    writeMapLibrary(next);
    if (getActiveMapId() === entry.id) setActiveMapId("");
    if (mapEditor.mapId === entry.id) mapEditor.mapId = "";
    if (mapEditor.libraryId === entry.id) mapEditor.libraryId = "";
    if (tacticalUi.mapEditorName?.value === entry.name) tacticalUi.mapEditorName.value = "";
    mapEditor.notice = `已删除「${entry.name}」。当前编辑草稿不会丢失。`;
    renderTactical();
  }

  function setMapEditorTool(event) {
    const button = event.target.closest("[data-map-tool]");
    if (!button) return;
    mapEditor.tool = button.dataset.mapTool;
    mapEditor.anchor = null;
    mapEditor.notice = "";
    renderTactical();
  }

  function setMapEditorSpawnTool(event) {
    const button = event.target.closest("[data-map-spawn-tool]");
    if (!button) return;
    mapEditor.tool = button.dataset.mapSpawnTool;
    mapEditor.anchor = null;
    mapEditor.notice = `已选择${getSpawnToolConfig(mapEditor.tool).label}出生点；点击地图中的可站立格放置。`;
    renderTactical();
  }

  function handleMapEditorTileClick(position, source = "click") {
    if (!mapEditor.active || !mapEditor.draft) return;
    const draft = mapEditor.draft;
    if (!inBounds(position, draft)) return;
    const now = Date.now();
    const positionKey = keyOf(position);
    if (source === "click" && mapEditor.lastPointerKey === positionKey && now - mapEditor.lastPointerAt < 700) return;
    if (source === "pointer") {
      mapEditor.lastPointerKey = positionKey;
      mapEditor.lastPointerAt = now;
    }
    if (isSpawnTool()) {
      setDraftSpawn(position, draft);
      renderTactical();
      return;
    }
    if (mapEditor.tool === "thin-wall") {
      handleThinWallEdit(position, draft);
      renderTactical();
      return;
    }
    mapEditor.anchor = null;
    if (["objective", "energy", "wall"].includes(mapEditor.tool) && isDraftSpawnTile(position)) {
      mapEditor.notice = `${coordName(position)} 已被出生点占用，请先移动该出生点。`;
      renderTactical();
      return;
    }
    mapEditor.notice = "";
    if (mapEditor.tool === "objective") setDraftObjective(draft, position);
    else if (mapEditor.tool === "energy") toggleDraftEnergy(draft, position);
    else if (mapEditor.tool === "bush") toggleDraftBush(draft, position);
    else if (mapEditor.tool === "wall") toggleDraftWall(draft, position);
    else if (mapEditor.tool === "erase") eraseDraftTile(draft, position);
    mapEditor.draft = sanitizeMapConfig(draft);
    renderTactical();
  }

  function setDraftSpawn(position, draft) {
    const config = getSpawnToolConfig();
    if (!config || !mapEditor.spawns) return;
    if (isWall(position, draft) || sameTile(position, draft.objective) || containsTile(draft.energyTiles, position)) {
      mapEditor.notice = `${coordName(position)} 不能作为出生点：请选择普通地面或草丛。`;
      return;
    }
    const occupied = getActiveSpawnKeys().some((key) => key !== config.key && sameTile(mapEditor.spawns[key], position));
    if (occupied) {
      mapEditor.notice = `${coordName(position)} 已有其他出生点。`;
      return;
    }
    mapEditor.spawns[config.key] = cloneTile(position);
    applySpawnDraftToControls(mapEditor.spawns);
    mapEditor.notice = `${config.label}已设置在 ${coordName(position)}。`;
  }

  function isDraftSpawnTile(position) {
    return Boolean(mapEditor.spawns && getActiveSpawnKeys().some((key) => sameTile(mapEditor.spawns[key], position)));
  }

  function sanitizeSpawnDraft(spawns, map) {
    const defaults = getDefaultSpawnDraft();
    const result = {};
    const occupied = [];
    const candidates = [];
    for (let row = 0; row < map.rows; row += 1) {
      for (let col = 0; col < map.cols; col += 1) {
        const tile = { row, col };
        if (!isWall(tile, map) && !sameTile(tile, map.objective) && !containsTile(map.energyTiles, tile)) candidates.push(tile);
      }
    }
    for (const key of ["player", "playerB", "enemy", "enemyB"]) {
      const candidate = spawns[key];
      const valid = candidate && inBounds(candidate, map) && !isWall(candidate, map) && !sameTile(candidate, map.objective) && !containsTile(map.energyTiles, candidate) && !occupied.some((tile) => sameTile(tile, candidate));
      const fallback = [defaults[key], ...candidates].find((tile) => tile && !isWall(tile, map) && !sameTile(tile, map.objective) && !containsTile(map.energyTiles, tile) && !occupied.some((entry) => sameTile(entry, tile)));
      result[key] = cloneTile(valid ? candidate : fallback || defaults[key]);
      occupied.push(result[key]);
    }
    return result;
  }

  function handleThinWallEdit(position, draft) {
    if (!mapEditor.anchor) {
      mapEditor.anchor = cloneTile(position);
      return;
    }
    if (sameTile(mapEditor.anchor, position)) {
      mapEditor.anchor = null;
      return;
    }
    if (!areRawAdjacent(mapEditor.anchor, position, draft)) {
      mapEditor.anchor = cloneTile(position);
      return;
    }
    const key = edgeKey(mapEditor.anchor, position);
    const walls = new Set(draft.thinWalls || []);
    if (walls.has(key)) walls.delete(key);
    else walls.add(key);
    draft.thinWalls = Array.from(walls);
    mapEditor.anchor = cloneTile(position);
  }

  function setDraftObjective(draft, position) {
    draft.objective = cloneTile(position);
    removeTileFromList(draft.walls, position);
    removeTileFromList(draft.bushes, position);
    removeTileFromList(draft.energyTiles, position);
  }

  function toggleDraftEnergy(draft, position) {
    if (sameTile(position, draft.objective) || containsTile(draft.walls, position)) return;
    toggleTileInList(draft.energyTiles, position);
    if (containsTile(draft.energyTiles, position)) removeTileFromList(draft.bushes, position);
  }

  function toggleDraftBush(draft, position) {
    if (sameTile(position, draft.objective) || containsTile(draft.walls, position) || containsTile(draft.energyTiles, position)) return;
    toggleTileInList(draft.bushes, position);
  }

  function toggleDraftWall(draft, position) {
    if (sameTile(position, draft.objective)) return;
    toggleTileInList(draft.walls, position);
    if (containsTile(draft.walls, position)) {
      removeTileFromList(draft.bushes, position);
      removeTileFromList(draft.energyTiles, position);
      removeThinWallsTouching(draft, position);
    }
  }

  function eraseDraftTile(draft, position) {
    removeTileFromList(draft.walls, position);
    removeTileFromList(draft.bushes, position);
    removeTileFromList(draft.energyTiles, position);
    removeThinWallsTouching(draft, position);
  }

  function toggleTileInList(list, position) {
    const index = list.findIndex((tile) => sameTile(tile, position));
    if (index >= 0) list.splice(index, 1);
    else list.push(cloneTile(position));
  }

  function removeTileFromList(list, position) {
    const index = list.findIndex((tile) => sameTile(tile, position));
    if (index >= 0) list.splice(index, 1);
  }

  function removeThinWallsTouching(draft, position) {
    draft.thinWalls = (draft.thinWalls || []).filter((key) => {
      const [first, second] = parseEdgeKey(key);
      return !sameTile(first, position) && !sameTile(second, position);
    });
  }

  function getRequiredPharmacistLoadoutSize() {
    return BALANCE.heroes.pharmacist.loadoutSize || 2;
  }

  function getConfiguredPharmacistLoadout() {
    return pharmacistLoadoutDraft.length === getRequiredPharmacistLoadoutSize()
      ? pharmacistLoadoutDraft.slice()
      : getPlayerPharmacistLoadout();
  }

  function canCommitPharmacistLoadout() {
    if (tacticalUi.playerHero.value !== "pharmacist") return true;
    return pharmacistLoadoutDraft.length === getRequiredPharmacistLoadoutSize();
  }

  function commitPharmacistLoadout() {
    if (!canCommitPharmacistLoadout()) {
      renderTactical();
      return false;
    }
    if (tacticalUi.playerHero.value === "pharmacist") {
      savePlayerPharmacistLoadout(pharmacistLoadoutDraft);
    }
    return true;
  }

  function renderPharmacistLoadoutCards() {
    tacticalUi.cards.textContent = "";
    tacticalUi.cards.classList.add("is-loadout");
    tacticalUi.cards.classList.remove("has-many-actions");
    tacticalUi.filters.hidden = true;
    if (tacticalUi.actionTitle) tacticalUi.actionTitle.textContent = "开局配药";

    const required = getRequiredPharmacistLoadoutSize();
    const panel = document.createElement("section");
    panel.className = "tactical-pharmacist-loadout tactical-loadout-dock";
    panel.setAttribute("aria-label", "药师配药");

    const heading = document.createElement("div");
    heading.className = "loadout-heading";
    const title = document.createElement("span"); title.textContent = "药师配药";
    const status = document.createElement("strong");
    status.textContent = pharmacistLoadoutDraft.length === required
      ? `已选 ${required}/${required}`
      : `已选 ${pharmacistLoadoutDraft.length}/${required}`;
    heading.append(title, status);

    const hint = document.createElement("p");
    hint.className = "loadout-hint";
    hint.textContent = "预备移动前选择 2 个药剂方案；确认后本局不能再更改。";

    const options = document.createElement("div");
    options.className = "tactical-loadout-options";
    for (const option of PHARMACIST_LOADOUT_OPTIONS) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "tactical-loadout-card";
      button.classList.toggle("is-selected", pharmacistLoadoutDraft.includes(option.id));
      const name = document.createElement("strong"); name.textContent = option.name;
      const text = document.createElement("span"); text.textContent = option.text;
      button.append(name, text);
      button.addEventListener("click", () => toggleTacticalPharmacistLoadout(option.id));
      options.append(button);
    }

    const confirm = document.createElement("button");
    confirm.type = "button";
    confirm.className = "loadout-confirm";
    confirm.disabled = pharmacistLoadoutDraft.length !== required;
    confirm.textContent = pharmacistLoadoutDraft.length === required ? "确认配药，进入预备移动" : "请选择 2 个药剂";
    confirm.addEventListener("click", confirmInitialPharmacistLoadout);

    panel.append(heading, hint, options, confirm);
    tacticalUi.cards.append(panel);
  }

  function toggleTacticalPharmacistLoadout(optionId) {
    const selected = pharmacistLoadoutDraft.slice();
    const index = selected.indexOf(optionId);
    if (index >= 0) selected.splice(index, 1);
    else if (selected.length < getRequiredPharmacistLoadoutSize()) selected.push(optionId);
    else {
      selected.shift();
      selected.push(optionId);
    }
    pharmacistLoadoutDraft = selected;
    applyDraftPharmacistLoadoutToPlayer();
    renderTactical();
  }

  function handlePlayerHeroSelectionChanged() {
    if (tacticalUi.playerHero.value === "pharmacist") {
      pharmacistLoadoutDraft = getPlayerPharmacistLoadout();
    }
    if (tacticalUi.playerHero.value === "elf") elfLoadoutDraft = getPlayerElfLoadout();
  }

  function applyDraftPharmacistLoadoutToPlayer() {
    for (const fighter of getPlayerFighters().filter((entry) => entry.heroId === "pharmacist")) {
      fighter.flags.pharmacistLoadout = pharmacistLoadoutDraft.length === getRequiredPharmacistLoadoutSize()
        ? normalizePharmacistLoadout(pharmacistLoadoutDraft)
        : pharmacistLoadoutDraft.slice();
    }
  }

  function isPharmacistLoadoutPhase() {
    return state.tactical?.phase === "loadout" && state.tactical.loadoutPending && getCurrentOpeningLoadout() === "pharmacist";
  }

  function getCurrentOpeningLoadout() {
    const queue = state.tactical?.loadoutQueue || [];
    return queue[state.tactical?.loadoutIndex || 0] || null;
  }

  function completeOpeningLoadout() {
    state.tactical.loadoutIndex = (state.tactical.loadoutIndex || 0) + 1;
    if (getCurrentOpeningLoadout()) return;
    state.tactical.loadoutPending = false;
    state.tactical.phase = "movement";
    state.tactical.selection = "move";
  }

  function confirmInitialPharmacistLoadout() {
    if (!isPharmacistLoadoutPhase() || pharmacistLoadoutDraft.length !== getRequiredPharmacistLoadoutSize()) return;
    applyDraftPharmacistLoadoutToPlayer();
    savePlayerPharmacistLoadout(pharmacistLoadoutDraft);
    completeOpeningLoadout();
    addTacticalLog(`药师完成配药：${getPharmacistLoadoutNames(pharmacistLoadoutDraft)}${getCurrentOpeningLoadout() ? "，接着选择精灵祝福。" : "，进入预备移动。"}`, "move");
    renderTactical();
  }

  function getPharmacistLoadoutNames(loadout) {
    return loadout
      .map((id) => PHARMACIST_LOADOUT_OPTIONS.find((option) => option.id === id)?.name)
      .filter(Boolean)
      .join(" / ");
  }

  function getRequiredElfLoadoutSize() { return BALANCE.heroes.elf.loadoutSize || 2; }

  function getConfiguredElfLoadout() {
    return elfLoadoutDraft.length === getRequiredElfLoadoutSize() ? elfLoadoutDraft.slice() : getPlayerElfLoadout();
  }

  function isElfLoadoutPhase() {
    return state.tactical?.phase === "loadout" && state.tactical.loadoutPending && getCurrentOpeningLoadout() === "elf";
  }

  function applyDraftElfLoadoutToPlayer() {
    for (const fighter of getPlayerFighters().filter((entry) => entry.heroId === "elf")) {
      fighter.flags.elfLoadout = elfLoadoutDraft.length === getRequiredElfLoadoutSize()
        ? normalizeElfLoadout(elfLoadoutDraft)
        : elfLoadoutDraft.slice();
    }
  }

  function renderElfLoadoutCards() {
    tacticalUi.cards.textContent = "";
    tacticalUi.cards.classList.add("is-loadout");
    tacticalUi.cards.classList.remove("has-many-actions");
    tacticalUi.filters.hidden = true;
    if (tacticalUi.actionTitle) tacticalUi.actionTitle.textContent = "开局祝福";
    const required = getRequiredElfLoadoutSize();
    const panel = document.createElement("section");
    panel.className = "tactical-pharmacist-loadout tactical-loadout-dock";
    panel.setAttribute("aria-label", "精灵祝福选择");
    const heading = document.createElement("div"); heading.className = "loadout-heading";
    const title = document.createElement("span"); title.textContent = "精灵祝福";
    const status = document.createElement("strong"); status.textContent = `已选 ${elfLoadoutDraft.length}/${required}`;
    heading.append(title, status);
    const hint = document.createElement("p"); hint.className = "loadout-hint"; hint.textContent = "预备移动前选择 2 个主动技；确认后本局不能再更改。";
    const options = document.createElement("div"); options.className = "tactical-loadout-options";
    for (const option of ELF_LOADOUT_OPTIONS) {
      const button = document.createElement("button"); button.type = "button"; button.className = "tactical-loadout-card";
      button.classList.toggle("is-selected", elfLoadoutDraft.includes(option.id));
      const name = document.createElement("strong"); name.textContent = option.name;
      const text = document.createElement("span"); text.textContent = option.text;
      button.append(name, text);
      button.addEventListener("click", () => {
        const selected = elfLoadoutDraft.slice(); const index = selected.indexOf(option.id);
        if (index >= 0) selected.splice(index, 1);
        else if (selected.length < required) selected.push(option.id);
        else { selected.shift(); selected.push(option.id); }
        elfLoadoutDraft = selected;
        applyDraftElfLoadoutToPlayer();
        renderTactical();
      });
      options.append(button);
    }
    const confirm = document.createElement("button"); confirm.type = "button"; confirm.className = "loadout-confirm";
    confirm.disabled = elfLoadoutDraft.length !== required;
    confirm.textContent = elfLoadoutDraft.length === required ? "确认祝福，进入预备移动" : "请选择 2 个主动技";
    confirm.addEventListener("click", () => {
      if (!isElfLoadoutPhase() || elfLoadoutDraft.length !== required) return;
      applyDraftElfLoadoutToPlayer(); savePlayerElfLoadout(elfLoadoutDraft);
      completeOpeningLoadout();
      addTacticalLog(`精灵完成祝福选择：${elfLoadoutDraft.map((id) => ELF_LOADOUT_OPTIONS.find((option) => option.id === id)?.name).filter(Boolean).join(" / ")}，进入预备移动。`, "move");
      renderTactical();
    });
    panel.append(heading, hint, options, confirm);
    tacticalUi.cards.append(panel);
  }

  function resetTacticalGame() {
    stopTacticalOnlinePolling();
    mapEditor.active = false;
    mapEditor.anchor = null;
    mapEditor.draft = null;
    TACTICAL_MAP.energyTiles = getInitialEnergyTiles();
    state.round = 0;
    const setupIsOnline = isOnlineSetupMode();
    const battleMode = setupBattleMode === "online-team" ? "team" : setupBattleMode === "online" ? "duel" : setupBattleMode;
    const openingHeroes = [tacticalUi.playerHero.value, battleMode === "team" ? tacticalUi.playerBHero.value : null];
    const loadoutQueue = !setupIsOnline
      ? ["pharmacist", "elf"].filter((heroId) => openingHeroes.includes(heroId))
      : [];
    const needsLoadout = loadoutQueue.length > 0;
    if (needsLoadout) pharmacistLoadoutDraft = getPlayerPharmacistLoadout();
    if (needsLoadout) elfLoadoutDraft = getPlayerElfLoadout();
    state.mode = battleMode === "team" ? "tactical-team" : battleMode === "trio" ? "tactical-trio" : "cpu";
    state.over = false;
    state.matchRecorded = false;
    state.pendingEndChoice = null;
    state.tactical = { phase: needsLoadout ? "loadout" : "movement", selection: needsLoadout ? "loadout" : "move", path: [], selectedCardId: null, selectedTarget: null, selectedTargetId: null, selectedTargets: [], filter: normalizeActionFilter(state.tactical?.filter), playerScore: 0, enemyScore: 0, objectiveHeld: {}, flames: [], temporaryThinWalls: [], winReason: "", resolving: false, loadoutPending: needsLoadout, loadoutQueue, loadoutIndex: 0, standbyAutoPassScheduled: false, battleMageImprint: false, prepRound: true, pendingEndChoice: null, battleMode, online: null, activePlayerId: "p1", lockedPlans: { movement: {}, action: {} }, spawnPoints: {} };
    const playerName = normalizePlayerName(tacticalUi.playerName.value);
    tacticalUi.playerName.value = playerName;
    writeStorage(STORAGE_KEYS.playerName, playerName);
    state.player = makeFighter(playerName, tacticalUi.playerHero.value, { pharmacistLoadout: getConfiguredPharmacistLoadout(), elfLoadout: getConfiguredElfLoadout() });
    state.playerB = battleMode === "team" ? makeFighter(`${playerName} B`, tacticalUi.playerBHero.value, { pharmacistLoadout: getConfiguredPharmacistLoadout(), elfLoadout: getConfiguredElfLoadout() }) : null;
    state.enemy = makeFighter(["trio", "team"].includes(battleMode) ? "电脑 A" : "电脑", tacticalUi.enemyHero.value);
    state.enemyB = ["trio", "team"].includes(battleMode) ? makeFighter("电脑 B", tacticalUi.enemyBHero.value) : null;
    state.player.id = "p1";
    if (state.playerB) state.playerB.id = "p2";
    state.enemy.id = "ai-a";
    if (state.enemyB) state.enemyB.id = "ai-b";
    applyDraftPharmacistLoadoutToPlayer();
    const defaults = DEFAULT_SPAWNS[battleMode];
    const spawns = {
      player: readSpawnSelect(tacticalUi.playerSpawn, defaults.player),
      playerB: readSpawnSelect(tacticalUi.playerBSpawn, defaults.playerB || DEFAULT_SPAWNS.team.playerB),
      enemy: readSpawnSelect(tacticalUi.enemySpawn, defaults.enemy),
      enemyB: readSpawnSelect(tacticalUi.enemyBSpawn, defaults.enemyB),
    };
    const spawnList = battleMode === "team" ? [spawns.player, spawns.playerB, spawns.enemy, spawns.enemyB] : battleMode === "trio" ? [spawns.player, spawns.enemy, spawns.enemyB] : [spawns.player, spawns.enemy];
    if (new Set(spawnList.map(keyOf)).size !== spawnList.length) {
      Object.assign(spawns, {
        player: cloneTile(defaults.player), playerB: cloneTile(defaults.playerB || DEFAULT_SPAWNS.team.playerB), enemy: cloneTile(defaults.enemy), enemyB: cloneTile(defaults.enemyB),
      });
      applyDefaultSpawns();
    }
    placeFighter(state.player, spawns.player);
    if (state.playerB) placeFighter(state.playerB, spawns.playerB);
    placeFighter(state.enemy, spawns.enemy);
    if (state.enemyB) placeFighter(state.enemyB, spawns.enemyB);
    state.tactical.spawnPoints = Object.fromEntries(getAllTacticalFighters().map((fighter) => [fighter.id, cloneTile(fighter.position)]));
    state.melee.fighters = getAllTacticalFighters();
    clearTacticalLog();
    const enemyNames = getEnemyFighters().map((fighter) => `${fighter.label}·${getHeroDisplayName(fighter.hero)}`).join("、");
    const playerNames = getPlayerFighters().map((fighter) => getHeroDisplayName(fighter.hero)).join("、");
    addTacticalLog(`战局开始：${playerNames} 对阵 ${enemyNames}。预备回合只能移动 1 格。`, "move");
    writeStorage(TACTICAL_SETUP_KEY, JSON.stringify({
      mode: battleMode,
      playerSpawn: tacticalUi.playerSpawn.value,
      playerBSpawn: tacticalUi.playerBSpawn.value,
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

  function normalizeActionFilter(filter) {
    return ACTION_FILTERS.has(filter) ? filter : "recommended";
  }

  function getActionTargetingMode(action) {
    if (!action) return "none";
    if (action.tacticalEffect === "firebomb") return "tile-pair";
    if (action.effects?.buildThinWall) return "neighbor-tile";
    if (action.kind === "attack") return "any-fighter-range";
    if (action.id === "astrologer-predict") return "enemy-range";
    if (action.id === "mage-lightning") return "any-fighter-range";
    if (action.id === "mage-thunder-strike") return "enemy-range";
    if (["elf-elven-aura", "elf-holy-aura", "elf-energy-transfer"].includes(action.id)) return "ally";
    if (isTeamBattle() && ["priest-shield", "priest-heal", "pharmacist-invincible-potion"].includes(action.id)) return "ally";
    // In this 1v1 prototype, self-support skills retain their legacy default
    // target.  Priest's ally targeting remains available to the retained melee
    // rules, while the map shell only asks for enemy tiles when required.
    if (["astrologer-drain", "pharmacist-poison", "pharmacist-revive", "dancer-spin", "dancer-grand-spin", "elf-bind"].includes(action.id)) return "enemy";
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

  function getFirebombTargetableTiles(source = getActivePlayer().position) {
    const action = getSelectedAction();
    const selected = getSelectedTargets();
    const candidates = neighbors(source);
    if (!action || action.tacticalEffect !== "firebomb" || selected.length >= action.targetCount) return [];
    if (!selected.length) return candidates;
    return candidates.filter((candidate) => !sameTile(candidate, selected[0]) && areTilesConnected(candidate, selected[0]));
  }

  function isValidFirebombTargetPair(source, targets) {
    return targets.length === 2
      && targets.every((target) => areTilesConnected(source, target))
      && areTilesConnected(targets[0], targets[1]);
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
    const steps = getRouteDistance(source, target, distance);
    return steps >= 0 && steps <= distance;
  }

  function getRouteDistance(source, target, maxSteps = Infinity, map = TACTICAL_MAP) {
    if (!source || !target || !inBounds(source, map) || !inBounds(target, map) || isWall(target, map)) return Infinity;
    if (sameTile(source, target)) return 0;
    const seen = new Map([[keyOf(source), 0]]);
    const queue = [cloneTile(source)];
    while (queue.length) {
      const current = queue.shift();
      const steps = seen.get(keyOf(current));
      if (steps >= maxSteps) continue;
      for (const next of neighbors(current, map)) {
        if (seen.has(keyOf(next))) continue;
        const nextSteps = steps + 1;
        if (sameTile(next, target)) return nextSteps;
        seen.set(keyOf(next), nextSteps);
        queue.push(next);
      }
    }
    return Infinity;
  }

  function areTilesConnected(first, second, map = TACTICAL_MAP) {
    return getRouteDistance(first, second, 1, map) === 1;
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
    syncTutorialProgress();
    const tactical = state.tactical;
    const visualPhase = state.over ? "finished" : tactical.phase;
    tacticalUi.shell.dataset.phase = visualPhase;
    tacticalUi.shell.dataset.battleMode = tactical.battleMode;
    tacticalUi.shell.classList.toggle("is-targeting", tactical.selection === "target");
    tacticalUi.shell.classList.toggle("is-map-editing", mapEditor.active);
    tacticalUi.shell.classList.toggle("is-menu-open", tacticalMenuOpen);
    tacticalUi.menuBackdrop.hidden = !tacticalMenuOpen;
    tacticalUi.menuBackdrop.classList.toggle("is-map-editing", mapEditor.active);
    tacticalUi.menuButton.setAttribute("aria-expanded", String(tacticalMenuOpen));
    tacticalUi.round.textContent = isPreparationRound() ? "预备回合" : `第 ${state.round} 回合`;
    if (tacticalUi.mapName) tacticalUi.mapName.textContent = getCurrentMapName();
    tacticalUi.modeLabel.textContent = tactical.battleMode === "online-team" ? "在线 2v2" : tactical.battleMode === "online" ? "在线 1v1" : tactical.battleMode === "team" ? "2v2 小队战" : tactical.battleMode === "trio" ? "1v2 围攻" : "1v1 战术";
    tacticalUi.phase.textContent = tactical.phase === "resolving" ? "结算阶段" : state.over ? "对局结束" : tactical.phase === "loadout" ? "配药阶段" : isPreparationRound() ? "预备移动" : tactical.phase === "movement" ? "移动阶段" : "出招阶段";
    tacticalUi.phase.dataset.phase = visualPhase;
    tacticalUi.score.textContent = `总分 ${tactical.playerScore} : ${tactical.enemyScore} / ${scoringRules.victoryScore}`;
    tacticalUi.score.classList.toggle("score-flash", Boolean(tactical.lastScore));
    tacticalUi.scoring.title = `击杀 ${scoringRules.killScore} 分 · 据点 ${scoringRules.objectiveScore} 分 · ${scoringRules.victoryScore} 分获胜`;
    const onlineLocked = isTacticalOnline();
    tacticalUi.playerHero.disabled = onlineLocked;
    tacticalUi.playerBHero.disabled = onlineLocked;
    tacticalUi.enemyHero.disabled = onlineLocked;
    tacticalUi.enemyBHero.disabled = onlineLocked;
    tacticalUi.playerName.disabled = onlineLocked;
    tacticalUi.createRoom.disabled = onlineLocked;
    tacticalUi.joinRoom.disabled = onlineLocked;
    tacticalUi.roomCode.disabled = onlineLocked;
    tacticalUi.mapHint.textContent = getMapHint();
    const activePlayer = getActivePlayer();
    renderCombatant(tacticalUi.playerCard, activePlayer, isTeamBattle() ? `当前操控 · ${activePlayer.label}` : "玩家", "player");
    const compactEnemyTeam = isTeamBattle();
    tacticalUi.enemyCard.hidden = compactEnemyTeam;
    tacticalUi.enemyBCard.hidden = compactEnemyTeam || !state.enemyB;
    if (!compactEnemyTeam) {
      renderCombatant(tacticalUi.enemyCard, state.enemy, state.enemyB ? "电脑 A" : "敌方", "enemy");
      if (state.enemyB) renderCombatant(tacticalUi.enemyBCard, state.enemyB, "电脑 B", "enemy");
    }
    renderPlayerTeamOverview();
    renderEnemyTeamOverview();
    renderMap();
    renderCards();
    renderPreview();
    renderMapEditor();
    renderTutorialGuide();
    schedulePuppetStandbyPass();
    publishTactical3dSnapshot();
  }

  function getTactical3dSnapshot() {
    const map = getRenderedMapConfig();
    const tactical = state.tactical;
    const active = getActivePlayer();
    const reachable = !mapEditor.active && tactical.phase === "movement"
      ? [...getReachableTiles(active.position, getCurrentMoveLimit(), getVisibleOccupiedTiles(active)).values()].map((entry) => cloneTile(entry.tile)) : [];
    const fighters = getAllTacticalFighters().filter((fighter) => !fighter.flags?.tacticalRespawnRound).map((fighter) => {
      const team = getFighterTeam(fighter);
      const visible = team === "player" || isFighterVisibleToTeam(fighter, "player");
      return {
        id: fighter.id,
        team,
        position: cloneTile(fighter.position),
        heroId: fighter.heroId,
        label: fighter.label,
        hp: fighter.hp,
        xp: fighter.xp,
        active: fighter.id === active.id,
        visible,
        avatar: fighter.heroId === "werewolf" && fighter.flags?.berserk ? HERO_AVATARS.werewolfBerserk : HERO_AVATARS[fighter.heroId],
      };
    });
    return {
      rows: map.rows, cols: map.cols, phase: tactical.phase, selection: tactical.selection,
      objective: cloneTile(map.objective), walls: map.walls.map(cloneTile), bushes: map.bushes.map(cloneTile), energyTiles: map.energyTiles.map(cloneTile), thinWalls: map.thinWalls.slice(),
      flames: (tactical.flames || []).map((flame) => cloneTile(flame.position || flame)),
      path: tactical.path.map(cloneTile), reachable, targetable: getTargetableTiles().map(cloneTile), selectedTargets: getSelectedTargets().map(cloneTile), fighters,
    };
  }

  function publishTactical3dSnapshot() {
    const snapshot = getTactical3dSnapshot();
    window.__JI_TACTICAL_3D_SNAPSHOT__ = snapshot;
    window.renderJiTactical3d?.(snapshot);
  }

  function renderPlayerTeamOverview() {
    const overview = tacticalUi.playerOverview;
    overview.textContent = "";
    overview.hidden = !isTeamBattle();
    if (!isTeamBattle()) return;
    const heading = document.createElement("div"); heading.className = "player-team-heading";
    const title = document.createElement("strong"); title.textContent = "己方双英雄";
    const phase = document.createElement("span"); phase.textContent = state.tactical.phase === "movement" ? "依次规划移动" : state.tactical.phase === "action" ? "依次选择行动" : "同步结算";
    heading.append(title, phase);
    const members = document.createElement("div"); members.className = "player-team-members";
    const locked = state.tactical.lockedPlans?.[state.tactical.phase] || {};
    for (const fighter of getPlayerFighters()) {
      const button = document.createElement("button"); button.type = "button"; button.dataset.playerFighterId = fighter.id;
      button.className = "player-team-member";
      button.classList.toggle("is-active", fighter.id === state.tactical.activePlayerId);
      button.classList.toggle("is-locked", Boolean(locked[fighter.id]));
      button.classList.toggle("is-out", isFighterDefeated(fighter));
      button.disabled = state.tactical.resolving || state.over || Boolean(locked[fighter.id]) || isFighterDefeated(fighter);
      const avatar = makeAvatar(fighter); avatar.removeAttribute("tabindex");
      const copy = document.createElement("span"); copy.className = "player-team-copy";
      const name = document.createElement("strong"); name.textContent = getHeroDisplayName(fighter.hero);
      const stats = document.createElement("span"); stats.textContent = `${formatTacticalHearts(fighter)} · ${fighter.xp} XP`;
      const status = document.createElement("em");
      status.textContent = fighter.flags?.tacticalRespawnRound ? `第 ${fighter.flags.tacticalRespawnRound} 回合复活` : isFighterDefeated(fighter) ? "等待复活" : locked[fighter.id] ? "已锁定" : fighter.id === state.tactical.activePlayerId ? "规划中" : "待规划";
      copy.append(name, stats, status); button.append(avatar, copy); members.append(button);
    }
    overview.append(heading, members);
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
      const concealed = !isFighterVisibleToTeam(fighter, "player");
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
      member.classList.toggle("is-concealed", concealed);
      member.disabled = !canTarget;
      member.setAttribute("aria-pressed", String(isSelected));

      const avatar = document.createElement("span"); avatar.className = "enemy-team-avatar";
      const source = fighter.heroId === "werewolf" && fighter.flags?.berserk ? HERO_AVATARS.werewolfBerserk : HERO_AVATARS[fighter.heroId];
      if (concealed) avatar.textContent = "?";
      else if (source) {
        const image = document.createElement("img"); image.src = source; image.alt = "";
        image.addEventListener("error", () => { image.remove(); avatar.textContent = "?"; }, { once: true });
        avatar.append(image);
      } else avatar.textContent = "?";

      const identity = document.createElement("span"); identity.className = "enemy-team-identity";
      const name = document.createElement("strong"); name.textContent = concealed ? "未发现目标" : fighter.label;
      const stats = document.createElement("span"); stats.textContent = concealed ? "HP ? · XP ?" : `${formatTacticalHearts(fighter)} · ${fighter.xp} XP`;
      const stateText = document.createElement("span"); stateText.className = "enemy-team-state";
      stateText.textContent = concealed ? "位置未知" : fighter.flags?.tacticalRespawnRound ? `R${fighter.flags.tacticalRespawnRound} 复活` : isFighterDefeated(fighter) ? "出局" : isSelected ? "已选目标" : `位置 ${coordName(fighter.position)}`;
      identity.append(name, stats, stateText);
      member.append(avatar, identity);
      members.append(member);
    }
    overview.append(heading, members);
  }

  function getMapHint() {
    if (mapEditor.active) return getMapEditorInstruction();
    if (state.over) return state.tactical.winReason || "对局结束。点击重开开始新战局。";
    if (isTacticalOnline() && !getTacticalOnline()?.initialized) return "房间已创建，等待另一位玩家加入。";
    if (isPharmacistLoadoutPhase()) return "药师开局需要先在行动卡区域选择 2 个配方，确认后进入预备移动。";
    if (isElfLoadoutPhase()) return "精灵开局需要先在行动卡区域选择 2 个祝福，确认后进入预备移动。";
    if (state.tactical.phase === "resolving") return "双方计划已揭示，正在同时结算。";
    if (isPreparationRound()) return "预备回合：双方只能移动 1 格，不会触发出招。";
    if (state.tactical.phase === "movement") return isTeamBattle() ? `正在规划${getActivePlayer().label}：选择至多 1 格移动，两个己方计划锁定后四人同时移动。` : "先选择至多 1 格移动路径，锁定后双方同时移动。";
    const action = getSelectedAction();
    if (state.tactical.selection === "target" && action?.tacticalEffect === "firebomb") {
      return getSelectedTargets().length ? "继续选择与第一格连续的相邻格。" : "先选择燃烧弹覆盖的第一格。";
    }
    if (state.tactical.selection === "target") {
      if (getActionTargetingMode(action) === "ally") return "选择一名己方英雄作为辅助技能目标。";
      if (getActionTargetingMode(action) === "neighbor-tile") return "选择周围六个格子之一，在你和该格之间筑起薄墙。";
      if (getActionTargetingMode(action) === "any-fighter-range") return `选择距离 ${getActionRange(action)} 内任意英雄。`;
      return ["adjacent-tile", "enemy-range"].includes(getActionTargetingMode(action))
        ? `选择目标：敌方必须在距离 ${getActionRange(action)} 内。`
        : "选择敌方当前格作为技能目标。";
    }
    if (action) return isTeamBattle() ? `${getActivePlayer().label}行动已选择。确认目标后锁定。` : "行动已选择。确认目标后锁定出招。";
    return isTeamBattle() ? `移动已结算。现在为${getActivePlayer().label}选择行动卡。` : "移动已结算。选择一张行动卡开始出招。";
  }

  function renderCombatant(container, fighter, role, side) {
    container.textContent = "";
    const concealed = side.startsWith("enemy") && !isFighterVisibleToTeam(fighter, "player");
    const canChangeHero = !isTacticalOnline() && !concealed;
    container.classList.toggle("combatant-selectable", canChangeHero);
    container.classList.toggle("is-concealed", concealed);
    container.tabIndex = canChangeHero ? 0 : -1;
    container.title = concealed ? "该敌人当前处于视野外" : canChangeHero ? "点击角色框选择英雄；点击头像查看英雄详情" : "点击头像查看英雄详情";
    if (concealed) {
      container.setAttribute("aria-label", `${role}目标处于视野外`);
      const top = document.createElement("div"); top.className = "combatant-top";
      const copy = document.createElement("div");
      const roleLine = document.createElement("div"); roleLine.className = "combatant-role"; roleLine.textContent = role;
      const name = document.createElement("h2"); name.className = "combatant-name"; name.textContent = "未发现目标";
      const location = document.createElement("div"); location.className = "combatant-role"; location.textContent = "位置未知";
      const avatar = document.createElement("div"); avatar.className = "combatant-avatar concealed-avatar"; avatar.textContent = "?";
      copy.append(roleLine, name, location); top.append(copy, avatar);
      const stats = document.createElement("div"); stats.className = "combatant-stats";
      stats.append(makeStatLine("HP", "?", "hp-value"), makeStatLine("XP", "?", "xp-value"));
      const statuses = document.createElement("div"); statuses.className = "status-list";
      const pill = document.createElement("span"); pill.className = "status-pill positive"; pill.textContent = "隐形"; statuses.append(pill);
      container.append(top, stats, statuses);
      container.classList.remove("is-targeted", "is-out", "card-shake");
      container.dataset.side = side;
      return;
    }
    container.setAttribute("aria-label", canChangeHero
      ? `${role}${getHeroDisplayName(fighter.hero)}。点击选择英雄，点击头像查看详情`
      : `${role}${getHeroDisplayName(fighter.hero)}。点击头像查看英雄详情`);
    const top = document.createElement("div"); top.className = "combatant-top";
    const copy = document.createElement("div");
    const roleLine = document.createElement("div"); roleLine.className = "combatant-role"; roleLine.textContent = role;
    const name = document.createElement("h2"); name.className = "combatant-name"; name.textContent = getHeroDisplayName(fighter.hero);
    const location = document.createElement("div"); location.className = "combatant-role"; location.textContent = fighter.flags?.tacticalRespawnRound ? `等待第 ${fighter.flags.tacticalRespawnRound} 回合在出生点复活` : `位置 ${coordName(fighter.position)} · 移动 ${fighter.movePoints}/${fighter.maxMovePoints}`;
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
        pill.textContent = formatStatusTag(entry, fighter);
        statuses.append(pill);
      }
    }
    container.append(top, stats, statuses);
    container.classList.toggle("card-shake", false);
    container.classList.toggle("is-targeted", state.tactical.selectedTargetId === fighter.id);
    container.classList.toggle("is-out", isFighterDefeated(fighter));
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
    const shieldHearts = fighter.heroId === "puppet" && fighter.flags?.puppetShield > 0 ? "💙" : "";
    const reserveHp = fighter.heroId === "puppet" && fighter.flags?.puppetStandby ? fighter.flags.puppetStandbyHp || 0 : 0;
    const reserveHearts = reserveHp > 0 ? "💙".repeat(reserveHp) : "";
    return [trueHearts, shieldHearts, reserveHearts].filter(Boolean).join("") || "0";
  }

  function makeAvatar(fighter) {
    const avatar = document.createElement("div"); avatar.className = "combatant-avatar"; avatar.tabIndex = 0; avatar.title = "查看英雄详情"; avatar.dataset.heroDetails = "true";
    const source = fighter.heroId === "werewolf" && fighter.flags?.berserk ? HERO_AVATARS.werewolfBerserk : HERO_AVATARS[fighter.heroId];
    if (!source) { avatar.textContent = "?"; return avatar; }
    const image = document.createElement("img"); image.src = source; image.alt = getHeroDisplayName(fighter.hero);
    image.addEventListener("error", () => { avatar.textContent = "?"; image.remove(); }, { once: true });
    avatar.append(image); return avatar;
  }

  function getMapRenderSignature(map, tactical, activePlayer) {
    const fighters = getAllTacticalFighters().map((fighter) => ({
      id: fighter.id,
      heroId: fighter.heroId,
      hp: fighter.hp,
      xp: fighter.xp,
      position: fighter.position,
      statuses: (fighter.statuses || []).map((status) => [status.id, status.turns]),
      respawnRound: fighter.flags?.tacticalRespawnRound || 0,
      berserk: Boolean(fighter.flags?.berserk),
      flags: fighter.flags || {},
    }));
    return JSON.stringify({
      map,
      round: state.round,
      phase: tactical.phase,
      selection: tactical.selection,
      activePlayerId: activePlayer?.id || "",
      path: tactical.path,
      selectedCardId: tactical.selectedCardId,
      selectedTarget: tactical.selectedTarget,
      selectedTargetId: tactical.selectedTargetId,
      selectedTargets: tactical.selectedTargets,
      flames: tactical.flames,
      temporaryThinWalls: tactical.temporaryThinWalls,
      mapEditor: mapEditor.active ? { tool: mapEditor.tool, anchor: mapEditor.anchor, draft: mapEditor.draft, spawns: mapEditor.spawns } : null,
      fighters,
    });
  }

  function renderMap() {
    hideTileTooltip();
    const map = getRenderedMapConfig();
    const tactical = state.tactical;
    const pathKeys = new Map(tactical.path.map((tile, index) => [keyOf(tile), index + 1]));
    const activePlayer = getActivePlayer();
    const reachable = !mapEditor.active && tactical.phase === "movement"
      ? getReachableTiles(activePlayer.position, getCurrentMoveLimit(), getVisibleOccupiedTiles(activePlayer)) : new Map();
    const targetable = mapEditor.active ? [] : getTargetableTiles();
    const signature = getMapRenderSignature(map, tactical, activePlayer);
    if (signature === lastMapRenderSignature) return;
    lastMapRenderSignature = signature;
    tacticalUi.map.textContent = "";
    const board = document.createElement("div");
    board.className = "iso-battle-board";
    board.setAttribute("role", "presentation");
    const columnLabels = document.createElement("div"); columnLabels.className = "iso-column-labels";
    const rowLabels = document.createElement("div"); rowLabels.className = "iso-row-labels";
    const grid = document.createElement("div"); grid.className = "iso-battle-grid";
    const thinWallLayer = document.createElement("div"); thinWallLayer.className = "iso-thin-wall-layer";
    const unitLayer = document.createElement("div"); unitLayer.className = "iso-unit-layer";
    // Keep the existing pointy-top game topology. These are only display coordinates:
    // the wider footprint gives the board its oblique/isometric read without altering
    // distance, neighbors, editor clicks, or tactical pathfinding.
    const layout = { width: 1280, height: 800, originX: 112, originY: 104, dx: 140, dy: 84, oddOffset: 70, tileWidth: 140, tileHeight: 112 };
    for (let col = 0; col < map.cols; col += 1) {
      const label = document.createElement("span");
      label.className = "iso-grid-label iso-column-label";
      label.textContent = String(col + 1);
      label.style.setProperty("--label-x", `${((layout.originX + col * layout.dx) / layout.width) * 100}%`);
      columnLabels.append(label);
    }
    for (let row = 0; row < map.rows; row += 1) {
      const rowLabel = document.createElement("span");
      rowLabel.className = "iso-grid-label iso-row-label";
      rowLabel.textContent = ROW_LABELS[row];
      rowLabel.style.setProperty("--label-y", `${((layout.originY + row * layout.dy) / layout.height) * 100}%`);
      rowLabels.append(rowLabel);
      for (let col = 0; col < map.cols; col += 1) {
        const position = { row, col };
        const tile = makeRenderedMapTile(position, map, { activePlayer, reachable, targetable, pathKeys });
        const { centerX, centerY } = getIsoTileCenter(position, layout);
        tile.classList.add("iso-tile");
        tile.style.setProperty("--iso-left", `${((centerX - layout.tileWidth / 2) / layout.width) * 100}%`);
        tile.style.setProperty("--iso-top", `${((centerY - layout.tileHeight / 2) / layout.height) * 100}%`);
        tile.style.setProperty("--iso-width", `${(layout.tileWidth / layout.width) * 100}%`);
        tile.style.setProperty("--iso-height", `${(layout.tileHeight / layout.height) * 100}%`);
        grid.append(tile);
      }
    }
    appendThinWallOverlay(thinWallLayer, map, layout);
    appendMapUnits(unitLayer, layout);
    board.append(columnLabels, rowLabels, grid, thinWallLayer, unitLayer);
    tacticalUi.map.append(board);
  }

  function getIsoTileCenter(position, layout) {
    return {
      centerX: layout.originX + position.col * layout.dx + ((position.row & 1) ? layout.oddOffset : 0),
      centerY: layout.originY + position.row * layout.dy,
    };
  }

  function appendMapUnits(unitLayer, layout) {
    const addUnit = (fighter, side) => {
      if (!fighter?.position || fighter.flags?.tacticalRespawnRound) return;
      const { centerX, centerY } = getIsoTileCenter(fighter.position, layout);
      const unit = makeUnitToken(fighter, side);
      unit.classList.add("map-unit");
      unit.style.setProperty("--unit-left", `${(centerX / layout.width) * 100}%`);
      unit.style.setProperty("--unit-top", `${(centerY / layout.height) * 100}%`);
      unitLayer.append(unit);
    };
    for (const player of getPlayerFighters()) addUnit(player, player.id === "p2" ? "player-b" : "player");
    if (state.enemy && isFighterVisibleToTeam(state.enemy, "player")) addUnit(state.enemy, "enemy");
    if (state.enemyB && isFighterVisibleToTeam(state.enemyB, "player")) addUnit(state.enemyB, "enemy-b");
  }

  function getTacticalFacingBetween(start, end) {
    if (!start || !end || sameTile(start, end)) return null;
    const startX = start.col + ((start.row & 1) ? 0.5 : 0);
    const endX = end.col + ((end.row & 1) ? 0.5 : 0);
    const horizontal = endX - startX;
    const vertical = end.row - start.row;
    if (!vertical) return horizontal >= 0 ? "right" : "left";
    if (vertical < 0) return horizontal >= 0 ? "upRight" : "upLeft";
    return horizontal >= 0 ? "downRight" : "downLeft";
  }

  function getTacticalFacing(fighter) {
    return fighter?.facing || "right";
  }

  function getTacticalStandeeVisualFacing(facing) {
    return ({ left: "right", upLeft: "upRight", downLeft: "downRight" })[facing] || facing || "right";
  }

  function applyTacticalFacing(element, facing) {
    if (!element || !facing) return;
    element.classList.remove("facing-right", "facing-left", "facing-up-right", "facing-up-left", "facing-down-right", "facing-down-left");
    element.classList.add(`facing-${facing.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`);
  }

  function makeRenderedMapTile(position, map, context) {
    const { activePlayer, reachable, targetable, pathKeys } = context;
    const terrainType = tileType(position, map);
    const tile = document.createElement("button"); tile.type = "button"; tile.className = `map-tile hex-tile ${terrainType}`;
    tile.dataset.row = String(position.row); tile.dataset.col = String(position.col); tile.setAttribute("role", "gridcell"); tile.setAttribute("aria-label", `${coordName(position)} ${describeTerrain(position, map)}`);
    const tooltipText = getTileTooltipText(position, map);
    if (tooltipText) {
      tile.classList.add("has-tile-tooltip");
      tile.addEventListener("mouseenter", () => scheduleTileTooltip(tile, tooltipText));
      tile.addEventListener("mouseleave", hideTileTooltip);
      tile.addEventListener("focus", () => scheduleTileTooltip(tile, tooltipText));
      tile.addEventListener("blur", hideTileTooltip);
    }
    if (mapEditor.active) {
      tile.classList.add("editor-tile");
      if (mapEditor.anchor && sameTile(position, mapEditor.anchor)) tile.classList.add("editor-anchor");
    }
    if (reachable.has(keyOf(position)) && !sameTile(position, activePlayer.position)) {
      tile.classList.add("reachable");
      const tollCost = getMovementTollCost(activePlayer, [position]);
      if (tollCost > 0) {
        tile.classList.add("reachable-toll", `reachable-toll-${tollCost}`);
        tile.dataset.toll = String(tollCost);
        tile.setAttribute("aria-label", `${tile.getAttribute("aria-label")}，进入需 ${tollCost} XP`);
      }
    }
    if (pathKeys.has(keyOf(position))) { tile.classList.add("path"); tile.dataset.step = String(pathKeys.get(keyOf(position))); }
    if (targetable.some((candidate) => sameTile(candidate, position))) tile.classList.add("targetable");
    if (getSelectedTargets().some((candidate) => sameTile(candidate, position))) tile.classList.add("target-selected");
    if (terrainType === "energy" || terrainType === "objective") tile.append(makeMapTargetMarker(terrainType));
    if (getActiveFlame(position)) { tile.classList.add("flame"); tile.append(makeFlameToken()); }
    if (mapEditor.active) {
      const spawnMarkers = getSpawnMarkersAt(position);
      if (spawnMarkers.length) tile.append(makeSpawnMarkerStack(spawnMarkers));
    }
    if (isWall(position, map)) tile.setAttribute("aria-disabled", "true");
    tile.disabled = !mapEditor.active && (state.over || state.tactical.phase === "resolving" || state.tactical.phase === "finished" || (state.tactical.phase !== "movement" && !(state.tactical.phase === "action" && state.tactical.selection === "target")));
    return tile;
  }

  function getSpawnMarkersAt(position) {
    if (!mapEditor.spawns) return [];
    return getActiveSpawnKeys()
      .map((key) => {
        const tool = ({ player: "spawn-player", playerB: "spawn-player-b", enemy: "spawn-enemy", enemyB: "spawn-enemy-b" })[key];
        return { ...getSpawnToolConfig(tool), position: mapEditor.spawns[key] };
      })
      .filter((entry) => entry.position && sameTile(entry.position, position));
  }

  function makeSpawnMarker(marker) {
    const token = document.createElement("span");
    token.className = `spawn-point-marker ${marker.tone}`;
    token.classList.toggle("is-active", marker.key === getSpawnToolConfig()?.key);
    token.textContent = marker.shortLabel || marker.label;
    token.title = `${marker.label}出生点`;
    return token;
  }

  function makeSpawnMarkerStack(markers) {
    if (markers.length === 1) return makeSpawnMarker(markers[0]);
    const stack = document.createElement("span");
    stack.className = "spawn-point-stack";
    stack.title = markers.map((marker) => `${marker.label}出生点`).join(" / ");
    for (const marker of markers) stack.append(makeSpawnMarker(marker));
    return stack;
  }

  function describeTerrain(position, map = TACTICAL_MAP) {
    const terrain = ({ floor: "地面", wall: "巨石", bush: "草丛", energy: "能量点", objective: "中央据点" })[tileType(position, map)];
    return getActiveFlame(position) ? `${terrain}，火焰` : terrain;
  }
  function getTileTooltipText(position, map = TACTICAL_MAP) {
    if (getActiveFlame(position)) return "火焰：本回合防御低于 1 时会失去 1 HP。";
    return ({
      wall: "巨石：无法进入，并会阻挡移动路线和长攻。",
      bush: "草丛：外部无法看见藏身者；草丛中的双方仅在相邻时互相可见。",
      energy: "能量点：回合结束获得 1 XP，随后随机刷新。",
      objective: `据点：连续占据并支付 2 XP 可获得 ${scoringRules.objectiveScore} 分。`,
    })[tileType(position, map)] || (hasAnyThinWall(position, map) ? "薄墙：边缘阻挡移动和攻击距离，需要绕路。" : "");
  }

  function hasAnyThinWall(position, map = TACTICAL_MAP) {
    return directionalNeighbors(position)
      .filter((tile) => inBounds(tile, map))
      .some((tile) => hasThinWallBetween(position, tile, map));
  }

  // Thin walls are logical edges, not tile contents. Rendering them in a shared
  // overlay guarantees one sprite per edge, even when both neighboring tiles
  // are present, and keeps the stonework centered on the actual shared side.
  function appendThinWallOverlay(layer, map, layout) {
    const edges = collectThinWallGeometry(map, layout);
    validateThinWallGeometry(edges, map, layout);
    for (const edge of edges) {
      const wall = document.createElement("span");
      wall.className = `iso-thin-wall wall-${edge.orientation}`;
      wall.dataset.edgeKey = edge.key;
      wall.style.setProperty("--wall-x", `${(edge.center.x / layout.width) * 100}%`);
      wall.style.setProperty("--wall-y", `${(edge.center.y / layout.height) * 100}%`);
      wall.setAttribute("aria-hidden", "true");
      layer.append(wall);
    }
  }

  function collectThinWallGeometry(map = TACTICAL_MAP, layout) {
    const edges = [];
    const seen = new Set();
    for (let row = 0; row < map.rows; row += 1) {
      for (let col = 0; col < map.cols; col += 1) {
        const first = { row, col };
        for (const second of directionalNeighbors(first)) {
          if (!inBounds(second, map) || !hasThinWallBetween(first, second, map)) continue;
          const key = edgeKey(first, second);
          if (seen.has(key)) continue;
          seen.add(key);
          const shared = getSharedHexEdge(first, second, layout);
          if (!shared) continue;
          edges.push({ key, first, second, ...shared });
        }
      }
    }
    return edges;
  }

  function getSharedHexEdge(first, second, layout) {
    const firstVertices = getIsoHexVertices(first, layout);
    const secondVertices = getIsoHexVertices(second, layout);
    const matches = [];
    for (const point of firstVertices) {
      let nearest = null;
      for (const candidate of secondVertices) {
        const distance = Math.hypot(point.x - candidate.x, point.y - candidate.y);
        if (!nearest || distance < nearest.distance) nearest = { point, candidate, distance };
      }
      if (nearest && nearest.distance < 0.01) {
        const midpoint = {
          x: (nearest.point.x + nearest.candidate.x) / 2,
          y: (nearest.point.y + nearest.candidate.y) / 2,
        };
        if (!matches.some((match) => Math.hypot(match.x - midpoint.x, match.y - midpoint.y) < 0.01)) matches.push(midpoint);
      }
    }
    if (matches.length !== 2) return null;
    const [start, end] = matches;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const orientation = Math.abs(dx) < Math.abs(dy) * 0.35
      ? "vertical"
      : dx * dy < 0 ? "slash" : "backslash";
    return {
      start,
      end,
      center: { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 },
      length: Math.hypot(dx, dy),
      orientation,
    };
  }

  function getIsoHexVertices(position, layout) {
    const { centerX, centerY } = getIsoTileCenter(position, layout);
    const halfWidth = layout.tileWidth / 2;
    const quarterHeight = layout.tileHeight / 4;
    const halfHeight = layout.tileHeight / 2;
    return [
      { x: centerX, y: centerY - halfHeight },
      { x: centerX + halfWidth, y: centerY - quarterHeight },
      { x: centerX + halfWidth, y: centerY + quarterHeight },
      { x: centerX, y: centerY + halfHeight },
      { x: centerX - halfWidth, y: centerY + quarterHeight },
      { x: centerX - halfWidth, y: centerY - quarterHeight },
    ];
  }

  function validateThinWallGeometry(edges, map, layout) {
    const expected = new Set();
    for (let row = 0; row < map.rows; row += 1) {
      for (let col = 0; col < map.cols; col += 1) {
        const first = { row, col };
        for (const second of directionalNeighbors(first)) {
          if (inBounds(second, map) && hasThinWallBetween(first, second, map)) expected.add(edgeKey(first, second));
        }
      }
    }
    const actual = new Set(edges.map((edge) => edge.key));
    const hasDuplicate = actual.size !== edges.length;
    const hasMissing = Array.from(expected).some((key) => !actual.has(key));
    const hasInvalidGeometry = edges.some((edge) => !Number.isFinite(edge.center.x)
      || !Number.isFinite(edge.center.y) || edge.length <= 0 || !edge.orientation);
    console.assert(!hasDuplicate && !hasMissing && !hasInvalidGeometry,
      "Thin-wall overlay geometry failed validation.", { expected: expected.size, actual: edges.length, layout });
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
    const unit = document.createElement("span"); unit.className = `unit-token ${side} hero-${fighter.heroId}`; unit.dataset.fighterId = fighter.id; unit.title = `${getHeroDisplayName(fighter.hero)} ${formatHearts(Math.max(0, fighter.hp))}`;
    if (isFighterDefeated(fighter)) { unit.classList.add("is-out"); unit.textContent = "OUT"; return unit; }
    const standee = getTacticalStandeeSource(fighter);
    if (standee) {
      unit.classList.add("unit-standee");
      applyTacticalFacing(unit, getTacticalFacing(fighter));
      preloadTacticalStandeeFrames(fighter);
    }
    const source = standee || (fighter.heroId === "werewolf" && fighter.flags?.berserk ? HERO_AVATARS.werewolfBerserk : HERO_AVATARS[fighter.heroId]);
    if (!source) { unit.textContent = side === "player" ? "你" : side === "enemy-b" ? "B" : "A"; return unit; }
    const image = document.createElement("img"); image.src = source; image.alt = ""; image.addEventListener("error", () => { image.remove(); unit.textContent = side === "player" ? "你" : side === "enemy-b" ? "B" : "A"; }, { once: true }); unit.append(image); return unit;
  }

  function getTacticalFxLayer() {
    let layer = document.querySelector("#tacticalFxLayer");
    if (layer) return layer;
    layer = document.createElement("div");
    layer.id = "tacticalFxLayer";
    layer.className = "tactical-fx-layer";
    layer.setAttribute("aria-hidden", "true");
    document.body.append(layer);
    return layer;
  }

  function clearTacticalFx() {
    const layer = document.querySelector("#tacticalFxLayer");
    if (layer) layer.textContent = "";
    tacticalUi.map?.querySelectorAll(".fx-arriving, .fx-attacking, .fx-hit, .fx-guard, .fx-support")
      .forEach((element) => element.classList.remove("fx-arriving", "fx-attacking", "fx-hit", "fx-guard", "fx-support"));
  }

  function getMapTileElement(position) {
    if (!position || !tacticalUi.map) return null;
    return tacticalUi.map.querySelector(`.map-tile[data-row="${position.row}"][data-col="${position.col}"]`);
  }

  function getMapUnitElement(fighter) {
    if (!fighter?.id || !tacticalUi.map) return null;
    return tacticalUi.map.querySelector(`.unit-token[data-fighter-id="${fighter.id}"]`);
  }

  function getElementCenter(element) {
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, width: rect.width, height: rect.height };
  }

  function getTacticalFxDuration(ms) {
    return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? 1 : ms;
  }

  function waitForPaint() {
    return new Promise((resolve) => window.requestAnimationFrame(() => window.requestAnimationFrame(resolve)));
  }

  function createTacticalFx(className, center, size = 36) {
    if (!center) return null;
    const effect = document.createElement("span");
    effect.className = `tactical-fx ${className}`;
    effect.style.left = `${center.x}px`;
    effect.style.top = `${center.y}px`;
    effect.style.width = `${size}px`;
    effect.style.height = `${size}px`;
    getTacticalFxLayer().append(effect);
    return effect;
  }

  function playTacticalUnitCue(cue, index = 0) {
    const fighter = typeof cue?.fighterId === "string" ? getFighterById(cue.fighterId) : cue?.fighter;
    const token = getMapUnitElement(fighter);
    const center = getElementCenter(token || getMapTileElement(fighter?.position));
    if (!center) return;
    const amount = Math.max(0, Number(cue?.amount) || 0);
    const effect = createTacticalFx(`tactical-fx-unit-cue ${cue?.kind || "buff"}`, {
      ...center,
      y: center.y - Math.max(30, center.height * 0.7) - index * 12,
    }, Math.max(38, Math.min(center.width, 62)));
    if (!effect) return;

    const badge = document.createElement("span");
    badge.className = "unit-cue-badge";
    const glyph = document.createElement("span");
    glyph.className = "unit-cue-glyph";
    const label = document.createElement("span");
    label.className = "unit-cue-label";
    const burst = document.createElement("span");
    burst.className = "unit-cue-burst";
    const labels = { heal: amount ? `+${amount}` : "+HP", damage: amount ? `-${amount}` : "-HP", buff: "强化", debuff: "异常" };
    const glyphs = { heal: "+", damage: "!", buff: "^", debuff: "v" };
    glyph.textContent = glyphs[cue?.kind] || glyphs.buff;
    label.textContent = labels[cue?.kind] || labels.buff;
    effect.append(burst, badge);
    badge.append(glyph, label);

    const duration = getTacticalFxDuration(720);
    const animation = effect.animate?.([
      { opacity: 0, transform: "translate(-50%, -20%) scale(.62)" },
      { opacity: 1, transform: "translate(-50%, -62%) scale(1)", offset: 0.2 },
      { opacity: 1, transform: "translate(-50%, -104%) scale(.96)", offset: 0.66 },
      { opacity: 0, transform: "translate(-50%, -138%) scale(.84)" },
    ], { duration, easing: "steps(6, end)" });
    if (animation?.finished) animation.finished.catch(() => {}).finally(() => effect.remove());
    else window.setTimeout(() => effect.remove(), duration);
  }

  function flushTacticalUnitCues() {
    const cues = state.tactical?.visualCues || [];
    if (!cues.length) return;
    state.tactical.visualCues = [];
    cues.slice(0, 8).forEach((cue, index) => playTacticalUnitCue(cue, index));
  }

  function getFxAvatarSource(fighter) {
    return getTacticalStandeeSource(fighter) || (fighter?.heroId === "werewolf" && fighter.flags?.berserk ? HERO_AVATARS.werewolfBerserk : HERO_AVATARS[fighter?.heroId]);
  }

  function getTacticalStandeeSource(fighter, pose = "idle", frame = 0) {
    const standee = TACTICAL_STANDEES[fighter?.heroId];
    if (!standee) return null;
    if (typeof standee === "string") return standee;
    const resolvedPose = pose === "idle" && fighter?.statuses?.some((status) => status.id === "assassin-sneak") ? "sneak" : pose;
    const poseFrames = standee[resolvedPose];
    if (Array.isArray(poseFrames) && poseFrames.length) return poseFrames[frame % poseFrames.length];
    const frames = Array.isArray(poseFrames)
      ? poseFrames
      : poseFrames?.[getTacticalStandeeVisualFacing(getTacticalFacing(fighter))] || poseFrames?.right || [];
    if (Array.isArray(frames) && frames.length) return frames[frame % frames.length];
    return standee.idle || null;
  }

  function getTacticalStandeeFrames(fighter, pose) {
    const standee = TACTICAL_STANDEES[fighter?.heroId];
    if (!standee || typeof standee === "string") return [];
    const poseFrames = standee[pose];
    if (Array.isArray(poseFrames)) return poseFrames;
    return poseFrames?.[getTacticalStandeeVisualFacing(getTacticalFacing(fighter))] || poseFrames?.right || [];
  }

  function preloadTacticalStandeeFrames(fighter) {
    const standee = TACTICAL_STANDEES[fighter?.heroId];
    if (!standee || typeof standee === "string" || standee.preloaded) return;
    standee.preloaded = true;
    for (const pose of ["idle", "walk", "attack", "guard", "hit", "sneak", "drain", "predict"]) {
      const sequences = Array.isArray(standee[pose]) ? [standee[pose]] : Object.values(standee[pose] || {});
      for (const source of sequences.flat()) {
        const image = new Image();
        image.src = source;
      }
    }
  }

  function playTacticalStandeeFrames(element, fighter, pose, duration, { restore = true } = {}) {
    const frames = getTacticalStandeeFrames(fighter, pose);
    const image = element?.querySelector?.("img");
    if (!frames.length || !image) return;
    const frameDuration = Math.max(48, Math.floor(duration / frames.length));
    let frameIndex = 0;
    image.src = frames[frameIndex];
    const timer = window.setInterval(() => {
      frameIndex += 1;
      image.src = frames[frameIndex % frames.length];
    }, frameDuration);
    window.setTimeout(() => {
      window.clearInterval(timer);
      if (restore && element.isConnected) image.src = getTacticalStandeeSource(fighter);
    }, duration + 18);
  }

  function addFxImpact(center, style = "guard", delay = 0) {
    if (!center) return;
    window.setTimeout(() => {
      const effect = createTacticalFx(`tactical-fx-impact ${style}`, center, Math.max(42, Math.min(center.width || 54, center.height || 54)));
      if (!effect) return;
      if (style === "charge") {
        effect.append(
          Object.assign(document.createElement("span"), { className: "yin-yang-fish fish-a" }),
          Object.assign(document.createElement("span"), { className: "yin-yang-fish fish-b" }),
          Object.assign(document.createElement("span"), { className: "yin-yang-core" }),
        );
      }
      const duration = getTacticalFxDuration(300);
      const frames = style === "charge"
        ? [
          { opacity: 0, transform: "translate(-50%, -50%) scale(0.32) rotate(-120deg)" },
          { opacity: 1, transform: "translate(-50%, -50%) scale(1.06) rotate(60deg)", offset: 0.55 },
          { opacity: 0, transform: "translate(-50%, -50%) scale(1.36) rotate(180deg)" },
        ]
        : [{ opacity: 0, transform: "translate(-50%, -50%) scale(0.25)" }, { opacity: 1, transform: "translate(-50%, -50%) scale(1.1)", offset: 0.4 }, { opacity: 0, transform: "translate(-50%, -50%) scale(1.55)" }];
      const animation = effect.animate?.(frames, { duration, easing: style === "charge" ? "steps(8, end)" : "steps(4, end)" });
      if (animation?.finished) animation.finished.catch(() => {}).finally(() => effect.remove());
      else window.setTimeout(() => effect.remove(), duration);
    }, delay);
  }

  function playTacticalFxSpriteFrames(effect, frames, duration) {
    const image = effect?.querySelector("img");
    if (!image || !frames?.length) return;
    const frameDuration = Math.max(46, Math.floor(duration / frames.length));
    let frameIndex = 0;
    image.src = frames[frameIndex];
    const timer = window.setInterval(() => {
      frameIndex += 1;
      image.src = frames[frameIndex % frames.length];
    }, frameDuration);
    window.setTimeout(() => window.clearInterval(timer), duration + 16);
  }

  function playIceCriticalFx(target, delay = 0) {
    if (!target) return;
    window.setTimeout(() => {
      const duration = getTacticalFxDuration(540);
      const effect = createTacticalFx("tactical-fx-ice-critical", {
        ...target,
        y: target.y - target.height * 1.7,
      }, 86);
      if (!effect) return;
      const image = document.createElement("img");
      image.alt = "";
      effect.append(image);
      const frames = [1, 2, 3, 4].map((frame) => `./assets/iso-arena/vfx/ice-sorcerer/frames/ice-critical-${frame}.png`);
      playTacticalFxSpriteFrames(effect, frames, duration);
      const travelY = target.height * 1.36;
      const animation = effect.animate?.([
        { opacity: 0, transform: "translate(-50%, -50%) scale(.65)" },
        { opacity: 1, transform: `translate(-50%, calc(-50% + ${travelY}px)) scale(1)`, offset: 0.6 },
        { opacity: 0, transform: `translate(-50%, calc(-50% + ${travelY + 6}px)) scale(1.14)`, offset: 1 },
      ], { duration, easing: "steps(7, end)" });
      if (animation?.finished) animation.finished.catch(() => {}).finally(() => effect.remove());
      else window.setTimeout(() => effect.remove(), duration);
    }, delay);
  }

  function playAstrologerPredictionRing(target, delay = 0) {
    if (!target) return;
    window.setTimeout(() => {
      const duration = getTacticalFxDuration(980);
      const effect = createTacticalFx("tactical-fx-astrologer-ring", {
        ...target,
        y: target.y - target.height * 0.94,
      }, 82);
      if (!effect) return;
      const image = document.createElement("img");
      image.alt = "";
      effect.append(image);
      const frames = [1, 2, 3, 4].map((frame) => `./assets/iso-arena/vfx/astrologer/frames/astrologer-prediction-ring-${frame}.png`);
      playTacticalFxSpriteFrames(effect, frames, duration);
      const animation = effect.animate?.([
        { opacity: 0, transform: "translate(-50%, -50%) scale(.58)" },
        { opacity: 1, transform: "translate(-50%, -50%) scale(1.04)", offset: 0.24 },
        { opacity: .92, transform: "translate(-50%, -50%) scale(.96)", offset: 0.72 },
        { opacity: 0, transform: "translate(-50%, -50%) scale(1.12)" },
      ], { duration, easing: "steps(7, end)" });
      if (animation?.finished) animation.finished.catch(() => {}).finally(() => effect.remove());
      else window.setTimeout(() => effect.remove(), duration);
    }, delay);
  }

  function playAstrologerMeteorFx(target, delay = 0) {
    if (!target) return;
    window.setTimeout(() => {
      const duration = getTacticalFxDuration(610);
      const effect = createTacticalFx("tactical-fx-astrologer-meteor", {
        ...target,
        y: target.y - target.height * 1.48,
      }, 104);
      if (!effect) return;
      const image = document.createElement("img");
      image.alt = "";
      effect.append(image);
      const frames = [1, 2, 3, 4].map((frame) => `./assets/iso-arena/vfx/astrologer/frames/astrologer-prediction-meteor-${frame}.png`);
      playTacticalFxSpriteFrames(effect, frames, duration);
      const fallDistance = target.height * 1.1;
      const animation = effect.animate?.([
        { opacity: 0, transform: "translate(-50%, -50%) scale(.62)" },
        { opacity: 1, transform: "translate(-50%, calc(-50% + 28px)) scale(.9)", offset: 0.3 },
        { opacity: 1, transform: `translate(-50%, calc(-50% + ${fallDistance}px)) scale(1.12)`, offset: 0.79 },
        { opacity: 0, transform: `translate(-50%, calc(-50% + ${fallDistance + 8}px)) scale(1.32)` },
      ], { duration, easing: "steps(8, end)" });
      if (animation?.finished) animation.finished.catch(() => {}).finally(() => effect.remove());
      else window.setTimeout(() => effect.remove(), duration);
    }, delay);
  }

  function playAstrologerDrainFx(source, target, delay = 0) {
    if (!source || !target) return;
    window.setTimeout(() => {
      const duration = getTacticalFxDuration(430);
      const effect = createTacticalFx("tactical-fx-astrologer-drain-orb", {
        ...target,
        y: target.y - target.height * 0.34,
      }, 30);
      if (!effect) return;
      const deltaX = source.x - target.x;
      const deltaY = source.y - target.y - source.height * 0.25;
      const animation = effect.animate?.([
        { opacity: 0, transform: "translate(-50%, -50%) scale(.4)" },
        { opacity: 1, transform: "translate(-50%, -50%) scale(1)", offset: .16 },
        { opacity: 1, transform: `translate(calc(-50% + ${deltaX * .68}px), calc(-50% + ${deltaY * .68}px)) scale(.78)`, offset: .7 },
        { opacity: 0, transform: `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px)) scale(.3)` },
      ], { duration, easing: "steps(7, end)" });
      if (animation?.finished) animation.finished.catch(() => {}).finally(() => effect.remove());
      else window.setTimeout(() => effect.remove(), duration);
    }, delay);
  }

  function getActionFxStyle(action) {
    if (action?.kind === "defense") return "guard";
    if (action?.tacticalFirebomb) return "fire";
    if (action?.kind === "skill") return "skill";
    return "attack";
  }

  function getActionFxTargets(entry) {
    const action = entry.action || {};
    if (Array.isArray(action.tacticalTargets) && action.tacticalTargets.length) return action.tacticalTargets.map(cloneTile);
    if (Array.isArray(entry.plan?.target)) return entry.plan.target.map(cloneTile);
    if (entry.plan?.target && typeof entry.plan.target.row === "number") return [cloneTile(entry.plan.target)];
    const target = action.tacticalTarget || getFighterById(entry.plan?.targetId);
    return target?.position ? [cloneTile(target.position)] : [];
  }

  function captureTacticalVisualSnapshot() {
    return new Map(getAllTacticalFighters().map((fighter) => [fighter.id, { hp: fighter.hp, xp: fighter.xp, shield: fighter.flags?.puppetShield || 0 }]));
  }

  async function animateTacticalMovement(movement) {
    if (!movement?.length) return;
    clearTacticalFx();
    renderTactical();
    await waitForPaint();
    const duration = getTacticalFxDuration(440);
    const arrivingTokens = [];
    const movingEffects = [];
    for (const entry of movement) {
      const start = getElementCenter(getMapTileElement(entry.start));
      const end = getElementCenter(getMapTileElement(entry.end));
      if (!start || !end) continue;
      if (sameTile(entry.start, entry.end)) {
        if (entry.conflict && entry.contestedTile) addFxImpact(getElementCenter(getMapTileElement(entry.contestedTile)), "clash");
        continue;
      }
      const facing = getTacticalFacingBetween(entry.start, entry.end);
      if (facing) entry.fighter.facing = facing;
      const hasStandee = Boolean(getTacticalStandeeSource(entry.fighter));
      const size = hasStandee ? Math.max(28, Math.min(start.width, start.height) * 0.53) : Math.max(30, Math.min(start.width, start.height) * 0.78);
      const effect = createTacticalFx("tactical-fx-unit-move", start, size);
      if (!effect) continue;
      if (hasStandee) {
        effect.classList.add("has-standee", `hero-${entry.fighter.heroId}`);
        applyTacticalFacing(effect, getTacticalFacing(entry.fighter));
        effect.style.height = `${Math.round(size * 1.72)}px`;
      }
      const source = getFxAvatarSource(entry.fighter);
      if (source) {
        const image = document.createElement("img"); image.src = source; image.alt = ""; effect.append(image);
      } else effect.textContent = entry.fighter.label.slice(0, 1);
      if (hasStandee) playTacticalStandeeFrames(effect, entry.fighter, "walk", duration, { restore: false });
      const destinationToken = getMapUnitElement(entry.fighter);
      if (destinationToken) {
        applyTacticalFacing(destinationToken, getTacticalFacing(entry.fighter));
        destinationToken.classList.add("fx-arriving");
        arrivingTokens.push(destinationToken);
      }
      const deltaX = end.x - start.x;
      const deltaY = end.y - start.y;
//      addFxImpact(start, "step");
   //   window.setTimeout(() => addFxImpact(end, "land"), Math.max(1, duration - 110));
      const anchorY = hasStandee ? "-100%" : "-50%";
      effect.animate([
        { opacity: 0, transform: `translate(-50%, ${anchorY}) scale(0.72)` },
        { opacity: 1, transform: `translate(-50%, ${anchorY}) scale(1.06)`, offset: 0.16 },
        { opacity: 1, transform: `translate(calc(-50% + ${deltaX}px), calc(${anchorY} + ${deltaY}px)) scale(1)` },
      ], { duration, easing: "steps(6, end)", fill: "forwards" });
      movingEffects.push(effect);
    }
    await pause(duration + 70);
    for (const token of arrivingTokens) token.classList.remove("fx-arriving");
    for (const effect of movingEffects) effect.remove();
  }

  async function animateTacticalActions(entries, snapshot) {
    if (!entries?.length) return;
    clearTacticalFx();
    await waitForPaint();
    flushTacticalUnitCues();
    const duration = getTacticalFxDuration(420);
    const effects = [];
    for (const entry of entries) {
      if (!entry?.fighter || !entry.action) continue;
      const source = getElementCenter(getMapUnitElement(entry.fighter) || getMapTileElement(entry.fighter.position));
      if (!source) continue;
      const style = getActionFxStyle(entry.action);
      const targets = getActionFxTargets(entry);
      const sourceToken = getMapUnitElement(entry.fighter);
      const facingTarget = targets.find((target) => !sameTile(target, entry.fighter.position));
      if (facingTarget) entry.fighter.facing = getTacticalFacingBetween(entry.fighter.position, facingTarget);
      if (sourceToken) {
        applyTacticalFacing(sourceToken, getTacticalFacing(entry.fighter));
        sourceToken.classList.add(style === "guard" ? "fx-guard" : "fx-attacking");
        const standeePose = style === "guard"
          ? "guard"
          : entry.action.id === "ji"
            ? null
            : entry.action.id === "assassin-sneak"
              ? "sneak"
              : entry.action.id === "astrologer-drain"
                ? "drain"
                : entry.action.id === "astrologer-predict"
                  ? "predict"
              : "attack";
        if (standeePose) playTacticalStandeeFrames(sourceToken, entry.fighter, standeePose, duration);
      }
      if (!targets.length) {
        addFxImpact(source, style === "guard" ? "guard" : "charge", 30);
        continue;
      }
      for (const targetPosition of targets) {
        const target = getElementCenter(getMapTileElement(targetPosition));
        if (!target) continue;
        const isAstrologerDrain = entry.action.id === "astrologer-drain";
        const isAstrologerPredict = entry.action.id === "astrologer-predict";
        const isAstrologerMeteor = entry.action.id === "astrologer-ghost-knife";
        const fighterAtTarget = getFighterAt(targetPosition);
        const before = fighterAtTarget ? snapshot?.get(fighterAtTarget.id) : null;
        if (isAstrologerPredict) {
          playAstrologerPredictionRing(target, Math.round(duration * .15));
          continue;
        }
        if (isAstrologerDrain) {
          const sourceBefore = snapshot?.get(entry.fighter.id);
          const drained = Boolean(
            (fighterAtTarget && before && fighterAtTarget.xp < before.xp)
            || (sourceBefore && entry.fighter.xp > sourceBefore.xp),
          );
          if (drained) playAstrologerDrainFx(source, target, Math.round(duration * .18));
          else addFxImpact(target, "guard", Math.round(duration * .4));
          continue;
        }
        if (isAstrologerMeteor) {
          playAstrologerMeteorFx(target, Math.round(duration * .08));
          continue;
        }
        const isIceDagger = entry.action.id === "ice-dagger";
        const projectile = createTacticalFx(`tactical-fx-projectile ${isIceDagger ? "ice-dagger" : style}`, source, isIceDagger ? 56 : style === "fire" ? 28 : 24);
        if (!projectile) continue;
        if (isIceDagger) {
          const image = document.createElement("img");
          image.alt = "";
          projectile.append(image);
          playTacticalFxSpriteFrames(image.parentElement, [1, 2, 3, 4].map((frame) => `./assets/iso-arena/vfx/ice-sorcerer/frames/ice-shard-${frame}.png`), duration);
        }
        const angle = Math.atan2(target.y - source.y, target.x - source.x) * 180 / Math.PI;
        const deltaX = target.x - source.x;
        const deltaY = target.y - source.y;
        projectile.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
        projectile.animate([
          { opacity: 0, transform: `translate(-50%, -50%) rotate(${angle}deg) scale(0.45)` },
          { opacity: 1, transform: `translate(calc(-50% + ${deltaX * 0.55}px), calc(-50% + ${deltaY * 0.55}px)) rotate(${angle}deg) scale(1)` , offset: 0.55 },
          { opacity: 0.25, transform: `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px)) rotate(${angle}deg) scale(0.8)` },
        ], { duration, easing: "steps(6, end)", fill: "forwards" });
        effects.push(projectile);
        const hpLoss = fighterAtTarget && before ? Math.max(0, before.hp - fighterAtTarget.hp) : 0;
        const damaged = Boolean(fighterAtTarget && before && (hpLoss > 0 || (before.shield > (fighterAtTarget.flags?.puppetShield || 0))));
        const iceCritical = entry.fighter.heroId === "iceSorcerer" && entry.iceCritTargetIds?.includes(fighterAtTarget?.id);
        const impactStyle = style === "skill" && !damaged ? "support" : damaged ? "hit" : "guard";
        const token = fighterAtTarget ? getMapUnitElement(fighterAtTarget) : null;
        if (token) {
          token.classList.add(damaged ? "fx-hit" : impactStyle === "support" ? "fx-support" : "fx-guard");
          if (damaged) playTacticalStandeeFrames(token, fighterAtTarget, "hit", Math.round(duration * 0.7));
          else if (impactStyle === "guard") playTacticalStandeeFrames(token, fighterAtTarget, "guard", Math.round(duration * 0.7));
        }
        addFxImpact(target, impactStyle, Math.round(duration * 0.58));
        if (iceCritical) playIceCriticalFx(target, Math.round(duration * 0.24));
      }
    }
    await pause(duration + 220);
    for (const effect of effects) effect.remove();
    tacticalUi.map?.querySelectorAll(".fx-attacking, .fx-hit, .fx-guard, .fx-support").forEach((element) => element.classList.remove("fx-attacking", "fx-hit", "fx-guard", "fx-support"));
  }

  function getTargetableTiles() {
    if (state.tactical.phase !== "action" || state.tactical.selection !== "target") return [];
    const action = getSelectedAction(); const mode = getActionTargetingMode(action);
    if (mode === "tile-pair") return getFirebombTargetableTiles();
    const activePlayer = getActivePlayer();
    if (mode === "neighbor-tile") {
      return directionalNeighbors(activePlayer.position)
        .filter((tile) => inBounds(tile) && !isWall(tile) && !hasThinWallBetween(activePlayer.position, tile))
        .map(cloneTile);
    }
    if (mode === "any-fighter-range") {
      return getAllTacticalFighters()
        .filter((fighter) => {
          if (fighter !== activePlayer && getFighterTeam(fighter) === "enemy" && !isFighterVisibleToTeam(fighter, "player")) return false;
          return canActionTargetFighter(action, fighter, activePlayer) && isWithinAttackRange(activePlayer.position, fighter.position, action);
        })
        .map((fighter) => cloneTile(fighter.position));
    }
    if (mode === "ally") return getAlivePlayers().filter((fighter) => canActionTargetFighter(action, fighter, activePlayer)).map((fighter) => cloneTile(fighter.position));
    const candidates = getAliveEnemies().filter((fighter) => {
      if (!isFighterVisibleToTeam(fighter, "player")) return false;
      if (!canActionTargetFighter(action, fighter, activePlayer)) return false;
      if (["adjacent-tile", "enemy-range"].includes(mode)) return isWithinAttackRange(activePlayer.position, fighter.position, action);
      return mode === "enemy";
    });
    if (action?.effects?.revive) return getPlayerFighters().filter((fighter) => fighter !== activePlayer && isFighterDefeated(fighter) && canActionTargetFighter(action, fighter, activePlayer)).map((fighter) => cloneTile(fighter.position));
    if (["adjacent-tile", "enemy-range", "enemy"].includes(mode)) return candidates.map((fighter) => cloneTile(fighter.position));
    return [];
  }

  function renderCards() {
    renderBattleMageImprintControl();
    if (isPharmacistLoadoutPhase()) {
      renderPharmacistLoadoutCards();
      return;
    }
    if (isElfLoadoutPhase()) {
      renderElfLoadoutCards();
      return;
    }
    tacticalUi.cards.textContent = "";
    tacticalUi.cards.classList.remove("is-loadout");
    tacticalUi.filters.hidden = false;
    if (tacticalUi.actionTitle) tacticalUi.actionTitle.textContent = "选择本回合动作";
    state.tactical.filter = normalizeActionFilter(state.tactical.filter);
    updateActionFilterButtons();
    const activePlayer = getActivePlayer();
    const allActions = getFilteredTacticalActions(activePlayer, state.tactical.filter);
    if (state.tactical.selectedCardId && !allActions.some((action) => action.id === state.tactical.selectedCardId)) {
      state.tactical.selectedCardId = null;
      clearActionTargets();
      state.tactical.battleMageImprint = false;
    }
    const selected = state.tactical.selectedCardId;
    tacticalUi.cards.classList.toggle("has-many-actions", allActions.length > 6);
    if (!allActions.length) {
      const empty = document.createElement("p");
      empty.className = "card-empty-state";
      empty.textContent = state.tactical.filter === "recommended"
        ? "暂无推荐行动，可切到“当前可用”或“全部”查看完整行动卡。"
        : "当前分类没有可显示的行动卡。";
      tacticalUi.cards.append(empty);
      return;
    }
    for (const action of allActions) {
      const available = canUseAction(activePlayer, action) && !isPuppetInactive(activePlayer) && !state.over && state.tactical.phase === "action" && (!isTacticalOnline() || getTacticalOnline()?.initialized) && !state.tactical.resolving;
      const category = getActionCategory(action);
      const card = document.createElement("button"); card.type = "button"; card.className = `tactical-card ${action.kind} ${category}`; card.dataset.actionId = action.id;
      card.disabled = !available; card.classList.toggle("selected", selected === action.id); card.setAttribute("aria-pressed", String(selected === action.id));
      const top = document.createElement("div"); top.className = "card-top";
      const title = document.createElement("strong"); title.className = "card-title"; title.textContent = action.name;
      const cost = document.createElement("span"); cost.className = "card-cost"; cost.textContent = getCardCostLabel(activePlayer, action);
      top.append(title, cost);
      const group = document.createElement("span"); group.className = "card-group"; group.textContent = getActionCategoryLabel(action);
      const specs = document.createElement("div"); specs.className = "card-specs";
      for (const [label, value] of getCardSpecEntries(action, activePlayer)) {
        const spec = document.createElement("span");
        const specLabel = document.createElement("b"); specLabel.textContent = label;
        const specValue = document.createElement("strong"); specValue.textContent = value;
        spec.append(specLabel, specValue); specs.append(spec);
      }
      const text = document.createElement("span"); text.className = "card-text"; text.textContent = getCardEffectText(action, activePlayer);
      const target = document.createElement("span"); target.className = "card-target"; target.textContent = targetModeLabel(action);
      card.append(top, group, specs, text, target); tacticalUi.cards.append(card);
    }
  }

  function canUseBattleMageImprintToggle() {
    const action = getSelectedAction();
    const activePlayer = getActivePlayer();
    return activePlayer?.heroId === "battleMage"
      && state.tactical.phase === "action"
      && isBattleMageImprintEligible(action)
      && canUseAction(activePlayer, action)
      && !state.tactical.resolving
      && !state.over;
  }

  function renderBattleMageImprintControl() {
    const button = tacticalUi.battleMageImprint;
    if (!button) return;
    const activePlayer = getActivePlayer();
    const visible = activePlayer?.heroId === "battleMage" && state.tactical.phase === "action" && !isPharmacistLoadoutPhase();
    const enabled = canUseBattleMageImprintToggle();
    if (!visible || !enabled) state.tactical.battleMageImprint = false;
    button.hidden = !visible;
    button.disabled = !enabled;
    button.setAttribute("aria-pressed", String(Boolean(state.tactical.battleMageImprint && enabled)));
    const chasers = activePlayer?.flags?.flameChasers || 0;
    button.textContent = `表 ${chasers}🔥`;
    button.title = enabled
      ? `为本次短攻/长攻附加回合开始时的炫纹伤害；未命中会清空炫纹`
      : "先选择一张短攻或长攻行动卡";
  }

  function getCardSpecEntries(action, fighter) {
    if (action.kind === "charge") return [["获得", `+${getXpGain(fighter, action)} XP`], ["防御", formatDefense(getDefense(fighter, action))]];
    if (action.kind === "defense") return [["防御", formatDefense(getDefense(fighter, action))], ["范围", "全局"]];
    if (action.kind === "attack") {
      const entries = [["强度", String(getAttack(fighter, action))], ["距离", String(getActionRange(action))]];
      if (action.damage && action.damage !== 1) entries.push(["伤害", String(action.damage)]);
      if (action.gunnerTurretKey) entries.push(["剩余", `${getGunnerTurretCount(fighter, action.gunnerTurretKey)} 次`]);
      return entries;
    }
    const entries = [["类型", "技能"]];
    if (action.effects?.lightningShardCost) entries.push(["消耗", `${action.effects.lightningShardCost}⚡`]);
    if (action.effects?.mageLightning) entries.push(["强度", String(BALANCE.heroes.mage.lightningPower)]);
    else if (action.effects?.skillAttackPower) entries.push(["强度", String(action.effects.skillAttackPower)]);
    if (getActionRange(action)) entries.push(["距离", String(getActionRange(action))]);
    else if (getDefense(fighter, action) > 0) entries.push(["防御", formatDefense(getDefense(fighter, action))]);
    return entries;
  }

  function getCardCostLabel(fighter, action) {
    return action.effects?.lightningShardCost ? `${action.effects.lightningShardCost}⚡` : String(getCost(fighter, action));
  }

  function getCardEffectText(action, fighter) {
    if (action.kind === "charge") return `本回合获得 ${getXpGain(fighter, action)} XP。`;
    if (action.kind === "defense") return "本回合获得全局防御。";
    if (action.gunnerTurretKey) return action.text || "释放偷师炮台。";
    if (action.kind === "attack") return action.tacticalEffect === "firebomb" ? "覆盖两个连续相邻格，并留下火焰。" : "命中时造成伤害。";
    return action.text || describeAction(action, fighter);
  }

  function updateActionFilterButtons() {
    if (!tacticalUi.filters) return;
    for (const item of tacticalUi.filters.querySelectorAll("button")) {
      item.setAttribute("aria-pressed", String(item.dataset.filter === state.tactical.filter));
    }
  }

  function getFilteredTacticalActions(fighter, filter) {
    const normalized = normalizeActionFilter(filter);
    const actions = getAvailableTacticalActions(fighter);
    if (normalized === "recommended") return getRecommendedTacticalActions(fighter, actions);
    return actions.filter((action) => actionMatchesFilter(action, normalized));
  }

  function getRecommendedTacticalActions(fighter, actions = getAvailableTacticalActions(fighter)) {
    if (!fighter || isPuppetInactive(fighter)) return [];
    const usableActions = actions.filter((action) => canUseAction(fighter, action));
    const recommendations = usableActions
      .map((action, index) => ({ action, index, score: scoreRecommendedAction(fighter, action) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .slice(0, RECOMMENDED_ACTION_LIMIT)
      .map((entry) => entry.action);
    return recommendations.length ? recommendations : usableActions.slice(0, RECOMMENDED_ACTION_LIMIT);
  }

  function scoreRecommendedAction(fighter, action) {
    const category = getActionCategory(action);
    const xp = fighter.xp || 0;
    const hpRatio = fighter.maxHp ? fighter.hp / fighter.maxHp : 1;
    const visibleEnemies = getVisibleTargetEnemies(fighter);
    const adjacentThreats = visibleEnemies.filter((enemy) => getRouteDistance(fighter.position, enemy.position, 1) <= 1).length;
    const rangeThreats = visibleEnemies.filter((enemy) => getRouteDistance(fighter.position, enemy.position, 2) <= 2).length;
    if (action.kind === "charge") return xp <= 0 ? 100 : xp <= 2 ? 82 : rangeThreats ? 42 : 58;
    if (action.kind === "defense") {
      if (action.id === "def-small") return hpRatio <= 0.5 || adjacentThreats ? 78 : 62;
      if (action.id === "def-mid") return xp >= 1 && (hpRatio <= 0.5 || adjacentThreats) ? 72 : 35;
      if (action.id === "def-big") return xp >= 2 && hpRatio <= 0.5 ? 66 : 24;
      return 30;
    }
    if (action.kind === "attack") {
      const range = getActionRange(action);
      const targetsInRange = visibleEnemies.filter((enemy) => getRouteDistance(fighter.position, enemy.position, range) <= range).length;
      if (!targetsInRange && action.tacticalEffect !== "firebomb") return 0;
      const power = getAttack(fighter, action);
      const rangeBonus = range > 1 && !adjacentThreats ? 10 : 0;
      const specialBonus = category === "special" ? 8 : 0;
      return 48 + Math.min(power, 8) * 3 + rangeBonus + specialBonus + Math.min(targetsInRange, 2) * 5;
    }
    if (category === "skill") {
      const mode = getActionTargetingMode(action);
      const hasEnemyTarget = ["enemy", "enemy-range", "adjacent-tile"].includes(mode) && visibleEnemies.some((enemy) => getRouteDistance(fighter.position, enemy.position, getActionRange(action) || 1) <= (getActionRange(action) || 1));
      const hasSupportTarget = ["ally", "any-fighter-range", "none"].includes(mode);
      if (!hasEnemyTarget && !hasSupportTarget) return 25;
      return 86 + (hasEnemyTarget ? 10 : 0);
    }
    return 20;
  }

  function getVisibleTargetEnemies(fighter) {
    const enemies = getFighterTeam(fighter) === "enemy" ? getAlivePlayers() : getAliveEnemies();
    const team = getFighterTeam(fighter);
    return enemies.filter((enemy) => isFighterVisibleToTeam(enemy, team) && canFighterSee(fighter, enemy));
  }

  function actionMatchesFilter(action, filter) {
    const activePlayer = getActivePlayer();
    const normalized = normalizeActionFilter(filter);
    if (normalized === "available") return !isPuppetInactive(activePlayer) && canUseAction(activePlayer, action);
    if (normalized === "all") return true;
    if (normalized === "recommended") return getRecommendedTacticalActions(activePlayer).some((recommended) => recommended.id === action.id);
    return !isPuppetInactive(activePlayer) && canUseAction(activePlayer, action) && getActionCategory(action) === normalized;
  }

  function cycleAvailableAction() {
    const activePlayer = getActivePlayer();
    if (state.over || state.tactical.phase !== "action" || isPuppetInactive(activePlayer)) return;
    const actions = getFilteredTacticalActions(activePlayer, state.tactical.filter)
      .filter((action) => canUseAction(activePlayer, action));
    if (!actions.length) return;
    const currentIndex = actions.findIndex((action) => action.id === state.tactical.selectedCardId);
    const nextAction = actions[(currentIndex + 1) % actions.length];
    state.tactical.selectedCardId = nextAction.id;
    clearActionTargets();
    if (!isBattleMageImprintEligible(nextAction)) state.tactical.battleMageImprint = false;
    state.tactical.selection = getActionTargetingMode(nextAction) === "none" ? "action" : "target";
    renderTactical();
  }

  function selectTacticalAction(actionId) {
    const activePlayer = getActivePlayer();
    if (state.over || state.tactical.phase !== "action" || state.tactical.resolving || isPuppetInactive(activePlayer)) return false;
    const action = getActionById(actionId, activePlayer);
    if (!action || !canUseAction(activePlayer, action)) return false;
    state.tactical.selectedCardId = action.id;
    clearActionTargets();
    if (!isBattleMageImprintEligible(action)) state.tactical.battleMageImprint = false;
    state.tactical.selection = getActionTargetingMode(action) === "none" ? "action" : "target";
    renderTactical();
    return true;
  }

  function pageTacticalCards(direction) {
    if (!tacticalUi.cards) return;
    const distance = Math.max(160, tacticalUi.cards.clientWidth - 28);
    if (typeof tacticalUi.cards.scrollBy === "function") {
      tacticalUi.cards.scrollBy({ left: direction * distance, behavior: "smooth" });
    } else {
      tacticalUi.cards.scrollLeft += direction * distance;
    }
  }

  function schedulePuppetStandbyPass() {
    const activePlayer = getActivePlayer();
    if (!isPuppetInactive(activePlayer) || state.tactical.phase !== "action" || state.tactical.resolving || state.over || state.tactical.standbyAutoPassScheduled) return;
    state.tactical.standbyAutoPassScheduled = true;
    state.tactical.selectedCardId = "ji";
    clearActionTargets();
    state.tactical.selection = "action";
    renderCards();
    renderPreview();
    window.setTimeout(() => {
      if (!isPuppetInactive(getActivePlayer()) || state.tactical.phase !== "action" || state.tactical.resolving || state.over) return;
      lockPlan();
    }, 0);
  }

  function targetModeLabel(action) {
    const mode = getActionTargetingMode(action);
    if (mode === "tile-pair") return "选择两个连续的相邻格";
    if (mode === "neighbor-tile") return "选择相邻 1 格筑墙";
    return ["adjacent-tile", "enemy-range"].includes(mode) ? `需要选择 ${getActionRange(action)} 格内目标` : mode === "any-fighter-range" ? `需要选择 ${getActionRange(action)} 格内任意英雄` : mode === "enemy" ? "需要选择敌方目标格" : mode === "ally" ? "需要选择己方目标" : "不需要目标";
  }

  function renderPreview() {
    if (isPharmacistLoadoutPhase()) {
      const required = getRequiredPharmacistLoadoutSize();
      const ready = pharmacistLoadoutDraft.length === required;
      const entries = [
        ["阶段", "开局配药"],
        ["配方", getPharmacistLoadoutNames(pharmacistLoadoutDraft) || "未选择"],
        ["行动", "确认后进入预备移动"],
        ["费用", "-"],
        ["目标", "无需目标"],
        ["状态", ready ? "可以确认配药" : `请选择 ${required} 个药剂`],
      ];
      tacticalUi.preview.textContent = "";
      for (const [term, description] of entries) {
        const wrap = document.createElement("div"); const dt = document.createElement("dt"); const dd = document.createElement("dd");
        dt.textContent = term; dd.textContent = description; if (term === "状态") dd.className = ready ? "plan-ok" : "plan-error"; wrap.append(dt, dd); tacticalUi.preview.append(wrap);
      }
      tacticalUi.lock.textContent = "确认配药";
      tacticalUi.lock.disabled = !ready;
      tacticalUi.cancel.textContent = "清空配药";
      tacticalUi.cancel.disabled = !pharmacistLoadoutDraft.length;
      return;
    }
    if (isElfLoadoutPhase()) {
      const required = getRequiredElfLoadoutSize();
      const ready = elfLoadoutDraft.length === required;
      const names = elfLoadoutDraft.map((id) => ELF_LOADOUT_OPTIONS.find((option) => option.id === id)?.name).filter(Boolean).join(" / ");
      const entries = [["阶段", "开局祝福"], ["祝福", names || "未选择"], ["行动", "确认后进入预备移动"], ["费用", "-"], ["状态", ready ? "可以确认" : `请选择 ${required} 个主动技`]];
      tacticalUi.preview.textContent = "";
      for (const [term, description] of entries) {
        const wrap = document.createElement("div"); const dt = document.createElement("dt"); const dd = document.createElement("dd");
        dt.textContent = term; dd.textContent = description; if (term === "状态") dd.className = ready ? "plan-ok" : "plan-error"; wrap.append(dt, dd); tacticalUi.preview.append(wrap);
      }
      tacticalUi.lock.textContent = "确认祝福"; tacticalUi.lock.disabled = !ready;
      tacticalUi.cancel.textContent = "清空祝福"; tacticalUi.cancel.disabled = !elfLoadoutDraft.length;
      return;
    }
    if (mapEditor.active) {
      const entries = [
        ["模式", "地图编辑"],
        ["工具", getMapEditorToolName()],
        ["出生点", formatSpawnDraftSummary()],
        ["薄墙", `${mapEditor.draft?.thinWalls?.length || 0} 条`],
        ["状态", "保存后会用新地图开始新对局"],
      ];
      tacticalUi.preview.textContent = "";
      for (const [term, description] of entries) {
        const wrap = document.createElement("div"); const dt = document.createElement("dt"); const dd = document.createElement("dd");
        dt.textContent = term; dd.textContent = description; if (term === "状态") dd.className = "plan-ok"; wrap.append(dt, dd); tacticalUi.preview.append(wrap);
      }
      tacticalUi.lock.textContent = "编辑中";
      tacticalUi.lock.disabled = true;
      tacticalUi.cancel.textContent = "取消计划";
      tacticalUi.cancel.disabled = true;
      return;
    }
    const activePlayer = getActivePlayer();
    const action = getSelectedAction(); const targetMode = getActionTargetingMode(action);
    const moving = state.tactical.phase === "movement";
    const validation = moving ? validateMovementPlan() : validateActionPlan();
    const entries = [
      ["英雄", isTeamBattle() ? getHeroDisplayName(activePlayer.hero) : activePlayer.label],
      ["起点", coordName(activePlayer.position)],
      ["移动", state.tactical.path.length ? [activePlayer.position, ...state.tactical.path].map(coordName).join(" → ") : "原地不动"],
      ["终点", coordName(getPathEnd(activePlayer))],
      ["行动", moving ? isPreparationRound() ? "预备移动后进入第 1 回合" : "移动结算后选择" : action ? action.name : "尚未选择"],
      ["费用", action ? getCardCostLabel(activePlayer, action) : "-"],
      ["目标", targetMode === "none" ? "无需目标" : state.tactical.selectedTargetId ? getFighterById(state.tactical.selectedTargetId)?.label || "未选择" : getSelectedTargets().length ? getSelectedTargets().map(coordName).join(" + ") : "未选择"],
      ["表攻", state.tactical.battleMageImprint ? `启用，当前 ${activePlayer.flags.flameChasers || 0}🔥` : "-"],
      ["状态", validation.ok ? "可以锁定" : validation.reason],
    ];
    tacticalUi.preview.textContent = "";
    for (const [term, description] of entries) {
      const wrap = document.createElement("div"); const dt = document.createElement("dt"); const dd = document.createElement("dd");
      dt.textContent = term; dd.textContent = description; if (term === "状态") dd.className = validation.ok ? "plan-ok" : "plan-error"; wrap.append(dt, dd); tacticalUi.preview.append(wrap);
    }
    tacticalUi.lock.textContent = moving ? isPreparationRound() ? "锁定预备移动" : isTeamBattle() ? `锁定${activePlayer.label}移动` : "锁定移动" : isTeamBattle() ? `锁定${activePlayer.label}行动` : "锁定行动";
    tacticalUi.cancel.textContent = "取消计划";
    tacticalUi.lock.disabled = !validation.ok || !["movement", "action"].includes(state.tactical.phase) || state.over;
    tacticalUi.cancel.disabled = !["movement", "action"].includes(state.tactical.phase) || (!state.tactical.path.length && !action && !getSelectedTargets().length);
  }

  function getSelectedAction() { return state.tactical.selectedCardId ? getActionById(state.tactical.selectedCardId, getActivePlayer()) : null; }
  function getMapEditorToolName() {
    const spawn = getSpawnToolConfig(mapEditor.tool);
    if (spawn) return `${spawn.label}出生点`;
    return ({
      objective: "据点",
      energy: "能量点",
      bush: "草丛",
      wall: "巨石",
      "thin-wall": "薄墙",
      erase: "擦除",
    })[mapEditor.tool] || "地图";
  }

  function formatSpawnDraftSummary(spawns = mapEditor.spawns) {
    const labels = { player: "我A", playerB: "我B", enemy: "敌A", enemyB: "敌B" };
    return getActiveSpawnKeys()
      .map((key) => `${labels[key]} ${coordName(spawns?.[key])}`)
      .join(" / ");
  }

  function validateMovementPlan() {
    if (state.over) return { ok: false, reason: "对局已结束" };
    if (isPharmacistLoadoutPhase() || isElfLoadoutPhase()) return { ok: false, reason: "请先完成开局选择" };
    if (isTacticalOnline() && !getTacticalOnline()?.initialized) return { ok: false, reason: "等待对手加入" };
    if (state.tactical.resolving) return { ok: false, reason: "正在等待同步结算" };
    const moveLimit = getCurrentMoveLimit();
    if (state.tactical.path.length > moveLimit) return { ok: false, reason: `移动超过 ${moveLimit} 格` };
    const activePlayer = getActivePlayer();
    const toll = getMovementTollCost(activePlayer, state.tactical.path);
    if (activePlayer.xp < toll) return { ok: false, reason: `进入争夺格需要 ${toll} XP` };
    return { ok: true, reason: toll ? `可以锁定，支付 ${toll} XP` : "可以锁定移动" };
  }

  function validateActionPlan() {
    const action = getSelectedAction();
    if (state.over) return { ok: false, reason: "对局已结束" };
    if (isTacticalOnline() && !getTacticalOnline()?.initialized) return { ok: false, reason: "等待对手加入" };
    if (state.tactical.resolving) return { ok: false, reason: "正在等待同步结算" };
    if (!action) return { ok: false, reason: "请选择一张行动卡" };
    const activePlayer = getActivePlayer();
    if (!canUseAction(activePlayer, action)) return { ok: false, reason: "此行动当前不可用" };
    const mode = getActionTargetingMode(action);
    if (mode === "tile-pair" && !isValidFirebombTargetPair(activePlayer.position, getSelectedTargets())) return { ok: false, reason: "请选择两个连续的相邻格" };
    if (mode === "neighbor-tile") {
      const target = getSelectedTargets()[0];
      if (!target) return { ok: false, reason: "请选择相邻格" };
      if (!areTilesConnected(activePlayer.position, target)) return { ok: false, reason: "只能选择相邻格" };
      if (hasThinWallBetween(activePlayer.position, target)) return { ok: false, reason: "该边已有薄墙" };
    }
    if (["adjacent-tile", "enemy-range", "enemy", "ally", "any-fighter-range"].includes(mode) && !state.tactical.selectedTargetId) return { ok: false, reason: mode === "ally" ? "请选择一名己方目标" : mode === "any-fighter-range" ? "请选择一名目标" : "请选择一个敌方目标" };
    const selectedFighter = getFighterById(state.tactical.selectedTargetId);
    if (selectedFighter && !canActionTargetFighter(action, selectedFighter, activePlayer)) return { ok: false, reason: "当前状态无法选择该目标" };
    if (["adjacent-tile", "enemy-range", "any-fighter-range"].includes(mode) && (!selectedFighter || !isWithinAttackRange(activePlayer.position, selectedFighter.position, action))) return { ok: false, reason: `目标不在 ${getActionRange(action)} 格范围` };
    if (mode !== "none" && !getSelectedTargets().length) return { ok: false, reason: "请选择目标格" };
    return { ok: true, reason: "可以锁定" };
  }

  function handleMapClick(event) {
    const tile = event.target.closest(".map-tile"); if (!tile || (state.over && !mapEditor.active)) return;
    const position = { row: Number(tile.dataset.row), col: Number(tile.dataset.col) };
    if (mapEditor.active) {
      handleMapEditorTileClick(position);
      return;
    }
    if (!["movement", "action"].includes(state.tactical.phase)) return;
    if (state.tactical.phase === "action" && state.tactical.selection === "target") {
      const action = getSelectedAction();
      if (action?.tacticalEffect === "firebomb") toggleFirebombTarget(position);
      else if (getActionTargetingMode(action) === "neighbor-tile" && getTargetableTiles().some((candidate) => sameTile(candidate, position))) {
        state.tactical.selectedTarget = cloneTile(position);
        state.tactical.selectedTargets = [cloneTile(position)];
        state.tactical.selectedTargetId = null;
      }
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

  function handleMapEditorPointerDown(event) {
    if (!mapEditor.active || (event.button !== 0 && event.pointerType !== "touch")) return;
    const tile = event.target.closest(".map-tile");
    if (!tile) return;
    event.preventDefault();
    handleMapEditorTileClick({ row: Number(tile.dataset.row), col: Number(tile.dataset.col) }, "pointer");
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
    const path = state.tactical.path; const player = getActivePlayer();
    if (sameTile(position, player.position)) { state.tactical.path = []; return; }
    const existingIndex = path.findIndex((tile) => sameTile(tile, position));
    if (existingIndex >= 0) { state.tactical.path = path.slice(0, existingIndex + 1); return; }
    if (path.length >= getCurrentMoveLimit() || !isStandable(position, getVisibleOccupiedTiles(player))) return;
    const previous = path.length ? path[path.length - 1] : player.position;
    if (!areTilesConnected(previous, position)) return;
    if (getMovementTollCost(player, [...path, position]) > player.xp) return;
    state.tactical.path = [...path, position];
  }

  function handleCardClick(event) {
    const card = event.target.closest("[data-action-id]"); if (!card || card.disabled || state.tactical.phase !== "action") return;
    const actionId = card.dataset.actionId;
    if (state.tactical.selectedCardId === actionId) { state.tactical.selectedCardId = null; clearActionTargets(); state.tactical.selection = "action"; }
    else { selectTacticalAction(actionId); return; }
    if (!isBattleMageImprintEligible(getSelectedAction())) state.tactical.battleMageImprint = false;
    renderTactical();
  }

  function cancelPlan() {
    if (isPharmacistLoadoutPhase()) {
      pharmacistLoadoutDraft = [];
      applyDraftPharmacistLoadoutToPlayer();
    }
    if (isElfLoadoutPhase()) {
      elfLoadoutDraft = [];
      applyDraftElfLoadoutToPlayer();
    }
    if (state.tactical.phase === "movement") state.tactical.path = [];
    if (state.tactical.phase === "action") { state.tactical.selectedCardId = null; state.tactical.battleMageImprint = false; clearActionTargets(); state.tactical.selection = "action"; }
    renderTactical();
  }
  function setFilter(event) {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    state.tactical.filter = normalizeActionFilter(button.dataset.filter);
    tacticalUi.cards.scrollLeft = 0;
    updateActionFilterButtons();
    renderCards();
  }

  function toggleBattleMageImprint() {
    if (!canUseBattleMageImprintToggle()) return;
    state.tactical.battleMageImprint = !state.tactical.battleMageImprint;
    renderTactical();
  }

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
    if (enemyCanScoreObjective(enemy)) return [];
    const occupied = getVisibleOccupiedTiles(enemy);
    const candidates = getEnemyMoveCandidates(enemy, occupied);
    if (!candidates.length) return [];
    candidates.sort((first, second) => second.score - first.score || first.path.length - second.path.length || coordName(first.destination).localeCompare(coordName(second.destination)));
    return candidates[0].path;
  }

  function enemyCanScoreObjective(enemy) {
    return Boolean(enemy)
      && sameTile(enemy.position, TACTICAL_MAP.objective)
      && state.tactical.objectiveHeld?.[enemy.id]
      && enemy.xp >= OBJECTIVE_SCORE_COST;
  }

  function getEnemyMoveCandidates(enemy, occupied) {
    const limit = getMoveLimitForFighter(enemy);
    const seen = getReachableTiles(enemy.position, limit, occupied);
    const candidates = [];
    for (const entry of seen.values()) {
      const destination = entry.tile;
      const path = sameTile(destination, enemy.position) ? [] : bfsPath(enemy.position, [destination], occupied).slice(0, limit);
      if (getMovementTollCost(enemy, path) > enemy.xp) continue;
      candidates.push({ destination, path, score: scoreEnemyMoveDestination(enemy, destination, path, occupied) });
    }
    return candidates;
  }

  function scoreEnemyMoveDestination(enemy, destination, path, occupied) {
    const target = chooseEnemyTeamTarget(enemy);
    const ally = getEnemyFighters().find((fighter) => fighter !== enemy && !isFighterDefeated(fighter));
    let score = 0;
    const currentlyOnObjective = sameTile(enemy.position, TACTICAL_MAP.objective);
    const destinationIsObjective = sameTile(destination, TACTICAL_MAP.objective);
    const heldObjective = Boolean(state.tactical.objectiveHeld?.[enemy.id]);
    const canPayObjective = enemy.xp >= OBJECTIVE_SCORE_COST;

    if (destinationIsObjective) {
      if (heldObjective && canPayObjective) score += 10000;
      else if (heldObjective) score += 760;
      else score += 430;
      if (state.tactical.enemyScore + scoringRules.objectiveScore >= scoringRules.victoryScore) score += 260;
    } else if (currentlyOnObjective && heldObjective) {
      score -= canPayObjective ? 1200 : 520;
    }

    const objectiveDistance = getRouteDistance(destination, TACTICAL_MAP.objective, 8);
    if (!destinationIsObjective && Number.isFinite(objectiveDistance)) score += Math.max(0, 110 - objectiveDistance * 18);

    const playerScorer = getPlayerFighters().find((fighter) => (
      !isFighterDefeated(fighter)
      && sameTile(fighter.position, TACTICAL_MAP.objective)
      && state.tactical.objectiveHeld?.[fighter.id]
      && fighter.xp >= OBJECTIVE_SCORE_COST
    ));
    if (playerScorer) {
      const distanceToScorer = getRouteDistance(destination, playerScorer.position, 4);
      if (distanceToScorer === 1) score += 260;
      else if (distanceToScorer === 2) score += 140;
    }

    if (containsTile(TACTICAL_MAP.energyTiles, destination)) {
      score += enemy.xp < OBJECTIVE_SCORE_COST ? 105 : 55;
    }

    if (target) {
      const distanceToTarget = getRouteDistance(destination, target.position, 8);
      if (distanceToTarget === 1) score += 100;
      else if (distanceToTarget === 2) score += 70;
      else if (Number.isFinite(distanceToTarget)) score += Math.max(0, 55 - distanceToTarget * 8);
      if (isTeamBattle() && (enemy.id === "ai-b" || target.hp <= 1 || (ally && ally.hp <= 1))) score += Math.max(0, 80 - distanceToTarget * 18);
    }

    const nearbyThreats = getAlivePlayers().filter((fighter) => canFighterSee(fighter, enemy) && getRouteDistance(destination, fighter.position, 2) <= 2);
    for (const threat of nearbyThreats) {
      if (enemy.hp <= 1 && threat.xp >= 1) score -= 90;
      else if (threat.xp >= 5) score -= 45;
    }

    if (!path.length) score += 8;
    score -= getMovementTollCost(enemy, path) * 35;
    return score;
  }

  function chooseEnemyTeamTarget(enemy, action = null) {
    const candidates = getAlivePlayers().filter((fighter) => canFighterSee(enemy, fighter) && (!action || canActionTargetFighter(action, fighter, enemy)));
    if (!candidates.length) return null;
    const ally = getEnemyFighters().find((fighter) => fighter !== enemy && !isFighterDefeated(fighter));
    return candidates.sort((first, second) => {
      const firstThreat = (first.hp * 3) + getRouteDistance(enemy.position, first.position, 12) - (ally && getRouteDistance(ally.position, first.position, 12) <= 2 ? 2 : 0);
      const secondThreat = (second.hp * 3) + getRouteDistance(enemy.position, second.position, 12) - (ally && getRouteDistance(ally.position, second.position, 12) <= 2 ? 2 : 0);
      return firstThreat - secondThreat;
    })[0];
  }

  function buildEnemyMovementPlan(enemy) {
    return { fighter: enemy, path: planEnemyMove(enemy) };
  }

  function chooseActionForTacticalEnemy(enemy) {
    const originalEnemy = state.enemy;
    const originalPlayer = state.player;
    const target = chooseEnemyTeamTarget(enemy);
    if (!target) return ACTION_BY_ID.ji;
    state.enemy = enemy;
    state.player = target;
    let action;
    try { action = chooseEnemyAction(); } finally { state.enemy = originalEnemy; state.player = originalPlayer; }
    return action || ACTION_BY_ID.ji;
  }

  function buildEnemyActionPlan(enemy) {
    const ally = getEnemyFighters().find((fighter) => fighter !== enemy && !isFighterDefeated(fighter));
    const supportAction = getEnemySupportAction(enemy, ally);
    if (supportAction && ally) {
      return { fighter: enemy, actionId: supportAction.id, targetId: ally.id, target: cloneTile(ally.position) };
    }
    let action = chooseActionForTacticalEnemy(enemy);
    let target = chooseEnemyTeamTarget(enemy, action);
    if (!target) return { fighter: enemy, actionId: ACTION_BY_ID.ji.id, targetId: null, target: null };
    // Once movement is public, the computer should not waste XP on a knife
    // when the player is outside melee range.
    if ((action.kind === "attack" || getActionTargetingMode(action) === "enemy-range") && !isWithinAttackRange(enemy.position, target.position, action)) {
      const hasNearbyThreat = getAlivePlayers().some((fighter) => canFighterSee(enemy, fighter) && fighter.xp > 0 && getRouteDistance(enemy.position, fighter.position, 2) <= 2);
      action = hasNearbyThreat && canUseAction(enemy, ACTION_BY_ID["def-small"]) ? ACTION_BY_ID["def-small"] : ACTION_BY_ID.ji;
      target = null;
    }
    const mode = getActionTargetingMode(action);
    if (mode === "tile-pair") {
      const targets = getEnemyFirebombTargets(enemy, target);
      if (!targets.length) action = ACTION_BY_ID.ji;
      return { fighter: enemy, actionId: action.id, target: targets };
    }
    return { fighter: enemy, actionId: action.id, targetId: mode === "none" || !target ? null : target.id, target: mode === "none" || !target ? null : cloneTile(target.position) };
  }

  function getEnemySupportAction(enemy, ally) {
    if (!isTeamBattle() || !ally) return null;
    const actions = getAvailableTacticalActions(enemy);
    if (ally.hp < ally.startingHp) {
      const heal = actions.find((action) => action.id === "priest-heal" && canUseAction(enemy, action));
      if (heal) return heal;
    }
    if (ally.hp <= 1) {
      const invincible = actions.find((action) => action.id === "pharmacist-invincible-potion" && canUseAction(enemy, action));
      if (invincible) return invincible;
      const shield = actions.find((action) => action.id === "priest-shield" && canUseAction(enemy, action));
      if (shield) return shield;
    }
    return null;
  }

  function getEnemyFirebombTargets(enemy, target = chooseEnemyTeamTarget(enemy)) {
    if (!target || !areTilesConnected(enemy.position, target.position)) return [];
    const candidates = neighbors(enemy.position);
    const playerTile = candidates.find((tile) => sameTile(tile, target.position));
    const companion = candidates.find((tile) => playerTile && !sameTile(tile, playerTile) && areTilesConnected(tile, playerTile));
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
      requestedEnd: cloneTile(getPlanEnd(plan.fighter.position, plan.path)),
      end: cloneTile(getPlanEnd(plan.fighter.position, plan.path)),
      conflict: false,
      contestedTile: null,
    }));
    const destinationGroups = new Map();
    for (const entry of entries) {
      const key = keyOf(entry.end);
      if (!destinationGroups.has(key)) destinationGroups.set(key, []);
      destinationGroups.get(key).push(entry);
    }
    for (const group of destinationGroups.values()) {
      if (group.length < 2) continue;
      const contestedTile = cloneTile(group[0].requestedEnd);
      for (const entry of group) {
        entry.end = cloneTile(entry.start);
        entry.conflict = true;
        if (!sameTile(contestedTile, entry.start)) entry.contestedTile = cloneTile(contestedTile);
      }
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
    if (isGuardThinWallShortAttack(fighter, action, finalPosition)) {
      action.power = (action.power || 0) + (BALANCE.heroes.guard.thinWallAttackBonus || 0);
      action.tacticalThinWallBoost = true;
    }
    if (plan.battleMageImprint && fighter.heroId === "battleMage" && isBattleMageImprintEligible(base)) {
      action.battleMageImprint = true;
    }
    const mode = getActionTargetingMode(base);
    if (mode === "tile-pair") {
      const targets = Array.isArray(plan.target) ? plan.target.map(cloneTile) : [];
      action.tacticalFirebomb = true;
      action.tacticalTargets = targets;
      action.tacticalSkipLegacyAttack = true;
      return action;
    }
    if (mode === "neighbor-tile") {
      const target = Array.isArray(plan.target) ? plan.target[0] : plan.target;
      if (target && areTilesConnected(finalPosition, target)) {
        action.tacticalBuildWall = { first: cloneTile(finalPosition), second: cloneTile(target) };
      } else {
        action.tacticalMiss = true;
      }
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
    if (mode === "any-fighter-range") {
      const hit = sameTile(plan.target, opponentFinalPosition) && isWithinAttackRange(finalPosition, plan.target, base);
      if (hit) action.tacticalTarget = opponent;
      else action.tacticalMiss = true;
    }
    if (mode === "enemy") action.tacticalTarget = opponent;
    if (mode === "ally") action.tacticalTarget = opponent;
    return action;
  }

  function isGuardThinWallShortAttack(fighter, action, position = fighter?.position) {
    return fighter?.heroId === "guard"
      && action?.kind === "attack"
      && getActionCategory(action) === "range-1"
      && hasAnyThinWall(position);
  }

  function isTacticalOnline() {
    return ["online", "online-team"].includes(state.tactical?.battleMode) && Boolean(state.tactical.online?.roomCode);
  }

  function getTacticalOnline() { return state.tactical?.online || null; }
  function getOnlineOpponentSlot(slot) { return slot === "p1" ? "p2" : "p1"; }
  function getOnlineFighterId(slot, index = 0) { return `${slot}${index === 0 ? "a" : "b"}`; }
  function getOnlineFightersBySlot(slot) {
    const online = getTacticalOnline();
    if (!online) return [];
    return slot === online.slot ? getPlayerFighters() : getEnemyFighters();
  }
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
      elfLoadout: player?.elfLoadout,
    });
  }
  function makeOnlineTeamFighter(player, index, fallbackLabel) {
    const heroIds = Array.isArray(player?.heroIds) ? player.heroIds : [player?.heroId || "classic", player?.heroBId || "priest"];
    const heroId = heroIds[index] || (index === 0 ? "classic" : "priest");
    const name = index === 0 ? (player?.name || fallbackLabel) : `${player?.name || fallbackLabel} B`;
    return makeFighter(name, heroId, {
      pharmacistLoadout: player?.pharmacistLoadout,
      elfLoadout: player?.elfLoadout,
    });
  }

  function prepareTacticalOnlineWaitingRoom(online) {
    const playerName = normalizePlayerName(tacticalUi.playerName.value);
    writeStorage(STORAGE_KEYS.playerName, playerName);
    writeStorage(STORAGE_KEYS.heroSelection, JSON.stringify({ playerHero: tacticalUi.playerHero.value, playerBHero: tacticalUi.playerBHero.value, enemyHero: tacticalUi.enemyHero.value, enemyBHero: tacticalUi.enemyBHero.value }));
    const teamOnline = online.teamMode;
    const battleMode = teamOnline ? "online-team" : "online";
    const spawns = getSpawnDraftFromControls();
    state.mode = "tactical-online";
    state.round = 1;
    state.over = false;
    state.matchRecorded = false;
    state.pendingEndChoice = null;
    state.player = makeFighter(playerName, tacticalUi.playerHero.value, { pharmacistLoadout: getConfiguredPharmacistLoadout(), elfLoadout: getConfiguredElfLoadout() });
    state.playerB = teamOnline ? makeFighter(`${playerName} B`, tacticalUi.playerBHero.value, { pharmacistLoadout: getConfiguredPharmacistLoadout(), elfLoadout: getConfiguredElfLoadout() }) : null;
    state.enemy = makeFighter("等待对手", "classic");
    state.enemyB = teamOnline ? makeFighter("等待对手 B", "priest") : null;
    if (teamOnline) {
      state.player.id = getOnlineFighterId(online.slot, 0);
      state.playerB.id = getOnlineFighterId(online.slot, 1);
      state.enemy.id = getOnlineFighterId(getOnlineOpponentSlot(online.slot), 0);
      state.enemyB.id = getOnlineFighterId(getOnlineOpponentSlot(online.slot), 1);
      placeFighter(state.player, online.slot === "p1" ? spawns.player : spawns.enemy);
      placeFighter(state.playerB, online.slot === "p1" ? spawns.playerB : spawns.enemyB);
      placeFighter(state.enemy, online.slot === "p1" ? spawns.enemy : spawns.player);
      placeFighter(state.enemyB, online.slot === "p1" ? spawns.enemyB : spawns.playerB);
    } else {
      state.player.id = online.slot;
      state.enemy.id = getOnlineOpponentSlot(online.slot);
      placeFighter(state.player, online.slot === "p1" ? DEFAULT_SPAWNS.online.player : DEFAULT_SPAWNS.online.enemy);
      placeFighter(state.enemy, online.slot === "p1" ? DEFAULT_SPAWNS.online.enemy : DEFAULT_SPAWNS.online.player);
    }
    state.melee.fighters = getAllTacticalFighters();
    state.tactical = {
      phase: "movement", selection: "move", path: [], selectedCardId: null, selectedTarget: null, selectedTargetId: null, selectedTargets: [],
      filter: normalizeActionFilter(state.tactical?.filter), playerScore: 0, enemyScore: 0, objectiveHeld: {}, flames: [], temporaryThinWalls: [], winReason: "", resolving: false, standbyAutoPassScheduled: false, battleMageImprint: false, prepRound: false, pendingEndChoice: null, battleMode, online, activePlayerId: state.player.id, lockedPlans: { movement: {}, action: {} }, spawnPoints: {},
    };
    state.tactical.spawnPoints = Object.fromEntries(getAllTacticalFighters().map((fighter) => [fighter.id, cloneTile(fighter.position)]));
    clearTacticalLog();
    addTacticalLog(`房间 ${online.roomCode} 已创建，等待另一位玩家加入。`, "move");
    renderTactical();
  }

  function startTacticalOnlineMatch(room) {
    const online = getTacticalOnline();
    if (!online || !room.players?.p1 || !room.players?.p2) return;
    const opponentSlot = getOnlineOpponentSlot(online.slot);
    const teamOnline = room.mode === "tactical-team" || online.teamMode;
    if (room.mapConfig) applyMapConfig(room.mapConfig);
    if (room.scoringRules) {
      scoringRules = {
        killScore: clampRuleValue(room.scoringRules.killScore, scoringRules.killScore, 0),
        objectiveScore: clampRuleValue(room.scoringRules.objectiveScore, scoringRules.objectiveScore, 0),
        victoryScore: clampRuleValue(room.scoringRules.victoryScore, scoringRules.victoryScore, 1),
      };
    }
    const spawns = sanitizeSpawnDraft(room.spawns || getSpawnDraftFromControls(), TACTICAL_MAP);
    if (teamOnline) {
      state.player = makeOnlineTeamFighter(room.players[online.slot], 0, "玩家");
      state.playerB = makeOnlineTeamFighter(room.players[online.slot], 1, "玩家");
      state.enemy = makeOnlineTeamFighter(room.players[opponentSlot], 0, "对手");
      state.enemyB = makeOnlineTeamFighter(room.players[opponentSlot], 1, "对手");
      state.player.id = getOnlineFighterId(online.slot, 0);
      state.playerB.id = getOnlineFighterId(online.slot, 1);
      state.enemy.id = getOnlineFighterId(opponentSlot, 0);
      state.enemyB.id = getOnlineFighterId(opponentSlot, 1);
      placeFighter(state.player, online.slot === "p1" ? spawns.player : spawns.enemy);
      placeFighter(state.playerB, online.slot === "p1" ? spawns.playerB : spawns.enemyB);
      placeFighter(state.enemy, online.slot === "p1" ? spawns.enemy : spawns.player);
      placeFighter(state.enemyB, online.slot === "p1" ? spawns.enemyB : spawns.playerB);
    } else {
      state.player = makeOnlineFighter(room.players[online.slot], "玩家");
      state.playerB = null;
      state.enemy = makeOnlineFighter(room.players[opponentSlot], "对手");
      state.player.id = online.slot;
      state.enemy.id = opponentSlot;
      state.enemyB = null;
      placeFighter(state.player, online.slot === "p1" ? DEFAULT_SPAWNS.online.player : DEFAULT_SPAWNS.online.enemy);
      placeFighter(state.enemy, online.slot === "p1" ? DEFAULT_SPAWNS.online.enemy : DEFAULT_SPAWNS.online.player);
    }
    state.round = room.round;
    state.over = false;
    state.matchRecorded = false;
    state.pendingEndChoice = null;
    state.melee.fighters = getAllTacticalFighters();
    state.tactical.phase = room.phase || "movement";
    state.tactical.selection = state.tactical.phase === "movement" ? "move" : "action";
    state.tactical.path = [];
    state.tactical.selectedCardId = null;
    state.tactical.battleMageImprint = false;
    clearActionTargets();
    state.tactical.resolving = false;
    state.tactical.battleMode = teamOnline ? "online-team" : "online";
    state.tactical.activePlayerId = state.player.id;
    state.tactical.lockedPlans = { movement: {}, action: {} };
    state.tactical.spawnPoints = Object.fromEntries(getAllTacticalFighters().map((fighter) => [fighter.id, cloneTile(fighter.position)]));
    online.initialized = true;
    online.teamMode = teamOnline;
    tacticalUi.playerHero.value = state.player.heroId;
    if (state.playerB) tacticalUi.playerBHero.value = state.playerB.heroId;
    tacticalUi.enemyHero.value = state.enemy.heroId;
    if (state.enemyB) tacticalUi.enemyBHero.value = state.enemyB.heroId;
    tacticalUi.playerName.value = state.player.label;
    clearTacticalLog();
    const playerNames = getPlayerFighters().map((fighter) => getHeroDisplayName(fighter.hero)).join("、");
    const enemyNames = getEnemyFighters().map((fighter) => `${fighter.label}·${getHeroDisplayName(fighter.hero)}`).join("、");
    addTacticalLog(`在线开局：${playerNames} 对阵 ${enemyNames}。`, "move");
    setTacticalRoomStatus(`房间 ${room.code}：${state.tactical.phase === "movement" ? "选择移动后锁定" : "选择行动后锁定"}。`);
    renderTactical();
  }

  async function createTacticalOnlineRoom() {
    if (!isOnlineSetupMode()) changeBattleMode("online");
    if (!commitPharmacistLoadout()) { setTacticalRoomStatus("药师需要先完成 4 选 2 配药。"); return; }
    const playerName = normalizePlayerName(tacticalUi.playerName.value);
    const teamOnline = setupBattleMode === "online-team";
    tacticalUi.playerName.value = playerName;
    try {
      const data = await apiRequest("/api/rooms", {
        mode: teamOnline ? "tactical-team" : "tactical",
        heroId: tacticalUi.playerHero.value,
        heroIds: teamOnline ? [tacticalUi.playerHero.value, tacticalUi.playerBHero.value] : undefined,
        playerName,
        pharmacistLoadout: getConfiguredPharmacistLoadout(),
        elfLoadout: getConfiguredElfLoadout(),
        mapConfig: cloneMapConfig(TACTICAL_MAP),
        spawns: getSpawnDraftFromControls(),
        scoringRules,
      });
      const online = { roomCode: data.code, playerId: data.playerId, slot: data.slot, initialized: false, pendingPlan: false, polling: false, appliedResults: new Set(), acknowledgedResults: new Set(), pollTimer: null, lastPhaseKey: "", teamMode: teamOnline };
      tacticalMenuOpen = false;
      prepareTacticalOnlineWaitingRoom(online);
      tacticalUi.roomCode.value = data.code;
      setTacticalRoomStatus(`房间 ${data.code}：等待对手加入。把房间代码发给对方。`);
      startTacticalOnlinePolling();
    } catch (error) {
      setTacticalRoomStatus(`创建失败：${error.message}`);
    }
  }

  async function joinTacticalOnlineRoom() {
    if (!isOnlineSetupMode()) changeBattleMode("online");
    const code = normalizeTacticalRoomCode(tacticalUi.roomCode.value);
    if (!code) { setTacticalRoomStatus("请输入房间代码。"); return; }
    if (!commitPharmacistLoadout()) { setTacticalRoomStatus("药师需要先完成 4 选 2 配药。"); return; }
    const playerName = normalizePlayerName(tacticalUi.playerName.value);
    const teamOnline = setupBattleMode === "online-team";
    tacticalUi.playerName.value = playerName;
    try {
      const data = await apiRequest(`/api/rooms/${code}/join`, {
        heroId: tacticalUi.playerHero.value,
        heroIds: teamOnline ? [tacticalUi.playerHero.value, tacticalUi.playerBHero.value] : undefined,
        playerName,
        pharmacistLoadout: getConfiguredPharmacistLoadout(),
        elfLoadout: getConfiguredElfLoadout(),
      });
      const online = { roomCode: data.code, playerId: data.playerId, slot: data.slot, initialized: false, pendingPlan: false, polling: false, appliedResults: new Set(), acknowledgedResults: new Set(), pollTimer: null, lastPhaseKey: "", teamMode: teamOnline };
      tacticalMenuOpen = false;
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
    for (const rawTile of rawPath.slice(0, getMoveLimitForFighter(fighter))) {
      if (!rawTile || !Number.isInteger(rawTile.row) || !Number.isInteger(rawTile.col)) break;
      const tile = { row: rawTile.row, col: rawTile.col };
      if (!isStandable(tile, getVisibleOccupiedTiles(fighter)) || !areTilesConnected(previous, tile)) break;
      path.push(tile);
      previous = tile;
    }
    if (getMovementTollCost(fighter, path) > fighter.xp) return [];
    return path;
  }

  function getOnlineActionPlan(plan) {
    return {
      actionId: plan?.actionId || "ji",
      battleMageImprint: Boolean(plan?.battleMageImprint),
      targetId: plan?.targetId || null,
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
        targetId: state.tactical.selectedTargetId,
        battleMageImprint: Boolean(state.tactical.battleMageImprint),
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

  function makeOnlineTeamCurrentPlan(fighter, phase) {
    if (phase === "movement") {
      return { fighter, fighterId: fighter.id, phase, path: state.tactical.path.map(cloneTile) };
    }
    const action = getSelectedAction();
    return {
      fighter,
      fighterId: fighter.id,
      phase,
      actionId: state.tactical.selectedCardId,
      targetId: state.tactical.selectedTargetId,
      battleMageImprint: Boolean(state.tactical.battleMageImprint),
      target: action?.tacticalEffect === "firebomb"
        ? getSelectedTargets().map(cloneTile)
        : state.tactical.selectedTarget && cloneTile(state.tactical.selectedTarget),
    };
  }

  function serializeOnlineTeamPlan(plan) {
    if (plan.phase === "movement") {
      return { fighterId: plan.fighterId, path: (plan.path || []).map(cloneTile) };
    }
    return {
      fighterId: plan.fighterId,
      actionId: plan.actionId || "ji",
      targetId: plan.targetId || null,
      battleMageImprint: Boolean(plan.battleMageImprint),
      target: Array.isArray(plan.target) ? plan.target.map(cloneTile) : plan.target ? cloneTile(plan.target) : null,
    };
  }

  async function lockOnlineTeamPlan() {
    const online = getTacticalOnline();
    if (!online || !online.initialized || online.pendingPlan || state.tactical.resolving) return;
    const phase = state.tactical.phase;
    const moving = phase === "movement";
    const validation = moving ? validateMovementPlan() : validateActionPlan();
    if (!validation.ok) return;
    const activePlayer = getActivePlayer();
    const playerPlan = makeOnlineTeamCurrentPlan(activePlayer, phase);
    state.tactical.lockedPlans[phase][activePlayer.id] = playerPlan;
    const nextPlayer = getNextPlanningPlayer(phase);
    if (nextPlayer) {
      if (moving) activePlayer.plannedPath = playerPlan.path.map(cloneTile);
      activatePlanningPlayer(nextPlayer, phase);
      addTacticalLog(`${activePlayer.label}已锁定${moving ? "移动" : "行动"}，现在规划${nextPlayer.label}。`, "move");
      renderTactical();
      return;
    }

    const teamPlans = getLockedPlayerPlans(phase).map(serializeOnlineTeamPlan);
    if (teamPlans.length !== getAlivePlayers().length) return;
    online.pendingPlan = true;
    state.tactical.resolving = true;
    renderTactical();
    try {
      await apiRequest(`/api/rooms/${online.roomCode}/action`, { playerId: online.playerId, round: state.round, plan: { phase, teamPlans } });
      setTacticalRoomStatus(`房间 ${online.roomCode}：已提交双英雄${moving ? "移动" : "行动"}，等待对手。`);
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
    if (!online || !["tactical", "tactical-team"].includes(room.mode)) return;
    if (!room.players?.p2) {
      setTacticalRoomStatus(`房间 ${room.code}：等待对手加入。`);
      return;
    }
    if (!online.initialized) startTacticalOnlineMatch(room);
    const opponentSlot = getOnlineOpponentSlot(online.slot);
    if (room.result) {
      const resultKey = `${room.result.round}:${room.result.phase}`;
      if (!online.appliedResults.has(resultKey)) {
        const applied = await applyTacticalOnlineResult(room.result);
        if (applied) online.appliedResults.add(resultKey);
      }
      return;
    }
    if (state.over) return;
    const phaseKey = `${room.round}:${room.phase}`;
    if (online.lastPhaseKey !== phaseKey) {
      const enteringNextRound = room.phase === "movement" && room.round > state.round;
      online.lastPhaseKey = phaseKey;
      state.round = room.round;
      if (enteringNextRound) respawnTacticalFighters();
      pruneMovementTolls();
      state.tactical.phase = room.phase;
      state.tactical.selection = room.phase === "movement" ? "move" : "action";
      state.tactical.path = [];
      state.tactical.selectedCardId = null;
      state.tactical.battleMageImprint = false;
      clearActionTargets();
      state.tactical.resolving = false;
      state.tactical.standbyAutoPassScheduled = false;
      state.tactical.lockedPlans = { movement: {}, action: {} };
      activatePlanningPlayer(getAlivePlayers()[0] || state.player, room.phase);
      online.pendingPlan = false;
      refreshMovePointsForPhase(room.phase);
      addTacticalLog(room.phase === "movement" ? `第 ${room.round} 回合开始。` : "移动结算完成，开始选择行动。", "move");
      renderTactical();
    }
    const selfSubmitted = room.submitted?.[online.slot];
    const opponentSubmitted = room.submitted?.[opponentSlot];
    if (selfSubmitted && !opponentSubmitted) setTacticalRoomStatus(`房间 ${room.code}：已锁定，等待对手。`);
    else if (!selfSubmitted && opponentSubmitted) setTacticalRoomStatus(`房间 ${room.code}：对手已锁定，请选择${room.phase === "movement" ? "移动" : "行动"}。`);
    else setTacticalRoomStatus(`房间 ${room.code}：请选择${room.phase === "movement" ? "移动" : "行动"}。`);
  }

  function cloneOnlineSnapshotValue(value) {
    return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
  }

  function serializeOnlineFighter(fighter) {
    const { hero, ...data } = fighter;
    return cloneOnlineSnapshotValue(data);
  }

  function serializeTacticalOnlineSnapshot() {
    return {
      version: 1,
      round: state.round,
      over: Boolean(state.over),
      map: { energyTiles: TACTICAL_MAP.energyTiles.map(cloneTile) },
      fighters: getAllTacticalFighters().map(serializeOnlineFighter),
      tactical: {
        playerScore: state.tactical.playerScore,
        enemyScore: state.tactical.enemyScore,
        objectiveHeld: cloneOnlineSnapshotValue(state.tactical.objectiveHeld || {}),
        flames: cloneOnlineSnapshotValue(state.tactical.flames || []),
        winReason: state.tactical.winReason || "",
        prepRound: Boolean(state.tactical.prepRound),
        spawnPoints: cloneOnlineSnapshotValue(state.tactical.spawnPoints || {}),
      },
    };
  }

  function restoreOnlineSnapshotFighter(raw) {
    if (!raw?.id || !raw?.heroId) return null;
    const fighter = makeFighter(raw.label || "玩家", raw.heroId, {
      pharmacistLoadout: raw.flags?.pharmacistLoadout,
      elfLoadout: raw.flags?.elfLoadout,
    });
    Object.assign(fighter, cloneOnlineSnapshotValue(raw));
    fighter.hero = HEROES[fighter.heroId] || fighter.hero;
    fighter.flags ||= {};
    fighter.statuses = Array.isArray(fighter.statuses) ? fighter.statuses : [];
    fighter.position = fighter.position ? cloneTile(fighter.position) : cloneTile(DEFAULT_SPAWNS.online.player);
    fighter.plannedPath = Array.isArray(fighter.plannedPath) ? fighter.plannedPath.map(cloneTile) : [];
    return fighter;
  }

  function applyTacticalOnlineSnapshot(snapshot) {
    const online = getTacticalOnline();
    if (!online || !snapshot || !Array.isArray(snapshot.fighters)) return false;
    const fighters = new Map(snapshot.fighters.map((raw) => [raw?.id, restoreOnlineSnapshotFighter(raw)]).filter(([, fighter]) => fighter));
    const ownIds = isOnlineTeamBattle()
      ? [getOnlineFighterId(online.slot, 0), getOnlineFighterId(online.slot, 1)]
      : [online.slot];
    const opponentSlot = getOnlineOpponentSlot(online.slot);
    const enemyIds = isOnlineTeamBattle()
      ? [getOnlineFighterId(opponentSlot, 0), getOnlineFighterId(opponentSlot, 1)]
      : [opponentSlot];
    const ownA = fighters.get(ownIds[0]);
    const enemyA = fighters.get(enemyIds[0]);
    if (!ownA || !enemyA) return false;

    state.player = ownA;
    state.playerB = fighters.get(ownIds[1]) || null;
    state.enemy = enemyA;
    state.enemyB = fighters.get(enemyIds[1]) || null;
    state.round = Number.isInteger(snapshot.round) ? snapshot.round : state.round;
    state.over = Boolean(snapshot.over);
    if (Array.isArray(snapshot.map?.energyTiles)) TACTICAL_MAP.energyTiles = snapshot.map.energyTiles.map(cloneTile);
    const tacticalSnapshot = snapshot.tactical || {};
    const hostIsSelf = online.slot === "p1";
    state.tactical.playerScore = hostIsSelf ? tacticalSnapshot.playerScore || 0 : tacticalSnapshot.enemyScore || 0;
    state.tactical.enemyScore = hostIsSelf ? tacticalSnapshot.enemyScore || 0 : tacticalSnapshot.playerScore || 0;
    state.tactical.objectiveHeld = cloneOnlineSnapshotValue(tacticalSnapshot.objectiveHeld || {});
    state.tactical.flames = cloneOnlineSnapshotValue(tacticalSnapshot.flames || []);
    state.tactical.winReason = tacticalSnapshot.winReason || "";
    state.tactical.prepRound = Boolean(tacticalSnapshot.prepRound);
    state.tactical.spawnPoints = cloneOnlineSnapshotValue(tacticalSnapshot.spawnPoints || {});
    state.melee.fighters = getAllTacticalFighters();
    state.tactical.activePlayerId = state.player.id;
    return true;
  }

  async function publishTacticalOnlineSnapshot(result) {
    const online = getTacticalOnline();
    if (!online || online.slot !== "p1") return null;
    return apiRequest(`/api/rooms/${online.roomCode}/resolve`, {
      playerId: online.playerId,
      round: result.round,
      phase: result.phase,
      snapshot: serializeTacticalOnlineSnapshot(),
    });
  }

  async function applyTacticalOnlineResult(result) {
    const online = getTacticalOnline();
    if (!online) return false;
    const resultKey = `${result.round}:${result.phase}`;
    if (result.snapshot) {
      if (!applyTacticalOnlineSnapshot(result.snapshot)) {
        setTacticalRoomStatus("房间快照无效，正在等待重新同步。");
        return false;
      }
      online.pendingPlan = false;
      state.tactical.resolving = false;
      renderTactical();
      if (state.over) finishTacticalMatch();
      await acknowledgeTacticalOnlineResult(resultKey, result.round);
      return true;
    }
    if (online.slot !== "p1") {
      state.tactical.phase = "resolving";
      state.tactical.resolving = true;
      renderTactical();
      setTacticalRoomStatus(`房间 ${online.roomCode}：等待房主结算本阶段。`);
      return false;
    }
    const opponentSlot = getOnlineOpponentSlot(online.slot);
    state.tactical.phase = "resolving";
    state.tactical.resolving = true;
    renderTactical();
    if (result.phase === "movement") {
      const movementPlans = isOnlineTeamBattle()
        ? [
          ...getOnlineTeamPlans(result.plans?.[online.slot], online.slot, "movement"),
          ...getOnlineTeamPlans(result.plans?.[opponentSlot], opponentSlot, "movement"),
        ].map((plan) => ({ fighter: plan.fighter, path: validateOnlinePath(plan.fighter, plan.path) }))
        : [
          { fighter: state.player, path: validateOnlinePath(state.player, result.plans?.[online.slot]?.path) },
          { fighter: state.enemy, path: validateOnlinePath(state.enemy, result.plans?.[opponentSlot]?.path) },
        ];
      applyMovementTollCosts(movementPlans);
      const movement = resolveGroupMovement(movementPlans);
      for (const entry of movement) {
        entry.fighter.position = entry.end;
        entry.fighter.movePoints = 0;
        entry.fighter.plannedPath = [];
      }
      applyContestedMovementTolls(movement);
      addTacticalLog(movement.map((entry) => `${entry.fighter.label}→${coordName(entry.end)}`).join("；"), "move");
      if (movement.some((entry) => entry.conflict)) addTacticalLog("移动发生冲突，相关单位留在原位。", "move");
      applyObjectiveEntryBonuses(movement);
      exposeNearbyNinjas();
      await animateTacticalMovement(movement);
    } else {
      const onlineTeam = isOnlineTeamBattle();
      const actionPlans = onlineTeam
        ? [
          ...getOnlineTeamPlans(result.plans?.[online.slot], online.slot, "action"),
          ...getOnlineTeamPlans(result.plans?.[opponentSlot], opponentSlot, "action"),
        ]
        : (() => {
          const selfPlan = getOnlineActionPlan(result.plans?.[online.slot]);
          const opponentPlan = getOnlineActionPlan(result.plans?.[opponentSlot]);
          return [
            { fighter: state.player, ...selfPlan, targetId: selfPlan.targetId || state.enemy.id },
            { fighter: state.enemy, ...opponentPlan, targetId: opponentPlan.targetId || state.player.id },
          ];
        })();
      const resolvedActions = actionPlans.map((plan) => {
        const target = getFighterById(plan.targetId) || getOpposingFighters(plan.fighter)[0] || (getPlayerFighters().includes(plan.fighter) ? state.enemy : state.player);
        return { fighter: plan.fighter, action: buildResolvedAction(plan.fighter, target, plan, plan.fighter.position, target.position), plan };
      });
      for (const entry of resolvedActions) if (entry.action.tacticalMiss) addTacticalLog(`${entry.fighter.label}攻击落空，目标不在武器距离内。`, "impact");
      const visibilityLogs = [];
      exposeAttackingNinjas(resolvedActions, visibilityLogs);
      const defeatSnapshot = captureDefeatSnapshot();
      const visualSnapshot = captureTacticalVisualSnapshot();
      const report = resolveTacticalSquadRound(
        resolvedActions.filter((entry) => getPlayerFighters().includes(entry.fighter)),
        resolvedActions.filter((entry) => getEnemyFighters().includes(entry.fighter)),
      );
      applyTacticalVisualResults(resolvedActions, report);
      report.logs.unshift(...visibilityLogs);
      applyTacticalFirebombs(resolvedActions, report);
      applyTacticalFlames(resolvedActions, report);
      exposeNearbyNinjas(report.logs, false);
      processTacticalDefeats(defeatSnapshot, report);
      reconcileTacticalOutcome(report);
      for (const item of report.logs) addTacticalLog(item.text, item.kind || "");
      await animateTacticalActions(resolvedActions, visualSnapshot);
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
    try {
      await publishTacticalOnlineSnapshot(result);
    } catch (error) {
      setTacticalRoomStatus(`上传权威结算失败：${error.message}`);
      return false;
    }
    await acknowledgeTacticalOnlineResult(resultKey, result.round);
    return true;
  }

  async function acknowledgeTacticalOnlineResult(resultKey, round) {
    const online = getTacticalOnline();
    if (!online || online.acknowledgedResults.has(resultKey)) return;
    online.acknowledgedResults.add(resultKey);
    try {
      await apiRequest(`/api/rooms/${online.roomCode}/advance`, { playerId: online.playerId, round });
      if (state.over) stopTacticalOnlinePolling();
      else setTacticalRoomStatus(`房间 ${online.roomCode}：等待对手确认结算。`);
    } catch (error) {
      online.acknowledgedResults.delete(resultKey);
      setTacticalRoomStatus(`确认结算失败：${error.message}`);
    }
  }

  function getOnlineTeamPlans(raw, slot, phase) {
    const fighters = getOnlineFightersBySlot(slot).filter((fighter) => !isFighterDefeated(fighter) && !fighter.flags?.tacticalRespawnRound);
    const plans = Array.isArray(raw?.teamPlans) ? raw.teamPlans : [];
    return fighters.map((fighter, index) => {
      const plan = plans.find((entry) => entry?.fighterId === fighter.id) || plans[index] || {};
      if (phase === "movement") return { fighter, fighterId: fighter.id, path: Array.isArray(plan.path) ? plan.path.map(cloneTile) : [] };
      return {
        fighter,
        fighterId: fighter.id,
        actionId: plan.actionId || "ji",
        targetId: plan.targetId || null,
        battleMageImprint: Boolean(plan.battleMageImprint),
        target: Array.isArray(plan.target) ? plan.target.map(cloneTile) : plan.target ? cloneTile(plan.target) : null,
      };
    });
  }

  function getLockedPlayerPlans(phase) {
    const plans = state.tactical.lockedPlans?.[phase] || {};
    return getAlivePlayers().map((fighter) => plans[fighter.id]).filter(Boolean);
  }

  function getNextPlanningPlayer(phase) {
    const plans = state.tactical.lockedPlans?.[phase] || {};
    return getAlivePlayers().find((fighter) => !plans[fighter.id]) || null;
  }

  function activatePlanningPlayer(fighter, phase = state.tactical.phase) {
    if (!fighter) return;
    state.tactical.activePlayerId = fighter.id;
    state.tactical.path = phase === "movement" ? (fighter.plannedPath || []).map(cloneTile) : [];
    state.tactical.selectedCardId = null;
    state.tactical.battleMageImprint = false;
    clearActionTargets();
    state.tactical.selection = phase === "movement" ? "move" : "action";
    state.tactical.standbyAutoPassScheduled = false;
  }

  function handlePlayerOverviewClick(event) {
    const button = event.target.closest("[data-player-fighter-id]");
    if (!button || button.disabled || !["movement", "action"].includes(state.tactical.phase)) return;
    const fighter = getFighterById(button.dataset.playerFighterId);
    if (!fighter || state.tactical.lockedPlans[state.tactical.phase]?.[fighter.id]) return;
    activatePlanningPlayer(fighter);
    renderTactical();
  }

  async function lockPlan() {
    if (isPharmacistLoadoutPhase()) {
      confirmInitialPharmacistLoadout();
      return;
    }
    if (isElfLoadoutPhase()) {
      const confirm = tacticalUi.cards.querySelector(".loadout-confirm");
      confirm?.click();
      return;
    }
    if (isTacticalOnline()) {
      if (isOnlineTeamBattle()) {
        await lockOnlineTeamPlan();
        return;
      }
      await lockOnlineTacticalPlan();
      return;
    }
    const isMovementPhase = state.tactical.phase === "movement";
    const validation = isMovementPhase ? validateMovementPlan() : validateActionPlan();
    if (!validation.ok || state.tactical.resolving) return;

    if (isMovementPhase) {
      const activePlayer = getActivePlayer();
      const playerPlan = { fighter: activePlayer, path: state.tactical.path.map(cloneTile) };
      state.tactical.lockedPlans.movement[activePlayer.id] = playerPlan;
      if (isTeamBattle()) {
        const nextPlayer = getNextPlanningPlayer("movement");
        if (nextPlayer) {
          activePlayer.plannedPath = playerPlan.path.map(cloneTile);
          activatePlanningPlayer(nextPlayer, "movement");
          addTacticalLog(`${activePlayer.label}已锁定移动，现在规划${nextPlayer.label}。`, "move");
          renderTactical();
          return;
        }
      }
      const playerPlans = getLockedPlayerPlans("movement");
      const enemyPlans = getAliveEnemies().map(buildEnemyMovementPlan);
      state.tactical.phase = "resolving"; state.tactical.resolving = true; renderTactical();
      addTacticalLog(isPreparationRound() ? "预备移动锁定：所有单位正在同时移动。" : "移动锁定：所有单位正在同时移动。", "move");
      await pause(180);
      const movementPlans = [...playerPlans, ...enemyPlans];
      const wasPreparationRound = isPreparationRound();
      applyMovementTollCosts(movementPlans);
      const movement = resolveGroupMovement(movementPlans);
      for (const entry of movement) {
        entry.fighter.position = entry.end;
        entry.fighter.movePoints = 0;
      }
      applyContestedMovementTolls(movement);
      const sneakMoveLogs = [];
      for (const entry of movement) consumeAssassinSneakMove(entry.fighter, sneakMoveLogs);
      if (movement.some((entry) => entry.conflict)) addTacticalLog("有单位争夺同一格或撞上未移动单位，已留在原位。", "move");
      addTacticalLog(movement.map((entry) => `${entry.fighter.label}→${coordName(entry.end)}`).join("；"), "move");
      for (const text of sneakMoveLogs) addTacticalLog(text, "move");
      applyObjectiveEntryBonuses(movement);
      exposeNearbyNinjas();
      await animateTacticalMovement(movement);
      if (wasPreparationRound) {
        state.round = 1;
        state.tactical.prepRound = false;
        state.tactical.phase = "movement";
        state.tactical.selection = "move";
        state.tactical.path = [];
        state.tactical.battleMageImprint = false;
        clearActionTargets();
        state.tactical.resolving = false;
        state.tactical.standbyAutoPassScheduled = false;
        state.tactical.lockedPlans = { movement: {}, action: {} };
        activatePlanningPlayer(getAlivePlayers()[0] || state.player, "movement");
        refreshMovePointsForPhase("movement");
        addTacticalLog("预备移动完成，第 1 回合开始。", "move");
        renderTactical();
        return;
      }
      state.tactical.phase = "action"; state.tactical.selection = "action"; state.tactical.path = []; state.tactical.battleMageImprint = false; state.tactical.resolving = false; state.tactical.standbyAutoPassScheduled = false; state.tactical.lockedPlans.movement = {}; state.tactical.lockedPlans.action = {};
      activatePlanningPlayer(getAlivePlayers()[0] || state.player, "action");
      renderTactical();
      return;
    }

    const activePlayer = getActivePlayer();
    const selectedAction = getSelectedAction();
    const playerPlan = {
      fighter: activePlayer,
      actionId: state.tactical.selectedCardId,
      targetId: state.tactical.selectedTargetId,
      battleMageImprint: Boolean(state.tactical.battleMageImprint),
      target: selectedAction?.tacticalEffect === "firebomb"
        ? getSelectedTargets().map(cloneTile)
        : state.tactical.selectedTarget && cloneTile(state.tactical.selectedTarget),
    };
    state.tactical.lockedPlans.action[activePlayer.id] = playerPlan;
    if (isTeamBattle()) {
      const nextPlayer = getNextPlanningPlayer("action");
      if (nextPlayer) {
        activatePlanningPlayer(nextPlayer, "action");
        addTacticalLog(`${activePlayer.label}已锁定${selectedAction.name}，现在为${nextPlayer.label}选择行动。`, "move");
        renderTactical();
        return;
      }
    }
    const playerPlans = getLockedPlayerPlans("action");
    const enemyPlans = getAliveEnemies().map(buildEnemyActionPlan);
    state.tactical.phase = "resolving"; state.tactical.resolving = true; renderTactical();
    addTacticalLog(`出招锁定：己方小队与敌方小队均已锁定行动。`, "move");
    await pause(220);
    const resolvedPlayerActions = playerPlans.map((plan) => {
      const target = getFighterById(plan.targetId) || getAliveEnemies()[0] || state.enemy;
      return { fighter: plan.fighter, action: buildResolvedAction(plan.fighter, target, plan, plan.fighter.position, target.position), plan };
    });
    const resolvedEnemyActions = enemyPlans.map((plan) => ({
      fighter: plan.fighter,
      action: buildResolvedAction(plan.fighter, getFighterById(plan.targetId) || getAlivePlayers()[0] || state.player, plan, plan.fighter.position, (getFighterById(plan.targetId) || getAlivePlayers()[0] || state.player).position),
      plan,
    }));
    for (const entry of resolvedPlayerActions) if (entry.action.tacticalMiss) addTacticalLog(`${entry.fighter.label}攻击目标不在武器距离内，攻击落空。`, "impact");
    for (const entry of resolvedEnemyActions) if (entry.action.tacticalMiss) addTacticalLog(`${entry.fighter.label}攻击目标不在武器距离内，攻击落空。`, "impact");
    const actionEntries = [...resolvedPlayerActions, ...resolvedEnemyActions];
    const visibilityLogs = [];
    exposeAttackingNinjas(actionEntries, visibilityLogs);
    const defeatSnapshot = captureDefeatSnapshot();
    const visualSnapshot = captureTacticalVisualSnapshot();
    const report = resolveTacticalSquadRound(resolvedPlayerActions, resolvedEnemyActions);
    applyTacticalVisualResults(actionEntries, report);
    report.logs.unshift(...visibilityLogs);
    applyTacticalBuildWalls(actionEntries, report);
    applyTacticalMageLightning(actionEntries, report);
    applyTacticalFirebombs(actionEntries, report);
    applyTacticalFlames(actionEntries, report);
    exposeNearbyNinjas(report.logs, false);
    processTacticalDefeats(defeatSnapshot, report);
    reconcileTacticalOutcome(report);
    for (const item of report.logs) addTacticalLog(item.text, item.kind || "");
    await animateTacticalActions(actionEntries, visualSnapshot);
    await animateCombat();
    if (!state.over) {
      applyMapResources();
      updateObjective();
    }
    if (state.over) { finishTacticalMatch(); return; }
    const manualChoices = (report.endChoices || []).filter((choice) => getPlayerFighters().includes(choice.actor));
    const automaticChoices = (report.endChoices || []).filter((choice) => !getPlayerFighters().includes(choice.actor));
    if (manualChoices.length) {
      state.tactical.endChoiceQueue = manualChoices.slice(1);
      state.tactical.automaticEndChoices = automaticChoices;
      openEndPhaseChoice(manualChoices[0]);
      return;
    }
    for (const choice of automaticChoices) {
      for (const item of applyEndPhaseChoice(choice, chooseAutomaticEndPhaseOption(choice))) addTacticalLog(item.text);
    }
    completeTacticalRound();
  }

  function resolveTacticalSquadRound(playerEntries, enemyEntries) {
    state.melee.fighters = getAllTacticalFighters();
    const plans = new Map();
    for (const entry of [...playerEntries, ...enemyEntries]) {
      plans.set(entry.fighter.id, {
        fighter: entry.fighter,
        action: buildTacticalMeleeAction(entry.fighter, entry.action, entry.plan.targetId),
        summaryAction: entry.action,
      });
    }
    return resolveMeleeRound(plans, { deferCompletion: true });
  }

  function applyTacticalVisualResults(entries, report) {
    for (const entry of entries || []) {
      entry.iceCritTargetIds = report?.plans?.get(entry.fighter?.id)?.context?.iceCritTargetIds || [];
    }
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

  function applyTacticalBuildWalls(actionEntries, report) {
    for (const { fighter, action } of actionEntries) {
      if (!action.effects?.buildThinWall) continue;
      const wall = action.tacticalBuildWall;
      if (!wall || action.tacticalMiss) {
        report.logs.push({ kind: "impact", text: `${fighter.label}尝试筑墙，但目标格不在相邻位置。` });
        continue;
      }
      const key = edgeKey(wall.first, wall.second);
      const alreadyExists = TACTICAL_MAP.thinWalls.includes(key)
        || (state.tactical.temporaryThinWalls || []).some((entry) => entry.key === key && entry.expireRound > state.round);
      if (alreadyExists) {
        report.logs.push({ kind: "impact", text: `${fighter.label}筑墙失败：${coordName(wall.first)} 与 ${coordName(wall.second)} 之间已有薄墙。` });
        continue;
      }
      state.tactical.temporaryThinWalls ||= [];
      state.tactical.temporaryThinWalls.push({
        key,
        activeRound: state.round + 1,
        expireRound: state.round + 1 + (BALANCE.heroes.guard.buildWallDuration || 2),
      });
      report.logs.push({ kind: "move", text: `${fighter.label}在 ${coordName(wall.first)} 与 ${coordName(wall.second)} 之间筑墙，下回合开始生效。` });
    }
  }

  function getCombatantCard(fighter) {
    if (getPlayerFighters().includes(fighter)) return tacticalUi.playerCard;
    if (fighter === state.enemyB) return tacticalUi.enemyBCard;
    return tacticalUi.enemyCard;
  }

  function applyTacticalMageLightning(actionEntries, report) {
    const actionsByFighter = new Map(actionEntries.map((entry) => [entry.fighter.id, entry.action]));
    let dealtDamage = false;
    for (const { fighter: source, action, plan } of actionEntries) {
      if (!action.effects?.mageLightning) continue;
      const target = action.tacticalTarget || getFighterById(plan?.targetId || action.targetId);
      if (!target || !isFighterTargetable(target)) {
        report.logs.push({ kind: "impact", text: `${source.label}释放闪电，但目标已经不在可命中位置。` });
        continue;
      }
      const targetAction = actionsByFighter.get(target.id) || ACTION_BY_ID.ji;
      const defense = target === source ? getDefense(target, targetAction) : getIncomingDefense(target, targetAction, source);
      const lightning = {
        ...action,
        kind: "attack",
        name: "闪电",
        power: BALANCE.heroes.mage.lightningPower,
        damage: 1,
        magicalAttack: true,
        gunnerSpellKey: "mage-lightning",
        gunnerSpellName: "闪电",
      };
      const attack = action.tacticalMiss ? 0 : getAttack(source, lightning, target);
      if (attack > defense) {
        const damageNotes = [];
        const targetCard = getCombatantCard(target);
        const absorbSeed = processGunnerIncomingAttack(target, source, lightning, damageNotes);
        const damage = dealDamage(source, target, lightning, `${source.label}释放闪电击穿${target.label}防御 ${formatDefense(defense)}，${target.label} HP -1。`, report.logs, damageNotes, targetCard, absorbSeed || {});
        dealtDamage ||= damage > 0;
        for (const note of damageNotes) report.logs.push({ text: note });
        continue;
      }

      report.logs.push({ kind: "impact", text: `${source.label}的闪电未击中${target.label}，向${target.label}身边敌方溅射 Ji刀。` });
      const splashAction = {
        id: "mage-lightning-splash",
        kind: "attack",
        name: "闪电溅射·Ji刀",
        cost: 0,
        power: BALANCE.heroes.mage.lightningSplashPower,
        damage: 1,
        range: BALANCE.heroes.mage.lightningSplashRange,
        magicalAttack: true,
        gunnerSpellKey: "mage-lightning",
        gunnerSpellName: "闪电溅射",
      };
      const splashTargets = getAllTacticalFighters().filter((victim) => {
        if (victim === target || !isFighterTargetable(victim)) return false;
        if (getFighterTeam(victim) === getFighterTeam(target)) return false;
        return getRouteDistance(target.position, victim.position, BALANCE.heroes.mage.lightningSplashRange) <= BALANCE.heroes.mage.lightningSplashRange;
      });
      if (!splashTargets.length) {
        report.logs.push({ text: `${target.label}身边没有可溅射的敌方目标。` });
        continue;
      }
      for (const victim of splashTargets) {
        const victimAction = actionsByFighter.get(victim.id) || ACTION_BY_ID.ji;
        const victimDefense = getIncomingDefense(victim, victimAction, target);
        const damageNotes = [];
        const targetCard = getCombatantCard(victim);
        const absorbSeed = processGunnerIncomingAttack(victim, target, splashAction, damageNotes);
        if (getAttack(target, splashAction, victim) > victimDefense) {
          const damage = dealDamage(target, victim, splashAction, `${target.label}引发的闪电溅射击穿${victim.label}防御 ${formatDefense(victimDefense)}，${victim.label} HP -1。`, report.logs, damageNotes, targetCard, absorbSeed || {});
          dealtDamage ||= damage > 0;
        } else {
          report.logs.push({ text: `${target.label}引发的闪电溅射强度 ${BALANCE.heroes.mage.lightningSplashPower} 未超过${victim.label}防御 ${formatDefense(victimDefense)}。` });
        }
        for (const note of damageNotes) report.logs.push({ text: note });
      }
    }
    if (dealtDamage) report.logs = report.logs.filter((item) => item.text !== "双方都没有造成伤害。");
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
        const knife = { ...ACTION_BY_ID["atk-1"], id: "firebomb-dagger", name: "燃烧弹·小刀", tacticalEffect: "firebomb-damage" };
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
          queueTacticalUnitCue(fighter, "damage", damage);
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
    state.over = state.tactical.playerScore >= scoringRules.victoryScore || state.tactical.enemyScore >= scoringRules.victoryScore;
    if (!state.over) return;
    const bothReached = state.tactical.playerScore >= scoringRules.victoryScore && state.tactical.enemyScore >= scoringRules.victoryScore;
    const playerWon = state.tactical.playerScore >= scoringRules.victoryScore;
    state.tactical.winReason = bothReached ? `双方同时达到 ${scoringRules.victoryScore} 分，平局。` : playerWon ? `己方率先取得 ${scoringRules.victoryScore} 分，积分胜利。` : `敌方率先取得 ${scoringRules.victoryScore} 分，积分胜利。`;
    report.logs.push({ kind: "win", text: state.tactical.winReason });
  }

  function captureDefeatSnapshot() {
    return new Map(getAllTacticalFighters().map((fighter) => [fighter.id, !isFighterDefeated(fighter)]));
  }

  function processTacticalDefeats(snapshot, report) {
    for (const fighter of getAllTacticalFighters()) {
      if (!snapshot.get(fighter.id) || !isFighterDefeated(fighter) || fighter.flags?.tacticalRespawnRound) continue;
      const defeatedTeam = getFighterTeam(fighter);
      const scoringTeam = defeatedTeam === "player" ? "enemy" : "player";
      if (scoringTeam === "player") state.tactical.playerScore += scoringRules.killScore;
      else state.tactical.enemyScore += scoringRules.killScore;
      fighter.flags ||= {};
      fighter.flags.tacticalRespawnRound = state.round + 1;
      state.tactical.objectiveHeld[fighter.id] = false;
      fighter.objectiveProgress = 0;
      state.tactical.lastScore = scoringRules.killScore > 0;
      announceScoreEvent({
        team: scoringTeam,
        method: "击杀得分",
        points: scoringRules.killScore,
        detail: `击倒 ${fighter.label}`,
      });
      report.logs.push({ kind: "score", text: `${fighter.label}被击倒，${scoringTeam === "player" ? "己方" : "敌方"}获得 ${scoringRules.killScore} 分；下回合将在出生点复活。` });
    }
  }

  function respawnTacticalFighters() {
    for (const fighter of getAllTacticalFighters()) {
      if (!fighter.flags?.tacticalRespawnRound || fighter.flags.tacticalRespawnRound > state.round) continue;
      const id = fighter.id;
      const label = fighter.label;
      const heroId = fighter.heroId;
      const spawn = findAvailableRespawnTile(getFighterSpawn(fighter), fighter);
      const fresh = makeFighter(label, heroId, { pharmacistLoadout: fighter.flags?.pharmacistLoadout, elfLoadout: fighter.flags?.elfLoadout });
      Object.assign(fighter, fresh);
      fighter.id = id;
      fighter.xp = 1;
      placeFighter(fighter, spawn);
      addTacticalLog(`${fighter.label}在 ${coordName(spawn)} 复活：恢复出生血量并获得 1 XP。`, "score");
    }
    state.melee.fighters = getAllTacticalFighters();
  }

  function findAvailableRespawnTile(preferred, fighter) {
    const occupied = getOccupiedTiles(fighter);
    if (isStandable(preferred, occupied)) return cloneTile(preferred);
    const reachable = bfsPath(preferred, neighbors(preferred).filter((tile) => isStandable(tile, occupied)), []);
    return cloneTile(reachable[reachable.length - 1] || preferred);
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

    const initialEnergyTiles = getInitialEnergyTiles();
    const fallback = initialEnergyTiles[refreshIndex] || initialEnergyTiles[0] || INITIAL_ENERGY_TILES[0];
    return cloneTile(candidates[getTacticalRandomIndex(candidates.length, `energy-${refreshIndex}`)] || fallback);
  }

  function applyObjectiveEntryBonuses(movement) {
    for (const entry of movement) {
      if (entry.fighter.heroId !== "vaingloriousWarrior") continue;
      if (sameTile(entry.start, TACTICAL_MAP.objective) || !sameTile(entry.end, TACTICAL_MAP.objective)) continue;
      entry.fighter.xp += 1;
      addTacticalLog(`${entry.fighter.label}踏入据点，触发凯旋入场并获得 1 XP。`, "score");
    }
  }

  function updateObjective() {
    state.tactical.lastScore = false;
    if (state.over) return;
    for (const player of getPlayerFighters()) resolveObjectiveControl(player, player.id, "player", player.label);
    for (const enemy of getEnemyFighters()) resolveObjectiveControl(enemy, enemy.id, "enemy", enemy.label);
    if (state.tactical.playerScore >= scoringRules.victoryScore || state.tactical.enemyScore >= scoringRules.victoryScore) {
      state.over = true;
      const bothReached = state.tactical.playerScore >= scoringRules.victoryScore && state.tactical.enemyScore >= scoringRules.victoryScore;
      const playerWon = state.tactical.playerScore >= scoringRules.victoryScore;
      state.tactical.winReason = bothReached ? `双方同时达到 ${scoringRules.victoryScore} 分，平局。` : playerWon ? `你率先取得 ${scoringRules.victoryScore} 分，积分胜利。` : `敌方率先取得 ${scoringRules.victoryScore} 分，积分胜利。`;
      addTacticalLog(state.tactical.winReason, "score");
    }
  }

  function resolveObjectiveControl(fighter, trackerId, team, sideLabel) {
    const heldLastRound = Boolean(state.tactical.objectiveHeld[trackerId]);
    const standingOnObjective = !isFighterDefeated(fighter) && sameTile(fighter.position, TACTICAL_MAP.objective);
    fighter.objectiveProgress = standingOnObjective ? 1 : 0;

    if (!standingOnObjective) {
      state.tactical.objectiveHeld[trackerId] = false;
      return;
    }

    if (!heldLastRound) {
      state.tactical.objectiveHeld[trackerId] = true;
      addTacticalLog(`${sideLabel}占据中央据点，下一回合守住并支付 ${OBJECTIVE_SCORE_COST} XP 后得分。`, "score");
      return;
    }

    if (fighter.xp < OBJECTIVE_SCORE_COST) {
      state.tactical.objectiveHeld[trackerId] = true;
      addTacticalLog(`${sideLabel}守住据点，但 XP 不足 ${OBJECTIVE_SCORE_COST}，暂不计分。`, "score");
      return;
    }

    fighter.xp -= OBJECTIVE_SCORE_COST;
    if (team === "player") state.tactical.playerScore += scoringRules.objectiveScore;
    else state.tactical.enemyScore += scoringRules.objectiveScore;
    state.tactical.lastScore = true;
    state.tactical.objectiveHeld[trackerId] = false;
    fighter.objectiveProgress = 0;
    fighter.position = getObjectiveRespawn(fighter);
    announceScoreEvent({
      team,
      method: "据点得分",
      points: scoringRules.objectiveScore,
      detail: `${sideLabel}守住中央据点`,
    });
    addTacticalLog(`${sideLabel}守住据点并支付 ${OBJECTIVE_SCORE_COST} XP，获得 ${scoringRules.objectiveScore} 分，刷新至 ${coordName(fighter.position)}。`, "score");
  }

  function getObjectiveRespawn(fighter) {
    const occupied = getOccupiedTiles(fighter);
    const candidates = OBJECTIVE_RESPAWNS.filter((position) => !isWall(position) && !sameTile(position, TACTICAL_MAP.objective) && !occupied.some((tile) => sameTile(position, tile)) && !containsTile(TACTICAL_MAP.energyTiles, position));
    return cloneTile(candidates[getTacticalRandomIndex(candidates.length, `objective-${fighter.id || fighter.heroId}`)] || OBJECTIVE_RESPAWNS[0]);
  }

  function getTacticalRandomIndex(length, salt) {
    if (!length) return 0;
    const online = state.tactical?.online;
    if (!online) return Math.floor(Math.random() * length);
    return tacticalCore.seededIndex(length, `${online.roomCode}:${state.round}:${salt}`);
  }

  async function animateCombat() {
    const cards = [tacticalUi.playerCard, tacticalUi.enemyCard, ...(state.enemyB ? [tacticalUi.enemyBCard] : [])];
    for (const card of cards) card.classList.add("card-shake");
    await pause(240);
    for (const card of cards) card.classList.remove("card-shake");
  }
  function pause(ms) { return new Promise((resolve) => window.setTimeout(resolve, ms)); }

  function openEndPhaseChoice(choice) {
    state.tactical.pendingEndChoice = choice;
    showModal("追索", (body) => {
      const text = document.createElement("p"); text.textContent = `${choice.actor.label}触发追索，请选择结束阶段效果。`; body.append(text);
      const choices = document.createElement("div"); choices.className = "plan-controls";
      const drain = document.createElement("button"); drain.type = "button"; drain.textContent = `令 ${choice.target.label} -1 XP`;
      const gain = document.createElement("button"); gain.type = "button"; gain.textContent = "自己 +1 XP";
      drain.addEventListener("click", () => resolveTacticalEndChoice(choice, "drain")); gain.addEventListener("click", () => resolveTacticalEndChoice(choice, "gain")); choices.append(drain, gain); body.append(choices);
    });
  }
  function resolveTacticalEndChoice(choice, option) {
    state.tactical.pendingEndChoice = null;
    tacticalUi.modal.hidden = true;
    for (const item of applyEndPhaseChoice(choice, option)) addTacticalLog(item.text);
    const nextChoice = state.tactical.endChoiceQueue?.shift();
    if (nextChoice) {
      openEndPhaseChoice(nextChoice);
      return;
    }
    for (const automaticChoice of state.tactical.automaticEndChoices || []) {
      for (const item of applyEndPhaseChoice(automaticChoice, chooseAutomaticEndPhaseOption(automaticChoice))) addTacticalLog(item.text);
    }
    state.tactical.automaticEndChoices = [];
    completeTacticalRound();
  }

  function completeTacticalRound() {
    state.round += 1;
    pruneTemporaryThinWalls();
    respawnTacticalFighters();
    state.tactical.phase = "movement"; state.tactical.selection = "move"; state.tactical.path = []; state.tactical.selectedCardId = null; state.tactical.battleMageImprint = false; clearActionTargets(); state.tactical.resolving = false; state.tactical.lastScore = false; state.tactical.standbyAutoPassScheduled = false; state.tactical.pendingEndChoice = null; state.tactical.endChoiceQueue = []; state.tactical.automaticEndChoices = []; state.tactical.lockedPlans = { movement: {}, action: {} };
    pruneMovementTolls();
    refreshMovePointsForPhase("movement");
    activatePlanningPlayer(getAlivePlayers()[0] || state.player, "movement");
    addTacticalLog(`第 ${state.round} 回合开始。`, "move"); renderTactical();
  }

  function finishTacticalMatch() {
    state.tactical.phase = "finished"; state.tactical.resolving = false; state.tactical.pendingEndChoice = null;
    if (!state.tactical.winReason) {
      const bothReached = state.tactical.playerScore >= scoringRules.victoryScore && state.tactical.enemyScore >= scoringRules.victoryScore;
      state.tactical.winReason = bothReached ? "双方同时达到获胜分数，平局。" : state.tactical.playerScore >= scoringRules.victoryScore ? "己方率先达到获胜分数，积分胜利。" : "敌方率先达到获胜分数，积分胜利。";
      addTacticalLog(state.tactical.winReason, "impact");
    }
    recordTacticalMatch(); renderTactical();
  }

  function recordTacticalMatch() {
    if (state.matchRecorded) return;
    const result = state.tactical.playerScore >= scoringRules.victoryScore && state.tactical.enemyScore >= scoringRules.victoryScore ? "draw" : state.tactical.playerScore >= scoringRules.victoryScore ? "win" : "loss";
    const mode = state.tactical.battleMode === "online-team" ? "tactical-online-2v2" : state.tactical.battleMode === "online" ? "tactical-online" : state.tactical.battleMode === "team" ? "tactical-2v2" : state.tactical.battleMode === "trio" ? "tactical-1v2" : "tactical-cpu";
    const modeLabel = state.tactical.battleMode === "online-team" ? "在线地图 2v2" : state.tactical.battleMode === "online" ? "在线地图 1v1" : state.tactical.battleMode === "team" ? "地图 2v2" : state.tactical.battleMode === "trio" ? "地图 1v2" : "地图 1v1";
    const record = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, playerName: state.player.label, finishedAt: new Date().toISOString(), rounds: state.round, mode, modeLabel, playerHero: getPlayerFighters().map((fighter) => getHeroDisplayName(fighter.hero)).join(" + "), opponentHeroes: getEnemyFighters().map((fighter) => `${fighter.label}：${getHeroDisplayName(fighter.hero)}`), result, winReason: "score" };
    writeMatchHistory([record, ...readMatchHistory()].slice(0, MAX_HISTORY_RECORDS)); state.matchRecorded = true;
  }

  function announceScoreEvent({ team, method, points, detail }) {
    if (!points) return;
    const stack = getScoreEventStack();
    const banner = document.createElement("div");
    banner.className = `score-event-banner ${team === "player" ? "score-player" : "score-enemy"}`;
    banner.setAttribute("role", "status");
    banner.setAttribute("aria-live", "polite");

    const side = document.createElement("span");
    side.className = "score-event-side";
    side.textContent = team === "player" ? "己方" : "敌方";

    const body = document.createElement("span");
    body.className = "score-event-body";
    const title = document.createElement("strong");
    title.textContent = method;
    const sub = document.createElement("em");
    sub.textContent = detail;
    body.append(title, sub);

    const gain = document.createElement("span");
    gain.className = "score-event-points";
    gain.textContent = `+${points}`;

    banner.append(side, body, gain);
    stack.prepend(banner);
    window.setTimeout(() => banner.classList.add("is-leaving"), 2100);
    window.setTimeout(() => {
      banner.remove();
      if (!stack.children.length) stack.remove();
    }, 2750);
  }

  function getScoreEventStack() {
    let stack = document.querySelector(".score-event-stack");
    if (!stack) {
      stack = document.createElement("div");
      stack.className = "score-event-stack";
      tacticalUi.shell.append(stack);
    }
    return stack;
  }

  function addTacticalLog(text, kind = "") {
    tacticalLogEntries.unshift({
      text: `${isPreparationRound() ? "预备" : `R${state.round}`} | ${text}`,
      kind,
    });
    tacticalLogEntries = tacticalLogEntries.slice(0, TACTICAL_LOG_MAX_ENTRIES);
    renderTacticalLogSummary();
  }

  function createTacticalLogItem(entry) {
    const item = document.createElement("li");
    if (entry.kind) item.className = `log-${entry.kind}`;
    item.textContent = entry.text;
    return item;
  }

  function renderTacticalLogSummary() {
    tacticalUi.log.textContent = "";
    const previewEntries = tacticalLogEntries.slice(0, TACTICAL_LOG_PREVIEW_LIMIT);
    if (!previewEntries.length) {
      const empty = document.createElement("li");
      empty.className = "log-empty";
      empty.textContent = "暂无战斗记录";
      tacticalUi.log.append(empty);
      return;
    }
    tacticalUi.log.append(...previewEntries.map(createTacticalLogItem));
  }

  function clearTacticalLog() {
    tacticalLogEntries = [];
    renderTacticalLogSummary();
  }

  function showFullTacticalLog() {
    showModal("完整战斗日志", (body) => {
      const summary = document.createElement("p");
      summary.className = "tactical-full-log-summary";
      summary.textContent = tacticalLogEntries.length
        ? `共 ${tacticalLogEntries.length} 条记录，最新记录显示在最上方。`
        : "当前对局还没有战斗记录。";
      body.append(summary);
      if (!tacticalLogEntries.length) return;
      const list = document.createElement("ol");
      list.className = "tactical-full-log";
      list.append(...tacticalLogEntries.map(createTacticalLogItem));
      body.append(list);
    });
  }

  function formatHeroStartingMeta(hp, xp) {
    return xp > 0 ? `${hp} 血，开局 ${xp} XP` : `${hp} 血`;
  }

  function getMapSelectorSummary(entry) {
    const map = entry.map;
    return `${map.rows}×${map.cols} · 据点 ${coordName(map.objective)} · 能量 ${map.energyTiles.length} · 草丛 ${map.bushes.length} · 巨石 ${map.walls.length} · 薄墙 ${map.thinWalls.length}`;
  }

  function activateSelectedTacticalMap(entry, isDefault = false) {
    if (isTacticalOnline()) {
      tacticalUi.modalBody.textContent = "在线房间中的地图由房主同步，不能在对局中单独切换。";
      return;
    }
    const map = sanitizeMapConfig(entry.map);
    const spawns = sanitizeSpawnDraft(entry.spawns || getDefaultSpawnDraft(), map);
    setActiveMapId(isDefault ? "" : entry.id);
    writeStorage(TACTICAL_MAP_KEY, JSON.stringify(map));
    persistSpawnDraft(spawns);
    applyMapConfig(map);
    initializeTacticalSetup();
    applySpawnDraftToControls(spawns);
    hideModal();
    resetTacticalGame();
    addTacticalLog(`已切换至地图「${entry.name}」。`, "score");
  }

  function showMapSelector() {
    showModal("选择地图", (body) => {
      const note = document.createElement("p");
      note.textContent = mapEditor.active
        ? "地图编辑器仍有未保存内容，请先保存地图或退出编辑后再切换。"
        : isTacticalOnline()
        ? "在线房间由房主同步地图；当前对局不能单独切换。"
        : "选择后会立即按该地图及保存的出生点开始新对局。";
      body.append(note);
      if (mapEditor.active || isTacticalOnline()) return;

      const grid = document.createElement("div");
      grid.className = "map-selector-grid";
      const defaultEntry = { id: "", name: "默认潮汐遗迹", map: cloneMapConfig(DEFAULT_TACTICAL_MAP), spawns: getDefaultSpawnDraft() };
      const entries = [defaultEntry, ...readMapLibrary()];
      const activeId = getActiveMapId();
      for (const entry of entries) {
        const choice = document.createElement("button");
        choice.type = "button";
        choice.className = "map-selector-card";
        choice.classList.toggle("is-selected", entry.id === activeId || (!entry.id && !activeId));
        const title = document.createElement("strong"); title.textContent = entry.name;
        const meta = document.createElement("span"); meta.textContent = getMapSelectorSummary(entry);
        const terrain = document.createElement("span"); terrain.className = "map-selector-terrain";
        for (const type of ["objective", "energy", "bush", "wall"]) {
          const marker = document.createElement("i"); marker.className = type; terrain.append(marker);
        }
        const action = document.createElement("em"); action.textContent = entry.id === activeId || (!entry.id && !activeId) ? "当前使用" : "选择此地图";
        choice.append(title, meta, terrain, action);
        choice.addEventListener("click", () => activateSelectedTacticalMap(entry, !entry.id));
        grid.append(choice);
      }
      body.append(grid);
    });
  }

  function showManual() {
    showModal("战术原型说明", (body) => {
      appendSection(body, "基本流程", "开局第一回合前有一个预备回合，只能移动 1 格且不会出招。正式回合先锁定 1 格移动并同时结算；位置稳定后再选择行动卡，同时结算出招。普通攻击只能攻击武器距离内的敌方。移动阶段可用 WASD + Q/E 选择六个方向，Enter 锁定当前阶段。");
      appendSection(body, "地图资源", `能量点在回合结束时提供 1 XP。中央据点需要先占据一回合；下一回合仍守住且拥有 ${OBJECTIVE_SCORE_COST} XP 时，支付 ${OBJECTIVE_SCORE_COST} XP 获得 ${scoringRules.objectiveScore} 分并被刷新到外围位置。草丛外看不到草丛内的单位；草丛内可以看见外部，但两个草丛单位只有距离 1 时才互相可见。巨石无法进入；薄墙位于格子边缘，会阻挡移动路线与攻击距离，必须绕路计算。率先获得 ${scoringRules.victoryScore} 分获胜。`);
      appendSection(body, "地图编辑器", "在对战设置中打开地图编辑器后，可直接点击地图设置双方出生点、据点、能量点、草丛、巨石和薄墙。出生点不能重合，也不能放在巨石、据点或能量点上；薄墙需要先点一个格子，再点相邻格子来切换两格之间的边。使用原名称保存会更新该地图；改名后保存会另存为新地图，原地图保留。保存后地图和出生点都会记录在本地，并以新设置开始新对局。");
      appendSection(body, "行动卡", "攻击分为短攻（距离 1）、长攻（距离 2）与锦囊。燃烧弹需要选择两个连续相邻格，各格立即受到小刀攻击，并在下回合留下火焰；站在火焰上且本回合防御低于 1 的角色会失去 1 HP，不分敌我。当前没有随机抽牌、牌库或卡组。技能会标注其目标要求；具体效果继续走旧版英雄规则。");
      appendSection(body, "对战模式", `地图为 8×8 六边形战场。1v1 为单人对单个人机；1v2 中两个人机组成同一阵营；2v2 由你依次规划两名英雄，对战会协同集火与抢点的电脑小队。所有模式中，击倒英雄获得 ${scoringRules.killScore} 分；被击倒者下回合以出生血量和 1 XP 在出生点复活。率先达到 ${scoringRules.victoryScore} 分获胜。在线 1v1 与在线 2v2 都可创建或加入房间；在线 2v2 每名真人各操控两名英雄。`);
      appendSection(body, "原型边界", "完整战斗日志会保留隐形单位的移动坐标，方便测试规则；在线房间为内存房间，服务重启后房间会失效。");
    });
  }
  function appendSection(parent, title, text) { const heading = document.createElement("h3"); heading.textContent = title; const paragraph = document.createElement("p"); paragraph.textContent = text; parent.append(heading, paragraph); }

  function showScoringSettings() {
    showModal("计分规则", (body) => {
      const note = document.createElement("p"); note.textContent = "修改后立即用于当前对局；击杀、据点与获胜分数对 1v1、1v2、2v2 和在线模式均生效，并会记住到下次打开游戏。"; body.append(note);
      const form = document.createElement("div"); form.className = "scoring-settings-grid";
      const fields = [
        ["击杀得分", "killScore", scoringRules.killScore, 0],
        ["占领据点得分", "objectiveScore", scoringRules.objectiveScore, 0],
        ["获胜所需分数", "victoryScore", scoringRules.victoryScore, 1],
      ];
      const inputs = {};
      for (const [labelText, key, value, min] of fields) {
        const label = document.createElement("label"); label.textContent = labelText;
        const input = document.createElement("input"); input.type = "number"; input.min = String(min); input.max = "99"; input.step = "1"; input.value = String(value);
        inputs[key] = input; label.append(input); form.append(label);
      }
      const summary = document.createElement("p"); summary.className = "scoring-settings-summary";
      summary.textContent = `当前比分 ${state.tactical.playerScore}:${state.tactical.enemyScore}`;
      const apply = document.createElement("button"); apply.type = "button"; apply.className = "scoring-settings-apply"; apply.textContent = "应用计分规则";
      apply.addEventListener("click", () => {
        scoringRules = {
          killScore: clampRuleValue(inputs.killScore.value, scoringRules.killScore, 0),
          objectiveScore: clampRuleValue(inputs.objectiveScore.value, scoringRules.objectiveScore, 0),
          victoryScore: clampRuleValue(inputs.victoryScore.value, scoringRules.victoryScore, 1),
        };
        writeStorage(TACTICAL_SCORING_KEY, JSON.stringify(scoringRules));
        tacticalUi.modal.hidden = true;
        addTacticalLog(`计分规则更新：击杀 ${scoringRules.killScore} 分，据点 ${scoringRules.objectiveScore} 分，${scoringRules.victoryScore} 分获胜。`, "score");
        if (!state.over && (state.tactical.playerScore >= scoringRules.victoryScore || state.tactical.enemyScore >= scoringRules.victoryScore)) {
          state.over = true;
          state.tactical.winReason = state.tactical.playerScore >= scoringRules.victoryScore ? "己方已达到新的获胜分数。" : "敌方已达到新的获胜分数。";
          finishTacticalMatch();
        } else renderTactical();
      });
      body.append(form, summary, apply);
    });
  }

  function showHistory() {
    showModal("历史对局", (body) => {
      const records = readMatchHistory().filter((record) => record.playerName === normalizePlayerName(tacticalUi.playerName.value));
      const summary = document.createElement("p"); const wins = records.filter((record) => record.result === "win").length; summary.textContent = `共 ${records.length} 局，胜利 ${wins} 局。`; body.append(summary);
      if (!records.length) { const empty = document.createElement("p"); empty.textContent = "当前昵称还没有完成的对局。"; body.append(empty); return; }
      const list = document.createElement("ul");
      for (const record of records.slice(0, 12)) { const item = document.createElement("li"); item.textContent = `${record.result === "win" ? "胜" : record.result === "loss" ? "负" : "平"} | ${record.playerHero} vs ${record.opponentHeroes.join("，")} | ${record.rounds} 回合${record.winReason ? ` | ${record.winReason === "objective" ? "据点" : record.winReason === "score" ? "积分" : "击倒"}胜负` : ""}`; list.append(item); }
      body.append(list);
    });
  }

  function openTacticalHeroPicker(side) {
    const select = side === "player" ? tacticalUi.playerHero : side === "player-b" ? tacticalUi.playerBHero : side === "enemy-b" ? tacticalUi.enemyBHero : tacticalUi.enemyHero;
    const title = side === "player" ? "选择你的英雄 A" : side === "player-b" ? "选择你的英雄 B" : side === "enemy-b" ? "选择电脑 B 英雄" : "选择电脑 A 英雄";
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
        const meta = document.createElement("span"); meta.textContent = formatHeroStartingMeta(hero.maxHp, hero.startingXp);
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
      const summary = document.createElement("p"); summary.textContent = `${formatHeroStartingMeta(fighter.startingHp, hero.startingXp)}。${hero.description || ""}`; body.append(summary);
      const lore = document.createElement("p"); lore.className = "tactical-hero-lore"; lore.textContent = HERO_LORE[hero.id] || "此英雄的背景故事仍在雾中。"; body.append(lore);
      appendTacticalHeroSection(body, "被动", hero.passives || [], "无被动");
      appendTacticalHeroSection(body, "主动技能", hero.activeSkills || [], "无主动技能");
      const liveEntries = getFighterStatusEntries(fighter).filter((entry) => !(hero.passives || []).includes(entry));
      if (liveEntries.length) appendTacticalHeroSection(body, "当前状态", liveEntries, "");
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
    if (event.currentTarget.classList.contains("is-concealed")) return;
    const side = event.currentTarget === tacticalUi.playerCard ? (getActivePlayer() === state.playerB ? "player-b" : "player") : event.currentTarget === tacticalUi.enemyBCard ? "enemy-b" : "enemy";
    const fighter = side === "player" ? state.player : side === "player-b" ? state.playerB : side === "enemy-b" ? state.enemyB : state.enemy;
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
  function hideModal() {
    const pendingChoice = state.tactical?.pendingEndChoice;
    if (pendingChoice) {
      resolveTacticalEndChoice(pendingChoice, "gain");
      return;
    }
    tacticalUi.modal.hidden = true;
  }

  function applyHeroChoices() {
    if (mapEditor.active) {
      mapEditor.notice = "地图仍在编辑中：请先点击“保存地图”提交出生点和地形，或退出编辑放弃本次修改。";
      renderTactical();
      return;
    }
    const name = normalizePlayerName(tacticalUi.playerName.value); tacticalUi.playerName.value = name;
    writeStorage(STORAGE_KEYS.playerName, name);
    writeStorage(STORAGE_KEYS.heroSelection, JSON.stringify({ playerHero: tacticalUi.playerHero.value, playerBHero: tacticalUi.playerBHero.value, enemyHero: tacticalUi.enemyHero.value, enemyBHero: tacticalUi.enemyBHero.value }));
    tacticalMenuOpen = false;
    resetTacticalGame();
  }

  function openTacticalMenu() {
    if (mapEditor.active) cancelMapEditor();
    tacticalMenuOpen = true;
    renderTactical();
  }

  function closeTacticalMenu() {
    if (mapEditor.active) cancelMapEditor();
    tacticalMenuOpen = false;
    renderTactical();
  }

  function changeBattleMode(mode) {
    const wasOnline = isTacticalOnline();
    if (wasOnline) stopTacticalOnlinePolling();
    if (mapEditor.active) cancelMapEditor();
    setupBattleMode = mode === "online-team" ? "online-team" : mode === "team" ? "team" : mode === "trio" ? "trio" : mode === "online" ? "online" : "duel";
    syncBattleModeControls();
    if (!isOnlineSetupMode()) applyDefaultSpawns();
    if (wasOnline) resetTacticalGame();
  }

  function handleTacticalKeyboard(event) {
    const tag = event.target?.tagName;
    if (["INPUT", "SELECT", "TEXTAREA"].includes(tag) || !tacticalUi.modal.hidden || state.over) return;
    if (mapEditor.active) return;
    if (event.key === "Enter") {
      if (isPharmacistLoadoutPhase()) {
        event.preventDefault();
        confirmInitialPharmacistLoadout();
        return;
      }
      if (isElfLoadoutPhase()) {
        event.preventDefault();
        tacticalUi.cards.querySelector(".loadout-confirm")?.click();
        return;
      }
      if (!tacticalUi.lock.disabled) {
        event.preventDefault();
        lockPlan();
      }
      return;
    }
    if (state.tactical.phase === "action" && !event.repeat) {
      const quickActionId = { j: "ji", k: "def-small", l: "atk-1" }[event.key.toLowerCase()];
      if (quickActionId && selectTacticalAction(quickActionId)) {
        event.preventDefault();
        return;
      }
    }
    if (event.code === "Space" || event.key === " ") {
      if (isPharmacistLoadoutPhase() || isElfLoadoutPhase()) return;
      if (state.tactical.phase === "action") {
        event.preventDefault();
        cycleAvailableAction();
      }
      return;
    }
    if (state.tactical.phase === "action" && !event.repeat) {
      const pageDirection = { a: -1, d: 1 }[event.key.toLowerCase()];
      if (pageDirection) {
        event.preventDefault();
        pageTacticalCards(pageDirection);
      }
      return;
    }
    if (state.tactical.phase !== "movement" || event.repeat) return;
    const directionIndex = { a: 0, d: 1, w: 2, q: 3, s: 4, e: 5 }[event.key.toLowerCase()];
    if (directionIndex === undefined) return;
    const destination = directionalNeighbors(getActivePlayer().position)[directionIndex];
    if (!destination) return;
    event.preventDefault();
    state.tactical.path = [];
    editPlayerPath(destination);
    renderTactical();
  }

  tacticalUi.map.addEventListener("pointerdown", handleMapEditorPointerDown, true);
  tacticalUi.map.addEventListener("click", handleMapClick);
  tacticalUi.view3dToggle?.addEventListener("click", () => {
    const next = !tacticalUi.view3dToggle.matches('[aria-pressed="true"]');
    tacticalUi.view3dToggle.setAttribute("aria-pressed", String(next));
    tacticalUi.view3dToggle.textContent = next ? "2D 战术" : "3D 战术";
    tacticalUi.map.hidden = next;
    tacticalUi.stage3d.hidden = !next;
    tacticalUi.shell.classList.toggle("is-3d-view", next);
    try { localStorage.setItem("ji-tactical-3d-view", String(next)); } catch (_) { /* local view preference is optional */ }
    window.renderJiTactical3d?.(window.__JI_TACTICAL_3D_SNAPSHOT__);
  });
  tacticalUi.playerOverview.addEventListener("click", handlePlayerOverviewClick);
  tacticalUi.enemyOverview.addEventListener("click", handleEnemyOverviewClick);
  tacticalUi.cards.addEventListener("click", handleCardClick);
  tacticalUi.filters.addEventListener("click", setFilter);
  tacticalUi.battleMageImprint?.addEventListener("click", toggleBattleMageImprint);
  tacticalUi.cancel.addEventListener("click", cancelPlan);
  tacticalUi.lock.addEventListener("click", lockPlan);
  tacticalUi.reset.addEventListener("click", () => {
    resetTacticalGame();
    if (isOnlineSetupMode()) setTacticalRoomStatus("已离开房间。可以创建新房间或输入代码加入。");
  });
  tacticalUi.menuButton.addEventListener("click", openTacticalMenu);
  tacticalUi.mapSelect.addEventListener("click", showMapSelector);
  tacticalUi.menuClose.addEventListener("click", closeTacticalMenu);
  tacticalUi.menuBackdrop.addEventListener("click", closeTacticalMenu);
  tacticalUi.applyHeroes.addEventListener("click", applyHeroChoices);
  tacticalUi.playerHero.addEventListener("change", handlePlayerHeroSelectionChanged);
  tacticalUi.expandLog.addEventListener("click", showFullTacticalLog);
  tacticalUi.clearLog.addEventListener("click", clearTacticalLog);
  tacticalUi.manual.addEventListener("click", showManual);
  tacticalUi.scoring.addEventListener("click", showScoringSettings);
  tacticalUi.history.addEventListener("click", showHistory);
  tacticalUi.playerCard.addEventListener("click", handleCombatantCardClick);
  tacticalUi.enemyCard.addEventListener("click", handleCombatantCardClick);
  tacticalUi.enemyBCard.addEventListener("click", handleCombatantCardClick);
  tacticalUi.playerCard.addEventListener("keydown", handleCombatantCardKeydown);
  tacticalUi.enemyCard.addEventListener("keydown", handleCombatantCardKeydown);
  tacticalUi.enemyBCard.addEventListener("keydown", handleCombatantCardKeydown);
  tacticalUi.duelMode.addEventListener("click", () => changeBattleMode("duel"));
  tacticalUi.trioMode.addEventListener("click", () => changeBattleMode("trio"));
  tacticalUi.teamMode.addEventListener("click", () => changeBattleMode("team"));
  tacticalUi.onlineMode.addEventListener("click", () => changeBattleMode("online"));
  tacticalUi.onlineTeamMode?.addEventListener("click", () => changeBattleMode("online-team"));
  tacticalUi.createRoom.addEventListener("click", createTacticalOnlineRoom);
  tacticalUi.joinRoom.addEventListener("click", joinTacticalOnlineRoom);
  tacticalUi.defaultSpawns.addEventListener("click", applyDefaultSpawns);
  for (const input of [tacticalUi.playerSpawnInput, tacticalUi.playerBSpawnInput, tacticalUi.enemySpawnInput, tacticalUi.enemyBSpawnInput]) {
    input?.addEventListener("change", handleManualSpawnInput);
    input?.addEventListener("keydown", handleManualSpawnInput);
  }
  tacticalUi.mapEditorToggle.addEventListener("click", () => { if (mapEditor.active) cancelMapEditor(); else openMapEditor(); });
  tacticalUi.mapEditorTools.addEventListener("click", setMapEditorTool);
  tacticalUi.mapEditorSpawnStatus?.addEventListener("click", setMapEditorSpawnTool);
  tacticalUi.mapEditorLibrary?.addEventListener("change", () => {
    const entry = getSelectedMapLibraryEntry();
    if (tacticalUi.mapEditorName) tacticalUi.mapEditorName.value = entry?.name || "";
    mapEditor.libraryId = entry?.id || "";
    renderMapEditor();
  });
  tacticalUi.mapEditorName?.addEventListener("input", () => {
    if (mapEditor.active && tacticalUi.mapName) tacticalUi.mapName.textContent = getCurrentMapName();
  });
  tacticalUi.mapEditorLoad?.addEventListener("click", loadSelectedMapFromLibrary);
  tacticalUi.mapEditorDelete?.addEventListener("click", deleteSelectedMapFromLibrary);
  tacticalUi.mapEditorSave.addEventListener("click", saveMapEditorDraft);
  tacticalUi.mapEditorReset.addEventListener("click", resetMapEditorDraft);
  tacticalUi.mapEditorCancel.addEventListener("click", cancelMapEditor);
  tacticalUi.tutorialNext?.addEventListener("click", advanceTutorial);
  tacticalUi.tutorialSkip?.addEventListener("click", exitTutorial);
  tacticalUi.modalClose.addEventListener("click", hideModal);
  tacticalUi.modal.addEventListener("click", (event) => { if (event.target === tacticalUi.modal) hideModal(); });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (!tacticalUi.modal.hidden) hideModal();
    else if (tacticalMenuOpen) closeTacticalMenu();
  });
  document.addEventListener("keydown", handleTacticalKeyboard);

  window.__JI_DEBUG__ = {
    getState: () => state,
    resetGame: resetTacticalGame,
    setPlayerXp: (value) => { state.player.xp = value; renderTactical(); },
    setPlayerBXp: (value) => { if (state.playerB) state.playerB.xp = value; renderTactical(); },
    setEnemyXp: (value) => { state.enemy.xp = value; renderTactical(); },
    setEnemyBXp: (value) => { if (state.enemyB) state.enemyB.xp = value; renderTactical(); },
    setBattleMode: (mode) => { changeBattleMode(mode); resetTacticalGame(); },
    setPositions: (player, enemy, enemyB = null, playerB = null) => { placeFighter(state.player, player); placeFighter(state.enemy, enemy); if (state.enemyB && enemyB) placeFighter(state.enemyB, enemyB); if (state.playerB && playerB) placeFighter(state.playerB, playerB); renderTactical(); },
    forceRound: lockPlan,
    resolveSimultaneousMovement,
    resolveGroupMovement,
    applyMapResources,
    getEnergyTiles: () => TACTICAL_MAP.energyTiles.map(cloneTile),
    getMap: () => ({ rows: TACTICAL_MAP.rows, cols: TACTICAL_MAP.cols, objective: cloneTile(TACTICAL_MAP.objective), walls: TACTICAL_MAP.walls.map(cloneTile), bushes: TACTICAL_MAP.bushes.map(cloneTile), energyTiles: TACTICAL_MAP.energyTiles.map(cloneTile), thinWalls: TACTICAL_MAP.thinWalls.slice() }),
    getRules: () => ({ ...scoringRules, objectiveScoreCost: OBJECTIVE_SCORE_COST, movePoints: MOVE_POINTS }),
    canSee: (viewerId, targetId) => canFighterSee(getFighterById(viewerId), getFighterById(targetId)),
    getVisibleEnemies: () => getEnemyFighters().filter((fighter) => isFighterVisibleToTeam(fighter, "player")).map((fighter) => fighter.id),
  };
  window.playTacticalUnitCue = playTacticalUnitCue;

  applyMapConfig(loadSavedMapConfig());
  initializeHeroSelects();
  setupTutorialFromRequest();
  resetTacticalGame();
  try {
    if (localStorage.getItem("ji-tactical-3d-view") === "true") tacticalUi.view3dToggle?.click();
  } catch (_) { /* local view preference is optional */ }
})();
