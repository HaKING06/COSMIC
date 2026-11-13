/**
 * COSMIC SURVIVORS v9.0 — Dynamic Moving Space Sector Director (mapEvents.js)
 * Turns every arena into a living, shifting orbital sector with drifting wreckage lanes,
 * flowing plasma currents, telegraphed meteor strikes, sweeping Dyson beams,
 * capturable Overdrive Pylons, and drifting Salvage Cargo Pods.
 */
(function (global) {
    'use strict';

    class CosmicMapDirector {
        constructor() {
            this.mapId = 'sector9';
            this.worldW = 4200;
            this.worldH = 3200;
            this.time = 0;
            this.streamOffsetX = 0;
            this.streamOffsetY = 0;

            this.debris = [];       // Drifting structural wreckage & meteors
            this.currents = [];     // Moving plasma currents / storm cells (Nebula)
            this.meteors = [];      // Telegraphed meteor impacts (Black Hole / Dyson)
            this.beams = [];        // Telegraphed sweeping laser beams (Dyson)
            this.objectives = [];   // Overdrive Pylons & Salvage Cargo Pods

            this.blackHoleCore = { x: 2100, y: 1600, r: 105, orbitAng: 0 };
            this.nextObjectiveTimer = 14;
            this.nextHazardTimer = 7;
            this.activeBuffText = '';
            this.activeBuffTimer = 0;
        }

        init(mapId, worldW, worldH) {
            this.mapId = mapId || 'sector9';
            this.worldW = worldW || 4200;
            this.worldH = worldH || 3200;
            this.time = 0;
            this.streamOffsetX = 0;
            this.streamOffsetY = 0;
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

            // Initial drifting landmarks & props tailored to each map
            const debrisCount = this.mapId === 'sector9' ? 24 : (this.mapId === 'blackhole' ? 14 : 12);
            const sprites = this.mapId === 'sector9'
                ? ['debris_1', 'debris_2', 'debris_3', 'meteor_1', 'meteor_2']
                : (this.mapId === 'blackhole' ? ['lava_meteor', 'meteor_1', 'meteor_2'] : ['debris_1', 'debris_3', 'meteor_1']);

            for (let i = 0; i < debrisCount; i++) {
                let px, py;
                do {
                    px = Math.random() * this.worldW;
                    py = Math.random() * this.worldH;
                } while (Math.hypot(px - cx, py - cy) < 340);

                const sprite = sprites[i % sprites.length];
                const radius = sprite.startsWith('debris') ? (36 + Math.random() * 24) : (28 + Math.random() * 24);
                const driftAngle = this.mapId === 'sector9' ? 0.35 : (Math.random() * Math.PI * 2);
                const speed = this.mapId === 'sector9' ? (18 + Math.random() * 22) : (10 + Math.random() * 16);

                this.debris.push({
                    id: i,
                    sprite,
                    x: px,
                    y: py,
                    vx: Math.cos(driftAngle) * speed,
                    vy: Math.sin(driftAngle) * speed,
                    r: radius,
                    angle: Math.random() * Math.PI * 2,
                    rotSpeed: (Math.random() - 0.5) * 0.45,
                    hp: sprite.startsWith('meteor') ? 160 : 999999,
                    destructible: sprite.startsWith('meteor'),
                    scale: radius / 44
                });
            }

            if (this.mapId === 'nebula') {
                // Spawn 6 flowing quantum slipstream / storm zones
                for (let i = 0; i < 6; i++) {
                    const isStorm = i % 3 === 2;
                    this.currents.push({
                        x: 400 + Math.random() * (this.worldW - 800),
                        y: 400 + Math.random() * (this.worldH - 800),
                        vx: (Math.random() > 0.5 ? 1 : -1) * (24 + Math.random() * 18),
                        vy: (Math.random() - 0.5) * 20,
                        r: isStorm ? 175 : 225,
                        kind: isStorm ? 'emp' : 'boost',
                        pulsePhase: Math.random() * Math.PI * 2
                    });
                }
            }

            // Guarantee 1 initial Salvage Cargo Pod near center-offbeat so sector immediately feels alive
            this._spawnCargoPod(cx + 380, cy - 260);
        }

        _spawnOverdrivePylon(px, py) {
            const margin = 420;
            const x = Math.max(margin, Math.min(this.worldW - margin, px + (Math.random() - 0.5) * 1100));
            const y = Math.max(margin, Math.min(this.worldH - margin, py + (Math.random() - 0.5) * 900));
            this.objectives.push({
                kind: 'pylon',
                sprite: 'pylon_beacon',
                x, y,
                r: 138,
                progress: 0,
                maxProgress: 3.2,
                life: 38,
                rot: 0,
                completed: false
            });
        }

        _spawnCargoPod(px, py) {
            const x = px != null ? px : (420 + Math.random() * (this.worldW - 840));
            const y = py != null ? py : (420 + Math.random() * (this.worldH - 840));
            const ang = Math.random() * Math.PI * 2;
            this.objectives.push({
                kind: 'cargo',
                sprite: 'cargo_pod',
                x, y,
                vx: Math.cos(ang) * 28,
                vy: Math.sin(ang) * 28,
                r: 38,
                hp: 95,
                maxHp: 95,
                life: 45,
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
            const startAng = Math.random() * Math.PI * 2;
            const sweepDir = Math.random() > 0.5 ? 1 : -1;
            // Originates slightly offset from player so player always has fair maneuver room
            const ox = Math.max(300, Math.min(this.worldW - 300, px + Math.cos(startAng + Math.PI) * 380));
            const oy = Math.max(300, Math.min(this.worldH - 300, py + Math.sin(startAng + Math.PI) * 380));
            this.beams.push({
                ox, oy,
                angle: startAng,
                sweepSpeed: sweepDir * 0.34,
                length: 1350,
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

                // Gentle physical push on player if hugging solid debris
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
                if (c.x < 220 || c.x > this.worldW - 220) c.vx *= -1;
                if (c.y < 220 || c.y > this.worldH - 220) c.vy *= -1;
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
                    if (dist > 45 && dist < 880) {
                        const pull = Math.min(82, (880 - dist) * 0.105);
                        player.x += (dx / dist) * pull * dt;
                        player.y += (dy / dist) * pull * dt;
                    }
                    if (dist < this.blackHoleCore.r * 0.72 && callbacks.onDamagePlayer) {
                        callbacks.onDamagePlayer(18 * dt, 'OLAY UFKU ÇEKİMİ', true);
                    }
                }
            }

            // 4. Periodic Hazard Events
            this.nextHazardTimer -= dt;
            if (this.nextHazardTimer <= 0 && player) {
                if (this.mapId === 'blackhole') {
                    this.nextHazardTimer = 5.2;
                    // Drop 2 telegraphed lava meteors near player path
                    for (let m = 0; m < 2; m++) {
                        this._spawnTelegraphedMeteor(
                            player.x + (Math.random() - 0.5) * 520,
                            player.y + (Math.random() - 0.5) * 420
                        );
                    }
                } else if (this.mapId === 'dyson') {
                    this.nextHazardTimer = 11.5;
                    this._spawnDysonBeam(player.x, player.y);
                } else if (this.mapId === 'sector9') {
                    this.nextHazardTimer = 8.5;
                    this._spawnTelegraphedMeteor(
                        player.x + (Math.random() - 0.5) * 620,
                        player.y + (Math.random() - 0.5) * 460
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
                        if (callbacks.onMeteorImpact) callbacks.onMeteorImpact(m);
                        if (player && Math.hypot(player.x - m.x, player.y - m.y) < m.r * 0.88 && callbacks.onDamagePlayer) {
                            callbacks.onDamagePlayer(22, 'METEOR ÇARPMASI', false);
                        }
                        for (let e = 0; e < enemies.length; e++) {
                            const en = enemies[e];
                            if (Math.hypot(en.x - m.x, en.y - m.y) < m.r && callbacks.onDamageEnemy) {
                                callbacks.onDamageEnemy(en, 65, false);
                            }
                        }
                    }
                } else {
                    m.afterglow -= dt;
                    if (m.afterglow <= 0) this.meteors.splice(i, 1);
                }
            }

            // Update Dyson Sweeping Beams
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
                        // Distance from point to segment
                        const x2 = b.ox + Math.cos(b.angle) * b.length;
                        const y2 = b.oy + Math.sin(b.angle) * b.length;
                        const dist = CosmicMapDirector._pointToSegDist(player.x, player.y, b.ox, b.oy, x2, y2);
                        if (dist < b.width * 0.65 && callbacks.onDamagePlayer) {
                            callbacks.onDamagePlayer(12, 'DYSON SÜPÜRME LAZERİ', false);
                        }
                        // Also incinerates enemies caught in beam!
                        for (let e = 0; e < enemies.length; e++) {
                            const en = enemies[e];
                            if (CosmicMapDirector._pointToSegDist(en.x, en.y, b.ox, b.oy, x2, y2) < b.width * 0.8 && callbacks.onDamageEnemy) {
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
                this.nextObjectiveTimer = 24;
                const activeCount = this.objectives.length;
                if (activeCount < 3) {
                    if (Math.random() < 0.55) this._spawnOverdrivePylon(player.x, player.y);
                    else this._spawnCargoPod(player.x + (Math.random() - 0.5) * 800, player.y + (Math.random() - 0.5) * 650);
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
                            if (callbacks.onPylonCaptured) callbacks.onPylonCaptured(o);
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
                    if (player && Math.hypot(player.x - o.x, player.y - o.y) <= o.r + 36) {
                        o.completed = true;
                        if (callbacks.onCargoOpened) callbacks.onCargoOpened(o);
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

            if (this.mapId === 'nebula' && player) {
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

            return { speedMult, fireRateMult, statusTag };
        }

        getRenderState() {
            return {
                mapId: this.mapId,
                time: this.time,
                streamOffsetX: this.streamOffsetX,
                streamOffsetY: this.streamOffsetY,
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
})(window);

