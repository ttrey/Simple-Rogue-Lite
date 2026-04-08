import { useState, useEffect, useCallback, useRef, useMemo } from "react";

// ─── DATA: SKILLS ───────────────────────────────────────────────────────
const SKILL_DATA = {
  // ── Melee Tree ──
  slash: { name:"Slash", type:"active", tree:"melee", desc:"A swift blade strike.", baseDmg:12, manaCost:5, cooldown:0, level:1, xp:0, xpReq:10, evolution:null, evolvedFrom:null, stat:"str", statusEffect:null, icon:"⚔️", unlockLevel:1 },
  powerStrike: { name:"Power Strike", type:"active", tree:"melee", desc:"A heavy overhead blow that bleeds.", baseDmg:22, manaCost:12, cooldown:1, level:1, xp:0, xpReq:12, evolution:"executionStrike", evolvedFrom:null, stat:"str", statusEffect:"bleed", icon:"🗡️", unlockLevel:1 },
  cleave: { name:"Cleave", type:"active", tree:"melee", desc:"Wide slash hitting all enemies.", baseDmg:11, manaCost:8, cooldown:0, level:1, xp:0, xpReq:10, evolution:"devastatingCleave", evolvedFrom:null, stat:"str", statusEffect:null, icon:"🪓", unlockLevel:2 },
  shieldBash: { name:"Shield Bash", type:"active", tree:"melee", desc:"Bash with shield. Chance to stun.", baseDmg:15, manaCost:11, cooldown:2, level:1, xp:0, xpReq:12, evolution:null, evolvedFrom:null, stat:"str", statusEffect:"stun", icon:"🔰", unlockLevel:3 },
  parry: { name:"Parry", type:"active", tree:"melee", desc:"Counter the next attack for 150% damage.", baseDmg:0, manaCost:8, cooldown:2, level:1, xp:0, xpReq:14, evolution:"perfectCounter", evolvedFrom:null, stat:"agi", statusEffect:"stun", icon:"🛡️", unlockLevel:5 },
  whirlwind: { name:"Whirlwind", type:"active", tree:"melee", desc:"Spin attack hitting all enemies.", baseDmg:15, manaCost:18, cooldown:2, level:1, xp:0, xpReq:14, evolution:"bladestorm", evolvedFrom:null, stat:"str", statusEffect:null, icon:"🌀", unlockLevel:4 },
  earthquake: { name:"Earthquake", type:"active", tree:"melee", desc:"Slam the ground. Stuns and damages.", baseDmg:20, manaCost:16, cooldown:2, level:1, xp:0, xpReq:14, evolution:"worldBreaker", evolvedFrom:null, stat:"str", statusEffect:"stun", icon:"🌋", unlockLevel:6 },
  berserk: { name:"Berserk", type:"active", tree:"melee", desc:"Enter rage. +50% ATK, -25% DEF for 3 turns.", baseDmg:0, manaCost:20, cooldown:4, level:1, xp:0, xpReq:16, evolution:"bloodFrenzy", evolvedFrom:null, stat:"str", statusEffect:null, icon:"🔥", unlockLevel:7 },
  // Melee Evolutions
  executionStrike: { name:"Execution Strike", type:"active", tree:"melee", desc:"Massive blow. 3x damage if target <30% HP.", baseDmg:35, manaCost:18, cooldown:2, level:1, xp:0, xpReq:25, evolution:null, evolvedFrom:"powerStrike", stat:"str", statusEffect:"bleed", icon:"💀", unlockLevel:99 },
  perfectCounter: { name:"Perfect Counter", type:"active", tree:"melee", desc:"Counter for 250% damage and stun.", baseDmg:0, manaCost:14, cooldown:2, level:1, xp:0, xpReq:25, evolution:null, evolvedFrom:"parry", stat:"agi", statusEffect:"stun", icon:"⚡", unlockLevel:99 },
  bladestorm: { name:"Bladestorm", type:"active", tree:"melee", desc:"Devastating AoE. Applies bleed.", baseDmg:28, manaCost:28, cooldown:3, level:1, xp:0, xpReq:25, evolution:null, evolvedFrom:"whirlwind", stat:"str", statusEffect:"bleed", icon:"🌪️", unlockLevel:99 },
  bloodFrenzy: { name:"Blood Frenzy", type:"active", tree:"melee", desc:"+80% ATK, lifesteal 20%, -30% DEF for 4 turns.", baseDmg:0, manaCost:30, cooldown:5, level:1, xp:0, xpReq:30, evolution:null, evolvedFrom:"berserk", stat:"str", statusEffect:null, icon:"🩸", unlockLevel:99 },
  devastatingCleave: { name:"Devastating Cleave", type:"active", tree:"melee", desc:"Massive AoE slash. Applies bleed.", baseDmg:24, manaCost:14, cooldown:1, level:1, xp:0, xpReq:25, evolution:null, evolvedFrom:"cleave", stat:"str", statusEffect:"bleed", icon:"🪓", unlockLevel:99 },
  worldBreaker: { name:"World Breaker", type:"active", tree:"melee", desc:"Devastating slam. Stuns and huge damage.", baseDmg:40, manaCost:24, cooldown:3, level:1, xp:0, xpReq:25, evolution:null, evolvedFrom:"earthquake", stat:"str", statusEffect:"stun", icon:"💥", unlockLevel:99 },

  // ── Magic Tree ──
  fireball: { name:"Fireball", type:"active", tree:"magic", desc:"Hurl a ball of fire.", baseDmg:18, manaCost:10, cooldown:0, level:1, xp:0, xpReq:10, evolution:"infernoSphere", evolvedFrom:null, stat:"int", statusEffect:"burn", icon:"🔥", unlockLevel:1 },
  iceSpike: { name:"Ice Spike", type:"active", tree:"magic", desc:"Launch a piercing shard of ice.", baseDmg:14, manaCost:8, cooldown:0, level:1, xp:0, xpReq:10, evolution:"glacialLance", evolvedFrom:null, stat:"int", statusEffect:"freeze", icon:"❄️", unlockLevel:1 },
  poisonCloud: { name:"Poison Cloud", type:"active", tree:"magic", desc:"Release toxic fumes that poison.", baseDmg:10, manaCost:11, cooldown:1, level:1, xp:0, xpReq:12, evolution:"plagueStorm", evolvedFrom:null, stat:"int", statusEffect:"poison", icon:"☁️", unlockLevel:2 },
  healingLight: { name:"Healing Light", type:"active", tree:"magic", desc:"Restore HP with divine magic.", baseDmg:0, manaCost:16, cooldown:3, level:1, xp:0, xpReq:12, evolution:"divineLight", evolvedFrom:null, stat:"int", statusEffect:null, icon:"💖", unlockLevel:3 },
  chainLightning: { name:"Chain Lightning", type:"active", tree:"magic", desc:"Lightning that chains to nearby foes.", baseDmg:16, manaCost:14, cooldown:1, level:1, xp:0, xpReq:14, evolution:"thunderstorm", evolvedFrom:null, stat:"int", statusEffect:"stun", icon:"⚡", unlockLevel:4 },
  manaBurn: { name:"Mana Burn", type:"active", tree:"magic", desc:"Drain target as damage. Restores your mana.", baseDmg:15, manaCost:8, cooldown:1, level:1, xp:0, xpReq:14, evolution:null, evolvedFrom:null, stat:"int", statusEffect:null, icon:"🔷", unlockLevel:6 },
  arcaneShield: { name:"Arcane Shield", type:"active", tree:"magic", desc:"Create a magic barrier absorbing damage.", baseDmg:0, manaCost:15, cooldown:3, level:1, xp:0, xpReq:14, evolution:"dimensionalBarrier", evolvedFrom:null, stat:"int", statusEffect:null, icon:"🔮", unlockLevel:7 },
  summonFamiliar: { name:"Summon Familiar", type:"active", tree:"magic", desc:"Summon a spirit to fight alongside you.", baseDmg:10, manaCost:22, cooldown:4, level:1, xp:0, xpReq:16, evolution:"summonPhoenix", evolvedFrom:null, stat:"int", statusEffect:null, icon:"👻", unlockLevel:10 },
  // Magic Evolutions
  infernoSphere: { name:"Inferno Sphere", type:"active", tree:"magic", desc:"Massive fire explosion. Burns for 3 turns.", baseDmg:35, manaCost:18, cooldown:1, level:1, xp:0, xpReq:25, evolution:null, evolvedFrom:"fireball", stat:"int", statusEffect:"burn", icon:"☄️", unlockLevel:99 },
  glacialLance: { name:"Glacial Lance", type:"active", tree:"magic", desc:"Piercing ice. High crit, chance to freeze.", baseDmg:28, manaCost:14, cooldown:1, level:1, xp:0, xpReq:25, evolution:null, evolvedFrom:"iceSpike", stat:"int", statusEffect:"freeze", icon:"🧊", unlockLevel:99 },
  thunderstorm: { name:"Thunderstorm", type:"active", tree:"magic", desc:"AoE lightning storm for 2 turns.", baseDmg:30, manaCost:24, cooldown:3, level:1, xp:0, xpReq:25, evolution:null, evolvedFrom:"chainLightning", stat:"int", statusEffect:"stun", icon:"🌩️", unlockLevel:99 },
  dimensionalBarrier: { name:"Dimensional Barrier", type:"active", tree:"magic", desc:"Absorbs damage and reflects 30%.", baseDmg:0, manaCost:22, cooldown:3, level:1, xp:0, xpReq:25, evolution:null, evolvedFrom:"arcaneShield", stat:"int", statusEffect:null, icon:"🌀", unlockLevel:99 },
  summonPhoenix: { name:"Summon Phoenix", type:"active", tree:"magic", desc:"Summon a phoenix. Burns foes, heals you on death.", baseDmg:20, manaCost:35, cooldown:5, level:1, xp:0, xpReq:30, evolution:null, evolvedFrom:"summonFamiliar", stat:"int", statusEffect:"burn", icon:"🦅", unlockLevel:99 },
  plagueStorm: { name:"Plague Storm", type:"active", tree:"magic", desc:"Toxic hurricane. Heavy poison damage.", baseDmg:22, manaCost:18, cooldown:2, level:1, xp:0, xpReq:25, evolution:null, evolvedFrom:"poisonCloud", stat:"int", statusEffect:"poison", icon:"☠️", unlockLevel:99 },
  divineLight: { name:"Divine Light", type:"active", tree:"magic", desc:"Full HP restoration and cleanse all debuffs.", baseDmg:0, manaCost:28, cooldown:4, level:1, xp:0, xpReq:25, evolution:null, evolvedFrom:"healingLight", stat:"int", statusEffect:null, icon:"🌟", unlockLevel:99 },

  // ── Utility Tree ──
  smokeBomb: { name:"Smoke Bomb", type:"active", tree:"utility", desc:"Vanish in smoke. Dodge boosted 2 turns.", baseDmg:0, manaCost:10, cooldown:3, level:1, xp:0, xpReq:12, evolution:null, evolvedFrom:null, stat:"agi", statusEffect:null, icon:"💣", unlockLevel:3 },
  venomStrike: { name:"Venom Strike", type:"active", tree:"utility", desc:"Poisoned blade attack.", baseDmg:14, manaCost:10, cooldown:0, level:1, xp:0, xpReq:12, evolution:null, evolvedFrom:null, stat:"agi", statusEffect:"poison", icon:"🐍", unlockLevel:4 },
  shadowStep: { name:"Shadow Step", type:"active", tree:"utility", desc:"Teleport behind enemy. Next attack is guaranteed crit.", baseDmg:0, manaCost:16, cooldown:3, level:1, xp:0, xpReq:14, evolution:null, evolvedFrom:null, stat:"agi", statusEffect:null, icon:"👤", unlockLevel:5 },
  drainLife: { name:"Drain Life", type:"active", tree:"utility", desc:"Steal HP from the enemy.", baseDmg:12, manaCost:14, cooldown:2, level:1, xp:0, xpReq:14, evolution:null, evolvedFrom:null, stat:"int", statusEffect:null, icon:"💜", unlockLevel:8 },
};

const PASSIVE_DATA = {
  critBoost: { name:"Keen Edge", desc:"+5% crit chance per level", stat:"critChance", value:5, level:1, xp:0, xpReq:15, icon:"🎯" },
  lifesteal: { name:"Vampiric Touch", desc:"+3% lifesteal per level", stat:"lifesteal", value:3, level:1, xp:0, xpReq:18, icon:"🧛" },
  manaRegen: { name:"Arcane Flow", desc:"+2 mana regen per level", stat:"manaRegen", value:2, level:1, xp:0, xpReq:14, icon:"💧" },
  cdReduction: { name:"Temporal Mastery", desc:"-1 cooldown (max skill lv) per level", stat:"cdReduction", value:1, level:1, xp:0, xpReq:20, icon:"⏳" },
  fireAmp: { name:"Pyromaniac", desc:"+10% fire damage per level", stat:"fireAmp", value:10, level:1, xp:0, xpReq:16, icon:"🔥" },
  iceAmp: { name:"Frost Heart", desc:"+10% ice damage per level", stat:"iceAmp", value:10, level:1, xp:0, xpReq:16, icon:"❄️" },
  thornArmor: { name:"Thorns", desc:"Reflect 5% damage taken per level", stat:"thorns", value:5, level:1, xp:0, xpReq:18, icon:"🌹" },
  dodgeBoost: { name:"Phantom Step", desc:"+3% dodge chance per level", stat:"dodgeChance", value:3, level:1, xp:0, xpReq:16, icon:"💨" },
};

// ─── DATA: ENEMIES ──────────────────────────────────────────────────────
const ENEMY_TEMPLATES = [
  { name:"Goblin", hp:30, atk:8, def:2, xp:12, gold:5, icon:"👺", behavior:"aggressive", tier:1 },
  { name:"Skeleton", hp:35, atk:10, def:4, xp:15, gold:7, icon:"💀", behavior:"balanced", tier:1 },
  { name:"Slime", hp:50, atk:5, def:1, xp:10, gold:4, icon:"🟢", behavior:"defensive", tier:1 },
  { name:"Wolf", hp:28, atk:12, def:3, xp:14, gold:6, icon:"🐺", behavior:"aggressive", tier:1 },
  { name:"Bandit", hp:40, atk:11, def:5, xp:16, gold:10, icon:"🗡️", behavior:"balanced", tier:1 },
  { name:"Spiderling", hp:26, atk:9, def:2, xp:13, gold:6, icon:"🕷️", behavior:"aggressive", tier:1, statusOnHit:"poison", statusChance:28 },
  { name:"Cultist", hp:32, atk:12, def:2, xp:14, gold:8, icon:"🕯️", behavior:"magic", tier:1, statusOnHit:"burn", statusChance:22 },
  { name:"Ghoul", hp:38, atk:11, def:3, xp:16, gold:7, icon:"🧟", behavior:"balanced", tier:1, statusOnHit:"bleed", statusChance:24 },
  { name:"Orc Warrior", hp:65, atk:16, def:8, xp:25, gold:14, icon:"👹", behavior:"aggressive", tier:2 },
  { name:"Dark Mage", hp:45, atk:20, def:4, xp:28, gold:16, icon:"🧙", behavior:"magic", tier:2 },
  { name:"Troll", hp:90, atk:14, def:12, xp:30, gold:18, icon:"🧌", behavior:"defensive", tier:2 },
  { name:"Assassin", hp:40, atk:24, def:5, xp:28, gold:15, icon:"🥷", behavior:"aggressive", tier:2 },
  { name:"Wraith", hp:55, atk:18, def:6, xp:26, gold:13, icon:"👻", behavior:"magic", tier:2 },
  { name:"Harpy", hp:42, atk:17, def:4, xp:24, gold:13, icon:"🦅", behavior:"aggressive", tier:2 },
  { name:"Fire Elemental", hp:55, atk:21, def:5, xp:29, gold:16, icon:"🔥", behavior:"magic", tier:2 },
  { name:"Necromancer", hp:48, atk:23, def:5, xp:32, gold:19, icon:"☠️", behavior:"magic", tier:2 },
  { name:"Venomfang", hp:58, atk:18, def:6, xp:27, gold:15, icon:"🐍", behavior:"aggressive", tier:2, statusOnHit:"poison", statusChance:34 },
  { name:"Hex Archer", hp:46, atk:19, def:5, xp:29, gold:17, icon:"🏹", behavior:"balanced", tier:2, statusOnHit:"bleed", statusChance:30 },
  { name:"Plague Doctor", hp:52, atk:20, def:6, xp:31, gold:18, icon:"😷", behavior:"magic", tier:2, statusOnHit:"poison", statusChance:36 },
  { name:"Thunder Roc", hp:64, atk:21, def:8, xp:33, gold:19, icon:"🦅", behavior:"aggressive", tier:2, statusOnHit:"stun", statusChance:20 },
  { name:"Treasure Mimic", hp:72, atk:17, def:10, xp:35, gold:34, icon:"🧰", behavior:"balanced", tier:2 },
  { name:"Dragon Whelp", hp:100, atk:22, def:14, xp:40, gold:25, icon:"🐉", behavior:"aggressive", tier:3 },
  { name:"Lich", hp:80, atk:28, def:10, xp:45, gold:30, icon:"☠️", behavior:"magic", tier:3 },
  { name:"Demon Knight", hp:120, atk:26, def:18, xp:50, gold:35, icon:"⚔️", behavior:"balanced", tier:3 },
  { name:"Elder Vampire", hp:95, atk:30, def:12, xp:48, gold:32, icon:"🧛", behavior:"magic", tier:3 },
  { name:"Golem", hp:150, atk:20, def:25, xp:42, gold:28, icon:"🗿", behavior:"defensive", tier:3 },
  { name:"Shadow Knight", hp:115, atk:27, def:17, xp:48, gold:32, icon:"🖤", behavior:"balanced", tier:3 },
  { name:"Crystal Golem", hp:145, atk:19, def:24, xp:44, gold:30, icon:"💎", behavior:"defensive", tier:3 },
  { name:"Blood Priestess", hp:78, atk:29, def:9, xp:46, gold:31, icon:"🩸", behavior:"magic", tier:3, statusOnHit:"bleed", statusChance:32 },
  { name:"Iron Sentinel", hp:135, atk:23, def:22, xp:47, gold:30, icon:"🤖", behavior:"defensive", tier:3, statusOnHit:"stun", statusChance:18 },
  { name:"Storm Drake", hp:110, atk:29, def:13, xp:49, gold:33, icon:"🐉", behavior:"aggressive", tier:3, statusOnHit:"burn", statusChance:28 },
  { name:"Chrono Wisp", hp:82, atk:27, def:9, xp:45, gold:29, icon:"🌀", behavior:"magic", tier:3, statusOnHit:"freeze", statusChance:26 },
  { name:"Rift Horror", hp:150, atk:34, def:18, xp:58, gold:40, icon:"🫥", behavior:"magic", tier:4, statusOnHit:"poison", statusChance:34 },
  { name:"Fallen Templar", hp:165, atk:35, def:24, xp:60, gold:42, icon:"🛡️", behavior:"balanced", tier:4, statusOnHit:"stun", statusChance:22 },
  { name:"Sunken Leviathan Spawn", hp:185, atk:32, def:26, xp:63, gold:45, icon:"🐙", behavior:"defensive", tier:4, statusOnHit:"freeze", statusChance:24 },
];

