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
      { id: "atk-1", name: "小刀", cost: 1, power: 1, category: "range-1" },
      { id: "atk-2", name: "大刀", cost: 2, power: 2, category: "range-1" },
      { id: "atk-3", name: "冰刀", cost: 3, power: 3, category: "range-1" },
      { id: "atk-4", name: "火刀", cost: 4, power: 4, category: "range-1" },
      { id: "atk-5", name: "鬼刀", cost: 5, power: 5, category: "range-1" },
      { id: "atk-6", cost: 6, power: 6, category: "range-1" },
      { id: "atk-7", cost: 7, power: 7, category: "range-1" },
      { id: "atk-8", cost: 8, power: 8, category: "range-1" },
      { id: "atk-9", cost: 9, power: 9, category: "range-1" },
      { id: "atk-10", cost: 10, power: 10, category: "range-1" },
      { id: "atk-long", name: "长刀", cost: 2, power: 1, range: 2, category: "range-2" },
      { id: "atk-longsword", name: "长剑", cost: 3, power: 2, range: 2, category: "range-2" },
      { id: "atk-spear", name: "长矛", cost: 6, power: 5, range: 2, category: "range-2" },
      {
        id: "atk-firebomb",
        name: "燃烧弹",
        cost: 4,
        power: 1,
        range: 1,
        category: "special",
        tacticalEffect: "firebomb",
        targetCount: 2,
        text: "花费 4，对两个连续相邻格各发射一把小刀；下回合生成火焰",
      },
    ],
  },
  heroes: {
    woodendummy:
    {
      jiXpGain: 0,
    },
    battery: {
      maxHp: 2,
      jiStreakRequired: 2,
      bonusXp: 1,
      chaseXp: 1,
    },
    balancedBot: {
      maxHp: 2,
      jiXpGain: 2,
    },
    guard: {
      maxHp: 3,
      defenseBonus: 1,
      thinWallAttackBonus: 0.1,
      buildWallCost: 1,
      buildWallDefense: 2,
      buildWallDuration: 2,
    },
    breaker: {
      maxHp: 4,
      minAttackCost: 5,
      attackBonus: 1,
    },
    priest: {
      maxHp: 3,
      allowedAttackIds: ["atk-1", "atk-5", "atk-10", "atk-long", "atk-spear"],
      shieldCost: 1,
      healCost: 4,
      healAmount: 1,
    },
    pharmacist: {
      maxHp: 3,
      allowedAttackIds: ["atk-1", "atk-5", "atk-10", "atk-long", "atk-spear"],
      loadoutSize: 2,
      recoveryCountdown: 10,
      recoveryHealTo: 2,
      invinciblePotionCost: 3,
      invinciblePotionTurns: 2,
      poisonCost: 3,
      poisonPower: 0.1,
      poisonDamage: 2,
      poisonTurns: 2,
      poisonTickDamage: 1,
      reviveCost: 8,
      reviveXp: 1,
    },
    elf: {
      maxHp: 3,
      allowedAttackIds: ["atk-1", "atk-5", "atk-10", "atk-long", "atk-spear"],
      loadoutSize: 2,
      elvenAuraCost: 3,
      elvenAuraTurns: 2,
      holyAuraCost: 2,
      holyAuraTurns: 4,
      energyTransferCost: 3,
      energyTransferAmount: 3,
      bindCost: 2,
      bindTurns: 2,
    },
    ninja: {
      maxHp: 2,
      shurikenPower: 3,
      blindTurns: 2,
      stealthCost: 2,
      stealthTurns: 3,
    },
    puppet: {
      maxHp: 2,
      shieldXpGain: 1,
      standbyHp: 3,
      standbyTurns: 3,
      reviveXp: 1,
      reviveHp: 1,
      shieldCooldown: 6,
      shieldCost: 2,
    },
    paladin: {
      maxHp: 4,
      xpPerDamageTaken: 1,
      tauntTurns: 1,
    },
    battleMage: {
      maxHp: 3,
      jiXpGain: 1,
    },
    gunner: {
      maxHp: 2,
      jiXpGain: 1,
      spellLearnCost: 1,
      cannonCost: 10,
      cannonPower: 8,
      cannonRange: 2,
      cannonDamage: 2,
      machineGunCost: 12,
      machineGunPower: 10,
      machineGunRange: 2,
      machineGunDamage: 1,
      machineGunTurns: 2,
    },
    assassin: {
      maxHp: 1,
      jiXpGain: 4,
      sneakCost: 1,
      sneakMoveBonus: 1,
    },
    vampire: {
      maxHp: 2,
      healPerDamage: 1,
    },
    hunter: {
      maxHp: 2,
      precisionShotCost: 6,
      precisionShotPower: 8,
      precisionShotRange: 2,
      missRefunds: {
        "atk-3": 1,
        "atk-4": 1,
        "atk-5": 2,
        "atk-6": 2,
        "atk-7": 2,
        "atk-8": 2,
        "atk-9": 2,
        "atk-10": 3,
      },
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
    dancer: {
      maxHp: 1,
      jiXpGain: 2,
      spinCost: 0,
      spinMaxPower: 4,
      grandSpinCost: 1,
      grandSpinMaxPower: 6,
      forceJiTurns: 1,
    },
    mage: {
      maxHp: 1,
      jiXpGain: 2,
      lightningShardCost: 3,
      lightningPower: 3,
      lightningRange: 1,
      lightningSplashRange: 2,
      lightningSplashPower: 0.1,
      thunderStrikeShardCost: 8,
      thunderStrikePower: 5,
      thunderStrikeRange: 2,
    },
  },
  ai: {
    lowEnergyTarget: 2,
    highThreatAttack: 5,
    heroProfiles: {
      paladin: {
        lowEnergyTarget: 1,
        highThreatAttack: 10,
      },
      assassin: {
        lowEnergyTarget: 1,
        highThreatAttack: 7,
      },
      mage: {
        lowEnergyTarget: 2,
        highThreatAttack: 5,
      },
      vampire: {
        lowEnergyTarget: 1,
        highThreatAttack: 8,
      },
      dancer: {
        lowEnergyTarget: 1,
        highThreatAttack: 8,
      },
      astrologer: {
        lowEnergyTarget: 2,
        highThreatAttack: 5,
      },
    },
  },
};

const ACTIONS = buildActions(BALANCE);

const PHARMACIST_LOADOUT_OPTIONS = [
  {
    id: "pharmacist-recovery",
    name: "恢复",
    kind: "passive",
    text: `HP 减至 1 后，若接下来 9 回合未死亡，第 10 回合 HP 加至 ${BALANCE.heroes.pharmacist.recoveryHealTo}`,
  },
  {
    id: "pharmacist-invincible-potion",
    name: "无敌药剂",
    kind: "skill",
    cost: BALANCE.heroes.pharmacist.invinciblePotionCost,
    text: `花费 ${BALANCE.heroes.pharmacist.invinciblePotionCost}，目标下回合起无敌 ${BALANCE.heroes.pharmacist.invinciblePotionTurns} 回合；本回合药师无敌，目标带小防`,
  },
  {
    id: "pharmacist-poison",
    name: "下毒",
    kind: "skill",
    cost: BALANCE.heroes.pharmacist.poisonCost,
    text: `花费 ${BALANCE.heroes.pharmacist.poisonCost}，用 Ji刀大小攻击目标；命中造成 ${BALANCE.heroes.pharmacist.poisonDamage} 伤害并施加 ${BALANCE.heroes.pharmacist.poisonTurns} 回合中毒；本回合药师小防`,
  },
  {
    id: "pharmacist-revive",
    name: "复活药剂",
    kind: "skill",
    cost: BALANCE.heroes.pharmacist.reviveCost,
    text: `花费 ${BALANCE.heroes.pharmacist.reviveCost}，复活死亡目标为经典武者并获得 ${BALANCE.heroes.pharmacist.reviveXp} XP；本回合药师无敌`,
  },
];
const DEFAULT_PHARMACIST_LOADOUT = ["pharmacist-recovery", "pharmacist-invincible-potion"];
const ELF_LOADOUT_OPTIONS = [
  { id: "elf-elven-aura", name: "精灵光环", kind: "skill", cost: BALANCE.heroes.elf.elvenAuraCost, text: `花费 ${BALANCE.heroes.elf.elvenAuraCost}，目标接下来 ${BALANCE.heroes.elf.elvenAuraTurns} 回合防御升一大级并获得吸血；本回合中防` },
  { id: "elf-holy-aura", name: "神圣光环", kind: "skill", cost: BALANCE.heroes.elf.holyAuraCost, text: `花费 ${BALANCE.heroes.elf.holyAuraCost}，目标本回合防御升一大级；接下来 ${BALANCE.heroes.elf.holyAuraTurns} 回合 Ji 效率 +1，受伤即消失；本回合小防` },
  { id: "elf-energy-transfer", name: "能量输送", kind: "skill", cost: BALANCE.heroes.elf.energyTransferCost, text: `花费 ${BALANCE.heroes.elf.energyTransferCost}，目标在下回合开始前获得 ${BALANCE.heroes.elf.energyTransferAmount} XP；本回合小防` },
  { id: "elf-bind", name: "缴械", kind: "skill", cost: BALANCE.heroes.elf.bindCost, text: `花费 ${BALANCE.heroes.elf.bindCost}，目标下 ${BALANCE.heroes.elf.bindTurns} 回合不能使用攻击；中防可抵挡；本回合中防` },
];
const DEFAULT_ELF_LOADOUT = ["elf-elven-aura", "elf-holy-aura"];
const HERO_LORE = window.JiHeroRegistry?.lore || {};

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
    range: action.range || 1,
    category: action.category || (action.range > 1 ? "range-2" : "range-1"),
    tacticalEffect: action.tacticalEffect || "",
    targetCount: action.targetCount || 1,
    defense: 0,
    xpGain: 0,
    text: action.text || `花费 ${action.cost}，攻击强度 ${action.power}${action.range ? `，距离 ${action.range}` : ""}`,
  }));

  return [...chargeActions, ...defenseActions, ...attackActions];
}

const ACTION_BY_ID = Object.fromEntries(ACTIONS.map((action) => [action.id, action]));

const GUNNER_SPELL_SPECS = {
  "ice-dagger": {
    key: "ice-dagger",
    owner: "冰法",
    name: "冰法炮台",
    actionName: "Ji刀",
    power: BALANCE.heroes.iceSorcerer.daggerPower,
    range: 1,
    damage: 1,
  },
  "astrologer-predict": {
    key: "astrologer-predict",
    owner: "占星家",
    name: "占星炮台",
    actionName: "预判鬼刀",
    power: 5,
    range: 2,
    damage: 1,
  },
  "pharmacist-poison": {
    key: "pharmacist-poison",
    owner: "药师",
    name: "药师炮台",
    actionName: "毒刃",
    power: BALANCE.heroes.pharmacist.poisonPower,
    range: 1,
    damage: BALANCE.heroes.pharmacist.poisonDamage,
  },
  "mage-lightning": {
    key: "mage-lightning",
    owner: "法师",
    name: "闪电炮台",
    actionName: "闪电",
    power: BALANCE.heroes.mage.lightningPower,
    range: BALANCE.heroes.mage.lightningRange,
    damage: 1,
  },
  "mage-thunder-strike": {
    key: "mage-thunder-strike",
    owner: "法师",
    name: "雷击炮台",
    actionName: "雷击",
    power: BALANCE.heroes.mage.thunderStrikePower,
    range: BALANCE.heroes.mage.thunderStrikeRange,
    damage: 1,
  },
  "gunner-cannon": {
    key: "gunner-cannon",
    owner: "枪炮师",
    name: "大炮炮台",
    actionName: "无敌大炮",
    power: BALANCE.heroes.gunner.cannonPower,
    range: BALANCE.heroes.gunner.cannonRange,
    damage: BALANCE.heroes.gunner.cannonDamage,
  },
  "gunner-machine-gun": {
    key: "gunner-machine-gun",
    owner: "枪炮师",
    name: "机枪炮台",
    actionName: "加特林",
    power: BALANCE.heroes.gunner.machineGunPower,
    range: BALANCE.heroes.gunner.machineGunRange,
    damage: BALANCE.heroes.gunner.machineGunDamage,
  },
};

const GUNNER_HERO_SPELL_KEYS = {
  iceSorcerer: ["ice-dagger"],
  astrologer: ["astrologer-predict"],
  pharmacist: ["pharmacist-poison"],
  mage: ["mage-lightning", "mage-thunder-strike"],
  gunner: ["gunner-cannon", "gunner-machine-gun"],
};

