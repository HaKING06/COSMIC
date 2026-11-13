// =============================================================================
// COSMIC UNIVERSE v11.0 — PACK 6: TACTICAL, DEFENSE, STRATEGY & MINI-RPG
// Engines:
//   1. tower-defense-bastion   (Story Ch.8 Final Defense, 6 sectors x 6 waves)
//   2. deck-breach-tactics     (Turn-based 6x4 tactical grid + Captain Nova Vex)
//   3. fleet-commander-auto    (3-Lane real-time space tug-of-war, 6 fronts)
//   4. wormhole-roulette-rpg   (8-Node roguelite quantum dice dungeon)
//   5. mining-tycoon-idle      (Cryo-Asteroid refinery + Heat Overdrive x3)
//   6. typing-cipher-defense   (Bilingual EN/TR arcade typing railgun shooter)
// =============================================================================
(function (global) {
    'use strict';

    const W = 960;
    const H = 540;
    const TAU = Math.PI * 2;
    const PAL = {
        bg: '#070b12',
        surface: '#0d1320',
        card: '#131b2c',
        cardAlt: '#182338',
        border: 'rgba(148, 163, 184, 0.22)',
        text: '#e2e8f0',
        muted: '#94a3b8',
        dim: '#64748b',
        sky: '#38bdf8',
        mint: '#34d399',
        amber: '#f59e0b',
        coral: '#fb7185',
        violet: '#a78bfa',
        teal: '#2dd4bf',
        gold: '#facc15'
    };

    const FONT_DISPLAY = "'Space Grotesk', 'Inter', system-ui, sans-serif";
    const FONT_BODY = "'Inter', system-ui, sans-serif";
    const FONT_MONO = "'JetBrains Mono', ui-monospace, Consolas, monospace";

    function clamp(v, lo, hi) {
        return v < lo ? lo : v > hi ? hi : v;
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function dist(x1, y1, x2, y2) {
        return Math.hypot(x2 - x1, y2 - y1);
    }

    function pointInRect(px, py, r) {
        return r && px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
    }

    function segPointDist(ax, ay, bx, by, px, py) {
        const vx = bx - ax;
        const vy = by - ay;
        const lenSq = vx * vx + vy * vy;
        if (lenSq <= 0.0001) return Math.hypot(px - ax, py - ay);
        const t = clamp(((px - ax) * vx + (py - ay) * vy) / lenSq, 0, 1);
        const cx = ax + t * vx;
        const cy = ay + t * vy;
        return Math.hypot(px - cx, py - cy);
    }

    function isDrawable(spr) {
        if (!spr) return false;
        if (typeof spr.naturalWidth === 'number') return spr.complete && spr.naturalWidth > 0;
        return typeof spr.width === 'number' && spr.width > 0;
    }

    function roundRectPath(g, x, y, w, h, r) {
        const rad = Math.min(r || 0, w * 0.5, h * 0.5);
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

    function fmtNum(n) {
        const val = Math.floor(Number(n) || 0);
        if (val >= 1000000) return (val / 1000000).toFixed(2) + 'M';
        if (val >= 10000) return (val / 1000).toFixed(1) + 'K';
        if (val >= 1000) return (val / 1000).toFixed(2) + 'K';
        return String(val);
    }

    // Seeded deterministic PRNG for starfields & sector maps
    function makeRng(seed) {
        let s = (seed >>> 0) || 1337;
        return function () {
            s = (s * 1664525 + 1013904223) >>> 0;
            return s / 4294967296;
        };
    }

    function buildSpaceBackdrop(seed, accentHex, gridMode) {
        const off = typeof document !== 'undefined' && document.createElement ? document.createElement('canvas') : null;
        if (!off) return null;
        off.width = W;
        off.height = H;
        const g = off.getContext('2d');
        if (!g) return null;

        const rng = makeRng(seed);
        g.fillStyle = PAL.bg;
        g.fillRect(0, 0, W, H);

        // Soft ambient nebula clouds
        const n1 = g.createRadialGradient(W * 0.22, H * 0.25, 10, W * 0.22, H * 0.25, 360);
        n1.addColorStop(0, accentHex + '22');
        n1.addColorStop(1, 'transparent');
        g.fillStyle = n1;
        g.fillRect(0, 0, W, H);

        const n2 = g.createRadialGradient(W * 0.80, H * 0.72, 10, W * 0.80, H * 0.72, 340);
        n2.addColorStop(0, 'rgba(167, 139, 250, 0.12)');
        n2.addColorStop(1, 'transparent');
        g.fillStyle = n2;
        g.fillRect(0, 0, W, H);

        // Subtle tactical grid
        if (gridMode !== false) {
            g.strokeStyle = 'rgba(56, 189, 248, 0.045)';
            g.lineWidth = 1;
            const step = 40;
            for (let x = 0; x <= W; x += step) {
                g.beginPath();
                g.moveTo(x + 0.5, 0);
                g.lineTo(x + 0.5, H);
                g.stroke();
            }
            for (let y = 0; y <= H; y += step) {
                g.beginPath();
                g.moveTo(0, y + 0.5);
                g.lineTo(W, y + 0.5);
                g.stroke();
            }
        }

        // Multi-layer static starfield
        for (let i = 0; i < 110; i++) {
            const sx = rng() * W;
            const sy = rng() * H;
            const r = rng() < 0.82 ? 1 : 1.7;
            const a = 0.22 + rng() * 0.55;
            g.fillStyle = i % 11 === 0 ? accentHex : (i % 7 === 0 ? '#cbd5e1' : '#ffffff');
            g.globalAlpha = a;
            g.beginPath();
            g.arc(sx, sy, r, 0, TAU);
            g.fill();
        }
        g.globalAlpha = 1;
        return off;
    }

    // -------------------------------------------------------------------------
    // Shared Canvas Host Engine Wrapper
    // -------------------------------------------------------------------------
    function createEngine(ctx, gameId, setupFn) {
        const canvas = ctx.createCanvas('2d');
        if (canvas.width === 300 && canvas.height === 150) {
            canvas.width = W;
            canvas.height = H;
        }
        const g = canvas.getContext('2d');
        const sprites = (ctx && ctx.sprites) || {};

        let destroyed = false;
        let rafId = 0;
        let lastTs = performance.now();
        let hudCooldown = 0;
        let lastHudJson = '';
        let endedState = null; // null | { type: 'win' | 'over', title, sub, nextLevel }
        let shakeTimer = 0;
        let shakeMag = 0;

        const pointer = { x: W * 0.5, y: H * 0.5, inside: false, down: false };
        const buttons = [];
        const particles = [];
        const floatTexts = [];
        const sparkles = Array.from({ length: 24 }, (_, i) => ({
            x: (i * 197) % W,
            y: (i * 313) % H,
            phase: i * 0.7,
            speed: 1.4 + (i % 5) * 0.4
        }));

        let currentTooltip = null;
        let keyDownHandler = null;
        let keyUpHandler = null;

        function lang() {
            const raw = ctx.lang || (global.CosmicI18n && global.CosmicI18n.getLang && global.CosmicI18n.getLang()) || 'en';
            return String(raw).toLowerCase().startsWith('tr') ? 'tr' : 'en';
        }

        function L(trText, enText) {
            if (ctx && typeof ctx.t === 'function') return ctx.t(trText, enText);
            return lang() === 'tr' ? trText : enText;
        }

        function sfx(key, jitter) {
            try {
                if (ctx && ctx.audio && typeof ctx.audio.play === 'function') {
                    ctx.audio.play(key, jitter);
                }
            } catch (_) { /* safe ignore */ }
        }

        function shake(mag, dur) {
            shakeMag = Math.max(shakeMag, mag || 4);
            shakeTimer = Math.max(shakeTimer, dur || 0.16);
        }

        function spawnParticles(x, y, color, count, speed, size, life) {
            const cap = 220;
            const n = Math.min(count || 10, cap - particles.length);
            for (let i = 0; i < n; i++) {
                const ang = Math.random() * TAU;
                const spd = (0.35 + Math.random() * 0.85) * (speed || 120);
                particles.push({
                    x, y,
                    vx: Math.cos(ang) * spd,
                    vy: Math.sin(ang) * spd,
                    color: color || PAL.sky,
                    size: (size || 3) * (0.65 + Math.random() * 0.7),
                    life: (life || 0.45) * (0.7 + Math.random() * 0.5),
                    maxLife: life || 0.45,
                    kind: 'dot'
                });
            }
        }

        function spawnRing(x, y, color, maxR, life) {
            if (particles.length > 230) return;
            particles.push({
                x, y,
                vx: 0, vy: 0,
                color: color || PAL.sky,
                size: 4,
                maxR: maxR || 64,
                life: life || 0.35,
                maxLife: life || 0.35,
                kind: 'ring'
            });
        }

        function spawnFloat(x, y, text, color, scale) {
            if (floatTexts.length > 48) floatTexts.shift();
            floatTexts.push({
                x, y,
                vy: -34,
                text: String(text),
                color: color || PAL.text,
                scale: scale || 1,
                life: 0.95,
                maxLife: 0.95
            });
        }

        function drawSprite(name, x, y, size, opts) {
            const spr = sprites[name];
            const o = opts || {};
            const alpha = o.alpha !== undefined ? o.alpha : 1;
            const angle = o.angle || 0;
            const flipX = !!o.flipX;
            const glow = o.glow;

            g.save();
            g.translate(x, y);
            if (alpha < 1) g.globalAlpha = alpha;
            if (glow) {
                g.fillStyle = glow;
                g.globalAlpha = alpha * 0.22;
                g.beginPath();
                g.arc(0, 0, size * 0.56, 0, TAU);
                g.fill();
                g.globalAlpha = alpha;
            }
            if (angle) g.rotate(angle);
            if (flipX) g.scale(-1, 1);

            if (isDrawable(spr)) {
                g.imageSmoothingEnabled = size >= 64;
                g.drawImage(spr, -size * 0.5, -size * 0.5, size, size);
            } else {
                // Crisp vector fallback if sprite missing
                g.fillStyle = o.fallbackColor || PAL.sky;
                g.strokeStyle = '#ffffff44';
                g.lineWidth = 1.5;
                g.beginPath();
                g.arc(0, 0, size * 0.36, 0, TAU);
                g.fill();
                g.stroke();
            }
            g.restore();
        }

        function drawNovaPortrait(x, y, r, borderCol) {
            g.save();
            g.beginPath();
            g.arc(x, y, r, 0, TAU);
            g.fillStyle = '#0a1220';
            g.fill();
            g.clip();
            const spr = sprites.nova_avatar;
            if (isDrawable(spr)) {
                g.drawImage(spr, x - r, y - r, r * 2, r * 2);
            } else {
                g.fillStyle = PAL.sky;
                g.beginPath();
                g.arc(x, y - r * 0.1, r * 0.42, 0, TAU);
                g.fill();
            }
            g.restore();
            g.save();
            g.beginPath();
            g.arc(x, y, r, 0, TAU);
            g.strokeStyle = borderCol || PAL.sky;
            g.lineWidth = 2;
            g.stroke();
            g.restore();
        }

        function drawPanel(x, y, w, h, opts) {
            const o = opts || {};
            g.save();
            roundRectPath(g, x, y, w, h, o.radius || 10);
            g.fillStyle = o.fill || 'rgba(13, 19, 32, 0.90)';
            g.fill();
            g.strokeStyle = o.stroke || PAL.border;
            g.lineWidth = o.lineWidth || 1.25;
            g.stroke();
            g.restore();
        }

        function drawBar(x, y, w, h, frac, fillCol, bgCol, borderCol) {
            const f = clamp(frac, 0, 1);
            g.save();
            roundRectPath(g, x, y, w, h, Math.min(5, h * 0.5));
            g.fillStyle = bgCol || 'rgba(15, 23, 42, 0.9)';
            g.fill();
            if (f > 0.005) {
                roundRectPath(g, x + 1, y + 1, Math.max(4, (w - 2) * f), Math.max(2, h - 2), Math.min(4, h * 0.5));
                g.fillStyle = fillCol || PAL.mint;
                g.fill();
            }
            if (borderCol !== null) {
                roundRectPath(g, x, y, w, h, Math.min(5, h * 0.5));
                g.strokeStyle = borderCol || 'rgba(148, 163, 184, 0.25)';
                g.lineWidth = 1;
                g.stroke();
            }
            g.restore();
        }

        function drawBeam(x1, y1, x2, y2, color, width) {
            g.save();
            g.lineCap = 'round';
            g.strokeStyle = color;
            g.globalAlpha = 0.28;
            g.lineWidth = (width || 3) * 3.1;
            g.beginPath();
            g.moveTo(x1, y1);
            g.lineTo(x2, y2);
            g.stroke();

            g.globalAlpha = 0.92;
            g.lineWidth = width || 3;
            g.beginPath();
            g.moveTo(x1, y1);
            g.lineTo(x2, y2);
            g.stroke();

            g.strokeStyle = '#ffffff';
            g.globalAlpha = 0.75;
            g.lineWidth = Math.max(1, (width || 3) * 0.4);
            g.beginPath();
            g.moveTo(x1, y1);
            g.lineTo(x2, y2);
            g.stroke();
            g.restore();
        }

        function addButton(btn) {
            const hovered = !btn.disabled && pointInRect(pointer.x, pointer.y, btn);
            buttons.push(Object.assign({}, btn, { hovered }));
            if (hovered && btn.tooltip) {
                currentTooltip = {
                    x: pointer.x,
                    y: pointer.y,
                    title: btn.tooltipTitle || btn.label || '',
                    body: btn.tooltip
                };
            }
            const active = !!btn.active;
            const accent = btn.accent || PAL.sky;
            g.save();
            roundRectPath(g, btn.x, btn.y, btn.w, btn.h, btn.radius || 8);
            if (btn.disabled) {
                g.fillStyle = 'rgba(15, 23, 42, 0.65)';
            } else if (active) {
                g.fillStyle = btn.activeFill || 'rgba(56, 189, 248, 0.20)';
            } else if (hovered) {
                g.fillStyle = btn.hoverFill || 'rgba(30, 41, 59, 0.95)';
            } else {
                g.fillStyle = btn.fill || 'rgba(19, 27, 44, 0.92)';
            }
            g.fill();
            g.strokeStyle = btn.disabled
                ? 'rgba(100, 116, 139, 0.25)'
                : (active || hovered ? accent : (btn.border || 'rgba(148, 163, 184, 0.30)'));
            g.lineWidth = active || hovered ? 1.8 : 1.1;
            g.stroke();

            if (btn.sprite) {
                drawSprite(btn.sprite, btn.x + (btn.iconSize || 24) * 0.65 + 6, btn.y + btn.h * 0.5, btn.iconSize || 24, {
                    alpha: btn.disabled ? 0.4 : 1
                });
            }

            if (btn.label) {
                const tx = btn.sprite ? btn.x + (btn.iconSize || 24) + 14 : btn.x + btn.w * 0.5;
                g.textAlign = btn.sprite ? 'left' : 'center';
                g.textBaseline = 'middle';
                g.font = btn.font || ('600 12px ' + FONT_DISPLAY);
                g.fillStyle = btn.disabled ? PAL.dim : (btn.textColor || PAL.text);
                g.fillText(btn.label, tx, btn.y + (btn.sub ? btn.h * 0.36 : btn.h * 0.5));
                if (btn.sub) {
                    g.font = '500 10.5px ' + FONT_MONO;
                    g.fillStyle = btn.disabled ? PAL.dim : (btn.subColor || accent);
                    g.fillText(btn.sub, tx, btn.y + btn.h * 0.70);
                }
            }
            g.restore();
            return hovered;
        }

        function setTooltip(x, y, title, body) {
            currentTooltip = { x, y, title, body };
        }

        function renderTooltip() {
            if (!currentTooltip || !currentTooltip.body) return;
            const lines = String(currentTooltip.body).split('\n');
            g.save();
            g.font = '600 12px ' + FONT_DISPLAY;
            let maxW = currentTooltip.title ? g.measureText(currentTooltip.title).width : 0;
            g.font = '400 11px ' + FONT_BODY;
            for (const ln of lines) {
                maxW = Math.max(maxW, g.measureText(ln).width);
            }
            const bw = clamp(maxW + 22, 130, 290);
            const bh = (currentTooltip.title ? 22 : 6) + lines.length * 15 + 8;
            let bx = currentTooltip.x + 14;
            let by = currentTooltip.y - bh - 10;
            if (bx + bw > W - 8) bx = currentTooltip.x - bw - 14;
            if (bx < 8) bx = 8;
            if (by < 8) by = currentTooltip.y + 18;
            if (by + bh > H - 8) by = H - bh - 8;

            roundRectPath(g, bx, by, bw, bh, 8);
            g.fillStyle = 'rgba(7, 11, 18, 0.96)';
            g.fill();
            g.strokeStyle = PAL.sky;
            g.lineWidth = 1.25;
            g.stroke();

            let ty = by + 15;
            if (currentTooltip.title) {
                g.font = '700 12px ' + FONT_DISPLAY;
                g.fillStyle = PAL.sky;
                g.textAlign = 'left';
                g.textBaseline = 'middle';
                g.fillText(currentTooltip.title, bx + 10, ty);
                ty += 17;
            }
            g.font = '400 11px ' + FONT_BODY;
            g.fillStyle = PAL.text;
            g.textAlign = 'left';
            g.textBaseline = 'middle';
            for (const ln of lines) {
                g.fillText(ln, bx + 10, ty);
                ty += 15;
            }
            g.restore();
        }

        function syncHud(payload, force) {
            if (!ctx || typeof ctx.setHud !== 'function') return;
            if (!force && hudCooldown > 0) return;
            const out = Object.assign({}, payload);
            if (out.objective && !out.status) out.status = out.objective;
            if (!out.statusText) out.statusText = out.status || out.objective || '';
            const json = JSON.stringify(out);
            if (!force && json === lastHudJson) return;
            lastHudJson = json;
            hudCooldown = 0.09;
            try {
                ctx.setHud(out);
            } catch (_) { /* ignore host HUD quirks */ }
        }

        function triggerWin(payload, overlayInfo) {
            if (endedState) return;
            endedState = Object.assign({ type: 'win' }, overlayInfo || {});
            const winData = Object.assign({ stars: 3 }, payload || {});
            sfx('levelup');
            try {
                if (ctx && typeof ctx.onWin === 'function') ctx.onWin(winData);
            } catch (_) { /* ignore */ }
        }

        function triggerGameOver(payload, overlayInfo) {
            if (endedState) return;
            endedState = Object.assign({ type: 'over' }, overlayInfo || {});
            sfx('explodeBoss');
            try {
                if (ctx && typeof ctx.onGameOver === 'function') ctx.onGameOver(payload);
            } catch (_) { /* ignore */ }
        }

        function updateEffects(dt) {
            if (hudCooldown > 0) hudCooldown -= dt;
            if (shakeTimer > 0) {
                shakeTimer -= dt;
                if (shakeTimer <= 0) shakeMag = 0;
            }
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.life -= dt;
                if (p.life <= 0) {
                    particles.splice(i, 1);
                    continue;
                }
                if (p.kind === 'dot') {
                    p.x += p.vx * dt;
                    p.y += p.vy * dt;
                    p.vx *= 0.96;
                    p.vy *= 0.96;
                }
            }
            for (let i = floatTexts.length - 1; i >= 0; i--) {
                const f = floatTexts[i];
                f.life -= dt;
                if (f.life <= 0) {
                    floatTexts.splice(i, 1);
                    continue;
                }
                f.y += f.vy * dt;
                f.vy *= 0.95;
            }
        }

        function renderEffects(t) {
            for (const p of particles) {
                const a = clamp(p.life / p.maxLife, 0, 1);
                g.save();
                g.globalAlpha = a;
                if (p.kind === 'ring') {
                    const prog = 1 - a;
                    g.strokeStyle = p.color;
                    g.lineWidth = 2.5 * a;
                    g.beginPath();
                    g.arc(p.x, p.y, lerp(6, p.maxR, prog), 0, TAU);
                    g.stroke();
                } else {
                    g.fillStyle = p.color;
                    g.beginPath();
                    g.arc(p.x, p.y, p.size * (0.4 + 0.6 * a), 0, TAU);
                    g.fill();
                }
                g.restore();
            }

            for (const f of floatTexts) {
                const a = clamp(f.life / f.maxLife, 0, 1);
                g.save();
                g.globalAlpha = a;
                g.font = '700 ' + Math.round(13 * f.scale) + 'px ' + FONT_MONO;
                g.textAlign = 'center';
                g.textBaseline = 'middle';
                g.fillStyle = '#070b12';
                g.fillText(f.text, f.x + 1, f.y + 1);
                g.fillStyle = f.color;
                g.fillText(f.text, f.x, f.y);
                g.restore();
            }

            // Subtle ambient star shimmer
            g.save();
            for (const s of sparkles) {
                const a = 0.12 + 0.16 * Math.sin(t * s.speed + s.phase);
                g.fillStyle = 'rgba(226, 232, 240, ' + a.toFixed(2) + ')';
                g.fillRect(s.x, s.y, 1.5, 1.5);
            }
            g.restore();
        }

        function renderEndOverlay(restartFn) {
            if (!endedState) return;
            const isWin = endedState.type === 'win';
            const accent = isWin ? PAL.mint : PAL.coral;
            g.save();
            g.fillStyle = 'rgba(4, 7, 13, 0.72)';
            g.fillRect(0, 0, W, H);
            drawPanel(W * 0.5 - 220, H * 0.5 - 118, 440, 236, {
                fill: 'rgba(13, 19, 32, 0.96)',
                stroke: accent,
                lineWidth: 2,
                radius: 14
            });
            g.textAlign = 'center';
            g.textBaseline = 'middle';
            g.font = '700 24px ' + FONT_DISPLAY;
            g.fillStyle = accent;
            g.fillText(endedState.title || (isWin ? L('SEKTÖR TEMİZLENDİ!', 'SECTOR CLEARED!') : L('GÖREV BAŞARISIZ', 'MISSION FAILED')), W * 0.5, H * 0.5 - 66);

            g.font = '500 13.5px ' + FONT_BODY;
            g.fillStyle = PAL.text;
            g.fillText(endedState.sub || '', W * 0.5, H * 0.5 - 28);

            if (endedState.statLine) {
                g.font = '600 13px ' + FONT_MONO;
                g.fillStyle = PAL.amber;
                g.fillText(endedState.statLine, W * 0.5, H * 0.5 + 4);
            }

            const hasNext = isWin && endedState.nextLevel;
            if (hasNext) {
                addButton({
                    x: W * 0.5 - 170, y: H * 0.5 + 42, w: 160, h: 42,
                    label: endedState.nextLabel || L('SONRAKİ SEKTÖR', 'NEXT SECTOR'),
                    accent: PAL.mint,
                    active: true,
                    onClick: () => { sfx('uiConfirm'); restartFn(endedState.nextLevel); }
                });
                addButton({
                    x: W * 0.5 + 10, y: H * 0.5 + 42, w: 160, h: 42,
                    label: L('TEKRAR OYNA', 'REPLAY'),
                    accent: PAL.sky,
                    onClick: () => { sfx('uiClick'); restartFn(endedState.replayLevel || 1); }
                });
            } else {
                addButton({
                    x: W * 0.5 - 90, y: H * 0.5 + 42, w: 180, h: 42,
                    label: endedState.replayLabel || L('TEKRAR OYNA', 'PLAY AGAIN'),
                    accent,
                    active: true,
                    onClick: () => { sfx('uiConfirm'); restartFn(endedState.replayLevel || 1); }
                });
            }
            g.restore();
        }

        function mapPos(clientX, clientY) {
            const rect = canvas.getBoundingClientRect();
            const rw = Math.max(1, rect.width);
            const rh = Math.max(1, rect.height);
            return {
                x: clamp(((clientX - rect.left) / rw) * W, 0, W),
                y: clamp(((clientY - rect.top) / rh) * H, 0, H)
            };
        }

        const gameApi = setupFn({
            canvas, g, W, H, sprites, pointer,
            lang, L, sfx, shake,
            spawnParticles, spawnRing, spawnFloat,
            drawSprite, drawNovaPortrait, drawPanel, drawBar, drawBeam,
            addButton, setTooltip, syncHud,
            triggerWin, triggerGameOver,
            isEnded: () => !!endedState,
            clearEnded: () => { endedState = null; },
            resetEffects: () => {
                particles.length = 0;
                floatTexts.length = 0;
                shakeTimer = 0;
                shakeMag = 0;
            }
        });

        function handleClick(x, y, buttonIdx) {
            if (ctx.getPaused && ctx.getPaused()) return;
            for (let i = buttons.length - 1; i >= 0; i--) {
                const b = buttons[i];
                if (!b.disabled && pointInRect(x, y, b)) {
                    if (buttonIdx === 0 && typeof b.onClick === 'function') {
                        b.onClick(x, y);
                        return;
                    }
                }
            }
            if (endedState) return;
            if (typeof gameApi.onPointerDown === 'function') {
                gameApi.onPointerDown(x, y, buttonIdx);
            }
        }

        function onMouseMove(e) {
            const p = mapPos(e.clientX, e.clientY);
            pointer.x = p.x;
            pointer.y = p.y;
            pointer.inside = true;
            if (typeof gameApi.onPointerMove === 'function') {
                gameApi.onPointerMove(p.x, p.y);
            }
        }

        function onMouseDown(e) {
            const p = mapPos(e.clientX, e.clientY);
            pointer.x = p.x;
            pointer.y = p.y;
            pointer.down = true;
            handleClick(p.x, p.y, e.button || 0);
        }

        function onMouseUp(e) {
            pointer.down = false;
            if (typeof gameApi.onPointerUp === 'function') {
                const p = mapPos(e.clientX, e.clientY);
                gameApi.onPointerUp(p.x, p.y, e.button || 0);
            }
        }

        function onMouseLeave() {
            pointer.inside = false;
            pointer.down = false;
        }

        function onWindowMouseUp() {
            pointer.down = false;
        }

        function onWindowBlur() {
            pointer.down = false;
            pointer.inside = false;
        }

        function onTouchStart(e) {
            if (!e.touches || !e.touches[0]) return;
            const t = e.touches[0];
            const p = mapPos(t.clientX, t.clientY);
            pointer.x = p.x;
            pointer.y = p.y;
            pointer.inside = true;
            pointer.down = true;
            handleClick(p.x, p.y, 0);
        }

        function onContextMenu(e) {
            if (typeof gameApi.onRightClick === 'function') {
                e.preventDefault();
                const p = mapPos(e.clientX, e.clientY);
                gameApi.onRightClick(p.x, p.y);
            }
        }

        function onKeyDown(e) {
            if (destroyed) return;
            if (ctx.getPaused && ctx.getPaused()) return;
            const tag = e.target && e.target.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target && e.target.isContentEditable)) return;
            if (typeof gameApi.onKeyDown === 'function') {
                gameApi.onKeyDown(e);
            }
        }

        function onKeyUp(e) {
            if (destroyed) return;
            if (typeof gameApi.onKeyUp === 'function') {
                gameApi.onKeyUp(e);
            }
        }

        keyDownHandler = onKeyDown;
        keyUpHandler = onKeyUp;

        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('mousedown', onMouseDown);
        canvas.addEventListener('mouseup', onMouseUp);
        canvas.addEventListener('mouseleave', onMouseLeave);
        canvas.addEventListener('touchstart', onTouchStart, { passive: true });
        canvas.addEventListener('contextmenu', onContextMenu);
        if (typeof global.addEventListener === 'function') {
            global.addEventListener('keydown', keyDownHandler);
            global.addEventListener('keyup', keyUpHandler);
            global.addEventListener('mouseup', onWindowMouseUp);
            global.addEventListener('blur', onWindowBlur);
        }

        function frame(now) {
            if (destroyed) return;
            const rawDt = (now - lastTs) / 1000;
            lastTs = now;
            const paused = !!(ctx.getPaused && ctx.getPaused());
            const dt = paused ? 0 : clamp(rawDt, 0, 0.05);

            if (!paused) {
                updateEffects(dt);
                if (typeof gameApi.update === 'function') {
                    gameApi.update(dt, now / 1000);
                }
            }

            buttons.length = 0;
            currentTooltip = null;

            g.save();
            if (shakeTimer > 0 && shakeMag > 0) {
                const sx = (Math.random() - 0.5) * 2 * shakeMag;
                const sy = (Math.random() - 0.5) * 2 * shakeMag;
                g.translate(sx, sy);
            }
            if (typeof gameApi.render === 'function') {
                gameApi.render(now / 1000, paused);
            }
            renderEffects(now / 1000);
            g.restore();

            if (endedState) {
                renderEndOverlay(restart);
            }

            if (paused && !endedState) {
                g.save();
                g.fillStyle = 'rgba(7, 11, 18, 0.45)';
                g.fillRect(0, 0, W, H);
                drawPanel(W * 0.5 - 95, H * 0.5 - 24, 190, 48, { stroke: PAL.sky, radius: 12 });
                g.textAlign = 'center';
                g.textBaseline = 'middle';
                g.font = '700 16px ' + FONT_DISPLAY;
                g.fillStyle = PAL.sky;
                g.fillText(L('DURAKLATILDI', 'PAUSED'), W * 0.5, H * 0.5);
                g.restore();
            }

            renderTooltip();
            rafId = requestAnimationFrame(frame);
        }

        function restart(level) {
            endedState = null;
            particles.length = 0;
            floatTexts.length = 0;
            shakeTimer = 0;
            shakeMag = 0;
            lastHudJson = '';
            if (typeof gameApi.restart === 'function') {
                gameApi.restart(level);
            }
        }

        function destroy() {
            if (destroyed) return;
            destroyed = true;
            if (rafId) cancelAnimationFrame(rafId);
            canvas.removeEventListener('mousemove', onMouseMove);
            canvas.removeEventListener('mousedown', onMouseDown);
            canvas.removeEventListener('mouseup', onMouseUp);
            canvas.removeEventListener('mouseleave', onMouseLeave);
            canvas.removeEventListener('touchstart', onTouchStart);
            canvas.removeEventListener('contextmenu', onContextMenu);
            if (typeof global.removeEventListener === 'function') {
                global.removeEventListener('keydown', keyDownHandler);
                global.removeEventListener('keyup', keyUpHandler);
                global.removeEventListener('mouseup', onWindowMouseUp);
                global.removeEventListener('blur', onWindowBlur);
            }
            if (typeof gameApi.destroy === 'function') {
                gameApi.destroy();
            }
        }

        rafId = requestAnimationFrame(frame);
        return { destroy, restart };
    }

    // =========================================================================
    // GAME 1: TOWER DEFENSE BASTION (Story Ch.8 Final Defense — 6 Sectors)
    // =========================================================================
    function mountTowerDefense(ctx) {
        const TURRET_TYPES = {
            pulse: {
                id: 'pulse',
                sprite: 'laser_turret',
                color: PAL.sky,
                cost: 75,
                range: 155,
                fireCd: 0.38,
                dmg: 16,
                nameTr: 'Nabız Lazeri',
                nameEn: 'Pulse Laser',
                descTr: 'Hızlı tek hedef lazeri',
                descEn: 'Fast single-target laser'
            },
            cryo: {
                id: 'cryo',
                sprite: 'cryo_crystal',
                color: PAL.teal,
                cost: 100,
                range: 122,
                fireCd: 1.15,
                dmg: 12,
                slow: 0.45,
                slowDur: 2.3,
                nameTr: 'Kriyo Dizisi',
                nameEn: 'Cryo Array',
                descTr: 'Alan dondurucu yavaşlatma',
                descEn: 'AoE frost slow field'
            },
            rail: {
                id: 'rail',
                sprite: 'energy_prism',
                color: PAL.amber,
                cost: 140,
                range: 255,
                fireCd: 1.45,
                dmg: 54,
                critChance: 0.30,
                nameTr: 'Nova Raylı Top',
                nameEn: 'Nova Railgun',
                descTr: 'Uzun menzil delici kritik ışın',
                descEn: 'Long-range piercing crit beam'
            }
        };

        const SECTOR_LAYOUTS = [
            {
                accent: PAL.sky,
                waypoints: [
                    { x: 52, y: 120 }, { x: 265, y: 120 }, { x: 265, y: 365 },
                    { x: 540, y: 365 }, { x: 540, y: 150 }, { x: 880, y: 150 }
                ],
                pads: [
                    { x: 168, y: 196 }, { x: 185, y: 315 }, { x: 355, y: 190 }, { x: 355, y: 295 },
                    { x: 458, y: 245 }, { x: 632, y: 245 }, { x: 632, y: 345 }, { x: 742, y: 225 },
                    { x: 455, y: 112 }, { x: 755, y: 92 }
                ]
            },
            {
                accent: PAL.violet,
                waypoints: [
                    { x: 52, y: 360 }, { x: 230, y: 360 }, { x: 230, y: 135 },
                    { x: 485, y: 135 }, { x: 485, y: 375 }, { x: 715, y: 375 },
                    { x: 715, y: 185 }, { x: 890, y: 185 }
                ],
                pads: [
                    { x: 148, y: 280 }, { x: 315, y: 215 }, { x: 315, y: 315 }, { x: 400, y: 220 },
                    { x: 572, y: 205 }, { x: 572, y: 300 }, { x: 635, y: 285 }, { x: 805, y: 270 },
                    { x: 360, y: 86 }, { x: 790, y: 110 }
                ]
            },
            {
                accent: PAL.teal,
                waypoints: [
                    { x: 52, y: 245 }, { x: 225, y: 245 }, { x: 225, y: 108 },
                    { x: 500, y: 108 }, { x: 500, y: 392 }, { x: 755, y: 392 },
                    { x: 755, y: 245 }, { x: 892, y: 245 }
                ],
                pads: [
                    { x: 145, y: 168 }, { x: 145, y: 325 }, { x: 315, y: 188 }, { x: 412, y: 188 },
                    { x: 350, y: 300 }, { x: 412, y: 312 }, { x: 595, y: 195 }, { x: 595, y: 308 },
                    { x: 672, y: 255 }, { x: 830, y: 165 }
                ]
            },
            {
                accent: PAL.amber,
                waypoints: [
                    { x: 52, y: 112 }, { x: 745, y: 112 }, { x: 745, y: 255 },
                    { x: 205, y: 255 }, { x: 205, y: 395 }, { x: 888, y: 395 }
                ],
                pads: [
                    { x: 165, y: 182 }, { x: 305, y: 182 }, { x: 455, y: 182 }, { x: 605, y: 182 },
                    { x: 305, y: 325 }, { x: 455, y: 325 }, { x: 605, y: 325 }, { x: 755, y: 325 },
                    { x: 830, y: 182 }, { x: 120, y: 325 }
                ]
            },
            {
                accent: PAL.coral,
                waypoints: [
                    { x: 52, y: 392 }, { x: 315, y: 392 }, { x: 315, y: 108 },
                    { x: 605, y: 108 }, { x: 605, y: 392 }, { x: 888, y: 392 }
                ],
                pads: [
                    { x: 145, y: 318 }, { x: 235, y: 235 }, { x: 235, y: 145 }, { x: 398, y: 185 },
                    { x: 398, y: 305 }, { x: 522, y: 185 }, { x: 522, y: 305 }, { x: 690, y: 205 },
                    { x: 690, y: 315 }, { x: 810, y: 315 }
                ]
            },
            {
                accent: PAL.mint,
                waypoints: [
                    { x: 52, y: 145 }, { x: 230, y: 145 }, { x: 365, y: 345 },
                    { x: 550, y: 145 }, { x: 695, y: 345 }, { x: 888, y: 215 }
                ],
                pads: [
                    { x: 145, y: 222 }, { x: 265, y: 325 }, { x: 365, y: 222 }, { x: 455, y: 150 },
                    { x: 455, y: 315 }, { x: 560, y: 255 }, { x: 675, y: 155 }, { x: 695, y: 250 },
                    { x: 795, y: 145 }, { x: 795, y: 315 }
                ]
            }
        ];

        return createEngine(ctx, 'tower-defense-bastion', (api) => {
            const { g, W, H, L, sfx, shake, spawnParticles, spawnRing, spawnFloat, drawSprite, drawNovaPortrait, drawPanel, drawBar, drawBeam, addButton, syncHud, triggerWin, triggerGameOver } = api;

            let sector = clamp(Number(ctx.initialLevel || ctx.level || 1), 1, 6);
            let layout = SECTOR_LAYOUTS[(sector - 1) % SECTOR_LAYOUTS.length];
            let bgCanvas = buildSpaceBackdrop(810 + sector * 37, layout.accent, true);

            let gold = 225;
            let lives = 20;
            let maxLives = 20;
            let score = 0;
            let sectorStartScore = 0;
            let wonSector = false;
            let kills = 0;
            let wave = 0;
            const maxWaves = 6;
            let waveActive = false;
            let prepTimer = 4.5;
            let speedMult = 1;

            let pads = [];
            let selectedPadIdx = -1;
            let buildBrush = 'pulse'; // 'pulse' | 'cryo' | 'rail'
            let brushArmed = false;
            let enemies = [];
            let spawnQueue = [];
            let spawnTimer = 0;
            let projectiles = [];
            let beams = [];
            let cryoPulses = [];

            function pathTotalLen(wps) {
                let sum = 0;
                for (let i = 0; i < wps.length - 1; i++) {
                    sum += dist(wps[i].x, wps[i].y, wps[i + 1].x, wps[i + 1].y);
                }
                return sum;
            }

            function initSector(lvl) {
                sector = clamp(Number(lvl || 1), 1, 6);
                layout = SECTOR_LAYOUTS[(sector - 1) % SECTOR_LAYOUTS.length];
                bgCanvas = buildSpaceBackdrop(810 + sector * 37, layout.accent, true);
                gold = 220 + (sector - 1) * 35;
                lives = 20;
                maxLives = 20;
                wave = 0;
                kills = 0;
                waveActive = false;
                prepTimer = 5.0;
                selectedPadIdx = -1;
                enemies = [];
                spawnQueue = [];
                projectiles = [];
                beams = [];
                cryoPulses = [];
                pads = layout.pads.map((p, idx) => ({
                    idx,
                    x: p.x,
                    y: p.y,
                    turret: null
                }));
            }

            function buildWaveQueue(wNum) {
                const hpScale = (1 + (sector - 1) * 0.34) * (1 + (wNum - 1) * 0.28);
                const list = [];
                const speeders = 3 + wNum + Math.floor(sector * 0.5);
                const beetles = 2 + Math.floor(wNum * 0.9);
                for (let i = 0; i < speeders; i++) {
                    list.push({
                        kind: 'speeder',
                        sprite: 'fighter',
                        hp: Math.round(34 * hpScale),
                        speed: 112 + wNum * 5,
                        reward: 13 + sector,
                        dmg: 1,
                        size: 26,
                        color: PAL.coral
                    });
                }
                for (let i = 0; i < beetles; i++) {
                    list.push({
                        kind: 'beetle',
                        sprite: 'alien_drone',
                        hp: Math.round(96 * hpScale),
                        speed: 62 + wNum * 2,
                        reward: 20 + sector * 2,
                        dmg: 2,
                        size: 32,
                        color: PAL.violet
                    });
                }
                if (wNum >= 3) {
                    const raiders = Math.max(1, Math.floor(wNum / 2));
                    for (let i = 0; i < raiders; i++) {
                        list.push({
                            kind: 'raider',
                            sprite: 'plasma_bomb',
                            hp: Math.round(72 * hpScale),
                            shield: Math.round(35 * hpScale),
                            speed: 84,
                            reward: 24 + sector * 2,
                            dmg: 2,
                            size: 28,
                            color: PAL.amber
                        });
                    }
                }
                if (wNum === 3 && sector >= 3) {
                    list.push({
                        kind: 'miniboss',
                        sprite: 'ufo',
                        hp: Math.round(280 * hpScale),
                        speed: 52,
                        reward: 65,
                        dmg: 3,
                        size: 40,
                        color: PAL.sky,
                        isBoss: true
                    });
                }
                if (wNum === maxWaves) {
                    list.push({
                        kind: 'boss',
                        sprite: sector >= 4 ? 'boss_core' : 'ufo',
                        hp: Math.round(520 * hpScale),
                        shield: Math.round(120 * hpScale),
                        speed: 44 + sector * 2,
                        reward: 120,
                        dmg: 5,
                        size: 46,
                        color: PAL.coral,
                        isBoss: true
                    });
                }
                // Interleave non-boss units evenly while keeping bosses at end of wave
                const normal = list.filter((item) => !item.isBoss);
                const bosses = list.filter((item) => item.isBoss);
                for (let i = normal.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    const tmp = normal[i];
                    normal[i] = normal[j];
                    normal[j] = tmp;
                }
                return normal.concat(bosses);
            }

            function startNextWave(earlyBonus) {
                if (waveActive || wave >= maxWaves) return;
                wave++;
                waveActive = true;
                prepTimer = 0;
                if (earlyBonus) {
                    gold += 15;
                    score += 30;
                    spawnFloat(layout.waypoints[0].x + 30, layout.waypoints[0].y - 20, '+15 CRD', PAL.gold, 1.05);
                }
                spawnQueue = buildWaveQueue(wave);
                spawnTimer = 0.2;
                if (wave === maxWaves) {
                    sfx('bossAlarm');
                    spawnFloat(W * 0.5, 92, L('UFO BOSS DALGASI!', 'UFO BOSS WAVE!'), PAL.coral, 1.35);
                } else {
                    sfx('uiConfirm');
                }
            }

            function placeTurret(pad, typeId) {
                const cfg = TURRET_TYPES[typeId];
                if (!cfg || pad.turret || gold < cfg.cost) {
                    sfx('uiBack');
                    return false;
                }
                gold -= cfg.cost;
                pad.turret = {
                    type: typeId,
                    tier: 1,
                    invested: cfg.cost,
                    cd: 0.1,
                    angle: 0,
                    kills: 0,
                    priority: 'first', // 'first' | 'strong' | 'close'
                    recoil: 0
                };
                sfx('powerup');
                spawnRing(pad.x, pad.y, cfg.color, 44, 0.3);
                spawnFloat(pad.x, pad.y - 22, '-' + cfg.cost + ' CRD', cfg.color, 0.95);
                return true;
            }

            function upgradeCost(t) {
                const cfg = TURRET_TYPES[t.type];
                return Math.round(cfg.cost * (t.tier === 1 ? 0.95 : 1.55));
            }

            function upgradeTurret(pad) {
                const t = pad && pad.turret;
                if (!t || t.tier >= 3) return;
                const cost = upgradeCost(t);
                if (gold < cost) {
                    sfx('uiBack');
                    spawnFloat(pad.x, pad.y - 20, L('YETERSİZ CRD', 'LOW CRD'), PAL.coral, 0.95);
                    return;
                }
                gold -= cost;
                t.invested += cost;
                t.tier += 1;
                sfx('levelup');
                spawnRing(pad.x, pad.y, TURRET_TYPES[t.type].color, 58, 0.36);
                spawnFloat(pad.x, pad.y - 24, 'LVL ' + t.tier + '!', PAL.mint, 1.15);
            }

            function sellTurret(pad) {
                const t = pad && pad.turret;
                if (!t) return;
                const refund = Math.round(t.invested * 0.7);
                gold += refund;
                pad.turret = null;
                sfx('xpPickup');
                spawnFloat(pad.x, pad.y - 20, '+' + refund + ' CRD', PAL.gold, 1.05);
            }

            function damageEnemy(e, rawDmg, sourceTurret, isCrit) {
                if (e.dead) return;
                let dmg = rawDmg;
                if (e.shield > 0) {
                    const absorb = Math.min(e.shield, dmg);
                    e.shield -= absorb;
                    dmg -= absorb;
                    if (absorb > 0) spawnFloat(e.x, e.y - 24, '-' + Math.round(absorb), PAL.sky, 0.85);
                }
                if (dmg > 0) {
                    e.hp -= dmg;
                    if (isCrit) {
                        spawnFloat(e.x, e.y - 22, 'CRIT -' + Math.round(dmg) + '!', PAL.gold, 1.15);
                    } else if (rawDmg >= 15) {
                        spawnFloat(e.x, e.y - 18, '-' + Math.round(dmg), '#ffffff', 0.85);
                    }
                }
                if (e.hp <= 0) {
                    e.dead = true;
                    kills++;
                    gold += e.reward;
                    score += e.reward * 10;
                    if (sourceTurret) sourceTurret.kills++;
                    sfx(e.isBoss ? 'explodeBoss' : 'explodeSmall', 0.15);
                    if (e.isBoss) shake(7, 0.25);
                    spawnParticles(e.x, e.y, e.color, e.isBoss ? 28 : 12, e.isBoss ? 190 : 120, 3.4, 0.5);
                    spawnRing(e.x, e.y, e.color, e.isBoss ? 72 : 34, 0.3);
                    spawnFloat(e.x, e.y - 26, '+' + e.reward + ' CRD', PAL.gold, 0.95);
                }
            }

            function turretStats(t) {
                const cfg = TURRET_TYPES[t.type];
                const mult = 1 + (t.tier - 1) * 0.62;
                return {
                    range: cfg.range + (t.tier - 1) * 18,
                    fireCd: cfg.fireCd * (t.tier === 1 ? 1 : t.tier === 2 ? 0.85 : 0.72),
                    dmg: cfg.dmg * mult,
                    slow: (cfg.slow || 0) + (t.tier - 1) * 0.06,
                    critChance: (cfg.critChance || 0) + (t.tier - 1) * 0.08
                };
            }

            initSector(sector);

            return {
                restart(lvl) {
                    const nextSec = clamp(Number(lvl || 1), 1, 6);
                    if (nextSec <= 1) {
                        score = 0;
                        sectorStartScore = 0;
                    } else if (wonSector && nextSec > sector) {
                        sectorStartScore = score;
                    } else {
                        score = sectorStartScore;
                    }
                    wonSector = false;
                    initSector(nextSec);
                },
                onPointerDown(x, y, btn) {
                    if (btn === 2) {
                        selectedPadIdx = -1;
                        brushArmed = false;
                        return;
                    }
                    if (y > 466) return;
                    for (let i = 0; i < pads.length; i++) {
                        if (dist(x, y, pads[i].x, pads[i].y) <= 26) {
                            sfx('uiClick');
                            if (!pads[i].turret && (brushArmed || selectedPadIdx === i)) {
                                if (placeTurret(pads[i], buildBrush)) {
                                    selectedPadIdx = i;
                                    brushArmed = false;
                                }
                            } else {
                                selectedPadIdx = i;
                            }
                            return;
                        }
                    }
                    selectedPadIdx = -1;
                    brushArmed = false;
                },
                onRightClick() {
                    selectedPadIdx = -1;
                    brushArmed = false;
                },
                onKeyDown(e) {
                    if (e.key === '1') {
                        buildBrush = 'pulse';
                        if (selectedPadIdx >= 0 && !pads[selectedPadIdx].turret) placeTurret(pads[selectedPadIdx], 'pulse');
                    } else if (e.key === '2') {
                        buildBrush = 'cryo';
                        if (selectedPadIdx >= 0 && !pads[selectedPadIdx].turret) placeTurret(pads[selectedPadIdx], 'cryo');
                    } else if (e.key === '3') {
                        buildBrush = 'rail';
                        if (selectedPadIdx >= 0 && !pads[selectedPadIdx].turret) placeTurret(pads[selectedPadIdx], 'rail');
                    } else if (e.key === 'u' || e.key === 'U') {
                        if (selectedPadIdx >= 0) upgradeTurret(pads[selectedPadIdx]);
                    } else if (e.key === 's' || e.key === 'S') {
                        if (selectedPadIdx >= 0) sellTurret(pads[selectedPadIdx]);
                    } else if (e.key === ' ') {
                        e.preventDefault();
                        if (!waveActive && wave < maxWaves) startNextWave(true);
                    } else if (e.key === 'Escape') {
                        selectedPadIdx = -1;
                    }
                },
                update(dtRaw) {
                    if (api.isEnded()) return;
                    const dt = dtRaw * speedMult;

                    // Wave pacing
                    if (!waveActive && wave < maxWaves) {
                        prepTimer -= dt;
                        if (prepTimer <= 0) {
                            startNextWave(false);
                        }
                    }

                    // Spawning
                    if (waveActive && spawnQueue.length > 0) {
                        spawnTimer -= dt;
                        if (spawnTimer <= 0) {
                            const spec = spawnQueue.shift();
                            const w0 = layout.waypoints[0];
                            enemies.push({
                                kind: spec.kind,
                                sprite: spec.sprite,
                                hp: spec.hp,
                                maxHp: spec.hp,
                                shield: spec.shield || 0,
                                maxShield: spec.shield || 0,
                                speed: spec.speed,
                                reward: spec.reward,
                                dmg: spec.dmg,
                                size: spec.size,
                                color: spec.color,
                                isBoss: !!spec.isBoss,
                                x: w0.x,
                                y: w0.y,
                                segIdx: 0,
                                progress: 0,
                                angle: 0,
                                slowTimer: 0,
                                slowFactor: 0,
                                dead: false
                            });
                            spawnRing(w0.x, w0.y, PAL.violet, 26, 0.24);
                            spawnTimer = spec.isBoss ? 1.4 : Math.max(0.45, 0.95 - wave * 0.06);
                        }
                    }

                    // Move enemies along waypoints
                    const wps = layout.waypoints;
                    for (let i = enemies.length - 1; i >= 0; i--) {
                        const e = enemies[i];
                        if (e.dead) {
                            enemies.splice(i, 1);
                            continue;
                        }
                        if (e.slowTimer > 0) {
                            e.slowTimer -= dt;
                            if (e.slowTimer <= 0) e.slowFactor = 0;
                        }
                        const effSpeed = Math.max(8, e.speed * (1 - clamp(e.slowFactor, 0, 0.72)));
                        let moveLeft = effSpeed * dt;
                        let guard = 0;
                        while (moveLeft > 0 && e.segIdx < wps.length - 1 && guard++ < wps.length + 2) {
                            const tgt = wps[e.segIdx + 1];
                            const dx = tgt.x - e.x;
                            const dy = tgt.y - e.y;
                            const d = Math.hypot(dx, dy);
                            if (d <= 0.0001) {
                                e.segIdx++;
                            } else if (d <= moveLeft) {
                                e.x = tgt.x;
                                e.y = tgt.y;
                                e.progress += d;
                                e.segIdx++;
                                moveLeft -= d;
                            } else {
                                e.x += (dx / d) * moveLeft;
                                e.y += (dy / d) * moveLeft;
                                e.progress += moveLeft;
                                e.angle = Math.atan2(dy, dx);
                                moveLeft = 0;
                            }
                        }
                        if (e.segIdx >= wps.length - 1) {
                            lives = Math.max(0, lives - e.dmg);
                            sfx('playerHurt');
                            shake(6, 0.22);
                            spawnRing(e.x, e.y, PAL.coral, 48, 0.35);
                            spawnFloat(e.x - 20, e.y - 20, '-' + e.dmg + ' HP', PAL.coral, 1.2);
                            enemies.splice(i, 1);
                            if (lives <= 0) {
                                triggerGameOver({ score, level: sector, wave, kills }, {
                                    title: L('ÜS ÇÖKTÜ!', 'BASTION BREACHED!'),
                                    sub: L(`Sektör ${sector} · Dalga ${wave}/${maxWaves}`, `Sector ${sector} · Wave ${wave}/${maxWaves}`),
                                    statLine: `SCORE ${score} · KILLS ${kills}`,
                                    replayLevel: sector
                                });
                                return;
                            }
                        }
                    }

                    // Turret targeting & firing
                    for (const pad of pads) {
                        const t = pad.turret;
                        if (!t) continue;
                        if (t.recoil > 0) t.recoil = Math.max(0, t.recoil - dt * 6);
                        t.cd -= dt;
                        const st = turretStats(t);

                        let best = null;
                        let bestScore = -Infinity;
                        for (const e of enemies) {
                            if (e.dead) continue;
                            const d = dist(pad.x, pad.y, e.x, e.y);
                            if (d > st.range) continue;
                            let val = e.progress;
                            if (t.priority === 'strong') val = e.hp + e.shield;
                            else if (t.priority === 'close') val = -d;
                            if (val > bestScore) {
                                bestScore = val;
                                best = e;
                            }
                        }

                        if (best) {
                            t.angle = Math.atan2(best.y - pad.y, best.x - pad.x);
                            if (t.cd <= 0) {
                                t.cd = st.fireCd;
                                t.recoil = 1;
                                if (t.type === 'pulse') {
                                    sfx('shootLaser', 0.14);
                                    projectiles.push({
                                        x: pad.x, y: pad.y,
                                        tx: best.x, ty: best.y,
                                        target: best,
                                        turret: t,
                                        speed: 520,
                                        dmg: st.dmg,
                                        color: PAL.sky
                                    });
                                } else if (t.type === 'cryo') {
                                    sfx('emp', 0.1);
                                    cryoPulses.push({ x: pad.x, y: pad.y, maxR: st.range, life: 0.38, maxLife: 0.38 });
                                    for (const e of enemies) {
                                        if (!e.dead && dist(pad.x, pad.y, e.x, e.y) <= st.range) {
                                            e.slowFactor = Math.max(e.slowFactor, st.slow);
                                            e.slowTimer = Math.max(e.slowTimer, TURRET_TYPES.cryo.slowDur);
                                            damageEnemy(e, st.dmg, t, false);
                                        }
                                    }
                                } else if (t.type === 'rail') {
                                    sfx('shootPlasma', 0.08);
                                    const ang = Math.atan2(best.y - pad.y, best.x - pad.x);
                                    const endX = pad.x + Math.cos(ang) * (st.range + 45);
                                    const endY = pad.y + Math.sin(ang) * (st.range + 45);
                                    const isCrit = Math.random() < st.critChance;
                                    const railDmg = isCrit ? st.dmg * 2 : st.dmg;
                                    beams.push({ x1: pad.x, y1: pad.y, x2: endX, y2: endY, color: isCrit ? PAL.gold : PAL.amber, width: isCrit ? 5 : 3.5, life: 0.20, maxLife: 0.20 });
                                    if (isCrit) shake(3, 0.1);
                                    for (const e of enemies) {
                                        if (!e.dead && segPointDist(pad.x, pad.y, endX, endY, e.x, e.y) <= e.size * 0.55 + 8) {
                                            damageEnemy(e, railDmg, t, isCrit);
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // Projectiles
                    for (let i = projectiles.length - 1; i >= 0; i--) {
                        const p = projectiles[i];
                        const tx = p.target && !p.target.dead ? p.target.x : p.tx;
                        const ty = p.target && !p.target.dead ? p.target.y : p.ty;
                        const dx = tx - p.x;
                        const dy = ty - p.y;
                        const d = Math.hypot(dx, dy);
                        const step = p.speed * dt;
                        if (d <= step + 8) {
                            if (p.target && !p.target.dead) {
                                damageEnemy(p.target, p.dmg, p.turret, false);
                            }
                            spawnParticles(tx, ty, p.color, 5, 80, 2.2, 0.22);
                            projectiles.splice(i, 1);
                        } else {
                            p.x += (dx / d) * step;
                            p.y += (dy / d) * step;
                            p.tx = tx;
                            p.ty = ty;
                        }
                    }

                    for (let i = beams.length - 1; i >= 0; i--) {
                        beams[i].life -= dt;
                        if (beams[i].life <= 0) beams.splice(i, 1);
                    }
                    for (let i = cryoPulses.length - 1; i >= 0; i--) {
                        cryoPulses[i].life -= dt;
                        if (cryoPulses[i].life <= 0) cryoPulses.splice(i, 1);
                    }

                    // Check wave / sector clear
                    if (waveActive && spawnQueue.length === 0 && enemies.length === 0) {
                        waveActive = false;
                        const clearBonus = 40 + wave * 12;
                        gold += clearBonus;
                        score += clearBonus * 10;
                        prepTimer = 5.5;
                        sfx('xpPickup');
                        if (wave >= maxWaves) {
                            wonSector = true;
                            triggerWin({ score, level: sector, wave: maxWaves, kills, credits: gold }, {
                                title: L(`SEKTÖR ${sector} SAVUNULDU!`, `SECTOR ${sector} DEFENDED!`),
                                sub: sector === 3 ? L('Hikaye Bölüm 8 Hedefi Tamamlandı!', 'Story Ch.8 Target Cleared!') : L('Tüm 6 dalga püskürtüldü.', 'All 6 waves repelled.'),
                                statLine: `SCORE ${score} · KILLS ${kills} · HP ${lives}/${maxLives}`,
                                nextLevel: sector < 6 ? sector + 1 : null,
                                replayLevel: sector
                            });
                        } else {
                            spawnFloat(W * 0.5, 92, L(`DALGA ${wave} TEMİZLENDİ (+${clearBonus} CRD)`, `WAVE ${wave} CLEARED (+${clearBonus} CRD)`), PAL.mint, 1.15);
                        }
                    }

                    syncHud({
                        score,
                        level: sector,
                        wave,
                        maxWaves,
                        hp: lives,
                        maxHp: maxLives,
                        lives,
                        credits: gold,
                        kills,
                        objective: L(`Sektör ${sector}/6 · Dalga ${Math.max(1, wave)}/${maxWaves}`, `Sector ${sector}/6 · Wave ${Math.max(1, wave)}/${maxWaves}`)
                    });
                },
                render(time) {
                    if (bgCanvas) g.drawImage(bgCanvas, 0, 0);
                    else { g.fillStyle = PAL.bg; g.fillRect(0, 0, W, H); }

                    // Draw defense corridor path
                    const wps = layout.waypoints;
                    g.save();
                    g.lineCap = 'round';
                    g.lineJoin = 'round';
                    g.strokeStyle = 'rgba(15, 23, 42, 0.92)';
                    g.lineWidth = 46;
                    g.beginPath();
                    g.moveTo(wps[0].x, wps[0].y);
                    for (let i = 1; i < wps.length; i++) g.lineTo(wps[i].x, wps[i].y);
                    g.stroke();

                    g.strokeStyle = layout.accent + '44';
                    g.lineWidth = 48;
                    g.stroke();

                    g.strokeStyle = 'rgba(13, 19, 32, 0.98)';
                    g.lineWidth = 40;
                    g.stroke();

                    // Animated center dashed track
                    g.strokeStyle = layout.accent + '66';
                    g.lineWidth = 2;
                    g.setLineDash([12, 14]);
                    g.lineDashOffset = -time * 34;
                    g.stroke();
                    g.setLineDash([]);
                    g.restore();

                    // Entry Portal & Exit Bastion Gate
                    drawSprite('portal_vortex', wps[0].x, wps[0].y, 56, { angle: time * 1.4, glow: PAL.violet });
                    const endWp = wps[wps.length - 1];
                    drawSprite('warp_ring', endWp.x, endWp.y, 62, { angle: -time * 1.1, glow: PAL.mint });
                    drawSprite('shield_battery', endWp.x, endWp.y, 26, {});

                    // Cryo rings
                    for (const cp of cryoPulses) {
                        const prog = 1 - cp.life / cp.maxLife;
                        g.save();
                        g.globalAlpha = (1 - prog) * 0.55;
                        g.fillStyle = 'rgba(45, 212, 191, 0.14)';
                        g.strokeStyle = PAL.teal;
                        g.lineWidth = 2;
                        g.beginPath();
                        g.arc(cp.x, cp.y, cp.maxR * (0.2 + 0.8 * prog), 0, TAU);
                        g.fill();
                        g.stroke();
                        g.restore();
                    }

                    // Turret Pads
                    for (const pad of pads) {
                        const isSel = selectedPadIdx === pad.idx;
                        const hovered = dist(api.pointer.x, api.pointer.y, pad.x, pad.y) <= 26;
                        g.save();
                        if ((isSel || hovered) && pad.turret) {
                            const st = turretStats(pad.turret);
                            const tColor = TURRET_TYPES[pad.turret.type].color;
                            g.fillStyle = tColor + (isSel ? '18' : '0e');
                            g.strokeStyle = tColor + (isSel ? '88' : '55');
                            g.lineWidth = isSel ? 1.75 : 1.25;
                            g.beginPath();
                            g.arc(pad.x, pad.y, st.range, 0, TAU);
                            g.fill();
                            g.stroke();
                            if (pad.turret.tier < 3) {
                                g.strokeStyle = tColor + '44';
                                g.setLineDash([4, 4]);
                                g.beginPath();
                                g.arc(pad.x, pad.y, st.range + 18, 0, TAU);
                                g.stroke();
                                g.setLineDash([]);
                            }
                        } else if ((isSel || hovered) && !pad.turret) {
                            const previewCfg = TURRET_TYPES[buildBrush];
                            g.fillStyle = previewCfg.color + '0c';
                            g.strokeStyle = previewCfg.color + (hovered ? '88' : '44');
                            g.lineWidth = hovered ? 1.5 : 1.2;
                            g.setLineDash([5, 5]);
                            g.beginPath();
                            g.arc(pad.x, pad.y, previewCfg.range, 0, TAU);
                            g.fill();
                            g.stroke();
                            g.setLineDash([]);
                        }

                        // Pad base socket
                        g.fillStyle = isSel ? 'rgba(56, 189, 248, 0.22)' : (hovered ? 'rgba(30, 41, 59, 0.95)' : 'rgba(19, 27, 44, 0.92)');
                        g.strokeStyle = isSel ? PAL.sky : (hovered ? PAL.text : 'rgba(148, 163, 184, 0.35)');
                        g.lineWidth = isSel ? 2.2 : 1.3;
                        g.beginPath();
                        g.arc(pad.x, pad.y, 23, 0, TAU);
                        g.fill();
                        g.stroke();

                        if (!pad.turret) {
                            const c = TURRET_TYPES[buildBrush];
                            if (hovered) {
                                drawSprite(c.sprite, pad.x, pad.y, 32, { alpha: 0.48, glow: c.color });
                                api.setTooltip(pad.x, pad.y, L('Boş Kule Yuvası', 'Empty Turret Pad'), L(`Tıkla -> ${c.nameTr} (${c.cost} CRD · Menzil ${c.range})`, `Click -> Build ${c.nameEn} (${c.cost} CRD · Range ${c.range})`));
                            } else {
                                g.strokeStyle = 'rgba(148, 163, 184, 0.45)';
                                g.lineWidth = 2;
                                g.beginPath();
                                g.moveTo(pad.x - 7, pad.y); g.lineTo(pad.x + 7, pad.y);
                                g.moveTo(pad.x, pad.y - 7); g.lineTo(pad.x, pad.y + 7);
                                g.stroke();
                            }
                        } else {
                            const t = pad.turret;
                            const cfg = TURRET_TYPES[t.type];
                            const rot = t.type === 'pulse' ? (Math.cos(t.angle) < 0) : false;
                            const drawAng = t.type === 'cryo' ? time * 0.9 : (t.type === 'rail' ? t.angle + Math.PI * 0.5 : 0);
                            drawSprite(cfg.sprite, pad.x, pad.y - t.recoil * 2, 34 + t.tier * 2, {
                                angle: drawAng,
                                flipX: rot,
                                glow: cfg.color
                            });
                            // Tier pips
                            for (let k = 0; k < t.tier; k++) {
                                g.fillStyle = cfg.color;
                                g.beginPath();
                                g.arc(pad.x - (t.tier - 1) * 4 + k * 8, pad.y + 18, 2.5, 0, TAU);
                                g.fill();
                            }
                            if (hovered) {
                                const st = turretStats(t);
                                const upC = upgradeCost(t);
                                const refC = Math.round(t.invested * 0.7);
                                const upLine = t.tier >= 3
                                    ? L('MAKS SEVİYE', 'MAX TIER')
                                    : L(`Yükselt [U]: ${upC} CRD (+%62 Hasar, +18 Menzil)`, `Upgrade [U]: ${upC} CRD (+62% DMG, +18 RNG)`);
                                api.setTooltip(pad.x, pad.y, `${langLabel(cfg)} LVL ${t.tier}/3`, `DMG ${Math.round(st.dmg)} · RNG ${Math.round(st.range)} · KILLS ${t.kills}\n${upLine} · ${L(`Sat [S]: +${refC} CRD`, `Sell [S]: +${refC} CRD`)}`);
                            }
                        }
                        g.restore();
                    }

                    // Enemies
                    for (const e of enemies) {
                        const ang = (e.sprite === 'fighter' || e.sprite === 'alien_drone') ? e.angle + Math.PI * 0.5 : 0;
                        drawSprite(e.sprite, e.x, e.y, e.size, {
                            angle: ang,
                            glow: e.slowTimer > 0 ? PAL.teal : e.color
                        });
                        if (e.slowTimer > 0) {
                            g.save();
                            g.strokeStyle = PAL.teal;
                            g.lineWidth = 1.5;
                            g.beginPath();
                            g.arc(e.x, e.y, e.size * 0.55, 0, TAU);
                            g.stroke();
                            g.restore();
                        }
                        if (e.shield > 0) {
                            drawBar(e.x - 16, e.y - e.size * 0.5 - 12, 32, 3.5, e.shield / e.maxShield, PAL.sky, '#0f172a', null);
                        }
                        drawBar(e.x - 16, e.y - e.size * 0.5 - 7, 32, 4.5, e.hp / e.maxHp, e.isBoss ? PAL.coral : PAL.mint, '#0f172a', null);
                    }

                    // Projectiles & Beams
                    for (const p of projectiles) {
                        g.save();
                        g.fillStyle = p.color;
                        g.beginPath();
                        g.arc(p.x, p.y, 4, 0, TAU);
                        g.fill();
                        g.fillStyle = '#ffffff';
                        g.beginPath();
                        g.arc(p.x, p.y, 2, 0, TAU);
                        g.fill();
                        g.restore();
                    }
                    for (const b of beams) {
                        g.save();
                        g.globalAlpha = clamp(b.life / b.maxLife, 0, 1);
                        drawBeam(b.x1, b.y1, b.x2, b.y2, b.color, b.width);
                        g.restore();
                    }

                    // Top HUD bar
                    drawPanel(10, 8, W - 20, 40, { fill: 'rgba(13, 19, 32, 0.90)', radius: 10 });
                    drawNovaPortrait(32, 28, 14, layout.accent);
                    g.save();
                    g.textBaseline = 'middle';
                    g.textAlign = 'left';
                    g.font = '700 13px ' + FONT_DISPLAY;
                    g.fillStyle = PAL.text;
                    g.fillText(L(`SEKTÖR ${sector}/6`, `SECTOR ${sector}/6`), 54, 28);

                    if (sector <= 3) {
                        g.font = '600 10.5px ' + FONT_MONO;
                        g.fillStyle = PAL.amber;
                        g.fillText(L('CH.8 HEDEF: S3', 'CH.8 GOAL: S3'), 146, 28);
                    }

                    g.font = '600 12.5px ' + FONT_MONO;
                    g.fillStyle = PAL.sky;
                    g.fillText(L(`DALGA ${wave}/${maxWaves}`, `WAVE ${wave}/${maxWaves}`), 255, 28);

                    drawSprite('shield_battery', 362, 28, 20);
                    g.fillStyle = lives > 6 ? PAL.mint : PAL.coral;
                    g.fillText(`${lives}/${maxLives}`, 377, 28);

                    drawSprite('coin_star', 455, 28, 20);
                    g.fillStyle = PAL.gold;
                    g.fillText(`${gold} CRD`, 470, 28);

                    g.fillStyle = PAL.muted;
                    g.fillText(`SCR ${score}`, 570, 28);
                    g.restore();

                    addButton({
                        x: 685, y: 13, w: 66, h: 30,
                        label: speedMult === 1 ? '1x SPD' : '2x SPD',
                        accent: speedMult === 2 ? PAL.amber : PAL.sky,
                        active: speedMult === 2,
                        onClick: () => { speedMult = speedMult === 1 ? 2 : 1; sfx('uiClick'); }
                    });

                    addButton({
                        x: 760, y: 13, w: 180, h: 30,
                        label: waveActive ? L(`DALGA ${wave} AKTİF`, `WAVE ${wave} ACTIVE`) : (wave < maxWaves ? L(`DALGA BAŞLAT (+15)`, `SEND WAVE (+15)`) : L('SON DALGA', 'FINAL WAVE')),
                        accent: PAL.mint,
                        active: !waveActive && wave < maxWaves,
                        disabled: waveActive || wave >= maxWaves,
                        onClick: () => startNextWave(true)
                    });

                    // Bottom Tactical Build / Inspector Dock
                    drawPanel(10, 468, W - 20, 64, { fill: 'rgba(13, 19, 32, 0.94)', radius: 10 });
                    const selPad = selectedPadIdx >= 0 ? pads[selectedPadIdx] : null;

                    if (selPad && selPad.turret) {
                        const t = selPad.turret;
                        const cfg = TURRET_TYPES[t.type];
                        drawSprite(cfg.sprite, 44, 500, 36, { glow: cfg.color });
                        g.save();
                        g.textAlign = 'left';
                        g.textBaseline = 'middle';
                        g.font = '700 13.5px ' + FONT_DISPLAY;
                        g.fillStyle = cfg.color;
                        g.fillText(`${langLabel(cfg)} (LVL ${t.tier}/3)`, 72, 488);
                        g.font = '500 11.5px ' + FONT_MONO;
                        g.fillStyle = PAL.muted;
                        const st = turretStats(t);
                        g.fillText(`DMG ${Math.round(st.dmg)} · RNG ${Math.round(st.range)} · KILLS ${t.kills}`, 72, 511);
                        g.restore();

                        const prioLabels = { first: L('HEDEF: İLK', 'TGT: FIRST'), strong: L('HEDEF: GÜÇLÜ', 'TGT: STRONG'), close: L('HEDEF: YAKIN', 'TGT: CLOSE') };
                        addButton({
                            x: 345, y: 480, w: 138, h: 40,
                            label: prioLabels[t.priority],
                            accent: PAL.sky,
                            onClick: () => {
                                const order = ['first', 'strong', 'close'];
                                t.priority = order[(order.indexOf(t.priority) + 1) % order.length];
                                sfx('uiClick');
                            }
                        });

                        const upCost = upgradeCost(t);
                        const upCfg = TURRET_TYPES[t.type];
                        const curSt = turretStats(t);
                        addButton({
                            x: 495, y: 480, w: 195, h: 40,
                            label: t.tier >= 3 ? L('MAKS SEVİYE', 'MAX TIER') : L(`YÜKSELT [U]`, `UPGRADE [U]`),
                            sub: t.tier >= 3 ? 'TIER 3/3' : `${upCost} CRD · LVL ${t.tier + 1}`,
                            accent: PAL.mint,
                            disabled: t.tier >= 3 || gold < upCost,
                            tooltipTitle: t.tier >= 3 ? L('Maks Seviye', 'Max Tier') : L(`${upCfg.nameTr} LVL ${t.tier + 1}`, `${upCfg.nameEn} LVL ${t.tier + 1}`),
                            tooltip: t.tier >= 3
                                ? L('Bu kule tam kapasitede!', 'Turret at maximum capacity!')
                                : L(`Maliyet: ${upCost} CRD · Menzil ${Math.round(curSt.range)} -> ${Math.round(curSt.range + 18)}`, `Cost: ${upCost} CRD · Range ${Math.round(curSt.range)} -> ${Math.round(curSt.range + 18)}`),
                            onClick: () => upgradeTurret(selPad)
                        });

                        const refund = Math.round(t.invested * 0.7);
                        addButton({
                            x: 702, y: 480, w: 155, h: 40,
                            label: L('SAT [S]', 'SELL [S]'),
                            sub: `+${refund} CRD`,
                            accent: PAL.coral,
                            tooltipTitle: L('Kuleyi Sök [S]', 'Sell Turret [S]'),
                            tooltip: L(`Yatırımın %70'ini (+${refund} CRD) geri al`, `Refund 70% invested value (+${refund} CRD)`),
                            onClick: () => { sellTurret(selPad); selectedPadIdx = -1; }
                        });
                        addButton({
                            x: 868, y: 480, w: 72, h: 40,
                            label: L('KAPAT', 'ESC'),
                            accent: PAL.muted,
                            onClick: () => { selectedPadIdx = -1; sfx('uiClick'); }
                        });
                    } else {
                        const keys = ['pulse', 'cryo', 'rail'];
                        keys.forEach((k, i) => {
                            const cfg = TURRET_TYPES[k];
                            const bx = 22 + i * 242;
                            const canBuy = gold >= cfg.cost;
                            addButton({
                                x: bx, y: 477, w: 230, h: 46,
                                sprite: cfg.sprite,
                                iconSize: 28,
                                label: `[${i + 1}] ${langLabel(cfg)}`,
                                sub: `${cfg.cost} CRD · ${api.lang() === 'tr' ? cfg.descTr : cfg.descEn}`,
                                accent: cfg.color,
                                active: buildBrush === k,
                                subColor: canBuy ? cfg.color : PAL.coral,
                                tooltipTitle: langLabel(cfg),
                                tooltip: L(`${cfg.descTr}\nMaliyet: ${cfg.cost} CRD · Yuvaya tıkla ve kur!`, `${cfg.descEn}\nCost: ${cfg.cost} CRD · Click a pad to deploy!`),
                                onClick: () => {
                                    buildBrush = k;
                                    brushArmed = true;
                                    sfx('uiClick');
                                    if (selPad && !selPad.turret) {
                                        if (placeTurret(selPad, k)) brushArmed = false;
                                    }
                                }
                            });
                        });
                        g.save();
                        g.font = '500 10.5px ' + FONT_BODY;
                        g.fillStyle = PAL.muted;
                        g.textAlign = 'left';
                        g.textBaseline = 'middle';
                        g.fillText(selPad ? L('Kule seç & kur!', 'Pick turret to build!') : L('Boş yuvaya tıkla / [1-3]', 'Click a pad / [1-3]'), 758, 488);
                        g.fillText(L('Sağ tık / ESC: İptal', 'Right-click / ESC: Cancel'), 758, 508);
                        g.restore();
                    }

                    if (!waveActive && wave < maxWaves && !api.isEnded()) {
                        g.save();
                        g.font = '600 11.5px ' + FONT_MONO;
                        g.fillStyle = PAL.mint;
                        g.textAlign = 'center';
                        g.fillText(L(`SONRAKİ DALGA: ${prepTimer.toFixed(1)}s`, `NEXT WAVE IN ${prepTimer.toFixed(1)}s`), W * 0.5, 64);
                        g.restore();
                    }
                }
            };

            function langLabel(cfg) {
                return api.lang() === 'tr' ? cfg.nameTr : cfg.nameEn;
            }
        });
    }

    // =========================================================================
    // GAME 2: DECK BREACH TACTICS (6x4 Turn-Based Grid + Captain Nova Vex)
    // =========================================================================
    function mountDeckBreach(ctx) {
        const GRID_COLS = 6;
        const GRID_ROWS = 4;
        const TILE_W = 82;
        const TILE_H = 74;
        const GRID_X = 224;
        const GRID_Y = 58;

        const CARDS = {
            step: {
                id: 'step', cost: 1, color: PAL.sky, sprite: 'warp_ring',
                nameTr: 'İtici Adım', nameEn: 'Thruster Step',
                descTr: '2 kare hareket et', descEn: 'Move up to 2 tiles'
            },
            shot: {
                id: 'shot', cost: 1, color: PAL.violet, sprite: 'energy_prism',
                nameTr: 'Plazma Atışı', nameEn: 'Plasma Shot',
                descTr: '4 menzil · 7 Hasar', descEn: 'Range 4 · 7 DMG'
            },
            slash: {
                id: 'slash', cost: 1, color: PAL.amber, sprite: 'fighter',
                nameTr: 'Nova Darbesi', nameEn: 'Nova Slash',
                descTr: 'Yakın 8 Hasar + İtme', descEn: 'Melee 8 DMG + Push'
            },
            shield: {
                id: 'shield', cost: 1, color: PAL.mint, sprite: 'shield_battery',
                nameTr: 'Faz Kalkanı', nameEn: 'Phase Shield',
                descTr: '+6 Blok kazan', descEn: 'Gain +6 Block'
            },
            emp: {
                id: 'emp', cost: 2, color: PAL.teal, sprite: 'cryo_crystal',
                nameTr: 'EMP Dalgası', nameEn: 'EMP Surge',
                descTr: 'Alan 6 Hasar + SERSEMLET', descEn: 'Cross AoE 6 DMG + STUN'
            },
            overdrive: {
                id: 'overdrive', cost: 0, color: PAL.gold, sprite: 'coin_star',
                nameTr: 'Aşırı Yükleme', nameEn: 'Overdrive',
                descTr: '+2 Enerji & +1 Kart', descEn: '+2 Energy & Draw 1'
            }
        };

        const BASE_DECK = ['step', 'step', 'step', 'shot', 'shot', 'shot', 'slash', 'slash', 'shield', 'shield', 'emp', 'overdrive'];

        const ENCOUNTERS = [
            {
                crates: [{ c: 2, r: 1 }, { c: 3, r: 2 }],
                enemies: [
                    { kind: 'drone', c: 4, r: 1, hp: 16 },
                    { kind: 'drone', c: 5, r: 2, hp: 16 }
                ]
            },
            {
                crates: [{ c: 2, r: 2 }, { c: 3, r: 0 }],
                enemies: [
                    { kind: 'drone', c: 3, r: 2, hp: 18 },
                    { kind: 'turret', c: 5, r: 1, hp: 16 },
                    { kind: 'drone', c: 4, r: 3, hp: 18 }
                ]
            },
            {
                crates: [{ c: 2, r: 1 }, { c: 2, r: 2 }, { c: 4, r: 2 }],
                enemies: [
                    { kind: 'drone', c: 3, r: 1, hp: 20 },
                    { kind: 'ufo', c: 5, r: 2, hp: 28 },
                    { kind: 'turret', c: 5, r: 0, hp: 18 }
                ]
            },
            {
                crates: [{ c: 1, r: 1 }, { c: 3, r: 1 }, { c: 3, r: 2 }],
                enemies: [
                    { kind: 'drone', c: 2, r: 3, hp: 22 },
                    { kind: 'drone', c: 4, r: 0, hp: 22 },
                    { kind: 'turret', c: 5, r: 1, hp: 20 },
                    { kind: 'turret', c: 5, r: 2, hp: 20 }
                ]
            },
            {
                crates: [{ c: 2, r: 0 }, { c: 2, r: 3 }, { c: 4, r: 1 }],
                enemies: [
                    { kind: 'drone', c: 3, r: 1, hp: 24 },
                    { kind: 'drone', c: 3, r: 2, hp: 24 },
                    { kind: 'ufo', c: 5, r: 1, hp: 32 },
                    { kind: 'ufo', c: 5, r: 3, hp: 32 }
                ]
            },
            {
                crates: [{ c: 2, r: 1 }, { c: 2, r: 2 }],
                enemies: [
                    { kind: 'boss', c: 5, r: 1, hp: 58 },
                    { kind: 'drone', c: 3, r: 0, hp: 22 },
                    { kind: 'drone', c: 4, r: 3, hp: 22 },
                    { kind: 'turret', c: 5, r: 3, hp: 20 }
                ]
            }
        ];

        return createEngine(ctx, 'deck-breach-tactics', (api) => {
            const { g, W, H, L, sfx, shake, spawnParticles, spawnRing, spawnFloat, drawSprite, drawNovaPortrait, drawPanel, drawBar, drawBeam, addButton, syncHud, triggerWin, triggerGameOver } = api;

            let level = clamp(Number(ctx.initialLevel || ctx.level || 1), 1, 6);
            const bgCanvas = buildSpaceBackdrop(912, PAL.violet, true);

            let player = { c: 0, r: 1, hp: 38, dispHp: 38, maxHp: 38, block: 0, dispBlock: 0, energy: 3, maxEnergy: 3, animX: 0, animY: 0 };
            let crates = [];
            let enemies = [];
            let drawPile = [];
            let hand = [];
            let discardPile = [];
            let selectedCardIdx = -1;
            let turn = 1;
            let score = 0;
            let kills = 0;
            let sectorStartScore = 0;
            let sectorStartKills = 0;
            let sectorStartHp = 38;
            let wonEncounter = false;
            let phase = 'PLAYER'; // 'PLAYER' | 'ENEMY'
            let enemyTimer = 0;
            let enemyQueueIdx = 0;
            let beams = [];
            let logLines = [];

            function tileCenter(c, r) {
                return { x: GRID_X + c * TILE_W + TILE_W * 0.5, y: GRID_Y + r * TILE_H + TILE_H * 0.5 };
            }

            function addLog(msg) {
                logLines.unshift(msg);
                if (logLines.length > 5) logLines.pop();
            }

            function shuffle(arr) {
                for (let i = arr.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    const tmp = arr[i];
                    arr[i] = arr[j];
                    arr[j] = tmp;
                }
                return arr;
            }

            function drawCards(count) {
                let reshuffled = false;
                for (let i = 0; i < count; i++) {
                    if (hand.length >= 6) break;
                    if (drawPile.length === 0) {
                        if (discardPile.length === 0) break;
                        drawPile = shuffle(discardPile.slice());
                        discardPile = [];
                        reshuffled = true;
                    }
                    hand.push(drawPile.pop());
                }
                if (reshuffled) {
                    const pPos = tileCenter(player.c, player.r);
                    spawnFloat(pPos.x, pPos.y - 36, L('DESTE KARIŞTIRILDI!', 'DECK RESHUFFLED!'), PAL.violet, 1.0);
                    addLog(L('Atık destesi karıştırıldı.', 'Discard reshuffled into Draw.'));
                }
            }

            function obstacleAt(c, r) {
                return crates.find((k) => k.c === c && k.r === r);
            }

            function enemyAt(c, r) {
                return enemies.find((e) => e.hp > 0 && e.c === c && e.r === r);
            }

            function inBounds(c, r) {
                return c >= 0 && c < GRID_COLS && r >= 0 && r < GRID_ROWS;
            }

            function computeIntents() {
                for (const e of enemies) {
                    if (e.hp <= 0) continue;
                    if (e.stunned) {
                        e.intent = { kind: 'stun', dmg: 0, tiles: [] };
                        continue;
                    }
                    if (e.kind === 'drone') {
                        const d = Math.abs(player.c - e.c) + Math.abs(player.r - e.r);
                        e.intent = {
                            kind: 'melee',
                            dmg: 5 + Math.floor(level * 0.7),
                            move: 2,
                            tiles: d <= 2 ? [{ c: player.c, r: player.r }] : []
                        };
                    } else if (e.kind === 'turret') {
                        // Locks straight row or column laser toward Nova
                        const tiles = [];
                        if (Math.abs(player.r - e.r) <= Math.abs(player.c - e.c)) {
                            const dir = player.c < e.c ? -1 : 1;
                            for (let c = e.c + dir; c >= 0 && c < GRID_COLS; c += dir) {
                                if (obstacleAt(c, e.r)) break;
                                tiles.push({ c, r: e.r });
                            }
                        } else {
                            const dir = player.r < e.r ? -1 : 1;
                            for (let r = e.r + dir; r >= 0 && r < GRID_ROWS; r += dir) {
                                if (obstacleAt(e.c, r)) break;
                                tiles.push({ c: e.c, r });
                            }
                        }
                        e.intent = { kind: 'beam', dmg: 6 + Math.floor(level * 0.6), tiles };
                    } else if (e.kind === 'ufo') {
                        // Aims a 3x3 cross blast centered on Nova's current tile (dodgeable!)
                        const tiles = [{ c: player.c, r: player.r }];
                        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dc, dr]) => {
                            if (inBounds(player.c + dc, player.r + dr)) tiles.push({ c: player.c + dc, r: player.r + dr });
                        });
                        e.intent = { kind: 'bomb', dmg: 7 + Math.floor(level * 0.6), tiles };
                    } else if (e.kind === 'boss') {
                        // Row + Column cross laser across Nova's position or boss row
                        const tiles = [];
                        for (let c = 0; c < GRID_COLS; c++) if (c !== e.c) tiles.push({ c, r: player.r });
                        e.intent = { kind: 'boss_sweep', dmg: 9, tiles };
                    }
                }
            }

            function initEncounter(lvl) {
                level = clamp(Number(lvl || 1), 1, 6);
                const enc = ENCOUNTERS[level - 1];
                player = {
                    c: 0, r: 1,
                    hp: level === 1 ? 38 : Math.min(38, player.hp + 14),
                    maxHp: 38,
                    block: 0,
                    energy: 3,
                    maxEnergy: 3,
                    animX: tileCenter(0, 1).x,
                    animY: tileCenter(0, 1).y
                };
                crates = enc.crates.map((k, idx) => ({
                    c: k.c, r: k.r,
                    sprite: idx % 2 === 0 ? 'cargo_crate' : 'asteroid'
                }));
                enemies = enc.enemies.map((sp) => {
                    const pos = tileCenter(sp.c, sp.r);
                    return {
                        kind: sp.kind,
                        c: sp.c, r: sp.r,
                        hp: sp.hp, dispHp: sp.hp, maxHp: sp.hp,
                        sprite: sp.kind === 'drone' ? 'alien_drone' : sp.kind === 'turret' ? 'laser_turret' : sp.kind === 'ufo' ? 'ufo' : 'boss_core',
                        stunned: false,
                        animX: pos.x, animY: pos.y,
                        intent: null
                    };
                });
                drawPile = shuffle(BASE_DECK.slice());
                discardPile = [];
                hand = [];
                selectedCardIdx = -1;
                turn = 1;
                phase = 'PLAYER';
                beams = [];
                logLines = [L(`Bölüm ${level}/6 başladı!`, `Breach ${level}/6 engaged!`)];
                drawCards(4);
                computeIntents();
            }

            function validTargetsForCard(cardId) {
                const list = [];
                if (cardId === 'step') {
                    // BFS distance <= 2 through walkable empty tiles
                    const seen = new Set([player.c + ',' + player.r]);
                    const q = [{ c: player.c, r: player.r, d: 0 }];
                    while (q.length) {
                        const cur = q.shift();
                        if (cur.d > 0) list.push({ c: cur.c, r: cur.r });
                        if (cur.d >= 2) continue;
                        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dc, dr]) => {
                            const nc = cur.c + dc, nr = cur.r + dr;
                            const key = nc + ',' + nr;
                            if (!inBounds(nc, nr) || seen.has(key) || obstacleAt(nc, nr) || enemyAt(nc, nr)) return;
                            seen.add(key);
                            q.push({ c: nc, r: nr, d: cur.d + 1 });
                        });
                    }
                } else if (cardId === 'shot') {
                    for (const e of enemies) {
                        if (e.hp <= 0) continue;
                        const d = Math.abs(e.c - player.c) + Math.abs(e.r - player.r);
                        if (d <= 4) list.push({ c: e.c, r: e.r });
                    }
                } else if (cardId === 'slash') {
                    [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dc, dr]) => {
                        const nc = player.c + dc, nr = player.r + dr;
                        if (inBounds(nc, nr) && enemyAt(nc, nr)) list.push({ c: nc, r: nr });
                    });
                } else if (cardId === 'shield' || cardId === 'overdrive') {
                    list.push({ c: player.c, r: player.r });
                } else if (cardId === 'emp') {
                    for (let c = 0; c < GRID_COLS; c++) {
                        for (let r = 0; r < GRID_ROWS; r++) {
                            if (Math.abs(c - player.c) + Math.abs(r - player.r) <= 3) {
                                list.push({ c, r });
                            }
                        }
                    }
                }
                return list;
            }

            function hurtEnemy(e, dmg, labelColor) {
                if (!e || e.hp <= 0) return;
                e.hp = Math.max(0, e.hp - dmg);
                score += dmg * 12;
                const pos = tileCenter(e.c, e.r);
                spawnParticles(pos.x, pos.y, labelColor || PAL.amber, 10, 110, 3, 0.35);
                spawnFloat(pos.x, pos.y - 18, '-' + dmg, labelColor || PAL.amber, 1.15);
                if (e.hp <= 0) {
                    kills++;
                    score += 150;
                    sfx(e.kind === 'boss' ? 'explodeBoss' : 'explodeSmall');
                    shake(e.kind === 'boss' ? 8 : 4, 0.2);
                    spawnRing(pos.x, pos.y, PAL.coral, 52, 0.35);
                    addLog(L('Düşman imha edildi!', 'Hostile neutralized!'));
                }
            }

            function playCardAt(cardIdx, tc, tr) {
                if (phase !== 'PLAYER' || api.isEnded()) return;
                const cardId = hand[cardIdx];
                const cfg = CARDS[cardId];
                if (!cfg || player.energy < cfg.cost) {
                    sfx('uiBack');
                    const pPos = tileCenter(player.c, player.r);
                    spawnFloat(pPos.x, pPos.y - 26, L('YETERSİZ ENERJİ!', 'LOW ENERGY!'), PAL.coral, 0.95);
                    return;
                }
                const valid = validTargetsForCard(cardId).some((t) => t.c === tc && t.r === tr);
                if (!valid) {
                    sfx('uiBack');
                    const tPosBad = tileCenter(tc, tr);
                    spawnFloat(tPosBad.x, tPosBad.y - 16, L('MENZİL DIŞI', 'INVALID TARGET'), PAL.amber, 0.9);
                    return;
                }

                player.energy -= cfg.cost;
                hand.splice(cardIdx, 1);
                discardPile.push(cardId);
                selectedCardIdx = -1;

                const pPos = tileCenter(player.c, player.r);
                const tPos = tileCenter(tc, tr);

                if (cardId === 'step') {
                    player.c = tc;
                    player.r = tr;
                    sfx('dash');
                    spawnRing(pPos.x, pPos.y, PAL.sky, 32, 0.25);
                    spawnRing(tPos.x, tPos.y, PAL.sky, 36, 0.3);
                    addLog(L(`Nova (${tc + 1},${tr + 1}) karesine uçtu`, `Nova boosted to (${tc + 1},${tr + 1})`));
                } else if (cardId === 'shot') {
                    sfx('shootLaser');
                    beams.push({ x1: pPos.x, y1: pPos.y, x2: tPos.x, y2: tPos.y, color: PAL.violet, width: 4, life: 0.24, maxLife: 0.24 });
                    const e = enemyAt(tc, tr);
                    hurtEnemy(e, 7, PAL.violet);
                    addLog(L('Plazma Atışı: -7 HP', 'Plasma Shot: -7 HP'));
                } else if (cardId === 'slash') {
                    sfx('shootPlasma');
                    beams.push({ x1: pPos.x, y1: pPos.y, x2: tPos.x, y2: tPos.y, color: PAL.amber, width: 5, life: 0.2, maxLife: 0.2 });
                    const e = enemyAt(tc, tr);
                    hurtEnemy(e, 8, PAL.amber);
                    if (e && e.hp > 0 && e.kind !== 'turret' && e.kind !== 'boss') {
                        const dc = Math.sign(tc - player.c);
                        const dr = Math.sign(tr - player.r);
                        const pc = e.c + dc, pr = e.r + dr;
                        if (!inBounds(pc, pr) || obstacleAt(pc, pr)) {
                            hurtEnemy(e, 4, PAL.coral);
                            spawnFloat(tPos.x, tPos.y - 34, L('ÇARPMA +4!', 'SLAM +4!'), PAL.coral, 1.1);
                            addLog(L('Nova Darbesi: -8 +4 Duvar!', 'Nova Slash: -8 +4 Wall Slam!'));
                        } else if (enemyAt(pc, pr)) {
                            const other = enemyAt(pc, pr);
                            hurtEnemy(e, 4, PAL.coral);
                            hurtEnemy(other, 4, PAL.coral);
                            spawnFloat(tPos.x, tPos.y - 34, L('ÇİFT ÇARPMA!', 'DOUBLE SLAM!'), PAL.coral, 1.1);
                        } else {
                            e.c = pc;
                            e.r = pr;
                        }
                    }
                } else if (cardId === 'shield') {
                    player.block += 6;
                    sfx('powerup');
                    spawnRing(pPos.x, pPos.y, PAL.mint, 44, 0.35);
                    spawnFloat(pPos.x, pPos.y - 24, '+6 BLOCK', PAL.mint, 1.1);
                    addLog(L('Faz Kalkanı: +6 Blok', 'Phase Shield: +6 Block'));
                } else if (cardId === 'emp') {
                    sfx('emp');
                    shake(5, 0.18);
                    spawnRing(tPos.x, tPos.y, PAL.teal, 95, 0.4);
                    const cross = [{ c: tc, r: tr }, { c: tc + 1, r: tr }, { c: tc - 1, r: tr }, { c: tc, r: tr + 1 }, { c: tc, r: tr - 1 }];
                    let hits = 0;
                    for (const pt of cross) {
                        const e = enemyAt(pt.c, pt.r);
                        if (e) {
                            hurtEnemy(e, 6, PAL.teal);
                            if (e.hp > 0) {
                                e.stunned = true;
                                e.intent = { kind: 'stun', dmg: 0, tiles: [] };
                                spawnFloat(tileCenter(e.c, e.r).x, tileCenter(e.c, e.r).y - 34, 'STUN!', PAL.teal, 1.0);
                            }
                            hits++;
                        }
                    }
                    addLog(L(`EMP Dalgası: ${hits} hedef sersemledi!`, `EMP Surge: ${hits} targets stunned!`));
                } else if (cardId === 'overdrive') {
                    player.energy += 2;
                    drawCards(1);
                    sfx('xpPickup');
                    spawnRing(pPos.x, pPos.y, PAL.gold, 42, 0.3);
                    spawnFloat(pPos.x, pPos.y - 24, '+2 ENERGY!', PAL.gold, 1.15);
                    addLog(L('Aşırı Yükleme: +2 Enerji & +1 Kart', 'Overdrive: +2 Energy & Draw 1'));
                }

                // Check encounter win
                if (enemies.every((e) => e.hp <= 0)) {
                    wonEncounter = true;
                    triggerWin({ score, level, turns: turn, kills }, {
                        title: L(`BÖLÜM ${level} TEMİZLENDİ!`, `BREACH ${level} CLEARED!`),
                        sub: L(`${turn} turda tüm birimler etkisiz.`, `Sector secured in ${turn} turns.`),
                        statLine: `SCORE ${score} · HP ${player.hp}/${player.maxHp}`,
                        nextLevel: level < 6 ? level + 1 : null,
                        replayLevel: level
                    });
                }
            }

            function startEnemyTurn() {
                if (phase !== 'PLAYER' || api.isEnded()) return;
                selectedCardIdx = -1;
                while (hand.length) discardPile.push(hand.pop());
                phase = 'ENEMY';
                enemyQueueIdx = 0;
                enemyTimer = 0.25;
                sfx('uiClick');
            }

            function hurtPlayer(dmg) {
                let rem = dmg;
                if (player.block > 0) {
                    const blk = Math.min(player.block, rem);
                    player.block -= blk;
                    rem -= blk;
                    if (blk > 0) {
                        sfx('hitShield');
                        spawnFloat(player.animX, player.animY - 26, L(`BLOK -${blk}`, `BLOCKED ${blk}`), PAL.mint, 1.0);
                    }
                }
                if (rem > 0) {
                    player.hp = Math.max(0, player.hp - rem);
                    sfx('playerHurt');
                    shake(5, 0.18);
                    spawnFloat(player.animX, player.animY - 18, `-${rem} HP`, PAL.coral, 1.2);
                    if (player.hp <= 0) {
                        triggerGameOver({ score, level, turn, kills }, {
                            title: L('KAPTAN NOVA DÜŞTÜ', 'CAPTAIN NOVA DOWN'),
                            sub: L(`Bölüm ${level}/6 · Tur ${turn}`, `Encounter ${level}/6 · Turn ${turn}`),
                            statLine: `SCORE ${score} · KILLS ${kills}`,
                            replayLevel: level
                        });
                    }
                }
            }

            function resolveOneEnemy(e) {
                if (e.stunned) {
                    e.stunned = false;
                    spawnFloat(e.animX, e.animY - 22, L('SERSEM', 'STUNNED'), PAL.teal, 0.95);
                    return;
                }
                const int = e.intent;
                if (!int) return;

                if (e.kind === 'drone') {
                    for (let s = 0; s < 2; s++) {
                        if (Math.abs(player.c - e.c) + Math.abs(player.r - e.r) <= 1) break;
                        const opts = [];
                        if (player.c > e.c) opts.push([1, 0]);
                        if (player.c < e.c) opts.push([-1, 0]);
                        if (player.r > e.r) opts.push([0, 1]);
                        if (player.r < e.r) opts.push([0, -1]);
                        let moved = false;
                        for (const [dc, dr] of opts) {
                            const nc = e.c + dc, nr = e.r + dr;
                            if (inBounds(nc, nr) && !obstacleAt(nc, nr) && !enemyAt(nc, nr) && !(nc === player.c && nr === player.r)) {
                                e.c = nc; e.r = nr; moved = true; break;
                            }
                        }
                        if (!moved) break;
                    }
                    if (Math.abs(player.c - e.c) + Math.abs(player.r - e.r) <= 1) {
                        const ep = tileCenter(e.c, e.r);
                        beams.push({ x1: ep.x, y1: ep.y, x2: player.animX, y2: player.animY, color: PAL.coral, width: 3.5, life: 0.22, maxLife: 0.22 });
                        hurtPlayer(int.dmg);
                    }
                } else {
                    const ep = tileCenter(e.c, e.r);
                    const hit = int.tiles.some((t) => t.c === player.c && t.r === player.r);
                    sfx('shootPlasma');
                    if (int.tiles.length > 0) {
                        const lastT = tileCenter(int.tiles[int.tiles.length - 1].c, int.tiles[int.tiles.length - 1].r);
                        beams.push({ x1: ep.x, y1: ep.y, x2: lastT.x, y2: lastT.y, color: PAL.coral, width: 4.5, life: 0.28, maxLife: 0.28 });
                        for (const t of int.tiles) {
                            const tp = tileCenter(t.c, t.r);
                            spawnRing(tp.x, tp.y, PAL.coral, 26, 0.25);
                        }
                    }
                    if (hit) hurtPlayer(int.dmg);
                }
            }

            initEncounter(level);

            return {
                restart(lvl) {
                    const nextLvl = clamp(Number(lvl || 1), 1, 6);
                    if (nextLvl <= 1) {
                        score = 0; kills = 0; player.hp = 38;
                        sectorStartScore = 0; sectorStartKills = 0; sectorStartHp = 38;
                    } else if (wonEncounter && nextLvl > level) {
                        sectorStartScore = score;
                        sectorStartKills = kills;
                        sectorStartHp = player.hp;
                    } else {
                        score = sectorStartScore;
                        kills = sectorStartKills;
                        player.hp = sectorStartHp;
                    }
                    wonEncounter = false;
                    player.dispHp = player.hp;
                    player.dispBlock = 0;
                    initEncounter(nextLvl);
                },
                onPointerDown(x, y, btn) {
                    if (btn === 2) { selectedCardIdx = -1; return; }
                    if (phase !== 'PLAYER' || api.isEnded()) return;
                    if (x >= GRID_X && x <= GRID_X + GRID_COLS * TILE_W && y >= GRID_Y && y <= GRID_Y + GRID_ROWS * TILE_H) {
                        const tc = Math.floor((x - GRID_X) / TILE_W);
                        const tr = Math.floor((y - GRID_Y) / TILE_H);
                        if (selectedCardIdx >= 0) {
                            playCardAt(selectedCardIdx, tc, tr);
                        }
                    }
                },
                onRightClick() {
                    selectedCardIdx = -1;
                },
                onKeyDown(e) {
                    if (phase !== 'PLAYER' || api.isEnded()) return;
                    if (e.key >= '1' && e.key <= '6') {
                        const idx = Number(e.key) - 1;
                        if (idx < hand.length) {
                            const cfg = CARDS[hand[idx]];
                            if (cfg.id === 'shield' || cfg.id === 'overdrive') {
                                playCardAt(idx, player.c, player.r);
                            } else {
                                selectedCardIdx = selectedCardIdx === idx ? -1 : idx;
                                sfx('uiClick');
                            }
                        }
                    } else if (e.key === ' ') {
                        e.preventDefault();
                        startEnemyTurn();
                    } else if (e.key === 'Escape') {
                        selectedCardIdx = -1;
                    }
                },
                update(dt) {
                    const pPos = tileCenter(player.c, player.r);
                    player.animX = lerp(player.animX, pPos.x, Math.min(1, dt * 14));
                    player.animY = lerp(player.animY, pPos.y, Math.min(1, dt * 14));
                    player.dispHp = lerp(player.dispHp, player.hp, Math.min(1, dt * 12));
                    player.dispBlock = lerp(player.dispBlock, player.block, Math.min(1, dt * 12));
                    for (const e of enemies) {
                        const ep = tileCenter(e.c, e.r);
                        e.animX = lerp(e.animX, ep.x, Math.min(1, dt * 14));
                        e.animY = lerp(e.animY, ep.y, Math.min(1, dt * 14));
                        e.dispHp = lerp(e.dispHp !== undefined ? e.dispHp : e.hp, e.hp, Math.min(1, dt * 12));
                    }
                    for (let i = beams.length - 1; i >= 0; i--) {
                        beams[i].life -= dt;
                        if (beams[i].life <= 0) beams.splice(i, 1);
                    }

                    if (phase === 'ENEMY' && !api.isEnded()) {
                        enemyTimer -= dt;
                        if (enemyTimer <= 0) {
                            while (enemyQueueIdx < enemies.length && enemies[enemyQueueIdx].hp <= 0) {
                                enemyQueueIdx++;
                            }
                            if (enemyQueueIdx < enemies.length) {
                                resolveOneEnemy(enemies[enemyQueueIdx]);
                                enemyQueueIdx++;
                                enemyTimer = 0.36;
                            } else if (!api.isEnded()) {
                                phase = 'PLAYER';
                                turn++;
                                player.block = 0;
                                player.energy = player.maxEnergy;
                                drawCards(4);
                                computeIntents();
                            }
                        }
                    }

                    syncHud({
                        score,
                        level,
                        hp: player.hp,
                        maxHp: player.maxHp,
                        energy: player.energy,
                        kills,
                        objective: L(`Bölüm ${level}/6 · Tur ${turn}`, `Breach ${level}/6 · Turn ${turn}`)
                    });
                },
                render(time) {
                    if (bgCanvas) g.drawImage(bgCanvas, 0, 0);
                    else { g.fillStyle = PAL.bg; g.fillRect(0, 0, W, H); }

                    // Top bar
                    drawPanel(12, 8, W - 24, 40, { radius: 10 });
                    g.save();
                    g.textBaseline = 'middle';
                    g.textAlign = 'left';
                    g.font = '700 13.5px ' + FONT_DISPLAY;
                    g.fillStyle = PAL.violet;
                    g.fillText(L(`GÜVERTE OPERASYONU ${level}/6`, `DECK BREACH ${level}/6`), 26, 28);
                    g.font = '600 12.5px ' + FONT_MONO;
                    g.fillStyle = PAL.text;
                    g.fillText(L(`TUR ${turn}`, `TURN ${turn}`), 255, 28);
                    g.fillStyle = phase === 'PLAYER' ? PAL.mint : PAL.amber;
                    g.fillText(phase === 'PLAYER' ? L('NOVA SIRASI', 'NOVA TURN') : L('DÜŞMAN SIRASI', 'ENEMY TURN'), 355, 28);
                    g.fillStyle = PAL.muted;
                    g.fillText(`SCORE ${score}`, 535, 28);
                    g.fillStyle = PAL.dim;
                    g.fillText(L('Sağ Tık: İptal · [Space] Tur Bitir', 'Right-Click: Cancel · [Space] End Turn'), 665, 28);
                    g.restore();

                    // Left panel: Captain Nova Vex
                    drawPanel(12, 58, 198, 314, { radius: 12 });
                    drawNovaPortrait(111, 108, 32, PAL.sky);
                    g.save();
                    g.textAlign = 'center';
                    g.textBaseline = 'middle';
                    g.font = '700 13px ' + FONT_DISPLAY;
                    g.fillStyle = PAL.text;
                    g.fillText('CAPT. NOVA VEX', 111, 154);
                    g.restore();

                    drawBar(26, 172, 170, 14, clamp(player.dispHp / player.maxHp, 0, 1), player.hp > 12 ? PAL.mint : PAL.coral, '#070b12');
                    g.save();
                    g.textAlign = 'center';
                    g.textBaseline = 'middle';
                    g.font = '700 10.5px ' + FONT_MONO;
                    g.fillStyle = '#ffffff';
                    g.fillText(`HP ${player.hp}/${player.maxHp}`, 111, 179);

                    // Shield & Energy badges
                    drawSprite('shield_battery', 50, 212, 24);
                    g.textAlign = 'left';
                    g.font = '700 13px ' + FONT_MONO;
                    g.fillStyle = PAL.mint;
                    g.fillText(L(`BLOK: ${player.block}`, `BLOCK: ${player.block}`), 68, 212);

                    drawSprite('energy_prism', 50, 246, 24);
                    g.fillStyle = PAL.gold;
                    g.fillText(L(`ENERJİ: ${player.energy}/${player.maxEnergy}`, `ENERGY: ${player.energy}/${player.maxEnergy}`), 68, 246);

                    g.font = '600 11px ' + FONT_MONO;
                    g.fillStyle = PAL.muted;
                    g.fillText(L(`DESTE: ${drawPile.length} · ATIK: ${discardPile.length}`, `DRAW: ${drawPile.length} · DISC: ${discardPile.length}`), 26, 280);

                    // Combat Log
                    g.font = '700 10.5px ' + FONT_DISPLAY;
                    g.fillStyle = PAL.sky;
                    g.fillText(L('TAKTİK KAYIT', 'COMBAT LOG'), 26, 304);
                    g.font = '400 10.5px ' + FONT_BODY;
                    g.fillStyle = PAL.muted;
                    for (let i = 0; i < Math.min(3, logLines.length); i++) {
                        g.fillText('• ' + logLines[i].slice(0, 25), 24, 322 + i * 16);
                    }
                    g.restore();

                    // 6x4 Grid
                    const validTargets = (phase === 'PLAYER' && selectedCardIdx >= 0) ? validTargetsForCard(hand[selectedCardIdx]) : [];
                    const validSet = new Set(validTargets.map((t) => t.c + ',' + t.r));

                    // Collect enemy danger tiles for visual telegraphing
                    const dangerTiles = new Set();
                    for (const e of enemies) {
                        if (e.hp <= 0 || !e.intent || !e.intent.tiles) continue;
                        for (const t of e.intent.tiles) dangerTiles.add(t.c + ',' + t.r);
                    }

                    const hoverC = api.pointer.x >= GRID_X && api.pointer.x <= GRID_X + GRID_COLS * TILE_W ? Math.floor((api.pointer.x - GRID_X) / TILE_W) : -1;
                    const hoverR = api.pointer.y >= GRID_Y && api.pointer.y <= GRID_Y + GRID_ROWS * TILE_H ? Math.floor((api.pointer.y - GRID_Y) / TILE_H) : -1;

                    for (let r = 0; r < GRID_ROWS; r++) {
                        for (let c = 0; c < GRID_COLS; c++) {
                            const tx = GRID_X + c * TILE_W;
                            const ty = GRID_Y + r * TILE_H;
                            const key = c + ',' + r;
                            const isValid = validSet.has(key);
                            const isDanger = dangerTiles.has(key);
                            const isHov = hoverC === c && hoverR === r;

                            g.save();
                            roundRectPath(g, tx + 3, ty + 3, TILE_W - 6, TILE_H - 6, 8);
                            g.fillStyle = isValid
                                ? (isHov ? 'rgba(56, 189, 248, 0.34)' : 'rgba(56, 189, 248, 0.16)')
                                : (isDanger ? 'rgba(251, 113, 133, 0.14)' : 'rgba(19, 27, 44, 0.88)');
                            g.fill();
                            g.strokeStyle = isValid
                                ? PAL.sky
                                : (isDanger ? 'rgba(251, 113, 133, 0.55)' : 'rgba(148, 163, 184, 0.20)');
                            g.lineWidth = isValid ? 2 : 1.1;
                            g.stroke();

                            if (isDanger && !isValid) {
                                g.fillStyle = 'rgba(251, 113, 133, 0.5)';
                                g.font = '700 10px ' + FONT_MONO;
                                g.textAlign = 'right';
                                g.fillText('!', tx + TILE_W - 9, ty + 16);
                            }
                            g.restore();
                        }
                    }

                    // Obstacles
                    for (const cr of crates) {
                        const pos = tileCenter(cr.c, cr.r);
                        drawSprite(cr.sprite, pos.x, pos.y, 44);
                        if (hoverC === cr.c && hoverR === cr.r) {
                            api.setTooltip(pos.x, pos.y, L('Siper Engeli', 'Solid Cover'), L('Işınları keser. İtilen düşman +4 çarpma hasarı alır!', 'Blocks beams. Pushed enemies take +4 Slam DMG!'));
                        }
                    }

                    // Player (Captain Nova Vex)
                    drawSprite('astronaut', player.animX, player.animY, 44, { glow: player.block > 0 ? PAL.mint : PAL.sky });
                    if (player.block > 0) {
                        g.save();
                        g.strokeStyle = PAL.mint;
                        g.lineWidth = 2;
                        g.setLineDash([4, 3]);
                        g.beginPath();
                        g.arc(player.animX, player.animY, 26, 0, TAU);
                        g.stroke();
                        g.restore();
                    }

                    // Enemies & Clear Telegraph Intents
                    for (const e of enemies) {
                        if (e.hp <= 0) continue;
                        if (!e.stunned && e.intent && e.intent.tiles && e.intent.tiles.length > 0 && e.kind !== 'drone') {
                            const tgt = e.intent.tiles[e.intent.tiles.length - 1];
                            const tp = tileCenter(tgt.c, tgt.r);
                            g.save();
                            g.strokeStyle = 'rgba(251, 113, 133, 0.38)';
                            g.lineWidth = 1.6;
                            g.setLineDash([4, 5]);
                            g.beginPath();
                            g.moveTo(e.animX, e.animY);
                            g.lineTo(tp.x, tp.y);
                            g.stroke();
                            g.restore();
                        }
                        drawSprite(e.sprite, e.animX, e.animY, e.kind === 'boss' ? 50 : 42, {
                            flipX: e.kind === 'turret',
                            glow: e.stunned ? PAL.teal : PAL.coral
                        });
                        drawBar(e.animX - 22, e.animY + 23, 44, 5, clamp((e.dispHp !== undefined ? e.dispHp : e.hp) / e.maxHp, 0, 1), PAL.coral, '#070b12', null);
                        g.save();
                        g.textAlign = 'center';
                        g.textBaseline = 'middle';
                        g.font = '700 10.5px ' + FONT_MONO;
                        const badgeText = e.stunned
                            ? 'STUN'
                            : (e.intent && e.intent.kind === 'melee' ? `⚔ ${e.intent.dmg}` : `⚡ ${e.intent ? e.intent.dmg : 0}`);
                        roundRectPath(g, e.animX - 21, e.animY - 34, 42, 16, 5);
                        g.fillStyle = e.stunned ? 'rgba(45, 212, 191, 0.85)' : 'rgba(251, 113, 133, 0.90)';
                        g.fill();
                        g.fillStyle = '#070b12';
                        g.fillText(badgeText, e.animX, e.animY - 26);
                        g.restore();

                        if (hoverC === e.c && hoverR === e.r) {
                            const desc = e.stunned
                                ? L('Bu tur sersemletildi!', 'Stunned this turn!')
                                : e.kind === 'drone'
                                    ? L(`2 kare ilerler, yakınsa ${e.intent.dmg} hasar vurur.`, `Moves up to 2 tiles & strikes for ${e.intent.dmg} DMG.`)
                                    : L(`Kırmızı işaretli karelere ${e.intent.dmg} ışın hasarı vurur.`, `Telegraphs ${e.intent.dmg} DMG onto highlighted danger tiles.`);
                            api.setTooltip(e.animX, e.animY, `${e.kind.toUpperCase()} (${e.hp}/${e.maxHp} HP)`, desc);
                        }
                    }

                    // Beams
                    for (const b of beams) {
                        g.save();
                        g.globalAlpha = clamp(b.life / b.maxLife, 0, 1);
                        drawBeam(b.x1, b.y1, b.x2, b.y2, b.color, b.width);
                        g.restore();
                    }

                    // Right Tactical Panel + End Turn
                    drawPanel(734, 58, 214, 314, { radius: 12 });
                    g.save();
                    g.textAlign = 'left';
                    g.textBaseline = 'middle';
                    g.font = '700 12.5px ' + FONT_DISPLAY;
                    g.fillStyle = PAL.sky;
                    g.fillText(L('TAKTİK İPUÇLARI', 'TACTICAL INTEL'), 750, 82);
                    g.font = '400 11.5px ' + FONT_BODY;
                    g.fillStyle = PAL.text;
                    const tips = [
                        L('1) Kart seç -> Hedef kareye tıkla', '1) Click Card -> Target Tile'),
                        L('2) Kırmızı (!) karelerden kaç!', '2) Dodge red (!) beam tiles!'),
                        L('3) Düşmanı duvar/kasaya it (+4)', '3) Push foes into walls (+4)'),
                        L('4) EMP ile tehlikeli atışı kes', '4) EMP stuns enemy intents')
                    ];
                    tips.forEach((ln, i) => g.fillText(ln, 750, 110 + i * 24));
                    g.restore();

                    addButton({
                        x: 752, y: 304, w: 178, h: 48,
                        label: L('TURU BİTİR [SPACE]', 'END TURN [SPACE]'),
                        accent: PAL.amber,
                        active: phase === 'PLAYER',
                        disabled: phase !== 'PLAYER',
                        onClick: () => startEnemyTurn()
                    });

                    // Bottom Card Hand Tray
                    drawPanel(12, 384, W - 24, 148, { radius: 12 });
                    const cardW = hand.length > 5 ? 132 : 148;
                    const gap = hand.length > 5 ? 10 : 14;
                    const startX = W * 0.5 - ((hand.length * cardW + Math.max(0, hand.length - 1) * gap) * 0.5);
                    hand.forEach((cardId, idx) => {
                        const cfg = CARDS[cardId];
                        const cx = startX + idx * (cardW + gap);
                        const cy = selectedCardIdx === idx ? 392 : 400;
                        const canAfford = phase === 'PLAYER' && player.energy >= cfg.cost;
                        const hov = addButton({
                            x: cx, y: cy, w: cardW, h: 122,
                            accent: cfg.color,
                            active: selectedCardIdx === idx,
                            disabled: !canAfford,
                            tooltipTitle: `${api.lang() === 'tr' ? cfg.nameTr : cfg.nameEn} (${cfg.cost} EN)`,
                            tooltip: api.lang() === 'tr' ? cfg.descTr : cfg.descEn,
                            onClick: () => {
                                if (cfg.id === 'shield' || cfg.id === 'overdrive') {
                                    playCardAt(idx, player.c, player.r);
                                } else {
                                    selectedCardIdx = selectedCardIdx === idx ? -1 : idx;
                                    sfx('uiClick');
                                }
                            }
                        });
                        // Render card internals cleanly on top
                        g.save();
                        g.globalAlpha = canAfford ? 1 : 0.45;
                        // Energy badge
                        g.fillStyle = cfg.color;
                        g.beginPath();
                        g.arc(cx + 20, cy + 20, 12, 0, TAU);
                        g.fill();
                        g.font = '700 13px ' + FONT_MONO;
                        g.fillStyle = '#070b12';
                        g.textAlign = 'center';
                        g.textBaseline = 'middle';
                        g.fillText(String(cfg.cost), cx + 20, cy + 20);

                        g.font = '600 10px ' + FONT_MONO;
                        g.fillStyle = PAL.muted;
                        g.textAlign = 'right';
                        g.fillText(`[${idx + 1}]`, cx + cardW - 10, cy + 18);

                        drawSprite(cfg.sprite, cx + cardW * 0.5, cy + 52, 38, { glow: hov ? cfg.color : null });

                        g.textAlign = 'center';
                        g.font = '700 12px ' + FONT_DISPLAY;
                        g.fillStyle = PAL.text;
                        g.fillText(api.lang() === 'tr' ? cfg.nameTr : cfg.nameEn, cx + cardW * 0.5, cy + 86);
                        g.font = '500 10.5px ' + FONT_BODY;
                        g.fillStyle = cfg.color;
                        g.fillText(api.lang() === 'tr' ? cfg.descTr : cfg.descEn, cx + cardW * 0.5, cy + 106);
                        g.restore();
                    });
                }
            };
        });
    }

    // =========================================================================
    // GAME 3: FLEET COMMANDER AUTO (3-Lane Real-Time Tug-of-War, 6 Fronts)
    // =========================================================================
    function mountFleetCommander(ctx) {
        const UNITS = {
            interceptor: {
                id: 'interceptor', cost: 2, count: 2, sprite: 'fighter', color: PAL.sky,
                hp: 58, dmg: 9, range: 105, cd: 0.58, speed: 108, size: 28,
                nameTr: 'Avcı Sürüsü', nameEn: 'Interceptor', descTr: '2x hızlı saldırı uçağı', descEn: '2x fast swarm fighters'
            },
            corvette: {
                id: 'corvette', cost: 4, count: 1, sprite: 'moon_lander', color: PAL.amber,
                hp: 245, shield: 70, dmg: 18, range: 82, cd: 0.95, speed: 54, size: 36,
                nameTr: 'Korvet Tank', nameEn: 'Corvette', descTr: 'Kalkanlı ağır zırh gemisi', descEn: 'Shielded frontline tank'
            },
            bomber: {
                id: 'bomber', cost: 5, count: 1, sprite: 'plasma_bomb', color: PAL.violet,
                hp: 105, dmg: 26, aoe: 72, range: 155, cd: 1.45, speed: 62, size: 34,
                nameTr: 'İyon Bombacı', nameEn: 'Ion Bomber', descTr: 'Alan hasarlı kuşatma topu', descEn: 'AoE siege plasma blasts'
            },
            repair: {
                id: 'repair', cost: 3, count: 1, sprite: 'shield_battery', color: PAL.mint,
                hp: 95, heal: 24, range: 135, cd: 1.05, speed: 68, size: 30,
                nameTr: 'Tamir Dronu', nameEn: 'Repair Drone', descTr: 'Ön safları sürekli onarır', descEn: 'Heals frontline allies'
            }
        };

        const ENEMY_TYPES = {
            swarmer: { sprite: 'alien_drone', hp: 54, dmg: 8, range: 52, cd: 0.65, speed: 92, size: 28, color: PAL.coral },
            raider: { sprite: 'fighter', hp: 74, dmg: 11, range: 110, cd: 0.72, speed: 78, size: 30, color: PAL.amber },
            beetle: { sprite: 'alien_drone', hp: 220, dmg: 17, range: 64, cd: 1.05, speed: 48, size: 38, color: PAL.violet },
            ufo: { sprite: 'ufo', hp: 175, dmg: 22, aoe: 62, range: 152, cd: 1.4, speed: 52, size: 38, color: PAL.sky }
        };

        const LANES_Y = [122, 240, 358];

        return createEngine(ctx, 'fleet-commander-auto', (api) => {
            const { g, W, H, L, sfx, shake, spawnParticles, spawnRing, spawnFloat, drawSprite, drawPanel, drawBar, drawBeam, addButton, syncHud, triggerWin, triggerGameOver } = api;

            let level = clamp(Number(ctx.initialLevel || ctx.level || 1), 1, 6);
            let bgCanvas = buildSpaceBackdrop(700 + level * 41, PAL.sky, true);

            let energy = 4.5;
            const maxEnergy = 10;
            let selectedUnit = 'interceptor';
            let allyCore = { hp: 600, maxHp: 600, x: 58, y: 240, cd: 0 };
            let enemyCore = { hp: 600, maxHp: 600, x: 902, y: 240, cd: 0 };
            let units = [];
            let shots = [];
            let beams = [];
            let aiTimer = 2.0;
            let stalemateTimer = 0;
            let score = 0;
            let sectorStartScore = 0;
            let wonFront = false;
            let kills = 0;

            function initFront(lvl) {
                level = clamp(Number(lvl || 1), 1, 6);
                bgCanvas = buildSpaceBackdrop(700 + level * 41, PAL.sky, true);
                energy = 5.0;
                selectedUnit = 'interceptor';
                allyCore = { hp: 600, maxHp: 600, x: 58, y: 240, cd: 0 };
                const eHp = 540 + (level - 1) * 140;
                enemyCore = { hp: eHp, maxHp: eHp, x: 902, y: 240, cd: 0 };
                units = [];
                shots = [];
                beams = [];
                aiTimer = 1.8;
                stalemateTimer = 0;
                kills = 0;
            }

            function spawnAlly(unitId, laneIdx) {
                if (api.isEnded()) return false;
                const cfg = UNITS[unitId];
                if (!cfg || energy < cfg.cost) {
                    sfx('uiBack');
                    return false;
                }
                energy -= cfg.cost;
                sfx('powerup');
                const cnt = cfg.count || 1;
                for (let i = 0; i < cnt; i++) {
                    const yOff = cnt === 2 ? (i === 0 ? -16 : 16) : (Math.random() - 0.5) * 14;
                    units.push({
                        team: 'ally',
                        kind: unitId,
                        lane: laneIdx,
                        x: 112 - i * 24,
                        y: LANES_Y[laneIdx] + yOff,
                        hp: cfg.hp, maxHp: cfg.hp,
                        shield: cfg.shield || 0, maxShield: cfg.shield || 0,
                        dmg: cfg.dmg || 0,
                        heal: cfg.heal || 0,
                        aoe: cfg.aoe || 0,
                        range: cfg.range,
                        cd: 0.25,
                        maxCd: cfg.cd,
                        speed: cfg.speed,
                        size: cfg.size,
                        sprite: cfg.sprite,
                        color: cfg.color,
                        dead: false
                    });
                }
                spawnRing(112, LANES_Y[laneIdx], cfg.color, 40, 0.3);
                return true;
            }

            function spawnEnemy(typeId, laneIdx) {
                const sp = ENEMY_TYPES[typeId];
                const scale = 1 + (level - 1) * 0.14;
                units.push({
                    team: 'enemy',
                    kind: typeId,
                    lane: laneIdx,
                    x: 848,
                    y: LANES_Y[laneIdx] + (Math.random() - 0.5) * 16,
                    hp: Math.round(sp.hp * scale),
                    maxHp: Math.round(sp.hp * scale),
                    shield: 0, maxShield: 0,
                    dmg: Math.round(sp.dmg * scale),
                    aoe: sp.aoe || 0,
                    range: sp.range,
                    cd: 0.4,
                    maxCd: sp.cd,
                    speed: sp.speed,
                    size: sp.size,
                    sprite: sp.sprite,
                    color: sp.color,
                    dead: false
                });
                spawnRing(848, LANES_Y[laneIdx], sp.color, 34, 0.28);
            }

            function damageUnit(u, dmg) {
                if (u.dead) return;
                stalemateTimer = 0;
                let d = dmg;
                if (u.shield > 0) {
                    const ab = Math.min(u.shield, d);
                    u.shield -= ab;
                    d -= ab;
                }
                u.hp -= d;
                if (u.hp <= 0) {
                    u.dead = true;
                    if (u.team === 'enemy') {
                        kills++;
                        score += 55;
                    }
                    sfx('explodeSmall', 0.2);
                    spawnParticles(u.x, u.y, u.color, 10, 110, 2.8, 0.35);
                }
            }

            initFront(level);

            return {
                restart(lvl) {
                    const nextLvl = clamp(Number(lvl || 1), 1, 6);
                    if (nextLvl <= 1) {
                        score = 0;
                        sectorStartScore = 0;
                    } else if (wonFront && nextLvl > level) {
                        sectorStartScore = score;
                    } else {
                        score = sectorStartScore;
                    }
                    wonFront = false;
                    initFront(nextLvl);
                },
                onPointerDown(x, y) {
                    if (y < 58 || y > 416) return;
                    const laneIdx = y < 181 ? 0 : (y < 299 ? 1 : 2);
                    spawnAlly(selectedUnit, laneIdx);
                },
                onKeyDown(e) {
                    if (e.key === '1') { selectedUnit = 'interceptor'; sfx('uiClick'); }
                    else if (e.key === '2') { selectedUnit = 'corvette'; sfx('uiClick'); }
                    else if (e.key === '3') { selectedUnit = 'bomber'; sfx('uiClick'); }
                    else if (e.key === '4') { selectedUnit = 'repair'; sfx('uiClick'); }
                    else if (e.key === 'q' || e.key === 'Q') spawnAlly(selectedUnit, 0);
                    else if (e.key === 'w' || e.key === 'W') spawnAlly(selectedUnit, 1);
                    else if (e.key === 'e' || e.key === 'E') spawnAlly(selectedUnit, 2);
                },
                update(dt) {
                    if (api.isEnded()) return;

                    stalemateTimer += dt;
                    energy = Math.min(maxEnergy, energy + dt * (1.28 + level * 0.05));

                    // Enemy AI Spawner
                    aiTimer -= dt;
                    if (aiTimer <= 0) {
                        const lane = Math.floor(Math.random() * 3);
                        const roll = Math.random();
                        let pick = 'swarmer';
                        if (level >= 2 && roll > 0.72) pick = 'ufo';
                        else if (roll > 0.46) pick = 'beetle';
                        else if (roll > 0.24) pick = 'raider';
                        spawnEnemy(pick, lane);
                        if (level >= 4 && Math.random() < 0.35) {
                            spawnEnemy('swarmer', (lane + 1) % 3);
                        }
                        aiTimer = Math.max(1.55, 3.35 - level * 0.28);
                    }

                    // Update units
                    for (let i = units.length - 1; i >= 0; i--) {
                        const u = units[i];
                        if (u.dead) {
                            units.splice(i, 1);
                            continue;
                        }
                        if (u.cd > 0) u.cd -= dt;

                        if (u.kind === 'repair') {
                            // Find injured ally in same lane
                            let targetAlly = null;
                            let frontAllyX = 110;
                            for (const o of units) {
                                if (!o.dead && o.team === 'ally' && o.lane === u.lane && o !== u) {
                                    frontAllyX = Math.max(frontAllyX, o.x);
                                    if (o.hp < o.maxHp && (!targetAlly || o.hp / o.maxHp < targetAlly.hp / targetAlly.maxHp)) {
                                        targetAlly = o;
                                    }
                                }
                            }
                            if (targetAlly && Math.abs(targetAlly.x - u.x) <= u.range) {
                                if (u.cd <= 0) {
                                    u.cd = u.maxCd;
                                    targetAlly.hp = Math.min(targetAlly.maxHp, targetAlly.hp + u.heal);
                                    targetAlly.shield = Math.min(targetAlly.maxShield, targetAlly.shield + 6);
                                    beams.push({ x1: u.x, y1: u.y, x2: targetAlly.x, y2: targetAlly.y, color: PAL.mint, width: 3, life: 0.22, maxLife: 0.22 });
                                    spawnFloat(targetAlly.x, targetAlly.y - 22, '+' + u.heal, PAL.mint, 0.9);
                                    sfx('xpPickup');
                                }
                            } else if (u.x < Math.max(160, frontAllyX - 64)) {
                                u.x += u.speed * dt;
                            }
                            continue;
                        }

                        // Combat units look for closest enemy in same lane (or converge on stalemate)
                        let target = null;
                        let bestD = Infinity;
                        const effRange = stalemateTimer > 7.5 ? u.range + Math.min(180, (stalemateTimer - 7.5) * 26) : u.range;
                        for (const o of units) {
                            if (o.dead || o.team === u.team || o.lane !== u.lane) continue;
                            const d = Math.abs(o.x - u.x);
                            if (d <= effRange && d < bestD) {
                                bestD = d;
                                target = o;
                            }
                        }

                        const coreTargetX = u.team === 'ally' ? 864 : 96;
                        const distToCore = Math.abs(coreTargetX - u.x);

                        if (target || distToCore <= effRange) {
                            if (u.cd <= 0) {
                                u.cd = u.maxCd;
                                const tx = target ? target.x : coreTargetX;
                                const ty = target ? target.y : LANES_Y[u.lane];
                                sfx(u.aoe ? 'shootPlasma' : 'shootLaser', 0.14);
                                shots.push({
                                    team: u.team,
                                    lane: u.lane,
                                    x: u.x + (u.team === 'ally' ? 14 : -14),
                                    y: u.y,
                                    tx, ty,
                                    target,
                                    targetCore: !target,
                                    dmg: u.dmg,
                                    aoe: u.aoe,
                                    color: u.color,
                                    speed: u.aoe ? 340 : 480
                                });
                            }
                            if (stalemateTimer > 5.0 && distToCore > 38) {
                                const driftDir = u.team === 'ally' ? 1 : -1;
                                u.x = clamp(u.x + driftDir * Math.max(14, u.speed * 0.35) * dt, 96, 864);
                            }
                        } else {
                            u.x += (u.team === 'ally' ? 1 : -1) * u.speed * dt;
                            if (stalemateTimer > 5.0) {
                                // Drift toward nearest opposing lane if lane is empty during a stall
                                let nearFoe = null;
                                let nearDist = Infinity;
                                for (const o of units) {
                                    if (!o.dead && o.team !== u.team) {
                                        const dd = dist(u.x, u.y, o.x, o.y);
                                        if (dd < nearDist) { nearDist = dd; nearFoe = o; }
                                    }
                                }
                                if (nearFoe && nearFoe.lane !== u.lane) {
                                    u.y += Math.sign(LANES_Y[nearFoe.lane] - u.y) * Math.min(48, u.speed * 0.6) * dt;
                                    if (Math.abs(u.y - LANES_Y[nearFoe.lane]) < 26) u.lane = nearFoe.lane;
                                }
                            }
                        }
                    }

                    // Allied Core emergency defense zap
                    allyCore.cd -= dt;
                    if (allyCore.cd <= 0) {
                        const near = units.find((u) => !u.dead && u.team === 'enemy' && u.x < 175);
                        if (near) {
                            allyCore.cd = 0.85;
                            beams.push({ x1: allyCore.x + 22, y1: near.y, x2: near.x, y2: near.y, color: PAL.sky, width: 3, life: 0.18, maxLife: 0.18 });
                            damageUnit(near, 14);
                            sfx('shootLaser');
                        }
                    }

                    // Shots update
                    for (let i = shots.length - 1; i >= 0; i--) {
                        const s = shots[i];
                        const tx = (s.target && !s.target.dead) ? s.target.x : s.tx;
                        const ty = (s.target && !s.target.dead) ? s.target.y : s.ty;
                        const dx = tx - s.x, dy = ty - s.y;
                        const d = Math.hypot(dx, dy);
                        const step = s.speed * dt;
                        if (d <= step + 8) {
                            if (s.aoe) {
                                spawnRing(tx, ty, s.color, s.aoe, 0.3);
                                for (const u of units) {
                                    if (!u.dead && u.team !== s.team && dist(tx, ty, u.x, u.y) <= s.aoe) {
                                        damageUnit(u, s.dmg);
                                    }
                                }
                            } else if (s.target && !s.target.dead) {
                                damageUnit(s.target, s.dmg);
                            }
                            if (s.targetCore) {
                                stalemateTimer = 0;
                                if (s.team === 'ally') {
                                    enemyCore.hp = Math.max(0, enemyCore.hp - s.dmg);
                                    score += s.dmg * 4;
                                    spawnFloat(880, ty - 20, '-' + s.dmg, PAL.amber, 1.0);
                                    if (enemyCore.hp <= 0) {
                                        wonFront = true;
                                        score += 500 + level * 150;
                                        shake(8, 0.3);
                                        triggerWin({ score, level, kills }, {
                                            title: L(`CEPHE ${level} KAZANILDI!`, `FRONT ${level} SECURED!`),
                                            sub: L('Düşman Komuta Çekirdeği imha edildi.', 'Enemy Command Core destroyed.'),
                                            statLine: `SCORE ${score} · KILLS ${kills}`,
                                            nextLevel: level < 6 ? level + 1 : null,
                                            replayLevel: level
                                        });
                                        return;
                                    }
                                } else {
                                    allyCore.hp = Math.max(0, allyCore.hp - s.dmg);
                                    sfx('playerHurt');
                                    spawnFloat(74, ty - 20, '-' + s.dmg, PAL.coral, 1.0);
                                    if (allyCore.hp <= 0) {
                                        triggerGameOver({ score, level, kills }, {
                                            title: L('KOMUTA ÇEKİRDEĞİ DÜŞTÜ', 'ALLIED CORE DESTROYED'),
                                            sub: L(`Cephe ${level}/6 savunması yarıldı.`, `Front ${level}/6 overwhelmed.`),
                                            statLine: `SCORE ${score} · KILLS ${kills}`,
                                            replayLevel: level
                                        });
                                        return;
                                    }
                                }
                            }
                            shots.splice(i, 1);
                        } else {
                            s.x += (dx / d) * step;
                            s.y += (dy / d) * step;
                            s.tx = tx;
                            s.ty = ty;
                        }
                    }

                    for (let i = beams.length - 1; i >= 0; i--) {
                        beams[i].life -= dt;
                        if (beams[i].life <= 0) beams.splice(i, 1);
                    }

                    syncHud({
                        score,
                        level,
                        hp: allyCore.hp,
                        maxHp: allyCore.maxHp,
                        energy: Math.floor(energy),
                        kills,
                        objective: L(`Cephe ${level}/6 · Çekirdek ${enemyCore.hp}/${enemyCore.maxHp}`, `Front ${level}/6 · Enemy Core ${enemyCore.hp}`)
                    });
                },
                render(time) {
                    if (bgCanvas) g.drawImage(bgCanvas, 0, 0);
                    else { g.fillStyle = PAL.bg; g.fillRect(0, 0, W, H); }

                    // Top Core HP Bar Header
                    drawPanel(12, 8, W - 24, 42, { radius: 10 });
                    g.save();
                    g.textBaseline = 'middle';
                    g.font = '700 12.5px ' + FONT_DISPLAY;
                    g.fillStyle = PAL.mint;
                    g.textAlign = 'left';
                    g.fillText(L('MÜTTEFİK ÇEKİRDEK', 'ALLIED CORE'), 24, 21);
                    drawBar(24, 31, 240, 12, allyCore.hp / allyCore.maxHp, PAL.mint, '#070b12');
                    g.font = '700 10px ' + FONT_MONO;
                    g.fillStyle = '#ffffff';
                    g.fillText(`${allyCore.hp}/${allyCore.maxHp}`, 115, 37);

                    g.textAlign = 'center';
                    g.font = '700 13.5px ' + FONT_DISPLAY;
                    g.fillStyle = PAL.sky;
                    g.fillText(L(`CEPHE ${level}/6`, `FRONT ${level}/6`), W * 0.5, 22);
                    g.font = '600 11.5px ' + FONT_MONO;
                    g.fillStyle = PAL.muted;
                    g.fillText(`SCORE ${score} · KILLS ${kills}`, W * 0.5, 38);

                    g.textAlign = 'right';
                    g.font = '700 12.5px ' + FONT_DISPLAY;
                    g.fillStyle = PAL.coral;
                    g.fillText(L('DÜŞMAN ÇEKİRDEĞİ', 'ENEMY CORE'), W - 24, 21);
                    drawBar(W - 264, 31, 240, 12, enemyCore.hp / enemyCore.maxHp, PAL.coral, '#070b12');
                    g.fillStyle = '#ffffff';
                    g.fillText(`${enemyCore.hp}/${enemyCore.maxHp}`, W - 110, 37);
                    g.restore();

                    // 3 Lanes
                    const laneNames = [L('ÜST HAT [Q]', 'TOP LANE [Q]'), L('ORTA HAT [W]', 'MID LANE [W]'), L('ALT HAT [E]', 'BOT LANE [E]')];
                    LANES_Y.forEach((ly, idx) => {
                        const hov = api.pointer.y >= ly - 56 && api.pointer.y <= ly + 56 && api.pointer.x > 16 && api.pointer.x < W - 16;
                        drawPanel(16, ly - 52, W - 32, 104, {
                            fill: hov ? 'rgba(56, 189, 248, 0.08)' : 'rgba(13, 19, 32, 0.68)',
                            stroke: hov ? UNITS[selectedUnit].color + '88' : 'rgba(148, 163, 184, 0.16)',
                            radius: 12
                        });
                        g.save();
                        g.strokeStyle = 'rgba(148, 163, 184, 0.14)';
                        g.setLineDash([10, 14]);
                        g.lineDashOffset = -time * 28;
                        g.beginPath();
                        g.moveTo(96, ly);
                        g.lineTo(W - 96, ly);
                        g.stroke();
                        g.setLineDash([]);

                        g.font = '700 11px ' + FONT_MONO;
                        g.fillStyle = hov ? UNITS[selectedUnit].color : PAL.dim;
                        g.textAlign = 'left';
                        g.fillText(laneNames[idx], 108, ly - 35);
                        if (hov && energy >= UNITS[selectedUnit].cost) {
                            drawSprite(UNITS[selectedUnit].sprite, 134, ly, 28, { alpha: 0.42, angle: Math.PI * 0.5 });
                        }
                        g.restore();
                    });

                    // Allied & Enemy Command Cores
                    drawSprite('warp_ring', allyCore.x, allyCore.y, 76, { angle: time * 0.8, glow: PAL.mint });
                    drawSprite('shield_battery', allyCore.x, allyCore.y, 32);
                    drawSprite('portal_vortex', enemyCore.x, enemyCore.y, 78, { angle: -time * 0.9, glow: PAL.coral });
                    drawSprite('boss_core', enemyCore.x, enemyCore.y, 44);

                    // Units
                    for (const u of units) {
                        const rot = u.sprite === 'fighter' || u.sprite === 'alien_drone'
                            ? (u.team === 'ally' ? Math.PI * 0.5 : -Math.PI * 0.5)
                            : 0;
                        drawSprite(u.sprite, u.x, u.y, u.size, {
                            angle: rot,
                            flipX: u.team === 'enemy' && u.sprite === 'ufo',
                            glow: u.team === 'ally' ? u.color : PAL.coral
                        });
                        if (u.shield > 0) {
                            drawBar(u.x - 16, u.y - u.size * 0.5 - 11, 32, 3, u.shield / u.maxShield, PAL.sky, '#070b12', null);
                        }
                        drawBar(u.x - 16, u.y - u.size * 0.5 - 6, 32, 4, u.hp / u.maxHp, u.team === 'ally' ? PAL.mint : PAL.coral, '#070b12', null);
                    }

                    // Shots & Beams
                    for (const s of shots) {
                        g.save();
                        g.fillStyle = s.color;
                        g.beginPath();
                        g.arc(s.x, s.y, s.aoe ? 5.5 : 3.5, 0, TAU);
                        g.fill();
                        g.restore();
                    }
                    for (const b of beams) {
                        g.save();
                        g.globalAlpha = clamp(b.life / b.maxLife, 0, 1);
                        drawBeam(b.x1, b.y1, b.x2, b.y2, b.color, b.width);
                        g.restore();
                    }

                    // Bottom Command Deck (Energy + 4 Unit Cards)
                    drawPanel(12, 424, W - 24, 108, { radius: 12 });
                    g.save();
                    g.textAlign = 'left';
                    g.textBaseline = 'middle';
                    g.font = '700 12px ' + FONT_DISPLAY;
                    g.fillStyle = PAL.sky;
                    g.fillText(L('WARP ENERJİSİ', 'WARP ENERGY'), 26, 444);
                    g.font = '700 14px ' + FONT_MONO;
                    g.fillStyle = PAL.gold;
                    g.fillText(`${energy.toFixed(1)} / ${maxEnergy}`, 160, 444);
                    g.restore();

                    // Segmented Energy bar
                    for (let i = 0; i < maxEnergy; i++) {
                        const segW = 20;
                        const sx = 24 + i * 22;
                        const fill = clamp(energy - i, 0, 1);
                        drawBar(sx, 458, segW, 12, fill, PAL.sky, '#070b12');
                    }
                    g.save();
                    g.font = '500 11px ' + FONT_BODY;
                    g.fillStyle = PAL.muted;
                    g.fillText(L('Birim seç [1-4], ardından hatta tıkla veya [Q/W/E]', 'Select unit [1-4], click lane or press [Q/W/E]'), 24, 496);
                    g.restore();

                    const unitIds = ['interceptor', 'corvette', 'bomber', 'repair'];
                    unitIds.forEach((uid, idx) => {
                        const cfg = UNITS[uid];
                        const bx = 266 + idx * 170;
                        const canAfford = energy >= cfg.cost;
                        addButton({
                            x: bx, y: 436, w: 160, h: 84,
                            sprite: cfg.sprite,
                            iconSize: 32,
                            label: `[${idx + 1}] ${api.lang() === 'tr' ? cfg.nameTr : cfg.nameEn}`,
                            sub: `${cfg.cost} EN · ${api.lang() === 'tr' ? cfg.descTr.slice(0, 18) : cfg.descEn.slice(0, 18)}`,
                            accent: cfg.color,
                            active: selectedUnit === uid,
                            subColor: canAfford ? cfg.color : PAL.coral,
                            tooltipTitle: `${api.lang() === 'tr' ? cfg.nameTr : cfg.nameEn} (${cfg.cost} EN)`,
                            tooltip: api.lang() === 'tr' ? cfg.descTr : cfg.descEn,
                            onClick: () => { selectedUnit = uid; sfx('uiClick'); }
                        });
                    });
                }
            };
        });
    }

    // =========================================================================
    // GAME 4: WORMHOLE ROULETTE RPG (8-Node Quantum Dice Dungeon)
    // =========================================================================
    function mountWormholeRoulette(ctx) {
        const DIE_FACES = [
            { id: 'ATK', color: PAL.coral, val: 6, labelTr: 'SALDIRI 6', labelEn: 'ATK 6' },
            { id: 'ATK', color: PAL.coral, val: 6, labelTr: 'SALDIRI 6', labelEn: 'ATK 6' },
            { id: 'SHD', color: PAL.sky, val: 5, labelTr: 'KALKAN +5', labelEn: 'SHD +5' },
            { id: 'CRIT', color: PAL.amber, val: 10, labelTr: 'KRİTİK 10', labelEn: 'CRIT 10' },
            { id: 'HEAL', color: PAL.mint, val: 5, labelTr: 'ONARIM +5', labelEn: 'HEAL +5' },
            { id: 'ENERGY', color: PAL.violet, val: 1, labelTr: 'ENERJİ +1', labelEn: 'ENERGY +1' }
        ];

        const RELICS = {
            reroll: { id: 'reroll', sprite: 'energy_prism', color: PAL.violet, nameTr: 'Kuantum Dengeleyici', nameEn: 'Quantum Stabilizer', descTr: 'Her tur +1 Ücretsiz Re-Roll', descEn: '+1 Free Re-Roll every turn' },
            baseshd: { id: 'baseshd', sprite: 'shield_battery', color: PAL.sky, nameTr: 'Aegis Kaplama', nameEn: 'Aegis Plating', descTr: 'Tur başı +2 Taban Kalkan', descEn: '+2 Base Shield each turn' },
            thorns: { id: 'thorns', sprite: 'cryo_crystal', color: PAL.teal, nameTr: 'Plazma Dikenleri', nameEn: 'Thorns Matrix', descTr: 'Hasar alınca düşmana 4 Hasar yansıt', descEn: 'Thorns: Reflect 4 DMG when hit' },
            power: { id: 'power', sprite: 'laser_turret', color: PAL.coral, nameTr: 'Aşırı Namlu', nameEn: 'Overclock Barrel', descTr: 'Tüm ATK/CRIT zarlarına +2 Hasar', descEn: '+2 DMG to all ATK & CRIT dice' },
            vamp: { id: 'vamp', sprite: 'coin_star', color: PAL.mint, nameTr: 'Vampir Çekirdek', nameEn: 'Vampiric Core', descTr: 'CRIT zarlarında +2 HP yenile', descEn: 'Heal +2 HP whenever you roll CRIT' }
        };

        const NODES = [
            { type: 'combat', sprite: 'alien_drone', nameTr: 'Hiçlik Öncüsü', nameEn: 'Void Scout', hp: 20, atk: 5, reward: 22 },
            { type: 'event', sprite: 'cargo_crate', nameTr: 'Enkaz Sandığı', nameEn: 'Derelict Cache' },
            { type: 'combat', sprite: 'alien_drone', nameTr: 'Zırhlı Akıncı', nameEn: 'Armored Ravager', hp: 28, atk: 7, reward: 28 },
            { type: 'shop', sprite: 'coin_star', nameTr: 'Uzay Tüccarı', nameEn: 'Wormhole Merchant' },
            { type: 'combat', sprite: 'ufo', nameTr: 'Elit UFO Muhafızı', nameEn: 'Elite UFO Warden', hp: 38, atk: 8, reward: 36 },
            { type: 'event', sprite: 'portal_vortex', nameTr: 'Anomali Sunağı', nameEn: 'Anomaly Shrine' },
            { type: 'combat', sprite: 'plasma_bomb', nameTr: 'Hiçlik Yok Edicisi', nameEn: 'Void Destroyer', hp: 46, atk: 10, reward: 42 },
            { type: 'boss', sprite: 'boss_core', nameTr: 'GEÇİT BEKÇİSİ BOSS', nameEn: 'GATEKEEPER BOSS', hp: 72, atk: 11, reward: 100 }
        ];

        return createEngine(ctx, 'wormhole-roulette-rpg', (api) => {
            const { g, W, H, L, sfx, shake, spawnParticles, spawnRing, spawnFloat, drawSprite, drawNovaPortrait, drawPanel, drawBar, drawBeam, addButton, syncHud, triggerWin, triggerGameOver } = api;

            let tier = Math.max(1, Number(ctx.initialLevel || ctx.level || 1));
            const bgCanvas = buildSpaceBackdrop(551 + tier * 19, PAL.amber, true);

            let nodeIdx = 0;
            let player = { hp: 46, dispHp: 46, maxHp: 46, shield: 0, dispShield: 0, energy: 0, shards: 35, relics: [] };
            let enemy = null;
            let dice = [0, 1, 2].map(() => ({ face: DIE_FACES[0], locked: false, spin: 0 }));
            let rerollsLeft = 2;
            let mode = 'COMBAT'; // 'COMBAT' | 'EVENT' | 'SHOP'
            let choices = [];
            let busyTimer = 0;
            let beams = [];
            let score = 0;
            let enemyAttackPending = false;
            let pendingNextNode = false;

            function hasRelic(id) {
                return player.relics.includes(id);
            }

            function rollDieFace() {
                return DIE_FACES[Math.floor(Math.random() * DIE_FACES.length)];
            }

            function rollUnlockedDice(freeSound) {
                for (const d of dice) {
                    if (!d.locked) {
                        d.face = rollDieFace();
                        d.spin = 0.25;
                    }
                }
                if (freeSound) sfx('uiClick');
            }

            function startTurn() {
                rerollsLeft = 2 + (hasRelic('reroll') ? 1 : 0);
                player.shield = hasRelic('baseshd') ? 2 : 0;
                for (const d of dice) d.locked = false;
                rollUnlockedDice(false);
            }

            function buildEventChoices() {
                const pool = Object.keys(RELICS).filter((id) => !hasRelic(id));
                const picked = pool.sort(() => Math.random() - 0.5).slice(0, 2);
                choices = picked.map((id) => ({ kind: 'relic', relic: RELICS[id], cost: 0 }));
                if (choices.length < 2) {
                    choices.push({ kind: 'heal', cost: 0, nameTr: 'Gövde Güçlendirme (+8 Maks HP)', nameEn: 'Hull Upgrade (+8 Max HP)', sprite: 'energy_prism', color: PAL.sky, maxHpBoost: 8 });
                }
                choices.push({ kind: 'heal', cost: 0, nameTr: 'Acil Onarım (+16 HP & +20 Shards)', nameEn: 'Field Repair (+16 HP & +20 Shards)', sprite: 'shield_battery', color: PAL.mint });
            }

            function buildShopChoices() {
                const pool = Object.keys(RELICS).filter((id) => !hasRelic(id));
                const picked = pool.sort(() => Math.random() - 0.5).slice(0, 2);
                choices = picked.map((id, i) => ({ kind: 'relic', relic: RELICS[id], cost: 30 + i * 10 }));
                if (choices.length < 2) {
                    choices.push({ kind: 'heal', cost: 25, nameTr: 'Gövde Güçlendirme (+8 Maks HP)', nameEn: 'Hull Upgrade (+8 Max HP)', sprite: 'energy_prism', color: PAL.sky, maxHpBoost: 8 });
                }
                choices.push({ kind: 'heal', cost: 18, nameTr: 'Tam Bakım (+20 HP)', nameEn: 'Full Hull Patch (+20 HP)', sprite: 'shield_battery', color: PAL.mint });
            }

            function enterNode(idx) {
                nodeIdx = idx;
                const n = NODES[nodeIdx];
                if (n.type === 'combat' || n.type === 'boss') {
                    mode = 'COMBAT';
                    const scale = 1 + (tier - 1) * 0.22;
                    enemy = {
                        sprite: n.sprite,
                        nameTr: n.nameTr,
                        nameEn: n.nameEn,
                        hp: Math.round(n.hp * scale),
                        dispHp: Math.round(n.hp * scale),
                        maxHp: Math.round(n.hp * scale),
                        atk: Math.round(n.atk * scale),
                        reward: n.reward,
                        isBoss: n.type === 'boss',
                        shield: n.type === 'boss' ? 10 : 0,
                        dispShield: n.type === 'boss' ? 10 : 0
                    };
                    if (n.type === 'boss') sfx('bossAlarm');
                    startTurn();
                } else if (n.type === 'event') {
                    mode = 'EVENT';
                    enemy = null;
                    buildEventChoices();
                    sfx('chestOpen');
                } else if (n.type === 'shop') {
                    mode = 'SHOP';
                    enemy = null;
                    buildShopChoices();
                    sfx('xpPickup');
                }
            }

            function initRun(lvl) {
                tier = Math.max(1, Number(lvl || 1));
                player = { hp: 46, dispHp: 46, maxHp: 46, shield: 0, dispShield: 0, energy: 0, shards: 35, relics: [] };
                score = 0;
                beams = [];
                busyTimer = 0;
                enemyAttackPending = false;
                pendingNextNode = false;
                enterNode(0);
            }

            function hitEnemy(dmg, pierce, col) {
                if (!enemy || enemy.hp <= 0) return;
                let rem = dmg;
                if (!pierce && enemy.shield > 0) {
                    const ab = Math.min(enemy.shield, rem);
                    enemy.shield -= ab;
                    rem -= ab;
                }
                enemy.hp = Math.max(0, enemy.hp - rem);
                score += dmg * 15;
                beams.push({ x1: 270, y1: 210, x2: 690, y2: 210, color: col || PAL.coral, width: pierce ? 5 : 3.5, life: 0.25, maxLife: 0.25 });
                spawnParticles(690, 210, col || PAL.coral, 12, 130, 3, 0.35);
                spawnFloat(690, 175, '-' + dmg + (pierce ? ' PIERCE!' : ''), col || PAL.coral, 1.15);
            }

            function commitDice() {
                if (mode !== 'COMBAT' || busyTimer > 0 || api.isEnded() || !enemy) return;
                const powerBonus = hasRelic('power') ? 2 : 0;
                let totalAtk = 0, totalCrit = 0, totalShd = 0, totalHeal = 0, totalEn = 0;

                for (const d of dice) {
                    if (d.face.id === 'ATK') totalAtk += d.face.val + powerBonus;
                    else if (d.face.id === 'CRIT') {
                        totalCrit += d.face.val + powerBonus;
                        if (hasRelic('vamp')) totalHeal += 2;
                    }
                    else if (d.face.id === 'SHD') totalShd += d.face.val;
                    else if (d.face.id === 'HEAL') totalHeal += d.face.val;
                    else if (d.face.id === 'ENERGY') totalEn += d.face.val;
                }

                if (totalShd > 0) {
                    player.shield += totalShd;
                    sfx('powerup');
                    spawnRing(270, 210, PAL.sky, 54, 0.32);
                    spawnFloat(270, 165, '+' + totalShd + ' SHD', PAL.sky, 1.1);
                }
                if (totalHeal > 0) {
                    player.hp = Math.min(player.maxHp, player.hp + totalHeal);
                    spawnFloat(270, 145, '+' + totalHeal + ' HP', PAL.mint, 1.1);
                }
                if (totalEn > 0) {
                    player.energy += totalEn;
                    spawnFloat(270, 185, '+' + totalEn + ' EN', PAL.violet, 1.0);
                }
                if (totalAtk > 0) {
                    sfx('shootLaser');
                    hitEnemy(totalAtk, false, PAL.coral);
                }
                if (totalCrit > 0) {
                    sfx('shootPlasma');
                    hitEnemy(totalCrit, true, PAL.amber);
                    shake(4, 0.14);
                }
                if (player.energy >= 3) {
                    player.energy -= 3;
                    player.shield += 5;
                    sfx('emp');
                    hitEnemy(14, true, PAL.violet);
                    spawnFloat(W * 0.5, 130, 'QUANTUM NOVA! 14 DMG +5 SHD', PAL.violet, 1.25);
                    shake(6, 0.2);
                }

                if (enemy.hp <= 0) {
                    sfx(enemy.isBoss ? 'explodeBoss' : 'explodeSmall');
                    player.shards += enemy.reward;
                    score += enemy.reward * 10;
                    spawnRing(690, 210, PAL.gold, 72, 0.4);
                    if (nodeIdx >= NODES.length - 1) {
                        triggerWin({ score, level: tier, node: 8, relics: player.relics.length }, {
                            title: L('GEÇİT BEKÇİSİ YENİLDİ!', 'GATEKEEPER SLAIN!'),
                            sub: L('8 Sektorlü Solucan Deliği tamamlandı!', 'Wormhole Roulette 8-Node Run Cleared!'),
                            statLine: `SCORE ${score} · RELICS ${player.relics.length}`,
                            nextLevel: tier + 1,
                            nextLabel: L('SONRAKİ ZORLUK', 'NEXT TIER'),
                            replayLevel: 1
                        });
                        return;
                    }
                    player.hp = Math.min(player.maxHp, player.hp + 5);
                    busyTimer = 0.42;
                    pendingNextNode = true;
                    return;
                }

                busyTimer = 0.55;
                enemyAttackPending = true;
            }

            function resolveEnemyStrike() {
                if (!enemy || enemy.hp <= 0) return;
                let dmg = enemy.atk + Math.floor(Math.random() * 2);
                if (enemy.isBoss && Math.random() < 0.35) {
                    enemy.shield += 6;
                    spawnFloat(690, 150, '+6 SHD', PAL.sky, 0.95);
                }
                beams.push({ x1: 690, y1: 210, x2: 270, y2: 210, color: PAL.coral, width: 4, life: 0.25, maxLife: 0.25 });
                let rem = dmg;
                if (player.shield > 0) {
                    const ab = Math.min(player.shield, rem);
                    player.shield -= ab;
                    rem -= ab;
                    sfx('hitShield');
                }
                if (rem > 0) {
                    player.hp = Math.max(0, player.hp - rem);
                    sfx('playerHurt');
                    shake(5, 0.16);
                    spawnFloat(270, 175, '-' + rem + ' HP', PAL.coral, 1.2);
                } else {
                    spawnFloat(270, 175, L('BLOKLANDI!', 'BLOCKED!'), PAL.mint, 1.1);
                }

                if (hasRelic('thorns')) {
                    hitEnemy(4, true, PAL.teal);
                }

                if (player.hp <= 0) {
                    triggerGameOver({ score, level: tier, node: nodeIdx + 1 }, {
                        title: L('SOLUCAN DELİĞİNDE KAYBOLDU', 'LOST IN THE WORMHOLE'),
                        sub: L(`Düğüm ${nodeIdx + 1}/8 · ${api.lang() === 'tr' ? NODES[nodeIdx].nameTr : NODES[nodeIdx].nameEn}`, `Node ${nodeIdx + 1}/8 · ${NODES[nodeIdx].nameEn}`),
                        statLine: `SCORE ${score} · RELICS ${player.relics.length}`,
                        replayLevel: tier
                    });
                    return;
                }

                if (enemy && enemy.hp <= 0) {
                    player.shards += enemy.reward;
                    if (nodeIdx >= NODES.length - 1) {
                        triggerWin({ score, level: tier, node: 8 }, {
                            title: L('GEÇİT BEKÇİSİ YENİLDİ!', 'GATEKEEPER SLAIN!'),
                            sub: L('Plazma dikenleri son darbeyi vurdu!', 'Thorns finished the Gatekeeper!'),
                            statLine: `SCORE ${score}`,
                            nextLevel: tier + 1,
                            replayLevel: 1
                        });
                        return;
                    }
                    enterNode(nodeIdx + 1);
                    return;
                }
                startTurn();
            }

            initRun(tier);

            return {
                restart(lvl) {
                    initRun(lvl || 1);
                },
                onKeyDown(e) {
                    if (mode === 'COMBAT' && busyTimer <= 0) {
                        if (e.key === '1' || e.key === '2' || e.key === '3') {
                            const d = dice[Number(e.key) - 1];
                            d.locked = !d.locked;
                            sfx('uiClick');
                        } else if (e.key === 'r' || e.key === 'R') {
                            if (rerollsLeft > 0) {
                                rerollsLeft--;
                                rollUnlockedDice(true);
                            }
                        } else if (e.key === ' ' || e.key === 'Enter') {
                            e.preventDefault();
                            commitDice();
                        }
                    }
                },
                update(dt) {
                    player.dispHp = lerp(player.dispHp !== undefined ? player.dispHp : player.hp, player.hp, Math.min(1, dt * 11));
                    player.dispShield = lerp(player.dispShield !== undefined ? player.dispShield : player.shield, player.shield, Math.min(1, dt * 12));
                    if (enemy) {
                        enemy.dispHp = lerp(enemy.dispHp !== undefined ? enemy.dispHp : enemy.hp, enemy.hp, Math.min(1, dt * 11));
                        enemy.dispShield = lerp(enemy.dispShield !== undefined ? enemy.dispShield : enemy.shield, enemy.shield, Math.min(1, dt * 12));
                    }
                    for (const d of dice) {
                        if (d.spin > 0) d.spin = Math.max(0, d.spin - dt);
                    }
                    for (let i = beams.length - 1; i >= 0; i--) {
                        beams[i].life -= dt;
                        if (beams[i].life <= 0) beams.splice(i, 1);
                    }
                    if (busyTimer > 0) {
                        busyTimer -= dt;
                        if (busyTimer <= 0) {
                            if (pendingNextNode) {
                                pendingNextNode = false;
                                enterNode(nodeIdx + 1);
                            } else if (enemyAttackPending) {
                                enemyAttackPending = false;
                                resolveEnemyStrike();
                            }
                        }
                    }

                    syncHud({
                        score,
                        level: nodeIdx + 1,
                        hp: player.hp,
                        maxHp: player.maxHp,
                        credits: player.shards,
                        objective: L(`Düğüm ${nodeIdx + 1}/8 · Kalıntı ${player.relics.length}`, `Node ${nodeIdx + 1}/8 · Relics ${player.relics.length}`)
                    });
                },
                render(time) {
                    if (bgCanvas) g.drawImage(bgCanvas, 0, 0);
                    else { g.fillStyle = PAL.bg; g.fillRect(0, 0, W, H); }

                    // Top 8-Node Wormhole Track
                    drawPanel(16, 10, W - 32, 58, { radius: 12 });
                    for (let i = 0; i < NODES.length; i++) {
                        const nx = 76 + i * 114;
                        const ny = 39;
                        if (i < NODES.length - 1) {
                            g.save();
                            g.strokeStyle = i < nodeIdx ? PAL.mint : 'rgba(148, 163, 184, 0.28)';
                            g.lineWidth = 3;
                            g.beginPath();
                            g.moveTo(nx + 20, ny);
                            g.lineTo(nx + 94, ny);
                            g.stroke();
                            g.restore();
                        }
                        const n = NODES[i];
                        const cur = i === nodeIdx;
                        const done = i < nodeIdx;
                        g.save();
                        g.beginPath();
                        g.arc(nx, ny, cur ? 21 : 17, 0, TAU);
                        g.fillStyle = done ? 'rgba(52, 211, 153, 0.22)' : (cur ? 'rgba(245, 158, 11, 0.25)' : 'rgba(15, 23, 42, 0.92)');
                        g.fill();
                        g.strokeStyle = done ? PAL.mint : (cur ? PAL.amber : 'rgba(148, 163, 184, 0.35)');
                        g.lineWidth = cur ? 2.4 : 1.3;
                        g.stroke();
                        g.restore();
                        drawSprite(n.sprite, nx, ny, 24, { alpha: done ? 0.55 : 1 });
                        if (dist(api.pointer.x, api.pointer.y, nx, ny) <= 22) {
                            const typeDesc = n.type === 'boss'
                                ? L('Geçit Bekçisi Boss · Kazan ve turu bitir!', 'Gatekeeper Boss · Defeat to clear tier!')
                                : (n.type === 'shop'
                                    ? L('Tüccar: Shard ile Kalıntı veya Onarım al', 'Merchant: Spend Shards on Relics & Hull repair')
                                    : (n.type === 'event'
                                        ? L('Anomali Olayı: Ücretsiz Kalıntı veya Şifa seç', 'Event Node: Pick a free Relic or Repair reward')
                                        : L('Çatışma Düğümü · Ödül kazan!', 'Combat Node · Defeat enemy for Shards!')));
                            api.setTooltip(nx, ny, `${i + 1}/8 · ${api.lang() === 'tr' ? n.nameTr : n.nameEn}`, typeDesc);
                        }
                    }

                    // Arena Platforms (Left: Player, Right: Enemy/Event)
                    drawPanel(20, 80, 440, 246, { radius: 14 });
                    drawNovaPortrait(95, 145, 38, PAL.sky);
                    drawSprite('astronaut', 270, 210, 68, { glow: player.shield > 0 ? PAL.sky : PAL.mint });
                    if (player.shield > 0) {
                        g.save();
                        g.strokeStyle = PAL.sky;
                        g.lineWidth = 2.5;
                        g.beginPath();
                        g.arc(270, 210, 44, 0, TAU);
                        g.stroke();
                        g.restore();
                    }

                    g.save();
                    g.textAlign = 'left';
                    g.textBaseline = 'middle';
                    g.font = '700 14px ' + FONT_DISPLAY;
                    g.fillStyle = PAL.text;
                    g.fillText('CAPT. NOVA VEX', 148, 114);
                    drawBar(148, 130, 175, 14, clamp((player.dispHp !== undefined ? player.dispHp : player.hp) / player.maxHp, 0, 1), player.hp > 14 ? PAL.mint : PAL.coral, '#070b12');
                    if (player.dispShield > 0.2) {
                        drawBar(148, 146, 175, 4, clamp(player.dispShield / Math.max(15, player.maxHp * 0.4), 0, 1), PAL.sky, '#070b12', null);
                    }
                    g.font = '700 10.5px ' + FONT_MONO;
                    g.fillStyle = '#ffffff';
                    g.fillText(`HP ${player.hp}/${player.maxHp}`, 156, 137);

                    g.fillStyle = PAL.sky;
                    g.fillText(`SHD: ${player.shield}`, 148, 164);
                    g.fillStyle = PAL.violet;
                    g.fillText(`ENERGY: ${player.energy}/3`, 235, 164);
                    g.fillStyle = PAL.gold;
                    g.fillText(`SHARDS: ${player.shards}`, 148, 184);
                    g.restore();

                    // Relics Strip inside Player Panel
                    g.save();
                    g.font = '700 11px ' + FONT_DISPLAY;
                    g.fillStyle = PAL.muted;
                    g.fillText(L('AKTİF KALINTILAR:', 'RELICS:'), 34, 276);
                    g.restore();
                    player.relics.forEach((rid, i) => {
                        const rel = RELICS[rid];
                        const rx = 48 + i * 52;
                        const ry = 302;
                        drawSprite(rel.sprite, rx, ry, 28, { glow: rel.color });
                        if (dist(api.pointer.x, api.pointer.y, rx, ry) <= 18) {
                            api.setTooltip(rx, ry, api.lang() === 'tr' ? rel.nameTr : rel.nameEn, api.lang() === 'tr' ? rel.descTr : rel.descEn);
                        }
                    });

                    // Right Panel: Enemy or Event/Shop Banner
                    drawPanel(480, 80, 460, 246, { radius: 14, stroke: mode === 'COMBAT' ? PAL.coral + '66' : PAL.gold + '66' });
                    if (mode === 'COMBAT' && enemy) {
                        drawSprite(enemy.sprite, 690, 210, enemy.isBoss ? 86 : 72, { glow: PAL.coral });
                        g.save();
                        g.textAlign = 'center';
                        g.textBaseline = 'middle';
                        g.font = '700 16px ' + FONT_DISPLAY;
                        g.fillStyle = PAL.coral;
                        g.fillText(api.lang() === 'tr' ? enemy.nameTr : enemy.nameEn, 710, 112);
                        drawBar(585, 130, 250, 15, clamp((enemy.dispHp !== undefined ? enemy.dispHp : enemy.hp) / enemy.maxHp, 0, 1), PAL.coral, '#070b12');
                        if (enemy.dispShield > 0.2) {
                            drawBar(585, 147, 250, 4, clamp(enemy.dispShield / Math.max(15, enemy.maxHp * 0.4), 0, 1), PAL.sky, '#070b12', null);
                        }
                        g.font = '700 11px ' + FONT_MONO;
                        g.fillStyle = '#ffffff';
                        g.fillText(`HP ${enemy.hp}/${enemy.maxHp}` + (enemy.shield > 0 ? ` (+${enemy.shield} SHD)` : ''), 710, 138);

                        roundRectPath(g, 605, 272, 210, 34, 8);
                        g.fillStyle = 'rgba(251, 113, 133, 0.16)';
                        g.fill();
                        g.strokeStyle = PAL.coral;
                        g.stroke();
                        g.font = '700 12px ' + FONT_MONO;
                        g.fillStyle = PAL.coral;
                        g.fillText(L(`NİYET: ${enemy.atk} HASAR SALDIRI`, `INTENT: STRIKE ${enemy.atk} DMG`), 710, 289);
                        g.restore();
                        if (pointInRect(api.pointer.x, api.pointer.y, { x: 605, y: 272, w: 210, h: 34 })) {
                            api.setTooltip(710, 272, L('Düşman Tur Saldırısı', 'Enemy Turn Intent'), L(`Tur sonunda ${enemy.atk} hasar vurur. Önce Kalkan (SHD) emilir!`, `Strikes for ~${enemy.atk} DMG after your dice roll. Blocked by Shield first!`));
                        }
                    } else {
                        const node = NODES[nodeIdx];
                        drawSprite(node.sprite, 710, 185, 76, { glow: PAL.gold });
                        g.save();
                        g.textAlign = 'center';
                        g.font = '700 18px ' + FONT_DISPLAY;
                        g.fillStyle = PAL.gold;
                        g.fillText(api.lang() === 'tr' ? node.nameTr : node.nameEn, 710, 118);
                        g.font = '500 12.5px ' + FONT_BODY;
                        g.fillStyle = PAL.text;
                        g.fillText(mode === 'SHOP' ? L('Kalıntı veya onarım satın al!', 'Spend Shards on Relics or Repair!') : L('Aşağıdan 1 ödül seç!', 'Choose 1 reward below!'), 710, 260);
                        g.restore();
                    }

                    // Beams
                    for (const b of beams) {
                        g.save();
                        g.globalAlpha = clamp(b.life / b.maxLife, 0, 1);
                        drawBeam(b.x1, b.y1, b.x2, b.y2, b.color, b.width);
                        g.restore();
                    }

                    // Bottom Tray: Dice (Combat) OR Choices (Event / Shop)
                    drawPanel(20, 340, W - 40, 190, { radius: 14 });
                    if (mode === 'COMBAT') {
                        g.save();
                        g.textAlign = 'left';
                        g.font = '700 12px ' + FONT_DISPLAY;
                        g.fillStyle = PAL.sky;
                        g.fillText(L('KUANTUM AKSİYON ZARLARI (Kilitlemek için tıkla [1-3])', 'QUANTUM ACTION DICE (Click or [1-3] to Lock)'), 42, 364);
                        g.restore();

                        dice.forEach((d, idx) => {
                            const dx = 54 + idx * 172;
                            const dy = 384;
                            const wob = d.spin > 0 ? Math.sin(time * 40 + idx) * 6 : 0;
                            const dieTipMap = {
                                ATK: L('Düşmana 6 lazer hasarı verir (+Kalıntı bonusu).', 'Deals 6 laser damage to the enemy (+Relic bonuses).'),
                                SHD: L('Bu tur düşman saldırısını emen +5 Kalkan verir.', 'Grants +5 Shield for this turn to absorb enemy strikes.'),
                                CRIT: L('10 Yüksek Kritik Hasar vurur!', 'Unleashes 10 heavy Critical damage!'),
                                HEAL: L('Gövdeden +5 HP onarır.', 'Restores +5 Hull HP immediately.'),
                                ENERGY: L('+1 Enerji verir. 3 Enerji Kuantum Nova (14 Hasar + 5 Kalkan) tetikler!', 'Grants +1 Energy. 3 Energy fires Quantum Nova (14 DMG + 5 SHD)!')
                            };
                            addButton({
                                x: dx, y: dy + wob, w: 152, h: 126,
                                accent: d.locked ? PAL.gold : d.face.color,
                                active: d.locked,
                                tooltipTitle: (api.lang() === 'tr' ? d.face.labelTr : d.face.labelEn) + (d.locked ? L(' (KİLİTLİ)', ' (LOCKED)') : ''),
                                tooltip: (dieTipMap[d.face.id] || '') + '\n' + L('Tıkla veya [1-3] ile kilitle / aç.', 'Click or press [1-3] to Lock / Unlock.'),
                                onClick: () => {
                                    if (busyTimer > 0) return;
                                    d.locked = !d.locked;
                                    sfx('uiClick');
                                }
                            });
                            g.save();
                            g.textAlign = 'center';
                            g.textBaseline = 'middle';
                            g.font = '700 11px ' + FONT_MONO;
                            g.fillStyle = d.locked ? PAL.gold : PAL.muted;
                            g.fillText(d.locked ? L('🔒 KİLİTLİ', '🔒 LOCKED') : `[${idx + 1}]`, dx + 76, dy + wob + 20);

                            g.font = '700 24px ' + FONT_DISPLAY;
                            g.fillStyle = d.face.color;
                            g.fillText(d.face.id, dx + 76, dy + wob + 62);

                            g.font = '600 12px ' + FONT_MONO;
                            g.fillStyle = PAL.text;
                            g.fillText(api.lang() === 'tr' ? d.face.labelTr : d.face.labelEn, dx + 76, dy + wob + 100);
                            g.restore();
                        });

                        addButton({
                            x: 604, y: 390, w: 310, h: 54,
                            label: L(`YENİDEN AT [R] (${rerollsLeft} HAK)`, `RE-ROLL UNLOCKED [R] (${rerollsLeft})`),
                            accent: PAL.violet,
                            disabled: rerollsLeft <= 0 || busyTimer > 0,
                            onClick: () => {
                                if (rerollsLeft > 0 && busyTimer <= 0) {
                                    rerollsLeft--;
                                    rollUnlockedDice(true);
                                }
                            }
                        });

                        addButton({
                            x: 604, y: 456, w: 310, h: 56,
                            label: L('ZARLARI UYGULA! [SPACE]', 'COMMIT DICE! [SPACE]'),
                            accent: PAL.mint,
                            active: true,
                            disabled: busyTimer > 0,
                            onClick: () => commitDice()
                        });
                    } else {
                        choices.forEach((ch, idx) => {
                            const cx = 42 + idx * 298;
                            const isRel = ch.kind === 'relic';
                            const canBuy = player.shards >= ch.cost;
                            const title = isRel ? (api.lang() === 'tr' ? ch.relic.nameTr : ch.relic.nameEn) : (api.lang() === 'tr' ? ch.nameTr : ch.nameEn);
                            const desc = isRel ? (api.lang() === 'tr' ? ch.relic.descTr : ch.relic.descEn) : (mode === 'SHOP' ? L('Mevcut gövdeyi tamir et', 'Restore 20 Hull HP') : L('+16 HP & +20 Shards kazan', 'Gain +16 HP & +20 Shards'));
                            addButton({
                                x: cx, y: 372, w: 278, h: 96,
                                sprite: isRel ? ch.relic.sprite : ch.sprite,
                                iconSize: 36,
                                label: title,
                                sub: ch.cost > 0 ? `${ch.cost} SHARDS` : desc.slice(0, 28),
                                accent: isRel ? ch.relic.color : ch.color,
                                disabled: !canBuy,
                                tooltipTitle: title,
                                tooltip: desc,
                                onClick: () => {
                                    if (!canBuy) return;
                                    player.shards -= ch.cost;
                                    if (isRel) {
                                        player.relics.push(ch.relic.id);
                                        sfx('powerup');
                                    } else if (ch.maxHpBoost) {
                                        player.maxHp += ch.maxHpBoost;
                                        player.hp = Math.min(player.maxHp, player.hp + ch.maxHpBoost);
                                        sfx('powerup');
                                    } else {
                                        player.hp = Math.min(player.maxHp, player.hp + (mode === 'SHOP' ? 20 : 16));
                                        if (mode === 'EVENT') player.shards += 20;
                                        sfx('xpPickup');
                                    }
                                    if (mode === 'EVENT') {
                                        enterNode(nodeIdx + 1);
                                    } else {
                                        choices.splice(idx, 1);
                                    }
                                }
                            });
                        });
                        if (mode === 'SHOP') {
                            addButton({
                                x: W * 0.5 - 110, y: 480, w: 220, h: 38,
                                label: L('SONRAKİ DÜĞÜME GEÇ ->', 'DEPART TO NEXT NODE ->'),
                                accent: PAL.sky,
                                onClick: () => { sfx('uiConfirm'); enterNode(nodeIdx + 1); }
                            });
                        }
                    }
                }
            };
        });
    }

    // =========================================================================
    // GAME 5: MINING TYCOON IDLE (Cryo-Asteroid + Heat Overdrive x3 + Prestige)
    // =========================================================================
    function mountMiningTycoon(ctx) {
        const UPGRADES = [
            { id: 'click', sprite: 'energy_prism', color: PAL.gold, baseCost: 20, mult: 1.45, yield: 0, clickBonus: 5, heatRate: 0, nameTr: 'Plazma Kazma', nameEn: 'Plasma Pick' },
            { id: 'drone', sprite: 'moon_lander', color: PAL.sky, baseCost: 45, mult: 1.32, yield: 7, clickBonus: 0, heatRate: 0.6, nameTr: 'Maden Dronu', nameEn: 'Mining Drone' },
            { id: 'drill', sprite: 'laser_turret', color: PAL.coral, baseCost: 190, mult: 1.35, yield: 28, clickBonus: 0, heatRate: 2.3, nameTr: 'Lazer Matkap', nameEn: 'Laser Drill' },
            { id: 'cooler', sprite: 'cryo_crystal', color: PAL.teal, baseCost: 140, mult: 1.34, yield: 14, clickBonus: 0, heatRate: -2.9, nameTr: 'Kriyo Soğutucu', nameEn: 'Cryo Cooler' },
            { id: 'smelter', sprite: 'cargo_crate', color: PAL.amber, baseCost: 750, mult: 1.38, yield: 105, clickBonus: 0, heatRate: 3.4, nameTr: 'Yörünge İzabe', nameEn: 'Orbital Smelter' }
        ];

        return createEngine(ctx, 'mining-tycoon-idle', (api) => {
            const { g, W, H, L, sfx, shake, spawnParticles, spawnRing, spawnFloat, drawSprite, drawPanel, drawBar, drawBeam, addButton, syncHud, triggerWin } = api;

            let prestigeTier = Math.max(1, Number(ctx.initialLevel || ctx.level || 1));
            const bgCanvas = buildSpaceBackdrop(322, PAL.teal, true);

            let shards = 0;
            let totalShards = 0;
            let prestigeGoal = 5000;
            let owned = { click: 1, drone: 0, drill: 0, cooler: 0, smelter: 0 };

            let heat = 15;
            let overdriveTimer = 0;
            let throttleTimer = 0;
            let needlePos = 0.5;
            let needleDir = 1;
            let corePulse = 0;
            let coreAngle = 0;
            let score = 0;
            let prestigeWonThisTier = false;
            let milestoneMask = 0;

            const AST_X = 285;
            const AST_Y = 232;
            const AST_R = 92;

            function prestigeMult() {
                return 1 + (prestigeTier - 1) * 0.55;
            }

            function upgradeCost(u) {
                return Math.round(u.baseCost * Math.pow(u.mult, owned[u.id] - (u.id === 'click' ? 1 : 0)));
            }

            function calcStats() {
                const pMult = prestigeMult();
                const surgeMult = overdriveTimer > 0 ? 3.0 : (throttleTimer > 0 ? 0.45 : 1.0);
                let baseSps = 0;
                let netHeat = -2.2;
                for (const u of UPGRADES) {
                    baseSps += owned[u.id] * u.yield;
                    netHeat += owned[u.id] * u.heatRate;
                }
                const clickVal = (6 + (owned.click - 1) * 5 + Math.floor(baseSps * 0.08)) * pMult * surgeMult;
                const sps = baseSps * pMult * surgeMult;
                const zoneHalf = Math.min(0.18, 0.11 + owned.cooler * 0.012);
                return { clickVal, sps, netHeat, surgeMult, zoneMin: 0.5 - zoneHalf, zoneMax: 0.5 + zoneHalf };
            }

            function initRefinery(tier) {
                prestigeTier = Math.max(1, Number(tier || 1));
                prestigeGoal = Math.round(5000 * Math.pow(2.4, prestigeTier - 1));
                shards = 0;
                totalShards = 0;
                owned = { click: 1, drone: 0, drill: 0, cooler: 0, smelter: 0 };
                heat = 12;
                overdriveTimer = 0;
                throttleTimer = 0;
                prestigeWonThisTier = false;
                milestoneMask = 0;
            }

            function mineClick(x, y) {
                const st = calcStats();
                shards += st.clickVal;
                totalShards += st.clickVal;
                score += Math.round(st.clickVal);
                heat = Math.min(100, heat + 4.2);
                corePulse = 1;
                sfx('hitMetal', 0.25);
                spawnParticles(x, y, overdriveTimer > 0 ? PAL.gold : PAL.teal, 8, 130, 3, 0.35);
                spawnRing(x, y, overdriveTimer > 0 ? PAL.gold : PAL.sky, 48, 0.25);
                spawnFloat(x, y - 16, '+' + fmtNum(st.clickVal), overdriveTimer > 0 ? PAL.gold : PAL.teal, overdriveTimer > 0 ? 1.25 : 1.0);
            }

            function ventSteam() {
                const st = calcStats();
                const inSweetSpot = needlePos >= st.zoneMin && needlePos <= st.zoneMax;
                if (inSweetSpot) {
                    heat = Math.max(0, heat - 42);
                    throttleTimer = 0;
                    overdriveTimer = 8.0;
                    sfx('powerup');
                    shake(5, 0.16);
                    spawnRing(AST_X, AST_Y, PAL.teal, 145, 0.45);
                    spawnFloat(AST_X, AST_Y - 82, L('x3 AŞIRI YÜKLEME!', 'x3 OVERDRIVE SURGE!'), PAL.gold, 1.35);
                } else {
                    heat = Math.max(0, heat - 18);
                    sfx('dash');
                    spawnFloat(285, 428, L('BUHAR TAHLİYESİ -18%', 'VENTED -18%'), PAL.sky, 1.0);
                }
            }

            function buyUpgrade(u) {
                const cost = upgradeCost(u);
                if (shards < cost) {
                    sfx('uiBack');
                    return;
                }
                shards -= cost;
                owned[u.id] += 1;
                sfx('xpPickup');
                spawnFloat(620, 120, `+1 ${api.lang() === 'tr' ? u.nameTr : u.nameEn}`, u.color, 1.0);
            }

            function triggerPrestige() {
                if (totalShards < prestigeGoal || prestigeWonThisTier) return;
                prestigeWonThisTier = true;
                score += Math.round(totalShards * 0.5) + 1000;
                sfx('levelup');
                shake(7, 0.24);
                spawnRing(AST_X, AST_Y, PAL.gold, 180, 0.55);
                triggerWin({ score, level: prestigeTier, shards: Math.floor(totalShards) }, {
                    title: L(`WARP PRESTİJ ${prestigeTier} TAMAM!`, `WARP PRESTIGE ${prestigeTier} REACHED!`),
                    sub: L(`Yeni temel verim çarpanı: x${(1 + prestigeTier * 0.55).toFixed(2)}`, `Next base yield multiplier: x${(1 + prestigeTier * 0.55).toFixed(2)}`),
                    statLine: `TOTAL SHARDS ${fmtNum(totalShards)} · SCORE ${fmtNum(score)}`,
                    nextLevel: prestigeTier + 1,
                    nextLabel: L('WARP YÜKSELİŞİ', 'ASCEND PRESTIGE'),
                    replayLevel: 1
                });
            }

            initRefinery(prestigeTier);

            return {
                restart(lvl) {
                    if (!lvl || lvl === 1) score = 0;
                    initRefinery(lvl || 1);
                },
                onPointerDown(x, y) {
                    if (dist(x, y, AST_X, AST_Y) <= AST_R + 14) {
                        mineClick(x, y);
                    }
                },
                onKeyDown(e) {
                    if (e.key === ' ') {
                        e.preventDefault();
                        ventSteam();
                    } else if (e.key >= '1' && e.key <= '5') {
                        buyUpgrade(UPGRADES[Number(e.key) - 1]);
                    }
                },
                update(dt) {
                    if (api.isEnded()) return;
                    coreAngle += dt * (overdriveTimer > 0 ? 0.55 : 0.18);
                    if (corePulse > 0) corePulse = Math.max(0, corePulse - dt * 5);

                    const st = calcStats();
                    const gained = st.sps * dt;
                    shards += gained;
                    totalShards += gained;
                    score += gained * 0.5;

                    // Milestone progression bonuses (25%, 50%, 75%, 100%)
                    const mThresholds = [0.25, 0.5, 0.75, 1.0];
                    for (let mi = 0; mi < mThresholds.length; mi++) {
                        const bit = 1 << mi;
                        if (!(milestoneMask & bit) && totalShards >= prestigeGoal * mThresholds[mi]) {
                            milestoneMask |= bit;
                            const pct = Math.round(mThresholds[mi] * 100);
                            const bonus = Math.round(prestigeGoal * (mi === 3 ? 0.05 : 0.03));
                            shards += bonus;
                            score += bonus;
                            sfx(mi === 3 ? 'powerup' : 'xpPickup');
                            spawnRing(AST_X, AST_Y, PAL.gold, 155, 0.48);
                            spawnFloat(AST_X, AST_Y - 96, mi === 3 ? L('WARP PRESTİJ HAZIR!', 'WARP PRESTIGE READY!') : L(`HEDEF %${pct} (+${fmtNum(bonus)})`, `MILESTONE ${pct}% (+${fmtNum(bonus)})`), PAL.gold, 1.25);
                        }
                    }

                    if (overdriveTimer > 0) overdriveTimer = Math.max(0, overdriveTimer - dt);
                    if (throttleTimer > 0) throttleTimer = Math.max(0, throttleTimer - dt);

                    // Heat simulation
                    heat = clamp(heat + st.netHeat * dt, 0, 100);
                    if (heat >= 100 && throttleTimer <= 0) {
                        throttleTimer = 2.6;
                        overdriveTimer = 0;
                        heat = 48;
                        sfx('bossAlarm');
                        shake(6, 0.22);
                        spawnFloat(AST_X, AST_Y - 75, L('AŞIRI ISINMA! SOĞUTULUYOR', 'OVERHEAT! THROTTLED'), PAL.coral, 1.2);
                    }

                    // Oscillating Cooling Mini-Game needle
                    const needleSpeed = 0.92 + (heat / 100) * 0.45;
                    needlePos += needleDir * needleSpeed * dt;
                    if (needlePos >= 1) { needlePos = 1; needleDir = -1; }
                    else if (needlePos <= 0) { needlePos = 0; needleDir = 1; }

                    syncHud({
                        score: Math.floor(score),
                        level: prestigeTier,
                        credits: Math.floor(shards),
                        objective: L(`Prestij ${fmtNum(totalShards)}/${fmtNum(prestigeGoal)} · +${fmtNum(st.sps)}/s`, `Prestige ${fmtNum(totalShards)}/${fmtNum(prestigeGoal)} · +${fmtNum(st.sps)}/s`)
                    });
                },
                render(time) {
                    if (bgCanvas) g.drawImage(bgCanvas, 0, 0);
                    else { g.fillStyle = PAL.bg; g.fillRect(0, 0, W, H); }

                    const st = calcStats();

                    // Top Bar
                    drawPanel(12, 8, W - 24, 42, { radius: 10 });
                    drawSprite('cryo_crystal', 34, 29, 24, { glow: PAL.teal });
                    g.save();
                    g.textBaseline = 'middle';
                    g.textAlign = 'left';
                    g.font = '700 15px ' + FONT_MONO;
                    g.fillStyle = PAL.teal;
                    g.fillText(`${fmtNum(shards)} SHARDS`, 52, 29);

                    g.font = '600 12.5px ' + FONT_MONO;
                    g.fillStyle = PAL.sky;
                    g.fillText(`+${fmtNum(st.sps)}/s`, 200, 29);

                    g.fillStyle = overdriveTimer > 0 ? PAL.gold : (throttleTimer > 0 ? PAL.coral : PAL.muted);
                    g.fillText(overdriveTimer > 0 ? `x3.0 SURGE (${overdriveTimer.toFixed(1)}s)` : (throttleTimer > 0 ? L('ISI KISITLI x0.45', 'THROTTLED x0.45') : `PRESTIGE P${prestigeTier} (x${prestigeMult().toFixed(2)})`), 300, 29);

                    // Prestige Progress Bar
                    drawBar(535, 19, 200, 20, totalShards / prestigeGoal, totalShards >= prestigeGoal ? PAL.gold : PAL.violet, '#070b12');
                    g.textAlign = 'center';
                    g.font = '700 10.5px ' + FONT_MONO;
                    g.fillStyle = '#ffffff';
                    g.fillText(`WARP ${fmtNum(Math.min(totalShards, prestigeGoal))}/${fmtNum(prestigeGoal)}`, 635, 29);
                    g.restore();

                    const canPrestige = totalShards >= prestigeGoal;
                    addButton({
                        x: 748, y: 13, w: 190, h: 32,
                        sprite: 'warp_ring',
                        iconSize: 22,
                        label: L('WARP PRESTİJ!', 'WARP PRESTIGE!'),
                        accent: PAL.gold,
                        active: canPrestige,
                        disabled: !canPrestige,
                        onClick: () => triggerPrestige()
                    });

                    // Left Mining Sector Panel
                    drawPanel(12, 58, 544, 356, { radius: 14 });
                    // Visual Orbiting Drones & Stationary Drills
                    const droneVis = Math.min(8, owned.drone);
                    for (let i = 0; i < droneVis; i++) {
                        const a = time * 1.15 + (i / Math.max(1, droneVis)) * TAU;
                        const dx = AST_X + Math.cos(a) * 136;
                        const dy = AST_Y + Math.sin(a) * 108;
                        drawBeam(dx, dy, AST_X + Math.cos(a) * 58, AST_Y + Math.sin(a) * 58, PAL.sky, 1.5);
                        drawSprite('moon_lander', dx, dy, 26);
                    }
                    const drillVis = Math.min(4, owned.drill);
                    const drillSpots = [{ x: 75, y: 120 }, { x: 495, y: 120 }, { x: 75, y: 345 }, { x: 495, y: 345 }];
                    for (let i = 0; i < drillVis; i++) {
                        const ds = drillSpots[i];
                        drawBeam(ds.x, ds.y, AST_X, AST_Y, overdriveTimer > 0 ? PAL.gold : PAL.coral, 2.4);
                        drawSprite('laser_turret', ds.x, ds.y, 34, { flipX: ds.x > AST_X });
                    }
                    if (owned.cooler > 0) {
                        drawSprite('cryo_crystal', 72, 232, 34, { glow: PAL.teal });
                    }
                    if (owned.smelter > 0) {
                        drawSprite('cargo_crate', 495, 232, 36, { glow: PAL.amber });
                    }

                    // Pulsing Cryo-Asteroid Core
                    const scaleSize = (AST_R * 2) * (1 + corePulse * 0.06 + Math.sin(time * 3) * 0.02);
                    if (overdriveTimer > 0) {
                        g.save();
                        g.strokeStyle = PAL.gold;
                        g.lineWidth = 3;
                        g.beginPath();
                        g.arc(AST_X, AST_Y, AST_R + 12 + Math.sin(time * 8) * 4, 0, TAU);
                        g.stroke();
                        g.restore();
                    }
                    drawSprite('asteroid', AST_X, AST_Y, scaleSize, { angle: coreAngle, glow: overdriveTimer > 0 ? PAL.gold : PAL.teal });
                    drawSprite('cryo_crystal', AST_X, AST_Y, 64 + corePulse * 8, { angle: -coreAngle * 0.5 });

                    g.save();
                    g.textAlign = 'center';
                    g.font = '600 12px ' + FONT_DISPLAY;
                    g.fillStyle = PAL.text;
                    g.fillText(L(`Çekirdeğe Tıkla! (+${fmtNum(st.clickVal)} / Tık)`, `Click Core! (+${fmtNum(st.clickVal)} / Click)`), AST_X, 388);
                    g.restore();

                    // Bottom-Left: Reactor Heat & Overdrive Cooling Mini-Game
                    drawPanel(12, 422, 544, 108, { radius: 12, stroke: heat > 78 ? PAL.coral : PAL.teal + '66' });
                    g.save();
                    g.textAlign = 'left';
                    g.textBaseline = 'middle';
                    g.font = '700 12px ' + FONT_DISPLAY;
                    g.fillStyle = heat > 78 ? PAL.coral : PAL.text;
                    g.fillText(L(`REAKTÖR ISISI: ${Math.round(heat)}%`, `REACTOR HEAT: ${Math.round(heat)}%`), 26, 442);
                    drawBar(205, 434, 332, 16, heat / 100, heat > 78 ? PAL.coral : (heat > 45 ? PAL.amber : PAL.sky), '#070b12');

                    g.font = '600 11px ' + FONT_BODY;
                    g.fillStyle = PAL.teal;
                    g.fillText(L('TURKUAZ BÖLGEDE TAHLİYE ET -> x3 SÜRÜM!', 'VENT IN CYAN ZONE -> x3 OVERDRIVE!'), 26, 466);
                    g.restore();

                    // Cooling gauge track
                    const gx = 26, gy = 482, gw = 330, gh = 28;
                    drawPanel(gx, gy, gw, gh, { fill: '#070b12', radius: 8 });
                    // Cyan sweet zone
                    const zx = gx + st.zoneMin * gw;
                    const zw = (st.zoneMax - st.zoneMin) * gw;
                    g.save();
                    g.fillStyle = 'rgba(45, 212, 191, 0.36)';
                    g.fillRect(zx, gy + 2, zw, gh - 4);
                    g.strokeStyle = PAL.teal;
                    g.lineWidth = 1.5;
                    g.strokeRect(zx, gy + 2, zw, gh - 4);

                    // Needle
                    const nx = gx + needlePos * gw;
                    g.fillStyle = (needlePos >= st.zoneMin && needlePos <= st.zoneMax) ? PAL.gold : '#ffffff';
                    g.fillRect(nx - 3, gy - 2, 6, gh + 4);
                    g.restore();

                    addButton({
                        x: 370, y: 478, w: 172, h: 38,
                        label: L('BUHAR AT [SPACE]', 'VENT STEAM [SPACE]'),
                        accent: (needlePos >= st.zoneMin && needlePos <= st.zoneMax) ? PAL.gold : PAL.teal,
                        active: needlePos >= st.zoneMin && needlePos <= st.zoneMax,
                        onClick: () => ventSteam()
                    });

                    // Right Side Upgrade Console
                    drawPanel(568, 58, 380, 472, { radius: 14 });
                    g.save();
                    g.textAlign = 'left';
                    g.font = '700 13.5px ' + FONT_DISPLAY;
                    g.fillStyle = PAL.sky;
                    g.fillText(L('RAFİNERİ YÜKSELTMELERİ [1-5]', 'REFINERY UPGRADES [1-5]'), 586, 82);
                    g.restore();

                    UPGRADES.forEach((u, idx) => {
                        const cost = upgradeCost(u);
                        const canBuy = shards >= cost;
                        const by = 100 + idx * 84;
                        const label = `[${idx + 1}] ${api.lang() === 'tr' ? u.nameTr : u.nameEn} (${owned[u.id]})`;
                        const effectText = u.clickBonus > 0
                            ? L(`+${fmtNum(u.clickBonus * prestigeMult())} Tık Gücü`, `+${fmtNum(u.clickBonus * prestigeMult())} Click`)
                            : L(`+${fmtNum(u.yield * prestigeMult())}/s · Isı ${u.heatRate >= 0 ? '+' : ''}${u.heatRate}/s`, `+${fmtNum(u.yield * prestigeMult())}/s · Heat ${u.heatRate >= 0 ? '+' : ''}${u.heatRate}/s`);

                        addButton({
                            x: 584, y: by, w: 348, h: 74,
                            sprite: u.sprite,
                            iconSize: 36,
                            label,
                            sub: `${fmtNum(cost)} SHARDS · ${effectText}`,
                            accent: u.color,
                            disabled: !canBuy,
                            subColor: canBuy ? PAL.gold : PAL.coral,
                            tooltipTitle: api.lang() === 'tr' ? u.nameTr : u.nameEn,
                            tooltip: `${effectText}\nCost: ${fmtNum(cost)} Shards`,
                            onClick: () => buyUpgrade(u)
                        });
                    });
                }
            };
        });
    }

    // =========================================================================
    // GAME 6: TYPING CIPHER DEFENSE (Bilingual EN/TR Railgun Typing Shooter)
    // =========================================================================
    function mountTypingDefense(ctx) {
        const WORDS_EN = [
            'WARP', 'NOVA', 'PULSAR', 'AEGIS', 'ORBIT', 'LASER', 'QUARK', 'DRONE',
            'CORE', 'FLUX', 'SHIELD', 'BEAM', 'PHOTON', 'PLASMA', 'VECTOR', 'TURRET',
            'MATRIX', 'CIPHER', 'VORTEX', 'NEBULA', 'STRIKE', 'IGNITE', 'QUANTUM', 'SENTINEL'
        ];
        const WORDS_TR = [
            'UZAY', 'YILDIZ', 'LAZER', 'KALKAN', 'ROKET', 'FOTON', 'PLAZMA', 'ATOM',
            'EVREN', 'RADAR', 'SINYAL', 'MERKEZ', 'REAKTOR', 'KOMUTA', 'SAVUNMA', 'MUHAFIZ',
            'SEKTOR', 'KRIPTO', 'SIBER', 'MOTOR', 'ENERJI', 'WARP', 'NOVA', 'ORBIT'
        ];

        return createEngine(ctx, 'typing-cipher-defense', (api) => {
            const { canvas, g, W, H, L, sfx, shake, spawnParticles, spawnRing, spawnFloat, drawSprite, drawNovaPortrait, drawPanel, drawBar, drawBeam, addButton, syncHud, triggerWin, triggerGameOver } = api;

            if (canvas && canvas.tabIndex < 0) canvas.tabIndex = 0;
            try { if (canvas && typeof canvas.focus === 'function') canvas.focus({ preventScroll: true }); } catch (_) { }

            let level = clamp(Number(ctx.initialLevel || ctx.level || 1), 1, 6);
            let bgCanvas = buildSpaceBackdrop(404 + level * 29, PAL.sky, true);

            let hp = 5;
            const maxHp = 5;
            let score = 0;
            let sectorStartScore = 0;
            let wonSector = false;
            let combo = 0;
            let bestCombo = 0;
            let empCharge = 0;
            let totalKeys = 0;
            let correctKeys = 0;
            let startTime = performance.now();

            let enemies = [];
            let lockedId = null;
            let nextEnemyId = 1;
            let toSpawn = 0;
            let spawnTimer = 0.8;
            let bossSpawned = false;
            let beams = [];
            let turretAngle = -Math.PI * 0.5;
            let wrongFlash = 0;

            function normalizeChar(key, code) {
                if (key && key.length === 1) {
                    const map = { 'ı': 'I', 'i': 'I', 'İ': 'I', 'ş': 'S', 'Ş': 'S', 'ğ': 'G', 'Ğ': 'G', 'ü': 'U', 'Ü': 'U', 'ö': 'O', 'Ö': 'O', 'ç': 'C', 'Ç': 'C' };
                    const ch = map[key] || key.toUpperCase();
                    if (/^[A-Z]$/.test(ch)) return ch;
                }
                if (code && /^Key([A-Z])$/.test(code)) {
                    return code.slice(3);
                }
                return '';
            }

            function pickWord(minLen, maxLen) {
                const pool = api.lang() === 'tr' ? WORDS_TR : WORDS_EN;
                const usedFirst = new Set(enemies.map((e) => e.words[e.wordIdx][0]));
                let candidates = pool.filter((w) => w.length >= minLen && w.length <= maxLen && !usedFirst.has(w[0]));
                if (candidates.length === 0) candidates = pool.filter((w) => w.length >= minLen && w.length <= maxLen);
                if (candidates.length === 0) candidates = pool;
                return candidates[Math.floor(Math.random() * candidates.length)];
            }

            function spawnEnemy(isBoss) {
                if (isBoss) {
                    const words = [pickWord(5, 7), pickWord(5, 7), pickWord(6, 8)];
                    if (level >= 4) words.push(pickWord(6, 8));
                    enemies.push({
                        id: nextEnemyId++,
                        isBoss: true,
                        sprite: level >= 4 ? 'boss_core' : 'ufo',
                        x: W * 0.5,
                        y: 66,
                        vx: 26,
                        speed: 14 + level * 1.5,
                        words,
                        wordIdx: 0,
                        typed: 0,
                        size: 56,
                        color: PAL.coral
                    });
                    sfx('bossAlarm');
                    spawnFloat(W * 0.5, 118, L('BOSS SAVAŞ BAŞLIĞI!', 'BOSS WARHEAD INBOUND!'), PAL.coral, 1.3);
                    return;
                }
                const roll = Math.random();
                const isWarhead = roll > 0.72;
                const isDrone = roll < 0.35;
                const word = isWarhead ? pickWord(6, 8) : (isDrone ? pickWord(4, 5) : pickWord(4, 6));
                const laneX = clamp(120 + Math.random() * (W - 240), 120, W - 120);
                enemies.push({
                    id: nextEnemyId++,
                    isBoss: false,
                    sprite: isWarhead ? 'plasma_bomb' : (isDrone ? 'alien_drone' : 'fighter'),
                    x: laneX,
                    y: 56,
                    vx: (Math.random() - 0.5) * 18,
                    speed: (isWarhead ? 24 : (isDrone ? 40 : 32)) + level * 4.5,
                    words: [word],
                    wordIdx: 0,
                    typed: 0,
                    size: isWarhead ? 38 : 34,
                    color: isWarhead ? PAL.amber : (isDrone ? PAL.violet : PAL.sky)
                });
            }

            function initSector(lvl) {
                level = clamp(Number(lvl || 1), 1, 6);
                bgCanvas = buildSpaceBackdrop(404 + level * 29, PAL.sky, true);
                hp = maxHp;
                enemies = [];
                lockedId = null;
                toSpawn = 10 + level * 3;
                spawnTimer = 0.7;
                bossSpawned = false;
                beams = [];
                wrongFlash = 0;
                if (level === 1) {
                    score = 0;
                    combo = 0;
                    bestCombo = 0;
                    empCharge = 0;
                    totalKeys = 0;
                    correctKeys = 0;
                    startTime = performance.now();
                }
            }

            function triggerSectorWin() {
                if (wonSector || api.isEnded()) return;
                wonSector = true;
                const st = calcStats();
                triggerWin({ score, level, wpm: st.wpm, accuracy: st.acc, combo: bestCombo }, {
                    title: L(`SEKTÖR ${level} ŞİFRESİ KIRILDI!`, `SECTOR ${level} CIPHER CLEARED!`),
                    sub: L(`WPM: ${st.wpm} · Doğruluk: %${st.acc} · En İyi Kombo: x${bestCombo}`, `WPM: ${st.wpm} · Accuracy: ${st.acc}% · Best Combo: x${bestCombo}`),
                    statLine: `SCORE ${score}`,
                    nextLevel: level < 6 ? level + 1 : null,
                    replayLevel: level
                });
            }

            function triggerEmp() {
                if (empCharge < 100 || api.isEnded()) return;
                empCharge = 0;
                sfx('emp');
                shake(8, 0.28);
                spawnRing(W * 0.5, 480, PAL.sky, 620, 0.55);
                let bossKilled = false;
                for (let i = enemies.length - 1; i >= 0; i--) {
                    const e = enemies[i];
                    if (e.isBoss) {
                        // Crack current cipher plate on boss
                        e.wordIdx++;
                        e.typed = 0;
                        spawnParticles(e.x, e.y, PAL.sky, 16, 150, 3, 0.4);
                        if (e.wordIdx >= e.words.length) {
                            sfx('explodeBoss');
                            enemies.splice(i, 1);
                            score += 450;
                            bossKilled = true;
                        }
                    } else {
                        spawnParticles(e.x, e.y, e.color, 12, 130, 3, 0.35);
                        score += 80;
                        enemies.splice(i, 1);
                    }
                }
                lockedId = null;
                if (bossKilled || (bossSpawned && enemies.length === 0)) {
                    triggerSectorWin();
                }
            }

            function calcStats() {
                const elapsedMin = Math.max(0.08, (performance.now() - startTime) / 60000);
                const wpm = Math.round((correctKeys / 5) / elapsedMin);
                const acc = totalKeys > 0 ? Math.round((correctKeys / totalKeys) * 100) : 100;
                return { wpm, acc };
            }

            function processTypedChar(ch) {
                if (api.isEnded()) return;
                totalKeys++;
                let target = enemies.find((e) => e.id === lockedId);
                if (!target) {
                    const matches = enemies.filter((e) => e.words[e.wordIdx][0] === ch);
                    if (matches.length > 0) {
                        matches.sort((a, b) => b.y - a.y);
                        target = matches[0];
                        lockedId = target.id;
                    }
                }

                if (!target) {
                    combo = 0;
                    wrongFlash = 0.25;
                    sfx('uiBack');
                    return;
                }

                let word = target.words[target.wordIdx];
                if (word[target.typed] !== ch && target.typed >= 1) {
                    // Seamless prefix disambiguation: switch lock to an overlapping prefix enemy
                    const prefix = word.slice(0, target.typed);
                    const alt = enemies
                        .filter((e) => e.id !== target.id && e.words[e.wordIdx].startsWith(prefix) && e.words[e.wordIdx][target.typed] === ch)
                        .sort((a, b) => b.y - a.y)[0];
                    if (alt) {
                        alt.typed = target.typed;
                        target.typed = 0;
                        lockedId = alt.id;
                        target = alt;
                        word = alt.words[alt.wordIdx];
                    }
                }

                if (word[target.typed] === ch) {
                    correctKeys++;
                    target.typed++;
                    combo++;
                    bestCombo = Math.max(bestCombo, combo);
                    score += 10 + Math.min(20, combo);
                    turretAngle = Math.atan2(target.y - 486, target.x - W * 0.5);

                    if (target.typed >= word.length) {
                        // Word completed -> Railgun blast!
                        sfx('shootPlasma');
                        beams.push({ x1: W * 0.5, y1: 486, x2: target.x, y2: target.y, color: PAL.mint, width: 5, life: 0.24, maxLife: 0.24 });
                        spawnParticles(target.x, target.y, target.color, 14, 150, 3.2, 0.4);
                        spawnRing(target.x, target.y, PAL.mint, 44, 0.3);
                        empCharge = Math.min(100, empCharge + 15);
                        score += word.length * 25 + combo * 4;

                        if (target.isBoss) {
                            target.wordIdx++;
                            target.typed = 0;
                            target.y = Math.max(66, target.y - 18);
                            if (target.wordIdx >= target.words.length) {
                                sfx('explodeBoss');
                                shake(8, 0.3);
                                enemies = enemies.filter((e) => e.id !== target.id);
                                lockedId = null;
                                triggerSectorWin();
                            } else {
                                sfx('hitShield');
                                spawnFloat(target.x, target.y - 28, L('ZIRH KIRILDI!', 'PLATE SHATTERED!'), PAL.gold, 1.15);
                            }
                        } else {
                            sfx('explodeSmall');
                            enemies = enemies.filter((e) => e.id !== target.id);
                            lockedId = null;
                        }
                    } else {
                        sfx('shootLaser', 0.16);
                        target.y = Math.max(54, target.y - 5);
                        beams.push({ x1: W * 0.5, y1: 486, x2: target.x, y2: target.y, color: PAL.sky, width: 2.2, life: 0.12, maxLife: 0.12 });
                    }
                } else {
                    combo = 0;
                    wrongFlash = 0.25;
                    sfx('uiBack');
                }
            }

            initSector(level);

            return {
                restart(lvl) {
                    const nextLvl = clamp(Number(lvl || 1), 1, 6);
                    if (nextLvl <= 1) {
                        score = 0;
                        sectorStartScore = 0;
                    } else if (wonSector && nextLvl > level) {
                        sectorStartScore = score;
                    } else {
                        score = sectorStartScore;
                        combo = 0;
                    }
                    wonSector = false;
                    initSector(nextLvl);
                },
                onPointerDown() {
                    try { if (canvas && typeof canvas.focus === 'function') canvas.focus({ preventScroll: true }); } catch (_) { }
                },
                onKeyDown(e) {
                    if (e.ctrlKey || e.metaKey || e.altKey) return;
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        triggerEmp();
                        return;
                    }
                    if (e.key === 'Tab') {
                        e.preventDefault();
                        if (enemies.length > 0) {
                            const sorted = enemies.slice().sort((a, b) => b.y - a.y);
                            const curIdx = sorted.findIndex((item) => item.id === lockedId);
                            const nextTarget = sorted[(curIdx + 1) % sorted.length];
                            if (lockedId && lockedId !== nextTarget.id) {
                                const prev = enemies.find((item) => item.id === lockedId);
                                if (prev) prev.typed = 0;
                            }
                            lockedId = nextTarget.id;
                            sfx('uiClick');
                        }
                        return;
                    }
                    if (e.key === 'Escape' || e.key === 'Backspace') {
                        e.preventDefault();
                        const prev = enemies.find((item) => item.id === lockedId);
                        if (prev) prev.typed = 0;
                        lockedId = null;
                        sfx('uiClick');
                        return;
                    }
                    const ch = normalizeChar(e.key, e.code);
                    if (ch) {
                        e.preventDefault();
                        processTypedChar(ch);
                    }
                },
                update(dt) {
                    if (api.isEnded()) return;
                    if (wrongFlash > 0) wrongFlash = Math.max(0, wrongFlash - dt);

                    if (toSpawn > 0) {
                        spawnTimer -= dt;
                        if (spawnTimer <= 0) {
                            spawnEnemy(false);
                            toSpawn--;
                            spawnTimer = Math.max(0.95, 2.05 - level * 0.16);
                        }
                    } else if (!bossSpawned && enemies.length === 0) {
                        bossSpawned = true;
                        spawnEnemy(true);
                    }

                    for (let i = enemies.length - 1; i >= 0; i--) {
                        const e = enemies[i];
                        e.y = Math.max(52, e.y + Math.max(8, e.speed) * dt);
                        e.x = clamp(e.x + e.vx * dt, 108, W - 108);
                        if (e.x <= 110 || e.x >= W - 110) e.vx *= -1;

                        if (e.y >= 452) {
                            hp = Math.max(0, hp - (e.isBoss ? 3 : 1));
                            sfx('playerHurt');
                            shake(7, 0.22);
                            spawnRing(e.x, 452, PAL.coral, 58, 0.35);
                            if (lockedId === e.id) lockedId = null;
                            if (e.isBoss) {
                                e.y = 140;
                            } else {
                                enemies.splice(i, 1);
                            }
                            if (hp <= 0) {
                                const st = calcStats();
                                triggerGameOver({ score, level, wpm: st.wpm, accuracy: st.acc }, {
                                    title: L('SAVUNMA KALKANI ÇÖKTÜ!', 'DEFENSE SHIELD COLLAPSED!'),
                                    sub: `WPM ${st.wpm} · ACC ${st.acc}% · COMBO x${bestCombo}`,
                                    statLine: `SCORE ${score}`,
                                    replayLevel: level
                                });
                                return;
                            }
                        }
                    }

                    // Check win if boss destroyed by EMP or already cleared
                    if (bossSpawned && !enemies.some((e) => e.isBoss)) {
                        wonSector = true;
                        const st = calcStats();
                        triggerWin({ score, level, wpm: st.wpm, accuracy: st.acc, combo: bestCombo }, {
                            title: L(`SEKTÖR ${level} ŞİFRESİ KIRILDI!`, `SECTOR ${level} CIPHER CLEARED!`),
                            sub: `WPM: ${st.wpm} · ACC: ${st.acc}%`,
                            statLine: `SCORE ${score}`,
                            nextLevel: level < 6 ? level + 1 : null,
                            replayLevel: level
                        });
                    }

                    for (let i = beams.length - 1; i >= 0; i--) {
                        beams[i].life -= dt;
                        if (beams[i].life <= 0) beams.splice(i, 1);
                    }

                    const st = calcStats();
                    syncHud({
                        score,
                        level,
                        hp,
                        maxHp,
                        combo,
                        objective: L(`Sektör ${level}/6 · WPM ${st.wpm} · Kombo x${combo}`, `Sector ${level}/6 · WPM ${st.wpm} · Combo x${combo}`)
                    });
                },
                render(time) {
                    if (bgCanvas) g.drawImage(bgCanvas, 0, 0);
                    else { g.fillStyle = PAL.bg; g.fillRect(0, 0, W, H); }

                    const st = calcStats();

                    // Top warp portals
                    [160, 480, 800].forEach((px, idx) => {
                        drawSprite('portal_vortex', px, 42, 34, { angle: time * (idx % 2 === 0 ? 1 : -1), alpha: 0.45 });
                    });

                    // Shield Dome Horizon
                    g.save();
                    g.strokeStyle = hp > 2 ? PAL.sky : PAL.coral;
                    g.lineWidth = 2;
                    g.globalAlpha = 0.45;
                    g.beginPath();
                    g.moveTo(20, 456);
                    g.quadraticCurveTo(W * 0.5, 434, W - 20, 456);
                    g.stroke();
                    g.restore();

                    // Beams
                    for (const b of beams) {
                        g.save();
                        g.globalAlpha = clamp(b.life / b.maxLife, 0, 1);
                        drawBeam(b.x1, b.y1, b.x2, b.y2, b.color, b.width);
                        g.restore();
                    }

                    // Descending Enemies + Typing Pills
                    const lockedEnemy = enemies.find((en) => en.id === lockedId);
                    const lockedPrefix = (lockedEnemy && lockedEnemy.typed > 0)
                        ? lockedEnemy.words[lockedEnemy.wordIdx].slice(0, lockedEnemy.typed)
                        : '';
                    for (const e of enemies) {
                        const isLocked = e.id === lockedId;
                        const word = e.words[e.wordIdx];
                        const sharesPrefix = !isLocked && lockedPrefix && word.startsWith(lockedPrefix);
                        const rot = (e.sprite === 'fighter' || e.sprite === 'alien_drone') ? Math.PI : 0;
                        if (isLocked || sharesPrefix) {
                            g.save();
                            g.strokeStyle = isLocked ? (wrongFlash > 0 ? PAL.coral : PAL.mint) : PAL.amber;
                            g.lineWidth = isLocked ? 2 : 1.4;
                            g.setLineDash([5, 4]);
                            g.beginPath();
                            g.arc(e.x, e.y, e.size * 0.72, 0, TAU);
                            g.stroke();
                            g.restore();
                        }
                        drawSprite(e.sprite, e.x, e.y, e.size, { angle: rot, glow: e.color });

                        // Word Pill (strictly clamped within visible playfield)
                        const typedStr = word.slice(0, e.typed);
                        const remStr = word.slice(e.typed);
                        g.save();
                        g.font = '700 13.5px ' + FONT_MONO;
                        const tw = g.measureText(word).width + 20;
                        const px = clamp(e.x - tw * 0.5, 14, W - tw - 14);
                        const py = clamp(e.y + e.size * 0.5 + 4, 54, 434);
                        roundRectPath(g, px, py, tw, 24, 6);
                        g.fillStyle = isLocked ? 'rgba(13, 19, 32, 0.96)' : 'rgba(7, 11, 18, 0.88)';
                        g.fill();
                        g.strokeStyle = isLocked ? (wrongFlash > 0 ? PAL.coral : PAL.mint) : 'rgba(148, 163, 184, 0.35)';
                        g.lineWidth = isLocked ? 1.8 : 1.1;
                        g.stroke();

                        g.textAlign = 'left';
                        g.textBaseline = 'middle';
                        const tx = px + 10;
                        const ty = py + 12.5;
                        if (typedStr) {
                            g.fillStyle = PAL.mint;
                            g.fillText(typedStr, tx, ty);
                        }
                        const typedW = g.measureText(typedStr).width;
                        g.fillStyle = isLocked ? '#ffffff' : PAL.text;
                        g.fillText(remStr, tx + typedW, ty);

                        if (e.isBoss) {
                            g.font = '700 10px ' + FONT_MONO;
                            g.fillStyle = PAL.coral;
                            g.textAlign = 'center';
                            g.fillText(`ARMOR ${e.wordIdx + 1}/${e.words.length}`, e.x, e.y - e.size * 0.5 - 10);
                        }
                        g.restore();
                    }

                    // Bottom Railgun Bastion & Nova Comms
                    drawPanel(12, 464, W - 24, 68, { radius: 12 });
                    drawNovaPortrait(46, 498, 22, PAL.sky);
                    drawSprite('warp_ring', W * 0.5, 496, 52, { angle: time * 1.4, glow: PAL.sky });
                    drawSprite('laser_turret', W * 0.5, 492, 40, { flipX: Math.cos(turretAngle) < 0 });

                    g.save();
                    g.textAlign = 'left';
                    g.textBaseline = 'middle';
                    const lockedTarget = enemies.find((e) => e.id === lockedId);
                    g.font = '700 12px ' + FONT_DISPLAY;
                    g.fillStyle = lockedTarget ? PAL.mint : PAL.text;
                    if (lockedTarget) {
                        const lw = lockedTarget.words[lockedTarget.wordIdx];
                        g.fillText(L(`KİLİTLİ: ${lw.slice(0, lockedTarget.typed)}[${lw.slice(lockedTarget.typed)}]`, `LOCKED: ${lw.slice(0, lockedTarget.typed)}[${lw.slice(lockedTarget.typed)}]`), 80, 486);
                    } else {
                        g.fillText(L(`KLAVYEDEN HARFLERİ YAZ!`, `TYPE LETTERS TO FIRE!`), 80, 486);
                    }
                    g.font = '500 11px ' + FONT_MONO;
                    g.fillStyle = PAL.muted;
                    g.fillText(`[ESC] ${L('Kilidi Bırak', 'Drop Lock')} · WPM ${st.wpm} · ACC ${st.acc}%`, 80, 508);
                    g.restore();

                    // EMP Button on Bottom Right
                    addButton({
                        x: W - 235, y: 476, w: 210, h: 44,
                        sprite: 'shield_battery',
                        iconSize: 24,
                        label: empCharge >= 100 ? L('EMP ATEŞLE [ENTER]!', 'FIRE EMP [ENTER]!') : `EMP ${Math.round(empCharge)}%`,
                        accent: empCharge >= 100 ? PAL.gold : PAL.sky,
                        active: empCharge >= 100,
                        disabled: empCharge < 100,
                        onClick: () => triggerEmp()
                    });

                    // Top HUD Strip
                    drawPanel(12, 8, W - 24, 38, { radius: 10 });
                    g.save();
                    g.textBaseline = 'middle';
                    g.textAlign = 'left';
                    g.font = '700 13px ' + FONT_DISPLAY;
                    g.fillStyle = PAL.sky;
                    g.fillText(L(`ŞİFRE SAVUNMA ${level}/6`, `CIPHER DEFENSE ${level}/6`), 24, 27);

                    drawSprite('shield_battery', 235, 27, 18);
                    g.font = '700 12.5px ' + FONT_MONO;
                    g.fillStyle = hp > 2 ? PAL.mint : PAL.coral;
                    g.fillText(`SHD ${hp}/${maxHp}`, 250, 27);

                    g.fillStyle = PAL.amber;
                    g.fillText(`COMBO x${combo}`, 358, 27);

                    g.fillStyle = PAL.text;
                    g.fillText(`SCORE ${score}`, 485, 27);

                    g.fillStyle = PAL.muted;
                    g.fillText(bossSpawned ? L('BOSS AKTİF', 'BOSS ACTIVE') : L(`KALAN HEDEF: ${toSpawn + enemies.length}`, `REMAINING: ${toSpawn + enemies.length}`), 625, 27);

                    drawBar(785, 19, 145, 16, empCharge / 100, empCharge >= 100 ? PAL.gold : PAL.sky, '#070b12');
                    g.font = '700 10px ' + FONT_MONO;
                    g.fillStyle = '#ffffff';
                    g.textAlign = 'center';
                    g.fillText(`EMP ${Math.round(empCharge)}%`, 857, 27);
                    g.restore();
                }
            };
        });
    }

    // =========================================================================
    // ENGINE REGISTRATION
    // =========================================================================
    global.COSMIC_GAME_ENGINES = global.COSMIC_GAME_ENGINES || {};
    global.COSMIC_GAME_ENGINES['tower-defense-bastion'] = mountTowerDefense;
    global.COSMIC_GAME_ENGINES['deck-breach-tactics'] = mountDeckBreach;
    global.COSMIC_GAME_ENGINES['fleet-commander-auto'] = mountFleetCommander;
    global.COSMIC_GAME_ENGINES['wormhole-roulette-rpg'] = mountWormholeRoulette;
    global.COSMIC_GAME_ENGINES['mining-tycoon-idle'] = mountMiningTycoon;
    global.COSMIC_GAME_ENGINES['typing-cipher-defense'] = mountTypingDefense;
})(window);
