const BALANCE = {
  startingHp: 1,
  startingXp: 0,
  maxHpBonus: 2,
  xpMeterMax: 10,
  defenseGrades: {
    none: 0,
    small: 4,
    mid: 9,
    big: 10,
    super: 99,
    invincible: 999,
  },
  actions: {
    charge: {
      ji: { name: "Ji", cost: 0, defense: 0, xpGain: 1 },
    },
    defenses: {
      "def-small": { name: "小防", cost: 0, defense: 4 },
      "def-mid": { name: "中防", cost: 1, defense: 9 },
      "def-big": { name: "大防", cost: 2, defense: 10 },
    },
    attacks: [
      { id: "atk-1", name: "小刀", cost: 1, power: 1 },
      { id: "atk-2", name: "大刀", cost: 2, power: 2 },
      { id: "atk-3", name: "冰刀", cost: 3, power: 3 },
      { id: "atk-4", name: "火刀", cost: 4, power: 4 },
      { id: "atk-5", name: "鬼刀", cost: 5, power: 5 },
      { id: "atk-6", cost: 6, power: 6 },
      { id: "atk-7", cost: 7, power: 7 },
      { id: "atk-8", cost: 8, power: 8 },
      { id: "atk-9", cost: 9, power: 9 },
      { id: "atk-10", cost: 10, power: 10 },
    ],
  },
  heroes: {
    battery: {
      jiStreakRequired: 2,
      bonusXp: 1,
    },
    guard: {
      defenseBonus: 1,
    },
    breaker: {
      minAttackCost: 5,
      attackBonus: 1,
    },
    priest: {
      maxHp: 3,
      allowedAttackCosts: [1, 5, 10],
      shieldCost: 1,
      healCost: 4,
      healAmount: 1,
    },
    assassin: {
      maxHp: 1,
      jiXpGain: 4,
    },
    vampire: {
      maxHp: 2,
      healPerDamage: 1,
    },
    vaingloriousWarrior: {
      maxHp: 2,
      startingXp: 2,
    },
    werewolf: {
      maxHp: 2,
      berserkThreshold: 2,
      invincibleRounds: 2,
      berserkJiXpGain: 2,
      berserkDamageMultiplier: 2,
    },
    iceSorcerer: {
      maxHp: 2,
      startingShards: 1,
      critThreshold: 5,
      maxCritSpend: 7,
      critDamageMultiplier: 2,
      critHeal: 1,
      daggerPower: 0.1,
      daggerHitShards: 2,
      daggerMissShards: 1,
      daggerStreakLimit: 2,
      discountedAttackId: "atk-3",
      discountedAttackCost: 1,
      incomingAttackPower: 1,
    },
    astrologer: {
      maxHp: 2,
      predictionCost: 2,
      drainCost: 2,
      drainAmount: 4,
      ghostHealPerDamage: 1,
    },
  },
  ai: {
    lowEnergyTarget: 2,
    highThreatAttack: 5,
  },
};

const ACTIONS = buildActions(BALANCE);

function buildActions(balance) {
  const chargeActions = Object.entries(balance.actions.charge).map(([id, action]) => ({
    id,
    kind: "charge",
    name: action.name,
    cost: action.cost,
    power: 0,
    defense: action.defense,
    xpGain: action.xpGain,
    text: `花费 ${action.cost}，XP +${action.xpGain}，防御 ${action.defense}`,
  }));

  const defenseActions = Object.entries(balance.actions.defenses).map(([id, action]) => ({
    id,
    kind: "defense",
    name: action.name,
    cost: action.cost,
    power: 0,
    defense: action.defense,
    xpGain: 0,
    text: `花费 ${action.cost}，防御 ${action.defense}`,
  }));

  const attackActions = balance.actions.attacks.map((action) => ({
    id: action.id,
    kind: "attack",
    name: action.name || `${action.cost}费攻`,
    cost: action.cost,
    power: action.power,
    defense: 0,
    xpGain: 0,
    text: `花费 ${action.cost}，攻击强度 ${action.power}`,
  }));

  return [...chargeActions, ...defenseActions, ...attackActions];
}

const ACTION_BY_ID = Object.fromEntries(ACTIONS.map((action) => [action.id, action]));

