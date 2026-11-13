/**
 * COSMIC SURVIVORS v9.0 — Arena Combat Engine
 * Driven by PixiJS v8 Renderer (with Canvas2D fallback), Dynamic Moving Sector Director,
 * Howler.js Multi-Channel Audio, Atomic Zero-Race Level-Up Synthesizer & Multi-Phase Boss AI.
 */
(function (global) {
    'use strict';

    const WORLD_W = 4200;
    const WORLD_H = 3200;
    const MAX_WEAPON_SLOTS = 4;
    const MAX_TRINKET_SLOTS = 4;
    const STORAGE_PREF_KEY = 'cosmic_v9_game_settings';

    // ── Difficulty Calibration (Balanced so bosses require genuine tactical positioning!) ──
    const DIFFICULTIES = {
        easy:      { id: 'easy',      name: 'Keşif (Kolay)',     enemyHp: 0.85, bossHp: 1.00, dmg: 0.80, speed: 0.92, spawn: 0.90, score: 0.85 },
        normal:    { id: 'normal',    name: 'Standart (Normal)', enemyHp: 1.05, bossHp: 1.45, dmg: 1.00, speed: 1.00, spawn: 1.00, score: 1.00 },
        hard:      { id: 'hard',      name: 'Komutan (Zor)',     enemyHp: 1.42, bossHp: 1.95, dmg: 1.25, speed: 1.08, spawn: 1.18, score: 1.35 },
        abyss:     { id: 'abyss',     name: 'Hiçlik (Abyss)',    enemyHp: 1.95, bossHp: 2.75, dmg: 1.55, speed: 1.16, spawn: 1.38, score: 1.85 },
        nightmare: { id: 'nightmare', name: 'Hiçlik (Abyss)',    enemyHp: 1.95, bossHp: 2.75, dmg: 1.55, speed: 1.16, spawn: 1.38, score: 1.85 }
    };

    // ── 8 Playable Starships ─────────────────────────────────────────────────────────────────
    const SHIPS = {
        interceptor: {
            id: 'interceptor', name: 'Avcı (Interceptor)', color: '#38bdf8', starterWeapon: 'dualLaser',
            hp: 105, sh: 55, sp: 345, crit: 0.20, armor: 0.05,
            abilityName: 'WARP DASH', abilityCd: 7.0,
            desc: '+%20 Hız & +%15 Kritik. SPACE ile dokunulmaz atılma ve lazer izi.'
        },
        dreadnought: {
            id: 'dreadnought', name: 'Kruvazör (Dreadnought)', color: '#f59e0b', starterWeapon: 'heavyPlasma',
            hp: 185, sh: 90, sp: 245, crit: 0.08, armor: 0.32,
            abilityName: 'MİKRO FÜZE SALVOSU', abilityCd: 9.5,
            desc: '+%32 Zırh. SPACE ile 360° ağır güdümsüz füze yaylımı.'
        },
        aegis: {
            id: 'aegis', name: 'Aegis (Kalkan Muhafızı)', color: '#10b981', starterWeapon: 'energyDisc',
            hp: 130, sh: 130, sp: 285, crit: 0.10, armor: 0.18,
            abilityName: 'EMP ŞOK DALGASI', abilityCd: 8.5,
            desc: 'Otomatik kalkan darbesi. SPACE düşman mermilerini siler ve kalkana çevirir.'
        },
        phantom: {
            id: 'phantom', name: 'Gölge (Void Phantom)', color: '#c084fc', starterWeapon: 'quantumDagger',
            hp: 95, sh: 55, sp: 335, crit: 0.25, armor: 0.06,
            abilityName: 'GÖLGE SIÇRAMASI', abilityCd: 6.5,
            desc: 'Görünmezlik pelerini + +%65 suikast kritiği.'
        },
        solarflare: {
            id: 'solarflare', name: 'Solar Flare (Güneş Fırtınası)', color: '#f97316', starterWeapon: 'flameLine',
            hp: 125, sh: 70, sp: 295, crit: 0.14, armor: 0.12, solarAura: 135,
            abilityName: 'GÜNEŞ PATLAMASI', abilityCd: 9.0,
            desc: 'Yakındaki düşmanları sürekli yakan korona aurası.'
        },
        tempest: {
            id: 'tempest', name: 'Tempest (Kriyo-Fırtına)', color: '#22d3ee', starterWeapon: 'dualLaser',
            hp: 115, sh: 85, sp: 312, crit: 0.16, armor: 0.14, cryoSlow: true,
            abilityName: 'KRİYO-TESLA FIRTINASI', abilityCd: 8.5,
            desc: 'Saldırılar hedefleri yavaşlatır; SPACE zincir yıldırım + dondurma atar.'
        },
        valkyrie: {
            id: 'valkyrie', name: 'Valkyrie (Drone Taşıyıcı)', color: '#eab308', starterWeapon: 'swarmMissiles',
            hp: 145, sh: 95, sp: 282, crit: 0.15, armor: 0.22,
            abilityName: 'RAILGUN OVERDRIVE', abilityCd: 9.0,
            desc: 'Yüksek taşıyıcı dayanıklılığı; SPACE ağır elektromanyetik ray salvosu atar.'
        },
        chronos: {
            id: 'chronos', name: 'Chronos (Zaman Dokuyucu)', color: '#2dd4bf', starterWeapon: 'energyDisc',
            hp: 115, sh: 105, sp: 306, crit: 0.18, armor: 0.15, bonusCdr: 0.15,
            abilityName: 'ZAMAN DURDURMA', abilityCd: 10.5,
            desc: '+%15 Cooldown Hızı; SPACE düşman ve mermileri yavaşlatan stasis alanı açar.'
        }
    };

    const MAPS = {
        sector9:   { id: 'sector9',   name: 'Sektör 9 Enkazı' },
        nebula:    { id: 'nebula',    name: 'Kuantum Nebulası' },
        blackhole: { id: 'blackhole', name: 'Kara Delik Çevresi' },
        dyson:     { id: 'dyson',     name: 'Dyson Mega-Küre' }
    };

    // ── 14 Weapons (6 Universal + 8 Signature Root) ───────────────────────────────────────────
    const WEAPONS = {
        dualLaser:     { id: 'dualLaser', kind: 'weapon', name: 'Çift Lazer', tag: 'SİLAH', color: '#38bdf8', pairTrinket: 'coolant', altTrinket: 'targetMatrix', evoId: 'gatlingStorm', altEvoId: 'prismOverload', desc: 'Nişan yönüne paralel yüksek hızlı foton lazerleri ateşler.' },
        heavyPlasma:   { id: 'heavyPlasma', kind: 'weapon', name: 'Ağır Plazma Topu', tag: 'SİLAH', color: '#f97316', pairTrinket: 'bioreactor', altTrinket: 'magnet', evoId: 'bloodHarvest', altEvoId: 'gravitonImploder', desc: 'Çarpışmada alansal şok yaratan yüksek kalibreli plazma küresi.' },
        energyDisc:    { id: 'energyDisc', kind: 'weapon', name: 'Dönen Enerji Diski', tag: 'SİLAH', color: '#a78bfa', pairTrinket: 'thruster', altTrinket: 'coolant', evoId: 'aegisResonance', altEvoId: 'cryoVortex', desc: 'Gemi yörüngesinde dönerek yaklaşan düşmanları biçen enerji testereleri.' },
        quantumDagger: { id: 'quantumDagger', kind: 'weapon', name: 'Kuantum Hançeri', tag: 'SİLAH', color: '#fb7185', pairTrinket: 'magnet', altTrinket: 'targetMatrix', evoId: 'cosmicSupernova', altEvoId: 'phantomExecutioner', desc: 'Yüksek kritik şanslı delici kuantum bıçakları fırlatır.' },
        flameLine:     { id: 'flameLine', kind: 'weapon', name: 'Alev Hattı', tag: 'SİLAH', color: '#fb923c', pairTrinket: 'shieldMatrix', altTrinket: 'bioreactor', evoId: 'titanCore', altEvoId: 'necroticNapalm', desc: 'Gemi çevresinde termal yakma darbeleri ve koridoru bırakır.' },
        swarmMissiles: { id: 'swarmMissiles', kind: 'weapon', name: 'Füze Sürüsü', tag: 'SİLAH', color: '#34d399', pairTrinket: 'targetMatrix', altTrinket: 'thruster', evoId: 'quantumArbiter', desc: 'Hedeflere otonom kilitlenen akıllı mikro-füze bataryası.' },

        photonRailgun: { id: 'photonRailgun', kind: 'weapon', shipExclusive: 'interceptor', name: 'Foton Raylı Top', tag: 'İMZA SİLAH', color: '#38bdf8', pairTrinket: 'overdriveCore', evoId: 'tachyonLance', desc: '[AVCI] Ekranı delen elektromanyetik takyon ışını.' },
        flakArtillery: { id: 'flakArtillery', kind: 'weapon', shipExclusive: 'dreadnought', name: 'Balistik Flak Topu', tag: 'İMZA SİLAH', color: '#f59e0b', pairTrinket: 'reactiveArmor', evoId: 'siegeBehemoth', desc: '[KRUVAZÖR] Çarpışmada şarapnellere ayrılan ağır kuşatma topu.' },
        teslaPrism:    { id: 'teslaPrism', kind: 'weapon', shipExclusive: 'aegis', name: 'Tesla Kalkan Prizması', tag: 'İMZA SİLAH', color: '#34d399', pairTrinket: 'harmonicCapacitor', evoId: 'sanctuaryMaelstrom', desc: '[AEGIS] En yakın hedeflere zincirleme ark yıldırım çakar.' },
        voidScythe:    { id: 'voidScythe', kind: 'weapon', shipExclusive: 'phantom', name: 'Hiper-Uzay Tırpanı', tag: 'İMZA SİLAH', color: '#c084fc', pairTrinket: 'phaseCloak', evoId: 'abyssalReaper', desc: '[GÖLGE] Boyut yarığı açıp delici hilal tırpanları savurur.' },
        solarMortar:   { id: 'solarMortar', kind: 'weapon', shipExclusive: 'solarflare', name: 'Plazma Havanı', tag: 'İMZA SİLAH', color: '#f97316', pairTrinket: 'fusionHeart', evoId: 'heliosCataclysm', desc: '[SOLAR] Düşman yoğunluğuna inip yanan termal krater bırakır.' },
        cryoNova:      { id: 'cryoNova', kind: 'weapon', shipExclusive: 'tempest', name: 'Kriyo-Buzul Küresi', tag: 'İMZA SİLAH', color: '#22d3ee', pairTrinket: 'teslaCoil', evoId: 'absoluteZero', desc: '[TEMPEST] Patladığında düşmanları donduran sıfır-altı küresi.' },
        droneSwarm:    { id: 'droneSwarm', kind: 'weapon', shipExclusive: 'valkyrie', name: 'Otonom Savaş Droneları', tag: 'İMZA SİLAH', color: '#eab308', pairTrinket: 'neuralLink', evoId: 'seraphFleet', desc: '[VALKYRIE] Yörüngede dönüp hedeflere hızlı lazer atan dronelar.' },
        chronoRift:    { id: 'chronoRift', kind: 'weapon', shipExclusive: 'chronos', name: 'Zaman Yarığı Projektörü', tag: 'İMZA SİLAH', color: '#2dd4bf', pairTrinket: 'fluxCapacitor', evoId: 'eternityLoop', desc: '[CHRONOS] Düşmanları yavaşlatıp ezen zaman yarığı alanı.' }
    };

    // ── 14 Trinkets (6 Universal + 8 Signature Root) ──────────────────────────────────────────
    const TRINKETS = {
        magnet:            { id: 'magnet', kind: 'trinket', name: 'Mıknatıs Çekirdeği', tag: 'ALET', color: '#34d399', desc: '+%35 XP Çekim Çapı ve +%14 Menzil/Hız.' },
        coolant:           { id: 'coolant', kind: 'trinket', name: 'Kriyo Soğutucu', tag: 'ALET', color: '#38bdf8', desc: 'Tüm silahların dolum süresini (CD) -%12 azaltır.' },
        thruster:          { id: 'thruster', kind: 'trinket', name: 'Kinetik İtici', tag: 'ALET', color: '#a78bfa', desc: '+%11 Hareket Hızı ve +%5 Zırh Koruması.' },
        bioreactor:        { id: 'bioreactor', kind: 'trinket', name: 'Biyo-Reaktör', tag: 'ALET', color: '#fb7185', desc: '+28 Maks HP ve +2.2 HP/sn aktif yenilenme.' },
        targetMatrix:      { id: 'targetMatrix', kind: 'trinket', name: 'Kuantum Nişangah', tag: 'ALET', color: '#f59e0b', desc: '+%8 Kritik Şans ve +%14 Silah Hasarı.' },
        shieldMatrix:      { id: 'shieldMatrix', kind: 'trinket', name: 'Deflektör Matrisi', tag: 'ALET', color: '#38bdf8', desc: '+30 Maks Kalkan ve +%22 Kalkan Rejen Hızı.' },
        overdriveCore:     { id: 'overdriveCore', kind: 'trinket', shipExclusive: 'interceptor', name: 'Hiper-İvme Çekirdeği', tag: 'İMZA ALET', color: '#38bdf8', desc: '+%14 Ateş Hızı & +%18 Kritik Çarpanı.' },
        reactiveArmor:     { id: 'reactiveArmor', kind: 'trinket', shipExclusive: 'dreadnought', name: 'Reaktif Zırh Plakası', tag: 'İMZA ALET', color: '#f59e0b', desc: '+%8 Zırh & darbe alınca şok patlaması.' },
        harmonicCapacitor: { id: 'harmonicCapacitor', kind: 'trinket', shipExclusive: 'aegis', name: 'Harmonik Kondansatör', tag: 'İMZA ALET', color: '#34d399', desc: '+40 Maks Kalkan & +%12 Alan Hasarı.' },
        phaseCloak:        { id: 'phaseCloak', kind: 'trinket', shipExclusive: 'phantom', name: 'Kuantum Gölge Pelerini', tag: 'İMZA ALET', color: '#c084fc', desc: '+%25 Kritik Hasar & uzun görünmezlik.' },
        fusionHeart:       { id: 'fusionHeart', kind: 'trinket', shipExclusive: 'solarflare', name: 'Termonükleer Kalp', tag: 'İMZA ALET', color: '#f97316', desc: '+%20 Silah Hasarı & geniş korona aurası.' },
        teslaCoil:         { id: 'teslaCoil', kind: 'trinket', shipExclusive: 'tempest', name: 'Süper-İletken Bobin', tag: 'İMZA ALET', color: '#22d3ee', desc: '-12% CD & +%15 Kritik Şans.' },
        neuralLink:        { id: 'neuralLink', kind: 'trinket', shipExclusive: 'valkyrie', name: 'Nöral Komuta Ağı', tag: 'İMZA ALET', color: '#eab308', desc: '+%18 Silah Hasarı & Drone/Füze Hızı.' },
        fluxCapacitor:     { id: 'fluxCapacitor', kind: 'trinket', shipExclusive: 'chronos', name: 'Zaman Akı Çekirdeği', tag: 'İMZA ALET', color: '#2dd4bf', desc: '-14% Tüm Dolum Süreleri.' }
    };

    // ── 19 Evolutions ─────────────────────────────────────────────────────────────────────────
    const EVOLUTIONS = {
        gatlingStorm:       { id: 'gatlingStorm', kind: 'evolution', name: 'Gatling Fırtınası', tag: 'EVRİM', color: '#34d399', weaponReq: 'dualLaser', trinketReq: 'coolant', desc: 'Lazerler hiper hızla yağar ve düşmanlar arası seker.' },
        prismOverload:      { id: 'prismOverload', kind: 'evolution', name: 'Prizma Kırılması', tag: 'EVRİM', color: '#38bdf8', weaponReq: 'dualLaser', trinketReq: 'targetMatrix', desc: 'Kritik lazer isabetleri 5 yöne kırılan foton ışınlarına bölünür.' },
        bloodHarvest:       { id: 'bloodHarvest', kind: 'evolution', name: 'Kan Hasadı', tag: 'EVRİM', color: '#fb7185', weaponReq: 'heavyPlasma', trinketReq: 'bioreactor', desc: 'Kızıl plazma patlaması hasarın %8 kadarını cana dönüştürür.' },
        gravitonImploder:   { id: 'gravitonImploder', kind: 'evolution', name: 'Graviton Çökertici', tag: 'EVRİM', color: '#f97316', weaponReq: 'heavyPlasma', trinketReq: 'magnet', desc: 'Patlamalar çevredeki parazitleri çekim merkezine toplar.' },
        aegisResonance:     { id: 'aegisResonance', kind: 'evolution', name: 'Aegis Rezonansı', tag: 'EVRİM', color: '#38bdf8', weaponReq: 'energyDisc', trinketReq: 'thruster', desc: '6 dev kesici disk döner ve sürekli kalkan şarjı besler.' },
        cryoVortex:         { id: 'cryoVortex', kind: 'evolution', name: 'Kriyo Kasırgası', tag: 'EVRİM', color: '#67e8f9', weaponReq: 'energyDisc', trinketReq: 'coolant', desc: 'Sıfır-altı diskler temas ettiği düşmanları dondurur.' },
        cosmicSupernova:    { id: 'cosmicSupernova', kind: 'evolution', name: 'Kozmik Süpernova', tag: 'EVRİM', color: '#a78bfa', weaponReq: 'quantumDagger', trinketReq: 'magnet', desc: 'Kritik hançerler patlayıcı çekim tekilliği oluşturur.' },
        phantomExecutioner: { id: 'phantomExecutioner', kind: 'evolution', name: 'Hayalet İnfazcı', tag: 'EVRİM', color: '#fb7185', weaponReq: 'quantumDagger', trinketReq: 'targetMatrix', desc: 'Delici suikast bıçakları düşük canlı hedefleri infaz eder.' },
        titanCore:          { id: 'titanCore', kind: 'evolution', name: 'Titan Koronası', tag: 'EVRİM', color: '#f59e0b', weaponReq: 'flameLine', trinketReq: 'shieldMatrix', desc: 'Dev güneş alevi halkası ve periyodik Termal Nova yayar.' },
        necroticNapalm:     { id: 'necroticNapalm', kind: 'evolution', name: 'Biyo-Napalm Seli', tag: 'EVRİM', color: '#34d399', weaponReq: 'flameLine', trinketReq: 'bioreactor', desc: 'Yanan düşmanlar pilota can veren biyo-havuzlar bırakır.' },
        quantumArbiter:     { id: 'quantumArbiter', kind: 'evolution', name: 'Kuantum Yargıç', tag: 'EVRİM', color: '#f59e0b', weaponReq: 'swarmMissiles', trinketReq: 'targetMatrix', desc: 'Delici kuantum mızrak yaylımı ateşler.' },
        tachyonLance:       { id: 'tachyonLance', kind: 'evolution', shipExclusive: 'interceptor', name: 'Takyon Mızrağı', tag: 'İMZA EVRİM', color: '#38bdf8', weaponReq: 'photonRailgun', altWeaponReq: 'dualLaser', trinketReq: 'overdriveCore', desc: 'Ekranı kesen sınırsız hızlı foton/takyon rayı!' },
        siegeBehemoth:      { id: 'siegeBehemoth', kind: 'evolution', shipExclusive: 'dreadnought', name: 'Kıyamet Bataryası', tag: 'İMZA EVRİM', color: '#f59e0b', weaponReq: 'flakArtillery', altWeaponReq: 'heavyPlasma', trinketReq: 'reactiveArmor', desc: '10 yöne parça tesirli ağır nükleer top salvosu!' },
        sanctuaryMaelstrom: { id: 'sanctuaryMaelstrom', kind: 'evolution', shipExclusive: 'aegis', name: 'Kutsal İyon Fırtınası', tag: 'İMZA EVRİM', color: '#34d399', weaponReq: 'teslaPrism', altWeaponReq: 'energyDisc', trinketReq: 'harmonicCapacitor', desc: 'Çoklu zincirleme yıldırım arkı ve kalkan yenileme.' },
        abyssalReaper:      { id: 'abyssalReaper', kind: 'evolution', shipExclusive: 'phantom', name: 'Hiçlik Biçicisi', tag: 'İMZA EVRİM', color: '#c084fc', weaponReq: 'voidScythe', altWeaponReq: 'quantumDagger', trinketReq: 'phaseCloak', desc: 'Gölge biçici tırpan fırtınası ve suikast çarpanı.' },
        heliosCataclysm:    { id: 'heliosCataclysm', kind: 'evolution', shipExclusive: 'solarflare', name: 'Helios Güneş Kıyameti', tag: 'İMZA EVRİM', color: '#f97316', weaponReq: 'solarMortar', altWeaponReq: 'flameLine', trinketReq: 'fusionHeart', desc: 'Dev güneş kraterleri ve zincirleme termal patlama.' },
        absoluteZero:       { id: 'absoluteZero', kind: 'evolution', shipExclusive: 'tempest', name: 'Mutlak Sıfır Fırtınası', tag: 'İMZA EVRİM', color: '#22d3ee', weaponReq: 'cryoNova', altWeaponReq: 'dualLaser', trinketReq: 'teslaCoil', desc: 'Tüm yakındaki hedefleri donduran kriyo şimşek küresi.' },
        seraphFleet:        { id: 'seraphFleet', kind: 'evolution', shipExclusive: 'valkyrie', name: 'Seraphim Drone Filosu', tag: 'İMZA EVRİM', color: '#eab308', weaponReq: 'droneSwarm', altWeaponReq: 'swarmMissiles', trinketReq: 'neuralLink', desc: '6 altın Seraphim muhafız droneu sürekli ateş açar.' },
        eternityLoop:       { id: 'eternityLoop', kind: 'evolution', shipExclusive: 'chronos', name: 'Sonsuzluk Döngüsü', tag: 'İMZA EVRİM', color: '#2dd4bf', weaponReq: 'chronoRift', altWeaponReq: 'energyDisc', trinketReq: 'fluxCapacitor', desc: 'Çifte uzay-zaman tekilliği alanı kurar.' }
    };

    // ── 6 Mega Evolutions ─────────────────────────────────────────────────────────────────────
    const SUPER_EVOLUTIONS = {
        infernoGatling:    { id: 'infernoGatling', kind: 'superEvolution', name: 'Cehennem Gatling\'i', tag: 'MEGA EVRİM', color: '#fb7185', req: ['bloodHarvest', 'gatlingStorm'], desc: 'Seken patlayıcı kızıl lazer fırtınası + Can Çalma! (+1 Slotu Boşaltır)' },
        eventHorizon:      { id: 'eventHorizon', kind: 'superEvolution', name: 'Olay Ufku Tekilliği', tag: 'MEGA EVRİM', color: '#38bdf8', req: ['cosmicSupernova', 'aegisResonance'], desc: 'Dev enerji testereleri + Kara Delik EMP patlaması! (+1 Slotu Boşaltır)' },
        omegaJudgement:    { id: 'omegaJudgement', kind: 'superEvolution', name: 'Omega Kıyamet Reaktörü', tag: 'MEGA EVRİM', color: '#f59e0b', req: ['titanCore', 'quantumArbiter'], desc: 'Güneş koronası + delici kuantum mızrakları! (+1 Slotu Boşaltır)' },
        hyperionApex:      { id: 'hyperionApex', kind: 'superEvolution', name: 'Hyperion Işık Hükümdarı', tag: 'MEGA EVRİM', color: '#38bdf8', req: ['tachyonLance', 'gatlingStorm'], desc: '8 yöne takyon lazer ağı ve ışık fırtınası! (+1 Slotu Boşaltır)' },
        ironDreadnought:   { id: 'ironDreadnought', kind: 'superEvolution', name: 'Zırhlı Kıyamet Kalesi', tag: 'MEGA EVRİM', color: '#f59e0b', req: ['siegeBehemoth', 'titanCore'], desc: 'Nükleer havan bombardımanı ve kale koruması! (+1 Slotu Boşaltır)' },
        eclipseSingularity:{ id: 'eclipseSingularity', kind: 'superEvolution', name: 'Tutulma Tanrısı', tag: 'MEGA EVRİM', color: '#c084fc', req: ['abyssalReaper', 'cosmicSupernova'], desc: 'Kara delik boyut tırpanı suikast fırtınası! (+1 Slotu Boşaltır)' }
    };

    const UPG = Object.assign({}, WEAPONS, TRINKETS, EVOLUTIONS, SUPER_EVOLUTIONS);

    const ENEMY_TYPES = {
        swarmer:  { spriteKey: 'swarmer',  r: 14, hp: 22,  sp: 128, xp: 4,  dmg: 9  },
        kamikaze: { spriteKey: 'kamikaze', r: 15, hp: 30,  sp: 175, xp: 6,  dmg: 18 },
        shooter:  { spriteKey: 'shooter',  r: 17, hp: 52,  sp: 92,  xp: 9,  dmg: 12, shoots: true },
        phantom:  { spriteKey: 'phantom',  r: 16, hp: 46,  sp: 138, xp: 10, dmg: 14, teleports: true },
        tank:     { spriteKey: 'tank',     r: 23, hp: 135, sp: 66,  xp: 16, dmg: 18 },
        splitter: { spriteKey: 'splitter', r: 20, hp: 78,  sp: 88,  xp: 12, dmg: 13, splits: true },
        sniper:   { spriteKey: 'sniper',   r: 17, hp: 58,  sp: 78,  xp: 14, dmg: 20, sniper: true },
        queen:    { spriteKey: 'queen',    r: 28, hp: 240, sp: 58,  xp: 32, dmg: 22, summons: true }
    };

    const BOSS_CONFIGS = [
        { spriteKey: 'behemoth',   name: 'OBLIVION BEHEMOTH',      baseHp: 3200,  r: 68, sp: 88,  hasWeakspot: true,  hint: 'Arka mavi reaktör arkına ateş et (+%120 Kritik). Kırmızı hat yüklenince kenara kaç!' },
        { spriteKey: 'leviathan',  name: 'VOID LEVIATHAN',         baseHp: 5600,  r: 72, sp: 105, hasWeakspot: false, hint: 'Sarmal mermi dalgalarına aralık açıp içten saldır. Faz II’de atılma hızlanır!' },
        { spriteKey: 'hivemind',   name: 'NEXUS HIVE-QUEEN',       baseHp: 8500,  r: 76, sp: 78,  hasWeakspot: false, hint: 'Yavru sürülerini temizleyerek baskıyı azalt ve sabit atış pencerelerini yakala!' },
        { spriteKey: 'chronovore', name: 'CHRONOVORE TİTAN',       baseHp: 12500, r: 78, sp: 95,  hasWeakspot: true,  hint: 'Saat yönünde dönen plazma halkalarının arasından manevra yap!' },
        { spriteKey: 'seraphim',   name: 'CORRUPTED DYSON SERAPH', baseHp: 17500, r: 84, sp: 112, hasWeakspot: true,  hint: 'Nihai Sektör Muhafızı! Telegraphed Nova halkasından hemen uzaklaş!' }
    ];

    const G = {
        running: false, paused: false, gameOver: false,
        isLevelingUp: false, levelUpActionTaken: false, isLooting: false, isBossReward: false,
        shipId: 'interceptor', mapId: 'sector9', diffId: 'normal', diff: DIFFICULTIES.normal,
        time: 0, wave: 1, waveTimer: 0, waveDuration: 28, spawnAcc: 0,
        kills: 0, score: 0, creditsEarned: 0, rerolls: 2, skips: 1,
        camX: WORLD_W * 0.5, camY: WORLD_H * 0.5, shakeTime: 0, shakeMag: 0,
        player: null, enemies: [], bosses: [], bullets: [], crystals: [], pickups: [],
        chests: [], particles: [], floorZones: [], orbitals: [], arcs: [], floatTexts: [],
        weaponDamageStats: {}, keys: {}, mouse: { x: 640, y: 360, active: false },
        aimMode: 'mouse', joy: { active: false, dx: 0, dy: 0 },
        settings: { vfxMode: 'normal', showDmg: true, aimMode: 'mouse' },
        currentOffers: [], goChart: null, lastFrameTs: 0, eventBannerTimer: 0
    };

    const el = {};
    function bindDom() {
        [
            'gameCanvas', 'hudXpFill', 'hudShipThumb', 'hudShipName', 'hudLevelPill',
            'hudHpFill', 'hudShFill', 'hudHpText', 'hudShText', 'hudWeaponsRow', 'hudTrinketsRow',
            'btnAimToggle', 'aimModeLabel', 'hudAbFill', 'bossBarCard', 'bossBarThumb',
            'bossBarName', 'bossPhaseTag', 'bossHpFill', 'bossBarHint', 'waveToast',
            'hudMapVal', 'hudWaveVal', 'hudTimeVal', 'hudKillsVal', 'hudScoreVal',
            'btnAudioToggle', 'btnPauseGame', 'sectorPingPill', 'sectorPingText', 'sectorEventBanner',
            'touchUi', 'vjoyZone', 'vjoyKnob', 'touchAbilityBtn',
            'levelUpOv', 'luEyebrow', 'luSubtitle', 'luCardsGrid', 'btnLuReroll', 'luRerollCount', 'btnLuSkip', 'luSkipCount',
            'lootBoxOv', 'lootTitle', 'lootTrack', 'lootResultDesc', 'btnCollectLoot',
            'bossRewardOv', 'bossRewGrid',
            'pauseOv', 'setSfxVol', 'setAmbVol', 'setVfxMode', 'setAimMode', 'setDmgNumbers', 'pauseStatsKv',
            'btnResumeGame', 'btnRestartRun',
            'gameOverOv', 'goEyebrow', 'goTitle', 'goSubtitle', 'goScore', 'goWave', 'goTime', 'goKills', 'goLevel', 'goCreditsEarned',
            'runDamageChart', 'btnPlayAgain'
        ].forEach(id => { el[id] = document.getElementById(id); });
    }

    function loadSettings() {
        try {
            const raw = localStorage.getItem(STORAGE_PREF_KEY);
            if (raw) Object.assign(G.settings, JSON.parse(raw));
        } catch (e) { /* ignore */ }
        G.aimMode = G.settings.aimMode || 'mouse';
        if (global.CosmicRenderer) global.CosmicRenderer.setVfxSettings(G.settings.vfxMode, G.settings.showDmg);
    }

    function saveSettings() {
        try { localStorage.setItem(STORAGE_PREF_KEY, JSON.stringify(G.settings)); } catch (e) { /* ignore */ }
    }

    function parseLaunchConfig() {
        const qs = new URLSearchParams(global.location.search);
        let cfg = {};
        try { cfg = JSON.parse(sessionStorage.getItem('cosmic_launch_cfg') || '{}'); } catch (e) { /* ignore */ }
        const ship = qs.get('ship') || cfg.ship || sessionStorage.getItem('cosmic_ship') || 'interceptor';
        const map = qs.get('map') || cfg.map || sessionStorage.getItem('cosmic_map') || 'sector9';
        const diff = qs.get('diff') || cfg.diff || sessionStorage.getItem('cosmic_diff') || 'normal';
        G.shipId = SHIPS[ship] ? ship : 'interceptor';
        G.mapId = MAPS[map] ? map : 'sector9';
        G.diffId = DIFFICULTIES[diff] ? diff : 'normal';
        G.diff = DIFFICULTIES[G.diffId];
    }

    function createPlayer() {
        const base = SHIPS[G.shipId];
        let bonus = { hpMult: 1, shMult: 1, dmgMult: 1, spMult: 1, armorAdd: 0, critAdd: 0, xpMult: 1, magnetMult: 1 };
        if (global.CosmicPersistence && typeof global.CosmicPersistence.getWorkshopBonuses === 'function') {
            const b = global.CosmicPersistence.getWorkshopBonuses();
            if (b) {
                bonus.hpMult = 1 + (b.hp || 0) * 0.08;
                bonus.shMult = 1 + (b.shield || 0) * 0.08;
                bonus.dmgMult = 1 + (b.dmg || 0) * 0.07;
                bonus.spMult = 1 + (b.speed || 0) * 0.05;
                bonus.armorAdd = (b.armor || 0) * 0.025;
                bonus.critAdd = (b.crit || 0) * 0.025;
                bonus.xpMult = 1 + (b.xp || 0) * 0.08;
                bonus.magnetMult = 1 + (b.magnet || 0) * 0.10;
            }
        }
        const maxHp = Math.round(base.hp * bonus.hpMult);
        const maxSh = Math.round(base.sh * bonus.shMult);
        const weapons = {};
        weapons[base.starterWeapon] = { id: base.starterWeapon, level: 1, timer: 0.1 };

        return {
            shipId: base.id, x: WORLD_W * 0.5, y: WORLD_H * 0.5, vx: 0, vy: 0, aimAngle: -Math.PI / 2,
            hp: maxHp, maxHp, sh: maxSh, maxSh, shDelay: 0,
            baseSp: base.sp * bonus.spMult, baseArmor: base.armor + bonus.armorAdd, baseCrit: base.crit + bonus.critAdd,
            baseDmgMult: bonus.dmgMult, xpMult: bonus.xpMult, baseMagnet: 115 * bonus.magnetMult,
            bonusCdr: base.bonusCdr || 0, solarAuraRadius: base.solarAura || 0, cryoSlow: !!base.cryoSlow,
            level: 1, xp: 0, nextXp: 32, invuln: 0, cloaked: false, cloakCycle: 0, aegisPulseTimer: 6.0,
            abilityCd: 0, abilityMaxCd: base.abilityCd,
            weapons, trinkets: {}, evolutions: new Set(), superEvolutions: new Set(), extraSlots: 0, weaponTimers: {},
            dmgMult: bonus.dmgMult, cdrMult: Math.max(0.4, 1 - (base.bonusCdr || 0)),
            critChance: base.crit + bonus.critAdd, critDamage: 1.85, armor: base.armor + bonus.armorAdd,
            magnetRadius: 115 * bonus.magnetMult, hpRegen: 0
        };
    }

    function recomputePlayerStats() {
        const p = G.player;
        const base = SHIPS[p.shipId];
        const lv = (id) => (p.trinkets[id] ? p.trinkets[id].level : 0);
        p.dmgMult = p.baseDmgMult * (1 + lv('targetMatrix') * 0.14 + lv('fusionHeart') * 0.20 + lv('neuralLink') * 0.18 + lv('harmonicCapacitor') * 0.12);
        const cdrReduction = (base.bonusCdr || 0) + lv('coolant') * 0.11 + lv('overdriveCore') * 0.10 + lv('teslaCoil') * 0.11 + lv('fluxCapacitor') * 0.13;
        p.cdrMult = Math.max(0.32, 1 - Math.min(0.68, cdrReduction));
        p.critChance = Math.min(0.85, p.baseCrit + lv('targetMatrix') * 0.08 + lv('teslaCoil') * 0.08 + lv('phaseCloak') * 0.09);
        p.critDamage = 1.85 + lv('overdriveCore') * 0.20 + lv('phaseCloak') * 0.25;
        p.armor = Math.min(0.75, p.baseArmor + lv('thruster') * 0.05 + lv('reactiveArmor') * 0.08);
        p.magnetRadius = p.baseMagnet * (1 + lv('magnet') * 0.35);
        p.hpRegen = lv('bioreactor') * 2.2;
        p.solarAuraRadius = (base.solarAura || 0) + (lv('fusionHeart') > 0 ? 45 + lv('fusionHeart') * 15 : 0);
    }

    function addDamageStat(sourceId, amt) { G.weaponDamageStats[sourceId] = (G.weaponDamageStats[sourceId] || 0) + amt; }
    function spawnParticle(x, y, color, r = 4, life = 0.36, vx = 0, vy = 0, ring = false) {
        if (G.particles.length > 260) G.particles.shift();
        G.particles.push({ x, y, vx, vy, r, color, life, maxLife: life, ring });
    }
    function addFloatText(x, y, text, color = '#f8fafc', crit = false) {
        if (!G.settings.showDmg || G.floatTexts.length > 48) return;
        G.floatTexts.push({ x, y, text, color, crit, life: 0.55, vy: -36 });
    }
    function addArc(x1, y1, x2, y2, color = '#38bdf8', width = 3) {
        if (G.arcs.length > 40) G.arcs.shift();
        G.arcs.push({ x1, y1, x2, y2, color, width, alpha: 1.0 });
    }
    function triggerShake(mag, time) { G.shakeMag = Math.max(G.shakeMag, mag); G.shakeTime = Math.max(G.shakeTime, time); }
    function showToast(msg) {
        if (el.waveToast) {
            el.waveToast.textContent = msg;
            el.waveToast.classList.add('show');
            setTimeout(() => el.waveToast && el.waveToast.classList.remove('show'), 2800);
        }
    }
    function showBanner(msg) {
        if (el.sectorEventBanner) {
            el.sectorEventBanner.textContent = msg;
            el.sectorEventBanner.classList.add('show');
            G.eventBannerTimer = 4.2;
        }
    }

    function hurtEnemy(en, rawDmg, sourceId, forceCrit = false, hitAngle = 0) {
        if (!en || en.dead) return;
        const p = G.player;
        let crit = forceCrit || Math.random() < p.critChance || p.cloaked;
        let dmg = rawDmg;

        if (en.isBoss && en.hasWeakspot) {
            const rearAng = (en.angle || 0) + Math.PI;
            const diff = Math.abs(((hitAngle - rearAng + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
            if (diff < 0.72) { crit = true; dmg *= 2.2; }
        }
        if (crit) dmg *= p.critDamage;
        if (en.armor) dmg *= (1 - en.armor);

        dmg = Math.max(1, Math.round(dmg));
        en.hp -= dmg;
        en.flashTimer = 0.08;
        if (p.cryoSlow && !en.isBoss) en.frozenTimer = Math.max(en.frozenTimer || 0, 1.4);

        addDamageStat(sourceId, dmg);
        if ((p.superEvolutions.has('infernoGatling') || p.evolutions.has('bloodHarvest')) && Math.random() < 0.25 && p.hp < p.maxHp) {
            p.hp = Math.min(p.maxHp, p.hp + Math.max(1, dmg * 0.05));
        }

        if (crit || en.isBoss || dmg >= 35) {
            addFloatText(en.x + (Math.random() - 0.5) * 14, en.y - en.r, `${dmg}${crit ? '!' : ''}`, crit ? '#fde047' : '#f8fafc', crit);
        }
        if (global.CosmicAudio) global.CosmicAudio.play('hitMetal', 0.25);

        if (en.hp <= 0 && !en.dead) {
            en.dead = true;
            G.kills++;
            G.score += Math.round((en.isBoss ? 1200 : (en.isElite ? 95 : 18)) * G.diff.score);
            G.creditsEarned += en.isBoss ? 180 : (en.isElite ? 22 : 2);
            if (global.CosmicAudio) global.CosmicAudio.play(en.isBoss ? 'explodeBoss' : 'explodeSmall', 0.2);

            if (en.isBoss) {
                triggerShake(12, 0.45);
                for (let k = 0; k < 22; k++) {
                    const a = Math.random() * Math.PI * 2, s = 60 + Math.random() * 220;
                    spawnParticle(en.x, en.y, k % 2 ? '#f59e0b' : '#fb7185', 8 + Math.random() * 8, 0.75, Math.cos(a) * s, Math.sin(a) * s);
                }
                G.chests.push({ x: en.x, y: en.y });
                openBossRewardModal();
            } else {
                spawnParticle(en.x, en.y, en.isElite ? '#f59e0b' : '#fb7185', en.isElite ? 16 : 9, 0.35, 0, 0, true);
                G.crystals.push({ x: en.x, y: en.y, val: en.xp || 5, big: !!en.isElite });
                if (en.isElite || Math.random() < 0.025) G.pickups.push({ x: en.x + 12, y: en.y, kind: Math.random() < 0.55 ? 'heal' : 'shield' });
                if (en.splits && !en.isChild) {
                    spawnEnemy('swarmer', en.x - 18, en.y + 10, false, true);
                    spawnEnemy('swarmer', en.x + 18, en.y + 10, false, true);
                }
            }
        }
    }

    function hurtPlayer(rawDmg, reasonLabel = '', ignoreInvuln = false) {
        const p = G.player;
        if (!p || G.gameOver || G.isLevelingUp) return;
        if (!ignoreInvuln && (p.invuln > 0 || p.cloaked)) return;

        let dmg = rawDmg * G.diff.dmg * (1 - p.armor);
        if (dmg <= 0.1) return;
        if (!ignoreInvuln) p.invuln = 0.48;
        p.shDelay = 3.2;

        if (p.sh > 0) {
            const absorbed = Math.min(p.sh, dmg);
            p.sh -= absorbed;
            dmg -= absorbed;
            if (global.CosmicAudio) global.CosmicAudio.play('hitShield', 0.15);
        }
        if (dmg > 0) {
            p.hp -= dmg;
            if (global.CosmicAudio) global.CosmicAudio.play('playerHurt', 0.15);
            triggerShake(6, 0.22);
        }
        if (!ignoreInvuln && p.trinkets.reactiveArmor) {
            spawnParticle(p.x, p.y, '#f59e0b', 110, 0.28, 0, 0, true);
            G.enemies.forEach(en => {
                if (Math.hypot(en.x - p.x, en.y - p.y) < 130) hurtEnemy(en, 35 * p.trinkets.reactiveArmor.level, 'reactiveArmor');
            });
        }
        if (p.hp <= 0) { p.hp = 0; endRun(reasonLabel || 'Hücum Hattı Düştü'); }
    }

    function getBestAimTarget(fromX, fromY, maxRange = 950) {
        let best = null, bestDist = maxRange;
        const all = G.bosses.concat(G.enemies);
        for (let i = 0; i < all.length; i++) {
            const e = all[i];
            if (e.dead) continue;
            const d = Math.hypot(e.x - fromX, e.y - fromY);
            if (d < bestDist) { bestDist = d; best = e; }
        }
        return best;
    }

    function updatePlayerAim() {
        const p = G.player;
        if (G.aimMode === 'mouse' && G.mouse.active) {
            const wx = G.camX - (global.innerWidth || 1280) * 0.5 + G.mouse.x;
            const wy = G.camY - (global.innerHeight || 720) * 0.5 + G.mouse.y;
            p.aimAngle = Math.atan2(wy - p.y, wx - p.x);
            return;
        }
        const target = getBestAimTarget(p.x, p.y, 1000);
        if (target) p.aimAngle = Math.atan2(target.y - p.y, target.x - p.x);
        else if (Math.hypot(p.vx, p.vy) > 10) p.aimAngle = Math.atan2(p.vy, p.vx);
    }

    function fireWeapon(id, lv, isEvo, isMega) {
        const p = G.player;
        const dmgScale = p.dmgMult * (1 + (lv - 1) * 0.28) * (isMega ? 2.45 : (isEvo ? 1.65 : 1.0));
        const aim = p.aimAngle;
        const col = (UPG[id] && UPG[id].color) || '#38bdf8';

        if (id === 'dualLaser' || id === 'gatlingStorm' || id === 'prismOverload' || id === 'infernoGatling' || id === 'hyperionApex') {
            const count = isMega ? 4 : (isEvo ? 3 : (lv >= 3 ? 2 : 1));
            const speed = isEvo || isMega ? 920 : 760;
            for (let i = 0; i < count; i++) {
                const ang = aim + (i - (count - 1) * 0.5) * 0.10;
                G.bullets.push({
                    x: p.x + Math.cos(ang) * 20, y: p.y + Math.sin(ang) * 20,
                    vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed,
                    r: isMega ? 9 : 6, dmg: 22 * dmgScale, life: 1.4,
                    pierce: isMega ? 4 : (id === 'prismOverload' ? 3 : 1),
                    ricochet: (id === 'gatlingStorm' || isMega) ? 3 : 0,
                    color: col, sprite: 'laser', sourceId: id, hitSet: new Set()
                });
            }
            if (global.CosmicAudio) global.CosmicAudio.play('shootLaser', 0.16);
        } else if (id === 'heavyPlasma' || id === 'bloodHarvest' || id === 'gravitonImploder' || id === 'flakArtillery' || id === 'siegeBehemoth' || id === 'ironDreadnought') {
            const shots = (id === 'ironDreadnought' || id === 'siegeBehemoth') ? 2 : 1;
            for (let s = 0; s < shots; s++) {
                const ang = aim + (s === 0 ? 0 : (Math.random() - 0.5) * 0.35);
                G.bullets.push({
                    x: p.x + Math.cos(ang) * 22, y: p.y + Math.sin(ang) * 22,
                    vx: Math.cos(ang) * 520, vy: Math.sin(ang) * 520,
                    r: isMega ? 15 : 11, dmg: 46 * dmgScale, life: 1.8,
                    aoe: isMega ? 135 : (isEvo ? 98 : 68),
                    graviton: id === 'gravitonImploder',
                    color: col, sprite: 'orb', sourceId: id, hitSet: new Set()
                });
            }
            if (global.CosmicAudio) global.CosmicAudio.play('shootPlasma', 0.14);
        } else if (id === 'quantumDagger' || id === 'cosmicSupernova' || id === 'phantomExecutioner' || id === 'voidScythe' || id === 'abyssalReaper' || id === 'eclipseSingularity') {
            const count = isMega ? 5 : (isEvo ? 4 : Math.min(3, 1 + Math.floor(lv / 2)));
            for (let i = 0; i < count; i++) {
                const ang = aim + (i - (count - 1) * 0.5) * 0.18;
                G.bullets.push({
                    x: p.x, y: p.y, vx: Math.cos(ang) * 860, vy: Math.sin(ang) * 860,
                    r: isEvo || isMega ? 10 : 7, dmg: 32 * dmgScale, life: 1.2,
                    pierce: isMega ? 6 : 3, color: col, sprite: 'laser', sourceId: id, hitSet: new Set()
                });
            }
            if (global.CosmicAudio) global.CosmicAudio.play('shootLaser', 0.25);
        } else if (id === 'swarmMissiles' || id === 'quantumArbiter' || id === 'omegaJudgement') {
            const count = isMega ? 6 : (isEvo ? 5 : 2 + Math.floor(lv / 2));
            for (let i = 0; i < count; i++) {
                const ang = aim + (i - (count - 1) * 0.5) * 0.35;
                G.bullets.push({
                    x: p.x, y: p.y, vx: Math.cos(ang) * 440, vy: Math.sin(ang) * 440,
                    r: 8, dmg: 28 * dmgScale, life: 2.6, homing: true,
                    pierce: isEvo || isMega ? 3 : 1, color: col, sprite: 'missile', sourceId: id, hitSet: new Set()
                });
            }
            if (global.CosmicAudio) global.CosmicAudio.play('shootMissile', 0.14);
        } else if (id === 'flameLine' || id === 'titanCore' || id === 'necroticNapalm' || id === 'solarMortar' || id === 'heliosCataclysm') {
            const target = getBestAimTarget(p.x, p.y, 650);
            const zx = target ? target.x : p.x + Math.cos(aim) * 180;
            const zy = target ? target.y : p.y + Math.sin(aim) * 180;
            const rad = isEvo ? 115 : (72 + lv * 6);
            G.floorZones.push({ x: zx, y: zy, r: rad, color: col, dmgPerSec: 36 * dmgScale, life: 3.4, tick: 0, sourceId: id });
            G.enemies.concat(G.bosses).forEach(en => { if (!en.dead && Math.hypot(en.x - zx, en.y - zy) < rad + en.r) hurtEnemy(en, 34 * dmgScale, id); });
            if (global.CosmicAudio) global.CosmicAudio.play('shootPlasma', 0.2);
        } else if (id === 'photonRailgun' || id === 'tachyonLance') {
            const x2 = p.x + Math.cos(aim) * 920, y2 = p.y + Math.sin(aim) * 920;
            addArc(p.x, p.y, x2, y2, '#38bdf8', isEvo ? 7 : 4);
            G.enemies.concat(G.bosses).forEach(en => {
                if (!en.dead && global.CosmicMapDirector && global.CosmicMapDirector.constructor._pointToSegDist(en.x, en.y, p.x, p.y, x2, y2) < en.r + (isEvo ? 26 : 16)) {
                    hurtEnemy(en, 75 * dmgScale, id, true, aim);
                }
            });
            if (global.CosmicAudio) global.CosmicAudio.play('emp', 0.2);
        } else if (id === 'teslaPrism' || id === 'sanctuaryMaelstrom' || id === 'cryoNova' || id === 'absoluteZero') {
            const chainCount = isEvo ? 6 : (2 + Math.floor(lv / 2));
            let cx = p.x, cy = p.y;
            const hit = new Set(), isCryo = (id === 'cryoNova' || id === 'absoluteZero');
            for (let c = 0; c < chainCount; c++) {
                let nearest = null, bestD = 540;
                for (const en of G.bosses.concat(G.enemies)) {
                    if (en.dead || hit.has(en)) continue;
                    const d = Math.hypot(en.x - cx, en.y - cy);
                    if (d < bestD) { bestD = d; nearest = en; }
                }
                if (!nearest) break;
                hit.add(nearest);
                addArc(cx, cy, nearest.x, nearest.y, isCryo ? '#22d3ee' : '#34d399', isEvo ? 4 : 2.5);
                hurtEnemy(nearest, 42 * dmgScale, id);
                if (isCryo && !nearest.isBoss) nearest.frozenTimer = Math.max(nearest.frozenTimer || 0, isEvo ? 3.2 : 2.0);
                cx = nearest.x; cy = nearest.y;
            }
            if (global.CosmicAudio) global.CosmicAudio.play('shootLaser', 0.2);
        } else if (id === 'chronoRift' || id === 'eternityLoop') {
            const target = getBestAimTarget(p.x, p.y, 580);
            const zx = target ? target.x : p.x + Math.cos(aim) * 160;
            const zy = target ? target.y : p.y + Math.sin(aim) * 160;
            G.floorZones.push({ x: zx, y: zy, r: isEvo ? 145 : 95, color: '#2dd4bf', dmgPerSec: 32 * dmgScale, slowFactor: 0.45, life: 4.0, tick: 0, sourceId: id });
        }
    }

    function updateWeapons(dt) {
        const p = G.player;
        const mapMods = global.CosmicMapDirector.getPlayerModifiers(p);
        const effCdr = p.cdrMult / (mapMods.fireRateMult || 1.0);
        G.orbitals = [];
        const allOwned = [...Object.keys(p.weapons), ...p.evolutions, ...p.superEvolutions];

        for (const wid of allOwned) {
            const isMega = p.superEvolutions.has(wid);
            const isEvo = p.evolutions.has(wid);
            const lv = (p.weapons[wid] && p.weapons[wid].level) || 5;

            if (wid === 'energyDisc' || wid === 'aegisResonance' || wid === 'cryoVortex' || wid === 'sanctuaryMaelstrom' || wid === 'eventHorizon') {
                const count = isMega ? 6 : (isEvo ? 5 : 1 + lv);
                const rad = isMega ? 128 : (isEvo ? 112 : 84);
                const discR = isEvo || isMega ? 15 : 11;
                const col = (UPG[wid] && UPG[wid].color) || '#a78bfa';
                for (let i = 0; i < count; i++) {
                    const ang = G.time * (isEvo ? 4.2 : 3.2) + (i * Math.PI * 2) / count;
                    const ox = p.x + Math.cos(ang) * rad, oy = p.y + Math.sin(ang) * rad;
                    G.orbitals.push({ kind: 'disc', x: ox, y: oy, r: discR, color: col });
                    G.enemies.concat(G.bosses).forEach(en => {
                        if (!en.dead && (!en.orbHitCd || en.orbHitCd <= 0) && Math.hypot(en.x - ox, en.y - oy) < en.r + discR) {
                            en.orbHitCd = 0.28;
                            hurtEnemy(en, (18 + lv * 5) * p.dmgMult * (isMega ? 2.2 : 1.3), wid);
                            if (wid === 'cryoVortex' && !en.isBoss) en.frozenTimer = 2.0;
                        }
                    });
                }
                continue;
            }

            if (wid === 'droneSwarm' || wid === 'seraphFleet') {
                const dCount = isEvo ? 6 : 1 + lv;
                for (let i = 0; i < dCount; i++) {
                    const ang = G.time * 1.9 + (i * Math.PI * 2) / dCount;
                    G.orbitals.push({ kind: 'drone', x: p.x + Math.cos(ang) * 70, y: p.y + Math.sin(ang) * 70, r: 9, color: '#eab308' });
                }
                p.weaponTimers[wid] = (p.weaponTimers[wid] || 0) - dt;
                if (p.weaponTimers[wid] <= 0) {
                    p.weaponTimers[wid] = Math.max(0.28, (isEvo ? 0.55 : 0.95) * effCdr);
                    const tgt = getBestAimTarget(p.x, p.y, 700);
                    if (tgt) {
                        const tang = Math.atan2(tgt.y - p.y, tgt.x - p.x);
                        G.bullets.push({
                            x: p.x, y: p.y, vx: Math.cos(tang) * 780, vy: Math.sin(tang) * 780,
                            r: 6, dmg: 24 * p.dmgMult * (isEvo ? 1.8 : 1.0), life: 1.4,
                            color: '#eab308', sprite: 'laser', sourceId: wid, hitSet: new Set()
                        });
                    }
                }
                continue;
            }

            const baseCdMap = {
                dualLaser: 0.42, gatlingStorm: 0.22, prismOverload: 0.34, infernoGatling: 0.19, hyperionApex: 0.20,
                heavyPlasma: 1.05, bloodHarvest: 0.72, gravitonImploder: 0.80, flakArtillery: 0.92, siegeBehemoth: 0.65, ironDreadnought: 0.58,
                quantumDagger: 0.55, cosmicSupernova: 0.44, phantomExecutioner: 0.40, voidScythe: 0.72, abyssalReaper: 0.48, eclipseSingularity: 0.38,
                swarmMissiles: 0.95, quantumArbiter: 0.62, omegaJudgement: 0.55,
                flameLine: 1.65, titanCore: 1.15, necroticNapalm: 1.25, solarMortar: 1.40, heliosCataclysm: 0.95,
                photonRailgun: 1.25, tachyonLance: 0.78, teslaPrism: 0.85, chronoRift: 1.85, eternityLoop: 1.25,
                cryoNova: 1.10, absoluteZero: 0.72
            };
            p.weaponTimers[wid] = (p.weaponTimers[wid] || 0.1) - dt;
            if (p.weaponTimers[wid] <= 0) {
                p.weaponTimers[wid] = Math.max(0.14, (baseCdMap[wid] || 0.85) * effCdr);
                fireWeapon(wid, lv, isEvo, isMega);
            }
        }
    }

    function activateAbility() {
        const p = G.player;
        if (!p || p.abilityCd > 0 || G.paused || G.isLevelingUp || G.gameOver) return;
        p.abilityCd = p.abilityMaxCd * p.cdrMult;
        if (global.CosmicAudio) global.CosmicAudio.play('dash', 0.1);

        const sid = p.shipId;
        if (sid === 'interceptor') {
            p.invuln = 1.25; p.x += Math.cos(p.aimAngle) * 165; p.y += Math.sin(p.aimAngle) * 165;
            spawnParticle(p.x, p.y, '#38bdf8', 70, 0.35, 0, 0, true);
        } else if (sid === 'dreadnought') {
            for (let i = 0; i < 16; i++) {
                const a = (i * Math.PI * 2) / 16;
                G.bullets.push({ x: p.x, y: p.y, vx: Math.cos(a) * 520, vy: Math.sin(a) * 520, r: 9, dmg: 55 * p.dmgMult, life: 1.6, aoe: 65, color: '#f59e0b', sprite: 'missile', sourceId: 'flakArtillery', hitSet: new Set() });
            }
        } else if (sid === 'aegis') {
            let cleared = 0;
            G.bullets = G.bullets.filter(b => { if (b.isEnemy && Math.hypot(b.x - p.x, b.y - p.y) < 520) { cleared++; return false; } return true; });
            p.sh = Math.min(p.maxSh, p.sh + 35 + cleared * 4);
            spawnParticle(p.x, p.y, '#34d399', 180, 0.45, 0, 0, true);
            if (global.CosmicAudio) global.CosmicAudio.play('emp');
        } else if (sid === 'phantom') {
            p.cloaked = true; p.cloakCycle = 2.2; p.x += Math.cos(p.aimAngle) * 175; p.y += Math.sin(p.aimAngle) * 175;
        } else if (sid === 'solarflare') {
            spawnParticle(p.x, p.y, '#f97316', 230, 0.5, 0, 0, true);
            G.enemies.concat(G.bosses).forEach(en => { if (!en.dead && Math.hypot(en.x - p.x, en.y - p.y) < 280) { hurtEnemy(en, 110 * p.dmgMult, 'flameLine'); en.burnTimer = 4.0; } });
        } else if (sid === 'tempest') { fireWeapon('absoluteZero', 5, true, false); }
        else if (sid === 'valkyrie') { fireWeapon('tachyonLance', 5, true, false); }
        else if (sid === 'chronos') {
            G.enemies.forEach(en => { if (!en.isBoss) en.frozenTimer = Math.max(en.frozenTimer || 0, 3.5); });
            spawnParticle(p.x, p.y, '#2dd4bf', 200, 0.55, 0, 0, true);
        }
    }

    function spawnEnemy(typeKey, x, y, isElite = false, isChild = false) {
        const tpl = ENEMY_TYPES[typeKey] || ENEMY_TYPES.swarmer;
        const hpScale = G.diff.enemyHp * (1 + (G.wave - 1) * 0.24) * (isElite ? 3.2 : (isChild ? 0.55 : 1));
        G.enemies.push({
            type: typeKey, spriteKey: tpl.spriteKey, x, y,
            r: isElite ? tpl.r * 1.35 : (isChild ? tpl.r * 0.72 : tpl.r),
            hp: Math.round(tpl.hp * hpScale), maxHp: Math.round(tpl.hp * hpScale),
            sp: tpl.sp * G.diff.speed * (isElite ? 1.12 : 1), dmg: tpl.dmg,
            xp: isElite ? tpl.xp * 3 : tpl.xp, angle: 0, isElite, isChild,
            shoots: !!tpl.shoots, sniper: !!tpl.sniper, teleports: !!tpl.teleports, splits: !!tpl.splits, summons: !!tpl.summons,
            fireCd: 1.5 + Math.random() * 1.4, telegraphTarget: null,
            flashTimer: 0, frozenTimer: 0, burnTimer: 0, orbHitCd: 0, dead: false
        });
    }

    function spawnBoss(bossIdx) {
        const cfg = BOSS_CONFIGS[bossIdx % BOSS_CONFIGS.length];
        const hp = Math.round(cfg.baseHp * G.diff.bossHp * (1 + (G.wave - 5) * 0.15));
        const p = G.player, a = Math.random() * Math.PI * 2;
        G.bosses.push({
            isBoss: true, spriteKey: cfg.spriteKey, name: cfg.name, hint: cfg.hint,
            x: Math.max(200, Math.min(WORLD_W - 200, p.x + Math.cos(a) * 580)),
            y: Math.max(200, Math.min(WORLD_H - 200, p.y + Math.sin(a) * 460)),
            r: cfg.r, hp, maxHp: hp, sp: cfg.sp * G.diff.speed, armor: 0.14, phase: 1,
            hasWeakspot: cfg.hasWeakspot, angle: 0, atkCd: 3.2, state: 'chase', stateTimer: 0,
            dashVx: 0, dashVy: 0, telegraphRadius: 0, telegraphLine: null, flashTimer: 0, orbHitCd: 0, dead: false
        });
        if (global.CosmicAudio) global.CosmicAudio.play('bossAlarm');
        showToast(`TEHDİT ALARMI: ${cfg.name}`);
    }

    function startWave(num) {
        G.wave = num; G.waveTimer = 0;
        if (num % 5 === 0) spawnBoss(Math.floor(num / 5) - 1);
        else showToast(`DALGA ${num} — FİLO YAKLAŞIYOR`);
        if (global.CosmicAudio) global.CosmicAudio.setAmbientIntensity(Math.min(1, num / 25));
    }

    function updateEnemiesAndBosses(dt) {
        const p = G.player;
        G.waveTimer += dt;
        if (G.waveTimer >= G.waveDuration && G.bosses.length === 0) startWave(G.wave + 1);

        const targetMax = Math.min(135, 16 + G.wave * 8);
        G.spawnAcc += dt * G.diff.spawn * (1.2 + G.wave * 0.25);
        while (G.spawnAcc >= 1 && G.enemies.length < targetMax) {
            G.spawnAcc -= 1;
            const ang = Math.random() * Math.PI * 2, dist = 580 + Math.random() * 240;
            const sx = Math.max(80, Math.min(WORLD_W - 80, p.x + Math.cos(ang) * dist));
            const sy = Math.max(80, Math.min(WORLD_H - 80, p.y + Math.sin(ang) * dist));
            const pool = ['swarmer', 'kamikaze'];
            if (G.wave >= 2) pool.push('shooter', 'tank');
            if (G.wave >= 4) pool.push('phantom', 'splitter');
            if (G.wave >= 6) pool.push('sniper', 'queen');
            spawnEnemy(pool[Math.floor(Math.random() * pool.length)], sx, sy, G.wave >= 3 && Math.random() < 0.045, false);
        }

        for (let i = G.enemies.length - 1; i >= 0; i--) {
            const en = G.enemies[i];
            if (en.dead) { G.enemies.splice(i, 1); continue; }
            if (en.flashTimer > 0) en.flashTimer -= dt;
            if (en.frozenTimer > 0) en.frozenTimer -= dt;
            if (en.orbHitCd > 0) en.orbHitCd -= dt;
            if (en.burnTimer > 0) { en.burnTimer -= dt; if (Math.random() < dt * 2.5) hurtEnemy(en, 8 * p.dmgMult, 'flameLine'); }

            const dx = p.x - en.x, dy = p.y - en.y, dist = Math.hypot(dx, dy) || 1;
            en.angle = Math.atan2(dy, dx);
            const slowMult = en.frozenTimer > 0 ? 0.45 : 1.0;
            const moveMul = ((en.shoots || en.sniper) && dist < 440) ? 0.28 : 1.0;
            en.x += (dx / dist) * en.sp * moveMul * slowMult * dt;
            en.y += (dy / dist) * en.sp * moveMul * slowMult * dt;

            if (en.sniper) {
                en.fireCd -= dt;
                en.telegraphTarget = (en.fireCd <= 0.85 && en.fireCd > 0) ? { x: p.x, y: p.y } : null;
                if (en.fireCd <= 0) {
                    en.fireCd = 3.2; en.telegraphTarget = null;
                    G.bullets.push({ isEnemy: true, x: en.x, y: en.y, vx: (dx / dist) * 480, vy: (dy / dist) * 480, r: 7, dmg: en.dmg, life: 2.8, sprite: 'enemy' });
                }
            } else if (en.shoots) {
                en.fireCd -= dt;
                if (en.fireCd <= 0) {
                    en.fireCd = 2.4;
                    G.bullets.push({ isEnemy: true, x: en.x, y: en.y, vx: (dx / dist) * 260, vy: (dy / dist) * 260, r: 7, dmg: en.dmg, life: 3.4, sprite: 'enemy' });
                }
            }
            if (dist < en.r + 11) hurtPlayer(en.dmg, en.type);
        }

        for (let i = G.bosses.length - 1; i >= 0; i--) {
            const b = G.bosses[i];
            if (b.dead) { G.bosses.splice(i, 1); continue; }
            if (b.flashTimer > 0) b.flashTimer -= dt;
            if (b.orbHitCd > 0) b.orbHitCd -= dt;

            const hpRatio = b.hp / b.maxHp;
            const prevPhase = b.phase;
            if (hpRatio < 0.30) b.phase = 3;
            else if (hpRatio < 0.65) b.phase = 2;
            if (b.phase !== prevPhase) { showToast(`${b.name} — FAZ ${b.phase} AÇILDI!`); triggerShake(8, 0.3); }

            const dx = p.x - b.x, dy = p.y - b.y, dist = Math.hypot(dx, dy) || 1;
            if (b.state === 'chase') {
                b.angle = Math.atan2(dy, dx);
                const phaseSp = b.sp * (1 + (b.phase - 1) * 0.18);
                b.x += (dx / dist) * phaseSp * dt; b.y += (dy / dist) * phaseSp * dt;
                b.atkCd -= dt * (1 + (b.phase - 1) * 0.25);
                if (b.atkCd <= 0) {
                    b.atkCd = 3.4;
                    if (Math.random() < 0.55) {
                        b.state = 'telegraph_dash'; b.stateTimer = 1.05;
                        const ang = Math.atan2(dy, dx);
                        b.dashVx = Math.cos(ang) * (460 + b.phase * 55); b.dashVy = Math.sin(ang) * (460 + b.phase * 55);
                        b.telegraphLine = { x: b.x + Math.cos(ang) * 460, y: b.y + Math.sin(ang) * 460 };
                    } else {
                        b.state = 'telegraph_nova'; b.stateTimer = 1.1; b.telegraphRadius = b.r * 2.6;
                    }
                }
            } else if (b.state === 'telegraph_dash') {
                b.stateTimer -= dt;
                if (b.stateTimer <= 0) { b.telegraphLine = null; b.state = 'dashing'; b.stateTimer = 0.65; }
            } else if (b.state === 'dashing') {
                b.x += b.dashVx * dt; b.y += b.dashVy * dt; b.stateTimer -= dt;
                if (b.stateTimer <= 0) b.state = 'chase';
            } else if (b.state === 'telegraph_nova') {
                b.stateTimer -= dt;
                if (b.stateTimer <= 0) {
                    b.telegraphRadius = 0; b.state = 'chase';
                    const spokes = 10 + b.phase * 4;
                    for (let k = 0; k < spokes; k++) {
                        const a = (k * Math.PI * 2) / spokes + G.time;
                        G.bullets.push({ isEnemy: true, x: b.x, y: b.y, vx: Math.cos(a) * (240 + b.phase * 25), vy: Math.sin(a) * (240 + b.phase * 25), r: 8, dmg: 16 + b.phase * 3, life: 3.8, sprite: 'enemy' });
                    }
                    if (global.CosmicAudio) global.CosmicAudio.play('shootPlasma');
                }
            }
            if (Math.hypot(p.x - b.x, p.y - b.y) < b.r + 11) hurtPlayer(26, b.name);
        }
    }

    function updateBullets(dt) {
        const p = G.player, allHostiles = G.bosses.concat(G.enemies);
        for (let i = G.bullets.length - 1; i >= 0; i--) {
            const b = G.bullets[i];
            b.life -= dt;
            if (b.life <= 0) { G.bullets.splice(i, 1); continue; }
            if (b.homing && !b.isEnemy) {
                const tgt = getBestAimTarget(b.x, b.y, 480);
                if (tgt) {
                    const desired = Math.atan2(tgt.y - b.y, tgt.x - b.x), spd = Math.hypot(b.vx, b.vy) || 440;
                    b.vx = b.vx * 0.90 + Math.cos(desired) * spd * 0.10; b.vy = b.vy * 0.90 + Math.sin(desired) * spd * 0.10;
                }
            }
            b.x += b.vx * dt; b.y += b.vy * dt;

            if (b.isEnemy) {
                if (Math.hypot(b.x - p.x, b.y - p.y) < 11 + b.r * 0.45) { hurtPlayer(b.dmg, 'Düşman Atışı'); G.bullets.splice(i, 1); }
                continue;
            }

            let consumed = false;
            const moveAng = Math.atan2(b.vy, b.vx);
            for (const en of allHostiles) {
                if (en.dead || (b.hitSet && b.hitSet.has(en))) continue;
                if (Math.hypot(b.x - en.x, b.y - en.y) <= en.r + b.r) {
                    if (b.hitSet) b.hitSet.add(en);
                    hurtEnemy(en, b.dmg, b.sourceId, false, moveAng);
                    if (b.aoe) {
                        spawnParticle(b.x, b.y, b.color, b.aoe * 0.65, 0.25, 0, 0, true);
                        for (const other of allHostiles) {
                            if (!other.dead && other !== en && Math.hypot(other.x - b.x, other.y - b.y) <= b.aoe) {
                                hurtEnemy(other, b.dmg * 0.6, b.sourceId);
                                if (b.graviton && !other.isBoss) { other.x += (b.x - other.x) * 0.28; other.y += (b.y - other.y) * 0.28; }
                            }
                        }
                    }
                    if (b.ricochet && b.ricochet > 0) {
                        b.ricochet--;
                        const nxt = getBestAimTarget(b.x, b.y, 320);
                        if (nxt && !b.hitSet.has(nxt)) {
                            const spd = Math.hypot(b.vx, b.vy), na = Math.atan2(nxt.y - b.y, nxt.x - b.x);
                            b.vx = Math.cos(na) * spd; b.vy = Math.sin(na) * spd; continue;
                        }
                    }
                    if (b.pierce && b.pierce > 1) b.pierce--;
                    else { consumed = true; break; }
                }
            }
            if (consumed) G.bullets.splice(i, 1);
        }
    }

    function updateWorldEntities(dt) {
        const p = G.player;
        for (let i = G.floorZones.length - 1; i >= 0; i--) {
            const z = G.floorZones[i]; z.life -= dt; z.tick -= dt;
            if (z.life <= 0) { G.floorZones.splice(i, 1); continue; }
            if (z.tick <= 0) {
                z.tick = 0.45;
                G.enemies.concat(G.bosses).forEach(en => {
                    if (!en.dead && Math.hypot(en.x - z.x, en.y - z.y) <= z.r + en.r) {
                        hurtEnemy(en, z.dmgPerSec * 0.45, z.sourceId);
                        if (z.slowFactor && !en.isBoss) en.frozenTimer = Math.max(en.frozenTimer || 0, 0.7);
                    }
                });
            }
        }
        if (p.solarAuraRadius > 0) {
            G.solarTick = (G.solarTick || 0) - dt;
            if (G.solarTick <= 0) {
                G.solarTick = 0.4;
                G.enemies.concat(G.bosses).forEach(en => { if (!en.dead && Math.hypot(en.x - p.x, en.y - p.y) <= p.solarAuraRadius + en.r) hurtEnemy(en, 11 * p.dmgMult, 'flameLine'); });
            }
        }
        for (let i = G.crystals.length - 1; i >= 0; i--) {
            const c = G.crystals[i], dx = p.x - c.x, dy = p.y - c.y, dist = Math.hypot(dx, dy) || 1;
            if (dist < p.magnetRadius) { const spd = 420 + (p.magnetRadius - dist) * 2.2; c.x += (dx / dist) * spd * dt; c.y += (dy / dist) * spd * dt; }
            if (dist < 22) {
                G.crystals.splice(i, 1);
                if (global.CosmicAudio) global.CosmicAudio.play('xpPickup', 0.22);
                grantXp(c.val * p.xpMult);
                if (G.isLevelingUp) return;
            }
        }
        for (let i = G.pickups.length - 1; i >= 0; i--) {
            const pk = G.pickups[i];
            if (Math.hypot(p.x - pk.x, p.y - pk.y) < 34) {
                if (pk.kind === 'heal') p.hp = Math.min(p.maxHp, p.hp + 28);
                else p.sh = Math.min(p.maxSh, p.sh + 35);
                if (global.CosmicAudio) global.CosmicAudio.play('powerup');
                addFloatText(p.x, p.y - 28, pk.kind === 'heal' ? '+28 HP' : '+35 KALKAN', '#34d399', true);
                G.pickups.splice(i, 1);
            }
        }
        for (let i = G.chests.length - 1; i >= 0; i--) {
            if (Math.hypot(p.x - G.chests[i].x, p.y - G.chests[i].y) < 42) { G.chests.splice(i, 1); openCosmicChestModal(); return; }
        }
        for (let i = G.particles.length - 1; i >= 0; i--) { const pt = G.particles[i]; pt.life -= dt; pt.x += pt.vx * dt; pt.y += pt.vy * dt; if (pt.life <= 0) G.particles.splice(i, 1); }
        for (let i = G.floatTexts.length - 1; i >= 0; i--) { const ft = G.floatTexts[i]; ft.life -= dt; ft.y += ft.vy * dt; if (ft.life <= 0) G.floatTexts.splice(i, 1); }
        for (let i = G.arcs.length - 1; i >= 0; i--) { G.arcs[i].alpha -= dt * 6.5; if (G.arcs[i].alpha <= 0) G.arcs.splice(i, 1); }
    }

    function grantXp(amt) {
        const p = G.player; p.xp += amt;
        if (p.xp >= p.nextXp && !G.isLevelingUp && !G.gameOver) {
            p.xp -= p.nextXp; p.level++;
            p.nextXp = Math.round(32 + p.level * 18 + Math.pow(p.level, 1.38) * 3.5);
            triggerLevelUp();
        }
    }

    function getUpgradePool() {
        const p = G.player, pool = [], maxWSlots = MAX_WEAPON_SLOTS + p.extraSlots;
        for (const mega of Object.values(SUPER_EVOLUTIONS)) {
            if (!p.superEvolutions.has(mega.id) && mega.req.every(r => p.evolutions.has(r))) pool.push(Object.assign({}, mega, { nextLvLabel: 'SÜPER FÜZYON (+1 SLOT)' }));
        }
        for (const evo of Object.values(EVOLUTIONS)) {
            if (p.evolutions.has(evo.id) || (evo.shipExclusive && evo.shipExclusive !== p.shipId) || !p.trinkets[evo.trinketReq]) continue;
            const hasPrimary = p.weapons[evo.weaponReq] && p.weapons[evo.weaponReq].level >= 5;
            const hasAlt = evo.altWeaponReq && p.weapons[evo.altWeaponReq] && p.weapons[evo.altWeaponReq].level >= 5;
            if (hasPrimary || hasAlt) pool.push(Object.assign({}, evo, { replaceWeapon: hasPrimary ? evo.weaponReq : evo.altWeaponReq, nextLvLabel: 'EVRİM FÜZYONU' }));
        }
        const wCount = Object.keys(p.weapons).length + p.evolutions.size + p.superEvolutions.size;
        for (const w of Object.values(WEAPONS)) {
            if (w.shipExclusive && w.shipExclusive !== p.shipId) continue;
            const owned = p.weapons[w.id];
            if (owned) { if (owned.level < 5) pool.push(Object.assign({}, w, { nextLvLabel: `Seviye ${owned.level} -> ${owned.level + 1}` })); }
            else if (wCount < maxWSlots) pool.push(Object.assign({}, w, { nextLvLabel: 'YENİ SİLAH SLOTU' }));
        }
        const tCount = Object.keys(p.trinkets).length;
        for (const t of Object.values(TRINKETS)) {
            if (t.shipExclusive && t.shipExclusive !== p.shipId) continue;
            const owned = p.trinkets[t.id];
            if (owned) { if (owned.level < 5) pool.push(Object.assign({}, t, { nextLvLabel: `Seviye ${owned.level} -> ${owned.level + 1}` })); }
            else if (tCount < MAX_TRINKET_SLOTS) pool.push(Object.assign({}, t, { nextLvLabel: 'YENİ ALET SLOTU' }));
        }
        pool.sort((a, b) => {
            const rank = (x) => x.kind === 'superEvolution' ? 0 : (x.kind === 'evolution' ? 1 : (Math.random() < 0.5 ? 2 : 3));
            return rank(a) - rank(b);
        });
        if (pool.length === 0) {
            pool.push({ id: '_overcharge', kind: 'bonus', name: 'Çekirdek Aşırı Yükü', tag: 'BONUS', nextLvLabel: 'ANLIK GÜÇ', desc: '+35 HP/Kalkan yeniler ve tüm silah hasarını kalıcı +%6 artırır.' });
            pool.push({ id: '_bounty', kind: 'bonus', name: 'Kozmik Kredi Yağmuru', tag: 'BONUS', nextLvLabel: '+150 KREDİ', desc: 'Atölye için anında +150 kalıcı Kozmik Kredi kazandırır.' });
        }
        return pool.slice(0, 3);
    }

    function renderLevelUpCards() {
        G.currentOffers = getUpgradePool();
        el.luCardsGrid.classList.remove('locked');
        el.luCardsGrid.innerHTML = '';
        G.currentOffers.forEach((item, idx) => {
            const btn = document.createElement('button');
            btn.type = 'button'; btn.className = 'lu-card';
            if (item.kind === 'evolution') btn.classList.add('is-evo');
            if (item.kind === 'superEvolution') btn.classList.add('is-mega');
            btn.innerHTML = `<div class="lu-card-top"><span class="lu-tag">${item.tag || 'MODÜL'}</span><span class="lu-keycap">[${idx + 1}]</span></div><div class="lu-name">${item.name}</div><div class="lu-desc">${item.desc}</div><div class="lu-foot">${item.nextLvLabel || 'YÜKSELTME'}</div>`;
            btn.addEventListener('click', () => applyLevelUpChoice(idx));
            el.luCardsGrid.appendChild(btn);
        });
        el.luRerollCount.textContent = G.rerolls; el.luSkipCount.textContent = G.skips;
        el.btnLuReroll.disabled = G.rerolls <= 0; el.btnLuSkip.disabled = G.skips <= 0;
        if (global.gsap && typeof global.gsap.fromTo === 'function') {
            global.gsap.fromTo('.lu-card', { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.22, stagger: 0.05, clearProps: 'transform,opacity' });
        }
    }

    function triggerLevelUp() {
        G.isLevelingUp = true; G.levelUpActionTaken = false; G.paused = true;
        if (global.CosmicAudio) global.CosmicAudio.play('levelup');
        renderLevelUpCards();
        el.levelUpOv.classList.add('open');
    }

    function applyLevelUpChoice(idx) {
        if (!G.isLevelingUp || G.levelUpActionTaken) return;
        const choice = G.currentOffers[idx];
        if (!choice) return;

        // Instant synchronous atomic lock preventing multi-key race exploits
        G.levelUpActionTaken = true;
        G.isLevelingUp = false;
        el.luCardsGrid.classList.add('locked');

        const p = G.player;
        if (choice.kind === 'superEvolution') { choice.req.forEach(r => p.evolutions.delete(r)); p.superEvolutions.add(choice.id); p.extraSlots++; }
        else if (choice.kind === 'evolution') { if (choice.replaceWeapon) delete p.weapons[choice.replaceWeapon]; p.evolutions.add(choice.id); }
        else if (choice.kind === 'weapon') { if (p.weapons[choice.id]) p.weapons[choice.id].level++; else p.weapons[choice.id] = { id: choice.id, level: 1, timer: 0.1 }; }
        else if (choice.kind === 'trinket') {
            if (p.trinkets[choice.id]) p.trinkets[choice.id].level++; else p.trinkets[choice.id] = { id: choice.id, level: 1 };
            if (choice.id === 'bioreactor') { p.maxHp += 28; p.hp += 28; }
            if (choice.id === 'shieldMatrix' || choice.id === 'harmonicCapacitor') { p.maxSh += 35; p.sh += 35; }
            recomputePlayerStats();
        } else if (choice.id === '_overcharge') { p.hp = Math.min(p.maxHp, p.hp + 35); p.sh = Math.min(p.maxSh, p.sh + 35); p.baseDmgMult *= 1.06; recomputePlayerStats(); }
        else if (choice.id === '_bounty') { G.creditsEarned += 150; }

        if (global.CosmicAudio) global.CosmicAudio.play('uiConfirm');
        el.levelUpOv.classList.remove('open');
        G.paused = false; G.lastFrameTs = performance.now();
    }

    function openCosmicChestModal() {
        G.isLooting = true; G.paused = true;
        if (global.CosmicAudio) global.CosmicAudio.play('chestOpen');
        const pool = getUpgradePool();
        const reward = pool[0] || { name: '+200 Kozmik Kredi', desc: 'Atölye fonuna +200 Kredi eklendi.', kind: 'bonus', id: '_bounty' };
        el.lootTrack.innerHTML = ''; el.lootTrack.style.transform = 'translateX(0px)';
        el.lootTitle.textContent = 'Kasa Şifresi Çözülüyor...'; el.lootResultDesc.textContent = ''; el.btnCollectLoot.style.display = 'none';
        const names = ['Kozmik Kredi +120', 'Çekirdek Onarımı', reward.name, 'Kalkan İyonu', 'Aşırı Yük Modülü'];
        for (let i = 0; i < 16; i++) {
            const card = document.createElement('div'); card.className = 'roulette-slot';
            if (i === 12) card.style.borderColor = '#f59e0b';
            card.textContent = i === 12 ? reward.name : names[i % names.length];
            el.lootTrack.appendChild(card);
        }
        el.lootBoxOv.classList.add('open');
        const targetX = -(12 * 140 - 300);
        if (global.gsap && typeof global.gsap.to === 'function') {
            global.gsap.to(el.lootTrack, { x: targetX, duration: 1.5, ease: 'power3.out', onComplete: () => { el.lootTitle.textContent = reward.name; el.lootResultDesc.textContent = reward.desc; el.btnCollectLoot.style.display = 'inline-flex'; } });
        } else {
            el.lootTrack.style.transform = `translateX(${targetX}px)`;
            el.lootTitle.textContent = reward.name; el.lootResultDesc.textContent = reward.desc; el.btnCollectLoot.style.display = 'inline-flex';
        }
        el.btnCollectLoot.onclick = () => {
            if (!G.isLooting) return; G.isLooting = false; G.currentOffers = [reward]; G.isLevelingUp = true; G.levelUpActionTaken = false;
            applyLevelUpChoice(0); el.lootBoxOv.classList.remove('open'); G.paused = false;
        };
    }

    function openBossRewardModal() {
        G.isBossReward = true; G.paused = true; el.bossRewGrid.innerHTML = '';
        const opts = [
            { name: 'Titanyum Çekirdek', tag: 'BOSS ÖDÜLÜ', desc: '+45 Maks HP, +40 Maks Kalkan ve Tam Onarım.', apply: () => { const p = G.player; p.maxHp += 45; p.maxSh += 40; p.hp = p.maxHp; p.sh = p.maxSh; } },
            { name: 'Süper-Kapasitör Matrisi', tag: 'BOSS ÖDÜLÜ', desc: 'Kalıcı +%15 Tüm Silah Hasarı ve -%8 Dolum Süresi.', apply: () => { const p = G.player; p.baseDmgMult *= 1.15; p.bonusCdr += 0.08; recomputePlayerStats(); } }
        ];
        opts.forEach(o => {
            const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'lu-card is-evo';
            btn.innerHTML = `<div class="lu-card-top"><span class="lu-tag">${o.tag}</span></div><div class="lu-name">${o.name}</div><div class="lu-desc">${o.desc}</div>`;
            btn.onclick = () => { if (!G.isBossReward) return; G.isBossReward = false; o.apply(); el.bossRewardOv.classList.remove('open'); G.paused = false; G.lastFrameTs = performance.now(); };
            el.bossRewGrid.appendChild(btn);
        });
        el.bossRewardOv.classList.add('open');
    }

    function updatePauseStatsPanel() {
        const p = G.player; if (!p || !el.pauseStatsKv) return;
        const rows = [
            ['Gemi', SHIPS[p.shipId].name.split(' ')[0]], ['Can (HP)', `${Math.ceil(p.hp)} / ${p.maxHp}`],
            ['Kalkan', `${Math.ceil(p.sh)} / ${p.maxSh}`], ['Hasar Gücü', `${Math.round(p.dmgMult * 100)}%`],
            ['Kritik Şans', `${Math.round(p.critChance * 100)}%`], ['Kritik Çarpan', `${p.critDamage.toFixed(2)}x`],
            ['Zırh', `${Math.round(p.armor * 100)}%`], ['Ateş Hızı (CDR)', `${Math.round((1 - p.cdrMult) * 100)}%`]
        ];
        el.pauseStatsKv.innerHTML = rows.map(([k, v]) => `<div class="stat-kv"><span>${k}</span><span>${v}</span></div>`).join('');
    }

    function togglePause(force) {
        if (G.gameOver || G.isLevelingUp || G.isLooting || G.isBossReward) return;
        G.paused = typeof force === 'boolean' ? force : !G.paused;
        if (G.paused) { updatePauseStatsPanel(); el.pauseOv.classList.add('open'); }
        else { el.pauseOv.classList.remove('open'); G.lastFrameTs = performance.now(); }
    }

    function endRun(reason) {
        if (G.gameOver) return;
        G.gameOver = true; G.running = false; G.paused = true;
        const p = G.player;
        const mins = String(Math.floor(G.time / 60)).padStart(2, '0');
        const secs = String(Math.floor(G.time % 60)).padStart(2, '0');
        const totalCredits = Math.max(25, G.creditsEarned + Math.round(G.score * 0.04));

        el.goEyebrow.textContent = reason.toUpperCase();
        el.goTitle.textContent = G.wave >= 15 ? 'Efsanevi Direniş Tamamlandı' : 'Sektör Görevi Sona Erdi';
        el.goScore.textContent = G.score.toLocaleString('tr-TR');
        el.goWave.textContent = `Dalga ${G.wave}`;
        el.goTime.textContent = `${mins}:${secs}`;
        el.goKills.textContent = G.kills.toLocaleString('tr-TR');
        el.goLevel.textContent = `LV ${p.level}`;
        el.goCreditsEarned.textContent = `+${totalCredits}`;

        if (global.CosmicPersistence) {
            if (typeof global.CosmicPersistence.addCredits === 'function') global.CosmicPersistence.addCredits(totalCredits);
            if (typeof global.CosmicPersistence.recordRun === 'function') {
                global.CosmicPersistence.recordRun({ ship: G.shipId, map: G.mapId, score: G.score, wave: G.wave, kills: G.kills, duration: Math.round(G.time) });
            }
        }
        if (global.CosmicLeaderboard && typeof global.CosmicLeaderboard.submitScore === 'function') {
            global.CosmicLeaderboard.submitScore(SHIPS[G.shipId].name.split(' ')[0], G.score, G.wave, Math.round(G.time), G.diffId, '1p');
        }

        if (global.Chart && el.runDamageChart) {
            if (G.goChart) G.goChart.destroy();
            const entries = Object.entries(G.weaponDamageStats).sort((a, b) => b[1] - a[1]).slice(0, 6);
            const labels = entries.length ? entries.map(([k]) => (UPG[k] ? UPG[k].name : k)) : ['Başlangıç Silahı'];
            const data = entries.length ? entries.map(([, v]) => Math.round(v)) : [0];
            const colors = entries.length ? entries.map(([k]) => (UPG[k] ? UPG[k].color : '#38bdf8')) : ['#38bdf8'];
            G.goChart = new global.Chart(el.runDamageChart.getContext('2d'), {
                type: 'bar',
                data: { labels, datasets: [{ label: 'Toplam Hasar', data, backgroundColor: colors, borderRadius: 6 }] },
                options: {
                    indexAxis: 'y', responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false }, title: { display: true, text: 'SİLAH BAZLI HASAR DAĞILIMI', color: '#94a3b8', font: { family: 'JetBrains Mono', size: 11 } } },
                    scales: { x: { grid: { color: 'rgba(148,163,184,0.1)' }, ticks: { color: '#cbd5e1', font: { family: 'JetBrains Mono', size: 10 } } }, y: { grid: { display: false }, ticks: { color: '#f1f5f9', font: { family: 'Inter', size: 11 } } } }
                }
            });
        }
        el.gameOverOv.classList.add('open');
    }

    function syncHud() {
        const p = G.player; if (!p) return;
        el.hudLevelPill.textContent = `LV ${p.level}`;
        el.hudHpFill.style.width = `${Math.max(0, Math.min(100, (p.hp / p.maxHp) * 100))}%`;
        el.hudShFill.style.width = `${Math.max(0, Math.min(100, (p.sh / Math.max(1, p.maxSh)) * 100))}%`;
        el.hudHpText.textContent = `${Math.ceil(p.hp)} / ${p.maxHp} HP`;
        el.hudShText.textContent = `${Math.ceil(p.sh)} / ${p.maxSh} SH`;
        el.hudXpFill.style.width = `${Math.max(0, Math.min(100, (p.xp / p.nextXp) * 100))}%`;

        const abPct = p.abilityCd <= 0 ? 100 : Math.max(0, (1 - p.abilityCd / (p.abilityMaxCd * p.cdrMult)) * 100);
        el.hudAbFill.style.width = `${abPct}%`; el.hudAbFill.classList.toggle('ready', p.abilityCd <= 0);
        el.hudWaveVal.textContent = G.wave;
        el.hudTimeVal.textContent = `${String(Math.floor(G.time / 60)).padStart(2, '0')}:${String(Math.floor(G.time % 60)).padStart(2, '0')}`;
        el.hudKillsVal.textContent = G.kills; el.hudScoreVal.textContent = G.score;

        const maxW = MAX_WEAPON_SLOTS + p.extraSlots, wItems = [];
        p.superEvolutions.forEach(id => wItems.push({ name: (UPG[id] && UPG[id].name) || id, cls: 'mega', tag: 'MEGA' }));
        p.evolutions.forEach(id => wItems.push({ name: (UPG[id] && UPG[id].name) || id, cls: 'evo', tag: 'EVO' }));
        Object.values(p.weapons).forEach(w => wItems.push({ name: (UPG[w.id] && UPG[w.id].name) || w.id, cls: '', tag: `Lv${w.level}` }));
        let wHtml = '';
        for (let i = 0; i < maxW; i++) wHtml += wItems[i] ? `<span class="slot-chip ${wItems[i].cls}">${wItems[i].name.slice(0, 12)} <b>${wItems[i].tag}</b></span>` : `<span class="slot-chip empty">Silah ${i + 1}</span>`;
        if (el.hudWeaponsRow.dataset.sig !== wHtml) { el.hudWeaponsRow.dataset.sig = wHtml; el.hudWeaponsRow.innerHTML = wHtml; }

        let tHtml = '';
        const tList = Object.values(p.trinkets);
        for (let i = 0; i < MAX_TRINKET_SLOTS; i++) tHtml += tList[i] ? `<span class="slot-chip">${((UPG[tList[i].id] && UPG[tList[i].id].name) || tList[i].id).slice(0, 11)} Lv${tList[i].level}</span>` : `<span class="slot-chip empty">Alet ${i + 1}</span>`;
        if (el.hudTrinketsRow.dataset.sig !== tHtml) { el.hudTrinketsRow.dataset.sig = tHtml; el.hudTrinketsRow.innerHTML = tHtml; }

        const boss = G.bosses[0];
        if (boss) {
            el.bossBarCard.classList.add('visible'); el.bossBarThumb.src = `assets/bosses/${boss.spriteKey}.png`;
            el.bossBarName.textContent = boss.name; el.bossPhaseTag.textContent = `FAZ ${boss.phase}`;
            el.bossHpFill.style.width = `${Math.max(0, Math.min(100, (boss.hp / boss.maxHp) * 100))}%`;
            el.bossBarHint.textContent = boss.hint;
        } else el.bossBarCard.classList.remove('visible');

        const mapState = global.CosmicMapDirector.getRenderState();
        const obj = mapState.objectives && mapState.objectives[0];
        if (obj) {
            const dx = obj.x - p.x, dy = obj.y - p.y, d = Math.round(Math.hypot(dx, dy));
            const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'Doğu' : 'Batı') : (dy > 0 ? 'Güney' : 'Kuzey');
            el.sectorPingText.textContent = `${obj.kind === 'pylon' ? 'Overdrive Rölesi' : 'Kargo Kapsülü'} ${dir} · ${d}m`;
            el.sectorPingPill.classList.add('visible');
        } else el.sectorPingPill.classList.remove('visible');
    }

    function tick(now) {
        if (!G.running) return;
        const dt = Math.min(0.05, Math.max(0.001, (now - (G.lastFrameTs || now)) / 1000));
        G.lastFrameTs = now;

        if (!G.paused && !G.gameOver) {
            G.time += dt;
            const p = G.player;
            let mx = 0, my = 0;
            if (G.keys['KeyW'] || G.keys['ArrowUp']) my -= 1;
            if (G.keys['KeyS'] || G.keys['ArrowDown']) my += 1;
            if (G.keys['KeyA'] || G.keys['ArrowLeft']) mx -= 1;
            if (G.keys['KeyD'] || G.keys['ArrowRight']) mx += 1;
            if (G.joy.active) { mx = G.joy.dx; my = G.joy.dy; }
            const mLen = Math.hypot(mx, my);
            if (mLen > 1) { mx /= mLen; my /= mLen; }

            const mapMods = global.CosmicMapDirector.getPlayerModifiers(p);
            const effSpeed = p.baseSp * (mapMods.speedMult || 1.0) * (p.cloaked ? 1.25 : 1.0);
            p.vx = mx * effSpeed; p.vy = my * effSpeed;
            p.x = Math.max(36, Math.min(WORLD_W - 36, p.x + p.vx * dt));
            p.y = Math.max(36, Math.min(WORLD_H - 36, p.y + p.vy * dt));

            if (p.invuln > 0) p.invuln -= dt;
            if (p.abilityCd > 0) p.abilityCd = Math.max(0, p.abilityCd - dt);
            if (p.hpRegen > 0 && p.hp < p.maxHp) p.hp = Math.min(p.maxHp, p.hp + p.hpRegen * dt);
            if (p.shDelay > 0) p.shDelay -= dt;
            else if (p.sh < p.maxSh) p.sh = Math.min(p.maxSh, p.sh + 6.5 * (1 + (p.trinkets.shieldMatrix ? p.trinkets.shieldMatrix.level * 0.22 : 0)) * dt);

            if (p.shipId === 'phantom') {
                p.cloakCycle = (p.cloakCycle || 0) + dt;
                if (p.cloakCycle >= 10) { p.cloaked = true; p.cloakCycle = 0; }
                else if (p.cloaked && p.cloakCycle >= 1.6) p.cloaked = false;
            }
            if (p.shipId === 'aegis') {
                p.aegisPulseTimer -= dt;
                if (p.aegisPulseTimer <= 0) {
                    p.aegisPulseTimer = 6.0;
                    spawnParticle(p.x, p.y, '#34d399', 145, 0.36, 0, 0, true);
                    G.enemies.forEach(en => { if (Math.hypot(en.x - p.x, en.y - p.y) < 165) hurtEnemy(en, 35 * p.dmgMult, 'energyDisc'); });
                }
            }

            updatePlayerAim();
            updateWeapons(dt);

            global.CosmicMapDirector.update(dt, {
                player: p, enemies: G.enemies,
                onDamagePlayer: (dmg, lbl, ig) => hurtPlayer(dmg, lbl, ig),
                onDamageEnemy: (en, dmg, crit) => hurtEnemy(en, dmg, 'sectorHazard', crit),
                onMeteorImpact: (m) => { triggerShake(5, 0.18); spawnParticle(m.x, m.y, '#f97316', m.r, 0.4, 0, 0, true); },
                onPylonCaptured: () => {
                    G.creditsEarned += 250; G.score += 500;
                    if (global.CosmicAudio) global.CosmicAudio.play('powerup');
                    showBanner('OVERDRİVE RÖLESİ ELE GEÇİRİLDİ (+%30 ATEŞ HIZI · +250 KREDİ)');
                },
                onCargoOpened: (pod) => {
                    if (global.CosmicAudio) global.CosmicAudio.play('chestOpen');
                    for (let k = 0; k < 6; k++) G.crystals.push({ x: pod.x + (Math.random() - 0.5) * 40, y: pod.y + (Math.random() - 0.5) * 40, val: 14, big: true });
                    G.pickups.push({ x: pod.x, y: pod.y, kind: Math.random() < 0.5 ? 'heal' : 'shield' });
                    showBanner('KARGO KAPSÜLÜ AÇILDI (+XP & ONARIM)');
                }
            });

            updateEnemiesAndBosses(dt);
            updateBullets(dt);
            updateWorldEntities(dt);

            if (G.eventBannerTimer > 0) {
                G.eventBannerTimer -= dt;
                if (G.eventBannerTimer <= 0 && el.sectorEventBanner) el.sectorEventBanner.classList.remove('show');
            }
            G.camX += (p.x - G.camX) * Math.min(1, dt * 10);
            G.camY += (p.y - G.camY) * Math.min(1, dt * 10);
        }

        let sx = 0, sy = 0;
        if (G.shakeTime > 0) { G.shakeTime -= dt; sx = (Math.random() - 0.5) * G.shakeMag * 2; sy = (Math.random() - 0.5) * G.shakeMag * 2; }

        global.CosmicRenderer.render({
            time: G.time, worldW: WORLD_W, worldH: WORLD_H, camX: G.camX, camY: G.camY, shakeX: sx, shakeY: sy,
            player: G.player, enemies: G.enemies, bosses: G.bosses, bullets: G.bullets, crystals: G.crystals,
            pickups: G.pickups, chests: G.chests, particles: G.particles, floorZones: G.floorZones,
            orbitals: G.orbitals, arcs: G.arcs, floatTexts: G.floatTexts, mapState: global.CosmicMapDirector.getRenderState()
        });
        syncHud();
        global.requestAnimationFrame(tick);
    }

    function toggleAimMode() {
        G.aimMode = G.aimMode === 'mouse' ? 'auto' : 'mouse';
        G.settings.aimMode = G.aimMode; saveSettings();
        if (el.aimModeLabel) el.aimModeLabel.textContent = G.aimMode === 'mouse' ? '[Q] Fare Nişanı' : '[Q] Otomatik Nişan';
        if (el.setAimMode) el.setAimMode.value = G.aimMode;
        if (el.btnAimToggle) el.btnAimToggle.classList.toggle('active', G.aimMode === 'mouse');
    }

    function wireControls() {
        global.addEventListener('keydown', (e) => {
            G.keys[e.code] = true;
            if (global.CosmicAudio) global.CosmicAudio.unlock();
            if (G.isLevelingUp && !G.levelUpActionTaken) {
                if (e.code === 'Digit1' || e.code === 'Numpad1') { e.preventDefault(); applyLevelUpChoice(0); }
                else if (e.code === 'Digit2' || e.code === 'Numpad2') { e.preventDefault(); applyLevelUpChoice(1); }
                else if (e.code === 'Digit3' || e.code === 'Numpad3') { e.preventDefault(); applyLevelUpChoice(2); }
                else if (e.code === 'KeyR' && G.rerolls > 0) { G.rerolls--; renderLevelUpCards(); }
                else if (e.code === 'KeyF' && G.skips > 0) { G.skips--; G.creditsEarned += 60; G.levelUpActionTaken = true; G.isLevelingUp = false; el.levelUpOv.classList.remove('open'); G.paused = false; }
                return;
            }
            if (e.code === 'Escape') togglePause();
            else if (e.code === 'Space') { e.preventDefault(); activateAbility(); }
            else if (e.code === 'KeyQ') toggleAimMode();
            else if (e.code === 'KeyM' && global.CosmicAudio) global.CosmicAudio.setMuted(!global.CosmicAudio.prefs.muted);
        });
        global.addEventListener('keyup', (e) => { G.keys[e.code] = false; });
        global.addEventListener('mousemove', (e) => { G.mouse.x = e.clientX; G.mouse.y = e.clientY; G.mouse.active = true; });
        global.addEventListener('pointerdown', () => { if (global.CosmicAudio) { global.CosmicAudio.unlock(); global.CosmicAudio.startAmbient(); } }, { once: true });
        global.addEventListener('resize', () => { if (global.CosmicRenderer) global.CosmicRenderer.resize(global.innerWidth, global.innerHeight); });

        if (el.btnAimToggle) el.btnAimToggle.onclick = toggleAimMode;
        if (el.btnPauseGame) el.btnPauseGame.onclick = () => togglePause();
        if (el.btnResumeGame) el.btnResumeGame.onclick = () => togglePause(false);
        if (el.btnRestartRun) el.btnRestartRun.onclick = () => global.location.reload();
        if (el.btnPlayAgain) el.btnPlayAgain.onclick = () => global.location.reload();
        if (el.btnAudioToggle && global.CosmicAudio) el.btnAudioToggle.onclick = () => global.CosmicAudio.setMuted(!global.CosmicAudio.prefs.muted);
        if (el.btnLuReroll) el.btnLuReroll.onclick = () => { if (G.isLevelingUp && !G.levelUpActionTaken && G.rerolls > 0) { G.rerolls--; renderLevelUpCards(); } };
        if (el.btnLuSkip) el.btnLuSkip.onclick = () => { if (G.isLevelingUp && !G.levelUpActionTaken && G.skips > 0) { G.skips--; G.creditsEarned += 60; G.levelUpActionTaken = true; G.isLevelingUp = false; el.levelUpOv.classList.remove('open'); G.paused = false; } };

        if (el.setSfxVol && global.CosmicAudio) { el.setSfxVol.value = Math.round(global.CosmicAudio.prefs.sfxVol * 100); el.setSfxVol.oninput = () => global.CosmicAudio.setSfxVolume(Number(el.setSfxVol.value) / 100); }
        if (el.setAmbVol && global.CosmicAudio) { el.setAmbVol.value = Math.round(global.CosmicAudio.prefs.ambVol * 100); el.setAmbVol.oninput = () => global.CosmicAudio.setAmbientVolume(Number(el.setAmbVol.value) / 100); }
        if (el.setVfxMode) { el.setVfxMode.value = G.settings.vfxMode; el.setVfxMode.onchange = () => { G.settings.vfxMode = el.setVfxMode.value; saveSettings(); global.CosmicRenderer.setVfxSettings(G.settings.vfxMode, G.settings.showDmg); }; }
        if (el.setAimMode) { el.setAimMode.value = G.aimMode; el.setAimMode.onchange = () => { G.aimMode = el.setAimMode.value; G.settings.aimMode = G.aimMode; saveSettings(); if (el.aimModeLabel) el.aimModeLabel.textContent = G.aimMode === 'mouse' ? '[Q] Fare Nişanı' : '[Q] Otomatik Nişan'; }; }
        if (el.setDmgNumbers) { el.setDmgNumbers.value = G.settings.showDmg ? 'on' : 'off'; el.setDmgNumbers.onchange = () => { G.settings.showDmg = el.setDmgNumbers.value === 'on'; saveSettings(); global.CosmicRenderer.setVfxSettings(G.settings.vfxMode, G.settings.showDmg); }; }

        if (el.vjoyZone) {
            let originX = 0, originY = 0;
            el.vjoyZone.addEventListener('pointerdown', (e) => { G.joy.active = true; const r = el.vjoyZone.getBoundingClientRect(); originX = r.left + r.width * 0.5; originY = r.top + r.height * 0.5; el.vjoyZone.setPointerCapture(e.pointerId); });
            el.vjoyZone.addEventListener('pointermove', (e) => {
                if (!G.joy.active) return;
                const dx = e.clientX - originX, dy = e.clientY - originY, clamped = Math.min(Math.hypot(dx, dy), 46), ang = Math.atan2(dy, dx);
                G.joy.dx = Math.cos(ang) * (clamped / 46); G.joy.dy = Math.sin(ang) * (clamped / 46);
                el.vjoyKnob.style.transform = `translate(calc(-50% + ${Math.cos(ang) * clamped}px), calc(-50% + ${Math.sin(ang) * clamped}px))`;
            });
            const endJoy = () => { G.joy.active = false; G.joy.dx = 0; G.joy.dy = 0; el.vjoyKnob.style.transform = 'translate(-50%, -50%)'; };
            el.vjoyZone.addEventListener('pointerup', endJoy); el.vjoyZone.addEventListener('pointercancel', endJoy);
        }
        if (el.touchAbilityBtn) el.touchAbilityBtn.onclick = activateAbility;
    }

    async function boot() {
        bindDom();
        parseLaunchConfig();
        loadSettings();
        if (global.lucide && typeof global.lucide.createIcons === 'function') global.lucide.createIcons();
        G.player = createPlayer();
        recomputePlayerStats();
        G.camX = G.player.x; G.camY = G.player.y;

        el.hudShipThumb.src = `assets/ships/${G.shipId}.png`;
        el.hudShipName.textContent = SHIPS[G.shipId].name;
        el.hudMapVal.textContent = MAPS[G.mapId].name;
        el.aimModeLabel.textContent = G.aimMode === 'mouse' ? '[Q] Fare Nişanı' : '[Q] Otomatik Nişan';

        global.CosmicMapDirector.init(G.mapId, WORLD_W, WORLD_H);
        await global.CosmicRenderer.init(el.gameCanvas);
        global.CosmicRenderer.setMap(G.mapId);
        wireControls();
        startWave(1);
        G.running = true;
        G.lastFrameTs = performance.now();
        global.requestAnimationFrame(tick);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})(window);
