// =============================================================================
// COSMIC UNIVERSE v11.0 — PACK 3: MATTER.JS PHYSICS & GRAVITY GAMES (7 ENGINES)
// 1. orbital-slingshot     (Story Ch.4! 10 levels, target: level 3+)
// 2. moon-lander-apollo    (5 progressive moon sectors)
// 3. cosmic-pinball-rig    (Endless score pinball table)
// 4. nebula-pool-ricochet  (8 puzzle-billiard tables)
// 5. cargo-tower-balance   (Endless precision stacker)
// 6. magnetic-tether-swing (6 sector courses)
// 7. gravity-golf-parsec   (8 orbital mini-golf holes)
// =============================================================================
(function (global) {
    'use strict';

    const W = 960;
    const H = 540;
    const FIXED_DT = 1000 / 60;
    const TAU = Math.PI * 2;

    const PAL = {
        void: '#070b12',
        surface: '#0d1320',
        card: '#131b2c',
        border: 'rgba(148, 163, 184, 0.24)',
        text: '#e2e8f0',
        muted: '#94a3b8',
        sky: '#38bdf8',
        mint: '#34d399',
        amber: '#f59e0b',
        coral: '#fb7185',
        violet: '#a78bfa',
        teal: '#2dd4bf'
    };

    const ENGINES = (global.COSMIC_GAME_ENGINES = global.COSMIC_GAME_ENGINES || {});

    // -------------------------------------------------------------------------
    // Shared Utilities
    // -------------------------------------------------------------------------
    function clamp(v, lo, hi) {
        return v < lo ? lo : (v > hi ? hi : v);
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function normalizeAngle(a) {
        let r = a % TAU;
        if (r > Math.PI) r -= TAU;
        if (r < -Math.PI) r += TAU;
        return r;
    }

    function dist(ax, ay, bx, by) {
        return Math.hypot(bx - ax, by - ay);
    }

    function getMatter() {
        return global.Matter;
    }

    function playSfx(ctx, key, jitter) {
        try {
            if (ctx && ctx.audio && typeof ctx.audio.play === 'function') {
                ctx.audio.play(key, jitter);
            }
        } catch (err) { /* audio guard */ }
    }

    function createRng(seed) {
        let s = (seed >>> 0) || 1337;
        return function next() {
            s = (s * 1664525 + 1013904223) >>> 0;
            return s / 4294967296;
        };
    }

    function createStars(seed, count) {
        const rand = createRng(seed);
        const stars = [];
        for (let i = 0; i < count; i++) {
            stars.push({
                x: rand() * W,
                y: rand() * H,
                r: 0.6 + rand() * 1.6,
                a: 0.25 + rand() * 0.65,
                phase: rand() * TAU,
                speed: 0.7 + rand() * 1.8,
                tint: rand() > 0.85 ? '#38bdf8' : (rand() > 0.7 ? '#a78bfa' : '#e2e8f0')
            });
        }
        return stars;
    }

    function drawSpaceBackdrop(g, stars, timeSec, accentHex, gridStep) {
        g.fillStyle = PAL.void;
        g.fillRect(0, 0, W, H);

        const grad = g.createRadialGradient(W * 0.5, H * 0.35, 30, W * 0.5, H * 0.45, 560);
        grad.addColorStop(0, accentHex || 'rgba(56, 189, 248, 0.10)');
        grad.addColorStop(1, 'rgba(7, 11, 18, 0)');
        g.fillStyle = grad;
        g.fillRect(0, 0, W, H);

        if (gridStep) {
            g.strokeStyle = 'rgba(56, 189, 248, 0.045)';
            g.lineWidth = 1;
            g.beginPath();
            for (let x = gridStep; x < W; x += gridStep) {
                g.moveTo(x, 0);
                g.lineTo(x, H);
            }
            for (let y = gridStep; y < H; y += gridStep) {
                g.moveTo(0, y);
                g.lineTo(W, y);
            }
            g.stroke();
        }

        for (let i = 0; i < stars.length; i++) {
            const st = stars[i];
            const tw = 0.65 + 0.35 * Math.sin(timeSec * st.speed + st.phase);
            g.globalAlpha = st.a * tw;
            g.fillStyle = st.tint;
            g.beginPath();
            g.arc(st.x, st.y, st.r, 0, TAU);
            g.fill();
        }
        g.globalAlpha = 1;
    }

    function getSprite(ctx, key) {
        const s = ctx && ctx.sprites ? ctx.sprites[key] : null;
        if (!s) return null;
        if (typeof s.complete === 'boolean' && !s.complete) return null;
        if (typeof s.naturalWidth === 'number' && s.naturalWidth <= 0) return null;
        if (typeof s.width === 'number' && s.width <= 0) return null;
        return s;
    }

    function drawSprite(g, ctx, key, x, y, w, h, angle, alpha) {
        const img = getSprite(ctx, key);
        if (!img) return false;
        g.save();
        g.translate(x, y);
        if (angle) g.rotate(angle);
        if (alpha !== undefined && alpha !== 1) g.globalAlpha = alpha;
        g.drawImage(img, -w * 0.5, -h * 0.5, w, h);
        g.restore();
        return true;
    }

    function createFxSystem() {
        const particles = [];
        const rings = [];
        const popups = [];

        function burst(x, y, color, count, minSpd, maxSpd, life, size) {
            for (let i = 0; i < count; i++) {
                if (particles.length >= 340) particles.shift();
                const a = Math.random() * TAU;
                const spd = lerp(minSpd || 1, maxSpd || 4.5, Math.random());
                particles.push({
                    x, y,
                    vx: Math.cos(a) * spd,
                    vy: Math.sin(a) * spd,
                    life: life || 0.45,
                    maxLife: life || 0.45,
                    color: color || PAL.sky,
                    size: (size || 2.6) * (0.7 + Math.random() * 0.6)
                });
            }
        }

        function jet(x, y, dirX, dirY, spread, color, spd, life, size) {
            if (particles.length >= 340) particles.shift();
            const baseAngle = Math.atan2(dirY, dirX) + (Math.random() - 0.5) * spread;
            const s = spd * (0.75 + Math.random() * 0.5);
            particles.push({
                x, y,
                vx: Math.cos(baseAngle) * s,
                vy: Math.sin(baseAngle) * s,
                life: life || 0.25,
                maxLife: life || 0.25,
                color: color || PAL.amber,
                size: size || 3
            });
        }

        function ring(x, y, color, maxR, life) {
            if (rings.length >= 40) rings.shift();
            rings.push({ x, y, color: color || PAL.sky, maxR: maxR || 42, life: life || 0.35, maxLife: life || 0.35 });
        }

        function popup(x, y, text, color) {
            if (popups.length >= 24) popups.shift();
            popups.push({ x, y, text, color: color || PAL.mint, life: 0.9, maxLife: 0.9 });
        }

        function update(dtSec) {
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx * (dtSec * 60);
                p.y += p.vy * (dtSec * 60);
                p.vx *= 0.96;
                p.vy *= 0.96;
                p.life -= dtSec;
                if (p.life <= 0) particles.splice(i, 1);
            }
            for (let i = rings.length - 1; i >= 0; i--) {
                rings[i].life -= dtSec;
                if (rings[i].life <= 0) rings.splice(i, 1);
            }
            for (let i = popups.length - 1; i >= 0; i--) {
                popups[i].y -= 28 * dtSec;
                popups[i].life -= dtSec;
                if (popups[i].life <= 0) popups.splice(i, 1);
            }
        }

        function render(g) {
            for (let i = 0; i < rings.length; i++) {
                const r = rings[i];
                const t = 1 - r.life / r.maxLife;
                g.save();
                g.globalAlpha = (1 - t) * 0.85;
                g.strokeStyle = r.color;
                g.lineWidth = 2.4 * (1 - t * 0.5);
                g.beginPath();
                g.arc(r.x, r.y, 6 + t * r.maxR, 0, TAU);
                g.stroke();
                g.restore();
            }
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                const a = clamp(p.life / p.maxLife, 0, 1);
                g.globalAlpha = a;
                g.fillStyle = p.color;
                g.beginPath();
                g.arc(p.x, p.y, p.size * (0.4 + 0.6 * a), 0, TAU);
                g.fill();
            }
            g.globalAlpha = 1;
            for (let i = 0; i < popups.length; i++) {
                const pp = popups[i];
                const a = clamp(pp.life / pp.maxLife, 0, 1);
                g.save();
                g.globalAlpha = a;
                g.font = '700 13px "JetBrains Mono", monospace';
                g.textAlign = 'center';
                g.fillStyle = 'rgba(7, 11, 18, 0.85)';
                g.fillText(pp.text, pp.x + 1, pp.y + 1);
                g.fillStyle = pp.color;
                g.fillText(pp.text, pp.x, pp.y);
                g.restore();
            }
        }

        function clear() {
            particles.length = 0;
            rings.length = 0;
            popups.length = 0;
        }

        return { burst, jet, ring, popup, update, render, clear };
    }

    function drawPill(g, x, y, text, color, align) {
        g.save();
        g.font = '600 12px "JetBrains Mono", monospace';
        const padX = 10;
        const w = g.measureText(text).width + padX * 2;
        const h = 24;
        const left = align === 'right' ? x - w : (align === 'center' ? x - w * 0.5 : x);
        g.fillStyle = 'rgba(13, 19, 32, 0.86)';
        g.strokeStyle = color || PAL.border;
        g.lineWidth = 1.2;
        roundRect(g, left, y, w, h, 6);
        g.fill();
        g.stroke();
        g.fillStyle = color || PAL.text;
        g.textAlign = 'left';
        g.textBaseline = 'middle';
        g.fillText(text, left + padX, y + h * 0.5 + 0.5);
        g.restore();
    }

    function roundRect(g, x, y, w, h, r) {
        const rad = Math.min(r, w * 0.5, h * 0.5);
        g.beginPath();
        g.moveTo(x + rad, y);
        g.lineTo(x + w - rad, y);
        g.quadraticCurveTo(x + w, y, x + w, y + rad);
        g.lineTo(x + w, y + h - rad);
        g.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
        g.lineTo(x + rad, y + h);
        g.quadraticCurveTo(x, y + h, x, y + h - rad);
        g.lineTo(x, y + rad);
        g.quadraticCurveTo(x, y, x + rad, y);
        g.closePath();
    }

    function drawBanner(g, title, sub, hint, accent) {
        g.save();
        g.fillStyle = 'rgba(7, 11, 18, 0.62)';
        g.fillRect(0, 0, W, H);
        const bw = 460;
        const bh = 166;
        const bx = (W - bw) * 0.5;
        const by = (H - bh) * 0.5;
        g.fillStyle = 'rgba(15, 23, 42, 0.94)';
        g.strokeStyle = accent || PAL.sky;
        g.lineWidth = 2;
        roundRect(g, bx, by, bw, bh, 14);
        g.fill();
        g.stroke();

        g.textAlign = 'center';
        g.fillStyle = accent || PAL.sky;
        g.font = '700 24px "Space Grotesk", sans-serif';
        g.fillText(title, W * 0.5, by + 48);

        g.fillStyle = PAL.text;
        g.font = '500 14px "Inter", sans-serif';
        g.fillText(sub, W * 0.5, by + 88);

        if (hint) {
            g.fillStyle = PAL.muted;
            g.font = '600 12px "JetBrains Mono", monospace';
            g.fillText(hint, W * 0.5, by + 130);
        }
        g.restore();
    }

    function drawVerticesBody(g, body, fillStyle, strokeStyle, lineWidth) {
        const vs = body.vertices;
        if (!vs || vs.length < 3) return;
        g.beginPath();
        g.moveTo(vs[0].x, vs[0].y);
        for (let i = 1; i < vs.length; i++) g.lineTo(vs[i].x, vs[i].y);
        g.closePath();
        if (fillStyle) {
            g.fillStyle = fillStyle;
            g.fill();
        }
        if (strokeStyle) {
            g.strokeStyle = strokeStyle;
            g.lineWidth = lineWidth || 1.5;
            g.stroke();
        }
    }

    function createInput(canvas, handlers, ctx) {
        const keys = new Set();
        const pointer = { x: W * 0.5, y: H * 0.5, down: false, id: null };

        function isPaused() {
            return !!(ctx && typeof ctx.getPaused === 'function' && ctx.getPaused());
        }

        function toLogical(ev) {
            const rect = canvas.getBoundingClientRect();
            const rw = rect.width || W;
            const rh = rect.height || H;
            const cx = Number.isFinite(ev.clientX) ? ev.clientX : rect.left + rw * 0.5;
            const cy = Number.isFinite(ev.clientY) ? ev.clientY : rect.top + rh * 0.5;
            return {
                x: (cx - rect.left) * (W / rw),
                y: (cy - rect.top) * (H / rh)
            };
        }

        function isTypingTarget(ev) {
            const el = ev && ev.target;
            return !!(el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable));
        }

        function onKeyDown(e) {
            if (isTypingTarget(e) || isPaused()) return;
            const code = e.code || e.key;
            if (code === 'Space' || code === 'ArrowUp' || code === 'ArrowDown' || code === 'ArrowLeft' || code === 'ArrowRight') {
                e.preventDefault();
            }
            const first = !keys.has(code);
            keys.add(code);
            if (handlers && handlers.onKeyDown) handlers.onKeyDown(code, e, first);
        }

        function onKeyUp(e) {
            const code = e.code || e.key;
            keys.delete(code);
            if (handlers && handlers.onKeyUp && !isPaused()) handlers.onKeyUp(code, e);
        }

        function onPointerDown(e) {
            if (isPaused()) return;
            if (e.button !== undefined && e.button !== 0 && e.pointerType === 'mouse') return;
            if (pointer.down && pointer.id !== null && e.pointerId !== undefined && e.pointerId !== pointer.id) return;
            const pt = toLogical(e);
            pointer.x = pt.x;
            pointer.y = pt.y;
            pointer.down = true;
            pointer.id = e.pointerId !== undefined ? e.pointerId : null;
            if (handlers && handlers.onPointerDown) handlers.onPointerDown(pt.x, pt.y, e);
        }

        function onPointerMove(e) {
            if (pointer.down && pointer.id !== null && e.pointerId !== undefined && e.pointerId !== pointer.id) return;
            const pt = toLogical(e);
            pointer.x = pt.x;
            pointer.y = pt.y;
            if (isPaused()) return;
            if (handlers && handlers.onPointerMove) handlers.onPointerMove(pt.x, pt.y, e);
        }

        function onPointerUp(e) {
            if (!pointer.down) return;
            if (pointer.id !== null && e.pointerId !== undefined && e.pointerId !== pointer.id) return;
            const pt = toLogical(e);
            pointer.x = pt.x;
            pointer.y = pt.y;
            pointer.down = false;
            pointer.id = null;
            if (isPaused()) {
                if (handlers && handlers.onPointerCancel) handlers.onPointerCancel();
                return;
            }
            if (handlers && handlers.onPointerUp) handlers.onPointerUp(pt.x, pt.y, e);
        }

        function onPointerCancel(e) {
            if (!pointer.down) return;
            if (pointer.id !== null && e && e.pointerId !== undefined && e.pointerId !== pointer.id) return;
            pointer.down = false;
            pointer.id = null;
            if (handlers && handlers.onPointerCancel) handlers.onPointerCancel();
        }

        function onBlur() {
            keys.clear();
            const wasDown = pointer.down;
            pointer.down = false;
            pointer.id = null;
            if (wasDown && handlers && handlers.onPointerCancel) handlers.onPointerCancel();
        }

        const prevTouchAction = canvas.style.touchAction;
        canvas.style.touchAction = 'none';
        global.addEventListener('keydown', onKeyDown, { passive: false });
        global.addEventListener('keyup', onKeyUp);
        global.addEventListener('blur', onBlur);
        canvas.addEventListener('pointerdown', onPointerDown);
        global.addEventListener('pointermove', onPointerMove);
        global.addEventListener('pointerup', onPointerUp);
        global.addEventListener('pointercancel', onPointerCancel);

        return {
            keys,
            pointer,
            has(code) { return !isPaused() && keys.has(code); },
            any(list) {
                if (isPaused()) return false;
                for (let i = 0; i < list.length; i++) if (keys.has(list[i])) return true;
                return false;
            },
            destroy() {
                canvas.style.touchAction = prevTouchAction;
                global.removeEventListener('keydown', onKeyDown);
                global.removeEventListener('keyup', onKeyUp);
                global.removeEventListener('blur', onBlur);
                canvas.removeEventListener('pointerdown', onPointerDown);
                global.removeEventListener('pointermove', onPointerMove);
                global.removeEventListener('pointerup', onPointerUp);
                global.removeEventListener('pointercancel', onPointerCancel);
                keys.clear();
            }
        };
    }

    function createLoop(ctx, canvas, stepFn, renderFn) {
        const g = canvas.getContext('2d');
        let rafId = 0;
        let destroyed = false;
        let lastMs = 0;
        let accum = 0;
        let simTime = 0;

        function frame(nowMs) {
            if (destroyed) return;
            if (!lastMs) lastMs = nowMs;
            const rawDt = clamp(nowMs - lastMs, 0, 50);
            lastMs = nowMs;

            const paused = !!(ctx && typeof ctx.getPaused === 'function' && ctx.getPaused());
            if (!paused) {
                accum += rawDt;
                let sub = 0;
                while (accum >= FIXED_DT && sub < 3) {
                    stepFn(FIXED_DT, simTime);
                    accum -= FIXED_DT;
                    simTime += FIXED_DT * 0.001;
                    sub++;
                }
            }

            if (g) {
                g.save();
                renderFn(g, simTime, paused);
                g.restore();
            }
            rafId = global.requestAnimationFrame(frame);
        }

        rafId = global.requestAnimationFrame(frame);
        return {
            destroy() {
                destroyed = true;
                if (rafId) global.cancelAnimationFrame(rafId);
            }
        };
    }

    function createMatterEngine(gx, gy, extraOpts) {
        const M = getMatter();
        const opts = Object.assign({
            gravity: { x: gx || 0, y: gy || 0, scale: 0.001 }
        }, extraOpts || {});
        return M.Engine.create(opts);
    }

    function destroyMatterEngine(engine) {
        if (!engine) return;
        const M = getMatter();
        try {
            M.Events.off(engine);
            M.Composite.clear(engine.world, false);
            M.Engine.clear(engine);
        } catch (err) { /* safe cleanup */ }
    }

    function pushHud(ctx, payload) {
        if (ctx && typeof ctx.setHud === 'function') {
            ctx.setHud(payload);
        }
    }

    // =========================================================================
    // GAME 1: orbital-slingshot (Story Ch.4! 10 levels, target: level 3+)
    // =========================================================================
    ENGINES['orbital-slingshot'] = function mountOrbitalSlingshot(ctx) {
        const M = getMatter();
        const canvas = ctx.createCanvas('2d');
        const stars = createStars(401, 95);
        const fx = createFxSystem();

        const LEVELS = [
            {
                name: 'Kepler Gate', fuel: 6,
                station: { x: 95, y: 240 }, portal: { x: 845, y: 310 },
                planets: [{ x: 465, y: 325, r: 46, mass: 12000, color: PAL.sky }],
                asteroids: [{ x: 350, y: 125, r: 28 }, { x: 615, y: 155, r: 30 }],
                coins: [{ x: 345, y: 235 }, { x: 585, y: 270 }]
            },
            {
                name: 'Asteroid Belt Curve', fuel: 6,
                station: { x: 90, y: 365 }, portal: { x: 840, y: 360 },
                planets: [{ x: 470, y: 285, r: 52, mass: 16500, color: PAL.amber }],
                asteroids: [{ x: 470, y: 430, r: 34 }, { x: 470, y: 370, r: 24 }, { x: 285, y: 180, r: 26 }],
                coins: [{ x: 470, y: 145 }, { x: 675, y: 240 }]
            },
            {
                name: 'Binary Dance', fuel: 6,
                station: { x: 90, y: 170 }, portal: { x: 850, y: 375 },
                planets: [
                    { x: 350, y: 295, r: 44, mass: 13500, color: PAL.sky },
                    { x: 625, y: 215, r: 46, mass: 14500, color: PAL.violet }
                ],
                asteroids: [{ x: 490, y: 110, r: 30 }, { x: 495, y: 425, r: 30 }],
                coins: [{ x: 355, y: 165 }, { x: 625, y: 340 }, { x: 490, y: 265 }]
            },
            {
                name: 'Gravity Well Canyon', fuel: 5,
                station: { x: 95, y: 130 }, portal: { x: 845, y: 420 },
                planets: [{ x: 520, y: 270, r: 58, mass: 19500, color: PAL.coral }],
                asteroids: [
                    { x: 310, y: 250, r: 32 }, { x: 310, y: 330, r: 32 }, { x: 310, y: 410, r: 30 },
                    { x: 700, y: 150, r: 34 }
                ],
                coins: [{ x: 515, y: 135 }, { x: 690, y: 345 }]
            },
            {
                name: 'Slingshot Corridor', fuel: 5,
                station: { x: 90, y: 270 }, portal: { x: 855, y: 270 },
                planets: [
                    { x: 410, y: 150, r: 44, mass: 14000, color: PAL.teal },
                    { x: 560, y: 390, r: 44, mass: 14000, color: PAL.sky }
                ],
                asteroids: [
                    { x: 265, y: 270, r: 28 }, { x: 715, y: 270, r: 28 },
                    { x: 485, y: 270, r: 22 }
                ],
                coins: [{ x: 405, y: 250 }, { x: 565, y: 285 }]
            },
            {
                name: 'Trinary Nebula', fuel: 6,
                station: { x: 88, y: 405 }, portal: { x: 855, y: 135 },
                planets: [
                    { x: 315, y: 260, r: 40, mass: 12500, color: PAL.mint },
                    { x: 520, y: 350, r: 45, mass: 14500, color: PAL.amber },
                    { x: 670, y: 185, r: 42, mass: 13500, color: PAL.violet }
                ],
                asteroids: [{ x: 450, y: 150, r: 30 }, { x: 745, y: 340, r: 32 }],
                coins: [{ x: 335, y: 155 }, { x: 545, y: 230 }, { x: 755, y: 190 }]
            },
            {
                name: 'Ricochet Orbit', fuel: 5,
                station: { x: 95, y: 275 }, portal: { x: 845, y: 150 },
                planets: [
                    { x: 485, y: 295, r: 52, mass: 17000, color: PAL.violet },
                    { x: 700, y: 380, r: 36, mass: 10500, color: PAL.sky }
                ],
                asteroids: [
                    { x: 315, y: 155, r: 32 }, { x: 315, y: 220, r: 28 },
                    { x: 635, y: 120, r: 32 }
                ],
                coins: [{ x: 480, y: 155 }, { x: 650, y: 255 }]
            },
            {
                name: 'Singularity Hairpin', fuel: 5,
                station: { x: 105, y: 145 }, portal: { x: 255, y: 425 },
                planets: [
                    { x: 545, y: 270, r: 56, mass: 22500, color: PAL.coral },
                    { x: 255, y: 275, r: 30, mass: 7500, color: PAL.teal }
                ],
                asteroids: [
                    { x: 180, y: 285, r: 28 }, { x: 330, y: 345, r: 26 },
                    { x: 785, y: 270, r: 34 }
                ],
                coins: [{ x: 640, y: 165 }, { x: 645, y: 375 }, { x: 410, y: 420 }]
            },
            {
                name: 'Cluster Gauntlet', fuel: 5,
                station: { x: 85, y: 270 }, portal: { x: 860, y: 270 },
                planets: [
                    { x: 340, y: 165, r: 42, mass: 13500, color: PAL.sky },
                    { x: 515, y: 370, r: 48, mass: 16500, color: PAL.amber },
                    { x: 695, y: 175, r: 40, mass: 13000, color: PAL.mint }
                ],
                asteroids: [
                    { x: 240, y: 290, r: 28 }, { x: 430, y: 250, r: 26 },
                    { x: 615, y: 275, r: 28 }, { x: 765, y: 365, r: 28 }
                ],
                coins: [{ x: 345, y: 295 }, { x: 525, y: 215 }, { x: 745, y: 265 }]
            },
            {
                name: 'Omega Extraction', fuel: 6,
                station: { x: 85, y: 420 }, portal: { x: 845, y: 265 },
                planets: [
                    { x: 290, y: 245, r: 44, mass: 14500, color: PAL.sky },
                    { x: 510, y: 175, r: 48, mass: 17000, color: PAL.violet },
                    { x: 640, y: 380, r: 46, mass: 16000, color: PAL.coral }
                ],
                asteroids: [
                    { x: 400, y: 370, r: 30 }, { x: 750, y: 132, r: 26 },
                    { x: 765, y: 375, r: 26 }, { x: 525, y: 315, r: 24 }
                ],
                coins: [{ x: 285, y: 135 }, { x: 515, y: 270 }, { x: 745, y: 255 }]
            }
        ];

        const GRAV_G = 0.00046;
        const MAX_LAUNCH_SPEED = 11.5;
        const MAX_PULL_PX = 140;

        let engine = null;
        let levelIdx = clamp((Number(ctx.level || ctx.startLevel || 1) || 1) - 1, 0, LEVELS.length - 1);
        let score = 0;
        const scoreCheckpoint = [0];
        let fuelLeft = 6;
        let state = 'aim'; // aim | flight | reset_wait | cleared | victory | gameover
        let stateTimer = 0;
        let flightTime = 0;
        let stallTime = 0;
        let probeBody = null;
        let planetBodies = [];
        let asteroidBodies = [];
        let portalBody = null;
        let coinStates = [];
        let shotCoins = 0;
        let trail = [];
        let dragging = false;
        let dragStart = { x: 0, y: 0 };
        let dragCurr = { x: 0, y: 0 };
        let reportedEnd = false;

        function computeGravityForce(px, py, mass, planets) {
            let fxSum = 0;
            let fySum = 0;
            for (let i = 0; i < planets.length; i++) {
                const p = planets[i];
                const dx = p.x - px;
                const dy = p.y - py;
                const d2 = dx * dx + dy * dy;
                const d = Math.sqrt(d2) || 1;
                const minD2 = p.r * p.r * 1.15;
                const mag = (GRAV_G * mass * p.mass) / Math.max(minD2, d2);
                fxSum += (dx / d) * mag;
                fySum += (dy / d) * mag;
            }
            return { x: fxSum, y: fySum };
        }

        function getLaunchVector() {
            const cfg = LEVELS[levelIdx];
            const dx = dragStart.x - dragCurr.x;
            const dy = dragStart.y - dragCurr.y;
            const pull = Math.hypot(dx, dy);
            if (pull < 12) return null;
            const clamped = Math.min(pull, MAX_PULL_PX);
            const speed = (clamped / MAX_PULL_PX) * MAX_LAUNCH_SPEED;
            return {
                vx: (dx / pull) * speed,
                vy: (dy / pull) * speed,
                power: clamped / MAX_PULL_PX,
                x: cfg.station.x,
                y: cfg.station.y
            };
        }

        function syncHud() {
            const cfg = LEVELS[levelIdx];
            const statusMap = {
                aim: 'DRAG TO SLINGSHOT PROBE',
                flight: 'ORBITING · [SPACE/R] ABORT',
                reset_wait: 'RECHARGING LAUNCH BAY...',
                cleared: 'EXTRACTION COMPLETE!',
                victory: 'ALL 10 SECTORS EXTRACTED!',
                gameover: 'OUT OF PROBE FUEL'
            };
            pushHud(ctx, {
                score,
                level: levelIdx + 1,
                maxLevel: LEVELS.length,
                lives: fuelLeft,
                statusText: statusMap[state] || cfg.name,
                objectiveText: `${cfg.name} · Fuel ${fuelLeft}/${cfg.fuel} · Reach Extraction Portal`
            });
        }

        function spawnProbe() {
            const cfg = LEVELS[levelIdx];
            if (probeBody && engine) {
                M.Composite.remove(engine.world, probeBody);
            }
            probeBody = M.Bodies.circle(cfg.station.x, cfg.station.y, 10, {
                frictionAir: 0,
                friction: 0,
                restitution: 0.82,
                density: 0.001,
                label: 'probe'
            });
            M.Body.setVelocity(probeBody, { x: 0, y: 0 });
            M.Composite.add(engine.world, probeBody);
            trail = [];
            flightTime = 0;
            stallTime = 0;
            shotCoins = 0;
            for (let i = 0; i < coinStates.length; i++) {
                coinStates[i].collected = false;
            }
        }

        function loadLevel(idx, preserveScore) {
            levelIdx = clamp(idx, 0, LEVELS.length - 1);
            if (!preserveScore) {
                score = scoreCheckpoint[levelIdx] || 0;
            } else {
                scoreCheckpoint[levelIdx] = score;
            }
            const cfg = LEVELS[levelIdx];
            fuelLeft = cfg.fuel;
            state = 'aim';
            stateTimer = 0;
            dragging = false;
            reportedEnd = false;
            fx.clear();

            destroyMatterEngine(engine);
            engine = createMatterEngine(0, 0);

            planetBodies = cfg.planets.map((p, i) => {
                const body = M.Bodies.circle(p.x, p.y, p.r, {
                    isStatic: true,
                    restitution: 0.2,
                    label: 'planet'
                });
                body._planet = p;
                body._idx = i;
                return body;
            });

            asteroidBodies = cfg.asteroids.map((a, i) => {
                const body = M.Bodies.circle(a.x, a.y, a.r, {
                    isStatic: true,
                    restitution: 0.84,
                    friction: 0.02,
                    label: 'asteroid'
                });
                body._ast = a;
                body._rot = (i * 1.17) % TAU;
                return body;
            });

            portalBody = M.Bodies.circle(cfg.portal.x, cfg.portal.y, 26, {
                isStatic: true,
                isSensor: true,
                label: 'portal'
            });

            coinStates = cfg.coins.map((c, i) => {
                const body = M.Bodies.circle(c.x, c.y, 13, {
                    isStatic: true,
                    isSensor: true,
                    label: 'coin'
                });
                body._coinIdx = i;
                return { x: c.x, y: c.y, collected: false, body };
            });

            M.Composite.add(engine.world, [
                ...planetBodies,
                ...asteroidBodies,
                portalBody,
                ...coinStates.map(c => c.body)
            ]);

            M.Events.on(engine, 'collisionStart', (ev) => {
                if (state !== 'flight') return;
                for (let i = 0; i < ev.pairs.length; i++) {
                    const pair = ev.pairs[i];
                    const a = pair.bodyA;
                    const b = pair.bodyB;
                    const other = a === probeBody ? b : (b === probeBody ? a : null);
                    if (!other) continue;

                    if (other.label === 'portal') {
                        handlePortalWin();
                        return;
                    }
                    if (other.label === 'coin') {
                        const cs = coinStates[other._coinIdx];
                        if (cs && !cs.collected) {
                            cs.collected = true;
                            shotCoins++;
                            fx.burst(cs.x, cs.y, PAL.amber, 16, 1.5, 4.5, 0.45, 3);
                            fx.popup(cs.x, cs.y - 12, '+250', PAL.amber);
                            playSfx(ctx, 'xpPickup', 0.12);
                        }
                    } else if (other.label === 'asteroid') {
                        fx.burst(probeBody.position.x, probeBody.position.y, PAL.sky, 10, 1.2, 3.8, 0.3, 2.2);
                        fx.ring(probeBody.position.x, probeBody.position.y, PAL.sky, 22, 0.24);
                        playSfx(ctx, 'hitMetal', 0.15);
                    } else if (other.label === 'planet') {
                        failShot('HULL IMPACT');
                        return;
                    }
                }
            });

            spawnProbe();
            syncHud();
        }

        function handlePortalWin() {
            if (state !== 'flight') return;
            const cfg = LEVELS[levelIdx];
            const coinBonus = shotCoins * 250;
            const fuelBonus = fuelLeft * 180;
            score += 500 + coinBonus + fuelBonus;
            scoreCheckpoint[levelIdx + 1] = score;

            fx.burst(cfg.portal.x, cfg.portal.y, PAL.mint, 32, 2, 6, 0.7, 3.4);
            fx.ring(cfg.portal.x, cfg.portal.y, PAL.mint, 70, 0.55);
            fx.popup(cfg.portal.x, cfg.portal.y - 24, `+${500 + coinBonus + fuelBonus}`, PAL.mint);
            playSfx(ctx, 'levelup');

            const allCoins = shotCoins >= coinStates.length;
            const stars = (fuelLeft >= Math.ceil(cfg.fuel * 0.5) && (allCoins || coinStates.length === 0))
                ? 3
                : (fuelLeft >= 2 || shotCoins > 0 ? 2 : 1);

            const hitStory = Boolean(ctx.isStory && levelIdx + 1 >= (ctx.chapterTarget || 2));
            state = (levelIdx >= LEVELS.length - 1 || hitStory) ? 'victory' : 'cleared';
            stateTimer = 0;
            M.Body.setStatic(probeBody, true);
            syncHud();
            if ((state === 'victory' || hitStory) && !reportedEnd) {
                reportedEnd = true;
                ctx.onWin?.({ score, level: levelIdx + 1, stars });
            }
        }

        function failShot(reasonText) {
            if (state !== 'flight') return;
            fx.burst(probeBody.position.x, probeBody.position.y, PAL.coral, 26, 1.5, 5.5, 0.55, 3.2);
            fx.ring(probeBody.position.x, probeBody.position.y, PAL.coral, 46, 0.4);
            fx.popup(probeBody.position.x, clamp(probeBody.position.y, 40, H - 30), reasonText, PAL.coral);
            playSfx(ctx, 'explodeSmall', 0.1);
            M.Body.setStatic(probeBody, true);

            if (fuelLeft <= 0) {
                state = 'gameover';
                stateTimer = 0;
                syncHud();
                if (!reportedEnd) {
                    reportedEnd = true;
                    ctx.onGameOver?.({ score, level: levelIdx + 1, stars: 0, reason: 'Out of fuel launches!' });
                }
            } else {
                state = 'reset_wait';
                stateTimer = 0.55;
                syncHud();
            }
        }

        function fireProbe(vec) {
            if (!vec || state !== 'aim' || fuelLeft <= 0) return;
            fuelLeft--;
            state = 'flight';
            flightTime = 0;
            M.Body.setPosition(probeBody, { x: vec.x, y: vec.y });
            M.Body.setVelocity(probeBody, { x: vec.vx, y: vec.vy });
            fx.burst(vec.x, vec.y, PAL.sky, 14, 1.2, 4, 0.35, 2.5);
            playSfx(ctx, 'shootPlasma', 0.08);
            syncHud();
        }

        function predictTrajectory(vec) {
            const cfg = LEVELS[levelIdx];
            const pts = [];
            let px = vec.x;
            let py = vec.y;
            let vx = vec.vx;
            let vy = vec.vy;
            const mass = probeBody ? probeBody.mass : 0.314159;
            const dt2 = FIXED_DT * FIXED_DT;

            for (let step = 0; step < 120; step++) {
                const f = computeGravityForce(px, py, mass, cfg.planets);
                vx += (f.x / mass) * dt2;
                vy += (f.y / mass) * dt2;
                px += vx;
                py += vy;

                // Reflect off asteroid walls in prediction
                for (let a = 0; a < cfg.asteroids.length; a++) {
                    const ast = cfg.asteroids[a];
                    const dx = px - ast.x;
                    const dy = py - ast.y;
                    const minR = ast.r + 10;
                    const d = Math.hypot(dx, dy);
                    if (d > 0 && d < minR) {
                        const nx = dx / d;
                        const ny = dy / d;
                        px = ast.x + nx * minR;
                        py = ast.y + ny * minR;
                        const dot = vx * nx + vy * ny;
                        if (dot < 0) {
                            vx = (vx - 2 * dot * nx) * 0.84;
                            vy = (vy - 2 * dot * ny) * 0.84;
                        }
                    }
                }

                if (step % 3 === 0) pts.push({ x: px, y: py });

                let stop = px < -20 || px > W + 20 || py < -20 || py > H + 20;
                for (let p = 0; p < cfg.planets.length; p++) {
                    if (dist(px, py, cfg.planets[p].x, cfg.planets[p].y) < cfg.planets[p].r + 9) {
                        stop = true;
                        break;
                    }
                }
                if (dist(px, py, cfg.portal.x, cfg.portal.y) < 26) {
                    pts.push({ x: px, y: py });
                    stop = true;
                }
                if (stop) break;
            }
            return pts;
        }

        const input = createInput(canvas, {
            onKeyDown(code) {
                if ((code === 'Space' || code === 'KeyR') && state === 'flight') {
                    failShot('ABORTED');
                } else if (state === 'cleared' && stateTimer > 0.55 && (code === 'Space' || code === 'Enter')) {
                    loadLevel(levelIdx + 1, true);
                } else if (state === 'victory' && stateTimer > 0.6 && (code === 'Space' || code === 'Enter')) {
                    score = 0;
                    loadLevel(0, false);
                } else if (state === 'gameover' && stateTimer > 0.6 && (code === 'Space' || code === 'Enter' || code === 'KeyR')) {
                    loadLevel(levelIdx, false);
                } else if (code === 'KeyR' && state === 'aim') {
                    loadLevel(levelIdx, false);
                }
            },
            onPointerDown(x, y) {
                if (state === 'cleared' && stateTimer > 0.55) {
                    loadLevel(levelIdx + 1, true);
                    return;
                }
                if (state === 'victory' && stateTimer > 0.6) {
                    score = 0;
                    loadLevel(0, false);
                    return;
                }
                if (state === 'gameover' && stateTimer > 0.6) {
                    loadLevel(levelIdx, false);
                    return;
                }
                if (state === 'flight') {
                    failShot('ABORTED');
                    return;
                }
                if (state === 'aim') {
                    dragging = true;
                    dragStart = { x, y };
                    dragCurr = { x, y };
                }
            },
            onPointerMove(x, y) {
                if (dragging) {
                    dragCurr = { x, y };
                }
            },
            onPointerUp(x, y) {
                if (!dragging) return;
                dragCurr = { x, y };
                dragging = false;
                const vec = getLaunchVector();
                if (vec) fireProbe(vec);
            },
            onPointerCancel() {
                dragging = false;
            }
        }, ctx);

        loadLevel(levelIdx, false);

        const loop = createLoop(ctx, canvas, (dtMs) => {
            const dtSec = dtMs * 0.001;
            fx.update(dtSec);

            if (state === 'cleared' || state === 'victory' || state === 'gameover') {
                stateTimer += dtSec;
                return;
            }
            if (state === 'reset_wait') {
                stateTimer -= dtSec;
                if (stateTimer <= 0) {
                    state = 'aim';
                    spawnProbe();
                    syncHud();
                }
                return;
            }

            if (state === 'flight') {
                const cfg = LEVELS[levelIdx];
                flightTime += dtSec;
                const f = computeGravityForce(
                    probeBody.position.x,
                    probeBody.position.y,
                    probeBody.mass,
                    cfg.planets
                );
                M.Body.applyForce(probeBody, probeBody.position, f);
                M.Engine.update(engine, dtMs);

                trail.push({ x: probeBody.position.x, y: probeBody.position.y });
                if (trail.length > 75) trail.shift();

                // Thruster flame sparks on launch & velocity exhaust
                const pSpd = Math.hypot(probeBody.velocity.x, probeBody.velocity.y);
                if (pSpd > 0.25 && (flightTime < 0.35 || Math.random() < 0.45)) {
                    const ux = -probeBody.velocity.x / pSpd;
                    const uy = -probeBody.velocity.y / pSpd;
                    fx.jet(
                        probeBody.position.x + ux * 11,
                        probeBody.position.y + uy * 11,
                        ux, uy,
                        0.4,
                        flightTime < 0.35 ? PAL.amber : PAL.sky,
                        flightTime < 0.35 ? 3.2 : 2.1,
                        0.2,
                        2.5
                    );
                }

                if (dist(probeBody.position.x, probeBody.position.y, cfg.portal.x, cfg.portal.y) < 28) {
                    handlePortalWin();
                    return;
                }

                const p = probeBody.position;
                if (pSpd < 0.28) stallTime += dtSec;
                else stallTime = Math.max(0, stallTime - dtSec * 2);

                if (p.x < -55 || p.x > W + 55 || p.y < -55 || p.y > H + 55) {
                    failShot('LOST IN DEEP SPACE');
                } else if (stallTime > 1.8) {
                    failShot('STALLED IN ORBIT');
                } else if (flightTime > 9.5) {
                    failShot('ORBIT TIMEOUT');
                }
            }
        }, (g, simTime) => {
            const cfg = LEVELS[levelIdx];
            drawSpaceBackdrop(g, stars, simTime, 'rgba(56, 189, 248, 0.11)', 60);

            // Planet gravity wells & spheres
            for (let i = 0; i < cfg.planets.length; i++) {
                const p = cfg.planets[i];
                for (let r = 1; r <= 3; r++) {
                    g.strokeStyle = p.color;
                    g.globalAlpha = 0.16 - r * 0.035;
                    g.setLineDash([5, 7]);
                    g.lineWidth = 1.2;
                    g.beginPath();
                    g.arc(p.x, p.y, p.r + r * 36 + Math.sin(simTime * 2 + r) * 3, 0, TAU);
                    g.stroke();
                }
                g.setLineDash([]);
                g.globalAlpha = 1;

                const pGrad = g.createRadialGradient(p.x - p.r * 0.3, p.y - p.r * 0.3, 4, p.x, p.y, p.r);
                pGrad.addColorStop(0, '#f8fafc');
                pGrad.addColorStop(0.28, p.color);
                pGrad.addColorStop(1, '#0b1220');
                g.fillStyle = pGrad;
                g.beginPath();
                g.arc(p.x, p.y, p.r, 0, TAU);
                g.fill();

                g.strokeStyle = p.color;
                g.lineWidth = 2;
                g.beginPath();
                g.arc(p.x, p.y, p.r + 1.5, 0, TAU);
                g.stroke();
            }

            // Asteroid walls
            for (let i = 0; i < asteroidBodies.length; i++) {
                const b = asteroidBodies[i];
                const r = b._ast.r;
                if (!drawSprite(g, ctx, 'asteroid', b.position.x, b.position.y, r * 2.15, r * 2.15, b._rot + simTime * 0.15)) {
                    g.fillStyle = '#334155';
                    g.strokeStyle = '#94a3b8';
                    g.lineWidth = 2;
                    g.beginPath();
                    g.arc(b.position.x, b.position.y, r, 0, TAU);
                    g.fill();
                    g.stroke();
                }
                g.strokeStyle = 'rgba(56, 189, 248, 0.25)';
                g.lineWidth = 1.2;
                g.beginPath();
                g.arc(b.position.x, b.position.y, r + 2, 0, TAU);
                g.stroke();
            }

            // Bonus Star Coins
            for (let i = 0; i < coinStates.length; i++) {
                const c = coinStates[i];
                if (c.collected) continue;
                const bob = Math.sin(simTime * 4 + i) * 3;
                if (!drawSprite(g, ctx, 'coin_star', c.x, c.y + bob, 26, 26, simTime * 1.4)) {
                    g.fillStyle = PAL.amber;
                    g.beginPath();
                    g.arc(c.x, c.y + bob, 9, 0, TAU);
                    g.fill();
                }
            }

            // Extraction Portal
            const px = cfg.portal.x;
            const py = cfg.portal.y;
            g.save();
            const vGrad = g.createRadialGradient(px, py, 4, px, py, 38);
            vGrad.addColorStop(0, 'rgba(52, 211, 153, 0.65)');
            vGrad.addColorStop(1, 'rgba(52, 211, 153, 0)');
            g.fillStyle = vGrad;
            g.beginPath();
            g.arc(px, py, 38, 0, TAU);
            g.fill();
            if (!drawSprite(g, ctx, 'portal_vortex', px, py, 60, 60, -simTime * 2.4)) {
                g.strokeStyle = PAL.mint;
                g.lineWidth = 3;
                g.beginPath();
                g.arc(px, py, 24, 0, TAU);
                g.stroke();
            }
            g.restore();

            // Launch station cradle
            const sx = cfg.station.x;
            const sy = cfg.station.y;
            drawSprite(g, ctx, 'warp_ring', sx, sy, 46, 46, simTime * 0.9, 0.65);
            g.strokeStyle = PAL.sky;
            g.lineWidth = 1.5;
            g.beginPath();
            g.arc(sx, sy, 22, 0, TAU);
            g.stroke();

            // Slingshot trajectory prediction
            if (dragging && state === 'aim') {
                const vec = getLaunchVector();
                if (vec) {
                    const pts = predictTrajectory(vec);
                    for (let i = 0; i < pts.length; i++) {
                        const a = 1 - i / (pts.length + 2);
                        g.globalAlpha = a * 0.9;
                        g.fillStyle = PAL.mint;
                        g.beginPath();
                        g.arc(pts[i].x, pts[i].y, 2.4 * (0.5 + 0.5 * a), 0, TAU);
                        g.fill();
                    }
                    g.globalAlpha = 1;

                    // Pullback slingshot indicator
                    g.strokeStyle = PAL.amber;
                    g.lineWidth = 2;
                    g.beginPath();
                    g.moveTo(sx, sy);
                    g.lineTo(sx - vec.vx * 8, sy - vec.vy * 8);
                    g.stroke();
                    drawPill(g, sx, sy - 42, `THRUST ${Math.round(vec.power * 100)}%`, PAL.mint, 'center');
                }
            }

            // Probe flight trail
            if (trail.length > 1) {
                for (let i = 1; i < trail.length; i++) {
                    g.strokeStyle = PAL.sky;
                    g.globalAlpha = (i / trail.length) * 0.7;
                    g.lineWidth = 2.6;
                    g.beginPath();
                    g.moveTo(trail[i - 1].x, trail[i - 1].y);
                    g.lineTo(trail[i].x, trail[i].y);
                    g.stroke();
                }
                g.globalAlpha = 1;
            }

            // Probe
            if (probeBody && state !== 'reset_wait') {
                const bx = probeBody.position.x;
                const by = probeBody.position.y;
                const ang = state === 'flight'
                    ? Math.atan2(probeBody.velocity.y, probeBody.velocity.x) + Math.PI * 0.5
                    : (dragging && getLaunchVector() ? Math.atan2(getLaunchVector().vy, getLaunchVector().vx) + Math.PI * 0.5 : Math.PI * 0.5);
                if (!drawSprite(g, ctx, 'fighter', bx, by, 26, 26, ang)) {
                    g.save();
                    g.translate(bx, by);
                    g.rotate(ang);
                    g.fillStyle = PAL.sky;
                    g.beginPath();
                    g.moveTo(0, -11);
                    g.lineTo(8, 9);
                    g.lineTo(-8, 9);
                    g.closePath();
                    g.fill();
                    g.restore();
                }
            }

            fx.render(g);

            // Top micro HUD pills
            drawPill(g, 16, 14, `SECTOR ${levelIdx + 1}/${LEVELS.length}: ${cfg.name.toUpperCase()}`, PAL.sky, 'left');
            drawPill(g, W - 16, 14, `FUEL ${fuelLeft}/${cfg.fuel}  ·  SCORE ${score}`, fuelLeft <= 1 ? PAL.coral : PAL.mint, 'right');

            if (state === 'aim') {
                drawPill(g, W * 0.5, H - 36, 'DRAG BACK TO AIM GRAVITY SLINGSHOT · RELEASE TO LAUNCH', PAL.muted, 'center');
            } else if (state === 'flight') {
                drawPill(g, W * 0.5, H - 36, 'CLICK OR [SPACE / R] TO ABORT SHOT', PAL.amber, 'center');
            }

            if (state === 'cleared') {
                drawBanner(g, `SECTOR ${levelIdx + 1} EXTRACTED!`, `Score: ${score} · Remaining Fuel Bonus: +${fuelLeft * 180}`, 'CLICK OR PRESS [SPACE] FOR NEXT SECTOR', PAL.mint);
            } else if (state === 'victory') {
                drawBanner(g, 'ORBITAL CAMPAIGN COMPLETE!', `Final Score: ${score} across all 10 sectors`, 'CLICK OR PRESS [SPACE] TO PLAY AGAIN', PAL.amber);
            } else if (state === 'gameover') {
                drawBanner(g, 'PROBE FUEL DEPLETED', `Sector ${levelIdx + 1}: ${cfg.name} · Score: ${score}`, 'CLICK OR PRESS [SPACE] TO RETRY SECTOR', PAL.coral);
            }
        });

        return {
            restart(level) {
                if (level !== undefined && level !== null) {
                    const target = clamp(Math.floor(Number(level) || 1) - 1, 0, LEVELS.length - 1);
                    const advancing = state === 'cleared' && target === levelIdx + 1;
                    loadLevel(target, advancing);
                } else {
                    score = 0;
                    loadLevel(0, false);
                }
            },
            destroy() {
                loop.destroy();
                input.destroy();
                destroyMatterEngine(engine);
            }
        };
    };

    // =========================================================================
    // GAME 2: moon-lander-apollo (5 progressive moon sectors)
    // =========================================================================
    ENGINES['moon-lander-apollo'] = function mountMoonLander(ctx) {
        const M = getMatter();
        const canvas = ctx.createCanvas('2d');
        const stars = createStars(502, 100);
        const fx = createFxSystem();

        const SECTORS = [
            { name: 'Tranquility Basin', gravity: 0.16, wind: 0.0, padWidth: 136, padX: 620, ridgeAmp: 58, fuel: 100 },
            { name: 'Tycho Crater Rim', gravity: 0.185, wind: 0.00018, padWidth: 112, padX: 700, ridgeAmp: 78, fuel: 100 },
            { name: 'Mare Serenitatis', gravity: 0.21, wind: -0.00026, padWidth: 94, padX: 290, ridgeAmp: 95, fuel: 100 },
            { name: 'Aristarchus Spire', gravity: 0.235, wind: 0.00034, padWidth: 78, padX: 745, ridgeAmp: 112, fuel: 95 },
            { name: 'Mons Huygens Drop', gravity: 0.26, wind: -0.00042, padWidth: 66, padX: 520, ridgeAmp: 124, fuel: 90 }
        ];

        let engine = null;
        let levelIdx = clamp((Number(ctx.level || ctx.startLevel || 1) || 1) - 1, 0, SECTORS.length - 1);
        let score = 0;
        const scoreCheckpoint = [0];
        let lives = 3;
        let fuel = 100;
        let maxFuel = 100;
        let lander = null;
        let padBody = null;
        let terrainBodies = [];
        let terrainPts = [];
        let bonusCell = null;
        let padBounds = { x: 600, y: 460, w: 120 };
        let preSpeed = 0;
        let preAngle = 0;
        let settleTime = 0;
        let touchingPad = false;
        let state = 'flying'; // flying | respawn_wait | cleared | victory | gameover
        let stateTimer = 0;
        let reportedEnd = false;

        function buildTerrain(cfg) {
            const rand = createRng(9100 + levelIdx * 73);
            const pts = [];
            const cols = 16;
            const stepW = W / cols;
            const padLeft = cfg.padX - cfg.padWidth * 0.5;
            const padRight = cfg.padX + cfg.padWidth * 0.5;
            const padY = 425 + Math.round((rand() - 0.5) * 45);
            padBounds = { x: cfg.padX, y: padY, w: cfg.padWidth };

            // Build profile points snapped around the flat landing pad
            const rawX = [];
            for (let i = 0; i <= cols; i++) rawX.push(Math.round(i * stepW));
            const filtered = rawX.filter(x => x < padLeft - 14 || x > padRight + 14);
            filtered.push(Math.round(padLeft), Math.round(padRight));
            filtered.sort((a, b) => a - b);

            for (let i = 0; i < filtered.length; i++) {
                const x = filtered[i];
                let y;
                if (x >= padLeft - 1 && x <= padRight + 1) {
                    y = padY;
                } else {
                    const edgeBoost = (x < 90 || x > W - 90) ? 20 : 0;
                    const valley = 445 - rand() * cfg.ridgeAmp - edgeBoost;
                    y = clamp(valley, 260, 495);
                }
                pts.push({ x, y });
            }
            terrainPts = pts;

            const bodies = [];
            for (let i = 0; i < pts.length - 1; i++) {
                const p0 = pts[i];
                const p1 = pts[i + 1];
                if (Math.abs(p0.x - padLeft) < 2 && Math.abs(p1.x - padRight) < 2) {
                    padBody = M.Bodies.rectangle(cfg.padX, padY + 8, cfg.padWidth, 16, {
                        isStatic: true,
                        friction: 0.96,
                        restitution: 0.02,
                        label: 'pad'
                    });
                    bodies.push(padBody);
                } else {
                    const verts = [
                        { x: p0.x, y: p0.y },
                        { x: p1.x, y: p1.y },
                        { x: p1.x, y: H + 40 },
                        { x: p0.x, y: H + 40 }
                    ];
                    const c = M.Vertices.centre(verts);
                    bodies.push(M.Bodies.fromVertices(c.x, c.y, verts, {
                        isStatic: true,
                        friction: 0.85,
                        restitution: 0.1,
                        label: 'terrain'
                    }));
                }
            }
            return bodies;
        }

        function spawnLander() {
            const cfg = SECTORS[levelIdx];
            if (lander && engine) M.Composite.remove(engine.world, lander);
            const startX = cfg.padX > W * 0.5 ? 165 : W - 165;
            lander = M.Bodies.rectangle(startX, 82, 32, 34, {
                frictionAir: 0.012,
                friction: 0.92,
                restitution: 0.04,
                density: 0.002,
                label: 'lander'
            });
            M.Body.setVelocity(lander, { x: cfg.padX > W * 0.5 ? 1.1 : -1.1, y: 0.2 });
            M.Composite.add(engine.world, lander);
            fuel = cfg.fuel;
            maxFuel = cfg.fuel;
            settleTime = 0;
            touchingPad = false;
        }

        function syncHud() {
            const cfg = SECTORS[levelIdx];
            const spd = lander ? Math.hypot(lander.velocity.x, lander.velocity.y) : 0;
            const statusMap = {
                flying: `SPD ${spd.toFixed(1)} · FUEL ${Math.max(0, Math.round(fuel))}%`,
                respawn_wait: 'MODULE LOST · DEPLOYING BACKUP...',
                cleared: 'EAGLE HAS LANDED!',
                victory: 'ALL MOON SECTORS LANDED!',
                gameover: 'ALL LANDERS LOST'
            };
            pushHud(ctx, {
                score,
                level: levelIdx + 1,
                maxLevel: SECTORS.length,
                lives,
                statusText: statusMap[state] || cfg.name,
                objectiveText: `${cfg.name} · Land upright (spd < 2.2, |ang| < 0.28) on Cyan Pad`
            });
        }

        function loadLevel(idx, preserveScore, keepLives) {
            levelIdx = clamp(idx, 0, SECTORS.length - 1);
            if (!preserveScore) {
                score = scoreCheckpoint[levelIdx] || 0;
            } else {
                scoreCheckpoint[levelIdx] = score;
            }
            if (!keepLives) lives = 3;
            const cfg = SECTORS[levelIdx];
            state = 'flying';
            stateTimer = 0;
            reportedEnd = false;
            fx.clear();

            destroyMatterEngine(engine);
            engine = createMatterEngine(0, cfg.gravity);
            terrainBodies = buildTerrain(cfg);

            // Optional floating fuel cell pickup
            const cellX = W * 0.5;
            const cellY = 185 + levelIdx * 12;
            const cellBody = M.Bodies.circle(cellX, cellY, 14, {
                isStatic: true,
                isSensor: true,
                label: 'fuelcell'
            });
            bonusCell = { x: cellX, y: cellY, collected: false, body: cellBody };

            M.Composite.add(engine.world, [...terrainBodies, cellBody]);

            M.Events.on(engine, 'collisionStart', (ev) => {
                if (state !== 'flying') return;
                for (let i = 0; i < ev.pairs.length; i++) {
                    const pair = ev.pairs[i];
                    const other = pair.bodyA === lander ? pair.bodyB : (pair.bodyB === lander ? pair.bodyA : null);
                    if (!other) continue;

                    if (other.label === 'fuelcell') {
                        if (!bonusCell.collected) {
                            bonusCell.collected = true;
                            fuel = Math.min(maxFuel, fuel + 25);
                            score += 200;
                            fx.burst(bonusCell.x, bonusCell.y, PAL.mint, 16, 1.5, 4, 0.45, 3);
                            fx.popup(bonusCell.x, bonusCell.y - 12, '+25 FUEL +200', PAL.mint);
                            playSfx(ctx, 'powerup');
                        }
                        continue;
                    }

                    if (other.label === 'terrain') {
                        crashLander('TERRAIN IMPACT');
                        return;
                    }

                    if (other.label === 'pad') {
                        const onPadX = Math.abs(lander.position.x - padBounds.x) <= padBounds.w * 0.5 - 3;
                        const safeVy = Math.abs(lander.velocity.y) < 2.15;
                        const safeVx = Math.abs(lander.velocity.x) < 1.55;
                        const safeAng = Math.abs(preAngle) < 0.32;
                        if (!onPadX || !safeVy || !safeVx || !safeAng) {
                            const reason = !safeVy ? 'HARD VERTICAL IMPACT' : (!safeVx ? 'HIGH LATERAL SLIDE' : (!safeAng ? 'TILT CRASH' : 'MISSED PAD'));
                            crashLander(reason);
                            return;
                        }
                        touchingPad = true;
                        playSfx(ctx, 'hitMetal', 0.1);
                    }
                }
            });

            M.Events.on(engine, 'collisionActive', (ev) => {
                if (state !== 'flying') return;
                for (let i = 0; i < ev.pairs.length; i++) {
                    const pair = ev.pairs[i];
                    const other = pair.bodyA === lander ? pair.bodyB : (pair.bodyB === lander ? pair.bodyA : null);
                    if (other && other.label === 'pad') {
                        touchingPad = true;
                    }
                }
            });

            spawnLander();
            syncHud();
        }

        function crashLander(reason) {
            if (state !== 'flying') return;
            const lx = lander.position.x;
            const ly = lander.position.y;
            fx.burst(lx, ly, PAL.coral, 36, 1.8, 6.8, 0.7, 3.8);
            fx.burst(lx, ly, PAL.amber, 22, 1.2, 4.5, 0.55, 2.8);
            fx.ring(lx, ly, PAL.coral, 65, 0.5);
            fx.popup(lx, clamp(ly - 20, 40, H - 30), reason, PAL.coral);
            playSfx(ctx, 'explodeBoss');

            lives--;
            M.Body.setStatic(lander, true);
            if (lives <= 0) {
                state = 'gameover';
                stateTimer = 0;
                syncHud();
                if (!reportedEnd) {
                    reportedEnd = true;
                    ctx.onGameOver?.({ score, level: levelIdx + 1, stars: 0, reason: reason || 'Moon lander destroyed!' });
                }
            } else {
                state = 'respawn_wait';
                stateTimer = 0.9;
                syncHud();
            }
        }

        function completeSector() {
            if (state !== 'flying') return;
            const fuelBonus = Math.round(fuel * 8);
            const sectorBonus = 400 + levelIdx * 150;
            score += sectorBonus + fuelBonus;
            scoreCheckpoint[levelIdx + 1] = score;

            const stars = fuel >= 45 ? 3 : (fuel >= 20 ? 2 : 1);
            fx.burst(lander.position.x, lander.position.y, PAL.mint, 28, 1.5, 5.2, 0.65, 3);
            fx.ring(lander.position.x, lander.position.y, PAL.mint, 58, 0.5);
            fx.popup(lander.position.x, lander.position.y - 34, `SAFE LANDING +${sectorBonus + fuelBonus}`, PAL.mint);
            playSfx(ctx, 'levelup');

            M.Body.setStatic(lander, true);
            const hitStory = Boolean(ctx.isStory && levelIdx + 1 >= (ctx.chapterTarget || 2));
            state = (levelIdx >= SECTORS.length - 1 || hitStory) ? 'victory' : 'cleared';
            stateTimer = 0;
            syncHud();
            if ((state === 'victory' || hitStory) && !reportedEnd) {
                reportedEnd = true;
                ctx.onWin?.({ score, level: levelIdx + 1, stars });
            }
        }

        const input = createInput(canvas, {
            onKeyDown(code) {
                if (state === 'cleared' && stateTimer > 0.55 && (code === 'Space' || code === 'Enter')) {
                    loadLevel(levelIdx + 1, true, true);
                } else if (state === 'victory' && stateTimer > 0.6 && (code === 'Space' || code === 'Enter')) {
                    score = 0;
                    loadLevel(0, false, false);
                } else if (state === 'gameover' && stateTimer > 0.6 && (code === 'Space' || code === 'Enter' || code === 'KeyR')) {
                    loadLevel(levelIdx, false, false);
                } else if (code === 'KeyR' && state === 'flying') {
                    loadLevel(levelIdx, false, true);
                }
            },
            onPointerDown() {
                if (state === 'cleared' && stateTimer > 0.55) {
                    loadLevel(levelIdx + 1, true, true);
                } else if (state === 'victory' && stateTimer > 0.6) {
                    score = 0;
                    loadLevel(0, false, false);
                } else if (state === 'gameover' && stateTimer > 0.6) {
                    loadLevel(levelIdx, false, false);
                }
            }
        }, ctx);

        loadLevel(levelIdx, false, false);
        let hudTimer = 0;
        let thrustSfxCd = 0;

        const loop = createLoop(ctx, canvas, (dtMs) => {
            const dtSec = dtMs * 0.001;
            fx.update(dtSec);
            if (thrustSfxCd > 0) thrustSfxCd = Math.max(0, thrustSfxCd - dtSec);

            if (state === 'cleared' || state === 'victory' || state === 'gameover') {
                stateTimer += dtSec;
                return;
            }
            if (state === 'respawn_wait') {
                stateTimer -= dtSec;
                if (stateTimer <= 0) {
                    state = 'flying';
                    spawnLander();
                    syncHud();
                }
                return;
            }

            const cfg = SECTORS[levelIdx];
            const thrustOn = fuel > 0 && input.any(['ArrowUp', 'KeyW']);
            const rotLeft = fuel > 0 && input.any(['ArrowLeft', 'KeyA']);
            const rotRight = fuel > 0 && input.any(['ArrowRight', 'KeyD']);

            if (thrustOn) {
                const fxDir = Math.sin(lander.angle);
                const fyDir = -Math.cos(lander.angle);
                const mag = 0.00052 * lander.mass * (1 + cfg.gravity * 0.9);
                M.Body.applyForce(lander, lander.position, { x: fxDir * mag, y: fyDir * mag });
                fuel = Math.max(0, fuel - 14.5 * dtSec);
                const nozzleX = lander.position.x - fxDir * 17;
                const nozzleY = lander.position.y - fyDir * 17;
                fx.jet(nozzleX, nozzleY, -fxDir, -fyDir, 0.45, PAL.amber, 3.6, 0.24, 3.4);
                if (thrustSfxCd <= 0) {
                    thrustSfxCd = 0.18;
                    playSfx(ctx, 'dash', 0.12);
                }
            }

            if (rotLeft) {
                M.Body.setAngularVelocity(lander, clamp(lander.angularVelocity - 0.0042, -0.075, 0.075));
                fuel = Math.max(0, fuel - 1.8 * dtSec);
                fx.jet(lander.position.x + 14, lander.position.y - 10, 1, 0, 0.3, PAL.sky, 2.2, 0.14, 1.8);
            } else if (rotRight) {
                M.Body.setAngularVelocity(lander, clamp(lander.angularVelocity + 0.0042, -0.075, 0.075));
                fuel = Math.max(0, fuel - 1.8 * dtSec);
                fx.jet(lander.position.x - 14, lander.position.y - 10, -1, 0, 0.3, PAL.sky, 2.2, 0.14, 1.8);
            } else {
                // Gentle RCS SAS angular damping
                M.Body.setAngularVelocity(lander, lander.angularVelocity * 0.95);
            }

            if (cfg.wind !== 0 && !touchingPad) {
                M.Body.applyForce(lander, lander.position, { x: cfg.wind * lander.mass, y: 0 });
            }

            preSpeed = Math.hypot(lander.velocity.x, lander.velocity.y);
            preAngle = normalizeAngle(lander.angle);
            const wasTouchingPad = touchingPad;
            touchingPad = false;

            M.Engine.update(engine, dtMs);
            if (wasTouchingPad && Math.abs(normalizeAngle(lander.angle)) < 0.32 && !thrustOn) {
                // Gentle landing-strut grip prevents tiny wind/corner creep after clean touchdown
                M.Body.setVelocity(lander, { x: lander.velocity.x * 0.85, y: lander.velocity.y * 0.85 });
            }

            const curSpeed = Math.hypot(lander.velocity.x, lander.velocity.y);
            const curAngle = Math.abs(normalizeAngle(lander.angle));
            const onPadX = Math.abs(lander.position.x - padBounds.x) <= padBounds.w * 0.5 - 3;

            if (touchingPad && onPadX && Math.abs(lander.velocity.y) < 0.55 && Math.abs(lander.velocity.x) < 0.55 && curAngle < 0.32) {
                settleTime += dtSec;
                if (settleTime >= 0.22) {
                    completeSector();
                    return;
                }
            } else {
                settleTime = Math.max(0, settleTime - dtSec * 2);
            }

            if (lander.position.x < -35 || lander.position.x > W + 35 || lander.position.y < -80 || lander.position.y > H + 30) {
                crashLander('DRIFTED OFF RADAR');
                return;
            }

            hudTimer += dtSec;
            if (hudTimer >= 0.16) {
                hudTimer = 0;
                syncHud();
            }
        }, (g, simTime) => {
            const cfg = SECTORS[levelIdx];
            drawSpaceBackdrop(g, stars, simTime, 'rgba(56, 189, 248, 0.09)', 0);

            // Terrain polygon fill
            if (terrainPts.length > 1) {
                g.beginPath();
                g.moveTo(0, H);
                for (let i = 0; i < terrainPts.length; i++) {
                    g.lineTo(terrainPts[i].x, terrainPts[i].y);
                }
                g.lineTo(W, H);
                g.closePath();
                const tGrad = g.createLinearGradient(0, 300, 0, H);
                tGrad.addColorStop(0, '#1e293b');
                tGrad.addColorStop(1, '#090d16');
                g.fillStyle = tGrad;
                g.fill();
                g.strokeStyle = '#475569';
                g.lineWidth = 2;
                g.stroke();
            }

            // Illuminated Cyan Landing Pad
            const pl = padBounds.x - padBounds.w * 0.5;
            const pr = padBounds.x + padBounds.w * 0.5;
            const py = padBounds.y;
            const beam = g.createLinearGradient(0, py - 95, 0, py);
            beam.addColorStop(0, 'rgba(56, 189, 248, 0)');
            beam.addColorStop(1, 'rgba(56, 189, 248, 0.22)');
            g.fillStyle = beam;
            g.fillRect(pl + 4, py - 95, padBounds.w - 8, 95);

            g.fillStyle = '#0f172a';
            g.strokeStyle = PAL.sky;
            g.lineWidth = 2.5;
            g.fillRect(pl, py - 3, padBounds.w, 10);
            g.strokeRect(pl, py - 3, padBounds.w, 10);

            // Blinking beacon pylons
            const blink = 0.5 + 0.5 * Math.sin(simTime * 7);
            g.fillStyle = `rgba(52, 211, 153, ${0.4 + 0.6 * blink})`;
            g.beginPath();
            g.arc(pl + 4, py - 6, 3.5, 0, TAU);
            g.arc(pr - 4, py - 6, 3.5, 0, TAU);
            g.fill();

            // Bonus fuel cell
            if (bonusCell && !bonusCell.collected) {
                const by = bonusCell.y + Math.sin(simTime * 3.5) * 4;
                if (!drawSprite(g, ctx, 'shield_battery', bonusCell.x, by, 26, 26, 0)) {
                    g.fillStyle = PAL.mint;
                    g.fillRect(bonusCell.x - 8, by - 10, 16, 20);
                }
            }

            // Lunar Module + alignment plumb line + thruster glow
            if (lander && state !== 'respawn_wait') {
                const onPadZone = Math.abs(lander.position.x - padBounds.x) <= padBounds.w * 0.5 - 3;
                if (lander.position.y < padBounds.y - 18) {
                    g.save();
                    g.strokeStyle = onPadZone ? 'rgba(52, 211, 153, 0.42)' : 'rgba(56, 189, 248, 0.2)';
                    g.setLineDash([4, 5]);
                    g.lineWidth = 1.5;
                    g.beginPath();
                    g.moveTo(lander.position.x, lander.position.y + 18);
                    g.lineTo(lander.position.x, padBounds.y - 4);
                    g.stroke();
                    g.restore();
                }
                g.save();
                g.translate(lander.position.x, lander.position.y);
                g.rotate(lander.angle);
                if (fuel > 0 && input.any(['ArrowUp', 'KeyW']) && state === 'flying') {
                    const flameH = 14 + Math.sin(simTime * 55) * 4;
                    const fGrad = g.createLinearGradient(0, 14, 0, 14 + flameH);
                    fGrad.addColorStop(0, '#ffffff');
                    fGrad.addColorStop(0.45, PAL.amber);
                    fGrad.addColorStop(1, 'rgba(251, 113, 133, 0)');
                    g.fillStyle = fGrad;
                    g.beginPath();
                    g.moveTo(-6, 14);
                    g.lineTo(6, 14);
                    g.lineTo(0, 14 + flameH);
                    g.closePath();
                    g.fill();
                }
                if (!drawSprite(g, ctx, 'moon_lander', 0, 0, 40, 40, 0)) {
                    g.fillStyle = '#cbd5e1';
                    g.strokeStyle = PAL.sky;
                    g.lineWidth = 2;
                    g.beginPath();
                    g.moveTo(0, -16);
                    g.lineTo(13, 6);
                    g.lineTo(-13, 6);
                    g.closePath();
                    g.fill();
                    g.stroke();
                    g.beginPath();
                    g.moveTo(-10, 6);
                    g.lineTo(-16, 17);
                    g.moveTo(10, 6);
                    g.lineTo(16, 17);
                    g.stroke();
                }
                g.restore();
            }

            fx.render(g);

            // Telemetry HUD inside canvas (Readable green/red V-SPD, H-SPD & TILT gauges)
            const vxAbs = lander ? Math.abs(lander.velocity.x) : 0;
            const vyAbs = lander ? Math.abs(lander.velocity.y) : 0;
            const angAbs = lander ? Math.abs(normalizeAngle(lander.angle)) : 0;
            const vSafe = vyAbs < 2.15;
            const hSafe = vxAbs < 1.55;
            const angSafe = angAbs < 0.32;

            drawPill(g, 16, 14, `SECTOR ${levelIdx + 1}/${SECTORS.length}: ${cfg.name.toUpperCase()}`, PAL.sky, 'left');
            drawPill(g, 16, 44, `V-SPD ${vyAbs.toFixed(2)} (<2.15)`, vSafe ? PAL.mint : PAL.coral, 'left');
            drawPill(g, 16, 74, `H-SPD ${vxAbs.toFixed(2)} (<1.55)`, hSafe ? PAL.mint : PAL.coral, 'left');
            drawPill(g, 16, 104, `TILT ${angAbs.toFixed(2)} (<0.32)`, angSafe ? PAL.mint : PAL.amber, 'left');

            const windLabel = cfg.wind === 0 ? 'WIND 0.0' : (cfg.wind > 0 ? `WIND +${(cfg.wind * 1000).toFixed(2)} →` : `← WIND ${(cfg.wind * 1000).toFixed(2)}`);
            drawPill(g, W - 16, 14, `${windLabel}  ·  LIVES ${lives}`, PAL.amber, 'right');

            // Fuel Gauge Bar top right
            const fx0 = W - 196;
            const fy0 = 46;
            g.fillStyle = 'rgba(13, 19, 32, 0.88)';
            g.strokeStyle = PAL.border;
            roundRect(g, fx0, fy0, 180, 22, 6);
            g.fill();
            g.stroke();
            const fPct = clamp(fuel / maxFuel, 0, 1);
            g.fillStyle = fPct > 0.35 ? PAL.mint : (fPct > 0.15 ? PAL.amber : PAL.coral);
            roundRect(g, fx0 + 3, fy0 + 3, 174 * fPct, 16, 4);
            g.fill();
            g.fillStyle = PAL.text;
            g.font = '700 11px "JetBrains Mono", monospace';
            g.textAlign = 'center';
            g.fillText(`FUEL ${Math.round(fuel)}%`, fx0 + 90, fy0 + 15);

            if (state === 'flying') {
                drawPill(g, W * 0.5, H - 30, '[W / UP] MAIN THRUSTER · [A / D] RCS TILT · LAND SOFTLY ON CYAN PAD', PAL.muted, 'center');
            }

            if (state === 'cleared') {
                drawBanner(g, 'THE EAGLE HAS LANDED!', `Sector ${levelIdx + 1} Cleared · Score: ${score}`, 'CLICK OR PRESS [SPACE] FOR NEXT MOON SECTOR', PAL.mint);
            } else if (state === 'victory') {
                drawBanner(g, 'APOLLO MISSION COMPLETE!', `All 5 Moon Sectors Landed · Total Score: ${score}`, 'CLICK OR PRESS [SPACE] TO FLY AGAIN', PAL.amber);
            } else if (state === 'gameover') {
                drawBanner(g, 'LUNAR LANDER LOST', `Sector ${levelIdx + 1}: ${cfg.name} · Score: ${score}`, 'CLICK OR PRESS [SPACE] TO RETRY SECTOR', PAL.coral);
            }
        });

        return {
            restart(level) {
                if (level !== undefined && level !== null) {
                    const target = clamp(Math.floor(Number(level) || 1) - 1, 0, SECTORS.length - 1);
                    const advancing = state === 'cleared' && target === levelIdx + 1;
                    loadLevel(target, advancing, advancing);
                } else {
                    score = 0;
                    loadLevel(0, false, false);
                }
            },
            destroy() {
                loop.destroy();
                input.destroy();
                destroyMatterEngine(engine);
            }
        };
    };

    // =========================================================================
    // GAME 3: cosmic-pinball-rig (Endless score pinball table)
    // =========================================================================
    ENGINES['cosmic-pinball-rig'] = function mountPinball(ctx) {
        const M = getMatter();
        const canvas = ctx.createCanvas('2d');
        const stars = createStars(603, 95);
        const fx = createFxSystem();

        // Center cabinet inside 960x540
        const CAB_L = 240;
        const CAB_R = 720;
        const CAB_W = CAB_R - CAB_L; // 480
        const LANE_X = 682;
        const PLAY_R = 678;

        let engine = null;
        let score = 0;
        let highScore = 0;
        let ballsLeft = 3;
        let multiplier = 1;
        let lockCount = 0;
        let multiballActive = false;
        let activeBalls = [];
        let bumpers = [];
        let slings = [];
        let rollovers = [false, false, false];
        let rolloverBodies = [];
        let lockSensor = null;
        let drainSensor = null;
        let shooterGate = null;
        let leftFlipper = null;
        let rightFlipper = null;
        let leftAngle = 0.44;
        let rightAngle = -0.44;
        let plungerCharge = 0;
        let chargingPlunger = false;
        let nudgeCooldown = 0;
        let shakeTime = 0;
        let state = 'playing'; // playing | gameover
        let stateTimer = 0;
        let reportedEnd = false;
        let leftTouch = false;
        let rightTouch = false;
        let rolloverCooldown = 0;
        let lockCooldown = 0;

        const LEFT_PIVOT = { x: 372, y: 472 };
        const RIGHT_PIVOT = { x: 562, y: 472 };
        const FLIP_LEN = 36;

        function makeWall(x, y, w, h, angle, label, rest) {
            return M.Bodies.rectangle(x, y, w, h, {
                isStatic: true,
                angle: angle || 0,
                restitution: rest !== undefined ? rest : 0.65,
                friction: 0.01,
                label: label || 'wall'
            });
        }

        function spawnBall(x, y, vx, vy) {
            const b = M.Bodies.circle(x, y, 10, {
                restitution: 0.56,
                friction: 0.004,
                frictionAir: 0.0025,
                density: 0.003,
                label: 'pinball'
            });
            b._stuckSec = 0;
            b._anchorPos = { x, y };
            b._anchorSec = 0;
            if (vx !== undefined && vy !== undefined) {
                M.Body.setVelocity(b, { x: vx, y: vy });
            }
            M.Composite.add(engine.world, b);
            activeBalls.push(b);
            return b;
        }

        function syncHud() {
            pushHud(ctx, {
                score,
                level: multiplier,
                maxLevel: 5,
                lives: ballsLeft,
                statusText: state === 'gameover'
                    ? 'TILT / OUT OF BALLS'
                    : (multiballActive ? `MULTIBALL (${activeBalls.length}) · ${multiplier}x` : `${multiplier}x MULT · LOCK ${lockCount}/3`),
                objectiveText: 'Z/Left & //Right Flippers · Space Plunger · Up Nudge · 3x Lock = Multiball'
            });
        }

        function initTable() {
            score = 0;
            ballsLeft = 3;
            multiplier = 1;
            lockCount = 0;
            multiballActive = false;
            activeBalls = [];
            rollovers = [false, false, false];
            plungerCharge = 0;
            chargingPlunger = false;
            nudgeCooldown = 0;
            shakeTime = 0;
            state = 'playing';
            stateTimer = 0;
            reportedEnd = false;
            leftAngle = 0.44;
            rightAngle = -0.44;
            fx.clear();

            destroyMatterEngine(engine);
            engine = createMatterEngine(0, 0.34, {
                positionIterations: 10,
                velocityIterations: 8
            });

            // Outer walls + curved arch guide segments
            const walls = [
                makeWall(CAB_L - 8, H * 0.5, 16, H, 0),
                makeWall(CAB_R + 8, H * 0.5, 16, H, 0),
                makeWall((CAB_L + CAB_R) * 0.5, 6, CAB_W + 30, 16, 0),
                // Top arch bevels guiding plunger shots smoothly left around the dome
                makeWall(CAB_L + 42, 46, 124, 16, -0.72),
                makeWall(CAB_R - 42, 46, 124, 16, 0.72),
                // Shooter lane inner divider (keeps x = 674..720 completely clear)
                makeWall(668, 322, 12, 366, 0),
                // Plunger floor
                makeWall(697, 516, 48, 18, 0),
                // Bottom funnel slopes guiding to flippers (left of shooter divider)
                makeWall(303, 439, 138, 14, 0.40),
                makeWall(614, 439, 108, 14, -0.52)
            ];

            // Top rollover lane divider fins (below upper arch path so shots arc cleanly above)
            const fins = [
                makeWall(418, 114, 8, 44, 0),
                makeWall(472, 114, 8, 44, 0),
                makeWall(526, 114, 8, 44, 0)
            ];

            // 3 Rollover Lane Stars
            const rXs = [391, 445, 499];
            rolloverBodies = rXs.map((rx, idx) => {
                const s = M.Bodies.circle(rx, 114, 13, {
                    isStatic: true,
                    isSensor: true,
                    label: 'rollover'
                });
                s._idx = idx;
                return s;
            });

            // 4 Glowing Space Bumpers (restitution: 1.35)
            const bumperSpecs = [
                { x: 405, y: 195, r: 23, color: PAL.sky },
                { x: 525, y: 195, r: 23, color: PAL.violet },
                { x: 465, y: 262, r: 24, color: PAL.coral },
                { x: 350, y: 270, r: 20, color: PAL.amber }
            ];
            bumpers = bumperSpecs.map((sp) => {
                const b = M.Bodies.circle(sp.x, sp.y, sp.r, {
                    isStatic: true,
                    restitution: 1.35,
                    friction: 0.005,
                    label: 'bumper'
                });
                b._flash = 0;
                b._color = sp.color;
                b._r = sp.r;
                return b;
            });

            // 2 Sling Triangles above flippers
            const slingLVerts = [{ x: 300, y: 345 }, { x: 300, y: 405 }, { x: 356, y: 405 }];
            const slingRVerts = [{ x: 630, y: 345 }, { x: 574, y: 405 }, { x: 630, y: 405 }];
            const cL = M.Vertices.centre(slingLVerts);
            const cR = M.Vertices.centre(slingRVerts);
            const slingL = M.Bodies.fromVertices(cL.x, cL.y, slingLVerts, { isStatic: true, restitution: 1.35, label: 'sling' });
            const slingR = M.Bodies.fromVertices(cR.x, cR.y, slingRVerts, { isStatic: true, restitution: 1.35, label: 'sling' });
            slingL._flash = 0;
            slingR._flash = 0;
            slings = [slingL, slingR];

            // Multiball Lock Target (3 balls bonus!)
            lockSensor = M.Bodies.circle(292, 168, 19, {
                isStatic: true,
                isSensor: true,
                label: 'lock'
            });

            // Flippers
            leftFlipper = M.Bodies.rectangle(LEFT_PIVOT.x + FLIP_LEN, LEFT_PIVOT.y, 78, 16, {
                isStatic: true,
                restitution: 0.55,
                friction: 0.02,
                label: 'flipper'
            });
            rightFlipper = M.Bodies.rectangle(RIGHT_PIVOT.x - FLIP_LEN, RIGHT_PIVOT.y, 78, 16, {
                isStatic: true,
                restitution: 0.55,
                friction: 0.02,
                label: 'flipper'
            });

            // Drain sensor at bottom center
            drainSensor = M.Bodies.rectangle(467, 545, 220, 26, {
                isStatic: true,
                isSensor: true,
                label: 'drain'
            });

            // One-way shooter gate (starts open/inactive until ball leaves lane)
            shooterGate = M.Bodies.rectangle(668, 96, 10, 68, {
                isStatic: true,
                isSensor: true,
                angle: 0.12,
                label: 'gate'
            });

            M.Composite.add(engine.world, [
                ...walls,
                ...fins,
                ...rolloverBodies,
                ...bumpers,
                ...slings,
                lockSensor,
                leftFlipper,
                rightFlipper,
                drainSensor,
                shooterGate
            ]);

            M.Events.on(engine, 'collisionStart', (ev) => {
                if (state !== 'playing') return;
                for (let i = 0; i < ev.pairs.length; i++) {
                    const pair = ev.pairs[i];
                    let ball = null;
                    let other = null;
                    if (pair.bodyA.label === 'pinball') { ball = pair.bodyA; other = pair.bodyB; }
                    else if (pair.bodyB.label === 'pinball') { ball = pair.bodyB; other = pair.bodyA; }
                    if (!ball || !other) continue;

                    if (other.label === 'bumper') {
                        other._flash = 1;
                        const pts = 150 * multiplier * (multiballActive ? 2 : 1);
                        score += pts;
                        highScore = Math.max(highScore, score);
                        const dx = ball.position.x - other.position.x;
                        const dy = ball.position.y - other.position.y;
                        const d = Math.hypot(dx, dy) || 1;
                        M.Body.setVelocity(ball, { x: (dx / d) * 6.8, y: (dy / d) * 6.8 });
                        fx.burst(ball.position.x, ball.position.y, other._color, 12, 1.5, 4.2, 0.32, 2.5);
                        fx.ring(other.position.x, other.position.y, other._color, 34, 0.25);
                        fx.popup(other.position.x, other.position.y - 16, `+${pts}`, other._color);
                        playSfx(ctx, 'hitShield', 0.14);
                    } else if (other.label === 'sling') {
                        other._flash = 1;
                        const pts = 75 * multiplier;
                        score += pts;
                        highScore = Math.max(highScore, score);
                        const dirX = other === slingL ? 4.8 : -4.8;
                        M.Body.setVelocity(ball, { x: dirX, y: -5.2 });
                        fx.burst(ball.position.x, ball.position.y, PAL.teal, 10, 1.2, 3.8, 0.26, 2.2);
                        fx.popup(ball.position.x, ball.position.y - 10, `+${pts}`, PAL.teal);
                        playSfx(ctx, 'hitMetal', 0.15);
                    } else if (other.label === 'rollover' && rolloverCooldown <= 0) {
                        const idx = other._idx;
                        if (!rollovers[idx]) {
                            rollovers[idx] = true;
                            score += 100 * multiplier;
                            fx.ring(other.position.x, other.position.y, PAL.amber, 22, 0.3);
                            playSfx(ctx, 'xpPickup', 0.1);
                            if (rollovers[0] && rollovers[1] && rollovers[2]) {
                                rollovers = [false, false, false];
                                multiplier = Math.min(5, multiplier + 1);
                                score += 500;
                                fx.popup(445, 115, `MULTIPLIER ${multiplier}x! +500`, PAL.amber);
                                playSfx(ctx, 'powerup');
                            }
                            rolloverCooldown = 0.25;
                        }
                        highScore = Math.max(highScore, score);
                    } else if (other.label === 'lock' && lockCooldown <= 0) {
                        lockCooldown = 0.65;
                        if (!multiballActive) {
                            lockCount++;
                            score += 250 * multiplier;
                            highScore = Math.max(highScore, score);
                            fx.burst(other.position.x, other.position.y, PAL.mint, 16, 1.5, 4.5, 0.45, 3);
                            if (lockCount >= 3) {
                                lockCount = 0;
                                multiballActive = true;
                                score += 1000;
                                fx.popup(465, 220, 'MULTIBALL! 3 BALLS!', PAL.mint);
                                playSfx(ctx, 'chestOpen');
                                // Spawn 2 bonus balls from the Warp Vortex Lock
                                spawnBall(292, 192, 3.8, 1.5);
                                spawnBall(298, 198, 5.1, -1.8);
                            } else {
                                fx.popup(other.position.x + 28, other.position.y, `LOCK ${lockCount}/3`, PAL.mint);
                                playSfx(ctx, 'powerup');
                            }
                        } else {
                            score += 300 * multiplier;
                            highScore = Math.max(highScore, score);
                            fx.popup(other.position.x + 24, other.position.y, `+${300 * multiplier}`, PAL.mint);
                            playSfx(ctx, 'xpPickup', 0.1);
                        }
                    }
                }
            });

            spawnBall(696, 485, 0, 0);
            syncHud();
        }

        function releasePlunger() {
            if (!chargingPlunger || state !== 'playing') return;
            chargingPlunger = false;
            const power = 11.5 + clamp(plungerCharge, 0.2, 1) * 4.0;
            for (let i = 0; i < activeBalls.length; i++) {
                const b = activeBalls[i];
                if (b.position.x > 670 && b.position.y > 410) {
                    M.Body.setVelocity(b, { x: 0, y: -power });
                    fx.burst(b.position.x, b.position.y + 8, PAL.amber, 14, 1, 3.5, 0.3, 2.5);
                    playSfx(ctx, 'shootMissile');
                }
            }
            plungerCharge = 0;
        }

        function nudgeTable() {
            if (state !== 'playing' || nudgeCooldown > 0) return;
            nudgeCooldown = 1.2;
            shakeTime = 0.22;
            playSfx(ctx, 'emp', 0.1);
            fx.popup(465, 310, 'NUDGE!', PAL.sky);
            for (let i = 0; i < activeBalls.length; i++) {
                const b = activeBalls[i];
                if (b.position.x < 668) {
                    M.Body.setVelocity(b, {
                        x: b.velocity.x + (Math.random() - 0.5) * 2.4,
                        y: b.velocity.y - 3.1
                    });
                }
            }
        }

        const input = createInput(canvas, {
            onKeyDown(code, e, first) {
                if (state === 'gameover' && stateTimer > 0.6 && (code === 'Space' || code === 'Enter' || code === 'KeyR')) {
                    initTable();
                    return;
                }
                if (code === 'Space' && first) {
                    chargingPlunger = true;
                }
                if ((code === 'ArrowUp' || code === 'KeyW') && first) {
                    nudgeTable();
                }
                if ((code === 'ArrowLeft' || code === 'KeyZ') && first) {
                    // Lane shift rollover left
                    rollovers = [rollovers[1], rollovers[2], rollovers[0]];
                    playSfx(ctx, 'uiClick', 0.12);
                }
                if ((code === 'ArrowRight' || code === 'Slash') && first) {
                    rollovers = [rollovers[2], rollovers[0], rollovers[1]];
                    playSfx(ctx, 'uiClick', 0.12);
                }
            },
            onKeyUp(code) {
                if (code === 'Space') releasePlunger();
            },
            onPointerDown(x, y) {
                if (state === 'gameover' && stateTimer > 0.6) {
                    initTable();
                    return;
                }
                if (x > 664 && y > 340) {
                    chargingPlunger = true;
                } else if (x < 467) {
                    leftTouch = true;
                    playSfx(ctx, 'uiClick', 0.1);
                } else {
                    rightTouch = true;
                    playSfx(ctx, 'uiClick', 0.1);
                }
            },
            onPointerUp() {
                leftTouch = false;
                rightTouch = false;
                if (chargingPlunger) releasePlunger();
            },
            onPointerCancel() {
                leftTouch = false;
                rightTouch = false;
                chargingPlunger = false;
                plungerCharge = 0;
            }
        }, ctx);

        initTable();
        let hudTimer = 0;

        function updateFlipper(body, pivot, dir, currentAngle, targetAngle) {
            const da = clamp(targetAngle - currentAngle, -0.11, 0.11);
            const nextAngle = currentAngle + da;
            const cx = pivot.x + Math.cos(nextAngle) * FLIP_LEN * dir;
            const cy = pivot.y + Math.sin(nextAngle) * FLIP_LEN * dir;
            M.Body.setAngle(body, nextAngle);
            M.Body.setAngularVelocity(body, da);
            M.Body.setPosition(body, { x: cx, y: cy });
            M.Body.setVelocity(body, {
                x: -Math.sin(nextAngle) * FLIP_LEN * dir * da,
                y: Math.cos(nextAngle) * FLIP_LEN * dir * da
            });
            return nextAngle;
        }

        // Anti-tunneling swept capsule check for fast upward flipper strokes
        function enforceFlipperSweep(pivot, dir, prevAng, nextAng) {
            const upwardSweep = dir > 0 ? (nextAng < prevAng - 0.002) : (nextAng > prevAng + 0.002);
            if (!upwardSweep) return;
            const tx = Math.cos(nextAng) * dir;
            const ty = Math.sin(nextAng) * dir;
            const bladeLen = 74;
            const ax = pivot.x;
            const ay = pivot.y;
            const bx = ax + tx * bladeLen;
            const by = ay + ty * bladeLen;
            const ptx = Math.cos(prevAng) * dir;
            const pty = Math.sin(prevAng) * dir;
            const nx = Math.sin(nextAng);
            const ny = -Math.cos(nextAng); // upward perpendicular normal (ny < 0)
            const pnx = Math.sin(prevAng);
            const pny = -Math.cos(prevAng);

            for (let i = 0; i < activeBalls.length; i++) {
                const b = activeBalls[i];
                const px = b.position.x;
                const py = b.position.y;
                const u = clamp(((px - ax) * tx + (py - ay) * ty) / bladeLen, 0, 1);
                const qx = ax + tx * bladeLen * u;
                const qy = ay + ty * bladeLen * u;
                const d = Math.hypot(px - qx, py - qy);
                const prevSide = (px - ax) * pnx + (py - ay) * pny;
                const currSide = (px - ax) * nx + (py - ay) * ny;
                const uAlong = ((px - ax) * ptx + (py - ay) * pty) / bladeLen;
                const crossedSweep = uAlong >= 0.05 && uAlong <= 1.04 && prevSide >= -10 && currSide <= 12;

                if (d < 18.2 || crossedSweep) {
                    M.Body.setPosition(b, { x: qx + nx * 19.2, y: qy + ny * 19.2 });
                    const launch = 7.2 + u * 6.5;
                    const curDot = b.velocity.x * nx + b.velocity.y * ny;
                    if (curDot < launch) {
                        const tangV = b.velocity.x * tx + b.velocity.y * ty;
                        M.Body.setVelocity(b, {
                            x: nx * launch + tx * tangV * 0.65,
                            y: ny * launch + ty * tangV * 0.65
                        });
                    }
                    playSfx(ctx, 'hitMetal', 0.14);
                    fx.burst(qx, qy, PAL.sky, 6, 1.0, 2.5, 0.22, 1.8);
                }
            }
        }

        const loop = createLoop(ctx, canvas, (dtMs) => {
            const dtSec = dtMs * 0.001;
            fx.update(dtSec);

            if (state === 'gameover') {
                stateTimer += dtSec;
                return;
            }

            if (nudgeCooldown > 0) nudgeCooldown = Math.max(0, nudgeCooldown - dtSec);
            if (shakeTime > 0) shakeTime = Math.max(0, shakeTime - dtSec);
            if (rolloverCooldown > 0) rolloverCooldown = Math.max(0, rolloverCooldown - dtSec);
            if (lockCooldown > 0) lockCooldown = Math.max(0, lockCooldown - dtSec);

            for (let i = 0; i < bumpers.length; i++) bumpers[i]._flash = Math.max(0, bumpers[i]._flash - dtSec * 4.5);
            for (let i = 0; i < slings.length; i++) slings[i]._flash = Math.max(0, slings[i]._flash - dtSec * 4.5);

            if (chargingPlunger) {
                plungerCharge = clamp(plungerCharge + dtSec * 1.15, 0, 1);
            }

            const leftHeld = leftTouch || input.any(['KeyZ', 'ArrowLeft', 'KeyA']);
            const rightHeld = rightTouch || input.any(['Slash', 'ArrowRight', 'KeyD']);
            const leftTarget = leftHeld ? -0.48 : 0.44;
            const rightTarget = rightHeld ? 0.48 : -0.44;

            // 4 substeps per frame + swept flipper capsule prevent fast pinball tunneling
            const subDt = dtMs * 0.25;
            for (let s = 0; s < 4; s++) {
                const prevL = leftAngle;
                const prevR = rightAngle;
                leftAngle = updateFlipper(leftFlipper, LEFT_PIVOT, 1, leftAngle, leftTarget);
                rightAngle = updateFlipper(rightFlipper, RIGHT_PIVOT, -1, rightAngle, rightTarget);

                // Keep shooter gate open while any ball is inside/exiting shooter lane (x > 662)
                let ballInLane = false;
                for (let i = 0; i < activeBalls.length; i++) {
                    if (activeBalls[i].position.x > 662) {
                        ballInLane = true;
                        break;
                    }
                }
                shooterGate.isSensor = ballInLane;

                M.Engine.update(engine, subDt);
                enforceFlipperSweep(LEFT_PIVOT, 1, prevL, leftAngle);
                enforceFlipperSweep(RIGHT_PIVOT, -1, prevR, rightAngle);

                for (let i = 0; i < activeBalls.length; i++) {
                    const b = activeBalls[i];
                    const spd = Math.hypot(b.velocity.x, b.velocity.y);
                    if (spd > 16.0) {
                        const k = 16.0 / spd;
                        M.Body.setVelocity(b, { x: b.velocity.x * k, y: b.velocity.y * k });
                    }
                }
            }

            // Universal displacement progress monitor (rescues balls stuck in upper rails, shooter top, or gutters)
            for (let i = activeBalls.length - 1; i >= 0; i--) {
                const b = activeBalls[i];
                const waitingOnPlunger = b.position.x > 670 && b.position.y > 460 && Math.hypot(b.velocity.x, b.velocity.y) < 0.3;
                if (waitingOnPlunger) {
                    b._anchorPos.x = b.position.x;
                    b._anchorPos.y = b.position.y;
                    b._anchorSec = 0;
                } else {
                    const moved = Math.hypot(b.position.x - b._anchorPos.x, b.position.y - b._anchorPos.y);
                    if (moved < 12) {
                        b._anchorSec += dtSec;
                        if (b._anchorSec > 1.6) {
                            b._anchorSec = 0;
                            if (b.position.x >= 662 && b.position.y < 145) {
                                M.Body.setPosition(b, { x: 646, y: Math.max(85, b.position.y + 10) });
                                M.Body.setVelocity(b, { x: -5.6, y: 1.8 });
                            } else {
                                M.Body.setVelocity(b, {
                                    x: b.position.x < 465 ? 3.8 : -3.8,
                                    y: -5.2
                                });
                            }
                            fx.ring(b.position.x, b.position.y, PAL.sky, 30, 0.3);
                            fx.popup(b.position.x, Math.max(40, b.position.y - 14), 'AUTO-RESCUE', PAL.sky);
                            playSfx(ctx, 'emp', 0.12);
                        }
                    } else {
                        b._anchorPos.x = b.position.x;
                        b._anchorPos.y = b.position.y;
                        b._anchorSec = 0;
                    }
                }

                if (b.position.y > 532) {
                    M.Composite.remove(engine.world, b);
                    activeBalls.splice(i, 1);
                    playSfx(ctx, 'playerHurt', 0.1);
                }
            }

            if (activeBalls.length <= 1) multiballActive = false;

            if (activeBalls.length === 0) {
                ballsLeft--;
                if (ballsLeft <= 0) {
                    state = 'gameover';
                    stateTimer = 0;
                    syncHud();
                    if (!reportedEnd) {
                        reportedEnd = true;
                        const stars = score >= 12000 ? 3 : (score >= 5000 ? 2 : (score >= 1500 ? 1 : 0));
                        ctx.onGameOver?.({ score, level: multiplier, stars, reason: 'All 3 pinballs drained!' });
                    }
                    return;
                } else {
                    multiplier = 1;
                    spawnBall(696, 485, 0, 0);
                    fx.popup(465, 290, `BALL ${4 - ballsLeft}`, PAL.sky);
                }
            }

            hudTimer += dtSec;
            if (hudTimer >= 0.15) {
                hudTimer = 0;
                syncHud();
            }
        }, (g, simTime) => {
            drawSpaceBackdrop(g, stars, simTime, 'rgba(167, 139, 250, 0.11)', 0);

            g.save();
            if (shakeTime > 0) {
                g.translate((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5);
            }

            // Pinball cabinet body
            g.fillStyle = '#0b111e';
            g.strokeStyle = PAL.sky;
            g.lineWidth = 2.5;
            roundRect(g, CAB_L, 6, CAB_W, H - 12, 22);
            g.fill();
            g.stroke();

            // Subtle table grid & shooter lane tint
            g.fillStyle = 'rgba(56, 189, 248, 0.05)';
            g.fillRect(674, 120, 44, 405);

            // Plunger spring
            const comp = plungerCharge * 24;
            g.strokeStyle = PAL.amber;
            g.lineWidth = 3;
            g.beginPath();
            g.moveTo(696, 524);
            g.lineTo(696, 502 + comp);
            g.stroke();
            g.fillStyle = PAL.amber;
            g.fillRect(682, 496 + comp, 28, 7);

            // Shooter divider + arch walls
            g.fillStyle = '#1e293b';
            g.strokeStyle = '#64748b';
            g.lineWidth = 1.5;
            const bodies = M.Composite.allBodies(engine.world);
            for (let i = 0; i < bodies.length; i++) {
                const b = bodies[i];
                if (b.label === 'wall') drawVerticesBody(g, b, '#1e293b', '#475569', 1.2);
            }

            // Rollover Lane Stars
            for (let i = 0; i < rolloverBodies.length; i++) {
                const rb = rolloverBodies[i];
                const lit = rollovers[i];
                g.save();
                g.globalAlpha = lit ? 1 : 0.32;
                if (!drawSprite(g, ctx, 'coin_star', rb.position.x, rb.position.y, 22, 22, lit ? simTime * 2 : 0)) {
                    g.fillStyle = lit ? PAL.amber : PAL.muted;
                    g.beginPath();
                    g.arc(rb.position.x, rb.position.y, 8, 0, TAU);
                    g.fill();
                }
                g.restore();
            }

            // Multiball Lock Target
            const lx = lockSensor.position.x;
            const ly = lockSensor.position.y;
            drawSprite(g, ctx, 'portal_vortex', lx, ly, 42, 42, simTime * 2.2);
            for (let i = 0; i < 3; i++) {
                g.fillStyle = i < lockCount || multiballActive ? PAL.mint : '#1e293b';
                g.strokeStyle = PAL.mint;
                g.lineWidth = 1.2;
                g.beginPath();
                g.arc(lx - 14 + i * 14, ly + 26, 4.5, 0, TAU);
                g.fill();
                g.stroke();
            }

            // 4 Space Bumpers
            for (let i = 0; i < bumpers.length; i++) {
                const bp = bumpers[i];
                const scale = 1 + bp._flash * 0.22;
                const r = bp._r * scale;
                g.save();
                const bGrad = g.createRadialGradient(bp.position.x, bp.position.y, 3, bp.position.x, bp.position.y, r + 6);
                bGrad.addColorStop(0, '#ffffff');
                bGrad.addColorStop(0.55, bp._color);
                bGrad.addColorStop(1, 'rgba(13, 19, 32, 0.9)');
                g.fillStyle = bGrad;
                g.beginPath();
                g.arc(bp.position.x, bp.position.y, r, 0, TAU);
                g.fill();
                drawSprite(g, ctx, 'boss_core', bp.position.x, bp.position.y, r * 1.4, r * 1.4, simTime + i, 0.85);
                g.strokeStyle = bp._flash > 0.1 ? '#ffffff' : bp._color;
                g.lineWidth = 2.5;
                g.beginPath();
                g.arc(bp.position.x, bp.position.y, r, 0, TAU);
                g.stroke();
                g.restore();
            }

            // Sling triangles
            for (let i = 0; i < slings.length; i++) {
                const sl = slings[i];
                drawVerticesBody(g, sl, sl._flash > 0.1 ? 'rgba(45, 212, 191, 0.45)' : '#131b2c', PAL.teal, 2.2);
            }

            // Flippers
            drawVerticesBody(g, leftFlipper, PAL.sky, '#e2e8f0', 2);
            drawVerticesBody(g, rightFlipper, PAL.sky, '#e2e8f0', 2);
            g.fillStyle = '#f8fafc';
            g.beginPath();
            g.arc(LEFT_PIVOT.x, LEFT_PIVOT.y, 5, 0, TAU);
            g.arc(RIGHT_PIVOT.x, RIGHT_PIVOT.y, 5, 0, TAU);
            g.fill();

            // Pinballs
            for (let i = 0; i < activeBalls.length; i++) {
                const b = activeBalls[i];
                const bGrad = g.createRadialGradient(b.position.x - 3, b.position.y - 3, 2, b.position.x, b.position.y, 10);
                bGrad.addColorStop(0, '#ffffff');
                bGrad.addColorStop(0.6, multiballActive ? PAL.mint : PAL.sky);
                bGrad.addColorStop(1, '#0284c7');
                g.fillStyle = bGrad;
                g.beginPath();
                g.arc(b.position.x, b.position.y, 10, 0, TAU);
                g.fill();
            }

            fx.render(g);
            g.restore();

            // Side telemetry panels
            drawPill(g, 18, 20, `SCORE ${score}`, PAL.mint, 'left');
            drawPill(g, 18, 52, `BEST ${highScore}`, PAL.amber, 'left');
            drawPill(g, 18, 84, `MULT ${multiplier}x`, PAL.sky, 'left');
            drawPill(g, 18, 116, `LOCK ${lockCount}/3`, PAL.violet, 'left');
            drawPill(g, 18, 148, `BALLS ${ballsLeft}`, ballsLeft === 1 ? PAL.coral : PAL.text, 'left');

            drawPill(g, W - 18, 20, '[Z / LEFT] L FLIPPER', PAL.sky, 'right');
            drawPill(g, W - 18, 52, '[/ / RIGHT] R FLIPPER', PAL.sky, 'right');
            drawPill(g, W - 18, 84, '[SPACE] SPRING PLUNGER', PAL.amber, 'right');
            drawPill(g, W - 18, 116, '[UP / W] TABLE NUDGE', nudgeCooldown > 0 ? PAL.muted : PAL.mint, 'right');
            drawPill(g, W - 18, 148, 'OR CLICK LEFT / RIGHT SIDE', PAL.muted, 'right');

            if (state === 'gameover') {
                drawBanner(g, 'PINBALL GAME OVER', `Final Score: ${score} · Best: ${highScore}`, 'CLICK OR PRESS [SPACE] FOR NEW TABLE', PAL.coral);
            }
        });

        return {
            restart() {
                initTable();
            },
            destroy() {
                loop.destroy();
                input.destroy();
                destroyMatterEngine(engine);
            }
        };
    };

    // =========================================================================
    // GAME 4: nebula-pool-ricochet (8 puzzle-billiard tables)
    // =========================================================================
    ENGINES['nebula-pool-ricochet'] = function mountNebulaPool(ctx) {
        const M = getMatter();
        const canvas = ctx.createCanvas('2d');
        const stars = createStars(704, 90);
        const fx = createFxSystem();

        const TL = 70;
        const TT = 55;
        const TR = 890;
        const TB = 495;
        const TW = TR - TL;
        const TH = TB - TT;
        const MIDX = (TL + TR) * 0.5;
        const MIDY = (TT + TB) * 0.5;

        const TABLES = [
            {
                name: 'Docking Bay Alpha', pockets: 4, shots: 4,
                cue: { x: 230, y: MIDY },
                pillars: [],
                orbs: [{ x: 640, y: MIDY - 75, t: 'cryo' }, { x: 640, y: MIDY + 75, t: 'plasma' }]
            },
            {
                name: 'Twin Octagon', pockets: 4, shots: 5,
                cue: { x: 200, y: MIDY },
                pillars: [{ x: MIDX, y: MIDY, r: 34 }],
                orbs: [{ x: 650, y: 155, t: 'cryo' }, { x: 650, y: 395, t: 'plasma' }, { x: 755, y: MIDY, t: 'cryo' }]
            },
            {
                name: 'Antimatter Triangle', pockets: 6, shots: 6,
                cue: { x: 225, y: MIDY },
                pillars: [{ x: 420, y: MIDY, r: 26 }],
                orbs: [
                    { x: 620, y: MIDY, t: 'plasma' },
                    { x: 665, y: MIDY - 36, t: 'cryo' },
                    { x: 665, y: MIDY + 36, t: 'cryo' },
                    { x: 715, y: MIDY, t: 'plasma' }
                ]
            },
            {
                name: 'Corridor Ricochet', pockets: 4, shots: 5,
                cue: { x: 185, y: 390 },
                pillars: [{ x: 430, y: 205, r: 38 }, { x: 540, y: 345, r: 38 }],
                orbs: [{ x: 715, y: 145, t: 'cryo' }, { x: 735, y: 405, t: 'plasma' }, { x: 485, y: 130, t: 'cryo' }]
            },
            {
                name: 'Prism Split', pockets: 6, shots: 7,
                cue: { x: 195, y: MIDY },
                pillars: [{ x: 375, y: 190, r: 30 }, { x: 375, y: 360, r: 30 }],
                orbs: [
                    { x: 580, y: MIDY, t: 'plasma' },
                    { x: 635, y: MIDY - 52, t: 'cryo' },
                    { x: 635, y: MIDY + 52, t: 'cryo' },
                    { x: 710, y: 155, t: 'plasma' },
                    { x: 710, y: 395, t: 'cryo' }
                ]
            },
            {
                name: 'Crossfire Diamond', pockets: 4, shots: 6,
                cue: { x: 180, y: MIDY },
                pillars: [
                    { x: MIDX - 70, y: MIDY - 68, r: 26 },
                    { x: MIDX + 70, y: MIDY - 68, r: 26 },
                    { x: MIDX - 70, y: MIDY + 68, r: 26 },
                    { x: MIDX + 70, y: MIDY + 68, r: 26 }
                ],
                orbs: [
                    { x: MIDX, y: MIDY, t: 'plasma' },
                    { x: 730, y: 150, t: 'cryo' },
                    { x: 730, y: 400, t: 'cryo' },
                    { x: 320, y: 130, t: 'plasma' }
                ]
            },
            {
                name: 'Singularity Rack', pockets: 6, shots: 8,
                cue: { x: 205, y: MIDY },
                pillars: [
                    { x: 380, y: MIDY, r: 30 },
                    { x: 560, y: 165, r: 28 },
                    { x: 560, y: 385, r: 28 }
                ],
                orbs: [
                    { x: 650, y: MIDY, t: 'cryo' },
                    { x: 685, y: MIDY - 34, t: 'plasma' },
                    { x: 685, y: MIDY + 34, t: 'plasma' },
                    { x: 725, y: MIDY - 66, t: 'cryo' },
                    { x: 725, y: MIDY, t: 'cryo' },
                    { x: 725, y: MIDY + 66, t: 'plasma' }
                ]
            },
            {
                name: 'Grandmaster Nebula', pockets: 6, shots: 9,
                cue: { x: 175, y: MIDY },
                pillars: [
                    { x: 335, y: 185, r: 28 },
                    { x: 335, y: 365, r: 28 },
                    { x: 560, y: 215, r: 30 },
                    { x: 560, y: 335, r: 30 }
                ],
                orbs: [
                    { x: 455, y: MIDY, t: 'plasma' },
                    { x: 680, y: MIDY, t: 'cryo' },
                    { x: 718, y: MIDY - 36, t: 'plasma' },
                    { x: 718, y: MIDY + 36, t: 'cryo' },
                    { x: 758, y: MIDY - 72, t: 'cryo' },
                    { x: 758, y: MIDY, t: 'plasma' },
                    { x: 758, y: MIDY + 72, t: 'cryo' }
                ]
            }
        ];

        let engine = null;
        let levelIdx = clamp((Number(ctx.level || ctx.startLevel || 1) || 1) - 1, 0, TABLES.length - 1);
        let score = 0;
        const scoreCheckpoint = [0];
        let shotsLeft = 5;
        let cueBall = null;
        let targetBalls = [];
        let pillars = [];
        let pockets = [];
        let cueScratched = false;
        let shotSunkCount = 0;
        let state = 'aim'; // aim | moving | cleared | victory | gameover
        let stateTimer = 0;
        let shotTimer = 0;
        let dragging = false;
        let dragStart = { x: 0, y: 0 };
        let dragCurr = { x: 0, y: 0 };
        let reportedEnd = false;

        function getPockets(count) {
            const list = [
                { x: TL + 16, y: TT + 16 },
                { x: TR - 16, y: TT + 16 },
                { x: TL + 16, y: TB - 16 },
                { x: TR - 16, y: TB - 16 }
            ];
            if (count >= 6) {
                list.push({ x: MIDX, y: TT + 14 });
                list.push({ x: MIDX, y: TB - 14 });
            }
            return list;
        }

        function syncHud() {
            const cfg = TABLES[levelIdx];
            const statusMap = {
                aim: `SHOTS LEFT ${shotsLeft} · DRAG CUE ORB`,
                moving: `ORBS REMAINING ${targetBalls.length}`,
                cleared: 'TABLE CLEARED!',
                victory: 'ALL 8 NEBULA TABLES CLEARED!',
                gameover: 'OUT OF SHOTS'
            };
            pushHud(ctx, {
                score,
                level: levelIdx + 1,
                maxLevel: TABLES.length,
                lives: shotsLeft,
                statusText: statusMap[state] || cfg.name,
                objectiveText: `${cfg.name} (${cfg.pockets} Wormholes) · Sink ${targetBalls.length} Orbs`
            });
        }

        function spawnCueOrb() {
            const cfg = TABLES[levelIdx];
            if (cueBall && engine) M.Composite.remove(engine.world, cueBall);
            let spawnX = cfg.cue.x;
            const spawnY = cfg.cue.y;
            for (let tries = 0; tries < 9; tries++) {
                const offset = tries === 0 ? 0 : (tries % 2 === 1 ? Math.ceil(tries * 0.5) * 20 : -Math.ceil(tries * 0.5) * 20);
                const candX = clamp(cfg.cue.x + offset, TL + 36, TR - 36);
                const blocked = targetBalls.some((tb) => dist(candX, spawnY, tb.position.x, tb.position.y) < 32);
                if (!blocked) {
                    spawnX = candX;
                    break;
                }
            }
            cueBall = M.Bodies.circle(spawnX, spawnY, 14, {
                frictionAir: 0.018,
                friction: 0.01,
                restitution: 0.94,
                density: 0.0022,
                label: 'cue'
            });
            M.Composite.add(engine.world, cueBall);
            cueScratched = false;
        }

        function loadLevel(idx, preserveScore) {
            levelIdx = clamp(idx, 0, TABLES.length - 1);
            if (!preserveScore) {
                score = scoreCheckpoint[levelIdx] || 0;
            } else {
                scoreCheckpoint[levelIdx] = score;
            }
            const cfg = TABLES[levelIdx];
            shotsLeft = cfg.shots;
            state = 'aim';
            stateTimer = 0;
            shotTimer = 0;
            dragging = false;
            cueScratched = false;
            shotSunkCount = 0;
            reportedEnd = false;
            fx.clear();

            destroyMatterEngine(engine);
            engine = createMatterEngine(0, 0);

            // Outer high-restitution table cushions
            const walls = [
                M.Bodies.rectangle(MIDX, TT - 14, TW + 40, 28, { isStatic: true, restitution: 0.94, friction: 0.01, label: 'rail' }),
                M.Bodies.rectangle(MIDX, TB + 14, TW + 40, 28, { isStatic: true, restitution: 0.94, friction: 0.01, label: 'rail' }),
                M.Bodies.rectangle(TL - 14, MIDY, 28, TH + 40, { isStatic: true, restitution: 0.94, friction: 0.01, label: 'rail' }),
                M.Bodies.rectangle(TR + 14, MIDY, 28, TH + 40, { isStatic: true, restitution: 0.94, friction: 0.01, label: 'rail' })
            ];

            // Octagonal station pillars
            pillars = cfg.pillars.map((p) => {
                const body = M.Bodies.polygon(p.x, p.y, 8, p.r, {
                    isStatic: true,
                    restitution: 0.95,
                    friction: 0.01,
                    label: 'pillar'
                });
                body._r = p.r;
                return body;
            });

            pockets = getPockets(cfg.pockets);

            targetBalls = cfg.orbs.map((o) => {
                const body = M.Bodies.circle(o.x, o.y, 14, {
                    frictionAir: 0.018,
                    friction: 0.01,
                    restitution: 0.94,
                    density: 0.002,
                    label: 'target'
                });
                body._kind = o.t;
                return body;
            });

            M.Composite.add(engine.world, [...walls, ...pillars, ...targetBalls]);
            spawnCueOrb();

            M.Events.on(engine, 'collisionStart', (ev) => {
                for (let i = 0; i < ev.pairs.length; i++) {
                    const p = ev.pairs[i];
                    const bA = p.bodyA;
                    const bB = p.bodyB;
                    if ((bA.label === 'cue' || bB.label === 'cue') ||
                        (bA.label === 'target' && bB.label === 'target')) {
                        playSfx(ctx, 'hitMetal', 0.16);
                    }
                    const dyn = !bA.isStatic ? bA : (!bB.isStatic ? bB : null);
                    if (dyn) {
                        const spd = Math.hypot(dyn.velocity.x, dyn.velocity.y);
                        if (spd > 1.35) {
                            const pt = p.collision?.supports?.[0] || dyn.position;
                            const col = dyn.label === 'cue' ? PAL.sky : (dyn._kind === 'cryo' ? PAL.mint : PAL.amber);
                            fx.burst(pt.x, pt.y, col, 5, 0.8, 2.5, 0.22, 1.8);
                        }
                    }
                }
            });

            syncHud();
        }

        function getAimVector() {
            if (!cueBall) return null;
            const nearBall = Math.hypot(dragStart.x - cueBall.position.x, dragStart.y - cueBall.position.y) <= 38;
            if (nearBall && Math.hypot(dragCurr.x - dragStart.x, dragCurr.y - dragStart.y) < 8) return null;
            const origin = nearBall ? cueBall.position : dragStart;
            const dx = origin.x - dragCurr.x;
            const dy = origin.y - dragCurr.y;
            const d = Math.hypot(dx, dy);
            if (d < 14) return null;
            const pull = Math.min(d, 165);
            const speed = (pull / 165) * 16.5;
            return {
                vx: (dx / d) * speed,
                vy: (dy / d) * speed,
                nx: dx / d,
                ny: dy / d,
                power: pull / 165
            };
        }

        const input = createInput(canvas, {
            onKeyDown(code) {
                if (state === 'cleared' && stateTimer > 0.55 && (code === 'Space' || code === 'Enter')) {
                    loadLevel(levelIdx + 1, true);
                } else if (state === 'victory' && stateTimer > 0.6 && (code === 'Space' || code === 'Enter')) {
                    score = 0;
                    loadLevel(0, false);
                } else if (state === 'gameover' && stateTimer > 0.6 && (code === 'Space' || code === 'Enter' || code === 'KeyR')) {
                    loadLevel(levelIdx, false);
                } else if (code === 'KeyR' && state === 'aim') {
                    loadLevel(levelIdx, false);
                }
            },
            onPointerDown(x, y) {
                if (state === 'cleared' && stateTimer > 0.55) {
                    loadLevel(levelIdx + 1, true);
                    return;
                }
                if (state === 'victory' && stateTimer > 0.6) {
                    score = 0;
                    loadLevel(0, false);
                    return;
                }
                if (state === 'gameover' && stateTimer > 0.6) {
                    loadLevel(levelIdx, false);
                    return;
                }
                if (state === 'aim' && !cueScratched) {
                    dragging = true;
                    dragStart = { x, y };
                    dragCurr = { x, y };
                }
            },
            onPointerMove(x, y) {
                if (dragging) dragCurr = { x, y };
            },
            onPointerUp(x, y) {
                if (!dragging) return;
                dragCurr = { x, y };
                dragging = false;
                const aim = getAimVector();
                if (aim && state === 'aim') {
                    shotsLeft--;
                    shotSunkCount = 0;
                    shotTimer = 0;
                    state = 'moving';
                    M.Body.setVelocity(cueBall, { x: aim.vx, y: aim.vy });
                    fx.burst(cueBall.position.x, cueBall.position.y, PAL.sky, 10, 1, 3.2, 0.28, 2.2);
                    playSfx(ctx, 'shootPlasma', 0.1);
                    syncHud();
                }
            },
            onPointerCancel() {
                dragging = false;
            }
        }, ctx);

        loadLevel(levelIdx, false);

        const loop = createLoop(ctx, canvas, (dtMs) => {
            const dtSec = dtMs * 0.001;
            fx.update(dtSec);

            if (state === 'cleared' || state === 'victory' || state === 'gameover') {
                stateTimer += dtSec;
                return;
            }
            if (state !== 'moving') return;

            shotTimer += dtSec;
            M.Engine.update(engine, dtMs);

            // Wormhole pocket checks
            for (let i = targetBalls.length - 1; i >= 0; i--) {
                const tb = targetBalls[i];
                for (let p = 0; p < pockets.length; p++) {
                    if (dist(tb.position.x, tb.position.y, pockets[p].x, pockets[p].y) < 25) {
                        shotSunkCount++;
                        const pts = 300 * shotSunkCount;
                        score += pts;
                        const col = tb._kind === 'cryo' ? PAL.sky : PAL.violet;
                        fx.burst(pockets[p].x, pockets[p].y, col, 22, 1.5, 4.8, 0.5, 3);
                        fx.ring(pockets[p].x, pockets[p].y, col, 40, 0.38);
                        fx.popup(pockets[p].x, pockets[p].y - 16, `+${pts}`, col);
                        playSfx(ctx, shotSunkCount > 1 ? 'powerup' : 'xpPickup');
                        M.Composite.remove(engine.world, tb);
                        targetBalls.splice(i, 1);
                        syncHud();
                        break;
                    }
                }
            }

            // Cue ball scratch check
            if (!cueScratched && cueBall) {
                for (let p = 0; p < pockets.length; p++) {
                    if (dist(cueBall.position.x, cueBall.position.y, pockets[p].x, pockets[p].y) < 23) {
                        cueScratched = true;
                        score = Math.max(0, score - 100);
                        fx.burst(pockets[p].x, pockets[p].y, PAL.coral, 18, 1.2, 4, 0.45, 2.8);
                        fx.popup(pockets[p].x, pockets[p].y - 16, 'SCRATCH -100', PAL.coral);
                        playSfx(ctx, 'playerHurt');
                        M.Composite.remove(engine.world, cueBall);
                        cueBall = null;
                        break;
                    }
                }
            }

            // Check if all balls came to rest (with rolling low-speed threshold + timeout safety)
            let maxSpd = 0;
            const forceSettle = shotTimer > 8.5;
            const checkBodies = cueBall ? [cueBall, ...targetBalls] : targetBalls;
            for (let i = 0; i < checkBodies.length; i++) {
                const b = checkBodies[i];
                let spd = Math.hypot(b.velocity.x, b.velocity.y);
                if (spd > 0 && spd < 0.55) {
                    M.Body.setVelocity(b, { x: b.velocity.x * 0.89, y: b.velocity.y * 0.89 });
                    spd *= 0.89;
                }
                if (forceSettle || spd < 0.14) {
                    M.Body.setVelocity(b, { x: 0, y: 0 });
                } else {
                    maxSpd = Math.max(maxSpd, spd);
                }
            }

            if (maxSpd === 0) {
                if (cueScratched) spawnCueOrb();
                if (targetBalls.length === 0) {
                    const cfg = TABLES[levelIdx];
                    const shotBonus = shotsLeft * 220;
                    score += 350 + shotBonus;
                    scoreCheckpoint[levelIdx + 1] = score;
                    const stars = shotsLeft >= Math.ceil(cfg.shots * 0.45) ? 3 : (shotsLeft >= 1 ? 2 : 1);
                    fx.popup(MIDX, MIDY, `CLEAR! +${350 + shotBonus}`, PAL.mint);
                    playSfx(ctx, 'levelup');
                    const hitStory = Boolean(ctx.isStory && levelIdx + 1 >= (ctx.chapterTarget || 2));
                    state = (levelIdx >= TABLES.length - 1 || hitStory) ? 'victory' : 'cleared';
                    stateTimer = 0;
                    syncHud();
                    if ((state === 'victory' || hitStory) && !reportedEnd) {
                        reportedEnd = true;
                        ctx.onWin?.({ score, level: levelIdx + 1, stars });
                    }
                } else if (shotsLeft <= 0) {
                    state = 'gameover';
                    stateTimer = 0;
                    syncHud();
                    if (!reportedEnd) {
                        reportedEnd = true;
                        ctx.onGameOver?.({ score, level: levelIdx + 1, stars: 0, reason: 'Out of cue shots!' });
                    }
                } else {
                    state = 'aim';
                    syncHud();
                }
            }
        }, (g, simTime) => {
            const cfg = TABLES[levelIdx];
            drawSpaceBackdrop(g, stars, simTime, 'rgba(45, 212, 191, 0.08)', 0);

            // Table surface + neon frame
            g.fillStyle = '#0c1626';
            g.strokeStyle = PAL.sky;
            g.lineWidth = 4;
            roundRect(g, TL, TT, TW, TH, 18);
            g.fill();
            g.stroke();

            // Inner felt markings
            g.strokeStyle = 'rgba(56, 189, 248, 0.14)';
            g.lineWidth = 1.2;
            g.strokeRect(TL + 18, TT + 18, TW - 36, TH - 36);
            g.beginPath();
            g.arc(MIDX, MIDY, 55, 0, TAU);
            g.stroke();

            // Wormhole pockets
            for (let i = 0; i < pockets.length; i++) {
                const pk = pockets[i];
                const pGrad = g.createRadialGradient(pk.x, pk.y, 4, pk.x, pk.y, 26);
                pGrad.addColorStop(0, '#020617');
                pGrad.addColorStop(0.65, 'rgba(167, 139, 250, 0.55)');
                pGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
                g.fillStyle = pGrad;
                g.beginPath();
                g.arc(pk.x, pk.y, 26, 0, TAU);
                g.fill();
                drawSprite(g, ctx, 'portal_vortex', pk.x, pk.y, 44, 44, simTime * 2.1 + i, 0.85);
            }

            // Octagonal station pillars
            for (let i = 0; i < pillars.length; i++) {
                drawVerticesBody(g, pillars[i], '#1e293b', PAL.teal, 2.4);
                g.strokeStyle = 'rgba(45, 212, 191, 0.3)';
                g.lineWidth = 1;
                g.beginPath();
                g.arc(pillars[i].position.x, pillars[i].position.y, pillars[i]._r * 0.48, 0, TAU);
                g.stroke();
            }

            // Antimatter target orbs
            for (let i = 0; i < targetBalls.length; i++) {
                const tb = targetBalls[i];
                const isCryo = tb._kind === 'cryo';
                const col = isCryo ? PAL.sky : PAL.violet;
                const spKey = isCryo ? 'cryo_crystal' : 'plasma_bomb';
                g.fillStyle = isCryo ? 'rgba(56, 189, 248, 0.25)' : 'rgba(167, 139, 250, 0.25)';
                g.beginPath();
                g.arc(tb.position.x, tb.position.y, 17, 0, TAU);
                g.fill();
                if (!drawSprite(g, ctx, spKey, tb.position.x, tb.position.y, 28, 28, tb.angle)) {
                    g.fillStyle = col;
                    g.beginPath();
                    g.arc(tb.position.x, tb.position.y, 13, 0, TAU);
                    g.fill();
                }
                g.strokeStyle = col;
                g.lineWidth = 1.6;
                g.beginPath();
                g.arc(tb.position.x, tb.position.y, 14, 0, TAU);
                g.stroke();
            }

            // Aim guide with cushion / orb / pillar ricochet preview
            if (dragging && state === 'aim' && cueBall) {
                const aim = getAimVector();
                if (aim) {
                    const cx = cueBall.position.x;
                    const cy = cueBall.position.y;
                    const maxRay = 260 + aim.power * 180;
                    const minX = TL + 14;
                    const maxX = TR - 14;
                    const minY = TT + 14;
                    const maxY = TB - 14;

                    let hitT = maxRay;
                    let hitType = 'none';
                    let bounceNx = 0;
                    let bounceNy = 0;

                    if (aim.nx > 0.0001) {
                        const tx = (maxX - cx) / aim.nx;
                        if (tx > 0 && tx < hitT) { hitT = tx; hitType = 'wall'; bounceNx = -1; bounceNy = 0; }
                    } else if (aim.nx < -0.0001) {
                        const tx = (minX - cx) / aim.nx;
                        if (tx > 0 && tx < hitT) { hitT = tx; hitType = 'wall'; bounceNx = 1; bounceNy = 0; }
                    }
                    if (aim.ny > 0.0001) {
                        const ty = (maxY - cy) / aim.ny;
                        if (ty > 0 && ty < hitT) { hitT = ty; hitType = 'wall'; bounceNx = 0; bounceNy = -1; }
                    } else if (aim.ny < -0.0001) {
                        const ty = (minY - cy) / aim.ny;
                        if (ty > 0 && ty < hitT) { hitT = ty; hitType = 'wall'; bounceNx = 0; bounceNy = 1; }
                    }

                    const checkCircs = [];
                    for (let i = 0; i < targetBalls.length; i++) {
                        checkCircs.push({ x: targetBalls[i].position.x, y: targetBalls[i].position.y, r: 28, isOrb: true });
                    }
                    for (let i = 0; i < pillars.length; i++) {
                        checkCircs.push({ x: pillars[i].position.x, y: pillars[i].position.y, r: (pillars[i]._r || 28) + 14, isOrb: false });
                    }
                    for (let i = 0; i < checkCircs.length; i++) {
                        const c = checkCircs[i];
                        const ocx = cx - c.x;
                        const ocy = cy - c.y;
                        const bProj = ocx * aim.nx + ocy * aim.ny;
                        const cDist = ocx * ocx + ocy * ocy - c.r * c.r;
                        const disc = bProj * bProj - cDist;
                        if (disc >= 0) {
                            const tHit = -bProj - Math.sqrt(disc);
                            if (tHit > 0 && tHit < hitT) {
                                hitT = tHit;
                                hitType = c.isOrb ? 'orb' : 'pillar';
                            }
                        }
                    }

                    const hx = cx + aim.nx * hitT;
                    const hy = cy + aim.ny * hitT;

                    g.save();
                    g.strokeStyle = PAL.mint;
                    g.setLineDash([6, 6]);
                    g.lineWidth = 2;
                    g.beginPath();
                    g.moveTo(cx, cy);
                    g.lineTo(hx, hy);
                    g.stroke();

                    if (hitType === 'wall') {
                        const rnx = bounceNx !== 0 ? -aim.nx : aim.nx;
                        const rny = bounceNy !== 0 ? -aim.ny : aim.ny;
                        const rem = Math.min(130, maxRay - hitT);
                        if (rem > 14) {
                            g.strokeStyle = 'rgba(45, 212, 191, 0.52)';
                            g.beginPath();
                            g.moveTo(hx, hy);
                            g.lineTo(hx + rnx * rem, hy + rny * rem);
                            g.stroke();
                        }
                    } else if (hitType === 'orb' || hitType === 'pillar') {
                        g.setLineDash([]);
                        g.strokeStyle = hitType === 'orb' ? 'rgba(248, 250, 252, 0.5)' : 'rgba(245, 158, 11, 0.5)';
                        g.lineWidth = 1.5;
                        g.beginPath();
                        g.arc(hx, hy, 14, 0, TAU);
                        g.stroke();
                    }
                    g.setLineDash([]);

                    // Pullback stick
                    g.strokeStyle = PAL.amber;
                    g.lineWidth = 3.5;
                    g.beginPath();
                    g.moveTo(cx - aim.nx * 20, cy - aim.ny * 20);
                    g.lineTo(cx - aim.nx * (24 + aim.power * 90), cy - aim.ny * (24 + aim.power * 90));
                    g.stroke();
                    g.restore();
                    drawPill(g, cx, cy - 34, `POWER ${Math.round(aim.power * 100)}%`, PAL.mint, 'center');
                }
            }

            // Cue orb
            if (cueBall) {
                const cGrad = g.createRadialGradient(cueBall.position.x - 4, cueBall.position.y - 4, 2, cueBall.position.x, cueBall.position.y, 14);
                cGrad.addColorStop(0, '#ffffff');
                cGrad.addColorStop(0.7, '#e2e8f0');
                cGrad.addColorStop(1, '#38bdf8');
                g.fillStyle = cGrad;
                g.beginPath();
                g.arc(cueBall.position.x, cueBall.position.y, 14, 0, TAU);
                g.fill();
                g.strokeStyle = '#ffffff';
                g.lineWidth = 1.5;
                g.stroke();
            }

            fx.render(g);

            drawPill(g, 16, 14, `TABLE ${levelIdx + 1}/${TABLES.length}: ${cfg.name.toUpperCase()}`, PAL.sky, 'left');
            drawPill(g, W - 16, 14, `SHOTS ${shotsLeft}  ·  ORBS ${targetBalls.length}  ·  SCORE ${score}`, shotsLeft <= 1 ? PAL.coral : PAL.mint, 'right');

            if (state === 'aim') {
                drawPill(g, W * 0.5, H - 24, 'DRAG BACK FROM ANYWHERE TO AIM & STRIKE CUE ORB', PAL.muted, 'center');
            }

            if (state === 'cleared') {
                drawBanner(g, `TABLE ${levelIdx + 1} CLEARED!`, `Score: ${score} · Remaining Shot Bonus: +${shotsLeft * 220}`, 'CLICK OR PRESS [SPACE] FOR NEXT TABLE', PAL.mint);
            } else if (state === 'victory') {
                drawBanner(g, 'NEBULA BILLIARDS MASTER!', `All 8 Tables Cleared · Total Score: ${score}`, 'CLICK OR PRESS [SPACE] TO PLAY AGAIN', PAL.amber);
            } else if (state === 'gameover') {
                drawBanner(g, 'OUT OF CUE SHOTS', `Table ${levelIdx + 1}: ${cfg.name} · Score: ${score}`, 'CLICK OR PRESS [SPACE] TO RETRY TABLE', PAL.coral);
            }
        });

        return {
            restart(level) {
                if (level !== undefined && level !== null) {
                    const target = clamp(Math.floor(Number(level) || 1) - 1, 0, TABLES.length - 1);
                    const advancing = state === 'cleared' && target === levelIdx + 1;
                    loadLevel(target, advancing);
                } else {
                    score = 0;
                    loadLevel(0, false);
                }
            },
            destroy() {
                loop.destroy();
                input.destroy();
                destroyMatterEngine(engine);
            }
        };
    };

    // =========================================================================
    // GAME 5: cargo-tower-balance (Endless precision stacker)
    // =========================================================================
    ENGINES['cargo-tower-balance'] = function mountCargoTower(ctx) {
        const M = getMatter();
        const canvas = ctx.createCanvas('2d');
        const stars = createStars(805, 95);
        const fx = createFxSystem();

        const BARGE_Y = 472;
        const BARGE_W = 284;
        const CRATE_W = 58;
        const CRATE_H = 42;

        let engine = null;
        let barge = null;
        let craneAnchor = { x: W * 0.5, y: 45 };
        let craneCable = null;
        let activeCrate = null;
        let crates = [];
        let score = 0;
        let droppedCount = 0;
        let stackHeight = 0;
        let multiplier = 1;
        let bestHeight = 0;
        let cranePhase = 0;
        let cameraY = 0;
        let dropCooldown = 0;
        let state = 'playing'; // playing | gameover
        let stateTimer = 0;
        let reportedEnd = false;

        function syncHud() {
            pushHud(ctx, {
                score,
                level: multiplier,
                maxLevel: 10,
                lives: Math.max(0, 3 - droppedCount),
                statusText: state === 'gameover'
                    ? '3 CRATES LOST!'
                    : `HEIGHT ${stackHeight} · ${multiplier}x MULT · DROPS ${droppedCount}/3`,
                objectiveText: 'Press [Space / Click] to drop swinging crates · Milestones at 5, 10, 15...'
            });
        }

        function spawnHeldCrate() {
            const topWorldY = cameraY + 42;
            craneAnchor.y = topWorldY;
            const crate = M.Bodies.rectangle(craneAnchor.x, topWorldY + 62, CRATE_W, CRATE_H, {
                friction: 0.9,
                frictionStatic: 0.95,
                restitution: 0.04,
                density: 0.0022,
                frictionAir: 0.015,
                label: 'crate'
            });
            crate._landed = false;
            crate._settleSec = 0;
            crate._lost = false;
            crate._hitBarge = false;
            craneCable = M.Constraint.create({
                pointA: craneAnchor,
                bodyB: crate,
                pointB: { x: 0, y: -CRATE_H * 0.45 },
                length: 58,
                stiffness: 0.9,
                damping: 0.08
            });
            M.Composite.add(engine.world, [crate, craneCable]);
            activeCrate = crate;
            crates.push(crate);
        }

        function initRun() {
            score = 0;
            droppedCount = 0;
            stackHeight = 0;
            multiplier = 1;
            bestHeight = 0;
            cranePhase = 0;
            cameraY = 0;
            dropCooldown = 0;
            crates = [];
            activeCrate = null;
            craneCable = null;
            state = 'playing';
            stateTimer = 0;
            reportedEnd = false;
            fx.clear();

            destroyMatterEngine(engine);
            engine = createMatterEngine(0, 0.55);

            // Floating balanced station barge held by twin thruster springs
            barge = M.Bodies.rectangle(W * 0.5, BARGE_Y, BARGE_W, 24, {
                friction: 0.95,
                frictionStatic: 1.0,
                restitution: 0.02,
                density: 0.012,
                frictionAir: 0.09,
                label: 'barge'
            });

            const leftSpring = M.Constraint.create({
                pointA: { x: W * 0.5 - BARGE_W * 0.42, y: BARGE_Y },
                bodyB: barge,
                pointB: { x: -BARGE_W * 0.42, y: 0 },
                length: 0,
                stiffness: 0.048,
                damping: 0.22
            });
            const rightSpring = M.Constraint.create({
                pointA: { x: W * 0.5 + BARGE_W * 0.42, y: BARGE_Y },
                bodyB: barge,
                pointB: { x: BARGE_W * 0.42, y: 0 },
                length: 0,
                stiffness: 0.048,
                damping: 0.22
            });

            M.Composite.add(engine.world, [barge, leftSpring, rightSpring]);

            M.Events.on(engine, 'collisionStart', (ev) => {
                for (let i = 0; i < ev.pairs.length; i++) {
                    const p = ev.pairs[i];
                    const a = p.bodyA;
                    const b = p.bodyB;
                    if ((a.label === 'crate' || b.label === 'crate') && (a.label === 'barge' || b.label === 'barge' || (a.label === 'crate' && b.label === 'crate'))) {
                        const hitCrates = [];
                        if (a.label === 'crate' && a !== activeCrate) hitCrates.push(a);
                        if (b.label === 'crate' && b !== activeCrate) hitCrates.push(b);
                        for (let k = 0; k < hitCrates.length; k++) {
                            const c = hitCrates[k];
                            const firstTouch = !c._hitBarge;
                            c._hitBarge = true;
                            if (firstTouch || Math.abs(c.velocity.y) > 0.75) {
                                fx.burst(c.position.x, c.position.y + CRATE_H * 0.45, PAL.amber, 6, 0.8, 2.6, 0.24, 1.8);
                            }
                        }
                        playSfx(ctx, 'hitMetal', 0.12);
                    }
                }
            });

            spawnHeldCrate();
            syncHud();
        }

        function releaseCrate() {
            if (state !== 'playing' || !activeCrate || !craneCable || dropCooldown > 0) return;
            M.Composite.remove(engine.world, craneCable);
            craneCable = null;
            activeCrate = null;
            dropCooldown = 0.7;
            playSfx(ctx, 'dash', 0.12);
        }

        const input = createInput(canvas, {
            onKeyDown(code, e, first) {
                if (state === 'gameover' && stateTimer > 0.6 && (code === 'Space' || code === 'Enter' || code === 'KeyR')) {
                    initRun();
                    return;
                }
                if (code === 'Space' && first) releaseCrate();
            },
            onPointerDown() {
                if (state === 'gameover' && stateTimer > 0.6) {
                    initRun();
                    return;
                }
                releaseCrate();
            }
        }, ctx);

        initRun();

        const loop = createLoop(ctx, canvas, (dtMs) => {
            const dtSec = dtMs * 0.001;
            fx.update(dtSec);

            if (state === 'gameover') {
                stateTimer += dtSec;
                return;
            }

            // Oscillate crane across top with speed scaling gently by height
            const swingSpeed = 1.45 + Math.min(stackHeight * 0.055, 1.3);
            cranePhase += dtSec * swingSpeed;
            const swingRange = 175 + Math.min(stackHeight * 3, 55);
            craneAnchor.x = W * 0.5 + Math.sin(cranePhase) * swingRange;
            craneAnchor.y = cameraY + 42;

            // Keep barge horizontally centered while preserving real tilt & vertical bounce
            const bargeVy = barge.velocity.y;
            M.Body.setPosition(barge, { x: W * 0.5, y: barge.position.y });
            M.Body.setVelocity(barge, { x: 0, y: bargeVy });
            M.Body.setAngularVelocity(barge, barge.angularVelocity * 0.94);

            M.Engine.update(engine, dtMs);

            let topY = BARGE_Y;
            let settledCount = 0;

            for (let i = crates.length - 1; i >= 0; i--) {
                const c = crates[i];
                if (c === activeCrate) continue;

                // Check dropped off barge
                if (!c._lost && (c.position.y > Math.max(BARGE_Y + 115, cameraY + H + 90) || c.position.x < -60 || c.position.x > W + 60)) {
                    c._lost = true;
                    droppedCount++;
                    const fxY = clamp(c.position.y, cameraY + 70, Math.min(BARGE_Y - 20, cameraY + H - 45));
                    fx.burst(clamp(c.position.x, 40, W - 40), fxY, PAL.coral, 20, 1.5, 4.8, 0.5, 3);
                    fx.popup(clamp(c.position.x, 80, W - 80), fxY - 14, `LOST (${droppedCount}/3)`, PAL.coral);
                    playSfx(ctx, 'explodeSmall');
                    M.Composite.remove(engine.world, c);
                    crates.splice(i, 1);

                    if (droppedCount >= 3) {
                        state = 'gameover';
                        stateTimer = 0;
                        syncHud();
                        if (!reportedEnd) {
                            reportedEnd = true;
                            const stars = bestHeight >= 15 ? 3 : (bestHeight >= 10 ? 2 : (bestHeight >= 5 ? 1 : 0));
                            ctx.onGameOver?.({ score, level: multiplier, stars, reason: '3 Cargo Crates fell off the barge!' });
                        }
                        return;
                    }
                    syncHud();
                    continue;
                }

                const spd = Math.hypot(c.velocity.x, c.velocity.y);
                if (c._hitBarge && spd < 0.45 && c.position.y < BARGE_Y + 15) {
                    c._settleSec += dtSec;
                    if (!c._landed && c._settleSec >= 0.25) {
                        c._landed = true;
                        const pts = 100 * multiplier;
                        score += pts;
                        fx.popup(c.position.x, c.position.y - 24, `+${pts}`, PAL.mint);
                        playSfx(ctx, 'xpPickup', 0.1);
                    }
                }
                if (c._landed) {
                    settledCount++;
                    topY = Math.min(topY, c.position.y - CRATE_H * 0.5);
                }
            }

            if (settledCount !== stackHeight) {
                stackHeight = settledCount;
                bestHeight = Math.max(bestHeight, stackHeight);
                const newMult = 1 + Math.floor(stackHeight / 5);
                if (newMult > multiplier) {
                    multiplier = newMult;
                    score += 300 * multiplier;
                    fx.popup(W * 0.5, cameraY + 140, `HEIGHT ${stackHeight}! ${multiplier}x MULTIPLIER!`, PAL.amber);
                    playSfx(ctx, 'levelup');
                }
                syncHud();
            }

            // Smooth camera pan upward as tower grows
            const desiredCamY = Math.min(0, topY - 260);
            cameraY = lerp(cameraY, desiredCamY, 0.08);

            if (dropCooldown > 0) {
                dropCooldown -= dtSec;
                if (dropCooldown <= 0 && !activeCrate && state === 'playing') {
                    spawnHeldCrate();
                }
            }
        }, (g, simTime) => {
            drawSpaceBackdrop(g, stars, simTime, 'rgba(245, 158, 11, 0.08)', 80);

            g.save();
            g.translate(0, -cameraY);

            // Height milestone lines (5, 10, 15, 20...)
            for (let m = 5; m <= Math.max(15, stackHeight + 5); m += 5) {
                const my = BARGE_Y - 12 - m * CRATE_H;
                g.strokeStyle = 'rgba(245, 158, 11, 0.26)';
                g.setLineDash([8, 8]);
                g.lineWidth = 1.2;
                g.beginPath();
                g.moveTo(40, my);
                g.lineTo(W - 40, my);
                g.stroke();
                g.setLineDash([]);
                g.fillStyle = PAL.amber;
                g.font = '600 11px "JetBrains Mono", monospace';
                g.textAlign = 'left';
                g.fillText(`HEIGHT ${m} (${1 + m / 5}x)`, 48, my - 5);
            }

            // Barge thruster plumes
            const leftTipX = barge.position.x - Math.cos(barge.angle) * (BARGE_W * 0.4);
            const leftTipY = barge.position.y - Math.sin(barge.angle) * (BARGE_W * 0.4) + 12;
            const rightTipX = barge.position.x + Math.cos(barge.angle) * (BARGE_W * 0.4);
            const rightTipY = barge.position.y + Math.sin(barge.angle) * (BARGE_W * 0.4) + 12;
            const flicker = 12 + Math.sin(simTime * 28) * 5;
            g.fillStyle = 'rgba(56, 189, 248, 0.45)';
            g.beginPath();
            g.moveTo(leftTipX - 10, leftTipY);
            g.lineTo(leftTipX + 10, leftTipY);
            g.lineTo(leftTipX, leftTipY + flicker);
            g.moveTo(rightTipX - 10, rightTipY);
            g.lineTo(rightTipX + 10, rightTipY);
            g.lineTo(rightTipX, rightTipY + flicker);
            g.fill();

            // Station Barge
            drawVerticesBody(g, barge, '#1e293b', PAL.sky, 2.5);

            // Crane rail & trolley
            g.strokeStyle = '#475569';
            g.lineWidth = 3;
            g.beginPath();
            g.moveTo(120, craneAnchor.y);
            g.lineTo(W - 120, craneAnchor.y);
            g.stroke();
            g.fillStyle = PAL.amber;
            roundRect(g, craneAnchor.x - 18, craneAnchor.y - 8, 36, 16, 4);
            g.fill();

            if (craneCable && activeCrate) {
                g.strokeStyle = PAL.sky;
                g.lineWidth = 2;
                g.beginPath();
                g.moveTo(craneAnchor.x, craneAnchor.y);
                g.lineTo(activeCrate.position.x, activeCrate.position.y - CRATE_H * 0.4);
                g.stroke();

                // Vertical drop alignment laser & landing target tick
                const ax = activeCrate.position.x;
                const startY = activeCrate.position.y + CRATE_H * 0.52;
                let targetY = barge.position.y - 12;
                for (let i = 0; i < crates.length; i++) {
                    const other = crates[i];
                    if (other === activeCrate) continue;
                    if (Math.abs(other.position.x - ax) < CRATE_W * 0.92) {
                        targetY = Math.min(targetY, other.position.y - CRATE_H * 0.5);
                    }
                }
                if (targetY > startY + 8) {
                    g.save();
                    g.strokeStyle = 'rgba(56, 189, 248, 0.34)';
                    g.setLineDash([5, 6]);
                    g.lineWidth = 1.5;
                    g.beginPath();
                    g.moveTo(ax, startY);
                    g.lineTo(ax, targetY);
                    g.stroke();
                    g.setLineDash([]);
                    g.strokeStyle = 'rgba(45, 212, 191, 0.7)';
                    g.lineWidth = 2;
                    g.beginPath();
                    g.moveTo(ax - CRATE_W * 0.44, targetY);
                    g.lineTo(ax + CRATE_W * 0.44, targetY);
                    g.stroke();
                    g.restore();
                }
            }

            // Crates
            for (let i = 0; i < crates.length; i++) {
                const c = crates[i];
                drawVerticesBody(g, c, '#1e293b', c._landed ? PAL.mint : PAL.amber, 2);
                drawSprite(g, ctx, 'cargo_crate', c.position.x, c.position.y, CRATE_W - 4, CRATE_H - 4, c.angle);
            }

            fx.render(g);
            g.restore();

            // Fixed screen HUD
            const tiltDeg = Math.round(Math.abs(barge.angle) * (180 / Math.PI));
            drawPill(g, 16, 14, `STACK ${stackHeight} (BEST ${bestHeight})  ·  MULT ${multiplier}x`, PAL.mint, 'left');
            drawPill(g, W - 16, 14, `SCORE ${score}  ·  BARGE TILT ${tiltDeg}°  ·  LIVES ${Math.max(0, 3 - droppedCount)}/3`, droppedCount >= 2 ? PAL.coral : PAL.sky, 'right');

            if (state === 'playing') {
                drawPill(g, W * 0.5, H - 30, '[SPACE / CLICK] RELEASE CARGO CRATE · COUNTERBALANCE THE BARGE', PAL.muted, 'center');
            } else {
                drawBanner(g, 'CARGO TOWER COLLAPSED', `Final Score: ${score} · Peak Height: ${bestHeight} (${multiplier}x)`, 'CLICK OR PRESS [SPACE] FOR NEW BARGE', PAL.coral);
            }
        });

        return {
            restart() {
                initRun();
            },
            destroy() {
                loop.destroy();
                input.destroy();
                destroyMatterEngine(engine);
            }
        };
    };

    // =========================================================================
    // GAME 6: magnetic-tether-swing (6 sector courses)
    // =========================================================================
    ENGINES['magnetic-tether-swing'] = function mountMagneticTether(ctx) {
        const M = getMatter();
        const canvas = ctx.createCanvas('2d');
        const stars = createStars(906, 110);
        const fx = createFxSystem();

        const COURSES = [
            {
                name: 'Tether Training Bay', length: 2250, gravity: 0.34,
                buoys: [{ x: 430, y: 120 }, { x: 780, y: 115 }, { x: 1130, y: 125 }, { x: 1500, y: 115 }, { x: 1850, y: 125 }],
                blocks: [],
                coins: [{ x: 605, y: 270 }, { x: 960, y: 260 }, { x: 1320, y: 265 }, { x: 1680, y: 255 }]
            },
            {
                name: 'Cryo Chasm', length: 2450, gravity: 0.36,
                buoys: [{ x: 420, y: 120 }, { x: 770, y: 105 }, { x: 1150, y: 130 }, { x: 1540, y: 110 }, { x: 1920, y: 120 }],
                blocks: [{ x: 950, y: 375, r: 34 }, { x: 1710, y: 360, r: 36 }],
                coins: [{ x: 590, y: 245 }, { x: 950, y: 225 }, { x: 1345, y: 270 }, { x: 1710, y: 215 }]
            },
            {
                name: 'Reactor Slalom', length: 2650, gravity: 0.38,
                buoys: [{ x: 430, y: 110 }, { x: 790, y: 135 }, { x: 1180, y: 105 }, { x: 1560, y: 130 }, { x: 1950, y: 110 }, { x: 2280, y: 125 }],
                blocks: [{ x: 610, y: 190, r: 30 }, { x: 1365, y: 355, r: 36 }, { x: 2110, y: 190, r: 32 }],
                coins: [{ x: 610, y: 325 }, { x: 985, y: 250 }, { x: 1365, y: 210 }, { x: 1755, y: 260 }]
            },
            {
                name: 'Orbital Crane Run', length: 2850, gravity: 0.39,
                buoys: [{ x: 420, y: 120 }, { x: 800, y: 110 }, { x: 1210, y: 125 }, { x: 1610, y: 105 }, { x: 2010, y: 125 }, { x: 2420, y: 115 }],
                blocks: [{ x: 600, y: 370, r: 34 }, { x: 1010, y: 185, r: 32 }, { x: 1410, y: 370, r: 36 }, { x: 1810, y: 190, r: 32 }, { x: 2220, y: 365, r: 34 }],
                coins: [{ x: 600, y: 235 }, { x: 1010, y: 325 }, { x: 1410, y: 230 }, { x: 2220, y: 225 }]
            },
            {
                name: 'Plasma Void Express', length: 3050, gravity: 0.41,
                buoys: [{ x: 410, y: 115 }, { x: 810, y: 105 }, { x: 1230, y: 125 }, { x: 1650, y: 105 }, { x: 2080, y: 120 }, { x: 2490, y: 110 }, { x: 2760, y: 125 }],
                blocks: [{ x: 615, y: 180, r: 30 }, { x: 1020, y: 350, r: 38 }, { x: 1440, y: 195, r: 32 }, { x: 1865, y: 350, r: 38 }, { x: 2285, y: 185, r: 32 }],
                coins: [{ x: 615, y: 325 }, { x: 1020, y: 205 }, { x: 1865, y: 205 }, { x: 2630, y: 250 }]
            },
            {
                name: 'Hyperion Airlock', length: 3250, gravity: 0.42,
                buoys: [{ x: 415, y: 115 }, { x: 825, y: 100 }, { x: 1255, y: 125 }, { x: 1685, y: 100 }, { x: 2115, y: 125 }, { x: 2545, y: 105 }, { x: 2910, y: 120 }],
                blocks: [
                    { x: 625, y: 355, r: 38 }, { x: 1040, y: 175, r: 32 },
                    { x: 1470, y: 355, r: 38 }, { x: 1900, y: 180, r: 34 },
                    { x: 2330, y: 355, r: 38 }, { x: 2730, y: 190, r: 32 }
                ],
                coins: [{ x: 625, y: 215 }, { x: 1040, y: 320 }, { x: 1470, y: 215 }, { x: 2330, y: 215 }, { x: 2730, y: 325 }]
            }
        ];

        const TETHER_RANGE = 390;

        let engine = null;
        let levelIdx = clamp((Number(ctx.level || ctx.startLevel || 1) || 1) - 1, 0, COURSES.length - 1);
        let score = 0;
        const scoreCheckpoint = [0];
        let lives = 3;
        let astro = null;
        let tether = null;
        let attachedBuoy = null;
        let buoys = [];
        let blocks = [];
        let coins = [];
        let airlock = null;
        let cameraX = 0;
        let launched = false;
        let holdTether = false;
        let state = 'ready'; // ready | swing | respawn_wait | cleared | victory | gameover
        let stateTimer = 0;
        let sectorTime = 0;
        let hitsInSector = 0;
        let reportedEnd = false;

        function syncHud() {
            const cfg = COURSES[levelIdx];
            const pct = astro ? Math.round(clamp(astro.position.x / (cfg.length - 110), 0, 1) * 100) : 0;
            pushHud(ctx, {
                score,
                level: levelIdx + 1,
                maxLevel: COURSES.length,
                lives,
                statusText: state === 'gameover'
                    ? 'PLASMA FLOOR IMPACT'
                    : (attachedBuoy ? `SWINGING · ${pct}%` : `SOARING · ${pct}%`),
                objectiveText: `${cfg.name} · Hold [Space / Mouse] to tether Anchor Buoys · Reach Airlock`
            });
        }

        function detachTether() {
            if (tether && engine) {
                M.Composite.remove(engine.world, tether);
                playSfx(ctx, 'dash', 0.14);
            }
            tether = null;
            attachedBuoy = null;
        }

        function findNearestBuoy() {
            if (!astro) return null;
            let best = null;
            let bestScore = Infinity;
            for (let i = 0; i < buoys.length; i++) {
                const b = buoys[i];
                const d = dist(astro.position.x, astro.position.y, b.x, b.y);
                if (d <= TETHER_RANGE) {
                    // Prefer buoys ahead or overhead
                    const penalty = b.x < astro.position.x - 95 ? 160 : 0;
                    if (d + penalty < bestScore) {
                        bestScore = d + penalty;
                        best = b;
                    }
                }
            }
            return best;
        }

        function tryAttachTether() {
            if (tether || !astro || state !== 'swing') return;
            const target = findNearestBuoy();
            if (!target) return;
            const d = dist(astro.position.x, astro.position.y, target.x, target.y);
            const maxSafeLen = Math.max(58, 458 - target.y);
            tether = M.Constraint.create({
                bodyA: astro,
                pointB: { x: target.x, y: target.y },
                length: clamp(d * 0.85, 52, maxSafeLen),
                stiffness: 0.55,
                damping: 0.05
            });
            attachedBuoy = target;
            M.Composite.add(engine.world, tether);
            fx.ring(target.x, target.y, PAL.sky, 34, 0.25);
            playSfx(ctx, 'shootLaser', 0.12);
        }

        function spawnAstro() {
            holdTether = false;
            detachTether();
            if (astro && engine) M.Composite.remove(engine.world, astro);
            astro = M.Bodies.circle(95, 290, 15, {
                frictionAir: 0.003,
                restitution: 0.4,
                friction: 0.05,
                density: 0.002,
                label: 'astro'
            });
            M.Body.setVelocity(astro, { x: 0, y: 0 });
            M.Composite.add(engine.world, astro);
            launched = false;
            cameraX = 0;
        }

        function launchAstro() {
            if (launched || state !== 'ready') return;
            launched = true;
            state = 'swing';
            M.Body.setVelocity(astro, { x: 5.5, y: -4.2 });
            fx.burst(astro.position.x, astro.position.y, PAL.sky, 16, 1.5, 4.5, 0.35, 2.8);
            playSfx(ctx, 'dash');
            syncHud();
        }

        function loadLevel(idx, preserveScore, keepLives) {
            levelIdx = clamp(idx, 0, COURSES.length - 1);
            if (!preserveScore) {
                score = scoreCheckpoint[levelIdx] || 0;
            } else {
                scoreCheckpoint[levelIdx] = score;
            }
            if (!keepLives) lives = 3;
            const cfg = COURSES[levelIdx];
            state = 'ready';
            stateTimer = 0;
            sectorTime = 0;
            hitsInSector = 0;
            holdTether = false;
            reportedEnd = false;
            fx.clear();

            destroyMatterEngine(engine);
            engine = createMatterEngine(0, cfg.gravity);

            buoys = cfg.buoys.map((b, i) => ({ x: b.x, y: b.y, idx: i }));

            const startDeck = M.Bodies.rectangle(95, 326, 150, 20, { isStatic: true, label: 'deck' });
            const ceiling = M.Bodies.rectangle(cfg.length * 0.5, -18, cfg.length + 200, 30, { isStatic: true, restitution: 0.5, label: 'ceiling' });
            const endWall = M.Bodies.rectangle(cfg.length + 20, H * 0.5, 40, H, { isStatic: true, label: 'wall' });

            blocks = cfg.blocks.map((bl) => {
                const body = M.Bodies.circle(bl.x, bl.y, bl.r, {
                    isStatic: true,
                    restitution: 0.72,
                    label: 'asteroid'
                });
                body._r = bl.r;
                return body;
            });

            coins = cfg.coins.map((c) => {
                const body = M.Bodies.circle(c.x, c.y, 14, { isStatic: true, isSensor: true, label: 'coin' });
                return { x: c.x, y: c.y, collected: false, body };
            });

            airlock = M.Bodies.rectangle(cfg.length - 95, 275, 44, 130, {
                isStatic: true,
                isSensor: true,
                label: 'airlock'
            });

            M.Composite.add(engine.world, [startDeck, ceiling, endWall, ...blocks, ...coins.map(c => c.body), airlock]);

            M.Events.on(engine, 'collisionStart', (ev) => {
                if (state !== 'swing') return;
                for (let i = 0; i < ev.pairs.length; i++) {
                    const pair = ev.pairs[i];
                    const other = pair.bodyA === astro ? pair.bodyB : (pair.bodyB === astro ? pair.bodyA : null);
                    if (!other) continue;
                    if (other.label === 'airlock') {
                        completeCourse();
                        return;
                    }
                    if (other.label === 'coin') {
                        for (let k = 0; k < coins.length; k++) {
                            if (coins[k].body === other && !coins[k].collected) {
                                coins[k].collected = true;
                                score += 150;
                                fx.burst(coins[k].x, coins[k].y, PAL.amber, 16, 1.4, 4.2, 0.4, 2.8);
                                fx.popup(coins[k].x, coins[k].y - 16, '+150', PAL.amber);
                                playSfx(ctx, 'xpPickup');
                                break;
                            }
                        }
                    } else if (other.label === 'asteroid') {
                        fx.burst(astro.position.x, astro.position.y, PAL.sky, 10, 1.2, 3.6, 0.25, 2.4);
                        playSfx(ctx, 'hitMetal', 0.14);
                    }
                }
            });

            spawnAstro();
            syncHud();
        }

        function hitPlasmaFloor() {
            if (state !== 'swing') return;
            holdTether = false;
            detachTether();
            hitsInSector++;
            lives--;
            fx.burst(astro.position.x, Math.min(astro.position.y, 488), PAL.coral, 30, 1.8, 6, 0.55, 3.4);
            fx.popup(astro.position.x, 450, 'PLASMA BURN!', PAL.coral);
            playSfx(ctx, 'playerHurt');
            M.Body.setStatic(astro, true);

            if (lives <= 0) {
                state = 'gameover';
                stateTimer = 0;
                syncHud();
                if (!reportedEnd) {
                    reportedEnd = true;
                    ctx.onGameOver?.({ score, level: levelIdx + 1, stars: 0, reason: 'Astronaut dropped into plasma floor!' });
                }
            } else {
                state = 'respawn_wait';
                stateTimer = 0.7;
                syncHud();
            }
        }

        function completeCourse() {
            if (state !== 'swing') return;
            detachTether();
            const clearBonus = 500 + levelIdx * 150;
            score += clearBonus;
            scoreCheckpoint[levelIdx + 1] = score;
            const stars = hitsInSector === 0 ? 3 : (hitsInSector === 1 ? 2 : 1);
            fx.burst(airlock.position.x, airlock.position.y, PAL.mint, 32, 2, 6, 0.65, 3.2);
            fx.popup(airlock.position.x - 40, airlock.position.y - 40, `AIRLOCK +${clearBonus}`, PAL.mint);
            playSfx(ctx, 'levelup');
            M.Body.setStatic(astro, true);
            const hitStory = Boolean(ctx.isStory && levelIdx + 1 >= (ctx.chapterTarget || 2));
            state = (levelIdx >= COURSES.length - 1 || hitStory) ? 'victory' : 'cleared';
            stateTimer = 0;
            syncHud();
            if ((state === 'victory' || hitStory) && !reportedEnd) {
                reportedEnd = true;
                ctx.onWin?.({ score, level: levelIdx + 1, stars });
            }
        }

        const input = createInput(canvas, {
            onKeyDown(code, e, first) {
                if (state === 'cleared' && stateTimer > 0.55 && (code === 'Space' || code === 'Enter')) {
                    loadLevel(levelIdx + 1, true, true);
                    return;
                }
                if (state === 'victory' && stateTimer > 0.6 && (code === 'Space' || code === 'Enter')) {
                    score = 0;
                    loadLevel(0, false, false);
                    return;
                }
                if (state === 'gameover' && stateTimer > 0.6 && (code === 'Space' || code === 'Enter' || code === 'KeyR')) {
                    loadLevel(levelIdx, false, false);
                    return;
                }
                if (code === 'KeyR' && (state === 'ready' || state === 'swing')) {
                    loadLevel(levelIdx, false, true);
                    return;
                }
                if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW') {
                    holdTether = true;
                    if (state === 'ready') launchAstro();
                    else if (first) tryAttachTether();
                }
            },
            onKeyUp(code) {
                if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW') {
                    holdTether = false;
                    detachTether();
                }
            },
            onPointerDown() {
                if (state === 'cleared' && stateTimer > 0.55) {
                    loadLevel(levelIdx + 1, true, true);
                    return;
                }
                if (state === 'victory' && stateTimer > 0.6) {
                    score = 0;
                    loadLevel(0, false, false);
                    return;
                }
                if (state === 'gameover' && stateTimer > 0.6) {
                    loadLevel(levelIdx, false, false);
                    return;
                }
                holdTether = true;
                if (state === 'ready') launchAstro();
                else tryAttachTether();
            },
            onPointerUp() {
                holdTether = false;
                detachTether();
            },
            onPointerCancel() {
                holdTether = false;
                detachTether();
            }
        }, ctx);

        loadLevel(levelIdx, false, false);
        let hudTimer = 0;
        let thrustSfxCd = 0;

        const loop = createLoop(ctx, canvas, (dtMs) => {
            const dtSec = dtMs * 0.001;
            fx.update(dtSec);
            if (thrustSfxCd > 0) thrustSfxCd = Math.max(0, thrustSfxCd - dtSec);

            if (state === 'cleared' || state === 'victory' || state === 'gameover') {
                stateTimer += dtSec;
                return;
            }
            if (state === 'respawn_wait') {
                stateTimer -= dtSec;
                if (stateTimer <= 0) {
                    state = 'ready';
                    spawnAstro();
                    syncHud();
                }
                return;
            }
            if (state === 'ready') return;

            const cfg = COURSES[levelIdx];
            sectorTime += dtSec;

            if (holdTether && !tether) {
                tryAttachTether();
            }

            // Slight forward pendulum swing assist when tethered & slow, plus bidirectional EVA micro-trim
            if (tether && astro.velocity.x < 4.5) {
                M.Body.applyForce(astro, astro.position, { x: 0.00018 * astro.mass, y: 0 });
            }
            if (input.any(['ArrowRight', 'KeyD'])) {
                M.Body.applyForce(astro, astro.position, { x: 0.00016 * astro.mass, y: 0 });
                fx.jet(astro.position.x - 14, astro.position.y, Math.PI, PAL.sky, 1, 2.2);
            } else if (input.any(['ArrowLeft', 'KeyA'])) {
                M.Body.applyForce(astro, astro.position, { x: -0.00012 * astro.mass, y: 0 });
                fx.jet(astro.position.x + 14, astro.position.y, 0, PAL.amber, 1, 2.0);
            }

            M.Engine.update(engine, dtMs);

            // Clamp extreme grapple speed
            const spd = Math.hypot(astro.velocity.x, astro.velocity.y);
            if (spd > 13.5) {
                const k = 13.5 / spd;
                M.Body.setVelocity(astro, { x: astro.velocity.x * k, y: astro.velocity.y * k });
            }

            cameraX = clamp(astro.position.x - 245, 0, Math.max(0, cfg.length - W));

            if (astro.position.x >= airlock.position.x - 28) {
                completeCourse();
                return;
            }
            if (astro.position.y >= 488 || astro.position.x < -30) {
                hitPlasmaFloor();
                return;
            }

            hudTimer += dtSec;
            if (hudTimer >= 0.16) {
                hudTimer = 0;
                syncHud();
            }
        }, (g, simTime) => {
            const cfg = COURSES[levelIdx];
            drawSpaceBackdrop(g, stars, simTime, 'rgba(56, 189, 248, 0.09)', 0);

            g.save();
            g.translate(-cameraX, 0);

            // Plasma floor along the abyss
            const pGrad = g.createLinearGradient(0, 474, 0, H);
            pGrad.addColorStop(0, 'rgba(251, 113, 133, 0)');
            pGrad.addColorStop(0.35, 'rgba(251, 113, 133, 0.45)');
            pGrad.addColorStop(1, 'rgba(225, 29, 72, 0.92)');
            g.fillStyle = pGrad;
            g.fillRect(cameraX, 474, W, H - 474);

            g.strokeStyle = PAL.coral;
            g.lineWidth = 2.5;
            g.beginPath();
            for (let x = Math.floor(cameraX / 20) * 20; x <= cameraX + W + 20; x += 20) {
                const wy = 492 + Math.sin(x * 0.05 + simTime * 7) * 4;
                if (x === Math.floor(cameraX / 20) * 20) g.moveTo(x, wy);
                else g.lineTo(x, wy);
            }
            g.stroke();

            // Launch Deck
            g.fillStyle = '#1e293b';
            g.strokeStyle = PAL.sky;
            g.lineWidth = 2;
            roundRect(g, 20, 316, 150, 20, 5);
            g.fill();
            g.stroke();

            // Asteroid mid-air obstacles
            for (let i = 0; i < blocks.length; i++) {
                const b = blocks[i];
                if (!drawSprite(g, ctx, 'asteroid', b.position.x, b.position.y, b._r * 2.1, b._r * 2.1, simTime * 0.25 + i)) {
                    g.fillStyle = '#334155';
                    g.strokeStyle = PAL.muted;
                    g.beginPath();
                    g.arc(b.position.x, b.position.y, b._r, 0, TAU);
                    g.fill();
                    g.stroke();
                }
            }

            // Star coins
            for (let i = 0; i < coins.length; i++) {
                if (coins[i].collected) continue;
                drawSprite(g, ctx, 'coin_star', coins[i].x, coins[i].y + Math.sin(simTime * 4 + i) * 3, 26, 26, simTime * 1.5);
            }

            // Overhead Anchor Buoys + nearest target highlight
            const candidate = !tether && state === 'swing' ? findNearestBuoy() : null;
            for (let i = 0; i < buoys.length; i++) {
                const b = buoys[i];
                const isTarget = b === attachedBuoy || b === candidate;
                if (isTarget) {
                    g.strokeStyle = b === attachedBuoy ? 'rgba(52, 211, 153, 0.55)' : 'rgba(56, 189, 248, 0.35)';
                    g.setLineDash([4, 5]);
                    g.lineWidth = 1.4;
                    g.beginPath();
                    g.arc(b.x, b.y, 28, 0, TAU);
                    g.stroke();
                    g.setLineDash([]);
                }
                if (!drawSprite(g, ctx, 'warp_ring', b.x, b.y, 38, 38, simTime * 1.4 + i)) {
                    g.strokeStyle = PAL.sky;
                    g.lineWidth = 3;
                    g.beginPath();
                    g.arc(b.x, b.y, 14, 0, TAU);
                    g.stroke();
                }
            }

            // Dotted lock-on indicator to nearest reachable buoy
            if (candidate && astro) {
                g.save();
                g.strokeStyle = 'rgba(56, 189, 248, 0.34)';
                g.setLineDash([4, 6]);
                g.lineWidth = 1.6;
                g.beginPath();
                g.moveTo(astro.position.x, astro.position.y);
                g.lineTo(candidate.x, candidate.y);
                g.stroke();
                g.restore();
            }

            // Active Matter.Constraint Magnetic Tether Beam
            if (tether && attachedBuoy && astro) {
                g.save();
                g.strokeStyle = PAL.sky;
                g.lineWidth = 3;
                g.beginPath();
                g.moveTo(astro.position.x, astro.position.y);
                g.lineTo(attachedBuoy.x, attachedBuoy.y);
                g.stroke();
                g.strokeStyle = '#ffffff';
                g.lineWidth = 1.1;
                g.stroke();
                for (let n = 0; n < 3; n++) {
                    const tNode = ((simTime * 1.9 + n / 3) % 1);
                    const nx = lerp(astro.position.x, attachedBuoy.x, tNode);
                    const ny = lerp(astro.position.y, attachedBuoy.y, tNode);
                    g.fillStyle = PAL.mint;
                    g.beginPath();
                    g.arc(nx, ny, 3, 0, TAU);
                    g.fill();
                }
                g.restore();
            }

            // Airlock Gate on right
            const ax = airlock.position.x;
            const ay = airlock.position.y;
            g.fillStyle = 'rgba(52, 211, 153, 0.16)';
            g.strokeStyle = PAL.mint;
            g.lineWidth = 3;
            roundRect(g, ax - 22, ay - 65, 44, 130, 10);
            g.fill();
            g.stroke();
            drawSprite(g, ctx, 'portal_vortex', ax, ay, 72, 72, simTime * 2);

            // Astronaut
            if (astro && state !== 'respawn_wait') {
                const tilt = clamp(astro.velocity.x * 0.05, -0.4, 0.45);
                if (!drawSprite(g, ctx, 'astronaut', astro.position.x, astro.position.y, 38, 38, tilt)) {
                    g.fillStyle = PAL.text;
                    g.beginPath();
                    g.arc(astro.position.x, astro.position.y, 15, 0, TAU);
                    g.fill();
                }
            }

            fx.render(g);
            g.restore();

            drawPill(g, 16, 14, `SECTOR ${levelIdx + 1}/${COURSES.length}: ${cfg.name.toUpperCase()}`, PAL.sky, 'left');
            drawPill(g, W - 16, 14, `LIVES ${lives}  ·  SCORE ${score}`, lives === 1 ? PAL.coral : PAL.mint, 'right');

            if (state === 'ready') {
                drawPill(g, W * 0.5, H - 36, 'PRESS [SPACE / CLICK] TO LAUNCH & HOLD TO MAGNETIC-SWING!', PAL.mint, 'center');
            } else if (state === 'swing') {
                drawPill(g, W * 0.5, H - 36, 'HOLD [SPACE / MOUSE] TO GRAPPLE BUOYS · RELEASE TO SOAR', PAL.muted, 'center');
            }

            if (state === 'cleared') {
                drawBanner(g, `SECTOR ${levelIdx + 1} AIRLOCK REACHED!`, `Score: ${score}`, 'CLICK OR PRESS [SPACE] FOR NEXT SECTOR', PAL.mint);
            } else if (state === 'victory') {
                drawBanner(g, 'ALL 6 TETHER COURSES CLEARED!', `Final Score: ${score}`, 'CLICK OR PRESS [SPACE] TO PLAY AGAIN', PAL.amber);
            } else if (state === 'gameover') {
                drawBanner(g, 'PLASMA ABYSS FAILURE', `Sector ${levelIdx + 1}: ${cfg.name} · Score: ${score}`, 'CLICK OR PRESS [SPACE] TO RETRY SECTOR', PAL.coral);
            }
        });

        return {
            restart(level) {
                if (level !== undefined && level !== null) {
                    const target = clamp(Math.floor(Number(level) || 1) - 1, 0, COURSES.length - 1);
                    const advancing = state === 'cleared' && target === levelIdx + 1;
                    loadLevel(target, advancing, advancing);
                } else {
                    score = 0;
                    loadLevel(0, false, false);
                }
            },
            destroy() {
                loop.destroy();
                input.destroy();
                destroyMatterEngine(engine);
            }
        };
    };

    // =========================================================================
    // GAME 7: gravity-golf-parsec (8 orbital mini-golf holes)
    // =========================================================================
    ENGINES['gravity-golf-parsec'] = function mountGravityGolf(ctx) {
        const M = getMatter();
        const canvas = ctx.createCanvas('2d');
        const stars = createStars(1007, 95);
        const fx = createFxSystem();

        const HOLES = [
            {
                name: 'Lunar Straightaway', par: 2,
                tee: { x: 145, y: 270 }, cup: { x: 805, y: 270 },
                islands: [{ x: 470, y: 200, w: 40, h: 120, a: 0 }],
                bumpers: [{ x: 470, y: 355, r: 22 }],
                winds: [],
                gravs: []
            },
            {
                name: 'Asteroid Dogleg', par: 3,
                tee: { x: 145, y: 405 }, cup: { x: 785, y: 140 },
                islands: [
                    { x: 420, y: 315, w: 26, h: 250, a: 0 },
                    { x: 790, y: 65, w: 120, h: 22, a: 0.65 }
                ],
                bumpers: [{ x: 250, y: 155, r: 24 }],
                winds: [],
                gravs: []
            },
            {
                name: 'Gravity Curve', par: 3,
                tee: { x: 135, y: 270 }, cup: { x: 815, y: 270 },
                islands: [{ x: 470, y: 270, w: 32, h: 185, a: 0 }],
                bumpers: [],
                winds: [],
                gravs: [{ x: 470, y: 130, r: 135, strength: 13500 }]
            },
            {
                name: 'Repulsor Chute', par: 3,
                tee: { x: 135, y: 150 }, cup: { x: 810, y: 390 },
                islands: [{ x: 480, y: 260, w: 280, h: 26, a: 0 }],
                bumpers: [{ x: 770, y: 145, r: 22 }],
                winds: [{ x: 640, y: 110, w: 130, h: 290, fx: 0, fy: 0.00055 }],
                gravs: []
            },
            {
                name: 'Pinball Ricochet', par: 4,
                tee: { x: 130, y: 270 }, cup: { x: 825, y: 270 },
                islands: [
                    { x: 355, y: 140, w: 26, h: 170, a: 0 },
                    { x: 355, y: 400, w: 26, h: 170, a: 0 },
                    { x: 625, y: 270, w: 26, h: 190, a: 0 }
                ],
                bumpers: [{ x: 490, y: 170, r: 22 }, { x: 490, y: 370, r: 22 }, { x: 490, y: 270, r: 20 }],
                winds: [],
                gravs: []
            },
            {
                name: 'Binary Slalom', par: 4,
                tee: { x: 130, y: 385 }, cup: { x: 825, y: 165 },
                islands: [
                    { x: 355, y: 360, w: 26, h: 210, a: 0 },
                    { x: 610, y: 180, w: 26, h: 210, a: 0 }
                ],
                bumpers: [{ x: 485, y: 270, r: 22 }],
                winds: [],
                gravs: [
                    { x: 355, y: 140, r: 120, strength: 11500 },
                    { x: 610, y: 390, r: 120, strength: 11500 }
                ]
            },
            {
                name: 'Vortex Island', par: 4,
                tee: { x: 140, y: 410 }, cup: { x: 800, y: 145 },
                islands: [
                    { x: 430, y: 275, w: 180, h: 28, a: -0.45 },
                    { x: 690, y: 315, w: 28, h: 195, a: 0 }
                ],
                bumpers: [{ x: 255, y: 145, r: 24 }],
                winds: [{ x: 120, y: 195, w: 185, h: 95, fx: 0.0005, fy: 0 }],
                gravs: [{ x: 785, y: 150, r: 110, strength: 8500 }]
            },
            {
                name: 'Parsec Championship', par: 5,
                tee: { x: 125, y: 270 }, cup: { x: 830, y: 270 },
                islands: [
                    { x: 310, y: 200, w: 24, h: 160, a: 0.32 },
                    { x: 525, y: 340, w: 24, h: 175, a: -0.28 },
                    { x: 705, y: 175, w: 24, h: 150, a: 0 }
                ],
                bumpers: [{ x: 425, y: 140, r: 22 }, { x: 635, y: 415, r: 22 }],
                winds: [{ x: 380, y: 395, w: 160, h: 75, fx: 0.00055, fy: -0.00018 }],
                gravs: [
                    { x: 470, y: 250, r: 115, strength: 10500 },
                    { x: 775, y: 270, r: 95, strength: 7500 }
                ]
            }
        ];

        const COURSE_L = 46;
        const COURSE_T = 56;
        const COURSE_R = W - 46;
        const COURSE_B = H - 46;

        let engine = null;
        let levelIdx = clamp((Number(ctx.level || ctx.startLevel || 1) || 1) - 1, 0, HOLES.length - 1);
        let totalScore = 0;
        const scoreCheckpoint = [0];
        let totalStrokes = 0;
        let totalPar = 0;
        let strokes = 0;
        let maxStrokes = 7;
        let lives = 3;
        let golfBall = null;
        let islands = [];
        let bumpers = [];
        let state = 'aim'; // aim | rolling | cleared | victory | gameover
        let stateTimer = 0;
        let rollTimer = 0;
        let dragging = false;
        let dragStart = { x: 0, y: 0 };
        let dragCurr = { x: 0, y: 0 };
        let reportedEnd = false;

        function syncHud() {
            const cfg = HOLES[levelIdx];
            const rel = totalStrokes - totalPar;
            const relStr = rel === 0 ? 'E' : (rel > 0 ? `+${rel}` : `${rel}`);
            pushHud(ctx, {
                score: totalScore,
                level: levelIdx + 1,
                maxLevel: HOLES.length,
                lives,
                statusText: `STROKE ${strokes}/${maxStrokes} (PAR ${cfg.par}) · TOTAL ${relStr}`,
                objectiveText: `${cfg.name} · Drag aim into Black-Hole Flag Cup under Par`
            });
        }

        function loadLevel(idx, preserveTotals) {
            levelIdx = clamp(idx, 0, HOLES.length - 1);
            if (!preserveTotals) {
                totalScore = scoreCheckpoint[levelIdx] || 0;
                if (levelIdx === 0) {
                    totalStrokes = 0;
                    totalPar = 0;
                    lives = 3;
                }
            } else {
                scoreCheckpoint[levelIdx] = totalScore;
            }
            const cfg = HOLES[levelIdx];
            strokes = 0;
            maxStrokes = cfg.par + 4;
            state = 'aim';
            stateTimer = 0;
            rollTimer = 0;
            dragging = false;
            reportedEnd = false;
            fx.clear();

            destroyMatterEngine(engine);
            engine = createMatterEngine(0, 0);

            const walls = [
                M.Bodies.rectangle(W * 0.5, COURSE_T - 12, W, 24, { isStatic: true, restitution: 0.86, friction: 0.01, label: 'wall' }),
                M.Bodies.rectangle(W * 0.5, COURSE_B + 12, W, 24, { isStatic: true, restitution: 0.86, friction: 0.01, label: 'wall' }),
                M.Bodies.rectangle(COURSE_L - 12, H * 0.5, 24, H, { isStatic: true, restitution: 0.86, friction: 0.01, label: 'wall' }),
                M.Bodies.rectangle(COURSE_R + 12, H * 0.5, 24, H, { isStatic: true, restitution: 0.86, friction: 0.01, label: 'wall' })
            ];

            islands = cfg.islands.map((is) => M.Bodies.rectangle(is.x, is.y, is.w, is.h, {
                isStatic: true,
                angle: is.a || 0,
                restitution: 0.84,
                friction: 0.02,
                label: 'island'
            }));

            bumpers = cfg.bumpers.map((bp) => {
                const b = M.Bodies.circle(bp.x, bp.y, bp.r, {
                    isStatic: true,
                    restitution: 1.45,
                    label: 'bumper'
                });
                b._r = bp.r;
                b._flash = 0;
                return b;
            });

            golfBall = M.Bodies.circle(cfg.tee.x, cfg.tee.y, 9, {
                frictionAir: 0.019,
                friction: 0.02,
                restitution: 0.84,
                density: 0.002,
                label: 'golfball'
            });

            M.Composite.add(engine.world, [...walls, ...islands, ...bumpers, golfBall]);

            M.Events.on(engine, 'collisionStart', (ev) => {
                for (let i = 0; i < ev.pairs.length; i++) {
                    const p = ev.pairs[i];
                    const other = p.bodyA === golfBall ? p.bodyB : (p.bodyB === golfBall ? p.bodyA : null);
                    if (!other) continue;
                    if (other.label === 'bumper') {
                        other._flash = 1;
                        const dx = golfBall.position.x - other.position.x;
                        const dy = golfBall.position.y - other.position.y;
                        const d = Math.hypot(dx, dy) || 1;
                        M.Body.setVelocity(golfBall, { x: (dx / d) * 7.8, y: (dy / d) * 7.8 });
                        fx.burst(golfBall.position.x, golfBall.position.y, PAL.amber, 8, 1.2, 3.6, 0.28, 2.2);
                        fx.ring(other.position.x, other.position.y, PAL.amber, 30, 0.25);
                        playSfx(ctx, 'hitShield', 0.14);
                    } else {
                        const spd = Math.hypot(golfBall.velocity.x, golfBall.velocity.y);
                        if (spd > 1.2) {
                            fx.burst(golfBall.position.x, golfBall.position.y, PAL.sky, 5, 0.7, 2.2, 0.2, 1.6);
                        }
                        playSfx(ctx, 'hitMetal', 0.14);
                    }
                }
            });

            syncHud();
        }

        function getPuttVector() {
            if (!golfBall) return null;
            const nearBall = Math.hypot(dragStart.x - golfBall.position.x, dragStart.y - golfBall.position.y) <= 38;
            if (nearBall && Math.hypot(dragCurr.x - dragStart.x, dragCurr.y - dragStart.y) < 8) return null;
            const origin = nearBall ? golfBall.position : dragStart;
            const dx = origin.x - dragCurr.x;
            const dy = origin.y - dragCurr.y;
            const d = Math.hypot(dx, dy);
            if (d < 12) return null;
            const pull = Math.min(d, 155);
            const speed = (pull / 155) * 16.5;
            return {
                vx: (dx / d) * speed,
                vy: (dy / d) * speed,
                nx: dx / d,
                ny: dy / d,
                power: pull / 155
            };
        }

        function sinkBall() {
            if (state !== 'rolling') return;
            const cfg = HOLES[levelIdx];
            totalStrokes += strokes;
            totalPar += cfg.par;

            const diff = strokes - cfg.par;
            let label = 'PAR';
            let holePts = 400;
            if (strokes === 1) { label = 'HOLE IN ONE!'; holePts = 1000; }
            else if (diff <= -2) { label = 'EAGLE!'; holePts = 750; }
            else if (diff === -1) { label = 'BIRDIE!'; holePts = 550; }
            else if (diff === 1) { label = 'BOGEY'; holePts = 250; }
            else if (diff >= 2) { label = `+${diff} OVER PAR`; holePts = 150; }

            totalScore += holePts;
            scoreCheckpoint[levelIdx + 1] = totalScore;

            const stars = strokes <= cfg.par - 1 ? 3 : (strokes <= cfg.par ? 2 : 1);
            fx.burst(cfg.cup.x, cfg.cup.y, PAL.mint, 28, 1.5, 5, 0.6, 3);
            fx.ring(cfg.cup.x, cfg.cup.y, PAL.mint, 52, 0.45);
            fx.popup(cfg.cup.x, cfg.cup.y - 26, `${label} +${holePts}`, PAL.mint);
            playSfx(ctx, 'levelup');

            M.Body.setVelocity(golfBall, { x: 0, y: 0 });
            M.Body.setPosition(golfBall, { x: cfg.cup.x, y: cfg.cup.y });
            const hitStory = Boolean(ctx.isStory && levelIdx + 1 >= (ctx.chapterTarget || 2));
            state = (levelIdx >= HOLES.length - 1 || hitStory) ? 'victory' : 'cleared';
            stateTimer = 0;
            syncHud();
            if ((state === 'victory' || hitStory) && !reportedEnd) {
                reportedEnd = true;
                ctx.onWin?.({ score: totalScore, level: levelIdx + 1, stars });
            }
        }

        const input = createInput(canvas, {
            onKeyDown(code) {
                if (state === 'cleared' && stateTimer > 0.55 && (code === 'Space' || code === 'Enter')) {
                    loadLevel(levelIdx + 1, true);
                } else if (state === 'victory' && stateTimer > 0.6 && (code === 'Space' || code === 'Enter')) {
                    totalScore = 0;
                    loadLevel(0, false);
                } else if (state === 'gameover' && stateTimer > 0.6 && (code === 'Space' || code === 'Enter' || code === 'KeyR')) {
                    loadLevel(levelIdx, false);
                } else if (code === 'KeyR' && state === 'aim') {
                    loadLevel(levelIdx, true);
                }
            },
            onPointerDown(x, y) {
                if (state === 'cleared' && stateTimer > 0.55) {
                    loadLevel(levelIdx + 1, true);
                    return;
                }
                if (state === 'victory' && stateTimer > 0.6) {
                    totalScore = 0;
                    loadLevel(0, false);
                    return;
                }
                if (state === 'gameover' && stateTimer > 0.6) {
                    loadLevel(levelIdx, false);
                    return;
                }
                if (state === 'aim') {
                    dragging = true;
                    dragStart = { x, y };
                    dragCurr = { x, y };
                }
            },
            onPointerMove(x, y) {
                if (dragging) dragCurr = { x, y };
            },
            onPointerUp(x, y) {
                if (!dragging) return;
                dragCurr = { x, y };
                dragging = false;
                const putt = getPuttVector();
                if (putt && state === 'aim') {
                    strokes++;
                    rollTimer = 0;
                    state = 'rolling';
                    M.Body.setVelocity(golfBall, { x: putt.vx, y: putt.vy });
                    fx.burst(golfBall.position.x, golfBall.position.y, PAL.sky, 9, 1, 3, 0.25, 2.2);
                    playSfx(ctx, 'shootLaser', 0.14);
                    syncHud();
                }
            },
            onPointerCancel() {
                dragging = false;
            }
        }, ctx);

        loadLevel(levelIdx, false);

        const loop = createLoop(ctx, canvas, (dtMs) => {
            const dtSec = dtMs * 0.001;
            fx.update(dtSec);

            for (let i = 0; i < bumpers.length; i++) {
                bumpers[i]._flash = Math.max(0, bumpers[i]._flash - dtSec * 4.5);
            }

            if (state === 'cleared' || state === 'victory' || state === 'gameover') {
                stateTimer += dtSec;
                return;
            }
            if (state !== 'rolling') return;

            rollTimer += dtSec;
            const cfg = HOLES[levelIdx];
            const bx = golfBall.position.x;
            const by = golfBall.position.y;

            // Repulsor wind zones
            for (let i = 0; i < cfg.winds.length; i++) {
                const wz = cfg.winds[i];
                if (bx >= wz.x && bx <= wz.x + wz.w && by >= wz.y && by <= wz.y + wz.h) {
                    M.Body.applyForce(golfBall, golfBall.position, {
                        x: wz.fx * golfBall.mass,
                        y: wz.fy * golfBall.mass
                    });
                }
            }

            // Subtle planet gravity pockets (smooth inner core falloff + orbit decay to prevent trapped loops)
            let inGrav = false;
            for (let i = 0; i < cfg.gravs.length; i++) {
                const gp = cfg.gravs[i];
                const dx = gp.x - bx;
                const dy = gp.y - by;
                const d = Math.hypot(dx, dy);
                if (d < gp.r) {
                    inGrav = true;
                    if (d > 16) {
                        const coreFade = clamp((d - 16) / 22, 0, 1);
                        const mag = coreFade * 0.00038 * golfBall.mass * gp.strength / Math.max(1200, d * d);
                        M.Body.applyForce(golfBall, golfBall.position, { x: (dx / d) * mag, y: (dy / d) * mag });
                    }
                }
            }

            M.Engine.update(engine, dtMs);

            if (inGrav) {
                const gSpd = Math.hypot(golfBall.velocity.x, golfBall.velocity.y);
                if (gSpd < 4.5) {
                    M.Body.setVelocity(golfBall, {
                        x: golfBall.velocity.x * 0.985,
                        y: golfBall.velocity.y * 0.985
                    });
                }
            }

            // Black-Hole Flag Cup capture check
            const cupD = dist(golfBall.position.x, golfBall.position.y, cfg.cup.x, cfg.cup.y);
            let spd = Math.hypot(golfBall.velocity.x, golfBall.velocity.y);
            if (cupD < 19 && spd < 5.6) {
                sinkBall();
                return;
            }
            // Subtle event horizon lip-pull near hole
            if (cupD < 28 && cupD > 2) {
                const pull = 0.00045 * golfBall.mass;
                M.Body.applyForce(golfBall, golfBall.position, {
                    x: ((cfg.cup.x - golfBall.position.x) / cupD) * pull,
                    y: ((cfg.cup.y - golfBall.position.y) / cupD) * pull
                });
            }

            // Crisp low-velocity rolling friction + timeout safety so slow balls don't creep endlessly
            if (spd > 0 && spd < 0.50) {
                M.Body.setVelocity(golfBall, { x: golfBall.velocity.x * 0.89, y: golfBall.velocity.y * 0.89 });
                spd *= 0.89;
            }

            if (spd < 0.14 || rollTimer > 9.0) {
                M.Body.setVelocity(golfBall, { x: 0, y: 0 });
                if (strokes >= maxStrokes) {
                    lives--;
                    if (lives <= 0) {
                        state = 'gameover';
                        stateTimer = 0;
                        syncHud();
                        if (!reportedEnd) {
                            reportedEnd = true;
                            ctx.onGameOver?.({ score: totalScore, level: levelIdx + 1, stars: 0, reason: 'Exceeded max strokes on hole!' });
                        }
                    } else {
                        fx.popup(golfBall.position.x, golfBall.position.y - 18, 'MAX STROKES · MULLIGAN RESET', PAL.coral);
                        playSfx(ctx, 'playerHurt');
                        loadLevel(levelIdx, true);
                    }
                } else {
                    state = 'aim';
                    syncHud();
                }
            }
        }, (g, simTime) => {
            const cfg = HOLES[levelIdx];
            drawSpaceBackdrop(g, stars, simTime, 'rgba(52, 211, 153, 0.08)', 0);

            // Orbital green course deck
            g.fillStyle = '#0c1824';
            g.strokeStyle = PAL.mint;
            g.lineWidth = 3;
            roundRect(g, COURSE_L, COURSE_T, COURSE_R - COURSE_L, COURSE_B - COURSE_T, 14);
            g.fill();
            g.stroke();

            // Gravity pockets
            for (let i = 0; i < cfg.gravs.length; i++) {
                const gp = cfg.gravs[i];
                const gGrad = g.createRadialGradient(gp.x, gp.y, 4, gp.x, gp.y, gp.r);
                gGrad.addColorStop(0, 'rgba(167, 139, 250, 0.34)');
                gGrad.addColorStop(1, 'rgba(167, 139, 250, 0)');
                g.fillStyle = gGrad;
                g.beginPath();
                g.arc(gp.x, gp.y, gp.r, 0, TAU);
                g.fill();

                g.strokeStyle = 'rgba(167, 139, 250, 0.35)';
                g.setLineDash([4, 6]);
                g.lineWidth = 1.2;
                g.beginPath();
                g.arc(gp.x, gp.y, gp.r * 0.65, 0, TAU);
                g.stroke();
                g.setLineDash([]);
            }

            // Repulsor wind zones
            for (let i = 0; i < cfg.winds.length; i++) {
                const wz = cfg.winds[i];
                g.fillStyle = 'rgba(56, 189, 248, 0.12)';
                g.strokeStyle = 'rgba(56, 189, 248, 0.35)';
                g.lineWidth = 1.2;
                g.fillRect(wz.x, wz.y, wz.w, wz.h);
                g.strokeRect(wz.x, wz.y, wz.w, wz.h);

                // Animated wind chevrons
                const ang = Math.atan2(wz.fy, wz.fx);
                const off = (simTime * 48) % 36;
                g.strokeStyle = PAL.sky;
                g.lineWidth = 1.8;
                for (let gx = wz.x + 24; gx < wz.x + wz.w - 12; gx += 42) {
                    for (let gy = wz.y + 24; gy < wz.y + wz.h - 12; gy += 42) {
                        const px = gx + Math.cos(ang) * (off - 18);
                        const py = gy + Math.sin(ang) * (off - 18);
                        g.save();
                        g.translate(px, py);
                        g.rotate(ang);
                        g.beginPath();
                        g.moveTo(-5, -5);
                        g.lineTo(3, 0);
                        g.lineTo(-5, 5);
                        g.stroke();
                        g.restore();
                    }
                }
            }

            // Floating obstacle islands
            for (let i = 0; i < islands.length; i++) {
                drawVerticesBody(g, islands[i], '#1e293b', PAL.sky, 2);
            }

            // Energy bumpers
            for (let i = 0; i < bumpers.length; i++) {
                const bp = bumpers[i];
                const r = bp._r * (1 + bp._flash * 0.2);
                g.fillStyle = bp._flash > 0.1 ? 'rgba(245, 158, 11, 0.45)' : 'rgba(245, 158, 11, 0.16)';
                g.beginPath();
                g.arc(bp.position.x, bp.position.y, r + 4, 0, TAU);
                g.fill();
                if (!drawSprite(g, ctx, 'energy_prism', bp.position.x, bp.position.y, r * 2, r * 2, simTime + i)) {
                    g.fillStyle = PAL.amber;
                    g.beginPath();
                    g.arc(bp.position.x, bp.position.y, r, 0, TAU);
                    g.fill();
                }
                g.strokeStyle = PAL.amber;
                g.lineWidth = 2;
                g.beginPath();
                g.arc(bp.position.x, bp.position.y, r, 0, TAU);
                g.stroke();
            }

            // Tee marker
            g.strokeStyle = 'rgba(226, 232, 240, 0.35)';
            g.lineWidth = 1.5;
            g.beginPath();
            g.arc(cfg.tee.x, cfg.tee.y, 14, 0, TAU);
            g.stroke();

            // Black-Hole Flag Cup
            const cx = cfg.cup.x;
            const cy = cfg.cup.y;
            const cGrad = g.createRadialGradient(cx, cy, 3, cx, cy, 24);
            cGrad.addColorStop(0, '#000000');
            cGrad.addColorStop(0.65, 'rgba(52, 211, 153, 0.5)');
            cGrad.addColorStop(1, 'rgba(52, 211, 153, 0)');
            g.fillStyle = cGrad;
            g.beginPath();
            g.arc(cx, cy, 24, 0, TAU);
            g.fill();
            g.fillStyle = '#020617';
            g.strokeStyle = PAL.mint;
            g.lineWidth = 2;
            g.beginPath();
            g.arc(cx, cy, 14, 0, TAU);
            g.fill();
            g.stroke();

            // Flagpole
            g.strokeStyle = '#e2e8f0';
            g.lineWidth = 2;
            g.beginPath();
            g.moveTo(cx, cy);
            g.lineTo(cx, cy - 38);
            g.stroke();
            g.fillStyle = PAL.coral;
            g.beginPath();
            g.moveTo(cx, cy - 38);
            g.lineTo(cx + 22, cy - 31 + Math.sin(simTime * 6) * 2);
            g.lineTo(cx, cy - 23);
            g.closePath();
            g.fill();

            // Aim ray with wind/gravity curved trajectory preview
            if (dragging && state === 'aim' && golfBall) {
                const putt = getPuttVector();
                if (putt) {
                    const gx = golfBall.position.x;
                    const gy = golfBall.position.y;
                    const simDtSq = (1000 / 60) * (1000 / 60);
                    let sx = gx;
                    let sy = gy;
                    let svx = putt.vx;
                    let svy = putt.vy;

                    g.save();
                    const steps = Math.round(14 + putt.power * 18);
                    for (let step = 0; step < steps; step++) {
                        let ax = 0;
                        let ay = 0;
                        for (let i = 0; i < cfg.winds.length; i++) {
                            const wz = cfg.winds[i];
                            if (sx >= wz.x && sx <= wz.x + wz.w && sy >= wz.y && sy <= wz.y + wz.h) {
                                ax += wz.fx;
                                ay += wz.fy;
                            }
                        }
                        let inG = false;
                        for (let i = 0; i < cfg.gravs.length; i++) {
                            const gp = cfg.gravs[i];
                            const dx = gp.x - sx;
                            const dy = gp.y - sy;
                            const d = Math.hypot(dx, dy);
                            if (d < gp.r) {
                                inG = true;
                                if (d > 16) {
                                    const coreFade = clamp((d - 16) / 22, 0, 1);
                                    const mag = coreFade * 0.00038 * gp.strength / Math.max(1200, d * d);
                                    ax += (dx / d) * mag;
                                    ay += (dy / d) * mag;
                                }
                            }
                        }
                        svx = svx * 0.981 + ax * simDtSq;
                        svy = svy * 0.981 + ay * simDtSq;
                        if (inG && Math.hypot(svx, svy) < 4.5) {
                            svx *= 0.985;
                            svy *= 0.985;
                        }
                        sx += svx;
                        sy += svy;

                        if (sx < COURSE_L + 9) { sx = COURSE_L + 9; svx = Math.abs(svx) * 0.84; }
                        else if (sx > COURSE_R - 9) { sx = COURSE_R - 9; svx = -Math.abs(svx) * 0.84; }
                        if (sy < COURSE_T + 9) { sy = COURSE_T + 9; svy = Math.abs(svy) * 0.84; }
                        else if (sy > COURSE_B - 9) { sy = COURSE_B - 9; svy = -Math.abs(svy) * 0.84; }

                        let hitBumper = false;
                        for (let i = 0; i < bumpers.length; i++) {
                            if (dist(sx, sy, bumpers[i].position.x, bumpers[i].position.y) <= bumpers[i]._r + 9) {
                                hitBumper = true;
                                break;
                            }
                        }
                        if (hitBumper) break;
                        if (step % 2 === 1) {
                            const alpha = clamp(1 - step / (steps + 2), 0.15, 0.92);
                            g.fillStyle = `rgba(52, 211, 153, ${alpha.toFixed(2)})`;
                            g.beginPath();
                            g.arc(sx, sy, 2.5, 0, TAU);
                            g.fill();
                        }
                        if (dist(sx, sy, cfg.cup.x, cfg.cup.y) < 16) break;
                    }

                    // Pullback indicator behind ball
                    g.strokeStyle = PAL.amber;
                    g.lineWidth = 3;
                    g.beginPath();
                    g.moveTo(gx - putt.nx * 14, gy - putt.ny * 14);
                    g.lineTo(gx - putt.nx * (18 + putt.power * 64), gy - putt.ny * (18 + putt.power * 64));
                    g.stroke();
                    g.restore();
                    drawPill(g, gx, gy - 32, `PUTT ${Math.round(putt.power * 100)}%`, PAL.mint, 'center');
                }
            }

            // Plasma Golf Orb
            if (golfBall) {
                const bGrad = g.createRadialGradient(golfBall.position.x - 2, golfBall.position.y - 2, 1, golfBall.position.x, golfBall.position.y, 9);
                bGrad.addColorStop(0, '#ffffff');
                bGrad.addColorStop(0.65, PAL.sky);
                bGrad.addColorStop(1, '#0369a1');
                g.fillStyle = bGrad;
                g.beginPath();
                g.arc(golfBall.position.x, golfBall.position.y, 9, 0, TAU);
                g.fill();
            }

            fx.render(g);

            drawPill(g, 16, 12, `HOLE ${levelIdx + 1}/${HOLES.length}: ${cfg.name.toUpperCase()}  ·  PAR ${cfg.par}`, PAL.sky, 'left');
            drawPill(g, W - 16, 12, `STROKE ${strokes}/${maxStrokes}  ·  MULLIGANS ${lives}  ·  SCORE ${totalScore}`, PAL.mint, 'right');

            if (state === 'aim') {
                drawPill(g, W * 0.5, H - 30, 'DRAG BACK TO PUTT PLASMA ORB INTO BLACK-HOLE FLAG CUP', PAL.muted, 'center');
            }

            if (state === 'cleared') {
                drawBanner(g, `HOLE ${levelIdx + 1} SUNK!`, `Strokes: ${strokes} (Par ${cfg.par}) · Total Score: ${totalScore}`, 'CLICK OR PRESS [SPACE] FOR NEXT HOLE', PAL.mint);
            } else if (state === 'victory') {
                const rel = totalStrokes - totalPar;
                const relStr = rel === 0 ? 'EVEN PAR' : (rel > 0 ? `+${rel}` : `${rel} UNDER PAR`);
                drawBanner(g, 'PARSEC GOLF CHAMPION!', `Final Score: ${totalScore} · Course: ${relStr}`, 'CLICK OR PRESS [SPACE] TO PLAY AGAIN', PAL.amber);
            } else if (state === 'gameover') {
                drawBanner(g, 'OUT OF MULLIGANS', `Hole ${levelIdx + 1}: ${cfg.name} · Score: ${totalScore}`, 'CLICK OR PRESS [SPACE] TO RETRY HOLE', PAL.coral);
            }
        });

        return {
            restart(level) {
                if (level !== undefined && level !== null) {
                    const target = clamp(Math.floor(Number(level) || 1) - 1, 0, HOLES.length - 1);
                    const advancing = state === 'cleared' && target === levelIdx + 1;
                    loadLevel(target, advancing);
                } else {
                    totalScore = 0;
                    loadLevel(0, false);
                }
            },
            destroy() {
                loop.destroy();
                input.destroy();
                destroyMatterEngine(engine);
            }
        };
    };
})(window);