const HEROES = {
  classic: {
    id: "classic",
    name: "经典武者",
    maxHp: BALANCE.startingHp,
    startingXp: BALANCE.startingXp,
    description: "无额外机制，完全按童年规则结算。",
    passives: [],
    activeSkills: [],
    hooks: {},
  },
  battery: {
    id: "battery",
    name: "聚气师",
    maxHp: BALANCE.startingHp,
    startingXp: BALANCE.startingXp,
    description: `连续使用 Ji 达到 ${BALANCE.heroes.battery.jiStreakRequired} 回合时，本回合额外获得 ${BALANCE.heroes.battery.bonusXp} XP。`,
    passives: [{ name: "聚气", text: `连续 Ji 后额外 +${BALANCE.heroes.battery.bonusXp} XP` }],
    activeSkills: [],
    hooks: {
      afterRound(self, opponent, context) {
        if (context.selfAction.id !== "ji") {
          self.flags.jiStreak = 0;
          return;
        }
        self.flags.jiStreak = (self.flags.jiStreak || 0) + 1;
        if (self.flags.jiStreak >= BALANCE.heroes.battery.jiStreakRequired) {
          self.xp += BALANCE.heroes.battery.bonusXp;
          context.notes.push(`${self.label}连续 Ji，额外获得 ${BALANCE.heroes.battery.bonusXp} XP。`);
        }
      },
    },
  },
  guard: {
    id: "guard",
    name: "铁壁",
    maxHp: BALANCE.startingHp,
    startingXp: BALANCE.startingXp,
    description: `所有防御手势的防御值 +${BALANCE.heroes.guard.defenseBonus}。`,
    passives: [{ name: "铁壁", text: `防御值 +${BALANCE.heroes.guard.defenseBonus}` }],
    activeSkills: [],
    hooks: {
      modifyDefense(value, self, action) {
        return action.kind === "defense" ? value + BALANCE.heroes.guard.defenseBonus : value;
      },
    },
  },
  breaker: {
    id: "breaker",
    name: "破阵手",
    maxHp: BALANCE.startingHp,
    startingXp: BALANCE.startingXp,
    description: `使用 ${BALANCE.heroes.breaker.minAttackCost} 费及以上攻击时，攻击强度 +${BALANCE.heroes.breaker.attackBonus}。`,
    passives: [{ name: "破阵", text: `${BALANCE.heroes.breaker.minAttackCost} 费以上攻击 +${BALANCE.heroes.breaker.attackBonus}` }],
    activeSkills: [],
    hooks: {
      modifyAttack(value, self, action) {
        return action.kind === "attack" && action.cost >= BALANCE.heroes.breaker.minAttackCost
          ? value + BALANCE.heroes.breaker.attackBonus
          : value;
      },
    },
  },
  priest: {
    id: "priest",
    name: "牧师 Priest",
    maxHp: BALANCE.heroes.priest.maxHp,
    startingXp: BALANCE.startingXp,
    description: "辅助型英雄，血量更高，但只能使用 1 费、5 费、10 费攻击。",
    passives: [{ name: "辅助", text: "只能使用 1/5/10 费攻击" }],
    activeSkills: [
      {
        id: "priest-shield",
        kind: "skill",
        name: "A 小盾",
        cost: BALANCE.heroes.priest.shieldCost,
        power: 0,
        defense: BALANCE.defenseGrades.small,
        xpGain: 0,
        text: `花费 ${BALANCE.heroes.priest.shieldCost}，自带小防，防御升一大级，清负面`,
        effects: {
          clearNegative: true,
          upgradeDefense: true,
        },
      },
      {
        id: "priest-heal",
        kind: "skill",
        name: "B 奶",
        cost: BALANCE.heroes.priest.healCost,
        power: 0,
        defense: BALANCE.defenseGrades.invincible,
        xpGain: 0,
        text: `花费 ${BALANCE.heroes.priest.healCost}，本回合无敌，回复 ${BALANCE.heroes.priest.healAmount} HP，清负面`,
        effects: {
          clearNegative: true,
          heal: BALANCE.heroes.priest.healAmount,
          invincible: true,
        },
      },
    ],
    hooks: {
      canUseAction(action) {
        if (action.kind !== "attack") return true;
        return BALANCE.heroes.priest.allowedAttackCosts.includes(action.cost);
      },
    },
  },
  assassin: {
    id: "assassin",
    name: "刺客 Assassin",
    maxHp: BALANCE.heroes.assassin.maxHp,
    startingXp: BALANCE.startingXp,
    description: `高爆发英雄，HP=${BALANCE.heroes.assassin.maxHp}，每次 Ji 获得 ${BALANCE.heroes.assassin.jiXpGain} XP。`,
    passives: [{ name: "疾蓄", text: `Ji 获得 ${BALANCE.heroes.assassin.jiXpGain} XP` }],
    activeSkills: [],
    hooks: {
      modifyXpGain(value, self, action) {
        return action.id === "ji" ? BALANCE.heroes.assassin.jiXpGain : value;
      },
    },
  },
  vampire: {
    id: "vampire",
    name: "吸血鬼 Vampire",
    maxHp: BALANCE.heroes.vampire.maxHp,
    startingXp: BALANCE.startingXp,
    description: `续航型英雄，HP=${BALANCE.heroes.vampire.maxHp}，每造成 1 点伤害回复 ${BALANCE.heroes.vampire.healPerDamage} HP。`,
    passives: [{ name: "吸血", text: `造成伤害后回复 ${BALANCE.heroes.vampire.healPerDamage} HP` }],
    activeSkills: [],
    hooks: {
      onDealDamage(self, target, context) {
        const beforeHp = self.hp;
        self.hp = Math.min(self.maxHp, self.hp + BALANCE.heroes.vampire.healPerDamage * context.damage);
        const healed = self.hp - beforeHp;
        context.notes.push(`${self.label}触发吸血，回复 ${healed} HP，当前 ${formatHearts(self.hp)}。`);
      },
    },
  },
  vaingloriousWarrior: {
    id: "vaingloriousWarrior",
    name: "虚荣勇士 Vainglorious Warrior",
    maxHp: BALANCE.heroes.vaingloriousWarrior.maxHp,
    startingXp: BALANCE.heroes.vaingloriousWarrior.startingXp,
    description: `起手强势英雄，HP=${BALANCE.heroes.vaingloriousWarrior.maxHp}，开局自带 ${BALANCE.heroes.vaingloriousWarrior.startingXp} XP。`,
    passives: [{ name: "虚荣", text: `开局 +${BALANCE.heroes.vaingloriousWarrior.startingXp} XP` }],
    activeSkills: [],
    hooks: {},
  },
  werewolf: {
    id: "werewolf",
    name: "狼人 Werewolf",
    maxHp: BALANCE.heroes.werewolf.maxHp,
    startingXp: BALANCE.startingXp,
    description: `觉醒型英雄，首次 HP 低于 ${BALANCE.heroes.werewolf.berserkThreshold} 时进入狂暴，获得 ${BALANCE.heroes.werewolf.invincibleRounds} 回合无敌；狂暴后 Ji 获得 ${BALANCE.heroes.werewolf.berserkJiXpGain} XP，造成伤害翻倍。`,
    passives: [{ name: "觉醒技", text: `低血狂暴，${BALANCE.heroes.werewolf.invincibleRounds} 回合无敌，Ji +${BALANCE.heroes.werewolf.berserkJiXpGain}，伤害 x${BALANCE.heroes.werewolf.berserkDamageMultiplier}` }],
    activeSkills: [],
    hooks: {
      modifyDefense(value, self) {
        return hasStatus(self, "werewolf-invincible") ? BALANCE.defenseGrades.invincible : value;
      },
      modifyXpGain(value, self, action) {
        return self.flags.berserk && action.id === "ji" ? BALANCE.heroes.werewolf.berserkJiXpGain : value;
      },
      modifyDamage(value, self, target, context) {
        return self.flags.berserk && context.action.kind === "attack"
          ? value * BALANCE.heroes.werewolf.berserkDamageMultiplier
          : value;
      },
      afterTakeDamage(self, attacker, context) {
        if (self.flags.berserk || self.hp >= BALANCE.heroes.werewolf.berserkThreshold) return;
        self.flags.berserk = true;
        self.statuses.push({
          id: "werewolf-invincible",
          name: "狂暴无敌",
          text: `${BALANCE.heroes.werewolf.invincibleRounds} 回合`,
          turns: BALANCE.heroes.werewolf.invincibleRounds,
          fresh: true,
        });
        context.notes.push(`${self.label}首次低于 ${BALANCE.heroes.werewolf.berserkThreshold} HP，触发狂暴：获得 ${BALANCE.heroes.werewolf.invincibleRounds} 回合无敌，Ji 改为 +${BALANCE.heroes.werewolf.berserkJiXpGain} XP，伤害翻倍。`);
      },
    },
  },
  iceSorcerer: {
    id: "iceSorcerer",
    name: "冰法 Ice Sorcerer",
    maxHp: BALANCE.heroes.iceSorcerer.maxHp,
    startingXp: BALANCE.startingXp,
    description: `积攒寒冰碎片，满 ${BALANCE.heroes.iceSorcerer.critThreshold} 个后命中攻击会暴击并回复 ${BALANCE.heroes.iceSorcerer.critHeal} HP。3费攻只花 ${BALANCE.heroes.iceSorcerer.discountedAttackCost} XP，且别人用3费攻打冰法时只有1费攻效果。第一回合不能使用 Ji刀。`,
    passives: [
      { name: "寒冰碎片", text: `开局 ${BALANCE.heroes.iceSorcerer.startingShards} 个，满 ${BALANCE.heroes.iceSorcerer.critThreshold} 暴击回血` },
      { name: "冰甲", text: `3费攻花费 ${BALANCE.heroes.iceSorcerer.discountedAttackCost}，来袭3费攻强度变 ${BALANCE.heroes.iceSorcerer.incomingAttackPower}` },
    ],
    activeSkills: [
      {
        id: "ice-dagger",
        kind: "attack",
        name: "Ji刀",
        cost: 0,
        power: BALANCE.heroes.iceSorcerer.daggerPower,
        defense: 0,
        xpGain: 0,
        text: `花费 0，攻击强度 ${BALANCE.heroes.iceSorcerer.daggerPower}，命中 +${BALANCE.heroes.iceSorcerer.daggerHitShards}🧊，未命中 +${BALANCE.heroes.iceSorcerer.daggerMissShards}🧊`,
        effects: {
          trueDamage: true,
        },
      },
    ],
    hooks: {
      init(self) {
        self.flags.iceShards = BALANCE.heroes.iceSorcerer.startingShards;
        self.flags.iceDaggerStreak = 0;
      },
      canUseAction(action, self) {
        if (action.id !== "ice-dagger") return true;
        if (state.round <= 1) return false;
        return (self.flags.iceDaggerStreak || 0) < BALANCE.heroes.iceSorcerer.daggerStreakLimit;
      },
      modifyCost(value, self, action) {
        return action.id === BALANCE.heroes.iceSorcerer.discountedAttackId
          ? BALANCE.heroes.iceSorcerer.discountedAttackCost
          : value;
      },
      modifyIncomingAttack(value, self, attacker, action) {
        return action.id === BALANCE.heroes.iceSorcerer.discountedAttackId
          ? BALANCE.heroes.iceSorcerer.incomingAttackPower
          : value;
      },
      modifyDamage(value, self, target, context) {
        if (context.action.kind !== "attack" || (self.flags.iceShards || 0) < BALANCE.heroes.iceSorcerer.critThreshold) {
          return value;
        }
        const spent = Math.min(BALANCE.heroes.iceSorcerer.maxCritSpend, self.flags.iceShards);
        self.flags.iceShards -= spent;
        context.iceCrit = { spent };
        return value * BALANCE.heroes.iceSorcerer.critDamageMultiplier;
      },
      onDealDamage(self, target, context) {
        if (context.iceCrit) {
          const beforeHp = self.hp;
          self.hp = Math.min(self.maxHp, self.hp + BALANCE.heroes.iceSorcerer.critHeal);
          const healed = self.hp - beforeHp;
          context.notes.push(`${self.label}消耗 ${context.iceCrit.spent} 个寒冰碎片触发暴击，回复 ${healed} HP，剩余 ${self.flags.iceShards}🧊。`);
        }
        if (context.action.id === "ice-dagger") {
          addIceShards(self, BALANCE.heroes.iceSorcerer.daggerHitShards);
          context.notes.push(`${self.label}Ji刀命中，获得 ${BALANCE.heroes.iceSorcerer.daggerHitShards} 个寒冰碎片，当前 ${self.flags.iceShards}🧊。`);
        }
      },
      afterRound(self, opponent, context) {
        if (context.selfAction.id === "ice-dagger") {
          self.flags.iceDaggerStreak = (self.flags.iceDaggerStreak || 0) + 1;
          if (!context.hit) {
            addIceShards(self, BALANCE.heroes.iceSorcerer.daggerMissShards);
            context.notes.push(`${self.label}Ji刀未命中，获得 ${BALANCE.heroes.iceSorcerer.daggerMissShards} 个寒冰碎片，当前 ${self.flags.iceShards}🧊。`);
          }
        } else {
          self.flags.iceDaggerStreak = 0;
        }
      },
    },
  },
  astrologer: {
    id: "astrologer",
    name: "占星家 Astrologer",
    maxHp: BALANCE.heroes.astrologer.maxHp,
    startingXp: BALANCE.startingXp,
    description: `鬼刀可吸血。A 预判：${BALANCE.heroes.astrologer.predictionCost} 费，本回合带小防，下一回合从天而降一把鬼刀且也带小防。B 吸：${BALANCE.heroes.astrologer.drainCost} 费，若目标无防御等级，吸取最多 ${BALANCE.heroes.astrologer.drainAmount} XP。`,
    passives: [{ name: "星蚀", text: `鬼刀造成伤害后回复 ${BALANCE.heroes.astrologer.ghostHealPerDamage} HP` }],
    activeSkills: [
      {
        id: "astrologer-predict",
        kind: "skill",
        name: "A 预判",
        cost: BALANCE.heroes.astrologer.predictionCost,
        power: 0,
        defense: BALANCE.defenseGrades.small,
        xpGain: 0,
        text: `花费 ${BALANCE.heroes.astrologer.predictionCost}，本回合小防；下回合落下一把鬼刀并继续小防`,
        effects: {
          prediction: true,
        },
      },
      {
        id: "astrologer-drain",
        kind: "skill",
        name: "B 吸",
        cost: BALANCE.heroes.astrologer.drainCost,
        power: 0,
        defense: 0,
        xpGain: 0,
        text: `花费 ${BALANCE.heroes.astrologer.drainCost}，目标无防御时吸取 ${BALANCE.heroes.astrologer.drainAmount} XP`,
        effects: {
          drainXp: true,
        },
      },
    ],
    hooks: {
      modifyDefense(value, self) {
        return hasStatus(self, "astrologer-prediction") ? Math.max(value, BALANCE.defenseGrades.small) : value;
      },
      onDealDamage(self, target, context) {
        if (context.action.id !== "atk-5") return;
        const beforeHp = self.hp;
        self.hp = Math.min(self.maxHp, self.hp + BALANCE.heroes.astrologer.ghostHealPerDamage * context.damage);
        const healed = self.hp - beforeHp;
        context.notes.push(`${self.label}的鬼刀吸血，回复 ${healed} HP，当前 ${formatHearts(self.hp)}。`);
      },
      afterRound(self, opponent, context) {
        if (!context.selfAction.effects?.prediction) return;
        setStatus(self, {
          id: "astrologer-prediction",
          name: "预判",
          text: "下回合鬼刀，小防",
          turns: 1,
          fresh: true,
        });
        context.notes.push(`${self.label}完成预判：下回合鬼刀从天而降，并获得小防。`);
      },
    },
  },
};

