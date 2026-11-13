// =============================================================================
// COSMIC UNIVERSE — EXO-METROID BREACH CANONICAL DATA & MAP VALIDATOR
// File: js/games/exo_metroid_data.js
// Exposes: window.COSMIC_EXO_DATA
// =============================================================================
(function (global) {
    'use strict';

    const TILE = 40;

    const TILE_LEGEND = {
        '#': 'solid_hull',
        '=': 'one_way_platform',
        '.': 'open_air',
        '~': 'toxic_acid',
        'D': 'shield_door',
        'P': 'player_spawn',
        'S': 'spider_bot',
        'M': 'tactical_mech',
        'V': 'hover_drone',
        'T': 'laser_turret',
        'G': 'acid_spitter',
        'K': 'void_commando',
        'C': 'supply_crate',
        'E': 'plasma_barrel',
        'U': 'upgrade_relic',
        'H': 'medkit_pickup',
        'A': 'missile_pickup',
        'L': 'laser_emitter',
        'R': 'sub_reactor',
        'B': 'boss_anchor',
        'X': 'extraction_portal'
    };

    const VALID_CHARS = new Set(Object.keys(TILE_LEGEND));
    const BFS_REQUIRED_TARGETS = new Set(['R', 'B', 'X', 'U', 'S', 'M', 'V', 'G', 'K']);
    const ALL_INTERACTIVE_TARGETS = new Set(['R', 'B', 'X', 'U', 'S', 'M', 'V', 'G', 'K', 'C', 'E', 'H', 'A', 'T']);

    // -------------------------------------------------------------------------
    // Moving Platform Factory (provides both tile coordinates and world pixels)
    // tileX, tileY, tileW, moveTileX, moveTileY are in grid tiles;
    // x, y, w, dx, dy are exact world pixels (* TILE); speed is px/sec.
    // -------------------------------------------------------------------------
    function mkPlatform(tileX, tileY, tileW, moveTileX, moveTileY, speed) {
        return {
            tileX,
            tileY,
            tileW,
            moveTileX,
            moveTileY,
            x: tileX * TILE,
            y: tileY * TILE,
            w: tileW * TILE,
            dx: moveTileX * TILE,
            dy: moveTileY * TILE,
            speed: speed || 90
        };
    }

    // -------------------------------------------------------------------------
    // BIOMES
    // -------------------------------------------------------------------------
    const BIOMES = {
        hangar: {
            id: 'hangar',
            bgTop: 0x040714,
            bgBottom: 0x09152e,
            accent: 0x38bdf8,
            wallFill: 0x0d172a,
            wallTrim: 0x1e3a5f,
            gridAlpha: 0.08,
            name: { tr: 'Hangar Kanalları', en: 'Hangar Ducts' }
        },
        fusion: {
            id: 'fusion',
            bgTop: 0x031114,
            bgBottom: 0x062428,
            accent: 0x2dd4bf,
            wallFill: 0x091f22,
            wallTrim: 0x115e59,
            gridAlpha: 0.09,
            name: { tr: 'Füzyon Uçurumu', en: 'Fusion Chasm' }
        },
        cryo: {
            id: 'cryo',
            bgTop: 0x050b1c,
            bgBottom: 0x0e2142,
            accent: 0x67e8f9,
            wallFill: 0x0f2442,
            wallTrim: 0x38bdf8,
            gridAlpha: 0.10,
            name: { tr: 'Kriyo-Lab Kuleleri', en: 'Cryo-Lab Spires' }
        },
        obsidian: {
            id: 'obsidian',
            bgTop: 0x12060b,
            bgBottom: 0x260d16,
            accent: 0xf97316,
            wallFill: 0x1c1017,
            wallTrim: 0x9a3412,
            gridAlpha: 0.09,
            name: { tr: 'Obsidyen Reaktör', en: 'Obsidian Reactor' }
        },
        aegis: {
            id: 'aegis',
            bgTop: 0x0a0518,
            bgBottom: 0x1a0c36,
            accent: 0xa855f7,
            wallFill: 0x150d2b,
            wallTrim: 0x6b21a8,
            gridAlpha: 0.11,
            name: { tr: 'Aegis Kutsal Alanı', en: 'Aegis Sanctum' }
        },
        void: {
            id: 'void',
            bgTop: 0x06030f,
            bgBottom: 0x160926,
            accent: 0xc084fc,
            wallFill: 0x130b24,
            wallTrim: 0x7e22ce,
            gridAlpha: 0.11,
            name: { tr: 'Hiçlik İhlali', en: 'Void Breach' }
        }
    };

    // -------------------------------------------------------------------------
    // SUIT UPGRADES CATALOG
    // -------------------------------------------------------------------------
    const UPGRADES = {
        charge_beam: {
            id: 'charge_beam',
            color: '#38bdf8',
            tint: 0x38bdf8,
            iconKey: 'energy_prism',
            title: { tr: 'Şarj Plazma Işını', en: 'Charge Plasma Beam' },
            desc: {
                tr: 'Plazma kesicini aşırı yükler; şarjlı dalga darbeleri ağır zırhı ve kalkan kapılarını deler.',
                en: 'Overcharges your plasma emitter; charged wave slashes pierce heavy armor and breach shield doors.'
            }
        },
        triple_jump: {
            id: 'triple_jump',
            color: '#2dd4bf',
            tint: 0x2dd4bf,
            iconKey: 'warp_ring',
            title: { tr: 'Üçlü İtici Zıplama', en: 'Triple Thruster Jump' },
            desc: {
                tr: 'Havada ekstra 3. itici sıçraması sağlayarak dikey kulelere ve yüksek geçitlere ulaşmanı kolaylaştırır.',
                en: 'Grants a 3rd mid-air thruster jump for mastering tall vertical shafts and elevated spires.'
            }
        },
        phase_shield: {
            id: 'phase_shield',
            color: '#67e8f9',
            tint: 0x67e8f9,
            iconKey: 'shield_battery',
            title: { tr: 'Faz Kalkanı Matrisi', en: 'Phase Shield Matrix' },
            desc: {
                tr: 'Atılma ve hasar sonrası dokunulmazlık süresini uzatır; faz bariyeriyle plazma mermilerini emer.',
                en: 'Extends dash & post-hit invulnerability frames and projects a phase barrier against enemy plasma bolts.'
            }
        },
        spread_missile: {
            id: 'spread_missile',
            color: '#f97316',
            tint: 0xf97316,
            iconKey: 'missile_pod',
            title: { tr: 'Saçmalı Güdümlü Füze', en: 'Spread Seeker Missiles' },
            desc: {
                tr: 'Tek ateşlemede 3 güdümlü füze salvosu fırlatır ve maksimum füze taşıma kapasitesini artırır.',
                en: 'Fires a 3-warhead seeker fan per shot and expands maximum missile capacity.'
            }
        },
        plasma_nova: {
            id: 'plasma_nova',
            color: '#c084fc',
            tint: 0xc084fc,
            iconKey: 'boss_core',
            title: { tr: 'Plazma Nova Çekirdeği', en: 'Plasma Nova Core' },
            desc: {
                tr: 'Atılma çıkışları ve 3. kombo darbeleri yakındaki düşmanlara yüksek hasarlı şok dalgası yayar.',
                en: 'Unleashes radial plasma shockwaves on dash impacts and finisher blade combos.'
            }
        }
    };

    // -------------------------------------------------------------------------
    // ENEMIES & BOSS CATALOG
    // -------------------------------------------------------------------------
    const ENEMIES = {
        spider: {
            kind: 'spider',
            tileChar: 'S',
            hp: 55,
            speed: 120,
            score: 90,
            fireCd: 2.2,
            damage: 1,
            width: 30,
            height: 26,
            gravity: true,
            spriteKey: 'emb_spider',
            name: { tr: 'Örümcek-Bot', en: 'Spider-Bot' }
        },
        mech: {
            kind: 'mech',
            tileChar: 'M',
            hp: 145,
            speed: 65,
            score: 180,
            fireCd: 1.8,
            damage: 1,
            width: 40,
            height: 48,
            gravity: true,
            spriteKey: 'emb_mech',
            name: { tr: 'Taktik Mech', en: 'Tactical Mech' }
        },
        drone: {
            kind: 'drone',
            tileChar: 'V',
            hp: 70,
            speed: 105,
            score: 120,
            fireCd: 2.0,
            damage: 1,
            width: 32,
            height: 28,
            gravity: false,
            spriteKey: 'emb_drone',
            name: { tr: 'Uçan İHA', en: 'Hover-Drone' }
        },
        turret: {
            kind: 'turret',
            tileChar: 'T',
            hp: 90,
            speed: 0,
            score: 140,
            fireCd: 1.9,
            damage: 1,
            width: 30,
            height: 30,
            gravity: false,
            spriteKey: 'emb_turret',
            name: { tr: 'Güvenlik Tareti', en: 'Laser Turret' }
        },
        spitter: {
            kind: 'spitter',
            tileChar: 'G',
            hp: 105,
            speed: 58,
            score: 150,
            fireCd: 2.1,
            damage: 1,
            width: 34,
            height: 38,
            gravity: true,
            spriteKey: 'emb_spitter',
            name: { tr: 'Asit Püskürtücü', en: 'Acid Spitter' }
        },
        commando: {
            kind: 'commando',
            tileChar: 'K',
            hp: 165,
            speed: 135,
            score: 240,
            fireCd: 1.45,
            damage: 1,
            width: 34,
            height: 44,
            gravity: true,
            spriteKey: 'emb_commando',
            name: { tr: 'Hiçlik Komandosu', en: 'Void Commando' }
        },
        boss: {
            kind: 'boss',
            tileChar: 'B',
            hp: 920,
            speed: 82,
            score: 750,
            fireCd: 1.5,
            damage: 1,
            width: 74,
            height: 98,
            gravity: true,
            spriteKey: 'emb_boss',
            name: { tr: 'Aegis Kolosusu', en: 'Aegis Colossus' }
        }
    };

    // -------------------------------------------------------------------------
    // PROPS & HAZARDS TABLE
    // -------------------------------------------------------------------------
    const PROPS = {
        crate: {
            kind: 'crate',
            tileChar: 'C',
            hp: 20,
            score: 35,
            spriteKey: 'emb_crate',
            name: { tr: 'İkmal Sandığı', en: 'Supply Crate' }
        },
        barrel: {
            kind: 'barrel',
            tileChar: 'E',
            hp: 15,
            blastRadius: 120,
            blastDamage: 95,
            score: 50,
            spriteKey: 'emb_barrel',
            name: { tr: 'Plazma Varili', en: 'Plasma Barrel' }
        },
        laser: {
            kind: 'laser',
            tileChar: 'L',
            warnSec: 1.0,
            activeSec: 1.2,
            offSec: 1.8,
            damage: 1,
            name: { tr: 'Zamanlı Lazer', en: 'Timed Laser' }
        },
        reactor: {
            kind: 'reactor',
            tileChar: 'R',
            hp: 120,
            score: 350,
            spriteKey: 'emb_reactor',
            name: { tr: 'Alt Reaktör Çekirdeği', en: 'Sub-Reactor Core' }
        },
        door: {
            kind: 'door',
            tileChar: 'D',
            hp: 1,
            score: 150,
            spriteKey: 'emb_door_shield',
            name: { tr: 'Kalkan Kapısı', en: 'Shield Door' }
        },
        upgrade: {
            kind: 'upgrade',
            tileChar: 'U',
            score: 200,
            name: { tr: 'Zırh Kalıntısı', en: 'Suit Upgrade Relic' }
        },
        hp: {
            kind: 'hp',
            tileChar: 'H',
            heal: 1,
            score: 50,
            spriteKey: 'emb_pickup_hp',
            name: { tr: 'Gövde Kiti', en: 'Medkit' }
        },
        missile: {
            kind: 'missile',
            tileChar: 'A',
            ammo: 2,
            score: 75,
            spriteKey: 'emb_pickup_msl',
            name: { tr: 'Füze Cephanesi', en: 'Missile Ammo' }
        }
    };

    // -------------------------------------------------------------------------
    // SAFE SPAWN COMPUTATION
    // -------------------------------------------------------------------------
    function isAcidColumnBelow(grid, rStart, c) {
        const rows = grid.length;
        const endR = Math.min(rows - 1, rStart + 5);
        for (let r = rStart; r <= endR; r++) {
            const ch = grid[r][c];
            if (ch === '~') return true;
            if (ch === '#') return false;
        }
        return false;
    }

    function computeSafeSpawns(grid) {
        if (!Array.isArray(grid) || grid.length < 3) return [];
        const rows = grid.length;
        const cols = grid[0].length;
        const spawns = [];

        let pRow = -1;
        let pCol = -1;
        for (let r = 1; r < rows - 1; r++) {
            for (let c = 1; c < cols - 1; c++) {
                if (grid[r][c] === 'P') {
                    pRow = r;
                    pCol = c;
                    break;
                }
            }
            if (pRow >= 0) break;
        }

        for (let r = 2; r < rows - 1; r++) {
            for (let c = 2; c < cols - 2; c++) {
                if (grid[r][c] !== '.' || grid[r - 1][c] !== '.') continue;
                const below = grid[r + 1][c];
                if (below !== '#' && below !== '=') continue;
                if (isAcidColumnBelow(grid, r, c)) continue;
                if (grid[r][c - 1] === '#' || grid[r][c + 1] === '#') continue;
                if (pRow >= 0 && Math.abs(r - pRow) <= 1 && Math.abs(c - pCol) <= 2) continue;
                if (grid[r][c - 1] === 'L' || grid[r][c + 1] === 'L') continue;
                spawns.push({
                    col: c,
                    row: r,
                    x: c * TILE + TILE * 0.5,
                    y: (r + 1) * TILE - 30,
                    isPlatform: below === '='
                });
            }
        }
        return spawns;
    }

    // -------------------------------------------------------------------------
    // 5 CAMPAIGN SECTORS (id: 1..5)
    // -------------------------------------------------------------------------
    const SECTOR_1_MAP = [
        '##############################################',
        '#............................................#',
        '#............................................#',
        '#.....................U..A...................#',
        '#..................=========.................#',
        '#..........S..E..............................#',
        '#.......===========..........................#',
        '#....................................V.......#',
        '#..H......................=====..............#',
        '#.======.....................................#',
        '#.......................S................C.A.#',
        '#.....................======.........#########',
        '#.....=====..........................D.......#',
        '#....................................D.......#',
        '#..P...C......S........E..M..........D.C.R.X.#',
        '#########~~~#####~~~##########################',
        '##############################################'
    ];

    const SECTOR_2_MAP = [
        '##################################################',
        '#................................................#',
        '#................................................#',
        '#..................A.U....V......................#',
        '#.................=======........................#',
        '#..P...C.........................................#',
        '#########.................................H......#',
        '#.........................=======.......======...#',
        '#...........S....................................#',
        '#.........======.....E..G........................#',
        '#...................======............=====......#',
        '#....A...........................................#',
        '#..======....................S.................C.#',
        '#...........................======.........======#',
        '#.............G..........................H..G....#',
        '#.........======......................############',
        '#.....................======...=====..D..........#',
        '#.....................................D..........#',
        '#..H...C.......S.........G.E.....E.M..D.C..R...X.#',
        '#########~~~~######~~~~######~~~~#################',
        '##################################################'
    ];

    const SECTOR_3_MAP = [
        '####################################################',
        '#...........T..................T...................#',
        '#..................................................#',
        '#....................A.U...........................#',
        '#...................=======........................#',
        '#..............V...................................#',
        '#............H.....................................#',
        '#..........======.......=========....H.............#',
        '#..................................=======.........#',
        '#.....K..E................................V........#',
        '#...=======......=======...........................#',
        '#..................................................#',
        '#......................................=====.......#',
        '#...........=====.....=====........................#',
        '#.............................................C..H.#',
        '#......................................====.########',
        '#..=====.............======.......=====.....D......#',
        '#...........................................D......#',
        '#..P..C....S..........M..E......A.K....S....D.C.R.X#',
        '################~~~~######~~~~######################',
        '####################################################'
    ];

    const SECTOR_4_MAP = [
        '######################################################',
        '#..............................T.....................#',
        '#....................................................#',
        '#....................................................#',
        '#....................................................#',
        '#................H.U.................................#',
        '#...............=======..............................#',
        '#.......................V............................#',
        '#.........................E..K.......................#',
        '#......................==========....................#',
        '#....................................................#',
        '#..................V..........L................C.....#',
        '#................======.....======.....V.....======..#',
        '#....................................................#',
        '#.......................A.........................H..#',
        '#...........=====.....=====..................#########',
        '#............................................D.......#',
        '#............................................D.......#',
        '#..P..C..E.G..L......L.M.......E.G.....E.M.G.D.C.R.X.#',
        '#################~~~~######~~~~####~~~~###############',
        '######################################################'
    ];

    const SECTOR_5_MAP = [
        '######################################################',
        '#....................................................#',
        '#....................................................#',
        '#....................................................#',
        '#....................................................#',
        '#....................................................#',
        '#................................H.A.................#',
        '#...............................=====................#',
        '#....................................................#',
        '#....................................................#',
        '#.....................======.............======......#',
        '#....................................................#',
        '#....................................................#',
        '#.....................======.............======......#',
        '#....................................................#',
        '#......H.A.............A....................H........#',
        '#.....=====.......========....=======....========....#',
        '#....................................................#',
        '#..P..C..U...C....H..C......E........B.....E....C..X.#',
        '######################################################',
        '######################################################'
    ];

    const SECTORS = [
        {
            id: 1,
            biome: 'hangar',
            name: 'SECTOR 1: HANGAR DUCTS',
            title: { tr: 'SEKTÖR 1: HANGAR KANALLARI', en: 'SECTOR 1: HANGAR DUCTS' },
            accent: BIOMES.hangar.accent,
            upgradeId: 'charge_beam',
            objective: 'reactor',
            isEndless: false,
            bossTriggerCol: null,
            bossLockCol: null,
            bossArena: null,
            movingPlatforms: [
                mkPlatform(31, 8, 3, 4, 0, 85)
            ],
            map: SECTOR_1_MAP,
            safeSpawns: computeSafeSpawns(SECTOR_1_MAP)
        },
        {
            id: 2,
            biome: 'fusion',
            name: 'SECTOR 2: FUSION CHASM',
            title: { tr: 'SEKTÖR 2: FÜZYON UÇURUMU', en: 'SECTOR 2: FUSION CHASM' },
            accent: BIOMES.fusion.accent,
            upgradeId: 'triple_jump',
            objective: 'reactor',
            isEndless: false,
            bossTriggerCol: null,
            bossLockCol: null,
            bossArena: null,
            movingPlatforms: [
                mkPlatform(14, 16, 3, 4, 0, 90),
                mkPlatform(34, 14, 3, 0, -6, 85)
            ],
            map: SECTOR_2_MAP,
            safeSpawns: computeSafeSpawns(SECTOR_2_MAP)
        },
        {
            id: 3,
            biome: 'cryo',
            name: 'SECTOR 3: CRYO-LAB SPIRES',
            title: { tr: 'SEKTÖR 3: KRİYO-LAB KULELERİ', en: 'SECTOR 3: CRYO-LAB SPIRES' },
            accent: BIOMES.cryo.accent,
            upgradeId: 'phase_shield',
            objective: 'reactor',
            isEndless: false,
            bossTriggerCol: null,
            bossLockCol: null,
            bossArena: null,
            movingPlatforms: [
                mkPlatform(13, 16, 3, 4, 0, 95),
                mkPlatform(28, 14, 3, 0, -6, 85)
            ],
            map: SECTOR_3_MAP,
            safeSpawns: computeSafeSpawns(SECTOR_3_MAP)
        },
        {
            id: 4,
            biome: 'obsidian',
            name: 'SECTOR 4: OBSIDIAN REACTOR',
            title: { tr: 'SEKTÖR 4: OBSİDYEN REAKTÖR', en: 'SECTOR 4: OBSIDIAN REACTOR' },
            accent: BIOMES.obsidian.accent,
            upgradeId: 'spread_missile',
            objective: 'reactor',
            isEndless: false,
            bossTriggerCol: null,
            bossLockCol: null,
            bossArena: null,
            movingPlatforms: [
                mkPlatform(16, 16, 3, 3, 0, 100),
                mkPlatform(35, 15, 3, 0, -6, 90)
            ],
            map: SECTOR_4_MAP,
            safeSpawns: computeSafeSpawns(SECTOR_4_MAP)
        },
        {
            id: 5,
            biome: 'aegis',
            name: 'SECTOR 5: AEGIS SANCTUM',
            title: { tr: 'SEKTÖR 5: AEGİS KUTSAL ALANI', en: 'SECTOR 5: AEGIS SANCTUM' },
            accent: BIOMES.aegis.accent,
            upgradeId: 'plasma_nova',
            objective: 'boss',
            isEndless: false,
            bossTriggerCol: 17,
            bossLockCol: 15,
            bossArena: { minCol: 16, maxCol: 52 },
            movingPlatforms: [
                mkPlatform(29, 10, 4, 6, 0, 95)
            ],
            map: SECTOR_5_MAP,
            safeSpawns: computeSafeSpawns(SECTOR_5_MAP)
        }
    ];

    // -------------------------------------------------------------------------
    // 4 ENDLESS BREACH ARENAS (38x18 to 44x19, ZERO 'D' doors, full loop routes)
    // -------------------------------------------------------------------------
    const ENDLESS_ARENA_1_MAP = [
        '########################################',
        '#..................T...................#',
        '#......................................#',
        '#......................................#',
        '#...................V..................#',
        '#......................................#',
        '#......U.......................C.......#',
        '#...========................========...#',
        '#......................................#',
        '#................H..X..A...............#',
        '#..............==========..............#',
        '#......................................#',
        '#.......S......................C.......#',
        '#....========..............========....#',
        '#......................................#',
        '#..P.......C...E...B...E...M.........H.#',
        '#######~~~####################~~~#######',
        '########################################'
    ];

    const ENDLESS_ARENA_2_MAP = [
        '##########################################',
        '#........................................#',
        '#........................................#',
        '#.............V...........V..............#',
        '#........................................#',
        '#........................................#',
        '#...................U....................#',
        '#................========................#',
        '#........................................#',
        '#....H..........C...............G..A.....#',
        '#..=======......=========......=======...#',
        '#........................................#',
        '#............................E...........#',
        '#.......========........========.........#',
        '#........................................#',
        '#..P..C..S......E..B....G......M.....X...#',
        '###########~~~~##########~~~~#############',
        '##########################################'
    ];

    const ENDLESS_ARENA_3_MAP = [
        '############################################',
        '#..............T............T..............#',
        '#..........................................#',
        '#..........................................#',
        '#.....................V....................#',
        '#..........................................#',
        '#..........................................#',
        '#..................C..U....................#',
        '#.................========.................#',
        '#..........................................#',
        '#...A........................K.........H...#',
        '#..======.....======....======.....======..#',
        '#..........................................#',
        '#..........................................#',
        '#......========...========...========......#',
        '#..........................................#',
        '#..P..C......K...E...B...E...S.......C.X...#',
        '#######~~~########################~~~#######',
        '############################################'
    ];

    const ENDLESS_ARENA_4_MAP = [
        '############################################',
        '#.....................T....................#',
        '#..........................................#',
        '#..........................................#',
        '#..............V.............V.............#',
        '#..........................................#',
        '#..........................................#',
        '#.....................U....................#',
        '#.........======...======...======.........#',
        '#..........................................#',
        '#...................C.K.C..................#',
        '#..======........==========........======..#',
        '#..........................................#',
        '#.........H......................A.........#',
        '#.......========............========.......#',
        '#..........................................#',
        '#..P..C......L.E.M...B...G.E.L......C..X...#',
        '###########~~~################~~~###########',
        '############################################'
    ];

    const ENDLESS_ARENAS = [
        {
            id: 1,
            biome: 'void',
            name: 'ARENA 1: RIFT HANGAR LOOP',
            title: { tr: 'ARENA 1: YARIK HANGAR DÖNGÜSÜ', en: 'ARENA 1: RIFT HANGAR LOOP' },
            accent: BIOMES.void.accent,
            upgradeId: 'charge_beam',
            objective: 'endless',
            isEndless: true,
            bossTriggerCol: null,
            bossLockCol: null,
            bossArena: { minCol: 1, maxCol: 38 },
            movingPlatforms: [
                mkPlatform(13, 6, 4, 9, 0, 95)
            ],
            map: ENDLESS_ARENA_1_MAP,
            safeSpawns: computeSafeSpawns(ENDLESS_ARENA_1_MAP)
        },
        {
            id: 2,
            biome: 'fusion',
            name: 'ARENA 2: FUSION CRUCIBLE RING',
            title: { tr: 'ARENA 2: FÜZYON POTA HALKASI', en: 'ARENA 2: FUSION CRUCIBLE RING' },
            accent: BIOMES.fusion.accent,
            upgradeId: 'triple_jump',
            objective: 'endless',
            isEndless: true,
            bossTriggerCol: null,
            bossLockCol: null,
            bossArena: { minCol: 1, maxCol: 40 },
            movingPlatforms: [
                mkPlatform(5, 7, 3, 7, 0, 90),
                mkPlatform(27, 7, 3, 7, 0, 90)
            ],
            map: ENDLESS_ARENA_2_MAP,
            safeSpawns: computeSafeSpawns(ENDLESS_ARENA_2_MAP)
        },
        {
            id: 3,
            biome: 'cryo',
            name: 'ARENA 3: CRYO SPIRE CIRCUIT',
            title: { tr: 'ARENA 3: KRİYO KULE DÖNGÜSÜ', en: 'ARENA 3: CRYO SPIRE CIRCUIT' },
            accent: BIOMES.cryo.accent,
            upgradeId: 'spread_missile',
            objective: 'endless',
            isEndless: true,
            bossTriggerCol: null,
            bossLockCol: null,
            bossArena: { minCol: 1, maxCol: 42 },
            movingPlatforms: [
                mkPlatform(8, 8, 3, 5, 0, 95),
                mkPlatform(28, 8, 3, 5, 0, 95)
            ],
            map: ENDLESS_ARENA_3_MAP,
            safeSpawns: computeSafeSpawns(ENDLESS_ARENA_3_MAP)
        },
        {
            id: 4,
            biome: 'obsidian',
            name: 'ARENA 4: OBSIDIAN VOID NEXUS',
            title: { tr: 'ARENA 4: OBSİDYEN HİÇLİK MERKEZİ', en: 'ARENA 4: OBSIDIAN VOID NEXUS' },
            accent: BIOMES.obsidian.accent,
            upgradeId: 'plasma_nova',
            objective: 'endless',
            isEndless: true,
            bossTriggerCol: null,
            bossLockCol: null,
            bossArena: { minCol: 1, maxCol: 42 },
            movingPlatforms: [
                mkPlatform(14, 6, 3, 12, 0, 105)
            ],
            map: ENDLESS_ARENA_4_MAP,
            safeSpawns: computeSafeSpawns(ENDLESS_ARENA_4_MAP)
        }
    ];

    // -------------------------------------------------------------------------
    // PURE BFS CONNECTIVITY & MAP INTEGRITY VALIDATOR
    // Verifies:
    //  - Equal row lengths and outer '#' perimeter
    //  - Valid tile legend, exactly 1 'P' on safe '#' floor, exactly 1 'X'
    //  - Valid contiguous 'D' door columns (and zero 'D' in endless arenas)
    //  - Moving platform sweeps do not collide with '#', '~', 'D', or '='
    //  - 4-dir passable BFS from 'P' (not clipping '#' or entering '~') reaches
    //    every 'R', 'B', 'X', 'U', 'S', 'M', 'V', 'G', 'K' (plus 'C', 'E', 'H', 'A', 'T')
    //  - Platformer jump/fall/moving-bridge reachability reaches every target
    //    within double-jump height (<= 6 tiles) and horizontal gap (<= 7 tiles)
    // Returns strictly { valid: boolean, errors: string[] }.
    // -------------------------------------------------------------------------
    function validateMap(def) {
        const errors = [];
        if (!def || !Array.isArray(def.map) || def.map.length < 5) {
            errors.push('Map missing or has fewer than 5 rows.');
            return { valid: false, errors };
        }

        const grid = def.map;
        const rows = grid.length;
        const cols = typeof grid[0] === 'string' ? grid[0].length : 0;
        if (cols < 5) {
            errors.push('Map width must be at least 5 columns.');
            return { valid: false, errors };
        }

        for (let r = 0; r < rows; r++) {
            if (typeof grid[r] !== 'string' || grid[r].length !== cols) {
                errors.push(`Row ${r} has mismatched length (expected ${cols}).`);
                continue;
            }
            for (let c = 0; c < cols; c++) {
                if (!VALID_CHARS.has(grid[r][c])) {
                    errors.push(`Unknown tile '${grid[r][c]}' at (${r},${c}).`);
                }
            }
        }
        if (errors.length > 0) {
            return { valid: false, errors };
        }

        for (let c = 0; c < cols; c++) {
            if (grid[0][c] !== '#') errors.push(`Top border missing '#' at (0,${c}).`);
            if (grid[rows - 1][c] !== '#') errors.push(`Bottom border missing '#' at (${rows - 1},${c}).`);
        }
        for (let r = 0; r < rows; r++) {
            if (grid[r][0] !== '#') errors.push(`Left border missing '#' at (${r},0).`);
            if (grid[r][cols - 1] !== '#') errors.push(`Right border missing '#' at (${r},${cols - 1}).`);
        }

        const spawns = [];
        const portals = [];
        const targets = [];
        const isEndless = def.isEndless === true || def.objective === 'endless';

        for (let r = 1; r < rows - 1; r++) {
            for (let c = 1; c < cols - 1; c++) {
                const ch = grid[r][c];
                if (ch === 'P') spawns.push({ r, c });
                if (ch === 'X') portals.push({ r, c });
                if (ch === 'D') {
                    if (isEndless) {
                        errors.push(`Endless arena contains shield door 'D' at (${r},${c}).`);
                    }
                    const above = grid[r - 1][c];
                    const below = grid[r + 1][c];
                    if ((above !== '#' && above !== 'D') || (below !== '#' && below !== 'D')) {
                        errors.push(`Door 'D' at (${r},${c}) is not a contiguous column bounded by '#'.`);
                    }
                }
                if (ALL_INTERACTIVE_TARGETS.has(ch)) {
                    targets.push({ ch, r, c });
                }
            }
        }

        if (spawns.length !== 1) {
            errors.push(`Expected exactly 1 'P' spawn, found ${spawns.length}.`);
        }
        if (portals.length !== 1) {
            errors.push(`Expected exactly 1 'X' extraction portal, found ${portals.length}.`);
        }

        const start = spawns.length === 1 ? spawns[0] : null;
        if (start) {
            const below = grid[start.r + 1][start.c];
            if (below !== '#') {
                errors.push(`Spawn 'P' at (${start.r},${start.c}) must sit directly above '#' floor (found '${below}').`);
            }
            if (grid[start.r + 1][start.c - 1] === '~' || grid[start.r + 1][start.c + 1] === '~') {
                errors.push(`Spawn 'P' at (${start.r},${start.c}) has hazardous '~' acid adjacent beneath.`);
            }
        }

        const movingPlatforms = Array.isArray(def.movingPlatforms) ? def.movingPlatforms : [];
        const movingSurfaceCells = new Set();
        const movingGroups = [];

        for (let i = 0; i < movingPlatforms.length; i++) {
            const mp = movingPlatforms[i];
            if (!mp) continue;
            const tx = mp.tileX !== undefined ? mp.tileX : Math.round((mp.x || 0) / TILE);
            const ty = mp.tileY !== undefined ? mp.tileY : Math.round((mp.y || 0) / TILE);
            const tw = mp.tileW !== undefined ? mp.tileW : Math.round((mp.w || TILE) / TILE);
            const mdx = mp.moveTileX !== undefined ? mp.moveTileX : Math.round((mp.dx || 0) / TILE);
            const mdy = mp.moveTileY !== undefined ? mp.moveTileY : Math.round((mp.dy || 0) / TILE);

            const minC = Math.min(tx, tx + mdx);
            const maxC = Math.max(tx + tw - 1, tx + tw - 1 + mdx);
            const minR = Math.min(ty, ty + mdy);
            const maxR = Math.max(ty, ty + mdy);

            if (minC < 1 || maxC >= cols - 1 || minR < 1 || maxR >= rows - 1 || tw < 1) {
                errors.push(`Moving platform #${i} sweeps outside playable interior bounds.`);
                continue;
            }

            const groupCells = [];
            for (let r = minR; r <= maxR; r++) {
                for (let c = minC; c <= maxC; c++) {
                    const ch = grid[r][c];
                    if (ch === '#' || ch === '~' || ch === 'D' || ch === '=') {
                        errors.push(`Moving platform #${i} sweep collides with '${ch}' at (${r},${c}).`);
                    }
                    if (r - 1 >= 1 && grid[r - 1][c] !== '#' && grid[r - 1][c] !== '~') {
                        const key = `${r - 1},${c}`;
                        movingSurfaceCells.add(key);
                        groupCells.push([r - 1, c]);
                    }
                }
            }
            if (groupCells.length > 0) movingGroups.push(groupCells);
        }

        if (start) {
            const isPassable = (r, c) => {
                if (r < 0 || r >= rows || c < 0 || c >= cols) return false;
                const ch = grid[r][c];
                return ch !== '#' && ch !== '~';
            };

            // 1) Pure 4-directional passable BFS from 'P' (no '#' clipping, no '~' drowning)
            const passableVisited = new Set();
            const q = [[start.r, start.c]];
            passableVisited.add(`${start.r},${start.c}`);
            let head = 0;
            const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
            while (head < q.length) {
                const [r, c] = q[head++];
                for (let d = 0; d < 4; d++) {
                    const nr = r + dirs[d][0];
                    const nc = c + dirs[d][1];
                    const key = `${nr},${nc}`;
                    if (!passableVisited.has(key) && isPassable(nr, nc)) {
                        passableVisited.add(key);
                        q.push([nr, nc]);
                    }
                }
            }

            for (let i = 0; i < targets.length; i++) {
                const t = targets[i];
                if (!passableVisited.has(`${t.r},${t.c}`)) {
                    errors.push(`Target '${t.ch}' at (${t.r},${t.c}) is unreachable from 'P' (blocked by '#' or '~').`);
                }
            }

            // 2) Platformer jump/fall/moving-platform BFS (models gravity, walking, falling,
            //    wall-slide/jump off adjacent '#', and double-jump up to 6 tiles high / 7 wide)
            const isSupported = (r, c) => {
                if (!isPassable(r, c)) return false;
                const below = r + 1 < rows ? grid[r + 1][c] : '#';
                if (below === '#' || below === '=' || below === 'D') return true;
                if (movingSurfaceCells.has(`${r},${c}`)) return true;
                if ((c - 1 >= 0 && grid[r][c - 1] === '#') || (c + 1 < cols && grid[r][c + 1] === '#')) {
                    return true;
                }
                return false;
            };

            const jumpVisited = new Set();
            const jq = [[start.r, start.c]];
            jumpVisited.add(`${start.r},${start.c}`);
            let jHead = 0;

            const addJumpNode = (nr, nc) => {
                const key = `${nr},${nc}`;
                if (!jumpVisited.has(key)) {
                    jumpVisited.add(key);
                    jq.push([nr, nc]);
                }
            };

            while (jHead < jq.length) {
                const [r, c] = jq[jHead++];

                // Ride any moving platform touching (r, c) across its full sweep
                if (movingSurfaceCells.has(`${r},${c}`)) {
                    for (let g = 0; g < movingGroups.length; g++) {
                        const grp = movingGroups[g];
                        let touches = false;
                        for (let k = 0; k < grp.length; k++) {
                            if (grp[k][0] === r && grp[k][1] === c) {
                                touches = true;
                                break;
                            }
                        }
                        if (touches) {
                            for (let k = 0; k < grp.length; k++) {
                                addJumpNode(grp[k][0], grp[k][1]);
                            }
                        }
                    }
                }

                // Walk horizontally across adjacent passable cells if current or target is supported
                for (let dc = -1; dc <= 1; dc += 2) {
                    const nc = c + dc;
                    if (isPassable(r, nc) && (isSupported(r, c) || isSupported(r, nc))) {
                        addJumpNode(r, nc);
                    }
                }

                // Drop straight down (including dropping through '=' one-way platforms)
                if (r + 1 < rows && isPassable(r + 1, c)) {
                    addJumpNode(r + 1, c);
                    if (c - 1 >= 0 && isPassable(r + 1, c - 1)) addJumpNode(r + 1, c - 1);
                    if (c + 1 < cols && isPassable(r + 1, c + 1)) addJumpNode(r + 1, c + 1);
                }

                // Launch jump / double-jump from supported footholds (up to 6 tiles up, 7 across)
                if (isSupported(r, c)) {
                    const airSeen = new Set();
                    const aq = [[r, c]];
                    airSeen.add(`${r},${c}`);
                    let aHead = 0;
                    while (aHead < aq.length) {
                        const [ar, ac] = aq[aHead++];
                        for (let d = 0; d < 4; d++) {
                            const nr = ar + dirs[d][0];
                            const nc = ac + dirs[d][1];
                            if (nr < r - 6 || nr > r + 2 || Math.abs(nc - c) > 7) continue;
                            if (!isPassable(nr, nc)) continue;
                            const aKey = `${nr},${nc}`;
                            if (airSeen.has(aKey)) continue;
                            airSeen.add(aKey);
                            aq.push([nr, nc]);
                            addJumpNode(nr, nc);
                        }
                    }
                }
            }

            for (let i = 0; i < targets.length; i++) {
                const t = targets[i];
                if (!BFS_REQUIRED_TARGETS.has(t.ch)) continue;
                if (!jumpVisited.has(`${t.r},${t.c}`)) {
                    errors.push(`Target '${t.ch}' at (${t.r},${t.c}) cannot be reached via jump/platform physics from 'P'.`);
                }
            }
        }

        return { valid: errors.length === 0, errors };
    }

    const COSMIC_EXO_DATA = {
        TILE,
        TILE_LEGEND,
        BIOMES,
        UPGRADES,
        ENEMIES,
        PROPS,
        SECTORS,
        ENDLESS_ARENAS,
        computeSafeSpawns,
        validateMap
    };

    global.COSMIC_EXO_DATA = COSMIC_EXO_DATA;
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = COSMIC_EXO_DATA;
    }
})(typeof window !== 'undefined' ? window : globalThis);
