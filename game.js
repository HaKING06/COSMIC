'use strict';

// ═══════════════════════════════════════════════════════════════════════════
// COSMIC SURVIVORS — v7.0 KOZMİK ARENA & HİPER-EVRİM ROGUELIKE
// Saf 1P Odaklı Uzay Roguelike Motoru:
// • Kritik 3-Tuş Hile Açığı Onarımı (Senkron isLevelingUp Atomik Kilidi)
// • 5 Özgün Gemi (Interceptor, Dreadnought, Aegis, Void Phantom, Solar Flare)
// • 3 Gerçek Harita (Sektör 9 Enkazı, Kuantum Nebulası, Kara Delik Çevresi)
// • 4 Silah Slotu + 4 Alet (Trinket) Slotu · Çapraz Evrim & Kozmik Mega Evrim
// • 2 Reroll (Zar At) + 1 Skip (Pas Geç) · 3 Dalgada Bir Elit Mini-Boss & Şans Sandığı
// ═══════════════════════════════════════════════════════════════════════════

const _urlParams = (typeof window !== 'undefined' && window.location && window.location.search)
    ? new URLSearchParams(window.location.search)
    : { get: () => null };
const P1_NAME = sessionStorage.getItem('cosmic_p1') || 'Pilot 1';
const DIFFKEY = _urlParams.get('diff') || sessionStorage.getItem('cosmic_diff') || 'normal';
const SELECTED_SHIP = _urlParams.get('ship') || sessionStorage.getItem('cosmic_ship') || sessionStorage.getItem('cosmic_p1_ship') || 'interceptor';
const SELECTED_MAP = _urlParams.get('map') || sessionStorage.getItem('cosmic_map') || 'sector9';
sessionStorage.setItem('cosmic_ship', SELECTED_SHIP);
sessionStorage.setItem('cosmic_p1_ship', SELECTED_SHIP);
sessionStorage.setItem('cosmic_map', SELECTED_MAP);
const MODE = '1p'; // v7.0: Saf 1P Odaklı Mimari

const DIFF = {
    easy:      { label: 'KOLAY',  cls: 'easy',   ehm: 0.82, esm: 0.85, edm: 0.78, sdm: 1.15, ecm: 0.85, bhm: 0.80, bsr: 0.75, pdm: 1.20, sm: 1.0,  pr: 2.8, sr: 4.5 },
    normal:    { label: 'NORMAL', cls: 'medium', ehm: 1.00, esm: 1.00, edm: 1.00, sdm: 1.00, ecm: 1.00, bhm: 1.00, bsr: 1.00, pdm: 1.00, sm: 1.35, pr: 2.0, sr: 3.5 },
    medium:    { label: 'ORTA',   cls: 'medium', ehm: 1.00, esm: 1.00, edm: 1.00, sdm: 1.00, ecm: 1.00, bhm: 1.00, bsr: 1.00, pdm: 1.00, sm: 1.5,  pr: 1.8, sr: 3.2 },
    hard:      { label: 'ZOR',    cls: 'hard',   ehm: 1.45, esm: 1.22, edm: 1.35, sdm: 0.82, ecm: 1.25, bhm: 1.40, bsr: 1.20, pdm: 0.90, sm: 2.0,  pr: 1.2, sr: 2.4 },
    nightmare: { label: 'KABUS',  cls: 'hard',   ehm: 1.85, esm: 1.38, edm: 1.65, sdm: 0.72, ecm: 1.45, bhm: 1.75, bsr: 1.40, pdm: 0.80, sm: 2.75, pr: 0.9, sr: 1.8 }
};
const DC = DIFF[DIFFKEY] || DIFF.normal;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

// ── Ses Sentezleyici (Web Audio API — Çakışma & Bellek Korumalı) ──
let actx = null;
let sfxVol = 0.5;
let synthSoundOn = true;
let isSoundMuffled = false;
let _activeOscCount = 0;
let _lastToneMap = {};

function iA() { if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)(); }
function eA() { iA(); if (actx && actx.state === 'suspended') actx.resume(); }

function tone(f, d, t = 'sine', v = 0.08, det = 0) {
    if (!actx || !synthSoundOn || sfxVol <= 0) return;
    if (_activeOscCount >= 16) return; // Yoğun dalgalarda ses kanalı doygunluğunu önle
    const nowMs = performance.now();
    const bucket = Math.round(f / 20);
    if (_lastToneMap[bucket] && nowMs - _lastToneMap[bucket] < 18) return;
    _lastToneMap[bucket] = nowMs;
    try {
        const o = actx.createOscillator(), g = actx.createGain();
        _activeOscCount++;
        o.onended = () => { _activeOscCount = Math.max(0, _activeOscCount - 1); };
        o.type = t; o.frequency.value = f; o.detune.value = det;
        let finalVol = v * (sfxVol / 0.5);
        if (isSoundMuffled) finalVol *= 0.2;
        g.gain.setValueAtTime(Math.min(1, finalVol), actx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + d);
        o.connect(g); g.connect(actx.destination);
        o.start(); o.stop(actx.currentTime + d);
    } catch (e) {
        _activeOscCount = Math.max(0, _activeOscCount - 1);
    }
}

const sfx = {
    shoot: () => tone(860, 0.05, 'square', 0.03, Math.random() * 40 - 20),
    hit:   () => tone(220, 0.07, 'sawtooth', 0.04),
    exp:   () => { tone(85, 0.28, 'sawtooth', 0.08); tone(55, 0.36, 'triangle', 0.06); },
    bKill: () => { for (let i = 0; i < 6; i++) setTimeout(() => tone(160 + i * 90, 0.25, 'sawtooth', 0.09), i * 65); },
    pow:   () => { tone(523, 0.09, 'sine', 0.07); setTimeout(() => tone(659, 0.09, 'sine', 0.07), 60); setTimeout(() => tone(784, 0.14, 'sine', 0.08), 120); },
    lvl:   () => { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.14, 'triangle', 0.08), i * 55)); },
    dmg:   () => tone(105, 0.16, 'sawtooth', 0.09),
    wave:  () => { tone(330, 0.18, 'triangle', 0.06); setTimeout(() => tone(440, 0.26, 'triangle', 0.07), 120); },
    dash:  () => { tone(320, 0.07, 'sawtooth', 0.07); setTimeout(() => tone(940, 0.14, 'sine', 0.08), 35); },
    salvo: () => tone(210, 0.07, 'sawtooth', 0.05, Math.random() * 80 - 40),
    emp:   () => { tone(90, 0.42, 'sine', 0.11); tone(660, 0.26, 'triangle', 0.08); },
    chest: () => { [440, 554, 659, 880, 1174].forEach((f, i) => setTimeout(() => tone(f, 0.18, 'sine', 0.09), i * 65)); }
};

function setCursorMode(show) {
    if (show) document.body.classList.remove('playing-cursor');
    else document.body.classList.add('playing-cursor');
}
function setSoundMuffled(m) { isSoundMuffled = m; }

// ── 5 Özgün Gemi (Karakter) Tanımları ──
const SHIPS = {
    interceptor: {
        id: 'interceptor',
        name: 'Avcı (Interceptor)',
        color: '#00f0ff',
        starterWeapon: 'dualLaser',
        hp: 100,
        sh: 50,
        sp: 295 * 1.20, // +%20 Hareket Hızı pasifi
        crit: 0.20,     // +%15 Kritik pasifi (%5 baz + %15)
        armor: 0.0,
        passiveName: '+%20 Hareket Hızı & +%15 Kritik Şans',
        abilityName: 'WARP DASH',
        abilityCd: 7.0,
        abilityColor: '#00f0ff',
        abilityDesc: '1.2 sn dokunulmaz takla atar, arkasında yakıcı lazer hattı bırakır.'
    },
    dreadnought: {
        id: 'dreadnought',
        name: 'Kruvazör (Dreadnought)',
        color: '#ffaa00',
        starterWeapon: 'heavyPlasma',
        hp: 175,
        sh: 85,
        sp: 265 * 0.90, // -%10 Hız
        crit: 0.05,
        armor: 0.30,    // +%30 Zırh pasifi
        passiveName: '+%30 Zırh Koruması & -%10 Hareket Hızı',
        abilityName: 'MİKRO FÜZE SALVOSU',
        abilityCd: 10.5,
        abilityColor: '#ffaa00',
        abilityDesc: '3 sn boyunca 360° her yöne güdümsüz mikro füze salvosu ateşler.'
    },
    aegis: {
        id: 'aegis',
        name: 'Aegis (Kalkan Muhafızı)',
        color: '#bf00ff',
        starterWeapon: 'energyDisc',
        hp: 115,
        sh: 125,
        sp: 270,
        crit: 0.08,
        armor: 0.12,
        passiveName: 'Otomatik Kalkan Patlaması (6 sn\'de bir elektro-şok halkası)',
        abilityName: 'EMP ŞOK DALGASI',
        abilityCd: 12.0,
        abilityColor: '#bf00ff',
        abilityDesc: 'Ekrandaki tüm düşman mermilerini siler ve kalkan enerjisine dönüştürür.'
    },
    phantom: {
        id: 'phantom',
        name: 'Gölge (Void Phantom)',
        color: '#ff006a',
        starterWeapon: 'quantumDagger',
        hp: 95,
        sh: 55,
        sp: 315,
        crit: 0.22,
        armor: 0.05,
        passiveName: 'Her 10 sn\'de 1.5 sn Görünmezlik & Arkadan Vuruş Bonusu (+%60 Kritik)',
        abilityName: 'GÖLGE SIÇRAMASI',
        abilityCd: 8.0,
        abilityColor: '#ff006a',
        abilityDesc: 'Baktığı yöne kuantum sıçraması yapar, 1.5 sn görünmezlik ve suikast gücü açar.'
    },
    solarflare: {
        id: 'solarflare',
        name: 'Solar Flare (Güneş Fırtınası)',
        color: '#ff6600',
        starterWeapon: 'flameLine',
        hp: 125,
        sh: 70,
        sp: 280,
        crit: 0.12,
        armor: 0.10,
        passiveName: 'Yakındaki düşmanları sürekli yakan Güneş Radyasyon Aurası',
        abilityName: 'GÜNEŞ PATLAMASI',
        abilityCd: 9.5,
        abilityColor: '#ff6600',
        abilityDesc: 'Geniş çapta korona novası patlatarak tüm düşmanları ateşe verir.'
    }
};

// ── 3 Gerçek Harita Tanımları ──
const MAPS = {
    sector9: {
        id: 'sector9',
        name: 'Sektör 9 Enkazı',
        subtitle: 'Dönen Hurda Metaller & Dengeli Parazit Filosu',
        bgTop: '#03010a',
        bgBot: '#09041e',
        gridColor: 'rgba(0, 240, 255, 0.05)',
        borderColor: '#00f0ff',
        scoreMult: 1.0,
        enemyPool: ['drone', 'tank', 'speeder', 'shooter', 'orbiter', 'splitter', 'shielder', 'sniper']
    },
    nebula: {
        id: 'nebula',
        name: 'Kuantum Nebulası',
        subtitle: 'Hızlandıran/Yavaşlatan Gaz Bulutları & Hayalet Parazitler',
        bgTop: '#040112',
        bgBot: '#160326',
        gridColor: 'rgba(191, 0, 255, 0.06)',
        borderColor: '#bf00ff',
        scoreMult: 1.25,
        enemyPool: ['speeder', 'phantom', 'shooter', 'sniper', 'sweeper', 'kamikaze', 'orbiter', 'splitter']
    },
    blackhole: {
        id: 'blackhole',
        name: 'Kara Delik Çevresi',
        subtitle: 'Merkez Çekim Anomalisi, Lav Asteroidleri & Zırhlı Elitler',
        bgTop: '#080106',
        bgBot: '#1c050a',
        gridColor: 'rgba(255, 85, 0, 0.06)',
        borderColor: '#ff5500',
        scoreMult: 1.5,
        enemyPool: ['tank', 'shielder', 'healer', 'sweeper', 'kamikaze', 'sniper', 'phantom', 'splitter']
    }
};

// ── Slot Limitleri: 4 Silah + 4 Alet (Trinket) ──
const MAX_WEAPON_SLOTS = 4;
const MAX_TRINKET_SLOTS = 4;
const MAX_PERK_SLOTS = 8; // 4 Silah + 4 Alet toplamı
const MAX_PERK_LEVEL = 5;

// ── 6 Evrensel Silah + 5 Karaktere Özel Kök Silahı (Weapons - 4 Slot) ──
const WEAPONS = {
    dualLaser: {
        id: 'dualLaser', kind: 'weapon', name: 'Çift Lazer', icon: '⚡', color: '#00f0ff',
        pairTrinket: 'coolant', altTrinket: 'targetMatrix', evoId: 'gatlingStorm', altEvoId: 'prismOverload',
        desc: 'Paralel foton namlularından yüksek hızlı lazerler ateşler. (+Soğutucu ➔ Gatling | +Nişangah ➔ Prizma)'
    },
    heavyPlasma: {
        id: 'heavyPlasma', kind: 'weapon', name: 'Ağır Plazma Topu', icon: '☄️', color: '#ff5500',
        pairTrinket: 'bioreactor', altTrinket: 'magnet', evoId: 'bloodHarvest', altEvoId: 'gravitonImploder',
        desc: 'Hedefe çarptığında alansal şok yaratan ağır plazma gülleleri. (+Reaktör ➔ Kan Hasadı | +Mıknatıs ➔ Graviton)'
    },
    energyDisc: {
        id: 'energyDisc', kind: 'weapon', name: 'Dönen Enerji Diski', icon: '💿', color: '#bf00ff',
        pairTrinket: 'thruster', altTrinket: 'coolant', evoId: 'aegisResonance', altEvoId: 'cryoVortex',
        desc: 'Gemi yörüngesinde dönerek yaklaşan parazitleri biçen plazma testereleri. (+İtici ➔ Aegis | +Soğutucu ➔ Kriyo)'
    },
    quantumDagger: {
        id: 'quantumDagger', kind: 'weapon', name: 'Kuantum Hançeri', icon: '🗡️', color: '#ff006a',
        pairTrinket: 'magnet', altTrinket: 'targetMatrix', evoId: 'cosmicSupernova', altEvoId: 'phantomExecutioner',
        desc: 'Yüksek kritik şanslı delici faz hançerleri. (+Mıknatıs ➔ Süpernova | +Nişangah ➔ Hayalet İnfazcı)'
    },
    flameLine: {
        id: 'flameLine', kind: 'weapon', name: 'Alev Hattı', icon: '🔥', color: '#ff8800',
        pairTrinket: 'shieldMatrix', altTrinket: 'bioreactor', evoId: 'titanCore', altEvoId: 'necroticNapalm',
        desc: 'Geminin önünde ve arkasında yanan plazma koridoru. (+Deflektör ➔ Titan Koronası | +Reaktör ➔ Biyo-Napalm)'
    },
    swarmMissiles: {
        id: 'swarmMissiles', kind: 'weapon', name: 'Füze Sürüsü', icon: '🚀', color: '#00ff88',
        pairTrinket: 'targetMatrix', altTrinket: 'thruster', evoId: 'quantumArbiter',
        desc: 'En yakın hedeflere kilitlenen güdümlü mikro füze bataryası ateşler.'
    },
    // ── 5 KARAKTERE ÖZEL KÖK SİLAHI (SIGNATURE ROOT WEAPONS) ──
    photonRailgun: {
        id: 'photonRailgun', kind: 'weapon', shipExclusive: 'interceptor',
        name: 'Foton Raylı Top', icon: '🚄', color: '#00f0ff',
        pairTrinket: 'overdriveCore', evoId: 'tachyonLance',
        desc: '[AVCI ÖZEL KÖK SİLAHI] Yüksek hızlı delici elektromanyetik foton rayı ateşler.'
    },
    flakArtillery: {
        id: 'flakArtillery', kind: 'weapon', shipExclusive: 'dreadnought',
        name: 'Balistik Flak Topu', icon: '💣', color: '#ffaa00',
        pairTrinket: 'reactiveArmor', evoId: 'siegeBehemoth',
        desc: '[KRUVAZÖR ÖZEL KÖK SİLAHI] Çarpışmada şarapnellere bölünen ağır zırh delici batarya.'
    },
    teslaPrism: {
        id: 'teslaPrism', kind: 'weapon', shipExclusive: 'aegis',
        name: 'Tesla Kalkan Prizması', icon: '⚡', color: '#bf00ff',
        pairTrinket: 'harmonicCapacitor', evoId: 'sanctuaryMaelstrom',
        desc: '[AEGIS ÖZEL KÖK SİLAHI] Kalkan enerjisine oranla zincirleme yıldırım arkları çakar.'
    },
    voidScythe: {
        id: 'voidScythe', kind: 'weapon', shipExclusive: 'phantom',
        name: 'Hiper-Uzay Tırpanı', icon: '🌙', color: '#ff006a',
        pairTrinket: 'phaseCloak', evoId: 'abyssalReaper',
        desc: '[GÖLGE ÖZEL KÖK SİLAHI] Boyut yarığı açarak arkadan vuruşlarda yüksek infaz hasarı verir.'
    },
    solarMortar: {
        id: 'solarMortar', kind: 'weapon', shipExclusive: 'solarflare',
        name: 'Plazma Havanı', icon: '☄️', color: '#ff6600',
        pairTrinket: 'fusionHeart', evoId: 'heliosCataclysm',
        desc: '[SOLAR FLARE ÖZEL KÖK SİLAHI] Düştüğü yerde yanan güneş kraterleri bırakan termal havan.'
    }
};

