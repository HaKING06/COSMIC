/**
 * COSMIC SURVIVORS v10.0 — GENESIS EDITION Arena Combat Engine
 * Driven by PixiJS v8 Renderer (with Canvas2D fallback & Corner Tactical Minimap),
 * 5600x5600 Dynamic Sector Director with Solid Cover Obstacles & Vault POIs,
 * 5 Playable Modes (Survival, Endless, Boss Rush, Time Attack, Daily Seeded Protocol),
 * AFK Anti-Camp Hunter Protocol, Multi-Phase Bosses with Destructible Shield Pylons,
 * [E] Cosmic Overdrive Ultimate, All 10 Workshop Upgrades & Bilingual CosmicI18n.
 */
(function (global) {
    'use strict';

    const WORLD_W = 5600;
    const WORLD_H = 5600;
    const MAX_WEAPON_SLOTS = 4;
    const MAX_TRINKET_SLOTS = 4;
    const STORAGE_PREF_KEY = 'cosmic_v10_game_settings';
    const DATA = global.COSMIC_DATA || {};

    function isEn() {
        return Boolean(global.CosmicI18n && typeof global.CosmicI18n.getLang === 'function' && global.CosmicI18n.getLang() === 'en');
    }

    function bi(trText, enText) {
        return isEn() ? enText : trText;
    }

    function loc(obj, field, fallback = '') {
        if (!obj) return fallback;
        if (typeof DATA.getLocalized === 'function') {
            const val = DATA.getLocalized(obj, field);
            if (val) return val;
        }
        return (isEn() && obj[field + 'En']) ? obj[field + 'En'] : (obj[field] || fallback);
    }

    function mulberry32(seedInt) {
        let a = seedInt >>> 0;
        return function () {
            a = (a + 0x6D2B79F5) >>> 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    function pointToSegDist(px, py, x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const lenSq = dx * dx + dy * dy;
        if (lenSq <= 0.0001) return Math.hypot(px - x1, py - y1);
        const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
        return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
    }

    function clampWorldCoord(v, maxBound) {
        if (!Number.isFinite(v)) return maxBound * 0.5;
        return Math.max(2, Math.min(maxBound - 2, v));
    }

    // ── Rebalanced v10.0 Difficulty Scaling (Synced with DATA.DIFFICULTIES) ─────────
    const DIFFICULTIES = {
        easy:      { id: 'easy',      enemyHp: 1.00, enemyDmg: 1.00, bossHp: 1.45, speed: 0.95, spawn: 0.90, score: 1.0 },
        normal:    { id: 'normal',    enemyHp: 1.35, enemyDmg: 1.32, bossHp: 2.35, speed: 1.08, spawn: 1.02, score: 1.5 },
        hard:      { id: 'hard',      enemyHp: 1.90, enemyDmg: 1.75, bossHp: 3.60, speed: 1.24, spawn: 1.25, score: 2.2 },
        nightmare: { id: 'nightmare', enemyHp: 2.75, enemyDmg: 2.35, bossHp: 5.40, speed: 1.42, spawn: 1.43, score: 3.2 },
        abyss:     { id: 'nightmare', enemyHp: 2.75, enemyDmg: 2.35, bossHp: 5.40, speed: 1.42, spawn: 1.43, score: 3.2 }
    };
    if (DATA.DIFFICULTIES) {
        Object.keys(DATA.DIFFICULTIES).forEach(k => {
            const d = DATA.DIFFICULTIES[k];
            if (d && DIFFICULTIES[k]) {
                DIFFICULTIES[k].enemyHp = d.ehm || DIFFICULTIES[k].enemyHp;
                DIFFICULTIES[k].enemyDmg = d.edm || DIFFICULTIES[k].enemyDmg;
                DIFFICULTIES[k].bossHp = d.bhm || DIFFICULTIES[k].bossHp;
                DIFFICULTIES[k].speed = d.esm || DIFFICULTIES[k].speed;
                DIFFICULTIES[k].spawn = d.sdm ? (1 / d.sdm) : DIFFICULTIES[k].spawn;
                DIFFICULTIES[k].score = d.sm || DIFFICULTIES[k].score;
            }
        });
    }

    const SHIPS = {
        interceptor: {
            id: 'interceptor', name: 'Avcı', nameEn: 'Interceptor', color: '#38bdf8', starterWeapon: 'dualLaser',
            hp: 105, sh: 55, sp: 354, crit: 0.20, armor: 0.05, abilityCd: 7.0
        },
        dreadnought: {
            id: 'dreadnought', name: 'Kruvazör', nameEn: 'Dreadnought', color: '#f59e0b', starterWeapon: 'heavyPlasma',
            hp: 185, sh: 90, sp: 239, crit: 0.08, armor: 0.32, abilityCd: 10.0
        },
        aegis: {
            id: 'aegis', name: 'Aegis', nameEn: 'Aegis', color: '#34d399', starterWeapon: 'energyDisc',
            hp: 130, sh: 125, sp: 280, crit: 0.10, armor: 0.18, abilityCd: 9.0
        },
        phantom: {
            id: 'phantom', name: 'Gölge', nameEn: 'Void Phantom', color: '#a78bfa', starterWeapon: 'quantumDagger',
            hp: 95, sh: 55, sp: 335, crit: 0.25, armor: 0.05, abilityCd: 6.5
        },
        solarflare: {
            id: 'solarflare', name: 'Solar Flare', nameEn: 'Solar Flare', color: '#fb7185', starterWeapon: 'flameLine',
            hp: 125, sh: 70, sp: 295, crit: 0.14, armor: 0.12, solarAura: 135, abilityCd: 9.5
        },
        tempest: {
            id: 'tempest', name: 'Tempest', nameEn: 'Tempest', color: '#38bdf8', starterWeapon: 'dualLaser',
            hp: 115, sh: 85, sp: 310, crit: 0.16, armor: 0.14, cryoSlow: true, abilityCd: 8.5
        },
        valkyrie: {
            id: 'valkyrie', name: 'Valkyrie', nameEn: 'Valkyrie', color: '#f59e0b', starterWeapon: 'swarmMissiles',
            hp: 145, sh: 95, sp: 280, crit: 0.15, armor: 0.22, abilityCd: 9.0
        },
        chronos: {
            id: 'chronos', name: 'Chronos', nameEn: 'Chronos', color: '#2dd4bf', starterWeapon: 'energyDisc',
            hp: 110, sh: 105, sp: 305, crit: 0.18, armor: 0.15, bonusCdr: 0.15, abilityCd: 11.0
        }
    };

    const MAPS = {
        sector9:   { id: 'sector9',   name: 'Sektör 9 Enkazı', nameEn: 'Sector 9 Wreckage', scoreMult: 1.0 },
        nebula:    { id: 'nebula',    name: 'Kuantum Nebulası', nameEn: 'Quantum Nebula', scoreMult: 1.25 },
        blackhole: { id: 'blackhole', name: 'Kara Delik Çevresi', nameEn: 'Event Horizon', scoreMult: 1.5 },
        dyson:     { id: 'dyson',     name: 'Dyson Mega-Küre', nameEn: 'Dyson Mega-Sphere', scoreMult: 1.75 }
    };

    const MODE_DEFAULTS = {
        survival:   { id: 'survival',   name: 'Klasik Sefer', nameEn: 'Classic Campaign', xpMult: 1.00, scoreMult: 1.00, creditMult: 1.00, waveDuration: 28 },
        endless:    { id: 'endless',    name: 'Sonsuz Overdrive', nameEn: 'Endless Overdrive', xpMult: 1.15, scoreMult: 1.35, creditMult: 1.30, waveDuration: 28 },
        bossrush:   { id: 'bossrush',   name: 'Boss Akını', nameEn: 'Boss Rush', xpMult: 2.20, scoreMult: 1.85, creditMult: 1.80, waveDuration: 25 },
        timeattack: { id: 'timeattack', name: 'Zamana Karşı', nameEn: 'Time Attack', xpMult: 2.40, scoreMult: 1.60, creditMult: 1.50, waveDuration: 20, timeLimitSec: 300 },
        daily:      { id: 'daily',      name: 'Günlük Protokol', nameEn: 'Daily Protocol', xpMult: 1.25, scoreMult: 2.20, creditMult: 2.00, waveDuration: 28 }
    };

    const WEAPONS = DATA.WEAPONS || {};
    const TRINKETS = DATA.TRINKETS || {};
    const EVOLUTIONS = DATA.EVOLUTIONS || {};
    const SUPER_EVOLUTIONS = DATA.SUPER_EVOLUTIONS || {};
    const UPG = Object.assign({}, WEAPONS, TRINKETS, EVOLUTIONS, SUPER_EVOLUTIONS);

    // ── Buffed Hostile Archetypes (Stronger Swarms & Lethal Contact Pressure) ────
    const ENEMY_TYPES = {
        swarmer:  { spriteKey: 'swarmer',  r: 15, hp: 28,  sp: 136, xp: 4,  dmg: 14 },
        kamikaze: { spriteKey: 'kamikaze', r: 16, hp: 42,  sp: 186, xp: 6,  dmg: 26 },
        shooter:  { spriteKey: 'shooter',  r: 18, hp: 72,  sp: 96,  xp: 9,  dmg: 18, shoots: true },
        phantom:  { spriteKey: 'phantom',  r: 17, hp: 62,  sp: 144, xp: 10, dmg: 20, teleports: true },
        tank:     { spriteKey: 'tank',     r: 24, hp: 185, sp: 70,  xp: 16, dmg: 24 },
        splitter: { spriteKey: 'splitter', r: 21, hp: 105, sp: 92,  xp: 12, dmg: 18, splits: true },
        sniper:   { spriteKey: 'sniper',   r: 18, hp: 74,  sp: 82,  xp: 14, dmg: 30, sniper: true },
        queen:    { spriteKey: 'queen',    r: 29, hp: 340, sp: 62,  xp: 32, dmg: 32, summons: true }
    };

    // ── 5x Tougher Multi-Phase Dreadnought Bosses ────────────────────────────────
    const BOSS_CONFIGS = [
        {
            spriteKey: 'behemoth', name: 'OBLIVION BEHEMOTH', baseHp: 7200, r: 68, sp: 94, hasWeakspot: true,
            hint: 'Arka reaktöre saldır (+%120 Kritik). Lazer süpürme & atılma çizgisinden dik açıyla kaç!',
            hintEn: 'Strike the rear reactor (+120% Crit). Break 90° from sweep beams and dash lanes!'
        },
        {
            spriteKey: 'leviathan', name: 'VOID LEVIATHAN', baseHp: 12800, r: 72, sp: 110, hasWeakspot: false,
            hint: 'Kalkan direklerini kır, ardından çift sarmal mermi koridorlarından içeri süzül!',
            hintEn: 'Destroy orbiting Shield Pylons first, then weave through dual spiral bullet lanes!'
        },
        {
            spriteKey: 'hivemind', name: 'NEXUS HIVE-QUEEN', baseHp: 18500, r: 76, sp: 84, hasWeakspot: false,
            hint: 'Kalkan direkleri hasarı %65 azaltır! Önce direkleri ve sürü takviyelerini temizle!',
            hintEn: 'Shield Pylons cut Boss damage by 65%! Shatter pylons and cull swarm escorts first!'
        },
        {
            spriteKey: 'chronovore', name: 'CHRONOVORE TİTAN', baseHp: 26500, r: 78, sp: 102, hasWeakspot: true,
            hint: 'Havan bombardımanı halkalarından çık ve döner sarmal koridorlarda arka zayıf noktayı vur!',
            hintEn: 'Evade telegraphed mortar zones and flank the rear reactor during spiral curtains!'
        },
        {
            spriteKey: 'seraphim', name: 'CORRUPTED DYSON SERAPH', baseHp: 38000, r: 84, sp: 118, hasWeakspot: true,
            hint: 'Apex Muhafız! Kalkan direklerini kır, süpürme lazerini atlat ve Overdrive [E] patlat!',
            hintEn: 'Apex Sovereign! Shatter Shield Pylons, dodge sweep beams, and unleash Overdrive [E]!'
        }
    ];

    const G = {
        running: false, paused: false, gameOver: false,
        isLevelingUp: false, levelUpActionTaken: false, isLooting: false, isBossReward: false, isVictoryChoice: false,
        shipId: 'interceptor', mapId: 'sector9', diffId: 'normal', diff: DIFFICULTIES.normal,
        modeId: 'survival', skinId: 'standard', skinTint: 0xffffff,
        pilotName: 'PİLOT-01',
        dailyProtocol: null, mutators: [], mutatorMods: null, rng: Math.random,
        modeXpMult: 1.0, modeScoreMult: 1.0, modeCreditMult: 1.0,
        modeEnemyHpMult: 1.0, modeEnemySpMult: 1.0,
        time: 0, timeLimit: 0, timeRemaining: 0,
        wave: 1, waveTimer: 0, waveDuration: 28, spawnAcc: 0,
        bossRushTimer: 15, bossRushCount: 0, bossesKilled: 0, campaignVictoryShown: false,
        kills: 0, score: 0, creditsEarned: 0, rerolls: 2, skips: 1,
        afkCheckTimer: 0, lastMovedPos: { x: WORLD_W * 0.5, y: WORLD_H * 0.5 },
        shockwaveSeq: 0, shockwaveTrigger: null,
        minimapOpen: true,
        camX: WORLD_W * 0.5, camY: WORLD_H * 0.5, shakeTime: 0, shakeMag: 0,
        player: null, enemies: [], bosses: [], bullets: [], crystals: [], pickups: [],
        chests: [], particles: [], floorZones: [], orbitals: [], arcs: [], floatTexts: [],
        weaponDamageStats: {}, keys: {}, mouse: { x: 640, y: 360, active: false },
        aimMode: 'mouse', joy: { active: false, dx: 0, dy: 0 },
        settings: { vfxMode: 'normal', showDmg: true, aimMode: 'mouse', minimapOpen: true },
        currentOffers: [], goChart: null, lastFrameTs: 0, eventBannerTimer: 0
    };

    const el = {};
    function bindDom() {
        [
            'gameCanvas', 'hudXpFill', 'hudShipThumb', 'hudShipName', 'hudLevelPill',
            'hudHpFill', 'hudShFill', 'hudHpText', 'hudShText', 'hudWeaponsRow', 'hudTrinketsRow',
            'btnAimToggle', 'aimModeLabel', 'hudAbFill',
            'hudOverdriveWrap', 'hudOverdriveBtn', 'hudOverdriveLabel', 'hudOverdrivePct', 'hudOverdriveBar',
            'hudModeBadges',
            'bossBarCard', 'bossBarThumb', 'bossBarName', 'bossPhaseTag', 'bossHpFill', 'bossBarHint', 'waveToast',
            'hudMapVal', 'hudWaveVal', 'hudTimeLabel', 'hudTimeVal', 'hudKillsVal', 'hudScoreVal',
            'btnLangToggle', 'btnAudioToggle', 'audioToggleIcon', 'btnPauseGame',
            'sectorPingPill', 'sectorPingText', 'sectorEventBanner',
            'hudMinimapCard', 'btnToggleMinimap', 'minimapChevronIcon', 'hudMinimapBody', 'hudMinimapCanvas',
            'touchUi', 'vjoyZone', 'vjoyKnob', 'touchOverdriveBtn', 'touchAbilityBtn',
            'levelUpOv', 'luEyebrow', 'luSubtitle', 'luCardsGrid', 'btnLuReroll', 'luRerollCount', 'btnLuSkip', 'luSkipCount',
            'lootBoxOv', 'lootTitle', 'lootTrack', 'lootResultDesc', 'btnCollectLoot',
            'bossRewardOv', 'bossRewEyebrow', 'bossRewTitle', 'bossRewSub', 'bossRewGrid',
            'victoryOv', 'vicEyebrow', 'vicTitle', 'vicSubtitle', 'vicScore', 'vicKills', 'btnVictoryExtract', 'btnVictoryExtractLabel', 'btnVictoryEndless', 'btnVictoryEndlessLabel',
            'pauseOv', 'pauseHeading', 'pauseMutatorsBox', 'pauseSettingsTitle', 'pauseStatsTitle',
            'lblSfxVol', 'lblAmbVol', 'lblVfxMode', 'lblAimMode', 'lblDmgNumbers',
            'setSfxVol', 'setAmbVol', 'setVfxMode', 'setAimMode', 'setDmgNumbers', 'pauseStatsKv',
            'btnResumeGame', 'btnRestartRun',
            'gameOverOv', 'goEyebrow', 'goTitle', 'goSubtitle', 'goScore', 'goWave', 'goTime', 'goKills', 'goLevel', 'goCreditsEarned', 'goCreditsLbl',
            'runDamageChart', 'btnPlayAgain', 'btnPlayAgainLbl'
        ].forEach(id => { el[id] = document.getElementById(id); });
    }

    function loadSettings() {
        try {
            const raw = localStorage.getItem(STORAGE_PREF_KEY) || localStorage.getItem('cosmic_v9_game_settings');
            if (raw) Object.assign(G.settings, JSON.parse(raw));
        } catch (e) { /* ignore */ }
        G.aimMode = G.settings.aimMode === 'auto' ? 'auto' : 'mouse';
        G.minimapOpen = G.settings.minimapOpen !== false;
        if (global.CosmicRenderer) global.CosmicRenderer.setVfxSettings(G.settings.vfxMode, G.settings.showDmg);
    }

    function saveSettings() {
        try { localStorage.setItem(STORAGE_PREF_KEY, JSON.stringify(G.settings)); } catch (e) { /* ignore */ }
    }

    function parseLaunchConfig() {
        const qs = new URLSearchParams(global.location.search);
        let cfg = {};
        try { cfg = JSON.parse(sessionStorage.getItem('cosmic_launch_cfg') || '{}'); } catch (e) { /* ignore */ }
        const profile = (global.CosmicPersistence && typeof global.CosmicPersistence.load === 'function')
            ? global.CosmicPersistence.load()
            : null;

        const ship = qs.get('ship') || cfg.ship || sessionStorage.getItem('cosmic_ship') || localStorage.getItem('cosmic_ship_pref') || 'interceptor';
        const map = qs.get('map') || cfg.map || sessionStorage.getItem('cosmic_map') || localStorage.getItem('cosmic_map_pref') || 'sector9';
        const diff = qs.get('diff') || cfg.diff || sessionStorage.getItem('cosmic_diff') || localStorage.getItem('cosmic_diff_pref') || 'normal';
        const mode = qs.get('mode') || cfg.mode || sessionStorage.getItem('cosmic_mode') || localStorage.getItem('cosmic_mode_pref') || 'survival';
        const skin = qs.get('skin') || cfg.skin || sessionStorage.getItem('cosmic_skin') || (profile && profile.selectedSkin) || 'standard';

        let pilot = 'PİLOT-01';
        try {
            pilot = qs.get('pilot') || cfg.pilot || sessionStorage.getItem('cosmic_p1') || localStorage.getItem('cosmic_pilot_name') || 'PİLOT-01';
        } catch (e) { /* ignore */ }
        G.pilotName = String(pilot || 'PİLOT-01').trim() || 'PİLOT-01';

        G.shipId = SHIPS[ship] ? ship : 'interceptor';
        G.mapId = MAPS[map] ? map : 'sector9';
        G.diffId = DIFFICULTIES[diff] ? diff : 'normal';
        G.modeId = MODE_DEFAULTS[mode] ? mode : 'survival';

        const skinsCatalog = DATA.SHIP_SKINS || {};
        G.skinId = skinsCatalog[skin] ? skin : 'standard';
        G.skinTint = (skinsCatalog[G.skinId] && skinsCatalog[G.skinId].tint != null) ? skinsCatalog[G.skinId].tint : 0xffffff;

        G.dailyProtocol = null;
        G.mutators = [];
        G.mutatorMods = null;
        G.rng = Math.random;
        G.modeEnemyHpMult = 1.0;
        G.modeEnemySpMult = 1.0;

        if (G.modeId === 'daily' && typeof DATA.getDailyProtocol === 'function') {
            const proto = DATA.getDailyProtocol();
            G.dailyProtocol = proto;
            G.mapId = MAPS[proto.mapId] ? proto.mapId : G.mapId;
            G.diffId = DIFFICULTIES[proto.difficulty] ? proto.difficulty : 'normal';
            G.rng = mulberry32(proto.seedNum);
            G.mutators = proto.mutators || [];
            G.mutatorMods = proto.combinedModifiers || {};
            G.modeEnemyHpMult = G.mutatorMods.enemyHp || 1.0;
            G.modeEnemySpMult = G.mutatorMods.enemySp || 1.0;
        }

        G.diff = DIFFICULTIES[G.diffId];
        const mDef = (DATA.GAME_MODES && DATA.GAME_MODES[G.modeId]) || MODE_DEFAULTS[G.modeId];
        const mLocal = MODE_DEFAULTS[G.modeId];
        G.modeXpMult = G.modeId === 'bossrush' ? 2.20 : (G.modeId === 'timeattack' ? 2.40 : (mDef.xpMult || mLocal.xpMult || 1.0));
        G.modeScoreMult = mDef.scoreMult || mLocal.scoreMult || 1.0;
        G.modeCreditMult = mDef.creditMult || mLocal.creditMult || 1.0;
        G.waveDuration = mLocal.waveDuration || 28;
        G.timeLimit = G.modeId === 'timeattack' ? (mDef.timeLimitSec || 300) : 0;
        G.timeRemaining = G.timeLimit;
        G.bossRushTimer = 15.0;
    }

    function randVal() {
        return typeof G.rng === 'function' ? G.rng() : Math.random();
    }

    function createPlayer() {
        const base = SHIPS[G.shipId];
        let bonus = {
            dmgMult: 1, hpMult: 1, spdMult: 1, critAdd: 0, cdrAdd: 0,
            magnetMult: 1, extraRerolls: 0, xpMult: 1, creditMult: 1,
            overdriveMult: 1, revivals: 0
        };
        if (global.CosmicPersistence && typeof global.CosmicPersistence.getWorkshopBonuses === 'function') {
            const b = global.CosmicPersistence.getWorkshopBonuses();
            if (b) {
                bonus.dmgMult = b.dmgMult || 1;
                bonus.hpMult = b.hpMult || 1;
                bonus.spdMult = b.spdMult || 1;
                bonus.critAdd = b.critAdd || 0;
                bonus.cdrAdd = b.cdrAdd || 0;
                bonus.magnetMult = b.magnetMult || 1;
                bonus.extraRerolls = b.extraRerolls || b.rerollBonus || 0;
                bonus.xpMult = b.xpMult || b.greedMult || 1;
                bonus.creditMult = b.creditMult || b.greedMult || 1;
                bonus.overdriveMult = b.overdriveMult || 1;
                bonus.revivals = b.revivals || 0;
            }
        }

        const mut = G.mutatorMods || {};
        const maxHp = Math.max(30, Math.round(base.hp * bonus.hpMult * (mut.playerHp || 1)));
        const maxSh = Math.round(base.sh * bonus.hpMult);
        G.rerolls = 2 + bonus.extraRerolls;

        const weapons = {};
        weapons[base.starterWeapon] = { id: base.starterWeapon, level: 1, timer: 0.1 };

        return {
            shipId: base.id, skinId: G.skinId, skinTint: G.skinTint,
            x: WORLD_W * 0.5, y: WORLD_H * 0.5, r: 16, vx: 0, vy: 0, aimAngle: -Math.PI / 2,
            hp: maxHp, maxHp, sh: maxSh, maxSh, shDelay: 0,
            baseSp: base.sp * bonus.spdMult,
            baseArmor: base.armor,
            baseCrit: base.crit + bonus.critAdd,
            baseDmgMult: bonus.dmgMult * (mut.playerDmg || 1),
            xpMult: bonus.xpMult * G.modeXpMult * (mut.xpMult || 1),
            creditMult: bonus.creditMult * G.modeCreditMult,
            baseMagnet: 120 * bonus.magnetMult * (mut.magnetMult || 1),
            bonusCdr: (base.bonusCdr || 0) + bonus.cdrAdd,
            mutCdrMult: mut.cdrMult || 1.0,
            solarAuraRadius: base.solarAura || 0, cryoSlow: !!base.cryoSlow,
            level: 1, xp: 0, nextXp: 32, invuln: 0, cloaked: false, cloakCycle: 0, aegisPulseTimer: 6.0,
            abilityCd: 0, abilityMaxCd: base.abilityCd,
            overdrive: 0, overdriveActive: 0, overdriveMult: bonus.overdriveMult,
            revivalsLeft: bonus.revivals,
            weapons, trinkets: {}, evolutions: new Set(), superEvolutions: new Set(), extraSlots: 0, weaponTimers: {},
            dmgMult: bonus.dmgMult, cdrMult: 1,
            critChance: base.crit + bonus.critAdd, critDamage: 1.85, armor: base.armor,
            magnetRadius: 120 * bonus.magnetMult, hpRegen: 0
        };
    }

    function recomputePlayerStats() {
        const p = G.player;
        if (!p) return;
        const base = SHIPS[p.shipId];
        const lv = (id) => (p.trinkets[id] ? p.trinkets[id].level : 0);
        const odDmgMult = p.overdriveActive > 0 ? 1.20 : 1.0;
        const aimCritBonus = G.aimMode === 'mouse' ? 0.12 : 0;

        p.dmgMult = p.baseDmgMult * odDmgMult * (1 + lv('targetMatrix') * 0.14 + lv('fusionHeart') * 0.20 + lv('neuralLink') * 0.18 + lv('harmonicCapacitor') * 0.12);
        const cdrReduction = p.bonusCdr + lv('coolant') * 0.11 + lv('overdriveCore') * 0.10 + lv('teslaCoil') * 0.11 + lv('fluxCapacitor') * 0.13;
        p.cdrMult = Math.max(0.28, (1 - Math.min(0.68, cdrReduction)) * (p.mutCdrMult || 1.0));
        p.critChance = Math.min(0.95, p.baseCrit + aimCritBonus + lv('targetMatrix') * 0.08 + lv('teslaCoil') * 0.08 + lv('phaseCloak') * 0.09);
        p.critDamage = 1.85 + lv('overdriveCore') * 0.20 + lv('phaseCloak') * 0.25;
        p.armor = Math.min(0.75, p.baseArmor + lv('thruster') * 0.05 + lv('reactiveArmor') * 0.08);
        p.magnetRadius = p.baseMagnet * (1 + lv('magnet') * 0.35);
        p.hpRegen = lv('bioreactor') * 2.2;
        p.solarAuraRadius = (base.solarAura || 0) + (lv('fusionHeart') > 0 ? 45 + lv('fusionHeart') * 15 : 0);
    }

    function getCosmicDecayFactor() {
        return G.wave < 25 ? 1.0 : Math.max(0.15, Math.pow(0.96, G.wave - 24));
    }

    function addDamageStat(sourceId, amt) {
        G.weaponDamageStats[sourceId] = (G.weaponDamageStats[sourceId] || 0) + amt;
    }

    function spawnParticle(x, y, color, r = 4, life = 0.36, vx = 0, vy = 0, ring = false) {
        if (!Number.isFinite(x) || !Number.isFinite(y)) return;
        if (G.particles.length > 260) G.particles.shift();
        G.particles.push({ x, y, vx, vy, r, color, life, maxLife: life, ring });
    }

    function addFloatText(x, y, text, color = '#f8fafc', crit = false) {
        if (!G.settings.showDmg || G.floatTexts.length > 48) return;
        if (!Number.isFinite(x) || !Number.isFinite(y)) return;
        G.floatTexts.push({ x, y, text, color, crit, life: 0.55, vy: -36 });
    }

    function addArc(x1, y1, x2, y2, color = '#38bdf8', width = 3) {
        const cx1 = clampWorldCoord(x1, WORLD_W);
        const cy1 = clampWorldCoord(y1, WORLD_H);
        const cx2 = clampWorldCoord(x2, WORLD_W);
        const cy2 = clampWorldCoord(y2, WORLD_H);
        if (!Number.isFinite(cx1) || !Number.isFinite(cy1) || !Number.isFinite(cx2) || !Number.isFinite(cy2)) return;
        if (cx1 === 0 || cy1 === 0 || cx2 === 0 || cy2 === 0) return;
        if (G.arcs.length > 44) G.arcs.shift();
        G.arcs.push({ x1: cx1, y1: cy1, x2: cx2, y2: cy2, color, width, alpha: 1.0 });
    }

    function triggerShockwave(x, y, radius = 850, duration = 0.85) {
        G.shockwaveTrigger = {
            id: ++G.shockwaveSeq,
            x: Number.isFinite(x) ? x : G.camX,
            y: Number.isFinite(y) ? y : G.camY,
            radius,
            duration
        };
    }

    function triggerConfettiBurst(particleCount = 55) {
        if (typeof global.confetti === 'function') {
            try {
                global.confetti({
                    particleCount,
                    spread: 70,
                    origin: { y: 0.62 },
                    colors: ['#38bdf8', '#34d399', '#f59e0b', '#a78bfa', '#fb7185']
                });
            } catch (e) { /* safe ignore */ }
        }
    }

    function addOverdriveCharge(rawAmt) {
        const p = G.player;
        if (!p || p.overdriveActive > 0 || rawAmt <= 0) return;
        const wasReady = p.overdrive >= 100;
        p.overdrive = Math.min(100, p.overdrive + rawAmt * (p.overdriveMult || 1));
        if (!wasReady && p.overdrive >= 100) {
            if (global.CosmicAudio) global.CosmicAudio.play('powerup');
            showToast(bi('OVERDRIVE HAZIR! [E] TUŞUNA BAS', 'OVERDRIVE READY! PRESS [E]'));
        }
    }

    function activateOverdrive() {
        const p = G.player;
        if (!p || p.overdrive < 100 || p.overdriveActive > 0 || G.paused || G.isLevelingUp || G.isLooting || G.isBossReward || G.isVictoryChoice || G.gameOver) return;
        p.overdrive = 0;
        p.overdriveActive = 6.0;
        recomputePlayerStats();

        // Radial blast clearing enemy projectiles and staggering nearby swarms
        G.bullets = G.bullets.filter(b => !(b.isEnemy && Math.hypot(b.x - p.x, b.y - p.y) < 620));
        G.enemies.concat(G.bosses).forEach(en => {
            if (!en.dead && Math.hypot(en.x - p.x, en.y - p.y) < 380) {
                hurtEnemy(en, 130 * p.dmgMult, 'overdriveBlast', true);
            }
        });
        for (let k = 0; k < 20; k++) {
            const a = (k * Math.PI * 2) / 20;
            spawnParticle(p.x, p.y, k % 2 ? '#f59e0b' : '#a78bfa', 7, 0.5, Math.cos(a) * 240, Math.sin(a) * 240);
        }
        spawnParticle(p.x, p.y, '#a78bfa', 220, 0.45, 0, 0, true);
        triggerShockwave(p.x, p.y, 880, 0.85);
        triggerShake(9, 0.32);
        if (global.CosmicAudio) global.CosmicAudio.play('emp');
        showToast(bi('COSMIC OVERDRIVE AKTİF! (+%45 ATEŞ · +%25 HIZ · +%20 HASAR)', 'COSMIC OVERDRIVE ENGAGED! (+45% FIRE · +25% SPD · +20% DMG)'));
    }

    function triggerShake(mag, time) {
        G.shakeMag = Math.max(G.shakeMag, mag);
        G.shakeTime = Math.max(G.shakeTime, time);
    }

    let toastTimer = null;
    function showToast(msg) {
        if (el.waveToast) {
            el.waveToast.textContent = msg;
            el.waveToast.classList.add('show');
            clearTimeout(toastTimer);
            toastTimer = setTimeout(() => el.waveToast && el.waveToast.classList.remove('show'), 2900);
        }
    }

    function showBanner(msg) {
        if (el.sectorEventBanner) {
            el.sectorEventBanner.textContent = msg;
            el.sectorEventBanner.classList.add('show');
            G.eventBannerTimer = 4.4;
        }
    }

    function getActivePylonCount(boss) {
        if (!boss || !Array.isArray(boss.shieldPylons)) return 0;
        let count = 0;
        for (let i = 0; i < boss.shieldPylons.length; i++) {
            const py = boss.shieldPylons[i];
            if (py && py.alive !== false && py.hp > 0) count++;
        }
        return count;
    }

    function damageBossPylon(boss, py, rawDmg, sourceId) {
        if (!py || py.alive === false || py.hp <= 0) return;
        const p = G.player;
        const crit = Math.random() < p.critChance;
        let dmg = Math.max(1, Math.round(rawDmg * (crit ? p.critDamage : 1)));
        py.hp -= dmg;
        py.flashTimer = 0.08;
        addDamageStat(sourceId, dmg);
        addFloatText(py.x, py.y - 16, `${dmg}`, '#38bdf8', crit);
        spawnParticle(py.x, py.y, '#38bdf8', 5, 0.25, (Math.random() - 0.5) * 90, (Math.random() - 0.5) * 90);
        if (global.CosmicAudio) global.CosmicAudio.play('hitShield', 0.2);

        if (py.hp <= 0) {
            py.hp = 0;
            py.alive = false;
            for (let k = 0; k < 12; k++) {
                const a = (k * Math.PI * 2) / 12;
                spawnParticle(py.x, py.y, '#38bdf8', 6, 0.45, Math.cos(a) * 140, Math.sin(a) * 140);
            }
            if (global.CosmicAudio) global.CosmicAudio.play('explodeSmall', 0.15);
            if (getActivePylonCount(boss) === 0) {
                showToast(bi('KALKAN DİREKLERİ İMHA EDİLDİ — BOSS SAVUNMASI KIRILDI!', 'SHIELD PYLONS DESTROYED — BOSS ARMOR EXPOSED!'));
                triggerShockwave(boss.x, boss.y, 680, 0.7);
            }
        }
    }

    function hurtEnemy(en, rawDmg, sourceId, forceCrit = false, hitAngle = 0) {
        if (!en || en.dead) return;
        const p = G.player;
        let crit = forceCrit || Math.random() < p.critChance || p.cloaked;
        let dmg = rawDmg;

        if (en.isBoss && en.hasWeakspot) {
            const rearAng = (en.angle || 0) + Math.PI;
            const diff = Math.abs(((hitAngle - rearAng + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
            if (diff < 0.72) { crit = true; dmg *= 2.2; }
        }
        if (crit) dmg *= p.critDamage;
        if (en.armor) dmg *= (1 - en.armor);

        // Shield Pylons reduce Boss incoming damage by 65% until destroyed
        let pylonMitigated = false;
        if (en.isBoss && getActivePylonCount(en) > 0) {
            dmg *= 0.35;
            pylonMitigated = true;
        }

        dmg = Math.max(1, Math.round(dmg));
        en.hp -= dmg;
        en.flashTimer = 0.08;
        if (p.cryoSlow && !en.isBoss) en.frozenTimer = Math.max(en.frozenTimer || 0, 1.4);

        addDamageStat(sourceId, dmg);
        addOverdriveCharge(Math.min(1.4, dmg * 0.008));

        if ((p.superEvolutions.has('infernoGatling') || p.evolutions.has('bloodHarvest')) && Math.random() < 0.25 && p.hp < p.maxHp) {
            p.hp = Math.min(p.maxHp, p.hp + Math.max(1, dmg * 0.05 * getCosmicDecayFactor()));
        }

        if (crit || en.isBoss || dmg >= 35) {
            const label = pylonMitigated ? `${dmg} [SH]` : `${dmg}${crit ? '!' : ''}`;
            const col = pylonMitigated ? '#94a3b8' : (crit ? '#fde047' : '#f8fafc');
            addFloatText(en.x + (Math.random() - 0.5) * 14, en.y - en.r, label, col, crit);
        }
        if (global.CosmicAudio) global.CosmicAudio.play('hitMetal', 0.25);

        if (en.hp <= 0 && !en.dead) {
            en.dead = true;
            G.kills++;
            const scoreBase = en.isBoss ? 1400 : (en.isElite ? 105 : 20);
            G.score += Math.round(scoreBase * G.diff.score * G.modeScoreMult * (G.wave > 15 ? 1 + (G.wave - 15) * 0.04 : 1));
            const crdBase = en.isBoss ? 200 : (en.isElite ? 22 : 2);
            G.creditsEarned += Math.round(crdBase * (G.modeCreditMult || 1));
            addOverdriveCharge(en.isBoss ? 28 : (en.isElite ? 6.5 : 2.2));
            if (global.CosmicAudio) global.CosmicAudio.play(en.isBoss ? 'explodeBoss' : 'explodeSmall', 0.2);

            if (en.isBoss) {
                G.bossesKilled++;
                triggerShake(13, 0.48);
                triggerShockwave(en.x, en.y, 920, 0.9);
                for (let k = 0; k < 24; k++) {
                    const a = Math.random() * Math.PI * 2;
                    const s = 70 + Math.random() * 240;
                    spawnParticle(en.x, en.y, k % 2 ? '#f59e0b' : '#fb7185', 8 + Math.random() * 8, 0.78, Math.cos(a) * s, Math.sin(a) * s);
                }
                G.chests.push({ x: en.x, y: en.y });
                if (G.modeId === 'bossrush') {
                    G.pickups.push({ x: en.x - 28, y: en.y + 12, kind: 'heal' });
                    G.pickups.push({ x: en.x + 28, y: en.y + 12, kind: 'shield' });
                }

                // Wave 15 Campaign / Daily Apex Victory Choice!
                if ((G.modeId === 'survival' || G.modeId === 'daily') && G.wave >= 15 && !G.campaignVictoryShown) {
                    G.campaignVictoryShown = true;
                    openVictoryModal();
                } else {
                    openBossRewardModal();
                }
            } else {
                spawnParticle(en.x, en.y, en.isElite ? '#f59e0b' : '#fb7185', en.isElite ? 16 : 9, 0.35, 0, 0, true);
                G.crystals.push({ x: en.x, y: en.y, val: en.xp || 5, big: !!en.isElite });
                if (en.isElite || Math.random() < 0.025) {
                    G.pickups.push({ x: en.x + 12, y: en.y, kind: Math.random() < 0.55 ? 'heal' : 'shield' });
                }
                if (en.splits && !en.isChild) {
                    spawnEnemy('swarmer', en.x - 18, en.y + 10, false, true);
                    spawnEnemy('swarmer', en.x + 18, en.y + 10, false, true);
                }
            }
        }
    }

    function hurtPlayer(rawDmg, reasonLabel = '', ignoreInvuln = false) {
        const p = G.player;
        if (!p || G.gameOver || G.isLevelingUp || G.isVictoryChoice) return;
        if (!ignoreInvuln && (p.invuln > 0 || p.cloaked)) return;

        let dmg = rawDmg * G.diff.enemyDmg * (1 - p.armor);
        if (dmg <= 0.1) return;
        if (!ignoreInvuln) p.invuln = 0.18;
        p.shDelay = 3.8;

        const prevSh = p.sh;
        if (p.sh > 0) {
            const absorbed = Math.min(p.sh, dmg);
            p.sh -= absorbed;
            dmg -= absorbed;
            if (global.CosmicAudio) global.CosmicAudio.play('hitShield', 0.15);
        }

        if (prevSh > 0 && p.sh <= 0) {
            for (let k = 0; k < 14; k++) {
                const a = (k * Math.PI * 2) / 14;
                spawnParticle(p.x, p.y, '#38bdf8', 5, 0.42, Math.cos(a) * 165, Math.sin(a) * 165);
            }
            spawnParticle(p.x, p.y, '#38bdf8', 48, 0.35, 0, 0, true);
            addFloatText(p.x, p.y - 30, bi('KALKAN KIRILDI!', 'SHIELD BREAK!'), '#38bdf8', true);
            if (global.CosmicAudio) global.CosmicAudio.play('emp', 0.12);
        }

        if (dmg > 0) {
            p.hp -= dmg;
            if (global.CosmicAudio) global.CosmicAudio.play('playerHurt', 0.15);
            triggerShake(6, 0.22);
        }

        if (!ignoreInvuln && p.trinkets.reactiveArmor) {
            spawnParticle(p.x, p.y, '#f59e0b', 110, 0.28, 0, 0, true);
            G.enemies.forEach(en => {
                if (Math.hypot(en.x - p.x, en.y - p.y) < 135) hurtEnemy(en, 35 * p.trinkets.reactiveArmor.level, 'reactiveArmor');
            });
        }

        if (p.hp <= 0) {
            if (p.revivalsLeft > 0) {
                p.revivalsLeft--;
                p.hp = Math.max(1, Math.round(p.maxHp * 0.5));
                p.sh = Math.round(p.maxSh * 0.5);
                p.invuln = 2.5;
                p.shDelay = 0;
                G.bullets = G.bullets.filter(b => !(b.isEnemy && Math.hypot(b.x - p.x, b.y - p.y) < 600));
                G.enemies.forEach(en => {
                    if (!en.dead && Math.hypot(en.x - p.x, en.y - p.y) < 360) {
                        hurtEnemy(en, 185 * p.dmgMult, 'coreReboot', true);
                    }
                });
                triggerShockwave(p.x, p.y, 780, 0.9);
                triggerShake(11, 0.42);
                spawnParticle(p.x, p.y, '#fb7185', 220, 0.55, 0, 0, true);
                if (global.CosmicAudio) global.CosmicAudio.play('emp');
                showToast(bi('ACİL ÇEKİRDEK YENİDEN BAŞLATILDI! (2.5sn KORUMA)', 'EMERGENCY CORE REBOOT ACTIVATED! (2.5s INVULN)'));
                return;
            }
            p.hp = 0;
            endRun(reasonLabel || bi('Hücum Hattı Düştü', 'Hull Integrity Lost'), false);
        }
    }

    function getBestAimTarget(fromX, fromY, maxRange = 950) {
        let best = null;
        let bestDist = maxRange;
        // Include active Boss Shield Pylons in auto-aim priority if close
        for (let i = 0; i < G.bosses.length; i++) {
            const b = G.bosses[i];
            if (b.dead) continue;
            const pylons = b.shieldPylons || [];
            for (let j = 0; j < pylons.length; j++) {
                const py = pylons[j];
                if (!py || py.alive === false || py.hp <= 0) continue;
                const dp = Math.hypot(py.x - fromX, py.y - fromY);
                if (dp < bestDist) { bestDist = dp; best = py; }
            }
        }
        const all = G.bosses.concat(G.enemies);
        for (let i = 0; i < all.length; i++) {
            const e = all[i];
            if (e.dead) continue;
            const d = Math.hypot(e.x - fromX, e.y - fromY);
            if (d < bestDist) { bestDist = d; best = e; }
        }
        return best;
    }

    function updatePlayerAim() {
        const p = G.player;
        if (G.aimMode === 'mouse') {
            if (G.mouse.active) {
                const wx = G.camX - (global.innerWidth || 1280) * 0.5 + G.mouse.x;
                const wy = G.camY - (global.innerHeight || 720) * 0.5 + G.mouse.y;
                p.aimAngle = Math.atan2(wy - p.y, wx - p.x);
            } else if (G.joy.active && Math.hypot(G.joy.dx, G.joy.dy) > 0.15) {
                p.aimAngle = Math.atan2(G.joy.dy, G.joy.dx);
            }
            // Strict mouse discipline: NEVER fall back to auto-lock when G.aimMode === 'mouse'!
            return;
        }
        const target = getBestAimTarget(p.x, p.y, 1000);
        if (target) p.aimAngle = Math.atan2(target.y - p.y, target.x - p.x);
        else if (Math.hypot(p.vx, p.vy) > 10) p.aimAngle = Math.atan2(p.vy, p.vx);
    }

    function fireWeapon(id, lv, isEvo, isMega) {
        const p = G.player;
        const dmgScale = p.dmgMult * (1 + (lv - 1) * 0.28) * (isMega ? 2.45 : (isEvo ? 1.65 : 1.0));
        const aim = p.aimAngle;
        const col = (UPG[id] && UPG[id].color) || '#38bdf8';

        if (id === 'dualLaser' || id === 'gatlingStorm' || id === 'prismOverload' || id === 'infernoGatling' || id === 'hyperionApex') {
            const count = isMega ? 4 : (isEvo ? 3 : (lv >= 3 ? 2 : 1));
            const speed = isEvo || isMega ? 920 : 760;
            for (let i = 0; i < count; i++) {
                const ang = aim + (i - (count - 1) * 0.5) * 0.10;
                G.bullets.push({
                    x: p.x + Math.cos(ang) * 20, y: p.y + Math.sin(ang) * 20,
                    vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed,
                    r: isMega ? 9 : 6, dmg: 22 * dmgScale, life: 1.4,
                    pierce: isMega ? 4 : (id === 'prismOverload' ? 3 : 1),
                    ricochet: (id === 'gatlingStorm' || isMega) ? 3 : 0,
                    color: col, sprite: 'laser', sourceId: id, hitSet: new Set()
                });
            }
            if (global.CosmicAudio) global.CosmicAudio.play('shootLaser', 0.16);
        } else if (id === 'heavyPlasma' || id === 'bloodHarvest' || id === 'gravitonImploder' || id === 'flakArtillery' || id === 'siegeBehemoth' || id === 'ironDreadnought') {
            const shots = (id === 'ironDreadnought' || id === 'siegeBehemoth') ? 2 : 1;
            for (let s = 0; s < shots; s++) {
                const ang = aim + (s === 0 ? 0 : (Math.random() - 0.5) * 0.35);
                G.bullets.push({
                    x: p.x + Math.cos(ang) * 22, y: p.y + Math.sin(ang) * 22,
                    vx: Math.cos(ang) * 520, vy: Math.sin(ang) * 520,
                    r: isMega ? 15 : 11, dmg: 46 * dmgScale, life: 1.8,
                    aoe: isMega ? 135 : (isEvo ? 98 : 68),
                    graviton: id === 'gravitonImploder',
                    color: col, sprite: 'orb', sourceId: id, hitSet: new Set()
                });
            }
            if (global.CosmicAudio) global.CosmicAudio.play('shootPlasma', 0.14);
        } else if (id === 'quantumDagger' || id === 'cosmicSupernova' || id === 'phantomExecutioner' || id === 'voidScythe' || id === 'abyssalReaper' || id === 'eclipseSingularity') {
            const count = isMega ? 5 : (isEvo ? 4 : Math.min(3, 1 + Math.floor(lv / 2)));
            for (let i = 0; i < count; i++) {
                const ang = aim + (i - (count - 1) * 0.5) * 0.18;
                G.bullets.push({
                    x: p.x, y: p.y, vx: Math.cos(ang) * 860, vy: Math.sin(ang) * 860,
                    r: isEvo || isMega ? 10 : 7, dmg: 32 * dmgScale, life: 1.2,
                    pierce: isMega ? 6 : 3, color: col, sprite: 'laser', sourceId: id, hitSet: new Set()
                });
            }
            if (global.CosmicAudio) global.CosmicAudio.play('shootLaser', 0.25);
        } else if (id === 'swarmMissiles' || id === 'quantumArbiter' || id === 'omegaJudgement') {
            const count = isMega ? 6 : (isEvo ? 5 : 2 + Math.floor(lv / 2));
            for (let i = 0; i < count; i++) {
                const ang = aim + (i - (count - 1) * 0.5) * 0.35;
                G.bullets.push({
                    x: p.x, y: p.y, vx: Math.cos(ang) * 440, vy: Math.sin(ang) * 440,
                    r: 8, dmg: 28 * dmgScale, life: 2.6, homing: true,
                    pierce: isEvo || isMega ? 3 : 1, color: col, sprite: 'missile', sourceId: id, hitSet: new Set()
                });
            }
            if (global.CosmicAudio) global.CosmicAudio.play('shootMissile', 0.14);
        } else if (id === 'flameLine' || id === 'titanCore' || id === 'necroticNapalm' || id === 'solarMortar' || id === 'heliosCataclysm') {
            const target = G.aimMode === 'auto' ? getBestAimTarget(p.x, p.y, 650) : null;
            const zx = clampWorldCoord(target ? target.x : p.x + Math.cos(aim) * 180, WORLD_W);
            const zy = clampWorldCoord(target ? target.y : p.y + Math.sin(aim) * 180, WORLD_H);
            const rad = isEvo ? 115 : (72 + lv * 6);
            G.floorZones.push({ x: zx, y: zy, r: rad, color: col, dmgPerSec: 36 * dmgScale, life: 3.4, tick: 0, sourceId: id });
            G.enemies.concat(G.bosses).forEach(en => {
                if (!en.dead && Math.hypot(en.x - zx, en.y - zy) < rad + en.r) hurtEnemy(en, 34 * dmgScale, id);
            });
            if (global.CosmicAudio) global.CosmicAudio.play('shootPlasma', 0.2);
        } else if (id === 'photonRailgun' || id === 'tachyonLance') {
            const x2 = clampWorldCoord(p.x + Math.cos(aim) * 920, WORLD_W);
            const y2 = clampWorldCoord(p.y + Math.sin(aim) * 920, WORLD_H);
            addArc(p.x, p.y, x2, y2, '#38bdf8', isEvo ? 7 : 4);
            G.bosses.forEach(b => {
                (b.shieldPylons || []).forEach(py => {
                    if (py && py.alive !== false && py.hp > 0 && pointToSegDist(py.x, py.y, p.x, p.y, x2, y2) < (py.r || 20) + 18) {
                        damageBossPylon(b, py, 75 * dmgScale, id);
                    }
                });
            });
            G.enemies.concat(G.bosses).forEach(en => {
                if (!en.dead && pointToSegDist(en.x, en.y, p.x, p.y, x2, y2) < en.r + (isEvo ? 26 : 16)) {
                    hurtEnemy(en, 75 * dmgScale, id, true, aim);
                }
            });
            if (global.CosmicAudio) global.CosmicAudio.play('emp', 0.2);
        } else if (id === 'teslaPrism' || id === 'sanctuaryMaelstrom' || id === 'cryoNova' || id === 'absoluteZero') {
            const chainCount = isEvo ? 6 : (2 + Math.floor(lv / 2));
            let cx = p.x;
            let cy = p.y;
            const hit = new Set();
            const isCryo = (id === 'cryoNova' || id === 'absoluteZero');
            for (let c = 0; c < chainCount; c++) {
                let nearest = null;
                let bestD = 540;
                for (const en of G.bosses.concat(G.enemies)) {
                    if (en.dead || hit.has(en)) continue;
                    const d = Math.hypot(en.x - cx, en.y - cy);
                    if (d < bestD) { bestD = d; nearest = en; }
                }
                if (!nearest) break;
                hit.add(nearest);
                addArc(cx, cy, nearest.x, nearest.y, isCryo ? '#22d3ee' : '#34d399', isEvo ? 4 : 2.5);
                hurtEnemy(nearest, 42 * dmgScale, id);
                if (isCryo && !nearest.isBoss) nearest.frozenTimer = Math.max(nearest.frozenTimer || 0, isEvo ? 3.2 : 2.0);
                cx = nearest.x;
                cy = nearest.y;
            }
            if (global.CosmicAudio) global.CosmicAudio.play('shootLaser', 0.2);
        } else if (id === 'chronoRift' || id === 'eternityLoop') {
            const target = G.aimMode === 'auto' ? getBestAimTarget(p.x, p.y, 580) : null;
            const zx = clampWorldCoord(target ? target.x : p.x + Math.cos(aim) * 160, WORLD_W);
            const zy = clampWorldCoord(target ? target.y : p.y + Math.sin(aim) * 160, WORLD_H);
            G.floorZones.push({ x: zx, y: zy, r: isEvo ? 145 : 95, color: '#2dd4bf', dmgPerSec: 32 * dmgScale, slowFactor: 0.45, life: 4.0, tick: 0, sourceId: id });
        }
    }

    function updateWeapons(dt) {
        const p = G.player;
        const mapMods = global.CosmicMapDirector.getPlayerModifiers(p);
        const odFireMult = p.overdriveActive > 0 ? 1.45 : 1.0;
        const effCdr = p.cdrMult / ((mapMods.fireRateMult || 1.0) * odFireMult);
        G.orbitals = [];
        const allOwned = [...Object.keys(p.weapons), ...p.evolutions, ...p.superEvolutions];

        for (const wid of allOwned) {
            const isMega = p.superEvolutions.has(wid);
            const isEvo = p.evolutions.has(wid);
            const lv = (p.weapons[wid] && p.weapons[wid].level) || 5;

            if (wid === 'energyDisc' || wid === 'aegisResonance' || wid === 'cryoVortex' || wid === 'sanctuaryMaelstrom' || wid === 'eventHorizon') {
                const count = isMega ? 6 : (isEvo ? 5 : 1 + lv);
                const rad = isMega ? 128 : (isEvo ? 112 : 84);
                const discR = isEvo || isMega ? 15 : 11;
                const col = (UPG[wid] && UPG[wid].color) || '#a78bfa';
                for (let i = 0; i < count; i++) {
                    const ang = G.time * (isEvo ? 4.2 : 3.2) + (i * Math.PI * 2) / count;
                    const ox = p.x + Math.cos(ang) * rad;
                    const oy = p.y + Math.sin(ang) * rad;
                    G.orbitals.push({ kind: 'disc', x: ox, y: oy, r: discR, color: col });
                    G.bosses.forEach(b => {
                        (b.shieldPylons || []).forEach(py => {
                            if (py && py.alive !== false && py.hp > 0 && (!py.orbHitCd || py.orbHitCd <= 0) && Math.hypot(py.x - ox, py.y - oy) < (py.r || 20) + discR) {
                                py.orbHitCd = 0.28;
                                damageBossPylon(b, py, (18 + lv * 5) * p.dmgMult * (isMega ? 2.2 : 1.3), wid);
                            }
                        });
                    });
                    G.enemies.concat(G.bosses).forEach(en => {
                        if (!en.dead && (!en.orbHitCd || en.orbHitCd <= 0) && Math.hypot(en.x - ox, en.y - oy) < en.r + discR) {
                            en.orbHitCd = 0.28;
                            hurtEnemy(en, (18 + lv * 5) * p.dmgMult * (isMega ? 2.2 : 1.3), wid);
                            if (wid === 'cryoVortex' && !en.isBoss) en.frozenTimer = 2.0;
                        }
                    });
                }
                continue;
            }

            if (wid === 'droneSwarm' || wid === 'seraphFleet') {
                const dCount = isEvo ? 6 : 1 + lv;
                for (let i = 0; i < dCount; i++) {
                    const ang = G.time * 1.9 + (i * Math.PI * 2) / dCount;
                    G.orbitals.push({ kind: 'drone', x: p.x + Math.cos(ang) * 70, y: p.y + Math.sin(ang) * 70, r: 9, color: '#eab308' });
                }
                p.weaponTimers[wid] = (p.weaponTimers[wid] || 0) - dt;
                if (p.weaponTimers[wid] <= 0) {
                    p.weaponTimers[wid] = Math.max(0.24, (isEvo ? 0.55 : 0.95) * effCdr);
                    const tgt = getBestAimTarget(p.x, p.y, 700);
                    if (tgt) {
                        const tang = Math.atan2(tgt.y - p.y, tgt.x - p.x);
                        G.bullets.push({
                            x: p.x, y: p.y, vx: Math.cos(tang) * 780, vy: Math.sin(tang) * 780,
                            r: 6, dmg: 24 * p.dmgMult * (isEvo ? 1.8 : 1.0), life: 1.4,
                            color: '#eab308', sprite: 'laser', sourceId: wid, hitSet: new Set()
                        });
                    }
                }
                continue;
            }

            const baseCdMap = {
                dualLaser: 0.42, gatlingStorm: 0.22, prismOverload: 0.34, infernoGatling: 0.19, hyperionApex: 0.20,
                heavyPlasma: 1.05, bloodHarvest: 0.72, gravitonImploder: 0.80, flakArtillery: 0.92, siegeBehemoth: 0.65, ironDreadnought: 0.58,
                quantumDagger: 0.55, cosmicSupernova: 0.44, phantomExecutioner: 0.40, voidScythe: 0.72, abyssalReaper: 0.48, eclipseSingularity: 0.38,
                swarmMissiles: 0.95, quantumArbiter: 0.62, omegaJudgement: 0.55,
                flameLine: 1.65, titanCore: 1.15, necroticNapalm: 1.25, solarMortar: 1.40, heliosCataclysm: 0.95,
                photonRailgun: 1.25, tachyonLance: 0.78, teslaPrism: 0.85, chronoRift: 1.85, eternityLoop: 1.25,
                cryoNova: 1.10, absoluteZero: 0.72
            };
            p.weaponTimers[wid] = (p.weaponTimers[wid] || 0.1) - dt;
            if (p.weaponTimers[wid] <= 0) {
                p.weaponTimers[wid] = Math.max(0.11, (baseCdMap[wid] || 0.85) * effCdr);
                fireWeapon(wid, lv, isEvo, isMega);
            }
        }
    }

    function activateAbility() {
        const p = G.player;
        if (!p || p.abilityCd > 0 || G.paused || G.isLevelingUp || G.isLooting || G.isBossReward || G.isVictoryChoice || G.gameOver) return;
        p.abilityCd = p.abilityMaxCd * p.cdrMult;
        if (global.CosmicAudio) global.CosmicAudio.play('dash', 0.1);

        const sid = p.shipId;
        if (sid === 'interceptor') {
            p.invuln = 1.25;
            p.x += Math.cos(p.aimAngle) * 175;
            p.y += Math.sin(p.aimAngle) * 175;
            global.CosmicMapDirector.resolveCircleCollision(p, 16);
            spawnParticle(p.x, p.y, '#38bdf8', 70, 0.35, 0, 0, true);
        } else if (sid === 'dreadnought') {
            for (let i = 0; i < 16; i++) {
                const a = (i * Math.PI * 2) / 16;
                G.bullets.push({
                    x: p.x, y: p.y, vx: Math.cos(a) * 520, vy: Math.sin(a) * 520, r: 9,
                    dmg: 55 * p.dmgMult, life: 1.6, aoe: 65, color: '#f59e0b', sprite: 'missile', sourceId: 'flakArtillery', hitSet: new Set()
                });
            }
        } else if (sid === 'aegis') {
            let cleared = 0;
            G.bullets = G.bullets.filter(b => {
                if (b.isEnemy && Math.hypot(b.x - p.x, b.y - p.y) < 540) { cleared++; return false; }
                return true;
            });
            p.sh = Math.min(p.maxSh, p.sh + 35 + cleared * 4);
            spawnParticle(p.x, p.y, '#34d399', 180, 0.45, 0, 0, true);
            if (global.CosmicAudio) global.CosmicAudio.play('emp');
        } else if (sid === 'phantom') {
            p.cloaked = true;
            p.cloakCycle = 0;
            p.x += Math.cos(p.aimAngle) * 185;
            p.y += Math.sin(p.aimAngle) * 185;
            global.CosmicMapDirector.resolveCircleCollision(p, 16);
            spawnParticle(p.x, p.y, '#a78bfa', 68, 0.35, 0, 0, true);
        } else if (sid === 'solarflare') {
            spawnParticle(p.x, p.y, '#f97316', 230, 0.5, 0, 0, true);
            G.enemies.concat(G.bosses).forEach(en => {
                if (!en.dead && Math.hypot(en.x - p.x, en.y - p.y) < 280) {
                    hurtEnemy(en, 110 * p.dmgMult, 'flameLine');
                    en.burnTimer = 4.0;
                }
            });
        } else if (sid === 'tempest') {
            fireWeapon('absoluteZero', 5, true, false);
        } else if (sid === 'valkyrie') {
            fireWeapon('tachyonLance', 5, true, false);
        } else if (sid === 'chronos') {
            G.enemies.forEach(en => { if (!en.isBoss) en.frozenTimer = Math.max(en.frozenTimer || 0, 3.5); });
            spawnParticle(p.x, p.y, '#2dd4bf', 200, 0.55, 0, 0, true);
        }
    }

    function spawnEnemy(typeKey, x, y, isElite = false, isChild = false, isHunter = false) {
        const tpl = ENEMY_TYPES[typeKey] || ENEMY_TYPES.swarmer;
        const waveHpScale = 1 + (G.wave - 1) * 0.28 + (G.wave > 15 ? (G.wave - 15) * 0.22 : 0);
        const waveSpScale = 1 + Math.min(0.45, (G.wave - 1) * 0.02) + (G.wave > 15 ? Math.min(0.45, (G.wave - 15) * 0.03) : 0);
        const waveDmgScale = 1 + (G.wave - 1) * 0.055;

        const hpScale = G.diff.enemyHp * G.modeEnemyHpMult * waveHpScale * (isElite ? 3.2 : (isChild ? 0.55 : (isHunter ? 1.25 : 1)));
        const spScale = G.diff.speed * G.modeEnemySpMult * waveSpScale * (isElite ? 1.12 : (isHunter ? 1.38 : 1));
        const dmgScale = waveDmgScale * (isElite ? 1.35 : (isHunter ? 1.25 : 1));

        const en = {
            type: typeKey, spriteKey: tpl.spriteKey, x, y,
            r: isElite ? tpl.r * 1.35 : (isChild ? tpl.r * 0.72 : tpl.r),
            hp: Math.round(tpl.hp * hpScale), maxHp: Math.round(tpl.hp * hpScale),
            sp: tpl.sp * spScale, dmg: Math.round(tpl.dmg * dmgScale),
            xp: isElite ? tpl.xp * 3 : tpl.xp, angle: 0,
            isElite, isChild, isHunter,
            shoots: !!tpl.shoots, sniper: !!tpl.sniper, teleports: !!tpl.teleports, splits: !!tpl.splits, summons: !!tpl.summons,
            fireCd: 1.4 + randVal() * 1.3, actionCd: 3.5 + randVal() * 2.0,
            stealthAlpha: 1, slideDir: randVal() < 0.5 ? 1 : -1,
            telegraphTarget: null, flashTimer: 0, frozenTimer: 0, burnTimer: 0, orbHitCd: 0, dead: false
        };
        global.CosmicMapDirector.resolveCircleCollision(en, en.r);
        G.enemies.push(en);
        return en;
    }

    function spawnBossShieldPylons(boss) {
        if (!boss || boss.pylonsSpawned) return;
        boss.pylonsSpawned = true;
        const count = (G.wave >= 15 || boss.bossIdx >= 2) ? 3 : 2;
        const pyHp = Math.max(450, Math.round(boss.maxHp * 0.085));
        boss.shieldPylons = [];
        for (let k = 0; k < count; k++) {
            const ang = (k * Math.PI * 2) / count;
            const orbitR = boss.r + 74;
            boss.shieldPylons.push({
                x: boss.x + Math.cos(ang) * orbitR,
                y: boss.y + Math.sin(ang) * orbitR,
                orbitAngle: ang,
                orbitR,
                r: 20,
                hp: pyHp,
                maxHp: pyHp,
                alive: true,
                flashTimer: 0,
                orbHitCd: 0
            });
        }
        showToast(bi(`${boss.name} KALKAN DİREKLERİ AÇILDI! (-%65 HASAR)`, `${boss.name} SHIELD PYLONS DEPLOYED! (-65% DMG)`));
    }

    function spawnBoss(bossIdx) {
        const cfg = BOSS_CONFIGS[bossIdx % BOSS_CONFIGS.length];
        const waveScale = G.modeId === 'bossrush'
            ? (0.78 + bossIdx * 0.36)
            : (1 + Math.max(0, G.wave - 5) * 0.16 + (G.wave > 15 ? (G.wave - 15) * 0.12 : 0));
        const hp = Math.round(cfg.baseHp * G.diff.bossHp * G.modeEnemyHpMult * waveScale);
        const p = G.player;
        const a = randVal() * Math.PI * 2;
        const boss = {
            isBoss: true, bossIdx, spriteKey: cfg.spriteKey, name: cfg.name,
            hint: isEn() ? cfg.hintEn : cfg.hint, hintTr: cfg.hint, hintEn: cfg.hintEn,
            x: Math.max(240, Math.min(WORLD_W - 240, p.x + Math.cos(a) * 600)),
            y: Math.max(240, Math.min(WORLD_H - 240, p.y + Math.sin(a) * 480)),
            r: cfg.r, hp, maxHp: hp, sp: cfg.sp * G.diff.speed * G.modeEnemySpMult, armor: 0.14, phase: 1,
            hasWeakspot: cfg.hasWeakspot, angle: 0, atkCd: 2.8, atkIdx: 0,
            state: 'chase', stateTimer: 0,
            dashVx: 0, dashVy: 0, sweepAngle: 0, sweepDir: 1, sweepTick: 0,
            spiralAngle: 0, spiralTick: 0,
            telegraphRadius: 0, telegraphLine: null,
            shieldPylons: [], pylonsSpawned: false,
            flashTimer: 0, orbHitCd: 0, dead: false
        };
        global.CosmicMapDirector.resolveCircleCollision(boss, boss.r);
        G.bosses.push(boss);
        if (global.CosmicAudio) global.CosmicAudio.play('bossAlarm');
        showToast(bi(`TEHDİT ALARMI: ${cfg.name}`, `THREAT ALERT: ${cfg.name}`));
    }

    function startWave(num) {
        G.wave = num;
        G.waveTimer = 0;

        if (G.modeId === 'endless' && num === 16) {
            showBanner(bi('HİÇLİK ÇÜRÜMESİ AKTİF — DÜŞMAN HIZI & GÜCÜ ARTIYOR', 'VOID CORRUPTION ACTIVE — SWARM VELOCITY & HP SURGING'));
        }

        if (G.modeId !== 'bossrush' && num % 5 === 0) {
            const bossIdx = (num === 15 && G.modeId === 'survival') ? 4 : (Math.floor(num / 5) - 1);
            spawnBoss(bossIdx);
        } else {
            showToast(bi(`DALGA ${num} — FİLO YAKLAŞIYOR`, `WAVE ${num} — HOSTILE FLEET INBOUND`));
        }

        if (global.CosmicAudio) global.CosmicAudio.setAmbientIntensity(Math.min(1, num / 25));
    }

    function triggerAfkHunterSquad() {
        const p = G.player;
        const count = 2 + Math.min(2, Math.floor(G.wave / 4));
        const types = ['kamikaze', 'shooter', 'kamikaze', 'phantom'];
        for (let i = 0; i < count; i++) {
            const ang = (i * Math.PI * 2) / count + randVal() * 0.6;
            const dist = 340 + randVal() * 90;
            const sx = Math.max(120, Math.min(WORLD_W - 120, p.x + Math.cos(ang) * dist));
            const sy = Math.max(120, Math.min(WORLD_H - 120, p.y + Math.sin(ang) * dist));
            spawnEnemy(types[i % types.length], sx, sy, false, false, true);
        }
        if (global.CosmicAudio) global.CosmicAudio.play('bossAlarm');
        showToast(bi('HAREKETSİZ KONUM TESPİT EDİLDİ — AVCI TİMİ GÖNDERİLDİ', 'STATIONARY SIGNATURE DETECTED — HUNTER SQUAD INBOUND'));
    }

    function updateBossAi(b, dt) {
        const p = G.player;
        const hpRatio = b.hp / b.maxHp;
        const prevPhase = b.phase;
        if (hpRatio < 0.30) b.phase = 3;
        else if (hpRatio < 0.65) b.phase = 2;

        if (b.phase !== prevPhase) {
            showToast(bi(`${b.name} — FAZ ${b.phase} AÇILDI!`, `${b.name} — PHASE ${b.phase} ENGAGED!`));
            triggerShake(10, 0.36);
            triggerShockwave(b.x, b.y, 920, 0.9);
            if (global.CosmicAudio) global.CosmicAudio.play('bossAlarm');
            if (b.phase >= 2 && !b.pylonsSpawned && (G.wave >= 10 || (G.modeId === 'bossrush' && b.bossIdx >= 1))) {
                spawnBossShieldPylons(b);
            }
        }

        // Orbit destructible Shield Pylons
        if (Array.isArray(b.shieldPylons) && b.shieldPylons.length > 0) {
            for (let j = 0; j < b.shieldPylons.length; j++) {
                const py = b.shieldPylons[j];
                if (!py || py.alive === false || py.hp <= 0) continue;
                if (py.flashTimer > 0) py.flashTimer -= dt;
                if (py.orbHitCd > 0) py.orbHitCd -= dt;
                py.orbitAngle += dt * (1.35 + b.phase * 0.25);
                py.x = clampWorldCoord(b.x + Math.cos(py.orbitAngle) * py.orbitR, WORLD_W);
                py.y = clampWorldCoord(b.y + Math.sin(py.orbitAngle) * py.orbitR, WORLD_H);
            }
        }

        const dx = p.x - b.x;
        const dy = p.y - b.y;
        const dist = Math.hypot(dx, dy) || 1;

        if (b.state === 'chase') {
            b.angle = Math.atan2(dy, dx);
            const phaseSp = b.sp * (1 + (b.phase - 1) * 0.20);
            b.x += (dx / dist) * phaseSp * dt;
            b.y += (dy / dist) * phaseSp * dt;
            if (global.CosmicMapDirector.resolveCircleCollision(b, b.r)) {
                // Smooth flank slide around bulkheads
                b.x += (-dy / dist) * phaseSp * 0.45 * dt;
                b.y += (dx / dist) * phaseSp * 0.45 * dt;
            }

            b.atkCd -= dt * (1 + (b.phase - 1) * 0.28);
            if (b.atkCd <= 0) {
                b.atkCd = Math.max(1.9, 3.2 - b.phase * 0.35);
                const pattern = b.atkIdx % 4;
                b.atkIdx++;

                if (pattern === 0) {
                    // Attack 1a: Telegraphed Hyper-Dash Charge
                    b.state = 'telegraph_dash';
                    b.stateTimer = 0.95;
                    const ang = Math.atan2(dy, dx);
                    const spd = 480 + b.phase * 65;
                    b.dashVx = Math.cos(ang) * spd;
                    b.dashVy = Math.sin(ang) * spd;
                    b.telegraphLine = {
                        x: clampWorldCoord(b.x + Math.cos(ang) * 480, WORLD_W),
                        y: clampWorldCoord(b.y + Math.sin(ang) * 480, WORLD_H)
                    };
                } else if (pattern === 1) {
                    // Attack 2: Dual Counter-Rotating Spiral Bullet Curtains (dodgeable lanes!)
                    b.state = 'spiral_curtain';
                    b.stateTimer = 2.0 + b.phase * 0.25;
                    b.spiralAngle = Math.atan2(dy, dx);
                    b.spiralTick = 0;
                } else if (pattern === 2 && b.phase >= 2) {
                    // Attack 1b: Telegraphed Rotating Laser Sweep (Phase 2+)
                    b.state = 'telegraph_sweep';
                    b.stateTimer = 0.95;
                    b.sweepDir = (b.atkIdx % 2 === 0) ? 1 : -1;
                    b.sweepAngle = Math.atan2(dy, dx) - b.sweepDir * 0.78;
                    b.telegraphLine = {
                        x: clampWorldCoord(b.x + Math.cos(b.sweepAngle) * 760, WORLD_W),
                        y: clampWorldCoord(b.y + Math.sin(b.sweepAngle) * 760, WORLD_H)
                    };
                } else {
                    // Attack 3: Telegraphed Plasma Nova Ring + Orbital Mortars
                    b.state = 'telegraph_nova';
                    b.stateTimer = 1.05;
                    b.telegraphRadius = b.r * 2.7;
                    if (b.phase >= 2 && global.CosmicMapDirector && Array.isArray(global.CosmicMapDirector.meteors)) {
                        const mortarCount = b.phase >= 3 ? 4 : 3;
                        for (let m = 0; m < mortarCount; m++) {
                            const ma = (m * Math.PI * 2) / mortarCount + randVal() * 0.4;
                            const mr = 95 + randVal() * 145;
                            global.CosmicMapDirector.meteors.push({
                                x: Math.max(180, Math.min(WORLD_W - 180, p.x + Math.cos(ma) * mr)),
                                y: Math.max(180, Math.min(WORLD_H - 180, p.y + Math.sin(ma) * mr)),
                                r: 96,
                                delay: 1.45,
                                maxDelay: 1.45,
                                impacted: false,
                                afterglow: 0.45
                            });
                        }
                    }
                }
            }
        } else if (b.state === 'telegraph_dash') {
            b.stateTimer -= dt;
            if (b.stateTimer <= 0) {
                b.telegraphLine = null;
                b.state = 'dashing';
                b.stateTimer = 0.62;
            }
        } else if (b.state === 'dashing') {
            b.x += b.dashVx * dt;
            b.y += b.dashVy * dt;
            global.CosmicMapDirector.resolveCircleCollision(b, b.r);
            b.stateTimer -= dt;
            if (b.stateTimer <= 0) b.state = 'chase';
        } else if (b.state === 'telegraph_sweep') {
            b.stateTimer -= dt;
            if (b.stateTimer <= 0) {
                b.telegraphLine = null;
                b.state = 'sweeping';
                b.stateTimer = 1.55;
                b.sweepTick = 0;
                if (global.CosmicAudio) global.CosmicAudio.play('emp');
            }
        } else if (b.state === 'sweeping') {
            b.stateTimer -= dt;
            b.sweepAngle += b.sweepDir * (0.95 + b.phase * 0.16) * dt;
            b.angle = b.sweepAngle;
            const bx2 = clampWorldCoord(b.x + Math.cos(b.sweepAngle) * 780, WORLD_W);
            const by2 = clampWorldCoord(b.y + Math.sin(b.sweepAngle) * 780, WORLD_H);
            addArc(b.x, b.y, bx2, by2, '#fb7185', 8);
            b.sweepTick -= dt;
            if (b.sweepTick <= 0) {
                b.sweepTick = 0.18;
                if (pointToSegDist(p.x, p.y, b.x, b.y, bx2, by2) < 22) {
                    hurtPlayer(20 + b.phase * 4, b.name);
                }
            }
            if (b.stateTimer <= 0) b.state = 'chase';
        } else if (b.state === 'spiral_curtain') {
            b.stateTimer -= dt;
            b.spiralAngle += dt * 1.65;
            b.angle = b.spiralAngle;
            b.spiralTick -= dt;
            if (b.spiralTick <= 0) {
                b.spiralTick = b.phase >= 3 ? 0.14 : 0.18;
                const arms = 3;
                const spd = 230 + b.phase * 22;
                for (let k = 0; k < arms; k++) {
                    const baseA = (k * Math.PI * 2) / arms;
                    // Counter-rotating dual spirals leaving clean dodgeable lanes
                    const a1 = b.spiralAngle + baseA;
                    const a2 = -b.spiralAngle + baseA + 0.52;
                    G.bullets.push({
                        isEnemy: true, x: b.x, y: b.y,
                        vx: Math.cos(a1) * spd, vy: Math.sin(a1) * spd,
                        r: 7, dmg: 16 + b.phase * 3, life: 3.6, sprite: 'enemy'
                    });
                    if (b.phase >= 2) {
                        G.bullets.push({
                            isEnemy: true, x: b.x, y: b.y,
                            vx: Math.cos(a2) * (spd * 0.9), vy: Math.sin(a2) * (spd * 0.9),
                            r: 7, dmg: 16 + b.phase * 3, life: 3.6, sprite: 'enemy'
                        });
                    }
                }
                if (global.CosmicAudio) global.CosmicAudio.play('shootPlasma', 0.25);
            }
            if (b.stateTimer <= 0) b.state = 'chase';
        } else if (b.state === 'telegraph_nova') {
            b.stateTimer -= dt;
            if (b.stateTimer <= 0) {
                b.telegraphRadius = 0;
                b.state = 'chase';
                const spokes = 12 + b.phase * 4;
                const spd = 250 + b.phase * 25;
                for (let k = 0; k < spokes; k++) {
                    const a = (k * Math.PI * 2) / spokes + G.time;
                    G.bullets.push({
                        isEnemy: true, x: b.x, y: b.y,
                        vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
                        r: 8, dmg: 18 + b.phase * 3, life: 3.8, sprite: 'enemy'
                    });
                }
                if (Math.hypot(p.x - b.x, p.y - b.y) < b.r * 2.2) {
                    hurtPlayer(26 + b.phase * 4, b.name);
                }
                spawnParticle(b.x, b.y, '#fb7185', b.r * 2.4, 0.35, 0, 0, true);
                if (global.CosmicAudio) global.CosmicAudio.play('shootPlasma');
            }
        }

        if (Math.hypot(p.x - b.x, p.y - b.y) < b.r + 14) {
            hurtPlayer(32 + b.phase * 4, b.name);
        }
    }

    function updateEnemiesAndBosses(dt) {
        const p = G.player;

        if (G.modeId === 'bossrush') {
            G.bossRushTimer -= dt;
            if (G.bossRushTimer <= 0 && G.bosses.length < 2) {
                G.bossRushTimer = 25.0;
                G.bossRushCount++;
                G.wave = Math.max(G.wave, G.bossRushCount * 2);
                spawnBoss(G.bossRushCount - 1);
                // Escort elite wave
                for (let e = 0; e < 3; e++) {
                    const a = randVal() * Math.PI * 2;
                    spawnEnemy(e % 2 === 0 ? 'tank' : 'shooter', p.x + Math.cos(a) * 520, p.y + Math.sin(a) * 440, true, false);
                }
            }
        } else {
            G.waveTimer += dt;
            if (G.waveTimer >= G.waveDuration && G.bosses.length === 0) {
                startWave(G.wave + 1);
            }
        }

        const timeAttackDensity = G.modeId === 'timeattack' ? 1.45 : 1.0;
        const targetMax = Math.min(145, 18 + G.wave * 8);
        G.spawnAcc += dt * G.diff.spawn * timeAttackDensity * (1.25 + G.wave * 0.25);
        while (G.spawnAcc >= 1 && G.enemies.length < targetMax) {
            G.spawnAcc -= 1;
            const ang = randVal() * Math.PI * 2;
            const dist = 560 + randVal() * 240;
            const sx = Math.max(100, Math.min(WORLD_W - 100, p.x + Math.cos(ang) * dist));
            const sy = Math.max(100, Math.min(WORLD_H - 100, p.y + Math.sin(ang) * dist));
            const pool = ['swarmer', 'kamikaze'];
            if (G.wave >= 2) pool.push('shooter', 'tank');
            if (G.wave >= 4) pool.push('phantom', 'splitter');
            if (G.wave >= 6) pool.push('sniper', 'queen');
            spawnEnemy(pool[Math.floor(randVal() * pool.length)], sx, sy, G.wave >= 3 && randVal() < 0.05, false);
        }

        for (let i = G.enemies.length - 1; i >= 0; i--) {
            const en = G.enemies[i];
            if (en.dead) { G.enemies.splice(i, 1); continue; }
            if (en.flashTimer > 0) en.flashTimer -= dt;
            if (en.frozenTimer > 0) en.frozenTimer -= dt;
            if (en.orbHitCd > 0) en.orbHitCd -= dt;
            if (en.burnTimer > 0) {
                en.burnTimer -= dt;
                if (Math.random() < dt * 2.5) hurtEnemy(en, 8 * p.dmgMult, 'flameLine');
            }

            const dx = p.x - en.x;
            const dy = p.y - en.y;
            const dist = Math.hypot(dx, dy) || 1;
            en.angle = Math.atan2(dy, dx);
            const slowMult = en.frozenTimer > 0 ? 0.45 : 1.0;
            const moveMul = ((en.shoots || en.sniper) && dist < 440) ? 0.28 : 1.0;
            en.x += (dx / dist) * en.sp * moveMul * slowMult * dt;
            en.y += (dy / dist) * en.sp * moveMul * slowMult * dt;

            if (global.CosmicMapDirector.resolveCircleCollision(en, en.r)) {
                // Slide around Bulkheads & Asteroid cover naturally
                const perpX = (-dy / dist) * en.slideDir;
                const perpY = (dx / dist) * en.slideDir;
                en.x += perpX * en.sp * 0.72 * slowMult * dt;
                en.y += perpY * en.sp * 0.72 * slowMult * dt;
                global.CosmicMapDirector.resolveCircleCollision(en, en.r);
            }

            if (en.teleports) {
                en.actionCd -= dt;
                en.stealthAlpha = en.actionCd < 1.2 ? 0.42 : 1.0;
                if (en.actionCd <= 0 && dist < 540) {
                    en.actionCd = 4.8;
                    const flankAng = en.angle + (randVal() > 0.5 ? 1.3 : -1.3);
                    en.x = clampWorldCoord(p.x - Math.cos(flankAng) * 180, WORLD_W);
                    en.y = clampWorldCoord(p.y - Math.sin(flankAng) * 180, WORLD_H);
                    global.CosmicMapDirector.resolveCircleCollision(en, en.r);
                    spawnParticle(en.x, en.y, '#a78bfa', 18, 0.25, 0, 0, true);
                }
            }
            if (en.summons && G.enemies.length < 130) {
                en.actionCd -= dt;
                if (en.actionCd <= 0) {
                    en.actionCd = 6.5;
                    spawnEnemy('swarmer', en.x + 24, en.y, false, true);
                    spawnEnemy('swarmer', en.x - 24, en.y, false, true);
                }
            }

            if (en.sniper) {
                en.fireCd -= dt;
                en.telegraphTarget = (en.fireCd <= 0.85 && en.fireCd > 0)
                    ? { x: clampWorldCoord(p.x, WORLD_W), y: clampWorldCoord(p.y, WORLD_H) }
                    : null;
                if (en.fireCd <= 0) {
                    en.fireCd = 3.0;
                    en.telegraphTarget = null;
                    G.bullets.push({
                        isEnemy: true, x: en.x, y: en.y,
                        vx: (dx / dist) * 510, vy: (dy / dist) * 510,
                        r: 7, dmg: en.dmg, life: 2.8, sprite: 'enemy'
                    });
                }
            } else if (en.shoots) {
                en.fireCd -= dt;
                if (en.fireCd <= 0) {
                    en.fireCd = 2.2;
                    G.bullets.push({
                        isEnemy: true, x: en.x, y: en.y,
                        vx: (dx / dist) * 280, vy: (dy / dist) * 280,
                        r: 7, dmg: en.dmg, life: 3.4, sprite: 'enemy'
                    });
                }
            }

            if (dist < en.r + 14) {
                hurtPlayer(en.dmg, en.type);
                if (en.type === 'kamikaze') {
                    spawnParticle(en.x, en.y, '#fb7185', 28, 0.3, 0, 0, true);
                    en.dead = true;
                }
            }
        }

        for (let i = G.bosses.length - 1; i >= 0; i--) {
            const b = G.bosses[i];
            if (b.dead) { G.bosses.splice(i, 1); continue; }
            if (b.flashTimer > 0) b.flashTimer -= dt;
            if (b.orbHitCd > 0) b.orbHitCd -= dt;
            updateBossAi(b, dt);
        }
    }

    function applyBulletAoe(b, hitTarget, allHostiles) {
        if (!b.aoe) return;
        spawnParticle(b.x, b.y, b.color, b.aoe * 0.65, 0.25, 0, 0, true);
        for (const other of allHostiles) {
            if (!other.dead && other !== hitTarget && Math.hypot(other.x - b.x, other.y - b.y) <= b.aoe) {
                hurtEnemy(other, b.dmg * 0.6, b.sourceId);
                if (b.graviton && !other.isBoss) {
                    other.x += (b.x - other.x) * 0.28;
                    other.y += (b.y - other.y) * 0.28;
                }
            }
        }
        G.bosses.forEach(boss => {
            (boss.shieldPylons || []).forEach(py => {
                if (py && py.alive !== false && py.hp > 0 && Math.hypot(py.x - b.x, py.y - b.y) <= b.aoe) {
                    damageBossPylon(boss, py, b.dmg * 0.6, b.sourceId);
                }
            });
        });
    }

    function updateBullets(dt) {
        const p = G.player;
        const allHostiles = G.bosses.concat(G.enemies);
        const dir = global.CosmicMapDirector;

        for (let i = G.bullets.length - 1; i >= 0; i--) {
            const b = G.bullets[i];
            b.life -= dt;
            if (b.life <= 0) { G.bullets.splice(i, 1); continue; }

            if (b.homing && !b.isEnemy) {
                const tgt = getBestAimTarget(b.x, b.y, 480);
                if (tgt) {
                    const desired = Math.atan2(tgt.y - b.y, tgt.x - b.x);
                    const spd = Math.hypot(b.vx, b.vy) || 440;
                    b.vx = b.vx * 0.90 + Math.cos(desired) * spd * 0.10;
                    b.vy = b.vy * 0.90 + Math.sin(desired) * spd * 0.10;
                }
            }
            b.x += b.vx * dt;
            b.y += b.vy * dt;

            // Physical Cover Obstacle Collision for enemy shots & non-piercing player bullets
            const isNonPiercing = !b.pierce || b.pierce <= 1;
            if (dir && (b.isEnemy || isNonPiercing)) {
                const obsHit = dir.checkProjectileObstacleHit(b.x, b.y, b.r || 5);
                if (obsHit && obsHit.hit) {
                    const sparkCol = b.isEnemy ? '#fb7185' : (b.color || '#38bdf8');
                    for (let s = 0; s < 3; s++) {
                        const sa = randVal() * Math.PI * 2;
                        spawnParticle(b.x, b.y, sparkCol, 3.5, 0.20, Math.cos(sa) * 95, Math.sin(sa) * 95);
                    }
                    if (!b.isEnemy && b.aoe) applyBulletAoe(b, null, allHostiles);
                    G.bullets.splice(i, 1);
                    continue;
                }
            }

            if (b.isEnemy) {
                if (Math.hypot(b.x - p.x, b.y - p.y) < 13 + (b.r || 6) * 0.55) {
                    hurtPlayer(b.dmg, bi('Düşman Atışı', 'Hostile Fire'));
                    G.bullets.splice(i, 1);
                }
                continue;
            }

            let consumed = false;
            const moveAng = Math.atan2(b.vy, b.vx);

            // Priority 1: Check destructible Boss Shield Pylons first
            for (let biIdx = 0; biIdx < G.bosses.length; biIdx++) {
                const boss = G.bosses[biIdx];
                const pylons = boss.shieldPylons || [];
                for (let pj = 0; pj < pylons.length; pj++) {
                    const py = pylons[pj];
                    if (!py || py.alive === false || py.hp <= 0 || (b.hitSet && b.hitSet.has(py))) continue;
                    if (Math.hypot(b.x - py.x, b.y - py.y) <= (py.r || 20) + b.r) {
                        if (b.hitSet) b.hitSet.add(py);
                        damageBossPylon(boss, py, b.dmg, b.sourceId);
                        applyBulletAoe(b, null, allHostiles);
                        if (b.pierce && b.pierce > 1) b.pierce--;
                        else { consumed = true; break; }
                    }
                }
                if (consumed) break;
            }
            if (consumed) { G.bullets.splice(i, 1); continue; }

            // Priority 2: Hostile units & Boss hulls
            for (const en of allHostiles) {
                if (en.dead || (b.hitSet && b.hitSet.has(en))) continue;
                if (Math.hypot(b.x - en.x, b.y - en.y) <= en.r + b.r) {
                    if (b.hitSet) b.hitSet.add(en);
                    hurtEnemy(en, b.dmg, b.sourceId, false, moveAng);
                    applyBulletAoe(b, en, allHostiles);
                    if (b.ricochet && b.ricochet > 0) {
                        b.ricochet--;
                        const nxt = getBestAimTarget(b.x, b.y, 320);
                        if (nxt && (!b.hitSet || !b.hitSet.has(nxt))) {
                            const spd = Math.hypot(b.vx, b.vy);
                            const na = Math.atan2(nxt.y - b.y, nxt.x - b.x);
                            b.vx = Math.cos(na) * spd;
                            b.vy = Math.sin(na) * spd;
                            continue;
                        }
                    }
                    if (b.pierce && b.pierce > 1) b.pierce--;
                    else { consumed = true; break; }
                }
            }
            if (consumed) G.bullets.splice(i, 1);
        }
    }

    function updateWorldEntities(dt) {
        const p = G.player;
        for (let i = G.floorZones.length - 1; i >= 0; i--) {
            const z = G.floorZones[i];
            z.life -= dt;
            z.tick -= dt;
            if (z.life <= 0) { G.floorZones.splice(i, 1); continue; }
            if (z.tick <= 0) {
                z.tick = 0.45;
                G.enemies.concat(G.bosses).forEach(en => {
                    if (!en.dead && Math.hypot(en.x - z.x, en.y - z.y) <= z.r + en.r) {
                        hurtEnemy(en, z.dmgPerSec * 0.45, z.sourceId);
                        if (z.slowFactor && !en.isBoss) en.frozenTimer = Math.max(en.frozenTimer || 0, 0.7);
                    }
                });
            }
        }
        if (p.solarAuraRadius > 0) {
            G.solarTick = (G.solarTick || 0) - dt;
            if (G.solarTick <= 0) {
                G.solarTick = 0.4;
                G.enemies.concat(G.bosses).forEach(en => {
                    if (!en.dead && Math.hypot(en.x - p.x, en.y - p.y) <= p.solarAuraRadius + en.r) {
                        hurtEnemy(en, 11 * p.dmgMult, 'flameLine');
                    }
                });
            }
        }
        for (let i = G.crystals.length - 1; i >= 0; i--) {
            const c = G.crystals[i];
            const dx = p.x - c.x;
            const dy = p.y - c.y;
            const dist = Math.hypot(dx, dy) || 1;
            if (dist < p.magnetRadius) {
                const spd = 430 + (p.magnetRadius - dist) * 2.2;
                c.x += (dx / dist) * spd * dt;
                c.y += (dy / dist) * spd * dt;
            }
            if (dist < 24) {
                G.crystals.splice(i, 1);
                if (global.CosmicAudio) global.CosmicAudio.play('xpPickup', 0.22);
                addOverdriveCharge(c.big ? 3.2 : 1.4);
                grantXp(c.val * p.xpMult);
                if (G.isLevelingUp) return;
            }
        }
        for (let i = G.pickups.length - 1; i >= 0; i--) {
            const pk = G.pickups[i];
            if (Math.hypot(p.x - pk.x, p.y - pk.y) < 36) {
                if (pk.kind === 'heal') p.hp = Math.min(p.maxHp, p.hp + 28);
                else p.sh = Math.min(p.maxSh, p.sh + 35);
                if (global.CosmicAudio) global.CosmicAudio.play('powerup');
                addFloatText(p.x, p.y - 28, pk.kind === 'heal' ? '+28 HP' : bi('+35 KALKAN', '+35 SHIELD'), '#34d399', true);
                G.pickups.splice(i, 1);
            }
        }
        for (let i = G.chests.length - 1; i >= 0; i--) {
            if (Math.hypot(p.x - G.chests[i].x, p.y - G.chests[i].y) < 44) {
                G.chests.splice(i, 1);
                openCosmicChestModal();
                return;
            }
        }
        for (let i = G.particles.length - 1; i >= 0; i--) {
            const pt = G.particles[i];
            pt.life -= dt;
            pt.x += pt.vx * dt;
            pt.y += pt.vy * dt;
            if (pt.life <= 0) G.particles.splice(i, 1);
        }
        for (let i = G.floatTexts.length - 1; i >= 0; i--) {
            const ft = G.floatTexts[i];
            ft.life -= dt;
            ft.y += ft.vy * dt;
            if (ft.life <= 0) G.floatTexts.splice(i, 1);
        }
        for (let i = G.arcs.length - 1; i >= 0; i--) {
            G.arcs[i].alpha -= dt * 6.5;
            if (G.arcs[i].alpha <= 0) G.arcs.splice(i, 1);
        }
    }

    function grantXp(amt) {
        const p = G.player;
        p.xp += amt;
        if (p.xp >= p.nextXp && !G.isLevelingUp && !G.gameOver) {
            p.xp -= p.nextXp;
            p.level++;
            p.nextXp = Math.round(32 + p.level * 18 + Math.pow(p.level, 1.38) * 3.5);
            triggerLevelUp();
        }
    }

    function getUpgradePool() {
        const p = G.player;
        const pool = [];
        const maxWSlots = MAX_WEAPON_SLOTS + p.extraSlots;

        for (const mega of Object.values(SUPER_EVOLUTIONS)) {
            if (p.superEvolutions.has(mega.id)) continue;
            if (mega.shipExclusive && mega.shipExclusive !== p.shipId) continue;
            const reqs = mega.evoReqs || mega.req || [];
            const evoPool = mega.evoPool || reqs;
            const hasPrimary = reqs.length >= 2 && reqs.every(r => p.evolutions.has(r));
            const matchingFromPool = evoPool.filter(r => p.evolutions.has(r));
            if (hasPrimary || matchingFromPool.length >= 2) {
                const consumeEvos = hasPrimary ? reqs.slice(0, 2) : matchingFromPool.slice(0, 2);
                pool.push(Object.assign({}, mega, {
                    consumeEvos,
                    tag: 'MEGA',
                    nextLvLabel: bi('MEGA FÜZYON (+1 SLOT)', 'MEGA FUSION (+1 SLOT)')
                }));
            }
        }

        for (const evo of Object.values(EVOLUTIONS)) {
            if (p.evolutions.has(evo.id) || (evo.shipExclusive && evo.shipExclusive !== p.shipId) || !p.trinkets[evo.trinketReq]) continue;
            const hasPrimary = p.weapons[evo.weaponReq] && p.weapons[evo.weaponReq].level >= 5;
            const hasAlt = evo.altWeaponReq && p.weapons[evo.altWeaponReq] && p.weapons[evo.altWeaponReq].level >= 5;
            if (hasPrimary || hasAlt) {
                pool.push(Object.assign({}, evo, {
                    replaceWeapon: hasPrimary ? evo.weaponReq : evo.altWeaponReq,
                    tag: bi('EVRİM', 'EVOLUTION'),
                    nextLvLabel: bi('EVRİM FÜZYONU', 'EVOLUTION FUSION')
                }));
            }
        }

        const wCount = Object.keys(p.weapons).length + p.evolutions.size + p.superEvolutions.size;
        for (const w of Object.values(WEAPONS)) {
            if (w.shipExclusive && w.shipExclusive !== p.shipId) continue;
            const owned = p.weapons[w.id];
            const tag = w.shipExclusive ? bi('İMZA SİLAH', 'SIGNATURE') : bi('SİLAH', 'WEAPON');
            if (owned) {
                if (owned.level < 5) {
                    pool.push(Object.assign({}, w, { tag, nextLvLabel: bi(`Seviye ${owned.level} -> ${owned.level + 1}`, `Level ${owned.level} -> ${owned.level + 1}`) }));
                }
            } else if (wCount < maxWSlots) {
                pool.push(Object.assign({}, w, { tag, nextLvLabel: bi('YENİ SİLAH SLOTU', 'NEW WEAPON SLOT') }));
            }
        }

        const tCount = Object.keys(p.trinkets).length;
        for (const t of Object.values(TRINKETS)) {
            if (t.shipExclusive && t.shipExclusive !== p.shipId) continue;
            const owned = p.trinkets[t.id];
            const tag = t.shipExclusive ? bi('İMZA MODÜL', 'SIGNATURE') : bi('DESTEK', 'SUPPORT');
            if (owned) {
                if (owned.level < 5) {
                    pool.push(Object.assign({}, t, { tag, nextLvLabel: bi(`Seviye ${owned.level} -> ${owned.level + 1}`, `Level ${owned.level} -> ${owned.level + 1}`) }));
                }
            } else if (tCount < MAX_TRINKET_SLOTS) {
                pool.push(Object.assign({}, t, { tag, nextLvLabel: bi('YENİ DESTEK SLOTU', 'NEW SUPPORT SLOT') }));
            }
        }

        pool.sort((a, b) => {
            const rank = (x) => x.kind === 'superEvolution' ? 0 : (x.kind === 'evolution' ? 1 : (Math.random() < 0.5 ? 2 : 3));
            return rank(a) - rank(b);
        });

        if (pool.length === 0) {
            pool.push({
                id: '_overcharge', kind: 'bonus',
                name: 'Çekirdek Aşırı Yükü', nameEn: 'Core Overcharge', tag: 'BONUS',
                nextLvLabel: bi('ANLIK GÜÇ', 'INSTANT BOOST'),
                desc: '+35 HP/Kalkan yeniler ve tüm silah hasarını kalıcı +%6 artırır.',
                descEn: 'Restores +35 HP/Shield and permanently increases weapon damage by +6%.'
            });
            pool.push({
                id: '_bounty', kind: 'bonus',
                name: 'Kozmik Kredi Yağmuru', nameEn: 'Cosmic Credit Bounty', tag: 'BONUS',
                nextLvLabel: '+150 CRD',
                desc: 'Atölye için anında +150 kalıcı Kozmik Kredi kazandırır.',
                descEn: 'Grants +150 permanent Workshop Credits immediately.'
            });
        }
        return pool.slice(0, 3);
    }

    function renderLevelUpCards() {
        G.currentOffers = getUpgradePool();
        el.luCardsGrid.classList.remove('locked');
        el.luCardsGrid.innerHTML = '';
        G.currentOffers.forEach((item, idx) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'lu-card';
            if (item.kind === 'evolution') btn.classList.add('is-evo');
            if (item.kind === 'superEvolution') btn.classList.add('is-mega');
            btn.innerHTML = `<div class="lu-card-top"><span class="lu-tag">${item.tag || 'MODULE'}</span><span class="lu-keycap">[${idx + 1}]</span></div><div class="lu-name">${loc(item, 'name', item.id)}</div><div class="lu-desc">${loc(item, 'desc', '')}</div><div class="lu-foot">${item.nextLvLabel || ''}</div>`;
            btn.addEventListener('click', () => applyLevelUpChoice(idx));
            el.luCardsGrid.appendChild(btn);
        });
        el.luRerollCount.textContent = G.rerolls;
        el.luSkipCount.textContent = G.skips;
        el.btnLuReroll.disabled = G.rerolls <= 0;
        el.btnLuSkip.disabled = G.skips <= 0;
        if (global.gsap && typeof global.gsap.fromTo === 'function') {
            global.gsap.fromTo('.lu-card', { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.22, stagger: 0.05, clearProps: 'transform,opacity' });
        }
    }

    function triggerLevelUp() {
        G.isLevelingUp = true;
        G.levelUpActionTaken = false;
        G.paused = true;
        if (global.CosmicAudio) global.CosmicAudio.play('levelup');
        renderLevelUpCards();
        el.levelUpOv.classList.add('open');
    }

    function applyLevelUpChoice(idx) {
        if (!G.isLevelingUp || G.levelUpActionTaken) return;
        const choice = G.currentOffers[idx];
        if (!choice) return;

        // Atomic synchronous zero-race-condition lock
        G.levelUpActionTaken = true;
        G.isLevelingUp = false;
        el.luCardsGrid.classList.add('locked');

        const p = G.player;
        if (choice.kind === 'superEvolution') {
            const toConsume = choice.consumeEvos || choice.evoReqs || choice.req || [];
            toConsume.forEach(r => p.evolutions.delete(r));
            p.superEvolutions.add(choice.id);
            p.extraSlots++;
            triggerConfettiBurst(42);
            showToast(bi(`MEGA EVRİM AÇILDI: ${loc(choice, 'name')}`, `MEGA EVOLUTION UNLOCKED: ${loc(choice, 'name')}`));
        } else if (choice.kind === 'evolution') {
            if (choice.replaceWeapon) delete p.weapons[choice.replaceWeapon];
            p.evolutions.add(choice.id);
        } else if (choice.kind === 'weapon') {
            if (p.weapons[choice.id]) p.weapons[choice.id].level++;
            else p.weapons[choice.id] = { id: choice.id, level: 1, timer: 0.1 };
        } else if (choice.kind === 'trinket') {
            if (p.trinkets[choice.id]) p.trinkets[choice.id].level++;
            else p.trinkets[choice.id] = { id: choice.id, level: 1 };
            if (choice.id === 'bioreactor') { p.maxHp += 30; p.hp += 30; }
            if (choice.id === 'shieldMatrix' || choice.id === 'harmonicCapacitor') { p.maxSh += 35; p.sh += 35; }
            recomputePlayerStats();
        } else if (choice.id === '_overcharge') {
            p.hp = Math.min(p.maxHp, p.hp + 35);
            p.sh = Math.min(p.maxSh, p.sh + 35);
            p.baseDmgMult *= 1.06;
            recomputePlayerStats();
        } else if (choice.id === '_bounty') {
            G.creditsEarned += 150;
        }

        if (global.CosmicAudio) global.CosmicAudio.play('uiConfirm');
        el.levelUpOv.classList.remove('open');
        G.paused = false;
        G.lastFrameTs = performance.now();
    }

    function openCosmicChestModal() {
        G.isLooting = true;
        G.paused = true;
        if (global.CosmicAudio) global.CosmicAudio.play('chestOpen');
        const pool = getUpgradePool();
        const reward = pool[0] || {
            name: 'Kozmik Kredi +200', nameEn: 'Cosmic Credits +200',
            desc: 'Atölye fonuna +200 Kredi eklendi.', descEn: '+200 Workshop Credits added.',
            kind: 'bonus', id: '_bounty'
        };
        const rwName = loc(reward, 'name', 'Bonus');
        const rwDesc = loc(reward, 'desc', '');

        el.lootTrack.innerHTML = '';
        el.lootTrack.style.transform = 'translateX(0px)';
        el.lootTitle.textContent = bi('Kasa Şifresi Çözülüyor...', 'Decoding Supply Cache...');
        el.lootResultDesc.textContent = '';
        el.btnCollectLoot.style.display = 'none';

        const filler = isEn()
            ? ['Cosmic Credits +120', 'Core Repair', rwName, 'Shield Ion', 'Overdrive Cell']
            : ['Kozmik Kredi +120', 'Çekirdek Onarımı', rwName, 'Kalkan İyonu', 'Aşırı Yük Modülü'];

        for (let i = 0; i < 16; i++) {
            const card = document.createElement('div');
            card.className = 'roulette-slot';
            if (i === 12) card.style.borderColor = '#f59e0b';
            card.textContent = i === 12 ? rwName : filler[i % filler.length];
            el.lootTrack.appendChild(card);
        }
        el.lootBoxOv.classList.add('open');

        const targetX = -(12 * 140 - 300);
        if (global.gsap && typeof global.gsap.to === 'function') {
            global.gsap.to(el.lootTrack, {
                x: targetX, duration: 1.45, ease: 'power3.out',
                onComplete: () => {
                    el.lootTitle.textContent = rwName;
                    el.lootResultDesc.textContent = rwDesc;
                    el.btnCollectLoot.style.display = 'inline-flex';
                }
            });
        } else {
            el.lootTrack.style.transform = `translateX(${targetX}px)`;
            el.lootTitle.textContent = rwName;
            el.lootResultDesc.textContent = rwDesc;
            el.btnCollectLoot.style.display = 'inline-flex';
        }

        el.btnCollectLoot.onclick = () => {
            if (!G.isLooting) return;
            G.isLooting = false;
            G.currentOffers = [reward];
            G.isLevelingUp = true;
            G.levelUpActionTaken = false;
            applyLevelUpChoice(0);
            el.lootBoxOv.classList.remove('open');
            G.paused = false;
        };
    }

    function openBossRewardModal() {
        G.isBossReward = true;
        G.paused = true;
        if (el.bossRewEyebrow) el.bossRewEyebrow.textContent = bi('BOSS İMHA EDİLDİ', 'BOSS ELIMINATED');
        if (el.bossRewTitle) el.bossRewTitle.textContent = bi('Sektör Muhafızı Çöktü', 'Sector Guardian Shattered');
        if (el.bossRewSub) el.bossRewSub.textContent = bi('Gemi çekirdeğini kalıcı olarak güçlendirecek taktik ödülünü seç:', 'Select a permanent tactical core upgrade:');
        el.bossRewGrid.innerHTML = '';

        const opts = [
            {
                name: bi('Titanyum Çekirdek', 'Titanium Core'),
                tag: bi('BOSS ÖDÜLÜ', 'BOSS REWARD'),
                desc: bi('+45 Maks HP, +40 Maks Kalkan ve Tam Onarım.', '+45 Max HP, +40 Max Shield, and Full Repair.'),
                apply: () => { const p = G.player; p.maxHp += 45; p.maxSh += 40; p.hp = p.maxHp; p.sh = p.maxSh; }
            },
            {
                name: bi('Süper-Kapasitör Matrisi', 'Super-Capacitor Matrix'),
                tag: bi('BOSS ÖDÜLÜ', 'BOSS REWARD'),
                desc: bi('Kalıcı +%15 Tüm Silah Hasarı ve -%8 Dolum Süresi.', 'Permanent +15% Weapon Damage and -8% Cooldown.'),
                apply: () => { const p = G.player; p.baseDmgMult *= 1.15; p.bonusCdr += 0.08; recomputePlayerStats(); }
            }
        ];

        opts.forEach(o => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'lu-card is-evo';
            btn.innerHTML = `<div class="lu-card-top"><span class="lu-tag">${o.tag}</span></div><div class="lu-name">${o.name}</div><div class="lu-desc">${o.desc}</div>`;
            btn.onclick = () => {
                if (!G.isBossReward) return;
                G.isBossReward = false;
                o.apply();
                el.bossRewardOv.classList.remove('open');
                G.paused = false;
                G.lastFrameTs = performance.now();
            };
            el.bossRewGrid.appendChild(btn);
        });
        el.bossRewardOv.classList.add('open');
    }

    function openVictoryModal() {
        G.isVictoryChoice = true;
        G.paused = true;
        triggerConfettiBurst(85);
        if (global.CosmicAudio) global.CosmicAudio.play('levelup');

        if (el.vicEyebrow) el.vicEyebrow.textContent = bi(`SEFER ZAFERİ · DALGA ${G.wave}`, `CAMPAIGN VICTORY · WAVE ${G.wave}`);
        if (el.vicTitle) el.vicTitle.textContent = bi('Apex Dreadnought İmha Edildi!', 'Apex Dreadnought Destroyed!');
        if (el.vicSubtitle) el.vicSubtitle.textContent = bi('Görev başarıyla tamamlandı! Zafer raporuyla üsse dönebilir ya da Sonsuz Overdrive moduna geçebilirsiniz.', 'Mission complete! Extract with full victory honors or continue into Endless Overdrive.');
        if (el.vicScore) el.vicScore.textContent = G.score.toLocaleString(isEn() ? 'en-US' : 'tr-TR');
        if (el.vicKills) el.vicKills.textContent = G.kills.toLocaleString(isEn() ? 'en-US' : 'tr-TR');
        if (el.btnVictoryExtractLabel) el.btnVictoryExtractLabel.textContent = bi('Zaferle Tamamla & Raporu Gör', 'Extract Victory & Battle Report');
        if (el.btnVictoryEndlessLabel) el.btnVictoryEndlessLabel.textContent = bi("Sonsuz Overdrive'a Devam Et", 'Continue Endless Overdrive');
        if (el.victoryOv) el.victoryOv.classList.add('open');
    }

    function updatePauseStatsPanel() {
        const p = G.player;
        if (!p || !el.pauseStatsKv) return;
        const rows = [
            [bi('Gemi', 'Ship'), loc(SHIPS[p.shipId], 'name', p.shipId)],
            [bi('Mod', 'Mode'), loc((DATA.GAME_MODES && DATA.GAME_MODES[G.modeId]) || MODE_DEFAULTS[G.modeId], 'name', G.modeId)],
            [bi('Can (HP)', 'Hull (HP)'), `${Math.ceil(p.hp)} / ${p.maxHp}`],
            [bi('Kalkan', 'Shield'), `${Math.ceil(p.sh)} / ${p.maxSh}`],
            [bi('Hasar Gücü', 'Damage'), `${Math.round(p.dmgMult * 100)}%`],
            [bi('Kritik Şans', 'Crit Chance'), `${Math.round(p.critChance * 100)}%`],
            [bi('Kritik Çarpan', 'Crit Mult'), `${p.critDamage.toFixed(2)}x`],
            [bi('Zırh', 'Armor'), `${Math.round(p.armor * 100)}%`],
            [bi('Ateş Hızı (CDR)', 'CDR Haste'), `${Math.round((1 - p.cdrMult) * 100)}%`],
            [bi('Yeniden Doğuş', 'Revivals'), `${p.revivalsLeft}`]
        ];
        el.pauseStatsKv.innerHTML = rows.map(([k, v]) => `<div class="stat-kv"><span>${k}</span><span>${v}</span></div>`).join('');

        if (el.pauseMutatorsBox) {
            if (G.dailyProtocol && G.mutators.length > 0) {
                const badges = [`<span class="mutator-pill">SEED: ${G.dailyProtocol.seed}</span>`];
                G.mutators.forEach(m => {
                    badges.push(`<span class="mutator-pill" style="border-color:${m.color || '#34d399'}">${loc(m, 'name', m.id)} — ${loc(m, 'desc', '')}</span>`);
                });
                el.pauseMutatorsBox.innerHTML = badges.join('');
                el.pauseMutatorsBox.style.display = 'flex';
            } else {
                el.pauseMutatorsBox.style.display = 'none';
            }
        }
    }

    function togglePause(force) {
        if (G.gameOver || G.isLevelingUp || G.isLooting || G.isBossReward || G.isVictoryChoice) return;
        G.paused = typeof force === 'boolean' ? force : !G.paused;
        if (G.paused) {
            updatePauseStatsPanel();
            el.pauseOv.classList.add('open');
        } else {
            el.pauseOv.classList.remove('open');
            G.lastFrameTs = performance.now();
        }
    }

    function toggleMinimap(force) {
        G.minimapOpen = typeof force === 'boolean' ? force : !G.minimapOpen;
        G.settings.minimapOpen = G.minimapOpen;
        saveSettings();
        if (el.hudMinimapCard) el.hudMinimapCard.classList.toggle('collapsed', !G.minimapOpen);
        if (el.minimapChevronIcon) {
            el.minimapChevronIcon.setAttribute('data-lucide', G.minimapOpen ? 'chevron-down' : 'chevron-up');
            if (global.lucide && typeof global.lucide.createIcons === 'function') global.lucide.createIcons();
        }
    }

    function endRun(reason, isVictory = false) {
        if (G.gameOver) return;
        G.gameOver = true;
        G.running = false;
        G.paused = true;

        if (isVictory) triggerConfettiBurst(90);

        const p = G.player;
        const mins = String(Math.floor(G.time / 60)).padStart(2, '0');
        const secs = String(Math.floor(G.time % 60)).padStart(2, '0');
        const locale = isEn() ? 'en-US' : 'tr-TR';

        let persistenceCredits = 0;
        const runPayload = {
            shipId: G.shipId,
            mapId: G.mapId,
            gameMode: G.modeId,
            difficulty: G.diffId,
            skinId: G.skinId,
            score: G.score,
            wave: G.wave,
            kills: G.kills,
            evos: p.evolutions.size,
            megas: p.superEvolutions.size,
            bosses: G.bossesKilled,
            duration: Math.round(G.time),
            time: Math.round(G.time),
            victory: Boolean(isVictory),
            seed: G.dailyProtocol ? G.dailyProtocol.seed : null
        };

        if (global.CosmicPersistence) {
            if (typeof global.CosmicPersistence.recordRunResult === 'function') {
                const res = global.CosmicPersistence.recordRunResult(runPayload);
                if (res && Number.isFinite(res.earnedCredits)) persistenceCredits = res.earnedCredits;
            } else if (typeof global.CosmicPersistence.recordRun === 'function') {
                global.CosmicPersistence.recordRun(runPayload);
            }
            if (G.creditsEarned > 0 && typeof global.CosmicPersistence.addCredits === 'function') {
                global.CosmicPersistence.addCredits(G.creditsEarned);
            }
        }

        const totalCredits = Math.max(25, G.creditsEarned + persistenceCredits);

        if (global.CosmicLeaderboard && typeof global.CosmicLeaderboard.submitScore === 'function') {
            global.CosmicLeaderboard.submitScore({
                players: G.pilotName,
                score: G.score,
                wave: G.wave,
                time: Math.round(G.time),
                difficulty: G.diffId,
                shipId: G.shipId,
                mapId: G.mapId,
                gameMode: G.modeId,
                kills: G.kills,
                megaCount: p.superEvolutions.size,
                seed: G.dailyProtocol ? G.dailyProtocol.seed : null
            });
        }

        el.goEyebrow.textContent = String(reason || bi('OPERASYON RAPORU', 'AFTER-ACTION REPORT')).toUpperCase();
        el.goTitle.textContent = isVictory
            ? bi('Görev Başarıyla Tamamlandı!', 'Mission Accomplished!')
            : (G.wave >= 15 ? bi('Efsanevi Direniş Tamamlandı', 'Legendary Stand Complete') : bi('Sektör Görevi Sona Erdi', 'Sector Sortie Ended'));
        if (el.goSubtitle) {
            el.goSubtitle.textContent = bi('Tüm uçuş verileri hangar profiline ve yerel kayıtlara işlendi.', 'All flight telemetry saved to local hangar records.');
        }
        el.goScore.textContent = G.score.toLocaleString(locale);
        el.goWave.textContent = `${bi('Dalga', 'Wave')} ${G.wave}`;
        el.goTime.textContent = `${mins}:${secs}`;
        el.goKills.textContent = G.kills.toLocaleString(locale);
        el.goLevel.textContent = `${bi('SV', 'LV')} ${p.level}`;
        el.goCreditsEarned.textContent = `+${totalCredits}`;

        if (global.Chart && el.runDamageChart) {
            if (G.goChart) G.goChart.destroy();
            const entries = Object.entries(G.weaponDamageStats).sort((a, b) => b[1] - a[1]).slice(0, 6);
            const labels = entries.length ? entries.map(([k]) => (UPG[k] ? loc(UPG[k], 'name', k) : k)) : [bi('Başlangıç Silahı', 'Starter Weapon')];
            const data = entries.length ? entries.map(([, v]) => Math.round(v)) : [0];
            const colors = entries.length ? entries.map(([k]) => (UPG[k] ? UPG[k].color : '#38bdf8')) : ['#38bdf8'];
            G.goChart = new global.Chart(el.runDamageChart.getContext('2d'), {
                type: 'bar',
                data: { labels, datasets: [{ label: bi('Toplam Hasar', 'Total Damage'), data, backgroundColor: colors, borderRadius: 6 }] },
                options: {
                    indexAxis: 'y', responsive: true, maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        title: { display: true, text: bi('SİLAH BAZLI HASAR DAĞILIMI', 'WEAPON DAMAGE BREAKDOWN'), color: '#94a3b8', font: { family: 'JetBrains Mono', size: 11 } }
                    },
                    scales: {
                        x: { grid: { color: 'rgba(148,163,184,0.1)' }, ticks: { color: '#cbd5e1', font: { family: 'JetBrains Mono', size: 10 } } },
                        y: { grid: { display: false }, ticks: { color: '#f1f5f9', font: { family: 'Inter', size: 11 } } }
                    }
                }
            });
        }
        el.gameOverOv.classList.add('open');
    }

    function syncHud() {
        const p = G.player;
        if (!p) return;

        el.hudLevelPill.textContent = `${bi('SV', 'LV')} ${p.level}`;
        el.hudHpFill.style.width = `${Math.max(0, Math.min(100, (p.hp / p.maxHp) * 100))}%`;
        el.hudShFill.style.width = `${Math.max(0, Math.min(100, (p.sh / Math.max(1, p.maxSh)) * 100))}%`;
        el.hudHpText.textContent = `${Math.ceil(p.hp)} / ${p.maxHp} HP`;
        el.hudShText.textContent = `${Math.ceil(p.sh)} / ${p.maxSh} SH`;
        el.hudXpFill.style.width = `${Math.max(0, Math.min(100, (p.xp / p.nextXp) * 100))}%`;

        const abPct = p.abilityCd <= 0 ? 100 : Math.max(0, (1 - p.abilityCd / (p.abilityMaxCd * p.cdrMult)) * 100);
        el.hudAbFill.style.width = `${abPct}%`;
        el.hudAbFill.classList.toggle('ready', p.abilityCd <= 0);

        // Overdrive [E] Bar
        if (el.hudOverdriveBar && el.hudOverdriveBtn && el.hudOverdriveLabel && el.hudOverdrivePct) {
            const isOdActive = p.overdriveActive > 0;
            const isOdReady = !isOdActive && p.overdrive >= 100;
            const pct = isOdActive ? (p.overdriveActive / 6.0) * 100 : p.overdrive;
            el.hudOverdriveBar.style.width = `${Math.max(0, Math.min(100, pct))}%`;
            el.hudOverdriveBar.classList.toggle('ready', isOdReady);
            el.hudOverdriveBar.classList.toggle('active', isOdActive);
            el.hudOverdriveBtn.classList.toggle('ready', isOdReady);
            el.hudOverdriveBtn.classList.toggle('active', isOdActive);
            el.hudOverdriveLabel.textContent = isOdActive
                ? bi(`OVERDRIVE AKTİF`, `OVERDRIVE ACTIVE`)
                : (isOdReady ? bi('OVERDRIVE HAZIR [E]', 'OVERDRIVE READY [E]') : 'OVERDRIVE [E]');
            el.hudOverdrivePct.textContent = isOdActive
                ? `${p.overdriveActive.toFixed(1)}s`
                : `${Math.floor(p.overdrive)}%`;
            if (el.touchOverdriveBtn) el.touchOverdriveBtn.classList.toggle('ready', isOdReady || isOdActive);
        }

        // Mode & Revival compact badges
        if (el.hudModeBadges) {
            const modeObj = (DATA.GAME_MODES && DATA.GAME_MODES[G.modeId]) || MODE_DEFAULTS[G.modeId];
            let badgesHtml = `<span class="mode-mini-pill ${G.modeId === 'daily' ? 'daily' : ''}">${loc(modeObj, 'name', G.modeId)}</span>`;
            if (p.revivalsLeft > 0) {
                badgesHtml += `<span class="mode-mini-pill revival">${bi('DOĞUŞ', 'REV')} x${p.revivalsLeft}</span>`;
            }
            if (G.dailyProtocol) {
                badgesHtml += `<span class="mode-mini-pill daily">${G.dailyProtocol.seed}</span>`;
            }
            if (el.hudModeBadges.dataset.sig !== badgesHtml) {
                el.hudModeBadges.dataset.sig = badgesHtml;
                el.hudModeBadges.innerHTML = badgesHtml;
            }
        }

        el.hudWaveVal.textContent = G.wave;
        if (G.modeId === 'timeattack') {
            const rem = Math.max(0, G.timeRemaining);
            el.hudTimeVal.textContent = `${String(Math.floor(rem / 60)).padStart(2, '0')}:${String(Math.floor(rem % 60)).padStart(2, '0')}`;
            el.hudTimeVal.classList.toggle('time-warn', rem <= 60 && rem > 20);
            el.hudTimeVal.classList.toggle('time-crit', rem <= 20);
            if (el.hudTimeLabel) el.hudTimeLabel.textContent = bi('Tahliye', 'Extraction');
        } else {
            el.hudTimeVal.textContent = `${String(Math.floor(G.time / 60)).padStart(2, '0')}:${String(Math.floor(G.time % 60)).padStart(2, '0')}`;
            el.hudTimeVal.classList.remove('time-warn', 'time-crit');
        }

        el.hudKillsVal.textContent = G.kills;
        el.hudScoreVal.textContent = G.score;

        const maxW = MAX_WEAPON_SLOTS + p.extraSlots;
        const wItems = [];
        p.superEvolutions.forEach(id => wItems.push({ name: loc(UPG[id], 'name', id), cls: 'mega', tag: 'MEGA' }));
        p.evolutions.forEach(id => wItems.push({ name: loc(UPG[id], 'name', id), cls: 'evo', tag: 'EVO' }));
        Object.values(p.weapons).forEach(w => wItems.push({ name: loc(UPG[w.id], 'name', w.id), cls: '', tag: `Lv${w.level}` }));
        let wHtml = '';
        for (let i = 0; i < maxW; i++) {
            wHtml += wItems[i]
                ? `<span class="slot-chip ${wItems[i].cls}">${wItems[i].name.slice(0, 12)} <b>${wItems[i].tag}</b></span>`
                : `<span class="slot-chip empty">${bi('Silah', 'Slot')} ${i + 1}</span>`;
        }
        if (el.hudWeaponsRow.dataset.sig !== wHtml) {
            el.hudWeaponsRow.dataset.sig = wHtml;
            el.hudWeaponsRow.innerHTML = wHtml;
        }

        let tHtml = '';
        const tList = Object.values(p.trinkets);
        for (let i = 0; i < MAX_TRINKET_SLOTS; i++) {
            tHtml += tList[i]
                ? `<span class="slot-chip">${loc(UPG[tList[i].id], 'name', tList[i].id).slice(0, 11)} Lv${tList[i].level}</span>`
                : `<span class="slot-chip empty">${bi('Alet', 'Tech')} ${i + 1}</span>`;
        }
        if (el.hudTrinketsRow.dataset.sig !== tHtml) {
            el.hudTrinketsRow.dataset.sig = tHtml;
            el.hudTrinketsRow.innerHTML = tHtml;
        }

        const boss = G.bosses[0];
        if (boss) {
            el.bossBarCard.classList.add('visible');
            el.bossBarThumb.src = `assets/bosses/${boss.spriteKey}.png`;
            const activePylons = getActivePylonCount(boss);
            el.bossBarName.textContent = activePylons > 0
                ? `${boss.name} · [${activePylons} ${bi('DİREK', 'PYLONS')}]`
                : boss.name;
            el.bossPhaseTag.textContent = `${bi('FAZ', 'PHASE')} ${boss.phase}`;
            el.bossHpFill.style.width = `${Math.max(0, Math.min(100, (boss.hp / boss.maxHp) * 100))}%`;
            el.bossBarHint.textContent = isEn() ? (boss.hintEn || boss.hint) : (boss.hintTr || boss.hint);
        } else {
            el.bossBarCard.classList.remove('visible');
        }

        const mapState = global.CosmicMapDirector.getRenderState();
        const obj = mapState.objectives && mapState.objectives[0];
        if (obj) {
            const dx = obj.x - p.x;
            const dy = obj.y - p.y;
            const d = Math.round(Math.hypot(dx, dy));
            const dir = Math.abs(dx) > Math.abs(dy)
                ? (dx > 0 ? bi('Doğu', 'East') : bi('Batı', 'West'))
                : (dy > 0 ? bi('Güney', 'South') : bi('Kuzey', 'North'));
            const lbl = obj.kind === 'pylon' ? bi('Overdrive Rölesi', 'Overdrive Relay') : bi('Kargo Kapsülü', 'Cargo Pod');
            el.sectorPingText.textContent = `${lbl} ${dir} · ${d}m`;
            el.sectorPingPill.classList.add('visible');
        } else {
            el.sectorPingPill.classList.remove('visible');
        }
    }

    function syncStaticLanguage() {
        if (global.CosmicI18n && typeof global.CosmicI18n.applyTranslations === 'function') {
            global.CosmicI18n.applyTranslations();
        }
        if (el.hudShipName && SHIPS[G.shipId]) {
            el.hudShipName.textContent = `${loc(SHIPS[G.shipId], 'name')} (${SHIPS[G.shipId].nameEn || G.shipId})`;
        }
        if (el.hudMapVal && MAPS[G.mapId]) {
            el.hudMapVal.textContent = loc(MAPS[G.mapId], 'name');
        }
        if (el.aimModeLabel) {
            el.aimModeLabel.textContent = G.aimMode === 'mouse'
                ? bi('[Q] Fare Nişanı', '[Q] Mouse Aim')
                : bi('[Q] Otomatik Nişan', '[Q] Auto Aim');
        }
        if (el.pauseHeading) el.pauseHeading.textContent = bi('Gemi Ayarları & Canlı Telemetri', 'Ship Settings & Live Telemetry');
        if (el.pauseSettingsTitle) el.pauseSettingsTitle.textContent = bi('Görüntü, Nişan & Ses Ayarları', 'Display, Aim & Audio Settings');
        if (el.pauseStatsTitle) el.pauseStatsTitle.textContent = bi('Güncel Gemi İstatistikleri', 'Live Ship Telemetry');
        if (el.lblSfxVol) el.lblSfxVol.textContent = bi('SFX Efekti Sesi', 'SFX Volume');
        if (el.lblAmbVol) el.lblAmbVol.textContent = bi('Uzay Ambiyans Dronu', 'Ambient Drone');
        if (el.lblVfxMode) el.lblVfxMode.textContent = bi('Göz Yormayan VFX Modu', 'VFX Intensity');
        if (el.lblAimMode) el.lblAimMode.textContent = bi('Ateş Nişan Modu', 'Aim Mode');
        if (el.lblDmgNumbers) el.lblDmgNumbers.textContent = bi('Hasar Sayıları', 'Damage Numbers');
        if (el.btnPlayAgainLbl) el.btnPlayAgainLbl.textContent = bi('Tekrar Oyna', 'Play Again');
        if (G.paused) updatePauseStatsPanel();
    }

    function tick(now) {
        if (!G.running) return;
        const dt = Math.min(0.05, Math.max(0.001, (now - (G.lastFrameTs || now)) / 1000));
        G.lastFrameTs = now;

        if (!G.paused && !G.gameOver) {
            G.time += dt;

            if (G.modeId === 'timeattack') {
                G.timeRemaining = Math.max(0, G.timeRemaining - dt);
                if (G.timeRemaining <= 0) {
                    endRun(bi('ZAMAN DOLDU — TAHLİYE TAMAMLANDI', 'TIME EXPIRED — EXTRACTION COMPLETE'), true);
                    return;
                }
            }

            const p = G.player;
            if (p.overdriveActive > 0) {
                p.overdriveActive = Math.max(0, p.overdriveActive - dt);
                if (Math.random() < 0.4) {
                    spawnParticle(p.x + (Math.random() - 0.5) * 20, p.y + (Math.random() - 0.5) * 20, '#a78bfa', 3.5, 0.25);
                }
                if (p.overdriveActive <= 0) recomputePlayerStats();
            }

            let mx = 0;
            let my = 0;
            if (G.keys['KeyW'] || G.keys['ArrowUp']) my -= 1;
            if (G.keys['KeyS'] || G.keys['ArrowDown']) my += 1;
            if (G.keys['KeyA'] || G.keys['ArrowLeft']) mx -= 1;
            if (G.keys['KeyD'] || G.keys['ArrowRight']) mx += 1;
            if (G.joy.active) { mx = G.joy.dx; my = G.joy.dy; }
            const mLen = Math.hypot(mx, my);
            if (mLen > 1) { mx /= mLen; my /= mLen; }

            const mapMods = global.CosmicMapDirector.getPlayerModifiers(p);
            const odSpeedMult = p.overdriveActive > 0 ? 1.25 : 1.0;
            const effSpeed = p.baseSp * (mapMods.speedMult || 1.0) * odSpeedMult * (p.cloaked ? 1.25 : 1.0);
            p.vx = mx * effSpeed;
            p.vy = my * effSpeed;
            p.x = Math.max(36, Math.min(WORLD_W - 36, p.x + p.vx * dt));
            p.y = Math.max(36, Math.min(WORLD_H - 36, p.y + p.vy * dt));
            global.CosmicMapDirector.resolveCircleCollision(p, 16);

            // AFK Anti-Camp Hunter Protocol (stationary >= 7.0s within 52px triggers Hunter Squad)
            if (Math.hypot(p.x - G.lastMovedPos.x, p.y - G.lastMovedPos.y) > 52) {
                G.lastMovedPos.x = p.x;
                G.lastMovedPos.y = p.y;
                G.afkCheckTimer = 0;
            } else {
                G.afkCheckTimer += dt;
                if (G.afkCheckTimer >= 7.0) {
                    G.afkCheckTimer = 2.5;
                    triggerAfkHunterSquad();
                }
            }

            const decay = getCosmicDecayFactor();
            if (p.invuln > 0) p.invuln -= dt;
            if (p.abilityCd > 0) p.abilityCd = Math.max(0, p.abilityCd - dt);
            if (p.hpRegen > 0 && p.hp < p.maxHp) p.hp = Math.min(p.maxHp, p.hp + p.hpRegen * decay * dt);
            if (p.shDelay > 0) p.shDelay -= dt;
            else if (p.sh < p.maxSh) {
                const shRate = 6.5 * (1 + (p.trinkets.shieldMatrix ? p.trinkets.shieldMatrix.level * 0.22 : 0)) * decay;
                p.sh = Math.min(p.maxSh, p.sh + shRate * dt);
            }

            if (p.shipId === 'phantom') {
                p.cloakCycle = (p.cloakCycle || 0) + dt;
                if (p.cloakCycle >= 10) { p.cloaked = true; p.cloakCycle = 0; }
                else if (p.cloaked && p.cloakCycle >= 1.6) p.cloaked = false;
            }
            if (p.shipId === 'aegis') {
                p.aegisPulseTimer -= dt;
                if (p.aegisPulseTimer <= 0) {
                    p.aegisPulseTimer = 6.0;
                    spawnParticle(p.x, p.y, '#34d399', 145, 0.36, 0, 0, true);
                    G.enemies.forEach(en => {
                        if (Math.hypot(en.x - p.x, en.y - p.y) < 165) hurtEnemy(en, 35 * p.dmgMult, 'energyDisc');
                    });
                }
            }

            updatePlayerAim();
            updateWeapons(dt);

            global.CosmicMapDirector.update(dt, {
                player: p,
                enemies: G.enemies,
                onDamagePlayer: (dmg, lbl, ig) => hurtPlayer(dmg, lbl, ig),
                onDamageEnemy: (en, dmg, crit) => hurtEnemy(en, dmg, 'sectorHazard', crit),
                onMeteorImpact: (m) => {
                    triggerShake(5, 0.18);
                    spawnParticle(m.x, m.y, '#f97316', m.r, 0.4, 0, 0, true);
                },
                onPylonCaptured: () => {
                    G.creditsEarned += 250;
                    G.score += 500;
                    addOverdriveCharge(18);
                    if (global.CosmicAudio) global.CosmicAudio.play('powerup');
                    showBanner(bi('OVERDRİVE RÖLESİ ELE GEÇİRİLDİ (+%30 ATEŞ HIZI · +250 CRD)', 'OVERDRIVE RELAY CAPTURED (+30% FIRE RATE · +250 CRD)'));
                },
                onVaultCaptured: () => {
                    G.creditsEarned += 300;
                    G.score += Math.round(750 * G.diff.score * G.modeScoreMult);
                    addOverdriveCharge(40);
                    if (global.CosmicAudio) global.CosmicAudio.play('chestOpen');
                    showBanner(bi('KASA SIĞINAĞI AÇILDI! (+300 CRD · +40% OVERDRIVE · GANİMET)', 'VAULT BUNKER UNSEALED! (+300 CRD · +40% OVERDRIVE · CACHE)'));
                    if (!G.isLevelingUp && !G.isLooting && !G.isBossReward && !G.isVictoryChoice) {
                        openCosmicChestModal();
                    } else {
                        G.chests.push({ x: p.x + 28, y: p.y });
                    }
                },
                onCargoOpened: (pod) => {
                    if (global.CosmicAudio) global.CosmicAudio.play('chestOpen');
                    for (let k = 0; k < 6; k++) {
                        G.crystals.push({ x: pod.x + (Math.random() - 0.5) * 40, y: pod.y + (Math.random() - 0.5) * 40, val: 14, big: true });
                    }
                    G.pickups.push({ x: pod.x, y: pod.y, kind: Math.random() < 0.5 ? 'heal' : 'shield' });
                    showBanner(bi('KARGO KAPSÜLÜ AÇILDI (+XP & ONARIM)', 'CARGO POD OPENED (+XP & REPAIR)'));
                }
            });

            updateEnemiesAndBosses(dt);
            updateBullets(dt);
            updateWorldEntities(dt);

            if (G.eventBannerTimer > 0) {
                G.eventBannerTimer -= dt;
                if (G.eventBannerTimer <= 0 && el.sectorEventBanner) el.sectorEventBanner.classList.remove('show');
            }
            G.camX += (p.x - G.camX) * Math.min(1, dt * 10);
            G.camY += (p.y - G.camY) * Math.min(1, dt * 10);
        }

        let sx = 0;
        let sy = 0;
        if (G.shakeTime > 0) {
            G.shakeTime -= dt;
            sx = (Math.random() - 0.5) * G.shakeMag * 2;
            sy = (Math.random() - 0.5) * G.shakeMag * 2;
        }

        const renderState = {
            time: G.time,
            worldW: WORLD_W,
            worldH: WORLD_H,
            camX: G.camX,
            camY: G.camY,
            shakeX: sx,
            shakeY: sy,
            shockwaveTrigger: G.shockwaveTrigger,
            player: G.player,
            enemies: G.enemies,
            bosses: G.bosses,
            bullets: G.bullets,
            crystals: G.crystals,
            pickups: G.pickups,
            chests: G.chests,
            particles: G.particles,
            floorZones: G.floorZones,
            orbitals: G.orbitals,
            arcs: G.arcs,
            floatTexts: G.floatTexts,
            mapState: global.CosmicMapDirector.getRenderState()
        };

        global.CosmicRenderer.render(renderState);
        if (G.minimapOpen && el.hudMinimapCanvas && typeof global.CosmicRenderer.renderMinimap === 'function') {
            global.CosmicRenderer.renderMinimap(el.hudMinimapCanvas, renderState);
        }

        syncHud();
        global.requestAnimationFrame(tick);
    }

    function toggleAimMode() {
        G.aimMode = G.aimMode === 'mouse' ? 'auto' : 'mouse';
        G.settings.aimMode = G.aimMode;
        saveSettings();
        recomputePlayerStats();
        if (el.aimModeLabel) {
            el.aimModeLabel.textContent = G.aimMode === 'mouse'
                ? bi('[Q] Fare Nişanı', '[Q] Mouse Aim')
                : bi('[Q] Otomatik Nişan', '[Q] Auto Aim');
        }
        if (el.setAimMode) el.setAimMode.value = G.aimMode;
        if (el.btnAimToggle) el.btnAimToggle.classList.toggle('active', G.aimMode === 'mouse');
    }

    function wireControls() {
        global.addEventListener('keydown', (e) => {
            G.keys[e.code] = true;
            if (global.CosmicAudio) global.CosmicAudio.unlock();
            if (G.isLevelingUp && !G.levelUpActionTaken) {
                if (e.code === 'Digit1' || e.code === 'Numpad1') { e.preventDefault(); applyLevelUpChoice(0); }
                else if (e.code === 'Digit2' || e.code === 'Numpad2') { e.preventDefault(); applyLevelUpChoice(1); }
                else if (e.code === 'Digit3' || e.code === 'Numpad3') { e.preventDefault(); applyLevelUpChoice(2); }
                else if (e.code === 'KeyR' && G.rerolls > 0) { G.rerolls--; renderLevelUpCards(); }
                else if (e.code === 'KeyF' && G.skips > 0) {
                    G.skips--;
                    G.creditsEarned += 60;
                    G.levelUpActionTaken = true;
                    G.isLevelingUp = false;
                    el.levelUpOv.classList.remove('open');
                    G.paused = false;
                    G.lastFrameTs = performance.now();
                }
                return;
            }
            if (e.code === 'Escape') togglePause();
            else if (e.code === 'Space') { e.preventDefault(); activateAbility(); }
            else if (e.code === 'KeyE') activateOverdrive();
            else if (e.code === 'KeyQ') toggleAimMode();
            else if (e.code === 'KeyM') toggleMinimap();
            else if (e.code === 'KeyN' && global.CosmicAudio) {
                global.CosmicAudio.setMuted(!global.CosmicAudio.prefs.muted);
                if (el.audioToggleIcon) {
                    el.audioToggleIcon.setAttribute('data-lucide', global.CosmicAudio.prefs.muted ? 'volume-x' : 'volume-2');
                    if (global.lucide && typeof global.lucide.createIcons === 'function') global.lucide.createIcons();
                }
            }
        });
        global.addEventListener('keyup', (e) => { G.keys[e.code] = false; });
        global.addEventListener('mousemove', (e) => { G.mouse.x = e.clientX; G.mouse.y = e.clientY; G.mouse.active = true; });
        global.addEventListener('pointerdown', () => {
            if (global.CosmicAudio) { global.CosmicAudio.unlock(); global.CosmicAudio.startAmbient(); }
        }, { once: true });
        global.addEventListener('resize', () => {
            if (global.CosmicRenderer) global.CosmicRenderer.resize(global.innerWidth, global.innerHeight);
        });
        global.addEventListener('cosmic:langchange', syncStaticLanguage);

        if (el.btnAimToggle) el.btnAimToggle.onclick = toggleAimMode;
        if (el.hudOverdriveBtn) el.hudOverdriveBtn.onclick = activateOverdrive;
        if (el.btnToggleMinimap) el.btnToggleMinimap.onclick = () => toggleMinimap();
        if (el.btnPauseGame) el.btnPauseGame.onclick = () => togglePause();
        if (el.btnResumeGame) el.btnResumeGame.onclick = () => togglePause(false);
        if (el.btnRestartRun) el.btnRestartRun.onclick = () => global.location.reload();
        if (el.btnPlayAgain) el.btnPlayAgain.onclick = () => global.location.reload();
        if (el.btnAudioToggle && global.CosmicAudio) {
            el.btnAudioToggle.onclick = () => {
                global.CosmicAudio.setMuted(!global.CosmicAudio.prefs.muted);
                if (el.audioToggleIcon) {
                    el.audioToggleIcon.setAttribute('data-lucide', global.CosmicAudio.prefs.muted ? 'volume-x' : 'volume-2');
                    if (global.lucide && typeof global.lucide.createIcons === 'function') global.lucide.createIcons();
                }
            };
        }

        if (el.btnVictoryExtract) {
            el.btnVictoryExtract.onclick = () => {
                if (!G.isVictoryChoice) return;
                G.isVictoryChoice = false;
                if (el.victoryOv) el.victoryOv.classList.remove('open');
                endRun(bi('DALGA 15 SEFER ZAFERİ', 'WAVE 15 CAMPAIGN VICTORY'), true);
            };
        }
        if (el.btnVictoryEndless) {
            el.btnVictoryEndless.onclick = () => {
                if (!G.isVictoryChoice) return;
                G.isVictoryChoice = false;
                if (el.victoryOv) el.victoryOv.classList.remove('open');
                G.modeId = 'endless';
                G.modeScoreMult = Math.max(G.modeScoreMult, 1.35);
                G.modeCreditMult = Math.max(G.modeCreditMult, 1.30);
                G.paused = false;
                G.lastFrameTs = performance.now();
                startWave(G.wave + 1);
            };
        }

        if (el.btnLuReroll) {
            el.btnLuReroll.onclick = () => {
                if (G.isLevelingUp && !G.levelUpActionTaken && G.rerolls > 0) { G.rerolls--; renderLevelUpCards(); }
            };
        }
        if (el.btnLuSkip) {
            el.btnLuSkip.onclick = () => {
                if (G.isLevelingUp && !G.levelUpActionTaken && G.skips > 0) {
                    G.skips--;
                    G.creditsEarned += 60;
                    G.levelUpActionTaken = true;
                    G.isLevelingUp = false;
                    el.levelUpOv.classList.remove('open');
                    G.paused = false;
                    G.lastFrameTs = performance.now();
                }
            };
        }

        if (el.setSfxVol && global.CosmicAudio) {
            el.setSfxVol.value = Math.round(global.CosmicAudio.prefs.sfxVol * 100);
            el.setSfxVol.oninput = () => global.CosmicAudio.setSfxVolume(Number(el.setSfxVol.value) / 100);
        }
        if (el.setAmbVol && global.CosmicAudio) {
            el.setAmbVol.value = Math.round(global.CosmicAudio.prefs.ambVol * 100);
            el.setAmbVol.oninput = () => global.CosmicAudio.setAmbientVolume(Number(el.setAmbVol.value) / 100);
        }
        if (el.setVfxMode) {
            el.setVfxMode.value = G.settings.vfxMode;
            el.setVfxMode.onchange = () => {
                G.settings.vfxMode = el.setVfxMode.value;
                saveSettings();
                global.CosmicRenderer.setVfxSettings(G.settings.vfxMode, G.settings.showDmg);
            };
        }
        if (el.setAimMode) {
            el.setAimMode.value = G.aimMode;
            el.setAimMode.onchange = () => {
                G.aimMode = el.setAimMode.value;
                G.settings.aimMode = G.aimMode;
                saveSettings();
                recomputePlayerStats();
                if (el.aimModeLabel) {
                    el.aimModeLabel.textContent = G.aimMode === 'mouse'
                        ? bi('[Q] Fare Nişanı', '[Q] Mouse Aim')
                        : bi('[Q] Otomatik Nişan', '[Q] Auto Aim');
                }
                if (el.btnAimToggle) el.btnAimToggle.classList.toggle('active', G.aimMode === 'mouse');
            };
        }
        if (el.setDmgNumbers) {
            el.setDmgNumbers.value = G.settings.showDmg ? 'on' : 'off';
            el.setDmgNumbers.onchange = () => {
                G.settings.showDmg = el.setDmgNumbers.value === 'on';
                saveSettings();
                global.CosmicRenderer.setVfxSettings(G.settings.vfxMode, G.settings.showDmg);
            };
        }

        if (el.vjoyZone) {
            let originX = 0;
            let originY = 0;
            el.vjoyZone.addEventListener('pointerdown', (e) => {
                G.joy.active = true;
                const r = el.vjoyZone.getBoundingClientRect();
                originX = r.left + r.width * 0.5;
                originY = r.top + r.height * 0.5;
                el.vjoyZone.setPointerCapture(e.pointerId);
            });
            el.vjoyZone.addEventListener('pointermove', (e) => {
                if (!G.joy.active) return;
                const dx = e.clientX - originX;
                const dy = e.clientY - originY;
                const clamped = Math.min(Math.hypot(dx, dy), 46);
                const ang = Math.atan2(dy, dx);
                G.joy.dx = Math.cos(ang) * (clamped / 46);
                G.joy.dy = Math.sin(ang) * (clamped / 46);
                el.vjoyKnob.style.transform = `translate(calc(-50% + ${Math.cos(ang) * clamped}px), calc(-50% + ${Math.sin(ang) * clamped}px))`;
            });
            const endJoy = () => {
                G.joy.active = false;
                G.joy.dx = 0;
                G.joy.dy = 0;
                el.vjoyKnob.style.transform = 'translate(-50%, -50%)';
            };
            el.vjoyZone.addEventListener('pointerup', endJoy);
            el.vjoyZone.addEventListener('pointercancel', endJoy);
        }
        if (el.touchAbilityBtn) el.touchAbilityBtn.onclick = activateAbility;
        if (el.touchOverdriveBtn) el.touchOverdriveBtn.onclick = activateOverdrive;
    }

    async function boot() {
        bindDom();
        parseLaunchConfig();
        loadSettings();
        if (global.CosmicI18n && typeof global.CosmicI18n.bindLanguageToggles === 'function') {
            global.CosmicI18n.bindLanguageToggles();
        }
        if (global.lucide && typeof global.lucide.createIcons === 'function') global.lucide.createIcons();

        G.player = createPlayer();
        G.lastMovedPos = { x: G.player.x, y: G.player.y };
        recomputePlayerStats();
        G.camX = G.player.x;
        G.camY = G.player.y;

        el.hudShipThumb.src = `assets/ships/${G.shipId}.png`;
        if (G.skinId !== 'standard' && DATA.SHIP_SKINS && DATA.SHIP_SKINS[G.skinId]) {
            el.hudShipThumb.style.borderColor = DATA.SHIP_SKINS[G.skinId].accent || '#38bdf8';
        }
        if (el.btnAimToggle) el.btnAimToggle.classList.toggle('active', G.aimMode === 'mouse');
        if (el.hudMinimapCard) el.hudMinimapCard.classList.toggle('collapsed', !G.minimapOpen);
        if (el.audioToggleIcon && global.CosmicAudio) {
            el.audioToggleIcon.setAttribute('data-lucide', global.CosmicAudio.prefs.muted ? 'volume-x' : 'volume-2');
        }
        syncStaticLanguage();

        global.CosmicMapDirector.init(G.mapId, WORLD_W, WORLD_H, G.rng);
        await global.CosmicRenderer.init(el.gameCanvas);
        global.CosmicRenderer.setMap(G.mapId);
        wireControls();

        if (G.dailyProtocol) {
            showBanner(`${bi('GÜNLÜK PROTOKOL', 'DAILY PROTOCOL')}: ${G.dailyProtocol.seed} · ${G.mutators.map(m => loc(m, 'name')).join(' + ')}`);
        } else if (G.modeId === 'bossrush') {
            showBanner(bi('BOSS AKINI — İLK DREADNOUGHT 15 SN SONRA İNİYOR!', 'BOSS RUSH — FIRST DREADNOUGHT IN 15 SECONDS!'));
        } else if (G.modeId === 'timeattack') {
            showBanner(bi('ZAMANA KARŞI: 5:00 TAHLİYE SÜRESİ BAŞLADI (2.4x XP)', 'TIME ATTACK: 5:00 EXTRACTION COUNTDOWN ACTIVE (2.4x XP)'));
        }

        startWave(1);
        G.running = true;
        G.lastFrameTs = performance.now();
        global.requestAnimationFrame(tick);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})(window);
