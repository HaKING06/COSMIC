/**
 * COSMIC SURVIVORS v9.0 — Hardware-Accelerated PixiJS v8 Renderer (with clean Canvas2D fallback)
 * Renders multi-layer scrolling parallax backdrops, CC0 PNG ships/enemies/bosses/props,
 * high-contrast telegraphs, controllable VFX intensity (Normal vs Calm Anti-Eye-Strain),
 * and pooled projectiles/particles at locked high framerates.
 */
(function (global) {
    'use strict';

    const SHIP_IDS = ['interceptor', 'dreadnought', 'aegis', 'phantom', 'solarflare', 'tempest', 'valkyrie', 'chronos'];
    const ENEMY_IDS = ['swarmer', 'kamikaze', 'shooter', 'phantom', 'tank', 'splitter', 'sniper', 'queen'];
    const BOSS_IDS = ['behemoth', 'leviathan', 'hivemind', 'chronovore', 'seraphim'];
    const PROP_IDS = ['debris_1', 'debris_2', 'debris_3', 'meteor_1', 'meteor_2', 'lava_meteor', 'pylon_beacon', 'cargo_pod', 'chest', 'xp_crystal', 'heal_orb', 'shield_orb'];
    const FX_IDS = ['glow_soft', 'flare', 'ring', 'spark', 'magic', 'smoke', 'slash', 'laser_cyan', 'laser_red', 'missile_player', 'exhaust_flame', 'enemy_orb', 'player_orb'];
    const MAP_IDS = ['sector9', 'nebula', 'blackhole', 'dyson'];

    function parseColorHex(hex) {
        if (typeof hex === 'number') return hex;
        if (!hex || typeof hex !== 'string') return 0x38bdf8;
        const clean = hex.replace('#', '').slice(0, 6);
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
            this.bgTiling = null;
            this.gridGfx = null;
            this.zoneGfx = null;
            this.floorGfx = null;
            this.teleGfx = null;
            this.overlayGfx = null;

            this.propPool = null;
            this.pickupPool = null;
            this.enemyPool = null;
            this.bossPool = null;
            this.bulletPool = null;
            this.fxPool = null;
            this.playerSprite = null;
            this.exhaustSprite = null;
            this.textPool = [];
            this.textActive = 0;

            this.screenW = 1280;
            this.screenH = 720;
            this.camX = 2100;
            this.camY = 1600;
            this.shakeX = 0;
            this.shakeY = 0;
            this.curMapId = 'sector9';
        }

        _assetManifest() {
            const items = [];
            SHIP_IDS.forEach(id => items.push([`ship_${id}`, `assets/ships/${id}.png`]));
            ENEMY_IDS.forEach(id => items.push([`enemy_${id}`, `assets/enemies/${id}.png`]));
            BOSS_IDS.forEach(id => items.push([`boss_${id}`, `assets/bosses/${id}.png`]));
            PROP_IDS.forEach(id => items.push([`prop_${id}`, `assets/sprites/props/${id}.png`]));
            FX_IDS.forEach(id => items.push([`fx_${id}`, `assets/sprites/fx/${id}.png`]));
            MAP_IDS.forEach(id => items.push([`bg_${id}`, `assets/backdrops/${id}.jpg`]));
            return items;
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
            this.enemyContainer = new global.PIXI.Container();
            this.bossContainer = new global.PIXI.Container();
            this.playerContainer = new global.PIXI.Container();
            this.bulletContainer = new global.PIXI.Container();
            this.fxContainer = new global.PIXI.Container();

            this.worldLayer.addChild(this.pickupContainer);
            this.worldLayer.addChild(this.propContainer);
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
            if (!this.ready) return;
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

        _renderPixi(state) {
            const camLeft = this.camX - this.screenW * 0.5 + this.shakeX;
            const camTop = this.camY - this.screenH * 0.5 + this.shakeY;
            const viewMargin = 220;
            const isCalm = this.vfxMode === 'calm';
            const glowAlphaMult = isCalm ? 0.42 : 0.85;

            const mapState = state.mapState;
            const sx = mapState ? mapState.streamOffsetX : 0;
            const sy = mapState ? mapState.streamOffsetY : 0;

            // Parallax seamless tiling backdrop
            if (this.bgTiling) {
                this.bgTiling.tilePosition.x = -(camLeft * 0.36 + sx);
                this.bgTiling.tilePosition.y = -(camTop * 0.36 + sy);
                this.bgTiling.alpha = isCalm ? 0.72 : 0.88;
            }

            this.worldLayer.position.set(-camLeft, -camTop);
            this.hudWorldLayer.position.set(-camLeft, -camTop);

            this.gridGfx.clear();
            this.zoneGfx.clear();
            this.floorGfx.clear();
            this.teleGfx.clear();
            this.overlayGfx.clear();

            // Subtle tactical arena border & calm sector coordinate lines
            const W = state.worldW;
            const H = state.worldH;
            this.gridGfx.rect(0, 0, W, H).stroke({ color: 0x38bdf8, alpha: 0.25, width: 3 });

            // Dynamic Sector Zones (Nebula currents, Blackhole singularity, Meteor telegraphs, Pylons, Dyson beams)
            if (mapState) {
                // Nebula boost/EMP currents
                for (let i = 0; i < mapState.currents.length; i++) {
                    const c = mapState.currents[i];
                    const isBoost = c.kind === 'boost';
                    const col = isBoost ? 0x38bdf8 : 0xfb7185;
                    const pulse = 0.08 + Math.sin(mapState.time * 2.2 + c.pulsePhase) * 0.03;
                    this.zoneGfx.circle(c.x, c.y, c.r).fill({ color: col, alpha: pulse * (isCalm ? 0.65 : 1) });
                    this.zoneGfx.circle(c.x, c.y, c.r).stroke({ color: col, alpha: 0.35, width: 2 });
                }

                // Black hole moving singularity
                if (mapState.mapId === 'blackhole' && mapState.blackHoleCore) {
                    const bh = mapState.blackHoleCore;
                    this.zoneGfx.circle(bh.x, bh.y, bh.r * 2.1).fill({ color: 0xf97316, alpha: 0.09 });
                    this.zoneGfx.circle(bh.x, bh.y, bh.r * 1.15).stroke({ color: 0xfb923c, alpha: 0.55, width: 4 });
                    this.zoneGfx.circle(bh.x, bh.y, bh.r * 0.72).fill({ color: 0x020409, alpha: 0.96 });
                }

                // Telegraphed Meteors (shrinking hazard ring)
                for (let i = 0; i < mapState.meteors.length; i++) {
                    const m = mapState.meteors[i];
                    if (!m.impacted) {
                        const prog = 1 - Math.max(0, m.delay / m.maxDelay);
                        this.teleGfx.circle(m.x, m.y, m.r).fill({ color: 0xf97316, alpha: 0.09 + prog * 0.14 });
                        this.teleGfx.circle(m.x, m.y, m.r).stroke({ color: 0xfb7185, alpha: 0.65, width: 2 });
                        this.teleGfx.circle(m.x, m.y, m.r * prog).stroke({ color: 0xfef08a, alpha: 0.85, width: 2 });
                    } else {
                        const fade = Math.max(0, m.afterglow / 0.45);
                        this.teleGfx.circle(m.x, m.y, m.r).fill({ color: 0xf97316, alpha: 0.28 * fade });
                    }
                }

                // Dyson Sweeping Beams
                for (let i = 0; i < mapState.beams.length; i++) {
                    const b = mapState.beams[i];
                    const x2 = b.ox + Math.cos(b.angle) * b.length;
                    const y2 = b.oy + Math.sin(b.angle) * b.length;
                    if (b.warmup > 0) {
                        const pulse = 0.35 + Math.sin(mapState.time * 16) * 0.25;
                        this.teleGfx.moveTo(b.ox, b.oy).lineTo(x2, y2).stroke({ color: 0xfb7185, alpha: pulse, width: 4 });
                    } else {
                        this.teleGfx.moveTo(b.ox, b.oy).lineTo(x2, y2).stroke({ color: 0xf97316, alpha: isCalm ? 0.45 : 0.75, width: b.width });
                        this.teleGfx.moveTo(b.ox, b.oy).lineTo(x2, y2).stroke({ color: 0xffffff, alpha: 0.9, width: Math.max(4, b.width * 0.26) });
                    }
                }

                // Overdrive Pylons capture rings
                for (let i = 0; i < mapState.objectives.length; i++) {
                    const o = mapState.objectives[i];
                    if (o.kind === 'pylon') {
                        const pct = Math.min(1, o.progress / o.maxProgress);
                        this.zoneGfx.circle(o.x, o.y, o.r).fill({ color: 0x38bdf8, alpha: 0.06 + pct * 0.12 });
                        this.zoneGfx.circle(o.x, o.y, o.r).stroke({ color: pct > 0 ? 0x34d399 : 0x38bdf8, alpha: 0.55, width: 2 });
                        if (pct > 0.01) {
                            this.zoneGfx.arc(o.x, o.y, o.r - 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct).stroke({ color: 0x34d399, alpha: 0.95, width: 5 });
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

            // Player Passive Radiation Auras & Orbital Energy Discs / Shield Ring
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

            // Pools Begin
            this.pickupPool.beginFrame();
            this.propPool.beginFrame();
            this.enemyPool.beginFrame();
            this.bossPool.beginFrame();
            this.bulletPool.beginFrame();
            this.fxPool.beginFrame();
            this.textActive = 0;

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
                sp.position.set(ch.x, ch.y + Math.sin((state.time || 0) * 3) * 3);
                sp.scale.set(0.54);
            }

            // Drifting Props & Live Map Objective Sprites
            if (mapState) {
                for (let i = 0; i < mapState.debris.length; i++) {
                    const d = mapState.debris[i];
                    if (Math.abs(d.x - this.camX) > this.screenW * 0.72 || Math.abs(d.y - this.camY) > this.screenH * 0.72) continue;
                    const tex = this.textures[`prop_${d.sprite}`];
                    if (!tex) continue;
                    const sp = this.propPool.acquire(tex);
                    sp.position.set(d.x, d.y);
                    sp.rotation = d.angle;
                    sp.scale.set((d.r * 2) / Math.max(32, tex.width));
                    sp.alpha = 0.88;
                }
                for (let i = 0; i < mapState.objectives.length; i++) {
                    const o = mapState.objectives[i];
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

                // Sniper telegraph sightline
                if (en.telegraphTarget) {
                    this.teleGfx.moveTo(en.x, en.y).lineTo(en.telegraphTarget.x, en.telegraphTarget.y).stroke({ color: 0xfb7185, alpha: 0.68, width: 2 });
                }

                // Thin HP bar only for elites or wounded enemies (reduces noise!)
                if (en.hp < en.maxHp || en.isElite) {
                    const bw = Math.max(24, en.r * 1.9);
                    const pct = Math.max(0, Math.min(1, en.hp / en.maxHp));
                    this.overlayGfx.rect(en.x - bw * 0.5, en.y - en.r - 12, bw, 4).fill({ color: 0x0f172a, alpha: 0.85 });
                    this.overlayGfx.rect(en.x - bw * 0.5, en.y - en.r - 12, bw * pct, 4).fill({ color: en.isElite ? 0xf59e0b : 0xfb7185, alpha: 0.95 });
                }
            }

            // Bosses
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

                // Telegraph ring if boss is charging dash/nova
                if (b.telegraphRadius > 0) {
                    this.teleGfx.circle(b.x, b.y, b.telegraphRadius).fill({ color: 0xfb7185, alpha: 0.12 });
                    this.teleGfx.circle(b.x, b.y, b.telegraphRadius).stroke({ color: 0xfb7185, alpha: 0.85, width: 3 });
                }
                if (b.telegraphLine) {
                    this.teleGfx.moveTo(b.x, b.y).lineTo(b.telegraphLine.x, b.telegraphLine.y).stroke({ color: 0xfb7185, alpha: 0.72, width: 6 });
                }
                // Rear Weakspot arc indicator on Behemoth (x2.2 Crit zone)
                if (b.hasWeakspot) {
                    const rearAng = (b.angle || 0) + Math.PI;
                    this.overlayGfx.arc(b.x, b.y, b.r + 10, rearAng - 0.55, rearAng + 0.55).stroke({ color: 0x38bdf8, alpha: 0.85, width: 4 });
                }
            }

            // Player Ship
            if (p) {
                const shipTex = this.textures[`ship_${p.shipId || 'interceptor'}`] || this.textures.ship_interceptor;
                if (shipTex && this.playerSprite.texture !== shipTex) this.playerSprite.texture = shipTex;
                this.playerSprite.position.set(p.x, p.y);
                const aim = p.aimAngle != null ? p.aimAngle : 0;
                this.playerSprite.rotation = aim + Math.PI / 2;
                const dim = Math.max(64, shipTex ? shipTex.width : 256);
                this.playerSprite.scale.set(52 / dim);
                this.playerSprite.alpha = p.cloaked ? 0.38 : (p.invuln > 0 ? (Math.sin((state.time || 0) * 28) > 0 ? 0.5 : 1) : 1);

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

                // Crisp 10px center precision hurtbox dot (essential bullet-hell clarity!)
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

            // Lightning Arcs / Railgun Beams (drawn in fx/tele layer)
            const arcs = state.arcs || [];
            for (let i = 0; i < arcs.length; i++) {
                const a = arcs[i];
                const col = parseColorHex(a.color);
                this.teleGfx.moveTo(a.x1, a.y1).lineTo(a.x2, a.y2).stroke({ color: col, alpha: Math.min(1, a.alpha) * glowAlphaMult, width: a.width || 3 });
            }

            // Projectiles (High Contrast!)
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
            const isCalm = this.vfxMode === 'calm';
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

            // Arena boundaries
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
            ctx.lineWidth = 3;
            ctx.strokeRect(0, 0, state.worldW, state.worldH);

            // Map Zones, Meteors, Beams, Objectives
            if (mapState) {
                for (const c of mapState.currents) {
                    ctx.beginPath();
                    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
                    ctx.fillStyle = c.kind === 'boost' ? 'rgba(56,189,248,0.10)' : 'rgba(251,113,133,0.10)';
                    ctx.fill();
                    ctx.strokeStyle = c.kind === 'boost' ? 'rgba(56,189,248,0.35)' : 'rgba(251,113,133,0.40)';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
                if (mapState.mapId === 'blackhole' && mapState.blackHoleCore) {
                    const bh = mapState.blackHoleCore;
                    ctx.beginPath();
                    ctx.arc(bh.x, bh.y, bh.r * 1.15, 0, Math.PI * 2);
                    ctx.strokeStyle = '#fb923c';
                    ctx.lineWidth = 4;
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.arc(bh.x, bh.y, bh.r * 0.72, 0, Math.PI * 2);
                    ctx.fillStyle = '#020409';
                    ctx.fill();
                }
                for (const d of mapState.debris) {
                    const img = this.htmlImages[`prop_${d.sprite}`];
                    if (img) {
                        ctx.save();
                        ctx.translate(d.x, d.y);
                        ctx.rotate(d.angle);
                        ctx.drawImage(img, -d.r, -d.r, d.r * 2, d.r * 2);
                        ctx.restore();
                    }
                }
                for (const o of mapState.objectives) {
                    if (o.kind === 'pylon') {
                        const pct = Math.min(1, o.progress / o.maxProgress);
                        ctx.beginPath();
                        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(56,189,248,0.08)';
                        ctx.fill();
                        ctx.strokeStyle = pct > 0 ? '#34d399' : '#38bdf8';
                        ctx.lineWidth = 2;
                        ctx.stroke();
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
                for (const m of mapState.meteors) {
                    ctx.beginPath();
                    ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
                    ctx.fillStyle = m.impacted ? 'rgba(249,115,22,0.28)' : 'rgba(251,113,133,0.14)';
                    ctx.fill();
                    ctx.strokeStyle = '#fb7185';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
                for (const b of mapState.beams) {
                    const x2 = b.ox + Math.cos(b.angle) * b.length;
                    const y2 = b.oy + Math.sin(b.angle) * b.length;
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
            }

            for (const z of state.floorZones || []) {
                ctx.beginPath();
                ctx.arc(z.x, z.y, z.r, 0, Math.PI * 2);
                ctx.fillStyle = z.color || 'rgba(56,189,248,0.16)';
                ctx.globalAlpha = 0.20 * Math.min(1, z.life);
                ctx.fill();
                ctx.globalAlpha = 1;
            }

            const p = state.player;
            if (p) {
                if (p.solarAuraRadius > 0) {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.solarAuraRadius, 0, Math.PI * 2);
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
                if (p.sh > 1) {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 26, 0, Math.PI * 2);
                    ctx.strokeStyle = 'rgba(56,189,248,0.35)';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
                ctx.beginPath();
                ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.fill();
            }

            for (const orb of state.orbitals || []) {
                ctx.beginPath();
                ctx.arc(orb.x, orb.y, orb.r || 9, 0, Math.PI * 2);
                ctx.fillStyle = orb.color || '#38bdf8';
                ctx.globalAlpha = 0.45;
                ctx.fill();
                ctx.globalAlpha = 1;
                ctx.strokeStyle = orb.color || '#38bdf8';
                ctx.lineWidth = 2.5;
                ctx.stroke();
            }

            for (const a of state.arcs || []) {
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
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, pt.r || 3, 0, Math.PI * 2);
                ctx.fillStyle = pt.color || '#38bdf8';
                ctx.globalAlpha = Math.max(0, pt.life / (pt.maxLife || 0.4)) * (isCalm ? 0.45 : 0.85);
                ctx.fill();
                ctx.globalAlpha = 1;
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
    }

    global.CosmicRenderer = new CosmicRenderer();
})(window);
