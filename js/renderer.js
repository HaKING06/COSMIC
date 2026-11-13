/**
 * COSMIC SURVIVORS v10.0 — GENESIS EDITION
 * Hardware-Accelerated PixiJS v8 Renderer (with Canvas2D fallback & Tactical Sector Minimap)
 * Features multi-layer scrolling parallax backdrops, CC0 PNG ships/enemies/bosses/obstacles/props,
 * PixiJS v8 pixi-filters (BloomFilter & ShockwaveFilter), Player Skin Tint, Boss Shield Pylons,
 * strict path-reset arc drawing (zero stray origin lines), and controllable Normal vs Calm VFX.
 */
(function (global) {
    'use strict';

    const SHIP_IDS = ['interceptor', 'dreadnought', 'aegis', 'phantom', 'solarflare', 'tempest', 'valkyrie', 'chronos'];
    const ENEMY_IDS = ['swarmer', 'kamikaze', 'shooter', 'phantom', 'tank', 'splitter', 'sniper', 'queen'];
    const BOSS_IDS = ['behemoth', 'leviathan', 'hivemind', 'chronovore', 'seraphim'];
    const OBSTACLE_IDS = ['asteroid_cluster', 'bulkhead_h', 'bulkhead_v', 'vault_bunker', 'reactor_core'];
    const PROP_IDS = ['debris_1', 'debris_2', 'debris_3', 'meteor_1', 'meteor_2', 'lava_meteor', 'pylon_beacon', 'cargo_pod', 'chest', 'xp_crystal', 'heal_orb', 'shield_orb'];
    const FX_IDS = ['glow_soft', 'flare', 'ring', 'spark', 'magic', 'smoke', 'slash', 'laser_cyan', 'laser_red', 'missile_player', 'exhaust_flame', 'enemy_orb', 'player_orb'];
    const MAP_IDS = ['sector9', 'nebula', 'blackhole', 'dyson'];

    function parseColorHex(hex) {
        if (typeof hex === 'number') return Number.isFinite(hex) ? hex : 0x38bdf8;
        if (!hex || typeof hex !== 'string') return 0x38bdf8;
        const clean = hex.replace(/^0x/i, '').replace('#', '').slice(0, 6);
        const val = parseInt(clean, 16);
        return Number.isFinite(val) ? val : 0x38bdf8;
    }

    class SpritePool {
        constructor(parent, defaultAnchor = 0.5) {
            this.parent = parent;
            this.defaultAnchor = defaultAnchor;
            this.pool = [];
            this.active = 0;
        }
        beginFrame() {
            this.active = 0;
        }
        acquire(texture) {
            let sp = this.pool[this.active];
            if (!sp) {
                sp = new global.PIXI.Sprite(texture || global.PIXI.Texture.EMPTY);
                sp.anchor.set(this.defaultAnchor);
                this.parent.addChild(sp);
                this.pool.push(sp);
            } else if (texture && sp.texture !== texture) {
                sp.texture = texture;
            }
            sp.visible = true;
            sp.alpha = 1;
            sp.tint = 0xffffff;
            sp.blendMode = 'normal';
            sp.rotation = 0;
            sp.scale.set(1);
            this.active++;
            return sp;
        }
        endFrame() {
            for (let i = this.active; i < this.pool.length; i++) {
                this.pool[i].visible = false;
            }
        }
    }

    class CosmicRenderer {
        constructor() {
            this.mode = 'uninitialized'; // 'pixi' | 'canvas2d'
            this.app = null;
            this.canvas = null;
            this.ctx2d = null;
            this.textures = {};
            this.htmlImages = {};
            this.ready = false;

            this.vfxMode = 'normal'; // 'normal' | 'calm'
            this.showDmgNumbers = true;

            // Pixi scene nodes
            this.bgLayer = null;
            this.worldLayer = null;
            this.fxWorldLayer = null;
            this.hudWorldLayer = null;
            this.bgTiling = null;
            this.gridGfx = null;
            this.zoneGfx = null;
            this.floorGfx = null;
            this.teleGfx = null;
            this.overlayGfx = null;

            this.pickupContainer = null;
            this.propContainer = null;
            this.obstacleContainer = null;
            this.enemyContainer = null;
            this.bossContainer = null;
            this.playerContainer = null;
            this.bulletContainer = null;
            this.fxContainer = null;

            this.pickupPool = null;
            this.propPool = null;
            this.obstaclePool = null;
            this.enemyPool = null;
            this.bossPool = null;
            this.bulletPool = null;
            this.fxPool = null;
            this.playerSprite = null;
            this.exhaustSprite = null;
            this.textPool = [];
            this.textActive = 0;

            // Pixi v8 optional filters (vendor/pixi-filters.min.js)
            this.fxBloomFilter = null;
            this.bulletBloomFilter = null;
            this.shockwaveFilter = null;
            this.shockwaveTimer = 0;
            this.shockwaveDuration = 0.85;
            this._lastShockId = null;
            this._lastShockRef = null;
            this._shockWasBool = false;
            this._lastRenderTime = 0;

            this.screenW = 1280;
            this.screenH = 720;
            this.camX = 2800;
            this.camY = 2800;
            this.shakeX = 0;
            this.shakeY = 0;
            this.curMapId = 'sector9';
        }

        _assetManifest() {
            const items = [];
            SHIP_IDS.forEach(id => items.push([`ship_${id}`, `assets/ships/${id}.png`]));
            ENEMY_IDS.forEach(id => items.push([`enemy_${id}`, `assets/enemies/${id}.png`]));
            BOSS_IDS.forEach(id => items.push([`boss_${id}`, `assets/bosses/${id}.png`]));
            OBSTACLE_IDS.forEach(id => items.push([`obs_${id}`, `assets/sprites/obstacles/${id}.png`]));
            PROP_IDS.forEach(id => items.push([`prop_${id}`, `assets/sprites/props/${id}.png`]));
            FX_IDS.forEach(id => items.push([`fx_${id}`, `assets/sprites/fx/${id}.png`]));
            MAP_IDS.forEach(id => items.push([`bg_${id}`, `assets/backdrops/${id}.jpg`]));
            return items;
        }

        _isValidLine(x1, y1, x2, y2) {
            return Number.isFinite(x1) && Number.isFinite(y1)
                && Number.isFinite(x2) && Number.isFinite(y2)
                && x1 !== 0 && y1 !== 0 && x2 !== 0 && y2 !== 0;
        }

        _strokeArcPixi(gfx, cx, cy, r, startA, endA, strokeStyle) {
            if (!Number.isFinite(cx) || !Number.isFinite(cy) || !Number.isFinite(r) || r <= 0) return;
            if (!Number.isFinite(startA) || !Number.isFinite(endA)) return;
            const sx = cx + Math.cos(startA) * r;
            const sy = cy + Math.sin(startA) * r;
            if (!Number.isFinite(sx) || !Number.isFinite(sy)) return;
            gfx.beginPath();
            gfx.moveTo(sx, sy);
            gfx.arc(cx, cy, r, startA, endA);
            gfx.stroke(strokeStyle);
        }

        _arc2D(ctx, cx, cy, r, startA, endA, begin = true) {
            if (!Number.isFinite(cx) || !Number.isFinite(cy) || !Number.isFinite(r) || r <= 0) return false;
            if (!Number.isFinite(startA) || !Number.isFinite(endA)) return false;
            const sx = cx + Math.cos(startA) * r;
            const sy = cy + Math.sin(startA) * r;
            if (!Number.isFinite(sx) || !Number.isFinite(sy)) return false;
            if (begin) ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.arc(cx, cy, r, startA, endA);
            return true;
        }

        async init(canvasEl) {
            this.canvas = canvasEl;
            this.screenW = global.innerWidth || 1280;
            this.screenH = global.innerHeight || 720;

            // Always preload HTMLImageElements first (works offline/static & powers both modes cleanly)
            const manifest = this._assetManifest();
            await Promise.all(manifest.map(([key, url]) => new Promise(resolve => {
                const img = new Image();
                img.onload = () => { this.htmlImages[key] = img; resolve(); };
                img.onerror = () => resolve();
                img.src = url;
            })));

            // Try PixiJS v8 WebGL/WebGPU accelerated initialization on a dedicated WebGL canvas
            if (global.PIXI && typeof global.PIXI.Application === 'function') {
                try {
                    const app = new global.PIXI.Application();
                    await app.init({
                        canvas: canvasEl,
                        width: this.screenW,
                        height: this.screenH,
                        backgroundColor: 0x050811,
                        antialias: true,
                        resolution: Math.min(2, global.devicePixelRatio || 1),
                        autoDensity: true,
                        powerPreference: 'high-performance'
                    });
                    // Stop default internal ticker; game loop drives render explicitly per frame!
                    app.ticker.stop();
                    this.app = app;
                    this.mode = 'pixi';

                    // Convert loaded HTML images into GPU textures synchronously via PIXI.Texture.from
                    for (const [key, img] of Object.entries(this.htmlImages)) {
                        try {
                            this.textures[key] = global.PIXI.Texture.from(img);
                        } catch (e) { /* safe fallback */ }
                    }

                    this._buildPixiStage();
                    this.ready = true;
                    return 'pixi';
                } catch (err) {
                    // Replace canvas cleanly in case WebGL context attempt tainted the original <canvas>
                    if (canvasEl && canvasEl.parentNode) {
                        const fresh = document.createElement('canvas');
                        fresh.id = canvasEl.id;
                        fresh.className = canvasEl.className;
                        canvasEl.parentNode.replaceChild(fresh, canvasEl);
                        this.canvas = fresh;
                    }
                }
            }

            // Crisp Canvas2D fallback (zero visual breakage even without WebGL hardware)
            this.mode = 'canvas2d';
            this.ctx2d = this.canvas.getContext('2d', { alpha: false });
            this.resize(this.screenW, this.screenH);
            this.ready = true;
            return 'canvas2d';
        }

        _initPixiFilters() {
            const filtersNs = global.PIXI && global.PIXI.filters;
            if (!filtersNs) return;
            try {
                if (typeof filtersNs.BloomFilter === 'function') {
                    this.fxBloomFilter = new filtersNs.BloomFilter({ strength: 1.6, quality: 3 });
                    this.bulletBloomFilter = new filtersNs.BloomFilter({ strength: 1.6, quality: 3 });
                }
                if (typeof filtersNs.ShockwaveFilter === 'function') {
                    this.shockwaveFilter = new filtersNs.ShockwaveFilter({
                        center: { x: this.screenW * 0.5, y: this.screenH * 0.5 },
                        speed: 920,
                        amplitude: 24,
                        wavelength: 140,
                        brightness: 1.12,
                        radius: 780,
                        time: 0
                    });
                }
            } catch (e) {
                this.fxBloomFilter = null;
                this.bulletBloomFilter = null;
                this.shockwaveFilter = null;
            }
        }

        _syncVfxFilters() {
            if (this.mode !== 'pixi') return;
            const isCalm = this.vfxMode === 'calm';
            if (isCalm) {
                if (this.fxContainer) this.fxContainer.filters = null;
                if (this.bulletContainer) this.bulletContainer.filters = null;
                if (this.worldLayer) {
                    this.worldLayer.filters = null;
                    this.worldLayer.filterArea = null;
                }
                this.shockwaveTimer = 0;
            } else {
                if (this.fxContainer && this.fxBloomFilter) this.fxContainer.filters = [this.fxBloomFilter];
                if (this.bulletContainer && this.bulletBloomFilter) this.bulletContainer.filters = [this.bulletBloomFilter];
            }
        }

        _buildPixiStage() {
            const stage = this.app.stage;
            stage.removeChildren();

            this.bgLayer = new global.PIXI.Container();
            this.worldLayer = new global.PIXI.Container();
            this.fxWorldLayer = new global.PIXI.Container();
            this.hudWorldLayer = new global.PIXI.Container();

            stage.addChild(this.bgLayer);
            stage.addChild(this.worldLayer);
            stage.addChild(this.fxWorldLayer);
            stage.addChild(this.hudWorldLayer);

            const bgTex = this.textures[`bg_${this.curMapId}`] || global.PIXI.Texture.WHITE;
            this.bgTiling = new global.PIXI.TilingSprite({
                texture: bgTex,
                width: this.screenW,
                height: this.screenH
            });
            this.bgTiling.alpha = 0.88;
            this.bgLayer.addChild(this.bgTiling);

            this.gridGfx = new global.PIXI.Graphics();
            this.zoneGfx = new global.PIXI.Graphics();
            this.floorGfx = new global.PIXI.Graphics();
            this.worldLayer.addChild(this.gridGfx);
            this.worldLayer.addChild(this.zoneGfx);
            this.worldLayer.addChild(this.floorGfx);

            this.pickupContainer = new global.PIXI.Container();
            this.propContainer = new global.PIXI.Container();
            this.obstacleContainer = new global.PIXI.Container();
            this.enemyContainer = new global.PIXI.Container();
            this.bossContainer = new global.PIXI.Container();
            this.playerContainer = new global.PIXI.Container();
            this.bulletContainer = new global.PIXI.Container();
            this.fxContainer = new global.PIXI.Container();

            this.worldLayer.addChild(this.pickupContainer);
            this.worldLayer.addChild(this.propContainer);
            this.worldLayer.addChild(this.obstacleContainer);
            this.worldLayer.addChild(this.enemyContainer);
            this.worldLayer.addChild(this.bossContainer);
            this.worldLayer.addChild(this.playerContainer);
            this.worldLayer.addChild(this.bulletContainer);

            this.teleGfx = new global.PIXI.Graphics();
            this.overlayGfx = new global.PIXI.Graphics();
            this.worldLayer.addChild(this.teleGfx);
            this.worldLayer.addChild(this.fxContainer);
            this.worldLayer.addChild(this.overlayGfx);

            this.pickupPool = new SpritePool(this.pickupContainer);
            this.propPool = new SpritePool(this.propContainer);
            this.obstaclePool = new SpritePool(this.obstacleContainer);
            this.enemyPool = new SpritePool(this.enemyContainer);
            this.bossPool = new SpritePool(this.bossContainer);
            this.bulletPool = new SpritePool(this.bulletContainer);
            this.fxPool = new SpritePool(this.fxContainer);

            this.exhaustSprite = new global.PIXI.Sprite(this.textures.fx_exhaust_flame || global.PIXI.Texture.EMPTY);
            this.exhaustSprite.anchor.set(0.5, 0);
            this.exhaustSprite.blendMode = 'add';
            this.playerSprite = new global.PIXI.Sprite(this.textures.ship_interceptor || global.PIXI.Texture.EMPTY);
            this.playerSprite.anchor.set(0.5);
            this.playerContainer.addChild(this.exhaustSprite);
            this.playerContainer.addChild(this.playerSprite);

            this._initPixiFilters();
            this._syncVfxFilters();
        }

        setMap(mapId) {
            this.curMapId = mapId || 'sector9';
            if (this.mode === 'pixi' && this.bgTiling && this.textures[`bg_${this.curMapId}`]) {
                this.bgTiling.texture = this.textures[`bg_${this.curMapId}`];
            }
        }

        setVfxSettings(vfxMode, showDmg) {
            this.vfxMode = vfxMode === 'calm' ? 'calm' : 'normal';
            this.showDmgNumbers = showDmg !== false;
            this._syncVfxFilters();
        }

        resize(w, h) {
            this.screenW = Math.max(320, w || global.innerWidth || 1280);
            this.screenH = Math.max(240, h || global.innerHeight || 720);
            if (this.mode === 'pixi' && this.app) {
                this.app.renderer.resize(this.screenW, this.screenH);
                if (this.bgTiling) {
                    this.bgTiling.width = this.screenW;
                    this.bgTiling.height = this.screenH;
                }
            } else if (this.canvas) {
                const dpr = Math.min(2, global.devicePixelRatio || 1);
                this.canvas.width = Math.round(this.screenW * dpr);
                this.canvas.height = Math.round(this.screenH * dpr);
                this.canvas.style.width = `${this.screenW}px`;
                this.canvas.style.height = `${this.screenH}px`;
                if (this.ctx2d) this.ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
            }
        }

        _acquireText() {
            let txt = this.textPool[this.textActive];
            if (!txt) {
                txt = new global.PIXI.Text({
                    text: '',
                    style: {
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: 15,
                        fontWeight: '700',
                        fill: '#f8fafc',
                        stroke: { color: '#050811', width: 3 }
                    }
                });
                txt.anchor.set(0.5);
                this.hudWorldLayer.addChild(txt);
                this.textPool.push(txt);
            }
            txt.visible = true;
            this.textActive++;
            return txt;
        }

        render(state) {
            if (!this.ready || !state) return;
            this.camX = state.camX;
            this.camY = state.camY;
            this.shakeX = state.shakeX || 0;
            this.shakeY = state.shakeY || 0;

            if (this.mode === 'pixi') {
                this._renderPixi(state);
            } else {
                this._renderCanvas2D(state);
            }
        }

        _updateShockwaveState(state, camLeft, camTop, isCalm) {
            const curT = Number.isFinite(state.time) ? state.time : this._lastRenderTime;
            if (curT < this._lastRenderTime) {
                this._lastRenderTime = curT;
                this.shockwaveTimer = 0;
                this._lastShockId = null;
                this._lastShockRef = null;
                this._shockWasBool = false;
            }
            const dt = Math.min(0.05, Math.max(0, curT - this._lastRenderTime));
            this._lastRenderTime = curT;

            const trig = state.shockwaveTrigger;
            if (!trig) {
                this._shockWasBool = false;
            } else if (!isCalm && this.shockwaveFilter) {
                let isNew = false;
                if (typeof trig === 'object') {
                    if (trig.id != null) {
                        if (trig.id !== this._lastShockId) {
                            this._lastShockId = trig.id;
                            isNew = true;
                        }
                    } else if (trig !== this._lastShockRef) {
                        this._lastShockRef = trig;
                        isNew = true;
                    }
                } else if (typeof trig === 'number') {
                    if (trig !== this._lastShockId) {
                        this._lastShockId = trig;
                        isNew = true;
                    }
                } else if (!this._shockWasBool) {
                    this._shockWasBool = true;
                    isNew = true;
                }

                if (isNew) {
                    const wx = (typeof trig === 'object' && Number.isFinite(trig.x)) ? trig.x : this.camX;
                    const wy = (typeof trig === 'object' && Number.isFinite(trig.y)) ? trig.y : this.camY;
                    this.shockwaveFilter.center = { x: wx - camLeft, y: wy - camTop };
                    this.shockwaveFilter.time = 0;
                    this.shockwaveFilter.radius = (typeof trig === 'object' && trig.radius > 0)
                        ? trig.radius
                        : Math.max(this.screenW, this.screenH) * 0.72;
                    this.shockwaveDuration = (typeof trig === 'object' && trig.duration > 0) ? trig.duration : 0.85;
                    this.shockwaveTimer = this.shockwaveDuration;
                }
            }

            if (!isCalm && this.shockwaveTimer > 0 && this.shockwaveFilter) {
                this.shockwaveTimer = Math.max(0, this.shockwaveTimer - dt);
                this.shockwaveFilter.time += dt;
                if (!this.worldLayer.filterArea) {
                    this.worldLayer.filterArea = new global.PIXI.Rectangle(0, 0, this.screenW, this.screenH);
                } else {
                    this.worldLayer.filterArea.width = this.screenW;
                    this.worldLayer.filterArea.height = this.screenH;
                }
                if (!this.worldLayer.filters) {
                    this.worldLayer.filters = [this.shockwaveFilter];
                }
            } else if (this.worldLayer.filters) {
                this.worldLayer.filters = null;
                this.worldLayer.filterArea = null;
            }
        }

        _renderPixi(state) {
            const camLeft = this.camX - this.screenW * 0.5 + this.shakeX;
            const camTop = this.camY - this.screenH * 0.5 + this.shakeY;
            const isCalm = this.vfxMode === 'calm';
            const glowAlphaMult = isCalm ? 0.42 : 0.85;
            const W = state.worldW || 5600;
            const H = state.worldH || 5600;
            const nowT = state.time || 0;

            const mapState = state.mapState;
            const sx = mapState ? mapState.streamOffsetX : 0;
            const sy = mapState ? mapState.streamOffsetY : 0;

            // Parallax seamless tiling backdrop (never filtered)
            if (this.bgTiling) {
                this.bgTiling.tilePosition.x = -(camLeft * 0.36 + sx);
                this.bgTiling.tilePosition.y = -(camTop * 0.36 + sy);
                this.bgTiling.alpha = isCalm ? 0.72 : 0.88;
            }

            this.worldLayer.position.set(-camLeft, -camTop);
            this.hudWorldLayer.position.set(-camLeft, -camTop);

            this._updateShockwaveState(state, camLeft, camTop, isCalm);

            this.gridGfx.clear();
            this.zoneGfx.clear();
            this.floorGfx.clear();
            this.teleGfx.clear();
            this.overlayGfx.clear();

            // Subtle culled sector coordinate grid lines (depth & velocity cue on 5600x5600)
            const gridStep = 400;
            const gxStart = Math.max(0, Math.floor((camLeft - 80) / gridStep) * gridStep);
            const gxEnd = Math.min(W, Math.ceil((camLeft + this.screenW + 80) / gridStep) * gridStep);
            const gyStart = Math.max(0, Math.floor((camTop - 80) / gridStep) * gridStep);
            const gyEnd = Math.min(H, Math.ceil((camTop + this.screenH + 80) / gridStep) * gridStep);
            const gridAlpha = isCalm ? 0.032 : 0.055;
            for (let gx = gxStart; gx <= gxEnd; gx += gridStep) {
                this.gridGfx.beginPath();
                this.gridGfx.moveTo(gx, Math.max(0, gyStart)).lineTo(gx, Math.min(H, gyEnd)).stroke({ color: 0x38bdf8, alpha: gridAlpha, width: 1 });
            }
            for (let gy = gyStart; gy <= gyEnd; gy += gridStep) {
                this.gridGfx.beginPath();
                this.gridGfx.moveTo(Math.max(0, gxStart), gy).lineTo(Math.min(W, gxEnd), gy).stroke({ color: 0x38bdf8, alpha: gridAlpha, width: 1 });
            }

            // Perimeter Border Forcefield along x = 0, x = worldW, y = 0, y = worldH
            this.gridGfx.rect(0, 0, W, H).stroke({ color: 0x38bdf8, alpha: 0.45, width: 4 });
            this.gridGfx.rect(16, 16, W - 32, H - 32).stroke({ color: 0xfb7185, alpha: 0.28, width: 2 });

            // Visible hazard ticks along arena walls so edge limits are immediately readable
            const tickStep = 120;
            if (camLeft < 180) {
                for (let y = Math.max(0, Math.floor(camTop / tickStep) * tickStep); y <= Math.min(H - 20, camTop + this.screenH + 40); y += tickStep) {
                    this.gridGfx.beginPath();
                    this.gridGfx.moveTo(2, y).lineTo(16, y + 18).stroke({ color: 0xfb7185, alpha: 0.35, width: 2 });
                }
            }
            if (camLeft + this.screenW > W - 180) {
                for (let y = Math.max(0, Math.floor(camTop / tickStep) * tickStep); y <= Math.min(H - 20, camTop + this.screenH + 40); y += tickStep) {
                    this.gridGfx.beginPath();
                    this.gridGfx.moveTo(W - 16, y).lineTo(W - 2, y + 18).stroke({ color: 0xfb7185, alpha: 0.35, width: 2 });
                }
            }
            if (camTop < 180) {
                for (let x = Math.max(0, Math.floor(camLeft / tickStep) * tickStep); x <= Math.min(W - 20, camLeft + this.screenW + 40); x += tickStep) {
                    this.gridGfx.beginPath();
                    this.gridGfx.moveTo(x, 2).lineTo(x + 18, 16).stroke({ color: 0xfb7185, alpha: 0.35, width: 2 });
                }
            }
            if (camTop + this.screenH > H - 180) {
                for (let x = Math.max(0, Math.floor(camLeft / tickStep) * tickStep); x <= Math.min(W - 20, camLeft + this.screenW + 40); x += tickStep) {
                    this.gridGfx.beginPath();
                    this.gridGfx.moveTo(x, H - 16).lineTo(x + 18, H - 2).stroke({ color: 0xfb7185, alpha: 0.35, width: 2 });
                }
            }

            // Pools Begin
            this.pickupPool.beginFrame();
            this.propPool.beginFrame();
            this.obstaclePool.beginFrame();
            this.enemyPool.beginFrame();
            this.bossPool.beginFrame();
            this.bulletPool.beginFrame();
            this.fxPool.beginFrame();
            this.textActive = 0;

            // Dynamic Sector Zones (Nebula currents, Blackhole singularity, Obstacles, Meteors, Pylons, Dyson beams)
            if (mapState) {
                // Nebula boost/EMP currents
                const currents = mapState.currents || [];
                for (let i = 0; i < currents.length; i++) {
                    const c = currents[i];
                    if (Math.abs(c.x - this.camX) > this.screenW * 0.75 + c.r || Math.abs(c.y - this.camY) > this.screenH * 0.75 + c.r) continue;
                    const isBoost = c.kind === 'boost';
                    const col = isBoost ? 0x38bdf8 : 0xfb7185;
                    const pulse = 0.08 + Math.sin(mapState.time * 2.2 + c.pulsePhase) * 0.03;
                    this.zoneGfx.circle(c.x, c.y, c.r).fill({ color: col, alpha: pulse * (isCalm ? 0.65 : 1) });
                    this.zoneGfx.circle(c.x, c.y, c.r).stroke({ color: col, alpha: 0.32, width: 2 });
                }

                // Black hole moving singularity
                if (mapState.mapId === 'blackhole' && mapState.blackHoleCore) {
                    const bh = mapState.blackHoleCore;
                    this.zoneGfx.circle(bh.x, bh.y, bh.r * 2.1).fill({ color: 0xf97316, alpha: 0.09 * (isCalm ? 0.65 : 1) });
                    this.zoneGfx.circle(bh.x, bh.y, bh.r * 1.15).stroke({ color: 0xfb923c, alpha: 0.55, width: 4 });
                    this.zoneGfx.circle(bh.x, bh.y, bh.r * 0.72).fill({ color: 0x020409, alpha: 0.96 });
                }

                // Solid Cover Obstacles (Drop shadows, ambient Vault/Reactor glow rings, & sprites)
                const obstacles = mapState.obstacles || [];
                for (let i = 0; i < obstacles.length; i++) {
                    const o = obstacles[i];
                    const cullPad = (o.auraR || o.captureR || o.r || 130) + 120;
                    if (Math.abs(o.x - this.camX) > this.screenW * 0.65 + cullPad || Math.abs(o.y - this.camY) > this.screenH * 0.65 + cullPad) continue;

                    if (o.shape === 'rect') {
                        this.zoneGfx.roundRect(o.x - o.w * 0.5 + 10, o.y - o.h * 0.5 + 14, o.w, o.h, 14).fill({ color: 0x02040a, alpha: 0.52 });
                        this.zoneGfx.roundRect(o.x - o.w * 0.5, o.y - o.h * 0.5, o.w, o.h, 10).stroke({ color: 0x64748b, alpha: 0.22, width: 1.5 });
                    } else {
                        this.zoneGfx.circle(o.x + 10, o.y + 14, o.r * 1.03).fill({ color: 0x02040a, alpha: 0.50 });
                        this.zoneGfx.circle(o.x, o.y, o.r).stroke({ color: 0x64748b, alpha: 0.18, width: 1.5 });
                    }

                    if (o.kind === 'vault_bunker') {
                        const capR = o.captureR || 195;
                        const pct = o.captured ? 1 : Math.min(1, (o.progress || 0) / (o.maxProgress || 4));
                        const auraCol = o.captured ? 0x34d399 : 0xfbbf24;
                        this.zoneGfx.circle(o.x, o.y, capR).fill({ color: auraCol, alpha: (o.captured ? 0.035 : 0.065 + pct * 0.10) * (isCalm ? 0.6 : 1) });
                        this.zoneGfx.circle(o.x, o.y, capR).stroke({ color: auraCol, alpha: o.captured ? 0.25 : 0.52, width: 2 });
                        if (!o.captured && pct > 0.01) {
                            this._strokeArcPixi(this.overlayGfx, o.x, o.y, capR - 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct, { color: 0xfde047, alpha: 0.92, width: 5 });
                        }
                    } else if (o.kind === 'reactor_core') {
                        const auraR = o.auraR || 235;
                        if (o.mode === 'overdrive') {
                            const pulse = 0.055 + Math.sin(nowT * 2.6 + (o.pulsePhase || 0)) * 0.025;
                            this.zoneGfx.circle(o.x, o.y, auraR).fill({ color: 0x22d3ee, alpha: pulse * (isCalm ? 0.6 : 1) });
                            this.zoneGfx.circle(o.x, o.y, auraR).stroke({ color: 0x22d3ee, alpha: 0.36, width: 2 });
                        } else {
                            this.zoneGfx.circle(o.x, o.y, auraR).fill({ color: 0xf97316, alpha: 0.04 * (isCalm ? 0.6 : 1) });
                            this.zoneGfx.circle(o.x, o.y, auraR).stroke({ color: 0xfb923c, alpha: 0.28, width: 1.5 });
                            if (o.pulseTimer <= o.pulseWarning) {
                                const chg = 1 - Math.max(0, o.pulseTimer / Math.max(0.01, o.pulseWarning));
                                const ringR = o.r + (auraR - o.r) * chg;
                                this.zoneGfx.circle(o.x, o.y, ringR).stroke({ color: 0xfb7185, alpha: 0.72, width: 2.5 });
                                this._strokeArcPixi(this.overlayGfx, o.x, o.y, auraR - 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * chg, { color: 0xf97316, alpha: 0.88, width: 4 });
                            }
                            if (o.pulseFlash > 0) {
                                this.zoneGfx.circle(o.x, o.y, auraR).fill({ color: 0xf97316, alpha: 0.26 * (o.pulseFlash / 0.5) * (isCalm ? 0.6 : 1) });
                            }
                        }
                    }

                    const tex = this.textures[o.sprite] || this.textures[`obs_${o.kind}`];
                    if (tex) {
                        const sp = this.obstaclePool.acquire(tex);
                        sp.position.set(o.x, o.y);
                        sp.rotation = o.rotation || 0;
                        if (o.shape === 'rect') {
                            sp.width = o.w * 1.04;
                            sp.height = o.h * 1.06;
                        } else {
                            const sz = o.r * 2.08;
                            sp.width = sz;
                            sp.height = sz;
                        }
                    }
                }

                // Telegraphed Meteors (shrinking hazard ring)
                const meteors = mapState.meteors || [];
                for (let i = 0; i < meteors.length; i++) {
                    const m = meteors[i];
                    if (!m.impacted) {
                        const prog = 1 - Math.max(0, m.delay / m.maxDelay);
                        this.teleGfx.circle(m.x, m.y, m.r).fill({ color: 0xf97316, alpha: 0.09 + prog * 0.14 });
                        this.teleGfx.circle(m.x, m.y, m.r).stroke({ color: 0xfb7185, alpha: 0.65, width: 2 });
                        if (m.r * prog > 2) {
                            this.teleGfx.circle(m.x, m.y, m.r * prog).stroke({ color: 0xfef08a, alpha: 0.85, width: 2 });
                        }
                    } else {
                        const fade = Math.max(0, m.afterglow / 0.45);
                        this.teleGfx.circle(m.x, m.y, m.r).fill({ color: 0xf97316, alpha: 0.28 * fade });
                    }
                }

                // Dyson Sweeping Beams
                const beams = mapState.beams || [];
                for (let i = 0; i < beams.length; i++) {
                    const b = beams[i];
                    const x2 = b.ox + Math.cos(b.angle) * b.length;
                    const y2 = b.oy + Math.sin(b.angle) * b.length;
                    if (!this._isValidLine(b.ox, b.oy, x2, y2)) continue;
                    if (b.warmup > 0) {
                        const pulse = 0.35 + Math.sin(mapState.time * 16) * 0.25;
                        this.teleGfx.beginPath();
                        this.teleGfx.moveTo(b.ox, b.oy).lineTo(x2, y2).stroke({ color: 0xfb7185, alpha: pulse, width: 4 });
                    } else {
                        this.teleGfx.beginPath();
                        this.teleGfx.moveTo(b.ox, b.oy).lineTo(x2, y2).stroke({ color: 0xf97316, alpha: isCalm ? 0.45 : 0.75, width: b.width });
                        this.teleGfx.beginPath();
                        this.teleGfx.moveTo(b.ox, b.oy).lineTo(x2, y2).stroke({ color: 0xffffff, alpha: 0.9, width: Math.max(4, b.width * 0.26) });
                    }
                }

                // Overdrive Pylons capture rings
                const objectives = mapState.objectives || [];
                for (let i = 0; i < objectives.length; i++) {
                    const o = objectives[i];
                    if (o.kind === 'pylon') {
                        const pct = Math.min(1, o.progress / o.maxProgress);
                        this.zoneGfx.circle(o.x, o.y, o.r).fill({ color: 0x38bdf8, alpha: (0.06 + pct * 0.12) * (isCalm ? 0.65 : 1) });
                        this.zoneGfx.circle(o.x, o.y, o.r).stroke({ color: pct > 0 ? 0x34d399 : 0x38bdf8, alpha: 0.55, width: 2 });
                        if (pct > 0.01) {
                            this._strokeArcPixi(this.zoneGfx, o.x, o.y, o.r - 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct, { color: 0x34d399, alpha: 0.95, width: 5 });
                        }
                    }
                }
            }

            // World Floor Zones (Chrono rifts, Solar burns, Napalm)
            const floorZones = state.floorZones || [];
            for (let i = 0; i < floorZones.length; i++) {
                const z = floorZones[i];
                const col = parseColorHex(z.color);
                this.floorGfx.circle(z.x, z.y, z.r).fill({ color: col, alpha: (isCalm ? 0.09 : 0.17) * Math.min(1, z.life) });
                this.floorGfx.circle(z.x, z.y, z.r).stroke({ color: col, alpha: 0.4 * Math.min(1, z.life), width: 2 });
            }

            // Player Passive Radiation Auras & Shield Ring
            const p = state.player;
            if (p) {
                if (p.solarAuraRadius > 0) {
                    this.floorGfx.circle(p.x, p.y, p.solarAuraRadius).fill({ color: 0xf97316, alpha: isCalm ? 0.05 : 0.09 });
                    this.floorGfx.circle(p.x, p.y, p.solarAuraRadius).stroke({ color: 0xf97316, alpha: 0.24, width: 1.5 });
                }
                if (p.sh > 1) {
                    const shAlpha = Math.min(0.45, 0.12 + (p.sh / Math.max(1, p.maxSh)) * 0.28);
                    this.overlayGfx.circle(p.x, p.y, 26).stroke({ color: 0x38bdf8, alpha: shAlpha, width: 2.2 });
                }
            }

            // Pickups: Crystals, Orbs, Chests
            const crystals = state.crystals || [];
            for (let i = 0; i < crystals.length; i++) {
                const c = crystals[i];
                if (Math.abs(c.x - this.camX) > this.screenW * 0.65 || Math.abs(c.y - this.camY) > this.screenH * 0.65) continue;
                const sp = this.pickupPool.acquire(this.textures.prop_xp_crystal);
                sp.position.set(c.x, c.y);
                const s = c.big ? 0.46 : 0.30;
                sp.scale.set(s);
                sp.tint = c.big ? 0xa78bfa : 0x38bdf8;
            }
            const pickups = state.pickups || [];
            for (let i = 0; i < pickups.length; i++) {
                const pk = pickups[i];
                const tex = pk.kind === 'shield' ? this.textures.prop_shield_orb : this.textures.prop_heal_orb;
                const sp = this.pickupPool.acquire(tex);
                sp.position.set(pk.x, pk.y);
                sp.scale.set(0.82);
            }
            const chests = state.chests || [];
            for (let i = 0; i < chests.length; i++) {
                const ch = chests[i];
                const sp = this.pickupPool.acquire(this.textures.prop_chest);
                sp.position.set(ch.x, ch.y + Math.sin(nowT * 3) * 3);
                sp.scale.set(0.54);
            }

            // Drifting Props & Live Map Objective Sprites
            if (mapState) {
                const debris = mapState.debris || [];
                for (let i = 0; i < debris.length; i++) {
                    const d = debris[i];
                    if (Math.abs(d.x - this.camX) > this.screenW * 0.72 || Math.abs(d.y - this.camY) > this.screenH * 0.72) continue;
                    const tex = this.textures[`prop_${d.sprite}`];
                    if (!tex) continue;
                    const sp = this.propPool.acquire(tex);
                    sp.position.set(d.x, d.y);
                    sp.rotation = d.angle;
                    sp.scale.set((d.r * 2) / Math.max(32, tex.width));
                    sp.alpha = 0.88;
                }
                const objectives = mapState.objectives || [];
                for (let i = 0; i < objectives.length; i++) {
                    const o = objectives[i];
                    const tex = this.textures[`prop_${o.sprite}`];
                    if (!tex) continue;
                    const sp = this.propPool.acquire(tex);
                    sp.position.set(o.x, o.y);
                    sp.rotation = o.rot;
                    sp.scale.set(o.kind === 'pylon' ? 0.75 : 0.65);
                }
            }

            // Enemies
            const enemies = state.enemies || [];
            for (let i = 0; i < enemies.length; i++) {
                const en = enemies[i];
                if (Math.abs(en.x - this.camX) > this.screenW * 0.68 || Math.abs(en.y - this.camY) > this.screenH * 0.68) continue;
                const key = `enemy_${en.spriteKey || 'swarmer'}`;
                const tex = this.textures[key] || this.textures.enemy_swarmer;
                const sp = this.enemyPool.acquire(tex);
                sp.position.set(en.x, en.y);
                sp.rotation = (en.angle || 0) + Math.PI / 2;
                const targetSize = (en.r || 16) * 2.55;
                const baseDim = Math.max(32, tex ? tex.width : 160);
                sp.scale.set(targetSize / baseDim);

                if (en.flashTimer > 0) sp.tint = 0xffffff;
                else if (en.frozenTimer > 0) sp.tint = 0x67e8f9;
                else if (en.burnTimer > 0) sp.tint = 0xfb923c;
                else sp.tint = en.isElite ? 0xfef08a : 0xffffff;

                sp.alpha = en.stealthAlpha != null ? en.stealthAlpha : 1.0;

                // Subtle single Elite threat halo (replaces stacked noisy rings)
                if (en.isElite) {
                    this.overlayGfx.circle(en.x, en.y, (en.r || 18) + 5).stroke({ color: 0xf59e0b, alpha: 0.36, width: 1.5 });
                }

                // Clean Sniper telegraph sightline
                if (en.telegraphTarget && this._isValidLine(en.x, en.y, en.telegraphTarget.x, en.telegraphTarget.y)) {
                    this.teleGfx.beginPath();
                    this.teleGfx.moveTo(en.x, en.y).lineTo(en.telegraphTarget.x, en.telegraphTarget.y).stroke({ color: 0xfb7185, alpha: 0.18 * glowAlphaMult, width: 5 });
                    this.teleGfx.beginPath();
                    this.teleGfx.moveTo(en.x, en.y).lineTo(en.telegraphTarget.x, en.telegraphTarget.y).stroke({ color: 0xfda4af, alpha: 0.78, width: 1.6 });
                    this.teleGfx.circle(en.telegraphTarget.x, en.telegraphTarget.y, 6).stroke({ color: 0xfb7185, alpha: 0.65, width: 1.5 });
                }

                // Thin HP bar only for elites or wounded enemies
                if (en.hp < en.maxHp || en.isElite) {
                    const bw = Math.max(24, en.r * 1.9);
                    const pct = Math.max(0, Math.min(1, en.hp / en.maxHp));
                    this.overlayGfx.rect(en.x - bw * 0.5, en.y - en.r - 12, bw, 4).fill({ color: 0x0f172a, alpha: 0.85 });
                    this.overlayGfx.rect(en.x - bw * 0.5, en.y - en.r - 12, bw * pct, 4).fill({ color: en.isElite ? 0xf59e0b : 0xfb7185, alpha: 0.95 });
                }
            }

            // Bosses & Animated Boss Shield Pylons
            const bosses = state.bosses || [];
            for (let i = 0; i < bosses.length; i++) {
                const b = bosses[i];
                const key = `boss_${b.spriteKey || 'behemoth'}`;
                const tex = this.textures[key] || this.textures.boss_behemoth;
                const sp = this.bossPool.acquire(tex);
                sp.position.set(b.x, b.y);
                sp.rotation = (b.angle || 0) + Math.PI / 2;
                const targetSize = (b.r || 64) * 2.45;
                sp.scale.set(targetSize / Math.max(64, tex ? tex.width : 384));
                sp.tint = b.flashTimer > 0 ? 0xffffff : (b.phase >= 2 ? 0xfca5a5 : 0xffffff);

                // Clean single Boss radial threat indicator
                this.overlayGfx.circle(b.x, b.y, (b.r || 64) + 6).stroke({ color: b.phase >= 2 ? 0xfb7185 : 0xf97316, alpha: 0.28, width: 2 });

                // Animated Boss Shield Pylons + Beam Tethers
                const pylons = Array.isArray(b.shieldPylons) ? b.shieldPylons : [];
                let activePylonCount = 0;
                for (let j = 0; j < pylons.length; j++) {
                    const py = pylons[j];
                    if (!py || py.alive === false || (py.hp != null && py.hp <= 0)) continue;
                    activePylonCount++;

                    if (this._isValidLine(b.x, b.y, py.x, py.y)) {
                        const pulseA = 0.28 + Math.sin(nowT * 6 + j) * 0.10;
                        this.teleGfx.beginPath();
                        this.teleGfx.moveTo(b.x, b.y).lineTo(py.x, py.y).stroke({ color: 0x38bdf8, alpha: pulseA * glowAlphaMult, width: 3.5 });
                        this.teleGfx.beginPath();
                        this.teleGfx.moveTo(b.x, b.y).lineTo(py.x, py.y).stroke({ color: 0xe0f2fe, alpha: pulseA * 0.75, width: 1.2 });
                    }

                    const pyTex = this.textures.prop_pylon_beacon || this.textures.fx_flare;
                    if (pyTex) {
                        const psp = this.propPool.acquire(pyTex);
                        psp.position.set(py.x, py.y);
                        psp.rotation = nowT * 2.4 + j * 1.1;
                        psp.tint = 0x67e8f9;
                        const pySize = ((py.r || 18) * 2.1);
                        psp.scale.set(pySize / Math.max(32, pyTex.width));
                    }

                    const spinA = nowT * 3.0 + j * 1.5;
                    const pyRingR = (py.r || 18) + 6;
                    this._strokeArcPixi(this.overlayGfx, py.x, py.y, pyRingR, spinA, spinA + Math.PI * 1.35, { color: 0x38bdf8, alpha: 0.85, width: 2.2 });

                    if (py.hp != null && py.maxHp > 0) {
                        const bw = 28;
                        const pct = Math.max(0, Math.min(1, py.hp / py.maxHp));
                        this.overlayGfx.rect(py.x - bw * 0.5, py.y - pyRingR - 9, bw, 3.5).fill({ color: 0x0f172a, alpha: 0.85 });
                        this.overlayGfx.rect(py.x - bw * 0.5, py.y - pyRingR - 9, bw * pct, 3.5).fill({ color: 0x38bdf8, alpha: 0.95 });
                    }
                }

                if (activePylonCount > 0) {
                    const shR = (b.r || 64) + 15;
                    const rotBase = nowT * 1.4;
                    this._strokeArcPixi(this.overlayGfx, b.x, b.y, shR, rotBase, rotBase + Math.PI * 0.85, { color: 0x38bdf8, alpha: 0.75, width: 3 });
                    this._strokeArcPixi(this.overlayGfx, b.x, b.y, shR, rotBase + Math.PI, rotBase + Math.PI * 1.85, { color: 0x38bdf8, alpha: 0.75, width: 3 });
                }

                // Telegraph ring if boss is charging dash/nova
                if (b.telegraphRadius > 0) {
                    this.teleGfx.circle(b.x, b.y, b.telegraphRadius).fill({ color: 0xfb7185, alpha: 0.12 });
                    this.teleGfx.circle(b.x, b.y, b.telegraphRadius).stroke({ color: 0xfb7185, alpha: 0.85, width: 3 });
                }
                if (b.telegraphLine && this._isValidLine(b.x, b.y, b.telegraphLine.x, b.telegraphLine.y)) {
                    this.teleGfx.beginPath();
                    this.teleGfx.moveTo(b.x, b.y).lineTo(b.telegraphLine.x, b.telegraphLine.y).stroke({ color: 0xfb7185, alpha: 0.72, width: 6 });
                }

                // Rear Weakspot arc indicator on Behemoth (x2.2 Crit zone)
                if (b.hasWeakspot) {
                    const rearAng = (b.angle || 0) + Math.PI;
                    this._strokeArcPixi(this.overlayGfx, b.x, b.y, (b.r || 64) + 10, rearAng - 0.55, rearAng + 0.55, { color: 0x38bdf8, alpha: 0.85, width: 4 });
                }
            }

            // Player Ship (with Skin Tint!)
            if (p) {
                const shipTex = this.textures[`ship_${p.shipId || 'interceptor'}`] || this.textures.ship_interceptor;
                if (shipTex && this.playerSprite.texture !== shipTex) this.playerSprite.texture = shipTex;
                this.playerSprite.position.set(p.x, p.y);
                const aim = p.aimAngle != null ? p.aimAngle : 0;
                this.playerSprite.rotation = aim + Math.PI / 2;
                const dim = Math.max(64, shipTex ? shipTex.width : 256);
                this.playerSprite.scale.set(52 / dim);
                this.playerSprite.tint = p.skinTint != null ? parseColorHex(p.skinTint) : 0xffffff;
                this.playerSprite.alpha = p.cloaked ? 0.38 : (p.invuln > 0 ? (Math.sin(nowT * 28) > 0 ? 0.5 : 1) : 1);

                // Directional thruster flame behind ship when moving
                const moving = Math.hypot(p.vx || 0, p.vy || 0) > 15;
                this.exhaustSprite.visible = moving && !p.cloaked;
                if (this.exhaustSprite.visible) {
                    const backX = p.x - Math.cos(aim) * 23;
                    const backY = p.y - Math.sin(aim) * 23;
                    this.exhaustSprite.position.set(backX, backY);
                    this.exhaustSprite.rotation = aim + Math.PI / 2;
                    this.exhaustSprite.scale.set(0.34, 0.35 + Math.random() * 0.22);
                    this.exhaustSprite.alpha = 0.78 * glowAlphaMult;
                }

                // Crisp 10px center precision hurtbox dot
                this.overlayGfx.circle(p.x, p.y, 4.5).fill({ color: 0xffffff, alpha: 0.92 });
                this.overlayGfx.circle(p.x, p.y, 11).stroke({ color: 0x38bdf8, alpha: 0.32, width: 1.5 });
            }

            // Orbital Drones & Energy Discs
            const orbitals = state.orbitals || [];
            for (let i = 0; i < orbitals.length; i++) {
                const orb = orbitals[i];
                const col = parseColorHex(orb.color);
                if (orb.kind === 'disc') {
                    this.overlayGfx.circle(orb.x, orb.y, orb.r).fill({ color: col, alpha: 0.22 });
                    this.overlayGfx.circle(orb.x, orb.y, orb.r).stroke({ color: col, alpha: 0.92, width: 3 });
                } else {
                    const sp = this.bulletPool.acquire(this.textures.fx_flare);
                    sp.position.set(orb.x, orb.y);
                    sp.tint = col;
                    sp.scale.set(0.28);
                    sp.blendMode = 'add';
                }
            }

            // Lightning Arcs / Railgun Beams
            const arcs = state.arcs || [];
            for (let i = 0; i < arcs.length; i++) {
                const a = arcs[i];
                if (!this._isValidLine(a.x1, a.y1, a.x2, a.y2)) continue;
                const col = parseColorHex(a.color);
                this.teleGfx.beginPath();
                this.teleGfx.moveTo(a.x1, a.y1).lineTo(a.x2, a.y2).stroke({ color: col, alpha: Math.min(1, a.alpha) * glowAlphaMult, width: a.width || 3 });
            }

            // Projectiles (High Contrast)
            const bullets = state.bullets || [];
            for (let i = 0; i < bullets.length; i++) {
                const b = bullets[i];
                if (Math.abs(b.x - this.camX) > this.screenW * 0.65 || Math.abs(b.y - this.camY) > this.screenH * 0.65) continue;
                let tex = this.textures.fx_player_orb;
                if (b.isEnemy) tex = this.textures.fx_enemy_orb;
                else if (b.sprite === 'missile') tex = this.textures.fx_missile_player;
                else if (b.sprite === 'laser') tex = this.textures.fx_laser_cyan;

                const sp = this.bulletPool.acquire(tex);
                sp.position.set(b.x, b.y);
                sp.rotation = Math.atan2(b.vy || 0, b.vx || 1) + Math.PI / 2;
                const sz = (b.r || 6) * (b.isEnemy ? 2.6 : 2.3);
                sp.scale.set(sz / Math.max(16, tex ? tex.width : 64));
                if (!b.isEnemy && b.color) {
                    sp.tint = parseColorHex(b.color);
                }
            }

            // Particles
            const particles = state.particles || [];
            for (let i = 0; i < particles.length; i++) {
                const pt = particles[i];
                if (Math.abs(pt.x - this.camX) > this.screenW * 0.65 || Math.abs(pt.y - this.camY) > this.screenH * 0.65) continue;
                const sp = this.fxPool.acquire(pt.ring ? this.textures.fx_ring : this.textures.fx_glow_soft);
                sp.position.set(pt.x, pt.y);
                const lifePct = Math.max(0, pt.life / (pt.maxLife || 0.4));
                sp.alpha = lifePct * glowAlphaMult;
                sp.tint = parseColorHex(pt.color);
                sp.scale.set(((pt.r || 4) * 2.5) / 128);
                if (!isCalm) sp.blendMode = 'add';
            }

            // Floating Damage Numbers
            if (this.showDmgNumbers) {
                const floats = state.floatTexts || [];
                for (let i = 0; i < floats.length; i++) {
                    const ft = floats[i];
                    const t = this._acquireText();
                    t.text = ft.text;
                    t.position.set(ft.x, ft.y);
                    t.style.fill = ft.color || '#f8fafc';
                    t.style.fontSize = ft.crit ? 18 : 13;
                    t.alpha = Math.max(0, Math.min(1, ft.life * 2));
                }
            }

            this.pickupPool.endFrame();
            this.propPool.endFrame();
            this.obstaclePool.endFrame();
            this.enemyPool.endFrame();
            this.bossPool.endFrame();
            this.bulletPool.endFrame();
            this.fxPool.endFrame();
            for (let i = this.textActive; i < this.textPool.length; i++) {
                this.textPool[i].visible = false;
            }

            this.app.renderer.render(this.app.stage);
        }

        _renderCanvas2D(state) {
            const ctx = this.ctx2d;
            if (!ctx) return;
            const W = this.screenW;
            const H = this.screenH;
            const worldW = state.worldW || 5600;
            const worldH = state.worldH || 5600;
            const isCalm = this.vfxMode === 'calm';
            const nowT = state.time || 0;

            ctx.fillStyle = '#050811';
            ctx.fillRect(0, 0, W, H);

            const camLeft = this.camX - W * 0.5 + this.shakeX;
            const camTop = this.camY - H * 0.5 + this.shakeY;
            const mapState = state.mapState;
            const sx = mapState ? mapState.streamOffsetX : 0;
            const sy = mapState ? mapState.streamOffsetY : 0;

            // Tiled dark-space backdrop
            const bgImg = this.htmlImages[`bg_${this.curMapId}`];
            if (bgImg && bgImg.complete) {
                const tw = 1920;
                const th = 1080;
                const ox = -(((camLeft * 0.36 + sx) % tw) + tw) % tw;
                const oy = -(((camTop * 0.36 + sy) % th) + th) % th;
                ctx.save();
                ctx.globalAlpha = isCalm ? 0.72 : 0.88;
                for (let x = ox; x < W; x += tw) {
                    for (let y = oy; y < H; y += th) {
                        ctx.drawImage(bgImg, x, y, tw, th);
                    }
                }
                ctx.restore();
            }

            ctx.save();
            ctx.translate(-camLeft, -camTop);

            // Arena Perimeter Forcefield
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
            ctx.lineWidth = 4;
            ctx.strokeRect(0, 0, worldW, worldH);
            ctx.strokeStyle = 'rgba(251, 113, 133, 0.28)';
            ctx.lineWidth = 2;
            ctx.strokeRect(16, 16, worldW - 32, worldH - 32);

            // Map Zones, Obstacles, Meteors, Beams, Objectives
            if (mapState) {
                for (const c of mapState.currents || []) {
                    if (this._arc2D(ctx, c.x, c.y, c.r, 0, Math.PI * 2)) {
                        ctx.fillStyle = c.kind === 'boost' ? 'rgba(56,189,248,0.10)' : 'rgba(251,113,133,0.10)';
                        ctx.fill();
                        ctx.strokeStyle = c.kind === 'boost' ? 'rgba(56,189,248,0.35)' : 'rgba(251,113,133,0.40)';
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    }
                }
                if (mapState.mapId === 'blackhole' && mapState.blackHoleCore) {
                    const bh = mapState.blackHoleCore;
                    if (this._arc2D(ctx, bh.x, bh.y, bh.r * 1.15, 0, Math.PI * 2)) {
                        ctx.strokeStyle = '#fb923c';
                        ctx.lineWidth = 4;
                        ctx.stroke();
                    }
                    if (this._arc2D(ctx, bh.x, bh.y, bh.r * 0.72, 0, Math.PI * 2)) {
                        ctx.fillStyle = '#020409';
                        ctx.fill();
                    }
                }

                // Obstacles
                for (const o of mapState.obstacles || []) {
                    if (Math.abs(o.x - this.camX) > W * 0.75 + (o.auraR || o.r || 140) || Math.abs(o.y - this.camY) > H * 0.75 + (o.auraR || o.r || 140)) continue;
                    if (o.kind === 'vault_bunker') {
                        const capR = o.captureR || 195;
                        const pct = o.captured ? 1 : Math.min(1, (o.progress || 0) / (o.maxProgress || 4));
                        if (this._arc2D(ctx, o.x, o.y, capR, 0, Math.PI * 2)) {
                            ctx.fillStyle = o.captured ? 'rgba(52,211,153,0.05)' : 'rgba(251,191,36,0.08)';
                            ctx.fill();
                            ctx.strokeStyle = o.captured ? 'rgba(52,211,153,0.3)' : 'rgba(251,191,36,0.55)';
                            ctx.lineWidth = 2;
                            ctx.stroke();
                        }
                        if (!o.captured && pct > 0.01 && this._arc2D(ctx, o.x, o.y, capR - 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct)) {
                            ctx.strokeStyle = '#fde047';
                            ctx.lineWidth = 4;
                            ctx.stroke();
                        }
                    } else if (o.kind === 'reactor_core') {
                        const auraR = o.auraR || 235;
                        if (this._arc2D(ctx, o.x, o.y, auraR, 0, Math.PI * 2)) {
                            ctx.fillStyle = o.mode === 'overdrive' ? 'rgba(34,211,238,0.06)' : 'rgba(249,115,22,0.05)';
                            ctx.fill();
                            ctx.strokeStyle = o.mode === 'overdrive' ? 'rgba(34,211,238,0.35)' : 'rgba(251,146,60,0.35)';
                            ctx.lineWidth = 2;
                            ctx.stroke();
                        }
                    }
                    const img = this.htmlImages[o.sprite] || this.htmlImages[`obs_${o.kind}`];
                    if (img) {
                        ctx.save();
                        ctx.translate(o.x, o.y);
                        ctx.rotate(o.rotation || 0);
                        const dw = o.shape === 'rect' ? o.w * 1.04 : o.r * 2.08;
                        const dh = o.shape === 'rect' ? o.h * 1.06 : o.r * 2.08;
                        ctx.drawImage(img, -dw * 0.5, -dh * 0.5, dw, dh);
                        ctx.restore();
                    }
                }

                for (const d of mapState.debris || []) {
                    const img = this.htmlImages[`prop_${d.sprite}`];
                    if (img) {
                        ctx.save();
                        ctx.translate(d.x, d.y);
                        ctx.rotate(d.angle);
                        ctx.drawImage(img, -d.r, -d.r, d.r * 2, d.r * 2);
                        ctx.restore();
                    }
                }
                for (const o of mapState.objectives || []) {
                    if (o.kind === 'pylon') {
                        const pct = Math.min(1, o.progress / o.maxProgress);
                        if (this._arc2D(ctx, o.x, o.y, o.r, 0, Math.PI * 2)) {
                            ctx.fillStyle = 'rgba(56,189,248,0.08)';
                            ctx.fill();
                            ctx.strokeStyle = pct > 0 ? '#34d399' : '#38bdf8';
                            ctx.lineWidth = 2;
                            ctx.stroke();
                        }
                        if (pct > 0.01 && this._arc2D(ctx, o.x, o.y, o.r - 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct)) {
                            ctx.strokeStyle = '#34d399';
                            ctx.lineWidth = 4;
                            ctx.stroke();
                        }
                    }
                    const img = this.htmlImages[`prop_${o.sprite}`];
                    if (img) {
                        ctx.save();
                        ctx.translate(o.x, o.y);
                        ctx.rotate(o.rot);
                        ctx.drawImage(img, -36, -36, 72, 72);
                        ctx.restore();
                    }
                }
                for (const m of mapState.meteors || []) {
                    if (this._arc2D(ctx, m.x, m.y, m.r, 0, Math.PI * 2)) {
                        ctx.fillStyle = m.impacted ? 'rgba(249,115,22,0.28)' : 'rgba(251,113,133,0.14)';
                        ctx.fill();
                        ctx.strokeStyle = '#fb7185';
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    }
                }
                for (const b of mapState.beams || []) {
                    const x2 = b.ox + Math.cos(b.angle) * b.length;
                    const y2 = b.oy + Math.sin(b.angle) * b.length;
                    if (!this._isValidLine(b.ox, b.oy, x2, y2)) continue;
                    ctx.beginPath();
                    ctx.moveTo(b.ox, b.oy);
                    ctx.lineTo(x2, y2);
                    ctx.strokeStyle = b.warmup > 0 ? 'rgba(251,113,133,0.5)' : '#f97316';
                    ctx.lineWidth = b.warmup > 0 ? 4 : b.width;
                    ctx.stroke();
                }
            }

            for (const c of state.crystals || []) {
                const img = this.htmlImages.prop_xp_crystal;
                if (img) ctx.drawImage(img, c.x - 11, c.y - 11, 22, 22);
            }
            for (const ch of state.chests || []) {
                const img = this.htmlImages.prop_chest;
                if (img) ctx.drawImage(img, ch.x - 24, ch.y - 24, 48, 48);
            }
            for (const pk of state.pickups || []) {
                const img = this.htmlImages[pk.kind === 'shield' ? 'prop_shield_orb' : 'prop_heal_orb'];
                if (img) ctx.drawImage(img, pk.x - 14, pk.y - 14, 28, 28);
            }

            for (const en of state.enemies || []) {
                const img = this.htmlImages[`enemy_${en.spriteKey || 'swarmer'}`] || this.htmlImages.enemy_swarmer;
                if (img) {
                    ctx.save();
                    ctx.translate(en.x, en.y);
                    ctx.rotate((en.angle || 0) + Math.PI / 2);
                    ctx.globalAlpha = en.stealthAlpha != null ? en.stealthAlpha : 1;
                    const s = (en.r || 16) * 2.55;
                    ctx.drawImage(img, -s * 0.5, -s * 0.5, s, s);
                    ctx.restore();
                }
                if (en.telegraphTarget && this._isValidLine(en.x, en.y, en.telegraphTarget.x, en.telegraphTarget.y)) {
                    ctx.beginPath();
                    ctx.moveTo(en.x, en.y);
                    ctx.lineTo(en.telegraphTarget.x, en.telegraphTarget.y);
                    ctx.strokeStyle = 'rgba(253, 164, 175, 0.72)';
                    ctx.lineWidth = 1.6;
                    ctx.stroke();
                }
            }

            for (const b of state.bosses || []) {
                const img = this.htmlImages[`boss_${b.spriteKey || 'behemoth'}`] || this.htmlImages.boss_behemoth;
                if (img) {
                    ctx.save();
                    ctx.translate(b.x, b.y);
                    ctx.rotate((b.angle || 0) + Math.PI / 2);
                    const s = (b.r || 64) * 2.45;
                    ctx.drawImage(img, -s * 0.5, -s * 0.5, s, s);
                    ctx.restore();
                }
                const pylons = Array.isArray(b.shieldPylons) ? b.shieldPylons : [];
                for (const py of pylons) {
                    if (!py || py.alive === false || (py.hp != null && py.hp <= 0)) continue;
                    if (this._isValidLine(b.x, b.y, py.x, py.y)) {
                        ctx.beginPath();
                        ctx.moveTo(b.x, b.y);
                        ctx.lineTo(py.x, py.y);
                        ctx.strokeStyle = 'rgba(56, 189, 248, 0.42)';
                        ctx.lineWidth = 2.5;
                        ctx.stroke();
                    }
                    if (this._arc2D(ctx, py.x, py.y, (py.r || 18) + 4, 0, Math.PI * 2)) {
                        ctx.strokeStyle = '#38bdf8';
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    }
                }
                if (b.hasWeakspot) {
                    const rearAng = (b.angle || 0) + Math.PI;
                    if (this._arc2D(ctx, b.x, b.y, (b.r || 64) + 10, rearAng - 0.55, rearAng + 0.55)) {
                        ctx.strokeStyle = '#38bdf8';
                        ctx.lineWidth = 4;
                        ctx.stroke();
                    }
                }
            }

            for (const z of state.floorZones || []) {
                if (this._arc2D(ctx, z.x, z.y, z.r, 0, Math.PI * 2)) {
                    ctx.fillStyle = z.color || 'rgba(56,189,248,0.16)';
                    ctx.globalAlpha = 0.20 * Math.min(1, z.life);
                    ctx.fill();
                    ctx.globalAlpha = 1;
                }
            }

            const p = state.player;
            if (p) {
                if (p.solarAuraRadius > 0 && this._arc2D(ctx, p.x, p.y, p.solarAuraRadius, 0, Math.PI * 2)) {
                    ctx.fillStyle = 'rgba(249,115,22,0.08)';
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(249,115,22,0.28)';
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                }
                const img = this.htmlImages[`ship_${p.shipId || 'interceptor'}`] || this.htmlImages.ship_interceptor;
                if (img) {
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate((p.aimAngle || 0) + Math.PI / 2);
                    ctx.globalAlpha = p.cloaked ? 0.38 : 1;
                    ctx.drawImage(img, -26, -26, 52, 52);
                    ctx.restore();
                }
                if (p.sh > 1 && this._arc2D(ctx, p.x, p.y, 26, 0, Math.PI * 2)) {
                    ctx.strokeStyle = 'rgba(56,189,248,0.35)';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
                if (this._arc2D(ctx, p.x, p.y, 4.5, 0, Math.PI * 2)) {
                    ctx.fillStyle = '#ffffff';
                    ctx.fill();
                }
            }

            for (const orb of state.orbitals || []) {
                if (this._arc2D(ctx, orb.x, orb.y, orb.r || 9, 0, Math.PI * 2)) {
                    ctx.fillStyle = orb.color || '#38bdf8';
                    ctx.globalAlpha = 0.45;
                    ctx.fill();
                    ctx.globalAlpha = 1;
                    ctx.strokeStyle = orb.color || '#38bdf8';
                    ctx.lineWidth = 2.5;
                    ctx.stroke();
                }
            }

            for (const a of state.arcs || []) {
                if (!this._isValidLine(a.x1, a.y1, a.x2, a.y2)) continue;
                ctx.beginPath();
                ctx.moveTo(a.x1, a.y1);
                ctx.lineTo(a.x2, a.y2);
                ctx.strokeStyle = a.color || '#38bdf8';
                ctx.globalAlpha = Math.min(1, a.alpha);
                ctx.lineWidth = a.width || 3;
                ctx.stroke();
                ctx.globalAlpha = 1;
            }

            for (const b of state.bullets || []) {
                const img = this.htmlImages[b.isEnemy ? 'fx_enemy_orb' : 'fx_player_orb'];
                if (img) {
                    const sz = (b.r || 6) * 2.4;
                    ctx.drawImage(img, b.x - sz * 0.5, b.y - sz * 0.5, sz, sz);
                }
            }

            for (const pt of state.particles || []) {
                if (this._arc2D(ctx, pt.x, pt.y, pt.r || 3, 0, Math.PI * 2)) {
                    ctx.fillStyle = pt.color || '#38bdf8';
                    ctx.globalAlpha = Math.max(0, pt.life / (pt.maxLife || 0.4)) * (isCalm ? 0.45 : 0.85);
                    ctx.fill();
                    ctx.globalAlpha = 1;
                }
            }

            if (this.showDmgNumbers) {
                ctx.font = '700 13px "JetBrains Mono", monospace';
                ctx.textAlign = 'center';
                for (const ft of state.floatTexts || []) {
                    ctx.fillStyle = ft.color || '#f8fafc';
                    ctx.fillText(ft.text, ft.x, ft.y);
                }
            }

            ctx.restore();
        }

        /**
         * Renders the Tactical Sector Radar (~150x150px) onto #hudMinimapCanvas.
         */
        renderMinimap(canvasEl, state) {
            if (!canvasEl || !state) return;
            const ctx = canvasEl.getContext && canvasEl.getContext('2d');
            if (!ctx) return;

            const cssW = canvasEl.clientWidth || parseInt(canvasEl.getAttribute('width'), 10) || 150;
            const cssH = canvasEl.clientHeight || parseInt(canvasEl.getAttribute('height'), 10) || 150;
            const dpr = Math.min(2, global.devicePixelRatio || 1);
            const targetW = Math.round(cssW * dpr);
            const targetH = Math.round(cssH * dpr);
            if (canvasEl.width !== targetW || canvasEl.height !== targetH) {
                canvasEl.width = targetW;
                canvasEl.height = targetH;
            }
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const pad = 6;
            const innerW = Math.max(20, cssW - pad * 2);
            const innerH = Math.max(20, cssH - pad * 2);
            const worldW = state.worldW || 5600;
            const worldH = state.worldH || 5600;
            const scaleX = innerW / worldW;
            const scaleY = innerH / worldH;
            const toX = (wx) => pad + wx * scaleX;
            const toY = (wy) => pad + wy * scaleY;

            // Deep slate background
            ctx.clearRect(0, 0, cssW, cssH);
            ctx.fillStyle = 'rgba(7, 11, 18, 0.86)';
            ctx.fillRect(0, 0, cssW, cssH);

            // Grid crosshairs
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let g = 1; g < 4; g++) {
                const gx = pad + innerW * (g / 4);
                const gy = pad + innerH * (g / 4);
                ctx.moveTo(gx, pad);
                ctx.lineTo(gx, pad + innerH);
                ctx.moveTo(pad, gy);
                ctx.lineTo(pad + innerW, gy);
            }
            ctx.stroke();

            // Emphasized center crosshair
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
            ctx.beginPath();
            ctx.moveTo(pad + innerW * 0.5, pad);
            ctx.lineTo(pad + innerW * 0.5, pad + innerH);
            ctx.moveTo(pad, pad + innerH * 0.5);
            ctx.lineTo(pad + innerW, pad + innerH * 0.5);
            ctx.stroke();

            // World boundary box
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.42)';
            ctx.lineWidth = 1;
            ctx.strokeRect(pad, pad, innerW, innerH);

            const mapState = state.mapState;
            const drawDiamond = (cx, cy, r, fill, stroke) => {
                ctx.beginPath();
                ctx.moveTo(cx, cy - r);
                ctx.lineTo(cx + r, cy);
                ctx.lineTo(cx, cy + r);
                ctx.lineTo(cx - r, cy);
                ctx.closePath();
                if (fill) { ctx.fillStyle = fill; ctx.fill(); }
                if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
            };

            if (mapState) {
                // Black Hole singularity marker
                if (mapState.mapId === 'blackhole' && mapState.blackHoleCore) {
                    const bh = mapState.blackHoleCore;
                    if (this._arc2D(ctx, toX(bh.x), toY(bh.y), Math.max(3, bh.r * scaleX), 0, Math.PI * 2)) {
                        ctx.fillStyle = '#020409';
                        ctx.fill();
                        ctx.strokeStyle = '#fb923c';
                        ctx.lineWidth = 1.2;
                        ctx.stroke();
                    }
                }

                // Obstacles (dark gray rectangles & circles) + Reactor/Vault POIs
                const obstacles = mapState.obstacles || [];
                for (let i = 0; i < obstacles.length; i++) {
                    const o = obstacles[i];
                    const ox = toX(o.x);
                    const oy = toY(o.y);
                    if (o.shape === 'rect') {
                        const rw = Math.max(2.5, o.w * scaleX);
                        const rh = Math.max(2.5, o.h * scaleY);
                        ctx.fillStyle = 'rgba(71, 85, 105, 0.88)';
                        ctx.fillRect(ox - rw * 0.5, oy - rh * 0.5, rw, rh);
                    } else {
                        const rr = Math.max(2, o.r * scaleX);
                        if (this._arc2D(ctx, ox, oy, rr, 0, Math.PI * 2)) {
                            ctx.fillStyle = 'rgba(71, 85, 105, 0.88)';
                            ctx.fill();
                        }
                    }

                    if (o.kind === 'vault_bunker') {
                        drawDiamond(ox, oy, o.captured ? 2.6 : 4.2, o.captured ? '#34d399' : '#fbbf24', o.captured ? null : '#fef08a');
                    } else if (o.kind === 'reactor_core') {
                        if (this._arc2D(ctx, ox, oy, 1.8, 0, Math.PI * 2)) {
                            ctx.fillStyle = o.mode === 'overdrive' ? '#22d3ee' : '#fb923c';
                            ctx.fill();
                        }
                    }
                }

                // Pylon / Cargo POIs (cyan / amber diamond pips)
                const objectives = mapState.objectives || [];
                for (let i = 0; i < objectives.length; i++) {
                    const obj = objectives[i];
                    const ox = toX(obj.x);
                    const oy = toY(obj.y);
                    if (obj.kind === 'pylon') {
                        drawDiamond(ox, oy, 4.0, '#38bdf8', '#e0f2fe');
                    } else {
                        drawDiamond(ox, oy, 3.6, '#f59e0b', '#fef3c7');
                    }
                }
            }

            // Enemies (dim coral dots, larger orange pips for Elites)
            const enemies = state.enemies || [];
            for (let i = 0; i < enemies.length; i++) {
                const en = enemies[i];
                const ex = toX(en.x);
                const ey = toY(en.y);
                const r = en.isElite ? 2.4 : 1.3;
                if (this._arc2D(ctx, ex, ey, r, 0, Math.PI * 2)) {
                    ctx.fillStyle = en.isElite ? '#fb923c' : 'rgba(251, 113, 133, 0.55)';
                    ctx.fill();
                }
            }

            // Bosses (bright pulsing crimson diamond)
            const bosses = state.bosses || [];
            const pulseR = 4.6 + Math.sin((state.time || 0) * 6) * 1.1;
            for (let i = 0; i < bosses.length; i++) {
                const b = bosses[i];
                drawDiamond(toX(b.x), toY(b.y), pulseR, '#ef4444', '#fecdd3');
            }

            // Camera viewport rectangle
            const camX = state.camX != null ? state.camX : (state.player ? state.player.x : worldW * 0.5);
            const camY = state.camY != null ? state.camY : (state.player ? state.player.y : worldH * 0.5);
            const vw = this.screenW * scaleX;
            const vh = this.screenH * scaleY;
            const vx = Math.max(pad, Math.min(pad + innerW - vw, toX(camX) - vw * 0.5));
            const vy = Math.max(pad, Math.min(pad + innerH - vh, toY(camY) - vh * 0.5));
            ctx.strokeStyle = 'rgba(226, 232, 240, 0.42)';
            ctx.lineWidth = 1;
            ctx.strokeRect(vx, vy, Math.min(innerW, vw), Math.min(innerH, vh));

            // Player directional chevron
            const p = state.player;
            if (p) {
                const px = toX(p.x);
                const py = toY(p.y);
                const ang = p.aimAngle != null ? p.aimAngle : 0;
                ctx.save();
                ctx.translate(px, py);
                ctx.rotate(ang);
                ctx.beginPath();
                ctx.moveTo(5.5, 0);
                ctx.lineTo(-4, -3.8);
                ctx.lineTo(-2.2, 0);
                ctx.lineTo(-4, 3.8);
                ctx.closePath();
                ctx.fillStyle = '#38bdf8';
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.restore();
            }
        }
    }

    global.CosmicRenderer = new CosmicRenderer();
})(typeof window !== 'undefined' ? window : globalThis);
