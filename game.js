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
      maxHp: 2,
      jiStreakRequired: 2,
      bonusXp: 1,
      chaseXp: 1,
    },
    guard: {
      maxHp: 4,
      defenseBonus: 1,
    },
    breaker: {
      maxHp: 4,
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
      drainPointDefense: 4,
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
    maxHp: BALANCE.heroes.battery.maxHp,
    startingXp: BALANCE.startingXp,
    description: `连续使用 Ji 达到 ${BALANCE.heroes.battery.jiStreakRequired} 回合时，本回合额外获得 ${BALANCE.heroes.battery.bonusXp} XP。追索：本回合造成伤害后，结束阶段选择目标 -${BALANCE.heroes.battery.chaseXp} XP，或自己 +${BALANCE.heroes.battery.chaseXp} XP。`,
    passives: [
      { name: "聚气", text: `连续 Ji 后额外 +${BALANCE.heroes.battery.bonusXp} XP` },
      { name: "追索", text: `造成伤害后结束阶段二选一` },
    ],
    activeSkills: [],
    hooks: {
      onDealDamage(self, target, context) {
        if (context.damage <= 0) return;
        self.flags.chaseTargets ||= [];
        if (!self.flags.chaseTargets.includes(target)) self.flags.chaseTargets.push(target);
      },
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
    maxHp: BALANCE.heroes.guard.maxHp,
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
    maxHp: BALANCE.heroes.breaker.maxHp,
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
    description: `鬼刀可吸血。 预判：${BALANCE.heroes.astrologer.predictionCost} 费，本回合带小防，下一回合从天而降一把鬼刀且也带小防。汲取：${BALANCE.heroes.astrologer.drainCost} 费，对目标自带小防；若目标对占星家无防御等级，目标最多 -${BALANCE.heroes.astrologer.drainAmount} XP 至 0，占星家 +${BALANCE.heroes.astrologer.drainAmount} XP。`,
    passives: [{ name: "星蚀", text: `鬼刀造成伤害后回复 ${BALANCE.heroes.astrologer.ghostHealPerDamage} HP` }],
    activeSkills: [
      {
        id: "astrologer-predict",
        kind: "skill",
        name: "预判",
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
        name: "汲取",
        cost: BALANCE.heroes.astrologer.drainCost,
        power: 0,
        defense: 0,
        xpGain: 0,
        text: `花费 ${BALANCE.heroes.astrologer.drainCost}，对目标小防；目标无防御时吸取 ${BALANCE.heroes.astrologer.drainAmount} XP`,
        effects: {
          drainXp: true,
          pointDefense: BALANCE.heroes.astrologer.drainPointDefense,
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

const HERO_AVATARS = {
  assassin: "./pic/assassin.png",
  astrologer: "./pic/astrologer.png",
  iceSorcerer: "./pic/icesorcerer.png",
  priest: "./pic/priest.png",
  vaingloriousWarrior: "./pic/vangloriouswarrior.png",
};

const state = {
  round: 1,
  over: false,
  player: null,
  enemy: null,
  mode: "cpu",
  pendingEndChoice: null,
  melee: {
    fighters: [],
  },
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
  manualBtn: document.querySelector("#manualBtn"),
  fighterGrid: document.querySelector(".fighter-grid"),
  standardActionGroups: document.querySelectorAll(".control-panel > .action-group"),
  playerSideLabel: document.querySelector("#playerSideLabel"),
  enemySideLabel: document.querySelector("#enemySideLabel"),
  playerHero: document.querySelector("#playerHero"),
  enemyHero: document.querySelector("#enemyHero"),
  playerHeroName: document.querySelector("#playerHeroName"),
  enemyHeroName: document.querySelector("#enemyHeroName"),
  playerAvatar: document.querySelector("#playerAvatar"),
  enemyAvatar: document.querySelector("#enemyAvatar"),
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
  endPhaseGroup: document.querySelector("#endPhaseGroup"),
  endPhaseNote: document.querySelector("#endPhaseNote"),
  chaseDrainBtn: document.querySelector("#chaseDrainBtn"),
  chaseGainBtn: document.querySelector("#chaseGainBtn"),
  battleLog: document.querySelector("#battleLog"),
  resetBtn: document.querySelector("#resetBtn"),
  clearLogBtn: document.querySelector("#clearLogBtn"),
  cpuModeBtn: document.querySelector("#cpuModeBtn"),
  createRoomBtn: document.querySelector("#createRoomBtn"),
  roomCodeInput: document.querySelector("#roomCodeInput"),
  joinRoomBtn: document.querySelector("#joinRoomBtn"),
  roomStatus: document.querySelector("#roomStatus"),
  meleeModeBtn: document.querySelector("#meleeModeBtn"),
  meleePanel: document.querySelector("#meleePanel"),
  meleeGrid: document.querySelector("#meleeGrid"),
  meleeStatus: document.querySelector("#meleeStatus"),
  meleePrimaryActions: document.querySelector("#meleePrimaryActions"),
  meleeAttackAllocator: document.querySelector("#meleeAttackAllocator"),
  meleeTargetALabel: document.querySelector("#meleeTargetALabel"),
  meleeTargetBLabel: document.querySelector("#meleeTargetBLabel"),
  meleeAttackA: document.querySelector("#meleeAttackA"),
  meleeAttackB: document.querySelector("#meleeAttackB"),
  meleeJiBtn: document.querySelector("#meleeJiBtn"),
  meleeDefBtn: document.querySelector("#meleeDefBtn"),
  meleeAttackModeBtn: document.querySelector("#meleeAttackModeBtn"),
  meleeBackBtn: document.querySelector("#meleeBackBtn"),
  meleeSubmitBtn: document.querySelector("#meleeSubmitBtn"),
  heroDetail: document.querySelector("#heroDetail"),
  heroDetailClose: document.querySelector("#heroDetailClose"),
  heroDetailAvatar: document.querySelector("#heroDetailAvatar"),
  heroDetailTitle: document.querySelector("#heroDetailTitle"),
  heroDetailMeta: document.querySelector("#heroDetailMeta"),
  heroDetailBody: document.querySelector("#heroDetailBody"),
  manualDetail: document.querySelector("#manualDetail"),
  manualClose: document.querySelector("#manualClose"),
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
  state.pendingEndChoice = null;
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
  state.melee.fighters = [];
  ui.playerSideLabel.textContent = "你";
  ui.enemySideLabel.textContent = "电脑";
  ui.playerLast.textContent = "等待出手";
  ui.enemyLast.textContent = "等待出手";
  ui.battleLog.innerHTML = "";
  addLog(`开局：你 HP=${formatHearts(state.player.hp)}，XP=${state.player.xp}；电脑 HP=${formatHearts(state.enemy.hp)}，XP=${state.enemy.xp}。`);
  updateRoomStatus("当前：人机对战");
  ui.meleePanel.hidden = true;
  ui.fighterGrid.hidden = false;
  render();
}

function populateHeroes() {
  for (const hero of Object.values(HEROES)) {
    const playerOption = new Option(getHeroDisplayName(hero), hero.id);
    const enemyOption = new Option(getHeroDisplayName(hero), hero.id);
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
  ui.playerHeroName.textContent = getHeroDisplayName(player.hero);
  ui.enemyHeroName.textContent = getHeroDisplayName(enemy.hero);
  renderHeroAvatar(ui.playerAvatar, player.hero);
  renderHeroAvatar(ui.enemyAvatar, enemy.hero);
  renderHeroSummary(ui.playerHeroText, player.hero);
  renderHeroSummary(ui.enemyHeroText, enemy.hero);
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
  ui.meleeModeBtn.classList.toggle("active", state.mode === "melee");
  ui.createRoomBtn.classList.toggle("active", state.mode === "online" && state.online.slot === "p1");
  ui.joinRoomBtn.classList.toggle("active", state.mode === "online" && state.online.slot === "p2");
  ui.fighterGrid.hidden = state.mode === "melee";
  ui.meleePanel.hidden = state.mode !== "melee";
  ui.standardActionGroups.forEach((group) => {
    if (group.id === "endPhaseGroup") {
      group.hidden = state.mode === "melee" || !state.pendingEndChoice;
      return;
    }
    group.hidden = state.mode === "melee" || (group.id === "skillGroup" && (player.hero.activeSkills || []).length === 0);
  });
  renderEndPhaseChoice();

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
      || state.pendingEndChoice
      || !canUseAction(player, action);
  });
  if (state.mode === "melee") {
    renderMelee();
  }
}

function renderEndPhaseChoice() {
  const choice = state.pendingEndChoice;
  if (!choice) return;
  ui.endPhaseNote.textContent = `${choice.actor.label}触发追索：本回合对${choice.target.label}造成了伤害。`;
  ui.chaseDrainBtn.innerHTML = `<strong>追索</strong><span>${choice.target.label} -${BALANCE.heroes.battery.chaseXp} XP</span>`;
  ui.chaseGainBtn.innerHTML = `<strong>追索</strong><span>${choice.actor.label} +${BALANCE.heroes.battery.chaseXp} XP</span>`;
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
    tag.textContent = formatStatusTag(entry);
    tag.title = entry.text ? `${entry.name}：${entry.text}` : entry.name;
    list.append(tag);
  }
}

function getHeroDisplayName(hero) {
  return hero.name.replace(/\s+[A-Za-z].*$/, "");
}

function renderHeroSummary(container, hero) {
  container.innerHTML = "";
  for (const entry of getHeroRuleEntries(hero)) {
    const line = document.createElement("span");
    line.className = "rule-line";
    const name = document.createElement("strong");
    name.textContent = `${entry.name}：`;
    const text = document.createElement("span");
    text.textContent = entry.text;
    line.append(name, text);
    container.append(line);
  }
}

function getHeroRuleEntries(hero) {
  const entries = [];
  if (hero.description) entries.push({ name: "概述", text: hero.description });
  for (const passive of hero.passives || []) {
    entries.push({ name: passive.name, text: passive.text || "被动效果" });
  }
  for (const skill of hero.activeSkills || []) {
    entries.push({ name: skill.name, text: skill.text || "主动技能" });
  }
  return entries;
}

function renderHeroAvatar(container, hero) {
  container.innerHTML = "";
  container.title = `查看${getHeroDisplayName(hero)}技能`;
  const avatar = HERO_AVATARS[hero.id];
  if (!avatar) {
    const fallback = document.createElement("span");
    fallback.textContent = "❓";
    container.append(fallback);
    return;
  }

  const image = document.createElement("img");
  image.src = avatar;
  image.alt = getHeroDisplayName(hero);
  image.onerror = () => {
    container.innerHTML = "";
    const fallback = document.createElement("span");
    fallback.textContent = "❓";
    container.append(fallback);
  };
  container.append(image);
}

function formatStatusTag(entry) {
  if (!entry.text) return entry.name;
  if (entry.name === "寒冰碎片" && entry.text.includes("🧊")) return entry.text.replace(/\s+/g, "");
  if (entry.name === "寒冰碎片") return "碎片机制";
  if (entry.name === "Ji 连击" || entry.name === "Ji刀连出") return `${entry.name} ${entry.text}`;
  if (entry.text.includes("回合")) return `${entry.name} ${entry.text}`;
  return entry.name;
}

function openHeroDetail(fighter) {
  const hero = fighter.hero;
  ui.heroDetailTitle.textContent = getHeroDisplayName(hero);
  ui.heroDetailMeta.textContent = `${fighter.startingHp}血，开局 ${hero.startingXp} XP`;
  ui.heroDetailBody.innerHTML = "";
  renderHeroAvatar(ui.heroDetailAvatar, hero);

  const summary = document.createElement("div");
  summary.className = "hero-summary";
  renderHeroSummary(summary, hero);
  ui.heroDetailBody.append(summary);

  appendDetailSection("被动", hero.passives || [], "无被动");
  appendDetailSection("主动技能", hero.activeSkills || [], "无主动技能");

  const liveEntries = getFighterStatusEntries(fighter).filter((entry) => !(hero.passives || []).includes(entry));
  if (liveEntries.length) appendDetailSection("当前状态", liveEntries, "");
  ui.heroDetail.hidden = false;
}

function closeHeroDetail() {
  ui.heroDetail.hidden = true;
}

function openManualDetail() {
  ui.manualDetail.hidden = false;
}

function closeManualDetail() {
  ui.manualDetail.hidden = true;
}

function appendDetailSection(title, entries, emptyText) {
  const section = document.createElement("section");
  section.className = "detail-section";
  const heading = document.createElement("h3");
  heading.textContent = title;
  section.append(heading);

  const list = document.createElement("ul");
  list.className = "detail-list";
  if (!entries.length && emptyText) {
    const item = document.createElement("li");
    const text = document.createElement("span");
    text.textContent = emptyText;
    item.append(text);
    list.append(item);
  }
  for (const entry of entries) {
    const item = document.createElement("li");
    const name = document.createElement("strong");
    const text = document.createElement("span");
    name.textContent = entry.name;
    text.textContent = entry.text || "";
    item.append(name);
    if (text.textContent) item.append(text);
    list.append(item);
  }
  section.append(list);
  ui.heroDetailBody.append(section);
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
  if (state.over || state.pendingEndChoice) return;
  const playerAction = getActionById(playerActionId, state.player);
  if (!playerAction || !canUseAction(state.player, playerAction)) return;
  if (state.mode === "online") {
    submitOnlineAction(playerActionId);
    return;
  }

  const enemyAction = chooseEnemyAction();
  const report = resolveRound(playerAction, enemyAction);
  finishRound(report);
}

function finishRound(report) {
  ui.playerLast.textContent = report.playerSummary;
  ui.enemyLast.textContent = report.enemySummary;

  for (const item of report.logs) {
    addLog(item.text, item.kind);
  }

  const pendingChoice = state.over ? null : applyAutomaticEndChoices(report.endChoices || []);
  if (pendingChoice && !state.over) {
    state.pendingEndChoice = pendingChoice;
    render();
    return;
  }

  if (!state.over) {
    state.round += 1;
  }
  render();
}

function startMeleeGame() {
  stopPolling();
  state.mode = "melee";
  state.round = 1;
  state.over = false;
  state.pendingEndChoice = null;
  state.player = makeFighter("你", ui.playerHero.value);
  state.enemy = makeFighter("电脑A", ui.enemyHero.value);
  state.melee.fighters = [
    makeMeleeFighter("p1", "你", ui.playerHero.value, true),
    makeMeleeFighter("ai-a", "电脑A", ui.enemyHero.value, false),
    makeMeleeFighter("ai-b", "电脑B", "classic", false),
  ];
  closeMeleeAttackAllocator();
  ui.battleLog.innerHTML = "";
  updateRoomStatus("当前：混战测试（1 真人 + 2 电脑）");
  addLog("混战开局：各自为战，攻击可拆分给多个目标。");
  render();
}

function makeMeleeFighter(id, label, heroId, controlled) {
  const fighter = makeFighter(label, heroId);
  fighter.id = id;
  fighter.controlled = controlled;
  fighter.lastSummary = "等待出手";
  return fighter;
}

function renderMelee() {
  const fighters = state.melee.fighters;
  ui.meleeGrid.innerHTML = "";
  for (const fighter of fighters) {
    const card = document.createElement("article");
    card.className = `melee-fighter${fighter.hp <= 0 ? " is-out" : ""}`;
    const passiveText = getFighterStatusEntries(fighter).map((entry) => entry.text ? `${entry.name}:${entry.text}` : entry.name).join(" / ");
    card.innerHTML = `
      <h3>${fighter.label}｜${fighter.hero.name}</h3>
      <div class="melee-stats">HP ${formatHearts(fighter.hp)} ｜ XP ${fighter.xp}</div>
      <div class="melee-stats">${passiveText || "无被动状态"}</div>
      <div class="melee-last">${fighter.lastSummary}</div>
    `;
    ui.meleeGrid.append(card);
  }
  renderMeleeTargets();
  ui.meleeStatus.textContent = state.over ? "混战结束" : "1 真人 + 2 电脑";
}

function renderMeleeTargets() {
  const player = getMeleePlayer();
  const targets = getAliveMeleeOpponents(player);
  const selects = [ui.meleeAttackA, ui.meleeAttackB];
  const labels = [ui.meleeTargetALabel, ui.meleeTargetBLabel];
  const previousValues = selects.map((select) => select.value);

  selects.forEach((select, index) => {
    const target = targets[index];
    labels[index].textContent = target ? target.label : `目标 ${index + 1}`;
    select.innerHTML = "";
    select.options = [];
    select.disabled = !target || state.over || player.hp <= 0;
    select.dataset.targetId = target?.id || "";
    const none = new Option("不攻击", "");
    select.add(none);
    for (const action of ACTIONS.filter((item) => item.kind === "attack")) {
      const cost = getCost(player, action);
      const option = new Option(`${action.name}（${cost}XP）`, action.id);
      select.add(option);
    }
    if ([...select.options].some((option) => option.value === previousValues[index])) {
      select.value = previousValues[index];
    }
  });

  const canAct = !state.over && player.hp > 0;
  ui.meleeJiBtn.disabled = !canAct;
  ui.meleeDefBtn.disabled = !canAct;
  ui.meleeAttackModeBtn.disabled = !canAct || !targets.length;
  ui.meleeSubmitBtn.disabled = !canAct;
  if (!canAct || !targets.length) {
    closeMeleeAttackAllocator();
  }
}

function openMeleeAttackAllocator() {
  if (state.mode !== "melee" || state.over) return;
  const player = getMeleePlayer();
  if (!player || player.hp <= 0 || !getAliveMeleeOpponents(player).length) return;
  ui.meleeAttackAllocator.hidden = false;
}

function closeMeleeAttackAllocator() {
  ui.meleeAttackAllocator.hidden = true;
}

function submitMeleeBasic(actionId) {
  if (state.mode !== "melee" || state.over) return;
  const player = getMeleePlayer();
  const action = getActionById(actionId, player);
  if (!action || !canUseAction(player, action)) return;
  closeMeleeAttackAllocator();
  resolveMeleeRound(new Map([[player.id, { fighter: player, action, summaryAction: action }]]));
}

function submitMeleeAttacks() {
  if (state.mode !== "melee" || state.over) return;
  const player = getMeleePlayer();
  if (player.hp <= 0) return;

  const attacks = [ui.meleeAttackA, ui.meleeAttackB]
    .map((select) => ({ targetId: select.dataset.targetId, action: getActionById(select.value, player) }))
    .filter((entry) => entry.targetId && entry.action);
  if (!attacks.length) return;

  const totalCost = attacks.reduce((sum, entry) => sum + getCost(player, entry.action), 0);
  if (totalCost > player.xp) {
    addLog(`混战攻击分配需要 ${totalCost} XP，你当前只有 ${player.xp} XP。`);
    return;
  }

  const action = {
    id: "melee-multiattack",
    kind: "multiattack",
    name: "分配攻击",
    cost: totalCost,
    defense: 0,
    xpGain: 0,
    attacks,
  };
  closeMeleeAttackAllocator();
  resolveMeleeRound(new Map([[player.id, { fighter: player, action, summaryAction: action }]]));
}

function resolveMeleeRound(playerPlans) {
  const fighters = state.melee.fighters.filter((fighter) => fighter.hp > 0);
  const plans = new Map(playerPlans);
  const logs = [];
  const notes = [];
  for (const fighter of fighters) clearRoundPhaseFlags(fighter);

  for (const fighter of fighters) {
    if (!plans.has(fighter.id)) {
      const action = chooseMeleeAiAction(fighter);
      plans.set(fighter.id, { fighter, action, summaryAction: action });
    }
  }

  for (const plan of plans.values()) {
    plan.context = { selfAction: plan.action, opponentAction: ACTION_BY_ID.ji, notes: [], hit: false, damageDealt: 0 };
    plan.fighter.xp -= getMeleeActionCost(plan.fighter, plan.action);
    plan.fighter.xp += getXpGain(plan.fighter, plan.action);
    applyPreDamageEffects(plan.fighter, plan.action, logs);
  }

  const defenses = new Map();
  for (const plan of plans.values()) {
    defenses.set(plan.fighter.id, getDefense(plan.fighter, plan.action));
  }

  for (const intent of getMeleeAttackIntents(plans)) {
    const target = state.melee.fighters.find((fighter) => fighter.id === intent.targetId);
    if (!target || target.hp <= 0 || intent.source.hp <= 0) continue;
    const targetPlan = plans.get(target.id);
    const defense = targetPlan ? getIncomingDefense(target, targetPlan.action, intent.source) : defenses.get(target.id) || 0;
    const attack = getAttack(intent.source, intent.action, target);
    if (attack > defense) {
      const sourcePlan = plans.get(intent.source.id);
      sourcePlan.context.hit = true;
      sourcePlan.context.damageDealt += dealDamage(intent.source, target, intent.action, `${intent.source.label}用 ${intent.action.name} 攻击${target.label}，击穿防御 ${formatDefense(defense)}，${target.label} HP -1。`, logs, notes, null);
    } else {
      logs.push({ text: `${intent.source.label}用 ${intent.action.name} 攻击${target.label}，强度 ${attack} 未超过防御 ${formatDefense(defense)}。` });
    }
  }

  for (const plan of plans.values()) {
    runHook(plan.fighter, "afterRound", plan.fighter, null, plan.context);
    tickStatuses(plan.fighter, plan.context.notes);
    plan.fighter.lastSummary = summarizeMeleeAction(plan.fighter, plan.action, defenses.get(plan.fighter.id) || 0);
  }

  for (const note of [...notes, ...Array.from(plans.values()).flatMap((plan) => plan.context.notes)]) {
    logs.push({ text: note });
  }

  for (const choice of collectEndPhaseChoices(fighters)) {
    for (const item of applyEndPhaseChoice(choice, chooseAutomaticEndPhaseOption(choice))) {
      logs.push(item);
    }
  }

  updateMeleeOutcome(logs);
  for (const item of logs) addLog(item.text, item.kind);
  if (!state.over) state.round += 1;
  render();
}

function getMeleeAttackIntents(plans) {
  const intents = [];
  for (const plan of plans.values()) {
    if (plan.action.kind === "multiattack") {
      for (const attack of plan.action.attacks) {
        intents.push({ source: plan.fighter, targetId: attack.targetId, action: attack.action });
      }
    } else if (plan.action.kind === "attack" && plan.action.targetId) {
      intents.push({ source: plan.fighter, targetId: plan.action.targetId, action: plan.action });
    }
  }
  return intents;
}

function chooseMeleeAiAction(fighter) {
  const targets = state.melee.fighters.filter((target) => target.id !== fighter.id && target.hp > 0);
  const target = targets[Math.floor(Math.random() * targets.length)];
  if (!target) return ACTION_BY_ID.ji;
  const affordableAttacks = getAvailableActions(fighter)
    .filter((action) => action.kind === "attack")
    .sort((a, b) => getCost(fighter, b) - getCost(fighter, a));
  if (affordableAttacks.length && Math.random() > 0.35) {
    const action = { ...affordableAttacks[0], targetId: target.id };
    return action;
  }
  if (fighter.xp > 0 && Math.random() > 0.55) return ACTION_BY_ID["def-small"];
  return ACTION_BY_ID.ji;
}

function getMeleeActionCost(fighter, action) {
  if (action.kind === "multiattack") return action.cost;
  return getCost(fighter, action);
}

function summarizeMeleeAction(fighter, action, defense) {
  if (action.kind === "multiattack") {
    const parts = action.attacks.map((attack) => `${attack.action.name}->${getMeleeFighterLabel(attack.targetId)}`);
    return `分配攻击：${parts.join("，")}（花费 ${action.cost}）`;
  }
  if (action.kind === "charge") return `${action.name}：XP +${getXpGain(fighter, action)}`;
  if (action.kind === "defense") return `${action.name}：防御 ${formatDefense(defense)}`;
  return `${action.name}`;
}

function updateMeleeOutcome(logs) {
  const alive = state.melee.fighters.filter((fighter) => fighter.hp > 0);
  const player = getMeleePlayer();
  if (player.hp <= 0) {
    state.over = true;
    logs.push({ kind: "win", text: "你在混战中被击倒。" });
  } else if (alive.length <= 1) {
    state.over = true;
    logs.push({ kind: "win", text: `${alive[0]?.label || "无人"}成为混战胜者。` });
  }
}

function getMeleePlayer() {
  return state.melee.fighters.find((fighter) => fighter.controlled) || state.melee.fighters[0];
}

function getAliveMeleeOpponents(fighter) {
  return state.melee.fighters.filter((target) => target.id !== fighter.id && target.hp > 0);
}

function getMeleeFighterLabel(fighterId) {
  return state.melee.fighters.find((fighter) => fighter.id === fighterId)?.label || "目标";
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
  clearRoundPhaseFlags(player);
  clearRoundPhaseFlags(enemy);
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
  const playerIncomingDefense = getIncomingDefense(player, playerAction, enemy);
  const enemyIncomingDefense = getIncomingDefense(enemy, enemyAction, player);
  const playerAttack = getAttack(player, playerAction, enemy);
  const enemyAttack = getAttack(enemy, enemyAction, player);

  const damageNotes = [];

  applyPostDefenseSkillEffects(player, playerAction, enemy, enemyIncomingDefense, logs);
  applyPostDefenseSkillEffects(enemy, enemyAction, player, playerIncomingDefense, logs);
  applyScheduledGhostAttack(player, enemy, enemyIncomingDefense, logs, damageNotes, ui.enemyCard, contextForPlayer);
  applyScheduledGhostAttack(enemy, player, playerIncomingDefense, logs, damageNotes, ui.playerCard, contextForEnemy);

  if (playerAction.kind === "attack" && enemyAction.kind === "attack") {
    const playerHits = playerAttack > enemyIncomingDefense;
    const enemyHits = enemyAttack > playerIncomingDefense;

    if (playerHits) {
      contextForPlayer.hit = true;
      contextForPlayer.damageDealt = dealDamage(player, enemy, playerAction, `${player.label}用 ${playerAction.name} 对攻压过${enemy.label} ${enemyAction.name}，${enemy.label} HP -1。`, logs, damageNotes, ui.enemyCard);
    }
    if (enemyHits) {
      contextForEnemy.hit = true;
      contextForEnemy.damageDealt = dealDamage(enemy, player, enemyAction, `${enemy.label}用 ${enemyAction.name} 对攻压过${player.label}的 ${playerAction.name}，${player.label} HP -1。`, logs, damageNotes, ui.playerCard);
    }
    if (!playerHits && !enemyHits && playerAttack === enemyAttack) {
      logs.push({ text: `双方对攻强度同为 ${playerAttack}，互相抵消。` });
    }
  } else {
    const playerHits = playerAction.kind === "attack" && playerAttack > enemyIncomingDefense;
    const enemyHits = enemyAction.kind === "attack" && enemyAttack > playerIncomingDefense;

    if (playerHits) {
      contextForPlayer.hit = true;
      contextForPlayer.damageDealt = dealDamage(player, enemy, playerAction, `${player.label}用 ${playerAction.name} 击穿${enemy.label}防御 ${formatDefense(enemyIncomingDefense)}，${enemy.label} HP -1。`, logs, damageNotes, ui.enemyCard);
    } else if (playerAction.kind === "attack") {
      logs.push({ text: `${player.label}用 ${playerAction.name}，强度 ${playerAttack} 未超过${enemy.label}防御 ${formatDefense(enemyIncomingDefense)}。` });
    }

    if (enemyHits) {
      contextForEnemy.hit = true;
      contextForEnemy.damageDealt = dealDamage(enemy, player, enemyAction, `${enemy.label}用 ${enemyAction.name} 击穿${player.label}防御 ${formatDefense(playerIncomingDefense)}，${player.label} HP -1。`, logs, damageNotes, ui.playerCard);
    } else if (enemyAction.kind === "attack") {
      logs.push({ text: `${enemy.label}用 ${enemyAction.name}，强度 ${enemyAttack} 未超过${player.label}防御 ${formatDefense(playerIncomingDefense)}。` });
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

  const endChoices = collectEndPhaseChoices([player, enemy]);
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

  return { logs, playerSummary, enemySummary, endChoices };
}

function dealDamage(attacker, defender, action, text, logs, damageNotes, defenderCard) {
  const context = { action, damage: 1, notes: damageNotes };
  const damage = getDamage(attacker, defender, action, context);
  context.damage = damage;
  defender.hp -= damage;
  logs.push({ kind: "impact", text: text.replace("HP -1", `HP -${damage}`) });
  runHook(attacker, "onDealDamage", attacker, defender, context);
  runHook(defender, "afterTakeDamage", defender, attacker, context);
  if (defenderCard) flash(defenderCard);
  return damage;
}

function clearRoundPhaseFlags(fighter) {
  if (!fighter?.flags) return;
  fighter.flags.chaseTargets = [];
}

function collectEndPhaseChoices(fighters) {
  const choices = [];
  for (const fighter of fighters) {
    if (fighter.heroId !== "battery" || fighter.hp <= 0) continue;
    for (const target of fighter.flags.chaseTargets || []) {
      if (!target || target.hp <= 0) continue;
      choices.push({
        id: "battery-chase",
        actor: fighter,
        target,
      });
    }
  }
  return choices;
}

function applyAutomaticEndChoices(choices) {
  let manualChoice = null;
  for (const choice of choices) {
    if (state.mode === "cpu" && choice.actor === state.player && !manualChoice) {
      manualChoice = choice;
      continue;
    }
    for (const item of applyEndPhaseChoice(choice, chooseAutomaticEndPhaseOption(choice))) {
      addLog(item.text, item.kind);
    }
  }
  return manualChoice;
}

function chooseAutomaticEndPhaseOption(choice) {
  return choice.target.xp > 0 ? "drain" : "gain";
}

function resolvePendingEndChoice(option) {
  if (!state.pendingEndChoice) return;
  const choice = state.pendingEndChoice;
  state.pendingEndChoice = null;
  for (const item of applyEndPhaseChoice(choice, option)) {
    addLog(item.text, item.kind);
  }
  if (!state.over) {
    state.round += 1;
  }
  render();
}

function applyEndPhaseChoice(choice, option) {
  if (!choice || choice.id !== "battery-chase") return [];
  const amount = BALANCE.heroes.battery.chaseXp;
  if (option === "drain") {
    const lost = Math.min(choice.target.xp, amount);
    choice.target.xp -= lost;
    return [{ text: lost > 0
      ? `${choice.actor.label}发动追索，令${choice.target.label} -${lost} XP。`
      : `${choice.actor.label}发动追索，但${choice.target.label}没有 XP 可扣。`
    }];
  }
  choice.actor.xp += amount;
  return [{ text: `${choice.actor.label}发动追索，获得 ${amount} XP。` }];
}

function summarizeAction(fighter, action, attack, defense, xpGain = action.xpGain) {
  if (action.kind === "charge") return `${action.name}：XP +${xpGain}，防御 ${formatDefense(defense)}`;
  if (action.kind === "defense") return `${action.name}：花费 ${getCost(fighter, action)}，防御 ${formatDefense(defense)}`;
  if (action.kind === "skill") {
    const pointDefense = action.effects?.pointDefense ? `，单点防御 ${formatDefense(action.effects.pointDefense)}` : "";
    return `${action.name}：花费 ${getCost(fighter, action)}，防御 ${formatDefense(defense)}${pointDefense}`;
  }
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

function getIncomingDefense(defender, defenderAction, attacker) {
  return Math.max(getDefense(defender, defenderAction), getPointDefenseAgainst(defender, defenderAction, attacker));
}

function getPointDefenseAgainst(fighter, action, target) {
  if (!action || !target) return 0;
  if (action.kind === "multiattack") {
    return action.attacks
      .filter((attack) => attack.targetId === target.id)
      .reduce((best, attack) => Math.max(best, getAttack(fighter, attack.action, target)), 0);
  }
  if (action.kind === "attack" && (!action.targetId || action.targetId === target.id)) {
    return getAttack(fighter, action, target);
  }
  if (action.effects?.pointDefense && (!action.targetId || action.targetId === target.id)) {
    return action.effects.pointDefense;
  }
  return 0;
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

  const drained = BALANCE.heroes.astrologer.drainAmount;
  target.xp = Math.max(0, target.xp - drained);
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
    state.pendingEndChoice = null;
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
  state.pendingEndChoice = null;
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
  if (!state.over) applyAutomaticEndChoices(report.endChoices || []);
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
ui.meleeModeBtn.addEventListener("click", startMeleeGame);
ui.createRoomBtn.addEventListener("click", createOnlineRoom);
ui.joinRoomBtn.addEventListener("click", joinOnlineRoom);
ui.meleeJiBtn.addEventListener("click", () => submitMeleeBasic("ji"));
ui.meleeDefBtn.addEventListener("click", () => submitMeleeBasic("def-small"));
ui.meleeAttackModeBtn.addEventListener("click", openMeleeAttackAllocator);
ui.meleeBackBtn.addEventListener("click", closeMeleeAttackAllocator);
ui.meleeSubmitBtn.addEventListener("click", submitMeleeAttacks);
ui.chaseDrainBtn.addEventListener("click", () => resolvePendingEndChoice("drain"));
ui.chaseGainBtn.addEventListener("click", () => resolvePendingEndChoice("gain"));
ui.manualBtn.addEventListener("click", openManualDetail);
ui.manualClose.addEventListener("click", closeManualDetail);
ui.manualDetail.addEventListener("click", (event) => {
  if (event.target === ui.manualDetail) closeManualDetail();
});
ui.playerAvatar.addEventListener("click", () => openHeroDetail(state.player));
ui.enemyAvatar.addEventListener("click", () => openHeroDetail(state.enemy));
ui.heroDetailClose.addEventListener("click", closeHeroDetail);
ui.heroDetail.addEventListener("click", (event) => {
  if (event.target === ui.heroDetail) closeHeroDetail();
});
if (document.addEventListener) {
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeHeroDetail();
      closeManualDetail();
    }
  });
}
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
