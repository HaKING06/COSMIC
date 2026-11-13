// =============================================================================
// COSMIC UNIVERSE v12.0 — 60 FPS MULTI-LAYER SPACE OPERA CUTSCENE ENGINE
// Combines Ken Burns camera motion, crossfade plates, dogfight & plasma VFX,
// crimson dreadnought beam sweeps, chromatic shockwaves, S.A.R.A. telemetry HUD,
// Chapter Intro Title Slam, Act IV Spatial Rift Vortex, and typewriter engine.
// =============================================================================
(function (global) {
    'use strict';

    const SPRITE_META = {
        fighter: { baseRot: Math.PI * 0.5 },
        stealth_jet: { baseRot: 0 },
        carrier_ship: { baseRot: 0 },
        exo_trooper: { baseRot: 0 },
        colossus_boss: { baseRot: 0 },
        boss_core: { baseRot: 0 },
        alien_drone: { baseRot: 0 },
        ufo: { baseRot: 0 },
        tactical_mech: { baseRot: 0 },
        portal_vortex: { baseRot: 0 },
        warp_ring: { baseRot: 0 },
        plasma_bomb: { baseRot: 0 }
    };

    function easeOutCubic(t) {
        const inv = 1 - Math.min(1, Math.max(0, t));
        return 1 - inv * inv * inv;
    }

    function roundRectPath(ctx, x, y, w, h, r) {
        const rad = Math.min(r, w * 0.5, h * 0.5);
        ctx.beginPath();
        ctx.moveTo(x + rad, y);
        ctx.lineTo(x + w - rad, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
        ctx.lineTo(x + w, y + h - rad);
        ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
        ctx.lineTo(x + rad, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
        ctx.lineTo(x, y + rad);
        ctx.quadraticCurveTo(x, y, x + rad, y);
        ctx.closePath();
    }

    function drawCoverImage(ctx, img, dx, dy, dw, dh) {
        if (!img || !img.width || !img.height) return;
        const imgAspect = img.width / img.height;
        const dstAspect = dw / dh;
        let sw = img.width;
        let sh = img.height;
        let sx = 0;
        let sy = 0;
        if (imgAspect > dstAspect) {
            sw = img.height * dstAspect;
            sx = (img.width - sw) * 0.5;
        } else {
            sh = img.width / dstAspect;
            sy = (img.height - sh) * 0.5;
        }
        ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    }

    class CutscenePlayer {
        constructor(options) {
            this.canvas = options.canvas;
            this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
            this.onComplete = options.onComplete || null;
            this.onAutoNext = options.onAutoNext || null;
            this.onTypeStateChange = options.onTypeStateChange || null;

            this.W = 960;
            this.H = 540;
            if (this.canvas) {
                this.canvas.width = this.W;
                this.canvas.height = this.H;
            }

            this.backdropImg = null;
            this.prevBackdropImg = null;
            this.backdropFade = 1;
            this.currentImageUrl = '';
            this.chapterId = 1;
            this.chapterStamp = 'CH.01 // SECTOR 01';
            this.chapterTitle = '';
            this.activeSpeaker = '';

            this.sprites = {};
            this.preloadSprites();

            this.stars = Array.from({ length: 110 }, () => ({
                x: Math.random() * this.W,
                y: Math.random() * this.H,
                z: 0.35 + Math.random() * 1.75,
                alpha: 0.25 + Math.random() * 0.7,
                twinkle: Math.random() * Math.PI * 2
            }));

            this.vortexDust = Array.from({ length: 42 }, (_, idx) => ({
                angle: (idx / 42) * Math.PI * 2 + Math.random() * 0.4,
                radius: 26 + Math.random() * 165,
                speed: 0.7 + Math.random() * 1.4,
                size: 1.2 + Math.random() * 2.4,
                hue: idx % 3 === 0 ? '#f43f5e' : (idx % 2 === 0 ? '#c084fc' : '#38bdf8')
            }));

            this.ships = [];
            this.plasmaBolts = [];
            this.warpRings = [];
            this.shockwaves = [];
            this.particles = [];
            this.hitSparks = [];

            this.mood = 'normal'; // normal | focused | alert | shake | warp | triumph | tragic
            this.time = 0;
            this.shakeTimer = 0;
            this.flashAlpha = 0;
            this.flashColor = '#ffffff';
            this.introSlamTimer = 0;
            this.introSlamDuration = 2.5;
            this.beamCycle = 0;

            this.running = false;
            this.rafId = 0;
            this.lastTs = 0;

            this.typeTimer = 0;
            this.fullText = '';
            this.typedText = '';
            this.typeTargetEl = null;
            this.typeDone = true;
            this.autoPlay = true;
            this.autoBeatTimer = 0;
        }

        preloadSprites() {
            Object.keys(SPRITE_META).forEach((k) => {
                const im = new Image();
                im.onload = () => { this.sprites[k] = im; };
                im.src = `assets/v11/sprites/${k}.png`;
            });
        }

        isSaraActive() {
            const sp = String(this.activeSpeaker || '').toLowerCase();
            return sp.includes('s.a.r.a') || sp.includes('sara');
        }

        isHostileSpeaker() {
            const sp = String(this.activeSpeaker || '').toLowerCase();
            return sp.includes('kaelen') || sp.includes('architect') || sp.includes('mimar');
        }

        setBeat(meta) {
            if (!meta) return;
            if (meta.mood) this.mood = meta.mood;
            if (typeof meta.speaker === 'string') this.activeSpeaker = meta.speaker;
            if (typeof meta.stamp === 'string') this.chapterStamp = meta.stamp;
            if (typeof meta.title === 'string') this.chapterTitle = meta.title;
        }

        triggerIntroSlam() {
            this.introSlamTimer = this.introSlamDuration;
        }

        setScene(chapterId, imageUrl, mood, meta) {
            const chNum = Math.max(1, Number(chapterId) || 1);
            const prevChapter = this.chapterId;
            this.chapterId = chNum;
            this.mood = mood || (chNum >= 21 ? 'tragic' : (chNum >= 17 ? 'alert' : 'normal'));

            if (meta) {
                this.setBeat(meta);
            } else {
                const padded = String(chNum).padStart(2, '0');
                this.chapterStamp = `CH.${padded} // SECTOR ${padded}`;
            }

            const nextUrl = imageUrl || `assets/v11/chapters/ch${chNum}.jpg`;
            if (nextUrl !== this.currentImageUrl) {
                this.currentImageUrl = nextUrl;
                if (this.backdropImg) {
                    this.prevBackdropImg = this.backdropImg;
                    this.backdropFade = 0;
                }
                const img = new Image();
                img.onload = () => {
                    this.backdropImg = img;
                    if (!this.prevBackdropImg) this.backdropFade = 1;
                };
                img.src = nextUrl;
            }

            if (chNum !== prevChapter || (meta && meta.forceSlam)) {
                this.triggerIntroSlam();
            }

            this.spawnSceneFleet(chNum);
            this.plasmaBolts = [];
            this.warpRings = [];
            this.hitSparks = [];
            this.beamCycle = 0.6;
            this.particles = Array.from({ length: 54 }, () => this.makeParticle());

            if (this.mood === 'shake' || this.mood === 'tragic') {
                this.triggerImpact(this.mood === 'tragic' ? '#f43f5e' : '#38bdf8');
            }
        }

        spawnSceneFleet(chNum) {
            this.ships = [];
            const playerKey = chNum >= 18 ? 'stealth_jet' : (chNum >= 14 ? 'stealth_jet' : 'fighter');
            // Lead hero interceptor
            this.ships.push({
                role: 'player',
                key: playerKey,
                x: 90,
                y: 232 + (chNum % 3) * 18,
                vx: 58 + (chNum % 3) * 10,
                scale: playerKey === 'fighter' ? 0.62 : 0.28,
                bobAmp: 10,
                phase: 0,
                fireTimer: 0.45,
                warpTimer: 0.9,
                trail: []
            });

            // Escort wingman or heavy support in later acts / dogfight chapters
            if (chNum >= 5 && chNum !== 22) {
                const escortKey = chNum === 15 || chNum === 2 ? 'carrier_ship' : 'fighter';
                this.ships.push({
                    role: 'player',
                    key: escortKey,
                    x: -35,
                    y: escortKey === 'carrier_ship' ? 280 : 172,
                    vx: escortKey === 'carrier_ship' ? 26 : 64,
                    scale: escortKey === 'carrier_ship' ? 0.48 : 0.46,
                    bobAmp: escortKey === 'carrier_ship' ? 5 : 13,
                    phase: 1.4,
                    fireTimer: 1.1,
                    warpTimer: 1.8,
                    trail: []
                });
            }

            // Enemy dreadnought / colossus / interceptor flank
            let enemyKey = 'alien_drone';
            let enemyScale = 0.56;
            if (chNum >= 23) {
                enemyKey = 'colossus_boss';
                enemyScale = 0.54;
            } else if (chNum >= 17 || chNum === 8 || chNum === 10) {
                enemyKey = chNum >= 21 ? 'colossus_boss' : 'carrier_ship';
                enemyScale = enemyKey === 'colossus_boss' ? 0.48 : 0.52;
            } else if (chNum === 3 || chNum === 6 || chNum === 7) {
                enemyKey = 'boss_core';
                enemyScale = 0.68;
            } else if (chNum >= 11) {
                enemyKey = 'ufo';
                enemyScale = 0.62;
            }

            this.ships.push({
                role: 'enemy',
                key: enemyKey,
                x: this.W * 0.76,
                y: 148,
                vx: enemyKey === 'colossus_boss' || enemyKey === 'carrier_ship' ? -14 : -32,
                scale: enemyScale,
                bobAmp: 9,
                phase: 2.3,
                fireTimer: 1.4,
                trail: []
            });
        }

        makeParticle() {
            const isHot = this.mood === 'alert' || this.mood === 'tragic' || this.mood === 'shake';
            const isWarp = this.mood === 'warp';
            return {
                x: Math.random() * this.W,
                y: Math.random() * this.H,
                vx: (isWarp ? -220 : -36) - Math.random() * 54,
                vy: (Math.random() - 0.5) * 20,
                size: 1.3 + Math.random() * 2.6,
                color: isHot
                    ? (Math.random() < 0.55 ? '#fb7185' : '#fbbf24')
                    : (isWarp ? '#34d399' : '#38bdf8'),
                alpha: 0.3 + Math.random() * 0.65
            };
        }

        triggerImpact(color, originX, originY) {
            this.shakeTimer = 0.55;
            this.flashAlpha = 0.42;
            this.flashColor = color || '#fb7185';
            this.shockwaves.push({
                x: typeof originX === 'number' ? originX : this.W * (0.42 + Math.random() * 0.32),
                y: typeof originY === 'number' ? originY : this.H * (0.28 + Math.random() * 0.26),
                radius: 12,
                maxRadius: 270,
                life: 0,
                duration: 0.78,
                color: color || '#fb7185'
            });
        }

        spawnHitSparks(x, y, color, count) {
            const total = count || 12;
            for (let i = 0; i < total; i++) {
                const ang = Math.random() * Math.PI * 2;
                const spd = 65 + Math.random() * 175;
                this.hitSparks.push({
                    x,
                    y,
                    vx: Math.cos(ang) * spd,
                    vy: Math.sin(ang) * spd,
                    life: 0,
                    duration: 0.25 + Math.random() * 0.3,
                    size: 1.6 + Math.random() * 2.2,
                    color: color || '#38bdf8'
                });
            }
        }

        typeDialogue(text, targetEl, onAudioCue) {
            this.fullText = String(text || '');
            this.typedText = '';
            this.typeTargetEl = targetEl;
            this.typeDone = false;
            this.typeTimer = 0;
            this.autoBeatTimer = 0;
            if (targetEl) targetEl.textContent = '';
            if (typeof this.onTypeStateChange === 'function') this.onTypeStateChange(true);
            if (typeof onAudioCue === 'function') onAudioCue();
        }

        skipTypewriter() {
            if (!this.typeDone) {
                this.typeDone = true;
                this.typedText = this.fullText;
                if (this.typeTargetEl) this.typeTargetEl.textContent = this.fullText;
                if (typeof this.onTypeStateChange === 'function') this.onTypeStateChange(false);
                return true;
            }
            return false;
        }

        setAutoPlay(val) {
            this.autoPlay = Boolean(val);
            this.autoBeatTimer = 0;
        }

        start() {
            if (this.running) return;
            this.running = true;
            this.lastTs = performance.now();
            const tick = (now) => {
                if (!this.running) return;
                const dt = Math.min(0.05, Math.max(0.001, (now - this.lastTs) / 1000));
                this.lastTs = now;
                this.update(dt);
                this.render();
                this.rafId = requestAnimationFrame(tick);
            };
            this.rafId = requestAnimationFrame(tick);
        }

        stop() {
            this.running = false;
            if (this.rafId) cancelAnimationFrame(this.rafId);
            this.rafId = 0;
        }

        update(dt) {
            this.time += dt;
            if (this.shakeTimer > 0) this.shakeTimer = Math.max(0, this.shakeTimer - dt);
            if (this.flashAlpha > 0) this.flashAlpha = Math.max(0, this.flashAlpha - dt * 1.45);
            if (this.introSlamTimer > 0) this.introSlamTimer = Math.max(0, this.introSlamTimer - dt);
            if (this.backdropFade < 1) {
                this.backdropFade = Math.min(1, this.backdropFade + dt * 2.4);
                if (this.backdropFade >= 1) this.prevBackdropImg = null;
            }

            // Typewriter cadence (~52 chars/sec)
            if (!this.typeDone && this.fullText) {
                this.typeTimer += dt * 52;
                const chars = Math.min(this.fullText.length, Math.floor(this.typeTimer));
                if (chars > this.typedText.length) {
                    this.typedText = this.fullText.slice(0, chars);
                    if (this.typeTargetEl) this.typeTargetEl.textContent = this.typedText;
                }
                if (chars >= this.fullText.length) {
                    this.typeDone = true;
                    this.autoBeatTimer = 0;
                    if (typeof this.onTypeStateChange === 'function') this.onTypeStateChange(false);
                }
            } else if (this.autoPlay && this.typeDone && this.fullText) {
                this.autoBeatTimer += dt;
                if (this.autoBeatTimer >= 4.6 && typeof this.onAutoNext === 'function') {
                    this.autoBeatTimer = -999;
                    this.onAutoNext();
                }
            }

            // Animate parallax starfield
            const starMult = this.mood === 'warp' ? 4.8 : (this.chapterId >= 19 ? 1.85 : 1.0);
            for (const s of this.stars) {
                s.x -= (20 * s.z * starMult) * dt;
                if (s.x < 0) {
                    s.x = this.W;
                    s.y = Math.random() * this.H;
                }
            }

            // Animate Act IV vortex dust
            if (this.chapterId >= 19 || this.mood === 'tragic') {
                for (const vd of this.vortexDust) {
                    vd.angle += vd.speed * dt;
                    vd.radius -= dt * 22;
                    if (vd.radius < 12) {
                        vd.radius = 165 + Math.random() * 35;
                        vd.angle = Math.random() * Math.PI * 2;
                    }
                }
            }

            // Animate ships, trails, plasma fire, and warp rings
            const enemyCraft = this.ships.find((s) => s.role === 'enemy') || null;
            for (const sh of this.ships) {
                sh.x += sh.vx * dt;
                if (sh.vx > 0 && sh.x > this.W + 130) {
                    sh.x = -120;
                    sh.trail = [];
                }
                if (sh.vx < 0 && sh.x < -150) {
                    sh.x = this.W + 130;
                    sh.trail = [];
                }

                const curY = sh.y + Math.sin(this.time * 2.1 + sh.phase) * sh.bobAmp;
                sh.trail.push({ x: sh.x, y: curY });
                if (sh.trail.length > 14) sh.trail.shift();

                if (sh.role === 'player' && sh.key !== 'carrier_ship') {
                    sh.fireTimer -= dt;
                    if (sh.fireTimer <= 0 && sh.x > 40 && sh.x < this.W - 80) {
                        sh.fireTimer = (this.mood === 'alert' || this.mood === 'shake' || this.mood === 'tragic') ? 0.65 : 1.35;
                        const aimVy = enemyCraft ? ((enemyCraft.y - curY) * 0.38) : (Math.random() - 0.5) * 28;
                        this.plasmaBolts.push({
                            x: sh.x + 22,
                            y: curY + (Math.random() < 0.5 ? -6 : 6),
                            vx: 540,
                            vy: Math.max(-140, Math.min(140, aimVy)),
                            color: this.mood === 'warp' ? '#34d399' : '#38bdf8',
                            life: 0,
                            maxLife: 1.8
                        });
                    }

                    sh.warpTimer -= dt;
                    if (sh.warpTimer <= 0 && (this.mood === 'warp' || this.chapterId % 2 === 0)) {
                        sh.warpTimer = this.mood === 'warp' ? 0.68 : 1.9;
                        if (sh.x > 30 && sh.x < this.W - 60) {
                            this.warpRings.push({
                                x: sh.x - 20,
                                y: curY,
                                rx: 6,
                                ry: 16,
                                life: 0,
                                duration: 0.72,
                                color: this.mood === 'warp' ? '#34d399' : '#38bdf8'
                            });
                        }
                    }
                }
            }

            // Update plasma bolts & impact sparks
            for (let i = this.plasmaBolts.length - 1; i >= 0; i--) {
                const b = this.plasmaBolts[i];
                b.x += b.vx * dt;
                b.y += b.vy * dt;
                b.life += dt;
                let hit = false;
                if (enemyCraft) {
                    const ey = enemyCraft.y + Math.sin(this.time * 2.1 + enemyCraft.phase) * enemyCraft.bobAmp;
                    if (Math.hypot(b.x - enemyCraft.x, b.y - ey) < 38) {
                        hit = true;
                        this.spawnHitSparks(b.x, b.y, '#fbbf24', 10);
                    }
                }
                if (hit || b.x > this.W + 40 || b.life >= b.maxLife) {
                    this.plasmaBolts.splice(i, 1);
                }
            }

            // Update warp rings
            for (let i = this.warpRings.length - 1; i >= 0; i--) {
                const wr = this.warpRings[i];
                wr.life += dt;
                wr.x -= 48 * dt;
                if (wr.life >= wr.duration) this.warpRings.splice(i, 1);
            }

            // Update crimson enemy beam cycle (alert / tragic / shake moods)
            const isCombatMood = this.mood === 'alert' || this.mood === 'tragic' || this.mood === 'shake';
            if (isCombatMood && enemyCraft) {
                this.beamCycle = (this.beamCycle + dt) % 4.2;
            } else {
                this.beamCycle = 0;
            }

            // Update shockwaves
            for (let i = this.shockwaves.length - 1; i >= 0; i--) {
                const sw = this.shockwaves[i];
                sw.life += dt;
                if (sw.life >= sw.duration) this.shockwaves.splice(i, 1);
            }

            // Update sparks & hit sparks
            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                if (p.x < -20 || p.y < -20 || p.y > this.H + 20) {
                    this.particles[i] = this.makeParticle();
                    this.particles[i].x = this.W + 10;
                }
            }
            for (let i = this.hitSparks.length - 1; i >= 0; i--) {
                const hs = this.hitSparks[i];
                hs.x += hs.vx * dt;
                hs.y += hs.vy * dt;
                hs.vx *= 0.94;
                hs.vy *= 0.94;
                hs.life += dt;
                if (hs.life >= hs.duration) this.hitSparks.splice(i, 1);
            }
        }

        renderSpatialRiftVortex(g) {
            const isCh24 = this.chapterId === 24;
            const isAct4 = this.chapterId >= 19;
            if (!isAct4 && !(this.mood === 'warp' && this.chapterId >= 14)) return;

            const vx = this.W * (isCh24 ? 0.69 : 0.74);
            const vy = this.H * 0.36;
            const intensity = isCh24 ? 1.0 : (isAct4 ? 0.72 : 0.42);
            const baseR = isCh24 ? 165 : 122;

            g.save();
            g.translate(vx, vy);

            // Outer nebula radial glow
            const outerGlow = g.createRadialGradient(0, 0, 8, 0, 0, baseR * 1.45);
            outerGlow.addColorStop(0, `rgba(12, 4, 24, ${0.88 * intensity})`);
            outerGlow.addColorStop(0.28, `rgba(168, 85, 247, ${0.36 * intensity})`);
            outerGlow.addColorStop(0.58, `rgba(244, 63, 94, ${0.24 * intensity})`);
            outerGlow.addColorStop(1, 'rgba(15, 10, 26, 0)');
            g.fillStyle = outerGlow;
            g.beginPath();
            g.arc(0, 0, baseR * 1.45, 0, Math.PI * 2);
            g.fill();

            // Swirling portal vortex sprite blended underneath procedural arms
            const vortexSprite = this.sprites.portal_vortex;
            if (vortexSprite) {
                g.save();
                g.globalCompositeOperation = 'screen';
                g.globalAlpha = 0.58 * intensity;
                g.rotate(-this.time * 0.95);
                const sSize = baseR * 1.68;
                g.drawImage(vortexSprite, -sSize * 0.5, -sSize * 0.5, sSize, sSize);
                g.restore();
            }

            // Procedural purple/crimson spiral singularity arms
            g.save();
            g.globalCompositeOperation = 'lighter';
            const armCount = isCh24 ? 5 : 3;
            for (let a = 0; a < armCount; a++) {
                const startAng = this.time * (isCh24 ? 1.4 : 0.95) + (a * Math.PI * 2) / armCount;
                g.beginPath();
                for (let step = 0; step <= 26; step++) {
                    const t = step / 26;
                    const r = 14 + t * baseR;
                    const ang = startAng - t * 2.9;
                    const px = Math.cos(ang) * r * 1.12;
                    const py = Math.sin(ang) * r * 0.78;
                    if (step === 0) g.moveTo(px, py);
                    else g.lineTo(px, py);
                }
                g.strokeStyle = a % 2 === 0
                    ? `rgba(192, 132, 252, ${0.38 * intensity})`
                    : `rgba(251, 113, 133, ${0.34 * intensity})`;
                g.lineWidth = isCh24 ? 3.2 : 2.2;
                g.stroke();
            }
            g.restore();

            // Spiraling rift dust pulled into singularity
            for (const vd of this.vortexDust) {
                const rNorm = Math.min(1, vd.radius / 180);
                const px = Math.cos(vd.angle) * vd.radius * 1.1;
                const py = Math.sin(vd.angle) * vd.radius * 0.76;
                g.globalAlpha = (1 - rNorm * 0.45) * 0.8 * intensity;
                g.fillStyle = vd.hue;
                g.beginPath();
                g.arc(px, py, vd.size, 0, Math.PI * 2);
                g.fill();
            }

            // Dark event horizon center with thin magenta photon ring
            g.globalAlpha = 0.95 * intensity;
            g.fillStyle = '#030108';
            g.beginPath();
            g.ellipse(0, 0, isCh24 ? 22 : 15, isCh24 ? 17 : 12, -0.25, 0, Math.PI * 2);
            g.fill();
            g.strokeStyle = isCh24 ? 'rgba(253, 164, 175, 0.75)' : 'rgba(192, 132, 252, 0.65)';
            g.lineWidth = 2;
            g.stroke();

            g.restore();
        }

        renderEnemyBeamSweep(g, enemy) {
            if (!enemy || this.beamCycle <= 0) return;
            const ey = enemy.y + Math.sin(this.time * 2.1 + enemy.phase) * enemy.bobAmp;
            const mx = enemy.x - 18;
            const my = ey + 6;

            // Phase 1: Charge telegraph (1.2s -> 2.35s)
            if (this.beamCycle >= 1.2 && this.beamCycle < 2.35) {
                const p = (this.beamCycle - 1.2) / 1.15;
                const sweepAngle = 2.75 + p * 0.35;
                const tx = mx + Math.cos(sweepAngle) * 760;
                const ty = my + Math.sin(sweepAngle) * 760;

                g.save();
                g.setLineDash([10, 8]);
                g.lineDashOffset = -this.time * 120;
                g.strokeStyle = `rgba(251, 113, 133, ${(0.3 + p * 0.55).toFixed(3)})`;
                g.lineWidth = 1.5 + p * 1.5;
                g.beginPath();
                g.moveTo(mx, my);
                g.lineTo(tx, ty);
                g.stroke();
                g.setLineDash([]);

                // Pulsing crimson charge reticle on enemy cannon
                const ringR = (1 - p) * 24 + 6;
                g.strokeStyle = `rgba(244, 63, 94, ${(0.5 + p * 0.5).toFixed(3)})`;
                g.lineWidth = 2;
                g.beginPath();
                g.arc(mx, my, ringR, 0, Math.PI * 2);
                g.stroke();
                g.restore();
            }

            // Phase 2: Crimson beam sweep fire (2.35s -> 3.25s)
            if (this.beamCycle >= 2.35 && this.beamCycle < 3.25) {
                const p = (this.beamCycle - 2.35) / 0.9;
                const fade = p < 0.15 ? p / 0.15 : (p > 0.78 ? (1 - p) / 0.22 : 1);
                const sweepAngle = 3.1 - p * 0.65;
                const tx = mx + Math.cos(sweepAngle) * 900;
                const ty = my + Math.sin(sweepAngle) * 900;

                g.save();
                g.globalCompositeOperation = 'lighter';
                // Outer crimson bloom
                g.strokeStyle = `rgba(244, 63, 94, ${(0.42 * fade).toFixed(3)})`;
                g.lineWidth = 22 * fade;
                g.lineCap = 'round';
                g.beginPath();
                g.moveTo(mx, my);
                g.lineTo(tx, ty);
                g.stroke();

                // Mid laser sheath
                g.strokeStyle = `rgba(251, 113, 133, ${(0.82 * fade).toFixed(3)})`;
                g.lineWidth = 8 * fade;
                g.beginPath();
                g.moveTo(mx, my);
                g.lineTo(tx, ty);
                g.stroke();

                // Incandescent white inner core
                g.strokeStyle = `rgba(255, 241, 242, ${(0.95 * fade).toFixed(3)})`;
                g.lineWidth = 2.6 * fade;
                g.beginPath();
                g.moveTo(mx, my);
                g.lineTo(tx, ty);
                g.stroke();

                // Muzzle flare
                const flare = g.createRadialGradient(mx, my, 2, mx, my, 36 * fade);
                flare.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
                flare.addColorStop(0.4, 'rgba(244, 63, 94, 0.75)');
                flare.addColorStop(1, 'rgba(244, 63, 94, 0)');
                g.fillStyle = flare;
                g.beginPath();
                g.arc(mx, my, 36 * fade, 0, Math.PI * 2);
                g.fill();
                g.restore();
            }
        }

        renderSaraTelemetryHud(g) {
            if (!this.isSaraActive()) return;
            const cx = 56;
            const cy = 78;
            const typing = !this.typeDone;

            g.save();
            // Subtle dark glass backing pill for crystal-clear telemetry contrast
            g.fillStyle = 'rgba(7, 11, 18, 0.62)';
            g.strokeStyle = 'rgba(56, 189, 248, 0.36)';
            g.lineWidth = 1;
            roundRectPath(g, 18, 42, 236, 70, 10);
            g.fill();
            g.stroke();

            // Outer rotating orbital targeting arcs
            g.translate(cx, cy);
            g.save();
            g.rotate(this.time * 1.15);
            g.strokeStyle = 'rgba(34, 211, 238, 0.85)';
            g.lineWidth = 1.6;
            for (let i = 0; i < 3; i++) {
                const a0 = i * ((Math.PI * 2) / 3);
                g.beginPath();
                g.arc(0, 0, 22, a0, a0 + 1.25);
                g.stroke();
            }
            g.restore();

            // Inner counter-rotating hexagon
            g.save();
            g.rotate(-this.time * 0.75);
            const pulse = 1 + Math.sin(this.time * (typing ? 10 : 3)) * (typing ? 0.1 : 0.04);
            const hr = 13 * pulse;
            g.beginPath();
            for (let i = 0; i < 6; i++) {
                const ang = (i * Math.PI) / 3;
                const px = Math.cos(ang) * hr;
                const py = Math.sin(ang) * hr;
                if (i === 0) g.moveTo(px, py);
                else g.lineTo(px, py);
            }
            g.closePath();
            g.fillStyle = 'rgba(56, 189, 248, 0.16)';
            g.fill();
            g.strokeStyle = '#38bdf8';
            g.lineWidth = 1.4;
            g.stroke();

            // Center core dot
            g.fillStyle = '#67e8f9';
            g.beginPath();
            g.arc(0, 0, 3.2, 0, Math.PI * 2);
            g.fill();
            g.restore();
            g.restore();

            // Telemetry Header + Live Voice Frequency Waveform
            g.save();
            g.fillStyle = '#67e8f9';
            g.font = '700 10px "JetBrains Mono", monospace';
            g.fillText('S.A.R.A. // TELEMETRY LINK', 90, 62);

            // Live signal dot
            const dotPulse = 0.55 + 0.45 * Math.sin(this.time * 7);
            g.fillStyle = `rgba(52, 211, 153, ${dotPulse.toFixed(2)})`;
            g.beginPath();
            g.arc(240, 58, 3, 0, Math.PI * 2);
            g.fill();

            // Voice Frequency Waveform Bars
            const barCount = 20;
            const startX = 92;
            const baseY = 92;
            for (let i = 0; i < barCount; i++) {
                const wave = Math.sin(this.time * (typing ? 18 : 4.2) + i * 0.65)
                    * Math.cos(this.time * (typing ? 9.5 : 2.1) - i * 0.35);
                const h = typing
                    ? 4 + Math.abs(wave) * 18
                    : 2.5 + Math.abs(wave) * 4.5;
                g.fillStyle = i % 3 === 0 ? '#22d3ee' : '#38bdf8';
                g.globalAlpha = typing ? 0.92 : 0.55;
                g.fillRect(startX + i * 7.2, baseY - h * 0.5, 4, h);
            }
            g.restore();
        }

        renderHostileSignalHud(g) {
            if (!this.isHostileSpeaker()) return;
            g.save();
            const pulse = 0.55 + 0.45 * Math.sin(this.time * 8);
            g.fillStyle = 'rgba(24, 8, 16, 0.68)';
            g.strokeStyle = `rgba(251, 113, 133, ${(0.35 + pulse * 0.35).toFixed(2)})`;
            g.lineWidth = 1;
            roundRectPath(g, this.W - 220, 42, 200, 32, 8);
            g.fill();
            g.stroke();

            g.fillStyle = `rgba(251, 113, 133, ${(0.65 + pulse * 0.35).toFixed(2)})`;
            g.beginPath();
            g.arc(this.W - 203, 58, 4, 0, Math.PI * 2);
            g.fill();

            g.fillStyle = '#fda4af';
            g.font = '700 10px "JetBrains Mono", monospace';
            g.fillText('HOSTILE INTERCEPT // LOCKED', this.W - 190, 62);
            g.restore();
        }

        renderChapterIntroSlam(g) {
            if (this.introSlamTimer <= 0) return;
            const elapsed = this.introSlamDuration - this.introSlamTimer;
            const enterT = Math.min(1, elapsed / 0.42);
            const exitT = this.introSlamTimer < 0.55 ? (this.introSlamTimer / 0.55) : 1;
            const alpha = easeOutCubic(enterT) * exitT;
            const snapScale = 1 + (1 - easeOutCubic(enterT)) * 0.45;

            const cx = this.W * 0.5;
            const cy = this.H * 0.34;
            const accent = this.chapterId >= 19
                ? '#fb7185'
                : (this.chapterId >= 13 ? '#f59e0b' : (this.chapterId >= 7 ? '#a78bfa' : '#38bdf8'));

            g.save();
            g.globalAlpha = alpha;
            g.translate(cx, cy);
            g.scale(snapScale, snapScale);

            // Translucent sci-fi sector reticle
            g.save();
            g.rotate(this.time * 0.45);
            g.strokeStyle = accent;
            g.globalAlpha = alpha * 0.45;
            g.lineWidth = 1.5;
            g.setLineDash([18, 12]);
            g.beginPath();
            g.arc(0, 0, 74, 0, Math.PI * 2);
            g.stroke();
            g.setLineDash([]);
            g.restore();

            // Reticle corner brackets
            const bw = 185;
            const bh = 38;
            g.strokeStyle = accent;
            g.lineWidth = 2;
            const corner = 12;
            [
                [-bw, -bh, 1, 1],
                [bw, -bh, -1, 1],
                [-bw, bh, 1, -1],
                [bw, bh, -1, -1]
            ].forEach(([x, y, sx, sy]) => {
                g.beginPath();
                g.moveTo(x, y + sy * corner);
                g.lineTo(x, y);
                g.lineTo(x + sx * corner, y);
                g.stroke();
            });

            // Stamp pill backdrop
            g.fillStyle = 'rgba(7, 11, 18, 0.78)';
            roundRectPath(g, -bw + 6, -bh + 4, (bw - 6) * 2, (bh - 4) * 2, 8);
            g.fill();

            // Stamp text (e.g. CH.01 // SECTOR 01)
            g.textAlign = 'center';
            g.fillStyle = accent;
            g.font = '700 13px "JetBrains Mono", monospace';
            g.fillText(this.chapterStamp, 0, -6);

            // Chapter Title line
            if (this.chapterTitle) {
                g.fillStyle = '#f8fafc';
                g.font = '700 18px "Space Grotesk", "Inter", sans-serif';
                const clipped = this.chapterTitle.length > 42
                    ? this.chapterTitle.slice(0, 40) + '…'
                    : this.chapterTitle;
                g.fillText(clipped, 0, 18);
            }

            g.restore();
        }

        render() {
            const g = this.ctx;
            if (!g) return;
            g.save();
            g.clearRect(0, 0, this.W, this.H);

            // Damped camera shake
            if (this.shakeTimer > 0) {
                const mag = this.shakeTimer * 15;
                g.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
            }

            // Ken Burns animated zoom/pan backdrop with smooth crossfade
            const zoom = 1.07 + Math.sin(this.time * 0.21) * 0.045;
            const panX = Math.sin(this.time * 0.15) * 22;
            const panY = Math.cos(this.time * 0.18) * 13;
            const dw = this.W * zoom;
            const dh = this.H * zoom;
            const bx = (this.W - dw) * 0.5 + panX;
            const by = (this.H - dh) * 0.5 + panY;

            if (this.prevBackdropImg && this.backdropFade < 1) {
                drawCoverImage(g, this.prevBackdropImg, bx, by, dw, dh);
            }
            if (this.backdropImg) {
                g.save();
                g.globalAlpha = this.backdropFade;
                drawCoverImage(g, this.backdropImg, bx, by, dw, dh);
                g.restore();
            } else if (!this.prevBackdropImg) {
                g.fillStyle = '#070b12';
                g.fillRect(0, 0, this.W, this.H);
            }

            // Atmospheric mood tint & gradient scrim
            const grad = g.createLinearGradient(0, 0, 0, this.H);
            if (this.mood === 'tragic') {
                grad.addColorStop(0, 'rgba(88, 28, 135, 0.24)');
                grad.addColorStop(0.45, 'rgba(127, 29, 29, 0.18)');
                grad.addColorStop(1, 'rgba(5, 8, 15, 0.90)');
            } else if (this.mood === 'alert' || this.mood === 'shake') {
                grad.addColorStop(0, 'rgba(127, 29, 29, 0.28)');
                grad.addColorStop(0.5, 'rgba(7, 11, 18, 0.12)');
                grad.addColorStop(1, 'rgba(5, 8, 15, 0.88)');
            } else if (this.mood === 'warp') {
                grad.addColorStop(0, 'rgba(6, 78, 59, 0.22)');
                grad.addColorStop(0.5, 'rgba(15, 23, 42, 0.10)');
                grad.addColorStop(1, 'rgba(5, 8, 15, 0.88)');
            } else {
                grad.addColorStop(0, 'rgba(7, 11, 18, 0.26)');
                grad.addColorStop(0.5, 'rgba(7, 11, 18, 0.10)');
                grad.addColorStop(1, 'rgba(5, 8, 15, 0.88)');
            }
            g.fillStyle = grad;
            g.fillRect(0, 0, this.W, this.H);

            // Act IV / Ch.24 Spatial Rift Vortex
            this.renderSpatialRiftVortex(g);

            // Moving parallax stars
            for (const s of this.stars) {
                const twinkle = 0.72 + 0.28 * Math.sin(this.time * 3.1 + s.twinkle);
                g.fillStyle = `rgba(226, 232, 240, ${(s.alpha * twinkle).toFixed(3)})`;
                const len = this.mood === 'warp' ? 18 : (this.chapterId >= 19 ? 4.5 : 2);
                g.fillRect(s.x, s.y, len, s.z * 1.15);
            }

            // Warp Rings behind starships
            for (const wr of this.warpRings) {
                const t = wr.life / wr.duration;
                const scale = 1 + t * 2.2;
                g.save();
                g.globalAlpha = (1 - t) * 0.75;
                g.strokeStyle = wr.color;
                g.lineWidth = 2.2 * (1 - t * 0.5);
                g.beginPath();
                g.ellipse(wr.x, wr.y, wr.rx * scale, wr.ry * scale, 0, 0, Math.PI * 2);
                g.stroke();
                g.restore();
            }

            // Enemy Dreadnought Crimson Beam Sweep
            const enemyCraft = this.ships.find((s) => s.role === 'enemy');
            if (enemyCraft) this.renderEnemyBeamSweep(g, enemyCraft);

            // Animated ships, engine ribbons & craft sprites
            for (const sh of this.ships) {
                const im = this.sprites[sh.key];
                if (!im) continue;
                const byShip = sh.y + Math.sin(this.time * 2.1 + sh.phase) * sh.bobAmp;
                const w = im.width * sh.scale;
                const h = im.height * sh.scale;

                // Thruster motion ribbon trail
                if (sh.role === 'player' && sh.trail.length > 2) {
                    g.save();
                    g.globalCompositeOperation = 'lighter';
                    for (let tIdx = 1; tIdx < sh.trail.length; tIdx++) {
                        const prev = sh.trail[tIdx - 1];
                        const cur = sh.trail[tIdx];
                        if (Math.abs(cur.x - prev.x) > 80) continue;
                        const alpha = (tIdx / sh.trail.length) * 0.42;
                        g.strokeStyle = this.mood === 'warp'
                            ? `rgba(52, 211, 153, ${alpha.toFixed(3)})`
                            : `rgba(56, 189, 248, ${alpha.toFixed(3)})`;
                        g.lineWidth = (tIdx / sh.trail.length) * 5;
                        g.beginPath();
                        g.moveTo(prev.x - 16, prev.y);
                        g.lineTo(cur.x - 16, cur.y);
                        g.stroke();
                    }
                    g.restore();
                }

                g.save();
                g.translate(sh.x, byShip);
                if (sh.vx < 0 && sh.role === 'player') g.scale(-1, 1);

                // Engine thruster flare
                if (sh.role === 'player') {
                    const engGrad = g.createLinearGradient(-w * 0.95, 0, -w * 0.25, 0);
                    engGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
                    engGrad.addColorStop(1, this.mood === 'tragic' ? 'rgba(251, 113, 133, 0.85)' : 'rgba(56, 189, 248, 0.85)');
                    g.fillStyle = engGrad;
                    g.fillRect(-w * 0.95, -3.5, w * 0.72, 7);
                }

                const meta = SPRITE_META[sh.key] || { baseRot: 0 };
                if (meta.baseRot) g.rotate(meta.baseRot);
                g.globalAlpha = 0.94;
                g.drawImage(im, -w * 0.5, -h * 0.5, w, h);
                g.restore();
            }

            // Glowing Plasma Bolts
            if (this.plasmaBolts.length > 0) {
                g.save();
                g.globalCompositeOperation = 'lighter';
                for (const b of this.plasmaBolts) {
                    const ang = Math.atan2(b.vy, b.vx);
                    g.save();
                    g.translate(b.x, b.y);
                    g.rotate(ang);
                    const boltGrad = g.createLinearGradient(-22, 0, 6, 0);
                    boltGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
                    boltGrad.addColorStop(0.65, b.color);
                    boltGrad.addColorStop(1, '#ffffff');
                    g.fillStyle = boltGrad;
                    roundRectPath(g, -22, -2.5, 28, 5, 2.5);
                    g.fill();
                    g.restore();
                }
                g.restore();
            }

            // Hit impact sparks
            for (const hs of this.hitSparks) {
                const t = hs.life / hs.duration;
                g.globalAlpha = 1 - t;
                g.fillStyle = hs.color;
                g.beginPath();
                g.arc(hs.x, hs.y, hs.size * (1 - t * 0.4), 0, Math.PI * 2);
                g.fill();
            }
            g.globalAlpha = 1;

            // Foreground embers / energy sparks
            for (const p of this.particles) {
                g.fillStyle = p.color;
                g.globalAlpha = p.alpha;
                g.beginPath();
                g.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                g.fill();
            }
            g.globalAlpha = 1;

            // Chromatic Shockwave Rings on combat/tragic beats
            if (this.shockwaves.length > 0) {
                g.save();
                g.globalCompositeOperation = 'lighter';
                for (const sw of this.shockwaves) {
                    const t = sw.life / sw.duration;
                    const eased = easeOutCubic(t);
                    const r = sw.radius + eased * sw.maxRadius;
                    const alpha = (1 - t) * 0.78;
                    const lw = Math.max(1, (1 - t) * 5.5);

                    // Cyan chromatic offset ring
                    g.strokeStyle = `rgba(56, 189, 248, ${(alpha * 0.85).toFixed(3)})`;
                    g.lineWidth = lw;
                    g.beginPath();
                    g.arc(sw.x - 4 * (1 - t), sw.y, r, 0, Math.PI * 2);
                    g.stroke();

                    // Crimson chromatic offset ring
                    g.strokeStyle = `rgba(244, 63, 94, ${(alpha * 0.85).toFixed(3)})`;
                    g.beginPath();
                    g.arc(sw.x + 4 * (1 - t), sw.y, r * 0.985, 0, Math.PI * 2);
                    g.stroke();

                    // Core ring
                    g.strokeStyle = `rgba(255, 255, 255, ${(alpha * 0.65).toFixed(3)})`;
                    g.lineWidth = Math.max(0.8, lw * 0.45);
                    g.beginPath();
                    g.arc(sw.x, sw.y, r * 0.992, 0, Math.PI * 2);
                    g.stroke();
                }
                g.restore();
            }

            // Danger strobe vignette during alert/tragic beats
            if (this.mood === 'alert' || this.mood === 'tragic') {
                const pulse = (Math.sin(this.time * 4.5) * 0.5 + 0.5) * 0.14;
                g.fillStyle = `rgba(244, 63, 94, ${pulse.toFixed(3)})`;
                g.fillRect(0, 0, this.W, this.H);
            }

            // Subtle chromatic edge aberration flash on impact
            if (this.flashAlpha > 0) {
                g.save();
                g.globalAlpha = this.flashAlpha * 0.45;
                g.fillStyle = this.flashColor;
                g.fillRect(0, 0, this.W, this.H);

                g.globalAlpha = this.flashAlpha * 0.65;
                g.strokeStyle = '#38bdf8';
                g.lineWidth = 8;
                g.strokeRect(4, 30, this.W - 8, this.H - 60);
                g.strokeStyle = '#f43f5e';
                g.lineWidth = 5;
                g.strokeRect(10, 32, this.W - 20, this.H - 64);
                g.restore();
            }

            // S.A.R.A. AI Holographic Telemetry Layer & Hostile Lock
            this.renderSaraTelemetryHud(g);
            this.renderHostileSignalHud(g);

            // Chapter Intro Title Slam
            this.renderChapterIntroSlam(g);

            // Cinema 2.39:1 letterbox bars + hairline + scanline sheen
            g.fillStyle = '#04060b';
            g.fillRect(0, 0, this.W, 28);
            g.fillRect(0, this.H - 28, this.W, 28);

            g.fillStyle = 'rgba(56, 189, 248, 0.22)';
            g.fillRect(0, 28, this.W, 1);
            g.fillRect(0, this.H - 29, this.W, 1);

            g.fillStyle = 'rgba(255,255,255,0.022)';
            for (let y = 30; y < this.H - 30; y += 4) {
                g.fillRect(0, y, this.W, 1);
            }
            g.restore();
        }
    }

    global.CosmicCutscenePlayer = CutscenePlayer;
})(window);