const BOSS_TEMPLATES = [
  { name:"Goblin King", hp:200, atk:25, def:12, xp:100, gold:80, icon:"👑", behavior:"balanced", tier:1, mechanic:"summon", mechanicDesc:"Summons minions every 3 turns (+ATK)" },
  { name:"Shadow Reaper", hp:250, atk:35, def:10, xp:140, gold:100, icon:"💀", behavior:"aggressive", tier:1, mechanic:"phase", mechanicDesc:"Phases out every 2 turns (immune)" },
  { name:"Broodmother Vexa", hp:280, atk:27, def:13, xp:150, gold:110, icon:"🕷️", behavior:"aggressive", tier:1, mechanic:"venom", mechanicDesc:"Toxic brood burst every 2 turns (poison)" },
  { name:"Forge Tyrant", hp:320, atk:30, def:18, xp:165, gold:120, icon:"🔥", behavior:"balanced", tier:1, mechanic:"rebirth", mechanicDesc:"Reignites once below 25% HP" },
  { name:"Frost Wyrm", hp:350, atk:30, def:18, xp:180, gold:130, icon:"🐲", behavior:"magic", tier:2, mechanic:"breath", mechanicDesc:"AoE frost breath every 3 turns (freeze)" },
  { name:"Demon Lord Baal", hp:450, atk:40, def:22, xp:250, gold:180, icon:"😈", behavior:"aggressive", tier:2, mechanic:"enrage", mechanicDesc:"Enrages below 30% HP (+50% ATK)" },
  { name:"Storm Eidolon", hp:380, atk:37, def:18, xp:220, gold:160, icon:"🌩️", behavior:"magic", tier:2, mechanic:"storm", mechanicDesc:"Tempest crash every 3 turns (can stun)" },
  { name:"Plague Hydra", hp:420, atk:34, def:20, xp:215, gold:155, icon:"🐍", behavior:"magic", tier:2, mechanic:"venom", mechanicDesc:"Venom spray every 2 turns (poison)" },
  { name:"Arcane Colossus", hp:600, atk:35, def:30, xp:350, gold:250, icon:"🗿", behavior:"defensive", tier:3, mechanic:"barrier", mechanicDesc:"Regenerates 10% HP every 2 turns" },
  { name:"Void Emperor", hp:800, atk:50, def:25, xp:500, gold:350, icon:"👁️", behavior:"magic", tier:3, mechanic:"void", mechanicDesc:"Drains 15% max mana per turn" },
  { name:"Bloodmoon Countess", hp:610, atk:42, def:20, xp:360, gold:260, icon:"🧛", behavior:"magic", tier:3, mechanic:"drain", mechanicDesc:"Steals life every 2 turns" },
  { name:"Worldroot Titan", hp:720, atk:38, def:34, xp:390, gold:280, icon:"🌳", behavior:"defensive", tier:3, mechanic:"rebirth", mechanicDesc:"Regrows once below 25% HP" },
  { name:"Abyssal Dragon", hp:1000, atk:60, def:35, xp:700, gold:500, icon:"🐉", behavior:"aggressive", tier:4, mechanic:"apocalypse", mechanicDesc:"Deals escalating AoE each turn" },
  { name:"Chrono Devourer", hp:920, atk:55, def:28, xp:580, gold:390, icon:"⏳", behavior:"magic", tier:4, mechanic:"phase", mechanicDesc:"Phases every 2 turns and accelerates" },
  { name:"Rift Sovereign", hp:980, atk:58, def:32, xp:620, gold:430, icon:"🕳️", behavior:"magic", tier:4, mechanic:"storm", mechanicDesc:"Void storms every 3 turns (can stun)" },
];

// ─── DATA: ITEMS ────────────────────────────────────────────────────────
const RARITY = { common:{name:"Common",color:"#9ca3af",mult:1}, uncommon:{name:"Uncommon",color:"#22c55e",mult:1.3}, rare:{name:"Rare",color:"#3b82f6",mult:1.7}, epic:{name:"Epic",color:"#a855f7",mult:2.2}, legendary:{name:"Legendary",color:"#f59e0b",mult:3}, mythic:{name:"Mythic",color:"#ef4444",mult:4} };
const RARITY_WEIGHTS = [{r:"common",w:40},{r:"uncommon",w:28},{r:"rare",w:18},{r:"epic",w:10},{r:"legendary",w:3},{r:"mythic",w:1}];

const ITEM_SETS = {
  emberbound: {
    name:"Emberbound Regalia",
    color:"#f97316",
    totalPieces:4,
    bonuses:[
      { pieces:2, desc:"+4 STR, +10 ATK", effects:{ str:4, atkFlat:10 } },
      { pieces:3, desc:"+12% fire damage, +6% crit chance", effects:{ fireAmp:12, critChance:6 } },
      { pieces:4, desc:"+18 MAGIC, +15% boss damage", effects:{ magicFlat:18, bossDamagePct:15 } },
    ],
  },
  shadowstrike: {
    name:"Shadowstrike Kit",
    color:"#8b5cf6",
    totalPieces:4,
    bonuses:[
      { pieces:2, desc:"+4 AGI, +6% dodge chance", effects:{ agi:4, dodgeChance:6 } },
      { pieces:3, desc:"+10% crit chance, +6% lifesteal", effects:{ critChance:10, lifestealPct:6 } },
      { pieces:4, desc:"+14 ATK, +12% total damage", effects:{ atkFlat:14, damagePct:12 } },
    ],
  },
  stormweaver: {
    name:"Stormweaver Raiment",
    color:"#38bdf8",
    totalPieces:4,
    bonuses:[
      { pieces:2, desc:"+4 INT, +14 MAGIC", effects:{ int:4, magicFlat:14 } },
      { pieces:3, desc:"+4 mana regen, -1 cooldown", effects:{ manaRegenVal:4, cdReduction:1 } },
      { pieces:4, desc:"+10% crit chance, +18 MAGIC, +10% total damage", effects:{ critChance:10, magicFlat:18, damagePct:10 } },
    ],
  },
  verdantguard: {
    name:"Verdantguard Plate",
    color:"#22c55e",
    totalPieces:4,
    bonuses:[
      { pieces:2, desc:"+4 VIT, +10 DEF", effects:{ vit:4, defFlat:10 } },
      { pieces:3, desc:"+12% max HP, +10% thorns", effects:{ maxHpPct:12, thornsPct:10 } },
      { pieces:4, desc:"+12 ATK, +16 DEF, +8% lifesteal", effects:{ atkFlat:12, defFlat:16, lifestealPct:8 } },
    ],
  },
};

const ELITE_AFFIXES = {
  frenzied: { name:"Frenzied", desc:"+25% ATK" },
  juggernaut: { name:"Juggernaut", desc:"+35% HP, +20% DEF" },
  vampiric: { name:"Vampiric", desc:"Heals from damage dealt" },
  toxic: { name:"Toxic", desc:"Attacks may poison" },
  frostbound: { name:"Frostbound", desc:"Attacks may freeze" },
  volatile: { name:"Volatile", desc:"Explodes on death" },
  hoarder: { name:"Hoarder", desc:"Drops extra loot and gold" },
};

const WEAPON_BASES = [
  { name:"Iron Sword", type:"weapon", slot:"weapon", baseAtk:5, icon:"🗡️" },
  { name:"Steel Blade", type:"weapon", slot:"weapon", baseAtk:10, icon:"⚔️" },
  { name:"Katana", type:"weapon", slot:"weapon", baseAtk:14, icon:"🔪" },
  { name:"Greatsword", type:"weapon", slot:"weapon", baseAtk:18, icon:"🗡️" },
  { name:"Battle Axe", type:"weapon", slot:"weapon", baseAtk:16, icon:"🪓" },
  { name:"Shadow Blade", type:"weapon", slot:"weapon", baseAtk:12, baseMagic:10, icon:"🔪" },
  { name:"Apprentice Staff", type:"weapon", slot:"weapon", baseAtk:4, baseMagic:8, icon:"🪄" },
  { name:"Oak Wand", type:"weapon", slot:"weapon", baseAtk:3, baseMagic:12, icon:"✨" },
  { name:"Crystal Staff", type:"weapon", slot:"weapon", baseAtk:5, baseMagic:16, icon:"🔮" },
  { name:"Arcane Scepter", type:"weapon", slot:"weapon", baseAtk:6, baseMagic:20, icon:"⚗️" },
  { name:"Enchanted Tome", type:"weapon", slot:"weapon", baseAtk:2, baseMagic:18, icon:"📕" },
  { name:"Runic Spear", type:"weapon", slot:"weapon", baseAtk:12, baseMagic:6, icon:"🔱" },
  { name:"Warhammer", type:"weapon", slot:"weapon", baseAtk:20, icon:"🔨" },
  { name:"Frostbrand", type:"weapon", slot:"weapon", baseAtk:13, baseMagic:12, icon:"🧊" },
  { name:"Emberfang Blade", type:"weapon", slot:"weapon", baseAtk:15, baseMagic:6, icon:"🔥", setKey:"emberbound", setPiece:"Emberfang Blade" },
  { name:"Nightglass Dagger", type:"weapon", slot:"weapon", baseAtk:13, baseMagic:4, icon:"🌘", setKey:"shadowstrike", setPiece:"Nightglass Dagger" },
  { name:"Stormcall Rod", type:"weapon", slot:"weapon", baseAtk:6, baseMagic:18, icon:"🌩️", setKey:"stormweaver", setPiece:"Stormcall Rod" },
  { name:"Rootrender Axe", type:"weapon", slot:"weapon", baseAtk:17, baseDef:4, icon:"🪓", setKey:"verdantguard", setPiece:"Rootrender Axe" },
];
const ARMOR_BASES = [
  { name:"Leather Vest", type:"armor", slot:"armor", baseDef:3, icon:"🥋" },
  { name:"Chainmail", type:"armor", slot:"armor", baseDef:7, icon:"🛡️" },
  { name:"Plate Armor", type:"armor", slot:"armor", baseDef:12, icon:"⛑️" },
  { name:"Mage Robes", type:"armor", slot:"armor", baseDef:4, baseMagic:6, icon:"👘" },
  { name:"Shadow Cloak", type:"armor", slot:"armor", baseDef:5, icon:"🧥" },
  { name:"Dragon Scale", type:"armor", slot:"armor", baseDef:10, icon:"🐉" },
  { name:"Obsidian Plate", type:"armor", slot:"armor", baseDef:14, icon:"⬛" },
  { name:"Stormcoat", type:"armor", slot:"armor", baseDef:8, baseMagic:8, icon:"🌫️" },
  { name:"Blood Vestments", type:"armor", slot:"armor", baseDef:7, baseMagic:10, icon:"🩸" },
  { name:"Cindercoat", type:"armor", slot:"armor", baseDef:10, baseMagic:8, icon:"🔥", setKey:"emberbound", setPiece:"Cindercoat" },
  { name:"Nightweave Mantle", type:"armor", slot:"armor", baseDef:7, baseMagic:6, icon:"🌑", setKey:"shadowstrike", setPiece:"Nightweave Mantle" },
  { name:"Cloudthread Vestments", type:"armor", slot:"armor", baseDef:8, baseMagic:12, icon:"☁️", setKey:"stormweaver", setPiece:"Cloudthread Vestments" },
  { name:"Barkbound Carapace", type:"armor", slot:"armor", baseDef:15, baseMagic:4, icon:"🌿", setKey:"verdantguard", setPiece:"Barkbound Carapace" },
];
const ACCESSORY_BASES = [
  { name:"Iron Ring", type:"accessory", slot:"accessory1", baseStat:{str:2}, icon:"💍" },
  { name:"Mana Amulet", type:"accessory", slot:"accessory1", baseStat:{int:3}, icon:"📿" },
  { name:"Lucky Charm", type:"accessory", slot:"accessory1", baseStat:{luk:4}, icon:"🍀" },
  { name:"Vitality Pendant", type:"accessory", slot:"accessory1", baseStat:{vit:3}, icon:"❤️" },
  { name:"Agility Band", type:"accessory", slot:"accessory1", baseStat:{agi:3}, icon:"💨" },
  { name:"Speed Boots", type:"accessory", slot:"accessory1", baseStat:{agi:4}, icon:"👟" },
  { name:"Skull Ring", type:"accessory", slot:"accessory1", baseStat:{str:3,int:2}, icon:"💀" },
  { name:"Nature's Grace", type:"accessory", slot:"accessory1", baseStat:{vit:2,luk:2}, icon:"🌿" },
  { name:"Mirror Talisman", type:"accessory", slot:"accessory1", baseStat:{int:2,luk:3}, icon:"🪞" },
  { name:"Rune Dice", type:"accessory", slot:"accessory1", baseStat:{luk:3,agi:2}, icon:"🎲" },
  { name:"Ember Loop", type:"accessory", slot:"accessory1", baseStat:{str:2,int:1}, icon:"🧿", setKey:"emberbound", setPiece:"Ember Loop" },
  { name:"Ashen Emblem", type:"accessory", slot:"accessory1", baseStat:{int:2,luk:1}, icon:"🪬", setKey:"emberbound", setPiece:"Ashen Emblem" },
  { name:"Duskrunner Band", type:"accessory", slot:"accessory1", baseStat:{agi:3,luk:1}, icon:"🌒", setKey:"shadowstrike", setPiece:"Duskrunner Band" },
  { name:"Veilstep Spurs", type:"accessory", slot:"accessory1", baseStat:{agi:4}, icon:"👣", setKey:"shadowstrike", setPiece:"Veilstep Spurs" },
  { name:"Static Sigil", type:"accessory", slot:"accessory1", baseStat:{int:3,agi:1}, icon:"⚡", setKey:"stormweaver", setPiece:"Static Sigil" },
  { name:"Tempest Charm", type:"accessory", slot:"accessory1", baseStat:{int:2,luk:2}, icon:"🌪️", setKey:"stormweaver", setPiece:"Tempest Charm" },
  { name:"Mossheart Charm", type:"accessory", slot:"accessory1", baseStat:{vit:3,str:1}, icon:"🍃", setKey:"verdantguard", setPiece:"Mossheart Charm" },
  { name:"Ironbloom Totem", type:"accessory", slot:"accessory1", baseStat:{vit:2,luk:2}, icon:"🪵", setKey:"verdantguard", setPiece:"Ironbloom Totem" },
];

const UNIQUE_EFFECTS = [
  "Fire skills apply burn twice","Critical hits restore 5% HP","+15% damage when below 30% HP",
  "Kills restore 10% mana","Dodge grants +20% ATK next turn","+20% damage to bosses",
  "Status effects last 1 extra turn","First hit each combat is guaranteed crit",
  "+30% gold from enemies","Immune to freeze","Mana costs reduced by 15%",
  "Heal 3% HP per turn","+25% XP from all sources",
  "+10% damage per status effect on target","25% chance to dodge when below 50% HP",
  "15% chance for skills to cost no mana","+20% healing from all sources",
  "Start each combat with a magic shield",
];

const CONSUMABLES = [
  { name:"Health Potion", effect:"heal", value:40, cost:15, icon:"🧪", desc:"Restore 40 HP" },
  { name:"Greater Health Potion", effect:"heal", value:100, cost:40, icon:"🧪", desc:"Restore 100 HP" },
  { name:"Mana Potion", effect:"mana", value:30, cost:12, icon:"💧", desc:"Restore 30 MP" },
  { name:"Greater Mana Potion", effect:"mana", value:80, cost:35, icon:"💧", desc:"Restore 80 MP" },
  { name:"Scroll of Fireball", effect:"damage", value:60, cost:30, icon:"📜", desc:"Deal 60 fire damage" },
  { name:"Antidote", effect:"cleanse", value:0, cost:10, icon:"🌿", desc:"Remove all status effects" },
];

const TRAITS = [
  { name:"Last Stand", desc:"Double damage below 30% HP", effect:"doubleDmg" },
  { name:"Iron Will", desc:"+20% DEF permanently", effect:"defBoost20" },
  { name:"Mana Battery", desc:"+30% max mana", effect:"manaBoost30" },
  { name:"Glass Cannon", desc:"+40% ATK, -20% max HP", effect:"glassCannon" },
  { name:"Lucky Star", desc:"+10% to all luck rolls", effect:"luckyAll" },
  { name:"Regenerator", desc:"Heal 5% max HP after each fight", effect:"regen5" },
  { name:"Gold Digger", desc:"+50% gold from all sources", effect:"goldBoost" },
  { name:"Quick Learner", desc:"+25% XP from all sources", effect:"xpBoost" },
  { name:"Executioner", desc:"3x damage to enemies below 20% HP", effect:"executeDmg" },
  { name:"Thick Skin", desc:"Reduce all damage taken by 10%", effect:"dmgReduce10" },
];

