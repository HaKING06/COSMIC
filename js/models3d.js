'use strict';

// ═══════════════════════════════════════════════════════════════════════════
// COSMIC SURVIVORS v8.0 — 3D / 2.5D HD SPACECRAFT, BOSS & ENEMY MODEL ENGINE
// Exposes window.CosmicModels:
//   • Preloaded SVG/PNG Image Cache + Instant Procedural 2.5D Canvas Renderer
//   • CosmicModels.drawShip(ctx, shipId, x, y, radius, angle, time, opts)
//   • CosmicModels.drawEnemy(ctx, type, x, y, radius, angle, color, time, hpRatio)
//   • CosmicModels.drawBoss(ctx, bossType, x, y, radius, angle, armorAngle, color, time, hpRatio)
//   • CosmicModels.renderTurntable(canvas, shipId, time, opts)
// ═══════════════════════════════════════════════════════════════════════════

(function (global) {
    const TAU = Math.PI * 2;
    const HALF_PI = Math.PI / 2;

    function clamp(v, lo, hi) {
        return v < lo ? lo : v > hi ? hi : v;
    }

    // ── Model Metadata Catalog ──
    const SHIP_META = {
        interceptor: {
            id: 'interceptor',
            name: 'AVCI (INTERCEPTOR)',
            role: 'Cyber-Stealth Twin-Wing Fighter',
            primary: '#00f0ff',
            secondary: '#0066ff',
            core: '#80ffff',
            callouts: ['DUAL PHOTON CANNONS', 'AERO-STEALTH WING', 'TWIN ION THRUSTERS']
        },
        dreadnought: {
            id: 'dreadnought',
            name: 'KRUVAZÖR (DREADNOUGHT)',
            role: 'Heavy Armored Siege Battleship',
            primary: '#ffaa00',
            secondary: '#ff4400',
            core: '#ffee88',
            callouts: ['PLASMA ARTILLERY TURRETS', 'REACTIVE ARMOR PLATES', 'QUAD SIEGE THRUSTERS']
        },
        aegis: {
            id: 'aegis',
            name: 'AEGIS (KALKAN MUHAFIZI)',
            role: 'Hexagonal Shield Guardian Frigate',
            primary: '#00ffcc',
            secondary: '#bf00ff',
            core: '#ffffff',
            callouts: ['GYRO ENERGY RING', '6x PROJECTOR PYLONS', 'HARMONIC SHIELD CORE']
        },
        phantom: {
            id: 'phantom',
            name: 'GÖLGE (VOID PHANTOM)',
            role: 'Swept-Forward Void Assassin',
            primary: '#ff006a',
            secondary: '#7b00ff',
            core: '#ff80bf',
            callouts: ['PHASE SCYTHE BLADES', 'DARK-MATTER CORE', 'CLOAK EMITTER ARRAY']
        },
        solarflare: {
            id: 'solarflare',
            name: 'SOLAR FLARE (GÜNEŞ FIRTINASI)',
            role: 'Phoenix-Wing Fusion Cruiser',
            primary: '#ff6600',
            secondary: '#ffcc00',
            core: '#ffffff',
            callouts: ['PHOENIX CORONA WINGS', 'FUSION HEART REACTOR', 'THERMAL RADIATOR VENTS']
        },
        tempest: {
            id: 'tempest',
            name: 'TEMPEST (FIRTINA KORVETİ)',
            role: 'Cryo-Tesla Storm Corvette',
            primary: '#00d8ff',
            secondary: '#a8f0ff',
            core: '#ffffff',
            callouts: ['TWIN TESLA ARC COILS', 'CRYO FROST EMITTERS', 'STORM CAPACITOR CORE']
        },
        valkyrie: {
            id: 'valkyrie',
            name: 'VALKYRIE (YÖRÜNGE TAŞIYICI)',
            role: 'Orbital Railgun & Drone Carrier',
            primary: '#ffd700',
            secondary: '#00e5ff',
            core: '#ffffff',
            callouts: ['TWIN RAILGUN PRONGS', 'DOCKED MICRO-DRONES', 'ORBITAL COMMAND DECK']
        },
        chronos: {
            id: 'chronos',
            name: 'CHRONOS (ZAMAN TEKİLLİĞİ)',
            role: 'Temporal Singularity Vessel',
            primary: '#00ffd5',
            secondary: '#ff00aa',
            core: '#ffffff',
            callouts: ['GYROSCOPIC TIME-RINGS', 'TEMPORAL SPEAR HULL', 'SINGULARITY HOURGLASS']
        }
    };

    const BOSS_META = {
        behemoth:   { id: 'behemoth',   name: 'OBLIVION BEHEMOTH',  primary: '#ff6600', secondary: '#ffaa00', core: '#00f0ff' },
        leviathan:  { id: 'leviathan',  name: 'VOID LEVIATHAN',     primary: '#00ff88', secondary: '#7700ff', core: '#00ffcc' },
        hivemind:   { id: 'hivemind',   name: 'NEXUS HIVE-QUEEN',   primary: '#ff006a', secondary: '#ffaa00', core: '#ff66b2' },
        chronovore: { id: 'chronovore', name: 'CHRONOVORE',         primary: '#00ffcc', secondary: '#9900ff', core: '#ffffff' },
        seraphim:   { id: 'seraphim',   name: 'CORRUPTED SERAPHIM', primary: '#ffd700', secondary: '#ff0055', core: '#ffffff' }
    };

    const ENEMY_META = {
        swarmer:  { id: 'swarmer',  primary: '#ff3366', secondary: '#990033' },
        shooter:  { id: 'shooter',  primary: '#cc44ff', secondary: '#5500aa' },
        tank:     { id: 'tank',     primary: '#ff8800', secondary: '#aa3300' },
        splitter: { id: 'splitter', primary: '#ff6600', secondary: '#ffcc00' },
        phantom:  { id: 'phantom',  primary: '#aa66ff', secondary: '#440088' },
        queen:    { id: 'queen',    primary: '#ffd700', secondary: '#ff006a' },
        sniper:   { id: 'sniper',   primary: '#ff0044', secondary: '#770022' },
        kamikaze: { id: 'kamikaze', primary: '#ff4400', secondary: '#ffcc00' }
    };

    const MAP_META = {
        sector9:   { id: 'sector9',   name: 'Sektör 9 Enkazı',      primary: '#00f0ff', secondary: '#ffaa00' },
        nebula:    { id: 'nebula',    name: 'Kuantum Nebulası',     primary: '#ff006a', secondary: '#00f0ff' },
        blackhole: { id: 'blackhole', name: 'Kara Delik Çevresi',   primary: '#ff5500', secondary: '#ffaa00' },
        dyson:     { id: 'dyson',     name: 'Dyson Küresi Kalıntısı', primary: '#ffd700', secondary: '#00f0ff' }
    };

    // Map game.js enemy types to canonical 8 SVG enemy models
    const ENEMY_ALIAS = {
        drone: 'swarmer',
        swarmer: 'swarmer',
        speeder: 'kamikaze',
        kamikaze: 'kamikaze',
        shooter: 'shooter',
        orbiter: 'phantom',
        phantom: 'phantom',
        tank: 'tank',
        shielder: 'tank',
        splitter: 'splitter',
        sniper: 'sniper',
        sweeper: 'queen',
        healer: 'queen',
        queen: 'queen'
    };

    // Map game.js boss types to canonical 5 SVG boss models
    const BOSS_ALIAS = {
        behemoth: 'behemoth',
        chronos: 'chronovore',
        chronovore: 'chronovore',
        leviathan: 'leviathan',
        chaser: 'leviathan',
        hivemind: 'hivemind',
        bullethell: 'hivemind',
        seraphim: 'seraphim',
        gravity: 'seraphim'
    };

    // ── Preloaded Image Cache ──
    const _cache = {
        ships: {},
        bosses: {},
        enemies: {},
        maps: {}
    };

    function _loadImg(category, id, relPath) {
        if (typeof Image === 'undefined') return null;
        const entry = { img: new Image(), loaded: false, error: false, src: relPath };
        entry.img.onload = function () { entry.loaded = true; };
        entry.img.onerror = function () {
            // Try PNG fallback if SVG fails
            if (relPath.endsWith('.svg')) {
                const pngPath = relPath.replace(/\.svg$/, '.png');
                entry.img.onerror = function () { entry.error = true; };
                entry.img.src = pngPath;
            } else {
                entry.error = true;
            }
        };
        entry.img.src = relPath;
        _cache[category][id] = entry;
        return entry;
    }

    function preloadAll() {
        Object.keys(SHIP_META).forEach(id => _loadImg('ships', id, `assets/ships/${id}.svg`));
        Object.keys(BOSS_META).forEach(id => _loadImg('bosses', id, `assets/bosses/${id}.svg`));
        Object.keys(ENEMY_META).forEach(id => _loadImg('enemies', id, `assets/enemies/${id}.svg`));
        Object.keys(MAP_META).forEach(id => _loadImg('maps', id, `assets/maps/${id}.svg`));
    }

    if (typeof window !== 'undefined') {
        preloadAll();
    }

    // ── Helper: Draw Thruster Flame Plumes (in local ship space where +X is nose, -X is tail) ──
    function drawThrusterPlume(ctx, x, y, length, width, color1, color2, time, phaseOffset) {
        const flicker = 0.84 + 0.24 * Math.sin(time * 28 + phaseOffset) + 0.12 * Math.cos(time * 43 + phaseOffset);
        const L = length * flicker;
        const W = width * (0.9 + 0.15 * Math.sin(time * 22 + phaseOffset));

        ctx.save();
        const grad = ctx.createLinearGradient(x, y, x - L, y);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.28, color1);
        grad.addColorStop(0.72, color2);
        grad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(x, y - W);
        ctx.quadraticCurveTo(x - L * 0.55, y - W * 0.45, x - L, y);
        ctx.quadraticCurveTo(x - L * 0.55, y + W * 0.45, x, y + W);
        ctx.closePath();
        ctx.fill();

        // Inner white-hot shock diamond core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(x, y - W * 0.48);
        ctx.lineTo(x - L * 0.48, y);
        ctx.lineTo(x, y + W * 0.48);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    // ── Procedural 2.5D Ship Hull & Animated Subsystems (Forward = +X) ──
    function drawProceduralShipHull(ctx, shipId, r, time, meta, bank, spriteLoaded) {
        const p = meta.primary;
        const s = meta.secondary;
        const pulse = 0.78 + 0.22 * Math.sin(time * 6);

        // If SVG image is not yet loaded, draw full multi-layered 2.5D metallic hull geometry
        if (!spriteLoaded) {
            ctx.save();
            ctx.scale(1, 1 - Math.abs(bank) * 0.16);

            const hullGrad = ctx.createLinearGradient(r * 1.2, -r, -r * 1.2, r);
            hullGrad.addColorStop(0, '#36465e');
            hullGrad.addColorStop(0.45, '#192231');
            hullGrad.addColorStop(1, '#090d14');

            ctx.fillStyle = hullGrad;
            ctx.strokeStyle = p;
            ctx.lineWidth = Math.max(1.5, r * 0.09);

            if (shipId === 'interceptor') {
                // Swept twin-wing cyber fighter
                ctx.beginPath();
                ctx.moveTo(r * 1.42, 0);
                ctx.lineTo(r * 0.35, -r * 0.42);
                ctx.lineTo(-r * 0.48, -r * 1.15);
                ctx.lineTo(-r * 0.85, -r * 0.95);
                ctx.lineTo(-r * 0.55, -r * 0.38);
                ctx.lineTo(-r * 0.96, -r * 0.24);
                ctx.lineTo(-r * 0.96, r * 0.24);
                ctx.lineTo(-r * 0.55, r * 0.38);
                ctx.lineTo(-r * 0.85, r * 0.95);
                ctx.lineTo(-r * 0.48, r * 1.15);
                ctx.lineTo(r * 0.35, r * 0.42);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            } else if (shipId === 'dreadnought') {
                // Heavy broadside battleship
                ctx.beginPath();
                ctx.moveTo(r * 1.25, -r * 0.36);
                ctx.lineTo(r * 0.65, -r * 0.75);
                ctx.lineTo(-r * 0.15, -r * 1.12);
                ctx.lineTo(-r * 0.88, -r * 0.98);
                ctx.lineTo(-r * 1.05, -r * 0.52);
                ctx.lineTo(-r * 1.05, r * 0.52);
                ctx.lineTo(-r * 0.88, r * 0.98);
                ctx.lineTo(-r * 0.15, r * 1.12);
                ctx.lineTo(r * 0.65, r * 0.75);
                ctx.lineTo(r * 1.25, r * 0.36);
                ctx.lineTo(r * 0.92, 0);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            } else if (shipId === 'aegis') {
                // Hexagonal guardian frigate
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const a = (i / 6) * TAU;
                    const rad = i % 2 === 0 ? r * 1.18 : r * 0.96;
                    ctx[i === 0 ? 'moveTo' : 'lineTo'](Math.cos(a) * rad, Math.sin(a) * rad);
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            } else if (shipId === 'phantom') {
                // Swept-forward void scythes
                ctx.beginPath();
                ctx.moveTo(r * 1.45, 0);
                ctx.lineTo(r * 0.25, -r * 0.36);
                ctx.lineTo(r * 0.95, -r * 0.88);
                ctx.lineTo(-r * 0.35, -r * 1.18);
                ctx.lineTo(-r * 0.88, -r * 0.42);
                ctx.lineTo(-r * 1.08, 0);
                ctx.lineTo(-r * 0.88, r * 0.42);
                ctx.lineTo(-r * 0.35, r * 1.18);
                ctx.lineTo(r * 0.95, r * 0.88);
                ctx.lineTo(r * 0.25, r * 0.36);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            } else if (shipId === 'solarflare') {
                // Phoenix solar pinions
                ctx.beginPath();
                ctx.moveTo(r * 1.38, 0);
                ctx.lineTo(r * 0.42, -r * 0.38);
                ctx.lineTo(r * 0.68, -r * 1.24);
                ctx.lineTo(-r * 0.22, -r * 0.92);
                ctx.lineTo(-r * 0.72, -r * 1.05);
                ctx.lineTo(-r * 1.02, 0);
                ctx.lineTo(-r * 0.72, r * 1.05);
                ctx.lineTo(-r * 0.22, r * 0.92);
                ctx.lineTo(r * 0.68, r * 1.24);
                ctx.lineTo(r * 0.42, r * 0.38);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            } else if (shipId === 'tempest') {
                // Twin-prong Tesla storm corvette
                ctx.beginPath();
                ctx.moveTo(r * 1.32, -r * 0.22);
                ctx.lineTo(r * 1.32, -r * 0.48);
                ctx.lineTo(r * 0.15, -r * 0.55);
                ctx.lineTo(-r * 0.25, -r * 1.14);
                ctx.lineTo(-r * 0.95, -r * 0.65);
                ctx.lineTo(-r * 0.95, r * 0.65);
                ctx.lineTo(-r * 0.25, r * 1.14);
                ctx.lineTo(r * 0.15, r * 0.55);
                ctx.lineTo(r * 1.32, r * 0.48);
                ctx.lineTo(r * 1.32, r * 0.22);
                ctx.lineTo(r * 0.45, 0);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            } else if (shipId === 'valkyrie') {
                // Twin-railgun orbital carrier
                ctx.beginPath();
                ctx.moveTo(r * 1.38, -r * 0.16);
                ctx.lineTo(r * 1.38, -r * 0.34);
                ctx.lineTo(r * 0.2, -r * 0.42);
                ctx.lineTo(-r * 0.45, -r * 1.18);
                ctx.lineTo(-r * 0.92, -r * 1.08);
                ctx.lineTo(-r * 1.04, 0);
                ctx.lineTo(-r * 0.92, r * 1.08);
                ctx.lineTo(-r * 0.45, r * 1.18);
                ctx.lineTo(r * 0.2, r * 0.42);
                ctx.lineTo(r * 1.38, r * 0.34);
                ctx.lineTo(r * 1.38, r * 0.16);
                ctx.lineTo(r * 0.38, 0);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            } else {
                // Chronos singularity vessel
                ctx.beginPath();
                ctx.moveTo(r * 1.4, 0);
                ctx.lineTo(r * 0.2, -r * 0.42);
                ctx.lineTo(-r * 0.35, -r * 1.05);
                ctx.lineTo(-r * 1.02, 0);
                ctx.lineTo(-r * 0.35, r * 1.05);
                ctx.lineTo(r * 0.2, r * 0.42);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
            ctx.restore();
        }

        // ── Animated Dynamic Overlays (Turrets, Gyro Rings, Arc Coils, Drones, Core) ──
        if (shipId === 'dreadnought') {
            // Dual animated rotating artillery turrets
            const turretSwivel = Math.sin(time * 2.4) * 0.28;
            [-r * 0.46, r * 0.46].forEach((ty, idx) => {
                ctx.save();
                ctx.translate(r * 0.18, ty);
                ctx.rotate(turretSwivel * (idx === 0 ? 1 : -1));
                ctx.fillStyle = '#1d2636';
                ctx.strokeStyle = p;
                ctx.lineWidth = 1.4;
                ctx.beginPath();
                ctx.arc(0, 0, r * 0.22, 0, TAU);
                ctx.fill();
                ctx.stroke();
                ctx.strokeStyle = '#ffe699';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(0, -r * 0.07);
                ctx.lineTo(r * 0.38, -r * 0.07);
                ctx.moveTo(0, r * 0.07);
                ctx.lineTo(r * 0.38, r * 0.07);
                ctx.stroke();
                ctx.restore();
            });
        } else if (shipId === 'aegis') {
            // Counter-rotating hexagonal projector ring
            ctx.save();
            ctx.rotate(time * 1.65);
            ctx.strokeStyle = p;
            ctx.lineWidth = 1.8;
            ctx.setLineDash([r * 0.28, r * 0.18]);
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.92, 0, TAU);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
        } else if (shipId === 'tempest') {
            // Crackling Tesla lightning arc between forward coils
            ctx.save();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(r * 0.92, -r * 0.34);
            ctx.lineTo(r * (0.98 + 0.08 * Math.sin(time * 37)), -r * 0.12);
            ctx.lineTo(r * (0.90 + 0.08 * Math.cos(time * 43)), r * 0.12);
            ctx.lineTo(r * 0.92, r * 0.34);
            ctx.stroke();
            ctx.restore();
        } else if (shipId === 'valkyrie') {
            // Orbiting micro-wingman drones
            for (let i = 0; i < 2; i++) {
                const da = time * 2.8 + i * Math.PI;
                const dx = Math.cos(da) * r * 0.22 - r * 0.18;
                const dy = (i === 0 ? -1 : 1) * r * 0.78 + Math.sin(da) * r * 0.1;
                ctx.save();
                ctx.translate(dx, dy);
                ctx.fillStyle = '#00e5ff';
                ctx.beginPath();
                ctx.moveTo(r * 0.22, 0);
                ctx.lineTo(-r * 0.14, -r * 0.14);
                ctx.lineTo(-r * 0.14, r * 0.14);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
        } else if (shipId === 'chronos') {
            // Counter-rotating gyroscopic temporal rings
            ctx.save();
            ctx.rotate(-time * 2.2);
            ctx.strokeStyle = p;
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.ellipse(0, 0, r * 0.85, r * 0.45, 0.4, 0, TAU);
            ctx.stroke();
            ctx.rotate(time * 4.4);
            ctx.strokeStyle = s;
            ctx.beginPath();
            ctx.ellipse(0, 0, r * 0.85, r * 0.45, -0.4, 0, TAU);
            ctx.stroke();
            ctx.restore();
        }

        // Glowing Reactor Core & Cockpit Specular Highlight
        const coreR = r * (0.22 * pulse);
        const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, coreR * 2.2);
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.4, meta.core);
        coreGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(-r * 0.08, 0, coreR * 2.2, 0, TAU);
        ctx.fill();

        // Cockpit Glint
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.beginPath();
        ctx.ellipse(r * 0.36, -r * 0.04, r * 0.18, r * 0.06, -0.2, 0, TAU);
        ctx.fill();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 1. CosmicModels.drawShip(ctx, shipId, x, y, radius, angle, time, opts)
    // ═══════════════════════════════════════════════════════════════════════
    function drawShip(ctx, shipId, x, y, radius, angle, time, opts) {
        if (!ctx) return;
        opts = opts || {};
        const id = SHIP_META[shipId] ? shipId : 'interceptor';
        const meta = SHIP_META[id];
        const r = Math.max(8, radius || 20);
        const t = typeof time === 'number' ? time : performance.now() * 0.001;
        const ang = typeof angle === 'number' ? angle : 0;
        const bank = clamp(typeof opts.bank === 'number' ? opts.bank : Math.sin(t * 2.5) * 0.22, -0.65, 0.65);
        const thrust = clamp(typeof opts.thrust === 'number' ? opts.thrust : 1.0, 0.3, 1.8);
        const shieldRatio = clamp(typeof opts.shieldRatio === 'number' ? opts.shieldRatio : 0, 0, 1);

        ctx.save();
        ctx.translate(x, y);

        if (opts.stealth) {
            ctx.globalAlpha = 0.38 + 0.1 * Math.sin(t * 14);
        } else if (opts.invulnerable && Math.floor(t * 14) % 2 === 0) {
            ctx.globalAlpha = 0.58;
        }

        // 1. 2.5D Offset Banking Drop-Shadow beneath the ship
        if (!opts.noShadow) {
            ctx.save();
            ctx.translate(-Math.cos(ang) * r * 0.25 + 4, -Math.sin(ang) * r * 0.25 + 8);
            ctx.rotate(ang);
            ctx.scale(1.05, 0.82);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
            ctx.beginPath();
            ctx.ellipse(0, 0, r * 1.15, r * 0.85, 0, 0, TAU);
            ctx.fill();
            ctx.restore();
        }

        // 2. Rotate into Ship Forward (+X) Coordinate Frame
        ctx.save();
        ctx.rotate(ang);

        // 3. Multi-Port Engine Afterburner Flame Plumes
        const plumeLen = r * 1.15 * thrust;
        const plumeWid = r * 0.22;
        if (id === 'dreadnought') {
            drawThrusterPlume(ctx, -r * 0.85, -r * 0.46, plumeLen * 0.9, plumeWid * 0.8, meta.primary, meta.secondary, t, 0.0);
            drawThrusterPlume(ctx, -r * 0.92, -r * 0.18, plumeLen * 1.1, plumeWid, meta.primary, meta.secondary, t, 1.2);
            drawThrusterPlume(ctx, -r * 0.92,  r * 0.18, plumeLen * 1.1, plumeWid, meta.primary, meta.secondary, t, 2.4);
            drawThrusterPlume(ctx, -r * 0.85,  r * 0.46, plumeLen * 0.9, plumeWid * 0.8, meta.primary, meta.secondary, t, 3.6);
        } else if (id === 'interceptor' || id === 'tempest') {
            drawThrusterPlume(ctx, -r * 0.82, -r * 0.22, plumeLen, plumeWid, meta.primary, meta.secondary, t, 0.0);
            drawThrusterPlume(ctx, -r * 0.82,  r * 0.22, plumeLen, plumeWid, meta.primary, meta.secondary, t, 1.8);
        } else {
            drawThrusterPlume(ctx, -r * 0.84, 0, plumeLen * 1.15, plumeWid * 1.25, meta.primary, meta.secondary, t, 0.5);
        }

        // 4. High-Detail Preloaded SVG/PNG Sprite Layer (with 2.5D Roll Squash)
        const cached = _cache.ships[id];
        const spriteReady = !!(cached && cached.loaded && cached.img && cached.img.complete && cached.img.naturalWidth > 0);
        if (spriteReady) {
            ctx.save();
            // SVG has nose at UP (-Y); rotating +90deg (+PI/2) aligns nose with +X
            ctx.scale(1, 1 - Math.abs(bank) * 0.15);
            ctx.rotate(HALF_PI);
            const drawSize = r * 2.65;
            ctx.drawImage(cached.img, -drawSize * 0.5, -drawSize * 0.5, drawSize, drawSize);
            ctx.restore();
        }

        // 5. Animated Turrets, Gyro Rings, Reactor Core & Fallback Procedural Hull
        drawProceduralShipHull(ctx, id, r, t, meta, bank, spriteReady);

        ctx.restore(); // Exit ship rotation frame

        // 6. Volumetric Hexagonal Shield Ring if shieldRatio > 0
        if (shieldRatio > 0.01) {
            ctx.save();
            const shAlpha = clamp(0.18 + shieldRatio * 0.42, 0.15, 0.65);
            const shR = r * 1.38;
            ctx.rotate(t * 0.85);
            ctx.strokeStyle = meta.primary;
            ctx.globalAlpha = shAlpha;
            ctx.lineWidth = 1.8 + shieldRatio * 1.4;

            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const a = (i / 6) * TAU;
                const px = Math.cos(a) * shR;
                const py = Math.sin(a) * shR;
                ctx[i === 0 ? 'moveTo' : 'lineTo'](px, py);
            }
            ctx.closePath();
            ctx.stroke();

            // Shield vertex nodes
            ctx.fillStyle = '#ffffff';
            for (let i = 0; i < 6; i++) {
                const a = (i / 6) * TAU;
                ctx.beginPath();
                ctx.arc(Math.cos(a) * shR, Math.sin(a) * shR, 2.2, 0, TAU);
                ctx.fill();
            }
            ctx.restore();
        }

        ctx.restore();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 2. CosmicModels.drawEnemy(ctx, type, x, y, radius, angle, color, time, hpRatio)
    // ═══════════════════════════════════════════════════════════════════════
    function drawEnemy(ctx, type, x, y, radius, angle, color, time, hpRatio) {
        if (!ctx) return;
        const canonical = ENEMY_ALIAS[type] || 'swarmer';
        const meta = ENEMY_META[canonical] || ENEMY_META.swarmer;
        const r = Math.max(6, radius || 14);
        const t = typeof time === 'number' ? time : performance.now() * 0.001;
        const ang = typeof angle === 'number' ? angle : 0;
        const primary = color || meta.primary;
        const hp = clamp(typeof hpRatio === 'number' ? hpRatio : 1, 0, 1);

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(ang);

        const cached = _cache.enemies[canonical];
        const spriteReady = !!(cached && cached.loaded && cached.img && cached.img.complete && cached.img.naturalWidth > 0);

        if (spriteReady) {
            ctx.save();
            ctx.rotate(HALF_PI);
            const sz = r * 2.5;
            ctx.drawImage(cached.img, -sz * 0.5, -sz * 0.5, sz, sz);
            ctx.restore();
        } else {
            // Instant high-detail procedural enemy hull
            ctx.fillStyle = '#161024';
            ctx.strokeStyle = primary;
            ctx.lineWidth = 2;
            ctx.beginPath();
            if (canonical === 'tank') {
                for (let i = 0; i < 8; i++) {
                    const a = (i / 8) * TAU + t * 0.8;
                    ctx[i === 0 ? 'moveTo' : 'lineTo'](Math.cos(a) * r, Math.sin(a) * r);
                }
            } else if (canonical === 'kamikaze') {
                for (let i = 0; i < 10; i++) {
                    const a = (i / 10) * TAU + t * 3;
                    const rad = i % 2 === 0 ? r * 1.25 : r * 0.62;
                    ctx[i === 0 ? 'moveTo' : 'lineTo'](Math.cos(a) * rad, Math.sin(a) * rad);
                }
            } else {
                ctx.moveTo(r * 1.25, 0);
                ctx.lineTo(-r * 0.8, -r * 0.92);
                ctx.lineTo(-r * 0.42, 0);
                ctx.lineTo(-r * 0.8, r * 0.92);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }

        // Animated mandibles / energy core pulse
        const corePulse = 0.75 + 0.25 * Math.sin(t * 9 + r);
        ctx.fillStyle = primary;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.28 * corePulse, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.13, 0, TAU);
        ctx.fill();

        ctx.restore();

        // Subtle health arc if damaged
        if (hp < 0.99 && hp > 0) {
            ctx.save();
            ctx.strokeStyle = primary;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.75;
            ctx.beginPath();
            ctx.arc(x, y, r + 4, -HALF_PI, -HALF_PI + TAU * hp);
            ctx.stroke();
            ctx.restore();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 3. CosmicModels.drawBoss(ctx, bossType, x, y, radius, angle, armorAngle, color, time, hpRatio)
    // ═══════════════════════════════════════════════════════════════════════
    function drawBoss(ctx, bossType, x, y, radius, angle, armorAngle, color, time, hpRatio) {
        if (!ctx) return;
        const canonical = BOSS_ALIAS[bossType] || 'behemoth';
        const meta = BOSS_META[canonical] || BOSS_META.behemoth;
        const r = Math.max(28, radius || 50);
        const t = typeof time === 'number' ? time : performance.now() * 0.001;
        const ang = typeof angle === 'number' ? angle : 0;
        const shAng = typeof armorAngle === 'number' ? armorAngle : ang;
        const primary = color || meta.primary;
        const hp = clamp(typeof hpRatio === 'number' ? hpRatio : 1, 0, 1);

        ctx.save();
        ctx.translate(x, y);

        // 1. Outer Phase Aura & Rotating Sacred Geometry Ring
        const auraGrad = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r * 1.65);
        auraGrad.addColorStop(0, primary + '44');
        auraGrad.addColorStop(0.65, meta.secondary + '18');
        auraGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.65, 0, TAU);
        ctx.fill();

        ctx.save();
        ctx.rotate(t * 0.9);
        ctx.strokeStyle = primary;
        ctx.lineWidth = 2.2;
        ctx.setLineDash([12, 8]);
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.24, 0, TAU);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // 2. Boss-Specific Animated Appendages (Tendrils / Clockwork Rings / Seraph Wings)
        if (canonical === 'leviathan') {
            ctx.save();
            ctx.strokeStyle = '#00ff88';
            ctx.lineWidth = 4;
            for (let i = 0; i < 6; i++) {
                const ba = (i / 6) * TAU + t * 0.7;
                const wave = Math.sin(t * 5 + i) * r * 0.28;
                ctx.beginPath();
                ctx.moveTo(Math.cos(ba) * r * 0.6, Math.sin(ba) * r * 0.6);
                ctx.quadraticCurveTo(
                    Math.cos(ba + 0.3) * r * 1.15 + wave,
                    Math.sin(ba + 0.3) * r * 1.15 + wave,
                    Math.cos(ba) * r * 1.48,
                    Math.sin(ba) * r * 1.48
                );
                ctx.stroke();
            }
            ctx.restore();
        } else if (canonical === 'chronovore') {
            ctx.save();
            ctx.rotate(-t * 1.8);
            ctx.strokeStyle = '#00ffcc';
            ctx.lineWidth = 3;
            ctx.strokeRect(-r * 0.92, -r * 0.92, r * 1.84, r * 1.84);
            ctx.rotate(t * 3.6);
            ctx.strokeStyle = '#9900ff';
            ctx.strokeRect(-r * 0.78, -r * 0.78, r * 1.56, r * 1.56);
            ctx.restore();
        }

        // 3. Draw Boss SVG Sprite or Multi-Plate Carapace
        const cached = _cache.bosses[canonical];
        const spriteReady = !!(cached && cached.loaded && cached.img && cached.img.complete && cached.img.naturalWidth > 0);
        ctx.save();
        ctx.rotate(canonical === 'behemoth' ? shAng : ang);
        if (spriteReady) {
            ctx.save();
            ctx.rotate(HALF_PI);
            const sz = r * 2.55;
            ctx.drawImage(cached.img, -sz * 0.5, -sz * 0.5, sz, sz);
            ctx.restore();
        } else {
            ctx.fillStyle = '#1a0f24';
            ctx.strokeStyle = primary;
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            for (let i = 0; i < 8; i++) {
                const a = (i / 8) * TAU;
                const rad = i % 2 === 0 ? r * 1.08 : r * 0.86;
                ctx[i === 0 ? 'moveTo' : 'lineTo'](Math.cos(a) * rad, Math.sin(a) * rad);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
        ctx.restore();

        // 4. Oblivion Behemoth Directional Golden Armor Shield Arc & Rear Weak-Spot Reactor
        if (canonical === 'behemoth' || bossType === 'behemoth') {
            ctx.save();
            ctx.rotate(shAng);
            // Front Golden Shield Arc (-1.72 to +1.72 rad)
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 7;
            ctx.shadowColor = '#ffaa00';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(0, 0, r + 10, -1.72, 1.72);
            ctx.stroke();

            // Exposed Rear Blue Reactor Core Weak Spot at (-r * 0.85, 0)
            const weakPulse = 8 + 3 * Math.sin(t * 10);
            ctx.fillStyle = '#00f0ff';
            ctx.shadowColor = '#00f0ff';
            ctx.beginPath();
            ctx.arc(-r * 0.85, 0, weakPulse, 0, TAU);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-r * 0.85, 0, weakPulse * 0.45, 0, TAU);
            ctx.fill();
            ctx.restore();
        }

        // 5. Boss HP Ring
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.16)';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(0, 0, r + 18, 0, TAU);
        ctx.stroke();

        ctx.strokeStyle = hp > 0.35 ? primary : '#ff0044';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(0, 0, r + 18, -HALF_PI, -HALF_PI + TAU * hp);
        ctx.stroke();
        ctx.restore();

        ctx.restore();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 4. CosmicModels.renderTurntable(canvas, shipId, time, opts)
    //    Interactive 3D-Projected Holographic + Metallic Ship Showcase for Hangar Lobby
    // ═══════════════════════════════════════════════════════════════════════
    const _stars = Array.from({ length: 48 }, (_, i) => ({
        x: ((i * 97) % 100) / 100,
        y: ((i * 57) % 100) / 100,
        z: 0.3 + ((i * 31) % 70) / 100,
        sz: 0.8 + (i % 3) * 0.65
    }));

    function renderTurntable(canvasOrCtx, shipId, time, opts) {
        if (!canvasOrCtx) return;
        const ctx = canvasOrCtx.getContext ? canvasOrCtx.getContext('2d') : canvasOrCtx;
        const canvas = canvasOrCtx.canvas || canvasOrCtx;
        const w = canvas.width || 360;
        const h = canvas.height || 300;
        opts = opts || {};

        const id = SHIP_META[shipId] ? shipId : 'interceptor';
        const meta = SHIP_META[id];
        const t = typeof time === 'number' ? time : performance.now() * 0.001;
        const cx = w * 0.5;
        const cy = h * 0.52;
        const baseR = Math.min(w, h) * 0.25;

        ctx.save();
        ctx.clearRect(0, 0, w, h);

        // 1. Deep Volumetric Hangar Backdrop
        const bgGrad = ctx.createRadialGradient(cx, cy, baseR * 0.1, cx, cy, Math.max(w, h) * 0.72);
        bgGrad.addColorStop(0, meta.primary + '26');
        bgGrad.addColorStop(0.48, '#080e1c');
        bgGrad.addColorStop(1, '#03050a');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // 2. Streaming Starfield & Speed Lines
        for (let i = 0; i < _stars.length; i++) {
            const st = _stars[i];
            const sy = ((st.y * h + t * 55 * st.z) % h);
            const sx = st.x * w;
            ctx.fillStyle = i % 5 === 0 ? meta.primary : 'rgba(220,240,255,0.65)';
            ctx.beginPath();
            ctx.arc(sx, sy, st.sz, 0, TAU);
            ctx.fill();
        }

        // 3. 3D-Projected Rotating Orbital Hologram Pedestal Grid
        const gridY = cy + baseR * 0.75;
        const rx = baseR * 1.55;
        const ry = baseR * 0.52;

        ctx.save();
        ctx.translate(cx, gridY);
        // Outer and inner holo-rings
        ctx.strokeStyle = meta.primary + '66';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, 0, TAU);
        ctx.stroke();

        ctx.strokeStyle = meta.secondary + '55';
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.ellipse(0, 0, rx * 0.72, ry * 0.72, 0, 0, TAU);
        ctx.stroke();
        ctx.setLineDash([]);

        // Rotating radial spokes on the 3D floor plane
        const spokeCount = 12;
        ctx.strokeStyle = meta.primary + '35';
        ctx.lineWidth = 1;
        for (let i = 0; i < spokeCount; i++) {
            const a = (i / spokeCount) * TAU + t * 0.45;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * rx * 0.25, Math.sin(a) * ry * 0.25);
            ctx.lineTo(Math.cos(a) * rx, Math.sin(a) * ry);
            ctx.stroke();
        }

        // Projected dark silhouette shadow on the holo-deck
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.beginPath();
        ctx.ellipse(0, 0, baseR * 0.75, ry * 0.48, 0, 0, TAU);
        ctx.fill();
        ctx.restore();

        // 4. Live Weapon Firing Preview Pulses (if enabled)
        const shipHoverY = cy - baseR * 0.08 + Math.sin(t * 2.6) * 6;
        const yawAngle = typeof opts.yaw === 'number' ? opts.yaw : (-HALF_PI + Math.sin(t * 1.15) * 0.28);
        const bank = Math.cos(t * 1.15) * 0.28;

        if (opts.firePreview !== false) {
            const pulseCount = 3;
            for (let i = 0; i < pulseCount; i++) {
                const prog = ((t * 1.8 + i / pulseCount) % 1);
                const dist = baseR * (0.9 + prog * 1.25);
                const bx = cx + Math.cos(yawAngle) * dist;
                const by = shipHoverY + Math.sin(yawAngle) * dist;
                ctx.save();
                ctx.globalAlpha = (1 - prog) * 0.85;
                ctx.strokeStyle = meta.primary;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(bx, by);
                ctx.lineTo(bx - Math.cos(yawAngle) * 14, by - Math.sin(yawAngle) * 14);
                ctx.stroke();
                ctx.restore();
            }
        }

        // 5. Render the 2.5D/3D Tilted Ship Model
        drawShip(ctx, id, cx, shipHoverY, baseR * 0.88, yawAngle, t, {
            bank: bank,
            thrust: 1.25,
            shieldRatio: 0.45 + 0.25 * Math.sin(t * 2),
            noShadow: true
        });

        // 6. Sci-Fi Tech Callout HUD Lines & Telemetry Labels
        if (opts.showCallouts !== false && w >= 220) {
            const callouts = meta.callouts || [];
            const anchors = [
                { sx: cx - baseR * 0.28, sy: shipHoverY - baseR * 0.45, tx: 18,     ty: 34,     align: 'left' },
                { sx: cx + baseR * 0.35, sy: shipHoverY - baseR * 0.10, tx: w - 18, ty: 48,     align: 'right' },
                { sx: cx - baseR * 0.22, sy: shipHoverY + baseR * 0.48, tx: 18,     ty: h - 26, align: 'left' }
            ];

            ctx.font = '600 10px Orbitron, sans-serif';
            for (let i = 0; i < Math.min(callouts.length, anchors.length); i++) {
                const a = anchors[i];
                const kneeX = a.align === 'left' ? a.tx + 78 : a.tx - 78;

                ctx.strokeStyle = meta.primary + 'aa';
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(a.sx, a.sy);
                ctx.lineTo(kneeX, a.ty);
                ctx.lineTo(a.tx, a.ty);
                ctx.stroke();

                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(a.sx, a.sy, 2.5, 0, TAU);
                ctx.fill();

                ctx.fillStyle = meta.primary;
                ctx.textAlign = a.align;
                ctx.fillText(callouts[i], a.tx, a.ty - 5);
            }
        }

        ctx.restore();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 5. Public API Export on window.CosmicModels
    // ═══════════════════════════════════════════════════════════════════════
    const CosmicModels = {
        version: '8.0.0',
        SHIPS: SHIP_META,
        BOSSES: BOSS_META,
        ENEMIES: ENEMY_META,
        MAPS: MAP_META,
        cache: _cache,
        preloadAll: preloadAll,
        drawShip: drawShip,
        drawEnemy: drawEnemy,
        drawBoss: drawBoss,
        renderTurntable: renderTurntable,
        getShipImage: function (shipId) {
            return (_cache.ships[shipId] && _cache.ships[shipId].img) || null;
        },
        getBossImage: function (bossId) {
            const canonical = BOSS_ALIAS[bossId] || bossId;
            return (_cache.bosses[canonical] && _cache.bosses[canonical].img) || null;
        },
        getEnemyImage: function (enemyId) {
            const canonical = ENEMY_ALIAS[enemyId] || enemyId;
            return (_cache.enemies[canonical] && _cache.enemies[canonical].img) || null;
        },
        getMapImage: function (mapId) {
            return (_cache.maps[mapId] && _cache.maps[mapId].img) || null;
        }
    };

    global.CosmicModels = CosmicModels;
})(typeof window !== 'undefined' ? window : globalThis);