// ── 6 Evrensel Alet + 5 Karaktere Özel Kök Aleti (Trinkets - 4 Slot) ──
const TRINKETS = {
    magnet: {
        id: 'magnet', kind: 'trinket', name: 'Mıknatıs Çekirdeği', icon: '🧲', color: '#44ffaa',
        pairWeapon: 'quantumDagger', evoId: 'cosmicSupernova',
        desc: 'XP/Ganimet çekim çapını +%35 ve silah menzilini +%15 artırır. (Hançer veya Plazma ile Evrimleşir)'
    },
    coolant: {
        id: 'coolant', kind: 'trinket', name: 'Kriyo Soğutucu', icon: '❄️', color: '#00ccff',
        pairWeapon: 'dualLaser', evoId: 'gatlingStorm',
        desc: 'Tüm silahların ateşleme süresini ve Cooldown süresini -%14 azaltır. (Lazer veya Disk ile Evrimleşir)'
    },
    thruster: {
        id: 'thruster', kind: 'trinket', name: 'Kinetik İtici', icon: '🛡️', color: '#aa66ff',
        pairWeapon: 'energyDisc', evoId: 'aegisResonance',
        desc: 'Gemi hareket hızını +%12 ve zırh korumasını +%6 artırır. (Enerji Diski ile Evrimleşir)'
    },
    bioreactor: {
        id: 'bioreactor', kind: 'trinket', name: 'Biyo-Reaktör', icon: '🩸', color: '#ff2255',
        pairWeapon: 'heavyPlasma', evoId: 'bloodHarvest',
        desc: 'Maksimum canı +30 HP artırır ve +2.5 HP/sn biyo-onarım sağlar. (Plazma veya Alev ile Evrimleşir)'
    },
    targetMatrix: {
        id: 'targetMatrix', kind: 'trinket', name: 'Kuantum Nişangah', icon: '🎯', color: '#ffd700',
        pairWeapon: 'swarmMissiles', evoId: 'quantumArbiter',
        desc: 'Kritik şansını +%9 ve mermi hasarını +%15 artırır. (Füze, Lazer veya Hançer ile Evrimleşir)'
    },
    shieldMatrix: {
        id: 'shieldMatrix', kind: 'trinket', name: 'Deflektör Matrisi', icon: '◆', color: '#00f0ff',
        pairWeapon: 'flameLine', evoId: 'titanCore',
        desc: 'Maksimum kalkanı +35 SH ve kalkan dolum hızını +%20 artırır. (Alev Hattı ile Evrimleşir)'
    },
    // ── 5 KARAKTERE ÖZEL KÖK ALETİ (SIGNATURE ROOT TRINKETS) ──
    overdriveCore: {
        id: 'overdriveCore', kind: 'trinket', shipExclusive: 'interceptor',
        name: 'Hiper-İvme Çekirdeği', icon: '⚡', color: '#00f0ff',
        pairWeapon: 'photonRailgun', evoId: 'tachyonLance',
        desc: '[AVCI ÖZEL KÖK ALETİ] Ateş hızını +%15 ve kritik çarpanını +%20 artırır. Takyon Mızrağı katalizörüdür.'
    },
    reactiveArmor: {
        id: 'reactiveArmor', kind: 'trinket', shipExclusive: 'dreadnought',
        name: 'Reaktif Zırh Plakası', icon: '🛡️', color: '#ffaa00',
        pairWeapon: 'flakArtillery', evoId: 'siegeBehemoth',
        desc: '[KRUVAZÖR ÖZEL KÖK ALETİ] Zırhı +%8 artırır ve alınan darbede karşı-şok patlatır. Kıyamet Bataryası katalizörüdür.'
    },
    harmonicCapacitor: {
        id: 'harmonicCapacitor', kind: 'trinket', shipExclusive: 'aegis',
        name: 'Harmonik Kondansatör', icon: '🔋', color: '#bf00ff',
        pairWeapon: 'teslaPrism', evoId: 'sanctuaryMaelstrom',
        desc: '[AEGIS ÖZEL KÖK ALETİ] Kalkanı +45 SH ve alan çapını +%12 büyütür. Kutsal İyon Fırtınası katalizörüdür.'
    },
    phaseCloak: {
        id: 'phaseCloak', kind: 'trinket', shipExclusive: 'phantom',
        name: 'Kuantum Gölge Pelerini', icon: '👻', color: '#ff006a',
        pairWeapon: 'voidScythe', evoId: 'abyssalReaper',
        desc: '[GÖLGE ÖZEL KÖK ALETİ] Görünmezlik süresini ve suikast kritiğini +%25 artırır. Hiçlik Biçicisi katalizörüdür.'
    },
    fusionHeart: {
        id: 'fusionHeart', kind: 'trinket', shipExclusive: 'solarflare',
        name: 'Termonükleer Kalp', icon: '☀️', color: '#ff6600',
        pairWeapon: 'solarMortar', evoId: 'heliosCataclysm',
        desc: '[SOLAR FLARE ÖZEL KÖK ALETİ] Yanma hasarını +%25 ve aura çapını artırır. Helios Kıyameti katalizörüdür.'
    }
};

// UPG birleşik referans tablosu
const UPG = Object.assign({}, WEAPONS, TRINKETS);
const WEAPON_KEYS = Object.keys(WEAPONS);
const TRINKET_KEYS = Object.keys(TRINKETS);
const UPG_KEYS = Object.keys(UPG);

// ── Çapraz Evrim Matrisi (Silah_A + Alet_B = Evrim_1 | Silah_A + Alet_C = Evrim_2 | Gemi Özel Evrimleri) ──
const EVOLUTIONS = {
    gatlingStorm: {
        id: 'gatlingStorm', kind: 'evolution',
        name: 'Gatling Fırtınası', icon: '🌪️', color: '#00ff88',
        weaponReq: 'dualLaser', trinketReq: 'coolant',
        req: ['dualLaser', 'coolant'],
        formula: 'Çift Lazer Lv.5 + Kriyo Soğutucu Lv.5',
        desc: 'Lazerler hiper-hızla yağar ve isabet ettiği düşmanlar arasında otomatik olarak 3 kez seker (Ricochet).'
    },
    prismOverload: {
        id: 'prismOverload', kind: 'evolution',
        name: 'Prizma Kırılması', icon: '🌈', color: '#00f0ff',
        weaponReq: 'dualLaser', trinketReq: 'targetMatrix',
        req: ['dualLaser', 'targetMatrix'],
        formula: 'Çift Lazer Lv.5 + Kuantum Nişangah Lv.5 (Çapraz Dal)',
        desc: 'Çift Lazerin çapraz evrimi! Kritik lazer vuruşları 5 yöne kırılan gökkuşağı fotonlarına bölünür.'
    },
    bloodHarvest: {
        id: 'bloodHarvest', kind: 'evolution',
        name: 'Kan Hasadı', icon: '🩸', color: '#ff1744',
        weaponReq: 'heavyPlasma', trinketReq: 'bioreactor',
        req: ['heavyPlasma', 'bioreactor'],
        formula: 'Ağır Plazma Topu Lv.5 + Biyo-Reaktör Lv.5',
        desc: 'Her vuruş kızıl plazma patlaması yayar ve verilen hasarın %10\'unu doğrudan cana çevirir.'
    },
    gravitonImploder: {
        id: 'gravitonImploder', kind: 'evolution',
        name: 'Graviton Çökertici', icon: '🪐', color: '#ff8800',
        weaponReq: 'heavyPlasma', trinketReq: 'magnet',
        req: ['heavyPlasma', 'magnet'],
        formula: 'Ağır Plazma Topu Lv.5 + Mıknatıs Çekirdeği Lv.5 (Çapraz Dal)',
        desc: 'Ağır Plazmanın çapraz evrimi! Patlama noktasında düşmanları merkeze çekip birbirine çarptırır.'
    },
    aegisResonance: {
        id: 'aegisResonance', kind: 'evolution',
        name: 'Aegis Rezonansı', icon: '💠', color: '#00f0ff',
        weaponReq: 'energyDisc', trinketReq: 'thruster',
        req: ['energyDisc', 'thruster'],
        formula: 'Dönen Enerji Diski Lv.5 + Kinetik İtici Lv.5',
        desc: '6 adet dev kesici disk döner; hareket ettikçe kalkan hızla dolar, kalkan kırılınca tüm ekranı temizleyen EMP patlar.'
    },
    cryoVortex: {
        id: 'cryoVortex', kind: 'evolution',
        name: 'Kriyo Kasırgası', icon: '❄️', color: '#80e5ff',
        weaponReq: 'energyDisc', trinketReq: 'coolant',
        req: ['energyDisc', 'coolant'],
        formula: 'Dönen Enerji Diski Lv.5 + Kriyo Soğutucu Lv.5 (Çapraz Dal)',
        desc: 'Enerji Diskinin çapraz evrimi! Sıfır-altı buz testereleri temas ettiği tüm düşmanları dondurur ve parçalar.'
    },
    cosmicSupernova: {
        id: 'cosmicSupernova', kind: 'evolution',
        name: 'Kozmik Süpernova', icon: '🌌', color: '#bf00ff',
        weaponReq: 'quantumDagger', trinketReq: 'magnet',
        req: ['quantumDagger', 'magnet'],
        formula: 'Kuantum Hançeri Lv.5 + Mıknatıs Çekirdeği Lv.5',
        desc: 'Kritik hançer vuruşları alansal bir Kara Delik (Black Hole) açar ve çevredeki tüm parazitleri içine çekip ezer.'
    },
    phantomExecutioner: {
        id: 'phantomExecutioner', kind: 'evolution',
        name: 'Hayalet İnfazcı', icon: '⚔️', color: '#ff006a',
        weaponReq: 'quantumDagger', trinketReq: 'targetMatrix',
        req: ['quantumDagger', 'targetMatrix'],
        formula: 'Kuantum Hançeri Lv.5 + Kuantum Nişangah Lv.5 (Çapraz Dal)',
        desc: 'Kuantum Hançerinin çapraz evrimi! Hedefler arasında sıçrayan bıçaklar yaralı düşmanları anında infaz eder.'
    },
    titanCore: {
        id: 'titanCore', kind: 'evolution',
        name: 'Titan Koronası', icon: '☀️', color: '#ff8800',
        weaponReq: 'flameLine', trinketReq: 'shieldMatrix',
        req: ['flameLine', 'shieldMatrix'],
        formula: 'Alev Hattı Lv.5 + Deflektör Matrisi Lv.5',
        desc: 'Alev koridoru devasa güneş halkasına dönüşür ve her 2.5 saniyede bir ekran çapında yakıcı Termal Nova yayar.'
    },
    necroticNapalm: {
        id: 'necroticNapalm', kind: 'evolution',
        name: 'Biyo-Napalm Seli', icon: '🧪', color: '#00ff88',
        weaponReq: 'flameLine', trinketReq: 'bioreactor',
        req: ['flameLine', 'bioreactor'],
        formula: 'Alev Hattı Lv.5 + Biyo-Reaktör Lv.5 (Çapraz Dal)',
        desc: 'Alev Hattının çapraz evrimi! Yanan düşmanlar eriyerek pilota can veren biyo-plazma alanı bırakır.'
    },
    quantumArbiter: {
        id: 'quantumArbiter', kind: 'evolution',
        name: 'Kuantum Yargıç', icon: '🔱', color: '#ffd700',
        weaponReq: 'swarmMissiles', trinketReq: 'targetMatrix',
        req: ['swarmMissiles', 'targetMatrix'],
        formula: 'Füze Sürüsü Lv.5 + Kuantum Nişangah Lv.5',
        desc: 'Füzeler düşmanları delip geçen kuantum mızraklarına dönüşür; her delmede +%25 güçlenir ve hedefleri yavaşlatır.'
    },
    // ── 5 KARAKTERE ÖZEL İMZA EVRİMİ (SIGNATURE EVOLUTIONS) ──
    tachyonLance: {
        id: 'tachyonLance', kind: 'evolution', shipExclusive: 'interceptor',
        name: 'Takyon Mızrağı', icon: '🔱', color: '#00f0ff',
        weaponReq: 'photonRailgun', altWeaponReq: 'dualLaser', trinketReq: 'overdriveCore',
        req: ['photonRailgun', 'overdriveCore'],
        formula: 'Foton Raylı Top (veya Çift Lazer) Lv.5 + Hiper-İvme Çekirdeği Lv.5',
        desc: '[AVCI ÖZEL EVRİMİ] Ekranı boydan boya delen sonsuz hızlı takyon ışını ve patlayan foton izi!'
    },
    siegeBehemoth: {
        id: 'siegeBehemoth', kind: 'evolution', shipExclusive: 'dreadnought',
        name: 'Kıyamet Bataryası', icon: '🌋', color: '#ffaa00',
        weaponReq: 'flakArtillery', altWeaponReq: 'heavyPlasma', trinketReq: 'reactiveArmor',
        req: ['flakArtillery', 'reactiveArmor'],
        formula: 'Balistik Flak Topu (veya Ağır Plazma) Lv.5 + Reaktif Zırh Plakası Lv.5',
        desc: '[KRUVAZÖR ÖZEL EVRİMİ] Zırh delici nükleer havan yaylımı ve 12 yöne parça tesirli şarapnel patlaması!'
    },
    sanctuaryMaelstrom: {
        id: 'sanctuaryMaelstrom', kind: 'evolution', shipExclusive: 'aegis',
        name: 'Kutsal İyon Fırtınası', icon: '🌀', color: '#bf00ff',
        weaponReq: 'teslaPrism', altWeaponReq: 'energyDisc', trinketReq: 'harmonicCapacitor',
        req: ['teslaPrism', 'harmonicCapacitor'],
        formula: 'Tesla Kalkan Prizması (veya Enerji Diski) Lv.5 + Harmonik Kondansatör Lv.5',
        desc: '[AEGIS ÖZEL EVRİMİ] Yörüngedeki diskler arasında yıldırım ağları örer ve düşman mermilerini kalkana dönüştürür!'
    },
    abyssalReaper: {
        id: 'abyssalReaper', kind: 'evolution', shipExclusive: 'phantom',
        name: 'Hiçlik Biçicisi', icon: '💀', color: '#ff006a',
        weaponReq: 'voidScythe', altWeaponReq: 'quantumDagger', trinketReq: 'phaseCloak',
        req: ['voidScythe', 'phaseCloak'],
        formula: 'Hiper-Uzay Tırpanı (veya Kuantum Hançeri) Lv.5 + Kuantum Gölge Pelerini Lv.5',
        desc: '[GÖLGE ÖZEL EVRİMİ] Gölge klonları fırlatan boyutsal tırpan; yaralı düşmanları anında biçer!'
    },
    heliosCataclysm: {
        id: 'heliosCataclysm', kind: 'evolution', shipExclusive: 'solarflare',
        name: 'Helios Güneş Kıyameti', icon: '🌞', color: '#ff6600',
        weaponReq: 'solarMortar', altWeaponReq: 'flameLine', trinketReq: 'fusionHeart',
        req: ['solarMortar', 'fusionHeart'],
        formula: 'Plazma Havanı (veya Alev Hattı) Lv.5 + Termonükleer Kalp Lv.5',
        desc: '[SOLAR FLARE ÖZEL EVRİMİ] Dev güneş kraterleri açar ve yanan her düşmanı zincirleme süpernova gibi patlatır!'
    }
};

// ── 6 Kozmik Süper / Mega Evrim (2 Evrimleşmiş Silah Birleşir ➔ 1 Süper Evrim + 1 Boş Silah Slotu!) ──
const SUPER_EVOLUTIONS = {
    infernoGatling: {
        id: 'infernoGatling', kind: 'superEvolution',
        name: 'Cehennem Gatling\'i', icon: '🔥', color: '#ff0055',
        evoReqs: ['bloodHarvest', 'gatlingStorm'],
        evoPool: ['bloodHarvest', 'gatlingStorm', 'heliosCataclysm', 'necroticNapalm'],
        req: ['bloodHarvest', 'gatlingStorm'],
        formula: 'Kan Hasadı + Gatling Fırtınası (SÜPER EVRİM)',
        desc: 'Seken kızıl cehennem mermileri yağdırır; her sekmede plazma patlaması yaratır ve pilotu sürekli iyileştirir! (+1 Silah Slotu Açar)'
    },
    eventHorizon: {
        id: 'eventHorizon', kind: 'superEvolution',
        name: 'Olay Ufku Tekilliği', icon: '🕳️', color: '#00f0ff',
        evoReqs: ['cosmicSupernova', 'aegisResonance'],
        evoPool: ['cosmicSupernova', 'aegisResonance', 'sanctuaryMaelstrom', 'cryoVortex'],
        req: ['cosmicSupernova', 'aegisResonance'],
        formula: 'Kozmik Süpernova + Aegis Rezonansı (SÜPER EVRİM)',
        desc: 'Yörüngede olay ufku testereleri dönerken her kritikte EMP şoklu çifte Kara Delik açar! (+1 Silah Slotu Açar)'
    },
    omegaJudgement: {
        id: 'omegaJudgement', kind: 'superEvolution',
        name: 'Omega Kıyamet Reaktörü', icon: '👑', color: '#ffd700',
        evoReqs: ['titanCore', 'quantumArbiter'],
        evoPool: ['titanCore', 'quantumArbiter', 'prismOverload'],
        req: ['titanCore', 'quantumArbiter'],
        formula: 'Titan Koronası + Kuantum Yargıç (SÜPER EVRİM)',
        desc: 'Sürekli güneş koronası yayarken tüm ekrana delici termonükleer kuantum mızrakları yağdırır! (+1 Silah Slotu Açar)'
    },
    hyperionApex: {
        id: 'hyperionApex', kind: 'superEvolution',
        name: 'Hyperion Işık Hükümdarı', icon: '🌟', color: '#00f0ff',
        evoReqs: ['tachyonLance', 'gatlingStorm'],
        evoPool: ['tachyonLance', 'gatlingStorm', 'prismOverload'],
        req: ['tachyonLance', 'gatlingStorm'],
        formula: 'Takyon Mızrağı + Gatling Fırtınası (AVCI MEGA EVRİMİ)',
        desc: 'Ekranı 8 yönde kesen yörüngesel takyon lazer ağı ve sınırsız sekme kapasiteli ışık fırtınası! (+1 Silah Slotu Açar)'
    },
    ironDreadnought: {
        id: 'ironDreadnought', kind: 'superEvolution',
        name: 'Zırhlı Kıyamet Kalesi', icon: '🏰', color: '#ffaa00',
        evoReqs: ['siegeBehemoth', 'titanCore'],
        evoPool: ['siegeBehemoth', 'titanCore', 'gravitonImploder'],
        req: ['siegeBehemoth', 'titanCore'],
        formula: 'Kıyamet Bataryası + Titan Koronası (KRUVAZÖR MEGA EVRİMİ)',
        desc: 'Reaktif kale zırhı ve 360° kesintisiz nükleer-graviton havan bombardımanı! (+1 Silah Slotu Açar)'
    },
    eclipseSingularity: {
        id: 'eclipseSingularity', kind: 'superEvolution',
        name: 'Tutulma Tanrısı', icon: '🌑', color: '#ff006a',
        evoReqs: ['abyssalReaper', 'cosmicSupernova'],
        evoPool: ['abyssalReaper', 'cosmicSupernova', 'phantomExecutioner'],
        req: ['abyssalReaper', 'cosmicSupernova'],
        formula: 'Hiçlik Biçicisi + Kozmik Süpernova (GÖLGE MEGA EVRİMİ)',
        desc: 'Karanlık madde klonları ve boyutsal kara delik tırpanlarıyla ekran çapında mutlak suikast yıkımı! (+1 Silah Slotu Açar)'
    }
};

