/**
 * COSMIC SURVIVORS v10.0 — GENESIS EDITION
 * Dynamic Moving Space Sector Director & Tactical Arena Physics (mapEvents.js)
 * Features 5600x5600 sectors, deterministic seeded obstacle generation (for Daily Mode),
 * solid circle/AABB cover colliders, capturable Vault Bunkers, reactive Reactor Cores,
 * drifting wreckage lanes, plasma currents, telegraphed meteor strikes, and Dyson beams.
 */
(function (global) {
    'use strict';

    const DEFAULT_WORLD_W = 5600;
    const DEFAULT_WORLD_H = 5600;
    const CENTER_SAFE_RADIUS = 460;

    class CosmicMapDirector {
        constructor() {
            this.mapId = 'sector9';
            this.worldW = DEFAULT_WORLD_W;
            this.worldH = DEFAULT_WORLD_H;
            this.rng = Math.random;
            this.time = 0;
            this.streamOffsetX = 0;
            this.streamOffsetY = 0;

            this.obstacles = [];    // Permanent solid structures (cover, vaults, reactor cores)
            this.debris = [];       // Drifting structural wreckage & meteors
            this.currents = [];     // Moving plasma currents / storm cells (Nebula)
            this.meteors = [];      // Telegraphed meteor impacts (Black Hole / Dyson / Sector9)
            this.beams = [];        // Telegraphed sweeping laser beams (Dyson)
            this.objectives = [];   // Overdrive Pylons & Salvage Cargo Pods

            this.blackHoleCore = { x: DEFAULT_WORLD_W * 0.5, y: DEFAULT_WORLD_H * 0.5, r: 105, orbitAng: 0 };
            this.nextObjectiveTimer = 14;
            this.nextHazardTimer = 7;
            this.activeBuffText = '';
            this.activeBuffTimer = 0;
        }

        _rand() {
            return typeof this.rng === 'function' ? this.rng() : Math.random();
        }

        init(mapId, worldW, worldH, rngFn) {
            this.mapId = mapId || 'sector9';
            this.worldW = worldW || DEFAULT_WORLD_W;
            this.worldH = worldH || DEFAULT_WORLD_H;
            this.rng = typeof rngFn === 'function' ? rngFn : Math.random;
            this.time = 0;
            this.streamOffsetX = 0;
            this.streamOffsetY = 0;

            this.obstacles = [];
            this.debris = [];
            this.currents = [];
            this.meteors = [];
            this.beams = [];
            this.objectives = [];
            this.nextObjectiveTimer = 10;
            this.nextHazardTimer = 6.5;
            this.activeBuffText = '';
            this.activeBuffTimer = 0;

            const cx = this.worldW * 0.5;
            const cy = this.worldH * 0.5;
            this.blackHoleCore = { x: cx, y: cy, r: 96, orbitAng: 0 };

            // 1. Generate 18-26 permanent tactical cover obstacles & interactive landmarks
            this._generateObstacles(cx, cy);

            // 2. Initial drifting landmarks & props tailored to each map
            const debrisCount = this.mapId === 'sector9' ? 28 : (this.mapId === 'blackhole' ? 18 : 16);
            const sprites = this.mapId === 'sector9'
                ? ['debris_1', 'debris_2', 'debris_3', 'meteor_1', 'meteor_2']
                : (this.mapId === 'blackhole' ? ['lava_meteor', 'meteor_1', 'meteor_2'] : ['debris_1', 'debris_3', 'meteor_1']);

            for (let i = 0; i < debrisCount; i++) {
                let px = 0;
                let py = 0;
                for (let tries = 0; tries < 24; tries++) {
                    px = this._rand() * this.worldW;
                    py = this._rand() * this.worldH;
                    if (Math.hypot(px - cx, py - cy) >= 360) break;
                }

                const sprite = sprites[i % sprites.length];
                const radius = sprite.startsWith('debris') ? (36 + this._rand() * 24) : (28 + this._rand() * 24);
                const driftAngle = this.mapId === 'sector9' ? 0.35 : (this._rand() * Math.PI * 2);
                const speed = this.mapId === 'sector9' ? (18 + this._rand() * 22) : (10 + this._rand() * 16);

                this.debris.push({
                    id: i,
                    sprite,
                    x: px,
                    y: py,
                    vx: Math.cos(driftAngle) * speed,
                    vy: Math.sin(driftAngle) * speed,
                    r: radius,
                    angle: this._rand() * Math.PI * 2,
                    rotSpeed: (this._rand() - 0.5) * 0.45,
                    hp: sprite.startsWith('meteor') ? 160 : 999999,
                    destructible: sprite.startsWith('meteor'),
                    scale: radius / 44
                });
            }

            if (this.mapId === 'nebula') {
                // Spawn 8 flowing quantum slipstream / storm zones across the 5600x5600 nebula
                for (let i = 0; i < 8; i++) {
                    const isStorm = i % 3 === 2;
                    this.currents.push({
                        x: 420 + this._rand() * (this.worldW - 840),
                        y: 420 + this._rand() * (this.worldH - 840),
                        vx: (this._rand() > 0.5 ? 1 : -1) * (24 + this._rand() * 18),
                        vy: (this._rand() - 0.5) * 20,
                        r: isStorm ? 185 : 235,
                        kind: isStorm ? 'emp' : 'boost',
                        pulsePhase: this._rand() * Math.PI * 2
                    });
                }
            }

            // Guarantee an initial Salvage Cargo Pod & Overdrive Pylon clear of obstacles
            const cargoPos = this._findClearPoint(cx + 410, cy - 280, 64, 520);
            this._spawnCargoPod(cargoPos.x, cargoPos.y);
            const pylonPos = this._findClearPoint(cx - 560, cy + 440, 145, 760);
            this._spawnOverdrivePylon(pylonPos.x, pylonPos.y, true);
        }

        _generateObstacles(cx, cy) {
            const targetCount = 20 + Math.floor(this._rand() * 7); // 20..26 structures (within 18-26)
            const specs = [];

            // 3 capturable Vault Bunkers spread across outer quadrants
            for (let i = 0; i < 3; i++) {
                specs.push({ kind: 'vault_bunker', sectorIdx: i, sectorTotal: 3 });
            }
            // 3 Reactor Cores spread across mid-outer quadrants
            for (let i = 0; i < 3; i++) {
                specs.push({ kind: 'reactor_core', sectorIdx: i, sectorTotal: 3 });
            }

            // Remaining cover structures tailored subtly by sector flavor
            const remaining = targetCount - specs.length;
            const pool = this.mapId === 'dyson'
                ? ['bulkhead_h', 'bulkhead_v', 'asteroid_cluster', 'bulkhead_h', 'bulkhead_v']
                : (this.mapId === 'blackhole'
                    ? ['asteroid_cluster', 'asteroid_cluster', 'bulkhead_h', 'bulkhead_v']
                    : ['asteroid_cluster', 'bulkhead_h', 'bulkhead_v']);

            for (let i = 0; i < remaining; i++) {
                const kind = pool[(i + Math.floor(this._rand() * pool.length)) % pool.length];
                specs.push({ kind, sectorIdx: i, sectorTotal: remaining });
            }

            for (let i = 0; i < specs.length; i++) {
                const obs = this._placeObstacleSpec(i, specs[i], cx, cy);
                if (obs) this.obstacles.push(obs);
            }
        }

        _createObstacleTemplate(id, kind) {
            if (kind === 'asteroid_cluster') {
                const r = Math.round(68 + this._rand() * 27); // 68..95
                return {
                    id, kind, sprite: 'obs_asteroid_cluster', shape: 'circle',
                    x: 0, y: 0, r, w: r * 2, h: r * 2, boundingR: r,
                    rotation: (this._rand() - 0.5) * 0.6
                };
            }
            if (kind === 'bulkhead_h') {
                return {
                    id, kind, sprite: 'obs_bulkhead_h', shape: 'rect',
                    x: 0, y: 0, r: 115, w: 230, h: 120,
                    boundingR: Math.hypot(115, 60), rotation: 0
                };
            }
            if (kind === 'bulkhead_v') {
                return {
                    id, kind, sprite: 'obs_bulkhead_v', shape: 'rect',
                    x: 0, y: 0, r: 115, w: 120, h: 230,
                    boundingR: Math.hypot(60, 115), rotation: 0
                };
            }
            if (kind === 'vault_bunker') {
                return {
                    id, kind, sprite: 'obs_vault_bunker', shape: 'circle',
                    x: 0, y: 0, r: 84, w: 168, h: 168, boundingR: 84,
                    captureR: 195, progress: 0, maxProgress: 4.0, captured: false,
                    pulsePhase: this._rand() * Math.PI * 2, rotation: 0
                };
            }
            // reactor_core
            const mode = (this.mapId === 'blackhole' || this.mapId === 'dyson') ? 'pulse' : 'overdrive';
            return {
                id, kind: 'reactor_core', sprite: 'obs_reactor_core', shape: 'circle',
                x: 0, y: 0, r: 78, w: 156, h: 156, boundingR: 78,
                auraR: 235, mode,
                pulseTimer: 2.2 + this._rand() * 3.8,
                pulseInterval: 6.4,
                pulseWarning: 1.6,
                pulseFlash: 0,
                pulsePhase: this._rand() * Math.PI * 2,
                rotation: 0
            };
        }

        _placeObstacleSpec(id, spec, cx, cy) {
            const obs = this._createObstacleTemplate(id, spec.kind);
            const wallMargin = Math.max(300, obs.boundingR + 220);
            const maxX = this.worldW - wallMargin;
            const maxY = this.worldH - wallMargin;
            const maxRadius = Math.min(cx, cy) - wallMargin;

            const passes = [
                { gap: 250, attempts: 75 },
                { gap: 185, attempts: 55 }
            ];

            for (let p = 0; p < passes.length; p++) {
                const { gap, attempts } = passes[p];
                for (let a = 0; a < attempts; a++) {
                    let px, py;
                    if (spec.kind === 'vault_bunker') {
                        const baseAng = (spec.sectorIdx / spec.sectorTotal) * Math.PI * 2 + 0.4;
                        const ang = baseAng + (this._rand() - 0.5) * 1.15;
                        const rad = 1100 + this._rand() * Math.max(300, maxRadius - 1150);
                        px = cx + Math.cos(ang) * rad;
                        py = cy + Math.sin(ang) * rad;
                    } else if (spec.kind === 'reactor_core') {
                        const baseAng = (spec.sectorIdx / spec.sectorTotal) * Math.PI * 2 + 1.45;
                        const ang = baseAng + (this._rand() - 0.5) * 1.15;
                        const rad = 760 + this._rand() * Math.max(300, maxRadius - 900);
                        px = cx + Math.cos(ang) * rad;
                        py = cy + Math.sin(ang) * rad;
                    } else if (a < 45) {
                        // Ring-stratified sampling for well-distributed tactical lanes
                        const baseAng = (spec.sectorIdx / Math.max(1, spec.sectorTotal)) * Math.PI * 2;
                        const ang = baseAng + (this._rand() - 0.5) * 1.3;
                        const minR = CENTER_SAFE_RADIUS + obs.boundingR + 90;
                        const rad = minR + this._rand() * Math.max(200, maxRadius - minR);
                        px = cx + Math.cos(ang) * rad;
                        py = cy + Math.sin(ang) * rad;
                    } else {
                        px = wallMargin + this._rand() * Math.max(100, maxX - wallMargin);
                        py = wallMargin + this._rand() * Math.max(100, maxY - wallMargin);
                    }

                    px = Math.max(wallMargin, Math.min(maxX, px));
                    py = Math.max(wallMargin, Math.min(maxY, py));

                    // Enforce 460px clear spawn zone around center
                    if (Math.hypot(px - cx, py - cy) < CENTER_SAFE_RADIUS + obs.boundingR) continue;

                    let clear = true;
                    for (let j = 0; j < this.obstacles.length; j++) {
                        const other = this.obstacles[j];
                        if (Math.hypot(px - other.x, py - other.y) < obs.boundingR + other.boundingR + gap) {
                            clear = false;
                            break;
                        }
                    }
                    if (clear) {
                        obs.x = Math.round(px);
                        obs.y = Math.round(py);
                        return obs;
                    }
                }
            }
            return null;
        }

        _isPointClearOfObstacles(x, y, pad = 48) {
            for (let i = 0; i < this.obstacles.length; i++) {
                const o = this.obstacles[i];
                if (o.shape === 'rect') {
                    const hw = o.w * 0.5 + pad;
                    const hh = o.h * 0.5 + pad;
                    if (Math.abs(x - o.x) < hw && Math.abs(y - o.y) < hh) return false;
                } else {
                    if (Math.hypot(x - o.x, y - o.y) < o.r + pad) return false;
                }
            }
            return true;
        }

        _findClearPoint(prefX, prefY, pad = 64, spread = 420) {
            const margin = Math.max(320, pad + 80);
            const clampX = (v) => Math.max(margin, Math.min(this.worldW - margin, v));
            const clampY = (v) => Math.max(margin, Math.min(this.worldH - margin, v));
            const x0 = clampX(prefX);
            const y0 = clampY(prefY);
            if (this._isPointClearOfObstacles(x0, y0, pad)) return { x: x0, y: y0 };
            for (let i = 0; i < 24; i++) {
                const ang = this._rand() * Math.PI * 2;
                const d = (0.35 + this._rand() * 0.65) * spread;
                const tx = clampX(x0 + Math.cos(ang) * d);
                const ty = clampY(y0 + Math.sin(ang) * d);
                if (this._isPointClearOfObstacles(tx, ty, pad)) return { x: tx, y: ty };
            }
            return { x: x0, y: y0 };
        }

        /**
         * Smoothly pushes a circular entity (player/enemy) out of all solid circle and AABB obstacles,
         * and clamps its position inside [margin, worldW - margin] x [margin, worldH - margin].
         */
        resolveCircleCollision(ent, radius) {
            if (!ent || !Number.isFinite(ent.x) || !Number.isFinite(ent.y)) return false;
            const r = Math.max(4, Number.isFinite(radius) ? radius : (ent.r || 18));
            const margin = Math.max(24, r + 6);
            let collided = false;

            for (let iter = 0; iter < 2; iter++) {
                for (let i = 0; i < this.obstacles.length; i++) {
                    const o = this.obstacles[i];
                    if (o.shape === 'rect') {
                        const hw = o.w * 0.5;
                        const hh = o.h * 0.5;
                        const left = o.x - hw;
                        const right = o.x + hw;
                        const top = o.y - hh;
                        const bottom = o.y + hh;

                        const closestX = Math.max(left, Math.min(right, ent.x));
                        const closestY = Math.max(top, Math.min(bottom, ent.y));
                        const dx = ent.x - closestX;
                        const dy = ent.y - closestY;
                        const distSq = dx * dx + dy * dy;

                        if (distSq > 0.000001) {
                            if (distSq < r * r) {
                                const dist = Math.sqrt(distSq);
                                const push = r - dist;
                                ent.x += (dx / dist) * push;
                                ent.y += (dy / dist) * push;
                                collided = true;
                            }
                        } else {
                            // Center lies inside the AABB: push cleanly out along nearest edge
                            const penLeft = ent.x - left;
                            const penRight = right - ent.x;
                            const penTop = ent.y - top;
                            const penBottom = bottom - ent.y;
                            const minPen = Math.min(penLeft, penRight, penTop, penBottom);
                            if (minPen === penLeft) ent.x = left - r;
                            else if (minPen === penRight) ent.x = right + r;
                            else if (minPen === penTop) ent.y = top - r;
                            else ent.y = bottom + r;
                            collided = true;
                        }
                    } else {
                        const dx = ent.x - o.x;
                        const dy = ent.y - o.y;
                        const minDist = o.r + r;
                        const distSq = dx * dx + dy * dy;
                        if (distSq < minDist * minDist) {
                            if (distSq > 0.000001) {
                                const dist = Math.sqrt(distSq);
                                const push = minDist - dist;
                                ent.x += (dx / dist) * push;
                                ent.y += (dy / dist) * push;
                            } else {
                                ent.x += minDist;
                            }
                            collided = true;
                        }
                    }
                }
            }

            if (ent.x < margin) { ent.x = margin; collided = true; }
            else if (ent.x > this.worldW - margin) { ent.x = this.worldW - margin; collided = true; }
            if (ent.y < margin) { ent.y = margin; collided = true; }
            else if (ent.y > this.worldH - margin) { ent.y = this.worldH - margin; collided = true; }

            return collided;
        }

        /**
         * Checks whether a circular projectile at (bx, by) with radius br hits any solid obstacle.
         * Returns { hit: true, obstacle } on collision, or { hit: false, obstacle: null } otherwise.
         */
        checkProjectileObstacleHit(bx, by, br) {
            if (!Number.isFinite(bx) || !Number.isFinite(by)) return { hit: false, obstacle: null };
            const r = Math.max(0, Number.isFinite(br) ? br : 4);

            for (let i = 0; i < this.obstacles.length; i++) {
                const o = this.obstacles[i];
                if (o.shape === 'rect') {
                    const hw = o.w * 0.5;
                    const hh = o.h * 0.5;
                    const closestX = Math.max(o.x - hw, Math.min(o.x + hw, bx));
                    const closestY = Math.max(o.y - hh, Math.min(o.y + hh, by));
                    const dx = bx - closestX;
                    const dy = by - closestY;
                    if (dx * dx + dy * dy <= r * r) {
                        return { hit: true, obstacle: o };
                    }
                } else {
                    const dx = bx - o.x;
                    const dy = by - o.y;
                    const maxR = o.r + r;
                    if (dx * dx + dy * dy <= maxR * maxR) {
                        return { hit: true, obstacle: o };
                    }
                }
            }
            return { hit: false, obstacle: null };
        }

        _spawnOverdrivePylon(px, py, exact = false) {
            const margin = 440;
            const rawX = exact ? px : Math.max(margin, Math.min(this.worldW - margin, px + (this._rand() - 0.5) * 1400));
            const rawY = exact ? py : Math.max(margin, Math.min(this.worldH - margin, py + (this._rand() - 0.5) * 1200));
            const pos = this._findClearPoint(rawX, rawY, 145, 380);
            this.objectives.push({
                kind: 'pylon',
                sprite: 'pylon_beacon',
                x: pos.x,
                y: pos.y,
                r: 138,
                progress: 0,
                maxProgress: 3.2,
                life: 44,
                rot: 0,
                completed: false
            });
        }

        _spawnCargoPod(px, py) {
            const rawX = px != null ? px : (440 + this._rand() * (this.worldW - 880));
            const rawY = py != null ? py : (440 + this._rand() * (this.worldH - 880));
            const pos = this._findClearPoint(rawX, rawY, 64, 340);
            const ang = this._rand() * Math.PI * 2;
            this.objectives.push({
                kind: 'cargo',
                sprite: 'cargo_pod',
                x: pos.x,
                y: pos.y,
                vx: Math.cos(ang) * 28,
                vy: Math.sin(ang) * 28,
                r: 38,
                hp: 95,
                maxHp: 95,
                life: 48,
                rot: ang,
                completed: false
            });
        }

        _spawnTelegraphedMeteor(targetX, targetY) {
            this.meteors.push({
                x: Math.max(180, Math.min(this.worldW - 180, targetX)),
                y: Math.max(180, Math.min(this.worldH - 180, targetY)),
                r: 118,
                delay: 1.55,
                maxDelay: 1.55,
                impacted: false,
                afterglow: 0.45
            });
        }

        _spawnDysonBeam(px, py) {
            const startAng = this._rand() * Math.PI * 2;
            const sweepDir = this._rand() > 0.5 ? 1 : -1;
            // Originates slightly offset from player so player always has fair maneuver room
            const ox = Math.max(300, Math.min(this.worldW - 300, px + Math.cos(startAng + Math.PI) * 380));
            const oy = Math.max(300, Math.min(this.worldH - 300, py + Math.sin(startAng + Math.PI) * 380));
            this.beams.push({
                ox, oy,
                angle: startAng,
                sweepSpeed: sweepDir * 0.34,
                length: 1750,
                width: 34,
                warmup: 2.1,
                maxWarmup: 2.1,
                activeTime: 2.8,
                tickCd: 0
            });
        }

        update(dt, callbacks) {
            this.time += dt;
            if (this.activeBuffTimer > 0) this.activeBuffTimer = Math.max(0, this.activeBuffTimer - dt);

            const player = callbacks && callbacks.player;
            const enemies = (callbacks && callbacks.enemies) || [];

            // Subtle ambient spatial star-drift per map
            if (this.mapId === 'sector9') {
                this.streamOffsetX += 14 * dt;
                this.streamOffsetY += 6 * dt;
            } else if (this.mapId === 'nebula') {
                this.streamOffsetX += 26 * dt;
                this.streamOffsetY -= 11 * dt;
            } else if (this.mapId === 'blackhole') {
                this.streamOffsetX += Math.cos(this.time * 0.22) * 16 * dt;
                this.streamOffsetY += Math.sin(this.time * 0.22) * 16 * dt;
            } else if (this.mapId === 'dyson') {
                this.streamOffsetX += 12 * dt;
                this.streamOffsetY += 12 * dt;
            }

            // 1. Drifting debris & asteroids
            for (let i = this.debris.length - 1; i >= 0; i--) {
                const d = this.debris[i];
                d.x += d.vx * dt;
                d.y += d.vy * dt;
                d.angle += d.rotSpeed * dt;

                // Seamless wrap around arena borders so lanes never run empty
                if (d.x < -120) d.x = this.worldW + 120;
                if (d.x > this.worldW + 120) d.x = -120;
                if (d.y < -120) d.y = this.worldH + 120;
                if (d.y > this.worldH + 120) d.y = -120;

                // Gentle physical push on player if hugging drifting debris
                if (player && !player.invuln) {
                    const dx = player.x - d.x;
                    const dy = player.y - d.y;
                    const dist = Math.hypot(dx, dy);
                    const minDist = d.r + 16;
                    if (dist < minDist && dist > 0.01) {
                        const push = (minDist - dist) * 0.65;
                        player.x += (dx / dist) * push;
                        player.y += (dy / dist) * push;
                    }
                }
            }

            // 2. Nebula migrating boost/storm currents
            for (let i = 0; i < this.currents.length; i++) {
                const c = this.currents[i];
                c.x += c.vx * dt;
                c.y += c.vy * dt;
                if (c.x < 240 || c.x > this.worldW - 240) c.vx *= -1;
                if (c.y < 240 || c.y > this.worldH - 240) c.vy *= -1;
            }

            // 3. Black Hole moving Singularity Core
            if (this.mapId === 'blackhole') {
                this.blackHoleCore.orbitAng += dt * 0.22;
                const cx = this.worldW * 0.5;
                const cy = this.worldH * 0.5;
                this.blackHoleCore.x = cx + Math.cos(this.blackHoleCore.orbitAng) * 420;
                this.blackHoleCore.y = cy + Math.sin(this.blackHoleCore.orbitAng * 2) * 240;

                if (player) {
                    const dx = this.blackHoleCore.x - player.x;
                    const dy = this.blackHoleCore.y - player.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist > 45 && dist < 960) {
                        const pull = Math.min(84, (960 - dist) * 0.105);
                        player.x += (dx / dist) * pull * dt;
                        player.y += (dy / dist) * pull * dt;
                    }
                    if (dist < this.blackHoleCore.r * 0.72 && callbacks && callbacks.onDamagePlayer) {
                        callbacks.onDamagePlayer(18 * dt, 'OLAY UFKU ÇEKİMİ', true);
                    }
                }
            }

            // 3b. Interactive Vault Bunkers & Reactor Cores + Solid Collision Enforcement
            for (let i = 0; i < this.obstacles.length; i++) {
                const o = this.obstacles[i];
                if (o.kind === 'vault_bunker' && !o.captured) {
                    if (player && Math.hypot(player.x - o.x, player.y - o.y) <= o.captureR) {
                        o.progress += dt;
                        if (o.progress >= o.maxProgress) {
                            o.progress = o.maxProgress;
                            o.captured = true;
                            this.activeBuffText = 'KASA MÜHRÜ ÇÖZÜLDÜ (+%30 ATEŞ HIZI · +350 KREDİ)';
                            this.activeBuffTimer = 10.0;
                            if (callbacks && callbacks.onVaultCaptured) {
                                callbacks.onVaultCaptured(o);
                            } else if (callbacks && callbacks.onPylonCaptured) {
                                callbacks.onPylonCaptured(o);
                            }
                        }
                    } else {
                        o.progress = Math.max(0, o.progress - dt * 0.25);
                    }
                } else if (o.kind === 'reactor_core') {
                    if (o.pulseFlash > 0) o.pulseFlash = Math.max(0, o.pulseFlash - dt);
                    if (o.mode === 'pulse') {
                        o.pulseTimer -= dt;
                        if (o.pulseTimer <= 0) {
                            o.pulseTimer = o.pulseInterval;
                            o.pulseFlash = 0.5;
                            if (player && Math.hypot(player.x - o.x, player.y - o.y) <= o.auraR && callbacks && callbacks.onDamagePlayer) {
                                callbacks.onDamagePlayer(16, 'REAKTÖR PLAZMA PATLAMASI', false);
                            }
                            for (let e = 0; e < enemies.length; e++) {
                                const en = enemies[e];
                                if (Math.hypot(en.x - o.x, en.y - o.y) <= o.auraR && callbacks && callbacks.onDamageEnemy) {
                                    callbacks.onDamageEnemy(en, 55, false);
                                }
                            }
                        }
                    }
                }
            }

            if (player && (!callbacks || callbacks.resolveObstacles !== false)) {
                this.resolveCircleCollision(player, player.r || 18);
            }

            // 4. Periodic Hazard Events
            this.nextHazardTimer -= dt;
            if (this.nextHazardTimer <= 0 && player) {
                if (this.mapId === 'blackhole') {
                    this.nextHazardTimer = 5.2;
                    for (let m = 0; m < 2; m++) {
                        this._spawnTelegraphedMeteor(
                            player.x + (this._rand() - 0.5) * 520,
                            player.y + (this._rand() - 0.5) * 420
                        );
                    }
                } else if (this.mapId === 'dyson') {
                    this.nextHazardTimer = 11.5;
                    this._spawnDysonBeam(player.x, player.y);
                } else if (this.mapId === 'sector9') {
                    this.nextHazardTimer = 8.5;
                    this._spawnTelegraphedMeteor(
                        player.x + (this._rand() - 0.5) * 620,
                        player.y + (this._rand() - 0.5) * 460
                    );
                } else {
                    this.nextHazardTimer = 999;
                }
            }

            // Update Telegraphed Meteors
            for (let i = this.meteors.length - 1; i >= 0; i--) {
                const m = this.meteors[i];
                if (!m.impacted) {
                    m.delay -= dt;
                    if (m.delay <= 0) {
                        m.impacted = true;
                        if (callbacks && callbacks.onMeteorImpact) callbacks.onMeteorImpact(m);
                        if (player && Math.hypot(player.x - m.x, player.y - m.y) < m.r * 0.88 && callbacks && callbacks.onDamagePlayer) {
                            callbacks.onDamagePlayer(22, 'METEOR ÇARPMASI', false);
                        }
                        for (let e = 0; e < enemies.length; e++) {
                            const en = enemies[e];
                            if (Math.hypot(en.x - m.x, en.y - m.y) < m.r && callbacks && callbacks.onDamageEnemy) {
                                callbacks.onDamageEnemy(en, 65, false);
                            }
                        }
                    }
                } else {
                    m.afterglow -= dt;
                    if (m.afterglow <= 0) this.meteors.splice(i, 1);
                }
            }

            // Update Dyson Sweeping Beams (sweep across obstacles as continuous energy beams)
            for (let i = this.beams.length - 1; i >= 0; i--) {
                const b = this.beams[i];
                if (b.warmup > 0) {
                    b.warmup -= dt;
                } else {
                    b.activeTime -= dt;
                    b.angle += b.sweepSpeed * dt;
                    b.tickCd -= dt;
                    if (b.tickCd <= 0 && player) {
                        b.tickCd = 0.20;
                        const x2 = b.ox + Math.cos(b.angle) * b.length;
                        const y2 = b.oy + Math.sin(b.angle) * b.length;
                        const dist = CosmicMapDirector._pointToSegDist(player.x, player.y, b.ox, b.oy, x2, y2);
                        if (dist < b.width * 0.65 && callbacks && callbacks.onDamagePlayer) {
                            callbacks.onDamagePlayer(12, 'DYSON SÜPÜRME LAZERİ', false);
                        }
                        for (let e = 0; e < enemies.length; e++) {
                            const en = enemies[e];
                            if (CosmicMapDirector._pointToSegDist(en.x, en.y, b.ox, b.oy, x2, y2) < b.width * 0.8 && callbacks && callbacks.onDamageEnemy) {
                                callbacks.onDamageEnemy(en, 28, false);
                            }
                        }
                    }
                    if (b.activeTime <= 0) this.beams.splice(i, 1);
                }
            }

            // 5. Periodic Live Map Objectives (Overdrive Pylons & Salvage Cargo Pods)
            this.nextObjectiveTimer -= dt;
            if (this.nextObjectiveTimer <= 0 && player) {
                this.nextObjectiveTimer = 22;
                const activeCount = this.objectives.length;
                if (activeCount < 4) {
                    if (this._rand() < 0.55) this._spawnOverdrivePylon(player.x, player.y);
                    else this._spawnCargoPod(player.x + (this._rand() - 0.5) * 1100, player.y + (this._rand() - 0.5) * 900);
                }
            }

            for (let i = this.objectives.length - 1; i >= 0; i--) {
                const o = this.objectives[i];
                o.life -= dt;
                if (o.kind === 'pylon') {
                    o.rot += dt * 0.9;
                    if (player && Math.hypot(player.x - o.x, player.y - o.y) <= o.r) {
                        o.progress += dt;
                        if (o.progress >= o.maxProgress) {
                            o.completed = true;
                            this.activeBuffText = 'RÖLE AŞIRI YÜKLEMESİ AKTİF (+%30 ATEŞ HIZI · +250 KREDİ)';
                            this.activeBuffTimer = 9.0;
                            if (callbacks && callbacks.onPylonCaptured) callbacks.onPylonCaptured(o);
                            this.objectives.splice(i, 1);
                            continue;
                        }
                    } else {
                        o.progress = Math.max(0, o.progress - dt * 0.35);
                    }
                } else if (o.kind === 'cargo') {
                    o.x += o.vx * dt;
                    o.y += o.vy * dt;
                    o.rot += dt * 0.25;
                    this.resolveCircleCollision(o, o.r);
                    if (player && Math.hypot(player.x - o.x, player.y - o.y) <= o.r + 36) {
                        o.completed = true;
                        if (callbacks && callbacks.onCargoOpened) callbacks.onCargoOpened(o);
                        this.objectives.splice(i, 1);
                        continue;
                    }
                }
                if (o.life <= 0) this.objectives.splice(i, 1);
            }
        }

        getPlayerModifiers(player) {
            let speedMult = 1.0;
            let fireRateMult = 1.0;
            let statusTag = '';

            if (this.activeBuffTimer > 0) {
                speedMult *= 1.18;
                fireRateMult *= 1.30;
                statusTag = 'OVERDRIVE +' + Math.ceil(this.activeBuffTimer) + 's';
            }

            if (player) {
                // Localized Reactor Core overdrive aura (Sector 9 & Nebula)
                for (let i = 0; i < this.obstacles.length; i++) {
                    const o = this.obstacles[i];
                    if (o.kind === 'reactor_core' && o.mode === 'overdrive') {
                        if (Math.hypot(player.x - o.x, player.y - o.y) <= o.auraR) {
                            fireRateMult *= 1.22;
                            speedMult *= 1.12;
                            statusTag = statusTag || 'REAKTÖR OVERDRIVE (+%22 ATEŞ HIZI)';
                            break;
                        }
                    }
                }

                if (this.mapId === 'nebula') {
                    for (let i = 0; i < this.currents.length; i++) {
                        const c = this.currents[i];
                        if (Math.hypot(player.x - c.x, player.y - c.y) <= c.r) {
                            if (c.kind === 'boost') {
                                speedMult *= 1.28;
                                fireRateMult *= 1.16;
                                statusTag = statusTag || 'KUANTUM AKINTISI (+%28 HIZ)';
                            } else {
                                speedMult *= 0.80;
                                statusTag = statusTag || 'EMP FIRTINA HÜCRESİ (-%20 HIZ)';
                            }
                            break;
                        }
                    }
                }
            }

            return { speedMult, fireRateMult, statusTag };
        }

        getRenderState() {
            return {
                mapId: this.mapId,
                worldW: this.worldW,
                worldH: this.worldH,
                time: this.time,
                streamOffsetX: this.streamOffsetX,
                streamOffsetY: this.streamOffsetY,
                obstacles: this.obstacles,
                debris: this.debris,
                currents: this.currents,
                meteors: this.meteors,
                beams: this.beams,
                objectives: this.objectives,
                blackHoleCore: this.blackHoleCore,
                activeBuffText: this.activeBuffTimer > 0 ? this.activeBuffText : ''
            };
        }

        static _pointToSegDist(px, py, x1, y1, x2, y2) {
            const dx = x2 - x1;
            const dy = y2 - y1;
            const lenSq = dx * dx + dy * dy;
            if (lenSq <= 0.0001) return Math.hypot(px - x1, py - y1);
            const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
            return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
        }
    }

    global.CosmicMapDirector = new CosmicMapDirector();
})(typeof window !== 'undefined' ? window : globalThis);