const state = {
  round: 1,
  over: false,
  player: null,
  enemy: null,
  mode: "cpu",
  online: {
    roomCode: "",
    playerId: "",
    slot: "",
    initialized: false,
    pendingActionId: "",
    appliedRounds: new Set(),
    pollTimer: null,
  },
};

const ui = {
  roundNo: document.querySelector("#roundNo"),
  playerSideLabel: document.querySelector("#playerSideLabel"),
  enemySideLabel: document.querySelector("#enemySideLabel"),
  playerHero: document.querySelector("#playerHero"),
  enemyHero: document.querySelector("#enemyHero"),
  playerHeroName: document.querySelector("#playerHeroName"),
  enemyHeroName: document.querySelector("#enemyHeroName"),
  playerHeroText: document.querySelector("#playerHeroText"),
  enemyHeroText: document.querySelector("#enemyHeroText"),
  playerPassivePanel: document.querySelector("#playerPassivePanel"),
  enemyPassivePanel: document.querySelector("#enemyPassivePanel"),
  playerPassives: document.querySelector("#playerPassives"),
  enemyPassives: document.querySelector("#enemyPassives"),
  playerHp: document.querySelector("#playerHp"),
  enemyHp: document.querySelector("#enemyHp"),
  playerXp: document.querySelector("#playerXp"),
  enemyXp: document.querySelector("#enemyXp"),
  playerHpBar: document.querySelector("#playerHpBar"),
  enemyHpBar: document.querySelector("#enemyHpBar"),
  playerXpBar: document.querySelector("#playerXpBar"),
  enemyXpBar: document.querySelector("#enemyXpBar"),
  playerLast: document.querySelector("#playerLast"),
  enemyLast: document.querySelector("#enemyLast"),
  playerCard: document.querySelector("#playerCard"),
  enemyCard: document.querySelector("#enemyCard"),
  chargeActions: document.querySelector("#chargeActions"),
  defenseActions: document.querySelector("#defenseActions"),
  skillGroup: document.querySelector("#skillGroup"),
  skillActions: document.querySelector("#skillActions"),
  attackActions: document.querySelector("#attackActions"),
  battleLog: document.querySelector("#battleLog"),
  resetBtn: document.querySelector("#resetBtn"),
  clearLogBtn: document.querySelector("#clearLogBtn"),
  cpuModeBtn: document.querySelector("#cpuModeBtn"),
  createRoomBtn: document.querySelector("#createRoomBtn"),
  roomCodeInput: document.querySelector("#roomCodeInput"),
  joinRoomBtn: document.querySelector("#joinRoomBtn"),
  roomStatus: document.querySelector("#roomStatus"),
};

