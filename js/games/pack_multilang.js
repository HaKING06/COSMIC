// =============================================================================
// COSMIC UNIVERSE v11.0 — MULTILANG & TECH FLAGSHIP PACK (js/games/pack_multilang.js)
// Registers 5 distinct multi-language / multi-library flagship engines:
//   1. astral-roguelike-crawl  (ROT.js Digger + PreciseShadowcasting + Dijkstra)
//   2. lua-cyber-ops           (Fengari Lua 5.3 VM + lua/mission_kernel.lua)
//   3. asc-blackhole-swarm     (AssemblyScript .wasm -> wasm/cosmic_adv.wasm)
//   4. d3-galactic-conquest    (D3.js v7 forceSimulation + Delaunay Voronoi RTS)
//   5. glsl-synthwave-surf     (Pure WebGL2 #version 300 es SDF Raymarch + 2D HUD)
// =============================================================================
(function (global) {
    'use strict';

    const Engines = global.COSMIC_GAME_ENGINES = global.COSMIC_GAME_ENGINES || {};

    const W = 960;
    const H = 580;
    const TAU = Math.PI * 2;

    const PAL = {
        bg: '#050811',
        surface: '#0b1222',
        panel: 'rgba(10, 17, 34, 0.88)',
        border: 'rgba(56, 189, 248, 0.34)',
        sky: '#38bdf8',
        cyan: '#22d3ee',
        mint: '#34d399',
        amber: '#f59e0b',
        gold: '#facc15',
        coral: '#fb7185',
        crimson: '#ef4444',
        violet: '#a78bfa',
        magenta: '#e879f9',
        white: '#f8fafc',
        muted: '#94a3b8'
    };

    const FONT_DISPLAY = "'Space Grotesk', 'Inter', system-ui, sans-serif";
    const FONT_MONO = "'JetBrains Mono', ui-monospace, Consolas, monospace";

    // -------------------------------------------------------------------------
    // Shared Utilities
    // -------------------------------------------------------------------------
    function clamp(v, lo, hi) {
        return v < lo ? lo : (v > hi ? hi : v);
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function dist(x1, y1, x2, y2) {
        return Math.hypot(x2 - x1, y2 - y1);
    }

    function randRange(lo, hi) {
        return lo + Math.random() * (hi - lo);
    }

    function randInt(lo, hi) {
        return Math.floor(lo + Math.random() * (hi - lo + 1));
    }

    function wrapAngle(a) {
        let r = a % TAU;
        if (r > Math.PI) r -= TAU;
        if (r < -Math.PI) r += TAU;
        return r;
    }

    function resolveAsset(rel) {
        const base = (typeof global.COSMIC_BASE === 'string') ? global.COSMIC_BASE : '';
        return base + rel;
    }

    function isStoryMode(ctx) {
        if (!ctx) return false;
        return ctx.isStory !== undefined ? Boolean(ctx.isStory) : Boolean(ctx.chapterId || ctx.chapterTarget);
    }

    function isTurkish(ctx) {
        const raw = (ctx && ctx.lang) || (global.CosmicI18n && global.CosmicI18n.getLang && global.CosmicI18n.getLang()) || 'en';
        return String(raw).toLowerCase().startsWith('tr');
    }

    function L(ctx, tr, en) {
        if (ctx && typeof ctx.t === 'function') return ctx.t(tr, en);
        return isTurkish(ctx) ? tr : en;
    }

    function playSfx(ctx, key, jitter) {
        try {
            if (ctx && ctx.audio && typeof ctx.audio.play === 'function') {
                ctx.audio.play(key, jitter);
            }
        } catch (_) { /* safe ignore */ }
    }

    function unlockAudio(ctx) {
        try {
            if (ctx && ctx.audio && typeof ctx.audio.unlock === 'function') {
                ctx.audio.unlock();
            }
        } catch (_) { /* safe ignore */ }
    }

    function isFormElement(el) {
        return Boolean(el && /^(INPUT|TEXTAREA|SELECT|OPTION)$/i.test(el.tagName));
    }

    function stageCoordsFromEvent(el, e) {
        const rect = el.getBoundingClientRect();
        if (!rect.width || !rect.height) return { x: W * 0.5, y: H * 0.5 };
        return {
            x: clamp(((e.clientX - rect.left) / rect.width) * W, 0, W),
            y: clamp(((e.clientY - rect.top) / rect.height) * H, 0, H)
        };
    }

    function setupCanvas(ctx, kind, w, h) {
        const width = w || W;
        const height = h || H;
        const cnv = (ctx && typeof ctx.createCanvas === 'function')
            ? ctx.createCanvas(kind || '2d', width, height)
            : document.createElement('canvas');
        cnv.width = width;
        cnv.height = height;
        cnv.style.width = '100%';
        cnv.style.height = '100%';
        cnv.style.display = 'block';
        if (!cnv.parentNode && ctx && ctx.stageEl) {
            ctx.stageEl.appendChild(cnv);
        }
        return cnv;
    }

    function ensureStagePosition(stageEl) {
        if (!stageEl) return;
        try {
            if (global.getComputedStyle(stageEl).position === 'static') {
                stageEl.style.position = 'relative';
            }
        } catch (_) {
            stageEl.style.position = 'relative';
        }
    }

    function createListenerBag() {
        const list = [];
        return {
            on(target, evt, fn, opts) {
                if (!target || typeof target.addEventListener !== 'function') return;
                target.addEventListener(evt, fn, opts);
                list.push([target, evt, fn, opts]);
            },
            clear() {
                for (let i = list.length - 1; i >= 0; i--) {
                    const [target, evt, fn, opts] = list[i];
                    try { target.removeEventListener(evt, fn, opts); } catch (_) { /* ignore */ }
                }
                list.length = 0;
            }
        };
    }

    function ensureSprites(ctx, keys) {
        const map = Object.assign({}, (ctx && ctx.sprites) || {});
        if (typeof Image === 'undefined') return map;
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            if (map[k]) continue;
            const img = new Image();
            img.src = resolveAsset('assets/v11/sprites/' + k + '.png');
            map[k] = img;
        }
        return map;
    }

    function isSpriteReady(img) {
        if (!img) return false;
        if (typeof img.naturalWidth === 'number') {
            return img.complete && img.naturalWidth > 0;
        }
        return typeof img.width === 'number' && img.width > 0;
    }

    function drawSprite(g, sprites, key, x, y, w, h, opts) {
        const o = opts || {};
        const img = sprites && sprites[key];
        g.save();
        g.translate(x, y);
        if (o.angle) g.rotate(o.angle);
        if (o.flipX) g.scale(-1, 1);
        if (o.alpha !== undefined) g.globalAlpha = o.alpha;
        if (o.glow) {
            g.shadowColor = o.glow;
            g.shadowBlur = o.glowBlur !== undefined ? o.glowBlur : 12;
        }
        if (isSpriteReady(img)) {
            g.imageSmoothingEnabled = o.smooth !== undefined ? o.smooth : false;
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
                g.moveTo(0, -h * 0.45);
                g.lineTo(w * 0.42, h * 0.4);
                g.lineTo(-w * 0.42, h * 0.4);
                g.closePath();
                g.fill();
                g.stroke();
            } else if (o.fallbackShape === 'diamond') {
                g.beginPath();
                g.moveTo(0, -h * 0.46);
                g.lineTo(w * 0.44, 0);
                g.lineTo(0, h * 0.46);
                g.lineTo(-w * 0.44, 0);
                g.closePath();
                g.fill();
                g.stroke();
            } else {
                g.beginPath();
                g.arc(0, 0, Math.min(w, h) * 0.4, 0, TAU);
                g.fill();
                g.stroke();
            }
        }
        g.restore();
    }

    function drawRoundRect(g, x, y, w, h, r) {
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

    function drawPill(g, text, x, y, fg, bg, border) {
        g.save();
        g.font = '700 11px ' + FONT_MONO;
        const tw = g.measureText(text).width;
        const pw = tw + 18;
        const ph = 22;
        drawRoundRect(g, x, y, pw, ph, 11);
        g.fillStyle = bg || 'rgba(11, 18, 34, 0.88)';
        g.fill();
        g.lineWidth = 1;
        g.strokeStyle = border || 'rgba(56, 189, 248, 0.42)';
        g.stroke();
        g.fillStyle = fg || PAL.sky;
        g.textBaseline = 'middle';
        g.textAlign = 'left';
        g.fillText(text, x + 9, y + ph * 0.5 + 0.5);
        g.restore();
        return pw;
    }

    function drawProgressBar(g, x, y, w, h, pct, fg, bg, border) {
        const p = clamp(pct, 0, 1);
        g.save();
        drawRoundRect(g, x, y, w, h, h * 0.5);
        g.fillStyle = bg || 'rgba(15, 23, 42, 0.9)';
        g.fill();
        if (p > 0.005) {
            drawRoundRect(g, x + 1, y + 1, Math.max(4, (w - 2) * p), Math.max(2, h - 2), (h - 2) * 0.5);
            g.fillStyle = fg || PAL.mint;
            g.fill();
        }
        if (border) {
            drawRoundRect(g, x, y, w, h, h * 0.5);
            g.strokeStyle = border;
            g.lineWidth = 1;
            g.stroke();
        }
        g.restore();
    }

    function spawnBurstParticles(list, x, y, color, count, speed, size, life) {
        if (list.length > 260) return;
        const n = Math.min(count || 10, 260 - list.length);
        for (let i = 0; i < n; i++) {
            const ang = Math.random() * TAU;
            const spd = randRange(0.3, 1.0) * (speed || 130);
            const lf = (life || 0.45) * randRange(0.65, 1.15);
            list.push({
                x, y,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                color: color || PAL.sky,
                size: (size || 3) * randRange(0.65, 1.25),
                life: lf,
                maxLife: lf
            });
        }
    }

    function updateAndDrawParticles(g, list, dt) {
        for (let i = list.length - 1; i >= 0; i--) {
            const p = list[i];
            p.life -= dt;
            if (p.life <= 0) {
                list.splice(i, 1);
                continue;
            }
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vx *= 0.94;
            p.vy *= 0.94;
            const a = clamp(p.life / p.maxLife, 0, 1);
            g.save();
            g.globalAlpha = a;
            g.fillStyle = p.color;
            g.beginPath();
            g.arc(p.x, p.y, p.size * (0.4 + 0.6 * a), 0, TAU);
            g.fill();
            g.restore();
        }
    }

    function updateAndDrawFloatTexts(g, list, dt) {
        for (let i = list.length - 1; i >= 0; i--) {
            const f = list[i];
            f.life -= dt;
            if (f.life <= 0) {
                list.splice(i, 1);
                continue;
            }
            f.y += (f.vy || -36) * dt;
            const a = clamp(f.life / (f.maxLife * 0.55), 0, 1);
            g.save();
            g.globalAlpha = a;
            g.font = '700 ' + (f.size || 13) + 'px ' + FONT_MONO;
            g.textAlign = 'center';
            g.textBaseline = 'middle';
            g.fillStyle = 'rgba(2, 6, 23, 0.85)';
            g.fillText(f.text, f.x + 1, f.y + 1);
            g.fillStyle = f.color || PAL.white;
            g.fillText(f.text, f.x, f.y);
            g.restore();
        }
    }

    // =========================================================================
    // 1. ASTRAL ROGUELIKE CRAWL (window.ROT from vendor/rot.min.js)
    // =========================================================================
    Engines['astral-roguelike-crawl'] = function mountRoguelike(ctx) {
        const canvas = setupCanvas(ctx, '2d', W, H);
        const g = canvas.getContext('2d');
        const sprites = ensureSprites(ctx, [
            'exo_trooper', 'spider_bot', 'tactical_mech', 'reactor_node',
            'shield_battery', 'cryo_crystal', 'energy_prism', 'portal_vortex'
        ]);
        const bag = createListenerBag();
        const isStory = isStoryMode(ctx);
        const storyTarget = ctx.chapterTarget || 900;

        const GW = 44;
        const GH = 24;
        const TILE = 21;
        const OX = 18;
        const OY = 46;
        const NOVA_MAX_CD = 6;

        let destroyed = false;
        let ended = false;
        let rafId = 0;
        let lastTs = performance.now();
        let time = 0;

        let floor = 1;
        let score = 0;
        let kills = 0;
        let relicsCollected = 0;
        let novaCd = 0;
        let shakeTimer = 0;
        let novaWave = null;
        let clickPath = [];
        let clickPathTimer = 0;
        let waitHealCounter = 0;

        const tiles = new Uint8Array(GW * GH); // 0=floor, 1=wall, 2=closedDoor, 3=openDoor
        const visible = new Uint8Array(GW * GH);
        const explored = new Uint8Array(GW * GH);
        const visAlpha = new Float32Array(GW * GH);

        const player = { x: 2, y: 2, vx: 2, vy: 2, hp: 100, maxHp: 100, atk: 11, hitFlash: 0, facing: 1 };
        let stairs = { x: 4, y: 4 };
        let enemies = [];
        let items = [];
        const particles = [];
        const floatTexts = [];
        let logMsg = L(ctx, 'ROT.js Digger sektörü tarandı. Warp Asansörünü (>) bul!', 'ROT.js Digger deck mapped. Reach the Warp Elevator (>)!');

        const idx = (x, y) => y * GW + x;
        const inBounds = (x, y) => x >= 0 && y >= 0 && x < GW && y < GH;

        function isTransparent(x, y) {
            if (!inBounds(x, y)) return false;
            const t = tiles[idx(x, y)];
            return t === 0 || t === 3;
        }

        function isPassable(x, y) {
            if (!inBounds(x, y)) return false;
            const t = tiles[idx(x, y)];
            return t === 0 || t === 3;
        }

        function enemyAt(x, y) {
            for (let i = 0; i < enemies.length; i++) {
                if (enemies[i].hp > 0 && enemies[i].x === x && enemies[i].y === y) return enemies[i];
            }
            return null;
        }

        function computeFov() {
            visible.fill(0);
            visAlpha.fill(0);
            const ROT = global.ROT;
            if (ROT && ROT.FOV && ROT.FOV.PreciseShadowcasting) {
                const fov = new ROT.FOV.PreciseShadowcasting(isTransparent);
                fov.compute(player.x, player.y, 8, (x, y, r, vis) => {
                    if (!inBounds(x, y) || vis <= 0) return;
                    const id = idx(x, y);
                    visible[id] = 1;
                    explored[id] = 1;
                    visAlpha[id] = clamp(1.08 - r * 0.08, 0.35, 1.0);
                });
            } else {
                for (let dy = -7; dy <= 7; dy++) {
                    for (let dx = -7; dx <= 7; dx++) {
                        const tx = player.x + dx;
                        const ty = player.y + dy;
                        if (inBounds(tx, ty) && dx * dx + dy * dy <= 52) {
                            const id = idx(tx, ty);
                            visible[id] = 1;
                            explored[id] = 1;
                            visAlpha[id] = 0.85;
                        }
                    }
                }
            }
        }

        function buildFallbackDiggerMap() {
            tiles.fill(1);
            const rooms = [];
            for (let i = 0; i < 7; i++) {
                const rw = randInt(5, 8);
                const rh = randInt(4, 6);
                const rx = randInt(2, GW - rw - 3);
                const ry = randInt(2, GH - rh - 3);
                for (let y = ry; y < ry + rh; y++) {
                    for (let x = rx; x < rx + rw; x++) tiles[idx(x, y)] = 0;
                }
                rooms.push({ cx: rx + (rw >> 1), cy: ry + (rh >> 1), rx, ry, rw, rh });
            }
            for (let i = 1; i < rooms.length; i++) {
                let x = rooms[i - 1].cx;
                let y = rooms[i - 1].cy;
                const tx = rooms[i].cx;
                const ty = rooms[i].cy;
                while (x !== tx) { tiles[idx(x, y)] = 0; x += x < tx ? 1 : -1; }
                while (y !== ty) { tiles[idx(x, y)] = 0; y += y < ty ? 1 : -1; }
            }
            return rooms;
        }

        function generateFloor(fl) {
            tiles.fill(1);
            visible.fill(0);
            explored.fill(0);
            enemies = [];
            items = [];
            clickPath = [];

            const ROT = global.ROT;
            let roomCenters = [];

            if (ROT && ROT.Map && ROT.Map.Digger) {
                const digger = new ROT.Map.Digger(GW, GH, {
                    roomWidth: [4, 8],
                    roomHeight: [3, 6],
                    corridorLength: [2, 5],
                    dugPercentage: 0.37
                });
                digger.create((x, y, val) => {
                    if (inBounds(x, y)) tiles[idx(x, y)] = val ? 1 : 0;
                });
                const rooms = digger.getRooms() || [];
                for (let i = 0; i < rooms.length; i++) {
                    const rm = rooms[i];
                    const c = rm.getCenter();
                    roomCenters.push({
                        cx: c[0], cy: c[1],
                        left: rm.getLeft(), right: rm.getRight(),
                        top: rm.getTop(), bottom: rm.getBottom()
                    });
                    if (typeof rm.getDoors === 'function') {
                        rm.getDoors((dx, dy) => {
                            if (!inBounds(dx, dy) || tiles[idx(dx, dy)] !== 0) return;
                            const nsWall = tiles[idx(dx, dy - 1)] === 1 && tiles[idx(dx, dy + 1)] === 1 &&
                                           tiles[idx(dx - 1, dy)] === 0 && tiles[idx(dx + 1, dy)] === 0;
                            const ewWall = tiles[idx(dx - 1, dy)] === 1 && tiles[idx(dx + 1, dy)] === 1 &&
                                           tiles[idx(dx, dy - 1)] === 0 && tiles[idx(dx, dy + 1)] === 0;
                            if ((nsWall || ewWall) && Math.random() < 0.72) {
                                tiles[idx(dx, dy)] = 2; // closed airlock door
                            }
                        });
                    }
                }
            } else {
                roomCenters = buildFallbackDiggerMap();
            }

            if (!roomCenters.length) {
                roomCenters = [{ cx: 6, cy: 6, left: 4, right: 8, top: 4, bottom: 8 }];
            }

            const startRoom = roomCenters[0];
            player.x = startRoom.cx;
            player.y = startRoom.cy;
            player.vx = player.x;
            player.vy = player.y;

            // Ensure player tile isn't a door
            tiles[idx(player.x, player.y)] = 0;

            // Furthest room (or floor cell) hosts Warp Elevator (>)
            let bestRoom = roomCenters[roomCenters.length - 1];
            let bestD = -1;
            for (let i = 1; i < roomCenters.length; i++) {
                const rc = roomCenters[i];
                const d = Math.abs(rc.cx - player.x) + Math.abs(rc.cy - player.y);
                if (d > bestD) {
                    bestD = d;
                    bestRoom = rc;
                }
            }
            stairs = { x: bestRoom.cx, y: bestRoom.cy };
            if (stairs.x === player.x && stairs.y === player.y) {
                let farDist = -1;
                for (let y = 1; y < GH - 1; y++) {
                    for (let x = 1; x < GW - 1; x++) {
                        if (tiles[idx(x, y)] === 0) {
                            const d = Math.abs(x - player.x) + Math.abs(y - player.y);
                            if (d > farDist) { farDist = d; stairs = { x, y }; }
                        }
                    }
                }
            }
            tiles[idx(stairs.x, stairs.y)] = 0;

            // Collect walkable floor cells excluding player and stairs
            const floorCells = [];
            for (let y = 1; y < GH - 1; y++) {
                for (let x = 1; x < GW - 1; x++) {
                    if (tiles[idx(x, y)] === 0 && (x !== player.x || y !== player.y) && (x !== stairs.x || y !== stairs.y)) {
                        floorCells.push({ x, y });
                    }
                }
            }

            const occupied = new Set([player.x + ',' + player.y, stairs.x + ',' + stairs.y]);
            const popFreeNear = (cx, cy, maxR) => {
                for (let tries = 0; tries < 24; tries++) {
                    const tx = cx + randInt(-maxR, maxR);
                    const ty = cy + randInt(-maxR, maxR);
                    const key = tx + ',' + ty;
                    if (inBounds(tx, ty) && tiles[idx(tx, ty)] === 0 && !occupied.has(key)) {
                        occupied.add(key);
                        return { x: tx, y: ty };
                    }
                }
                return null;
            };

            // Guardian Reactor Node near Warp Elevator
            const guardPos = popFreeNear(stairs.x, stairs.y, 2);
            if (guardPos) {
                enemies.push({
                    kind: 'node', sprite: 'reactor_node',
                    x: guardPos.x, y: guardPos.y, vx: guardPos.x, vy: guardPos.y,
                    hp: 20 + fl * 7, maxHp: 20 + fl * 7, atk: 7 + fl * 2,
                    xp: 160, alerted: false, hitFlash: 0
                });
            }

            // Room Patrols & Relics
            const enemyCount = Math.min(22, 6 + fl * 2);
            for (let i = 0; i < enemyCount && floorCells.length; i++) {
                const cell = floorCells[randInt(0, floorCells.length - 1)];
                const key = cell.x + ',' + cell.y;
                if (occupied.has(key)) continue;
                if (Math.abs(cell.x - player.x) + Math.abs(cell.y - player.y) < 6) continue;
                occupied.add(key);
                const isMech = (i % 4 === 3) || (fl >= 2 && Math.random() < 0.25);
                enemies.push({
                    kind: isMech ? 'mech' : 'spider',
                    sprite: isMech ? 'tactical_mech' : 'spider_bot',
                    x: cell.x, y: cell.y, vx: cell.x, vy: cell.y,
                    hp: isMech ? (22 + fl * 8) : (12 + fl * 4),
                    maxHp: isMech ? (22 + fl * 8) : (12 + fl * 4),
                    atk: isMech ? (8 + fl * 3) : (5 + fl * 2),
                    xp: isMech ? 130 : 75,
                    alerted: false, hitFlash: 0
                });
            }

            // Medkits & Quantum Relics
            const medCount = 3 + Math.min(2, fl >> 1);
            for (let i = 0; i < medCount && floorCells.length; i++) {
                const cell = floorCells[randInt(0, floorCells.length - 1)];
                const key = cell.x + ',' + cell.y;
                if (occupied.has(key)) continue;
                occupied.add(key);
                items.push({ kind: 'medkit', sprite: 'shield_battery', x: cell.x, y: cell.y });
            }

            const relicCount = 4 + Math.min(4, fl);
            for (let i = 0; i < relicCount && floorCells.length; i++) {
                const cell = floorCells[randInt(0, floorCells.length - 1)];
                const key = cell.x + ',' + cell.y;
                if (occupied.has(key)) continue;
                occupied.add(key);
                items.push({
                    kind: 'relic',
                    sprite: (i % 2 === 0) ? 'cryo_crystal' : 'energy_prism',
                    x: cell.x, y: cell.y
                });
            }

            computeFov();
            syncHud();
        }

        function syncHud() {
            ctx.setHud({
                score,
                level: floor,
                maxLevel: isStory ? 2 : 99,
                lives: Math.max(0, player.hp),
                statusText: isStory
                    ? L(ctx, `Kat ${floor}/2 · Skor ${score}/${storyTarget}`, `Floor ${floor}/2 · Score ${score}/${storyTarget}`)
                    : L(ctx, `Derinlik ${floor} · Kalıntı ${relicsCollected}`, `Depth ${floor} · Relics ${relicsCollected}`)
            });
        }

        function checkWinCondition() {
            if (ended) return;
            if (isStory && (floor >= 3 || score >= storyTarget)) {
                ended = true;
                playSfx(ctx, 'levelup');
                ctx.onWin({
                    score,
                    level: Math.min(2, floor),
                    stars: player.hp >= 65 ? 3 : 2,
                    reason: L(ctx, 'Astral güverteler temizlendi ve Warp Asansörüne ulaşıldı!', 'Astral decks cleared and Warp Elevator secured!')
                });
            }
        }

        function damageEnemy(e, dmg, sourceLabel) {
            e.hp -= dmg;
            e.hitFlash = 0.22;
            e.alerted = true;
            const px = OX + (e.x + 0.5) * TILE;
            const py = OY + (e.y + 0.5) * TILE;
            floatTexts.push({ x: px, y: py - 10, text: '-' + dmg, color: sourceLabel === 'nova' ? PAL.cyan : PAL.gold, life: 0.65, maxLife: 0.65 });
            spawnBurstParticles(particles, px, py, sourceLabel === 'nova' ? PAL.cyan : PAL.amber, 9, 120, 3, 0.35);
            if (e.hp <= 0) {
                kills++;
                score += e.xp;
                playSfx(ctx, 'explodeSmall', 0.14);
                spawnBurstParticles(particles, px, py, PAL.coral, 16, 170, 3.6, 0.45);
                logMsg = L(ctx, `Hedef imha edildi (+${e.xp} puan)`, `Hostile purged (+${e.xp} pts)`);
                checkWinCondition();
            } else {
                playSfx(ctx, 'hitMetal', 0.12);
            }
        }

        function runEnemyTurns() {
            if (ended) return;
            enemies = enemies.filter(e => e.hp > 0);
            if (!enemies.length) return;

            const ROT = global.ROT;
            let dijkstra = null;
            if (ROT && ROT.Path && ROT.Path.Dijkstra) {
                dijkstra = new ROT.Path.Dijkstra(player.x, player.y, (x, y) => isPassable(x, y), { topology: 4 });
            }

            const blocked = new Set();
            for (let i = 0; i < enemies.length; i++) {
                blocked.add(enemies[i].x + ',' + enemies[i].y);
            }

            for (let i = 0; i < enemies.length; i++) {
                const e = enemies[i];
                const dMan = Math.abs(e.x - player.x) + Math.abs(e.y - player.y);
                if (visible[idx(e.x, e.y)]) e.alerted = true;
                if (!e.alerted && dMan > 9) continue;

                if (dMan === 1) {
                    const dmg = Math.max(2, e.atk - randInt(0, 2));
                    player.hp = Math.max(0, player.hp - dmg);
                    player.hitFlash = 0.28;
                    shakeTimer = 0.18;
                    clickPath = [];
                    playSfx(ctx, 'playerHurt');
                    const ppx = OX + (player.x + 0.5) * TILE;
                    const ppy = OY + (player.y + 0.5) * TILE;
                    floatTexts.push({ x: ppx, y: ppy - 12, text: '-' + dmg + ' HP', color: PAL.coral, life: 0.75, maxLife: 0.75 });
                    spawnBurstParticles(particles, ppx, ppy, PAL.coral, 10, 140, 3, 0.35);
                    logMsg = L(ctx, `Düşman saldırısı! -${dmg} HP`, `Hull breach! -${dmg} HP`);
                    if (player.hp <= 0) {
                        ended = true;
                        syncHud();
                        ctx.onGameOver({
                            score,
                            level: floor,
                            reason: L(ctx, `Kat ${floor} zindanında zırh tükendi.`, `Exo-armor failed on Deck ${floor}.`)
                        });
                        return;
                    }
                    continue;
                }

                if (e.kind === 'node') {
                    // Stationary reactor guard: pulses range shock if player within 2 tiles
                    if (dMan <= 2 && visible[idx(e.x, e.y)] && Math.random() < 0.5) {
                        const zap = 4 + floor;
                        player.hp = Math.max(0, player.hp - zap);
                        player.hitFlash = 0.22;
                        const ppx = OX + (player.x + 0.5) * TILE;
                        const ppy = OY + (player.y + 0.5) * TILE;
                        floatTexts.push({ x: ppx, y: ppy - 12, text: '-' + zap + ' ARC', color: PAL.magenta, life: 0.7, maxLife: 0.7 });
                        playSfx(ctx, 'hitShield');
                        if (player.hp <= 0) {
                            ended = true;
                            syncHud();
                            ctx.onGameOver({ score, level: floor, reason: L(ctx, 'Reaktör arkı kalkanı aştı.', 'Reactor arc overloaded exo-suit.') });
                            return;
                        }
                    }
                    continue;
                }

                // ROT.Path.Dijkstra smart hunter pathfinding
                let nx = e.x;
                let ny = e.y;
                if (dijkstra) {
                    const stepList = [];
                    dijkstra.compute(e.x, e.y, (px, py) => stepList.push([px, py]));
                    if (stepList.length >= 2) {
                        nx = stepList[1][0];
                        ny = stepList[1][1];
                    }
                } else {
                    const dx = Math.sign(player.x - e.x);
                    const dy = Math.sign(player.y - e.y);
                    if (Math.abs(player.x - e.x) >= Math.abs(player.y - e.y)) nx += dx;
                    else ny += dy;
                }

                const destKey = nx + ',' + ny;
                if ((nx !== player.x || ny !== player.y) && isPassable(nx, ny) && !blocked.has(destKey)) {
                    blocked.delete(e.x + ',' + e.y);
                    e.x = nx;
                    e.y = ny;
                    blocked.add(destKey);
                }
            }
        }

        function descendFloor() {
            score += 250 + floor * 50;
            floor++;
            player.hp = Math.min(player.maxHp, player.hp + 20);
            player.atk += 1;
            novaCd = Math.max(0, novaCd - 2);
            playSfx(ctx, 'levelup');
            logMsg = L(ctx, `Warp Asansörü Kat ${floor}'e indi! (+20 HP)`, `Warp Elevator descended to Deck ${floor}! (+20 HP)`);
            if (isStory && floor >= 3) {
                syncHud();
                checkWinCondition();
                return;
            }
            generateFloor(floor);
            checkWinCondition();
        }

        function performStep(dx, dy) {
            if (ended) return false;
            const nx = player.x + dx;
            const ny = player.y + dy;
            if (!inBounds(nx, ny)) return false;
            if (dx !== 0) player.facing = dx;

            const t = tiles[idx(nx, ny)];
            if (t === 1) return false; // wall

            // Closed airlock door -> bump-open
            if (t === 2) {
                tiles[idx(nx, ny)] = 3;
                playSfx(ctx, 'chestOpen', 0.1);
                logMsg = L(ctx, 'Hava kilidi açıldı.', 'Security bulkhead unlocked.');
                computeFov();
                runEnemyTurns();
                syncHud();
                return true;
            }

            // Enemy in target tile -> bump-attack
            const target = enemyAt(nx, ny);
            if (target) {
                const dmg = player.atk + randInt(0, 4);
                damageEnemy(target, dmg, 'melee');
                enemies = enemies.filter(e => e.hp > 0);
                if (novaCd > 0) novaCd--;
                runEnemyTurns();
                syncHud();
                return true;
            }

            // Move to open floor
            player.x = nx;
            player.y = ny;
            if (novaCd > 0) novaCd--;
            playSfx(ctx, 'uiClick', 0.18);

            // Check pickups
            for (let i = items.length - 1; i >= 0; i--) {
                const it = items[i];
                if (it.x === player.x && it.y === player.y) {
                    const px = OX + (it.x + 0.5) * TILE;
                    const py = OY + (it.y + 0.5) * TILE;
                    if (it.kind === 'medkit') {
                        const heal = Math.min(35, player.maxHp - player.hp);
                        player.hp += heal;
                        score += 40;
                        playSfx(ctx, 'powerup');
                        floatTexts.push({ x: px, y: py - 10, text: '+' + heal + ' HP', color: PAL.mint, life: 0.85, maxLife: 0.85 });
                        logMsg = L(ctx, `Medkit toplandı (+${heal} HP)`, `Medkit applied (+${heal} HP)`);
                    } else {
                        const pts = 120 + floor * 25;
                        score += pts;
                        relicsCollected++;
                        novaCd = Math.max(0, novaCd - 1);
                        playSfx(ctx, 'xpPickup');
                        floatTexts.push({ x: px, y: py - 10, text: '+' + pts, color: PAL.cyan, life: 0.85, maxLife: 0.85 });
                        logMsg = L(ctx, `Kuantum Kalıntısı alındı (+${pts})`, `Quantum Relic secured (+${pts})`);
                    }
                    spawnBurstParticles(particles, px, py, it.kind === 'medkit' ? PAL.mint : PAL.cyan, 12, 130, 3, 0.4);
                    items.splice(i, 1);
                }
            }

            computeFov();
            // Auto-descend on Warp Elevator
            if (player.x === stairs.x && player.y === stairs.y) {
                descendFloor();
                return true;
            }

            runEnemyTurns();
            syncHud();
            checkWinCondition();
            return true;
        }

        function triggerPlasmaNova() {
            if (ended) return;
            if (novaCd > 0) {
                logMsg = L(ctx, `Plazma Patlaması şarj oluyor (${novaCd} tur)`, `Plasma Nova recharging (${novaCd} turns)`);
                return;
            }
            novaCd = NOVA_MAX_CD;
            clickPath = [];
            playSfx(ctx, 'emp');
            shakeTimer = 0.22;
            const ppx = OX + (player.x + 0.5) * TILE;
            const ppy = OY + (player.y + 0.5) * TILE;
            novaWave = { x: ppx, y: ppy, r: 8, maxR: TILE * 3.1, life: 0.35, maxLife: 0.35 };
            spawnBurstParticles(particles, ppx, ppy, PAL.cyan, 26, 220, 3.8, 0.5);

            // Open adjacent closed doors & blast enemies within radius 2.6
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const tx = player.x + dx;
                    const ty = player.y + dy;
                    if (inBounds(tx, ty) && tiles[idx(tx, ty)] === 2) {
                        tiles[idx(tx, ty)] = 3;
                    }
                }
            }

            const dmg = 22 + floor * 6;
            let hitCount = 0;
            for (let i = 0; i < enemies.length; i++) {
                const e = enemies[i];
                if (Math.hypot(e.x - player.x, e.y - player.y) <= 2.75) {
                    damageEnemy(e, dmg, 'nova');
                    hitCount++;
                }
            }
            enemies = enemies.filter(e => e.hp > 0);
            logMsg = hitCount > 0
                ? L(ctx, `Plazma Novası ${hitCount} düşmanı vurdu!`, `Plasma Nova blasted ${hitCount} hostiles!`)
                : L(ctx, 'Plazma Novası ateşlendi!', 'Plasma Nova discharged!');
            computeFov();
            runEnemyTurns();
            syncHud();
            checkWinCondition();
        }

        function waitOneTurn() {
            if (ended) return;
            if (novaCd > 0) novaCd--;
            waitHealCounter++;
            if (waitHealCounter >= 3 && player.hp < player.maxHp) {
                waitHealCounter = 0;
                player.hp = Math.min(player.maxHp, player.hp + 2);
            }
            runEnemyTurns();
            syncHud();
        }

        bag.on(window, 'keydown', (e) => {
            if (destroyed || ended || ctx.getPaused() || isFormElement(e.target)) return;
            unlockAudio(ctx);
            const k = (e.key || '').toLowerCase();
            if (k === 'w' || e.key === 'ArrowUp') { e.preventDefault(); clickPath = []; performStep(0, -1); }
            else if (k === 's' || e.key === 'ArrowDown') { e.preventDefault(); clickPath = []; performStep(0, 1); }
            else if (k === 'a' || e.key === 'ArrowLeft') { e.preventDefault(); clickPath = []; performStep(-1, 0); }
            else if (k === 'd' || e.key === 'ArrowRight') { e.preventDefault(); clickPath = []; performStep(1, 0); }
            else if (e.code === 'Space' || k === 'e') { e.preventDefault(); triggerPlasmaNova(); }
            else if (k === '.' || k === 'x') { e.preventDefault(); clickPath = []; waitOneTurn(); }
        });

        bag.on(canvas, 'pointerdown', (e) => {
            if (destroyed || ended || ctx.getPaused()) return;
            unlockAudio(ctx);
            const pos = stageCoordsFromEvent(canvas, e);

            // Check bottom action pill clicks
            if (pos.y >= 550 && pos.x >= 720 && pos.x <= 865) {
                triggerPlasmaNova();
                return;
            }
            if (pos.y >= 550 && pos.x > 865) {
                clickPath = [];
                waitOneTurn();
                return;
            }

            const tx = Math.floor((pos.x - OX) / TILE);
            const ty = Math.floor((pos.y - OY) / TILE);
            if (!inBounds(tx, ty)) return;

            if (tx === player.x && ty === player.y) {
                if (player.x === stairs.x && player.y === stairs.y) descendFloor();
                else waitOneTurn();
                return;
            }

            // Direct adjacent click
            if (Math.abs(tx - player.x) + Math.abs(ty - player.y) === 1) {
                clickPath = [];
                performStep(tx - player.x, ty - player.y);
                return;
            }

            if (!explored[idx(tx, ty)]) return;
            const ROT = global.ROT;
            if (ROT && ROT.Path && ROT.Path.Dijkstra) {
                const path = [];
                const dPath = new ROT.Path.Dijkstra(tx, ty, (x, y) => {
                    if (!inBounds(x, y)) return false;
                    if (x === tx && y === ty) return tiles[idx(x, y)] !== 1;
                    return explored[idx(x, y)] && tiles[idx(x, y)] !== 1;
                }, { topology: 4 });
                dPath.compute(player.x, player.y, (px, py) => path.push([px, py]));
                if (path.length >= 2) {
                    clickPath = path.slice(1);
                    clickPathTimer = 0;
                }
            }
        });

        function render(dt) {
            time += dt;
            if (shakeTimer > 0) shakeTimer = Math.max(0, shakeTimer - dt);
            if (player.hitFlash > 0) player.hitFlash = Math.max(0, player.hitFlash - dt);

            player.vx = lerp(player.vx, player.x, clamp(dt * 20, 0, 1));
            player.vy = lerp(player.vy, player.y, clamp(dt * 20, 0, 1));
            for (let i = 0; i < enemies.length; i++) {
                const e = enemies[i];
                e.vx = lerp(e.vx, e.x, clamp(dt * 18, 0, 1));
                e.vy = lerp(e.vy, e.y, clamp(dt * 18, 0, 1));
                if (e.hitFlash > 0) e.hitFlash = Math.max(0, e.hitFlash - dt);
            }

            // Process auto click-to-move queue
            if (clickPath.length && !ended) {
                clickPathTimer -= dt;
                if (clickPathTimer <= 0) {
                    clickPathTimer = 0.095;
                    const next = clickPath.shift();
                    const dx = next[0] - player.x;
                    const dy = next[1] - player.y;
                    const prevHp = player.hp;
                    const hadVisibleEnemy = enemies.some(e => visible[idx(e.x, e.y)]);
                    if (!performStep(dx, dy) || player.hp < prevHp) {
                        clickPath = [];
                    } else if (!hadVisibleEnemy && enemies.some(e => visible[idx(e.x, e.y)])) {
                        clickPath = [];
                        logMsg = L(ctx, 'Görüş alanında düşman tespit edildi!', 'Hostile spotted in FOV!');
                    }
                }
            }

            g.save();
            if (shakeTimer > 0) {
                g.translate(randRange(-4, 4), randRange(-4, 4));
            }

            // Backdrop
            g.fillStyle = '#040710';
            g.fillRect(0, 0, W, H);

            // Map Grid
            for (let y = 0; y < GH; y++) {
                for (let x = 0; x < GW; x++) {
                    const id = idx(x, y);
                    const px = OX + x * TILE;
                    const py = OY + y * TILE;
                    if (!explored[id]) {
                        g.fillStyle = ((x + y) & 1) ? '#050813' : '#060a17';
                        g.fillRect(px, py, TILE, TILE);
                        continue;
                    }

                    const isVis = visible[id] === 1;
                    const light = isVis ? visAlpha[id] : 0.25;
                    const t = tiles[id];

                    if (t === 1) {
                        g.fillStyle = isVis ? `rgba(30, 52, 86, ${0.5 + light * 0.48})` : '#0e172a';
                        g.fillRect(px, py, TILE, TILE);
                        g.strokeStyle = isVis ? `rgba(56, 189, 248, ${0.28 * light})` : 'rgba(51, 65, 85, 0.28)';
                        g.lineWidth = 1;
                        g.strokeRect(px + 1, py + 1, TILE - 2, TILE - 2);
                        // Tech panel inner line
                        if ((x + y) % 3 === 0) {
                            g.fillStyle = isVis ? `rgba(56, 189, 248, ${0.14 * light})` : 'rgba(148, 163, 184, 0.06)';
                            g.fillRect(px + 5, py + 8, TILE - 10, 2);
                        }
                    } else {
                        g.fillStyle = isVis ? `rgba(14, 27, 48, ${0.68 + light * 0.32})` : '#091120';
                        g.fillRect(px, py, TILE, TILE);
                        g.strokeStyle = isVis ? `rgba(56, 189, 248, ${0.09 * light})` : 'rgba(30, 41, 59, 0.24)';
                        g.lineWidth = 1;
                        g.strokeRect(px + 0.5, py + 0.5, TILE - 1, TILE - 1);

                        if (isVis && ((x * 7 + y * 13) % 11 === 0)) {
                            g.fillStyle = `rgba(34, 211, 238, ${0.18 * light})`;
                            g.fillRect(px + TILE * 0.5 - 1, py + TILE * 0.5 - 1, 2, 2);
                        }

                        if (t === 2) {
                            // Closed security door
                            g.fillStyle = isVis ? '#f59e0b' : '#78350f';
                            g.fillRect(px + 2, py + 2, TILE - 4, TILE - 4);
                            g.strokeStyle = '#fef3c7';
                            g.strokeRect(px + 5, py + 5, TILE - 10, TILE - 10);
                        } else if (t === 3) {
                            // Open airlock frame
                            g.strokeStyle = isVis ? 'rgba(52, 211, 153, 0.45)' : 'rgba(52, 211, 153, 0.16)';
                            g.strokeRect(px + 2, py + 2, TILE - 4, TILE - 4);
                        }
                    }
                }
            }

            // Click-to-move preview dots
            if (clickPath.length) {
                g.save();
                g.fillStyle = 'rgba(56, 189, 248, 0.42)';
                for (let i = 0; i < clickPath.length; i++) {
                    const [cx, cy] = clickPath[i];
                    g.beginPath();
                    g.arc(OX + (cx + 0.5) * TILE, OY + (cy + 0.5) * TILE, 2.6, 0, TAU);
                    g.fill();
                }
                g.restore();
            }

            // Warp Elevator (>)
            const stId = idx(stairs.x, stairs.y);
            if (explored[stId]) {
                const sx = OX + (stairs.x + 0.5) * TILE;
                const sy = OY + (stairs.y + 0.5) * TILE;
                const stVis = visible[stId] === 1;
                g.save();
                g.globalAlpha = stVis ? 1 : 0.42;
                const pulse = 0.75 + 0.25 * Math.sin(time * 4.5);
                g.strokeStyle = PAL.cyan;
                g.lineWidth = 2;
                g.beginPath();
                g.arc(sx, sy, TILE * 0.42 * pulse, 0, TAU);
                g.stroke();
                drawSprite(g, sprites, 'portal_vortex', sx, sy, TILE * 1.05, TILE * 1.05, {
                    angle: time * 1.8, glow: PAL.cyan, glowBlur: 10
                });
                g.font = '700 12px ' + FONT_MONO;
                g.fillStyle = PAL.white;
                g.textAlign = 'center';
                g.textBaseline = 'middle';
                g.fillText('>', sx, sy + 0.5);
                g.restore();
            }

            // Items (visible or remembered)
            for (let i = 0; i < items.length; i++) {
                const it = items[i];
                const id = idx(it.x, it.y);
                if (!explored[id]) continue;
                const ix = OX + (it.x + 0.5) * TILE;
                const iy = OY + (it.y + 0.5) * TILE + Math.sin(time * 3.4 + i) * 1.4;
                const isVis = visible[id] === 1;
                drawSprite(g, sprites, it.sprite, ix, iy, TILE * 0.88, TILE * 0.88, {
                    alpha: isVis ? 1 : 0.35,
                    glow: isVis ? (it.kind === 'medkit' ? PAL.mint : PAL.cyan) : null,
                    glowBlur: 8
                });
            }

            // Enemies (only in active FOV!)
            for (let i = 0; i < enemies.length; i++) {
                const e = enemies[i];
                if (!visible[idx(e.x, e.y)]) continue;
                const ex = OX + (e.vx + 0.5) * TILE;
                const ey = OY + (e.vy + 0.5) * TILE;
                const sz = e.kind === 'mech' ? TILE * 1.06 : TILE * 0.92;
                drawSprite(g, sprites, e.sprite, ex, ey, sz, sz, {
                    glow: e.kind === 'node' ? PAL.magenta : PAL.coral,
                    glowBlur: 8,
                    hitFlash: e.hitFlash > 0,
                    fallbackColor: PAL.coral
                });
                if (e.hp < e.maxHp) {
                    drawProgressBar(g, ex - 9, ey - 13, 18, 4, e.hp / e.maxHp, PAL.coral, 'rgba(0,0,0,0.7)');
                }
            }

            // Player (exo_trooper)
            const plX = OX + (player.vx + 0.5) * TILE;
            const plY = OY + (player.vy + 0.5) * TILE;
            if (novaCd === 0) {
                g.save();
                g.strokeStyle = 'rgba(34, 211, 238, 0.45)';
                g.lineWidth = 1.5;
                g.beginPath();
                g.arc(plX, plY, TILE * 0.54 + Math.sin(time * 5) * 1.5, 0, TAU);
                g.stroke();
                g.restore();
            }
            drawSprite(g, sprites, 'exo_trooper', plX, plY, TILE * 1.08, TILE * 1.08, {
                flipX: player.facing < 0,
                glow: player.hitFlash > 0 ? PAL.coral : PAL.sky,
                glowBlur: 12,
                hitFlash: player.hitFlash > 0,
                fallbackColor: PAL.sky
            });

            // Plasma Nova Wave
            if (novaWave) {
                novaWave.life -= dt;
                if (novaWave.life <= 0) {
                    novaWave = null;
                } else {
                    const p = 1 - novaWave.life / novaWave.maxLife;
                    g.save();
                    g.globalAlpha = 1 - p;
                    g.strokeStyle = PAL.cyan;
                    g.lineWidth = 4 * (1 - p) + 1;
                    g.beginPath();
                    g.arc(novaWave.x, novaWave.y, lerp(8, novaWave.maxR, p), 0, TAU);
                    g.stroke();
                    g.restore();
                }
            }

            updateAndDrawParticles(g, particles, dt);
            updateAndDrawFloatTexts(g, floatTexts, dt);

            // Top HUD Bar
            g.fillStyle = 'rgba(7, 11, 22, 0.94)';
            g.fillRect(0, 0, W, 42);
            g.strokeStyle = 'rgba(56, 189, 248, 0.25)';
            g.beginPath();
            g.moveTo(0, 42);
            g.lineTo(W, 42);
            g.stroke();

            let hx = 14;
            hx += drawPill(g, `ROT.JS · DECK ${floor}${isStory ? '/2' : ''}`, hx, 10, PAL.sky) + 10;

            g.font = '700 11px ' + FONT_MONO;
            g.fillStyle = PAL.muted;
            g.textBaseline = 'middle';
            g.fillText('HP', hx, 21);
            drawProgressBar(g, hx + 24, 15, 118, 12, player.hp / player.maxHp, player.hp > 35 ? PAL.mint : PAL.coral, '#0f172a', 'rgba(148,163,184,0.3)');
            g.fillStyle = PAL.white;
            g.fillText(`${player.hp}/${player.maxHp}`, hx + 148, 21);
            hx += 216;

            g.fillStyle = PAL.muted;
            g.fillText('NOVA [SPC]', hx, 21);
            drawProgressBar(g, hx + 76, 15, 86, 12, 1 - novaCd / NOVA_MAX_CD, novaCd === 0 ? PAL.cyan : PAL.amber, '#0f172a', 'rgba(148,163,184,0.3)');
            g.fillStyle = novaCd === 0 ? PAL.cyan : PAL.amber;
            g.fillText(novaCd === 0 ? 'READY' : novaCd + 'T', hx + 168, 21);

            drawPill(g, `KILLS ${kills} · RELICS ${relicsCollected}`, W - 210, 10, PAL.gold, 'rgba(250, 204, 21, 0.1)', 'rgba(250, 204, 21, 0.35)');

            // Bottom Bar
            g.fillStyle = 'rgba(7, 11, 22, 0.94)';
            g.fillRect(0, 550, W, 30);
            g.font = '600 12px ' + FONT_MONO;
            g.fillStyle = PAL.sky;
            g.textBaseline = 'middle';
            g.fillText('> ' + logMsg, 18, 565);

            drawPill(g, '[SPC] NOVA', 722, 554, novaCd === 0 ? PAL.cyan : PAL.muted, 'rgba(34,211,238,0.12)', 'rgba(34,211,238,0.4)');
            drawPill(g, '[.] WAIT', 868, 554, PAL.white, 'rgba(148,163,184,0.12)', 'rgba(148,163,184,0.3)');

            g.restore();
        }

        function loop(now) {
            if (destroyed) return;
            const dt = Math.min(0.05, Math.max(0.001, (now - lastTs) / 1000));
            lastTs = now;
            if (!ctx.getPaused()) {
                render(dt);
            }
            rafId = global.requestAnimationFrame(loop);
        }

        generateFloor(1);
        rafId = global.requestAnimationFrame(loop);

        return {
            restart(lv) {
                ended = false;
                floor = Math.max(1, Number(lv) || 1);
                score = 0;
                kills = 0;
                relicsCollected = 0;
                novaCd = 0;
                shakeTimer = 0;
                novaWave = null;
                clickPath = [];
                player.hp = 100;
                player.hitFlash = 0;
                player.atk = 11 + (floor - 1);
                particles.length = 0;
                floatTexts.length = 0;
                generateFloor(floor);
            },
            destroy() {
                destroyed = true;
                if (rafId) global.cancelAnimationFrame(rafId);
                bag.clear();
                if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
            }
        };
    };

    // =========================================================================
    // 2. LUA 5.3 CYBER DRONE OPS (window.fengari + lua/mission_kernel.lua)
    // =========================================================================
    const FALLBACK_MISSION_KERNEL_LUA = [
        'CHIP_PROFILES = {',
        '  hunter = {',
        '    name = "HUNTER-SEEKER.lua",',
        '    desc = "Aggressively tracks nearest rogue drone and fires rapid plasma.",',
        '    code = [[',
        'function step_ai(bx, by, hp, cooldown, tx, ty, tdist, nx, ny, ndist)',
        '  if cooldown <= 0 and tdist < 280 then',
        '    return "FIRE", tx, ty',
        '  end',
        '  if tdist < 420 then',
        '    return "CHASE", tx, ty',
        '  end',
        '  return "HOLD", nx, ny',
        'end',
        ']]',
        '  },',
        '  kiter = {',
        '    name = "ORBIT-KITER.lua",',
        '    desc = "Maintains safe perimeter ring while sniping incoming hostiles.",',
        '    code = [[',
        'function step_ai(bx, by, hp, cooldown, tx, ty, tdist, nx, ny, ndist)',
        '  if hp < 40 and ndist > 35 then',
        '    return "RETREAT", nx, ny',
        '  end',
        '  if tdist < 130 then',
        '    local rx = bx + (bx - tx)',
        '    local ry = by + (by - ty)',
        '    return "EVADE", rx, ry',
        '  end',
        '  if cooldown <= 0 and tdist < 320 then',
        '    return "FIRE", tx, ty',
        '  end',
        '  return "ORBIT", nx + 70, ny - 50',
        'end',
        ']]',
        '  },',
        '  guardian = {',
        '    name = "AEGIS-GUARD.lua",',
        '    desc = "Defends S.A.R.A. data core and deploys EMP pulse when swarmed.",',
        '    code = [[',
        'function step_ai(bx, by, hp, cooldown, tx, ty, tdist, nx, ny, ndist)',
        '  if tdist < 110 and cooldown <= 0 then',
        '    return "EMP", tx, ty',
        '  end',
        '  if ndist > 95 then',
        '    return "GUARD", nx, ny',
        '  end',
        '  if cooldown <= 0 and tdist < 260 then',
        '    return "FIRE", tx, ty',
        '  end',
        '  return "GUARD", nx, ny',
        'end',
        ']]',
        '  }',
        '}'
    ].join('\n');

    Engines['lua-cyber-ops'] = function mountLuaOps(ctx) {
        const canvas = setupCanvas(ctx, '2d', W, H);
        const g = canvas.getContext('2d');
        ensureStagePosition(ctx.stageEl);
        const sprites = ensureSprites(ctx, [
            'tactical_mech', 'reactor_node', 'spider_bot', 'alien_drone', 'ufo', 'shield_battery'
        ]);
        const bag = createListenerBag();
        const isStory = isStoryMode(ctx);
        const storyTarget = ctx.chapterTarget || 800;

        let destroyed = false;
        let ended = false;
        let rafId = 0;
        let lastTs = performance.now();
        let time = 0;

        // Lua 5.3 VM State
        let fengariRef = global.fengari || null;
        let LState = null;
        let luaReady = false;
        let vmStatusMsg = 'Booting Lua 5.3 VM...';
        let vmError = false;
        let activeChip = 'hunter';
        let activeLuaCode = '';
        let pcallPerSec = 0;
        let pcallCounter = 0;
        let pcallWindow = 0;
        const chipCodes = { hunter: '', kiter: '', guardian: '' };

        // Panel & HUD DOM
        let panelCollapsed = false;
        const panelRoot = document.createElement('div');
        panelRoot.style.cssText = 'position:absolute;top:10px;right:10px;width:288px;max-height:calc(100% - 20px);z-index:8;display:flex;flex-direction:column;gap:6px;background:rgba(8,14,28,0.92);border:1px solid rgba(52,211,153,0.45);border-radius:10px;padding:9px;color:#e2e8f0;font-family:' + FONT_MONO + ';font-size:11px;backdrop-filter:blur(6px);box-shadow:0 10px 28px rgba(0,0,0,0.65);pointer-events:auto;';

        const headerRow = document.createElement('div');
        headerRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:6px;';
        const titleSpan = document.createElement('span');
        titleSpan.style.cssText = 'font-weight:700;color:#34d399;letter-spacing:0.04em;font-size:11px;';
        titleSpan.textContent = 'LUA 5.3 FENGARI HUD';
        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.textContent = '▾';
        toggleBtn.style.cssText = 'background:rgba(52,211,153,0.14);border:1px solid rgba(52,211,153,0.4);color:#34d399;border-radius:5px;padding:2px 7px;cursor:pointer;font-weight:700;';
        headerRow.appendChild(titleSpan);
        headerRow.appendChild(toggleBtn);
        panelRoot.appendChild(headerRow);

        const bodyWrap = document.createElement('div');
        bodyWrap.style.cssText = 'display:flex;flex-direction:column;gap:6px;';

        const chipRow = document.createElement('div');
        chipRow.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:4px;';
        const chipBtns = {};
        ['hunter', 'kiter', 'guardian'].forEach((id) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.textContent = id.toUpperCase();
            b.style.cssText = 'padding:4px 3px;border-radius:5px;border:1px solid rgba(148,163,184,0.3);background:rgba(15,23,42,0.85);color:#cbd5e1;font-family:inherit;font-size:10px;font-weight:700;cursor:pointer;';
            chipBtns[id] = b;
            chipRow.appendChild(b);
        });
        bodyWrap.appendChild(chipRow);

        const codeArea = document.createElement('textarea');
        codeArea.spellcheck = false;
        codeArea.rows = 10;
        codeArea.style.cssText = 'width:100%;box-sizing:border-box;resize:vertical;min-height:132px;max-height:220px;background:#040812;color:#a7f3d0;border:1px solid rgba(56,189,248,0.3);border-radius:6px;padding:6px;font-family:' + FONT_MONO + ';font-size:10px;line-height:1.35;outline:none;';
        bodyWrap.appendChild(codeArea);

        const btnRow = document.createElement('div');
        btnRow.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:5px;';
        const runBtn = document.createElement('button');
        runBtn.type = 'button';
        runBtn.textContent = 'RUN LUA';
        runBtn.style.cssText = 'padding:5px 8px;border-radius:6px;border:1px solid rgba(52,211,153,0.65);background:rgba(52,211,153,0.2);color:#34d399;font-family:inherit;font-weight:700;font-size:10.5px;cursor:pointer;';
        const empBtn = document.createElement('button');
        empBtn.type = 'button';
        empBtn.textContent = 'EMP [SPACE]';
        empBtn.style.cssText = 'padding:5px 8px;border-radius:6px;border:1px solid rgba(56,189,248,0.55);background:rgba(56,189,248,0.16);color:#38bdf8;font-family:inherit;font-weight:700;font-size:10.5px;cursor:pointer;';
        btnRow.appendChild(runBtn);
        btnRow.appendChild(empBtn);
        bodyWrap.appendChild(btnRow);

        const statusLine = document.createElement('div');
        statusLine.style.cssText = 'font-size:10px;line-height:1.3;padding:4px 6px;border-radius:5px;background:rgba(4,8,18,0.85);border:1px solid rgba(148,163,184,0.2);color:#34d399;word-break:break-word;';
        statusLine.textContent = vmStatusMsg;
        bodyWrap.appendChild(statusLine);

        const tipLine = document.createElement('div');
        tipLine.style.cssText = 'font-size:9.5px;color:#94a3b8;';
        tipLine.textContent = L(ctx, 'Sol Tık: Taktik İşaret Koy · Sağ Tık: Çekirdeğe Dön', 'Click Arena: Place Rally Beacon · Right-Click: Recall');
        bodyWrap.appendChild(tipLine);

        panelRoot.appendChild(bodyWrap);
        if (ctx.stageEl) ctx.stageEl.appendChild(panelRoot);

        // Arena State
        let score = 0;
        let wave = 1;
        let waveSpawned = 0;
        let waveTotal = 8;
        let spawnTimer = 0.6;
        let empCd = 0;
        let shakeTimer = 0;

        const core = { x: 335, y: 290, hp: 150, maxHp: 150, hitFlash: 0 };
        const beacon = { active: false, x: 335, y: 290, timer: 0 };
        const mech = {
            x: 260, y: 290, vx: 0, vy: 0, hp: 100, maxHp: 100,
            fireCd: 0, empCd: 0, orbitAngle: 0, action: 'HOLD', tx: 335, ty: 290, hitFlash: 0
        };
        const wing = {
            x: 380, y: 240, vx: 0, vy: 0, hp: 100, maxHp: 100,
            fireCd: 0, orbitAngle: 1.5, action: 'ORBIT', tx: 335, ty: 290
        };
        const enemies = [];
        const bolts = [];
        const shockRings = [];
        const particles = [];
        const floatTexts = [];

        function updatePanelVisuals() {
            ['hunter', 'kiter', 'guardian'].forEach((id) => {
                const b = chipBtns[id];
                const on = id === activeChip;
                b.style.borderColor = on ? '#34d399' : 'rgba(148,163,184,0.3)';
                b.style.background = on ? 'rgba(52,211,153,0.22)' : 'rgba(15,23,42,0.85)';
                b.style.color = on ? '#34d399' : '#cbd5e1';
            });
            statusLine.style.color = vmError ? '#fb7185' : '#34d399';
            statusLine.textContent = vmStatusMsg;
        }

        function compileLuaCode(codeStr, chipLabel) {
            if (!luaReady || !LState || !fengariRef) {
                activeLuaCode = codeStr;
                vmError = false;
                vmStatusMsg = 'JS Mirror Active (Lua VM Loading)';
                updatePanelVisuals();
                return true;
            }
            const { lua, lauxlib, to_luastring, to_jsstring } = fengariRef;
            // Test in current state by saving previous step_ai first
            lua.lua_getglobal(LState, to_luastring('step_ai'));
            const prevRef = lauxlib.luaL_ref(LState, lua.LUA_REGISTRYINDEX);

            const st = lauxlib.luaL_dostring(LState, to_luastring(codeStr));
            if (st !== 0) {
                const errStr = lua.lua_tostring(LState, -1);
                vmError = true;
                vmStatusMsg = 'Lua ERR: ' + (errStr ? to_jsstring(errStr) : 'Syntax error');
                lua.lua_settop(LState, 0);
                // Restore previous working step_ai
                lua.lua_rawgeti(LState, lua.LUA_REGISTRYINDEX, prevRef);
                lua.lua_setglobal(LState, to_luastring('step_ai'));
                lauxlib.luaL_unref(LState, lua.LUA_REGISTRYINDEX, prevRef);
                updatePanelVisuals();
                return false;
            }

            // Verify step_ai is a callable function and dry-run it safely
            lua.lua_getglobal(LState, to_luastring('step_ai'));
            if (!lua.lua_isfunction(LState, -1)) {
                lua.lua_settop(LState, 0);
                vmError = true;
                vmStatusMsg = 'Lua ERR: function step_ai(...) missing';
                lua.lua_rawgeti(LState, lua.LUA_REGISTRYINDEX, prevRef);
                lua.lua_setglobal(LState, to_luastring('step_ai'));
                lauxlib.luaL_unref(LState, lua.LUA_REGISTRYINDEX, prevRef);
                updatePanelVisuals();
                return false;
            }

            const dryArgs = [260, 290, 100, 0, 420, 290, 160, 335, 290, 75];
            for (let i = 0; i < dryArgs.length; i++) lua.lua_pushnumber(LState, dryArgs[i]);
            const rc = lua.lua_pcall(LState, 10, 3, 0);
            if (rc !== 0) {
                const errStr = lua.lua_tostring(LState, -1);
                vmError = true;
                vmStatusMsg = 'Lua Runtime ERR: ' + (errStr ? to_jsstring(errStr) : 'pcall error');
                lua.lua_settop(LState, 0);
                lua.lua_rawgeti(LState, lua.LUA_REGISTRYINDEX, prevRef);
                lua.lua_setglobal(LState, to_luastring('step_ai'));
                lauxlib.luaL_unref(LState, lua.LUA_REGISTRYINDEX, prevRef);
                updatePanelVisuals();
                return false;
            }
            lua.lua_settop(LState, 0);
            lauxlib.luaL_unref(LState, lua.LUA_REGISTRYINDEX, prevRef);

            activeLuaCode = codeStr;
            vmError = false;
            vmStatusMsg = '✓ Lua 5.3 Compiled' + (chipLabel ? ' [' + chipLabel + ']' : '');
            updatePanelVisuals();
            return true;
        }

        function initLuaVmWithScript(luaSource) {
            if (!fengariRef || destroyed) return;
            try {
                const { lua, lauxlib, lualib, to_luastring, to_jsstring } = fengariRef;
                if (LState) {
                    try { lua.lua_close(LState); } catch (_) {}
                }
                LState = lauxlib.luaL_newstate();
                lualib.luaL_openlibs(LState);
                // Protect against user infinite loops in live editor
                if (typeof lua.lua_sethook === 'function') {
                    lua.lua_sethook(LState, (stPtr) => {
                        lauxlib.luaL_error(stPtr, to_luastring('Lua instruction limit exceeded'));
                    }, lua.LUA_MASKCOUNT, 25000);
                }
                const st = lauxlib.luaL_dostring(LState, to_luastring(luaSource));
                if (st !== 0) {
                    lua.lua_settop(LState, 0);
                    lauxlib.luaL_dostring(LState, to_luastring(FALLBACK_MISSION_KERNEL_LUA));
                }

                // Extract CHIP_PROFILES from Lua state
                ['hunter', 'kiter', 'guardian'].forEach((id) => {
                    lua.lua_getglobal(LState, to_luastring('CHIP_PROFILES'));
                    if (lua.lua_istable(LState, -1)) {
                        lua.lua_getfield(LState, -1, to_luastring(id));
                        if (lua.lua_istable(LState, -1)) {
                            lua.lua_getfield(LState, -1, to_luastring('code'));
                            const str = lua.lua_tostring(LState, -1);
                            if (str) chipCodes[id] = to_jsstring(str).trim();
                        }
                    }
                    lua.lua_settop(LState, 0);
                });

                luaReady = true;
                if (!codeArea.value) {
                    codeArea.value = chipCodes[activeChip] || chipCodes.hunter;
                }
                compileLuaCode(codeArea.value || chipCodes[activeChip], activeChip.toUpperCase());
            } catch (err) {
                luaReady = false;
                vmError = true;
                vmStatusMsg = 'Lua VM Fallback: ' + (err && err.message ? err.message : 'Error');
                updatePanelVisuals();
            }
        }

        // Parse fallback code chunks right away for instant UI display
        (function seedDefaultCodes() {
            const matches = FALLBACK_MISSION_KERNEL_LUA.split('[[');
            if (matches.length >= 4) {
                chipCodes.hunter = matches[1].split(']]')[0].trim();
                chipCodes.kiter = matches[2].split(']]')[0].trim();
                chipCodes.guardian = matches[3].split(']]')[0].trim();
                codeArea.value = chipCodes.hunter;
                activeLuaCode = chipCodes.hunter;
            }
        })();

        // Boot Fengari + fetch lua/mission_kernel.lua asynchronously without blocking frame 1
        (async function bootLuaAndKernel() {
            if (!fengariRef && typeof fetch === 'function') {
                try {
                    const vr = await fetch(resolveAsset('vendor/fengari-web.js'));
                    if (vr.ok) {
                        const code = await vr.text();
                        const mod = { exports: {} };
                        const fn = new Function('module', 'exports', code);
                        fn(mod, mod.exports);
                        if (mod.exports && mod.exports.lua) {
                            fengariRef = mod.exports;
                            global.fengari = fengariRef;
                        }
                    }
                } catch (_) { /* ignore */ }
            }

            let kernelSrc = FALLBACK_MISSION_KERNEL_LUA;
            if (typeof fetch === 'function') {
                try {
                    const res = await fetch(resolveAsset('lua/mission_kernel.lua'));
                    if (res.ok) {
                        const txt = await res.text();
                        if (txt.indexOf('CHIP_PROFILES') >= 0) kernelSrc = txt;
                    }
                } catch (_) { /* file:// fallback cleanly uses embedded string */ }
            }
            if (!destroyed) initLuaVmWithScript(kernelSrc);
        })();

        function jsFallbackStepAi(bx, by, hp, cooldown, tx, ty, tdist, nx, ny, ndist) {
            if (activeChip === 'kiter') {
                if (hp < 40 && ndist > 35) return ['RETREAT', nx, ny];
                if (tdist < 130) return ['EVADE', bx + (bx - tx), by + (by - ty)];
                if (cooldown <= 0 && tdist < 320) return ['FIRE', tx, ty];
                return ['ORBIT', nx + 70, ny - 50];
            }
            if (activeChip === 'guardian') {
                if (tdist < 110 && cooldown <= 0) return ['EMP', tx, ty];
                if (ndist > 95) return ['GUARD', nx, ny];
                if (cooldown <= 0 && tdist < 260) return ['FIRE', tx, ty];
                return ['GUARD', nx, ny];
            }
            if (cooldown <= 0 && tdist < 280) return ['FIRE', tx, ty];
            if (tdist < 420) return ['CHASE', tx, ty];
            return ['HOLD', nx, ny];
        }

        function callLuaStepAi(bx, by, hp, cooldown, tx, ty, tdist, nx, ny, ndist) {
            if (!luaReady || !LState || !fengariRef) {
                return jsFallbackStepAi(bx, by, hp, cooldown, tx, ty, tdist, nx, ny, ndist);
            }
            const { lua, to_luastring, to_jsstring } = fengariRef;
            lua.lua_getglobal(LState, to_luastring('step_ai'));
            if (!lua.lua_isfunction(LState, -1)) {
                lua.lua_settop(LState, 0);
                return jsFallbackStepAi(bx, by, hp, cooldown, tx, ty, tdist, nx, ny, ndist);
            }
            const args = [bx, by, hp, cooldown, tx, ty, tdist, nx, ny, ndist];
            for (let i = 0; i < 10; i++) lua.lua_pushnumber(LState, args[i]);
            const rc = lua.lua_pcall(LState, 10, 3, 0);
            if (rc !== 0) {
                const errStr = lua.lua_tostring(LState, -1);
                vmError = true;
                vmStatusMsg = 'Lua ERR: ' + (errStr ? to_jsstring(errStr) : 'pcall');
                lua.lua_settop(LState, 0);
                return jsFallbackStepAi(bx, by, hp, cooldown, tx, ty, tdist, nx, ny, ndist);
            }
            pcallCounter++;
            const rawAct = lua.lua_isstring(LState, -3) ? to_jsstring(lua.lua_tostring(LState, -3)) : 'HOLD';
            const rx = lua.lua_isnumber(LState, -2) ? lua.lua_tonumber(LState, -2) : nx;
            const ry = lua.lua_isnumber(LState, -1) ? lua.lua_tonumber(LState, -1) : ny;
            lua.lua_settop(LState, 0);
            return [String(rawAct || 'HOLD').toUpperCase(), Number.isFinite(rx) ? rx : nx, Number.isFinite(ry) ? ry : ny];
        }

        function triggerEmpBlast(cx, cy, radius, dmg, color) {
            playSfx(ctx, 'emp');
            shakeTimer = 0.16;
            shockRings.push({ x: cx, y: cy, r: 10, maxR: radius, life: 0.36, maxLife: 0.36, color: color || PAL.cyan });
            spawnBurstParticles(particles, cx, cy, color || PAL.cyan, 22, 220, 3.5, 0.45);
            for (let i = enemies.length - 1; i >= 0; i--) {
                const e = enemies[i];
                const d = dist(cx, cy, e.x, e.y);
                if (d <= radius) {
                    e.hp -= dmg;
                    e.stun = 1.25;
                    e.hitFlash = 0.25;
                    const ang = Math.atan2(e.y - cy, e.x - cx);
                    e.x += Math.cos(ang) * 44;
                    e.y += Math.sin(ang) * 44;
                    floatTexts.push({ x: e.x, y: e.y - 14, text: '-' + dmg, color: PAL.cyan, life: 0.65, maxLife: 0.65 });
                }
            }
        }

        function triggerPlayerEmp() {
            if (ended || empCd > 0) return;
            empCd = 5.0;
            triggerEmpBlast(mech.x, mech.y, 215, 28 + wave * 4, PAL.sky);
        }

        // Panel event handlers
        ['hunter', 'kiter', 'guardian'].forEach((id) => {
            bag.on(chipBtns[id], 'click', (e) => {
                e.currentTarget.blur();
                unlockAudio(ctx);
                playSfx(ctx, 'uiClick');
                activeChip = id;
                codeArea.value = chipCodes[id] || '';
                compileLuaCode(codeArea.value, id.toUpperCase());
            });
        });
        bag.on(runBtn, 'click', (e) => {
            e.currentTarget.blur();
            unlockAudio(ctx);
            playSfx(ctx, 'uiConfirm');
            compileLuaCode(codeArea.value, 'CUSTOM');
        });
        bag.on(empBtn, 'click', (e) => {
            e.currentTarget.blur();
            unlockAudio(ctx);
            triggerPlayerEmp();
        });
        bag.on(toggleBtn, 'click', (e) => {
            e.currentTarget.blur();
            panelCollapsed = !panelCollapsed;
            bodyWrap.style.display = panelCollapsed ? 'none' : 'flex';
            panelRoot.style.width = panelCollapsed ? '164px' : '288px';
            toggleBtn.textContent = panelCollapsed ? '▸' : '▾';
        });
        bag.on(codeArea, 'keydown', (e) => {
            e.stopPropagation();
        });

        bag.on(window, 'keydown', (e) => {
            if (destroyed || ended || ctx.getPaused() || isFormElement(e.target)) return;
            unlockAudio(ctx);
            if (e.code === 'Space') {
                e.preventDefault();
                triggerPlayerEmp();
            } else if (e.key === '1') {
                chipBtns.hunter.click();
            } else if (e.key === '2') {
                chipBtns.kiter.click();
            } else if (e.key === '3') {
                chipBtns.guardian.click();
            }
        });

        bag.on(canvas, 'contextmenu', (e) => {
            e.preventDefault();
            beacon.active = false;
        });

        bag.on(canvas, 'pointerdown', (e) => {
            if (destroyed || ended || ctx.getPaused()) return;
            unlockAudio(ctx);
            if (e.button === 2) {
                beacon.active = false;
                return;
            }
            const pos = stageCoordsFromEvent(canvas, e);
            const maxX = panelCollapsed ? W - 24 : 648;
            beacon.x = clamp(pos.x, 36, maxX);
            beacon.y = clamp(pos.y, 44, H - 36);
            beacon.active = true;
            beacon.timer = 11.0;
            playSfx(ctx, 'uiClick');
            shockRings.push({ x: beacon.x, y: beacon.y, r: 4, maxR: 34, life: 0.3, maxLife: 0.3, color: PAL.mint });
        });

        function spawnWaveEnemy() {
            const arenaR = panelCollapsed ? W : 665;
            const side = randInt(0, 3);
            let ex, ey;
            if (side === 0) { ex = randRange(20, arenaR - 20); ey = -18; }
            else if (side === 1) { ex = arenaR + 18; ey = randRange(20, H - 20); }
            else if (side === 2) { ex = randRange(20, arenaR - 20); ey = H + 18; }
            else { ex = -18; ey = randRange(20, H - 20); }

            const isElite = wave >= 2 && Math.random() < Math.min(0.32, 0.08 + wave * 0.04);
            enemies.push({
                x: ex, y: ey,
                hp: isElite ? (36 + wave * 10) : (16 + wave * 4),
                maxHp: isElite ? (36 + wave * 10) : (16 + wave * 4),
                speed: isElite ? (64 + wave * 4) : (84 + wave * 5),
                dmg: isElite ? 12 : 7,
                sprite: isElite ? 'ufo' : 'spider_bot',
                size: isElite ? 34 : 26,
                scoreVal: isElite ? 85 : 40,
                stun: 0,
                hitFlash: 0,
                atkCd: 0
            });
        }

        function steerUnitByLua(unit, speed, dt, isWing) {
            const nx = beacon.active ? beacon.x : core.x;
            const ny = beacon.active ? beacon.y : core.y;
            const ndist = dist(unit.x, unit.y, nx, ny);

            let nearest = null;
            let tdist = 9999;
            for (let i = 0; i < enemies.length; i++) {
                const d = dist(unit.x, unit.y, enemies[i].x, enemies[i].y);
                if (d < tdist) { tdist = d; nearest = enemies[i]; }
            }
            const tx = nearest ? nearest.x : nx;
            const ty = nearest ? nearest.y : ny;

            const [act, ax, ay] = callLuaStepAi(
                unit.x, unit.y, unit.hp, unit.fireCd,
                tx, ty, tdist, nx, ny, ndist
            );
            unit.action = act;
            unit.tx = ax;
            unit.ty = ay;

            const arenaMaxX = panelCollapsed ? W - 26 : 644;
            let moveX = 0;
            let moveY = 0;

            if (act === 'FIRE' && nearest && unit.fireCd <= 0) {
                unit.fireCd = isWing ? 0.42 : 0.28;
                const ang = Math.atan2(ay - unit.y, ax - unit.x);
                bolts.push({
                    x: unit.x + Math.cos(ang) * 16,
                    y: unit.y + Math.sin(ang) * 16,
                    vx: Math.cos(ang) * 560,
                    vy: Math.sin(ang) * 560,
                    dmg: isWing ? 11 : 16,
                    color: isWing ? PAL.mint : PAL.cyan,
                    life: 1.1
                });
                playSfx(ctx, 'shootLaser', 0.16);
            } else if (act === 'EMP' && unit.empCd !== undefined && unit.empCd <= 0) {
                unit.empCd = 3.2;
                unit.fireCd = 0.65;
                triggerEmpBlast(unit.x, unit.y, 145, 22 + wave * 3, PAL.mint);
            } else if (act === 'ORBIT') {
                unit.orbitAngle += dt * (isWing ? 2.4 : 1.7);
                const rad = isWing ? 105 : 78;
                const gx = nx + Math.cos(unit.orbitAngle) * rad;
                const gy = ny + Math.sin(unit.orbitAngle) * rad;
                const dx = gx - unit.x;
                const dy = gy - unit.y;
                const d = Math.hypot(dx, dy) || 1;
                moveX = (dx / d) * speed;
                moveY = (dy / d) * speed;
            } else {
                const dx = ax - unit.x;
                const dy = ay - unit.y;
                const d = Math.hypot(dx, dy);
                if (d > 14) {
                    const mult = (act === 'EVADE' || act === 'RETREAT') ? 1.25 : 1.0;
                    moveX = (dx / d) * speed * mult;
                    moveY = (dy / d) * speed * mult;
                }
            }

            // Gentle shield recharge when holding/guarding near core
            if ((act === 'HOLD' || act === 'GUARD' || act === 'RETREAT') && unit.hp < unit.maxHp) {
                unit.hp = Math.min(unit.maxHp, unit.hp + dt * 2.5);
            }

            unit.vx = lerp(unit.vx, moveX, clamp(dt * 10, 0, 1));
            unit.vy = lerp(unit.vy, moveY, clamp(dt * 10, 0, 1));
            unit.x = clamp(unit.x + unit.vx * dt, 26, arenaMaxX);
            unit.y = clamp(unit.y + unit.vy * dt, 48, H - 26);
        }

        function syncHud() {
            ctx.setHud({
                score,
                level: wave,
                maxLevel: isStory ? 6 : 99,
                lives: Math.max(0, Math.ceil(mech.hp)),
                statusText: isStory
                    ? L(ctx, `Dalga ${wave} · Skor ${score}/${storyTarget}`, `Wave ${wave} · Score ${score}/${storyTarget}`)
                    : L(ctx, `Dalga ${wave} · Çekirdek %${Math.round((core.hp / core.maxHp) * 100)}`, `Wave ${wave} · Core ${Math.round((core.hp / core.maxHp) * 100)}%`)
            });
        }

        function update(dt) {
            time += dt;
            if (shakeTimer > 0) shakeTimer = Math.max(0, shakeTimer - dt);
            if (empCd > 0) empCd = Math.max(0, empCd - dt);
            if (mech.fireCd > 0) mech.fireCd = Math.max(0, mech.fireCd - dt);
            if (mech.empCd > 0) mech.empCd = Math.max(0, mech.empCd - dt);
            if (mech.hitFlash > 0) mech.hitFlash = Math.max(0, mech.hitFlash - dt);
            if (core.hitFlash > 0) core.hitFlash = Math.max(0, core.hitFlash - dt);
            if (wing.fireCd > 0) wing.fireCd = Math.max(0, wing.fireCd - dt);

            pcallWindow += dt;
            if (pcallWindow >= 0.5) {
                pcallPerSec = Math.round(pcallCounter / pcallWindow);
                pcallCounter = 0;
                pcallWindow = 0;
            }

            if (beacon.active) {
                beacon.timer -= dt;
                if (beacon.timer <= 0) beacon.active = false;
            }

            // Dynamic core centering when panel opens/collapses
            const targetCoreX = panelCollapsed ? 480 : 335;
            core.x = lerp(core.x, targetCoreX, clamp(dt * 8, 0, 1));

            // Spawn waves
            if (waveSpawned < waveTotal) {
                spawnTimer -= dt;
                if (spawnTimer <= 0) {
                    spawnTimer = Math.max(0.32, 1.15 - wave * 0.08);
                    spawnWaveEnemy();
                    waveSpawned++;
                }
            } else if (enemies.length === 0) {
                wave++;
                waveSpawned = 0;
                waveTotal = 7 + wave * 3;
                score += 100;
                mech.hp = Math.min(mech.maxHp, mech.hp + 18);
                core.hp = Math.min(core.maxHp, core.hp + 15);
                playSfx(ctx, 'levelup');
                floatTexts.push({ x: core.x, y: core.y - 42, text: `WAVE ${wave}!`, color: PAL.mint, life: 1.2, maxLife: 1.2, size: 16 });
            }

            // Execute Lua 5.3 AI for Mech + Allied Wing-Drone
            steerUnitByLua(mech, 195, dt, false);
            steerUnitByLua(wing, 225, dt, true);

            // Projectiles
            for (let i = bolts.length - 1; i >= 0; i--) {
                const b = bolts[i];
                b.life -= dt;
                b.x += b.vx * dt;
                b.y += b.vy * dt;
                if (b.life <= 0 || b.x < -20 || b.x > W + 20 || b.y < -20 || b.y > H + 20) {
                    bolts.splice(i, 1);
                    continue;
                }
                for (let j = enemies.length - 1; j >= 0; j--) {
                    const e = enemies[j];
                    if (dist(b.x, b.y, e.x, e.y) < e.size * 0.55) {
                        e.hp -= b.dmg;
                        e.hitFlash = 0.16;
                        spawnBurstParticles(particles, b.x, b.y, b.color, 6, 110, 2.5, 0.25);
                        bolts.splice(i, 1);
                        break;
                    }
                }
            }

            // Enemies update & cleanup
            for (let i = enemies.length - 1; i >= 0; i--) {
                const e = enemies[i];
                if (e.hp <= 0) {
                    score += e.scoreVal;
                    playSfx(ctx, 'explodeSmall', 0.18);
                    spawnBurstParticles(particles, e.x, e.y, PAL.coral, 14, 170, 3.2, 0.42);
                    floatTexts.push({ x: e.x, y: e.y - 10, text: '+' + e.scoreVal, color: PAL.gold, life: 0.7, maxLife: 0.7 });
                    enemies.splice(i, 1);
                    continue;
                }
                if (e.hitFlash > 0) e.hitFlash = Math.max(0, e.hitFlash - dt);
                if (e.atkCd > 0) e.atkCd = Math.max(0, e.atkCd - dt);
                if (e.stun > 0) {
                    e.stun = Math.max(0, e.stun - dt);
                    continue;
                }
                const dMech = dist(e.x, e.y, mech.x, mech.y);
                const dCore = dist(e.x, e.y, core.x, core.y);
                const tgt = dMech < dCore * 0.9 ? mech : core;
                const ang = Math.atan2(tgt.y - e.y, tgt.x - e.x);
                e.x += Math.cos(ang) * e.speed * dt;
                e.y += Math.sin(ang) * e.speed * dt;

                if (dist(e.x, e.y, tgt.x, tgt.y) < (tgt === core ? 30 : 24) && e.atkCd <= 0) {
                    e.atkCd = 0.85;
                    tgt.hp = Math.max(0, tgt.hp - e.dmg);
                    tgt.hitFlash = 0.24;
                    shakeTimer = 0.12;
                    playSfx(ctx, 'playerHurt');
                    floatTexts.push({ x: tgt.x, y: tgt.y - 20, text: '-' + e.dmg, color: PAL.coral, life: 0.65, maxLife: 0.65 });
                }
            }

            syncHud();

            if (!ended && (mech.hp <= 0 || core.hp <= 0)) {
                ended = true;
                ctx.onGameOver({
                    score,
                    level: wave,
                    reason: mech.hp <= 0
                        ? L(ctx, 'Otonom Battle-Mech imha oldu.', 'Autonomous Battle-Mech destroyed.')
                        : L(ctx, 'S.A.R.A. Veri Çekirdeği çöktü.', 'S.A.R.A. Data Core breached.')
                });
            } else if (!ended && isStory && score >= storyTarget) {
                ended = true;
                playSfx(ctx, 'levelup');
                ctx.onWin({
                    score,
                    level: wave,
                    stars: core.hp >= 90 ? 3 : 2,
                    reason: L(ctx, 'Lua 5.3 savunma algoritması sektörü temizledi!', 'Lua 5.3 defense kernel purged the swarm!')
                });
            }
        }

        function draw(dt) {
            g.save();
            if (shakeTimer > 0) g.translate(randRange(-3.5, 3.5), randRange(-3.5, 3.5));

            // Cyber arena backdrop
            g.fillStyle = '#060a14';
            g.fillRect(0, 0, W, H);
            g.strokeStyle = 'rgba(52, 211, 153, 0.065)';
            g.lineWidth = 1;
            for (let x = 0; x <= W; x += 36) {
                g.beginPath(); g.moveTo(x + 0.5, 0); g.lineTo(x + 0.5, H); g.stroke();
            }
            for (let y = 0; y <= H; y += 36) {
                g.beginPath(); g.moveTo(0, y + 0.5); g.lineTo(W, y + 0.5); g.stroke();
            }

            // Core perimeter defense ring
            g.save();
            g.strokeStyle = 'rgba(56, 189, 248, 0.16)';
            g.setLineDash([6, 6]);
            g.beginPath();
            g.arc(core.x, core.y, 110, 0, TAU);
            g.stroke();
            g.restore();

            // Tactical Rally Beacon
            if (beacon.active) {
                g.save();
                const bp = 0.7 + 0.3 * Math.sin(time * 6);
                g.strokeStyle = PAL.mint;
                g.lineWidth = 2;
                g.beginPath();
                g.arc(beacon.x, beacon.y, 16 * bp + 6, 0, TAU);
                g.stroke();
                g.fillStyle = 'rgba(52, 211, 153, 0.2)';
                g.fill();
                g.font = '700 9.5px ' + FONT_MONO;
                g.fillStyle = PAL.mint;
                g.textAlign = 'center';
                g.fillText('RALLY', beacon.x, beacon.y - 22);
                g.restore();
            }

            // Target telemetry lines from Lua AI
            g.save();
            g.strokeStyle = 'rgba(52, 211, 153, 0.25)';
            g.setLineDash([4, 4]);
            g.beginPath();
            g.moveTo(mech.x, mech.y);
            g.lineTo(mech.tx, mech.ty);
            g.stroke();
            g.restore();

            // S.A.R.A. Data Core
            drawSprite(g, sprites, 'reactor_node', core.x, core.y, 50, 50, {
                glow: core.hitFlash > 0 ? PAL.coral : PAL.sky,
                glowBlur: 16,
                hitFlash: core.hitFlash > 0,
                fallbackColor: PAL.sky
            });
            drawProgressBar(g, core.x - 28, core.y + 30, 56, 6, core.hp / core.maxHp, PAL.sky, '#0f172a');

            // Shockwave rings
            for (let i = shockRings.length - 1; i >= 0; i--) {
                const s = shockRings[i];
                s.life -= dt;
                if (s.life <= 0) { shockRings.splice(i, 1); continue; }
                const p = 1 - s.life / s.maxLife;
                g.save();
                g.globalAlpha = 1 - p;
                g.strokeStyle = s.color;
                g.lineWidth = 3;
                g.beginPath();
                g.arc(s.x, s.y, lerp(s.r, s.maxR, p), 0, TAU);
                g.stroke();
                g.restore();
            }

            // Enemies
            for (let i = 0; i < enemies.length; i++) {
                const e = enemies[i];
                drawSprite(g, sprites, e.sprite, e.x, e.y, e.size, e.size, {
                    glow: e.stun > 0 ? PAL.cyan : PAL.coral,
                    glowBlur: 8,
                    hitFlash: e.hitFlash > 0,
                    fallbackColor: PAL.coral
                });
                if (e.hp < e.maxHp) {
                    drawProgressBar(g, e.x - 12, e.y - e.size * 0.65, 24, 4, e.hp / e.maxHp, PAL.coral, '#0f172a');
                }
            }

            // Wing-Drone (allied Lua bot)
            drawSprite(g, sprites, 'alien_drone', wing.x, wing.y, 26, 26, {
                glow: PAL.mint,
                glowBlur: 10,
                fallbackColor: PAL.mint
            });

            // Autonomous Battle-Mech
            drawSprite(g, sprites, 'tactical_mech', mech.x, mech.y, 40, 40, {
                glow: mech.hitFlash > 0 ? PAL.coral : PAL.mint,
                glowBlur: 14,
                hitFlash: mech.hitFlash > 0,
                fallbackColor: PAL.mint
            });
            drawProgressBar(g, mech.x - 20, mech.y + 24, 40, 5, mech.hp / mech.maxHp, PAL.mint, '#0f172a');

            // Lua AI Action badge above Mech
            g.font = '700 10px ' + FONT_MONO;
            g.textAlign = 'center';
            g.fillStyle = PAL.cyan;
            g.fillText('[' + mech.action + ']', mech.x, mech.y - 26);

            // Plasma bolts
            for (let i = 0; i < bolts.length; i++) {
                const b = bolts[i];
                g.save();
                g.strokeStyle = b.color;
                g.lineWidth = 3;
                g.beginPath();
                g.moveTo(b.x, b.y);
                g.lineTo(b.x - b.vx * 0.025, b.y - b.vy * 0.025);
                g.stroke();
                g.restore();
            }

            updateAndDrawParticles(g, particles, dt);
            updateAndDrawFloatTexts(g, floatTexts, dt);

            // Top-left Telemetry Pills
            const vmTag = luaReady ? `LUA 5.3 VM [ACTIVE · ${pcallPerSec} pcall/s]` : 'LUA KERNEL [STANDBY]';
            const pw = drawPill(g, vmTag, 14, 12, luaReady ? PAL.mint : PAL.amber);
            drawPill(g, `WAVE ${wave} · EMP ${empCd <= 0 ? 'READY' : empCd.toFixed(1) + 's'}`, 24 + pw, 12, PAL.sky);

            g.restore();
        }

        function loop(now) {
            if (destroyed) return;
            const dt = Math.min(0.05, Math.max(0.001, (now - lastTs) / 1000));
            lastTs = now;
            if (!ctx.getPaused() && !ended) {
                update(dt);
            }
            draw(dt);
            rafId = global.requestAnimationFrame(loop);
        }

        syncHud();
        rafId = global.requestAnimationFrame(loop);

        return {
            restart(lv) {
                ended = false;
                wave = Math.max(1, Number(lv) || 1);
                score = 0;
                waveSpawned = 0;
                waveTotal = 7 + wave * 3;
                spawnTimer = 0.5;
                empCd = 0;
                core.hp = 150;
                core.x = panelCollapsed ? 480 : 335;
                mech.hp = 100;
                mech.x = 260; mech.y = 290;
                wing.x = 380; wing.y = 240;
                beacon.active = false;
                enemies.length = 0;
                bolts.length = 0;
                shockRings.length = 0;
                particles.length = 0;
                floatTexts.length = 0;
                syncHud();
            },
            destroy() {
                destroyed = true;
                if (rafId) global.cancelAnimationFrame(rafId);
                bag.clear();
                if (LState && fengariRef && fengariRef.lua && typeof fengariRef.lua.lua_close === 'function') {
                    try { fengariRef.lua.lua_close(LState); } catch (_) {}
                }
                LState = null;
                if (panelRoot.parentNode) panelRoot.parentNode.removeChild(panelRoot);
                if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
            }
        };
    };

    // =========================================================================
    // 3. EVENT HORIZON: ASSEMBLYSCRIPT SWARM (wasm/cosmic_adv.wasm)
    // =========================================================================
    Engines['asc-blackhole-swarm'] = function mountWasmSwarm(ctx) {
        const canvas = setupCanvas(ctx, '2d', W, H);
        const g = canvas.getContext('2d');
        const sprites = ensureSprites(ctx, ['portal_vortex', 'stealth_jet', 'fighter', 'energy_prism', 'cryo_crystal']);
        const bag = createListenerBag();
        const isStory = isStoryMode(ctx);
        const storyTarget = ctx.chapterTarget || 1600;

        const BASE_PTR = 16384;
        const STRIDE_FLOATS = 6; // x, y, vx, vy, hp, kind (24 bytes)
        const MAX_COUNT = 620;
        const DUST_COUNT = 390; // kind = 0 ambient accretion particles

        let destroyed = false;
        let ended = false;
        let rafId = 0;
        let lastTs = performance.now();
        let time = 0;

        // WASM or JS Fallback Memory
        let wasmExports = null;
        let wasmActive = false;
        const fallbackBuffer = new ArrayBuffer(65536);
        const prevAliveKind = new Float32Array(MAX_COUNT); // -1 if inactive, else entity kind
        const prevPosX = new Float32Array(MAX_COUNT);
        const prevPosY = new Float32Array(MAX_COUNT);

        function jsStepGravitySwarm(f32, baseIdx, count, dt, w, h, holeX, holeY, holeStrength, playerX, playerY, pulsePush) {
            const fdt = Math.fround(dt);
            const fw = Math.fround(w);
            const fh = Math.fround(h);
            const fhx = Math.fround(holeX);
            const fhy = Math.fround(holeY);
            const fhs = Math.fround(holeStrength);
            const fpx = Math.fround(playerX);
            const fpy = Math.fround(playerY);
            const fpp = Math.fround(pulsePush);
            let active = 0;
            let absorbed = 0;

            for (let i = 0; i < count; i++) {
                const o = baseIdx + i * STRIDE_FLOATS;
                let x = f32[o];
                if (x < -900.0) continue;

                let y = f32[o + 1];
                let vx = f32[o + 2];
                let vy = f32[o + 3];
                let hp = f32[o + 4];
                const kind = f32[o + 5];

                if (fhs > 0.01) {
                    const hdx = fhx - x;
                    const hdy = fhy - y;
                    const hd2 = hdx * hdx + hdy * hdy + 120.0;
                    const hdist = Math.sqrt(hd2);
                    const force = (fhs * (kind > 0.5 ? 1.15 : 0.85)) / hd2;
                    vx += (hdx * force - hdy * (force * 0.65)) * fdt * 220.0;
                    vy += (hdy * force + hdx * (force * 0.65)) * fdt * 220.0;
                    if (hdist < 26.0) {
                        f32[o] = -999.0;
                        absorbed++;
                        continue;
                    }
                }

                const pdx = x - fpx;
                const pdy = y - fpy;
                const pd2 = pdx * pdx + pdy * pdy + 64.0;
                const pdist = Math.sqrt(pd2);

                if (fpp > 0.1 && pdist < 220.0) {
                    const repulse = (fpp * 950.0) / (pdist + 20.0);
                    vx += (pdx / pdist) * repulse * fdt * 12.0;
                    vy += (pdy / pdist) * repulse * fdt * 12.0;
                    hp -= fpp * fdt * 2.5;
                } else if (kind >= 1.0 && pdist > 4.0) {
                    const chase = kind > 1.5 ? 135.0 : 88.0;
                    vx += (-pdx / pdist) * chase * fdt * 1.4;
                    vy += (-pdy / pdist) * chase * fdt * 1.4;
                }

                const damp = Math.pow(0.96, fdt * 60.0);
                vx *= damp;
                vy *= damp;
                const spd = Math.sqrt(vx * vx + vy * vy);
                if (spd > 380.0) {
                    const s = 380.0 / spd;
                    vx *= s;
                    vy *= s;
                }

                x += vx * fdt;
                y += vy * fdt;
                if (x < 14.0) { x = 14.0; vx = Math.abs(vx) * 0.85; }
                else if (x > fw - 14.0) { x = fw - 14.0; vx = -Math.abs(vx) * 0.85; }
                if (y < 14.0) { y = 14.0; vy = Math.abs(vy) * 0.85; }
                else if (y > fh - 14.0) { y = fh - 14.0; vy = -Math.abs(vy) * 0.85; }

                if (hp <= 0.0) {
                    f32[o] = -999.0;
                    absorbed++;
                    continue;
                }
                f32[o] = x;
                f32[o + 1] = y;
                f32[o + 2] = vx;
                f32[o + 3] = vy;
                f32[o + 4] = hp;
                active++;
            }
            return ((absorbed & 0xFFFF) << 16) | (active & 0xFFFF);
        }

        function getF32View() {
            const buf = (wasmActive && wasmExports && wasmExports.memory) ? wasmExports.memory.buffer : fallbackBuffer;
            return new Float32Array(buf, BASE_PTR, MAX_COUNT * STRIDE_FLOATS);
        }

        function spawnEntitySlot(f32, slotIdx, kind, x, y, vx, vy, hp) {
            const o = slotIdx * STRIDE_FLOATS;
            f32[o] = x;
            f32[o + 1] = y;
            f32[o + 2] = vx;
            f32[o + 3] = vy;
            f32[o + 4] = hp;
            f32[o + 5] = kind;
        }

        function spawnDustInSlot(f32, slotIdx) {
            const ang = Math.random() * TAU;
            const r = randRange(130, 440);
            const sx = clamp(W * 0.5 + Math.cos(ang) * r, 24, W - 24);
            const sy = clamp(H * 0.5 + Math.sin(ang) * r * 0.72, 24, H - 24);
            const tang = ang + Math.PI * 0.5;
            const spd = randRange(45, 110);
            spawnEntitySlot(f32, slotIdx, 0.0, sx, sy, Math.cos(tang) * spd, Math.sin(tang) * spd, 99.0);
        }

        function spawnEnemyInSlot(f32, slotIdx, waveNum) {
            const edge = randInt(0, 3);
            let sx, sy;
            if (edge === 0) { sx = randRange(30, W - 30); sy = 22; }
            else if (edge === 1) { sx = W - 22; sy = randRange(30, H - 30); }
            else if (edge === 2) { sx = randRange(30, W - 30); sy = H - 22; }
            else { sx = 22; sy = randRange(30, H - 30); }
            const elite = waveNum >= 2 && Math.random() < Math.min(0.45, 0.12 + waveNum * 0.05);
            const kind = elite ? 2.0 : 1.0;
            const hp = elite ? (8 + waveNum * 1.5) : (4 + waveNum * 0.8);
            spawnEntitySlot(f32, slotIdx, kind, sx, sy, 0, 0, hp);
        }

        function seedAllEntities() {
            const f32 = getF32View();
            for (let i = 0; i < MAX_COUNT; i++) {
                if (i < DUST_COUNT) {
                    spawnDustInSlot(f32, i);
                } else if (i < DUST_COUNT + 55) {
                    spawnEnemyInSlot(f32, i, 1);
                } else {
                    f32[i * STRIDE_FLOATS] = -999.0;
                }
            }
        }

        seedAllEntities();

        // Async instantiate real wasm/cosmic_adv.wasm and copy live memory snapshot cleanly
        (async function loadWasmKernel() {
            if (typeof fetch !== 'function' || typeof WebAssembly === 'undefined') return;
            try {
                const res = await fetch(resolveAsset('wasm/cosmic_adv.wasm'));
                if (!res.ok) return;
                const bytes = await res.arrayBuffer();
                const { instance } = await WebAssembly.instantiate(bytes, { env: { abort: () => {} } });
                if (destroyed || !instance || !instance.exports || !instance.exports.stepGravitySwarm) return;

                // Mirror current entity array into WASM linear memory
                const oldView = getF32View();
                const wasmView = new Float32Array(instance.exports.memory.buffer, BASE_PTR, MAX_COUNT * STRIDE_FLOATS);
                wasmView.set(oldView);
                if (typeof instance.exports.seedRng === 'function') {
                    instance.exports.seedRng(Date.now() >>> 0);
                }
                wasmExports = instance.exports;
                wasmActive = true;
            } catch (_) {
                // file:// or restricted CORS cleanly uses jsStepGravitySwarm mirror
            }
        })();

        // Game state
        const hole = { x: W * 0.5, y: H * 0.5 };
        const player = { x: 210, y: 290, vx: 0, vy: 0, angle: 0, hp: 100, maxHp: 100, invuln: 0, satAngle: 0, boostTimer: 0 };
        const keys = new Set();
        const pointer = { active: false, x: 210, y: 290, lastMoveX: 210, lastMoveY: 290 };
        let pulsePush = 0;
        let pulseCd = 0;
        let wave = 1;
        let waveTimer = 0;
        let score = 0;
        let combo = 1;
        let comboTimer = 0;
        let activeEntities = DUST_COUNT;
        let shakeTimer = 0;

        const cores = []; // energy core pickups
        const shockRings = [];
        const particles = [];
        const floatTexts = [];

        function fireShockwave() {
            if (ended || pulseCd > 0) return;
            pulsePush = 16.5;
            pulseCd = 1.15;
            playSfx(ctx, 'emp');
            shakeTimer = 0.14;
            shockRings.push({ x: player.x, y: player.y, r: 10, maxR: 220, life: 0.34, maxLife: 0.34, color: PAL.cyan });
            spawnBurstParticles(particles, player.x, player.y, PAL.cyan, 18, 220, 3.2, 0.38);
        }

        bag.on(window, 'keydown', (e) => {
            if (destroyed || ended || ctx.getPaused() || isFormElement(e.target)) return;
            unlockAudio(ctx);
            const k = (e.key || '').toLowerCase();
            keys.add(k);
            if (e.code === 'Space') {
                e.preventDefault();
                fireShockwave();
            } else if (e.key.startsWith('Arrow')) {
                e.preventDefault();
            }
        });
        bag.on(window, 'keyup', (e) => {
            keys.delete((e.key || '').toLowerCase());
        });
        bag.on(window, 'blur', () => { keys.clear(); pointer.active = false; });

        bag.on(canvas, 'pointermove', (e) => {
            const p = stageCoordsFromEvent(canvas, e);
            if (Math.hypot(p.x - pointer.lastMoveX, p.y - pointer.lastMoveY) > 6) {
                pointer.active = true;
                pointer.lastMoveX = p.x;
                pointer.lastMoveY = p.y;
            }
            pointer.x = p.x;
            pointer.y = p.y;
        });
        bag.on(canvas, 'pointerleave', () => { pointer.active = false; });
        bag.on(canvas, 'pointerdown', (e) => {
            if (destroyed || ended || ctx.getPaused()) return;
            unlockAudio(ctx);
            const p = stageCoordsFromEvent(canvas, e);
            pointer.x = p.x;
            pointer.y = p.y;
            fireShockwave();
        });

        function syncHud() {
            ctx.setHud({
                score,
                level: wave,
                maxLevel: isStory ? 6 : 99,
                lives: Math.max(0, Math.ceil(player.hp / 20)),
                statusText: isStory
                    ? L(ctx, `Dalga ${wave} · Kombo x${combo} · ${score}/${storyTarget}`, `Wave ${wave} · Combo x${combo} · ${score}/${storyTarget}`)
                    : L(ctx, `Dalga ${wave} · Kombo x${combo} · ${activeEntities} Parçacık`, `Wave ${wave} · Combo x${combo} · ${activeEntities} Entities`)
            });
        }

        function update(dt) {
            time += dt;
            waveTimer += dt;
            if (shakeTimer > 0) shakeTimer = Math.max(0, shakeTimer - dt);
            if (pulseCd > 0) pulseCd = Math.max(0, pulseCd - dt);
            if (pulsePush > 0) pulsePush = Math.max(0, pulsePush - dt * 68);
            if (player.invuln > 0) player.invuln = Math.max(0, player.invuln - dt);
            if (player.boostTimer > 0) player.boostTimer = Math.max(0, player.boostTimer - dt);
            if (comboTimer > 0) {
                comboTimer -= dt;
                if (comboTimer <= 0) combo = 1;
            }

            // Escalate waves smoothly
            if (waveTimer >= 16) {
                waveTimer = 0;
                wave++;
                playSfx(ctx, 'levelup');
                floatTexts.push({ x: hole.x, y: 80, text: `SINGULARITY WAVE ${wave}`, color: PAL.magenta, life: 1.3, maxLife: 1.3, size: 16 });
            }

            // Player motion (WASD/Arrows priority, or smooth mouse steering)
            let mx = (keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0);
            let my = (keys.has('s') || keys.has('arrowdown') ? 1 : 0) - (keys.has('w') || keys.has('arrowup') ? 1 : 0);
            if (mx !== 0 || my !== 0) {
                pointer.active = false;
                const ml = Math.hypot(mx, my);
                mx /= ml; my /= ml;
                player.vx = lerp(player.vx, mx * 300, clamp(dt * 10, 0, 1));
                player.vy = lerp(player.vy, my * 300, clamp(dt * 10, 0, 1));
            } else if (pointer.active) {
                const dx = pointer.x - player.x;
                const dy = pointer.y - player.y;
                const d = Math.hypot(dx, dy);
                if (d > 10) {
                    const spd = clamp(d * 4.5, 0, 300);
                    player.vx = lerp(player.vx, (dx / d) * spd, clamp(dt * 10, 0, 1));
                    player.vy = lerp(player.vy, (dy / d) * spd, clamp(dt * 10, 0, 1));
                } else {
                    player.vx *= 0.85;
                    player.vy *= 0.85;
                }
            } else {
                player.vx *= Math.pow(0.88, dt * 60);
                player.vy *= Math.pow(0.88, dt * 60);
            }

            // Gentle black hole gravity tug on player near center
            const bhDx = hole.x - player.x;
            const bhDy = hole.y - player.y;
            const bhDist = Math.hypot(bhDx, bhDy);
            if (bhDist > 1) {
                const pull = 2800 / (bhDist + 45);
                player.vx += (bhDx / bhDist) * pull * dt;
                player.vy += (bhDy / bhDist) * pull * dt;
            }

            player.x = clamp(player.x + player.vx * dt, 22, W - 22);
            player.y = clamp(player.y + player.vy * dt, 22, H - 22);
            if (Math.hypot(player.vx, player.vy) > 12) {
                player.angle = Math.atan2(player.vy, player.vx);
            }

            // Event Horizon hazard check for player
            if (dist(player.x, player.y, hole.x, hole.y) < 32) {
                const outAng = Math.atan2(player.y - hole.y, player.x - hole.x);
                player.x = hole.x + Math.cos(outAng) * 44;
                player.y = hole.y + Math.sin(outAng) * 44;
                player.vx = Math.cos(outAng) * 260;
                player.vy = Math.sin(outAng) * 260;
                if (player.invuln <= 0) {
                    player.hp = Math.max(0, player.hp - 18);
                    player.invuln = 0.85;
                    shakeTimer = 0.2;
                    playSfx(ctx, 'playerHurt');
                }
            }

            // Twin auto-orbiting satellites
            player.satAngle += dt * (player.boostTimer > 0 ? 5.6 : 3.4);
            const satR = 54;
            const sat1 = { x: player.x + Math.cos(player.satAngle) * satR, y: player.y + Math.sin(player.satAngle) * satR };
            const sat2 = { x: player.x - Math.cos(player.satAngle) * satR, y: player.y - Math.sin(player.satAngle) * satR };

            const f32 = getF32View();
            const targetHostiles = Math.min(MAX_COUNT - DUST_COUNT, 75 + wave * 28);
            let currentHostiles = 0;

            // Pre-step: count hostiles, apply satellite zaps, snapshot active state for gravity combo tracking
            for (let i = 0; i < MAX_COUNT; i++) {
                const o = i * STRIDE_FLOATS;
                const ex = f32[o];
                if (ex < -900.0) {
                    prevAliveKind[i] = -1;
                    continue;
                }
                const ey = f32[o + 1];
                const kind = f32[o + 5];
                prevAliveKind[i] = kind;
                prevPosX[i] = ex;
                prevPosY[i] = ey;

                if (kind >= 1.0) {
                    currentHostiles++;
                    // Satellite damage
                    if (dist(ex, ey, sat1.x, sat1.y) < 22 || dist(ex, ey, sat2.x, sat2.y) < 22) {
                        f32[o + 4] -= (player.boostTimer > 0 ? 12 : 6);
                        spawnBurstParticles(particles, ex, ey, PAL.mint, 3, 90, 2.2, 0.2);
                    }
                    // Player collision check
                    if (player.invuln <= 0 && dist(ex, ey, player.x, player.y) < 19) {
                        player.hp = Math.max(0, player.hp - 14);
                        player.invuln = 0.7;
                        shakeTimer = 0.16;
                        f32[o + 4] = -1; // vaporize colliding swarmer
                        playSfx(ctx, 'playerHurt');
                        floatTexts.push({ x: player.x, y: player.y - 18, text: '-14 HP', color: PAL.coral, life: 0.7, maxLife: 0.7 });
                    }
                }
            }

            // Spawn new dust & wave swarmers into empty slots
            for (let i = 0; i < MAX_COUNT; i++) {
                const o = i * STRIDE_FLOATS;
                if (f32[o] >= -900.0) continue;
                if (i < DUST_COUNT) {
                    spawnDustInSlot(f32, i);
                } else if (currentHostiles < targetHostiles && Math.random() < 0.24) {
                    spawnEnemyInSlot(f32, i, wave);
                    currentHostiles++;
                }
            }

            // Step N-body swarm inside WebAssembly linear memory!
            const bhStrength = 18000 + wave * 2400 + (pulsePush > 0 ? 8000 : 0);
            let packedRes;
            if (wasmActive && wasmExports) {
                packedRes = wasmExports.stepGravitySwarm(
                    BASE_PTR, MAX_COUNT, dt, W, H,
                    hole.x, hole.y, bhStrength,
                    player.x, player.y, pulsePush
                );
            } else {
                packedRes = jsStepGravitySwarm(
                    f32, 0, MAX_COUNT, dt, W, H,
                    hole.x, hole.y, bhStrength,
                    player.x, player.y, pulsePush
                );
            }
            activeEntities = packedRes & 0xFFFF;

            // Detect enemies swallowed by the black hole for Gravity Combo Chains!
            const f32After = getF32View();
            let swallowedCount = 0;
            for (let i = DUST_COUNT; i < MAX_COUNT; i++) {
                if (prevAliveKind[i] >= 1.0 && f32After[i * STRIDE_FLOATS] < -900.0) {
                    const dHole = dist(prevPosX[i], prevPosY[i], hole.x, hole.y);
                    if (dHole < 52) {
                        swallowedCount++;
                        combo = Math.min(8, combo + 1);
                        comboTimer = 2.8;
                        const pts = 24 * combo;
                        score += pts;
                        if (swallowedCount <= 3) {
                            spawnBurstParticles(particles, hole.x, hole.y, PAL.magenta, 6, 120, 2.8, 0.32);
                        }
                    } else {
                        score += 12;
                    }
                }
            }
            if (swallowedCount > 0) {
                playSfx(ctx, 'xpPickup', 0.2);
                const lastGrav = floatTexts[floatTexts.length - 1];
                const pts = swallowedCount * 24 * combo;
                if (lastGrav && lastGrav._isGravTag && lastGrav.life > 0.55) {
                    lastGrav.text = `GRAVITY x${combo} (+${pts})`;
                    lastGrav.life = 0.85;
                } else if (floatTexts.length < 6) {
                    floatTexts.push({
                        x: hole.x + randRange(-26, 26),
                        y: hole.y - randRange(46, 62),
                        text: `GRAVITY x${combo} (+${pts})`,
                        color: PAL.magenta,
                        life: 0.85,
                        maxLife: 0.85,
                        _isGravTag: true
                    });
                }
            }

            // Energy Core orbital pickups
            if (cores.length < 2 && Math.random() < dt * 0.35) {
                const ang = Math.random() * TAU;
                const r = randRange(125, 220);
                cores.push({
                    x: hole.x + Math.cos(ang) * r,
                    y: hole.y + Math.sin(ang) * r,
                    ang,
                    r,
                    sprite: Math.random() < 0.5 ? 'energy_prism' : 'cryo_crystal'
                });
            }
            for (let i = cores.length - 1; i >= 0; i--) {
                const c = cores[i];
                c.ang += dt * 0.48;
                c.x = hole.x + Math.cos(c.ang) * c.r;
                c.y = hole.y + Math.sin(c.ang) * c.r;
                if (dist(c.x, c.y, player.x, player.y) < 28) {
                    score += 80;
                    player.hp = Math.min(player.maxHp, player.hp + 15);
                    player.boostTimer = 5.0;
                    playSfx(ctx, 'powerup');
                    floatTexts.push({ x: c.x, y: c.y - 12, text: '+80 OVERCHARGE!', color: PAL.cyan, life: 0.9, maxLife: 0.9 });
                    spawnBurstParticles(particles, c.x, c.y, PAL.cyan, 14, 150, 3, 0.4);
                    cores.splice(i, 1);
                }
            }

            syncHud();

            if (!ended && player.hp <= 0) {
                ended = true;
                ctx.onGameOver({
                    score,
                    level: wave,
                    reason: L(ctx, 'Tekillik sürüsü gemiyi parçaladı.', 'Singularity swarm overwhelmed Nova\'s hull.')
                });
            } else if (!ended && isStory && score >= storyTarget) {
                ended = true;
                playSfx(ctx, 'levelup');
                ctx.onWin({
                    score,
                    level: wave,
                    stars: player.hp >= 60 ? 3 : 2,
                    reason: L(ctx, 'Olay Ufku sürüsü kara deliğe süpürüldü!', 'Event Horizon swarm purged into the singularity!')
                });
            }
        }

        function draw(dt) {
            g.save();
            if (shakeTimer > 0) g.translate(randRange(-3.5, 3.5), randRange(-3.5, 3.5));

            g.fillStyle = '#04060f';
            g.fillRect(0, 0, W, H);

            // Relativistic Black Hole Accretion Glow
            const bhGrad = g.createRadialGradient(hole.x, hole.y, 12, hole.x, hole.y, 240);
            bhGrad.addColorStop(0, 'rgba(192, 132, 252, 0.55)');
            bhGrad.addColorStop(0.28, 'rgba(139, 92, 246, 0.22)');
            bhGrad.addColorStop(0.6, 'rgba(56, 189, 248, 0.08)');
            bhGrad.addColorStop(1, 'transparent');
            g.fillStyle = bhGrad;
            g.fillRect(0, 0, W, H);

            drawSprite(g, sprites, 'portal_vortex', hole.x, hole.y, 92, 92, {
                angle: -time * 2.2,
                glow: PAL.magenta,
                glowBlur: 20,
                smooth: true
            });
            g.save();
            g.fillStyle = '#020308';
            g.beginPath();
            g.arc(hole.x, hole.y, 24, 0, TAU);
            g.fill();
            g.strokeStyle = PAL.magenta;
            g.lineWidth = 2;
            g.stroke();
            g.restore();

            // Render all active WASM particles & swarm enemies directly from linear memory
            const f32 = getF32View();
            g.save();
            for (let i = 0; i < MAX_COUNT; i++) {
                const o = i * STRIDE_FLOATS;
                const x = f32[o];
                if (x < -900.0) continue;
                const y = f32[o + 1];
                const kind = f32[o + 5];

                if (kind < 0.5) {
                    g.fillStyle = (i & 1) ? 'rgba(167, 139, 250, 0.72)' : 'rgba(56, 189, 248, 0.68)';
                    g.fillRect(x - 1.3, y - 1.3, 2.6, 2.6);
                } else if (kind < 1.5) {
                    g.fillStyle = PAL.coral;
                    g.beginPath();
                    g.arc(x, y, 4.4, 0, TAU);
                    g.fill();
                } else {
                    g.fillStyle = PAL.amber;
                    g.beginPath();
                    g.arc(x, y, 5.6, 0, TAU);
                    g.fill();
                    g.strokeStyle = PAL.white;
                    g.lineWidth = 1;
                    g.stroke();
                }
            }
            g.restore();

            // Energy cores
            for (let i = 0; i < cores.length; i++) {
                const c = cores[i];
                drawSprite(g, sprites, c.sprite, c.x, c.y, 26, 26, {
                    angle: time * 2,
                    glow: PAL.cyan,
                    glowBlur: 12
                });
            }

            // Shockwave rings
            for (let i = shockRings.length - 1; i >= 0; i--) {
                const s = shockRings[i];
                s.life -= dt;
                if (s.life <= 0) { shockRings.splice(i, 1); continue; }
                const p = 1 - s.life / s.maxLife;
                g.save();
                g.globalAlpha = 1 - p;
                g.strokeStyle = s.color;
                g.lineWidth = 3.5 * (1 - p) + 1;
                g.beginPath();
                g.arc(s.x, s.y, lerp(s.r, s.maxR, p), 0, TAU);
                g.stroke();
                g.restore();
            }

            // Twin Auto-Orbiting Satellites
            const sat1 = { x: player.x + Math.cos(player.satAngle) * 54, y: player.y + Math.sin(player.satAngle) * 54 };
            const sat2 = { x: player.x - Math.cos(player.satAngle) * 54, y: player.y - Math.sin(player.satAngle) * 54 };
            g.save();
            g.strokeStyle = 'rgba(52, 211, 153, 0.22)';
            g.beginPath();
            g.arc(player.x, player.y, 54, 0, TAU);
            g.stroke();
            [sat1, sat2].forEach((s) => {
                g.fillStyle = player.boostTimer > 0 ? PAL.gold : PAL.mint;
                g.shadowColor = PAL.mint;
                g.shadowBlur = 10;
                g.beginPath();
                g.arc(s.x, s.y, 6, 0, TAU);
                g.fill();
            });
            g.restore();

            // Nova craft
            if (!(player.invuln > 0 && Math.floor(time * 20) % 2 === 0)) {
                drawSprite(g, sprites, 'stealth_jet', player.x, player.y, 34, 34, {
                    angle: player.angle + Math.PI * 0.5,
                    glow: PAL.cyan,
                    glowBlur: 14,
                    fallbackColor: PAL.cyan,
                    fallbackShape: 'triangle'
                });
            }

            updateAndDrawParticles(g, particles, dt);
            updateAndDrawFloatTexts(g, floatTexts, dt);

            // Telemetry Pills
            const kernelLabel = wasmActive
                ? 'WASM KERNEL: cosmic_adv.wasm [ACTIVE]'
                : 'WASM KERNEL: JS MIRROR [ACTIVE]';
            const pw = drawPill(g, kernelLabel, 14, 12, wasmActive ? PAL.magenta : PAL.amber, 'rgba(15, 10, 30, 0.88)', 'rgba(192, 132, 252, 0.5)');
            drawPill(g, `${activeEntities} ENTITIES · COMBO x${combo}`, 24 + pw, 12, PAL.cyan);

            // Hull + Shockwave bar bottom left
            drawProgressBar(g, 14, H - 28, 160, 12, player.hp / player.maxHp, player.hp > 35 ? PAL.mint : PAL.coral, 'rgba(15,23,42,0.88)', 'rgba(148,163,184,0.35)');
            drawPill(g, `PULSE [CLICK/SPC] ${pulseCd <= 0 ? 'READY' : pulseCd.toFixed(1) + 's'}`, 184, H - 33, pulseCd <= 0 ? PAL.cyan : PAL.muted);

            g.restore();
        }

        function loop(now) {
            if (destroyed) return;
            const dt = Math.min(0.05, Math.max(0.001, (now - lastTs) / 1000));
            lastTs = now;
            if (!ctx.getPaused() && !ended) {
                update(dt);
            }
            draw(dt);
            rafId = global.requestAnimationFrame(loop);
        }

        syncHud();
        rafId = global.requestAnimationFrame(loop);

        return {
            restart(lv) {
                ended = false;
                wave = Math.max(1, Number(lv) || 1);
                waveTimer = 0;
                score = 0;
                combo = 1;
                comboTimer = 0;
                pulsePush = 0;
                pulseCd = 0;
                player.hp = 100;
                player.x = 210; player.y = 290;
                player.vx = 0; player.vy = 0;
                player.invuln = 0;
                player.boostTimer = 0;
                cores.length = 0;
                shockRings.length = 0;
                particles.length = 0;
                floatTexts.length = 0;
                prevAliveKind.fill(-1);
                seedAllEntities();
                syncHud();
            },
            destroy() {
                destroyed = true;
                if (rafId) global.cancelAnimationFrame(rafId);
                bag.clear();
                wasmExports = null;
                if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
            }
        };
    };

    // =========================================================================
    // 4. D3 GALACTIC CONQUEST RTS (window.d3 v7 forceSimulation + Delaunay)
    // =========================================================================
    Engines['d3-galactic-conquest'] = function mountD3Conquest(ctx) {
        const canvas = setupCanvas(ctx, '2d', W, H);
        const g = canvas.getContext('2d');
        ensureStagePosition(ctx.stageEl);
        const sprites = ensureSprites(ctx, ['reactor_node', 'carrier_ship', 'boss_core', 'missile_pod', 'fighter']);
        const bag = createListenerBag();
        const isStory = isStoryMode(ctx);

        const FACTIONS = {
            player: { id: 'player', color: '#38bdf8', fill: 'rgba(56, 189, 248, 0.13)', name: 'Vanguard' },
            kaelen: { id: 'kaelen', color: '#fb7185', fill: 'rgba(251, 113, 133, 0.12)', name: 'Kaelen' },
            corsair: { id: 'corsair', color: '#a78bfa', fill: 'rgba(167, 139, 250, 0.12)', name: 'Corsairs' },
            neutral: { id: 'neutral', color: '#64748b', fill: 'rgba(100, 116, 139, 0.08)', name: 'Neutral' }
        };

        let destroyed = false;
        let ended = false;
        let rafId = 0;
        let lastTs = performance.now();
        let time = 0;

        let sector = 1;
        let score = 0;
        let aiTimer = 1.2;
        let selectedIds = new Set();
        let sectorBannerTimer = 0;

        let nodes = [];
        let links = [];
        let adj = new Map();
        const fleets = [];
        const particles = [];
        const floatTexts = [];
        const stars = Array.from({ length: 120 }, () => ({
            x: Math.random() * W, y: Math.random() * H,
            r: Math.random() < 0.8 ? 1 : 1.8, a: randRange(0.2, 0.75)
        }));

        // SVG Layer powered by window.d3
        const d3 = global.d3;
        const svgNS = 'http://www.w3.org/2000/svg';
        const svgEl = document.createElementNS(svgNS, 'svg');
        svgEl.setAttribute('viewBox', `0 0 ${W} ${H}`);
        svgEl.setAttribute('preserveAspectRatio', 'none');
        svgEl.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:5;cursor:pointer;user-select:none;';
        if (ctx.stageEl) ctx.stageEl.appendChild(svgEl);

        let sim = null;
        let voronoiLayer = null;
        let laneLayer = null;
        let nodeLayer = null;

        function buildGalaxy(secNum) {
            selectedIds.clear();
            fleets.length = 0;
            if (sim) { try { sim.stop(); } catch (_) {} sim = null; }

            const nodeCount = Math.min(20, 10 + secNum * 2);
            nodes = [];
            links = [];
            adj = new Map();

            for (let i = 0; i < nodeCount; i++) {
                let owner = 'neutral';
                let tier = (i % 3 === 0) ? 2 : 1;
                let ships = randInt(8, 17);
                let initX = randRange(140, W - 140);
                let initY = randRange(95, H - 95);

                if (i === 0) {
                    owner = 'player'; tier = 3; ships = 34; initX = 135; initY = H * 0.5;
                } else if (i === 1) {
                    owner = 'player'; tier = 2; ships = 22; initX = 210; initY = H * 0.28;
                } else if (i === nodeCount - 1) {
                    owner = 'kaelen'; tier = 3; ships = 30 + secNum * 6; initX = W - 135; initY = H * 0.34;
                } else if (i === nodeCount - 2) {
                    owner = 'corsair'; tier = 2; ships = 24 + secNum * 5; initX = W - 175; initY = H * 0.72;
                } else if (secNum >= 2 && i === nodeCount - 3) {
                    owner = 'kaelen'; tier = 2; ships = 20 + secNum * 4; initX = W * 0.65; initY = H * 0.5;
                }

                nodes.push({
                    id: i,
                    x: initX,
                    y: initY,
                    owner,
                    tier,
                    ships,
                    maxCap: tier === 3 ? 130 : (tier === 2 ? 95 : 70),
                    rate: tier === 3 ? 2.4 : (tier === 2 ? 1.7 : 1.15),
                    radius: tier === 3 ? 24 : (tier === 2 ? 20 : 16),
                    sprite: owner === 'player' ? 'carrier_ship' : (owner === 'neutral' ? 'reactor_node' : 'boss_core'),
                    pulse: 0
                });
                adj.set(i, new Set());
            }

            // Build connected spanning tree + extra tactical starlanes
            for (let i = 1; i < nodeCount; i++) {
                let bestP = 0;
                let bestD = Infinity;
                for (let j = 0; j < i; j++) {
                    const d = dist(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
                    if (d < bestD) { bestD = d; bestP = j; }
                }
                links.push({ source: bestP, target: i });
                adj.get(bestP).add(i);
                adj.get(i).add(bestP);
            }
            for (let i = 0; i < nodeCount; i++) {
                // Connect nearest 2 additional neighbors for rich flanking lanes
                const sorted = nodes
                    .filter(n => n.id !== i && !adj.get(i).has(n.id))
                    .sort((a, b) => dist(nodes[i].x, nodes[i].y, a.x, a.y) - dist(nodes[i].x, nodes[i].y, b.x, b.y));
                for (let k = 0; k < Math.min(2, sorted.length); k++) {
                    const nb = sorted[k];
                    if (dist(nodes[i].x, nodes[i].y, nb.x, nb.y) < 330) {
                        links.push({ source: i, target: nb.id });
                        adj.get(i).add(nb.id);
                        adj.get(nb.id).add(i);
                    }
                }
            }

            if (d3 && typeof d3.forceSimulation === 'function') {
                sim = d3.forceSimulation(nodes)
                    .force('link', d3.forceLink(links).id(d => d.id).distance(145).strength(0.55))
                    .force('charge', d3.forceManyBody().strength(-460))
                    .force('center', d3.forceCenter(W * 0.5, H * 0.5))
                    .force('x', d3.forceX(d => d.owner === 'player' ? 160 : (d.owner === 'neutral' ? W * 0.5 : W - 165)).strength(0.14))
                    .force('collide', d3.forceCollide(54))
                    .stop();
                for (let t = 0; t < 110; t++) {
                    sim.tick();
                    for (let i = 0; i < nodes.length; i++) {
                        nodes[i].x = clamp(nodes[i].x, 76, W - 76);
                        nodes[i].y = clamp(nodes[i].y, 70, H - 72);
                    }
                }
            }

            selectedIds.add(0);
            rebuildSvgScene();
            syncHud();
        }

        function shortestPath(fromId, toId) {
            if (fromId === toId) return [];
            const prev = new Map();
            const q = [fromId];
            prev.set(fromId, -1);
            while (q.length) {
                const cur = q.shift();
                if (cur === toId) {
                    const path = [];
                    let p = toId;
                    while (p !== -1) {
                        path.unshift(p);
                        p = prev.get(p);
                    }
                    return path;
                }
                const neighbors = adj.get(cur) || [];
                for (const nb of neighbors) {
                    if (!prev.has(nb)) {
                        prev.set(nb, cur);
                        q.push(nb);
                    }
                }
            }
            return [fromId, toId];
        }

        function launchFleet(fromNode, targetId) {
            if (!fromNode || fromNode.id === targetId || fromNode.ships < 2) return false;
            const sendCount = Math.floor(fromNode.ships * 0.5);
            if (sendCount < 1) return false;
            fromNode.ships -= sendCount;
            const path = shortestPath(fromNode.id, targetId);
            const nextHopId = path.length >= 2 ? path[1] : targetId;
            const nextNode = nodes[nextHopId];
            fleets.push({
                owner: fromNode.owner,
                count: sendCount,
                fromId: fromNode.id,
                hopTargetId: nextHopId,
                finalTargetId: targetId,
                path,
                hopIndex: 1,
                x: fromNode.x,
                y: fromNode.y,
                angle: Math.atan2(nextNode.y - fromNode.y, nextNode.x - fromNode.x),
                speed: 145
            });
            return true;
        }

        function handleNodeClick(node, isDouble, shiftKey) {
            if (ended) return;
            unlockAudio(ctx);

            if (isDouble) {
                // Double-click target -> dispatch 50% from ALL nearby/connected owned stars!
                const targetId = node.id;
                let sentAny = false;
                for (let i = 0; i < nodes.length; i++) {
                    const n = nodes[i];
                    if (n.owner !== 'player' || n.id === targetId || n.ships < 2) continue;
                    const isClose = adj.get(n.id).has(targetId) || dist(n.x, n.y, node.x, node.y) < 340;
                    if (isClose && launchFleet(n, targetId)) sentAny = true;
                }
                if (sentAny) playSfx(ctx, 'shootMissile');
                if (node.owner === 'player') {
                    selectedIds.clear();
                    for (let i = 0; i < nodes.length; i++) {
                        if (nodes[i].owner === 'player' && dist(nodes[i].x, nodes[i].y, node.x, node.y) < 320) {
                            selectedIds.add(nodes[i].id);
                        }
                    }
                }
                updateSvgScene();
                return;
            }

            if (node.owner === 'player') {
                if (shiftKey) {
                    if (selectedIds.has(node.id)) selectedIds.delete(node.id);
                    else selectedIds.add(node.id);
                } else if (selectedIds.size > 0 && !selectedIds.has(node.id)) {
                    // Reinforce another friendly star if source selected, or select if no ships
                    let launched = false;
                    selectedIds.forEach((sid) => {
                        const sNode = nodes[sid];
                        if (sNode && sNode.owner === 'player' && launchFleet(sNode, node.id)) launched = true;
                    });
                    if (launched) playSfx(ctx, 'shootLaser');
                    selectedIds.clear();
                    selectedIds.add(node.id);
                } else {
                    selectedIds.clear();
                    selectedIds.add(node.id);
                    playSfx(ctx, 'uiClick');
                }
            } else {
                // Dispatch from all selected player stars to target
                let launched = false;
                selectedIds.forEach((sid) => {
                    const sNode = nodes[sid];
                    if (sNode && sNode.owner === 'player' && launchFleet(sNode, node.id)) launched = true;
                });
                if (launched) playSfx(ctx, 'shootMissile');
            }
            updateSvgScene();
        }

        function rebuildSvgScene() {
            if (!d3) return;
            const root = d3.select(svgEl);
            root.selectAll('*').remove();

            voronoiLayer = root.append('g').attr('class', 'voronoi-layer');
            laneLayer = root.append('g').attr('class', 'lane-layer');
            nodeLayer = root.append('g').attr('class', 'node-layer');

            // Bottom-left quick [SELECT ALL (A)] SVG button
            const btnG = root.append('g')
                .attr('transform', `translate(14, ${H - 36})`)
                .style('cursor', 'pointer')
                .on('click', (ev) => {
                    ev.stopPropagation();
                    selectedIds.clear();
                    nodes.forEach(n => { if (n.owner === 'player') selectedIds.add(n.id); });
                    playSfx(ctx, 'uiClick');
                    updateSvgScene();
                });
            btnG.append('rect')
                .attr('width', 148).attr('height', 24).attr('rx', 12)
                .attr('fill', 'rgba(11,18,34,0.88)')
                .attr('stroke', 'rgba(56,189,248,0.5)');
            btnG.append('text')
                .attr('x', 74).attr('y', 16)
                .attr('text-anchor', 'middle')
                .attr('fill', '#38bdf8')
                .attr('font-family', FONT_MONO)
                .attr('font-size', '10.5px')
                .attr('font-weight', '700')
                .text('[A] SELECT ALL STARS');

            updateSvgScene();
        }

        function updateSvgScene() {
            if (!d3 || !voronoiLayer) return;

            // D3 Delaunay Voronoi Regions
            if (typeof d3.Delaunay === 'function' && nodes.length >= 2) {
                const del = d3.Delaunay.from(nodes, d => d.x, d => d.y);
                const vor = del.voronoi([0, 0, W, H]);
                voronoiLayer.selectAll('path.vor-cell')
                    .data(nodes, d => d.id)
                    .join('path')
                    .attr('class', 'vor-cell')
                    .attr('d', (d, i) => vor.renderCell(i) || '')
                    .attr('fill', d => FACTIONS[d.owner].fill)
                    .attr('stroke', d => FACTIONS[d.owner].color)
                    .attr('stroke-opacity', 0.24)
                    .attr('stroke-width', 1.2);
            }

            // Starlanes
            laneLayer.selectAll('line.starlane')
                .data(links)
                .join('line')
                .attr('class', 'starlane')
                .attr('x1', d => (typeof d.source === 'object' ? d.source.x : nodes[d.source].x))
                .attr('y1', d => (typeof d.source === 'object' ? d.source.y : nodes[d.source].y))
                .attr('x2', d => (typeof d.target === 'object' ? d.target.x : nodes[d.target].x))
                .attr('y2', d => (typeof d.target === 'object' ? d.target.y : nodes[d.target].y))
                .attr('stroke', d => {
                    const sId = typeof d.source === 'object' ? d.source.id : d.source;
                    const tId = typeof d.target === 'object' ? d.target.id : d.target;
                    return (selectedIds.has(sId) || selectedIds.has(tId))
                        ? 'rgba(56, 189, 248, 0.65)'
                        : 'rgba(148, 163, 184, 0.22)';
                })
                .attr('stroke-width', d => {
                    const sId = typeof d.source === 'object' ? d.source.id : d.source;
                    const tId = typeof d.target === 'object' ? d.target.id : d.target;
                    return (selectedIds.has(sId) || selectedIds.has(tId)) ? 2.4 : 1.3;
                })
                .attr('stroke-dasharray', '5,4');

            // Interactive Star Nodes
            const groups = nodeLayer.selectAll('g.star-node')
                .data(nodes, d => d.id)
                .join((enter) => {
                    const gr = enter.append('g').attr('class', 'star-node');
                    gr.append('circle').attr('class', 'sel-ring');
                    gr.append('circle').attr('class', 'node-rim');
                    gr.append('text').attr('class', 'ship-lbl');
                    gr.on('click', (ev, d) => {
                        ev.stopPropagation();
                        handleNodeClick(d, false, ev.shiftKey);
                    });
                    gr.on('dblclick', (ev, d) => {
                        ev.stopPropagation();
                        handleNodeClick(d, true, ev.shiftKey);
                    });
                    return gr;
                });

            groups.attr('transform', d => `translate(${d.x}, ${d.y})`);
            groups.select('circle.sel-ring')
                .attr('r', d => d.radius + 9)
                .attr('fill', 'none')
                .attr('stroke', PAL.cyan)
                .attr('stroke-width', 2.2)
                .attr('stroke-dasharray', '6,4')
                .attr('opacity', d => selectedIds.has(d.id) ? 0.95 : 0);
            groups.select('circle.node-rim')
                .attr('r', d => d.radius + 3)
                .attr('fill', 'rgba(4, 8, 18, 0.18)')
                .attr('stroke', d => FACTIONS[d.owner].color)
                .attr('stroke-width', 2);
            groups.select('text.ship-lbl')
                .attr('y', d => d.radius + 17)
                .attr('text-anchor', 'middle')
                .attr('fill', '#f8fafc')
                .attr('font-family', FONT_MONO)
                .attr('font-size', '12px')
                .attr('font-weight', '700')
                .attr('paint-order', 'stroke')
                .attr('stroke', '#050811')
                .attr('stroke-width', 3)
                .text(d => String(Math.floor(d.ships)));
        }

        // Fallback click on SVG if D3 missing
        bag.on(svgEl, 'click', (e) => {
            if (d3 || ended || ctx.getPaused()) return;
            const pos = stageCoordsFromEvent(svgEl, e);
            for (let i = 0; i < nodes.length; i++) {
                if (dist(pos.x, pos.y, nodes[i].x, nodes[i].y) <= nodes[i].radius + 10) {
                    handleNodeClick(nodes[i], false, e.shiftKey);
                    break;
                }
            }
        });

        bag.on(window, 'keydown', (e) => {
            if (destroyed || ended || ctx.getPaused() || isFormElement(e.target)) return;
            const k = (e.key || '').toLowerCase();
            if (k === 'a') {
                selectedIds.clear();
                nodes.forEach(n => { if (n.owner === 'player') selectedIds.add(n.id); });
                updateSvgScene();
            }
        });

        function runFactionAi(factionId) {
            const owned = nodes.filter(n => n.owner === factionId && n.ships >= 8);
            if (!owned.length) return;
            owned.sort((a, b) => b.ships - a.ships);
            const src = owned[0];
            const neighborIds = Array.from(adj.get(src.id) || []);
            if (!neighborIds.length) return;

            let bestTarget = null;
            let bestScore = -9999;
            for (let i = 0; i < neighborIds.length; i++) {
                const nb = nodes[neighborIds[i]];
                if (nb.owner === factionId) {
                    // Reinforce threatened border
                    if (nb.ships < src.ships * 0.45) {
                        const s = 10;
                        if (s > bestScore) { bestScore = s; bestTarget = nb; }
                    }
                    continue;
                }
                const advantage = src.ships * 0.5 - nb.ships;
                if (advantage > 1) {
                    const s = advantage + (nb.owner === 'neutral' ? 8 : 14) + nb.tier * 3;
                    if (s > bestScore) { bestScore = s; bestTarget = nb; }
                }
            }
            if (bestTarget) launchFleet(src, bestTarget.id);
        }

        function syncHud() {
            const pCount = nodes.filter(n => n.owner === 'player').length;
            const eCount = nodes.filter(n => n.owner === 'kaelen' || n.owner === 'corsair').length;
            ctx.setHud({
                score,
                level: sector,
                maxLevel: isStory ? 1 : 99,
                lives: pCount,
                statusText: L(ctx, `Sektör ${sector} · Yıldız ${pCount}/${nodes.length} · Düşman ${eCount}`, `Sector ${sector} · Stars ${pCount}/${nodes.length} · Hostiles ${eCount}`)
            });
        }

        function update(dt) {
            time += dt;
            if (sectorBannerTimer > 0) sectorBannerTimer = Math.max(0, sectorBannerTimer - dt);

            // Orbital ship production every second
            let dirtyLabels = false;
            for (let i = 0; i < nodes.length; i++) {
                const n = nodes[i];
                if (n.pulse > 0) n.pulse = Math.max(0, n.pulse - dt);
                if (n.owner !== 'neutral' && n.ships < n.maxCap) {
                    const prevInt = Math.floor(n.ships);
                    n.ships = Math.min(n.maxCap, n.ships + n.rate * dt);
                    if (Math.floor(n.ships) !== prevInt) dirtyLabels = true;
                }
            }

            // Fleet movement & combat resolution
            for (let i = fleets.length - 1; i >= 0; i--) {
                const f = fleets[i];
                const hopNode = nodes[f.hopTargetId];
                if (!hopNode) { fleets.splice(i, 1); continue; }
                const dx = hopNode.x - f.x;
                const dy = hopNode.y - f.y;
                const d = Math.hypot(dx, dy);
                if (d < 12) {
                    if (f.hopTargetId !== f.finalTargetId && f.hopIndex + 1 < f.path.length) {
                        f.hopIndex++;
                        f.hopTargetId = f.path[f.hopIndex];
                        continue;
                    }
                    // Fleet arrives at final target star!
                    if (hopNode.owner === f.owner) {
                        hopNode.ships = Math.min(hopNode.maxCap + 40, hopNode.ships + f.count);
                    } else {
                        hopNode.ships -= f.count;
                        hopNode.pulse = 0.25;
                        spawnBurstParticles(particles, hopNode.x, hopNode.y, FACTIONS[f.owner].color, 12, 140, 3, 0.38);
                        if (hopNode.ships < 0) {
                            const prevOwner = hopNode.owner;
                            hopNode.owner = f.owner;
                            hopNode.ships = Math.abs(hopNode.ships);
                            hopNode.sprite = f.owner === 'player' ? 'carrier_ship' : 'boss_core';
                            if (f.owner === 'player') {
                                const pts = prevOwner === 'neutral' ? 120 : 220;
                                score += pts;
                                playSfx(ctx, 'powerup');
                                floatTexts.push({ x: hopNode.x, y: hopNode.y - 26, text: `CAPTURED +${pts}`, color: PAL.cyan, life: 1.0, maxLife: 1.0 });
                            } else {
                                selectedIds.delete(hopNode.id);
                                playSfx(ctx, 'explodeSmall');
                            }
                        } else {
                            playSfx(ctx, 'hitMetal', 0.15);
                        }
                    }
                    dirtyLabels = true;
                    fleets.splice(i, 1);
                } else {
                    f.angle = Math.atan2(dy, dx);
                    f.x += (dx / d) * f.speed * dt;
                    f.y += (dy / d) * f.speed * dt;
                }
            }

            // AI Tick
            aiTimer -= dt;
            if (aiTimer <= 0) {
                aiTimer = Math.max(0.7, 1.55 - sector * 0.1);
                runFactionAi('kaelen');
                runFactionAi('corsair');
                dirtyLabels = true;
            }

            if (dirtyLabels) {
                updateSvgScene();
                syncHud();
            }

            // Win / Lose checks
            const pStars = nodes.filter(n => n.owner === 'player').length;
            const eStars = nodes.filter(n => n.owner === 'kaelen' || n.owner === 'corsair').length;
            const pFleets = fleets.filter(f => f.owner === 'player').length;

            if (!ended && pStars === 0 && pFleets === 0) {
                ended = true;
                ctx.onGameOver({
                    score,
                    level: sector,
                    reason: L(ctx, 'Tüm Vanguard yıldız üsleri kaybedildi.', 'All Vanguard star systems were lost.')
                });
            } else if (!ended && eStars === 0) {
                score += 500;
                if (isStory) {
                    ended = true;
                    playSfx(ctx, 'levelup');
                    ctx.onWin({
                        score,
                        level: sector,
                        stars: pStars >= Math.floor(nodes.length * 0.7) ? 3 : 2,
                        reason: L(ctx, 'Galaktik sektör tamamen fethedildi!', 'Galactic sector conquered via D3 Fleet Net!')
                    });
                } else {
                    sector++;
                    sectorBannerTimer = 2.2;
                    playSfx(ctx, 'levelup');
                    buildGalaxy(sector);
                }
            }
        }

        function draw(dt) {
            g.fillStyle = '#050812';
            g.fillRect(0, 0, W, H);

            // Starfield
            for (let i = 0; i < stars.length; i++) {
                const s = stars[i];
                g.fillStyle = `rgba(226, 232, 240, ${s.a})`;
                g.fillRect(s.x, s.y, s.r, s.r);
            }

            // Star sprites
            for (let i = 0; i < nodes.length; i++) {
                const n = nodes[i];
                const fCol = FACTIONS[n.owner].color;
                const rad = n.radius * 2.1;
                drawSprite(g, sprites, n.sprite, n.x, n.y, rad, rad, {
                    glow: fCol,
                    glowBlur: n.pulse > 0 ? 22 : 12,
                    hitFlash: n.pulse > 0,
                    fallbackColor: fCol
                });
            }

            // Live flying fleet swarms
            for (let i = 0; i < fleets.length; i++) {
                const f = fleets[i];
                const col = FACTIONS[f.owner].color;
                const shipsToDraw = Math.min(5, Math.max(1, Math.ceil(f.count / 7)));
                for (let k = 0; k < shipsToDraw; k++) {
                    const offAngle = f.angle + (k - (shipsToDraw - 1) * 0.5) * 0.45;
                    const sx = f.x - Math.cos(offAngle) * (k * 5);
                    const sy = f.y - Math.sin(offAngle) * (k * 5);
                    drawSprite(g, sprites, 'fighter', sx, sy, 14, 14, {
                        angle: f.angle + Math.PI * 0.5,
                        glow: col,
                        glowBlur: 7,
                        fallbackColor: col,
                        fallbackShape: 'triangle'
                    });
                }
                g.font = '700 10px ' + FONT_MONO;
                g.fillStyle = PAL.white;
                g.textAlign = 'center';
                g.fillText(String(f.count), f.x, f.y - 12);
            }

            updateAndDrawParticles(g, particles, dt);
            updateAndDrawFloatTexts(g, floatTexts, dt);

            // Top telemetry pills
            const pw = drawPill(g, `D3.JS FORCE + DELAUNAY · SECTOR ${sector}`, 14, 12, PAL.sky);
            drawPill(g, L(ctx, 'Tıkla: Seç/Sevk · Çift Tık: Toplu Saldırı', 'Click: Select/Send · Dbl-Click: Swarm'), 24 + pw, 12, PAL.mint);

            if (sectorBannerTimer > 0) {
                g.save();
                g.font = '700 22px ' + FONT_DISPLAY;
                g.textAlign = 'center';
                g.fillStyle = PAL.cyan;
                g.fillText(`SECTOR ${sector} — D3 GALAXY GENERATED`, W * 0.5, 68);
                g.restore();
            }
        }

        function loop(now) {
            if (destroyed) return;
            const dt = Math.min(0.05, Math.max(0.001, (now - lastTs) / 1000));
            lastTs = now;
            if (!ctx.getPaused() && !ended) {
                update(dt);
            }
            draw(dt);
            rafId = global.requestAnimationFrame(loop);
        }

        buildGalaxy(1);
        rafId = global.requestAnimationFrame(loop);

        return {
            restart(lv) {
                ended = false;
                sector = Math.max(1, Number(lv) || 1);
                score = 0;
                aiTimer = 1.2;
                sectorBannerTimer = 0;
                particles.length = 0;
                floatTexts.length = 0;
                buildGalaxy(sector);
            },
            destroy() {
                destroyed = true;
                if (rafId) global.cancelAnimationFrame(rafId);
                if (sim) { try { sim.stop(); } catch (_) {} sim = null; }
                bag.clear();
                if (d3) { try { d3.select(svgEl).selectAll('*').remove(); } catch (_) {} }
                if (svgEl.parentNode) svgEl.parentNode.removeChild(svgEl);
                if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
            }
        };
    };

    // =========================================================================
    // 5. GLSL SYNTHWAVE TUNNEL SURF (Pure WebGL2 GLSL SDF Raymarching + 2D HUD)
    // =========================================================================
    const VERT_300_ES = `#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
    v_uv = a_pos * 0.5 + 0.5;
    gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

    const FRAG_300_ES = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform vec2 u_res;
uniform float u_time;
uniform float u_zpos;
uniform float u_roll;
uniform float u_hop;
uniform float u_beat;
uniform float u_speed;
uniform float u_danger;

vec2 tunnelPath(float z) {
    return vec2(sin(z * 0.14) * 1.15 + cos(z * 0.07) * 0.55, cos(z * 0.11) * 0.85);
}

mat2 rot2(float a) {
    float c = cos(a), s = sin(a);
    return mat2(c, -s, s, c);
}

float sdTunnel(vec3 p) {
    vec2 center = tunnelPath(p.z);
    vec2 q = p.xy - center;
    float twist = sin(p.z * 0.08) * 0.35;
    q = rot2(twist) * q;
    // Smooth octagonal sci-fi corridor SDF (negated for interior)
    float rCirc = length(q);
    float rOct = max(abs(q.x), abs(q.y)) * 0.72 + (abs(q.x) + abs(q.y)) * 0.36;
    float dWall = 2.05 - mix(rCirc, rOct, 0.45);
    // Procedural recessed structural ribs
    float rib = smoothstep(0.42, 0.5, abs(fract(p.z * 0.42) - 0.5)) * 0.11;
    return dWall - rib;
}

void main() {
    vec2 res = max(u_res, vec2(1.0));
    vec2 uv = (v_uv - 0.5) * vec2(res.x / res.y, 1.0);

    vec3 ro = vec3(tunnelPath(u_zpos), u_zpos);
    vec3 worldUp = vec3(sin(u_roll), cos(u_roll), 0.0);
    // Camera banks with surfer roll & phase hop along -worldUp floor
    ro.xy += worldUp.xy * (-0.82 + u_hop * 0.78);

    vec3 forward = normalize(vec3(tunnelPath(u_zpos + 3.0) - tunnelPath(u_zpos), 3.0));
    vec3 right = normalize(cross(worldUp, forward));
    vec3 up = cross(forward, right);

    vec3 rd = normalize(forward * 1.45 + right * uv.x + up * uv.y);

    float t = 0.0;
    float minD = 999.0;
    float hit = 0.0;
    vec3 p = ro;
    for (int i = 0; i < 48; i++) {
        p = ro + rd * t;
        float d = sdTunnel(p);
        minD = min(minD, abs(d));
        if (d < 0.015) {
            hit = 1.0;
            break;
        }
        t += clamp(d * 0.78, 0.06, 1.35);
        if (t > 44.0) break;
    }

    vec2 tp = p.xy - tunnelPath(p.z);
    float ang = (length(tp) > 0.0001) ? atan(tp.y, tp.x) : 0.0;

    // Synthwave grid & rib neon patterns
    float segZ = abs(fract(p.z * 0.42) - 0.5);
    float ribGlow = exp(-pow((segZ - 0.46) * 26.0, 2.0));
    float laneLines = exp(-pow(abs(fract(ang / 6.2831853 * 12.0) - 0.5) * 14.0, 2.0));
    float speedLines = exp(-pow(abs(fract(ang / 6.2831853 * 24.0 + u_time * 0.2) - 0.5) * 18.0, 2.0)) * 0.25;

    float fog = exp(-t * 0.055);
    vec3 neonCyan = vec3(0.10, 0.88, 1.0);
    vec3 neonMag = vec3(0.95, 0.20, 0.78);
    vec3 deepVoid = vec3(0.025, 0.03, 0.09);

    vec3 wallCol = mix(vec3(0.04, 0.06, 0.16), vec3(0.12, 0.05, 0.25), 0.5 + 0.5 * sin(p.z * 0.2));
    wallCol += neonCyan * laneLines * (0.45 + 0.45 * u_beat);
    wallCol += mix(neonMag, neonCyan, 0.5 + 0.5 * sin(p.z * 0.15 + u_time)) * ribGlow * (0.7 + 0.65 * u_beat);
    wallCol += vec3(0.45, 0.65, 1.0) * speedLines * clamp(u_speed * 0.08, 0.2, 1.2);

    // Horizon vanishing core glow
    float horizonGlow = exp(-length(uv) * 3.1) * (0.45 + 0.45 * u_beat);
    vec3 col = mix(deepVoid, wallCol, hit * fog);
    col += mix(neonMag, neonCyan, 0.5 + 0.5 * sin(u_time * 1.7)) * horizonGlow;

    // Subtle edge chromatic aberration & danger flash
    float edgeDist = length(v_uv - 0.5);
    col.r += edgeDist * 0.14 * (0.4 + u_danger * 2.2);
    col.b += edgeDist * 0.12;
    col = mix(col, vec3(1.0, 0.16, 0.34), clamp(u_danger * 0.45, 0.0, 0.45));

    fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

    Engines['glsl-synthwave-surf'] = function mountGlslSurf(ctx) {
        const glCanvas = setupCanvas(ctx, 'webgl2', W, H);
        const hudCanvas = setupCanvas(ctx, '2d', W, H);
        hudCanvas.style.zIndex = '4';
        const g = hudCanvas.getContext('2d');
        const sprites = ensureSprites(ctx, ['stealth_jet', 'warp_ring']);
        const bag = createListenerBag();
        const isStory = isStoryMode(ctx);
        const storyTarget = ctx.chapterTarget || 1400;

        let destroyed = false;
        let ended = false;
        let rafId = 0;
        let lastTs = performance.now();
        let time = 0;

        // WebGL2 setup
        let gl = null;
        let glProgram = null;
        let glVao = null;
        let glVbo = null;
        let glVs = null;
        let glFs = null;
        let uniforms = {};
        let webgl2Ready = false;

        try {
            gl = glCanvas.getContext('webgl2', { antialias: false, powerPreference: 'high-performance' });
            if (gl) {
                const compileShader = (type, src) => {
                    const sh = gl.createShader(type);
                    gl.shaderSource(sh, src);
                    gl.compileShader(sh);
                    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
                        gl.deleteShader(sh);
                        return null;
                    }
                    return sh;
                };
                glVs = compileShader(gl.VERTEX_SHADER, VERT_300_ES);
                glFs = compileShader(gl.FRAGMENT_SHADER, FRAG_300_ES);
                if (glVs && glFs) {
                    glProgram = gl.createProgram();
                    gl.attachShader(glProgram, glVs);
                    gl.attachShader(glProgram, glFs);
                    gl.linkProgram(glProgram);
                    if (gl.getProgramParameter(glProgram, gl.LINK_STATUS)) {
                        glVao = gl.createVertexArray();
                        gl.bindVertexArray(glVao);
                        glVbo = gl.createBuffer();
                        gl.bindBuffer(gl.ARRAY_BUFFER, glVbo);
                        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
                        const loc = gl.getAttribLocation(glProgram, 'a_pos');
                        gl.enableVertexAttribArray(loc);
                        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
                        gl.bindVertexArray(null);

                        uniforms = {
                            res: gl.getUniformLocation(glProgram, 'u_res'),
                            time: gl.getUniformLocation(glProgram, 'u_time'),
                            zpos: gl.getUniformLocation(glProgram, 'u_zpos'),
                            roll: gl.getUniformLocation(glProgram, 'u_roll'),
                            hop: gl.getUniformLocation(glProgram, 'u_hop'),
                            beat: gl.getUniformLocation(glProgram, 'u_beat'),
                            speed: gl.getUniformLocation(glProgram, 'u_speed'),
                            danger: gl.getUniformLocation(glProgram, 'u_danger')
                        };
                        webgl2Ready = true;
                    }
                }
            }
        } catch (_) {
            webgl2Ready = false;
        }

        // Tunnel surfing state
        let zPos = 0;
        let speed = 13.5;
        let playerAngle = 0; // radians around tunnel floor
        let angVel = 0;
        let hopTimer = 0;
        let hopCd = 0;
        let dangerFlash = 0;
        let invuln = 0;
        let shields = 3;
        let score = 0;
        let multiplier = 1;
        let tier = 1;
        let nextSpawnZ = 22;
        let beatPhase = 0;

        const keys = new Set();
        let steerPointer = { down: false, x: W * 0.5 };
        const objects = []; // { kind: 'gate'|'laser', z, angle, span, hit }
        const particles = [];
        const floatTexts = [];

        function tunnelCenterWorld(z) {
            return {
                x: Math.sin(z * 0.14) * 1.15 + Math.cos(z * 0.07) * 0.55,
                y: Math.cos(z * 0.11) * 0.85
            };
        }

        function triggerHop() {
            if (ended || hopCd > 0) return;
            hopTimer = 0.52;
            hopCd = 0.85;
            playSfx(ctx, 'dash');
            spawnBurstParticles(particles, W * 0.5, H * 0.78, PAL.cyan, 12, 160, 3, 0.35);
        }

        bag.on(window, 'keydown', (e) => {
            if (destroyed || ended || ctx.getPaused() || isFormElement(e.target)) return;
            unlockAudio(ctx);
            const k = (e.key || '').toLowerCase();
            keys.add(k);
            if (e.code === 'Space' || k === 'w' || e.key === 'ArrowUp') {
                e.preventDefault();
                triggerHop();
            } else if (e.key.startsWith('Arrow')) {
                e.preventDefault();
            }
        });
        bag.on(window, 'keyup', (e) => {
            keys.delete((e.key || '').toLowerCase());
        });
        bag.on(window, 'blur', () => { keys.clear(); steerPointer.down = false; });

        bag.on(hudCanvas, 'pointerdown', (e) => {
            if (destroyed || ended || ctx.getPaused()) return;
            unlockAudio(ctx);
            const p = stageCoordsFromEvent(hudCanvas, e);
            steerPointer.down = true;
            steerPointer.x = p.x;
            triggerHop();
        });
        bag.on(hudCanvas, 'pointermove', (e) => {
            if (!steerPointer.down) return;
            const p = stageCoordsFromEvent(hudCanvas, e);
            const dx = p.x - steerPointer.x;
            steerPointer.x = p.x;
            playerAngle += dx * 0.0065;
        });
        bag.on(window, 'pointerup', () => { steerPointer.down = false; });

        function spawnPattern() {
            const gateAngle = wrapAngle(playerAngle + randRange(-1.35, 1.35));
            objects.push({ kind: 'gate', z: zPos + 42, angle: gateAngle, span: 0.48, hit: false });
            if (Math.random() < Math.min(0.85, 0.45 + tier * 0.08)) {
                const laserAngle = wrapAngle(gateAngle + (Math.random() < 0.5 ? 1.15 : -1.15) + randRange(-0.4, 0.4));
                objects.push({ kind: 'laser', z: zPos + 45.5, angle: laserAngle, span: 0.95, hit: false });
            }
        }

        function projectTunnelPoint(worldZ, angle, radius) {
            const dz = worldZ - zPos;
            if (dz <= 0.35) return null;

            const camCenter = tunnelCenterWorld(zPos);
            const objCenter = tunnelCenterWorld(worldZ);
            const roll = -playerAngle;
            const hopY = hopTimer > 0 ? Math.sin((hopTimer / 0.52) * Math.PI) * 0.78 : 0;

            const wux = Math.sin(roll);
            const wuy = Math.cos(roll);
            const roX = camCenter.x + wux * (-0.82 + hopY);
            const roY = camCenter.y + wuy * (-0.82 + hopY);

            const fwdAhead = tunnelCenterWorld(zPos + 3.0);
            let fx = fwdAhead.x - camCenter.x;
            let fy = fwdAhead.y - camCenter.y;
            let fz = 3.0;
            const fLen = Math.hypot(fx, fy, fz) || 1;
            fx /= fLen; fy /= fLen; fz /= fLen;

            // right = normalize(cross(worldUp, forward)), up = cross(forward, right)
            let rx = wuy * fz;
            let ry = -wux * fz;
            let rz = wux * fy - wuy * fx;
            const rLen = Math.hypot(rx, ry, rz) || 1;
            rx /= rLen; ry /= rLen; rz /= rLen;

            const ux = fy * rz - fz * ry;
            const uy = fz * rx - fx * rz;
            const uz = fx * ry - fy * rx;

            const px = objCenter.x + Math.sin(angle) * radius;
            const py = objCenter.y - Math.cos(angle) * radius;
            const dx = px - roX;
            const dy = py - roY;

            const depth = dx * fx + dy * fy + dz * fz;
            if (depth <= 0.35) return null;

            const projX = (dx * rx + dy * ry + dz * rz) / depth;
            const projY = (dx * ux + dy * uy + dz * uz) / depth;
            const focal = H * 1.45;
            return {
                x: W * 0.5 + projX * focal,
                y: H * 0.5 - projY * focal,
                scale: focal / depth,
                dz: depth
            };
        }

        function syncHud() {
            ctx.setHud({
                score: Math.floor(score),
                level: tier,
                maxLevel: isStory ? 5 : 99,
                lives: shields,
                statusText: isStory
                    ? L(ctx, `Sörf x${multiplier} · Skor ${Math.floor(score)}/${storyTarget}`, `Surf x${multiplier} · Score ${Math.floor(score)}/${storyTarget}`)
                    : L(ctx, `Hız ${speed.toFixed(0)} · Çarpan x${multiplier}`, `Warp ${speed.toFixed(0)} · Mult x${multiplier}`)
            });
        }

        function update(dt) {
            time += dt;
            const bpm = 124 + tier * 6;
            beatPhase = Math.pow(0.5 + 0.5 * Math.sin(time * (bpm / 60) * TAU), 4.0);

            if (hopTimer > 0) hopTimer = Math.max(0, hopTimer - dt);
            if (hopCd > 0) hopCd = Math.max(0, hopCd - dt);
            if (dangerFlash > 0) dangerFlash = Math.max(0, dangerFlash - dt * 2.5);
            if (invuln > 0) invuln = Math.max(0, invuln - dt);

            const steer = (keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0);
            angVel = lerp(angVel, steer * 2.85, clamp(dt * 12, 0, 1));
            playerAngle = wrapAngle(playerAngle + angVel * dt);

            speed = 13.5 + Math.min(20, time * 0.22);
            tier = 1 + Math.floor((speed - 13.5) / 3.0);
            zPos += speed * dt;
            score += dt * 16 * multiplier;

            if (zPos + 42 >= nextSpawnZ) {
                nextSpawnZ += Math.max(10.5, 16 - tier * 0.65);
                spawnPattern();
            }

            const isHopping = hopTimer > 0.08;
            for (let i = objects.length - 1; i >= 0; i--) {
                const obj = objects[i];
                if (obj.z < zPos - 1) {
                    objects.splice(i, 1);
                    continue;
                }
                if (!obj.hit && obj.z <= zPos + 1.25 && obj.z >= zPos - 0.5) {
                    const angDiff = Math.abs(wrapAngle(obj.angle - playerAngle));
                    if (obj.kind === 'gate' && angDiff <= obj.span + 0.16) {
                        obj.hit = true;
                        multiplier = Math.min(8, multiplier + 1);
                        const pts = 75 * multiplier;
                        score += pts;
                        playSfx(ctx, 'xpPickup', 0.15);
                        spawnBurstParticles(particles, W * 0.5, H * 0.78, PAL.cyan, 16, 200, 3.2, 0.4);
                        floatTexts.push({ x: W * 0.5, y: H * 0.65, text: `WARP GATE x${multiplier} +${pts}`, color: PAL.cyan, life: 0.9, maxLife: 0.9, size: 15 });
                    } else if (obj.kind === 'laser' && !isHopping && invuln <= 0 && angDiff <= obj.span * 0.52) {
                        obj.hit = true;
                        shields--;
                        multiplier = 1;
                        dangerFlash = 1.0;
                        invuln = 1.0;
                        playSfx(ctx, 'playerHurt');
                        spawnBurstParticles(particles, W * 0.5, H * 0.78, PAL.coral, 20, 220, 3.5, 0.45);
                        floatTexts.push({ x: W * 0.5, y: H * 0.65, text: 'FIREWALL HIT!', color: PAL.coral, life: 0.9, maxLife: 0.9, size: 16 });
                    }
                }
            }

            syncHud();

            if (!ended && shields <= 0) {
                ended = true;
                ctx.onGameOver({
                    score: Math.floor(score),
                    level: tier,
                    reason: L(ctx, 'Güvenlik duvarı lazerleri kalkanı kırdı.', 'Firewall laser arcs shattered interceptor shields.')
                });
            } else if (!ended && isStory && score >= storyTarget) {
                ended = true;
                playSfx(ctx, 'levelup');
                ctx.onWin({
                    score: Math.floor(score),
                    level: tier,
                    stars: shields >= 3 ? 3 : 2,
                    reason: L(ctx, 'GLSL Raymarch hiper-tüneli aşıldı!', 'GLSL Raymarch hyper-tunnel cleared!')
                });
            }
        }

        function draw(dt) {
            const hopOffset = hopTimer > 0 ? Math.sin((hopTimer / 0.52) * Math.PI) : 0;

            // Render WebGL2 SDF Raymarch backdrop
            if (webgl2Ready && gl && glProgram) {
                gl.viewport(0, 0, W, H);
                gl.useProgram(glProgram);
                gl.bindVertexArray(glVao);
                gl.uniform2f(uniforms.res, W, H);
                gl.uniform1f(uniforms.time, time);
                gl.uniform1f(uniforms.zpos, zPos);
                gl.uniform1f(uniforms.roll, -playerAngle);
                gl.uniform1f(uniforms.hop, hopOffset);
                gl.uniform1f(uniforms.beat, beatPhase);
                gl.uniform1f(uniforms.speed, speed);
                gl.uniform1f(uniforms.danger, dangerFlash);
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
                gl.bindVertexArray(null);
            } else {
                // Safe 2D fallback backdrop if WebGL2 unavailable
                const gr = g.createRadialGradient(W * 0.5, H * 0.5, 10, W * 0.5, H * 0.5, 520);
                gr.addColorStop(0, '#1e1b4b');
                gr.addColorStop(1, '#050811');
                g.fillStyle = gr;
                g.fillRect(0, 0, W, H);
            }

            // Clear transparent 2D overlay canvas
            if (webgl2Ready) g.clearRect(0, 0, W, H);

            // Project oncoming 3D Warp Gates & Crimson Firewall Laser Arcs back-to-front
            const sorted = objects.slice().sort((a, b) => b.z - a.z);
            for (let i = 0; i < sorted.length; i++) {
                const obj = sorted[i];
                if (obj.hit) continue;
                const alpha = clamp(1 - (obj.z - zPos) / 44, 0.15, 1);

                if (obj.kind === 'gate') {
                    const pt = projectTunnelPoint(obj.z, obj.angle, 1.48);
                    if (!pt) continue;
                    const sz = clamp(pt.scale * 0.72, 12, 160);
                    g.save();
                    g.globalAlpha = alpha;
                    drawSprite(g, sprites, 'warp_ring', pt.x, pt.y, sz, sz, {
                        angle: time * 2.5,
                        glow: PAL.cyan,
                        glowBlur: 14,
                        smooth: true
                    });
                    g.restore();
                } else {
                    // Crimson Firewall Laser Arc curved along tunnel rim
                    const pts = [];
                    const segs = 8;
                    for (let k = 0; k <= segs; k++) {
                        const a = obj.angle - obj.span * 0.5 + (obj.span * k) / segs;
                        const p = projectTunnelPoint(obj.z, a, 1.56);
                        if (p) pts.push(p);
                    }
                    if (pts.length >= 2) {
                        g.save();
                        g.globalAlpha = alpha;
                        g.strokeStyle = PAL.crimson;
                        g.shadowColor = PAL.crimson;
                        g.shadowBlur = 14;
                        g.lineWidth = clamp(pts[0].scale * 0.08, 3, 14);
                        g.lineCap = 'round';
                        g.beginPath();
                        g.moveTo(pts[0].x, pts[0].y);
                        for (let k = 1; k < pts.length; k++) g.lineTo(pts[k].x, pts[k].y);
                        g.stroke();
                        g.strokeStyle = '#fecdd3';
                        g.lineWidth = Math.max(1.5, g.lineWidth * 0.35);
                        g.stroke();
                        g.restore();
                    }
                }
            }

            // Surfing Interceptor Craft
            const shipX = W * 0.5;
            const shipY = H * 0.79 - hopOffset * 96;
            const bankAngle = angVel * 0.22;
            if (hopOffset > 0.05) {
                g.save();
                g.strokeStyle = 'rgba(34, 211, 238, 0.55)';
                g.lineWidth = 2;
                g.beginPath();
                g.arc(shipX, shipY, 28, 0, TAU);
                g.stroke();
                g.restore();
            }
            if (!(invuln > 0 && Math.floor(time * 20) % 2 === 0)) {
                drawSprite(g, sprites, 'stealth_jet', shipX, shipY, 54, 54, {
                    angle: bankAngle,
                    glow: hopOffset > 0.05 ? PAL.cyan : PAL.magenta,
                    glowBlur: 16,
                    smooth: true,
                    fallbackColor: PAL.cyan,
                    fallbackShape: 'triangle'
                });
            }

            updateAndDrawParticles(g, particles, dt);
            updateAndDrawFloatTexts(g, floatTexts, dt);

            // Minimal HUD Overlay
            const pw = drawPill(g, webgl2Ready ? 'WEBGL2 GLSL 300ES RAYMARCH [60 FPS]' : 'GLSL RAYMARCH [2D FALLBACK]', 14, 12, PAL.magenta, 'rgba(14,8,28,0.86)', 'rgba(232,121,249,0.5)');
            drawPill(g, `MULT x${multiplier} · WARP ${speed.toFixed(0)}`, 24 + pw, 12, PAL.cyan);
            drawPill(g, `SHIELDS ${'◆'.repeat(Math.max(0, shields))}${'◇'.repeat(Math.max(0, 3 - shields))}`, W - 165, 12, shields > 1 ? PAL.mint : PAL.coral);
            drawPill(g, `HOP [SPC] ${hopCd <= 0 ? 'READY' : hopCd.toFixed(1) + 's'}`, 14, H - 34, hopCd <= 0 ? PAL.cyan : PAL.muted);
        }

        function loop(now) {
            if (destroyed) return;
            const dt = Math.min(0.05, Math.max(0.001, (now - lastTs) / 1000));
            lastTs = now;
            if (!ctx.getPaused() && !ended) {
                update(dt);
            }
            draw(dt);
            rafId = global.requestAnimationFrame(loop);
        }

        syncHud();
        rafId = global.requestAnimationFrame(loop);

        return {
            restart(lv) {
                ended = false;
                time = 0;
                zPos = 0;
                speed = 13.5 + ((Math.max(1, Number(lv) || 1) - 1) * 3.0);
                playerAngle = 0;
                angVel = 0;
                hopTimer = 0;
                hopCd = 0;
                dangerFlash = 0;
                invuln = 0;
                shields = 3;
                score = 0;
                multiplier = 1;
                tier = Math.max(1, Number(lv) || 1);
                nextSpawnZ = 22;
                objects.length = 0;
                particles.length = 0;
                floatTexts.length = 0;
                syncHud();
            },
            destroy() {
                destroyed = true;
                if (rafId) global.cancelAnimationFrame(rafId);
                bag.clear();
                if (gl) {
                    try {
                        if (glProgram) gl.deleteProgram(glProgram);
                        if (glVs) gl.deleteShader(glVs);
                        if (glFs) gl.deleteShader(glFs);
                        if (glVbo) gl.deleteBuffer(glVbo);
                        if (glVao) gl.deleteVertexArray(glVao);
                    } catch (_) {}
                }
                if (hudCanvas.parentNode) hudCanvas.parentNode.removeChild(hudCanvas);
                if (glCanvas.parentNode) glCanvas.parentNode.removeChild(glCanvas);
            }
        };
    };

})(typeof window !== 'undefined' ? window : globalThis);
