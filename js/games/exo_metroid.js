// =============================================================================
// COSMIC UNIVERSE v12.0 — EXO-METROID SECTOR BREACH (js/games/exo_metroid.js)
// Flagship Phaser 3.88.2 Metroidvania Engine
// Registers global.COSMIC_GAME_ENGINES['exo-metroid-breach']
// Consumes window.COSMIC_EXO_DATA from js/games/exo_metroid_data.js
// =============================================================================
(function (global) {
    'use strict';

    const Engines = global.COSMIC_GAME_ENGINES = global.COSMIC_GAME_ENGINES || {};
    const TAU = Math.PI * 2;

    // -------------------------------------------------------------------------
    // Shared Runtime Helpers (Matched to pack_phaser.js conventions)
    // -------------------------------------------------------------------------
    function clamp(v, lo, hi) {
        return v < lo ? lo : (v > hi ? hi : v);
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function wrapAngle(a) {
        let r = a % TAU;
        if (r > Math.PI) r -= TAU;
        if (r < -Math.PI) r += TAU;
        return r;
    }

    function toColorInt(val, fallback) {
        if (typeof val === 'number' && Number.isFinite(val)) return val;
        if (typeof val === 'string') {
            const clean = val.trim().replace(/^#/, '').replace(/^0x/i, '');
            const parsed = parseInt(clean, 16);
            if (Number.isFinite(parsed)) return parsed;
        }
        return fallback;
    }

    function toCssColor(val, fallback) {
        if (typeof val === 'string' && val.trim().startsWith('#')) return val.trim();
        if (typeof val === 'number' && Number.isFinite(val)) {
            return '#' + val.toString(16).padStart(6, '0');
        }
        return fallback;
    }

    function pickText(tr, val, fallback) {
        if (!val) return fallback || '';
        if (typeof val === 'string') return val;
        return tr(val.tr || val.en || fallback || '', val.en || val.tr || fallback || '');
    }

    function assetUrl(rel) {
        const base = (typeof global.COSMIC_BASE === 'string') ? global.COSMIC_BASE : '';
        return base + rel;
    }

    function createTranslator(ctx) {
        if (ctx && typeof ctx.t === 'function') {
            return (trStr, enStr) => ctx.t(trStr, enStr);
        }
        const isEn = ctx && ctx.lang === 'en';
        return (trStr, enStr) => (isEn ? enStr : trStr);
    }

    function resolveIsStory(ctx) {
        if (!ctx) return false;
        if (ctx.isStory !== undefined) return Boolean(ctx.isStory);
        return Boolean(ctx.chapterId || ctx.chapterTarget);
    }

    function safePlay(ctx, key, jitter) {
        try {
            if (ctx && ctx.audio && typeof ctx.audio.play === 'function') {
                ctx.audio.play(key, jitter);
            }
        } catch (_) { /* ignore audio errors */ }
    }

    function safeUnlockAudio(ctx) {
        try {
            if (ctx && ctx.audio && typeof ctx.audio.unlock === 'function') {
                ctx.audio.unlock();
            }
        } catch (_) { /* ignore audio unlock errors */ }
    }

    function safeSetHud(ctx, payload) {
        try {
            if (ctx && typeof ctx.setHud === 'function') {
                ctx.setHud(payload);
            }
        } catch (_) { /* ignore HUD sync errors */ }
    }

    function createScopedInput(stageEl) {
        const down = new Set();
        const just = new Set();
        const preventCodes = new Set([
            'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'
        ]);
        let active = true;

        function isTypingTarget() {
            const tag = document.activeElement && document.activeElement.tagName;
            return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
        }

        function onKeyDown(e) {
            if (!active || isTypingTarget()) return;
            const code = e.code || '';
            const key = (e.key || '').toLowerCase();
            // Never hijack global arcadePlayer shortcuts [P], [F], [R]
            if (key === 'p' || key === 'f' || key === 'r') return;
            if (preventCodes.has(code)) {
                e.preventDefault();
            }
            if (!down.has(code)) {
                just.add(code);
            }
            down.add(code);
            if (key) {
                if (!down.has(key)) just.add(key);
                down.add(key);
            }
        }

        function onKeyUp(e) {
            const code = e.code || '';
            const key = (e.key || '').toLowerCase();
            down.delete(code);
            if (key) down.delete(key);
        }

        function onBlur() {
            down.clear();
            just.clear();
        }

        function onContextMenu(e) {
            e.preventDefault();
        }

        global.addEventListener('keydown', onKeyDown);
        global.addEventListener('keyup', onKeyUp);
        global.addEventListener('blur', onBlur);
        if (stageEl) {
            stageEl.addEventListener('contextmenu', onContextMenu);
        }

        return {
            isDown(...keys) {
                for (let i = 0; i < keys.length; i++) {
                    if (down.has(keys[i])) return true;
                }
                return false;
            },
            consume(...keys) {
                let hit = false;
                for (let i = 0; i < keys.length; i++) {
                    if (just.has(keys[i])) hit = true;
                    just.delete(keys[i]);
                }
                return hit;
            },
            clearFrame() {
                just.clear();
            },
            clearAll() {
                down.clear();
                just.clear();
            },
            setEnabled(flag) {
                active = !!flag;
                if (!active) {
                    down.clear();
                    just.clear();
                }
            },
            destroy() {
                active = false;
                global.removeEventListener('keydown', onKeyDown);
                global.removeEventListener('keyup', onKeyUp);
                global.removeEventListener('blur', onBlur);
                if (stageEl) {
                    stageEl.removeEventListener('contextmenu', onContextMenu);
                }
                down.clear();
                just.clear();
            }
        };
    }

    function syncPhaserPause(scene, ctx, input) {
        const paused = Boolean(ctx && typeof ctx.getPaused === 'function' && ctx.getPaused());
        if (paused) {
            if (!scene._cosmicPaused) {
                scene._cosmicPaused = true;
                if (scene.physics && scene.physics.world) scene.physics.world.pause();
                if (scene.tweens) scene.tweens.pauseAll();
                if (scene.time) scene.time.paused = true;
                if (scene.anims) scene.anims.pauseAll();
                if (input) input.clearAll();
            }
            return true;
        }
        if (scene._cosmicPaused) {
            scene._cosmicPaused = false;
            if (scene.physics && scene.physics.world) scene.physics.world.resume();
            if (scene.tweens) scene.tweens.resumeAll();
            if (scene.time) scene.time.paused = false;
            if (scene.anims) scene.anims.resumeAll();
        }
        return false;
    }

    function makeTextureSafe(scene, key, w, h, drawFn) {
        if (scene.textures.exists(key)) return;
        const g = scene.make.graphics({ x: 0, y: 0, add: false });
        drawFn(g, w, h);
        g.generateTexture(key, w, h);
        g.destroy();
    }

    function queueImageSafe(scene, key, relPath) {
        if (!scene.textures.exists(key)) {
            scene.load.image(key, assetUrl(relPath));
        }
    }

    function setWorldBody(sprite, worldW, worldH) {
        if (!sprite || !sprite.body) return;
        const sx = Math.abs(sprite.scaleX) || 1;
        const sy = Math.abs(sprite.scaleY) || 1;
        sprite.body.setSize(worldW / sx, worldH / sy, true);
    }

    function mountPhaserHost(ctx, buildConfig, runtime) {
        const Phaser = global.Phaser;
        if (!Phaser || typeof Phaser.Game !== 'function') {
            if (ctx && ctx.stageEl) {
                ctx.stageEl.innerHTML = '<div style="padding:2rem;text-align:center;color:#fb7185;font-family:monospace;">Phaser 3 (vendor/phaser.min.js) not loaded.</div>';
            }
            return { destroy() { }, restart() { } };
        }

        if (ctx && ctx.stageEl) {
            ctx.stageEl.innerHTML = '';
        }

        const input = createScopedInput(ctx ? ctx.stageEl : null);
        runtime.input = input;
        runtime.destroyed = false;
        runtime.pendingLevel = Math.max(1, Number(ctx && ctx.initialLevel) || 1);
        runtime.sceneReady = false;
        runtime.activeScene = null;

        const config = buildConfig(Phaser, input);
        const game = new Phaser.Game(config);
        runtime.game = game;

        const focusCanvas = () => {
            safeUnlockAudio(ctx);
            const cnv = ctx && ctx.stageEl ? ctx.stageEl.querySelector('canvas') : null;
            if (cnv) {
                if (cnv.tabIndex < 0) cnv.tabIndex = 0;
                try { cnv.focus({ preventScroll: true }); } catch (_) { }
            }
        };

        if (ctx && ctx.stageEl) {
            ctx.stageEl.addEventListener('pointerdown', focusCanvas);
        }

        return {
            restart(lv) {
                if (runtime.destroyed) return;
                const nextLv = Math.max(1, Math.floor(Number(lv) || 1));
                runtime.pendingLevel = nextLv;
                input.clearAll();
                if (runtime.sceneReady && runtime.activeScene && runtime.activeScene.scene) {
                    runtime.activeScene._cosmicPaused = false;
                    if (runtime.activeScene.physics && runtime.activeScene.physics.world) {
                        runtime.activeScene.physics.world.resume();
                    }
                    if (runtime.activeScene.tweens) runtime.activeScene.tweens.resumeAll();
                    if (runtime.activeScene.time) runtime.activeScene.time.paused = false;
                    runtime.activeScene.scene.restart({ level: nextLv });
                }
            },
            destroy() {
                if (runtime.destroyed) return;
                runtime.destroyed = true;
                runtime.sceneReady = false;
                runtime.activeScene = null;
                if (ctx && ctx.stageEl) {
                    ctx.stageEl.removeEventListener('pointerdown', focusCanvas);
                }
                input.destroy();
                try {
                    if (game && typeof game.destroy === 'function') {
                        game.destroy(true);
                    }
                } catch (_) { /* ignore Phaser teardown errors */ }
                if (ctx && ctx.stageEl) {
                    ctx.stageEl.innerHTML = '';
                }
            }
        };
    }

    // -------------------------------------------------------------------------
    // Fallback Contract Defaults (used only if COSMIC_EXO_DATA fields missing)
    // -------------------------------------------------------------------------
    const DEFAULT_BIOME = {
        id: 'hangar',
        bgTop: 0x040714,
        bgBottom: 0x09132b,
        accent: 0x38bdf8,
        wallFill: 0x0e192e,
        wallTrim: 0x1e3a5f,
        gridAlpha: 0.08,
        name: { tr: 'Hangar Koridoru', en: 'Hangar Corridor' }
    };

    const DEFAULT_UPGRADES = {
        charge_beam: {
            id: 'charge_beam',
            color: 0x22d3ee,
            title: { tr: 'Yüklü Plazma Dalgası', en: 'Hyper Charge Beam' },
            desc: { tr: 'Hızlı şarj ve devasa delici dalga', en: 'Faster charge & heavy piercing wave' }
        },
        triple_jump: {
            id: 'triple_jump',
            color: 0x34d399,
            title: { tr: 'Üçlü İtici Zıplama', en: 'Triple Jet-Jump' },
            desc: { tr: 'Havada ekstra 2. zıplama', en: 'Extra mid-air thruster jump' }
        },
        phase_shield: {
            id: 'phase_shield',
            color: 0x818cf8,
            title: { tr: 'Faz Kalkanı', en: 'Phase Energy Shield' },
            desc: { tr: 'Yenilenen 1 kalkan + atılma hasarı', en: 'Regenerating shield + dash shock' }
        },
        spread_missile: {
            id: 'spread_missile',
            color: 0xf59e0b,
            title: { tr: 'Üçlü Yaylım Füzesi', en: 'Spread Salvo Missiles' },
            desc: { tr: '3 güdümlü füze yaylımı +1 kapasite', en: '3-missile homing salvo +1 capacity' }
        },
        plasma_nova: {
            id: 'plasma_nova',
            color: 0xf43f5e,
            title: { tr: 'Plazma Nova Çekirdeği', en: 'Plasma Nova Core' },
            desc: { tr: 'Geniş kılıç arkı + Nova patlamalı atılma', en: 'Wide blade arc + Nova dash blast' }
        }
    };

    const DEFAULT_ENEMIES = {
        spider: { hp: 55, speed: 115, score: 90, fireCd: 2.1 },
        mech: { hp: 150, speed: 64, score: 180, fireCd: 1.75 },
        drone: { hp: 65, speed: 135, score: 110, fireCd: 1.85 },
        turret: { hp: 85, speed: 0, score: 130, fireCd: 2.2 },
        spitter: { hp: 90, speed: 82, score: 140, fireCd: 2.3 },
        commando: { hp: 135, speed: 155, score: 210, fireCd: 1.65 },
        boss: { hp: 920, speed: 88, score: 750, fireCd: 1.55 }
    };

    const DEFAULT_PROPS = {
        crate: { hp: 20, score: 35 },
        barrel: { hp: 15, blastRadius: 110, blastDamage: 95, score: 50 },
        laser: { warnSec: 1.0, activeSec: 1.2, offSec: 1.8, damage: 1 },
        reactor: { hp: 120, score: 350 },
        door: { hp: 1, score: 150 },
        upgrade: { score: 200 },
        hp: { heal: 1, score: 50 },
        missile: { ammo: 2, score: 75 }
    };

    const UPGRADE_ORDER = [
        { id: 'charge_beam', badge: 'CHG', color: 0x38bdf8 },
        { id: 'triple_jump', badge: '3J', color: 0x2dd4bf },
        { id: 'phase_shield', badge: 'SHD', color: 0x67e8f9 },
        { id: 'spread_missile', badge: 'SPR', color: 0xf97316 },
        { id: 'plasma_nova', badge: 'NOV', color: 0xc084fc }
    ];

    const FALLBACK_SECTOR = {
        id: 1,
        biome: 'hangar',
        upgradeId: 'charge_beam',
        name: { tr: 'SEKTÖR 1: HANGAR DUCTLARI', en: 'SECTOR 1: HANGAR DUCTS' },
        accent: 0x38bdf8,
        movingPlatforms: [],
        map: [
            '########################################',
            '#......................................#',
            '#..........U...........................#',
            '#........======......C.......H.........#',
            '#...................====....====.......#',
            '#....P.......S.........................#',
            '#..======...====.......V...............#',
            '#............................M....D....#',
            '#....................E......====..D.R.X#',
            '#========...===...======..##############',
            '########################################'
        ]
    };

    // =========================================================================
    // EXO-METROID SECTOR BREACH ENGINE
    // =========================================================================
    Engines['exo-metroid-breach'] = function mountExoMetroidBreach(ctx) {
        const tr = createTranslator(ctx);
        const isStory = resolveIsStory(ctx);
        const storyTarget = Number(ctx && ctx.chapterTarget) || 1000;
        const ctxDiffMult = Math.max(0.5, Number(ctx && ctx.difficultyMult) || 1);
        const runtime = {};

        function getData() {
            const raw = global.COSMIC_EXO_DATA || {};
            const tile = Number(raw.TILE) || 40;
            const sectors = (Array.isArray(raw.SECTORS) && raw.SECTORS.length) ? raw.SECTORS : [FALLBACK_SECTOR];
            const endlessArenas = (Array.isArray(raw.ENDLESS_ARENAS) && raw.ENDLESS_ARENAS.length) ? raw.ENDLESS_ARENAS : sectors;
            const biomes = raw.BIOMES || {};
            const upgrades = raw.UPGRADES || DEFAULT_UPGRADES;
            const enemies = raw.ENEMIES || DEFAULT_ENEMIES;
            const props = raw.PROPS || DEFAULT_PROPS;
            return { tile, sectors, endlessArenas, biomes, upgrades, enemies, props };
        }

        const BASE_TILE = getData().tile;

        class ExoMetroidScene extends global.Phaser.Scene {
            constructor() {
                super({ key: 'ExoMetroidScene' });
            }

            init(data) {
                const exo = getData();
                this.TILE = exo.tile || 40;
                this.campaignCount = exo.sectors.length;

                const lv = (data && data.level !== undefined) ? data.level : runtime.pendingLevel;
                this.sectorNum = Math.max(1, Math.floor(Number(lv) || 1));
                this.endlessMode = !isStory && this.sectorNum > this.campaignCount;
                this.endlessArenaIdx = (data && data.endlessArenaIdx !== undefined)
                    ? Math.max(0, Math.floor(data.endlessArenaIdx))
                    : Math.max(0, this.sectorNum - (this.campaignCount + 1));
                this.endlessWave = (data && data.endlessWave) ? Math.max(1, Math.floor(data.endlessWave)) : 1;
                this.wavesPerArena = 2;

                this.score = (data && data.carryScore !== undefined) ? Math.max(0, Math.floor(data.carryScore)) : 0;
                this.maxLives = 6;
                this.lives = (data && data.carryLives !== undefined) ? clamp(Math.floor(data.carryLives), 1, this.maxLives) : 5;

                // Suit upgrades persist across sectors; direct level jumps unlock prior sector gear
                this.upgrades = Object.assign({}, (data && data.carryUpgrades) || {});
                if (!data || !data.carryUpgrades) {
                    const unlockCount = this.endlessMode
                        ? Math.min(2, exo.sectors.length)
                        : Math.max(0, Math.min(exo.sectors.length, this.sectorNum - 1));
                    for (let i = 0; i < unlockCount; i++) {
                        const uid = exo.sectors[i] && exo.sectors[i].upgradeId;
                        if (uid) this.upgrades[uid] = true;
                    }
                }

                this.maxMissiles = this.upgrades.spread_missile ? 6 : 5;
                this.missiles = (data && data.carryMissiles !== undefined)
                    ? clamp(Math.floor(data.carryMissiles), 0, this.maxMissiles)
                    : Math.min(4, this.maxMissiles);

                this.shieldPoints = this.upgrades.phase_shield ? 1 : 0;
                this.shieldRechargeTimer = 0;

                this.ended = false;
                this.bossSpawned = false;
                this.bossDefeated = false;
                this.bossPresentInSector = false;
                this.reactorTotal = 0;
                this.reactorsAlive = 0;
                this.portalUnlocked = false;
                this.endlessWaveTimer = 0;
                this.endlessWaveActive = false;

                const endlessFactor = 1 + (this.sectorNum - this.campaignCount) * 0.24 + (this.endlessWave - 1) * 0.12;
                const campaignFactor = 1 + (this.sectorNum - 1) * 0.14;
                this.difficultyMult = ctxDiffMult * (this.endlessMode ? endlessFactor : campaignFactor);
                this._cosmicPaused = false;
            }

            preload() {
                this.load.on('loaderror', () => { });
                // Core 12 sprites
                queueImageSafe(this, 'emb_trooper', 'assets/v11/sprites/exo_trooper.png');
                queueImageSafe(this, 'emb_spider', 'assets/v11/sprites/spider_bot.png');
                queueImageSafe(this, 'emb_mech', 'assets/v11/sprites/tactical_mech.png');
                queueImageSafe(this, 'emb_boss', 'assets/v11/sprites/colossus_boss.png');
                queueImageSafe(this, 'emb_reactor', 'assets/v11/sprites/reactor_node.png');
                queueImageSafe(this, 'emb_drone', 'assets/v11/sprites/alien_drone.png');
                queueImageSafe(this, 'emb_turret', 'assets/v11/sprites/laser_turret.png');
                queueImageSafe(this, 'emb_crate', 'assets/v11/sprites/cargo_crate.png');
                queueImageSafe(this, 'emb_barrel', 'assets/v11/sprites/plasma_bomb.png');
                queueImageSafe(this, 'emb_prism', 'assets/v11/sprites/energy_prism.png');
                queueImageSafe(this, 'emb_portal', 'assets/v11/sprites/portal_vortex.png');
                queueImageSafe(this, 'emb_battery', 'assets/v11/sprites/shield_battery.png');
                queueImageSafe(this, 'emb_missile_pod', 'assets/v11/sprites/missile_pod.png');
                // Extended 4 sprites (all paired with procedural fallback textures)
                queueImageSafe(this, 'emb_spitter', 'assets/v11/sprites/exo_spitter.png');
                queueImageSafe(this, 'emb_commando', 'assets/v11/sprites/exo_commando.png');
                queueImageSafe(this, 'emb_upgrade_pod', 'assets/v11/sprites/exo_upgrade_pod.png');
                queueImageSafe(this, 'emb_warp_gate', 'assets/v11/sprites/exo_warp_gate.png');
            }

            create() {
                runtime.activeScene = this;
                runtime.sceneReady = true;
                this.input.mouse.disableContextMenu();

                const exo = getData();
                const sectorDef = this.endlessMode
                    ? exo.endlessArenas[this.endlessArenaIdx % exo.endlessArenas.length]
                    : exo.sectors[clamp(this.sectorNum - 1, 0, exo.sectors.length - 1)];

                this.sectorDef = sectorDef;
                const rawBiome = (sectorDef.biome && exo.biomes[sectorDef.biome]) || DEFAULT_BIOME;
                this.biome = Object.assign({}, DEFAULT_BIOME, rawBiome);
                this.biomeKey = this.biome.id || sectorDef.biome || 'default';
                this.biomeAccentInt = toColorInt(sectorDef.accent !== undefined ? sectorDef.accent : this.biome.accent, 0x38bdf8);
                this.biomeAccentCss = toCssColor(this.biomeAccentInt, '#38bdf8');

                this.ensureProceduralTextures(this.biomeKey, this.biome);

                const rawMap = Array.isArray(sectorDef.map) ? sectorDef.map : FALLBACK_SECTOR.map;
                const maxCols = rawMap.reduce((m, row) => Math.max(m, String(row).length), 1);
                const grid = rawMap.map((row) => String(row).padEnd(maxCols, '#'));
                this.sectorGrid = grid;
                this.liveGrid = grid.map((row) => row.split(''));
                this.gridRows = grid.length;
                this.gridCols = maxCols;
                this.worldW = this.gridCols * this.TILE;
                this.worldH = this.gridRows * this.TILE;
                this.exploredGrid = new Uint8Array(this.gridRows * this.gridCols);

                const rawName = pickText(tr, sectorDef.title || sectorDef.name, `SECTOR ${this.sectorNum}`);
                this.sectorLabel = this.endlessMode
                    ? `${tr('SONSUZ İHLAL', 'ENDLESS BREACH')} · W${this.endlessWave} · ${rawName}`
                    : rawName;

                this.physics.world.setBounds(0, 0, this.worldW, this.worldH);
                this.cameras.main.setBounds(0, 0, this.worldW, this.worldH);

                // Parallax Biome Backdrop
                this.createParallaxBackdrop(this.biome, this.biomeAccentInt);

                // Physics Groups
                this.solids = this.physics.add.staticGroup();
                this.oneWays = this.physics.add.staticGroup();
                this.movingPlatforms = this.physics.add.group({ allowGravity: false, immovable: true });
                this.acids = this.physics.add.staticGroup();
                this.doors = this.physics.add.staticGroup();
                this.crates = this.physics.add.staticGroup();
                this.barrels = this.physics.add.staticGroup();
                this.reactors = this.physics.add.staticGroup();
                this.pickups = this.physics.add.staticGroup();
                this.upgradePods = this.physics.add.staticGroup();
                this.enemies = this.physics.add.group({ allowGravity: true });
                this.playerBolts = this.physics.add.group({ allowGravity: false });
                this.playerMissiles = this.physics.add.group({ allowGravity: false });
                this.enemyBolts = this.physics.add.group({ allowGravity: false });
                this.acidBlobs = this.physics.add.group({ allowGravity: true });

                this.parsedWalls = [];
                this.doorRefs = [];
                this.crateRefs = [];
                this.barrelRefs = [];
                this.movingPlatList = [];
                this.laserHazards = [];
                this.enemyList = [];
                this.acidSurfaceTiles = [];
                this.endlessSafeFloorSpawns = [];
                this.endlessSafeAirSpawns = [];
                this.acidBubbleTimer = 0;
                this.activeBoss = null;
                this.portalObj = null;
                this.bossSpawnPos = null;

                this.buildSectorFromGrid(grid, sectorDef, this.biomeKey);
                this.buildMovingPlatforms(sectorDef.movingPlatforms || [], this.biomeKey);

                this.acidFxG = this.add.graphics().setDepth(7);
                this.hazardFxG = this.add.graphics().setDepth(17);
                this.playerFxG = this.add.graphics().setDepth(21);
                this.enemyHpGraphics = this.add.graphics().setDepth(30);

                // Create Exo-Trooper Player
                this.createPlayer();

                // Build BFS-validated reachable spawns for Endless Breach
                this.buildReachableSpawns();

                // Colliders & Overlaps (Strictly isolating player drop-through one-way colliders)
                this.physics.add.collider(this.player, this.solids);
                this.playerOneWayCollider = this.physics.add.collider(this.player, this.oneWays);
                this.playerMovingCollider = this.physics.add.collider(this.player, this.movingPlatforms, (p, plat) => {
                    this.onPlayerStandMovingPlatform(p, plat);
                });
                this.physics.add.collider(this.player, this.doors);
                this.physics.add.collider(this.player, this.crates);
                this.physics.add.collider(this.player, this.barrels);

                this.physics.add.collider(this.enemies, this.solids);
                this.physics.add.collider(this.enemies, this.oneWays);
                this.physics.add.collider(this.enemies, this.movingPlatforms);
                this.physics.add.collider(this.enemies, this.doors);

                // All projectiles collide properly with walls and doors
                this.physics.add.collider(this.enemyBolts, this.solids, (bolt) => this.onEnemyBoltHitWall(bolt));
                this.physics.add.collider(this.enemyBolts, this.doors, (bolt) => this.onEnemyBoltHitWall(bolt));

                this.physics.add.collider(this.acidBlobs, this.solids, (blob) => this.splashAcidBlob(blob));
                this.physics.add.collider(this.acidBlobs, this.oneWays, (blob) => this.splashAcidBlob(blob));
                this.physics.add.collider(this.acidBlobs, this.doors, (blob) => this.splashAcidBlob(blob));
                this.physics.add.overlap(this.player, this.acidBlobs, (p, blob) => {
                    this.splashAcidBlob(blob);
                    this.damagePlayer(1);
                });

                this.physics.add.overlap(this.player, this.acids, () => this.hitAcid());
                this.physics.add.overlap(this.enemies, this.acids, (en) => this.onEnemyHitAcid(en));
                this.physics.add.overlap(this.player, this.pickups, (p, item) => this.collectPickup(item));
                this.physics.add.overlap(this.player, this.upgradePods, (p, pod) => this.collectUpgradePod(pod));
                this.physics.add.overlap(this.player, this.enemies, (p, en) => this.onPlayerTouchEnemy(en));
                this.physics.add.overlap(this.player, this.enemyBolts, (p, bolt) => this.onPlayerHitBolt(bolt));

                // Player Bolts (Pulse Shot, Charged Wave, Deflected Bolts)
                this.physics.add.overlap(this.playerBolts, this.solids, (bolt) => this.onPlayerBoltHitSolid(bolt));
                this.physics.add.overlap(this.playerBolts, this.doors, (bolt, door) => this.onPlayerBoltHitDoor(bolt, door));
                this.physics.add.overlap(this.playerBolts, this.enemies, (bolt, en) => this.onPlayerBoltHitEnemy(bolt, en));
                this.physics.add.overlap(this.playerBolts, this.reactors, (bolt, rec) => this.onPlayerBoltHitReactor(bolt, rec));
                this.physics.add.overlap(this.playerBolts, this.crates, (bolt, crate) => this.onPlayerBoltHitCrate(bolt, crate));
                this.physics.add.overlap(this.playerBolts, this.barrels, (bolt, barrel) => this.onPlayerBoltHitBarrel(bolt, barrel));

                // Player Missiles
                this.physics.add.overlap(this.playerMissiles, this.doors, (msl, door) => this.onMissileHitDoor(msl, door));
                this.physics.add.overlap(this.playerMissiles, this.solids, (msl) => this.detonateMissile(msl, null));
                this.physics.add.overlap(this.playerMissiles, this.enemies, (msl, en) => this.detonateMissile(msl, en));
                this.physics.add.overlap(this.playerMissiles, this.reactors, (msl, r) => this.onMissileHitReactor(msl, r));
                this.physics.add.overlap(this.playerMissiles, this.crates, (msl, c) => this.onMissileHitCrate(msl, c));
                this.physics.add.overlap(this.playerMissiles, this.barrels, (msl, b) => this.onMissileHitBarrel(msl, b));

                // Particle Emitters
                this.sparkEmitter = this.add.particles(0, 0, 'emb_spark', {
                    speed: { min: 55, max: 225 },
                    scale: { start: 1.15, end: 0 },
                    alpha: { start: 1, end: 0 },
                    lifespan: 340,
                    emitting: false
                }).setDepth(35);

                this.acidBubbleEmitter = this.add.particles(0, 0, 'emb_spark', {
                    speedX: { min: -28, max: 28 },
                    speedY: { min: -78, max: -24 },
                    scale: { start: 0.85, end: 0.08 },
                    alpha: { start: 0.92, end: 0 },
                    tint: [0x4ade80, 0x86efac, 0x22c55e],
                    lifespan: 580,
                    emitting: false
                }).setDepth(28);

                // Pointer Handling (LMB Tap/Hold Charge, RMB Missile)
                this.mouseCharging = false;
                this.onPointerDown = (pointer) => {
                    if (this.ended || this._cosmicPaused) return;
                    safeUnlockAudio(ctx);
                    if (pointer.rightButtonDown()) {
                        this.tryFireMissile(pointer);
                    } else if (pointer.leftButtonDown()) {
                        this.beginChargeAttack(pointer);
                    }
                };
                this.onPointerUp = (pointer) => {
                    if (this.mouseCharging && pointer.button === 0) {
                        this.mouseCharging = false;
                        this.releaseChargeAttack(pointer);
                    }
                };
                this.input.on('pointerdown', this.onPointerDown);
                this.input.on('pointerup', this.onPointerUp);
                this.input.on('pointerupoutside', this.onPointerUp);

                this.events.once('shutdown', () => {
                    this.input.off('pointerdown', this.onPointerDown);
                    this.input.off('pointerup', this.onPointerUp);
                    this.input.off('pointerupoutside', this.onPointerUp);
                    this.enemyList = [];
                    this.doorRefs = [];
                    this.crateRefs = [];
                    this.barrelRefs = [];
                    this.movingPlatList = [];
                    this.laserHazards = [];
                    this.acidSurfaceTiles = [];
                    this.endlessSafeFloorSpawns = [];
                    this.endlessSafeAirSpawns = [];
                    this.activeBoss = null;
                });

                // Camera Follow
                this.cameras.main.startFollow(this.player, true, 0.15, 0.15);

                // Screen-pinned HUD + Fog-of-War Minimap
                this.createCanvasOverlayHud();
                this.revealFogAroundPlayer();
                this.syncExternalHud();

                if (this.endlessMode) {
                    this.showBanner(
                        `${tr('SONSUZ İHLAL!', 'ENDLESS BREACH!')} · W${this.endlessWave}`,
                        '#c084fc'
                    );
                    this.spawnEndlessWave();
                } else {
                    this.showBanner(this.sectorLabel, this.biomeAccentCss);
                }
            }

            // -----------------------------------------------------------------
            // Procedural Fallback Textures + Biome-Keyed Tiles
            // -----------------------------------------------------------------
            ensureProceduralTextures(biomeKey, biome) {
                const T = this.TILE;
                const accent = toColorInt(biome.accent, 0x38bdf8);
                const wallFill = toColorInt(biome.wallFill, 0x0d172a);
                const wallTrim = toColorInt(biome.wallTrim, 0x1e3a5f);

                makeTextureSafe(this, 'emb_trooper', 64, 64, (g) => {
                    g.fillStyle(0x38bdf8, 1);
                    g.fillRoundedRect(18, 10, 28, 44, 8);
                    g.fillStyle(0x0f172a, 1);
                    g.fillRect(28, 16, 14, 8);
                    g.fillStyle(0x22d3ee, 1);
                    g.fillRect(30, 18, 10, 4);
                });
                makeTextureSafe(this, 'emb_spider', 64, 64, (g) => {
                    g.fillStyle(0xf43f5e, 1);
                    g.fillCircle(32, 32, 16);
                    g.lineStyle(3, 0xfb7185, 1);
                    g.lineBetween(10, 46, 22, 34);
                    g.lineBetween(54, 46, 42, 34);
                });
                makeTextureSafe(this, 'emb_mech', 64, 64, (g) => {
                    g.fillStyle(0xf59e0b, 1);
                    g.fillRoundedRect(14, 10, 36, 44, 6);
                    g.fillStyle(0x0f172a, 1);
                    g.fillRect(22, 18, 20, 8);
                });
                makeTextureSafe(this, 'emb_drone', 56, 56, (g) => {
                    g.fillStyle(0x0ea5e9, 1);
                    g.fillEllipse(28, 28, 38, 22);
                    g.fillStyle(0xf43f5e, 1);
                    g.fillCircle(28, 28, 7);
                });
                makeTextureSafe(this, 'emb_turret', 48, 48, (g) => {
                    g.fillStyle(0x334155, 1);
                    g.fillRoundedRect(8, 8, 32, 24, 6);
                    g.fillStyle(0xf43f5e, 1);
                    g.fillCircle(24, 24, 8);
                });
                makeTextureSafe(this, 'emb_spitter', 64, 64, (g) => {
                    g.fillStyle(0x16a34a, 1);
                    g.fillRoundedRect(14, 16, 36, 36, 14);
                    g.fillStyle(0x86efac, 1);
                    g.fillCircle(36, 26, 7);
                });
                makeTextureSafe(this, 'emb_commando', 64, 64, (g) => {
                    g.fillStyle(0x9333ea, 1);
                    g.fillRoundedRect(18, 8, 28, 46, 8);
                    g.fillStyle(0xf43f5e, 1);
                    g.fillRect(26, 16, 16, 7);
                });
                makeTextureSafe(this, 'emb_boss', 128, 128, (g) => {
                    g.fillStyle(0xa855f7, 1);
                    g.fillRoundedRect(18, 14, 92, 100, 18);
                    g.fillStyle(0xf43f5e, 1);
                    g.fillCircle(64, 58, 18);
                });
                makeTextureSafe(this, 'emb_reactor', 64, 64, (g) => {
                    g.fillStyle(0x22d3ee, 1);
                    g.fillCircle(32, 32, 24);
                    g.fillStyle(0x0f172a, 1);
                    g.fillCircle(32, 32, 10);
                });
                makeTextureSafe(this, 'emb_crate', 40, 40, (g) => {
                    g.fillStyle(0x78350f, 1);
                    g.fillRoundedRect(3, 3, 34, 34, 4);
                    g.lineStyle(2, 0xf59e0b, 0.9);
                    g.strokeRoundedRect(3, 3, 34, 34, 4);
                    g.lineBetween(6, 6, 34, 34);
                    g.lineBetween(34, 6, 6, 34);
                });
                makeTextureSafe(this, 'emb_barrel', 40, 40, (g) => {
                    g.fillStyle(0x991b1b, 1);
                    g.fillRoundedRect(7, 3, 26, 34, 6);
                    g.fillStyle(0xf59e0b, 1);
                    g.fillRect(7, 15, 26, 10);
                });
                makeTextureSafe(this, 'emb_prism', 32, 32, (g) => {
                    g.fillStyle(0x38bdf8, 1);
                    g.fillTriangle(16, 2, 30, 16, 16, 30);
                    g.fillTriangle(16, 2, 2, 16, 16, 30);
                });
                makeTextureSafe(this, 'emb_battery', 28, 28, (g) => {
                    g.fillStyle(0x064e3b, 1);
                    g.fillRoundedRect(2, 2, 24, 24, 6);
                    g.lineStyle(2, 0x34d399, 1);
                    g.strokeRoundedRect(2, 2, 24, 24, 6);
                    g.fillStyle(0x34d399, 1);
                    g.fillRect(12, 6, 4, 16);
                    g.fillRect(6, 12, 16, 4);
                });
                makeTextureSafe(this, 'emb_missile_pod', 28, 28, (g) => {
                    g.fillStyle(0x451a03, 1);
                    g.fillRoundedRect(2, 2, 24, 24, 6);
                    g.lineStyle(2, 0xf59e0b, 1);
                    g.strokeRoundedRect(2, 2, 24, 24, 6);
                    g.fillStyle(0xfbbf24, 1);
                    g.fillTriangle(14, 5, 22, 20, 6, 20);
                });
                makeTextureSafe(this, 'emb_upgrade_pod', 52, 58, (g) => {
                    g.fillStyle(0x1e1b4b, 0.95);
                    g.fillRoundedRect(6, 4, 40, 50, 12);
                    g.lineStyle(3, 0x22d3ee, 1);
                    g.strokeRoundedRect(6, 4, 40, 50, 12);
                    g.fillStyle(0xa855f7, 0.9);
                    g.fillCircle(26, 29, 11);
                });
                makeTextureSafe(this, 'emb_portal', 56, 78, (g, w, h) => {
                    g.lineStyle(4, 0x22d3ee, 0.9);
                    g.strokeEllipse(w / 2, h / 2, w - 8, h - 8);
                    g.fillStyle(0x0ea5e9, 0.35);
                    g.fillEllipse(w / 2, h / 2, w - 16, h - 16);
                    g.lineStyle(2, 0xa855f7, 0.9);
                    g.strokeEllipse(w / 2, h / 2, w - 26, h - 26);
                });
                makeTextureSafe(this, 'emb_warp_gate', 56, 78, (g, w, h) => {
                    g.lineStyle(4, 0x34d399, 0.95);
                    g.strokeEllipse(w / 2, h / 2, w - 6, h - 6);
                    g.fillStyle(0x22d3ee, 0.35);
                    g.fillEllipse(w / 2, h / 2, w - 18, h - 18);
                });

                // Biome-specific wall and platform textures
                makeTextureSafe(this, `emb_tile_hull_${biomeKey}`, T, T, (g, w, h) => {
                    g.fillStyle(wallFill, 1);
                    g.fillRect(0, 0, w, h);
                    g.lineStyle(1.5, wallTrim, 1);
                    g.strokeRect(1, 1, w - 2, h - 2);
                    g.fillStyle(wallTrim, 0.42);
                    g.fillRect(5, 5, w - 10, h - 10);
                    g.fillStyle(accent, 0.36);
                    g.fillRect(8, 3, w - 16, 2);
                    g.fillCircle(7, 7, 1.5);
                    g.fillCircle(w - 7, 7, 1.5);
                });

                makeTextureSafe(this, `emb_tile_plat_${biomeKey}`, T, 14, (g, w, h) => {
                    g.fillStyle(wallTrim, 1);
                    g.fillRoundedRect(0, 0, w, h, 3);
                    g.fillStyle(accent, 0.88);
                    g.fillRect(2, 1, w - 4, 3);
                    g.fillStyle(wallFill, 1);
                    for (let x = 6; x < w - 6; x += 8) {
                        g.fillRect(x, 6, 4, 5);
                    }
                });

                makeTextureSafe(this, `emb_moving_plat_${biomeKey}`, T, 14, (g, w, h) => {
                    g.fillStyle(0x0f172a, 1);
                    g.fillRoundedRect(0, 0, w, h, 4);
                    g.fillStyle(0x22d3ee, 0.95);
                    g.fillRect(2, 1, w - 4, 4);
                    g.fillStyle(accent, 0.7);
                    g.fillRect(4, h - 4, w - 8, 2);
                });

                makeTextureSafe(this, 'emb_door_shield', 28, T * 3, (g, w, h) => {
                    g.fillStyle(0x0c192c, 0.92);
                    g.fillRect(2, 0, w - 4, h);
                    g.lineStyle(3, 0xf59e0b, 1);
                    g.strokeRect(2, 2, w - 4, h - 4);
                    g.lineStyle(2, 0xfbbf24, 0.75);
                    for (let y = 12; y < h - 8; y += 18) {
                        g.lineBetween(4, y, w - 4, y + 8);
                    }
                    g.fillStyle(0xf59e0b, 1);
                    g.fillCircle(w / 2, h / 2, 7);
                });

                makeTextureSafe(this, 'emb_acid', T, T, (g, w, h) => {
                    g.fillStyle(0x052e16, 0.95);
                    g.fillRect(0, 0, w, h);
                    g.fillStyle(0x22c55e, 0.78);
                    g.fillRect(0, 0, w, 10);
                    g.fillStyle(0x86efac, 0.92);
                    g.fillRect(4, 2, 12, 3);
                    g.fillRect(22, 4, 10, 3);
                    g.fillCircle(14, 20, 3);
                    g.fillCircle(30, 28, 2.5);
                });

                makeTextureSafe(this, 'emb_slash_crescent', 112, 96, (g) => {
                    g.fillStyle(0x22d3ee, 0.28);
                    g.fillEllipse(44, 48, 92, 86);
                    g.lineStyle(8, 0x38bdf8, 0.95);
                    g.beginPath();
                    g.arc(30, 48, 46, -1.15, 1.15, false);
                    g.strokePath();
                    g.lineStyle(3.5, 0xe0f2fe, 1);
                    g.beginPath();
                    g.arc(32, 48, 44, -1.05, 1.05, false);
                    g.strokePath();
                });

                makeTextureSafe(this, 'emb_pulse_shot', 22, 10, (g) => {
                    g.fillStyle(0x38bdf8, 0.45);
                    g.fillRoundedRect(0, 0, 22, 10, 5);
                    g.fillStyle(0xe0f2fe, 1);
                    g.fillRoundedRect(4, 2, 15, 6, 3);
                });

                makeTextureSafe(this, 'emb_charged_wave', 44, 66, (g) => {
                    g.fillStyle(0x22d3ee, 0.35);
                    g.fillEllipse(20, 33, 36, 62);
                    g.lineStyle(7, 0x38bdf8, 0.96);
                    g.beginPath();
                    g.arc(8, 33, 30, -1.25, 1.25, false);
                    g.strokePath();
                    g.lineStyle(3, 0xffffff, 1);
                    g.beginPath();
                    g.arc(10, 33, 28, -1.12, 1.12, false);
                    g.strokePath();
                });

                makeTextureSafe(this, 'emb_missile', 24, 12, (g) => {
                    g.fillStyle(0xf59e0b, 1);
                    g.fillRoundedRect(2, 2, 18, 8, 4);
                    g.fillStyle(0x38bdf8, 1);
                    g.fillTriangle(18, 1, 24, 6, 18, 11);
                    g.fillStyle(0xfef08a, 1);
                    g.fillCircle(4, 6, 3);
                });

                makeTextureSafe(this, 'emb_spark', 10, 10, (g) => {
                    g.fillStyle(0xffffff, 1);
                    g.fillCircle(5, 5, 4);
                });

                makeTextureSafe(this, 'emb_bolt_enemy', 14, 14, (g) => {
                    g.fillStyle(0xfb7185, 0.45);
                    g.fillCircle(7, 7, 7);
                    g.fillStyle(0xff2d55, 1);
                    g.fillCircle(7, 7, 4.5);
                    g.fillStyle(0xffffff, 1);
                    g.fillCircle(7, 7, 2);
                });

                makeTextureSafe(this, 'emb_acid_blob', 16, 16, (g) => {
                    g.fillStyle(0x22c55e, 0.5);
                    g.fillCircle(8, 8, 8);
                    g.fillStyle(0x4ade80, 1);
                    g.fillCircle(8, 8, 5);
                    g.fillStyle(0xdcfce7, 1);
                    g.fillCircle(6, 6, 2);
                });

                makeTextureSafe(this, 'emb_laser_emitter', 24, 24, (g) => {
                    g.fillStyle(0x1e293b, 1);
                    g.fillRoundedRect(2, 2, 20, 20, 5);
                    g.lineStyle(2, 0xe879f9, 1);
                    g.strokeRoundedRect(2, 2, 20, 20, 5);
                    g.fillStyle(0x22d3ee, 1);
                    g.fillCircle(12, 12, 5);
                });
            }

            createParallaxBackdrop(biome, accentInt) {
                const bgTop = toColorInt(biome.bgTop, 0x040714);
                const bgBot = toColorInt(biome.bgBottom, 0x091229);
                const gridAlpha = Number(biome.gridAlpha) > 0 ? Number(biome.gridAlpha) : 0.08;

                const bg = this.add.graphics().setScrollFactor(0).setDepth(-20);
                bg.fillGradientStyle(bgTop, bgTop, bgBot, bgBot, 1);
                bg.fillRect(0, 0, 960, 580);
                bg.fillStyle(accentInt, 0.09);
                bg.fillCircle(230, 175, 225);
                bg.fillStyle(0x7c3aed, 0.07);
                bg.fillCircle(745, 365, 255);

                // Far parallax stars
                const starsG = this.add.graphics().setScrollFactor(0.12).setDepth(-18);
                for (let i = 0; i < 95; i++) {
                    const sx = (i * 197 + 41) % 1600;
                    const sy = (i * 131 + 23) % 980;
                    starsG.fillStyle(i % 5 === 0 ? accentInt : 0xe2e8f0, 0.28 + (i % 4) * 0.14);
                    starsG.fillCircle(sx, sy, (i % 3) * 0.6 + 0.8);
                }

                // Mid cyber-grid & structural pillars
                const gridG = this.add.graphics().setScrollFactor(0.32).setDepth(-15);
                gridG.lineStyle(1, accentInt, gridAlpha);
                for (let x = 0; x <= 2400; x += 80) {
                    gridG.lineBetween(x, 0, x, 1300);
                }
                for (let y = 0; y <= 1300; y += 80) {
                    gridG.lineBetween(0, y, 2400, y);
                }
                gridG.fillStyle(accentInt, gridAlpha * 0.6);
                for (let x = 160; x < 2400; x += 320) {
                    gridG.fillRect(x, 0, 18, 1300);
                }
            }

            // -----------------------------------------------------------------
            // Map Parsing & World Entity Spawning
            // -----------------------------------------------------------------
            buildSectorFromGrid(grid, sectorDef, biomeKey) {
                const T = this.TILE;
                const rows = grid.length;
                const cols = grid[0].length;
                const visitedDoors = new Set();

                // Merge contiguous horizontal solid walls `#` to eliminate physics seam snagging
                for (let r = 0; r < rows; r++) {
                    let c = 0;
                    while (c < cols) {
                        if (grid[r][c] === '#') {
                            const startC = c;
                            while (c < cols && grid[r][c] === '#') c++;
                            const spanW = (c - startC) * T;
                            const cx = startC * T + spanW * 0.5;
                            const cy = r * T + T * 0.5;
                            const tile = this.add.tileSprite(cx, cy, spanW, T, `emb_tile_hull_${biomeKey}`).setDepth(4);
                            this.physics.add.existing(tile, true);
                            this.solids.add(tile);
                            this.parsedWalls.push({ x: startC * T, y: r * T, w: spanW, h: T, kind: 'wall' });
                        } else {
                            c++;
                        }
                    }
                }

                // Merge contiguous horizontal one-way platforms `=`
                for (let r = 0; r < rows; r++) {
                    let c = 0;
                    while (c < cols) {
                        if (grid[r][c] === '=') {
                            const startC = c;
                            while (c < cols && grid[r][c] === '=') c++;
                            const spanW = (c - startC) * T;
                            const cx = startC * T + spanW * 0.5;
                            const cy = r * T + 7;
                            const plat = this.add.tileSprite(cx, cy, spanW, 14, `emb_tile_plat_${biomeKey}`).setDepth(4);
                            this.physics.add.existing(plat, true);
                            this.oneWays.add(plat);
                            plat.body.checkCollision.down = false;
                            plat.body.checkCollision.left = false;
                            plat.body.checkCollision.right = false;
                            this.parsedWalls.push({ x: startC * T, y: r * T, w: spanW, h: 14, kind: 'plat' });
                        } else {
                            c++;
                        }
                    }
                }

                this.spawnPoint = { x: T * 2.5, y: Math.max(T * 3, (rows - 3) * T) };

                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        const ch = grid[r][c];
                        const wx = c * T + T * 0.5;
                        const wy = r * T + T * 0.5;

                        if (ch === 'P') {
                            this.spawnPoint = { x: wx, y: wy };
                        } else if (ch === '~') {
                            const acid = this.add.tileSprite(wx, wy + 6, T, T - 12, 'emb_acid').setDepth(6);
                            this.physics.add.existing(acid, true);
                            this.acids.add(acid);
                            if (r === 0 || grid[r - 1][c] !== '~') {
                                this.acidSurfaceTiles.push({ x: wx, y: r * T + 12 });
                            }
                        } else if (ch === 'D' && !visitedDoors.has(`${r},${c}`)) {
                            let endR = r;
                            const cells = [];
                            while (endR < rows && grid[endR][c] === 'D') {
                                visitedDoors.add(`${endR},${c}`);
                                cells.push({ r: endR, c });
                                endR++;
                            }
                            endR--;
                            if (this.endlessMode) {
                                // Unified endless arenas never split player from enemies behind doors
                                for (let k = 0; k < cells.length; k++) {
                                    this.liveGrid[cells[k].r][cells[k].c] = '.';
                                }
                                continue;
                            }
                            const doorH = (endR - r + 1) * T;
                            const doorCy = r * T + doorH * 0.5;
                            const door = this.doors.create(wx, doorCy, 'emb_door_shield').setDepth(7);
                            door.setDisplaySize(28, doorH).refreshBody();
                            door.setData({ cells, pulseHits: 0 });
                            this.doorRefs.push(door);
                        } else if (ch === 'C') {
                            this.spawnSupplyCrate(wx, wy);
                        } else if (ch === 'E') {
                            this.spawnExplosiveBarrel(wx, wy);
                        } else if (ch === 'L') {
                            this.registerLaserHazard(r, c, wx, wy, grid);
                        } else if (ch === 'U') {
                            this.spawnUpgradePod(wx, wy, sectorDef.upgradeId);
                        } else if (ch === 'H') {
                            this.spawnPickup(wx, wy, 'hp');
                        } else if (ch === 'A') {
                            this.spawnPickup(wx, wy, 'missile');
                        } else if (ch === 'X') {
                            this.spawnExtractionPortal(wx, wy);
                        } else if (!this.endlessMode) {
                            if (ch === 'S') {
                                this.spawnSpiderBot(wx, wy);
                            } else if (ch === 'M') {
                                this.spawnPatrolMech(wx, wy);
                            } else if (ch === 'V') {
                                this.spawnHoverDrone(wx, wy);
                            } else if (ch === 'T') {
                                this.spawnLaserTurret(r, c, wx, wy, grid);
                            } else if (ch === 'G') {
                                this.spawnAcidSpitter(wx, wy);
                            } else if (ch === 'K') {
                                this.spawnVoidCommando(wx, wy);
                            } else if (ch === 'R') {
                                this.spawnReactor(wx, wy);
                            } else if (ch === 'B') {
                                this.bossPresentInSector = true;
                                this.bossSpawnPos = { x: wx, y: wy - 16 };
                            }
                        }
                    }
                }

                // Unlock portal immediately in non-endless sectors that have neither reactor nor boss
                if (!this.endlessMode && this.portalObj && this.reactorsAlive === 0 && !this.bossPresentInSector) {
                    this.unlockExtractionPortal(true);
                }
            }

            buildMovingPlatforms(defs, biomeKey) {
                if (!Array.isArray(defs) || defs.length === 0) return;
                const T = this.TILE;
                for (let i = 0; i < defs.length; i++) {
                    const mp = defs[i];
                    if (!mp) continue;
                    const tileW = Math.max(1, Number(mp.tileW) || 3);
                    const w = tileW * T;
                    const startX = (Number(mp.tileX) || 0) * T + w * 0.5;
                    const startY = (Number(mp.tileY) || 0) * T + 7;
                    const deltaX = (Number(mp.moveTileX) || 0) * T;
                    const deltaY = (Number(mp.moveTileY) || 0) * T;
                    const rawSpd = Number(mp.speed) || 75;
                    // Support either px/sec (>= 12) or tiles/sec (< 12)
                    const speedPx = rawSpd < 12 ? Math.max(24, rawSpd * T) : rawSpd;
                    const travelDist = Math.hypot(deltaX, deltaY);

                    const plat = this.add.tileSprite(startX, startY, w, 14, `emb_moving_plat_${biomeKey}`).setDepth(5);
                    this.physics.add.existing(plat, false);
                    this.movingPlatforms.add(plat);
                    plat.body.setAllowGravity(false);
                    plat.body.setImmovable(true);
                    plat.body.checkCollision.down = false;
                    plat.body.checkCollision.left = false;
                    plat.body.checkCollision.right = false;

                    plat.setData({
                        startX,
                        startY,
                        deltaX,
                        deltaY,
                        dist: Math.max(1, travelDist),
                        speedPx,
                        phase: i * 0.85,
                        dx: 0,
                        dy: 0,
                        w
                    });
                    this.movingPlatList.push(plat);
                }
            }

            updateMovingPlatforms(dt) {
                for (let i = 0; i < this.movingPlatList.length; i++) {
                    const plat = this.movingPlatList[i];
                    if (!plat || !plat.active) continue;
                    const startX = plat.getData('startX');
                    const startY = plat.getData('startY');
                    const deltaX = plat.getData('deltaX');
                    const deltaY = plat.getData('deltaY');
                    const dist = plat.getData('dist');
                    const speedPx = plat.getData('speedPx');
                    let phase = plat.getData('phase') + (speedPx / dist) * dt;
                    plat.setData('phase', phase);

                    const t = 0.5 - 0.5 * Math.cos(phase * Math.PI);
                    const nextX = startX + deltaX * t;
                    const nextY = startY + deltaY * t;
                    const dx = nextX - plat.x;
                    const dy = nextY - plat.y;

                    plat.setData('dx', dx);
                    plat.setData('dy', dy);
                    plat.setPosition(nextX, nextY);
                    if (plat.body) {
                        plat.body.updateFromGameObject();
                    }
                }
            }

            onPlayerStandMovingPlatform(p, plat) {
                if (!p || !p.body || !plat || !plat.active) return;
                if (p.body.velocity.y >= 0 && p.body.bottom <= plat.y + 12) {
                    this.ridingPlatform = plat;
                }
            }

            spawnSupplyCrate(x, y) {
                const c = this.crates.create(x, y + 2, 'emb_crate').setDepth(7);
                c.setDisplaySize(36, 36).refreshBody();
                c.setData({ hp: 2, kind: 'crate' });
                this.crateRefs.push(c);
                return c;
            }

            spawnExplosiveBarrel(x, y) {
                const b = this.barrels.create(x, y + 2, 'emb_barrel').setDepth(7);
                b.setDisplaySize(34, 38).refreshBody();
                b.setData({ primed: false, exploded: false, kind: 'barrel' });
                this.barrelRefs.push(b);
                return b;
            }

            spawnPickup(x, y, kind) {
                const tex = kind === 'hp'
                    ? 'emb_battery'
                    : (kind === 'missile' ? 'emb_missile_pod' : 'emb_prism');
                const item = this.pickups.create(x, y, tex).setDepth(8);
                item.setDisplaySize(24, 24).refreshBody();
                item.setData('kind', kind);
                this.tweens.add({
                    targets: item,
                    y: y - 6,
                    yoyo: true,
                    repeat: -1,
                    duration: 850 + Math.random() * 160,
                    ease: 'Sine.InOut'
                });
                return item;
            }

            spawnUpgradePod(x, y, upgradeId) {
                const exo = getData();
                let targetId = upgradeId;
                if (this.endlessMode || !targetId || this.upgrades[targetId]) {
                    const missing = UPGRADE_ORDER.find((u) => !this.upgrades[u.id]);
                    if (missing) targetId = missing.id;
                }
                const spec = (targetId && exo.upgrades[targetId]) || DEFAULT_UPGRADES[targetId] || null;
                const col = spec ? toColorInt(spec.color, 0x22d3ee) : 0x34d399;

                const pod = this.upgradePods.create(x, y - 4, 'emb_upgrade_pod').setDepth(8);
                pod.setDisplaySize(40, 44).refreshBody();
                pod.setTint(col);
                pod.setData('upgradeId', targetId || 'overdrive');
                this.tweens.add({
                    targets: pod,
                    y: y - 11,
                    yoyo: true,
                    repeat: -1,
                    duration: 950,
                    ease: 'Sine.InOut'
                });
                return pod;
            }

            spawnReactor(x, y) {
                const exo = getData();
                const baseHp = Number((exo.props && exo.props.reactor && exo.props.reactor.hp) || 120);
                const rec = this.reactors.create(x, y - 4, 'emb_reactor').setDepth(8);
                rec.setDisplaySize(46, 46).refreshBody();
                const hp = Math.round(baseHp * (1 + (this.sectorNum - 1) * 0.12));
                rec.setData({ hp, maxHp: hp });
                this.reactorTotal++;
                this.reactorsAlive++;
                return rec;
            }

            spawnExtractionPortal(x, y) {
                const tex = this.textures.exists('emb_warp_gate') ? 'emb_warp_gate' : 'emb_portal';
                this.portalObj = this.add.sprite(x, y - 14, tex).setDepth(7);
                this.portalObj.setDisplaySize(54, 74);
                this.portalObj.setAlpha(0.28);
                this.portalUnlocked = false;
            }

            registerLaserHazard(r, c, wx, wy, grid) {
                const rows = grid.length;
                const cols = grid[0].length;
                let dx = 0;
                let dy = 1;
                if (r > 0 && grid[r - 1][c] === '#') {
                    dx = 0; dy = 1;
                } else if (r + 1 < rows && (grid[r + 1][c] === '#' || grid[r + 1][c] === '=' || grid[r + 1][c] === '~')) {
                    dx = 0; dy = -1;
                } else if (c > 0 && grid[r][c - 1] === '#') {
                    dx = 1; dy = 0;
                } else if (c + 1 < cols && grid[r][c + 1] === '#') {
                    dx = -1; dy = 0;
                }

                const emitter = this.add.image(wx, wy, 'emb_laser_emitter').setDepth(9);
                emitter.setDisplaySize(24, 24);
                if (dx === 1) emitter.setAngle(-90);
                else if (dx === -1) emitter.setAngle(90);
                else if (dy === -1) emitter.setAngle(180);

                this.laserHazards.push({
                    x: wx,
                    y: wy,
                    dx,
                    dy,
                    emitter,
                    timer: ((r * 7 + c * 11) % 5) * 0.48
                });
            }

            createPlayer() {
                const p = this.physics.add.sprite(this.spawnPoint.x, this.spawnPoint.y, 'emb_trooper').setDepth(12);
                p.setDisplaySize(44, 48);
                setWorldBody(p, 24, 40);
                p.setCollideWorldBounds(true);
                p.setMaxVelocity(740, 780);
                this.player = p;

                this.facing = 1;
                this.maxAirJumps = this.upgrades.triple_jump ? 2 : 1;
                this.airJumpsLeft = this.maxAirJumps;
                this.coyoteTimer = 0;
                this.jumpBufferTimer = 0;
                this.wasJumpHeld = false;
                this.pogoBounceLock = 0;
                this.wallJumpLockTimer = 0;
                this.dropThroughTimer = 0;
                this.ridingPlatform = null;

                this.dashTimer = 0;
                this.dashCooldown = 0;
                this.dashHitSet = new Set();
                this.invulnTimer = 0;
                this.slashCooldown = 0;
                this.pulseCooldown = 0;
                this.missileCooldown = 0;
                this.missileRegenTimer = 0;
                this.slashCombo = 0;
                this.comboStep = 0;
                this.comboResetTimer = 0;

                // Charge attack state
                this.jCharging = false;
                this.chargeTimer = 0;
                this.chargeReadyPlayed = false;

                this.wallSliding = false;
                this.wallNormal = 0;
                this.lastSafeX = this.spawnPoint.x;
                this.lastSafeY = this.spawnPoint.y;
            }

            // -----------------------------------------------------------------
            // Reachable Spawn Validation (BFS from Player Spawn)
            // -----------------------------------------------------------------
            buildReachableSpawns() {
                this.endlessSafeFloorSpawns = [];
                this.endlessSafeAirSpawns = [];
                if (!this.liveGrid) return;

                const T = this.TILE;
                const rows = this.gridRows;
                const cols = this.gridCols;
                const startC = clamp(Math.floor(this.spawnPoint.x / T), 1, cols - 2);
                const startR = clamp(Math.floor(this.spawnPoint.y / T), 1, rows - 2);

                const visited = new Uint8Array(rows * cols);
                const queue = [startR * cols + startC];
                visited[startR * cols + startC] = 1;

                const isBlocked = (ch) => ch === '#' || ch === '~' || (this.endlessMode && ch === 'D');
                const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

                let head = 0;
                while (head < queue.length) {
                    const cur = queue[head++];
                    const r = Math.floor(cur / cols);
                    const c = cur % cols;
                    for (let d = 0; d < 4; d++) {
                        const nr = r + dirs[d][0];
                        const nc = c + dirs[d][1];
                        if (nr <= 0 || nr >= rows - 1 || nc <= 0 || nc >= cols - 1) continue;
                        const ni = nr * cols + nc;
                        if (visited[ni]) continue;
                        if (isBlocked(this.liveGrid[nr][nc])) continue;
                        visited[ni] = 1;
                        queue.push(ni);
                    }
                }

                const floorSeen = new Set();
                if (this.sectorDef && Array.isArray(this.sectorDef.safeSpawns)) {
                    for (let i = 0; i < this.sectorDef.safeSpawns.length; i++) {
                        const sp = this.sectorDef.safeSpawns[i];
                        if (!sp) continue;
                        const c = Number.isFinite(sp.tileX) ? sp.tileX : Math.floor((Number(sp.x) || 0) / T);
                        const r = Number.isFinite(sp.tileY) ? sp.tileY : Math.floor((Number(sp.y) || 0) / T);
                        if (r <= 1 || r >= rows - 1 || c <= 0 || c >= cols - 1) continue;
                        if (!visited[r * cols + c]) continue;
                        const below = this.liveGrid[r + 1] ? this.liveGrid[r + 1][c] : '#';
                        const wx = c * T + T * 0.5;
                        if ((below === '#' || below === '=') && !this.isAcidColumnBelow(wx, r * T)) {
                            const key = `${r}:${c}`;
                            floorSeen.add(key);
                            this.endlessSafeFloorSpawns.push({
                                x: wx,
                                y: (r + 1) * T - 30,
                                isPlatform: below === '='
                            });
                        }
                    }
                }

                for (let r = 2; r < rows - 1; r++) {
                    for (let c = 1; c < cols - 1; c++) {
                        if (!visited[r * cols + c]) continue;
                        const ch = this.liveGrid[r][c];
                        const above = this.liveGrid[r - 1][c];
                        const below = this.liveGrid[r + 1][c];
                        if (isBlocked(ch) || isBlocked(above)) continue;

                        const wx = c * T + T * 0.5;
                        const wy = r * T + T * 0.5;

                        if ((below === '#' || below === '=') && !this.isAcidColumnBelow(wx, r * T)) {
                            if (this.liveGrid[r][c - 1] !== '#' && this.liveGrid[r][c + 1] !== '#' && !floorSeen.has(`${r}:${c}`)) {
                                this.endlessSafeFloorSpawns.push({
                                    x: wx,
                                    y: (r + 1) * T - 30,
                                    isPlatform: below === '='
                                });
                            }
                        } else if (below === '.' && r < rows - 3) {
                            this.endlessSafeAirSpawns.push({ x: wx, y: wy });
                        }
                    }
                }
            }

            // -----------------------------------------------------------------
            // 6 Enemy Archetypes + Aegis Colossus Boss Spawners
            // -----------------------------------------------------------------
            getEnemyCfg(kind) {
                const exo = getData();
                const base = DEFAULT_ENEMIES[kind] || DEFAULT_ENEMIES.spider;
                const over = (exo.enemies && exo.enemies[kind]) || {};
                return {
                    hp: Math.round((Number(over.hp) || base.hp) * this.difficultyMult),
                    speed: (Number(over.speed) || base.speed) * Math.min(1.45, 0.85 + this.difficultyMult * 0.15),
                    score: Number(over.score) || base.score,
                    fireCd: Number(over.fireCd) || base.fireCd
                };
            }

            spawnSpiderBot(x, y) {
                const cfg = this.getEnemyCfg('spider');
                const s = this.enemies.create(x, y, 'emb_spider').setDepth(10);
                s.setDisplaySize(38, 34);
                setWorldBody(s, 30, 26);
                s.setCollideWorldBounds(true);
                s.setData({
                    kind: 'spider',
                    hp: cfg.hp,
                    maxHp: cfg.hp,
                    speed: cfg.speed,
                    baseScore: cfg.score,
                    fireCd: cfg.fireCd,
                    dir: -1,
                    fireTimer: 1.0 + Math.random() * 0.9,
                    stunTimer: 0,
                    hopTimer: 0.7 + Math.random() * 0.8
                });
                this.enemyList.push(s);
                return s;
            }

            spawnPatrolMech(x, y) {
                const cfg = this.getEnemyCfg('mech');
                const m = this.enemies.create(x, y - 6, 'emb_mech').setDepth(10);
                m.setDisplaySize(54, 58);
                setWorldBody(m, 40, 48);
                m.setCollideWorldBounds(true);
                m.setData({
                    kind: 'mech',
                    hp: cfg.hp,
                    maxHp: cfg.hp,
                    speed: cfg.speed,
                    baseScore: cfg.score,
                    fireCd: cfg.fireCd,
                    dir: -1,
                    fireTimer: 1.3 + Math.random() * 0.8,
                    stunTimer: 0
                });
                this.enemyList.push(m);
                return m;
            }

            spawnHoverDrone(x, y) {
                const cfg = this.getEnemyCfg('drone');
                const d = this.enemies.create(x, y, 'emb_drone').setDepth(11);
                d.setDisplaySize(40, 34);
                setWorldBody(d, 30, 24);
                d.body.setAllowGravity(false);
                d.setCollideWorldBounds(true);
                d.setData({
                    kind: 'drone',
                    hp: cfg.hp,
                    maxHp: cfg.hp,
                    speed: cfg.speed,
                    baseScore: cfg.score,
                    fireCd: cfg.fireCd,
                    hoverPhase: Math.random() * TAU,
                    fireTimer: 1.1 + Math.random() * 0.8,
                    stunTimer: 0
                });
                this.enemyList.push(d);
                return d;
            }

            spawnLaserTurret(r, c, x, y, grid) {
                const cfg = this.getEnemyCfg('turret');
                const t = this.enemies.create(x, y, 'emb_turret').setDepth(10);
                t.setDisplaySize(36, 36);
                setWorldBody(t, 30, 30);
                t.body.setAllowGravity(false);
                t.body.setImmovable(true);

                // Orient cleanly against ceiling, floor, or wall
                const rows = grid.length;
                const cols = grid[0].length;
                if (r > 0 && grid[r - 1][c] === '#') t.setAngle(180);
                else if (c > 0 && grid[r][c - 1] === '#') t.setAngle(90);
                else if (c + 1 < cols && grid[r][c + 1] === '#') t.setAngle(-90);
                else if (r + 1 < rows && grid[r + 1][c] === '#') t.setAngle(0);

                t.setData({
                    kind: 'turret',
                    hp: cfg.hp,
                    maxHp: cfg.hp,
                    speed: 0,
                    baseScore: cfg.score,
                    fireCd: cfg.fireCd,
                    fireTimer: 1.2 + Math.random() * 0.6,
                    telegraphTimer: 0,
                    aimAngle: Math.PI * 0.5,
                    stunTimer: 0
                });
                this.enemyList.push(t);
                return t;
            }

            spawnAcidSpitter(x, y) {
                const cfg = this.getEnemyCfg('spitter');
                const g = this.enemies.create(x, y - 4, 'emb_spitter').setDepth(10);
                g.setDisplaySize(44, 42);
                setWorldBody(g, 34, 34);
                g.setCollideWorldBounds(true);
                g.setData({
                    kind: 'spitter',
                    hp: cfg.hp,
                    maxHp: cfg.hp,
                    speed: cfg.speed,
                    baseScore: cfg.score,
                    fireCd: cfg.fireCd,
                    dir: -1,
                    fireTimer: 1.4 + Math.random() * 0.9,
                    stunTimer: 0
                });
                this.enemyList.push(g);
                return g;
            }

            spawnVoidCommando(x, y) {
                const cfg = this.getEnemyCfg('commando');
                const k = this.enemies.create(x, y - 6, 'emb_commando').setDepth(11);
                k.setDisplaySize(46, 52);
                setWorldBody(k, 30, 42);
                k.setCollideWorldBounds(true);
                k.setData({
                    kind: 'commando',
                    hp: cfg.hp,
                    maxHp: cfg.hp,
                    speed: cfg.speed,
                    baseScore: cfg.score,
                    fireCd: cfg.fireCd,
                    dir: -1,
                    fireTimer: 1.2 + Math.random() * 0.7,
                    dodgeCooldown: 1.5,
                    burstLeft: 0,
                    burstTimer: 0,
                    stunTimer: 0
                });
                this.enemyList.push(k);
                return k;
            }

            spawnAegisBoss(x, y) {
                if (this.bossSpawned) return;
                this.bossSpawned = true;
                safePlay(ctx, 'bossAlarm');
                this.showBanner(
                    this.endlessMode
                        ? `AEGIS COLOSSUS MK-${Math.max(1, this.endlessWave)}`
                        : tr('AEGIS COLOSSUS UYANDI!', 'AEGIS COLOSSUS AWAKENED!'),
                    '#fb7185'
                );

                // Cleanly trigger Boss fight without placing any softlocking barrier wall
                const cfg = this.getEnemyCfg('boss');
                const b = this.enemies.create(x, y - 22, 'emb_boss').setDepth(11);
                b.setDisplaySize(112, 122);
                setWorldBody(b, 78, 102);
                b.setCollideWorldBounds(true);
                b.setData({
                    kind: 'boss',
                    hp: cfg.hp,
                    maxHp: cfg.hp,
                    speed: cfg.speed,
                    baseScore: cfg.score,
                    fireCd: cfg.fireCd,
                    dir: -1,
                    phase: 1,
                    aiTimer: 1.15,
                    patternIdx: 0,
                    stunTimer: 0,
                    slamActive: false
                });
                this.activeBoss = b;
                this.enemyList.push(b);
            }

            // -----------------------------------------------------------------
            // Canvas Overlay HUD & Fog-of-War Minimap
            // -----------------------------------------------------------------
            createCanvasOverlayHud() {
                this.hudGraphics = this.add.graphics().setScrollFactor(0).setDepth(100);
                this.minimapGraphics = this.add.graphics().setScrollFactor(0).setDepth(101);

                this.hudTitleTxt = this.add.text(18, 13, this.sectorLabel, {
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '11px',
                    fontStyle: 'bold',
                    color: this.biomeAccentCss
                }).setScrollFactor(0).setDepth(102);

                this.hudAbilityTxt = this.add.text(18, 53, '', {
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '10px',
                    color: '#cbd5e1'
                }).setScrollFactor(0).setDepth(102);

                this.hudBadgeTxts = UPGRADE_ORDER.map((u, i) =>
                    this.add.text(18 + i * 40 + 17, 78, u.badge, {
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '9px',
                        fontStyle: 'bold',
                        color: '#64748b'
                    }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(102)
                );

                this.bossBarTxt = this.add.text(480, 12, '', {
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '13px',
                    fontStyle: 'bold',
                    color: '#f43f5e',
                    stroke: '#020617',
                    strokeThickness: 4
                }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(102).setVisible(false);

                this.bannerTxt = this.add.text(480, 126, '', {
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '23px',
                    fontStyle: 'bold',
                    color: this.biomeAccentCss,
                    stroke: '#020617',
                    strokeThickness: 5
                }).setOrigin(0.5).setScrollFactor(0).setDepth(110).setAlpha(0);

                this.controlsHintTxt = this.add.text(480, 560, tr(
                    'A/D Yürü · W/Space Zıpla · S İniş · J/Tık Kılıç (Basılı=Yüklü) · E Pulse · K/SağTık Füze · L/Shift Atılma',
                    'A/D Move · W/Space Jump · S Drop · J/LMB Slash (Hold=Wave) · E Pulse · K/RMB Missile · L/Shift Dash'
                ), {
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '10px',
                    color: '#94a3b8',
                    backgroundColor: 'rgba(5,8,22,0.78)',
                    padding: { x: 10, y: 4 }
                }).setOrigin(0.5).setScrollFactor(0).setDepth(102);
            }

            showBanner(text, color) {
                if (!this.bannerTxt) return;
                this.bannerTxt.setText(text);
                this.bannerTxt.setColor(color || this.biomeAccentCss);
                this.bannerTxt.setAlpha(1);
                this.bannerTxt.setScale(0.92);
                this.tweens.killTweensOf(this.bannerTxt);
                this.tweens.add({
                    targets: this.bannerTxt,
                    alpha: { from: 1, to: 0 },
                    scale: { from: 0.92, to: 1.05 },
                    duration: 2150,
                    ease: 'Cubic.Out'
                });
            }

            spawnPopup(x, y, text, color) {
                const txt = this.add.text(x, y, text, {
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '12px',
                    fontStyle: 'bold',
                    color: color || '#38bdf8',
                    stroke: '#020617',
                    strokeThickness: 3
                }).setOrigin(0.5).setDepth(60);
                this.tweens.add({
                    targets: txt,
                    y: y - 34,
                    alpha: 0,
                    duration: 780,
                    onComplete: () => txt.destroy()
                });
            }

            // -----------------------------------------------------------------
            // Main Update Loop
            // -----------------------------------------------------------------
            update(time, delta) {
                if (syncPhaserPause(this, ctx, runtime.input) || this.ended) {
                    if (this._cosmicPaused) {
                        this.jCharging = false;
                        this.mouseCharging = false;
                        this.chargeTimer = 0;
                    }
                    return;
                }

                const dt = Math.min(delta, 50) / 1000;
                const inp = runtime.input;

                // Timers
                if (this.invulnTimer > 0) {
                    this.invulnTimer -= dt;
                    this.player.setAlpha(Math.floor(this.invulnTimer * 18) % 2 === 0 ? 0.45 : 1);
                } else if (this.dashTimer <= 0) {
                    this.player.setAlpha(1);
                }

                if (this.dashCooldown > 0) this.dashCooldown = Math.max(0, this.dashCooldown - dt);
                if (this.slashCooldown > 0) this.slashCooldown = Math.max(0, this.slashCooldown - dt);
                if (this.pulseCooldown > 0) this.pulseCooldown = Math.max(0, this.pulseCooldown - dt);
                if (this.missileCooldown > 0) this.missileCooldown = Math.max(0, this.missileCooldown - dt);
                if (this.pogoBounceLock > 0) this.pogoBounceLock = Math.max(0, this.pogoBounceLock - dt);
                if (this.wallJumpLockTimer > 0) this.wallJumpLockTimer = Math.max(0, this.wallJumpLockTimer - dt);

                if (this.comboResetTimer > 0) {
                    this.comboResetTimer -= dt;
                    if (this.comboResetTimer <= 0) {
                        this.comboStep = 0;
                        this.slashCombo = 0;
                    }
                }

                // Drop-through one-way platform timer
                if (this.dropThroughTimer > 0) {
                    this.dropThroughTimer -= dt;
                    if (this.dropThroughTimer <= 0) {
                        if (this.playerOneWayCollider) this.playerOneWayCollider.active = true;
                        if (this.playerMovingCollider) this.playerMovingCollider.active = true;
                    }
                }

                // Energy Shield regeneration (Phase Shield upgrade)
                if (this.upgrades.phase_shield && this.shieldPoints < 1) {
                    this.shieldRechargeTimer -= dt;
                    if (this.shieldRechargeTimer <= 0) {
                        this.shieldPoints = 1;
                        safePlay(ctx, 'powerup');
                        this.spawnPopup(this.player.x, this.player.y - 34, tr('KALKAN HAZIR!', 'SHIELD ONLINE!'), '#818cf8');
                    }
                }

                // Passive missile recharge (guaranteed anti-door-softlock)
                const regenRate = this.upgrades.spread_missile ? 2.1 : 2.8;
                if (this.missiles < this.maxMissiles) {
                    this.missileRegenTimer += dt;
                    if (this.missileRegenTimer >= regenRate) {
                        this.missileRegenTimer = 0;
                        this.missiles++;
                    }
                } else {
                    this.missileRegenTimer = 0;
                }

                this.updateMovingPlatforms(dt);
                this.handlePlayerMovement(dt, inp);
                this.handlePlayerCombat(dt, inp);
                this.updateProjectiles(dt);
                this.updateLaserHazards(dt);
                this.updateEnemies(dt);
                this.updateAcidSurfaceFx(dt);
                this.checkBossAndPortalTriggers(dt);
                this.revealFogAroundPlayer();
                this.drawPlayerAndHazardFx();
                this.drawEnemyHpBars();
                this.drawCanvasHudAndMinimap();
                this.syncExternalHud();

                inp.clearFrame();
            }

            // -----------------------------------------------------------------
            // Movement: Coyote Time, Jump Buffer, Variable Jump, Wall-Slide/Kick,
            // Drop-Through Platforms, Moving Platform Carry, Phase Dash
            // -----------------------------------------------------------------
            handlePlayerMovement(dt, inp) {
                const p = this.player;

                // Carry player smoothly if standing on a moving platform
                if (this.ridingPlatform && this.ridingPlatform.active) {
                    const dx = this.ridingPlatform.getData('dx') || 0;
                    const dy = this.ridingPlatform.getData('dy') || 0;
                    if (dx !== 0 && this.getTileAtWorld(p.x + dx + Math.sign(dx) * 14, p.y) !== '#') {
                        p.x += dx;
                    }
                    if (dy !== 0) {
                        p.y += dy;
                    }
                }
                this.ridingPlatform = null;

                const onFloor = p.body.blocked.down || p.body.touching.down;
                const onLeftWall = p.body.blocked.left;
                const onRightWall = p.body.blocked.right;

                if (onFloor) {
                    this.airJumpsLeft = this.maxAirJumps;
                    this.coyoteTimer = 0.13;
                    const footTile = this.getTileAtWorld(p.x, p.body.bottom + 8);
                    const leftFoot = this.getTileAtWorld(p.x - 20, p.body.bottom + 8);
                    const rightFoot = this.getTileAtWorld(p.x + 20, p.body.bottom + 8);
                    if ((footTile === '#' || footTile === '=') && leftFoot !== '~' && rightFoot !== '~') {
                        this.lastSafeX = p.x;
                        this.lastSafeY = p.y - 4;
                    }
                } else {
                    this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
                }

                // One-Way Platform Drop-Through (`S` / `ArrowDown` while standing on `=` or moving lift)
                if (onFloor && inp.consume('KeyS', 'ArrowDown', 's')) {
                    const belowTile = this.getTileAtWorld(p.x, p.body.bottom + 8);
                    const onSolidGround = belowTile === '#';
                    if (!onSolidGround && this.dropThroughTimer <= 0) {
                        this.dropThroughTimer = 0.22;
                        if (this.playerOneWayCollider) this.playerOneWayCollider.active = false;
                        if (this.playerMovingCollider) this.playerMovingCollider.active = false;
                        p.y += 4;
                        p.setVelocityY(Math.max(p.body.velocity.y, 115));
                    }
                }

                const moveLeft = inp.isDown('KeyA', 'ArrowLeft', 'a');
                const moveRight = inp.isDown('KeyD', 'ArrowRight', 'd');
                const moveDir = (moveRight ? 1 : 0) - (moveLeft ? 1 : 0);
                if (moveDir !== 0 && this.dashTimer <= 0 && this.wallJumpLockTimer <= 0) {
                    this.facing = moveDir;
                    p.setFlipX(this.facing < 0);
                }

                // Phase Dash [L / Shift]
                if (inp.consume('KeyL', 'ShiftLeft', 'ShiftRight', 'l') && this.dashCooldown <= 0) {
                    this.dashTimer = 0.17;
                    this.dashCooldown = (this.upgrades.phase_shield || this.upgrades.plasma_nova) ? 0.50 : 0.62;
                    this.invulnTimer = Math.max(this.invulnTimer, this.upgrades.phase_shield ? 0.38 : 0.29);
                    this.dashHitSet.clear();
                    p.body.setAllowGravity(false);
                    p.setVelocity(this.facing * 720, 0);
                    safePlay(ctx, 'dash');
                    this.spawnDashAfterimages();

                    if (this.upgrades.plasma_nova) {
                        this.triggerNovaDashShockwave();
                    }
                }

                if (this.dashTimer > 0) {
                    this.dashTimer -= dt;
                    if (this.upgrades.phase_shield || this.upgrades.plasma_nova) {
                        this.handlePhaseDashDamage();
                    }
                    if (this.dashTimer <= 0) {
                        p.body.setAllowGravity(true);
                        p.setVelocityX(this.facing * 235);
                    }
                    return;
                }

                // Wall-slide physics
                this.wallSliding = false;
                if (!onFloor && p.body.velocity.y > 0 && ((onLeftWall && moveLeft) || (onRightWall && moveRight))) {
                    this.wallSliding = true;
                    this.wallNormal = onLeftWall ? 1 : -1;
                    p.setVelocityY(Math.min(p.body.velocity.y, 130));
                    if (Math.random() < 0.35) {
                        this.sparkEmitter.setParticleTint(this.biomeAccentInt);
                        this.sparkEmitter.explode(1, p.x - this.wallNormal * 12, p.y + 8);
                    }
                }

                // Horizontal acceleration (with air boost if triple_jump unlocked)
                if (this.wallJumpLockTimer <= 0) {
                    const maxSpd = (!onFloor && this.upgrades.triple_jump) ? 330 : 300;
                    const targetVx = moveDir * maxSpd;
                    p.setVelocityX(lerp(p.body.velocity.x, targetVx, clamp(dt * 18, 0, 1)));
                }

                // Jump Buffering [W / Space / Up]
                if (inp.consume('KeyW', 'Space', 'ArrowUp', 'w')) {
                    this.jumpBufferTimer = 0.12;
                } else if (this.jumpBufferTimer > 0) {
                    this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt);
                }

                if (this.jumpBufferTimer > 0) {
                    if (this.wallSliding) {
                        this.jumpBufferTimer = 0;
                        p.setVelocityY(-525);
                        p.setVelocityX(this.wallNormal * 365);
                        this.facing = this.wallNormal;
                        p.setFlipX(this.facing < 0);
                        this.wallJumpLockTimer = 0.12;
                        this.airJumpsLeft = this.maxAirJumps;
                        safePlay(ctx, 'dash', 0.2);
                        this.sparkEmitter.setParticleTint(0x38bdf8);
                        this.sparkEmitter.explode(8, p.x, p.y + 12);
                    } else if (this.coyoteTimer > 0) {
                        this.jumpBufferTimer = 0;
                        this.coyoteTimer = 0;
                        p.setVelocityY(-530);
                        this.airJumpsLeft = this.maxAirJumps;
                        safePlay(ctx, 'uiClick');
                        this.sparkEmitter.setParticleTint(0x38bdf8);
                        this.sparkEmitter.explode(6, p.x, p.y + 18);
                    } else if (this.airJumpsLeft > 0) {
                        this.jumpBufferTimer = 0;
                        this.airJumpsLeft--;
                        p.setVelocityY(-490);
                        safePlay(ctx, 'dash', 0.25);
                        this.sparkEmitter.setParticleTint(this.upgrades.triple_jump ? 0x34d399 : 0x22d3ee);
                        this.sparkEmitter.explode(10, p.x, p.y + 18);
                    }
                }

                // Variable Jump Height: releasing jump key early cuts upward velocity
                const jumpHeld = inp.isDown('KeyW', 'Space', 'ArrowUp', 'w');
                if (this.wasJumpHeld && !jumpHeld && p.body.velocity.y < -85 && this.pogoBounceLock <= 0) {
                    p.setVelocityY(p.body.velocity.y * 0.52);
                }
                this.wasJumpHeld = jumpHeld;
            }

            spawnDashAfterimages() {
                const tintCol = this.upgrades.plasma_nova ? 0xf43f5e : (this.upgrades.phase_shield ? 0x818cf8 : 0x22d3ee);
                for (let i = 0; i < 4; i++) {
                    this.time.delayedCall(i * 35, () => {
                        if (!this.player || !this.player.active) return;
                        const ghost = this.add.image(this.player.x, this.player.y, 'emb_trooper')
                            .setDisplaySize(44, 48)
                            .setFlipX(this.facing < 0)
                            .setTint(tintCol)
                            .setAlpha(0.55)
                            .setDepth(11);
                        this.tweens.add({
                            targets: ghost,
                            alpha: 0,
                            duration: 210,
                            onComplete: () => ghost.destroy()
                        });
                    });
                }
            }

            handlePhaseDashDamage() {
                const pRect = new global.Phaser.Geom.Rectangle(this.player.x - 24, this.player.y - 26, 48, 52);
                const shockDmg = this.upgrades.plasma_nova ? 56 : 36;

                this.enemyBolts.getChildren().forEach((bolt) => {
                    if (bolt && bolt.active && global.Phaser.Geom.Rectangle.Overlaps(pRect, bolt.getBounds())) {
                        this.sparkEmitter.setParticleTint(0x818cf8);
                        this.sparkEmitter.explode(6, bolt.x, bolt.y);
                        bolt.destroy();
                        this.score += 15;
                    }
                });

                for (let i = 0; i < this.enemyList.length; i++) {
                    const en = this.enemyList[i];
                    if (!en || !en.active || this.dashHitSet.has(en)) continue;
                    if (global.Phaser.Geom.Rectangle.Overlaps(pRect, en.getBounds())) {
                        this.dashHitSet.add(en);
                        this.damageEnemy(en, shockDmg, this.facing * 220);
                        this.spawnPopup(en.x, en.y - 26, 'PHASE SHOCK!', '#818cf8');
                    }
                }
            }

            triggerNovaDashShockwave() {
                this.triggerNovaShockwave(this.player.x, this.player.y, 98, 52, 0xf43f5e, true);
            }

            triggerNovaShockwave(cx, cy, radius, dmg, tintColor, trackDashSet) {
                const ring = this.add.circle(cx, cy, 24, tintColor, 0.25).setStrokeStyle(3, 0x22d3ee, 0.95).setDepth(22);
                this.tweens.add({
                    targets: ring,
                    scale: Math.max(2.4, radius / 27),
                    alpha: 0,
                    duration: 260,
                    onComplete: () => ring.destroy()
                });
                this.sparkEmitter.setParticleTint(tintColor);
                this.sparkEmitter.explode(16, cx, cy);
                for (let i = 0; i < this.enemyList.length; i++) {
                    const en = this.enemyList[i];
                    if (!en || !en.active) continue;
                    if (trackDashSet && this.dashHitSet.has(en)) continue;
                    if (global.Phaser.Math.Distance.Between(cx, cy, en.x, en.y) <= radius) {
                        if (trackDashSet) this.dashHitSet.add(en);
                        this.damageEnemy(en, dmg, (en.x >= cx ? 1 : -1) * 210);
                    }
                }
            }

            // -----------------------------------------------------------------
            // 3-Mode Plasma Combat: 3-Hit Sabre / Pogo / Charge Wave / Pulse / Missiles
            // -----------------------------------------------------------------
            handlePlayerCombat(dt, inp) {
                if (inp.consume('KeyJ', 'j')) {
                    this.beginChargeAttack(null);
                }

                const jHeld = inp.isDown('KeyJ', 'j') || this.mouseCharging;
                const chargeNeed = this.upgrades.charge_beam ? 0.32 : 0.45;
                if (this.jCharging) {
                    if (jHeld) {
                        this.chargeTimer += dt;
                        if (this.chargeTimer >= chargeNeed && !this.chargeReadyPlayed) {
                            this.chargeReadyPlayed = true;
                            safePlay(ctx, 'uiConfirm', 0.12);
                            this.sparkEmitter.setParticleTint(0x22d3ee);
                            this.sparkEmitter.explode(8, this.player.x, this.player.y);
                        }
                    } else {
                        this.releaseChargeAttack(null);
                    }
                }

                if (inp.consume('KeyE', 'e')) {
                    this.tryFirePulseShot(inp);
                }
                if (inp.consume('KeyK', 'k')) {
                    this.tryFireMissile(null);
                }
            }

            beginChargeAttack(pointer) {
                this.jCharging = true;
                this.chargeTimer = 0;
                this.chargeReadyPlayed = false;
                if (pointer) this.mouseCharging = true;
                this.tryPlasmaSlash(pointer);
            }

            releaseChargeAttack(pointer) {
                const chargeNeed = this.upgrades.charge_beam ? 0.32 : 0.45;
                const held = this.chargeTimer;
                this.jCharging = false;
                this.chargeTimer = 0;
                this.chargeReadyPlayed = false;
                if (held >= chargeNeed) {
                    this.fireChargedPlasmaWave(pointer);
                }
            }

            tryPlasmaSlash(pointer) {
                if (this.slashCooldown > 0) return;
                this.slashCooldown = 0.22;
                this.comboResetTimer = 0.85;
                safePlay(ctx, 'shootLaser', 0.14);

                const inp = runtime.input;
                const p = this.player;
                const onFloor = p.body.blocked.down || p.body.touching.down;
                const holdUp = inp.isDown('KeyW', 'ArrowUp', 'w');
                const holdDown = inp.isDown('KeyS', 'ArrowDown', 's');

                let slashDir = this.facing;
                if (pointer) {
                    const wp = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
                    slashDir = wp.x >= p.x ? 1 : -1;
                    this.facing = slashDir;
                    p.setFlipX(slashDir < 0);
                }

                let mode = 'side';
                if (!onFloor && holdDown) mode = 'down';
                else if (holdUp) mode = 'up';

                const step = this.comboStep;
                this.comboStep = (this.comboStep + 1) % 3;
                const novaBonus = this.upgrades.plasma_nova ? 1.35 : 1.0;
                const baseDmg = step === 2 ? 56 : (step === 1 ? 44 : 38);
                const dmg = Math.round(baseDmg * novaBonus);
                const reachScale = this.upgrades.plasma_nova ? 1.18 : 1.0;

                let sx = p.x + slashDir * 44 * reachScale;
                let sy = p.y - 2;
                let rw = 112 * reachScale;
                let rh = 96 * reachScale;
                let angle = 0;

                if (mode === 'up') {
                    sx = p.x;
                    sy = p.y - 46 * reachScale;
                    rw = 108 * reachScale;
                    rh = 96 * reachScale;
                    angle = -Math.PI * 0.5;
                } else if (mode === 'down') {
                    sx = p.x;
                    sy = p.y + 44 * reachScale;
                    rw = 108 * reachScale;
                    rh = 96 * reachScale;
                    angle = Math.PI * 0.5;
                }

                const arc = this.add.image(sx, sy, 'emb_slash_crescent')
                    .setDepth(20)
                    .setScale((step === 2 ? 1.12 : 0.96) * reachScale);
                if (mode === 'side') {
                    arc.setFlipX(slashDir < 0);
                    arc.setAngle(step === 1 ? -14 * slashDir : (step === 2 ? 10 * slashDir : 0));
                } else {
                    arc.setRotation(angle);
                }
                if (this.upgrades.plasma_nova) arc.setTint(0xf472b6);
                else if (step === 2) arc.setTint(0x22d3ee);

                this.tweens.add({
                    targets: arc,
                    alpha: 0,
                    scaleX: arc.scaleX * 1.16,
                    scaleY: arc.scaleY * 1.08,
                    duration: 160,
                    onComplete: () => arc.destroy()
                });

                const slashRect = new global.Phaser.Geom.Rectangle(sx - rw * 0.5, sy - rh * 0.5, rw, rh);
                let hitSomething = false;
                let pogoBounce = false;

                for (let i = 0; i < this.enemyList.length; i++) {
                    const en = this.enemyList[i];
                    if (!en || !en.active) continue;
                    if (global.Phaser.Geom.Rectangle.Overlaps(slashRect, en.getBounds())) {
                        hitSomething = true;
                        pogoBounce = true;
                        const knock = mode === 'side' ? slashDir * (step === 2 ? 250 : 185) : 0;
                        this.damageEnemy(en, dmg, knock);
                    }
                }

                this.reactors.getChildren().forEach((rec) => {
                    if (rec.active && global.Phaser.Geom.Rectangle.Overlaps(slashRect, rec.getBounds())) {
                        hitSomething = true;
                        pogoBounce = true;
                        this.onHitReactor(rec, Math.round(36 * novaBonus));
                    }
                });

                this.crates.getChildren().forEach((crate) => {
                    if (crate.active && global.Phaser.Geom.Rectangle.Overlaps(slashRect, crate.getBounds())) {
                        hitSomething = true;
                        pogoBounce = true;
                        this.damageCrate(crate, 1);
                    }
                });

                this.barrels.getChildren().forEach((barrel) => {
                    if (barrel.active && global.Phaser.Geom.Rectangle.Overlaps(slashRect, barrel.getBounds())) {
                        hitSomething = true;
                        pogoBounce = true;
                        this.primeBarrel(barrel, false);
                    }
                });

                // Slashing a closed Shield Door sparks & shows helpful non-softlock hint
                for (let i = 0; i < this.doorRefs.length; i++) {
                    const door = this.doorRefs[i];
                    if (door && door.active && global.Phaser.Geom.Rectangle.Overlaps(slashRect, door.getBounds())) {
                        safePlay(ctx, 'hitShield', 0.15);
                        this.sparkEmitter.setParticleTint(0xf59e0b);
                        this.sparkEmitter.explode(8, door.x, p.y);
                        this.spawnPopup(
                            door.x,
                            p.y - 42,
                            tr('FÜZE [K] veya YÜKLÜ ATIŞ [Basılı J]!', 'MISSILE [K] or CHARGED SHOT [Hold J]!'),
                            '#fbbf24'
                        );
                        break;
                    }
                }

                // Deflect Enemy Bolts back as friendly piercing bolts!
                this.enemyBolts.getChildren().forEach((bolt) => {
                    if (!bolt.active) return;
                    if (global.Phaser.Geom.Rectangle.Overlaps(slashRect, bolt.getBounds())) {
                        hitSomething = true;
                        this.deflectEnemyBolt(bolt, pointer);
                    }
                });

                // Slash neutralizes airborne toxic acid blobs
                this.acidBlobs.getChildren().forEach((blob) => {
                    if (!blob.active) return;
                    if (global.Phaser.Geom.Rectangle.Overlaps(slashRect, blob.getBounds())) {
                        this.sparkEmitter.setParticleTint(0x4ade80);
                        this.sparkEmitter.explode(7, blob.x, blob.y);
                        blob.destroy();
                        this.score += 10;
                    }
                });

                // Hollow-Knight-style Down-Pogo Bounce
                if (mode === 'down' && pogoBounce) {
                    p.setVelocityY(-470);
                    this.pogoBounceLock = 0.14;
                    this.airJumpsLeft = this.maxAirJumps;
                    this.sparkEmitter.setParticleTint(0x22d3ee);
                    this.sparkEmitter.explode(10, p.x, p.y + 20);
                }

                if (hitSomething) {
                    this.slashCombo++;
                    if (this.slashCombo % 3 === 0 && this.missiles < this.maxMissiles) {
                        this.missiles++;
                        this.spawnPopup(p.x, p.y - 38, '+1 MISSILE', '#fbbf24');
                    }
                    this.cameras.main.shake(65, 0.004);
                }

                if (this.upgrades.plasma_nova && step === 2) {
                    this.triggerNovaShockwave(sx, sy, 92, 40, 0xc084fc, false);
                }
            }

            deflectEnemyBolt(bolt, pointer) {
                const bx = bolt.x;
                const by = bolt.y;
                const oldVx = bolt.body ? bolt.body.velocity.x : 0;
                const oldVy = bolt.body ? bolt.body.velocity.y : 0;
                bolt.destroy();

                let ang = Math.atan2(-oldVy, -oldVx);
                if (pointer) {
                    const wp = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
                    ang = Math.atan2(wp.y - by, wp.x - bx);
                } else {
                    const nearest = this.findNearestEnemy(bx, by, 440);
                    if (nearest) ang = Math.atan2(nearest.y - by, nearest.x - bx);
                }

                const refl = this.playerBolts.create(bx, by, 'emb_pulse_shot').setDepth(19);
                refl.body.setAllowGravity(false);
                refl.setTint(0x22d3ee);
                refl.setScale(1.25);
                refl.setRotation(ang);
                refl.setData({
                    kind: 'deflect',
                    dmg: 44,
                    pierce: true,
                    hitSet: new Set(),
                    life: 1.6
                });
                this.physics.velocityFromRotation(ang, 560, refl.body.velocity);

                safePlay(ctx, 'hitShield', 0.15);
                this.sparkEmitter.setParticleTint(0x22d3ee);
                this.sparkEmitter.explode(9, bx, by);
                this.score += 25;
                this.spawnPopup(bx, by - 16, 'DEFLECT! +25', '#22d3ee');
            }

            fireChargedPlasmaWave(pointer) {
                const p = this.player;
                let ang = this.facing > 0 ? 0 : Math.PI;
                if (pointer) {
                    const wp = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
                    ang = Math.atan2(wp.y - p.y, wp.x - p.x);
                    this.facing = Math.cos(ang) >= 0 ? 1 : -1;
                    p.setFlipX(this.facing < 0);
                }

                const boosted = Boolean(this.upgrades.charge_beam || this.upgrades.plasma_nova);
                const wave = this.playerBolts.create(
                    p.x + Math.cos(ang) * 28,
                    p.y - 2 + Math.sin(ang) * 20,
                    'emb_charged_wave'
                ).setDepth(20);
                wave.body.setAllowGravity(false);
                wave.setRotation(ang);
                if (boosted) {
                    wave.setScale(1.38);
                    wave.setTint(this.upgrades.plasma_nova ? 0xf472b6 : 0x67e8f9);
                }
                setWorldBody(wave, boosted ? 44 : 34, boosted ? 78 : 58);

                const dmg = this.upgrades.charge_beam ? 115 : (this.upgrades.plasma_nova ? 98 : 80);
                wave.setData({
                    kind: 'charged',
                    dmg,
                    pierce: true,
                    hitSet: new Set(),
                    life: 1.5
                });
                this.physics.velocityFromRotation(ang, 680, wave.body.velocity);

                safePlay(ctx, 'shootPlasma', 0.08);
                this.cameras.main.shake(95, 0.005);
                this.sparkEmitter.setParticleTint(0x22d3ee);
                this.sparkEmitter.explode(14, wave.x, wave.y);
            }

            tryFirePulseShot(inp) {
                if (this.pulseCooldown > 0) return;
                this.pulseCooldown = 0.19;
                const p = this.player;

                const holdUp = inp.isDown('KeyW', 'ArrowUp', 'w');
                const moveLeft = inp.isDown('KeyA', 'ArrowLeft', 'a');
                const moveRight = inp.isDown('KeyD', 'ArrowRight', 'd');
                let ang = this.facing > 0 ? 0 : Math.PI;
                if (holdUp) {
                    if (moveRight) ang = -Math.PI * 0.25;
                    else if (moveLeft) ang = -Math.PI * 0.75;
                    else ang = -Math.PI * 0.5;
                }

                const sx = p.x + Math.cos(ang) * 22;
                const sy = p.y - 4 + Math.sin(ang) * 18;
                const shot = this.playerBolts.create(sx, sy, 'emb_pulse_shot').setDepth(18);
                shot.body.setAllowGravity(false);
                shot.setRotation(ang);
                const dmg = this.upgrades.charge_beam ? 32 : 22;
                shot.setData({
                    kind: 'pulse',
                    dmg,
                    pierce: false,
                    hitSet: new Set(),
                    life: 1.15
                });
                this.physics.velocityFromRotation(ang, 650, shot.body.velocity);

                safePlay(ctx, 'shootLaser', 0.18);
            }

            tryFireMissile(pointer) {
                if (this.missileCooldown > 0) return;
                if (this.missiles <= 0) {
                    this.spawnPopup(this.player.x, this.player.y - 32, tr('FÜZE DOLUYOR... [Basılı J]', 'RECHARGING... [Hold J]'), '#f59e0b');
                    return;
                }
                this.missiles--;
                this.missileCooldown = 0.34;
                safePlay(ctx, 'shootMissile', 0.1);

                let aimAngle = this.facing > 0 ? 0 : Math.PI;
                if (pointer) {
                    const wp = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
                    aimAngle = Math.atan2(wp.y - this.player.y, wp.x - this.player.x);
                    this.facing = Math.cos(aimAngle) >= 0 ? 1 : -1;
                    this.player.setFlipX(this.facing < 0);
                }

                const offsets = this.upgrades.spread_missile ? [-0.22, 0, 0.22] : [0];
                for (let i = 0; i < offsets.length; i++) {
                    const ang = aimAngle + offsets[i];
                    const msl = this.playerMissiles.create(
                        this.player.x + Math.cos(ang) * 24,
                        this.player.y - 4 + Math.sin(ang) * 12,
                        'emb_missile'
                    ).setDepth(18);
                    msl.body.setAllowGravity(false);
                    msl.setRotation(ang);
                    msl.setData('life', 2.4);
                    msl.setData('speed', 445);
                    this.physics.velocityFromRotation(ang, 445, msl.body.velocity);
                }
            }

            // -----------------------------------------------------------------
            // Projectiles Update & Collisions
            // -----------------------------------------------------------------
            updateProjectiles(dt) {
                // Player Bolts
                this.playerBolts.getChildren().forEach((b) => {
                    if (!b || !b.active) return;
                    const life = (b.getData('life') || 0) - dt;
                    if (life <= 0 || b.x < 0 || b.x > this.worldW || b.y < 0 || b.y > this.worldH) {
                        b.destroy();
                        return;
                    }
                    b.setData('life', life);
                    if (b.getData('kind') === 'charged' && Math.random() < 0.55) {
                        this.sparkEmitter.setParticleTint(0x22d3ee);
                        this.sparkEmitter.explode(1, b.x, b.y);
                    }
                });

                // Player Homing Missiles
                this.playerMissiles.getChildren().forEach((msl) => {
                    if (!msl || !msl.active) return;
                    const life = (msl.getData('life') || 0) - dt;
                    if (life <= 0 || msl.x < 0 || msl.x > this.worldW || msl.y < 0 || msl.y > this.worldH) {
                        msl.destroy();
                        return;
                    }
                    msl.setData('life', life);

                    let bestTarget = this.findNearestEnemy(msl.x, msl.y, 440);
                    if (!bestTarget) {
                        let bestD = 440;
                        this.reactors.getChildren().forEach((rec) => {
                            if (!rec.active) return;
                            const d = global.Phaser.Math.Distance.Between(msl.x, msl.y, rec.x, rec.y);
                            if (d < bestD) { bestD = d; bestTarget = rec; }
                        });
                    }
                    if (!bestTarget) {
                        let bestD = 420;
                        for (let i = 0; i < this.doorRefs.length; i++) {
                            const dr = this.doorRefs[i];
                            if (!dr || !dr.active) continue;
                            const d = global.Phaser.Math.Distance.Between(msl.x, msl.y, dr.x, dr.y);
                            if (d < bestD) { bestD = d; bestTarget = dr; }
                        }
                    }

                    if (bestTarget) {
                        const desired = Math.atan2(bestTarget.y - msl.y, bestTarget.x - msl.x);
                        const cur = msl.rotation;
                        const nextAng = cur + wrapAngle(desired - cur) * clamp(dt * 7.8, 0, 1);
                        msl.setRotation(nextAng);
                        this.physics.velocityFromRotation(nextAng, msl.getData('speed') || 445, msl.body.velocity);
                    }

                    if (Math.random() < 0.65) {
                        this.sparkEmitter.setParticleTint(0xf59e0b);
                        this.sparkEmitter.explode(1, msl.x, msl.y);
                    }
                });

                // Enemy Bolts & Acid Blobs lifespan cleanup
                this.enemyBolts.getChildren().forEach((eb) => {
                    if (!eb || !eb.active) return;
                    const life = (eb.getData('life') || 0) - dt;
                    if (life <= 0 || eb.x < 0 || eb.x > this.worldW || eb.y < 0 || eb.y > this.worldH) {
                        eb.destroy();
                        return;
                    }
                    eb.setData('life', life);
                });

                this.acidBlobs.getChildren().forEach((blob) => {
                    if (!blob || !blob.active) return;
                    const life = (blob.getData('life') || 0) - dt;
                    if (life <= 0 || blob.x < 0 || blob.x > this.worldW || blob.y > this.worldH) {
                        blob.destroy();
                        return;
                    }
                    blob.setData('life', life);
                });
            }

            onEnemyBoltHitWall(bolt) {
                if (!bolt || !bolt.active) return;
                this.sparkEmitter.setParticleTint(0xfb7185);
                this.sparkEmitter.explode(5, bolt.x, bolt.y);
                bolt.destroy();
            }

            splashAcidBlob(blob) {
                if (!blob || !blob.active) return;
                const bx = blob.x;
                const by = blob.y;
                blob.destroy();
                this.acidBubbleEmitter.explode(10, bx, by);
                if (this.player && global.Phaser.Math.Distance.Between(bx, by, this.player.x, this.player.y) <= 44) {
                    this.damagePlayer(1);
                }
            }

            onPlayerBoltHitSolid(bolt) {
                if (!bolt || !bolt.active) return;
                this.sparkEmitter.setParticleTint(bolt.getData('kind') === 'charged' ? 0x22d3ee : 0x38bdf8);
                this.sparkEmitter.explode(bolt.getData('kind') === 'charged' ? 14 : 6, bolt.x, bolt.y);
                bolt.destroy();
            }

            onPlayerBoltHitDoor(bolt, door) {
                if (!bolt || !bolt.active || !door || !door.active) return;
                const kind = bolt.getData('kind');
                if (kind === 'charged') {
                    this.breachDoor(door);
                    return;
                }

                // Rapid Pulse Shot breaches shield doors in 2 hits (zero softlock)
                bolt.destroy();
                if (kind === 'pulse') {
                    const hits = (door.getData('pulseHits') || 0) + 1;
                    door.setData('pulseHits', hits);
                    safePlay(ctx, 'hitShield', 0.12);
                    this.sparkEmitter.setParticleTint(0x38bdf8);
                    this.sparkEmitter.explode(9, door.x, bolt.y);
                    if (hits >= 2) {
                        this.breachDoor(door);
                    } else {
                        door.setTint(0x38bdf8);
                        this.time.delayedCall(120, () => { if (door && door.active) door.clearTint(); });
                        this.spawnPopup(door.x, bolt.y - 16, tr('KAPI ZAYIFLADI 1/2', 'OVERRIDE 1/2'), '#38bdf8');
                    }
                }
            }

            onPlayerBoltHitEnemy(bolt, en) {
                if (!bolt || !bolt.active || !en || !en.active) return;
                const hitSet = bolt.getData('hitSet');
                if (hitSet && hitSet.has(en)) return;
                if (hitSet) hitSet.add(en);

                const kind = bolt.getData('kind');
                const dmg = bolt.getData('dmg') || 22;
                const dir = (bolt.body && bolt.body.velocity.x >= 0) ? 1 : -1;
                const knock = kind === 'charged' ? dir * 240 : dir * 90;

                if (kind === 'charged' && (en.getData('kind') === 'mech' || en.getData('kind') === 'commando')) {
                    en.setData('stunTimer', Math.max(en.getData('stunTimer') || 0, 1.0));
                }

                this.damageEnemy(en, dmg, knock);
                if (!bolt.getData('pierce')) {
                    this.sparkEmitter.setParticleTint(0x38bdf8);
                    this.sparkEmitter.explode(6, bolt.x, bolt.y);
                    bolt.destroy();
                } else {
                    this.sparkEmitter.setParticleTint(0x22d3ee);
                    this.sparkEmitter.explode(8, en.x, en.y);
                }
            }

            onPlayerBoltHitReactor(bolt, rec) {
                if (!bolt || !bolt.active || !rec || !rec.active) return;
                const hitSet = bolt.getData('hitSet');
                if (hitSet && hitSet.has(rec)) return;
                if (hitSet) hitSet.add(rec);

                this.onHitReactor(rec, bolt.getData('dmg') || 22);
                if (!bolt.getData('pierce')) bolt.destroy();
            }

            onPlayerBoltHitCrate(bolt, crate) {
                if (!bolt || !bolt.active || !crate || !crate.active) return;
                const hitSet = bolt.getData('hitSet');
                if (hitSet && hitSet.has(crate)) return;
                if (hitSet) hitSet.add(crate);

                const kind = bolt.getData('kind');
                this.damageCrate(crate, kind === 'charged' ? 2 : 1);
                if (!bolt.getData('pierce')) bolt.destroy();
            }

            onPlayerBoltHitBarrel(bolt, barrel) {
                if (!bolt || !bolt.active || !barrel || !barrel.active) return;
                const kind = bolt.getData('kind');
                this.primeBarrel(barrel, kind === 'charged');
                if (!bolt.getData('pierce')) bolt.destroy();
            }

            onMissileHitDoor(msl, door) {
                if (!msl || !msl.active || !door || !door.active) return;
                this.detonateMissile(msl, null);
                this.breachDoor(door);
            }

            onMissileHitReactor(msl, rec) {
                this.detonateMissile(msl, null);
                this.onHitReactor(rec, 55);
            }

            onMissileHitCrate(msl, crate) {
                this.detonateMissile(msl, null);
                this.damageCrate(crate, 2);
            }

            onMissileHitBarrel(msl, barrel) {
                this.detonateMissile(msl, null);
                this.primeBarrel(barrel, true);
            }

            breachDoor(door) {
                if (!door || !door.active) return;
                const cells = door.getData('cells') || [];
                for (let i = 0; i < cells.length; i++) {
                    const cell = cells[i];
                    if (this.liveGrid[cell.r] && this.liveGrid[cell.r][cell.c] !== undefined) {
                        this.liveGrid[cell.r][cell.c] = '.';
                    }
                }
                safePlay(ctx, 'explodeBoss');
                this.cameras.main.shake(150, 0.01);
                this.sparkEmitter.setParticleTint(0xfbbf24);
                this.sparkEmitter.explode(24, door.x, door.y);
                this.score += 150;
                this.spawnPopup(door.x, door.y - 20, tr('KAPI KIRILDI +150', 'DOOR BREACHED +150'), '#fbbf24');
                door.destroy();
            }

            detonateMissile(msl, directEnemy) {
                if (!msl || !msl.active) return;
                const mx = msl.x;
                const my = msl.y;
                msl.destroy();
                safePlay(ctx, 'explodeSmall');
                this.sparkEmitter.setParticleTint(0xf59e0b);
                this.sparkEmitter.explode(18, mx, my);

                for (let i = 0; i < this.enemyList.length; i++) {
                    const en = this.enemyList[i];
                    if (!en || !en.active) continue;
                    const d = global.Phaser.Math.Distance.Between(mx, my, en.x, en.y);
                    if (en === directEnemy || d <= 78) {
                        const dmg = en === directEnemy ? 80 : 46;
                        const k = en.getData('kind');
                        if (k === 'mech' || k === 'commando' || k === 'boss') {
                            en.setData('stunTimer', k === 'boss' ? 0.65 : 2.1);
                            this.spawnPopup(en.x, en.y - 38, tr('SERSEMLEDİ!', 'STUNNED!'), '#22d3ee');
                        }
                        this.damageEnemy(en, dmg, (en.x >= mx ? 1 : -1) * 165);
                    }
                }
            }

            // -----------------------------------------------------------------
            // Crates, Explosive Barrels (110px Chain Detonation) & Reactors
            // -----------------------------------------------------------------
            damageCrate(crate, hits) {
                if (!crate || !crate.active) return;
                const hp = (crate.getData('hp') || 2) - hits;
                crate.setData('hp', hp);
                crate.setTint(0xffffff);
                this.time.delayedCall(80, () => { if (crate && crate.active) crate.clearTint(); });
                safePlay(ctx, 'hitMetal', 0.16);
                this.sparkEmitter.setParticleTint(0xf59e0b);
                this.sparkEmitter.explode(8, crate.x, crate.y);

                if (hp <= 0) {
                    const cx = crate.x;
                    const cy = crate.y;
                    crate.destroy();
                    const crateProps = (getData().props && getData().props.crate) || DEFAULT_PROPS.crate;
                    this.score += Number(crateProps.score) || 35;
                    safePlay(ctx, 'explodeSmall', 0.15);
                    this.sparkEmitter.setParticleTint(0xfbbf24);
                    this.sparkEmitter.explode(16, cx, cy);
                    const roll = Math.random();
                    if (roll < 0.38) this.spawnPickup(cx, cy, 'hp');
                    else if (roll < 0.78) this.spawnPickup(cx, cy, 'missile');
                    else this.spawnPickup(cx, cy, 'prism');
                }
            }

            primeBarrel(barrel, instant) {
                if (!barrel || !barrel.active || barrel.getData('exploded')) return;
                if (instant) {
                    this.detonateBarrel(barrel);
                    return;
                }
                if (barrel.getData('primed')) return;
                barrel.setData('primed', true);
                barrel.setTint(0xffedd5);
                safePlay(ctx, 'hitMetal', 0.2);
                this.time.delayedCall(95, () => {
                    this.detonateBarrel(barrel);
                });
            }

            detonateBarrel(barrel) {
                if (!barrel || !barrel.active || barrel.getData('exploded')) return;
                barrel.setData('exploded', true);
                const bx = barrel.x;
                const by = barrel.y;
                barrel.destroy();

                const bProps = (getData().props && getData().props.barrel) || DEFAULT_PROPS.barrel;
                const radius = Number(bProps.blastRadius) || 120;
                const blastDmg = Number(bProps.blastDamage) || 95;
                this.score += Number(bProps.score) || 50;

                safePlay(ctx, 'explodeBoss', 0.15);
                this.cameras.main.shake(175, 0.011);
                this.sparkEmitter.setParticleTint(0xf59e0b);
                this.sparkEmitter.explode(30, bx, by);
                const blast = this.add.circle(bx, by, 26, 0xf59e0b, 0.34).setStrokeStyle(3, 0xf43f5e, 0.95).setDepth(24);
                this.tweens.add({
                    targets: blast,
                    scale: Math.max(3.8, radius / 26),
                    alpha: 0,
                    duration: 240,
                    onComplete: () => blast.destroy()
                });
                this.spawnPopup(bx, by - 24, 'PLASMA BLAST!', '#f59e0b');

                // AoE blasting enemies, crates, reactors, doors, and chaining barrels
                for (let i = this.enemyList.length - 1; i >= 0; i--) {
                    const en = this.enemyList[i];
                    if (!en || !en.active) continue;
                    if (global.Phaser.Math.Distance.Between(bx, by, en.x, en.y) <= radius) {
                        this.damageEnemy(en, blastDmg, (en.x >= bx ? 1 : -1) * 240);
                    }
                }
                this.crates.getChildren().forEach((c) => {
                    if (c.active && global.Phaser.Math.Distance.Between(bx, by, c.x, c.y) <= radius) {
                        this.damageCrate(c, 2);
                    }
                });
                this.reactors.getChildren().forEach((rec) => {
                    if (rec.active && global.Phaser.Math.Distance.Between(bx, by, rec.x, rec.y) <= radius) {
                        this.onHitReactor(rec, 65);
                    }
                });
                for (let i = 0; i < this.doorRefs.length; i++) {
                    const d = this.doorRefs[i];
                    if (d && d.active && global.Phaser.Math.Distance.Between(bx, by, d.x, d.y) <= radius) {
                        this.breachDoor(d);
                    }
                }
                for (let i = 0; i < this.barrelRefs.length; i++) {
                    const nb = this.barrelRefs[i];
                    if (nb && nb.active && !nb.getData('exploded') && global.Phaser.Math.Distance.Between(bx, by, nb.x, nb.y) <= radius) {
                        this.primeBarrel(nb, false);
                    }
                }
            }

            // -----------------------------------------------------------------
            // Timed Laser Hazards (L): Off -> Telegraph -> Beam
            // -----------------------------------------------------------------
            updateLaserHazards(dt) {
                const lProps = (getData().props && getData().props.laser) || DEFAULT_PROPS.laser;
                const offSec = Number(lProps.offSec) || 1.8;
                const warnSec = Number(lProps.warnSec) || 1.0;
                const activeSec = Number(lProps.activeSec) || 1.2;
                const cycle = Math.max(0.5, offSec + warnSec + activeSec);
                const dmg = Math.max(1, Number(lProps.damage) || 1);
                const maxRange = Math.max(this.worldW, this.worldH);

                for (let i = 0; i < this.laserHazards.length; i++) {
                    const h = this.laserHazards[i];
                    h.timer = (h.timer + dt) % cycle;
                    const state = h.timer < offSec ? 'off' : (h.timer < offSec + warnSec ? 'warn' : 'active');
                    h.state = state;

                    // Raycast endpoint dynamically so walls & closed doors block lasers
                    let ex = h.x;
                    let ey = h.y;
                    const step = 8;
                    for (let dist = 16; dist <= maxRange; dist += step) {
                        const tx = h.x + h.dx * dist;
                        const ty = h.y + h.dy * dist;
                        const tile = this.getLiveTileAtWorld(tx, ty);
                        if (tile === '#' || tile === 'D') {
                            break;
                        }
                        ex = tx;
                        ey = ty;
                    }
                    h.ex = ex;
                    h.ey = ey;

                    if (state === 'active' && this.player && this.player.active && this.dashTimer <= 0 && this.invulnTimer <= 0) {
                        const line = new global.Phaser.Geom.Line(h.x, h.y, ex, ey);
                        const pRect = this.player.getBounds();
                        if (global.Phaser.Geom.Intersects.LineToRectangle(line, pRect)) {
                            this.damagePlayer(dmg);
                        }
                    }
                }
            }

            // -----------------------------------------------------------------
            // Tile Queries & Line-of-Sight Checks
            // -----------------------------------------------------------------
            getTileAtWorld(wx, wy) {
                if (!this.sectorGrid) return '#';
                const c = Math.floor(wx / this.TILE);
                const r = Math.floor(wy / this.TILE);
                if (r < 0 || r >= this.gridRows || c < 0 || c >= this.gridCols) return '#';
                return this.sectorGrid[r][c];
            }

            getLiveTileAtWorld(wx, wy) {
                if (!this.liveGrid) return '#';
                const c = Math.floor(wx / this.TILE);
                const r = Math.floor(wy / this.TILE);
                if (r < 0 || r >= this.gridRows || c < 0 || c >= this.gridCols) return '#';
                return this.liveGrid[r][c];
            }

            hasLineOfSight(x1, y1, x2, y2) {
                if (!this.liveGrid) return false;
                const dist = Math.hypot(x2 - x1, y2 - y1);
                if (dist <= 4) return true;
                const stepLen = this.TILE * 0.45;
                const steps = Math.ceil(dist / stepLen);
                for (let i = 1; i < steps; i++) {
                    const t = i / steps;
                    const sx = x1 + (x2 - x1) * t;
                    const sy = y1 + (y2 - y1) * t;
                    const tile = this.getLiveTileAtWorld(sx, sy);
                    if (tile === '#' || tile === 'D') return false;
                }
                return true;
            }

            isAcidColumnBelow(wx, startY) {
                if (!this.sectorGrid) return false;
                const c = Math.floor(wx / this.TILE);
                if (c < 0 || c >= this.gridCols) return false;
                const startR = Math.max(0, Math.floor(startY / this.TILE));
                const endR = Math.min(this.gridRows - 1, startR + 5);
                for (let r = startR; r <= endR; r++) {
                    const ch = this.sectorGrid[r][c];
                    if (ch === '~') return true;
                    if (ch === '#') return false;
                }
                return false;
            }

            isSafeFloorAhead(en, dir) {
                if (!en || !en.body) return false;
                const probeX = en.x + dir * 24;
                const probeY = en.body.bottom + 14;
                const wallAhead = this.getLiveTileAtWorld(probeX, en.y);
                if (wallAhead === '#' || wallAhead === 'D') return false;
                const floorAhead = this.getTileAtWorld(probeX, probeY);
                if (floorAhead !== '#' && floorAhead !== '=') return false;
                const pitAhead = this.getTileAtWorld(probeX, en.body.bottom - 4);
                if (pitAhead === '~') return false;
                return true;
            }

            findNearestEnemy(x, y, maxDist) {
                let best = null;
                let bestD = maxDist;
                for (let i = 0; i < this.enemyList.length; i++) {
                    const en = this.enemyList[i];
                    if (!en || !en.active) continue;
                    const d = global.Phaser.Math.Distance.Between(x, y, en.x, en.y);
                    if (d < bestD) {
                        bestD = d;
                        best = en;
                    }
                }
                return best;
            }

            // -----------------------------------------------------------------
            // Enemy AI Updates (6 Archetypes + Multi-Phase Boss)
            // -----------------------------------------------------------------
            updateEnemies(dt) {
                for (let i = this.enemyList.length - 1; i >= 0; i--) {
                    const en = this.enemyList[i];
                    if (!en || !en.active) {
                        this.enemyList.splice(i, 1);
                        continue;
                    }
                    const kind = en.getData('kind');

                    // Acid dissolve ticks
                    let acidGrace = en.getData('acidGrace') || 0;
                    if (acidGrace > 0) {
                        acidGrace -= dt;
                        en.setData('acidGrace', acidGrace);
                        en.setTint(0x4ade80);
                        if (en.body && kind !== 'boss') {
                            en.setVelocityX(en.body.velocity.x * 0.88);
                        }
                        let tickT = (en.getData('acidTickTimer') || 0) - dt;
                        if (tickT <= 0) {
                            tickT = 0.09;
                            const maxHp = en.getData('maxHp') || 120;
                            const tickDmg = Math.max(16, Math.ceil((maxHp * 2.75) * 0.09));
                            this.damageEnemy(en, tickDmg, 0, { fromAcid: true });
                            if (!en.active) continue;
                            if (en.body && en.body.blocked.down) {
                                en.setVelocityY(-110);
                            }
                        }
                        en.setData('acidTickTimer', tickT);
                        if (acidGrace <= 0 && en.active) {
                            en.setData('inAcid', false);
                            en.clearTint();
                        }
                    }

                    const stun = en.getData('stunTimer') || 0;
                    if (stun > 0) {
                        en.setData('stunTimer', stun - dt);
                        if (acidGrace <= 0) en.setTint(0x38bdf8);
                        if (kind === 'drone') en.setVelocity(0, 0);
                        else if (kind !== 'boss' && kind !== 'turret') en.setVelocityX(0);
                        continue;
                    } else if (en.tintTopLeft === 0x38bdf8 && acidGrace <= 0) {
                        en.clearTint();
                    }

                    const dx = this.player.x - en.x;
                    const dy = this.player.y - en.y;
                    const dist = Math.hypot(dx, dy);
                    const onFloor = en.body ? (en.body.blocked.down || en.body.touching.down) : false;

                    if (kind === 'spider') {
                        this.updateSpiderAI(en, dt, dx, dy, dist, onFloor);
                    } else if (kind === 'mech') {
                        this.updateMechAI(en, dt, dx, dy, dist, onFloor);
                    } else if (kind === 'drone') {
                        this.updateDroneAI(en, dt, dx, dy, dist);
                    } else if (kind === 'turret') {
                        this.updateTurretAI(en, dt, dx, dy, dist);
                    } else if (kind === 'spitter') {
                        this.updateSpitterAI(en, dt, dx, dy, dist, onFloor);
                    } else if (kind === 'commando') {
                        this.updateCommandoAI(en, dt, dx, dy, dist, onFloor);
                    } else if (kind === 'boss') {
                        this.updateAegisBossAI(en, dt, dx, dy, dist, onFloor);
                    }
                }
            }

            updateGroundPatrol(en, dt, dx, dist, onFloor, aggroRange, baseSpd) {
                let dir = en.getData('dir') || -1;
                let ledgeT = Math.max(0, (en.getData('ledgeTurnTimer') || 0) - dt);
                let holdingAtEdge = false;

                if (en.body.blocked.left) { dir = 1; ledgeT = 0.55; }
                else if (en.body.blocked.right) { dir = -1; ledgeT = 0.55; }

                if (dist < aggroRange && ledgeT <= 0) {
                    const wantDir = dx >= 0 ? 1 : -1;
                    if (onFloor && !this.isSafeFloorAhead(en, wantDir)) {
                        dir = wantDir;
                        holdingAtEdge = true;
                    } else {
                        dir = wantDir;
                    }
                } else if (onFloor && !this.isSafeFloorAhead(en, dir)) {
                    dir = -dir;
                    ledgeT = 0.75;
                    if (!this.isSafeFloorAhead(en, dir)) holdingAtEdge = true;
                }

                en.setData('dir', dir);
                en.setData('ledgeTurnTimer', ledgeT);
                en.setVelocityX(holdingAtEdge ? 0 : dir * baseSpd);
                en.setFlipX(dir < 0);
                return { dir, holdingAtEdge };
            }

            updateSpiderAI(en, dt, dx, dy, dist, onFloor) {
                const spd = dist < 290 ? en.getData('speed') : en.getData('speed') * 0.68;
                const { dir, holdingAtEdge } = this.updateGroundPatrol(en, dt, dx, dist, onFloor, 290, spd);

                let hopT = (en.getData('hopTimer') || 0) - dt;
                if (hopT <= 0 && onFloor && dist < 250 && !holdingAtEdge) {
                    if (this.isSafeFloorAhead(en, dir) && !this.isAcidColumnBelow(en.x + dir * 42, en.body.bottom)) {
                        en.setVelocityY(-340);
                    }
                    hopT = 1.55;
                }
                en.setData('hopTimer', hopT);

                let fireT = (en.getData('fireTimer') || 0) - dt;
                if (fireT <= 0 && dist < 380 && this.hasLineOfSight(en.x, en.y, this.player.x, this.player.y)) {
                    fireT = Math.max(0.95, (en.getData('fireCd') || 2.1) / Math.min(1.6, this.difficultyMult));
                    this.fireEnemyBolt(en.x, en.y, Math.atan2(dy, dx), 255);
                }
                en.setData('fireTimer', fireT);
            }

            updateMechAI(en, dt, dx, dy, dist, onFloor) {
                const { dir } = this.updateGroundPatrol(en, dt, dx, dist, onFloor, 430, en.getData('speed') || 64);

                let fireT = (en.getData('fireTimer') || 0) - dt;
                if (fireT <= 0 && dist < 460 && this.hasLineOfSight(en.x, en.y - 6, this.player.x, this.player.y)) {
                    fireT = Math.max(0.9, (en.getData('fireCd') || 1.75) / Math.min(1.5, this.difficultyMult));
                    const baseA = Math.atan2(dy, dx);
                    this.fireEnemyBolt(en.x + dir * 18, en.y - 6, baseA, 295);
                    this.fireEnemyBolt(en.x + dir * 18, en.y - 6, baseA + (dx >= 0 ? -0.14 : 0.14), 275);
                }
                en.setData('fireTimer', fireT);
            }

            updateDroneAI(en, dt, dx, dy, dist) {
                let phase = (en.getData('hoverPhase') || 0) + dt * 3.2;
                en.setData('hoverPhase', phase);
                const spd = en.getData('speed') || 135;
                const hasLos = this.hasLineOfSight(en.x, en.y, this.player.x, this.player.y);

                if (dist < 480 && (hasLos || dist < 240)) {
                    const targetX = this.player.x + (dx >= 0 ? -115 : 115);
                    const targetY = this.player.y - 65 + Math.sin(phase) * 26;
                    const ax = clamp(targetX - en.x, -180, 180);
                    const ay = clamp(targetY - en.y, -150, 150);
                    const len = Math.max(1, Math.hypot(ax, ay));
                    en.setVelocity((ax / len) * spd, (ay / len) * spd);
                } else {
                    en.setVelocity(Math.cos(phase * 0.5) * 45, Math.sin(phase) * 38);
                }
                en.setFlipX(dx < 0);

                let fireT = (en.getData('fireTimer') || 0) - dt;
                if (fireT <= 0 && dist < 440 && hasLos) {
                    fireT = Math.max(0.95, (en.getData('fireCd') || 1.85) / Math.min(1.5, this.difficultyMult));
                    this.fireEnemyBolt(en.x, en.y + 4, Math.atan2(dy, dx), 285);
                }
                en.setData('fireTimer', fireT);
            }

            updateTurretAI(en, dt, dx, dy, dist) {
                en.setVelocity(0, 0);
                const hasLos = dist < 480 && this.hasLineOfSight(en.x, en.y, this.player.x, this.player.y);
                let teleT = en.getData('telegraphTimer') || 0;

                if (teleT > 0) {
                    teleT -= dt;
                    en.setData('telegraphTimer', teleT);
                    if (teleT <= 0) {
                        if (hasLos) {
                            const ang = en.getData('aimAngle');
                            this.fireEnemyBolt(en.x + Math.cos(ang) * 16, en.y + Math.sin(ang) * 16, ang, 385);
                            safePlay(ctx, 'shootLaser', 0.25);
                        }
                        en.setData('fireTimer', Math.max(1.1, (en.getData('fireCd') || 2.2) / Math.min(1.4, this.difficultyMult)));
                    }
                    return;
                }

                let fireT = (en.getData('fireTimer') || 0) - dt;
                if (fireT <= 0 && hasLos) {
                    en.setData('aimAngle', Math.atan2(dy, dx));
                    en.setData('telegraphTimer', 0.65);
                } else {
                    en.setData('fireTimer', fireT);
                }
            }

            updateSpitterAI(en, dt, dx, dy, dist, onFloor) {
                this.updateGroundPatrol(en, dt, dx, dist, onFloor, 380, en.getData('speed') || 82);

                let fireT = (en.getData('fireTimer') || 0) - dt;
                if (fireT <= 0 && dist < 460 && this.hasLineOfSight(en.x, en.y - 10, this.player.x, this.player.y - 10)) {
                    fireT = Math.max(1.2, (en.getData('fireCd') || 2.3) / Math.min(1.4, this.difficultyMult));
                    const blob = this.acidBlobs.create(en.x, en.y - 14, 'emb_acid_blob').setDepth(16);
                    blob.body.setAllowGravity(true);
                    blob.body.setCircle(5, 3, 3);
                    const flightT = clamp(dist / 320, 0.45, 0.95);
                    const vx = clamp(dx / flightT, -320, 320);
                    const vy = clamp((dy - 0.5 * 980 * flightT * flightT) / flightT, -560, -210);
                    blob.setVelocity(vx, vy);
                    blob.setData('life', 3.0);
                    safePlay(ctx, 'shootPlasma', 0.22);
                }
                en.setData('fireTimer', fireT);
            }

            updateCommandoAI(en, dt, dx, dy, dist, onFloor) {
                let dodgeCd = Math.max(0, (en.getData('dodgeCooldown') || 0) - dt);
                en.setData('dodgeCooldown', dodgeCd);

                const burstLeft = en.getData('burstLeft') || 0;
                if (burstLeft > 0) {
                    let bt = (en.getData('burstTimer') || 0) - dt;
                    if (bt <= 0) {
                        if (this.hasLineOfSight(en.x, en.y - 6, this.player.x, this.player.y)) {
                            this.fireEnemyBolt(en.x, en.y - 6, Math.atan2(dy, dx), 335);
                        }
                        en.setData('burstLeft', burstLeft - 1);
                        bt = 0.14;
                    }
                    en.setData('burstTimer', bt);
                }

                // Jetpack evade leap when player closes in
                if (dodgeCd <= 0 && onFloor && dist < 130) {
                    const awayDir = dx >= 0 ? -1 : 1;
                    if (this.isSafeFloorAhead(en, awayDir) || !this.isAcidColumnBelow(en.x + awayDir * 60, en.body.bottom)) {
                        en.setVelocity(awayDir * 240, -375);
                        en.setData('dodgeCooldown', 2.4);
                        this.sparkEmitter.setParticleTint(0xc084fc);
                        this.sparkEmitter.explode(8, en.x, en.y + 16);
                    }
                } else {
                    this.updateGroundPatrol(en, dt, dx, dist, onFloor, 460, en.getData('speed') || 155);
                }

                let fireT = (en.getData('fireTimer') || 0) - dt;
                if (fireT <= 0 && dist < 470 && this.hasLineOfSight(en.x, en.y - 6, this.player.x, this.player.y)) {
                    fireT = Math.max(1.0, (en.getData('fireCd') || 1.65) / Math.min(1.45, this.difficultyMult));
                    en.setData('burstLeft', 3);
                    en.setData('burstTimer', 0.02);
                }
                en.setData('fireTimer', fireT);
            }

            updateAegisBossAI(boss, dt, dx, dy, dist, onFloor) {
                const moveDir = dx >= 0 ? 1 : -1;
                boss.setFlipX(moveDir < 0);

                const hpRatio = (boss.getData('hp') || 0) / Math.max(1, boss.getData('maxHp') || 1);
                if (boss.getData('phase') === 1 && hpRatio <= 0.5) {
                    boss.setData('phase', 2);
                    boss.setTint(0xfb7185);
                    safePlay(ctx, 'bossAlarm');
                    this.cameras.main.shake(220, 0.012);
                    this.showBanner(tr('AEGIS ÖFKE MODU — FAZ II!', 'AEGIS ENRAGED — PHASE II!'), '#f43f5e');
                    // Shield recovery burst
                    for (let k = 0; k < 8; k++) {
                        this.fireEnemyBolt(boss.x, boss.y, (TAU / 8) * k, 240);
                    }
                }

                const phase = boss.getData('phase') || 1;
                const phaseSpeed = (boss.getData('speed') || 88) * (phase === 2 ? 1.32 : 1.0);
                const arena = (!this.endlessMode && this.sectorDef && this.sectorDef.bossArena) ? this.sectorDef.bossArena : null;
                const arenaMinX = arena ? (arena.minCol * this.TILE + 42) : 60;
                const arenaMaxX = arena ? (arena.maxCol * this.TILE - 42) : (this.worldW - 60);
                if (boss.x < arenaMinX) {
                    boss.x = arenaMinX;
                    if (boss.body && boss.body.velocity.x < 0) boss.setVelocityX(0);
                } else if (boss.x > arenaMaxX) {
                    boss.x = arenaMaxX;
                    if (boss.body && boss.body.velocity.x > 0) boss.setVelocityX(0);
                }
                if (!boss.getData('slamActive')) {
                    const safeMove = onFloor ? this.isSafeFloorAhead(boss, moveDir) : true;
                    const inBoundsDir = (moveDir < 0 && boss.x <= arenaMinX + 4) || (moveDir > 0 && boss.x >= arenaMaxX - 4);
                    boss.setVelocityX((safeMove && !inBoundsDir) ? moveDir * phaseSpeed : 0);
                }

                let aiT = (boss.getData('aiTimer') || 0) - dt;
                if (aiT <= 0) {
                    const pat = (boss.getData('patternIdx') || 0) % 4;
                    boss.setData('patternIdx', pat + 1);
                    const hasLos = this.hasLineOfSight(boss.x, boss.y - 12, this.player.x, this.player.y);

                    if (pat === 0) {
                        if (hasLos) {
                            const count = phase === 2 ? 3 : 2;
                            const baseA = Math.atan2(dy, dx);
                            for (let k = -count; k <= count; k++) {
                                this.fireEnemyBolt(boss.x, boss.y - 12, baseA + k * 0.17, 290 * Math.min(1.4, this.difficultyMult));
                            }
                            safePlay(ctx, 'shootPlasma');
                        }
                        aiT = Math.max(0.85, (phase === 2 ? 1.2 : 1.55) / Math.min(1.45, this.difficultyMult));
                    } else if (pat === 1) {
                        boss.setData('slamActive', true);
                        boss.setVelocity(moveDir * 235, -460);
                        this.time.delayedCall(680, () => {
                            if (!boss || !boss.active || this.ended) return;
                            boss.setData('slamActive', false);
                            safePlay(ctx, 'explodeSmall');
                            this.cameras.main.shake(135, 0.009);
                            this.fireEnemyBolt(boss.x - 26, boss.y + 38, Math.PI, 330);
                            this.fireEnemyBolt(boss.x + 26, boss.y + 38, 0, 330);
                            if (phase === 2) {
                                this.fireEnemyBolt(boss.x - 20, boss.y + 24, Math.PI + 0.25, 290);
                                this.fireEnemyBolt(boss.x + 20, boss.y + 24, -0.25, 290);
                            }
                        });
                        aiT = Math.max(1.1, (phase === 2 ? 1.45 : 1.85) / Math.min(1.4, this.difficultyMult));
                    } else if (pat === 2) {
                        if (this.enemyList.length < 5) {
                            const sx = clamp(boss.x + (Math.random() > 0.5 ? 84 : -84), 80, this.worldW - 80);
                            const sy = Math.max(80, boss.y - 70);
                            if (phase === 2) this.spawnHoverDrone(sx, sy);
                            else this.spawnSpiderBot(sx, sy);
                        }
                        for (let k = 0; k < (phase === 2 ? 8 : 6); k++) {
                            this.fireEnemyBolt(boss.x, boss.y, (TAU / (phase === 2 ? 8 : 6)) * k, 250);
                        }
                        aiT = Math.max(1.05, 1.75 / Math.min(1.4, this.difficultyMult));
                    } else {
                        // Phase-aware shield pulse + aimed burst
                        this.sparkEmitter.setParticleTint(0xa855f7);
                        this.sparkEmitter.explode(16, boss.x, boss.y);
                        if (hasLos) {
                            const baseA = Math.atan2(dy, dx);
                            this.fireEnemyBolt(boss.x, boss.y - 14, baseA, 345);
                            this.fireEnemyBolt(boss.x, boss.y - 14, baseA - 0.12, 320);
                            this.fireEnemyBolt(boss.x, boss.y - 14, baseA + 0.12, 320);
                        }
                        aiT = Math.max(0.9, 1.4 / Math.min(1.4, this.difficultyMult));
                    }
                }
                boss.setData('aiTimer', aiT);
            }

            fireEnemyBolt(x, y, angle, speed) {
                const b = this.enemyBolts.create(x, y, 'emb_bolt_enemy').setDepth(15);
                b.body.setAllowGravity(false);
                b.body.setCircle(4, 3, 3);
                b.setData('life', 2.8);
                this.physics.velocityFromRotation(angle, speed, b.body.velocity);
                return b;
            }

            // -----------------------------------------------------------------
            // Endless Breach Wave Spawner (Strictly Reachable Tiles)
            // -----------------------------------------------------------------
            spawnEndlessWave() {
                this.endlessWaveActive = true;
                const count = 4 + Math.min(6, this.endlessWave);
                const floorPool = this.endlessSafeFloorSpawns.filter((sp) =>
                    !this.player || Math.hypot(sp.x - this.player.x, sp.y - this.player.y) > 150
                );
                const activeFloors = floorPool.length >= 3 ? floorPool : this.endlessSafeFloorSpawns;

                const airPool = this.endlessSafeAirSpawns.filter((sp) =>
                    !this.player || Math.hypot(sp.x - this.player.x, sp.y - this.player.y) > 170
                );
                const activeAirs = airPool.length >= 2 ? airPool : this.endlessSafeAirSpawns;

                for (let i = 0; i < count; i++) {
                    const roll = (i + this.endlessWave) % 5;
                    if (roll === 2 && activeAirs.length > 0) {
                        const ap = activeAirs[(i * 7 + this.endlessWave * 3) % activeAirs.length];
                        this.spawnHoverDrone(ap.x, ap.y);
                        continue;
                    }
                    let sx = this.spawnPoint.x + 220;
                    let sy = this.spawnPoint.y;
                    if (activeFloors.length > 0) {
                        const stride = Math.max(1, Math.floor(activeFloors.length / count));
                        const pick = activeFloors[(i * stride + this.endlessWave * 5) % activeFloors.length];
                        sx = pick.x;
                        sy = pick.y;
                    }
                    if (roll === 1) this.spawnPatrolMech(sx, sy);
                    else if (roll === 3) this.spawnAcidSpitter(sx, sy);
                    else if (roll === 4 && this.endlessWave >= 2) this.spawnVoidCommando(sx, sy);
                    else this.spawnSpiderBot(sx, sy);
                }

                // Boss spawns on every 2nd wave of an arena
                if (this.endlessWave % this.wavesPerArena === 0) {
                    let bx = this.spawnPoint.x;
                    let by = this.spawnPoint.y;
                    if (activeFloors.length > 0) {
                        let bestD = -1;
                        for (let i = 0; i < activeFloors.length; i++) {
                            const d = Math.hypot(activeFloors[i].x - this.player.x, activeFloors[i].y - this.player.y);
                            if (d > bestD) { bestD = d; bx = activeFloors[i].x; by = activeFloors[i].y; }
                        }
                    }
                    this.bossSpawned = false;
                    this.spawnAegisBoss(bx, by - 24);
                }

                // Supply drops on validated safe floor tiles
                if (this.pickups.countActive(true) < 2 && activeFloors.length > 0) {
                    const p1 = activeFloors[0];
                    const p2 = activeFloors[Math.floor(activeFloors.length / 2)];
                    this.spawnPickup(p1.x, p1.y - 4, 'hp');
                    this.spawnPickup(p2.x, p2.y - 4, 'missile');
                }
            }

            // -----------------------------------------------------------------
            // Damage, Acid, Pickups, Upgrades, Reactor & Sector Progression
            // -----------------------------------------------------------------
            onEnemyHitAcid(en) {
                if (!en || !en.active || this.ended) return;
                const firstContact = !en.getData('inAcid');
                en.setData('inAcid', true);
                en.setData('acidGrace', 0.16);
                en.setTint(0x4ade80);

                if (firstContact) {
                    en.setData('acidTickTimer', 0.02);
                    if (en.body) {
                        en.setVelocity(en.body.velocity.x * 0.25, -140);
                    }
                    safePlay(ctx, 'hitMetal', 0.22);
                    if (this.acidBubbleEmitter) {
                        this.acidBubbleEmitter.explode(10, en.x, en.body ? en.body.bottom : en.y + 12);
                    }
                    this.spawnPopup(en.x, en.y - 26, tr('ASİT YANMASI!', 'ACID MELT!'), '#4ade80');
                }
            }

            damageEnemy(en, dmg, knockVx, opts) {
                if (!en || !en.active) return;
                const fromAcid = Boolean(opts && opts.fromAcid);
                const amount = Math.max(1, Math.round(dmg));
                const hp = (en.getData('hp') || 0) - amount;
                en.setData('hp', hp);

                if (fromAcid) {
                    en.setTint(0x4ade80);
                    this.acidBubbleEmitter.explode(4, en.x + (Math.random() - 0.5) * 16, en.y);
                } else {
                    en.setTint(0xffffff);
                    this.time.delayedCall(90, () => {
                        if (!en || !en.active) return;
                        if ((en.getData('acidGrace') || 0) > 0) en.setTint(0x4ade80);
                        else if ((en.getData('stunTimer') || 0) > 0) en.setTint(0x38bdf8);
                        else if (en.getData('kind') === 'boss' && en.getData('phase') === 2) en.setTint(0xfb7185);
                        else en.clearTint();
                    });
                    safePlay(ctx, 'hitMetal', 0.15);
                    const k = en.getData('kind');
                    if (k !== 'boss' && k !== 'turret' && en.body) {
                        en.setVelocityX(knockVx || 0);
                    }
                }

                const jx = (Math.random() - 0.5) * 20;
                const dmgColor = fromAcid ? '#4ade80' : (amount >= 65 ? '#fbbf24' : '#e0f2fe');
                this.spawnPopup(en.x + jx, en.y - 22, `-${amount}`, dmgColor);

                if (hp <= 0) {
                    const kind = en.getData('kind');
                    const pts = en.getData('baseScore') || 90;
                    const multPts = Math.round(pts * (this.endlessMode ? Math.min(2.5, this.difficultyMult) : 1));
                    this.score += multPts;
                    safePlay(ctx, kind === 'boss' ? 'explodeBoss' : 'explodeSmall');
                    if (fromAcid) this.acidBubbleEmitter.explode(18, en.x, en.y);
                    this.sparkEmitter.setParticleTint(fromAcid ? 0x4ade80 : (kind === 'boss' ? 0xa855f7 : 0xfb7185));
                    this.sparkEmitter.explode(kind === 'boss' ? 46 : 18, en.x, en.y);
                    this.spawnPopup(en.x, en.y - 34, `+${multPts}`, '#34d399');

                    const idx = this.enemyList.indexOf(en);
                    if (idx >= 0) this.enemyList.splice(idx, 1);

                    if (kind === 'boss') {
                        this.onBossKilled();
                    } else if (Math.random() < 0.36 && this.missiles < this.maxMissiles) {
                        this.missiles++;
                    }
                    en.destroy();
                }
            }

            onHitReactor(rec, dmg) {
                if (!rec || !rec.active) return;
                const hp = (rec.getData('hp') || 0) - dmg;
                rec.setData('hp', hp);
                rec.setTint(0xffffff);
                this.time.delayedCall(90, () => { if (rec && rec.active) rec.clearTint(); });
                safePlay(ctx, 'hitShield', 0.12);
                this.sparkEmitter.setParticleTint(0x22d3ee);
                this.sparkEmitter.explode(10, rec.x, rec.y);

                if (hp <= 0) {
                    this.reactorsAlive = Math.max(0, this.reactorsAlive - 1);
                    const recProps = (getData().props && getData().props.reactor) || DEFAULT_PROPS.reactor;
                    const recScore = Number(recProps.score) || 350;
                    this.score += recScore;
                    safePlay(ctx, 'explodeBoss');
                    this.cameras.main.shake(220, 0.012);
                    this.sparkEmitter.setParticleTint(0x34d399);
                    this.sparkEmitter.explode(36, rec.x, rec.y);
                    this.spawnPopup(rec.x, rec.y - 24, tr(`ÇEKİRDEK İMHA +${recScore}`, `REACTOR SHATTERED +${recScore}`), '#34d399');
                    rec.destroy();
                    this.tryUnlockPortal();
                }
            }

            tryUnlockPortal(silent) {
                if (this.portalUnlocked) return;
                if (this.reactorsAlive > 0) return;
                if (this.bossPresentInSector && !this.bossDefeated) return;
                this.unlockExtractionPortal(silent);
            }

            unlockExtractionPortal(silent) {
                this.portalUnlocked = true;
                if (this.portalObj) {
                    this.portalObj.setAlpha(1);
                    this.tweens.add({
                        targets: this.portalObj,
                        scaleX: { from: this.portalObj.scaleX * 0.94, to: this.portalObj.scaleX * 1.12 },
                        scaleY: { from: this.portalObj.scaleY * 0.94, to: this.portalObj.scaleY * 1.12 },
                        yoyo: true,
                        repeat: -1,
                        duration: 600
                    });
                }
                if (!silent) {
                    safePlay(ctx, 'levelup');
                    this.showBanner(tr('GEÇİT AÇILDI — ÇIKIŞA ULAŞ!', 'EXTRACTION PORTAL OPEN!'), '#34d399');
                }
            }

            onBossKilled() {
                this.bossDefeated = true;
                this.activeBoss = null;
                this.cameras.main.shake(280, 0.016);
                if (this.endlessMode) {
                    this.lives = Math.min(this.maxLives, this.lives + 1);
                    this.missiles = this.maxMissiles;
                    this.showBanner(`AEGIS COLOSSUS SHATTERED!`, '#34d399');
                } else {
                    this.tryUnlockPortal(false);
                }
            }

            collectPickup(item) {
                if (!item || !item.active) return;
                const kind = item.getData('kind');
                item.destroy();
                safePlay(ctx, 'powerup');
                if (kind === 'hp') {
                    this.lives = Math.min(this.maxLives, this.lives + 1);
                    this.score += 50;
                    this.spawnPopup(this.player.x, this.player.y - 30, '+1 HULL', '#34d399');
                } else if (kind === 'missile') {
                    this.missiles = Math.min(this.maxMissiles, this.missiles + 2);
                    this.score += 75;
                    this.spawnPopup(this.player.x, this.player.y - 30, '+2 MISSILES', '#fbbf24');
                } else {
                    this.score += 120;
                    this.spawnPopup(this.player.x, this.player.y - 30, '+120 PRISM', '#38bdf8');
                }
            }

            collectUpgradePod(pod) {
                if (!pod || !pod.active) return;
                const uid = pod.getData('upgradeId');
                const px = pod.x;
                const py = pod.y;
                pod.destroy();

                safePlay(ctx, 'levelup');
                this.cameras.main.shake(110, 0.005);

                const exo = getData();
                const spec = (exo.upgrades && exo.upgrades[uid]) || DEFAULT_UPGRADES[uid];
                if (spec && uid && !this.upgrades[uid]) {
                    this.upgrades[uid] = true;
                    this.applyUpgradeEffect(uid);
                    const colCss = toCssColor(spec.color, '#22d3ee');
                    this.sparkEmitter.setParticleTint(toColorInt(spec.color, 0x22d3ee));
                    this.sparkEmitter.explode(28, px, py);
                    const title = pickText(tr, spec.title, uid);
                    const desc = pickText(tr, spec.desc, '');
                    this.showBanner(`${title}!`, colCss);
                    this.spawnPopup(px, py - 24, desc || title, colCss);
                } else {
                    this.lives = Math.min(this.maxLives, this.lives + 1);
                    this.missiles = this.maxMissiles;
                    this.score += 200;
                    this.sparkEmitter.setParticleTint(0x34d399);
                    this.sparkEmitter.explode(24, px, py);
                    this.spawnPopup(px, py - 24, tr('OVERDRIVE +200', 'OVERDRIVE +200'), '#34d399');
                }
                this.score += 150;
            }

            applyUpgradeEffect(uid) {
                if (uid === 'triple_jump') {
                    this.maxAirJumps = 2;
                    this.airJumpsLeft = 2;
                } else if (uid === 'phase_shield') {
                    this.shieldPoints = 1;
                    this.shieldRechargeTimer = 0;
                } else if (uid === 'spread_missile') {
                    this.maxMissiles = 6;
                    this.missiles = this.maxMissiles;
                }
            }

            hitAcid() {
                if (this.invulnTimer > 0 || this.ended) return;
                this.damagePlayer(1);
                if (!this.ended) {
                    this.player.setPosition(this.lastSafeX, this.lastSafeY);
                    this.player.setVelocity(0, -180);
                }
            }

            onPlayerTouchEnemy(en) {
                if (!en || !en.active || (en.getData('stunTimer') || 0) > 0 || this.dashTimer > 0) return;
                this.damagePlayer(1);
            }

            onPlayerHitBolt(bolt) {
                if (!bolt || !bolt.active) return;
                if (this.dashTimer > 0) return;
                bolt.destroy();
                this.damagePlayer(1);
            }

            damagePlayer(amt) {
                if (this.invulnTimer > 0 || this.ended) return;

                if (this.upgrades.phase_shield && this.shieldPoints > 0) {
                    this.shieldPoints = 0;
                    this.shieldRechargeTimer = 9.0;
                    this.invulnTimer = 1.05;
                    safePlay(ctx, 'hitShield');
                    this.cameras.main.shake(95, 0.006);
                    this.sparkEmitter.setParticleTint(0x818cf8);
                    this.sparkEmitter.explode(18, this.player.x, this.player.y);
                    this.spawnPopup(this.player.x, this.player.y - 34, tr('KALKAN KORUDU!', 'SHIELD ABSORBED!'), '#818cf8');
                    return;
                }

                this.lives -= amt;
                this.invulnTimer = this.upgrades.phase_shield ? 1.55 : 1.25;
                if (this.upgrades.phase_shield) {
                    this.shieldRechargeTimer = 9.0;
                }
                safePlay(ctx, 'playerHurt');
                this.cameras.main.shake(145, 0.01);
                this.sparkEmitter.setParticleTint(0xfb7185);
                this.sparkEmitter.explode(14, this.player.x, this.player.y);

                if (this.lives <= 0) {
                    this.lives = 0;
                    this.ended = true;
                    this.syncExternalHud();
                    ctx.onGameOver({
                        score: this.score,
                        level: this.sectorNum,
                        stars: this.score >= 1500 ? 2 : (this.score >= 600 ? 1 : 0),
                        reason: tr('Exo-Zırh parçalandı. Sektör güvenliği seni durdurdu.', 'Exo-armor breached inside the reactor sector.')
                    });
                }
            }

            // -----------------------------------------------------------------
            // Triggers, Endless Rotation & Sector Progression
            // -----------------------------------------------------------------
            checkBossAndPortalTriggers(dt) {
                // Trigger Boss fight cleanly when player crosses Sanctum threshold or enters proximity
                if (this.bossPresentInSector && this.bossSpawnPos && !this.bossSpawned) {
                    const bx = this.bossSpawnPos.x;
                    const by = this.bossSpawnPos.y;
                    const trigCol = this.sectorDef && Number.isFinite(this.sectorDef.bossTriggerCol)
                        ? this.sectorDef.bossTriggerCol
                        : null;
                    const crossedCol = trigCol !== null && this.player.x >= trigCol * this.TILE;
                    const nearAnchor = Math.abs(this.player.x - bx) <= 440 && Math.abs(this.player.y - by) <= 280;
                    if (crossedCol || nearAnchor) {
                        this.spawnAegisBoss(bx, by);
                    }
                }

                // Endless Breach Wave & Arena Rotation
                const anyAliveEnemy = this.enemyList.some((e) => e && e.active);
                if (this.endlessMode && (!this.activeBoss || !this.activeBoss.active) && !anyAliveEnemy) {
                    this.endlessWaveTimer += dt;
                    if (this.endlessWaveTimer >= 1.35) {
                        this.endlessWaveTimer = 0;
                        this.score += 220;

                        // Award an unowned Suit Upgrade on wave clear
                        const nextUpg = UPGRADE_ORDER.find((u) => !this.upgrades[u.id]);
                        if (nextUpg) {
                            this.upgrades[nextUpg.id] = true;
                            this.applyUpgradeEffect(nextUpg.id);
                            const exo = getData();
                            const spec = (exo.upgrades && exo.upgrades[nextUpg.id]) || DEFAULT_UPGRADES[nextUpg.id];
                            this.spawnPopup(
                                this.player.x,
                                this.player.y - 44,
                                `${pickText(tr, spec.title, nextUpg.id)}!`,
                                toCssColor(spec.color, '#22d3ee')
                            );
                        }

                        // Rotate to next Endless Arena after completing boss wave
                        if (this.endlessWave % this.wavesPerArena === 0) {
                            const nextSec = this.sectorNum + 1;
                            const nextArenaIdx = (this.endlessArenaIdx + 1) % getData().endlessArenas.length;
                            runtime.pendingLevel = nextSec;
                            safePlay(ctx, 'levelup');
                            this.scene.restart({
                                level: nextSec,
                                carryScore: this.score,
                                carryLives: Math.min(this.maxLives, this.lives + 1),
                                carryMissiles: this.maxMissiles,
                                carryUpgrades: Object.assign({}, this.upgrades),
                                endlessArenaIdx: nextArenaIdx,
                                endlessWave: this.endlessWave + 1
                            });
                            return;
                        }

                        this.endlessWave++;
                        this.difficultyMult = ctxDiffMult * (1 + (this.sectorNum - this.campaignCount) * 0.24 + (this.endlessWave - 1) * 0.12);
                        this.showBanner(`WAVE ${this.endlessWave} · ${tr('HAZIRLAN!', 'INCOMING!')}`, '#c084fc');
                        this.spawnEndlessWave();
                    }
                } else {
                    this.endlessWaveTimer = 0;
                }

                // Story Mode Win Target
                if (isStory && this.score >= storyTarget && !this.ended) {
                    this.ended = true;
                    safePlay(ctx, 'levelup');
                    this.syncExternalHud();
                    ctx.onWin({
                        score: this.score,
                        level: this.sectorNum,
                        stars: this.score >= storyTarget * 1.6 ? 3 : 2,
                        reason: tr('Exo-Metroid sektör ihlal hedefi başarıyla tamamlandı!', 'Exo-Metroid breach target achieved!')
                    });
                    return;
                }

                // Extraction Portal Enter (Campaign sectors)
                if (!this.endlessMode && this.portalUnlocked && this.portalObj) {
                    const d = global.Phaser.Math.Distance.Between(this.player.x, this.player.y, this.portalObj.x, this.portalObj.y);
                    if (d < 46) {
                        this.advanceSector();
                    }
                }
            }

            advanceSector() {
                if (this.ended) return;
                this.score += 250;
                safePlay(ctx, 'levelup');

                if (isStory && (this.sectorNum >= this.campaignCount || this.score >= storyTarget)) {
                    this.ended = true;
                    this.syncExternalHud();
                    ctx.onWin({
                        score: this.score,
                        level: this.sectorNum,
                        stars: this.lives >= 4 ? 3 : 2,
                        reason: tr('Sektör başarıyla temizlendi!', 'Sector breach accomplished!')
                    });
                    return;
                }

                const nextSec = this.sectorNum + 1;
                runtime.pendingLevel = nextSec;
                this.scene.restart({
                    level: nextSec,
                    carryScore: this.score,
                    carryLives: Math.min(this.maxLives, this.lives + 1),
                    carryMissiles: Math.min(this.maxMissiles, Math.max(4, this.missiles)),
                    carryUpgrades: Object.assign({}, this.upgrades),
                    endlessArenaIdx: 0,
                    endlessWave: 1
                });
            }

            // -----------------------------------------------------------------
            // Visual Effects, Fog-of-War Minimap & Canvas HUD
            // -----------------------------------------------------------------
            updateAcidSurfaceFx(dt) {
                if (!this.acidFxG || !this.acidSurfaceTiles || this.acidSurfaceTiles.length === 0) return;
                const g = this.acidFxG;
                g.clear();
                const now = this.time.now * 0.004;
                const T = this.TILE;
                for (let i = 0; i < this.acidSurfaceTiles.length; i++) {
                    const t = this.acidSurfaceTiles[i];
                    const wave = Math.sin(now + i * 0.9) * 2;
                    g.fillStyle(0x4ade80, 0.34 + 0.14 * Math.sin(now * 1.4 + i));
                    g.fillRect(t.x - T * 0.5, t.y - 2 + wave * 0.4, T, 5);
                    g.fillStyle(0x86efac, 0.55);
                    g.fillCircle(t.x - 8 + Math.cos(now + i) * 6, t.y + wave * 0.5, 2.2);
                }

                this.acidBubbleTimer -= dt;
                if (this.acidBubbleTimer <= 0 && this.acidBubbleEmitter) {
                    this.acidBubbleTimer = 0.11;
                    const pick = this.acidSurfaceTiles[Math.floor(Math.random() * this.acidSurfaceTiles.length)];
                    this.acidBubbleEmitter.explode(1, pick.x + (Math.random() - 0.5) * 26, pick.y + 4);
                }
            }

            drawPlayerAndHazardFx() {
                const g = this.hazardFxG;
                const pg = this.playerFxG;
                g.clear();
                pg.clear();

                // Timed Laser Hazards
                for (let i = 0; i < this.laserHazards.length; i++) {
                    const h = this.laserHazards[i];
                    if (h.state === 'warn') {
                        const pulse = 0.35 + 0.45 * Math.sin(this.time.now * 0.024);
                        g.lineStyle(2, 0xfbbf24, pulse);
                        g.lineBetween(h.x, h.y, h.ex, h.ey);
                        g.fillStyle(0xfbbf24, pulse);
                        g.fillCircle(h.x, h.y, 6);
                    } else if (h.state === 'active') {
                        g.lineStyle(14, 0xe879f9, 0.35);
                        g.lineBetween(h.x, h.y, h.ex, h.ey);
                        g.lineStyle(6, 0x22d3ee, 0.85);
                        g.lineBetween(h.x, h.y, h.ex, h.ey);
                        g.lineStyle(2, 0xffffff, 1);
                        g.lineBetween(h.x, h.y, h.ex, h.ey);
                    }
                }

                // Turret laser-sight telegraph
                for (let i = 0; i < this.enemyList.length; i++) {
                    const en = this.enemyList[i];
                    if (!en || !en.active || en.getData('kind') !== 'turret') continue;
                    const teleT = en.getData('telegraphTimer') || 0;
                    if (teleT > 0) {
                        const ang = en.getData('aimAngle') || 0;
                        g.lineStyle(2, 0xf43f5e, 0.4 + 0.45 * Math.sin(this.time.now * 0.03));
                        g.lineBetween(en.x, en.y, en.x + Math.cos(ang) * 440, en.y + Math.sin(ang) * 440);
                    }
                }

                // Player Energy Shield halo & Charge Beam ring
                if (this.player && this.player.active) {
                    if (this.upgrades.phase_shield && this.shieldPoints > 0) {
                        pg.lineStyle(2, 0x818cf8, 0.48 + 0.2 * Math.sin(this.time.now * 0.008));
                        pg.strokeCircle(this.player.x, this.player.y, 26);
                    }

                    if (this.jCharging && this.chargeTimer > 0.11) {
                        const chargeNeed = this.upgrades.charge_beam ? 0.32 : 0.45;
                        const pct = clamp(this.chargeTimer / chargeNeed, 0, 1);
                        const ready = pct >= 1;
                        const col = ready ? (Math.floor(this.time.now / 70) % 2 === 0 ? 0x22d3ee : 0xf472b6) : 0x38bdf8;
                        pg.lineStyle(ready ? 3.5 : 2.5, col, 0.9);
                        pg.beginPath();
                        pg.arc(this.player.x, this.player.y, 29, -Math.PI * 0.5, -Math.PI * 0.5 + TAU * pct, false);
                        pg.strokePath();
                    }
                }
            }

            drawEnemyHpBars() {
                if (!this.enemyHpGraphics) return;
                const g = this.enemyHpGraphics;
                g.clear();
                for (let i = 0; i < this.enemyList.length; i++) {
                    const en = this.enemyList[i];
                    if (!en || !en.active) continue;
                    const kind = en.getData('kind');
                    const hp = Math.max(0, en.getData('hp') || 0);
                    const maxHp = Math.max(1, en.getData('maxHp') || 1);
                    const inAcid = (en.getData('acidGrace') || 0) > 0;
                    const stunned = (en.getData('stunTimer') || 0) > 0;

                    if ((kind === 'spider' || kind === 'drone') && hp >= maxHp && !inAcid && !stunned) continue;

                    const bw = kind === 'boss' ? 88 : (kind === 'mech' || kind === 'commando' ? 46 : 34);
                    const bh = kind === 'boss' ? 6 : 5;
                    const bx = en.x - bw * 0.5;
                    const by = en.body ? en.body.top - 12 : en.y - 30;
                    const ratio = clamp(hp / maxHp, 0, 1);

                    g.fillStyle(0x020617, 0.88);
                    g.fillRoundedRect(bx - 1, by - 1, bw + 2, bh + 2, 2);
                    const fillCol = inAcid ? 0x4ade80 : (stunned ? 0x38bdf8 : (ratio > 0.5 ? 0xf59e0b : 0xf43f5e));
                    g.fillStyle(fillCol, 1);
                    if (ratio > 0) g.fillRect(bx, by, bw * ratio, bh);
                }

                // Reactor HP bars
                this.reactors.getChildren().forEach((rec) => {
                    if (!rec || !rec.active) return;
                    const hp = Math.max(0, rec.getData('hp') || 0);
                    const maxHp = Math.max(1, rec.getData('maxHp') || 1);
                    const bw = 46;
                    const bx = rec.x - bw * 0.5;
                    const by = rec.y - 32;
                    g.fillStyle(0x020617, 0.88);
                    g.fillRoundedRect(bx - 1, by - 1, bw + 2, 7, 2);
                    g.fillStyle(0x22d3ee, 1);
                    g.fillRect(bx, by, bw * clamp(hp / maxHp, 0, 1), 5);
                });
            }

            revealFogAroundPlayer() {
                if (!this.player || !this.exploredGrid) return;
                const pc = clamp(Math.floor(this.player.x / this.TILE), 0, this.gridCols - 1);
                const pr = clamp(Math.floor(this.player.y / this.TILE), 0, this.gridRows - 1);
                const rx = this.endlessMode ? 10 : 8;
                const ry = this.endlessMode ? 8 : 6;
                for (let r = Math.max(0, pr - ry); r <= Math.min(this.gridRows - 1, pr + ry); r++) {
                    for (let c = Math.max(0, pc - rx); c <= Math.min(this.gridCols - 1, pc + rx); c++) {
                        this.exploredGrid[r * this.gridCols + c] = 1;
                    }
                }
            }

            drawCanvasHudAndMinimap() {
                const g = this.hudGraphics;
                g.clear();

                const dashReady = this.dashCooldown <= 0;
                const comboTxt = this.slashCombo > 1 ? ` · x${this.slashCombo}` : '';
                this.hudAbilityTxt.setText(
                    `MSL:${this.missiles}/${this.maxMissiles}  DASH:${dashReady ? 'RDY' : Math.ceil(this.dashCooldown * 10) / 10 + 's'}  SCORE:${this.score}${comboTxt}`
                );

                // Top-left dynamic HUD card sized cleanly for Sector & Endless labels
                const titleW = Math.ceil((this.hudTitleTxt && this.hudTitleTxt.width) ? this.hudTitleTxt.width : 200);
                const abilityW = Math.ceil((this.hudAbilityTxt && this.hudAbilityTxt.width) ? this.hudAbilityTxt.width : 200);
                const hudBoxW = clamp(Math.max(262, titleW, abilityW) + 24, 286, 444);
                g.fillStyle(0x050816, 0.86);
                g.fillRoundedRect(10, 8, hudBoxW, 86, 8);
                g.lineStyle(1, this.biomeAccentInt, 0.45);
                g.strokeRoundedRect(10, 8, hudBoxW, 86, 8);

                // Hull Pips
                for (let i = 0; i < this.maxLives; i++) {
                    const active = i < this.lives;
                    g.fillStyle(active ? 0x34d399 : 0x1e293b, 1);
                    g.fillRoundedRect(18 + i * 19, 31, 15, 10, 3);
                }

                // Energy Shield Pip (if Phase Shield unlocked)
                if (this.upgrades.phase_shield) {
                    const shReady = this.shieldPoints > 0;
                    const shCol = shReady ? 0x818cf8 : 0x312e81;
                    g.fillStyle(shCol, 1);
                    g.fillRoundedRect(136, 31, 18, 10, 3);
                    if (!shReady) {
                        const shPct = clamp(1 - this.shieldRechargeTimer / 9.0, 0, 1);
                        g.fillStyle(0x818cf8, 0.8);
                        g.fillRect(136, 39, 18 * shPct, 2);
                    }
                }

                // Missile Pips
                const mStart = 166;
                for (let i = 0; i < this.maxMissiles; i++) {
                    const active = i < this.missiles;
                    g.fillStyle(active ? 0xf59e0b : 0x1e293b, 1);
                    g.fillRoundedRect(mStart + i * 19, 31, 14, 10, 3);
                }

                // Dash & Charge mini bars
                const dashCdMax = (this.upgrades.phase_shield || this.upgrades.plasma_nova) ? 0.50 : 0.62;
                const dashPct = clamp(1 - this.dashCooldown / dashCdMax, 0, 1);
                g.fillStyle(0x0f172a, 1);
                g.fillRoundedRect(18, 45, 76, 4, 2);
                g.fillStyle(dashPct >= 1 ? 0x22d3ee : 0x475569, 1);
                g.fillRoundedRect(18, 45, 76 * dashPct, 4, 2);

                const chargeNeed = this.upgrades.charge_beam ? 0.32 : 0.45;
                const chgPct = this.jCharging ? clamp(this.chargeTimer / chargeNeed, 0, 1) : 0;
                g.fillStyle(0x0f172a, 1);
                g.fillRoundedRect(102, 45, 76, 4, 2);
                if (chgPct > 0) {
                    g.fillStyle(chgPct >= 1 ? 0xf472b6 : 0x38bdf8, 1);
                    g.fillRoundedRect(102, 45, 76 * chgPct, 4, 2);
                }

                // Upgrade Badges (high-contrast centered pills)
                for (let i = 0; i < UPGRADE_ORDER.length; i++) {
                    const u = UPGRADE_ORDER[i];
                    const owned = Boolean(this.upgrades[u.id]);
                    const bx = 18 + i * 40;
                    const bw = 34;
                    const by = 70;
                    const bh = 16;
                    g.fillStyle(owned ? u.color : 0x0f172a, owned ? 0.24 : 0.88);
                    g.fillRoundedRect(bx, by, bw, bh, 4);
                    g.lineStyle(owned ? 1.5 : 1, u.color, owned ? 0.95 : 0.3);
                    g.strokeRoundedRect(bx, by, bw, bh, 4);
                    const bTxt = this.hudBadgeTxts && this.hudBadgeTxts[i];
                    if (bTxt) {
                        bTxt.setPosition(bx + bw / 2, by + bh / 2);
                        bTxt.setColor(owned ? '#f8fafc' : '#64748b');
                    }
                }

                // Boss Health Bar (dynamically leaves clearance for HUD card & minimap)
                if (this.activeBoss && this.activeBoss.active) {
                    const bw = 290;
                    const hudRight = 10 + hudBoxW;
                    const minimapLeft = 960 - 176 - 10;
                    const bossCenterX = clamp(Math.max(480, hudRight + 14 + bw / 2), 480, minimapLeft - 14 - bw / 2);
                    this.bossBarTxt.setVisible(true);
                    this.bossBarTxt.setPosition(bossCenterX, 12);
                    const p2 = this.activeBoss.getData('phase') === 2;
                    this.bossBarTxt.setText(
                        (this.endlessMode ? `AEGIS MK-${this.endlessWave}` : 'AEGIS COLOSSUS') + (p2 ? ' · ENRAGED' : '')
                    );
                    const ratio = clamp((this.activeBoss.getData('hp') || 0) / (this.activeBoss.getData('maxHp') || 1), 0, 1);
                    g.fillStyle(0x090d1e, 0.92);
                    g.fillRoundedRect(bossCenterX - bw / 2, 32, bw, 12, 4);
                    g.fillStyle(p2 ? 0xff2d55 : 0xf43f5e, 1);
                    g.fillRoundedRect(bossCenterX - bw / 2 + 2, 34, (bw - 4) * ratio, 8, 3);
                } else {
                    this.bossBarTxt.setVisible(false);
                }

                // Top-Right Fog-of-War Tactical Minimap
                const mg = this.minimapGraphics;
                mg.clear();
                const mw = 176;
                const mh = 90;
                const mx = 960 - mw - 10;
                const my = 8;
                mg.fillStyle(0x040712, 0.88);
                mg.fillRoundedRect(mx, my, mw, mh, 6);
                mg.lineStyle(1, this.biomeAccentInt, 0.48);
                mg.strokeRoundedRect(mx, my, mw, mh, 6);

                const sx = mw / this.worldW;
                const sy = mh / this.worldH;
                const cw = Math.max(1.4, this.TILE * sx);
                const ch = Math.max(1.4, this.TILE * sy);

                for (let r = 0; r < this.gridRows; r++) {
                    for (let c = 0; c < this.gridCols; c++) {
                        if (!this.exploredGrid[r * this.gridCols + c]) continue;
                        const tile = this.liveGrid[r][c];
                        const tx = mx + c * this.TILE * sx;
                        const ty = my + r * this.TILE * sy;
                        if (tile === '#') {
                            mg.fillStyle(0x334155, 0.9);
                            mg.fillRect(tx, ty, cw, ch);
                        } else if (tile === '=') {
                            mg.fillStyle(0x64748b, 0.9);
                            mg.fillRect(tx, ty, cw, Math.max(1.2, ch * 0.35));
                        } else if (tile === '~') {
                            mg.fillStyle(0x22c55e, 0.65);
                            mg.fillRect(tx, ty, cw, ch);
                        } else {
                            mg.fillStyle(0x0f172a, 0.5);
                            mg.fillRect(tx, ty, cw, ch);
                        }
                    }
                }

                // Explored doors, upgrades, reactors, portals, enemies
                const isTileExplored = (wx, wy) => {
                    const tc = clamp(Math.floor(wx / this.TILE), 0, this.gridCols - 1);
                    const trR = clamp(Math.floor(wy / this.TILE), 0, this.gridRows - 1);
                    return Boolean(this.exploredGrid[trR * this.gridCols + tc]);
                };

                for (let i = 0; i < this.movingPlatList.length; i++) {
                    const mp = this.movingPlatList[i];
                    if (mp && mp.active && isTileExplored(mp.x, mp.y)) {
                        const pw = Math.max(4, (mp.getData('w') || this.TILE) * sx);
                        mg.fillStyle(0x22d3ee, 0.9);
                        mg.fillRect(mx + mp.x * sx - pw * 0.5, my + mp.y * sy - 1, pw, 2);
                    }
                }
                for (let i = 0; i < this.doorRefs.length; i++) {
                    const d = this.doorRefs[i];
                    if (d && d.active && isTileExplored(d.x, d.y)) {
                        mg.fillStyle(0xf59e0b, 1);
                        mg.fillRect(mx + d.x * sx - 1.5, my + d.y * sy - 3, 3, 6);
                    }
                }
                this.upgradePods.getChildren().forEach((pod) => {
                    if (pod && pod.active && isTileExplored(pod.x, pod.y)) {
                        mg.fillStyle(0xa855f7, 1);
                        mg.fillCircle(mx + pod.x * sx, my + pod.y * sy, 2.8);
                    }
                });
                this.reactors.getChildren().forEach((rec) => {
                    if (rec && rec.active && isTileExplored(rec.x, rec.y)) {
                        mg.fillStyle(0x22d3ee, 1);
                        mg.fillCircle(mx + rec.x * sx, my + rec.y * sy, 3);
                    }
                });
                if (this.portalObj && (this.portalUnlocked || isTileExplored(this.portalObj.x, this.portalObj.y))) {
                    mg.fillStyle(this.portalUnlocked ? 0x34d399 : 0x475569, 1);
                    mg.fillCircle(mx + this.portalObj.x * sx, my + this.portalObj.y * sy, 3.4);
                }
                for (let i = 0; i < this.enemyList.length; i++) {
                    const en = this.enemyList[i];
                    if (!en || !en.active) continue;
                    const isBoss = en.getData('kind') === 'boss';
                    if (isBoss || isTileExplored(en.x, en.y)) {
                        mg.fillStyle(isBoss ? 0xc084fc : 0xf43f5e, 1);
                        mg.fillCircle(mx + en.x * sx, my + en.y * sy, isBoss ? 4 : 2.1);
                    }
                }
                if (this.player) {
                    mg.fillStyle(0x38bdf8, 1);
                    mg.fillCircle(mx + this.player.x * sx, my + this.player.y * sy, 3.2);
                }
            }

            syncExternalHud() {
                const obj = isStory
                    ? tr(`Hedef: ${storyTarget} Puan (${this.sectorLabel})`, `Target: ${storyTarget} Score (${this.sectorLabel})`)
                    : (this.endlessMode
                        ? tr(`Sonsuz İhlal · Dalga ${this.endlessWave} · Sektör ${this.sectorNum}`, `Endless Breach · Wave ${this.endlessWave} · Sector ${this.sectorNum}`)
                        : (this.portalUnlocked
                            ? tr('Çıkış Geçidine Gir!', 'Enter Extraction Gate!')
                            : (this.bossPresentInSector && !this.bossDefeated
                                ? tr('Aegis Colossus Bossunu Yen!', 'Defeat Aegis Colossus!')
                                : tr('Kapıyı Kır [K/Basılı J] & Çekirdeği İmha Et', 'Breach Door [K/Hold J] & Destroy Reactor'))));

                const shText = this.upgrades.phase_shield ? ` · SHD ${this.shieldPoints}` : '';
                safeSetHud(ctx, {
                    score: this.score,
                    level: this.sectorNum,
                    maxLevel: this.endlessMode ? '∞' : this.campaignCount,
                    lives: this.lives,
                    statusText: `${this.sectorLabel} · MSL ${this.missiles}/${this.maxMissiles}${shText}`,
                    objectiveText: obj
                });
            }
        }

        return mountPhaserHost(ctx, () => ({
            type: global.Phaser.AUTO,
            parent: ctx.stageEl,
            width: 960,
            height: 580,
            backgroundColor: '#050816',
            physics: { default: 'arcade', arcade: { gravity: { y: 980 }, debug: false } },
            scale: { mode: global.Phaser.Scale.FIT, autoCenter: global.Phaser.Scale.CENTER_BOTH },
            scene: [ExoMetroidScene]
        }), runtime);
    };
})(window);