function makeFighter(label, heroId) {
  const hero = HEROES[heroId];
  const startingHp = hero.maxHp;
  const fighter = {
    label,
    heroId,
    hero,
    startingHp,
    hp: startingHp,
    maxHp: startingHp + BALANCE.maxHpBonus,
    xp: hero.startingXp,
    flags: {},
    statuses: [],
  };
  runHook(fighter, "init", fighter);
  return fighter;
}

function resetGame() {
  state.round = 1;
  state.over = false;
  state.mode = "cpu";
  stopPolling();
  state.online = {
    roomCode: "",
    playerId: "",
    slot: "",
    initialized: false,
    pendingActionId: "",
    appliedRounds: new Set(),
    pollTimer: null,
  };
  state.player = makeFighter("你", ui.playerHero.value);
  state.enemy = makeFighter("电脑", ui.enemyHero.value);
  ui.playerSideLabel.textContent = "你";
  ui.enemySideLabel.textContent = "电脑";
  ui.playerLast.textContent = "等待出手";
  ui.enemyLast.textContent = "等待出手";
  ui.battleLog.innerHTML = "";
  addLog(`开局：你 HP=${formatHearts(state.player.hp)}，XP=${state.player.xp}；电脑 HP=${formatHearts(state.enemy.hp)}，XP=${state.enemy.xp}。`);
  updateRoomStatus("当前：人机对战");
  render();
}

function populateHeroes() {
  for (const hero of Object.values(HEROES)) {
    const playerOption = new Option(hero.name, hero.id);
    const enemyOption = new Option(hero.name, hero.id);
    ui.playerHero.add(playerOption);
    ui.enemyHero.add(enemyOption);
  }
  ui.playerHero.value = "classic";
  ui.enemyHero.value = "guard";
}

function renderActions() {
  ui.chargeActions.innerHTML = "";
  ui.defenseActions.innerHTML = "";
  ui.attackActions.innerHTML = "";

  for (const action of ACTIONS) {
    const button = document.createElement("button");
    button.className = `action-card ${action.kind}`;
    button.type = "button";
    button.dataset.action = action.id;
    button.innerHTML = `<strong>${action.name}</strong><span>${action.text}</span>`;
    button.addEventListener("click", () => playRound(action.id));

    if (action.kind === "charge") ui.chargeActions.append(button);
    if (action.kind === "defense") ui.defenseActions.append(button);
    if (action.kind === "attack") ui.attackActions.append(button);
  }
}

function render() {
  const player = state.player;
  const enemy = state.enemy;

  ui.roundNo.textContent = state.round;
  ui.playerHeroName.textContent = player.hero.name;
  ui.enemyHeroName.textContent = enemy.hero.name;
  ui.playerHeroText.textContent = player.hero.description;
  ui.enemyHeroText.textContent = enemy.hero.description;
  renderSkillActions(player);
  renderPassivePanel(player, ui.playerPassivePanel, ui.playerPassives);
  renderPassivePanel(enemy, ui.enemyPassivePanel, ui.enemyPassives);

  ui.playerHp.textContent = formatHearts(player.hp);
  ui.enemyHp.textContent = formatHearts(enemy.hp);
  ui.playerXp.textContent = player.xp;
  ui.enemyXp.textContent = enemy.xp;

  ui.playerHpBar.style.width = `${percentage(player.hp, player.maxHp)}%`;
  ui.enemyHpBar.style.width = `${percentage(enemy.hp, enemy.maxHp)}%`;
  ui.playerXpBar.style.width = `${percentage(Math.min(player.xp, BALANCE.xpMeterMax), BALANCE.xpMeterMax)}%`;
  ui.enemyXpBar.style.width = `${percentage(Math.min(enemy.xp, BALANCE.xpMeterMax), BALANCE.xpMeterMax)}%`;
  ui.playerHero.disabled = state.mode === "online";
  ui.enemyHero.disabled = state.mode === "online";
  ui.cpuModeBtn.classList.toggle("active", state.mode === "cpu");
  ui.createRoomBtn.classList.toggle("active", state.mode === "online" && state.online.slot === "p1");
  ui.joinRoomBtn.classList.toggle("active", state.mode === "online" && state.online.slot === "p2");

  document.querySelectorAll("[data-action]").forEach((button) => {
    const action = getActionById(button.dataset.action, player);
    if (action) {
      button.innerHTML = `<strong>${action.name}</strong><span>${describeAction(action, player)}</span>`;
    }
    const waitingForOnlineOpponent = state.mode === "online" && !state.online.initialized;
    button.disabled = !action
      || state.over
      || waitingForOnlineOpponent
      || state.online.pendingActionId
      || !canUseAction(player, action);
  });
}

