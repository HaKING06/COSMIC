/**
 * COSMIC UNIVERSE v11.0 — Reflex, Action, Runner, WASM, GLSL & PixiJS Game Pack
 * Registers 12 engines on window.COSMIC_GAME_ENGINES:
 *   1. boss-gauntlet (Story Ch.3, PixiJS v8 + Canvas2D fallback)
 *   2. wasm-bullet-weave (Story Ch.7, ctx.wasm + identical-API fallback)
 *   3. shader-pulse-survivor (ctx.shaders GLSL background + 2D HUD foreground)
 *   4. nova-flappy-rift (Story Ch.1, chapterTarget=8)
 *   5. gravity-flip-runner
 *   6. orbital-dash-ring
 *   7. warp-lane-dodger
 *   8. photon-parry-duel
 *   9. meteor-jetpack-rise
 *  10. laser-limbo-dash
 *  11. starlight-rhythm-pulse
 *  12. hyper-reaction-dock
 */
(function (global) {
    'use strict';

    const W = 960;
    const H = 540;
    const TAU = Math.PI * 2;

    global.COSMIC_GAME_ENGINES = global.COSMIC_GAME_ENGINES || {};

    function clamp(v, lo, hi) {
        return v < lo ? lo : (v > hi ? hi : v);
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function dist2(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return dx * dx + dy * dy;
    }

    function pointToSegDist(px, py, x1, y1, x2, y2) {
        const vx = x2 - x1;
        const vy = y2 - y1;
        const wx = px - x1;
        const wy = py - y1;
        const c1 = vx * wx + vy * wy;
        if (c1 <= 0) return Math.hypot(px - x1, py - y1);
        const c2 = vx * vx + vy * vy;
        if (c2 <= c1) return Math.hypot(px - x2, py - y2);
        const b = c1 / c2;
        return Math.hypot(px - (x1 + b * vx), py - (y1 + b * vy));
    }

    function angleDiff(a, b) {
        let d = (b - a + Math.PI) % TAU;
        if (d < 0) d += TAU;
        return d - Math.PI;
    }

    function createCore(ctx) {
        const tr = typeof ctx.t === 'function'
            ? (trStr, enStr) => ctx.t(trStr, enStr)
            : (trStr, enStr) => (ctx.lang === 'en' ? enStr : trStr);

        function playAudio(key, jitter) {
            try {
                ctx.audio?.play?.(key, jitter);
            } catch (e) { /* safe ignore */ }
        }

        function unlockAudio() {
            try {
                ctx.audio?.unlock?.();
            } catch (e) { /* safe ignore */ }
        }

        function isMuted() {
            try {
                return Boolean(ctx.audio?.prefs?.muted);
            } catch (e) {
                return false;
            }
        }

        function getSprite(key) {
            const img = ctx.sprites && ctx.sprites[key];
            if (img && img.complete && img.naturalWidth > 0) return img;
            return null;
        }

        function drawSprite(g, key, x, y, w, h, rot = 0, alpha = 1, fallbackFn) {
            const img = getSprite(key);
            g.save();
            g.globalAlpha *= alpha;
            g.translate(x, y);
            if (rot) g.rotate(rot);
            if (img) {
                g.drawImage(img, -w * 0.5, -h * 0.5, w, h);
            } else if (typeof fallbackFn === 'function') {
                fallbackFn(g, w, h);
            } else {
                g.fillStyle = '#38bdf8';
                g.beginPath();
                g.arc(0, 0, Math.min(w, h) * 0.42, 0, TAU);
                g.fill();
            }
            g.restore();
        }

        function makeCanvas(kind) {
            const canvas = typeof ctx.createCanvas === 'function'
                ? ctx.createCanvas(kind)
                : document.createElement('canvas');
            const c = canvas && canvas.getContext ? canvas : (canvas?.canvas || document.createElement('canvas'));
            if (!c.parentNode && ctx.stageEl) {
                ctx.stageEl.appendChild(c);
            }
            c.width = W;
            c.height = H;
            c.style.width = '100%';
            c.style.height = '100%';
            c.style.display = 'block';
            return c;
        }

        function createStarfield(count = 110) {
            const stars = [];
            const colors = ['#e2e8f0', '#7dd3fc', '#c4b5fd', '#fde68a'];
            for (let i = 0; i < count; i++) {
                const layer = (i % 3) + 1;
                stars.push({
                    x: Math.random() * W,
                    y: Math.random() * H,
                    r: layer === 1 ? 0.9 : (layer === 2 ? 1.4 : 2.1),
                    speed: layer * 18,
                    alpha: 0.25 + layer * 0.22,
                    color: colors[i % colors.length],
                    twinkle: Math.random() * TAU
                });
            }
            return stars;
        }

        function stepStarfield(stars, dt, vx = -1, vy = 0.15) {
            for (let i = 0; i < stars.length; i++) {
                const s = stars[i];
                s.x = (s.x + vx * s.speed * dt + W) % W;
                s.y = (s.y + vy * s.speed * dt + H) % H;
                s.twinkle += dt * 2.8;
            }
        }

        function renderBackdrop(g, stars, c1 = '#050814', c2 = '#0b1328', accent = 'rgba(56,189,248,0.10)') {
            const grad = g.createLinearGradient(0, 0, 0, H);
            grad.addColorStop(0, c1);
            grad.addColorStop(1, c2);
            g.fillStyle = grad;
            g.fillRect(0, 0, W, H);

            const neb = g.createRadialGradient(W * 0.72, H * 0.28, 10, W * 0.72, H * 0.28, 380);
            neb.addColorStop(0, accent);
            neb.addColorStop(1, 'rgba(5,8,20,0)');
            g.fillStyle = neb;
            g.fillRect(0, 0, W, H);

            for (let i = 0; i < stars.length; i++) {
                const s = stars[i];
                g.globalAlpha = s.alpha * (0.72 + Math.sin(s.twinkle) * 0.28);
                g.fillStyle = s.color;
                g.beginPath();
                g.arc(s.x, s.y, s.r, 0, TAU);
                g.fill();
            }
            g.globalAlpha = 1;
        }

        function createFX() {
            const particles = [];
            const popups = [];

            return {
                burst(x, y, color = '#38bdf8', count = 12, speed = 180, size = 3.2) {
                    for (let i = 0; i < count; i++) {
                        if (particles.length > 260) particles.shift();
                        const ang = Math.random() * TAU;
                        const spd = speed * (0.35 + Math.random() * 0.85);
                        particles.push({
                            x,
                            y,
                            vx: Math.cos(ang) * spd,
                            vy: Math.sin(ang) * spd,
                            color,
                            size: size * (0.65 + Math.random() * 0.7),
                            life: 0.32 + Math.random() * 0.28,
                            maxLife: 0.6
                        });
                    }
                },
                popup(x, y, text, color = '#38bdf8', size = 16) {
                    if (popups.length > 22) popups.shift();
                    popups.push({
                        x: clamp(x, 60, W - 60),
                        y: clamp(y, 35, H - 35),
                        vy: -48,
                        text,
                        color,
                        size,
                        life: 0.88,
                        maxLife: 0.88
                    });
                },
                update(dt) {
                    for (let i = particles.length - 1; i >= 0; i--) {
                        const p = particles[i];
                        p.life -= dt;
                        p.x += p.vx * dt;
                        p.y += p.vy * dt;
                        p.vx *= 0.94;
                        p.vy *= 0.94;
                        if (p.life <= 0) particles.splice(i, 1);
                    }
                    for (let i = popups.length - 1; i >= 0; i--) {
                        const t = popups[i];
                        t.life -= dt;
                        t.y += t.vy * dt;
                        t.vy *= 0.95;
                        if (t.life <= 0) popups.splice(i, 1);
                    }
                },
                render(g) {
                    for (let i = 0; i < particles.length; i++) {
                        const p = particles[i];
                        g.globalAlpha = clamp(p.life / p.maxLife, 0, 1);
                        g.fillStyle = p.color;
                        g.beginPath();
                        g.arc(p.x, p.y, p.size * (p.life / p.maxLife + 0.3), 0, TAU);
                        g.fill();
                    }
                    g.globalAlpha = 1;
                    for (let i = 0; i < popups.length; i++) {
                        const t = popups[i];
                        g.save();
                        g.globalAlpha = clamp(t.life / (t.maxLife * 0.45), 0, 1);
                        g.font = `700 ${t.size}px "Space Grotesk", "Inter", sans-serif`;
                        g.textAlign = 'center';
                        g.textBaseline = 'middle';
                        g.fillStyle = 'rgba(2,6,23,0.85)';
                        g.fillText(t.text, t.x + 1.5, t.y + 1.5);
                        g.fillStyle = t.color;
                        g.fillText(t.text, t.x, t.y);
                        g.restore();
                    }
                },
                clear() {
                    particles.length = 0;
                    popups.length = 0;
                }
            };
        }

        function drawHintBanner(g, text, elapsed) {
            if (!text || elapsed > 5.0) return;
            const alpha = elapsed > 4.0 ? clamp(1 - (elapsed - 4.0), 0, 1) : 0.92;
            g.save();
            g.globalAlpha = alpha;
            g.font = '600 13px "Space Grotesk", "Inter", sans-serif';
            const tw = g.measureText(text).width + 30;
            const bx = (W - tw) * 0.5;
            const by = H - 40;
            g.fillStyle = 'rgba(7, 11, 18, 0.82)';
            g.strokeStyle = 'rgba(56, 189, 248, 0.48)';
            g.lineWidth = 1.2;
            g.beginPath();
            g.roundRect(bx, by, tw, 28, 14);
            g.fill();
            g.stroke();
            g.fillStyle = '#e2e8f0';
            g.textAlign = 'center';
            g.textBaseline = 'middle';
            g.fillText(text, W * 0.5, by + 14);
            g.restore();
        }

        function createHudSync() {
            let timer = 0;
            return {
                push(payload, force) {
                    if (!force && timer > 0) return;
                    timer = 0.09;
                    try {
                        ctx.setHud?.(payload);
                    } catch (e) { /* safe ignore */ }
                },
                tick(dt) {
                    if (timer > 0) timer -= dt;
                }
            };
        }

        function createInput(targetEl, handlers) {
            const keys = new Set();
            const justPressed = new Set();
            const pointer = { x: W * 0.5, y: H * 0.5, active: false, down: false, justDown: false };
            const isForm = (el) => el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName);

            const toStageCoords = (e) => {
                const rect = targetEl.getBoundingClientRect();
                if (!rect.width || !rect.height) return;
                pointer.x = clamp(((e.clientX - rect.left) / rect.width) * W, 0, W);
                pointer.y = clamp(((e.clientY - rect.top) / rect.height) * H, 0, H);
                pointer.active = true;
            };

            const onKeyDown = (e) => {
                if (isForm(e.target)) return;
                unlockAudio();
                const code = e.code || '';
                const k = (e.key || '').toLowerCase();
                if (!keys.has(code)) {
                    justPressed.add(code);
                    if (k) justPressed.add(k);
                    handlers?.onKeyTap?.(code, k);
                }
                keys.add(code);
                if (k) keys.add(k);
                if (code === 'Space' || code.startsWith('Arrow')) e.preventDefault();
            };

            const onKeyUp = (e) => {
                const code = e.code || '';
                const k = (e.key || '').toLowerCase();
                keys.delete(code);
                if (k) keys.delete(k);
            };

            const onPointerDown = (e) => {
                unlockAudio();
                toStageCoords(e);
                pointer.down = true;
                pointer.justDown = true;
                handlers?.onPointerTap?.(pointer.x, pointer.y);
            };

            const onPointerMove = (e) => {
                toStageCoords(e);
            };

            const onPointerUp = () => {
                pointer.down = false;
            };

            const onBlur = () => {
                keys.clear();
                pointer.down = false;
            };

            global.addEventListener('keydown', onKeyDown, { passive: false });
            global.addEventListener('keyup', onKeyUp);
            global.addEventListener('blur', onBlur);
            targetEl.addEventListener('pointerdown', onPointerDown);
            global.addEventListener('pointermove', onPointerMove);
            global.addEventListener('pointerup', onPointerUp);
            global.addEventListener('pointercancel', onPointerUp);

            return {
                keys,
                pointer,
                has(...list) {
                    for (let i = 0; i < list.length; i++) {
                        if (keys.has(list[i])) return true;
                    }
                    return false;
                },
                consumePress(...list) {
                    let matched = false;
                    for (let i = 0; i < list.length; i++) {
                        const k = list[i];
                        if (justPressed.has(k)) {
                            matched = true;
                            break;
                        }
                    }
                    if (!matched) return false;
                    for (let i = 0; i < list.length; i++) {
                        const k = list[i];
                        justPressed.delete(k);
                        if (typeof k === 'string') justPressed.delete(k.toLowerCase());
                    }
                    return true;
                },
                consumePointerTap() {
                    if (pointer.justDown) {
                        pointer.justDown = false;
                        return true;
                    }
                    return false;
                },
                endFrame() {
                    justPressed.clear();
                    pointer.justDown = false;
                },
                destroy() {
                    global.removeEventListener('keydown', onKeyDown);
                    global.removeEventListener('keyup', onKeyUp);
                    global.removeEventListener('blur', onBlur);
                    targetEl.removeEventListener('pointerdown', onPointerDown);
                    global.removeEventListener('pointermove', onPointerMove);
                    global.removeEventListener('pointerup', onPointerUp);
                    global.removeEventListener('pointercancel', onPointerUp);
                }
            };
        }

        function createLoop(stepFn, renderFn) {
            let rafId = 0;
            let lastTime = performance.now();
            let dead = false;

            function frame(now) {
                if (dead) return;
                const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
                lastTime = now;
                const paused = typeof ctx.getPaused === 'function' ? ctx.getPaused() : false;
                if (!paused) {
                    stepFn(dt);
                }
                renderFn();
                rafId = requestAnimationFrame(frame);
            }

            rafId = requestAnimationFrame(frame);
            return {
                stop() {
                    dead = true;
                    cancelAnimationFrame(rafId);
                }
            };
        }

        return {
            tr,
            playAudio,
            unlockAudio,
            isMuted,
            getSprite,
            drawSprite,
            makeCanvas,
            createStarfield,
            stepStarfield,
            renderBackdrop,
            createFX,
            drawHintBanner,
            createHudSync,
            createInput,
            createLoop
        };
    }

    // =========================================================================
    // 1. boss-gauntlet (Story Ch.3! PixiJS v8 mini-boss arena + Canvas2D fallback)
    // =========================================================================
    global.COSMIC_GAME_ENGINES['boss-gauntlet'] = function mountBossGauntlet(ctx) {
        const core = createCore(ctx);
        let canvas = core.makeCanvas();
        const hud = core.createHudSync();
        const fx = core.createFX();
        const stars = core.createStarfield(110);
        const input = core.createInput(ctx.stageEl || canvas);

        const isStory = ctx.isStory !== undefined ? Boolean(ctx.isStory) : Boolean(ctx.chapterId || ctx.chapterTarget);
        const storyScoreTarget = ctx.chapterTarget || 1500;

        const BOSS_DEFS = [
            { name: 'OBLIVION BEHEMOTH', color: '#f59e0b', hex: 0xf59e0b, hp: 360, pylons: 2, speed: 95 },
            { name: 'CHRONOVORE', color: '#2dd4bf', hex: 0x2dd4bf, hp: 500, pylons: 3, speed: 120 },
            { name: 'VOID LEVIATHAN', color: '#fb7185', hex: 0xfb7185, hp: 680, pylons: 4, speed: 145 }
        ];

        const player = { x: 180, y: H * 0.5, vx: 0, vy: 0, angle: 0, dashTimer: 0, dashCd: 0, invuln: 0, fireCd: 0 };
        const boss = { idx: 0, x: 740, y: H * 0.5, hp: 360, maxHp: 360, angle: 0, fireTimer: 1.4, laserTimer: 3.4, laserPhase: 'idle', laserAngle: Math.PI, phase: 0, regenTimer: 0 };
        let pylons = [];
        let pBullets = [];
        let eBullets = [];
        let score = 0;
        let lives = 4;
        let bossesDefeated = 0;
        let elapsed = 0;
        let ended = false;
        let destroyed = false;
        let shakeTimer = 0;

        // Renderer state (Pixi v8 or Canvas2D fallback)
        let mode = 'init';
        let ctx2d = null;
        let pixiApp = null;
        let pixiNodes = null;
        let loopHandle = null;

        function spawnBoss(index) {
            const def = BOSS_DEFS[index % BOSS_DEFS.length];
            boss.idx = index;
            boss.x = 760;
            boss.y = H * 0.5;
            boss.hp = def.hp;
            boss.maxHp = def.hp;
            boss.fireTimer = 1.3;
            boss.laserTimer = 3.2;
            boss.laserPhase = 'idle';
            boss.laserAngle = Math.PI;
            boss.phase = 0;
            boss.regenTimer = 0;
            pylons = [];
            for (let i = 0; i < def.pylons; i++) {
                pylons.push({
                    ang: (i / def.pylons) * TAU,
                    dist: 86,
                    hp: 55 + index * 15,
                    maxHp: 55 + index * 15,
                    alive: true
                });
            }
            eBullets = [];
            core.playAudio('bossAlarm');
            fx.popup(W * 0.5, 95, def.name, def.color, 20);
        }

        function syncHud(force) {
            const def = BOSS_DEFS[boss.idx % BOSS_DEFS.length];
            const alivePylons = pylons.filter((p) => p.alive).length;
            const obj = isStory
                ? core.tr(`Hedef: ${storyScoreTarget} Skor veya 2 Boss (${bossesDefeated}/2)`, `Goal: ${storyScoreTarget} Score or Boss #2 (${bossesDefeated}/2)`)
                : core.tr(`Boss ${boss.idx + 1}/3: ${def.name}`, `Boss ${boss.idx + 1}/3: ${def.name}`);
            const st = alivePylons > 0
                ? core.tr(`Kalkan Pilonları: ${alivePylons} · [Space] Dash`, `Shield Pylons: ${alivePylons} · [Space] Dash`)
                : core.tr(`Çekirdek Açık! · [Space] Dash`, `Core Exposed! · [Space] Dash`);
            hud.push({
                score: Math.floor(score),
                level: boss.idx + 1,
                maxLevel: BOSS_DEFS.length,
                lives,
                statusText: st,
                objectiveText: obj
            }, force);
        }

        function winGame() {
            if (ended) return;
            ended = true;
            core.playAudio('levelup');
            syncHud(true);
            try {
                ctx.onWin?.({ score: Math.floor(score), level: boss.idx + 1, stars: lives >= 4 ? 3 : (lives >= 2 ? 2 : 1) });
            } catch (e) { /* safe ignore */ }
        }

        function failGame() {
            if (ended) return;
            ended = true;
            core.playAudio('explodeBoss');
            syncHud(true);
            try {
                ctx.onGameOver?.({
                    score: Math.floor(score),
                    level: boss.idx + 1,
                    stars: 0,
                    reason: core.tr('Avcı gemisi Dreadnought salvosunda düştü.', 'Fighter fell under Dreadnought barrage.')
                });
            } catch (e) { /* safe ignore */ }
        }

        function addScore(pts) {
            score += pts;
            if (isStory && score >= storyScoreTarget) {
                winGame();
            }
        }

        function hurtPlayer() {
            if (player.invuln > 0 || player.dashTimer > 0 || ended) return;
            lives -= 1;
            player.invuln = 1.15;
            shakeTimer = 0.28;
            fx.burst(player.x, player.y, '#fb7185', 16, 220);
            fx.popup(player.x, player.y - 24, core.tr('HASAR!', 'HIT!'), '#fb7185', 17);
            if (lives <= 0) {
                lives = 0;
                failGame();
            } else {
                core.playAudio('playerHurt');
            }
            syncHud(true);
        }

        function resetGame() {
            fx.clear();
            score = 0;
            lives = 4;
            bossesDefeated = 0;
            elapsed = 0;
            ended = false;
            shakeTimer = 0;
            player.x = 180;
            player.y = H * 0.5;
            player.vx = 0;
            player.vy = 0;
            player.dashTimer = 0;
            player.dashCd = 0;
            player.invuln = 1.0;
            player.fireCd = 0;
            pBullets = [];
            eBullets = [];
            spawnBoss(0);
            syncHud(true);
        }

        function step(dt) {
            if (ended) return;
            elapsed += dt;
            hud.tick(dt);
            core.stepStarfield(stars, dt, -1.3, 0);
            if (shakeTimer > 0) shakeTimer = Math.max(0, shakeTimer - dt);
            if (player.invuln > 0) player.invuln -= dt;
            if (player.dashTimer > 0) player.dashTimer -= dt;
            if (player.dashCd > 0) player.dashCd -= dt;

            // Player WASD movement
            let mx = 0;
            let my = 0;
            if (input.has('KeyA', 'ArrowLeft', 'a')) mx -= 1;
            if (input.has('KeyD', 'ArrowRight', 'd')) mx += 1;
            if (input.has('KeyW', 'ArrowUp', 'w')) my -= 1;
            if (input.has('KeyS', 'ArrowDown', 's')) my += 1;
            const mlen = Math.hypot(mx, my) || 1;

            if (input.consumePress('Space', ' ', 'ShiftLeft', 'ShiftRight') && player.dashCd <= 0) {
                player.dashTimer = 0.24;
                player.dashCd = 1.5;
                const ddx = mx !== 0 || my !== 0 ? mx / mlen : Math.cos(player.angle);
                const ddy = mx !== 0 || my !== 0 ? my / mlen : Math.sin(player.angle);
                player.vx = ddx * 760;
                player.vy = ddy * 760;
                core.playAudio('dash');
                fx.burst(player.x, player.y, '#38bdf8', 12, 160);
            }

            if (player.dashTimer > 0) {
                player.x += player.vx * dt;
                player.y += player.vy * dt;
            } else {
                const spd = 295;
                player.vx = lerp(player.vx, (mx / mlen) * spd * (mx || my ? 1 : 0), clamp(dt * 14, 0, 1));
                player.vy = lerp(player.vy, (my / mlen) * spd * (mx || my ? 1 : 0), clamp(dt * 14, 0, 1));
                player.x += player.vx * dt;
                player.y += player.vy * dt;
            }
            player.x = clamp(player.x, 32, W - 32);
            player.y = clamp(player.y, 32, H - 32);

            // Aim toward pointer if active, else auto-aim nearest active pylon/boss
            if (input.pointer.active) {
                player.angle = Math.atan2(input.pointer.y - player.y, input.pointer.x - player.x);
            } else {
                player.angle = Math.atan2(boss.y - player.y, boss.x - player.x);
            }

            // Auto-fire + pointer fire
            player.fireCd -= dt;
            if (player.fireCd <= 0) {
                player.fireCd = input.pointer.down ? 0.11 : 0.14;
                const aim = input.pointer.active ? player.angle : Math.atan2(boss.y - player.y, boss.x - player.x);
                const perpX = -Math.sin(aim) * 9;
                const perpY = Math.cos(aim) * 9;
                for (const s of [-1, 1]) {
                    pBullets.push({
                        x: player.x + Math.cos(aim) * 18 + perpX * s,
                        y: player.y + Math.sin(aim) * 18 + perpY * s,
                        vx: Math.cos(aim) * 690,
                        vy: Math.sin(aim) * 690,
                        life: 1.5
                    });
                }
                core.playAudio('shootLaser', 0.15);
            }

            // Boss movement & attack patterns
            const def = BOSS_DEFS[boss.idx % BOSS_DEFS.length];
            boss.phase += dt;
            const targetX = 720 + Math.cos(boss.phase * 0.85) * 95;
            const targetY = H * 0.5 + Math.sin(boss.phase * 1.25) * 145;
            boss.x = clamp(lerp(boss.x, targetX, clamp(dt * 2.2, 0, 1)), 430, W - 75);
            boss.y = clamp(lerp(boss.y, targetY, clamp(dt * 2.2, 0, 1)), 80, H - 75);
            boss.angle = Math.atan2(player.y - boss.y, player.x - boss.x);

            // Pylons orbit & regen if all down for 8s
            let alivePylons = 0;
            for (let i = 0; i < pylons.length; i++) {
                const py = pylons[i];
                py.ang += dt * (1.5 + boss.idx * 0.35);
                if (py.alive) alivePylons++;
            }
            if (alivePylons === 0) {
                boss.regenTimer += dt;
                if (boss.regenTimer >= 7.5) {
                    boss.regenTimer = 0;
                    pylons.forEach((p) => { p.alive = true; p.hp = p.maxHp; });
                    fx.popup(boss.x, boss.y - 55, core.tr('PİLONLAR YENİLENDİ!', 'PYLONS RECHARGED!'), '#38bdf8', 15);
                }
            }

            // Boss spiral / aimed projectile fire (gentle first 3s)
            boss.fireTimer -= dt;
            if (boss.fireTimer <= 0 && elapsed > 2.0) {
                boss.fireTimer = Math.max(0.55, 1.25 - boss.idx * 0.22);
                const count = 5 + boss.idx * 3;
                const base = boss.idx === 1 ? elapsed * 2.2 : boss.angle;
                for (let k = 0; k < count; k++) {
                    const ang = boss.idx === 0
                        ? base + (k - (count - 1) * 0.5) * 0.19
                        : base + (k / count) * TAU;
                    const spd = 210 + boss.idx * 32;
                    eBullets.push({ x: boss.x, y: boss.y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, r: 7 });
                }
                core.playAudio('shootPlasma', 0.12);
            }

            // Telegraph laser sweep
            boss.laserTimer -= dt;
            if (boss.laserPhase === 'idle' && boss.laserTimer <= 0 && elapsed > 3.2) {
                boss.laserPhase = 'telegraph';
                boss.laserTimer = 0.95;
                boss.laserAngle = Math.atan2(player.y - boss.y, player.x - boss.x) - 0.32;
                core.playAudio('emp');
            } else if (boss.laserPhase === 'telegraph') {
                if (boss.laserTimer <= 0) {
                    boss.laserPhase = 'fire';
                    boss.laserTimer = 0.55;
                    core.playAudio('shootMissile');
                }
            } else if (boss.laserPhase === 'fire') {
                boss.laserAngle += dt * (0.95 + boss.idx * 0.25);
                const lx2 = boss.x + Math.cos(boss.laserAngle) * 1100;
                const ly2 = boss.y + Math.sin(boss.laserAngle) * 1100;
                if (pointToSegDist(player.x, player.y, boss.x, boss.y, lx2, ly2) < 16) {
                    hurtPlayer();
                }
                if (boss.laserTimer <= 0) {
                    boss.laserPhase = 'idle';
                    boss.laserTimer = Math.max(2.6, 4.2 - boss.idx * 0.5);
                }
            }

            // Player bullets vs Pylons & Boss
            for (let i = pBullets.length - 1; i >= 0; i--) {
                const b = pBullets[i];
                b.life -= dt;
                b.x += b.vx * dt;
                b.y += b.vy * dt;
                if (b.life <= 0 || b.x < -20 || b.x > W + 20 || b.y < -20 || b.y > H + 20) {
                    pBullets.splice(i, 1);
                    continue;
                }
                let hit = false;
                for (let k = 0; k < pylons.length; k++) {
                    const py = pylons[k];
                    if (!py.alive) continue;
                    const px = boss.x + Math.cos(py.ang) * py.dist;
                    const pyY = boss.y + Math.sin(py.ang) * py.dist;
                    if (dist2(b.x, b.y, px, pyY) < 24 * 24) {
                        py.hp -= 18;
                        hit = true;
                        fx.burst(b.x, b.y, '#38bdf8', 5, 110);
                        core.playAudio('hitShield', 0.15);
                        if (py.hp <= 0) {
                            py.alive = false;
                            addScore(120);
                            fx.burst(px, pyY, '#22d3ee', 16, 200);
                            fx.popup(px, pyY - 12, core.tr('PİLON İMHA +120', 'PYLON DOWN +120'), '#22d3ee', 15);
                            core.playAudio('explodeSmall');
                        }
                        break;
                    }
                }
                if (!hit && dist2(b.x, b.y, boss.x, boss.y) < 42 * 42) {
                    const dmg = alivePylons > 0 ? 7 : 18;
                    boss.hp -= dmg;
                    addScore(alivePylons > 0 ? 8 : 16);
                    fx.burst(b.x, b.y, def.color, 4, 120);
                    core.playAudio('hitMetal', 0.14);
                    hit = true;
                }
                if (hit) pBullets.splice(i, 1);
                if (ended) return;
            }

            // Boss defeated check
            if (boss.hp <= 0 && !ended) {
                bossesDefeated += 1;
                const clearBonus = 500 + boss.idx * 250;
                fx.burst(boss.x, boss.y, def.color, 34, 300);
                fx.popup(boss.x, boss.y - 30, `${def.name} +${clearBonus}`, '#fbbf24', 19);
                core.playAudio('explodeBoss');
                addScore(clearBonus);
                if (ended) return;
                if (isStory && bossesDefeated >= 2) {
                    winGame();
                    return;
                }
                if (!isStory && bossesDefeated % BOSS_DEFS.length === 0) {
                    fx.popup(W * 0.5, 110, core.tr('SONSUZ RUSH TURU +1!', 'ENDLESS RUSH TIER +1!'), '#38bdf8', 22);
                }
                if (lives < 4) lives += 1;
                spawnBoss((boss.idx + 1) % BOSS_DEFS.length);
            }

            // Enemy bullets vs Player
            for (let i = eBullets.length - 1; i >= 0; i--) {
                const b = eBullets[i];
                b.x += b.vx * dt;
                b.y += b.vy * dt;
                if (b.x < -30 || b.x > W + 30 || b.y < -30 || b.y > H + 30) {
                    eBullets.splice(i, 1);
                    continue;
                }
                if (dist2(b.x, b.y, player.x, player.y) < (b.r + 12) * (b.r + 12)) {
                    eBullets.splice(i, 1);
                    hurtPlayer();
                    if (ended) return;
                }
            }

            fx.update(dt);
            input.endFrame();
            syncHud(false);
        }

        function renderCanvas2D() {
            if (!ctx2d) return;
            const g = ctx2d;
            g.save();
            if (shakeTimer > 0) {
                g.translate((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
            }
            core.renderBackdrop(g, stars, '#050814', '#101832', 'rgba(167,139,250,0.12)');

            // Subtle arena grid
            g.strokeStyle = 'rgba(56,189,248,0.06)';
            g.lineWidth = 1;
            for (let x = 0; x <= W; x += 60) {
                g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke();
            }
            for (let y = 0; y <= H; y += 60) {
                g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke();
            }

            const def = BOSS_DEFS[boss.idx % BOSS_DEFS.length];

            // Telegraph or firing laser sweep
            if (boss.laserPhase !== 'idle') {
                const lx2 = boss.x + Math.cos(boss.laserAngle) * 1100;
                const ly2 = boss.y + Math.sin(boss.laserAngle) * 1100;
                g.save();
                if (boss.laserPhase === 'telegraph') {
                    const tp = clamp(1 - boss.laserTimer / 0.95, 0, 1);
                    const sweepDir = boss.laserAngle + (0.95 * (0.95 + boss.idx * 0.25) * 0.55);
                    g.fillStyle = `rgba(251, 113, 133, ${0.10 + tp * 0.14})`;
                    g.beginPath();
                    g.moveTo(boss.x, boss.y);
                    g.arc(boss.x, boss.y, 1100, boss.laserAngle, sweepDir);
                    g.closePath();
                    g.fill();
                    g.setLineDash([12, 10]);
                    g.strokeStyle = `rgba(251, 113, 133, ${0.5 + tp * 0.45})`;
                    g.lineWidth = 2 + tp * 3;
                } else {
                    g.strokeStyle = 'rgba(251, 113, 133, 0.55)';
                    g.lineWidth = 22;
                    g.beginPath(); g.moveTo(boss.x, boss.y); g.lineTo(lx2, ly2); g.stroke();
                    g.strokeStyle = '#ffffff';
                    g.lineWidth = 7;
                }
                g.beginPath(); g.moveTo(boss.x, boss.y); g.lineTo(lx2, ly2); g.stroke();
                g.restore();
            }

            // Shield Pylon Aura + Pylons
            const activePylonsCount = pylons.filter((p) => p.alive).length;
            if (activePylonsCount > 0) {
                g.save();
                g.strokeStyle = 'rgba(56, 189, 248, 0.35)';
                g.lineWidth = 2;
                g.setLineDash([6, 6]);
                g.beginPath();
                g.arc(boss.x, boss.y, 58, 0, TAU);
                g.stroke();
                g.restore();
            }
            for (let i = 0; i < pylons.length; i++) {
                const py = pylons[i];
                if (!py.alive) continue;
                const px = boss.x + Math.cos(py.ang) * py.dist;
                const pyY = boss.y + Math.sin(py.ang) * py.dist;
                g.strokeStyle = 'rgba(56,189,248,0.28)';
                g.lineWidth = 1.5;
                g.beginPath(); g.moveTo(boss.x, boss.y); g.lineTo(px, pyY); g.stroke();
                core.drawSprite(g, 'shield_battery', px, pyY, 34, 34, py.ang, 1, (c) => {
                    c.fillStyle = '#38bdf8';
                    c.beginPath(); c.arc(0, 0, 12, 0, TAU); c.fill();
                });
            }

            // Boss Core
            core.drawSprite(g, 'boss_core', boss.x, boss.y, 92, 92, boss.phase * 0.8, 1, (c) => {
                c.fillStyle = def.color;
                c.beginPath(); c.arc(0, 0, 38, 0, TAU); c.fill();
            });

            // Boss HP Bar
            const barW = 280;
            const bx = (W - barW) * 0.5;
            g.fillStyle = 'rgba(15,23,42,0.85)';
            g.fillRect(bx, 18, barW, 12);
            g.fillStyle = def.color;
            g.fillRect(bx + 2, 20, (barW - 4) * clamp(boss.hp / boss.maxHp, 0, 1), 8);
            g.font = '700 12px "Space Grotesk", sans-serif';
            g.fillStyle = '#e2e8f0';
            g.textAlign = 'center';
            g.fillText(def.name, W * 0.5, 44);

            // Player bullets
            g.fillStyle = '#67e8f9';
            for (let i = 0; i < pBullets.length; i++) {
                const b = pBullets[i];
                g.beginPath(); g.arc(b.x, b.y, 4, 0, TAU); g.fill();
            }

            // Enemy bullets
            for (let i = 0; i < eBullets.length; i++) {
                const b = eBullets[i];
                g.fillStyle = '#fb7185';
                g.beginPath(); g.arc(b.x, b.y, b.r + 2, 0, TAU); g.fill();
                g.fillStyle = '#fef2f2';
                g.beginPath(); g.arc(b.x, b.y, b.r * 0.55, 0, TAU); g.fill();
            }

            // Player ship
            const visible = player.invuln <= 0 || Math.floor(player.invuln * 18) % 2 === 0;
            if (visible) {
                core.drawSprite(g, 'fighter', player.x, player.y, 44, 44, player.angle + Math.PI * 0.5, player.dashTimer > 0 ? 0.65 : 1, (c) => {
                    c.fillStyle = '#38bdf8';
                    c.beginPath(); c.moveTo(0, -16); c.lineTo(14, 14); c.lineTo(-14, 14); c.closePath(); c.fill();
                });
            }

            fx.render(g);
            core.drawHintBanner(g, core.tr('WASD hareket · Otomatik/Fare nişan · [Space] Dokunulmaz Dash', 'WASD Move · Auto/Mouse Aim · [Space] Invulnerable Dash'), elapsed);
            g.restore();
        }

        function buildPixiScene() {
            const PIXI = global.PIXI;
            const stage = pixiApp.stage;
            const starGfx = new PIXI.Graphics();
            const beamGfx = new PIXI.Graphics();
            const bulletGfx = new PIXI.Graphics();
            const hudGfx = new PIXI.Graphics();

            const makeEntityNode = (spriteKey, size, fallbackHex) => {
                const img = core.getSprite(spriteKey);
                if (img) {
                    const sp = new PIXI.Sprite(PIXI.Texture.from(img));
                    sp.anchor.set(0.5);
                    sp.width = size;
                    sp.height = size;
                    return sp;
                }
                const g = new PIXI.Graphics();
                g.circle(0, 0, size * 0.4).fill({ color: fallbackHex });
                return g;
            };

            const bossNode = makeEntityNode('boss_core', 92, 0xf59e0b);
            const playerNode = makeEntityNode('fighter', 44, 0x38bdf8);
            const pylonNodes = [];
            for (let i = 0; i < 4; i++) {
                const pn = makeEntityNode('shield_battery', 34, 0x38bdf8);
                pylonNodes.push(pn);
                stage.addChild(pn);
            }

            const titleText = new PIXI.Text({
                text: BOSS_DEFS[0].name,
                style: { fontFamily: 'Space Grotesk, Inter, sans-serif', fontSize: 12, fontWeight: '700', fill: 0xe2e8f0 }
            });
            titleText.anchor.set(0.5, 0);
            titleText.position.set(W * 0.5, 34);

            const hintText = new PIXI.Text({
                text: core.tr('WASD hareket · Fare/Oto nişan · [Space] Dash', 'WASD Move · Mouse/Auto Aim · [Space] Dash'),
                style: { fontFamily: 'Space Grotesk, Inter, sans-serif', fontSize: 13, fontWeight: '600', fill: 0xe2e8f0 }
            });
            hintText.anchor.set(0.5, 1);
            hintText.position.set(W * 0.5, H - 16);

            stage.addChild(starGfx, beamGfx, bossNode, playerNode, bulletGfx, hudGfx, titleText, hintText);
            pixiNodes = { starGfx, beamGfx, bulletGfx, hudGfx, bossNode, playerNode, pylonNodes, titleText, hintText };
        }

        function renderPixi() {
            if (!pixiApp || !pixiNodes) return;
            const { starGfx, beamGfx, bulletGfx, hudGfx, bossNode, playerNode, pylonNodes, titleText, hintText } = pixiNodes;
            const def = BOSS_DEFS[boss.idx % BOSS_DEFS.length];

            starGfx.clear();
            for (let i = 0; i < stars.length; i++) {
                const s = stars[i];
                starGfx.circle(s.x, s.y, s.r).fill({ color: 0xbae6fd, alpha: s.alpha });
            }

            beamGfx.clear();
            if (boss.laserPhase !== 'idle') {
                const lx2 = boss.x + Math.cos(boss.laserAngle) * 1100;
                const ly2 = boss.y + Math.sin(boss.laserAngle) * 1100;
                if (boss.laserPhase === 'telegraph') {
                    const sweepEnd = boss.laserAngle + (0.95 + boss.idx * 0.25) * 0.55;
                    beamGfx.moveTo(boss.x, boss.y).arc(boss.x, boss.y, 1100, boss.laserAngle, sweepEnd).closePath().fill({ color: 0xfb7185, alpha: 0.14 });
                    beamGfx.moveTo(boss.x, boss.y).lineTo(lx2, ly2).stroke({ color: 0xfb7185, width: 3.5, alpha: 0.8 });
                } else {
                    beamGfx.moveTo(boss.x, boss.y).lineTo(lx2, ly2).stroke({ color: 0xfb7185, width: 22, alpha: 0.45 });
                    beamGfx.moveTo(boss.x, boss.y).lineTo(lx2, ly2).stroke({ color: 0xffffff, width: 7, alpha: 0.95 });
                }
            }

            let pixiAlivePylons = 0;
            for (let i = 0; i < pylonNodes.length; i++) {
                const pn = pylonNodes[i];
                const py = pylons[i];
                if (py && py.alive) {
                    pixiAlivePylons++;
                    const px = boss.x + Math.cos(py.ang) * py.dist;
                    const pyY = boss.y + Math.sin(py.ang) * py.dist;
                    pn.visible = true;
                    pn.position.set(px, pyY);
                    pn.rotation = py.ang;
                    beamGfx.moveTo(boss.x, boss.y).lineTo(px, pyY).stroke({ color: 0x38bdf8, width: 1.5, alpha: 0.3 });
                } else {
                    pn.visible = false;
                }
            }
            if (pixiAlivePylons > 0) {
                beamGfx.circle(boss.x, boss.y, 58).stroke({ color: 0x38bdf8, width: 2, alpha: 0.38 });
            }

            bossNode.position.set(boss.x, boss.y);
            bossNode.rotation = boss.phase * 0.8;
            bossNode.tint = def.hex;

            playerNode.position.set(player.x, player.y);
            playerNode.rotation = player.angle + Math.PI * 0.5;
            playerNode.alpha = player.dashTimer > 0 ? 0.55 : 1;
            playerNode.visible = player.invuln <= 0 || Math.floor(player.invuln * 18) % 2 === 0;

            bulletGfx.clear();
            for (let i = 0; i < pBullets.length; i++) {
                const b = pBullets[i];
                bulletGfx.circle(b.x, b.y, 4).fill({ color: 0x67e8f9 });
            }
            for (let i = 0; i < eBullets.length; i++) {
                const b = eBullets[i];
                bulletGfx.circle(b.x, b.y, b.r + 2).fill({ color: 0xfb7185 });
                bulletGfx.circle(b.x, b.y, b.r * 0.55).fill({ color: 0xfef2f2 });
            }

            hudGfx.clear();
            const barW = 280;
            const bx = (W - barW) * 0.5;
            hudGfx.rect(bx, 18, barW, 12).fill({ color: 0x0f172a, alpha: 0.85 });
            hudGfx.rect(bx + 2, 20, (barW - 4) * clamp(boss.hp / boss.maxHp, 0, 1), 8).fill({ color: def.hex });
            titleText.text = def.name;
            hintText.alpha = elapsed < 4.5 ? 0.9 : Math.max(0, 1 - (elapsed - 4.5));

            pixiApp.stage.position.set(
                shakeTimer > 0 ? (Math.random() - 0.5) * 10 : 0,
                shakeTimer > 0 ? (Math.random() - 0.5) * 10 : 0
            );
            pixiApp.render();
        }

        function startRenderLoop() {
            if (destroyed || loopHandle) return;
            loopHandle = core.createLoop(step, () => {
                if (mode === 'pixi') renderPixi();
                else renderCanvas2D();
            });
        }

        async function initEngine() {
            resetGame();
            if (global.PIXI && typeof global.PIXI.Application === 'function') {
                try {
                    const app = new global.PIXI.Application();
                    await app.init({
                        canvas,
                        width: W,
                        height: H,
                        backgroundColor: 0x050814,
                        antialias: true
                    });
                    if (destroyed) {
                        app.destroy(true, { children: true });
                        return;
                    }
                    app.ticker?.stop?.();
                    pixiApp = app;
                    mode = 'pixi';
                    buildPixiScene();
                    startRenderLoop();
                    return;
                } catch (err) {
                    // Replace canvas cleanly before Canvas2D fallback (never mix contexts on same canvas)
                    const parent = canvas.parentNode;
                    if (parent) parent.removeChild(canvas);
                    canvas = core.makeCanvas();
                }
            }
            if (destroyed) return;
            mode = 'canvas2d';
            ctx2d = canvas.getContext('2d');
            startRenderLoop();
        }

        initEngine();

        return {
            restart() {
                resetGame();
            },
            destroy() {
                destroyed = true;
                loopHandle?.stop?.();
                input.destroy();
                if (pixiApp) {
                    try {
                        pixiApp.destroy(true, { children: true });
                    } catch (e) { /* safe ignore */ }
                    pixiApp = null;
                }
                if (canvas?.parentNode) canvas.remove();
            }
        };
    };

    // =========================================================================
    // 2. wasm-bullet-weave (Story Ch.7! ctx.wasm linear memory stepBullets)
    // =========================================================================
    global.COSMIC_GAME_ENGINES['wasm-bullet-weave'] = function mountWasmWeave(ctx) {
        const core = createCore(ctx);
        const canvas = core.makeCanvas();
        const g = canvas.getContext('2d');
        const hud = core.createHudSync();
        const fx = core.createFX();
        const stars = core.createStarfield(120);
        const input = core.createInput(canvas);

        const isStory = ctx.isStory !== undefined ? Boolean(ctx.isStory) : Boolean(ctx.chapterId || ctx.chapterTarget);
        const storyTarget = ctx.chapterTarget || 1000;

        const MAX_BULLETS = 360;
        const bulletData = new Float32Array(MAX_BULLETS * 4); // x, y, vx, vy
        const bulletKind = new Uint8Array(MAX_BULLETS);
        const bulletGrazed = new Uint8Array(MAX_BULLETS);
        let activeCount = 0;
        let wasmBridgeInstance = (ctx.wasm && typeof ctx.wasm.stepBullets === 'function') ? ctx.wasm : null;
        let wasmReadyFlag = Boolean(wasmBridgeInstance);
        let wasmEngineMode = 'pending';

        if (!wasmBridgeInstance && ctx.wasm && typeof ctx.wasm.ready === 'function') {
            try {
                Promise.resolve(ctx.wasm.ready()).then((res) => {
                    if (res && typeof res.stepBullets === 'function') {
                        wasmBridgeInstance = res;
                        wasmReadyFlag = true;
                    }
                }).catch(() => { wasmReadyFlag = false; });
            } catch (e) { /* safe fallback */ }
        }

        function stepBulletsLocal(arr, count, dt, bw, bh) {
            for (let i = 0; i < count; i++) {
                const idx = i * 4;
                arr[idx] += arr[idx + 2] * dt;
                arr[idx + 1] += arr[idx + 3] * dt;
            }
            // Compact out-of-bounds happens in JS caller so array remains tight
            void bw;
            void bh;
        }

        function runWasmOrFallbackStep(dt) {
            if (activeCount <= 0) return;
            const wasm = wasmBridgeInstance || ctx.wasm;
            if (wasm && (wasmReadyFlag || typeof wasm.ready !== 'function') && typeof wasm.stepBullets === 'function') {
                try {
                    const beforeX = bulletData[0];
                    const beforeY = bulletData[1];
                    const beforeVx = bulletData[2];
                    const beforeVy = bulletData[3];
                    const ptr = typeof wasm.bulletOffset === 'number'
                        ? wasm.bulletOffset
                        : (typeof wasm.ptr === 'number' ? wasm.ptr : 0);
                    const extView = wasm.f32 instanceof Float32Array
                        ? wasm.f32
                        : (typeof wasm.getBulletBuffer === 'function'
                            ? wasm.getBulletBuffer()
                            : (wasm.memory instanceof WebAssembly.Memory
                                ? new Float32Array(wasm.memory.buffer, ptr, activeCount * 4)
                                : null));

                    if (extView && extView.length >= activeCount * 4 && wasm.memory instanceof WebAssembly.Memory) {
                        extView.set(bulletData.subarray(0, activeCount * 4));
                        wasm.stepBullets(ptr, activeCount, dt, W, H, player.x, player.y);
                        bulletData.set(extView.subarray(0, activeCount * 4));
                    } else {
                        wasm.stepBullets(bulletData, activeCount, dt, W, H, player.x, player.y);
                    }
                    const minDx = Math.abs(beforeVx * dt) * 0.25;
                    const minDy = Math.abs(beforeVy * dt) * 0.25;
                    const movedX = Math.abs(bulletData[0] - beforeX) >= minDx || Math.abs(beforeVx) < 0.05;
                    const movedY = Math.abs(bulletData[1] - beforeY) >= minDy || Math.abs(beforeVy) < 0.05;
                    if (Number.isFinite(bulletData[0]) && Number.isFinite(bulletData[1]) && movedX && movedY) {
                        wasmEngineMode = wasm.viaWasm === false ? 'fallback-bridge' : 'wasm';
                        return;
                    }
                } catch (e) { /* fall back seamlessly */ }
            }
            wasmEngineMode = 'fallback';
            stepBulletsLocal(bulletData, activeCount, dt, W, H);
        }

        const emitter = { x: W * 0.5, y: H * 0.5, angle: 0, burstCd: 0 };
        const player = { x: 220, y: H * 0.5, invuln: 0, phaseTimer: 0, phaseCd: 0 };
        const shards = [];

        let score = 0;
        let level = 1;
        let lives = 3;
        let elapsed = 0;
        let ended = false;

        function spawnShard() {
            const ang = Math.random() * TAU;
            const rad = 140 + Math.random() * 145;
            const sx = clamp(W * 0.5 + Math.cos(ang) * rad * 1.45, 55, W - 55);
            const sy = clamp(H * 0.5 + Math.sin(ang) * rad * 0.9, 55, H - 55);
            shards.push({ x: sx, y: sy, bob: Math.random() * TAU });
        }

        function spawnSpiralVolley(arms, spd, kind) {
            for (let a = 0; a < arms; a++) {
                if (activeCount >= MAX_BULLETS) break;
                const ang = emitter.angle + (a / arms) * TAU;
                const idx = activeCount * 4;
                bulletData[idx] = emitter.x + Math.cos(ang) * 20;
                bulletData[idx + 1] = emitter.y + Math.sin(ang) * 20;
                bulletData[idx + 2] = Math.cos(ang) * spd;
                bulletData[idx + 3] = Math.sin(ang) * spd;
                bulletKind[activeCount] = kind;
                bulletGrazed[activeCount] = 0;
                activeCount++;
            }
        }

        function syncHud(force) {
            const targetBullets = clamp(Math.floor(160 + level * 38), 160, 350);
            const st = player.phaseTimer > 0
                ? core.tr('FAZ KAYMASI AKTİF!', 'PHASE-SHIFT ACTIVE!')
                : (player.phaseCd > 0
                    ? core.tr(`Faz Kayması: ${player.phaseCd.toFixed(1)}s`, `Phase-Shift CD: ${player.phaseCd.toFixed(1)}s`)
                    : core.tr('[Space/Shift] Faz Kayması Hazır', '[Space/Shift] Phase-Shift Ready'));
            hud.push({
                score: Math.floor(score),
                level,
                maxLevel: isStory ? 3 : 99,
                lives,
                statusText: `${st} · ${activeCount}/${targetBullets}`,
                objectiveText: isStory
                    ? core.tr(`Hedef: ${storyTarget} Skor (Bölüm 7)`, `Target: ${storyTarget} Score (Ch.7)`)
                    : core.tr(`Zaman Parçacıklarını Topla · Sıyırma +8`, `Collect Temporal Shards · Graze +8`)
            }, force);
        }

        function resetGame() {
            activeCount = 0;
            shards.length = 0;
            fx.clear();
            score = 0;
            level = 1;
            lives = 3;
            elapsed = 0;
            ended = false;
            emitter.angle = 0;
            emitter.burstCd = 0.02;
            player.x = 200;
            player.y = H * 0.5;
            player.invuln = 1.2;
            player.phaseTimer = 0;
            player.phaseCd = 0;
            for (let i = 0; i < 3; i++) spawnShard();
            syncHud(true);
        }

        function step(dt) {
            if (ended) return;
            elapsed += dt;
            hud.tick(dt);
            core.stepStarfield(stars, dt, 0.25, 0.25);

            if (player.invuln > 0) player.invuln -= dt;
            if (player.phaseTimer > 0) player.phaseTimer -= dt;
            if (player.phaseCd > 0) player.phaseCd -= dt;

            if (input.consumePress('Space', ' ', 'ShiftLeft', 'ShiftRight') && player.phaseCd <= 0) {
                player.phaseTimer = 0.9;
                player.phaseCd = 3.2;
                core.playAudio('dash');
                fx.burst(player.x, player.y, '#a78bfa', 14, 160);
                fx.popup(player.x, player.y - 22, core.tr('FAZ KAYMASI!', 'PHASE SHIFT!'), '#a78bfa', 14);
            }

            let mx = 0;
            let my = 0;
            if (input.has('KeyA', 'ArrowLeft', 'a')) mx -= 1;
            if (input.has('KeyD', 'ArrowRight', 'd')) mx += 1;
            if (input.has('KeyW', 'ArrowUp', 'w')) my -= 1;
            if (input.has('KeyS', 'ArrowDown', 's')) my += 1;

            if (mx !== 0 || my !== 0) {
                const len = Math.hypot(mx, my) || 1;
                player.x += (mx / len) * 285 * dt;
                player.y += (my / len) * 285 * dt;
            } else if (input.pointer.active && input.pointer.down) {
                player.x = lerp(player.x, input.pointer.x, clamp(dt * 12, 0, 1));
                player.y = lerp(player.y, input.pointer.y, clamp(dt * 12, 0, 1));
            }
            player.x = clamp(player.x, 24, W - 24);
            player.y = clamp(player.y, 24, H - 24);

            // Emit spiral streams maintaining 160-350 active bullets
            const desiredCount = elapsed < 3.5 ? 160 : clamp(Math.floor(175 + level * 42), 165, 350);
            emitter.angle += dt * (1.8 + Math.sin(elapsed * 0.7) * 1.1);
            emitter.burstCd -= dt;
            if (emitter.burstCd <= 0 && activeCount < desiredCount) {
                emitter.burstCd = elapsed < 3.5 ? 0.14 : 0.085;
                const arms = elapsed < 3.5 ? 6 : Math.min(12, 7 + level);
                const spd = 135 + Math.min(95, level * 16);
                spawnSpiralVolley(arms, spd, (Math.floor(elapsed * 3) % 2));
            }

            runWasmOrFallbackStep(dt);

            // Compact & check graze/hit
            for (let i = activeCount - 1; i >= 0; i--) {
                const idx = i * 4;
                const bx = bulletData[idx];
                const by = bulletData[idx + 1];
                if (!Number.isFinite(bx) || !Number.isFinite(by) || bx < -25 || bx > W + 25 || by < -25 || by > H + 25) {
                    const last = activeCount - 1;
                    if (i !== last) {
                        const lidx = last * 4;
                        bulletData[idx] = bulletData[lidx];
                        bulletData[idx + 1] = bulletData[lidx + 1];
                        bulletData[idx + 2] = bulletData[lidx + 2];
                        bulletData[idx + 3] = bulletData[lidx + 3];
                        bulletKind[i] = bulletKind[last];
                        bulletGrazed[i] = bulletGrazed[last];
                    }
                    activeCount--;
                    continue;
                }

                const d2 = dist2(bx, by, player.x, player.y);
                if (d2 < 10 * 10) {
                    if (player.phaseTimer <= 0 && player.invuln <= 0) {
                        lives -= 1;
                        player.invuln = 1.25;
                        fx.burst(player.x, player.y, '#fb7185', 18, 220);
                        fx.popup(player.x, player.y - 24, core.tr('İSABET!', 'HIT!'), '#fb7185', 16);
                        if (lives <= 0) {
                            lives = 0;
                            ended = true;
                            core.playAudio('explodeBoss');
                            syncHud(true);
                            ctx.onGameOver?.({
                                score: Math.floor(score),
                                level,
                                stars: 0,
                                reason: core.tr('Chronos mermi yağmurunda kalkan çöktü.', 'Shields fell inside the Chronos bullet storm.')
                            });
                            return;
                        }
                        core.playAudio('playerHurt');
                    }
                } else if (!bulletGrazed[i] && d2 < 26 * 26) {
                    bulletGrazed[i] = 1;
                    score += 8;
                    player.phaseCd = Math.max(0, player.phaseCd - 0.14);
                    fx.burst(player.x, player.y, '#22d3ee', 2, 70, 2);
                }
            }

            // Collect temporal shards
            for (let i = shards.length - 1; i >= 0; i--) {
                const s = shards[i];
                s.bob += dt * 4;
                if (dist2(player.x, player.y, s.x, s.y) < 28 * 28) {
                    shards.splice(i, 1);
                    score += 100;
                    level = 1 + Math.floor(score / 320);
                    core.playAudio('xpPickup', 0.15);
                    fx.burst(s.x, s.y, '#fbbf24', 14, 170);
                    fx.popup(s.x, s.y - 16, '+100', '#fbbf24', 17);
                    spawnShard();
                }
            }

            score += dt * 12;
            if (isStory && score >= storyTarget && !ended) {
                ended = true;
                core.playAudio('levelup');
                syncHud(true);
                ctx.onWin?.({ score: Math.floor(score), level, stars: lives >= 3 ? 3 : (lives === 2 ? 2 : 1) });
                return;
            }

            fx.update(dt);
            input.endFrame();
            syncHud(false);
        }

        function render() {
            core.renderBackdrop(g, stars, '#050614', '#0f0c29', 'rgba(45,212,191,0.12)');

            // Central Chronos Emitter
            core.drawSprite(g, 'portal_vortex', emitter.x, emitter.y, 118, 118, -elapsed * 1.4, 0.72);
            core.drawSprite(g, 'boss_core', emitter.x, emitter.y, 58, 58, emitter.angle, 1, (c) => {
                c.fillStyle = '#2dd4bf';
                c.beginPath(); c.arc(0, 0, 24, 0, TAU); c.fill();
            });

            // Temporal Shards
            for (let i = 0; i < shards.length; i++) {
                const s = shards[i];
                const pulse = 1 + Math.sin(s.bob) * 0.14;
                core.drawSprite(g, 'coin_star', s.x, s.y, 34 * pulse, 34 * pulse, s.bob * 0.4, 1, (c) => {
                    c.fillStyle = '#fbbf24';
                    c.beginPath(); c.arc(0, 0, 12, 0, TAU); c.fill();
                });
            }

            // Bullets (fast batched draw)
            for (let i = 0; i < activeCount; i++) {
                const idx = i * 4;
                const bx = bulletData[idx];
                const by = bulletData[idx + 1];
                const k = bulletKind[i];
                g.fillStyle = k === 0 ? '#fb7185' : '#38bdf8';
                g.beginPath();
                g.arc(bx, by, 5.2, 0, TAU);
                g.fill();
                g.fillStyle = '#ffffff';
                g.beginPath();
                g.arc(bx, by, 2.3, 0, TAU);
                g.fill();
            }

            // Player with crisp small core hitbox ring
            const visible = player.invuln <= 0 || Math.floor(player.invuln * 18) % 2 === 0;
            if (visible) {
                core.drawSprite(g, 'fighter', player.x, player.y, 34, 34, 0, player.phaseTimer > 0 ? 0.5 : 1);
                g.strokeStyle = player.phaseTimer > 0 ? '#a78bfa' : '#22d3ee';
                g.lineWidth = 2;
                g.beginPath();
                g.arc(player.x, player.y, 6, 0, TAU);
                g.stroke();
            }

            // Subtle WASM telemetry tag
            g.save();
            g.font = '600 11px "JetBrains Mono", monospace';
            g.fillStyle = 'rgba(148,163,184,0.65)';
            g.textAlign = 'right';
            g.fillText(`SIM:${wasmEngineMode.toUpperCase()} · ${activeCount} ORBS`, W - 16, H - 14);
            g.restore();

            fx.render(g);
            core.drawHintBanner(g, core.tr('WASD / Fare ile süzül · Altın Parçacıkları topla · [Space/Shift] Faz Kayması', 'Steer: WASD / Drag · Grab Gold Shards · [Space/Shift] Phase-Shift'), elapsed);
        }

        resetGame();
        const loopHandle = core.createLoop(step, render);

        return {
            restart() { resetGame(); },
            destroy() {
                loopHandle.stop();
                input.destroy();
                if (canvas.parentNode) canvas.remove();
            }
        };
    };

    // =========================================================================
    // 3. shader-pulse-survivor (GLSL fragment shader bg + 2D foreground canvas)
    // =========================================================================
    global.COSMIC_GAME_ENGINES['shader-pulse-survivor'] = function mountShaderPulse(ctx) {
        const core = createCore(ctx);
        if (ctx.stageEl) {
            try {
                if (global.getComputedStyle(ctx.stageEl).position === 'static') {
                    ctx.stageEl.style.position = 'relative';
                }
            } catch (e) { /* ignore */ }
        }

        const FRAG_SRC = `
            precision mediump float;
            uniform vec2 u_resolution;
            uniform float u_time;
            uniform float u_pulse;
            uniform vec2 u_player;
            uniform float u_phase;
            uniform vec3 u_zone;
            uniform vec3 u_wave;
            void main() {
                vec2 uv = gl_FragCoord.xy / max(u_resolution, vec2(1.0));
                vec2 p = (uv - 0.5) * vec2(u_resolution.x / max(u_resolution.y, 1.0), 1.0);
                vec2 pl = (u_player - 0.5) * vec2(u_resolution.x / max(u_resolution.y, 1.0), 1.0);
                float dPlayer = length(p - pl);
                float swirl = sin(p.x * 5.0 + u_time * 0.8) * cos(p.y * 5.0 - u_time * 0.6);
                vec3 base = mix(vec3(0.02, 0.04, 0.11), vec3(0.06, 0.12, 0.24), 0.5 + 0.5 * swirl);
                float grid = smoothstep(0.94, 0.99, max(abs(sin(p.x * 16.0)), abs(sin(p.y * 16.0))));
                base += vec3(0.05, 0.28, 0.45) * grid * (0.28 + 0.35 * u_pulse);
                base += vec3(0.10, 0.55, 0.85) * exp(-dPlayer * 6.5) * 0.45;
                vec2 zn = (u_zone.xy - 0.5) * vec2(u_resolution.x / max(u_resolution.y, 1.0), 1.0);
                float dZone = length(p - zn);
                float zoneMask = smoothstep(u_zone.z + 0.03, u_zone.z - 0.04, dZone);
                base += vec3(0.08, 0.65, 0.55) * zoneMask * (0.22 + 0.25 * u_phase);
                if (u_phase > 0.2) {
                    base = mix(base, vec3(0.32, 0.04, 0.14), (1.0 - zoneMask) * u_phase * 0.45);
                }
                vec2 wv = (u_wave.xy - 0.5) * vec2(u_resolution.x / max(u_resolution.y, 1.0), 1.0);
                float dWave = abs(length(p - wv) - u_wave.z);
                float ring = exp(-dWave * 45.0) * (0.65 + 0.65 * u_pulse);
                base += vec3(0.98, 0.35, 0.52) * ring;
                gl_FragColor = vec4(base, 1.0);
            }
        `;

        let shaderSurface = null;
        let bgGlCanvas = null;
        let nativeGl = null;

        function tryCreateHostShaderSurface() {
            if (!ctx.shaders || typeof ctx.shaders.createShaderSurface !== 'function' || !ctx.stageEl) return null;
            const beforeCount = ctx.stageEl.children.length;
            const initialUniforms = { u_pulse: 0, u_player: [0.5, 0.5], u_phase: 0, u_zone: [0.5, 0.5, 0.22], u_wave: [0.5, 0.5, 0] };
            const cleanupOrphans = () => {
                while (ctx.stageEl.children.length > beforeCount) {
                    ctx.stageEl.lastElementChild?.remove?.();
                }
            };
            try {
                const s = ctx.shaders.createShaderSurface({
                    container: ctx.stageEl,
                    stageEl: ctx.stageEl,
                    fragmentShader: FRAG_SRC,
                    frag: FRAG_SRC,
                    uniforms: initialUniforms,
                    width: W,
                    height: H
                });
                if (s && s.isWebGL) return s;
                s?.destroy?.();
                cleanupOrphans();
            } catch (e) {
                cleanupOrphans();
            }
            try {
                const s2 = ctx.shaders.createShaderSurface(ctx.stageEl, FRAG_SRC, initialUniforms);
                if (s2 && s2.isWebGL) return s2;
                s2?.destroy?.();
                cleanupOrphans();
            } catch (e) {
                cleanupOrphans();
            }
            return null;
        }

        function createFallbackWebGLSurface() {
            const c = core.makeCanvas('webgl');
            c.style.position = 'absolute';
            c.style.inset = '0';
            c.style.zIndex = '1';
            const gl = c.getContext('webgl2') || c.getContext('webgl');
            if (!gl) return { canvas: c, gl: null };

            const vsSrc = `attribute vec2 a_pos; void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }`;
            const compile = (type, src) => {
                const sh = gl.createShader(type);
                if (!sh) return null;
                gl.shaderSource(sh, src);
                gl.compileShader(sh);
                if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
                    gl.deleteShader(sh);
                    return null;
                }
                return sh;
            };
            const vs = compile(gl.VERTEX_SHADER, vsSrc);
            const fs = compile(gl.FRAGMENT_SHADER, FRAG_SRC);
            if (!vs || !fs) {
                if (vs) gl.deleteShader(vs);
                if (fs) gl.deleteShader(fs);
                return { canvas: c, gl: null };
            }
            const prog = gl.createProgram();
            gl.attachShader(prog, vs);
            gl.attachShader(prog, fs);
            gl.linkProgram(prog);
            if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
                gl.deleteProgram(prog);
                gl.deleteShader(vs);
                gl.deleteShader(fs);
                return { canvas: c, gl: null };
            }
            gl.useProgram(prog);

            const buf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buf);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
            const loc = gl.getAttribLocation(prog, 'a_pos');
            gl.enableVertexAttribArray(loc);
            gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

            const uLocs = {
                res: gl.getUniformLocation(prog, 'u_resolution'),
                time: gl.getUniformLocation(prog, 'u_time'),
                pulse: gl.getUniformLocation(prog, 'u_pulse'),
                player: gl.getUniformLocation(prog, 'u_player'),
                phase: gl.getUniformLocation(prog, 'u_phase'),
                zone: gl.getUniformLocation(prog, 'u_zone'),
                wave: gl.getUniformLocation(prog, 'u_wave')
            };

            return {
                canvas: c,
                gl,
                render(u) {
                    gl.viewport(0, 0, W, H);
                    gl.uniform2f(uLocs.res, W, H);
                    gl.uniform1f(uLocs.time, u.u_time);
                    gl.uniform1f(uLocs.pulse, u.u_pulse);
                    gl.uniform2f(uLocs.player, u.u_player[0], u.u_player[1]);
                    gl.uniform1f(uLocs.phase, u.u_phase);
                    gl.uniform3f(uLocs.zone, u.u_zone[0], u.u_zone[1], u.u_zone[2]);
                    gl.uniform3f(uLocs.wave, u.u_wave[0], u.u_wave[1], u.u_wave[2]);
                    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
                },
                destroy() {
                    gl.deleteBuffer(buf);
                    gl.deleteProgram(prog);
                    gl.deleteShader(vs);
                    gl.deleteShader(fs);
                }
            };
        }

        shaderSurface = tryCreateHostShaderSurface();
        if (!shaderSurface) {
            const fb = createFallbackWebGLSurface();
            bgGlCanvas = fb.canvas;
            nativeGl = fb;
        }

        // Foreground HUD & Entity Canvas layered cleanly over shader background
        const fgCanvas = core.makeCanvas('2d');
        fgCanvas.style.position = 'absolute';
        fgCanvas.style.inset = '0';
        fgCanvas.style.zIndex = '2';
        const g = fgCanvas.getContext('2d');

        const hud = core.createHudSync();
        const fx = core.createFX();
        const input = core.createInput(fgCanvas);

        const player = { x: W * 0.5, y: H * 0.5, dashTimer: 0, dashCd: 0, invuln: 0 };
        const safeZone = { x: W * 0.5, y: H * 0.5, tx: W * 0.5, ty: H * 0.5, r: 122, moveTimer: 4 };
        const shockwaves = [];
        const prisms = [];
        const isStory = ctx.isStory !== undefined ? Boolean(ctx.isStory) : Boolean(ctx.chapterId || ctx.chapterTarget);
        const storyTarget = ctx.chapterTarget || 1400;

        let score = 0;
        let level = 1;
        let lives = 3;
        let elapsed = 0;
        let pulseVal = 0;
        let waveCd = 2.6;
        let collapseCycle = 0;
        let collapsePhase = 0; // 0..1 when void collapse threatens outside safeZone
        let ended = false;

        function spawnPrism() {
            prisms.push({
                x: 75 + Math.random() * (W - 150),
                y: 75 + Math.random() * (H - 150),
                cryo: Math.random() < 0.35,
                bob: Math.random() * TAU
            });
        }

        function spawnShockwave() {
            const x = 130 + Math.random() * (W - 260);
            const y = 100 + Math.random() * (H - 200);
            shockwaves.push({ x, y, r: 10, maxR: 720, speed: 210 + level * 22, telegraph: 0.9, hitPlayer: false });
            core.playAudio('emp');
        }

        function syncHud(force) {
            const inZone = Math.hypot(player.x - safeZone.x, player.y - safeZone.y) <= safeZone.r;
            const st = collapsePhase > 0.35 && !inZone
                ? core.tr('GÜVENLİ ALANA GİR!', 'ENTER SAFE ZONE!')
                : (player.dashCd > 0
                    ? core.tr(`Dash: ${player.dashCd.toFixed(1)}s`, `Dash CD: ${player.dashCd.toFixed(1)}s`)
                    : core.tr('[Space] Faz Dash Hazır', '[Space] Phase Dash Ready'));
            hud.push({
                score: Math.floor(score),
                level,
                maxLevel: 99,
                lives,
                statusText: st,
                objectiveText: core.tr('Şok dalgalarından kaç · Prizmaları topla · Bölgede kal', 'Dodge Shockwaves · Grab Prisms · Hold Safe Zone')
            }, force);
        }

        function damagePlayer(reasonMsg) {
            if (player.invuln > 0 || player.dashTimer > 0 || ended) return;
            lives -= 1;
            player.invuln = 1.25;
            pulseVal = 1.0;
            fx.burst(player.x, player.y, '#fb7185', 18, 220);
            fx.popup(player.x, player.y - 24, core.tr('ŞOK HASARI!', 'PULSE HIT!'), '#fb7185', 16);
            if (lives <= 0) {
                lives = 0;
                ended = true;
                core.playAudio('explodeBoss');
                syncHud(true);
                ctx.onGameOver?.({ score: Math.floor(score), level, stars: 0, reason: reasonMsg });
            } else {
                core.playAudio('playerHurt');
                syncHud(true);
            }
        }

        function resetGame() {
            fx.clear();
            shockwaves.length = 0;
            prisms.length = 0;
            score = 0;
            level = 1;
            lives = 3;
            elapsed = 0;
            pulseVal = 0;
            waveCd = 2.8;
            collapseCycle = 0;
            collapsePhase = 0;
            ended = false;
            player.x = W * 0.5;
            player.y = H * 0.5;
            player.dashTimer = 0;
            player.dashCd = 0;
            player.invuln = 1.0;
            safeZone.x = W * 0.5;
            safeZone.y = H * 0.5;
            safeZone.tx = W * 0.5;
            safeZone.ty = H * 0.5;
            safeZone.r = 126;
            safeZone.moveTimer = 4.0;
            for (let i = 0; i < 4; i++) spawnPrism();
            syncHud(true);
        }

        function step(dt) {
            if (ended) return;
            elapsed += dt;
            hud.tick(dt);
            pulseVal = Math.max(0, pulseVal - dt * 1.4);
            if (player.invuln > 0) player.invuln -= dt;
            if (player.dashTimer > 0) player.dashTimer -= dt;
            if (player.dashCd > 0) player.dashCd -= dt;

            let mx = 0;
            let my = 0;
            if (input.has('KeyA', 'ArrowLeft', 'a')) mx -= 1;
            if (input.has('KeyD', 'ArrowRight', 'd')) mx += 1;
            if (input.has('KeyW', 'ArrowUp', 'w')) my -= 1;
            if (input.has('KeyS', 'ArrowDown', 's')) my += 1;
            const len = Math.hypot(mx, my) || 1;

            if ((input.consumePress('Space', ' ') || input.consumePointerTap()) && player.dashCd <= 0) {
                player.dashTimer = 0.25;
                player.dashCd = 1.65;
                core.playAudio('dash');
                fx.burst(player.x, player.y, '#38bdf8', 12, 160);
            }

            const spd = player.dashTimer > 0 ? 640 : 295;
            if (mx !== 0 || my !== 0) {
                player.x += (mx / len) * spd * dt;
                player.y += (my / len) * spd * dt;
            } else if (input.pointer.active && input.pointer.down) {
                const dx = input.pointer.x - player.x;
                const dy = input.pointer.y - player.y;
                const d = Math.hypot(dx, dy);
                if (d > 4) {
                    player.x += (dx / d) * Math.min(d, spd * dt);
                    player.y += (dy / d) * Math.min(d, spd * dt);
                }
            }
            player.x = clamp(player.x, 26, W - 26);
            player.y = clamp(player.y, 26, H - 26);

            // Shifting orbital safe zone
            safeZone.moveTimer -= dt;
            if (safeZone.moveTimer <= 0) {
                safeZone.moveTimer = 5.5;
                safeZone.tx = 160 + Math.random() * (W - 320);
                safeZone.ty = 130 + Math.random() * (H - 260);
            }
            safeZone.x = lerp(safeZone.x, safeZone.tx, clamp(dt * 0.9, 0, 1));
            safeZone.y = lerp(safeZone.y, safeZone.ty, clamp(dt * 0.9, 0, 1));
            safeZone.r = Math.max(82, 128 - level * 4);

            // Void collapse cycle every 13s
            collapseCycle += dt;
            const mod = collapseCycle % 13;
            collapsePhase = mod > 9.0 ? clamp((mod - 9.0) / 1.5, 0, 1) : 0;

            const inSafe = Math.hypot(player.x - safeZone.x, player.y - safeZone.y) <= safeZone.r;
            if (inSafe) {
                score += dt * 20;
            } else if (collapsePhase >= 0.98 && elapsed > 5) {
                damagePlayer(core.tr('Güvenli yörünge alanı dışında çöküş dalgasına yakalandın.', 'Caught outside the orbital safe zone during void collapse.'));
                if (ended) return;
            }

            waveCd -= dt;
            if (waveCd <= 0) {
                spawnShockwave();
                waveCd = Math.max(1.15, 2.5 - level * 0.14);
            }

            for (let i = shockwaves.length - 1; i >= 0; i--) {
                const wv = shockwaves[i];
                if (wv.telegraph > 0) {
                    wv.telegraph -= dt;
                    continue;
                }
                wv.r += wv.speed * dt;
                pulseVal = Math.max(pulseVal, 0.45);
                if (!wv.hitPlayer && !inSafe) {
                    const d = Math.hypot(player.x - wv.x, player.y - wv.y);
                    if (Math.abs(d - wv.r) < 13) {
                        wv.hitPlayer = true;
                        damagePlayer(core.tr('Yerçekimi şok dalgası gemiyi parçaladı.', 'Shattered by expanding gravity shockwave.'));
                        if (ended) return;
                    }
                }
                if (wv.r > wv.maxR) shockwaves.splice(i, 1);
            }

            for (let i = prisms.length - 1; i >= 0; i--) {
                const pr = prisms[i];
                pr.bob += dt * 3.8;
                if (dist2(player.x, player.y, pr.x, pr.y) < 30 * 30) {
                    prisms.splice(i, 1);
                    const pts = pr.cryo ? 140 : 100;
                    score += pts;
                    level = 1 + Math.floor(score / 600);
                    pulseVal = Math.max(pulseVal, 0.7);
                    core.playAudio('powerup', 0.14);
                    fx.burst(pr.x, pr.y, pr.cryo ? '#22d3ee' : '#a78bfa', 14, 180);
                    fx.popup(pr.x, pr.y - 16, `+${pts}`, pr.cryo ? '#22d3ee' : '#c4b5fd', 16);
                    spawnPrism();
                }
            }

            fx.update(dt);
            input.endFrame();
            syncHud(false);
            if (!ended && isStory && score >= storyTarget) {
                ended = true;
                core.playAudio('levelup');
                syncHud(true);
                ctx.onWin?.({ score: Math.floor(score), level, stars: lives >= 3 ? 3 : 2 });
            }
        }

        function render() {
            const activeWave = shockwaves.find((w) => w.telegraph <= 0);
            const uPayload = {
                u_time: elapsed,
                u_pulse: pulseVal,
                u_player: [player.x / W, 1.0 - player.y / H],
                u_phase: collapsePhase,
                u_zone: [safeZone.x / W, 1.0 - safeZone.y / H, safeZone.r / H],
                u_wave: activeWave ? [activeWave.x / W, 1.0 - activeWave.y / H, activeWave.r / H] : [0.5, 0.5, -1.0]
            };

            if (shaderSurface) {
                try {
                    if (shaderSurface.uniforms) Object.assign(shaderSurface.uniforms, uPayload);
                    shaderSurface.setUniforms?.(uPayload);
                    if (typeof shaderSurface.setUniform === 'function') {
                        shaderSurface.setUniform('u_pulse', uPayload.u_pulse);
                        shaderSurface.setUniform('u_player', uPayload.u_player);
                        shaderSurface.setUniform('u_phase', uPayload.u_phase);
                    }
                    shaderSurface.update?.(uPayload);
                    shaderSurface.render?.(uPayload);
                } catch (e) { /* safe ignore */ }
            } else if (nativeGl && nativeGl.gl) {
                nativeGl.render(uPayload);
            }

            // Transparent clear so GLSL shader background shines right through
            g.clearRect(0, 0, W, H);
            if (!shaderSurface && (!nativeGl || !nativeGl.gl)) {
                g.fillStyle = '#060a18';
                g.fillRect(0, 0, W, H);
            }

            // Orbital Safe Zone ring + Void Collapse countdown telegraph arc
            g.save();
            g.strokeStyle = collapsePhase > 0.2 ? '#fbbf24' : '#34d399';
            g.lineWidth = 2.5;
            g.setLineDash([8, 6]);
            g.beginPath();
            g.arc(safeZone.x, safeZone.y, safeZone.r, 0, TAU);
            g.stroke();
            g.setLineDash([]);
            if (collapsePhase > 0.05) {
                g.strokeStyle = collapsePhase > 0.72 ? '#fb7185' : '#fbbf24';
                g.lineWidth = 4.5;
                g.beginPath();
                g.arc(safeZone.x, safeZone.y, safeZone.r + 6, -Math.PI * 0.5, -Math.PI * 0.5 + TAU * collapsePhase);
                g.stroke();
            }
            g.font = '700 11px "Space Grotesk", sans-serif';
            g.fillStyle = collapsePhase > 0.5 ? '#fbbf24' : '#34d399';
            g.textAlign = 'center';
            g.fillText(collapsePhase > 0.35 ? core.tr('ÇÖKÜŞ YAKLAŞIYOR — ALANA GİR!', 'VOID COLLAPSE — HOLD ZONE!') : core.tr('GÜVENLİ ALAN', 'SAFE ZONE'), safeZone.x, safeZone.y - safeZone.r - 12);
            g.restore();

            // Shockwaves (crisp spawn countdown ring -> expanding shock ring)
            for (let i = 0; i < shockwaves.length; i++) {
                const wv = shockwaves[i];
                if (wv.telegraph > 0) {
                    const p = clamp(1 - wv.telegraph / 0.9, 0, 1);
                    g.save();
                    g.strokeStyle = `rgba(251,113,133,${0.45 + p * 0.5})`;
                    g.lineWidth = 2 + p * 2.5;
                    g.setLineDash([5, 4]);
                    g.beginPath();
                    g.arc(wv.x, wv.y, 38 - p * 24, 0, TAU);
                    g.stroke();
                    g.fillStyle = 'rgba(251,113,133,0.35)';
                    g.beginPath();
                    g.arc(wv.x, wv.y, 5 + p * 4, 0, TAU);
                    g.fill();
                    g.restore();
                } else {
                    g.strokeStyle = 'rgba(251,113,133,0.85)';
                    g.lineWidth = 4;
                    g.beginPath();
                    g.arc(wv.x, wv.y, wv.r, 0, TAU);
                    g.stroke();
                }
            }

            // Prisms
            for (let i = 0; i < prisms.length; i++) {
                const pr = prisms[i];
                const sc = 1 + Math.sin(pr.bob) * 0.1;
                core.drawSprite(g, pr.cryo ? 'cryo_crystal' : 'energy_prism', pr.x, pr.y, 34 * sc, 34 * sc, pr.bob * 0.25, 1);
            }

            // Player
            const vis = player.invuln <= 0 || Math.floor(player.invuln * 18) % 2 === 0;
            if (vis) {
                core.drawSprite(g, 'nova_avatar', player.x, player.y, 40, 40, 0, player.dashTimer > 0 ? 0.55 : 1);
                g.strokeStyle = '#38bdf8';
                g.lineWidth = 2;
                g.beginPath();
                g.arc(player.x, player.y, 13, 0, TAU);
                g.stroke();
            }

            fx.render(g);
            core.drawHintBanner(g, core.tr('WASD / Sürükle · Şok dalgalarını [Space] ile geç · Güvenli alanda kal', 'WASD / Drag · [Space] Dash through shockwaves · Stay in Safe Zone'), elapsed);
        }

        resetGame();
        const loopHandle = core.createLoop(step, render);

        return {
            restart() { resetGame(); },
            destroy() {
                loopHandle.stop();
                input.destroy();
                if (shaderSurface) {
                    shaderSurface.destroy?.();
                    shaderSurface.dispose?.();
                }
                if (nativeGl) nativeGl.destroy?.();
                if (bgGlCanvas?.parentNode) bgGlCanvas.remove();
                if (fgCanvas.parentNode) fgCanvas.remove();
            }
        };
    };

    // =========================================================================
    // 4. nova-flappy-rift (Story Ch.1! chapterTarget=8)
    // =========================================================================
    global.COSMIC_GAME_ENGINES['nova-flappy-rift'] = function mountNovaFlappy(ctx) {
        const core = createCore(ctx);
        const canvas = core.makeCanvas();
        const g = canvas.getContext('2d');
        const hud = core.createHudSync();
        const fx = core.createFX();
        const stars = core.createStarfield(110);
        const input = core.createInput(canvas);

        const isStory = ctx.isStory !== undefined ? Boolean(ctx.isStory) : Boolean(ctx.chapterId || ctx.chapterTarget);
        const storyTarget = ctx.chapterTarget || 8;

        const NOVA_X = 220;
        const HIT_R = 12;
        const player = { y: H * 0.48, vy: 0, rot: 0, invuln: 0 };
        const gates = [];
        const coins = [];

        let score = 0;
        let gatesCleared = 0;
        let level = 1;
        let lives = 2;
        let started = false;
        let elapsed = 0;
        let spawnTimer = 0.8;
        let lastGateCy = H * 0.48;
        let ended = false;

        function spawnGate() {
            const idx = gatesCleared + gates.length;
            const gap = idx < 4 ? 158 : (idx < 10 ? 144 : 134);
            const moving = idx >= 4 && Math.random() < 0.45;
            const amp = moving ? (22 + Math.min(26, level * 4)) : 0;
            const margin = 64 + gap * 0.5 + amp;
            const minCy = margin;
            const maxCy = Math.max(minCy + 10, H - margin);
            const rawCy = minCy + Math.random() * (maxCy - minCy);
            // Bound consecutive vertical gate delta so transitions are always flyable
            const cy = clamp(clamp(rawCy, lastGateCy - 148, lastGateCy + 148), minCy, maxCy);
            lastGateCy = cy;
            gates.push({
                x: W + 60,
                w: 58,
                cy,
                baseCy: cy,
                gap,
                moving,
                phase: Math.random() * TAU,
                amp,
                scored: false
            });
            if (idx % 2 === 1) {
                coins.push({ x: W + 60, y: cy + (Math.random() - 0.5) * 32, bob: Math.random() * TAU, taken: false });
            }
        }

        function syncHud(force) {
            hud.push({
                score,
                level,
                maxLevel: isStory ? 1 : 99,
                lives,
                statusText: started
                    ? core.tr(`Geçilen Yarık: ${gatesCleared}`, `Rifts Cleared: ${gatesCleared}`)
                    : core.tr('Zıplamak için [Space / Tıkla]', 'Tap [Space / Click] to Launch'),
                objectiveText: isStory
                    ? core.tr(`Hedef: ${storyTarget} Skor (Bölüm 1)`, `Target: ${storyTarget} Score (Ch.1)`)
                    : core.tr('Plazma geçitlerinden süzül · Yıldızları kap', 'Glide through plasma gates · Grab stars')
            }, force);
        }

        function flap() {
            if (ended) return;
            started = true;
            player.vy = -345;
            core.playAudio('dash', 0.2);
            fx.burst(NOVA_X - 14, player.y + 10, '#38bdf8', 7, 130);
        }

        function addPoint(pts, x, y, label) {
            score += pts;
            level = 1 + Math.floor(gatesCleared / 5);
            fx.popup(x, y, label || `+${pts}`, '#fbbf24', 17);
            if (isStory && score >= storyTarget && !ended) {
                ended = true;
                core.playAudio('levelup');
                syncHud(true);
                ctx.onWin?.({ score, level, stars: lives >= 2 ? 3 : 2 });
            }
        }

        function handleHit() {
            if (player.invuln > 0 || ended) return;
            lives -= 1;
            player.invuln = 1.15;
            // Bounce away from top vs bottom boundary instead of slamming back into ceiling
            player.vy = player.y < H * 0.35 ? 140 : -220;
            player.y = clamp(player.y, 70, H - 70);
            fx.burst(NOVA_X, player.y, '#fb7185', 18, 220);
            if (lives <= 0) {
                lives = 0;
                ended = true;
                core.playAudio('explodeBoss');
                syncHud(true);
                ctx.onGameOver?.({
                    score,
                    level,
                    stars: 0,
                    reason: core.tr('Kaptan Nova plazma yarığında itici kaybetti.', 'Captain Nova lost jetpack thrust in the rift.')
                });
            } else {
                core.playAudio('playerHurt');
                fx.popup(NOVA_X, player.y - 24, core.tr('KALKAN KIRILDI!', 'SHIELD HIT!'), '#fb7185', 15);
            }
            syncHud(true);
        }

        function resetGame() {
            gates.length = 0;
            coins.length = 0;
            fx.clear();
            score = 0;
            gatesCleared = 0;
            level = 1;
            lives = 2;
            started = false;
            elapsed = 0;
            spawnTimer = 0.6;
            lastGateCy = H * 0.48;
            ended = false;
            player.y = H * 0.48;
            player.vy = 0;
            player.rot = 0;
            player.invuln = 0;
            syncHud(true);
        }

        function step(dt) {
            if (ended) return;
            elapsed += dt;
            hud.tick(dt);
            core.stepStarfield(stars, dt, started ? -2.2 : -0.7, 0);
            if (player.invuln > 0) player.invuln -= dt;

            if (input.consumePress('Space', ' ', 'ArrowUp', 'KeyW', 'w') || input.consumePointerTap()) {
                flap();
            }

            if (!started) {
                player.y = H * 0.48 + Math.sin(elapsed * 4) * 10;
                player.rot = Math.sin(elapsed * 4) * 0.08;
                fx.update(dt);
                input.endFrame();
                return;
            }

            player.vy = Math.min(540, player.vy + 940 * dt);
            player.y += player.vy * dt;
            player.rot = clamp(player.vy / 520, -0.45, 0.65);

            if (player.y - HIT_R < 10 || player.y + HIT_R > H - 10) {
                handleHit();
                if (ended) return;
            }

            const speed = 215 + Math.min(95, gatesCleared * 4.5);
            spawnTimer -= dt;
            if (spawnTimer <= 0) {
                spawnGate();
                spawnTimer = gatesCleared < 4 ? 1.75 : Math.max(1.25, 1.65 - gatesCleared * 0.015);
            }

            for (let i = gates.length - 1; i >= 0; i--) {
                const gt = gates[i];
                gt.x -= speed * dt;
                if (gt.moving) {
                    gt.phase += dt * 2.2;
                    const halfGap = gt.gap * 0.5 + 48;
                    gt.cy = clamp(gt.baseCy + Math.sin(gt.phase) * gt.amp, halfGap, H - halfGap);
                }

                const topBottom = gt.cy - gt.gap * 0.5;
                const botTop = gt.cy + gt.gap * 0.5;
                const closestX = clamp(NOVA_X, gt.x - gt.w * 0.5, gt.x + gt.w * 0.5);
                if (Math.abs(NOVA_X - closestX) < HIT_R) {
                    if (player.y - HIT_R < topBottom || player.y + HIT_R > botTop) {
                        handleHit();
                        if (ended) return;
                    }
                }

                if (!gt.scored && gt.x + gt.w * 0.5 < NOVA_X - HIT_R) {
                    gt.scored = true;
                    gatesCleared += 1;
                    core.playAudio('xpPickup', 0.12);
                    addPoint(1, NOVA_X, player.y - 26, '+1');
                    if (ended) return;
                }

                if (gt.x < -80) gates.splice(i, 1);
            }

            for (let i = coins.length - 1; i >= 0; i--) {
                const c = coins[i];
                c.x -= speed * dt;
                c.bob += dt * 5;
                if (!c.taken && dist2(NOVA_X, player.y, c.x, c.y) < 26 * 26) {
                    c.taken = true;
                    core.playAudio('powerup');
                    fx.burst(c.x, c.y, '#fbbf24', 12, 160);
                    addPoint(1, c.x, c.y - 16, core.tr('YILDIZ +1', 'STAR +1'));
                    coins.splice(i, 1);
                    if (ended) return;
                    continue;
                }
                if (c.x < -50) coins.splice(i, 1);
            }

            fx.update(dt);
            input.endFrame();
            syncHud(false);
        }

        function render() {
            core.renderBackdrop(g, stars, '#050817', '#0e1736', 'rgba(56,189,248,0.12)');

            // Gates
            for (let i = 0; i < gates.length; i++) {
                const gt = gates[i];
                const topH = gt.cy - gt.gap * 0.5;
                const botY = gt.cy + gt.gap * 0.5;
                const gx = gt.x - gt.w * 0.5;
                const beamGrad = g.createLinearGradient(gx, 0, gx + gt.w, 0);
                beamGrad.addColorStop(0, gt.moving ? '#7c3aed' : '#0284c7');
                beamGrad.addColorStop(0.5, gt.moving ? '#a78bfa' : '#38bdf8');
                beamGrad.addColorStop(1, gt.moving ? '#7c3aed' : '#0284c7');
                g.fillStyle = beamGrad;
                g.fillRect(gx, 0, gt.w, Math.max(0, topH));
                g.fillRect(gx, botY, gt.w, Math.max(0, H - botY));

                g.fillStyle = '#0f172a';
                g.strokeStyle = gt.moving ? '#c4b5fd' : '#7dd3fc';
                g.lineWidth = 2;
                g.fillRect(gx - 5, topH - 18, gt.w + 10, 18);
                g.strokeRect(gx - 5, topH - 18, gt.w + 10, 18);
                g.fillRect(gx - 5, botY, gt.w + 10, 18);
                g.strokeRect(gx - 5, botY, gt.w + 10, 18);

                if (gt.moving) {
                    core.drawSprite(g, 'alien_drone', gt.x, topH - 9, 26, 26, 0, 0.9);
                }
            }

            for (let i = 0; i < coins.length; i++) {
                const c = coins[i];
                core.drawSprite(g, 'coin_star', c.x, c.y + Math.sin(c.bob) * 4, 28, 28, c.bob * 0.4, 1);
            }

            // Captain Nova Vex
            const vis = player.invuln <= 0 || Math.floor(player.invuln * 18) % 2 === 0;
            if (vis) {
                core.drawSprite(g, 'astronaut', NOVA_X, player.y, 40, 40, player.rot, 1, (c) => {
                    c.fillStyle = '#38bdf8';
                    c.beginPath(); c.arc(0, 0, 14, 0, TAU); c.fill();
                });
            }

            fx.render(g);
            if (!started) {
                core.drawHintBanner(g, core.tr('[Space / Yukarı / Tıkla] ile roketi ateşle ve yarıkları aş!', 'Tap [Space / Up / Click] to jetpack through the rift!'), 0);
            }
        }

        resetGame();
        const loopHandle = core.createLoop(step, render);

        return {
            restart() { resetGame(); },
            destroy() {
                loopHandle.stop();
                input.destroy();
                if (canvas.parentNode) canvas.remove();
            }
        };
    };

    // =========================================================================
    // 5. gravity-flip-runner
    // =========================================================================
    global.COSMIC_GAME_ENGINES['gravity-flip-runner'] = function mountGravityFlip(ctx) {
        const core = createCore(ctx);
        const canvas = core.makeCanvas();
        const g = canvas.getContext('2d');
        const hud = core.createHudSync();
        const fx = core.createFX();
        const stars = core.createStarfield(110);
        const input = core.createInput(canvas);

        const CEIL_Y = 92;
        const FLOOR_Y = 448;
        const PX = 190;
        const PR = 16;

        const player = { y: FLOOR_Y - PR, vy: 0, gravDir: 1, invuln: 0 };
        const obstacles = [];
        const gaps = [];
        const collectibles = [];

        let score = 0;
        let level = 1;
        let lives = 3;
        let elapsed = 0;
        let spawnCd = 1.2;
        let lastHazardSide = 1;
        let scrollOffset = 0;
        let ended = false;

        function flipGravity() {
            if (ended) return;
            player.gravDir *= -1;
            player.vy = player.gravDir * 240;
            core.playAudio('dash', 0.18);
            fx.burst(PX, player.y, '#38bdf8', 9, 140);
        }

        function spawnPattern(runSpeed) {
            const side = Math.random() < 0.5 ? 1 : -1; // 1 = floor, -1 = ceiling
            // Guarantee enough horizontal distance for mid-air flip when switching tracks
            let rightmostX = W + 60;
            const minFlipGap = Math.max(255, (runSpeed || 350) * 0.58);
            for (let i = 0; i < obstacles.length; i++) {
                const edge = obstacles[i].x + obstacles[i].w;
                if (edge > rightmostX - minFlipGap && obstacles[i].side !== side) {
                    rightmostX = Math.max(rightmostX, edge + minFlipGap);
                }
            }
            for (let i = 0; i < gaps.length; i++) {
                const edge = gaps[i].x + gaps[i].w;
                if (edge > rightmostX - minFlipGap && gaps[i].side !== side) {
                    rightmostX = Math.max(rightmostX, edge + minFlipGap);
                }
            }
            lastHazardSide = side;

            const r = Math.random();
            if (r < 0.44 && elapsed > 3.5) {
                // Void gap on one track only (safe track on opposite side)
                const gw = 116 + Math.min(52, level * 7);
                gaps.push({ x: rightmostX, w: gw, side });
                collectibles.push({ x: rightmostX + gw * 0.5, y: side === 1 ? CEIL_Y + 34 : FLOOR_Y - 34, bob: 0 });
            } else {
                // Laser wall or cargo crusher on one side
                const isLaser = Math.random() < 0.55;
                const h = isLaser ? 122 : 72;
                obstacles.push({
                    x: rightmostX,
                    w: isLaser ? 22 : 66,
                    h,
                    side,
                    isLaser,
                    y: side === 1 ? FLOOR_Y - h : CEIL_Y
                });
                collectibles.push({
                    x: rightmostX + 30,
                    y: side === 1 ? CEIL_Y + 40 : FLOOR_Y - 40,
                    bob: 0
                });
            }
        }

        function syncHud(force) {
            hud.push({
                score: Math.floor(score),
                level,
                maxLevel: 99,
                lives,
                statusText: player.gravDir === 1 ? core.tr('Zemin Çekimi', 'Floor Gravity') : core.tr('Tavan Çekimi', 'Ceiling Gravity'),
                objectiveText: core.tr('[Space / Tıkla] Yerçekimini ters çevir · Yıldızları topla', '[Space / Click] Flip Gravity · Collect Stars')
            }, force);
        }

        function damage(msg) {
            if (player.invuln > 0 || ended) return;
            lives -= 1;
            player.invuln = 1.15;
            fx.burst(PX, player.y, '#fb7185', 18, 220);
            fx.popup(PX, player.y - 24, core.tr('DARBE!', 'CRASH!'), '#fb7185', 16);
            if (lives <= 0) {
                lives = 0;
                ended = true;
                core.playAudio('explodeBoss');
                syncHud(true);
                ctx.onGameOver?.({ score: Math.floor(score), level, stars: 0, reason: msg });
            } else {
                core.playAudio('playerHurt');
                syncHud(true);
            }
        }

        function resetGame() {
            obstacles.length = 0;
            gaps.length = 0;
            collectibles.length = 0;
            fx.clear();
            score = 0;
            level = 1;
            lives = 3;
            elapsed = 0;
            spawnCd = 1.3;
            scrollOffset = 0;
            ended = false;
            player.gravDir = 1;
            player.y = FLOOR_Y - PR;
            player.vy = 0;
            player.invuln = 0.8;
            syncHud(true);
        }

        function step(dt) {
            if (ended) return;
            elapsed += dt;
            hud.tick(dt);
            if (player.invuln > 0) player.invuln -= dt;

            if (input.consumePress('Space', ' ', 'KeyW', 'ArrowUp', 'ArrowDown', 'w') || input.consumePointerTap()) {
                flipGravity();
            }

            const runSpeed = 330 + Math.min(250, level * 26);
            scrollOffset = (scrollOffset + runSpeed * dt) % 60;
            core.stepStarfield(stars, dt, -runSpeed * 0.015, 0);
            score += dt * 22;
            level = 1 + Math.floor(score / 450);

            // Vertical gravity integration
            player.vy = clamp(player.vy + player.gravDir * 2450 * dt, -920, 920);
            player.y += player.vy * dt;

            // Check if over void gap on current side
            let overFloorGap = false;
            let overCeilGap = false;
            for (let i = gaps.length - 1; i >= 0; i--) {
                const gp = gaps[i];
                gp.x -= runSpeed * dt;
                if (PX > gp.x + 8 && PX < gp.x + gp.w - 8) {
                    if (gp.side === 1) overFloorGap = true;
                    else overCeilGap = true;
                }
                if (gp.x + gp.w < -40) gaps.splice(i, 1);
            }

            if (player.gravDir === 1 && !overFloorGap && player.y >= FLOOR_Y - PR) {
                player.y = FLOOR_Y - PR;
                player.vy = 0;
            } else if (player.gravDir === -1 && !overCeilGap && player.y <= CEIL_Y + PR) {
                player.y = CEIL_Y + PR;
                player.vy = 0;
            }

            if (player.y > H + 30 || player.y < -30) {
                player.gravDir *= -1;
                player.y = player.gravDir === 1 ? FLOOR_Y - PR : CEIL_Y + PR;
                player.vy = 0;
                damage(core.tr('Koridor boşluğundan uzaya düştün.', 'Fell into a corridor void gap.'));
                if (ended) return;
            }

            spawnCd -= dt;
            if (spawnCd <= 0) {
                spawnPattern(runSpeed);
                spawnCd = elapsed < 3.5 ? 1.45 : Math.max(0.84, 1.30 - level * 0.045);
            }

            for (let i = obstacles.length - 1; i >= 0; i--) {
                const ob = obstacles[i];
                ob.x -= runSpeed * dt;
                if (PX + 12 > ob.x && PX - 12 < ob.x + ob.w && player.y + 12 > ob.y && player.y - 12 < ob.y + ob.h) {
                    damage(core.tr('Lazer duvarına çarptın.', 'Collided with corridor hazard.'));
                    if (ended) return;
                }
                if (ob.x + ob.w < -40) obstacles.splice(i, 1);
            }

            for (let i = collectibles.length - 1; i >= 0; i--) {
                const c = collectibles[i];
                c.x -= runSpeed * dt;
                c.bob += dt * 5;
                if (dist2(PX, player.y, c.x, c.y) < 28 * 28) {
                    score += 60;
                    core.playAudio('xpPickup', 0.14);
                    fx.burst(c.x, c.y, '#fbbf24', 10, 150);
                    fx.popup(c.x, c.y - 16, '+60', '#fbbf24', 15);
                    collectibles.splice(i, 1);
                    continue;
                }
                if (c.x < -40) collectibles.splice(i, 1);
            }

            fx.update(dt);
            input.endFrame();
            syncHud(false);
        }

        function render() {
            core.renderBackdrop(g, stars, '#050814', '#0f172a', 'rgba(56,189,248,0.12)');

            // Ceiling and Floor rails with gaps
            const drawRail = (yPos, side) => {
                g.fillStyle = '#0f172a';
                g.fillRect(0, side === -1 ? 0 : yPos, W, side === -1 ? yPos : H - yPos);
                g.strokeStyle = '#38bdf8';
                g.lineWidth = 3;
                g.beginPath(); g.moveTo(0, yPos); g.lineTo(W, yPos); g.stroke();
                for (let x = -scrollOffset; x < W; x += 60) {
                    g.strokeStyle = 'rgba(56,189,248,0.16)';
                    g.lineWidth = 1;
                    g.beginPath();
                    g.moveTo(x, side === -1 ? 0 : yPos);
                    g.lineTo(x, side === -1 ? yPos : H);
                    g.stroke();
                }
                for (let i = 0; i < gaps.length; i++) {
                    const gp = gaps[i];
                    if (gp.side !== side) continue;
                    g.fillStyle = '#02040a';
                    g.fillRect(gp.x, side === -1 ? 0 : yPos - 2, gp.w, side === -1 ? yPos + 2 : H - yPos + 2);
                    g.strokeStyle = '#fb7185';
                    g.lineWidth = 2;
                    g.strokeRect(gp.x, side === -1 ? 2 : yPos, gp.w, side === -1 ? yPos - 2 : H - yPos - 2);
                }
            };
            drawRail(CEIL_Y, -1);
            drawRail(FLOOR_Y, 1);

            for (let i = 0; i < obstacles.length; i++) {
                const ob = obstacles[i];
                if (ob.isLaser) {
                    g.fillStyle = 'rgba(251,113,133,0.4)';
                    g.fillRect(ob.x - 4, ob.y, ob.w + 8, ob.h);
                    g.fillStyle = '#fb7185';
                    g.fillRect(ob.x + 5, ob.y, ob.w - 10, ob.h);
                } else {
                    core.drawSprite(g, 'cargo_crate', ob.x + ob.w * 0.5, ob.y + ob.h * 0.5, ob.w, ob.h, 0, 1);
                }
            }

            for (let i = 0; i < collectibles.length; i++) {
                const c = collectibles[i];
                core.drawSprite(g, 'coin_star', c.x, c.y + Math.sin(c.bob) * 4, 28, 28, c.bob * 0.4, 1);
            }

            const vis = player.invuln <= 0 || Math.floor(player.invuln * 18) % 2 === 0;
            if (vis) {
                g.save();
                g.translate(PX, player.y);
                g.scale(1, player.gravDir);
                core.drawSprite(g, 'astronaut', 0, 0, 38, 38, 0, 1);
                g.restore();
            }

            fx.render(g);
            core.drawHintBanner(g, core.tr('[Space / W / Tıkla] Yerçekimini Ters Çevir!', '[Space / W / Click] Flip Gravity!'), elapsed);
        }

        resetGame();
        const loopHandle = core.createLoop(step, render);

        return {
            restart() { resetGame(); },
            destroy() {
                loopHandle.stop();
                input.destroy();
                if (canvas.parentNode) canvas.remove();
            }
        };
    };

    // =========================================================================
    // 6. orbital-dash-ring
    // =========================================================================
    global.COSMIC_GAME_ENGINES['orbital-dash-ring'] = function mountOrbitalDash(ctx) {
        const core = createCore(ctx);
        const canvas = core.makeCanvas();
        const g = canvas.getContext('2d');
        const hud = core.createHudSync();
        const fx = core.createFX();
        const stars = core.createStarfield(110);
        const input = core.createInput(canvas);

        const CX = W * 0.5;
        const CY = H * 0.5;
        const R_INNER = 112;
        const R_OUTER = 194;

        const player = { ang: -Math.PI * 0.5, track: 1, r: R_OUTER, invuln: 0 };
        const cores = [];
        const spikes = [];

        let score = 0;
        let streak = 1;
        let level = 1;
        let lives = 3;
        let grabCount = 0;
        let elapsed = 0;
        let spikeCd = 2.5;
        let ended = false;

        function spawnCore() {
            const track = Math.random() < 0.5 ? 0 : 1;
            const ang = player.ang + (0.9 + Math.random() * 4.2);
            cores.push({ track, ang: ang % TAU, pulse: Math.random() * TAU });
        }

        function spawnSpike() {
            const track = Math.random() < 0.5 ? 0 : 1;
            let ang = (player.ang + Math.PI + (Math.random() - 0.5) * 1.1 + TAU) % TAU;
            // Ensure we never spawn opposite-track simultaneous pinch spikes or right on the player
            for (let attempt = 0; attempt < 8; attempt++) {
                let conflict = Math.abs(angleDiff(ang, player.ang)) < 1.1;
                for (let i = 0; i < spikes.length && !conflict; i++) {
                    if (spikes[i].track !== track && Math.abs(angleDiff(ang, spikes[i].ang)) < 0.65) {
                        conflict = true;
                    }
                }
                if (!conflict) break;
                ang = (ang + 0.72) % TAU;
            }
            spikes.push({
                track,
                ang,
                omega: -(1.1 + level * 0.16) * (Math.random() < 0.25 ? -1 : 1),
                life: 7.0,
                grazed: false
            });
        }

        function snapTrack() {
            if (ended) return;
            player.track = player.track === 0 ? 1 : 0;
            core.playAudio('dash', 0.16);
            const r = player.track === 0 ? R_INNER : R_OUTER;
            fx.burst(CX + Math.cos(player.ang) * r, CY + Math.sin(player.ang) * r, '#38bdf8', 10, 140);
        }

        function syncHud(force) {
            hud.push({
                score: Math.floor(score),
                level,
                maxLevel: 99,
                lives,
                statusText: player.track === 0 ? core.tr('İç Halka', 'Inner Ring') : core.tr('Dış Halka', 'Outer Ring'),
                objectiveText: core.tr(`Seri x${streak} · [Space/Tıkla] Halka Değiştir · A/D İtme`, `Streak x${streak} · [Space/Click] Snap Ring · A/D Nudge`)
            }, force);
        }

        function resetGame() {
            cores.length = 0;
            spikes.length = 0;
            fx.clear();
            score = 0;
            streak = 1;
            level = 1;
            lives = 3;
            grabCount = 0;
            elapsed = 0;
            spikeCd = 2.6;
            ended = false;
            player.ang = -Math.PI * 0.5;
            player.track = 1;
            player.r = R_OUTER;
            player.invuln = 1.0;
            for (let i = 0; i < 3; i++) spawnCore();
            syncHud(true);
        }

        function step(dt) {
            if (ended) return;
            elapsed += dt;
            hud.tick(dt);
            core.stepStarfield(stars, dt, 0.2, 0.2);
            if (player.invuln > 0) player.invuln -= dt;

            if (input.consumePress('Space', ' ', 'KeyW', 'KeyS', 'ArrowUp', 'ArrowDown', 'w', 's') || input.consumePointerTap()) {
                snapTrack();
            }

            let nudge = 0;
            if (input.has('KeyA', 'ArrowLeft', 'a')) nudge -= 1.05;
            if (input.has('KeyD', 'ArrowRight', 'd')) nudge += 1.05;

            const baseOmega = 1.75 + Math.min(1.3, level * 0.14);
            player.ang = (player.ang + (baseOmega + nudge) * dt + TAU) % TAU;
            const targetR = player.track === 0 ? R_INNER : R_OUTER;
            player.r = lerp(player.r, targetR, clamp(dt * 24, 0, 1));

            const px = CX + Math.cos(player.ang) * player.r;
            const py = CY + Math.sin(player.ang) * player.r;

            // Collect energy cores
            for (let i = cores.length - 1; i >= 0; i--) {
                const c = cores[i];
                c.pulse += dt * 5;
                const cr = c.track === 0 ? R_INNER : R_OUTER;
                const cx = CX + Math.cos(c.ang) * cr;
                const cy = CY + Math.sin(c.ang) * cr;
                if (dist2(px, py, cx, cy) < 28 * 28) {
                    cores.splice(i, 1);
                    grabCount += 1;
                    const pts = 100 * streak;
                    score += pts;
                    streak = Math.min(6, streak + 1);
                    level = 1 + Math.floor(grabCount / 5);
                    core.playAudio('xpPickup', 0.14);
                    fx.burst(cx, cy, '#38bdf8', 12, 160);
                    fx.popup(cx, cy - 16, `+${pts}`, '#38bdf8', 16);
                    spawnCore();
                }
            }

            spikeCd -= dt;
            if (spikeCd <= 0 && spikes.length < 3 + Math.min(5, level)) {
                spawnSpike();
                spikeCd = elapsed < 4 ? 2.2 : Math.max(0.95, 2.0 - level * 0.12);
            }

            for (let i = spikes.length - 1; i >= 0; i--) {
                const sp = spikes[i];
                sp.life -= dt;
                sp.ang = (sp.ang + sp.omega * dt + TAU) % TAU;
                if (sp.life <= 0) {
                    spikes.splice(i, 1);
                    continue;
                }
                const sr = sp.track === 0 ? R_INNER : R_OUTER;
                const sx = CX + Math.cos(sp.ang) * sr;
                const sy = CY + Math.sin(sp.ang) * sr;
                const d2 = dist2(px, py, sx, sy);
                // 0.7s fade-in telegraph grace (sp.life > 6.3) so fresh spawns never cheap-shot player
                if (sp.life <= 6.3 && d2 < 20 * 20) {
                    if (player.invuln <= 0) {
                        lives -= 1;
                        streak = 1;
                        player.invuln = 1.25;
                        fx.burst(px, py, '#fb7185', 18, 220);
                        fx.popup(px, py - 24, core.tr('ÇARPMA!', 'SPIKE HIT!'), '#fb7185', 16);
                        spikes.splice(i, 1);
                        if (lives <= 0) {
                            lives = 0;
                            ended = true;
                            core.playAudio('explodeBoss');
                            syncHud(true);
                            ctx.onGameOver?.({
                                score: Math.floor(score),
                                level,
                                stars: 0,
                                reason: core.tr('Yörünge halkasında kırmızı mayınlara çarptın.', 'Struck orbital spike sweep.')
                            });
                            return;
                        }
                        core.playAudio('playerHurt');
                        syncHud(true);
                    }
                } else if (!sp.grazed && sp.track !== player.track && Math.abs(angleDiff(sp.ang, player.ang)) < 0.15) {
                    sp.grazed = true;
                    score += 40;
                    fx.popup(px, py - 20, core.tr('KAÇIŞ +40', 'DODGE +40'), '#a78bfa', 13);
                }
            }

            fx.update(dt);
            input.endFrame();
            syncHud(false);
        }

        function render() {
            core.renderBackdrop(g, stars, '#050814', '#0e172a', 'rgba(56,189,248,0.14)');

            // Orbit rings
            for (const r of [R_INNER, R_OUTER]) {
                g.strokeStyle = 'rgba(56,189,248,0.32)';
                g.lineWidth = 3;
                g.beginPath(); g.arc(CX, CY, r, 0, TAU); g.stroke();
            }

            // Central reactor core
            core.drawSprite(g, 'portal_vortex', CX, CY, 110, 110, elapsed * 1.1, 0.85);
            core.drawSprite(g, 'boss_core', CX, CY, 54, 54, -elapsed * 0.8, 1);

            for (let i = 0; i < cores.length; i++) {
                const c = cores[i];
                const cr = c.track === 0 ? R_INNER : R_OUTER;
                const cx = CX + Math.cos(c.ang) * cr;
                const cy = CY + Math.sin(c.ang) * cr;
                const s = 28 * (1 + Math.sin(c.pulse) * 0.12);
                core.drawSprite(g, 'cryo_crystal', cx, cy, s, s, c.ang, 1);
            }

            for (let i = 0; i < spikes.length; i++) {
                const sp = spikes[i];
                const sr = sp.track === 0 ? R_INNER : R_OUTER;
                const sx = CX + Math.cos(sp.ang) * sr;
                const sy = CY + Math.sin(sp.ang) * sr;
                const spawning = sp.life > 6.3;
                const alpha = spawning ? 0.45 : 1;
                if (spawning) {
                    const p = clamp((7.0 - sp.life) / 0.7, 0, 1);
                    g.save();
                    g.strokeStyle = 'rgba(251, 113, 133, 0.75)';
                    g.lineWidth = 2;
                    g.beginPath();
                    g.arc(sx, sy, 28 - p * 12, 0, TAU);
                    g.stroke();
                    g.restore();
                }
                core.drawSprite(g, 'plasma_bomb', sx, sy, 30, 30, elapsed * 4, alpha, (c) => {
                    c.fillStyle = '#fb7185';
                    c.beginPath(); c.arc(0, 0, 12, 0, TAU); c.fill();
                });
            }

            const px = CX + Math.cos(player.ang) * player.r;
            const py = CY + Math.sin(player.ang) * player.r;
            const vis = player.invuln <= 0 || Math.floor(player.invuln * 18) % 2 === 0;
            if (vis) {
                core.drawSprite(g, 'fighter', px, py, 36, 36, player.ang + Math.PI, 1);
            }

            fx.render(g);
            core.drawHintBanner(g, core.tr('[Space / Tıkla] Halka Değiştir · A/D Yörünge Hızı', '[Space / Click] Snap Track · A/D Orbit Speed'), elapsed);
        }

        resetGame();
        const loopHandle = core.createLoop(step, render);

        return {
            restart() { resetGame(); },
            destroy() {
                loopHandle.stop();
                input.destroy();
                if (canvas.parentNode) canvas.remove();
            }
        };
    };

    // =========================================================================
    // 7. warp-lane-dodger
    // =========================================================================
    global.COSMIC_GAME_ENGINES['warp-lane-dodger'] = function mountWarpLane(ctx) {
        const core = createCore(ctx);
        const canvas = core.makeCanvas();
        const g = canvas.getContext('2d');
        const hud = core.createHudSync();
        const fx = core.createFX();
        const stars = core.createStarfield(110);
        const input = core.createInput(canvas);

        const LANES = [270, 410, 550, 690];
        const LANE_W = 140;
        const PLAYER_Y = 445;

        const player = { lane: 1, x: LANES[1], invuln: 0, nitro: 0, fuel: 100 };
        const traffic = [];
        const pickups = [];

        let score = 0;
        let level = 1;
        let lives = 3;
        let elapsed = 0;
        let roadScroll = 0;
        let spawnCd = 1.1;
        let fuelCd = 2.8;
        let lastOpenLane = 1;
        let ended = false;

        function setLane(idx) {
            player.lane = clamp(idx, 0, 3);
        }

        function spawnRow() {
            const openLane = Math.floor(Math.random() * 4);
            lastOpenLane = openLane;
            const maxHazards = elapsed < 3.5 ? 1 : Math.min(3, 1 + Math.floor(Math.random() * (1 + Math.min(2, level * 0.4))));
            // Keep row speed uniform (small variance) so consecutive rows never overtake into a 4-lane wall
            const rowSpeedBias = Math.random() < 0.45 ? -14 : 16;
            let placed = 0;
            for (let l = 0; l < 4; l++) {
                if (l === openLane || placed >= maxHazards) continue;
                if (Math.random() < 0.65 || placed === 0) {
                    placed++;
                    const isFreighter = Math.random() < 0.55;
                    traffic.push({
                        lane: l,
                        x: LANES[l],
                        y: -60 - Math.random() * 24,
                        w: isFreighter ? 66 : 54,
                        h: isFreighter ? 76 : 56,
                        speedOffset: rowSpeedBias + (isFreighter ? -6 : 8),
                        sprite: isFreighter ? (Math.random() < 0.5 ? 'cargo_crate' : 'moon_lander') : (Math.random() < 0.5 ? 'ufo' : 'alien_drone')
                    });
                }
            }
        }

        function spawnPickup() {
            // Prefer open lane and avoid overlapping top traffic hazards
            const safeLanes = [0, 1, 2, 3].filter((l) => !traffic.some((t) => t.lane === l && t.y < 140));
            const l = safeLanes.length ? safeLanes[Math.floor(Math.random() * safeLanes.length)] : lastOpenLane;
            const isNitro = Math.random() < 0.4;
            pickups.push({
                lane: l,
                x: LANES[l],
                y: -40,
                kind: isNitro ? 'nitro' : 'fuel',
                bob: Math.random() * TAU
            });
        }

        function syncHud(force) {
            const st = player.nitro > 0
                ? core.tr(`NİTRO AKTİF! · Yakıt: %${Math.ceil(player.fuel)}`, `NITRO ACTIVE! · Fuel: ${Math.ceil(player.fuel)}%`)
                : core.tr(`Yakıt: %${Math.ceil(player.fuel)} · [W/Yukarı] Nitro`, `Fuel: ${Math.ceil(player.fuel)}% · [W/Up] Nitro`);
            hud.push({
                score: Math.floor(score),
                level,
                maxLevel: 99,
                lives,
                statusText: st,
                objectiveText: core.tr('4 Şeritli Otoyolda Kaç · Yakıt & Nitro Hücresi Topla', 'Dodge Convoy Traffic · Grab Fuel & Nitro Cells')
            }, force);
        }

        function failGame(msg) {
            if (ended) return;
            ended = true;
            core.playAudio('explodeBoss');
            syncHud(true);
            ctx.onGameOver?.({ score: Math.floor(score), level, stars: 0, reason: msg });
        }

        function resetGame() {
            traffic.length = 0;
            pickups.length = 0;
            fx.clear();
            score = 0;
            level = 1;
            lives = 3;
            elapsed = 0;
            roadScroll = 0;
            spawnCd = 1.0;
            fuelCd = 2.4;
            ended = false;
            player.lane = 1;
            player.x = LANES[1];
            player.invuln = 1.0;
            player.nitro = 0;
            player.fuel = 100;
            syncHud(true);
        }

        function step(dt) {
            if (ended) return;
            elapsed += dt;
            hud.tick(dt);
            if (player.invuln > 0) player.invuln -= dt;
            if (player.nitro > 0) player.nitro = Math.max(0, player.nitro - dt);

            if (input.consumePress('KeyA', 'ArrowLeft', 'a')) setLane(player.lane - 1);
            else if (input.consumePress('KeyD', 'ArrowRight', 'd')) setLane(player.lane + 1);
            else if (input.consumePress('Digit1', '1')) setLane(0);
            else if (input.consumePress('Digit2', '2')) setLane(1);
            else if (input.consumePress('Digit3', '3')) setLane(2);
            else if (input.consumePress('Digit4', '4')) setLane(3);
            else if (input.consumePointerTap()) {
                const pLane = clamp(Math.floor((input.pointer.x - (LANES[0] - LANE_W * 0.5)) / LANE_W), 0, 3);
                setLane(pLane);
            }

            if (input.consumePress('KeyW', 'ArrowUp', 'w', 'Space', ' ') && player.nitro <= 0 && player.fuel >= 20) {
                player.fuel = Math.max(0, player.fuel - 16);
                player.nitro = 1.45;
                core.playAudio('dash');
                fx.burst(player.x, PLAYER_Y + 12, '#38bdf8', 14, 180);
                fx.popup(player.x, PLAYER_Y - 26, core.tr('TURBO NİTRO!', 'NITRO BOOST!'), '#38bdf8', 15);
            }

            player.x = lerp(player.x, LANES[player.lane], clamp(dt * 18, 0, 1));

            const roadSpeed = (290 + Math.min(260, level * 28)) * (player.nitro > 0 ? 1.48 : 1);
            roadScroll = (roadScroll + roadSpeed * dt) % 64;
            core.stepStarfield(stars, dt, 0, roadSpeed * 0.02);

            score += dt * (player.nitro > 0 ? 55 : 28);
            level = 1 + Math.floor(score / 520);

            player.fuel = Math.max(0, player.fuel - dt * 3.8);
            if (player.fuel <= 0) {
                failGame(core.tr('Hiper-otoyolda yakıt tükendi.', 'Ran out of warp fuel on the highway.'));
                return;
            }

            spawnCd -= dt;
            if (spawnCd <= 0) {
                spawnRow();
                spawnCd = elapsed < 3.5 ? 1.35 : Math.max(0.58, 1.18 - level * 0.055);
            }

            fuelCd -= dt;
            if (fuelCd <= 0) {
                spawnPickup();
                fuelCd = 2.8 + Math.random() * 1.4;
            }

            for (let i = traffic.length - 1; i >= 0; i--) {
                const trf = traffic[i];
                trf.y += (roadSpeed + trf.speedOffset) * dt;
                if (Math.abs(trf.x - player.x) < (trf.w * 0.42 + 16) && Math.abs(trf.y - PLAYER_Y) < (trf.h * 0.4 + 20)) {
                    if (player.nitro > 0) {
                        score += 120;
                        fx.burst(trf.x, trf.y, '#fbbf24', 14, 200);
                        fx.popup(trf.x, trf.y, core.tr('NİTRO EZİŞ +120', 'SMASH +120'), '#fbbf24', 15);
                        core.playAudio('explodeSmall');
                        traffic.splice(i, 1);
                        continue;
                    } else if (player.invuln <= 0) {
                        lives -= 1;
                        player.invuln = 1.2;
                        fx.burst(player.x, PLAYER_Y, '#fb7185', 18, 220);
                        fx.popup(player.x, PLAYER_Y - 24, core.tr('KAZA!', 'CRASH!'), '#fb7185', 16);
                        traffic.splice(i, 1);
                        if (lives <= 0) {
                            lives = 0;
                            failGame(core.tr('Konvoy gemisiyle çarpıştın.', 'Collided with derelict highway freighter.'));
                            return;
                        }
                        core.playAudio('playerHurt');
                        syncHud(true);
                        continue;
                    }
                }
                if (trf.y > H + 80) traffic.splice(i, 1);
            }

            for (let i = pickups.length - 1; i >= 0; i--) {
                const pk = pickups[i];
                pk.y += roadSpeed * 0.85 * dt;
                pk.bob += dt * 4;
                if (Math.abs(pk.x - player.x) < 34 && Math.abs(pk.y - PLAYER_Y) < 34) {
                    if (pk.kind === 'nitro') {
                        player.nitro = 3.2;
                        player.fuel = Math.min(100, player.fuel + 18);
                        score += 150;
                        core.playAudio('powerup');
                        fx.popup(pk.x, pk.y - 16, core.tr('NİTRO +150!', 'NITRO +150!'), '#38bdf8', 16);
                    } else {
                        player.fuel = Math.min(100, player.fuel + 30);
                        score += 100;
                        core.playAudio('xpPickup');
                        fx.popup(pk.x, pk.y - 16, core.tr('YAKIT +30%', 'FUEL +30%'), '#34d399', 15);
                    }
                    fx.burst(pk.x, pk.y, '#34d399', 12, 160);
                    pickups.splice(i, 1);
                    continue;
                }
                if (pk.y > H + 50) pickups.splice(i, 1);
            }

            fx.update(dt);
            input.endFrame();
            syncHud(false);
        }

        function render() {
            core.renderBackdrop(g, stars, '#040712', '#0b1124', 'rgba(56,189,248,0.1)');

            // Highway surface & 4 lanes
            const roadLeft = LANES[0] - LANE_W * 0.5;
            const roadW = LANE_W * 4;
            g.fillStyle = 'rgba(15, 23, 42, 0.85)';
            g.fillRect(roadLeft, 0, roadW, H);
            g.strokeStyle = '#38bdf8';
            g.lineWidth = 3;
            g.beginPath();
            g.moveTo(roadLeft, 0); g.lineTo(roadLeft, H);
            g.moveTo(roadLeft + roadW, 0); g.lineTo(roadLeft + roadW, H);
            g.stroke();

            for (let l = 1; l < 4; l++) {
                const lx = roadLeft + l * LANE_W;
                g.strokeStyle = 'rgba(148, 163, 184, 0.3)';
                g.lineWidth = 2;
                for (let y = roadScroll - 64; y < H; y += 64) {
                    g.beginPath(); g.moveTo(lx, y); g.lineTo(lx, y + 32); g.stroke();
                }
            }

            // Fuel gauge bar on left side
            g.fillStyle = 'rgba(15,23,42,0.85)';
            g.fillRect(28, 120, 18, 280);
            const fh = 274 * (player.fuel / 100);
            g.fillStyle = player.fuel > 30 ? '#34d399' : '#fb7185';
            g.fillRect(31, 123 + (274 - fh), 12, fh);
            g.font = '700 11px "Space Grotesk", sans-serif';
            g.fillStyle = '#e2e8f0';
            g.textAlign = 'center';
            g.fillText('FUEL', 37, 110);

            for (let i = 0; i < pickups.length; i++) {
                const pk = pickups[i];
                core.drawSprite(g, pk.kind === 'nitro' ? 'energy_prism' : 'shield_battery', pk.x, pk.y, 34, 34, Math.sin(pk.bob) * 0.2, 1);
            }

            for (let i = 0; i < traffic.length; i++) {
                const t = traffic[i];
                core.drawSprite(g, t.sprite, t.x, t.y, t.w, t.h, 0, 1);
            }

            const vis = player.invuln <= 0 || Math.floor(player.invuln * 18) % 2 === 0;
            if (vis) {
                core.drawSprite(g, 'fighter', player.x, PLAYER_Y, 48, 48, 0, 1);
                if (player.nitro > 0) {
                    g.strokeStyle = '#fbbf24';
                    g.lineWidth = 3;
                    g.beginPath(); g.arc(player.x, PLAYER_Y, 30, 0, TAU); g.stroke();
                }
            }

            fx.render(g);
            core.drawHintBanner(g, core.tr('A/D, Oklar, 1-4 veya Şeride Tıkla', 'A/D, Arrows, 1-4, or Click Lane'), elapsed);
        }

        resetGame();
        const loopHandle = core.createLoop(step, render);

        return {
            restart() { resetGame(); },
            destroy() {
                loopHandle.stop();
                input.destroy();
                if (canvas.parentNode) canvas.remove();
            }
        };
    };

    // =========================================================================
    // 8. photon-parry-duel (Timed 3-lane parry duel vs Alien Sentinel)
    // =========================================================================
    global.COSMIC_GAME_ENGINES['photon-parry-duel'] = function mountPhotonParry(ctx) {
        const core = createCore(ctx);
        const canvas = core.makeCanvas();
        const g = canvas.getContext('2d');
        const hud = core.createHudSync();
        const fx = core.createFX();
        const stars = core.createStarfield(110);
        const input = core.createInput(canvas);

        const LANES_Y = [150, 270, 390];
        const PLAYER_X = 165;
        const RING_X = 248;
        const SENTINEL_X = 780;

        const SENTINELS = [
            { name: 'SENTINEL MK.I', hp: 100, speed: 340, cadence: 1.25 },
            { name: 'SENTINEL MK.II', hp: 150, speed: 410, cadence: 0.95 },
            { name: 'APEX SENTINEL', hp: 210, speed: 470, cadence: 0.78 }
        ];

        const player = { lane: 1, parryFlash: 0, parryCd: 0 };
        const sentinel = { round: 0, hp: 100, maxHp: 100, lane: 1, fireCd: 1.3, bob: 0 };
        const shots = [];
        const beams = [];

        let score = 0;
        let lives = 4;
        let streak = 0;
        let elapsed = 0;
        let ended = false;

        function startRound(r) {
            const def = SENTINELS[r];
            sentinel.round = r;
            sentinel.hp = def.hp;
            sentinel.maxHp = def.hp;
            sentinel.fireCd = 1.3;
            shots.length = 0;
            beams.length = 0;
            core.playAudio('bossAlarm');
            fx.popup(W * 0.5, 90, def.name, '#38bdf8', 20);
        }

        function triggerParry(laneOverride) {
            if (ended) return;
            if (laneOverride !== undefined) player.lane = laneOverride;
            if (player.parryCd > 0) return;
            player.parryFlash = 0.22;
            player.parryCd = 0.18;

            // Check incoming shot inside timing ring on active lane
            let parried = false;
            for (let i = shots.length - 1; i >= 0; i--) {
                const s = shots[i];
                if (s.lane !== player.lane) continue;
                const d = Math.abs(s.x - RING_X);
                if (d <= 44) {
                    parried = true;
                    // Reward chain parries with instant cooldown reset
                    player.parryCd = 0;
                    const perfect = d <= 20;
                    shots.splice(i, 1);
                    const dmg = perfect ? 26 : 13;
                    const pts = perfect ? 200 : 100;
                    streak += 1;
                    score += pts;
                    sentinel.hp -= dmg;
                    beams.push({
                        x1: RING_X,
                        y1: LANES_Y[player.lane],
                        x2: SENTINEL_X,
                        y2: LANES_Y[sentinel.lane],
                        gold: perfect,
                        life: 0.28
                    });
                    fx.burst(RING_X, LANES_Y[player.lane], perfect ? '#fbbf24' : '#38bdf8', 16, 220);
                    fx.popup(RING_X + 35, LANES_Y[player.lane] - 24, perfect ? core.tr(`MÜKEMMEL +${pts}!`, `PERFECT +${pts}!`) : `PARRY +${pts}`, perfect ? '#fbbf24' : '#38bdf8', perfect ? 18 : 15);
                    core.playAudio(perfect ? 'powerup' : 'hitShield');
                    break;
                }
            }
            if (!parried) {
                core.playAudio('uiClick', 0.15);
            }
        }

        function syncHud(force) {
            const def = SENTINELS[sentinel.round];
            hud.push({
                score: Math.floor(score),
                level: sentinel.round + 1,
                maxLevel: SENTINELS.length,
                lives,
                statusText: core.tr(`${def.name} HP: ${Math.max(0, sentinel.hp)}/${sentinel.maxHp}`, `${def.name} HP: ${Math.max(0, sentinel.hp)}/${sentinel.maxHp}`),
                objectiveText: core.tr('W/A/D (1/2/3) Şerit Seç + [Space] Parry Yansıt!', 'W/A/D (1/2/3) Arc + [Space] Parry Flash!')
            }, force);
        }

        function resetGame() {
            fx.clear();
            score = 0;
            lives = 4;
            streak = 0;
            elapsed = 0;
            ended = false;
            player.lane = 1;
            player.parryFlash = 0;
            player.parryCd = 0;
            startRound(0);
            syncHud(true);
        }

        function step(dt) {
            if (ended) return;
            elapsed += dt;
            hud.tick(dt);
            core.stepStarfield(stars, dt, -0.5, 0);
            if (player.parryFlash > 0) player.parryFlash -= dt;
            if (player.parryCd > 0) player.parryCd -= dt;

            if (input.consumePress('KeyW', 'ArrowUp', 'Digit1', '1', 'w')) player.lane = 0;
            else if (input.consumePress('KeyA', 'KeyS', 'Digit2', '2', 'a', 's')) player.lane = 1;
            else if (input.consumePress('KeyD', 'ArrowDown', 'Digit3', '3', 'd')) player.lane = 2;

            if (input.consumePress('Space', ' ')) {
                triggerParry();
            } else if (input.consumePointerTap()) {
                const py = input.pointer.y;
                const lane = py < 210 ? 0 : (py < 330 ? 1 : 2);
                triggerParry(lane);
            }

            const def = SENTINELS[sentinel.round];
            sentinel.bob += dt * 3;
            sentinel.fireCd -= dt;
            if (sentinel.fireCd <= 0) {
                sentinel.lane = Math.floor(Math.random() * 3);
                shots.push({
                    lane: sentinel.lane,
                    x: SENTINEL_X - 30,
                    y: LANES_Y[sentinel.lane],
                    speed: def.speed
                });
                sentinel.fireCd = def.cadence * (0.85 + Math.random() * 0.35);
                core.playAudio('shootLaser', 0.14);
            }

            for (let i = shots.length - 1; i >= 0; i--) {
                const s = shots[i];
                s.x -= s.speed * dt;
                if (s.x <= PLAYER_X + 18) {
                    shots.splice(i, 1);
                    if (s.lane === player.lane) {
                        // Passive lane alignment safely blocks shot
                        fx.burst(PLAYER_X + 20, LANES_Y[player.lane], '#94a3b8', 6, 110);
                        fx.popup(PLAYER_X + 28, LANES_Y[player.lane] - 18, core.tr('BLOK', 'BLOCK'), '#94a3b8', 13);
                        core.playAudio('hitMetal');
                    } else {
                        lives -= 1;
                        streak = 0;
                        fx.burst(PLAYER_X, LANES_Y[s.lane], '#fb7185', 16, 200);
                        fx.popup(PLAYER_X + 28, LANES_Y[s.lane] - 18, core.tr('İSABET!', 'HIT!'), '#fb7185', 16);
                        if (lives <= 0) {
                            lives = 0;
                            ended = true;
                            core.playAudio('explodeBoss');
                            syncHud(true);
                            ctx.onGameOver?.({
                                score: Math.floor(score),
                                level: sentinel.round + 1,
                                stars: 0,
                                reason: core.tr('Sentinel lazer düellosunda kalkan tükendi.', 'Shields depleted in Sentinel laser duel.')
                            });
                            return;
                        }
                        core.playAudio('playerHurt');
                        syncHud(true);
                    }
                }
            }

            for (let i = beams.length - 1; i >= 0; i--) {
                beams[i].life -= dt;
                if (beams[i].life <= 0) beams.splice(i, 1);
            }

            if (sentinel.hp <= 0) {
                score += 400 + sentinel.round * 200;
                fx.burst(SENTINEL_X, LANES_Y[sentinel.lane], '#fbbf24', 32, 280);
                core.playAudio('explodeBoss');
                if (isStory && sentinel.round + 1 >= SENTINELS.length) {
                    ended = true;
                    syncHud(true);
                    ctx.onWin?.({ score: Math.floor(score), level: SENTINELS.length, stars: lives >= 4 ? 3 : (lives >= 2 ? 2 : 1) });
                    return;
                }
                startRound((sentinel.round + 1) % SENTINELS.length);
            }

            fx.update(dt);
            input.endFrame();
            syncHud(false);
        }

        function render() {
            core.renderBackdrop(g, stars, '#050814', '#12102c', 'rgba(167,139,250,0.14)');

            // 3 Trajectory lanes + Dual-Zone Parry/Perfect Timing Ring
            for (let l = 0; l < 3; l++) {
                const y = LANES_Y[l];
                const active = l === player.lane;
                const liveShot = shots.find((s) => s.lane === l && Math.abs(s.x - RING_X) <= 44);
                const shotPerf = liveShot && Math.abs(liveShot.x - RING_X) <= 20;

                g.strokeStyle = active ? 'rgba(56,189,248,0.45)' : 'rgba(148,163,184,0.15)';
                g.lineWidth = active ? 2.5 : 1.2;
                g.beginPath(); g.moveTo(PLAYER_X, y); g.lineTo(SENTINEL_X, y); g.stroke();

                // Outer PARRY ring (±44px window)
                g.save();
                g.strokeStyle = shotPerf ? '#fbbf24' : (liveShot ? '#22d3ee' : (active ? 'rgba(34,211,238,0.55)' : 'rgba(56,189,248,0.22)'));
                g.lineWidth = liveShot ? 3 : 1.5;
                g.setLineDash(liveShot ? [] : [5, 5]);
                g.beginPath(); g.arc(RING_X, y, 36, 0, TAU); g.stroke();
                g.setLineDash([]);

                // Inner PERFECT ring (±20px sweet-spot)
                g.strokeStyle = (active && player.parryFlash > 0) || shotPerf ? '#fbbf24' : (active ? '#22d3ee' : 'rgba(56,189,248,0.3)');
                g.lineWidth = (active && player.parryFlash > 0) || shotPerf ? 4.5 : 2;
                g.beginPath(); g.arc(RING_X, y, 18, 0, TAU); g.stroke();
                if (liveShot && active) {
                    g.fillStyle = shotPerf ? 'rgba(251,191,36,0.22)' : 'rgba(34,211,238,0.16)';
                    g.beginPath(); g.arc(RING_X, y, 36, 0, TAU); g.fill();
                }
                g.restore();
            }

            // Shield Arc on active trajectory
            const py = LANES_Y[player.lane];
            g.strokeStyle = player.parryFlash > 0 ? '#fbbf24' : '#38bdf8';
            g.lineWidth = 5;
            g.beginPath();
            g.arc(PLAYER_X + 20, py, 32, -0.75, 0.75);
            g.stroke();

            // Reflected golden super-beams
            for (let i = 0; i < beams.length; i++) {
                const b = beams[i];
                g.save();
                g.globalAlpha = clamp(b.life / 0.28, 0, 1);
                g.strokeStyle = b.gold ? '#fbbf24' : '#38bdf8';
                g.lineWidth = b.gold ? 14 : 8;
                g.beginPath(); g.moveTo(b.x1, b.y1); g.lineTo(b.x2, b.y2); g.stroke();
                g.strokeStyle = '#ffffff';
                g.lineWidth = 4;
                g.beginPath(); g.moveTo(b.x1, b.y1); g.lineTo(b.x2, b.y2); g.stroke();
                g.restore();
            }

            // Incoming shots
            for (let i = 0; i < shots.length; i++) {
                const s = shots[i];
                g.fillStyle = '#fb7185';
                g.fillRect(s.x - 16, s.y - 5, 32, 10);
                g.fillStyle = '#fff1f2';
                g.fillRect(s.x - 12, s.y - 2, 24, 4);
            }

            // Player & Sentinel
            core.drawSprite(g, 'fighter', PLAYER_X, py, 46, 46, Math.PI * 0.5, 1);
            const sy = LANES_Y[sentinel.lane] + Math.sin(sentinel.bob) * 8;
            core.drawSprite(g, 'ufo', SENTINEL_X, sy, 86, 86, 0, 1);

            // Sentinel HP bar
            const def = SENTINELS[sentinel.round];
            g.fillStyle = 'rgba(15,23,42,0.85)';
            g.fillRect(SENTINEL_X - 75, 42, 150, 12);
            g.fillStyle = '#fb7185';
            g.fillRect(SENTINEL_X - 73, 44, 146 * clamp(sentinel.hp / sentinel.maxHp, 0, 1), 8);
            g.font = '700 12px "Space Grotesk", sans-serif';
            g.fillStyle = '#e2e8f0';
            g.textAlign = 'center';
            g.fillText(def.name, SENTINEL_X, 34);

            fx.render(g);
            core.drawHintBanner(g, core.tr('W/A/D (1/2/3) Şerit + [Space] Parry (veya Yaylara Tıkla)', 'W/A/D (1/2/3) Lane + [Space] Parry (or Click Lane Arc)'), elapsed);
        }

        resetGame();
        const loopHandle = core.createLoop(step, render);

        return {
            restart() { resetGame(); },
            destroy() {
                loopHandle.stop();
                input.destroy();
                if (canvas.parentNode) canvas.remove();
            }
        };
    };

    // =========================================================================
    // 9. meteor-jetpack-rise
    // =========================================================================
    global.COSMIC_GAME_ENGINES['meteor-jetpack-rise'] = function mountMeteorRise(ctx) {
        const core = createCore(ctx);
        const canvas = core.makeCanvas();
        const g = canvas.getContext('2d');
        const hud = core.createHudSync();
        const fx = core.createFX();
        const stars = core.createStarfield(110);
        const input = core.createInput(canvas);

        const player = { x: W * 0.5, y: 400, vx: 0, vy: -520, invuln: 0 };
        const platforms = [];
        const drones = [];
        const starsPickups = [];

        let camY = 0;
        let maxHeight = 0;
        let lavaY = 560;
        let score = 0;
        let level = 1;
        let lives = 3;
        let highestGenY = 480;
        let lastPlatKind = 'solid';
        let lastPlatHadDrone = false;
        let elapsed = 0;
        let ended = false;

        function spawnPlatformAt(y, forceSafe) {
            const w = forceSafe ? 150 : Math.max(88, 128 - level * 3);
            const pad = w * 0.5 + 16;
            const x = pad + Math.random() * (W - pad * 2);
            const r = Math.random();
            let kind = 'solid';
            if (!forceSafe) {
                if (r < 0.22) kind = 'moving';
                else if (r < 0.34) kind = 'spring';
                else if (r < 0.46 && lastPlatKind !== 'fragile') kind = 'fragile';
            }
            lastPlatKind = kind;
            platforms.push({ x, y, w, h: 16, kind, dir: Math.random() < 0.5 ? -1 : 1, broken: false });

            if (!forceSafe && Math.random() < 0.28) {
                starsPickups.push({ x, y: y - 28, bob: Math.random() * TAU });
            }
            // Never place drones over springs or back-to-back rows
            if (!forceSafe && kind !== 'spring' && !lastPlatHadDrone && level >= 2 && Math.random() < 0.16) {
                lastPlatHadDrone = true;
                drones.push({ x: 95 + Math.random() * (W - 190), y: y - 52, dir: Math.random() < 0.5 ? -1 : 1 });
            } else {
                lastPlatHadDrone = false;
            }
        }

        function syncHud(force) {
            hud.push({
                score: Math.floor(score),
                level,
                maxLevel: 99,
                lives,
                statusText: core.tr(`İrtifa: ${Math.floor(maxHeight / 10)}m`, `Altitude: ${Math.floor(maxHeight / 10)}m`),
                objectiveText: core.tr('A/D Yatay Süzül (Kenar Geçişi) · Droneların Üstüne Zıpla!', 'A/D Move (Screen Wrap) · Stomp Drones from Above!')
            }, force);
        }

        function resetGame() {
            platforms.length = 0;
            drones.length = 0;
            starsPickups.length = 0;
            fx.clear();
            score = 0;
            level = 1;
            lives = 3;
            camY = 0;
            maxHeight = 0;
            lavaY = 580;
            lastPlatKind = 'solid';
            lastPlatHadDrone = false;
            elapsed = 0;
            ended = false;
            player.x = W * 0.5;
            player.y = 430;
            player.vx = 0;
            player.vy = -560;
            player.invuln = 1.0;

            platforms.push({ x: W * 0.5, y: 495, w: 260, h: 18, kind: 'solid', dir: 1, broken: false });
            highestGenY = 495;
            while (highestGenY > -400) {
                highestGenY -= 58 + Math.random() * 28;
                spawnPlatformAt(highestGenY, highestGenY > 250);
            }
            syncHud(true);
        }

        function step(dt) {
            if (ended) return;
            elapsed += dt;
            hud.tick(dt);
            if (player.invuln > 0) player.invuln -= dt;

            let mx = 0;
            if (input.has('KeyA', 'ArrowLeft', 'a')) mx -= 1;
            if (input.has('KeyD', 'ArrowRight', 'd')) mx += 1;
            if (mx !== 0) {
                player.vx = lerp(player.vx, mx * 410, clamp(dt * 12, 0, 1));
            } else if (input.pointer.active && input.pointer.down) {
                player.vx = clamp((input.pointer.x - player.x) * 6.5, -420, 420);
            } else {
                player.vx *= Math.pow(0.02, dt);
            }

            player.x = (player.x + player.vx * dt + W) % W;
            const prevY = player.y;
            player.vy += 1080 * dt;
            player.y += player.vy * dt;

            // Platform landing when falling
            if (player.vy > 0) {
                for (let i = 0; i < platforms.length; i++) {
                    const p = platforms[i];
                    if (p.broken) continue;
                    if (Math.abs(player.x - p.x) <= p.w * 0.5 + 14 && prevY + 18 <= p.y + 8 && player.y + 18 >= p.y) {
                        player.y = p.y - 18;
                        if (p.kind === 'spring') {
                            player.vy = -880;
                            score += 50;
                            core.playAudio('powerup');
                            fx.burst(player.x, p.y, '#34d399', 14, 180);
                            fx.popup(player.x, p.y - 20, core.tr('SÜPER YAY!', 'SPRING!'), '#34d399', 15);
                        } else if (p.kind === 'fragile') {
                            player.vy = -560;
                            p.broken = true;
                            core.playAudio('hitMetal');
                            fx.burst(p.x, p.y, '#f59e0b', 8, 120);
                        } else {
                            player.vy = -585;
                            core.playAudio('hitShield', 0.14);
                        }
                        break;
                    }
                }
            }

            for (let i = 0; i < platforms.length; i++) {
                const p = platforms[i];
                if (p.kind === 'moving') {
                    p.x += p.dir * (95 + level * 10) * dt;
                    if (p.x < 70 || p.x > W - 70) p.dir *= -1;
                }
            }

            // Camera upward follow & lava rise
            if (player.y - camY < H * 0.4) {
                const delta = (H * 0.4) - (player.y - camY);
                camY -= delta;
                maxHeight = Math.max(maxHeight, -camY);
                score = Math.max(score, maxHeight * 0.25);
                level = 1 + Math.floor(maxHeight / 1400);
                core.stepStarfield(stars, dt, 0, 1.5);
            }

            const lavaSpeed = elapsed < 4 ? 22 : (48 + Math.min(85, level * 9));
            lavaY = Math.min(lavaY - lavaSpeed * dt, camY + H + 115);

            // Generate higher platforms & prune below lava
            while (highestGenY > camY - 350) {
                highestGenY -= 58 + Math.random() * 28;
                spawnPlatformAt(highestGenY, false);
            }
            for (let i = platforms.length - 1; i >= 0; i--) {
                if (platforms[i].y > camY + H + 120) platforms.splice(i, 1);
            }

            // Drones stomp or hit
            for (let i = drones.length - 1; i >= 0; i--) {
                const d = drones[i];
                d.x += d.dir * 85 * dt;
                if (d.x < 45 || d.x > W - 45) d.dir *= -1;
                if (dist2(player.x, player.y, d.x, d.y) < 30 * 30) {
                    if (player.vy > 0 && prevY < d.y - 4) {
                        player.vy = -660;
                        score += 150;
                        core.playAudio('explodeSmall');
                        fx.burst(d.x, d.y, '#fbbf24', 14, 180);
                        fx.popup(d.x, d.y - camY - 16, '+150', '#fbbf24', 16);
                        drones.splice(i, 1);
                    } else if (player.invuln <= 0) {
                        lives -= 1;
                        player.invuln = 1.2;
                        player.vy = -480;
                        fx.burst(player.x, player.y - camY, '#fb7185', 14, 180);
                        if (lives <= 0) {
                            lives = 0;
                            ended = true;
                            core.playAudio('explodeBoss');
                            syncHud(true);
                            ctx.onGameOver?.({ score: Math.floor(score), level, stars: 0, reason: core.tr('Uzaylı dronu jetpacki düşürdü.', 'Alien drone disabled your jetpack.') });
                            return;
                        }
                        core.playAudio('playerHurt');
                        syncHud(true);
                    }
                } else if (d.y > camY + H + 100) {
                    drones.splice(i, 1);
                }
            }

            for (let i = starsPickups.length - 1; i >= 0; i--) {
                const st = starsPickups[i];
                st.bob += dt * 4;
                if (dist2(player.x, player.y, st.x, st.y) < 28 * 28) {
                    score += 80;
                    core.playAudio('xpPickup');
                    fx.popup(st.x, st.y - camY - 16, '+80', '#fbbf24', 15);
                    starsPickups.splice(i, 1);
                    continue;
                }
                if (st.y > camY + H + 80) starsPickups.splice(i, 1);
            }

            // Rising lava check
            if (player.y + 16 >= lavaY) {
                lives -= 1;
                if (lives <= 0) {
                    lives = 0;
                    ended = true;
                    core.playAudio('explodeBoss');
                    syncHud(true);
                    ctx.onGameOver?.({ score: Math.floor(score), level, stars: 0, reason: core.tr('Yükselen lav plazmasına düştün.', 'Engulfed by rising lava plasma.') });
                    return;
                }
                player.invuln = 1.4;
                player.vy = -820;
                player.y = lavaY - 30;
                // Ensure a solid safety foothold above so emergency thrust never drops player back into lava
                const hasReachablePlat = platforms.some((p) => !p.broken && p.kind !== 'fragile' && p.y < player.y - 60 && p.y > player.y - 260);
                if (!hasReachablePlat) {
                    platforms.push({ x: clamp(player.x, 95, W - 95), y: player.y - 165, w: 140, h: 16, kind: 'solid', dir: 1, broken: false });
                }
                core.playAudio('playerHurt');
                fx.popup(player.x, player.y - camY - 24, core.tr('ACİL İTİCİ!', 'EMERGENCY THRUST!'), '#fb7185', 16);
                syncHud(true);
            }

            fx.update(dt);
            input.endFrame();
            syncHud(false);
        }

        function render() {
            core.renderBackdrop(g, stars, '#050814', '#160d24', 'rgba(245,158,11,0.12)');

            for (let i = 0; i < platforms.length; i++) {
                const p = platforms[i];
                if (p.broken) continue;
                const sy = p.y - camY;
                if (sy < -30 || sy > H + 30) continue;
                g.fillStyle = p.kind === 'spring' ? '#34d399' : (p.kind === 'fragile' ? '#f59e0b' : (p.kind === 'moving' ? '#a78bfa' : '#38bdf8'));
                g.beginPath();
                g.roundRect(p.x - p.w * 0.5, sy, p.w, p.h, 6);
                g.fill();
            }

            for (let i = 0; i < starsPickups.length; i++) {
                const st = starsPickups[i];
                core.drawSprite(g, 'coin_star', st.x, st.y - camY + Math.sin(st.bob) * 4, 28, 28, 0, 1);
            }

            for (let i = 0; i < drones.length; i++) {
                const d = drones[i];
                core.drawSprite(g, 'alien_drone', d.x, d.y - camY, 34, 34, 0, 1);
            }

            // Rising Lava Plasma
            const ly = lavaY - camY;
            if (ly < H) {
                const grad = g.createLinearGradient(0, ly, 0, H);
                grad.addColorStop(0, '#fb7185');
                grad.addColorStop(0.25, '#ea580c');
                grad.addColorStop(1, '#7c2d12');
                g.fillStyle = grad;
                g.fillRect(0, ly, W, H - ly + 40);
            }

            const vis = player.invuln <= 0 || Math.floor(player.invuln * 18) % 2 === 0;
            if (vis) {
                core.drawSprite(g, 'astronaut', player.x, player.y - camY, 38, 38, clamp(player.vx * 0.0008, -0.35, 0.35), 1);
            }

            fx.render(g);
            core.drawHintBanner(g, core.tr('A/D veya Fare ile hareket et · Yaylara bas · Droneları ez', 'A/D or Drag · Bounce higher · Stomp Drones'), elapsed);
        }

        resetGame();
        const loopHandle = core.createLoop(step, render);

        return {
            restart() { resetGame(); },
            destroy() {
                loopHandle.stop();
                input.destroy();
                if (canvas.parentNode) canvas.remove();
            }
        };
    };

    // =========================================================================
    // 10. laser-limbo-dash
    // =========================================================================
    global.COSMIC_GAME_ENGINES['laser-limbo-dash'] = function mountLaserLimbo(ctx) {
        const core = createCore(ctx);
        const canvas = core.makeCanvas();
        const g = canvas.getContext('2d');
        const hud = core.createHudSync();
        const fx = core.createFX();
        const stars = core.createStarfield(110);
        const input = core.createInput(canvas);

        const player = { x: W * 0.5, y: H * 0.5, dashTimer: 0, dashCd: 0, invuln: 0 };
        const lasers = [];
        const beacons = [];

        let score = 0;
        let level = 1;
        let lives = 3;
        let combo = 1;
        let elapsed = 0;
        let waveCd = 1.6;
        let ended = false;

        function spawnBeacon() {
            beacons.push({ x: 80 + Math.random() * (W - 160), y: 75 + Math.random() * (H - 150), pulse: 0 });
        }

        function spawnLaserPattern() {
            const pattern = Math.floor(Math.random() * 3);
            const warnDur = level >= 3 ? 0.8 : 0.88;
            if (pattern === 0) {
                // Horizontal or Vertical sweep with guaranteed minimum lane spacing
                const horiz = Math.random() < 0.5;
                const count = Math.min(3, 1 + Math.floor(level * 0.45));
                const spanMax = horiz ? (H - 160) : (W - 200);
                const baseOff = horiz ? 80 : 100;
                const chosen = [];
                for (let i = 0; i < count; i++) {
                    let pos = baseOff + Math.random() * spanMax;
                    for (let attempt = 0; attempt < 8; attempt++) {
                        if (chosen.every((p) => Math.abs(p - pos) >= 95)) break;
                        pos = baseOff + Math.random() * spanMax;
                    }
                    chosen.push(pos);
                    lasers.push({
                        x1: horiz ? 0 : pos,
                        y1: horiz ? pos : 0,
                        x2: horiz ? W : pos,
                        y2: horiz ? pos : H,
                        warn: warnDur,
                        warnMax: warnDur,
                        active: 0.45,
                        hit: false
                    });
                }
            } else if (pattern === 1) {
                // Diagonal cross aimed near player
                const ang = Math.random() * Math.PI;
                for (const da of [0, Math.PI * 0.5]) {
                    const a = ang + da;
                    const cx = player.x + (Math.random() - 0.5) * 90;
                    const cy = player.y + (Math.random() - 0.5) * 90;
                    lasers.push({
                        x1: cx - Math.cos(a) * 1100,
                        y1: cy - Math.sin(a) * 1100,
                        x2: cx + Math.cos(a) * 1100,
                        y2: cy + Math.sin(a) * 1100,
                        warn: warnDur,
                        warnMax: warnDur,
                        active: 0.45,
                        hit: false
                    });
                }
            } else {
                // Perimeter turret beams
                const tx = Math.random() < 0.5 ? 24 : W - 24;
                const ty = 70 + Math.random() * (H - 140);
                const ang = Math.atan2(player.y - ty, player.x - tx);
                lasers.push({
                    x1: tx,
                    y1: ty,
                    x2: tx + Math.cos(ang) * 1200,
                    y2: ty + Math.sin(ang) * 1200,
                    warn: warnDur,
                    warnMax: warnDur,
                    active: 0.48,
                    hit: false
                });
            }
            core.playAudio('emp');
        }

        function syncHud(force) {
            const st = player.dashTimer > 0
                ? core.tr('FAZ DASH!', 'PHASE DASH!')
                : (player.dashCd > 0
                    ? core.tr(`Dash: ${player.dashCd.toFixed(1)}s`, `Dash CD: ${player.dashCd.toFixed(1)}s`)
                    : core.tr('[Space/Tıkla] Dash Hazır', '[Space/Click] Dash Ready'));
            hud.push({
                score: Math.floor(score),
                level,
                maxLevel: 99,
                lives,
                statusText: st,
                objectiveText: core.tr(`Kombo x${combo} · İşaret Fişeklerini Topla · Lazerlerden Dash ile Geç`, `Combo x${combo} · Grab Beacons · Dash Through Lasers`)
            }, force);
        }

        function resetGame() {
            lasers.length = 0;
            beacons.length = 0;
            fx.clear();
            score = 0;
            level = 1;
            lives = 3;
            combo = 1;
            elapsed = 0;
            waveCd = 1.6;
            ended = false;
            player.x = W * 0.5;
            player.y = H * 0.5;
            player.dashTimer = 0;
            player.dashCd = 0;
            player.invuln = 1.0;
            spawnBeacon();
            spawnBeacon();
            syncHud(true);
        }

        function step(dt) {
            if (ended) return;
            elapsed += dt;
            hud.tick(dt);
            core.stepStarfield(stars, dt, -0.3, 0.2);
            if (player.invuln > 0) player.invuln -= dt;
            if (player.dashTimer > 0) player.dashTimer -= dt;
            if (player.dashCd > 0) player.dashCd -= dt;

            let mx = 0;
            let my = 0;
            if (input.has('KeyA', 'ArrowLeft', 'a')) mx -= 1;
            if (input.has('KeyD', 'ArrowRight', 'd')) mx += 1;
            if (input.has('KeyW', 'ArrowUp', 'w')) my -= 1;
            if (input.has('KeyS', 'ArrowDown', 's')) my += 1;
            const len = Math.hypot(mx, my) || 1;

            if ((input.consumePress('Space', ' ', 'ShiftLeft', 'ShiftRight') || input.consumePointerTap()) && player.dashCd <= 0) {
                player.dashTimer = 0.25;
                player.dashCd = 0.85;
                core.playAudio('dash');
                fx.burst(player.x, player.y, '#38bdf8', 12, 160);
            }

            const spd = player.dashTimer > 0 ? 720 : 300;
            if (mx !== 0 || my !== 0) {
                player.x += (mx / len) * spd * dt;
                player.y += (my / len) * spd * dt;
            } else if (input.pointer.active && input.pointer.down) {
                const dx = input.pointer.x - player.x;
                const dy = input.pointer.y - player.y;
                const d = Math.hypot(dx, dy);
                if (d > 4) {
                    player.x += (dx / d) * Math.min(d, spd * dt);
                    player.y += (dy / d) * Math.min(d, spd * dt);
                }
            }
            player.x = clamp(player.x, 26, W - 26);
            player.y = clamp(player.y, 26, H - 26);

            score += dt * 20;
            level = 1 + Math.floor(elapsed / 11);

            waveCd -= dt;
            if (waveCd <= 0) {
                spawnLaserPattern();
                waveCd = elapsed < 3.5 ? 1.85 : Math.max(1.05, 1.55 - level * 0.08);
            }

            for (let i = lasers.length - 1; i >= 0; i--) {
                const l = lasers[i];
                if (l.warn > 0) {
                    l.warn -= dt;
                    if (l.warn <= 0) core.playAudio('shootLaser', 0.14);
                    continue;
                }
                l.active -= dt;
                if (!l.hit && pointToSegDist(player.x, player.y, l.x1, l.y1, l.x2, l.y2) < 15) {
                    if (player.dashTimer > 0) {
                        l.hit = true;
                        score += 50;
                        fx.popup(player.x, player.y - 20, core.tr('DASH KAÇIŞ +50', 'LIMBO +50'), '#38bdf8', 14);
                    } else if (player.invuln <= 0) {
                        l.hit = true;
                        lives -= 1;
                        combo = 1;
                        player.invuln = 1.2;
                        fx.burst(player.x, player.y, '#fb7185', 18, 220);
                        fx.popup(player.x, player.y - 24, core.tr('LAZER İSABET!', 'LASER HIT!'), '#fb7185', 16);
                        if (lives <= 0) {
                            lives = 0;
                            ended = true;
                            core.playAudio('explodeBoss');
                            syncHud(true);
                            ctx.onGameOver?.({ score: Math.floor(score), level, stars: 0, reason: core.tr('Senkronize arena lazerine yakalandın.', 'Caught in synchronized arena laser sweep.') });
                            return;
                        }
                        core.playAudio('playerHurt');
                        syncHud(true);
                    }
                }
                if (l.active <= 0) lasers.splice(i, 1);
            }

            for (let i = beacons.length - 1; i >= 0; i--) {
                const b = beacons[i];
                b.pulse += dt * 4;
                if (dist2(player.x, player.y, b.x, b.y) < 30 * 30) {
                    const pts = 120 * combo;
                    score += pts;
                    combo = Math.min(5, combo + 1);
                    core.playAudio('powerup');
                    fx.burst(b.x, b.y, '#34d399', 14, 180);
                    fx.popup(b.x, b.y - 18, `+${pts}`, '#34d399', 16);
                    beacons.splice(i, 1);
                    spawnBeacon();
                }
            }

            fx.update(dt);
            input.endFrame();
            syncHud(false);
        }

        function render() {
            core.renderBackdrop(g, stars, '#050712', '#130c22', 'rgba(251,113,133,0.1)');

            for (let i = 0; i < beacons.length; i++) {
                const b = beacons[i];
                const sc = 1 + Math.sin(b.pulse) * 0.14;
                core.drawSprite(g, 'energy_prism', b.x, b.y, 34 * sc, 34 * sc, b.pulse * 0.3, 1);
            }

            for (let i = 0; i < lasers.length; i++) {
                const l = lasers[i];
                g.save();
                if (l.warn > 0) {
                    const wp = clamp(1 - l.warn / (l.warnMax || 0.88), 0, 1);
                    g.strokeStyle = `rgba(251,113,133,${0.12 + wp * 0.22})`;
                    g.lineWidth = 18 * (1 - wp * 0.55);
                    g.beginPath(); g.moveTo(l.x1, l.y1); g.lineTo(l.x2, l.y2); g.stroke();
                    g.setLineDash([12, 10]);
                    g.strokeStyle = wp > 0.72 ? '#fda4af' : `rgba(251,113,133,${0.48 + wp * 0.48})`;
                    g.lineWidth = 2 + wp * 3;
                } else {
                    g.strokeStyle = 'rgba(251,113,133,0.5)';
                    g.lineWidth = 22;
                    g.beginPath(); g.moveTo(l.x1, l.y1); g.lineTo(l.x2, l.y2); g.stroke();
                    g.strokeStyle = '#ffffff';
                    g.lineWidth = 7;
                }
                g.beginPath(); g.moveTo(l.x1, l.y1); g.lineTo(l.x2, l.y2); g.stroke();
                g.restore();
            }

            const vis = player.invuln <= 0 || Math.floor(player.invuln * 18) % 2 === 0;
            if (vis) {
                core.drawSprite(g, 'nova_avatar', player.x, player.y, 38, 38, 0, player.dashTimer > 0 ? 0.5 : 1);
                if (player.dashTimer > 0) {
                    g.strokeStyle = '#38bdf8';
                    g.lineWidth = 3;
                    g.beginPath(); g.arc(player.x, player.y, 24, 0, TAU); g.stroke();
                }
            }

            fx.render(g);
            core.drawHintBanner(g, core.tr('WASD Hareket · [Space/Tıkla] Lazer İçinden Dash!', 'WASD Move · [Space/Click] Dash Through Lasers!'), elapsed);
        }

        resetGame();
        const loopHandle = core.createLoop(step, render);

        return {
            restart() { resetGame(); },
            destroy() {
                loopHandle.stop();
                input.destroy();
                if (canvas.parentNode) canvas.remove();
            }
        };
    };

    // =========================================================================
    // 11. starlight-rhythm-pulse (4-track synthwave lane + WebAudio chords)
    // =========================================================================
    global.COSMIC_GAME_ENGINES['starlight-rhythm-pulse'] = function mountStarlightRhythm(ctx) {
        const core = createCore(ctx);
        const canvas = core.makeCanvas();
        const g = canvas.getContext('2d');
        const hud = core.createHudSync();
        const fx = core.createFX();
        const stars = core.createStarfield(100);

        const LANE_X = [300, 420, 540, 660];
        const LANE_KEYS = ['D', 'F', 'J', 'K'];
        const LANE_COLORS = ['#38bdf8', '#34d399', '#a78bfa', '#f59e0b'];
        const RECEPTOR_Y = 458;

        // Cmaj9 -> Am9 -> Fmaj7 -> G6 synthwave chord voicing (Hz)
        const CHORDS = [
            [261.63, 329.63, 392.00, 493.88],
            [220.00, 261.63, 329.63, 493.88],
            [174.61, 220.00, 261.63, 329.63],
            [196.00, 246.94, 293.66, 329.63]
        ];

        let localAudioCtx = null;
        function playSynthChordNote(laneIdx, quality) {
            if (core.isMuted()) return;
            try {
                const AC = global.AudioContext || global.webkitAudioContext;
                const ac = (ctx.audio && ctx.audio.ctx) || localAudioCtx || (AC ? new AC() : null);
                if (!ac) return;
                localAudioCtx = ac;
                if (ac.state === 'suspended') ac.resume();

                const chord = CHORDS[Math.floor(beatCount / 4) % CHORDS.length];
                const freq = chord[laneIdx % chord.length] * (quality === 'perfect' ? 2 : 1);
                const now = ac.currentTime;

                const osc = ac.createOscillator();
                const osc2 = ac.createOscillator();
                const gain = ac.createGain();
                osc.type = 'triangle';
                osc2.type = 'sine';
                osc.frequency.setValueAtTime(freq, now);
                osc2.frequency.setValueAtTime(freq * 0.5, now);

                gain.gain.setValueAtTime(0.09, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);

                osc.connect(gain);
                osc2.connect(gain);
                gain.connect(ac.destination);
                osc.start(now);
                osc2.start(now);
                osc.stop(now + 0.25);
                osc2.stop(now + 0.25);
            } catch (e) { /* safe ignore */ }
        }

        const notes = [];
        const laneFlash = [0, 0, 0, 0];
        let score = 0;
        let combo = 0;
        let bestCombo = 0;
        let level = 1;
        let lives = 5;
        let beatCount = 0;
        let beatTimer = 0.6;
        let elapsed = 0;
        let ended = false;

        function getMult() {
            return combo >= 24 ? 4 : (combo >= 12 ? 3 : (combo >= 5 ? 2 : 1));
        }

        function spawnBeatNote() {
            beatCount += 1;
            const patternIdx = beatCount % 8;
            const primaryLane = (beatCount * 3 + Math.floor(beatCount / 4)) % 4;
            notes.push({ lane: primaryLane, y: -20 });
            if (level >= 2 && patternIdx === 4 && Math.random() < 0.55) {
                notes.push({ lane: (primaryLane + 2) % 4, y: -20 });
            }
        }

        function hitLane(laneIdx) {
            if (ended) return;
            laneFlash[laneIdx] = 0.22;
            let bestIdx = -1;
            let bestDist = 75;
            for (let i = 0; i < notes.length; i++) {
                if (notes[i].lane !== laneIdx) continue;
                const d = Math.abs(notes[i].y - RECEPTOR_Y);
                if (d < bestDist) {
                    bestDist = d;
                    bestIdx = i;
                }
            }

            if (bestIdx === -1) {
                core.playAudio('uiClick', 0.1);
                return;
            }

            notes.splice(bestIdx, 1);
            combo += 1;
            bestCombo = Math.max(bestCombo, combo);
            const mult = getMult();
            let base = 25;
            let label = 'OK';
            let col = '#94a3b8';
            let qual = 'ok';
            if (bestDist <= 24) {
                base = 100;
                label = 'PERFECT';
                col = '#fbbf24';
                qual = 'perfect';
            } else if (bestDist <= 46) {
                base = 60;
                label = 'GOOD';
                col = '#34d399';
                qual = 'good';
            }
            const pts = base * mult;
            score += pts;
            level = 1 + Math.floor(beatCount / 22);
            if (combo > 0 && combo % 15 === 0 && lives < 5) lives += 1;

            playSynthChordNote(laneIdx, qual);
            fx.burst(LANE_X[laneIdx], RECEPTOR_Y, LANE_COLORS[laneIdx], 12, 160);
            fx.popup(LANE_X[laneIdx], RECEPTOR_Y - 34, `${label} +${pts}`, col, qual === 'perfect' ? 17 : 15);
            syncHud(false);
        }

        const input = core.createInput(canvas, {
            onKeyTap(code, key) {
                if (code === 'KeyD' || key === 'd' || code === 'ArrowLeft') hitLane(0);
                else if (code === 'KeyF' || key === 'f' || code === 'ArrowDown') hitLane(1);
                else if (code === 'KeyJ' || key === 'j' || code === 'ArrowUp') hitLane(2);
                else if (code === 'KeyK' || key === 'k' || code === 'ArrowRight') hitLane(3);
            },
            onPointerTap(px) {
                const lane = clamp(Math.floor((px - (LANE_X[0] - 60)) / 120), 0, 3);
                hitLane(lane);
            }
        });

        function syncHud(force) {
            const bpm = Math.min(136, 104 + (level - 1) * 6);
            hud.push({
                score: Math.floor(score),
                level,
                maxLevel: 99,
                lives,
                statusText: `${bpm} BPM · ${core.tr('Kombo', 'Combo')} ${combo} (x${getMult()})`,
                objectiveText: core.tr('D · F · J · K tuşlarıyla ritme göre yakala!', 'Hit notes on beat with D · F · J · K or Click!')
            }, force);
        }

        function resetGame() {
            notes.length = 0;
            for (let i = 0; i < 4; i++) laneFlash[i] = 0;
            fx.clear();
            score = 0;
            combo = 0;
            bestCombo = 0;
            level = 1;
            lives = 5;
            beatCount = 0;
            beatTimer = 0.85;
            elapsed = 0;
            ended = false;
            syncHud(true);
        }

        function step(dt) {
            if (ended) return;
            elapsed += dt;
            hud.tick(dt);
            core.stepStarfield(stars, dt, 0, 1.8);
            for (let i = 0; i < 4; i++) {
                if (laneFlash[i] > 0) laneFlash[i] = Math.max(0, laneFlash[i] - dt);
            }

            const bpm = Math.min(136, 104 + (level - 1) * 6);
            const beatInterval = 60 / bpm;
            beatTimer -= dt;
            if (beatTimer <= 0) {
                beatTimer += beatInterval;
                spawnBeatNote();
            }

            const noteSpeed = 270 + (level - 1) * 26;
            for (let i = notes.length - 1; i >= 0; i--) {
                const n = notes[i];
                n.y += noteSpeed * dt;
                if (n.y > RECEPTOR_Y + 62) {
                    notes.splice(i, 1);
                    combo = 0;
                    lives -= 1;
                    fx.popup(LANE_X[n.lane], RECEPTOR_Y - 24, core.tr('KAÇTI!', 'MISS!'), '#fb7185', 14);
                    if (lives <= 0) {
                        lives = 0;
                        ended = true;
                        core.playAudio('explodeBoss');
                        syncHud(true);
                        ctx.onGameOver?.({
                            score: Math.floor(score),
                            level,
                            stars: 0,
                            reason: core.tr(`Ritim akışı bozuldu (En yüksek kombo: ${bestCombo}).`, `Rhythm pulse lost (Best combo: ${bestCombo}).`)
                        });
                        return;
                    }
                    core.playAudio('playerHurt');
                    syncHud(true);
                }
            }

            fx.update(dt);
            input.endFrame();
            syncHud(false);
        }

        function render() {
            core.renderBackdrop(g, stars, '#060516', '#150d2e', 'rgba(167,139,250,0.15)');

            // Highway backdrop
            g.fillStyle = 'rgba(15, 23, 42, 0.78)';
            g.fillRect(LANE_X[0] - 60, 0, 480, H);
            g.strokeStyle = 'rgba(56,189,248,0.35)';
            g.lineWidth = 2;
            g.strokeRect(LANE_X[0] - 60, -2, 480, H + 4);

            // GOOD (±46px) & PERFECT (±24px) Timing Windows + BPM Receptor Beat Pulse
            const bpm = Math.min(136, 104 + (level - 1) * 6);
            const beatInterval = 60 / bpm;
            const beatGlow = Math.pow(clamp(beatTimer / beatInterval, 0, 1), 2);
            g.fillStyle = 'rgba(52, 211, 153, 0.08)';
            g.fillRect(LANE_X[0] - 60, RECEPTOR_Y - 46, 480, 92);
            g.fillStyle = 'rgba(251, 191, 36, 0.14)';
            g.fillRect(LANE_X[0] - 60, RECEPTOR_Y - 24, 480, 48);
            g.strokeStyle = 'rgba(251, 191, 36, 0.35)';
            g.lineWidth = 1.5;
            g.beginPath();
            g.moveTo(LANE_X[0] - 60, RECEPTOR_Y);
            g.lineTo(LANE_X[0] + 420, RECEPTOR_Y);
            g.stroke();

            for (let i = 0; i < 4; i++) {
                const lx = LANE_X[i];
                if (laneFlash[i] > 0) {
                    g.fillStyle = LANE_COLORS[i] + '26';
                    g.fillRect(lx - 58, 0, 116, H);
                }
                g.strokeStyle = 'rgba(148,163,184,0.16)';
                g.beginPath(); g.moveTo(lx, 0); g.lineTo(lx, H); g.stroke();

                // BPM expanding halo on beat
                g.save();
                g.strokeStyle = LANE_COLORS[i];
                g.globalAlpha = 0.25 + beatGlow * 0.4;
                g.lineWidth = 1.5;
                g.beginPath(); g.arc(lx, RECEPTOR_Y, 27 + (1 - beatGlow) * 9, 0, TAU); g.stroke();
                g.restore();

                // Receptor circle
                g.fillStyle = laneFlash[i] > 0 ? LANE_COLORS[i] : 'rgba(15,23,42,0.9)';
                g.strokeStyle = LANE_COLORS[i];
                g.lineWidth = 3;
                g.beginPath(); g.arc(lx, RECEPTOR_Y, 26, 0, TAU); g.stroke();
                if (laneFlash[i] > 0) g.fill();

                g.font = '700 16px "JetBrains Mono", monospace';
                g.fillStyle = laneFlash[i] > 0 ? '#070b12' : '#e2e8f0';
                g.textAlign = 'center';
                g.textBaseline = 'middle';
                g.fillText(LANE_KEYS[i], lx, RECEPTOR_Y);
            }

            for (let i = 0; i < notes.length; i++) {
                const n = notes[i];
                const nx = LANE_X[n.lane];
                const dRec = Math.abs(n.y - RECEPTOR_Y);
                if (dRec <= 46) {
                    g.save();
                    g.strokeStyle = dRec <= 24 ? '#fbbf24' : '#34d399';
                    g.lineWidth = 2.5;
                    g.beginPath(); g.arc(nx, n.y, 26, 0, TAU); g.stroke();
                    g.restore();
                }
                g.fillStyle = LANE_COLORS[n.lane];
                g.beginPath();
                g.moveTo(nx, n.y - 16);
                g.lineTo(nx + 22, n.y);
                g.lineTo(nx, n.y + 16);
                g.lineTo(nx - 22, n.y);
                g.closePath();
                g.fill();
                g.fillStyle = '#ffffff';
                g.beginPath(); g.arc(nx, n.y, 5, 0, TAU); g.fill();
            }

            if (combo >= 3) {
                g.font = '700 22px "Space Grotesk", sans-serif';
                g.fillStyle = '#fbbf24';
                g.textAlign = 'center';
                g.fillText(`${combo}x COMBO`, W * 0.5, 58);
            }

            fx.render(g);
            core.drawHintBanner(g, core.tr('D · F · J · K tuşları veya Alt Halkalara Tıkla', 'D · F · J · K Keys or Tap Track Receivers'), elapsed);
        }

        resetGame();
        const loopHandle = core.createLoop(step, render);

        return {
            restart() { resetGame(); },
            destroy() {
                loopHandle.stop();
                input.destroy();
                if (localAudioCtx && localAudioCtx.state !== 'closed' && (!ctx.audio || localAudioCtx !== ctx.audio.ctx)) {
                    try { localAudioCtx.close(); } catch (e) { /* ignore */ }
                }
                if (canvas.parentNode) canvas.remove();
            }
        };
    };

    // =========================================================================
    // 12. hyper-reaction-dock
    // =========================================================================
    global.COSMIC_GAME_ENGINES['hyper-reaction-dock'] = function mountHyperDock(ctx) {
        const core = createCore(ctx);
        const canvas = core.makeCanvas();
        const g = canvas.getContext('2d');
        const hud = core.createHudSync();
        const fx = core.createFX();
        const stars = core.createStarfield(110);

        const CX = W * 0.5;
        const CY = H * 0.5;
        const RING_R = 165;

        let shuttleAng = 0;
        let shuttleDir = 1;
        let targetAng = -Math.PI * 0.5;
        let arcWidth = 0.78;
        let score = 0;
        let mult = 1;
        let level = 1;
        let locks = 0;
        let lives = 4;
        let lockFlash = 0;
        let elapsed = 0;
        let ended = false;

        function nextDockArc() {
            if (level >= 3 && Math.random() < 0.42) shuttleDir *= -1;
            arcWidth = Math.max(0.36, 0.78 - (level - 1) * 0.05);
            // Place next dock comfortably ahead along active rotation direction
            const lead = Math.PI * 0.7 + Math.random() * Math.PI * 0.9;
            targetAng = (shuttleAng + shuttleDir * lead + TAU) % TAU;
        }

        function attemptDock() {
            if (ended) return;
            const diff = Math.abs(angleDiff(shuttleAng, targetAng));
            const halfArc = arcWidth * 0.5;
            if (diff <= halfArc) {
                const bullseye = diff <= halfArc * 0.36;
                if (bullseye) {
                    mult = Math.min(8, mult + 1);
                }
                const pts = (bullseye ? 150 : 100) * mult;
                score += pts;
                locks += 1;
                level = 1 + Math.floor(locks / 3);
                lockFlash = 0.35;

                const sx = CX + Math.cos(shuttleAng) * RING_R;
                const sy = CY + Math.sin(shuttleAng) * RING_R;
                core.playAudio(bullseye ? 'levelup' : 'powerup');
                fx.burst(sx, sy, bullseye ? '#fbbf24' : '#38bdf8', 18, 200);
                fx.popup(sx, sy - 22, bullseye ? core.tr(`TAM İSABET x${mult} +${pts}`, `BULLSEYE x${mult} +${pts}`) : core.tr(`KENETLENDİ +${pts}`, `DOCKED +${pts}`), bullseye ? '#fbbf24' : '#38bdf8', bullseye ? 18 : 15);
                nextDockArc();
                syncHud(true);
            } else {
                mult = 1;
                lives -= 1;
                const sx = CX + Math.cos(shuttleAng) * RING_R;
                const sy = CY + Math.sin(shuttleAng) * RING_R;
                fx.burst(sx, sy, '#fb7185', 16, 200);
                fx.popup(sx, sy - 22, core.tr('ISKALADIN!', 'MISS!'), '#fb7185', 16);
                if (lives <= 0) {
                    lives = 0;
                    ended = true;
                    core.playAudio('explodeBoss');
                    syncHud(true);
                    ctx.onGameOver?.({
                        score: Math.floor(score),
                        level,
                        stars: 0,
                        reason: core.tr('Hava kilidi hizalama gövdesi hasar gördü.', 'Airlock alignment hull ruptured.')
                    });
                    return;
                }
                core.playAudio('hitMetal');
                syncHud(true);
            }
        }

        const input = core.createInput(canvas, {
            onKeyTap(code) {
                if (code === 'Space' || code === 'Enter') attemptDock();
            },
            onPointerTap() {
                attemptDock();
            }
        });

        function syncHud(force) {
            hud.push({
                score: Math.floor(score),
                level,
                maxLevel: 99,
                lives,
                statusText: core.tr(`Çarpan: x${mult} · Kenetlenme: ${locks}`, `Multiplier: x${mult} · Docks: ${locks}`),
                objectiveText: core.tr('Mekik mavi yayın içine girince [Space / Tıkla]!', 'Press [Space / Click] inside the Cyan Alignment Arc!')
            }, force);
        }

        function resetGame() {
            fx.clear();
            score = 0;
            mult = 1;
            level = 1;
            locks = 0;
            lives = 4;
            lockFlash = 0;
            elapsed = 0;
            ended = false;
            shuttleAng = 0;
            shuttleDir = 1;
            targetAng = -Math.PI * 0.5;
            arcWidth = 0.78;
            syncHud(true);
        }

        function step(dt) {
            if (ended) return;
            elapsed += dt;
            hud.tick(dt);
            core.stepStarfield(stars, dt, 0.2, 0.15);
            if (lockFlash > 0) lockFlash = Math.max(0, lockFlash - dt);

            const omega = (1.9 + Math.min(2.1, (level - 1) * 0.28)) * shuttleDir;
            shuttleAng = (shuttleAng + omega * dt + TAU) % TAU;

            fx.update(dt);
            input.endFrame();
            syncHud(false);
        }

        function render() {
            core.renderBackdrop(g, stars, '#050814', '#0d1930', 'rgba(56,189,248,0.14)');

            // Central airlock station ring
            core.drawSprite(g, 'portal_vortex', CX, CY, 160, 160, elapsed * 0.7, 0.65);
            core.drawSprite(g, 'warp_ring', CX, CY, 118, 118, -elapsed * 0.9, 0.9);

            // Outer track rail
            g.strokeStyle = 'rgba(148, 163, 184, 0.25)';
            g.lineWidth = 10;
            g.beginPath(); g.arc(CX, CY, RING_R, 0, TAU); g.stroke();

            // Target Cyan Alignment Arc & Bullseye Center (lights up brightly when shuttle enters dock window)
            const curDiff = Math.abs(angleDiff(shuttleAng, targetAng));
            const inArc = curDiff <= arcWidth * 0.5;
            const inBullseye = curDiff <= arcWidth * 0.18;

            g.save();
            if (inArc) {
                g.strokeStyle = inBullseye ? 'rgba(251, 191, 36, 0.45)' : 'rgba(34, 211, 238, 0.35)';
                g.lineWidth = 24;
                g.beginPath();
                g.arc(CX, CY, RING_R, targetAng - arcWidth * 0.5, targetAng + arcWidth * 0.5);
                g.stroke();
            }
            g.strokeStyle = lockFlash > 0 || inBullseye ? '#fbbf24' : (inArc ? '#67e8f9' : '#22d3ee');
            g.lineWidth = inArc ? 16 : 14;
            g.beginPath();
            g.arc(CX, CY, RING_R, targetAng - arcWidth * 0.5, targetAng + arcWidth * 0.5);
            g.stroke();

            g.strokeStyle = inBullseye ? '#ffffff' : '#fbbf24';
            g.lineWidth = inBullseye ? 16 : 14;
            g.beginPath();
            g.arc(CX, CY, RING_R, targetAng - arcWidth * 0.16, targetAng + arcWidth * 0.16);
            g.stroke();

            // Shuttle direction chevron indicator along orbit track
            const leadAng = shuttleAng + shuttleDir * 0.22;
            const lx = CX + Math.cos(leadAng) * (RING_R + 28);
            const ly = CY + Math.sin(leadAng) * (RING_R + 28);
            g.translate(lx, ly);
            g.rotate(leadAng + (shuttleDir > 0 ? Math.PI * 0.5 : -Math.PI * 0.5));
            g.fillStyle = '#38bdf8';
            g.beginPath();
            g.moveTo(8, 0);
            g.lineTo(-5, -5);
            g.lineTo(-5, 5);
            g.closePath();
            g.fill();
            g.restore();

            // Shuttle alignment needle + sprite
            const sx = CX + Math.cos(shuttleAng) * RING_R;
            const sy = CY + Math.sin(shuttleAng) * RING_R;
            g.strokeStyle = '#ffffff';
            g.lineWidth = 3;
            g.beginPath();
            g.moveTo(CX + Math.cos(shuttleAng) * (RING_R - 26), CY + Math.sin(shuttleAng) * (RING_R - 26));
            g.lineTo(CX + Math.cos(shuttleAng) * (RING_R + 26), CY + Math.sin(shuttleAng) * (RING_R + 26));
            g.stroke();

            core.drawSprite(g, 'moon_lander', sx, sy, 42, 42, shuttleAng + Math.PI * 0.5, 1);

            g.font = '700 22px "Space Grotesk", sans-serif';
            g.fillStyle = mult > 1 ? '#fbbf24' : '#38bdf8';
            g.textAlign = 'center';
            g.textBaseline = 'middle';
            g.fillText(`x${mult}`, CX, CY);

            fx.render(g);
            core.drawHintBanner(g, core.tr('Altın Merkez = Çarpan Artar · [Space / Tıkla] Kenetlen!', 'Gold Center Stacks Multiplier · [Space / Click] Dock!'), elapsed);
        }

        resetGame();
        const loopHandle = core.createLoop(step, render);

        return {
            restart() { resetGame(); },
            destroy() {
                loopHandle.stop();
                input.destroy();
                if (canvas.parentNode) canvas.remove();
            }
        };
    };
})(window);