const HEROES = {

  priest: {
    id: "priest",
    name: "牧师 Priest",
    maxHp: BALANCE.heroes.priest.maxHp,
    startingXp: BALANCE.startingXp,
    description: "辅助型英雄，专职治疗师",
    passives: [{ name: "辅助", text: "可使用小刀、长刀、鬼刀、长矛、10费攻" }],
    activeSkills: [
      {
        id: "priest-shield",
        kind: "skill",
        name: "庇护",
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
        name: "疗愈",
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
        return BALANCE.heroes.priest.allowedAttackIds.includes(action.id);
      },
    },
  },
  elf: {
    id: "elf",
    name: "精灵 Elf",
    maxHp: BALANCE.heroes.elf.maxHp,
    startingXp: BALANCE.startingXp,
    description: "辅助型光环使者，开局从四种祝福中选择两项。",
    passives: [
      { name: "辅助", text: "可使用小刀、长刀、鬼刀、长矛、10费攻" },
      { name: "祝福选择", text: "开局前在四个主动技能中选择 2 个" },
    ],
    activeSkills: [
      {
        id: "elf-elven-aura", kind: "skill", category: "skill", name: "精灵光环", cost: BALANCE.heroes.elf.elvenAuraCost,
        defense: BALANCE.defenseGrades.mid, range: 0, xpGain: 0,
        text: ELF_LOADOUT_OPTIONS.find((option) => option.id === "elf-elven-aura").text,
        effects: { elfElvenAura: true },
      },
      {
        id: "elf-holy-aura", kind: "skill", category: "skill", name: "神圣光环", cost: BALANCE.heroes.elf.holyAuraCost,
        defense: BALANCE.defenseGrades.small, range: 0, xpGain: 0,
        text: ELF_LOADOUT_OPTIONS.find((option) => option.id === "elf-holy-aura").text,
        effects: { upgradeDefense: true, elfHolyAura: true },
      },
      {
        id: "elf-energy-transfer", kind: "skill", category: "skill", name: "能量输送", cost: BALANCE.heroes.elf.energyTransferCost,
        defense: BALANCE.defenseGrades.small, range: 0, xpGain: 0,
        text: ELF_LOADOUT_OPTIONS.find((option) => option.id === "elf-energy-transfer").text,
        effects: { elfEnergyTransfer: true },
      },
      {
        id: "elf-bind", kind: "skill", category: "skill", name: "缴械", cost: BALANCE.heroes.elf.bindCost,
        defense: BALANCE.defenseGrades.mid, range: 0, xpGain: 0,
        text: ELF_LOADOUT_OPTIONS.find((option) => option.id === "elf-bind").text,
        effects: { elfBind: true },
      },
    ],
    hooks: {
      canUseAction(action) {
        return action.kind !== "attack" || BALANCE.heroes.elf.allowedAttackIds.includes(action.id);
      },
    },
  },
  pharmacist: {
    id: "pharmacist",
    name: "药师 Pharmacist",
    maxHp: BALANCE.heroes.pharmacist.maxHp,
    startingXp: BALANCE.startingXp,
    description: "辅助型药剂师，开局前从四种药剂方案中选择两个。",
    passives: [
      { name: "辅助", text: "可使用小刀、长刀、鬼刀、长矛、10费攻" },
      { name: "配药", text: "开局前在恢复、无敌药剂、下毒、复活药剂中选择 2 个" },
    ],
    activeSkills: [
      {
        id: "pharmacist-invincible-potion",
        kind: "skill",
        name: "无敌药剂",
        cost: BALANCE.heroes.pharmacist.invinciblePotionCost,
        power: 0,
        defense: BALANCE.defenseGrades.invincible,
        xpGain: 0,
        text: PHARMACIST_LOADOUT_OPTIONS.find((option) => option.id === "pharmacist-invincible-potion").text,
        effects: {
          pharmacistInvinciblePotion: true,
          targetDefense: BALANCE.defenseGrades.small,
        },
      },
      {
        id: "pharmacist-poison",
        kind: "skill",
        name: "下毒",
        cost: BALANCE.heroes.pharmacist.poisonCost,
        power: BALANCE.heroes.pharmacist.poisonPower,
        defense: BALANCE.defenseGrades.small,
        xpGain: 0,
        text: PHARMACIST_LOADOUT_OPTIONS.find((option) => option.id === "pharmacist-poison").text,
        effects: {
          pharmacistPoison: true,
          skillAttack: true,
          skillAttackPower: BALANCE.heroes.pharmacist.poisonPower,
          damage: BALANCE.heroes.pharmacist.poisonDamage,
          poisonTurns: BALANCE.heroes.pharmacist.poisonTurns,
        },
      },
      {
        id: "pharmacist-revive",
        kind: "skill",
        name: "复活药剂",
        cost: BALANCE.heroes.pharmacist.reviveCost,
        power: 0,
        defense: BALANCE.defenseGrades.invincible,
        xpGain: 0,
        text: PHARMACIST_LOADOUT_OPTIONS.find((option) => option.id === "pharmacist-revive").text,
        effects: {
          revive: true,
          invincible: true,
        },
      },
    ],
    hooks: {
      canUseAction(action) {
        if (action.kind === "attack") return BALANCE.heroes.pharmacist.allowedAttackIds.includes(action.id);
        return true;
      },
      afterTakeDamage(self, attacker, context) {
        if (!hasPharmacistLoadout(self, "pharmacist-recovery")) return;
        if (self.hp !== 1 || hasStatus(self, "pharmacist-recovery")) return;
        setStatus(self, {
          id: "pharmacist-recovery",
          name: "恢复",
          text: `${BALANCE.heroes.pharmacist.recoveryCountdown} 回合后恢复`,
          turns: BALANCE.heroes.pharmacist.recoveryCountdown,
          fresh: true,
          effects: {
            healTo: BALANCE.heroes.pharmacist.recoveryHealTo,
          },
        });
        context.notes.push(`${self.label}触发恢复：若接下来 9 回合未死亡，第 10 回合 HP 恢复至 ${BALANCE.heroes.pharmacist.recoveryHealTo}。`);
      },
    },
  },
  paladin: {
    id: "paladin",
    name: "圣骑士 Paladin",
    maxHp: BALANCE.heroes.paladin.maxHp,
    startingXp: BALANCE.startingXp,
    description: "别名：坦克。承伤后反蓄力，并用仇恨牵制敌方目标。",
    passives: [
      { name: "坦护", text: `每受到 1 点伤害，获得 ${BALANCE.heroes.paladin.xpPerDamageTaken} XP` },
      { name: "仇恨", text: `击中目标后，目标下回合攻击或伤害技能只能选择坦克` },
    ],
    activeSkills: [],
    hooks: {
      onDealDamage(self, target, context) {
        if (context.damage <= 0) return;
        setStatus(target, {
          id: `paladin-taunt-${self.id || self.label}`,
          type: "negative",
          name: "仇恨",
          text: `只能攻击${self.label}`,
          turns: BALANCE.heroes.paladin.tauntTurns,
          fresh: true,
          effects: {
            tauntTargetId: self.id || "",
            tauntTargetLabel: self.label,
          },
        });
        context.notes.push(`${target.label}受到${self.label}的仇恨影响，下回合攻击和伤害技能只能选择${self.label}。`);
      },
      afterTakeDamage(self, attacker, context) {
        if (context.damage <= 0) return;
        const gained = context.damage * BALANCE.heroes.paladin.xpPerDamageTaken;
        self.xp += gained;
        context.notes.push(`${self.label}承伤蓄力，获得 ${gained} XP。`);
      },
    },
  },
  battleMage: {
    id: "battleMage",
    name: "战法 Battle Mage",
    maxHp: BALANCE.heroes.battleMage.maxHp,
    startingXp: BALANCE.startingXp,
    description: "以短攻、长攻驱动烈焰炫纹的近战法师。",
    passives: [
      { name: "烈焰炫纹", text: "每造成 1 点伤害获得 1 个 🔥；使用短攻/长攻时可按“表”附加回合开始时的炫纹伤害" },
    ],
    activeSkills: [],
    hooks: {
      init(self) {
        self.flags.flameChasers = 0;
        self.flags.roundStartFlameChasers = 0;
      },
      modifyDamage(value, self, target, context) {
        if (!isBattleMageImprintedAction(context.action)) return value;
        const bonus = self.flags.roundStartFlameChasers || 0;
        context.battleMageBonusDamage = bonus;
        return value + bonus;
      },
      onDealDamage(self, target, context) {
        if (context.damage <= 0 || context.action.kind !== "attack") return;
        if (isBattleMageImprintedAction(context.action) && !self.flags.battleMageImprintResolved) {
          const recalled = self.flags.flameChasers || 0;
          self.flags.flameChasers = 0;
          self.flags.battleMageImprintResolved = true;
          context.notes.push(`${self.label}收回 ${recalled} 个烈焰炫纹，表攻额外伤害 ${context.battleMageBonusDamage || 0}。`);
        }
        self.flags.flameChasers = (self.flags.flameChasers || 0) + context.damage;
        context.notes.push(`${self.label}造成 ${context.damage} 点伤害，获得 ${context.damage} 个烈焰炫纹，当前 ${self.flags.flameChasers}🔥。`);
      },
      afterRound(self, opponent, context) {
        if (!isBattleMageImprintedAction(context.selfAction)) return;
        if (context.hit) return;
        const lost = self.flags.flameChasers || 0;
        self.flags.flameChasers = 0;
        context.notes.push(`${self.label}表攻未命中，${lost} 个烈焰炫纹清零。`);
      },
    },
  },
  gunner: {
    id: "gunner",
    name: "枪炮师 Gunner",
    maxHp: BALANCE.heroes.gunner.maxHp,
    startingXp: BALANCE.startingXp,
    description: "吸收物理火力转化 XP，并偷师法术攻击装填炮台。",
    passives: [
      { name: "能量转化", text: "受到短攻/长攻时，按攻击名义费用获得 XP，攻击仍正常结算" },
      { name: "偷师炮台", text: "首次吸收某种法术攻击需花费 1 XP 学习；之后获得对应炮台使用次数" },
    ],
    activeSkills: [
      {
        id: "gunner-cannon",
        kind: "attack",
        category: "skill",
        name: "无敌大炮",
        cost: BALANCE.heroes.gunner.cannonCost,
        power: BALANCE.heroes.gunner.cannonPower,
        range: BALANCE.heroes.gunner.cannonRange,
        damage: BALANCE.heroes.gunner.cannonDamage,
        defense: BALANCE.defenseGrades.small,
        xpGain: 0,
        magicalAttack: true,
        gunnerSpellKey: "gunner-cannon",
        gunnerSpellName: "无敌大炮",
        text: `花费 ${BALANCE.heroes.gunner.cannonCost}，强度 ${BALANCE.heroes.gunner.cannonPower}，距离 ${BALANCE.heroes.gunner.cannonRange}，伤害 ${BALANCE.heroes.gunner.cannonDamage}，本回合小防`,
      },
      {
        id: "gunner-machine-gun",
        kind: "attack",
        category: "skill",
        name: "无敌机枪",
        cost: BALANCE.heroes.gunner.machineGunCost,
        power: BALANCE.heroes.gunner.machineGunPower,
        range: BALANCE.heroes.gunner.machineGunRange,
        damage: BALANCE.heroes.gunner.machineGunDamage,
        defense: BALANCE.defenseGrades.small,
        xpGain: 0,
        magicalAttack: true,
        gunnerSpellKey: "gunner-machine-gun",
        gunnerSpellName: "加特林",
        text: `花费 ${BALANCE.heroes.gunner.machineGunCost}，对目标连续两回合加特林：强度 ${BALANCE.heroes.gunner.machineGunPower}，距离 ${BALANCE.heroes.gunner.machineGunRange}，伤害 ${BALANCE.heroes.gunner.machineGunDamage}；两回合小防`,
        effects: {
          gunnerMachineGun: true,
        },
      },
    ],
    hooks: {
      init(self) {
        self.flags.gunnerLearnedSpells = {};
        self.flags.gunnerStoredSpells = {};
      },
      canUseAction(action, self) {
        if (action.effects?.gunnerLearnKey) return !isGunnerSpellLearned(self, action.effects.gunnerLearnKey);
        if (!action.gunnerTurretKey) return true;
        return getGunnerTurretCount(self, action.gunnerTurretKey) > 0;
      },
      modifyDefense(value, self) {
        return hasEffectiveStatus(self, "gunner-machine-gun")
          ? Math.max(value, BALANCE.defenseGrades.small)
          : value;
      },
      beforeTakeDamage(self, attacker, context) {
        if (context.damage <= 0) return context.damage;
        if (context.gunnerAbsorbProcessed) return context.damage;
        if (isGunnerPhysicalAbsorbable(context.action)) {
          const gained = Math.max(0, context.action.cost || 0);
          if (gained > 0) {
            self.xp += gained;
            context.notes.push(`${self.label}将${context.action.name}转化为能量，获得 ${gained} XP。`);
          }
          return context.damage;
        }
        if (isGunnerSpellAbsorbable(context.action)) {
          absorbGunnerSpell(self, context.action, context);
        }
        return context.damage;
      },
      afterRound(self, opponent, context) {
        if (context.selfAction.effects?.gunnerLearnKey) {
          learnGunnerSpell(self, context.selfAction.effects.gunnerLearnKey, context.notes);
          return;
        }
        if (context.selfAction.gunnerTurretKey) {
          consumeGunnerTurretCharge(self, context.selfAction.gunnerTurretKey);
          context.notes.push(`${self.label}消耗 1 次${context.selfAction.name}，剩余 ${getGunnerTurretCount(self, context.selfAction.gunnerTurretKey)} 次。`);
        }
        if (context.selfAction.id !== "gunner-machine-gun") return;
        const target = context.selfAction.tacticalTarget || opponent;
        if (!target) return;
        setStatus(self, {
          id: "gunner-machine-gun",
          type: "positive",
          name: "机枪架设",
          text: `追踪${target.label}，下回合加特林`,
          turns: 1,
          fresh: true,
          effects: { trackedTarget: target },
        });
        context.notes.push(`${self.label}架设机枪，下回合继续向${target.label}发射加特林，并获得小防。`);
      },
    },
  },
  dancer: {
    id: "dancer",
    name: "舞女 Dancer",
    maxHp: BALANCE.heroes.dancer.maxHp,
    startingXp: BALANCE.startingXp,
    description: `灵巧，轻盈，致命`,
    passives: [
      { name: "迷步", text: `击中目标后，下回合强制目标出 Ji` },
    ],
    activeSkills: [
      {
        id: "dancer-spin",
        kind: "skill",
        name: "小转",
        cost: BALANCE.heroes.dancer.spinCost,
        power: 0,
        defense: BALANCE.defenseGrades.small,
        xpGain: 0,
        text: `免费，本回合小防；将火刀及以下攻击转移给目标`,
        effects: {
          redirectIncoming: true,
          redirectMaxPower: BALANCE.heroes.dancer.spinMaxPower,
          singleTarget: true,
        },
      },
      {
        id: "dancer-grand-spin",
        kind: "skill",
        name: "大转",
        cost: BALANCE.heroes.dancer.grandSpinCost,
        power: 0,
        defense: BALANCE.defenseGrades.small,
        xpGain: 0,
        text: `花费 ${BALANCE.heroes.dancer.grandSpinCost}，本回合小防；将 6 费及以下攻击转移给目标`,
        effects: {
          redirectIncoming: true,
          redirectMaxPower: BALANCE.heroes.dancer.grandSpinMaxPower,
          singleTarget: true,
        },
      },
    ],
    hooks: {
      modifyXpGain(value, self, action) {
        return action.id === "ji" ? BALANCE.heroes.dancer.jiXpGain : value;
      },
      onDealDamage(self, target, context) {
        if (context.damage <= 0) return;
        setStatus(target, {
          id: "dancer-force-ji",
          type: "negative",
          name: "迷步",
          text: "下回合强制 Ji",
          turns: BALANCE.heroes.dancer.forceJiTurns,
          fresh: true,
        });
        context.notes.push(`${target.label}被${self.label}击中，下回合强制出 Ji。`);
      },
    },
  },
  assassin: {
    id: "assassin",
    name: "刺客 Assassin",
    maxHp: BALANCE.heroes.assassin.maxHp,
    startingXp: BALANCE.startingXp,
    description: `高爆发脆皮英雄，最具代表性的英雄之一`,
    passives: [{ name: "疾蓄", text: `Ji 获得 ${BALANCE.heroes.assassin.jiXpGain} XP` }],
    activeSkills: [
      {
        id: "assassin-sneak",
        kind: "skill",
        name: "潜行",
        cost: BALANCE.heroes.assassin.sneakCost,
        power: 0,
        defense: BALANCE.defenseGrades.medium,
        xpGain: 0,
        text: `花费 ${BALANCE.heroes.assassin.sneakCost}，本回合带中防；下回合移动阶段可额外移动 1 格`,
        effects: {
          assassinSneak: true,
        },
      },
    ],
    hooks: {
      modifyXpGain(value, self, action) {
        return action.id === "ji" ? BALANCE.heroes.assassin.jiXpGain : value;
      },
      afterRound(self, opponent, context) {
        if (!context.selfAction.effects?.assassinSneak) return;
        setStatus(self, {
          id: "assassin-sneak",
          type: "positive",
          name: "潜行",
          text: "下回合移动 +1",
          turns: 1,
          fresh: true,
        });
        context.notes.push(`${self.label}进入潜行，下回合开始前可以额外移动一次。`);
      },
    },
  },
  vampire: {
    id: "vampire",
    name: "吸血鬼 Vampire",
    maxHp: BALANCE.heroes.vampire.maxHp,
    startingXp: BALANCE.startingXp,
    description: `肉盾克星，传统吸血角色`,
    passives: [{ name: "吸血", text: `造成伤害后回复 ${BALANCE.heroes.vampire.healPerDamage} HP` }],
    activeSkills: [],
    hooks: {
      onDealDamage(self, target, context) {
        const beforeHp = self.hp;
        self.hp = Math.min(self.maxHp, self.hp + BALANCE.heroes.vampire.healPerDamage * context.damage);
        const healed = self.hp - beforeHp;
        if (healed > 0) queueTacticalUnitCue(self, "heal", healed);
        context.notes.push(`${self.label}触发吸血，回复 ${healed} HP，当前 ${formatHearts(self.hp)}。`);
      },
    },
  },
  hunter: {
    id: "hunter",
    name: "猎人 Hunter",
    maxHp: BALANCE.heroes.hunter.maxHp,
    startingXp: BALANCE.startingXp,
    description: "无限追击！",
    passives: [
      { name: "回收", text: "攻击命中返还攻击名义费用；冰刀/火刀未中返 1，鬼刀到9费未中返 2，10费未中返 3" },
    ],
    activeSkills: [
      {
        id: "hunter-precision-shot",
        kind: "attack",
        category: "skill",
        name: "精准狙击",
        cost: BALANCE.heroes.hunter.precisionShotCost,
        power: BALANCE.heroes.hunter.precisionShotPower,
        range: BALANCE.heroes.hunter.precisionShotRange,
        defense: 0,
        xpGain: 0,
        text: `花费 ${BALANCE.heroes.hunter.precisionShotCost}，攻击强度 ${BALANCE.heroes.hunter.precisionShotPower}，距离 ${BALANCE.heroes.hunter.precisionShotRange}`,
      },
    ],
    hooks: {
      onDealDamage(self, target, context) {
        if (context.damage <= 0 || context.action.kind !== "attack") return;
        const refund = getHunterHitRefund(self, context.action);
        if (refund <= 0) return;
        self.xp += refund;
        context.notes.push(`${self.label}的${context.action.name}命中，返还 ${refund} XP。`);
      },
      afterRound(self, opponent, context) {
        const missedActions = getHunterMissedActions(context);
        for (const action of missedActions) {
          const refund = getHunterMissRefund(action);
          if (refund <= 0) continue;
          self.xp += refund;
          context.notes.push(`${self.label}的${action.name}未命中，返还 ${refund} XP。`);
        }
      },
    },
  },
  ninja: {
    id: "ninja",
    name: "忍者 Ninja",
    maxHp: BALANCE.heroes.ninja.maxHp,
    startingXp: BALANCE.startingXp,
    description: "用手里剑制造致盲，并借隐身拖入自己的节奏。",
    passives: [{ name: "手里剑", text: "每造成 1 点伤害获得 1 把手里剑；手里剑命中致盲 2 回合，未命中后 2 回合小防" }],
    activeSkills: [
      {
        id: "ninja-shuriken",
        kind: "attack",
        category: "skill",
        name: "手里剑",
        cost: 0,
        power: BALANCE.heroes.ninja.shurikenPower,
        range: 1,
        defense: 0,
        xpGain: 0,
        text: `消耗 1 把手里剑，攻击强度 ${BALANCE.heroes.ninja.shurikenPower}；命中致盲 ${BALANCE.heroes.ninja.blindTurns} 回合并重获手里剑，未命中后 ${BALANCE.heroes.ninja.blindTurns} 回合小防`,
        effects: {
          shuriken: true,
        },
      },
      {
        id: "ninja-stealth",
        kind: "skill",
        name: "隐身",
        cost: BALANCE.heroes.ninja.stealthCost,
        power: 0,
        defense: 0,
        xpGain: 0,
        text: `花费 ${BALANCE.heroes.ninja.stealthCost}，获得 ${BALANCE.heroes.ninja.stealthTurns} 回合隐形；贴近敌人或主动攻击会暴露，并将剩余回合转为小防`,
        effects: {
          stealth: true,
        },
      },
    ],
    hooks: {
      init(self) {
        self.flags.shuriken = 0;
      },
      canUseAction(action, self) {
        return action.id !== "ninja-shuriken" || (self.flags.shuriken || 0) > 0;
      },
      modifyDefense(value, self) {
        return hasEffectiveStatus(self, "ninja-stealth-guard") || hasEffectiveStatus(self, "ninja-shuriken-guard")
          ? Math.max(value, BALANCE.defenseGrades.small)
          : value;
      },
      onDealDamage(self, target, context) {
        if (context.damage <= 0) return;
        self.flags.shuriken = (self.flags.shuriken || 0) + context.damage;
        context.notes.push(`${self.label}造成 ${context.damage} 点伤害，获得 ${context.damage} 把手里剑。`);
        if (!context.action.effects?.shuriken) return;
        setStatus(target, {
          id: "ninja-blind",
          type: "negative",
          name: "致盲",
          text: `${BALANCE.heroes.ninja.blindTurns} 回合`,
          turns: BALANCE.heroes.ninja.blindTurns,
          fresh: true,
        });
        context.notes.push(`${target.label}被手里剑致盲，${BALANCE.heroes.ninja.blindTurns} 回合内只能选择自己。`);
      },
      afterRound(self, opponent, context) {
        if (context.selfAction.id === "ninja-shuriken") {
          self.flags.shuriken = Math.max(0, (self.flags.shuriken || 0) - 1);
          if (context.hit) {
            self.flags.shuriken += 1;
          } else {
            setStatus(self, {
              id: "ninja-shuriken-guard",
              type: "positive",
              name: "手里剑架防",
              text: `${BALANCE.heroes.ninja.blindTurns} 回合小防`,
              turns: BALANCE.heroes.ninja.blindTurns,
              fresh: true,
            });
            context.notes.push(`${self.label}手里剑未命中，接下来 ${BALANCE.heroes.ninja.blindTurns} 回合获得小防。`);
          }
        }
        if (context.selfAction.effects?.stealth) {
          setStatus(self, {
            id: "ninja-stealth",
            type: "positive",
            name: "隐身",
            text: `${BALANCE.heroes.ninja.stealthTurns} 回合隐形`,
            turns: BALANCE.heroes.ninja.stealthTurns,
            fresh: true,
          });
          context.notes.push(`${self.label}进入隐身，只有距离 1 的敌人能发现其位置。`);
        }
      },
    },
  },
  puppet: {
    id: "puppet",
    name: "木偶 Puppet",
    maxHp: BALANCE.heroes.puppet.maxHp,
    startingXp: BALANCE.startingXp,
    description: "有生命值护盾和一次待机复活能力。",
    passives: [
      { name: "生命盾", text: "开局自带 1 层生命盾，抵挡 1 点伤害；盾破后 +1 XP" },
      { name: "待机", text: "限定技：死亡后下回合进入待机，3 回合内储备生命未耗尽则复活" },
    ],
    activeSkills: [
      {
        id: "puppet-shield",
        kind: "skill",
        name: "放盾",
        cost: BALANCE.heroes.puppet.shieldCost,
        power: 0,
        defense: BALANCE.defenseGrades.mid,
        xpGain: 0,
        text: `花费 ${BALANCE.heroes.puppet.shieldCost}，盾被击爆后第 ${BALANCE.heroes.puppet.shieldCooldown} 回合及以后可用；最多 1 盾，本回合中防`,
        effects: {
          puppetShield: true,
        },
      },
    ],
    hooks: {
      init(self) {
        self.flags.puppetShield = 1;
        self.flags.puppetShieldBrokenRound = 0;
        self.flags.puppetStandbyUsed = false;
        self.flags.puppetStandbyHp = 0;
      },
      canUseAction(action, self) {
        if (action.id !== "puppet-shield") return true;
        return !self.flags.puppetShield
          && self.flags.puppetShieldBrokenRound > 0
          && state.round - self.flags.puppetShieldBrokenRound >= BALANCE.heroes.puppet.shieldCooldown;
      },
      beforeTakeDamage(self, attacker, context) {
        if (self.flags.puppetStandby && context.damage > 0) {
          self.flags.puppetStandbyHp = Math.max(0, (self.flags.puppetStandbyHp || 0) - context.damage);
          context.notes.push(`${self.label}待机储备生命 -${context.damage}，剩余 ${self.flags.puppetStandbyHp}。`);
          return 0;
        }
        if (self.flags.puppetShield > 0 && context.damage > 0) {
          self.flags.puppetShield = 0;
          self.flags.puppetShieldBrokenRound = state.round;
          self.xp += BALANCE.heroes.puppet.shieldXpGain;
          context.damage -= 1;
          context.notes.push(`${self.label}的生命盾抵挡 1 点伤害并破裂，${self.label} +${BALANCE.heroes.puppet.shieldXpGain} XP。`);
        }
        return context.damage;
      },
      afterTakeDamage(self, attacker, context) {
        if (self.hp > 0 || self.flags.puppetStandbyUsed || self.flags.puppetPendingStandby || self.flags.puppetStandby) return;
        self.flags.puppetStandbyUsed = true;
        self.flags.puppetPendingStandby = true;
        context.notes.push(`${self.label}被击杀，限定技触发：下回合进入待机状态。`);
      },
      afterRound(self, opponent, context) {
        if (context.selfAction.effects?.puppetShield && !self.flags.puppetShield) {
          self.flags.puppetShield = 1;
          markRoundPositiveEffect(self, "生命盾");
          context.notes.push(`${self.label}重新放置 1 层生命盾。`);
        }
      },
    },
  },
  vaingloriousWarrior: {
    id: "vaingloriousWarrior",
    name: "虚荣勇士 Vainglorious Warrior",
    maxHp: BALANCE.heroes.vaingloriousWarrior.maxHp,
    startingXp: BALANCE.heroes.vaingloriousWarrior.startingXp,
    description: `起手强势英雄，限制脆皮发育`,
    passives: [
      { name: "虚荣", text: `开局自带${BALANCE.heroes.vaingloriousWarrior.startingXp} XP` },
      { name: "凯旋入场", text: "每次进入据点时获得 1 XP" },
    ],
    activeSkills: [],
    hooks: {},
  },
  werewolf: {
    id: "werewolf",
    name: "狼人 Werewolf",
    maxHp: BALANCE.heroes.werewolf.maxHp,
    startingXp: BALANCE.startingXp,
    description: `也许下一秒就会狂暴...`,
    passives: [{ name: "觉醒技", text: `一旦血量小于2，进入狂暴模式，接下来${BALANCE.heroes.werewolf.invincibleRounds} 回合无敌，1 Ji = ${BALANCE.heroes.werewolf.berserkJiXpGain}XP，伤害 x${BALANCE.heroes.werewolf.berserkDamageMultiplier}` }],
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
    description: `寒冰法师，冷不丁释放暴击 `,
    passives: [
      { name: "寒冰碎片", text: `开局 ${BALANCE.heroes.iceSorcerer.startingShards} 个，满 ${BALANCE.heroes.iceSorcerer.critThreshold} 暴击回血` },
      { name: "冰甲", text: `冰刀花费 ${BALANCE.heroes.iceSorcerer.discountedAttackCost}，来袭冰刀强度视为 ${BALANCE.heroes.iceSorcerer.incomingAttackPower}` },
    ],
    activeSkills: [
      {
        id: "ice-dagger",
        kind: "attack",
        category: "skill",
        name: "Ji刀",
        cost: 0,
        power: BALANCE.heroes.iceSorcerer.daggerPower,
        range: 1,
        defense: 0,
        xpGain: 0,
        magicalAttack: true,
        gunnerSpellKey: "ice-dagger",
        gunnerSpellName: "Ji刀",
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
          if (healed > 0) queueTacticalUnitCue(self, "heal", healed);
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
  mage: {
    id: "mage",
    name: "法师 Mage",
    maxHp: BALANCE.heroes.mage.maxHp,
    startingXp: BALANCE.startingXp,
    description: "通过防御积攒雷电碎片，并用闪电制造连锁打击。",
    passives: [
      { name: "雷电碎片", text: `Ji 获得 ${BALANCE.heroes.mage.jiXpGain} XP；每次使用防御获得 1 个⚡` },
    ],
    activeSkills: [
      {
        id: "mage-lightning",
        kind: "skill",
        category: "skill",
        name: "闪电",
        cost: 0,
        power: BALANCE.heroes.mage.lightningPower,
        range: BALANCE.heroes.mage.lightningRange,
        defense: BALANCE.defenseGrades.small,
        xpGain: 0,
        magicalAttack: true,
        gunnerSpellKey: "mage-lightning",
        gunnerSpellName: "闪电",
        text: `消耗 ${BALANCE.heroes.mage.lightningShardCost}⚡，距离 ${BALANCE.heroes.mage.lightningRange}，冰刀大小；未击中时以目标为来源向其 ${BALANCE.heroes.mage.lightningSplashRange} 格内敌方溅射 Ji刀，本回合小防`,
        effects: {
          mageLightning: true,
          lightningShardCost: BALANCE.heroes.mage.lightningShardCost,
        },
      },
      {
        id: "mage-thunder-strike",
        kind: "skill",
        category: "skill",
        name: "雷击",
        cost: 0,
        power: 0,
        range: BALANCE.heroes.mage.thunderStrikeRange,
        defense: 0,
        xpGain: 0,
        magicalAttack: true,
        gunnerSpellKey: "mage-thunder-strike",
        gunnerSpellName: "雷击",
        text: `消耗 ${BALANCE.heroes.mage.thunderStrikeShardCost}⚡，距离 ${BALANCE.heroes.mage.thunderStrikeRange}，强度 ${BALANCE.heroes.mage.thunderStrikePower}`,
        effects: {
          skillAttack: true,
          skillAttackPower: BALANCE.heroes.mage.thunderStrikePower,
          lightningShardCost: BALANCE.heroes.mage.thunderStrikeShardCost,
        },
      },
    ],
    hooks: {
      init(self) {
        self.flags.lightningShards = 0;
      },
      canUseAction(action, self) {
        const shardCost = action.effects?.lightningShardCost || 0;
        return shardCost <= 0 || (self.flags.lightningShards || 0) >= shardCost;
      },
      modifyXpGain(value, self, action) {
        return action.id === "ji" ? BALANCE.heroes.mage.jiXpGain : value;
      },
      afterRound(self, opponent, context) {
        const shardCost = context.selfAction.effects?.lightningShardCost || 0;
        if (shardCost > 0) {
          self.flags.lightningShards = Math.max(0, (self.flags.lightningShards || 0) - shardCost);
          context.notes.push(`${self.label}消耗 ${shardCost} 个雷电碎片，剩余 ${self.flags.lightningShards}⚡。`);
        }
        if (context.selfAction.kind === "defense") {
          self.flags.lightningShards = (self.flags.lightningShards || 0) + 1;
          context.notes.push(`${self.label}通过防御积攒 1 个雷电碎片，当前 ${self.flags.lightningShards}⚡。`);
        }
      },
    },
  },
  astrologer: {
    id: "astrologer",
    name: "占星家 Astrologer",
    maxHp: BALANCE.heroes.astrologer.maxHp,
    startingXp: BALANCE.startingXp,
    description: `控场角色，拥有强大的续航能力`,
    passives: [{ name: "星蚀", text: `鬼刀造成伤害后回复 ${BALANCE.heroes.astrologer.ghostHealPerDamage} HP` }],
    activeSkills: [
      {
        id: "astrologer-predict",
        kind: "skill",
        name: "预判",
        cost: BALANCE.heroes.astrologer.predictionCost,
        power: 0,
        range: 2,
        defense: BALANCE.defenseGrades.small,
        xpGain: 0,
        text: `花费 ${BALANCE.heroes.astrologer.predictionCost}，选择距离 2 内目标；本回合小防，下回合鬼刀追踪目标并继续小防`,
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
        if (context.action.id !== "atk-5" && !context.action.allowAstrologerGhostHeal) return;
        const beforeHp = self.hp;
        self.hp = Math.min(self.maxHp, self.hp + BALANCE.heroes.astrologer.ghostHealPerDamage * context.damage);
        const healed = self.hp - beforeHp;
        if (healed > 0) queueTacticalUnitCue(self, "heal", healed);
        context.notes.push(`${self.label}的鬼刀吸血，回复 ${healed} HP，当前 ${formatHearts(self.hp)}。`);
      },
      afterRound(self, opponent, context) {
        if (!context.selfAction.effects?.prediction || context.selfAction.tacticalMiss) return;
        const target = context.selfAction.tacticalTarget || opponent;
        setStatus(self, {
          id: "astrologer-prediction",
          name: "预判",
          text: `追踪${target.label}，下回合鬼刀，小防`,
          turns: 1,
          fresh: true,
          effects: { trackedTarget: target },
        });
        context.notes.push(`${self.label}完成预判：下回合鬼刀将追踪${target.label}，并获得小防。`);
      },
    },
  },

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
  balancedBot: {
    id: "balancedBot",
    name: "平衡bot",
    maxHp: BALANCE.heroes.balancedBot.maxHp,
    startingXp: BALANCE.startingXp,
    description: `稳定型英雄，每次 Ji 获得 ${BALANCE.heroes.balancedBot.jiXpGain} XP。`,
    passives: [{ name: "均衡", text: `Ji 获得 ${BALANCE.heroes.balancedBot.jiXpGain} XP` }],
    activeSkills: [],
    hooks: {
      modifyXpGain(value, self, action) {
        return action.id === "ji" ? BALANCE.heroes.balancedBot.jiXpGain : value;
      },
    },
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

      woodendummy:{
    id: "woodendummy",
    name: "wood",
    maxHp: 20,
    startingXp: 0,
    description: "不会还手的木桩子，用于测试",
    passives: [],
    activeSkills: [],
    hooks: {
      modifyXpGain(value, self, action) {
        return action.id === "ji" ? BALANCE.heroes.woodendummy.jiXpGain : value;
      },
    },
  },
  guard: {
    id: "guard",
    name: "铁壁",
    maxHp: BALANCE.heroes.guard.maxHp,
    startingXp: BALANCE.startingXp,
    description: `所有防御手势的防御值 +${BALANCE.heroes.guard.defenseBonus}；战术地图中位于薄墙附近时，短攻强度 +${BALANCE.heroes.guard.thinWallAttackBonus}。`,
    passives: [
      { name: "铁壁", text: `防御值 +${BALANCE.heroes.guard.defenseBonus}` },
      { name: "墙斗", text: `位于薄墙附近时，短攻强度 +${BALANCE.heroes.guard.thinWallAttackBonus}` },
    ],
    activeSkills: [
      {
        id: "guard-build-wall",
        kind: "skill",
        category: "skill",
        name: "筑墙",
        cost: BALANCE.heroes.guard.buildWallCost,
        defense: BALANCE.heroes.guard.buildWallDefense,
        range: 1,
        xpGain: 0,
        text: `花费 ${BALANCE.heroes.guard.buildWallCost}，选择相邻 1 格，在两格之间建造持续 ${BALANCE.heroes.guard.buildWallDuration} 回合的薄墙；本回合防御 ${BALANCE.heroes.guard.buildWallDefense}`,
        effects: { buildThinWall: true },
      },
    ],
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
};

const HERO_AVATARS = window.JiHeroRegistry?.avatars || {};

const STORAGE_KEYS = {
  playerName: "clapDuel.playerName",
  matchHistory: "clapDuel.matchHistory.v1",
  heroSelection: "clapDuel.heroSelection.v1",
  pharmacistLoadout: "clapDuel.pharmacistLoadout.v1",
  elfLoadout: "clapDuel.elfLoadout.v1",
};
const DEFAULT_PLAYER_NAME = "玩家";
const MAX_HISTORY_RECORDS = 200;
const SKILL_ANIMATION_TYPES = {
  "priest-shield": "shield-skill",
  "priest-heal": "heal",
  "ice-dagger": "ice",
  "astrologer-predict": "star",
  "astrologer-drain": "drain",
  "ninja-shuriken": "attack",
  "ninja-stealth": "shield-skill",
  "puppet-shield": "shield-skill",
  "gunner-cannon": "attack",
  "gunner-machine-gun": "attack",
};

const state = {
  round: 1,
  over: false,
  matchRecorded: false,
  player: null,
  enemy: null,
  mode: "cpu",
  pendingEndChoice: null,
  heroPickerTarget: "",
  pharmacistLoadoutCollapsed: false,
  melee: {
    fighters: [],
    openTargetId: "",
    selectionKind: "",
    targetSelections: new Map(),
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
  historyBtn: document.querySelector("#historyBtn"),
  fighterGrid: document.querySelector(".fighter-grid"),
  standardActionGroups: document.querySelectorAll(".control-panel > .action-group"),
  playerSideLabel: document.querySelector("#playerSideLabel"),
  enemySideLabel: document.querySelector("#enemySideLabel"),
  playerName: document.querySelector("#playerName"),
  playerHero: document.querySelector("#playerHero"),
  enemyHero: document.querySelector("#enemyHero"),
  enemyBHero: document.querySelector("#enemyBHero"),
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
  playerEffects: document.querySelector("#playerEffects"),
  enemyEffects: document.querySelector("#enemyEffects"),
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
  pharmacistLoadoutPanel: document.querySelector("#pharmacistLoadoutPanel"),
  pharmacistLoadoutCollapse: document.querySelector("#pharmacistLoadoutCollapse"),
  pharmacistLoadoutOptions: document.querySelector("#pharmacistLoadoutOptions"),
  meleeModeBtn: document.querySelector("#meleeModeBtn"),
  meleePanel: document.querySelector("#meleePanel"),
  meleeGrid: document.querySelector("#meleeGrid"),
  meleeStatus: document.querySelector("#meleeStatus"),
  meleeControl: document.querySelector("#meleeControl"),
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
  heroPicker: document.querySelector("#heroPicker"),
  heroPickerClose: document.querySelector("#heroPickerClose"),
  heroPickerTitle: document.querySelector("#heroPickerTitle"),
  heroPickerMeta: document.querySelector("#heroPickerMeta"),
  heroPickerGrid: document.querySelector("#heroPickerGrid"),
  manualDetail: document.querySelector("#manualDetail"),
  manualClose: document.querySelector("#manualClose"),
  historyDetail: document.querySelector("#historyDetail"),
  historyClose: document.querySelector("#historyClose"),
  historyMeta: document.querySelector("#historyMeta"),
  historySummary: document.querySelector("#historySummary"),
  historyList: document.querySelector("#historyList"),
  clearHistoryBtn: document.querySelector("#clearHistoryBtn"),
};

function makeFighter(label, heroId, options = {}) {
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
  if (heroId === "pharmacist") {
    fighter.flags.pharmacistLoadout = normalizePharmacistLoadout(options.pharmacistLoadout);
  }
  if (heroId === "elf") {
    fighter.flags.elfLoadout = normalizeElfLoadout(options.elfLoadout);
  }
  runHook(fighter, "init", fighter);
  return fighter;
}

function getCurrentPlayerName() {
  return normalizePlayerName(ui.playerName?.value || readStorage(STORAGE_KEYS.playerName) || DEFAULT_PLAYER_NAME);
}

function normalizePlayerName(value) {
  const name = String(value || "").trim().replace(/\s+/g, " ");
  return name.slice(0, 16) || DEFAULT_PLAYER_NAME;
}

function initializePlayerName() {
  ui.playerName.value = getCurrentPlayerName();
}

function savePlayerName() {
  const name = getCurrentPlayerName();
  ui.playerName.value = name;
  writeStorage(STORAGE_KEYS.playerName, name);
  if (state.player && state.mode !== "melee") {
    state.player.label = name;
    ui.playerSideLabel.textContent = name;
  }
  if (state.mode === "melee") {
    const player = getMeleePlayer();
    if (player) player.label = name;
  }
  render();
}

function resetGame() {
  state.round = 1;
  state.over = false;
  state.matchRecorded = false;
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
  const playerName = getCurrentPlayerName();
  state.player = makeFighter(playerName, ui.playerHero.value, { pharmacistLoadout: getPlayerPharmacistLoadout() });
  state.enemy = makeFighter("电脑", ui.enemyHero.value);
  state.melee.fighters = [];
  state.melee.openTargetId = "";
  state.melee.selectionKind = "";
  state.melee.targetSelections = new Map();
  ui.playerSideLabel.textContent = playerName;
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
    const enemyBOption = new Option(getHeroDisplayName(hero), hero.id);
    ui.playerHero.add(playerOption);
    ui.enemyHero.add(enemyOption);
    ui.enemyBHero.add(enemyBOption);
  }
  const saved = readHeroSelection();
  setHeroSelectValue(ui.playerHero, saved.playerHero, "classic");
  setHeroSelectValue(ui.enemyHero, saved.enemyHero, "guard");
  setHeroSelectValue(ui.enemyBHero, saved.enemyBHero, "classic");
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
  renderHeroAvatar(ui.playerAvatar, player);
  renderHeroAvatar(ui.enemyAvatar, enemy);
  renderHeroSummary(ui.playerHeroText, player.hero);
  renderHeroSummary(ui.enemyHeroText, enemy.hero);
  renderSkillActions(player);
  renderPassivePanel(player, ui.playerPassivePanel, ui.playerPassives);
  renderPassivePanel(enemy, ui.enemyPassivePanel, ui.enemyPassives);
  renderPharmacistLoadoutPanel();

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
  ui.playerCard.classList.toggle("is-selectable", state.mode !== "online");
  ui.enemyCard.classList.toggle("is-selectable", state.mode !== "online");
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
    group.hidden = state.mode === "melee" || (group.id === "skillGroup" && getHeroActions(player).length === 0);
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
  const skills = getHeroActions(fighter);
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

function renderPharmacistLoadoutPanel() {
  const show = ui.playerHero.value === "pharmacist" && state.mode !== "online" && !state.pharmacistLoadoutCollapsed;
  ui.pharmacistLoadoutPanel.hidden = !show;
  if (!show) return;

  const selected = getPlayerPharmacistLoadout();
  ui.pharmacistLoadoutOptions.innerHTML = "";
  for (const option of PHARMACIST_LOADOUT_OPTIONS) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "loadout-card";
    button.classList.toggle("is-selected", selected.includes(option.id));
    button.innerHTML = `<strong>${option.name}</strong><span>${option.text}</span>`;
    button.addEventListener("click", () => togglePlayerPharmacistLoadout(option.id));
    ui.pharmacistLoadoutOptions.append(button);
  }
}

function togglePlayerPharmacistLoadout(optionId) {
  const selected = getPlayerPharmacistLoadout();
  const index = selected.indexOf(optionId);
  if (index >= 0) {
    if (selected.length <= BALANCE.heroes.pharmacist.loadoutSize) return;
    selected.splice(index, 1);
  } else {
    selected.push(optionId);
    while (selected.length > BALANCE.heroes.pharmacist.loadoutSize) {
      selected.shift();
    }
  }
  savePlayerPharmacistLoadout(selected);
  state.pharmacistLoadoutCollapsed = true;
  restartAfterHeroSelection();
}

function renderPassivePanel(fighter, panel, list) {
  const entries = getFighterStatusEntries(fighter);
  list.innerHTML = "";
  panel.hidden = entries.length === 0;

  for (const entry of entries) {
    const tag = document.createElement("span");
    tag.className = "status-tag";
    tag.textContent = formatStatusTag(entry, fighter);
    tag.title = entry.text ? `${entry.name}：${entry.text}` : entry.name;
    list.append(tag);
    if (entry.id === "pharmacist-loadout" && fighter === state.player && state.mode !== "online") {
      tag.classList.add("is-interactive");
      tag.title = `${tag.title}。点击修改配药`;
      tag.addEventListener("click", (event) => {
        event.stopPropagation();
        state.pharmacistLoadoutCollapsed = false;
        render();
      });
    }
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

function renderHeroAvatar(container, fighterOrHero) {
  const hero = fighterOrHero.hero || fighterOrHero;
  const isFighter = Boolean(fighterOrHero.hero);
  const isOut = isFighter && isFighterDefeated(fighterOrHero);
  container.innerHTML = "";
  container.title = `查看${getHeroDisplayName(hero)}技能`;
  container.classList.toggle("is-out", isOut);
  const avatar = getHeroAvatarSource(fighterOrHero);
  if (!avatar) {
    const fallback = document.createElement("span");
    fallback.textContent = "❓";
    container.append(fallback);
    if (isFighter) appendAvatarEffectBadges(container, fighterOrHero);
    if (isOut) appendOutOverlay(container);
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
    if (isFighter) appendAvatarEffectBadges(container, fighterOrHero);
    if (isOut) appendOutOverlay(container);
  };
  container.append(image);
  if (isFighter) appendAvatarEffectBadges(container, fighterOrHero);
  if (isOut) appendOutOverlay(container);
}

function getHeroAvatarSource(fighterOrHero) {
  const hero = fighterOrHero.hero || fighterOrHero;
  if (hero.id === "werewolf" && fighterOrHero.flags?.berserk) {
    return HERO_AVATARS.werewolfBerserk;
  }
  return HERO_AVATARS[hero.id];
}

function appendOutOverlay(container) {
  const overlay = document.createElement("span");
  overlay.className = "out-overlay";
  overlay.textContent = "OUT";
  container.append(overlay);
}

function appendAvatarEffectBadges(container, fighter) {
  const badges = getAvatarEffectBadges(fighter);
  if (!badges.length) return;
  const rail = document.createElement("span");
  rail.className = "avatar-effect-badges";
  for (const badge of badges) {
    const item = document.createElement("span");
    item.className = `avatar-effect-badge ${badge.type}`;
    item.textContent = badge.label;
    item.title = badge.title;
    rail.append(item);
  }
  container.append(rail);
}

function getAvatarEffectBadges(fighter) {
  if (!fighter?.flags) return [];
  const positive = new Set(fighter.flags.roundPositiveEffects || []);
  const negative = new Set();
  for (const status of fighter.statuses || []) {
    if (status.type === "positive" || status.id === "pharmacist-invincible") positive.add(status.name);
    if (status.type === "negative") negative.add(status.name);
  }
  const badges = [];
  if (positive.size) {
    badges.push({ type: "positive", label: "益", title: `正面效果：${Array.from(positive).join(" / ")}` });
  }
  if (negative.size) {
    badges.push({ type: "negative", label: "损", title: `负面效果：${Array.from(negative).join(" / ")}` });
  }
  return badges;
}

function formatStatusTag(entry, fighter = null) {
  if (!entry.text) return entry.name;
  if ((fighter?.hero?.passives || []).includes(entry)) return entry.name;
  if (entry.name === "寒冰碎片" && entry.text.includes("🧊")) return entry.text.replace(/\s+/g, "");
  if (entry.name === "烈焰炫纹" && entry.text.includes("🔥")) return entry.text.replace(/\s+/g, "");
  if (entry.name === "雷电碎片" && entry.text.includes("⚡")) return entry.text.replace(/\s+/g, "");
  if (entry.name === "寒冰碎片") return "碎片机制";
  if (entry.name === "炮台") return entry.text === "未装填" ? "炮台未装填" : `炮台 ${entry.text}`;
  if (entry.name === "手里剑") return `手里剑 ${entry.text}`;
  if (entry.name === "生命盾") return `盾：${entry.text}`;
  if (entry.name === "待机储备") return `${entry.name} ${entry.text}`;
  if (entry.name === "Ji 连击" || entry.name === "Ji刀连出") return `${entry.name} ${entry.text}`;
  if (entry.text.includes("回合")) return `${entry.name} ${entry.text}`;
  return entry.name;
}

function openHeroDetail(fighter) {
  const hero = fighter.hero;
  ui.heroDetailTitle.textContent = getHeroDisplayName(hero);
  ui.heroDetailMeta.textContent = hero.startingXp > 0
    ? `${fighter.startingHp}血，开局 ${hero.startingXp} XP`
    : `${fighter.startingHp}血`;
  ui.heroDetailBody.innerHTML = "";
  renderHeroAvatar(ui.heroDetailAvatar, hero);

  appendHeroLoreSection(hero);

  appendDetailSection("被动", getHeroDetailPassiveEntries(fighter), "无被动");
  appendDetailSection("主动技能", getHeroDetailSkillEntries(fighter), "无主动技能");

  const liveEntries = getFighterStatusEntries(fighter).filter((entry) => !(hero.passives || []).includes(entry));
  if (liveEntries.length) appendDetailSection("当前状态", liveEntries, "");
  ui.heroDetail.hidden = false;
}

function appendHeroLoreSection(hero) {
  const section = document.createElement("section");
  section.className = "detail-section detail-lore";
  const heading = document.createElement("h3");
  heading.textContent = "背景故事";
  const text = document.createElement("p");
  text.textContent = getHeroLore(hero);
  section.append(heading, text);
  ui.heroDetailBody.append(section);
}

function getHeroLore(hero) {
  return HERO_LORE[hero.id] || `${getHeroDisplayName(hero)}的来历暂未写入档案。只知道每当夜色贴近牌桌，都会有某种低语提醒他再次出手。`;
}

function getHeroDetailPassiveEntries(fighter) {
  const entries = [...(fighter.hero.passives || [])];
  if (fighter.heroId === "pharmacist") {
    entries.push(...getPharmacistSelectedLoadoutOptions(fighter).filter((option) => option.kind === "passive"));
  }
  return entries;
}

function getHeroDetailSkillEntries(fighter) {
  if (fighter.heroId === "pharmacist") {
    return getPharmacistSelectedLoadoutOptions(fighter).filter((option) => option.kind === "skill");
  }
  return fighter.hero.activeSkills || [];
}

function getPharmacistSelectedLoadoutOptions(fighter) {
  const loadout = fighter.flags.pharmacistLoadout || DEFAULT_PHARMACIST_LOADOUT;
  return loadout
    .map((id) => PHARMACIST_LOADOUT_OPTIONS.find((option) => option.id === id))
    .filter(Boolean);
}

function closeHeroDetail() {
  ui.heroDetail.hidden = true;
}

function openHeroPicker(target) {
  if (state.mode === "online") {
    addLog("在线房间中不能临时切换英雄。");
    return;
  }
  state.heroPickerTarget = target;
  renderHeroPicker();
  ui.heroPicker.hidden = false;
}

function closeHeroPicker() {
  ui.heroPicker.hidden = true;
  state.heroPickerTarget = "";
}

function renderHeroPicker() {
  const target = state.heroPickerTarget || "player";
  const select = getHeroSelectForTarget(target);
  const titleMap = {
    player: "选择你的英雄",
    enemy: "选择电脑A英雄",
    enemyB: "选择电脑B英雄",
  };
  ui.heroPickerTitle.textContent = titleMap[target] || "选择英雄";
  ui.heroPickerMeta.textContent = "点击英雄头像或名称即可切换。";
  ui.heroPickerGrid.innerHTML = "";

  for (const hero of Object.values(HEROES)) {
    const card = document.createElement("button");
    card.className = "hero-pick-card";
    card.type = "button";
    card.classList.toggle("is-selected", select?.value === hero.id);

    const avatar = document.createElement("div");
    avatar.className = "hero-avatar";
    renderHeroAvatar(avatar, hero);
    avatar.removeAttribute("title");

    const name = document.createElement("div");
    name.className = "hero-pick-name";
    name.textContent = getHeroDisplayName(hero);

    card.append(avatar, name, renderHeroPickTooltip(hero));
    card.addEventListener("click", () => applyHeroPickerSelection(hero.id));
    ui.heroPickerGrid.append(card);
  }
}

function renderHeroPickTooltip(hero) {
  const tooltip = document.createElement("div");
  tooltip.className = "hero-pick-tooltip";
  for (const entry of getHeroRuleEntries(hero)) {
    const name = document.createElement("strong");
    name.textContent = entry.name;
    const text = document.createElement("span");
    text.textContent = entry.text || "无额外说明";
    tooltip.append(name, text);
  }
  return tooltip;
}

function getHeroSelectForTarget(target) {
  if (target === "enemy") return ui.enemyHero;
  if (target === "enemyB") return ui.enemyBHero;
  return ui.playerHero;
}

function applyHeroPickerSelection(heroId) {
  const target = state.heroPickerTarget;
  const select = getHeroSelectForTarget(target);
  if (!select || !HEROES[heroId]) return;
  select.value = heroId;
  if (target === "player") state.pharmacistLoadoutCollapsed = false;
  saveHeroSelection();
  closeHeroPicker();
  restartAfterHeroSelection();
}

function restartAfterHeroSelection() {
  if (state.mode === "melee") {
    startMeleeGame();
    return;
  }
  if (state.mode === "cpu") resetGame();
}

function openManualDetail() {
  ui.manualDetail.hidden = false;
}

function closeManualDetail() {
  ui.manualDetail.hidden = true;
}

function openHistoryDetail() {
  renderHistoryDetail();
  ui.historyDetail.hidden = false;
}

function closeHistoryDetail() {
  ui.historyDetail.hidden = true;
}

function renderHistoryDetail() {
  const playerName = getCurrentPlayerName();
  const records = readMatchHistory().filter((record) => record.playerName === playerName);
  const wins = records.filter((record) => record.result === "win").length;
  const losses = records.filter((record) => record.result === "loss").length;
  const draws = records.filter((record) => record.result === "draw").length;
  ui.historyMeta.textContent = `${playerName} 的历史对局`;
  ui.historySummary.innerHTML = "";
  ui.historyList.innerHTML = "";

  for (const stat of [
    ["总局数", records.length],
    ["胜利", wins],
    ["失败", losses],
    ["平局", draws],
  ]) {
    const card = document.createElement("div");
    card.className = "history-stat";
    const label = document.createElement("span");
    label.textContent = stat[0];
    const value = document.createElement("strong");
    value.textContent = stat[1];
    card.append(label, value);
    ui.historySummary.append(card);
  }

  if (!records.length) {
    const empty = document.createElement("article");
    empty.className = "history-card";
    const text = document.createElement("p");
    text.textContent = "当前用户还没有完成的对局。";
    empty.append(text);
    ui.historyList.append(empty);
    return;
  }

  for (const record of records) {
    ui.historyList.append(renderHistoryCard(record));
  }
}

function renderHistoryCard(record) {
  const card = document.createElement("article");
  card.className = "history-card";

  const head = document.createElement("div");
  head.className = "history-card-head";
  const result = document.createElement("div");
  result.className = "history-result";
  result.textContent = `${formatMatchResult(record.result)} ｜ ${record.rounds} 回合`;
  const time = document.createElement("time");
  time.dateTime = record.finishedAt;
  time.textContent = formatHistoryTime(record.finishedAt);
  head.append(result, time);

  const heroes = document.createElement("p");
  heroes.textContent = `英雄：${record.playerHero} vs ${record.opponentHeroes.join("，")}`;
  const mode = document.createElement("p");
  mode.textContent = `模式：${record.modeLabel}`;
  card.append(head, heroes, mode);
  return card;
}

function recordCompletedMatch() {
  if (!state.over || state.matchRecorded) return;
  const record = buildMatchRecord();
  if (!record) return;
  const records = readMatchHistory();
  writeMatchHistory([record, ...records].slice(0, MAX_HISTORY_RECORDS));
  state.matchRecorded = true;
}

function buildMatchRecord() {
  const playerName = getCurrentPlayerName();
  const base = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    playerName,
    finishedAt: new Date().toISOString(),
    rounds: state.round,
  };

  if (state.mode === "melee") {
    const player = getMeleePlayer();
    if (!player) return null;
    const alive = state.melee.fighters.filter((fighter) => !isFighterDefeated(fighter));
    const winner = alive.length === 1 ? alive[0] : null;
    return {
      ...base,
      mode: "melee",
      modeLabel: "混战测试",
      playerHero: getHeroDisplayName(player.hero),
      opponentHeroes: state.melee.fighters
        .filter((fighter) => fighter.id !== player.id)
        .map((fighter) => `${fighter.label}：${getHeroDisplayName(fighter.hero)}`),
      result: isFighterDefeated(player) ? "loss" : winner === player ? "win" : "draw",
    };
  }

  return {
    ...base,
    mode: state.mode,
    modeLabel: state.mode === "online" ? "在线 1v1" : "人机对战",
    playerHero: getHeroDisplayName(state.player.hero),
    opponentHeroes: [`${state.enemy.label}：${getHeroDisplayName(state.enemy.hero)}`],
    result: getDuelResult(),
  };
}

function getDuelResult() {
  if (isFighterDefeated(state.player) && isFighterDefeated(state.enemy)) return "draw";
  if (isFighterDefeated(state.enemy)) return "win";
  if (isFighterDefeated(state.player)) return "loss";
  return "draw";
}

function readMatchHistory() {
  try {
    const raw = readStorage(STORAGE_KEYS.matchHistory);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function writeMatchHistory(records) {
  writeStorage(STORAGE_KEYS.matchHistory, JSON.stringify(records));
}

function readHeroSelection() {
  try {
    const raw = readStorage(STORAGE_KEYS.heroSelection);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    return {};
  }
}

function saveHeroSelection() {
  writeStorage(STORAGE_KEYS.heroSelection, JSON.stringify({
    playerHero: ui.playerHero.value,
    enemyHero: ui.enemyHero.value,
    enemyBHero: ui.enemyBHero.value,
  }));
}

function setHeroSelectValue(select, heroId, fallback) {
  select.value = HEROES[heroId] ? heroId : fallback;
}

function normalizePharmacistLoadout(value) {
  const validIds = PHARMACIST_LOADOUT_OPTIONS.map((option) => option.id);
  const source = Array.isArray(value) ? value : DEFAULT_PHARMACIST_LOADOUT;
  const unique = [];
  for (const id of source) {
    if (validIds.includes(id) && !unique.includes(id)) unique.push(id);
  }
  for (const id of DEFAULT_PHARMACIST_LOADOUT) {
    if (unique.length >= BALANCE.heroes.pharmacist.loadoutSize) break;
    if (!unique.includes(id)) unique.push(id);
  }
  return unique.slice(0, BALANCE.heroes.pharmacist.loadoutSize);
}

function normalizeElfLoadout(value) {
  const validIds = ELF_LOADOUT_OPTIONS.map((option) => option.id);
  const source = Array.isArray(value) ? value : DEFAULT_ELF_LOADOUT;
  const unique = [];
  for (const id of source) {
    if (validIds.includes(id) && !unique.includes(id)) unique.push(id);
  }
  for (const id of DEFAULT_ELF_LOADOUT) {
    if (unique.length >= BALANCE.heroes.elf.loadoutSize) break;
    if (!unique.includes(id)) unique.push(id);
  }
  return unique.slice(0, BALANCE.heroes.elf.loadoutSize);
}

function getPlayerPharmacistLoadout() {
  try {
    const raw = readStorage(STORAGE_KEYS.pharmacistLoadout);
    return normalizePharmacistLoadout(raw ? JSON.parse(raw) : DEFAULT_PHARMACIST_LOADOUT);
  } catch (error) {
    return normalizePharmacistLoadout(DEFAULT_PHARMACIST_LOADOUT);
  }
}

function savePlayerPharmacistLoadout(loadout) {
  writeStorage(STORAGE_KEYS.pharmacistLoadout, JSON.stringify(normalizePharmacistLoadout(loadout)));
}

function getPlayerElfLoadout() {
  try {
    const raw = readStorage(STORAGE_KEYS.elfLoadout);
    return normalizeElfLoadout(raw ? JSON.parse(raw) : DEFAULT_ELF_LOADOUT);
  } catch (error) {
    return normalizeElfLoadout(DEFAULT_ELF_LOADOUT);
  }
}

function savePlayerElfLoadout(loadout) {
  writeStorage(STORAGE_KEYS.elfLoadout, JSON.stringify(normalizeElfLoadout(loadout)));
}

function clearCurrentPlayerHistory() {
  const playerName = getCurrentPlayerName();
  const confirmed = typeof window.confirm === "function"
    ? window.confirm(`清空 ${playerName} 的历史对局？`)
    : true;
  if (!confirmed) return;
  writeMatchHistory(readMatchHistory().filter((record) => record.playerName !== playerName));
  renderHistoryDetail();
}

function readStorage(key) {
  try {
    return window.localStorage?.getItem(key) || "";
  } catch (error) {
    return "";
  }
}

function writeStorage(key, value) {
  try {
    window.localStorage?.setItem(key, value);
  } catch (error) {
    // 本地文件或隐私模式可能禁用 localStorage，游戏本体仍可继续。
  }
}

function formatMatchResult(result) {
  if (result === "win") return "胜利";
  if (result === "loss") return "失败";
  return "平局";
}

function formatHistoryTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "未知时间";
  return date.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
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
  if (fighter.flags.flameChasers !== undefined) {
    entries.push({ name: "烈焰炫纹", text: `${"🔥".repeat(Math.min(fighter.flags.flameChasers, 10))} x${fighter.flags.flameChasers}` });
  }
  if (fighter.flags.lightningShards !== undefined) {
    entries.push({ name: "雷电碎片", text: `${"⚡".repeat(Math.min(fighter.flags.lightningShards, 10))} x${fighter.flags.lightningShards}` });
  }
  if (fighter.flags.iceDaggerStreak > 0) {
    entries.push({ name: "Ji刀连出", text: `${fighter.flags.iceDaggerStreak}/${BALANCE.heroes.iceSorcerer.daggerStreakLimit}` });
  }
  if (fighter.heroId === "gunner") {
    const turrets = getGunnerKnownSpellEntries(fighter)
      .map(({ spec, count }) => `${spec.name} x${count}`)
      .join(" / ");
    entries.push({ name: "炮台", text: turrets || "未装填" });
  }
  if (fighter.flags.shuriken !== undefined) {
    entries.push({ name: "手里剑", text: `x${fighter.flags.shuriken}` });
  }
  if (fighter.heroId === "puppet") {
    entries.push({ name: "生命盾", text: fighter.flags.puppetShield > 0 ? "可抵挡 1 伤害" : "已破裂" });
    if (fighter.flags.puppetStandby) {
      entries.push({ name: "待机储备", text: `${fighter.flags.puppetStandbyHp}/${BALANCE.heroes.puppet.standbyHp}，${fighter.flags.puppetStandbyTurns} 回合` });
    }
  }
  if (fighter.heroId === "pharmacist") {
    const names = (fighter.flags.pharmacistLoadout || DEFAULT_PHARMACIST_LOADOUT)
      .map((id) => PHARMACIST_LOADOUT_OPTIONS.find((option) => option.id === id)?.name)
      .filter(Boolean)
      .join(" / ");
    entries.push({ id: "pharmacist-loadout", name: "配药", text: names || "未选择" });
  }
  for (const status of fighter.statuses) {
    entries.push({ name: status.name, text: status.text || "" });
  }
  return entries;
}

function getHunterHitRefund(fighter, action) {
  if (action.kind !== "attack") return 0;
  return action.cost || 0;
}

function getHunterMissRefund(action) {
  return BALANCE.heroes.hunter.missRefunds[action.id] || 0;
}

function getHunterMissedActions(context) {
  if (Array.isArray(context.missedActions)) return context.missedActions;
  const action = context.selfAction;
  return action?.kind === "attack" && !context.hit ? [action] : [];
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
  playRoundAnimations(report.animations || []);

  const pendingChoice = state.over ? null : applyAutomaticEndChoices(report.endChoices || []);
  if (pendingChoice && !state.over) {
    state.pendingEndChoice = pendingChoice;
    render();
    return;
  }

  recordCompletedMatch();
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
  state.matchRecorded = false;
  state.pendingEndChoice = null;
  const playerName = getCurrentPlayerName();
  state.player = makeFighter(playerName, ui.playerHero.value, { pharmacistLoadout: getPlayerPharmacistLoadout() });
  state.enemy = makeFighter("电脑A", ui.enemyHero.value);
  clearMeleeTargeting(true);
  state.melee.fighters = [
    makeMeleeFighter("p1", playerName, ui.playerHero.value, true, { pharmacistLoadout: getPlayerPharmacistLoadout() }),
    makeMeleeFighter("ai-a", "电脑A", ui.enemyHero.value, false),
    makeMeleeFighter("ai-b", "电脑B", ui.enemyBHero.value, false),
  ];
  closeMeleeAttackAllocator();
  ui.battleLog.innerHTML = "";
  updateRoomStatus("当前：混战测试（1 真人 + 2 电脑）");
  addLog("混战开局：各自为战，攻击可拆分给多个目标。");
  render();
}

function makeMeleeFighter(id, label, heroId, controlled, options = {}) {
  const fighter = makeFighter(label, heroId, options);
  fighter.id = id;
  fighter.controlled = controlled;
  fighter.lastSummary = "等待出手";
  return fighter;
}

function renderMelee() {
  const fighters = state.melee.fighters;
  ui.meleeGrid.innerHTML = "";
  ui.meleeControl.hidden = true;
  const player = fighters.find((fighter) => fighter.controlled);
  const opponents = fighters.filter((fighter) => !fighter.controlled);
  if (player) {
    const playerRow = document.createElement("div");
    playerRow.className = "melee-player-row";
    playerRow.append(createMeleeFighterCard(player));
    ui.meleeGrid.append(playerRow);
  }
  const opponentRow = document.createElement("div");
  opponentRow.className = "melee-opponent-row";
  for (const fighter of opponents) {
    opponentRow.append(createMeleeFighterCard(fighter));
  }
  ui.meleeGrid.append(opponentRow);
  ui.meleeStatus.textContent = state.over ? "混战结束" : "1 真人 + 2 电脑";
}

function createMeleeFighterCard(fighter) {
  const card = document.createElement("article");
  const isPlayer = fighter.controlled;
  const isOpenTarget = state.melee.openTargetId === fighter.id;
  const canOpenDeadTarget = !isPlayer && fighter.hp <= 0 && canMeleePlayerReviveTarget(fighter);
  card.className = `melee-fighter${isFighterDefeated(fighter) ? " is-out" : ""}${isPlayer ? " is-player" : " is-targetable"}${isOpenTarget ? " is-open" : ""}`;
  card.dataset.fighterId = fighter.id;

  const head = document.createElement("div");
  head.className = "melee-card-head";
  const identity = document.createElement("div");
  identity.className = "melee-identity";
  const role = document.createElement("span");
  role.className = "side-label";
  role.textContent = isPlayer ? "玩家" : fighter.label;
  const name = document.createElement("h3");
  name.textContent = getHeroDisplayName(fighter.hero);
  identity.append(role);
  identity.append(name);
  head.append(identity);

  const avatar = document.createElement("button");
  avatar.className = "hero-avatar melee-avatar";
  avatar.type = "button";
  avatar.ariaLabel = `查看${fighter.label}英雄技能`;
  renderHeroAvatar(avatar, fighter);
  avatar.addEventListener("click", (event) => {
    event.stopPropagation();
    openHeroDetail(fighter);
  });
  head.append(avatar);
  if (isPlayer) {
    head.append(createMeleeSubmitDock(fighter));
  }
  card.append(head);

  if (!isPlayer && isOpenTarget && (isFighterTargetable(fighter) || canOpenDeadTarget)) {
    card.addEventListener("click", (event) => {
      if (event.target.closest?.(".melee-target-menu, .hero-avatar")) return;
      toggleMeleeTargetMenu(fighter.id);
    });
    renderMeleeTargetMenu(card, fighter);
    return card;
  }

  const stats = document.createElement("div");
  stats.className = "melee-stat-lines";
  stats.innerHTML = `
    <div><b>HP</b><span>${formatHearts(fighter.hp)}</span></div>
    <div><b>XP</b><span>${fighter.xp}</span></div>
  `;
  card.append(stats);

  const passiveText = getFighterStatusEntries(fighter).map((entry) => formatStatusTag(entry, fighter)).join(" / ");
  const status = document.createElement("div");
  status.className = "melee-stats";
  status.textContent = passiveText || "无被动状态";
  card.append(status);

  if (isPlayer) {
    renderMeleePlayerActions(card, fighter);
  } else if (fighter.hp > 0 || canOpenDeadTarget) {
    card.addEventListener("click", (event) => {
      if (event.target.closest?.(".melee-target-menu, .hero-avatar")) return;
      toggleMeleeTargetMenu(fighter.id);
    });
    renderMeleeTargetSummary(card, fighter);
    if (isOpenTarget) renderMeleeTargetMenu(card, fighter);
  }

  const last = document.createElement("div");
  last.className = "melee-last";
  last.textContent = fighter.lastSummary;
  card.append(last);
  return card;
}

function renderMeleePlayerActions(card, player) {
  const actions = document.createElement("div");
  actions.className = "melee-card-actions";
  for (const action of [ACTION_BY_ID.ji, ...ACTIONS.filter((item) => item.kind === "defense")]) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = action.name;
    button.disabled = state.over || player.hp <= 0 || !canUseAction(player, action);
    button.addEventListener("click", () => submitMeleeBasic(action.id));
    actions.append(button);
  }
  card.append(actions);

  const selections = getMeleeSelections();
  if (!selections.length) return;

  const summary = document.createElement("div");
  summary.className = "melee-selection-summary";
  summary.textContent = `${state.melee.selectionKind === "skill" ? "技能" : "攻击"}：${selections.map((entry) => `${entry.action.name}->${getMeleeFighterLabel(entry.targetId)}`).join("，")}（${getMeleeSelectionCost()} XP）`;
  card.append(summary);
}

function createMeleeSubmitDock(player) {
  const dock = document.createElement("div");
  dock.className = "melee-submit-dock";
  const selections = getMeleeSelections();
  if (!selections.length) {
    dock.classList.add("is-empty");
    return dock;
  }
  const clearButton = document.createElement("button");
  clearButton.type = "button";
  clearButton.textContent = "清空";
  clearButton.addEventListener("click", clearMeleeTargeting);
  const submitButton = document.createElement("button");
  submitButton.type = "button";
  submitButton.textContent = state.melee.selectionKind === "skill" ? "提交技能" : "提交攻击";
  submitButton.disabled = state.over || player.hp <= 0;
  submitButton.addEventListener("click", submitMeleeTargetSelections);
  dock.append(clearButton);
  dock.append(submitButton);
  return dock;
}

function renderMeleeTargetSummary(card, fighter) {
  const selection = state.melee.targetSelections.get(fighter.id);
  if (!selection) return;
  const tag = document.createElement("div");
  tag.className = "melee-selected-tag";
  tag.textContent = `已选：${selection.action.name}`;
  card.append(tag);
}

function renderMeleeTargetMenu(card, target) {
  const player = getMeleePlayer();
  const menu = document.createElement("div");
  menu.className = "melee-target-menu";
  appendMeleeTargetSection(menu, "攻击", getMeleeAttackChoices(player), target, "attack");
  appendMeleeTargetSection(menu, "技能", getMeleeSkillChoices(player), target, "skill");
  card.append(menu);
}

function appendMeleeTargetSection(menu, title, actions, target, kind) {
  const section = document.createElement("section");
  section.className = "melee-target-section";
  const heading = document.createElement("div");
  heading.className = "mini-title";
  heading.textContent = title;
  section.append(heading);

  const grid = document.createElement("div");
  grid.className = "melee-target-actions";
  if (!actions.length) {
    const empty = document.createElement("div");
    empty.className = "melee-empty";
    empty.textContent = "无可用";
    grid.append(empty);
  }
  for (const action of actions) {
    grid.append(createMeleeTargetActionButton(action, target, kind));
  }
  section.append(grid);
  menu.append(section);
}

function createMeleeTargetActionButton(action, target, kind) {
  const player = getMeleePlayer();
  const button = document.createElement("button");
  button.type = "button";
  button.className = `action-card ${kind === "skill" ? "skill" : "attack"}`;
  const selected = state.melee.targetSelections.get(target.id)?.action.id === action.id;
  const incompatible = state.melee.selectionKind && state.melee.selectionKind !== kind;
  const totalIfSelected = getMeleeSelectionCost(target.id) + (selected ? 0 : getCost(player, action));
  button.innerHTML = `<strong>${action.name}</strong><span>${describeAction(action, player)}</span>`;
  button.disabled = state.over || player.hp <= 0 || !canActionTargetFighter(action, target) || incompatible || totalIfSelected > player.xp || !canUseAction(player, action);
  button.classList.toggle("selected", selected);
  button.addEventListener("click", () => toggleMeleeTargetAction(target.id, action.id, kind));
  return button;
}

function getMeleeAttackChoices(player) {
  return ACTIONS.filter((action) => action.kind === "attack" && canUseAction(player, action));
}

function getMeleeSkillChoices(player) {
  return getHeroActions(player).filter((action) => canUseAction(player, action));
}

function canMeleePlayerReviveTarget(target) {
  const player = getMeleePlayer();
  return Boolean(player && target?.hp <= 0 && getHeroActions(player).some((action) => action.effects?.revive && canUseAction(player, action)));
}

function canActionTargetFighter(action, target, actor = getMeleePlayer()) {
  if (action.effects?.revive) return target.hp <= 0;
  return isFighterTargetable(target) && isTargetAllowedByTaunt(actor, action, target) && isTargetAllowedByBlind(actor, action, target);
}

function isTargetAllowedByTaunt(actor, action, target) {
  if (!actor || !target || !isDamageTargetAction(action)) return true;
  const tauntTargetIds = getActiveTauntTargetIds(actor);
  if (!tauntTargetIds.length) return true;
  return tauntTargetIds.includes(target.id);
}

function isDamageTargetAction(action) {
  if (!action) return false;
  return action.kind === "attack" || Boolean(action.effects?.skillAttack || action.effects?.prediction || action.effects?.mageLightning);
}

function isTargetAllowedByBlind(actor, action, target) {
  if (!actor || !target || !isDamageTargetAction(action)) return true;
  if (!hasStatus(actor, "ninja-blind")) return true;
  return actor.id === target.id;
}

function getActiveTauntTargetIds(fighter) {
  const ids = [];
  for (const status of fighter?.statuses || []) {
    const targetId = status.effects?.tauntTargetId;
    if (!targetId) continue;
    const target = state.melee.fighters.find((item) => item.id === targetId && item.hp > 0);
    if (target && !ids.includes(targetId)) ids.push(targetId);
  }
  return ids;
}

function toggleMeleeTargetMenu(targetId) {
  if (state.mode !== "melee" || state.over) return;
  state.melee.openTargetId = state.melee.openTargetId === targetId ? "" : targetId;
  render();
}

function toggleMeleeTargetAction(targetId, actionId, kind) {
  const player = getMeleePlayer();
  const action = getActionById(actionId, player);
  if (!action || !canUseAction(player, action)) return;
  const target = state.melee.fighters.find((fighter) => fighter.id === targetId);
  if (!target || !canActionTargetFighter(action, target, player)) return;
  if (state.melee.selectionKind && state.melee.selectionKind !== kind) return;

  const existing = state.melee.targetSelections.get(targetId);
  if (existing?.action.id === action.id) {
    state.melee.targetSelections.delete(targetId);
  } else {
    state.melee.selectionKind ||= kind;
    if (kind === "skill" && action.effects?.singleTarget) {
      state.melee.targetSelections.clear();
    }
    state.melee.targetSelections.set(targetId, { targetId, action });
  }

  if (!state.melee.targetSelections.size) state.melee.selectionKind = "";
  render();
}

function clearMeleeTargeting(skipRender = false) {
  state.melee.openTargetId = "";
  state.melee.selectionKind = "";
  state.melee.targetSelections = new Map();
  if (state.mode === "melee" && !skipRender) render();
}

function getMeleeSelections() {
  return Array.from(state.melee.targetSelections.values());
}

function getMeleeSelectionCost(excludeTargetId = "") {
  const player = getMeleePlayer();
  return getMeleeSelections()
    .filter((entry) => entry.targetId !== excludeTargetId)
    .reduce((sum, entry) => sum + getCost(player, entry.action), 0);
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
    .map((select) => ({
      targetId: select.dataset.targetId,
      target: state.melee.fighters.find((fighter) => fighter.id === select.dataset.targetId),
      action: getActionById(select.value, player),
    }))
    .filter((entry) => entry.targetId && entry.target && entry.action && canActionTargetFighter(entry.action, entry.target, player));
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

function submitMeleeTargetSelections() {
  if (state.mode !== "melee" || state.over) return;
  const player = getMeleePlayer();
  const selections = getMeleeSelections();
  if (!player || player.hp <= 0 || !selections.length) return;
  const invalid = selections.some((entry) => {
    const target = state.melee.fighters.find((fighter) => fighter.id === entry.targetId);
    return !target || !canActionTargetFighter(entry.action, target, player);
  });
  if (invalid) {
    addLog("当前受到仇恨影响，攻击或伤害技能只能选择仇恨来源。");
    clearMeleeTargeting();
    return;
  }

  const totalCost = getMeleeSelectionCost();
  if (totalCost > player.xp) {
    addLog(`本回合选择需要 ${totalCost} XP，你当前只有 ${player.xp} XP。`);
    return;
  }

  const action = state.melee.selectionKind === "skill"
    ? {
      id: "melee-multiskill",
      kind: "multitarget-skill",
      name: "指向技能",
      cost: totalCost,
      defense: selections.reduce((best, entry) => Math.max(best, getDefense(player, entry.action)), 0),
      xpGain: 0,
      entries: selections,
    }
    : {
      id: "melee-multiattack",
      kind: "multiattack",
      name: "分配攻击",
      cost: totalCost,
      defense: 0,
      xpGain: 0,
      attacks: selections,
    };
  clearMeleeTargeting(true);
  resolveMeleeRound(new Map([[player.id, { fighter: player, action, summaryAction: action }]]));
}

function resolveMeleeRound(playerPlans, options = {}) {
  const fighters = state.melee.fighters.filter((fighter) => isFighterTargetable(fighter));
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
    plan.action = applyForcedAction(plan.fighter, plan.action, logs);
    plan.action = enforceTauntActionTargets(plan.fighter, plan.action, logs);
    plan.summaryAction = plan.action;
  }

  for (const plan of plans.values()) {
    plan.context = { selfAction: plan.action, opponentAction: ACTION_BY_ID.ji, notes: [], hit: false, damageDealt: 0 };
    plan.fighter.xp -= getMeleeActionCost(plan.fighter, plan.action);
    plan.fighter.xp += getXpGain(plan.fighter, plan.action);
    applyMeleePreActionEffects(plan, logs);
  }

  const defenses = new Map();
  for (const plan of plans.values()) {
    defenses.set(plan.fighter.id, getDefense(plan.fighter, plan.action));
  }

  applyMeleeTargetSkillEffects(plans, defenses, logs);

  const meleeHits = [];
  for (const intent of getRedirectedMeleeAttackIntents(getMeleeAttackIntents(plans), plans, defenses, logs)) {
    const target = state.melee.fighters.find((fighter) => fighter.id === intent.targetId);
    if (!target || !isFighterTargetable(target) || intent.source.hp <= 0) continue;
    const targetPlan = plans.get(target.id);
    const defense = targetPlan
      ? intent.source.id === target.id
        ? getDefense(target, targetPlan.action)
        : getIncomingDefense(target, targetPlan.action, intent.source)
      : defenses.get(target.id) || 0;
    const attack = getAttack(intent.source, intent.action, target);
    const absorbSeed = processGunnerIncomingAttack(target, intent.source, intent.action, notes);
    if (attack > defense) {
      const sourcePlan = plans.get(intent.source.id);
      sourcePlan.context.hit = true;
      meleeHits.push({ ...intent, target, sourcePlan, defense, attack, absorbSeed });
    } else {
      const sourcePlan = plans.get(intent.source.id);
      if (sourcePlan) {
        sourcePlan.context.missedActions ||= [];
        sourcePlan.context.missedActions.push(intent.action);
      }
      logs.push({ text: `${intent.source.label}用 ${intent.action.name} 攻击${target.label}，强度 ${attack} 未超过防御 ${formatDefense(defense)}。` });
    }
  }
  applyMeleeHitDamage(meleeHits, logs, notes);

  for (const plan of plans.values()) {
    runMeleeAfterRoundHooks(plan);
    tickStatuses(plan.fighter, plan.context.notes);
    advancePuppetStandby(plan.fighter, plan.context.notes);
    plan.fighter.lastSummary = summarizeMeleeAction(plan.fighter, plan.action, defenses.get(plan.fighter.id) || 0);
  }

  for (const note of [...notes, ...Array.from(plans.values()).flatMap((plan) => plan.context.notes)]) {
    logs.push({ text: note });
  }

  const endChoices = collectEndPhaseChoices(fighters);
  if (options.deferCompletion) {
    return { logs, notes, plans, defenses, endChoices };
  }

  for (const choice of endChoices) {
    for (const item of applyEndPhaseChoice(choice, chooseAutomaticEndPhaseOption(choice))) {
      logs.push(item);
    }
  }

  updateMeleeOutcome(logs);
  for (const item of logs) addLog(item.text, item.kind);
  recordCompletedMatch();
  if (!state.over) state.round += 1;
  render();
  return { logs, notes, plans, defenses, endChoices };
}

function enforceTauntActionTargets(fighter, action, logs) {
  if (!getActiveTauntTargetIds(fighter).length) return action;
  if (action.kind === "multiattack") {
    const attacks = action.attacks.filter((entry) => {
      const target = state.melee.fighters.find((item) => item.id === entry.targetId);
      return target && canActionTargetFighter(entry.action, target, fighter);
    });
    if (attacks.length) {
      const cost = attacks.reduce((sum, entry) => sum + getCost(fighter, entry.action), 0);
      return { ...action, attacks, cost };
    }
    logs.push({ text: `${fighter.label}受到仇恨影响，无法攻击其他目标，改为 Ji。` });
    return ACTION_BY_ID.ji;
  }
  if (action.kind === "multitarget-skill") {
    const entries = action.entries.filter((entry) => {
      const target = state.melee.fighters.find((item) => item.id === entry.targetId);
      return target && canActionTargetFighter(entry.action, target, fighter);
    });
    if (entries.length) {
      const cost = entries.reduce((sum, entry) => sum + getCost(fighter, entry.action), 0);
      const defense = entries.reduce((best, entry) => Math.max(best, getDefense(fighter, entry.action)), 0);
      return { ...action, entries, cost, defense };
    }
    logs.push({ text: `${fighter.label}受到仇恨影响，无法对其他目标使用伤害技能，改为 Ji。` });
    return ACTION_BY_ID.ji;
  }
  if (action.kind === "attack" && action.targetId) {
    const target = state.melee.fighters.find((item) => item.id === action.targetId);
    if (!target || !canActionTargetFighter(action, target, fighter)) {
      logs.push({ text: `${fighter.label}受到仇恨影响，无法攻击其他目标，改为 Ji。` });
      return ACTION_BY_ID.ji;
    }
  }
  return action;
}

function applyMeleePreActionEffects(plan, logs) {
  if (plan.action.kind === "multitarget-skill") {
    for (const entry of plan.action.entries) {
      const target = state.melee.fighters.find((fighter) => fighter.id === entry.targetId);
      applyPreDamageEffects(plan.fighter, entry.action, logs, target || plan.fighter);
    }
    return;
  }
  applyPreDamageEffects(plan.fighter, plan.action, logs);
}

function applyMeleeTargetSkillEffects(plans, defenses, logs) {
  for (const plan of plans.values()) {
    if (plan.action.kind !== "multitarget-skill") continue;
    for (const entry of plan.action.entries) {
      if (entry.action.kind !== "skill") continue;
      const target = state.melee.fighters.find((fighter) => fighter.id === entry.targetId);
      if (!target || target.hp <= 0 || plan.fighter.hp <= 0) continue;
      const targetPlan = plans.get(target.id);
      applyTargetedDefenseSkillEffects(plan.fighter, entry.action, target, defenses, logs);
      const targetDefense = targetPlan ? getIncomingDefense(target, targetPlan.action, plan.fighter) : defenses.get(target.id) || 0;
      applyPostDefenseSkillEffects(plan.fighter, entry.action, target, targetDefense, logs);
    }
  }
}

function applyTargetedDefenseSkillEffects(actor, action, target, defenses, logs) {
  if (!action.effects?.upgradeDefense) return;
  const before = defenses.get(target.id) || 0;
  const upgraded = upgradeDefenseValue(before);
  defenses.set(target.id, upgraded);
  logs.push({ text: `${actor.label}使用 ${action.name}，令${target.label}本回合防御提升为 ${formatDefense(upgraded)}。` });
}

function runMeleeAfterRoundHooks(plan) {
  if (plan.action.kind === "multitarget-skill") {
    for (const entry of plan.action.entries) {
      const target = state.melee.fighters.find((fighter) => fighter.id === entry.targetId) || null;
      const targetedAction = target ? { ...entry.action, tacticalTarget: target } : entry.action;
      runHook(plan.fighter, "afterRound", plan.fighter, target, { ...plan.context, selfAction: targetedAction });
    }
    return;
  }
  runHook(plan.fighter, "afterRound", plan.fighter, null, plan.context);
}

function getMeleeAttackIntents(plans) {
  const intents = [];
  for (const plan of plans.values()) {
    if (plan.action.kind === "multiattack") {
      for (const attack of plan.action.attacks) {
        if (!attack.action.tacticalSkipLegacyAttack) intents.push({ source: plan.fighter, targetId: attack.targetId, action: attack.action });
      }
    } else if (plan.action.kind === "multitarget-skill") {
      for (const entry of plan.action.entries) {
        if (entry.action.kind === "attack" && !entry.action.tacticalSkipLegacyAttack) intents.push({ source: plan.fighter, targetId: entry.targetId, action: entry.action });
      }
    } else if (plan.action.kind === "attack" && plan.action.targetId && !plan.action.tacticalSkipLegacyAttack) {
      intents.push({ source: plan.fighter, targetId: plan.action.targetId, action: plan.action });
    }
  }
  for (const plan of plans.values()) {
    const prediction = plan.fighter.statuses?.find((status) => status.id === "astrologer-prediction");
    const trackedTarget = prediction?.effects?.trackedTarget;
    if (!trackedTarget || !isFighterTargetable(trackedTarget) || trackedTarget.id === plan.fighter.id) continue;
    intents.push({
      source: plan.fighter,
      targetId: trackedTarget.id,
      action: makeAstrologerGhostAction(),
      scheduled: true,
    });
  }
  for (const plan of plans.values()) {
    const barrage = plan.fighter.statuses?.find((status) => status.id === "gunner-machine-gun");
    const trackedTarget = barrage?.effects?.trackedTarget;
    if (!trackedTarget || !isFighterTargetable(trackedTarget) || trackedTarget.id === plan.fighter.id) continue;
    intents.push({
      source: plan.fighter,
      targetId: trackedTarget.id,
      action: makeGunnerGatlingAction(),
      scheduled: true,
    });
  }
  return intents;
}

function getRedirectedMeleeAttackIntents(intents, plans, defenses, logs) {
  return intents.map((intent) => {
    const targetPlan = plans.get(intent.targetId);
    if (!targetPlan?.action || targetPlan.action.kind !== "multitarget-skill") return intent;
    const redirect = targetPlan.action.entries.find((entry) => entry.action.effects?.redirectIncoming);
    if (!redirect || redirect.targetId === intent.source.id) return intent;
    const originalTarget = targetPlan.fighter;
    const redirectTarget = state.melee.fighters.find((fighter) => fighter.id === redirect.targetId);
    if (!redirectTarget || redirectTarget.hp <= 0) return intent;
    const incomingPower = getAttack(intent.source, intent.action, originalTarget);
    if (incomingPower > redirect.action.effects.redirectMaxPower) return intent;
    logs.push({ text: `${originalTarget.label}使用 ${redirect.action.name}，将${intent.source.label}的 ${intent.action.name} 转移给${redirectTarget.label}。` });
    return { ...intent, targetId: redirectTarget.id, redirectedFromId: originalTarget.id };
  });
}

function applyMeleeHitDamage(hits, logs, notes) {
  const hitsByTarget = new Map();
  for (const hit of hits) {
    const context = { ...(hit.absorbSeed || {}), action: hit.action, damage: 1, notes };
    if (hit.target.flags?.puppetStandby) {
      const standbyDamage = getEffectiveDamage(hit.source, hit.target, hit.action, context);
      if (standbyDamage <= 0) {
        logs.push({ kind: "impact", text: `${hit.source.label}用 ${hit.action.name} 命中${hit.target.label}，但未伤及真血。` });
      }
      continue;
    }
    const damage = Math.max(0, getDamage(hit.source, hit.target, hit.action, context));
    context.damage = damage;
    if (damage <= 0) {
      logs.push({ kind: "impact", text: `${hit.source.label}用 ${hit.action.name} 命中${hit.target.label}，但未伤及真血。` });
      continue;
    }
    hit.damage = damage;
    hit.context = context;
    if (!hitsByTarget.has(hit.target.id)) hitsByTarget.set(hit.target.id, []);
    hitsByTarget.get(hit.target.id).push(hit);
  }

  for (const targetHits of hitsByTarget.values()) {
    const target = targetHits[0].target;
    const maxDamage = Math.max(...targetHits.map((hit) => hit.damage));
    const strongestHit = targetHits.find((hit) => hit.damage === maxDamage);
    const targetContext = { ...strongestHit.context, damage: maxDamage, notes };
    const effectiveDamage = Math.max(0, runBeforeTakeDamage(target, strongestHit.source, targetContext));
    targetContext.damage = effectiveDamage;

    if (effectiveDamage <= 0) {
      for (const hit of targetHits) {
        logs.push({ kind: "impact", text: `${hit.source.label}用 ${hit.action.name} 命中${target.label}，但未伤及真血。` });
      }
      continue;
    }

    for (const hit of targetHits) {
      const rewardContext = { ...hit.context, damage: hit.damage, notes };
      if (hit.context.iceCrit) {
        const criticalTargets = hit.sourcePlan.context.iceCritTargetIds ||= [];
        if (!criticalTargets.includes(target.id)) criticalTargets.push(target.id);
      }
      hit.sourcePlan.context.damageDealt += hit.damage;
      runHook(hit.source, "onDealDamage", hit.source, target, rewardContext);
      applyElfVampiricAura(hit.source, hit.damage, notes);
      logs.push({ kind: "impact", text: `${hit.source.label}用 ${hit.action.name} 攻击${target.label}，击穿防御 ${formatDefense(hit.defense)}，形成 ${hit.damage} 点伤害。` });
    }
    target.hp -= effectiveDamage;
    logs.push({ kind: "impact", text: `${target.label}本回合受到的最高伤害为 ${maxDamage}，实际 HP -${effectiveDamage}。` });
    runHook(target, "afterTakeDamage", target, strongestHit.source, targetContext);
    clearElfHolyAuraOnDamage(target, notes);
  }
}

function chooseMeleeAiAction(fighter) {
  const affordableAttacks = getAvailableActions(fighter)
    .filter((action) => action.kind === "attack")
    .sort((a, b) => getCost(fighter, b) - getCost(fighter, a));
  if (affordableAttacks.length && Math.random() > 0.35) {
    const legalTargets = state.melee.fighters.filter((target) => target.id !== fighter.id && canActionTargetFighter(affordableAttacks[0], target, fighter));
    const target = legalTargets[Math.floor(Math.random() * legalTargets.length)];
    if (!target) return ACTION_BY_ID.ji;
    const action = { ...affordableAttacks[0], targetId: target.id };
    return action;
  }
  if (fighter.xp > 0 && Math.random() > 0.55 && canUseAction(fighter, ACTION_BY_ID["def-small"])) return ACTION_BY_ID["def-small"];
  return ACTION_BY_ID.ji;
}

function getMeleeActionCost(fighter, action) {
  if (action.kind === "multiattack") return action.cost;
  if (action.kind === "multitarget-skill") return action.cost;
  return getCost(fighter, action);
}

function summarizeMeleeAction(fighter, action, defense) {
  if (action.kind === "multiattack") {
    const parts = action.attacks.map((attack) => `${attack.action.name}->${getMeleeFighterLabel(attack.targetId)}`);
    return `分配攻击：${parts.join("，")}（花费 ${action.cost}）`;
  }
  if (action.kind === "multitarget-skill") {
    const parts = action.entries.map((entry) => `${entry.action.name}->${getMeleeFighterLabel(entry.targetId)}`);
    return `指向技能：${parts.join("，")}（花费 ${action.cost}）`;
  }
  if (action.kind === "charge") return `${action.name}：XP +${getXpGain(fighter, action)}`;
  if (action.kind === "defense") return `${action.name}：防御 ${formatDefense(defense)}`;
  return `${action.name}`;
}

function updateMeleeOutcome(logs) {
  const alive = state.melee.fighters.filter((fighter) => !isFighterDefeated(fighter));
  const player = getMeleePlayer();
  if (isFighterDefeated(player)) {
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
  return state.melee.fighters.filter((target) => target.id !== fighter.id && isFighterTargetable(target));
}

function getMeleeFighterLabel(fighterId) {
  return state.melee.fighters.find((fighter) => fighter.id === fighterId)?.label || "目标";
}

function canAfford(fighter, action) {
  return fighter.xp >= getCost(fighter, action);
}

function canUseAction(fighter, action) {
  if (isForcedToJi(fighter) && action.id !== "ji") return false;
  if (hasEffectiveStatus(fighter, "elf-bind") && action.kind === "attack") return false;
  if (!canAfford(fighter, action)) return false;
  return Boolean(runHook(fighter, "canUseAction", action, fighter));
}

function getActionById(actionId, fighter) {
  return ACTION_BY_ID[actionId] || getHeroActions(fighter).find((action) => action.id === actionId);
}

function getHeroActions(fighter) {
  const skills = fighter?.hero?.activeSkills || [];
  if (fighter?.heroId === "gunner") return [...skills, ...getGunnerLearnActions(fighter), ...getGunnerTurretActions(fighter)];
  if (fighter?.heroId !== "pharmacist" && fighter?.heroId !== "elf") return skills;
  const loadout = fighter.heroId === "elf"
    ? fighter.flags.elfLoadout || DEFAULT_ELF_LOADOUT
    : fighter.flags.pharmacistLoadout || DEFAULT_PHARMACIST_LOADOUT;
  return skills.filter((skill) => loadout.includes(skill.id));
}

function isBattleMageImprintEligible(action) {
  return action?.kind === "attack" && ["range-1", "range-2"].includes(action.category || "");
}

function isBattleMageImprintedAction(action) {
  return Boolean(action?.battleMageImprint && isBattleMageImprintEligible(action));
}

function isGunnerPhysicalAbsorbable(action) {
  return action?.kind === "attack"
    && ["range-1", "range-2"].includes(action.category || "")
    && !action.magicalAttack
    && !action.effects?.skillAttack
    && !action.tacticalEffect;
}

function isGunnerSpellAbsorbable(action) {
  return Boolean(action?.kind === "attack" && (action.magicalAttack || action.effects?.skillAttack || GUNNER_SPELL_SPECS[action.id] || action.gunnerSpellKey));
}

function getGunnerSpellSpec(action) {
  if (!action) return null;
  const key = action.gunnerSpellKey || action.id;
  const known = GUNNER_SPELL_SPECS[key];
  if (known) return { ...known };
  if (!action.magicalAttack && !action.effects?.skillAttack) return null;
  return {
    key,
    owner: "未知",
    name: `${action.gunnerSpellName || action.name}炮台`,
    actionName: action.gunnerSpellName || action.name,
    power: action.power || action.effects?.skillAttackPower || 0,
    range: action.range || 1,
    damage: action.damage || action.effects?.damage || 1,
  };
}

function absorbGunnerSpell(fighter, action, context) {
  const spec = getGunnerSpellSpec(action);
  if (!spec) return;
  fighter.flags.gunnerLearnedSpells ||= {};
  fighter.flags.gunnerStoredSpells ||= {};

  if (!fighter.flags.gunnerLearnedSpells[spec.key]) {
    context.notes.push(`${fighter.label}尚未学习${spec.name}，无法吸收${spec.actionName}。`);
    return;
  }

  const current = fighter.flags.gunnerStoredSpells[spec.key] || { count: 0, spec };
  current.count += 1;
  current.spec = spec;
  fighter.flags.gunnerStoredSpells[spec.key] = current;
  context.gunnerSpellAbsorbed = true;
  context.notes.push(`${fighter.label}吸收${spec.actionName}，${spec.name}剩余 ${current.count} 次。`);
}

function isGunnerSpellLearned(fighter, key) {
  return Boolean(fighter?.flags?.gunnerLearnedSpells?.[key]);
}

function learnGunnerSpell(fighter, key, notes = []) {
  const spec = GUNNER_SPELL_SPECS[key];
  if (!spec || isGunnerSpellLearned(fighter, key)) return;
  fighter.flags.gunnerLearnedSpells ||= {};
  fighter.flags.gunnerStoredSpells ||= {};
  fighter.flags.gunnerLearnedSpells[key] = spec.name;
  fighter.flags.gunnerStoredSpells[key] ||= { count: 0, spec };
  notes.push(`${fighter.label}学会${spec.name}，之后可吸收${spec.actionName}并装填炮台。`);
}

function processGunnerIncomingAttack(defender, attacker, action, notes) {
  if (defender?.heroId !== "gunner" || action?.kind !== "attack") return null;
  if (action.tacticalMiss || action.tacticalSkipLegacyAttack) return null;
  const context = {
    action,
    damage: action.damage || 1,
    notes,
    gunnerAbsorbProcessed: false,
  };
  if (isGunnerPhysicalAbsorbable(action)) {
    const gained = Math.max(0, action.cost || 0);
    if (gained > 0) {
      defender.xp += gained;
      notes.push(`${defender.label}将${action.name}转化为能量，获得 ${gained} XP。`);
    }
    context.gunnerAbsorbProcessed = true;
  } else if (isGunnerSpellAbsorbable(action)) {
    absorbGunnerSpell(defender, action, context);
    context.gunnerAbsorbProcessed = true;
  }
  return context.gunnerAbsorbProcessed ? context : null;
}

function getGunnerStoredSpellEntries(fighter) {
  const stored = fighter?.flags?.gunnerStoredSpells || {};
  return Object.entries(stored)
    .map(([key, entry]) => ({ key, count: entry.count || 0, spec: entry.spec || GUNNER_SPELL_SPECS[key] }))
    .filter((entry) => entry.count > 0 && entry.spec);
}

function getGunnerKnownSpellEntries(fighter) {
  const learned = fighter?.flags?.gunnerLearnedSpells || {};
  const stored = fighter?.flags?.gunnerStoredSpells || {};
  const keys = new Set([...Object.keys(learned), ...Object.keys(stored)]);
  return Array.from(keys)
    .map((key) => ({ key, count: stored[key]?.count || 0, spec: stored[key]?.spec || GUNNER_SPELL_SPECS[key] }))
    .filter((entry) => entry.spec);
}

function getGunnerFieldSpellSpecs(fighter) {
  if (!fighter) return [];
  const allFighters = state?.melee?.fighters?.length
    ? state.melee.fighters
    : [state?.player, state?.enemy, state?.enemyB].filter(Boolean);
  const keys = new Set();
  for (const candidate of allFighters) {
    if (!candidate || candidate === fighter || candidate.id === fighter.id) continue;
    const candidateKeys = GUNNER_HERO_SPELL_KEYS[candidate.heroId] || [];
    for (const key of candidateKeys) {
      if (key === "pharmacist-poison" && !hasPharmacistLoadout(candidate, "pharmacist-poison")) continue;
      keys.add(key);
    }
  }
  return Array.from(keys).map((key) => GUNNER_SPELL_SPECS[key]).filter(Boolean);
}

function getGunnerLearnActions(fighter) {
  return getGunnerFieldSpellSpecs(fighter)
    .filter((spec) => !isGunnerSpellLearned(fighter, spec.key))
    .map((spec) => ({
      id: `gunner-learn-${spec.key}`,
      kind: "skill",
      name: spec.name,
      cost: BALANCE.heroes.gunner.spellLearnCost,
      power: 0,
      defense: 0,
      xpGain: 0,
      text: `花费 ${BALANCE.heroes.gunner.spellLearnCost}，学习吸收${spec.owner}的${spec.actionName}；学会后被该攻击命中/攻击到会装填炮台`,
      effects: {
        gunnerLearnKey: spec.key,
      },
    }));
}

function getGunnerTurretActions(fighter) {
  return getGunnerKnownSpellEntries(fighter).map(({ key, count, spec }) => ({
    id: `gunner-turret-${key}`,
    kind: "attack",
    category: "skill",
    name: spec.name,
    cost: 0,
    power: spec.power,
    range: spec.range,
    damage: spec.damage,
    defense: 0,
    xpGain: 0,
    magicalAttack: true,
    gunnerTurretKey: key,
    gunnerSpellKey: key,
    gunnerSpellName: spec.actionName,
    text: `释放偷师的${spec.actionName}，剩余 ${count} 次；只保留攻击伤害，不附带原技能额外效果`,
    effects: {
      gunnerTurret: true,
    },
  }));
}

function getGunnerTurretCount(fighter, key) {
  return fighter?.flags?.gunnerStoredSpells?.[key]?.count || 0;
}

function consumeGunnerTurretCharge(fighter, key) {
  const entry = fighter?.flags?.gunnerStoredSpells?.[key];
  if (!entry) return;
  entry.count = Math.max(0, (entry.count || 0) - 1);
}

function makeAstrologerGhostAction() {
  return {
    ...ACTION_BY_ID["atk-5"],
    id: "astrologer-ghost-knife",
    name: "预判·鬼刀",
    magicalAttack: true,
    gunnerSpellKey: "astrologer-predict",
    gunnerSpellName: "预判鬼刀",
    allowAstrologerGhostHeal: true,
  };
}

function makeGunnerGatlingAction() {
  return {
    id: "gunner-gatling",
    kind: "attack",
    category: "skill",
    name: "加特林",
    cost: 0,
    power: BALANCE.heroes.gunner.machineGunPower,
    range: BALANCE.heroes.gunner.machineGunRange,
    damage: BALANCE.heroes.gunner.machineGunDamage,
    defense: 0,
    xpGain: 0,
    magicalAttack: true,
    gunnerSpellKey: "gunner-machine-gun",
    gunnerSpellName: "加特林",
  };
}

function hasPharmacistLoadout(fighter, optionId) {
  return fighter?.heroId === "pharmacist" && (fighter.flags.pharmacistLoadout || DEFAULT_PHARMACIST_LOADOUT).includes(optionId);
}

function isForcedToJi(fighter) {
  return hasStatus(fighter, "dancer-force-ji");
}

function applyForcedAction(fighter, action, logs) {
  if (isPuppetInactive(fighter)) {
    logs.push({ text: `${fighter.label}处于待机状态，本回合无法行动。` });
    return getPuppetStandbyAction();
  }
  if (hasStatus(fighter, "ninja-blind") && isDamageTargetAction(action)) {
    logs.push({ text: `${fighter.label}受到致盲影响，无法选中其他目标，改为 Ji。` });
    return ACTION_BY_ID.ji;
  }
  if (!isForcedToJi(fighter) || action.id === "ji") return action;
  logs.push({ text: `${fighter.label}受到迷步影响，本回合强制出 Ji。` });
  return ACTION_BY_ID.ji;
}

function getDuelSkillTarget(action, self, opponent) {
  // Tactical mode supplies an explicit local target while keeping the legacy
  // defaults intact for the old duel and room-code flows.
  if (action.tacticalTarget) return action.tacticalTarget;
  const effects = action.effects || {};
  if (effects.pharmacistInvinciblePotion) return self;
  return effects.targetDefense || effects.skillAttack || effects.revive || effects.drainXp
    ? opponent
    : self;
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
  const aiProfile = getAiProfile(state.enemy);

  for (const action of affordable) {
    if (incomingThreat.scheduledAttack > 0 && usefulDefenses.length && !canAnswerScheduledThreat(state.enemy, action, incomingThreat.scheduledAttack)) {
      continue;
    }
    if (action.kind === "defense" && !usefulDefenses.includes(action)) {
      continue;
    }
    if (action.kind === "attack" && !isUsefulAttackAction(state.enemy, state.player, action, incomingThreat, aiProfile)) {
      continue;
    }
    if (action.kind === "skill" && !isUsefulSkillAction(state.enemy, action, incomingThreat.maxAttack)) {
      continue;
    }

    let weight = 1;
    if (action.id === "ji") {
      weight = enemyXp < aiProfile.lowEnergyTarget || incomingThreat.maxAttack === 0 ? 7 : 2;
    }
    if (action.kind === "defense") {
      weight = getDefense(state.enemy, action) >= incomingThreat.maxAttack ? 5 : 2;
    }
    if (action.kind === "attack") {
      const cost = getCost(state.enemy, action);
      if (cost <= enemyXp && cost <= Math.max(1, incomingThreat.maxAttack + 2)) weight = 3;
      if (cost >= aiProfile.highThreatAttack && incomingThreat.maxAttack === 0) weight = 2;
      if (cost === enemyXp && enemyXp >= 3) weight += 2;
    }
    if (action.kind === "skill") {
      weight = getSkillWeight(state.enemy, action, incomingThreat.maxAttack, aiProfile);
    }
    for (let i = 0; i < weight; i += 1) weighted.push(action);
  }

  return weighted[Math.floor(Math.random() * weighted.length)] || ACTION_BY_ID.ji;
}

function canAnswerScheduledThreat(fighter, action, scheduledAttack) {
  if (action.kind === "defense") return getDefense(fighter, action) >= scheduledAttack;
  if (action.kind === "skill") return getDefense(fighter, action) >= scheduledAttack || action.effects?.invincible;
  return false;
}

function getAiProfile(fighter) {
  const heroProfile = BALANCE.ai.heroProfiles?.[fighter?.heroId] || {};
  return {
    ...BALANCE.ai,
    ...heroProfile,
  };
}

function isUsefulAttackAction(attacker, target, action, incomingThreat, aiProfile) {
  const cost = getCost(attacker, action);
  const attack = getAttack(attacker, action, target);
  if (incomingThreat.maxAttack === 0) {
    return cost <= 1 || attack > getBestFreeDefense(target);
  }
  return cost <= Math.max(1, incomingThreat.maxAttack + 2) || (cost === attacker.xp && attacker.xp >= aiProfile.highThreatAttack);
}

function isUsefulSkillAction(fighter, action, maxIncomingAttack) {
  const effects = action.effects || {};
  const canBlock = getDefense(fighter, action) >= maxIncomingAttack && maxIncomingAttack > 0;
  const canHeal = effects.heal && fighter.hp < fighter.maxHp;
  return Boolean(canBlock || canHeal);
}

function getSkillWeight(fighter, action, maxIncomingAttack, aiProfile = getAiProfile(fighter)) {
  const effects = action.effects || {};
  let weight = 1;
  if (getDefense(fighter, action) >= maxIncomingAttack && maxIncomingAttack > 0) weight += 3;
  if (effects.heal && fighter.hp < fighter.maxHp) weight += 4;
  if (effects.invincible && maxIncomingAttack >= aiProfile.highThreatAttack) weight += 3;
  return weight;
}

function assessIncomingThreat(attacker, defender = null) {
  const affordableAttacks = getAvailableActions(attacker).filter((action) => action.kind === "attack");
  const directAttack = affordableAttacks.reduce((best, action) => Math.max(best, getAttack(attacker, action, defender)), 0);
  const scheduledAttack = getScheduledIncomingAttack(attacker, defender);
  const maxAttack = Math.max(directAttack, scheduledAttack);
  return {
    canAttack: maxAttack > 0,
    directAttack,
    scheduledAttack,
    maxAttack,
  };
}

function getScheduledIncomingAttack(attacker, defender = null) {
  let maxAttack = 0;
  if (hasStatus(attacker, "astrologer-prediction")) {
    maxAttack = Math.max(maxAttack, getAttack(attacker, makeAstrologerGhostAction(), defender));
  }
  return maxAttack;
}

function getBestFreeDefense(fighter) {
  return ACTIONS
    .filter((action) => action.kind === "defense" && getCost(fighter, action) === 0)
    .reduce((best, action) => Math.max(best, getDefense(fighter, action)), 0);
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

function isResolvedAttack(action) {
  return action?.kind === "attack" && !action.tacticalSkipLegacyAttack;
}

function resolveRound(playerAction, enemyAction) {
  const player = state.player;
  const enemy = state.enemy;
  const logs = [];
  clearRoundPhaseFlags(player);
  clearRoundPhaseFlags(enemy);
  playerAction = applyForcedAction(player, playerAction, logs);
  enemyAction = applyForcedAction(enemy, enemyAction, logs);
  const contextForPlayer = { selfAction: playerAction, opponentAction: enemyAction, notes: [], hit: false, damageDealt: 0 };
  const contextForEnemy = { selfAction: enemyAction, opponentAction: playerAction, notes: [], hit: false, damageDealt: 0 };

  player.xp -= getCost(player, playerAction);
  enemy.xp -= getCost(enemy, enemyAction);

  const playerXpGain = getXpGain(player, playerAction);
  const enemyXpGain = getXpGain(enemy, enemyAction);

  player.xp += playerXpGain;
  enemy.xp += enemyXpGain;

  applyPreDamageEffects(player, playerAction, logs, getDuelSkillTarget(playerAction, player, enemy));
  applyPreDamageEffects(enemy, enemyAction, logs, getDuelSkillTarget(enemyAction, enemy, player));

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
  applyScheduledGunnerMachineGun(player, enemy, enemyIncomingDefense, logs, damageNotes, ui.enemyCard, contextForPlayer);
  applyScheduledGunnerMachineGun(enemy, player, playerIncomingDefense, logs, damageNotes, ui.playerCard, contextForEnemy);

  const playerUsesAttack = isResolvedAttack(playerAction);
  const enemyUsesAttack = isResolvedAttack(enemyAction);
  const playerAttackContextSeed = playerUsesAttack ? processGunnerIncomingAttack(enemy, player, playerAction, damageNotes) : null;
  const enemyAttackContextSeed = enemyUsesAttack ? processGunnerIncomingAttack(player, enemy, enemyAction, damageNotes) : null;

  if (playerUsesAttack && enemyUsesAttack) {
    const playerHits = playerAttack > enemyIncomingDefense;
    const enemyHits = enemyAttack > playerIncomingDefense;

    if (playerHits) {
      contextForPlayer.hit = true;
      contextForPlayer.damageDealt = dealDamage(player, enemy, playerAction, `${player.label}用 ${playerAction.name} 对攻压过${enemy.label} ${enemyAction.name}，${enemy.label} HP -1。`, logs, damageNotes, ui.enemyCard, playerAttackContextSeed);
    }
    if (enemyHits) {
      contextForEnemy.hit = true;
      contextForEnemy.damageDealt = dealDamage(enemy, player, enemyAction, `${enemy.label}用 ${enemyAction.name} 对攻压过${player.label}的 ${playerAction.name}，${player.label} HP -1。`, logs, damageNotes, ui.playerCard, enemyAttackContextSeed);
    }
    if (!playerHits && !enemyHits && playerAttack === enemyAttack) {
      logs.push({ text: `双方对攻强度同为 ${playerAttack}，互相抵消。` });
    }
  } else {
    const playerHits = playerUsesAttack && playerAttack > enemyIncomingDefense;
    const enemyHits = enemyUsesAttack && enemyAttack > playerIncomingDefense;

    if (playerHits) {
      contextForPlayer.hit = true;
      contextForPlayer.damageDealt = dealDamage(player, enemy, playerAction, `${player.label}用 ${playerAction.name} 击穿${enemy.label}防御 ${formatDefense(enemyIncomingDefense)}，${enemy.label} HP -1。`, logs, damageNotes, ui.enemyCard, playerAttackContextSeed);
    } else if (playerUsesAttack) {
      logs.push({ text: `${player.label}用 ${playerAction.name}，强度 ${playerAttack} 未超过${enemy.label}防御 ${formatDefense(enemyIncomingDefense)}。` });
    }

    if (enemyHits) {
      contextForEnemy.hit = true;
      contextForEnemy.damageDealt = dealDamage(enemy, player, enemyAction, `${enemy.label}用 ${enemyAction.name} 击穿${player.label}防御 ${formatDefense(playerIncomingDefense)}，${player.label} HP -1。`, logs, damageNotes, ui.playerCard, enemyAttackContextSeed);
    } else if (enemyUsesAttack) {
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
  advancePuppetStandby(player, contextForPlayer.notes);
  advancePuppetStandby(enemy, contextForEnemy.notes);

  for (const note of [...contextForPlayer.notes, ...contextForEnemy.notes]) {
    logs.push({ text: note });
  }

  const endChoices = collectEndPhaseChoices([player, enemy]);
  const playerSummary = summarizeAction(player, playerAction, playerAttack, playerDefense, playerXpGain);
  const enemySummary = summarizeAction(enemy, enemyAction, enemyAttack, enemyDefense, enemyXpGain);
  const animations = buildDuelAnimations({
    playerAction,
    enemyAction,
    playerAttack,
    enemyAttack,
    playerDefense,
    enemyDefense,
    contextForPlayer,
    contextForEnemy,
  });

  if (isFighterDefeated(player) && isFighterDefeated(enemy)) {
    state.over = true;
    logs.push({ kind: "win", text: "同归于尽，平局。" });
  } else if (isFighterDefeated(enemy)) {
    state.over = true;
    logs.push({ kind: "win", text: "你赢了。" });
  } else if (isFighterDefeated(player)) {
    state.over = true;
    logs.push({ kind: "win", text: "电脑赢了。" });
  } else if (!logs.length) {
    logs.push({ text: "双方都没有造成伤害。" });
  }

  return { logs, playerSummary, enemySummary, endChoices, animations };
}

function buildDuelAnimations(round) {
  return [
    buildActionAnimation("player", "enemy", round.playerAction, round.playerAttack, round.playerDefense, round.contextForPlayer),
    buildActionAnimation("enemy", "player", round.enemyAction, round.enemyAttack, round.enemyDefense, round.contextForEnemy),
  ].filter(Boolean);
}

function buildActionAnimation(side, targetSide, action, attack, defense, context) {
  if (!action) return null;
  const specialType = SKILL_ANIMATION_TYPES[action.id];
  if (action.kind === "charge") {
    return { side, targetSide, type: "charge", label: `+${getXpGain(side === "player" ? state.player : state.enemy, action)} XP` };
  }
  if (action.kind === "defense") {
    return { side, targetSide, type: "defense", label: formatDefense(defense) };
  }
  if (specialType) {
    return {
      side,
      targetSide,
      type: specialType,
      label: action.name,
      outcome: context.hit ? "hit" : action.kind === "attack" ? "blocked" : "cast",
    };
  }
  if (action.kind === "attack") {
    return {
      side,
      targetSide,
      type: "attack",
      label: action.name,
      outcome: context.hit ? "hit" : "blocked",
      power: attack,
    };
  }
  if (action.kind === "skill") {
    return {
      side,
      targetSide,
      type: "skill",
      label: action.name,
      outcome: context.hit ? "hit" : "cast",
    };
  }
  return null;
}

function queueTacticalUnitCue(fighter, kind, amount = 0) {
  if (!state?.tactical || !fighter?.id) return;
  const cues = state.tactical.visualCues ||= [];
  if (!amount && cues.some((cue) => cue.fighterId === fighter.id && cue.kind === kind && !cue.amount)) return;
  cues.push({ fighterId: fighter.id, kind, amount: Math.max(0, Number(amount) || 0) });
}

function dealDamage(attacker, defender, action, text, logs, damageNotes, defenderCard, contextSeed = null) {
  const context = contextSeed || {};
  Object.assign(context, { action, damage: action.damage || 1, notes: damageNotes });
  const damage = getEffectiveDamage(attacker, defender, action, context);
  if (damage <= 0) {
    logs.push({ kind: "impact", text: `${attacker.label}用 ${action.name} 命中${defender.label}，但未伤及真血。` });
    if (defenderCard) flash(defenderCard);
    return 0;
  }
  defender.hp -= damage;
  queueTacticalUnitCue(defender, "damage", damage);
  logs.push({ kind: "impact", text: text.replace("HP -1", `HP -${damage}`) });
  runHook(attacker, "onDealDamage", attacker, defender, context);
  applyElfVampiricAura(attacker, damage, context.notes || damageNotes);
  runHook(defender, "afterTakeDamage", defender, attacker, context);
  clearElfHolyAuraOnDamage(defender, context.notes || damageNotes);
  if (defenderCard) flash(defenderCard);
  return damage;
}

function applyElfVampiricAura(fighter, damage, notes = []) {
  if (!hasEffectiveStatus(fighter, "elf-elven-aura") || damage <= 0) return;
  const before = fighter.hp;
  fighter.hp = Math.min(fighter.maxHp, fighter.hp + damage);
  const healed = fighter.hp - before;
  if (healed > 0) {
    queueTacticalUnitCue(fighter, "heal", healed);
    notes.push(`${fighter.label}受到精灵光环庇护，吸血回复 ${healed} HP。`);
  }
}

function clearElfHolyAuraOnDamage(fighter, notes = []) {
  if (!hasEffectiveStatus(fighter, "elf-holy-aura")) return;
  fighter.statuses = fighter.statuses.filter((status) => status.id !== "elf-holy-aura");
  notes.push(`${fighter.label}受到伤害，神圣光环消散。`);
}

function clearRoundPhaseFlags(fighter) {
  if (!fighter?.flags) return;
  if (fighter.heroId === "battleMage") {
    fighter.flags.roundStartFlameChasers = fighter.flags.flameChasers || 0;
    fighter.flags.battleMageImprintResolved = false;
  }
  fighter.flags.chaseTargets = [];
  fighter.flags.extraRoundDefense = 0;
  fighter.flags.roundPositiveEffects = [];
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
  return `花费 ${getCost(fighter, action)}，攻击强度 ${getAttack(fighter, action)}，距离 ${action.range || 1}`;
}

function getDefense(fighter, action) {
  let base = action.defense || 0;
  if (fighter.flags?.extraRoundDefense) {
    base = Math.max(base, fighter.flags.extraRoundDefense);
  }
  if (hasEffectiveStatus(fighter, "pharmacist-invincible")) {
    base = Math.max(base, BALANCE.defenseGrades.invincible);
  }
  if (hasEffectiveStatus(fighter, "elf-elven-aura")) {
    base = upgradeDefenseValue(base);
  }
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
  if (action.tacticalSkipLegacyAttack) return 0;
  if (action.kind === "multiattack") {
    return action.attacks
      .filter((attack) => attack.targetId === target.id)
      .reduce((best, attack) => Math.max(best, getAttack(fighter, attack.action, target)), 0);
  }
  if (action.kind === "multitarget-skill") {
    return action.entries
      .filter((entry) => entry.targetId === target.id)
      .reduce((best, entry) => Math.max(best, entry.action.effects?.pointDefense || 0), 0);
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
  const modified = runHook(fighter, "modifyXpGain", base, fighter, action);
  return action.id === "ji" && hasEffectiveStatus(fighter, "elf-holy-aura") ? modified + 1 : modified;
}

function getDamage(attacker, defender, action, context) {
  return runHook(attacker, "modifyDamage", context.damage, attacker, defender, context);
}

function getEffectiveDamage(attacker, defender, action, context) {
  const modified = getDamage(attacker, defender, action, context);
  context.damage = Math.max(0, modified);
  const afterDefense = runBeforeTakeDamage(defender, attacker, context);
  context.damage = Math.max(0, afterDefense);
  return context.damage;
}

function runBeforeTakeDamage(defender, attacker, context) {
  const hook = defender.hero.hooks.beforeTakeDamage;
  if (!hook) return context.damage;
  const result = hook(defender, attacker, context);
  return result === undefined ? context.damage : result;
}

function isPuppetInactive(fighter) {
  return Boolean(fighter?.flags?.puppetStandby || fighter?.flags?.puppetPendingStandby);
}

function isFighterProtectedFromDefeat(fighter) {
  return Boolean(fighter?.flags?.puppetStandby || fighter?.flags?.puppetPendingStandby);
}

function isFighterDefeated(fighter) {
  return fighter.hp <= 0 && !isFighterProtectedFromDefeat(fighter);
}

function isFighterTargetable(fighter) {
  return fighter.hp > 0 || Boolean(fighter?.flags?.puppetStandby || fighter?.flags?.puppetPendingStandby);
}

function getPuppetStandbyAction() {
  return {
    id: "puppet-standby-action",
    kind: "charge",
    name: "待机",
    cost: 0,
    power: 0,
    defense: 0,
    xpGain: 0,
  };
}

function hasStatus(fighter, statusId) {
  return fighter.statuses.some((status) => status.id === statusId);
}

function hasEffectiveStatus(fighter, statusId) {
  return fighter.statuses.some((status) => status.id === statusId && !(status.delayed && status.fresh));
}

function addIceShards(fighter, amount) {
  fighter.flags.iceShards = (fighter.flags.iceShards || 0) + amount;
}

function setStatus(fighter, status) {
  fighter.statuses = fighter.statuses.filter((entry) => entry.id !== status.id);
  fighter.statuses.push(status);
  queueTacticalUnitCue(fighter, status.type === "negative" ? "debuff" : "buff");
}

function markRoundPositiveEffect(fighter, name) {
  if (!fighter?.flags || !name) return;
  const effects = fighter.flags.roundPositiveEffects || [];
  if (!effects.includes(name)) effects.push(name);
  fighter.flags.roundPositiveEffects = effects;
  queueTacticalUnitCue(fighter, "buff");
}

function reviveAsClassic(fighter) {
  fighter.heroId = "classic";
  fighter.hero = HEROES.classic;
  fighter.startingHp = HEROES.classic.maxHp;
  fighter.maxHp = HEROES.classic.maxHp + BALANCE.maxHpBonus;
  fighter.hp = 1;
  fighter.xp = BALANCE.heroes.pharmacist.reviveXp;
  fighter.flags = {};
  fighter.statuses = [];
  fighter.lastSummary = "复活中";
}

function applyPostDefenseSkillEffects(fighter, action, target, targetDefense, logs) {
  if (action.effects?.elfElvenAura) {
    setStatus(target, {
      id: "elf-elven-aura", type: "positive", name: "精灵光环",
      text: `${BALANCE.heroes.elf.elvenAuraTurns} 回合 · 防御升一大级 / 吸血`,
      turns: BALANCE.heroes.elf.elvenAuraTurns, fresh: true, delayed: true,
    });
    logs.push({ text: `${fighter.label}施放精灵光环，${target.label}接下来 ${BALANCE.heroes.elf.elvenAuraTurns} 回合防御升一大级并获得吸血。` });
  }

  if (action.effects?.elfHolyAura) {
    setStatus(target, {
      id: "elf-holy-aura", type: "positive", name: "神圣光环",
      text: `${BALANCE.heroes.elf.holyAuraTurns} 回合 · Ji 效率 +1`,
      turns: BALANCE.heroes.elf.holyAuraTurns, fresh: true, delayed: true,
    });
    logs.push({ text: `${fighter.label}施放神圣光环，${target.label}接下来 ${BALANCE.heroes.elf.holyAuraTurns} 回合 Ji 效率 +1，受伤即消失。` });
  }

  if (action.effects?.elfBind) {
    if (targetDefense >= BALANCE.defenseGrades.mid) {
      logs.push({ text: `${fighter.label}使用缴械，但${target.label}的中防抵挡了效果。` });
    } else {
      setStatus(target, {
        id: "elf-bind", type: "negative", name: "缴械",
        text: `${BALANCE.heroes.elf.bindTurns} 回合 · 不能攻击`,
        turns: BALANCE.heroes.elf.bindTurns, fresh: true, delayed: true,
      });
      logs.push({ text: `${fighter.label}使用缴械，${target.label}下 ${BALANCE.heroes.elf.bindTurns} 回合不能使用攻击。` });
    }
  }

  if (action.effects?.skillAttack) {
    const attack = action.effects.skillAttackPower || action.power || 0;
    const damageAction = {
      ...action,
      kind: "attack",
      power: attack,
      damage: action.effects.damage || 1,
      magicalAttack: true,
      gunnerSpellKey: action.gunnerSpellKey || action.id,
      gunnerSpellName: action.gunnerSpellName || action.name,
    };
    if (attack > targetDefense) {
      const damageNotes = [];
      const damageContext = {};
      const absorbSeed = processGunnerIncomingAttack(target, fighter, damageAction, damageNotes);
      dealDamage(fighter, target, damageAction, `${fighter.label}用 ${action.name} 击穿${target.label}防御 ${formatDefense(targetDefense)}，${target.label} HP -1。`, logs, damageNotes, null, absorbSeed || damageContext);
      const resolvedDamageContext = absorbSeed || damageContext;
      if (action.effects.poisonTurns && target.hp > 0 && !resolvedDamageContext.gunnerSpellAbsorbed) {
        setStatus(target, {
          id: "pharmacist-poisoned",
          type: "negative",
          name: "中毒",
          text: `${action.effects.poisonTurns} 回合`,
          turns: action.effects.poisonTurns,
          fresh: true,
          effects: {
            damagePerTurn: BALANCE.heroes.pharmacist.poisonTickDamage,
          },
        });
        damageNotes.push(`${target.label}中毒，接下来 ${action.effects.poisonTurns} 回合每回合 HP -${BALANCE.heroes.pharmacist.poisonTickDamage}。`);
      } else if (action.effects.poisonTurns && resolvedDamageContext.gunnerSpellAbsorbed) {
        damageNotes.push(`${target.label}偷师了${action.name}的攻击部分，后续中毒未生效。`);
      }
      for (const note of damageNotes) logs.push({ text: note });
    } else {
      const damageNotes = [];
      processGunnerIncomingAttack(target, fighter, damageAction, damageNotes);
      for (const note of damageNotes) logs.push({ text: note });
      logs.push({ text: `${fighter.label}用 ${action.name}，强度 ${attack} 未超过${target.label}防御 ${formatDefense(targetDefense)}。` });
    }
  }

  if (action.effects?.drainXp) {
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
}

function applyScheduledGhostAttack(source, target, targetDefense, logs, damageNotes, targetCard, context) {
  if (!hasStatus(source, "astrologer-prediction")) return;
  const ghostAction = makeAstrologerGhostAction();
  const ghostAttack = getAttack(source, ghostAction, target);
  const absorbSeed = processGunnerIncomingAttack(target, source, ghostAction, damageNotes);
  if (ghostAttack > targetDefense) {
    context.hit = true;
    context.damageDealt += dealDamage(source, target, ghostAction, `${source.label}预判的鬼刀从天而降，击穿${target.label}防御 ${formatDefense(targetDefense)}，${target.label} HP -1。`, logs, damageNotes, targetCard, absorbSeed);
  } else {
    logs.push({ text: `${source.label}预判的鬼刀从天而降，强度 ${ghostAttack} 未超过${target.label}防御 ${formatDefense(targetDefense)}。` });
  }
}

function applyScheduledGunnerMachineGun(source, fallbackTarget, fallbackDefense, logs, damageNotes, targetCard, context) {
  const status = source.statuses?.find((entry) => entry.id === "gunner-machine-gun");
  if (!status) return;
  const target = status.effects?.trackedTarget || fallbackTarget;
  if (!target || !isFighterTargetable(target)) {
    logs.push({ text: `${source.label}的加特林失去目标。` });
    return;
  }
  const action = makeGunnerGatlingAction();
  const defense = target === fallbackTarget ? fallbackDefense : getIncomingDefense(target, ACTION_BY_ID.ji, source);
  const attack = getAttack(source, action, target);
  const absorbSeed = processGunnerIncomingAttack(target, source, action, damageNotes);
  if (attack > defense) {
    context.hit = true;
    context.damageDealt += dealDamage(source, target, action, `${source.label}的加特林继续扫射，击穿${target.label}防御 ${formatDefense(defense)}，${target.label} HP -1。`, logs, damageNotes, target === fallbackTarget ? targetCard : null, absorbSeed);
  } else {
    logs.push({ text: `${source.label}的加特林继续扫射，强度 ${attack} 未超过${target.label}防御 ${formatDefense(defense)}。` });
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
    if (status.effects?.damagePerTurn && fighter.hp > 0) {
      const context = {
        action: { id: status.id, kind: "status", name: status.name },
        notes,
        damage: status.effects.damagePerTurn,
      };
      const damage = Math.max(0, runBeforeTakeDamage(fighter, null, context));
      context.damage = damage;
      if (damage > 0) {
        fighter.hp -= damage;
        queueTacticalUnitCue(fighter, "damage", damage);
        notes.push(`${fighter.label}受到${status.name}影响，HP -${damage}。`);
        runHook(fighter, "afterTakeDamage", fighter, null, context);
      } else {
        notes.push(`${fighter.label}受到${status.name}影响，但未伤及真血。`);
      }
    }
    status.turns -= 1;
    if (status.turns > 0) {
      status.text = `${status.turns} 回合`;
      remaining.push(status);
    } else {
      if (status.effects?.healTo && fighter.hp > 0 && fighter.hp < status.effects.healTo) {
        const beforeHp = fighter.hp;
        fighter.hp = Math.min(fighter.maxHp, status.effects.healTo);
        queueTacticalUnitCue(fighter, "heal", fighter.hp - beforeHp);
        notes.push(`${fighter.label}的${status.name}生效，HP 恢复至 ${fighter.hp}。`);
      }
      notes.push(`${fighter.label}的${status.name}结束。`);
    }
  }
  fighter.statuses = remaining;
}

function advancePuppetStandby(fighter, notes) {
  if (fighter.heroId !== "puppet") return;
  if (fighter.flags.puppetPendingStandby) {
    fighter.flags.puppetPendingStandby = false;
    fighter.flags.puppetStandby = true;
    fighter.flags.puppetStandbyHp = BALANCE.heroes.puppet.standbyHp;
    fighter.flags.puppetStandbyTurns = BALANCE.heroes.puppet.standbyTurns;
    setStatus(fighter, {
      id: "puppet-standby",
      name: "待机",
      text: `${fighter.flags.puppetStandbyHp} 储备 / ${fighter.flags.puppetStandbyTurns} 回合`,
    });
    notes.push(`${fighter.label}进入待机状态，获得 ${BALANCE.heroes.puppet.standbyHp} 点储备生命值。`);
    return;
  }
  if (!fighter.flags.puppetStandby) return;
  fighter.flags.puppetStandbyTurns -= 1;
  if (fighter.flags.puppetStandbyHp <= 0) {
    fighter.flags.puppetStandby = false;
    fighter.statuses = fighter.statuses.filter((status) => status.id !== "puppet-standby");
    notes.push(`${fighter.label}待机储备生命耗尽，无法复活。`);
    return;
  }
  if (fighter.flags.puppetStandbyTurns <= 0) {
    fighter.flags.puppetStandby = false;
    fighter.flags.puppetShield = 1;
    fighter.hp = BALANCE.heroes.puppet.reviveHp;
    fighter.xp += BALANCE.heroes.puppet.reviveXp;
    fighter.statuses = fighter.statuses.filter((status) => status.id !== "puppet-standby");
    notes.push(`${fighter.label}待机完成，复活并获得 ${BALANCE.heroes.puppet.reviveXp} XP、${BALANCE.heroes.puppet.reviveHp} HP 和 1 层生命盾。`);
    return;
  }
  const standby = fighter.statuses.find((status) => status.id === "puppet-standby");
  if (standby) standby.text = `${fighter.flags.puppetStandbyHp} 储备 / ${fighter.flags.puppetStandbyTurns} 回合`;
}

function applyPreDamageEffects(fighter, action, logs, target = fighter) {
  if (action.kind !== "skill") return;
  const effects = action.effects || {};
  const details = [];
  const targetLabel = target === fighter ? "" : `，目标 ${target.label}`;

  if (action.id === "priest-shield" || action.id === "priest-heal") {
    markRoundPositiveEffect(target, action.name);
  }
  if (action.id === "pharmacist-invincible-potion") {
    markRoundPositiveEffect(fighter, action.name);
    markRoundPositiveEffect(target, action.name);
  }
  if (effects.invincible || action.defense >= BALANCE.defenseGrades.invincible) {
    markRoundPositiveEffect(fighter, action.name);
  }

  if (effects.targetDefense) {
    target.flags.extraRoundDefense = Math.max(target.flags.extraRoundDefense || 0, effects.targetDefense);
    details.push(`${target === fighter ? "自身" : "目标"}本回合防御 ${formatDefense(effects.targetDefense)}`);
  }

  if (effects.pharmacistInvinciblePotion) {
    setStatus(target, {
      id: "pharmacist-invincible",
      type: "positive",
      name: "无敌药剂",
      text: `${BALANCE.heroes.pharmacist.invinciblePotionTurns} 回合`,
      turns: BALANCE.heroes.pharmacist.invinciblePotionTurns,
      fresh: true,
      delayed: true,
    });
    details.push(`${target === fighter ? "自身" : "目标"}下回合起无敌 ${BALANCE.heroes.pharmacist.invinciblePotionTurns} 回合`);
  }

  if (effects.stealth) {
    markRoundPositiveEffect(target, action.name);
    details.push(`获得 ${BALANCE.heroes.ninja.stealthTurns} 回合隐形，暴露后剩余回合转为小防`);
  }

  if (effects.puppetShield) {
    markRoundPositiveEffect(target, "生命盾");
    details.push("本回合中防，回合后放置生命盾");
  }

  if (effects.revive) {
    if (target.hp <= 0) {
      reviveAsClassic(target);
      details.push(`复活为经典武者，获得 ${BALANCE.heroes.pharmacist.reviveXp} XP`);
    } else {
      details.push("目标尚未死亡，复活无效");
    }
  }

  if (effects.clearNegative) {
    const before = target.statuses.length;
    target.statuses = target.statuses.filter((status) => status.type !== "negative");
    const removed = before - target.statuses.length;
    if (removed > 0) details.push(`移除 ${removed} 个负面效果`);
  }

  if (effects.heal) {
    const beforeHp = target.hp;
    target.hp = Math.min(target.maxHp, target.hp + effects.heal);
    const healed = target.hp - beforeHp;
    if (healed > 0) queueTacticalUnitCue(target, "heal", healed);
    details.push(`回复 ${healed} HP`);
  }

  if (effects.elfEnergyTransfer) {
    target.xp += BALANCE.heroes.elf.energyTransferAmount;
    details.push(`${target === fighter ? "自身" : "目标"}在下回合开始前获得 ${BALANCE.heroes.elf.energyTransferAmount} XP`);
  }

  if (effects.upgradeDefense) details.push("本回合防御升一大级");
  if (effects.invincible && target === fighter) details.push("本回合无敌");
  logs.push({ text: details.length ? `${fighter.label}使用 ${action.name}${targetLabel}，${details.join("，")}。` : `${fighter.label}使用 ${action.name}${targetLabel}。` });
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

function playRoundAnimations(animations) {
  if (!canPlayAnimations()) return;
  animations.forEach((animation, index) => {
    window.setTimeout(() => playActionAnimation(animation), index * 90);
  });
}

function canPlayAnimations() {
  return Boolean(ui.playerEffects && ui.enemyEffects && typeof window.setTimeout === "function");
}

function playActionAnimation(animation) {
  const source = getEffectLayer(animation.side);
  const target = getEffectLayer(animation.targetSide);
  if (!source || !target) return;

  if (animation.type === "charge") {
    addPixelEffect(source, "pixel-charge", animation.label || "+XP");
    return;
  }

  if (animation.type === "defense") {
    addPixelEffect(source, "pixel-shield", animation.label || "DEF");
    return;
  }

  if (animation.type === "attack") {
    addPixelEffect(source, "pixel-windup", animation.label || "ATK");
    if (!addDirectionalEffect(animation, "pixel-slash pixel-travel", "")) {
      addPixelEffect(target, `pixel-slash ${animation.side === "player" ? "from-left" : "from-right"}`, "");
    }
    addPixelEffect(target, animation.outcome === "hit" ? "pixel-hit" : "pixel-block", animation.outcome === "hit" ? "HIT" : "BLOCK");
    return;
  }

  const skillLabel = getSkillAnimationLabel(animation);
  addPixelEffect(source, `pixel-skill pixel-skill-${animation.type}`, skillLabel);
  if (isTargetedAnimation(animation.type)) {
    addDirectionalEffect(animation, `pixel-skill-shot pixel-skill-${animation.type}`, skillLabel);
    if (animation.outcome === "blocked") addPixelEffect(target, "pixel-block", "BLOCK");
  }
  if (animation.outcome === "hit") addPixelEffect(target, "pixel-hit", "HIT");
}

function isTargetedAnimation(type) {
  return ["attack", "ice", "drain", "star"].includes(type);
}

function getSkillAnimationLabel(animation) {
  if (animation.type === "heal") return "HP";
  if (animation.type === "ice") return "ICE";
  if (animation.type === "drain") return "XP";
  if (animation.type === "star") return "STAR";
  if (animation.type === "shield-skill") return "DEF";
  return animation.label || "SKILL";
}

function getEffectLayer(side) {
  return side === "player" ? ui.playerEffects : ui.enemyEffects;
}

function getFighterCard(side) {
  return side === "player" ? ui.playerCard : ui.enemyCard;
}

function addDirectionalEffect(animation, className, text) {
  const stage = ui.fighterGrid;
  const sourceCard = getFighterCard(animation.side);
  const targetCard = getFighterCard(animation.targetSide);
  if (!stage || !sourceCard || !targetCard || typeof stage.getBoundingClientRect !== "function") return false;

  const stageRect = stage.getBoundingClientRect();
  const sourceRect = sourceCard.getBoundingClientRect();
  const targetRect = targetCard.getBoundingClientRect();
  if (!stageRect.width || !sourceRect.width || !targetRect.width) return false;

  const sourceX = sourceRect.left + sourceRect.width / 2 - stageRect.left;
  const sourceY = sourceRect.top + sourceRect.height * 0.42 - stageRect.top;
  const targetX = targetRect.left + targetRect.width / 2 - stageRect.left;
  const targetY = targetRect.top + targetRect.height * 0.42 - stageRect.top;
  const effect = document.createElement("span");
  effect.className = `pixel-effect ${className} ${animation.side === "player" ? "travel-right" : "travel-left"}`;
  effect.textContent = text;
  effect.style.left = `${sourceX}px`;
  effect.style.top = `${sourceY}px`;
  effect.style.setProperty("--travel-x", `${targetX - sourceX}px`);
  effect.style.setProperty("--travel-y", `${targetY - sourceY}px`);
  stage.append(effect);
  window.setTimeout(() => removeEffect(effect), 820);
  return true;
}

function addPixelEffect(layer, className, text) {
  const effect = document.createElement("span");
  effect.className = `pixel-effect ${className}`;
  effect.textContent = text;
  layer.append(effect);
  window.setTimeout(() => removeEffect(effect), 820);
}

function removeEffect(effect) {
  if (typeof effect.remove === "function") {
    effect.remove();
  } else if (effect.parentNode) {
    effect.parentNode.removeChild(effect);
  }
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
    const playerName = getCurrentPlayerName();
    state.player = makeFighter(playerName, heroId);
    state.enemy = makeFighter("对手", "classic");
    state.round = 1;
    state.over = false;
    state.matchRecorded = false;
    state.online.initialized = false;
    state.pendingEndChoice = null;
    ui.playerLast.textContent = "等待出手";
    ui.enemyLast.textContent = "等待对手加入";
    ui.battleLog.innerHTML = "";
    ui.playerSideLabel.textContent = playerName;
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
  const playerName = getCurrentPlayerName();
  state.player = makeFighter(playerName, selfHeroId);
  state.enemy = makeFighter("对手", opponentHeroId);
  state.round = room.round;
  state.over = false;
  state.matchRecorded = false;
  state.online.initialized = true;
  state.online.pendingActionId = "";
  ui.playerHero.value = selfHeroId;
  ui.enemyHero.value = opponentHeroId;
  ui.playerSideLabel.textContent = playerName;
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
  playRoundAnimations(report.animations || []);
  if (!state.over) applyAutomaticEndChoices(report.endChoices || []);
  state.online.appliedRounds.add(result.round);
  state.online.pendingActionId = "";
  if (!state.over) {
    state.round = result.round + 1;
  }
  recordCompletedMatch();
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

function handleMeleeKeyboardSubmit(event) {
  if (event.key !== "Enter" || event.isComposing) return;
  if (state.mode !== "melee" || state.over || !getMeleeSelections().length) return;
  const tagName = event.target?.tagName;
  if (tagName === "INPUT" || tagName === "SELECT" || tagName === "TEXTAREA") return;
  event.preventDefault();
  submitMeleeTargetSelections();
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

if (!window.__JI_TACTICAL_REBUILD__) {
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
document.addEventListener("keydown", handleMeleeKeyboardSubmit);
ui.chaseDrainBtn.addEventListener("click", () => resolvePendingEndChoice("drain"));
ui.chaseGainBtn.addEventListener("click", () => resolvePendingEndChoice("gain"));
ui.pharmacistLoadoutCollapse.addEventListener("click", () => {
  state.pharmacistLoadoutCollapsed = true;
  render();
});
ui.manualBtn.addEventListener("click", openManualDetail);
ui.manualClose.addEventListener("click", closeManualDetail);
ui.manualDetail.addEventListener("click", (event) => {
  if (event.target === ui.manualDetail) closeManualDetail();
});
ui.historyBtn.addEventListener("click", openHistoryDetail);
ui.historyClose.addEventListener("click", closeHistoryDetail);
ui.historyDetail.addEventListener("click", (event) => {
  if (event.target === ui.historyDetail) closeHistoryDetail();
});
ui.clearHistoryBtn.addEventListener("click", clearCurrentPlayerHistory);
ui.playerAvatar.addEventListener("click", () => openHeroDetail(state.player));
ui.enemyAvatar.addEventListener("click", () => openHeroDetail(state.enemy));
ui.playerCard.addEventListener("click", (event) => {
  if (event.target.closest?.(".hero-avatar")) return;
  openHeroPicker("player");
});
ui.enemyCard.addEventListener("click", (event) => {
  if (event.target.closest?.(".hero-avatar")) return;
  openHeroPicker("enemy");
});
ui.heroDetailClose.addEventListener("click", closeHeroDetail);
ui.heroDetail.addEventListener("click", (event) => {
  if (event.target === ui.heroDetail) closeHeroDetail();
});
ui.heroPickerClose.addEventListener("click", closeHeroPicker);
ui.heroPicker.addEventListener("click", (event) => {
  if (event.target === ui.heroPicker) closeHeroPicker();
});
if (document.addEventListener) {
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeHeroDetail();
      closeHeroPicker();
      closeManualDetail();
      closeHistoryDetail();
    }
  });
}
ui.clearLogBtn.addEventListener("click", () => {
  ui.battleLog.innerHTML = "";
});
ui.playerHero.addEventListener("change", () => {
  state.pharmacistLoadoutCollapsed = false;
  saveHeroSelection();
  if (state.mode === "cpu") resetGame();
  if (state.mode === "melee") startMeleeGame();
});
ui.enemyHero.addEventListener("change", () => {
  saveHeroSelection();
  if (state.mode === "cpu") resetGame();
  if (state.mode === "melee") startMeleeGame();
});
ui.enemyBHero.addEventListener("change", () => {
  saveHeroSelection();
  if (state.mode === "melee") startMeleeGame();
});
ui.playerName.addEventListener("change", savePlayerName);
ui.playerName.addEventListener("blur", savePlayerName);

populateHeroes();
initializePlayerName();
renderActions();
resetGame();
}