function renderSkillActions(fighter) {
  const skills = fighter.hero.activeSkills || [];
  ui.skillActions.innerHTML = "";
  ui.skillGroup.hidden = skills.length === 0;

  for (const skill of skills) {
    const button = document.createElement("button");
    button.className = "action-card skill";
    button.type = "button";
    button.dataset.action = skill.id;
    button.innerHTML = `<strong>${skill.name}</strong><span>${skill.text}</span>`;
    button.addEventListener("click", () => playRound(skill.id));
    ui.skillActions.append(button);
  }
}

function renderPassivePanel(fighter, panel, list) {
  const entries = getFighterStatusEntries(fighter);
  list.innerHTML = "";
  panel.hidden = entries.length === 0;

  for (const entry of entries) {
    const tag = document.createElement("span");
    tag.className = "status-tag";
    tag.textContent = entry.text ? `${entry.name}：${entry.text}` : entry.name;
    list.append(tag);
  }
}

function getFighterStatusEntries(fighter) {
  const entries = [...(fighter.hero.passives || [])];
  if (fighter.flags.jiStreak > 0) {
    entries.push({ name: "Ji 连击", text: `${fighter.flags.jiStreak}` });
  }
  if (fighter.flags.berserk) {
    entries.push({ name: "狂暴", text: `Ji +${BALANCE.heroes.werewolf.berserkJiXpGain}，伤害 x${BALANCE.heroes.werewolf.berserkDamageMultiplier}` });
  }
  if (fighter.flags.iceShards !== undefined) {
    entries.push({ name: "寒冰碎片", text: `${"🧊".repeat(Math.min(fighter.flags.iceShards, 10))} x${fighter.flags.iceShards}` });
  }
  if (fighter.flags.iceDaggerStreak > 0) {
    entries.push({ name: "Ji刀连出", text: `${fighter.flags.iceDaggerStreak}/${BALANCE.heroes.iceSorcerer.daggerStreakLimit}` });
  }
  for (const status of fighter.statuses) {
    entries.push({ name: status.name, text: status.text || "" });
  }
  return entries;
}

function percentage(value, max) {
  if (max <= 0) return 0;
  return Math.max(0, Math.min(100, (value / max) * 100));
}

function formatHearts(hp) {
  return hp > 0 ? "❤️".repeat(hp) : "0";
}

function playRound(playerActionId) {
  if (state.over) return;
  const playerAction = getActionById(playerActionId, state.player);
  if (!playerAction || !canUseAction(state.player, playerAction)) return;
  if (state.mode === "online") {
    submitOnlineAction(playerActionId);
    return;
  }

  const enemyAction = chooseEnemyAction();
  const report = resolveRound(playerAction, enemyAction);
  ui.playerLast.textContent = report.playerSummary;
  ui.enemyLast.textContent = report.enemySummary;

  for (const item of report.logs) {
    addLog(item.text, item.kind);
  }

  if (!state.over) {
    state.round += 1;
  }
  render();
}

function canAfford(fighter, action) {
  return fighter.xp >= getCost(fighter, action);
}

function canUseAction(fighter, action) {
  if (!canAfford(fighter, action)) return false;
  return Boolean(runHook(fighter, "canUseAction", action, fighter));
}

function getActionById(actionId, fighter) {
  return ACTION_BY_ID[actionId] || getHeroActions(fighter).find((action) => action.id === actionId);
}

function getHeroActions(fighter) {
  return fighter?.hero?.activeSkills || [];
}

function getAvailableActions(fighter) {
  return [...ACTIONS, ...getHeroActions(fighter)].filter((action) => canUseAction(fighter, action));
}

function chooseEnemyAction() {
  const affordable = getAvailableActions(state.enemy);
  const incomingThreat = assessIncomingThreat(state.player, state.enemy);
  const usefulDefenses = getUsefulDefenses(affordable, state.enemy, incomingThreat.maxAttack);
  const weighted = [];
  const enemyXp = state.enemy.xp;

  for (const action of affordable) {
    if (action.kind === "defense" && !usefulDefenses.includes(action)) {
      continue;
    }
    if (action.kind === "skill" && !isUsefulSkillAction(state.enemy, action, incomingThreat.maxAttack)) {
      continue;
    }

    let weight = 1;
    if (action.id === "ji") {
      weight = enemyXp < BALANCE.ai.lowEnergyTarget || incomingThreat.maxAttack === 0 ? 7 : 2;
    }
    if (action.kind === "defense") {
      weight = getDefense(state.enemy, action) >= incomingThreat.maxAttack ? 5 : 2;
    }
    if (action.kind === "attack") {
      const cost = getCost(state.enemy, action);
      if (cost <= enemyXp && cost <= Math.max(1, incomingThreat.maxAttack + 2)) weight = 3;
      if (cost >= BALANCE.ai.highThreatAttack && incomingThreat.maxAttack === 0) weight = 2;
      if (cost === enemyXp && enemyXp >= 3) weight += 2;
    }
    if (action.kind === "skill") {
      weight = getSkillWeight(state.enemy, action, incomingThreat.maxAttack);
    }
    for (let i = 0; i < weight; i += 1) weighted.push(action);
  }

  return weighted[Math.floor(Math.random() * weighted.length)] || ACTION_BY_ID.ji;
}

function isUsefulSkillAction(fighter, action, maxIncomingAttack) {
  const effects = action.effects || {};
  const canBlock = getDefense(fighter, action) >= maxIncomingAttack && maxIncomingAttack > 0;
  const canHeal = effects.heal && fighter.hp < fighter.maxHp;
  return Boolean(canBlock || canHeal);
}

function getSkillWeight(fighter, action, maxIncomingAttack) {
  const effects = action.effects || {};
  let weight = 1;
  if (getDefense(fighter, action) >= maxIncomingAttack && maxIncomingAttack > 0) weight += 3;
  if (effects.heal && fighter.hp < fighter.maxHp) weight += 4;
  if (effects.invincible && maxIncomingAttack >= BALANCE.ai.highThreatAttack) weight += 3;
  return weight;
}

function assessIncomingThreat(attacker, defender = null) {
  const affordableAttacks = getAvailableActions(attacker).filter((action) => action.kind === "attack");
  const maxAttack = affordableAttacks.reduce((best, action) => Math.max(best, getAttack(attacker, action, defender)), 0);
  return {
    canAttack: maxAttack > 0,
    maxAttack,
  };
}

