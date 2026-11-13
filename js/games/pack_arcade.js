// =============================================================================
// COSMIC UNIVERSE v11.0 — PACK 4: NEO-PIXEL SPACE ARCADE (js/games/pack_arcade.js)
// 9 Classic Retro-Modern Space Arcade Engines registered on window.COSMIC_GAME_ENGINES
// =============================================================================
(function (global) {
    'use strict';

    const W = 960;
    const H = 540;
    const TAU = Math.PI * 2;

    const PAL = {
        void: '#050811',
        deep: '#091124',
        slate: '#0f172a',
        sky: '#38bdf8',
        mint: '#34d399',
        amber: '#f59e0b',
        coral: '#fb7185',
        violet: '#a78bfa',
        white: '#f8fafc',
        muted: '#94a3b8'
    };

    // -------------------------------------------------------------------------
    // Shared Math & Audio Utilities
    // -------------------------------------------------------------------------
    function clamp(v, lo, hi) {
        return v < lo ? lo : (v > hi ? hi : v);
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function randRange(lo, hi) {
        return lo + Math.random() * (hi - lo);
    }

    function randInt(lo, hi) {
        return Math.floor(lo + Math.random() * (hi - lo + 1));
    }

    function distSq(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return dx * dx + dy * dy;
    }

    function dist(x1, y1, x2, y2) {
        return Math.hypot(x2 - x1, y2 - y1);
    }

    function wrapCoord(v, span) {
        return ((v % span) + span) % span;
    }

    function wrappedDelta(from, to, span) {
        let d = ((to - from) % span + span) % span;
        if (d > span * 0.5) d -= span;
        return d;
    }

    function cubicBezier(p0, p1, p2, p3, t) {
        const u = 1 - t;
        const tt = t * t;
        const uu = u * u;
        return (
            uu * u * p0 +
            3 * uu * t * p1 +
            3 * u * tt * p2 +
            tt * t * p3
        );
    }

    function sfx(ctx, key, jitter) {
        try {
            if (ctx && ctx.audio && typeof ctx.audio.play === 'function') {
                ctx.audio.play(key, jitter);
            }
        } catch (_) { /* ignore audio host errors */ }
    }

    // -------------------------------------------------------------------------
    // Shared Crisp Pixel-Art Sprite & Vector Drawing Helpers
    // -------------------------------------------------------------------------
    function isSpriteReady(img) {
        if (!img) return false;
        if (typeof img.complete === 'boolean') {
            return img.complete && (typeof img.naturalWidth !== 'number' || img.naturalWidth > 0);
        }
        return true;
    }

    function drawSprite(g, sprites, name, x, y, w, h, opts) {
        const o = opts || {};
        const img = sprites && sprites[name];
        const ready = isSpriteReady(img);

        g.save();
        g.translate(x, y);
        if (o.angle) g.rotate(o.angle);
        if (o.flipX || o.flipY) g.scale(o.flipX ? -1 : 1, o.flipY ? -1 : 1);
        if (o.alpha !== undefined) g.globalAlpha = o.alpha;

        if (o.glow) {
            g.shadowColor = o.glow;
            g.shadowBlur = o.glowBlur !== undefined ? o.glowBlur : 12;
        }

        if (ready) {
            g.imageSmoothingEnabled = !!o.smoothing;
            g.drawImage(img, -w * 0.5, -h * 0.5, w, h);
            if (o.hitFlash) {
                g.globalCompositeOperation = 'lighter';
                g.globalAlpha = (o.alpha !== undefined ? o.alpha : 1) * 0.72;
                g.drawImage(img, -w * 0.5, -h * 0.5, w, h);
            }
        } else {
            g.fillStyle = o.fallbackColor || PAL.sky;
            g.strokeStyle = PAL.white;
            g.lineWidth = 1.5;
            if (o.fallbackShape === 'triangle') {
                g.beginPath();
                g.moveTo(0, -h * 0.48);
                g.lineTo(w * 0.42, h * 0.42);
                g.lineTo(-w * 0.42, h * 0.42);
                g.closePath();
                g.fill();
                g.stroke();
            } else if (o.fallbackShape === 'rect') {
                g.fillRect(-w * 0.42, -h * 0.42, w * 0.84, h * 0.84);
                g.strokeRect(-w * 0.42, -h * 0.42, w * 0.84, h * 0.84);
            } else {
                g.beginPath();
                g.arc(0, 0, Math.min(w, h) * 0.42, 0, TAU);
                g.fill();
                g.stroke();
            }
        }
        g.restore();
    }

    function drawRoundRect(g, x, y, w, h, r) {
        const rad = Math.min(r, w * 0.5, h * 0.5);
        g.beginPath();
        g.moveTo(x + rad, y);
        g.arcTo(x + w, y, x + w, y + h, rad);
        g.arcTo(x + w, y + h, x, y + h, rad);
        g.arcTo(x, y + h, x, y, rad);
        g.arcTo(x, y, x + w, y, rad);
        g.closePath();
    }

    function drawPillBadge(g, text, x, y, color, bg) {
        g.save();
        g.font = '700 11px "JetBrains Mono", monospace';
        const padX = 8;
        const tw = g.measureText(text).width;
        const bw = tw + padX * 2;
        const bh = 20;
        drawRoundRect(g, x - bw * 0.5, y - bh * 0.5, bw, bh, 5);
        g.fillStyle = bg || 'rgba(10, 17, 34, 0.86)';
        g.fill();
        g.strokeStyle = color || PAL.sky;
        g.lineWidth = 1.2;
        g.stroke();
        g.fillStyle = color || PAL.white;
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillText(text, x, y + 0.5);
        g.restore();
    }

    // -------------------------------------------------------------------------
    // Shared Starfield, Particle FX, Floating Text & Banners
    // -------------------------------------------------------------------------
    function createStarfield(count, palette) {
        const colors = palette || ['#e2e8f0', '#7dd3fc', '#c4b5fd', '#fde68a', '#6ee7b7'];
        const stars = [];
        for (let i = 0; i < count; i++) {
            const layer = i % 3;
            stars.push({
                x: Math.random() * W,
                y: Math.random() * H,
                layer,
                speed: layer === 0 ? 14 : (layer === 1 ? 34 : 68),
                size: layer === 0 ? 1.2 : (layer === 1 ? 1.8 : 2.5),
                alpha: layer === 0 ? 0.35 : (layer === 1 ? 0.62 : 0.9),
                twinkle: Math.random() * TAU,
                color: colors[i % colors.length]
            });
        }
        return {
            stars,
            update(dt, vx, vy) {
                for (let i = 0; i < stars.length; i++) {
                    const s = stars[i];
                    const mult = s.layer === 0 ? 0.35 : (s.layer === 1 ? 0.7 : 1.15);
                    s.x = wrapCoord(s.x + vx * mult * dt, W);
                    s.y = wrapCoord(s.y + (vy === undefined ? s.speed : vy * mult) * dt, H);
                    s.twinkle += dt * (1.8 + s.layer);
                }
            },
            draw(g, topColor, bottomColor) {
                const grad = g.createLinearGradient(0, 0, 0, H);
                grad.addColorStop(0, topColor || '#040711');
                grad.addColorStop(0.55, '#070d1f');
                grad.addColorStop(1, bottomColor || '#0b142b');
                g.fillStyle = grad;
                g.fillRect(0, 0, W, H);

                for (let i = 0; i < stars.length; i++) {
                    const s = stars[i];
                    const tw = 0.72 + 0.28 * Math.sin(s.twinkle);
                    g.globalAlpha = s.alpha * tw;
                    g.fillStyle = s.color;
                    g.fillRect(Math.round(s.x), Math.round(s.y), s.size, s.size);
                }
                g.globalAlpha = 1;
            }
        };
    }

    function createFxSystem() {
        const particles = [];
        const rings = [];
        const texts = [];
        let shakeTime = 0;
        let shakeMag = 0;
        let banner = null;

        return {
            spawn(x, y, vx, vy, color, size, life, shape) {
                if (particles.length > 420) particles.shift();
                particles.push({
                    x, y, vx, vy,
                    color: color || PAL.sky,
                    size: size || 3,
                    life: life || 0.45,
                    maxLife: life || 0.45,
                    shape: shape || 'square',
                    drag: 0.96
                });
            },
            burst(x, y, count, color, speedMax, size, life) {
                const c = count || 14;
                const sm = speedMax || 190;
                for (let i = 0; i < c; i++) {
                    const ang = Math.random() * TAU;
                    const spd = randRange(sm * 0.25, sm);
                    this.spawn(
                        x, y,
                        Math.cos(ang) * spd,
                        Math.sin(ang) * spd,
                        color,
                        randRange((size || 3) * 0.65, (size || 3) * 1.4),
                        randRange((life || 0.45) * 0.6, (life || 0.45) * 1.25),
                        i % 3 === 0 ? 'glow' : 'square'
                    );
                }
            },
            ring(x, y, maxR, color, life, lineW) {
                if (rings.length > 48) rings.shift();
                rings.push({
                    x, y,
                    r: 4,
                    maxR: maxR || 46,
                    color: color || PAL.sky,
                    life: life || 0.35,
                    maxLife: life || 0.35,
                    lineW: lineW || 2.5
                });
            },
            floatText(x, y, text, color, scale) {
                if (texts.length > 48) texts.shift();
                texts.push({
                    x, y,
                    vy: -42,
                    text: String(text),
                    color: color || PAL.amber,
                    scale: scale || 1,
                    life: 0.95,
                    maxLife: 0.95
                });
            },
            shake(mag, dur) {
                if (mag > shakeMag || shakeTime <= 0) shakeMag = mag;
                shakeTime = Math.max(shakeTime, dur || 0.2);
            },
            showBanner(title, subtitle, color, dur) {
                banner = {
                    title: String(title),
                    subtitle: subtitle ? String(subtitle) : '',
                    color: color || PAL.sky,
                    life: dur || 2.2,
                    maxLife: dur || 2.2
                };
            },
            update(dt) {
                const dragPow = Math.pow(0.92, dt * 60);
                for (let i = particles.length - 1; i >= 0; i--) {
                    const p = particles[i];
                    p.x += p.vx * dt;
                    p.y += p.vy * dt;
                    p.vx *= dragPow;
                    p.vy *= dragPow;
                    p.life -= dt;
                    if (p.life <= 0) particles.splice(i, 1);
                }
                for (let i = rings.length - 1; i >= 0; i--) {
                    const r = rings[i];
                    r.life -= dt;
                    const prog = 1 - clamp(r.life / r.maxLife, 0, 1);
                    r.r = lerp(5, r.maxR, 1 - Math.pow(1 - prog, 2));
                    if (r.life <= 0) rings.splice(i, 1);
                }
                for (let i = texts.length - 1; i >= 0; i--) {
                    const t = texts[i];
                    t.y += t.vy * dt;
                    t.vy *= Math.pow(0.95, dt * 60);
                    t.life -= dt;
                    if (t.life <= 0) texts.splice(i, 1);
                }
                if (shakeTime > 0) {
                    shakeTime = Math.max(0, shakeTime - dt);
                    if (shakeTime <= 0) shakeMag = 0;
                }
                if (banner) {
                    banner.life -= dt;
                    if (banner.life <= 0) banner = null;
                }
            },
            applyShake(g) {
                if (shakeTime > 0 && shakeMag > 0.2) {
                    const ox = (Math.random() - 0.5) * 2 * shakeMag;
                    const oy = (Math.random() - 0.5) * 2 * shakeMag;
                    g.translate(ox, oy);
                }
            },
            drawParticles(g) {
                g.save();
                for (let i = 0; i < rings.length; i++) {
                    const r = rings[i];
                    const a = clamp(r.life / r.maxLife, 0, 1);
                    g.globalAlpha = a * 0.85;
                    g.strokeStyle = r.color;
                    g.lineWidth = r.lineW * a + 0.5;
                    g.beginPath();
                    g.arc(r.x, r.y, r.r, 0, TAU);
                    g.stroke();
                }
                for (let i = 0; i < particles.length; i++) {
                    const p = particles[i];
                    const a = clamp(p.life / p.maxLife, 0, 1);
                    g.globalAlpha = a;
                    g.fillStyle = p.color;
                    const sz = p.size * (0.45 + 0.55 * a);
                    if (p.shape === 'glow') {
                        g.shadowColor = p.color;
                        g.shadowBlur = 8;
                        g.fillRect(p.x - sz * 0.5, p.y - sz * 0.5, sz, sz);
                        g.shadowBlur = 0;
                    } else {
                        g.fillRect(p.x - sz * 0.5, p.y - sz * 0.5, sz, sz);
                    }
                }
                g.restore();
            },
            drawOverlays(g) {
                g.save();
                g.textAlign = 'center';
                g.textBaseline = 'middle';
                for (let i = 0; i < texts.length; i++) {
                    const t = texts[i];
                    const a = clamp(t.life / t.maxLife, 0, 1);
                    g.globalAlpha = Math.min(1, a * 1.35);
                    g.font = '700 ' + Math.round(13 * t.scale) + 'px "JetBrains Mono", monospace';
                    g.fillStyle = 'rgba(5, 8, 17, 0.85)';
                    g.fillText(t.text, t.x + 1, t.y + 1);
                    g.fillStyle = t.color;
                    g.fillText(t.text, t.x, t.y);
                }
                if (banner) {
                    const prog = 1 - banner.life / banner.maxLife;
                    const alpha = prog < 0.14 ? prog / 0.14 : (prog > 0.78 ? (1 - prog) / 0.22 : 1);
                    g.globalAlpha = clamp(alpha, 0, 1);
                    drawRoundRect(g, W * 0.5 - 230, 84, 460, banner.subtitle ? 64 : 46, 12);
                    g.fillStyle = 'rgba(7, 12, 26, 0.88)';
                    g.fill();
                    g.strokeStyle = banner.color;
                    g.lineWidth = 1.6;
                    g.stroke();
                    g.shadowColor = banner.color;
                    g.shadowBlur = 14;
                    g.font = '700 22px "Space Grotesk", sans-serif';
                    g.fillStyle = PAL.white;
                    g.fillText(banner.title, W * 0.5, banner.subtitle ? 106 : 107);
                    g.shadowBlur = 0;
                    if (banner.subtitle) {
                        g.font = '600 12px "JetBrains Mono", monospace';
                        g.fillStyle = banner.color;
                        g.fillText(banner.subtitle, W * 0.5, 130);
                    }
                }
                g.restore();
            }
        };
    }

    // -------------------------------------------------------------------------
    // Shared Input Manager & Game Loop Runner
    // -------------------------------------------------------------------------
    function createInput(canvas) {
        const down = new Set();
        const pressed = new Set();
        if (canvas && canvas.style) {
            canvas.style.touchAction = 'none';
        }
        const pointer = {
            x: W * 0.5,
            y: H * 0.5,
            id: null,
            isDown: false,
            justDown: false,
            justUp: false,
            hasMoved: false,
            lastMoveAt: 0,
            startX: W * 0.5,
            startY: H * 0.5
        };
        let lastMode = 'keyboard';

        const PREVENT_KEYS = new Set([
            'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', ' '
        ]);

        const MOVE_KEYS = new Set([
            'KeyW', 'KeyA', 'KeyS', 'KeyD',
            'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'
        ]);

        function mapPoint(e) {
            const rect = canvas.getBoundingClientRect();
            const rw = rect.width || W;
            const rh = rect.height || H;
            const cx = Number.isFinite(e.clientX) ? e.clientX : rect.left + rw * 0.5;
            const cy = Number.isFinite(e.clientY) ? e.clientY : rect.top + rh * 0.5;
            const inside = cx >= rect.left && cx <= rect.left + rw && cy >= rect.top && cy <= rect.top + rh;
            return {
                x: clamp((cx - rect.left) * (W / rw), 0, W),
                y: clamp((cy - rect.top) * (H / rh), 0, H),
                inside
            };
        }

        function onKeyDown(e) {
            const tag = e.target && e.target.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
            if (PREVENT_KEYS.has(e.code) || PREVENT_KEYS.has(e.key)) {
                e.preventDefault();
            }
            if (MOVE_KEYS.has(e.code)) {
                lastMode = 'keyboard';
            }
            const k = (e.key || '').toLowerCase();
            if (!down.has(e.code)) pressed.add(e.code);
            if (k && !down.has(k)) pressed.add(k);
            down.add(e.code);
            if (k) down.add(k);
        }

        function onKeyUp(e) {
            const k = (e.key || '').toLowerCase();
            down.delete(e.code);
            if (k) down.delete(k);
        }

        function onBlur() {
            down.clear();
            pressed.clear();
            pointer.isDown = false;
            pointer.id = null;
            pointer.justDown = false;
            pointer.justUp = false;
        }

        function onPointerDown(e) {
            if (e.button !== undefined && e.button !== 0) return;
            if (pointer.isDown && pointer.id !== null && e.pointerId !== undefined && e.pointerId !== pointer.id) return;
            const pt = mapPoint(e);
            pointer.id = e.pointerId !== undefined ? e.pointerId : null;
            pointer.x = pt.x;
            pointer.y = pt.y;
            pointer.startX = pt.x;
            pointer.startY = pt.y;
            pointer.isDown = true;
            pointer.justDown = true;
            pointer.hasMoved = true;
            pointer.lastMoveAt = performance.now();
            lastMode = 'pointer';
        }

        function onPointerMove(e) {
            if (pointer.isDown && pointer.id !== null && e.pointerId !== undefined && e.pointerId !== pointer.id) return;
            const pt = mapPoint(e);
            if (!pt.inside && !pointer.isDown) return;
            const movedDist = Math.hypot(pt.x - pointer.x, pt.y - pointer.y);
            pointer.x = pt.x;
            pointer.y = pt.y;
            pointer.hasMoved = true;
            pointer.lastMoveAt = performance.now();
            if (movedDist > 2) {
                lastMode = 'pointer';
            }
        }

        function onPointerUp(e) {
            if (!pointer.isDown) return;
            if (pointer.id !== null && e.pointerId !== undefined && e.pointerId !== pointer.id) return;
            const pt = mapPoint(e);
            pointer.x = pt.x;
            pointer.y = pt.y;
            pointer.isDown = false;
            pointer.id = null;
            pointer.justUp = true;
        }

        function onPointerCancel(e) {
            if (!pointer.isDown) return;
            if (pointer.id !== null && e.pointerId !== undefined && e.pointerId !== pointer.id) return;
            pointer.isDown = false;
            pointer.id = null;
        }

        global.addEventListener('keydown', onKeyDown);
        global.addEventListener('keyup', onKeyUp);
        global.addEventListener('blur', onBlur);
        canvas.addEventListener('pointerdown', onPointerDown);
        global.addEventListener('pointermove', onPointerMove);
        global.addEventListener('pointerup', onPointerUp);
        global.addEventListener('pointercancel', onPointerCancel);

        return {
            pointer,
            get mode() {
                return lastMode;
            },
            isDown(keyOrCode) {
                return down.has(keyOrCode);
            },
            anyDown(arr) {
                for (let i = 0; i < arr.length; i++) {
                    if (down.has(arr[i])) return true;
                }
                return false;
            },
            justPressed(keyOrCode) {
                return pressed.has(keyOrCode);
            },
            anyPressed(arr) {
                for (let i = 0; i < arr.length; i++) {
                    if (pressed.has(arr[i])) return true;
                }
                return false;
            },
            endFrame() {
                pressed.clear();
                pointer.justDown = false;
                pointer.justUp = false;
            },
            destroy() {
                global.removeEventListener('keydown', onKeyDown);
                global.removeEventListener('keyup', onKeyUp);
                global.removeEventListener('blur', onBlur);
                canvas.removeEventListener('pointerdown', onPointerDown);
                global.removeEventListener('pointermove', onPointerMove);
                global.removeEventListener('pointerup', onPointerUp);
                global.removeEventListener('pointercancel', onPointerCancel);
                down.clear();
                pressed.clear();
            }
        };
    }

    function mountEngine(ctx, buildGame) {
        const canvas = ctx.createCanvas('2d');
        if (!canvas.width) canvas.width = W;
        if (!canvas.height) canvas.height = H;
        const g = canvas.getContext('2d');
        const input = createInput(canvas);

        let destroyed = false;
        let rafId = 0;
        let lastTs = 0;
        let lastHudPush = 0;
        let lastHudSig = '';
        let game = buildGame(ctx, canvas, g, input);

        function pushHud(force) {
            if (!ctx || typeof ctx.setHud !== 'function' || !game.getHud) return;
            const now = performance.now();
            if (!force && now - lastHudPush < 95) return;
            const hud = game.getHud();
            const sig = JSON.stringify(hud);
            if (force || sig !== lastHudSig) {
                lastHudSig = sig;
                lastHudPush = now;
                ctx.setHud(hud);
            }
        }

        function frame(ts) {
            if (destroyed) return;
            if (!lastTs) lastTs = ts;
            const rawDt = (ts - lastTs) / 1000;
            lastTs = ts;
            const dt = clamp(rawDt, 0, 0.05);

            const paused = !!(ctx && typeof ctx.getPaused === 'function' && ctx.getPaused());
            if (!paused) {
                game.update(dt);
                input.endFrame();
                pushHud(false);
            } else {
                input.endFrame();
            }
            game.render(g);
            rafId = global.requestAnimationFrame(frame);
        }

        game.init(1);
        pushHud(true);
        rafId = global.requestAnimationFrame(frame);

        return {
            destroy() {
                if (destroyed) return;
                destroyed = true;
                if (rafId) global.cancelAnimationFrame(rafId);
                input.destroy();
                if (game.cleanup) game.cleanup();
            },
            restart(level) {
                if (destroyed) return;
                const lvl = Math.max(1, Math.floor(Number(level) || 1));
                lastTs = 0;
                game.init(lvl);
                pushHud(true);
            }
        };
    }

    function drawInCanvasFooter(g, text) {
        g.save();
        g.font = '500 11px "JetBrains Mono", monospace';
        g.fillStyle = 'rgba(148, 163, 184, 0.68)';
        g.textAlign = 'center';
        g.textBaseline = 'bottom';
        g.fillText(text, W * 0.5, H - 8);
        g.restore();
    }

    // =========================================================================
    // 1. GALAGA SWARM ASSAULT (`galaga-swarm-assault`)
    // =========================================================================
    function createGalagaEngine(ctx, canvas, g, input) {
        const stars = createStarfield(110);
        const fx = createFxSystem();

        let stage = 1;
        let wave = 1;
        let score = 0;
        let lives = 3;
        let ended = false;
        let autoFire = true;
        let fireCd = 0;
        let time = 0;
        let formationPhase = 0;
        let diveTimer = 2.0;
        let waveClearTimer = 0;

        let player = null;
        let bullets = [];
        let enemyBullets = [];
        let enemies = [];
        let pickups = [];
        let boss = null;

        function resetPlayer() {
            player = {
                x: W * 0.5,
                y: 486,
                vx: 0,
                dual: false,
                shieldTimer: 0,
                invuln: 2.2
            };
        }

        function spawnWave(waveNum) {
            bullets = [];
            enemyBullets = [];
            enemies = [];
            boss = null;
            waveClearTimer = 0;
            diveTimer = Math.max(0.8, 2.2 - waveNum * 0.12);

            const isBossWave = waveNum % 3 === 0;
            if (isBossWave) {
                sfx(ctx, 'bossAlarm');
                fx.showBanner(
                    'WAVE ' + waveNum + ' — DREADNOUGHT FLAGSHIP',
                    'DESTROY THE CORE & ESCORT SWARM',
                    PAL.coral,
                    2.6
                );
                const maxHp = 28 + Math.floor(waveNum / 3) * 18;
                boss = {
                    x: W * 0.5,
                    y: -60,
                    targetY: 112,
                    hp: maxHp,
                    maxHp,
                    phase: 0,
                    fireCd: 1.5,
                    beamTimer: 0,
                    beamActive: 0,
                    hitFlash: 0,
                    summonCd: 5.5
                };
                // Spawn escort formation around boss
                for (let i = 0; i < 10; i++) {
                    const col = i < 5 ? i : i + 3;
                    const slotX = 110 + col * 62;
                    const slotY = 186 + (i % 2) * 44;
                    spawnBezierEnemy('ufo', slotX, slotY, i * 0.14, i % 2 === 0 ? 'left' : 'right');
                }
                return;
            }

            fx.showBanner(
                'STAGE ' + stage + ' · WAVE ' + waveNum,
                'INTERCEPT CURVED ASSAULT SQUADRONS',
                PAL.sky,
                2.0
            );

            const cols = 10;
            const rows = Math.min(4, 3 + Math.floor((waveNum - 1) / 3));
            const spacingX = 64;
            const startX = W * 0.5 - ((cols - 1) * spacingX) * 0.5;
            const startY = 86;

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const kind = r === 0 ? 'ufo' : 'alien_drone';
                    const slotX = startX + c * spacingX;
                    const slotY = startY + r * 48;
                    const side = (c < cols * 0.5) ? 'left' : 'right';
                    const delay = r * 0.35 + (c % 5) * 0.12;
                    spawnBezierEnemy(kind, slotX, slotY, delay, side);
                }
            }
        }

        function spawnBezierEnemy(kind, slotX, slotY, delay, side) {
            const sx = side === 'left' ? -40 : W + 40;
            const sy = 140 + randRange(-40, 60);
            const c1x = side === 'left' ? W * 0.32 : W * 0.68;
            const c1y = 320;
            const c2x = side === 'left' ? W * 0.65 : W * 0.35;
            const c2y = 50;
            const maxHp = kind === 'ufo' ? (2 + Math.floor(wave / 4)) : 1;

            enemies.push({
                kind,
                x: sx,
                y: sy,
                slotX,
                slotY,
                sx, sy, c1x, c1y, c2x, c2y,
                state: 'entering',
                delay,
                t: 0,
                diveT: 0,
                diveDir: side === 'left' ? 1 : -1,
                diveStartX: slotX,
                diveStartY: slotY,
                diveTargetX: W * 0.5,
                trail: [],
                hp: maxHp,
                maxHp,
                hitFlash: 0,
                firedDive: false,
                angle: 0
            });
        }

        function startDive() {
            const candidates = enemies.filter((e) => e.state === 'grid');
            if (!candidates.length) return;
            const pick = candidates[randInt(0, candidates.length - 1)];
            pick.state = 'diving';
            pick.diveT = 0;
            pick.diveStartX = pick.x;
            pick.diveStartY = pick.y;
            pick.diveTargetX = clamp(player.x + randRange(-55, 55), 50, W - 50);
            pick.diveDir = pick.x < player.x ? 1 : -1;
            pick.firedDive = false;
            pick.trail = [];
            sfx(ctx, 'dash', 0.2);
        }

        function spawnEnemyShot(x, y, vx, vy, color) {
            enemyBullets.push({ x, y, vx, vy, color: color || PAL.coral, r: 5 });
        }

        function maybeDropPickup(x, y, force) {
            if (!force && Math.random() > 0.16) return;
            const roll = Math.random();
            const type = (!player.dual && roll < 0.62)
                ? 'dual'
                : (roll < 0.85 ? 'shield' : 'star');
            pickups.push({
                x, y,
                vy: 115,
                type,
                pulse: 0
            });
        }

        function damagePlayer() {
            if (player.invuln > 0 || ended) return;
            if (player.shieldTimer > 0) {
                player.shieldTimer = 0;
                player.invuln = 1.4;
                sfx(ctx, 'hitShield');
                fx.ring(player.x, player.y, 56, PAL.mint, 0.38);
                fx.floatText(player.x, player.y - 24, 'SHIELD BROKEN', PAL.mint);
                return;
            }
            if (player.dual) {
                player.dual = false;
                player.invuln = 1.6;
                sfx(ctx, 'explodeSmall');
                fx.burst(player.x + 18, player.y, 18, PAL.amber, 220, 4, 0.5);
                fx.shake(6, 0.25);
                fx.floatText(player.x, player.y - 24, 'WINGMAN LOST!', PAL.amber);
                return;
            }
            lives--;
            sfx(ctx, 'playerHurt');
            fx.burst(player.x, player.y, 28, PAL.coral, 260, 4.5, 0.65);
            fx.ring(player.x, player.y, 68, PAL.coral, 0.45);
            fx.shake(10, 0.35);
            if (lives <= 0) {
                ended = true;
                ctx.onGameOver?.({ score: Math.floor(score), level: stage, wave });
                return;
            }
            player.x = W * 0.5;
            player.invuln = 2.5;
        }

        function init(lvl) {
            stage = lvl;
            wave = (lvl - 1) * 3 + 1;
            score = 0;
            lives = 3;
            ended = false;
            time = 0;
            fireCd = 0;
            pickups = [];
            resetPlayer();
            spawnWave(wave);
        }

        function firePlayerLasers() {
            sfx(ctx, 'shootLaser', 0.14);
            if (player.dual) {
                bullets.push({ x: player.x - 18, y: player.y - 20, vy: -680, color: PAL.sky });
                bullets.push({ x: player.x + 18, y: player.y - 20, vy: -680, color: PAL.amber });
            } else {
                bullets.push({ x: player.x, y: player.y - 22, vy: -680, color: PAL.sky });
            }
        }

        function update(dt) {
            time += dt;
            stars.update(dt, 0, 55);
            fx.update(dt);
            if (ended) return;

            if (input.justPressed('KeyF')) {
                autoFire = !autoFire;
                sfx(ctx, 'uiClick');
                fx.floatText(player.x, player.y - 34, autoFire ? 'AUTO-FIRE ON' : 'MANUAL FIRE', PAL.sky);
            }

            // Player horizontal control
            let moveX = 0;
            if (input.anyDown(['KeyA', 'ArrowLeft'])) moveX -= 1;
            if (input.anyDown(['KeyD', 'ArrowRight'])) moveX += 1;

            if (moveX !== 0) {
                player.x += moveX * 430 * dt;
            } else if (input.pointer.isDown) {
                const dx = input.pointer.x - player.x;
                player.x += clamp(dx, -460 * dt, 460 * dt);
            }
            player.x = clamp(player.x, player.dual ? 44 : 28, W - (player.dual ? 44 : 28));

            if (player.invuln > 0) player.invuln = Math.max(0, player.invuln - dt);
            if (player.shieldTimer > 0) player.shieldTimer = Math.max(0, player.shieldTimer - dt);

            // Thruster trail
            if (Math.random() < 0.65) {
                const offsets = player.dual ? [-18, 18] : [0];
                for (let i = 0; i < offsets.length; i++) {
                    fx.spawn(
                        player.x + offsets[i] + randRange(-3, 3),
                        player.y + 18,
                        randRange(-12, 12),
                        randRange(70, 120),
                        i === 0 ? PAL.sky : PAL.amber,
                        2.5,
                        0.22
                    );
                }
            }

            // Firing
            fireCd = Math.max(0, fireCd - dt);
            const wantsFire = autoFire || input.anyDown(['Space', 'KeyZ']) || input.pointer.isDown;
            const maxBullets = player.dual ? 10 : 6;
            if (wantsFire && fireCd <= 0 && bullets.length < maxBullets) {
                firePlayerLasers();
                fireCd = player.dual ? 0.14 : 0.16;
            }

            // Player bullets
            for (let i = bullets.length - 1; i >= 0; i--) {
                const b = bullets[i];
                b.y += b.vy * dt;
                if (b.y < -20) bullets.splice(i, 1);
            }

            // Formation sway
            formationPhase += dt * (1.35 + wave * 0.07);
            const swayX = Math.sin(formationPhase) * 44;

            // Periodic dive attacks (accelerate slightly when few stragglers remain)
            diveTimer -= dt;
            if (diveTimer <= 0) {
                const diveCount = Math.min(3, 1 + Math.floor(wave / 2));
                for (let i = 0; i < diveCount; i++) startDive();
                diveTimer = (!boss && enemies.length <= 3)
                    ? Math.max(0.75, 1.35 - wave * 0.05)
                    : Math.max(1.1, 3.0 - wave * 0.14);
            }

            // Update enemies
            for (let i = enemies.length - 1; i >= 0; i--) {
                const e = enemies[i];
                if (e.hitFlash > 0) e.hitFlash = Math.max(0, e.hitFlash - dt);

                if (e.state === 'entering') {
                    if (e.delay > 0) {
                        e.delay -= dt;
                        continue;
                    }
                    e.t = Math.min(1, e.t + dt * 0.78);
                    const gx = e.slotX + swayX;
                    const gy = e.slotY;
                    const nx = cubicBezier(e.sx, e.c1x, e.c2x, gx, e.t);
                    const ny = cubicBezier(e.sy, e.c1y, e.c2y, gy, e.t);
                    e.angle = Math.atan2(ny - e.y, nx - e.x) + Math.PI * 0.5;
                    e.x = nx;
                    e.y = ny;
                    e.trail.push({ x: e.x, y: e.y });
                    if (e.trail.length > 9) e.trail.shift();
                    if (Math.random() < 0.35) {
                        fx.spawn(e.x, e.y, 0, 20, e.kind === 'ufo' ? PAL.amber : PAL.violet, 2.2, 0.25);
                    }
                    if (e.t >= 1) {
                        e.state = 'grid';
                        e.angle = Math.PI;
                        e.trail.length = 0;
                    }
                } else if (e.state === 'grid') {
                    e.x = lerp(e.x, e.slotX + swayX, Math.min(1, dt * 8));
                    e.y = lerp(e.y, e.slotY + Math.sin(formationPhase * 2 + e.slotX * 0.02) * 5, Math.min(1, dt * 8));
                    e.angle = Math.PI;
                    if (Math.random() < (0.04 + wave * 0.01) * dt) {
                        spawnEnemyShot(e.x, e.y + 14, randRange(-25, 25), 240 + wave * 12, PAL.coral);
                    }
                } else if (e.state === 'diving') {
                    e.diveT += dt * (0.48 + wave * 0.03);
                    const t = e.diveT;
                    const prevX = e.x;
                    const prevY = e.y;
                    e.x = clamp(
                        lerp(e.diveStartX, e.diveTargetX, Math.min(1, t)) + Math.sin(t * Math.PI * 2.2) * 78 * e.diveDir,
                        22,
                        W - 22
                    );
                    e.y = e.diveStartY + t * (H + 90 - e.diveStartY);
                    e.angle = Math.atan2(e.y - prevY, e.x - prevX) + Math.PI * 0.5;
                    e.trail.push({ x: e.x, y: e.y });
                    if (e.trail.length > 11) e.trail.shift();
                    if (Math.random() < 0.45) {
                        fx.spawn(e.x, e.y, 0, -25, PAL.coral, 2.2, 0.22);
                    }
                    if (!e.firedDive && e.y > 220) {
                        e.firedDive = true;
                        const ang = Math.atan2(player.y - e.y, player.x - e.x);
                        const spd = 270 + wave * 15;
                        spawnEnemyShot(e.x, e.y + 10, Math.cos(ang) * spd, Math.sin(ang) * spd, PAL.amber);
                    }
                    // Wrap cleanly to top return lane (never drift offscreen forever)
                    if (e.y > H + 32 || e.diveT >= 1.15) {
                        e.y = -32;
                        e.x = clamp(e.slotX + swayX, 26, W - 26);
                        e.state = 'returning';
                        e.trail.length = 0;
                    }
                } else if (e.state === 'returning') {
                    const tx = clamp(e.slotX + swayX, 26, W - 26);
                    const ty = e.slotY;
                    e.x = lerp(e.x, tx, Math.min(1, dt * 4.5));
                    e.y += 205 * dt;
                    e.angle = Math.PI;
                    e.trail.push({ x: e.x, y: e.y });
                    if (e.trail.length > 6) e.trail.shift();
                    if (e.y >= ty || e.y > H - 40) {
                        e.y = ty;
                        e.x = tx;
                        e.state = 'grid';
                        e.trail.length = 0;
                    }
                }

                // Player collision with enemy
                if (e.delay <= 0 && distSq(e.x, e.y, player.x, player.y) < (player.dual ? 34 * 34 : 26 * 26)) {
                    enemies.splice(i, 1);
                    fx.burst(e.x, e.y, 16, PAL.violet, 200, 3.5, 0.45);
                    sfx(ctx, 'explodeSmall', 0.15);
                    damagePlayer();
                    continue;
                }

                // Player bullet hits enemy
                for (let bi = bullets.length - 1; bi >= 0; bi--) {
                    const b = bullets[bi];
                    if (e.delay <= 0 && distSq(b.x, b.y, e.x, e.y) < 22 * 22) {
                        bullets.splice(bi, 1);
                        e.hp -= 1;
                        e.hitFlash = 0.12;
                        if (e.hp <= 0) {
                            const pts = (e.kind === 'ufo' ? 250 : 120) * (e.state === 'diving' ? 2 : 1);
                            score += pts;
                            sfx(ctx, 'explodeSmall', 0.15);
                            fx.burst(e.x, e.y, 14, e.kind === 'ufo' ? PAL.amber : PAL.violet, 190, 3.5, 0.45);
                            fx.floatText(e.x, e.y, '+' + pts, e.kind === 'ufo' ? PAL.amber : PAL.sky);
                            maybeDropPickup(e.x, e.y, false);
                            enemies.splice(i, 1);
                        } else {
                            sfx(ctx, 'hitMetal', 0.15);
                            fx.burst(b.x, b.y, 5, PAL.white, 90, 2, 0.2);
                        }
                        break;
                    }
                }
            }

            // Boss Flagship update
            if (boss) {
                if (boss.hitFlash > 0) boss.hitFlash = Math.max(0, boss.hitFlash - dt);
                const beamSlow = boss.beamActive === 2 ? 0 : (boss.beamActive === 1 ? 0.25 : 1);
                boss.phase += dt * 1.4 * beamSlow;
                boss.y = lerp(boss.y, boss.targetY, Math.min(1, dt * 3));
                boss.x = W * 0.5 + Math.sin(boss.phase * 0.85) * 280;

                // Boss twin laser volleys
                boss.fireCd -= dt;
                if (boss.fireCd <= 0 && boss.y > 70) {
                    boss.fireCd = Math.max(0.65, 1.35 - stage * 0.08);
                    const ang = Math.atan2(player.y - boss.y, player.x - boss.x);
                    for (let spread = -1; spread <= 1; spread++) {
                        const a = ang + spread * 0.22;
                        spawnEnemyShot(
                            boss.x + spread * 46,
                            boss.y + 24,
                            Math.cos(a) * 285,
                            Math.sin(a) * 285,
                            PAL.coral
                        );
                    }
                    sfx(ctx, 'shootPlasma', 0.12);
                }

                // Boss periodic tractor/mega-beam telegraph
                boss.beamTimer += dt;
                if (boss.beamTimer > 7.5 && boss.beamTimer < 9.0) {
                    boss.beamActive = 1; // warning telegraph
                } else if (boss.beamTimer >= 9.0 && boss.beamTimer < 10.2) {
                    boss.beamActive = 2; // active beam
                    const beamHalfW = player.dual ? 40 : 30;
                    if (Math.abs(player.x - boss.x) < beamHalfW && player.y > boss.y + 20) {
                        damagePlayer();
                    }
                } else {
                    boss.beamActive = 0;
                    if (boss.beamTimer >= 10.2) boss.beamTimer = 0;
                }

                // Summon escort drones if low on escorts
                boss.summonCd -= dt;
                if (boss.summonCd <= 0 && enemies.length < 4) {
                    boss.summonCd = 6.5;
                    spawnBezierEnemy('alien_drone', W * 0.3, 190, 0, 'left');
                    spawnBezierEnemy('alien_drone', W * 0.7, 190, 0.25, 'right');
                }

                // Bullets hit boss
                for (let bi = bullets.length - 1; bi >= 0; bi--) {
                    const b = bullets[bi];
                    if (Math.abs(b.x - boss.x) < 58 && Math.abs(b.y - boss.y) < 36) {
                        bullets.splice(bi, 1);
                        boss.hp -= 1;
                        boss.hitFlash = 0.1;
                        score += 35;
                        sfx(ctx, 'hitMetal', 0.18);
                        fx.burst(b.x, b.y, 6, PAL.amber, 130, 2.5, 0.25);
                        if (boss.hp <= 0) {
                            score += 2500 * stage;
                            sfx(ctx, 'explodeBoss');
                            fx.burst(boss.x, boss.y, 48, PAL.coral, 340, 5.5, 0.9);
                            fx.burst(boss.x, boss.y, 28, PAL.amber, 240, 4.5, 0.75);
                            fx.ring(boss.x, boss.y, 160, PAL.amber, 0.65, 4);
                            fx.shake(14, 0.55);
                            fx.floatText(boss.x, boss.y, 'FLAGSHIP DESTROYED +' + (2500 * stage), PAL.amber, 1.35);
                            boss = null;
                            enemies = [];
                            enemyBullets = [];
                            if (ctx.isStory) {
                                ended = true;
                                ctx.onWin?.({ score: Math.floor(score), level: stage, wave });
                                return;
                            }
                            stage += 1;
                            wave += 1;
                            if (lives < 4) lives += 1;
                            sfx(ctx, 'levelup');
                            fx.showBanner('SECTOR ' + stage + ' ENGAGED', 'FLAGSHIP SHATTERED · ESCALATING SWARM', PAL.mint, 2.2);
                            spawnWave(wave);
                            break;
                        }
                    }
                }
            }

            // Enemy bullets
            for (let i = enemyBullets.length - 1; i >= 0; i--) {
                const eb = enemyBullets[i];
                eb.x += eb.vx * dt;
                eb.y += eb.vy * dt;
                if (eb.y > H + 20 || eb.x < -20 || eb.x > W + 20) {
                    enemyBullets.splice(i, 1);
                    continue;
                }
                const hitR = player.dual ? 24 : 16;
                if (distSq(eb.x, eb.y, player.x, player.y) < hitR * hitR) {
                    enemyBullets.splice(i, 1);
                    damagePlayer();
                }
            }

            // Pickups
            for (let i = pickups.length - 1; i >= 0; i--) {
                const p = pickups[i];
                p.y += p.vy * dt;
                p.pulse += dt * 6;
                if (p.y > H + 24) {
                    pickups.splice(i, 1);
                    continue;
                }
                if (distSq(p.x, p.y, player.x, player.y) < 30 * 30) {
                    sfx(ctx, 'powerup');
                    if (p.type === 'dual') {
                        player.dual = true;
                        score += 300;
                        fx.floatText(player.x, player.y - 26, 'TWIN FIGHTER ACTIVE!', PAL.amber, 1.15);
                    } else if (p.type === 'shield') {
                        player.shieldTimer = 10;
                        score += 200;
                        fx.floatText(player.x, player.y - 26, 'AEGIS SHIELD 10s', PAL.mint, 1.1);
                    } else {
                        score += 500;
                        fx.floatText(player.x, player.y - 26, 'STAR BONUS +500', PAL.amber, 1.1);
                    }
                    fx.ring(player.x, player.y, 44, PAL.sky, 0.32);
                    pickups.splice(i, 1);
                }
            }

            // Next wave check
            if (!boss && enemies.length === 0) {
                waveClearTimer += dt;
                if (waveClearTimer >= 1.1) {
                    wave += 1;
                    spawnWave(wave);
                }
            }
        }

        function render(g) {
            g.save();
            fx.applyShake(g);
            stars.draw(g, '#040814', '#0b142c');

            // Boss beam telegraph / firing
            if (boss && boss.beamActive > 0) {
                g.save();
                const bx = boss.x;
                const by = boss.y + 30;
                if (boss.beamActive === 1) {
                    const chargePct = clamp((boss.beamTimer - 7.5) / 1.5, 0, 1);
                    const blink = Math.floor(time * 18) % 2 === 0;
                    g.fillStyle = blink ? 'rgba(251, 113, 133, 0.14)' : 'rgba(251, 191, 36, 0.08)';
                    g.beginPath();
                    g.moveTo(bx - 16, by);
                    g.lineTo(bx + 16, by);
                    g.lineTo(bx + 36, H);
                    g.lineTo(bx - 36, H);
                    g.closePath();
                    g.fill();

                    g.strokeStyle = blink ? 'rgba(251, 113, 133, 0.9)' : 'rgba(251, 191, 36, 0.8)';
                    g.setLineDash([8, 6]);
                    g.lineWidth = 2;
                    g.beginPath();
                    g.moveTo(bx - 16, by);
                    g.lineTo(bx - 34, H);
                    g.moveTo(bx + 16, by);
                    g.lineTo(bx + 34, H);
                    g.stroke();
                    g.setLineDash([]);

                    // Gathering tractor orb at core muzzle
                    g.shadowColor = PAL.coral;
                    g.shadowBlur = 18;
                    g.fillStyle = PAL.amber;
                    g.beginPath();
                    g.arc(bx, by, 6 + chargePct * 12, 0, TAU);
                    g.fill();

                    g.font = '700 10px "JetBrains Mono", monospace';
                    g.textAlign = 'center';
                    g.fillStyle = blink ? PAL.coral : PAL.amber;
                    g.fillText('TRACTOR LOCK', bx, by - 12);
                } else {
                    const grad = g.createLinearGradient(bx - 38, 0, bx + 38, 0);
                    grad.addColorStop(0, 'rgba(251,113,133,0)');
                    grad.addColorStop(0.3, 'rgba(251,113,133,0.45)');
                    grad.addColorStop(0.5, 'rgba(251,113,133,0.88)');
                    grad.addColorStop(0.7, 'rgba(251,113,133,0.45)');
                    grad.addColorStop(1, 'rgba(251,113,133,0)');
                    g.fillStyle = grad;
                    g.fillRect(bx - 38, by - 2, 76, H - by + 2);
                    g.fillStyle = 'rgba(255,255,255,0.92)';
                    g.fillRect(bx - 8, by - 2, 16, H - by + 2);

                    // Travelling pulse rings along active beam
                    g.strokeStyle = 'rgba(255, 255, 255, 0.7)';
                    g.lineWidth = 2;
                    for (let r = 0; r < 5; r++) {
                        const ry = by + ((time * 420 + r * 95) % Math.max(40, H - by));
                        g.beginPath();
                        g.ellipse(bx, ry, 28, 6, 0, 0, TAU);
                        g.stroke();
                    }
                }
                g.restore();
            }

            // Pickups
            for (let i = 0; i < pickups.length; i++) {
                const p = pickups[i];
                const spriteName = p.type === 'dual' ? 'energy_prism' : (p.type === 'shield' ? 'shield_battery' : 'coin_star');
                const col = p.type === 'dual' ? PAL.amber : (p.type === 'shield' ? PAL.mint : PAL.sky);
                drawSprite(g, ctx.sprites, spriteName, p.x, p.y, 28, 28, {
                    angle: Math.sin(p.pulse) * 0.18,
                    glow: col,
                    glowBlur: 12
                });
            }

            // Player bullets
            g.save();
            for (let i = 0; i < bullets.length; i++) {
                const b = bullets[i];
                g.shadowColor = b.color;
                g.shadowBlur = 10;
                g.fillStyle = PAL.white;
                g.fillRect(b.x - 1.5, b.y - 10, 3, 16);
                g.strokeStyle = b.color;
                g.lineWidth = 2;
                g.beginPath();
                g.moveTo(b.x, b.y - 12);
                g.lineTo(b.x, b.y + 8);
                g.stroke();
            }
            g.restore();

            // Enemy bullets
            for (let i = 0; i < enemyBullets.length; i++) {
                const eb = enemyBullets[i];
                drawSprite(g, ctx.sprites, 'plasma_bomb', eb.x, eb.y, 16, 16, {
                    angle: time * 6,
                    glow: eb.color,
                    glowBlur: 10
                });
            }

            // Enemies + dive ribbon trails
            for (let i = 0; i < enemies.length; i++) {
                const e = enemies[i];
                if (e.delay > 0) continue;
                if (e.trail && e.trail.length > 1) {
                    g.save();
                    const trailCol = e.state === 'diving' ? '251,113,133' : (e.kind === 'ufo' ? '251,191,36' : '167,139,250');
                    for (let ti = 1; ti < e.trail.length; ti++) {
                        const frac = ti / e.trail.length;
                        g.strokeStyle = 'rgba(' + trailCol + ',' + (frac * (e.state === 'diving' ? 0.6 : 0.35)).toFixed(2) + ')';
                        g.lineWidth = frac * (e.state === 'diving' ? 6 : 3.5);
                        g.lineCap = 'round';
                        g.beginPath();
                        g.moveTo(e.trail[ti - 1].x, e.trail[ti - 1].y);
                        g.lineTo(e.trail[ti].x, e.trail[ti].y);
                        g.stroke();
                    }
                    g.restore();
                }
                const sz = e.kind === 'ufo' ? 34 : 30;
                drawSprite(g, ctx.sprites, e.kind, e.x, e.y, sz, sz, {
                    angle: e.kind === 'alien_drone' ? e.angle : Math.sin(time * 4 + e.slotX) * 0.12,
                    hitFlash: e.hitFlash > 0,
                    glow: e.state === 'diving' ? PAL.coral : (e.kind === 'ufo' ? PAL.amber : PAL.violet),
                    glowBlur: e.state === 'diving' ? 14 : 7
                });
                if (e.state === 'diving' && e.diveT < 0.25) {
                    g.save();
                    g.font = '800 11px "JetBrains Mono", monospace';
                    g.fillStyle = PAL.coral;
                    g.textAlign = 'center';
                    g.fillText('!', e.x, e.y - 20);
                    g.restore();
                }
            }

            // Boss Flagship
            if (boss) {
                drawSprite(g, ctx.sprites, 'laser_turret', boss.x - 46, boss.y + 6, 36, 36, {
                    angle: Math.PI * 0.5,
                    hitFlash: boss.hitFlash > 0,
                    glow: PAL.coral
                });
                drawSprite(g, ctx.sprites, 'laser_turret', boss.x + 46, boss.y + 6, 36, 36, {
                    angle: Math.PI * 0.5,
                    flipY: true,
                    hitFlash: boss.hitFlash > 0,
                    glow: PAL.coral
                });
                drawSprite(g, ctx.sprites, 'boss_core', boss.x, boss.y, 72, 72, {
                    hitFlash: boss.hitFlash > 0,
                    glow: PAL.coral,
                    glowBlur: 18
                });
                // Boss HP bar
                drawRoundRect(g, W * 0.5 - 160, 14, 320, 14, 7);
                g.fillStyle = 'rgba(15, 23, 42, 0.88)';
                g.fill();
                g.fillStyle = PAL.coral;
                drawRoundRect(g, W * 0.5 - 157, 17, 314 * clamp(boss.hp / boss.maxHp, 0, 1), 8, 4);
                g.fill();
                g.font = '700 10px "JetBrains Mono", monospace';
                g.fillStyle = PAL.white;
                g.textAlign = 'center';
                g.fillText('FLAGSHIP CORE', W * 0.5, 40);
            }

            // Player Fighter(s)
            const blinkSkip = player.invuln > 0 && Math.floor(time * 16) % 2 === 0;
            if (!blinkSkip && !ended) {
                if (player.dual) {
                    drawSprite(g, ctx.sprites, 'fighter', player.x - 18, player.y, 38, 38, {
                        glow: PAL.sky,
                        glowBlur: 12
                    });
                    drawSprite(g, ctx.sprites, 'fighter', player.x + 18, player.y, 38, 38, {
                        glow: PAL.amber,
                        glowBlur: 12
                    });
                } else {
                    drawSprite(g, ctx.sprites, 'fighter', player.x, player.y, 42, 42, {
                        glow: PAL.sky,
                        glowBlur: 12
                    });
                }
                if (player.shieldTimer > 0) {
                    g.save();
                    g.strokeStyle = PAL.mint;
                    g.lineWidth = 2;
                    g.globalAlpha = 0.65 + 0.25 * Math.sin(time * 8);
                    g.beginPath();
                    g.arc(player.x, player.y, player.dual ? 40 : 28, 0, TAU);
                    g.stroke();
                    g.restore();
                }
            }

            fx.drawParticles(g);
            fx.drawOverlays(g);
            drawInCanvasFooter(g, '[A/D / Arrows / Drag] Move  ·  [Space / Hold] Fire  ·  [F] Auto-Fire: ' + (autoFire ? 'ON' : 'OFF'));
            g.restore();
        }

        function getHud() {
            return {
                score: Math.floor(score),
                level: stage,
                wave,
                lives,
                hp: lives,
                maxHp: 3,
                status: boss ? 'BOSS FLAGSHIP' : ('WAVE ' + wave + (player && player.dual ? ' · TWIN' : ''))
            };
        }

        return { init, update, render, getHud };
    }

    // =========================================================================
    // 2. DEFENDER PATROL (`defender-patrol`)
    // =========================================================================
    function createDefenderEngine(ctx, canvas, g, input) {
        const WORLD_W = 2800;
        const RADAR_H = 58;
        const stars = createStarfield(120);
        const fx = createFxSystem();

        let stage = 1;
        let wave = 1;
        let score = 0;
        let lives = 3;
        let ended = false;
        let time = 0;
        let camX = 0;
        let fireCd = 0;
        let spawnPending = 0;
        let spawnTimer = 0;
        let mutantAlerted = false;
        let bombs = 3;
        let bombFlash = 0;

        let player = null;
        let astronauts = [];
        let enemies = [];
        let beams = [];
        let enemyShots = [];

        function terrainY(wx) {
            const a = (wrapCoord(wx, WORLD_W) / WORLD_W) * TAU;
            return (
                466 -
                Math.sin(a * 3) * 26 -
                Math.cos(a * 7 + 0.6) * 16 -
                Math.sin(a * 13) * 9
            );
        }

        function resetPlayer() {
            player = {
                x: WORLD_W * 0.5,
                y: 260,
                vx: 0,
                vy: 0,
                dir: 1,
                carrying: null,
                invuln: 2.0
            };
            camX = wrapCoord(player.x - W * 0.3, WORLD_W);
        }

        function setupAstronauts() {
            astronauts = [];
            for (let i = 0; i < 8; i++) {
                const ax = (i + 0.5) * (WORLD_W / 8) + randRange(-50, 50);
                astronauts.push({
                    id: i,
                    x: wrapCoord(ax, WORLD_W),
                    y: terrainY(ax) - 14,
                    vy: 0,
                    walkDir: i % 2 === 0 ? 1 : -1,
                    state: 'ground', // ground | abducted | falling | carried
                    carrier: null,
                    fallStartY: 0
                });
            }
        }

        function spawnEnemy(kind, x, y) {
            const wx = wrapCoord(x !== undefined ? x : Math.random() * WORLD_W, WORLD_W);
            const wy = y !== undefined ? y : randRange(90, 200);
            fx.ring(480 + wrappedDelta(wrapCoord(camX + W * 0.5, WORLD_W), wx, WORLD_W), wy, 36, PAL.amber, 0.35);
            enemies.push({
                kind, // 'lander' | 'bomber' | 'mutant'
                x: wx,
                y: wy,
                vx: (Math.random() < 0.5 ? -1 : 1) * (kind === 'mutant' ? 165 : 95),
                vy: randRange(-35, 35),
                targetAstro: null,
                carryingAstro: null,
                fireCd: randRange(1.2, 3.0),
                hp: kind === 'mutant' ? 2 : 1,
                hitFlash: 0,
                phase: Math.random() * TAU
            });
        }

        function startWave(wNum) {
            wave = wNum;
            mutantAlerted = false;
            beams = [];
            enemyShots = [];
            const totalLanders = 6 + stage * 2 + wNum * 2;
            const immediate = Math.min(6, totalLanders);
            spawnPending = totalLanders - immediate;
            spawnTimer = 2.6;
            for (let i = 0; i < immediate; i++) {
                const offset = (i + 1) * (WORLD_W / (immediate + 1));
                spawnEnemy(i % 4 === 3 ? 'bomber' : 'lander', wrapCoord(player.x + offset, WORLD_W), randRange(84, 175));
            }
            fx.showBanner(
                'SECTOR ' + stage + ' · WAVE ' + wave,
                'PROTECT ASTRONAUTS — CATCH FALLING PILOTS!',
                PAL.sky,
                2.3
            );
        }

        function damagePlayer() {
            if (player.invuln > 0 || ended) return;
            lives--;
            sfx(ctx, 'playerHurt');
            const sx = 480 + wrappedDelta(wrapCoord(camX + W * 0.5, WORLD_W), player.x, WORLD_W);
            fx.burst(sx, player.y, 26, PAL.coral, 260, 4.5, 0.6);
            fx.shake(10, 0.35);
            if (player.carrying) {
                player.carrying.state = 'falling';
                player.carrying.vy = 0;
                player.carrying.fallStartY = player.carrying.y;
                player.carrying = null;
            }
            if (lives <= 0) {
                ended = true;
                ctx.onGameOver?.({ score: Math.floor(score), level: stage, wave });
                return;
            }
            player.invuln = 2.4;
        }

        function init(lvl) {
            stage = lvl;
            wave = 1;
            score = 0;
            lives = 3;
            bombs = 3;
            bombFlash = 0;
            ended = false;
            time = 0;
            enemies = [];
            resetPlayer();
            setupAstronauts();
            startWave(1);
        }

        function triggerSmartBomb() {
            if (bombs <= 0 || ended) return;
            bombs -= 1;
            bombFlash = 0.28;
            sfx(ctx, 'emp');
            fx.shake(12, 0.42);
            const psx = toScreenX(player.x);
            fx.ring(psx, player.y, 260, PAL.amber, 0.5, 4);
            fx.floatText(psx, player.y - 34, 'SMART BOMB!', PAL.amber, 1.3);

            const centerWorld = wrapCoord(camX + W * 0.5, WORLD_W);
            let hits = 0;
            for (let ei = enemies.length - 1; ei >= 0; ei--) {
                const e = enemies[ei];
                if (Math.abs(wrappedDelta(centerWorld, e.x, WORLD_W)) <= W * 0.56) {
                    const sx = toScreenX(e.x);
                    const pts = e.kind === 'mutant' ? 200 : 150;
                    score += pts;
                    hits++;
                    fx.burst(sx, e.y, 16, PAL.amber, 220, 3.8, 0.5);
                    if (e.carryingAstro) {
                        const a = e.carryingAstro;
                        a.carrier = null;
                        a.state = 'falling';
                        a.vy = 0;
                        a.fallStartY = a.y;
                        fx.floatText(sx, e.y - 26, 'CATCH ASTRONAUT!', PAL.mint);
                    }
                    enemies.splice(ei, 1);
                }
            }
            for (let si = enemyShots.length - 1; si >= 0; si--) {
                if (Math.abs(wrappedDelta(centerWorld, enemyShots[si].x, WORLD_W)) <= W * 0.58) {
                    enemyShots.splice(si, 1);
                }
            }
            if (hits > 0) sfx(ctx, 'explodeSmall', 0.2);
        }

        function toScreenX(wx) {
            const centerWorld = wrapCoord(camX + W * 0.5, WORLD_W);
            return W * 0.5 + wrappedDelta(centerWorld, wx, WORLD_W);
        }

        function update(dt) {
            time += dt;
            fx.update(dt);
            if (bombFlash > 0) bombFlash = Math.max(0, bombFlash - dt);
            if (ended) return;

            if (input.justPressed('KeyB')) {
                triggerSmartBomb();
            }

            // Player flight
            let ax = 0;
            let ay = 0;
            if (input.anyDown(['KeyA', 'ArrowLeft'])) ax -= 1;
            if (input.anyDown(['KeyD', 'ArrowRight'])) ax += 1;
            if (input.anyDown(['KeyW', 'ArrowUp'])) ay -= 1;
            if (input.anyDown(['KeyS', 'ArrowDown'])) ay += 1;

            if (ax !== 0) {
                player.dir = ax > 0 ? 1 : -1;
                player.vx += ax * 1550 * dt;
            } else {
                player.vx *= Math.pow(0.06, dt);
            }
            player.vx = clamp(player.vx, -460, 460);
            player.vy = lerp(player.vy, ay * 320, Math.min(1, dt * 12));

            player.x = wrapCoord(player.x + player.vx * dt, WORLD_W);
            player.y = clamp(player.y + player.vy * dt, RADAR_H + 22, terrainY(player.x) - 16);

            if (player.invuln > 0) player.invuln = Math.max(0, player.invuln - dt);

            // Smooth camera leading forward of player direction
            const desiredCenter = wrapCoord(player.x + player.dir * 165, WORLD_W);
            const curCenter = wrapCoord(camX + W * 0.5, WORLD_W);
            const camErr = wrappedDelta(curCenter, desiredCenter, WORLD_W);
            camX = wrapCoord(camX + camErr * Math.min(1, dt * 6.5), WORLD_W);

            stars.update(dt, -player.vx * 0.25, 0);

            if (Math.abs(player.vx) > 40 && Math.random() < 0.7) {
                const psx = toScreenX(player.x);
                fx.spawn(psx - player.dir * 18, player.y, -player.dir * 90, randRange(-18, 18), PAL.sky, 2.5, 0.2);
            }

            // Long horizontal beam fire
            fireCd = Math.max(0, fireCd - dt);
            if ((input.anyDown(['Space', 'KeyZ']) || input.pointer.isDown) && fireCd <= 0) {
                fireCd = 0.14;
                sfx(ctx, 'shootLaser', 0.12);
                beams.push({
                    x: wrapCoord(player.x + player.dir * 26, WORLD_W),
                    y: player.y,
                    dir: player.dir,
                    speed: 1180,
                    len: 170,
                    life: 0.42
                });
            }

            // Spawn waves of Landers
            if (spawnPending > 0) {
                spawnTimer -= dt;
                if (spawnTimer <= 0) {
                    const batch = Math.min(3, spawnPending);
                    spawnPending -= batch;
                    spawnTimer = 3.2;
                    for (let i = 0; i < batch; i++) {
                        const kind = Math.random() < 0.24 ? 'bomber' : (mutantAlerted ? 'mutant' : 'lander');
                        spawnEnemy(kind, wrapCoord(player.x + randRange(360, WORLD_W - 360), WORLD_W), randRange(80, 175));
                    }
                }
            }

            // Update beams & hit enemies
            for (let i = beams.length - 1; i >= 0; i--) {
                const b = beams[i];
                b.x = wrapCoord(b.x + b.dir * b.speed * dt, WORLD_W);
                b.life -= dt;
                if (b.life <= 0) {
                    beams.splice(i, 1);
                    continue;
                }
                let hit = false;
                for (let ei = enemies.length - 1; ei >= 0; ei--) {
                    const e = enemies[ei];
                    const dx = wrappedDelta(b.x, e.x, WORLD_W);
                    const along = dx * b.dir;
                    if (along >= -b.len && along <= 26 && Math.abs(e.y - b.y) < 22) {
                        e.hp -= 1;
                        e.hitFlash = 0.1;
                        hit = true;
                        const sx = toScreenX(e.x);
                        if (e.hp <= 0) {
                            const pts = e.kind === 'mutant' ? 200 : 150;
                            score += pts;
                            sfx(ctx, 'explodeSmall', 0.14);
                            fx.burst(sx, e.y, 16, e.kind === 'mutant' ? PAL.coral : PAL.amber, 210, 3.8, 0.5);
                            fx.floatText(sx, e.y - 12, '+' + pts, PAL.sky);
                            if (e.carryingAstro) {
                                const a = e.carryingAstro;
                                a.carrier = null;
                                a.state = 'falling';
                                a.vy = 0;
                                a.fallStartY = a.y;
                                fx.floatText(sx, e.y - 30, 'CATCH ASTRONAUT!', PAL.mint);
                            }
                            enemies.splice(ei, 1);
                        } else {
                            sfx(ctx, 'hitMetal', 0.15);
                            fx.burst(sx, e.y, 6, PAL.white, 120, 2, 0.2);
                        }
                        break;
                    }
                }
                if (hit) beams.splice(i, 1);
            }

            // Update astronauts
            for (let i = astronauts.length - 1; i >= 0; i--) {
                const a = astronauts[i];
                const ground = terrainY(a.x) - 12;
                if (a.state === 'ground') {
                    a.x = wrapCoord(a.x + a.walkDir * 12 * dt, WORLD_W);
                    a.y = terrainY(a.x) - 12;
                } else if (a.state === 'falling') {
                    a.vy = Math.min(260, a.vy + 195 * dt);
                    a.y += a.vy * dt;
                    // Check player mid-air rescue catch!
                    if (!player.carrying && Math.abs(wrappedDelta(player.x, a.x, WORLD_W)) < 28 && Math.abs(player.y - a.y) < 28) {
                        a.state = 'carried';
                        player.carrying = a;
                        score += 500;
                        sfx(ctx, 'powerup');
                        const sx = toScreenX(a.x);
                        fx.ring(sx, a.y, 44, PAL.mint, 0.35);
                        fx.floatText(sx, a.y - 24, 'RESCUE +500!', PAL.mint, 1.2);
                        continue;
                    }
                    // Impact ground
                    if (a.y >= ground) {
                        if (ground - a.fallStartY > 125) {
                            // High altitude fatal impact
                            sfx(ctx, 'explodeSmall');
                            const sx = toScreenX(a.x);
                            fx.burst(sx, ground, 14, PAL.coral, 150, 3, 0.45);
                            fx.floatText(sx, ground - 16, 'ASTRONAUT LOST', PAL.coral);
                            astronauts.splice(i, 1);
                        } else {
                            a.y = ground;
                            a.vy = 0;
                            a.state = 'ground';
                            score += 250;
                            sfx(ctx, 'xpPickup');
                            fx.floatText(toScreenX(a.x), ground - 18, 'SAFE LANDING +250', PAL.mint);
                        }
                    }
                } else if (a.state === 'carried') {
                    a.x = player.x;
                    a.y = player.y + 22;
                    if (a.y >= terrainY(a.x) - 18) {
                        a.y = terrainY(a.x) - 12;
                        a.state = 'ground';
                        player.carrying = null;
                        score += 250;
                        sfx(ctx, 'chestOpen');
                        fx.floatText(toScreenX(a.x), a.y - 24, 'SAFE DROPOFF +250', PAL.amber);
                    }
                }
            }

            // If all astronauts lost -> remaining Landers mutate!
            if (astronauts.length === 0 && !mutantAlerted) {
                mutantAlerted = true;
                sfx(ctx, 'bossAlarm');
                fx.showBanner('ALL ASTRONAUTS LOST!', 'LANDERS MUTATED INTO HUNTERS!', PAL.coral, 2.4);
                for (let i = 0; i < enemies.length; i++) {
                    if (enemies[i].kind === 'lander') {
                        enemies[i].kind = 'mutant';
                        enemies[i].hp = 2;
                    }
                }
            }

            // Update enemies
            for (let i = enemies.length - 1; i >= 0; i--) {
                const e = enemies[i];
                e.phase += dt * 3;
                if (e.hitFlash > 0) e.hitFlash = Math.max(0, e.hitFlash - dt);

                if (e.kind === 'lander') {
                    if (e.carryingAstro) {
                        e.vx = 0;
                        e.vy = -(48 + stage * 5);
                        e.y += e.vy * dt;
                        e.carryingAstro.x = e.x;
                        e.carryingAstro.y = e.y + 26;
                        if (e.y <= RADAR_H + 22) {
                            // Abduction complete -> Mutate!
                            const idx = astronauts.indexOf(e.carryingAstro);
                            if (idx >= 0) astronauts.splice(idx, 1);
                            e.carryingAstro = null;
                            e.kind = 'mutant';
                            e.hp = 2;
                            sfx(ctx, 'bossAlarm');
                            fx.floatText(toScreenX(e.x), e.y + 20, 'MUTANT EVOLVED!', PAL.coral);
                        }
                    } else {
                        // Look for an available ground astronaut nearby
                        if (!e.targetAstro || e.targetAstro.state !== 'ground') {
                            e.targetAstro = null;
                            let bestD = 320;
                            for (let ai = 0; ai < astronauts.length; ai++) {
                                const a = astronauts[ai];
                                if (a.state !== 'ground') continue;
                                const d = Math.abs(wrappedDelta(e.x, a.x, WORLD_W));
                                if (d < bestD) { bestD = d; e.targetAstro = a; }
                            }
                        }
                        if (e.targetAstro) {
                            const dx = wrappedDelta(e.x, e.targetAstro.x, WORLD_W);
                            e.vx = clamp(dx * 2.2, -135, 135);
                            const ty = e.targetAstro.y - 24;
                            e.vy = clamp((ty - e.y) * 2.0, -90, 95);
                            e.x = wrapCoord(e.x + e.vx * dt, WORLD_W);
                            e.y = clamp(e.y + e.vy * dt, RADAR_H + 22, terrainY(e.x) - 20);
                            if (Math.abs(dx) < 16 && Math.abs(e.y - (e.targetAstro.y - 24)) < 16) {
                                e.carryingAstro = e.targetAstro;
                                e.carryingAstro.state = 'abducted';
                                e.carryingAstro.carrier = e;
                                e.targetAstro = null;
                                sfx(ctx, 'emp', 0.1);
                            }
                        } else {
                            e.x = wrapCoord(e.x + e.vx * dt, WORLD_W);
                            e.y = clamp(e.y + Math.sin(e.phase) * 48 * dt, RADAR_H + 28, 340);
                        }
                    }
                } else if (e.kind === 'bomber') {
                    e.x = wrapCoord(e.x + e.vx * dt, WORLD_W);
                    e.y = clamp(e.y + Math.cos(e.phase * 0.8) * 65 * dt, RADAR_H + 30, 360);
                } else if (e.kind === 'mutant') {
                    const dx = wrappedDelta(e.x, player.x, WORLD_W);
                    const dy = player.y - e.y;
                    e.vx = clamp(dx * 2.6, -240, 240);
                    e.vy = clamp(dy * 2.2 + Math.sin(e.phase * 3) * 110, -180, 180);
                    e.x = wrapCoord(e.x + e.vx * dt, WORLD_W);
                    e.y = clamp(e.y + e.vy * dt, RADAR_H + 22, terrainY(e.x) - 18);
                }

                // Enemy shooting
                e.fireCd -= dt;
                if (e.fireCd <= 0) {
                    e.fireCd = e.kind === 'mutant' ? randRange(1.2, 2.2) : randRange(2.4, 4.2);
                    const dx = wrappedDelta(e.x, player.x, WORLD_W);
                    if (Math.abs(dx) < 420) {
                        const ang = Math.atan2(player.y - e.y, dx);
                        const spd = e.kind === 'bomber' ? 75 : 230;
                        enemyShots.push({
                            x: e.x,
                            y: e.y,
                            vx: e.kind === 'bomber' ? 0 : Math.cos(ang) * spd,
                            vy: e.kind === 'bomber' ? 38 : Math.sin(ang) * spd,
                            life: e.kind === 'bomber' ? 5.5 : 2.5,
                            mine: e.kind === 'bomber'
                        });
                    }
                }

                // Player body collision
                if (Math.abs(wrappedDelta(player.x, e.x, WORLD_W)) < 24 && Math.abs(player.y - e.y) < 22) {
                    if (e.carryingAstro) {
                        e.carryingAstro.carrier = null;
                        e.carryingAstro.state = 'falling';
                        e.carryingAstro.vy = 0;
                        e.carryingAstro.fallStartY = e.carryingAstro.y;
                    }
                    enemies.splice(i, 1);
                    damagePlayer();
                }
            }

            // Enemy shots
            for (let i = enemyShots.length - 1; i >= 0; i--) {
                const s = enemyShots[i];
                s.x = wrapCoord(s.x + s.vx * dt, WORLD_W);
                s.y += s.vy * dt;
                s.life -= dt;
                if (s.life <= 0 || s.y < RADAR_H || s.y > H) {
                    enemyShots.splice(i, 1);
                    continue;
                }
                if (Math.abs(wrappedDelta(player.x, s.x, WORLD_W)) < 18 && Math.abs(player.y - s.y) < 16) {
                    enemyShots.splice(i, 1);
                    damagePlayer();
                }
            }

            // Wave clear / Level win
            if (spawnPending === 0 && enemies.length === 0) {
                score += astronauts.length * 100;
                if (bombs < 3) bombs += 1;
                if (ctx.isStory && wave >= 2) {
                    ended = true;
                    sfx(ctx, 'levelup');
                    ctx.onWin?.({ score: Math.floor(score), level: stage, wave, astronautsSaved: astronauts.length });
                    return;
                }
                if (wave >= 2 && wave % 2 === 0) stage += 1;
                sfx(ctx, 'levelup');
                startWave(wave + 1);
            }
        }

        function renderRadar(g) {
            g.save();
            g.fillStyle = 'rgba(5, 9, 20, 0.92)';
            g.fillRect(0, 0, W, RADAR_H);
            g.strokeStyle = 'rgba(56, 189, 248, 0.45)';
            g.lineWidth = 1.5;
            g.beginPath();
            g.moveTo(0, RADAR_H);
            g.lineTo(W, RADAR_H);
            g.stroke();

            const centerWorld = wrapCoord(camX + W * 0.5, WORLD_W);
            const mapX = (wx) => W * 0.5 + (wrappedDelta(centerWorld, wx, WORLD_W) / WORLD_W) * (W - 40);

            // Viewport box in radar center
            const vw = (W / WORLD_W) * (W - 40);
            g.strokeStyle = 'rgba(56, 189, 248, 0.65)';
            g.fillStyle = 'rgba(56, 189, 248, 0.08)';
            g.fillRect(W * 0.5 - vw * 0.5, 4, vw, RADAR_H - 8);
            g.strokeRect(W * 0.5 - vw * 0.5, 4, vw, RADAR_H - 8);

            // Mini terrain line
            g.beginPath();
            for (let px = 20; px <= W - 20; px += 12) {
                const wx = wrapCoord(centerWorld + ((px - W * 0.5) / (W - 40)) * WORLD_W, WORLD_W);
                const ty = 12 + (terrainY(wx) / H) * (RADAR_H - 16);
                if (px === 20) g.moveTo(px, ty);
                else g.lineTo(px, ty);
            }
            g.strokeStyle = 'rgba(52, 211, 153, 0.42)';
            g.lineWidth = 1;
            g.stroke();

            // Astronaut blips
            for (let i = 0; i < astronauts.length; i++) {
                const a = astronauts[i];
                const rx = clamp(mapX(a.x), 20, W - 20);
                const ry = clamp(8 + (a.y / H) * (RADAR_H - 14), 6, RADAR_H - 6);
                g.fillStyle = a.state === 'abducted' ? (Math.floor(time * 10) % 2 ? PAL.coral : PAL.white) : PAL.mint;
                g.fillRect(rx - 2, ry - 2, 4, 4);
            }

            // Enemy blips (pulse final <=3 stragglers so none vanish off-radar)
            const fewRemaining = (enemies.length + spawnPending) <= 3;
            for (let i = 0; i < enemies.length; i++) {
                const e = enemies[i];
                const rx = clamp(mapX(e.x), 20, W - 20);
                const ry = clamp(8 + (e.y / H) * (RADAR_H - 14), 6, RADAR_H - 6);
                g.fillStyle = e.carryingAstro ? PAL.coral : (e.kind === 'mutant' ? '#ff3366' : PAL.amber);
                g.fillRect(rx - 2.5, ry - 2.5, 5, 5);
                if (e.carryingAstro || fewRemaining) {
                    const pulseR = 6 + Math.sin(time * 10 + i) * 2;
                    g.strokeStyle = e.carryingAstro ? PAL.coral : PAL.amber;
                    g.lineWidth = 1.2;
                    g.strokeRect(rx - pulseR, ry - pulseR, pulseR * 2, pulseR * 2);
                }
            }

            // Player blip
            const prx = clamp(mapX(player.x), 20, W - 20);
            const pry = clamp(8 + (player.y / H) * (RADAR_H - 14), 6, RADAR_H - 6);
            g.fillStyle = PAL.sky;
            g.fillRect(prx - 3, pry - 3, 6, 6);

            g.font = '700 10px "JetBrains Mono", monospace';
            g.fillStyle = PAL.sky;
            g.textAlign = 'left';
            g.fillText('SCANNER 2800PX · BOMBS: ' + bombs, 12, 15);
            g.textAlign = 'right';
            g.fillStyle = PAL.mint;
            g.fillText('PILOTS: ' + astronauts.length + ' · FOES: ' + (enemies.length + spawnPending), W - 12, 15);
            g.restore();
        }

        function render(g) {
            g.save();
            fx.applyShake(g);
            stars.draw(g, '#040712', '#0b182e');

            // Planet surface ridge wrapping seamlessly
            g.save();
            g.beginPath();
            g.moveTo(0, H);
            for (let sx = 0; sx <= W; sx += 16) {
                const wx = wrapCoord(camX + sx, WORLD_W);
                g.lineTo(sx, terrainY(wx));
            }
            g.lineTo(W, H);
            g.closePath();
            const tGrad = g.createLinearGradient(0, 410, 0, H);
            tGrad.addColorStop(0, '#0f2847');
            tGrad.addColorStop(1, '#060c1a');
            g.fillStyle = tGrad;
            g.fill();

            g.beginPath();
            for (let sx = 0; sx <= W; sx += 16) {
                const wx = wrapCoord(camX + sx, WORLD_W);
                const y = terrainY(wx);
                if (sx === 0) g.moveTo(sx, y);
                else g.lineTo(sx, y);
            }
            g.strokeStyle = PAL.mint;
            g.lineWidth = 2;
            g.shadowColor = PAL.mint;
            g.shadowBlur = 10;
            g.stroke();
            g.restore();

            // Astronauts
            for (let i = 0; i < astronauts.length; i++) {
                const a = astronauts[i];
                const sx = toScreenX(a.x);
                if (sx < -40 || sx > W + 40) continue;
                drawSprite(g, ctx.sprites, 'astronaut', sx, a.y, 26, 26, {
                    flipX: a.walkDir < 0,
                    glow: a.state === 'falling' ? PAL.mint : null,
                    glowBlur: 10
                });
            }

            // Beams (long horizontal Defender shots)
            g.save();
            for (let i = 0; i < beams.length; i++) {
                const b = beams[i];
                const sx = toScreenX(b.x);
                if (sx < -220 || sx > W + 220) continue;
                const tailX = sx - b.dir * b.len;
                const grad = g.createLinearGradient(tailX, b.y, sx, b.y);
                grad.addColorStop(0, 'rgba(56,189,248,0)');
                grad.addColorStop(0.55, 'rgba(56,189,248,0.85)');
                grad.addColorStop(1, '#ffffff');
                g.strokeStyle = grad;
                g.lineWidth = 3.5;
                g.beginPath();
                g.moveTo(tailX, b.y);
                g.lineTo(sx, b.y);
                g.stroke();
            }
            g.restore();

            // Enemy shots
            for (let i = 0; i < enemyShots.length; i++) {
                const s = enemyShots[i];
                const sx = toScreenX(s.x);
                if (sx < -30 || sx > W + 30) continue;
                drawSprite(g, ctx.sprites, 'plasma_bomb', sx, s.y, s.mine ? 20 : 14, s.mine ? 20 : 14, {
                    angle: time * (s.mine ? 3 : 8),
                    glow: PAL.coral,
                    glowBlur: 10
                });
            }

            // Enemies + tractor beams
            for (let i = 0; i < enemies.length; i++) {
                const e = enemies[i];
                const sx = toScreenX(e.x);
                if (sx < -48 || sx > W + 48) continue;
                if (e.carryingAstro) {
                    g.save();
                    g.strokeStyle = 'rgba(251, 113, 133, 0.75)';
                    g.lineWidth = 2;
                    g.beginPath();
                    g.moveTo(sx - 6, e.y + 10);
                    g.lineTo(sx, e.y + 26);
                    g.lineTo(sx + 6, e.y + 10);
                    g.stroke();
                    g.restore();
                }
                const spr = e.kind === 'mutant' ? 'alien_drone' : (e.kind === 'bomber' ? 'moon_lander' : 'ufo');
                drawSprite(g, ctx.sprites, spr, sx, e.y, 34, 34, {
                    hitFlash: e.hitFlash > 0,
                    glow: e.kind === 'mutant' ? PAL.coral : (e.carryingAstro ? PAL.amber : PAL.violet),
                    glowBlur: 12
                });
            }

            // Player fighter rotated horizontally
            const psx = toScreenX(player.x);
            if (!(player.invuln > 0 && Math.floor(time * 16) % 2 === 0) && !ended) {
                drawSprite(g, ctx.sprites, 'fighter', psx, player.y, 40, 40, {
                    angle: player.dir > 0 ? Math.PI * 0.5 : -Math.PI * 0.5,
                    glow: PAL.sky,
                    glowBlur: 14
                });
            }

            // Off-screen directional markers for abductors & final stragglers
            const centerW = wrapCoord(camX + W * 0.5, WORLD_W);
            let shownStraggler = false;
            for (let i = 0; i < enemies.length; i++) {
                const e = enemies[i];
                const dx = wrappedDelta(centerW, e.x, WORLD_W);
                if (Math.abs(dx) <= W * 0.48) continue;
                const isPriority = !!e.carryingAstro || (enemies.length <= 3 && !shownStraggler);
                if (!isPriority) continue;
                if (!e.carryingAstro) shownStraggler = true;
                const side = dx > 0 ? 1 : -1;
                const mx = side > 0 ? W - 26 : 26;
                const my = clamp(e.y, RADAR_H + 26, H - 46);
                const col = e.carryingAstro ? PAL.coral : PAL.amber;
                g.save();
                g.fillStyle = col;
                g.shadowColor = col;
                g.shadowBlur = 10;
                g.beginPath();
                g.moveTo(mx + side * 9, my);
                g.lineTo(mx - side * 5, my - 7);
                g.lineTo(mx - side * 5, my + 7);
                g.closePath();
                g.fill();
                g.font = '800 9px "JetBrains Mono", monospace';
                g.textAlign = side > 0 ? 'right' : 'left';
                g.fillText(e.carryingAstro ? 'ABDUCT!' : 'FOE', mx - side * 10, my + 3);
                g.restore();
            }

            if (bombFlash > 0) {
                g.save();
                g.fillStyle = 'rgba(255, 255, 255, ' + (bombFlash * 1.4).toFixed(2) + ')';
                g.fillRect(0, RADAR_H, W, H - RADAR_H);
                g.restore();
            }

            fx.drawParticles(g);
            renderRadar(g);
            fx.drawOverlays(g);
            drawInCanvasFooter(g, '[WASD / Arrows] Thrust  ·  [Space / Click] Beam  ·  [B] Smart Bomb  ·  Catch Falling Pilots!');
            g.restore();
        }

        function getHud() {
            return {
                score: Math.floor(score),
                level: stage,
                wave,
                lives,
                hp: lives,
                maxHp: 3,
                status: 'PILOTS ' + astronauts.length + ' · ENEMIES ' + (enemies.length + spawnPending) + ' · BOMBS ' + bombs
            };
        }

        return { init, update, render, getHud };
    }

    // =========================================================================
    // 3. ASTRO VECTOR ASTEROIDS (`astro-vector-asteroids`)
    // =========================================================================
    function createAsteroidsEngine(ctx, canvas, g, input) {
        const stars = createStarfield(115);
        const fx = createFxSystem();

        let stage = 1;
        let score = 0;
        let lives = 3;
        let ended = false;
        let time = 0;
        let fireCd = 0;
        let hyperCd = 0;
        let ufoTimer = 14;
        let ufo = null;

        let ship = null;
        let bullets = [];
        let enemyBullets = [];
        let asteroids = [];
        let pickups = [];
        let warpFlashes = [];

        function makePoly(verts, radius) {
            const pts = [];
            for (let i = 0; i < verts; i++) {
                const a = (i / verts) * TAU;
                const r = radius * randRange(0.82, 1.14);
                pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
            }
            return pts;
        }

        function spawnAsteroid(sizeTier, x, y, forcedAng) {
            const radius = sizeTier === 3 ? 38 : (sizeTier === 2 ? 23 : 13);
            const speed = (sizeTier === 3 ? 62 : (sizeTier === 2 ? 98 : 138)) * (1 + (stage - 1) * 0.12);
            const ang = forcedAng !== undefined ? forcedAng : Math.random() * TAU;
            let ax = x;
            let ay = y;
            if (ax === undefined || ay === undefined) {
                const refX = ship ? ship.x : W * 0.5;
                const refY = ship ? ship.y : H * 0.5;
                for (let tries = 0; tries < 40; tries++) {
                    ax = Math.random() * W;
                    ay = Math.random() * H;
                    if (wrappedDistSq(ax, ay, refX, refY) >= 175 * 175) break;
                }
            } else {
                ax = wrapCoord(ax, W);
                ay = wrapCoord(ay, H);
            }
            asteroids.push({
                x: ax,
                y: ay,
                vx: Math.cos(ang) * speed,
                vy: Math.sin(ang) * speed,
                rot: Math.random() * TAU,
                rotSpd: randRange(-1.8, 1.8),
                tier: sizeTier,
                r: radius,
                poly: makePoly(sizeTier === 3 ? 10 : 8, radius)
            });
        }

        function resetShip() {
            ship = {
                x: W * 0.5,
                y: H * 0.5,
                vx: 0,
                vy: 0,
                angle: -Math.PI * 0.5,
                invuln: 2.2,
                rapidTimer: 0
            };
        }

        function init(lvl) {
            stage = lvl;
            score = 0;
            lives = 3;
            ended = false;
            time = 0;
            fireCd = 0;
            hyperCd = 0;
            ufoTimer = Math.max(9, 18 - lvl * 1.5);
            ufo = null;
            bullets = [];
            enemyBullets = [];
            asteroids = [];
            pickups = [];
            warpFlashes = [];
            resetShip();

            const count = 3 + lvl;
            for (let i = 0; i < count; i++) spawnAsteroid(3);
            fx.showBanner('SECTOR ' + stage + ' ASTEROID BELT', 'ROTATE · THRUST · HYPER-JUMP [SHIFT]', PAL.sky, 2.2);
        }

        function damageShip() {
            if (ship.invuln > 0 || ended) return;
            lives--;
            sfx(ctx, 'playerHurt');
            fx.burst(ship.x, ship.y, 28, PAL.coral, 260, 4.5, 0.65);
            fx.ring(ship.x, ship.y, 70, PAL.coral, 0.45);
            fx.shake(10, 0.35);
            if (lives <= 0) {
                ended = true;
                ctx.onGameOver?.({ score: Math.floor(score), level: stage, wave: stage });
                return;
            }
            ship.x = W * 0.5;
            ship.y = H * 0.5;
            ship.vx = 0;
            ship.vy = 0;
            ship.invuln = 2.6;
            // Clear/push immediate center hazards so respawn is safe
            for (let i = enemyBullets.length - 1; i >= 0; i--) {
                if (wrappedDistSq(enemyBullets[i].x, enemyBullets[i].y, ship.x, ship.y) < 165 * 165) {
                    enemyBullets.splice(i, 1);
                }
            }
            for (let i = 0; i < asteroids.length; i++) {
                const a = asteroids[i];
                const dx = wrappedDelta(ship.x, a.x, W);
                const dy = wrappedDelta(ship.y, a.y, H);
                const d = Math.hypot(dx, dy);
                if (d < 120) {
                    const pushAng = d > 1 ? Math.atan2(dy, dx) : Math.random() * TAU;
                    a.x = wrapCoord(ship.x + Math.cos(pushAng) * 145, W);
                    a.y = wrapCoord(ship.y + Math.sin(pushAng) * 145, H);
                }
            }
        }

        function tryHyperJump() {
            if (hyperCd > 0) return;
            hyperCd = 5.0;
            sfx(ctx, 'dash');
            warpFlashes.push({ x: ship.x, y: ship.y, life: 0.48, maxLife: 0.48, size: 54 });
            fx.ring(ship.x, ship.y, 52, PAL.violet, 0.35, 3);
            fx.burst(ship.x, ship.y, 16, PAL.violet, 180, 3, 0.35);

            // Find safest jump spot
            let bestX = randRange(70, W - 70);
            let bestY = randRange(70, H - 70);
            let bestClear = 0;
            for (let tries = 0; tries < 14; tries++) {
                const tx = randRange(60, W - 60);
                const ty = randRange(60, H - 60);
                let minD = 999999;
                for (let i = 0; i < asteroids.length; i++) {
                    minD = Math.min(minD, dist(tx, ty, asteroids[i].x, asteroids[i].y) - asteroids[i].r);
                }
                if (minD > bestClear) {
                    bestClear = minD;
                    bestX = tx;
                    bestY = ty;
                }
            }
            ship.x = bestX;
            ship.y = bestY;
            ship.vx *= 0.25;
            ship.vy *= 0.25;
            ship.invuln = Math.max(ship.invuln, 0.6);
            warpFlashes.push({ x: ship.x, y: ship.y, life: 0.52, maxLife: 0.52, size: 60 });
            fx.ring(ship.x, ship.y, 58, PAL.sky, 0.38, 3);
            fx.floatText(ship.x, ship.y - 26, 'HYPER JUMP!', PAL.violet);
        }

        function wrappedDistSq(ax, ay, bx, by) {
            const dx = wrappedDelta(ax, bx, W);
            const dy = wrappedDelta(ay, by, H);
            return dx * dx + dy * dy;
        }

        function update(dt) {
            time += dt;
            fx.update(dt);
            if (ended) return;

            if (ship.invuln > 0) ship.invuln = Math.max(0, ship.invuln - dt);
            if (ship.rapidTimer > 0) ship.rapidTimer = Math.max(0, ship.rapidTimer - dt);
            if (hyperCd > 0) hyperCd = Math.max(0, hyperCd - dt);
            for (let i = warpFlashes.length - 1; i >= 0; i--) {
                warpFlashes[i].life -= dt;
                if (warpFlashes[i].life <= 0) warpFlashes.splice(i, 1);
            }

            // Ship rotation & thrust
            if (input.anyDown(['KeyA', 'ArrowLeft'])) ship.angle -= 3.9 * dt;
            if (input.anyDown(['KeyD', 'ArrowRight'])) ship.angle += 3.9 * dt;
            const thrusting = input.anyDown(['KeyW', 'ArrowUp']);
            if (thrusting) {
                const accel = 420;
                ship.vx += Math.cos(ship.angle) * accel * dt;
                ship.vy += Math.sin(ship.angle) * accel * dt;
                if (Math.random() < 0.85) {
                    const bx = ship.x - Math.cos(ship.angle) * 18;
                    const by = ship.y - Math.sin(ship.angle) * 18;
                    fx.spawn(
                        bx, by,
                        -Math.cos(ship.angle) * randRange(80, 160) + randRange(-25, 25),
                        -Math.sin(ship.angle) * randRange(80, 160) + randRange(-25, 25),
                        Math.random() < 0.5 ? PAL.sky : PAL.amber,
                        3,
                        0.26,
                        'glow'
                    );
                }
            }
            const drag = Math.pow(0.991, dt * 60);
            ship.vx *= drag;
            ship.vy *= drag;
            const spd = Math.hypot(ship.vx, ship.vy);
            if (spd > 420) {
                ship.vx = (ship.vx / spd) * 420;
                ship.vy = (ship.vy / spd) * 420;
            }
            ship.x = wrapCoord(ship.x + ship.vx * dt, W);
            ship.y = wrapCoord(ship.y + ship.vy * dt, H);

            stars.update(dt, -ship.vx * 0.12, -ship.vy * 0.12 + 8);

            if (input.anyPressed(['ShiftLeft', 'ShiftRight', 'KeyE'])) {
                tryHyperJump();
            }

            // Fire
            fireCd = Math.max(0, fireCd - dt);
            if ((input.anyDown(['Space', 'KeyZ']) || input.pointer.isDown) && fireCd <= 0 && bullets.length < 10) {
                fireCd = ship.rapidTimer > 0 ? 0.1 : 0.19;
                sfx(ctx, 'shootLaser', 0.14);
                const bspd = 650;
                bullets.push({
                    x: wrapCoord(ship.x + Math.cos(ship.angle) * 20, W),
                    y: wrapCoord(ship.y + Math.sin(ship.angle) * 20, H),
                    vx: Math.cos(ship.angle) * bspd + ship.vx * 0.25,
                    vy: Math.sin(ship.angle) * bspd + ship.vy * 0.25,
                    life: 1.05
                });
            }

            // Hunter UFO spawner
            ufoTimer -= dt;
            if (!ufo && ufoTimer <= 0 && asteroids.length > 0) {
                const fromLeft = Math.random() < 0.5;
                ufo = {
                    x: fromLeft ? 10 : W - 10,
                    y: randRange(70, H - 70),
                    vx: fromLeft ? 135 : -135,
                    vy: randRange(-35, 35),
                    fireCd: 1.3,
                    dirTimer: 2.2
                };
                sfx(ctx, 'bossAlarm');
                fx.ring(ufo.x, ufo.y, 44, PAL.coral, 0.4);
                fx.floatText(ufo.x + (fromLeft ? 60 : -60), ufo.y - 20, 'HUNTER UFO WARPED IN!', PAL.coral);
                ufoTimer = Math.max(12, 22 - stage * 1.2);
            }

            // Update bullets
            for (let i = bullets.length - 1; i >= 0; i--) {
                const b = bullets[i];
                b.x = wrapCoord(b.x + b.vx * dt, W);
                b.y = wrapCoord(b.y + b.vy * dt, H);
                b.life -= dt;
                if (b.life <= 0) bullets.splice(i, 1);
            }

            // Update asteroids
            for (let i = asteroids.length - 1; i >= 0; i--) {
                const a = asteroids[i];
                a.x = wrapCoord(a.x + a.vx * dt, W);
                a.y = wrapCoord(a.y + a.vy * dt, H);
                a.rot += a.rotSpd * dt;

                // Bullet hit asteroid
                let hit = false;
                for (let bi = bullets.length - 1; bi >= 0; bi--) {
                    const b = bullets[bi];
                    if (wrappedDistSq(b.x, b.y, a.x, a.y) < (a.r + 5) * (a.r + 5)) {
                        bullets.splice(bi, 1);
                        hit = true;
                        break;
                    }
                }
                if (hit) {
                    const pts = a.tier === 3 ? 100 : (a.tier === 2 ? 150 : 250);
                    score += pts;
                    sfx(ctx, 'explodeSmall', 0.2);
                    fx.burst(a.x, a.y, a.tier * 6 + 4, a.tier === 1 ? PAL.mint : PAL.sky, 180, 3.2, 0.45);
                    fx.ring(a.x, a.y, a.r + 14, PAL.sky, 0.28);
                    fx.floatText(a.x, a.y, '+' + pts, PAL.sky);
                    if (a.tier > 1) {
                        const splitBase = Math.atan2(a.vy, a.vx);
                        spawnAsteroid(a.tier - 1, a.x + randRange(-8, 8), a.y + randRange(-8, 8), splitBase + 0.55);
                        spawnAsteroid(a.tier - 1, a.x + randRange(-8, 8), a.y + randRange(-8, 8), splitBase - 0.55);
                    } else if (Math.random() < 0.2) {
                        pickups.push({
                            x: a.x,
                            y: a.y,
                            type: Math.random() < 0.55 ? 'rapid' : 'star',
                            life: 9.0
                        });
                    }
                    asteroids.splice(i, 1);
                    continue;
                }

                // Ship hit asteroid
                if (wrappedDistSq(ship.x, ship.y, a.x, a.y) < (a.r + 13) * (a.r + 13)) {
                    damageShip();
                }
            }

            // Update Hunter UFO
            if (ufo) {
                ufo.dirTimer -= dt;
                if (ufo.dirTimer <= 0) {
                    ufo.dirTimer = randRange(1.4, 2.8);
                    ufo.vy = randRange(-75, 75);
                }
                ufo.x += ufo.vx * dt;
                ufo.y = wrapCoord(ufo.y + ufo.vy * dt, H);
                ufo.fireCd -= dt;
                if (ufo.fireCd <= 0) {
                    ufo.fireCd = Math.max(0.85, 1.8 - stage * 0.1);
                    const dx = wrappedDelta(ufo.x, ship.x, W);
                    const dy = wrappedDelta(ufo.y, ship.y, H);
                    const spread = Math.max(0.05, 0.28 - stage * 0.03);
                    const ang = Math.atan2(dy, dx) + randRange(-spread, spread);
                    sfx(ctx, 'shootPlasma', 0.14);
                    enemyBullets.push({
                        x: ufo.x,
                        y: ufo.y,
                        vx: Math.cos(ang) * 320,
                        vy: Math.sin(ang) * 320,
                        life: 2.0
                    });
                }

                // Bullets hit UFO
                for (let bi = bullets.length - 1; bi >= 0; bi--) {
                    const b = bullets[bi];
                    if (wrappedDistSq(b.x, b.y, ufo.x, ufo.y) < 24 * 24) {
                        bullets.splice(bi, 1);
                        score += 500;
                        sfx(ctx, 'explodeBoss');
                        fx.burst(ufo.x, ufo.y, 26, PAL.amber, 260, 4, 0.6);
                        fx.ring(ufo.x, ufo.y, 64, PAL.amber, 0.4);
                        fx.floatText(ufo.x, ufo.y, 'HUNTER +500!', PAL.amber, 1.2);
                        pickups.push({ x: ufo.x, y: ufo.y, type: 'rapid', life: 10 });
                        ufo = null;
                        break;
                    }
                }
                if (ufo && (ufo.x < -40 || ufo.x > W + 40)) {
                    ufo = null;
                } else if (ufo && wrappedDistSq(ship.x, ship.y, ufo.x, ufo.y) < 28 * 28) {
                    damageShip();
                }
            }

            // Enemy bullets
            for (let i = enemyBullets.length - 1; i >= 0; i--) {
                const eb = enemyBullets[i];
                eb.x = wrapCoord(eb.x + eb.vx * dt, W);
                eb.y = wrapCoord(eb.y + eb.vy * dt, H);
                eb.life -= dt;
                if (eb.life <= 0) {
                    enemyBullets.splice(i, 1);
                    continue;
                }
                if (wrappedDistSq(ship.x, ship.y, eb.x, eb.y) < 17 * 17) {
                    enemyBullets.splice(i, 1);
                    damageShip();
                }
            }

            // Pickups
            for (let i = pickups.length - 1; i >= 0; i--) {
                const p = pickups[i];
                p.life -= dt;
                if (p.life <= 0) {
                    pickups.splice(i, 1);
                    continue;
                }
                if (wrappedDistSq(ship.x, ship.y, p.x, p.y) < 28 * 28) {
                    sfx(ctx, 'powerup');
                    if (p.type === 'rapid') {
                        ship.rapidTimer = 9.0;
                        score += 200;
                        fx.floatText(ship.x, ship.y - 24, 'RAPID PLASMA 9s!', PAL.mint);
                    } else {
                        score += 400;
                        fx.floatText(ship.x, ship.y - 24, '+400 STAR!', PAL.amber);
                    }
                    pickups.splice(i, 1);
                }
            }

            // Sector clear
            if (asteroids.length === 0 && !ufo) {
                if (ctx.isStory) {
                    ended = true;
                    sfx(ctx, 'levelup');
                    ctx.onWin?.({ score: Math.floor(score), level: stage, wave: stage });
                } else {
                    stage += 1;
                    score += 500 * stage;
                    sfx(ctx, 'levelup');
                    ship.invuln = Math.max(ship.invuln, 1.8);
                    const nextCount = Math.min(14, 3 + stage);
                    for (let i = 0; i < nextCount; i++) spawnAsteroid(3);
                    fx.showBanner('BELT ' + stage, 'NEXT ASTEROID FIELD · +' + (500 * stage), PAL.sky, 2.0);
                }
            }
        }

        function drawWrapped(x, y, margin, fn) {
            const xs = [x];
            const ys = [y];
            if (x < margin) xs.push(x + W);
            if (x > W - margin) xs.push(x - W);
            if (y < margin) ys.push(y + H);
            if (y > H - margin) ys.push(y - H);
            for (let i = 0; i < xs.length; i++) {
                for (let j = 0; j < ys.length; j++) {
                    fn(xs[i], ys[j]);
                }
            }
        }

        function render(g) {
            g.save();
            fx.applyShake(g);
            stars.draw(g, '#03060f', '#0a1226');

            // Subtle retro vector grid
            g.save();
            g.strokeStyle = 'rgba(56, 189, 248, 0.045)';
            g.lineWidth = 1;
            for (let gx = 0; gx < W; gx += 48) {
                g.beginPath(); g.moveTo(gx, 0); g.lineTo(gx, H); g.stroke();
            }
            for (let gy = 0; gy < H; gy += 48) {
                g.beginPath(); g.moveTo(0, gy); g.lineTo(W, gy); g.stroke();
            }
            g.restore();

            // Pickups
            for (let i = 0; i < pickups.length; i++) {
                const p = pickups[i];
                drawSprite(g, ctx.sprites, p.type === 'rapid' ? 'shield_battery' : 'coin_star', p.x, p.y, 26, 26, {
                    angle: Math.sin(time * 4) * 0.2,
                    glow: p.type === 'rapid' ? PAL.mint : PAL.amber
                });
            }

            // Asteroids (vector + sprite hybrid)
            for (let i = 0; i < asteroids.length; i++) {
                const a = asteroids[i];
                drawWrapped(a.x, a.y, a.r + 8, (dx, dy) => {
                    drawSprite(g, ctx.sprites, 'asteroid', dx, dy, a.r * 2.05, a.r * 2.05, {
                        angle: a.rot,
                        alpha: 0.92
                    });
                    g.save();
                    g.translate(dx, dy);
                    g.rotate(a.rot);
                    g.strokeStyle = a.tier === 3 ? PAL.sky : (a.tier === 2 ? PAL.mint : PAL.violet);
                    g.shadowColor = g.strokeStyle;
                    g.shadowBlur = 8;
                    g.lineWidth = 1.6;
                    g.beginPath();
                    for (let k = 0; k < a.poly.length; k++) {
                        if (k === 0) g.moveTo(a.poly[k].x, a.poly[k].y);
                        else g.lineTo(a.poly[k].x, a.poly[k].y);
                    }
                    g.closePath();
                    g.stroke();
                    g.restore();
                });
            }

            // Warp Rings
            for (let i = 0; i < warpFlashes.length; i++) {
                const wf = warpFlashes[i];
                const a = clamp(wf.life / wf.maxLife, 0, 1);
                drawSprite(g, ctx.sprites, 'warp_ring', wf.x, wf.y, wf.size * (1.25 - a * 0.4), wf.size * (1.25 - a * 0.4), {
                    angle: time * 5,
                    alpha: a,
                    glow: PAL.sky
                });
            }

            // Hunter UFO
            if (ufo) {
                drawSprite(g, ctx.sprites, 'ufo', ufo.x, ufo.y, 40, 40, {
                    glow: PAL.coral,
                    glowBlur: 14
                });
            }

            // Bullets
            g.save();
            for (let i = 0; i < bullets.length; i++) {
                const b = bullets[i];
                g.shadowColor = PAL.sky;
                g.shadowBlur = 10;
                g.fillStyle = PAL.white;
                g.beginPath();
                g.arc(b.x, b.y, 3.2, 0, TAU);
                g.fill();
            }
            for (let i = 0; i < enemyBullets.length; i++) {
                const eb = enemyBullets[i];
                g.shadowColor = PAL.coral;
                g.shadowBlur = 10;
                g.fillStyle = PAL.coral;
                g.beginPath();
                g.arc(eb.x, eb.y, 4, 0, TAU);
                g.fill();
            }
            g.restore();

            // Ship (vector aura + pixel fighter sprite + spawn shield indicator)
            if (ship.invuln > 0 && !ended) {
                drawWrapped(ship.x, ship.y, 30, (dx, dy) => {
                    g.save();
                    g.strokeStyle = 'rgba(56, 189, 248, ' + (0.45 + 0.35 * Math.sin(time * 12)).toFixed(2) + ')';
                    g.lineWidth = 2;
                    g.setLineDash([6, 4]);
                    g.beginPath();
                    g.arc(dx, dy, 25, time * 3, time * 3 + TAU);
                    g.stroke();
                    g.restore();
                });
            }
            const blink = ship.invuln > 0 && Math.floor(time * 16) % 2 === 0;
            if (!blink && !ended) {
                drawWrapped(ship.x, ship.y, 26, (dx, dy) => {
                    drawSprite(g, ctx.sprites, 'fighter', dx, dy, 36, 36, {
                        angle: ship.angle + Math.PI * 0.5,
                        glow: ship.rapidTimer > 0 ? PAL.mint : PAL.sky,
                        glowBlur: 12
                    });
                    g.save();
                    g.translate(dx, dy);
                    g.rotate(ship.angle);
                    g.strokeStyle = 'rgba(56, 189, 248, 0.55)';
                    g.lineWidth = 1.3;
                    g.beginPath();
                    g.moveTo(20, 0);
                    g.lineTo(-14, -12);
                    g.lineTo(-8, 0);
                    g.lineTo(-14, 12);
                    g.closePath();
                    g.stroke();
                    g.restore();
                });
            }

            // Hyper-Jump gauge top-left
            drawPillBadge(
                g,
                hyperCd <= 0 ? 'HYPER [SHIFT]: READY' : 'HYPER: ' + hyperCd.toFixed(1) + 's',
                92,
                22,
                hyperCd <= 0 ? PAL.violet : PAL.muted
            );

            fx.drawParticles(g);
            fx.drawOverlays(g);
            drawInCanvasFooter(g, '[A/D] Rotate  ·  [W] Thrust  ·  [Space] Fire  ·  [Shift] Hyper-Jump');
            g.restore();
        }

        function getHud() {
            return {
                score: Math.floor(score),
                level: stage,
                wave: stage,
                lives,
                hp: lives,
                maxHp: 3,
                status: 'ROCKS: ' + asteroids.length + (hyperCd <= 0 ? ' · HYPER READY' : '')
            };
        }

        return { init, update, render, getHud };
    }

    // =========================================================================
    // 4. COSMIC SNAKE LEVIATHAN (`cosmic-snake-leviathan`)
    // =========================================================================
    function createSnakeEngine(ctx, canvas, g, input) {
        const COLS = 40;
        const ROWS = 21;
        const CELL = 22;
        const OX = (W - COLS * CELL) * 0.5;
        const OY = 46;
        const stars = createStarfield(95);
        const fx = createFxSystem();

        let stage = 1;
        let score = 0;
        let ended = false;
        let time = 0;

        let snake = [];
        let prevSnake = [];
        let dir = { x: 1, y: 0 };
        let turnQueue = [];
        let pointerSwiped = false;
        let stepTimer = 0;
        let stepInterval = 0.115;
        let growthPending = 0;

        let walls = [];
        let wallSet = new Set();
        let portals = [];
        let crystal = null;
        let bonusStar = null;
        let crystalsEaten = 0;
        let targetCrystals = 14;
        let combo = 1;
        let comboTimer = 0;
        let maxComboTime = 6.0;
        let bonusSpawnCd = 7.0;

        const keyCell = (c, r) => c + ',' + r;

        function buildArena(lvl) {
            walls = [];
            wallSet = new Set();
            portals = [];
            const roomType = (lvl - 1) % 4;

            const addWall = (c, r) => {
                if (c < 1 || c >= COLS - 1 || r < 1 || r >= ROWS - 1) return;
                // Keep central spawn corridor clear
                if (r === 10 && c >= 4 && c <= 14) return;
                const k = keyCell(c, r);
                if (!wallSet.has(k)) {
                    wallSet.add(k);
                    walls.push({ c, r });
                }
            };

            if (roomType === 0) {
                // Twin chamber divider with middle & side gates + 1 portal pair
                for (let r = 3; r <= 7; r++) addWall(20, r);
                for (let r = 13; r <= 17; r++) addWall(20, r);
                for (let c = 9; c <= 12; c++) { addWall(c, 5); addWall(c, 15); }
                for (let c = 27; c <= 30; c++) { addWall(c, 5); addWall(c, 15); }
                portals.push(
                    { c: 6, r: 3, pair: 1, color: PAL.violet },
                    { c: 33, r: 17, pair: 0, color: PAL.violet }
                );
            } else if (roomType === 1) {
                // Four Quadrant Vaults + 2 portal pairs
                for (let c = 11; c <= 16; c++) { addWall(c, 6); addWall(c, 14); }
                for (let c = 23; c <= 28; c++) { addWall(c, 6); addWall(c, 14); }
                for (let r = 3; r <= 5; r++) { addWall(20, r); addWall(20, r + 12); }
                portals.push(
                    { c: 5, r: 17, pair: 1, color: PAL.sky },
                    { c: 34, r: 3, pair: 0, color: PAL.sky },
                    { c: 34, r: 17, pair: 3, color: PAL.violet },
                    { c: 5, r: 3, pair: 2, color: PAL.violet }
                );
            } else if (roomType === 2) {
                // Asteroid Pillars + Linked Warp Cross
                for (let c = 8; c <= 32; c += 6) {
                    addWall(c, 5); addWall(c + 1, 5);
                    addWall(c, 15); addWall(c + 1, 15);
                }
                portals.push(
                    { c: 3, r: 10, pair: 1, color: PAL.mint },
                    { c: 36, r: 10, pair: 0, color: PAL.mint },
                    { c: 20, r: 2, pair: 3, color: PAL.violet },
                    { c: 20, r: 18, pair: 2, color: PAL.violet }
                );
            } else {
                // Spiral Nebula Gauntlet
                for (let c = 8; c <= 28; c++) addWall(c, 4);
                for (let c = 11; c <= 31; c++) addWall(c, 16);
                for (let r = 6; r <= 14; r++) {
                    if (r !== 10) addWall(31, r);
                    if (r !== 10) addWall(8, r);
                }
                portals.push(
                    { c: 4, r: 2, pair: 1, color: PAL.violet },
                    { c: 24, r: 10, pair: 0, color: PAL.violet },
                    { c: 35, r: 18, pair: 3, color: PAL.sky },
                    { c: 15, r: 10, pair: 2, color: PAL.sky }
                );
            }
        }

        function isOccupied(c, r) {
            if (wallSet.has(keyCell(c, r))) return true;
            for (let i = 0; i < portals.length; i++) {
                if (portals[i].c === c && portals[i].r === r) return true;
            }
            for (let i = 0; i < snake.length; i++) {
                if (snake[i].c === c && snake[i].r === r) return true;
            }
            for (let i = 0; i < prevSnake.length; i++) {
                if (prevSnake[i].c === c && prevSnake[i].r === r) return true;
            }
            if (crystal && crystal.c === c && crystal.r === r) return true;
            if (bonusStar && bonusStar.c === c && bonusStar.r === r) return true;
            return false;
        }

        function findFreeCell() {
            for (let tries = 0; tries < 250; tries++) {
                const c = randInt(1, COLS - 2);
                const r = randInt(1, ROWS - 2);
                if (!isOccupied(c, r)) return { c, r };
            }
            for (let r = 1; r < ROWS - 1; r++) {
                for (let c = 1; c < COLS - 1; c++) {
                    if (!isOccupied(c, r)) return { c, r };
                }
            }
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    if (!isOccupied(c, r)) return { c, r };
                }
            }
            return null;
        }

        function spawnCrystal() {
            crystal = findFreeCell();
        }

        function queueTurn(nx, ny) {
            if (turnQueue.length === 0 && snake.length > 1) {
                if (snake[0].c + nx === snake[1].c && snake[0].r + ny === snake[1].r) return;
            }
            const last = turnQueue.length > 0 ? turnQueue[turnQueue.length - 1] : dir;
            if (nx === last.x && ny === last.y) return;
            if (nx === -last.x && ny === -last.y) return;
            if (turnQueue.length < 2) turnQueue.push({ x: nx, y: ny });
        }

        function init(lvl) {
            stage = lvl;
            score = 0;
            ended = false;
            time = 0;
            crystalsEaten = 0;
            targetCrystals = 12 + lvl * 4;
            combo = 1;
            comboTimer = 0;
            bonusStar = null;
            bonusSpawnCd = 6.0;
            stepInterval = Math.max(0.072, 0.118 - (lvl - 1) * 0.008);
            stepTimer = 0;
            growthPending = 0;
            dir = { x: 1, y: 0 };
            turnQueue = [];
            pointerSwiped = false;

            snake = [];
            for (let i = 0; i < 6; i++) {
                snake.push({ c: 10 - i, r: 10 });
            }
            prevSnake = snake.map((s) => ({ c: s.c, r: s.r }));

            buildArena(lvl);
            spawnCrystal();
            fx.showBanner(
                'ROOM ' + stage + ' — LEVIATHAN ARENA',
                'COLLECT ' + targetCrystals + ' CRYO CRYSTALS · USE WARP PORTALS',
                PAL.mint,
                2.4
            );
        }

        function cellCenter(c, r) {
            return { x: OX + c * CELL + CELL * 0.5, y: OY + r * CELL + CELL * 0.5 };
        }

        function crashSnake() {
            ended = true;
            sfx(ctx, 'explodeBoss');
            const headPos = cellCenter(snake[0].c, snake[0].r);
            fx.burst(headPos.x, headPos.y, 32, PAL.coral, 250, 4.5, 0.7);
            fx.shake(10, 0.35);
            ctx.onGameOver?.({ score: Math.floor(score), level: stage, wave: stage, length: snake.length });
        }

        function stepSimulation() {
            while (turnQueue.length > 0) {
                const cand = turnQueue.shift();
                const isReverse = cand.x === -dir.x && cand.y === -dir.y;
                const hitsNeck = snake.length > 1 && snake[0].c + cand.x === snake[1].c && snake[0].r + cand.y === snake[1].r;
                if (!isReverse && !hitsNeck) {
                    dir = cand;
                    break;
                }
            }

            prevSnake = snake.map((s) => ({ c: s.c, r: s.r }));
            let nc = snake[0].c + dir.x;
            let nr = snake[0].r + dir.y;

            // Border or Asteroid Wall collision
            if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS || wallSet.has(keyCell(nc, nr))) {
                crashSnake();
                return;
            }

            // Linked Warp Portal teleport
            for (let i = 0; i < portals.length; i++) {
                const p = portals[i];
                if (p.c === nc && p.r === nr) {
                    const dest = portals[p.pair];
                    const candidates = [
                        { dx: dir.x, dy: dir.y },
                        { dx: -dir.y, dy: dir.x },
                        { dx: dir.y, dy: -dir.x },
                        { dx: -dir.x, dy: -dir.y }
                    ];
                    let chosen = null;
                    for (let ci = 0; ci < candidates.length; ci++) {
                        const cand = candidates[ci];
                        const ec = dest.c + cand.dx;
                        const er = dest.r + cand.dy;
                        const hitsPortal = portals.some((op) => op.c === ec && op.r === er);
                        const hitsSelf = snake.some((seg) => seg.c === ec && seg.r === er);
                        if (
                            ec >= 0 && ec < COLS && er >= 0 && er < ROWS &&
                            !wallSet.has(keyCell(ec, er)) && !hitsPortal && !hitsSelf
                        ) {
                            chosen = { c: ec, r: er, dx: cand.dx, dy: cand.dy };
                            break;
                        }
                    }
                    if (chosen) {
                        nc = chosen.c;
                        nr = chosen.r;
                        if (chosen.dx !== dir.x || chosen.dy !== dir.y) {
                            dir = { x: chosen.dx, y: chosen.dy };
                            turnQueue = [];
                        }
                    } else {
                        nc = dest.c;
                        nr = dest.r;
                    }
                    sfx(ctx, 'dash', 0.1);
                    const p1 = cellCenter(p.c, p.r);
                    const p2 = cellCenter(nc, nr);
                    fx.ring(p1.x, p1.y, 32, p.color, 0.32);
                    fx.ring(p2.x, p2.y, 38, p.color, 0.38);
                    break;
                }
            }

            // Self collision (ignore tail tip if not growing)
            const checkLen = growthPending > 0 ? snake.length : snake.length - 1;
            for (let i = 0; i < checkLen; i++) {
                if (snake[i].c === nc && snake[i].r === nr) {
                    crashSnake();
                    return;
                }
            }

            snake.unshift({ c: nc, r: nr });
            if (growthPending > 0) {
                growthPending--;
                prevSnake.push({ ...prevSnake[prevSnake.length - 1] });
            } else {
                snake.pop();
            }

            // Crystal eat
            if (crystal && nc === crystal.c && nr === crystal.r) {
                crystalsEaten++;
                growthPending += 1;
                if (comboTimer > 0) combo = Math.min(8, combo + 1);
                else combo = 1;
                comboTimer = maxComboTime;
                const pts = 100 * combo;
                score += pts;
                sfx(ctx, 'xpPickup', 0.18);
                const pos = cellCenter(nc, nr);
                fx.burst(pos.x, pos.y, 14, PAL.mint, 180, 3, 0.4);
                fx.ring(pos.x, pos.y, 34, PAL.sky, 0.28);
                fx.floatText(pos.x, pos.y - 12, '+' + pts + (combo > 1 ? ' x' + combo : ''), PAL.mint);

                if (crystalsEaten >= targetCrystals) {
                    if (ctx.isStory) {
                        ended = true;
                        sfx(ctx, 'levelup');
                        ctx.onWin?.({ score: Math.floor(score), level: stage, wave: stage, crystals: crystalsEaten });
                        return;
                    }
                    stage += 1;
                    score += 800 * stage;
                    crystalsEaten = 0;
                    targetCrystals += 4;
                    stepInterval = Math.max(0.056, stepInterval - 0.006);
                    sfx(ctx, 'levelup');
                    fx.showBanner('WARP TIER ' + stage, 'OVERDRIVE SPEED BOOST!', PAL.mint, 1.9);
                }
                spawnCrystal();
            }

            // Gold Boss Star eat
            if (bonusStar && nc === bonusStar.c && nr === bonusStar.r) {
                const pts = 500 * combo;
                score += pts;
                growthPending += 2;
                comboTimer = maxComboTime;
                sfx(ctx, 'chestOpen');
                const pos = cellCenter(nc, nr);
                fx.burst(pos.x, pos.y, 24, PAL.amber, 230, 4, 0.55);
                fx.ring(pos.x, pos.y, 52, PAL.amber, 0.4);
                fx.floatText(pos.x, pos.y - 16, 'GOLD STAR +' + pts + '!', PAL.amber, 1.3);
                bonusStar = null;
            }
        }

        function update(dt) {
            time += dt;
            stars.update(dt, 14, 18);
            fx.update(dt);
            if (ended) return;

            const upP = input.anyPressed(['KeyW', 'ArrowUp']);
            const dnP = input.anyPressed(['KeyS', 'ArrowDown']);
            const lfP = input.anyPressed(['KeyA', 'ArrowLeft']);
            const rtP = input.anyPressed(['KeyD', 'ArrowRight']);
            if (upP && !dnP) queueTurn(0, -1);
            if (dnP && !upP) queueTurn(0, 1);
            if (lfP && !rtP) queueTurn(-1, 0);
            if (rtP && !lfP) queueTurn(1, 0);

            // Click / Swipe quadrant control (one turn per gesture)
            if (input.pointer.justDown) {
                pointerSwiped = false;
            }
            if (input.pointer.isDown && !pointerSwiped) {
                const sdx = input.pointer.x - input.pointer.startX;
                const sdy = input.pointer.y - input.pointer.startY;
                if (Math.hypot(sdx, sdy) > 22) {
                    pointerSwiped = true;
                    if (Math.abs(sdx) > Math.abs(sdy)) queueTurn(sdx > 0 ? 1 : -1, 0);
                    else queueTurn(0, sdy > 0 ? 1 : -1);
                }
            } else if (input.pointer.justUp && !pointerSwiped) {
                const head = cellCenter(snake[0].c, snake[0].r);
                const dx = input.pointer.x - head.x;
                const dy = input.pointer.y - head.y;
                if (Math.abs(dx) > Math.abs(dy)) queueTurn(dx > 0 ? 1 : -1, 0);
                else queueTurn(0, dy > 0 ? 1 : -1);
            }

            if (comboTimer > 0) {
                comboTimer = Math.max(0, comboTimer - dt);
                if (comboTimer <= 0) combo = 1;
            }

            // Gold Star timed bonus
            if (bonusStar) {
                bonusStar.life -= dt;
                if (bonusStar.life <= 0) bonusStar = null;
            } else {
                bonusSpawnCd -= dt;
                if (bonusSpawnCd <= 0) {
                    bonusSpawnCd = randRange(8.5, 13.0);
                    const cell = findFreeCell();
                    if (cell) bonusStar = { c: cell.c, r: cell.r, life: 7.5 };
                }
            }

            stepTimer += dt;
            while (stepTimer >= stepInterval && !ended) {
                stepTimer -= stepInterval;
                stepSimulation();
            }
        }

        function render(g) {
            g.save();
            fx.applyShake(g);
            stars.draw(g, '#040814', '#081227');

            // Arena boundary & grid
            g.save();
            drawRoundRect(g, OX - 3, OY - 3, COLS * CELL + 6, ROWS * CELL + 6, 8);
            g.fillStyle = 'rgba(8, 15, 32, 0.72)';
            g.fill();
            g.strokeStyle = PAL.sky;
            g.lineWidth = 2;
            g.stroke();

            g.strokeStyle = 'rgba(56, 189, 248, 0.065)';
            g.lineWidth = 1;
            for (let c = 1; c < COLS; c++) {
                g.beginPath(); g.moveTo(OX + c * CELL, OY); g.lineTo(OX + c * CELL, OY + ROWS * CELL); g.stroke();
            }
            for (let r = 1; r < ROWS; r++) {
                g.beginPath(); g.moveTo(OX, OY + r * CELL); g.lineTo(OX + COLS * CELL, OY + r * CELL); g.stroke();
            }
            g.restore();

            // Portal link faint lines
            g.save();
            g.setLineDash([5, 6]);
            for (let i = 0; i < portals.length; i++) {
                if (portals[i].pair < i) continue;
                const a = cellCenter(portals[i].c, portals[i].r);
                const b = cellCenter(portals[portals[i].pair].c, portals[portals[i].pair].r);
                g.strokeStyle = portals[i].color;
                g.globalAlpha = 0.22;
                g.beginPath();
                g.moveTo(a.x, a.y);
                g.lineTo(b.x, b.y);
                g.stroke();
            }
            g.restore();

            // Linked Warp Portals
            for (let i = 0; i < portals.length; i++) {
                const p = portals[i];
                const pos = cellCenter(p.c, p.r);
                drawSprite(g, ctx.sprites, 'portal_vortex', pos.x, pos.y, CELL + 8, CELL + 8, {
                    angle: time * 2.5 * (i % 2 === 0 ? 1 : -1),
                    glow: p.color,
                    glowBlur: 14
                });
            }

            // Asteroid hazard walls
            for (let i = 0; i < walls.length; i++) {
                const w = walls[i];
                const pos = cellCenter(w.c, w.r);
                drawSprite(g, ctx.sprites, 'asteroid', pos.x, pos.y, CELL + 2, CELL + 2, {
                    glow: 'rgba(148, 163, 184, 0.45)',
                    glowBlur: 4
                });
            }

            // Cryo crystal target
            if (crystal) {
                const pos = cellCenter(crystal.c, crystal.r);
                const pulse = 1 + 0.14 * Math.sin(time * 7);
                drawSprite(g, ctx.sprites, 'cryo_crystal', pos.x, pos.y, (CELL + 4) * pulse, (CELL + 4) * pulse, {
                    glow: PAL.mint,
                    glowBlur: 14
                });
            }

            // Rare blinking Gold Boss Star
            if (bonusStar) {
                const pos = cellCenter(bonusStar.c, bonusStar.r);
                const blink = bonusStar.life > 2.2 || Math.floor(time * 12) % 2 === 0;
                if (blink) {
                    drawSprite(g, ctx.sprites, 'coin_star', pos.x, pos.y, CELL + 6, CELL + 6, {
                        angle: Math.sin(time * 5) * 0.22,
                        glow: PAL.amber,
                        glowBlur: 16
                    });
                }
                g.save();
                g.strokeStyle = PAL.amber;
                g.lineWidth = 2;
                g.beginPath();
                g.arc(pos.x, pos.y, CELL * 0.65, -Math.PI * 0.5, -Math.PI * 0.5 + TAU * (bonusStar.life / 7.5));
                g.stroke();
                g.restore();
            }

            // Smooth interpolated plasma space serpent
            const interp = clamp(stepTimer / stepInterval, 0, 1);
            for (let i = snake.length - 1; i >= 1; i--) {
                const cur = snake[i];
                const prev = prevSnake[i] || cur;
                let gx = lerp(prev.c, cur.c, interp);
                let gy = lerp(prev.r, cur.r, interp);
                // Don't interpolate visually across a portal jump
                if (Math.abs(cur.c - prev.c) > 2 || Math.abs(cur.r - prev.r) > 2) {
                    gx = cur.c;
                    gy = cur.r;
                }
                const px = OX + gx * CELL + CELL * 0.5;
                const py = OY + gy * CELL + CELL * 0.5;
                const ratio = 1 - i / Math.max(1, snake.length);
                const rad = CELL * (0.3 + 0.18 * ratio);
                const wavePulse = 0.5 + 0.5 * Math.sin(time * 8 - i * 0.55);
                g.save();
                g.shadowColor = i % 2 === 0 ? PAL.sky : PAL.mint;
                g.shadowBlur = 10 * wavePulse + 4;
                g.fillStyle = ratio > 0.5 ? PAL.sky : (ratio > 0.2 ? PAL.mint : PAL.violet);
                g.beginPath();
                g.arc(px, py, rad, 0, TAU);
                g.fill();
                g.fillStyle = 'rgba(255,255,255,0.45)';
                g.beginPath();
                g.arc(px, py, rad * 0.45, 0, TAU);
                g.fill();
                g.restore();
            }

            // Leviathan head
            if (snake.length > 0) {
                const hCur = snake[0];
                const hPrev = prevSnake[0] || hCur;
                let hgx = lerp(hPrev.c, hCur.c, interp);
                let hgy = lerp(hPrev.r, hCur.r, interp);
                if (Math.abs(hCur.c - hPrev.c) > 2 || Math.abs(hCur.r - hPrev.r) > 2) {
                    hgx = hCur.c;
                    hgy = hCur.r;
                }
                const hx = OX + hgx * CELL + CELL * 0.5;
                const hy = OY + hgy * CELL + CELL * 0.5;
                const headAng = Math.atan2(dir.y, dir.x) + Math.PI * 0.5;
                drawSprite(g, ctx.sprites, 'alien_drone', hx, hy, CELL + 8, CELL + 8, {
                    angle: headAng,
                    glow: PAL.sky,
                    glowBlur: 14
                });
            }

            // Top progress & combo strip
            drawPillBadge(g, 'CRYSTALS: ' + crystalsEaten + ' / ' + targetCrystals, 128, 22, PAL.mint);
            drawPillBadge(g, 'COMBO x' + combo, 286, 22, combo > 1 ? PAL.amber : PAL.muted);

            // Combo bar
            g.save();
            drawRoundRect(g, 355, 16, 200, 12, 6);
            g.fillStyle = 'rgba(15, 23, 42, 0.85)';
            g.fill();
            if (comboTimer > 0) {
                drawRoundRect(g, 357, 18, 196 * clamp(comboTimer / maxComboTime, 0, 1), 8, 4);
                g.fillStyle = combo >= 4 ? PAL.amber : PAL.sky;
                g.fill();
            }
            g.restore();

            if (bonusStar) {
                drawPillBadge(g, 'GOLD STAR ACTIVE!', 660, 22, PAL.amber);
            }

            fx.drawParticles(g);
            fx.drawOverlays(g);
            drawInCanvasFooter(g, '[WASD / Arrows / Click Quadrant] Steer Leviathan  ·  Eat Cryo Crystals & Gold Stars');
            g.restore();
        }

        function getHud() {
            return {
                score: Math.floor(score),
                level: stage,
                wave: stage,
                lives: 1,
                combo,
                status: 'CRYSTALS ' + crystalsEaten + '/' + targetCrystals + ' · x' + combo
            };
        }

        return { init, update, render, getHud };
    }

    // =========================================================================
    // 5. QUANTUM BRICK BREAKER (`quantum-brick-breaker`)
    // =========================================================================
    function createBrickBreakerEngine(ctx, canvas, g, input) {
        const stars = createStarfield(95);
        const fx = createFxSystem();

        let stage = 1;
        let score = 0;
        let lives = 3;
        let ended = false;
        let time = 0;

        let paddle = null;
        let balls = [];
        let bricks = [];
        let capsules = [];
        let lasers = [];
        let laserGates = [];

        const BRICK_W = 68;
        const BRICK_H = 22;
        const GRID_COLS = 12;
        const GRID_OX = (W - GRID_COLS * (BRICK_W + 4)) * 0.5;
        const GRID_OY = 58;

        const LAYOUTS = [
            // 1: Sector Shield Wall
            [
                'AAAAAAAAAAAA',
                'CCCCCCCCCCCC',
                'BBBBBBBBBBBB',
                'CC.PPPPPP.CC',
                '..CCCCCCCC..'
            ],
            // 2: Twin Reactors
            [
                '.AAA....AAA.',
                'AXBXA..AXBXA',
                'ABBB....BBBA',
                'CCCC.XX.CCCC',
                '.CC..CC..CC.'
            ],
            // 3: Quantum Fortress (Laser Gates)
            [
                'AA.CCCCCC.AA',
                'C..BXXXXB..C',
                'C.GCCCCCC.GC',
                'C..PPPPPP..C',
                '.AA......AA.'
            ],
            // 4: Prism Matrix
            [
                'CPCPCPCPCPCP',
                'AXAXAXAXAXAX',
                'PPPPPPPPPPPP',
                'CXCXCXCXCXCX',
                '.B.B.BB.B.B.'
            ],
            // 5: Orbital Citadel (Boss Core)
            [
                '..AAAAAAAA..',
                '.ACCCCCCCCA.',
                'AC.B.MM.B.CA',
                'AC.X.XX.X.CA',
                '.ACCCCCCCCA.',
                '..PPPPPPPP..'
            ],
            // 6: Singularity Vault
            [
                'AXAAAAAAAAXA',
                'CCCCCCCCCCCC',
                'G.P.XXXX.P.G',
                'B.C.BBBB.C.B',
                'A.C.PPPP.C.A',
                '.BBBBBBBBBB.'
            ]
        ];

        function resetPaddleAndBall() {
            paddle = {
                x: W * 0.5,
                y: 498,
                w: 118,
                h: 16,
                wideTimer: 0,
                laserTimer: 0,
                laserCd: 0
            };
            balls = [{
                x: paddle.x,
                y: paddle.y - 16,
                vx: 220 * (Math.random() < 0.5 ? -1 : 1),
                vy: -360,
                r: 8,
                stuck: true,
                noHitTimer: 0,
                trail: []
            }];
        }

        function enforceMinVertical(b) {
            const spd = Math.hypot(b.vx, b.vy) || (370 + stage * 18);
            const minVy = spd * 0.28;
            if (Math.abs(b.vy) < minVy) {
                const sy = b.vy === 0 ? -1 : Math.sign(b.vy);
                const sx = b.vx === 0 ? (Math.random() < 0.5 ? 1 : -1) : Math.sign(b.vx);
                b.vy = sy * minVy;
                b.vx = sx * Math.sqrt(Math.max(1, spd * spd - minVy * minVy));
            }
        }

        function buildLevel(lvl) {
            bricks = [];
            laserGates = [];
            capsules = [];
            lasers = [];
            const layout = LAYOUTS[(lvl - 1) % LAYOUTS.length];
            const tierMult = 1 + Math.floor((lvl - 1) / LAYOUTS.length);

            for (let r = 0; r < layout.length; r++) {
                const rowStr = layout[r];
                for (let c = 0; c < rowStr.length; c++) {
                    const ch = rowStr[c];
                    if (ch === '.') continue;
                    const x = GRID_OX + c * (BRICK_W + 4);
                    const y = GRID_OY + r * (BRICK_H + 5);
                    if (ch === 'G') {
                        laserGates.push({
                            x, y, w: BRICK_W, h: BRICK_H,
                            phase: c * 0.4
                        });
                        continue;
                    }
                    let type = 'normal';
                    let hp = 1;
                    let color = r % 2 === 0 ? PAL.sky : PAL.violet;
                    if (ch === 'A') { type = 'armored'; hp = 2 + (tierMult > 1 ? 1 : 0); color = '#94a3b8'; }
                    else if (ch === 'X') { type = 'bomb'; hp = 1; color = PAL.coral; }
                    else if (ch === 'P') { type = 'prism'; hp = 1; color = PAL.amber; }
                    else if (ch === 'B') { type = 'crystal'; hp = 1; color = PAL.mint; }
                    else if (ch === 'M') { type = 'core'; hp = 4; color = PAL.coral; }

                    bricks.push({
                        x, y, w: BRICK_W, h: BRICK_H,
                        type,
                        hp,
                        maxHp: hp,
                        color,
                        hitFlash: 0
                    });
                }
            }
        }

        function init(lvl) {
            stage = lvl;
            score = 0;
            lives = 3;
            ended = false;
            time = 0;
            resetPaddleAndBall();
            buildLevel(lvl);
            fx.showBanner(
                'SHIELD LAYOUT ' + (((lvl - 1) % 6) + 1) + ' / 6',
                'CLICK OR [SPACE] TO LAUNCH PLASMA ORB',
                PAL.sky,
                2.3
            );
        }

        function maybeDropCapsule(x, y, guaranteed) {
            if (!guaranteed && Math.random() > 0.22) return;
            const roll = Math.random();
            const kind = roll < 0.36 ? 'WIDE' : (roll < 0.72 ? 'MULTI' : 'LASER');
            capsules.push({ x, y, vy: 145, kind });
        }

        function damageBrick(brickIdx, fromExplosion) {
            const initial = bricks[brickIdx];
            if (!initial) return;

            const queue = [{ br: initial, fromExp: !!fromExplosion }];
            const queuedSet = new Set([initial]);

            while (queue.length > 0) {
                const item = queue.shift();
                const br = item.br;
                if (br.hp <= 0) continue;
                br.hp -= 1;
                br.hitFlash = 0.12;
                const cx = br.x + br.w * 0.5;
                const cy = br.y + br.h * 0.5;
                if (br.hp <= 0) {
                    const pts = br.type === 'core' ? 600 : (br.type === 'armored' ? 180 : 100);
                    score += pts;
                    sfx(ctx, br.type === 'bomb' ? 'explodeBoss' : 'explodeSmall', 0.18);
                    fx.burst(cx, cy, br.type === 'bomb' ? 24 : 12, br.color, 210, 3.5, 0.45);
                    fx.floatText(cx, cy, '+' + pts, br.color);

                    if (br.type === 'bomb') {
                        fx.ring(cx, cy, 98, PAL.coral, 0.35, 3);
                        fx.shake(7, 0.22);
                        for (let j = 0; j < bricks.length; j++) {
                            const nb = bricks[j];
                            if (nb.hp <= 0 || queuedSet.has(nb)) continue;
                            const nx = nb.x + nb.w * 0.5;
                            const ny = nb.y + nb.h * 0.5;
                            if (distSq(cx, cy, nx, ny) < 105 * 105) {
                                queuedSet.add(nb);
                                queue.push({ br: nb, fromExp: true });
                            }
                        }
                    } else if (!item.fromExp) {
                        maybeDropCapsule(cx, cy, br.type === 'prism' || br.type === 'core');
                    }
                } else {
                    sfx(ctx, 'hitMetal', 0.15);
                    fx.burst(cx, cy, 5, PAL.white, 110, 2, 0.22);
                }
            }

            for (let i = bricks.length - 1; i >= 0; i--) {
                if (bricks[i].hp <= 0) bricks.splice(i, 1);
            }
        }

        function activateCapsule(kind) {
            sfx(ctx, 'powerup');
            score += 150;
            if (kind === 'WIDE') {
                paddle.wideTimer = 14;
                fx.floatText(paddle.x, paddle.y - 26, 'WIDE DEFLECTOR!', PAL.sky, 1.15);
            } else if (kind === 'MULTI') {
                const cur = balls.slice();
                for (let i = 0; i < cur.length && balls.length < 9; i++) {
                    const src = cur[i];
                    src.stuck = false;
                    for (let s = -1; s <= 1; s += 2) {
                        if (balls.length >= 9) break;
                        const ang = Math.atan2(src.vy, src.vx) + s * 0.35;
                        const spd = Math.hypot(src.vx, src.vy) || 380;
                        const nb = {
                            x: src.x,
                            y: src.y,
                            vx: Math.cos(ang) * spd,
                            vy: Math.sin(ang) * spd,
                            r: src.r,
                            stuck: false,
                            noHitTimer: 0,
                            trail: []
                        };
                        enforceMinVertical(nb);
                        balls.push(nb);
                    }
                }
                fx.floatText(paddle.x, paddle.y - 26, 'MULTI-BALL!', PAL.amber, 1.15);
            } else if (kind === 'LASER') {
                paddle.laserTimer = 12;
                fx.floatText(paddle.x, paddle.y - 26, 'LASER CANNON!', PAL.coral, 1.15);
            }
        }

        function update(dt) {
            time += dt;
            stars.update(dt, 0, 24);
            fx.update(dt);
            if (ended) return;

            // Paddle movement (Keyboard or Mouse X)
            const prevPaddleX = paddle.x;
            let kbDir = 0;
            if (input.anyDown(['KeyA', 'ArrowLeft'])) kbDir -= 1;
            if (input.anyDown(['KeyD', 'ArrowRight'])) kbDir += 1;

            if (paddle.wideTimer > 0) paddle.wideTimer = Math.max(0, paddle.wideTimer - dt);
            if (paddle.laserTimer > 0) paddle.laserTimer = Math.max(0, paddle.laserTimer - dt);
            paddle.w = paddle.wideTimer > 0 ? 172 : 118;

            if (kbDir !== 0) {
                paddle.x += kbDir * 600 * dt;
            } else if (input.mode === 'pointer' && input.pointer.hasMoved) {
                paddle.x = lerp(paddle.x, input.pointer.x, Math.min(1, dt * 24));
            }
            paddle.x = clamp(paddle.x, paddle.w * 0.5 + 10, W - paddle.w * 0.5 - 10);

            // Launch ball or fire laser cannons
            if (input.justPressed('Space') || input.pointer.justDown) {
                let launched = false;
                for (let i = 0; i < balls.length; i++) {
                    if (balls[i].stuck) {
                        balls[i].stuck = false;
                        balls[i].vy = -(370 + stage * 18);
                        balls[i].noHitTimer = 0;
                        enforceMinVertical(balls[i]);
                        launched = true;
                    }
                }
                if (launched) sfx(ctx, 'dash');
            }

            if (paddle.laserTimer > 0) {
                paddle.laserCd -= dt;
                const firing = input.anyDown(['Space']) || input.pointer.isDown || paddle.laserCd <= -0.15;
                if (firing && paddle.laserCd <= 0) {
                    paddle.laserCd = 0.34;
                    sfx(ctx, 'shootLaser', 0.14);
                    lasers.push({ x: paddle.x - paddle.w * 0.42, y: paddle.y - 12, vy: -640 });
                    lasers.push({ x: paddle.x + paddle.w * 0.42, y: paddle.y - 12, vy: -640 });
                }
            }

            // Update laser gates (alternate solid/open every 3s)
            for (let i = 0; i < laserGates.length; i++) {
                const lg = laserGates[i];
                lg.active = Math.sin(time * 2.1 + lg.phase) > -0.15;
            }

            // Update paddle lasers
            for (let i = lasers.length - 1; i >= 0; i--) {
                const l = lasers[i];
                l.y += l.vy * dt;
                if (l.y < 0) { lasers.splice(i, 1); continue; }
                let hit = false;
                for (let bi = bricks.length - 1; bi >= 0; bi--) {
                    const br = bricks[bi];
                    if (l.x >= br.x && l.x <= br.x + br.w && l.y >= br.y && l.y <= br.y + br.h) {
                        damageBrick(bi, false);
                        hit = true;
                        break;
                    }
                }
                if (hit) lasers.splice(i, 1);
            }

            // Brick hit flash decay
            for (let i = 0; i < bricks.length; i++) {
                if (bricks[i].hitFlash > 0) bricks[i].hitFlash = Math.max(0, bricks[i].hitFlash - dt);
            }

            // Sub-stepped ball simulation
            for (let i = balls.length - 1; i >= 0; i--) {
                const b = balls[i];
                if (b.stuck) {
                    b.x = paddle.x;
                    b.y = paddle.y - paddle.h * 0.5 - b.r - 1;
                    continue;
                }

                b.trail.push({ x: b.x, y: b.y });
                if (b.trail.length > 8) b.trail.shift();

                b.noHitTimer = (b.noHitTimer || 0) + dt;
                if (b.noHitTimer > 12) {
                    b.noHitTimer = 0;
                    b.vy += 65;
                    enforceMinVertical(b);
                }

                const spd = Math.hypot(b.vx, b.vy);
                const maxShift = Math.max(spd, Math.abs(paddle.x - prevPaddleX) / Math.max(0.001, dt));
                const steps = clamp(Math.ceil((maxShift * dt) / 5), 2, 14);
                const sdt = dt / steps;
                const halfPW = paddle.w * 0.5;
                const pTop = paddle.y - paddle.h * 0.5;
                const pBot = paddle.y + paddle.h * 0.5;

                for (let s = 0; s < steps; s++) {
                    b.x += b.vx * sdt;
                    b.y += b.vy * sdt;
                    const subPaddleX = lerp(prevPaddleX, paddle.x, (s + 1) / steps);

                    // Arena walls
                    if (b.x - b.r < 8) {
                        b.x = 8 + b.r;
                        b.vx = Math.abs(b.vx);
                        enforceMinVertical(b);
                        sfx(ctx, 'hitShield', 0.1);
                    }
                    if (b.x + b.r > W - 8) {
                        b.x = W - 8 - b.r;
                        b.vx = -Math.abs(b.vx);
                        enforceMinVertical(b);
                        sfx(ctx, 'hitShield', 0.1);
                    }
                    if (b.y - b.r < 10) {
                        b.y = 10 + b.r;
                        b.vy = Math.abs(b.vy);
                        enforceMinVertical(b);
                        sfx(ctx, 'hitShield', 0.1);
                    }

                    // Paddle bounce (interpolated paddle X + circle-rect edge coverage)
                    const pClampX = clamp(b.x, subPaddleX - halfPW, subPaddleX + halfPW);
                    const pClampY = clamp(b.y, pTop, pBot);
                    if (b.vy > 0 && distSq(b.x, b.y, pClampX, pClampY) <= b.r * b.r) {
                        const curSpd = Math.hypot(b.vx, b.vy) || 370;
                        const hitOffset = clamp((b.x - subPaddleX) / halfPW, -1, 1);
                        const bounceAng = -Math.PI * 0.5 + hitOffset * 1.04;
                        const newSpd = Math.min(620, curSpd * 1.018);
                        b.vx = Math.cos(bounceAng) * newSpd;
                        b.vy = Math.sin(bounceAng) * newSpd;
                        enforceMinVertical(b);
                        b.y = pTop - b.r - 0.5;
                        b.noHitTimer = 0;
                        sfx(ctx, 'hitShield', 0.14);
                        fx.burst(b.x, b.y + b.r, 6, PAL.sky, 110, 2.5, 0.22);
                    }

                    // Active Laser Gates bounce (exact rendered strip y+6..y+16 + push-out)
                    for (let gi = 0; gi < laserGates.length; gi++) {
                        const lg = laserGates[gi];
                        if (!lg.active) continue;
                        const gy = lg.y + 6;
                        const gh = 10;
                        const cx = clamp(b.x, lg.x, lg.x + lg.w);
                        const cy = clamp(b.y, gy, gy + gh);
                        if (distSq(b.x, b.y, cx, cy) <= b.r * b.r) {
                            const oL = Math.abs((b.x + b.r) - lg.x);
                            const oR = Math.abs((lg.x + lg.w) - (b.x - b.r));
                            const oT = Math.abs((b.y + b.r) - gy);
                            const oB = Math.abs((gy + gh) - (b.y - b.r));
                            const mX = Math.min(oL, oR);
                            const mY = Math.min(oT, oB);
                            if (mX < mY) {
                                b.vx = oL < oR ? -Math.abs(b.vx) : Math.abs(b.vx);
                                b.x = oL < oR ? lg.x - b.r - 0.5 : lg.x + lg.w + b.r + 0.5;
                            } else {
                                b.vy = oT < oB ? -Math.abs(b.vy) : Math.abs(b.vy);
                                b.y = oT < oB ? gy - b.r - 0.5 : gy + gh + b.r + 0.5;
                            }
                            enforceMinVertical(b);
                            sfx(ctx, 'hitMetal', 0.12);
                            break;
                        }
                    }

                    // Bricks collision (push out along shallowest axis so zero multi-trap)
                    for (let bi = bricks.length - 1; bi >= 0; bi--) {
                        const br = bricks[bi];
                        const cx = clamp(b.x, br.x, br.x + br.w);
                        const cy = clamp(b.y, br.y, br.y + br.h);
                        if (distSq(b.x, b.y, cx, cy) <= b.r * b.r) {
                            const overlapL = Math.abs((b.x + b.r) - br.x);
                            const overlapR = Math.abs((br.x + br.w) - (b.x - b.r));
                            const overlapT = Math.abs((b.y + b.r) - br.y);
                            const overlapB = Math.abs((br.y + br.h) - (b.y - b.r));
                            const minX = Math.min(overlapL, overlapR);
                            const minY = Math.min(overlapT, overlapB);
                            if (minX < minY) {
                                b.vx = overlapL < overlapR ? -Math.abs(b.vx) : Math.abs(b.vx);
                                b.x = overlapL < overlapR ? br.x - b.r - 0.5 : br.x + br.w + b.r + 0.5;
                            } else {
                                b.vy = overlapT < overlapB ? -Math.abs(b.vy) : Math.abs(b.vy);
                                b.y = overlapT < overlapB ? br.y - b.r - 0.5 : br.y + br.h + b.r + 0.5;
                            }
                            enforceMinVertical(b);
                            b.noHitTimer = 0;
                            damageBrick(bi, false);
                            break;
                        }
                    }
                }

                if (b.y - b.r > H + 12) {
                    balls.splice(i, 1);
                }
            }

            if (balls.length === 0) {
                lives--;
                sfx(ctx, 'playerHurt');
                fx.shake(7, 0.25);
                if (lives <= 0) {
                    ended = true;
                    ctx.onGameOver?.({ score: Math.floor(score), level: stage, wave: stage });
                    return;
                }
                resetPaddleAndBall();
            }

            // Capsules fall & collect
            for (let i = capsules.length - 1; i >= 0; i--) {
                const c = capsules[i];
                c.y += c.vy * dt;
                if (c.y > H + 20) { capsules.splice(i, 1); continue; }
                if (
                    Math.abs(c.x - paddle.x) < paddle.w * 0.5 + 16 &&
                    Math.abs(c.y - paddle.y) < 22
                ) {
                    activateCapsule(c.kind);
                    capsules.splice(i, 1);
                }
            }

            if (bricks.length === 0) {
                if (ctx.isStory) {
                    ended = true;
                    sfx(ctx, 'levelup');
                    ctx.onWin?.({ score: Math.floor(score), level: stage, wave: stage });
                } else {
                    stage += 1;
                    score += 1000 * stage;
                    sfx(ctx, 'levelup');
                    resetPaddleAndBall();
                    buildLevel(stage);
                    fx.showBanner('SHIELD LAYOUT ' + (((stage - 1) % 6) + 1), 'STAGE CLEARED · +' + (1000 * stage), PAL.mint, 2.1);
                }
            }
        }

        function render(g) {
            g.save();
            fx.applyShake(g);
            stars.draw(g, '#040814', '#0b1429');

            // Arena walls
            g.strokeStyle = 'rgba(56, 189, 248, 0.35)';
            g.lineWidth = 3;
            g.strokeRect(8, 10, W - 16, H - 14);

            // Laser Gates
            for (let i = 0; i < laserGates.length; i++) {
                const lg = laserGates[i];
                g.save();
                drawRoundRect(g, lg.x, lg.y + 6, lg.w, 10, 4);
                g.fillStyle = lg.active ? 'rgba(251, 113, 133, 0.85)' : 'rgba(148, 163, 184, 0.16)';
                g.fill();
                g.strokeStyle = lg.active ? PAL.coral : 'rgba(148, 163, 184, 0.4)';
                g.lineWidth = 1.5;
                g.stroke();
                g.restore();
            }

            // Bricks
            for (let i = 0; i < bricks.length; i++) {
                const br = bricks[i];
                g.save();
                drawRoundRect(g, br.x, br.y, br.w, br.h, 5);
                g.fillStyle = br.hitFlash > 0 ? PAL.white : br.color;
                g.globalAlpha = br.type === 'armored' && br.hp === 1 ? 0.62 : 0.92;
                g.fill();
                g.globalAlpha = 1;
                g.strokeStyle = 'rgba(255,255,255,0.45)';
                g.lineWidth = 1.2;
                g.stroke();

                const cx = br.x + br.w * 0.5;
                const cy = br.y + br.h * 0.5;
                if (br.type === 'bomb') {
                    drawSprite(g, ctx.sprites, 'plasma_bomb', cx, cy, 18, 18, { glow: PAL.coral, glowBlur: 6 });
                } else if (br.type === 'crystal') {
                    drawSprite(g, ctx.sprites, 'cryo_crystal', cx, cy, 18, 18);
                } else if (br.type === 'prism') {
                    drawSprite(g, ctx.sprites, 'energy_prism', cx, cy, 18, 18);
                } else if (br.type === 'core') {
                    drawSprite(g, ctx.sprites, 'boss_core', cx, cy, 22, 22, { glow: PAL.coral });
                } else if (br.type === 'armored' && br.hp < br.maxHp) {
                    g.strokeStyle = '#0f172a';
                    g.lineWidth = 2;
                    g.beginPath();
                    g.moveTo(br.x + 14, br.y + 4);
                    g.lineTo(cx, cy + 2);
                    g.lineTo(br.x + br.w - 16, br.y + br.h - 4);
                    g.stroke();
                }
                g.restore();
            }

            // Dropping powerup capsules
            for (let i = 0; i < capsules.length; i++) {
                const c = capsules[i];
                const col = c.kind === 'WIDE' ? PAL.sky : (c.kind === 'MULTI' ? PAL.amber : PAL.coral);
                drawSprite(g, ctx.sprites, 'cargo_crate', c.x, c.y - 14, 18, 18, {
                    glow: col,
                    glowBlur: 8
                });
                drawPillBadge(g, c.kind, c.x, c.y + 4, col, 'rgba(8,14,30,0.92)');
            }

            // Paddle lasers
            g.save();
            g.fillStyle = PAL.coral;
            g.shadowColor = PAL.coral;
            g.shadowBlur = 10;
            for (let i = 0; i < lasers.length; i++) {
                g.fillRect(lasers[i].x - 2, lasers[i].y - 8, 4, 14);
            }
            g.restore();

            // Paddle
            g.save();
            drawRoundRect(g, paddle.x - paddle.w * 0.5, paddle.y - paddle.h * 0.5, paddle.w, paddle.h, 8);
            const pGrad = g.createLinearGradient(paddle.x - paddle.w * 0.5, 0, paddle.x + paddle.w * 0.5, 0);
            pGrad.addColorStop(0, PAL.sky);
            pGrad.addColorStop(0.5, PAL.white);
            pGrad.addColorStop(1, PAL.sky);
            g.fillStyle = pGrad;
            g.shadowColor = PAL.sky;
            g.shadowBlur = 14;
            g.fill();
            g.restore();

            if (paddle.laserTimer > 0) {
                drawSprite(g, ctx.sprites, 'laser_turret', paddle.x - paddle.w * 0.42, paddle.y - 6, 22, 22, { angle: -Math.PI * 0.5 });
                drawSprite(g, ctx.sprites, 'laser_turret', paddle.x + paddle.w * 0.42, paddle.y - 6, 22, 22, { angle: -Math.PI * 0.5 });
            }

            // Plasma balls + motion trails
            g.save();
            for (let i = 0; i < balls.length; i++) {
                const b = balls[i];
                for (let t = 0; t < b.trail.length; t++) {
                    g.globalAlpha = ((t + 1) / b.trail.length) * 0.35;
                    g.fillStyle = PAL.sky;
                    g.beginPath();
                    g.arc(b.trail[t].x, b.trail[t].y, b.r * (0.4 + 0.5 * (t / b.trail.length)), 0, TAU);
                    g.fill();
                }
                g.globalAlpha = 1;
                g.shadowColor = PAL.sky;
                g.shadowBlur = 14;
                g.fillStyle = PAL.white;
                g.beginPath();
                g.arc(b.x, b.y, b.r, 0, TAU);
                g.fill();
            }
            g.restore();

            fx.drawParticles(g);
            fx.drawOverlays(g);
            drawInCanvasFooter(g, '[Mouse / A-D] Deflector Paddle  ·  [Click / Space] Launch & Fire Lasers');
            g.restore();
        }

        function getHud() {
            return {
                score: Math.floor(score),
                level: stage,
                wave: stage,
                lives,
                hp: lives,
                maxHp: 3,
                status: 'LAYOUT ' + (((stage - 1) % 6) + 1) + '/6 · BRICKS ' + bricks.length
            };
        }

        return { init, update, render, getHud };
    }

    // =========================================================================
    // 6. TWIN PADDLE PONG (`twin-paddle-pong`)
    // =========================================================================
    function createPongEngine(ctx, canvas, g, input) {
        const stars = createStarfield(100);
        const fx = createFxSystem();

        let stage = 1;
        let score = 0;
        let pScore = 0;
        let aiScore = 0;
        let rally = 0;
        let bestRally = 0;
        let ended = false;
        let time = 0;
        let serveTimer = 0.8;

        let p1 = null;
        let ai = null;
        let ball = null;
        let gravOrb = null;

        function resetRound(serveDir) {
            rally = 0;
            serveTimer = 0.85;
            const dir = serveDir || 1;
            const ang = randRange(-0.45, 0.45);
            const spd = 370 + stage * 22;
            ball = {
                x: W * 0.5,
                y: H * 0.5,
                vx: Math.cos(ang) * spd * dir,
                vy: Math.sin(ang) * spd,
                lastHitDir: dir,
                spin: 0,
                r: 9,
                trail: []
            };
        }

        function init(lvl) {
            stage = lvl;
            score = 0;
            pScore = 0;
            aiScore = 0;
            bestRally = 0;
            ended = false;
            time = 0;
            p1 = { x: 42, y: H * 0.5, vy: 0, prevY: H * 0.5, w: 16, h: 98, hitFlash: 0 };
            ai = { x: W - 42, y: H * 0.5, vy: 0, prevY: H * 0.5, w: 16, h: 98, hitFlash: 0 };
            gravOrb = { x: W * 0.5, y: H * 0.5, mode: 1, modeTimer: 7.5 }; // 1 = pull, -1 = push
            resetRound(1);
            fx.showBanner(
                'NEON DUEL TIER ' + stage,
                'FIRST TO 5 ROUNDS · MOVE PADDLE ON HIT FOR SPIN CURVES!',
                PAL.sky,
                2.3
            );
        }

        function update(dt) {
            time += dt;
            stars.update(dt, 0, 16);
            fx.update(dt);
            if (ended) return;

            if (p1.hitFlash > 0) p1.hitFlash = Math.max(0, p1.hitFlash - dt);
            if (ai.hitFlash > 0) ai.hitFlash = Math.max(0, ai.hitFlash - dt);

            // Player Paddle (W/S, Arrows, or smoothed Mouse Y)
            p1.prevY = p1.y;
            let kbY = 0;
            if (input.anyDown(['KeyW', 'ArrowUp'])) kbY -= 1;
            if (input.anyDown(['KeyS', 'ArrowDown'])) kbY += 1;
            if (kbY !== 0) {
                p1.y += kbY * 510 * dt;
            } else if (input.mode === 'pointer' && input.pointer.hasMoved) {
                const maxStep = 760 * dt;
                const diff = (input.pointer.y - p1.y) * Math.min(1, dt * 22);
                p1.y += clamp(diff, -maxStep, maxStep);
            }
            p1.y = clamp(p1.y, 58, H - 58);
            const rawP1Vy = (p1.y - p1.prevY) / Math.max(0.001, dt);
            p1.vy = lerp(p1.vy, rawP1Vy, Math.min(1, dt * 18));

            // Escalating Cosmic AI Cruiser
            ai.prevY = ai.y;
            const aiSpeed = 285 + stage * 42;
            const predictY = ball.vx > 0
                ? ball.y + ball.vy * clamp((ai.x - ball.x) / Math.max(120, ball.vx), 0, 0.55)
                : H * 0.5 + Math.sin(time * 1.4) * 55;
            const aiDiff = clamp(predictY, 58, H - 58) - ai.y;
            if (Math.abs(aiDiff) > 6) {
                ai.y += clamp(aiDiff * 6, -aiSpeed, aiSpeed) * dt;
            }
            ai.y = clamp(ai.y, 58, H - 58);
            const rawAiVy = (ai.y - ai.prevY) / Math.max(0.001, dt);
            ai.vy = lerp(ai.vy, rawAiVy, Math.min(1, dt * 18));

            // Shifting Central Mini-Gravity Orb
            gravOrb.x = W * 0.5 + Math.sin(time * 0.65) * 44;
            gravOrb.y = H * 0.5 + Math.sin(time * 1.1) * 128;
            gravOrb.modeTimer -= dt;
            if (gravOrb.modeTimer <= 0) {
                gravOrb.mode *= -1;
                gravOrb.modeTimer = 7.5;
                sfx(ctx, 'emp', 0.15);
                fx.ring(gravOrb.x, gravOrb.y, 70, gravOrb.mode > 0 ? PAL.violet : PAL.mint, 0.45);
                fx.floatText(gravOrb.x, gravOrb.y - 34, gravOrb.mode > 0 ? 'GRAVITY PULL' : 'REPULSOR PULSE', gravOrb.mode > 0 ? PAL.violet : PAL.mint);
            }

            if (serveTimer > 0) {
                serveTimer -= dt;
                return;
            }

            ball.trail.push({ x: ball.x, y: ball.y });
            if (ball.trail.length > 14) ball.trail.shift();

            // Spin curve effect + Gravity Orb bending (preserve cross-court direction, prevent vertical stall)
            const speed = Math.hypot(ball.vx, ball.vy);
            if (Math.abs(ball.spin) > 0.05) {
                ball.vy += ball.spin * 210 * dt;
                ball.spin *= Math.pow(0.75, dt);
            }

            const gdx = gravOrb.x - ball.x;
            const gdy = gravOrb.y - ball.y;
            const gd = Math.hypot(gdx, gdy);
            if (gd > 18 && gd < 180) {
                const strength = (1 - gd / 180) * (220 + speed * 0.36) * gravOrb.mode;
                ball.vx += (gdx / gd) * strength * 0.45 * dt;
                ball.vy += (gdy / gd) * strength * dt;
            }

            // Guarantee steady horizontal crossing speed in lastHitDir (no pure vertical stall / orb orbit)
            const targetSpd = clamp(Math.hypot(ball.vx, ball.vy), 340, 840);
            const minHoriz = Math.max(240, targetSpd * 0.48);
            const dirSign = ball.lastHitDir || (ball.vx >= 0 ? 1 : -1);
            if (ball.vx * dirSign < minHoriz) {
                ball.vx = dirSign * minHoriz;
            }
            const curSpd = Math.hypot(ball.vx, ball.vy);
            if (curSpd > 0) {
                ball.vx = (ball.vx / curSpd) * targetSpd;
                ball.vy = (ball.vy / curSpd) * targetSpd;
            }

            // Sub-stepped ball movement & paddle/wall collision (anti-tunneling)
            const steps = clamp(Math.ceil((targetSpd * dt) / 8), 1, 6);
            const sdt = dt / steps;
            for (let s = 0; s < steps; s++) {
                const tFrac = (s + 1) / steps;
                const subP1Y = lerp(p1.prevY, p1.y, tFrac);
                const subAiY = lerp(ai.prevY, ai.y, tFrac);
                ball.x += ball.vx * sdt;
                ball.y += ball.vy * sdt;

                // Top/bottom bounce
                if (ball.y - ball.r < 12) {
                    ball.y = 12 + ball.r;
                    ball.vy = Math.abs(ball.vy);
                    sfx(ctx, 'hitShield', 0.14);
                    fx.burst(ball.x, ball.y, 6, PAL.sky, 110, 2, 0.2);
                } else if (ball.y + ball.r > H - 12) {
                    ball.y = H - 12 - ball.r;
                    ball.vy = -Math.abs(ball.vy);
                    sfx(ctx, 'hitShield', 0.14);
                    fx.burst(ball.x, ball.y, 6, PAL.sky, 110, 2, 0.2);
                }

                // Left paddle bounce (Player)
                if (
                    ball.vx < 0 &&
                    ball.x - ball.r <= p1.x + p1.w * 0.5 &&
                    ball.x + ball.r >= p1.x - p1.w * 0.5 &&
                    Math.abs(ball.y - subP1Y) <= p1.h * 0.5 + ball.r
                ) {
                    const offset = clamp((ball.y - subP1Y) / (p1.h * 0.5), -1, 1);
                    const newSpd = Math.min(840, Math.hypot(ball.vx, ball.vy) + 22);
                    const ang = offset * 0.92;
                    ball.vx = Math.cos(ang) * newSpd;
                    ball.vy = Math.sin(ang) * newSpd;
                    ball.lastHitDir = 1;
                    ball.x = p1.x + p1.w * 0.5 + ball.r + 1;
                    ball.spin = clamp(p1.vy / 260, -1.8, 1.8);
                    p1.hitFlash = 0.14;
                    rally++;
                    bestRally = Math.max(bestRally, rally);
                    score += 25 + rally * 10;
                    sfx(ctx, 'hitMetal', 0.1 + Math.min(0.4, rally * 0.02));
                    fx.burst(ball.x, ball.y, 12, Math.abs(ball.spin) > 0.6 ? PAL.amber : PAL.sky, 180, 3.2, 0.35);
                    if (Math.abs(ball.spin) > 0.7) {
                        fx.floatText(ball.x + 36, ball.y - 16, 'SPIN CURVE!', PAL.amber);
                    }
                    break;
                }

                // Right paddle bounce (AI)
                if (
                    ball.vx > 0 &&
                    ball.x + ball.r >= ai.x - ai.w * 0.5 &&
                    ball.x - ball.r <= ai.x + ai.w * 0.5 &&
                    Math.abs(ball.y - subAiY) <= ai.h * 0.5 + ball.r
                ) {
                    const offset = clamp((ball.y - subAiY) / (ai.h * 0.5), -1, 1);
                    const newSpd = Math.min(840, Math.hypot(ball.vx, ball.vy) + 22);
                    const ang = Math.PI - offset * 0.92;
                    ball.vx = Math.cos(ang) * newSpd;
                    ball.vy = Math.sin(ang) * newSpd;
                    ball.lastHitDir = -1;
                    ball.x = ai.x - ai.w * 0.5 - ball.r - 1;
                    ball.spin = clamp(ai.vy / 340, -1.3, 1.3);
                    ai.hitFlash = 0.14;
                    rally++;
                    bestRally = Math.max(bestRally, rally);
                    sfx(ctx, 'hitMetal', 0.1);
                    fx.burst(ball.x, ball.y, 10, PAL.coral, 160, 3, 0.3);
                    break;
                }
            }

            // Scoring
            if (ball.x < -16) {
                aiScore++;
                sfx(ctx, 'playerHurt');
                fx.shake(7, 0.25);
                fx.floatText(W * 0.3, H * 0.5, 'AI SCORES!', PAL.coral, 1.25);
                if (aiScore >= 5) {
                    ended = true;
                    ctx.onGameOver?.({ score: Math.floor(score), level: stage, wave: stage, bestRally });
                    return;
                }
                resetRound(1);
            } else if (ball.x > W + 16) {
                pScore++;
                score += 400 + rally * 30;
                sfx(ctx, 'powerup');
                fx.burst(W - 14, ball.y, 24, PAL.mint, 240, 4, 0.55);
                fx.floatText(W * 0.7, H * 0.5, 'POINT SCORED!', PAL.mint, 1.25);
                if (pScore >= 5) {
                    if (ctx.isStory) {
                        ended = true;
                        sfx(ctx, 'levelup');
                        ctx.onWin?.({ score: Math.floor(score), level: stage, wave: stage, bestRally });
                        return;
                    }
                    stage += 1;
                    pScore = 0;
                    aiScore = 0;
                    score += 1500 * stage;
                    sfx(ctx, 'levelup');
                    fx.showBanner('MATCH SET ' + stage, 'AI TIER INCREASED · +' + (1500 * stage), PAL.sky, 2.1);
                }
                resetRound(-1);
            }
        }

        function render(g) {
            g.save();
            fx.applyShake(g);
            stars.draw(g, '#040814', '#0b1429');

            // Center dashed divider & arena border
            g.save();
            g.strokeStyle = 'rgba(56, 189, 248, 0.35)';
            g.lineWidth = 2;
            g.strokeRect(10, 12, W - 20, H - 24);
            g.setLineDash([10, 10]);
            g.strokeStyle = 'rgba(148, 163, 184, 0.25)';
            g.beginPath();
            g.moveTo(W * 0.5, 16);
            g.lineTo(W * 0.5, H - 16);
            g.stroke();
            g.restore();

            // Big Neon Score Backdrop
            g.save();
            g.font = '700 68px "Space Grotesk", sans-serif';
            g.textAlign = 'center';
            g.textBaseline = 'middle';
            g.fillStyle = 'rgba(56, 189, 248, 0.16)';
            g.fillText(String(pScore), W * 0.35, 86);
            g.fillStyle = 'rgba(251, 113, 133, 0.16)';
            g.fillText(String(aiScore), W * 0.65, 86);
            g.restore();

            // Central Mini-Gravity Orb
            const orbColor = gravOrb.mode > 0 ? PAL.violet : PAL.mint;
            g.save();
            g.strokeStyle = orbColor;
            g.globalAlpha = 0.22 + 0.08 * Math.sin(time * 5);
            g.lineWidth = 1.5;
            g.beginPath();
            g.arc(gravOrb.x, gravOrb.y, 120, 0, TAU);
            g.stroke();
            g.beginPath();
            g.arc(gravOrb.x, gravOrb.y, 65, 0, TAU);
            g.stroke();
            g.restore();
            drawSprite(g, ctx.sprites, 'portal_vortex', gravOrb.x, gravOrb.y, 44, 44, {
                angle: time * 2.5 * gravOrb.mode,
                glow: orbColor,
                glowBlur: 16
            });
            drawSprite(g, ctx.sprites, 'warp_ring', gravOrb.x, gravOrb.y, 56, 56, {
                angle: -time * 1.8,
                alpha: 0.65
            });

            // Rally Counter Pill
            drawPillBadge(g, 'RALLY x' + rally, W * 0.5, 26, rally >= 6 ? PAL.amber : PAL.sky);

            // Player Paddle
            g.save();
            drawRoundRect(g, p1.x - p1.w * 0.5, p1.y - p1.h * 0.5, p1.w, p1.h, 7);
            g.fillStyle = p1.hitFlash > 0 ? PAL.white : PAL.sky;
            g.shadowColor = PAL.sky;
            g.shadowBlur = p1.hitFlash > 0 ? 22 : 16;
            g.fill();
            g.restore();
            drawSprite(g, ctx.sprites, 'fighter', p1.x - 16, p1.y, 26, 26, { angle: Math.PI * 0.5 });

            // AI Cruiser Paddle
            g.save();
            drawRoundRect(g, ai.x - ai.w * 0.5, ai.y - ai.h * 0.5, ai.w, ai.h, 7);
            g.fillStyle = ai.hitFlash > 0 ? PAL.white : PAL.coral;
            g.shadowColor = PAL.coral;
            g.shadowBlur = ai.hitFlash > 0 ? 22 : 16;
            g.fill();
            g.restore();
            drawSprite(g, ctx.sprites, 'laser_turret', ai.x + 14, ai.y, 28, 28, { flipX: true });

            // Serve launch preview arrow
            if (serveTimer > 0) {
                g.save();
                const spd = Math.hypot(ball.vx, ball.vy) || 1;
                const nx = ball.vx / spd;
                const ny = ball.vy / spd;
                g.strokeStyle = 'rgba(56, 189, 248, 0.65)';
                g.setLineDash([5, 5]);
                g.lineWidth = 2;
                g.beginPath();
                g.moveTo(ball.x, ball.y);
                g.lineTo(ball.x + nx * 64, ball.y + ny * 64);
                g.stroke();
                g.restore();
            }

            // Ball & curve trail
            g.save();
            const hasSpin = Math.abs(ball.spin) > 0.45;
            const bCol = hasSpin ? PAL.amber : PAL.sky;
            for (let i = 0; i < ball.trail.length; i++) {
                const pt = ball.trail[i];
                g.globalAlpha = ((i + 1) / ball.trail.length) * 0.45;
                g.fillStyle = bCol;
                g.beginPath();
                g.arc(pt.x, pt.y, ball.r * ((i + 1) / ball.trail.length), 0, TAU);
                g.fill();
            }
            g.globalAlpha = 1;
            g.shadowColor = bCol;
            g.shadowBlur = 16;
            g.fillStyle = PAL.white;
            g.beginPath();
            g.arc(ball.x, ball.y, ball.r, 0, TAU);
            g.fill();
            if (hasSpin) {
                g.strokeStyle = PAL.amber;
                g.lineWidth = 2;
                g.beginPath();
                g.arc(ball.x, ball.y, ball.r + 5, time * 12, time * 12 + Math.PI * 1.2);
                g.stroke();
            }
            g.restore();

            fx.drawParticles(g);
            fx.drawOverlays(g);
            drawInCanvasFooter(g, '[W/S / Arrows / Mouse Y] Paddle  ·  Slide On Impact For Spin Curve Shots');
            g.restore();
        }

        function getHud() {
            return {
                score: Math.floor(score),
                level: stage,
                wave: stage,
                lives: 5 - aiScore,
                status: 'YOU ' + pScore + ' - ' + aiScore + ' AI · RALLY ' + rally
            };
        }

        return { init, update, render, getHud };
    }

    // =========================================================================
    // 7. CENTIPEDE SPORE PURGE (`centipede-spore-purge`)
    // =========================================================================
    function createCentipedeEngine(ctx, canvas, g, input) {
        const CELL = 24;
        const COLS = 40;
        const ROWS = 22;
        const COMBAT_TOP_ROW = 15;
        const stars = createStarfield(95);
        const fx = createFxSystem();

        let stage = 1;
        let score = 0;
        let lives = 3;
        let ended = false;
        let time = 0;
        let fireCd = 0;

        let player = null;
        let bullets = [];
        let crystals = new Map(); // key -> { c, r, hp }
        let centipedes = []; // array of chains: [{ segments: [{c, r, pc, pr, dir, rowDir, isHead}], stepProg, speed }]
        let spider = null;
        let spiderTimer = 5;
        let pickups = [];

        const cKey = (c, r) => c + ',' + r;

        function resetPlayer() {
            player = {
                x: W * 0.5,
                y: 486,
                invuln: 2.0,
                triTimer: 0
            };
        }

        function spawnCrystals(lvl) {
            crystals.clear();
            const count = 36 + lvl * 5;
            for (let i = 0; i < count; i++) {
                const c = randInt(1, COLS - 2);
                const r = randInt(2, ROWS - 4);
                if (r >= COMBAT_TOP_ROW && Math.abs(c - COLS * 0.5) < 4) continue;
                crystals.set(cKey(c, r), { c, r, hp: 4 });
            }
        }

        function spawnCentipede(segCount) {
            const segs = [];
            const startC = Math.min(COLS - 2, Math.max(segCount - 1, Math.floor(COLS * 0.65)));
            for (let i = 0; i < segCount; i++) {
                segs.push({
                    c: startC - i,
                    r: 1,
                    pc: startC - i - 1,
                    pr: 1,
                    dir: 1,
                    rowDir: 1,
                    isHead: i === 0
                });
            }
            centipedes.push({
                segments: segs,
                stepProg: 0,
                speed: 8.2 + stage * 1.15
            });
        }

        function init(lvl) {
            stage = lvl;
            score = 0;
            lives = 3;
            ended = false;
            time = 0;
            fireCd = 0;
            bullets = [];
            centipedes = [];
            pickups = [];
            spider = null;
            spiderTimer = 5.5;

            resetPlayer();
            spawnCrystals(lvl);
            const segCount = clamp(12 + (lvl - 1) * 3, 12, 24);
            spawnCentipede(segCount);
            fx.showBanner(
                'SPORE PURGE SECTOR ' + stage,
                'SPLIT THE ' + segCount + '-SEGMENT ALIEN CENTIPEDE!',
                PAL.mint,
                2.3
            );
        }

        function cellToPx(c, r) {
            return { x: c * CELL + CELL * 0.5, y: r * CELL + CELL * 0.5 };
        }

        function damagePlayer() {
            if (player.invuln > 0 || ended) return;
            lives--;
            sfx(ctx, 'playerHurt');
            fx.burst(player.x, player.y, 26, PAL.coral, 240, 4, 0.6);
            fx.shake(10, 0.35);
            if (lives <= 0) {
                ended = true;
                ctx.onGameOver?.({ score: Math.floor(score), level: stage, wave: stage });
                return;
            }
            player.x = W * 0.5;
            player.y = 486;
            player.invuln = 2.4;
        }

        function stepChain(chain) {
            const segs = chain.segments;
            if (!segs.length) return;
            for (let i = 0; i < segs.length; i++) {
                segs[i].pc = segs[i].c;
                segs[i].pr = segs[i].r;
            }

            const head = segs[0];
            if (head.c < 0) {
                head.dir = 1;
                head.c += 1;
            } else if (head.c >= COLS) {
                head.dir = -1;
                head.c -= 1;
            } else {
                const nextC = head.c + head.dir;
                const blocked = nextC < 0 || nextC >= COLS || crystals.has(cKey(nextC, head.r));
                if (blocked) {
                    head.dir *= -1;
                    if (head.r >= ROWS - 2) head.rowDir = -1;
                    else if (head.r <= COMBAT_TOP_ROW && head.rowDir < 0) head.rowDir = 1;
                    head.r = clamp(head.r + head.rowDir, 1, ROWS - 2);
                    // Clear crystal if centipede descends directly onto a crystal cap to prevent double-trap loops
                    crystals.delete(cKey(head.c, head.r));
                } else {
                    head.c = nextC;
                }
            }

            for (let i = 1; i < segs.length; i++) {
                segs[i].c = segs[i - 1].pc;
                segs[i].r = segs[i - 1].pr;
                segs[i].dir = segs[i - 1].dir;
                segs[i].rowDir = segs[i - 1].rowDir;
            }
        }

        function update(dt) {
            time += dt;
            stars.update(dt, 0, 32);
            fx.update(dt);
            if (ended) return;

            if (player.invuln > 0) player.invuln = Math.max(0, player.invuln - dt);
            if (player.triTimer > 0) player.triTimer = Math.max(0, player.triTimer - dt);

            // Player movement in bottom combat zone
            let mx = 0;
            let my = 0;
            if (input.anyDown(['KeyA', 'ArrowLeft'])) mx -= 1;
            if (input.anyDown(['KeyD', 'ArrowRight'])) mx += 1;
            if (input.anyDown(['KeyW', 'ArrowUp'])) my -= 1;
            if (input.anyDown(['KeyS', 'ArrowDown'])) my += 1;
            if (mx !== 0 || my !== 0) {
                const len = Math.hypot(mx, my);
                player.x += (mx / len) * 340 * dt;
                player.y += (my / len) * 340 * dt;
            } else if (input.mode === 'pointer' && input.pointer.hasMoved) {
                player.x = lerp(player.x, input.pointer.x, Math.min(1, dt * 18));
                player.y = lerp(player.y, clamp(input.pointer.y, COMBAT_TOP_ROW * CELL, H - 24), Math.min(1, dt * 18));
            }
            player.x = clamp(player.x, 22, W - 22);
            player.y = clamp(player.y, COMBAT_TOP_ROW * CELL, H - 24);

            // Firing
            fireCd = Math.max(0, fireCd - dt);
            if ((input.anyDown(['Space', 'KeyZ']) || input.pointer.isDown) && fireCd <= 0 && bullets.length < 12) {
                fireCd = 0.14;
                sfx(ctx, 'shootLaser', 0.15);
                bullets.push({ x: player.x, y: player.y - 18, vx: 0, vy: -740 });
                if (player.triTimer > 0) {
                    bullets.push({ x: player.x - 10, y: player.y - 14, vx: -135, vy: -710 });
                    bullets.push({ x: player.x + 10, y: player.y - 14, vx: 135, vy: -710 });
                }
            }

            // Spawn bonus Spider / UFO in lower zone
            if (!spider) {
                spiderTimer -= dt;
                if (spiderTimer <= 0) {
                    const fromLeft = Math.random() < 0.5;
                    spider = {
                        x: fromLeft ? -20 : W + 20,
                        y: randRange(COMBAT_TOP_ROW * CELL - 40, H - 60),
                        vx: (fromLeft ? 1 : -1) * randRange(130, 175),
                        vy: randRange(-140, 140),
                        phase: 0
                    };
                    spiderTimer = randRange(7.5, 11.5);
                }
            } else {
                spider.phase += dt * 4;
                spider.x += spider.vx * dt;
                spider.y += spider.vy * dt;
                if (spider.y < COMBAT_TOP_ROW * CELL - 50) spider.vy = Math.abs(spider.vy);
                if (spider.y > H - 26) spider.vy = -Math.abs(spider.vy);
                if (Math.random() < 2.2 * dt) spider.vy = randRange(-170, 170);

                // Spider munches crystals it touches
                const sc = Math.floor(spider.x / CELL);
                const sr = Math.floor(spider.y / CELL);
                crystals.delete(cKey(sc, sr));

                if (spider.x < -40 || spider.x > W + 40) {
                    spider = null;
                } else if (distSq(spider.x, spider.y, player.x, player.y) < 25 * 25) {
                    spider = null;
                    damagePlayer();
                }
            }

            // Advance centipedes
            for (let ci = 0; ci < centipedes.length; ci++) {
                const chain = centipedes[ci];
                chain.stepProg += chain.speed * dt;
                while (chain.stepProg >= 1) {
                    chain.stepProg -= 1;
                    stepChain(chain);
                }
                // Player collision with any segment
                for (let si = 0; si < chain.segments.length; si++) {
                    const seg = chain.segments[si];
                    const pos = cellToPx(lerp(seg.pc, seg.c, chain.stepProg), lerp(seg.pr, seg.r, chain.stepProg));
                    if (distSq(pos.x, pos.y, player.x, player.y) < 22 * 22) {
                        damagePlayer();
                        break;
                    }
                }
            }

            // Update bullets & collisions
            for (let bi = bullets.length - 1; bi >= 0; bi--) {
                const b = bullets[bi];
                b.x += b.vx * dt;
                b.y += b.vy * dt;
                if (b.y < -16 || b.x < -16 || b.x > W + 16) {
                    bullets.splice(bi, 1);
                    continue;
                }

                // Hit spider/UFO bonus
                if (spider && distSq(b.x, b.y, spider.x, spider.y) < 22 * 22) {
                    bullets.splice(bi, 1);
                    const pts = dist(spider.x, spider.y, player.x, player.y) < 150 ? 900 : 450;
                    score += pts;
                    sfx(ctx, 'explodeSmall');
                    fx.burst(spider.x, spider.y, 18, PAL.amber, 210, 3.5, 0.5);
                    fx.floatText(spider.x, spider.y, 'BONUS +' + pts, PAL.amber, 1.2);
                    pickups.push({ x: spider.x, y: spider.y, vy: 95, type: Math.random() < 0.6 ? 'tri' : 'star' });
                    spider = null;
                    continue;
                }

                // Hit crystal cluster
                const gc = Math.floor(b.x / CELL);
                const gr = Math.floor(b.y / CELL);
                const ck = cKey(gc, gr);
                if (crystals.has(ck)) {
                    bullets.splice(bi, 1);
                    const cr = crystals.get(ck);
                    cr.hp -= 1;
                    score += 10;
                    sfx(ctx, 'hitMetal', 0.16);
                    fx.burst(b.x, b.y, 4, PAL.mint, 90, 2, 0.2);
                    if (cr.hp <= 0) {
                        crystals.delete(ck);
                        score += 25;
                    }
                    continue;
                }

                // Hit centipede segment -> split!
                let hitSeg = false;
                for (let ci = centipedes.length - 1; ci >= 0 && !hitSeg; ci--) {
                    const chain = centipedes[ci];
                    for (let si = 0; si < chain.segments.length; si++) {
                        const seg = chain.segments[si];
                        const pos = cellToPx(lerp(seg.pc, seg.c, chain.stepProg), lerp(seg.pr, seg.r, chain.stepProg));
                        if (distSq(b.x, b.y, pos.x, pos.y) < 16 * 16) {
                            bullets.splice(bi, 1);
                            hitSeg = true;
                            const pts = seg.isHead ? 150 : 100;
                            score += pts;
                            sfx(ctx, 'explodeSmall', 0.18);
                            fx.burst(pos.x, pos.y, 12, seg.isHead ? PAL.coral : PAL.mint, 175, 3, 0.4);
                            fx.floatText(pos.x, pos.y, '+' + pts, seg.isHead ? PAL.coral : PAL.sky);

                            // Spawn crystal at struck location (strictly inside grid bounds)
                            if (seg.c >= 0 && seg.c < COLS && seg.r >= 1 && seg.r <= ROWS - 2) {
                                crystals.set(cKey(seg.c, seg.r), { c: seg.c, r: seg.r, hp: 4 });
                            }

                            const front = chain.segments.slice(0, si);
                            const back = chain.segments.slice(si + 1);
                            centipedes.splice(ci, 1);
                            if (front.length > 0) {
                                front[0].isHead = true;
                                centipedes.push({ segments: front, stepProg: chain.stepProg, speed: chain.speed });
                            }
                            if (back.length > 0) {
                                back[0].isHead = true;
                                if (back[0].c >= 0 && back[0].c < COLS) back[0].dir *= -1;
                                else back[0].dir = back[0].c < 0 ? 1 : -1;
                                centipedes.push({ segments: back, stepProg: chain.stepProg, speed: chain.speed + 0.5 });
                            }
                            break;
                        }
                    }
                }
            }

            // Pickups
            for (let i = pickups.length - 1; i >= 0; i--) {
                const p = pickups[i];
                p.y += p.vy * dt;
                if (p.y > H + 20) { pickups.splice(i, 1); continue; }
                if (distSq(p.x, p.y, player.x, player.y) < 28 * 28) {
                    sfx(ctx, 'powerup');
                    if (p.type === 'tri') {
                        player.triTimer = 10;
                        score += 200;
                        fx.floatText(player.x, player.y - 24, 'TRI-LASER 10s!', PAL.amber);
                    } else {
                        score += 500;
                        fx.floatText(player.x, player.y - 24, '+500 BONUS!', PAL.amber);
                    }
                    pickups.splice(i, 1);
                }
            }

            // Wave cleared when all segments purged
            if (centipedes.length === 0) {
                if (ctx.isStory) {
                    ended = true;
                    sfx(ctx, 'levelup');
                    ctx.onWin?.({ score: Math.floor(score), level: stage, wave: stage });
                } else {
                    stage += 1;
                    score += 900 * stage;
                    sfx(ctx, 'levelup');
                    const nextSeg = Math.min(28, 12 + (stage - 1) * 3);
                    spawnCentipede(nextSeg);
                    fx.showBanner('SWARM WAVE ' + stage, nextSeg + '-SEGMENT PURGE!', PAL.mint, 2.0);
                }
            }
        }

        function render(g) {
            g.save();
            fx.applyShake(g);
            stars.draw(g, '#040814', '#0b1328');

            // Combat zone border line
            g.save();
            g.strokeStyle = 'rgba(56, 189, 248, 0.25)';
            g.setLineDash([8, 8]);
            g.beginPath();
            g.moveTo(0, COMBAT_TOP_ROW * CELL);
            g.lineTo(W, COMBAT_TOP_ROW * CELL);
            g.stroke();
            g.restore();

            // Crystal clusters
            crystals.forEach((cr) => {
                const pos = cellToPx(cr.c, cr.r);
                const scale = 0.55 + (cr.hp / 4) * 0.45;
                drawSprite(g, ctx.sprites, 'cryo_crystal', pos.x, pos.y, CELL * scale, CELL * scale, {
                    alpha: 0.55 + (cr.hp / 4) * 0.45,
                    glow: PAL.mint,
                    glowBlur: 6
                });
            });

            // Pickups
            for (let i = 0; i < pickups.length; i++) {
                const p = pickups[i];
                drawSprite(g, ctx.sprites, p.type === 'tri' ? 'energy_prism' : 'coin_star', p.x, p.y, 26, 26, {
                    glow: PAL.amber,
                    glowBlur: 12
                });
            }

            // Alien Spore Centipedes
            for (let ci = 0; ci < centipedes.length; ci++) {
                const chain = centipedes[ci];
                for (let si = chain.segments.length - 1; si >= 0; si--) {
                    const seg = chain.segments[si];
                    const ix = lerp(seg.pc, seg.c, chain.stepProg);
                    const iy = lerp(seg.pr, seg.r, chain.stepProg);
                    const pos = cellToPx(ix, iy);
                    const ang = Math.atan2(seg.r - seg.pr, seg.c - seg.pc) + Math.PI * 0.5;
                    if (seg.isHead) {
                        drawSprite(g, ctx.sprites, 'alien_drone', pos.x, pos.y, CELL + 6, CELL + 6, {
                            angle: ang,
                            glow: PAL.coral,
                            glowBlur: 12
                        });
                    } else {
                        drawSprite(g, ctx.sprites, si % 2 === 0 ? 'energy_prism' : 'plasma_bomb', pos.x, pos.y, CELL - 2, CELL - 2, {
                            angle: time * 3 + si * 0.4,
                            glow: PAL.violet,
                            glowBlur: 8
                        });
                    }
                }
            }

            // Bonus Spider / UFO
            if (spider) {
                drawSprite(g, ctx.sprites, 'ufo', spider.x, spider.y, 32, 32, {
                    angle: Math.sin(spider.phase) * 0.25,
                    glow: PAL.amber,
                    glowBlur: 12
                });
            }

            // Bullets
            g.save();
            g.fillStyle = PAL.white;
            g.shadowColor = PAL.sky;
            g.shadowBlur = 10;
            for (let i = 0; i < bullets.length; i++) {
                g.fillRect(bullets[i].x - 1.5, bullets[i].y - 8, 3, 14);
            }
            g.restore();

            // Player starfighter
            if (!(player.invuln > 0 && Math.floor(time * 16) % 2 === 0) && !ended) {
                drawSprite(g, ctx.sprites, 'fighter', player.x, player.y, 36, 36, {
                    glow: player.triTimer > 0 ? PAL.amber : PAL.sky,
                    glowBlur: 12
                });
            }

            fx.drawParticles(g);
            fx.drawOverlays(g);
            drawInCanvasFooter(g, '[WASD / Mouse] Combat Zone  ·  [Space / Click] Purge Centipede Segments');
            g.restore();
        }

        function getHud() {
            let segs = 0;
            for (let i = 0; i < centipedes.length; i++) segs += centipedes[i].segments.length;
            return {
                score: Math.floor(score),
                level: stage,
                wave: stage,
                lives,
                hp: lives,
                maxHp: 3,
                status: 'SPORES LEFT: ' + segs + ' · CHAINS ' + centipedes.length
            };
        }

        return { init, update, render, getHud };
    }

    // =========================================================================
    // 8. MISSILE DOME DEFENSE (`missile-dome-defense`)
    // =========================================================================
    function createMissileDefenseEngine(ctx, canvas, g, input) {
        const GROUND_Y = 478;
        const stars = createStarfield(110);
        const fx = createFxSystem();

        let stage = 1;
        let wave = 1;
        let score = 0;
        let ended = false;
        let time = 0;
        let waveClearTimer = 0;

        let batteries = [];
        let domes = [];
        let interceptors = [];
        let explosions = [];
        let meteors = [];
        let bomberUfo = null;
        let meteorsToSpawn = 0;
        let meteorSpawnCd = 0;

        function setupGround() {
            batteries = [
                { x: 96, y: GROUND_Y - 12, ammo: 12, maxAmmo: 12, angle: -Math.PI * 0.5, rechargeCd: 0 },
                { x: 480, y: GROUND_Y - 12, ammo: 14, maxAmmo: 14, angle: -Math.PI * 0.5, rechargeCd: 0 },
                { x: 864, y: GROUND_Y - 12, ammo: 12, maxAmmo: 12, angle: -Math.PI * 0.5, rechargeCd: 0 }
            ];
            domes = [
                { x: 215, y: GROUND_Y - 10, alive: true, shieldPulse: 0 },
                { x: 348, y: GROUND_Y - 10, alive: true, shieldPulse: 1 },
                { x: 612, y: GROUND_Y - 10, alive: true, shieldPulse: 2 },
                { x: 745, y: GROUND_Y - 10, alive: true, shieldPulse: 3 }
            ];
        }

        function startWave(wNum) {
            wave = wNum;
            waveClearTimer = 0;
            meteorsToSpawn = 8 + stage * 3 + wNum * 3;
            meteorSpawnCd = 0.8;
            for (let i = 0; i < batteries.length; i++) {
                batteries[i].ammo = batteries[i].maxAmmo;
            }
            fx.showBanner(
                'SECTOR ' + stage + ' · WAVE ' + wave + ' / 3',
                'CLICK SKY TO LAUNCH INTERCEPTOR FLAK!',
                PAL.sky,
                2.2
            );
        }

        function init(lvl) {
            stage = lvl;
            wave = 1;
            score = 0;
            ended = false;
            time = 0;
            interceptors = [];
            explosions = [];
            meteors = [];
            bomberUfo = null;
            setupGround();
            startWave(1);
        }

        function pickBattery(tx, preferredIdx) {
            if (preferredIdx !== undefined && batteries[preferredIdx] && batteries[preferredIdx].ammo > 0) {
                return batteries[preferredIdx];
            }
            let best = null;
            let bestDist = Infinity;
            for (let i = 0; i < batteries.length; i++) {
                const b = batteries[i];
                if (b.ammo <= 0) continue;
                const d = Math.abs(b.x - tx);
                if (d < bestDist) { bestDist = d; best = b; }
            }
            return best;
        }

        function launchFlak(tx, ty, preferredIdx) {
            const targetY = clamp(ty, 24, GROUND_Y - 32);
            const targetX = clamp(tx, 16, W - 16);
            const bat = pickBattery(targetX, preferredIdx);
            if (!bat) {
                sfx(ctx, 'uiBack');
                return;
            }
            bat.ammo -= 1;
            bat.angle = Math.atan2(targetY - bat.y, targetX - bat.x);
            sfx(ctx, 'shootMissile', 0.14);
            interceptors.push({
                sx: bat.x,
                sy: bat.y - 12,
                x: bat.x,
                y: bat.y - 12,
                tx: targetX,
                ty: targetY,
                speed: 720,
                trail: []
            });
        }

        function spawnMeteor(isSplit, sx, sy, targetX, speedMult) {
            const livingTargets = [];
            for (let i = 0; i < domes.length; i++) if (domes[i].alive) livingTargets.push(domes[i].x);
            for (let i = 0; i < batteries.length; i++) livingTargets.push(batteries[i].x);
            const tx = targetX !== undefined
                ? targetX
                : livingTargets[randInt(0, livingTargets.length - 1)] + randRange(-14, 14);
            const startX = sx !== undefined ? sx : randRange(30, W - 30);
            const startY = sy !== undefined ? sy : -16;
            const ang = Math.atan2(GROUND_Y - startY, tx - startX);
            const spd = (68 + stage * 11 + wave * 9) * (speedMult || 1);
            meteors.push({
                x: startX,
                y: startY,
                sx: startX,
                sy: startY,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                isSplit: !!isSplit,
                splitY: isSplit ? randRange(130, 220) : 9999,
                hasSplit: false,
                curveAmp: randRange(-18, 18),
                age: 0
            });
        }

        function spawnExplosion(x, y, maxR, color) {
            explosions.push({
                x, y,
                r: 8,
                maxR: maxR || 60,
                life: 0.72,
                maxLife: 0.72,
                color: color || PAL.sky,
                combo: 0
            });
            sfx(ctx, 'explodeSmall', 0.2);
            fx.burst(x, y, 12, color || PAL.sky, 170, 3, 0.38);
        }

        function update(dt) {
            time += dt;
            stars.update(dt, 6, 8);
            fx.update(dt);
            if (ended) return;

            // Aim batteries toward pointer & trickle-recharge empty batteries
            for (let i = 0; i < batteries.length; i++) {
                const b = batteries[i];
                b.angle = clamp(Math.atan2(input.pointer.y - b.y, input.pointer.x - b.x), -Math.PI + 0.12, -0.12);
                if (b.ammo <= 0) {
                    b.rechargeCd += dt;
                    if (b.rechargeCd >= 2.5) {
                        b.rechargeCd = 0;
                        b.ammo = 2;
                        sfx(ctx, 'uiClick');
                    }
                } else {
                    b.rechargeCd = 0;
                }
            }

            if (input.pointer.justDown) {
                launchFlak(input.pointer.x, input.pointer.y);
            } else if (input.justPressed('Digit1')) launchFlak(input.pointer.x, input.pointer.y, 0);
            else if (input.justPressed('Digit2') || input.justPressed('Space')) launchFlak(input.pointer.x, input.pointer.y, 1);
            else if (input.justPressed('Digit3')) launchFlak(input.pointer.x, input.pointer.y, 2);

            // Spawn incoming wave threats
            if (meteorsToSpawn > 0) {
                meteorSpawnCd -= dt;
                if (meteorSpawnCd <= 0) {
                    const batch = Math.min(meteorsToSpawn, wave >= 2 ? 2 : 1);
                    meteorsToSpawn -= batch;
                    meteorSpawnCd = Math.max(0.65, 1.85 - stage * 0.12 - wave * 0.18);
                    for (let i = 0; i < batch; i++) {
                        const splitChance = wave >= 2 ? 0.34 : 0.14;
                        spawnMeteor(Math.random() < splitChance);
                    }
                    if (!bomberUfo && wave >= 2 && Math.random() < 0.18) {
                        const fromL = Math.random() < 0.5;
                        bomberUfo = {
                            x: fromL ? -24 : W + 24,
                            y: randRange(58, 120),
                            vx: (fromL ? 1 : -1) * 115,
                            dropCd: 1.5
                        };
                    }
                }
            }

            // Update bomber UFO
            if (bomberUfo) {
                bomberUfo.x += bomberUfo.vx * dt;
                bomberUfo.dropCd -= dt;
                if (bomberUfo.dropCd <= 0) {
                    bomberUfo.dropCd = 2.0;
                    spawnMeteor(false, bomberUfo.x, bomberUfo.y + 12, undefined, 1.15);
                }
                if (bomberUfo.x < -50 || bomberUfo.x > W + 50) bomberUfo = null;
            }

            // Update interceptors
            for (let i = interceptors.length - 1; i >= 0; i--) {
                const r = interceptors[i];
                r.trail.push({ x: r.x, y: r.y });
                if (r.trail.length > 10) r.trail.shift();
                const dx = r.tx - r.x;
                const dy = r.ty - r.y;
                const d = Math.hypot(dx, dy);
                if (d <= r.speed * dt + 4) {
                    spawnExplosion(r.tx, r.ty, 62, PAL.sky);
                    interceptors.splice(i, 1);
                } else {
                    r.x += (dx / d) * r.speed * dt;
                    r.y += (dy / d) * r.speed * dt;
                }
            }

            // Update explosions & intercept meteors/UFO
            for (let i = explosions.length - 1; i >= 0; i--) {
                const ex = explosions[i];
                ex.life -= dt;
                const prog = 1 - clamp(ex.life / ex.maxLife, 0, 1);
                ex.r = prog < 0.45 ? lerp(8, ex.maxR, prog / 0.45) : lerp(ex.maxR, 6, (prog - 0.45) / 0.55);

                for (let mi = meteors.length - 1; mi >= 0; mi--) {
                    const m = meteors[mi];
                    if (distSq(ex.x, ex.y, m.x, m.y) <= (ex.r + 12) * (ex.r + 12)) {
                        ex.combo += 1;
                        const pts = (m.isSplit ? 200 : 125) * ex.combo;
                        score += pts;
                        fx.floatText(m.x, m.y, '+' + pts + (ex.combo > 1 ? ' x' + ex.combo : ''), PAL.amber);
                        spawnExplosion(m.x, m.y, 44, PAL.amber);
                        meteors.splice(mi, 1);
                    }
                }
                if (bomberUfo && distSq(ex.x, ex.y, bomberUfo.x, bomberUfo.y) <= (ex.r + 20) * (ex.r + 20)) {
                    score += 450;
                    sfx(ctx, 'explodeBoss');
                    fx.burst(bomberUfo.x, bomberUfo.y, 24, PAL.amber, 240, 4, 0.55);
                    fx.floatText(bomberUfo.x, bomberUfo.y, 'BOMBER +450!', PAL.amber, 1.2);
                    bomberUfo = null;
                }

                if (ex.life <= 0) explosions.splice(i, 1);
            }

            // Update meteors
            for (let i = meteors.length - 1; i >= 0; i--) {
                const m = meteors[i];
                m.age += dt;
                m.x += (m.vx + Math.sin(m.age * 3.2) * m.curveAmp) * dt;
                m.y += m.vy * dt;

                if (m.isSplit && !m.hasSplit && m.y >= m.splitY) {
                    m.hasSplit = true;
                    sfx(ctx, 'shootPlasma', 0.12);
                    fx.ring(m.x, m.y, 26, PAL.coral, 0.25);
                    spawnMeteor(false, m.x - 8, m.y, clamp(m.x - 120, 90, W - 90), 1.12);
                    spawnMeteor(false, m.x + 8, m.y, clamp(m.x + 120, 90, W - 90), 1.12);
                }

                if (m.y >= GROUND_Y - 6) {
                    // Check dome or battery impact
                    sfx(ctx, 'explodeBoss');
                    fx.burst(m.x, GROUND_Y, 22, PAL.coral, 220, 4, 0.55);
                    fx.shake(9, 0.3);
                    for (let di = 0; di < domes.length; di++) {
                        if (domes[di].alive && Math.abs(domes[di].x - m.x) < 42) {
                            domes[di].alive = false;
                            sfx(ctx, 'playerHurt');
                            fx.floatText(domes[di].x, GROUND_Y - 34, 'DOME DESTROYED!', PAL.coral);
                        }
                    }
                    meteors.splice(i, 1);
                }
            }

            // Check loss (all 4 domes lost)
            let aliveDomes = 0;
            for (let i = 0; i < domes.length; i++) if (domes[i].alive) aliveDomes++;
            if (aliveDomes === 0) {
                ended = true;
                ctx.onGameOver?.({ score: Math.floor(score), level: stage, wave });
                return;
            }

            // Check wave clear
            if (meteorsToSpawn === 0 && meteors.length === 0 && !bomberUfo) {
                waveClearTimer += dt;
                if (waveClearTimer >= 1.1) {
                    let ammoBonus = 0;
                    for (let i = 0; i < batteries.length; i++) ammoBonus += batteries[i].ammo * 15;
                    const domeBonus = aliveDomes * 150;
                    const perfectBonus = aliveDomes === domes.length ? 300 : 0;
                    const totalBonus = ammoBonus + domeBonus + perfectBonus;
                    score += totalBonus;
                    sfx(ctx, 'chestOpen', 0.2);
                    fx.floatText(W * 0.5, H * 0.42, 'DEFENSE BONUS +' + totalBonus, PAL.mint, 1.35);
                    if (perfectBonus > 0) {
                        fx.floatText(W * 0.5, H * 0.49, 'PERFECT DOME DEFENSE +300!', PAL.amber, 1.1);
                    }

                    // Repair 1 destroyed dome every wave cleared!
                    for (let i = 0; i < domes.length; i++) {
                        if (!domes[i].alive) {
                            domes[i].alive = true;
                            sfx(ctx, 'powerup');
                            fx.ring(domes[i].x, domes[i].y, 65, PAL.mint, 0.5, 3);
                            fx.floatText(domes[i].x, domes[i].y - 36, 'DOME REPAIRED!', PAL.mint, 1.15);
                            break;
                        }
                    }

                    if (ctx.isStory && wave >= 3) {
                        ended = true;
                        sfx(ctx, 'levelup');
                        ctx.onWin?.({ score: Math.floor(score), level: stage, wave });
                        return;
                    }
                    if (wave % 3 === 0) stage += 1;
                    startWave(wave + 1);
                }
            }
        }

        function render(g) {
            g.save();
            fx.applyShake(g);
            stars.draw(g, '#040712', '#101833');

            // Lunar horizon surface
            g.save();
            g.fillStyle = '#0c162d';
            g.fillRect(0, GROUND_Y, W, H - GROUND_Y);
            g.strokeStyle = PAL.sky;
            g.lineWidth = 2;
            g.beginPath();
            g.moveTo(0, GROUND_Y);
            g.lineTo(W, GROUND_Y);
            g.stroke();
            g.restore();

            // 4 Colony Domes
            for (let i = 0; i < domes.length; i++) {
                const d = domes[i];
                if (d.alive) {
                    drawSprite(g, ctx.sprites, 'astronaut', d.x - 10, d.y + 1, 18, 18);
                    drawSprite(g, ctx.sprites, 'shield_battery', d.x + 10, d.y + 1, 18, 18);
                    g.save();
                    const pulse = 0.72 + 0.22 * Math.sin(time * 4 + d.shieldPulse);
                    g.strokeStyle = PAL.mint;
                    g.fillStyle = 'rgba(52, 211, 153, 0.16)';
                    g.shadowColor = PAL.mint;
                    g.shadowBlur = 14 * pulse;
                    g.lineWidth = 2.2;
                    g.beginPath();
                    g.arc(d.x, GROUND_Y, 32, Math.PI, 0);
                    g.closePath();
                    g.fill();
                    g.stroke();
                    g.restore();
                } else {
                    g.save();
                    g.fillStyle = 'rgba(251, 113, 133, 0.25)';
                    g.fillRect(d.x - 24, GROUND_Y - 5, 48, 5);
                    g.restore();
                }
            }

            // 3 Rail Batteries
            for (let i = 0; i < batteries.length; i++) {
                const b = batteries[i];
                drawSprite(g, ctx.sprites, 'laser_turret', b.x, b.y, 38, 38, {
                    angle: b.angle,
                    glow: b.ammo > 0 ? PAL.sky : PAL.coral,
                    glowBlur: 10
                });
                g.save();
                g.font = '700 11px "JetBrains Mono", monospace';
                g.textAlign = 'center';
                g.fillStyle = b.ammo > 3 ? PAL.sky : (b.ammo > 0 ? PAL.amber : PAL.coral);
                g.fillText('FLAK:' + b.ammo, b.x, GROUND_Y + 20);
                if (b.ammo <= 0) {
                    const pct = clamp(b.rechargeCd / 2.5, 0, 1);
                    g.fillStyle = 'rgba(15, 23, 42, 0.9)';
                    g.fillRect(b.x - 24, GROUND_Y + 25, 48, 5);
                    g.fillStyle = PAL.amber;
                    g.fillRect(b.x - 24, GROUND_Y + 25, 48 * pct, 5);
                }
                g.restore();
            }

            // Meteor trails & sprites
            for (let i = 0; i < meteors.length; i++) {
                const m = meteors[i];
                g.save();
                g.strokeStyle = m.isSplit ? PAL.coral : PAL.amber;
                g.globalAlpha = 0.45;
                g.lineWidth = 2;
                g.beginPath();
                g.moveTo(m.x - m.vx * 0.28, m.y - m.vy * 0.28);
                g.lineTo(m.x, m.y);
                g.stroke();
                g.restore();

                drawSprite(g, ctx.sprites, m.isSplit ? 'boss_core' : 'plasma_bomb', m.x, m.y, m.isSplit ? 24 : 20, m.isSplit ? 24 : 20, {
                    angle: time * 4,
                    glow: m.isSplit ? PAL.coral : PAL.amber,
                    glowBlur: 12
                });
            }

            if (bomberUfo) {
                drawSprite(g, ctx.sprites, 'ufo', bomberUfo.x, bomberUfo.y, 38, 38, {
                    glow: PAL.coral,
                    glowBlur: 14
                });
            }

            // Interceptors + target markers
            for (let i = 0; i < interceptors.length; i++) {
                const r = interceptors[i];
                g.save();
                g.strokeStyle = PAL.sky;
                g.lineWidth = 2.4;
                g.beginPath();
                for (let t = 0; t < r.trail.length; t++) {
                    if (t === 0) g.moveTo(r.trail[t].x, r.trail[t].y);
                    else g.lineTo(r.trail[t].x, r.trail[t].y);
                }
                g.lineTo(r.x, r.y);
                g.stroke();
                g.fillStyle = PAL.white;
                g.fillRect(r.x - 2, r.y - 2, 4, 4);
                // Target X
                g.strokeStyle = 'rgba(56,189,248,0.65)';
                g.lineWidth = 1.4;
                g.beginPath();
                g.moveTo(r.tx - 5, r.ty - 5); g.lineTo(r.tx + 5, r.ty + 5);
                g.moveTo(r.tx + 5, r.ty - 5); g.lineTo(r.tx - 5, r.ty + 5);
                g.stroke();
                g.restore();
            }

            // Expanding explosion flak spheres
            for (let i = 0; i < explosions.length; i++) {
                const ex = explosions[i];
                const a = clamp(ex.life / ex.maxLife, 0, 1);
                g.save();
                g.globalAlpha = a * 0.8;
                const grad = g.createRadialGradient(ex.x, ex.y, 2, ex.x, ex.y, ex.r);
                grad.addColorStop(0, '#ffffff');
                grad.addColorStop(0.5, ex.color);
                grad.addColorStop(1, 'rgba(56,189,248,0)');
                g.fillStyle = grad;
                g.beginPath();
                g.arc(ex.x, ex.y, ex.r, 0, TAU);
                g.fill();
                g.strokeStyle = PAL.white;
                g.lineWidth = 1.5;
                g.stroke();
                g.restore();
            }

            // Aim reticle (exact parity with launchFlak coordinate clamping)
            if (!ended) {
                const rx = clamp(input.pointer.x, 16, W - 16);
                const ry = clamp(input.pointer.y, 24, GROUND_Y - 32);
                g.save();
                g.strokeStyle = PAL.sky;
                g.lineWidth = 1.5;
                g.beginPath();
                g.arc(rx, ry, 12, 0, TAU);
                g.moveTo(rx - 18, ry); g.lineTo(rx - 7, ry);
                g.moveTo(rx + 7, ry); g.lineTo(rx + 18, ry);
                g.moveTo(rx, ry - 18); g.lineTo(rx, ry - 7);
                g.moveTo(rx, ry + 7); g.lineTo(rx, ry + 18);
                g.stroke();
                g.restore();
            }

            fx.drawParticles(g);
            fx.drawOverlays(g);
            drawInCanvasFooter(g, '[Click Sky / 1-2-3 / Space] Fire Interceptor Flak  ·  Defend The 4 Colony Domes!');
            g.restore();
        }

        function getHud() {
            let aliveDomes = 0;
            for (let i = 0; i < domes.length; i++) if (domes[i].alive) aliveDomes++;
            return {
                score: Math.floor(score),
                level: stage,
                wave,
                lives: aliveDomes,
                hp: aliveDomes,
                maxHp: 4,
                status: 'WAVE ' + wave + '/3 · DOMES ' + aliveDomes + '/4'
            };
        }

        return { init, update, render, getHud };
    }

    // =========================================================================
    // 9. LUNAR EXCAVATOR (`lunar-excavator`)
    // =========================================================================
    function createExcavatorEngine(ctx, canvas, g, input) {
        const COLS = 24;
        const ROWS = 14;
        const TILE = 36;
        const OX = (W - COLS * TILE) * 0.5;
        const OY = 34;
        const stars = createStarfield(70);
        const fx = createFxSystem();

        let stage = 1;
        let score = 0;
        let lives = 3;
        let ended = false;
        let time = 0;

        // 0 = empty tunnel, 1 = regolith solid
        let grid = [];
        let player = null;
        let enemies = [];
        let boulders = [];
        let bonusItem = null;
        let bouldersDropped = 0;
        let zapBeam = null;

        function tileCenter(c, r) {
            return { x: OX + c * TILE + TILE * 0.5, y: OY + r * TILE + TILE * 0.5 };
        }

        function carveRect(c1, r1, c2, r2) {
            for (let r = r1; r <= r2; r++) {
                for (let c = c1; c <= c2; c++) {
                    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
                        grid[r][c] = 0;
                    }
                }
            }
        }

        function setupCavern(lvl) {
            grid = [];
            for (let r = 0; r < ROWS; r++) {
                const row = [];
                for (let c = 0; c < COLS; c++) {
                    row.push(r === 0 ? 0 : 1); // row 0 is open lunar surface
                }
                grid.push(row);
            }

            // Starter shaft down to central chamber
            carveRect(11, 0, 12, 6);
            carveRect(10, 6, 13, 6);

            // Carve enemy pockets across layers (strictly clear of boulder support cells)
            const pockets = [
                [3, 4, 7, 4],
                [17, 4, 20, 4],
                [3, 8, 3, 11],
                [17, 10, 21, 10],
                [7, 11, 11, 11],
                [14, 12, 18, 12]
            ];
            for (let i = 0; i < pockets.length; i++) {
                carveRect(pockets[i][0], pockets[i][1], pockets[i][2], pockets[i][3]);
            }

            // Place Asteroid Boulders resting on solid regolith above corridors/pockets
            boulders = [];
            const bSpots = [
                { c: 4, r: 2 },
                { c: 19, r: 2 },
                { c: 9, r: 5 },
                { c: 15, r: 6 },
                { c: 5, r: 7 },
                { c: 19, r: 8 }
            ];
            for (let i = 0; i < bSpots.length; i++) {
                const bs = bSpots[i];
                grid[bs.r][bs.c] = 1; // boulder cell
                grid[bs.r + 1][bs.c] = 1; // solid regolith directly supporting boulder
                boulders.push({
                    c: bs.c,
                    r: bs.r,
                    x: tileCenter(bs.c, bs.r).x,
                    y: tileCenter(bs.c, bs.r).y,
                    state: 'idle', // idle | wobble | falling | shatter
                    timer: 0,
                    fallDist: 0,
                    crushedCount: 0
                });
            }

            // Place Alien Subterranean Beetles strictly inside open pockets
            enemies = [];
            const enemySpawns = [
                { c: 5, r: 4, kind: 'beetle' },
                { c: 19, r: 4, kind: 'magma' },
                { c: 3, r: 10, kind: 'beetle' },
                { c: 20, r: 10, kind: 'magma' },
                { c: 9, r: 11, kind: 'beetle' },
                { c: 16, r: 12, kind: 'magma' }
            ];
            const count = Math.min(enemySpawns.length, 4 + lvl);
            for (let i = 0; i < count; i++) {
                const sp = enemySpawns[i % enemySpawns.length];
                const pos = tileCenter(sp.c, sp.r);
                enemies.push({
                    x: pos.x,
                    y: pos.y,
                    dirX: i % 2 === 0 ? 1 : -1,
                    dirY: 0,
                    kind: sp.kind,
                    inflate: 0,
                    deflateCd: 0,
                    ghostTimer: randRange(4.5, 9.5),
                    ghosting: false,
                    ghostDuration: 0,
                    fireCd: randRange(3.0, 6.0),
                    speed: 88 + lvl * 10
                });
            }
        }

        function resetPlayer() {
            const p = tileCenter(11, 6);
            player = {
                x: p.x,
                y: p.y,
                dirX: 1,
                dirY: 0,
                invuln: 2.0,
                tetherTarget: null,
                tetherLen: 0,
                pumpCooldown: 0
            };
            zapBeam = null;
        }

        function init(lvl) {
            stage = lvl;
            score = 0;
            lives = 3;
            ended = false;
            time = 0;
            bonusItem = null;
            bouldersDropped = 0;
            setupCavern(lvl);
            resetPlayer();
            fx.showBanner(
                'LUNAR EXCAVATION DEPTH ' + stage,
                'UNDERMINE ASTEROIDS TO CRUSH BEETLES · [SPACE] ZAP-PUMP!',
                PAL.amber,
                2.4
            );
        }

        function isSolid(c, r) {
            if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return true;
            return grid[r][c] === 1;
        }

        function boulderAt(c, r, ignoreBoulder) {
            for (let i = 0; i < boulders.length; i++) {
                const b = boulders[i];
                if (b === ignoreBoulder) continue;
                if (b.state === 'idle' || b.state === 'wobble') {
                    if (Math.floor((b.x - OX) / TILE) === c && Math.floor((b.y - OY) / TILE) === r) return true;
                }
            }
            return false;
        }

        function damagePlayer() {
            if (player.invuln > 0 || ended) return;
            lives--;
            sfx(ctx, 'playerHurt');
            fx.burst(player.x, player.y, 26, PAL.coral, 240, 4, 0.6);
            fx.shake(10, 0.35);
            if (lives <= 0) {
                ended = true;
                ctx.onGameOver?.({ score: Math.floor(score), level: stage, wave: stage });
                return;
            }
            resetPlayer();
        }

        function killEnemy(idx, viaCrush, crushCombo) {
            const e = enemies[idx];
            if (!e) return;
            const layerPts = Math.floor((e.y - OY) / TILE) >= 8 ? 400 : 250;
            const pts = viaCrush ? 1000 * crushCombo : layerPts;
            score += pts;
            sfx(ctx, viaCrush ? 'explodeBoss' : 'explodeSmall', 0.16);
            fx.burst(e.x, e.y, 20, viaCrush ? PAL.amber : PAL.violet, 220, 4, 0.55);
            fx.ring(e.x, e.y, 44, viaCrush ? PAL.amber : PAL.sky, 0.35);
            fx.floatText(
                e.x,
                e.y - 14,
                viaCrush ? ('CRUSH' + (crushCombo > 1 ? ' x' + crushCombo : '') + ' +' + pts + '!') : ('POP +' + pts),
                viaCrush ? PAL.amber : PAL.mint,
                viaCrush ? 1.25 : 1.05
            );
            enemies.splice(idx, 1);
        }

        function update(dt) {
            time += dt;
            stars.update(dt, 4, 0);
            fx.update(dt);
            if (ended) return;

            if (player.invuln > 0) player.invuln = Math.max(0, player.invuln - dt);
            if (player.pumpCooldown > 0) player.pumpCooldown = Math.max(0, player.pumpCooldown - dt);

            // Player grid-assisted corridor digging movement
            let mx = 0;
            let my = 0;
            if (input.anyDown(['KeyA', 'ArrowLeft'])) mx = -1;
            else if (input.anyDown(['KeyD', 'ArrowRight'])) mx = 1;
            if (mx === 0) {
                if (input.anyDown(['KeyW', 'ArrowUp'])) my = -1;
                else if (input.anyDown(['KeyS', 'ArrowDown'])) my = 1;
            }

            if ((mx !== 0 || my !== 0) && !input.anyDown(['Space'])) {
                player.tetherTarget = null;
                zapBeam = null;
                const col = clamp(Math.floor((player.x - OX) / TILE), 0, COLS - 1);
                const row = clamp(Math.floor((player.y - OY) / TILE), 0, ROWS - 1);
                const center = tileCenter(col, row);

                const spd = 158;
                if (mx !== 0) {
                    player.dirX = mx;
                    player.dirY = 0;
                    // Smooth snap to row center
                    player.y = lerp(player.y, center.y, Math.min(1, dt * 16));
                    const nextX = clamp(player.x + mx * spd * dt, OX + TILE * 0.5, OX + COLS * TILE - TILE * 0.5);
                    const nc = clamp(Math.floor((nextX + mx * 12 - OX) / TILE), 0, COLS - 1);
                    if (!boulderAt(nc, row)) player.x = nextX;
                } else if (my !== 0) {
                    player.dirX = 0;
                    player.dirY = my;
                    player.x = lerp(player.x, center.x, Math.min(1, dt * 16));
                    const nextY = clamp(player.y + my * spd * dt, OY + TILE * 0.5, OY + ROWS * TILE - TILE * 0.5);
                    const nr = clamp(Math.floor((nextY + my * 12 - OY) / TILE), 0, ROWS - 1);
                    if (!boulderAt(col, nr)) player.y = nextY;
                }

                // Dig regolith tile at player position (never delete resting boulder tile)
                const dc = clamp(Math.floor((player.x - OX) / TILE), 0, COLS - 1);
                const dr = clamp(Math.floor((player.y - OY) / TILE), 0, ROWS - 1);
                if (grid[dr][dc] === 1 && !boulderAt(dc, dr)) {
                    grid[dr][dc] = 0;
                    score += 10;
                    sfx(ctx, 'hitMetal', 0.25);
                    fx.burst(player.x, player.y, 6, dr > 8 ? '#a78bfa' : '#38bdf8', 90, 3, 0.28);
                }
            }

            // Zap / Pump attack with Space
            if (input.anyDown(['Space', 'KeyZ'])) {
                if (player.tetherTarget && enemies.indexOf(player.tetherTarget) >= 0) {
                    const t = player.tetherTarget;
                    zapBeam = { x1: player.x, y1: player.y, x2: t.x, y2: t.y };
                    if (player.pumpCooldown <= 0) {
                        player.pumpCooldown = 0.22;
                        t.inflate += 1;
                        t.deflateCd = 1.1;
                        sfx(ctx, 'shootPlasma', 0.1 + t.inflate * 0.12);
                        fx.ring(t.x, t.y, 18 + t.inflate * 5, PAL.mint, 0.22);
                        if (t.inflate >= 4) {
                            const idx = enemies.indexOf(t);
                            player.tetherTarget = null;
                            zapBeam = null;
                            killEnemy(idx, false, 1);
                        }
                    }
                } else {
                    // Extend beam up to 86px along facing direction (handles 0px close-range lock cleanly)
                    player.tetherLen = Math.min(86, player.tetherLen + 400 * dt);
                    let hitWall = false;
                    let bx = player.x + player.dirX * Math.min(player.tetherLen, 10);
                    let by = player.y + player.dirY * Math.min(player.tetherLen, 10);
                    for (let step = 0; step <= player.tetherLen; step += 4) {
                        const tx = player.x + player.dirX * step;
                        const ty = player.y + player.dirY * step;
                        for (let ei = 0; ei < enemies.length; ei++) {
                            if (distSq(tx, ty, enemies[ei].x, enemies[ei].y) < 24 * 24) {
                                player.tetherTarget = enemies[ei];
                                player.pumpCooldown = 0;
                                bx = tx;
                                by = ty;
                                break;
                            }
                        }
                        if (player.tetherTarget) break;

                        const tc = Math.floor((tx - OX) / TILE);
                        const tr = Math.floor((ty - OY) / TILE);
                        bx = tx;
                        by = ty;
                        if (tc < 0 || tc >= COLS || tr < 0 || tr >= ROWS || isSolid(tc, tr)) {
                            hitWall = true;
                            break;
                        }
                    }
                    zapBeam = { x1: player.x, y1: player.y, x2: bx, y2: by };
                    if (hitWall) player.tetherLen = Math.min(player.tetherLen, 12);
                }
            } else {
                player.tetherTarget = null;
                player.tetherLen = 0;
                zapBeam = null;
            }

            // Update Boulders (1s wobble after undermining -> fall & multi-crush!)
            for (let i = boulders.length - 1; i >= 0; i--) {
                const b = boulders[i];
                const bc = clamp(Math.floor((b.x - OX) / TILE), 0, COLS - 1);
                const br = clamp(Math.floor((b.y - OY) / TILE), 0, ROWS - 1);

                if (b.state === 'idle') {
                    if (br + 1 < ROWS && grid[br + 1][bc] === 0) {
                        b.state = 'wobble';
                        b.timer = 0.95; // ~1 second warning before collapse!
                        sfx(ctx, 'uiClick');
                        fx.floatText(b.x, b.y - 22, 'ROCK UNSTABLE!', PAL.amber);
                    }
                } else if (b.state === 'wobble') {
                    b.timer -= dt;
                    if (Math.random() < 0.35) {
                        fx.spawn(b.x + randRange(-10, 10), b.y + 14, 0, 35, PAL.amber, 2.5, 0.25);
                    }
                    if (b.timer <= 0) {
                        b.state = 'falling';
                        b.fallDist = 0;
                        b.crushedCount = 0;
                        grid[br][bc] = 0;
                        sfx(ctx, 'dash');
                    }
                } else if (b.state === 'falling') {
                    const dy = 330 * dt;
                    b.y += dy;
                    b.fallDist += dy;

                    // Crush any enemies in path
                    for (let ei = enemies.length - 1; ei >= 0; ei--) {
                        if (distSq(b.x, b.y, enemies[ei].x, enemies[ei].y) < 26 * 26) {
                            b.crushedCount += 1;
                            if (player.tetherTarget === enemies[ei]) player.tetherTarget = null;
                            killEnemy(ei, true, b.crushedCount);
                        }
                    }

                    // Crush careless player directly beneath falling boulder
                    if (distSq(b.x, b.y, player.x, player.y) < 22 * 22) {
                        damagePlayer();
                    }

                    const checkRow = Math.floor((b.y + TILE * 0.48 - OY) / TILE);
                    if (b.fallDist > TILE * 0.85 && (checkRow >= ROWS || isSolid(bc, checkRow))) {
                        b.state = 'shatter';
                        b.timer = 0.28;
                        sfx(ctx, 'explodeSmall');
                        fx.burst(b.x, b.y, 18, PAL.muted, 190, 4, 0.45);
                        fx.shake(7, 0.22);
                        bouldersDropped++;
                        if (bouldersDropped % 2 === 0 && !bonusItem) {
                            const spot = tileCenter(11, 6);
                            bonusItem = { x: spot.x, y: spot.y, life: 12 };
                            fx.floatText(spot.x, spot.y - 20, 'CRYO BONUS SPAWNED!', PAL.mint);
                        }
                    }
                } else if (b.state === 'shatter') {
                    b.timer -= dt;
                    if (b.timer <= 0) boulders.splice(i, 1);
                }
            }

            // Bonus Crystal pickup
            if (bonusItem) {
                bonusItem.life -= dt;
                if (bonusItem.life <= 0) bonusItem = null;
                else if (distSq(player.x, player.y, bonusItem.x, bonusItem.y) < 26 * 26) {
                    score += 1000;
                    sfx(ctx, 'chestOpen');
                    fx.burst(bonusItem.x, bonusItem.y, 22, PAL.mint, 220, 4, 0.5);
                    fx.floatText(bonusItem.x, bonusItem.y - 16, 'BONUS +1000!', PAL.mint, 1.3);
                    bonusItem = null;
                }
            }

            // Update Enemies (Beetles & Ghost-Phasing Stalkers)
            for (let i = 0; i < enemies.length; i++) {
                const e = enemies[i];

                // Deflation if pumped partially
                if (e.inflate > 0) {
                    e.deflateCd -= dt;
                    if (e.deflateCd <= 0) {
                        e.inflate -= 1;
                        e.deflateCd = 0.75;
                    }
                    continue; // Stunned while inflated!
                }

                e.ghostTimer -= dt;
                const ec = clamp(Math.floor((e.x - OX) / TILE), 0, COLS - 1);
                const er = clamp(Math.floor((e.y - OY) / TILE), 0, ROWS - 1);
                const center = tileCenter(ec, er);

                if (e.ghosting) {
                    e.ghostDuration -= dt;
                    const ang = Math.atan2(player.y - e.y, player.x - e.x);
                    e.x = clamp(e.x + Math.cos(ang) * (e.speed * 0.72) * dt, OX + TILE * 0.5, OX + COLS * TILE - TILE * 0.5);
                    e.y = clamp(e.y + Math.sin(ang) * (e.speed * 0.72) * dt, OY + TILE * 0.5, OY + ROWS * TILE - TILE * 0.5);
                    if (e.ghostDuration <= 0 && !isSolid(ec, er) && !boulderAt(ec, er)) {
                        e.ghosting = false;
                        e.ghostTimer = randRange(6.5, 11.0);
                        e.x = center.x;
                        e.y = center.y;
                        e.dirX = Math.abs(player.x - e.x) >= Math.abs(player.y - e.y) ? (player.x >= e.x ? 1 : -1) : 0;
                        e.dirY = e.dirX === 0 ? (player.y >= e.y ? 1 : -1) : 0;
                    }
                } else {
                    if (e.ghostTimer <= 0 || (e.dirX === 0 && e.dirY === 0)) {
                        e.ghosting = true;
                        e.ghostDuration = e.dirX === 0 && e.dirY === 0 ? 1.6 : 2.6;
                    } else {
                        // Follow open tunnels toward player at tile centers
                        if (Math.abs(e.x - center.x) < 4 && Math.abs(e.y - center.y) < 4) {
                            const dirs = [
                                { dx: 1, dy: 0 },
                                { dx: -1, dy: 0 },
                                { dx: 0, dy: 1 },
                                { dx: 0, dy: -1 }
                            ].filter((d) => !isSolid(ec + d.dx, er + d.dy) && !boulderAt(ec + d.dx, er + d.dy));
                            if (dirs.length > 0) {
                                // Prefer not immediately reversing unless dead end
                                let choices = dirs.filter((d) => !(d.dx === -e.dirX && d.dy === -e.dirY));
                                if (!choices.length) choices = dirs;
                                // Pick direction minimizing distance to player
                                choices.sort((a, b) => {
                                    const da = distSq(center.x + a.dx * TILE, center.y + a.dy * TILE, player.x, player.y);
                                    const db = distSq(center.x + b.dx * TILE, center.y + b.dy * TILE, player.x, player.y);
                                    return da - db;
                                });
                                e.dirX = choices[0].dx;
                                e.dirY = choices[0].dy;
                            } else {
                                e.ghosting = true;
                                e.ghostDuration = 1.6;
                            }
                        }
                        if (!e.ghosting) {
                            if (e.dirX !== 0) e.y = lerp(e.y, center.y, Math.min(1, dt * 14));
                            if (e.dirY !== 0) e.x = lerp(e.x, center.x, Math.min(1, dt * 14));
                            const nx = clamp(e.x + e.dirX * e.speed * dt, OX + TILE * 0.5, OX + COLS * TILE - TILE * 0.5);
                            const ny = clamp(e.y + e.dirY * e.speed * dt, OY + TILE * 0.5, OY + ROWS * TILE - TILE * 0.5);
                            const nc = clamp(Math.floor((nx + e.dirX * 12 - OX) / TILE), 0, COLS - 1);
                            const nr = clamp(Math.floor((ny + e.dirY * 12 - OY) / TILE), 0, ROWS - 1);
                            if (!isSolid(nc, nr) && !boulderAt(nc, nr)) {
                                e.x = nx;
                                e.y = ny;
                            } else {
                                e.x = center.x;
                                e.y = center.y;
                                e.dirX *= -1;
                                e.dirY *= -1;
                            }
                        }
                    }
                }

                if (e.inflate <= 0 && distSq(e.x, e.y, player.x, player.y) < 20 * 20) {
                    damagePlayer();
                }
            }

            // Win when all beetles are eliminated
            if (enemies.length === 0) {
                if (ctx.isStory) {
                    ended = true;
                    sfx(ctx, 'levelup');
                    ctx.onWin?.({ score: Math.floor(score), level: stage, wave: stage });
                } else {
                    stage += 1;
                    score += 1200 * stage;
                    sfx(ctx, 'levelup');
                    bonusItem = null;
                    bouldersDropped = 0;
                    setupCavern(stage);
                    resetPlayer();
                    fx.showBanner('DEPTH ' + stage, 'DEEPER CAVERN UNLOCKED!', PAL.amber, 2.0);
                }
            }
        }

        function render(g) {
            g.save();
            fx.applyShake(g);
            stars.draw(g, '#040814', '#091124');

            // Surface lander at top left
            drawSprite(g, ctx.sprites, 'moon_lander', OX + 72, OY + 16, 32, 32);

            // Subterranean rock strata tiles
            const layerColors = [
                '#0c162d',
                '#172542', '#172542', '#172542',
                '#16324f', '#16324f', '#16324f',
                '#28214d', '#28214d', '#28214d',
                '#3b232a', '#3b232a', '#3b232a', '#3b232a'
            ];

            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    const tx = OX + c * TILE;
                    const ty = OY + r * TILE;
                    if (grid[r][c] === 1) {
                        g.fillStyle = layerColors[r] || '#1e293b';
                        g.fillRect(tx, ty, TILE, TILE);
                        g.strokeStyle = 'rgba(255, 255, 255, 0.055)';
                        g.lineWidth = 1;
                        g.strokeRect(tx + 0.5, ty + 0.5, TILE - 1, TILE - 1);
                        // Subtle crystalline speckles
                        if ((c * 7 + r * 13) % 11 === 0) {
                            g.fillStyle = r > 8 ? 'rgba(245, 158, 11, 0.25)' : 'rgba(56, 189, 248, 0.22)';
                            g.fillRect(tx + 12, ty + 14, 4, 4);
                        }
                    } else if (r > 0) {
                        g.fillStyle = '#060a16';
                        g.fillRect(tx, ty, TILE, TILE);
                    }
                }
            }

            // Cavern side borders
            g.strokeStyle = 'rgba(56, 189, 248, 0.35)';
            g.lineWidth = 2;
            g.strokeRect(OX, OY, COLS * TILE, ROWS * TILE);

            // Bonus Cryo Crystal
            if (bonusItem) {
                drawSprite(g, ctx.sprites, 'cryo_crystal', bonusItem.x, bonusItem.y, 28, 28, {
                    angle: Math.sin(time * 5) * 0.18,
                    glow: PAL.mint,
                    glowBlur: 14
                });
            }

            // Asteroid Boulders
            for (let i = 0; i < boulders.length; i++) {
                const b = boulders[i];
                const wobX = b.state === 'wobble' ? Math.sin(time * 48) * 3.5 : 0;
                drawSprite(g, ctx.sprites, 'asteroid', b.x + wobX, b.y, TILE - 2, TILE - 2, {
                    alpha: b.state === 'shatter' ? 0.5 : 1,
                    glow: b.state === 'wobble' || b.state === 'falling' ? PAL.amber : null,
                    glowBlur: 12
                });
            }

            // Zap Pump Beam
            if (zapBeam) {
                g.save();
                g.strokeStyle = PAL.mint;
                g.shadowColor = PAL.mint;
                g.shadowBlur = 12;
                g.lineWidth = 3.5;
                g.beginPath();
                g.moveTo(zapBeam.x1, zapBeam.y1);
                g.lineTo(zapBeam.x2, zapBeam.y2);
                g.stroke();
                g.strokeStyle = PAL.white;
                g.lineWidth = 1.2;
                g.stroke();
                g.restore();
            }

            // Subterranean Beetles (with inflate ring indicator)
            for (let i = 0; i < enemies.length; i++) {
                const e = enemies[i];
                const scale = 1 + e.inflate * 0.19;
                const sz = (TILE - 4) * scale;
                const ang = Math.atan2(e.dirY, e.dirX) + Math.PI * 0.5;
                if (e.inflate > 0) {
                    g.save();
                    g.strokeStyle = PAL.mint;
                    g.lineWidth = 2;
                    g.beginPath();
                    g.arc(e.x, e.y, sz * 0.62, 0, TAU * (e.inflate / 4));
                    g.stroke();
                    g.restore();
                }
                drawSprite(g, ctx.sprites, e.kind === 'magma' ? 'alien_drone' : 'ufo', e.x, e.y, sz, sz, {
                    angle: e.kind === 'magma' ? ang : 0,
                    alpha: e.ghosting ? 0.55 : 1,
                    hitFlash: e.inflate >= 3,
                    glow: e.ghosting ? PAL.sky : (e.kind === 'magma' ? PAL.coral : PAL.violet),
                    glowBlur: 12
                });
            }

            // Player Astronaut Excavator + spawn protection ring
            if (player.invuln > 0 && !ended) {
                g.save();
                g.strokeStyle = PAL.sky;
                g.globalAlpha = 0.55 + 0.25 * Math.sin(time * 12);
                g.lineWidth = 2;
                g.beginPath();
                g.arc(player.x, player.y, TILE * 0.55, 0, TAU);
                g.stroke();
                g.restore();
            }
            if (!(player.invuln > 0 && Math.floor(time * 16) % 2 === 0) && !ended) {
                drawSprite(g, ctx.sprites, 'astronaut', player.x, player.y, TILE - 4, TILE - 4, {
                    flipX: player.dirX < 0,
                    glow: PAL.sky,
                    glowBlur: 10
                });
            }

            fx.drawParticles(g);
            fx.drawOverlays(g);
            drawInCanvasFooter(g, '[WASD / Arrows] Excavate Tunnels  ·  [Space] Pump-Zap Beetles  ·  Undermine Boulders To Crush!');
            g.restore();
        }

        function getHud() {
            return {
                score: Math.floor(score),
                level: stage,
                wave: stage,
                lives,
                hp: lives,
                maxHp: 3,
                status: 'DEPTH ' + stage + ' · BEETLES ' + enemies.length
            };
        }

        return { init, update, render, getHud };
    }

    // =========================================================================
    // Registry on window.COSMIC_GAME_ENGINES
    // =========================================================================
    const REGISTRY = global.COSMIC_GAME_ENGINES || (global.COSMIC_GAME_ENGINES = {});

    REGISTRY['galaga-swarm-assault'] = function mount(ctx) {
        return mountEngine(ctx, createGalagaEngine);
    };
    REGISTRY['defender-patrol'] = function mount(ctx) {
        return mountEngine(ctx, createDefenderEngine);
    };
    REGISTRY['astro-vector-asteroids'] = function mount(ctx) {
        return mountEngine(ctx, createAsteroidsEngine);
    };
    REGISTRY['cosmic-snake-leviathan'] = function mount(ctx) {
        return mountEngine(ctx, createSnakeEngine);
    };
    REGISTRY['quantum-brick-breaker'] = function mount(ctx) {
        return mountEngine(ctx, createBrickBreakerEngine);
    };
    REGISTRY['twin-paddle-pong'] = function mount(ctx) {
        return mountEngine(ctx, createPongEngine);
    };
    REGISTRY['centipede-spore-purge'] = function mount(ctx) {
        return mountEngine(ctx, createCentipedeEngine);
    };
    REGISTRY['missile-dome-defense'] = function mount(ctx) {
        return mountEngine(ctx, createMissileDefenseEngine);
    };
    REGISTRY['lunar-excavator'] = function mount(ctx) {
        return mountEngine(ctx, createExcavatorEngine);
    };
})(typeof window !== 'undefined' ? window : globalThis);