const BIOME_BY_FLOOR = [
  { key:"crypt", name:"Whispering Crypt", floors:[1,2,3,4] },
  { key:"thicket", name:"Withered Thicket", floors:[5,6,7,8] },
  { key:"forge", name:"Ashen Forge", floors:[9,10,11,12] },
  { key:"rift", name:"Rift Veins", floors:[13,14,15,16] },
];

const EVENT_DEFINITIONS = [
  {
    id:"relic_bargain",
    name:"Reliquary of Ash",
    icon:"🗿",
    desc:"An obsidian reliquary hums. Power answers sacrifice.",
    baseWeight:11,
    biomeWeights:{ forge:1.6, rift:1.25 },
    minFloor:2,
    options:[
      { id:"offer_blood", label:"Offer Blood", preview:"Lose 18% max HP. Gain a relic.", outcomes:[{ weight:100, effects:[{ type:"loseHpPct", value:18 }, { type:"gainRelic", rarity:"legendary" }] }] },
      { id:"observe", label:"Walk Away", preview:"No cost. No reward.", outcomes:[{ weight:100, effects:[{ type:"log", text:"You leave the reliquary untouched." }] }] },
    ],
  },
  {
    id:"coin_well",
    name:"Wishing Well",
    icon:"🪙",
    desc:"Coins vanish in the water, and fate shifts beneath the surface.",
    baseWeight:14,
    biomeWeights:{ crypt:1.3, thicket:1.2 },
    options:[
      { id:"gamble_small", label:"Toss 30g", preview:"30g risk. 45% jackpot, 35% refund, 20% bust.", condition:ctx=>ctx.player.gold>=30, outcomes:[
        { weight:45, effects:[{ type:"spendGold", value:30 }, { type:"gainGold", value:95 }, { type:"log", text:"The well erupts with coin." }] },
        { weight:35, effects:[{ type:"spendGold", value:30 }, { type:"gainGold", value:30 }, { type:"log", text:"The well spits your coin back." }] },
        { weight:20, effects:[{ type:"spendGold", value:30 }, { type:"log", text:"The well swallows your offering." }] },
      ]},
      { id:"gamble_big", label:"Toss 70g", preview:"70g risk. 30% relic, 40% rich return, 30% bust.", condition:ctx=>ctx.player.gold>=70, outcomes:[
        { weight:30, effects:[{ type:"spendGold", value:70 }, { type:"gainRelic", rarity:"mythic" }, { type:"log", text:"A relic rises from the depths!" }] },
        { weight:40, effects:[{ type:"spendGold", value:70 }, { type:"gainGold", value:165 }] },
        { weight:30, effects:[{ type:"spendGold", value:70 }, { type:"loseHpPct", value:10 }] },
      ]},
      { id:"leave", label:"Keep Your Gold", preview:"No changes.", outcomes:[{ weight:100, effects:[{ type:"log", text:"You choose certainty over greed." }] }] },
    ],
  },
  {
    id:"purging_flame",
    name:"Purging Flame",
    icon:"🔥",
    desc:"A ritual pyre can burn away one burdening trait.",
    baseWeight:9,
    biomeWeights:{ forge:1.4 },
    minFloor:4,
    options:[
      { id:"purge_trait", label:"Burn a Trait", preview:"Remove 1 random trait. Gain +1 skill point.", condition:ctx=>(ctx.player.traits||[]).length>0, outcomes:[{ weight:100, effects:[{ type:"removeTrait" }, { type:"gainSkillPoint", value:1 }] }] },
      { id:"meditate", label:"Meditate", preview:"Restore 20% HP and 20% MP.", outcomes:[{ weight:100, effects:[{ type:"healHpPct", value:20 }, { type:"healMpPct", value:20 }] }] },
    ],
  },
  {
    id:"battle_manuals",
    name:"Forgotten Manuals",
    icon:"📘",
    desc:"Tattered manuals outline impossible techniques.",
    baseWeight:13,
    biomeWeights:{ crypt:0.85, thicket:1.3, rift:1.35 },
    options:[
      { id:"focus_upgrade", label:"Focus Drill", preview:"Upgrade one random skill by 1 level.", condition:ctx=>(ctx.player.skills||[]).length>0, outcomes:[{ weight:100, effects:[{ type:"upgradeSkill", levels:1 }] }] },
      { id:"take_notes", label:"Take Notes", preview:"All skills gain 35% of XP requirement.", condition:ctx=>(ctx.player.skills||[]).length>0, outcomes:[{ weight:100, effects:[{ type:"trainAllSkillsPct", value:35 }] }] },
      { id:"ignore", label:"Ignore", preview:"No changes.", outcomes:[{ weight:100, effects:[{ type:"log", text:"The manuals remain unread." }] }] },
    ],
  },
];

// ─── UTILITY ────────────────────────────────────────────────────────────
const rng = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const chance = p => Math.random() * 100 < p;
const pick = a => a[rng(0, a.length - 1)];
const weightedPick = (entries = []) => {
  const total = entries.reduce((sum, entry) => sum + Math.max(0, entry.weight || 0), 0);
  if (total <= 0) return entries[0] || null;
  let roll = Math.random() * total;
  for (const entry of entries) {
    roll -= Math.max(0, entry.weight || 0);
    if (roll <= 0) return entry;
  }
  return entries[entries.length - 1] || null;
};
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const uid = () => Math.random().toString(36).slice(2, 9);
const SET_EFFECT_FIELDS = ["str","agi","int","vit","luk","atkFlat","defFlat","magicFlat","critChance","dodgeChance","lifestealPct","manaRegenVal","cdReduction","fireAmp","iceAmp","thornsPct","maxHpPct","maxMpPct","damagePct","bossDamagePct"];

function getBiomeForFloor(floor = 1) {
  return BIOME_BY_FLOOR.find(biome => biome.floors.includes(((floor - 1) % 16) + 1)) || BIOME_BY_FLOOR[0];
}

function rollRarity(luck = 0) {
  const adj = RARITY_WEIGHTS.map(r => r.r === "common" ? { ...r, w: Math.max(5, r.w - luck * 2) } : { ...r, w: r.w + (r.r !== "uncommon" ? luck * 0.5 : luck * 0.3) });
  const total = adj.reduce((s, r) => s + r.w, 0);
  let roll = Math.random() * total;
  for (const r of adj) { roll -= r.w; if (roll <= 0) return r.r; }
  return "common";
}

function createEmptySetEffects() {
  return Object.fromEntries(SET_EFFECT_FIELDS.map(field => [field, 0]));
}

function getBasePoolByType(type) {
  const bases = type === "weapon" ? WEAPON_BASES : type === "armor" ? ARMOR_BASES : ACCESSORY_BASES;
  return bases.filter(base => !base.setKey);
}

function getAllSetBases() {
  return [...WEAPON_BASES, ...ARMOR_BASES, ...ACCESSORY_BASES].filter(base => base.setKey);
}

function applyEffectTotals(total, effects = {}) {
  Object.entries(effects).forEach(([key, value]) => {
    total[key] = (total[key] || 0) + value;
  });
  return total;
}

function getEquippedSetState(equipment) {
  const pieceMap = {};
  Object.values(equipment || DEFAULT_EQUIPMENT).filter(Boolean).forEach(item => {
    if (!item?.setKey || !ITEM_SETS[item.setKey]) return;
    if (!pieceMap[item.setKey]) pieceMap[item.setKey] = new Set();
    pieceMap[item.setKey].add(item.setPiece || item.name);
  });

  const summaries = Object.entries(pieceMap).map(([setKey, pieces]) => {
    const set = ITEM_SETS[setKey];
    const count = pieces.size;
    return {
      key: setKey,
      name: set.name,
      color: set.color,
      count,
      totalPieces: set.totalPieces,
      equippedPieces: [...pieces],
      bonuses: set.bonuses.map(bonus => ({ ...bonus, active: count >= bonus.pieces })),
    };
  });

  const totals = createEmptySetEffects();
  summaries.forEach(summary => {
    summary.bonuses.forEach(bonus => {
      if (bonus.active) applyEffectTotals(totals, bonus.effects);
    });
  });

  return { summaries, totals };
}

function rollEliteAffixes(floor) {
  const pool = Object.keys(ELITE_AFFIXES);
  const affixes = [];
  const count = floor >= 24 ? 2 : floor >= 10 && chance(45) ? 2 : 1;
  while (affixes.length < count) {
    const key = pick(pool.filter(entry => !affixes.includes(entry)));
    affixes.push(key);
  }
  return affixes;
}

function getItemBuyPrice(item, level) {
  const base = Math.round(({common:15,uncommon:30,rare:60,epic:120,legendary:250,mythic:500}[item.rarity] || 30) * (1 + level * 0.1));
  return item.setKey ? Math.round(base * 1.25) : base;
}

function applyOutgoingDamageBonus(dmg, st, target) {
  let mult = 1 + ((st?.damagePct || 0) / 100);
  if (target?.isBoss) mult += (st?.bossDamagePct || 0) / 100;
  return Math.max(1, Math.round(dmg * mult));
}

function addItemsToInventory(player, items) {
  const rewards = (items || [])
    .filter(Boolean)
    .map(item => ({ ...item, id:item.id || uid(), qty:item.qty || 1 }));
  if (!rewards.length) return [];
  player.inventory = [...(player.inventory || []), ...rewards];
  return rewards;
}

function addPassives(player, passiveKeys) {
  const existing = new Set((player.passives || []).map(passive => passive.key));
  const added = (passiveKeys || [])
    .filter(Boolean)
    .filter(key => !existing.has(key))
    .map(key => ({ ...PASSIVE_DATA[key], key }));
  if (!added.length) return [];
  player.passives = [...(player.passives || []), ...added];
  return added;
}

function generateItem(lvl, luck, forced, options = {}) {
  const rar = forced || rollRarity(luck);
  const rm = RARITY[rar].mult;
  const type = chance(40) ? "weapon" : chance(55) ? "armor" : "accessory";
  const setChance = options.forceSet ? 100 : clamp(22 + lvl * 0.5 + luck * 1.4 + (options.setChanceBonus || 0), 0, 78);
  const base = chance(setChance) ? pick(getAllSetBases()) : pick(getBasePoolByType(type));
  const lm = 1 + lvl * 0.12;
  const item = { id:uid(), name:base.name, type:base.type, slot:base.slot, icon:base.icon, rarity:rar, rarityColor:RARITY[rar].color, rarityName:RARITY[rar].name, atk:Math.round((base.baseAtk||0)*rm*lm), def:Math.round((base.baseDef||0)*rm*lm), magic:Math.round((base.baseMagic||0)*rm*lm), bonusStats:{}, uniqueEffect:null, setKey:base.setKey||null, setPiece:base.setPiece||null, setName:base.setKey ? ITEM_SETS[base.setKey]?.name : null };
  if (base.baseStat) Object.entries(base.baseStat).forEach(([k,v]) => { item.bonusStats[k] = Math.round(v*rm*lm); });
  const bc = rar==="common"?0:rar==="uncommon"?1:rar==="rare"?2:rar==="epic"?2:3;
  const sp = ["str","agi","int","vit","luk"];
  for (let i=0;i<bc;i++){const s=pick(sp);item.bonusStats[s]=(item.bonusStats[s]||0)+rng(1,Math.ceil(3*rm*lm));}
  if(["legendary","mythic"].includes(rar))item.uniqueEffect=pick(UNIQUE_EFFECTS);
  if(rar==="epic"&&chance(30))item.uniqueEffect=pick(UNIQUE_EFFECTS);
  return item;
}

function getItemSellPrice(item) {
  const bp = {common:15,uncommon:30,rare:60,epic:120,legendary:250,mythic:500};
  const sm = {common:0.3,uncommon:0.35,rare:0.4,epic:0.45,legendary:0.5,mythic:0.55};
  const setValue = item.setKey ? 18 : 0;
  return Math.max(1, Math.round((bp[item.rarity]||15) * (sm[item.rarity]||0.3) + (item.atk + item.def + (item.magic||0)) * 0.5 + setValue));
}

function generateEnemy(lvl, floor) {
  const tier = floor < 5 ? 1 : floor < 15 ? rng(1,2) : floor < 30 ? rng(2,3) : floor < 45 ? rng(3,4) : 4;
  const pool = ENEMY_TEMPLATES.filter(e=>e.tier<=tier);
  const base = pick(pool);
  const scale = 1+lvl*0.18+floor*0.08;
  const elite = chance(10 + floor * 0.35);
  const em = elite ? 1.55 : 1;
  const enemy = { id:uid(), name:elite?`Elite ${base.name}`:base.name, icon:base.icon, hp:Math.round(base.hp*scale*em), maxHp:Math.round(base.hp*scale*em), atk:Math.round(base.atk*scale*em), def:Math.round(base.def*scale*em), xp:Math.round(base.xp*scale*em), gold:Math.round(base.gold*scale*em), behavior:base.behavior, isElite:elite, statusEffects:[], tier, statusOnHit:base.statusOnHit||null, statusChance:base.statusChance||0, affixes:[] };
  if (elite) {
    enemy.affixes = rollEliteAffixes(floor);
    enemy.affixes.forEach(affix => {
      if (affix === "frenzied") enemy.atk = Math.round(enemy.atk * 1.25);
      if (affix === "juggernaut") { enemy.hp = Math.round(enemy.hp * 1.35); enemy.maxHp = enemy.hp; enemy.def = Math.round(enemy.def * 1.2); }
      if (affix === "hoarder") { enemy.gold = Math.round(enemy.gold * 1.6); enemy.xp = Math.round(enemy.xp * 1.15); }
    });
    enemy.name = `${enemy.affixes.map(affix => ELITE_AFFIXES[affix].name).join(" ")} ${base.name}`;
  }
  return enemy;
}

function generateBoss(lvl, idx, bossHistory = []) {
  const tier = idx < 2 ? 1 : idx < 4 ? 2 : idx < 6 ? 3 : 4;
  const pool = BOSS_TEMPLATES.filter(b => b.tier === tier);
  const options = pool.filter(b => !bossHistory.includes(b.name));
  const b = pick(options.length ? options : pool);
  const s = 1 + lvl * 0.15 + idx * 0.22 + tier * 0.08;
  return { id:uid(), name:b.name, icon:b.icon, isBoss:true, hp:Math.round(b.hp*s), maxHp:Math.round(b.hp*s), atk:Math.round(b.atk*s), def:Math.round(b.def*s), xp:Math.round(b.xp*s), gold:Math.round(b.gold*s), behavior:b.behavior, mechanic:b.mechanic, mechanicDesc:b.mechanicDesc, statusEffects:[], mechanicCounter:0, enraged:false, rebirthUsed:false };
}

const DEFAULT_EQUIPMENT = { weapon:null, armor:null, accessory1:null, accessory2:null };

function normalizePlayerState(p) {
  if (!p) return null;
  return {
    ...p,
    inventory: Array.isArray(p.inventory) ? p.inventory.filter(Boolean) : [],
    skills: Array.isArray(p.skills) ? p.skills.filter(Boolean) : [],
    passives: Array.isArray(p.passives) ? p.passives.filter(Boolean) : [],
    traits: Array.isArray(p.traits) ? p.traits.filter(Boolean) : [],
    statusEffects: Array.isArray(p.statusEffects) ? p.statusEffects.filter(Boolean) : [],
    equipment: { ...DEFAULT_EQUIPMENT, ...(p.equipment || {}) },
  };
}

function calcPlayerStats(p) {
  p = normalizePlayerState(p);
  let tAtk=p.str*2, tDef=p.vit, tMag=p.int*2.5;
  let bStr=0,bAgi=0,bInt=0,bVit=0,bLuk=0;
  Object.values(p.equipment).forEach(item=>{if(!item)return;tAtk+=item.atk||0;tDef+=item.def||0;tMag+=item.magic||0;bStr+=item.bonusStats?.str||0;bAgi+=item.bonusStats?.agi||0;bInt+=item.bonusStats?.int||0;bVit+=item.bonusStats?.vit||0;bLuk+=item.bonusStats?.luk||0;});
  const setState = getEquippedSetState(p.equipment);
  bStr+=setState.totals.str||0;
  bAgi+=setState.totals.agi||0;
  bInt+=setState.totals.int||0;
  bVit+=setState.totals.vit||0;
  bLuk+=setState.totals.luk||0;
  tAtk+=setState.totals.atkFlat||0;
  tDef+=setState.totals.defFlat||0;
  tMag+=setState.totals.magicFlat||0;
  const eStr=p.str+bStr,eAgi=p.agi+bAgi,eInt=p.int+bInt,eVit=p.vit+bVit,eLuk=p.luk+bLuk;
  tAtk+=bStr*2;tDef+=bVit;tMag+=bInt*2.5;
  let maxHp=80+eVit*12+p.level*5, maxMp=30+eInt*6+p.level*3;
  let critCh=5+eLuk*0.8+eAgi*0.3, dodgeCh=eAgi*0.5+eLuk*0.2;
  critCh+=setState.totals.critChance||0;
  dodgeCh+=setState.totals.dodgeChance||0;
  maxHp=Math.round(maxHp*(1+(setState.totals.maxHpPct||0)/100));
  maxMp=Math.round(maxMp*(1+(setState.totals.maxMpPct||0)/100));

  // Passives
  let lifestealPct=setState.totals.lifestealPct||0, manaRegenVal=setState.totals.manaRegenVal||0, cdReduction=setState.totals.cdReduction||0, fireAmp=setState.totals.fireAmp||0, iceAmp=setState.totals.iceAmp||0, thornsPct=setState.totals.thornsPct||0;
  p.passives.forEach(ps=>{const pd=PASSIVE_DATA[ps.key];if(!pd)return;
    if(pd.stat==="critChance")critCh+=pd.value*ps.level;
    if(pd.stat==="dodgeChance")dodgeCh+=pd.value*ps.level;
    if(pd.stat==="lifesteal")lifestealPct+=pd.value*ps.level;
    if(pd.stat==="manaRegen")manaRegenVal+=pd.value*ps.level;
    if(pd.stat==="cdReduction")cdReduction+=pd.value*ps.level;
    if(pd.stat==="fireAmp")fireAmp+=pd.value*ps.level;
    if(pd.stat==="iceAmp")iceAmp+=pd.value*ps.level;
    if(pd.stat==="thorns")thornsPct+=pd.value*ps.level;
  });

  // Traits
  p.traits.forEach(t=>{
    if(t.effect==="defBoost20")tDef=Math.round(tDef*1.2);
    if(t.effect==="manaBoost30")maxMp=Math.round(maxMp*1.3);
    if(t.effect==="glassCannon"){tAtk=Math.round(tAtk*1.4);tMag=Math.round(tMag*1.4);maxHp=Math.round(maxHp*0.8);}
    if(t.effect==="luckyAll"){critCh+=10;dodgeCh+=5;}
  });

  // Collect equipped unique effects
  const uniqueEffects = Object.values(p.equipment).filter(Boolean).map(i=>i.uniqueEffect).filter(Boolean);
  const damagePct = setState.totals.damagePct || 0;
  const bossDamagePct = setState.totals.bossDamagePct || 0;

  return{totalAtk:tAtk,totalDef:tDef,totalMagic:tMag,maxHp,maxMp,critCh:Math.min(critCh,80),dodgeCh:Math.min(dodgeCh,50),effStr:eStr,effAgi:eAgi,effInt:eInt,effVit:eVit,effLuk:eLuk, lifestealPct,manaRegenVal,cdReduction,fireAmp,iceAmp,thornsPct,damagePct,bossDamagePct,uniqueEffects,setSummaries:setState.summaries};
}

