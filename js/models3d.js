// =============================================================================
// COSMIC SURVIVORS v9.0 — PNG SPRITE & HOLOGRAPHIC TURNTABLE RENDERER
// Zero .svg assets — Uses compiled PNG sprites (pointing UP / -Y in source).
// Preserves full runtime contract with game.js & portal views.
// =============================================================================
(function (global) {
    'use strict';

    const SHIP_META = {
        interceptor: { id: 'interceptor', color: '#38bdf8', name: 'Avcı (Interceptor)' },
        dreadnought: { id: 'dreadnought', color: '#f59e0b', name: 'Kruvazör (Dreadnought)' },
        aegis: { id: 'aegis', color: '#34d399', name: 'Aegis (Kalkan Muhafızı)' },
        phantom: { id: 'phantom', color: '#a78bfa', name: 'Gölge (Void Phantom)' },
        solarflare: { id: 'solarflare', color: '#fb7185', name: 'Solar Flare' },
        tempest: { id: 'tempest', color: '#38bdf8', name: 'Tempest (Kriyo-Fırtına)' },
        valkyrie: { id: 'valkyrie', color: '#f59e0b', name: 'Valkyrie' },
        chronos: { id: 'chronos', color: '#2dd4bf', name: 'Chronos' }
    };

    const BOSS_META = {
        behemoth: { id: 'behemoth', color: '#f59e0b', name: 'Oblivion Behemoth' },
        leviathan: { id: 'leviathan', color: '#fb7185', name: 'Void Leviathan' },
        hivemind: { id: 'hivemind', color: '#a78bfa', name: 'Hivemind Dreadcore' },
        chronovore: { id: 'chronovore', color: '#2dd4bf', name: 'Chronos Weaver' },
        seraphim: { id: 'seraphim', color: '#38bdf8', name: 'Astral Seraphim' }
    };

    const ENEMY_META = {
        swarmer: { id: 'swarmer', color: '#38bdf8' },
        kamikaze: { id: 'kamikaze', color: '#fb7185' },
        shooter: { id: 'shooter', color: '#a78bfa' },
        phantom: { id: 'phantom', color: '#a78bfa' },
        tank: { id: 'tank', color: '#f59e0b' },
        splitter: { id: 'splitter', color: '#34d399' },
        sniper: { id: 'sniper', color: '#fb7185' },
        queen: { id: 'queen', color: '#34d399' }
    };

    const MAP_META = {
        sector9: { id: 'sector9', color: '#38bdf8' },
        nebula: { id: 'nebula', color: '#a78bfa' },
        blackhole: { id: 'blackhole', color: '#fb7185' },
        dyson: { id: 'dyson', color: '#34d399' }
    };

    const ENEMY_ALIAS = {
        drone: 'swarmer',
        speeder: 'swarmer',
        swarmer: 'swarmer',
        kamikaze: 'kamikaze',
        sweeper: 'kamikaze',
        shooter: 'shooter',
        orbiter: 'shooter',
        phantom: 'phantom',
        tank: 'tank',
        shielder: 'tank',
        splitter: 'splitter',
        sniper: 'sniper',
        healer: 'queen',
        queen: 'queen',
        elite: 'queen'
    };

    const BOSS_ALIAS = {
        behemoth: 'behemoth',
        oblivion: 'behemoth',
        chaser: 'leviathan',
        leviathan: 'leviathan',
        bullethell: 'hivemind',
        hivemind: 'hivemind',
        chronos: 'chronovore',
        chronovore: 'chronovore',
        gravity: 'seraphim',
        seraphim: 'seraphim'
    };

    const _cache = {
        ships: {},
        bosses: {},
        enemies: {},
        maps: {}
    };

    let _preloaded = false;

    function _loadImg(category, id, src) {
        const existing = _cache[category][id];
        if (existing) return existing;

        const entry = { img: new Image(), ready: false, error: false, src };
        entry.img.onload = () => { entry.ready = true; };
        entry.img.onerror = () => { entry.error = true; };
        entry.img.src = src;
        _cache[category][id] = entry;
        return entry;
    }

    function preloadAll() {
        if (_preloaded) return;
        _preloaded = true;
        Object.keys(SHIP_META).forEach(id => _loadImg('ships', id, `assets/ships/${id}.png`));
        Object.keys(BOSS_META).forEach(id => _loadImg('bosses', id, `assets/bosses/${id}.png`));
        Object.keys(ENEMY_META).forEach(id => _loadImg('enemies', id, `assets/enemies/${id}.png`));
        Object.keys(MAP_META).forEach(id => _loadImg('maps', id, `assets/maps/${id}.png`));
    }

    function _ensureShip(id) {
        const key = SHIP_META[id] ? id : 'interceptor';
        return _cache.ships[key] || _loadImg('ships', key, `assets/ships/${key}.png`);
    }

    function _ensureEnemy(id) {
        const key = ENEMY_ALIAS[id] || 'swarmer';
        return _cache.enemies[key] || _loadImg('enemies', key, `assets/enemies/${key}.png`);
    }

    function _ensureBoss(id) {
        const key = BOSS_ALIAS[id] || 'behemoth';
        return _cache.bosses[key] || _loadImg('bosses', key, `assets/bosses/${key}.png`);
    }

    function _ensureMap(id) {
        const key = MAP_META[id] ? id : 'sector9';
        return _cache.maps[key] || _loadImg('maps', key, `assets/maps/${key}.png`);
    }

    function _hexToRgba(hex, alpha) {
        const clean = String(hex || '#38bdf8').replace('#', '');
        const full = clean.length === 3
            ? clean.split('').map(c => c + c).join('')
            : clean.padEnd(6, '0').slice(0, 6);
        const r = parseInt(full.slice(0, 2), 16) || 56;
        const g = parseInt(full.slice(2, 4), 16) || 189;
        const b = parseInt(full.slice(4, 6), 16) || 248;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function _drawSpriteOrientedUp(ctx, img, radius, scaleMult = 2.15) {
        const size = radius * scaleMult;
        // Source PNG faces UP (-Y); in world/local canvas space facing = +X, rotate +PI/2
        ctx.rotate(Math.PI / 2);
        ctx.drawImage(img, -size * 0.5, -size * 0.5, size, size);
    }

    function _drawProceduralShipFallback(ctx, radius, color) {
        ctx.beginPath();
        ctx.moveTo(radius * 0.95, 0);
        ctx.lineTo(-radius * 0.55, -radius * 0.72);
        ctx.lineTo(-radius * 0.35, 0);
        ctx.lineTo(-radius * 0.55, radius * 0.72);
        ctx.closePath();
        ctx.fillStyle = _hexToRgba(color, 0.25);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = color;
        ctx.stroke();
    }

    function drawShip(ctx, shipId, x, y, radius, angle, time, opts = {}) {
        if (!ctx) return;
        const meta = SHIP_META[shipId] || SHIP_META.interceptor;
        const color = opts.color || meta.color;
        const t = Number(time) || 0;
        const r = Math.max(8, Number(radius) || 24);
        const entry = _ensureShip(meta.id);

        ctx.save();
        ctx.translate(x, y);

        if (opts.shieldRatio > 0) {
            ctx.beginPath();
            ctx.arc(0, 0, r * 1.18, 0, Math.PI * 2);
            ctx.strokeStyle = _hexToRgba('#38bdf8', Math.min(0.65, 0.2 + opts.shieldRatio * 0.45));
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        ctx.rotate(angle || 0);

        // Subtle thruster flame behind ship (-X axis)
        const speedSq = (opts.vx || 0) * (opts.vx || 0) + (opts.vy || 0) * (opts.vy || 0);
        const thrustBoost = opts.dashing ? 1.65 : (speedSq > 100 ? 1.15 : 0.75);
        const flameLen = r * (0.48 + Math.sin(t * 24) * 0.12) * thrustBoost;
        const flameGrad = ctx.createLinearGradient(-r * 0.55, 0, -r * 0.55 - flameLen, 0);
        flameGrad.addColorStop(0, _hexToRgba(color, 0.78));
        flameGrad.addColorStop(1, _hexToRgba(color, 0));
        ctx.fillStyle = flameGrad;
        ctx.beginPath();
        ctx.moveTo(-r * 0.45, -r * 0.22);
        ctx.lineTo(-r * 0.45 - flameLen, 0);
        ctx.lineTo(-r * 0.45, r * 0.22);
        ctx.closePath();
        ctx.fill();

        ctx.save();
        if (entry.ready && !entry.error) {
            ctx.shadowColor = _hexToRgba(color, opts.dashing ? 0.65 : 0.28);
            ctx.shadowBlur = opts.dashing ? 16 : 8;
            _drawSpriteOrientedUp(ctx, entry.img, r, 2.2);
        } else {
            _drawProceduralShipFallback(ctx, r, color);
        }
        ctx.restore();

        ctx.restore();
    }

    function drawEnemy(ctx, type, x, y, radius, angle, color, time, hpRatio = 1, isElite = false, isFlash = false) {
        if (!ctx) return;
        const canonical = ENEMY_ALIAS[type] || 'swarmer';
        const meta = ENEMY_META[canonical] || ENEMY_META.swarmer;
        const toneColor = color || meta.color;
        const r = Math.max(6, Number(radius) || 16);
        const entry = _ensureEnemy(canonical);

        ctx.save();
        ctx.translate(x, y);

        if (isElite) {
            const pulse = 1.24 + Math.sin((Number(time) || 0) * 5) * 0.06;
            ctx.beginPath();
            ctx.arc(0, 0, r * pulse, 0, Math.PI * 2);
            ctx.strokeStyle = _hexToRgba('#f59e0b', 0.65);
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        ctx.save();
        ctx.rotate(angle || 0);
        if (entry.ready && !entry.error) {
            if (isFlash) {
                ctx.shadowColor = '#ffffff';
                ctx.shadowBlur = 12;
            }
            _drawSpriteOrientedUp(ctx, entry.img, r, 2.15);
        } else {
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
            ctx.fillStyle = isFlash ? '#ffffff' : _hexToRgba(toneColor, 0.35);
            ctx.fill();
            ctx.strokeStyle = toneColor;
            ctx.lineWidth = 1.6;
            ctx.stroke();
        }
        ctx.restore();

        if (hpRatio > 0 && hpRatio < 0.995) {
            const bw = r * 1.5;
            const bh = 3;
            ctx.fillStyle = 'rgba(7, 11, 18, 0.85)';
            ctx.fillRect(-bw / 2, r + 6, bw, bh);
            ctx.fillStyle = isElite ? '#f59e0b' : '#fb7185';
            ctx.fillRect(-bw / 2, r + 6, bw * Math.max(0, Math.min(1, hpRatio)), bh);
        }

        ctx.restore();
    }

    function drawBoss(ctx, bossType, x, y, radius, time, armorAngle, color, gameTime, hpRatio = 1) {
        if (!ctx) return;
        const canonical = BOSS_ALIAS[bossType] || 'behemoth';
        const meta = BOSS_META[canonical] || BOSS_META.behemoth;
        const toneColor = color || meta.color;
        const t = Number(gameTime || time) || 0;
        const r = Math.max(24, Number(radius) || 52);
        const entry = _ensureBoss(canonical);

        ctx.save();
        ctx.translate(x, y);

        // Rotating command halo
        ctx.save();
        ctx.rotate(t * 0.45);
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.24, 0, Math.PI * 2);
        ctx.setLineDash([12, 10]);
        ctx.strokeStyle = _hexToRgba(toneColor, 0.35);
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // Behemoth frontal armor arc indicator (matches game.js 1.75 rad cone)
        if (canonical === 'behemoth') {
            const shieldDir = Number.isFinite(armorAngle) ? armorAngle : Math.PI / 2;
            ctx.beginPath();
            ctx.arc(0, 0, r * 1.15, shieldDir - 1.75, shieldDir + 1.75);
            ctx.strokeStyle = 'rgba(245, 158, 11, 0.88)';
            ctx.lineWidth = 5;
            ctx.stroke();
        }

        ctx.save();
        ctx.rotate((Number.isFinite(armorAngle) && canonical === 'behemoth') ? armorAngle : Math.sin(t * 0.7) * 0.18 - Math.PI / 2);
        if (entry.ready && !entry.error) {
            ctx.shadowColor = _hexToRgba(toneColor, 0.35);
            ctx.shadowBlur = 18;
            _drawSpriteOrientedUp(ctx, entry.img, r, 2.25);
        } else {
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2);
            ctx.fillStyle = _hexToRgba(toneColor, 0.25);
            ctx.fill();
            ctx.strokeStyle = toneColor;
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        ctx.restore();

        if (hpRatio > 0 && hpRatio < 0.999) {
            ctx.beginPath();
            ctx.arc(0, 0, r * 1.32, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0, Math.min(1, hpRatio)));
            ctx.strokeStyle = _hexToRgba('#fb7185', 0.75);
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        ctx.restore();
    }

    function _prepareCanvas(canvas) {
        if (!canvas) return null;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const cssW = canvas.clientWidth || canvas.width || 320;
        const cssH = canvas.clientHeight || canvas.height || 260;
        const targetW = Math.round(cssW * dpr);
        const targetH = Math.round(cssH * dpr);
        if (canvas.width !== targetW || canvas.height !== targetH) {
            canvas.width = targetW;
            canvas.height = targetH;
        }
        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        return { ctx, w: cssW, h: cssH };
    }

    function renderTurntable(canvas, shipId, time, options = {}) {
        const view = _prepareCanvas(canvas);
        if (!view) return;
        const { ctx, w, h } = view;
        const meta = SHIP_META[shipId] || SHIP_META.interceptor;
        const t = Number(time) || 0;
        const color = options.color || meta.color;

        ctx.clearRect(0, 0, w, h);

        const cx = w * 0.5;
        const cy = h * 0.52;
        const baseR = Math.min(w, h) * 0.34;

        // Calm radial stage illumination
        const glow = ctx.createRadialGradient(cx, cy, 4, cx, cy, baseR * 1.65);
        glow.addColorStop(0, _hexToRgba(color, 0.16));
        glow.addColorStop(0.55, _hexToRgba(color, 0.05));
        glow.addColorStop(1, 'rgba(7, 11, 18, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);

        // Turntable perspective rings
        ctx.save();
        ctx.translate(cx, cy + baseR * 0.25);
        ctx.scale(1, 0.38);

        ctx.beginPath();
        ctx.arc(0, 0, baseR * 1.25, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.16)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.save();
        ctx.rotate(t * 0.35);
        ctx.beginPath();
        ctx.arc(0, 0, baseR * 1.02, 0, Math.PI * 2);
        ctx.setLineDash([8, 12]);
        ctx.strokeStyle = _hexToRgba(color, 0.45);
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        ctx.restore();

        // Holographic floating sprite
        const bobY = Math.sin(t * 2.1) * 5;
        const gentleAngle = -Math.PI / 2 + Math.sin(t * 0.85) * 0.18;
        drawShip(ctx, meta.id, cx, cy - 6 + bobY, baseR * 0.62, gentleAngle, t, {
            color,
            vx: 140,
            vy: 0
        });

        // Subtle HUD telemetry reticle
        ctx.font = '500 10px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(148, 163, 184, 0.72)';
        ctx.textAlign = 'left';
        ctx.fillText(`TELEMETRY // ${meta.id.toUpperCase()}`, 14, 20);
        ctx.textAlign = 'right';
        ctx.fillStyle = _hexToRgba(color, 0.85);
        ctx.fillText('ONLINE', w - 14, 20);
    }

    function drawBossHologram(canvas, bossId, time) {
        const view = _prepareCanvas(canvas);
        if (!view) return;
        const { ctx, w, h } = view;
        const canonical = BOSS_ALIAS[bossId] || 'behemoth';
        const meta = BOSS_META[canonical] || BOSS_META.behemoth;
        const t = Number(time) || 0;

        ctx.clearRect(0, 0, w, h);
        const cx = w * 0.5;
        const cy = h * 0.52;
        const r = Math.min(w, h) * 0.30;

        const rad = ctx.createRadialGradient(cx, cy, 4, cx, cy, r * 1.8);
        rad.addColorStop(0, _hexToRgba(meta.color, 0.18));
        rad.addColorStop(1, 'rgba(7, 11, 18, 0)');
        ctx.fillStyle = rad;
        ctx.fillRect(0, 0, w, h);

        drawBoss(ctx, canonical, cx, cy + Math.sin(t * 1.7) * 4, r, t, t * 0.6, meta.color, t, 1);

        ctx.font = '500 10px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(148, 163, 184, 0.75)';
        ctx.textAlign = 'left';
        ctx.fillText(`THREAT // ${canonical.toUpperCase()}`, 12, 18);
    }

    function drawMapPreview(canvas, mapId, time) {
        const view = _prepareCanvas(canvas);
        if (!view) return;
        const { ctx, w, h } = view;
        const meta = MAP_META[mapId] || MAP_META.sector9;
        const entry = _ensureMap(meta.id);
        const t = Number(time) || 0;

        ctx.clearRect(0, 0, w, h);

        if (entry.ready && !entry.error) {
            const img = entry.img;
            const scale = Math.max(w / img.width, h / img.height);
            const dw = img.width * scale;
            const dh = img.height * scale;
            ctx.save();
            ctx.globalAlpha = 0.82;
            ctx.drawImage(img, (w - dw) * 0.5, (h - dh) * 0.5, dw, dh);
            ctx.restore();
        } else {
            ctx.fillStyle = '#0d1320';
            ctx.fillRect(0, 0, w, h);
        }

        // Calm dark overlay & subtle tactical grid
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, 'rgba(7, 11, 18, 0.20)');
        grad.addColorStop(1, 'rgba(7, 11, 18, 0.78)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Animated radar ring overlay
        const cx = w * 0.5;
        const cy = h * 0.5;
        const rad = Math.min(w, h) * 0.32;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(t * 0.4);
        ctx.beginPath();
        ctx.arc(0, 0, rad, 0, Math.PI * 1.45);
        ctx.strokeStyle = _hexToRgba(meta.color, 0.55);
        ctx.lineWidth = 1.6;
        ctx.stroke();
        ctx.restore();

        ctx.font = '600 10px "JetBrains Mono", monospace';
        ctx.fillStyle = '#e2e8f0';
        ctx.textAlign = 'left';
        ctx.fillText(`SECTOR SCAN // ${meta.id.toUpperCase()}`, 12, h - 12);
    }

    preloadAll();

    global.CosmicModels = {
        SHIPS: SHIP_META,
        BOSSES: BOSS_META,
        ENEMIES: ENEMY_META,
        MAPS: MAP_META,
        cache: _cache,
        preloadAll,
        drawShip,
        drawEnemy,
        drawBoss,
        renderTurntable,
        drawShipTurntable: renderTurntable,
        drawBossHologram,
        drawMapPreview,
        getShipImage(shipId) {
            const e = _ensureShip(shipId);
            return e && e.ready ? e.img : null;
        },
        getBossImage(bossId) {
            const e = _ensureBoss(bossId);
            return e && e.ready ? e.img : null;
        },
        getEnemyImage(enemyId) {
            const e = _ensureEnemy(enemyId);
            return e && e.ready ? e.img : null;
        },
        getMapImage(mapId) {
            const e = _ensureMap(mapId);
            return e && e.ready ? e.img : null;
        }
    };
})(window);