function getUsefulDefenses(affordableActions, defender, maxIncomingAttack) {
  if (maxIncomingAttack <= 0) return [];

  const defenses = affordableActions
    .filter((action) => action.kind === "defense")
    .sort((a, b) => getCost(defender, a) - getCost(defender, b) || getDefense(defender, a) - getDefense(defender, b));
  const fullBlocks = defenses.filter((action) => getDefense(defender, action) >= maxIncomingAttack);

  if (fullBlocks.length) {
    const cheapestFullBlock = fullBlocks[0];
    return defenses.filter((action) => getCost(defender, action) === getCost(defender, cheapestFullBlock) && getDefense(defender, action) >= maxIncomingAttack);
  }

  const bestPartialDefense = defenses.reduce((best, action) => Math.max(best, getDefense(defender, action)), 0);
  return defenses.filter((action) => getDefense(defender, action) === bestPartialDefense);
}

function resolveRound(playerAction, enemyAction) {
  const player = state.player;
  const enemy = state.enemy;
  const logs = [];
  const contextForPlayer = { selfAction: playerAction, opponentAction: enemyAction, notes: [], hit: false, damageDealt: 0 };
  const contextForEnemy = { selfAction: enemyAction, opponentAction: playerAction, notes: [], hit: false, damageDealt: 0 };

  player.xp -= getCost(player, playerAction);
  enemy.xp -= getCost(enemy, enemyAction);

  const playerXpGain = getXpGain(player, playerAction);
  const enemyXpGain = getXpGain(enemy, enemyAction);

  player.xp += playerXpGain;
  enemy.xp += enemyXpGain;

  applyPreDamageEffects(player, playerAction, logs);
  applyPreDamageEffects(enemy, enemyAction, logs);

  const playerDefense = getDefense(player, playerAction);
  const enemyDefense = getDefense(enemy, enemyAction);
  const playerAttack = getAttack(player, playerAction, enemy);
  const enemyAttack = getAttack(enemy, enemyAction, player);

  const damageNotes = [];

  applyPostDefenseSkillEffects(player, playerAction, enemy, enemyDefense, logs);
  applyPostDefenseSkillEffects(enemy, enemyAction, player, playerDefense, logs);
  applyScheduledGhostAttack(player, enemy, enemyDefense, logs, damageNotes, ui.enemyCard, contextForPlayer);
  applyScheduledGhostAttack(enemy, player, playerDefense, logs, damageNotes, ui.playerCard, contextForEnemy);

  if (playerAction.kind === "attack" && enemyAction.kind === "attack") {
    if (playerAttack > enemyAttack) {
      contextForPlayer.hit = true;
      contextForPlayer.damageDealt = dealDamage(player, enemy, playerAction, `${player.label}用 ${playerAction.name} 对攻压过${enemy.label} ${enemyAction.name}，${enemy.label} HP -1。`, logs, damageNotes, ui.enemyCard);
    } else if (enemyAttack > playerAttack) {
      contextForEnemy.hit = true;
      contextForEnemy.damageDealt = dealDamage(enemy, player, enemyAction, `${enemy.label}用 ${enemyAction.name} 对攻压过${player.label}的 ${playerAction.name}，${player.label} HP -1。`, logs, damageNotes, ui.playerCard);
    } else {
      logs.push({ text: `双方对攻强度同为 ${playerAttack}，互相抵消。` });
    }
  } else {
    const playerHits = playerAction.kind === "attack" && playerAttack > enemyDefense;
    const enemyHits = enemyAction.kind === "attack" && enemyAttack > playerDefense;

    if (playerHits) {
      contextForPlayer.hit = true;
      contextForPlayer.damageDealt = dealDamage(player, enemy, playerAction, `${player.label}用 ${playerAction.name} 击穿${enemy.label}防御 ${formatDefense(enemyDefense)}，${enemy.label} HP -1。`, logs, damageNotes, ui.enemyCard);
    } else if (playerAction.kind === "attack") {
      logs.push({ text: `${player.label}用 ${playerAction.name}，强度 ${playerAttack} 未超过${enemy.label}防御 ${formatDefense(enemyDefense)}。` });
    }

    if (enemyHits) {
      contextForEnemy.hit = true;
      contextForEnemy.damageDealt = dealDamage(enemy, player, enemyAction, `${enemy.label}用 ${enemyAction.name} 击穿${player.label}防御 ${formatDefense(playerDefense)}，${player.label} HP -1。`, logs, damageNotes, ui.playerCard);
    } else if (enemyAction.kind === "attack") {
      logs.push({ text: `${enemy.label}用 ${enemyAction.name}，强度 ${enemyAttack} 未超过${player.label}防御 ${formatDefense(playerDefense)}。` });
    }
  }

  for (const note of damageNotes) {
    logs.push({ text: note });
  }

  runHook(player, "afterRound", player, enemy, contextForPlayer);
  runHook(enemy, "afterRound", enemy, player, contextForEnemy);
  tickStatuses(player, contextForPlayer.notes);
  tickStatuses(enemy, contextForEnemy.notes);

  for (const note of [...contextForPlayer.notes, ...contextForEnemy.notes]) {
    logs.push({ text: note });
  }

  const playerSummary = summarizeAction(player, playerAction, playerAttack, playerDefense, playerXpGain);
  const enemySummary = summarizeAction(enemy, enemyAction, enemyAttack, enemyDefense, enemyXpGain);

  if (player.hp <= 0 && enemy.hp <= 0) {
    state.over = true;
    logs.push({ kind: "win", text: "同归于尽，平局。" });
  } else if (enemy.hp <= 0) {
    state.over = true;
    logs.push({ kind: "win", text: "你赢了。" });
  } else if (player.hp <= 0) {
    state.over = true;
    logs.push({ kind: "win", text: "电脑赢了。" });
  } else if (!logs.length) {
    logs.push({ text: "双方都没有造成伤害。" });
  }

  return { logs, playerSummary, enemySummary };
}

function dealDamage(attacker, defender, action, text, logs, damageNotes, defenderCard) {
  const context = { action, damage: 1, notes: damageNotes };
  const damage = getDamage(attacker, defender, action, context);
  context.damage = damage;
  defender.hp -= damage;
  logs.push({ kind: "impact", text: text.replace("HP -1", `HP -${damage}`) });
  runHook(attacker, "onDealDamage", attacker, defender, context);
  runHook(defender, "afterTakeDamage", defender, attacker, context);
  flash(defenderCard);
  return damage;
}