function isSpellSkill(skill){
  return Boolean(skill) && (skill.tree==="magic" || skill.stat==="int");
}

function getPrimarySkillStat(skill, st){
  if(!skill||!st)return 0;
  if(skill.stat==="int")return st.effInt;
  if(skill.stat==="agi")return st.effAgi;
  return st.effStr;
}

function getSkillBasePower(skill, st){
  if(!skill)return st?.totalAtk||0;
  if(!st)return skill.baseDmg||0;
  if(isSpellSkill(skill)){
    const primaryStat=getPrimarySkillStat(skill, st);
    const skillRank=Math.max(0,(skill.level||1)-1);
    return skill.baseDmg + st.totalMagic*0.34 + primaryStat*0.4 + skillRank*(1.2 + primaryStat*0.04);
  }
  const sm=skill.stat==="str"?st.totalAtk:skill.stat==="int"?st.totalMagic:st.totalAtk;
  return skill.baseDmg + sm*0.4;
}

function getSkillPreviewPower(skill, st){
  if(!skill||skill.baseDmg<=0||!st)return null;
  return Math.max(1,Math.round(getSkillBasePower(skill, st)));
}

function xpForLevel(lv){return Math.round(40*Math.pow(1.25,lv-1));}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────
export default function Game(){
  const[phase,setPhase]=useState("menu");
  const[log,setLog]=useState([]);
  const logRef=useRef(null);
  const[player,setPlayer]=useState(null);
  const[enemy,setEnemy]=useState(null);
  const[encounter,setEncounter]=useState(0);
  const[floor,setFloor]=useState(1);
  const[bossCount,setBossCount]=useState(0);
  const[bossHistory,setBossHistory]=useState([]);
  const[combatTurn,setCombatTurn]=useState(0);
  const[parrying,setParrying]=useState(false);
  const[defending,setDefending]=useState(false);
  const[berserkTurns,setBerserkTurns]=useState(0);
  const[smokeTurns,setSmokeTurns]=useState(0);
  const[shieldHp,setShieldHp]=useState(0);
  const[familiarHp,setFamiliarHp]=useState(0);
  const[potionUsedThisTurn,setPotionUsedThisTurn]=useState(false);
  const[shopItems,setShopItems]=useState([]);
  const[shopConsumables,setShopConsumables]=useState([]);
  const[eventData,setEventData]=useState(null);
  const[mapNodes,setMapNodes]=useState([]);
  const[metaUnlocks,setMetaUnlocks]=useState(()=>{try{return JSON.parse(localStorage.getItem("rl_meta")||"{}");}catch{return{};}});
  const[skillCooldowns,setSkillCooldowns]=useState({});
  const[runs,setRuns]=useState(()=>{try{return parseInt(localStorage.getItem("rl_runs")||"0");}catch{return 0;}});
  const[highestFloor,setHighestFloor]=useState(()=>{try{return parseInt(localStorage.getItem("rl_best")||"0");}catch{return 0;}});
  const[animDmg,setAnimDmg]=useState(null);
  const[pDmgAnim,setPDmgAnim]=useState(null);
  const[spellEffect,setSpellEffect]=useState(null);
  const[skillChoiceQueue,setSkillChoiceQueue]=useState([]);

  useEffect(()=>{if(logRef.current)logRef.current.scrollTop=logRef.current.scrollHeight;},[log]);
  useEffect(()=>{
    if(phase!=="explore"||!player)return;
    if(mapNodes.length>0)return;
    setMapNodes(rollMapNodes(encounter+1));
  },[phase,player,encounter,mapNodes.length]);
  const addLog=useCallback((msg,type="info")=>{setLog(prev=>[...prev.slice(-80),{msg,type,id:uid()}]);},[]);
  const stats=useMemo(()=>player?calcPlayerStats(player):null,[player]);

  function createCharacter(){
    const p={name:"Hunter",level:1,xp:0,xpReq:xpForLevel(1),str:5,agi:5,int:5,vit:5,luk:3,statPoints:5,skillPoints:0,gold:30,hp:0,mp:0,statusEffects:[],
      skills:[{...SKILL_DATA.slash,key:"slash",cd:0},{...SKILL_DATA.fireball,key:"fireball",cd:0}],
      passives:[{...PASSIVE_DATA.critBoost,key:"critBoost"},{...PASSIVE_DATA.manaRegen,key:"manaRegen"}],
      traits:[],equipment:{weapon:null,armor:null,accessory1:null,accessory2:null},
      inventory:[{...CONSUMABLES[0],id:uid(),qty:3},{...CONSUMABLES[2],id:uid(),qty:2}],kills:0,bossKills:0};
    if(metaUnlocks.bonusStr)p.str+=metaUnlocks.bonusStr;
    if(metaUnlocks.bonusInt)p.int+=metaUnlocks.bonusInt;
    if(metaUnlocks.startGold)p.gold+=metaUnlocks.startGold;
    const s=calcPlayerStats(p);p.hp=s.maxHp;p.mp=s.maxMp;
    p.equipment.weapon={id:uid(),name:"Rusty Shortsword",type:"weapon",slot:"weapon",icon:"🗡️",rarity:"common",rarityColor:RARITY.common.color,rarityName:"Common",atk:4,def:0,magic:0,bonusStats:{},uniqueEffect:null};
    setPlayer(p);setFloor(1);setEncounter(0);setBossCount(0);setBossHistory([]);setLog([]);setSkillCooldowns({});setCombatTurn(0);setParrying(false);setDefending(false);setBerserkTurns(0);setSmokeTurns(0);setShieldHp(0);setFamiliarHp(0);setPotionUsedThisTurn(false);setSkillChoiceQueue([]);setMapNodes([]);
    addLog("⚔️ A new hunter awakens. No class — forge your own path.","system");
    addLog("📌 You have 5 stat points to allocate. Shape your build!","system");
    addLog("The dungeon gates open before you...","narrative");
    setPhase("explore");
  }

  function respecStats(){
    setPlayer(prev=>{const p=normalizePlayerState(prev);const base=5;const metaStr=metaUnlocks.bonusStr||0;const metaInt=metaUnlocks.bonusInt||0;
      const refund=(p.str-(base+metaStr))+(p.agi-base)+(p.int-(base+metaInt))+(p.vit-base)+(p.luk-3);
      p.str=base+metaStr;p.agi=base;p.int=base+metaInt;p.vit=base;p.luk=3;p.statPoints+=Math.max(0,refund);
      const ns=calcPlayerStats(p);p.hp=Math.min(p.hp,ns.maxHp);p.mp=Math.min(p.mp,ns.maxMp);return p;});
    addLog("🔄 Stats reset! Reallocate your points.","system");
  }

  function respecSkillPoints(){
    setPlayer(prev=>{const p=normalizePlayerState(prev);let ref=0;
      p.passives=p.passives.map(ps=>{if(ps.level>1){ref+=ps.level-1;return{...PASSIVE_DATA[ps.key],key:ps.key,level:1};}return{...ps};});
      p.skillPoints+=ref;return p;});
    addLog("🔄 Skill points reset!","system");
  }

  function sellItem(item){
    const price=getItemSellPrice(item);
    setPlayer(prev=>{const p=normalizePlayerState(prev);p.gold+=price;p.inventory=p.inventory.filter(i=>i.id!==item.id);return p;});
    addLog(`💰 Sold ${item.icon} ${item.name} for ${price} gold.`,"gold");
  }

  function generateRelic(lvl, luck, rarity = "legendary") {
    const relic = generateItem(lvl, luck + 14, rarity, { forceSet:false, setChanceBonus:20 });
    relic.name = `${relic.name} Relic`;
    relic.type = "relic";
    relic.slot = "accessory1";
    return relic;
  }

  function rollMapNodes(nextEncounterCount) {
    const forceBoss = nextEncounterCount % 7 === 0;
    if (forceBoss) return [{ id:uid(), type:"boss", icon:"👑", label:"Boss Lair", preview:"Mandatory boss fight." }];
    const pool = [
      { type:"combat", icon:"⚔️", label:"Battle", weight:54 },
      { type:"event", icon:"❓", label:"Event", weight:26 + Math.min(10, Math.floor(nextEncounterCount / 3)) },
      { type:"merchant", icon:"🏪", label:"Merchant", weight:12 },
      { type:"rest", icon:"🏕️", label:"Camp", weight:16 },
    ];
    const options = [];
    for (let i = 0; i < 3; i++) {
      const rolled = weightedPick(pool.map(entry => ({ ...entry, weight: Math.max(1, entry.weight - (options.find(o => o.type === entry.type) ? 10 : 0)) })));
      options.push({ id:uid(), ...rolled, preview:rolled.type === "event" ? "Weighted event outcome." : rolled.type === "merchant" ? "Open shop inventory." : rolled.type === "rest" ? "Recover HP/MP." : "Start standard encounter." });
    }
    return options;
  }

  function triggerRandomEvent(forcedId = null){
    const biome = getBiomeForFloor(floor);
    const weightedEvents = EVENT_DEFINITIONS
      .filter(def => !def.minFloor || floor >= def.minFloor)
      .map(def => ({ def, weight: Math.max(1, Math.round(def.baseWeight * (def.biomeWeights?.[biome.key] || 1) * (def.floorScale ? def.floorScale(floor) : 1))) }));
    const chosen = forcedId ? EVENT_DEFINITIONS.find(def => def.id === forcedId) : weightedPick(weightedEvents)?.def;
    if(!chosen)return;
    const ctx = { player, floor, biome };
    const options = chosen.options.map(option => ({ ...option, disabled: option.condition ? !option.condition(ctx) : false }));
    const ev = { ...chosen, options, biome };
    setEventData(ev);
    addLog(`\n${ev.icon} ${ev.name} [${biome.name}]`,"event");
    addLog(`   ${ev.desc}`,"event");
    setPhase("event");
  }

  function applyEventEffect(effect, p, s, resolvedLogs){
    if (!effect) return;
    if (effect.type === "loseHpPct") {
      const value = Math.max(1, Math.round(s.maxHp * (effect.value / 100)));
      p.hp = Math.max(1, p.hp - value);
      resolvedLogs.push(`💥 -${value} HP`);
    } else if (effect.type === "healHpPct") {
      const value = Math.max(1, Math.round(s.maxHp * (effect.value / 100)));
      p.hp = Math.min(s.maxHp, p.hp + value);
      resolvedLogs.push(`💚 +${value} HP`);
    } else if (effect.type === "healMpPct") {
      const value = Math.max(1, Math.round(s.maxMp * (effect.value / 100)));
      p.mp = Math.min(s.maxMp, p.mp + value);
      resolvedLogs.push(`💧 +${value} MP`);
    } else if (effect.type === "spendGold") {
      p.gold = Math.max(0, p.gold - (effect.value || 0));
      resolvedLogs.push(`💰 -${effect.value}g`);
    } else if (effect.type === "gainGold") {
      p.gold += effect.value || 0;
      resolvedLogs.push(`💰 +${effect.value}g`);
    } else if (effect.type === "gainRelic") {
      const [item] = addItemsToInventory(p, [generateRelic(p.level, s.effLuk, effect.rarity || "legendary")]);
      if (item) resolvedLogs.push(`🧿 Relic: ${item.icon} ${item.rarityName} ${item.name}`);
    } else if (effect.type === "removeTrait") {
      if ((p.traits || []).length > 0) {
        const removed = pick(p.traits);
        p.traits = p.traits.filter(tr => tr.name !== removed.name);
        resolvedLogs.push(`🧹 Removed trait: ${removed.name}`);
      } else resolvedLogs.push("🧹 No traits to remove.");
    } else if (effect.type === "gainSkillPoint") {
      p.skillPoints += effect.value || 1;
      resolvedLogs.push(`🧠 +${effect.value || 1} skill point`);
    } else if (effect.type === "upgradeSkill") {
      if ((p.skills || []).length > 0) {
        const sk = pick(p.skills);
        sk.level += effect.levels || 1;
        sk.baseDmg = Math.round(sk.baseDmg * (1 + 0.12 * (effect.levels || 1)));
        resolvedLogs.push(`📈 ${sk.name} upgraded to Lv.${sk.level}`);
      } else resolvedLogs.push("📈 No skills available to upgrade.");
    } else if (effect.type === "trainAllSkillsPct") {
      p.skills.forEach(sk => { sk.xp += Math.round(sk.xpReq * ((effect.value || 0) / 100)); checkSkillLevelUp(sk, p); });
      resolvedLogs.push(`📚 All skills gained ${effect.value}% XP`);
    } else if (effect.type === "log") {
      resolvedLogs.push(`ℹ️ ${effect.text}`);
    }
  }

  function resolveEventOption(optionId){
    const ev = eventData;
    if(!ev)return;
    const selected = ev.options.find(option => option.id === optionId);
    if(!selected || selected.disabled)return;
    setPlayer(prev=>{
      const base=normalizePlayerState(prev);
      const p={...base,statusEffects:[...base.statusEffects],inventory:base.inventory.map(i=>({...i})),skills:base.skills.map(s=>({...s})),passives:base.passives.map(ps=>({...ps})),traits:[...base.traits]};
      const s=calcPlayerStats(p);
      const branch = weightedPick((selected.outcomes || []).map((entry, index) => ({ ...entry, index, weight:entry.weight || 1 })));
      const resolvedLogs = [];
      (branch?.effects || []).forEach(effect => applyEventEffect(effect, p, s, resolvedLogs));
      addLog(`🧭 Option: ${selected.label}`,"event");
      addLog(`🎲 Branch #${(branch?.index ?? 0) + 1} resolved.`,"event");
      resolvedLogs.forEach(msg => addLog(`   ${msg}`,"event"));
      return p;
    });
    setEventData(null);
    setPhase("explore");
  }

  function nextEncounter(nodeType = "combat"){
    if(!player)return;
    const enc=encounter+1;setEncounter(enc);setPotionUsedThisTurn(false);setDefending(false);setMapNodes([]);
    if(enc%7===0 || nodeType==="boss"){const boss=generateBoss(player.level,bossCount,bossHistory);setEnemy(boss);setPhase("boss_intro");addLog(`\n🔴 BOSS: ${boss.icon} ${boss.name}!`,"boss");addLog(`   ${boss.mechanicDesc}`,"boss");return;}
    if(nodeType==="event"){triggerRandomEvent();return;}
    if(nodeType==="merchant"){
      setShopItems(Array.from({length:4},()=>generateItem(player.level,player.luk,null,{ setChanceBonus:12 })));
      setShopConsumables(CONSUMABLES.slice(0,5).map(c=>({...c,id:uid(),qty:1})));
      setPhase("shop");
      addLog("\n🏪 A merchant route opens.","event");
      return;
    }
    if(nodeType==="rest"){
      setPlayer(prev=>{
        const p=normalizePlayerState(prev);const s=calcPlayerStats(p);
        const h=Math.round(s.maxHp*0.3),m=Math.round(s.maxMp*0.3);
        return {...p,hp:Math.min(s.maxHp,p.hp+h),mp:Math.min(s.maxMp,p.mp+m)};
      });
      addLog("🏕️ Campfire: restored 30% HP/MP.","heal");
      setPhase("explore");
      return;
    }
    const e=generateEnemy(player.level,floor);setEnemy(e);setCombatTurn(0);setParrying(false);setDefending(false);setBerserkTurns(0);setSmokeTurns(0);setShieldHp(0);setFamiliarHp(0);
    setSkillCooldowns(prev=>{const n={};Object.entries(prev).forEach(([k,v])=>{if(v>0)n[k]=v-1;});return n;});
    addLog(`\n⚡ ${e.isElite?"ELITE ":""}${e.icon} ${e.name} appears! [HP: ${e.hp}]`,e.isElite?"elite":"encounter");
    if(e.affixes?.length)addLog(`   Affixes: ${e.affixes.map(affix => ELITE_AFFIXES[affix].name).join(", ")}`,"elite");
    setPhase("combat");
  }

  function checkSkillLevelUp(sk,p){
    while(sk.xp>=sk.xpReq){sk.xp-=sk.xpReq;sk.level++;sk.xpReq=Math.round(sk.xpReq*1.25);sk.baseDmg=Math.round(sk.baseDmg*1.15);
      addLog(`⬆️ ${sk.name} → Lv.${sk.level}!`,"levelup");
      if(sk.level>=5&&sk.evolution&&!p.skills.find(s=>s.key===sk.evolution)){const evo=SKILL_DATA[sk.evolution];if(evo){const idx=p.skills.findIndex(s=>s.key===sk.key);if(idx>=0){p.skills[idx]={...evo,key:sk.evolution,cd:0};addLog(`🌟 ${sk.name} evolved → ${evo.name}!`,"legendary");}}}
    }
  }

  // ─── SPELL CHOICE ON LEVEL UP ─────────────────────────────
  function chooseSkill(key){
    setPlayer(prev=>{
      const p=normalizePlayerState(prev);
      const sk=SKILL_DATA[key];
      if(!sk||p.skills.find(s=>s.key===key))return prev;
      p.skills=[...p.skills,{...sk,key,cd:0}];
      return p;
    });
    addLog(`🌟 Learned: ${SKILL_DATA[key].icon} ${SKILL_DATA[key].name}!`,"legendary");
    setSkillChoiceQueue(prev=>prev.slice(1));
  }

  // ─── POTION USE (FREE ACTION — does NOT end turn) ─────────
  function usePotion(itemIdx){
    setPlayer(prev=>{
      const base=normalizePlayerState(prev);
      const p={...base,inventory:base.inventory.map(i=>({...i}))};
      const st=calcPlayerStats(p);
      const item=p.inventory[itemIdx];
      if(!item)return prev;
      if(item.effect==="heal"){const healed=Math.min(st.maxHp-p.hp,item.value);p.hp=Math.min(st.maxHp,p.hp+item.value);addLog(`🧪 ${item.name}: +${healed} HP [${p.hp}/${st.maxHp}]`,"heal");}
      else if(item.effect==="mana"){const rest=Math.min(st.maxMp-p.mp,item.value);p.mp=Math.min(st.maxMp,p.mp+item.value);addLog(`💧 ${item.name}: +${rest} MP [${p.mp}/${st.maxMp}]`,"heal");}
      else if(item.effect==="damage"){if(enemy){setEnemy(e=>{if(!e)return e;const ne={...e,hp:e.hp-item.value};addLog(`📜 ${item.name}: ${item.value} damage!`,"combat");setAnimDmg(item.value);setTimeout(()=>setAnimDmg(null),600);return ne;});}}
      else if(item.effect==="cleanse"){p.statusEffects=[];addLog("🌿 Cleansed!","heal");}
      item.qty=(item.qty||1)-1;
      p.inventory=p.inventory.filter(i=>(i.qty||0)>0);
      return p;
    });
    setPotionUsedThisTurn(true);
  }

  // ─── COMBAT ───────────────────────────────────────────────
  function playerAction(action,skillIdx){
    if(!enemy||!player)return;
    setPotionUsedThisTurn(false);
    let isDefending=false;

    setPlayer(prev=>{
      const base=normalizePlayerState(prev);
      const p={...base,statusEffects:[...base.statusEffects],skills:base.skills.map(s=>({...s})),inventory:base.inventory.map(i=>({...i})),passives:base.passives.map(ps=>({...ps})),traits:[...base.traits]};
      const st=calcPlayerStats(p);
      const e={...enemy,statusEffects:[...(enemy.statusEffects||[])]};

      const pDmg=processStatusEffects(p,false,st);
      if(pDmg>0)p.hp-=pDmg;

      const stunned=p.statusEffects.find(s=>s.type==="stun");
      const frozen=p.statusEffects.find(s=>s.type==="freeze");

      if(stunned||frozen){addLog(`💫 You are ${stunned?"stunned":"frozen"}!`,"damage");}
      else if(action==="attack"){
        let dmg=calcDmg(p,true,null,st);let crit=chance(st.critCh);if(crit)dmg=Math.round(dmg*2);
        p.traits.forEach(t=>{if(t.effect==="doubleDmg"&&p.hp<st.maxHp*0.3)dmg*=2;if(t.effect==="executeDmg"&&e.hp<e.maxHp*0.2)dmg*=3;});
        dmg=applyOutgoingDamageBonus(dmg,st,e);
        dmg=Math.max(1,dmg-Math.round(e.def*0.5));e.hp-=dmg;
        setAnimDmg(dmg);setTimeout(()=>setAnimDmg(null),600);
        addLog(`⚔️ Attack: ${dmg}${crit?" CRITICAL!":""}`,crit?"crit":"combat");
        if(st.lifestealPct>0){const ls=Math.round(dmg*(st.lifestealPct/100));p.hp=Math.min(st.maxHp,p.hp+ls);if(ls>0)addLog(`🧛 +${ls} HP`,"heal");}
      }else if(action==="skill"&&skillIdx!==undefined){
        const sk=p.skills[skillIdx];
        if(!sk){setEnemy(e);return prev;}
        const cd=skillCooldowns[sk.key]||0;
        if(cd>0){addLog(`${sk.icon} ${sk.name} on cooldown (${cd})`,"info");setEnemy(e);return prev;}
        if(p.mp<sk.manaCost){addLog(`Not enough mana!`,"damage");setEnemy(e);return prev;}
        p.mp-=sk.manaCost;

        // Spell projectile animation
        if(sk.baseDmg>0||sk.statusEffect){
          const effectIcon={burn:"🔥",bleed:"🩸",freeze:"❄️",stun:"⚡",poison:"🟢"}[sk.statusEffect]||sk.icon;
          setSpellEffect(effectIcon);setTimeout(()=>setSpellEffect(null),500);
        }

        if(sk.key==="parry"||sk.key==="perfectCounter"){setParrying(true);addLog(`${sk.icon} Counter stance!`,"combat");}
        else if(sk.key==="berserk"||sk.key==="bloodFrenzy"){const dur=sk.key==="bloodFrenzy"?4:3;setBerserkTurns(dur);addLog(`${sk.icon} ${sk.name}! +ATK ${dur} turns!`,"buff");}
        else if(sk.key==="arcaneShield"||sk.key==="dimensionalBarrier"){const sa=Math.round(st.maxHp*0.3*(sk.level*0.2+0.8));setShieldHp(sa);addLog(`${sk.icon} Shield: ${sa} HP`,"buff");}
        else if(sk.key==="summonFamiliar"||sk.key==="summonPhoenix"){setFamiliarHp(Math.round(st.maxHp*0.3));addLog(`${sk.icon} Familiar summoned!`,"buff");}
        else if(sk.key==="shadowStep"){addLog(`${sk.icon} Shadow Step! Next = crit.`,"buff");}
        else if(sk.key==="drainLife"){let d=calcDmg(p,true,sk,st);d=applyOutgoingDamageBonus(d,st,e);d=Math.max(1,d-Math.round(e.def*0.3));e.hp-=d;const h=Math.round(d*0.5);p.hp=Math.min(st.maxHp,p.hp+h);setAnimDmg(d);setTimeout(()=>setAnimDmg(null),600);addLog(`${sk.icon} Drain: ${d} dmg, +${h} HP`,"combat");}
        else if(sk.key==="healingLight"){const healAmt=Math.round(st.maxHp*0.3*(1+sk.level*0.1));p.hp=Math.min(st.maxHp,p.hp+healAmt);addLog(`${sk.icon} Healing Light: +${healAmt} HP`,"heal");}
        else if(sk.key==="divineLight"){p.hp=st.maxHp;p.mp=Math.min(st.maxMp,p.mp+20);p.statusEffects=[];addLog(`${sk.icon} Divine Light! Full restoration!`,"heal");}
        else if(sk.key==="manaBurn"){let d=calcDmg(p,true,sk,st);d=applyOutgoingDamageBonus(d,st,e);d=Math.max(1,d-Math.round(e.def*0.3));e.hp-=d;const mb=Math.round(d*0.3);p.mp=Math.min(st.maxMp,p.mp+mb);setAnimDmg(d);setTimeout(()=>setAnimDmg(null),600);addLog(`${sk.icon} Mana Burn: ${d} dmg, +${mb} MP`,"combat");}
        else if(sk.key==="smokeBomb"){setSmokeTurns(2);addLog(`${sk.icon} Smoke Bomb! Dodge greatly increased!`,"buff");}
        else{let d=calcDmg(p,true,sk,st);let c=chance(st.critCh+5);if(c)d=Math.round(d*2);
          if(sk.statusEffect==="burn"){const fa=p.passives.find(ps=>ps.key==="fireAmp");if(fa)d=Math.round(d*(1+fa.level*0.1));}
          if(sk.statusEffect==="freeze"){const ia=p.passives.find(ps=>ps.key==="iceAmp");if(ia)d=Math.round(d*(1+ia.level*0.1));}
          if(sk.statusEffect==="poison"){d=Math.round(d*1.05);} // slight poison bonus
          p.traits.forEach(t=>{if(t.effect==="doubleDmg"&&p.hp<st.maxHp*0.3)d*=2;if(t.effect==="executeDmg"&&e.hp<e.maxHp*0.2)d*=3;});
          d=applyOutgoingDamageBonus(d,st,e);
          d=Math.max(1,d-Math.round(e.def*0.4));e.hp-=d;
          setAnimDmg(d);setTimeout(()=>setAnimDmg(null),600);
          addLog(`${sk.icon} ${sk.name}: ${d}${c?" CRIT!":""}`,c?"crit":"combat");
          if(st.lifestealPct>0){const ls=Math.round(d*(st.lifestealPct/100));p.hp=Math.min(st.maxHp,p.hp+ls);if(ls>0)addLog(`🧛 +${ls} HP`,"heal");}
          if(sk.statusEffect)applyStatus(e,sk.statusEffect);
        }
        // Skill XP: 2 + floor(level * 0.8) per use — reduced grind
        sk.xp+=2+Math.floor(sk.level*0.8);checkSkillLevelUp(sk,p);
        setSkillCooldowns(prev=>({...prev,[sk.key]:Math.max(0,sk.cooldown-st.cdReduction)}));
      }else if(action==="defend"){
        isDefending=true;setDefending(true);
        addLog("🛡️ Guarding! Incoming damage halved.","buff");
      }else if(action==="flee"){
        if(enemy?.isBoss){addLog("Can't flee a boss!","damage");setEnemy(e);return prev;}
        if(chance(40+st.effAgi)){addLog("💨 Fled!","info");setEnemy(null);setPhase("explore");return p;}
        else addLog("❌ Failed to flee!","damage");
      }

      // Familiar attacks
      if(familiarHp>0&&e.hp>0){const fd=applyOutgoingDamageBonus(Math.round(st.totalMagic*0.2),st,e);e.hp-=fd;addLog(`👻 Familiar: ${fd} dmg`,"combat");}

      if(e.hp<=0)return handleEnemyDeath(e,p,st);

      // Enemy status effects
      const eDmg2=processStatusEffects(e,true,st);if(eDmg2>0)e.hp-=eDmg2;
      if(e.hp<=0)return handleEnemyDeath(e,p,st);

      const eStun=e.statusEffects.find(s=>s.type==="stun");
      const eFreeze=e.statusEffects.find(s=>s.type==="freeze");

      if(eStun||eFreeze){addLog(`💫 ${e.name} is ${eStun?"stunned":"frozen"}!`,"status");}
      else{
        if(e.isBoss){
          e.mechanicCounter=(e.mechanicCounter||0)+1;
          if(e.mechanic==="summon"&&e.mechanicCounter%3===0){addLog(`👑 Summons minions!`,"boss");e.atk=Math.round(e.atk*1.1);}
          if(e.mechanic==="phase"&&e.mechanicCounter%2===0){addLog(`👻 Phased out!`,"boss");setEnemy(e);setCombatTurn(t=>t+1);return p;}
          if(e.mechanic==="breath"&&e.mechanicCounter%3===0){let bd=Math.round(e.atk*1.5);if(isDefending)bd=Math.round(bd*0.5);bd=Math.max(1,bd-Math.round(st.totalDef*0.3));if(p.traits.find(t=>t.effect==="dmgReduce10"))bd=Math.round(bd*0.9);p.hp-=bd;applyStatus(p,"freeze");addLog(`🐲 Frost Breath: ${bd}!`,"boss");setPDmgAnim(bd);setTimeout(()=>setPDmgAnim(null),600);if(p.hp<=0)handleDeath(p);setEnemy(e);setCombatTurn(t=>t+1);return p;}
          if(e.mechanic==="venom"&&e.mechanicCounter%2===0){let vd=Math.round(e.atk*1.1);if(isDefending)vd=Math.round(vd*0.5);vd=Math.max(1,vd-Math.round(st.totalDef*0.25));if(p.traits.find(t=>t.effect==="dmgReduce10"))vd=Math.round(vd*0.9);p.hp-=vd;applyStatus(p,"poison");addLog(`☣️ Venom Burst: ${vd}!`,"boss");setPDmgAnim(vd);setTimeout(()=>setPDmgAnim(null),600);if(p.hp<=0)handleDeath(p);setEnemy(e);setCombatTurn(t=>t+1);return p;}
          if(e.mechanic==="storm"&&e.mechanicCounter%3===0){let sd=Math.round(e.atk*1.25);if(isDefending)sd=Math.round(sd*0.5);sd=Math.max(1,sd-Math.round(st.totalDef*0.25));if(p.traits.find(t=>t.effect==="dmgReduce10"))sd=Math.round(sd*0.9);p.hp-=sd;if(chance(40))applyStatus(p,"stun");addLog(`🌩️ Tempest Crash: ${sd}!`,"boss");setPDmgAnim(sd);setTimeout(()=>setPDmgAnim(null),600);if(p.hp<=0)handleDeath(p);setEnemy(e);setCombatTurn(t=>t+1);return p;}
          if(e.mechanic==="enrage"&&!e.enraged&&e.hp<e.maxHp*0.3){e.enraged=true;e.atk=Math.round(e.atk*1.5);addLog(`😈 ENRAGE!`,"boss");}
          if(e.mechanic==="barrier"&&e.mechanicCounter%2===0){const sh=Math.round(e.maxHp*0.1);e.hp=Math.min(e.maxHp,e.hp+sh);addLog(`🗿 Regen ${sh} HP`,"boss");}
          if(e.mechanic==="void"){const md=Math.round(st.maxMp*0.15);p.mp=Math.max(0,p.mp-md);addLog(`👁️ Void: -${md} MP`,"boss");}
          if(e.mechanic==="drain"&&e.mechanicCounter%2===0){let dd=Math.round(e.atk);if(isDefending)dd=Math.round(dd*0.5);dd=Math.max(1,dd-Math.round(st.totalDef*0.25));if(p.traits.find(t=>t.effect==="dmgReduce10"))dd=Math.round(dd*0.9);p.hp-=dd;const heal=Math.round(dd*0.8);e.hp=Math.min(e.maxHp,e.hp+heal);addLog(`🩸 Life Drain: ${dd} and heals ${heal}`,"boss");setPDmgAnim(dd);setTimeout(()=>setPDmgAnim(null),600);if(p.hp<=0)handleDeath(p);setEnemy(e);setCombatTurn(t=>t+1);return p;}
          if(e.mechanic==="rebirth"&&!e.rebirthUsed&&e.hp<e.maxHp*0.25){e.rebirthUsed=true;const heal=Math.round(e.maxHp*0.18);e.hp=Math.min(e.maxHp,e.hp+heal);e.atk=Math.round(e.atk*1.2);addLog(`🌱 Rebirth! +${heal} HP and empowered!`,"boss");}
          if(e.mechanic==="apocalypse"){let ad=Math.round(e.atk*0.3*e.mechanicCounter);if(isDefending)ad=Math.round(ad*0.5);p.hp-=ad;addLog(`🐉 Apocalypse: ${ad}!`,"boss");}
        }

        let ed=e.atk;
        if(e.behavior==="aggressive")ed=Math.round(ed*1.15);
        if(e.behavior==="magic")ed=Math.round(ed*1.1);
        if(isDefending){ed=Math.round(ed*0.5);addLog("🛡️ Guard absorbs half!","buff");}
        ed=Math.max(1,ed-Math.round(st.totalDef*0.4));
        if(p.traits.find(t=>t.effect==="dmgReduce10"))ed=Math.round(ed*0.9);

        const effectiveDodge=st.dodgeCh+(smokeTurns>0?30:0);
        if(chance(effectiveDodge)){addLog(`💨 Dodged!`,"dodge");}
        else if(parrying){setParrying(false);const cd=Math.round(ed*2.5);e.hp-=cd;addLog(`⚡ PARRY! ${cd} counter!`,"crit");applyStatus(e,"stun");}
        else{
          if(shieldHp>0){if(ed<=shieldHp){setShieldHp(sh=>sh-ed);addLog(`🔮 Shield absorbs ${ed}`,"buff");ed=0;}else{ed-=shieldHp;addLog(`🔮 Shield broke! ${ed} through`,"damage");setShieldHp(0);}}
          if(ed>0){p.hp-=ed;setPDmgAnim(ed);setTimeout(()=>setPDmgAnim(null),600);addLog(`💥 ${e.name}: ${ed} damage!`,"damage");
            const th=p.passives.find(ps=>ps.key==="thornArmor");if(th){const r=Math.round(ed*th.level*0.05);e.hp-=r;addLog(`🌹 Thorns: ${r}`,"combat");}
            if(e.statusOnHit&&chance(e.statusChance||0))applyStatus(p,e.statusOnHit);
            if(e.affixes?.includes("toxic")&&chance(35))applyStatus(p,"poison");
            if(e.affixes?.includes("frostbound")&&chance(22))applyStatus(p,"freeze");
            if(e.affixes?.includes("vampiric")){const heal=Math.max(2,Math.round(ed*0.35));e.hp=Math.min(e.maxHp,e.hp+heal);addLog(`🩸 ${e.name} siphons ${heal} HP`,"boss");}
            if(familiarHp>0&&chance(25)){const fDmg=Math.round(ed*0.3);setFamiliarHp(fh=>{const nh=fh-fDmg;if(nh<=0)addLog("👻 Familiar fell!","damage");return Math.max(0,nh);});}
          }
        }
      }

      if(berserkTurns>0)setBerserkTurns(t=>t-1);
      if(smokeTurns>0)setSmokeTurns(t=>t-1);
      if(st.manaRegenVal>0&&p.hp>0){const regen=Math.min(st.maxMp-p.mp,st.manaRegenVal);if(regen>0){p.mp+=regen;addLog(`💧 Mana Regen: +${regen}`,"buff");}}
      setSkillCooldowns(prev=>{const n={};Object.entries(prev).forEach(([k,v])=>{if(v>0)n[k]=v-1;});return n;});
      setCombatTurn(t=>t+1);
      if(e.hp<=0)return handleEnemyDeath(e,p,st);
      setEnemy(e);
      if(p.hp<=0)handleDeath(p);
      return p;
    });
  }

  function calcDmg(p,isP,skill,st){
    let b;
    if(isP){if(skill)b=getSkillBasePower(skill, st);else b=st.totalAtk;if(berserkTurns>0)b*=1.5;}
    else b=p.atk;
    return Math.max(1,Math.round(b));
  }

  function applyStatus(target,effect){
    if(!effect)return;
    const dur={burn:3,bleed:3,freeze:1,stun:1,poison:4}[effect]||2;
    const ex=target.statusEffects?.find(s=>s.type===effect);
    if(ex)ex.duration=Math.max(ex.duration,dur);
    else target.statusEffects=[...(target.statusEffects||[]),{type:effect,duration:dur}];
    const icons={burn:"🔥",bleed:"🩸",freeze:"❄️",stun:"⚡",poison:"🟢"};
    const labels={burn:"burning",bleed:"bleeding",freeze:"frozen",stun:"stunned",poison:"poisoned"};
    addLog(`${icons[effect]} ${target.name||"You"} ${labels[effect]}!`,"status");
  }

  function processStatusEffects(target,isE,st){
    if(!target.statusEffects?.length)return 0;
    let total=0;const rem=[];
    for(const s of target.statusEffects){
      if(s.type==="burn"){const d=Math.round((isE?st.totalMagic:target.atk)*0.15)+3;total+=d;addLog(`🔥 ${isE?target.name:"You"}: ${d} burn`,"status");}
      if(s.type==="bleed"){const d=Math.round((isE?st.totalAtk:target.atk)*0.1)+2;total+=d;addLog(`🩸 ${d} bleed`,"status");}
      if(s.type==="poison"){const d=Math.round((isE?target.maxHp:st.maxHp)*0.05);total+=d;addLog(`🟢 ${d} poison`,"status");}
      s.duration--;if(s.duration>0)rem.push(s);
    }
    target.statusEffects=rem;return total;
  }

  function handleEnemyDeath(e,p,st){
    e.hp=0;addLog(`\n💀 ${e.name} defeated!`,"victory");
    const enemyAffixes = new Set(e.affixes||[]);
    if(enemyAffixes.has("volatile")){const blast=Math.max(8,Math.round(e.maxHp*0.08));p.hp=Math.max(1,p.hp-blast);addLog(`💥 Volatile blast: ${blast}!`,"damage");}
    let xpG=e.xp,gG=e.gold;
    if(p.traits.find(t=>t.effect==="xpBoost"))xpG=Math.round(xpG*1.25);
    if(p.traits.find(t=>t.effect==="goldBoost"))gG=Math.round(gG*1.5);
    p.xp+=xpG;p.gold+=gG;p.kills++;addLog(`  +${xpG} XP  +${gG} Gold`,"reward");
    if(e.isBoss){
      p.bossKills++;setBossCount(c=>c+1);setBossHistory(prev=>[...prev.slice(-2),e.name]);setFloor(f=>f+1);
      // FIX: evaluate rng once before loop
      const dropCount=rng(1,3);
      const bossDrops = Array.from({length:dropCount},()=> {
        const rr=chance(15)?"mythic":chance(30)?"legendary":"epic";
        return generateItem(p.level,p.luk+10,rr,{ setChanceBonus:25 });
      });
      addItemsToInventory(p,bossDrops).forEach(drop=>addLog(`🎁 ${drop.icon} ${drop.rarityName} ${drop.name}!`,"legendary"));
      if(chance(40)){const trait=pick(TRAITS.filter(t=>!p.traits.find(pt=>pt.name===t.name)));if(trait){p.traits=[...p.traits,{...trait}];addLog(`🏅 ${trait.name}!`,"trait");}}
      if(floor>highestFloor){setHighestFloor(floor+1);try{localStorage.setItem("rl_best",String(floor+1));}catch{}}
    }else{
      if(e.isElite){const [eliteDrop]=addItemsToInventory(p,[generateItem(p.level,st.effLuk+6,null,{ setChanceBonus:18 })]);addLog(`⭐ Elite cache: ${eliteDrop.icon} ${eliteDrop.rarityName} ${eliteDrop.name}`,"legendary");}
      else if(chance(35+p.luk*2)){const [drop]=addItemsToInventory(p,[generateItem(p.level,st.effLuk)]);addLog(`🎁 ${drop.icon} ${drop.rarityName} ${drop.name}`,"loot");}
    }
    if(enemyAffixes.has("hoarder")){const stashGold=Math.round(gG*0.4)+12;p.gold+=stashGold;addLog(`💼 Hoarder stash: +${stashGold} gold`,"gold");const [stashItem]=addItemsToInventory(p,[generateItem(p.level,st.effLuk+8,null,{ setChanceBonus:15 })]);addLog(`💼 Stash item: ${stashItem.icon} ${stashItem.rarityName} ${stashItem.name}`,"loot");}
    if(p.traits.find(t=>t.effect==="regen5")){const rg=Math.round(st.maxHp*0.05);p.hp=Math.min(st.maxHp,p.hp+rg);addLog(`💚 +${rg} HP`,"heal");}
    if(st.manaRegenVal>0)p.mp=Math.min(st.maxMp,p.mp+st.manaRegenVal);

    // Level up with skill choice system
    const newChoices=[];
    const alreadyOffered=[];
    while(p.xp>=p.xpReq){
      p.xp-=p.xpReq;p.level++;p.xpReq=xpForLevel(p.level);p.statPoints+=5;p.skillPoints+=1;
      const ns=calcPlayerStats(p);p.hp=ns.maxHp;p.mp=ns.maxMp;
      addLog(`\n🎊 LEVEL ${p.level}! +5 SP, +1 Skill Pt`,"levelup");

      // Skill choice: offer 3 random skills from pool
      const pool=Object.entries(SKILL_DATA).filter(([k,v])=>
        !v.evolvedFrom&&v.type==="active"&&
        v.unlockLevel<=p.level+1&&
        !p.skills.find(s=>s.key===k)&&
        !alreadyOffered.includes(k)
      );
      if(pool.length>0){
        const shuffled=[...pool].sort(()=>Math.random()-0.5);
        const choices=shuffled.slice(0,Math.min(3,pool.length));
        newChoices.push(choices);
        choices.forEach(([k])=>alreadyOffered.push(k));
      }

      // Auto-unlock passives at fixed levels
      addPassives(p,p.level===3?["lifesteal"]:[]).forEach(passive=>addLog(`🌟 Passive: ${passive.name}!`,"legendary"));
      addPassives(p,p.level===6?["fireAmp","dodgeBoost"]:[]).forEach(passive=>addLog(`🌟 Passive: ${passive.name}!`,"legendary"));
      addPassives(p,p.level===9?["iceAmp","thornArmor"]:[]).forEach(passive=>addLog(`🌟 Passive: ${passive.name}!`,"legendary"));
    }
    if(newChoices.length>0)setSkillChoiceQueue(prev=>[...prev,...newChoices]);
    setEnemy(null);setPhase("explore");return p;
  }

  function handleDeath(p){
    addLog(`\n☠️ FALLEN. Floor ${floor}, Lv.${p.level}, ${p.kills} kills.`,"death");
    setRuns(r=>{const n=r+1;try{localStorage.setItem("rl_runs",String(n));}catch{}return n;});
    const nm={...metaUnlocks};if(p.level>=5)nm.bonusStr=(nm.bonusStr||0)+1;if(p.level>=8)nm.bonusInt=(nm.bonusInt||0)+1;if(p.bossKills>=2)nm.startGold=(nm.startGold||0)+10;
    setMetaUnlocks(nm);try{localStorage.setItem("rl_meta",JSON.stringify(nm));}catch{}
    setPhase("gameover");
  }

  function buyItem(item){
    const cost=getItemBuyPrice(item,player.level);
    if(player.gold<cost){addLog("Not enough gold!","damage");return;}
    setPlayer(prev=>{const p=normalizePlayerState(prev);p.gold-=cost;p.inventory=[...p.inventory,{...item,qty:1}];return p;});
    addLog(`🛒 Bought ${item.icon} ${item.name} for ${cost}g!`,"gold");
  }

  function buyConsumable(item){
    if(player.gold<item.cost){addLog("Not enough gold!","damage");return;}
    setPlayer(prev=>{const base=normalizePlayerState(prev);const p={...base,gold:base.gold-item.cost,inventory:base.inventory.map(i=>({...i}))};
      const ex=p.inventory.find(i=>i.name===item.name);if(ex)ex.qty=(ex.qty||1)+1;else p.inventory=[...p.inventory,{...item,id:uid(),qty:1}];
      addLog(`🛒 ${item.icon} ${item.name} for ${item.cost}g!`,"gold");return p;});
  }

  function equipItem(item){
    setPlayer(prev=>{const base=normalizePlayerState(prev);const p={...base,inventory:[...base.inventory],equipment:{...base.equipment}};
      let slot=item.slot;if(slot==="accessory1"&&p.equipment.accessory1&&!p.equipment.accessory2)slot="accessory2";
      const cur=p.equipment[slot];if(cur)p.inventory.push({...cur,qty:1});p.equipment[slot]=item;p.inventory=p.inventory.filter(i=>i.id!==item.id);
      addLog(`🔧 Equipped ${item.icon} ${item.name}`,"info");const ns=calcPlayerStats(p);p.hp=Math.min(p.hp,ns.maxHp);p.mp=Math.min(p.mp,ns.maxMp);return p;});
  }

  function allocStat(stat){setPlayer(prev=>{const p=normalizePlayerState(prev);if(p.statPoints<=0)return prev;p[stat]=p[stat]+1;p.statPoints-=1;const ns=calcPlayerStats(p);if(stat==="vit")p.hp=Math.min(ns.maxHp,p.hp+12);if(stat==="int")p.mp=Math.min(ns.maxMp,p.mp+6);return p;});}
  function allocSkillPt(key){setPlayer(prev=>{const base=normalizePlayerState(prev);if(base.skillPoints<=0)return prev;const p={...base,skillPoints:base.skillPoints-1,passives:base.passives.map(ps=>({...ps}))};const ps=p.passives.find(pp=>pp.key===key);if(ps){ps.level++;addLog(`⬆️ ${ps.name} Lv.${ps.level}`,"levelup");}return p;});}

  // ─── RENDER ────────────────────────────────────────────────
  const lc={system:"#7dd3fc",narrative:"#a78bfa",encounter:"#fb923c",elite:"#f87171",combat:"#e2e8f0",crit:"#fbbf24",damage:"#ef4444",heal:"#4ade80",dodge:"#67e8f9",status:"#c084fc",buff:"#60a5fa",boss:"#f43f5e",victory:"#22c55e",reward:"#a3e635",loot:"#38bdf8",legendary:"#fbbf24",gold:"#fbbf24",levelup:"#c084fc",death:"#ef4444",event:"#f0abfc",trait:"#fcd34d",info:"#94a3b8"};
  const currentBiome = getBiomeForFloor(floor);
  const STATUS_ICONS={burn:"🔥",bleed:"🩸",freeze:"❄️",stun:"⚡",poison:"🟢"};

  if(phase==="menu")return(
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#0a0a1a,#1a0a2e)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Segoe UI',sans-serif",color:"#e2e8f0",padding:20}}>
      <div style={{textAlign:"center",marginBottom:40}}>
        <div style={{fontSize:64,marginBottom:8}}>⚔️</div>
        <h1 style={{fontSize:42,fontWeight:900,background:"linear-gradient(135deg,#fbbf24,#f43f5e,#a855f7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:-1,margin:0}}>SHADOW DUNGEON</h1>
        <p style={{color:"#7c3aed",fontSize:14,letterSpacing:6,textTransform:"uppercase",marginTop:4}}>Arise, Hunter</p>
        <p style={{color:"#64748b",fontSize:12,marginTop:12,maxWidth:320,lineHeight:1.5}}>No classes. No limits. Build your own path — warrior, mage, or anything between.</p>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:12,width:280}}>
        <button onClick={createCharacter} style={btn("#7c3aed")}>⚔️ Enter the Dungeon</button>
        <div style={{textAlign:"center",color:"#64748b",fontSize:13,marginTop:20}}>
          <div>Runs: {runs} | Best Floor: {highestFloor}</div>
          {(metaUnlocks.bonusStr>0||metaUnlocks.bonusInt>0||metaUnlocks.startGold>0)&&<div style={{color:"#4ade80",marginTop:4}}>Meta: +{metaUnlocks.bonusStr||0} STR, +{metaUnlocks.bonusInt||0} INT, +{metaUnlocks.startGold||0}g</div>}
        </div>
      </div>
    </div>);

  if(phase==="gameover")return(
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#1a0a0a,#0a0a1a)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Segoe UI',sans-serif",color:"#e2e8f0",padding:20,textAlign:"center"}}>
      <div style={{fontSize:64,marginBottom:16}}>☠️</div>
      <h1 style={{fontSize:36,fontWeight:900,color:"#ef4444",marginBottom:8}}>HUNTER FALLEN</h1>
      <div style={{color:"#94a3b8",fontSize:14,lineHeight:2,marginBottom:24}}><div>Level: {player?.level} | Floor: {floor}</div><div>Kills: {player?.kills} | Bosses: {player?.bossKills}</div></div>
      {player?.level>=5&&<div style={{color:"#4ade80",fontSize:13,marginBottom:20}}>✨ Meta bonuses unlocked!</div>}
      <button onClick={()=>{setPhase("menu");setPlayer(null);}} style={btn("#7c3aed")}>Return to Gate</button>
    </div>);

  if(!player||!stats)return null;

  const hpPct=(player.hp/stats.maxHp)*100,mpPct=(player.mp/stats.maxMp)*100,xpPct=(player.xp/player.xpReq)*100;
  const eHpPct=enemy?.maxHp?(enemy.hp/enemy.maxHp)*100:0;
  const inventoryItems=Array.isArray(player.inventory)?player.inventory.filter(Boolean):[];
  const consumables=inventoryItems.filter(i=>i.effect);
  const equipItems=inventoryItems.filter(i=>i.slot);
  const equippedItems={...DEFAULT_EQUIPMENT,...(player.equipment||{})};
  const playerStatuses=Array.isArray(player.statusEffects)?player.statusEffects.filter(Boolean):[];
  const enemyStatuses=Array.isArray(enemy?.statusEffects)?enemy.statusEffects.filter(Boolean):[];
  const playerSkills=Array.isArray(player.skills)?player.skills.filter(Boolean):[];
  const playerPassives=Array.isArray(player.passives)?player.passives.filter(Boolean):[];
  const playerTraits=Array.isArray(player.traits)?player.traits.filter(Boolean):[];
  const enemyAffixes=Array.isArray(enemy?.affixes)?enemy.affixes.filter(Boolean):[];
  const setSummaries=Array.isArray(stats.setSummaries)?stats.setSummaries:[];
  const setSummaryByKey=Object.fromEntries(setSummaries.map(summary=>[summary.key,summary]));

  return(
    <div style={{minHeight:"100vh",background:"#080810",fontFamily:"'Segoe UI',sans-serif",color:"#e2e8f0",display:"flex",flexDirection:"column"}}>
      {/* ─── HEADER ─── */}
      <div style={{background:"#0f0f1a",borderBottom:"1px solid #1e1e3a",padding:"8px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:18}}>⚔️</span><span style={{fontWeight:700}}>{player.name}</span><span style={{color:"#7c3aed",fontSize:13,fontWeight:600}}>Lv.{player.level}</span></div>
        <div style={{display:"flex",gap:16,fontSize:12,color:"#94a3b8"}}><span>Floor {floor} · {currentBiome.name}</span><span>🏆 {player.kills}</span><span>💰 {player.gold}</span>{player.statPoints>0&&<span style={{color:"#fbbf24",fontWeight:700}}>⬆ {player.statPoints} SP</span>}</div>
      </div>

      {/* ─── TOP BARS ─── */}
      <div style={{padding:"8px 16px",background:"#0c0c18",display:"flex",gap:8,flexWrap:"wrap"}}>
        <Bar l="HP" v={player.hp} m={stats.maxHp} p={hpPct} c={hpPct<25?"#ef4444":hpPct<50?"#f59e0b":"#22c55e"}/>
        <Bar l="MP" v={player.mp} m={stats.maxMp} p={mpPct} c="#3b82f6"/>
        <Bar l="XP" v={player.xp} m={player.xpReq} p={xpPct} c="#a855f7"/>
      </div>

      {/* ─── TAB NAV ─── */}
      <div style={{display:"flex",borderBottom:"1px solid #1e1e3a",background:"#0c0c18"}}>
        {(phase==="combat"||phase==="boss_intro"?["combat"]:["explore","inventory","skills","stats"]).map(tab=>(
          <button key={tab} onClick={()=>{if(phase!=="combat"&&phase!=="boss_intro")setPhase(tab==="explore"?"explore":tab);}}
            style={{flex:1,padding:"8px 4px",background:phase===tab?"#1a1a2e":"transparent",border:"none",borderBottom:phase===tab?"2px solid #7c3aed":"2px solid transparent",color:phase===tab?"#e2e8f0":"#64748b",fontSize:12,cursor:"pointer",textTransform:"capitalize",fontWeight:600}}>{tab}</button>))}
      </div>

      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

        {/* ═══ SKILL CHOICE OVERLAY ═══ */}
        {skillChoiceQueue.length>0&&(phase==="explore")&&(
          <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.88)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:100,padding:20}}>
            <div style={{fontSize:36,marginBottom:8,animation:"scaleIn 0.4s ease-out"}}>⬆️</div>
            <h2 style={{fontSize:24,fontWeight:900,background:"linear-gradient(135deg,#fbbf24,#a855f7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:4,margin:0}}>LEVEL UP!</h2>
            <p style={{color:"#94a3b8",fontSize:13,marginBottom:20}}>Choose a new skill to learn:</p>
            <div style={{display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center",maxWidth:600}}>
              {skillChoiceQueue[0].map(([key,skill])=>{const previewPower=getSkillPreviewPower(skill, stats);return(
                <button key={key} onClick={()=>chooseSkill(key)} style={{background:"#111122",border:"1px solid #7c3aed40",borderRadius:12,padding:"16px 20px",width:175,cursor:"pointer",textAlign:"left",transition:"all 0.15s",color:"#e2e8f0"}}>
                  <div style={{fontSize:36,marginBottom:8}}>{skill.icon}</div>
                  <div style={{fontSize:15,fontWeight:700,marginBottom:4}}>{skill.name}</div>
                  <div style={{fontSize:11,color:"#94a3b8",marginBottom:8,minHeight:32,lineHeight:1.4}}>{skill.desc}</div>
                  <div style={{fontSize:10,color:"#64748b"}}>{previewPower&&`PWR:${previewPower} `}MP:{skill.manaCost}{skill.cooldown>0&&` CD:${skill.cooldown}`}</div>
                  <div style={{fontSize:10,color:"#7c3aed",marginTop:4}}>[{skill.tree}] {skill.stat.toUpperCase()}-based</div>
                  {skill.evolution&&<div style={{fontSize:10,color:"#fbbf24",marginTop:2}}>✨ Evolves at Lv.5</div>}
                </button>);})}
            </div>
            {skillChoiceQueue.length>1&&<div style={{color:"#64748b",fontSize:11,marginTop:12}}>{skillChoiceQueue.length-1} more choice{skillChoiceQueue.length>2?"s":""} remaining</div>}
          </div>
        )}

        {/* ═══ COMBAT / BOSS INTRO ═══ */}
        {(phase==="combat"||phase==="boss_intro")&&enemy&&(
          <div style={{flex:1,display:"flex",flexDirection:"column"}}>

            {/* ── Pokemon-style Battlefield ── */}
            <div style={{position:"relative",padding:"16px",background:enemy.isBoss?"linear-gradient(180deg,#1a0505 0%,#0f0f2f 50%,#1a2a1a 85%,#2a3a2a 100%)":"linear-gradient(180deg,#0a0a2a 0%,#0f0f2f 50%,#1a2a1a 85%,#2a3a2a 100%)",minHeight:190,overflow:"hidden"}}>
              {/* Ground platforms */}
              <div style={{position:"absolute",bottom:8,left:"5%",width:"35%",height:18,background:"radial-gradient(ellipse,#3a4a3a 60%,transparent 70%)",opacity:0.5}}/>
              <div style={{position:"absolute",bottom:8,right:"5%",width:"35%",height:18,background:"radial-gradient(ellipse,#3a4a3a 60%,transparent 70%)",opacity:0.5}}/>

              {/* Player sprite */}
              <div style={{position:"absolute",bottom:22,left:"14%",textAlign:"center"}}>
                <div style={{fontSize:56,animation:pDmgAnim?"hitShake 0.3s ease-out":"idleBob 2s ease-in-out infinite",filter:pDmgAnim?"brightness(2.5) saturate(0.3)":"none",transition:"filter 0.15s"}}>🧝</div>
              </div>

              {/* Familiar sprite */}
              {familiarHp>0&&(
                <div style={{position:"absolute",bottom:32,left:"3%",textAlign:"center"}}>
                  <div style={{fontSize:30,animation:"idleBob 1.5s ease-in-out infinite 0.3s"}}>👻</div>
                  <div style={{fontSize:9,color:"#a78bfa",marginTop:1,textShadow:"0 0 4px #a78bfa"}}>♥{familiarHp}</div>
                </div>
              )}

              {/* Enemy sprite */}
              <div style={{position:"absolute",bottom:22,right:"14%",textAlign:"center"}}>
                <div style={{fontSize:56,animation:animDmg?"hitShake 0.3s ease-out":"idleBob 2s ease-in-out infinite 0.5s",filter:animDmg?"brightness(2.5) saturate(0.3)":"none",transition:"filter 0.15s",transform:"scaleX(-1)"}}>{enemy.icon}</div>
              </div>

              {/* Boss summon minions visual */}
              {enemy.isBoss&&enemy.mechanic==="summon"&&enemy.mechanicCounter>0&&(
                <div style={{position:"absolute",bottom:14,right:"28%",display:"flex",gap:3}}>
                  {Array.from({length:Math.min(Math.floor(enemy.mechanicCounter/3),4)}).map((_,i)=>(
                    <span key={i} style={{fontSize:16,animation:"idleBob 1.5s ease-in-out infinite",animationDelay:`${i*0.2}s`}}>👺</span>))}
                </div>
              )}

              {/* Spell projectile */}
              {spellEffect&&(
                <div style={{position:"absolute",bottom:75,left:"25%",fontSize:34,animation:"spellFly 0.5s ease-out forwards",zIndex:5,textShadow:"0 0 12px rgba(255,200,50,0.6)"}}>{spellEffect}</div>
              )}

              {/* Damage numbers */}
              {animDmg&&<div style={{position:"absolute",top:18,right:"16%",color:"#fbbf24",fontSize:30,fontWeight:900,animation:"fadeUp 0.6s forwards",textShadow:"0 0 12px #fbbf24",zIndex:10}}>-{animDmg}</div>}
              {pDmgAnim&&<div style={{position:"absolute",top:18,left:"16%",color:"#ef4444",fontSize:30,fontWeight:900,animation:"fadeUp 0.6s forwards",textShadow:"0 0 12px #ef4444",zIndex:10}}>-{pDmgAnim}</div>}

              {/* VS indicator */}
              <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",fontSize:14,color:"#475569",fontWeight:900,textShadow:"0 0 20px #47456950",letterSpacing:2}}>VS</div>
            </div>

            {/* ── HP bars below battlefield ── */}
            <div style={{display:"flex",justifyContent:"space-between",padding:"8px 16px",background:"#0c0c18",gap:16}}>
              <div style={{flex:1}}>
                <div style={{fontSize:11,fontWeight:700,marginBottom:3,color:"#22c55e"}}>🧝 {player.name} Lv.{player.level}</div>
                <Bar l="HP" v={player.hp} m={stats.maxHp} p={hpPct} c={hpPct<25?"#ef4444":hpPct<50?"#f59e0b":"#22c55e"} sm/>
                <div style={{height:3}}/>
                <Bar l="MP" v={player.mp} m={stats.maxMp} p={mpPct} c="#3b82f6" sm/>
                {playerStatuses.length>0&&<div style={{display:"flex",gap:3,marginTop:3,flexWrap:"wrap"}}>{playerStatuses.map((s,i)=><span key={i} style={{fontSize:10,background:"#2a1a1a",padding:"1px 5px",borderRadius:6,color:"#f87171"}}>{STATUS_ICONS[s.type]}{s.duration}</span>)}</div>}
              </div>
              <div style={{flex:1,textAlign:"right"}}>
                <div style={{fontSize:11,fontWeight:700,marginBottom:3,color:enemy.isBoss?"#f43f5e":enemy.isElite?"#fbbf24":"#e2e8f0"}}>{enemy.name}{enemy.isBoss?" 👑":""}{enemy.isElite?" ⭐":""}</div>
                {enemyAffixes.length>0&&<div style={{display:"flex",gap:4,marginBottom:4,justifyContent:"flex-end",flexWrap:"wrap"}}>{enemyAffixes.map(affix=><span key={affix} style={{fontSize:9,background:"#201423",color:"#fbbf24",padding:"1px 5px",borderRadius:999,border:"1px solid #fbbf2430"}}>{ELITE_AFFIXES[affix].name}</span>)}</div>}
                <Bar l="HP" v={Math.max(0,enemy.hp)} m={enemy.maxHp} p={Math.max(0,eHpPct)} c="#ef4444" sm/>
                {enemyStatuses.length>0&&<div style={{display:"flex",gap:3,marginTop:3,flexWrap:"wrap",justifyContent:"flex-end"}}>{enemyStatuses.map((s,i)=><span key={i} style={{fontSize:10,background:"#1e1e3a",padding:"1px 5px",borderRadius:6}}>{STATUS_ICONS[s.type]}{s.duration}</span>)}</div>}
              </div>
            </div>

            {/* ── Combat buffs ── */}
            {(defending||berserkTurns>0||shieldHp>0||smokeTurns>0||familiarHp>0)&&(
              <div style={{display:"flex",justifyContent:"center",gap:10,padding:"3px 16px",background:"#0c0c18",flexWrap:"wrap"}}>
                {defending&&<span style={{fontSize:10,color:"#60a5fa",fontWeight:700}}>🛡️ GUARDING</span>}
                {berserkTurns>0&&<span style={{fontSize:10,color:"#f59e0b"}}>🔥 Berserk:{berserkTurns}</span>}
                {shieldHp>0&&<span style={{fontSize:10,color:"#60a5fa"}}>🔮 Shield:{shieldHp}</span>}
                {smokeTurns>0&&<span style={{fontSize:10,color:"#94a3b8"}}>💣 Smoke:{smokeTurns}</span>}
                {familiarHp>0&&<span style={{fontSize:10,color:"#a855f7"}}>👻 Familiar:{familiarHp}</span>}
              </div>
            )}

            {/* ── Battle Log ── */}
            <div ref={logRef} style={{flex:1,overflow:"auto",padding:"8px 16px",fontSize:12,lineHeight:1.6,minHeight:80,maxHeight:160,background:"#080810",borderTop:"1px solid #1e1e3a",borderBottom:"1px solid #1e1e3a"}}>
              {log.slice(-18).map(l=><div key={l.id} style={{color:lc[l.type]||"#94a3b8"}}>{l.msg}</div>)}
            </div>

            {/* ── Action Buttons ── */}
            {phase==="combat"&&(
              <div style={{padding:12,background:"#0f0f1a",borderTop:"1px solid #1e1e3a"}}>
                {consumables.length>0&&(
                  <div style={{marginBottom:8}}>
                    <div style={{fontSize:10,color:"#64748b",marginBottom:4,textTransform:"uppercase",letterSpacing:1}}>🧪 Free Action — Use Potion</div>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                      {consumables.map(item=>{const ri=inventoryItems.indexOf(item);return<button key={item.id} onClick={()=>usePotion(ri)} disabled={potionUsedThisTurn} style={{...btn("#0f4c3a",true),opacity:potionUsedThisTurn?0.35:1}}>{item.icon} {item.name}{item.qty>1&&` x${item.qty}`}</button>;})}
                    </div>
                    {potionUsedThisTurn&&<div style={{fontSize:10,color:"#4ade80",marginTop:2}}>✓ Potion used — pick your action below</div>}
                  </div>
                )}
                <div style={{fontSize:10,color:"#64748b",marginBottom:4,textTransform:"uppercase",letterSpacing:1}}>⚔️ Action</div>
                <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}>
                  <button onClick={()=>playerAction("attack")} style={btn("#374151",true)}>⚔️ Attack</button>
                  <button onClick={()=>playerAction("defend")} style={btn("#1e3a5f",true)}>🛡️ Defend</button>
                  {!enemy.isBoss&&<button onClick={()=>playerAction("flee")} style={btn("#374151",true)}>💨 Flee</button>}
                </div>
                <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                  {playerSkills.map((sk,idx)=>{const cd=skillCooldowns[sk.key]||0;const noMp=player.mp<sk.manaCost;const previewPower=getSkillPreviewPower(sk, stats);return<button key={sk.key} onClick={()=>playerAction("skill",idx)} disabled={cd>0||noMp}
                    title={`${sk.name}: ${sk.desc}\n${previewPower?`PWR:${previewPower} `:""}MP:${sk.manaCost} CD:${sk.cooldown} Lv.${sk.level}`}
                    style={{...btn(cd>0||noMp?"#1e1e3a":"#4c1d95",true),opacity:cd>0||noMp?0.4:1,position:"relative"}}>
                    {sk.icon} {sk.name} <span style={{fontSize:10,color:"#94a3b8"}}>({sk.manaCost})</span>
                    {cd>0&&<span style={{position:"absolute",top:-6,right:-4,background:"#ef4444",borderRadius:8,padding:"0 4px",fontSize:9,fontWeight:700}}>{cd}</span>}
                  </button>;})}
                </div>
              </div>)}

            {/* ── Boss Intro ── */}
            {phase==="boss_intro"&&(
              <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,textAlign:"center"}}>
                <div style={{color:"#f43f5e",fontSize:14,marginBottom:4,fontWeight:700,letterSpacing:2,textTransform:"uppercase"}}>Boss Battle</div>
                <div style={{color:"#fbbf24",fontSize:13,marginBottom:12}}>⚠️ {enemy.mechanicDesc}</div>
                <button onClick={()=>{setPhase("combat");setCombatTurn(0);}} style={btn("#dc2626")}>⚔️ Engage Boss</button>
              </div>
            )}
          </div>)}

        {/* ═══ EXPLORE ═══ */}
        {phase==="explore"&&(
          <div style={{flex:1,display:"flex",flexDirection:"column"}}>
            <div ref={logRef} style={{flex:1,overflow:"auto",padding:"12px 16px",fontSize:13,lineHeight:1.7}}>
              {log.slice(-30).map(l=><div key={l.id} style={{color:lc[l.type]||"#94a3b8"}}>{l.msg}</div>)}
            </div>
            <div style={{padding:16,background:"#0f0f1a",borderTop:"1px solid #1e1e3a",display:"flex",flexDirection:"column",gap:8}}>
              {player.statPoints>0&&<button onClick={()=>setPhase("stats")} style={btn("#854d0e")}>⬆ Allocate {player.statPoints} Stat Points</button>}
              <div style={{fontSize:11,color:"#64748b",textTransform:"uppercase",letterSpacing:1}}>Next Node</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:8}}>
                {mapNodes.map(node=>(
                  <button key={node.id} onClick={()=>nextEncounter(node.type)} style={{...btn(node.type==="boss"?"#991b1b":node.type==="event"?"#6d28d9":node.type==="merchant"?"#166534":node.type==="rest"?"#0f766e":"#334155",true),textAlign:"left"}}>
                    <div style={{fontWeight:700,fontSize:13}}>{node.icon} {node.label}</div>
                    <div style={{fontSize:10,color:"#cbd5e1",opacity:0.85,marginTop:2}}>{node.preview}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>)}

        {/* ═══ EVENT ═══ */}
        {phase==="event"&&eventData&&(
          <div style={{flex:1,padding:20,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center"}}>
            <div style={{fontSize:64,marginBottom:16,animation:"scaleIn 0.4s ease-out"}}>{eventData.icon}</div>
            <h3 style={{fontSize:20,fontWeight:800,color:"#c084fc",marginBottom:8}}>{eventData.name}</h3>
            <p style={{color:"#94a3b8",marginBottom:20,maxWidth:420}}>{eventData.desc}</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:10,width:"100%",maxWidth:560}}>
              {eventData.options.map(option=>(
                <button key={option.id} onClick={()=>resolveEventOption(option.id)} disabled={option.disabled} style={{...btn(option.disabled?"#1f2937":"#312e81",true),opacity:option.disabled?0.45:1,textAlign:"left",minHeight:78}}>
                  <div style={{fontWeight:800,fontSize:13}}>{option.label}</div>
                  <div style={{fontSize:11,color:"#cbd5e1",marginTop:4}}>{option.preview}</div>
                  {option.disabled&&<div style={{fontSize:10,color:"#fca5a5",marginTop:4}}>Requirements not met</div>}
                </button>
              ))}
            </div>
          </div>)}

        {/* ═══ SHOP ═══ */}
        {phase==="shop"&&(
          <div style={{flex:1,overflow:"auto",padding:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><h3 style={{fontSize:18,fontWeight:800,margin:0}}>🏪 Merchant</h3><span style={{color:"#fbbf24"}}>💰 {player.gold}g</span></div>
            <div style={{fontSize:12,color:"#94a3b8",marginBottom:8}}>Equipment</div>
            {shopItems.map(item=>{const cost=getItemBuyPrice(item,player.level);
              return<div key={item.id} style={{display:"flex",alignItems:"center",gap:8,background:"#111122",borderRadius:8,padding:"8px 12px",border:`1px solid ${item.rarityColor}30`,marginBottom:6}}>
                <span style={{fontSize:20}}>{item.icon}</span>
                <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:item.rarityColor}}>{item.name}</div><div style={{fontSize:11,color:"#64748b"}}>{item.atk>0&&`ATK+${item.atk} `}{item.def>0&&`DEF+${item.def} `}{item.magic>0&&`MAG+${item.magic} `}{Object.entries(item.bonusStats||{}).map(([k,v])=>`${k.toUpperCase()}+${v} `)}</div>{item.setKey&&<div style={{fontSize:10,color:ITEM_SETS[item.setKey].color}}>{ITEM_SETS[item.setKey].name}</div>}{item.uniqueEffect&&<div style={{fontSize:10,color:"#fbbf24"}}>★ {item.uniqueEffect}</div>}</div>
                <button onClick={()=>buyItem(item)} disabled={player.gold<cost} style={{...btn("#4c1d95",true),opacity:player.gold<cost?0.4:1}}>{cost}g</button>
              </div>;})}
            <div style={{fontSize:12,color:"#94a3b8",marginBottom:8,marginTop:12}}>Consumables</div>
            {shopConsumables.map(item=>(<div key={item.id} style={{display:"flex",alignItems:"center",gap:8,background:"#111122",borderRadius:8,padding:"8px 12px",marginBottom:6}}>
              <span>{item.icon}</span><div style={{flex:1}}><div style={{fontSize:13}}>{item.name}</div><div style={{fontSize:11,color:"#64748b"}}>{item.desc}</div></div>
              <button onClick={()=>buyConsumable(item)} disabled={player.gold<item.cost} style={{...btn("#0f4c3a",true),opacity:player.gold<item.cost?0.4:1}}>{item.cost}g</button>
            </div>))}
            <button onClick={()=>setPhase("explore")} style={{...btn("#374151"),marginTop:12}}>Leave Shop</button>
          </div>)}

        {/* ═══ INVENTORY ═══ */}
        {phase==="inventory"&&(
          <div style={{flex:1,overflow:"auto",padding:16}}>
            <h3 style={{fontSize:18,fontWeight:800,marginBottom:12}}>🎒 Inventory</h3>
            <div style={{fontSize:12,color:"#7c3aed",marginBottom:8,fontWeight:600}}>Equipped</div>
            {["weapon","armor","accessory1","accessory2"].map(slot=>{const item=equippedItems[slot];return<div key={slot} style={{display:"flex",alignItems:"center",gap:8,background:"#111122",borderRadius:8,padding:"8px 12px",border:item?`1px solid ${item.rarityColor}40`:"1px solid #1e1e3a",marginBottom:4}}>
              <span style={{fontSize:16,width:24}}>{item?.icon||"—"}</span>
              <div style={{flex:1}}>{item?<><div style={{fontSize:13,fontWeight:600,color:item.rarityColor}}>{item.name} <span style={{fontSize:10,color:"#64748b"}}>({item.rarityName})</span></div><div style={{fontSize:11,color:"#64748b"}}>{item.atk>0&&`ATK+${item.atk} `}{item.def>0&&`DEF+${item.def} `}{item.magic>0&&`MAG+${item.magic} `}{Object.entries(item.bonusStats||{}).map(([k,v])=>`${k.toUpperCase()}+${v} `)}</div>{item.setKey&&<div style={{fontSize:10,color:ITEM_SETS[item.setKey].color}}>{ITEM_SETS[item.setKey].name} ({setSummaryByKey[item.setKey]?.count||0}/{ITEM_SETS[item.setKey].totalPieces})</div>}{item.uniqueEffect&&<div style={{fontSize:10,color:"#fbbf24"}}>★ {item.uniqueEffect}</div>}</>:<div style={{fontSize:12,color:"#475569"}}>{slot}</div>}</div>
            </div>;})}
            {setSummaries.length>0&&<><div style={{fontSize:12,color:"#fbbf24",marginBottom:8,marginTop:12,fontWeight:600}}>Active Sets</div>{setSummaries.map(summary=><div key={summary.key} style={{background:"#10101c",border:`1px solid ${summary.color}30`,borderRadius:8,padding:"8px 10px",marginBottom:6}}><div style={{display:"flex",justifyContent:"space-between",fontSize:12,fontWeight:700,color:summary.color}}><span>{summary.name}</span><span>{summary.count}/{summary.totalPieces}</span></div>{summary.bonuses.map(bonus=><div key={bonus.pieces} style={{fontSize:10,color:bonus.active?summary.color:"#64748b",marginTop:3}}>{bonus.active?"●":"○"} {bonus.pieces}/{summary.totalPieces}: {bonus.desc}</div>)}</div>)}</>}
            <div style={{fontSize:12,color:"#7c3aed",marginBottom:8,marginTop:12,fontWeight:600}}>Bag ({equipItems.length+consumables.length})</div>
            {equipItems.map(item=>(<div key={item.id} style={{display:"flex",alignItems:"center",gap:8,background:"#111122",borderRadius:8,padding:"8px 12px",border:`1px solid ${item.rarityColor}30`,marginBottom:4}}>
              <span style={{fontSize:16}}>{item.icon}</span>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:item.rarityColor}}>{item.name}</div><div style={{fontSize:11,color:"#64748b"}}>{item.atk>0&&`ATK+${item.atk} `}{item.def>0&&`DEF+${item.def} `}{item.magic>0&&`MAG+${item.magic} `}{Object.entries(item.bonusStats||{}).map(([k,v])=>`${k.toUpperCase()}+${v} `)}</div>{item.setKey&&<div style={{fontSize:10,color:ITEM_SETS[item.setKey].color}}>{ITEM_SETS[item.setKey].name}</div>}{item.uniqueEffect&&<div style={{fontSize:10,color:"#fbbf24"}}>★ {item.uniqueEffect}</div>}</div>
              <div style={{display:"flex",gap:4}}><button onClick={()=>equipItem(item)} style={btn("#4c1d95",true)}>Equip</button><button onClick={()=>sellItem(item)} style={btn("#854d0e",true)}>Sell {getItemSellPrice(item)}g</button></div>
            </div>))}
            {consumables.map(item=>(<div key={item.id} style={{display:"flex",alignItems:"center",gap:8,background:"#111122",borderRadius:8,padding:"8px 12px",marginBottom:4}}>
              <span>{item.icon}</span><div style={{flex:1}}><div style={{fontSize:13}}>{item.name}{item.qty>1&&` x${item.qty}`}</div><div style={{fontSize:11,color:"#64748b"}}>{item.desc}</div></div>
            </div>))}
            {equipItems.length===0&&consumables.length===0&&<div style={{color:"#475569",fontSize:13,padding:20,textAlign:"center"}}>Empty</div>}
            <button onClick={()=>setPhase("explore")} style={{...btn("#374151"),marginTop:16}}>← Back</button>
          </div>)}

        {/* ═══ SKILLS ═══ */}
        {phase==="skills"&&(
          <div style={{flex:1,overflow:"auto",padding:16}}>
            <h3 style={{fontSize:18,fontWeight:800,marginBottom:12}}>🧠 Skills</h3>
            {player.skillPoints>0&&<div style={{color:"#fbbf24",fontSize:13,marginBottom:12}}>🔸 {player.skillPoints} Skill Point(s) available</div>}
            <div style={{fontSize:12,color:"#7c3aed",marginBottom:8,fontWeight:600}}>Active Skills</div>
            {playerSkills.map(sk=>{const previewPower=getSkillPreviewPower(sk, stats);return(<div key={sk.key} style={{background:"#111122",borderRadius:8,padding:"10px 12px",border:"1px solid #1e1e3a",marginBottom:6}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:20}}>{sk.icon}</span>
                <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700}}>{sk.name} <span style={{fontSize:11,color:"#7c3aed"}}>Lv.{sk.level}</span><span style={{fontSize:10,color:"#64748b",marginLeft:6}}>[{sk.tree}]</span></div>
                  <div style={{fontSize:11,color:"#94a3b8"}}>{sk.desc}</div>
                  <div style={{fontSize:11,color:"#64748b",marginTop:2}}>{previewPower&&`PWR:${previewPower} `}MP:{sk.manaCost} CD:{sk.cooldown} XP:{sk.xp}/{sk.xpReq}{sk.evolution&&" | Evolves Lv.5"}</div></div></div>
              <div style={{marginTop:4,height:3,background:"#1e1e3a",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${(sk.xp/sk.xpReq)*100}%`,background:"#7c3aed",borderRadius:2}}/></div>
            </div>);})}
            <div style={{fontSize:12,color:"#7c3aed",marginBottom:8,marginTop:12,fontWeight:600}}>Passive Skills</div>
            {playerPassives.map(ps=>(<div key={ps.key} style={{display:"flex",alignItems:"center",gap:8,background:"#111122",borderRadius:8,padding:"10px 12px",border:"1px solid #1e1e3a",marginBottom:6}}>
              <span style={{fontSize:18}}>{ps.icon}</span><div style={{flex:1}}><div style={{fontSize:13,fontWeight:600}}>{ps.name} <span style={{fontSize:11,color:"#7c3aed"}}>Lv.{ps.level}</span></div><div style={{fontSize:11,color:"#94a3b8"}}>{ps.desc}</div></div>
              {player.skillPoints>0&&<button onClick={()=>allocSkillPt(ps.key)} style={btn("#4c1d95",true)}>⬆</button>}
            </div>))}
            {playerTraits.length>0&&<><div style={{fontSize:12,color:"#fbbf24",marginBottom:8,marginTop:12,fontWeight:600}}>Traits</div>{playerTraits.map((t,i)=>(<div key={i} style={{fontSize:12,color:"#fcd34d",background:"#1a1a0a",borderRadius:6,padding:"6px 10px",marginBottom:4}}>🏅 {t.name}: {t.desc}</div>))}</>}
            <button onClick={respecSkillPoints} style={{...btn("#6b2121",true),marginTop:12}}>🔄 Reset Skill Points</button>
            <button onClick={()=>setPhase("explore")} style={{...btn("#374151"),marginTop:8}}>← Back</button>
          </div>)}

        {/* ═══ STATS (EXPANDED) ═══ */}
        {phase==="stats"&&(
          <div style={{flex:1,overflow:"auto",padding:16}}>
            <h3 style={{fontSize:18,fontWeight:800,marginBottom:12}}>📊 Stats</h3>
            {player.statPoints>0&&<div style={{color:"#fbbf24",fontSize:13,marginBottom:12}}>🔸 {player.statPoints} Stat Point(s) — tap + to allocate</div>}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
              {[{key:"str",label:"STR",icon:"💪",desc:"Physical ATK",color:"#ef4444"},{key:"agi",label:"AGI",icon:"💨",desc:"Dodge, Crit",color:"#22d3ee"},{key:"int",label:"INT",icon:"🧠",desc:"Magic ATK, MP",color:"#8b5cf6"},{key:"vit",label:"VIT",icon:"❤️",desc:"HP, DEF",color:"#22c55e"},{key:"luk",label:"LUK",icon:"🍀",desc:"Crit, Drops",color:"#fbbf24"}].map(s=>(
                <div key={s.key} style={{background:"#111122",borderRadius:10,padding:12,border:"1px solid #1e1e3a"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:13,fontWeight:700,color:s.color}}>{s.icon} {s.label}</span>
                    <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:20,fontWeight:800}}>{player[s.key]}</span>
                      {player.statPoints>0&&<button onClick={()=>allocStat(s.key)} style={{width:28,height:28,borderRadius:8,background:s.color+"30",border:`1px solid ${s.color}60`,color:s.color,fontWeight:800,cursor:"pointer",fontSize:16}}>+</button>}
                    </div></div><div style={{fontSize:10,color:"#64748b",marginTop:2}}>{s.desc}</div>
                </div>))}
            </div>
            <div style={{fontSize:12,color:"#7c3aed",marginBottom:8,fontWeight:600}}>Derived</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,fontSize:12,marginBottom:16}}>
              {[{l:"ATK",v:stats.totalAtk,c:"#ef4444"},{l:"DEF",v:stats.totalDef,c:"#22c55e"},{l:"MAGIC",v:stats.totalMagic,c:"#8b5cf6"},{l:"MAX HP",v:stats.maxHp,c:"#22c55e"},{l:"MAX MP",v:stats.maxMp,c:"#3b82f6"},{l:"CRIT%",v:stats.critCh.toFixed(1)+"%",c:"#fbbf24"},{l:"DODGE%",v:stats.dodgeCh.toFixed(1)+"%",c:"#22d3ee"}].map(d=>(
                <div key={d.l} style={{background:"#111122",borderRadius:6,padding:"6px 10px",display:"flex",justifyContent:"space-between"}}><span style={{color:"#64748b"}}>{d.l}</span><span style={{color:d.c,fontWeight:700}}>{d.v}</span></div>))}
            </div>

            {/* ── Bonuses from passives ── */}
            {(stats.lifestealPct>0||stats.manaRegenVal>0||stats.cdReduction>0||stats.fireAmp>0||stats.iceAmp>0||stats.thornsPct>0||stats.damagePct>0||stats.bossDamagePct>0)&&(
              <>
                <div style={{fontSize:12,color:"#a855f7",marginBottom:8,fontWeight:600}}>Combat Bonuses</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,fontSize:12,marginBottom:16}}>
                  {stats.lifestealPct>0&&<div style={{background:"#111122",borderRadius:6,padding:"6px 10px",display:"flex",justifyContent:"space-between"}}><span style={{color:"#64748b"}}>Lifesteal</span><span style={{color:"#f87171",fontWeight:700}}>{stats.lifestealPct}%</span></div>}
                  {stats.manaRegenVal>0&&<div style={{background:"#111122",borderRadius:6,padding:"6px 10px",display:"flex",justifyContent:"space-between"}}><span style={{color:"#64748b"}}>Mana Regen</span><span style={{color:"#3b82f6",fontWeight:700}}>+{stats.manaRegenVal}/turn</span></div>}
                  {stats.cdReduction>0&&<div style={{background:"#111122",borderRadius:6,padding:"6px 10px",display:"flex",justifyContent:"space-between"}}><span style={{color:"#64748b"}}>CD Reduce</span><span style={{color:"#22d3ee",fontWeight:700}}>-{stats.cdReduction}</span></div>}
                  {stats.fireAmp>0&&<div style={{background:"#111122",borderRadius:6,padding:"6px 10px",display:"flex",justifyContent:"space-between"}}><span style={{color:"#64748b"}}>Fire DMG</span><span style={{color:"#ef4444",fontWeight:700}}>+{stats.fireAmp}%</span></div>}
                  {stats.iceAmp>0&&<div style={{background:"#111122",borderRadius:6,padding:"6px 10px",display:"flex",justifyContent:"space-between"}}><span style={{color:"#64748b"}}>Ice DMG</span><span style={{color:"#22d3ee",fontWeight:700}}>+{stats.iceAmp}%</span></div>}
                  {stats.thornsPct>0&&<div style={{background:"#111122",borderRadius:6,padding:"6px 10px",display:"flex",justifyContent:"space-between"}}><span style={{color:"#64748b"}}>Thorns</span><span style={{color:"#22c55e",fontWeight:700}}>{stats.thornsPct}%</span></div>}
                  {stats.damagePct>0&&<div style={{background:"#111122",borderRadius:6,padding:"6px 10px",display:"flex",justifyContent:"space-between"}}><span style={{color:"#64748b"}}>Damage</span><span style={{color:"#fbbf24",fontWeight:700}}>+{stats.damagePct}%</span></div>}
                  {stats.bossDamagePct>0&&<div style={{background:"#111122",borderRadius:6,padding:"6px 10px",display:"flex",justifyContent:"space-between"}}><span style={{color:"#64748b"}}>Boss DMG</span><span style={{color:"#fb7185",fontWeight:700}}>+{stats.bossDamagePct}%</span></div>}
                </div>
              </>
            )}

            {setSummaries.length>0&&(
              <>
                <div style={{fontSize:12,color:"#fbbf24",marginBottom:8,fontWeight:600}}>Set Bonuses</div>
                {setSummaries.map(summary=>(
                  <div key={summary.key} style={{background:"#10101c",border:`1px solid ${summary.color}30`,borderRadius:8,padding:"8px 10px",marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:12,fontWeight:700,color:summary.color,marginBottom:4}}><span>{summary.name}</span><span>{summary.count}/{summary.totalPieces}</span></div>
                    {summary.bonuses.map(bonus=>(
                      <div key={bonus.pieces} style={{fontSize:11,color:bonus.active?summary.color:"#64748b",marginTop:3}}>{bonus.active?"●":"○"} {bonus.pieces}/{summary.totalPieces}: {bonus.desc}</div>
                    ))}
                  </div>
                ))}
              </>
            )}

            {/* ── Traits ── */}
            {playerTraits.length>0&&(
              <>
                <div style={{fontSize:12,color:"#fbbf24",marginBottom:8,fontWeight:600}}>Traits</div>
                {playerTraits.map((t,i)=>(
                  <div key={i} style={{fontSize:12,color:"#fcd34d",background:"#1a1a0a",borderRadius:6,padding:"6px 10px",marginBottom:4}}>🏅 {t.name}: {t.desc}</div>
                ))}
              </>
            )}

            {/* ── Equipment Unique Effects ── */}
            {stats.uniqueEffects.length>0&&(
              <>
                <div style={{fontSize:12,color:"#d97706",marginBottom:8,fontWeight:600,marginTop:12}}>Equipment Effects</div>
                {stats.uniqueEffects.map((eff,i)=>(
                  <div key={i} style={{fontSize:12,color:"#fbbf24",background:"#1a1a0a",borderRadius:6,padding:"6px 10px",marginBottom:4}}>★ {eff}</div>
                ))}
              </>
            )}

            <button onClick={respecStats} style={{...btn("#6b2121",true),marginBottom:12,marginTop:16}}>🔄 Reset Stat Points</button>
            <button onClick={()=>setPhase("explore")} style={btn("#374151")}>← Back</button>
          </div>)}
      </div>

      {/* ─── CSS ANIMATIONS ─── */}
      <style>{`
        @keyframes fadeUp{0%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-30px)}}
        @keyframes idleBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes hitShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
        @keyframes spellFly{0%{transform:translateX(0);opacity:1}80%{opacity:1}100%{transform:translateX(180px);opacity:0}}
        @keyframes scaleIn{0%{transform:scale(0.3);opacity:0}100%{transform:scale(1);opacity:1}}
        *{box-sizing:border-box;margin:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#0a0a1a}::-webkit-scrollbar-thumb{background:#2e2e4a;border-radius:4px}
        button:active{transform:scale(0.97)}
        button:hover{filter:brightness(1.15)}
      `}</style>
    </div>);
}

function Bar({l,v,m,p:pct,c,sm}){return(
  <div style={{flex:1,minWidth:sm?100:80}}>
    <div style={{display:"flex",justifyContent:"space-between",fontSize:sm?10:11,marginBottom:2,color:"#94a3b8"}}><span>{l}</span><span style={{fontWeight:600,color:c}}>{Math.max(0,Math.round(v))}/{m}</span></div>
    <div style={{height:sm?5:8,background:"#1e1e3a",borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:`${clamp(pct,0,100)}%`,background:c,borderRadius:4,transition:"width .3s"}}/></div>
  </div>);}

function btn(bg,small){return{background:bg,border:"none",borderRadius:small?8:10,padding:small?"6px 12px":"12px 24px",color:"#e2e8f0",fontWeight:600,fontSize:small?12:14,cursor:"pointer",transition:"all .15s",whiteSpace:"nowrap"};}