const FUSIONS = Object.assign({}, EVOLUTIONS, SUPER_EVOLUTIONS);

// ── Kozmik Çürüme / Radyasyon (Dalga 25+ İyileşme/Kalkan Zayıflaması) ──
function getCosmicDecay() {
    if (wave < 25) return 1.0;
    return Math.max(0.15, Math.pow(0.96, wave - 24));
}

// ── Yardımcı Matematik Fonksiyonları ──
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function ang(a, b) { return Math.atan2(b.y - a.y, b.x - a.x); }
function rand(a, b) { return a + Math.random() * (b - a); }
function randInt(a, b) { return Math.floor(rand(a, b + 1)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

// ── Oyun Durumu ve Kritik Kilit Değişkenleri ──
let gameState = 'playing';
let isLevelingUp = false; // KRİTİK 3-TUŞ AÇIĞI KİLİDİ (Senkron Atomik Bayrak)
window.isLevelingUp = false;

let score = 0, wave = 1, comboC = 0, comboTm = 0, comboM = 1, gameTime = 0, totalKills = 0;
let shakeI = 0, screenFl = 0, screenFC = '#fff';
let bossActive = null, slowT = 0, slowF = 1;
let bossRewardActive = false, bossRewardTimer = 0;
let waveSp = 0, waveEC = 10, waveTm = 0, waveDl = 1.2;
let perfMode = false;

// DPS Telemetrisi
let dpsWindowDmg = 0;
let currentDps = 0;
let dpsTimer = 0;
let totalDamageDealt = 0;

const keys = {};
let levelUpQueue = [];
let levelUpActiveChoices = [];
let levelingPlayer = null;

// Harita Çevresel Dizileri
const bullets = [];
const eBullets = [];
const enemies = [];
const pickups = [];
const particles = [];
const floats = [];
const dangerZones = [];
const laserTrails = [];
const blackHoles = [];
const gravityRifts = [];
const mapDebris = [];      // Harita 1: Dönen hurda metaller
const gasClouds = [];      // Harita 2: Hızlandıran/yavaşlatan gaz bulutları
const lavaAsteroids = [];  // Harita 3: Patlayan lav asteroidleri

// ── Görsel Efekt & Partikül Sınıfı ──
class Particle {
    constructor(x, y, vx, vy, c, l, s, type = 'dot') {
        this.x = x; this.y = y; this.vx = vx; this.vy = vy;
        this.c = c; this.l = l; this.ml = l; this.s = s; this.type = type;
        this.a = rand(0, Math.PI * 2);
    }
    update(dt) {
        this.x += this.vx * dt; this.y += this.vy * dt;
        this.vx *= 0.96; this.vy *= 0.96;
        this.l -= dt;
        return this.l > 0;
    }
    draw(ctx) {
        const k = clamp(this.l / this.ml, 0, 1);
        ctx.save();
        ctx.globalAlpha = k;
        if (this.type === 'shockwave') {
            ctx.strokeStyle = this.c;
            ctx.lineWidth = 3 * k + 1;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.s * (1 - k * 0.85), 0, Math.PI * 2);
            ctx.stroke();
        } else if (this.type === 'spark') {
            ctx.strokeStyle = this.c;
            ctx.lineWidth = this.s * k;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x - this.vx * 0.035, this.y - this.vy * 0.035);
            ctx.stroke();
        } else {
            ctx.fillStyle = this.c;
            ctx.beginPath();
            ctx.arc(this.x, this.y, Math.max(0.5, this.s * k), 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

function spawnP(x, y, c, n = 6, sp = 120, l = 0.35, s = 2.5, type = 'dot') {
    const cnt = perfMode ? Math.max(1, Math.floor(n * 0.4)) : n;
    for (let i = 0; i < cnt; i++) {
        const a = rand(0, Math.PI * 2), v = rand(sp * 0.25, sp);
        particles.push(new Particle(x, y, Math.cos(a) * v, Math.sin(a) * v, c, rand(l * 0.6, l), s, type));
    }
}

function spawnExp(x, y, c, sc = 1) {
    spawnP(x, y, c, Math.floor(14 * sc), 220 * sc, 0.45, 3.2 * sc, 'spark');
    particles.push(new Particle(x, y, 0, 0, c, 0.32, 42 * sc, 'shockwave'));
}

function floatT(x, y, txt, c = '#fff', sz = 14) {
    if (floats.length > 35) floats.shift();
    floats.push({ x, y, txt, c, sz, vy: -42, l: 0.85, ml: 0.85 });
}

function shake(v) { shakeI = Math.max(shakeI, v); }

// ── Harita Çevre Kurulumu (3 Harita) ──
function initMapEnvironment() {
    mapDebris.length = 0;
    gasClouds.length = 0;
    lavaAsteroids.length = 0;

    if (SELECTED_MAP === 'sector9') {
        for (let i = 0; i < 6; i++) {
            mapDebris.push({
                x: rand(140, canvas.width - 140),
                y: rand(120, canvas.height - 120),
                r: rand(26, 40),
                a: rand(0, Math.PI * 2),
                va: rand(-0.8, 0.8) || 0.5,
                vx: rand(-18, 18),
                vy: rand(-18, 18),
                sides: randInt(5, 7)
            });
        }
    } else if (SELECTED_MAP === 'nebula') {
        for (let i = 0; i < 6; i++) {
            const isBoost = i % 2 === 0;
            gasClouds.push({
                x: rand(120, canvas.width - 120),
                y: rand(120, canvas.height - 120),
                r: rand(95, 135),
                vx: rand(-22, 22),
                vy: rand(-22, 22),
                type: isBoost ? 'boost' : 'slow',
                color: isBoost ? '#00f0ff' : '#bf00ff',
                label: isBoost ? '⚡ İYON AKIMI (+%35 HIZ)' : '🌫️ STASİS SİSİ (-%30 HIZ)'
            });
        }
    } else if (SELECTED_MAP === 'blackhole') {
        for (let i = 0; i < 5; i++) {
            spawnLavaAsteroid();
        }
    }
}

function spawnLavaAsteroid() {
    const side = randInt(0, 3);
    let x = rand(80, canvas.width - 80), y = rand(80, canvas.height - 80);
    if (side === 0) y = 40;
    else if (side === 1) y = canvas.height - 40;
    else if (side === 2) x = 40;
    else x = canvas.width - 40;
    lavaAsteroids.push({
        x, y,
        vx: rand(-45, 45),
        vy: rand(-45, 45),
        r: rand(22, 32),
        hp: 45 + wave * 8,
        a: rand(0, Math.PI * 2)
    });
}

// ── Pilot (Player) Sınıfı ──
class Player {
    constructor(id, x, y, shipId) {
        this.id = id;
        this.shipClass = SHIPS[shipId] ? shipId : 'interceptor';
        const cfg = SHIPS[this.shipClass];
        this.name = P1_NAME;
        this.c = cfg.color;
        this.r = 16;
        this.reset(x, y);
    }

    reset(x, y) {
        const cfg = SHIPS[this.shipClass];
        this.x = x; this.y = y;
        this.vx = 0; this.vy = 0;
        this.fac = -Math.PI / 2;
        this.alive = true;

        // 4 Silah + 4 Alet Envanteri
        this.weapons = {};        // weaponKey -> level (1..5)
        this.trinkets = {};       // trinketKey -> level (1..5)
        this.evolutions = {};     // evoKey -> true
        this.superEvolutions = {};// superKey -> true
        this.pU = {};             // Birleşik görünüm (Geriye dönük uyumluluk)
        this.fusions = {};        // Birleşik evrim görünümü
        this.slotOrder = [];

        // Başlangıç Silahı (Lv.1)
        this.weapons[cfg.starterWeapon] = 1;
        this.pU[cfg.starterWeapon] = 1;

        // Reroll (2) & Skip (1) Hakları
        this.rerollsLeft = 2;
        this.skipsLeft = 1;

        this.lv = 1;
        this.xp = 0;
        this.xpN = 80;

        this.invT = 2.0;
        this.dashT = 0;
        this.salvoT = 0;
        this.salvoTick = 0;
        this.salvoA = 0;
        this.abCd = 0;
        this.abMax = cfg.abilityCd;
        this.shieldHit = 0;
        this.shRegenDelay = 0;
        this.healBudget = 25;

        // Gemiye özel pasif zamanlayıcılar
        this.stealthCycleT = 10.0;
        this.stealthT = 0;
        this.aegisPulseT = 6.0;
        this.solarTickT = 0.25;
        this.titanPulseT = 2.5;
        this.empNovaCd = 0;
        this.blackHoleCd = 0;
        this.discAngle = 0;

        // Silah ateşleme sayaçları
        this.wTimers = {
            dualLaser: 0,
            heavyPlasma: 0,
            quantumDagger: 0,
            flameLine: 0,
            swarmMissiles: 0
        };

        this.recalcStats(true);
    }

    usedWeaponSlots() {
        return Object.keys(this.weapons).length +
               Object.keys(this.evolutions).length +
               Object.keys(this.superEvolutions).length;
    }

    usedTrinketSlots() {
        return Object.keys(this.trinkets).length;
    }

    usedSlots() {
        return this.usedWeaponSlots() + this.usedTrinketSlots();
    }

    syncLegacyMaps() {
        this.pU = Object.assign({}, this.weapons, this.trinkets);
        this.fusions = Object.assign({}, this.evolutions, this.superEvolutions);
        this.slotOrder = [];
        for (const sk of Object.keys(this.superEvolutions)) this.slotOrder.push({ type: 'super', key: sk });
        for (const ek of Object.keys(this.evolutions)) this.slotOrder.push({ type: 'fusion', key: ek });
        for (const wk of Object.keys(this.weapons)) this.slotOrder.push({ type: 'weapon', key: wk });
        for (const tk of Object.keys(this.trinkets)) this.slotOrder.push({ type: 'trinket', key: tk });
    }

    recalcStats(fullHeal = false) {
        const cfg = SHIPS[this.shipClass];
        const bioLv = this.trinkets.bioreactor || 0;
        const shLv = this.trinkets.shieldMatrix || 0;
        const thrLv = this.trinkets.thruster || 0;
        const coolLv = this.trinkets.coolant || 0;
        const magLv = this.trinkets.magnet || 0;
        const tgtLv = this.trinkets.targetMatrix || 0;

        const oldMh = this.mh || cfg.hp;
        const oldMs = this.ms || cfg.sh;

        this.mh = cfg.hp + bioLv * 32 + (this.fusions.titanCore || this.superEvolutions.omegaJudgement ? 130 : 0);
        this.ms = cfg.sh + shLv * 35 + (this.fusions.aegisResonance || this.superEvolutions.eventHorizon ? 85 : 0);

        if (fullHeal) {
            this.hp = this.mh;
            this.sh = this.ms;
        } else {
            if (this.mh > oldMh) this.hp = Math.min(this.mh, (this.hp || oldMh) + (this.mh - oldMh));
            if (this.ms > oldMs) this.sh = Math.min(this.ms, (this.sh || oldMs) + (this.ms - oldMs));
        }

        this.sp = cfg.sp * (1 + thrLv * 0.12) * (this.fusions.aegisResonance || this.superEvolutions.eventHorizon ? 1.22 : 1);
        this.armor = Math.min(0.65, cfg.armor + thrLv * 0.06 + (this.fusions.titanCore || this.superEvolutions.omegaJudgement ? 0.20 : 0));
        this.cdMult = Math.max(0.32, Math.pow(0.86, coolLv));
        this.dmgMult = (1 + tgtLv * 0.16) * (this.fusions.bloodHarvest || this.superEvolutions.infernoGatling ? 1.35 : 1);
        this.crit = Math.min(0.85, cfg.crit + tgtLv * 0.09 + (this.fusions.cosmicSupernova || this.superEvolutions.eventHorizon ? 0.18 : 0));
        this.magR = 115 * (1 + magLv * 0.35) * (this.fusions.cosmicSupernova ? 1.25 : 1);
        this.rangeMult = 1 + magLv * 0.15;
        this.bioRegen = bioLv * 2.5;
        this.abMax = cfg.abilityCd * this.cdMult;
        this.bd = 18 * this.dmgMult;
        this.sr = 0.22 * this.cdMult;

        this.syncLegacyMaps();
    }

    getReadyEvolutions() {
        const list = [];
        for (const ek of Object.keys(EVOLUTIONS)) {
            const ev = EVOLUTIONS[ek];
            if (ev.shipExclusive && ev.shipExclusive !== this.shipClass) continue;
            if (this.evolutions[ek]) continue;
            const usedInSuper = Object.keys(this.superEvolutions).some(sk => {
                const pool = SUPER_EVOLUTIONS[sk].evoPool || SUPER_EVOLUTIONS[sk].evoReqs;
                return pool.includes(ek);
            });
            if (usedInSuper) continue;

            const wLv1 = this.weapons[ev.weaponReq] || 0;
            const wLv2 = ev.altWeaponReq ? (this.weapons[ev.altWeaponReq] || 0) : 0;
            const tLv = this.trinkets[ev.trinketReq] || 0;
            if ((wLv1 >= MAX_PERK_LEVEL || wLv2 >= MAX_PERK_LEVEL) && tLv >= MAX_PERK_LEVEL) {
                list.push(ev);
            }
        }
        return list;
    }

    getReadySuperEvolutions() {
        const list = [];
        for (const sk of Object.keys(SUPER_EVOLUTIONS)) {
            if (this.superEvolutions[sk]) continue;
            const sev = SUPER_EVOLUTIONS[sk];
            const pool = sev.evoPool || sev.evoReqs;
            const ownedFromPool = pool.filter(ek => !!this.evolutions[ek]);
            if (ownedFromPool.length >= 2) {
                list.push(sev);
            }
        }
        return list;
    }

    // Geriye dönük uyumluluk: getReadyFusions hem Standart hem Süper Evrimleri döndürür
    getReadyFusions() {
        return [...this.getReadySuperEvolutions(), ...this.getReadyEvolutions()];
    }

    addUpg(k, lvAdd = 1) {
        // Eski perk anahtarlarını yeni v7.0 silah/alet anahtarlarına eşle (Test & Geriye Dönük Uyumluluk)
        const legacyMap = {
            atkUp: 'heavyPlasma',
            vampUp: 'bioreactor',
            fireUp: 'dualLaser',
            multiUp: 'coolant',
            shieldUp: 'energyDisc',
            spdUp: 'thruster',
            critUp: 'quantumDagger',
            rangeUp: 'magnet',
            hpUp: 'flameLine'
        };
        const key = UPG[k] ? k : (legacyMap[k] || k);
        const item = UPG[key];
        if (!item) return false;

        if (item.kind === 'weapon') {
            if (this.evolutions[item.evoId] || (item.altEvoId && this.evolutions[item.altEvoId])) return false;
            const cur = this.weapons[key] || 0;
            if (cur >= MAX_PERK_LEVEL) return false;
            if (cur === 0 && this.usedWeaponSlots() >= MAX_WEAPON_SLOTS) return false;
            this.weapons[key] = Math.min(MAX_PERK_LEVEL, cur + lvAdd);
        } else {
            const cur = this.trinkets[key] || 0;
            if (cur >= MAX_PERK_LEVEL) return false;
            if (cur === 0 && this.usedTrinketSlots() >= MAX_TRINKET_SLOTS) return false;
            this.trinkets[key] = Math.min(MAX_PERK_LEVEL, cur + lvAdd);
        }
        this.recalcStats(false);
        return true;
    }

    applyFusion(fKey) {
        if (SUPER_EVOLUTIONS[fKey]) {
            const sev = SUPER_EVOLUTIONS[fKey];
            const pool = sev.evoPool || sev.evoReqs;
            let removed = 0;
            for (const ek of pool) {
                if (this.evolutions[ek] && removed < 2) {
                    delete this.evolutions[ek];
                    removed++;
                }
            }
            this.superEvolutions[fKey] = true;
            this.recalcStats(false);
            floatT(this.x, this.y - 45, `👑 MEGA EVRİM: ${sev.name.toUpperCase()}!`, sev.color, 20);
            spawnExp(this.x, this.y, sev.color, 2.5);
            sfx.bKill();
            return true;
        }
        const ev = EVOLUTIONS[fKey];
        if (!ev) return false;
        if (this.weapons[ev.weaponReq]) {
            delete this.weapons[ev.weaponReq];
        } else if (ev.altWeaponReq && this.weapons[ev.altWeaponReq]) {
            delete this.weapons[ev.altWeaponReq];
        }
        // Alet (Trinket) korunur, silah Evrimleşmiş Silaha dönüşür
        this.evolutions[fKey] = true;
        this.recalcStats(false);
        floatT(this.x, this.y - 42, `⚡ EVRİM: ${ev.name.toUpperCase()}!`, ev.color, 18);
        spawnExp(this.x, this.y, ev.color, 1.9);
        sfx.pow();
        return true;
    }

    healLeech(amount) {
        if (!this.alive || amount <= 0 || this.healBudget <= 0) return;
        const actual = Math.min(amount * getCosmicDecay(), this.healBudget);
        if (actual <= 0) return;
        this.healBudget -= actual;
        this.hp = Math.min(this.mh, this.hp + actual);
    }

    gainXP(v) {
        if (!this.alive) return;
        this.xp += v;
        while (this.xp >= this.xpN) {
            this.xp -= this.xpN;
            this.lv++;
            this.xpN = Math.floor(this.xpN * 1.24 + 25);
            levelUpQueue.push({ player: this, lv: this.lv });
        }
    }

    takeDmg(d, truePct = 0) {
        if (!this.alive || this.invT > 0 || this.dashT > 0) return;
        const decay = getCosmicDecay();
        let dmg = d * DC.edm * (1 - this.armor);
        const pctDmg = (truePct + (wave >= 25 ? (wave - 24) * 0.004 : 0)) * this.mh;
        dmg += pctDmg;

        this.shRegenDelay = 1.8 / Math.max(0.35, decay);
        if (this.sh > 0) {
            this.shieldHit = 0.35;
            if (this.sh >= dmg) {
                this.sh -= dmg;
                sfx.dmg();
                return;
            } else {
                dmg -= this.sh;
                this.sh = 0;
                if ((this.evolutions.aegisResonance || this.superEvolutions.eventHorizon) && this.empNovaCd <= 0) {
                    this.empNovaCd = 5.5;
                    eBullets.length = 0;
                    particles.push(new Particle(this.x, this.y, 0, 0, '#00f0ff', 0.65, 320, 'shockwave'));
                    floatT(this.x, this.y - 45, '💠 AEGIS EMP PATLAMASI!', '#00f0ff', 16);
                    sfx.emp();
                    for (const e of enemies) {
                        if (e.alive) e.takeDmg(95 + wave * 6, false, true);
                    }
                }
            }
        }
        this.hp -= dmg;
        shake(5);
        sfx.dmg();
        spawnP(this.x, this.y, this.c, 7, 130, 0.35, 2.5);
        if (this.hp <= 0) {
            this.hp = 0;
            this.alive = false;
            spawnExp(this.x, this.y, this.c, 2.5);
        }
    }

    activate() {
        if (!this.alive || this.abCd > 0 || gameState !== 'playing') return;
        const cfg = SHIPS[this.shipClass];
        this.abCd = this.abMax;
        floatT(this.x, this.y - 36, `${cfg.abilityName}!`, cfg.abilityColor, 16);

        if (this.shipClass === 'interceptor') {
            this.dashT = 1.2;
            this.invT = 1.3;
            spawnExp(this.x, this.y, '#00f0ff', 1.1);
            sfx.dash();
        } else if (this.shipClass === 'dreadnought') {
            this.salvoT = 3.0;
            this.salvoTick = 0;
            sfx.salvo();
        } else if (this.shipClass === 'aegis') {
            const n = eBullets.length;
            eBullets.length = 0;
            this.sh = Math.min(this.ms, this.sh + 20 + n * 2.5);
            particles.push(new Particle(this.x, this.y, 0, 0, '#bf00ff', 0.6, 280, 'shockwave'));
            sfx.emp();
            shake(8);
        } else if (this.shipClass === 'phantom') {
            // Gölge Sıçraması (Shadow Blink) + 1.8sn Görünmezlik
            const jumpDist = 185;
            this.x = clamp(this.x + Math.cos(this.fac) * jumpDist, 45, canvas.width - 45);
            this.y = clamp(this.y + Math.sin(this.fac) * jumpDist, 45, canvas.height - 45);
            this.stealthT = 1.8;
            this.invT = 1.8;
            spawnExp(this.x, this.y, '#ff006a', 1.4);
            for (const e of enemies) {
                if (e.alive && dist(this, e) < 150) e.takeDmg(75 * this.dmgMult, true, true);
            }
            sfx.dash();
        } else if (this.shipClass === 'solarflare') {
            // Güneş Patlaması (Solar Nova)
            particles.push(new Particle(this.x, this.y, 0, 0, '#ff6600', 0.7, 300, 'shockwave'));
            for (const e of enemies) {
                if (e.alive && dist(this, e) < 280) {
                    e.takeDmg(90 * this.dmgMult, true, true);
                    e.burnT = 4.0;
                }
            }
            sfx.exp();
            shake(10);
        }
    }

    update(dt) {
        if (!this.alive) return;
        const decay = getCosmicDecay();
        if (this.invT > 0) this.invT -= dt;
        if (this.shRegenDelay > 0) this.shRegenDelay -= dt;
        if (this.abCd > 0) this.abCd -= dt;
        if (this.shieldHit > 0) this.shieldHit -= dt;
        if (this.empNovaCd > 0) this.empNovaCd -= dt;
        if (this.blackHoleCd > 0) this.blackHoleCd -= dt;

        this.healBudget = Math.min(this.mh * 0.20 * decay, this.healBudget + this.mh * 0.20 * decay * dt);

        // Biyo-Reaktör pasif can yenilemesi
        if (this.bioRegen > 0 && this.hp < this.mh) {
            this.hp = Math.min(this.mh, this.hp + this.bioRegen * decay * dt);
        }

        // Gemi Pasifleri:
        // 1. Gölge (Void Phantom): Her 10 sn'de 1.5 sn Görünmezlik
        if (this.shipClass === 'phantom') {
            if (this.stealthT > 0) {
                this.stealthT -= dt;
            } else {
                this.stealthCycleT -= dt;
                if (this.stealthCycleT <= 0) {
                    this.stealthCycleT = 10.0;
                    this.stealthT = 1.5;
                    this.invT = Math.max(this.invT, 1.5);
                    floatT(this.x, this.y - 32, '👻 GÖLGE GÖRÜNMEZLİĞİ (1.5s)', '#ff006a', 13);
                }
            }
        }

        // 2. Aegis: Otomatik Kalkan Patlaması
        if (this.shipClass === 'aegis') {
            this.aegisPulseT -= dt;
            if (this.aegisPulseT <= 0) {
                this.aegisPulseT = 6.0;
                particles.push(new Particle(this.x, this.y, 0, 0, '#bf00ff', 0.45, 165, 'shockwave'));
                for (const e of enemies) {
                    if (e.alive && dist(this, e) < 165) e.takeDmg(38 * this.dmgMult, false, true);
                }
            }
        }

        // 3. Solar Flare: Sürekli Yanan Radyasyon Aurası
        if (this.shipClass === 'solarflare') {
            this.solarTickT -= dt;
            if (this.solarTickT <= 0) {
                this.solarTickT = 0.25;
                for (const e of enemies) {
                    if (e.alive && dist(this, e) < 145) {
                        e.takeDmg(9.5 * this.dmgMult, false, true);
                    }
                }
            }
        }

        // Hareket Girdisi (1P: WASD veya Yön Tuşları + Mobil Joystick)
        let mx = 0, my = 0;
        if (keys.KeyW || keys.ArrowUp) my -= 1;
        if (keys.KeyS || keys.ArrowDown) my += 1;
        if (keys.KeyA || keys.ArrowLeft) mx -= 1;
        if (keys.KeyD || keys.ArrowRight) mx += 1;
        if (window.__joyX || window.__joyY) {
            mx += window.__joyX || 0;
            my += window.__joyY || 0;
        }

        // Harita 2 Gaz Bulutu Hız Çarpanı
        let envSpeedMult = 1.0;
        if (SELECTED_MAP === 'nebula') {
            for (const gc of gasClouds) {
                if (dist(this, gc) < gc.r) {
                    envSpeedMult = gc.type === 'boost' ? 1.38 : 0.68;
                    break;
                }
            }
        }

        const len = Math.hypot(mx, my);
        const effSp = this.sp * envSpeedMult * (this.dashT > 0 ? 1.85 : 1.0);
        if (len > 0) {
            mx /= len; my /= len;
            this.vx = lerp(this.vx, mx * effSp, 0.22);
            this.vy = lerp(this.vy, my * effSp, 0.22);
            this.fac = Math.atan2(this.vy, this.vx);
        } else {
            this.vx *= 0.86;
            this.vy *= 0.86;
        }

        // Harita 3 Kara Delik Çekim Anomalisi
        if (SELECTED_MAP === 'blackhole') {
            const cx = canvas.width / 2, cy = canvas.height / 2;
            const dCenter = Math.hypot(cx - this.x, cy - this.y);
            if (dCenter > 30 && dCenter < 460) {
                const pull = (1 - dCenter / 460) * 95 * dt;
                const pa = Math.atan2(cy - this.y, cx - this.x);
                this.x += Math.cos(pa) * pull;
                this.y += Math.sin(pa) * pull;
            }
        }

        this.x = clamp(this.x + this.vx * dt, 36, canvas.width - 36);
        this.y = clamp(this.y + this.vy * dt, 36, canvas.height - 36);

        // Aktif Yetenek Süreleri
        if (this.dashT > 0) {
            this.dashT -= dt;
            laserTrails.push({ x: this.x, y: this.y, l: 0.75, c: this.c });
        }
        if (this.salvoT > 0) {
            this.salvoT -= dt;
            this.salvoTick -= dt;
            if (this.salvoTick <= 0) {
                this.salvoTick = 0.14;
                this.salvoA += 0.25;
                for (let i = 0; i < 8; i++) {
                    const a = this.salvoA + (i * Math.PI * 2 / 8);
                    bullets.push({
                        x: this.x, y: this.y,
                        vx: Math.cos(a) * 420, vy: Math.sin(a) * 420,
                        damage: 14 * this.dmgMult, size: 3.5, color: '#ffaa00',
                        life: 1.1, piercing: false, bounces: 0, crit: false
                    });
                }
                sfx.salvo();
            }
        }

        // Kalkan Yenilenmesi
        if (this.sh < this.ms && this.shRegenDelay <= 0) {
            let sRate = DC.sr * decay * (1 + (this.trinkets.shieldMatrix || 0) * 0.22);
            if (this.shipClass === 'aegis') sRate *= 1.45;
            if ((this.evolutions.aegisResonance || this.superEvolutions.eventHorizon) && Math.hypot(this.vx, this.vy) > 40) {
                sRate += 14 * decay;
            }
            this.sh = Math.min(this.ms, this.sh + sRate * dt);
        }

        // Tüm Aktif Silahları, Evrimleri ve Süper Evrimleri Ateşle
        this.updateWeapons(dt);

        // Manyetik XP & Sandık Çekimi
        for (const pu of pickups) {
            const d = dist(this, pu);
            const pullR = pu.type === 'cosmicChest' ? this.magR * 0.65 : this.magR;
            if (d < pullR && d > 1) {
                const a = ang(pu, this);
                pu.x += Math.cos(a) * 280 * dt;
                pu.y += Math.sin(a) * 280 * dt;
            }
        }
    }

    findNearestEnemy(maxDist = 850) {
        let best = null, bestD = maxDist;
        for (const e of enemies) {
            if (!e.alive || e.x < 0 || e.x > canvas.width || e.y < 0 || e.y > canvas.height) continue;
            const d = dist(this, e);
            if (d < bestD) { bestD = d; best = e; }
        }
        return best;
    }

    rollCrit(baseDmg, target = null) {
        let cr = Math.random() < this.crit;
        let mult = cr ? 2.4 : 1.0;
        // Gölge (Void Phantom) görünmezlik veya arkadan vuruş bonusu
        if (this.shipClass === 'phantom' && (this.stealthT > 0 || (target && Math.cos(this.fac - (target.aA || 0)) > 0.2))) {
            cr = true;
            mult = 2.85;
        }
        return { dmg: baseDmg * mult, crit: cr };
    }

    updateWeapons(dt) {
        const nearest = this.findNearestEnemy(900);
        const aimA = nearest ? ang(this, nearest) : this.fac;

        // 1. Çift Lazer / Gatling Fırtınası / Cehennem Gatling'i
        const laserLv = this.weapons.dualLaser || 0;
        const hasGatling = !!this.evolutions.gatlingStorm;
        const hasInferno = !!this.superEvolutions.infernoGatling;
        if (laserLv > 0 || hasGatling || hasInferno) {
            this.wTimers.dualLaser -= dt;
            const cd = (hasInferno ? 0.08 : hasGatling ? 0.10 : Math.max(0.12, 0.25 - laserLv * 0.02)) * this.cdMult;
            if (this.wTimers.dualLaser <= 0) {
                this.wTimers.dualLaser = cd;
                const count = hasInferno ? 4 : hasGatling ? 3 : 1 + Math.floor(laserLv / 2);
                const baseD = (hasInferno ? 34 : hasGatling ? 24 : 14 + laserLv * 4.5) * this.dmgMult;
                for (let i = 0; i < count; i++) {
                    const spread = (i - (count - 1) / 2) * 0.12;
                    const a = aimA + spread;
                    const { dmg, crit } = this.rollCrit(baseD, nearest);
                    bullets.push({
                        x: this.x + Math.cos(a) * 18, y: this.y + Math.sin(a) * 18,
                        vx: Math.cos(a) * 560, vy: Math.sin(a) * 560,
                        damage: dmg, size: hasInferno ? 5 : 3.8,
                        color: hasInferno ? '#ff0055' : hasGatling ? '#00ff88' : '#00f0ff',
                        life: 1.25 * this.rangeMult,
                        bounces: (hasInferno || hasGatling) ? 3 : 0,
                        splash: hasInferno, leech: hasInferno, crit
                    });
                }
                sfx.shoot();
            }
        }

        // 2. Ağır Plazma Topu / Kan Hasadı
        const plasmaLv = this.weapons.heavyPlasma || 0;
        const hasBlood = !!this.evolutions.bloodHarvest;
        if (plasmaLv > 0 || hasBlood) {
            this.wTimers.heavyPlasma -= dt;
            const cd = (hasBlood ? 0.42 : Math.max(0.48, 0.85 - plasmaLv * 0.07)) * this.cdMult;
            if (this.wTimers.heavyPlasma <= 0) {
                this.wTimers.heavyPlasma = cd;
                const baseD = (hasBlood ? 52 : 26 + plasmaLv * 8) * this.dmgMult;
                const shots = (hasBlood || plasmaLv >= 4) ? 2 : 1;
                for (let s = 0; s < shots; s++) {
                    const a = aimA + (s - (shots - 1) / 2) * 0.16;
                    const { dmg, crit } = this.rollCrit(baseD, nearest);
                    bullets.push({
                        x: this.x + Math.cos(a) * 20, y: this.y + Math.sin(a) * 20,
                        vx: Math.cos(a) * 390, vy: Math.sin(a) * 390,
                        damage: dmg, size: hasBlood ? 7.5 : 6,
                        color: hasBlood ? '#ff1744' : '#ff5500',
                        life: 1.5 * this.rangeMult,
                        splash: true, leech: hasBlood, bounces: 0, crit
                    });
                }
            }
        }

        // 3. Dönen Enerji Diski / Aegis Rezonansı / Olay Ufku Tekilliği
        const discLv = this.weapons.energyDisc || 0;
        const hasAegisEvo = !!this.evolutions.aegisResonance;
        const hasHorizon = !!this.superEvolutions.eventHorizon;
        if (discLv > 0 || hasAegisEvo || hasHorizon) {
            this.discAngle += dt * (hasHorizon ? 5.2 : hasAegisEvo ? 4.4 : 3.2);
            const discCount = hasHorizon ? 6 : hasAegisEvo ? 5 : 1 + Math.floor(discLv * 0.8);
            const orbitR = (hasHorizon ? 108 : hasAegisEvo ? 96 : 75) * this.rangeMult;
            const dps = (hasHorizon ? 140 : hasAegisEvo ? 95 : 35 + discLv * 14) * this.dmgMult;

            for (let i = 0; i < discCount; i++) {
                const a = this.discAngle + (i * Math.PI * 2 / discCount);
                const dx = this.x + Math.cos(a) * orbitR;
                const dy = this.y + Math.sin(a) * orbitR;
                for (const e of enemies) {
                    if (e.alive && Math.hypot(e.x - dx, e.y - dy) < e.r + 16) {
                        e.takeDmg(dps * dt, hasHorizon, true);
                        if (hasHorizon && this.blackHoleCd <= 0 && blackHoles.length < 3) {
                            this.blackHoleCd = 1.2;
                            blackHoles.push({ x: e.x, y: e.y, r: 165, life: 2.1, maxLife: 2.1, dps: 75 * this.dmgMult, a: 0, dmgT: 0 });
                        }
                    }
                }
            }
        }

        // 4. Kuantum Hançeri / Kozmik Süpernova
        const daggerLv = this.weapons.quantumDagger || 0;
        const hasSupernova = !!this.evolutions.cosmicSupernova;
        if (daggerLv > 0 || hasSupernova || hasHorizon) {
            this.wTimers.quantumDagger -= dt;
            const cd = (hasHorizon ? 0.30 : hasSupernova ? 0.36 : Math.max(0.42, 0.72 - daggerLv * 0.06)) * this.cdMult;
            if (this.wTimers.quantumDagger <= 0) {
                this.wTimers.quantumDagger = cd;
                const count = (hasHorizon || hasSupernova) ? 3 : 1 + Math.floor(daggerLv / 2);
                const baseD = (hasHorizon ? 46 : hasSupernova ? 36 : 20 + daggerLv * 6.5) * this.dmgMult;
                for (let i = 0; i < count; i++) {
                    const a = aimA + (i - (count - 1) / 2) * 0.14;
                    const { dmg, crit } = this.rollCrit(baseD, nearest);
                    bullets.push({
                        x: this.x, y: this.y,
                        vx: Math.cos(a) * 620, vy: Math.sin(a) * 620,
                        damage: dmg, size: 4.5,
                        color: hasSupernova || hasHorizon ? '#bf00ff' : '#ff006a',
                        life: 1.3 * this.rangeMult,
                        piercing: true, pierceLeft: 3,
                        spawnBlackHole: hasSupernova || hasHorizon,
                        crit: crit || hasSupernova || hasHorizon
                    });
                }
            }
        }

        // 5. Alev Hattı / Titan Koronası / Omega Kıyamet Reaktörü
        const flameLv = this.weapons.flameLine || 0;
        const hasTitan = !!this.evolutions.titanCore;
        const hasOmega = !!this.superEvolutions.omegaJudgement;
        if (flameLv > 0 || hasTitan || hasOmega) {
            this.wTimers.flameLine -= dt;
            if (this.wTimers.flameLine <= 0) {
                this.wTimers.flameLine = 0.14;
                const fx = this.x + Math.cos(this.fac) * 42;
                const fy = this.y + Math.sin(this.fac) * 42;
                laserTrails.push({ x: fx, y: fy, l: 0.9, c: hasOmega ? '#ffd700' : '#ff6600' });
                laserTrails.push({ x: this.x - Math.cos(this.fac) * 24, y: this.y - Math.sin(this.fac) * 24, l: 0.75, c: '#ff4400' });
            }
            if (hasTitan || hasOmega) {
                this.titanPulseT -= dt;
                if (this.titanPulseT <= 0) {
                    this.titanPulseT = hasOmega ? 1.8 : 2.5;
                    const pulseR = hasOmega ? 280 : 210;
                    particles.push(new Particle(this.x, this.y, 0, 0, '#ff8800', 0.5, pulseR, 'shockwave'));
                    for (const e of enemies) {
                        if (e.alive && dist(this, e) < pulseR) {
                            e.takeDmg((this.mh * 0.25 + 45) * this.dmgMult, true, true);
                        }
                    }
                }
            }
        }

        // 6. Güdümlü Füze Sürüsü / Kuantum Yargıç
        const missileLv = this.weapons.swarmMissiles || 0;
        const hasArbiter = !!this.evolutions.quantumArbiter;
        if (missileLv > 0 || hasArbiter || hasOmega) {
            this.wTimers.swarmMissiles -= dt;
            const cd = (hasOmega ? 0.38 : hasArbiter ? 0.45 : Math.max(0.55, 0.95 - missileLv * 0.08)) * this.cdMult;
            if (this.wTimers.swarmMissiles <= 0) {
                this.wTimers.swarmMissiles = cd;
                const count = hasOmega ? 5 : hasArbiter ? 4 : 1 + Math.floor(missileLv * 0.7);
                const baseD = (hasOmega ? 48 : hasArbiter ? 36 : 18 + missileLv * 5.5) * this.dmgMult;
                for (let i = 0; i < count; i++) {
                    const a = aimA + (i - (count - 1) / 2) * 0.22;
                    const { dmg, crit } = this.rollCrit(baseD, nearest);
                    bullets.push({
                        x: this.x, y: this.y,
                        vx: Math.cos(a) * 480, vy: Math.sin(a) * 480,
                        damage: dmg, size: 5,
                        color: hasOmega || hasArbiter ? '#ffd700' : '#00ff88',
                        life: 1.6 * this.rangeMult,
                        homing: true,
                        piercing: hasArbiter || hasOmega,
                        pierceLeft: (hasArbiter || hasOmega) ? 4 : 1,
                        arbiterBoost: hasArbiter || hasOmega,
                        crit
                    });
                }
            }
        }

        // 7. Karaktere Özel Kök Silahları, Çapraz Evrimler ve Yeni Mega Evrimler
        this.sigTimer = (this.sigTimer || 0) - dt;
        if (this.sigTimer <= 0) {
            this.sigTimer = 0.34 * this.cdMult;
            const sigW = this.weapons.photonRailgun || this.weapons.flakArtillery || this.weapons.teslaPrism || this.weapons.voidScythe || this.weapons.solarMortar || 0;
            const hasSigEvo = this.evolutions.tachyonLance || this.evolutions.siegeBehemoth || this.evolutions.sanctuaryMaelstrom || this.evolutions.abyssalReaper || this.evolutions.heliosCataclysm ||
                              this.evolutions.prismOverload || this.evolutions.gravitonImploder || this.evolutions.cryoVortex || this.evolutions.phantomExecutioner || this.evolutions.necroticNapalm;
            const hasNewMega = this.superEvolutions.hyperionApex || this.superEvolutions.ironDreadnought || this.superEvolutions.eclipseSingularity;
            if (sigW > 0 || hasSigEvo || hasNewMega) {
                const shots = hasNewMega ? 6 : hasSigEvo ? 4 : 1 + Math.floor(sigW / 2);
                const baseD = (hasNewMega ? 65 : hasSigEvo ? 44 : 24 + sigW * 7) * this.dmgMult;
                for (let i = 0; i < shots; i++) {
                    const a = aimA + (i - (shots - 1) / 2) * 0.18;
                    const { dmg, crit } = this.rollCrit(baseD, nearest);
                    bullets.push({
                        x: this.x + Math.cos(a) * 18, y: this.y + Math.sin(a) * 18,
                        vx: Math.cos(a) * 620, vy: Math.sin(a) * 620,
                        damage: dmg, size: hasNewMega ? 6.5 : 5,
                        color: this.c,
                        life: 1.45 * this.rangeMult,
                        piercing: true, pierceLeft: hasNewMega ? 5 : 3,
                        bounces: hasSigEvo || hasNewMega ? 2 : 0,
                        splash: !!this.weapons.flakArtillery || !!this.weapons.solarMortar || !!this.evolutions.siegeBehemoth || !!this.evolutions.heliosCataclysm,
                        crit: crit || !!hasNewMega
                    });
                }
            }
        }
    }

    draw(ctx) {
        if (!this.alive) return;

        // Solar Flare Radyasyon Aurası Çizimi
        if (this.shipClass === 'solarflare') {
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 102, 0, 0.35)';
            ctx.fillStyle = 'rgba(255, 102, 0, 0.06)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 145, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }

        // Dönen Enerji Disklerini Çiz
        const discLv = this.weapons.energyDisc || 0;
        const hasAegisEvo = !!this.evolutions.aegisResonance;
        const hasHorizon = !!this.superEvolutions.eventHorizon;
        if (discLv > 0 || hasAegisEvo || hasHorizon) {
            const discCount = hasHorizon ? 6 : hasAegisEvo ? 5 : 1 + Math.floor(discLv * 0.8);
            const orbitR = (hasHorizon ? 108 : hasAegisEvo ? 96 : 75) * this.rangeMult;
            for (let i = 0; i < discCount; i++) {
                const a = this.discAngle + (i * Math.PI * 2 / discCount);
                const dx = this.x + Math.cos(a) * orbitR;
                const dy = this.y + Math.sin(a) * orbitR;
                ctx.save();
                ctx.translate(dx, dy);
                ctx.rotate(this.discAngle * 3);
                ctx.strokeStyle = hasHorizon ? '#00f0ff' : '#bf00ff';
                ctx.fillStyle = 'rgba(191, 0, 255, 0.35)';
                ctx.lineWidth = 2.2;
                ctx.beginPath();
                ctx.arc(0, 0, 12, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            }
        }

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.fac);
        if (this.stealthT > 0) ctx.globalAlpha = 0.38;
        else if (this.invT > 0 && Math.floor(this.invT * 12) % 2 === 0) ctx.globalAlpha = 0.55;

        const r = this.r;
        ctx.strokeStyle = this.c;
        ctx.fillStyle = this.c + '33';
        ctx.lineWidth = 2.4;
        ctx.shadowColor = this.c;
        ctx.shadowBlur = perfMode ? 0 : 12;

        ctx.beginPath();
        if (this.shipClass === 'interceptor') {
            ctx.moveTo(r * 1.35, 0);
            ctx.lineTo(-r * 0.8, -r * 0.95);
            ctx.lineTo(-r * 0.35, 0);
            ctx.lineTo(-r * 0.8, r * 0.95);
        } else if (this.shipClass === 'dreadnought') {
            ctx.moveTo(r * 1.15, -r * 0.45);
            ctx.lineTo(r * 1.15, r * 0.45);
            ctx.lineTo(-r * 0.9, r * 0.95);
            ctx.lineTo(-r * 0.65, 0);
            ctx.lineTo(-r * 0.9, -r * 0.95);
        } else if (this.shipClass === 'aegis') {
            for (let i = 0; i < 6; i++) {
                const a = (i / 6) * Math.PI * 2;
                ctx[i === 0 ? 'moveTo' : 'lineTo'](Math.cos(a) * r, Math.sin(a) * r);
            }
        } else if (this.shipClass === 'phantom') {
            ctx.moveTo(r * 1.45, 0);
            ctx.lineTo(-r * 0.6, -r * 1.05);
            ctx.lineTo(-r * 0.15, 0);
            ctx.lineTo(-r * 0.6, r * 1.05);
        } else {
            // Solar Flare
            for (let i = 0; i < 8; i++) {
                const a = (i / 8) * Math.PI * 2;
                const rad = i % 2 === 0 ? r * 1.3 : r * 0.68;
                ctx[i === 0 ? 'moveTo' : 'lineTo'](Math.cos(a) * rad, Math.sin(a) * rad);
            }
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// ── Düşman (Enemy) Sınıfı ──
const ENEMY_CFG = {
    drone:    { hp: 22,  spd: 105, r: 12, dmg: 10, sc: 15, color: '#ff3366' },
    tank:     { hp: 90,  spd: 58,  r: 20, dmg: 22, sc: 40, color: '#ff8800' },
    speeder:  { hp: 16,  spd: 185, r: 10, dmg: 8,  sc: 20, color: '#ffff00' },
    shooter:  { hp: 36,  spd: 78,  r: 14, dmg: 12, sc: 30, color: '#cc44ff' },
    orbiter:  { hp: 30,  spd: 135, r: 13, dmg: 12, sc: 28, color: '#00ff88' },
    splitter: { hp: 48,  spd: 75,  r: 17, dmg: 14, sc: 35, color: '#ff6600' },
    shielder: { hp: 42,  spd: 72,  r: 15, dmg: 14, sc: 38, color: '#4488ff' },
    sniper:   { hp: 28,  spd: 65,  r: 13, dmg: 18, sc: 42, color: '#ff0044' },
    kamikaze: { hp: 26,  spd: 165, r: 13, dmg: 28, sc: 36, color: '#ff4400' },
    phantom:  { hp: 38,  spd: 115, r: 14, dmg: 15, sc: 45, color: '#aa66ff' },
    sweeper:  { hp: 70,  spd: 62,  r: 18, dmg: 18, sc: 55, color: '#00ffcc' },
    healer:   { hp: 62,  spd: 68,  r: 16, dmg: 14, sc: 60, color: '#ff1744' }
};

class Enemy {
    constructor(type, x, y, isMiniBoss = false) {
        const cfg = ENEMY_CFG[type] || ENEMY_CFG.drone;
        this.type = type;
        this.x = x; this.y = y;
        this.vx = 0; this.vy = 0;
        this.isBoss = false;
        this.isMiniBoss = isMiniBoss;
        this.eid = Math.random();

        const wScale = 1 + (wave - 1) * 0.16;
        this.hp = cfg.hp * wScale * DC.ehm * (isMiniBoss ? 6.5 : 1);
        this.maxHp = this.hp;
        this.spd = cfg.spd * DC.esm * (isMiniBoss ? 0.88 : 1);
        this.r = cfg.r * (isMiniBoss ? 1.85 : 1);
        this.damage = cfg.dmg * (isMiniBoss ? 1.5 : 1);
        this.sc = cfg.sc * (isMiniBoss ? 5 : 1);
        this.color = isMiniBoss ? '#ffd700' : cfg.color;
        this.shHp = type === 'shielder' ? 35 * wScale : 0;

        this.alive = true;
        this.aA = rand(0, Math.PI * 2);
        this.fl = 0;
        this.sT = rand(1.0, 2.4);
        this.slowT = 0;
        this.burnT = 0;
        this.laserAngle = rand(0, Math.PI * 2);
        this.isElite = isMiniBoss || (!this.isBoss && wave >= 10 && Math.random() < 0.14);
        this.truePctDmg = this.isElite ? 0.05 : 0;
    }

    takeDmg(d, cr = false, ignoreArmor = false, hitAngle = null) {
        if (!this.alive) return false;
        if (this.shHp > 0) {
            this.shHp -= d;
            if (this.shHp > 0) return true;
            d = -this.shHp;
            this.shHp = 0;
        }
        this.hp -= d;
        this.fl = 0.08;
        dpsWindowDmg += d;
        totalDamageDealt += d;
        if (cr) floatT(this.x + rand(-8, 8), this.y - this.r - 6, `CRIT! ${Math.floor(d)}`, '#ffd700', 12);
        if (this.hp <= 0) this.die();
        return true;
    }

    die() {
        if (!this.alive) return;
        this.alive = false;
        spawnExp(this.x, this.y, this.color, this.isMiniBoss ? 2.2 : 1.0);
        sfx.exp();

        const mapMult = (MAPS[SELECTED_MAP] || MAPS.sector9).scoreMult;
        const pts = Math.floor(this.sc * comboM * DC.sm * mapMult);
        score += pts;
        totalKills++;
        comboC++;
        comboTm = 3.2;
        comboM = Math.min(5.0, 1 + Math.floor(comboC / 5) * 0.25);

        if (p1 && p1.alive) {
            p1.gainXP(this.sc * 0.9);
            if (p1.trinkets.bioreactor) p1.healLeech(p1.trinkets.bioreactor * 1.5);
        }

        // Elit Mini-Boss %50 ihtimalle altın Kozmik Şans Sandığı düşürür!
        if (this.isMiniBoss) {
            floatT(this.x, this.y - 25, '★ ELİT MİNİ-BOSS İMHA EDİLDİ! ★', '#ffd700', 16);
            if (Math.random() < 0.50) {
                spawnCosmicChest(this.x, this.y);
            }
        } else if (Math.random() < 0.12 * DC.pdm) {
            const pTypes = ['heal', 'shield', 'xpGem'];
            pickups.push({ x: this.x, y: this.y, r: 10, type: pTypes[randInt(0, pTypes.length - 1)], life: 12, aA: 0 });
        }
    }

    update(dt) {
        if (!this.alive) return false;
        this.aA += dt * 2.2;
        if (this.fl > 0) this.fl -= dt;
        if (this.burnT > 0) {
            this.burnT -= dt;
            this.takeDmg(18 * dt, false, true);
        }

        if (!p1 || !p1.alive) return true;
        // Gölge görünmezken parazitler rastgele yöne sapar
        const a = p1.stealthT > 0 ? this.aA : ang(this, p1);
        const sm = this.slowT > 0 ? 0.6 : 1.0;
        if (this.slowT > 0) this.slowT -= dt;

        this.vx = lerp(this.vx, Math.cos(a) * this.spd * sm, 0.08);
        this.vy = lerp(this.vy, Math.sin(a) * this.spd * sm, 0.08);
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        if ((this.type === 'shooter' || this.type === 'sniper' || this.isMiniBoss) && p1.stealthT <= 0) {
            this.sT -= dt;
            if (this.sT <= 0) {
                this.sT = this.isMiniBoss ? 1.2 : 2.1;
                const sp = this.type === 'sniper' ? 340 : 210;
                eBullets.push({
                    x: this.x, y: this.y,
                    vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
                    damage: this.damage * 0.7, size: this.isMiniBoss ? 6 : 4.5,
                    color: this.color, life: 3.5, truePct: this.truePctDmg
                });
            }
        }

        if (dist(this, p1) < this.r + p1.r) {
            p1.takeDmg(this.damage, this.truePctDmg);
            if (!this.isMiniBoss && !this.isBoss && this.type !== 'tank') {
                this.hp = 0;
                this.die();
                return false;
            }
        }
        return true;
    }

    draw(ctx) {
        if (!this.alive) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        if (this.isMiniBoss || this.isElite) {
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = this.isMiniBoss ? 2.5 : 1.4;
            ctx.setLineDash([5, 4]);
            ctx.beginPath();
            ctx.arc(0, 0, this.r + 7, this.aA, this.aA + Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        ctx.fillStyle = this.fl > 0 ? '#ffffff' : this.color + '44';
        ctx.strokeStyle = this.fl > 0 ? '#ffffff' : this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, this.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
}

// ── Boss Sınıfı (Chronos Weaver Dalga 20 & Oblivion Behemoth Dalga 30 Dahil) ──
const BOSS_NAMES = ['VOID WALKER', 'NEBULA LORD', 'STAR EATER', 'CHRONOS WEAVER', 'COSMIC DREAD', 'OBLIVION BEHEMOTH'];
class Boss extends Enemy {
    constructor(bw, x, y, bossType = null) {
        super('drone', x, y, false);
        this.isBoss = true;
        this.type = 'boss';
        this.bw = bw;
        this.r = 44 + bw * 2;
        this.hp = (1450 + bw * 520) * DC.bhm;
        this.maxHp = this.hp;
        this.spd = 42 + bw * 2.5;
        this.damage = (24 + bw * 5) * DC.edm;
        this.sc = 350 + bw * 60;
        this.pT = 0;
        this.enraged = false;
        this.armorAngle = Math.PI / 2;
        this.deflectTextCd = 0;
        this.riftTimer = 2.4;
        this.mortarTimer = 3.0;

        this.bossType = bossType || ['chaser', 'bullethell', 'gravity'][bw % 3];
        this.bossName = BOSS_NAMES[Math.min(bw - 1, BOSS_NAMES.length - 1)] || 'COSMIC BOSS';
        if (this.bossType === 'chronos') {
            this.bossName = 'CHRONOS WEAVER ◈ ZAMAN DOKUYUCU';
            this.color = '#00ffcc';
        } else if (this.bossType === 'behemoth') {
            this.bossName = 'OBLIVION BEHEMOTH ◈ ZIRHLI YIKICI';
            this.color = '#ff5500';
            this.r += 10;
            this.hp *= 1.3;
            this.maxHp = this.hp;
        } else {
            this.color = '#ff006a';
        }
    }

    takeDmg(d, cr = false, ignoreArmor = false, hitAngle = null) {
        if (!this.alive) return false;
        if (this.bossType === 'behemoth' && !ignoreArmor && hitAngle !== null) {
            let ad = hitAngle - this.armorAngle;
            while (ad > Math.PI) ad -= Math.PI * 2;
            while (ad < -Math.PI) ad += Math.PI * 2;
            if (Math.abs(ad) < 1.75) {
                if (this.deflectTextCd <= 0) {
                    this.deflectTextCd = 0.4;
                    floatT(this.x, this.y - this.r - 10, '🛡️ ZIRH ENGELLEDİ!', '#ffaa00', 13);
                }
                return false;
            } else {
                d *= 1.75;
                cr = true;
            }
        }
        return super.takeDmg(d, cr, ignoreArmor, hitAngle);
    }

    update(dt) {
        if (!this.alive) return false;
        this.pT += dt;
        if (this.deflectTextCd > 0) this.deflectTextCd -= dt;
        if (this.y < 85) { this.y += 95 * dt; return true; }
        if (!p1 || !p1.alive) return true;

        const a = ang(this, p1);
        if (this.bossType === 'chronos') {
            this.riftTimer -= dt;
            if (this.riftTimer <= 0) {
                this.riftTimer = 3.2;
                if (gravityRifts.length < 3) {
                    gravityRifts.push({ x: p1.x + rand(-80, 80), y: p1.y + rand(-80, 80), r: 145, life: 4.0, maxLife: 4.0, a: 0, dmgTick: 0 });
                }
            }
        } else if (this.bossType === 'behemoth') {
            const turnRate = 1.15 * dt;
            let diff = a - this.armorAngle;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            this.armorAngle += clamp(diff, -turnRate, turnRate);
        }

        this.vx = lerp(this.vx, Math.cos(a) * this.spd, 0.04);
        this.vy = lerp(this.vy, Math.sin(a) * this.spd, 0.04);
        this.x = clamp(this.x + this.vx * dt, this.r, canvas.width - this.r);
        this.y = clamp(this.y + this.vy * dt, this.r, canvas.height - this.r);

        this.sT -= dt * DC.bsr;
        if (this.sT <= 0) {
            this.sT = 1.25;
            for (let i = 0; i < 8; i++) {
                const sa = this.pT + (i * Math.PI * 2 / 8);
                eBullets.push({ x: this.x, y: this.y, vx: Math.cos(sa) * 210, vy: Math.sin(sa) * 210, damage: 12 * DC.edm, size: 5.5, color: this.color, life: 3.8, truePct: 0.04 });
            }
        }
        return true;
    }

    die() {
        super.die();
        document.getElementById('bossBar').classList.remove('active');
        bossActive = null;
        spawnCosmicChest(this.x, this.y);
    }

    draw(ctx) {
        super.draw(ctx);
        if (this.bossType === 'behemoth') {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.armorAngle);
            ctx.strokeStyle = '#ffaa00';
            ctx.lineWidth = 7;
            ctx.beginPath();
            ctx.arc(0, 0, this.r + 10, -1.72, 1.72);
            ctx.stroke();
            ctx.fillStyle = '#00f0ff';
            ctx.beginPath();
            ctx.arc(-this.r * 0.85, 0, 9, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
}

// ── Kozmik Şans Sandığı (Loot Box) Mekanikleri ──
function spawnCosmicChest(x, y) {
    pickups.push({
        x: clamp(x, 60, canvas.width - 60),
        y: clamp(y, 60, canvas.height - 60),
        r: 18,
        type: 'cosmicChest',
        life: 25,
        aA: 0
    });
    floatT(x, y - 35, '🎁 KOZMİK ŞANS SANDIĞI DÜŞTÜ!', '#ffd700', 16);
}

function openCosmicChest(player) {
    if (!player || !player.alive) return;
    gameState = 'lootBox';
    setCursorMode(true);
    setSoundMuffled(true);
    sfx.chest();

    let rewardTitle = '';
    let rewardDesc = '';
    let rewardChip = '';

    // 1. Önce hazır Süper Evrim veya Standart Evrim varsa anında ücretsiz sentezle!
    const readyF = player.getReadyFusions();
    if (readyF.length > 0) {
        const f = readyF[0];
        player.applyFusion(f.id);
        rewardTitle = `🌌 EFSANEVİ EVRİM SENTEZLENDİ!`;
        rewardDesc = `Kozmik Sandık reaktörünüzdeki Lv.5 bileşenleri birleştirerek doğrudan ${f.name} evrimini açtı!`;
        rewardChip = `${f.icon} ${f.name.toUpperCase()} [${f.formula}]`;
    } else {
        // 2. Mevcut silah veya aletlerden Lv.5 olmayan birini anında yükselt (veya boş slota yeni silah/alet ver)
        const upgradableWeapons = Object.keys(player.weapons).filter(k => player.weapons[k] < MAX_PERK_LEVEL);
        const upgradableTrinkets = Object.keys(player.trinkets).filter(k => player.trinkets[k] < MAX_PERK_LEVEL);
        const pool = [...upgradableWeapons, ...upgradableTrinkets];

        if (pool.length > 0) {
            const pick = pool[randInt(0, pool.length - 1)];
            player.addUpg(pick, 1);
            const item = UPG[pick];
            const newLv = player.pU[pick];
            rewardTitle = `⚡ ANINDA REAKTÖR YÜKSELTMESİ!`;
            rewardDesc = item.desc;
            rewardChip = `${item.icon} ${item.name} ➔ SEVİYE ${newLv}/${MAX_PERK_LEVEL}`;
        } else {
            score += 1200;
            player.hp = player.mh;
            player.sh = player.ms;
            rewardTitle = `👑 ALTIN REAKTÖR AŞIRI YÜKLEMESİ!`;
            rewardDesc = `Tüm aktif sistemleriniz maksimumda! +1,200 Skor ve %100 Gövde/Kalkan Onarımı kazandınız.`;
            rewardChip = `✦ +1,200 BONUS SKOR & TAM ONARIM`;
        }
    }

    player.hp = Math.min(player.mh, player.hp + player.mh * 0.35);
    player.sh = player.ms;
    updateUpgDisplay();

    document.getElementById('lootBoxTitle').textContent = rewardTitle;
    document.getElementById('lootBoxDesc').textContent = rewardDesc;
    document.getElementById('lootBoxRewardChip').textContent = rewardChip;
    document.getElementById('lootBoxOv').classList.add('show');
}

function closeCosmicChest() {
    const ov = document.getElementById('lootBoxOv');
    if (!ov.classList.contains('show')) return;
    ov.classList.remove('show');
    setCursorMode(false);
    setSoundMuffled(false);
    gameState = 'playing';
    document.body.classList.add('playing-mode');
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. KRİTİK HİLE & AÇIK ONARIMI (RACE CONDITION FIX) + REROLL & SKIP SİSTEMİ
// ═══════════════════════════════════════════════════════════════════════════
function buildLevelUpChoices(player, lv) {
    const choices = [];

    // 1. Hazır Süper Evrim veya Standart Evrim varsa ilk sıraya koy
    const readyFusions = player.getReadyFusions();
    for (const f of readyFusions) {
        if (choices.length < 3) {
            choices.push({
                kind: 'fusion',
                key: f.id,
                fusion: f,
                rarity: f.kind === 'superEvolution' ? 'super' : 'legendary',
                lvAdd: 1
            });
        }
    }

    // 2. Silah (4 Slot) ve Alet (4 Slot) Havuzu
    const wFull = player.usedWeaponSlots() >= MAX_WEAPON_SLOTS;
    const tFull = player.usedTrinketSlots() >= MAX_TRINKET_SLOTS;

    const candidateKeys = UPG_KEYS.filter(k => {
        const item = UPG[k];
        if (item.shipExclusive && item.shipExclusive !== player.shipClass) return false;
        const cur = player.pU[k] || 0;
        if (cur >= MAX_PERK_LEVEL) return false;
        if (item.kind === 'weapon') {
            if (player.evolutions[item.evoId] || (item.altEvoId && player.evolutions[item.altEvoId])) return false;
            if (wFull && cur <= 0) return false;
        } else {
            if (tFull && cur <= 0) return false;
        }
        return true;
    });

    // Karakter Özel Kök Yeteneklerine (Signature Nodes) hafif öncelik ağırlığı ver
    const shuffled = candidateKeys.slice().sort((a, b) => {
        const aSig = UPG[a].shipExclusive === player.shipClass ? 0.35 : 0;
        const bSig = UPG[b].shipExclusive === player.shipClass ? 0.35 : 0;
        return (Math.random() - 0.5) - (aSig - bSig);
    });

    for (const k of shuffled) {
        if (choices.length >= 3) break;
        const cur = player.pU[k] || 0;
        const item = UPG[k];
        const isSig = item.shipExclusive === player.shipClass;
        const isPairOwned = item.kind === 'weapon'
            ? ((player.trinkets[item.pairTrinket] || 0) > 0 || (item.altTrinket && (player.trinkets[item.altTrinket] || 0) > 0))
            : ((player.weapons[item.pairWeapon] || 0) > 0 || !!player.evolutions[item.evoId]);

        choices.push({
            kind: 'perk',
            key: k,
            rarity: isSig ? 'legendary' : ((cur >= 4 || isPairOwned) ? 'epic' : 'common'),
            curLv: cur,
            nextLv: Math.min(MAX_PERK_LEVEL, cur + 1),
            lvAdd: 1
        });
    }

    while (choices.length < 3) {
        choices.push({
            kind: 'overclock',
            key: 'overclock_' + choices.length,
            rarity: 'epic',
            lvAdd: 1
        });
    }
    return choices;
}

function renderLevelUpCards(player, lv) {
    const container = document.getElementById('luCardsContainer');
    container.innerHTML = '';
    levelUpActiveChoices = [];

    const generated = buildLevelUpChoices(player, lv);
    const keyConfigs = [
        { key: 'KeyA', altKey: 'ArrowLeft', label: 'A' },
        { key: 'KeyW', altKey: 'ArrowUp',   label: 'W' },
        { key: 'KeyD', altKey: 'ArrowRight',label: 'D' }
    ];

    generated.forEach((cItem, index) => {
        const cfg = keyConfigs[index];
        let rarityBadge = '';
        let iconHtml = '';
        let titleHtml = '';
        let descHtml = '';

        if (cItem.kind === 'fusion') {
            const f = cItem.fusion;
            const isSuper = f.kind === 'superEvolution';
            rarityBadge = isSuper ? '👑 KOZMİK SÜPER EVRİM (+1 SLOT AÇAR)' : '⚡ STANDART EVRİM SENTEZİ';
            iconHtml = `<div class="lu-card-icon" style="color:${f.color}">${f.icon}</div>`;
            titleHtml = f.name.toUpperCase();
            descHtml = `<div style="color:#ffd700;font-weight:700;font-size:0.74rem;margin-bottom:4px;">[${f.formula}]</div>${f.desc}`;
        } else if (cItem.kind === 'perk') {
            const u = UPG[cItem.key];
            const isSig = u.shipExclusive === player.shipClass;
            const slotTypeLbl = isSig
                ? (u.kind === 'weapon' ? '★ ÖZEL KÖK SİLAH' : '★ ÖZEL KÖK ALET')
                : (u.kind === 'weapon' ? '⚔ SİLAH SLOTU' : '🧲 ALET SLOTU');
            rarityBadge = cItem.curLv === 0
                ? `YENİ ${slotTypeLbl}`
                : `${slotTypeLbl} · LV.${cItem.curLv} ➔ LV.${cItem.nextLv}${cItem.nextLv >= 5 ? ' (MAKS ★)' : ''}`;
            iconHtml = `<div class="lu-card-icon" style="color:${u.color}">${u.icon}</div>`;
            titleHtml = u.name;
            const evo = EVOLUTIONS[u.evoId];
            const partnerName = u.kind === 'weapon'
                ? (TRINKETS[u.pairTrinket] ? TRINKETS[u.pairTrinket].name : '')
                : (WEAPONS[u.pairWeapon] ? WEAPONS[u.pairWeapon].name : '');
            let branchText = `<span style="font-size:0.70rem;color:#00f0ff">🔗 Dal 1: +${partnerName} Lv.5 ➔ ${evo ? evo.name : ''}</span>`;
            if (u.kind === 'weapon' && u.altTrinket && u.altEvoId && TRINKETS[u.altTrinket] && EVOLUTIONS[u.altEvoId]) {
                branchText += `<br><span style="font-size:0.70rem;color:#ffd700">🌿 Dal 2: +${TRINKETS[u.altTrinket].name} Lv.5 ➔ ${EVOLUTIONS[u.altEvoId].name}</span>`;
            }
            descHtml = `${u.desc}<br>${branchText}`;
        } else {
            rarityBadge = 'REAKTÖR OVERCLOCK';
            iconHtml = `<div class="lu-card-icon" style="color:#ffd700">✦</div>`;
            titleHtml = 'KOZMİK OVERCLOCK';
            descHtml = 'Tüm slotlar dolu! Gövde ve kalkanı +%40 onarır ve +600 bonus skor verir.';
        }

        const card = document.createElement('div');
        card.className = `lu-card ${cItem.rarity}`;
        card.innerHTML = `
            <div class="lu-card-rarity-badge">${rarityBadge}</div>
            ${iconHtml}
            <div class="lu-card-name">${titleHtml}</div>
            <div class="lu-card-desc">${descHtml}</div>
            <div class="lu-key-hint-box">
                <div class="lu-keycap-row">
                    <div class="lu-keycap">${cfg.label}</div>
                    <div>
                        <div class="lu-key-subtext">BASILI TUT VEYA TIKLA</div>
                        <div class="lu-hold-timer-text">0.0s / 1.4s</div>
                    </div>
                </div>
                <div class="lu-hold-track"><div class="lu-hold-fill"></div></div>
            </div>
        `;

        const choiceItem = {
            index,
            choice: cItem,
            cfg,
            cardEl: card,
            fillEl: card.querySelector('.lu-hold-fill'),
            timerTextEl: card.querySelector('.lu-hold-timer-text'),
            holdTimer: 0,
            requiredHold: 1.4,
            completed: false
        };

        levelUpActiveChoices.push(choiceItem);
        card.addEventListener('click', (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            selectUpgradeCard(choiceItem);
        });
        container.appendChild(card);
    });

    // Reroll & Skip butonlarını güncelle
    const rerollBtn = document.getElementById('luRerollBtn');
    const skipBtn = document.getElementById('luSkipBtn');
    const rerollCnt = document.getElementById('luRerollCount');
    const skipCnt = document.getElementById('luSkipCount');
    if (rerollCnt) rerollCnt.textContent = player.rerollsLeft;
    if (skipCnt) skipCnt.textContent = player.skipsLeft;
    if (rerollBtn) rerollBtn.disabled = player.rerollsLeft <= 0;
    if (skipBtn) skipBtn.disabled = player.skipsLeft <= 0;
}

function triggerLevelUpChoice(info) {
    gameState = 'levelChoice';
    levelingPlayer = info.player;
    // SENKRON KİLİT AÇILIŞI
    isLevelingUp = true;
    window.isLevelingUp = true;

    setCursorMode(true);
    setSoundMuffled(true);
    sfx.lvl();
    document.body.classList.remove('playing-mode');
    for (const k in keys) delete keys[k];

    const overlay = document.getElementById('levelUpOv');
    overlay.classList.remove('hidden', 'locked');
    overlay.style.pointerEvents = 'auto';

    const subt = document.getElementById('luPlayerSubtitle');
    if (subt) {
        subt.textContent = `◈ ${levelingPlayer.name.toUpperCase()} · SEVİYE ${info.lv} (SİLAH ${levelingPlayer.usedWeaponSlots()}/4 · ALET ${levelingPlayer.usedTrinketSlots()}/4) ◈`;
    }

    renderLevelUpCards(levelingPlayer, info.lv);
}

// ── KRİTİK 3-TUŞ AÇIĞI ONARIMI: Senkron & Atomik Tekil Kart Seçimi ──
function selectUpgradeCard(choiceItem) {
    // Eğer isLevelingUp zaten kilitlendiyse (aynı karede 2. veya 3. tuş/tıklama geldiyse) ANINDA REDDET!
    if (!isLevelingUp || gameState !== 'levelChoice' || !choiceItem || choiceItem.completed) {
        return false;
    }

    // 1. SENKRON VE ANLIK KİLİTLEME (Aynı tick içinde diğer tüm kartları ve modalı kilitler)
    isLevelingUp = false;
    window.isLevelingUp = false;
    choiceItem.completed = true;
    for (let i = 0; i < levelUpActiveChoices.length; i++) {
        levelUpActiveChoices[i].completed = true;
        levelUpActiveChoices[i].holdTimer = 0;
    }
    for (const k in keys) delete keys[k];

    const overlay = document.getElementById('levelUpOv');
    if (overlay) {
        overlay.style.pointerEvents = 'none';
        overlay.classList.add('locked', 'hidden');
    }

    // 2. Yükseltmeyi yalnızca 1 kez uygula ve oyuna dön
    applyCardUpgrade(levelingPlayer, choiceItem.choice);
    levelUpActiveChoices = [];
    setCursorMode(false);
    setSoundMuffled(false);
    gameState = 'playing';
    updateUpgDisplay();
    document.body.classList.add('playing-mode');
    return true;
}

function rerollLevelUpChoices() {
    if (!isLevelingUp || gameState !== 'levelChoice' || !levelingPlayer || levelingPlayer.rerollsLeft <= 0) return false;
    levelingPlayer.rerollsLeft--;
    for (const k in keys) delete keys[k];
    sfx.pow();
    renderLevelUpCards(levelingPlayer, levelingPlayer.lv);
    return true;
}

function skipLevelUpChoice() {
    if (!isLevelingUp || gameState !== 'levelChoice' || !levelingPlayer || levelingPlayer.skipsLeft <= 0) return false;
    // Senkron kilit
    isLevelingUp = false;
    window.isLevelingUp = false;
    levelingPlayer.skipsLeft--;
    for (const c of levelUpActiveChoices) c.completed = true;
    for (const k in keys) delete keys[k];

    const overlay = document.getElementById('levelUpOv');
    if (overlay) {
        overlay.style.pointerEvents = 'none';
        overlay.classList.add('locked', 'hidden');
    }

    // Küçük XP Telafisi (%35 XP) + Onarım
    levelingPlayer.xp += Math.floor(levelingPlayer.xpN * 0.35);
    levelingPlayer.hp = Math.min(levelingPlayer.mh, levelingPlayer.hp + levelingPlayer.mh * 0.25);
    levelingPlayer.sh = Math.min(levelingPlayer.ms, levelingPlayer.sh + levelingPlayer.ms * 0.35);
    floatT(levelingPlayer.x, levelingPlayer.y - 35, '⏭️ PAS GEÇİLDİ (+%35 XP & ONARIM)', '#ffd700', 15);
    sfx.pow();

    levelUpActiveChoices = [];
    setCursorMode(false);
    setSoundMuffled(false);
    gameState = 'playing';
    updateUpgDisplay();
    document.body.classList.add('playing-mode');
    return true;
}

function updateLevelChoice(dt) {
    if (gameState !== 'levelChoice' || !isLevelingUp || levelUpActiveChoices.length === 0) return;

    // Kaç seçim tuşuna aynı anda basıldığını say (Çoklu tuş basımını girdi katmanında da engelle!)
    let heldIndices = [];
    for (let i = 0; i < levelUpActiveChoices.length; i++) {
        const item = levelUpActiveChoices[i];
        if (item.completed) continue;
        if (keys[item.cfg.key] || keys[item.cfg.altKey]) {
            heldIndices.push(i);
        }
    }

    // Eğer oyuncu aynı anda birden fazla seçim tuşuna (örn. A+W+D) basıyorsa hiçbir sayacı ilerletme!
    const allowHold = heldIndices.length === 1;

    for (let i = 0; i < levelUpActiveChoices.length; i++) {
        const item = levelUpActiveChoices[i];
        if (item.completed) continue;
        const isSingleHeld = allowHold && heldIndices[0] === i;

        if (isSingleHeld) {
            item.holdTimer = Math.min(item.requiredHold, item.holdTimer + dt);
            const progress = item.holdTimer / item.requiredHold;
            if (item.fillEl) item.fillEl.style.width = (progress * 100).toFixed(1) + '%';
            if (item.timerTextEl) item.timerTextEl.textContent = `${item.holdTimer.toFixed(1)}s / ${item.requiredHold.toFixed(1)}s`;
            if (item.holdTimer >= item.requiredHold) {
                selectUpgradeCard(item);
                return; // İlk seçim yapıldığı anda döngüden derhal çık!
            }
        } else if (item.holdTimer > 0) {
            item.holdTimer = Math.max(0, item.holdTimer - dt * 3.5);
            const progress = item.holdTimer / item.requiredHold;
            if (item.fillEl) item.fillEl.style.width = (progress * 100).toFixed(1) + '%';
            if (item.timerTextEl) item.timerTextEl.textContent = `${item.holdTimer.toFixed(1)}s / ${item.requiredHold.toFixed(1)}s`;
        }
    }
}

function applyCardUpgrade(player, cItem) {
    if (!player || !cItem) return;
    const decay = getCosmicDecay();
    if (cItem.kind === 'fusion') {
        player.applyFusion(cItem.key);
    } else if (cItem.kind === 'perk') {
        player.addUpg(cItem.key, cItem.lvAdd || 1);
    } else {
        score += 600;
    }
    player.hp = Math.min(player.mh, player.hp + player.mh * 0.18 * decay);
    player.sh = Math.min(player.ms, player.sh + player.ms * 0.20 * decay);
    sfx.pow();
}

// ── Minimalist HUD ve Gelişmiş Duraklatma (ESC) Terminali Güncellemesi ──
function updateUpgDisplay() {
    if (!p1) return;
    p1.syncLegacyMaps();

    const wHud = document.getElementById('p1WeaponsHud');
    const tHud = document.getElementById('p1TrinketsHud');

    if (wHud) {
        wHud.innerHTML = '';
        const weaponItems = [];
        for (const sk of Object.keys(p1.superEvolutions)) weaponItems.push({ kind: 'super', data: SUPER_EVOLUTIONS[sk], lv: '★' });
        for (const ek of Object.keys(p1.evolutions)) weaponItems.push({ kind: 'evo', data: EVOLUTIONS[ek], lv: '★' });
        for (const [wk, lv] of Object.entries(p1.weapons)) weaponItems.push({ kind: 'weapon', data: WEAPONS[wk], lv });

        for (let i = 0; i < MAX_WEAPON_SLOTS; i++) {
            const it = weaponItems[i];
            const el = document.createElement('div');
            if (!it || !it.data) {
                el.className = 'hud-ui empty-slot';
                el.textContent = '·';
            } else {
                el.className = 'hud-ui' + (it.kind === 'super' ? ' super-evolved' : it.kind === 'evo' ? ' evolved' : '');
                el.style.color = it.data.color;
                el.style.borderColor = it.data.color + '80';
                el.title = `${it.data.name} (${it.lv})`;
                el.innerHTML = `${it.data.icon}<span class="uc">${it.lv}</span>`;
            }
            wHud.appendChild(el);
        }
    }

    if (tHud) {
        tHud.innerHTML = '';
        const trinketItems = Object.entries(p1.trinkets);
        for (let i = 0; i < MAX_TRINKET_SLOTS; i++) {
            const entry = trinketItems[i];
            const el = document.createElement('div');
            if (!entry) {
                el.className = 'hud-ui empty-slot';
                el.textContent = '·';
            } else {
                const d = TRINKETS[entry[0]];
                el.className = 'hud-ui';
                el.style.color = d.color;
                el.style.borderColor = d.color + '80';
                el.title = `${d.name} Lv.${entry[1]}/5`;
                el.innerHTML = `${d.icon}<span class="uc">${entry[1]}</span>`;
            }
            tHud.appendChild(el);
        }
    }
}

function updatePauseStatsUI() {
    const grid = document.getElementById('pauseStatsGrid');
    if (!grid || !p1) return;
    const shipCfg = SHIPS[p1.shipClass] || SHIPS.interceptor;
    const avgDps = gameTime > 1 ? Math.floor(totalDamageDealt / gameTime) : 0;

    // 4 Silah Kartı
    const weaponCards = [];
    for (const sk of Object.keys(p1.superEvolutions)) {
        const d = SUPER_EVOLUTIONS[sk];
        weaponCards.push(`<div class="pause-slot-card" style="border-color:${d.color}"><span class="psc-ico">${d.icon}</span><span class="psc-nm">${d.name}</span><span class="psc-lv">👑 SÜPER</span></div>`);
    }
    for (const ek of Object.keys(p1.evolutions)) {
        const d = EVOLUTIONS[ek];
        weaponCards.push(`<div class="pause-slot-card" style="border-color:${d.color}"><span class="psc-ico">${d.icon}</span><span class="psc-nm">${d.name}</span><span class="psc-lv">⚡ EVRİM</span></div>`);
    }
    for (const [wk, lv] of Object.entries(p1.weapons)) {
        const d = WEAPONS[wk];
        weaponCards.push(`<div class="pause-slot-card" style="border-color:${d.color}60"><span class="psc-ico">${d.icon}</span><span class="psc-nm">${d.name}</span><span class="psc-lv">Lv.${lv}/5</span></div>`);
    }
    while (weaponCards.length < 4) {
        weaponCards.push(`<div class="pause-slot-card empty"><span class="psc-ico">◇</span><span class="psc-nm">Boş Silah</span><span class="psc-lv">-</span></div>`);
    }

    // 4 Alet Kartı
    const trinketCards = [];
    for (const [tk, lv] of Object.entries(p1.trinkets)) {
        const d = TRINKETS[tk];
        trinketCards.push(`<div class="pause-slot-card" style="border-color:${d.color}60"><span class="psc-ico">${d.icon}</span><span class="psc-nm">${d.name}</span><span class="psc-lv">Lv.${lv}/5</span></div>`);
    }
    while (trinketCards.length < 4) {
        trinketCards.push(`<div class="pause-slot-card empty"><span class="psc-ico">◇</span><span class="psc-nm">Boş Alet</span><span class="psc-lv">-</span></div>`);
    }

    // Olası Çapraz Evrim & Mega Evrim İhtimalleri Matrisi
    const matrixRows = [];
    for (const [ek, ev] of Object.entries(EVOLUTIONS)) {
        if (ev.shipExclusive && ev.shipExclusive !== p1.shipClass) continue;
        if (p1.evolutions[ek]) {
            matrixRows.push(`<div class="stat-line"><span class="lbl" style="color:${ev.color}">${ev.icon} ${ev.name}</span><span class="val" style="color:#00ff88">✓ AKTİF EVRİM</span></div>`);
            continue;
        }
        const wLv = p1.weapons[ev.weaponReq] || (ev.altWeaponReq ? p1.weapons[ev.altWeaponReq] : 0) || 0;
        const tLv = p1.trinkets[ev.trinketReq] || 0;
        if (wLv > 0 || tLv > 0) {
            const wName = WEAPONS[ev.weaponReq] ? WEAPONS[ev.weaponReq].name : ev.weaponReq;
            const tName = TRINKETS[ev.trinketReq] ? TRINKETS[ev.trinketReq].name : ev.trinketReq;
            const ready = wLv >= 5 && tLv >= 5;
            matrixRows.push(`
                <div class="stat-line">
                    <span class="lbl">${wName} (Lv.${wLv}/5) + ${tName} (Lv.${tLv}/5)</span>
                    <span class="val" style="color:${ready ? '#ffd700' : ev.color}">${ev.icon} ${ev.name} ${ready ? '★ HAZIR!' : ''}</span>
                </div>
            `);
        }
    }

    grid.innerHTML = `
        <div style="font-size:0.78rem;font-weight:800;color:${p1.c};margin-bottom:6px;display:flex;justify-content:space-between;">
            <span>◈ ${p1.name.toUpperCase()} — ${shipCfg.name}</span>
            <span style="color:#ffd700">SEVİYE ${p1.lv}</span>
        </div>
        <div style="font-size:0.62rem;color:#00f0ff;margin-bottom:4px;">⚔ AKTİF SİLAH SLOTLARI (${p1.usedWeaponSlots()}/4)</div>
        <div class="pause-loadout-grid" style="margin-bottom:8px;">${weaponCards.join('')}</div>
        <div style="font-size:0.62rem;color:#44ffaa;margin-bottom:4px;">🧲 AKTİF ALET / TRINKET SLOTLARI (${p1.usedTrinketSlots()}/4)</div>
        <div class="pause-loadout-grid" style="margin-bottom:10px;">${trinketCards.join('')}</div>

        <div style="font-size:0.64rem;font-weight:800;color:#ffd700;margin:6px 0 4px;letter-spacing:1px;">🧬 OLASI ÇAPRAZ EVRİM MATRİSİ ($X+Y=Z$)</div>
        <div style="max-height:110px;overflow-y:auto;margin-bottom:8px;padding-right:4px;">
            ${matrixRows.length > 0 ? matrixRows.join('') : '<div class="stat-line"><span class="lbl">Silah ve alet topladıkça evrim dalları burada listelenir.</span></div>'}
        </div>

        <div class="stat-line"><span class="lbl">Anlık / Ortalama DPS</span><span class="val" style="color:#ffd700">${Math.floor(currentDps)} / ${avgDps} DPS</span></div>
        <div class="stat-line"><span class="lbl">Gövde Canı / Kalkan</span><span class="val">${Math.floor(p1.hp)}/${Math.floor(p1.mh)} HP · ${Math.floor(p1.sh)}/${Math.floor(p1.ms)} SH</span></div>
        <div class="stat-line"><span class="lbl">Hasar Çarpanı & Kritik Şans</span><span class="val">x${p1.dmgMult.toFixed(2)} · %${Math.floor(p1.crit * 100)}</span></div>
        <div class="stat-line"><span class="lbl">Zırh & Cooldown Azaltma</span><span class="val">%${Math.floor(p1.armor * 100)} Zırh · -%${Math.floor((1 - p1.cdMult) * 100)} CD</span></div>
        <div class="stat-line"><span class="lbl">Kalan Reroll / Skip Hakkı</span><span class="val">${p1.rerollsLeft} Reroll · ${p1.skipsLeft} Skip</span></div>
    `;
}

// ── Dalga & Spawn Yönetimi (Her 3 Dalgada Bir Elit Mini-Boss!) ──
let p1 = null;

function startWave(w) {
    wave = w;
    waveSp = 0;
    waveTm = 0;
    waveEC = Math.floor((8 + w * 3.5) * DC.ecm);
    waveDl = Math.max(0.28, (1.25 - w * 0.03) * DC.sdm);

    const wa = document.getElementById('waveAnn');
    document.getElementById('waT').textContent = `DALGA ${wave}`;
    const mapCfg = MAPS[SELECTED_MAP] || MAPS.sector9;
    document.getElementById('waS').textContent = wave % 5 === 0
        ? '⚠️ OMEGA BOSS ALARMI!'
        : wave % 3 === 0
        ? '★ ELİT MİNİ-BOSS SAHAYA İNDİ! (%50 ŞANS SANDIĞI) ★'
        : mapCfg.name.toUpperCase();
    wa.classList.add('show');
    setTimeout(() => wa.classList.remove('show'), 2200);
    sfx.wave();

    // Her 3 dalgada bir Elit Mini-Boss iner!
    if (wave % 3 === 0) {
        const mbX = clamp(p1.x + rand(-260, 260), 90, canvas.width - 90);
        const mbY = clamp(p1.y - 220, 80, canvas.height - 80);
        const mb = new Enemy('tank', mbX, mbY, true);
        enemies.push(mb);
    }

    // Her 5 dalgada bir ana Boss (Dalga 20: Chronos Weaver, Dalga 30: Oblivion Behemoth)
    if (wave >= 5 && wave % 5 === 0) {
        const bn = wave / 5;
        let bType = ['chaser', 'bullethell', 'gravity'][(bn - 1) % 3];
        if (wave % 30 === 0) bType = 'behemoth';
        else if (wave % 20 === 0) bType = 'chronos';
        const b = new Boss(bn, canvas.width / 2, -60, bType);
        enemies.push(b);
        bossActive = b;
        document.getElementById('bossBar').classList.add('active');
        document.getElementById('bossNm').textContent = b.bossName;
    }
}

function spawnEnemy() {
    const mapCfg = MAPS[SELECTED_MAP] || MAPS.sector9;
    const pool = mapCfg.enemyPool;
    const maxIdx = Math.min(pool.length - 1, Math.floor(wave / 2) + 2);
    const type = pool[randInt(0, maxIdx)];

    const side = randInt(0, 3);
    let x = 0, y = 0;
    if (side === 0) { x = rand(40, canvas.width - 40); y = 30; }
    else if (side === 1) { x = rand(40, canvas.width - 40); y = canvas.height - 30; }
    else if (side === 2) { x = 30; y = rand(40, canvas.height - 40); }
    else { x = canvas.width - 30; y = rand(40, canvas.height - 40); }

    enemies.push(new Enemy(type, x, y, false));
    waveSp++;
}

function applyPickup(p, type) {
    if (type === 'cosmicChest') {
        openCosmicChest(p);
        return;
    }
    const decay = getCosmicDecay();
    if (type === 'heal') {
        p.hp = Math.min(p.mh, p.hp + 35 * decay);
        floatT(p.x, p.y - 25, '+35 HP', '#00ff88', 13);
    } else if (type === 'shield') {
        p.sh = p.ms;
        floatT(p.x, p.y - 25, 'KALKAN FULL!', '#bf00ff', 13);
    } else {
        p.gainXP(45);
        floatT(p.x, p.y - 25, '+45 XP', '#ffd700', 13);
    }
    sfx.pow();
}

// ── Ana Güncelleme Döngüsü (update) ──
function update(dt) {
    if (gameState === 'levelChoice') {
        updateLevelChoice(dt);
        return;
    }
    if (gameState === 'lootBox' || gameState === 'paused' || gameState === 'gameover') {
        return;
    }

    if (levelUpQueue.length > 0 && !isLevelingUp) {
        triggerLevelUpChoice(levelUpQueue.shift());
        return;
    }

    if (gameState !== 'playing') return;

    const eDt = dt * slowF;
    gameTime += eDt;

    // Anlık DPS Hesaplama
    dpsTimer += eDt;
    if (dpsTimer >= 0.5) {
        currentDps = lerp(currentDps, dpsWindowDmg / dpsTimer, 0.45);
        dpsWindowDmg = 0;
        dpsTimer = 0;
    }

    p1.update(eDt);
    if (!p1.alive) {
        endGame();
        return;
    }

    // Harita Çevresel Dinamikleri
    if (SELECTED_MAP === 'sector9') {
        for (const d of mapDebris) {
            d.a += d.va * eDt;
            d.x += d.vx * eDt;
            d.y += d.vy * eDt;
            if (d.x < 80 || d.x > canvas.width - 80) d.vx *= -1;
            if (d.y < 80 || d.y > canvas.height - 80) d.vy *= -1;
        }
    } else if (SELECTED_MAP === 'nebula') {
        for (const gc of gasClouds) {
            gc.x += gc.vx * eDt;
            gc.y += gc.vy * eDt;
            if (gc.x < 90 || gc.x > canvas.width - 90) gc.vx *= -1;
            if (gc.y < 90 || gc.y > canvas.height - 90) gc.vy *= -1;
        }
    } else if (SELECTED_MAP === 'blackhole') {
        while (lavaAsteroids.length < 4) spawnLavaAsteroid();
        for (let i = lavaAsteroids.length - 1; i >= 0; i--) {
            const la = lavaAsteroids[i];
            la.x += la.vx * eDt;
            la.y += la.vy * eDt;
            la.a += eDt * 1.2;
            if (la.x < 40 || la.x > canvas.width - 40) la.vx *= -1;
            if (la.y < 40 || la.y > canvas.height - 40) la.vy *= -1;
            if (dist(la, p1) < la.r + p1.r) {
                p1.takeDmg(24, 0.04);
                spawnExp(la.x, la.y, '#ff4400', 1.5);
                lavaAsteroids.splice(i, 1);
            }
        }
    }

    // Kara Delikler (Kozmik Süpernova & Olay Ufku)
    for (let i = blackHoles.length - 1; i >= 0; i--) {
        const bh = blackHoles[i];
        bh.life -= eDt; bh.a += eDt * 6;
        if (bh.life <= 0) { blackHoles.splice(i, 1); continue; }
        for (const e of enemies) {
            if (!e.alive) continue;
            const d = dist(bh, e);
            if (d < bh.r && d > 4) {
                const pa = ang(e, bh);
                e.x += Math.cos(pa) * 190 * eDt;
                e.y += Math.sin(pa) * 190 * eDt;
                e.takeDmg(bh.dps * eDt, false, true);
            }
        }
    }

    // Chronos Weaver Zaman Yarıkları
    for (let i = gravityRifts.length - 1; i >= 0; i--) {
        const rf = gravityRifts[i];
        rf.life -= eDt; rf.a -= eDt * 4;
        if (rf.life <= 0) { gravityRifts.splice(i, 1); continue; }
        if (dist(rf, p1) < rf.r) {
            const pushA = ang(rf, p1);
            p1.x = clamp(p1.x + Math.cos(pushA) * 180 * eDt - p1.vx * 1.3 * eDt, 36, canvas.width - 36);
            p1.y = clamp(p1.y + Math.sin(pushA) * 180 * eDt - p1.vy * 1.3 * eDt, 36, canvas.height - 36);
        }
    }

    // Lazer & Alev İzleri
    for (let i = laserTrails.length - 1; i >= 0; i--) {
        const lt = laserTrails[i];
        lt.l -= eDt;
        if (lt.l <= 0) { laserTrails.splice(i, 1); continue; }
        for (const e of enemies) {
            if (e.alive && Math.hypot(e.x - lt.x, e.y - lt.y) < e.r + 18) {
                e.takeDmg(42 * p1.dmgMult * eDt, false, true);
            }
        }
    }

    if (comboTm > 0) {
        comboTm -= eDt;
        if (comboTm <= 0) { comboC = 0; comboM = 1; }
    }

    waveTm += eDt;
    if (waveSp < waveEC && waveTm >= waveDl) {
        waveTm = 0;
        spawnEnemy();
    }
    if (waveSp >= waveEC && enemies.every(e => !e.alive)) {
        startWave(wave + 1);
    }

    // Oyuncu Mermileri
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        if (b.homing) {
            const tgt = p1.findNearestEnemy(500);
            if (tgt) {
                const ta = ang(b, tgt);
                const sp = Math.hypot(b.vx, b.vy);
                b.vx = lerp(b.vx, Math.cos(ta) * sp, 0.12);
                b.vy = lerp(b.vy, Math.sin(ta) * sp, 0.12);
            }
        }
        b.x += b.vx * eDt;
        b.y += b.vy * eDt;
        b.life -= eDt;
        if (b.life <= 0 || b.x < -40 || b.x > canvas.width + 40 || b.y < -40 || b.y > canvas.height + 40) {
            bullets.splice(i, 1);
            continue;
        }

        let removeBullet = false;
        for (let j = 0; j < enemies.length; j++) {
            const e = enemies[j];
            if (!e.alive) continue;
            if (b.hitIds && b.hitIds.includes(e.eid)) continue;

            const rad = e.r + b.size;
            const dx = b.x - e.x, dy = b.y - e.y;
            if (dx * dx + dy * dy < rad * rad) {
                const impactAngle = Math.atan2(dy, dx);
                const dealt = e.takeDmg(b.damage, b.crit, false, impactAngle);
                spawnP(b.x, b.y, b.color, 3, 160, 0.2, 2, 'spark');
                sfx.hit();

                if (dealt !== false) {
                    if (b.leech) p1.healLeech(b.damage * 0.10);
                    if (b.splash) {
                        particles.push(new Particle(b.x, b.y, 0, 0, b.color, 0.22, 52, 'shockwave'));
                        for (const ne of enemies) {
                            if (ne !== e && ne.alive && dist(b, ne) < 55 + ne.r) {
                                ne.takeDmg(b.damage * 0.38, false, true);
                            }
                        }
                    }
                    if (b.spawnBlackHole && b.crit && p1.blackHoleCd <= 0 && blackHoles.length < 3) {
                        p1.blackHoleCd = 1.1;
                        blackHoles.push({ x: e.x, y: e.y, r: 160, life: 2.2, maxLife: 2.2, dps: 68 * p1.dmgMult, a: 0, dmgT: 0 });
                    }
                    if (b.arbiterBoost) {
                        e.slowT = 1.5;
                        b.damage *= 1.25;
                    }
                }

                // Sekme (Ricochet)
                if (b.bounces && b.bounces > 0) {
                    b.bounces--;
                    if (!b.hitIds) b.hitIds = [];
                    b.hitIds.push(e.eid);
                    let nextT = null, bestD = 280;
                    for (const ce of enemies) {
                        if (!ce.alive || ce === e || (b.hitIds && b.hitIds.includes(ce.eid))) continue;
                        const cd = dist(e, ce);
                        if (cd < bestD) { bestD = cd; nextT = ce; }
                    }
                    if (nextT) {
                        const ra = ang(b, nextT);
                        const sp = Math.hypot(b.vx, b.vy);
                        b.vx = Math.cos(ra) * sp;
                        b.vy = Math.sin(ra) * sp;
                        b.life = Math.max(b.life, 0.5);
                        break;
                    }
                }

                if (b.piercing && b.pierceLeft > 1) {
                    b.pierceLeft--;
                    if (!b.hitIds) b.hitIds = [];
                    b.hitIds.push(e.eid);
                } else {
                    removeBullet = true;
                    break;
                }
            }
        }
        if (removeBullet) bullets.splice(i, 1);
    }

    // Düşman Mermileri
    for (let i = eBullets.length - 1; i >= 0; i--) {
        const b = eBullets[i];
        b.x += b.vx * eDt;
        b.y += b.vy * eDt;
        b.life -= eDt;
        if (b.life <= 0 || b.x < -40 || b.x > canvas.width + 40 || b.y < -40 || b.y > canvas.height + 40) {
            eBullets.splice(i, 1);
            continue;
        }
        if (dist(b, p1) < p1.r + b.size) {
            p1.takeDmg(b.damage, b.truePct || 0);
            eBullets.splice(i, 1);
        }
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].update(eDt);
        if (!enemies[i].alive) enemies.splice(i, 1);
    }

    for (let i = pickups.length - 1; i >= 0; i--) {
        const pu = pickups[i];
        pu.life -= eDt; pu.aA += eDt * 3.5;
        if (pu.life <= 0) { pickups.splice(i, 1); continue; }
        if (dist(pu, p1) < pu.r + p1.r + 10) {
            const pType = pu.type;
            pickups.splice(i, 1);
            applyPickup(p1, pType);
            if (gameState !== 'playing') break;
        }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        if (!particles[i].update(eDt)) particles.splice(i, 1);
    }
    const maxParticles = perfMode ? 140 : 320;
    if (particles.length > maxParticles) {
        particles.splice(0, particles.length - maxParticles);
    }
    if (laserTrails.length > 160) {
        laserTrails.splice(0, laserTrails.length - 160);
    }
    for (let i = floats.length - 1; i >= 0; i--) {
        const f = floats[i];
        f.y += f.vy * eDt;
        f.l -= eDt;
        if (f.l <= 0) floats.splice(i, 1);
    }
    if (floats.length > 60) {
        floats.splice(0, floats.length - 60);
    }

    shakeI *= 0.88;
    if (shakeI < 0.4) shakeI = 0;

    updateHUD();
}

function updateHUD() {
    if (!p1) return;
    document.getElementById('p1Hp').style.width = `${clamp((p1.hp / p1.mh) * 100, 0, 100)}%`;
    document.getElementById('p1Sh').style.width = `${clamp((p1.sh / p1.ms) * 100, 0, 100)}%`;
    document.getElementById('p1Xp').style.width = `${clamp((p1.xp / p1.xpN) * 100, 0, 100)}%`;
    document.getElementById('p1HpTxt').textContent = `${Math.ceil(p1.hp)}/${Math.floor(p1.mh)}`;
    document.getElementById('p1ShTxt').textContent = `${Math.ceil(p1.sh)}/${Math.floor(p1.ms)}`;
    document.getElementById('p1DpsTxt').textContent = `${Math.floor(currentDps)} DPS`;
    document.getElementById('p1Lv').textContent = `Lv.${p1.lv}`;

    const cfg = SHIPS[p1.shipClass] || SHIPS.interceptor;
    const abBox = document.getElementById('p1Ab');
    const abLbl = document.getElementById('p1AbLbl');
    const abFill = document.getElementById('p1AbFill');
    const ready = p1.abCd <= 0;
    const pct = ready ? 100 : clamp((1 - p1.abCd / p1.abMax) * 100, 0, 100);
    abBox.style.setProperty('--ab', cfg.abilityColor);
    abBox.classList.toggle('ready', ready);
    abLbl.textContent = ready ? `✦ ${cfg.abilityName} [SPACE] HAZIR` : `${cfg.abilityName} (${p1.abCd.toFixed(1)}s)`;
    abFill.style.width = `${pct}%`;
    abFill.style.background = cfg.abilityColor;

    document.getElementById('hudSc').textContent = Math.floor(score).toLocaleString();
    document.getElementById('hudWv').textContent = `DALGA ${wave}`;
    const m = Math.floor(gameTime / 60).toString().padStart(2, '0');
    const s = Math.floor(gameTime % 60).toString().padStart(2, '0');
    document.getElementById('hudTm').textContent = `${m}:${s}`;

    const cEl = document.getElementById('hudCo');
    if (comboM > 1) {
        cEl.classList.add('active');
        cEl.textContent = `COMBO x${comboM.toFixed(2)}`;
    } else {
        cEl.classList.remove('active');
    }

    const radEl = document.getElementById('hudRad');
    if (radEl) {
        if (wave >= 25) {
            radEl.style.display = 'block';
            radEl.textContent = `☢ KOZMİK ÇÜRÜME: -%${Math.round((1 - getCosmicDecay()) * 100)}`;
        } else {
            radEl.style.display = 'none';
        }
    }

    if (bossActive && bossActive.alive) {
        document.getElementById('bossHp').style.width = `${clamp((bossActive.hp / bossActive.maxHp) * 100, 0, 100)}%`;
    }
}

// ── Çizim Döngüsü (draw) ──
function draw() {
    const mapCfg = MAPS[SELECTED_MAP] || MAPS.sector9;
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, mapCfg.bgTop);
    grad.addColorStop(1, mapCfg.bgBot);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    if (shakeI > 0) ctx.translate(rand(-shakeI, shakeI), rand(-shakeI, shakeI));

    // Taktiksel Arena Izgarası & Sınır Çerçevesi
    ctx.strokeStyle = mapCfg.gridColor;
    ctx.lineWidth = 1;
    const step = 70;
    for (let x = 0; x < canvas.width; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Sınırlı Arena Duvar Çizgisi
    ctx.strokeStyle = mapCfg.borderColor + '55';
    ctx.lineWidth = 2;
    ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);

    // Harita 1: Dönen Hurda Metaller
    if (SELECTED_MAP === 'sector9') {
        for (const d of mapDebris) {
            ctx.save();
            ctx.translate(d.x, d.y);
            ctx.rotate(d.a);
            ctx.strokeStyle = '#5588aa';
            ctx.fillStyle = 'rgba(30, 50, 75, 0.45)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let i = 0; i < d.sides; i++) {
                const a = (i / d.sides) * Math.PI * 2;
                ctx[i === 0 ? 'moveTo' : 'lineTo'](Math.cos(a) * d.r, Math.sin(a) * d.r);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }
    }

    // Harita 2: Kuantum Nebulası Gaz Bulutları
    if (SELECTED_MAP === 'nebula') {
        for (const gc of gasClouds) {
            ctx.save();
            const g = ctx.createRadialGradient(gc.x, gc.y, 10, gc.x, gc.y, gc.r);
            g.addColorStop(0, gc.color + '30');
            g.addColorStop(1, gc.color + '00');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(gc.x, gc.y, gc.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = gc.color + '55';
            ctx.setLineDash([6, 6]);
            ctx.beginPath();
            ctx.arc(gc.x, gc.y, gc.r * 0.85, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
        }
    }

    // Harita 3: Merkez Kara Delik Anomalisi & Lav Asteroidleri
    if (SELECTED_MAP === 'blackhole') {
        const cx = canvas.width / 2, cy = canvas.height / 2;
        ctx.save();
        const g = ctx.createRadialGradient(cx, cy, 8, cx, cy, 175);
        g.addColorStop(0, '#000000');
        g.addColorStop(0.35, 'rgba(255, 68, 0, 0.35)');
        g.addColorStop(1, 'rgba(255, 68, 0, 0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(cx, cy, 175, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#ff5500';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx, cy, 28, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();

        for (const la of lavaAsteroids) {
            ctx.save();
            ctx.translate(la.x, la.y);
            ctx.rotate(la.a);
            ctx.fillStyle = 'rgba(255, 68, 0, 0.45)';
            ctx.strokeStyle = '#ff8800';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, la.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }
    }

    // Kara Delikler & Zaman Yarıkları
    for (const bh of blackHoles) {
        ctx.save();
        ctx.strokeStyle = '#bf00ff';
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(bh.x, bh.y, bh.r * 0.5, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
    }
    for (const rf of gravityRifts) {
        ctx.save();
        ctx.strokeStyle = '#00ffcc';
        ctx.setLineDash([8, 6]);
        ctx.beginPath(); ctx.arc(rf.x, rf.y, rf.r, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
    }

    // Lazer & Alev İzleri
    for (const lt of laserTrails) {
        ctx.save();
        ctx.globalAlpha = clamp(lt.l, 0, 1) * 0.65;
        ctx.fillStyle = lt.c;
        ctx.beginPath(); ctx.arc(lt.x, lt.y, 10, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }

    // Pickups & Kozmik Şans Sandığı
    for (const pu of pickups) {
        ctx.save();
        ctx.translate(pu.x, pu.y);
        if (pu.type === 'cosmicChest') {
            ctx.strokeStyle = '#ffd700';
            ctx.fillStyle = 'rgba(255, 215, 0, 0.25)';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.roundRect(-14, -11, 28, 22, 5);
            ctx.fill();
            ctx.stroke();
            ctx.font = '16px Orbitron';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🎁', 0, 0);
        } else {
            ctx.fillStyle = pu.type === 'heal' ? '#00ff88' : pu.type === 'shield' ? '#bf00ff' : '#ffd700';
            ctx.beginPath(); ctx.arc(0, 0, pu.r, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    }

    // Mermiler
    for (const b of bullets) {
        ctx.fillStyle = b.color;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2); ctx.fill();
    }
    for (const b of eBullets) {
        ctx.fillStyle = b.color;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2); ctx.fill();
    }

    // Düşmanlar ve Pilot
    for (const e of enemies) e.draw(ctx);
    if (p1) p1.draw(ctx);
    for (const pt of particles) pt.draw(ctx);

    // Yüzen Metinler
    for (const f of floats) {
        ctx.save();
        ctx.globalAlpha = clamp(f.l / f.ml, 0, 1);
        ctx.font = `bold ${f.sz}px Orbitron`;
        ctx.fillStyle = f.c;
        ctx.textAlign = 'center';
        ctx.fillText(f.txt, f.x, f.y);
        ctx.restore();
    }

    ctx.restore();
}

// ── Kurulum, Duraklatma ve Oyun Sonu ──
function initGame() {
    p1 = new Player(1, canvas.width / 2, canvas.height / 2, SELECTED_SHIP);
    bullets.length = 0; eBullets.length = 0; enemies.length = 0; pickups.length = 0;
    particles.length = 0; floats.length = 0; laserTrails.length = 0;
    blackHoles.length = 0; gravityRifts.length = 0;
    levelUpQueue = []; levelUpActiveChoices = [];
    isLevelingUp = false; window.isLevelingUp = false;

    score = 0; wave = 1; comboC = 0; comboTm = 0; comboM = 1; gameTime = 0; totalKills = 0;
    dpsWindowDmg = 0; currentDps = 0; totalDamageDealt = 0; bossActive = null;

    const shipCfg = SHIPS[p1.shipClass] || SHIPS.interceptor;
    const mapCfg = MAPS[SELECTED_MAP] || MAPS.sector9;
    document.getElementById('p1NameLabel').textContent = `◈ ${p1.name.toUpperCase()} (${shipCfg.name.split(' ')[0]})`;
    document.getElementById('hudMapName').textContent = `📍 ${mapCfg.name.toUpperCase()}`;

    initMapEnvironment();
    updateUpgDisplay();
    startWave(1);
    setCursorMode(false);
}

function startGame() {
    gameState = 'playing';
    initGame();
    document.getElementById('gameOverOv').classList.add('hidden');
    document.getElementById('pauseOv').classList.add('hidden');
    document.getElementById('levelUpOv').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    const df = document.getElementById('hudDf');
    df.textContent = DC.label;
    df.className = 'hud-df ' + DC.cls;
    eA();
    setSoundMuffled(false);
    document.body.classList.add('playing-mode');
}

function togglePause() {
    if (gameState === 'playing') {
        gameState = 'paused';
        updatePauseStatsUI();
        document.getElementById('pauseOv').classList.remove('hidden');
        setCursorMode(true);
        setSoundMuffled(true);
        document.body.classList.remove('playing-mode');
    } else if (gameState === 'paused') {
        gameState = 'playing';
        document.getElementById('pauseOv').classList.add('hidden');
        setCursorMode(false);
        setSoundMuffled(false);
        document.body.classList.add('playing-mode');
    }
}

function endGame() {
    gameState = 'gameover';
    setCursorMode(true);
    document.body.classList.remove('playing-mode');
    if (typeof CosmicLeaderboard !== 'undefined') {
        CosmicLeaderboard.submitScore(P1_NAME, Math.floor(score), wave, gameTime, DIFFKEY, '1p');
    }
    document.getElementById('hud').classList.add('hidden');
    document.getElementById('gameOverOv').classList.remove('hidden');
    document.getElementById('goSc').textContent = Math.floor(score).toLocaleString();
    document.getElementById('goWv').textContent = wave;
    document.getElementById('goKl').textContent = totalKills;
    document.getElementById('goMap').textContent = (MAPS[SELECTED_MAP] || MAPS.sector9).name;
    const m = Math.floor(gameTime / 60), s = Math.floor(gameTime % 60);
    document.getElementById('goTm').textContent = `${m}:${s.toString().padStart(2, '0')}`;

    const sum = document.getElementById('goUsum');
    let html = '<div class="go-ul">';
    for (const sk of Object.keys(p1.superEvolutions)) {
        const d = SUPER_EVOLUTIONS[sk];
        html += `<div class="go-uc" style="color:${d.color};border-color:${d.color}">👑 ${d.icon} ${d.name}</div>`;
    }
    for (const ek of Object.keys(p1.evolutions)) {
        const d = EVOLUTIONS[ek];
        html += `<div class="go-uc" style="color:${d.color};border-color:${d.color}">⚡ ${d.icon} ${d.name}</div>`;
    }
    for (const [k, v] of Object.entries(p1.pU)) {
        const d = UPG[k];
        if (d) html += `<div class="go-uc" style="color:${d.color}">${d.icon} ${d.name} Lv.${v}</div>`;
    }
    html += '</div>';
    sum.innerHTML = html;
}

// ── Klavye ve Buton Dinleyicileri ──
window.addEventListener('keydown', e => {
    eA();
    if (e.code === 'Escape') {
        if (gameState === 'playing' || gameState === 'paused') togglePause();
        return;
    }
    if (gameState === 'lootBox' && (e.code === 'Space' || e.code === 'Enter')) {
        e.preventDefault();
        closeCosmicChest();
        return;
    }
    if (gameState === 'levelChoice') {
        // Sadece isLevelingUp aktifken klavye girdisini kabul et
        if (!isLevelingUp) return;
        if (e.code === 'KeyR') { e.preventDefault(); rerollLevelUpChoices(); return; }
        if (e.code === 'KeyX') { e.preventDefault(); skipLevelUpChoice(); return; }
        keys[e.code] = true;
        return;
    }
    keys[e.code] = true;
    if ((e.code === 'Space' || e.code === 'Enter') && gameState === 'playing' && p1) {
        e.preventDefault();
        p1.activate();
    }
});

window.addEventListener('keyup', e => {
    delete keys[e.code];
});

// UI Buton Bağlantıları
document.getElementById('luRerollBtn')?.addEventListener('click', () => rerollLevelUpChoices());
document.getElementById('luSkipBtn')?.addEventListener('click', () => skipLevelUpChoice());
document.getElementById('lootBoxClaimBtn')?.addEventListener('click', () => closeCosmicChest());
document.getElementById('resumeBtn')?.addEventListener('click', () => togglePause());
document.getElementById('resumeGameBtn')?.addEventListener('click', () => togglePause());
document.getElementById('restartGameBtn')?.addEventListener('click', () => startGame());
document.getElementById('retryBtn')?.addEventListener('click', () => startGame());
document.getElementById('quitBtn')?.addEventListener('click', () => { window.location.href = 'index.html'; });
document.getElementById('menuBtn')?.addEventListener('click', () => { window.location.href = 'index.html'; });
document.getElementById('mobilePauseBtn')?.addEventListener('click', () => togglePause());
document.getElementById('mobileAbilityBtn')?.addEventListener('click', () => { if (p1) p1.activate(); });

document.getElementById('sfxVolumeRange')?.addEventListener('input', e => {
    sfxVol = Number(e.target.value) / 100;
    document.getElementById('sfxVolumeVal').textContent = `${e.target.value}%`;
});
document.getElementById('synthSoundToggle')?.addEventListener('click', e => {
    synthSoundOn = !synthSoundOn;
    e.target.textContent = synthSoundOn ? 'AÇIK' : 'KAPALI';
    e.target.classList.toggle('on', synthSoundOn);
});
document.getElementById('perfModeToggle')?.addEventListener('click', e => {
    perfMode = !perfMode;
    e.target.textContent = perfMode ? 'AÇIK' : 'KAPALI';
    e.target.classList.toggle('on', perfMode);
});
document.getElementById('fullscreenToggle')?.addEventListener('click', e => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.();
        e.target.textContent = 'AÇIK';
        e.target.classList.add('on');
    } else {
        document.exitFullscreen?.();
        e.target.textContent = 'KAPALI';
        e.target.classList.remove('on');
    }
});

// Ana Oyun Döngüsü
let lastT = performance.now();
function loop(now) {
    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;
    update(dt);
    draw();
    requestAnimationFrame(loop);
}

startGame();
requestAnimationFrame(loop);