function summarizeAction(fighter, action, attack, defense, xpGain = action.xpGain) {
  if (action.kind === "charge") return `${action.name}：XP +${xpGain}，防御 ${formatDefense(defense)}`;
  if (action.kind === "defense") return `${action.name}：花费 ${getCost(fighter, action)}，防御 ${formatDefense(defense)}`;
  if (action.kind === "skill") return `${action.name}：花费 ${getCost(fighter, action)}，防御 ${formatDefense(defense)}`;
  return `${action.name}：花费 ${getCost(fighter, action)}，强度 ${attack}`;
}

function describeAction(action, fighter) {
  if (action.kind === "charge") return `花费 ${getCost(fighter, action)}，XP +${getXpGain(fighter, action)}，防御 ${formatDefense(getDefense(fighter, action))}`;
  if (action.kind === "defense") return `花费 ${getCost(fighter, action)}，防御 ${formatDefense(getDefense(fighter, action))}`;
  if (action.kind === "skill") return action.text;
  return `花费 ${getCost(fighter, action)}，攻击强度 ${getAttack(fighter, action)}`;
}

function getDefense(fighter, action) {
  let base = action.defense || 0;
  if (action.effects?.upgradeDefense) {
    base = upgradeDefenseValue(base);
  }
  if (action.effects?.invincible) {
    base = BALANCE.defenseGrades.invincible;
  }
  return runHook(fighter, "modifyDefense", base, fighter, action);
}

function getAttack(fighter, action, defender = null) {
  let value = action.power || 0;
  value = runHook(fighter, "modifyAttack", value, fighter, action, defender);
  if (defender) {
    value = runHook(defender, "modifyIncomingAttack", value, defender, fighter, action);
  }
  return value;
}

function getCost(fighter, action) {
  return runHook(fighter, "modifyCost", action.cost || 0, fighter, action);
}

function getXpGain(fighter, action) {
  const base = action.xpGain || 0;
  return runHook(fighter, "modifyXpGain", base, fighter, action);
}

function getDamage(attacker, defender, action, context) {
  return runHook(attacker, "modifyDamage", context.damage, attacker, defender, context);
}

function hasStatus(fighter, statusId) {
  return fighter.statuses.some((status) => status.id === statusId);
}

function addIceShards(fighter, amount) {
  fighter.flags.iceShards = (fighter.flags.iceShards || 0) + amount;
}

function setStatus(fighter, status) {
  fighter.statuses = fighter.statuses.filter((entry) => entry.id !== status.id);
  fighter.statuses.push(status);
}

function applyPostDefenseSkillEffects(fighter, action, target, targetDefense, logs) {
  if (!action.effects?.drainXp) return;
  const canDrain = BALANCE.heroes.iceSorcerer.daggerPower > targetDefense;
  if (!canDrain) {
    logs.push({ text: `${fighter.label}使用 ${action.name}，但${target.label}有防御等级，吸取失败。` });
    return;
  }

  const drained = Math.min(BALANCE.heroes.astrologer.drainAmount, target.xp);
  target.xp -= drained;
  fighter.xp += drained;
  logs.push({ text: `${fighter.label}使用 ${action.name}，从${target.label}身上吸取 ${drained} XP。` });
}

function applyScheduledGhostAttack(source, target, targetDefense, logs, damageNotes, targetCard, context) {
  if (!hasStatus(source, "astrologer-prediction")) return;
  const ghostAction = ACTION_BY_ID["atk-5"];
  const ghostAttack = getAttack(source, ghostAction, target);
  if (ghostAttack > targetDefense) {
    context.hit = true;
    context.damageDealt += dealDamage(source, target, ghostAction, `${source.label}预判的鬼刀从天而降，击穿${target.label}防御 ${formatDefense(targetDefense)}，${target.label} HP -1。`, logs, damageNotes, targetCard);
  } else {
    logs.push({ text: `${source.label}预判的鬼刀从天而降，强度 ${ghostAttack} 未超过${target.label}防御 ${formatDefense(targetDefense)}。` });
  }
}

function tickStatuses(fighter, notes) {
  const remaining = [];
  for (const status of fighter.statuses) {
    if (!status.turns) {
      remaining.push(status);
      continue;
    }
    if (status.fresh) {
      status.fresh = false;
      remaining.push(status);
      continue;
    }
    status.turns -= 1;
    if (status.turns > 0) {
      status.text = `${status.turns} 回合`;
      remaining.push(status);
    } else {
      notes.push(`${fighter.label}的${status.name}结束。`);
    }
  }
  fighter.statuses = remaining;
}

function applyPreDamageEffects(fighter, action, logs) {
  if (action.kind !== "skill") return;
  const effects = action.effects || {};
  const details = [];

  if (effects.clearNegative) {
    const before = fighter.statuses.length;
    fighter.statuses = fighter.statuses.filter((status) => status.type !== "negative");
    const removed = before - fighter.statuses.length;
    if (removed > 0) details.push(`移除 ${removed} 个负面效果`);
  }

  if (effects.heal) {
    const beforeHp = fighter.hp;
    fighter.hp = Math.min(fighter.maxHp, fighter.hp + effects.heal);
    details.push(`回复 ${fighter.hp - beforeHp} HP`);
  }

  if (effects.upgradeDefense) details.push("本回合防御升一大级");
  if (effects.invincible) details.push("本回合无敌");
  logs.push({ text: details.length ? `${fighter.label}使用 ${action.name}，${details.join("，")}。` : `${fighter.label}使用 ${action.name}。` });
}

function upgradeDefenseValue(value) {
  const grades = BALANCE.defenseGrades;
  if (value >= grades.invincible) return grades.invincible;
  if (value >= grades.super) return grades.super;
  if (value >= grades.mid) return grades.super;
  if (value >= grades.small) return grades.mid;
  return grades.small;
}

function formatDefense(value) {
  if (value >= BALANCE.defenseGrades.invincible) return "无敌";
  if (value >= BALANCE.defenseGrades.super) return "超防";
  return String(value);
}

function runHook(fighter, hookName, ...args) {
  const hook = fighter.hero.hooks[hookName];
  if (!hook) return args[0];
  const result = hook(...args);
  return result === undefined ? args[0] : result;
}

function addLog(text, kind = "") {
  const item = document.createElement("li");
  if (kind) item.className = kind;
  item.textContent = `R${state.round}｜${text}`;
  ui.battleLog.prepend(item);
}

function flash(element) {
  element.classList.remove("shake");
  window.requestAnimationFrame(() => {
    element.classList.add("shake");
  });
}

async function createOnlineRoom() {
  const heroId = ui.playerHero.value;
  try {
    const data = await apiRequest("/api/rooms", { heroId });
    enterOnlineRoom(data);
    state.player = makeFighter("你", heroId);
    state.enemy = makeFighter("对手", "classic");
    state.round = 1;
    state.over = false;
    state.online.initialized = false;
    ui.playerLast.textContent = "等待出手";
    ui.enemyLast.textContent = "等待对手加入";
    ui.battleLog.innerHTML = "";
    ui.playerSideLabel.textContent = "你";
    ui.enemySideLabel.textContent = "对手";
    addLog(`房间 ${data.code} 已创建，等待对手加入。`);
    updateRoomStatus(`房间 ${data.code}：等待对手加入。把房间代码发给对方。`);
    render();
    startPolling();
  } catch (error) {
    updateRoomStatus(`创建失败：${error.message}`);
  }
}

