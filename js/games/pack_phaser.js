// =============================================================================
// COSMIC UNIVERSE v11.0 — PACK 8: PHASER 3 FLAGSHIP ENGINES (js/games/pack_phaser.js)
// Registers 3 flagship games powered by Phaser 3.88.2 (window.Phaser):
//   1. exo-metroid-breach     (Sci-Fi Metroidvania Platformer + Aegis Boss + Endless)
//   2. phaser-stealth-heist   (Top-Down Stealth Infiltration + FOV Cones + Endless)
//   3. phaser-crimson-colossus (Multi-Phase Mecha Boss Raid + Pink Parry + Boss Rush)
// =============================================================================
(function (global) {
    'use strict';

    const Engines = global.COSMIC_GAME_ENGINES = global.COSMIC_GAME_ENGINES || {};
    const TAU = Math.PI * 2;

    // -------------------------------------------------------------------------
    // Shared Runtime Helpers (Assets, Audio, Input, Pause, Physics, Lifecycle)
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
            // Never swallow global player shortcuts [P], [F], [R]
            if (key === 'p' || key === 'f') return;
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
            return { destroy() {}, restart() {} };
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
                try { cnv.focus({ preventScroll: true }); } catch (_) {}
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

    // =========================================================================
    // GAME 1: exo-metroid-breach — Sci-Fi Metroidvania Platformer (Phaser 3)
    // =========================================================================
    Engines['exo-metroid-breach'] = function mountExoMetroidBreach(ctx) {
        const tr = createTranslator(ctx);
        const isStory = resolveIsStory(ctx);
        const storyTarget = ctx.chapterTarget || 1100;
        const TILE = 40;
        const runtime = {};

        // 3 Handcrafted Vertical + Horizontal Sectors (verified jump/wall-jump clearances)
        const SECTORS = [
            {
                id: 1,
                name: 'SECTOR 1: HANGAR DUCTS',
                accent: 0x38bdf8,
                map: [
                    '############################################',
                    '#.........................#................#',
                    '#.........................#................#',
                    '#..........A............H.#................#',
                    '#........=======..========#................#',
                    '#.........................#................#',
                    '#.........................#...===..........#',
                    '#............S............#................#',
                    '#........==========.......#..........#######',
                    '#.........................#..S.......#.....#',
                    '#..P...............===.......======..#.....#',
                    '#......===...........................D.....#',
                    '#...............................M....D..R.X#',
                    '#======...===...===...===========..#########',
                    '#.....#...#.#...#.#...#............#.......#',
                    '#.....#~~~#.#~~~#.#~~~#............#.......#',
                    '############################################'
                ]
            },
            {
                id: 2,
                name: 'SECTOR 2: FUSION CHASM',
                accent: 0x2dd4bf,
                map: [
                    '################################################',
                    '#..............................#...............#',
                    '#..............................#....A.......H..#',
                    '#..............................#..=====..=====.#',
                    '#..............................#...............#',
                    '#..P...........................#...............#',
                    '#======........................#..S.......M....#',
                    '#........===.......S...........#..===========..#',
                    '#................=====.....#...D...............#',
                    '#..........................#...D...............#',
                    '#.....===....===....===....#...#.....======....#',
                    '#..........................#...#...............#',
                    '#.............A............#...#...............#',
                    '#...........=====..........#.............#######',
                    '#.......................===#......M......#.....#',
                    '#....H.....................#....======...#.....#',
                    '#..=====.......===.......................D.....#',
                    '#..................................A.....D..R.X#',
                    '#.......#~~~~~~~~~~~#......#..##################',
                    '#.......#############......#...................#',
                    '################################################'
                ]
            },
            {
                id: 3,
                name: 'SECTOR 3: AEGIS VAULT',
                accent: 0xa855f7,
                map: [
                    '####################################################',
                    '#........................#.........................#',
                    '#........................#.........................#',
                    '#........................#.........................#',
                    '#.........A......H.......#.........................#',
                    '#.......===========......#.........................#',
                    '#........................#.........................#',
                    '#........................#.........................#',
                    '#....S...................#.........................#',
                    '#..======......===.......#.........................#',
                    '#........................#.....===........===......#',
                    '#..P..............M......D.........................#',
                    '#======......========....D...........===...........#',
                    '#........................D.........................#',
                    '#...........===..........#.........................#',
                    '#........................#..===..............===...#',
                    '#.....#~~~~~~#...........#.........................#',
                    '#.....########...........#.............B........X..#',
                    '#........................###########################',
                    '####################################################'
                ]
            }
        ];

        class ExoMetroidScene extends global.Phaser.Scene {
            constructor() {
                super({ key: 'ExoMetroidScene' });
            }

            init(data) {
                const lv = (data && data.level) ? data.level : runtime.pendingLevel;
                this.sectorNum = Math.max(1, Math.floor(Number(lv) || 1));
                this.score = (data && data.carryScore) ? data.carryScore : 0;
                this.lives = (data && data.carryLives) ? data.carryLives : 5;
                this.missiles = (data && data.carryMissiles !== undefined) ? data.carryMissiles : 4;
                this.ended = false;
                this.bossSpawned = false;
                this.bossDefeated = false;
                this.reactorDestroyed = false;
                this.vaultLocked = false;
                this.endlessMode = !isStory && this.sectorNum > 3;
                this.endlessWave = 1;
                this.endlessWaveTimer = 0;
                this.difficultyMult = this.endlessMode ? 1 + (this.sectorNum - 3) * 0.35 : 1 + (this.sectorNum - 1) * 0.15;
                this._cosmicPaused = false;
            }

            preload() {
                this.load.on('loaderror', () => {});
                queueImageSafe(this, 'emb_trooper', 'assets/v11/sprites/exo_trooper.png');
                queueImageSafe(this, 'emb_spider', 'assets/v11/sprites/spider_bot.png');
                queueImageSafe(this, 'emb_mech', 'assets/v11/sprites/tactical_mech.png');
                queueImageSafe(this, 'emb_boss', 'assets/v11/sprites/colossus_boss.png');
                queueImageSafe(this, 'emb_reactor', 'assets/v11/sprites/reactor_node.png');
            }

            create() {
                runtime.activeScene = this;
                runtime.sceneReady = true;
                this.input.mouse.disableContextMenu();

                this.ensureProceduralTextures();

                const sectorIdx = Math.min(SECTORS.length - 1, Math.max(0, this.sectorNum - 1));
                const sectorDef = SECTORS[sectorIdx];
                const grid = sectorDef.map;
                this.gridRows = grid.length;
                this.gridCols = grid[0].length;
                this.worldW = this.gridCols * TILE;
                this.worldH = this.gridRows * TILE;
                this.sectorLabel = this.endlessMode
                    ? `SECTOR ${this.sectorNum}: ENDLESS BREACH`
                    : sectorDef.name;

                this.physics.world.setBounds(0, 0, this.worldW, this.worldH);
                this.cameras.main.setBounds(0, 0, this.worldW, this.worldH);

                // Parallax Nebula Grid Background
                this.createParallaxBackdrop(sectorDef.accent);

                // Static & Dynamic Groups
                this.solids = this.physics.add.staticGroup();
                this.oneWays = this.physics.add.staticGroup();
                this.acids = this.physics.add.staticGroup();
                this.doors = this.physics.add.staticGroup();
                this.reactors = this.physics.add.staticGroup();
                this.pickups = this.physics.add.staticGroup();
                this.enemies = this.physics.add.group({ allowGravity: true });
                this.playerMissiles = this.physics.add.group({ allowGravity: false });
                this.enemyBolts = this.physics.add.group({ allowGravity: false });
                this.slashHitboxGroup = this.physics.add.group({ allowGravity: false });

                this.parsedWalls = [];
                this.doorRefs = [];
                this.enemyList = [];
                this.activeBoss = null;
                this.portalObj = null;
                this.vaultBarrier = null;

                this.buildSectorFromGrid(grid);

                if (this.endlessMode) {
                    this.spawnPoint = { x: 1320, y: 620 };
                    this.bossTriggerX = null;
                    this.doorRefs.forEach((d) => {
                        if (d && d.destroy) d.destroy();
                    });
                    this.doorRefs = [];
                    const seal = this.add.tileSprite(1020, 500, 28, 120, 'emb_door_shield').setDepth(7);
                    seal.setTint(0xa855f7);
                    this.physics.add.existing(seal, true);
                    this.solids.add(seal);
                }

                // Create Exo-Trooper Player
                this.createPlayer();

                // Collisions & Overlaps
                this.physics.add.collider(this.player, this.solids);
                this.physics.add.collider(this.player, this.oneWays);
                this.physics.add.collider(this.player, this.doors);
                this.physics.add.collider(this.enemies, this.solids);
                this.physics.add.collider(this.enemies, this.oneWays);
                this.physics.add.collider(this.enemies, this.doors);

                this.physics.add.overlap(this.player, this.acids, () => this.hitAcid());
                this.physics.add.overlap(this.player, this.pickups, (p, item) => this.collectPickup(item));
                this.physics.add.overlap(this.player, this.enemies, (p, en) => this.onPlayerTouchEnemy(en));
                this.physics.add.overlap(this.player, this.enemyBolts, (p, bolt) => this.onPlayerHitBolt(bolt));

                this.physics.add.overlap(this.playerMissiles, this.doors, (msl, door) => this.onMissileHitDoor(msl, door));
                this.physics.add.overlap(this.playerMissiles, this.solids, (msl) => this.detonateMissile(msl, null));
                this.physics.add.overlap(this.playerMissiles, this.enemies, (msl, en) => this.detonateMissile(msl, en));
                this.physics.add.overlap(this.playerMissiles, this.reactors, (msl, r) => this.onHitReactor(r, 45, msl));

                // Particles
                this.sparkEmitter = this.add.particles(0, 0, 'emb_spark', {
                    speed: { min: 50, max: 210 },
                    scale: { start: 1.1, end: 0 },
                    alpha: { start: 1, end: 0 },
                    lifespan: 340,
                    emitting: false
                }).setDepth(35);

                // Pointer attacks (Left Click = Plasma Slash, Right Click = Homing Missile)
                this.onPointerDown = (pointer) => {
                    if (this.ended || this._cosmicPaused) return;
                    safeUnlockAudio(ctx);
                    if (pointer.rightButtonDown()) {
                        this.tryFireMissile(pointer);
                    } else {
                        this.tryPlasmaSlash(pointer);
                    }
                };
                this.input.on('pointerdown', this.onPointerDown);
                this.events.once('shutdown', () => {
                    this.input.off('pointerdown', this.onPointerDown);
                });

                // Camera follow
                this.cameras.main.startFollow(this.player, true, 0.14, 0.14);

                // Screen-pinned HUD Graphics + Minimap + Labels
                this.createCanvasOverlayHud();

                // Update initial HUD
                this.syncExternalHud();

                if (this.endlessMode) {
                    this.showBanner(tr('SONSUZ İHLAL MODU!', 'ENDLESS BREACH MODE!'), '#c084fc');
                    this.spawnEndlessWave();
                } else {
                    this.showBanner(this.sectorLabel, '#38bdf8');
                }
            }

            ensureProceduralTextures() {
                // Fallback textures if sprite PNGs somehow fail
                makeTextureSafe(this, 'emb_trooper', 64, 64, (g) => {
                    g.fillStyle(0x38bdf8, 1);
                    g.fillRoundedRect(18, 10, 28, 44, 8);
                    g.fillStyle(0x0f172a, 1);
                    g.fillRect(28, 16, 14, 8);
                });
                makeTextureSafe(this, 'emb_spider', 64, 64, (g) => {
                    g.fillStyle(0xf43f5e, 1);
                    g.fillCircle(32, 32, 18);
                });
                makeTextureSafe(this, 'emb_mech', 64, 64, (g) => {
                    g.fillStyle(0xf59e0b, 1);
                    g.fillRect(14, 10, 36, 44);
                });
                makeTextureSafe(this, 'emb_boss', 128, 128, (g) => {
                    g.fillStyle(0xa855f7, 1);
                    g.fillRoundedRect(18, 14, 92, 100, 18);
                });
                makeTextureSafe(this, 'emb_reactor', 64, 64, (g) => {
                    g.fillStyle(0x22d3ee, 1);
                    g.fillCircle(32, 32, 24);
                });

                makeTextureSafe(this, 'emb_tile_hull', TILE, TILE, (g, w, h) => {
                    g.fillStyle(0x0d172a, 1);
                    g.fillRect(0, 0, w, h);
                    g.lineStyle(1.5, 0x1e3a5f, 1);
                    g.strokeRect(1, 1, w - 2, h - 2);
                    g.fillStyle(0x162742, 1);
                    g.fillRect(5, 5, w - 10, h - 10);
                    g.fillStyle(0x38bdf8, 0.32);
                    g.fillRect(8, 3, w - 16, 2);
                    g.fillCircle(7, 7, 1.5);
                    g.fillCircle(w - 7, 7, 1.5);
                });

                makeTextureSafe(this, 'emb_tile_platform', TILE, 14, (g, w, h) => {
                    g.fillStyle(0x1e293b, 1);
                    g.fillRoundedRect(0, 0, w, h, 3);
                    g.fillStyle(0x38bdf8, 0.85);
                    g.fillRect(2, 1, w - 4, 3);
                    g.fillStyle(0x0f172a, 1);
                    for (let x = 6; x < w - 6; x += 8) {
                        g.fillRect(x, 6, 4, 5);
                    }
                });

                makeTextureSafe(this, 'emb_door_shield', 28, TILE * 3, (g, w, h) => {
                    g.fillStyle(0x0c192c, 0.9);
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

                makeTextureSafe(this, 'emb_acid', TILE, TILE, (g, w, h) => {
                    g.fillStyle(0x052e16, 0.95);
                    g.fillRect(0, 0, w, h);
                    g.fillStyle(0x22c55e, 0.75);
                    g.fillRect(0, 0, w, 10);
                    g.fillStyle(0x86efac, 0.9);
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

                makeTextureSafe(this, 'emb_pickup_hp', 24, 24, (g) => {
                    g.fillStyle(0x064e3b, 1);
                    g.fillRoundedRect(2, 2, 20, 20, 6);
                    g.lineStyle(2, 0x34d399, 1);
                    g.strokeRoundedRect(2, 2, 20, 20, 6);
                    g.fillStyle(0x34d399, 1);
                    g.fillRect(10, 6, 4, 12);
                    g.fillRect(6, 10, 12, 4);
                });

                makeTextureSafe(this, 'emb_pickup_msl', 24, 24, (g) => {
                    g.fillStyle(0x451a03, 1);
                    g.fillRoundedRect(2, 2, 20, 20, 6);
                    g.lineStyle(2, 0xf59e0b, 1);
                    g.strokeRoundedRect(2, 2, 20, 20, 6);
                    g.fillStyle(0xfbbf24, 1);
                    g.fillTriangle(12, 5, 18, 17, 6, 17);
                });

                makeTextureSafe(this, 'emb_portal', 56, 78, (g, w, h) => {
                    g.lineStyle(4, 0x22d3ee, 0.9);
                    g.strokeEllipse(w / 2, h / 2, w - 8, h - 8);
                    g.fillStyle(0x0ea5e9, 0.35);
                    g.fillEllipse(w / 2, h / 2, w - 16, h - 16);
                    g.lineStyle(2, 0xa855f7, 0.9);
                    g.strokeEllipse(w / 2, h / 2, w - 26, h - 26);
                });
            }

            createParallaxBackdrop(accent) {
                const bg = this.add.graphics().setScrollFactor(0).setDepth(-20);
                bg.fillGradientStyle(0x040714, 0x040714, 0x091229, 0x091229, 1);
                bg.fillRect(0, 0, 960, 580);
                bg.fillStyle(accent, 0.08);
                bg.fillCircle(240, 180, 220);
                bg.fillStyle(0x7c3aed, 0.07);
                bg.fillCircle(740, 360, 260);

                // Far stars (scrollFactor 0.12)
                const starsG = this.add.graphics().setScrollFactor(0.12).setDepth(-18);
                for (let i = 0; i < 90; i++) {
                    const sx = ((i * 197 + 41) % 1400);
                    const sy = ((i * 131 + 23) % 900);
                    starsG.fillStyle(i % 5 === 0 ? accent : 0xe2e8f0, 0.28 + (i % 4) * 0.14);
                    starsG.fillCircle(sx, sy, (i % 3) * 0.6 + 0.8);
                }

                // Mid nebula cyber-grid (scrollFactor 0.35)
                const gridG = this.add.graphics().setScrollFactor(0.35).setDepth(-15);
                gridG.lineStyle(1, accent, 0.08);
                for (let x = 0; x <= 1800; x += 80) {
                    gridG.lineBetween(x, 0, x, 1100);
                }
                for (let y = 0; y <= 1100; y += 80) {
                    gridG.lineBetween(0, y, 1800, y);
                }
            }

            buildSectorFromGrid(grid) {
                const rows = grid.length;
                const cols = grid[0].length;
                const visitedDoors = new Set();

                // Merge contiguous horizontal solid wall spans `#` to prevent Arcade Physics seam snagging
                for (let r = 0; r < rows; r++) {
                    let c = 0;
                    while (c < cols) {
                        if (grid[r][c] === '#') {
                            const startC = c;
                            while (c < cols && grid[r][c] === '#') c++;
                            const spanW = (c - startC) * TILE;
                            const cx = startC * TILE + spanW * 0.5;
                            const cy = r * TILE + TILE * 0.5;
                            const tile = this.add.tileSprite(cx, cy, spanW, TILE, 'emb_tile_hull').setDepth(4);
                            this.physics.add.existing(tile, true);
                            this.solids.add(tile);
                            this.parsedWalls.push({ x: startC * TILE, y: r * TILE, w: spanW, h: TILE, kind: 'wall' });
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
                            const spanW = (c - startC) * TILE;
                            const cx = startC * TILE + spanW * 0.5;
                            const cy = r * TILE + 7;
                            const plat = this.add.tileSprite(cx, cy, spanW, 14, 'emb_tile_platform').setDepth(4);
                            this.physics.add.existing(plat, true);
                            this.oneWays.add(plat);
                            plat.body.checkCollision.down = false;
                            plat.body.checkCollision.left = false;
                            plat.body.checkCollision.right = false;
                            this.parsedWalls.push({ x: startC * TILE, y: r * TILE, w: spanW, h: 14, kind: 'plat' });
                        } else {
                            c++;
                        }
                    }
                }

                this.spawnPoint = { x: 160, y: 360 };
                this.bossArenaBounds = { minX: 980, maxX: this.worldW - 80, floorY: (rows - 2) * TILE };

                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        const ch = grid[r][c];
                        const wx = c * TILE + TILE * 0.5;
                        const wy = r * TILE + TILE * 0.5;

                        if (ch === 'P') {
                            this.spawnPoint = { x: wx, y: wy };
                        } else if (ch === '~') {
                            const acid = this.add.tileSprite(wx, wy + 6, TILE, TILE - 12, 'emb_acid').setDepth(6);
                            this.physics.add.existing(acid, true);
                            this.acids.add(acid);
                        } else if (ch === 'D' && !visitedDoors.has(`${r},${c}`)) {
                            let endR = r;
                            while (endR + 1 < rows && grid[endR + 1][c] === 'D') {
                                endR++;
                                visitedDoors.add(`${endR},${c}`);
                            }
                            const doorH = (endR - r + 1) * TILE;
                            const doorCy = r * TILE + doorH * 0.5;
                            const door = this.doors.create(wx, doorCy, 'emb_door_shield').setDepth(7);
                            door.setDisplaySize(28, doorH).refreshBody();
                            door.setData('hp', 1);
                            this.doorRefs.push(door);
                        } else if (ch === 'S') {
                            this.spawnSpiderBot(wx, wy);
                        } else if (ch === 'M') {
                            this.spawnPatrolMech(wx, wy);
                        } else if (ch === 'R') {
                            const rec = this.reactors.create(wx, wy - 4, 'emb_reactor').setDepth(8);
                            rec.setDisplaySize(46, 46).refreshBody();
                            rec.setData('hp', 120);
                            rec.setData('maxHp', 120);
                            this.reactorObj = rec;
                        } else if (ch === 'B') {
                            this.bossTriggerX = 1080;
                            this.bossSpawnPos = { x: wx, y: wy - 20 };
                        } else if (ch === 'X') {
                            this.portalObj = this.add.sprite(wx, wy - 14, 'emb_portal').setDepth(7);
                            this.portalObj.setAlpha(0.32);
                            this.portalUnlocked = false;
                        } else if (ch === 'H') {
                            const hp = this.pickups.create(wx, wy, 'emb_pickup_hp').setDepth(8);
                            hp.setData('kind', 'hp');
                            this.tweens.add({ targets: hp, y: wy - 6, yoyo: true, repeat: -1, duration: 900, ease: 'Sine.InOut' });
                        } else if (ch === 'A') {
                            const msl = this.pickups.create(wx, wy, 'emb_pickup_msl').setDepth(8);
                            msl.setData('kind', 'missile');
                            this.tweens.add({ targets: msl, y: wy - 6, yoyo: true, repeat: -1, duration: 850, ease: 'Sine.InOut' });
                        }
                    }
                }
            }

            createPlayer() {
                const p = this.physics.add.sprite(this.spawnPoint.x, this.spawnPoint.y, 'emb_trooper').setDepth(12);
                p.setDisplaySize(44, 48);
                setWorldBody(p, 24, 40);
                p.setCollideWorldBounds(true);
                p.setMaxVelocity(680, 740);
                this.player = p;

                this.facing = 1;
                this.jumpsLeft = 2;
                this.coyoteTimer = 0;
                this.dashTimer = 0;
                this.dashCooldown = 0;
                this.invulnTimer = 0;
                this.slashCooldown = 0;
                this.missileCooldown = 0;
                this.missileRegenTimer = 0;
                this.slashCombo = 0;
                this.wallSliding = false;
                this.wallNormal = 0;
                this.lastSafeX = this.spawnPoint.x;
                this.lastSafeY = this.spawnPoint.y;
            }

            spawnSpiderBot(x, y) {
                const s = this.enemies.create(x, y, 'emb_spider').setDepth(10);
                s.setDisplaySize(38, 34);
                setWorldBody(s, 30, 26);
                s.setCollideWorldBounds(true);
                const hp = Math.round(55 * this.difficultyMult);
                s.setData({
                    kind: 'spider',
                    hp,
                    maxHp: hp,
                    dir: -1,
                    fireTimer: 1.2 + Math.random() * 1.1,
                    stunTimer: 0,
                    hopTimer: 0.7 + Math.random() * 0.8
                });
                this.enemyList.push(s);
                return s;
            }

            spawnPatrolMech(x, y) {
                const m = this.enemies.create(x, y - 6, 'emb_mech').setDepth(10);
                m.setDisplaySize(54, 58);
                setWorldBody(m, 40, 48);
                m.setCollideWorldBounds(true);
                const hp = Math.round(145 * this.difficultyMult);
                m.setData({
                    kind: 'mech',
                    hp,
                    maxHp: hp,
                    dir: -1,
                    fireTimer: 1.4 + Math.random() * 0.8,
                    stunTimer: 0
                });
                this.enemyList.push(m);
                return m;
            }

            spawnAegisBoss(x, y) {
                if (this.bossSpawned) return;
                this.bossSpawned = true;
                safePlay(ctx, 'bossAlarm');
                this.showBanner(
                    this.endlessMode ? `AEGIS WARDEN MK-${this.sectorNum - 2}` : tr('AEGIS MUHAFIZI UYANDI!', 'AEGIS WARDEN AWAKENED!'),
                    '#fb7185'
                );

                // Lock Boss Chamber behind player so duel stays centered
                if (!this.vaultBarrier && !this.endlessMode) {
                    const bx = 1020;
                    const wall = this.add.tileSprite(bx, 500, 28, 120, 'emb_door_shield').setDepth(7);
                    wall.setTint(0xa855f7);
                    this.physics.add.existing(wall, true);
                    this.solids.add(wall);
                    this.vaultBarrier = wall;
                }

                const b = this.enemies.create(x, y - 24, 'emb_boss').setDepth(11);
                b.setDisplaySize(108, 118);
                setWorldBody(b, 74, 98);
                b.setCollideWorldBounds(true);
                const hp = Math.round((this.endlessMode ? 700 : 880) * this.difficultyMult);
                b.setData({
                    kind: 'boss',
                    hp,
                    maxHp: hp,
                    dir: -1,
                    aiTimer: 1.2,
                    patternIdx: 0,
                    stunTimer: 0,
                    slamActive: false
                });
                this.activeBoss = b;
                this.enemyList.push(b);
            }

            createCanvasOverlayHud() {
                // Minimap HUD Radar in top-right + Weapon/Armor Pips in top-left
                this.hudGraphics = this.add.graphics().setScrollFactor(0).setDepth(100);
                this.minimapGraphics = this.add.graphics().setScrollFactor(0).setDepth(101);
                this.hudTitleTxt = this.add.text(16, 12, this.sectorLabel, {
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '12px',
                    fontStyle: 'bold',
                    color: '#38bdf8'
                }).setScrollFactor(0).setDepth(102);

                this.hudAbilityTxt = this.add.text(16, 56, '', {
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '11px',
                    color: '#cbd5e1'
                }).setScrollFactor(0).setDepth(102);

                this.bossBarTxt = this.add.text(480, 14, '', {
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '13px',
                    fontStyle: 'bold',
                    color: '#f43f5e'
                }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(102).setVisible(false);

                this.bannerTxt = this.add.text(480, 120, '', {
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '24px',
                    fontStyle: 'bold',
                    color: '#38bdf8',
                    stroke: '#020617',
                    strokeThickness: 5
                }).setOrigin(0.5).setScrollFactor(0).setDepth(110).setAlpha(0);

                this.controlsHintTxt = this.add.text(480, 558, tr(
                    'A/D Yürü · W/Space x2 Zıpla · Duvar Kayma · J/Tık Plazma · K/Sağ Tık Füze · L/Shift Atılma',
                    'A/D Move · W/Space x2 Jump · Wall-Slide · J/LMB Slash · K/RMB Missile · L/Shift Dash'
                ), {
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '11px',
                    color: '#94a3b8',
                    backgroundColor: 'rgba(5,8,22,0.72)',
                    padding: { x: 10, y: 4 }
                }).setOrigin(0.5).setScrollFactor(0).setDepth(102);
            }

            showBanner(text, color) {
                if (!this.bannerTxt) return;
                this.bannerTxt.setText(text);
                this.bannerTxt.setColor(color || '#38bdf8');
                this.bannerTxt.setAlpha(1);
                this.bannerTxt.setScale(0.92);
                this.tweens.killTweensOf(this.bannerTxt);
                this.tweens.add({
                    targets: this.bannerTxt,
                    alpha: { from: 1, to: 0 },
                    scale: { from: 0.92, to: 1.06 },
                    duration: 2100,
                    ease: 'Cubic.Out'
                });
            }

            spawnPopup(x, y, text, color) {
                const txt = this.add.text(x, y, text, {
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '13px',
                    fontStyle: 'bold',
                    color: color || '#38bdf8',
                    stroke: '#020617',
                    strokeThickness: 3
                }).setOrigin(0.5).setDepth(60);
                this.tweens.add({
                    targets: txt,
                    y: y - 34,
                    alpha: 0,
                    duration: 750,
                    onComplete: () => txt.destroy()
                });
            }

            update(time, delta) {
                if (syncPhaserPause(this, ctx, runtime.input) || this.ended) return;
                const dt = Math.min(delta, 50) / 1000;
                const inp = runtime.input;

                // Timers
                if (this.invulnTimer > 0) {
                    this.invulnTimer -= dt;
                    this.player.setAlpha(Math.floor(this.invulnTimer * 18) % 2 === 0 ? 0.45 : 1);
                } else if (this.dashTimer <= 0) {
                    this.player.setAlpha(1);
                }
                if (this.dashCooldown > 0) this.dashCooldown -= dt;
                if (this.slashCooldown > 0) this.slashCooldown -= dt;
                if (this.missileCooldown > 0) this.missileCooldown -= dt;

                // Passive missile recharge so Shield Doors never softlock
                if (this.missiles < 5) {
                    this.missileRegenTimer += dt;
                    if (this.missileRegenTimer >= 3.2) {
                        this.missileRegenTimer = 0;
                        this.missiles++;
                    }
                } else {
                    this.missileRegenTimer = 0;
                }

                this.handlePlayerMovement(dt, inp);
                this.handlePlayerCombat(inp);
                this.updateEnemies(dt);
                this.updateMissiles(dt);
                this.checkBossAndPortalTriggers(dt);
                this.drawCanvasHudAndMinimap();
                this.syncExternalHud();

                inp.clearFrame();
            }

            handlePlayerMovement(dt, inp) {
                const p = this.player;
                const onFloor = p.body.blocked.down || p.body.touching.down;
                const onLeftWall = p.body.blocked.left;
                const onRightWall = p.body.blocked.right;

                if (onFloor) {
                    this.jumpsLeft = 2;
                    this.coyoteTimer = 0.12;
                    // Save safe respawn ground away from acid edges
                    if (p.y < this.worldH - TILE * 2.5) {
                        this.lastSafeX = p.x;
                        this.lastSafeY = p.y - 4;
                    }
                } else {
                    this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
                }

                const moveLeft = inp.isDown('KeyA', 'ArrowLeft', 'a');
                const moveRight = inp.isDown('KeyD', 'ArrowRight', 'd');
                const moveDir = (moveRight ? 1 : 0) - (moveLeft ? 1 : 0);
                if (moveDir !== 0 && this.dashTimer <= 0) {
                    this.facing = moveDir;
                    p.setFlipX(this.facing < 0);
                }

                // Phase Dash [L / Shift]
                if (inp.consume('KeyL', 'ShiftLeft', 'ShiftRight', 'l') && this.dashCooldown <= 0) {
                    this.dashTimer = 0.17;
                    this.dashCooldown = 0.62;
                    this.invulnTimer = Math.max(this.invulnTimer, 0.28);
                    p.body.setAllowGravity(false);
                    p.setVelocity(this.facing * 690, 0);
                    safePlay(ctx, 'dash');
                    this.spawnDashAfterimages();
                }

                if (this.dashTimer > 0) {
                    this.dashTimer -= dt;
                    if (this.dashTimer <= 0) {
                        p.body.setAllowGravity(true);
                        p.setVelocityX(this.facing * 220);
                    }
                    return;
                }

                // Wall-slide physics
                this.wallSliding = false;
                if (!onFloor && p.body.velocity.y > 0 && ((onLeftWall && moveLeft) || (onRightWall && moveRight))) {
                    this.wallSliding = true;
                    this.wallNormal = onLeftWall ? 1 : -1;
                    p.setVelocityY(Math.min(p.body.velocity.y, 135));
                    if (Math.random() < 0.35) {
                        this.sparkEmitter.setParticleTint(0x38bdf8);
                        this.sparkEmitter.explode(1, p.x - this.wallNormal * 12, p.y + 8);
                    }
                }

                // Horizontal acceleration
                const targetVx = moveDir * 295;
                p.setVelocityX(lerp(p.body.velocity.x, targetVx, clamp(dt * 18, 0, 1)));

                // Jump / Double Jump / Wall Jump [W / Space / Up]
                if (inp.consume('KeyW', 'Space', 'ArrowUp', 'w')) {
                    if (this.wallSliding) {
                        p.setVelocityY(-515);
                        p.setVelocityX(this.wallNormal * 350);
                        this.facing = this.wallNormal;
                        p.setFlipX(this.facing < 0);
                        this.jumpsLeft = 1;
                        safePlay(ctx, 'dash', 0.2);
                        this.sparkEmitter.setParticleTint(0x38bdf8);
                        this.sparkEmitter.explode(8, p.x, p.y + 12);
                    } else if (this.coyoteTimer > 0) {
                        p.setVelocityY(-525);
                        this.coyoteTimer = 0;
                        this.jumpsLeft = 1;
                        safePlay(ctx, 'uiClick');
                        this.sparkEmitter.setParticleTint(0x38bdf8);
                        this.sparkEmitter.explode(6, p.x, p.y + 18);
                    } else if (this.jumpsLeft > 0) {
                        p.setVelocityY(-485);
                        this.jumpsLeft--;
                        safePlay(ctx, 'dash', 0.25);
                        this.sparkEmitter.setParticleTint(0x22d3ee);
                        this.sparkEmitter.explode(10, p.x, p.y + 18);
                    }
                }
            }

            spawnDashAfterimages() {
                for (let i = 0; i < 4; i++) {
                    this.time.delayedCall(i * 35, () => {
                        if (!this.player || !this.player.active) return;
                        const ghost = this.add.image(this.player.x, this.player.y, 'emb_trooper')
                            .setDisplaySize(44, 48)
                            .setFlipX(this.facing < 0)
                            .setTint(0x22d3ee)
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

            handlePlayerCombat(inp) {
                if (inp.consume('KeyJ', 'j')) {
                    this.tryPlasmaSlash(null);
                }
                if (inp.consume('KeyK', 'k')) {
                    this.tryFireMissile(null);
                }
            }

            tryPlasmaSlash(pointer) {
                if (this.slashCooldown > 0) return;
                this.slashCooldown = 0.26;
                safePlay(ctx, 'shootLaser', 0.12);

                let slashDir = this.facing;
                if (pointer) {
                    const wp = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
                    slashDir = wp.x >= this.player.x ? 1 : -1;
                    this.facing = slashDir;
                    this.player.setFlipX(slashDir < 0);
                }

                const sx = this.player.x + slashDir * 44;
                const sy = this.player.y - 2;
                const arc = this.add.image(sx, sy, 'emb_slash_crescent')
                    .setDepth(20)
                    .setFlipX(slashDir < 0)
                    .setScale(0.95);
                this.tweens.add({
                    targets: arc,
                    alpha: 0,
                    scaleX: 1.18,
                    scaleY: 1.08,
                    duration: 165,
                    onComplete: () => arc.destroy()
                });

                // Hitbox check against enemies, reactors & parry enemy bolts
                const slashRect = new global.Phaser.Geom.Rectangle(sx - 56, sy - 48, 112, 96);
                let hitSomething = false;

                for (let i = 0; i < this.enemyList.length; i++) {
                    const en = this.enemyList[i];
                    if (!en || !en.active) continue;
                    if (global.Phaser.Geom.Rectangle.Overlaps(slashRect, en.getBounds())) {
                        hitSomething = true;
                        this.damageEnemy(en, 38, slashDir * 190);
                    }
                }

                this.reactors.getChildren().forEach((rec) => {
                    if (rec.active && global.Phaser.Geom.Rectangle.Overlaps(slashRect, rec.getBounds())) {
                        hitSomething = true;
                        this.onHitReactor(rec, 34, null);
                    }
                });

                // Plasma Slash destroys enemy plasma bolts inside arc!
                this.enemyBolts.getChildren().forEach((bolt) => {
                    if (bolt.active && global.Phaser.Geom.Rectangle.Overlaps(slashRect, bolt.getBounds())) {
                        this.sparkEmitter.setParticleTint(0x38bdf8);
                        this.sparkEmitter.explode(6, bolt.x, bolt.y);
                        bolt.destroy();
                        this.score += 15;
                        this.spawnPopup(bolt.x, bolt.y, 'DEFLECT +15', '#38bdf8');
                    }
                });

                if (hitSomething) {
                    this.slashCombo++;
                    if (this.slashCombo % 3 === 0 && this.missiles < 5) {
                        this.missiles++;
                        this.spawnPopup(this.player.x, this.player.y - 36, '+1 MISSILE', '#fbbf24');
                    }
                    this.cameras.main.shake(70, 0.004);
                }
            }

            tryFireMissile(pointer) {
                if (this.missileCooldown > 0) return;
                if (this.missiles <= 0) {
                    this.spawnPopup(this.player.x, this.player.y - 32, tr('FÜZE DOLUYOR...', 'RECHARGING...'), '#f59e0b');
                    return;
                }
                this.missiles--;
                this.missileCooldown = 0.35;
                safePlay(ctx, 'shootMissile', 0.1);

                let aimAngle = this.facing > 0 ? 0 : Math.PI;
                if (pointer) {
                    const wp = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
                    aimAngle = Math.atan2(wp.y - this.player.y, wp.x - this.player.x);
                    this.facing = Math.cos(aimAngle) >= 0 ? 1 : -1;
                    this.player.setFlipX(this.facing < 0);
                }

                const msl = this.playerMissiles.create(this.player.x + Math.cos(aimAngle) * 24, this.player.y - 4, 'emb_missile').setDepth(18);
                msl.body.setAllowGravity(false);
                msl.setRotation(aimAngle);
                msl.setData('life', 2.4);
                msl.setData('speed', 430);
                this.physics.velocityFromRotation(aimAngle, 430, msl.body.velocity);
            }

            updateMissiles(dt) {
                this.playerMissiles.getChildren().forEach((msl) => {
                    if (!msl.active) return;
                    let life = (msl.getData('life') || 0) - dt;
                    if (life <= 0) {
                        msl.destroy();
                        return;
                    }
                    msl.setData('life', life);

                    // Find closest enemy or locked shield door for smooth homing curve
                    let bestTarget = null;
                    let bestDist = 420;
                    for (let i = 0; i < this.enemyList.length; i++) {
                        const en = this.enemyList[i];
                        if (!en || !en.active) continue;
                        const d = global.Phaser.Math.Distance.Between(msl.x, msl.y, en.x, en.y);
                        if (d < bestDist) {
                            bestDist = d;
                            bestTarget = en;
                        }
                    }
                    if (!bestTarget) {
                        for (let i = 0; i < this.doorRefs.length; i++) {
                            const dr = this.doorRefs[i];
                            if (!dr || !dr.active) continue;
                            const d = global.Phaser.Math.Distance.Between(msl.x, msl.y, dr.x, dr.y);
                            if (d < bestDist) {
                                bestDist = d;
                                bestTarget = dr;
                            }
                        }
                    }

                    if (bestTarget) {
                        const desired = Math.atan2(bestTarget.y - msl.y, bestTarget.x - msl.x);
                        const cur = msl.rotation;
                        const nextAng = cur + wrapAngle(desired - cur) * clamp(dt * 7.5, 0, 1);
                        msl.setRotation(nextAng);
                        this.physics.velocityFromRotation(nextAng, msl.getData('speed') || 430, msl.body.velocity);
                    }

                    if (Math.random() < 0.65) {
                        this.sparkEmitter.setParticleTint(0xf59e0b);
                        this.sparkEmitter.explode(1, msl.x, msl.y);
                    }
                });
            }

            onMissileHitDoor(msl, door) {
                if (!msl.active || !door.active) return;
                this.detonateMissile(msl, null);
                safePlay(ctx, 'explodeBoss');
                this.cameras.main.shake(150, 0.01);
                this.sparkEmitter.setParticleTint(0xfbbf24);
                this.sparkEmitter.explode(22, door.x, door.y);
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
                this.sparkEmitter.explode(16, mx, my);

                // Splash damage + Mech stun!
                for (let i = 0; i < this.enemyList.length; i++) {
                    const en = this.enemyList[i];
                    if (!en || !en.active) continue;
                    const d = global.Phaser.Math.Distance.Between(mx, my, en.x, en.y);
                    if (en === directEnemy || d <= 72) {
                        const dmg = en === directEnemy ? 75 : 42;
                        if (en.getData('kind') === 'mech' || en.getData('kind') === 'boss') {
                            en.setData('stunTimer', en.getData('kind') === 'boss' ? 0.65 : 2.1);
                            this.spawnPopup(en.x, en.y - 38, tr('SERSEMLEDİ!', 'STUNNED!'), '#22d3ee');
                        }
                        this.damageEnemy(en, dmg, (en.x >= mx ? 1 : -1) * 160);
                    }
                }
            }

            damageEnemy(en, dmg, knockVx) {
                if (!en || !en.active) return;
                let hp = (en.getData('hp') || 0) - dmg;
                en.setData('hp', hp);
                en.setTint(0xffffff);
                this.time.delayedCall(90, () => {
                    if (en && en.active) en.clearTint();
                });
                safePlay(ctx, 'hitMetal', 0.15);

                if (en.getData('kind') !== 'boss') {
                    en.setVelocityX(knockVx || 0);
                }

                if (hp <= 0) {
                    const kind = en.getData('kind');
                    const pts = kind === 'boss' ? 600 : (kind === 'mech' ? 180 : 90);
                    const multPts = Math.round(pts * (this.endlessMode ? this.difficultyMult : 1));
                    this.score += multPts;
                    safePlay(ctx, kind === 'boss' ? 'explodeBoss' : 'explodeSmall');
                    this.sparkEmitter.setParticleTint(kind === 'boss' ? 0xa855f7 : 0xfb7185);
                    this.sparkEmitter.explode(kind === 'boss' ? 42 : 18, en.x, en.y);
                    this.spawnPopup(en.x, en.y - 18, `+${multPts}`, '#34d399');

                    if (kind === 'boss') {
                        this.onBossKilled(en);
                    } else if (Math.random() < 0.35 && this.missiles < 5) {
                        this.missiles++;
                    }
                    en.destroy();
                }
            }

            onHitReactor(rec, dmg, msl) {
                if (msl && msl.active) msl.destroy();
                if (!rec || !rec.active) return;
                let hp = (rec.getData('hp') || 0) - dmg;
                rec.setData('hp', hp);
                rec.setTint(0xffffff);
                this.time.delayedCall(90, () => { if (rec && rec.active) rec.clearTint(); });
                safePlay(ctx, 'hitShield', 0.12);
                this.sparkEmitter.setParticleTint(0x22d3ee);
                this.sparkEmitter.explode(10, rec.x, rec.y);

                if (hp <= 0) {
                    this.reactorDestroyed = true;
                    this.score += 350;
                    safePlay(ctx, 'explodeBoss');
                    this.cameras.main.shake(220, 0.012);
                    this.sparkEmitter.setParticleTint(0x34d399);
                    this.sparkEmitter.explode(36, rec.x, rec.y);
                    this.spawnPopup(rec.x, rec.y - 24, tr('ÇEKİRDEK İMHA +350', 'REACTOR SHATTERED +350'), '#34d399');
                    rec.destroy();
                    this.unlockExtractionPortal();
                }
            }

            unlockExtractionPortal() {
                this.portalUnlocked = true;
                if (this.portalObj) {
                    this.portalObj.setAlpha(1);
                    this.tweens.add({
                        targets: this.portalObj,
                        scale: { from: 0.95, to: 1.15 },
                        yoyo: true,
                        repeat: -1,
                        duration: 600
                    });
                }
                safePlay(ctx, 'levelup');
                this.showBanner(tr('GEÇİT AÇILDI — ÇIKIŞA ULAŞ!', 'EXTRACTION PORTAL OPEN!'), '#34d399');
            }

            onBossKilled(boss) {
                this.bossDefeated = true;
                this.activeBoss = null;
                this.cameras.main.shake(280, 0.016);
                if (this.endlessMode) {
                    this.endlessWave++;
                    this.sectorNum++;
                    this.difficultyMult = 1 + (this.sectorNum - 3) * 0.35;
                    this.lives = Math.min(6, this.lives + 1);
                    this.missiles = 5;
                    this.showBanner(`WAVE CLEARED · SECTOR ${this.sectorNum}`, '#34d399');
                    this.time.delayedCall(1400, () => {
                        if (!this.ended) this.spawnEndlessWave();
                    });
                } else {
                    this.unlockExtractionPortal();
                }
            }

            updateEnemies(dt) {
                for (let i = this.enemyList.length - 1; i >= 0; i--) {
                    const en = this.enemyList[i];
                    if (!en || !en.active) {
                        this.enemyList.splice(i, 1);
                        continue;
                    }
                    const kind = en.getData('kind');
                    let stun = en.getData('stunTimer') || 0;
                    if (stun > 0) {
                        en.setData('stunTimer', stun - dt);
                        en.setTint(0x38bdf8);
                        if (kind !== 'boss') en.setVelocityX(0);
                        continue;
                    } else if (en.tintTopLeft === 0x38bdf8) {
                        en.clearTint();
                    }

                    const dx = this.player.x - en.x;
                    const dy = this.player.y - en.y;
                    const dist = Math.hypot(dx, dy);

                    if (kind === 'spider') {
                        let dir = en.getData('dir') || -1;
                        if (en.body.blocked.left) dir = 1;
                        if (en.body.blocked.right) dir = -1;
                        en.setData('dir', dir);
                        const spd = (dist < 280 ? 125 : 80) * this.difficultyMult;
                        if (dist < 280) {
                            dir = dx >= 0 ? 1 : -1;
                            en.setData('dir', dir);
                        }
                        en.setVelocityX(dir * spd);
                        en.setFlipX(dir < 0);

                        let hopT = (en.getData('hopTimer') || 0) - dt;
                        if (hopT <= 0 && en.body.blocked.down && dist < 240) {
                            en.setVelocityY(-340);
                            hopT = 1.6;
                        }
                        en.setData('hopTimer', hopT);

                        let fireT = (en.getData('fireTimer') || 0) - dt;
                        if (fireT <= 0 && dist < 360) {
                            fireT = Math.max(1.0, 2.2 / this.difficultyMult);
                            this.fireEnemyBolt(en.x, en.y, Math.atan2(dy, dx), 250);
                        }
                        en.setData('fireTimer', fireT);
                    } else if (kind === 'mech') {
                        let dir = dist < 420 ? (dx >= 0 ? 1 : -1) : (en.getData('dir') || -1);
                        if (en.body.blocked.left) dir = 1;
                        if (en.body.blocked.right) dir = -1;
                        en.setData('dir', dir);
                        en.setVelocityX(dir * 62 * this.difficultyMult);
                        en.setFlipX(dir < 0);

                        let fireT = (en.getData('fireTimer') || 0) - dt;
                        if (fireT <= 0 && dist < 440) {
                            fireT = Math.max(0.95, 1.8 / this.difficultyMult);
                            const baseA = Math.atan2(dy, dx);
                            this.fireEnemyBolt(en.x + dir * 18, en.y - 6, baseA, 295);
                            this.fireEnemyBolt(en.x + dir * 18, en.y - 6, baseA + (dx >= 0 ? -0.14 : 0.14), 275);
                        }
                        en.setData('fireTimer', fireT);
                    } else if (kind === 'boss') {
                        this.updateAegisBossAI(en, dt, dx, dy, dist);
                    }
                }
            }

            updateAegisBossAI(boss, dt, dx, dy, dist) {
                const moveDir = dx >= 0 ? 1 : -1;
                boss.setFlipX(moveDir < 0);

                // Arena pacing
                if (!boss.getData('slamActive')) {
                    boss.setVelocityX(moveDir * 78 * this.difficultyMult);
                }

                let aiT = (boss.getData('aiTimer') || 0) - dt;
                if (aiT <= 0) {
                    const pat = (boss.getData('patternIdx') || 0) % 3;
                    boss.setData('patternIdx', pat + 1);

                    if (pat === 0) {
                        // Plasma Burst Fan
                        const baseA = Math.atan2(dy, dx);
                        for (let k = -2; k <= 2; k++) {
                            this.fireEnemyBolt(boss.x, boss.y - 12, baseA + k * 0.2, 290 * this.difficultyMult);
                        }
                        safePlay(ctx, 'shootPlasma');
                        aiT = Math.max(0.9, 1.6 / this.difficultyMult);
                    } else if (pat === 1) {
                        // Seeker Leap & Ground Shockwave
                        boss.setData('slamActive', true);
                        boss.setVelocity(moveDir * 240, -470);
                        this.time.delayedCall(700, () => {
                            if (!boss || !boss.active || this.ended) return;
                            boss.setData('slamActive', false);
                            safePlay(ctx, 'explodeSmall');
                            this.cameras.main.shake(120, 0.008);
                            this.fireEnemyBolt(boss.x - 24, boss.y + 38, Math.PI, 320);
                            this.fireEnemyBolt(boss.x + 24, boss.y + 38, 0, 320);
                        });
                        aiT = Math.max(1.2, 2.0 / this.difficultyMult);
                    } else {
                        // Drone Summon + Radial Burst
                        if (this.enemyList.length < 5) {
                            this.spawnSpiderBot(clamp(boss.x + (Math.random() > 0.5 ? 90 : -90), 1040, this.worldW - 100), boss.y - 40);
                        }
                        for (let k = 0; k < 6; k++) {
                            this.fireEnemyBolt(boss.x, boss.y, (TAU / 6) * k, 250);
                        }
                        aiT = Math.max(1.1, 1.9 / this.difficultyMult);
                    }
                }
                boss.setData('aiTimer', aiT);
            }

            fireEnemyBolt(x, y, angle, speed) {
                const b = this.enemyBolts.create(x, y, 'emb_bolt_enemy').setDepth(15);
                b.body.setAllowGravity(false);
                b.body.setCircle(4, 3, 3);
                this.physics.velocityFromRotation(angle, speed, b.body.velocity);
                this.time.delayedCall(2800, () => { if (b && b.active) b.destroy(); });
            }

            spawnEndlessWave() {
                const count = 3 + Math.min(5, this.endlessWave);
                for (let i = 0; i < count; i++) {
                    const sx = 1080 + (i * 155) % 880;
                    const sy = 380 + (i % 2) * 140;
                    if (i % 3 === 2) {
                        this.spawnPatrolMech(sx, sy);
                    } else {
                        this.spawnSpiderBot(sx, sy);
                    }
                }
                if (this.endlessWave % 2 === 0) {
                    this.bossSpawned = false;
                    this.spawnAegisBoss(1640, 620);
                }
                // Supply drop in center
                const dropX = 1480;
                const hp = this.pickups.create(dropX - 40, 360, 'emb_pickup_hp').setDepth(8);
                hp.setData('kind', 'hp');
                const ms = this.pickups.create(dropX + 40, 360, 'emb_pickup_msl').setDepth(8);
                ms.setData('kind', 'missile');
            }

            collectPickup(item) {
                if (!item || !item.active) return;
                const kind = item.getData('kind');
                item.destroy();
                safePlay(ctx, 'powerup');
                if (kind === 'hp') {
                    this.lives = Math.min(6, this.lives + 1);
                    this.score += 50;
                    this.spawnPopup(this.player.x, this.player.y - 30, '+1 HULL', '#34d399');
                } else {
                    this.missiles = Math.min(5, this.missiles + 2);
                    this.score += 75;
                    this.spawnPopup(this.player.x, this.player.y - 30, '+2 MISSILES', '#fbbf24');
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
                if (!en || !en.active || (en.getData('stunTimer') || 0) > 0) return;
                this.damagePlayer(1);
            }

            onPlayerHitBolt(bolt) {
                if (!bolt || !bolt.active) return;
                bolt.destroy();
                this.damagePlayer(1);
            }

            damagePlayer(amt) {
                if (this.invulnTimer > 0 || this.ended) return;
                this.lives -= amt;
                this.invulnTimer = 1.25;
                safePlay(ctx, 'playerHurt');
                this.cameras.main.shake(140, 0.01);
                this.sparkEmitter.setParticleTint(0xfb7185);
                this.sparkEmitter.explode(14, this.player.x, this.player.y);

                if (this.lives <= 0) {
                    this.lives = 0;
                    this.ended = true;
                    this.syncExternalHud();
                    ctx.onGameOver({
                        score: this.score,
                        level: this.sectorNum,
                        stars: this.score >= 1200 ? 2 : (this.score >= 500 ? 1 : 0),
                        reason: tr('Exo-Zırh parçalandı. Sektör güvenliği seni durdurdu.', 'Exo-armor breached inside the reactor sector.')
                    });
                }
            }

            checkBossAndPortalTriggers(dt) {
                // Trigger Sector 3 Aegis Boss when entering East Vault
                if (this.bossTriggerX && !this.bossSpawned && this.player.x >= this.bossTriggerX) {
                    this.spawnAegisBoss(this.bossSpawnPos.x, this.bossSpawnPos.y);
                }

                // Endless Wave progression when all non-boss enemies cleared
                if (this.endlessMode && !this.activeBoss && this.enemyList.length === 0) {
                    this.endlessWaveTimer += dt;
                    if (this.endlessWaveTimer >= 1.2) {
                        this.endlessWaveTimer = 0;
                        this.endlessWave++;
                        this.sectorNum++;
                        this.difficultyMult = 1 + (this.sectorNum - 3) * 0.35;
                        this.score += 200;
                        this.showBanner(`ENDLESS SECTOR ${this.sectorNum}`, '#c084fc');
                        this.spawnEndlessWave();
                    }
                }

                // Story Win Condition
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

                // Extraction Portal Check
                if (this.portalUnlocked && this.portalObj) {
                    const d = global.Phaser.Math.Distance.Between(this.player.x, this.player.y, this.portalObj.x, this.portalObj.y);
                    if (d < 44) {
                        this.advanceSector();
                    }
                }
            }

            advanceSector() {
                if (this.ended) return;
                this.score += 250;
                safePlay(ctx, 'levelup');

                if (isStory && (this.sectorNum >= 3 || this.score >= storyTarget)) {
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

                // Advance to next Sector (or Endless Mode after Sector 3 in !isStory)
                const nextSec = this.sectorNum + 1;
                runtime.pendingLevel = nextSec;
                this.scene.restart({
                    level: nextSec,
                    carryScore: this.score,
                    carryLives: Math.min(6, this.lives + 1),
                    carryMissiles: 4
                });
            }

            drawCanvasHudAndMinimap() {
                const g = this.hudGraphics;
                g.clear();

                // Top-left tactical bars
                g.fillStyle(0x050816, 0.8);
                g.fillRoundedRect(10, 8, 250, 74, 8);
                g.lineStyle(1, 0x38bdf8, 0.35);
                g.strokeRoundedRect(10, 8, 250, 74, 8);

                // Armor Pips
                for (let i = 0; i < 6; i++) {
                    const active = i < this.lives;
                    g.fillStyle(active ? 0x34d399 : 0x1e293b, 1);
                    g.fillRoundedRect(18 + i * 20, 32, 16, 10, 3);
                }
                // Missile Pips
                for (let i = 0; i < 5; i++) {
                    const active = i < this.missiles;
                    g.fillStyle(active ? 0xf59e0b : 0x1e293b, 1);
                    g.fillRoundedRect(156 + i * 18, 32, 13, 10, 3);
                }

                const dashReady = this.dashCooldown <= 0;
                this.hudAbilityTxt.setText(
                    `MSL:${this.missiles}/5  DASH:${dashReady ? 'RDY' : Math.ceil(this.dashCooldown * 10) / 10 + 's'}  SCORE:${this.score}`
                );

                // Boss Bar
                if (this.activeBoss && this.activeBoss.active) {
                    this.bossBarTxt.setVisible(true);
                    this.bossBarTxt.setText(this.endlessMode ? `AEGIS WARDEN MK-${this.sectorNum - 2}` : 'AEGIS WARDEN');
                    const bw = 280;
                    const ratio = clamp((this.activeBoss.getData('hp') || 0) / (this.activeBoss.getData('maxHp') || 1), 0, 1);
                    g.fillStyle(0x090d1e, 0.9);
                    g.fillRoundedRect(480 - bw / 2, 34, bw, 12, 4);
                    g.fillStyle(0xf43f5e, 1);
                    g.fillRoundedRect(480 - bw / 2 + 2, 36, (bw - 4) * ratio, 8, 3);
                } else {
                    this.bossBarTxt.setVisible(false);
                }

                // Minimap Radar in top-right corner
                const mg = this.minimapGraphics;
                mg.clear();
                const mw = 166;
                const mh = 86;
                const mx = 960 - mw - 12;
                const my = 10;
                mg.fillStyle(0x040712, 0.84);
                mg.fillRoundedRect(mx, my, mw, mh, 6);
                mg.lineStyle(1, 0x38bdf8, 0.42);
                mg.strokeRoundedRect(mx, my, mw, mh, 6);

                const sx = mw / this.worldW;
                const sy = mh / this.worldH;

                for (let i = 0; i < this.parsedWalls.length; i++) {
                    const w = this.parsedWalls[i];
                    mg.fillStyle(w.kind === 'wall' ? 0x334155 : 0x475569, 0.85);
                    mg.fillRect(mx + w.x * sx, my + w.y * sy, Math.max(1.5, w.w * sx), Math.max(1.5, w.h * sy));
                }
                for (let i = 0; i < this.doorRefs.length; i++) {
                    const d = this.doorRefs[i];
                    if (d && d.active) {
                        mg.fillStyle(0xf59e0b, 1);
                        mg.fillRect(mx + d.x * sx - 1.5, my + d.y * sy - 3, 3, 6);
                    }
                }
                if (this.reactorObj && this.reactorObj.active) {
                    mg.fillStyle(0x22d3ee, 1);
                    mg.fillCircle(mx + this.reactorObj.x * sx, my + this.reactorObj.y * sy, 3);
                }
                if (this.portalObj && this.portalUnlocked) {
                    mg.fillStyle(0x34d399, 1);
                    mg.fillCircle(mx + this.portalObj.x * sx, my + this.portalObj.y * sy, 3.5);
                }
                for (let i = 0; i < this.enemyList.length; i++) {
                    const en = this.enemyList[i];
                    if (!en || !en.active) continue;
                    mg.fillStyle(en.getData('kind') === 'boss' ? 0xc084fc : 0xf43f5e, 1);
                    mg.fillCircle(mx + en.x * sx, my + en.y * sy, en.getData('kind') === 'boss' ? 4 : 2.2);
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
                        ? tr(`Sonsuz İhlal · Sektör ${this.sectorNum}`, `Endless Breach · Sector ${this.sectorNum}`)
                        : (this.portalUnlocked
                            ? tr('Çıkış Geçidine Gir!', 'Enter Extraction Gate!')
                            : (this.sectorNum === 3
                                ? tr('Aegis Muhafızını Yen!', 'Defeat Aegis Warden!')
                                : tr('Füze [K] ile Kapıyı Kır & Çekirdeği Yok Et', 'Breach [K] Door & Destroy Reactor'))));

                safeSetHud(ctx, {
                    score: this.score,
                    level: this.sectorNum,
                    maxLevel: this.endlessMode ? '∞' : 3,
                    lives: this.lives,
                    statusText: `${this.sectorLabel} · MSL ${this.missiles}/5`,
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

    // =========================================================================
    // GAME 2: phaser-stealth-heist — Top-Down Stealth Heist (Phaser 3 + ROT.js)
    // =========================================================================
    Engines['phaser-stealth-heist'] = function mountPhaserStealthHeist(ctx) {
        const tr = createTranslator(ctx);
        const isStory = resolveIsStory(ctx);
        const storyTarget = ctx.chapterTarget || 800;
        const TILE = 40;
        const Y_OFF = 20;
        const runtime = {};

        // 4 Handcrafted Deterministic Stealth Corridor Decks (24 x 13)
        const DECKS = [
            {
                id: 1,
                name: 'BRIDGE DECK',
                accent: 0x2dd4bf,
                map: [
                    '########################',
                    '#..P......V....P.....X.#',
                    '#.........#............#',
                    '#..L..P...#...1....P...#',
                    '#.........#............#',
                    '#....######....#####...#',
                    '#........1.............#',
                    '#..P............P..L...#',
                    '#.....#####............#',
                    '#..@......#....1....V..#',
                    '#.........#............#',
                    '#......P......P........#',
                    '########################'
                ]
            },
            {
                id: 2,
                name: 'CRYO CORRIDOR',
                accent: 0x38bdf8,
                map: [
                    '########################',
                    '#.@....#.....V....#...X#',
                    '#..L...#..........#....#',
                    '#......#...1......#..1.#',
                    '#..##..#####..#####....#',
                    '#......................#',
                    '#..P...2........P...L..#',
                    '#......................#',
                    '#..####..######..####..#',
                    '#..V.....#..........V..#',
                    '#.....1..#...L...1.....#',
                    '#........#.............#',
                    '########################'
                ]
            },
            {
                id: 3,
                name: 'ARMORY VAULT',
                accent: 0xf59e0b,
                map: [
                    '########################',
                    '#..V...#........#...X..#',
                    '#..L...#...1....#......#',
                    '#......#........#..L...#',
                    '#..##..##..##..##..##..#',
                    '#......P........P......#',
                    '#..1.......V........2..#',
                    '#......P........P......#',
                    '#..##..##..##..##..##..#',
                    '#..@.......#.......1...#',
                    '#......2...#...L....V..#',
                    '#..........#...........#',
                    '########################'
                ]
            },
            {
                id: 4,
                name: 'KAELEN FLAGSHIP',
                accent: 0xf43f5e,
                map: [
                    '########################',
                    '#.V....#...V....#....X.#',
                    '#..L...#...2....#...1..#',
                    '#......#........#......#',
                    '#..##..##..##..##..##..#',
                    '#....1..........1......#',
                    '#..P....L..P..L.....P..#',
                    '#...........2..........#',
                    '#..##..##..##..##..##..#',
                    '#..@.......#........V..#',
                    '#......1...#...L.......#',
                    '#..V.......#...........#',
                    '########################'
                ]
            }
        ];

        function buildEndlessDeckGrid(deckNum) {
            const cols = 24;
            const rows = 13;
            const grid = Array.from({ length: rows }, () => Array(cols).fill('#'));

            // Use window.ROT.Map.Digger when available, else clean procedural multi-room carving
            let rooms = [];
            if (global.ROT && global.ROT.Map && global.ROT.Map.Digger) {
                const digger = new global.ROT.Map.Digger(cols, rows, {
                    roomWidth: [3, 6],
                    roomHeight: [3, 5],
                    corridorLength: [1, 4],
                    dugPercentage: 0.45
                });
                digger.create((x, y, val) => {
                    if (x > 0 && x < cols - 1 && y > 0 && y < rows - 1) {
                        grid[y][x] = val === 0 ? '.' : '#';
                    }
                });
                if (typeof digger.getRooms === 'function') {
                    rooms = digger.getRooms();
                }
            } else {
                const templates = [
                    { x: 1, y: 1, w: 6, h: 4 },
                    { x: 9, y: 1, w: 6, h: 4 },
                    { x: 17, y: 1, w: 6, h: 4 },
                    { x: 1, y: 7, w: 6, h: 5 },
                    { x: 9, y: 6, w: 6, h: 6 },
                    { x: 17, y: 7, w: 6, h: 5 }
                ];
                for (const rm of templates) {
                    for (let ry = rm.y; ry < rm.y + rm.h; ry++) {
                        for (let rx = rm.x; rx < rm.x + rm.w; rx++) {
                            grid[ry][rx] = '.';
                        }
                    }
                }
                for (let x = 2; x <= 21; x++) { grid[3][x] = '.'; grid[9][x] = '.'; }
                for (let y = 2; y <= 10; y++) { grid[y][4] = '.'; grid[y][12] = '.'; grid[y][20] = '.'; }
            }

            // Collect walkable tiles and enforce 100% single-component connectivity
            const floors = [];
            for (let r = 1; r < rows - 1; r++) {
                for (let c = 1; c < cols - 1; c++) {
                    if (grid[r][c] === '.') floors.push({ r, c });
                }
            }
            if (floors.length < 20) {
                return DECKS[deckNum % DECKS.length].map;
            }

            // Pick spawn & farthest extraction via BFS
            const start = floors[0];
            const distMap = new Map();
            const q = [start];
            distMap.set(`${start.r},${start.c}`, 0);
            while (q.length) {
                const cur = q.shift();
                const d = distMap.get(`${cur.r},${cur.c}`);
                const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
                for (const [dr, dc] of dirs) {
                    const nr = cur.r + dr;
                    const nc = cur.c + dc;
                    const key = `${nr},${nc}`;
                    if (nr > 0 && nr < rows - 1 && nc > 0 && nc < cols - 1 && grid[nr][nc] === '.' && !distMap.has(key)) {
                        distMap.set(key, d + 1);
                        q.push({ r: nr, c: nc });
                    }
                }
            }

            // Connect any isolated room tiles to start if needed
            const reachable = [];
            let farthest = start;
            let maxD = -1;
            for (const f of floors) {
                const d = distMap.get(`${f.r},${f.c}`);
                if (d !== undefined) {
                    reachable.push(f);
                    if (d > maxD) {
                        maxD = d;
                        farthest = f;
                    }
                }
            }
            if (reachable.length < 18) {
                return DECKS[(deckNum - 1) % DECKS.length].map;
            }

            grid[start.r][start.c] = '@';
            grid[farthest.r][farthest.c] = 'X';

            // Place 3-4 Data Vaults, 3 Lockers, Cover Pillars, and Guards along reachable tiles
            const step = Math.max(3, Math.floor(reachable.length / 12));
            let vaults = 0;
            let lockers = 0;
            let guards = 0;
            const maxGuards = 4 + Math.min(4, deckNum - 4);
            for (let i = 4; i < reachable.length - 2; i += step) {
                const t = reachable[i];
                if (grid[t.r][t.c] !== '.') continue;
                if (vaults < 4) {
                    grid[t.r][t.c] = 'V';
                    vaults++;
                } else if (lockers < 3) {
                    grid[t.r][t.c] = 'L';
                    lockers++;
                } else if (guards < maxGuards) {
                    grid[t.r][t.c] = guards % 3 === 1 ? '2' : '1';
                    guards++;
                }
            }
            // Extra guards if needed
            for (let i = reachable.length - 3; i > 5 && guards < maxGuards; i -= 4) {
                const t = reachable[i];
                if (grid[t.r][t.c] === '.') {
                    grid[t.r][t.c] = guards % 3 === 1 ? '2' : '1';
                    guards++;
                }
            }

            return grid.map((row) => row.join(''));
        }

        class StealthHeistScene extends global.Phaser.Scene {
            constructor() {
                super({ key: 'StealthHeistScene' });
            }

            init(data) {
                const lv = (data && data.level) ? data.level : runtime.pendingLevel;
                this.deckNum = Math.max(1, Math.floor(Number(lv) || 1));
                this.score = (data && data.carryScore) ? data.carryScore : 0;
                this.lives = (data && data.carryLives) ? data.carryLives : 3;
                this.ended = false;
                this.endlessMode = !isStory && this.deckNum > 4;
                this.scoreMult = 1 + (this.deckNum - 1) * 0.25;
                this.alarmTriggeredEver = false;
                this.hackedVaults = 0;
                this.totalVaults = 0;
                this.airlockOpen = false;
                this._cosmicPaused = false;
            }

            preload() {
                this.load.on('loaderror', () => {});
                queueImageSafe(this, 'psh_trooper', 'assets/v11/sprites/exo_trooper.png');
                queueImageSafe(this, 'psh_mech', 'assets/v11/sprites/tactical_mech.png');
                queueImageSafe(this, 'psh_spider', 'assets/v11/sprites/spider_bot.png');
                queueImageSafe(this, 'psh_reactor', 'assets/v11/sprites/reactor_node.png');
            }

            create() {
                runtime.activeScene = this;
                runtime.sceneReady = true;
                this.input.mouse.disableContextMenu();

                this.ensureProceduralTextures();

                const isEndlessDeck = this.deckNum > DECKS.length;
                const deckDef = isEndlessDeck
                    ? { id: this.deckNum, name: `ENDLESS ALERT DECK ${this.deckNum}`, accent: 0xc084fc, map: buildEndlessDeckGrid(this.deckNum) }
                    : DECKS[this.deckNum - 1];

                this.deckLabel = deckDef.name;
                this.gridMap = deckDef.map;
                this.rows = this.gridMap.length;
                this.cols = this.gridMap[0].length;

                this.walls = this.physics.add.staticGroup();
                this.guards = this.physics.add.group({ allowGravity: false });
                this.bullets = this.physics.add.group({ allowGravity: false });

                this.solidGrid = Array.from({ length: this.rows }, () => Array(this.cols).fill(false));
                this.lockers = [];
                this.vaults = [];
                this.guardList = [];
                this.airlockPos = { x: 860, y: 80 };
                this.spawnPos = { x: 100, y: 400 };

                this.buildDeckMap(this.gridMap, deckDef.accent);

                // Player Infiltrator
                const p = this.physics.add.sprite(this.spawnPos.x, this.spawnPos.y, 'psh_trooper').setDepth(12);
                p.setDisplaySize(30, 32);
                setWorldBody(p, 20, 22);
                p.setTint(0x67e8f9);
                p.setCollideWorldBounds(true);
                this.player = p;

                this.facingAngle = 0;
                this.cloakTimer = 0;
                this.cloakCooldown = 0;
                this.empCooldown = 0;
                this.invulnTimer = 0;
                this.inLocker = false;
                this.globalLockdownTimer = 0;

                this.physics.add.collider(this.player, this.walls);
                this.physics.add.collider(this.guards, this.walls);
                this.physics.add.collider(this.bullets, this.walls, (b) => b.destroy());
                this.physics.add.overlap(this.player, this.bullets, (pl, b) => this.onPlayerHitBullet(b));

                // Graphics layers
                this.fovGraphics = this.add.graphics().setDepth(5);
                this.fxGraphics = this.add.graphics().setDepth(15);
                this.sparkEmitter = this.add.particles(0, 0, 'psh_spark', {
                    speed: { min: 40, max: 180 },
                    scale: { start: 1, end: 0 },
                    alpha: { start: 1, end: 0 },
                    lifespan: 320,
                    emitting: false
                }).setDepth(22);

                // Click EMP Takedown
                this.onPointerDown = () => {
                    if (this.ended || this._cosmicPaused) return;
                    safeUnlockAudio(ctx);
                    this.tryEmpTakedown();
                };
                this.input.on('pointerdown', this.onPointerDown);
                this.events.once('shutdown', () => {
                    this.input.off('pointerdown', this.onPointerDown);
                });

                this.createDeckHud();
                this.showDeckBanner(this.deckLabel, '#2dd4bf');
                this.syncExternalHud();
            }

            ensureProceduralTextures() {
                makeTextureSafe(this, 'psh_trooper', 48, 48, (g) => {
                    g.fillStyle(0x2dd4bf, 1);
                    g.fillCircle(24, 24, 16);
                });
                makeTextureSafe(this, 'psh_mech', 48, 48, (g) => {
                    g.fillStyle(0xf59e0b, 1);
                    g.fillRect(8, 8, 32, 32);
                });
                makeTextureSafe(this, 'psh_spider', 48, 48, (g) => {
                    g.fillStyle(0xf43f5e, 1);
                    g.fillCircle(24, 24, 15);
                });
                makeTextureSafe(this, 'psh_reactor', 48, 48, (g) => {
                    g.fillStyle(0xfacc15, 1);
                    g.fillRoundedRect(8, 8, 32, 32, 6);
                });

                makeTextureSafe(this, 'psh_floor', TILE, TILE, (g, w, h) => {
                    g.fillStyle(0x070d1b, 1);
                    g.fillRect(0, 0, w, h);
                    g.lineStyle(1, 0x12223d, 0.75);
                    g.strokeRect(0, 0, w, h);
                    g.fillStyle(0x0f1a2e, 0.7);
                    g.fillRect(4, 4, w - 8, h - 8);
                });

                makeTextureSafe(this, 'psh_wall', TILE, TILE, (g, w, h) => {
                    g.fillStyle(0x132038, 1);
                    g.fillRect(0, 0, w, h);
                    g.lineStyle(2, 0x2a4570, 1);
                    g.strokeRect(1, 1, w - 2, h - 2);
                    g.fillStyle(0x0b1424, 1);
                    g.fillRect(6, 6, w - 12, h - 12);
                    g.fillStyle(0x38bdf8, 0.25);
                    g.fillRect(8, 3, w - 16, 2);
                });

                makeTextureSafe(this, 'psh_pillar', TILE, TILE, (g, w, h) => {
                    g.fillStyle(0x070d1b, 1);
                    g.fillRect(0, 0, w, h);
                    g.fillStyle(0x1e293b, 1);
                    g.fillRoundedRect(4, 4, w - 8, h - 8, 6);
                    g.lineStyle(2, 0x2dd4bf, 0.65);
                    g.strokeRoundedRect(4, 4, w - 8, h - 8, 6);
                });

                makeTextureSafe(this, 'psh_locker', TILE, TILE, (g, w, h) => {
                    g.fillStyle(0x042f2e, 0.9);
                    g.fillRoundedRect(4, 4, w - 8, h - 8, 6);
                    g.lineStyle(2, 0x2dd4bf, 0.9);
                    g.strokeRoundedRect(4, 4, w - 8, h - 8, 6);
                    g.fillStyle(0x5eead4, 0.45);
                    g.fillRect(10, 10, w - 20, 4);
                    g.fillRect(10, 18, w - 20, 4);
                    g.fillRect(10, 26, w - 20, 4);
                });

                makeTextureSafe(this, 'psh_airlock', TILE, TILE, (g, w, h) => {
                    g.fillStyle(0x0f172a, 1);
                    g.fillRoundedRect(2, 2, w - 4, h - 4, 8);
                    g.lineStyle(3, 0xf59e0b, 0.95);
                    g.strokeRoundedRect(3, 3, w - 6, h - 6, 8);
                    g.fillStyle(0x38bdf8, 0.22);
                    g.fillCircle(w / 2, h / 2, 11);
                });

                makeTextureSafe(this, 'psh_bullet', 12, 12, (g) => {
                    g.fillStyle(0xf43f5e, 1);
                    g.fillCircle(6, 6, 5);
                    g.fillStyle(0xffffff, 1);
                    g.fillCircle(6, 6, 2);
                });

                makeTextureSafe(this, 'psh_spark', 8, 8, (g) => {
                    g.fillStyle(0xffffff, 1);
                    g.fillCircle(4, 4, 3.5);
                });
            }

            buildDeckMap(grid, accent) {
                for (let r = 0; r < this.rows; r++) {
                    for (let c = 0; c < this.cols; c++) {
                        const ch = grid[r][c];
                        const wx = c * TILE + TILE * 0.5;
                        const wy = Y_OFF + r * TILE + TILE * 0.5;

                        this.add.image(wx, wy, 'psh_floor').setDepth(0);

                        if (ch === '#' || ch === 'P') {
                            this.solidGrid[r][c] = true;
                            const block = this.walls.create(wx, wy, ch === 'P' ? 'psh_pillar' : 'psh_wall').setDepth(4);
                            block.setDisplaySize(ch === 'P' ? 34 : TILE, ch === 'P' ? 34 : TILE).refreshBody();
                        } else if (ch === 'L') {
                            const loc = this.add.image(wx, wy, 'psh_locker').setDepth(2);
                            this.lockers.push({ x: wx, y: wy, sprite: loc });
                        } else if (ch === 'V') {
                            const v = this.add.sprite(wx, wy, 'psh_reactor').setDepth(7);
                            v.setDisplaySize(32, 32);
                            v.setTint(0xfacc15);
                            this.vaults.push({ x: wx, y: wy, sprite: v, progress: 0, hacked: false });
                            this.totalVaults++;
                        } else if (ch === 'X') {
                            this.airlockPos = { x: wx, y: wy };
                            this.airlockSprite = this.add.image(wx, wy, 'psh_airlock').setDepth(3);
                        } else if (ch === '@') {
                            this.spawnPos = { x: wx, y: wy };
                        } else if (ch === '1' || ch === '2') {
                            this.spawnGuard(r, c, ch === '2' ? 'mech' : 'spider');
                        }
                    }
                }
            }

            spawnGuard(startR, startC, kind) {
                const wx = startC * TILE + TILE * 0.5;
                const wy = Y_OFF + startR * TILE + TILE * 0.5;
                const g = this.guards.create(wx, wy, kind === 'mech' ? 'psh_mech' : 'psh_spider').setDepth(10);
                g.setDisplaySize(kind === 'mech' ? 34 : 28, kind === 'mech' ? 34 : 28);
                setWorldBody(g, kind === 'mech' ? 24 : 20, kind === 'mech' ? 24 : 20);

                // Compute clean corridor patrol waypoints along walkable tiles
                const waypoints = this.computePatrolLoop(startR, startC);
                const stateBadge = this.add.text(wx, wy - 24, '', {
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '14px',
                    fontStyle: 'bold',
                    color: '#f59e0b',
                    stroke: '#000000',
                    strokeThickness: 3
                }).setOrigin(0.5).setDepth(20).setVisible(false);

                const obj = {
                    sprite: g,
                    kind,
                    state: 'PATROL', // PATROL | SUSPICIOUS | LOCKDOWN | STUNNED | DEAD
                    awareness: 0,
                    angle: 0,
                    waypoints,
                    wpIdx: 1 % waypoints.length,
                    investigatePos: null,
                    fireTimer: 0.4,
                    stunTimer: 0,
                    stuckTimer: 0,
                    fovRange: kind === 'mech' ? 205 : 178,
                    fovHalf: kind === 'mech' ? 0.62 : 0.68,
                    speed: (kind === 'mech' ? 76 : 98) * (1 + (this.deckNum - 1) * 0.08),
                    badge: stateBadge
                };
                this.guardList.push(obj);
            }

            computePatrolLoop(sr, sc) {
                const pts = [{ x: sc * TILE + TILE * 0.5, y: Y_OFF + sr * TILE + TILE * 0.5 }];
                const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
                for (let d = 0; d < dirs.length; d++) {
                    const [dr, dc] = dirs[d];
                    let r = sr;
                    let c = sc;
                    let steps = 0;
                    while (steps < 5) {
                        const nr = r + dr;
                        const nc = c + dc;
                        if (nr <= 0 || nr >= this.rows - 1 || nc <= 0 || nc >= this.cols - 1 || this.solidGrid[nr][nc]) break;
                        r = nr;
                        c = nc;
                        steps++;
                    }
                    if (steps >= 2) {
                        pts.push({ x: c * TILE + TILE * 0.5, y: Y_OFF + r * TILE + TILE * 0.5 });
                    }
                }
                return pts.length > 1 ? pts : [{ x: pts[0].x, y: pts[0].y }];
            }

            createDeckHud() {
                this.topHudTxt = this.add.text(14, 3, '', {
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '11.5px',
                    fontStyle: 'bold',
                    color: '#cbd5e1'
                }).setDepth(30);

                this.bannerTxt = this.add.text(480, 270, '', {
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '26px',
                    fontStyle: 'bold',
                    color: '#2dd4bf',
                    stroke: '#020617',
                    strokeThickness: 5
                }).setOrigin(0.5).setDepth(40).setAlpha(0);

                this.hintTxt = this.add.text(480, 524, tr(
                    'WASD Hareket · Shift Pelerin/Atılma · E/Tık EMP Gizli İndirme · L Dolaba Saklan',
                    'WASD Move · Shift Dash/Cloak · E/Click Silent EMP Takedown · L Hide in Lockers'
                ), {
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '10.5px',
                    color: '#94a3b8'
                }).setOrigin(0.5).setDepth(30);
            }

            showDeckBanner(text, color) {
                this.bannerTxt.setText(text).setColor(color || '#2dd4bf').setAlpha(1);
                this.tweens.killTweensOf(this.bannerTxt);
                this.tweens.add({ targets: this.bannerTxt, alpha: 0, duration: 1900, ease: 'Cubic.Out' });
            }

            spawnPopup(x, y, text, color) {
                const t = this.add.text(x, y, text, {
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '12px',
                    fontStyle: 'bold',
                    color: color || '#2dd4bf',
                    stroke: '#020617',
                    strokeThickness: 3
                }).setOrigin(0.5).setDepth(35);
                this.tweens.add({ targets: t, y: y - 28, alpha: 0, duration: 800, onComplete: () => t.destroy() });
            }

            isPointSolid(wx, wy) {
                const c = Math.floor(wx / TILE);
                const r = Math.floor((wy - Y_OFF) / TILE);
                if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return true;
                return this.solidGrid[r][c];
            }

            castRay(ox, oy, ang, maxDist) {
                const step = 8;
                const dx = Math.cos(ang) * step;
                const dy = Math.sin(ang) * step;
                let x = ox;
                let y = oy;
                for (let d = step; d <= maxDist; d += step) {
                    x += dx;
                    y += dy;
                    if (this.isPointSolid(x, y)) {
                        return { x, y, dist: d, blocked: true };
                    }
                }
                return { x: ox + Math.cos(ang) * maxDist, y: oy + Math.sin(ang) * maxDist, dist: maxDist, blocked: false };
            }

            hasLineOfSight(ax, ay, bx, by) {
                const dist = Math.hypot(bx - ax, by - ay);
                const ang = Math.atan2(by - ay, bx - ax);
                const hit = this.castRay(ax, ay, ang, dist);
                return hit.dist >= dist - 6;
            }

            update(time, delta) {
                if (syncPhaserPause(this, ctx, runtime.input) || this.ended) return;
                const dt = Math.min(delta, 50) / 1000;
                const inp = runtime.input;

                if (this.invulnTimer > 0) this.invulnTimer -= dt;
                if (this.empCooldown > 0) this.empCooldown -= dt;
                if (this.cloakCooldown > 0) this.cloakCooldown -= dt;
                if (this.cloakTimer > 0) this.cloakTimer -= dt;
                if (this.globalLockdownTimer > 0) this.globalLockdownTimer -= dt;

                this.handlePlayerStealthMove(dt, inp);
                if (inp.consume('KeyE', 'e')) {
                    this.tryEmpTakedown();
                }

                this.updateVaults(dt, inp);
                this.updateGuardsAndCones(dt);
                this.checkExtraction();
                this.drawFxAndTopBar();
                this.syncExternalHud();

                inp.clearFrame();
            }

            handlePlayerStealthMove(dt, inp) {
                const mx = (inp.isDown('KeyD', 'ArrowRight', 'd') ? 1 : 0) - (inp.isDown('KeyA', 'ArrowLeft', 'a') ? 1 : 0);
                const my = (inp.isDown('KeyS', 'ArrowDown', 's') ? 1 : 0) - (inp.isDown('KeyW', 'ArrowUp', 'w') ? 1 : 0);

                if (inp.consume('ShiftLeft', 'ShiftRight') && this.cloakCooldown <= 0) {
                    this.cloakTimer = 1.25;
                    this.cloakCooldown = 2.8;
                    safePlay(ctx, 'dash');
                    this.sparkEmitter.setParticleTint(0x2dd4bf);
                    this.sparkEmitter.explode(12, this.player.x, this.player.y);
                    this.spawnPopup(this.player.x, this.player.y - 22, 'CLOAK + DASH', '#2dd4bf');
                }

                const len = Math.hypot(mx, my);
                const spd = this.cloakTimer > 0 ? 315 : 195;
                if (len > 0) {
                    this.player.setVelocity((mx / len) * spd, (my / len) * spd);
                    this.facingAngle = Math.atan2(my, mx);
                    this.player.setFlipX(mx < 0);
                } else {
                    this.player.setVelocity(0, 0);
                }

                // Check Stealth Locker concealment
                this.inLocker = false;
                for (let i = 0; i < this.lockers.length; i++) {
                    if (global.Phaser.Math.Distance.Between(this.player.x, this.player.y, this.lockers[i].x, this.lockers[i].y) < 22) {
                        this.inLocker = true;
                        break;
                    }
                }

                const alpha = this.invulnTimer > 0 && Math.floor(this.invulnTimer * 16) % 2 === 0
                    ? 0.4
                    : (this.inLocker ? 0.36 : (this.cloakTimer > 0 ? 0.46 : 1));
                this.player.setAlpha(alpha);
            }

            tryEmpTakedown() {
                if (this.empCooldown > 0) return;
                this.empCooldown = 0.42;
                safePlay(ctx, 'emp');
                this.sparkEmitter.setParticleTint(0x22d3ee);
                this.sparkEmitter.explode(14, this.player.x, this.player.y);

                let hit = false;
                for (let i = 0; i < this.guardList.length; i++) {
                    const g = this.guardList[i];
                    if (g.state === 'DEAD') continue;
                    const dist = global.Phaser.Math.Distance.Between(this.player.x, this.player.y, g.sprite.x, g.sprite.y);
                    if (dist <= 76) {
                        hit = true;
                        const toPlayerAng = Math.atan2(this.player.y - g.sprite.y, this.player.x - g.sprite.x);
                        const fromFront = Math.abs(wrapAngle(toPlayerAng - g.angle)) < 0.95;

                        if (!fromFront || g.state !== 'LOCKDOWN' || g.kind === 'spider' || this.cloakTimer > 0) {
                            // Silent EMP Backstab Takedown!
                            const wasPatrol = g.state === 'PATROL';
                            g.state = 'DEAD';
                            g.badge.setVisible(false);
                            g.sprite.body.enable = false;
                            g.sprite.setTint(0x334155).setAlpha(0.38).setRotation(0.45);
                            const pts = Math.round((wasPatrol ? 160 : 120) * this.scoreMult);
                            this.score += pts;
                            this.spawnPopup(g.sprite.x, g.sprite.y - 24, `EMP +${pts}`, '#2dd4bf');
                        } else {
                            // Frontal stun on Lockdown Mech
                            g.state = 'STUNNED';
                            g.stunTimer = 2.2;
                            g.badge.setText('⚡').setColor('#38bdf8').setVisible(true);
                            this.spawnPopup(g.sprite.x, g.sprite.y - 24, tr('SERSEMLEDİ!', 'EMP STUN!'), '#38bdf8');
                        }
                    }
                }
                if (!hit) {
                    this.spawnPopup(this.player.x, this.player.y - 20, 'EMP', '#64748b');
                }
            }

            updateVaults(dt, inp) {
                const fast = inp.isDown('KeyE', 'e') ? 1.55 : 1;
                for (let i = 0; i < this.vaults.length; i++) {
                    const v = this.vaults[i];
                    if (v.hacked) continue;
                    const d = global.Phaser.Math.Distance.Between(this.player.x, this.player.y, v.x, v.y);
                    if (d <= 52) {
                        v.progress += dt * 0.95 * fast;
                        if (Math.random() < 0.35) {
                            this.sparkEmitter.setParticleTint(0xfacc15);
                            this.sparkEmitter.explode(1, v.x, v.y);
                        }
                        if (v.progress >= 1) {
                            v.hacked = true;
                            v.sprite.setTint(0x34d399).setAlpha(0.7);
                            this.hackedVaults++;
                            const pts = Math.round(200 * this.scoreMult);
                            this.score += pts;
                            safePlay(ctx, 'chestOpen');
                            this.sparkEmitter.setParticleTint(0x34d399);
                            this.sparkEmitter.explode(20, v.x, v.y);
                            this.spawnPopup(v.x, v.y - 24, tr(`KASA +${pts}`, `VAULT +${pts}`), '#34d399');

                            if (this.hackedVaults >= this.totalVaults) {
                                this.airlockOpen = true;
                                if (this.airlockSprite) {
                                    this.airlockSprite.setTint(0x34d399);
                                    this.tweens.add({
                                        targets: this.airlockSprite,
                                        scale: { from: 0.92, to: 1.14 },
                                        yoyo: true,
                                        repeat: -1,
                                        duration: 500
                                    });
                                }
                                safePlay(ctx, 'levelup');
                                this.showDeckBanner(tr('HAVA KİLİDİ AÇILDI — ÇIKIŞA KAÇ!', 'AIRLOCK OPEN — EXTRACT!'), '#34d399');
                            }
                        }
                    } else {
                        v.progress = Math.max(0, v.progress - dt * 0.2);
                    }
                }
            }

            updateGuardsAndCones(dt) {
                const fg = this.fovGraphics;
                fg.clear();

                for (let i = 0; i < this.guardList.length; i++) {
                    const g = this.guardList[i];
                    if (g.state === 'DEAD') continue;

                    if (g.state === 'STUNNED') {
                        g.stunTimer -= dt;
                        g.sprite.setVelocity(0, 0);
                        g.badge.setPosition(g.sprite.x, g.sprite.y - 24);
                        if (g.stunTimer <= 0) {
                            g.state = 'SUSPICIOUS';
                            g.awareness = 0.45;
                        }
                        continue;
                    }

                    // Vision Cone Detection
                    const dx = this.player.x - g.sprite.x;
                    const dy = this.player.y - g.sprite.y;
                    const dist = Math.hypot(dx, dy);
                    const angToPlayer = Math.atan2(dy, dx);
                    const inConeAngle = Math.abs(wrapAngle(angToPlayer - g.angle)) <= g.fovHalf;
                    const cloakedMult = this.cloakTimer > 0 ? 0.2 : 1;
                    const visible = !this.inLocker && dist <= g.fovRange && inConeAngle && this.hasLineOfSight(g.sprite.x, g.sprite.y, this.player.x, this.player.y);

                    if (visible) {
                        const rate = (dist < 85 ? 2.6 : 1.25) * cloakedMult * (1 + (this.deckNum - 1) * 0.1);
                        g.awareness = Math.min(1, g.awareness + dt * rate);
                        g.investigatePos = { x: this.player.x, y: this.player.y };
                        if (g.awareness >= 1) {
                            if (g.state !== 'LOCKDOWN') {
                                g.state = 'LOCKDOWN';
                                this.alarmTriggeredEver = true;
                                this.globalLockdownTimer = 3.2;
                                safePlay(ctx, 'bossAlarm');
                            }
                        } else if (g.awareness >= 0.25 && g.state === 'PATROL') {
                            g.state = 'SUSPICIOUS';
                        }
                    } else {
                        g.awareness = Math.max(0, g.awareness - dt * (this.inLocker ? 0.7 : 0.35));
                        if (g.awareness <= 0.1 && g.state !== 'PATROL') {
                            g.state = 'PATROL';
                            g.investigatePos = null;
                        } else if (g.awareness < 0.7 && g.state === 'LOCKDOWN') {
                            g.state = 'SUSPICIOUS';
                        }
                    }

                    // Movement & Combat by State
                    if (g.state === 'LOCKDOWN') {
                        g.angle = angToPlayer;
                        g.sprite.setFlipX(Math.cos(g.angle) < 0);
                        if (dist > 95 && visible) {
                            g.sprite.setVelocity(Math.cos(g.angle) * g.speed * 1.25, Math.sin(g.angle) * g.speed * 1.25);
                        } else {
                            g.sprite.setVelocity(0, 0);
                        }
                        g.fireTimer -= dt;
                        if (g.fireTimer <= 0 && visible) {
                            g.fireTimer = Math.max(0.45, 0.85 - (this.deckNum - 1) * 0.06);
                            const b = this.bullets.create(g.sprite.x + Math.cos(g.angle) * 16, g.sprite.y + Math.sin(g.angle) * 16, 'psh_bullet').setDepth(14);
                            this.physics.velocityFromRotation(g.angle, 350, b.body.velocity);
                            safePlay(ctx, 'shootLaser', 0.1);
                        }
                        g.badge.setText('!').setColor('#ef4444').setPosition(g.sprite.x, g.sprite.y - 24).setVisible(true);
                    } else if (g.state === 'SUSPICIOUS') {
                        if (g.investigatePos) {
                            const ix = g.investigatePos.x - g.sprite.x;
                            const iy = g.investigatePos.y - g.sprite.y;
                            const idist = Math.hypot(ix, iy);
                            const targA = Math.atan2(iy, ix);
                            g.angle = g.angle + wrapAngle(targA - g.angle) * clamp(dt * 6, 0, 1);
                            if (idist > 20) {
                                g.sprite.setVelocity(Math.cos(g.angle) * g.speed * 0.8, Math.sin(g.angle) * g.speed * 0.8);
                            } else {
                                g.sprite.setVelocity(0, 0);
                            }
                        }
                        g.badge.setText('?').setColor('#f59e0b').setPosition(g.sprite.x, g.sprite.y - 24).setVisible(true);
                    } else {
                        // PATROL along waypoints
                        const wp = g.waypoints[g.wpIdx];
                        const wx = wp.x - g.sprite.x;
                        const wy = wp.y - g.sprite.y;
                        const wd = Math.hypot(wx, wy);
                        if (wd < 10 || g.stuckTimer > 0.45) {
                            g.wpIdx = (g.wpIdx + 1) % g.waypoints.length;
                            g.stuckTimer = 0;
                        } else {
                            const targA = Math.atan2(wy, wx);
                            g.angle = g.angle + wrapAngle(targA - g.angle) * clamp(dt * 8, 0, 1);
                            g.sprite.setVelocity(Math.cos(targA) * g.speed, Math.sin(targA) * g.speed);
                            g.sprite.setFlipX(Math.cos(g.angle) < 0);
                            if (g.sprite.body.blocked.left || g.sprite.body.blocked.right || g.sprite.body.blocked.up || g.sprite.body.blocked.down) {
                                g.stuckTimer += dt;
                            } else {
                                g.stuckTimer = 0;
                            }
                        }
                        g.badge.setVisible(false);
                    }

                    // Render Raycasted Vision Cone
                    const coneColor = g.state === 'LOCKDOWN' ? 0xef4444 : (g.state === 'SUSPICIOUS' ? 0xf59e0b : 0x2dd4bf);
                    const coneAlpha = g.state === 'LOCKDOWN' ? 0.34 : (g.state === 'SUSPICIOUS' ? 0.28 : 0.19);
                    const rays = 24;
                    fg.fillStyle(coneColor, coneAlpha);
                    fg.lineStyle(1.5, coneColor, coneAlpha + 0.25);
                    fg.beginPath();
                    fg.moveTo(g.sprite.x, g.sprite.y);
                    for (let r = 0; r <= rays; r++) {
                        const a = g.angle - g.fovHalf + (g.fovHalf * 2 * r) / rays;
                        const hit = this.castRay(g.sprite.x, g.sprite.y, a, g.fovRange);
                        fg.lineTo(hit.x, hit.y);
                    }
                    fg.closePath();
                    fg.fillPath();
                    fg.strokePath();
                }
            }

            onPlayerHitBullet(b) {
                if (b && b.active) b.destroy();
                if (this.invulnTimer > 0 || this.ended) return;
                this.lives--;
                this.invulnTimer = 1.15;
                safePlay(ctx, 'playerHurt');
                this.cameras.main.shake(140, 0.01);
                this.sparkEmitter.setParticleTint(0xf43f5e);
                this.sparkEmitter.explode(16, this.player.x, this.player.y);

                if (this.lives <= 0) {
                    this.lives = 0;
                    this.ended = true;
                    this.syncExternalHud();
                    ctx.onGameOver({
                        score: this.score,
                        level: this.deckNum,
                        stars: this.score >= 700 ? 2 : (this.score >= 300 ? 1 : 0),
                        reason: tr('Alarm mermilerine yakalandın. Sızma operasyonu durduruldu.', 'Neutralized by lockdown sentry fire.')
                    });
                }
            }

            checkExtraction() {
                if (!this.airlockOpen) return;
                const d = global.Phaser.Math.Distance.Between(this.player.x, this.player.y, this.airlockPos.x, this.airlockPos.y);
                if (d < 28) {
                    const ghostBonus = !this.alarmTriggeredEver ? 150 : 0;
                    const clearBonus = Math.round((350 + ghostBonus) * this.scoreMult);
                    this.score += clearBonus;
                    safePlay(ctx, 'levelup');

                    if (isStory && (this.score >= storyTarget || this.deckNum >= 1)) {
                        // In Story Mode, clear mission on extracting vault (score >= target or Deck clear)
                        if (this.score >= storyTarget || this.deckNum >= 2 || !ctx.chapterTarget) {
                            this.ended = true;
                            this.syncExternalHud();
                            ctx.onWin({
                                score: this.score,
                                level: this.deckNum,
                                stars: !this.alarmTriggeredEver ? 3 : 2,
                                reason: tr('Veri kasaları çalındı ve hava kilidinden kaçıldı!', 'Vault data extracted through the airlock!')
                            });
                            return;
                        }
                    }

                    const nextDeck = this.deckNum + 1;
                    runtime.pendingLevel = nextDeck;
                    this.scene.restart({
                        level: nextDeck,
                        carryScore: this.score,
                        carryLives: Math.min(4, this.lives + (this.alarmTriggeredEver ? 0 : 1))
                    });
                }
            }

            drawFxAndTopBar() {
                const g = this.fxGraphics;
                g.clear();

                // Top status bar background
                g.fillStyle(0x030712, 0.92);
                g.fillRect(0, 0, 960, Y_OFF);

                // Lockdown red strobe border
                if (this.globalLockdownTimer > 0) {
                    const pulse = 0.25 + 0.2 * Math.sin(this.time.now * 0.015);
                    g.lineStyle(4, 0xef4444, pulse);
                    g.strokeRect(2, Y_OFF + 2, 956, 516);
                }

                // Draw radial progress arc around vaults being hacked
                for (let i = 0; i < this.vaults.length; i++) {
                    const v = this.vaults[i];
                    if (v.hacked || v.progress <= 0) continue;
                    g.lineStyle(3.5, 0x22d3ee, 0.95);
                    g.beginPath();
                    g.arc(v.x, v.y, 24, -Math.PI / 2, -Math.PI / 2 + TAU * v.progress, false);
                    g.strokePath();
                }

                // Player Stealth/Locker badge
                const cloakTxt = this.inLocker ? 'HIDDEN' : (this.cloakTimer > 0 ? 'CLOAKED' : (this.cloakCooldown <= 0 ? 'CLOAK RDY' : `${Math.ceil(this.cloakCooldown * 10) / 10}s`));
                this.topHudTxt.setText(`${this.deckLabel}   |   VAULTS: ${this.hackedVaults}/${this.totalVaults}   |   ${cloakTxt}   |   MULT: x${this.scoreMult.toFixed(2)}`);
            }

            syncExternalHud() {
                const obj = this.airlockOpen
                    ? tr('Hava Kilidi Açık! Çıkışa Ulaş!', 'Airlock Unlocked! Reach Extraction!')
                    : tr(`Veri Kasalarını Hackle (${this.hackedVaults}/${this.totalVaults})`, `Hack Data Vaults (${this.hackedVaults}/${this.totalVaults})`);
                safeSetHud(ctx, {
                    score: this.score,
                    level: this.deckNum,
                    maxLevel: this.endlessMode ? '∞' : 4,
                    lives: this.lives,
                    statusText: `${this.deckLabel} · ${this.inLocker ? 'HIDDEN' : (this.globalLockdownTimer > 0 ? 'LOCKDOWN !' : 'STEALTH')}`,
                    objectiveText: obj
                });
            }
        }

        return mountPhaserHost(ctx, () => ({
            type: global.Phaser.AUTO,
            parent: ctx.stageEl,
            width: 960,
            height: 540,
            backgroundColor: '#040814',
            physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
            scale: { mode: global.Phaser.Scale.FIT, autoCenter: global.Phaser.Scale.CENTER_BOTH },
            scene: [StealthHeistScene]
        }), runtime);
    };

    // =========================================================================
    // GAME 3: phaser-crimson-colossus — Cuphead/Furi Multi-Phase Mecha Boss Raid
    // =========================================================================
    Engines['phaser-crimson-colossus'] = function mountPhaserCrimsonColossus(ctx) {
        const tr = createTranslator(ctx);
        const isStory = resolveIsStory(ctx);
        const storyTarget = ctx.chapterTarget || 1500;
        const runtime = {};

        const BOSS_TIERS = [
            { id: 1, name: 'COLOSSUS MK-I', sprite: 'pcc_colossus', tint: 0xffffff, hp: 900, podHp: 220, accent: 0xf43f5e },
            { id: 2, name: 'HYDRA CARRIER', sprite: 'pcc_carrier', tint: 0x38bdf8, hp: 1180, podHp: 280, accent: 0x22d3ee },
            { id: 3, name: 'OBSIDIAN TITAN', sprite: 'pcc_colossus', tint: 0xc084fc, hp: 1480, podHp: 340, accent: 0xa855f7 },
            { id: 4, name: 'KAELEN OVERLORD', sprite: 'pcc_colossus', tint: 0xfb7185, hp: 1850, podHp: 420, accent: 0xef4444 }
        ];

        class CrimsonColossusScene extends global.Phaser.Scene {
            constructor() {
                super({ key: 'CrimsonColossusScene' });
            }

            init(data) {
                const lv = (data && data.level) ? data.level : runtime.pendingLevel;
                this.tierNum = Math.max(1, Math.floor(Number(lv) || 1));
                this.score = (data && data.carryScore) ? data.carryScore : 0;
                this.lives = (data && data.carryLives) ? data.carryLives : 4;
                this.energy = (data && data.carryEnergy) ? data.carryEnergy : 0;
                this.ended = false;
                this.loopCount = Math.floor((this.tierNum - 1) / 4);
                this.endlessRush = !isStory && this.tierNum > 4;
                this.speedMult = 1 + this.loopCount * 0.25 + ((this.tierNum - 1) % 4) * 0.08;
                this.autoFire = true;
                this.mouseSteer = false;
                this._cosmicPaused = false;
            }

            preload() {
                this.load.on('loaderror', () => {});
                queueImageSafe(this, 'pcc_colossus', 'assets/v11/sprites/colossus_boss.png');
                queueImageSafe(this, 'pcc_carrier', 'assets/v11/sprites/carrier_ship.png');
                queueImageSafe(this, 'pcc_missile', 'assets/v11/sprites/missile_pod.png');
                queueImageSafe(this, 'pcc_fighter', 'assets/v11/sprites/fighter.png');
            }

            create() {
                runtime.activeScene = this;
                runtime.sceneReady = true;
                this.input.mouse.disableContextMenu();

                this.ensureProceduralTextures();

                const tierDef = BOSS_TIERS[(this.tierNum - 1) % BOSS_TIERS.length];
                this.tierDef = tierDef;
                this.bossTitle = this.loopCount > 0 ? `${tierDef.name} [LOOP ${this.loopCount + 1}]` : tierDef.name;

                // Diagonal Arena Backdrop
                this.createArenaBackdrop(tierDef.accent);

                this.playerShots = this.physics.add.group({ allowGravity: false });
                this.enemyOrbs = this.physics.add.group({ allowGravity: false });

                // Player Striker
                const p = this.physics.add.sprite(480, 445, 'pcc_fighter').setDepth(15);
                p.setDisplaySize(38, 40);
                setWorldBody(p, 16, 18); // Tight bullet-hell core hitbox!
                p.setCollideWorldBounds(true);
                this.player = p;

                this.aimAngle = -Math.PI / 2;
                this.fireTimer = 0;
                this.parryActiveTimer = 0;
                this.parryCooldown = 0;
                this.invulnTimer = 0;
                this.bulletTimeTimer = 0;
                this.superBeamTimer = 0;

                // Boss Core + Shoulder Weakpoint Pods
                this.bossCore = this.physics.add.sprite(480, 125, tierDef.sprite).setDepth(10);
                const isCarrier = tierDef.sprite === 'pcc_carrier';
                this.bossCore.setDisplaySize(isCarrier ? 210 : 138, isCarrier ? 128 : 146);
                setWorldBody(this.bossCore, isCarrier ? 140 : 90, isCarrier ? 86 : 104);
                this.bossCore.setTint(tierDef.tint);
                this.bossMaxHp = Math.round(tierDef.hp * (1 + this.loopCount * 0.35));
                this.bossHp = this.bossMaxHp;
                this.bossPhase = 1;
                this.bossMoveTime = 0;
                this.bossPatternTimer = 1.2;
                this.bossPatternIdx = 0;

                this.pods = [];
                this.spawnShoulderPod(-1, tierDef.podHp);
                this.spawnShoulderPod(1, tierDef.podHp);

                // Attack State Trackers (Sweeping Lasers, Falling Barrage, Shockwave Dash)
                this.sweepingLasers = [];
                this.fallingBarrages = [];
                this.dashState = { active: false, phase: 'idle', timer: 0, targetY: 165, dir: 1 };

                // Overlaps
                this.physics.add.overlap(this.playerShots, this.bossCore, (shot) => this.hitBossCore(shot));
                for (let i = 0; i < this.pods.length; i++) {
                    const pod = this.pods[i];
                    this.physics.add.overlap(this.playerShots, pod.sprite, (shot) => this.hitPod(pod, shot));
                }
                this.physics.add.overlap(this.player, this.enemyOrbs, (pl, orb) => this.onPlayerTouchOrb(orb));
                this.physics.add.overlap(this.player, this.bossCore, () => this.damagePlayer(1));

                // Graphics & Particles
                this.fxG = this.add.graphics().setDepth(20);
                this.laserG = this.add.graphics().setDepth(18);
                this.parryG = this.add.graphics().setDepth(16);
                this.sparkEmitter = this.add.particles(0, 0, 'pcc_spark', {
                    speed: { min: 60, max: 240 },
                    scale: { start: 1.15, end: 0 },
                    alpha: { start: 1, end: 0 },
                    lifespan: 340,
                    emitting: false
                }).setDepth(28);

                // Mouse aim & controls
                this.pointerDown = false;
                this.onPointerDown = (pointer) => {
                    if (this.ended || this._cosmicPaused) return;
                    safeUnlockAudio(ctx);
                    if (pointer.rightButtonDown()) {
                        this.trySuperBeam();
                    } else {
                        this.pointerDown = true;
                    }
                };
                this.onPointerUp = () => { this.pointerDown = false; };
                this.input.on('pointerdown', this.onPointerDown);
                this.input.on('pointerup', this.onPointerUp);
                this.events.once('shutdown', () => {
                    this.input.off('pointerdown', this.onPointerDown);
                    this.input.off('pointerup', this.onPointerUp);
                });

                this.createBossHud();
                this.showBanner(`${this.bossTitle} — ENGAGE!`, '#f43f5e');
                this.syncExternalHud();
            }

            ensureProceduralTextures() {
                makeTextureSafe(this, 'pcc_colossus', 128, 128, (g) => {
                    g.fillStyle(0x9f1239, 1);
                    g.fillRoundedRect(18, 12, 92, 104, 16);
                });
                makeTextureSafe(this, 'pcc_carrier', 160, 96, (g) => {
                    g.fillStyle(0x0284c7, 1);
                    g.fillRoundedRect(10, 18, 140, 60, 12);
                });
                makeTextureSafe(this, 'pcc_missile', 64, 64, (g) => {
                    g.fillStyle(0xf59e0b, 1);
                    g.fillRoundedRect(10, 10, 44, 44, 8);
                });
                makeTextureSafe(this, 'pcc_fighter', 48, 48, (g) => {
                    g.fillStyle(0x38bdf8, 1);
                    g.fillTriangle(24, 4, 42, 42, 6, 42);
                });
                makeTextureSafe(this, 'pcc_bolt', 14, 22, (g) => {
                    g.fillStyle(0x22d3ee, 1);
                    g.fillRoundedRect(3, 1, 8, 20, 4);
                    g.fillStyle(0xffffff, 1);
                    g.fillRoundedRect(5, 4, 4, 12, 2);
                });
                makeTextureSafe(this, 'pcc_orb_red', 18, 18, (g) => {
                    g.fillStyle(0xef4444, 0.45);
                    g.fillCircle(9, 9, 9);
                    g.fillStyle(0xfb7185, 1);
                    g.fillCircle(9, 9, 6);
                    g.fillStyle(0xffffff, 1);
                    g.fillCircle(9, 9, 2.5);
                });
                makeTextureSafe(this, 'pcc_orb_pink', 24, 24, (g) => {
                    g.fillStyle(0xff38d2, 0.42);
                    g.fillCircle(12, 12, 12);
                    g.lineStyle(2, 0xffffff, 0.9);
                    g.strokeCircle(12, 12, 9);
                    g.fillStyle(0xff66e0, 1);
                    g.fillCircle(12, 12, 6);
                    g.fillStyle(0xffffff, 1);
                    g.fillCircle(12, 12, 2.5);
                });
                makeTextureSafe(this, 'pcc_spark', 10, 10, (g) => {
                    g.fillStyle(0xffffff, 1);
                    g.fillCircle(5, 5, 4);
                });
            }

            createArenaBackdrop(accent) {
                const g = this.add.graphics().setDepth(-10);
                g.fillGradientStyle(0x06030d, 0x06030d, 0x13071c, 0x0a1026, 1);
                g.fillRect(0, 0, 960, 540);
                g.fillStyle(accent, 0.08);
                g.fillCircle(480, 150, 260);

                // Diagonal perspective arena floor grid
                g.lineStyle(1, accent, 0.14);
                for (let i = -6; i <= 6; i++) {
                    g.lineBetween(480 + i * 70, 140, 480 + i * 165, 540);
                }
                for (let y = 180; y <= 520; y += 56) {
                    g.lineBetween(0, y, 960, y);
                }

                this.arenaStars = [];
                for (let i = 0; i < 65; i++) {
                    this.arenaStars.push({
                        x: (i * 173 + 31) % 960,
                        y: (i * 97 + 19) % 540,
                        spd: 25 + (i % 5) * 18,
                        sz: 1 + (i % 2)
                    });
                }
                this.starG = this.add.graphics().setDepth(-8);
            }

            spawnShoulderPod(side, baseHp) {
                const hp = Math.round(baseHp * (1 + this.loopCount * 0.35));
                const spr = this.physics.add.sprite(this.bossCore.x + side * 95, this.bossCore.y + 12, 'pcc_missile').setDepth(11);
                spr.setDisplaySize(54, 54);
                setWorldBody(spr, 42, 42);
                spr.setFlipX(side < 0);
                this.pods.push({
                    side,
                    sprite: spr,
                    hp,
                    maxHp: hp,
                    alive: true,
                    fireCooldown: 1.5 + (side > 0 ? 0.6 : 0)
                });
            }

            createBossHud() {
                this.bossNameTxt = this.add.text(480, 8, this.bossTitle, {
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '14px',
                    fontStyle: 'bold',
                    color: '#f8fafc',
                    stroke: '#020617',
                    strokeThickness: 4
                }).setOrigin(0.5, 0).setDepth(35);

                this.phaseTagTxt = this.add.text(480, 52, 'PHASE I', {
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '11px',
                    fontStyle: 'bold',
                    color: '#fbbf24',
                    stroke: '#020617',
                    strokeThickness: 3
                }).setOrigin(0.5, 0).setDepth(35);

                this.energyLabelTxt = this.add.text(16, 494, '', {
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '11.5px',
                    fontStyle: 'bold',
                    color: '#f472b6'
                }).setDepth(35);

                this.modeToggleTxt = this.add.text(944, 508, '', {
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '11px',
                    color: '#94a3b8'
                }).setOrigin(1, 0.5).setDepth(35);

                this.bannerTxt = this.add.text(480, 260, '', {
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '26px',
                    fontStyle: 'bold',
                    color: '#f43f5e',
                    stroke: '#020617',
                    strokeThickness: 5
                }).setOrigin(0.5).setDepth(45).setAlpha(0);
            }

            showBanner(text, color) {
                this.bannerTxt.setText(text).setColor(color || '#f43f5e').setAlpha(1);
                this.tweens.killTweensOf(this.bannerTxt);
                this.tweens.add({ targets: this.bannerTxt, alpha: 0, duration: 1900, ease: 'Cubic.Out' });
            }

            spawnPopup(x, y, text, color) {
                const t = this.add.text(x, y, text, {
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '13px',
                    fontStyle: 'bold',
                    color: color || '#38bdf8',
                    stroke: '#020617',
                    strokeThickness: 3
                }).setOrigin(0.5).setDepth(40);
                this.tweens.add({ targets: t, y: y - 34, alpha: 0, duration: 760, onComplete: () => t.destroy() });
            }

            update(time, delta) {
                if (syncPhaserPause(this, ctx, runtime.input) || this.ended) return;
                const realDt = Math.min(delta, 50) / 1000;
                const inp = runtime.input;

                // Bullet-Time Slow-Mo scaling on Boss & Enemy projectiles!
                let worldScale = 1;
                if (this.bulletTimeTimer > 0) {
                    this.bulletTimeTimer -= realDt;
                    worldScale = 0.25;
                }
                const worldDt = realDt * worldScale;

                if (this.invulnTimer > 0) {
                    this.invulnTimer -= realDt;
                    this.player.setAlpha(Math.floor(this.invulnTimer * 18) % 2 === 0 ? 0.4 : 1);
                } else {
                    this.player.setAlpha(1);
                }
                if (this.parryCooldown > 0) this.parryCooldown -= realDt;
                if (this.parryActiveTimer > 0) this.parryActiveTimer -= realDt;

                // Toggles: [E] Auto-fire, [M] Mouse Steer, [Shift / K] Super Beam
                if (inp.consume('KeyE', 'e')) {
                    this.autoFire = !this.autoFire;
                    this.spawnPopup(this.player.x, this.player.y - 26, `AUTO-FIRE: ${this.autoFire ? 'ON' : 'OFF'}`, '#38bdf8');
                }
                if (inp.consume('KeyM', 'm')) {
                    this.mouseSteer = !this.mouseSteer;
                    this.spawnPopup(this.player.x, this.player.y - 26, `STEER: ${this.mouseSteer ? 'MOUSE' : 'WASD'}`, '#2dd4bf');
                }
                if (inp.consume('ShiftLeft', 'ShiftRight', 'KeyK', 'k')) {
                    this.trySuperBeam();
                }

                this.updateStars(worldDt);
                this.handlePlayerControls(realDt, inp);
                this.updateBulletTimeParry(realDt, inp);
                this.updateSuperBeam(realDt);
                this.updateBossAndAttacks(worldDt, realDt);
                this.drawArenaOverlays();
                this.syncExternalHud();

                inp.clearFrame();
            }

            updateStars(dt) {
                const sg = this.starG;
                sg.clear();
                for (let i = 0; i < this.arenaStars.length; i++) {
                    const st = this.arenaStars[i];
                    st.y += st.spd * dt;
                    if (st.y > 545) st.y = -5;
                    sg.fillStyle(i % 4 === 0 ? 0xf43f5e : 0xe2e8f0, 0.35);
                    sg.fillCircle(st.x, st.y, st.sz);
                }
            }

            handlePlayerControls(dt, inp) {
                const kx = (inp.isDown('KeyD', 'ArrowRight', 'd') ? 1 : 0) - (inp.isDown('KeyA', 'ArrowLeft', 'a') ? 1 : 0);
                const ky = (inp.isDown('KeyS', 'ArrowDown', 's') ? 1 : 0) - (inp.isDown('KeyW', 'ArrowUp', 'w') ? 1 : 0);

                if (kx !== 0 || ky !== 0) {
                    const len = Math.hypot(kx, ky);
                    this.player.setVelocity((kx / len) * 320, (ky / len) * 320);
                } else if (this.mouseSteer && this.input.activePointer) {
                    const ptr = this.input.activePointer;
                    const dx = ptr.worldX - this.player.x;
                    const dy = ptr.worldY - this.player.y;
                    const d = Math.hypot(dx, dy);
                    if (d > 10) {
                        const spd = Math.min(340, d * 6);
                        this.player.setVelocity((dx / d) * spd, (dy / d) * spd);
                    } else {
                        this.player.setVelocity(0, 0);
                    }
                } else {
                    this.player.setVelocity(0, 0);
                }

                // Aim twin plasma blaster toward cursor (if active inside stage) or nearest weakpoint
                const ptr = this.input.activePointer;
                if (!this.mouseSteer && ptr && (ptr.worldX > 0 || ptr.worldY > 0) && (this.pointerDown || ptr.isDown || ptr.moveTime > 0)) {
                    this.aimAngle = Math.atan2(ptr.worldY - this.player.y, ptr.worldX - this.player.x);
                } else {
                    const target = this.pickBestWeakpoint();
                    this.aimAngle = Math.atan2(target.y - this.player.y, target.x - this.player.x);
                }
                this.player.setRotation(this.aimAngle + Math.PI / 2);

                // Twin Plasma Blaster (Auto-fire toggleable + Click/Hold)
                this.fireTimer -= dt;
                if ((this.autoFire || this.pointerDown) && this.fireTimer <= 0 && this.superBeamTimer <= 0) {
                    this.fireTimer = this.pointerDown ? 0.11 : 0.14;
                    this.fireTwinBlaster();
                }
            }

            pickBestWeakpoint() {
                let best = this.bossCore;
                let bestD = Infinity;
                for (let i = 0; i < this.pods.length; i++) {
                    if (!this.pods[i].alive) continue;
                    const d = global.Phaser.Math.Distance.Between(this.player.x, this.player.y, this.pods[i].sprite.x, this.pods[i].sprite.y);
                    if (d < bestD) {
                        bestD = d;
                        best = this.pods[i].sprite;
                    }
                }
                return best;
            }

            fireTwinBlaster() {
                const perp = this.aimAngle + Math.PI / 2;
                const off = 11;
                for (const s of [-1, 1]) {
                    const sx = this.player.x + Math.cos(this.aimAngle) * 14 + Math.cos(perp) * off * s;
                    const sy = this.player.y + Math.sin(this.aimAngle) * 14 + Math.sin(perp) * off * s;
                    const shot = this.playerShots.create(sx, sy, 'pcc_bolt').setDepth(14);
                    shot.setRotation(this.aimAngle + Math.PI / 2);
                    shot.setData('dmg', 14);
                    this.physics.velocityFromRotation(this.aimAngle, 720, shot.body.velocity);
                    this.time.delayedCall(1200, () => { if (shot && shot.active) shot.destroy(); });
                }
                safePlay(ctx, 'shootLaser', 0.16);
            }

            updateBulletTimeParry(dt, inp) {
                if (inp.consume('Space') && this.parryCooldown <= 0) {
                    this.parryActiveTimer = 0.27;
                    this.parryCooldown = 0.48;
                    this.invulnTimer = Math.max(this.invulnTimer, 0.25);
                    safePlay(ctx, 'dash', 0.15);
                }

                const pg = this.parryG;
                pg.clear();
                if (this.parryActiveTimer > 0) {
                    const ratio = this.parryActiveTimer / 0.27;
                    pg.lineStyle(4, 0xff4fd8, ratio);
                    pg.strokeCircle(this.player.x, this.player.y, 48);
                    pg.fillStyle(0x22d3ee, 0.18 * ratio);
                    pg.fillCircle(this.player.x, this.player.y, 48);

                    // Deflect / absorb bright PINK orbs within parry radius!
                    this.enemyOrbs.getChildren().forEach((orb) => {
                        if (!orb.active || !orb.getData('pink')) return;
                        const d = global.Phaser.Math.Distance.Between(this.player.x, this.player.y, orb.x, orb.y);
                        if (d <= 56) {
                            this.parryPinkOrb(orb);
                        }
                    });
                }
            }

            parryPinkOrb(orb) {
                const ox = orb.x;
                const oy = orb.y;
                orb.destroy();

                // +150 Energy, Slow-Mo Juice, Super Beam Charge & Counter-Bolt!
                this.energy = Math.min(450, this.energy + 150);
                this.score += 150;
                this.parryCooldown = 0; // Instant chain parry reset!
                this.bulletTimeTimer = 0.24;
                this.invulnTimer = Math.max(this.invulnTimer, 0.35);

                safePlay(ctx, 'powerup');
                this.cameras.main.shake(95, 0.006);
                this.sparkEmitter.setParticleTint(0xff4fd8);
                this.sparkEmitter.explode(22, ox, oy);
                this.spawnPopup(ox, oy - 20, '+150 PARRY!', '#ff66e0');

                // Fire glowing counter-bolt straight into active weakpoint!
                const target = this.pickBestWeakpoint();
                const counterAng = Math.atan2(target.y - ox, target.x - ox);
                const cShot = this.playerShots.create(ox, oy, 'pcc_orb_pink').setDepth(16).setTint(0x22d3ee);
                cShot.setData('dmg', 85);
                this.physics.velocityFromRotation(counterAng, 820, cShot.body.velocity);
                this.time.delayedCall(1200, () => { if (cShot && cShot.active) cShot.destroy(); });
            }

            trySuperBeam() {
                if (this.energy < 300 || this.superBeamTimer > 0) {
                    if (this.energy < 300) {
                        this.spawnPopup(this.player.x, this.player.y - 26, tr('300 ENERJİ GEREKLİ', 'NEED 300 ENERGY'), '#f472b6');
                    }
                    return;
                }
                this.energy -= 300;
                this.superBeamTimer = 1.05;
                this.invulnTimer = Math.max(this.invulnTimer, 1.15);
                safePlay(ctx, 'explodeBoss');
                this.cameras.main.shake(220, 0.01);
                this.showBanner('HYPER PLASMA BEAM!', '#22d3ee');
            }

            updateSuperBeam(dt) {
                if (this.superBeamTimer <= 0) return;
                this.superBeamTimer -= dt;
                const bx = this.player.x;
                const by = this.player.y;
                const ex = bx + Math.cos(this.aimAngle) * 760;
                const ey = by + Math.sin(this.aimAngle) * 760;

                // Continuous beam damage & bullet clearing
                const line = new global.Phaser.Geom.Line(bx, by, ex, ey);
                this.enemyOrbs.getChildren().forEach((orb) => {
                    if (!orb.active) return;
                    if (global.Phaser.Geom.Intersects.LineToCircle(line, new global.Phaser.Geom.Circle(orb.x, orb.y, 32))) {
                        orb.destroy();
                    }
                });

                this._beamTick = (this._beamTick || 0) + dt;
                if (this._beamTick >= 0.08) {
                    this._beamTick = 0;
                    for (let i = 0; i < this.pods.length; i++) {
                        const pod = this.pods[i];
                        if (pod.alive && global.Phaser.Geom.Intersects.LineToRectangle(line, pod.sprite.getBounds())) {
                            this.applyPodDamage(pod, 34);
                        }
                    }
                    if (global.Phaser.Geom.Intersects.LineToRectangle(line, this.bossCore.getBounds())) {
                        this.applyCoreDamage(42);
                    }
                }
            }

            hitBossCore(shot) {
                if (!shot || !shot.active) return;
                const dmg = shot.getData('dmg') || 14;
                shot.destroy();
                this.applyCoreDamage(dmg);
            }

            hitPod(pod, shot) {
                if (!pod.alive || !shot || !shot.active) return;
                const dmg = shot.getData('dmg') || 14;
                shot.destroy();
                this.applyPodDamage(pod, dmg);
            }

            applyPodDamage(pod, rawDmg) {
                if (!pod.alive || this.ended) return;
                pod.hp -= rawDmg;
                this.energy = Math.min(450, this.energy + 3);
                pod.sprite.setTint(0xffffff);
                this.time.delayedCall(75, () => { if (pod.alive && pod.sprite.active) pod.sprite.clearTint(); });
                safePlay(ctx, 'hitMetal', 0.15);

                if (pod.hp <= 0) {
                    pod.alive = false;
                    pod.sprite.setVisible(false);
                    pod.sprite.body.enable = false;
                    this.score += 280;
                    this.energy = Math.min(450, this.energy + 80);
                    safePlay(ctx, 'explodeBoss');
                    this.cameras.main.shake(180, 0.012);
                    this.sparkEmitter.setParticleTint(0xf59e0b);
                    this.sparkEmitter.explode(34, pod.sprite.x, pod.sprite.y);
                    this.spawnPopup(pod.sprite.x, pod.sprite.y, tr('ZAYIF NOKTA KIRILDI +280', 'POD SHATTERED +280'), '#fbbf24');
                }
            }

            applyCoreDamage(rawDmg) {
                if (this.ended) return;
                const livePods = this.pods.filter((p) => p.alive).length;
                const mult = livePods === 0 ? 1.5 : (livePods === 1 ? 1.0 : 0.72);
                const dmg = Math.round(rawDmg * mult);
                this.bossHp -= dmg;
                this.energy = Math.min(450, this.energy + 2);
                this.score += Math.max(2, Math.floor(dmg * 0.4));

                this.bossCore.setTint(0xffffff);
                this.time.delayedCall(70, () => {
                    if (this.bossCore && this.bossCore.active) {
                        this.bossCore.setTint(this.bossPhase === 3 ? 0xfb7185 : this.tierDef.tint);
                    }
                });
                safePlay(ctx, 'hitShield', 0.15);

                // Phase transitions
                const ratio = this.bossHp / this.bossMaxHp;
                if (this.bossPhase === 1 && ratio <= 0.65) {
                    this.bossPhase = 2;
                    this.phaseTagTxt.setText('PHASE II: OVERCLOCK').setColor('#fb7185');
                    this.showBanner('PHASE II: OVERCLOCK', '#fb7185');
                    safePlay(ctx, 'bossAlarm');
                } else if (this.bossPhase === 2 && ratio <= 0.32) {
                    this.bossPhase = 3;
                    this.phaseTagTxt.setText('PHASE III: CRIMSON FURY').setColor('#ff2d55');
                    this.showBanner('PHASE III: CRIMSON FURY', '#ff2d55');
                    safePlay(ctx, 'bossAlarm');
                }

                if (this.bossHp <= 0) {
                    this.onBossDefeated();
                }
            }

            onBossDefeated() {
                if (this.ended) return;
                this.score += 650 + this.tierNum * 150;
                safePlay(ctx, 'explodeBoss');
                this.cameras.main.shake(320, 0.018);
                this.sparkEmitter.setParticleTint(0xf43f5e);
                this.sparkEmitter.explode(56, this.bossCore.x, this.bossCore.y);

                // Check Story Mode Win or Boss Rush advance
                if (isStory && (this.tierNum === 1 || this.score >= storyTarget)) {
                    this.ended = true;
                    this.syncExternalHud();
                    ctx.onWin({
                        score: this.score,
                        level: this.tierNum,
                        stars: this.lives >= 3 ? 3 : 2,
                        reason: tr(`${this.bossTitle} imha edildi!`, `${this.bossTitle} shattered!`)
                    });
                    return;
                }

                const nextTier = this.tierNum + 1;
                runtime.pendingLevel = nextTier;
                this.scene.restart({
                    level: nextTier,
                    carryScore: this.score,
                    carryLives: Math.min(5, this.lives + 1),
                    carryEnergy: this.energy
                });
            }

            updateBossAndAttacks(worldDt, realDt) {
                // Boss movement (unless performing Shockwave Dash)
                if (!this.dashState.active) {
                    this.bossMoveTime += worldDt * (0.9 + this.bossPhase * 0.22) * this.speedMult;
                    const tx = 480 + Math.sin(this.bossMoveTime * 1.15) * 240;
                    const ty = 125 + Math.cos(this.bossMoveTime * 1.8) * 28;
                    this.bossCore.x = lerp(this.bossCore.x, tx, clamp(worldDt * 6, 0, 1));
                    this.bossCore.y = lerp(this.bossCore.y, ty, clamp(worldDt * 6, 0, 1));
                }

                // Sync Shoulder Pods + Pod missile fires
                for (let i = 0; i < this.pods.length; i++) {
                    const pod = this.pods[i];
                    if (!pod.alive) continue;
                    pod.sprite.setPosition(this.bossCore.x + pod.side * 96, this.bossCore.y + 12);
                    pod.fireCooldown -= worldDt;
                    if (pod.fireCooldown <= 0) {
                        pod.fireCooldown = Math.max(1.1, (2.4 - this.bossPhase * 0.25) / this.speedMult);
                        const a = Math.atan2(this.player.y - pod.sprite.y, this.player.x - pod.sprite.x);
                        this.spawnOrb(pod.sprite.x, pod.sprite.y, a, 240 * this.speedMult, Math.random() < 0.35);
                    }
                }

                // Slow down active physics projectiles during Bullet-Time
                this.enemyOrbs.getChildren().forEach((orb) => {
                    if (!orb.active) return;
                    const baseVx = orb.getData('vx') || 0;
                    const baseVy = orb.getData('vy') || 0;
                    const scale = this.bulletTimeTimer > 0 ? 0.25 : 1;
                    orb.body.setVelocity(baseVx * scale, baseVy * scale);
                });

                // Boss Pattern Scheduler
                this.bossPatternTimer -= worldDt;
                if (this.bossPatternTimer <= 0 && !this.dashState.active) {
                    const pat = this.bossPatternIdx % 4;
                    this.bossPatternIdx++;

                    if (pat === 0) {
                        this.launchRingSalvo();
                    } else if (pat === 1) {
                        this.launchSweepingLaser();
                    } else if (pat === 2) {
                        this.launchFallingBarrage();
                    } else {
                        this.startShockwaveDash();
                    }
                    this.bossPatternTimer = Math.max(1.2, (2.35 - this.bossPhase * 0.28) / this.speedMult);
                }

                this.updateSweepingLasers(worldDt);
                this.updateFallingBarrages(worldDt);
                this.updateShockwaveDash(worldDt);

                // Story Score Threshold Win Check
                if (isStory && this.score >= storyTarget && !this.ended) {
                    this.ended = true;
                    safePlay(ctx, 'levelup');
                    this.syncExternalHud();
                    ctx.onWin({
                        score: this.score,
                        level: this.tierNum,
                        stars: this.score >= storyTarget * 1.5 ? 3 : 2,
                        reason: tr('Boss baskını hedef skoru aşıldı!', 'Boss raid story target achieved!')
                    });
                }
            }

            spawnOrb(x, y, angle, speed, isPink) {
                const orb = this.enemyOrbs.create(x, y, isPink ? 'pcc_orb_pink' : 'pcc_orb_red').setDepth(17);
                orb.setData('pink', !!isPink);
                orb.body.setCircle(isPink ? 9 : 6, 3, 3);
                const vx = Math.cos(angle) * speed;
                const vy = Math.sin(angle) * speed;
                orb.setData('vx', vx);
                orb.setData('vy', vy);
                orb.body.setVelocity(vx, vy);
                this.time.delayedCall(4500, () => { if (orb && orb.active) orb.destroy(); });
                return orb;
            }

            launchRingSalvo() {
                const count = 12 + this.bossPhase * 3;
                const offset = Math.random() * TAU;
                for (let i = 0; i < count; i++) {
                    const a = offset + (TAU * i) / count;
                    const isPink = i % 4 === 0;
                    this.spawnOrb(this.bossCore.x, this.bossCore.y + 10, a, (205 + this.bossPhase * 22) * this.speedMult, isPink);
                }
                safePlay(ctx, 'shootPlasma');
            }

            launchSweepingLaser() {
                const dir = Math.random() > 0.5 ? 1 : -1;
                this.sweepingLasers.push({
                    ox: this.bossCore.x,
                    oy: this.bossCore.y + 24,
                    angle: Math.PI / 2 - dir * 0.72,
                    sweepVel: dir * (0.95 + this.bossPhase * 0.15) * this.speedMult,
                    telegraph: 0.75,
                    active: 1.25
                });
                safePlay(ctx, 'bossAlarm', 0.1);
            }

            updateSweepingLasers(dt) {
                for (let i = this.sweepingLasers.length - 1; i >= 0; i--) {
                    const ls = this.sweepingLasers[i];
                    ls.ox = this.bossCore.x;
                    ls.oy = this.bossCore.y + 24;
                    if (ls.telegraph > 0) {
                        ls.telegraph -= dt;
                    } else {
                        ls.active -= dt;
                        ls.angle += ls.sweepVel * dt;
                        const ex = ls.ox + Math.cos(ls.angle) * 680;
                        const ey = ls.oy + Math.sin(ls.angle) * 680;
                        const line = new global.Phaser.Geom.Line(ls.ox, ls.oy, ex, ey);
                        if (global.Phaser.Geom.Intersects.LineToCircle(line, new global.Phaser.Geom.Circle(this.player.x, this.player.y, 14))) {
                            this.damagePlayer(1);
                        }
                        if (ls.active <= 0) this.sweepingLasers.splice(i, 1);
                    }
                }
            }

            launchFallingBarrage() {
                const lanes = 5 + this.bossPhase;
                for (let i = 0; i < lanes; i++) {
                    const lx = 75 + Math.random() * 810;
                    this.fallingBarrages.push({
                        x: lx,
                        warn: 0.7,
                        y: -20,
                        vy: (320 + this.bossPhase * 35) * this.speedMult,
                        isPink: i === 0 || i === 3
                    });
                }
                safePlay(ctx, 'shootMissile');
            }

            updateFallingBarrages(dt) {
                for (let i = this.fallingBarrages.length - 1; i >= 0; i--) {
                    const fb = this.fallingBarrages[i];
                    if (fb.warn > 0) {
                        fb.warn -= dt;
                        if (fb.warn <= 0) {
                            this.spawnOrb(fb.x, -10, Math.PI / 2, fb.vy, fb.isPink);
                            this.fallingBarrages.splice(i, 1);
                        }
                    }
                }
            }

            startShockwaveDash() {
                const fromLeft = this.bossCore.x < 480;
                this.dashState = {
                    active: true,
                    phase: 'telegraph',
                    timer: 0.72,
                    targetY: clamp(this.player.y, 170, 390),
                    dir: fromLeft ? 1 : -1,
                    startX: fromLeft ? 120 : 840,
                    endX: fromLeft ? 840 : 120
                };
                safePlay(ctx, 'dash');
            }

            updateShockwaveDash(dt) {
                const d = this.dashState;
                if (!d.active) return;

                d.timer -= dt;
                if (d.phase === 'telegraph') {
                    this.bossCore.x = lerp(this.bossCore.x, d.startX, clamp(dt * 8, 0, 1));
                    this.bossCore.y = lerp(this.bossCore.y, d.targetY, clamp(dt * 8, 0, 1));
                    if (d.timer <= 0) {
                        d.phase = 'charge';
                        d.timer = 0.55;
                        safePlay(ctx, 'explodeSmall');
                    }
                } else if (d.phase === 'charge') {
                    this.bossCore.x = lerp(this.bossCore.x, d.endX, clamp(dt * 7.5, 0, 1));
                    if (global.Phaser.Math.Distance.Between(this.player.x, this.player.y, this.bossCore.x, this.bossCore.y) < 62) {
                        this.damagePlayer(1);
                    }
                    if (d.timer <= 0) {
                        // Impact shockwave burst + return to top!
                        for (let k = 0; k < 10; k++) {
                            this.spawnOrb(this.bossCore.x, this.bossCore.y, (TAU / 10) * k, 220 * this.speedMult, k % 3 === 0);
                        }
                        this.cameras.main.shake(150, 0.01);
                        d.active = false;
                    }
                }
            }

            onPlayerTouchOrb(orb) {
                if (!orb || !orb.active) return;
                if (this.parryActiveTimer > 0 && orb.getData('pink')) {
                    this.parryPinkOrb(orb);
                    return;
                }
                orb.destroy();
                this.damagePlayer(1);
            }

            damagePlayer(amt) {
                if (this.invulnTimer > 0 || this.ended) return;
                this.lives -= amt;
                this.invulnTimer = 1.2;
                safePlay(ctx, 'playerHurt');
                this.cameras.main.shake(160, 0.012);
                this.sparkEmitter.setParticleTint(0xfb7185);
                this.sparkEmitter.explode(16, this.player.x, this.player.y);

                if (this.lives <= 0) {
                    this.lives = 0;
                    this.ended = true;
                    this.syncExternalHud();
                    ctx.onGameOver({
                        score: this.score,
                        level: this.tierNum,
                        stars: this.score >= 1200 ? 2 : (this.score >= 500 ? 1 : 0),
                        reason: tr(`${this.bossTitle} karşısında gemi düştü.`, `Destroyed by ${this.bossTitle}.`)
                    });
                }
            }

            drawArenaOverlays() {
                const g = this.fxG;
                const lg = this.laserG;
                g.clear();
                lg.clear();

                // Boss Core HP Bar
                const bw = 420;
                const bx = 480 - bw / 2;
                const ratio = clamp(this.bossHp / this.bossMaxHp, 0, 1);
                g.fillStyle(0x090514, 0.88);
                g.fillRoundedRect(bx, 28, bw, 12, 5);
                g.lineStyle(1, 0xf43f5e, 0.55);
                g.strokeRoundedRect(bx, 28, bw, 12, 5);
                g.fillStyle(this.bossPhase === 3 ? 0xff2d55 : 0xf43f5e, 1);
                g.fillRoundedRect(bx + 2, 30, (bw - 4) * ratio, 8, 3);

                // Pod Mini HP Bars
                for (let i = 0; i < this.pods.length; i++) {
                    const pod = this.pods[i];
                    if (!pod.alive) continue;
                    const pr = clamp(pod.hp / pod.maxHp, 0, 1);
                    g.fillStyle(0x020617, 0.8);
                    g.fillRect(pod.sprite.x - 24, pod.sprite.y - 34, 48, 5);
                    g.fillStyle(0xf59e0b, 1);
                    g.fillRect(pod.sprite.x - 23, pod.sprite.y - 33, 46 * pr, 3);
                }

                // Sweeping Lasers
                for (let i = 0; i < this.sweepingLasers.length; i++) {
                    const ls = this.sweepingLasers[i];
                    const ex = ls.ox + Math.cos(ls.angle) * 680;
                    const ey = ls.oy + Math.sin(ls.angle) * 680;
                    if (ls.telegraph > 0) {
                        lg.lineStyle(2, 0xfbbf24, 0.6);
                        lg.lineBetween(ls.ox, ls.oy, ex, ey);
                    } else {
                        lg.lineStyle(16, 0xf43f5e, 0.35);
                        lg.lineBetween(ls.ox, ls.oy, ex, ey);
                        lg.lineStyle(6, 0xffffff, 0.95);
                        lg.lineBetween(ls.ox, ls.oy, ex, ey);
                    }
                }

                // Falling Barrage Danger Lanes
                for (let i = 0; i < this.fallingBarrages.length; i++) {
                    const fb = this.fallingBarrages[i];
                    lg.lineStyle(2, fb.isPink ? 0xff4fd8 : 0xf43f5e, 0.45);
                    lg.lineBetween(fb.x, 0, fb.x, 540);
                    lg.fillStyle(fb.isPink ? 0xff4fd8 : 0xf43f5e, 0.65);
                    lg.fillCircle(fb.x, 22, 6);
                }

                // Shockwave Dash Lane Warning
                if (this.dashState.active && this.dashState.phase === 'telegraph') {
                    lg.fillStyle(0xef4444, 0.16);
                    lg.fillRect(0, this.dashState.targetY - 46, 960, 92);
                    lg.lineStyle(2, 0xf43f5e, 0.7);
                    lg.strokeRect(0, this.dashState.targetY - 46, 960, 92);
                }

                // Super Hyper Beam Render
                if (this.superBeamTimer > 0) {
                    const bx0 = this.player.x;
                    const by0 = this.player.y;
                    const ex0 = bx0 + Math.cos(this.aimAngle) * 760;
                    const ey0 = by0 + Math.sin(this.aimAngle) * 760;
                    lg.lineStyle(38, 0x22d3ee, 0.35);
                    lg.lineBetween(bx0, by0, ex0, ey0);
                    lg.lineStyle(16, 0xe0f2fe, 0.95);
                    lg.lineBetween(bx0, by0, ex0, ey0);
                }

                // Bottom Energy & Parry Gauge
                g.fillStyle(0x090514, 0.86);
                g.fillRoundedRect(16, 512, 220, 14, 5);
                const eRatio = clamp(this.energy / 450, 0, 1);
                g.fillStyle(this.energy >= 300 ? 0x22d3ee : 0xff4fd8, 1);
                g.fillRoundedRect(18, 514, 216 * eRatio, 10, 4);
                g.lineStyle(1.5, 0xffffff, 0.5);
                g.lineBetween(16 + 220 * (300 / 450), 511, 16 + 220 * (300 / 450), 527);

                this.energyLabelTxt.setText(
                    `ENERGY ${this.energy}/450 ${this.energy >= 300 ? '[SHIFT/RMB HYPER BEAM READY!]' : '[SPACE PARRY PINK ORBS]'}`
                );
                this.modeToggleTxt.setText(`[E] AUTO:${this.autoFire ? 'ON' : 'OFF'}  [M] STEER:${this.mouseSteer ? 'MOUSE' : 'WASD'}`);
            }

            syncExternalHud() {
                const livePods = this.pods.filter((p) => p.alive).length;
                const obj = isStory
                    ? tr(`${this.bossTitle} Yen / ${storyTarget} Skor`, `Defeat ${this.bossTitle} / ${storyTarget} Score`)
                    : tr(`Zayıf Nokta: ${livePods} Pod · Pembe Mermi Savuştur [Space]`, `Weakpoints: ${livePods} Pods · Parry Pink Orbs [Space]`);
                safeSetHud(ctx, {
                    score: this.score,
                    level: this.tierNum,
                    maxLevel: this.endlessRush ? '∞' : 4,
                    lives: this.lives,
                    statusText: `${this.bossTitle} · PH.${this.bossPhase} · NRG ${this.energy}`,
                    objectiveText: obj
                });
            }
        }

        return mountPhaserHost(ctx, () => ({
            type: global.Phaser.AUTO,
            parent: ctx.stageEl,
            width: 960,
            height: 540,
            backgroundColor: '#07040e',
            physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
            scale: { mode: global.Phaser.Scale.FIT, autoCenter: global.Phaser.Scale.CENTER_BOTH },
            scene: [CrimsonColossusScene]
        }), runtime);
    };
})(window);
