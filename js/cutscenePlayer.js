// =============================================================================
// COSMIC UNIVERSE v11.5 — ANIMATED SEMI-VIDEO CUTSCENE RENDERER (js/cutscenePlayer.js)
// Combines layered parallax plates, flying starships, spark particles, camera shake,
// 2.39:1 widescreen letterbox, cast portraits, typewriter dialogue & Auto-Play.
// =============================================================================
(function (global) {
    'use strict';

    class CutscenePlayer {
        constructor(options) {
            this.canvas = options.canvas;
            this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
            this.onComplete = options.onComplete || null;

            this.W = 960;
            this.H = 540;
            if (this.canvas) {
                this.canvas.width = this.W;
                this.canvas.height = this.H;
            }

            this.backdropImg = null;
            this.sprites = {};
            this.preloadSprites();

            this.stars = Array.from({ length: 84 }, () => ({
                x: Math.random() * this.W,
                y: Math.random() * this.H,
                z: 0.4 + Math.random() * 1.6,
                alpha: 0.25 + Math.random() * 0.65
            }));

            this.ships = [];
            this.particles = [];
            this.mood = 'normal'; // normal | alert | shake | warp | tragic
            this.time = 0;
            this.shakeTimer = 0;
            this.flashAlpha = 0;
            this.flashColor = '#ffffff';
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
            this.onAutoNext = options.onAutoNext || null;
        }

        preloadSprites() {
            const keys = ['fighter', 'stealth_jet', 'carrier_ship', 'exo_trooper', 'colossus_boss'];
            keys.forEach((k) => {
                const im = new Image();
                im.onload = () => { this.sprites[k] = im; };
                im.src = `assets/v11/sprites/${k}.png`;
            });
        }

        setScene(chapterId, imageUrl, mood) {
            this.mood = mood || (chapterId >= 21 ? 'tragic' : (chapterId >= 17 ? 'alert' : 'normal'));
            const img = new Image();
            img.onload = () => { this.backdropImg = img; };
            img.src = imageUrl || `assets/v11/chapters/ch${chapterId}.jpg`;

            // Spawn stylized moving parallax foreground craft depending on chapter
            this.ships = [];
            const mainKey = chapterId >= 18 ? 'stealth_jet' : (chapterId >= 15 ? 'carrier_ship' : 'fighter');
            this.ships.push({
                key: mainKey,
                x: -60,
                y: 165 + (chapterId % 4) * 24,
                vx: 42 + (chapterId % 3) * 14,
                scale: mainKey === 'carrier_ship' ? 0.56 : 0.34,
                bobAmp: 12,
                phase: 0
            });
            if (chapterId >= 12) {
                this.ships.push({
                    key: chapterId >= 22 ? 'colossus_boss' : 'stealth_jet',
                    x: this.W * 0.72,
                    y: 125,
                    vx: -18,
                    scale: chapterId >= 22 ? 0.44 : 0.24,
                    bobAmp: 8,
                    phase: 2.1
                });
            }

            // Seed atmospheric ember/warp particles
            this.particles = Array.from({ length: 46 }, () => this.makeParticle());
            if (this.mood === 'shake' || this.mood === 'tragic') {
                this.triggerImpact(this.mood === 'tragic' ? '#f43f5e' : '#38bdf8');
            }
        }

        makeParticle() {
            const isHot = this.mood === 'alert' || this.mood === 'tragic' || this.mood === 'shake';
            return {
                x: Math.random() * this.W,
                y: Math.random() * this.H,
                vx: (this.mood === 'warp' ? -180 : -28) - Math.random() * 45,
                vy: (Math.random() - 0.5) * 18,
                size: 1.5 + Math.random() * 2.8,
                color: isHot
                    ? (Math.random() < 0.5 ? '#fb7185' : '#fbbf24')
                    : (this.mood === 'warp' ? '#34d399' : '#38bdf8'),
                alpha: 0.3 + Math.random() * 0.65
            };
        }

        triggerImpact(color) {
            this.shakeTimer = 0.55;
            this.flashAlpha = 0.55;
            this.flashColor = color || '#fb7185';
        }

        typeDialogue(text, targetEl, onAudioCue) {
            this.fullText = String(text || '');
            this.typedText = '';
            this.typeTargetEl = targetEl;
            this.typeDone = false;
            this.typeTimer = 0;
            this.autoBeatTimer = 0;
            if (targetEl) targetEl.textContent = '';
            if (typeof onAudioCue === 'function') onAudioCue();
        }

        skipTypewriter() {
            if (!this.typeDone) {
                this.typeDone = true;
                this.typedText = this.fullText;
                if (this.typeTargetEl) this.typeTargetEl.textContent = this.fullText;
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
            if (this.flashAlpha > 0) this.flashAlpha = Math.max(0, this.flashAlpha - dt * 1.4);

            // Typewriter cadence (~48 chars/sec)
            if (!this.typeDone && this.fullText) {
                this.typeTimer += dt * 48;
                const chars = Math.min(this.fullText.length, Math.floor(this.typeTimer));
                if (chars > this.typedText.length) {
                    this.typedText = this.fullText.slice(0, chars);
                    if (this.typeTargetEl) this.typeTargetEl.textContent = this.typedText;
                }
                if (chars >= this.fullText.length) {
                    this.typeDone = true;
                    this.autoBeatTimer = 0;
                }
            } else if (this.autoPlay && this.typeDone && this.fullText) {
                this.autoBeatTimer += dt;
                if (this.autoBeatTimer >= 4.4 && typeof this.onAutoNext === 'function') {
                    this.autoBeatTimer = -999; // guard single fire per beat
                    this.onAutoNext();
                }
            }

            // Animate stars
            const starMult = this.mood === 'warp' ? 4.2 : 1.0;
            for (const s of this.stars) {
                s.x -= (18 * s.z * starMult) * dt;
                if (s.x < 0) {
                    s.x = this.W;
                    s.y = Math.random() * this.H;
                }
            }

            // Animate craft
            for (const sh of this.ships) {
                sh.x += sh.vx * dt;
                if (sh.vx > 0 && sh.x > this.W + 140) sh.x = -120;
                if (sh.vx < 0 && sh.x < -160) sh.x = this.W + 140;
            }

            // Animate sparks / embers
            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                if (p.x < -20 || p.y < -20 || p.y > this.H + 20) {
                    this.particles[i] = this.makeParticle();
                    this.particles[i].x = this.W + 10;
                }
            }
        }

        render() {
            const g = this.ctx;
            if (!g) return;
            g.save();
            g.clearRect(0, 0, this.W, this.H);

            // Camera shake
            if (this.shakeTimer > 0) {
                const mag = this.shakeTimer * 14;
                g.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
            }

            // Ken Burns animated zoom/pan backdrop
            if (this.backdropImg) {
                const zoom = 1.06 + Math.sin(this.time * 0.22) * 0.045;
                const panX = Math.sin(this.time * 0.16) * 20;
                const panY = Math.cos(this.time * 0.19) * 12;
                const dw = this.W * zoom;
                const dh = this.H * zoom;
                g.drawImage(
                    this.backdropImg,
                    (this.W - dw) * 0.5 + panX,
                    (this.H - dh) * 0.5 + panY,
                    dw,
                    dh
                );
            } else {
                g.fillStyle = '#070b12';
                g.fillRect(0, 0, this.W, this.H);
            }

            // Moody tint & vignette
            const grad = g.createLinearGradient(0, 0, 0, this.H);
            grad.addColorStop(0, this.mood === 'alert' || this.mood === 'tragic' ? 'rgba(127, 29, 29, 0.28)' : 'rgba(7, 11, 18, 0.22)');
            grad.addColorStop(0.5, 'rgba(7, 11, 18, 0.10)');
            grad.addColorStop(1, 'rgba(5, 8, 15, 0.86)');
            g.fillStyle = grad;
            g.fillRect(0, 0, this.W, this.H);

            // Moving parallax stars
            for (const s of this.stars) {
                g.fillStyle = `rgba(226, 232, 240, ${s.alpha})`;
                const len = this.mood === 'warp' ? 14 : 2;
                g.fillRect(s.x, s.y, len, s.z * 1.1);
            }

            // Animated ships / silhouettes flying across plate
            for (const sh of this.ships) {
                const im = this.sprites[sh.key];
                if (!im) continue;
                const by = sh.y + Math.sin(this.time * 2.1 + sh.phase) * sh.bobAmp;
                const w = im.width * sh.scale;
                const h = im.height * sh.scale;
                g.save();
                g.translate(sh.x, by);
                if (sh.vx < 0) g.scale(-1, 1);
                g.globalAlpha = 0.88;
                // Engine thruster trail
                const engGrad = g.createLinearGradient(-w * 0.85, 0, -w * 0.25, 0);
                engGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
                engGrad.addColorStop(1, this.mood === 'tragic' ? 'rgba(251, 113, 133, 0.65)' : 'rgba(56, 189, 248, 0.65)');
                g.fillStyle = engGrad;
                g.fillRect(-w * 0.85, -3, w * 0.6, 6);
                g.drawImage(im, -w * 0.5, -h * 0.5, w, h);
                g.restore();
            }

            // Foreground embers / energy sparks
            for (const p of this.particles) {
                g.fillStyle = p.color;
                g.globalAlpha = p.alpha;
                g.beginPath();
                g.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                g.fill();
            }
            g.globalAlpha = 1;

            // Danger strobe vignette during alert/tragic beats
            if (this.mood === 'alert' || this.mood === 'tragic') {
                const pulse = (Math.sin(this.time * 4.5) * 0.5 + 0.5) * 0.16;
                g.fillStyle = `rgba(244, 63, 94, ${pulse.toFixed(3)})`;
                g.fillRect(0, 0, this.W, this.H);
            }

            // Impact flash
            if (this.flashAlpha > 0) {
                g.globalAlpha = this.flashAlpha;
                g.fillStyle = this.flashColor;
                g.fillRect(0, 0, this.W, this.H);
                g.globalAlpha = 1;
            }

            // Cinema 2.39:1 letterbox bars + film scanline sheen
            g.fillStyle = '#04060b';
            g.fillRect(0, 0, this.W, 28);
            g.fillRect(0, this.H - 28, this.W, 28);

            g.fillStyle = 'rgba(255,255,255,0.025)';
            for (let y = 30; y < this.H - 30; y += 4) {
                g.fillRect(0, y, this.W, 1);
            }
            g.restore();
        }
    }

    global.CosmicCutscenePlayer = CutscenePlayer;
})(window);