async function joinOnlineRoom() {
  const code = normalizeRoomCode(ui.roomCodeInput.value);
  if (!code) {
    updateRoomStatus("请输入房间代码。");
    return;
  }

  try {
    const data = await apiRequest(`/api/rooms/${code}/join`, { heroId: ui.playerHero.value });
    enterOnlineRoom(data);
    updateRoomStatus(`已加入房间 ${data.code}，等待同步。`);
    startPolling();
    await pollRoom();
  } catch (error) {
    updateRoomStatus(`加入失败：${error.message}`);
  }
}

function enterOnlineRoom(data) {
  stopPolling();
  state.mode = "online";
  state.online.roomCode = data.code;
  state.online.playerId = data.playerId;
  state.online.slot = data.slot;
  state.online.pendingActionId = "";
  state.online.appliedRounds = new Set();
  ui.roomCodeInput.value = data.code;
}

async function submitOnlineAction(actionId) {
  if (!state.online.roomCode || state.online.pendingActionId) return;
  try {
    state.online.pendingActionId = actionId;
    render();
    await apiRequest(`/api/rooms/${state.online.roomCode}/action`, {
      playerId: state.online.playerId,
      round: state.round,
      actionId,
    });
    updateRoomStatus(`房间 ${state.online.roomCode}：已提交，等待对手。`);
    await pollRoom();
  } catch (error) {
    state.online.pendingActionId = "";
    updateRoomStatus(`提交失败：${error.message}`);
    render();
  }
}

function startPolling() {
  stopPolling();
  state.online.pollTimer = window.setInterval(pollRoom, 1200);
}

function stopPolling() {
  if (state.online?.pollTimer) {
    window.clearInterval(state.online.pollTimer);
    state.online.pollTimer = null;
  }
}

async function pollRoom() {
  if (state.mode !== "online" || !state.online.roomCode || !state.online.playerId) return;
  try {
    const room = await apiGet(`/api/rooms/${state.online.roomCode}?playerId=${state.online.playerId}`);
    syncOnlineRoom(room);
  } catch (error) {
    updateRoomStatus(`同步失败：${error.message}`);
  }
}

function syncOnlineRoom(room) {
  if (!room.players.p2) {
    updateRoomStatus(`房间 ${room.code}：等待对手加入。`);
    return;
  }

  if (!state.online.initialized) {
    startOnlineMatch(room);
  }

  const selfSubmitted = room.submitted[state.online.slot];
  const opponentSlot = getOpponentSlot(state.online.slot);
  const opponentSubmitted = room.submitted[opponentSlot];
  if (state.online.pendingActionId && selfSubmitted && !opponentSubmitted) {
    updateRoomStatus(`房间 ${room.code}：你已出招，等待对手。`);
  } else if (!state.online.pendingActionId && opponentSubmitted) {
    updateRoomStatus(`房间 ${room.code}：对手已出招，轮到你。`);
  } else {
    updateRoomStatus(`房间 ${room.code}：请选择本回合动作。`);
  }

  if (room.result && !state.online.appliedRounds.has(room.result.round)) {
    applyOnlineResult(room.result);
  }
}

function startOnlineMatch(room) {
  const selfSlot = state.online.slot;
  const opponentSlot = getOpponentSlot(selfSlot);
  const selfHeroId = room.players[selfSlot].heroId;
  const opponentHeroId = room.players[opponentSlot].heroId;
  state.player = makeFighter("你", selfHeroId);
  state.enemy = makeFighter("对手", opponentHeroId);
  state.round = room.round;
  state.over = false;
  state.online.initialized = true;
  state.online.pendingActionId = "";
  ui.playerHero.value = selfHeroId;
  ui.enemyHero.value = opponentHeroId;
  ui.playerSideLabel.textContent = "你";
  ui.enemySideLabel.textContent = "对手";
  ui.playerLast.textContent = "等待出手";
  ui.enemyLast.textContent = "等待出手";
  ui.battleLog.innerHTML = "";
  addLog(`1v1 开局：你 HP=${formatHearts(state.player.hp)}，XP=${state.player.xp}；对手 HP=${formatHearts(state.enemy.hp)}，XP=${state.enemy.xp}。`);
  render();
}

async function applyOnlineResult(result) {
  const selfSlot = state.online.slot;
  const opponentSlot = getOpponentSlot(selfSlot);
  const playerActionId = result.actions[selfSlot];
  const enemyActionId = result.actions[opponentSlot];
  const playerAction = getActionById(playerActionId, state.player);
  const enemyAction = getActionById(enemyActionId, state.enemy);
  if (!playerAction || !enemyAction) {
    updateRoomStatus("结算失败：动作不存在。");
    return;
  }

  const report = resolveRound(playerAction, enemyAction);
  ui.playerLast.textContent = report.playerSummary;
  ui.enemyLast.textContent = report.enemySummary;
  for (const item of report.logs) {
    addLog(item.text, item.kind);
  }
  state.online.appliedRounds.add(result.round);
  state.online.pendingActionId = "";
  if (!state.over) {
    state.round = result.round + 1;
  }
  render();

  try {
    await apiRequest(`/api/rooms/${state.online.roomCode}/advance`, {
      playerId: state.online.playerId,
      round: result.round,
    });
  } catch (error) {
    updateRoomStatus(`确认结算失败：${error.message}`);
  }
}

function getOpponentSlot(slot) {
  return slot === "p1" ? "p2" : "p1";
}

function normalizeRoomCode(value) {
  return value.trim().toUpperCase();
}

function updateRoomStatus(text) {
  ui.roomStatus.textContent = text;
}

async function apiGet(path) {
  const response = await fetch(path);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  return data;
}

async function apiRequest(path, payload) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  return data;
}

ui.resetBtn.addEventListener("click", resetGame);
ui.cpuModeBtn.addEventListener("click", resetGame);
ui.createRoomBtn.addEventListener("click", createOnlineRoom);
ui.joinRoomBtn.addEventListener("click", joinOnlineRoom);
ui.clearLogBtn.addEventListener("click", () => {
  ui.battleLog.innerHTML = "";
});
ui.playerHero.addEventListener("change", () => {
  if (state.mode === "cpu") resetGame();
});
ui.enemyHero.addEventListener("change", () => {
  if (state.mode === "cpu") resetGame();
});

populateHeroes();
renderActions();
resetGame();
